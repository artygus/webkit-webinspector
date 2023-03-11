#!/usr/bin/env node

const http = require('http'),
      finalhandler = require('finalhandler'),
      serveStatic = require('serve-static'),
      path = require('path'),
      fs = require('fs'),
      protocolUtils = require('./src/protocol.utils')

var port = 8080

for(var arg of process.argv.slice(1)) {
  port = arg
}

const webInspectorUIPath = path.join(__dirname, 'lib', 'WebInspectorUI', 'latest'),
      protocolVersions = protocolUtils.listAvailableVersions(webInspectorUIPath),
      latestProtocolPath = protocolUtils.versionPath(webInspectorUIPath, protocolVersions[protocolVersions.length - 1]),
      serve = serveStatic(webInspectorUIPath)

const server = http.createServer(function onRequest (req, res) {
  var done = finalhandler(req, res)

  if (req.url === '/Protocol/InspectorBackendCommands.js') {
    fs.readFile(path.join(latestProtocolPath, 'InspectorBackendCommands.js'), function(err, buf) {
      if (err) return done(err)
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8')
      res.end(buf)
    })
  } else {
    serve(req, res, done)
  }
})
server.listen(port)
