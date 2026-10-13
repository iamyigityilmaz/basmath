// Sahneler arası geçiş (menüye dönüş, debug atlaması). Tüm arayüzü ve açık pencereleri temizler.
import { overlay } from './ui/overlay.js';
import { input } from './systems/input.js';
import { hud } from './ui/hud.js';
import { helperBar } from './ui/helperBar.js';

let game = null;

export function setGame(g) {
  game = g;
}

export function goto(key, data) {
  hud.hide();
  helperBar.hide();
  overlay.clearAll();
  input.clearModals();
  input.setHandlers({});
  game.scene.getScenes(false).forEach((s) => {
    const st = s.sys.settings.status;
    // çalışan ya da duraklatılmış her sahneyi durdur
    if (s.sys.settings.key !== 'Boot' && st >= 2 && st <= 7) game.scene.stop(s.sys.settings.key);
  });
  game.scene.start(key, data);
}
