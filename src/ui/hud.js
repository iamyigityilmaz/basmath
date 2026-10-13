// HUD: görev yazısı, duraklat ve eylem butonu, uyarılar, başlık kartı, büyük kartlar.
import { overlay, el } from './overlay.js';
import { input } from '../systems/input.js';
import { audio } from '../systems/audio.js';
import { T } from '../data/texts.js';

let layer = null;
let taskEl = null;
let actionEl = null;
let actionLabel = null;
let actionText = null;
let toastLayer = null;
let toastTimer = null;

export const hud = {
  /** Oda HUD'unu kurar. onPause: duraklat butonu / Esc. */
  show(onPause) {
    hud.hide();
    layer = overlay.addLayer('hud-layer');
    taskEl = el('div', 'hud-task');
    const pause = el('button', 'btn hud-pause', 'II');
    pause.setAttribute('aria-label', 'Duraklat');
    pause.addEventListener('click', () => onPause && onPause());
    actionEl = el('button', 'btn hud-action');
    actionEl.hidden = true;
    const key = el('span', 'key', '[E]');
    actionText = el('span');
    actionEl.append(key, actionText);
    actionEl.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      input.pressAction();
    });
    layer.append(taskEl, pause, actionEl);
    actionLabel = null;
  },

  hide() {
    if (layer) layer.remove();
    layer = taskEl = actionEl = actionText = null;
    actionLabel = null;
  },

  setTask(text) {
    if (taskEl && taskEl.textContent !== text) taskEl.textContent = text || '';
  },

  /** Bağlamsal eylem butonu: "Konuş / Bak / Al / At". null → gizli. */
  setAction(label) {
    if (!actionEl || label === actionLabel) return;
    actionLabel = label;
    actionEl.hidden = !label;
    if (label) actionText.textContent = label;
  },
};

/** Kısa uyarı (ör. "Bu yardım burada işe yaramaz."). */
export function toast(text, ms) {
  if (toastLayer) toastLayer.remove();
  if (toastTimer) overlay.cancel(toastTimer);
  toastLayer = overlay.addLayer('toast-layer');
  toastLayer.appendChild(el('div', 'toast', text));
  const mine = toastLayer;
  toastTimer = overlay.later(() => {
    mine.remove();
    if (toastLayer === mine) toastLayer = null;
  }, ms || 2200);
}

/** Odaya girerken bölge ve oda adını gösteren başlık kartı (engellemez). */
export function titleCard(zone, room) {
  const l = overlay.addLayer('title-layer');
  l.style.zIndex = '12'; // soru ekranı ve diyalogların altında kalır
  const card = el('div', 'title-card');
  card.append(el('div', 'zone', zone.toLocaleUpperCase('tr-TR')), el('div', 'room', room));
  l.appendChild(card);
  overlay.later(() => l.remove(), 2700);
}

/**
 * Ekranı kaplayan büyük kart (ör. "Anneler bölgesi geçildi!").
 * Kısa bir süre sonra dokunarak/tuşla geçilir. images: isteğe bağlı görsel URL listesi.
 */
export function bigCard(text, opts) {
  const o = opts || {};
  return new Promise((resolve) => {
    const l = overlay.addLayer('big-layer', true);
    if (o.images) {
      const row = el('div', 'big-img');
      o.images.forEach((src) => {
        const img = el('img');
        img.src = src;
        img.alt = '';
        row.appendChild(img);
      });
      l.appendChild(row);
    }
    l.appendChild(el('div', 'big-card', text));
    audio.play(o.sound || 'card');
    let ready = false;
    let release = null;
    const close = () => {
      if (!ready) return;
      ready = false;
      release();
      l.remove();
      resolve();
    };
    release = input.pushModal((e) => {
      if (!e.repeat && (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter')) close();
      return true;
    });
    l.addEventListener('pointerdown', close);
    overlay.later(() => {
      ready = true;
      l.appendChild(el('div', 'big-sub', '▼'));
    }, o.lockMs || 1200);
    if (o.autoMs) overlay.later(() => { ready = true; close(); }, o.autoMs);
  });
}

/** Oyuncağı büyük gösterir (adı yazmaz). 'take' ya da 'back' döner. */
export function toyView(src) {
  return new Promise((resolve) => {
    const l = overlay.addLayer('toy-layer', true);
    const panel = el('div', 'toy-panel panel');
    const img = el('img');
    img.src = src;
    img.alt = '';
    const btns = el('div', 'toy-btns');
    const take = el('button', 'btn take', T.actions.take);
    const back = el('button', 'btn', T.actions.putBack);
    btns.append(take, back);
    panel.append(img, btns);
    l.appendChild(panel);
    const list = [take, back];
    let focus = 1;
    const paint = () => list.forEach((b, i) => b.classList.toggle('focus', i === focus));
    paint();
    let release = null;
    const done = (v) => {
      release();
      l.remove();
      resolve(v);
    };
    release = input.pushModal((e) => {
      if (e.repeat) return true;
      if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'Tab'].includes(e.code)) {
        focus = 1 - focus;
        paint();
      } else if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') {
        done(focus === 0 ? 'take' : 'back');
      } else if (e.code === 'Escape') {
        done('back');
      }
      return true;
    });
    take.addEventListener('click', () => done('take'));
    back.addEventListener('click', () => done('back'));
  });
}
