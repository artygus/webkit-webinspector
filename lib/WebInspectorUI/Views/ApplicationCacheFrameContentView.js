var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2010, 2013-2015 Apple Inc. All rights reserved.
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

WebInspector.ApplicationCacheFrameContentView = (function (_WebInspector$ApplicationCacheFrame) {
    _inherits(ApplicationCacheFrameContentView, _WebInspector$ApplicationCacheFrame);

    function ApplicationCacheFrameContentView(representedObject) {
        _classCallCheck(this, ApplicationCacheFrameContentView);

        console.assert(representedObject instanceof WebInspector.ApplicationCacheFrame);

        _get(Object.getPrototypeOf(ApplicationCacheFrameContentView.prototype), "constructor", this).call(this, representedObject);

        this.element.classList.add("application-cache-frame", "table");

        this._frame = representedObject.frame;

        this._emptyView = WebInspector.createMessageTextView(WebInspector.UIString("No Application Cache information available"), false);
        this._emptyView.classList.add("hidden");
        this.element.appendChild(this._emptyView);

        this._markDirty();

        var status = representedObject.status;
        this.updateStatus(status);

        WebInspector.applicationCacheManager.addEventListener(WebInspector.ApplicationCacheManager.Event.FrameManifestStatusChanged, this._updateStatus, this);
    }

    _createClass(ApplicationCacheFrameContentView, [{
        key: "shown",
        value: function shown() {
            this._maybeUpdate();
        }
    }, {
        key: "closed",
        value: function closed() {
            WebInspector.applicationCacheManager.removeEventListener(null, null, this);
        }
    }, {
        key: "updateLayout",
        value: function updateLayout() {
            if (this.dataGrid) this.dataGrid.updateLayout();
        }
    }, {
        key: "saveToCookie",
        value: function saveToCookie(cookie) {
            cookie.type = WebInspector.ContentViewCookieType.ApplicationCache;
            cookie.frame = this.representedObject.frame.url;
            cookie.manifest = this.representedObject.manifest.manifestURL;
        }
    }, {
        key: "_maybeUpdate",
        value: function _maybeUpdate() {
            if (!this.visible || !this._viewDirty) return;

            this._update();
            this._viewDirty = false;
        }
    }, {
        key: "_markDirty",
        value: function _markDirty() {
            this._viewDirty = true;
        }
    }, {
        key: "_updateStatus",
        value: function _updateStatus(event) {
            var frameManifest = event.data.frameManifest;
            if (frameManifest !== this.representedObject) return;

            console.assert(frameManifest instanceof WebInspector.ApplicationCacheFrame);

            this.updateStatus(frameManifest.status);
        }
    }, {
        key: "updateStatus",
        value: function updateStatus(status) {
            var oldStatus = this._status;
            this._status = status;

            if (this.visible && this._status === WebInspector.ApplicationCacheManager.Status.Idle && (oldStatus === WebInspector.ApplicationCacheManager.Status.UpdateReady || !this._resources)) this._markDirty();

            this._maybeUpdate();
        }
    }, {
        key: "_update",
        value: function _update() {
            WebInspector.applicationCacheManager.requestApplicationCache(this._frame, this._updateCallback.bind(this));
        }
    }, {
        key: "_updateCallback",
        value: function _updateCallback(applicationCache) {
            if (!applicationCache || !applicationCache.manifestURL) {
                delete this._manifest;
                delete this._creationTime;
                delete this._updateTime;
                delete this._size;
                delete this._resources;

                this._emptyView.classList.remove("hidden");

                if (this._dataGrid) this._dataGrid.element.classList.add("hidden");
                return;
            }

            // FIXME: are these variables needed anywhere else?
            this._manifest = applicationCache.manifestURL;
            this._creationTime = applicationCache.creationTime;
            this._updateTime = applicationCache.updateTime;
            this._size = applicationCache.size;
            this._resources = applicationCache.resources;

            if (!this._dataGrid) this._createDataGrid();

            this._populateDataGrid();
            this._dataGrid.autoSizeColumns(20, 80);
            this._dataGrid.element.classList.remove("hidden");

            this._emptyView.classList.add("hidden");
        }
    }, {
        key: "_createDataGrid",
        value: function _createDataGrid() {
            var columns = { url: {}, type: {}, size: {} };

            columns.url.title = WebInspector.UIString("Resource");
            columns.url.sortable = true;

            columns.type.title = WebInspector.UIString("Type");
            columns.type.sortable = true;

            columns.size.title = WebInspector.UIString("Size");
            columns.size.aligned = "right";
            columns.size.sortable = true;

            this._dataGrid = new WebInspector.DataGrid(columns);
            this._dataGrid.addEventListener(WebInspector.DataGrid.Event.SortChanged, this._sortDataGrid, this);

            this._dataGrid.sortColumnIdentifier = "url";
            this._dataGrid.sortOrder = WebInspector.DataGrid.SortOrder.Ascending;

            this.element.appendChild(this._dataGrid.element);
            this._dataGrid.updateLayout();
        }
    }, {
        key: "_sortDataGrid",
        value: function _sortDataGrid() {
            function numberCompare(columnIdentifier, nodeA, nodeB) {
                return nodeA.data[columnIdentifier] - nodeB.data[columnIdentifier];
            }
            function localeCompare(columnIdentifier, nodeA, nodeB) {
                return (nodeA.data[columnIdentifier] + "").localeCompare(nodeB.data[columnIdentifier] + "");
            }

            var comparator;
            switch (this._dataGrid.sortColumnIdentifier) {
                case "type":
                    comparator = localeCompare.bind(this, "type");break;
                case "size":
                    comparator = numberCompare.bind(this, "size");break;
                case "url":
                default:
                    comparator = localeCompare.bind(this, "url");break;
            }

            this._dataGrid.sortNodes(comparator);
        }
    }, {
        key: "_populateDataGrid",
        value: function _populateDataGrid() {
            this._dataGrid.removeChildren();

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._resources[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var resource = _step.value;

                    var data = {
                        url: resource.url,
                        type: resource.type,
                        size: Number.bytesToString(resource.size)
                    };
                    var node = new WebInspector.DataGridNode(data);
                    this._dataGrid.appendChild(node);
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
        key: "_deleteButtonClicked",
        value: function _deleteButtonClicked(event) {
            if (!this._dataGrid || !this._dataGrid.selectedNode) return;

            // FIXME: Delete Button semantics are not yet defined. (Delete a single, or all?)
            this._deleteCallback(this._dataGrid.selectedNode);
        }
    }, {
        key: "_deleteCallback",
        value: function _deleteCallback(node) {
            // FIXME: Should we delete a single (selected) resource or all resources?
            // InspectorBackend.deleteCachedResource(...)
            // this._update();
        }
    }, {
        key: "scrollableElements",
        get: function get() {
            if (!this._dataGrid) return [];
            return [this._dataGrid.scrollContainer];
        }
    }]);

    return ApplicationCacheFrameContentView;
})(WebInspector.ApplicationCacheFrame);
