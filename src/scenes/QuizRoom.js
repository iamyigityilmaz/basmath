// Sınav odalarının (Gülben, Burak) ortak akışı.
import { RoomBase } from './RoomBase.js';
import { CONFIG } from '../config.js';
import { session } from '../systems/session.js';
import { createQuiz } from '../systems/quiz.js';
import { audio } from '../systems/audio.js';
import { runQuiz, quizUI } from '../ui/quizUI.js';
import { say } from '../ui/dialog.js';
import { hud } from '../ui/hud.js';

export class QuizRoom extends RoomBase {
  /** Alt sınıf: { key: 'gulben'|'burak', pool, texts: {intro, fail, pass, hud, hudDoor} } */
  quizSetup() {
    return null;
  }

  afterCreate() {
    this.quizOn = false;
    this.cleared = false;
    hud.setTask(this.quizSetup().texts.hud);
  }

  helperContext() {
    return { quizActive: this.quizOn && quizUI.accepting() };
  }

  applyHelper(id) {
    if (id === 'gulnur') quizUI.reveal();
    else if (id === 'yigit') quizUI.hack();
  }

  async onTalk() {
    if (this.cleared || this.quizOn || this.locked) return;
    const { key, pool, texts } = this.quizSetup();
    this.locked = true;
    this.bossTalk.active = false;
    hud.setAction(null);
    await say(this.bossId, texts.intro);
    if (!this.alive) return;
    // Sorular her denemede havuzdan yeniden çekilir
    const quiz = createQuiz({
      pool,
      count: CONFIG.quiz[key].count,
      pass: CONFIG.quiz[key].pass,
      eliminations: session.character === 'yagiz' ? CONFIG.bonus.yagiz.eliminatePerAttempt : 0,
    });
    this.quizOn = true;
    hud.setTask('');
    const passed = await runQuiz({ bossId: this.bossId, quiz });
    this.quizOn = false;
    if (!this.alive) return;
    if (!passed) {
      this.failRoom(texts.fail);
      return;
    }
    this.cleared = true;
    this.clearRoom();
    audio.play('fanfare');
    await say(this.bossId, texts.pass);
    if (!this.alive) return;
    this.openExitDoor();
    hud.setTask(texts.hudDoor);
    this.locked = false;
  }
}
