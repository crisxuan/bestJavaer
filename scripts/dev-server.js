/* 本地预览服务器：静态服务当前目录。
   支持 Kimi Work 传入的 --port / --host 参数，未传时默认 7100 / 127.0.0.1。 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2'
};

function readArg(name, fallback) {
  const index = process.argv.indexOf(name);

  if (index !== -1 && process.argv[index + 1] && !process.argv[index + 1].startsWith('--')) {
    return process.argv[index + 1];
  }

  const inline = process.argv.find((arg) => arg.startsWith(name + '='));
  return inline ? inline.split('=')[1] : fallback;
}

const root = path.resolve(__dirname, '..');
const port = Number(readArg('--port', process.env.PORT || 7100)) || 7100;
const host = readArg('--host', process.env.HOST || '127.0.0.1');

const server = http.createServer((req, res) => {
  let pathname;
  let statusCode = 200;

  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch (error) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  const servesGeneratedSeo =
    pathname === '/en' ||
    pathname === '/en/' ||
    pathname === '/articles' ||
    pathname.startsWith('/articles/') ||
    pathname === '/en/articles' ||
    pathname.startsWith('/en/articles/');
  let filePath = path.join(servesGeneratedSeo ? path.join(root, 'dist') : root, pathname);

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    filePath = path.join(root, '404.html');
    statusCode = 404;
  }

  const ext = path.extname(filePath).toLowerCase();

  res.writeHead(statusCode, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': 'no-store'
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(port, host, () => {
  console.log(`cxuan-ai-labs preview: http://${host}:${port}/`);
});
