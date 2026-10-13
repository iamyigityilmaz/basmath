# Basmath — Hikâyeli Pixel Mini Oyun (Claude Code tasarım dokümanı)

> Oyunun adı: **Basmath**. Hikâyedeki "Hacıhafıziller" geçen metinler (giriş, kapanış) aynen kalır.

> Bu dosya oyunun tam tasarımıdır. Hikâye akışını, kuralları ve **BİREBİR** işaretli replikleri değiştirme. Görsel tarzı ve belirtilmemiş teknik detayları sen belirle. 15. bölümdeki aşamaları sırayla izle.

---

## 1. Özet

Kuşbakışı (top-down) pixel art, kısa hikâyeli bir bulmaca oyunu. Ana karakterler iki kuzen: **Kartal** ve **Yağız Alp**. Oyuncu başta birini seçer, seçilmeyen kuzen arkasından takip eder (yalnızca görsel). Seçim hikâyeyi değiştirmez. Sadece güçlü yanlar belirli yerlerde işe yarar.

| Çocuk | Annesi | Babası |
|---|---|---|
| Yağız Alp | Gülben Yerli | Burak Yerli |
| Kartal | Yağmur Alkanat | Alihan Alkanat |

Oyuncu sırayla 4 oda geçer: önce 2 anne (Anneler Bölgesi), sonra 2 baba (Babalar Bölgesi). Finalde babalar kendi çocuklarına imzalı forma verir, kapanış ekranı gelir ve oyun ana menüye döner.

---

## 2. Ana akış

```
ANA MENÜ
 └─ Yeni Oyun → Giriş metni → KARAKTER SEÇİMİ (Kartal / Yağız Alp)
     │
     ├─ 1. BÖLGE: ANNELER
     │   ├─ Oda 1: Gülben Yerli → 5 kolay matematik sorusu, en az 3 doğru
     │   │     ✗ → "Ha ha ha git büyü de gel!" → Oda 1'in başı
     │   │     ✓ ↓
     │   ├─ Oda 2: Yağmur Alkanat'ın Çocuk Oyun Alanı → kartal oyuncağını bul, yakalanmadan çık
     │   │     ✗ (yanlış oyuncak / kartal oyuncağıyla yakalanma)
     │   │        → "Yaşınız kaç başınız kaç annem sizin!" → Oda 2'nin başı
     │   │     ✓ ↓
     │   └─ "Anneler bölgesi geçildi!"
     │
     ├─ 2. BÖLGE: BABALAR
     │   ├─ Oda 3: Burak Yerli → 4 daha zor matematik sorusu, 4'ü de doğru
     │   │     ✗ → "Youmat YouTube kanalında konu tekrarını izleyin de gelin!" → Oda 3'ün başı
     │   │     ✓ ↓
     │   └─ Oda 4: Alihan Alkanat'ın Basketbol Salonu → 6 atışta en az 12 sayı
     │         ✗ → "Boyunuza göre bir spor seçin çocuklar!" → Oda 4'ün başı
     │         ✓ ↓
     │
     ├─ FİNAL: Alihan → Kartal'a, Burak → Yağız Alp'e full takım imzalı Beşiktaş forması
     └─ KAPANIŞ: "Bir Hacıhafıziller hikayesi devam edecektir..."
                 → ekran kararır →
                 "Yeğenlerine Yiğit dayısından ufak bir anı."
                 → ANA MENÜ
```

### Ortak "oda başarısız" kuralı
- Boss'un portresiyle replik gösterilir (BİREBİR), kısa kararma, oyuncu **o odanın girişine** döner.
- Oda tamamen sıfırlanır: sorular havuzdan yeniden çekilir, oyuncaklar yeniden karıştırılır, skor ve atış hakkı sıfırlanır.
- Daha önce geçilen odalar geçilmiş sayılır (checkpoint). Deneme hakkı sınırsızdır.

---

## 3. Platform ve teknik kararlar

