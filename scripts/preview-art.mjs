// Geliştirme yardımcısı: üretilen pikselleri PNG olarak döker. Kullanım: node scripts/preview-art.mjs <hangi> <çıktı.png> [ölçek]
import { Pix, pixToRGBA } from '../src/art/pix.js';
import { writePixPNG } from './png.mjs';

const [which = 'chars', out = 'preview.png', scale = '4'] = process.argv.slice(2);
let P;
if (which === 'chars') {
  const { buildSheet, buildPortrait, buildIcon } = await import('../src/art/characters.js');
  const { CHARS } = await import('../src/art/palette.js');
  const ids = Object.keys(CHARS);
  P = new Pix(ids.length * 76, 230, '#6a8a5a');
  ids.forEach((id, i) => {
    const { sheet } = buildSheet(id);
    P.blit(sheet, i * 76 + 2, 2);
    P.blit(buildPortrait(id), i * 76 + 2, 140);
    P.blit(buildIcon(id), i * 76 + 2, 196);
  });
} else {
  const mod = await import('../src/art/props.js');
  const fn = mod.PREVIEW[which];
  P = fn();
}
writePixPNG(out, P.scaled(Number(scale)), pixToRGBA);
console.log('yazıldı', out, P.w, P.h);
