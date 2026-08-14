const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  await page.goto('http://localhost:3000/auth/sign-up');
  console.log("Navigated to sign up");
  
  await page.waitForSelector('text=Student');
  await page.click('text=Student');
  
  await page.fill('input[placeholder="Priya Sharma"]', 'Test User');
  await page.fill('input[type="email"]', 'test@test.com');
  
  // Click college picker trigger
  await page.click('#college-picker-trigger');
  console.log("Clicked college picker trigger");
  
  // Skip location permission
  await page.waitForTimeout(1000);
  try {
    const skipBtn = await page.waitForSelector('button:has-text("Skip")', { timeout: 2000 });
    if (skipBtn) {
      await skipBtn.click();
      console.log("Clicked skip location");
    }
  } catch (e) {
    console.log("No skip button found or timed out");
  }

  // Wait for dropdown
  await page.waitForSelector('#college-search-input');
  console.log("Found search input");
  await page.fill('#college-search-input', 'Engineering');
  
  // Wait for results
  await page.waitForTimeout(2000);
  
  // Try to click the first college card
  const cards = await page.$$('button[aria-label^="Select"]');
  console.log("Found college cards:", cards.length);
  
  if (cards.length > 0) {
    await cards[0].click();
    console.log("Clicked first college card");
    
    await page.waitForTimeout(1000);
    
    // Check if it's selected
    const triggerText = await page.innerText('#college-picker-trigger');
    console.log("Trigger text after click:", triggerText);
  }
  
  await browser.close();
})();
