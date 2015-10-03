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

WebInspector.Timeline = function (type) {
    if (this.constructor === WebInspector.Timeline) {
        // When instantiated directly, potentially return an instance of a concrete subclass.
        if (type === WebInspector.TimelineRecord.Type.Network) return new WebInspector.NetworkTimeline(type);
    }

    WebInspector.Object.call(this);

    this._type = type;

    this.reset(true);
};

WebInspector.Timeline.Event = {
    Reset: "timeline-reset",
    RecordAdded: "timeline-record-added",
    TimesUpdated: "timeline-times-updated"
};

WebInspector.Timeline.prototype = Object.defineProperties({
    constructor: WebInspector.Timeline,
    __proto__: WebInspector.Object.prototype,

    reset: function reset(suppressEvents) {
        this._records = [];
        this._startTime = NaN;
        this._endTime = NaN;

        if (!suppressEvents) {
            this.dispatchEventToListeners(WebInspector.Timeline.Event.Reset);
            this.dispatchEventToListeners(WebInspector.Timeline.Event.TimesUpdated);
        }
    },

    addRecord: function addRecord(record) {
        if (record.updatesDynamically) record.addEventListener(WebInspector.TimelineRecord.Event.Updated, this._recordUpdated, this);

        this._records.push(record);

        this._updateTimesIfNeeded(record);

        this.dispatchEventToListeners(WebInspector.Timeline.Event.RecordAdded, { record: record });
    },

    // Private

    _updateTimesIfNeeded: function _updateTimesIfNeeded(record) {
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
    },

    _recordUpdated: function _recordUpdated(event) {
        this._updateTimesIfNeeded(event.target);
    }
}, {
    startTime: { // Public

        get: function get() {
            return this._startTime;
        },
        configurable: true,
        enumerable: true
    },
    endTime: {
        get: function get() {
            return this._endTime;
        },
        configurable: true,
        enumerable: true
    },
    records: {
        get: function get() {
            return this._records;
        },
        configurable: true,
        enumerable: true
    },
    type: {
        get: function get() {
            return this._type;
        },
        configurable: true,
        enumerable: true
    }
});
