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

WebInspector.JavaScriptLogViewController = (function (_WebInspector$Object) {
    _inherits(JavaScriptLogViewController, _WebInspector$Object);

    function JavaScriptLogViewController(element, scrollElement, textPrompt, delegate, historySettingIdentifier) {
        _classCallCheck(this, JavaScriptLogViewController);

        _get(Object.getPrototypeOf(JavaScriptLogViewController.prototype), "constructor", this).call(this);

        console.assert(textPrompt instanceof WebInspector.ConsolePrompt);
        console.assert(historySettingIdentifier);

        this._element = element;
        this._scrollElement = scrollElement;

        this._promptHistorySetting = new WebInspector.Setting(historySettingIdentifier, null);

        this._prompt = textPrompt;
        this._prompt.delegate = this;
        this._prompt.history = this._promptHistorySetting.value;

        this.delegate = delegate;

        this._cleared = true;
        this._previousMessageView = null;
        this._lastCommitted = "";
        this._repeatCountWasInterrupted = false;

        this._sessions = [];

        this.messagesClearKeyboardShortcut = new WebInspector.KeyboardShortcut(WebInspector.KeyboardShortcut.Modifier.CommandOrControl, "K", this._handleClearShortcut.bind(this));
        this.messagesAlternateClearKeyboardShortcut = new WebInspector.KeyboardShortcut(WebInspector.KeyboardShortcut.Modifier.Control, "L", this._handleClearShortcut.bind(this), this._element);

        this._messagesFindNextKeyboardShortcut = new WebInspector.KeyboardShortcut(WebInspector.KeyboardShortcut.Modifier.CommandOrControl, "G", this._handleFindNextShortcut.bind(this), this._element);
        this._messagesFindPreviousKeyboardShortcut = new WebInspector.KeyboardShortcut(WebInspector.KeyboardShortcut.Modifier.CommandOrControl | WebInspector.KeyboardShortcut.Modifier.Shift, "G", this._handleFindPreviousShortcut.bind(this), this._element);

        this._promptAlternateClearKeyboardShortcut = new WebInspector.KeyboardShortcut(WebInspector.KeyboardShortcut.Modifier.Control, "L", this._handleClearShortcut.bind(this), this._prompt.element);
        this._promptFindNextKeyboardShortcut = new WebInspector.KeyboardShortcut(WebInspector.KeyboardShortcut.Modifier.CommandOrControl, "G", this._handleFindNextShortcut.bind(this), this._prompt.element);
        this._promptFindPreviousKeyboardShortcut = new WebInspector.KeyboardShortcut(WebInspector.KeyboardShortcut.Modifier.CommandOrControl | WebInspector.KeyboardShortcut.Modifier.Shift, "G", this._handleFindPreviousShortcut.bind(this), this._prompt.element);

        this.startNewSession();
    }

    // Public

    _createClass(JavaScriptLogViewController, [{
        key: "clear",
        value: function clear() {
            this._cleared = true;

            this.startNewSession(true);

            this.prompt.focus();
        }
    }, {
        key: "startNewSession",
        value: function startNewSession(clearPreviousSessions) {
            if (this._sessions.length && clearPreviousSessions) {
                for (var i = 0; i < this._sessions.length; ++i) this._element.removeChild(this._sessions[i].element);

                this._sessions = [];
                this._currentConsoleGroup = null;
            }

            var lastSession = this._sessions.lastValue;
            // Reuse the last session if it has no messages.
            if (lastSession && !lastSession.hasMessages()) {
                // Make sure the session is visible.
                lastSession.element.scrollIntoView();
                return;
            }

            var consoleSession = new WebInspector.ConsoleSession();

            this._previousMessageView = null;
            this._lastCommitted = "";
            this._repeatCountWasInterrupted = false;

            this._sessions.push(consoleSession);
            this._currentConsoleGroup = consoleSession;

            this._element.appendChild(consoleSession.element);

            // Make sure the new session is visible.
            consoleSession.element.scrollIntoView();
        }
    }, {
        key: "appendImmediateExecutionWithResult",
        value: function appendImmediateExecutionWithResult(text, result, addSpecialUserLogClass) {
            console.assert(result instanceof WebInspector.RemoteObject);

            var commandMessageView = new WebInspector.ConsoleCommandView(text, addSpecialUserLogClass ? "special-user-log" : null);
            this._appendConsoleMessageView(commandMessageView, true);

            function saveResultCallback(savedResultIndex) {
                var commandResultMessage = new WebInspector.ConsoleCommandResultMessage(result, false, savedResultIndex);
                var commandResultMessageView = new WebInspector.ConsoleMessageView(commandResultMessage);
                this._appendConsoleMessageView(commandResultMessageView, true);
            }

            WebInspector.runtimeManager.saveResult(result, saveResultCallback.bind(this));
        }
    }, {
        key: "appendConsoleMessage",
        value: function appendConsoleMessage(consoleMessage) {
            var consoleMessageView = new WebInspector.ConsoleMessageView(consoleMessage);
            this._appendConsoleMessageView(consoleMessageView);
            return consoleMessageView;
        }
    }, {
        key: "updatePreviousMessageRepeatCount",
        value: function updatePreviousMessageRepeatCount(count) {
            console.assert(this._previousMessageView);
            if (!this._previousMessageView) return false;

            var previousIgnoredCount = this._previousMessageView[WebInspector.JavaScriptLogViewController.IgnoredRepeatCount] || 0;
            var previousVisibleCount = this._previousMessageView.repeatCount;

            if (!this._repeatCountWasInterrupted) {
                this._previousMessageView.repeatCount = count - previousIgnoredCount;
                return true;
            }

            var consoleMessage = this._previousMessageView.message;
            var duplicatedConsoleMessageView = new WebInspector.ConsoleMessageView(consoleMessage);
            duplicatedConsoleMessageView[WebInspector.JavaScriptLogViewController.IgnoredRepeatCount] = previousIgnoredCount + previousVisibleCount;
            duplicatedConsoleMessageView.repeatCount = 1;
            this._appendConsoleMessageView(duplicatedConsoleMessageView);

            return true;
        }
    }, {
        key: "isScrolledToBottom",
        value: function isScrolledToBottom() {
            // Lie about being scrolled to the bottom if we have a pending request to scroll to the bottom soon.
            return this._scrollToBottomTimeout || this._scrollElement.isScrolledToBottom();
        }
    }, {
        key: "scrollToBottom",
        value: function scrollToBottom() {
            if (this._scrollToBottomTimeout) return;

            function delayedWork() {
                this._scrollToBottomTimeout = null;
                this._scrollElement.scrollTop = this._scrollElement.scrollHeight;
            }

            // Don't scroll immediately so we are not causing excessive layouts when there
            // are many messages being added at once.
            this._scrollToBottomTimeout = setTimeout(delayedWork.bind(this), 0);
        }

        // Protected

    }, {
        key: "consolePromptHistoryDidChange",
        value: function consolePromptHistoryDidChange(prompt) {
            this._promptHistorySetting.value = this.prompt.history;
        }
    }, {
        key: "consolePromptShouldCommitText",
        value: function consolePromptShouldCommitText(prompt, text, cursorIsAtLastPosition, handler) {
            // Always commit the text if we are not at the last position.
            if (!cursorIsAtLastPosition) {
                handler(true);
                return;
            }

            function parseFinished(error, result, message, range) {
                handler(result !== RuntimeAgent.SyntaxErrorType.Recoverable);
            }

            RuntimeAgent.parse(text, parseFinished.bind(this));
        }
    }, {
        key: "consolePromptTextCommitted",
        value: function consolePromptTextCommitted(prompt, text) {
            console.assert(text);

            if (this._lastCommitted !== text) {
                var commandMessageView = new WebInspector.ConsoleCommandView(text);
                this._appendConsoleMessageView(commandMessageView, true);
                this._lastCommitted = text;
            }

            function printResult(result, wasThrown, savedResultIndex) {
                if (!result || this._cleared) return;

                var commandResultMessage = new WebInspector.ConsoleCommandResultMessage(result, wasThrown, savedResultIndex);
                var commandResultMessageView = new WebInspector.ConsoleMessageView(commandResultMessage);
                this._appendConsoleMessageView(commandResultMessageView, true);
            }

            WebInspector.runtimeManager.evaluateInInspectedWindow(text, "console", true, false, false, true, true, printResult.bind(this));
        }

        // Private

    }, {
        key: "_handleClearShortcut",
        value: function _handleClearShortcut() {
            WebInspector.logManager.requestClearMessages();
        }
    }, {
        key: "_handleFindNextShortcut",
        value: function _handleFindNextShortcut() {
            this.delegate.highlightNextSearchMatch();
        }
    }, {
        key: "_handleFindPreviousShortcut",
        value: function _handleFindPreviousShortcut() {
            this.delegate.highlightPreviousSearchMatch();
        }
    }, {
        key: "_appendConsoleMessageView",
        value: function _appendConsoleMessageView(messageView, repeatCountWasInterrupted) {
            var wasScrolledToBottom = this.isScrolledToBottom();

            this._cleared = false;
            this._repeatCountWasInterrupted = repeatCountWasInterrupted || false;

            if (!repeatCountWasInterrupted) this._previousMessageView = messageView;

            if (messageView.message && messageView.message.source !== WebInspector.ConsoleMessage.MessageSource.JS) this._lastCommitted = "";

            var type = messageView instanceof WebInspector.ConsoleCommandView ? null : messageView.message.type;
            if (type === WebInspector.ConsoleMessage.MessageType.EndGroup) {
                var parentGroup = this._currentConsoleGroup.parentGroup;
                if (parentGroup) this._currentConsoleGroup = parentGroup;
            } else {
                if (type === WebInspector.ConsoleMessage.MessageType.StartGroup || type === WebInspector.ConsoleMessage.MessageType.StartGroupCollapsed) {
                    var group = new WebInspector.ConsoleGroup(this._currentConsoleGroup);
                    var groupElement = group.render(messageView);
                    this._currentConsoleGroup.append(groupElement);
                    this._currentConsoleGroup = group;
                } else this._currentConsoleGroup.addMessageView(messageView);
            }

            if (type === WebInspector.ConsoleMessage.MessageType.Result || wasScrolledToBottom) this.scrollToBottom();

            if (this.delegate && typeof this.delegate.didAppendConsoleMessageView === "function") this.delegate.didAppendConsoleMessageView(messageView);
        }
    }, {
        key: "prompt",
        get: function get() {
            return this._prompt;
        }
    }, {
        key: "currentConsoleGroup",
        get: function get() {
            return this._currentConsoleGroup;
        }
    }]);

    return JavaScriptLogViewController;
})(WebInspector.Object);

WebInspector.JavaScriptLogViewController.CachedPropertiesDuration = 30000;
WebInspector.JavaScriptLogViewController.IgnoredRepeatCount = Symbol("ignored-repeat-count");
