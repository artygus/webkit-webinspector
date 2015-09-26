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

WebInspector.TimelineRecord = (function (_WebInspector$Object) {
    _inherits(TimelineRecord, _WebInspector$Object);

    function TimelineRecord(type, startTime, endTime, callFrames, sourceCodeLocation) {
        _classCallCheck(this, TimelineRecord);

        _get(Object.getPrototypeOf(TimelineRecord.prototype), "constructor", this).call(this);

        console.assert(type);

        if (type in WebInspector.TimelineRecord.Type) type = WebInspector.TimelineRecord.Type[type];

        this._type = type;
        this._startTime = startTime || NaN;
        this._endTime = endTime || NaN;
        this._callFrames = callFrames || null;
        this._sourceCodeLocation = sourceCodeLocation || null;
        this._children = [];
    }

    // Public

    _createClass(TimelineRecord, [{
        key: "saveIdentityToCookie",
        value: function saveIdentityToCookie(cookie) {
            cookie[WebInspector.TimelineRecord.SourceCodeURLCookieKey] = this._sourceCodeLocation ? this._sourceCodeLocation.sourceCode.url ? this._sourceCodeLocation.sourceCode.url.hash : null : null;
            cookie[WebInspector.TimelineRecord.SourceCodeLocationLineCookieKey] = this._sourceCodeLocation ? this._sourceCodeLocation.lineNumber : null;
            cookie[WebInspector.TimelineRecord.SourceCodeLocationColumnCookieKey] = this._sourceCodeLocation ? this._sourceCodeLocation.columnNumber : null;
            cookie[WebInspector.TimelineRecord.TypeCookieKey] = this._type || null;
        }
    }, {
        key: "type",
        get: function get() {
            return this._type;
        }
    }, {
        key: "startTime",
        get: function get() {
            // Implemented by subclasses if needed.
            return this._startTime;
        }
    }, {
        key: "activeStartTime",
        get: function get() {
            // Implemented by subclasses if needed.
            return this._startTime;
        }
    }, {
        key: "endTime",
        get: function get() {
            // Implemented by subclasses if needed.
            return this._endTime;
        }
    }, {
        key: "duration",
        get: function get() {
            // Use the getters instead of the properties so this works for subclasses that override the getters.
            return this.endTime - this.startTime;
        }
    }, {
        key: "inactiveDuration",
        get: function get() {
            // Use the getters instead of the properties so this works for subclasses that override the getters.
            return this.activeStartTime - this.startTime;
        }
    }, {
        key: "activeDuration",
        get: function get() {
            // Use the getters instead of the properties so this works for subclasses that override the getters.
            return this.endTime - this.activeStartTime;
        }
    }, {
        key: "updatesDynamically",
        get: function get() {
            // Implemented by subclasses if needed.
            return false;
        }
    }, {
        key: "usesActiveStartTime",
        get: function get() {
            // Implemented by subclasses if needed.
            return false;
        }
    }, {
        key: "callFrames",
        get: function get() {
            return this._callFrames;
        }
    }, {
        key: "initiatorCallFrame",
        get: function get() {
            if (!this._callFrames || !this._callFrames.length) return null;

            // Return the first non-native code call frame as the initiator.
            for (var i = 0; i < this._callFrames.length; ++i) {
                if (this._callFrames[i].nativeCode) continue;
                return this._callFrames[i];
            }

            return null;
        }
    }, {
        key: "sourceCodeLocation",
        get: function get() {
            return this._sourceCodeLocation;
        }
    }, {
        key: "parent",
        get: function get() {
            return this._parent;
        },
        set: function set(x) {
            if (this._parent === x) return;

            this._parent = x;
        }
    }, {
        key: "children",
        get: function get() {
            return this._children;
        }
    }]);

    return TimelineRecord;
})(WebInspector.Object);

WebInspector.TimelineRecord.Event = {
    Updated: "timeline-record-updated"
};

WebInspector.TimelineRecord.Type = {
    Network: "timeline-record-type-network",
    Layout: "timeline-record-type-layout",
    Script: "timeline-record-type-script",
    RenderingFrame: "timeline-record-type-rendering-frame"
};

WebInspector.TimelineRecord.TypeIdentifier = "timeline-record";
WebInspector.TimelineRecord.SourceCodeURLCookieKey = "timeline-record-source-code-url";
WebInspector.TimelineRecord.SourceCodeLocationLineCookieKey = "timeline-record-source-code-location-line";
WebInspector.TimelineRecord.SourceCodeLocationColumnCookieKey = "timeline-record-source-code-location-column";
WebInspector.TimelineRecord.TypeCookieKey = "timeline-record-type";
