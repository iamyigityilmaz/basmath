// Kapanış: siyah ekranda iki satır, sonra kayıt temizlenir ve ana menüye dönülür.
import Phaser from 'phaser';
import { overlay, el } from '../ui/overlay.js';
import { input } from '../systems/input.js';
import { audio } from '../systems/audio.js';
import { finishGame } from '../systems/session.js';
import { goto } from '../nav.js';
import { T } from '../data/texts.js';

const CHAR_MS = 55;
const HOLD_MS = 4000;
const FADE_MS = 950;

export class Credits extends Phaser.Scene {
  constructor() {
    super('Credits');
  }

  create() {
    audio.stopMusic();
    this.cameras.main.setBackgroundColor('#000000');
    const layer = overlay.addLayer('credits-layer', true);
    const text = el('div', 'credits-text');
    layer.appendChild(text);

    let stage = 1;
    let skip = null;
    const release = input.pushModal((e) => {
      if (!e.repeat && (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') && skip) skip();
      return true;
    });
    layer.addEventListener('pointerdown', () => skip && skip());

    const finish = () => {
      // 4. Kayıt temizlenir ve ana menüye dönülür
      finishGame();
      release();
      goto('Menu');
    };

    const second = () => {
      // 3. İkinci satır (~4 sn, dokununca da geçer)
      stage = 2;
      text.textContent = T.closing.line2;
      text.classList.remove('fade-out');
      let ended = false;
      const end = () => {
        if (ended) return;
        ended = true;
        skip = null;
        text.classList.add('fade-out');
        overlay.later(finish, FADE_MS);
      };
      overlay.later(() => { skip = end; }, 500);
      overlay.later(end, HOLD_MS + 500);
    };

    // 1. İlk satır, daktilo efektiyle (~4 sn)
    const chars = Array.from(T.closing.line1);
    let i = 0;
    const type = () => {
      if (!layer.isConnected || stage !== 1) return;
      i += 1;
      text.textContent = chars.slice(0, i).join('');
      if (i % 2 === 0) audio.play('blip');
      if (i < chars.length) overlay.later(type, CHAR_MS);
      else {
        overlay.later(() => {
          // 2. Ekran tamamen kararır
          text.classList.add('fade-out');
          overlay.later(second, FADE_MS + 500);
        }, Math.max(1200, HOLD_MS - chars.length * CHAR_MS));
      }
    };
    overlay.later(type, 500);
  }
}
