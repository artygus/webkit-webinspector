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
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

TestHarness = (function (_WebInspector$Object) {
    _inherits(TestHarness, _WebInspector$Object);

    function TestHarness() {
        _classCallCheck(this, TestHarness);

        _get(Object.getPrototypeOf(TestHarness.prototype), "constructor", this).call(this);

        this._logCount = 0;
    }

    _createClass(TestHarness, [{
        key: "completeTest",
        value: function completeTest() {
            throw new Error("Must be implemented by subclasses.");
        }
    }, {
        key: "addResult",
        value: function addResult() {
            throw new Error("Must be implemented by subclasses.");
        }
    }, {
        key: "debugLog",
        value: function debugLog() {
            throw new Error("Must be implemented by subclasses.");
        }
    }, {
        key: "evaluateInPage",
        value: function evaluateInPage(string, callback) {
            throw new Error("Must be implemented by subclasses.");
        }
    }, {
        key: "createAsyncSuite",
        value: function createAsyncSuite(name) {
            return new AsyncTestSuite(this, name);
        }
    }, {
        key: "createSyncSuite",
        value: function createSyncSuite(name) {
            return new SyncTestSuite(this, name);
        }
    }, {
        key: "log",
        value: function log(message) {
            ++this._logCount;

            if (this.forceDebugLogging) this.debugLog(message);else this.addResult(message);
        }
    }, {
        key: "assert",
        value: function assert(condition, message) {
            if (condition) return;

            var stringifiedMessage = TestHarness.messageAsString(message);
            this.log("ASSERT: " + stringifiedMessage);
        }
    }, {
        key: "expectThat",
        value: function expectThat(condition, message) {
            var prefix = condition ? "PASS" : "FAIL";
            var stringifiedMessage = TestHarness.messageAsString(message);
            this.log(prefix + ": " + stringifiedMessage);
        }

        // Protected

    }, {
        key: "logCount",
        get: function get() {
            return this._logCount;
        }
    }], [{
        key: "messageAsString",
        value: function messageAsString(message) {
            if (message instanceof Element) return message.textContent;

            return typeof message !== "string" ? JSON.stringify(message) : message;
        }
    }]);

    return TestHarness;
})(WebInspector.Object);
