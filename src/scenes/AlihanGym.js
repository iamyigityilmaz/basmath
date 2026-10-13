// Oda 4 — Alihan Alkanat'ın Basketbol Salonu (Babalar Bölgesi): 6 atışta en az 12 sayı. Ardından final.
import { RoomBase } from './RoomBase.js';
import { Actor } from './Actor.js';
import { CONFIG } from '../config.js';
import { input } from '../systems/input.js';
import { audio } from '../systems/audio.js';
import { session } from '../systems/session.js';
import { shotParams, indicatorPos, isHit, createGame, applyShot, applyBonus } from '../systems/basketball.js';
import { GYM } from '../art/rooms.js';
import { hud, toast } from '../ui/hud.js';
import { say } from '../ui/dialog.js';
import { T } from '../data/texts.js';

const BAR_W = 100;
const BAR_H = 9;
const AIM_GRACE = 0.18; // sn: "At"a basan dokunuşun göstergeyi hemen durdurmaması için
const CONFETTI = [0xd94b4b, 0xffcf4a, 0x58d66b, 0x3f8fd6, 0xfff8ee, 0xe0559a];

export class AlihanGym extends RoomBase {
  constructor() {
    super('AlihanGym');
  }

  roomIndex() { return 3; }
  roomInfo() { return { zone: T.zones.fathers, room: T.rooms.alihan }; }

  buildRoom() {
    this.setBackground('bg_alihan');
    const h = GYM.hoop;
    this.hoopImg = this.add.image(h.x, h.y - 15, 'hoop').setOrigin(0.5, 0).setDepth(h.y - 6);
    this.addObstacle(h.x - 16, 30, 32, 8, false);
    this.addBoss('alihan', 334, 152, 'l');
    this.spotIts = GYM.spots.map((s) => {
      const it = this.addInteractable(s.x, s.y + 2, 11, T.actions.shoot, () => this.startAim(s));
      it.active = false;
      return it;
    });
    this.bar = this.add.graphics().setDepth(1500).setVisible(false);
    this.ball = this.add.image(0, 0, 'ball').setDepth(1400).setVisible(false);
    this.ballShadow = this.add.image(0, 0, 'ballShadow').setDepth(2).setAlpha(0.3).setVisible(false);
    this.flight = { t: 0 };
  }

  afterCreate() {
    this.state = 'idle'; // idle → play ⇄ aim → flight → play ... → done
    this.match = null;
    this.aim = null;
    this.aimT = 0;
    this.aimSpot = null;
    this.hinted = false;
    this.throws = 0;
    this.cutscene = false;
    this.customAction = false;
    hud.setTask(T.alihan.hudTalk);
  }

  helperContext() {
    const m = this.match;
    return {
      room: 'alihan',
      shooting: this.state === 'play' && !!m && m.shotsLeft > 0 && !m.finished,
      busy: this.state === 'aim' || this.state === 'flight' || this.state === 'kadir',
    };
  }

  applyHelper(id) {
    if (id === 'kadir') this.kadirShot();
  }

  updateHud() {
    const m = this.match;
    hud.setTask(T.alihan.score(m.score, m.target, m.shotsLeft));
  }

  async onTalk() {
    if (this.state !== 'idle' || this.locked) return;
    this.locked = true;
    this.bossTalk.active = false;
    hud.setAction(null);
    await say('alihan', T.alihan.intro);
    if (!this.alive) return;
    this.match = createGame(CONFIG.basket);
    this.state = 'play';
    this.spotIts.forEach((it) => { it.active = true; });
    this.updateHud();
    toast(T.alihan.hudPlay, 3000);
    this.locked = false;
  }

  /** Atış noktasında "At": nişan barı açılır, gösterge ileri-geri gider. */
  startAim(spot) {
    if (this.state !== 'play') return;
    this.state = 'aim';
    this.locked = true;
    this.customAction = true;
    this.aimSpot = spot;
    this.aim = shotParams(spot.pts, session.character, CONFIG.basket, CONFIG.bonus);
    this.aimT = 0;
    const p = this.player;
    p.setPos(spot.x, spot.y + 3);
    p.animate(16, 0, 0);
    p.faceTo(GYM.hoop.x, GYM.hoop.y);
    hud.setAction(T.actions.shoot);
    input.clearEdges();
    this.bar.setVisible(true);
    if (!this.hinted) {
      this.hinted = true;
      hud.setTask(T.alihan.aimHint);
    }
  }

