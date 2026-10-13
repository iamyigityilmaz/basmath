// Tüm odaların ortak tabanı: yürüme, çarpışma, takipçi kuzen, etkileşim, başarısızlık/başarı akışı.
import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { input } from '../systems/input.js';
import { audio } from '../systems/audio.js';
import { session, otherKid, roomCleared, roomFailed, ROOM_SCENES } from '../systems/session.js';
import { helperStatus, useHelper } from '../systems/helpers.js';
import { ensureRoomTexture } from '../art/textures.js';
import { hud, toast, titleCard } from '../ui/hud.js';
import { helperBar, callAnimation } from '../ui/helperBar.js';
import { pauseMenu } from '../ui/menus.js';
import { say } from '../ui/dialog.js';
import { goto } from '../nav.js';
import { T } from '../data/texts.js';
import { Actor } from './Actor.js';

const HALF_W = 4; // oyuncunun ayak kutusu
const FOOT_H = 4;
const TRAIL = 64;
const DOOR_Y = 112;

export class RoomBase extends Phaser.Scene {
  create() {
    this.alive = true;
    this.locked = false;
    this.helperBusy = false;
    this.helperHold = false;
    this.failing = false;
    this.cutscene = false;
    this.customAction = false;
    this.exitOpen = false;
    this.leaving = false;
    this.obstacles = [];
    this.interactables = [];
    this.bounds = { x1: 10, y1: 34, x2: CONFIG.width - 10, y2: CONFIG.height - 9 };
    this.move = { x: 0, y: 0 };
    this.trail = new Float32Array(TRAIL * 2);
    this.trailHead = 0;
    this.events.once('shutdown', () => {
      this.alive = false;
      hud.hide();
      helperBar.hide();
      this.onShutdown();
    });

    this.buildRoom();

    const start = this.startPos();
    this.player = new Actor(this, `ch_${session.character}`, start.x, start.y, 'r');
    this.follower = new Actor(this, `ch_${otherKid()}`, start.x - 12, start.y, 'r');
    for (let i = 0; i < TRAIL; i++) {
      this.trail[i * 2] = start.x - 12;
      this.trail[i * 2 + 1] = start.y;
    }
    this.lastTrailX = start.x;
    this.lastTrailY = start.y;

    hud.show(() => this.pause());
    helperBar.show({
      status: (id) => helperStatus(session.helpers, id, this.helperContext()),
      use: (id) => this.callHelper(id),
    });
    input.setHandlers({
      pause: () => this.pause(),
      helper: (i) => helperBar.trigger(i),
    });
    this.time.addEvent({ delay: 200, loop: true, callback: () => helperBar.refresh() });

    const info = this.roomInfo();
    if (info) titleCard(info.zone, info.room);
    audio.startMusic();
    input.clearEdges();
    this.cameras.main.fadeIn(350, 26, 20, 35);
    this.afterCreate();
  }

  // ---- alt sınıfların doldurduğu kancalar ----
  buildRoom() {}
  afterCreate() {}
  roomInfo() { return null; }
  roomIndex() { return 0; }
  startPos() { return { x: 26, y: DOOR_Y + 2 }; }
  onShutdown() {}
  roomUpdate() {}
  /** Yardımcıların işe yarayıp yaramadığını belirleyen bağlam. */
  helperContext() { return {}; }
  /** Çağırma animasyonu bittikten sonra yardımcının etkisi. */
  applyHelper() {}

  // ---- kurulum yardımcıları ----
  setBackground(key) {
    ensureRoomTexture(this, key);
    this.add.image(0, 0, key).setOrigin(0, 0).setDepth(-1000);
  }

  /** Eşya yerleştirir. Engel kutusu: görselin alt kısmı (ya da verilen dikdörtgen). */
  prop(key, x, y, solid) {
    const img = this.add.image(x, y, key).setOrigin(0, 0);
    img.depth = y + img.height - 2;
    let ob = null;
    if (solid !== false) {
      const s = solid || {};
      const h = s.h != null ? s.h : Math.max(8, Math.round(img.height * 0.5));
      ob = this.addObstacle(x + 1, y + img.height - h - 1, img.width - 2, h, s.sight);
    }
    return { img, ob };
  }