Hedef cihazlar: iPhone 11, 12, 13, 14 Pro Max · Samsung Galaxy A07 · Samsung Galaxy S25 FE · modeli bilinmeyen bir Poco (Android) · Windows bilgisayarlar.

- **Tek kod tabanı: web oyunu + PWA.** Phaser 3 + Vite (JavaScript). Tarayıcıda açılır. "Ana ekrana ekle / Uygulamayı yükle" ile uygulama gibi tam ekran çalışır. App Store veya Play Store build'i yapma (iOS native build için Mac ve Apple Developer hesabı gerekir).
- GitHub Pages'te HTTPS ile yayınlanacak. `vite.config` içinde `base: './'` kullan ve tüm yolları göreli tut.
- Tamamen offline çalışsın: tüm kütüphane, font ve görseller pakete gömülü olsun. Harici CDN, analitik, reklam ya da herhangi bir ağ isteği OLMASIN.
- Performans referansı **Galaxy A07** (en zayıf cihaz). Orada akıcıysa her yerde akıcıdır.

---

## 4. Ekran, ölçekleme, kontroller

- Oyun **yatay (landscape)** oynanır. Telefon dikey tutulursa oyunu duraklat ve "Telefonu yan çevir" ekranı göster. iOS'ta yön kilitlenemediği için bu ekran şart.
- İç çözünürlük **384×216** (16:9) olsun. Ayarlar: `pixelArt: true`, `roundPixels: true`, `Scale.FIT` + `CENTER_BOTH`. Uzun ekranlarda (19.5:9, 20:9) yanlarda kalan boşluk koyu tema renginde olsun.
- iPhone çentiği ve Dynamic Island için `viewport-fit=cover` ve `env(safe-area-inset-*)` kullan. Hiçbir buton ya da metin güvenli alanın dışına taşmasın.
- Viewport ayarı: `width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no`.
- CSS ayarları: `touch-action: none`, `overscroll-behavior: none`, `user-select: none`, `-webkit-touch-callout: none`, yükseklik `100dvh`. Çift dokunmayla zoom, aşağı çekip yenileme ve uzun basma menüsü olmasın.
- **Dokunmatik kontroller:**
  - Sol altta dinamik sanal joystick.
  - Sağ altta tek bir bağlamsal eylem butonu ("Konuş / Bak / Al / At").
  - Sağ üstte duraklat butonu.
  - Tüm dokunma hedefleri en az 44×44 CSS px.
- **PC kontrolleri:** WASD veya ok tuşları ile hareket, E veya Space ile eylem, 1–4 tuşları ile yardımcılar, Esc ile duraklat. Menüler fareyle de çalışsın.
- Kontrol türü otomatik seçilsin: dokunmatik cihazda joystick görünsün, klavye kullanılınca gizlensin.
- **Metin arayüzü** (diyaloglar, soru ekranı, menüler, HUD yazıları) canvas'ın üstünde HTML/CSS overlay olarak yapılsın. Overlay, canvas'ın ölçeklenmiş sınırlarına hizalansın ve yeniden boyutlanmada güncellensin. Böylece metin her ekranda net okunur.
- **Font:** Türkçe karakterleri (ç ğ ı İ ö ş ü Ç Ğ Ö Ş Ü) destekleyen pixel tarzı bir font kullan (ör. Pixelify Sans) ve yerel dosya olarak paketle.
  - `<html lang="tr">` olsun.
  - Büyük harfe çevirirken `toLocaleUpperCase('tr-TR')` kullan.
  - Tüm Türkçe karakterleri bir test ekranında doğrula.
- Diyaloglar daktilo efektiyle yazılsın. Dokununca veya tuşa basınca metin tamamlansın, tekrar dokununca ilerlesin.

---

## 5. Performans

