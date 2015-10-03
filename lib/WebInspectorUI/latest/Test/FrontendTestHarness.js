var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2013-2015 Apple Inc. All rights reserved.
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

FrontendTestHarness = (function (_TestHarness) {
    _inherits(FrontendTestHarness, _TestHarness);

    function FrontendTestHarness() {
        _classCallCheck(this, FrontendTestHarness);

        _get(Object.getPrototypeOf(FrontendTestHarness.prototype), "constructor", this).call(this);

        this._results = [];
        this._shouldResendResults = true;
    }

    // TestHarness Overrides

    _createClass(FrontendTestHarness, [{
        key: "completeTest",
        value: function completeTest() {
            if (this.dumpActivityToSystemConsole) InspectorFrontendHost.unbufferedLog("completeTest()");

            // Wait for results to be resent before requesting completeTest(). Otherwise, messages will be
            // queued after pending dispatches run to zero and the test page will quit before processing them.
            if (this._testPageIsReloading) {
                this._completeTestAfterReload = true;
                return;
            }

            InspectorBackend.runAfterPendingDispatches(this.evaluateInPage.bind(this, "TestPage.completeTest()"));
        }
    }, {
        key: "addResult",
        value: function addResult(message) {
            var stringifiedMessage = TestHarness.messageAsString(message);

            // Save the stringified message, since message may be a DOM element that won't survive reload.
            this._results.push(stringifiedMessage);

            if (this.dumpActivityToSystemConsole) InspectorFrontendHost.unbufferedLog(stringifiedMessage);

            if (!this._testPageIsReloading) this.evaluateInPage("TestPage.addResult(unescape(\"" + escape(stringifiedMessage) + "\"))");
        }
    }, {
        key: "debugLog",
        value: function debugLog(message) {
            var stringifiedMessage = TestHarness.messageAsString(message);

            if (this.dumpActivityToSystemConsole) InspectorFrontendHost.unbufferedLog(stringifiedMessage);

            this.evaluateInPage("TestPage.debugLog(unescape(\"" + escape(stringifiedMessage) + "\"));");
        }
    }, {
        key: "evaluateInPage",
        value: function evaluateInPage(expression, callback) {
            // If we load this page outside of the inspector, or hit an early error when loading
            // the test frontend, then defer evaluating the commands (indefinitely in the former case).
            if (this._originalConsole && !window.RuntimeAgent) {
                this._originalConsole["error"]("Tried to evaluate in test page, but connection not yet established:", expression);
                return;
            }

            RuntimeAgent.evaluate.invoke({ expression: expression, objectGroup: "test", includeCommandLineAPI: false }, callback);
        }

        // Frontend test-specific methods.

    }, {
        key: "expectNoError",
        value: function expectNoError(error) {
            if (error) {
                InspectorTest.log("PROTOCOL ERROR: " + error);
                InspectorTest.completeTest();
                throw "PROTOCOL ERROR";
            }
        }
    }, {
        key: "testPageDidLoad",
        value: function testPageDidLoad() {
            if (this.dumpActivityToSystemConsole) InspectorFrontendHost.unbufferedLog("testPageDidLoad()");

            this._testPageIsReloading = false;
            this._resendResults();

            this.dispatchEventToListeners(FrontendTestHarness.Event.TestPageDidLoad);

            if (this._completeTestAfterReload) this.completeTest();
        }
    }, {
        key: "reloadPage",
        value: function reloadPage(shouldIgnoreCache) {
            var _this = this;

            console.assert(!this._testPageIsReloading);
            console.assert(!this._testPageReloadedOnce);

            this._testPageIsReloading = true;

            return PageAgent.reload(!!shouldIgnoreCache).then(function () {
                _this._shouldResendResults = true;
                _this._testPageReloadedOnce = true;

                return Promise.resolve(null);
            });
        }
    }, {
        key: "redirectConsoleToTestOutput",
        value: function redirectConsoleToTestOutput() {
            // We can't use arrow functions here because of 'arguments'. It might
            // be okay once rest parameters work.
            var self = this;
            function createProxyConsoleHandler(type) {
                return function () {
                    self.addResult(type + ": " + Array.from(arguments).join(" "));
                };
            }

            var redirectedMethods = {};
            for (var key in window.console) {
                redirectedMethods[key] = window.console[key].bind(window.console);
            }var _arr = ["log", "error", "info"];
            for (var _i = 0; _i < _arr.length; _i++) {
                var type = _arr[_i];
                redirectedMethods[type] = createProxyConsoleHandler(type.toUpperCase());
            }this._originalConsole = window.console;
            window.console = redirectedMethods;
        }
    }, {
        key: "reportUncaughtException",
        value: function reportUncaughtException(message, url, lineNumber, columnNumber) {
            var result = "Uncaught exception in inspector page: " + message + " [" + url + ":" + lineNumber + ":" + columnNumber + "]";

            // If the connection to the test page is not set up, then just dump to console and give up.
            // Errors encountered this early can be debugged by loading Test.html in a normal browser page.
            if (this._originalConsole && (!InspectorFrontendHost || !InspectorBackend)) {
                this._originalConsole["error"](result);
                return false;
            }

            this.addResult(result);
            this.completeTest();
            // Stop default handler so we can empty InspectorBackend's message queue.
            return true;
        }

        // Private

    }, {
        key: "_resendResults",
        value: function _resendResults() {
            console.assert(this._shouldResendResults);
            this._shouldResendResults = false;

            if (this.dumpActivityToSystemConsole) InspectorFrontendHost.unbufferedLog("_resendResults()");

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._results[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var result = _step.value;

                    this.evaluateInPage("TestPage.addResult(unescape(\"" + escape(result) + "\"))");
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator["return"]) {
                        _iterator["return"]();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
    }]);

    return FrontendTestHarness;
})(TestHarness);

FrontendTestHarness.Event = {
    TestPageDidLoad: "frontend-test-test-page-did-load"
};
