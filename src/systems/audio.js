// WebAudio ile üretilen chiptune ses efektleri ve basit döngü müzik. Ses dosyası yoktur.
import { loadSound, saveSound } from './save.js';

let ctx = null;
let master = null;
let musicGain = null;
let on = loadSound();
let noiseBuf = null;
let musicTimer = null;
let musicStep = 0;
let musicNext = 0;
let musicWanted = false;
let held = false; // sekme gizli / telefon dikey

function ensure() {
  if (ctx) return ctx;
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return null;
  try {
    ctx = new AC();
  } catch (e) {
    return null;
  }
  master = ctx.createGain();
  master.gain.value = on ? 0.5 : 0;
  master.connect(ctx.destination);
  musicGain = ctx.createGain();
  musicGain.gain.value = 0.35;
  musicGain.connect(master);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return ctx;
}

function tone(freq, at, dur, type, vol, slideTo, dest) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const t0 = ctx.currentTime + at;
  o.type = type || 'square';
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(vol || 0.2, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g);
  g.connect(dest || master);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function noise(at, dur, vol, freq, q) {
  const s = ctx.createBufferSource();
  s.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq || 2000;
  f.Q.value = q || 0.8;
  const g = ctx.createGain();
  const t0 = ctx.currentTime + at;
  g.gain.setValueAtTime(vol || 0.2, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(f);
  f.connect(g);
  g.connect(master);
  s.start(t0);
  s.stop(t0 + dur + 0.02);
}

const N = { C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2, G4: 392, A4: 440, B4: 493.9, C5: 523.3, D5: 587.3, E5: 659.3, F5: 698.5, G5: 784, A5: 880, C6: 1046.5, E6: 1318.5, G6: 1568 };

const SFX = {
  blip: () => tone(700 + Math.random() * 60, 0, 0.035, 'square', 0.06),
  select: () => { tone(N.E5, 0, 0.06, 'square', 0.12); tone(N.A5, 0.05, 0.08, 'square', 0.12); },
  correct: () => { tone(N.C5, 0, 0.09, 'square', 0.16); tone(N.E5, 0.08, 0.09, 'square', 0.16); tone(N.G5, 0.16, 0.18, 'square', 0.16); },
  wrong: () => { tone(220, 0, 0.16, 'sawtooth', 0.16, 150); tone(160, 0.14, 0.26, 'sawtooth', 0.16, 90); },
  door: () => { noise(0, 0.12, 0.25, 500, 1); tone(110, 0.02, 0.2, 'triangle', 0.25, 70); tone(N.E4, 0.2, 0.08, 'square', 0.1); tone(N.A4, 0.27, 0.12, 'square', 0.1); },
  swish: () => { noise(0, 0.28, 0.35, 5200, 0.7); noise(0.08, 0.22, 0.2, 2600, 0.7); tone(N.C6, 0.05, 0.08, 'triangle', 0.1); },
  rim: () => { tone(310, 0, 0.12, 'square', 0.2, 240); tone(465, 0, 0.1, 'triangle', 0.18); noise(0, 0.08, 0.2, 900, 2); tone(250, 0.16, 0.1, 'square', 0.1, 200); },
  bounce: () => tone(140, 0, 0.09, 'triangle', 0.25, 80),
  throw: () => tone(300, 0, 0.14, 'triangle', 0.12, 620),
  whistle: () => { for (let i = 0; i < 9; i++) tone(i % 2 ? 2350 : 2200, i * 0.045, 0.05, 'square', 0.1); },
  buzzer: () => { tone(125, 0, 0.7, 'sawtooth', 0.22); tone(127, 0, 0.7, 'square', 0.12); },
  alert: () => { tone(N.E5, 0, 0.07, 'square', 0.2); tone(N.E6, 0.07, 0.25, 'square', 0.2); },
  ring: () => { for (let i = 0; i < 2; i++) for (let k = 0; k < 6; k++) tone(k % 2 ? 960 : 1280, i * 0.42 + k * 0.045, 0.045, 'square', 0.09); },
  helper: () => { [N.C5, N.E5, N.G5, N.C6, N.E6].forEach((f, i) => tone(f, i * 0.06, 0.14, 'triangle', 0.16)); },
  magic: () => { [N.G5, N.C6, N.E6, N.G6].forEach((f, i) => tone(f, i * 0.07, 0.3, 'sine', 0.14)); },
  hack: () => { for (let i = 0; i < 14; i++) tone(400 + ((i * 371) % 900), i * 0.04, 0.035, 'square', 0.07); },
  pick: () => { tone(N.A4, 0, 0.06, 'square', 0.14); tone(N.E5, 0.06, 0.12, 'square', 0.14); },
  open: () => { noise(0, 0.06, 0.15, 1200, 1); tone(N.D5, 0.02, 0.06, 'triangle', 0.12); },
  card: () => { [N.C5, N.G5, N.C6].forEach((f, i) => tone(f, i * 0.1, 0.2, 'square', 0.12)); },
  fanfare: () => {
    const seq = [N.C5, N.C5, N.C5, N.E5, N.G5, N.E5, N.G5, N.C6];
    const at = [0, 0.12, 0.24, 0.36, 0.54, 0.72, 0.84, 1.0];
    seq.forEach((f, i) => {
      tone(f, at[i], i === 7 ? 0.6 : 0.14, 'square', 0.15);
      tone(f / 2, at[i], i === 7 ? 0.6 : 0.14, 'triangle', 0.14);
    });
  },
};

// Basit döngü müzik: 16 adımlık melodi + bas
const MEL = [N.E5, 0, N.G5, 0, N.A5, N.G5, N.E5, 0, N.D5, 0, N.E5, N.G5, N.E5, N.D5, N.C5, 0,
  N.E5, 0, N.G5, 0, N.C6, N.A5, N.G5, 0, N.A5, 0, N.G5, N.E5, N.D5, N.E5, N.C5, 0];
const BASS = [N.C4, N.C4, N.A4 / 2, N.A4 / 2, N.F4 / 2, N.F4 / 2, N.G4 / 2, N.G4 / 2];
const STEP = 0.17;

function musicTick() {
  if (!ctx || !on || held || ctx.state !== 'running') return;
  if (musicNext < ctx.currentTime) musicNext = ctx.currentTime + 0.05;
  while (musicNext < ctx.currentTime + 0.4) {
    const at = musicNext - ctx.currentTime;
    const m = MEL[musicStep % MEL.length];
    if (m) tone(m, at, STEP * 0.9, 'square', 0.07, 0, musicGain);
    if (musicStep % 2 === 0) tone(BASS[(musicStep / 4 | 0) % BASS.length], at, STEP * 1.8, 'triangle', 0.16, 0, musicGain);
    musicStep++;
    musicNext += STEP;
  }
}

export const audio = {
  /** iOS: ilk dokunuşta AudioContext'i başlat. */
  unlock() {
    const c = ensure();
    if (c && c.state === 'suspended' && !held) c.resume().catch(() => {});
  },

  play(name) {
    if (!on || held) return;
    const c = ensure();
    if (!c || c.state !== 'running') return;
    const f = SFX[name];
    if (f) {
      try {
        f();
      } catch (e) {
        /* yok say */
      }
    }
  },

  isOn() {
    return on;
  },

  setOn(v) {
    on = !!v;
    saveSound(on);
    if (master && ctx) master.gain.setValueAtTime(on ? 0.5 : 0, ctx.currentTime);
    if (on) this.unlock();
  },

  toggle() {
    this.setOn(!on);
    return on;
  },

  startMusic() {
    musicWanted = true;
    if (!musicTimer) musicTimer = setInterval(musicTick, 120);
  },

  stopMusic() {
    musicWanted = false;
    if (musicTimer) {
      clearInterval(musicTimer);
      musicTimer = null;
    }
  },

  /** Sekme arka plana geçince ya da telefon dikey tutulunca sesi duraklat. */
  hold(v) {
    held = v;
    if (!ctx) return;
    if (v) ctx.suspend().catch(() => {});
    else ctx.resume().catch(() => {});
  },

  /** Titreşim yalnızca destekleyen cihazlarda; yoksa sessizce atlanır. */
  vibrate(ms) {
    try {
      if (on && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms);
    } catch (e) {
      /* yok say */
    }
  },
};

if (typeof window !== 'undefined') {
  const unlock = () => audio.unlock();
  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('touchend', unlock, true);
  window.addEventListener('keydown', unlock, true);
}
