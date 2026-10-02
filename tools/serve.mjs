// Tiny local static server for dist/ with clean URLs and gzip (no dependencies).
// Usage: npm run serve  ->  http://localhost:4173
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const ROOT = fileURLToPath(new URL('../dist/', import.meta.url));
const PORT = Number(process.env.PORT) || 4175;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json',
};
const COMPRESS = new Set(['.html', '.css', '.js', '.svg', '.txt', '.json']);

async function resolve(pathname) {
  const clean = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  let file = join(ROOT, clean);
  if (!file.startsWith(ROOT)) return null;
  try {
    const s = await stat(file);
    if (s.isDirectory()) file = join(file, 'index.html');
    await stat(file);
    return file;
  } catch {
    return null;
  }
}

async function send(req, res, file, status = 200) {
  const ext = extname(file);
  let body = await readFile(file);
  const headers = {
    'Content-Type': TYPES[ext] || 'application/octet-stream',
    'Cache-Control': /\.(avif|webp|jpg|png|woff2|svg)$/.test(file) ? 'public, max-age=3600' : 'no-cache',
  };
  if (COMPRESS.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
    body = gzipSync(body);
    headers['Content-Encoding'] = 'gzip';
    headers.Vary = 'Accept-Encoding';
  }
  res.writeHead(status, headers);
  res.end(body);
}

createServer(async (req, res) => {
  try {
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch {
      res.writeHead(400, { 'Content-Type': 'text/plain' }); return res.end('Bad request');
    }
    // /menu -> /menu/ so paths and active states stay consistent (clean local paths only)
    const safe = /^\/[\w\-/]*$/.test(pathname) && !pathname.includes('//');
    if (safe && !extname(pathname) && !pathname.endsWith('/') && (await resolve(pathname + '/'))) {
      res.writeHead(301, { Location: pathname + '/' }); return res.end();
    }
    const file = await resolve(pathname);
    if (!file) return send(req, res, join(ROOT, '404.html'), 404);
    return send(req, res, file);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server error');
    console.error(err);
  }
}).listen(PORT, '127.0.0.1', () => console.log(`Alibi Incline demo (this machine only): http://localhost:${PORT}`));
