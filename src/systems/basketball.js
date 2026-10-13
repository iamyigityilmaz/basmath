// Basketbol kuralları (saf mantık, Phaser'dan bağımsız). Sonuç deterministiktir, şans yoktur.

/**
 * Atış türüne ve karaktere göre nişan barı değerleri.
 * Kartal: yeşil alan %40 daha geniş, gösterge %15 daha yavaş (config.js'ten ayarlanır).
 */
export function shotParams(points, character, basketCfg, bonusCfg) {
  const base = basketCfg.shotTypes[points];
  let zone = base.zone;
  let period = base.period;
  if (character === 'kartal' && bonusCfg && bonusCfg.kartal) {
    zone *= bonusCfg.kartal.zoneMul;
    period /= bonusCfg.kartal.speedMul;
  }
  return { zone: Math.min(zone, 0.95), period };
}

/** Göstergenin t anındaki konumu (0..1). Bar üzerinde ileri-geri gider; `period` tek geçiş süresidir. */
export function indicatorPos(t, period) {
  const ph = (t / period) % 2;
  return ph <= 1 ? ph : 2 - ph;
}

/** Gösterge yeşil alanda mı? Yeşil alan barın ortasındadır. */
export function isHit(pos, zone) {
  return Math.abs(pos - 0.5) <= zone / 2 + 1e-9;
}

export function createGame(basketCfg) {
  return {
    score: 0,
    shotsLeft: basketCfg.shots,
    target: basketCfg.target,
    finished: false,
    won: false,
  };
}

function evaluate(g) {
  if (g.score >= g.target) {
    g.finished = true;
    g.won = true;
  } else if (g.shotsLeft <= 0) {
    g.finished = true;
    g.won = false;
  }
  return g;
}

/** Oyuncunun atışı: bir atış hakkı düşer, girerse puan eklenir. Hedefe ulaşınca anında kazanılır. */
export function applyShot(g, points, hit) {
  if (g.finished || g.shotsLeft <= 0) return g;
  g.shotsLeft -= 1;
  if (hit) g.score += points;
  return evaluate(g);
}

/** Kadir'in bonus atışı: puan eklenir, oyuncunun atış hakkından DÜŞMEZ. Atışlar bitmeden kullanılabilir. */
export function applyBonus(g, points) {
  if (g.finished || g.shotsLeft <= 0) return false;
  g.score += points;
  evaluate(g);
  return true;
}
