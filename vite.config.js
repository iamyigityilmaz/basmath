import { defineConfig } from 'vite';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// Build sonunda dist/sw.js üretir: tüm dosyalar sürümlü bir önbelleğe alınır (offline çalışma).
// Önbellek adı dosya içeriklerinin özetinden türetilir; yeni yayın → yeni sürüm → telefonlar güncellenir.
function serviceWorker() {
  let outDir = 'dist';
  return {
    name: 'basmath-service-worker',
    apply: 'build',
    configResolved(cfg) {
      outDir = cfg.build.outDir;
    },
    closeBundle() {
      const files = [];
      const walk = (dir) => {
        for (const name of fs.readdirSync(dir)) {
          const full = path.join(dir, name);
          if (fs.statSync(full).isDirectory()) walk(full);
          else files.push(path.relative(outDir, full).split(path.sep).join('/'));
        }
      };
      walk(outDir);
      const assets = files.filter((f) => f !== 'sw.js').sort();
      const hash = createHash('sha1');
      assets.forEach((f) => hash.update(f).update(fs.readFileSync(path.join(outDir, f))));
      const version = hash.digest('hex').slice(0, 10);
      const list = ['./', ...assets.map((f) => `./${f}`)];
      const sw = `// Otomatik üretilir (vite.config.js). Elle düzenleme.
const CACHE = 'basmath-${version}';
const ASSETS = ${JSON.stringify(list)};

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('basmath-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true, ignoreVary: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req).catch(() => (req.mode === 'navigate' ? caches.match('./index.html', { ignoreVary: true }) : Response.error()));
    }),
  );
});
`;
      fs.writeFileSync(path.join(outDir, 'sw.js'), sw);
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [serviceWorker()],
  build: {
    target: 'es2019',
    chunkSizeWarningLimit: 2000,
  },
  test: {
    include: ['tests/**/*.test.js'],
    environment: 'node',
  },
});
