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

WebInspector.Script = (function (_WebInspector$SourceCode) {
    _inherits(Script, _WebInspector$SourceCode);

    function Script(id, range, url, injected, sourceMapURL) {
        _classCallCheck(this, Script);

        _get(Object.getPrototypeOf(Script.prototype), "constructor", this).call(this);

        console.assert(id);
        console.assert(range instanceof WebInspector.TextRange);

        this._id = id || null;
        this._range = range || null;
        this._url = url || null;
        this._injected = injected || false;

        this._resource = this._resolveResource();
        if (this._resource) this._resource.associateWithScript(this);

        if (sourceMapURL) WebInspector.sourceMapManager.downloadSourceMap(sourceMapURL, this._url, this);

        this._scriptSyntaxTree = null;
    }

    // Static

    _createClass(Script, [{
        key: "requestContentFromBackend",
        value: function requestContentFromBackend() {
            if (!this._id) {
                // There is no identifier to request content with. Return false to cause the
                // pending callbacks to get null content.
                return Promise.reject(new Error("There is no identifier to request content with."));
            }

            return DebuggerAgent.getScriptSource(this._id);
        }
    }, {
        key: "saveIdentityToCookie",
        value: function saveIdentityToCookie(cookie) {
            cookie[WebInspector.Script.URLCookieKey] = this.url;
            cookie[WebInspector.Script.DisplayNameCookieKey] = this.displayName;
        }
    }, {
        key: "requestScriptSyntaxTree",
        value: function requestScriptSyntaxTree(callback) {
            if (this._scriptSyntaxTree) {
                setTimeout((function () {
                    callback(this._scriptSyntaxTree);
                }).bind(this), 0);
                return;
            }

            var makeSyntaxTreeAndCallCallback = (function (content) {
                this._makeSyntaxTree(content);
                callback(this._scriptSyntaxTree);
            }).bind(this);

            var content = this.content;
            if (!content && this._resource && this._resource.type === WebInspector.Resource.Type.Script && this._resource.finished) content = this._resource.content;
            if (content) {
                setTimeout(makeSyntaxTreeAndCallCallback, 0, content);
                return;
            }

            this.requestContent().then(function (parameters) {
                makeSyntaxTreeAndCallCallback(parameters.sourceCode.content);
            })["catch"](function (error) {
                makeSyntaxTreeAndCallCallback(null);
            });
        }

        // Private

    }, {
        key: "_resolveResource",
        value: function _resolveResource() {
            // FIXME: We should be able to associate a Script with a Resource through identifiers,
            // we shouldn't need to lookup by URL, which is not safe with frames, where there might
            // be multiple resources with the same URL.
            // <rdar://problem/13373951> Scripts should be able to associate directly with a Resource

            // No URL, no resource.
            if (!this._url) return null;

            try {
                // Try with the Script's full URL.
                var resource = WebInspector.frameResourceManager.resourceForURL(this.url);
                if (resource) return resource;

                // Try with the Script's full decoded URL.
                var decodedURL = decodeURI(this._url);
                if (decodedURL !== this._url) {
                    resource = WebInspector.frameResourceManager.resourceForURL(decodedURL);
                    if (resource) return resource;
                }

                // Next try removing any fragment in the original URL.
                var urlWithoutFragment = removeURLFragment(this._url);
                if (urlWithoutFragment !== this._url) {
                    resource = WebInspector.frameResourceManager.resourceForURL(urlWithoutFragment);
                    if (resource) return resource;
                }

                // Finally try removing any fragment in the decoded URL.
                var decodedURLWithoutFragment = removeURLFragment(decodedURL);
                if (decodedURLWithoutFragment !== decodedURL) {
                    resource = WebInspector.frameResourceManager.resourceForURL(decodedURLWithoutFragment);
                    if (resource) return resource;
                }
            } catch (e) {
                // Ignore possible URIErrors.
            }

            return null;
        }
    }, {
        key: "_makeSyntaxTree",
        value: function _makeSyntaxTree(sourceText) {
            if (this._scriptSyntaxTree || !sourceText) return;

            this._scriptSyntaxTree = new WebInspector.ScriptSyntaxTree(sourceText, this);
        }
    }, {
        key: "id",

        // Public

        get: function get() {
            return this._id;
        }
    }, {
        key: "range",
        get: function get() {
            return this._range;
        }
    }, {
        key: "url",
        get: function get() {
            return this._url;
        }
    }, {
        key: "urlComponents",
        get: function get() {
            if (!this._urlComponents) this._urlComponents = parseURL(this._url);
            return this._urlComponents;
        }
    }, {
        key: "mimeType",
        get: function get() {
            return this._resource.mimeType;
        }
    }, {
        key: "displayName",
        get: function get() {
            if (this._url) return WebInspector.displayNameForURL(this._url, this.urlComponents);

            // Assign a unique number to the script object so it will stay the same.
            if (!this._uniqueDisplayNameNumber) this._uniqueDisplayNameNumber = this.constructor._nextUniqueDisplayNameNumber++;

            return WebInspector.UIString("Anonymous Script %d").format(this._uniqueDisplayNameNumber);
        }
    }, {
        key: "injected",
        get: function get() {
            return this._injected;
        }
    }, {
        key: "resource",
        get: function get() {
            return this._resource;
        }
    }, {
        key: "scriptSyntaxTree",
        get: function get() {
            return this._scriptSyntaxTree;
        }
    }], [{
        key: "resetUniqueDisplayNameNumbers",
        value: function resetUniqueDisplayNameNumbers() {
            WebInspector.Script._nextUniqueDisplayNameNumber = 1;
        }
    }]);

    return Script;
})(WebInspector.SourceCode);

WebInspector.Script.TypeIdentifier = "script";
WebInspector.Script.URLCookieKey = "script-url";
WebInspector.Script.DisplayNameCookieKey = "script-display-name";

WebInspector.Script._nextUniqueDisplayNameNumber = 1;
