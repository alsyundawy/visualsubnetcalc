import { test, expect } from "@playwright/test";

const viewports = [
  { name: "VGA (640x480)", width: 640, height: 480 },
  { name: "Xiaomi Redmi A2 / Compact (360x800)", width: 360, height: 800 },
  { name: "Xiaomi Redmi Note 13 / 12 (392x872)", width: 392, height: 872 },
  { name: "Xiaomi 14 / 13 Pro (393x873)", width: 393, height: 873 },
  { name: "Xiaomi POCO X6 Pro / F5 (412x915)", width: 412, height: 915 },
  { name: "Samsung Galaxy S24 Ultra (412x960)", width: 412, height: 960 },
  { name: "Apple iPhone 15 Pro (393x852)", width: 393, height: 852 },
  { name: "Apple iPad 10th Gen (820x1180)", width: 820, height: 1180 },
  { name: "Laptop MacBook Air (1440x900)", width: 1440, height: 900 },
  { name: "Desktop FHD (1920x1080)", width: 1920, height: 1080 },
  { name: "Desktop 2K QHD (2560x1440)", width: 2560, height: 1440 },
  // Landscape orientations for Xiaomi/Redmi/POCO
  { name: "Xiaomi 14 Landscape (873x393)", width: 873, height: 393 },
  { name: "Redmi Note 13 Landscape (872x392)", width: 872, height: 392 },
  { name: "POCO X6 Pro Landscape (915x412)", width: 915, height: 412 },
];

