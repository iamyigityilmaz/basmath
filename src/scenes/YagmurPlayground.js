// Oda 2 — Yağmur Alkanat'ın Çocuk Oyun Alanı (Anneler Bölgesi):
// kartal oyuncağını bul, Yağmur'a yakalanmadan girilen kapıdan çık.
import { RoomBase } from './RoomBase.js';
import { Actor } from './Actor.js';
import { CONFIG } from '../config.js';
import { input } from '../systems/input.js';
import { audio } from '../systems/audio.js';
import { shuffle } from '../systems/quiz.js';
import { canSee, rayDistance, createDetection, updateDetection, createPatrol, updatePatrol } from '../systems/stealth.js';
import { DECOY_IDS } from '../art/props.js';
import { IMG } from '../art/textures.js';
import { hud, toast, toyView, bigCard } from '../ui/hud.js';
import { say } from '../ui/dialog.js';
import { T } from '../data/texts.js';

const DOOR_Y = 112;
const RAYS = 14;
const ROUTE = [
  { x: 92, y: 104 }, { x: 150, y: 74 }, { x: 250, y: 74 },
  { x: 274, y: 120 }, { x: 250, y: 144 }, { x: 150, y: 144 },
];

export class YagmurPlayground extends RoomBase {
  constructor() {
    super('YagmurPlayground');
  }

  roomIndex() { return 1; }
  roomInfo() { return { zone: T.zones.mothers, room: T.rooms.yagmur }; }

  buildRoom() {
    this.setBackground('bg_yagmur');
    this.spots = [];
    // kaplar: sandık, kutu, top havuzu, çadır, dolap
    this.container('wardrobe', 58, 8, { h: 8 });
    this.container('tent', 282, 42, { h: 16 });
    this.container('ballpool', 286, 138, { h: 24 });
    this.container('chest', 108, 56);
    this.container('chest', 228, 158);
    this.container('box', 98, 150);
    this.container('box', 340, 118);
    // saklanma yerleri
    this.prop('toyshelf', 150, 10, { h: 8 });
    this.prop('slide', 166, 80, { h: 20 });
    // yerde duran oyuncakların yerleri
    this.looseAt = [{ x: 140, y: 124 }, { x: 246, y: 58 }, { x: 204, y: 152 }];

    this.cone = this.add.graphics().setDepth(1);
    this.beam = this.add.graphics().setDepth(900).setVisible(false);
    this.addBoss('yagmur', 70, 112, 'l');
    this.bang = this.add.image(0, 0, 'bang').setOrigin(0.5, 1).setDepth(950).setVisible(false);
    this.markerImg = this.add.image(0, 0, 'marker').setDepth(940).setVisible(false);
  }

  container(key, x, y, solid) {
    const { img, ob } = this.prop(key, x, y, solid);
    const spot = {
      kind: 'container',
      x: ob.x + ob.w / 2,
      y: ob.y + ob.h / 2,
      toy: null,
      taken: false,
      img,
    };
    spot.it = this.addInteractable(spot.x, spot.y + 2, Math.max(ob.w, ob.h) / 2 + 13, T.actions.look, () => this.look(spot));
    spot.it.active = false;
    this.spots.push(spot);
    return spot;
  }