- Hedef 60 FPS. Oyun, Chrome DevTools'taki 4x CPU yavaşlatmasıyla da oynanabilir kalmalı.
- Görseller kodla üretilsin (bkz. 6. bölüm). Açılışta bir kez texture'a çevrilip önbelleğe alınsın.
- Update döngüsünde yeni nesne oluşturma. Tekrar kullanılan nesneler için havuz (pool) kullan.
- Fizik için Arcade Physics ya da basit AABB çarpışması yeterli.
- Sekme veya uygulama arka plana geçince (`visibilitychange`) oyunu ve sesi duraklat.
- Önce WebGL kullan, desteklenmiyorsa Canvas'a geç. Build boyutu küçük kalsın (hedef 5 MB altı).

---

## 6. Görsel tasarım

Görsel tarzı tamamen sen belirle: tutarlı, sevimli, renkli, 16-bit hissi veren top-down pixel art. Uyulacak kurallar:

- **Sprite'ları kodla üret:** palet + piksel matrisi → texture.
  - Parametrik bir karakter şablonu kullan. Ten, saç, saç modeli, üst ve alt kıyafet renkleri değişebilsin.
  - Her karakter 4 yönde yürüsün, yön başına 2–3 kare.
  - Diyaloglar için her karaktere büyük bir portre çiz (ör. 48×48).
- **Kartal** ve **Yağız Alp** çocuk boyunda olsun. Yağız Alp 1 yaş büyük olduğu için Kartal'dan çok az uzun.
- **Gülben Yerli, Yağmur Alkanat ve Burak Yerli** normal yetişkin boyunda olsun. Her biri ayırt edilebilir bir renk paletine sahip olsun.
- **Alihan Alkanat** diğer herkesten belirgin şekilde daha iri, uzun ve kalıplı olsun: geniş omuzlu ve atletik, **şişman DEĞİL**. Bunun için ayrı ve daha büyük bir gövde şablonu kullan.
- **Forma:** düz siyah-beyaz dikey çizgili. Arma, logo ya da sponsor YOK. Üzerinde birkaç keçeli kalem imza karalaması yeterli.
- Gerçek marka logosu veya telifli karakter çizme.
- **Yardımcı karakterler** için portre, alt bar ikonu ve çağırma animasyonu hazırla. Görünümleri özelliklerine göre olsun:
  - **Gülnur Teyze:** parlayan sihirli bir aura ve ışıldayan bir "doğru cevap" efekti.
  - **Ömerhan Özgüven:** elinde bir fener.
  - **Kadir Özçelik:** sabun köpükleri ve basketbol topu.
  - **Yiğit Yılmaz:** dizüstü bilgisayar ve yeşil "hack" kod yağmuru efekti.

---

## 7. Ses

- Tüm ses efektleri WebAudio ile üretilen chiptune sesler olsun (ses dosyası yok):
  - diyalog bip'i
  - doğru ve yanlış cevap
  - kapı
  - topun fileye girmesi ve çembere çarpması
  - düdük / buzzer
  - yakalanma "!"
  - yardımcı çağırma
  - final kutlaması
- İstersen basit bir döngü müzik ekle.
- iOS için ilk dokunuşta AudioContext'i `resume()` et.
- Ses aç/kapa ayarı olsun ve `localStorage`'da saklansın.
- Titreşim yalnızca `navigator.vibrate` olan cihazlarda çalışsın, yoksa sessizce atlansın.

---

## 8. Menüler ve kayıt

- **Ana menü:**
  - oyun adı "Basmath"
  - [Yeni Oyun]
  - [Devam Et] (kayıt varsa)
  - [Ses: Açık/Kapalı]
  - küçük yazı: "Yapımcı: Yiğit Yılmaz"
- **Duraklat menüsü:** Devam, Ses, Ana Menü.
- **Kayıt (localStorage):**
  - Saklananlar: seçilen karakter, son checkpoint odası, yardımcı hakları, ses ayarı.
  - Oyun bitince kayıt temizlensin.
  - Tüm localStorage erişimleri try/catch içinde olsun.

---

## 9. Karakter seçimi ve güçlü yanlar

Seçim ekranında iki kart bulunur:

- **Kartal — Basketbolcu:** "Hedefleri çok daha kolay vurur."
  - Basket odasında nişan barındaki yeşil (başarı) alanı **%40 daha geniş** olur.
  - Gösterge **%15 daha yavaş** hareket eder.
