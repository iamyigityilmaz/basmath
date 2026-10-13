// Eşyalar, oyuncaklar, forma ve küçük efekt görselleri (palet + piksel matrisi).
import { Pix, shade } from './pix.js';
import { PAL } from './palette.js';

const O = PAL.outline;

function hash(x, y) {
  let n = (x * 374761393 + y * 668265263) | 0;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}

// ------------------------------------------------------------------ küçük parçalar

function shadow() {
  const P = new Pix(12, 5);
  P.rect(2, 0, 8, 5, '#000000');
  P.rect(0, 1, 12, 3, '#000000');
  return P;
}

function bang() {
  const P = new Pix(11, 14);
  P.rect(1, 0, 9, 11, '#ffe36e');
  P.rect(0, 1, 11, 9, '#ffe36e');
  P.rect(4, 11, 3, 1, '#ffe36e');
  P.rect(5, 12, 1, 1, '#ffe36e');
  P.rect(5, 2, 1, 5, '#d9342b');
  P.rect(4, 2, 3, 3, '#d9342b');
  P.rect(5, 8, 1, 1, '#d9342b');
  return P.outline(O);
}

function marker() {
  const P = new Pix(9, 9);
  P.rect(4, 0, 1, 9, '#ffe36e');
  P.rect(0, 4, 9, 1, '#ffe36e');
  P.rect(3, 3, 3, 3, '#fff8ee');
  P.set(2, 2, '#ffcf4a').set(6, 2, '#ffcf4a').set(2, 6, '#ffcf4a').set(6, 6, '#ffcf4a');
  return P;
}

function ball() {
  const P = new Pix(9, 9);
  P.ellipse(4.5, 4.5, 3.6, 3.6, '#e8792b');
  P.rect(4, 1, 1, 7, '#8a3b12');
  P.rect(1, 4, 7, 1, '#8a3b12');
  P.set(2, 2, '#ffb070').set(3, 2, '#ffb070');
  return P.outline(O);
}

function ballShadow() {
  const P = new Pix(8, 4);
  P.rect(1, 0, 6, 4, '#000000');
  P.rect(0, 1, 8, 2, '#000000');
  return P;
}

function doorV() {
  const P = new Pix(8, 34);
  P.rect(1, 1, 6, 32, '#8a5a34');
  P.rect(2, 3, 4, 12, '#a06c40');
  P.rect(2, 18, 4, 12, '#a06c40');
  P.rect(2, 16, 2, 2, '#ffcf4a');
  return P.outline(O);
}

function sparkleFx() {
  const P = new Pix(5, 5);
  P.rect(2, 0, 1, 5, '#fff8ee');
  P.rect(0, 2, 5, 1, '#fff8ee');
  return P;
}

function confetti() {
  const P = new Pix(3, 3, '#ffffff');
  return P;
}

// ------------------------------------------------------------------ salon / çalışma odası

function sofa() {
  const P = new Pix(66, 28);
  const c = '#c2532f';
  P.rect(1, 1, 64, 13, shade(c, -0.15));
  P.rect(3, 3, 60, 4, shade(c, 0.1));
  P.rect(1, 12, 64, 11, c);
  P.rect(7, 13, 52, 8, shade(c, 0.18));
  P.rect(32, 13, 1, 8, shade(c, -0.1));
  P.rect(1, 8, 7, 16, shade(c, -0.28));
  P.rect(58, 8, 7, 16, shade(c, -0.28));
  P.rect(1, 23, 64, 3, shade(c, -0.4));
  P.rect(12, 9, 9, 7, '#ffcf4a');
  P.rect(45, 9, 9, 7, '#4aa3a0');
  return P.outline(O);
}

