// Parametrik karakter üretici: palet + piksel matrisi → yürüme kareleri, portre, ikon.
import { Pix, shade } from './pix.js';
import { PAL, BODY, CHARS } from './palette.js';

export const DIRS = ['d', 'u', 'l', 'r'];

export function charDims(spec) {
  const b = { ...BODY[spec.body] };
  if (spec.torsoW) b.torsoW = spec.torsoW;
  if (spec.legH) b.legH = spec.legH;
  const bodyW = b.torsoW + 2 * b.shoulder + 2 * b.armW;
  let fw = Math.max(b.headW, bodyW) + 4;
  fw += fw % 2;
  if (fw < 16) fw = 16;
  const bun = spec.hairStyle === 'bun' ? 2 : 0;
  const fh = b.headH + b.torsoH + b.legH + 3 + bun;
  return { b, fw, fh };
}

function cutCorners(P, x, y, w, h) {
  P.set(x, y, null).set(x + w - 1, y, null).set(x, y + h - 1, null).set(x + w - 1, y + h - 1, null);
}

/** Tek bir yürüme karesi. dir: d/u/l/r, f: 0 duruş, 1-2 adım. */
export function buildFrame(spec, dir, f) {
  const { b, fw, fh } = charDims(spec);
  const P = new Pix(fw, fh);
  const cx = fw / 2;
  const yB = fh - 2;
  const legTop = yB - b.legH + 1;
  const torsoTop = legTop - b.torsoH;
  const headTop = torsoTop - b.headH;
  const topD = shade(spec.top, -0.22);
  const pantsD = shade(spec.pants, -0.25);
  const skinD = shade(spec.skin, -0.16);
  const hairL = spec.hairShine || shade(spec.hair, 0.25);
  const legCol = spec.skirt ? spec.skin : spec.pants;
  const hx = cx - b.headW / 2;
  const ey = headTop + b.headH - 4;
  const legW = b.torsoW / 2 - 1;
  const hs = spec.hairStyle;
  const glassFrame = '#20202a';
  const lens = '#bfe3ff';

  if (dir === 'd' || dir === 'u') {
    // bacaklar
    for (let side = -1; side <= 1; side += 2) {
      const x0 = side < 0 ? cx - legW - 1 : cx + 1;
      const lift = (f === 1 && side < 0) || (f === 2 && side > 0) ? 1 : 0;
      P.rect(x0, legTop, legW, b.legH - lift, legCol);
      P.rect(x0, yB - lift, legW, 1, spec.shoes);
    }
    // gövde (big şablonda omuzlar geniş, bel dar: V biçimi)
    for (let i = 0; i < b.torsoH; i++) {
      let half = b.torsoW / 2;
      if (b.shoulder) {
        if (i < 4) half += b.shoulder;
        else if (i < 7) half += 1;
      }
      const waist = i === b.torsoH - 1 && !spec.skirt;
      P.rect(cx - half, torsoTop + i, half * 2, 1, waist ? pantsD : spec.top);
    }
    if (spec.skirt) {
      P.rect(cx - b.torsoW / 2, legTop, b.torsoW, spec.skirt, spec.pants);
      P.rect(cx - b.torsoW / 2 - 1, legTop + spec.skirt - 1, b.torsoW + 2, 1, pantsD);
    }
    if (spec.zip && dir === 'd') P.rect(cx - 1, torsoTop + 1, 2, b.torsoH - 2, spec.zip);
    // kollar
    for (let side = -1; side <= 1; side += 2) {
      const x0 = side < 0 ? cx - b.torsoW / 2 - b.shoulder - b.armW : cx + b.torsoW / 2 + b.shoulder;
      const swing = (f === 1 && side < 0) || (f === 2 && side > 0) ? -1 : 0;
      const len = b.torsoH - 1 + swing;
      const sleeve = spec.sleeve === 'short' ? 2 : len - 1;
      P.rect(x0, torsoTop, b.armW, sleeve, topD);
      P.rect(x0, torsoTop + sleeve, b.armW, len - sleeve, spec.skin);
    }
    // baş
    P.rect(hx, headTop, b.headW, b.headH, spec.skin);
    cutCorners(P, hx, headTop, b.headW, b.headH);
    if (dir === 'd') {
      const eh = spec.kid ? 2 : 1;
      P.rect(cx - 3, ey - eh + 1, 1, eh, PAL.eye);
      P.rect(cx + 2, ey - eh + 1, 1, eh, PAL.eye);
      if (spec.blush || spec.kid) {
        P.set(cx - 4, ey + 1, PAL.blush);
        P.set(cx + 3, ey + 1, PAL.blush);
      }
      if (spec.beard) {
        P.rect(hx, ey + 1, 2, 1, spec.beard);
        P.rect(hx + b.headW - 2, ey + 1, 2, 1, spec.beard);
        P.rect(hx, ey + 2, b.headW, headTop + b.headH - ey - 2, spec.beard);
        cutCorners(P, hx, headTop, b.headW, b.headH);
        P.rect(cx - 1, ey + 2, 2, 1, skinD);
      }
      if (spec.mustache) P.rect(cx - 2, ey + 2, 4, 1, spec.mustache);
      if (spec.glasses) {
        P.rect(cx - 4, ey, 8, 1, glassFrame);
        P.set(cx - 3, ey, lens);
        P.set(cx + 2, ey, lens);
      }
      // ön saç
      const rows = hs === 'buzz' ? 2 : 3;
      P.rect(hx, headTop, b.headW, rows, spec.hair);
      cutCorners(P, hx, headTop, b.headW, b.headH);
      P.set(hx, headTop + rows, spec.hair);
      P.set(hx + b.headW - 1, headTop + rows, spec.hair);
      if (hs !== 'buzz') P.rect(cx - 2, headTop + 1, 3, 1, hairL);
      if (hs === 'long') {
        P.rect(hx, headTop + 3, 1, b.headH - 3, spec.hair);
        P.rect(hx + b.headW - 1, headTop + 3, 1, b.headH - 3, spec.hair);
        P.rect(hx, torsoTop, 2, 3, spec.hair);
        P.rect(hx + b.headW - 2, torsoTop, 2, 3, spec.hair);
      }
      if (hs === 'bun') {
        P.rect(cx - 2, headTop - 2, 4, 2, spec.hair);
        P.set(cx - 1, headTop - 2, hairL);
        P.set(hx, headTop + 4, spec.hair);
        P.set(hx + b.headW - 1, headTop + 4, spec.hair);
      }
      if (spec.hairShine) {
        P.set(hx + 1, headTop + 1, hairL);
        P.set(hx + b.headW - 3, headTop + 2, hairL);
      }
      if (spec.prop === 'notebook') {
        P.rect(cx + b.torsoW / 2 - 1, torsoTop + 4, 3, 3, PAL.white);
        P.rect(cx + b.torsoW / 2 - 1, torsoTop + 4, 3, 1, '#c94f4f');
      }
      if (spec.prop === 'whistle') {
        P.set(cx - 3, torsoTop + 3, '#ffcf4a');
        P.set(cx - 4, torsoTop + 3, '#ffcf4a');
      }
    } else {
      // arkadan saç
      if (hs === 'buzz') {
        P.rect(hx, headTop, b.headW, b.headH - 4, spec.hair);
      } else {
        P.rect(hx, headTop, b.headW, b.headH - (hs === 'long' ? 0 : 1), spec.hair);
        P.rect(cx - 2, headTop + 1, 3, 1, hairL);
      }
      cutCorners(P, hx, headTop, b.headW, b.headH);
      if (hs === 'long') P.rect(hx + 1, torsoTop, b.headW - 2, 4, spec.hair);
      if (hs === 'bun') {
        P.rect(cx - 2, headTop - 2, 4, 3, spec.hair);
        P.set(cx - 1, headTop - 2, hairL);
      }
      if (spec.hairShine) {
        P.set(hx + 2, headTop + 4, hairL);
        P.set(hx + b.headW - 3, headTop + 3, hairL);
        P.set(hx + b.headW - 3, headTop + 5, hairL);
      }
    }
  } else {
    // yandan (sağa bakan); sol yön aynalanır
    const wS = legW + 1;
    const x0 = cx - Math.floor(wS / 2);
    const farCol = spec.skirt ? skinD : pantsD;
    if (f === 0) {
      P.rect(x0, legTop, wS, b.legH, legCol);
      P.rect(x0, yB, wS + 1, 1, spec.shoes);
    } else {
      const xf = f === 1 ? x0 - 2 : x0 + 2;
      const xn = f === 1 ? x0 + 2 : x0 - 1;
      P.rect(xf, legTop, legW, b.legH - 1, farCol);
      P.rect(xf, yB - 1, legW + 1, 1, shade(spec.shoes, -0.2));
      P.rect(xn, legTop, legW, b.legH, legCol);
      P.rect(xn, yB, legW + 1, 1, spec.shoes);
    }
    const tS = b.torsoW - 2;
    for (let i = 0; i < b.torsoH; i++) {
      const chest = b.shoulder && i < 6 ? 1 : 0;
      const waist = i === b.torsoH - 1 && !spec.skirt;
      P.rect(cx - tS / 2, torsoTop + i, tS + chest, 1, waist ? pantsD : spec.top);
    }
    if (spec.skirt) {
      P.rect(cx - tS / 2, legTop, tS, spec.skirt, spec.pants);
      P.rect(cx - tS / 2 - 1, legTop + spec.skirt - 1, tS + 2, 1, pantsD);
    }
    const aw = Math.max(2, b.armW);
    const ax = cx - aw / 2 + (f === 1 ? -1 : f === 2 ? 1 : 0);
    const len = b.torsoH - 1;
    const sleeve = spec.sleeve === 'short' ? 2 : len - 1;
    P.rect(ax, torsoTop + 1, aw, sleeve, topD);
    P.rect(ax, torsoTop + 1 + sleeve, aw, len - sleeve, spec.skin);
    const hxS = hx + 1;
    P.rect(hxS, headTop, b.headW, b.headH, spec.skin);
    cutCorners(P, hxS, headTop, b.headW, b.headH);
    const eh = spec.kid ? 2 : 1;
    P.rect(hxS + b.headW - 3, ey - eh + 1, 1, eh, PAL.eye);
    if (spec.blush || spec.kid) P.set(hxS + b.headW - 4, ey + 1, PAL.blush);
    if (spec.beard) {
      P.rect(hxS + b.headW - 6, ey + 2, 6, headTop + b.headH - ey - 2, spec.beard);
      P.rect(hxS + b.headW - 7, ey, 2, 3, spec.beard);
      cutCorners(P, hxS, headTop, b.headW, b.headH);
    }
    if (spec.mustache) P.rect(hxS + b.headW - 3, ey + 2, 3, 1, spec.mustache);
    if (spec.glasses) {
      P.rect(hxS + b.headW - 6, ey, 6, 1, glassFrame);
      P.set(hxS + b.headW - 3, ey, lens);
    }
    const rows = hs === 'buzz' ? 2 : 3;
    P.rect(hxS, headTop, b.headW, rows, spec.hair);
    cutCorners(P, hxS, headTop, b.headW, b.headH);
    if (hs === 'buzz') P.rect(hxS, headTop + 2, 3, 2, spec.hair);
    else P.rect(hxS, headTop + 3, 4, 2, spec.hair);
    if (hs !== 'buzz') P.rect(hxS + 3, headTop + 1, 3, 1, hairL);
    if (hs === 'long') P.rect(hxS, headTop + 5, 4, b.headH - 5 + 4, spec.hair);
    if (hs === 'bun') {
      P.rect(hxS - 1, headTop, 3, 3, spec.hair);
      P.rect(hxS + 2, headTop - 1, 3, 1, spec.hair);
    }
    if (spec.hairShine) {
      P.set(hxS, headTop + 1, hairL);
      P.set(hxS + 1, headTop + 3, hairL);
    }
    if (spec.prop === 'notebook') {
      P.rect(cx + 1, torsoTop + 4, 3, 3, PAL.white);
      P.rect(cx + 1, torsoTop + 4, 3, 1, '#c94f4f');
    }
  }

  P.outline(PAL.outline);
  return dir === 'l' ? P.flipX() : P;
}

