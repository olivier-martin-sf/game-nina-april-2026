// Simple static file server with sticker persistence API
var http = require('http');
var fs = require('fs');
var path = require('path');

var PORT = 3000;
var SAVE_FILE = path.join(__dirname, 'stickers-save.txt');

var MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function serveStatic(req, res) {
  var filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  var ext = path.extname(filePath);
  fs.readFile(filePath, function(err, data) {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
    res.end(data);
  });
}

function handleAPI(req, res) {
  if (req.method === 'GET' && req.url === '/api/stickers') {
    fs.readFile(SAVE_FILE, 'utf8', function(err, data) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      if (err) {
        res.end('{}');
      } else {
        res.end(data);
      }
    });
    return true;
  }

  if (req.method === 'POST' && req.url === '/api/stickers') {
    var body = '';
    req.on('data', function(chunk) { body += chunk; });
    req.on('end', function() {
      fs.writeFile(SAVE_FILE, body, 'utf8', function(err) {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to save' }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
        }
      });
    });
    return true;
  }

  return false;
}

http.createServer(function(req, res) {
  if (!handleAPI(req, res)) {
    serveStatic(req, res);
  }
}).listen(PORT, function() {
  console.log('Server running at http://localhost:' + PORT);
});
