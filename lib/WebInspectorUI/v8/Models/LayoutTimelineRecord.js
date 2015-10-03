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

WebInspector.LayoutTimelineRecord = function (eventType, startTime, endTime, callFrames, sourceCodeLocation, x, y, width, height, quad) {
    WebInspector.TimelineRecord.call(this, WebInspector.TimelineRecord.Type.Layout, startTime, endTime, callFrames, sourceCodeLocation);

    console.assert(eventType);

    if (eventType in WebInspector.LayoutTimelineRecord.EventType) eventType = WebInspector.LayoutTimelineRecord.EventType[eventType];

    this._eventType = eventType;
    this._x = typeof x === "number" ? x : NaN;
    this._y = typeof y === "number" ? y : NaN;
    this._width = typeof width === "number" ? width : NaN;
    this._height = typeof height === "number" ? height : NaN;
    this._quad = quad instanceof WebInspector.Quad ? quad : null;
};

WebInspector.LayoutTimelineRecord.EventType = {
    InvalidateStyles: "layout-timeline-record-invalidate-styles",
    RecalculateStyles: "layout-timeline-record-recalculate-styles",
    InvalidateLayout: "layout-timeline-record-invalidate-layout",
    ForcedLayout: "layout-timeline-record-forced-layout",
    Layout: "layout-timeline-record-layout",
    Paint: "layout-timeline-record-paint"
};

WebInspector.LayoutTimelineRecord.EventType.displayName = function (eventType) {
    switch (eventType) {
        case WebInspector.LayoutTimelineRecord.EventType.InvalidateStyles:
            return WebInspector.UIString("Styles Invalidated");
        case WebInspector.LayoutTimelineRecord.EventType.RecalculateStyles:
            return WebInspector.UIString("Styles Recalculated");
        case WebInspector.LayoutTimelineRecord.EventType.InvalidateLayout:
            return WebInspector.UIString("Layout Invalidated");
        case WebInspector.LayoutTimelineRecord.EventType.ForcedLayout:
            return WebInspector.UIString("Forced Layout");
        case WebInspector.LayoutTimelineRecord.EventType.Layout:
            return WebInspector.UIString("Layout");
        case WebInspector.LayoutTimelineRecord.EventType.Paint:
            return WebInspector.UIString("Paint");
    }
};

WebInspector.LayoutTimelineRecord.TypeIdentifier = "layout-timeline-record";
WebInspector.LayoutTimelineRecord.EventTypeCookieKey = "layout-timeline-record-event-type";

WebInspector.LayoutTimelineRecord.prototype = Object.defineProperties({
    constructor: WebInspector.LayoutTimelineRecord,

    saveIdentityToCookie: function saveIdentityToCookie(cookie) {
        WebInspector.TimelineRecord.prototype.saveIdentityToCookie.call(this, cookie);

        cookie[WebInspector.LayoutTimelineRecord.EventTypeCookieKey] = this._eventType;
    }
}, {
    eventType: { // Public

        get: function get() {
            return this._eventType;
        },
        configurable: true,
        enumerable: true
    },
    x: {
        get: function get() {
            return this._x;
        },
        configurable: true,
        enumerable: true
    },
    y: {
        get: function get() {
            return this._y;
        },
        configurable: true,
        enumerable: true
    },
    width: {
        get: function get() {
            return this._width;
        },
        configurable: true,
        enumerable: true
    },
    height: {
        get: function get() {
            return this._height;
        },
        configurable: true,
        enumerable: true
    },
    area: {
        get: function get() {
            return this._width * this._height;
        },
        configurable: true,
        enumerable: true
    },
    rect: {
        get: function get() {
            if (!isNaN(this._x) && !isNaN(this._y)) return new WebInspector.Rect(this._x, this._y, this._width, this._height);
            return null;
        },
        configurable: true,
        enumerable: true
    },
    quad: {
        get: function get() {
            return this._quad;
        },
        configurable: true,
        enumerable: true
    }
});

WebInspector.LayoutTimelineRecord.prototype.__proto__ = WebInspector.TimelineRecord.prototype;
