const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let requestUrl = req.url === '/' ? '/index.html' : req.url;
  let filePath = path.join(distDir, requestUrl);

  if (!fs.existsSync(filePath)) {
    filePath = path.join(rootDir, requestUrl);
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        fs.readFile(path.join(distDir, 'index.html'), (err, indexContent) => {
          if (err) {
            res.writeHead(500);
            res.end('Server Error: ' + err.code);
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(indexContent, 'utf-8');
          }
        });
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`  🚀 VortexQuest 2D RPG Server is Running!`);
  console.log(`  Access URL: http://localhost:${PORT}`);
  console.log(`=================================================\n`);
});
