// ?debug=1 → FPS göstergesi ve oda atlama menüsü
import { overlay, el } from './overlay.js';

export const DEBUG = new URLSearchParams(window.location.search).get('debug') === '1';

export function initDebug(game, entries) {
  if (!DEBUG) return;
  const layer = overlay.addLayer('debug');
  layer.dataset.keep = '1';
  layer.style.zIndex = '60';

  const fps = el('div', 'debug-fps', 'FPS');
  layer.appendChild(fps);
  setInterval(() => {
    fps.textContent = `FPS ${Math.round(game.loop.actualFps)}`;
  }, 500);

  const toggle = el('button', 'debug-toggle', 'DEBUG');
  layer.appendChild(toggle);
  let menu = null;
  toggle.addEventListener('click', () => {
    if (menu) {
      menu.remove();
      menu = null;
      return;
    }
    menu = el('div', 'debug-menu panel');
    entries.forEach((entry) => {
      const b = el('button', 'btn', entry.label);
      b.addEventListener('click', () => {
        menu.remove();
        menu = null;
        entry.run();
      });
      menu.appendChild(b);
    });
    layer.appendChild(menu);
  });
}
