import { describe, it, expect } from 'vitest';
import { createHelpers, helperStatus, useHelper, onRoomFail, onRoomClear, helpersToSave, isUseful, HELPER_IDS } from '../src/systems/helpers.js';
import { CONFIG } from '../src/config.js';

const QUIZ = { quizActive: true };
const PLAY = { room: 'yagmur', searching: true };
const GYM = { room: 'alihan', shooting: true };

describe('yardımcı hakları', () => {
  it('her yardımcı tüm oyunda 1 kez kullanılabilir', () => {
    expect(CONFIG.helpers.usesPerGame).toBe(1);
    const h = createHelpers(CONFIG.helpers);
    HELPER_IDS.forEach((id) => expect(h.left[id]).toBe(1));
    expect(useHelper(h, 'gulnur', QUIZ)).toBe('ok');
    onRoomClear(h);
    expect(h.left.gulnur).toBe(0);
    expect(useHelper(h, 'gulnur', QUIZ)).toBe('spent');
    expect(h.left.gulnur).toBe(0);
  });

  it('kullanıldığı oda kaybedilirse hak geri verilir', () => {
    const h = createHelpers(CONFIG.helpers);
    useHelper(h, 'yigit', QUIZ);
    expect(h.left.yigit).toBe(0);
    onRoomFail(h);
    expect(h.left.yigit).toBe(1);
    expect(helperStatus(h, 'yigit', QUIZ)).toBe('ok');
  });

  it('oda geçilirse hak kesin olarak harcanır; sonraki odadaki kayıp onu geri getirmez', () => {
    const h = createHelpers(CONFIG.helpers);
    useHelper(h, 'gulnur', QUIZ);
    onRoomClear(h);
    onRoomFail(h);
    expect(h.left.gulnur).toBe(0);
  });

  it('iade ayarı kapalıysa hak geri verilmez', () => {
    const h = createHelpers({ usesPerGame: 1, refundOnFail: false });
    useHelper(h, 'kadir', GYM);
    onRoomFail(h);
    expect(h.left.kadir).toBe(0);
  });

  it('işe yaramadığı yerde hak harcanmaz', () => {
    const h = createHelpers(CONFIG.helpers);
    expect(useHelper(h, 'kadir', QUIZ)).toBe('useless');
    expect(useHelper(h, 'gulnur', GYM)).toBe('useless');
    expect(useHelper(h, 'omerhan', GYM)).toBe('useless');
    expect(useHelper(h, 'yigit', PLAY)).toBe('useless');
    HELPER_IDS.forEach((id) => expect(h.left[id]).toBe(1));
    expect(h.pending.length).toBe(0);
  });

  it('her yardımcı yalnızca kendi yerinde işe yarar', () => {
    expect(isUseful('gulnur', QUIZ)).toBe(true);
    expect(isUseful('yigit', QUIZ)).toBe(true);
    expect(isUseful('gulnur', { quizActive: false })).toBe(false);
    expect(isUseful('omerhan', PLAY)).toBe(true);
    expect(isUseful('omerhan', { room: 'yagmur', searching: false })).toBe(false);
    expect(isUseful('kadir', GYM)).toBe(true);
    expect(isUseful('kadir', { room: 'alihan', shooting: false })).toBe(false);
  });

  it('kayıt, checkpoint anındaki hakları saklar', () => {
    const h = createHelpers(CONFIG.helpers);
    useHelper(h, 'gulnur', QUIZ);
    expect(helpersToSave(h).gulnur).toBe(1); // oda henüz geçilmedi
    onRoomClear(h);
    expect(helpersToSave(h).gulnur).toBe(0);
    const h2 = createHelpers(CONFIG.helpers, helpersToSave(h));
    expect(h2.left.gulnur).toBe(0);
    expect(h2.left.yigit).toBe(1);
  });
});
