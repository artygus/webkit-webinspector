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

WebInspector.LayoutTimelineView = (function (_WebInspector$TimelineView) {
    _inherits(LayoutTimelineView, _WebInspector$TimelineView);

    function LayoutTimelineView(timeline, extraArguments) {
        _classCallCheck(this, LayoutTimelineView);

        _get(Object.getPrototypeOf(LayoutTimelineView.prototype), "constructor", this).call(this, timeline, extraArguments);

        console.assert(timeline.type === WebInspector.TimelineRecord.Type.Layout, timeline);

        this.navigationSidebarTreeOutline.element.classList.add("layout");

        var columns = { eventType: {}, location: {}, width: {}, height: {}, startTime: {}, totalTime: {} };

        columns.eventType.title = WebInspector.UIString("Type");
        columns.eventType.width = "15%";

        var typeToLabelMap = new Map();
        for (var key in WebInspector.LayoutTimelineRecord.EventType) {
            var value = WebInspector.LayoutTimelineRecord.EventType[key];
            typeToLabelMap.set(value, WebInspector.LayoutTimelineRecord.displayNameForEventType(value));
        }

        columns.eventType.scopeBar = WebInspector.TimelineDataGrid.createColumnScopeBar("layout", typeToLabelMap);
        columns.eventType.hidden = true;
        this._scopeBar = columns.eventType.scopeBar;

        columns.location.title = WebInspector.UIString("Initiator");
        columns.location.width = "25%";

        columns.width.title = WebInspector.UIString("Width");
        columns.width.width = "8%";

        columns.height.title = WebInspector.UIString("Height");
        columns.height.width = "8%";

        columns.startTime.title = WebInspector.UIString("Start Time");
        columns.startTime.width = "8%";
        columns.startTime.aligned = "right";

        columns.totalTime.title = WebInspector.UIString("Duration");
        columns.totalTime.width = "8%";
        columns.totalTime.aligned = "right";

        for (var column in columns) columns[column].sortable = true;

        this._dataGrid = new WebInspector.LayoutTimelineDataGrid(this.navigationSidebarTreeOutline, columns);
        this._dataGrid.addEventListener(WebInspector.TimelineDataGrid.Event.FiltersDidChange, this._dataGridFiltersDidChange, this);
        this._dataGrid.addEventListener(WebInspector.DataGrid.Event.SelectedNodeChanged, this._dataGridNodeSelected, this);

        this._dataGrid.sortColumnIdentifier = "startTime";
        this._dataGrid.sortOrder = WebInspector.DataGrid.SortOrder.Ascending;

        this._hoveredTreeElement = null;
        this._hoveredDataGridNode = null;
        this._showingHighlight = false;
        this._showingHighlightForRecord = null;

        this._dataGrid.element.addEventListener("mouseover", this._mouseOverDataGrid.bind(this));
        this._dataGrid.element.addEventListener("mouseleave", this._mouseLeaveDataGrid.bind(this));
        this.navigationSidebarTreeOutline.element.addEventListener("mouseover", this._mouseOverTreeOutline.bind(this));
        this.navigationSidebarTreeOutline.element.addEventListener("mouseleave", this._mouseLeaveTreeOutline.bind(this));

        this.element.classList.add("layout");
        this.element.appendChild(this._dataGrid.element);

        timeline.addEventListener(WebInspector.Timeline.Event.RecordAdded, this._layoutTimelineRecordAdded, this);

        this._pendingRecords = [];
    }

    // Public

    _createClass(LayoutTimelineView, [{
        key: "shown",
        value: function shown() {
            _get(Object.getPrototypeOf(LayoutTimelineView.prototype), "shown", this).call(this);

            this._updateHighlight();

            this._dataGrid.shown();
        }
    }, {
        key: "hidden",
        value: function hidden() {
            this._hideHighlightIfNeeded();

            this._dataGrid.hidden();

            _get(Object.getPrototypeOf(LayoutTimelineView.prototype), "hidden", this).call(this);
        }
    }, {
        key: "closed",
        value: function closed() {
            console.assert(this.representedObject instanceof WebInspector.Timeline);
            this.representedObject.removeEventListener(null, null, this);

            this._dataGrid.closed();
        }
    }, {
        key: "filterDidChange",
        value: function filterDidChange() {
            _get(Object.getPrototypeOf(LayoutTimelineView.prototype), "filterDidChange", this).call(this);

            this._updateHighlight();
        }
    }, {
        key: "updateLayout",
        value: function updateLayout() {
            _get(Object.getPrototypeOf(LayoutTimelineView.prototype), "updateLayout", this).call(this);

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
            _get(Object.getPrototypeOf(LayoutTimelineView.prototype), "reset", this).call(this);

            this._hideHighlightIfNeeded();

            this._dataGrid.reset();

            this._pendingRecords = [];
        }

        // Protected

    }, {
        key: "treeElementPathComponentSelected",
        value: function treeElementPathComponentSelected(event) {
            var dataGridNode = this._dataGrid.dataGridNodeForTreeElement(event.data.pathComponent.generalTreeElement);
            if (!dataGridNode) return;
            dataGridNode.revealAndSelect();
        }
    }, {
        key: "treeElementDeselected",
        value: function treeElementDeselected(treeElement) {
            _get(Object.getPrototypeOf(LayoutTimelineView.prototype), "treeElementDeselected", this).call(this, treeElement);

            this._updateHighlight();
        }
    }, {
        key: "treeElementSelected",
        value: function treeElementSelected(treeElement, selectedByUser) {
            if (this._dataGrid.shouldIgnoreSelectionEvent()) return;

            _get(Object.getPrototypeOf(LayoutTimelineView.prototype), "treeElementSelected", this).call(this, treeElement, selectedByUser);

            this._updateHighlight();
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
                    var layoutTimelineRecord = _step.value;

                    var treeElement = new WebInspector.TimelineRecordTreeElement(layoutTimelineRecord, WebInspector.SourceCodeLocation.NameStyle.Short);
                    var dataGridNode = new WebInspector.LayoutTimelineDataGridNode(layoutTimelineRecord, this.zeroTime);

                    this._dataGrid.addRowInSortOrder(treeElement, dataGridNode);

                    var stack = [{ children: layoutTimelineRecord.children, parentTreeElement: treeElement, index: 0 }];
                    while (stack.length) {
                        var entry = stack.lastValue;
                        if (entry.index >= entry.children.length) {
                            stack.pop();
                            continue;
                        }

                        var childRecord = entry.children[entry.index];
                        console.assert(childRecord.type === WebInspector.TimelineRecord.Type.Layout, childRecord);

                        var childTreeElement = new WebInspector.TimelineRecordTreeElement(childRecord, WebInspector.SourceCodeLocation.NameStyle.Short);
                        var layoutDataGridNode = new WebInspector.LayoutTimelineDataGridNode(childRecord, this.zeroTime);
                        console.assert(entry.parentTreeElement, "entry without parent!");
                        this._dataGrid.addRowInSortOrder(childTreeElement, layoutDataGridNode, entry.parentTreeElement);

                        if (childTreeElement && childRecord.children.length) stack.push({ children: childRecord.children, parentTreeElement: childTreeElement, index: 0 });
                        ++entry.index;
                    }
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
        key: "_layoutTimelineRecordAdded",
        value: function _layoutTimelineRecordAdded(event) {
            var layoutTimelineRecord = event.data.record;
            console.assert(layoutTimelineRecord instanceof WebInspector.LayoutTimelineRecord);

            // Only add top-level records, to avoid processing child records multiple times.
            if (!(layoutTimelineRecord.parent instanceof WebInspector.RenderingFrameTimelineRecord)) return;

            this._pendingRecords.push(layoutTimelineRecord);

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
        key: "_updateHighlight",
        value: function _updateHighlight() {
            var record = this._hoveredOrSelectedRecord();
            if (!record) {
                this._hideHighlightIfNeeded();
                return;
            }

            this._showHighlightForRecord(record);
        }
    }, {
        key: "_showHighlightForRecord",
        value: function _showHighlightForRecord(record) {
            if (this._showingHighlightForRecord === record) return;

            this._showingHighlightForRecord = record;

            var contentColor = { r: 111, g: 168, b: 220, a: 0.66 };
            var outlineColor = { r: 255, g: 229, b: 153, a: 0.66 };

            var quad = record.quad;
            if (quad) {
                DOMAgent.highlightQuad(quad.toProtocol(), contentColor, outlineColor);
                this._showingHighlight = true;
                return;
            }

            // This record doesn't have a highlight, so hide any existing highlight.
            if (this._showingHighlight) {
                this._showingHighlight = false;
                DOMAgent.hideHighlight();
            }
        }
    }, {
        key: "_hideHighlightIfNeeded",
        value: function _hideHighlightIfNeeded() {
            this._showingHighlightForRecord = null;

            if (this._showingHighlight) {
                this._showingHighlight = false;
                DOMAgent.hideHighlight();
            }
        }
    }, {
        key: "_hoveredOrSelectedRecord",
        value: function _hoveredOrSelectedRecord() {
            if (this._hoveredDataGridNode) return this._hoveredDataGridNode.record;

            if (this._hoveredTreeElement) return this._hoveredTreeElement.record;

            if (this._dataGrid.selectedNode) {
                var treeElement = this._dataGrid.treeElementForDataGridNode(this._dataGrid.selectedNode);
                if (treeElement.revealed()) return this._dataGrid.selectedNode.record;
            }

            return null;
        }
    }, {
        key: "_mouseOverDataGrid",
        value: function _mouseOverDataGrid(event) {
            var hoveredDataGridNode = this._dataGrid.dataGridNodeFromNode(event.target);
            if (!hoveredDataGridNode) return;

            this._hoveredDataGridNode = hoveredDataGridNode;
            this._updateHighlight();
        }
    }, {
        key: "_mouseLeaveDataGrid",
        value: function _mouseLeaveDataGrid(event) {
            this._hoveredDataGridNode = null;
            this._updateHighlight();
        }
    }, {
        key: "_mouseOverTreeOutline",
        value: function _mouseOverTreeOutline(event) {
            var hoveredTreeElement = this.navigationSidebarTreeOutline.treeElementFromNode(event.target);
            if (!hoveredTreeElement) return;

            this._hoveredTreeElement = hoveredTreeElement;
            this._updateHighlight();
        }
    }, {
        key: "_mouseLeaveTreeOutline",
        value: function _mouseLeaveTreeOutline(event) {
            this._hoveredTreeElement = null;
            this._updateHighlight();
        }
    }, {
        key: "navigationSidebarTreeOutlineLabel",
        get: function get() {
            return WebInspector.UIString("Records");
        }
    }]);

    return LayoutTimelineView;
})(WebInspector.TimelineView);