/** 3 sütun (kare) × 4 satır (d,u,l,r) yürüme sayfası. */
export function buildSheet(id) {
  const spec = CHARS[id];
  const { fw, fh } = charDims(spec);
  const sheet = new Pix(fw * 3, fh * 4);
  DIRS.forEach((dir, row) => {
    const src = dir === 'l' ? 'r' : dir;
    for (let f = 0; f < 3; f++) {
      const fr = buildFrame(spec, src, f);
      sheet.blit(dir === 'l' ? fr.flipX() : fr, f * fw, row * fh);
    }
  });
  return { sheet, fw, fh };
}

// ---------------------------------------------------------------- portreler

function hash(x, y) {
  let n = (x * 374761393 + y * 668265263) | 0;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}

function sparkle(P, x, y, c) {
  P.rect(x - 2, y, 5, 1, c);
  P.rect(x, y - 2, 1, 5, c);
  P.set(x, y, '#ffffff');
}

function drawBackdrop(P, s) {
  const bg = s.bg;
  // hafif alt-üst geçiş
  P.map((c, x, y) => (y > 30 ? shade(bg, -0.12) : y < 10 ? shade(bg, 0.08) : undefined));
  if (s.prop === 'aura') {
    P.ellipse(24, 23, 24, 24, '#8a5ac0');
    P.ellipse(24, 23, 20, 21, '#c78ad8');
    P.ellipse(24, 23, 17, 18, '#ffe9a0');
    sparkle(P, 5, 7, '#ffe36e');
    sparkle(P, 42, 6, '#ffe36e');
    sparkle(P, 43, 28, '#ffe36e');
    sparkle(P, 4, 30, '#ffe36e');
  }
  if (s.prop === 'flashlight') {
    P.poly([33, 34, 41, 34, 48, 2, 22, 0], '#5b6070');
    P.poly([35, 34, 39, 34, 44, 0, 30, 0], '#8f8f78');
    for (let i = 0; i < 9; i++) P.set(3 + ((i * 7) % 17), 3 + ((i * 11) % 19), '#fff8ee');
  }
  if (s.prop === 'ball') {
    const bub = [[7, 8, 4], [41, 7, 5], [6, 27, 3], [43, 22, 3], [14, 3, 2]];
    bub.forEach(([x, y, r]) => {
      P.ring(x, y, r, r, '#d7f4ff');
      P.set(x - Math.ceil(r / 2), y - Math.ceil(r / 2), '#ffffff');
    });
  }
  if (s.prop === 'laptop') {
    for (let x = 2; x < 48; x += 4) {
      const off = Math.floor(hash(x, 1) * 12);
      for (let y = 0; y < 48; y += 2) {
        const h = hash(x, y + off);
        if (h > 0.45) P.rect(x, y, 2, 1, h > 0.85 ? '#b8ffc8' : h > 0.65 ? '#58d66b' : '#1f6b38');
      }
    }
  }
}

