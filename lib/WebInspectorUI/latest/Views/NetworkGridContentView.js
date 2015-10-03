var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2015 Apple Inc. All rights reserved.
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

WebInspector.NetworkGridContentView = (function (_WebInspector$ContentView) {
    _inherits(NetworkGridContentView, _WebInspector$ContentView);

    function NetworkGridContentView(representedObject, extraArguments) {
        _classCallCheck(this, NetworkGridContentView);

        console.assert(extraArguments);
        console.assert(extraArguments.networkSidebarPanel instanceof WebInspector.NetworkSidebarPanel);

        _get(Object.getPrototypeOf(NetworkGridContentView.prototype), "constructor", this).call(this, representedObject);

        this._networkSidebarPanel = extraArguments.networkSidebarPanel;

        this._contentTreeOutline = this._networkSidebarPanel.contentTreeOutline;
        this._contentTreeOutline.onselect = this._treeElementSelected.bind(this);

        var columns = { domain: {}, type: {}, method: {}, scheme: {}, statusCode: {}, cached: {}, size: {}, transferSize: {}, requestSent: {}, latency: {}, duration: {} };

        columns.domain.title = WebInspector.UIString("Domain");
        columns.domain.width = "10%";

        columns.type.title = WebInspector.UIString("Type");
        columns.type.width = "8%";

        columns.method.title = WebInspector.UIString("Method");
        columns.method.width = "6%";

        columns.scheme.title = WebInspector.UIString("Scheme");
        columns.scheme.width = "6%";

        columns.statusCode.title = WebInspector.UIString("Status");
        columns.statusCode.width = "6%";

        columns.cached.title = WebInspector.UIString("Cached");
        columns.cached.width = "6%";

        columns.size.title = WebInspector.UIString("Size");
        columns.size.width = "8%";
        columns.size.aligned = "right";

        columns.transferSize.title = WebInspector.UIString("Transfered");
        columns.transferSize.width = "8%";
        columns.transferSize.aligned = "right";

        columns.requestSent.title = WebInspector.UIString("Start Time");
        columns.requestSent.width = "9%";
        columns.requestSent.aligned = "right";

        columns.latency.title = WebInspector.UIString("Latency");
        columns.latency.width = "9%";
        columns.latency.aligned = "right";

        columns.duration.title = WebInspector.UIString("Duration");
        columns.duration.width = "9%";
        columns.duration.aligned = "right";

        for (var column in columns) columns[column].sortable = true;

        this._dataGrid = new WebInspector.TimelineDataGrid(this._contentTreeOutline, columns);
        this._dataGrid.addEventListener(WebInspector.DataGrid.Event.SelectedNodeChanged, this._dataGridNodeSelected, this);
        this._dataGrid.sortColumnIdentifier = "requestSent";
        this._dataGrid.sortOrder = WebInspector.DataGrid.SortOrder.Ascending;

        this.element.classList.add("network-grid");
        this.element.appendChild(this._dataGrid.element);

        var networkTimeline = WebInspector.timelineManager.persistentNetworkTimeline;
        networkTimeline.addEventListener(WebInspector.Timeline.Event.RecordAdded, this._networkTimelineRecordAdded, this);
        networkTimeline.addEventListener(WebInspector.Timeline.Event.Reset, this._networkTimelineReset, this);

        this._pendingRecords = [];
    }

    // Public

    _createClass(NetworkGridContentView, [{
        key: "shown",
        value: function shown() {
            _get(Object.getPrototypeOf(NetworkGridContentView.prototype), "shown", this).call(this);

            this._dataGrid.shown();
        }
    }, {
        key: "hidden",
        value: function hidden() {
            this._dataGrid.hidden();

            _get(Object.getPrototypeOf(NetworkGridContentView.prototype), "hidden", this).call(this);
        }
    }, {
        key: "closed",
        value: function closed() {
            this._dataGrid.closed();
        }
    }, {
        key: "updateLayout",
        value: function updateLayout() {
            if (this._scheduledLayoutUpdateIdentifier) {
                cancelAnimationFrame(this._scheduledLayoutUpdateIdentifier);
                delete this._scheduledLayoutUpdateIdentifier;
            }

            this._dataGrid.updateLayout();

            this._processPendingRecords();
        }
    }, {
        key: "needsLayout",
        value: function needsLayout() {
            if (!this._networkSidebarPanel.visible) return;

            if (this._scheduledLayoutUpdateIdentifier) return;

            this._scheduledLayoutUpdateIdentifier = requestAnimationFrame(this.updateLayout.bind(this));
        }
    }, {
        key: "reset",
        value: function reset() {
            this._contentTreeOutline.removeChildren();
            this._dataGrid.reset();
        }

        // Private

    }, {
        key: "_processPendingRecords",
        value: function _processPendingRecords() {
            if (!this._pendingRecords.length) return;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._pendingRecords[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var resourceTimelineRecord = _step.value;

                    // Skip the record if it already exists in the tree.
                    var treeElement = this._contentTreeOutline.findTreeElement(resourceTimelineRecord.resource);
                    if (treeElement) continue;

                    treeElement = new WebInspector.ResourceTreeElement(resourceTimelineRecord.resource);
                    var dataGridNode = new WebInspector.ResourceTimelineDataGridNode(resourceTimelineRecord, false, this);

                    this._dataGrid.addRowInSortOrder(treeElement, dataGridNode);
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

            this._pendingRecords = [];
        }
    }, {
        key: "_networkTimelineReset",
        value: function _networkTimelineReset(event) {
            this.reset();
        }
    }, {
        key: "_networkTimelineRecordAdded",
        value: function _networkTimelineRecordAdded(event) {
            var resourceTimelineRecord = event.data.record;
            console.assert(resourceTimelineRecord instanceof WebInspector.ResourceTimelineRecord);

            this._pendingRecords.push(resourceTimelineRecord);

            this.needsLayout();
        }
    }, {
        key: "_treeElementPathComponentSelected",
        value: function _treeElementPathComponentSelected(event) {
            var dataGridNode = this._dataGrid.dataGridNodeForTreeElement(event.data.pathComponent.generalTreeElement);
            if (!dataGridNode) return;
            dataGridNode.revealAndSelect();
        }
    }, {
        key: "_treeElementSelected",
        value: function _treeElementSelected(treeElement, selectedByUser) {
            this.dispatchEventToListeners(WebInspector.ContentView.Event.SelectionPathComponentsDidChange);

            if (!this._networkSidebarPanel.canShowDifferentContentView()) return;

            if (treeElement instanceof WebInspector.ResourceTreeElement) {
                WebInspector.showRepresentedObject(treeElement.representedObject);
                return;
            }

            console.error("Unknown tree element", treeElement);
        }
    }, {
        key: "_dataGridNodeSelected",
        value: function _dataGridNodeSelected(event) {
            this.dispatchEventToListeners(WebInspector.ContentView.Event.SelectionPathComponentsDidChange);
        }
    }, {
        key: "navigationSidebarTreeOutline",
        get: function get() {
            return this._contentTreeOutline;
        }
    }, {
        key: "selectionPathComponents",
        get: function get() {
            if (!this._contentTreeOutline.selectedTreeElement || this._contentTreeOutline.selectedTreeElement.hidden) return null;

            var pathComponent = new WebInspector.GeneralTreeElementPathComponent(this._contentTreeOutline.selectedTreeElement);
            pathComponent.addEventListener(WebInspector.HierarchicalPathComponent.Event.SiblingWasSelected, this._treeElementPathComponentSelected, this);
            return [pathComponent];
        }
    }, {
        key: "zeroTime",
        get: function get() {
            return WebInspector.timelineManager.persistentNetworkTimeline.startTime;
        }
    }]);

    return NetworkGridContentView;
})(WebInspector.ContentView);
