var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2013, 2015 Apple Inc. All rights reserved.
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

WebInspector.StorageSidebarPanel = (function (_WebInspector$NavigationSidebarPanel) {
    _inherits(StorageSidebarPanel, _WebInspector$NavigationSidebarPanel);

    function StorageSidebarPanel(contentBrowser) {
        _classCallCheck(this, StorageSidebarPanel);

        _get(Object.getPrototypeOf(StorageSidebarPanel.prototype), "constructor", this).call(this, "storage", WebInspector.UIString("Storage"));

        this.contentBrowser = contentBrowser;

        this.filterBar.placeholder = WebInspector.UIString("Filter Storage List");

        this._navigationBar = new WebInspector.NavigationBar();
        this.element.appendChild(this._navigationBar.element);

        var scopeItemPrefix = "storage-sidebar-";
        var scopeBarItems = [];

        scopeBarItems.push(new WebInspector.ScopeBarItem(scopeItemPrefix + "type-all", WebInspector.UIString("All Storage"), true));

        var storageTypes = [{ identifier: "application-cache", title: WebInspector.UIString("Application Cache"), classes: [WebInspector.ApplicationCacheFrameTreeElement, WebInspector.ApplicationCacheManifestTreeElement] }, { identifier: "cookies", title: WebInspector.UIString("Cookies"), classes: [WebInspector.CookieStorageTreeElement] }, { identifier: "database", title: WebInspector.UIString("Databases"), classes: [WebInspector.DatabaseHostTreeElement, WebInspector.DatabaseTableTreeElement, WebInspector.DatabaseTreeElement] }, { identifier: "indexed-database", title: WebInspector.UIString("Indexed Databases"), classes: [WebInspector.IndexedDatabaseHostTreeElement, WebInspector.IndexedDatabaseObjectStoreTreeElement, WebInspector.IndexedDatabaseTreeElement] }, { identifier: "local-storage", title: WebInspector.UIString("Local Storage"), classes: [WebInspector.DOMStorageTreeElement], localStorage: true }, { identifier: "session-storage", title: WebInspector.UIString("Session Storage"), classes: [WebInspector.DOMStorageTreeElement], localStorage: false }];

        storageTypes.sort(function (a, b) {
            return a.title.localeCompare(b.title);
        });

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = storageTypes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var info = _step.value;

                var scopeBarItem = new WebInspector.ScopeBarItem(scopeItemPrefix + info.identifier, info.title);
                scopeBarItem.__storageTypeInfo = info;
                scopeBarItems.push(scopeBarItem);
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

        this._scopeBar = new WebInspector.ScopeBar("storage-sidebar-scope-bar", scopeBarItems, scopeBarItems[0], true);
        this._scopeBar.addEventListener(WebInspector.ScopeBar.Event.SelectionChanged, this._scopeBarSelectionDidChange, this);

        this._navigationBar.addNavigationItem(this._scopeBar);

        this._localStorageRootTreeElement = null;
        this._sessionStorageRootTreeElement = null;

        this._databaseRootTreeElement = null;
        this._databaseHostTreeElementMap = {};

        this._indexedDatabaseRootTreeElement = null;
        this._indexedDatabaseHostTreeElementMap = {};

        this._cookieStorageRootTreeElement = null;

        this._applicationCacheRootTreeElement = null;
        this._applicationCacheURLTreeElementMap = {};

        WebInspector.storageManager.addEventListener(WebInspector.StorageManager.Event.CookieStorageObjectWasAdded, this._cookieStorageObjectWasAdded, this);
        WebInspector.storageManager.addEventListener(WebInspector.StorageManager.Event.DOMStorageObjectWasAdded, this._domStorageObjectWasAdded, this);
        WebInspector.storageManager.addEventListener(WebInspector.StorageManager.Event.DOMStorageObjectWasInspected, this._domStorageObjectWasInspected, this);
        WebInspector.storageManager.addEventListener(WebInspector.StorageManager.Event.DatabaseWasAdded, this._databaseWasAdded, this);
        WebInspector.storageManager.addEventListener(WebInspector.StorageManager.Event.DatabaseWasInspected, this._databaseWasInspected, this);
        WebInspector.storageManager.addEventListener(WebInspector.StorageManager.Event.IndexedDatabaseWasAdded, this._indexedDatabaseWasAdded, this);
        WebInspector.storageManager.addEventListener(WebInspector.StorageManager.Event.Cleared, this._storageCleared, this);

        WebInspector.applicationCacheManager.addEventListener(WebInspector.ApplicationCacheManager.Event.FrameManifestAdded, this._frameManifestAdded, this);
        WebInspector.applicationCacheManager.addEventListener(WebInspector.ApplicationCacheManager.Event.FrameManifestRemoved, this._frameManifestRemoved, this);

        this.contentTreeOutline.onselect = this._treeElementSelected.bind(this);

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = WebInspector.storageManager.domStorageObjects[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var domStorageObject = _step2.value;

                this._addDOMStorageObject(domStorageObject);
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

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = WebInspector.storageManager.cookieStorageObjects[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var cookieStorageObject = _step3.value;

                this._addCookieStorageObject(cookieStorageObject);
            }
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                    _iterator3["return"]();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
            }
        }

        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = WebInspector.storageManager.databases[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var database = _step4.value;

                this._addDatabase(database);
            }
        } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
                    _iterator4["return"]();
                }
            } finally {
                if (_didIteratorError4) {
                    throw _iteratorError4;
                }
            }
        }

        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
            for (var _iterator5 = WebInspector.storageManager.indexedDatabases[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var indexedDatabase = _step5.value;

                this._addIndexedDatabase(indexedDatabase);
            }
        } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
                    _iterator5["return"]();
                }
            } finally {
                if (_didIteratorError5) {
                    throw _iteratorError5;
                }
            }
        }

        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
            for (var _iterator6 = WebInspector.applicationCacheManager.applicationCacheObjects[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                var applicationCacheObject = _step6.value;

                this._addFrameManifest(applicationCacheObject);
            }
        } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion6 && _iterator6["return"]) {
                    _iterator6["return"]();
                }
            } finally {
                if (_didIteratorError6) {
                    throw _iteratorError6;
                }
            }
        }
    }

    // Public

    _createClass(StorageSidebarPanel, [{
        key: "showDefaultContentView",
        value: function showDefaultContentView() {
            // Don't show anything by default. It doesn't make a whole lot of sense here.
        }
    }, {
        key: "closed",
        value: function closed() {
            _get(Object.getPrototypeOf(StorageSidebarPanel.prototype), "closed", this).call(this);

            WebInspector.storageManager.removeEventListener(null, null, this);
            WebInspector.applicationCacheManager.removeEventListener(null, null, this);
        }

        // Protected

    }, {
        key: "hasCustomFilters",
        value: function hasCustomFilters() {
            console.assert(this._scopeBar.selectedItems.length === 1);
            var selectedScopeBarItem = this._scopeBar.selectedItems[0];
            return selectedScopeBarItem && !selectedScopeBarItem.exclusive;
        }
    }, {
        key: "matchTreeElementAgainstCustomFilters",
        value: function matchTreeElementAgainstCustomFilters(treeElement, flags) {
            console.assert(this._scopeBar.selectedItems.length === 1);
            var selectedScopeBarItem = this._scopeBar.selectedItems[0];

            // Show everything if there is no selection or "All Storage" is selected (the exclusive item).
            if (!selectedScopeBarItem || selectedScopeBarItem.exclusive) return true;

            // Folders are hidden on the first pass, but visible childen under the folder will force the folder visible again.
            if (treeElement instanceof WebInspector.FolderTreeElement) return false;

            function match() {
                var _iteratorNormalCompletion7 = true;
                var _didIteratorError7 = false;
                var _iteratorError7 = undefined;

                try {
                    for (var _iterator7 = selectedScopeBarItem.__storageTypeInfo.classes[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                        var constructor = _step7.value;

                        if (constructor === WebInspector.DOMStorageTreeElement && treeElement instanceof constructor) return treeElement.representedObject.isLocalStorage() === selectedScopeBarItem.__storageTypeInfo.localStorage;
                        if (treeElement instanceof constructor) return true;
                    }
                } catch (err) {
                    _didIteratorError7 = true;
                    _iteratorError7 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion7 && _iterator7["return"]) {
                            _iterator7["return"]();
                        }
                    } finally {
                        if (_didIteratorError7) {
                            throw _iteratorError7;
                        }
                    }
                }

                return false;
            }

            var matched = match();
            if (matched) flags.expandTreeElement = true;
            return matched;
        }

        // Private

    }, {
        key: "_treeElementSelected",
        value: function _treeElementSelected(treeElement, selectedByUser) {
            if (treeElement instanceof WebInspector.FolderTreeElement || treeElement instanceof WebInspector.DatabaseHostTreeElement || treeElement instanceof WebInspector.IndexedDatabaseHostTreeElement || treeElement instanceof WebInspector.IndexedDatabaseTreeElement || treeElement instanceof WebInspector.ApplicationCacheManifestTreeElement) return;

            if (treeElement instanceof WebInspector.StorageTreeElement || treeElement instanceof WebInspector.DatabaseTableTreeElement || treeElement instanceof WebInspector.DatabaseTreeElement || treeElement instanceof WebInspector.ApplicationCacheFrameTreeElement || treeElement instanceof WebInspector.IndexedDatabaseObjectStoreTreeElement || treeElement instanceof WebInspector.IndexedDatabaseObjectStoreIndexTreeElement) {
                WebInspector.showRepresentedObject(treeElement.representedObject);
                return;
            }

            console.error("Unknown tree element", treeElement);
        }
    }, {
        key: "_domStorageObjectWasAdded",
        value: function _domStorageObjectWasAdded(event) {
            var domStorage = event.data.domStorage;
            this._addDOMStorageObject(event.data.domStorage);
        }
    }, {
        key: "_addDOMStorageObject",
        value: function _addDOMStorageObject(domStorage) {
            var storageElement = new WebInspector.DOMStorageTreeElement(domStorage);

            if (domStorage.isLocalStorage()) this._localStorageRootTreeElement = this._addStorageChild(storageElement, this._localStorageRootTreeElement, WebInspector.UIString("Local Storage"));else this._sessionStorageRootTreeElement = this._addStorageChild(storageElement, this._sessionStorageRootTreeElement, WebInspector.UIString("Session Storage"));
        }
    }, {
        key: "_domStorageObjectWasInspected",
        value: function _domStorageObjectWasInspected(event) {
            var domStorage = event.data.domStorage;
            var treeElement = this.treeElementForRepresentedObject(domStorage);
            treeElement.revealAndSelect(true);
        }
    }, {
        key: "_databaseWasAdded",
        value: function _databaseWasAdded(event) {
            var database = event.data.database;
            this._addDatabase(event.data.database);
        }
    }, {
        key: "_addDatabase",
        value: function _addDatabase(database) {
            console.assert(database instanceof WebInspector.DatabaseObject);

            if (!this._databaseHostTreeElementMap[database.host]) {
                this._databaseHostTreeElementMap[database.host] = new WebInspector.DatabaseHostTreeElement(database.host);
                this._databaseRootTreeElement = this._addStorageChild(this._databaseHostTreeElementMap[database.host], this._databaseRootTreeElement, WebInspector.UIString("Databases"));
            }

            var databaseElement = new WebInspector.DatabaseTreeElement(database);
            this._databaseHostTreeElementMap[database.host].appendChild(databaseElement);
        }
    }, {
        key: "_databaseWasInspected",
        value: function _databaseWasInspected(event) {
            var database = event.data.database;
            var treeElement = this.treeElementForRepresentedObject(database);
            treeElement.revealAndSelect(true);
        }
    }, {
        key: "_indexedDatabaseWasAdded",
        value: function _indexedDatabaseWasAdded(event) {
            this._addIndexedDatabase(event.data.indexedDatabase);
        }
    }, {
        key: "_addIndexedDatabase",
        value: function _addIndexedDatabase(indexedDatabase) {
            console.assert(indexedDatabase instanceof WebInspector.IndexedDatabase);

            if (!this._indexedDatabaseHostTreeElementMap[indexedDatabase.host]) {
                this._indexedDatabaseHostTreeElementMap[indexedDatabase.host] = new WebInspector.IndexedDatabaseHostTreeElement(indexedDatabase.host);
                this._indexedDatabaseRootTreeElement = this._addStorageChild(this._indexedDatabaseHostTreeElementMap[indexedDatabase.host], this._indexedDatabaseRootTreeElement, WebInspector.UIString("Indexed Databases"));
            }

            var indexedDatabaseElement = new WebInspector.IndexedDatabaseTreeElement(indexedDatabase);
            this._indexedDatabaseHostTreeElementMap[indexedDatabase.host].appendChild(indexedDatabaseElement);
        }
    }, {
        key: "_cookieStorageObjectWasAdded",
        value: function _cookieStorageObjectWasAdded(event) {
            this._addCookieStorageObject(event.data.cookieStorage);
        }
    }, {
        key: "_addCookieStorageObject",
        value: function _addCookieStorageObject(cookieStorage) {
            console.assert(cookieStorage instanceof WebInspector.CookieStorageObject);

            var cookieElement = new WebInspector.CookieStorageTreeElement(cookieStorage);
            this._cookieStorageRootTreeElement = this._addStorageChild(cookieElement, this._cookieStorageRootTreeElement, WebInspector.UIString("Cookies"));
        }
    }, {
        key: "_frameManifestAdded",
        value: function _frameManifestAdded(event) {
            this._addFrameManifest(event.data.frameManifest);
        }
    }, {
        key: "_addFrameManifest",
        value: function _addFrameManifest(frameManifest) {
            console.assert(frameManifest instanceof WebInspector.ApplicationCacheFrame);

            var manifest = frameManifest.manifest;
            var manifestURL = manifest.manifestURL;
            if (!this._applicationCacheURLTreeElementMap[manifestURL]) {
                this._applicationCacheURLTreeElementMap[manifestURL] = new WebInspector.ApplicationCacheManifestTreeElement(manifest);
                this._applicationCacheRootTreeElement = this._addStorageChild(this._applicationCacheURLTreeElementMap[manifestURL], this._applicationCacheRootTreeElement, WebInspector.UIString("Application Cache"));
            }

            var frameCacheElement = new WebInspector.ApplicationCacheFrameTreeElement(frameManifest);
            this._applicationCacheURLTreeElementMap[manifestURL].appendChild(frameCacheElement);
        }
    }, {
        key: "_frameManifestRemoved",
        value: function _frameManifestRemoved(event) {
            // FIXME: Implement this.
        }
    }, {
        key: "_compareTreeElements",
        value: function _compareTreeElements(a, b) {
            console.assert(a.mainTitle);
            console.assert(b.mainTitle);

            return (a.mainTitle || "").localeCompare(b.mainTitle || "");
        }
    }, {
        key: "_addStorageChild",
        value: function _addStorageChild(childElement, parentElement, folderName) {
            if (!parentElement) {
                childElement.flattened = true;

                this.contentTreeOutline.insertChild(childElement, insertionIndexForObjectInListSortedByFunction(childElement, this.contentTreeOutline.children, this._compareTreeElements));

                return childElement;
            }

            if (parentElement instanceof WebInspector.StorageTreeElement) {
                console.assert(parentElement.flattened);

                var previousOnlyChild = parentElement;
                previousOnlyChild.flattened = false;
                this.contentTreeOutline.removeChild(previousOnlyChild);

                var folderElement = new WebInspector.FolderTreeElement(folderName);
                this.contentTreeOutline.insertChild(folderElement, insertionIndexForObjectInListSortedByFunction(folderElement, this.contentTreeOutline.children, this._compareTreeElements));

                folderElement.appendChild(previousOnlyChild);
                folderElement.insertChild(childElement, insertionIndexForObjectInListSortedByFunction(childElement, folderElement.children, this._compareTreeElements));

                return folderElement;
            }

            console.assert(parentElement instanceof WebInspector.FolderTreeElement);
            parentElement.insertChild(childElement, insertionIndexForObjectInListSortedByFunction(childElement, parentElement.children, this._compareTreeElements));

            return parentElement;
        }
    }, {
        key: "_storageCleared",
        value: function _storageCleared(event) {
            // Close all DOM and cookie storage content views since the main frame has navigated and all storages are cleared.
            this.contentBrowser.contentViewContainer.closeAllContentViewsOfPrototype(WebInspector.CookieStorageContentView);
            this.contentBrowser.contentViewContainer.closeAllContentViewsOfPrototype(WebInspector.DOMStorageContentView);
            this.contentBrowser.contentViewContainer.closeAllContentViewsOfPrototype(WebInspector.DatabaseTableContentView);
            this.contentBrowser.contentViewContainer.closeAllContentViewsOfPrototype(WebInspector.DatabaseContentView);
            this.contentBrowser.contentViewContainer.closeAllContentViewsOfPrototype(WebInspector.ApplicationCacheFrameContentView);

            if (this._localStorageRootTreeElement && this._localStorageRootTreeElement.parent) this._localStorageRootTreeElement.parent.removeChild(this._localStorageRootTreeElement);

            if (this._sessionStorageRootTreeElement && this._sessionStorageRootTreeElement.parent) this._sessionStorageRootTreeElement.parent.removeChild(this._sessionStorageRootTreeElement);

            if (this._databaseRootTreeElement && this._databaseRootTreeElement.parent) this._databaseRootTreeElement.parent.removeChild(this._databaseRootTreeElement);

            if (this._indexedDatabaseRootTreeElement && this._indexedDatabaseRootTreeElement.parent) this._indexedDatabaseRootTreeElement.parent.removeChild(this._indexedDatabaseRootTreeElement);

            if (this._cookieStorageRootTreeElement && this._cookieStorageRootTreeElement.parent) this._cookieStorageRootTreeElement.parent.removeChild(this._cookieStorageRootTreeElement);

            if (this._applicationCacheRootTreeElement && this._applicationCacheRootTreeElement.parent) this._applicationCacheRootTreeElement.parent.removeChild(this._applicationCacheRootTreeElement);

            this._localStorageRootTreeElement = null;
            this._sessionStorageRootTreeElement = null;
            this._databaseRootTreeElement = null;
            this._databaseHostTreeElementMap = {};
            this._indexedDatabaseRootTreeElement = null;
            this._indexedDatabaseHostTreeElementMap = {};
            this._cookieStorageRootTreeElement = null;
            this._applicationCacheRootTreeElement = null;
            this._applicationCacheURLTreeElementMap = {};
        }
    }, {
        key: "_scopeBarSelectionDidChange",
        value: function _scopeBarSelectionDidChange(event) {
            this.updateFilter();
        }
    }]);

    return StorageSidebarPanel;
})(WebInspector.NavigationSidebarPanel);
