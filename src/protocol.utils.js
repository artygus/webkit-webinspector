const path = require('path'),
      readdirSync = require('fs').readdirSync,
      semverCoerce = require('semver/functions/coerce'),
      semverCompare = require('semver/functions/compare');

const scanProtocolDirs = function(webInspectorUIPath) {
  const protocolsDir = path.join(webInspectorUIPath, 'Protocol', 'Legacy', 'iOS')
  return readdirSync(protocolsDir, { withFileTypes: true })
           .filter(dirent => dirent.isDirectory())
           .map(dirent => dirent.name)
}

const listAvailableVersions = function(webInspectorUIPath) {
  protocolDirs = scanProtocolDirs(webInspectorUIPath)
  return protocolDirs.sort(function(a, b) {
    const aVer = semverCoerce(a),
          bVer = semverCoerce(b)
    return semverCompare(aVer, bVer);
  })
}

const versionPath = function(webInspectorUIPath, protocolVersion) {
  return path.join(webInspectorUIPath, 'Protocol', 'Legacy', 'iOS', protocolVersion);
}

module.exports = {
  listAvailableVersions,
  versionPath
}
