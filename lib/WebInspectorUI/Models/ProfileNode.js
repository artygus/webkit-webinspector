var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2014 Apple Inc. All rights reserved.
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

WebInspector.ProfileNode = (function (_WebInspector$Object) {
    _inherits(ProfileNode, _WebInspector$Object);

    function ProfileNode(id, type, functionName, sourceCodeLocation, callInfo, calls, childNodes) {
        _classCallCheck(this, ProfileNode);

        _get(Object.getPrototypeOf(ProfileNode.prototype), "constructor", this).call(this);

        childNodes = childNodes || [];

        console.assert(id);
        console.assert(!calls || calls instanceof Array);
        console.assert(!calls || calls.length >= 1);
        console.assert(!calls || calls.every(function (call) {
            return call instanceof WebInspector.ProfileNodeCall;
        }));
        console.assert(childNodes instanceof Array);
        console.assert(childNodes.every(function (node) {
            return node instanceof WebInspector.ProfileNode;
        }));

        this._id = id;
        this._type = type || WebInspector.ProfileNode.Type.Function;
        this._functionName = functionName || null;
        this._sourceCodeLocation = sourceCodeLocation || null;
        this._calls = calls || null;
        this._callInfo = callInfo || null;
        this._childNodes = childNodes;
        this._parentNode = null;
        this._previousSibling = null;
        this._nextSibling = null;
        this._computedTotalTimes = false;

        if (this._callInfo) {
            this._startTime = this._callInfo.startTime;
            this._endTime = this._callInfo.endTime;
            this._totalTime = this._callInfo.totalTime;
            this._callCount = this._callInfo.callCount;
        }

        for (var i = 0; i < this._childNodes.length; ++i) this._childNodes[i].establishRelationships(this, this._childNodes[i - 1], this._childNodes[i + 1]);

        if (this._calls) {
            for (var i = 0; i < this._calls.length; ++i) this._calls[i].establishRelationships(this, this._calls[i - 1], this._calls[i + 1]);
        }
    }

    // Public

    _createClass(ProfileNode, [{
        key: "computeCallInfoForTimeRange",
        value: function computeCallInfoForTimeRange(rangeStartTime, rangeEndTime) {
            console.assert(typeof rangeStartTime === "number");
            console.assert(typeof rangeEndTime === "number");

            // With aggregate call info we can't accurately partition self/total/average time
            // in partial ranges because we don't know exactly when each call started. So we
            // always return the entire range.
            if (this._callInfo) {
                if (this._selfTime === undefined) {
                    var childNodesTotalTime = 0;
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = this._childNodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var childNode = _step.value;

                            childNodesTotalTime += childNode.totalTime;
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

                    this._selfTime = this._totalTime - childNodesTotalTime;
                }

                return {
                    callCount: this._callCount,
                    startTime: this._startTime,
                    endTime: this._endTime,
                    selfTime: this._selfTime,
                    totalTime: this._totalTime,
                    averageTime: this._selfTime / this._callCount
                };
            }

            // COMPATIBILITY (iOS 8): Profiles included per-call information and can be finely partitioned.
            // Compute that below by iterating over all the calls / children for the time range.

            var recordCallCount = true;
            var callCount = 0;

            function totalTimeInRange(previousValue, call) {
                if (rangeStartTime > call.endTime || rangeEndTime < call.startTime) return previousValue;

                if (recordCallCount) ++callCount;

                return previousValue + Math.min(call.endTime, rangeEndTime) - Math.max(rangeStartTime, call.startTime);
            }

            var startTime = Math.max(rangeStartTime, this._calls[0].startTime);
            var endTime = Math.min(this._calls.lastValue.endTime, rangeEndTime);
            var totalTime = this._calls.reduce(totalTimeInRange, 0);

            recordCallCount = false;

            var childNodesTotalTime = 0;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._childNodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var childNode = _step2.value;

                    childNodesTotalTime += childNode.calls.reduce(totalTimeInRange, 0);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                        _iterator2["return"]();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            var selfTime = totalTime - childNodesTotalTime;
            var averageTime = selfTime / callCount;

            return { startTime: startTime, endTime: endTime, totalTime: totalTime, selfTime: selfTime, callCount: callCount, averageTime: averageTime };
        }
    }, {
        key: "traverseNextProfileNode",
        value: function traverseNextProfileNode(stayWithin) {
            var profileNode = this._childNodes[0];
            if (profileNode) return profileNode;

            if (this === stayWithin) return null;

            profileNode = this._nextSibling;
            if (profileNode) return profileNode;

            profileNode = this;
            while (profileNode && !profileNode.nextSibling && profileNode.parentNode !== stayWithin) profileNode = profileNode.parentNode;

            if (!profileNode) return null;

            return profileNode.nextSibling;
        }
    }, {
        key: "saveIdentityToCookie",
        value: function saveIdentityToCookie(cookie) {
            cookie[WebInspector.ProfileNode.TypeCookieKey] = this._type || null;
            cookie[WebInspector.ProfileNode.FunctionNameCookieKey] = this._functionName || null;
            cookie[WebInspector.ProfileNode.SourceCodeURLCookieKey] = this._sourceCodeLocation ? this._sourceCodeLocation.sourceCode.url ? this._sourceCodeLocation.sourceCode.url.hash : null : null;
            cookie[WebInspector.ProfileNode.SourceCodeLocationLineCookieKey] = this._sourceCodeLocation ? this._sourceCodeLocation.lineNumber : null;
            cookie[WebInspector.ProfileNode.SourceCodeLocationColumnCookieKey] = this._sourceCodeLocation ? this._sourceCodeLocation.columnNumber : null;
        }

        // Protected

    }, {
        key: "establishRelationships",
        value: function establishRelationships(parentNode, previousSibling, nextSibling) {
            this._parentNode = parentNode || null;
            this._previousSibling = previousSibling || null;
            this._nextSibling = nextSibling || null;
        }

        // Private

    }, {
        key: "_computeTotalTimesIfNeeded",
        value: function _computeTotalTimesIfNeeded() {
            if (this._computedTotalTimes) return;

            this._computedTotalTimes = true;

            var info = this.computeCallInfoForTimeRange(0, Infinity);
            this._startTime = info.startTime;
            this._endTime = info.endTime;
            this._selfTime = info.selfTime;
            this._totalTime = info.totalTime;
        }
    }, {
        key: "id",
        get: function get() {
            return this._id;
        }
    }, {
        key: "type",
        get: function get() {
            return this._type;
        }
    }, {
        key: "functionName",
        get: function get() {
            return this._functionName;
        }
    }, {
        key: "sourceCodeLocation",
        get: function get() {
            return this._sourceCodeLocation;
        }
    }, {
        key: "startTime",
        get: function get() {
            if (this._startTime === undefined) this._startTime = Math.max(0, this._calls[0].startTime);
            return this._startTime;
        }
    }, {
        key: "endTime",
        get: function get() {
            if (this._endTime === undefined) this._endTime = Math.min(this._calls.lastValue.endTime, Infinity);
            return this._endTime;
        }
    }, {
        key: "selfTime",
        get: function get() {
            this._computeTotalTimesIfNeeded();
            return this._selfTime;
        }
    }, {
        key: "totalTime",
        get: function get() {
            this._computeTotalTimesIfNeeded();
            return this._totalTime;
        }
    }, {
        key: "callInfo",
        get: function get() {
            return this._callInfo;
        }
    }, {
        key: "calls",
        get: function get() {
            return this._calls;
        }
    }, {
        key: "previousSibling",
        get: function get() {
            return this._previousSibling;
        }
    }, {
        key: "nextSibling",
        get: function get() {
            return this._nextSibling;
        }
    }, {
        key: "parentNode",
        get: function get() {
            return this._parentNode;
        }
    }, {
        key: "childNodes",
        get: function get() {
            return this._childNodes;
        }
    }]);

    return ProfileNode;
})(WebInspector.Object);

WebInspector.ProfileNode.Type = {
    Function: "profile-node-type-function",
    Program: "profile-node-type-program"
};

WebInspector.ProfileNode.TypeIdentifier = "profile-node";
WebInspector.ProfileNode.TypeCookieKey = "profile-node-type";
WebInspector.ProfileNode.FunctionNameCookieKey = "profile-node-function-name";
WebInspector.ProfileNode.SourceCodeURLCookieKey = "profile-node-source-code-url";
WebInspector.ProfileNode.SourceCodeLocationLineCookieKey = "profile-node-source-code-location-line";
WebInspector.ProfileNode.SourceCodeLocationColumnCookieKey = "profile-node-source-code-location-column";
