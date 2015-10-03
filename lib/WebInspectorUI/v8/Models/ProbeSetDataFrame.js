/*
 * Copyright (C) 2013 University of Washington. All rights reserved.
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
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

WebInspector.ProbeSetDataFrame = function (index) {
    this._count = 0;
    this._index = index;
    this._separator = false;
};

WebInspector.ProbeSetDataFrame.compare = function (a, b) {
    console.assert(a instanceof WebInspector.ProbeSetDataFrame, a);
    console.assert(b instanceof WebInspector.ProbeSetDataFrame, b);

    return a.index - b.index;
};

WebInspector.ProbeSetDataFrame.MissingValue = "?";

WebInspector.ProbeSetDataFrame.prototype = Object.defineProperties({
    constructor: WebInspector.ProbeSetDataFrame,

    addSampleForProbe: function addSampleForProbe(probe, sample) {
        this[probe.id] = sample;
        this._count++;
    },

    missingKeys: function missingKeys(probeSet) {
        return probeSet.probes.filter(function (probe) {
            return !this.hasOwnProperty(probe.id);
        }, this);
    },

    isComplete: function isComplete(probeSet) {
        return !this.missingKeys(probeSet).length;
    },

    fillMissingValues: function fillMissingValues(probeSet) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = this.missingKeys(probeSet)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var key = _step.value;

                this[key] = WebInspector.ProbeSetDataFrame.MissingValue;
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
}, {
    key: { // Public

        get: function get() {
            return String(this._index);
        },
        configurable: true,
        enumerable: true
    },
    count: {
        get: function get() {
            return this._count;
        },
        configurable: true,
        enumerable: true
    },
    index: {
        get: function get() {
            return this._index;
        },
        configurable: true,
        enumerable: true
    },
    isSeparator: {
        get: function get() {
            return this._separator;
        },

        // The last data frame before a main frame navigation is marked as a "separator" frame.
        set: function set(value) {
            this._separator = !!value;
        },
        configurable: true,
        enumerable: true
    }
});