function table() {
  const P = new Pix(50, 30);
  const c = '#b9804a';
  P.rect(4, 18, 3, 10, shade(c, -0.4));
  P.rect(43, 18, 3, 10, shade(c, -0.4));
  P.rect(1, 1, 48, 17, c);
  P.rect(1, 1, 48, 2, shade(c, 0.2));
  P.rect(1, 16, 48, 3, shade(c, -0.25));
  for (let x = 6; x < 46; x += 11) P.rect(x, 4, 1, 11, shade(c, -0.1));
  P.ellipse(15, 9, 5, 4, '#fff8ee');
  P.ellipse(15, 9, 3, 2, '#e8d9c0');
  P.rect(30, 5, 8, 7, '#3fa66b');
  P.rect(31, 6, 6, 5, '#fff8ee');
  return P.outline(O);
}

function plant() {
  const P = new Pix(16, 24);
  P.rect(4, 15, 8, 7, '#b8632e');
  P.rect(3, 14, 10, 2, '#d47a3c');
  P.rect(5, 21, 6, 2, '#8a4420');
  P.ellipse(8, 8, 4, 6, '#2e8a4a');
  P.ellipse(4, 9, 3, 4, '#3fa66b');
  P.ellipse(12, 9, 3, 4, '#3fa66b');
  P.ellipse(8, 5, 2.5, 3.5, '#58c878');
  return P.outline(O);
}

function bookshelf() {
  const P = new Pix(36, 34);
  const c = '#7a4a28';
  P.rect(1, 1, 34, 32, c);
  P.rect(3, 3, 30, 28, shade(c, -0.45));
  const cols = ['#d94b4b', '#3f7fd6', '#ffcf4a', '#3fa66b', '#9a5fd0', '#fff8ee', '#f08a24'];
  for (let s = 0; s < 3; s++) {
    const y = 3 + s * 10;
    let x = 4;
    let i = 0;
    while (x < 31) {
      const w = 2 + Math.floor(hash(s, i) * 2);
      const h = 6 + Math.floor(hash(i, s + 9) * 3);
      P.rect(x, y + 8 - h, w, h, cols[Math.floor(hash(s * 7, i * 3) * cols.length)]);
      x += w + (hash(i, s) > 0.8 ? 2 : 1);
      i++;
    }
    P.rect(3, y + 8, 30, 2, c);
  }
  return P.outline(O);
}

function desk() {
  const P = new Pix(58, 28);
  const c = '#8a5a34';
  P.rect(1, 1, 56, 14, shade(c, 0.18));
  P.rect(1, 1, 56, 2, shade(c, 0.32));
  P.rect(1, 15, 56, 12, c);
  P.rect(4, 17, 20, 8, shade(c, -0.2));
  P.rect(34, 17, 20, 8, shade(c, -0.2));
  P.rect(12, 20, 4, 1, '#ffcf4a');
  P.rect(42, 20, 4, 1, '#ffcf4a');
  // defter + kalemlik
  P.rect(8, 4, 12, 8, '#fff8ee');
  P.rect(10, 6, 8, 1, '#8fa3b8');
  P.rect(10, 8, 6, 1, '#8fa3b8');
  P.rect(26, 3, 5, 8, '#3f7fd6');
  P.rect(27, 1, 1, 3, '#d94b4b');
  P.rect(29, 1, 1, 3, '#ffcf4a');
  // küre
  P.rect(44, 11, 6, 2, '#4a4036');
  P.ellipse(47, 6, 4.5, 4.5, '#3f8fd6');
  P.rect(45, 4, 3, 2, '#58c878');
  P.rect(47, 7, 3, 2, '#58c878');
  return P.outline(O);
}

// ------------------------------------------------------------------ oyun alanı

function slide() {
  const P = new Pix(52, 34);
  // merdiven
  P.rect(1, 6, 2, 24, '#8fa3b8');
  P.rect(9, 6, 2, 24, '#8fa3b8');
  for (let y = 9; y < 30; y += 5) P.rect(3, y, 6, 2, '#c9d4e0');
  // platform
  P.rect(11, 3, 14, 16, '#d94b4b');
  P.rect(11, 3, 14, 3, '#f07a6a');
  P.rect(11, 19, 3, 12, '#8a2f2f');
  P.rect(22, 19, 3, 12, '#8a2f2f');
  // kaydırak
  P.poly([25, 5, 50, 20, 50, 31, 25, 17], '#ffcf4a');
  P.poly([25, 5, 50, 20, 50, 22, 25, 7], '#fff0a0');
  P.poly([25, 15, 50, 29, 50, 31, 25, 17], '#c9962a');
  return P.outline(O);
}

