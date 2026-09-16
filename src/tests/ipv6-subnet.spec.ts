import { test, expect } from "@playwright/test";

test.describe("IPv4 and IPv6 Preset Toolbars & Subnet Features", () => {
  test("IPv4 to IPv6 Switcher Toolbar & Header Adaptation", async ({
    page,
  }) => {
    await page.goto("/");

    // Default is IPv4
    await expect(page.locator("#btn_ipv4")).toHaveClass(/active/);
    await expect(page.locator("#btn_ipv4")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.locator("#network")).toHaveValue("10.0.0.0");
    await expect(page.locator("#netsize")).toHaveValue("16");
    await expect(page.locator("#ipv4_tier_info")).toBeVisible();
    await expect(page.locator("#ipv6_tier_info")).toBeHidden();
    await expect(page.locator("#calc")).not.toHaveClass(/ipv6-mode/);
    await expect(page.locator("#useableHeader")).toContainText("Usable IPs");

    // Click IPv6 switcher
    await page.locator("#btn_ipv6").click();

    // Verify UI updates for IPv6 mode
    await expect(page.locator("#btn_ipv6")).toHaveClass(/active/);
    await expect(page.locator("#btn_ipv6")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.locator("#btn_ipv4")).not.toHaveClass(/active/);
    await expect(page.locator("#btn_ipv4")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(page.locator("#network")).toHaveValue("2001:db8::");
    await expect(page.locator("#netsize")).toHaveValue("32");
    await expect(page.locator("#ipv6_tier_info")).toBeVisible();
    await expect(page.locator("#ipv4_tier_info")).toBeHidden();
    await expect(page.locator("#calc")).toHaveClass(/ipv6-mode/);

    // Verify IPv6 table headers
    await expect(page.locator("#rangeHeader")).toContainText("Subnet Range");
    await expect(page.locator("#useableHeader")).toContainText(
      "Subnet / Interface ID",
    );
    await expect(page.locator("#hostsHeader")).toContainText("Subnet Capacity");

    // Verify initial row
    const initialRow = page.locator("#calcbody tr").first();
    await expect(initialRow).toContainText("2001:db8::/32");
    await expect(initialRow).toContainText("65.5K × /48 (4.29B × /64)");
  });

  test("IPv4 Preset Toolbar buttons (/16 to /32) and input sync", async ({
    page,
  }) => {
    await page.goto("/");

    // Verify all 17 IPv4 preset buttons are rendered
    for (let prefix = 16; prefix <= 32; prefix++) {
      await expect(
        page.locator(`.ipv4-preset-btn[data-prefix="${prefix}"]`),
      ).toBeVisible();
    }

    // Default /16 is active
    await expect(
      page.locator('.ipv4-preset-btn[data-prefix="16"]'),
    ).toHaveClass(/active/);

    // Click /24 preset
    await page.locator('.ipv4-preset-btn[data-prefix="24"]').click();
    await expect(page.locator("#netsize")).toHaveValue("24");
    await expect(
      page.locator('.ipv4-preset-btn[data-prefix="24"]'),
    ).toHaveClass(/active/);
    await expect(
      page.locator('.ipv4-preset-btn[data-prefix="16"]'),
    ).not.toHaveClass(/active/);
    const row24 = page.locator("#calcbody tr").first();
    await expect(row24).toContainText("10.0.0.0/24");
    await expect(row24).toContainText("10.0.0.1 - 10.0.0.254");
    await expect(row24).toContainText("254");

    // Type into netsize input and verify active preset sync
    await page.locator("#netsize").fill("28");
    await expect(
      page.locator('.ipv4-preset-btn[data-prefix="28"]'),
    ).toHaveClass(/active/);
    await expect(
      page.locator('.ipv4-preset-btn[data-prefix="24"]'),
    ).not.toHaveClass(/active/);
  });

  test("IPv6 Hierarchical Tier Splitting (/48 -> /56 -> /60 -> /64)", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#btn_ipv6").click();

    // Start with /56 base for quick and clean verification
    await page.locator('.ipv6-preset-btn[data-prefix="56"]').click();

    // Initial /56 row
    const row56 = page.locator("#calcbody tr").first();
    await expect(row56).toContainText("2001:db8::/56");
    await expect(row56).toContainText("16 × /60 (256 × /64)");

    // Split /56 -> creates 16 x /60 subnets
    const splitBtn56 = row56.locator("td.split");
    await expect(splitBtn56).toContainText("/56");
    await splitBtn56.click();

    // Verify first child /60 row
    const row60 = page.locator("#calcbody tr").first();
    await expect(row60).toContainText("2001:db8::/60");
    await expect(row60).toContainText("16 × /64 subnets");

    // Split /60 -> creates 16 x /64 subnets
    const splitBtn60 = row60.locator("td.split");
    await expect(splitBtn60).toContainText("/60");
    await splitBtn60.click();

    // Verify first child /64 row (Standard SLAAC leaf prefix)
    const row64 = page.locator("#calcbody tr").first();
    await expect(row64).toContainText("2001:db8::/64");
    await expect(row64).toContainText("18.4Q IPs (SLAAC)");
    await expect(row64.locator("td.split")).toHaveClass(/split-disabled/);
    await expect(row64.locator("td.split")).toContainText("/64 (Leaf)");

    // Clicking split on /64 triggers educational SLAAC RFC 7421 warning modal
    await row64.locator("td.split").click();
    await expect(page.locator("#notifyModal")).toBeVisible();
    await expect(page.locator("#notifyModalLabel")).toContainText("Warning!");
    await expect(page.locator("#notifyModalDescription")).toContainText(
      "RFC 7421",
    );
    await page.locator('#notifyModal button[data-bs-dismiss="modal"]').click();
  });

  test("Direct input of user tiers /32, /48, /60, /64", async ({ page }) => {
    await page.goto("/");
    await page.locator("#btn_ipv6").click();

    // Test starting at /60
    await page.locator("#netsize").fill("60");
    await page.locator("#btn_go").click();
    const row60 = page.locator("#calcbody tr").first();
    await expect(row60).toContainText("2001:db8::/60");
    await expect(row60).toContainText("16 × /64 subnets");

    // Test starting directly at /64
    await page.locator("#netsize").fill("64");
    await page.locator("#btn_go").click();
    const row64 = page.locator("#calcbody tr").first();
    await expect(row64).toContainText("2001:db8::/64");
    await expect(row64).toContainText("18.4Q IPs (SLAAC)");
    await expect(row64.locator("td.split")).toHaveClass(/split-disabled/);
  });

  test("Switching from IPv6 back to IPv4 restores IPv4 state cleanly", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#btn_ipv6").click();
    await expect(page.locator("#network")).toHaveValue("2001:db8::");

    // Switch back to IPv4
    await page.locator("#btn_ipv4").click();
    await expect(page.locator("#btn_ipv4")).toHaveClass(/active/);
    await expect(page.locator("#network")).toHaveValue("10.0.0.0");
    await expect(page.locator("#netsize")).toHaveValue("16");
    await expect(page.locator("#calc")).not.toHaveClass(/ipv6-mode/);
    await expect(page.locator("#useableHeader")).toContainText("Usable IPs");
    const rowIpv4 = page.locator("#calcbody tr").first();
    await expect(rowIpv4).toContainText("10.0.0.0/16");
    await expect(page.locator("#ipv4_tier_info")).toBeVisible();
    await expect(page.locator("#ipv6_tier_info")).toBeHidden();
  });

  test("IPv6 Preset Toolbar buttons (/32, /48, /56, /60, /64, /80, /96, /112, /120, /124, /127, /128) and input sync", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#btn_ipv6").click();

    // Verify all 12 preset buttons are rendered
    const presets = [
      "32",
      "48",
      "56",
      "60",
      "64",
      "80",
      "96",
      "112",
      "120",
      "124",
      "127",
      "128",
    ];
    for (const p of presets) {
      await expect(
        page.locator(`.ipv6-preset-btn[data-prefix="${p}"]`),
      ).toBeVisible();
    }

    // Default /32 is active
    await expect(
      page.locator('.ipv6-preset-btn[data-prefix="32"]'),
    ).toHaveClass(/active/);

    // Click /48
    await page.locator('.ipv6-preset-btn[data-prefix="48"]').click();
    await expect(page.locator("#netsize")).toHaveValue("48");
    await expect(
      page.locator('.ipv6-preset-btn[data-prefix="48"]'),
    ).toHaveClass(/active/);
    await expect(page.locator("#calcbody tr").first()).toContainText(
      "2001:db8::/48",
    );
    await expect(page.locator("#calcbody tr").first()).toContainText(
      "256 × /56 (65.5K × /64)",
    );

    // Click /80
    await page.locator('.ipv6-preset-btn[data-prefix="80"]').click();
    await expect(page.locator("#netsize")).toHaveValue("80");
    await expect(
      page.locator('.ipv6-preset-btn[data-prefix="80"]'),
    ).toHaveClass(/active/);
    await expect(page.locator("#calcbody tr").first()).toContainText(
      "281.5T IPs (/80)",
    );

    // Click /112
    await page.locator('.ipv6-preset-btn[data-prefix="112"]').click();
    await expect(page.locator("#netsize")).toHaveValue("112");
    await expect(
      page.locator('.ipv6-preset-btn[data-prefix="112"]'),
    ).toHaveClass(/active/);
    await expect(page.locator("#calcbody tr").first()).toContainText(
      "65.5K IPs (/112)",
    );

    // Split /112 -> creates /120 subnets
    const row112 = page.locator("#calcbody tr").first();
    await row112.locator("td.split").click();
    await expect(page.locator("#calcbody tr").first()).toContainText(
      "2001:db8::/120",
    );

    // Click /127 (RFC 6164 point-to-point)
    await page.locator('.ipv6-preset-btn[data-prefix="127"]').click();
    await expect(page.locator("#netsize")).toHaveValue("127");
    await expect(
      page.locator('.ipv6-preset-btn[data-prefix="127"]'),
    ).toHaveClass(/active/);
    const row127 = page.locator("#calcbody tr").first();
    await expect(row127).toContainText("2001:db8::/127");
    await expect(row127).toContainText("2001:db8:: - 2001:db8::1");
    await expect(row127).toContainText("2 IPs (Point-to-Point, RFC 6164)");
    await expect(row127.locator("td.split")).not.toHaveClass(/split-disabled/);

    // Click /128 (Host / Loopback)
    await page.locator('.ipv6-preset-btn[data-prefix="128"]').click();
    await expect(page.locator("#netsize")).toHaveValue("128");
    await expect(
      page.locator('.ipv6-preset-btn[data-prefix="128"]'),
    ).toHaveClass(/active/);
    const row128 = page.locator("#calcbody tr").first();
    await expect(row128).toContainText("2001:db8::/128");
    await expect(row128).toContainText("1 IP (Host / Loopback)");
    await expect(row128.locator("td.split")).toHaveClass(/split-disabled/);
    await expect(row128.locator("td.split")).toContainText("/128 (Leaf)");

    // Type into netsize input and verify active preset sync
    await page.locator("#netsize").fill("56");
    await expect(
      page.locator('.ipv6-preset-btn[data-prefix="56"]'),
    ).toHaveClass(/active/);
    await expect(
      page.locator('.ipv6-preset-btn[data-prefix="128"]'),
    ).not.toHaveClass(/active/);
  });

  test("Splitting /127 generates two /128 rows and blocks /128 split", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#btn_ipv6").click();

    // Select /127
    await page.locator('.ipv6-preset-btn[data-prefix="127"]').click();
    const row127 = page.locator("#calcbody tr").first();
    await expect(row127).toContainText("2001:db8::/127");

    // Split /127 -> creates two /128 subnets
    await row127.locator("td.split").click();
    const rows = page.locator("#calcbody tr");
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText("2001:db8::/128");
    await expect(rows.nth(1)).toContainText("2001:db8::1/128");

    // Clicking /128 split opens Host boundary warning
    await rows.nth(0).locator("td.split").click();
    await expect(page.locator("#notifyModal")).toBeVisible();
    await expect(page.locator("#notifyModalLabel")).toContainText("Warning!");
    await expect(page.locator("#notifyModalDescription")).toContainText(
      "Host / Loopback Boundary",
    );
    await page.locator('#notifyModal button[data-bs-dismiss="modal"]').click();
  });
});
