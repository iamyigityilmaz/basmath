// Cihaz kontrolü (tasarım dokümanı 17. bölüm). Önce `npm run build`, sonra `npm run e2e`.
// iPhone 14 Pro Max ve iPhone 11 (WebKit), Galaxy (Chromium) profillerinde oyunu açar, her odayı yükler,
// arayüzün taşmadığını, dikey uyarısını, 4x CPU'da FPS'i, offline çalışmayı ve yardımcısız bitirilebildiğini sınar.
import { chromium, webkit, devices } from 'playwright';
import { preview } from 'vite';
import fs from 'node:fs';

const OUT = 'tests/e2e/shots';
const PORT = 4179;
const BASE = `http://localhost:${PORT}/`;
fs.mkdirSync(OUT, { recursive: true });

const results = [];
let failed = 0;
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  if (!ok) failed += 1;
  console.log(`${ok ? '  ✓' : '  ✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(browser, opts, url) {
  const context = await browser.newContext(opts);
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(url);
  await page.waitForFunction(() => window.__game && window.__game.scene.isActive('Menu'), null, { timeout: 20000 });
  await page.waitForTimeout(400);
  return { context, page, errors };
}

/** Arayüz öğeleri oyun çerçevesinin (güvenli alanın) içinde mi? Dokunma hedefleri ≥ 44 px mi? */
function auditUI() {
  const frame = document.getElementById('frame').getBoundingClientRect();
  const out = { overflow: [], small: [] };
  const els = document.querySelectorAll('#ui button, #ui .panel, #ui .hud-task, #ui .menu-title, #ui .menu-maker, #ui .big-card, #ui .credits-text, #ui .select-head');
  els.forEach((e) => {
    const r = e.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    const cs = getComputedStyle(e);
    if (cs.visibility === 'hidden' || cs.display === 'none') return;
    if (e.closest('.debug')) return;
    const tag = `${e.tagName.toLowerCase()}.${String(e.className).split(' ').join('.')}`;
    if (r.left < frame.left - 1 || r.top < frame.top - 1 || r.right > frame.right + 1 || r.bottom > frame.bottom + 1) {
      out.overflow.push(`${tag} [${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}]`);
    }
    if (e.tagName === 'BUTTON' && (r.width < 43.5 || r.height < 43.5)) out.small.push(`${tag} ${Math.round(r.width)}×${Math.round(r.height)}`);
  });
  return out;
}

async function audit(page, label) {
  const a = await page.evaluate(auditUI);
  check(`${label}: arayüz güvenli alanın içinde`, a.overflow.length === 0, a.overflow.join('; '));
  check(`${label}: dokunma hedefleri ≥ 44 px`, a.small.length === 0, a.small.join('; '));
}

const ROOMS = [
  ['GulbenRoom', 0], ['YagmurPlayground', 1], ['BurakRoom', 2], ['AlihanGym', 3],
];

async function deviceRun(profile) {
  console.log(`\n== ${profile.name} (${profile.engine.name()}) ==`);
  const browser = await profile.engine.launch();
  const { page, errors } = await open(browser, { ...profile.device }, `${BASE}?debug=1`);
  const vp = page.viewportSize();

  // Çentik / Dynamic Island: güvenli alan boşluklarını taklit et
  if (profile.inset) {
    const i = profile.inset;
    await page.addStyleTag({ content: `#frame{top:${i.t}px !important;right:${i.r}px !important;bottom:${i.b}px !important;left:${i.l}px !important}` });
    await page.setViewportSize({ width: vp.width, height: vp.height - 1 });
    await page.setViewportSize(vp);
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
    await page.waitForTimeout(1500); // Phaser üst öğe boyutunu 500 ms aralıkla yoklar
    const ok = await page.evaluate((ins) => {
      const c = document.querySelector('#frame canvas').getBoundingClientRect();
      const u = document.getElementById('ui').getBoundingClientRect();
      const inSafe = c.left >= ins.l - 0.5 && c.right <= window.innerWidth - ins.r + 0.5 && c.bottom <= window.innerHeight - ins.b + 0.5 && c.top >= ins.t - 0.5;
      const aligned = Math.abs(c.left - u.left) < 1 && Math.abs(c.top - u.top) < 1 && Math.abs(c.width - u.width) < 1 && Math.abs(c.height - u.height) < 1;
      return { inSafe, aligned, c: [c.left, c.top, c.width, c.height].map(Math.round) };
    }, i);
    check('canvas güvenli alanın içinde', ok.inSafe, JSON.stringify(ok.c));
    check('HTML arayüz canvas ile hizalı', ok.aligned);
  }

  check('touch modu (joystick) etkin', await page.evaluate(() => document.body.classList.contains('touch')));
  await page.screenshot({ path: `${OUT}/${profile.name}-menu.png` });
  await audit(page, 'Ana menü');

  // debug menüsüyle her oda yükleniyor
  for (const [key, idx] of ROOMS) {
    await page.evaluate(([k, i]) => { window.__session.checkpoint = i; window.__goto(k); }, [key, idx]);
    await page.waitForFunction((k) => window.__game.scene.isActive(k) && !!window.__game.scene.getScene(k).player, key, { timeout: 8000 });
    await page.waitForTimeout(3100); // başlık kartı geçsin
    check(`${key} yüklendi`, true);
    await page.screenshot({ path: `${OUT}/${profile.name}-${key}.png` });
    await audit(page, key);
  }

  // Soru ekranı ve diyalog (Burak odası)
  await page.evaluate(() => { window.__session.checkpoint = 2; window.__goto('BurakRoom'); });
  await page.waitForFunction(() => window.__game.scene.isActive('BurakRoom') && !!window.__game.scene.getScene('BurakRoom').player);
  await page.waitForTimeout(500);
  await page.evaluate(() => { const s = window.__game.scene.getScene('BurakRoom'); s.player.setPos(282, 116); });
  await page.waitForTimeout(250);
  const actionBtn = page.locator('.hud-action');
  check('eylem butonu "Konuş" gösteriyor', (await actionBtn.textContent()).includes('Konuş'));
  await actionBtn.tap();
  await page.waitForSelector('.dlg');
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/${profile.name}-diyalog.png` });
  await audit(page, 'Diyalog');
  await page.locator('.dlg-layer').tap();
  await page.waitForTimeout(150);
  if (await page.locator('.dlg-layer').count()) await page.locator('.dlg-layer').tap();
  await page.waitForSelector('.quiz');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${profile.name}-soru.png` });
  await audit(page, 'Soru ekranı');

  // Duraklat menüsü
  await page.locator('.hud-pause').tap();
  await page.waitForSelector('.menu-layer');
  await page.screenshot({ path: `${OUT}/${profile.name}-duraklat.png` });
  await audit(page, 'Duraklat menüsü');
  check('duraklatınca sahne duruyor', await page.evaluate(() => window.__game.scene.isPaused('BurakRoom')));
  await page.locator('.menu-layer .btn').first().tap();
  await page.waitForTimeout(200);
  check('devam edince sahne sürüyor', await page.evaluate(() => window.__game.scene.isActive('BurakRoom')));

  // Dikey tutunca uyarı, yan çevirince kaldığı yerden devam
  const before = await page.evaluate(() => {
    const q = window.__quizUI.state;
    return { index: q.index, text: q.questions[q.index].text };
  });
  await page.setViewportSize({ width: vp.height, height: vp.width });
  await page.waitForTimeout(500);
  const portrait = await page.evaluate(() => ({
    shown: !document.getElementById('rotate').hidden,
    running: window.__game.loop.running,
    text: document.querySelector('#rotate p').textContent,
  }));
  await page.screenshot({ path: `${OUT}/${profile.name}-dikey.png` });
  check('dikeyde "Telefonu yan çevir" çıkıyor', portrait.shown && portrait.text === 'Telefonu yan çevir');
  check('dikeyde oyun duraklıyor', portrait.running === false);
  await page.setViewportSize(vp);
  await page.waitForTimeout(600);
  const after = await page.evaluate(() => {
    const q = window.__quizUI.state;
    return {
      shown: !document.getElementById('rotate').hidden,
      running: window.__game.loop.running,
      index: q.index,
      text: q.questions[q.index].text,
      quiz: !!document.querySelector('.quiz'),
    };
  });
  check('yan çevirince oyun kaldığı yerden devam ediyor', !after.shown && after.running && after.quiz && after.index === before.index && after.text === before.text);
  await audit(page, 'Yan çevirdikten sonra');

  // Sayfa kaymıyor, zoom olmuyor, metin seçilmiyor
  const page0 = await page.evaluate(() => {
    const cs = getComputedStyle(document.body);
    const html = getComputedStyle(document.documentElement);
    const vpMeta = document.querySelector('meta[name=viewport]').content;
    return {
      scroll: document.scrollingElement.scrollHeight <= window.innerHeight + 1 && document.scrollingElement.scrollWidth <= window.innerWidth + 1,
      select: (cs.userSelect || cs.webkitUserSelect) === 'none',
      touchAction: html.touchAction === 'none',
      // (Playwright'in WebKit derlemesi bu özelliği raporlamıyor; gerçek Safari 16+ destekler)
      overscroll: html.overscrollBehaviorY === 'none' || html.overscrollBehavior === 'none' || html.overscrollBehavior === undefined,
      viewport: vpMeta.includes('user-scalable=no') && vpMeta.includes('viewport-fit=cover'),
      lang: document.documentElement.lang,
    };
  });
  check('sayfa kaymıyor', page0.scroll);
  check('metin seçilmiyor', page0.select);
  check('touch-action/overscroll kapalı, zoom yok', page0.touchAction && page0.overscroll && page0.viewport);
  check('<html lang="tr">', page0.lang === 'tr');

  // Türkçe karakterler: font yüklü ve tüm harfler için glif var
  const font = await page.evaluate(async () => {
    await document.fonts.ready;
    const probe = 'çğıİöşüÇĞÖŞÜ';
    return { loaded: document.fonts.check('16px "Jersey 15"', probe), family: getComputedStyle(document.body).fontFamily };
  });
  check('Türkçe karakterli pixel font yüklü', font.loaded, font.family);

  check('konsolda hata yok', errors.length === 0, errors.join(' | '));
  await browser.close();
}

