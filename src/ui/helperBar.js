// Alt ortadaki yardımcı barı ve "Aranıyor..." çağırma animasyonu.
import { overlay, el } from './overlay.js';
import { input } from '../systems/input.js';
import { audio } from '../systems/audio.js';
import { IMG } from '../art/textures.js';
import { HELPER_IDS } from '../systems/helpers.js';
import { T } from '../data/texts.js';

let layer = null;
let btns = [];
let provider = null;

export const helperBar = {
  /** provider: { status(id) → 'ok'|'useless'|'spent', use(id) } */
  show(p) {
    helperBar.hide();
    provider = p;
    layer = overlay.addLayer('helper-layer');
    const bar = el('div', 'helper-bar');
    btns = HELPER_IDS.map((id, i) => {
      const b = el('button', 'helper-btn');
      b.setAttribute('aria-label', T.helpers[id].name);
      const img = el('img');
      img.src = IMG.icon[id];
      img.alt = '';
      b.append(img, el('span', 'key', String(i + 1)));
      b.addEventListener('click', () => provider && provider.use(id));
      bar.appendChild(b);
      return b;
    });
    layer.appendChild(bar);
    helperBar.refresh();
  },

  hide() {
    if (layer) layer.remove();
    layer = null;
    btns = [];
    provider = null;
  },

  /** İkonların durumunu günceller: işe yaramıyorsa soluk, hakkı bittiyse çarpılı. */
  refresh() {
    if (!layer || !provider) return;
    for (let i = 0; i < btns.length; i++) {
      const st = provider.status(HELPER_IDS[i]);
      const cl = btns[i].classList;
      cl.toggle('ready', st === 'ok');
      cl.toggle('dim', st === 'useless');
      cl.toggle('spent', st === 'spent');
    }
  },

  /** Klavye 1–4 */
  trigger(i) {
    if (provider && HELPER_IDS[i]) provider.use(HELPER_IDS[i]);
  },
};

function rnd(a, b) {
  return a + Math.random() * (b - a);
}

function buildFx(id) {
  const fx = el('div', 'fx');
  if (id === 'gulnur') {
    fx.appendChild(el('span', 'fx-aura'));
    for (let i = 0; i < 14; i++) {
      const s = el('span', 'fx-star', '✦');
      s.style.left = `${rnd(4, 92)}%`;
      s.style.top = `${rnd(6, 86)}%`;
      s.style.animationDelay = `${rnd(0, 0.6)}s`;
      fx.appendChild(s);
    }
  } else if (id === 'yigit') {
    for (let i = 0; i < 24; i++) {
      let str = '';
      for (let k = 0; k < 18; k++) str += Math.random() > 0.5 ? '1' : '0';
      const s = el('span', 'fx-code', str);
      s.style.left = `${i * 4.2 + rnd(0, 1.5)}%`;
      s.style.animationDuration = `${rnd(1.1, 2.2)}s`;
      s.style.animationDelay = `${-rnd(0, 2)}s`;
      fx.appendChild(s);
    }
  } else if (id === 'kadir') {
    for (let i = 0; i < 16; i++) {
      const s = el('span', 'fx-bubble');
      const size = rnd(6, 20);
      s.style.width = `calc(var(--u) * ${size})`;
      s.style.height = `calc(var(--u) * ${size})`;
      s.style.left = `${rnd(2, 94)}%`;
      s.style.animationDuration = `${rnd(1.6, 3)}s`;
      s.style.animationDelay = `${-rnd(0, 2.5)}s`;
      fx.appendChild(s);
    }
  } else if (id === 'omerhan') {
    fx.appendChild(el('span', 'fx-beam'));
  }
  return fx;
}

const FX_SOUND = { gulnur: 'magic', yigit: 'hack', kadir: 'helper', omerhan: 'helper' };

/**
 * Çağırma akışı: "Aranıyor..." → yardımcı ekrana kayarak girer, adını ve güç adını söyler → çıkar.
 * Etki, dönen Promise çözülünce sahne tarafından uygulanır.
 */
export function callAnimation(id) {
  return new Promise((resolve) => {
    const l = overlay.addLayer('call-layer', true);
    const release = input.pushModal(() => true);
    const phone = el('div', 'call-phone');
    phone.append(el('div', 'ph'), el('div', null, T.helpers.calling));
    l.appendChild(phone);
    audio.play('ring');
    audio.vibrate(60);

    overlay.later(() => {
      phone.remove();
      l.appendChild(buildFx(id));
      const card = el('div', 'call-card panel');
      const img = el('img');
      img.src = IMG.portrait[id];
      img.alt = '';
      const txt = el('div');
      txt.append(el('div', 'nm', T.helpers[id].name), el('div', 'pw', `“${T.helpers[id].power}”`));
      card.append(img, txt);
      l.appendChild(card);
      audio.play(FX_SOUND[id]);
      overlay.later(() => {
        card.classList.add('out');
        overlay.later(() => {
          release();
          l.remove();
          resolve();
        }, 360);
      }, 1900);
    }, 1000);
  });
}
