# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-flow.spec.ts >> Authentication Forms Verification >> should show validation errors on password reset form with invalid inputs
- Location: e2e/auth-flow.spec.ts:27:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h2, h1')
Expected pattern: /Reset/i
Received string:  "Forgot your password?"
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('h2, h1')
    10 × locator resolved to <h1 class="font-black text-white mb-2">Forgot your password?</h1>
       - unexpected value "Forgot your password?"

```

```yaml
- heading "Forgot your password?" [level=1]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Authentication Forms Verification", () => {
  4  |   test("should render sign-in form elements and validate blank submissions", async ({ page }) => {
  5  |     // Navigate to local Sign-in page
  6  |     await page.goto("/auth/sign-in");
  7  | 
  8  |     // Verify title and essential forms
  9  |     await expect(page.locator("h2, h1")).toContainText(/Sign In/i);
  10 |     await expect(page.locator("input[type='email']")).toBeVisible();
  11 |     await expect(page.locator("input[type='password']")).toBeVisible();
  12 |     await expect(page.locator("button[type='submit']")).toBeVisible();
  13 | 
  14 |     // Verify forgot password links exist
  15 |     await expect(page.locator("a[href='/auth/forgot-password']")).toBeVisible();
  16 |   });
  17 | 
  18 |   test("should render registration forms with role selections", async ({ page }) => {
  19 |     await page.goto("/auth/sign-up");
  20 | 
  21 |     await expect(page.locator("h2, h1")).toContainText(/Join/i);
  22 |     // Role tabs check
  23 |     await expect(page.locator("button:has-text('Student')")).toBeVisible();
  24 |     await expect(page.locator("button:has-text('Client')")).toBeVisible();
  25 |   });
  26 | 
  27 |   test("should show validation errors on password reset form with invalid inputs", async ({ page }) => {
  28 |     await page.goto("/auth/forgot-password");
  29 | 
> 30 |     await expect(page.locator("h2, h1")).toContainText(/Reset/i);
     |                                          ^ Error: expect(locator).toContainText(expected) failed
  31 |     
  32 |     // Type invalid email address format
  33 |     await page.fill("input[type='email']", "invalid_email_format");
  34 |     await page.click("button[type='submit']");
  35 |     
  36 |     // Check validation error state triggers (usually HTML5 constraint validation)
  37 |     const emailInput = page.locator("input[type='email']");
  38 |     const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
  39 |     expect(isValid).toBe(false);
  40 |   });
  41 | });
  42 | 
```