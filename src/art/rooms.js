// Oda arka planları (384×216). Her biri bir kez üretilir ve texture olarak önbelleğe alınır.
import { Pix, shade } from './pix.js';
import { PAL } from './palette.js';

const W = 384;
const H = 216;
const WALL = 30; // üst duvar bandının yüksekliği
const O = PAL.outline;

function hash(x, y) {
  let n = (x * 374761393 + y * 668265263) | 0;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}

// ---- zeminler ----
function floorWood(P, base) {
  for (let y = WALL; y < H; y++) {
    const row = Math.floor((y - WALL) / 9);
    for (let x = 0; x < W; x++) {
      const off = (row % 2) * 24 + row * 7;
      const plank = Math.floor((x + off) / 48);
      let c = shade(base, (hash(row, plank) - 0.5) * 0.16);
      if ((y - WALL) % 9 === 8 || (x + off) % 48 === 0) c = shade(base, -0.28);
      else if (hash(x >> 2, y * 3 + row) > 0.965) c = shade(base, -0.12);
      P.d[y * W + x] = c;
    }
  }
}

function floorTiles(P, size, cols) {
  for (let y = WALL; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const tx = Math.floor(x / size);
      const ty = Math.floor((y - WALL) / size);
      let c = cols[Math.floor(hash(tx, ty) * cols.length)];
      const ix = x % size;
      const iy = (y - WALL) % size;
      if (ix === 0 || iy === 0) c = shade(c, -0.22);
      else if (ix === 1 || iy === 1) c = shade(c, 0.14);
      P.d[y * W + x] = c;
    }
  }
}

function floorCourt(P, base) {
  for (let y = WALL; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const strip = Math.floor(x / 12);
      let c = shade(base, (hash(strip, Math.floor((y + strip * 13) / 40)) - 0.5) * 0.1);
      if (x % 12 === 0) c = shade(base, -0.14);
      P.d[y * W + x] = c;
    }
  }
}

// ---- duvarlar ----
function walls(P, wall, opts) {
  const o = opts || {};
  const dark = shade(wall, -0.45);
  for (let y = 0; y < WALL; y++) {
    for (let x = 0; x < W; x++) {
      let c = wall;
      if (o.stripes && Math.floor(x / 8) % 2 === 0) c = shade(wall, 0.07);
      if (y < 3) c = dark;
      else if (y >= WALL - 5) c = shade(wall, -0.3);
      if (y === WALL - 5) c = shade(wall, 0.25);
      if (y === WALL - 1) c = O;
      P.d[y * W + x] = c;
    }
  }
  // yan ve alt duvarlar (üstten görünüş)
  P.rect(0, 0, 6, H, dark);
  P.rect(W - 6, 0, 6, H, dark);
  P.rect(0, H - 8, W, 8, dark);
  P.rect(5, WALL, 1, H - 8 - WALL, O);
  P.rect(W - 6, WALL, 1, H - 8 - WALL, O);
  P.rect(5, H - 8, W - 10, 1, O);
  P.rect(0, 0, 6, 3, dark);
}

function doorGap(P, side, floorCol, matCol) {
  const y0 = 97;
  const h = 30;
  const x = side === 'l' ? 0 : W - 6;
  P.rect(x, y0, 6, h, shade(floorCol, -0.35));
  P.rect(x, y0 - 2, 6, 2, '#8a5a34');
  P.rect(x, y0 + h, 6, 2, '#8a5a34');
  P.rect(x, y0 - 3, 6, 1, O);
  P.rect(x, y0 + h + 2, 6, 1, O);
  const mx = side === 'l' ? 7 : W - 19;
  P.rect(mx, y0 + 3, 12, h - 6, matCol);
  P.rect(mx, y0 + 3, 12, 1, shade(matCol, -0.3));
  P.rect(mx, y0 + h - 4, 12, 1, shade(matCol, -0.3));
  for (let y = y0 + 6; y < y0 + h - 5; y += 3) P.rect(mx + 2, y, 8, 1, shade(matCol, 0.25));
}

function windowOn(P, x, w) {
  P.rect(x, 5, w, 17, O);
  P.rect(x + 1, 6, w - 2, 15, '#8fd0f0');
  P.rect(x + 1, 6, w - 2, 5, '#bfe8ff');
  P.rect(x + (w >> 1), 6, 1, 15, '#fff8ee');
  P.rect(x + 1, 13, w - 2, 1, '#fff8ee');
  P.rect(x - 1, 22, w + 2, 2, '#fff8ee');
  P.ellipse(x + w * 0.75, 17, 4, 2.5, '#fff8ee');
}

