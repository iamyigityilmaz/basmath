// Piksel matrisi: her hücre bir renk ('#rrggbb') ya da null (saydam).
// DOM'dan bağımsızdır; canvas'a çevirme işi `pixToCanvas` içindedir.

export class Pix {
  constructor(w, h, fill) {
    this.w = w;
    this.h = h;
    this.d = new Array(w * h).fill(fill || null);
  }

  get(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    return this.d[y * this.w + x];
  }

  set(x, y, c) {
    x |= 0;
    y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return this;
    this.d[y * this.w + x] = c;
    return this;
  }

  rect(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
    return this;
  }

  /** Dolu elips. Merkez ve yarıçaplar kesirli olabilir. */
  ellipse(cx, cy, rx, ry, c, test) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1 && (!test || test(x, y))) this.set(x, y, c);
      }
    }
    return this;
  }

  /** Elips çerçevesi. */
  ring(cx, cy, rx, ry, c, t) {
    const th = t || 1;
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - cy;
        const o = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
        const irx = Math.max(0.01, rx - th);
        const iry = Math.max(0.01, ry - th);
        const i = (dx * dx) / (irx * irx) + (dy * dy) / (iry * iry);
        if (o <= 1 && i > 1) this.set(x, y, c);
      }
    }
    return this;
  }

  line(x0, y0, x1, y1, c) {
    x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
    return this;
  }

  /** Dolu çokgen: pts = [x0,y0,x1,y1,...] */
  poly(pts, c) {
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 1; i < pts.length; i += 2) {
      minY = Math.min(minY, pts[i]);
      maxY = Math.max(maxY, pts[i]);
    }
    const n = pts.length / 2;
    for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
      const yc = y + 0.5;
      const xs = [];
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const ax = pts[i * 2], ay = pts[i * 2 + 1];
        const bx = pts[j * 2], by = pts[j * 2 + 1];
        if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) {
          xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax));
        }
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) this.set(x, y, c);
      }
    }
    return this;
  }

  /** Başka bir matrisi üzerine basar (saydam hücreler atlanır). */
  blit(src, dx, dy, flipX) {
    for (let y = 0; y < src.h; y++) {
      for (let x = 0; x < src.w; x++) {
        const c = src.d[y * src.w + (flipX ? src.w - 1 - x : x)];
        if (c) this.set(dx + x, dy + y, c);
      }
    }
    return this;
  }

  flipX() {
    const p = new Pix(this.w, this.h);
    p.blit(this, 0, 0, true);
    return p;
  }

  /** Tam sayı katıyla büyütülmüş kopya. */
  scaled(k) {
    const p = new Pix(this.w * k, this.h * k);
    for (let y = 0; y < p.h; y++) {
      for (let x = 0; x < p.w; x++) p.d[y * p.w + x] = this.d[((y / k) | 0) * this.w + ((x / k) | 0)];
    }
    return p;
  }

  crop(x, y, w, h) {
    const p = new Pix(w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) p.d[j * w + i] = this.get(x + i, y + j);
    return p;
  }

  /** Dolu piksellerin çevresine dış çizgi ekler. */
  outline(c) {
    const add = [];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.d[y * this.w + x]) continue;
        if (this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1) || this.get(x, y + 1)) add.push(y * this.w + x);
      }
    }
    for (let i = 0; i < add.length; i++) this.d[add[i]] = c;
    return this;
  }

  /** test(x,y,renk) true dönen dolu hücreleri fn(renk) ile değiştirir. */
  map(fn) {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const i = y * this.w + x;
        const r = fn(this.d[i], x, y);
        if (r !== undefined) this.d[i] = r;
      }
    }
    return this;
  }
}

const rgbCache = new Map();
export function hexToRgb(hex) {
  let v = rgbCache.get(hex);
  if (!v) {
    const n = parseInt(hex.slice(1, 7), 16);
    const a = hex.length >= 9 ? parseInt(hex.slice(7, 9), 16) : 255;
    v = [(n >> 16) & 255, (n >> 8) & 255, n & 255, a];
    rgbCache.set(hex, v);
  }
  return v;
}

/** Rengi koyulaştırır (amt < 0) ya da açar (amt > 0). amt: -1..1 */
export function shade(hex, amt) {
  const [r, g, b] = hexToRgb(hex);
  const t = amt < 0 ? 0 : 255;
  const k = Math.abs(amt);
  const f = (v) => Math.round(v + (t - v) * k).toString(16).padStart(2, '0');
  return `#${f(r)}${f(g)}${f(b)}`;
}

/** RGBA bayt dizisi (PNG/ImageData için). */
export function pixToRGBA(pix) {
  const out = new Uint8ClampedArray(pix.w * pix.h * 4);
  for (let i = 0; i < pix.d.length; i++) {
    const c = pix.d[i];
    if (!c) continue;
    const v = hexToRgb(c);
    out[i * 4] = v[0];
    out[i * 4 + 1] = v[1];
    out[i * 4 + 2] = v[2];
    out[i * 4 + 3] = v[3];
  }
  return out;
}

export function pixToCanvas(pix) {
  const c = document.createElement('canvas');
  c.width = pix.w;
  c.height = pix.h;
  const g = c.getContext('2d');
  const img = g.createImageData(pix.w, pix.h);
  img.data.set(pixToRGBA(pix));
  g.putImageData(img, 0, 0);
  return c;
}
