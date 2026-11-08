// Servidor estático mínimo para previsualizar el perfil: node scripts/serve.mjs → http://127.0.0.1:4317/preview.html
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, normalize, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const types = { '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.md': 'text/plain; charset=utf-8' };

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '');
  const file = normalize(join(root, path || 'preview.html'));
  if (!file.startsWith(root)) return res.writeHead(403).end();
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
}).listen(4317, '127.0.0.1', () => console.log('http://127.0.0.1:4317/preview.html'));
