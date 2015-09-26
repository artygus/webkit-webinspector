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

WebInspector.ConsoleMessage = (function (_WebInspector$Object) {
    _inherits(ConsoleMessage, _WebInspector$Object);

    function ConsoleMessage(source, level, message, type, url, line, column, repeatCount, parameters, stackTrace, request) {
        _classCallCheck(this, ConsoleMessage);

        _get(Object.getPrototypeOf(ConsoleMessage.prototype), "constructor", this).call(this);

        console.assert(typeof source === "string");
        console.assert(typeof level === "string");
        console.assert(typeof message === "string");
        console.assert(!parameters || parameters.every(function (x) {
            return x instanceof WebInspector.RemoteObject;
        }));

        this._source = source;
        this._level = level;
        this._messageText = message;
        this._type = type || WebInspector.ConsoleMessage.MessageType.Log;
        this._url = url || null;
        this._line = line || 0;
        this._column = column || 0;

        this._repeatCount = repeatCount || 0;
        this._parameters = parameters;

        this._stackTrace = WebInspector.StackTrace.fromPayload(stackTrace || []);

        this._request = request;
    }

    // Public

    _createClass(ConsoleMessage, [{
        key: "source",
        get: function get() {
            return this._source;
        }
    }, {
        key: "level",
        get: function get() {
            return this._level;
        }
    }, {
        key: "messageText",
        get: function get() {
            return this._messageText;
        }
    }, {
        key: "type",
        get: function get() {
            return this._type;
        }
    }, {
        key: "url",
        get: function get() {
            return this._url;
        }
    }, {
        key: "line",
        get: function get() {
            return this._line;
        }
    }, {
        key: "column",
        get: function get() {
            return this._column;
        }
    }, {
        key: "repeatCount",
        get: function get() {
            return this._repeatCount;
        }
    }, {
        key: "parameters",
        get: function get() {
            return this._parameters;
        }
    }, {
        key: "stackTrace",
        get: function get() {
            return this._stackTrace;
        }
    }, {
        key: "request",
        get: function get() {
            return this._request;
        }
    }]);

    return ConsoleMessage;
})(WebInspector.Object);

WebInspector.ConsoleMessage.MessageSource = {
    HTML: "html",
    XML: "xml",
    JS: "javascript",
    Network: "network",
    ConsoleAPI: "console-api",
    Storage: "storage",
    Appcache: "appcache",
    Rendering: "rendering",
    CSS: "css",
    Security: "security",
    Other: "other"
};

WebInspector.ConsoleMessage.MessageType = {
    Log: "log",
    Dir: "dir",
    DirXML: "dirxml",
    Table: "table",
    Trace: "trace",
    StartGroup: "startGroup",
    StartGroupCollapsed: "startGroupCollapsed",
    EndGroup: "endGroup",
    Assert: "assert",
    Timing: "timing",
    Profile: "profile",
    ProfileEnd: "profileEnd",
    Result: "result" };

// Frontend Only.
WebInspector.ConsoleMessage.MessageLevel = {
    Log: "log",
    Info: "info",
    Warning: "warning",
    Error: "error",
    Debug: "debug"
};
