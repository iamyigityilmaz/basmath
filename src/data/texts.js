// Oyunun TÜM metinleri bu dosyadadır.
// "BİREBİR — değiştirme" yazan satırlar harfi harfine korunmalıdır; "taslak" olanlar serbestçe düzenlenebilir.

export const T = {
  title: 'Basmath', // BİREBİR — değiştirme
  maker: 'Yapımcı: Yiğit Yılmaz', // BİREBİR — değiştirme

  menu: {
    newGame: 'Yeni Oyun', // BİREBİR — değiştirme
    continue: 'Devam Et', // BİREBİR — değiştirme
    soundOn: 'Ses: Açık', // BİREBİR — değiştirme
    soundOff: 'Ses: Kapalı', // BİREBİR — değiştirme
    resume: 'Devam', // BİREBİR — değiştirme
    mainMenu: 'Ana Menü', // BİREBİR — değiştirme
    paused: 'Duraklatıldı', // taslak
    rotate: 'Telefonu yan çevir', // BİREBİR — değiştirme
  },

  intro: "Hacıhafıziller evinde büyük gün! Kartal ile Yağız Alp'i bir sürpriz bekliyor... ama önce annelerin, sonra babaların sınavlarını geçmeleri lazım.", // taslak

  select: {
    heading: 'Kimi oynayacaksın?', // taslak
    kartal: {
      name: 'Kartal', // BİREBİR — değiştirme
      role: 'Basketbolcu', // BİREBİR — değiştirme
      desc: 'Hedefleri çok daha kolay vurur.', // BİREBİR — değiştirme
    },
    yagiz: {
      name: 'Yağız Alp', // BİREBİR — değiştirme
      role: 'Matematikçi', // BİREBİR — değiştirme
      desc: "Kartal'dan 1 yaş büyük, biraz daha bilgili.", // BİREBİR — değiştirme
    },
    choose: 'Seç', // taslak
  },

  zones: {
    mothers: 'Anneler Bölgesi', // taslak
    fathers: 'Babalar Bölgesi', // taslak
    mothersCleared: 'Anneler bölgesi geçildi!', // BİREBİR — değiştirme
  },

  rooms: {
    gulben: "Gülben Yerli'nin Odası", // taslak
    yagmur: "Yağmur Alkanat'ın Çocuk Oyun Alanı", // taslak
    burak: "Burak Yerli'nin Odası", // taslak
    alihan: "Alihan Alkanat'ın Basketbol Salonu", // taslak
  },

  actions: {
    talk: 'Konuş', // BİREBİR — değiştirme
    look: 'Bak', // BİREBİR — değiştirme
    take: 'Al', // BİREBİR — değiştirme
    putBack: 'Geri bırak', // BİREBİR — değiştirme
    shoot: 'At', // BİREBİR — değiştirme
    door: 'Kapı', // taslak
  },

  gulben: {
    intro: "Bakalım ne kadar büyümüşsünüz! 5 sorudan en az 3'ünü bilirseniz geçersiniz.", // taslak
    fail: 'Ha ha ha git büyü de gel!', // BİREBİR — değiştirme
    pass: 'Aferin size! Kapı açık, Yağmur teyzeniz sizi bekliyor.', // taslak
    hud: 'Gülben Yerli ile konuş.', // taslak
    hudDoor: 'Açılan kapıdan geç.', // taslak
  },

  yagmur: {
    intro: 'Oyun alanında istediğiniz kadar oynayın ama kanatlarını açmış, kıvrık gagalı kartal oyuncağıma dokunmak yok!', // taslak
    fail: 'Yaşınız kaç başınız kaç annem sizin!', // BİREBİR — değiştirme
    hudTalk: 'Yağmur Alkanat ile konuş.', // taslak
    hud: "Kartal oyuncağını bul, Yağmur Alkanat'a yakalanmadan kapıdan çık.", // BİREBİR — değiştirme
    needEagle: 'Önce kartal oyuncağını bulmalıyız!', // BİREBİR — değiştirme
    gotEagle: 'Kartal oyuncağı bizde! Yakalanmadan kapıya!', // taslak
    empty: 'Burası boş.', // taslak
  },

  burak: {
    intro: "Annenizi geçtiniz ama benim sorularım daha zor. 4 sorunun 4'ünü de bilmeniz lazım!", // taslak
    fail: 'Youmat YouTube kanalında konu tekrarını izleyin de gelin!', // BİREBİR — değiştirme
    pass: 'Bravo! Hepsini bildiniz. Hadi salona, Alihan sizi bekliyor.', // taslak
    hud: 'Burak Yerli ile konuş.', // taslak
    hudDoor: 'Açılan kapıdan geç.', // taslak
  },

  alihan: {
    intro: 'Salona hoş geldiniz! 6 atışta 12 sayı yaparsanız sizi bir sürpriz bekliyor.', // taslak
    fail: 'Boyunuza göre bir spor seçin çocuklar!', // BİREBİR — değiştirme
    hudTalk: 'Alihan Alkanat ile konuş.', // taslak
    hudPlay: 'Bir atış noktasına git ve "At" de.', // taslak
    aimHint: 'Gösterge yeşildeyken dokun!', // taslak
    score: (score, target, left) => `Skor: ${score} / ${target} · Kalan atış: ${left}`, // BİREBİR — değiştirme
  },

  quiz: {
    progress: (n, total, correct) => `Soru ${n}/${total} · Doğru: ${correct}`, // BİREBİR — değiştirme
    correct: 'Doğru!', // taslak
    wrong: 'Yanlış!', // taslak
    abiBilgisi: 'Abi Bilgisi', // BİREBİR — değiştirme
  },

  helpers: {
    calling: 'Aranıyor...', // BİREBİR — değiştirme
    useless: 'Bu yardım burada işe yaramaz.', // BİREBİR — değiştirme
    used: 'Bu yardımcının hakkı bitti.', // taslak
    gulnur: { name: 'Gülnur Teyze', power: 'Teyzenin Gücü' }, // BİREBİR — değiştirme
    omerhan: { name: 'Ömerhan Özgüven', power: 'Dayıların üstadı' }, // BİREBİR — değiştirme
    kadir: { name: 'Kadir Özçelik', power: 'Sabun üstadı' }, // BİREBİR — değiştirme
    yigit: { name: 'Yiğit Yılmaz', power: 'Evin eski en küçüğü' }, // BİREBİR — değiştirme
    kadirScore: "Kadir'den 3'lük! +3", // taslak
  },

  final: {
    alihanCheer: 'İşte bu! 12 sayı tamam!', // taslak
    alihanToKartal: 'Helal olsun oğlum, bu senin!', // taslak
    burakToYagiz: 'Sen de hak ettin!', // taslak
    jersey: 'Full takım imzalı Beşiktaş forması!', // BİREBİR — değiştirme
  },

  closing: {
    line1: 'Bir Hacıhafıziller hikayesi devam edecektir...', // BİREBİR — değiştirme
    line2: 'Yeğenlerine Yiğit dayısından ufak bir anı.', // BİREBİR — değiştirme
  },

  // Türkçe karakter test ekranı (debug menüsü)
  fontTest: 'ç ğ ı İ ö ş ü Ç Ğ Ö Ş Ü — Pijamalı hasta yağız şoföre çabucak güvendi. IĞDIR, ŞIRNAK, ÇÖĞÜR, ÜZÜM, ıİiI', // taslak

  names: {
    kartal: 'Kartal', // BİREBİR — değiştirme
    yagiz: 'Yağız Alp', // BİREBİR — değiştirme
    gulben: 'Gülben Yerli', // BİREBİR — değiştirme
    yagmur: 'Yağmur Alkanat', // BİREBİR — değiştirme
    burak: 'Burak Yerli', // BİREBİR — değiştirme
    alihan: 'Alihan Alkanat', // BİREBİR — değiştirme
    gulnur: 'Gülnur Teyze', // BİREBİR — değiştirme
    omerhan: 'Ömerhan Özgüven', // BİREBİR — değiştirme
    kadir: 'Kadir Özçelik', // BİREBİR — değiştirme
    yigit: 'Yiğit Yılmaz', // BİREBİR — değiştirme
  },
};
