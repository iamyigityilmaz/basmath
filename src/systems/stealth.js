// Gizlilik kuralları: görüş konisi, görüş hattı, yakalanma ve devriye (saf mantık, Phaser'dan bağımsız).

/** (x1,y1)-(x2,y2) doğru parçası r = {x,y,w,h} dikdörtgenini kesiyor mu? */
export function segmentHitsRect(x1, y1, x2, y2, r) {
  let t0 = 0;
  let t1 = 1;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const p = [-dx, dx, -dy, dy];
  const q = [x1 - r.x, r.x + r.w - x1, y1 - r.y, r.y + r.h - y1];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) {
        if (t > t1) return false;
        if (t > t0) t0 = t;
      } else {
        if (t < t0) return false;
        if (t < t1) t1 = t;
      }
    }
  }
  return t0 <= t1;
}

/** Işının (ox,oy)+(dx,dy)·t ilk çarptığı engele uzaklığı; çarpmazsa maxDist. (dx,dy) birim vektör. */
export function rayDistance(ox, oy, dx, dy, maxDist, rects) {
  let best = maxDist;
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (r.sight === false) continue;
    let tmin = 0;
    let tmax = best;
    let hit = true;
    if (dx !== 0) {
      let a = (r.x - ox) / dx;
      let b = (r.x + r.w - ox) / dx;
      if (a > b) { const t = a; a = b; b = t; }
      if (a > tmin) tmin = a;
      if (b < tmax) tmax = b;
    } else if (ox < r.x || ox > r.x + r.w) hit = false;
    if (hit && dy !== 0) {
      let a = (r.y - oy) / dy;
      let b = (r.y + r.h - oy) / dy;
      if (a > b) { const t = a; a = b; b = t; }
      if (a > tmin) tmin = a;
      if (b < tmax) tmax = b;
    } else if (hit && (oy < r.y || oy > r.y + r.h)) hit = false;
    if (hit && tmin <= tmax && tmin < best) best = tmin;
  }
  return best;
}

/** Mobilyalar görüş hattını keser. `sight: false` olan engeller görüşü kesmez. */
export function hasLineOfSight(ax, ay, bx, by, rects) {
  const dx = bx - ax;
  const dy = by - ay;
  const d = Math.hypot(dx, dy);
  if (d < 1e-6) return true;
  return rayDistance(ax, ay, dx / d, dy / d, d, rects) >= d - 1e-6;
}

export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/** Hedef, bekçinin görüş konisinin içinde mi? guard: {x, y, angle} */
export function inCone(guard, tx, ty, range, halfAngle) {
  const dx = tx - guard.x;
  const dy = ty - guard.y;
  const d2 = dx * dx + dy * dy;
  if (d2 > range * range) return false;
  if (d2 < 1) return true;
  return Math.abs(angleDiff(Math.atan2(dy, dx), guard.angle)) <= halfAngle;
}

/** Konide VE görüş hattında mı? */
export function canSee(guard, tx, ty, range, halfAngle, rects) {
  return inCone(guard, tx, ty, range, halfAngle) && hasLineOfSight(guard.x, guard.y, tx, ty, rects);
}

export function createDetection() {
  return { timer: 0, caught: false };
}

/**
 * Yakalanma sayacı. Kartal oyuncağı alınmadan ÖNCE koni zararsızdır: Yağmur oyuncuyu umursamaz.
 * Alındıktan sonra oyuncu `detectTime` sn boyunca görülürse yakalanır.
 */
export function updateDetection(det, dt, seen, hasEagle, detectTime) {
  if (det.caught) return true;
  if (!hasEagle || !seen) {
    det.timer = 0;
    return false;
  }
  det.timer += dt;
  if (det.timer >= detectTime) det.caught = true;
  return det.caught;
}

/**
 * Devriye: belirli bir rotada yavaşça dolaşır, ara sıra durup arkasına bakar.
 * cfg: { guardSpeed, turnEvery, turnDuration }
 */
export function createPatrol(waypoints, x, y, cfg) {
  return {
    waypoints,
    next: 0,
    x,
    y,
    angle: Math.atan2(waypoints[0].y - y, waypoints[0].x - x),
    moveAngle: 0,
    turnTimer: 0,
    lookTimer: 0,
    moving: true,
    speed: cfg.guardSpeed,
    turnEvery: cfg.turnEvery,
    turnDuration: cfg.turnDuration,
  };
}

const TURN_RATE = 5; // rad/sn: bakış yönü yumuşak döner

export function updatePatrol(p, dt) {
  const wp = p.waypoints[p.next];
  const dx = wp.x - p.x;
  const dy = wp.y - p.y;
  const dist = Math.hypot(dx, dy);
  p.moveAngle = Math.atan2(dy, dx);
  let target = p.moveAngle;
  if (p.lookTimer > 0) {
    p.lookTimer -= dt;
    p.moving = false;
    target = p.moveAngle + Math.PI;
  } else {
    p.moving = true;
    const step = p.speed * dt;
    if (dist <= step) {
      p.x = wp.x;
      p.y = wp.y;
      p.next = (p.next + 1) % p.waypoints.length;
    } else {
      p.x += (dx / dist) * step;
      p.y += (dy / dist) * step;
    }
    p.turnTimer += dt;
    if (p.turnTimer >= p.turnEvery) {
      p.turnTimer = 0;
      p.lookTimer = p.turnDuration;
    }
  }
  const diff = angleDiff(target, p.angle);
  const maxTurn = TURN_RATE * dt;
  p.angle += Math.abs(diff) <= maxTurn ? diff : Math.sign(diff) * maxTurn;
  return p;
}