function drawProp(P, s, sy) {
  if (s.prop === 'notebook') {
    P.rect(30, 32, 15, 15, PAL.outline);
    P.rect(31, 33, 13, 13, PAL.white);
    P.rect(31, 33, 2, 13, '#c94f4f');
    for (let y = 36; y < 45; y += 3) P.rect(35, y, 7, 1, '#8fa3b8');
    P.rect(28, 41, 5, 5, s.skin);
    P.rect(28, 40, 4, 1, shade(s.skin, -0.16));
  }
  if (s.prop === 'whistle') {
    P.line(15, sy + 1, 23, sy + 6, '#d94b4b');
    P.line(32, sy + 1, 24, sy + 6, '#d94b4b');
    P.rect(20, sy + 6, 7, 4, PAL.outline);
    P.rect(21, sy + 7, 5, 3, '#ffcf4a');
    P.rect(26, sy + 7, 3, 2, '#ffcf4a');
    P.set(23, sy + 8, '#8a6a1a');
  }
  if (s.prop === 'flashlight') {
    P.rect(34, 38, 6, 10, '#7c8290');
    P.rect(34, 41, 6, 1, '#4a4f5c');
    P.rect(32, 35, 10, 4, '#c9ced9');
    P.rect(33, 34, 8, 1, '#ffe36e');
    P.rect(31, 42, 4, 5, s.skin);
  }
  if (s.prop === 'ball') {
    P.ellipse(37.5, 39.5, 7.5, 7.5, PAL.outline);
    P.ellipse(37.5, 39.5, 6.5, 6.5, '#e8792b');
    P.rect(37, 33, 1, 13, '#8a3b12');
    P.rect(31, 39, 13, 1, '#8a3b12');
    P.set(34, 36, '#ffb070');
    P.set(35, 35, '#ffb070');
  }
  if (s.prop === 'laptop') {
    P.rect(7, 35, 34, 13, PAL.outline);
    P.rect(8, 36, 32, 12, '#4a4a5c');
    P.rect(8, 36, 32, 1, '#6a6a80');
    P.rect(22, 41, 4, 2, '#58d66b');
  }
}

