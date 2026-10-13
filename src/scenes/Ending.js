// Final: formalar ekranın ortasında büyük gösterilir.
import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { ensureRoomTexture, IMG } from '../art/textures.js';
import { bigCard } from '../ui/hud.js';
import { T } from '../data/texts.js';

const COLORS = [0xd94b4b, 0xffcf4a, 0x58d66b, 0x3f8fd6, 0xfff8ee, 0xe0559a];

export class Ending extends Phaser.Scene {
  constructor() {
    super('Ending');
  }

  create() {
    let alive = true;
    this.events.once('shutdown', () => { alive = false; });
    ensureRoomTexture(this, 'bg_alihan');
    this.add.image(0, 0, 'bg_alihan').setOrigin(0, 0).setTint(0x777799);
    // Kartal ve Yağız Alp, babalarıyla birlikte
    this.add.image(120, 196, 'ch_alihan', 'd0').setOrigin(0.5, 1).setScale(2);
    this.add.image(164, 196, 'ch_kartal', 'd0').setOrigin(0.5, 1).setScale(2);
    this.add.image(220, 196, 'ch_yagiz', 'd0').setOrigin(0.5, 1).setScale(2);
    this.add.image(262, 196, 'ch_burak', 'd0').setOrigin(0.5, 1).setScale(2);
    for (let i = 0; i < 50; i++) {
      const c = this.add.image(Math.random() * CONFIG.width, -6 - Math.random() * 80, 'confetti');
      c.setTint(COLORS[i % COLORS.length]).setDepth(10);
      this.tweens.add({
        targets: c,
        y: CONFIG.height + 10,
        x: c.x + (Math.random() - 0.5) * 70,
        angle: 360,
        duration: 2000 + Math.random() * 1800,
        delay: Math.random() * 1500,
        repeat: -1,
      });
    }
    this.cameras.main.fadeIn(400, 26, 20, 35);
    bigCard(T.final.jersey, {
      images: [IMG.misc.jersey, IMG.misc.jersey],
      sound: 'fanfare',
      lockMs: 2200,
    }).then(() => {
      if (alive) this.scene.start('Credits');
    });
  }
}
