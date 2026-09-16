import { test, expect } from "@playwright/test";

test("Default Export Content", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Tools" }).click();
  await page.getByRole("link", { name: "Import / Export" }).click();
  await expect(page.locator("#importExportModalLabel")).toContainText(
    "Import/Export",
  );
  await expect(page.getByLabel("Import/Export", { exact: true })).toContainText(
    "Close",
  );
  await expect(page.locator("#importBtn")).toContainText("Import");
  await expect(page.getByLabel("Import/Export Content")).toHaveValue(
    '{\n  "config_version": "2",\n  "base_network": "10.0.0.0/16",\n  "subnets": {\n    "10.0.0.0/16": {}\n  }\n}',
  );
});

test("Default (AWS) Export Content", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Tools" }).click();
  await page.getByRole("link", { name: "Mode - AWS" }).click();
  await page.getByRole("button", { name: "Tools" }).click();
  await page.getByRole("link", { name: "Import / Export" }).click();
  await expect(page.getByLabel("Import/Export Content")).toHaveValue(
    '{\n  "config_version": "2",\n  "operating_mode": "AWS",\n  "base_network": "10.0.0.0/16",\n  "subnets": {\n    "10.0.0.0/16": {}\n  }\n}',
  );
});

test("Default (Azure) Export Content", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Tools" }).click();
  await page.getByRole("link", { name: "Mode - Azure" }).click();
  await page.getByRole("button", { name: "Tools" }).click();
  await page.getByRole("link", { name: "Import / Export" }).click();
  await expect(page.getByLabel("Import/Export Content")).toHaveValue(
    '{\n  "config_version": "2",\n  "operating_mode": "AZURE",\n  "base_network": "10.0.0.0/16",\n  "subnets": {\n    "10.0.0.0/16": {}\n  }\n}',
  );
  await page
    .getByLabel("Import/Export", { exact: true })
    .getByText("Close")
    .click();
});

test("Default (OCI) Export Content", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Tools" }).click();
  await page.getByRole("link", { name: "Mode - OCI" }).click();
  await page.getByRole("button", { name: "Tools" }).click();
  await page.getByRole("link", { name: "Import / Export" }).click();
  await expect(page.getByLabel("Import/Export Content")).toHaveValue(
    '{\n  "config_version": "2",\n  "operating_mode": "OCI",\n  "base_network": "10.0.0.0/16",\n  "subnets": {\n    "10.0.0.0/16": {}\n  }\n}',
  );
  //await page.getByLabel('Import/Export', { exact: true }).getByText('Close').click();
});

test("Import 192.168.0.0/24", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Tools" }).click();
  await page.getByRole("link", { name: "Import / Export" }).click();
  await page.getByLabel("Import/Export Content").click();
  await page
    .getByLabel("Import/Export Content")
    .fill(
      '{\n  "config_version": "2",\n  "base_network": "192.168.0.0/24",\n  "subnets": {\n    "192.168.0.0/24": {}\n  }\n}',
    );
  await page.getByRole("button", { name: "Import" }).click();
  await expect(page.getByLabel("Network Address")).toHaveValue("192.168.0.0");
  await expect(page.getByLabel("Network Size")).toHaveValue("24");
  await expect(
    page
      .getByLabel("192.168.0.0/24", { exact: true })
      .getByLabel("Subnet Address"),
  ).toContainText("192.168.0.0/24");
});

test("Export CSV Format", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Tools" }).click();
  await page.getByRole("link", { name: "Import / Export" }).click();
  await page.locator("#btn_format_csv").click();
  await expect(page.locator("#btn_format_csv")).toHaveClass(/active/);
  const val = await page.getByLabel("Import/Export Content").inputValue();
  expect(val).toContain(
    '"Subnet Address","Range of Addresses","Usable IPs","Hosts","Note","Color"',
  );
  expect(val).toContain('"10.0.0.0/16"');
});

test("Export Plain Text Format", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Tools" }).click();
  await page.getByRole("link", { name: "Import / Export" }).click();
  await page.locator("#btn_format_txt").click();
  await expect(page.locator("#btn_format_txt")).toHaveClass(/active/);
  const val = await page.getByLabel("Import/Export Content").inputValue();
  expect(val).toContain("# Visual Subnet Calculator Export");
  expect(val).toContain("Subnet Address");
  expect(val).toContain("10.0.0.0/16");
});

test("Import CSV Format", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Tools" }).click();
  await page.getByRole("link", { name: "Import / Export" }).click();
  await page
    .getByLabel("Import/Export Content")
    .fill(
      '"Subnet Address","Range of Addresses","Usable IPs","Hosts","Note","Color"\n"172.16.0.0/24","172.16.0.0 - 172.16.0.255","172.16.0.1 - 172.16.0.254","254","CSV Imported Subnet","#fff3e0"',
    );
  await page.getByRole("button", { name: "Import" }).click();
  await expect(page.getByLabel("Network Address")).toHaveValue("172.16.0.0");
  await expect(page.getByLabel("Network Size")).toHaveValue("24");
  await expect(
    page
      .getByLabel("172.16.0.0/24", { exact: true })
      .getByLabel("Subnet Address"),
  ).toContainText("172.16.0.0/24");
});

test("Import Plain Text Format", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Tools" }).click();
  await page.getByRole("link", { name: "Import / Export" }).click();
  await page
    .getByLabel("Import/Export Content")
    .fill(
      "# Custom Network Plan\n10.50.0.0/25 # Office LAN\n10.50.0.128/25 # DMZ LAN",
    );
  await page.getByRole("button", { name: "Import" }).click();
  await expect(page.getByLabel("Network Address")).toHaveValue("10.50.0.0");
  await expect(page.getByLabel("Network Size")).toHaveValue("24");
  await expect(
    page
      .getByLabel("10.50.0.0/25", { exact: true })
      .getByLabel("Subnet Address"),
  ).toContainText("10.50.0.0/25");
  await expect(
    page
      .getByLabel("10.50.0.128/25", { exact: true })
      .getByLabel("Subnet Address"),
  ).toContainText("10.50.0.128/25");
});
