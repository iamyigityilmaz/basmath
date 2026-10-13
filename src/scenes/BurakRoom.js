// Oda 3 — Burak Yerli'nin Odası (Babalar Bölgesi): 4 daha zor sorunun 4'ü de doğru.
import { QuizRoom } from './QuizRoom.js';
import { BURAK_POOL } from '../data/questions.js';
import { T } from '../data/texts.js';

export class BurakRoom extends QuizRoom {
  constructor() {
    super('BurakRoom');
  }

  roomIndex() { return 2; }
  roomInfo() { return { zone: T.zones.fathers, room: T.rooms.burak }; }
  quizSetup() { return { key: 'burak', pool: BURAK_POOL, texts: T.burak }; }

  buildRoom() {
    this.setBackground('bg_burak');
    this.prop('bookshelf', 18, 8, { h: 8 });
    this.prop('bookshelf', 58, 8, { h: 8 });
    this.prop('desk', 296, 36, { h: 14 });
    this.prop('plant', 96, 26, { h: 6 });
    this.prop('plant', 356, 180, { h: 6 });
    this.prop('table', 60, 150);
    this.addBoss('burak', 300, 114, 'l');
    this.addExitDoor();
  }
}