  drawBar(pos) {
    const g = this.bar;
    const p = this.player;
    const x = Math.round(Math.max(10, Math.min(CONFIG.width - 10 - BAR_W, p.x - BAR_W / 2)));
    let y = Math.round(p.y - p.sprite.height - 16);
    if (y < 36) y = Math.round(p.y + 7);
    const zw = BAR_W * this.aim.zone;
    g.clear();
    g.fillStyle(0x1a1423, 1).fillRect(x - 2, y - 2, BAR_W + 4, BAR_H + 4);
    g.fillStyle(0xfff8ee, 1).fillRect(x - 1, y - 1, BAR_W + 2, BAR_H + 2);
    g.fillStyle(0xc2423a, 1).fillRect(x, y, BAR_W, BAR_H);
    g.fillStyle(0x58d66b, 1).fillRect(x + (BAR_W - zw) / 2, y, zw, BAR_H);
    g.fillStyle(0xb8ffc8, 1).fillRect(x + (BAR_W - zw) / 2, y, zw, 2);
    const ix = x + pos * BAR_W;
    g.fillStyle(0x1a1423, 1).fillRect(ix - 2, y - 4, 4, BAR_H + 8);
    g.fillStyle(0xffffff, 1).fillRect(ix - 1, y - 3, 2, BAR_H + 6);
  }

  roomUpdate(dt) {
    if (this.state !== 'aim') return;
    this.aimT += dt / 1000;
    const pos = indicatorPos(this.aimT, this.aim.period);
    this.drawBar(pos);
    if (this.aimT <= AIM_GRACE) {
      input.clearEdges();
      return;
    }
    const pressed = input.consumeAction();
    const tapped = input.consumeTap();
    if (pressed || tapped) this.release(pos);
  }

  /** Gösterge yeşil alandaysa top girer, değilse çembere çarpıp kaçar. */
  async release(pos) {
    const spot = this.aimSpot;
    const hit = isHit(pos, this.aim.zone);
    this.state = 'flight';
    this.customAction = false;
    hud.setAction(null);
    this.bar.clear();
    this.bar.setVisible(false);
    audio.play('throw');
    await this.throwBall(this.player.x, this.player.y - 12, hit);
    if (!this.alive) return;
    applyShot(this.match, spot.pts, hit);
    this.updateHud();
    if (hit) toast(`+${spot.pts}`, 900);
    this.afterScore();
  }

  async afterScore() {
    const m = this.match;
    if (m.won) {
      this.finale();
      return;
    }
    if (m.finished) {
      this.state = 'done';
      audio.play('buzzer');
      await this.wait(600);
      if (!this.alive) return;
      this.failRoom(T.alihan.fail);
      return;
    }
    this.state = 'play';
    this.locked = false;
    input.clearEdges();
  }

  /** Top potaya doğru kavisli uçar; gölge ve ölçekle sahte derinlik verilir. */
  throwBall(fromX, fromY, hit) {
    return new Promise((resolve) => {
      const hoop = GYM.hoop;
      this.throws += 1;
      const side = this.throws % 2 ? 1 : -1;
      const tx = hoop.x + (hit ? 0 : side * 7);
      const ty = hoop.y;
      const gx0 = fromX;
      const gy0 = fromY + 12;
      const gy1 = ty + 10;
      const dist = Math.hypot(tx - gx0, gy1 - gy0);
      const peak = 20 + dist * 0.2;
      const ball = this.ball;
      const sh = this.ballShadow;
      ball.setVisible(true).setAlpha(1).setScale(1);
      sh.setVisible(true);
      this.flight.t = 0;
      const place = () => {
        const t = this.flight.t;
        const gx = gx0 + (tx - gx0) * t;
        const gy = gy0 + (gy1 - gy0) * t;
        const z = 12 + (10 - 12) * t + 4 * peak * t * (1 - t);
        ball.setPosition(gx, gy - z);
        ball.setScale(1 + z / 80);
        sh.setPosition(gx, gy + 1);
        sh.setScale(1 - Math.min(0.5, z / 120));
      };
      place();
      const done = () => {
        ball.setVisible(false);
        sh.setVisible(false);
        resolve();
      };
      this.tweens.add({
        targets: this.flight,
        t: 1,
        duration: 420 + dist * 2.4,
        onUpdate: place,
        onComplete: () => {
          if (hit) {
            audio.play('swish');
            audio.vibrate(30);
            this.tweens.add({ targets: this.hoopImg, scaleY: 1.1, duration: 90, yoyo: true });
            this.tweens.add({ targets: ball, y: ball.y + 13, scale: 0.85, alpha: 0, duration: 300, onComplete: done });
          } else {
            audio.play('rim');
            this.tweens.add({ targets: this.hoopImg, angle: side * 3, duration: 60, yoyo: true, repeat: 1 });
            this.tweens.add({
              targets: ball,
              x: ball.x + side * 30,
              y: ball.y + 40,
              scale: 1,
              duration: 480,
              ease: 'Bounce.easeOut',
              onComplete: () => {
                audio.play('bounce');
                this.tweens.add({ targets: ball, alpha: 0, duration: 180, onComplete: done });
              },
            });
            this.tweens.add({ targets: sh, x: ball.x + side * 30, y: ball.y + 42, duration: 480 });
          }
        },
      });
    });
  }

