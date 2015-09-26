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

WebInspector.OverviewTimelineView = (function (_WebInspector$TimelineView) {
    _inherits(OverviewTimelineView, _WebInspector$TimelineView);

    function OverviewTimelineView(recording, extraArguments) {
        _classCallCheck(this, OverviewTimelineView);

        _get(Object.getPrototypeOf(OverviewTimelineView.prototype), "constructor", this).call(this, recording, extraArguments);

        this._recording = recording;

        var columns = { "graph": { width: "100%" } };

        this._dataGrid = new WebInspector.DataGrid(columns);
        this._dataGrid.addEventListener(WebInspector.DataGrid.Event.SelectedNodeChanged, this._dataGridNodeSelected, this);
        this._dataGrid.element.classList.add("no-header");

        this._treeOutlineDataGridSynchronizer = new WebInspector.TreeOutlineDataGridSynchronizer(this.navigationSidebarTreeOutline, this._dataGrid);

        this._timelineRuler = new WebInspector.TimelineRuler();
        this._timelineRuler.allowsClippedLabels = true;
        this.element.appendChild(this._timelineRuler.element);

        this._currentTimeMarker = new WebInspector.TimelineMarker(0, WebInspector.TimelineMarker.Type.CurrentTime);
        this._timelineRuler.addMarker(this._currentTimeMarker);

        this.element.classList.add("overview");
        this.element.appendChild(this._dataGrid.element);

        this._networkTimeline = recording.timelines.get(WebInspector.TimelineRecord.Type.Network);
        this._networkTimeline.addEventListener(WebInspector.Timeline.Event.RecordAdded, this._networkTimelineRecordAdded, this);

        recording.addEventListener(WebInspector.TimelineRecording.Event.SourceCodeTimelineAdded, this._sourceCodeTimelineAdded, this);

        this._pendingRepresentedObjects = [];
    }

    // Public

    _createClass(OverviewTimelineView, [{
        key: "shown",
        value: function shown() {
            _get(Object.getPrototypeOf(OverviewTimelineView.prototype), "shown", this).call(this);

            this._treeOutlineDataGridSynchronizer.synchronize();
        }
    }, {
        key: "closed",
        value: function closed() {
            this._networkTimeline.removeEventListener(null, null, this);
            this._recording.removeEventListener(null, null, this);
        }
    }, {
        key: "updateLayout",
        value: function updateLayout() {
            _get(Object.getPrototypeOf(OverviewTimelineView.prototype), "updateLayout", this).call(this);

            var oldZeroTime = this._timelineRuler.zeroTime;
            var oldStartTime = this._timelineRuler.startTime;
            var oldEndTime = this._timelineRuler.endTime;
            var oldCurrentTime = this._currentTimeMarker.time;

            this._timelineRuler.zeroTime = this.zeroTime;
            this._timelineRuler.startTime = this.startTime;
            this._timelineRuler.endTime = this.endTime;
            this._currentTimeMarker.time = this.currentTime;

            // The TimelineDataGridNode graphs are positioned with percentages, so they auto resize with the view.
            // We only need to refresh the graphs when the any of the times change.
            if (this.zeroTime !== oldZeroTime || this.startTime !== oldStartTime || this.endTime !== oldEndTime || this.currentTime !== oldCurrentTime) {
                var dataGridNode = this._dataGrid.children[0];
                while (dataGridNode) {
                    dataGridNode.refreshGraph();
                    dataGridNode = dataGridNode.traverseNextNode(true, null, true);
                }
            }

            this._timelineRuler.updateLayout();

            this._processPendingRepresentedObjects();
        }
    }, {
        key: "reset",
        value: function reset() {
            _get(Object.getPrototypeOf(OverviewTimelineView.prototype), "reset", this).call(this);

            this._pendingRepresentedObjects = [];
        }

        // Protected

    }, {
        key: "treeElementPathComponentSelected",
        value: function treeElementPathComponentSelected(event) {
            var dataGridNode = this._treeOutlineDataGridSynchronizer.dataGridNodeForTreeElement(event.data.pathComponent.generalTreeElement);
            if (!dataGridNode) return;
            dataGridNode.revealAndSelect();
        }
    }, {
        key: "canShowContentViewForTreeElement",
        value: function canShowContentViewForTreeElement(treeElement) {
            if (treeElement instanceof WebInspector.ResourceTreeElement || treeElement instanceof WebInspector.ScriptTreeElement) return true;
            return _get(Object.getPrototypeOf(OverviewTimelineView.prototype), "canShowContentViewForTreeElement", this).call(this, treeElement);
        }
    }, {
        key: "showContentViewForTreeElement",
        value: function showContentViewForTreeElement(treeElement) {
            if (treeElement instanceof WebInspector.ResourceTreeElement || treeElement instanceof WebInspector.ScriptTreeElement) {
                WebInspector.showSourceCode(treeElement.representedObject);
                return;
            }

            if (!(treeElement instanceof WebInspector.SourceCodeTimelineTreeElement)) {
                console.error("Unknown tree element selected.");
                return;
            }

            if (!treeElement.sourceCodeTimeline.sourceCodeLocation) {
                this.timelineSidebarPanel.showTimelineOverview();
                return;
            }

            WebInspector.showOriginalOrFormattedSourceCodeLocation(treeElement.sourceCodeTimeline.sourceCodeLocation);
        }

        // Private

    }, {
        key: "_compareTreeElementsByDetails",
        value: function _compareTreeElementsByDetails(a, b) {
            if (a instanceof WebInspector.SourceCodeTimelineTreeElement && b instanceof WebInspector.ResourceTreeElement) return -1;

            if (a instanceof WebInspector.ResourceTreeElement && b instanceof WebInspector.SourceCodeTimelineTreeElement) return 1;

            if (a instanceof WebInspector.SourceCodeTimelineTreeElement && b instanceof WebInspector.SourceCodeTimelineTreeElement) {
                var aTimeline = a.sourceCodeTimeline;
                var bTimeline = b.sourceCodeTimeline;

                if (!aTimeline.sourceCodeLocation && !bTimeline.sourceCodeLocation) {
                    if (aTimeline.recordType !== bTimeline.recordType) return aTimeline.recordType.localeCompare(bTimeline.recordType);

                    return a.mainTitle.localeCompare(b.mainTitle);
                }

                if (!aTimeline.sourceCodeLocation || !bTimeline.sourceCodeLocation) return !!aTimeline.sourceCodeLocation - !!bTimeline.sourceCodeLocation;

                if (aTimeline.sourceCodeLocation.lineNumber !== bTimeline.sourceCodeLocation.lineNumber) return aTimeline.sourceCodeLocation.lineNumber - bTimeline.sourceCodeLocation.lineNumber;

                return aTimeline.sourceCodeLocation.columnNumber - bTimeline.sourceCodeLocation.columnNumber;
            }

            // Fallback to comparing by start time for ResourceTreeElement or anything else.
            return this._compareTreeElementsByStartTime(a, b);
        }
    }, {
        key: "_compareTreeElementsByStartTime",
        value: function _compareTreeElementsByStartTime(a, b) {
            function getStartTime(treeElement) {
                if (treeElement instanceof WebInspector.ResourceTreeElement) return treeElement.resource.firstTimestamp;
                if (treeElement instanceof WebInspector.SourceCodeTimelineTreeElement) return treeElement.sourceCodeTimeline.startTime;

                console.error("Unknown tree element.");
                return 0;
            }

            var result = getStartTime(a) - getStartTime(b);
            if (result) return result;

            // Fallback to comparing titles.
            return a.mainTitle.localeCompare(b.mainTitle);
        }
    }, {
        key: "_insertTreeElement",
        value: function _insertTreeElement(treeElement, parentTreeElement) {
            console.assert(treeElement);
            console.assert(!treeElement.parent);
            console.assert(parentTreeElement);

            parentTreeElement.insertChild(treeElement, insertionIndexForObjectInListSortedByFunction(treeElement, parentTreeElement.children, this._compareTreeElementsByStartTime.bind(this)));
        }
    }, {
        key: "_addResourceToTreeIfNeeded",
        value: function _addResourceToTreeIfNeeded(resource) {
            console.assert(resource);
            if (!resource) return null;

            var treeElement = this.navigationSidebarTreeOutline.findTreeElement(resource);
            if (treeElement) return treeElement;

            var parentFrame = resource.parentFrame;
            if (!parentFrame) return;

            var expandedByDefault = false;
            if (parentFrame.mainResource === resource || parentFrame.provisionalMainResource === resource) {
                parentFrame = parentFrame.parentFrame;
                expandedByDefault = !parentFrame; // Main frame expands by default.
            }

            var resourceTreeElement = new WebInspector.ResourceTreeElement(resource);
            if (expandedByDefault) resourceTreeElement.expand();

            var resourceTimelineRecord = this._networkTimeline ? this._networkTimeline.recordForResource(resource) : null;
            if (!resourceTimelineRecord) resourceTimelineRecord = new WebInspector.ResourceTimelineRecord(resource);

            var resourceDataGridNode = new WebInspector.ResourceTimelineDataGridNode(resourceTimelineRecord, true, this);
            this._treeOutlineDataGridSynchronizer.associate(resourceTreeElement, resourceDataGridNode);

            var parentTreeElement = this.navigationSidebarTreeOutline;
            if (parentFrame) {
                // Find the parent main resource, adding it if needed, to append this resource as a child.
                var parentResource = parentFrame.provisionalMainResource || parentFrame.mainResource;

                parentTreeElement = this._addResourceToTreeIfNeeded(parentResource);
                console.assert(parentTreeElement);
                if (!parentTreeElement) return;
            }

            this._insertTreeElement(resourceTreeElement, parentTreeElement);

            return resourceTreeElement;
        }
    }, {
        key: "_addSourceCodeTimeline",
        value: function _addSourceCodeTimeline(sourceCodeTimeline) {
            var parentTreeElement = sourceCodeTimeline.sourceCodeLocation ? this._addResourceToTreeIfNeeded(sourceCodeTimeline.sourceCode) : this.navigationSidebarTreeOutline;
            console.assert(parentTreeElement);
            if (!parentTreeElement) return;

            var sourceCodeTimelineTreeElement = new WebInspector.SourceCodeTimelineTreeElement(sourceCodeTimeline);
            var sourceCodeTimelineDataGridNode = new WebInspector.SourceCodeTimelineTimelineDataGridNode(sourceCodeTimeline, this);

            this._treeOutlineDataGridSynchronizer.associate(sourceCodeTimelineTreeElement, sourceCodeTimelineDataGridNode);
            this._insertTreeElement(sourceCodeTimelineTreeElement, parentTreeElement);
        }
    }, {
        key: "_processPendingRepresentedObjects",
        value: function _processPendingRepresentedObjects() {
            if (!this._pendingRepresentedObjects.length) return;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._pendingRepresentedObjects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var representedObject = _step.value;

                    if (representedObject instanceof WebInspector.Resource) this._addResourceToTreeIfNeeded(representedObject);else if (representedObject instanceof WebInspector.SourceCodeTimeline) this._addSourceCodeTimeline(representedObject);else console.error("Unknown represented object");
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

            this._pendingRepresentedObjects = [];
        }
    }, {
        key: "_networkTimelineRecordAdded",
        value: function _networkTimelineRecordAdded(event) {
            var resourceTimelineRecord = event.data.record;
            console.assert(resourceTimelineRecord instanceof WebInspector.ResourceTimelineRecord);

            this._pendingRepresentedObjects.push(resourceTimelineRecord.resource);

            this.needsLayout();

            // We don't expect to have any source code timelines yet. Those should be added with _sourceCodeTimelineAdded.
            console.assert(!this._recording.sourceCodeTimelinesForSourceCode(resourceTimelineRecord.resource).length);
        }
    }, {
        key: "_sourceCodeTimelineAdded",
        value: function _sourceCodeTimelineAdded(event) {
            var sourceCodeTimeline = event.data.sourceCodeTimeline;
            console.assert(sourceCodeTimeline);
            if (!sourceCodeTimeline) return;

            this._pendingRepresentedObjects.push(sourceCodeTimeline);

            this.needsLayout();
        }
    }, {
        key: "_dataGridNodeSelected",
        value: function _dataGridNodeSelected(event) {
            this.dispatchEventToListeners(WebInspector.ContentView.Event.SelectionPathComponentsDidChange);
        }
    }, {
        key: "navigationSidebarTreeOutlineLabel",
        get: function get() {
            return WebInspector.UIString("Timeline Events");
        }
    }, {
        key: "secondsPerPixel",
        get: function get() {
            return this._timelineRuler.secondsPerPixel;
        },
        set: function set(x) {
            this._timelineRuler.secondsPerPixel = x;
        }
    }, {
        key: "selectionPathComponents",
        get: function get() {
            var dataGridNode = this._dataGrid.selectedNode;
            if (!dataGridNode) return null;

            var pathComponents = [];

            while (dataGridNode && !dataGridNode.root) {
                var treeElement = this._treeOutlineDataGridSynchronizer.treeElementForDataGridNode(dataGridNode);
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

    return OverviewTimelineView;
})(WebInspector.TimelineView);
