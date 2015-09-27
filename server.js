#!/usr/bin/env node

const connect = require('connect'),
      serveStatic = require('serve-static'),
      path = require('path');

var staticPath = path.join(__dirname, 'lib', 'WebInspectorUI'),
    port = process.argv.slice(2)[0];

connect()
  .use(serveStatic(staticPath))
  .listen(port || 8080);
