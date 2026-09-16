import { chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

(async () => {
  console.log('--- Full request logging test ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const allRequests = [];
  page.on('request', (request) => {
    allRequests.push({ url: request.url(), type: request.resourceType(), method: request.method() });
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warn') {
      console.log(`[browser ${msg.type()}]`, msg.text());
    }
  });

  const getSwInfo = () =>
    page.evaluate(async () => {
      if (!navigator.serviceWorker) return { unavailable: true };
      const regs = await navigator.serviceWorker.getRegistrations();
      return regs.map((r) => ({
        scope: r.scope,
        active: !!r.active,
        installing: !!r.installing,
        waiting: !!r.waiting,
        controller: !!navigator.serviceWorker.controller,
      }));
    });

  try {
    const navigationResponse = await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    console.log(`Navigation status: ${navigationResponse.status()}`);

    await page.waitForTimeout(2000);

    console.log('\n--- All requests during initial load ---');
    for (const req of allRequests) {
      console.log(`  ${req.method} ${req.url} [${req.type}]`);
    }

    console.log('\n--- Service worker registrations (after load) ---');
    console.log(JSON.stringify(await getSwInfo()));

    console.log('\nNavigating away and back...');
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);

    console.log('\n--- Service worker registrations (after nav) ---');
    console.log(JSON.stringify(await getSwInfo()));

    console.log('\n--- All requests across whole session ---');
    for (const req of allRequests) {
      console.log(`  ${req.method} ${req.url} [${req.type}]`);
    }

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
})();