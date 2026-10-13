import { describe, it, expect } from 'vitest';
import { createQuiz, answer, currentQuestion, eliminateWrong, revealCorrect, hackRemaining } from '../src/systems/quiz.js';
import { GULBEN_POOL, BURAK_POOL } from '../src/data/questions.js';
import { CONFIG } from '../src/config.js';

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const gulben = (seed = 1, extra = {}) => createQuiz({ pool: GULBEN_POOL, ...CONFIG.quiz.gulben, rng: seeded(seed), ...extra });
const burak = (seed = 1, extra = {}) => createQuiz({ pool: BURAK_POOL, ...CONFIG.quiz.burak, rng: seeded(seed), ...extra });
const right = (q) => answer(q, currentQuestion(q).correctIndex);
const wrong = (q) => answer(q, (currentQuestion(q).correctIndex + 1) % 4);

describe('soru havuzları', () => {
  for (const [name, pool] of [['Gülben', GULBEN_POOL], ['Burak', BURAK_POOL]]) {
    it(`${name}: en az 25 soru, 4 farklı pozitif şık`, () => {
      expect(pool.length).toBeGreaterThanOrEqual(25);
      expect(new Set(pool.map((p) => p.q)).size).toBe(pool.length);
      for (const item of pool) {
        const all = [item.a, ...item.w];
        expect(all.length).toBe(4);
        expect(new Set(all).size).toBe(4);
        all.forEach((v) => expect(v).toBeGreaterThan(0));
      }
    });
  }

  it('3 + 4 × 2 sorusunda 14 yanlış şık olarak var', () => {
    const q = BURAK_POOL.find((p) => p.q === '3 + 4 × 2 = ?');
    expect(q.a).toBe(11);
    expect(q.w).toContain(14);
  });

  it('bir denemede aynı soru iki kez gelmez, şıklar karışır ama doğru şık korunur', () => {
    for (let seed = 1; seed < 40; seed++) {
      const q = gulben(seed);
      expect(q.questions.length).toBe(5);
      expect(new Set(q.questions.map((x) => x.text)).size).toBe(5);
      q.questions.forEach((x) => {
        const src = GULBEN_POOL.find((p) => p.q === x.text);
        expect(x.options[x.correctIndex]).toBe(src.a);
        expect(x.options.slice().sort((a, b) => a - b)).toEqual([src.a, ...src.w].sort((a, b) => a - b));
      });
    }
  });
});

describe('Gülben sınavı: 5 sorudan en az 3 doğru', () => {
  it('3 doğru 2 yanlış geçer', () => {
    const q = gulben();
    right(q); wrong(q); right(q); wrong(q);
    const r = right(q);
    expect(r.finished).toBe(true);
    expect(r.passed).toBe(true);
    expect(q.correct).toBe(3);
  });

  it('5 doğru geçer', () => {
    const q = gulben(3);
    let r;
    for (let i = 0; i < 5; i++) r = right(q);
    expect(r).toMatchObject({ finished: true, passed: true });
  });

  it('geçmek imkânsız olunca (3. yanlışta) sınav hemen biter', () => {
    const q = gulben(5);
    expect(wrong(q).finished).toBe(false);
    expect(wrong(q).finished).toBe(false);
    const r = wrong(q);
    expect(r).toMatchObject({ finished: true, passed: false });
    expect(q.index).toBe(3);
    expect(answer(q, 0)).toBeNull();
  });

  it('2 doğru 3 yanlış kalır', () => {
    const q = gulben(7);
    right(q); right(q); wrong(q); wrong(q);
    expect(wrong(q)).toMatchObject({ finished: true, passed: false });
  });

  it('yanlış cevapta doğru şık bildirilir', () => {
    const q = gulben(9);
    const ci = currentQuestion(q).correctIndex;
    const r = wrong(q);
    expect(r.correct).toBe(false);
    expect(r.correctIndex).toBe(ci);
  });
});

describe('Burak sınavı: 4 sorunun 4ü de doğru', () => {
  it('4/4 geçer', () => {
    const q = burak();
    let r;
    for (let i = 0; i < 4; i++) r = right(q);
    expect(r).toMatchObject({ finished: true, passed: true });
  });

  it('ilk yanlışta sınav biter', () => {
    const q = burak(2);
    right(q); right(q);
    const r = wrong(q);
    expect(r).toMatchObject({ finished: true, passed: false });
    expect(q.index).toBe(3);
  });

  it('ilk soruda yanlış da hemen bitirir', () => {
    const q = burak(4);
    expect(wrong(q)).toMatchObject({ finished: true, passed: false });
  });
});

describe('Yağız Alp: Abi Bilgisi', () => {
  it('yanlış şıklardan 1 tanesini eler (4 şık 3e iner), doğruyu asla elemez', () => {
    for (let seed = 1; seed < 30; seed++) {
      const q = gulben(seed, { eliminations: CONFIG.bonus.yagiz.eliminatePerAttempt });
      const cq = currentQuestion(q);
      const gone = eliminateWrong(q, seeded(seed), CONFIG.bonus.yagiz.eliminateCount);
      expect(gone.length).toBe(1);
      expect(gone[0]).not.toBe(cq.correctIndex);
      expect(cq.eliminated.filter(Boolean).length).toBe(1);
      expect(answer(q, gone[0])).toBeNull(); // elenen şık seçilemez
    }
  });

  it('her sınav denemesinde yalnızca 1 kez kullanılabilir', () => {
    const q = gulben(11, { eliminations: 1 });
    expect(eliminateWrong(q).length).toBe(1);
    expect(eliminateWrong(q).length).toBe(0);
    right(q);
    expect(eliminateWrong(q).length).toBe(0);
    // yeni denemede hak yenilenir
    const q2 = gulben(12, { eliminations: 1 });
    expect(eliminateWrong(q2).length).toBe(1);
  });

  it('Kartal için hak yoktur', () => {
    const q = gulben(13);
    expect(eliminateWrong(q)).toEqual([]);
  });
});

describe('yardımcıların sınav etkileri', () => {
  it('Gülnur doğru şıkkı gösterir', () => {
    const q = burak(6);
    expect(revealCorrect(q)).toBe(currentQuestion(q).correctIndex);
  });

  it('Yiğit kalan tüm soruları işaretler', () => {
    const q = burak(8);
    right(q);
    expect(hackRemaining(q)).toBe(true);
    expect(q.hacked).toBe(true);
    right(q); right(q); right(q);
    expect(hackRemaining(q)).toBe(false);
  });
});
