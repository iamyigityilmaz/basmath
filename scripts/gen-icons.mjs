// PWA ikonlarını üretir (pixel art, bağımlılıksız). Çalıştır: npm run icons
import fs from 'node:fs';
import { Pix, pixToRGBA } from '../src/art/pix.js';
import { encodePNG } from './png.mjs';

function icon(n, maskable) {
  const P = new Pix(n, n, '#2b2140');
  const c = n / 2;
  // zemin deseni
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if ((x + y) % 8 === 0) P.set(x, y, '#342850');
  const r = n * (maskable ? 0.27 : 0.34);
  P.ellipse(c, c + 1, r + 1.5, r + 1.5, '#1a1423');
  P.ellipse(c, c + 1, r, r, '#e8792b');
  P.ellipse(c - r * 0.3, c + 1 - r * 0.3, r * 0.45, r * 0.4, '#f59a4a');
  P.rect(Math.round(c - 0.5), Math.round(c + 1 - r), 1, Math.round(r * 2), '#7a3410');
  P.rect(Math.round(c - r), Math.round(c + 0.5), Math.round(r * 2), 1, '#7a3410');
  // matematik işaretleri
  const m = Math.round(n * (maskable ? 0.2 : 0.09));
  const s = Math.max(2, Math.round(n * 0.07));
  const y = '#ffcf4a';
  P.rect(m, m + s, s * 2 + 1, 1, y);
  P.rect(m + s, m, 1, s * 2 + 1, y); // +
  P.rect(n - m - s * 2 - 1, m + s - 1, s * 2 + 1, 1, y);
  P.rect(n - m - s * 2 - 1, m + s + 1, s * 2 + 1, 1, y); // =
  P.line(m, n - m - s * 2 - 1, m + s * 2, n - m - 1, y);
  P.line(m + s * 2, n - m - s * 2 - 1, m, n - m - 1, y); // ×
  P.rect(n - m - s * 2 - 1, n - m - s - 1, s * 2 + 1, 1, y);
  P.set(n - m - s - 1, n - m - s * 2, y);
  P.set(n - m - s - 1, n - m - 2, y); // ÷
  return P;
}

function write(file, art, scale) {
  const p = art.scaled(scale);
  fs.writeFileSync(file, encodePNG(p.w, p.h, pixToRGBA(p)));
  console.log(file, p.w);
}

fs.mkdirSync('public/icons', { recursive: true });
write('public/icons/icon-192.png', icon(32, false), 6);
write('public/icons/icon-512.png', icon(32, false), 16);
write('public/icons/maskable-192.png', icon(32, true), 6);
write('public/icons/maskable-512.png', icon(32, true), 16);
write('public/icons/apple-touch-icon.png', icon(36, false), 5);
