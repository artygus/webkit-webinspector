#!/usr/bin/env node

const connect = require('connect'),
      serveStatic = require('serve-static'),
      path = require('path');

var port = 8080;

for(var arg of process.argv.slice(1)) {
  port = arg;
}

const staticPath = path.join(__dirname, 'lib', 'WebInspectorUI', 'latest');

connect()
  .use(serveStatic(staticPath))
  .listen(port);
