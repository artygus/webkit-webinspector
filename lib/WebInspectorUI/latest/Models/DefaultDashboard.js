var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2013, 2014 Apple Inc. All rights reserved.
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
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

WebInspector.DefaultDashboard = (function (_WebInspector$Object) {
    _inherits(DefaultDashboard, _WebInspector$Object);

    function DefaultDashboard() {
        _classCallCheck(this, DefaultDashboard);

        _get(Object.getPrototypeOf(DefaultDashboard.prototype), "constructor", this).call(this);

        this._waitingForFirstMainResourceToStartTrackingSize = true;

        // Necessary event required to track page load time and resource sizes.
        WebInspector.Frame.addEventListener(WebInspector.Frame.Event.MainResourceDidChange, this._mainResourceDidChange, this);
        WebInspector.timelineManager.addEventListener(WebInspector.TimelineManager.Event.CapturingStopped, this._capturingStopped, this);

        // Necessary events required to track load of resources.
        WebInspector.Frame.addEventListener(WebInspector.Frame.Event.ResourceWasAdded, this._resourceWasAdded, this);
        WebInspector.frameResourceManager.addEventListener(WebInspector.FrameResourceManager.Event.FrameWasAdded, this._frameWasAdded, this);

        // Necessary events required to track console messages.
        var logManager = WebInspector.logManager;
        logManager.addEventListener(WebInspector.LogManager.Event.Cleared, this._consoleWasCleared, this);
        logManager.addEventListener(WebInspector.LogManager.Event.MessageAdded, this._consoleMessageAdded, this);
        logManager.addEventListener(WebInspector.LogManager.Event.PreviousMessageRepeatCountUpdated, this._consoleMessageWasRepeated, this);

        this._resourcesCount = 0;
        this._resourcesSize = 0;
        this._time = 0;
        this._logs = 0;
        this._errors = 0;
        this._issues = 0;
    }

    // Public

    _createClass(DefaultDashboard, [{
        key: "_dataDidChange",

        // Private

        value: function _dataDidChange() {
            this.dispatchEventToListeners(WebInspector.DefaultDashboard.Event.DataDidChange);
        }
    }, {
        key: "_mainResourceDidChange",
        value: function _mainResourceDidChange(event) {
            console.assert(event.target instanceof WebInspector.Frame);

            if (!event.target.isMainFrame()) return;

            this._time = 0;
            this._resourcesCount = 1;
            this._resourcesSize = WebInspector.frameResourceManager.mainFrame.mainResource.size || 0;

            // We should only track resource sizes on fresh loads.
            if (this._waitingForFirstMainResourceToStartTrackingSize) {
                this._waitingForFirstMainResourceToStartTrackingSize = false;
                WebInspector.Resource.addEventListener(WebInspector.Resource.Event.SizeDidChange, this._resourceSizeDidChange, this);
            }

            this._dataDidChange();
            this._startUpdatingTime();
        }
    }, {
        key: "_capturingStopped",
        value: function _capturingStopped(event) {
            // If recording stops, we should stop the timer if it hasn't stopped already.
            this._stopUpdatingTime();
        }
    }, {
        key: "_resourceWasAdded",
        value: function _resourceWasAdded(event) {
            ++this.resourcesCount;
        }
    }, {
        key: "_frameWasAdded",
        value: function _frameWasAdded(event) {
            ++this.resourcesCount;
        }
    }, {
        key: "_resourceSizeDidChange",
        value: function _resourceSizeDidChange(event) {
            this.resourcesSize += event.target.size - event.data.previousSize;
        }
    }, {
        key: "_startUpdatingTime",
        value: function _startUpdatingTime() {
            this._stopUpdatingTime();

            this.time = 0;

            this._timelineBaseTime = Date.now();
            this._timeIntervalDelay = 50;
            this._timeIntervalIdentifier = setInterval(this._updateTime.bind(this), this._timeIntervalDelay);
        }
    }, {
        key: "_stopUpdatingTime",
        value: function _stopUpdatingTime() {
            if (!this._timeIntervalIdentifier) return;

            clearInterval(this._timeIntervalIdentifier);
            this._timeIntervalIdentifier = undefined;
        }
    }, {
        key: "_updateTime",
        value: function _updateTime() {
            var duration = Date.now() - this._timelineBaseTime;

            var timeIntervalDelay = this._timeIntervalDelay;
            if (duration >= 1000) // 1 second
                timeIntervalDelay = 100;else if (duration >= 60000) // 60 seconds
                timeIntervalDelay = 1000;else if (duration >= 3600000) // 1 minute
                timeIntervalDelay = 10000;

            if (timeIntervalDelay !== this._timeIntervalDelay) {
                this._timeIntervalDelay = timeIntervalDelay;

                clearInterval(this._timeIntervalIdentifier);
                this._timeIntervalIdentifier = setInterval(this._updateTime.bind(this), this._timeIntervalDelay);
            }

            var mainFrame = WebInspector.frameResourceManager.mainFrame;
            var mainFrameStartTime = mainFrame.mainResource.firstTimestamp;
            var mainFrameLoadEventTime = mainFrame.loadEventTimestamp;

            if (isNaN(mainFrameStartTime) || isNaN(mainFrameLoadEventTime)) {
                this.time = duration / 1000;
                return;
            }

            this.time = mainFrameLoadEventTime - mainFrameStartTime;

            this._stopUpdatingTime();
        }
    }, {
        key: "_consoleMessageAdded",
        value: function _consoleMessageAdded(event) {
            var message = event.data.message;
            this._lastConsoleMessageType = message.level;
            this._incrementConsoleMessageType(message.level, message.repeatCount);
        }
    }, {
        key: "_consoleMessageWasRepeated",
        value: function _consoleMessageWasRepeated(event) {
            this._incrementConsoleMessageType(this._lastConsoleMessageType, 1);
        }
    }, {
        key: "_incrementConsoleMessageType",
        value: function _incrementConsoleMessageType(type, increment) {
            switch (type) {
                case WebInspector.ConsoleMessage.MessageLevel.Log:
                    this.logs += increment;
                    break;
                case WebInspector.ConsoleMessage.MessageLevel.Warning:
                    this.issues += increment;
                    break;
                case WebInspector.ConsoleMessage.MessageLevel.Error:
                    this.errors += increment;
                    break;
            }
        }
    }, {
        key: "_consoleWasCleared",
        value: function _consoleWasCleared(event) {
            this._logs = 0;
            this._issues = 0;
            this._errors = 0;
            this._dataDidChange();
        }
    }, {
        key: "resourcesCount",
        get: function get() {
            return this._resourcesCount;
        },
        set: function set(value) {
            this._resourcesCount = value;
            this._dataDidChange();
        }
    }, {
        key: "resourcesSize",
        get: function get() {
            return this._resourcesSize;
        },
        set: function set(value) {
            this._resourcesSize = value;
            this._dataDidChange();
        }
    }, {
        key: "time",
        get: function get() {
            return this._time;
        },
        set: function set(value) {
            this._time = value;
            this._dataDidChange();
        }
    }, {
        key: "logs",
        get: function get() {
            return this._logs;
        },
        set: function set(value) {
            this._logs = value;
            this._dataDidChange();
        }
    }, {
        key: "errors",
        get: function get() {
            return this._errors;
        },
        set: function set(value) {
            this._errors = value;
            this._dataDidChange();
        }
    }, {
        key: "issues",
        get: function get() {
            return this._issues;
        },
        set: function set(value) {
            this._issues = value;
            this._dataDidChange();
        }
    }]);

    return DefaultDashboard;
})(WebInspector.Object);

WebInspector.DefaultDashboard.Event = {
    DataDidChange: "default-dashboard-data-did-change"
};
