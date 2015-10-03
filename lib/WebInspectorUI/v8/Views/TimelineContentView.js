var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

/*
 * Copyright (C) 2013 Apple Inc. All rights reserved.
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

WebInspector.TimelineContentView = function (recording) {
    WebInspector.ContentView.call(this, recording);

    this._recording = recording;

    this.element.classList.add(WebInspector.TimelineContentView.StyleClassName);

    this._discreteTimelineOverviewGraphMap = new Map();
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = recording.timelines[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _step$value = _slicedToArray(_step.value, 2);

            var identifier = _step$value[0];
            var timeline = _step$value[1];

            this._discreteTimelineOverviewGraphMap.set(timeline, new WebInspector.TimelineOverviewGraph(timeline));
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

    this._timelineOverview = new WebInspector.TimelineOverview(this._discreteTimelineOverviewGraphMap);
    this._timelineOverview.addEventListener(WebInspector.TimelineOverview.Event.TimeRangeSelectionChanged, this._timeRangeSelectionChanged, this);
    this.element.appendChild(this._timelineOverview.element);

    this._viewContainer = document.createElement("div");
    this._viewContainer.classList.add(WebInspector.TimelineContentView.ViewContainerStyleClassName);
    this.element.appendChild(this._viewContainer);

    var trashImage;
    if (WebInspector.Platform.isLegacyMacOS) trashImage = { src: "Images/Legacy/NavigationItemTrash.svg", width: 16, height: 16 };else trashImage = { src: "Images/NavigationItemTrash.svg", width: 15, height: 15 };

    this._clearTimelineNavigationItem = new WebInspector.ButtonNavigationItem("clear-timeline", WebInspector.UIString("Clear Timeline"), trashImage.src, trashImage.width, trashImage.height);
    this._clearTimelineNavigationItem.addEventListener(WebInspector.ButtonNavigationItem.Event.Clicked, this._clearTimeline, this);

    this._overviewTimelineView = new WebInspector.OverviewTimelineView(recording);

    this._discreteTimelineViewMap = new Map();
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = recording.timelines[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _step2$value = _slicedToArray(_step2.value, 2);

            var identifier = _step2$value[0];
            var timeline = _step2$value[1];

            this._discreteTimelineViewMap.set(timeline, new WebInspector.TimelineView(timeline));
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

    function createPathComponent(displayName, className, representedObject) {
        var pathComponent = new WebInspector.HierarchicalPathComponent(displayName, className, representedObject);
        pathComponent.addEventListener(WebInspector.HierarchicalPathComponent.Event.SiblingWasSelected, this._pathComponentSelected, this);
        return pathComponent;
    }

    var networkTimeline = recording.timelines.get(WebInspector.TimelineRecord.Type.Network);
    var layoutTimeline = recording.timelines.get(WebInspector.TimelineRecord.Type.Layout);
    var scriptTimeline = recording.timelines.get(WebInspector.TimelineRecord.Type.Script);

    this._pathComponentMap = new Map();
    this._pathComponentMap.set(networkTimeline, createPathComponent.call(this, WebInspector.UIString("Network Requests"), WebInspector.TimelineSidebarPanel.NetworkIconStyleClass, networkTimeline));
    this._pathComponentMap.set(layoutTimeline, createPathComponent.call(this, WebInspector.UIString("Layout & Rendering"), WebInspector.TimelineSidebarPanel.ColorsIconStyleClass, layoutTimeline));
    this._pathComponentMap.set(scriptTimeline, createPathComponent.call(this, WebInspector.UIString("JavaScript & Events"), WebInspector.TimelineSidebarPanel.ScriptIconStyleClass, scriptTimeline));

    var previousPathComponent = null;
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = this._pathComponentMap.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var pathComponent = _step3.value;

            if (previousPathComponent) {
                previousPathComponent.nextSibling = pathComponent;
                pathComponent.previousSibling = previousPathComponent;
            }

            previousPathComponent = pathComponent;
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

    this._currentTimelineView = null;
    this._currentTimelineViewIdentifier = null;

    this._updating = false;
    this._currentTime = NaN;
    this._lastUpdateTimestamp = NaN;
    this._startTimeNeedsReset = true;

    recording.addEventListener(WebInspector.TimelineRecording.Event.Reset, this._recordingReset, this);
    recording.addEventListener(WebInspector.TimelineRecording.Event.Unloaded, this._recordingUnloaded, this);

    WebInspector.timelineManager.addEventListener(WebInspector.TimelineManager.Event.CapturingStarted, this._capturingStarted, this);
    WebInspector.timelineManager.addEventListener(WebInspector.TimelineManager.Event.CapturingStopped, this._capturingStopped, this);

    this.showOverviewTimelineView();
};

WebInspector.TimelineContentView.StyleClassName = "timeline";
WebInspector.TimelineContentView.ViewContainerStyleClassName = "view-container";

WebInspector.TimelineContentView.SelectedTimelineTypeCookieKey = "timeline-content-view-selected-timeline-type";
WebInspector.TimelineContentView.OverviewTimelineViewCookieValue = "timeline-content-view-overview-timeline-view";

WebInspector.TimelineContentView.prototype = Object.defineProperties({
    constructor: WebInspector.TimelineContentView,
    __proto__: WebInspector.ContentView.prototype,

    // Public

    showOverviewTimelineView: function showOverviewTimelineView() {
        this._showTimelineView(this._overviewTimelineView);
    },

    showTimelineViewForTimeline: function showTimelineViewForTimeline(timeline) {
        console.assert(timeline instanceof WebInspector.Timeline, timeline);
        console.assert(this._discreteTimelineViewMap.has(timeline), timeline);
        if (!this._discreteTimelineViewMap.has(timeline)) return;

        this._showTimelineView(this._discreteTimelineViewMap.get(timeline));
    },

    shown: function shown() {
        if (!this._currentTimelineView) return;

        this._currentTimelineView.shown();
        this._clearTimelineNavigationItem.enabled = this._recording.isWritable();
    },

    hidden: function hidden() {
        if (!this._currentTimelineView) return;

        this._currentTimelineView.hidden();
    },

    updateLayout: function updateLayout() {
        this._timelineOverview.updateLayoutForResize();

        if (!this._currentTimelineView) return;

        this._currentTimelineView.updateLayout();
    },

    saveToCookie: function saveToCookie(cookie) {
        cookie.type = WebInspector.ContentViewCookieType.Timelines;

        if (!this._currentTimelineView || this._currentTimelineView === this._overviewTimelineView) cookie[WebInspector.TimelineContentView.SelectedTimelineTypeCookieKey] = WebInspector.TimelineContentView.OverviewTimelineViewCookieValue;else cookie[WebInspector.TimelineContentView.SelectedTimelineTypeCookieKey] = this._currentTimelineView.representedObject.type;
    },

    restoreFromCookie: function restoreFromCookie(cookie) {
        var timelineType = cookie[WebInspector.TimelineContentView.SelectedTimelineTypeCookieKey];

        if (timelineType === WebInspector.TimelineContentView.OverviewTimelineViewCookieValue) this.showOverviewTimelineView();else this.showTimelineViewForTimeline(this.representedObject.timelines.get(timelineType));
    },

    matchTreeElementAgainstCustomFilters: function matchTreeElementAgainstCustomFilters(treeElement) {
        if (this._currentTimelineView && !this._currentTimelineView.matchTreeElementAgainstCustomFilters(treeElement)) return false;

        var startTime = this._timelineOverview.selectionStartTime;
        var endTime = this._timelineOverview.selectionStartTime + this._timelineOverview.selectionDuration;
        var currentTime = this._currentTime || this._recording.startTime;

        function checkTimeBounds(itemStartTime, itemEndTime) {
            itemStartTime = itemStartTime || currentTime;
            itemEndTime = itemEndTime || currentTime;

            return startTime <= itemEndTime && itemStartTime <= endTime;
        }

        if (treeElement instanceof WebInspector.ResourceTreeElement) {
            var resource = treeElement.resource;
            return checkTimeBounds(resource.requestSentTimestamp, resource.finishedOrFailedTimestamp);
        }

        if (treeElement instanceof WebInspector.SourceCodeTimelineTreeElement) {
            var sourceCodeTimeline = treeElement.sourceCodeTimeline;

            // Do a quick check of the timeline bounds before we check each record.
            if (!checkTimeBounds(sourceCodeTimeline.startTime, sourceCodeTimeline.endTime)) return false;

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = sourceCodeTimeline.records[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var record = _step4.value;

                    if (checkTimeBounds(record.startTime, record.endTime)) return true;
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

            return false;
        }

        if (treeElement instanceof WebInspector.ProfileNodeTreeElement) {
            var profileNode = treeElement.profileNode;
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = profileNode.calls[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var call = _step5.value;

                    if (checkTimeBounds(call.startTime, call.endTime)) return true;
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

            return false;
        }

        if (treeElement instanceof WebInspector.TimelineRecordTreeElement) {
            var record = treeElement.record;
            return checkTimeBounds(record.startTime, record.endTime);
        }

        console.error("Unknown TreeElement, can't filter by time.");
        return true;
    },

    // Private

    _pathComponentSelected: function _pathComponentSelected(event) {
        WebInspector.timelineSidebarPanel.showTimelineViewForType(event.data.pathComponent.representedObject.type);
    },

    _timelineViewSelectionPathComponentsDidChange: function _timelineViewSelectionPathComponentsDidChange() {
        this.dispatchEventToListeners(WebInspector.ContentView.Event.SelectionPathComponentsDidChange);
    },

    _showTimelineView: function _showTimelineView(timelineView) {
        console.assert(timelineView instanceof WebInspector.TimelineView);
        console.assert(timelineView.representedObject === this._recording || this._recording.timelines.has(timelineView.representedObject.type));

        // If the content view is shown and then hidden, we must reattach the content tree outline and timeline view.
        if (timelineView.visible && timelineView === this._currentTimelineView) return;

        if (this._currentTimelineView) {
            this._currentTimelineView.removeEventListener(WebInspector.TimelineView.Event.SelectionPathComponentsDidChange, this._timelineViewSelectionPathComponentsDidChange, this);

            this._currentTimelineView.hidden();
            this._currentTimelineView.element.remove();
        }

        this._currentTimelineView = timelineView;

        WebInspector.timelineSidebarPanel.contentTreeOutline = timelineView && timelineView.navigationSidebarTreeOutline;
        WebInspector.timelineSidebarPanel.contentTreeOutlineLabel = timelineView && timelineView.navigationSidebarTreeOutlineLabel;

        if (this._currentTimelineView) {
            this._currentTimelineView.addEventListener(WebInspector.TimelineView.Event.SelectionPathComponentsDidChange, this._timelineViewSelectionPathComponentsDidChange, this);

            this._viewContainer.appendChild(this._currentTimelineView.element);

            this._currentTimelineView.startTime = this._timelineOverview.selectionStartTime;
            this._currentTimelineView.endTime = this._timelineOverview.selectionStartTime + this._timelineOverview.selectionDuration;
            this._currentTimelineView.currentTime = this._currentTime;

            this._currentTimelineView.shown();
            this._currentTimelineView.updateLayout();
        }

        this.dispatchEventToListeners(WebInspector.ContentView.Event.SelectionPathComponentsDidChange);
    },

    _update: function _update(timestamp) {
        if (this._waitingToResetCurrentTime) {
            requestAnimationFrame(this._updateCallback);
            return;
        }

        var startTime = this._recording.startTime;
        var currentTime = this._currentTime || startTime;
        var endTime = this._recording.endTime;
        var timespanSinceLastUpdate = (timestamp - this._lastUpdateTimestamp) / 1000 || 0;

        currentTime += timespanSinceLastUpdate;

        this._updateTimes(startTime, currentTime, endTime);

        // Only stop updating if the current time is greater than the end time.
        if (!this._updating && currentTime >= endTime) {
            this._lastUpdateTimestamp = NaN;
            return;
        }

        this._lastUpdateTimestamp = timestamp;

        requestAnimationFrame(this._updateCallback);
    },

    _updateTimes: function _updateTimes(startTime, currentTime, endTime) {
        if (this._startTimeNeedsReset && !isNaN(startTime)) {
            var selectionOffset = this._timelineOverview.selectionStartTime - this._timelineOverview.startTime;

            this._timelineOverview.startTime = startTime;
            this._timelineOverview.selectionStartTime = startTime + selectionOffset;

            this._overviewTimelineView.zeroTime = startTime;
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = this._discreteTimelineViewMap.values()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var timelineView = _step6.value;

                    timelineView.zeroTime = startTime;
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

            delete this._startTimeNeedsReset;
        }

        this._timelineOverview.endTime = Math.max(endTime, currentTime);

        this._currentTime = currentTime;
        this._timelineOverview.currentTime = currentTime;
        this._currentTimelineView.currentTime = currentTime;

        // Force a layout now since we are already in an animation frame and don't need to delay it until the next.
        this._timelineOverview.updateLayoutIfNeeded();
        this._currentTimelineView.updateLayoutIfNeeded();
    },

    _startUpdatingCurrentTime: function _startUpdatingCurrentTime() {
        console.assert(!this._updating);
        if (this._updating) return;

        if (!isNaN(this._currentTime)) {
            // We have a current time already, so we likely need to jump into the future to a better current time.
            // This happens when you stop and later restart recording.
            console.assert(!this._waitingToResetCurrentTime);
            this._waitingToResetCurrentTime = true;
            this._recording.addEventListener(WebInspector.TimelineRecording.Event.TimesUpdated, this._recordingTimesUpdated, this);
        }

        this._updating = true;

        if (!this._updateCallback) this._updateCallback = this._update.bind(this);

        requestAnimationFrame(this._updateCallback);
    },

    _stopUpdatingCurrentTime: function _stopUpdatingCurrentTime() {
        console.assert(this._updating);
        this._updating = false;

        if (this._waitingToResetCurrentTime) {
            // Did not get any event while waiting for the current time, but we should stop waiting.
            this._recording.removeEventListener(WebInspector.TimelineRecording.Event.TimesUpdated, this._recordingTimesUpdated, this);
            this._waitingToResetCurrentTime = false;
        }
    },

    _capturingStarted: function _capturingStarted(event) {
        this._startUpdatingCurrentTime();
    },

    _capturingStopped: function _capturingStopped(event) {
        this._stopUpdatingCurrentTime();
    },

    _recordingTimesUpdated: function _recordingTimesUpdated(event) {
        if (!this._waitingToResetCurrentTime) return;

        // Make the current time be the start time of the last added record. This is the best way
        // currently to jump to the right period of time after recording starts.
        // FIXME: If no activity is happening we can sit for a while until a record is added.
        // We might want to have the backend send a "start" record to get current time moving.

        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
            for (var _iterator7 = this._recording.timelines.values()[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                var timeline = _step7.value;

                var lastRecord = timeline.records.lastValue;
                if (!lastRecord) continue;
                this._currentTime = Math.max(this._currentTime, lastRecord.startTime);
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

        this._recording.removeEventListener(WebInspector.TimelineRecording.Event.TimesUpdated, this._recordingTimesUpdated, this);
        this._waitingToResetCurrentTime = false;
    },

    _clearTimeline: function _clearTimeline(event) {
        this._recording.reset();
    },

    _recordingReset: function _recordingReset(event) {
        this._currentTime = NaN;

        if (!this._updating) {
            // Force the time ruler and views to reset to 0.
            this._startTimeNeedsReset = true;
            this._updateTimes(0, 0, 0);
        }

        this._lastUpdateTimestamp = NaN;
        this._startTimeNeedsReset = true;

        this._recording.removeEventListener(WebInspector.TimelineRecording.Event.TimesUpdated, this._recordingTimesUpdated, this);
        this._waitingToResetCurrentTime = false;

        this._overviewTimelineView.reset();
        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
            for (var _iterator8 = this._discreteTimelineViewMap.values()[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                var timelineView = _step8.value;

                timelineView.reset();
            }
        } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion8 && _iterator8["return"]) {
                    _iterator8["return"]();
                }
            } finally {
                if (_didIteratorError8) {
                    throw _iteratorError8;
                }
            }
        }

        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
            for (var _iterator9 = this._discreteTimelineOverviewGraphMap.values()[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                var timelineOverviewGraph = _step9.value;

                timelineOverviewGraph.reset();
            }
        } catch (err) {
            _didIteratorError9 = true;
            _iteratorError9 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion9 && _iterator9["return"]) {
                    _iterator9["return"]();
                }
            } finally {
                if (_didIteratorError9) {
                    throw _iteratorError9;
                }
            }
        }
    },

    _recordingUnloaded: function _recordingUnloaded(event) {
        console.assert(!this._updating);

        WebInspector.timelineManager.removeEventListener(WebInspector.TimelineManager.Event.CapturingStarted, this._capturingStarted, this);
        WebInspector.timelineManager.removeEventListener(WebInspector.TimelineManager.Event.CapturingStopped, this._capturingStopped, this);
    },

    _timeRangeSelectionChanged: function _timeRangeSelectionChanged(event) {
        this._currentTimelineView.startTime = this._timelineOverview.selectionStartTime;
        this._currentTimelineView.endTime = this._timelineOverview.selectionStartTime + this._timelineOverview.selectionDuration;

        // Delay until the next frame to stay in sync with the current timeline view's time-based layout changes.
        requestAnimationFrame((function () {
            var selectedTreeElement = this._currentTimelineView && this._currentTimelineView.navigationSidebarTreeOutline ? this._currentTimelineView.navigationSidebarTreeOutline.selectedTreeElement : null;
            var selectionWasHidden = selectedTreeElement && selectedTreeElement.hidden;

            WebInspector.timelineSidebarPanel.updateFilter();

            if (selectedTreeElement && selectedTreeElement.hidden !== selectionWasHidden) this.dispatchEventToListeners(WebInspector.ContentView.Event.SelectionPathComponentsDidChange);
        }).bind(this));
    }
}, {
    allowedNavigationSidebarPanels: {
        get: function get() {
            return ["timeline"];
        },
        configurable: true,
        enumerable: true
    },
    supportsSplitContentBrowser: {
        get: function get() {
            // The layout of the overview and split content browser don't work well.
            return false;
        },
        configurable: true,
        enumerable: true
    },
    selectionPathComponents: {
        get: function get() {
            var pathComponents = [];
            if (this._currentTimelineView.representedObject instanceof WebInspector.Timeline) pathComponents.push(this._pathComponentMap.get(this._currentTimelineView.representedObject));
            pathComponents = pathComponents.concat(this._currentTimelineView.selectionPathComponents || []);
            return pathComponents;
        },
        configurable: true,
        enumerable: true
    },
    navigationItems: {
        get: function get() {
            return [this._clearTimelineNavigationItem];
        },
        configurable: true,
        enumerable: true
    },
    currentTimelineView: {
        get: function get() {
            return this._currentTimelineView;
        },
        configurable: true,
        enumerable: true
    }
});
