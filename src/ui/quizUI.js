// Soru ekranı: 2×2 büyük şık butonları, ilerleme yazısı, doğru/yanlış geri bildirimi. Süre yok.
import { overlay, el } from './overlay.js';
import { input } from '../systems/input.js';
import { audio } from '../systems/audio.js';
import { answer, currentQuestion, eliminateWrong, revealCorrect, hackRemaining } from '../systems/quiz.js';
import { CONFIG } from '../config.js';
import { IMG } from '../art/textures.js';
import { T } from '../data/texts.js';

let active = null;

export const quizUI = {
  /** Soru ekranı açık ve cevap bekliyor mu? (Yardımcılar yalnızca bu anda işe yarar.) */
  accepting() {
    return !!active && active.accepting;
  },
  /** Gülnur Teyze: o anki sorunun doğru şıkkını parlatır. */
  reveal() {
    if (active) active.reveal();
  },
  /** Yiğit Yılmaz: kalan tüm sorularda doğru şıkları işaretler. */
  hack() {
    if (active) active.hack();
  },
};

/**
 * Sınavı yürütür. quiz: createQuiz() durumu. Geçildiyse true döner.
 */
export function runQuiz({ bossId, quiz }) {
  return new Promise((resolve) => {
    const layer = overlay.addLayer('quiz-layer', true);
    const panel = el('div', 'quiz panel');
    const head = el('div', 'quiz-head');
    const img = el('img');
    img.src = IMG.portrait[bossId];
    img.alt = '';
    const progress = el('div', 'quiz-progress');
    const feedback = el('div', 'quiz-feedback');
    head.append(img, progress, feedback);
    let abi = null;
    if (quiz.eliminationsLeft > 0) {
      abi = el('button', 'btn quiz-abi');
      abi.append(el('span', 'key', '[Q] '), el('span', null, T.quiz.abiBilgisi));
      head.appendChild(abi);
    }
    const qEl = el('div', 'quiz-q');
    const grid = el('div', 'quiz-grid');
    const opts = [0, 1, 2, 3].map((i) => {
      const b = el('button', 'btn quiz-opt');
      b.addEventListener('click', () => choose(i));
      grid.appendChild(b);
      return b;
    });
    panel.append(head, qEl, grid);
    layer.appendChild(panel);

    const st = { accepting: false, reveal: null, hack: null };
    let focus = 0;
    let release = null;

    const paintFocus = () => opts.forEach((b, i) => b.classList.toggle('focus', i === focus));

    const markHack = () => {
      const q = currentQuestion(quiz);
      if (q && quiz.hacked) opts[q.correctIndex].classList.add('hacked');
    };

    const render = () => {
      const q = currentQuestion(quiz);
      progress.textContent = T.quiz.progress(quiz.index + 1, quiz.total, quiz.correct);
      feedback.textContent = '';
      feedback.className = 'quiz-feedback';
      qEl.textContent = q.text;
      opts.forEach((b, i) => {
        b.className = 'btn quiz-opt';
        b.textContent = String(q.options[i]);
        b.disabled = false;
      });
      if (abi) abi.disabled = quiz.eliminationsLeft <= 0;
      focus = 0;
      paintFocus();
      markHack();
      st.accepting = true;
    };

    const finish = () => {
      st.accepting = false;
      active = null;
      release();
      layer.remove();
      resolve(quiz.passed);
    };

    function choose(i) {
      if (!st.accepting) return;
      const res = answer(quiz, i);
      if (!res) return;
      st.accepting = false;
      opts.forEach((b) => { b.disabled = true; });
      opts[res.correctIndex].classList.remove('glow');
      opts[res.correctIndex].classList.add('good');
      if (res.correct) {
        feedback.textContent = T.quiz.correct;
        feedback.classList.add('good');
        audio.play('correct');
      } else {
        opts[i].classList.add('bad');
        feedback.textContent = T.quiz.wrong;
        feedback.classList.add('bad');
        audio.play('wrong');
        audio.vibrate(80);
      }
      progress.textContent = T.quiz.progress(Math.min(quiz.index, quiz.total), quiz.total, quiz.correct);
      overlay.later(() => {
        if (!layer.isConnected) return;
        if (res.finished) finish();
        else render();
      }, CONFIG.quiz.feedbackMs);
    }

    const useAbi = () => {
      if (!st.accepting || !abi) return;
      const gone = eliminateWrong(quiz, Math.random, CONFIG.bonus.yagiz.eliminateCount);
      if (!gone.length) return;
      gone.forEach((i) => opts[i].classList.add('gone'));
      abi.disabled = quiz.eliminationsLeft <= 0;
      audio.play('pick');
      if (gone.includes(focus)) moveFocus(1, 0);
    };
    if (abi) abi.addEventListener('click', useAbi);

    function moveFocus(dx, dy) {
      const q = currentQuestion(quiz);
      if (!q) return;
      let col = focus % 2;
      let row = focus >> 1;
      if (dx) col = 1 - col;
      if (dy) row = 1 - row;
      let next = row * 2 + col;
      if (q.eliminated[next]) {
        // elenen şıkkı atla: çaprazdakine geç
        next = 3 - focus;
        if (q.eliminated[next]) return;
      }
      focus = next;
      paintFocus();
    }

    st.reveal = () => {
      const i = revealCorrect(quiz);
      if (i >= 0) opts[i].classList.add('glow');
    };
    st.hack = () => {
      if (hackRemaining(quiz)) markHack();
    };

    release = input.pushModal((e) => {
      if (e.repeat) return true;
      switch (e.code) {
        case 'ArrowLeft': case 'KeyA': case 'ArrowRight': case 'KeyD':
          moveFocus(1, 0);
          return true;
        case 'ArrowUp': case 'KeyW': case 'ArrowDown': case 'KeyS':
          moveFocus(0, 1);
          return true;
        case 'KeyE': case 'Space': case 'Enter':
          choose(focus);
          return true;
        case 'KeyQ':
          useAbi();
          return true;
        default:
          return false; // 1–4 (yardımcılar) ve Esc (duraklat) genel işleyiciye düşer
      }
    });

    active = st;
    quizUI.state = quiz; // debug / test erişimi
    render();
  });
}
