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

WebInspector.TimelineOverviewGraph = (function (_WebInspector$Object) {
    _inherits(TimelineOverviewGraph, _WebInspector$Object);

    function TimelineOverviewGraph(timelineOverview) {
        _classCallCheck(this, TimelineOverviewGraph);

        _get(Object.getPrototypeOf(TimelineOverviewGraph.prototype), "constructor", this).call(this);

        this.element = document.createElement("div");
        this.element.classList.add("timeline-overview-graph");

        this._zeroTime = 0;
        this._startTime = 0;
        this._endTime = 5;
        this._currentTime = 0;
        this._timelineOverview = timelineOverview;
        this._selectedRecord = null;
        this._selectedRecordChanged = false;
        this._scheduledLayoutUpdateIdentifier = 0;
        this._scheduledSelectedRecordLayoutUpdateIdentifier = 0;
    }

    // Public

    _createClass(TimelineOverviewGraph, [{
        key: "shown",
        value: function shown() {
            this._visible = true;
            this.updateLayout();
        }
    }, {
        key: "hidden",
        value: function hidden() {
            this._visible = false;
        }
    }, {
        key: "reset",
        value: function reset() {
            // Implemented by sub-classes if needed.
        }
    }, {
        key: "recordWasFiltered",
        value: function recordWasFiltered(record, filtered) {
            // Implemented by sub-classes if needed.
        }
    }, {
        key: "updateLayout",
        value: function updateLayout() {
            if (this._scheduledLayoutUpdateIdentifier) {
                cancelAnimationFrame(this._scheduledLayoutUpdateIdentifier);
                this._scheduledLayoutUpdateIdentifier = 0;
            }

            // Implemented by sub-classes if needed.
        }
    }, {
        key: "updateLayoutIfNeeded",
        value: function updateLayoutIfNeeded() {
            if (!this._scheduledLayoutUpdateIdentifier) return;
            this.updateLayout();
        }

        // Protected

    }, {
        key: "needsLayout",
        value: function needsLayout() {
            if (!this._visible) return;

            if (this._scheduledLayoutUpdateIdentifier) return;

            this._scheduledLayoutUpdateIdentifier = requestAnimationFrame(this.updateLayout.bind(this));
        }
    }, {
        key: "dispatchSelectedRecordChangedEvent",
        value: function dispatchSelectedRecordChangedEvent() {
            if (!this._selectedRecordChanged) return;

            this._selectedRecordChanged = false;

            this.dispatchEventToListeners(WebInspector.TimelineOverviewGraph.Event.RecordSelected, { record: this.selectedRecord });
        }
    }, {
        key: "updateSelectedRecord",
        value: function updateSelectedRecord() {}
        // Implemented by sub-classes if needed.

        // Private

    }, {
        key: "_needsSelectedRecordLayout",
        value: function _needsSelectedRecordLayout() {
            // If layout is scheduled, abort since the selected record will be updated when layout happens.
            if (this._scheduledLayoutUpdateIdentifier) return;

            if (this._scheduledSelectedRecordLayoutUpdateIdentifier) return;

            function update() {
                this._scheduledSelectedRecordLayoutUpdateIdentifier = 0;

                this.updateSelectedRecord();
            }

            this._scheduledSelectedRecordLayoutUpdateIdentifier = requestAnimationFrame(update.bind(this));
        }
    }, {
        key: "zeroTime",
        get: function get() {
            return this._zeroTime;
        },
        set: function set(x) {
            if (this._zeroTime === x) return;

            this._zeroTime = x || 0;

            this.needsLayout();
        }
    }, {
        key: "startTime",
        get: function get() {
            return this._startTime;
        },
        set: function set(x) {
            if (this._startTime === x) return;

            this._startTime = x || 0;

            this.needsLayout();
        }
    }, {
        key: "endTime",
        get: function get() {
            return this._endTime;
        },
        set: function set(x) {
            if (this._endTime === x) return;

            this._endTime = x || 0;

            this.needsLayout();
        }
    }, {
        key: "currentTime",
        get: function get() {
            return this._currentTime;
        },
        set: function set(x) {
            if (this._currentTime === x) return;

            var oldCurrentTime = this._currentTime;

            this._currentTime = x || 0;

            if (this._startTime <= oldCurrentTime && oldCurrentTime <= this._endTime || this._startTime <= this._currentTime && this._currentTime <= this._endTime) this.needsLayout();
        }
    }, {
        key: "timelineOverview",
        get: function get() {
            return this._timelineOverview;
        }
    }, {
        key: "visible",
        get: function get() {
            return this._visible;
        }
    }, {
        key: "selectedRecord",
        get: function get() {
            return this._selectedRecord;
        },
        set: function set(x) {
            if (this._selectedRecord === x) return;

            this._selectedRecord = x;
            this._selectedRecordChanged = true;

            this._needsSelectedRecordLayout();
        }
    }], [{
        key: "createForTimeline",
        value: function createForTimeline(timeline, timelineOverview) {
            console.assert(timeline instanceof WebInspector.Timeline, timeline);
            console.assert(timelineOverview instanceof WebInspector.TimelineOverview, timelineOverview);

            var timelineType = timeline.type;
            if (timelineType === WebInspector.TimelineRecord.Type.Network) return new WebInspector.NetworkTimelineOverviewGraph(timeline, timelineOverview);

            if (timelineType === WebInspector.TimelineRecord.Type.Layout) return new WebInspector.LayoutTimelineOverviewGraph(timeline, timelineOverview);

            if (timelineType === WebInspector.TimelineRecord.Type.Script) return new WebInspector.ScriptTimelineOverviewGraph(timeline, timelineOverview);

            if (timelineType === WebInspector.TimelineRecord.Type.RenderingFrame) return new WebInspector.RenderingFrameTimelineOverviewGraph(timeline, timelineOverview);

            throw new Error("Can't make a graph for an unknown timeline.");
        }
    }]);

    return TimelineOverviewGraph;
})(WebInspector.Object);

WebInspector.TimelineOverviewGraph.Event = {
    RecordSelected: "timeline-overview-graph-record-selected"
};
