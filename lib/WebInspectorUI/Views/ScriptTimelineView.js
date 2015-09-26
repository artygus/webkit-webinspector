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

WebInspector.ScriptTimelineView = (function (_WebInspector$TimelineView) {
    _inherits(ScriptTimelineView, _WebInspector$TimelineView);

    function ScriptTimelineView(timeline, extraArguments) {
        _classCallCheck(this, ScriptTimelineView);

        _get(Object.getPrototypeOf(ScriptTimelineView.prototype), "constructor", this).call(this, timeline, extraArguments);

        console.assert(timeline.type === WebInspector.TimelineRecord.Type.Script);

        this.navigationSidebarTreeOutline.element.classList.add("script");

        var columns = { location: {}, callCount: {}, startTime: {}, totalTime: {}, selfTime: {}, averageTime: {} };

        columns.location.title = WebInspector.UIString("Location");
        columns.location.width = "15%";

        columns.callCount.title = WebInspector.UIString("Calls");
        columns.callCount.width = "5%";
        columns.callCount.aligned = "right";

        columns.startTime.title = WebInspector.UIString("Start Time");
        columns.startTime.width = "10%";
        columns.startTime.aligned = "right";

        columns.totalTime.title = WebInspector.UIString("Total Time");
        columns.totalTime.width = "10%";
        columns.totalTime.aligned = "right";

        columns.selfTime.title = WebInspector.UIString("Self Time");
        columns.selfTime.width = "10%";
        columns.selfTime.aligned = "right";

        columns.averageTime.title = WebInspector.UIString("Average Time");
        columns.averageTime.width = "10%";
        columns.averageTime.aligned = "right";

        for (var column in columns) columns[column].sortable = true;

        this._dataGrid = new WebInspector.ScriptTimelineDataGrid(this.navigationSidebarTreeOutline, columns, this);
        this._dataGrid.addEventListener(WebInspector.TimelineDataGrid.Event.FiltersDidChange, this._dataGridFiltersDidChange, this);
        this._dataGrid.addEventListener(WebInspector.DataGrid.Event.SelectedNodeChanged, this._dataGridNodeSelected, this);
        this._dataGrid.sortColumnIdentifier = "startTime";
        this._dataGrid.sortOrder = WebInspector.DataGrid.SortOrder.Ascending;

        this.element.classList.add("script");
        this.element.appendChild(this._dataGrid.element);

        timeline.addEventListener(WebInspector.Timeline.Event.RecordAdded, this._scriptTimelineRecordAdded, this);

        this._pendingRecords = [];
    }

    // Public

    _createClass(ScriptTimelineView, [{
        key: "shown",
        value: function shown() {
            _get(Object.getPrototypeOf(ScriptTimelineView.prototype), "shown", this).call(this);

            this._dataGrid.shown();
        }
    }, {
        key: "hidden",
        value: function hidden() {
            this._dataGrid.hidden();

            _get(Object.getPrototypeOf(ScriptTimelineView.prototype), "hidden", this).call(this);
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
            _get(Object.getPrototypeOf(ScriptTimelineView.prototype), "updateLayout", this).call(this);

            this._dataGrid.updateLayout();

            if (this.startTime !== this._oldStartTime || this.endTime !== this._oldEndTime) {
                var dataGridNode = this._dataGrid.children[0];
                while (dataGridNode) {
                    dataGridNode.updateRangeTimes(this.startTime, this.endTime);
                    if (dataGridNode.revealed) dataGridNode.refreshIfNeeded();
                    dataGridNode = dataGridNode.traverseNextNode(false, null, true);
                }

                this._oldStartTime = this.startTime;
                this._oldEndTime = this.endTime;
            }

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
            _get(Object.getPrototypeOf(ScriptTimelineView.prototype), "reset", this).call(this);

            this._dataGrid.reset();

            this._pendingRecords = [];
        }

        // Protected

    }, {
        key: "canShowContentViewForTreeElement",
        value: function canShowContentViewForTreeElement(treeElement) {
            if (treeElement instanceof WebInspector.ProfileNodeTreeElement) return !!treeElement.profileNode.sourceCodeLocation;
            return _get(Object.getPrototypeOf(ScriptTimelineView.prototype), "canShowContentViewForTreeElement", this).call(this, treeElement);
        }
    }, {
        key: "showContentViewForTreeElement",
        value: function showContentViewForTreeElement(treeElement) {
            if (treeElement instanceof WebInspector.ProfileNodeTreeElement) {
                if (treeElement.profileNode.sourceCodeLocation) WebInspector.showOriginalOrFormattedSourceCodeLocation(treeElement.profileNode.sourceCodeLocation);
                return;
            }

            _get(Object.getPrototypeOf(ScriptTimelineView.prototype), "showContentViewForTreeElement", this).call(this, treeElement);
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

            _get(Object.getPrototypeOf(ScriptTimelineView.prototype), "treeElementSelected", this).call(this, treeElement, selectedByUser);
        }
    }, {
        key: "dataGridNodeForTreeElement",
        value: function dataGridNodeForTreeElement(treeElement) {
            if (treeElement instanceof WebInspector.ProfileNodeTreeElement) return new WebInspector.ProfileNodeDataGridNode(treeElement.profileNode, this.zeroTime, this.startTime, this.endTime);
            return null;
        }
    }, {
        key: "populateProfileNodeTreeElement",
        value: function populateProfileNodeTreeElement(treeElement) {
            var zeroTime = this.zeroTime;
            var startTime = this.startTime;
            var endTime = this.endTime;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = treeElement.profileNode.childNodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var childProfileNode = _step.value;

                    var profileNodeTreeElement = new WebInspector.ProfileNodeTreeElement(childProfileNode, this);
                    var profileNodeDataGridNode = new WebInspector.ProfileNodeDataGridNode(childProfileNode, zeroTime, startTime, endTime);
                    this._dataGrid.addRowInSortOrder(profileNodeTreeElement, profileNodeDataGridNode, treeElement);
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

        // Private

    }, {
        key: "_processPendingRecords",
        value: function _processPendingRecords() {
            if (!this._pendingRecords.length) return;

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._pendingRecords[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var scriptTimelineRecord = _step2.value;

                    var rootNodes = [];
                    if (scriptTimelineRecord.profile) {
                        // FIXME: Support using the bottom-up tree once it is implemented.
                        rootNodes = scriptTimelineRecord.profile.topDownRootNodes;
                    }

                    var zeroTime = this.zeroTime;
                    var treeElement = new WebInspector.TimelineRecordTreeElement(scriptTimelineRecord, WebInspector.SourceCodeLocation.NameStyle.Short, rootNodes.length);
                    var dataGridNode = new WebInspector.ScriptTimelineDataGridNode(scriptTimelineRecord, zeroTime);

                    this._dataGrid.addRowInSortOrder(treeElement, dataGridNode);

                    var startTime = this.startTime;
                    var endTime = this.endTime;

                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = rootNodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var profileNode = _step3.value;

                            var profileNodeTreeElement = new WebInspector.ProfileNodeTreeElement(profileNode, this);
                            var profileNodeDataGridNode = new WebInspector.ProfileNodeDataGridNode(profileNode, zeroTime, startTime, endTime);
                            this._dataGrid.addRowInSortOrder(profileNodeTreeElement, profileNodeDataGridNode, treeElement);
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

            this._pendingRecords = [];
        }
    }, {
        key: "_scriptTimelineRecordAdded",
        value: function _scriptTimelineRecordAdded(event) {
            var scriptTimelineRecord = event.data.record;
            console.assert(scriptTimelineRecord instanceof WebInspector.ScriptTimelineRecord);

            this._pendingRecords.push(scriptTimelineRecord);

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
    }]);

    return ScriptTimelineView;
})(WebInspector.TimelineView);
