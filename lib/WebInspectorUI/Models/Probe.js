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

WebInspector.ProbeSample = (function (_WebInspector$Object) {
    _inherits(ProbeSample, _WebInspector$Object);

    function ProbeSample(sampleId, batchId, elapsedTime, payload) {
        _classCallCheck(this, ProbeSample);

        _get(Object.getPrototypeOf(ProbeSample.prototype), "constructor", this).call(this);

        this.sampleId = sampleId;
        this.batchId = batchId;
        this.timestamp = elapsedTime;
        this.object = WebInspector.RemoteObject.fromPayload(payload);
    }

    return ProbeSample;
})(WebInspector.Object);

WebInspector.Probe = (function (_WebInspector$Object2) {
    _inherits(Probe, _WebInspector$Object2);

    function Probe(id, breakpoint, expression) {
        _classCallCheck(this, Probe);

        _get(Object.getPrototypeOf(Probe.prototype), "constructor", this).call(this);

        console.assert(id);
        console.assert(breakpoint instanceof WebInspector.Breakpoint);

        this._id = id;
        this._breakpoint = breakpoint;
        this._expression = expression;
        this._samples = [];
    }

    // Public

    _createClass(Probe, [{
        key: "clearSamples",
        value: function clearSamples() {
            this._samples = [];
            this.dispatchEventToListeners(WebInspector.Probe.Event.SamplesCleared);
        }
    }, {
        key: "addSample",
        value: function addSample(sample) {
            console.assert(sample instanceof WebInspector.ProbeSample, "Wrong object type passed as probe sample: ", sample);
            this._samples.push(sample);
            this.dispatchEventToListeners(WebInspector.Probe.Event.SampleAdded, sample);
        }
    }, {
        key: "id",
        get: function get() {
            return this._id;
        }
    }, {
        key: "breakpoint",
        get: function get() {
            return this._breakpoint;
        }
    }, {
        key: "expression",
        get: function get() {
            return this._expression;
        },
        set: function set(value) {
            if (this._expression === value) return;

            var data = { oldValue: this._expression, newValue: value };
            this._expression = value;
            this.clearSamples();
            this.dispatchEventToListeners(WebInspector.Probe.Event.ExpressionChanged, data);
        }
    }, {
        key: "samples",
        get: function get() {
            return this._samples.slice();
        }
    }]);

    return Probe;
})(WebInspector.Object);

WebInspector.Probe.Event = {
    ExpressionChanged: "probe-object-expression-changed",
    SampleAdded: "probe-object-sample-added",
    SamplesCleared: "probe-object-samples-cleared"
};
