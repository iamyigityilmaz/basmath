// Ana menü
import Phaser from 'phaser';
import { ensureRoomTexture } from '../art/textures.js';
import { mainMenu } from '../ui/menus.js';
import { audio } from '../systems/audio.js';
import { hasSave, continueGame, currentRoomScene } from '../systems/session.js';

export class Menu extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    ensureRoomTexture(this, 'bg_menu');
    this.add.image(0, 0, 'bg_menu').setOrigin(0, 0);
    this.add.image(96, 198, 'ch_kartal', 'd0').setOrigin(0.5, 1).setScale(2);
    this.add.image(288, 198, 'ch_yagiz', 'd0').setOrigin(0.5, 1).setScale(2);
    audio.stopMusic();
    this.cameras.main.fadeIn(300, 26, 20, 35);
    mainMenu({
      hasSave: hasSave(),
      onNew: () => this.scene.start('Intro'),
      onContinue: () => {
        if (continueGame()) this.scene.start(currentRoomScene());
        else this.scene.start('Intro');
      },
    });
  }
}
