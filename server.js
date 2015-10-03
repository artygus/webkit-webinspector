#!/usr/bin/env node

const connect = require('connect'),
      serveStatic = require('serve-static'),
      path = require('path');

var version = 'latest',
    port = 8080;

for(var arg of process.argv.slice(2)) {
  if (arg[0] === 'v') {
    var argVer = arg.substr(1);

    if (['7', '8'].indexOf(argVer) !== -1) {
      version = arg;
    }
  } else {
    port = arg;
  }
}

const staticPath = path.join(__dirname, 'lib', 'WebInspectorUI', version);

connect()
  .use(serveStatic(staticPath))
  .listen(port);
