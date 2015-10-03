var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

WebInspector.Timeline = (function (_WebInspector$Object) {
    _inherits(Timeline, _WebInspector$Object);

    function Timeline(type, recording) {
        _classCallCheck(this, Timeline);

        _get(Object.getPrototypeOf(Timeline.prototype), "constructor", this).call(this);

        this._type = type;
        this._recording = recording;

        this.reset(true);
    }

    // Static

    _createClass(Timeline, [{
        key: "reset",
        value: function reset(suppressEvents) {
            this._records = [];
            this._startTime = NaN;
            this._endTime = NaN;

            if (!suppressEvents) {
                this.dispatchEventToListeners(WebInspector.Timeline.Event.TimesUpdated);
                this.dispatchEventToListeners(WebInspector.Timeline.Event.Reset);
            }
        }
    }, {
        key: "addRecord",
        value: function addRecord(record) {
            if (record.updatesDynamically) record.addEventListener(WebInspector.TimelineRecord.Event.Updated, this._recordUpdated, this);

            this._records.push(record);

            this._updateTimesIfNeeded(record);

            this.dispatchEventToListeners(WebInspector.Timeline.Event.RecordAdded, { record: record });
        }
    }, {
        key: "saveIdentityToCookie",
        value: function saveIdentityToCookie(cookie) {
            cookie[WebInspector.Timeline.TimelineTypeCookieKey] = this._type;
        }

        // Private

    }, {
        key: "_updateTimesIfNeeded",
        value: function _updateTimesIfNeeded(record) {
            var changed = false;

            if (isNaN(this._startTime) || record.startTime < this._startTime) {
                this._startTime = record.startTime;
                changed = true;
            }

            if (isNaN(this._endTime) || this._endTime < record.endTime) {
                this._endTime = record.endTime;
                changed = true;
            }

            if (changed) this.dispatchEventToListeners(WebInspector.Timeline.Event.TimesUpdated);
        }
    }, {
        key: "_recordUpdated",
        value: function _recordUpdated(event) {
            this._updateTimesIfNeeded(event.target);
        }
    }, {
        key: "startTime",

        // Public

        get: function get() {
            return this._startTime;
        }
    }, {
        key: "endTime",
        get: function get() {
            return this._endTime;
        }
    }, {
        key: "records",
        get: function get() {
            return this._records;
        }
    }, {
        key: "type",
        get: function get() {
            return this._type;
        }
    }, {
        key: "recording",
        get: function get() {
            return this._recording;
        }
    }, {
        key: "displayName",
        get: function get() {
            if (this._type === WebInspector.TimelineRecord.Type.Network) return WebInspector.UIString("Network Requests");
            if (this._type === WebInspector.TimelineRecord.Type.Layout) return WebInspector.UIString("Layout & Rendering");
            if (this._type === WebInspector.TimelineRecord.Type.Script) return WebInspector.UIString("JavaScript & Events");
            if (this._type === WebInspector.TimelineRecord.Type.RenderingFrame) return WebInspector.UIString("Rendering Frames");

            console.error("Timeline has unknown type:", this._type, this);
        }
    }, {
        key: "iconClassName",
        get: function get() {
            if (this._type === WebInspector.TimelineRecord.Type.Network) return WebInspector.TimelineSidebarPanel.NetworkIconStyleClass;
            if (this._type === WebInspector.TimelineRecord.Type.Layout) return WebInspector.TimelineSidebarPanel.ColorsIconStyleClass;
            if (this._type === WebInspector.TimelineRecord.Type.Script) return WebInspector.TimelineSidebarPanel.ScriptIconStyleClass;
            if (this._type === WebInspector.TimelineRecord.Type.RenderingFrame) return WebInspector.TimelineSidebarPanel.RenderingFrameIconStyleClass;

            console.error("Timeline has unknown type:", this._type, this);
        }
    }], [{
        key: "create",
        value: function create(type, recording) {
            if (type === WebInspector.TimelineRecord.Type.Network) return new WebInspector.NetworkTimeline(type, recording);

            return new WebInspector.Timeline(type, recording);
        }
    }]);

    return Timeline;
})(WebInspector.Object);

WebInspector.Timeline.Event = {
    Reset: "timeline-reset",
    RecordAdded: "timeline-record-added",
    TimesUpdated: "timeline-times-updated"
};

WebInspector.Timeline.TimelineTypeCookieKey = "timeline-type";
