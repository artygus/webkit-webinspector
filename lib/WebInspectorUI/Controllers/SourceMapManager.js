var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2013 Apple Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. AND ITS CONTRIBUTORS ``AS IS''
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL APPLE INC. OR ITS CONTRIBUTORS
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 */

WebInspector.SourceMapManager = (function (_WebInspector$Object) {
    _inherits(SourceMapManager, _WebInspector$Object);

    function SourceMapManager() {
        _classCallCheck(this, SourceMapManager);

        _get(Object.getPrototypeOf(SourceMapManager.prototype), "constructor", this).call(this);

        this._sourceMapURLMap = {};
        this._downloadingSourceMaps = {};

        WebInspector.Frame.addEventListener(WebInspector.Frame.Event.MainResourceDidChange, this._mainResourceDidChange, this);
    }

    // Public

    _createClass(SourceMapManager, [{
        key: "sourceMapForURL",
        value: function sourceMapForURL(sourceMapURL) {
            return this._sourceMapURLMap[sourceMapURL];
        }
    }, {
        key: "downloadSourceMap",
        value: function downloadSourceMap(sourceMapURL, baseURL, originalSourceCode) {
            sourceMapURL = absoluteURL(sourceMapURL, baseURL);
            if (!sourceMapURL) return;

            console.assert(originalSourceCode.url);
            if (!originalSourceCode.url) return;

            // FIXME: <rdar://problem/13265694> Source Maps: Better handle when multiple resources reference the same SourceMap

            if (sourceMapURL in this._sourceMapURLMap) return;

            if (sourceMapURL in this._downloadingSourceMaps) return;

            function loadAndParseSourceMap() {
                this._loadAndParseSourceMap(sourceMapURL, baseURL, originalSourceCode);
            }

            if (!WebInspector.frameResourceManager.mainFrame) {
                // If we don't have a main frame, then we are likely in the middle of building the resource tree.
                // Delaying until the next runloop is enough in this case to then start loading the source map.
                setTimeout(loadAndParseSourceMap.bind(this), 0);
                return;
            }

            loadAndParseSourceMap.call(this);
        }

        // Private

    }, {
        key: "_loadAndParseSourceMap",
        value: function _loadAndParseSourceMap(sourceMapURL, baseURL, originalSourceCode) {
            this._downloadingSourceMaps[sourceMapURL] = true;

            function sourceMapLoaded(error, content, mimeType, statusCode) {
                if (error || statusCode >= 400) {
                    this._loadAndParseFailed(sourceMapURL);
                    return;
                }

                if (content.slice(0, 3) === ")]}") {
                    var firstNewlineIndex = content.indexOf("\n");
                    if (firstNewlineIndex === -1) {
                        this._loadAndParseFailed(sourceMapURL);
                        return;
                    }

                    content = content.substring(firstNewlineIndex);
                }

                try {
                    var payload = JSON.parse(content);
                    var baseURL = sourceMapURL.startsWith("data:") ? originalSourceCode.url : sourceMapURL;
                    var sourceMap = new WebInspector.SourceMap(baseURL, payload, originalSourceCode);
                    this._loadAndParseSucceeded(sourceMapURL, sourceMap);
                } catch (e) {
                    this._loadAndParseFailed(sourceMapURL);
                }
            }

            var frameIdentifier = null;
            if (originalSourceCode instanceof WebInspector.Resource && originalSourceCode.parentFrame) frameIdentifier = originalSourceCode.parentFrame.id;

            if (!frameIdentifier) frameIdentifier = WebInspector.frameResourceManager.mainFrame.id;

            // COMPATIBILITY (iOS 7): Network.loadResource did not exist.
            if (!NetworkAgent.loadResource) {
                this._loadAndParseFailed(sourceMapURL);
                return;
            }

            NetworkAgent.loadResource(frameIdentifier, sourceMapURL, sourceMapLoaded.bind(this));
        }
    }, {
        key: "_loadAndParseFailed",
        value: function _loadAndParseFailed(sourceMapURL) {
            delete this._downloadingSourceMaps[sourceMapURL];
        }
    }, {
        key: "_loadAndParseSucceeded",
        value: function _loadAndParseSucceeded(sourceMapURL, sourceMap) {
            if (!(sourceMapURL in this._downloadingSourceMaps)) return;

            delete this._downloadingSourceMaps[sourceMapURL];

            this._sourceMapURLMap[sourceMapURL] = sourceMap;

            var sources = sourceMap.sources();
            for (var i = 0; i < sources.length; ++i) {
                var sourceMapResource = new WebInspector.SourceMapResource(sources[i], sourceMap);
                sourceMap.addResource(sourceMapResource);
            }

            // Associate the SourceMap with the originalSourceCode.
            sourceMap.originalSourceCode.addSourceMap(sourceMap);

            // If the originalSourceCode was not a Resource, be sure to also associate with the Resource if one exists.
            // FIXME: We should try to use the right frame instead of a global lookup by URL.
            if (!(sourceMap.originalSourceCode instanceof WebInspector.Resource)) {
                console.assert(sourceMap.originalSourceCode instanceof WebInspector.Script);
                var resource = sourceMap.originalSourceCode.resource;
                if (resource) resource.addSourceMap(sourceMap);
            }
        }
    }, {
        key: "_mainResourceDidChange",
        value: function _mainResourceDidChange(event) {
            if (!event.target.isMainFrame()) return;

            this._sourceMapURLMap = {};
            this._downloadingSourceMaps = {};
        }
    }]);

    return SourceMapManager;
})(WebInspector.Object);
