const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const routes = [
    '/',
    '/auth/sign-in',
    '/auth/sign-up',
    '/onboarding',
    '/dashboard',
    '/dashboard/student',
    '/dashboard/founder',
    '/client-hub',
    '/companies',
    '/internships',
    '/gigs/find',
    '/profile/testuser'
  ];

  let errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error on ${page.url()}: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    errors.push(`Page Error on ${page.url()}: ${error.message}`);
  });

  for (const route of routes) {
    try {
      const response = await page.goto(`http://localhost:3000${route}`, { waitUntil: 'domcontentloaded', timeout: 5000 });
      if (!response.ok()) {
        errors.push(`HTTP Error ${response.status()} on ${route}`);
      }
    } catch (e) {
      errors.push(`Navigation failed on ${route}: ${e.message}`);
    }
  }

  await browser.close();
  
  if (errors.length > 0) {
    console.log("ERRORS FOUND:");
    console.log(errors.join('\n'));
  } else {
    console.log("ALL ROUTES LOADED WITHOUT ERRORS.");
  }
})();
