import { chromium } from 'playwright';

async function testPuter() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log(`[Browser Console ${msg.type()}]`, msg.text()));
  page.on('popup', p => console.log('[Browser Popup opened]', p.url()));
  page.on('frameattached', f => console.log('[Browser Frame attached]', f.url()));
  page.on('request', r => {
    if (r.url().includes('puter')) {
      console.log(`[Puter Request] ${r.method()} ${r.url()}`);
    }
  });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const debug = await page.evaluate(async () => {
    const p = (window as any).puter;
    if (!p) return { error: 'window.puter not found' };

    const keys = Object.keys(p);
    const aiKeys = p.ai ? Object.keys(p.ai) : [];
    const authKeys = p.auth ? Object.keys(p.auth) : [];
    const isSignedIn = typeof p.auth?.isSignedIn === 'function' ? p.auth.isSignedIn() : null;

    let chatResult: any = null;
    let chatError: any = null;

    try {
      const chatPromise = p.ai.chat('Hello', { model: 'gpt-4o-mini' });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 5s')), 5000));
      chatResult = await Promise.race([chatPromise, timeoutPromise]);
    } catch (e: any) {
      chatError = { message: e.message, stack: e.stack };
    }

    return { keys, aiKeys, authKeys, isSignedIn, chatResult, chatError };
  });

  console.log('Puter Debug Info:', JSON.stringify(debug, null, 2));

  await browser.close();
}

testPuter();
