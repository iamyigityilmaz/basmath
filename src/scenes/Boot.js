// Açılış: font yüklenir, tüm görseller bir kez üretilip texture önbelleğine alınır.
import Phaser from 'phaser';
import { generateCharacters, generateProps } from '../art/textures.js';

export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    generateCharacters(this);
    generateProps(this);
    const next = () => this.scene.start(this.game.registry.get('firstScene') || 'Menu');
    if (document.fonts && document.fonts.load) {
      const probe = 'ğüşıöçĞÜŞİÖÇ';
      Promise.all([
        document.fonts.load('400 10px "Jersey 15"', probe),
      ]).then(next, next);
    } else {
      next();
    }
  }
}