function tent() {
  const P = new Pix(38, 32);
  P.poly([19, 1, 37, 30, 1, 30], '#3f7fd6');
  for (let i = 0; i < 4; i++) {
    const x = 5 + i * 9;
    P.poly([19, 1, x + 5, 30, x, 30], i % 2 ? '#fff8ee' : '#ffcf4a');
  }
  P.poly([19, 11, 26, 30, 12, 30], '#2a2038');
  P.rect(18, 0, 2, 3, '#d94b4b');
  return P.outline(O);
}

function ballpool() {
  const P = new Pix(48, 34);
  P.rect(3, 1, 42, 32, '#3f8fd6');
  P.rect(1, 3, 46, 28, '#3f8fd6');
  P.rect(3, 1, 42, 3, '#7ab8f0');
  P.rect(5, 5, 38, 24, '#1f4f80');
  const cols = ['#d94b4b', '#ffcf4a', '#58c878', '#f08a24', '#e0559a', '#fff8ee'];
  for (let y = 5; y < 28; y += 3) {
    for (let x = 5; x < 42; x += 3) {
      const ox = (y / 3) % 2 ? 1 : 0;
      const c = cols[Math.floor(hash(x, y) * cols.length)];
      P.rect(x + ox, y, 3, 3, c);
      P.set(x + ox, y, shade(c, 0.4));
      P.set(x + ox + 2, y + 2, shade(c, -0.3));
    }
  }
  P.rect(43, 5, 2, 24, '#2a6aa8');
  P.rect(3, 29, 42, 4, '#2a6aa8');
  return P.outline(O);
}

function chest() {
  const P = new Pix(22, 18);
  const c = '#8a5a34';
  P.rect(1, 7, 20, 10, c);
  P.rect(1, 1, 20, 7, shade(c, 0.22));
  P.rect(2, 1, 18, 2, shade(c, 0.4));
  P.rect(1, 7, 20, 1, shade(c, -0.4));
  P.rect(4, 1, 2, 16, '#ffcf4a');
  P.rect(16, 1, 2, 16, '#ffcf4a');
  P.rect(9, 6, 4, 4, '#ffcf4a');
  P.rect(10, 7, 2, 2, O);
  return P.outline(O);
}

function box() {
  const P = new Pix(18, 16);
  const c = '#c9a26b';
  P.rect(1, 5, 16, 10, c);
  P.poly([1, 5, 4, 1, 9, 1, 9, 5], shade(c, 0.2));
  P.poly([9, 5, 9, 1, 14, 1, 17, 5], shade(c, 0.1));
  P.rect(1, 5, 16, 1, shade(c, -0.3));
  P.rect(8, 5, 2, 10, '#e8d9c0');
  P.rect(3, 9, 3, 3, shade(c, -0.25));
  return P.outline(O);
}

function wardrobe() {
  const P = new Pix(28, 36);
  const c = '#e0559a';
  P.rect(1, 1, 26, 34, c);
  P.rect(1, 1, 26, 3, shade(c, 0.3));
  P.rect(3, 6, 10, 24, shade(c, 0.15));
  P.rect(15, 6, 10, 24, shade(c, 0.15));
  P.rect(11, 17, 1, 3, '#fff8ee');
  P.rect(16, 17, 1, 3, '#fff8ee');
  P.rect(1, 31, 26, 4, shade(c, -0.3));
  P.set(8, 10, '#ffcf4a').set(20, 10, '#ffcf4a');
  return P.outline(O);
}

