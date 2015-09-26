var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

WebInspector.ProbeSetDataFrame = (function (_WebInspector$Object) {
    _inherits(ProbeSetDataFrame, _WebInspector$Object);

    function ProbeSetDataFrame(index) {
        _classCallCheck(this, ProbeSetDataFrame);

        _get(Object.getPrototypeOf(ProbeSetDataFrame.prototype), "constructor", this).call(this);

        this._count = 0;
        this._index = index;
        this._separator = false;
    }

    // Static

    _createClass(ProbeSetDataFrame, [{
        key: "addSampleForProbe",
        value: function addSampleForProbe(probe, sample) {
            this[probe.id] = sample;
            this._count++;
        }
    }, {
        key: "missingKeys",
        value: function missingKeys(probeSet) {
            return probeSet.probes.filter(function (probe) {
                return !this.hasOwnProperty(probe.id);
            }, this);
        }
    }, {
        key: "isComplete",
        value: function isComplete(probeSet) {
            return !this.missingKeys(probeSet).length;
        }
    }, {
        key: "fillMissingValues",
        value: function fillMissingValues(probeSet) {
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
        key: "key",

        // Public

        get: function get() {
            return String(this._index);
        }
    }, {
        key: "count",
        get: function get() {
            return this._count;
        }
    }, {
        key: "index",
        get: function get() {
            return this._index;
        }
    }, {
        key: "isSeparator",
        get: function get() {
            return this._separator;
        },

        // The last data frame before a main frame navigation is marked as a "separator" frame.
        set: function set(value) {
            this._separator = !!value;
        }
    }], [{
        key: "compare",
        value: function compare(a, b) {
            console.assert(a instanceof WebInspector.ProbeSetDataFrame, a);
            console.assert(b instanceof WebInspector.ProbeSetDataFrame, b);

            return a.index - b.index;
        }
    }]);

    return ProbeSetDataFrame;
})(WebInspector.Object);

WebInspector.ProbeSetDataFrame.MissingValue = "?";