  afterCreate() {
    this.started = false;
    this.hasEagle = false;
    this.won = false;
    this.eagleSpot = null;
    this.det = createDetection();
    this.patrol = null;
    this.guardPos = { x: 0, y: 0, angle: 0 };
    this.needMsgAt = 0;
    this.marked = false;
    this.omerhan = null;
    this.beamUntil = 0;
    this.sightRects = this.obstacles.filter((o) => o.sight !== false);

    // Oyuncaklar her denemede yeniden karıştırılır; kartal oyuncağı rastgele bir kabın içindedir
    const containers = this.spots.slice();
    const decoys = shuffle(DECOY_IDS);
    this.eagleSpot = containers[Math.floor(Math.random() * containers.length)];
    containers.forEach((s) => {
      s.toy = s === this.eagleSpot ? 'eagle' : decoys.pop();
    });
    this.looseAt.forEach((pos) => {
      const toy = decoys.pop();
      if (!toy) return;
      const img = this.add.image(pos.x, pos.y, `toy_${toy}`).setOrigin(0.5, 1);
      img.depth = pos.y - 3;
      const spot = { kind: 'loose', x: pos.x, y: pos.y - 4, toy, taken: false, img };
      spot.it = this.addInteractable(spot.x, spot.y, 15, T.actions.look, () => this.look(spot));
      spot.it.active = false;
      this.spots.push(spot);
    });
    hud.setTask(T.yagmur.hudTalk);
  }

  helperContext() {
    return { room: 'yagmur', searching: this.started && !this.hasEagle && !this.locked && !this.marked };
  }

  /** Ömerhan Özgüven: feneriyle kartal oyuncağının yerini gösterir. */
  applyHelper(id) {
    if (id !== 'omerhan' || !this.eagleSpot) return;
    this.marked = true;
    this.omerhan = new Actor(this, 'ch_omerhan', 22, DOOR_Y - 8, 'r');
    this.omerhan.faceTo(this.eagleSpot.x, this.eagleSpot.y);
    this.beamUntil = this.time.now + CONFIG.omerhan.beamMs;
    this.beam.setVisible(true);
    audio.play('magic');
  }

  async onTalk() {
    if (this.started || this.locked) return;
    this.locked = true;
    this.bossTalk.active = false;
    hud.setAction(null);
    await say('yagmur', T.yagmur.intro);
    if (!this.alive) return;
    this.started = true;
    this.removeObstacle(this.bossOb);
    this.spots.forEach((s) => { s.it.active = true; });
    this.patrol = createPatrol(ROUTE, this.boss.x, this.boss.y, CONFIG.stealth);
    hud.setTask(T.yagmur.hud);
    this.locked = false;
  }

  /** Bak: oyuncak büyük gösterilir (adı yazmaz). Bakmak serbest, almak kesin karardır. */
  async look(spot) {
    if (this.locked) return;
    if (spot.taken) {
      toast(T.yagmur.empty);
      return;
    }
    this.locked = true;
    hud.setAction(null);
    audio.play('open');
    const choice = await toyView(IMG.toy[spot.toy]);
    if (!this.alive) return;
    this.locked = false;
    if (choice !== 'take') return;
    if (spot.toy !== 'eagle') {
      // yanlış oyuncak → oda anında başarısız
      this.failRoom(T.yagmur.fail);
      return;
    }
    spot.taken = true;
    this.hasEagle = true;
    this.markerImg.setVisible(false);
    audio.play('pick');
    audio.vibrate(40);
    toast(T.yagmur.gotEagle, 2600);
  }

  async win() {
    this.won = true;
    this.locked = true;
    hud.setAction(null);
    this.cone.clear();
    this.clearRoom();
    audio.play('door');
    await bigCard(T.zones.mothersCleared, { sound: 'fanfare' });
    if (!this.alive) return;
    this.leaveTo(this.nextRoomKey());
  }

  async caught() {
    this.locked = true;
    this.bang.setPosition(this.boss.x, this.boss.y - this.boss.sprite.height - 1).setVisible(true);
    this.boss.faceTo(this.player.x, this.player.y);
    audio.play('alert');
    audio.vibrate(200);
    await this.wait(700);
    if (!this.alive) return;
    this.failRoom(T.yagmur.fail);
  }

