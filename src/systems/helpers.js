// Yardımcı karakter hakları (saf mantık, Phaser'dan bağımsız).

export const HELPER_IDS = ['gulnur', 'omerhan', 'kadir', 'yigit'];

/** cfg: { usesPerGame, refundOnFail } */
export function createHelpers(cfg, saved) {
  const left = {};
  HELPER_IDS.forEach((id) => {
    const v = saved && typeof saved[id] === 'number' ? saved[id] : cfg.usesPerGame;
    left[id] = Math.max(0, Math.min(cfg.usesPerGame, v));
  });
  return { left, pending: [], refundOnFail: !!cfg.refundOnFail };
}

/**
 * Yardımcı şu an işe yarar mı?
 * ctx: { quizActive, room, searching, shooting }
 *  - gulnur, yigit: soru ekranındayken (Gülben ve Burak sınavları)
 *  - omerhan: Yağmur'un oyun alanında, kartal oyuncağı aranırken
 *  - kadir: Alihan'ın salonunda, atışlar bitmeden
 */
export function isUseful(id, ctx) {
  const c = ctx || {};
  if (id === 'gulnur' || id === 'yigit') return !!c.quizActive;
  if (id === 'omerhan') return c.room === 'yagmur' && !!c.searching;
  if (id === 'kadir') return c.room === 'alihan' && !!c.shooting;
  return false;
}

/** 'ok' | 'useless' | 'spent' */
export function helperStatus(state, id, ctx) {
  if (!isUseful(id, ctx)) return 'useless';
  if (state.left[id] <= 0) return 'spent';
  return 'ok';
}

/** Hakkı harcar. İşe yaramıyorsa ya da hak yoksa hiçbir şey harcanmaz. */
export function useHelper(state, id, ctx) {
  const st = helperStatus(state, id, ctx);
  if (st !== 'ok') return st;
  state.left[id] -= 1;
  state.pending.push(id);
  return 'ok';
}

/** Oda kaybedildi: bu denemede kullanılan haklar (ayar açıksa) geri verilir. */
export function onRoomFail(state) {
  if (state.refundOnFail) state.pending.forEach((id) => { state.left[id] += 1; });
  state.pending.length = 0;
}

/** Oda geçildi: bu denemede kullanılan haklar kesinleşir. */
export function onRoomClear(state) {
  state.pending.length = 0;
}

/** Kayıt için: kesinleşmemiş kullanımlar geri sayılır (checkpoint anındaki haklar). */
export function helpersToSave(state) {
  const out = { ...state.left };
  state.pending.forEach((id) => { out[id] += 1; });
  return out;
}
