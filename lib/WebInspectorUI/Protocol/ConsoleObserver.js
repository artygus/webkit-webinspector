var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * Copyright (C) 2013, 2015 Apple Inc. All rights reserved.
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

WebInspector.ConsoleObserver = (function () {
    function ConsoleObserver() {
        _classCallCheck(this, ConsoleObserver);
    }

    _createClass(ConsoleObserver, [{
        key: "messageAdded",

        // Events defined by the "Console" domain.

        value: function messageAdded(message) {
            if (message.type === "assert" && !message.text) message.text = WebInspector.UIString("Assertion");

            if (message.level === "warning" || message.level === "error") {
                // FIXME: <https://webkit.org/b/142553> Web Inspector: Merge IssueMessage/ConsoleMessage - both attempt to modify the Console Messages parameter independently
                WebInspector.issueManager.issueWasAdded(message.source, message.level, message.text, message.url, message.line, message.column || 0);
            }

            if (message.source === "console-api" && message.type === "clear") return;

            WebInspector.logManager.messageWasAdded(message.source, message.level, message.text, message.type, message.url, message.line, message.column || 0, message.repeatCount, message.parameters, message.stackTrace, message.networkRequestId);
        }
    }, {
        key: "messageRepeatCountUpdated",
        value: function messageRepeatCountUpdated(count) {
            WebInspector.logManager.messageRepeatCountUpdated(count);
        }
    }, {
        key: "messagesCleared",
        value: function messagesCleared() {
            WebInspector.logManager.messagesCleared();
        }
    }]);

    return ConsoleObserver;
})();
