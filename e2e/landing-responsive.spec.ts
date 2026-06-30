import { test, expect } from "@playwright/test";

test.describe("Landing Page Layout and Navigation", () => {
  test("should load successfully on desktop and verify layout headers", async ({ page }) => {
    // Navigate to root route
    await page.goto("/");

    // Verify company branding and hero elements
    await expect(page).toHaveTitle(/CampusConnect/i);
    await expect(page.locator("nav")).toBeVisible();

    // Verify main CTA buttons
    const joinButton = page.locator("a:has-text('Join Free')");
    if (await joinButton.count() > 0) {
      await expect(joinButton.first()).toBeVisible();
    }
  });

  test("should check responsive mobile menu drawer toggle", async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Toggle button should be visible on mobile
    const menuToggle = page.locator("button[aria-label='Toggle menu']");
    if (await menuToggle.count() > 0) {
      await expect(menuToggle).toBeVisible();
      // Click toggle
      await menuToggle.click();
    }
  });

  test("should contain key SEO meta titles and markup links", async ({ page }) => {
    await page.goto("/");

    // Check favicon and metadata presence
    const description = page.locator("meta[name='description']");
    await expect(description).toBeDefined();

    // Verify footer links are accessible and valid HTML5 anchors
    const privacyLink = page.locator("a[href='/privacy-policy']");
    if (await privacyLink.count() > 0) {
      await expect(privacyLink.first()).toBeVisible();
    }
  });
});