function toyshelf() {
  const P = new Pix(44, 32);
  const c = '#f08a24';
  P.rect(1, 1, 42, 30, c);
  P.rect(3, 3, 38, 12, shade(c, -0.45));
  P.rect(3, 17, 38, 12, shade(c, -0.45));
  const cols = ['#d94b4b', '#3f7fd6', '#ffcf4a', '#58c878', '#9a5fd0'];
  for (let i = 0; i < 6; i++) {
    P.rect(5 + i * 6, 9, 5, 6, cols[i % 5]);
    P.rect(5 + i * 6, 9, 5, 1, shade(cols[i % 5], 0.4));
    P.ellipse(7.5 + i * 6, 25, 2.5, 3, cols[(i + 2) % 5]);
  }
  return P.outline(O);
}

// ------------------------------------------------------------------ basket salonu

function hoop() {
  const P = new Pix(40, 26);
  P.rect(4, 1, 32, 5, '#fff8ee');
  P.rect(14, 2, 12, 3, '#d94b4b');
  P.rect(15, 3, 10, 1, '#fff8ee');
  P.rect(19, 6, 2, 3, '#8a8f9c');
  for (let y = 9; y < 22; y++) {
    for (let x = 12; x < 28; x++) {
      const dx = (x + 0.5 - 20) / 7;
      const dy = (y + 0.5 - 15) / 6;
      if (dx * dx + dy * dy < 0.8 && (x + y) % 2 === 0) P.set(x, y, '#e8e4dc');
    }
  }
  P.ring(20, 15, 8, 7, '#f0642a', 1.6);
  return P.outline(O);
}

// ------------------------------------------------------------------ forma

/** Düz siyah-beyaz dikey çizgili forma. Arma/logo/sponsor yok; birkaç keçeli kalem imzası var. */
function jersey() {
  const P = new Pix(40, 40);
  const body = (x, y) => {
    if (y < 3) return false;
    // kollar
    if (y < 16 && (x < 9 || x > 30)) {
      const sx = x < 9 ? x : 39 - x;
      return y >= 5 + (8 - sx) * 0.6 && y <= 14 - (8 - sx) * 0.2 && sx >= 1;
    }
    if (x < 8 || x > 31) return false;
    // yaka
    const dx = Math.abs(x + 0.5 - 20);
    if (y < 8 && dx < 5 - (y - 3) * 0.9) return false;
    return y <= 37;
  };
  for (let y = 0; y < 40; y++) {
    for (let x = 0; x < 40; x++) {
      if (!body(x, y)) continue;
      const stripe = Math.floor((x - 8) / 4) % 2 === 0;
      P.set(x, y, stripe ? '#1c1a22' : '#fff8ee');
    }
  }
  // kol ve etek biyeleri
  P.map((c, x, y) => (c && y === 37 ? '#1c1a22' : undefined));
  // keçeli kalem imzaları
  const ink = '#2f5fd0';
  const silver = '#c9d4e0';
  const scribble = (x, y, col, seed) => {
    let px = x;
    let py = y;
    for (let i = 0; i < 9; i++) {
      const nx = px + 1;
      const ny = y + Math.round(Math.sin(i * 1.7 + seed) * 2);
      P.line(px, py, nx, ny, col);
      px = nx;
      py = ny;
    }
  };
  scribble(10, 13, ink, 1);
  scribble(21, 17, silver, 2.2);
  scribble(11, 24, silver, 0.4);
  scribble(22, 28, ink, 3.1);
  scribble(13, 33, ink, 5);
  P.map((c, x, y) => (c && !body(x, y) ? null : undefined));
  return P.outline(O);
}

// ------------------------------------------------------------------ oyuncaklar (32×32)

function toyBase() {
  return new Pix(32, 32);
}

