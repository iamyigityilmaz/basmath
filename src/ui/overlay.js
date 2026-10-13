// HTML arayüz katmanının kökü. Canvas'ın ölçeklenmiş sınırlarına hizalanır.
import { CONFIG } from '../config.js';

const FONT_SCALE = 1.22; // Jersey 15 dar bir font; okunaklı olsun diye büyütülür
let root = null;
let frame = null;
let game = null;
const timers = new Set();

/** Küçük DOM yardımcısı. */
export function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

export function trUpper(s) {
  return s.toLocaleUpperCase('tr-TR');
}

export const overlay = {
  init(g) {
    game = g;
    root = document.getElementById('ui');
    frame = document.getElementById('frame');
    const relayout = () => overlay.layout();
    game.scale.on('resize', relayout);
    window.addEventListener('resize', () => {
      relayout();
      setTimeout(relayout, 60);
      setTimeout(relayout, 350);
    });
    window.addEventListener('orientationchange', () => setTimeout(relayout, 350));
    if (window.visualViewport) window.visualViewport.addEventListener('resize', relayout);
    relayout();
    setTimeout(relayout, 100);
  },

  get root() {
    return root;
  },

  /** Arayüzü canvas'ın ekrandaki dikdörtgenine oturtur. */
  layout() {
    if (!game || !game.canvas || !root) return;
    const fr = frame.getBoundingClientRect();
    const r = game.canvas.getBoundingClientRect();
    if (r.width < 2) return;
    root.style.left = `${r.left - fr.left}px`;
    root.style.top = `${r.top - fr.top}px`;
    root.style.width = `${r.width}px`;
    root.style.height = `${r.height}px`;
    root.style.setProperty('--u', `${r.width / CONFIG.width}px`);
    root.style.setProperty('--f', `${(r.width / CONFIG.width) * FONT_SCALE}px`);
  },

  /** Yeni bir katman ekler. `block` true ise alttaki her şeyi tıklamaya kapatır. */
  addLayer(cls, block) {
    const l = el('div', `layer ${cls || ''}${block ? ' block' : ''}`);
    root.appendChild(l);
    return l;
  },

  /** Arayüz zamanlayıcısı: clearAll ile toplu iptal edilir. */
  later(fn, ms) {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
    return id;
  },

  cancel(id) {
    clearTimeout(id);
    timers.delete(id);
  },

  /** Kalıcı (data-keep) olmayan tüm katmanları kaldırır. */
  clearAll() {
    timers.forEach((id) => clearTimeout(id));
    timers.clear();
    Array.from(root.children).forEach((c) => {
      if (!c.dataset.keep) c.remove();
    });
  },
};