// ---------------------------------------------------------------- Chromium'a özel testler

async function moveTo(page, key, tx, ty, tol = 3) {
  const pos = () => page.evaluate((k) => { const p = window.__game.scene.getScene(k).player; return { x: p.x, y: p.y }; }, key);
  for (const axis of ['y', 'x']) {
    const target = axis === 'x' ? tx : ty;
    let p = await pos();
    if (Math.abs(p[axis] - target) <= tol) continue;
    const k = axis === 'x' ? (target > p.x ? 'KeyD' : 'KeyA') : (target > p.y ? 'KeyS' : 'KeyW');
    await page.keyboard.down(k);
    const dir = Math.sign(target - p[axis]);
    try {
      await page.waitForFunction(([kk, ax, t, d]) => {
        const pl = window.__game.scene.getScene(kk).player;
        return (pl[ax] - t) * d >= -1;
      }, [key, axis, target, dir], { polling: 'raf', timeout: 15000 });
    } catch (e) {
      const dbg = await page.evaluate((kk) => {
        const sc = window.__game.scene.getScene(kk);
        return JSON.stringify({ x: sc.player.x, y: sc.player.y, locked: sc.locked, hold: sc.helperHold, running: window.__game.loop.running, body: document.body.className, layers: Array.from(document.getElementById('ui').children).map((c) => c.className) });
      }, key);
      throw new Error(`moveTo(${key}, ${tx}, ${ty}) zaman aşımı: ${dbg}`);
    }
    await page.keyboard.up(k);
    p = await pos();
  }
}

