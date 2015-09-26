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

WebInspector.RenderingFrameTimelineView = (function (_WebInspector$TimelineView) {
    _inherits(RenderingFrameTimelineView, _WebInspector$TimelineView);

    function RenderingFrameTimelineView(timeline, extraArguments) {
        _classCallCheck(this, RenderingFrameTimelineView);

        _get(Object.getPrototypeOf(RenderingFrameTimelineView.prototype), "constructor", this).call(this, timeline, extraArguments);

        console.assert(WebInspector.TimelineRecord.Type.RenderingFrame);

        this.navigationSidebarTreeOutline.element.classList.add("rendering-frame");

        var scopeBarItems = [];
        for (var key in WebInspector.RenderingFrameTimelineView.DurationFilter) {
            var value = WebInspector.RenderingFrameTimelineView.DurationFilter[key];
            scopeBarItems.push(new WebInspector.ScopeBarItem(value, WebInspector.RenderingFrameTimelineView.displayNameForDurationFilter(value)));
        }

        this._scopeBar = new WebInspector.ScopeBar("rendering-frame-scope-bar", scopeBarItems, scopeBarItems[0], true);
        this._scopeBar.addEventListener(WebInspector.ScopeBar.Event.SelectionChanged, this._scopeBarSelectionDidChange, this);

        var columns = { totalTime: {}, scriptTime: {}, layoutTime: {}, paintTime: {}, otherTime: {}, startTime: {}, location: {} };

        columns.totalTime.title = WebInspector.UIString("Total Time");
        columns.totalTime.width = "15%";
        columns.totalTime.aligned = "right";

        columns.scriptTime.title = WebInspector.RenderingFrameTimelineRecord.displayNameForTaskType(WebInspector.RenderingFrameTimelineRecord.TaskType.Script);
        columns.scriptTime.width = "10%";
        columns.scriptTime.aligned = "right";

        columns.layoutTime.title = WebInspector.RenderingFrameTimelineRecord.displayNameForTaskType(WebInspector.RenderingFrameTimelineRecord.TaskType.Layout);
        columns.layoutTime.width = "10%";
        columns.layoutTime.aligned = "right";

        columns.paintTime.title = WebInspector.RenderingFrameTimelineRecord.displayNameForTaskType(WebInspector.RenderingFrameTimelineRecord.TaskType.Paint);
        columns.paintTime.width = "10%";
        columns.paintTime.aligned = "right";

        columns.otherTime.title = WebInspector.RenderingFrameTimelineRecord.displayNameForTaskType(WebInspector.RenderingFrameTimelineRecord.TaskType.Other);
        columns.otherTime.width = "10%";
        columns.otherTime.aligned = "right";

        columns.startTime.title = WebInspector.UIString("Start Time");
        columns.startTime.width = "15%";
        columns.startTime.aligned = "right";

        columns.location.title = WebInspector.UIString("Location");

        for (var column in columns) columns[column].sortable = true;

        this._dataGrid = new WebInspector.TimelineDataGrid(this.navigationSidebarTreeOutline, columns, this);
        this._dataGrid.addEventListener(WebInspector.DataGrid.Event.SelectedNodeChanged, this._dataGridNodeSelected, this);
        this._dataGrid.sortColumnIdentifier = "startTime";
        this._dataGrid.sortOrder = WebInspector.DataGrid.SortOrder.Ascending;

        this.element.classList.add("rendering-frame");
        this.element.appendChild(this._dataGrid.element);

        timeline.addEventListener(WebInspector.Timeline.Event.RecordAdded, this._renderingFrameTimelineRecordAdded, this);

        this._pendingRecords = [];
    }

    _createClass(RenderingFrameTimelineView, [{
        key: "shown",
        value: function shown() {
            _get(Object.getPrototypeOf(RenderingFrameTimelineView.prototype), "shown", this).call(this);

            this._dataGrid.shown();
        }
    }, {
        key: "hidden",
        value: function hidden() {
            this._dataGrid.hidden();

            _get(Object.getPrototypeOf(RenderingFrameTimelineView.prototype), "hidden", this).call(this);
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
            _get(Object.getPrototypeOf(RenderingFrameTimelineView.prototype), "updateLayout", this).call(this);

            this._dataGrid.updateLayout();

            this._processPendingRecords();
        }
    }, {
        key: "matchTreeElementAgainstCustomFilters",
        value: function matchTreeElementAgainstCustomFilters(treeElement) {
            console.assert(this._scopeBar.selectedItems.length === 1);
            var selectedScopeBarItem = this._scopeBar.selectedItems[0];
            if (!selectedScopeBarItem || selectedScopeBarItem.id === WebInspector.RenderingFrameTimelineView.DurationFilter.All) return true;

            while (treeElement && !(treeElement.record instanceof WebInspector.RenderingFrameTimelineRecord)) treeElement = treeElement.parent;

            console.assert(treeElement, "Cannot apply duration filter: no RenderingFrameTimelineRecord found.");
            if (!treeElement) return false;

            var minimumDuration = selectedScopeBarItem.id === WebInspector.RenderingFrameTimelineView.DurationFilter.OverOneMillisecond ? 0.001 : 0.015;
            return treeElement.record.duration > minimumDuration;
        }
    }, {
        key: "reset",
        value: function reset() {
            _get(Object.getPrototypeOf(RenderingFrameTimelineView.prototype), "reset", this).call(this);

            this._dataGrid.reset();

            this._pendingRecords = [];
        }

        // Protected

    }, {
        key: "canShowContentViewForTreeElement",
        value: function canShowContentViewForTreeElement(treeElement) {
            if (treeElement instanceof WebInspector.ProfileNodeTreeElement) return !!treeElement.profileNode.sourceCodeLocation;
            return _get(Object.getPrototypeOf(RenderingFrameTimelineView.prototype), "canShowContentViewForTreeElement", this).call(this, treeElement);
        }
    }, {
        key: "showContentViewForTreeElement",
        value: function showContentViewForTreeElement(treeElement) {
            if (treeElement instanceof WebInspector.ProfileNodeTreeElement) {
                if (treeElement.profileNode.sourceCodeLocation) WebInspector.showOriginalOrFormattedSourceCodeLocation(treeElement.profileNode.sourceCodeLocation);
                return;
            }

            _get(Object.getPrototypeOf(RenderingFrameTimelineView.prototype), "showContentViewForTreeElement", this).call(this, treeElement);
        }
    }, {
        key: "treeElementDeselected",
        value: function treeElementDeselected(treeElement) {
            var dataGridNode = this._dataGrid.dataGridNodeForTreeElement(treeElement);
            if (!dataGridNode) return;

            dataGridNode.deselect();
        }
    }, {
        key: "treeElementSelected",
        value: function treeElementSelected(treeElement, selectedByUser) {
            if (this._dataGrid.shouldIgnoreSelectionEvent()) return;

            _get(Object.getPrototypeOf(RenderingFrameTimelineView.prototype), "treeElementSelected", this).call(this, treeElement, selectedByUser);
        }
    }, {
        key: "treeElementPathComponentSelected",
        value: function treeElementPathComponentSelected(event) {
            var dataGridNode = this._dataGrid.dataGridNodeForTreeElement(event.data.pathComponent.generalTreeElement);
            if (!dataGridNode) return;
            dataGridNode.revealAndSelect();
        }
    }, {
        key: "dataGridNodeForTreeElement",
        value: function dataGridNodeForTreeElement(treeElement) {
            if (treeElement instanceof WebInspector.ProfileNodeTreeElement) return new WebInspector.ProfileNodeDataGridNode(treeElement.profileNode, this.zeroTime, this.startTime, this.endTime);
            return null;
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
                    var renderingFrameTimelineRecord = _step.value;

                    console.assert(renderingFrameTimelineRecord instanceof WebInspector.RenderingFrameTimelineRecord);

                    var treeElement = new WebInspector.TimelineRecordTreeElement(renderingFrameTimelineRecord);
                    var dataGridNode = new WebInspector.RenderingFrameTimelineDataGridNode(renderingFrameTimelineRecord, this.zeroTime);
                    this._dataGrid.addRowInSortOrder(treeElement, dataGridNode);

                    var stack = [{ children: renderingFrameTimelineRecord.children, parentTreeElement: treeElement, index: 0 }];
                    while (stack.length) {
                        var entry = stack.lastValue;
                        if (entry.index >= entry.children.length) {
                            stack.pop();
                            continue;
                        }

                        var childRecord = entry.children[entry.index];
                        var childTreeElement = null;
                        if (childRecord.type === WebInspector.TimelineRecord.Type.Layout) {
                            childTreeElement = new WebInspector.TimelineRecordTreeElement(childRecord, WebInspector.SourceCodeLocation.NameStyle.Short);
                            if (childRecord.width && childRecord.height) {
                                var subtitle = document.createElement("span");
                                subtitle.textContent = WebInspector.UIString("%d ⨉ %d").format(childRecord.width, childRecord.height);
                                childTreeElement.subtitle = subtitle;
                            }
                            var layoutDataGridNode = new WebInspector.LayoutTimelineDataGridNode(childRecord, this.zeroTime);

                            this._dataGrid.addRowInSortOrder(childTreeElement, layoutDataGridNode, entry.parentTreeElement);
                        } else if (childRecord.type === WebInspector.TimelineRecord.Type.Script) {
                            var rootNodes = [];
                            if (childRecord.profile) {
                                // FIXME: Support using the bottom-up tree once it is implemented.
                                rootNodes = childRecord.profile.topDownRootNodes;
                            }

                            childTreeElement = new WebInspector.TimelineRecordTreeElement(childRecord, WebInspector.SourceCodeLocation.NameStyle.Short, rootNodes.length);
                            var scriptDataGridNode = new WebInspector.ScriptTimelineDataGridNode(childRecord, this.zeroTime);

                            this._dataGrid.addRowInSortOrder(childTreeElement, scriptDataGridNode, entry.parentTreeElement);

                            var _iteratorNormalCompletion2 = true;
                            var _didIteratorError2 = false;
                            var _iteratorError2 = undefined;

                            try {
                                for (var _iterator2 = rootNodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                    var profileNode = _step2.value;

                                    var profileNodeTreeElement = new WebInspector.ProfileNodeTreeElement(profileNode, this);
                                    var profileNodeDataGridNode = new WebInspector.ProfileNodeDataGridNode(profileNode, this.zeroTime, this.startTime, this.endTime);
                                    this._dataGrid.addRowInSortOrder(profileNodeTreeElement, profileNodeDataGridNode, childTreeElement);
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
                        }

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
        key: "_renderingFrameTimelineRecordAdded",
        value: function _renderingFrameTimelineRecordAdded(event) {
            var renderingFrameTimelineRecord = event.data.record;
            console.assert(renderingFrameTimelineRecord instanceof WebInspector.RenderingFrameTimelineRecord);
            console.assert(renderingFrameTimelineRecord.children.length, "Missing child records for rendering frame.");

            this._pendingRecords.push(renderingFrameTimelineRecord);

            this.needsLayout();
        }
    }, {
        key: "_dataGridNodeSelected",
        value: function _dataGridNodeSelected(event) {
            this.dispatchEventToListeners(WebInspector.ContentView.Event.SelectionPathComponentsDidChange);
        }
    }, {
        key: "_scopeBarSelectionDidChange",
        value: function _scopeBarSelectionDidChange(event) {
            this.timelineSidebarPanel.updateFilter();
        }
    }, {
        key: "navigationSidebarTreeOutlineLabel",

        // Public

        get: function get() {
            return WebInspector.UIString("Records");
        }
    }, {
        key: "selectionPathComponents",
        get: function get() {
            var dataGridNode = this._dataGrid.selectedNode;
            if (!dataGridNode) return null;

            var pathComponents = [];

            while (dataGridNode && !dataGridNode.root) {
                var treeElement = this._dataGrid.treeElementForDataGridNode(dataGridNode);
                console.assert(treeElement);
                if (!treeElement) break;

                if (treeElement.hidden) return null;

                var pathComponent = new WebInspector.GeneralTreeElementPathComponent(treeElement);
                pathComponent.addEventListener(WebInspector.HierarchicalPathComponent.Event.SiblingWasSelected, this.treeElementPathComponentSelected, this);
                pathComponents.unshift(pathComponent);
                dataGridNode = dataGridNode.parent;
            }

            return pathComponents;
        }
    }], [{
        key: "displayNameForDurationFilter",
        value: function displayNameForDurationFilter(filter) {
            switch (filter) {
                case WebInspector.RenderingFrameTimelineView.DurationFilter.All:
                    return WebInspector.UIString("All");
                case WebInspector.RenderingFrameTimelineView.DurationFilter.OverOneMillisecond:
                    return WebInspector.UIString("Over 1 ms");
                case WebInspector.RenderingFrameTimelineView.DurationFilter.OverFifteenMilliseconds:
                    return WebInspector.UIString("Over 15 ms");
                default:
                    console.error("Unknown filter type", filter);
            }

            return null;
        }
    }]);

    return RenderingFrameTimelineView;
})(WebInspector.TimelineView);

WebInspector.RenderingFrameTimelineView.DurationFilter = {
    All: "rendering-frame-timeline-view-duration-filter-all",
    OverOneMillisecond: "rendering-frame-timeline-view-duration-filter-over-1-ms",
    OverFifteenMilliseconds: "rendering-frame-timeline-view-duration-filter-over-15-ms"
};
