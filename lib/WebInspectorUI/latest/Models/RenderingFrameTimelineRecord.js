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

WebInspector.RenderingFrameTimelineRecord = (function (_WebInspector$TimelineRecord) {
    _inherits(RenderingFrameTimelineRecord, _WebInspector$TimelineRecord);

    function RenderingFrameTimelineRecord(startTime, endTime) {
        _classCallCheck(this, RenderingFrameTimelineRecord);

        _get(Object.getPrototypeOf(RenderingFrameTimelineRecord.prototype), "constructor", this).call(this, WebInspector.TimelineRecord.Type.RenderingFrame, startTime, endTime);

        this._durationByTaskType = new Map();
        this._frameIndex = -1;
    }

    // Static

    _createClass(RenderingFrameTimelineRecord, [{
        key: "setupFrameIndex",
        value: function setupFrameIndex() {
            console.assert(this._frameIndex === -1, "Frame index should only be set once.");
            if (this._frameIndex >= 0) return;
            this._frameIndex = WebInspector.RenderingFrameTimelineRecord._nextFrameIndex++;
        }
    }, {
        key: "durationForTask",
        value: function durationForTask(taskType) {
            if (this._durationByTaskType.has(taskType)) return this._durationByTaskType.get(taskType);

            var duration;
            if (taskType === WebInspector.RenderingFrameTimelineRecord.TaskType.Other) duration = this._calculateDurationRemainder();else {
                duration = this.children.reduce(function (previousValue, currentValue) {
                    if (taskType !== WebInspector.RenderingFrameTimelineRecord.taskTypeForTimelineRecord(currentValue)) return previousValue;

                    var currentDuration = currentValue.duration;
                    if (currentValue.usesActiveStartTime) currentDuration -= currentValue.inactiveDuration;
                    return previousValue + currentDuration;
                }, 0);

                if (taskType === WebInspector.RenderingFrameTimelineRecord.TaskType.Script) {
                    // Layout events synchronously triggered from JavaScript must be subtracted from the total
                    // script time, to prevent the time from being counted twice.
                    duration -= this.children.reduce(function (previousValue, currentValue) {
                        if (currentValue.type === WebInspector.TimelineRecord.Type.Layout && (currentValue.sourceCodeLocation || currentValue.callFrames)) return previousValue + currentValue.duration;
                        return previousValue;
                    }, 0);
                }
            }

            this._durationByTaskType.set(taskType, duration);
            return duration;
        }

        // Private

    }, {
        key: "_calculateDurationRemainder",
        value: function _calculateDurationRemainder() {
            return Object.keys(WebInspector.RenderingFrameTimelineRecord.TaskType).reduce((function (previousValue, key) {
                var taskType = WebInspector.RenderingFrameTimelineRecord.TaskType[key];
                if (taskType === WebInspector.RenderingFrameTimelineRecord.TaskType.Other) return previousValue;
                return previousValue - this.durationForTask(taskType);
            }).bind(this), this.duration);
        }
    }, {
        key: "frameIndex",

        // Public

        get: function get() {
            return this._frameIndex;
        }
    }, {
        key: "frameNumber",
        get: function get() {
            return this._frameIndex + 1;
        }
    }], [{
        key: "resetFrameIndex",
        value: function resetFrameIndex() {
            WebInspector.RenderingFrameTimelineRecord._nextFrameIndex = 0;
        }
    }, {
        key: "displayNameForTaskType",
        value: function displayNameForTaskType(taskType) {
            switch (taskType) {
                case WebInspector.RenderingFrameTimelineRecord.TaskType.Script:
                    return WebInspector.UIString("Script");
                case WebInspector.RenderingFrameTimelineRecord.TaskType.Layout:
                    return WebInspector.UIString("Layout");
                case WebInspector.RenderingFrameTimelineRecord.TaskType.Paint:
                    return WebInspector.UIString("Paint");
                case WebInspector.RenderingFrameTimelineRecord.TaskType.Other:
                    return WebInspector.UIString("Other");
            }
        }
    }, {
        key: "taskTypeForTimelineRecord",
        value: function taskTypeForTimelineRecord(record) {
            switch (record.type) {
                case WebInspector.TimelineRecord.Type.Script:
                    return WebInspector.RenderingFrameTimelineRecord.TaskType.Script;
                case WebInspector.TimelineRecord.Type.Layout:
                    if (record.eventType === WebInspector.LayoutTimelineRecord.EventType.Paint || record.eventType === WebInspector.LayoutTimelineRecord.EventType.Composite) return WebInspector.RenderingFrameTimelineRecord.TaskType.Paint;
                    return WebInspector.RenderingFrameTimelineRecord.TaskType.Layout;
                default:
                    console.error("Unsupported timeline record type: " + record.type);
                    return null;
            }
        }
    }]);

    return RenderingFrameTimelineRecord;
})(WebInspector.TimelineRecord);

WebInspector.RenderingFrameTimelineRecord.TaskType = {
    Script: "rendering-frame-timeline-record-script",
    Layout: "rendering-frame-timeline-record-layout",
    Paint: "rendering-frame-timeline-record-paint",
    Other: "rendering-frame-timeline-record-other"
};

WebInspector.RenderingFrameTimelineRecord.TypeIdentifier = "rendering-frame-timeline-record";

WebInspector.RenderingFrameTimelineRecord._nextFrameIndex = 0;
