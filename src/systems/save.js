// Kayıt (localStorage). Tüm erişimler try/catch içindedir: gizli sekmede ya da depolama kapalıyken oyun yine çalışır.
const GAME_KEY = 'basmath.save.v1';
const SOUND_KEY = 'basmath.sound.v1';

function storage() {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch (e) {
    return null;
  }
}

/** { character, checkpoint, helpers } ya da null */
export function loadGame() {
  try {
    const s = storage();
    const raw = s && s.getItem(GAME_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || (d.character !== 'kartal' && d.character !== 'yagiz')) return null;
    if (typeof d.checkpoint !== 'number' || d.checkpoint < 0 || d.checkpoint > 3) return null;
    return d;
  } catch (e) {
    return null;
  }
}

export function saveGame(data) {
  try {
    const s = storage();
    if (s) s.setItem(GAME_KEY, JSON.stringify(data));
  } catch (e) {
    /* yok say */
  }
}

export function clearGame() {
  try {
    const s = storage();
    if (s) s.removeItem(GAME_KEY);
  } catch (e) {
    /* yok say */
  }
}

export function loadSound() {
  try {
    const s = storage();
    return !s || s.getItem(SOUND_KEY) !== '0';
  } catch (e) {
    return true;
  }
}

export function saveSound(on) {
  try {
    const s = storage();
    if (s) s.setItem(SOUND_KEY, on ? '1' : '0');
  } catch (e) {
    /* yok say */
  }
}
