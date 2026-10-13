import { describe, it, expect } from 'vitest';
import {
  segmentHitsRect, hasLineOfSight, inCone, canSee, rayDistance,
  createDetection, updateDetection, createPatrol, updatePatrol,
} from '../src/systems/stealth.js';
import { CONFIG } from '../src/config.js';

const RANGE = CONFIG.stealth.coneRange;
const HALF = (CONFIG.stealth.coneHalfAngleDeg * Math.PI) / 180;
const DETECT = CONFIG.stealth.detectTime;
const guard = { x: 100, y: 100, angle: 0 }; // sağa bakıyor

describe('görüş konisi ve görüş hattı', () => {
  it('koninin içindeki hedef görülür, dışındaki görülmez', () => {
    expect(inCone(guard, 140, 100, RANGE, HALF)).toBe(true);
    expect(inCone(guard, 140, 110, RANGE, HALF)).toBe(true);
    expect(inCone(guard, 60, 100, RANGE, HALF)).toBe(false); // arkasında
    expect(inCone(guard, 100, 150, RANGE, HALF)).toBe(false); // yanında
    expect(inCone(guard, 100 + RANGE + 5, 100, RANGE, HALF)).toBe(false); // menzil dışı
  });

  it('mobilyalar görüş hattını keser', () => {
    const sofa = { x: 115, y: 90, w: 10, h: 20 };
    expect(segmentHitsRect(100, 100, 140, 100, sofa)).toBe(true);
    expect(hasLineOfSight(100, 100, 140, 100, [sofa])).toBe(false);
    expect(canSee(guard, 140, 100, RANGE, HALF, [sofa])).toBe(false);
    expect(canSee(guard, 140, 100, RANGE, HALF, [])).toBe(true);
    // görüşü kesmeyen engel
    expect(canSee(guard, 140, 100, RANGE, HALF, [{ ...sofa, sight: false }])).toBe(true);
    // yoldan uzak mobilya engel olmaz
    expect(canSee(guard, 140, 100, RANGE, HALF, [{ x: 115, y: 130, w: 10, h: 20 }])).toBe(true);
  });

  it('ışın ilk engelde kesilir', () => {
    expect(rayDistance(100, 100, 1, 0, RANGE, [{ x: 120, y: 90, w: 10, h: 20 }])).toBeCloseTo(20);
    expect(rayDistance(100, 100, 1, 0, RANGE, [])).toBe(RANGE);
  });
});

describe('Yağmur yalnızca kartal oyuncağı alındıktan sonra yakalayabilir', () => {
  it('kartal oyuncağı alınmadan önce koni zararsızdır', () => {
    const det = createDetection();
    for (let i = 0; i < 600; i++) {
      expect(updateDetection(det, 1 / 60, true, false, DETECT)).toBe(false);
    }
    expect(det.caught).toBe(false);
    expect(det.timer).toBe(0);
  });

  it('kartal oyuncağı alındıktan sonra ~0,3 sn görülürse yakalanır', () => {
    const det = createDetection();
    let t = 0;
    let caught = false;
    while (!caught && t < 2) {
      caught = updateDetection(det, 1 / 60, true, true, DETECT);
      t += 1 / 60;
    }
    expect(caught).toBe(true);
    expect(t).toBeGreaterThanOrEqual(DETECT - 0.02);
    expect(t).toBeLessThan(DETECT + 0.05);
  });

  it('süre dolmadan görüşten çıkarsa sayaç sıfırlanır', () => {
    const det = createDetection();
    for (let i = 0; i < 12; i++) updateDetection(det, 1 / 60, true, true, DETECT); // 0,2 sn
    expect(det.caught).toBe(false);
    updateDetection(det, 1 / 60, false, true, DETECT);
    expect(det.timer).toBe(0);
    for (let i = 0; i < 12; i++) updateDetection(det, 1 / 60, true, true, DETECT);
    expect(det.caught).toBe(false);
  });

  it('kartal oyuncağı elde ama görülmüyorsa yakalanmaz', () => {
    const det = createDetection();
    for (let i = 0; i < 600; i++) updateDetection(det, 1 / 60, false, true, DETECT);
    expect(det.caught).toBe(false);
  });
});

describe('devriye', () => {
  const wps = [{ x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }, { x: 0, y: 0 }];

  it('rotayı dolaşır ve oyuncudan yavaştır', () => {
    expect(CONFIG.stealth.guardSpeed).toBeLessThan(CONFIG.player.speed);
    const p = createPatrol(wps, 0, 0, { guardSpeed: 50, turnEvery: 999, turnDuration: 1 });
    for (let i = 0; i < 60 * 2.1; i++) updatePatrol(p, 1 / 60);
    expect(p.next).toBe(1);
    for (let i = 0; i < 60 * 6.2; i++) updatePatrol(p, 1 / 60);
    expect(p.next).toBe(0); // tam tur
  });

  it('ara sıra durup arkasına döner', () => {
    const p = createPatrol(wps, 0, 0, { guardSpeed: 10, turnEvery: 1, turnDuration: 1 });
    for (let i = 0; i < 60 * 1.05; i++) updatePatrol(p, 1 / 60);
    const xBefore = p.x;
    for (let i = 0; i < 50; i++) updatePatrol(p, 1 / 60);
    expect(p.moving).toBe(false);
    expect(p.x).toBeCloseTo(xBefore, 5);
    expect(Math.abs(Math.cos(p.angle) + 1)).toBeLessThan(0.05); // sola (geriye) bakıyor
    for (let i = 0; i < 30; i++) updatePatrol(p, 1 / 60);
    expect(p.moving).toBe(true);
  });
});
