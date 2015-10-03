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

WebInspector.NetworkTimelineView = function (timeline) {
    WebInspector.TimelineView.call(this, timeline);

    console.assert(timeline.type === WebInspector.TimelineRecord.Type.Network);

    this.navigationSidebarTreeOutline.onselect = this._treeElementSelected.bind(this);
    this.navigationSidebarTreeOutline.ondeselect = this._treeElementDeselected.bind(this);
    this.navigationSidebarTreeOutline.element.classList.add(WebInspector.NavigationSidebarPanel.HideDisclosureButtonsStyleClassName);
    this.navigationSidebarTreeOutline.element.classList.add(WebInspector.NetworkTimelineView.TreeOutlineStyleClassName);

    var columns = { domain: {}, type: {}, method: {}, scheme: {}, statusCode: {}, cached: {}, size: {}, transferSize: {}, requestSent: {}, latency: {}, duration: {} };

    columns.domain.title = WebInspector.UIString("Domain");
    columns.domain.width = "10%";

    columns.type.title = WebInspector.UIString("Type");
    columns.type.width = "8%";
    columns.type.scopeBar = WebInspector.TimelineDataGrid.createColumnScopeBar("network", WebInspector.Resource.Type);

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

    this.element.classList.add(WebInspector.NetworkTimelineView.StyleClassName);
    this.element.appendChild(this._dataGrid.element);

    timeline.addEventListener(WebInspector.Timeline.Event.RecordAdded, this._networkTimelineRecordAdded, this);

    this._pendingRecords = [];
};

WebInspector.NetworkTimelineView.StyleClassName = "network";
WebInspector.NetworkTimelineView.TreeOutlineStyleClassName = "network";

WebInspector.NetworkTimelineView.prototype = Object.defineProperties({
    constructor: WebInspector.NetworkTimelineView,
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

    // Private

    _processPendingRecords: function _processPendingRecords() {
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
    },

    _networkTimelineRecordAdded: function _networkTimelineRecordAdded(event) {
        var resourceTimelineRecord = event.data.record;
        console.assert(resourceTimelineRecord instanceof WebInspector.ResourceTimelineRecord);

        this._pendingRecords.push(resourceTimelineRecord);

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

        if (treeElement instanceof WebInspector.ResourceTreeElement || treeElement instanceof WebInspector.ScriptTreeElement) {
            WebInspector.resourceSidebarPanel.showSourceCode(treeElement.representedObject);
            this._updateTreeElementWithCloseButton(treeElement);
            return;
        }

        console.error("Unknown tree element selected.");
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
        WebInspector.timelineSidebarPanel.showTimelineViewForType(WebInspector.TimelineRecord.Type.Network);
    }
}, {
    navigationSidebarTreeOutlineLabel: { // Public

        get: function get() {
            return WebInspector.UIString("Resources");
        },
        configurable: true,
        enumerable: true
    }
});
