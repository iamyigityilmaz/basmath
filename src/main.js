// Phaser oyun yapılandırması
import Phaser from 'phaser';
import '@fontsource/jersey-15/latin-400.css';
import '@fontsource/jersey-15/latin-ext-400.css';
import './styles.css';
import './ui.css';
import { CONFIG } from './config.js';
import { input } from './systems/input.js';
import { audio } from './systems/audio.js';
import { session } from './systems/session.js';
import { overlay } from './ui/overlay.js';
import { initDebug, DEBUG } from './ui/debug.js';
import { say } from './ui/dialog.js';
import { toast } from './ui/hud.js';
import { quizUI } from './ui/quizUI.js';
import { setGame, goto } from './nav.js';
import { T } from './data/texts.js';
import { Boot } from './scenes/Boot.js';
import { Menu } from './scenes/Menu.js';
import { Intro } from './scenes/Intro.js';
import { CharacterSelect } from './scenes/CharacterSelect.js';
import { GulbenRoom } from './scenes/GulbenRoom.js';
import { YagmurPlayground } from './scenes/YagmurPlayground.js';
import { BurakRoom } from './scenes/BurakRoom.js';
import { AlihanGym } from './scenes/AlihanGym.js';
import { Ending } from './scenes/Ending.js';
import { Credits } from './scenes/Credits.js';

const game = new Phaser.Game({
  type: Phaser.AUTO, // önce WebGL, yoksa Canvas
  parent: 'frame',
  width: CONFIG.width,
  height: CONFIG.height,
  backgroundColor: '#1a1423',
  pixelArt: true,
  roundPixels: true,
  banner: false,
  audio: { noAudio: true },
  input: { keyboard: false, mouse: false, touch: false, gamepad: false },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  fps: { target: 60 },
  scene: [Boot, Menu, Intro, CharacterSelect, GulbenRoom, YagmurPlayground, BurakRoom, AlihanGym, Ending, Credits],
});

setGame(game);
input.init(document.getElementById('touch'));
overlay.init(game);

// ---- Dikey tutulursa duraklat ve "Telefonu yan çevir" göster ----
const rotateEl = document.getElementById('rotate');
rotateEl.querySelector('p').textContent = T.menu.rotate;
const isMobile =
  (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
let rotated = false;

function applyHold() {
  const need = isMobile && window.innerHeight > window.innerWidth;
  if (need !== rotated) {
    rotated = need;
    rotateEl.hidden = !need;
    input.setEnabled(!need);
  }
  // Sekme arka plandayken ya da telefon dikeyken oyun ve ses durur
  const hold = need || document.hidden;
  audio.hold(hold);
  if (hold) game.loop.sleep();
  else game.loop.wake();
  if (!need) overlay.layout();
}

window.addEventListener('resize', applyHold);
window.addEventListener('orientationchange', () => setTimeout(applyHold, 200));
document.addEventListener('visibilitychange', () => setTimeout(applyHold, 0));
applyHold();

// Service worker yalnızca production build'de kaydolur (offline çalışma)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

if (DEBUG) {
  window.__game = game;
  window.__session = session;
  window.__goto = goto;
  window.__quizUI = quizUI;
}

game.events.once('ready', () => {
  const room = (key, index) => () => {
    session.checkpoint = index;
    goto(key);
  };
  initDebug(game, [
    { label: 'Ana menü', run: () => goto('Menu') },
    { label: 'Oda 1 Gülben', run: room('GulbenRoom', 0) },
    { label: 'Oda 2 Yağmur', run: room('YagmurPlayground', 1) },
    { label: 'Oda 3 Burak', run: room('BurakRoom', 2) },
    { label: 'Oda 4 Alihan', run: room('AlihanGym', 3) },
    { label: 'Final', run: () => goto('Ending') },
    { label: 'Kapanış', run: () => goto('Credits') },
    {
      label: 'Karakter değiştir',
      run: () => {
        session.character = session.character === 'kartal' ? 'yagiz' : 'kartal';
        toast(`Karakter: ${T.names[session.character]}`);
      },
    },
    {
      label: 'Türkçe font testi',
      run: async () => {
        await say('gulnur', T.fontTest);
        await say(null, T.fontTest.toLocaleUpperCase('tr-TR'));
      },
    },
  ]);
});