  addObstacle(x, y, w, h, blocksSight) {
    const o = { x, y, w, h, sight: blocksSight !== false };
    this.obstacles.push(o);
    return o;
  }

  removeObstacle(o) {
    const i = this.obstacles.indexOf(o);
    if (i >= 0) this.obstacles.splice(i, 1);
  }

  /** Odanın sahibi. Yanına gidip "Konuş" denince onTalk çağrılır. */
  addBoss(id, x, y, dir) {
    this.bossId = id;
    this.boss = new Actor(this, `ch_${id}`, x, y, dir || 'l');
    this.bossOb = this.addObstacle(x - 6, y - 5, 12, 6, false);
    this.bossTalk = this.addInteractable(x, y - 2, 24, T.actions.talk, () => {
      this.boss.faceTo(this.player.x, this.player.y);
      this.onTalk();
    });
    return this.boss;
  }

  onTalk() {}

  addInteractable(x, y, r, label, fn) {
    const it = { x, y, r, label, fn, active: true };
    this.interactables.push(it);
    return it;
  }

  /** Sağ duvardaki çıkış kapısı (başta kapalı). */
  addExitDoor() {
    this.exitDoor = this.add.image(CONFIG.width - 7, DOOR_Y - 17, 'doorV').setOrigin(0, 0).setDepth(DOOR_Y + 20);
  }

  openExitDoor() {
    if (this.exitDoor) {
      this.exitDoor.destroy();
      this.exitDoor = null;
    }
    this.exitOpen = true;
    audio.play('door');
  }

  // ---- akış yardımcıları ----
  wait(ms) {
    return new Promise((resolve) => this.time.delayedCall(ms, resolve));
  }

  fadeOut(ms) {
    return new Promise((resolve) => {
      this.cameras.main.once('camerafadeoutcomplete', resolve);
      this.cameras.main.fadeOut(ms || 350, 26, 20, 35);
    });
  }

  /** Bir karakteri (NPC) verilen noktaya yürütür. */
  walkActor(actor, x, y, speed) {
    return new Promise((resolve) => {
      const sx = actor.x;
      const sy = actor.y;
      const o = { t: 0 };
      this.tweens.add({
        targets: o,
        t: 1,
        duration: Math.max(60, (Math.hypot(x - sx, y - sy) / speed) * 1000),
        onUpdate: () => {
          const nx = sx + (x - sx) * o.t;
          const ny = sy + (y - sy) * o.t;
          actor.animate(16, nx - actor.x, ny - actor.y);
          actor.x = nx;
          actor.y = ny;
          actor.sync();
        },
        onComplete: () => {
          actor.animate(16, 0, 0);
          actor.sync();
          resolve();
        },
      });
    });
  }

  /** Ortak "oda başarısız" akışı: boss repliği → kararma → odanın başı (her şey sıfırlanır). */
  async failRoom(line) {
    if (this.failing || !this.alive) return;
    this.failing = true;
    this.locked = true;
    hud.setAction(null);
    audio.play('wrong');
    audio.vibrate(120);
    await this.wait(250);
    if (!this.alive) return;
    await say(this.bossId, line);
    if (!this.alive) return;
    roomFailed();
    helperBar.refresh();
    await this.fadeOut(400);
    if (!this.alive) return;
    this.failing = false;
    this.scene.restart();
  }

  /** Oda geçildi: checkpoint kaydedilir. */
  clearRoom() {
    roomCleared(this.roomIndex());
    helperBar.refresh();
  }

  async leaveTo(key) {
    if (this.leaving) return;
    this.leaving = true;
    this.locked = true;
    hud.setAction(null);
    await this.fadeOut(350);
    if (!this.alive) return;
    this.scene.start(key);
  }

  nextRoomKey() {
    return ROOM_SCENES[this.roomIndex() + 1];
  }

  pause() {
    if (!this.alive || this.scene.isPaused()) return;
    this.scene.pause();
    audio.play('select');
    pauseMenu({
      onResume: () => {
        if (this.alive) this.scene.resume();
        input.clearEdges();
      },
      onMenu: () => goto('Menu'),
    });
  }

