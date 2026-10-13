# Basmath

Kuşbakışı pixel art, kısa hikâyeli bir bulmaca oyunu. Kartal ve Yağız Alp, önce annelerin (Gülben Yerli, Yağmur Alkanat), sonra babaların (Burak Yerli, Alihan Alkanat) sınavlarını geçip sürprize ulaşmaya çalışır.

Tek kod tabanı: **web oyunu + PWA** (Phaser 3 + Vite). Tarayıcıda açılır; "Ana ekrana ekle / Uygulamayı yükle" ile uygulama gibi tam ekran ve internetsiz çalışır. Tüm görseller ve sesler kodla üretilir; harici CDN, analitik ya da ağ isteği yoktur.

## Yerelde çalıştırma

Node.js 20+ gerekir.

```bash
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` adresini aç.

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | `dist/` klasörüne yayın sürümü (service worker dahil) |
| `npm run preview` | `dist/` klasörünü yerelde sunar (PWA / offline denemesi için) |
| `npm test` | Vitest birim testleri (oyun kuralları) |
| `npm run e2e` | Playwright cihaz kontrolü (önce `npm run build`; ilk seferde `npx playwright install chromium webkit`) |
| `npm run icons` | PWA ikonlarını yeniden üretir |

### Aynı Wi-Fi'deki telefonla test

```bash
npm run dev -- --host
```

Terminalde çıkan `Network:` adresini (ör. `http://192.168.1.20:5173`) telefonun tarayıcısına yaz. Telefon ve bilgisayar aynı Wi-Fi ağında olmalı. Not: service worker ve "uygulamayı yükle" yalnızca HTTPS'te (ya da `localhost`'ta) çalışır; kurulumu denemek için yayınlanmış adresi kullan.

### Debug modu

Adresin sonuna `?debug=1` ekle: FPS göstergesi ve üstte **DEBUG** menüsü açılır (istenen odaya atlama, karakter değiştirme, Türkçe font testi).

## Kontroller

- **Telefon:** ekranın sol yarısına dokunup sürükle (joystick), sağ altta eylem butonu (Konuş / Bak / Al / At), sağ üstte duraklat, altta 4 yardımcı. Oyun **yatay** oynanır.
- **Bilgisayar:** WASD ya da ok tuşları ile hareket, **E** ya da **Space** ile eylem, **1–4** ile yardımcılar, **Q** ile "Abi Bilgisi" (Yağız Alp), **Esc** ile duraklat. Menüler fareyle de çalışır.

## Yayınlama (GitHub Pages)

1. Projeyi bir GitHub deposuna gönder (`main` dalı):
   ```bash
   git init
   git add .
   git commit -m "Basmath"
   git branch -M main
   git remote add origin https://github.com/KULLANICI/DEPO.git
   git push -u origin main
   ```
2. GitHub'da **Settings → Pages → Build and deployment → Source: GitHub Actions** seç.
3. `.github/workflows/deploy.yml` her `main` gönderiminde testleri çalıştırır, build alır ve `dist/` klasörünü yayınlar. Adres: `https://KULLANICI.github.io/DEPO/`

`vite.config.js` içinde `base: './'` olduğu için depo adı ne olursa olsun yollar çalışır. Her yayında service worker önbelleği yeni bir sürüm adı alır; telefonlar oyunu bir sonraki açılışta günceller (güncelleme için bir kez internete bağlı açmak yeterli).

## Cihazlara kurulum

- **Android (Samsung / Poco):** Chrome ile adresi aç → sağ üst menü (⋮) → **"Uygulamayı yükle"** ya da **"Ana ekrana ekle"**.
- **iPhone:** adresi **Safari** ile aç → **Paylaş** → **"Ana Ekrana Ekle"**. (iPhone'da tam ekran yalnızca bu yolla olur; Chrome'dan eklenirse tam ekran olmaz.)
- **Windows:** Chrome ya da Edge'de adres çubuğundaki **"Yükle"** simgesine tıkla.

Kurulumdan sonra oyun bir kez açıldıysa internetsiz de çalışır.

## Oyunu düzenleme

| Ne | Nerede |
|---|---|
| Tüm sayılar (soru sayısı, geçme eşiği, atış hakkı, hedef skor, yardımcı hakları, karakter bonusları, nişan barı, devriye) | `src/config.js` |
| Tüm metinler (`// BİREBİR — değiştirme` / `// taslak` işaretli) | `src/data/texts.js` |
| Soru havuzları | `src/data/questions.js` |
| Karakter renkleri ve saç modelleri | `src/art/palette.js` |

## Kod yapısı

```
src/
  main.js          Phaser oyun yapılandırması
  config.js        tüm ayarlanabilir sayılar
  nav.js           sahneler arası geçiş
  scenes/          Boot, Menu, Intro, CharacterSelect, GulbenRoom, YagmurPlayground,
                   BurakRoom, AlihanGym, Ending, Credits (+ RoomBase, QuizRoom, Actor)
  systems/         quiz.js, basketball.js, helpers.js, stealth.js  (saf mantık, Phaser'dan bağımsız)
                   save.js, audio.js, input.js, session.js
  ui/              HTML overlay: diyalog, soru ekranı, menüler, yardımcı barı, HUD
  art/             palet + piksel matrisi → sprite / portre / oda üretici
  data/            texts.js, questions.js
tests/             Vitest birim testleri, e2e/ Playwright cihaz kontrolü
scripts/           ikon üretici ve görsel önizleme araçları
```

Yapımcı: Yiğit Yılmaz
