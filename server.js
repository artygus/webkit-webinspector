#!/usr/bin/env node

const http = require('http'),
      finalhandler = require('finalhandler'),
      serveStatic = require('serve-static'),
      path = require('path'),
      fs = require('fs'),
      minimist = require('minimist'),
      protocolUtils = require('./src/protocol.utils')

const webInspectorUIPath = path.join(__dirname, 'lib', 'WebInspectorUI', 'latest'),
      protocolVersions = protocolUtils.listAvailableVersions(webInspectorUIPath),
      latestProtocolPath = protocolUtils.versionPath(webInspectorUIPath, protocolVersions[protocolVersions.length - 1]),
      serve = serveStatic(webInspectorUIPath)

var port = 8080,
    protocol = protocolVersions[protocolVersions.length - 1],
    argv = minimist(process.argv.slice(2), { string: ['P'] })

if (argv["_"].length > 0) port = argv["_"][0]
if (argv["P"]) protocol = argv["P"]

if (protocolVersions.indexOf(protocol) === -1) {
  console.error("Can't find protocol: " + protocol + ". Available protocols: ", protocolVersions)
  process.exit(1)
}

const protocolPath = protocolUtils.versionPath(webInspectorUIPath, protocol)
const server = http.createServer(function(req, res) {
  var done = finalhandler(req, res)

  if (req.url === '/Protocol/InspectorBackendCommands.js') {
    fs.readFile(path.join(protocolPath, 'InspectorBackendCommands.js'), function(err, buf) {
      if (err) return done(err)
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8')
      res.end(buf)
    })
  } else {
    serve(req, res, done)
  }
})
console.log("Starting WebInspectorUI at http://localhost:" + port + ", selected protocol: iOS/" + protocol)
server.listen(port)