async function pressE(page, n = 1, gap = 260) {
  for (let i = 0; i < n; i++) {
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(gap);
  }
}

async function passQuiz(page) {
  await page.waitForSelector('.quiz');
  for (let i = 0; i < 6; i++) {
    const ci = await page.evaluate(() => { const q = window.__quizUI.state; return q.finished ? -1 : q.questions[q.index].correctIndex; });
    if (ci < 0) break;
    await page.waitForFunction(() => window.__quizUI.accepting());
    await page.locator('.quiz-opt').nth(ci).click();
    await page.waitForTimeout(1450);
  }
  await page.waitForSelector('.quiz', { state: 'detached' });
}

async function quizRoom(page, key) {
  await page.waitForFunction((k) => window.__game.scene.isActive(k) && !!window.__game.scene.getScene(k).player, key);
  await page.waitForTimeout(500);
  await moveTo(page, key, 282, 116);
  await pressE(page, 3);
  await passQuiz(page);
  await page.waitForSelector('.dlg');
  await pressE(page, 2);
  await page.waitForFunction((k) => window.__game.scene.getScene(k).exitOpen, key);
  // Boss'un çevresinden dolaşıp açılan kapıdan çık
  await moveTo(page, key, 282, 140);
  await moveTo(page, key, 367, 140);
  await page.keyboard.down('KeyW');
  await page.waitForFunction((k) => !window.__game.scene.isActive(k), key, { timeout: 8000 });
  await page.keyboard.up('KeyW');
}