  /** Yardımcı barından / 1–4 tuşlarından çağrılır. */
  async callHelper(id) {
    if (!this.alive || this.helperBusy || this.failing || this.leaving || this.scene.isPaused()) return;
    const ctx = this.helperContext();
    if (ctx.busy) return;
    const st = useHelper(session.helpers, id, ctx);
    if (st === 'useless') {
      toast(T.helpers.useless);
      audio.play('bounce');
      return;
    }
    if (st === 'spent') {
      toast(T.helpers.used);
      audio.play('bounce');
      return;
    }
    helperBar.refresh();
    this.helperBusy = true;
    this.helperHold = true;
    hud.setAction(null);
    await callAnimation(id);
    if (!this.alive) return;
    this.helperBusy = false;
    this.helperHold = false;
    this.applyHelper(id);
    helperBar.refresh();
  }

  /** Ayak kutusu (x,y) konumunda bir engele ya da duvara çarpıyor mu? */
  blocked(x, y) {
    const b = this.bounds;
    if (x - HALF_W < b.x1 || x + HALF_W > b.x2 || y - FOOT_H < b.y1 || y > b.y2) return true;
    const obs = this.obstacles;
    for (let i = 0; i < obs.length; i++) {
      const o = obs[i];
      if (x + HALF_W > o.x && x - HALF_W < o.x + o.w && y > o.y && y - FOOT_H < o.y + o.h) return true;
    }
    return false;
  }

  update(time, delta) {
    if (!this.alive) return;
    const dt = Math.min(delta, 50);
    const p = this.player;
    let vx = 0;
    let vy = 0;
    const frozen = this.locked || this.helperHold;
    if (!frozen) {
      const m = input.getMove(this.move);
      vx = m.x;
      vy = m.y;
    }
    if (vx !== 0 || vy !== 0) {
      const sp = (CONFIG.player.speed * dt) / 1000;
      const nx = p.x + vx * sp;
      const ny = p.y + vy * sp;
      if (!this.blocked(nx, p.y)) p.x = nx;
      if (!this.blocked(p.x, ny)) p.y = ny;
    }
    p.animate(dt, vx, vy);
    p.sync();
    this.updateFollower(dt);

    // etkileşim
    if (!frozen && !input.isModal()) {
      let best = null;
      let bestD = Infinity;
      const list = this.interactables;
      for (let i = 0; i < list.length; i++) {
        const it = list[i];
        if (!it.active) continue;
        const dx = it.x - p.x;
        const dy = it.y - p.y;
        const d = dx * dx + dy * dy;
        if (d < it.r * it.r && d < bestD) {
          best = it;
          bestD = d;
        }
      }
      hud.setAction(best ? best.label : this.idleAction());
      if (input.consumeAction()) {
        if (best) best.fn(best);
        else this.onIdleAction();
      }
      if (this.exitOpen && !this.leaving && p.x > CONFIG.width - 20 && Math.abs(p.y - DOOR_Y) < 14) {
        this.leaveTo(this.nextRoomKey());
      }
    } else if (!this.customAction) {
      hud.setAction(null);
    }

    this.roomUpdate(dt, time);
  }

  idleAction() { return null; }
  onIdleAction() {}

  /** Takipçi kuzen, oyuncunun izinden birkaç adım geriden gelir (yalnızca görsel). */
  updateFollower(dt) {
    if (this.cutscene) return;
    const p = this.player;
    const f = this.follower;
    const dx = p.x - this.lastTrailX;
    const dy = p.y - this.lastTrailY;
    let fvx = 0;
    let fvy = 0;
    if (dx * dx + dy * dy >= 1.44) {
      this.trailHead = (this.trailHead + 1) % TRAIL;
      this.trail[this.trailHead * 2] = p.x;
      this.trail[this.trailHead * 2 + 1] = p.y;
      this.lastTrailX = p.x;
      this.lastTrailY = p.y;
      const i = (this.trailHead + TRAIL - CONFIG.player.followDistance) % TRAIL;
      const tx = this.trail[i * 2];
      const ty = this.trail[i * 2 + 1];
      fvx = tx - f.x;
      fvy = ty - f.y;
      f.x = tx;
      f.y = ty;
    }
    f.animate(dt, fvx, fvy);
    f.sync();
  }
}
