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

WebInspector.IndexedDatabaseTreeElement = function (indexedDatabase) {
    console.assert(indexedDatabase instanceof WebInspector.IndexedDatabase);

    this._indexedDatabase = indexedDatabase;

    WebInspector.GeneralTreeElement.call(this, WebInspector.IndexedDatabaseTreeElement.IconStyleClassName, indexedDatabase.name, null, indexedDatabase, !!this._indexedDatabase.objectStores.length);

    this.small = true;
};

WebInspector.IndexedDatabaseTreeElement.IconStyleClassName = "database-icon";

WebInspector.IndexedDatabaseTreeElement.prototype = Object.defineProperties({
    constructor: WebInspector.IndexedDatabaseTreeElement,

    // Overrides from TreeElement (Protected)

    oncollapse: function oncollapse() {
        this.shouldRefreshChildren = true;
    },

    onpopulate: function onpopulate() {
        if (this.children.length && !this.shouldRefreshChildren) return;

        this.shouldRefreshChildren = false;

        this.removeChildren();

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = this._indexedDatabase.objectStores[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var objectStore = _step.value;

                this.appendChild(new WebInspector.IndexedDatabaseObjectStoreTreeElement(objectStore));
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
    }
}, {
    indexedDatabase: { // Public

        get: function get() {
            return this._indexedDatabase;
        },
        configurable: true,
        enumerable: true
    }
});

WebInspector.IndexedDatabaseTreeElement.prototype.__proto__ = WebInspector.GeneralTreeElement.prototype;
