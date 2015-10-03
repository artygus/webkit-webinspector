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

WebInspector.ScriptTimelineView = function (timeline) {
    WebInspector.TimelineView.call(this, timeline);

    console.assert(timeline.type === WebInspector.TimelineRecord.Type.Script);

    this.navigationSidebarTreeOutline.onselect = this._treeElementSelected.bind(this);
    this.navigationSidebarTreeOutline.ondeselect = this._treeElementDeselected.bind(this);
    this.navigationSidebarTreeOutline.element.classList.add(WebInspector.ScriptTimelineView.TreeOutlineStyleClassName);

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

    this.element.classList.add(WebInspector.ScriptTimelineView.StyleClassName);
    this.element.appendChild(this._dataGrid.element);

    timeline.addEventListener(WebInspector.Timeline.Event.RecordAdded, this._scriptTimelineRecordAdded, this);

    this._pendingRecords = [];
};

WebInspector.ScriptTimelineView.StyleClassName = "script";
WebInspector.ScriptTimelineView.TreeOutlineStyleClassName = "script";

WebInspector.ScriptTimelineView.prototype = Object.defineProperties({
    constructor: WebInspector.ScriptTimelineView,
    __proto__: WebInspector.TimelineView.prototype,

    shown: function shown() {
        WebInspector.TimelineView.prototype.shown.call(this);

        this._dataGrid.shown();
    },

    hidden: function hidden() {
        this._dataGrid.hidden();

        WebInspector.TimelineView.prototype.hidden.call(this);
    },

    updateLayout: function updateLayout() {
        WebInspector.TimelineView.prototype.updateLayout.call(this);

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
    },

    matchTreeElementAgainstCustomFilters: function matchTreeElementAgainstCustomFilters(treeElement) {
        return this._dataGrid.treeElementMatchesActiveScopeFilters(treeElement);
    },

    reset: function reset() {
        WebInspector.TimelineView.prototype.reset.call(this);

        this._dataGrid.reset();
    },

    // Protected

    treeElementPathComponentSelected: function treeElementPathComponentSelected(event) {
        var dataGridNode = this._dataGrid.dataGridNodeForTreeElement(event.data.pathComponent.generalTreeElement);
        if (!dataGridNode) return;
        dataGridNode.revealAndSelect();
    },

    dataGridNodeForTreeElement: function dataGridNodeForTreeElement(treeElement) {
        if (treeElement instanceof WebInspector.ProfileNodeTreeElement) return new WebInspector.ProfileNodeDataGridNode(treeElement.profileNode, this.zeroTime, this.startTime, this.endTime);
        return null;
    },

    populateProfileNodeTreeElement: function populateProfileNodeTreeElement(treeElement) {
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
    },

    // Private

    _processPendingRecords: function _processPendingRecords() {
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
    },

    _scriptTimelineRecordAdded: function _scriptTimelineRecordAdded(event) {
        var scriptTimelineRecord = event.data.record;
        console.assert(scriptTimelineRecord instanceof WebInspector.ScriptTimelineRecord);

        this._pendingRecords.push(scriptTimelineRecord);

        this.needsLayout();
    },

    _dataGridFiltersDidChange: function _dataGridFiltersDidChange(event) {
        WebInspector.timelineSidebarPanel.updateFilter();
    },

    _dataGridNodeSelected: function _dataGridNodeSelected(event) {
        this.dispatchEventToListeners(WebInspector.TimelineView.Event.SelectionPathComponentsDidChange);
    },

    _treeElementDeselected: function _treeElementDeselected(treeElement) {
        if (treeElement.status) treeElement.status = "";
    },

    _treeElementSelected: function _treeElementSelected(treeElement, selectedByUser) {
        if (this._dataGrid.shouldIgnoreSelectionEvent()) return;

        if (!WebInspector.timelineSidebarPanel.canShowDifferentContentView()) return;

        if (treeElement instanceof WebInspector.FolderTreeElement) return;

        var sourceCodeLocation = null;
        if (treeElement instanceof WebInspector.TimelineRecordTreeElement) sourceCodeLocation = treeElement.record.sourceCodeLocation;else if (treeElement instanceof WebInspector.ProfileNodeTreeElement) sourceCodeLocation = treeElement.profileNode.sourceCodeLocation;else console.error("Unknown tree element selected.");

        if (!sourceCodeLocation) {
            WebInspector.timelineSidebarPanel.showTimelineViewForType(WebInspector.TimelineRecord.Type.Script);
            return;
        }

        WebInspector.resourceSidebarPanel.showOriginalOrFormattedSourceCodeLocation(sourceCodeLocation);
        this._updateTreeElementWithCloseButton(treeElement);
    },

    _updateTreeElementWithCloseButton: function _updateTreeElementWithCloseButton(treeElement) {
        if (this._closeStatusButton) {
            treeElement.status = this._closeStatusButton.element;
            return;
        }

        wrappedSVGDocument(platformImagePath("Close.svg"), null, WebInspector.UIString("Close resource view"), (function (element) {
            this._closeStatusButton = new WebInspector.TreeElementStatusButton(element);
            this._closeStatusButton.addEventListener(WebInspector.TreeElementStatusButton.Event.Clicked, this._closeStatusButtonClicked, this);
            if (treeElement === this.navigationSidebarTreeOutline.selectedTreeElement) this._updateTreeElementWithCloseButton(treeElement);
        }).bind(this));
    },

    _closeStatusButtonClicked: function _closeStatusButtonClicked(event) {
        this.navigationSidebarTreeOutline.selectedTreeElement.deselect();
        WebInspector.timelineSidebarPanel.showTimelineViewForType(WebInspector.TimelineRecord.Type.Script);
    }
}, {
    navigationSidebarTreeOutlineLabel: { // Public

        get: function get() {
            return WebInspector.UIString("Records");
        },
        configurable: true,
        enumerable: true
    },
    selectionPathComponents: {
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
        },
        configurable: true,
        enumerable: true
    }
});