function picture(P, x, y, w, h, c) {
  P.rect(x, y, w, h, '#7a4a28');
  P.rect(x + 1, y + 1, w - 2, h - 2, c);
  P.rect(x + 2, y + h - 4, w - 4, 2, shade(c, -0.3));
  P.set(x + w - 4, y + 3, '#ffe36e');
}

function rug(P, x, y, w, h, c1, c2) {
  P.rect(x, y, w, h, c1);
  P.rect(x + 2, y + 2, w - 4, h - 4, c2);
  P.rect(x + 5, y + 5, w - 10, h - 10, c1);
  for (let i = x + 9; i < x + w - 9; i += 8) {
    P.rect(i, y + (h >> 1) - 2, 4, 4, c2);
    P.rect(i + 1, y + (h >> 1) - 1, 2, 2, shade(c2, 0.35));
  }
  for (let i = y + 1; i < y + h; i += 2) {
    P.set(x - 1, i, c2);
    P.set(x + w, i, c2);
  }
}

// ---- odalar ----
export function roomGulben() {
  const P = new Pix(W, H);
  const floor = '#c99a62';
  floorWood(P, floor);
  walls(P, '#e8c9a0', { stripes: true });
  windowOn(P, 214, 34);
  picture(P, 20, 6, 16, 14, '#4aa3a0');
  picture(P, 270, 5, 22, 16, '#f08a24');
  picture(P, 300, 8, 12, 12, '#9a5fd0');
  rug(P, 196, 86, 120, 62, '#a83a3a', '#e8c070');
  doorGap(P, 'l', floor, '#3fa66b');
  doorGap(P, 'r', floor, '#3fa66b');
  return P;
}

export function roomBurak() {
  const P = new Pix(W, H);
  const floor = '#8a6a4a';
  floorWood(P, floor);
  walls(P, '#6a8aa8', {});
  // yazı tahtası
  P.rect(118, 3, 148, 23, O);
  P.rect(119, 4, 146, 21, '#b9804a');
  P.rect(121, 6, 142, 17, '#2e5a44');
  const chalk = '#e8f0e0';
  // 7 × 8 = 56
  P.line(127, 9, 131, 9, chalk); P.line(131, 9, 128, 15, chalk);
  P.line(135, 11, 138, 14, chalk); P.line(138, 11, 135, 14, chalk);
  P.ring(144, 10.5, 2, 2, chalk); P.ring(144, 14, 2.4, 2.4, chalk);
  P.rect(150, 11, 4, 1, chalk); P.rect(150, 13, 4, 1, chalk);
  P.line(158, 9, 161, 9, chalk); P.line(158, 9, 158, 12, chalk); P.line(158, 12, 161, 12, chalk); P.line(161, 12, 161, 15, chalk); P.line(158, 15, 161, 15, chalk);
  P.ring(166, 13.5, 2.3, 2.3, chalk); P.line(164, 12, 166, 9, chalk);
  // üçgen, kesir, artı
  P.line(184, 16, 196, 16, chalk); P.line(184, 16, 190, 8, chalk); P.line(190, 8, 196, 16, chalk);
  P.rect(206, 12, 7, 1, chalk); P.rect(209, 8, 1, 3, chalk); P.ring(209.5, 16.5, 1.6, 2, chalk);
  P.rect(222, 12, 5, 1, chalk); P.rect(224, 10, 1, 5, chalk);
  P.line(234, 9, 240, 15, '#ffe36e'); P.line(240, 9, 234, 15, '#ffe36e');
  P.line(246, 12, 250, 16, '#8fd0f0'); P.line(250, 16, 257, 8, '#8fd0f0');
  P.rect(124, 23, 136, 2, '#8a5a34');
  P.rect(200, 22, 6, 2, '#fff8ee');
  P.rect(210, 22, 4, 2, '#ffe36e');
  picture(P, 290, 6, 18, 14, '#d94b4b');
  // saat
  P.ellipse(336, 13, 7, 7, O);
  P.ellipse(336, 13, 6, 6, '#fff8ee');
  P.line(336, 13, 336, 9, O);
  P.line(336, 13, 339, 14, '#d94b4b');
  rug(P, 150, 96, 130, 60, '#2f4f7a', '#c9d4e0');
  doorGap(P, 'l', floor, '#2f5d8c');
  doorGap(P, 'r', floor, '#2f5d8c');
  return P;
}