const TOYS = {
  // Kartal oyuncağı: açık kanatlar, kıvrık sarı gaga, kahverengi gövde, beyaz baş.
  eagle() {
    const P = toyBase();
    const br = '#7a4a28';
    const brD = '#5a3418';
    const brL = '#9a6238';
    // kanatlar
    P.poly([14, 12, 1, 6, 0, 14, 2, 20, 6, 22, 14, 20], br);
    P.poly([18, 12, 31, 6, 32, 14, 30, 20, 26, 22, 18, 20], br);
    for (let i = 0; i < 5; i++) {
      P.rect(1 + i * 3, 17 + (i % 2), 2, 5, brD);
      P.rect(29 - i * 3, 17 + (i % 2), 2, 5, brD);
    }
    P.line(2, 8, 13, 13, brL);
    P.line(29, 8, 18, 13, brL);
    // kuyruk + gövde
    P.poly([12, 24, 20, 24, 22, 30, 10, 30], brD);
    P.rect(13, 28, 1, 2, '#fff8ee');
    P.rect(16, 28, 1, 2, '#fff8ee');
    P.rect(19, 28, 1, 2, '#fff8ee');
    P.ellipse(16, 18, 5, 8, br);
    P.ellipse(16, 19, 3, 5, brL);
    // pençeler
    P.rect(13, 25, 2, 2, '#ffcf4a');
    P.rect(17, 25, 2, 2, '#ffcf4a');
    // beyaz baş
    P.ellipse(16, 8, 4.5, 4.5, '#fff8ee');
    P.rect(12, 10, 8, 3, '#fff8ee');
    P.set(14, 7, O).set(18, 7, O);
    P.rect(13, 6, 2, 1, brD);
    P.rect(17, 6, 2, 1, brD);
    // kıvrık sarı gaga
    P.rect(15, 8, 3, 2, '#ffcf4a');
    P.rect(15, 10, 2, 2, '#ffcf4a');
    P.set(15, 12, '#e0a020');
    P.set(17, 10, '#e0a020');
    return P.outline(O);
  },
  owl() {
    const P = toyBase();
    const c = '#8a7560';
    P.poly([8, 6, 11, 2, 13, 7], c);
    P.poly([24, 6, 21, 2, 19, 7], c);
    P.ellipse(16, 17, 10, 12, c);
    P.ellipse(16, 21, 6, 7, '#d9c7a8');
    for (let y = 17; y < 27; y += 3) for (let x = 12; x < 21; x += 3) P.set(x + ((y / 3) % 2 | 0), y, c);
    P.ellipse(7, 18, 2.5, 7, shade(c, -0.25));
    P.ellipse(25, 18, 2.5, 7, shade(c, -0.25));
    P.ellipse(12, 11, 4, 4, '#fff8ee');
    P.ellipse(20, 11, 4, 4, '#fff8ee');
    P.ellipse(12, 11, 2, 2, O);
    P.ellipse(20, 11, 2, 2, O);
    P.poly([15, 13, 17, 13, 16, 16], '#f08a24');
    P.rect(12, 28, 3, 2, '#f08a24');
    P.rect(17, 28, 3, 2, '#f08a24');
    return P.outline(O);
  },
  parrot() {
    const P = toyBase();
    P.poly([15, 22, 19, 22, 20, 31, 14, 31], '#3f7fd6');
    P.ellipse(16, 17, 6, 8, '#3fbf5a');
    P.ellipse(19, 18, 3, 6, '#3f7fd6');
    P.ellipse(19, 19, 2, 4, '#ffcf4a');
    P.ellipse(15, 8, 5, 5, '#d94b4b');
    P.ellipse(13, 8, 2, 2, '#fff8ee');
    P.set(13, 8, O);
    P.rect(9, 8, 3, 3, '#4a4036');
    P.rect(9, 11, 2, 1, '#4a4036');
    P.rect(13, 25, 2, 2, '#8a8f9c');
    P.rect(17, 25, 2, 2, '#8a8f9c');
    return P.outline(O);
  },
  duck() {
    const P = toyBase();
    const c = '#ffd84a';
    P.ellipse(15, 20, 10, 7, c);
    P.poly([4, 16, 2, 12, 8, 17], c);
    P.ellipse(13, 21, 5, 3, shade(c, -0.18));
    P.ellipse(21, 11, 5.5, 5.5, c);
    P.set(23, 10, O);
    P.rect(26, 11, 5, 3, '#f08a24');
    P.rect(26, 13, 4, 1, '#c9661a');
    P.rect(12, 27, 3, 2, '#f08a24');
    P.rect(17, 27, 3, 2, '#f08a24');
    return P.outline(O);
  },
  chicken() {
    const P = toyBase();
    const c = '#fff8ee';
    P.ellipse(14, 20, 9, 7, c);
    P.poly([5, 17, 2, 10, 9, 15], c);
    P.ellipse(12, 21, 5, 3, '#e8d9c0');
    P.ellipse(21, 11, 5, 5, c);
    P.rect(19, 4, 2, 3, '#d94b4b');
    P.rect(21, 3, 2, 4, '#d94b4b');
    P.rect(23, 5, 2, 2, '#d94b4b');
    P.set(23, 10, O);
    P.poly([26, 10, 30, 12, 26, 13], '#ffcf4a');
    P.rect(24, 14, 2, 3, '#d94b4b');
    P.rect(11, 27, 1, 3, '#f08a24');
    P.rect(16, 27, 1, 3, '#f08a24');
    P.rect(10, 30, 4, 1, '#f08a24');
    P.rect(15, 30, 4, 1, '#f08a24');
    return P.outline(O);
  },
  penguin() {
    const P = toyBase();
    const c = '#2a2a38';
    P.ellipse(16, 17, 9, 12, c);
    P.ellipse(16, 20, 6, 9, '#fff8ee');
    P.ellipse(6, 18, 2, 6, c);
    P.ellipse(26, 18, 2, 6, c);
    P.ellipse(13, 10, 2, 2, '#fff8ee');
    P.ellipse(19, 10, 2, 2, '#fff8ee');
    P.set(13, 10, O).set(19, 10, O);
    P.poly([14, 12, 18, 12, 16, 15], '#f08a24');
    P.rect(10, 28, 5, 2, '#f08a24');
    P.rect(17, 28, 5, 2, '#f08a24');
    return P.outline(O);
  },
  pigeon() {
    const P = toyBase();
    const c = '#9aa3b4';
    P.ellipse(14, 19, 10, 7, c);
    P.poly([4, 18, 0, 22, 8, 23], shade(c, -0.3));
    P.ellipse(12, 20, 6, 4, shade(c, -0.15));
    P.rect(8, 19, 9, 1, '#4a5062');
    P.rect(9, 22, 8, 1, '#4a5062');
    P.ellipse(22, 14, 3, 4, '#5a9a7a');
    P.ellipse(22, 9, 4, 4, c);
    P.set(23, 8, '#f08a24');
    P.rect(26, 9, 3, 2, '#4a4036');
    P.rect(12, 26, 1, 3, '#e07a8a');
    P.rect(17, 26, 1, 3, '#e07a8a');
    P.rect(11, 29, 3, 1, '#e07a8a');
    P.rect(16, 29, 3, 1, '#e07a8a');
    return P.outline(O);
  },
  teddy() {
    const P = toyBase();
    const c = '#b07a48';
    const l = '#e0b888';
    P.ellipse(9, 6, 3, 3, c);
    P.ellipse(23, 6, 3, 3, c);
    P.ellipse(9, 6, 1.5, 1.5, l);
    P.ellipse(23, 6, 1.5, 1.5, l);
    P.ellipse(6, 20, 3, 4, c);
    P.ellipse(26, 20, 3, 4, c);
    P.ellipse(11, 28, 4, 3, c);
    P.ellipse(21, 28, 4, 3, c);
    P.ellipse(16, 21, 8, 8, c);
    P.ellipse(16, 22, 5, 5, l);
    P.ellipse(16, 10, 7.5, 7, c);
    P.ellipse(16, 13, 3.5, 3, l);
    P.set(13, 9, O).set(19, 9, O);
    P.rect(15, 12, 2, 1, O);
    P.set(15, 14, O).set(16, 14, O);
    P.rect(13, 17, 6, 2, '#d94b4b');
    return P.outline(O);
  },
  car() {
    const P = toyBase();
    const c = '#d94b4b';
    P.rect(2, 15, 28, 8, c);
    P.poly([8, 15, 11, 8, 22, 8, 26, 15], c);
    P.rect(2, 15, 28, 2, shade(c, 0.25));
    P.poly([10, 15, 12, 10, 16, 10, 16, 15], '#bfe3ff');
    P.poly([18, 15, 18, 10, 21, 10, 24, 15], '#bfe3ff');
    P.rect(28, 17, 2, 2, '#ffe36e');
    P.rect(2, 21, 28, 2, shade(c, -0.3));
    P.ellipse(9, 23, 4, 4, '#2a2a38');
    P.ellipse(23, 23, 4, 4, '#2a2a38');
    P.ellipse(9, 23, 1.5, 1.5, '#c9d4e0');
    P.ellipse(23, 23, 1.5, 1.5, '#c9d4e0');
    return P.outline(O);
  },
  dino() {
    const P = toyBase();
    const c = '#58c878';
    const d = '#2e8a4a';
    P.poly([10, 20, 0, 26, 1, 28, 12, 25], c);
    P.ellipse(15, 21, 8, 6, c);
    P.rect(18, 8, 5, 12, c);
    P.ellipse(23, 8, 5, 4, c);
    P.rect(25, 9, 4, 3, c);
    P.set(24, 7, O);
    P.rect(26, 11, 3, 1, d);
    P.rect(10, 25, 4, 5, d);
    P.rect(17, 25, 4, 5, d);
    P.ellipse(15, 23, 4, 2.5, '#d8f0a0');
    for (let i = 0; i < 5; i++) P.poly([7 + i * 3, 16 - (i > 3 ? 4 : 0), 9 + i * 3, 12 - (i > 3 ? 4 : 0), 11 + i * 3, 16 - (i > 3 ? 4 : 0)], '#f08a24');
    return P.outline(O);
  },
};

