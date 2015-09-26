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

TestSuite = (function (_WebInspector$Object) {
    _inherits(TestSuite, _WebInspector$Object);

    function TestSuite(harness, name) {
        _classCallCheck(this, TestSuite);

        if (!(harness instanceof TestHarness)) throw new Error("Must pass the test's harness as the first argument.");

        if (typeof name !== "string" || !name.trim().length) throw new Error("Tried to create TestSuite without string suite name.");

        _get(Object.getPrototypeOf(TestSuite.prototype), "constructor", this).call(this);

        this.name = name;
        this._harness = harness;

        this.testcases = [];
        this.runCount = 0;
        this.failCount = 0;
    }

    // Use this if the test file only has one suite, and no handling
    // of the value returned by runTestCases() is needed.

    _createClass(TestSuite, [{
        key: "runTestCasesAndFinish",
        value: function runTestCasesAndFinish() {
            throw new Error("Must be implemented by subclasses.");
        }
    }, {
        key: "runTestCases",
        value: function runTestCases() {
            throw new Error("Must be implemented by subclasses.");
        }
    }, {
        key: "addTestCase",
        value: function addTestCase(testcase) {
            if (!testcase || !(testcase instanceof Object)) throw new Error("Tried to add non-object test case.");

            if (typeof testcase.name !== "string" || !testcase.name.trim().length) throw new Error("Tried to add test case without a name.");

            if (typeof testcase.test !== "function") throw new Error("Tried to add test case without `test` function.");

            if (testcase.setup && typeof testcase.setup !== "function") throw new Error("Tried to add test case with invalid `setup` parameter (must be a function).");

            if (testcase.teardown && typeof testcase.teardown !== "function") throw new Error("Tried to add test case with invalid `teardown` parameter (must be a function).");

            this.testcases.push(testcase);
        }
    }, {
        key: "passCount",
        get: function get() {
            return this.runCount - this.failCount;
        }
    }, {
        key: "skipCount",
        get: function get() {
            if (this.failCount) return this.testcases.length - this.runCount;else return 0;
        }
    }], [{
        key: "messageFromThrownObject",
        value: function messageFromThrownObject(e) {
            var message = e;
            if (e instanceof Error) message = e.message;

            if (typeof message !== "string") message = JSON.stringify(message);

            return message;
        }
    }]);

    return TestSuite;
})(WebInspector.Object);

AsyncTestSuite = (function (_TestSuite) {
    _inherits(AsyncTestSuite, _TestSuite);

    function AsyncTestSuite() {
        _classCallCheck(this, AsyncTestSuite);

        _get(Object.getPrototypeOf(AsyncTestSuite.prototype), "constructor", this).apply(this, arguments);
    }

    _createClass(AsyncTestSuite, [{
        key: "runTestCasesAndFinish",
        value: function runTestCasesAndFinish() {
            var _this = this;

            var finish = function finish() {
                _this._harness.completeTest();
            };

            this.runTestCases().then(finish)["catch"](finish);
        }
    }, {
        key: "runTestCases",
        value: function runTestCases() {
            var _this2 = this;

            if (!this.testcases.length) throw new Error("Tried to call runTestCases() for suite with no test cases");
            if (this._startedRunning) throw new Error("Tried to call runTestCases() more than once.");

            this._startedRunning = true;

            this._harness.log("");
            this._harness.log("== Running test suite: " + this.name);

            // Avoid adding newlines if nothing was logged.
            var priorLogCount = this._harness.logCount;
            var result = this.testcases.reduce(function (chain, testcase, i) {
                if (testcase.setup) {
                    chain = chain.then(function () {
                        _this2._harness.log("-- Running test setup.");
                        return new Promise(testcase.setup);
                    });
                }

                chain = chain.then(function () {
                    if (i > 0 && priorLogCount + 1 < _this2._harness.logCount) _this2._harness.log("");

                    priorLogCount = _this2._harness.logCount;
                    _this2._harness.log("-- Running test case: " + testcase.name);
                    _this2.runCount++;
                    return new Promise(testcase.test);
                });

                if (testcase.teardown) {
                    chain = chain.then(function () {
                        _this2._harness.log("-- Running test teardown.");
                        return new Promise(testcase.teardown);
                    });
                }
                return chain;
            }, Promise.resolve());

            return result["catch"](function (e) {
                _this2.failCount++;
                var message = TestSuite.messageFromThrownObject(e);
                _this2._harness.log("!! EXCEPTION: " + message);

                throw e; // Reject this promise by re-throwing the error.
            });
        }
    }]);

    return AsyncTestSuite;
})(TestSuite);

SyncTestSuite = (function (_TestSuite2) {
    _inherits(SyncTestSuite, _TestSuite2);

    function SyncTestSuite() {
        _classCallCheck(this, SyncTestSuite);

        _get(Object.getPrototypeOf(SyncTestSuite.prototype), "constructor", this).apply(this, arguments);
    }

    _createClass(SyncTestSuite, [{
        key: "runTestCasesAndFinish",
        value: function runTestCasesAndFinish() {
            this.runTestCases();
            this._harness.completeTest();
        }
    }, {
        key: "runTestCases",
        value: function runTestCases() {
            if (!this.testcases.length) throw new Error("Tried to call runTestCases() for suite with no test cases");
            if (this._startedRunning) throw new Error("Tried to call runTestCases() more than once.");

            this._startedRunning = true;

            this._harness.log("");
            this._harness.log("== Running test suite: " + this.name);

            var priorLogCount = this._harness.logCount;
            for (var i = 0; i < this.testcases.length; i++) {
                var testcase = this.testcases[i];
                if (i > 0 && priorLogCount + 1 < this._harness.logCount) this._harness.log("");

                priorLogCount = this._harness.logCount;

                // Run the setup action, if one was provided.
                if (testcase.setup) {
                    this._harness.log("-- Running test setup.");
                    try {
                        var result = testcase.setup.call(null);
                        if (result === false) {
                            this._harness.log("!! EXCEPTION");
                            return false;
                        }
                    } catch (e) {
                        var message = TestSuite.messageFromThrownObject(e);
                        this._harness.log("!! EXCEPTION: " + message);
                        return false;
                    }
                }

                this._harness.log("-- Running test case: " + testcase.name);
                this.runCount++;
                try {
                    var result = testcase.test.call(null);
                    if (result === false) {
                        this.failCount++;
                        return false;
                    }
                } catch (e) {
                    this.failCount++;
                    var message = TestSuite.messageFromThrownObject(e);
                    this._harness.log("!! EXCEPTION: " + message);
                    return false;
                }

                // Run the teardown action, if one was provided.
                if (testcase.teardown) {
                    this._harness.log("-- Running test teardown.");
                    try {
                        var result = testcase.teardown.call(null);
                        if (result === false) {
                            this._harness.log("!! EXCEPTION:");
                            return false;
                        }
                    } catch (e) {
                        var message = TestSuite.messageFromThrownObject(e);
                        this._harness.log("!! EXCEPTION: " + message);
                        return false;
                    }
                }
            }

            return true;
        }
    }]);

    return SyncTestSuite;
})(TestSuite);
