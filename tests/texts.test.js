import { describe, it, expect } from 'vitest';
import { T } from '../src/data/texts.js';

// BİREBİR metinler: tasarım dokümanındaki hâlleriyle harfi harfine aynı olmalı.
describe('BİREBİR metinler', () => {
  it('boss replikleri', () => {
    expect(T.gulben.fail).toBe('Ha ha ha git büyü de gel!');
    expect(T.yagmur.fail).toBe('Yaşınız kaç başınız kaç annem sizin!');
    expect(T.burak.fail).toBe('Youmat YouTube kanalında konu tekrarını izleyin de gelin!');
    expect(T.alihan.fail).toBe('Boyunuza göre bir spor seçin çocuklar!');
  });

  it('kapanış', () => {
    expect(T.closing.line1).toBe('Bir Hacıhafıziller hikayesi devam edecektir...');
    expect(T.closing.line2).toBe('Yeğenlerine Yiğit dayısından ufak bir anı.');
  });

  it('yardımcı güç adları', () => {
    expect(T.helpers.gulnur.power).toBe('Teyzenin Gücü');
    expect(T.helpers.omerhan.power).toBe('Dayıların üstadı');
    expect(T.helpers.kadir.power).toBe('Sabun üstadı');
    expect(T.helpers.yigit.power).toBe('Evin eski en küçüğü');
  });

  it('arayüz metinleri', () => {
    expect(T.title).toBe('Basmath');
    expect(T.maker).toBe('Yapımcı: Yiğit Yılmaz');
    expect(T.zones.mothersCleared).toBe('Anneler bölgesi geçildi!');
    expect(T.final.jersey).toBe('Full takım imzalı Beşiktaş forması!');
    expect(T.helpers.useless).toBe('Bu yardım burada işe yaramaz.');
    expect(T.helpers.calling).toBe('Aranıyor...');
    expect(T.yagmur.needEagle).toBe('Önce kartal oyuncağını bulmalıyız!');
    expect(T.yagmur.hud).toBe("Kartal oyuncağını bul, Yağmur Alkanat'a yakalanmadan kapıdan çık.");
    expect(T.quiz.progress(2, 5, 1)).toBe('Soru 2/5 · Doğru: 1');
    expect(T.alihan.score(7, 12, 3)).toBe('Skor: 7 / 12 · Kalan atış: 3');
    expect(T.select.kartal.desc).toBe('Hedefleri çok daha kolay vurur.');
    expect(T.select.yagiz.desc).toBe("Kartal'dan 1 yaş büyük, biraz daha bilgili.");
  });

  it('oyuncak her yerde "kartal oyuncağı" diye geçer (Kartal ile karışmasın)', () => {
    const lines = [T.yagmur.intro, T.yagmur.hud, T.yagmur.needEagle, T.yagmur.gotEagle];
    lines.forEach((l) => expect(/kartal oyuncağı/i.test(l)).toBe(true));
  });

  it('büyük harfe çevirme Türkçe kurallarına uyar', () => {
    expect('ığdır'.toLocaleUpperCase('tr-TR')).toBe('IĞDIR');
    expect(T.zones.mothers.toLocaleUpperCase('tr-TR')).toBe('ANNELER BÖLGESİ');
  });
});
