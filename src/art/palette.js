// Ortak renk paleti ve karakter tanımları.
export const PAL = {
  outline: '#1a1423',
  eye: '#2a1f2d',
  white: '#fff8ee',
  blush: '#f29a8a',
  mouth: '#a8473f',
};

// Gövde şablonları. `big` yalnızca Alihan içindir: geniş omuzlu, atletik (şişman değil).
export const BODY = {
  child: { headW: 10, headH: 9, torsoW: 8, torsoH: 5, legH: 3, armW: 1, shoulder: 0 },
  adult: { headW: 10, headH: 9, torsoW: 8, torsoH: 8, legH: 6, armW: 1, shoulder: 0 },
  big: { headW: 10, headH: 10, torsoW: 12, torsoH: 11, legH: 9, armW: 2, shoulder: 2 },
};

/**
 * Parametrik karakterler. Ten, saç, saç modeli, üst ve alt kıyafet renkleri değişebilir.
 * hairStyle: short | long | bun | buzz
 * hairShine: (isteğe bağlı) parlama rengi; siyah saç kontura karışmasın diye birkaç ek parlama pikseli çizilir
 */
export const CHARS = {
  kartal: {
    name: 'Kartal', body: 'child', legH: 3, kid: true,
    skin: '#f4c89d', hair: '#7a4a28', hairStyle: 'short',
    top: '#f08a24', pants: '#2f3b66', shoes: '#fff8ee', sleeve: 'short', bg: '#3c5a8a',
  },
  yagiz: {
    name: 'Yağız Alp', body: 'child', legH: 4, kid: true,
    skin: '#f6cfa6', hair: '#2f2433', hairStyle: 'short',
    top: '#3f7fd6', pants: '#4a4a5c', shoes: '#d94b4b', sleeve: 'short', bg: '#7a4a6a',
  },
  gulben: {
    name: 'Gülben Yerli', body: 'adult',
    skin: '#f6cfa6', hair: '#8a3b2a', hairStyle: 'long',
    top: '#3fa66b', pants: '#2e6e4a', shoes: '#5a3a2a', sleeve: 'long', skirt: 3, blush: true,
    prop: 'notebook', bg: '#c9825a',
  },
  yagmur: {
    name: 'Yağmur Alkanat', body: 'adult',
    skin: '#f4c89d', hair: '#211d27', hairShine: '#625c70', hairStyle: 'bun',
    top: '#9a5fd0', pants: '#6a3fa0', shoes: '#fff8ee', sleeve: 'long', skirt: 3, blush: true,
    bg: '#4aa3a0',
  },
  burak: {
    name: 'Burak Yerli', body: 'adult', torsoW: 10,
    skin: '#eebf94', hair: '#3a2a22', hairStyle: 'short', beard: '#3a2a22', glasses: true,
    top: '#2f5d8c', pants: '#3b3b46', shoes: '#2a2228', sleeve: 'long', bg: '#4a6a4a',
  },
  alihan: {
    name: 'Alihan Alkanat', body: 'big',
    skin: '#e8b98a', hair: '#1f1a22', hairStyle: 'buzz',
    top: '#2a2732', pants: '#2a2732', shoes: '#fff8ee', sleeve: 'long', zip: '#fff8ee',
    prop: 'whistle', bg: '#b8632e',
  },
  gulnur: {
    name: 'Gülnur Teyze', body: 'adult',
    skin: '#f6cfa6', hair: '#5a2e3a', hairStyle: 'bun',
    top: '#e0559a', pants: '#a83a72', shoes: '#fff8ee', sleeve: 'long', skirt: 3, blush: true,
    prop: 'aura', bg: '#5a3a8a',
  },
  omerhan: {
    name: 'Ömerhan Özgüven', body: 'adult', torsoW: 10,
    skin: '#eebf94', hair: '#4a3628', hairStyle: 'short', mustache: '#4a3628',
    top: '#5d8a3f', pants: '#4a4036', shoes: '#2a2228', sleeve: 'long',
    prop: 'flashlight', bg: '#2a3350',
  },
  kadir: {
    name: 'Kadir Özçelik', body: 'adult', torsoW: 10,
    skin: '#e8b98a', hair: '#2a2a30', hairStyle: 'short',
    top: '#3cc0c9', pants: '#33506a', shoes: '#fff8ee', sleeve: 'short',
    prop: 'ball', bg: '#2f7fb0',
  },
  yigit: {
    name: 'Yiğit Yılmaz', body: 'adult', torsoW: 10,
    skin: '#f4c89d', hair: '#2f2433', hairStyle: 'short', glasses: true,
    top: '#34343f', pants: '#2a2a33', shoes: '#58d66b', sleeve: 'long', zip: '#58d66b',
    prop: 'laptop', bg: '#0f1a14',
  },
};

export const HELPER_IDS = ['gulnur', 'omerhan', 'kadir', 'yigit'];