export function roomYagmur() {
  const P = new Pix(W, H);
  floorTiles(P, 24, ['#f6b8c8', '#b8e0f6', '#f6e6a8', '#c0eab8', '#d8c0f0']);
  walls(P, '#8fd0f0', {});
  // duvarda bulutlar, güneş ve bayraklar
  P.ellipse(30, 12, 9, 4, '#fff8ee');
  P.ellipse(37, 9, 6, 4, '#fff8ee');
  P.ellipse(232, 11, 10, 4, '#fff8ee');
  P.ellipse(224, 8, 6, 4, '#fff8ee');
  P.ellipse(352, 10, 6, 6, '#ffe36e');
  const flags = ['#d94b4b', '#ffcf4a', '#58c878', '#9a5fd0', '#f08a24'];
  for (let i = 0; i < 9; i++) {
    const x = 96 + i * 12;
    const y = 4 + Math.round(Math.sin((i / 8) * Math.PI) * 4);
    P.poly([x, y, x + 8, y, x + 4, y + 7], flags[i % flags.length]);
  }
  P.line(94, 4, 150, 8, O);
  P.line(150, 8, 204, 4, O);
  // halılar
  P.ellipse(60, 160, 34, 20, '#f08a24');
  P.ellipse(60, 160, 28, 15, '#ffcf4a');
  P.ellipse(60, 160, 18, 9, '#f08a24');
  rug(P, 300, 70, 56, 40, '#58c878', '#fff8ee');
  doorGap(P, 'l', '#b8e0f6', '#9a5fd0');
  return P;
}

const DIGITS = {
  1: ['.#.', '##.', '.#.', '.#.', '###'],
  2: ['##.', '..#', '.#.', '#..', '###'],
  3: ['##.', '..#', '.#.', '..#', '##.'],
};

function spot(P, x, y, pts) {
  const col = pts === 1 ? '#58c878' : pts === 2 ? '#3f8fd6' : '#d94b4b';
  P.ellipse(x, y, 9, 7, '#fff8ee');
  P.ellipse(x, y, 8, 6, col);
  P.ellipse(x, y, 6, 4.5, shade(col, 0.2));
  const d = DIGITS[pts];
  for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (d[j][i] === '#') P.set(x - 2 + i, y - 3 + j, '#fff8ee');
}

/** Atış noktaları (basket salonu). */
export const GYM = {
  hoop: { x: 192, y: 46 },
  spots: [
    { x: 192, y: 98, pts: 1 },
    { x: 140, y: 86, pts: 2 },
    { x: 244, y: 86, pts: 2 },
    { x: 192, y: 130, pts: 2 },
    { x: 74, y: 58, pts: 3 },
    { x: 310, y: 58, pts: 3 },
    { x: 192, y: 166, pts: 3 },
  ],
};