  /** Kadir Özçelik: gelir ve 1 adet 3'lük atar (+3 sayı, atış hakkından düşmez). */
  async kadirShot() {
    this.state = 'kadir';
    this.locked = true;
    hud.setAction(null);
    const spot = GYM.spots[4];
    const k = new Actor(this, 'ch_kadir', 14, 112, 'r');
    await this.walkActor(k, spot.x, spot.y + 3, 95);
    if (!this.alive) return;
    k.faceTo(GYM.hoop.x, GYM.hoop.y);
    await this.wait(260);
    if (!this.alive) return;
    audio.play('throw');
    await this.throwBall(k.x, k.y - 16, true);
    if (!this.alive) return;
    applyBonus(this.match, CONFIG.basket.kadirPoints);
    this.updateHud();
    toast(T.helpers.kadirScore, 1800);
    this.walkActor(k, 14, 112, 110).then(() => k.destroy());
    this.afterScore();
  }

  confetti() {
    for (let i = 0; i < 44; i++) {
      const c = this.add.image(Math.random() * CONFIG.width, -6 - Math.random() * 60, 'confetti');
      c.setTint(CONFETTI[i % CONFETTI.length]).setDepth(2000);
      this.tweens.add({
        targets: c,
        y: CONFIG.height + 10,
        x: c.x + (Math.random() - 0.5) * 70,
        angle: 360,
        duration: 1800 + Math.random() * 1600,
        delay: Math.random() * 900,
        repeat: 2,
      });
    }
  }

  /** Final: düdük + kutlama, Burak kapıdan girer, formalar verilir. */
  async finale() {
    this.state = 'done';
    this.locked = true;
    this.cutscene = true;
    hud.setTask('');
    hud.setAction(null);
    this.clearRoom();
    audio.play('whistle');
    audio.vibrate(200);
    this.confetti();
    await this.wait(650);
    if (!this.alive) return;
    audio.play('fanfare');
    await say('alihan', T.final.alihanCheer);
    if (!this.alive) return;
    await this.fadeOut(300);
    if (!this.alive) return;

    const kartal = session.character === 'kartal' ? this.player : this.follower;
    const yagiz = session.character === 'kartal' ? this.follower : this.player;
    kartal.animate(16, 0, 0);
    yagiz.animate(16, 0, 0);
    kartal.setPos(180, 150);
    kartal.face('l');
    yagiz.setPos(208, 150);
    yagiz.face('r');
    this.boss.setPos(152, 150);
    this.boss.face('r');
    this.cameras.main.fadeIn(300, 26, 20, 35);

    const burak = new Actor(this, 'ch_burak', 14, 112, 'r');
    audio.play('door');
    await this.walkActor(burak, 238, 112, 85);
    if (!this.alive) return;
    await this.walkActor(burak, 238, 150, 85);
    if (!this.alive) return;
    burak.face('l');
    // Alihan → Kartal'a, Burak → Yağız Alp'e forma verir (hangi karakter seçilmiş olursa olsun)
    await say('alihan', T.final.alihanToKartal);
    if (!this.alive) return;
    await say('burak', T.final.burakToYagiz);
    if (!this.alive) return;
    await this.fadeOut(400);
    if (!this.alive) return;
    this.scene.start('Ending');
  }
}
