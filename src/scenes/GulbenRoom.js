// Oda 1 — Gülben Yerli'nin Odası (Anneler Bölgesi): 5 kolay sorudan en az 3 doğru.
import { QuizRoom } from './QuizRoom.js';
import { GULBEN_POOL } from '../data/questions.js';
import { T } from '../data/texts.js';

export class GulbenRoom extends QuizRoom {
  constructor() {
    super('GulbenRoom');
  }

  roomIndex() { return 0; }
  roomInfo() { return { zone: T.zones.mothers, room: T.rooms.gulben }; }
  quizSetup() { return { key: 'gulben', pool: GULBEN_POOL, texts: T.gulben }; }

  buildRoom() {
    this.setBackground('bg_gulben');
    this.prop('sofa', 58, 22, { h: 12 });
    this.prop('bookshelf', 150, 8, { h: 8 });
    this.prop('table', 96, 142);
    this.prop('plant', 340, 26, { h: 6 });
    this.prop('plant', 14, 178, { h: 6 });
    this.addBoss('gulben', 300, 114, 'l');
    this.addExitDoor();
  }
}