/** 48×48 diyalog portresi. */
export function buildPortrait(id) {
  const s = CHARS[id];
  const P = new Pix(48, 48, s.bg);
  const kid = !!s.kid;
  const big = s.body === 'big';
  const skinD = shade(s.skin, -0.16);
  const hairD = shade(s.hair, -0.3);
  const hairL = s.hairShine || shade(s.hair, 0.25);
  const topD = shade(s.top, -0.22);
  const cx = 24;
  const cy = kid ? 25 : big ? 20 : 22;
  const rx = kid ? 12 : big ? 12.5 : 11;
  const ry = kid ? 11 : big ? 13 : 12;
  const sy = kid ? 40 : big ? 37 : 38; // omuzların üstü
  const sw = kid ? 15 : big ? 25 : 18;
  const hs = s.hairStyle;

  drawBackdrop(P, s);

  // arkadaki saç
  if (hs === 'long') {
    P.ellipse(cx, cy, rx + 3, ry + 3, s.hair);
    P.rect(cx - rx - 3, cy, rx * 2 + 6, 24, s.hair);
  }
  if (hs === 'bun') {
    P.ellipse(cx, cy - ry - 2, 6.5, 5.5, PAL.outline);
    P.ellipse(cx, cy - ry - 2, 5.5, 4.5, s.hair);
    P.rect(cx - 3, cy - ry - 5, 4, 1, hairL);
  }

  // omuzlar + boyun
  P.ellipse(cx, sy + 14, sw + 1, 15, PAL.outline);
  P.ellipse(cx, sy + 14, sw, 14, s.top);
  P.ellipse(cx, sy + 18, sw - 4, 14, topD, (x, y) => y > sy + 7 && (x < cx - sw + 7 || x > cx + sw - 8));
  const nw = big ? 7 : kid ? 4 : 5;
  P.rect(cx - nw, cy + ry - 4, nw * 2, sy - (cy + ry - 4) + 3, skinD);
  P.poly([cx - nw - 2, sy, cx, sy + 7, cx + nw + 2, sy], skinD);
  if (s.zip) P.rect(cx - 1, sy + 6, 2, 12, s.zip);
  if (hs === 'long') {
    P.ellipse(cx - rx - 1, sy + 1, 3.5, 6, s.hair);
    P.ellipse(cx + rx + 1, sy + 1, 3.5, 6, s.hair);
  }

  // kulaklar + baş
  P.ellipse(cx - rx - 0.5, cy + 1, 3, 4, PAL.outline);
  P.ellipse(cx + rx + 0.5, cy + 1, 3, 4, PAL.outline);
  P.ellipse(cx, cy, rx + 1, ry + 1, PAL.outline);
  P.ellipse(cx - rx - 0.5, cy + 1, 2, 3, skinD);
  P.ellipse(cx + rx + 0.5, cy + 1, 2, 3, skinD);
  P.ellipse(cx, cy, rx, ry, s.skin);

  const ey = cy + 1;
  const my = ey + (kid ? 6 : 7);

  // sakal
  if (s.beard) {
    P.ellipse(cx, cy, rx, ry, s.beard, (x, y) => y >= ey + 4);
    P.ellipse(cx, cy, rx, ry, s.beard, (x, y) => y >= ey + 1 && (x < cx - rx + 3 || x > cx + rx - 4));
    P.rect(cx - 4, my - 1, 8, 3, s.skin);
    P.rect(cx - 5, my - 2, 10, 1, s.beard);
  }

  // saç
  const hairTest = (x, y) => {
    const ax = Math.abs(x + 0.5 - cx);
    let line;
    if (hs === 'buzz') line = cy - ry * 0.5 + ax * 0.08;
    else if (hs === 'short') line = cy - ry * 0.42 + (x - cx) * 0.14;
    else line = cy - ry * 0.72 + ax * 0.5;
    return y < line;
  };
  P.ellipse(cx, cy - 0.5, rx + 1.2, ry + 1.5, s.hair, hairTest);
  if (hs === 'short' || hs === 'buzz') {
    P.rect(cx - rx, cy - 5, 2, hs === 'buzz' ? 4 : 6, s.hair);
    P.rect(cx + rx - 2, cy - 5, 2, hs === 'buzz' ? 4 : 6, s.hair);
  }
  if (hs !== 'buzz') {
    P.line(cx - 6, cy - ry + 3, cx - 1, cy - ry + 1, hairL);
    P.line(cx, cy - ry + 1, cx + 3, cy - ry + 2, hairL);
  }
  if (s.hairShine) {
    P.line(cx + 5, cy - ry + 2, cx + 8, cy - ry + 4, hairL);
    P.line(cx - 9, cy - ry + 5, cx - 7, cy - ry + 3, hairL);
    if (hs === 'bun') P.rect(cx + 1, cy - ry - 3, 2, 1, hairL);
  }

  // gözler ve kaşlar
  const ew = kid ? 3 : 2;
  const eh = kid ? 4 : 3;
  const exL = cx - 4 - ew;
  const exR = cx + 4;
  P.rect(exL, ey - eh + 2, ew, eh, PAL.eye);
  P.rect(exR, ey - eh + 2, ew, eh, PAL.eye);
  P.set(exL, ey - eh + 2, '#ffffff');
  P.set(exR, ey - eh + 2, '#ffffff');
  P.rect(exL - 1, ey - eh - 1, ew + 2, 1, hairD);
  P.rect(exR - 1, ey - eh - 1, ew + 2, 1, hairD);
  if (s.glasses) {
    const gf = '#20202a';
    for (const gx of [exL - 2, exR - 2]) {
      P.rect(gx, ey - 3, 7, 1, gf);
      P.rect(gx, ey + 3, 7, 1, gf);
      P.rect(gx, ey - 3, 1, 7, gf);
      P.rect(gx + 6, ey - 3, 1, 7, gf);
    }
    P.rect(cx - 2, ey - 1, 4, 1, gf);
  }

  // burun, yanak, ağız
  P.rect(cx - 1, ey + 3, 2, 1, skinD);
  if (s.blush || kid) {
    P.rect(exL - 2, ey + 3, 3, 1, PAL.blush);
    P.rect(exR + ew - 1, ey + 3, 3, 1, PAL.blush);
  }
  if (s.mustache) {
    P.rect(cx - 5, my - 2, 10, 2, s.mustache);
    P.set(cx - 6, my - 1, s.mustache);
    P.set(cx + 5, my - 1, s.mustache);
    P.rect(cx - 2, my + 1, 4, 1, PAL.mouth);
  } else if (kid) {
    P.rect(cx - 3, my, 6, 2, PAL.mouth);
    P.rect(cx - 2, my, 4, 1, '#ffffff');
    P.set(cx - 4, my - 1, PAL.mouth);
    P.set(cx + 3, my - 1, PAL.mouth);
  } else {
    P.rect(cx - 3, my, 6, 1, PAL.mouth);
    P.set(cx - 4, my - 1, PAL.mouth);
    P.set(cx + 3, my - 1, PAL.mouth);
  }

  drawProp(P, s, sy);
  return P;
}