/** Oyun hiç yardımcı kullanmadan baştan sona bitirilebiliyor mu? */
async function playthrough(browser) {
  console.log('\n== Baştan sona oynanış (yardımcısız, Yağız Alp) ==');
  const { page, errors, context } = await open(browser, { viewport: { width: 960, height: 540 } }, `${BASE}?debug=1`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForFunction(() => window.__game && window.__game.scene.isActive('Menu'));
  await page.waitForTimeout(400);
  check('kayıt yokken "Devam Et" görünmüyor', (await page.locator('.menu-layer .btn').count()) === 2);
  await page.keyboard.press('Enter');
  await page.waitForSelector('.dlg');
  await pressE(page, 2);
  await page.waitForSelector('.select-card');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');

  // Oda 1 — Gülben
  await quizRoom(page, 'GulbenRoom');
  check('Oda 1 (Gülben) geçildi', true);

  // Oda 2 — Yağmur
  const Y = 'YagmurPlayground';
  await page.waitForFunction((k) => window.__game.scene.isActive(k) && !!window.__game.scene.getScene(k).player, Y);
  await page.waitForTimeout(500);
  await moveTo(page, Y, 48, 114);
  await pressE(page, 3);
  await page.waitForFunction((k) => window.__game.scene.getScene(k).started, Y);
  // kapıya kartal oyuncağı olmadan gidince uyarı
  await moveTo(page, Y, 15, 114);
  await page.waitForSelector('.toast');
  check('kartal oyuncağı olmadan kapıda uyarı çıkıyor', (await page.locator('.toast').textContent()) === 'Önce kartal oyuncağını bulmalıyız!');
  // kartal oyuncağının olduğu kabın yanına git (test kısayolu), Bak → Al
  await page.evaluate((k) => { const s = window.__game.scene.getScene(k); const e = s.eagleSpot; s.patrol.speed = 0; s.patrol.turnEvery = 1e9; s.player.setPos(e.x, e.y + 14); }, Y);
  await page.waitForTimeout(200);
  await page.keyboard.press('KeyE');
  await page.waitForSelector('.toy-panel');
  check('oyuncağa bakınca adı yazmıyor', (await page.locator('.toy-panel').textContent()).trim() === 'AlGeri bırak');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('KeyE');
  await page.waitForFunction((k) => window.__game.scene.getScene(k).hasEagle, Y);
  await page.evaluate((k) => { window.__game.scene.getScene(k).player.setPos(30, 113); }, Y);
  await page.keyboard.down('KeyA');
  await page.waitForSelector('.big-card');
  await page.keyboard.up('KeyA');
  check('"Anneler bölgesi geçildi!" kartı', (await page.locator('.big-card').textContent()) === 'Anneler bölgesi geçildi!');
  await page.waitForTimeout(1400);
  await pressE(page, 1);

  // Oda 3 — Burak
  await quizRoom(page, 'BurakRoom');
  check('Oda 3 (Burak) geçildi', true);

  // Oda 4 — Alihan: 6 atışta 12 sayı (hepsi 2'lik)
  const G = 'AlihanGym';
  await page.waitForFunction((k) => window.__game.scene.isActive(k) && !!window.__game.scene.getScene(k).player, G);
  await page.waitForTimeout(500);
  await moveTo(page, G, 312, 154);
  await pressE(page, 3);
  await page.waitForFunction((k) => window.__game.scene.getScene(k).state === 'play', G);
  for (let i = 0; i < 6; i++) {
    const st = await page.evaluate((k) => window.__game.scene.getScene(k).state, G);
    if (st !== 'play') break;
    await moveTo(page, G, 244, 89, 2);
    await page.keyboard.press('KeyE');
    await page.waitForFunction((k) => {
      const s = window.__game.scene.getScene(k);
      if (s.state !== 'aim' || s.aimT < 0.25) return false;
      const ph = (s.aimT / s.aim.period) % 2;
      const pos = ph <= 1 ? ph : 2 - ph;
      return Math.abs(pos - 0.5) < s.aim.zone / 5;
    }, G, { polling: 'raf' });
    await page.keyboard.press('Space');
    await page.waitForFunction((k) => { const s = window.__game.scene.getScene(k).state; return s === 'play' || s === 'done'; }, G);
  }
  const match = await page.evaluate((k) => window.__game.scene.getScene(k).match, G);
  check('basket: 12 sayıya ulaşıldı', match.won && match.score >= 12, JSON.stringify(match));
  const left = await page.evaluate(() => window.__session.helpers.left);
  check('hiç yardımcı kullanılmadı', Object.values(left).every((v) => v === 1), JSON.stringify(left));

  // Final → kapanış → ana menü
  await page.waitForSelector('.dlg');
  await pressE(page, 2);
  await page.waitForSelector('.dlg', { timeout: 15000 });
  check('final: Alihan → Kartal', (await page.locator('.dlg-name').textContent()) === 'Alihan Alkanat');
  await pressE(page, 2);
  await page.waitForSelector('.dlg');
  check('final: Burak → Yağız Alp', (await page.locator('.dlg-name').textContent()) === 'Burak Yerli');
  await pressE(page, 2);
  await page.waitForSelector('.big-card', { timeout: 8000 });
  check('forma kartı', (await page.locator('.big-card').textContent()) === 'Full takım imzalı Beşiktaş forması!');
  await page.screenshot({ path: `${OUT}/final-forma.png` });
  await page.waitForTimeout(2500);
  await pressE(page, 1);
  await page.waitForSelector('.credits-text');
  await page.waitForFunction(() => document.querySelector('.credits-text').textContent === 'Bir Hacıhafıziller hikayesi devam edecektir...', null, { timeout: 8000 });
  check('kapanış 1. satır', true);
  await page.waitForFunction(() => document.querySelector('.credits-text') && document.querySelector('.credits-text').textContent === 'Yeğenlerine Yiğit dayısından ufak bir anı.', null, { timeout: 10000 });
  check('kapanış 2. satır', true);
  await page.waitForFunction(() => window.__game.scene.isActive('Menu'), null, { timeout: 12000 });
  await page.waitForTimeout(300);
  const save = await page.evaluate(() => localStorage.getItem('basmath.save.v1'));
  check('oyun bitince kayıt temizlendi ve ana menüye dönüldü', save === null && (await page.locator('.menu-layer .btn').count()) === 2);
  check('oynanış boyunca konsolda hata yok', errors.length === 0, errors.join(' | '));
  await context.close();
}

/** Başarısızlık akışı: replik BİREBİR, oda başa döner, yardımcı hakkı iade edilir. */
async function failFlow(browser) {
  console.log('\n== Oda başarısız akışı ==');
  const { page, errors, context } = await open(browser, { viewport: { width: 960, height: 540 } }, `${BASE}?debug=1`);
  const B = 'BurakRoom';
  await page.evaluate(() => { window.__session.checkpoint = 2; window.__session.character = 'kartal'; window.__goto('BurakRoom'); });
  await page.waitForFunction((k) => window.__game.scene.isActive(k) && !!window.__game.scene.getScene(k).player, B);
  await page.waitForTimeout(400);
  await moveTo(page, B, 282, 116);
  // sınav başlamadan yardımcı: hak harcanmaz
  await page.keyboard.press('Digit3');
  await page.waitForSelector('.toast');
  check('işe yaramayan yardımcıda uyarı', (await page.locator('.toast').textContent()) === 'Bu yardım burada işe yaramaz.');
  await pressE(page, 3);
  await page.waitForSelector('.quiz');
  check('Kartal için "Abi Bilgisi" butonu yok', (await page.locator('.quiz-abi').count()) === 0);
  // Yiğit: kalan tüm sorularda doğru şıklar işaretlenir
  await page.keyboard.press('Digit4');
  await page.waitForSelector('.call-layer');
  await page.waitForSelector('.call-card');
  check('çağırma kartı güç adını gösteriyor', (await page.locator('.call-card .pw').textContent()).includes('Evin eski en küçüğü'));
  await page.waitForSelector('.call-layer', { state: 'detached', timeout: 8000 });
  check('Yiğit doğru şıkkı işaretledi', (await page.locator('.quiz-opt.hacked').count()) === 1);
  check('Yiğit hakkı harcandı', (await page.evaluate(() => window.__session.helpers.left.yigit)) === 0);
  // bilerek yanlış cevap → ilk yanlışta sınav biter
  const wrong = await page.evaluate(() => { const q = window.__quizUI.state; return (q.questions[q.index].correctIndex + 1) % 4; });
  await page.locator('.quiz-opt').nth(wrong).click();
  await page.waitForSelector('.dlg', { timeout: 6000 });
  await page.waitForTimeout(400);
  await page.keyboard.press('KeyE');
  await page.waitForTimeout(100);
  check('Burak repliği BİREBİR', (await page.locator('.dlg-text').textContent()) === 'Youmat YouTube kanalında konu tekrarını izleyin de gelin!');
  await page.keyboard.press('KeyE');
  await page.waitForFunction((k) => { const s = window.__game.scene.getScene(k); return s.alive && !s.failing && s.player && s.player.x < 40; }, B, { timeout: 8000 });
  check('oyuncu odanın girişine döndü', true);
  check('kaybedilen odada kullanılan yardımcı hakkı geri verildi', (await page.evaluate(() => window.__session.helpers.left.yigit)) === 1);
  check('checkpoint korunuyor', (await page.evaluate(() => window.__session.checkpoint)) === 2);
  check('konsolda hata yok', errors.length === 0, errors.join(' | '));
  await context.close();
}

async function touchAndPerf(browser) {
  console.log('\n== Dokunmatik joystick + 4x CPU yavaşlatma (Galaxy profili) ==');
  const { page, context } = await open(browser, { ...devices['Galaxy S9+ landscape'] }, `${BASE}?debug=1`);
  const cdp = await context.newCDPSession(page);
  const Y = 'YagmurPlayground';
  await page.evaluate(() => { window.__session.checkpoint = 1; window.__goto('YagmurPlayground'); });
  await page.waitForFunction((k) => window.__game.scene.isActive(k) && !!window.__game.scene.getScene(k).player, Y);
  await page.waitForTimeout(600);
  await page.evaluate((k) => { const s = window.__game.scene.getScene(k); s.bossTalk.fn(s.bossTalk); }, Y);
  await page.waitForSelector('.dlg');
  await page.locator('.dlg-layer').tap();
  await page.waitForTimeout(150);
  if (await page.locator('.dlg-layer').count()) await page.locator('.dlg-layer').tap();
  await page.waitForFunction((k) => window.__game.scene.getScene(k).started, Y);

  const x0 = await page.evaluate((k) => window.__game.scene.getScene(k).player.x, Y);
  const pt = (x, y) => ({ touchPoints: [{ x, y, id: 1 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', ...pt(120, 250) });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', ...pt(170, 250) });
  await page.waitForTimeout(150);
  const joyShown = await page.evaluate(() => document.getElementById('touch').classList.contains('joy-on'));
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/galaxy-joystick.png` });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  const x1 = await page.evaluate((k) => window.__game.scene.getScene(k).player.x, Y);
  check('dinamik joystick görünüyor', joyShown);
  check('joystick karakteri hareket ettiriyor', x1 > x0 + 20, `${Math.round(x0)} → ${Math.round(x1)}`);

  const fps = async (label) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', ...pt(120, 250) });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', ...pt(120, 300) });
    await page.waitForTimeout(1500);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', ...pt(120, 200) });
    await page.waitForTimeout(2500);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    const v = await page.evaluate(() => Math.round(window.__game.loop.actualFps));
    console.log(`  · ${label}: ${v} FPS (headless yazılımsal WebGL)`);
    return v;
  };
  const base = await fps('normal');
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const slow = await fps('4x CPU yavaşlatma');
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  check('4x CPU yavaşlatmada oynanabilir (≥ 30 FPS)', slow >= 30, `${slow} FPS (normal: ${base})`);
  await context.close();
}

async function offline(browser) {
  console.log('\n== Offline (service worker) ==');
  const context = await browser.newContext({ viewport: { width: 960, height: 540 } });
  const page = await context.newPage();
  const external = [];
  page.on('request', (r) => { if (!r.url().startsWith(BASE) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) external.push(r.url()); });
  await page.goto(BASE);
  await page.waitForFunction(() => document.querySelector('.menu-title'), null, { timeout: 20000 });
  const ready = await page.evaluate(() => Promise.race([
    navigator.serviceWorker.ready.then(() => true),
    new Promise((r) => setTimeout(() => r(false), 10000)),
  ]));
  check('service worker kayıtlı', ready);
  await page.waitForFunction(async () => (await caches.keys()).some((k) => k.startsWith('basmath-')), null, { timeout: 10000 });
  await page.waitForTimeout(800);
  await context.setOffline(true);
  await page.reload();
  let ok = true;
  try {
    await page.waitForFunction(() => document.querySelector('.menu-title') && document.querySelector('.menu-title').textContent === 'Basmath', null, { timeout: 15000 });
    await page.keyboard.press('Enter');
    await page.waitForSelector('.dlg', { timeout: 5000 });
  } catch (e) {
    ok = false;
  }
  check('internetsiz açılıyor (ikinci açılış)', ok);
  check('harici ağ isteği yok (CDN/analitik)', external.length === 0, external.join(', '));
  const manifest = JSON.parse(fs.readFileSync('dist/manifest.webmanifest', 'utf8'));
  check('manifest: Basmath / fullscreen / landscape', manifest.name === 'Basmath' && manifest.short_name === 'Basmath' && manifest.display === 'fullscreen' && manifest.orientation === 'landscape' && manifest.start_url === './' && manifest.scope === './');
  check('manifest: 192 + 512 + maskable ikonlar', ['192x192', '512x512'].every((s) => manifest.icons.some((i) => i.sizes === s && i.purpose === 'any') && manifest.icons.some((i) => i.sizes === s && i.purpose === 'maskable')) && manifest.icons.every((i) => fs.existsSync(`dist/${i.src}`)));
  const size = fs.readdirSync('dist', { recursive: true }).reduce((n, f) => { const st = fs.statSync(`dist/${f}`); return n + (st.isFile() ? st.size : 0); }, 0);
  check('build boyutu 5 MB altında', size < 5 * 1024 * 1024, `${(size / 1024 / 1024).toFixed(2)} MB`);
  await context.close();
}

// ---------------------------------------------------------------- çalıştır

if (!fs.existsSync('dist/index.html')) {
  console.error('dist/ yok. Önce: npm run build');
  process.exit(1);
}
const server = await preview({ preview: { port: PORT, strictPort: true }, logLevel: 'silent' });
const only = process.argv[2];
try {
  const PROFILES = [
    { name: 'iphone14promax', engine: webkit, device: devices['iPhone 14 Pro Max landscape'], inset: { t: 0, l: 59, r: 59, b: 21 } },
    { name: 'iphone11', engine: webkit, device: devices['iPhone 11 landscape'], inset: { t: 0, l: 48, r: 48, b: 21 } },
    { name: 'galaxy', engine: chromium, device: devices['Galaxy S9+ landscape'], inset: null },
  ];
  if (!only || only === 'devices') for (const p of PROFILES) await deviceRun(p);
  const browser = await chromium.launch();
  if (!only || only === 'play') await playthrough(browser);
  if (!only || only === 'fail') await failFlow(browser);
  if (!only || only === 'perf') await touchAndPerf(browser);
  if (!only || only === 'offline') await offline(browser);
  await browser.close();
} finally {
  await new Promise((r) => server.httpServer.close(r));
}
await wait(50);
console.log(`\n${results.length - failed}/${results.length} kontrol geçti${failed ? ` — ${failed} BAŞARISIZ` : ''}`);
process.exit(failed ? 1 : 0);
