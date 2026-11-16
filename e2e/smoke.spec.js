import { test, expect } from "@playwright/test";

const E2E_PASSWORD = "E2E-only-demo-password-2026";

async function signIn(page, username, password = E2E_PASSWORD) {
  await page.goto("/admin/login");
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('form button').click();
  await page.waitForURL((url) => url.pathname !== "/admin/login");
}

test("public pages render and tracking exposes no direct patient contact details", async ({ page }) => {
  const routes = [
    "/", "/doctors", "/doctors/prof-dr-muhammad-salahuddin",
    "/units", "/services/hospital", "/appointment", "/live",
    "/track", "/track/IST-E2EABC123456", "/medical-reports", "/user-manual",
  ];
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response, route + " should return a document response").not.toBeNull();
    expect(response.status(), route).toBeLessThan(400);
    await expect(page.locator("body")).not.toBeEmpty();
  }
  const tracking = await page.request.get("/api/queue/IST-E2EABC123456");
  expect(tracking.status()).toBe(200);
  const ticket = await tracking.json();
  expect(ticket.firstName).toBe("Fictional");
  expect(ticket).not.toHaveProperty("phone");
  expect(ticket).not.toHaveProperty("note");
  expect(JSON.stringify(ticket)).not.toContain("Fictional E2E Patient");
  expect(JSON.stringify(ticket)).not.toContain("01700000000");
});


test("fictional appointment booking creates a trackable ticket", async ({ page }) => {
  await page.goto("/appointment?doctor=prof-dr-muhammad-salahuddin");
  const dateChoice = page.locator('form button[aria-pressed="false"]').first();
  await expect(dateChoice).toBeVisible({ timeout: 20_000 });
  await dateChoice.click();
  await expect(dateChoice).toHaveAttribute("aria-pressed", "true");
  await page.locator('input[name="name"]').fill("Demo Browser Patient");
  await page.locator('input[name="phone"]').fill("01712345678");
  await page.locator('textarea[name="note"]').fill("Fictional browser acceptance note");
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL((url) => url.pathname.startsWith("/track/"));
  const ref = new URL(page.url()).pathname.split("/").pop();
  expect(ref).toMatch(/^IST-[A-Z0-9]{12}$/);
  const response = await page.request.get("/api/queue/" + ref);
  expect(response.status()).toBe(200);
  const ticket = await response.json();
  expect(ticket.firstName).toBe("Demo");
  expect(ticket.status).toBe("waiting");
  expect(ticket).not.toHaveProperty("phone");
  expect(ticket).not.toHaveProperty("note");
});

test("Main Admin has organization oversight but cannot enter branch operations", async ({ page }) => {
  await signIn(page, "admin", "ci-only-password-not-for-real-use");
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.locator("main h1").first()).toBeVisible();
  await page.goto("/admin/branches");
  await expect(page.locator("main h1").first()).toBeVisible();
  await page.goto("/admin/audit");
  await expect(page.locator("main h1").first()).toBeVisible();
  await page.goto("/admin/queue");
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/schedules");
  await expect(page).toHaveURL(/\/admin$/);
});

test("Branch Admin is confined to its branch and cannot operate the live queue", async ({ page }) => {
  await signIn(page, "branchadmin");
  await expect(page).toHaveURL(/\/admin\/schedules$/);
  await expect(page.locator("main h1").first()).toBeVisible();
  await page.goto("/admin/doctors");
  await expect(page.locator("main h1").first()).toBeVisible();
  await page.goto("/admin/appointments");
  await expect(page.locator("main h1").first()).toBeVisible();
  await expect(page.locator("body")).toContainText("Restricted");
  await page.goto("/admin/queue");
  await expect(page).toHaveURL(/\/admin\/schedules$/);
});

test("Queue staff can operate the assigned doctor's queue without patient contact fields", async ({ page }) => {
  await signIn(page, "queuestaff");
  await expect(page).toHaveURL(/\/admin\/queue$/);
  await expect(page.locator("body")).toContainText("Fictional E2E Patient");
  await expect(page.locator("body")).not.toContainText("01700000000");
  await expect(page.locator("body")).not.toContainText("E2E-only private note");
  await page.getByRole("button", { name: /Call next patient|পরবর্তী রোগীকে ডাকুন/ }).click();
  await expect(page.locator("body")).toContainText(/Queue updated\.|সিরিয়াল আপডেট হয়েছে।/);
  const ticket = await page.request.get("/api/queue/IST-E2EABC123456");
  expect((await ticket.json()).status).toBe("serving");
  await page.goto("/admin/appointments");
  await expect(page).toHaveURL(/\/admin\/queue$/);
});

test("Appointment staff can view bookings only with patient identity redacted", async ({ page }) => {
  await signIn(page, "apptstaff");
  await expect(page).toHaveURL(/\/admin\/appointments$/);
  await expect(page.locator("body")).toContainText("Restricted");
  await expect(page.locator("body")).not.toContainText("Fictional E2E Patient");
  await expect(page.locator("body")).not.toContainText("01700000000");
  await expect(page.locator("body")).not.toContainText("E2E-only private note");
  await page.goto("/admin/queue");
  await expect(page).toHaveURL(/\/admin\/appointments$/);
});

test("key public pages fit a narrow mobile viewport without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ["/", "/doctors", "/appointment", "/live", "/admin/login"]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBeLessThan(400);
    const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    expect(fits, route + " should not overflow horizontally on mobile").toBe(true);
  }
});
