// Tüm ayarlanabilir sayılar burada. Oyun dengesini değiştirmek için yalnızca bu dosyayı düzenle.
export const CONFIG = {
  width: 384,
  height: 216,

  player: {
    speed: 72, // px/sn
    followDistance: 14, // takipçi kuzenin kaç örnek geriden geldiği
  },

  // Sınavlar
  quiz: {
    gulben: { count: 5, pass: 3 }, // 5 sorudan en az 3 doğru
    burak: { count: 4, pass: 4 }, // 4 sorunun 4'ü de doğru
    feedbackMs: 1300, // doğru/yanlış geri bildirimi süresi
  },

  // Basketbol
  basket: {
    shots: 6,
    target: 12,
    // puan → yeşil alan (bar genişliğinin oranı) / tek geçiş süresi (sn)
    shotTypes: {
      1: { zone: 0.35, period: 1.4 },
      2: { zone: 0.2, period: 1.1 },
      3: { zone: 0.12, period: 0.9 },
    },
    kadirPoints: 3, // Kadir'in bonus atışı (atış hakkından düşmez)
  },

  // Karakter güçlü yanları
  bonus: {
    kartal: {
      zoneMul: 1.4, // yeşil alan %40 daha geniş
      speedMul: 0.85, // gösterge %15 daha yavaş
    },
    yagiz: {
      eliminatePerAttempt: 1, // her sınav denemesinde "Abi Bilgisi" hakkı
      eliminateCount: 1, // elenen yanlış şık sayısı
    },
  },

  // Yardımcılar
  helpers: {
    usesPerGame: 1, // her yardımcı tüm oyunda kaç kez kullanılabilir
    refundOnFail: true, // kullanıldığı oda kaybedilirse hak geri verilsin mi
  },

  // Yağmur'un devriyesi
  stealth: {
    guardSpeed: 26, // px/sn (oyuncudan yavaş)
    coneRange: 62,
    coneHalfAngleDeg: 27,
    detectTime: 0.3, // konide kaç sn kalınca yakalanır
    turnEvery: 6.5, // kaç sn'de bir arkasına döner
    turnDuration: 1.3,
  },

  omerhan: {
    beamMs: 5000,
  },
};