- **Yağız Alp — Matematikçi:** "Kartal'dan 1 yaş büyük, biraz daha bilgili."
  - Her sınav denemesinde **1 kez** kullanabileceği bir "Abi Bilgisi" butonu olur.
  - Bu buton o anki sorunun yanlış şıklarından **1 tanesini** eler (4 şık 3'e iner).

Kurallar:
- Avantaj farkı küçük kalsın. Değerler `config.js` içinden ayarlanabilsin.
- Seçim hikâyeyi değiştirmez. Seçilen kuzen kontrol edilir, diğeri onu Pokémon takipçisi gibi arkadan izler.
- Büyükler diyaloglarda ikisine birden hitap eder ("çocuklar", "siz").

---

## 10. Yardımcı karakter sistemi

- **Yerleşim:** 4 yardımcının portresi ekranın altında, ortada durur ve joystick ile eylem butonuyla çakışmaz. PC'de 1–4 tuşlarıyla çağrılır.
- **Çağırma akışı:**
  1. "Aranıyor..." telefon animasyonu oynar.
  2. Yardımcı ekrana kayarak girer, adını ve güç adını söyler.
  3. Etkisi uygulanır.
  4. Yardımcı ekrandan çıkar.
- **Kullanım hakkı:**
  - Her yardımcı tüm oyun boyunca **1 kez** kullanılabilir.
  - Kullanıldığı oda kaybedilirse hakkı geri verilir.
  - İki kural da `config.js` içinden ayarlanabilsin.
- **İşe yaramadığı odalarda:** ikon soluk görünür. Dokunulursa hak harcanmaz ve "Bu yardım burada işe yaramaz." uyarısı çıkar.

| # | Yardımcı | Güç (BİREBİR) | Nerede | Etki |
|---|---|---|---|---|
| 1 | Gülnur Teyze | "Teyzenin Gücü" | Gülben ve Burak sınavları (soru ekranındayken) | O anki sorunun doğru şıkkını parlatarak gösterir |
| 2 | Ömerhan Özgüven | "Dayıların üstadı" | Yağmur'un oyun alanı | Fenerle kartal oyuncağının yerini gösterir: ~5 sn ışık huzmesi, sonra küçük bir işaret kalır |
| 3 | Kadir Özçelik | "Sabun üstadı" | Alihan'ın basket salonu (atışlar bitmeden) | Gelir ve 1 adet 3'lük atar: +3 sayı, oyuncunun 6 atış hakkından **düşmez** |
| 4 | Yiğit Yılmaz | "Evin eski en küçüğü" | Gülben veya Burak sınavı | Bilgisayarıyla soruları hackler: o sınavın kalan **tüm** sorularında doğru şıklar işaretlenir |

---

## 11. Odalar

### Ortak oda yapısı
- Her oda kuşbakışı, yürünebilir bir alandır.
- Oyuncu odanın girişinde başlar. Boss'un yanına gidip "Konuş" deyince giriş diyaloğu ve görev başlar.
- Odaya girerken bölge ve oda adını gösteren bir başlık kartı çıkar.

### Oda 1 — Gülben Yerli'nin Odası (Anneler Bölgesi)
- **Mekân:** sıcak bir salon veya mutfak. Gülben elinde defterle bekler.
- **Giriş repliği (taslak):** "Bakalım ne kadar büyümüşsünüz! 5 sorudan en az 3'ünü bilirseniz geçersiniz."
- **Sınav:**
  - Havuzdan rastgele 5 kolay soru gelir.
  - Her soruda 4 şık vardır, 2×2 büyük butonlar olarak gösterilir. Süre YOK.
  - Üstte ilerleme yazar: "Soru 2/5 · Doğru: 1".
  - Her cevaptan sonra doğru/yanlış geri bildirimi verilir. Yanlışta doğru şık da gösterilir.
- **Geçme şartı:** 5 sorudan en az 3 doğru. Geçmek imkânsız hâle gelince (3. yanlışta) sınav hemen biter.
- ✗ → Gülben (BİREBİR): **"Ha ha ha git büyü de gel!"** → odanın başı, yeni sorular.
- ✓ → kapı açılır → Oda 2.

### Oda 2 — Yağmur Alkanat'ın Çocuk Oyun Alanı (Anneler Bölgesi)
- **Mekân:** renkli bir oyun alanı. Kaydırak, top havuzu, çadır, oyuncak sandıkları, raflar ve halılar bulunur. Mobilyalar görüşü engeller ve saklanma yeri olarak kullanılabilir.
- **Giriş repliği (taslak, Yağmur):** "Oyun alanında istediğiniz kadar oynayın ama kanatlarını açmış, kıvrık gagalı kartal oyuncağıma dokunmak yok!"
- **HUD görev yazısı:** "Kartal oyuncağını bul, Yağmur Alkanat'a yakalanmadan kapıdan çık."

**Oyuncaklar**
- 6–8 kap (sandık, kutu, top havuzu, çadır, dolap) ve yerde duran birkaç oyuncak bulunur.
- Kartal oyuncağı her denemede rastgele bir kabın içine konur.
- Diğer oyuncaklar tuzaktır: baykuş, papağan, ördek, tavuk, penguen, güvercin, ayıcık, araba, dinozor.
- Kartal oyuncağı kuşlar arasında net ayırt edilebilsin: açık kanatlar, kıvrık sarı gaga, kahverengi gövde, beyaz baş.

**Bak / Al**
- Oyuncu bir kaba yaklaşıp "Bak" dediğinde içindeki oyuncak büyük olarak gösterilir. Oyuncağın **adı yazmaz**.
- Seçenekler: [Al] / [Geri bırak].
- Bakmak serbesttir. Almak kesin karardır.
- **Yanlış oyuncak alınırsa** oda anında başarısız olur.

**Yağmur'un devriyesi**
- Yağmur belirli bir rotada yavaşça dolaşır ve ara sıra arkasını döner. Önünde bir görüş konisi görünür.
- Kartal oyuncağı alınmadan önce koni sarıdır ve zararsızdır; Yağmur oyuncuyu umursamaz.
- Kartal oyuncağı alındıktan sonra koni kırmızıya döner.
- Kontrol edilen karakter konide ve görüş hattında ~0,3 sn kalırsa Yağmur'un üstünde "!" çıkar ve oyuncu yakalanır. Mobilyalar görüş hattını keser. Takipçi kuzen algılanmaz.

**Çıkış**
- Çıkış, girilen kapıdır.
- Kartal oyuncağı olmadan kapıya gidilirse "Önce kartal oyuncağını bulmalıyız!" uyarısı çıkar.

**Sonuç**
- ✗ (yanlış oyuncak alındı veya kartal oyuncağıyla yakalandı) → Yağmur (BİREBİR): **"Yaşınız kaç başınız kaç annem sizin!"** → odanın başı. Oyuncaklar yeniden karıştırılır, Yağmur rotanın başına döner.
- ✓ (kartal oyuncağıyla kapıdan çıkış) → ekran kartı: **"Anneler bölgesi geçildi!"** → 2. Bölge.

**Zorluk:** çocuklar için adil olsun. Yağmur oyuncudan yavaş olsun ve saklanacak yeterli yer bulunsun.

### Oda 3 — Burak Yerli'nin Odası (Babalar Bölgesi)
- **Mekân:** yazı tahtalı bir çalışma odası.
- **Giriş repliği (taslak):** "Annenizi geçtiniz ama benim sorularım daha zor. 4 sorunun 4'ünü de bilmeniz lazım!"
- **Sınav:** havuzdan rastgele 4 orta seviye soru gelir. Arayüz Gülben'inkiyle aynı, süre yok.
- **Geçme şartı:** 4/4. İlk yanlışta sınav biter.
- ✗ → Burak (BİREBİR): **"Youmat YouTube kanalında konu tekrarını izleyin de gelin!"** → odanın başı, yeni sorular.
- ✓ → Oda 4.

### Oda 4 — Alihan Alkanat'ın Basketbol Salonu (Babalar Bölgesi)
- **Mekân:** kuşbakışı yarım saha. Pota, serbest atış çizgisi, boya alanı ve üçlük çizgisi çizili.
- **Giriş repliği (taslak):** "Salona hoş geldiniz! 6 atışta 12 sayı yaparsanız sizi bir sürpriz bekliyor."

**Atış noktaları**
- Noktalar yere çizili dairelerdir ve üzerlerinde puanları yazar:
  - 1 serbest atış noktası: **1 puan**
  - Üçlük çizgisinin içinde 3 nokta: **2 puan**
  - Üçlük çizgisinin dışında 3 nokta (iki köşe ve tepe): **3 puan**
- Oyuncu her atış için istediği noktaya yürür ve "At" der.

**Atış mekaniği**
- Bir bar üzerinde gösterge ileri-geri gider. Oyuncu dokunarak veya tuşa basarak göstergeyi durdurur.
- Gösterge yeşil alandaysa top girer, değilse çembere çarpıp kaçar. Sonuç deterministiktir, şans yoktur.
- Mesafe arttıkça yeşil alan daralır ve gösterge hızlanır.
- Başlangıç değerleri (bar genişliğinin oranı / tek geçiş süresi):

  | Atış | Yeşil alan | Geçiş süresi |
  |---|---|---|
  | 1 puan | 0,35 | 1,4 sn |
  | 2 puan | 0,20 | 1,1 sn |
  | 3 puan | 0,12 | 0,9 sn |

- Kartal bonusu bu odada uygulanır.
- Top potaya doğru kavisli uçar; gölge ve ölçekle sahte derinlik verilir.

**Skor ve sonuç**
- HUD: "Skor: 7 / 12 · Kalan atış: 3".
- **Kazanma:** skor 12'ye ulaşır ya da geçerse (ör. 11 + 3 = 14) anında başarı.
- **Kaybetme:** 6 atış bittiğinde skor 12'nin altındaysa.
- ✗ → Alihan (BİREBİR): **"Boyunuza göre bir spor seçin çocuklar!"** → odanın başı, skor 0, 6 atış.
- Değerleri oynayarak ayarla: Kartal ile rahatça, Yağız Alp ile birkaç denemede geçilebilsin.

### Final
1. Düdük ve kutlama efekti çalar. Burak Yerli kapıdan salona girer.
2. Alihan Alkanat **Kartal**'a, Burak Yerli **Yağız Alp**'e forma verir. Oyuncu hangi karakteri seçmiş olursa olsun ikisi de forma alır.
   - Taslak replikler: Alihan → Kartal: "Helal olsun oğlum, bu senin!" · Burak → Yağız Alp: "Sen de hak ettin!"
3. Formalar ekranın ortasında büyük gösterilir: **"Full takım imzalı Beşiktaş forması!"**

### Kapanış
1. Siyah ekranda beyaz yazı, daktilo efektiyle: **"Bir Hacıhafıziller hikayesi devam edecektir..."** (~4 sn)
2. Ekran tamamen kararır.
3. **"Yeğenlerine Yiğit dayısından ufak bir anı."** (~4 sn, dokununca da geçer)
4. Kayıt temizlenir ve ana menüye dönülür.

---

## 12. Metinler

Tüm oyun metinleri tek dosyada toplansın: `src/data/texts.js`. Her satırın yanına `// BİREBİR — değiştirme` ya da `// taslak` yorumu eklensin.

**BİREBİR metinler (harfi harfine kullan):**
- Gülben Yerli: "Ha ha ha git büyü de gel!"
- Yağmur Alkanat: "Yaşınız kaç başınız kaç annem sizin!"
- Burak Yerli: "Youmat YouTube kanalında konu tekrarını izleyin de gelin!"
- Alihan Alkanat: "Boyunuza göre bir spor seçin çocuklar!"
- Kapanış 1: "Bir Hacıhafıziller hikayesi devam edecektir..."
- Kapanış 2: "Yeğenlerine Yiğit dayısından ufak bir anı."
- Yardımcı güç adları: "Teyzenin Gücü", "Dayıların üstadı", "Sabun üstadı", "Evin eski en küçüğü"

**Taslak metinler:**
- Oyun girişi: "Hacıhafıziller evinde büyük gün! Kartal ile Yağız Alp'i bir sürpriz bekliyor... ama önce annelerin, sonra babaların sınavlarını geçmeleri lazım."
- Ayrıca 11. bölümde "taslak" diye işaretli tüm replikler.

**Dikkat:** "Kartal" (çocuk) ile kartal oyuncağı metinlerde karışmasın. Oyuncak her yerde "kartal oyuncağı" diye geçsin.

---

## 13. Soru havuzları — `src/data/questions.js`

**Her iki havuz için kurallar:**
- Her soru akıldan 10–20 saniyede çözülebilmeli.
- Geometri, şekil ya da kalem-kâğıt gerektiren çok basamaklı işlem YOK.
- Her soruda 4 şık bulunur, 1'i doğrudur ve şıklar karıştırılır.
- Yanlış şıklar inandırıcı olsun (±1–2 farklar, tipik hatalar). Hepsi birbirinden farklı ve pozitif olsun.
- Her havuzda en az 25 soru olsun. Bir denemede aynı soru iki kez gelmesin.
- Havuzlar kolayca düzenlenebilir olsun.

**Gülben havuzu (kolay) — örnek seviye:**
- 7 + 5 = ? → 12
- 14 − 6 = ? → 8
- 3 × 4 = ? → 12
- 18 ÷ 3 = ? → 6
- 10'un yarısı kaç? → 5
- Elinde 5 şeker var, 3 tane daha aldın. Kaç şekerin oldu? → 8
- Bir haftada kaç gün var? → 7

**Burak havuzu (daha zor) — örnek seviye:**
- 7 × 8 = ? → 56
- 63 ÷ 9 = ? → 7
- 48 + 27 = ? → 75
- 100 − 36 = ? → 64
- 3 + 4 × 2 = ? → 11 (yanlış şıklardan biri 14 olsun)
- 60'ın yarısının yarısı kaç? → 15
- 2 saat kaç dakika? → 120
- ? + 9 = 17 ise ? kaç? → 8
- Bir sayının 3 katı 27 ise sayı kaç? → 9

---

## 14. Kod yapısı

```
src/
  main.js          Phaser oyun yapılandırması
  config.js        tüm ayarlanabilir sayılar: soru sayıları, geçme eşikleri, atış hakkı,
                   hedef skor, yardımcı hakları ve iadesi, Kartal/Yağız Alp bonusları,
                   nişan barı alanları ve hızları
  scenes/          Boot, Menu, Intro, CharacterSelect, GulbenRoom, YagmurPlayground,
                   BurakRoom, AlihanGym, Ending, Credits
  systems/         quiz.js, basketball.js, helpers.js, stealth.js  (saf mantık, Phaser'dan bağımsız)
                   save.js, audio.js, input.js
  ui/              HTML overlay: diyalog, soru ekranı, menüler, yardımcı barı, HUD
  art/             palet + sprite üretici
  data/            texts.js, questions.js
tests/             Vitest birim testleri
```

**Testler:** oyun kuralları saf fonksiyonlarda olsun ve Vitest ile şunlar test edilsin:
- Gülben sınavı: 3/5 kuralı ve erken bitiş
- Burak sınavı: 4/4 kuralı
- Basket: 12+ ile kazanma ve 6 atış sınırı
- Kadir bonusunun atış hakkından düşmemesi
- Yardımcı hakları ve iadesi
- Yağız Alp'in şık eleme hakkı
- Yağmur'un yalnızca kartal oyuncağı alındıktan sonra yakalayabilmesi

**Debug modu:** `?debug=1` ile FPS göstergesi ve istenen odaya atlama menüsü açılsın.

---

## 15. Aşamalar

Aşamaları sırayla uygula. Her aşamanın sonunda `npm run build` ve testler geçmeli. Ardından bana 2–3 satırlık bir özet yaz ve sonraki aşamaya geç. Yalnızca gerçekten karar gerektiren bir şey çıkarsa dur ve sor.

1. **İskelet:** Vite + Phaser, ölçekleme, safe-area, yatay uyarısı, joystick + klavye, debug menüsü. Boş bir odada yürüyen karakter.
2. **Görseller ve diyalog:** sprite üretici, tüm karakterler ve portreler. Diyalog sistemi (HTML overlay, Türkçe karakter testi).
3. **Menü ve seçim:** ana menü, giriş, karakter seçimi, takipçi kuzen, kayıt/checkpoint.
4. **Gülben odası:** sınav sistemi ve ortak "oda başarısız / sıfırla" akışı.
5. **Yardımcı sistemi:** alt bar, çağırma animasyonu, haklar ve iade. Gülnur ve Yiğit sınavlarda çalışsın.
6. **Yağmur'un oyun alanı:** kaplar, Bak/Al, devriye, görüş konisi + görüş hattı, Ömerhan'ın feneri.
7. **Burak odası.**
8. **Alihan'ın salonu:** atış noktaları, nişan barı, top animasyonu, skor, Kartal bonusu, Kadir.
9. **Final ve kapanış:** final sahnesi, kapanış ekranları, ana menüye dönüş.
10. **Ses ve yayın:** ses efektleri, PWA (manifest, ikonlar, service worker), GitHub Pages yayın workflow'u, README.
11. **Cihaz kontrolü:** 17. bölümdeki listeyi kontrol et.

---

## 16. PWA ve yayın

- **Manifest (`manifest.webmanifest`):**
  - name ve short_name: "Basmath"
  - `display: "fullscreen"` (desteklenmezse standalone)
  - `orientation: "landscape"`
  - `start_url: "./"`, `scope: "./"`
  - tema renkleri
  - pixel art ikon: 192 ve 512 boyutları + maskable
- iOS için `apple-touch-icon` ve gerekli meta etiketlerini ekle.
- **Service worker:** yalnızca production build'de kaydolsun. Önbellek sürümlü olsun ki güncellemeler telefonlara ulaşsın.
- **Yayın:** `dist/` klasörünü GitHub Pages'e yayınlayan bir GitHub Actions workflow'u ekle.
- **README (Türkçe):** yerelde çalıştırma, aynı Wi-Fi'deki telefonla test (`npm run dev -- --host`), yayınlama ve cihazlara kurulum:
  - **Android (Samsung / Poco):** Chrome → menü → "Uygulamayı yükle" veya "Ana ekrana ekle"
  - **iPhone:** **Safari** → Paylaş → "Ana Ekrana Ekle" (iPhone'da tam ekran ancak bu yolla olur)
  - **Windows:** Chrome veya Edge'de adres çubuğundaki "Yükle" simgesi

---

## 17. Kabul kriterleri

- [ ] Mümkünse Playwright ile iPhone 14 Pro Max (WebKit), iPhone 11 ve bir Galaxy profilinde test edilsin:
  - oyun açılıyor ve konsolda hata yok
  - debug menüsüyle her oda yükleniyor
  - ekran görüntülerinde arayüz çentiğe veya kenarlara taşmıyor
- [ ] 4x CPU yavaşlatmasında FPS oynanabilir düzeyde.
- [ ] Dikey tutunca uyarı çıkıyor, yan çevirince oyun kaldığı yerden devam ediyor.
- [ ] Hiçbir yerde sayfa kaymıyor, zoom olmuyor, metin seçilmiyor.
- [ ] Tüm Türkçe karakterler doğru görünüyor.
- [ ] BİREBİR metinler harfi harfine aynı.
- [ ] Oyun internetsiz çalışıyor (ikinci açılıştan itibaren).
- [ ] Oyun hiç yardımcı kullanmadan da baştan sona bitirilebiliyor.
