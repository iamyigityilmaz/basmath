// Geliştirme yardımcısı: bir URL'yi açar, isteğe bağlı tuş/komut dizisini uygular ve ekran görüntüsü alır.
// Kullanım: node tests/e2e/shot.mjs <url> <çıktı.png> [genişlik] [yükseklik] [js-eylemleri]
import { chromium } from 'playwright';

const [url, out, w = '960', h = '540', actions = ''] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(url);
await page.waitForTimeout(1200);
if (actions) {
  const fn = new Function('page', `return (async () => { ${actions} })()`);
  await fn(page);
}
await page.screenshot({ path: out });
console.log(errors.length ? `HATALAR:\n${errors.join('\n')}` : 'konsol temiz');
await browser.close();
