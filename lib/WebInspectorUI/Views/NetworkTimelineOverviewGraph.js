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

WebInspector.NetworkTimelineOverviewGraph = (function (_WebInspector$TimelineOverviewGraph) {
    _inherits(NetworkTimelineOverviewGraph, _WebInspector$TimelineOverviewGraph);

    function NetworkTimelineOverviewGraph(timeline, timelineOverview) {
        _classCallCheck(this, NetworkTimelineOverviewGraph);

        _get(Object.getPrototypeOf(NetworkTimelineOverviewGraph.prototype), "constructor", this).call(this, timelineOverview);

        this.element.classList.add("network");

        timeline.addEventListener(WebInspector.Timeline.Event.RecordAdded, this._networkTimelineRecordAdded, this);
        timeline.addEventListener(WebInspector.Timeline.Event.TimesUpdated, this.needsLayout, this);

        this.reset();
    }

    // Public

    _createClass(NetworkTimelineOverviewGraph, [{
        key: "reset",
        value: function reset() {
            _get(Object.getPrototypeOf(NetworkTimelineOverviewGraph.prototype), "reset", this).call(this);

            this._nextDumpRow = 0;
            this._timelineRecordGridRows = [];

            for (var i = 0; i < WebInspector.NetworkTimelineOverviewGraph.MaximumRowCount; ++i) this._timelineRecordGridRows.push([]);

            this.element.removeChildren();

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._timelineRecordGridRows[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var rowRecords = _step.value;

                    rowRecords.__element = document.createElement("div");
                    rowRecords.__element.classList.add("graph-row");
                    this.element.appendChild(rowRecords.__element);

                    rowRecords.__recordBars = [];
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
    }, {
        key: "updateLayout",
        value: function updateLayout() {
            _get(Object.getPrototypeOf(NetworkTimelineOverviewGraph.prototype), "updateLayout", this).call(this);

            var secondsPerPixel = this.timelineOverview.secondsPerPixel;

            var recordBarIndex = 0;

            function createBar(rowElement, rowRecordBars, records, renderMode) {
                var timelineRecordBar = rowRecordBars[recordBarIndex];
                if (!timelineRecordBar) timelineRecordBar = rowRecordBars[recordBarIndex] = new WebInspector.TimelineRecordBar(records, renderMode);else {
                    timelineRecordBar.renderMode = renderMode;
                    timelineRecordBar.records = records;
                }
                timelineRecordBar.refresh(this);
                if (!timelineRecordBar.element.parentNode) rowElement.appendChild(timelineRecordBar.element);
                ++recordBarIndex;
            }

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._timelineRecordGridRows[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var rowRecords = _step2.value;

                    var rowElement = rowRecords.__element;
                    var rowRecordBars = rowRecords.__recordBars;

                    recordBarIndex = 0;

                    WebInspector.TimelineRecordBar.createCombinedBars(rowRecords, secondsPerPixel, this, createBar.bind(this, rowElement, rowRecordBars));

                    // Remove the remaining unused TimelineRecordBars.
                    for (; recordBarIndex < rowRecordBars.length; ++recordBarIndex) {
                        rowRecordBars[recordBarIndex].records = null;
                        rowRecordBars[recordBarIndex].element.remove();
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
        }

        // Private

    }, {
        key: "_networkTimelineRecordAdded",
        value: function _networkTimelineRecordAdded(event) {
            var resourceTimelineRecord = event.data.record;
            console.assert(resourceTimelineRecord instanceof WebInspector.ResourceTimelineRecord);

            function compareByStartTime(a, b) {
                return a.startTime - b.startTime;
            }

            // Try to find a row that has room and does not overlap a previous record.
            var foundRowForRecord = false;
            for (var i = 0; i < this._timelineRecordGridRows.length; ++i) {
                var rowRecords = this._timelineRecordGridRows[i];
                var lastRecord = rowRecords.lastValue;

                if (!lastRecord || lastRecord.endTime + WebInspector.NetworkTimelineOverviewGraph.MinimumBarPaddingTime <= resourceTimelineRecord.startTime) {
                    insertObjectIntoSortedArray(resourceTimelineRecord, rowRecords, compareByStartTime);
                    this._nextDumpRow = i + 1;
                    foundRowForRecord = true;
                    break;
                }
            }

            if (!foundRowForRecord) {
                // Try to find a row that does not overlap a previous record's active time, but it can overlap the inactive time.
                for (var i = 0; i < this._timelineRecordGridRows.length; ++i) {
                    var rowRecords = this._timelineRecordGridRows[i];
                    var lastRecord = rowRecords.lastValue;
                    console.assert(lastRecord);

                    if (lastRecord.activeStartTime + WebInspector.NetworkTimelineOverviewGraph.MinimumBarPaddingTime <= resourceTimelineRecord.startTime) {
                        insertObjectIntoSortedArray(resourceTimelineRecord, rowRecords, compareByStartTime);
                        this._nextDumpRow = i + 1;
                        foundRowForRecord = true;
                        break;
                    }
                }
            }

            // We didn't find a empty spot, so dump into the designated dump row.
            if (!foundRowForRecord) {
                if (this._nextDumpRow >= WebInspector.NetworkTimelineOverviewGraph.MaximumRowCount) this._nextDumpRow = 0;
                insertObjectIntoSortedArray(resourceTimelineRecord, this._timelineRecordGridRows[this._nextDumpRow++], compareByStartTime);
            }

            this.needsLayout();
        }
    }]);

    return NetworkTimelineOverviewGraph;
})(WebInspector.TimelineOverviewGraph);

WebInspector.NetworkTimelineOverviewGraph.MaximumRowCount = 6;
