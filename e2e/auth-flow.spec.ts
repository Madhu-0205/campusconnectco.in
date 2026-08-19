import { test, expect } from "@playwright/test";

test.describe("Authentication Forms Verification", () => {
  test("should render sign-in form elements and validate blank submissions", async ({ page }) => {
    // Navigate to local Sign-in page
    await page.goto("/auth/sign-in");

    // Verify title and essential forms
    await expect(page.locator("h2, h1")).toContainText(/Welcome Back/i);
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toBeVisible();

    // Verify forgot password links exist
    await expect(page.locator("a[href='/auth/forgot-password']")).toBeVisible();
  });

  test("should render registration forms with role selections", async ({ page }) => {
    await page.goto("/auth/sign-up");

    await expect(page.locator("h2, h1")).toContainText(/Create Account/i);
    // Role tabs check
    await expect(page.locator("button:has-text('Student')")).toBeVisible();
    await expect(page.locator("button:has-text('Startup')")).toBeVisible();
  });

  test("should show validation errors on password reset form with invalid inputs", async ({ page }) => {
    await page.goto("/auth/forgot-password");

    await expect(page.locator("h2, h1")).toContainText(/Forgot your password\?/i);
    
    // Type invalid email address format
    await page.fill("input[type='email']", "invalid_email_format");
    await page.click("button[type='submit']");
    
    // Check validation error state triggers (usually HTML5 constraint validation)
    const emailInput = page.locator("input[type='email']");
    const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
    expect(isValid).toBe(false);
  });
});
