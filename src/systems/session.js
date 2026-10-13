// Oyun oturumu: seçilen karakter, checkpoint ve yardımcı hakları.
import { CONFIG } from '../config.js';
import { createHelpers, onRoomClear, onRoomFail, helpersToSave } from './helpers.js';
import { loadGame, saveGame, clearGame } from './save.js';

export const ROOM_SCENES = ['GulbenRoom', 'YagmurPlayground', 'BurakRoom', 'AlihanGym'];

export const session = {
  character: 'kartal',
  checkpoint: 0, // sıradaki odanın sırası (0-3)
  helpers: createHelpers(CONFIG.helpers),
};

export function otherKid() {
  return session.character === 'kartal' ? 'yagiz' : 'kartal';
}

export function newGame(character) {
  session.character = character;
  session.checkpoint = 0;
  session.helpers = createHelpers(CONFIG.helpers);
  persist();
}

/** Kayıttan devam eder. Kayıt yoksa false döner. */
export function continueGame() {
  const d = loadGame();
  if (!d) return false;
  session.character = d.character;
  session.checkpoint = d.checkpoint;
  session.helpers = createHelpers(CONFIG.helpers, d.helpers);
  return true;
}

export function hasSave() {
  return !!loadGame();
}

function persist() {
  saveGame({
    character: session.character,
    checkpoint: session.checkpoint,
    helpers: helpersToSave(session.helpers),
  });
}

/** Oda geçildi → checkpoint ilerler, kullanılan yardımcılar kesinleşir. */
export function roomCleared(index) {
  onRoomClear(session.helpers);
  session.checkpoint = Math.max(session.checkpoint, Math.min(index + 1, ROOM_SCENES.length - 1));
  persist();
}

/** Oda kaybedildi → bu denemede kullanılan yardımcı hakları geri gelir. */
export function roomFailed() {
  onRoomFail(session.helpers);
}

export function finishGame() {
  clearGame();
}

export function currentRoomScene() {
  return ROOM_SCENES[session.checkpoint] || ROOM_SCENES[0];
}
