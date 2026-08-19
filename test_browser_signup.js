const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to network responses
  page.on('response', async response => {
    if (response.url().includes('/auth/v1/signup') && response.request().method() === 'POST') {
      const body = await response.json().catch(() => null);
      console.log('--- SUPABASE SIGNUP RESPONSE ---');
      console.log('Status:', response.status());
      console.log('Body:', body);
    }
  });

  page.on('request', async request => {
    if (request.url().includes('/auth/v1/signup') && request.method() === 'POST') {
      console.log('--- SUPABASE SIGNUP REQUEST ---');
      console.log('Post Data:', request.postData());
    }
  });

  await page.goto('http://localhost:3000/auth/sign-up', { waitUntil: 'domcontentloaded', timeout: 15000 });

  // Fill Step 1
  await page.fill('input[placeholder="Priya Sharma"]', 'Test Student');
  await page.fill('input[type="email"]', `student-${Date.now()}@yahoo.com`);
  
  // Click CollegePicker placeholder
  await page.fill('input[placeholder="Search for your college..."]', 'Stanford');
  await page.waitForTimeout(500);
  
  // Wait for the dropdown and click the first option
  await page.waitForSelector('ul[role="listbox"] li', { timeout: 10000 });
  await page.click('ul[role="listbox"] li:first-child');
  
  // Click Continue
  await page.click('button:has-text("Continue")');

  // Wait for step 2
  await page.waitForSelector('input[type="password"]');

  // Fill Step 2
  await page.fill('input[type="password"]', 'StrongPass123!');
  
  // Checkboxes
  const checkboxes = await page.$$('input[type="checkbox"]');
  await checkboxes[0].check({ force: true }); // Terms

  // Click Submit
  await page.click('button:has-text("Create Account")');

  await page.waitForTimeout(5000);

  await browser.close();
})();
