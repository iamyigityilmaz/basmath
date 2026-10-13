// Klavye + dokunmatik joystick girdisi. Phaser'dan bağımsızdır; DOM olaylarını dinler.

const MOVE_KEYS = {
  ArrowUp: 'u', KeyW: 'u',
  ArrowDown: 'd', KeyS: 'd',
  ArrowLeft: 'l', KeyA: 'l',
  ArrowRight: 'r', KeyD: 'r',
};
const ACTION_KEYS = { KeyE: 1, Space: 1, Enter: 1 };
const JOY_RADIUS = 40; // CSS px
const JOY_DEAD = 0.2;

const held = { u: false, d: false, l: false, r: false };
const joy = { active: false, id: -1, ox: 0, oy: 0, x: 0, y: 0 };
const modals = [];
const handlers = { helper: null, pause: null };
let actionEdge = false;
let tapEdge = false;
let touchEl = null;
let baseEl = null;
let knobEl = null;
let enabled = true;

function setTouchMode(on) {
  document.body.classList.toggle('touch', on);
  document.body.classList.toggle('kbd', !on);
}

function releaseAll() {
  held.u = held.d = held.l = held.r = false;
  endJoy();
}

function endJoy() {
  joy.active = false;
  joy.id = -1;
  joy.x = joy.y = 0;
  if (touchEl) touchEl.classList.remove('joy-on');
}

function onKeyDown(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (document.body.classList.contains('touch')) setTouchMode(false);
  const mv = MOVE_KEYS[e.code];
  if (mv || ACTION_KEYS[e.code] || e.code === 'Escape' || e.code === 'Tab') e.preventDefault();
  if (mv) held[mv] = true;
  if (!enabled) return;
  if (modals.length) {
    const top = modals[modals.length - 1];
    if (top(e) !== false) return;
  }
  if (e.repeat) return;
  if (ACTION_KEYS[e.code]) {
    if (!modals.length) actionEdge = true;
  } else if (e.code === 'Escape') {
    if (handlers.pause) handlers.pause();
  } else if (/^(Digit|Numpad)[1-4]$/.test(e.code)) {
    if (handlers.helper) handlers.helper(Number(e.code.slice(-1)) - 1);
  }
}

function onKeyUp(e) {
  const mv = MOVE_KEYS[e.code];
  if (mv) held[mv] = false;
}

function onPointerDown(e) {
  if (e.pointerType !== 'mouse' && !document.body.classList.contains('touch')) setTouchMode(true);
  if (!enabled) return;
  const isTouch = e.pointerType !== 'mouse';
  if (isTouch && !joy.active && e.clientX < window.innerWidth * 0.5 && !modals.length) {
    joy.active = true;
    joy.id = e.pointerId;
    joy.ox = e.clientX;
    joy.oy = e.clientY;
    joy.x = joy.y = 0;
    baseEl.style.transform = `translate(${joy.ox}px,${joy.oy}px)`;
    knobEl.style.transform = `translate(${joy.ox}px,${joy.oy}px)`;
    touchEl.classList.add('joy-on');
    try { touchEl.setPointerCapture(e.pointerId); } catch (err) { /* yok say */ }
  }
  tapEdge = true;
  e.preventDefault();
}

function onPointerMove(e) {
  if (!joy.active || e.pointerId !== joy.id) return;
  let dx = e.clientX - joy.ox;
  let dy = e.clientY - joy.oy;
  const len = Math.hypot(dx, dy);
  if (len > JOY_RADIUS) {
    dx = (dx / len) * JOY_RADIUS;
    dy = (dy / len) * JOY_RADIUS;
  }
  joy.x = dx / JOY_RADIUS;
  joy.y = dy / JOY_RADIUS;
  knobEl.style.transform = `translate(${joy.ox + dx}px,${joy.oy + dy}px)`;
}

function onPointerUp(e) {
  if (joy.active && e.pointerId === joy.id) endJoy();
}

export const input = {
  init(el) {
    touchEl = el;
    baseEl = document.createElement('div');
    baseEl.className = 'joy-base';
    knobEl = document.createElement('div');
    knobEl.className = 'joy-knob';
    el.append(baseEl, knobEl);

    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    setTouchMode(!!coarse);

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', releaseAll);
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    // Dokunmatikte herhangi bir arayüz öğesine basılırsa da dokunmatik moda geç
    window.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' && !document.body.classList.contains('touch')) setTouchMode(true);
    }, true);

    // Tarayıcı jestlerini kapat: zoom, kaydırma, uzun basma menüsü
    const stop = (e) => e.preventDefault();
    document.addEventListener('touchmove', stop, { passive: false });
    document.addEventListener('gesturestart', stop);
    document.addEventListener('gesturechange', stop);
    document.addEventListener('dblclick', stop);
    document.addEventListener('contextmenu', stop);
    document.addEventListener('selectstart', stop);
  },

  /** Hareket vektörünü `out` içine yazar (yeni nesne oluşturmaz). */
  getMove(out) {
    out.x = 0;
    out.y = 0;
    if (!enabled || modals.length) return out;
    let x = (held.r ? 1 : 0) - (held.l ? 1 : 0);
    let y = (held.d ? 1 : 0) - (held.u ? 1 : 0);
    if (x !== 0 || y !== 0) {
      if (x !== 0 && y !== 0) {
        x *= 0.7071;
        y *= 0.7071;
      }
    } else if (joy.active) {
      const len = Math.hypot(joy.x, joy.y);
      if (len > JOY_DEAD) {
        const m = Math.min(1, (len - JOY_DEAD) / (0.85 - JOY_DEAD));
        x = (joy.x / len) * m;
        y = (joy.y / len) * m;
      }
    }
    out.x = x;
    out.y = y;
    return out;
  },

  consumeAction() {
    const a = actionEdge;
    actionEdge = false;
    return a;
  },

  consumeTap() {
    const a = tapEdge;
    tapEdge = false;
    return a;
  },

  clearEdges() {
    actionEdge = false;
    tapEdge = false;
  },

  /** Eylem butonuna (DOM) basıldı. */
  pressAction() {
    if (enabled && !modals.length) actionEdge = true;
  },

  /**
   * Klavye olaylarını en üstteki arayüz penceresine yönlendirir.
   * handler `false` dönerse olay genel işleyiciye (yardımcılar, duraklat) düşer.
   * Dönen fonksiyon pencereyi yığından çıkarır.
   */
  pushModal(handler) {
    const fn = handler || (() => true);
    modals.push(fn);
    endJoy();
    actionEdge = false;
    return () => {
      const i = modals.indexOf(fn);
      if (i >= 0) modals.splice(i, 1);
      actionEdge = false;
      tapEdge = false;
    };
  },

  clearModals() {
    modals.length = 0;
  },

  isModal() {
    return modals.length > 0;
  },

  setHandlers(h) {
    handlers.helper = h.helper || null;
    handlers.pause = h.pause || null;
  },

  setEnabled(v) {
    enabled = v;
    if (!v) releaseAll();
  },

  isTouch() {
    return document.body.classList.contains('touch');
  },
};