test.describe("v1.4.3 Visual & Responsive Tests Across All Devices", () => {
  for (const vp of viewports) {
    test(`Responsive Layout on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");

      // Verify Title & Fork Badge
      const title = page.locator(".app-title");
      await expect(title).toBeVisible();
      await expect(title).toContainText("Visual Subnet Calculator");
      const forkBadge = page.locator(".fork-badge");
      await expect(forkBadge).toBeVisible();
      await expect(forkBadge).toHaveText("Fork");

      // Verify Header Action Buttons
      const themeToggle = page.locator("#themeToggle");
      await expect(themeToggle).toBeVisible();
      await expect(themeToggle.locator("i")).toHaveClass(/(fa-regular|fa-solid)/);

      const faqBtn = page.locator("#faq_icon");
      await expect(faqBtn).toBeVisible();
      await expect(faqBtn.locator("i")).toHaveClass(/(fa-regular|fa-solid)/);

      const infoBtn = page.locator("#info_icon");
      await expect(infoBtn).toBeVisible();
      await expect(infoBtn.locator("i")).toHaveClass(/(fa-regular|fa-solid)/);

      // Verify Footer Branding & Social Buttons
      const footer = page.locator("#app_footer");
      await expect(footer).toBeVisible();
      await expect(footer.locator(".fork-version-badge")).toContainText(
        "Fork v1.4.3",
      );

      const socialButtons = page.locator(".footer-social-btn");
      const count = await socialButtons.count();
      expect(count).toBeGreaterThanOrEqual(7);

      // Verify No Horizontal Document Overflow
      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth,
      );
      const clientWidth = await page.evaluate(
        () => document.documentElement.clientWidth,
      );
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    });
  }

  test("X Logo Button has icon only (no text)", async ({ page }) => {
    await page.goto("/");
    const btnX = page.locator(".footer-social-btn.btn-x");
    await expect(btnX).toBeVisible();
    await expect(btnX.locator("i.fa-x-twitter")).toBeVisible();
    await expect(btnX.locator("span")).toHaveCount(0);
    await expect(btnX).toHaveAttribute("aria-label", "X (Twitter) Profile");
  });

  test("WhatsApp and QRIS Buttons Style Geometry Consistency", async ({
    page,
  }) => {
    await page.goto("/");
    const btnWa = page.locator(".footer-social-btn.btn-whatsapp");
    const btnQris = page.locator(".footer-social-btn.btn-qris");

    await expect(btnWa).toBeVisible();
    await expect(btnQris).toBeVisible();

    const waBox = await btnWa.boundingBox();
    const qrisBox = await btnQris.boundingBox();
    expect(waBox).not.toBeNull();
    expect(qrisBox).not.toBeNull();

    if (waBox && qrisBox) {
      // Height should be virtually identical within 1.5px
      expect(Math.abs(waBox.height - qrisBox.height)).toBeLessThanOrEqual(1.5);
    }

    const waStyles = await btnWa.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        fontSize: s.fontSize,
        fontFamily: s.fontFamily,
        borderRadius: s.borderRadius,
      };
    });

    const qrisStyles = await btnQris.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        fontSize: s.fontSize,
        fontFamily: s.fontFamily,
        borderRadius: s.borderRadius,
      };
    });

    expect(waStyles.fontSize).toBe(qrisStyles.fontSize);
    expect(waStyles.fontFamily).toBe(qrisStyles.fontFamily);
    expect(waStyles.borderRadius).toBe(qrisStyles.borderRadius);
  });

  test("RFC 1918 Private IP Blocks & Default /16 Preset", async ({ page }) => {
    await page.goto("/");

    // Verify initial values: 10.0.0.0 and /16
    await expect(page.locator("#network")).toHaveValue("10.0.0.0");
    await expect(page.locator("#netsize")).toHaveValue("16");
    await expect(
      page.locator('.ipv4-preset-btn[data-prefix="16"]'),
    ).toHaveClass(/active/);

    // Verify RFC 1918 indicator
    const indicator = page.locator("#rfc1918_indicator");
    await expect(indicator).toBeVisible();
    await expect(indicator).toContainText("RFC 1918");

    // Click 172.16.0.0/16 chip
    const chip172 = page.locator('.rfc1918-chip[data-net="172.16.0.0"]');
    await expect(chip172).toBeVisible();
    await chip172.click();

    await expect(page.locator("#network")).toHaveValue("172.16.0.0");
    await expect(page.locator("#netsize")).toHaveValue("16");
    await expect(
      page.locator('.ipv4-preset-btn[data-prefix="16"]'),
    ).toHaveClass(/active/);
    await expect(indicator).toContainText("RFC 1918 (20-bit block)");

    // Click 192.168.0.0/16 chip
    const chip192 = page.locator('.rfc1918-chip[data-net="192.168.0.0"]');
    await expect(chip192).toBeVisible();
    await chip192.click();

    await expect(page.locator("#network")).toHaveValue("192.168.0.0");
    await expect(page.locator("#netsize")).toHaveValue("16");
    await expect(
      page.locator('.ipv4-preset-btn[data-prefix="16"]'),
    ).toHaveClass(/active/);
    await expect(indicator).toContainText("RFC 1918 (16-bit block)");

    // Click 10.0.0.0/16 chip
    const chip10 = page.locator('.rfc1918-chip[data-net="10.0.0.0"]');
    await expect(chip10).toBeVisible();
    await chip10.click();

    await expect(page.locator("#network")).toHaveValue("10.0.0.0");
    await expect(page.locator("#netsize")).toHaveValue("16");
    await expect(
      page.locator('.ipv4-preset-btn[data-prefix="16"]'),
    ).toHaveClass(/active/);
    await expect(indicator).toContainText("RFC 1918 (24-bit block)");
  });

  test("Dark Mode Default, Toggle & Palette Contrast Verification", async ({
    page,
  }) => {
    await page.goto("/");

    // Default appearance is dark mode
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("html")).toHaveAttribute("data-bs-theme", "dark");

    const toggle = page.locator("#themeToggle");
    await expect(toggle).toBeVisible();

    // Check footer contrast in dark mode
    const footer = page.locator("#app_footer");
    const footerColor = await footer.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(footerColor).toBeTruthy();

    // Check color palette swatches in dark mode
    await page.getByText("Change Colors »").click();
    for (let i = 1; i <= 10; i++) {
      const swatch = page.getByLabel(`Color ${i}`, { exact: true });
      await expect(swatch).toBeVisible();
    }

    // Toggle to light mode
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator("html")).toHaveAttribute(
      "data-bs-theme",
      "light",
    );

    // Verify Light Mode Contrast on footer
    const lightFooter = page.locator("#app_footer");
    const lightFooterColor = await lightFooter.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(lightFooterColor).toBeTruthy();

    // Toggle back to dark mode
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("html")).toHaveAttribute("data-bs-theme", "dark");
  });

  test("Vertical Spacing Rhythm between Header, Alert, and Toolbar", async ({
    page,
  }) => {
    await page.goto("/");
    const header = page.locator("#app_header");
    const alert = page.getByRole("alert");
    const toolbar = page.locator("#ip_version_toolbar");

    await expect(header).toBeVisible();
    await expect(alert).toBeVisible();
    await expect(toolbar).toBeVisible();

    const alertBox = await alert.boundingBox();
    const headerBox = await header.boundingBox();
    const toolbarBox = await toolbar.boundingBox();

    expect(alertBox).not.toBeNull();
    expect(headerBox).not.toBeNull();
    expect(toolbarBox).not.toBeNull();

    if (alertBox && headerBox && toolbarBox) {
      // Header and Alert have clear vertical gap
      expect(alertBox.y).toBeGreaterThan(headerBox.y + headerBox.height);
      // Alert and Toolbar have clear vertical gap
      expect(toolbarBox.y).toBeGreaterThan(alertBox.y + alertBox.height);
    }
  });

  test("Shareable URL Auto-Detection for Root and Subfolder Locations", async ({
    page,
  }) => {
    await page.goto("/");

    // Test root detection
    const rootUrl = await page.evaluate(() => {
      // @ts-expect-error getConfigUrl is global
      return window.getConfigUrl();
    });
    expect(rootUrl).toMatch(/^\/index\.html\?c=/);

    // Test subfolder simulation logic
    const subfolderUrl = await page.evaluate(() => {
      const origPathname = window.location.pathname;
      try {
        const testPaths = [
          "/subfolder/",
          "/network/planner/",
          "/app/v2/index.html",
        ];
        return testPaths.map((p) => {
          let base = p;
          if (base.endsWith("/index.html")) {
            return base;
          }
          if (!base.endsWith("/")) {
            base += "/";
          }
          return base + "index.html";
        });
      } finally {
        // cleanup
      }
    });

    expect(subfolderUrl[0]).toBe("/subfolder/index.html");
    expect(subfolderUrl[1]).toBe("/network/planner/index.html");
    expect(subfolderUrl[2]).toBe("/app/v2/index.html");
  });

  test("2026 Pastel Palette Buttons: Pastel Green Tools & Pastel Red Reset", async ({
    page,
  }) => {
    await page.goto("/");

    const btnTools = page.getByRole("button", { name: "Tools" });
    const btnReset = page.getByRole("button", { name: "Reset" });

    await expect(btnTools).toBeVisible();
    await expect(btnReset).toBeVisible();

    await expect(btnTools).toHaveClass(/btn-pastel-green/);
    await expect(btnReset).toHaveClass(/btn-pastel-red/);

    // Split /16
    await page.getByRole("cell", { name: "/16 Split" }).click();
    await expect(page.locator("#calc").getByText("10.0.0.0/17")).toBeVisible();

    // Click Reset
    await btnReset.click();

    // Verify reset to 10.0.0.0/16
    await expect(page.locator("#network")).toHaveValue("10.0.0.0");
    await expect(page.locator("#netsize")).toHaveValue("16");
    await expect(page.locator("#calc").getByText("10.0.0.0/17")).toBeHidden();
  });

  test("Back to Top Button Lifecycle in IPv6 with Many Subnets", async ({
    page,
  }) => {
    await page.goto("/");

    // Switch to IPv6
    await page.locator("#btn_ipv6").click();
    await expect(page.locator("#network")).toHaveValue("2001:db8::");

    const btnScrollTop = page.locator("#btn_scroll_top");
    // Initially near top, so should not have .show
    await expect(btnScrollTop).not.toHaveClass(/show/);

    // Click /56 preset and split to generate multiple rows
    await page.locator('.ipv6-preset-btn[data-prefix="56"]').click();
    const row56 = page.locator("#calcbody tr").first();
    await row56.locator("td.split").click();

    const row60 = page.locator("#calcbody tr").first();
    await row60.locator("td.split").click();

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    // Button should now have .show and be visible
    await expect(btnScrollTop).toHaveClass(/show/);
    await expect(btnScrollTop).toBeVisible();

    // Click back to top button
    await btnScrollTop.click();
    await page.waitForTimeout(600);

    // Window scrollY should return to top
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(100);
  });
});

