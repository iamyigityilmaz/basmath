// Ana menü, duraklat menüsü ve karakter seçimi.
import { overlay, el } from './overlay.js';
import { input } from '../systems/input.js';
import { audio } from '../systems/audio.js';
import { IMG } from '../art/textures.js';
import { T } from '../data/texts.js';

/** Dikey buton listesi için klavye gezinmesi. */
function navKeys(buttons, onEscape) {
  let focus = 0;
  const paint = () => buttons.forEach((b, i) => b.classList.toggle('focus', i === focus));
  paint();
  return (e) => {
    if (e.repeat) return true;
    if (e.code === 'ArrowDown' || e.code === 'KeyS' || e.code === 'ArrowRight' || e.code === 'KeyD' || e.code === 'Tab') {
      focus = (focus + 1) % buttons.length;
      paint();
    } else if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'ArrowLeft' || e.code === 'KeyA') {
      focus = (focus + buttons.length - 1) % buttons.length;
      paint();
    } else if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') {
      buttons[focus].click();
    } else if (e.code === 'Escape' && onEscape) {
      onEscape();
    }
    return true;
  };
}

function soundLabel() {
  return audio.isOn() ? T.menu.soundOn : T.menu.soundOff;
}

function soundButton() {
  const b = el('button', 'btn', soundLabel());
  b.addEventListener('click', () => {
    audio.toggle();
    b.textContent = soundLabel();
    audio.play('select');
  });
  return b;
}

export function mainMenu({ hasSave, onNew, onContinue }) {
  const l = overlay.addLayer('menu-layer', true);
  l.appendChild(el('div', 'menu-title', T.title));
  const buttons = [];
  let release = null;
  const close = (fn) => () => {
    audio.play('select');
    release();
    l.remove();
    fn();
  };
  const bNew = el('button', 'btn', T.menu.newGame);
  bNew.addEventListener('click', close(onNew));
  buttons.push(bNew);
  if (hasSave) {
    const bCont = el('button', 'btn', T.menu.continue);
    bCont.addEventListener('click', close(onContinue));
    buttons.push(bCont);
  }
  buttons.push(soundButton());
  buttons.forEach((b) => l.appendChild(b));
  l.appendChild(el('div', 'menu-maker', T.maker));
  release = input.pushModal(navKeys(buttons));
}

export function pauseMenu({ onResume, onMenu }) {
  const l = overlay.addLayer('menu-layer dim', true);
  l.appendChild(el('div', 'menu-sub', T.menu.paused));
  let release = null;
  const close = (fn) => () => {
    audio.play('select');
    release();
    l.remove();
    fn();
  };
  const bRes = el('button', 'btn', T.menu.resume);
  bRes.addEventListener('click', close(onResume));
  const bMenu = el('button', 'btn', T.menu.mainMenu);
  bMenu.addEventListener('click', close(onMenu));
  const buttons = [bRes, soundButton(), bMenu];
  buttons.forEach((b) => l.appendChild(b));
  release = input.pushModal(navKeys(buttons, () => bRes.click()));
}

/** İki kartlı karakter seçimi. 'kartal' ya da 'yagiz' döner. */
export function charSelect() {
  return new Promise((resolve) => {
    const l = overlay.addLayer('select-layer', true);
    l.appendChild(el('div', 'select-head', T.select.heading));
    const row = el('div', 'select-cards');
    const ids = ['kartal', 'yagiz'];
    let release = null;
    const pick = (id) => {
      audio.play('select');
      release();
      l.remove();
      resolve(id);
    };
    const cards = ids.map((id) => {
      const c = el('div', 'select-card panel');
      const img = el('img');
      img.src = IMG.portrait[id];
      img.alt = '';
      const btn = el('button', 'btn', T.select.choose);
      c.append(
        img,
        el('div', 'nm', T.select[id].name),
        el('div', 'role', T.select[id].role),
        el('div', 'desc', T.select[id].desc),
        btn,
      );
      c.addEventListener('click', () => pick(id));
      row.appendChild(c);
      return c;
    });
    l.appendChild(row);
    let focus = 0;
    const paint = () => cards.forEach((c, i) => c.classList.toggle('focus', i === focus));
    paint();
    release = input.pushModal((e) => {
      if (e.repeat) return true;
      if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'Tab'].includes(e.code)) {
        focus = 1 - focus;
        paint();
        audio.play('blip');
      } else if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') {
        pick(ids[focus]);
      }
      return true;
    });
  });
}
