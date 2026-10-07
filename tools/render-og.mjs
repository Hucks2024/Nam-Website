// Renders tools/og-card.html to og-image.png (1200 × 630), the picture shown
// when someone shares the site link on WhatsApp, Facebook, Zalo and so on.
//
// Needs Node and Playwright:  npm i -D playwright && npx playwright install chromium
// Then, from the repo root:   node tools/render-og.mjs
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(pathToFileURL(path.join(here, 'og-card.html')).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(here, '..', 'og-image.png') });
await browser.close();
console.log('Wrote og-image.png');