/** 24×24 alt bar ikonu: karakterin yüzü (2× büyütülmüş) + güç simgesi. */
export function buildIcon(id) {
  const s = CHARS[id];
  const { b, fw, fh } = charDims(s);
  const fr = buildFrame(s, 'd', 0);
  const yB = fh - 2;
  const headTop = yB - b.legH + 1 - b.torsoH - b.headH;
  const top = s.hairStyle === 'bun' ? headTop - 3 : headTop - 1;
  const face = fr.crop(fw / 2 - 6, top, 12, 12).scaled(2);
  const P = new Pix(24, 24, s.bg);
  P.blit(face, 0, 0);
  if (s.prop === 'aura') {
    sparkle(P, 20, 4, '#ffe36e');
    sparkle(P, 3, 19, '#ffe36e');
  }
  if (s.prop === 'flashlight') {
    P.rect(18, 18, 4, 6, '#7c8290');
    P.rect(17, 15, 6, 3, '#c9ced9');
    P.rect(17, 14, 6, 1, '#ffe36e');
  }
  if (s.prop === 'ball') {
    P.ellipse(19.5, 19.5, 4, 4, PAL.outline);
    P.ellipse(19.5, 19.5, 3, 3, '#e8792b');
    P.ring(3, 3, 2.5, 2.5, '#d7f4ff');
  }
  if (s.prop === 'laptop') {
    P.rect(14, 17, 10, 7, PAL.outline);
    P.rect(15, 18, 8, 5, '#103a1e');
    P.rect(16, 19, 3, 1, '#58d66b');
    P.rect(17, 21, 5, 1, '#58d66b');
  }
  return P;
}
