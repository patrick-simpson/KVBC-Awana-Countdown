import { cpSync, existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const BASE = '/KVBC-Awana-Countdown/';
const SHARED_DIR = resolve(__dirname, 'shared');

const MIME: Record<string, string> = {
  '.json': 'application/json',
  '.png': 'image/png',
  '.md': 'text/markdown',
};

/**
 * Hosts the repo-root `shared/` directory (schedule.json, theme.json,
 * club art) for the whole Awana app family: served at `${BASE}shared/*`
 * by the dev server and copied into `dist/shared/` on build so GitHub
 * Pages publishes it. Lives at the repo root (not `public/`) because
 * src code imports the JSONs directly and Vite forbids importing from
 * the public dir.
 */
function sharedDir(): Plugin {
  return {
    name: 'awana-shared-dir',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '').split('?')[0];
        const prefixes = [`${BASE}shared/`, '/shared/'];
        const prefix = prefixes.find((p) => url.startsWith(p));
        if (!prefix) return next();
        const rel = normalize(decodeURIComponent(url.slice(prefix.length)));
        if (rel.startsWith('..')) return next();
        const file = join(SHARED_DIR, rel);
        if (!existsSync(file) || !statSync(file).isFile()) return next();
        res.setHeader('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(readFileSync(file));
      });
    },
    closeBundle() {
      cpSync(SHARED_DIR, resolve(__dirname, 'dist/shared'), { recursive: true });
    },
  };
}

export default defineConfig({
  base: BASE,
  plugins: [react(), tailwindcss(), sharedDir()],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
