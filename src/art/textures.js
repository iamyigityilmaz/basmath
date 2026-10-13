// Üretilen piksel matrislerini bir kez Phaser texture'ına ve (arayüz için) data URL'ye çevirir.
import { pixToCanvas } from './pix.js';
import { CHARS } from './palette.js';
import { buildSheet, buildPortrait, buildIcon, DIRS } from './characters.js';
import { PROPS, TOY_IDS, buildToy, buildSmallToy, buildJersey } from './props.js';
import { ROOMS } from './rooms.js';

/** Arayüzde kullanılan görseller: IMG.portrait.gulben, IMG.icon.kadir, IMG.toy.eagle ... */
export const IMG = { portrait: {}, icon: {}, toy: {}, misc: {} };

export function addPix(scene, key, pix) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  return scene.textures.addCanvas(key, pixToCanvas(pix));
}

export function pixURL(pix) {
  return pixToCanvas(pix).toDataURL('image/png');
}

/** Eşyalar, oyuncaklar ve forma. */
export function generateProps(scene) {
  Object.keys(PROPS).forEach((key) => addPix(scene, key, PROPS[key]()));
  TOY_IDS.forEach((id) => {
    IMG.toy[id] = pixURL(buildToy(id));
    addPix(scene, `toy_${id}`, buildSmallToy(id));
  });
  IMG.misc.jersey = pixURL(buildJersey());
}

/** Oda arka planı ilk girişte üretilir, sonra önbellekten kullanılır. */
export function ensureRoomTexture(scene, key) {
  if (!scene.textures.exists(key)) scene.textures.addCanvas(key, pixToCanvas(ROOMS[key]()));
}

export function generateCharacters(scene) {
  Object.keys(CHARS).forEach((id) => {
    const { sheet, fw, fh } = buildSheet(id);
    const tex = addPix(scene, `ch_${id}`, sheet);
    DIRS.forEach((dir, row) => {
      for (let f = 0; f < 3; f++) tex.add(`${dir}${f}`, 0, f * fw, row * fh, fw, fh);
    });
    IMG.portrait[id] = pixURL(buildPortrait(id));
    IMG.icon[id] = pixURL(buildIcon(id));
  });
}
