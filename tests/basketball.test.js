import { describe, it, expect } from 'vitest';
import { shotParams, indicatorPos, isHit, createGame, applyShot, applyBonus } from '../src/systems/basketball.js';
import { CONFIG } from '../src/config.js';

const B = CONFIG.basket;

describe('basket: skor ve sonuç', () => {
  it('6 atış hakkı ve 12 sayı hedefiyle başlar', () => {
    const g = createGame(B);
    expect(g).toMatchObject({ score: 0, shotsLeft: 6, target: 12, finished: false, won: false });
  });

  it('skor 12 olunca anında kazanılır', () => {
    const g = createGame(B);
    for (let i = 0; i < 4; i++) applyShot(g, 3, true);
    expect(g).toMatchObject({ score: 12, shotsLeft: 2, finished: true, won: true });
  });

  it('12yi geçince de kazanılır (11 + 3 = 14)', () => {
    const g = createGame(B);
    applyShot(g, 3, true); applyShot(g, 3, true); applyShot(g, 3, true); applyShot(g, 2, true);
    expect(g.score).toBe(11);
    expect(g.finished).toBe(false);
    applyShot(g, 3, true);
    expect(g).toMatchObject({ score: 14, finished: true, won: true });
  });

  it('6 atış bittiğinde skor 12nin altındaysa kaybedilir', () => {
    const g = createGame(B);
    for (let i = 0; i < 5; i++) applyShot(g, 2, true);
    expect(g.finished).toBe(false);
    applyShot(g, 3, false);
    expect(g).toMatchObject({ score: 10, shotsLeft: 0, finished: true, won: false });
  });

  it('6 atış sınırı aşılamaz', () => {
    const g = createGame(B);
    for (let i = 0; i < 10; i++) applyShot(g, 1, true);
    expect(g.shotsLeft).toBe(0);
    expect(g.score).toBe(6);
    expect(g.won).toBe(false);
  });

  it('son atışta hedefe ulaşmak kazandırır', () => {
    const g = createGame(B);
    for (let i = 0; i < 6; i++) applyShot(g, 2, true);
    expect(g).toMatchObject({ score: 12, shotsLeft: 0, finished: true, won: true });
  });
});

describe('Kadir bonusu', () => {
  it('+3 sayı verir ve atış hakkından düşmez', () => {
    const g = createGame(B);
    applyShot(g, 2, true);
    expect(applyBonus(g, B.kadirPoints)).toBe(true);
    expect(g.score).toBe(5);
    expect(g.shotsLeft).toBe(5);
  });

  it('bonus hedefe ulaştırırsa anında kazanılır', () => {
    const g = createGame(B);
    applyShot(g, 3, true); applyShot(g, 3, true); applyShot(g, 3, true);
    applyBonus(g, 3);
    expect(g).toMatchObject({ score: 12, shotsLeft: 3, finished: true, won: true });
  });

  it('atışlar bittikten sonra kullanılamaz', () => {
    const g = createGame(B);
    for (let i = 0; i < 6; i++) applyShot(g, 1, false);
    expect(applyBonus(g, 3)).toBe(false);
    expect(g.score).toBe(0);
  });
});

describe('nişan barı', () => {
  it('başlangıç değerleri tasarımdaki tabloyla aynı', () => {
    expect(shotParams(1, 'yagiz', B, CONFIG.bonus)).toEqual({ zone: 0.35, period: 1.4 });
    expect(shotParams(2, 'yagiz', B, CONFIG.bonus)).toEqual({ zone: 0.2, period: 1.1 });
    expect(shotParams(3, 'yagiz', B, CONFIG.bonus)).toEqual({ zone: 0.12, period: 0.9 });
  });

  it('mesafe arttıkça yeşil alan daralır ve gösterge hızlanır', () => {
    const p = [1, 2, 3].map((n) => shotParams(n, 'yagiz', B, CONFIG.bonus));
    expect(p[0].zone).toBeGreaterThan(p[1].zone);
    expect(p[1].zone).toBeGreaterThan(p[2].zone);
    expect(p[0].period).toBeGreaterThan(p[1].period);
    expect(p[1].period).toBeGreaterThan(p[2].period);
  });

  it('Kartal: yeşil alan %40 daha geniş, gösterge %15 daha yavaş', () => {
    for (const pts of [1, 2, 3]) {
      const y = shotParams(pts, 'yagiz', B, CONFIG.bonus);
      const k = shotParams(pts, 'kartal', B, CONFIG.bonus);
      expect(k.zone).toBeCloseTo(y.zone * 1.4, 6);
      expect(1 / k.period).toBeCloseTo((1 / y.period) * 0.85, 6); // hız = 1/süre
    }
  });

  it('gösterge ileri-geri gider', () => {
    expect(indicatorPos(0, 1)).toBe(0);
    expect(indicatorPos(0.5, 1)).toBeCloseTo(0.5);
    expect(indicatorPos(1, 1)).toBeCloseTo(1);
    expect(indicatorPos(1.25, 1)).toBeCloseTo(0.75);
    expect(indicatorPos(2, 1)).toBeCloseTo(0);
    expect(indicatorPos(2.5, 1)).toBeCloseTo(0.5);
  });

  it('sonuç deterministik: gösterge yeşil alandaysa girer, değilse girmez', () => {
    expect(isHit(0.5, 0.12)).toBe(true);
    expect(isHit(0.56, 0.12)).toBe(true);
    expect(isHit(0.44, 0.12)).toBe(true);
    expect(isHit(0.57, 0.12)).toBe(false);
    expect(isHit(0.1, 0.35)).toBe(false);
    expect(isHit(0.33, 0.35)).toBe(true);
  });
});
