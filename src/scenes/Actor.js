// Yürüyen karakter: 4 yön, yön başına 3 kare (0 = duruş, 1 ve 2 = adım).
const FRAMES = {
  d: ['d0', 'd1', 'd2'],
  u: ['u0', 'u1', 'u2'],
  l: ['l0', 'l1', 'l2'],
  r: ['r0', 'r1', 'r2'],
};
const CYCLE = [1, 0, 2, 0];
const STEP_MS = 130;

export class Actor {
  constructor(scene, texKey, x, y, dir) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.dir = dir || 'd';
    this.t = 0;
    this.step = 0;
    this.moving = false;
    this.shadow = scene.add.image(x, y, 'shadow').setOrigin(0.5, 0.5).setAlpha(0.35);
    this.sprite = scene.add.image(x, y, texKey, FRAMES[this.dir][0]).setOrigin(0.5, 1);
    this.sync();
  }

  setPos(x, y) {
    this.x = x;
    this.y = y;
    this.sync();
  }

  face(dir) {
    if (dir === this.dir) return;
    this.dir = dir;
    this.sprite.setFrame(FRAMES[dir][this.moving ? CYCLE[this.step] : 0]);
  }

  /** Bir noktaya doğru dönsün. */
  faceTo(x, y) {
    const dx = x - this.x;
    const dy = y - this.y;
    if (Math.abs(dx) > Math.abs(dy)) this.face(dx < 0 ? 'l' : 'r');
    else this.face(dy < 0 ? 'u' : 'd');
  }

  /** Hız vektörüne göre yön ve yürüme animasyonu. */
  animate(dtMs, vx, vy) {
    const moving = vx !== 0 || vy !== 0;
    if (moving) {
      let dir = this.dir;
      if (Math.abs(vx) > Math.abs(vy) * 1.2) dir = vx < 0 ? 'l' : 'r';
      else if (Math.abs(vy) > Math.abs(vx) * 1.2) dir = vy < 0 ? 'u' : 'd';
      this.t += dtMs;
      let changed = dir !== this.dir || !this.moving;
      if (this.t >= STEP_MS) {
        this.t -= STEP_MS;
        this.step = (this.step + 1) & 3;
        changed = true;
      }
      this.dir = dir;
      if (changed) this.sprite.setFrame(FRAMES[dir][CYCLE[this.step]]);
    } else if (this.moving) {
      this.t = 0;
      this.step = 0;
      this.sprite.setFrame(FRAMES[this.dir][0]);
    }
    this.moving = moving;
  }

  sync() {
    this.sprite.x = Math.round(this.x);
    this.sprite.y = Math.round(this.y);
    this.sprite.depth = this.y;
    this.shadow.x = this.sprite.x;
    this.shadow.y = this.sprite.y - 1;
    this.shadow.depth = this.y - 0.5;
  }

  setVisible(v) {
    this.sprite.setVisible(v);
    this.shadow.setVisible(v);
  }

  destroy() {
    this.sprite.destroy();
    this.shadow.destroy();
  }
}
