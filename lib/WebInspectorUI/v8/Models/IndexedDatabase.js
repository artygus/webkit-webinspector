/*
 * Copyright (C) 2014 Apple Inc. All rights reserved.
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

WebInspector.IndexedDatabase = function (name, securityOrigin, version, objectStores) {
    WebInspector.Object.call(this);

    this._name = name;
    this._securityOrigin = securityOrigin;
    this._host = parseSecurityOrigin(securityOrigin).host;
    this._version = version;
    this._objectStores = objectStores || [];

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = this._objectStores[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var objectStore = _step.value;

            objectStore.establishRelationship(this);
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
                _iterator["return"]();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
};

WebInspector.IndexedDatabase.TypeIdentifier = "indexed-database";
WebInspector.IndexedDatabase.NameCookieKey = "indexed-database-name";
WebInspector.IndexedDatabase.HostCookieKey = "indexed-database-host";

WebInspector.IndexedDatabase.prototype = Object.defineProperties({
    constructor: WebInspector.IndexedDatabase,
    __proto__: WebInspector.Object.prototype,

    saveIdentityToCookie: function saveIdentityToCookie(cookie) {
        cookie[WebInspector.IndexedDatabase.NameCookieKey] = this._name;
        cookie[WebInspector.IndexedDatabase.HostCookieKey] = this._host;
    }
}, {
    name: { // Public

        get: function get() {
            return this._name;
        },
        configurable: true,
        enumerable: true
    },
    securityOrigin: {
        get: function get() {
            return this._securityOrigin;
        },
        configurable: true,
        enumerable: true
    },
    host: {
        get: function get() {
            return this._host;
        },
        configurable: true,
        enumerable: true
    },
    version: {
        get: function get() {
            return this._version;
        },
        configurable: true,
        enumerable: true
    },
    objectStores: {
        get: function get() {
            return this._objectStores;
        },
        configurable: true,
        enumerable: true
    }
});