export function roomAlihan() {
  const P = new Pix(W, H);
  const floor = '#d9a866';
  floorCourt(P, floor);
  // duvar: tribün
  for (let y = 0; y < WALL; y++) {
    for (let x = 0; x < W; x++) {
      const row = Math.floor(y / 6);
      let c = row % 2 ? '#3b4a6a' : '#46587c';
      if (y % 6 === 5) c = '#2a3350';
      P.d[y * W + x] = c;
    }
  }
  const crowd = ['#d94b4b', '#fff8ee', '#ffcf4a', '#3fa66b', '#1c1a22', '#f08a24', '#9a5fd0'];
  for (let r = 0; r < 4; r++) {
    for (let x = 10 + (r % 2) * 4; x < W - 12; x += 8) {
      if (x > 150 && x < 234) continue;
      if (hash(x, r) < 0.25) continue;
      const y = 1 + r * 6;
      P.rect(x, y + 2, 4, 3, crowd[Math.floor(hash(x, r + 5) * crowd.length)]);
      P.rect(x + 1, y, 2, 2, hash(x, r + 9) > 0.5 ? '#f4c89d' : '#e8b98a');
    }
  }
  P.rect(0, WALL - 3, W, 2, '#8a8f9c');
  P.rect(0, WALL - 1, W, 1, O);
  // skor tabelası çerçevesi (pota arkası)
  P.rect(152, 2, 80, 20, O);
  P.rect(153, 3, 78, 18, '#20202a');
  for (let i = 0; i < 6; i++) P.rect(160 + i * 12, 9, 6, 6, i % 2 ? '#d94b4b' : '#ffcf4a');
  const line = '#fff8ee';
  const hx = GYM.hoop.x;
  const hy = GYM.hoop.y;
  // boya alanı
  P.rect(164, WALL, 56, 64, '#c2532f');
  for (let y = WALL; y < 94; y++) for (let x = 164; x < 220; x++) if (x % 12 === 0) P.d[y * W + x] = shade('#c2532f', -0.14);
  P.rect(164, WALL, 1, 64, line);
  P.rect(219, WALL, 1, 64, line);
  P.rect(164, 93, 56, 1, line);
  P.ring(192, 93.5, 28, 22, line, 1.1);
  P.rect(165, WALL, 54, 63, null);
  // (halkayı çizerken silinen boya alanını geri doldur)
  for (let y = WALL; y < 93; y++) {
    for (let x = 165; x < 219; x++) P.d[y * W + x] = x % 12 === 0 ? shade('#c2532f', -0.14) : '#c2532f';
  }
  for (let x = 165; x < 219; x += 4) P.rect(x, 71, 2, 1, line);
  // üçlük çizgisi: köşelerde düz, sonra yay
  const R = 104;
  for (let a = 0; a <= Math.PI; a += 0.004) {
    const x = hx + Math.cos(a) * R;
    const y = hy + Math.sin(a) * R * 0.98;
    if (x < 92 || x > 292) continue;
    P.set(Math.round(x), Math.round(y), line);
  }
  const yJoin = Math.round(hy + Math.sqrt(R * R - 100 * 100) * 0.98);
  P.rect(92, WALL, 1, yJoin - WALL + 1, line);
  P.rect(292, WALL, 1, yJoin - WALL + 1, line);
  // yan ve alt duvarlar
  const dark = '#2a3350';
  P.rect(0, 0, 6, H, dark);
  P.rect(W - 6, 0, 6, H, dark);
  P.rect(0, H - 8, W, 8, dark);
  P.rect(5, WALL, 1, H - 8 - WALL, O);
  P.rect(W - 6, WALL, 1, H - 8 - WALL, O);
  P.rect(5, H - 8, W - 10, 1, O);
  P.rect(6, H - 10, W - 12, 1, line);
  GYM.spots.forEach((s) => spot(P, s.x, s.y, s.pts));
  doorGap(P, 'l', floor, '#1c1a22');
  return P;
}

export function roomMenu() {
  const P = new Pix(W, H);
  // gökyüzü
  for (let y = 0; y < H; y++) {
    const t = y / H;
    const c = t < 0.35 ? '#3c5a9a' : t < 0.55 ? '#5a7fc0' : t < 0.7 ? '#8fb0e0' : '#58a05a';
    P.rect(0, y, W, 1, c);
  }
  for (let i = 0; i < 40; i++) P.set(Math.floor(hash(i, 3) * W), Math.floor(hash(i, 7) * 70), '#fff8ee');
  P.ellipse(60, 40, 22, 8, '#e8f0ff');
  P.ellipse(76, 34, 14, 8, '#e8f0ff');
  P.ellipse(318, 52, 26, 8, '#e8f0ff');
  P.ellipse(300, 46, 14, 8, '#e8f0ff');
  // çimen
  for (let y = 150; y < H; y++) {
    for (let x = 0; x < W; x++) {
      P.d[y * W + x] = hash(x >> 1, y >> 1) > 0.8 ? '#4a904c' : '#58a05a';
    }
  }
  P.rect(0, 150, W, 2, '#3a7a3c');
  // ev
  P.rect(126, 96, 132, 70, O);
  P.rect(127, 97, 130, 68, '#f0d9b0');
  P.poly([114, 98, 192, 52, 270, 98], O);
  P.poly([118, 97, 192, 55, 266, 97], '#c2532f');
  for (let y = 62; y < 97; y += 6) P.line(192 - (y - 55) * 1.76, y, 192 + (y - 55) * 1.76, y, '#a8432a');
  P.rect(180, 126, 24, 39, O);
  P.rect(181, 127, 22, 38, '#8a5a34');
  P.rect(198, 146, 2, 2, '#ffcf4a');
  for (const x of [140, 220]) {
    P.rect(x, 112, 26, 22, O);
    P.rect(x + 1, 113, 24, 20, '#ffe9a0');
    P.rect(x + 12, 113, 1, 20, '#fff8ee');
    P.rect(x + 1, 122, 24, 1, '#fff8ee');
  }
  P.rect(170, 165, 44, 51, '#d8c8a8');
  return P;
}

export const ROOMS = {
  bg_gulben: roomGulben,
  bg_yagmur: roomYagmur,
  bg_burak: roomBurak,
  bg_alihan: roomAlihan,
  bg_menu: roomMenu,
};