  roomUpdate(dt, time) {
    if (this.omerhan) this.updateBeam(time);
    if (!this.started || this.won) return;
    const p = this.player;
    const g = this.guardPos;
    const frozen = this.locked || this.helperHold || input.isModal();

    if (!frozen && this.patrol) {
      updatePatrol(this.patrol, dt / 1000);
      const pt = this.patrol;
      const b = this.boss;
      b.x = pt.x;
      b.y = pt.y;
      b.animate(dt, pt.moving ? Math.cos(pt.moveAngle) : 0, pt.moving ? Math.sin(pt.moveAngle) : 0);
      const c = Math.cos(pt.angle);
      const s = Math.sin(pt.angle);
      b.face(Math.abs(c) > Math.abs(s) ? (c < 0 ? 'l' : 'r') : (s < 0 ? 'u' : 'd'));
      b.sync();
    }
    if (this.patrol) {
      g.x = this.patrol.x;
      g.y = this.patrol.y - 2;
      g.angle = this.patrol.angle;
      this.drawCone(g);
    }

    if (frozen) return;
    const range = CONFIG.stealth.coneRange;
    const half = (CONFIG.stealth.coneHalfAngleDeg * Math.PI) / 180;
    // Yalnızca kontrol edilen karakter algılanır; takipçi kuzen algılanmaz
    const seen = canSee(g, p.x, p.y - 2, range, half, this.sightRects);
    if (updateDetection(this.det, dt / 1000, seen, this.hasEagle, CONFIG.stealth.detectTime)) {
      this.caught();
      return;
    }

    // çıkış: girilen kapı
    if (p.x < 19 && Math.abs(p.y - DOOR_Y) < 15) {
      if (this.hasEagle) this.win();
      else if (time > this.needMsgAt) {
        this.needMsgAt = time + 2600;
        toast(T.yagmur.needEagle);
        audio.play('bounce');
      }
    }
  }

  /** Görüş konisi: mobilyalarda kesilir. Kartal oyuncağı alınınca kırmızıya döner. */
  drawCone(g) {
    const range = CONFIG.stealth.coneRange;
    const half = (CONFIG.stealth.coneHalfAngleDeg * Math.PI) / 180;
    const gr = this.cone;
    gr.clear();
    const danger = this.hasEagle;
    gr.fillStyle(danger ? 0xff3b30 : 0xffe36e, danger ? 0.36 + 0.3 * Math.min(1, this.det.timer / CONFIG.stealth.detectTime) : 0.3);
    gr.beginPath();
    gr.moveTo(g.x, g.y);
    for (let i = 0; i <= RAYS; i++) {
      const a = g.angle - half + (i / RAYS) * half * 2;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      const d = rayDistance(g.x, g.y, dx, dy, range, this.sightRects);
      gr.lineTo(g.x + dx * d, g.y + dy * d);
    }
    gr.closePath();
    gr.fillPath();
  }

  /** ~5 sn ışık huzmesi, sonra kabın üstünde küçük bir işaret kalır. */
  updateBeam(time) {
    const t = this.eagleSpot;
    const o = this.omerhan;
    if (time < this.beamUntil) {
      const gr = this.beam;
      gr.clear();
      const ox = o.x + 4;
      const oy = o.y - 12;
      const ang = Math.atan2(t.y - oy, t.x - ox);
      const w = 13 + Math.sin(time / 90) * 2;
      const px = -Math.sin(ang) * w;
      const py = Math.cos(ang) * w;
      gr.fillStyle(0xffe9a0, 0.3 + Math.sin(time / 130) * 0.06);
      gr.fillTriangle(ox, oy, t.x + px, t.y - 6 + py, t.x - px, t.y - 6 - py);
      gr.fillStyle(0xfff8d0, 0.45);
      gr.fillCircle(t.x, t.y - 6, w + 2);
    } else {
      this.beam.clear();
      this.beam.setVisible(false);
      o.destroy();
      this.omerhan = null;
      if (!this.hasEagle) {
        this.markerImg.setPosition(t.x, t.img.y - 4).setVisible(true);
        this.tweens.add({ targets: this.markerImg, y: this.markerImg.y - 3, duration: 500, yoyo: true, repeat: -1 });
      }
    }
  }
}
