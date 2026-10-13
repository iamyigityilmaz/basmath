// Sınav kuralları (saf mantık, Phaser'dan bağımsız).

/** Fisher–Yates; diziyi kopyalayıp karıştırır. */
export function shuffle(arr, rng) {
  const r = rng || Math.random;
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

/**
 * Havuzdan `count` farklı soru çeker, şıkları karıştırır.
 * pass: geçmek için gereken doğru sayısı. eliminations: "Abi Bilgisi" hakkı (Yağız Alp).
 */
export function createQuiz({ pool, count, pass, rng, eliminations }) {
  const r = rng || Math.random;
  const questions = shuffle(pool, r).slice(0, count).map((item) => {
    const options = shuffle([item.a, ...item.w], r);
    return {
      text: item.q,
      options,
      correctIndex: options.indexOf(item.a),
      eliminated: [false, false, false, false],
    };
  });
  return {
    questions,
    total: questions.length,
    pass,
    index: 0,
    correct: 0,
    wrong: 0,
    finished: false,
    passed: false,
    eliminationsLeft: eliminations || 0,
    hacked: false,
  };
}

export function currentQuestion(s) {
  return s.finished ? null : s.questions[s.index];
}

/**
 * O anki soruyu cevaplar. Geçmek imkânsız hâle gelince sınav hemen biter.
 * Döner: { correct, correctIndex, finished, passed } ya da geçersizse null.
 */
export function answer(s, optionIndex) {
  const q = currentQuestion(s);
  if (!q || optionIndex < 0 || optionIndex >= q.options.length || q.eliminated[optionIndex]) return null;
  const correct = optionIndex === q.correctIndex;
  if (correct) s.correct += 1;
  else s.wrong += 1;
  s.index += 1;
  if (s.wrong > s.total - s.pass) {
    s.finished = true;
    s.passed = false;
  } else if (s.index >= s.total) {
    s.finished = true;
    s.passed = s.correct >= s.pass;
  }
  return { correct, correctIndex: q.correctIndex, finished: s.finished, passed: s.passed };
}

/**
 * Yağız Alp'in "Abi Bilgisi": o anki sorunun yanlış şıklarından `n` tanesini eler.
 * Deneme başına hak sınırlıdır. Elenen şıkların indekslerini döner (hak yoksa boş dizi).
 */
export function eliminateWrong(s, rng, n) {
  const q = currentQuestion(s);
  if (!q || s.eliminationsLeft <= 0) return [];
  const r = rng || Math.random;
  const wrongs = [];
  for (let i = 0; i < q.options.length; i++) if (i !== q.correctIndex && !q.eliminated[i]) wrongs.push(i);
  const picked = shuffle(wrongs, r).slice(0, Math.min(n || 1, Math.max(0, wrongs.length - 1)));
  if (!picked.length) return [];
  picked.forEach((i) => { q.eliminated[i] = true; });
  s.eliminationsLeft -= 1;
  return picked;
}

/** Gülnur Teyze: o anki sorunun doğru şıkkı. */
export function revealCorrect(s) {
  const q = currentQuestion(s);
  return q ? q.correctIndex : -1;
}

/** Yiğit Yılmaz: kalan tüm sorularda doğru şıklar işaretlenir. */
export function hackRemaining(s) {
  if (s.finished) return false;
  s.hacked = true;
  return true;
}
