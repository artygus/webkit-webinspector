#!/usr/bin/env node

const http = require('http'),
      finalhandler = require('finalhandler'),
      serveStatic = require('serve-static'),
      path = require('path');

var port = 8080;

for(var arg of process.argv.slice(1)) {
  port = arg;
}

const staticPath = path.join(__dirname, 'lib', 'WebInspectorUI', 'latest');
var serve = serveStatic(staticPath);

var server = http.createServer(function onRequest (req, res) {
  serve(req, res, finalhandler(req, res))
});

server.listen(port);
