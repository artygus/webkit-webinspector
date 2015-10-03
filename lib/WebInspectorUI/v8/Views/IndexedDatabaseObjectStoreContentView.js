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

WebInspector.IndexedDatabaseObjectStoreContentView = function (objectStoreOrIndex) {
    WebInspector.ContentView.call(this, objectStoreOrIndex);

    this.element.classList.add(WebInspector.IndexedDatabaseObjectStoreContentView.StyleClassName);

    if (objectStoreOrIndex instanceof WebInspector.IndexedDatabaseObjectStore) {
        this._objectStore = objectStoreOrIndex;
        this._objectStoreIndex = null;
    } else if (objectStoreOrIndex instanceof WebInspector.IndexedDatabaseObjectStoreIndex) {
        this._objectStore = objectStoreOrIndex.parentObjectStore;
        this._objectStoreIndex = objectStoreOrIndex;
    }

    function displayKeyPath(keyPath) {
        if (!keyPath) return "";
        if (keyPath instanceof Array) return keyPath.join(WebInspector.UIString(", "));
        console.assert(keyPath instanceof String || typeof keyPath === "string");
        return keyPath;
    }

    var displayPrimaryKeyPath = displayKeyPath(this._objectStore.keyPath);

    var columnInfo = {
        primaryKey: { title: displayPrimaryKeyPath ? WebInspector.UIString("Primary Key — %s").format(displayPrimaryKeyPath) : WebInspector.UIString("Primary Key") },
        key: {},
        value: { title: WebInspector.UIString("Value") }
    };

    if (this._objectStoreIndex) {
        // When there is an index, show the key path in the Key column.
        var displayIndexKeyPath = displayKeyPath(this._objectStoreIndex.keyPath);
        columnInfo.key.title = WebInspector.UIString("Index Key — %s").format(displayIndexKeyPath);
    } else {
        // Only need to show Key for indexes -- it is the same as Primary Key
        // when there is no index being used.
        delete columnInfo.key;
    }

    this._dataGrid = new WebInspector.DataGrid(columnInfo);
    this.element.appendChild(this._dataGrid.element);

    this._dataGrid.scrollContainer.addEventListener("scroll", this._dataGridScrolled.bind(this));

    this._entries = [];

    this._fetchMoreData();
};

WebInspector.IndexedDatabaseObjectStoreContentView.StyleClassName = "indexed-database-object-store";

WebInspector.IndexedDatabaseObjectStoreContentView.prototype = {
    constructor: WebInspector.IndexedDatabaseObjectStoreContentView,
    __proto__: WebInspector.ContentView.prototype,

    // Public

    closed: function closed() {
        this._reset();
    },

    saveToCookie: function saveToCookie(cookie) {
        cookie.type = WebInspector.ContentViewCookieType.IndexedDatabaseObjectStore;
        cookie.securityOrigin = this._objectStore.parentDatabase.securityOrigin;
        cookie.databaseName = this._objectStore.parentDatabase.name;
        cookie.objectStoreName = this._objectStore.name;
        cookie.objectStoreIndexName = this._objectStoreIndex && this._objectStoreIndex.name;
    },

    updateLayout: function updateLayout() {
        this._dataGrid.updateLayout();
    },

    // Private

    _reset: function _reset() {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = this._entries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var entry = _step.value;

                entry.primaryKey.release();
                entry.key.release();
                entry.value.release();
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

        this._entries = [];
        this._dataGrid.removeChildren();
    },

    _dataGridScrolled: function _dataGridScrolled() {
        if (!this._moreEntriesAvailable || !this._dataGrid.isScrolledToLastRow()) return;

        this._fetchMoreData();
    },

    _fetchMoreData: function _fetchMoreData() {
        if (this._fetchingMoreData) return;

        function processEntries(entries, moreAvailable) {
            this._entries = this._entries.concat(entries);
            this._moreEntriesAvailable = moreAvailable;

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = entries[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var entry = _step2.value;

                    var dataGridNode = new WebInspector.IndexedDatabaseEntryDataGridNode(entry);
                    this._dataGrid.appendChild(dataGridNode);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                        _iterator2["return"]();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            delete this._fetchingMoreData;

            if (moreAvailable && this._dataGrid.isScrolledToLastRow()) this._fetchMoreData();
        }

        this._fetchingMoreData = true;

        WebInspector.storageManager.requestIndexedDatabaseData(this._objectStore, this._objectStoreIndex, this._entries.length, 25, processEntries.bind(this));
    }
};
