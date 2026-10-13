// Giriş metni
import Phaser from 'phaser';
import { say } from '../ui/dialog.js';
import { T } from '../data/texts.js';

export class Intro extends Phaser.Scene {
  constructor() {
    super('Intro');
  }

  create() {
    let alive = true;
    this.events.once('shutdown', () => { alive = false; });
    this.add.image(0, 0, 'bg_menu').setOrigin(0, 0).setTint(0x8888aa);
    this.add.image(170, 150, 'ch_kartal', 'r0').setOrigin(0.5, 1).setScale(2);
    this.add.image(214, 150, 'ch_yagiz', 'l0').setOrigin(0.5, 1).setScale(2);
    this.cameras.main.fadeIn(300, 26, 20, 35);
    say(null, T.intro).then(() => {
      if (alive) this.scene.start('CharacterSelect');
    });
  }
}
