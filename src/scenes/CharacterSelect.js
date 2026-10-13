// Karakter seçimi: Kartal (Basketbolcu) / Yağız Alp (Matematikçi)
import Phaser from 'phaser';
import { charSelect } from '../ui/menus.js';
import { newGame } from '../systems/session.js';

export class CharacterSelect extends Phaser.Scene {
  constructor() {
    super('CharacterSelect');
  }

  create() {
    let alive = true;
    this.events.once('shutdown', () => { alive = false; });
    this.add.image(0, 0, 'bg_menu').setOrigin(0, 0).setTint(0x8888aa);
    charSelect().then((id) => {
      if (!alive) return;
      newGame(id);
      this.scene.start('GulbenRoom');
    });
  }
}
