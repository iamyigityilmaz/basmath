// Diyalog kutusu: portre + isim + daktilo efektli metin.
import { overlay, el } from './overlay.js';
import { input } from '../systems/input.js';
import { audio } from '../systems/audio.js';
import { IMG } from '../art/textures.js';
import { T } from '../data/texts.js';

const CHAR_MS = 26;

/**
 * Tek bir replik gösterir. Dokununca/tuşa basınca metin tamamlanır, tekrar basınca kapanır.
 * who: karakter kimliği (portre ve isim için) ya da null (anlatıcı).
 */
export function say(who, text) {
  return new Promise((resolve) => {
    const layer = overlay.addLayer('dlg-layer', true);
    const box = el('div', 'dlg panel');
    if (who) {
      const frame = el('div', 'dlg-portrait');
      const img = el('img');
      img.src = IMG.portrait[who];
      img.alt = '';
      frame.appendChild(img);
      box.appendChild(frame);
    } else {
      box.classList.add('narrator');
    }
    const body = el('div', 'dlg-body');
    if (who) body.appendChild(el('div', 'dlg-name', T.names[who]));
    const p = el('div', 'dlg-text');
    // Yerleşim zıplamasın diye metnin tamamı görünmez olarak yer tutar
    const shown = el('span');
    const hidden = el('span', 'dlg-hidden', text);
    p.append(shown, hidden);
    body.appendChild(p);
    const more = el('div', 'dlg-more', '▼');
    box.append(body, more);
    layer.appendChild(box);

    const chars = Array.from(text);
    let i = 0;
    let done = false;
    let timer = null;

    const finish = () => {
      done = true;
      clearInterval(timer);
      shown.textContent = text;
      hidden.textContent = '';
      more.classList.add('on');
    };
    const tick = () => {
      if (!layer.isConnected) {
        clearInterval(timer);
        return;
      }
      i += 1;
      shown.textContent = chars.slice(0, i).join('');
      hidden.textContent = chars.slice(i).join('');
      if (i % 3 === 0 && chars[i - 1] !== ' ') audio.play('blip');
      if (i >= chars.length) finish();
    };
    timer = setInterval(tick, CHAR_MS);

    let release = null;
    const advance = () => {
      if (!done) {
        finish();
        return;
      }
      audio.play('select');
      release();
      layer.remove();
      resolve();
    };
    release = input.pushModal((e) => {
      if (e.repeat) return true;
      if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') advance();
      return e.code !== 'Escape';
    });
    layer.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      advance();
    });
  });
}

/** Birden fazla repliği sırayla gösterir: [[who, text], ...] */
export async function sayAll(lines) {
  for (let i = 0; i < lines.length; i++) {
    await say(lines[i][0], lines[i][1]);
  }
}
