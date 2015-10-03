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

WebInspector.ProfileNode = function (id, type, functionName, sourceCodeLocation, calls, childNodes) {
    WebInspector.Object.call(this);

    childNodes = childNodes || [];

    console.assert(id);
    console.assert(calls instanceof Array);
    console.assert(calls.length >= 1);
    console.assert(calls.reduce(function (previousValue, call) {
        return previousValue && call instanceof WebInspector.ProfileNodeCall;
    }, true));
    console.assert(childNodes instanceof Array);
    console.assert(childNodes.reduce(function (previousValue, node) {
        return previousValue && node instanceof WebInspector.ProfileNode;
    }, true));

    this._id = id;
    this._type = type || WebInspector.ProfileNode.Type.Function;
    this._functionName = functionName || null;
    this._sourceCodeLocation = sourceCodeLocation || null;
    this._calls = calls;
    this._childNodes = childNodes;
    this._parentNode = null;
    this._previousSibling = null;
    this._nextSibling = null;
    this._computedTotalTimes = false;

    for (var i = 0; i < this._childNodes.length; ++i) this._childNodes[i].establishRelationships(this, this._childNodes[i - 1], this._childNodes[i + 1]);

    for (var i = 0; i < this._calls.length; ++i) this._calls[i].establishRelationships(this, this._calls[i - 1], this._calls[i + 1]);
};

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

WebInspector.ProfileNode.prototype = Object.defineProperties({
    constructor: WebInspector.ProfileNode,
    __proto__: WebInspector.Object.prototype,

    computeCallInfoForTimeRange: function computeCallInfoForTimeRange(rangeStartTime, rangeEndTime) {
        console.assert(typeof rangeStartTime === "number");
        console.assert(typeof rangeEndTime === "number");

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
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = this._childNodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var childNode = _step.value;

                childNodesTotalTime += childNode.calls.reduce(totalTimeInRange, 0);
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

        var selfTime = totalTime - childNodesTotalTime;
        var averageTime = selfTime / callCount;

        return { startTime: startTime, endTime: endTime, totalTime: totalTime, selfTime: selfTime, callCount: callCount, averageTime: averageTime };
    },

    traverseNextProfileNode: function traverseNextProfileNode(stayWithin) {
        var profileNode = this._childNodes[0];
        if (profileNode) return profileNode;

        if (this === stayWithin) return null;

        profileNode = this._nextSibling;
        if (profileNode) return profileNode;

        profileNode = this;
        while (profileNode && !profileNode.nextSibling && profileNode.parentNode !== stayWithin) profileNode = profileNode.parentNode;

        if (!profileNode) return null;

        return profileNode.nextSibling;
    },

    saveIdentityToCookie: function saveIdentityToCookie(cookie) {
        cookie[WebInspector.ProfileNode.TypeCookieKey] = this._type || null;
        cookie[WebInspector.ProfileNode.FunctionNameCookieKey] = this._functionName || null;
        cookie[WebInspector.ProfileNode.SourceCodeURLCookieKey] = this._sourceCodeLocation ? this._sourceCodeLocation.sourceCode.url ? this._sourceCodeLocation.sourceCode.url.hash : null : null;
        cookie[WebInspector.ProfileNode.SourceCodeLocationLineCookieKey] = this._sourceCodeLocation ? this._sourceCodeLocation.lineNumber : null;
        cookie[WebInspector.ProfileNode.SourceCodeLocationColumnCookieKey] = this._sourceCodeLocation ? this._sourceCodeLocation.columnNumber : null;
    },

    // Protected

    establishRelationships: function establishRelationships(parentNode, previousSibling, nextSibling) {
        this._parentNode = parentNode || null;
        this._previousSibling = previousSibling || null;
        this._nextSibling = nextSibling || null;
    },

    // Private

    _computeTotalTimes: function _computeTotalTimes() {
        if (this._computedTotalTimes) return;

        this._computedTotalTimes = true;

        var info = this.computeCallInfoForTimeRange(0, Infinity);
        this._startTime = info.startTime;
        this._endTime = info.endTime;
        this._selfTime = info.selfTime;
        this._totalTime = info.totalTime;
    }
}, {
    id: { // Public

        get: function get() {
            return this._id;
        },
        configurable: true,
        enumerable: true
    },
    type: {
        get: function get() {
            return this._type;
        },
        configurable: true,
        enumerable: true
    },
    functionName: {
        get: function get() {
            return this._functionName;
        },
        configurable: true,
        enumerable: true
    },
    sourceCodeLocation: {
        get: function get() {
            return this._sourceCodeLocation;
        },
        configurable: true,
        enumerable: true
    },
    startTime: {
        get: function get() {
            if (this._startTime === undefined) this._startTime = Math.max(0, this._calls[0].startTime);
            return this._startTime;
        },
        configurable: true,
        enumerable: true
    },
    endTime: {
        get: function get() {
            if (this._endTime === undefined) this._endTime = Math.min(this._calls.lastValue.endTime, Infinity);
            return this._endTime;
        },
        configurable: true,
        enumerable: true
    },
    selfTime: {
        get: function get() {
            this._computeTotalTimesIfNeeded();
            return this._selfTime;
        },
        configurable: true,
        enumerable: true
    },
    totalTime: {
        get: function get() {
            this._computeTotalTimesIfNeeded();
            return this._totalTime;
        },
        configurable: true,
        enumerable: true
    },
    calls: {
        get: function get() {
            return this._calls;
        },
        configurable: true,
        enumerable: true
    },
    previousSibling: {
        get: function get() {
            return this._previousSibling;
        },
        configurable: true,
        enumerable: true
    },
    nextSibling: {
        get: function get() {
            return this._nextSibling;
        },
        configurable: true,
        enumerable: true
    },
    parentNode: {
        get: function get() {
            return this._parentNode;
        },
        configurable: true,
        enumerable: true
    },
    childNodes: {
        get: function get() {
            return this._childNodes;
        },
        configurable: true,
        enumerable: true
    }
});
