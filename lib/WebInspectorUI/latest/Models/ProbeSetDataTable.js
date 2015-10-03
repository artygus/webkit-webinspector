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

WebInspector.ProbeSetDataTable = (function (_WebInspector$Object) {
    _inherits(ProbeSetDataTable, _WebInspector$Object);

    function ProbeSetDataTable(probeSet) {
        _classCallCheck(this, ProbeSetDataTable);

        _get(Object.getPrototypeOf(ProbeSetDataTable.prototype), "constructor", this).call(this);

        this._probeSet = probeSet;
        this._frames = [];
        this._previousBatchIdentifier = WebInspector.ProbeSetDataTable.SentinelValue;
    }

    // Public

    _createClass(ProbeSetDataTable, [{
        key: "willRemove",
        value: function willRemove() {
            this.dispatchEventToListeners(WebInspector.ProbeSetDataTable.Event.WillRemove);
            this._frames = [];
            delete this._probeSet;
        }
    }, {
        key: "mainResourceChanged",
        value: function mainResourceChanged() {
            this.addSeparator();
        }
    }, {
        key: "addSampleForProbe",
        value: function addSampleForProbe(probe, sample) {
            // Eagerly save the frame if the batch identifier differs, or we know the frame is full.
            // Create a new frame when the batch identifier differs.
            if (sample.batchId !== this._previousBatchIdentifier) {
                if (this._openFrame) {
                    this._openFrame.fillMissingValues(this._probeSet);
                    this.addFrame(this._openFrame);
                }
                this._openFrame = this.createFrame();
                this._previousBatchIdentifier = sample.batchId;
            }

            console.assert(this._openFrame, "Should always have an open frame before adding sample.", this, probe, sample);
            this._openFrame.addSampleForProbe(probe, sample);
            if (this._openFrame.count === this._probeSet.probes.length) {
                this.addFrame(this._openFrame);
                this._openFrame = null;
            }
        }
    }, {
        key: "addProbe",
        value: function addProbe(probe) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.frames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var frame = _step.value;

                    if (!frame[probe.id]) frame[probe.id] = WebInspector.ProbeSetDataTable.UnknownValue;
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
        key: "removeProbe",
        value: function removeProbe(probe) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.frames[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var frame = _step2.value;

                    delete frame[probe.id];
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
        }

        // Protected - can be overridden by subclasses.

    }, {
        key: "createFrame",
        value: function createFrame() {
            return new WebInspector.ProbeSetDataFrame(this._frames.length);
        }
    }, {
        key: "addFrame",
        value: function addFrame(frame) {
            this._frames.push(frame);
            this.dispatchEventToListeners(WebInspector.ProbeSetDataTable.Event.FrameInserted, frame);
        }
    }, {
        key: "addSeparator",
        value: function addSeparator() {
            // Separators must be associated with a frame.
            if (!this._frames.length) return;

            var previousFrame = this._frames.lastValue;
            // Don't send out duplicate events for adjacent separators.
            if (previousFrame.isSeparator) return;

            previousFrame.isSeparator = true;
            this.dispatchEventToListeners(WebInspector.ProbeSetDataTable.Event.SeparatorInserted, previousFrame);
        }
    }, {
        key: "frames",
        get: function get() {
            return this._frames.slice();
        }
    }, {
        key: "separators",
        get: function get() {
            return this._frames.filter(function (frame) {
                return frame.isSeparator;
            });
        }
    }]);

    return ProbeSetDataTable;
})(WebInspector.Object);

WebInspector.ProbeSetDataTable.Event = {
    FrameInserted: "probe-set-data-table-frame-inserted",
    SeparatorInserted: "probe-set-data-table-separator-inserted",
    WillRemove: "probe-set-data-table-will-remove"
};

WebInspector.ProbeSetDataTable.SentinelValue = -1;
WebInspector.ProbeSetDataTable.UnknownValue = "?";
