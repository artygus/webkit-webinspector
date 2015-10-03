var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2014, 2015 Apple Inc. All rights reserved.
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

WebInspector.NetworkTimelineView = (function (_WebInspector$TimelineView) {
    _inherits(NetworkTimelineView, _WebInspector$TimelineView);

    function NetworkTimelineView(timeline, extraArguments) {
        _classCallCheck(this, NetworkTimelineView);

        _get(Object.getPrototypeOf(NetworkTimelineView.prototype), "constructor", this).call(this, timeline, extraArguments);

        console.assert(timeline.type === WebInspector.TimelineRecord.Type.Network);

        this.navigationSidebarTreeOutline.element.classList.add(WebInspector.NavigationSidebarPanel.HideDisclosureButtonsStyleClassName);
        this.navigationSidebarTreeOutline.element.classList.add("network");

        var columns = { domain: {}, type: {}, method: {}, scheme: {}, statusCode: {}, cached: {}, size: {}, transferSize: {}, requestSent: {}, latency: {}, duration: {} };

        columns.domain.title = WebInspector.UIString("Domain");
        columns.domain.width = "10%";

        columns.type.title = WebInspector.UIString("Type");
        columns.type.width = "8%";

        var typeToLabelMap = new Map();
        for (var key in WebInspector.Resource.Type) {
            var value = WebInspector.Resource.Type[key];
            typeToLabelMap.set(value, WebInspector.Resource.displayNameForType(value, true));
        }

        columns.type.scopeBar = WebInspector.TimelineDataGrid.createColumnScopeBar("network", typeToLabelMap);
        this._scopeBar = columns.type.scopeBar;

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

        this._dataGrid = new WebInspector.TimelineDataGrid(this.navigationSidebarTreeOutline, columns);
        this._dataGrid.addEventListener(WebInspector.TimelineDataGrid.Event.FiltersDidChange, this._dataGridFiltersDidChange, this);
        this._dataGrid.addEventListener(WebInspector.DataGrid.Event.SelectedNodeChanged, this._dataGridNodeSelected, this);
        this._dataGrid.sortColumnIdentifier = "requestSent";
        this._dataGrid.sortOrder = WebInspector.DataGrid.SortOrder.Ascending;

        this.element.classList.add("network");
        this.element.appendChild(this._dataGrid.element);

        timeline.addEventListener(WebInspector.Timeline.Event.RecordAdded, this._networkTimelineRecordAdded, this);

        this._pendingRecords = [];
    }

    // Public

    _createClass(NetworkTimelineView, [{
        key: "shown",
        value: function shown() {
            _get(Object.getPrototypeOf(NetworkTimelineView.prototype), "shown", this).call(this);

            this._dataGrid.shown();
        }
    }, {
        key: "hidden",
        value: function hidden() {
            this._dataGrid.hidden();

            _get(Object.getPrototypeOf(NetworkTimelineView.prototype), "hidden", this).call(this);
        }
    }, {
        key: "closed",
        value: function closed() {
            console.assert(this.representedObject instanceof WebInspector.Timeline);
            this.representedObject.removeEventListener(null, null, this);

            this._dataGrid.closed();
        }
    }, {
        key: "updateLayout",
        value: function updateLayout() {
            _get(Object.getPrototypeOf(NetworkTimelineView.prototype), "updateLayout", this).call(this);

            this._dataGrid.updateLayout();

            this._processPendingRecords();
        }
    }, {
        key: "matchTreeElementAgainstCustomFilters",
        value: function matchTreeElementAgainstCustomFilters(treeElement) {
            return this._dataGrid.treeElementMatchesActiveScopeFilters(treeElement);
        }
    }, {
        key: "reset",
        value: function reset() {
            _get(Object.getPrototypeOf(NetworkTimelineView.prototype), "reset", this).call(this);

            this._dataGrid.reset();

            this._pendingRecords = [];
        }

        // Protected

    }, {
        key: "canShowContentViewForTreeElement",
        value: function canShowContentViewForTreeElement(treeElement) {
            if (treeElement instanceof WebInspector.ResourceTreeElement || treeElement instanceof WebInspector.ScriptTreeElement) return true;
            return _get(Object.getPrototypeOf(NetworkTimelineView.prototype), "canShowContentViewForTreeElement", this).call(this, treeElement);
        }
    }, {
        key: "showContentViewForTreeElement",
        value: function showContentViewForTreeElement(treeElement) {
            if (treeElement instanceof WebInspector.ResourceTreeElement || treeElement instanceof WebInspector.ScriptTreeElement) {
                WebInspector.showSourceCode(treeElement.representedObject);
                return;
            }

            console.error("Unknown tree element selected.", treeElement);
        }
    }, {
        key: "treeElementPathComponentSelected",
        value: function treeElementPathComponentSelected(event) {
            var dataGridNode = this._dataGrid.dataGridNodeForTreeElement(event.data.pathComponent.generalTreeElement);
            if (!dataGridNode) return;
            dataGridNode.revealAndSelect();
        }
    }, {
        key: "treeElementSelected",
        value: function treeElementSelected(treeElement, selectedByUser) {
            if (this._dataGrid.shouldIgnoreSelectionEvent()) return;

            _get(Object.getPrototypeOf(NetworkTimelineView.prototype), "treeElementSelected", this).call(this, treeElement, selectedByUser);
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
                    var treeElement = this.navigationSidebarTreeOutline.findTreeElement(resourceTimelineRecord.resource);
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
        key: "_networkTimelineRecordAdded",
        value: function _networkTimelineRecordAdded(event) {
            var resourceTimelineRecord = event.data.record;
            console.assert(resourceTimelineRecord instanceof WebInspector.ResourceTimelineRecord);

            this._pendingRecords.push(resourceTimelineRecord);

            this.needsLayout();
        }
    }, {
        key: "_dataGridFiltersDidChange",
        value: function _dataGridFiltersDidChange(event) {
            this.timelineSidebarPanel.updateFilter();
        }
    }, {
        key: "_dataGridNodeSelected",
        value: function _dataGridNodeSelected(event) {
            this.dispatchEventToListeners(WebInspector.ContentView.Event.SelectionPathComponentsDidChange);
        }
    }, {
        key: "navigationSidebarTreeOutlineLabel",
        get: function get() {
            return WebInspector.UIString("Resources");
        }
    }]);

    return NetworkTimelineView;
})(WebInspector.TimelineView);