export const TOY_IDS = Object.keys(TOYS);
export const DECOY_IDS = TOY_IDS.filter((id) => id !== 'eagle');

/** Yerde duran küçük oyuncak (32×32'nin yarıya indirilmiş hâli). */
function smallToy(id) {
  const big = TOYS[id]();
  const P = new Pix(16, 16);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      // 2×2 bloğun en çok geçen dolu rengi
      const cs = [big.get(x * 2, y * 2), big.get(x * 2 + 1, y * 2), big.get(x * 2, y * 2 + 1), big.get(x * 2 + 1, y * 2 + 1)].filter((c) => c && c !== O);
      if (cs.length >= 2) P.set(x, y, cs[0]);
    }
  }
  return P.outline(O);
}

/** Phaser texture'ı olacak eşyalar. */
export const PROPS = {
  shadow, bang, marker, ball, ballShadow, doorV, sparkleFx, confetti,
  sofa, table, plant, bookshelf, desk,
  slide, tent, ballpool, chest, box, wardrobe, toyshelf,
  hoop, jersey,
};

export function buildToy(id) {
  return TOYS[id]();
}

export function buildSmallToy(id) {
  return smallToy(id);
}

export function buildJersey() {
  return jersey();
}

// Geliştirme önizlemesi (scripts/preview-art.mjs)
export const PREVIEW = {
  props() {
    const P = new Pix(400, 150, '#6a8a5a');
    let x = 2;
    let y = 2;
    Object.keys(PROPS).forEach((k) => {
      const p = PROPS[k]();
      if (x + p.w > 398) {
        x = 2;
        y += 44;
      }
      P.blit(p, x, y);
      x += p.w + 4;
    });
    return P;
  },
  toys() {
    const P = new Pix(TOY_IDS.length * 34, 54, '#5c7fb5');
    TOY_IDS.forEach((id, i) => {
      P.blit(TOYS[id](), i * 34 + 1, 1);
      P.blit(smallToy(id), i * 34 + 8, 36);
    });
    return P;
  },
};
