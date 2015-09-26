var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2013 Apple Inc. All rights reserved.
 * Copyright (C) 2015 Tobias Reiss <tobi+webkit@basecode.de>
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

WebInspector.LogManager = (function (_WebInspector$Object) {
    _inherits(LogManager, _WebInspector$Object);

    function LogManager() {
        _classCallCheck(this, LogManager);

        _get(Object.getPrototypeOf(LogManager.prototype), "constructor", this).call(this);

        this._clearMessagesRequested = false;
        this._isNewPageOrReload = false;

        this.clearLogOnNavigateSetting = new WebInspector.Setting("clear-log-on-navigate", true);

        WebInspector.Frame.addEventListener(WebInspector.Frame.Event.MainResourceDidChange, this._mainResourceDidChange, this);
    }

    // Public

    _createClass(LogManager, [{
        key: "messageWasAdded",
        value: function messageWasAdded(source, level, text, type, url, line, column, repeatCount, parameters, stackTrace, requestId) {
            // Called from WebInspector.ConsoleObserver.

            // FIXME: Get a request from request ID.

            if (parameters) parameters = parameters.map(WebInspector.RemoteObject.fromPayload);

            var message = new WebInspector.ConsoleMessage(source, level, text, type, url, line, column, repeatCount, parameters, stackTrace, null);
            this.dispatchEventToListeners(WebInspector.LogManager.Event.MessageAdded, { message: message });
        }
    }, {
        key: "messagesCleared",
        value: function messagesCleared() {
            // Called from WebInspector.ConsoleObserver.

            WebInspector.ConsoleCommandResultMessage.clearMaximumSavedResultIndex();

            if (this._clearMessagesRequested) {
                // Frontend requested "clear console" and Backend successfully completed the request.
                this._clearMessagesRequested = false;
                this.dispatchEventToListeners(WebInspector.LogManager.Event.Cleared);
            } else {
                // Received an unrequested clear console event.
                // This could be for a navigation or other reasons (like console.clear()).
                // If this was a reload, we may not want to dispatch WebInspector.LogManager.Event.Cleared.
                // To detect if this is a reload we wait a turn and check if there was a main resource change reload.
                setTimeout(this._delayedMessagesCleared.bind(this), 0);
            }
        }
    }, {
        key: "_delayedMessagesCleared",
        value: function _delayedMessagesCleared() {
            if (this._isNewPageOrReload) {
                this._isNewPageOrReload = false;

                if (!this.clearLogOnNavigateSetting.value) return;
            }

            // A console.clear() or command line clear() happened.
            this.dispatchEventToListeners(WebInspector.LogManager.Event.Cleared);
        }
    }, {
        key: "messageRepeatCountUpdated",
        value: function messageRepeatCountUpdated(count) {
            // Called from WebInspector.ConsoleObserver.

            this.dispatchEventToListeners(WebInspector.LogManager.Event.PreviousMessageRepeatCountUpdated, { count: count });
        }
    }, {
        key: "requestClearMessages",
        value: function requestClearMessages() {
            this._clearMessagesRequested = true;

            ConsoleAgent.clearMessages();
        }

        // Private

    }, {
        key: "_mainResourceDidChange",
        value: function _mainResourceDidChange(event) {
            console.assert(event.target instanceof WebInspector.Frame);

            if (!event.target.isMainFrame()) return;

            this._isNewPageOrReload = true;

            if (event.data.oldMainResource.url === event.target.mainResource.url) this.dispatchEventToListeners(WebInspector.LogManager.Event.SessionStarted);

            WebInspector.ConsoleCommandResultMessage.clearMaximumSavedResultIndex();
        }
    }]);

    return LogManager;
})(WebInspector.Object);

WebInspector.LogManager.Event = {
    SessionStarted: "log-manager-session-was-started",
    Cleared: "log-manager-cleared",
    MessageAdded: "log-manager-message-added",
    PreviousMessageRepeatCountUpdated: "log-manager-previous-message-repeat-count-updated"
};
