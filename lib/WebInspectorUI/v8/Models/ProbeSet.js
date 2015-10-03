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

// A ProbeSet clusters Probes from the same Breakpoint and their samples.

WebInspector.ProbeSet = function (breakpoint) {
    console.assert(breakpoint instanceof WebInspector.Breakpoint, "Unknown breakpoint argument: ", breakpoint);

    WebInspector.Object.call(this);
    this._breakpoint = breakpoint;
    this._probes = [];
    this._probesByIdentifier = new Map();

    this._createDataTable();

    WebInspector.Frame.addEventListener(WebInspector.Frame.Event.MainResourceDidChange, this._mainResourceChanged, this);
    WebInspector.Probe.addEventListener(WebInspector.Probe.Event.SampleAdded, this._sampleCollected, this);
    WebInspector.Breakpoint.addEventListener(WebInspector.Breakpoint.Event.ResolvedStateDidChange, this._breakpointResolvedStateDidChange, this);
};

WebInspector.Object.addConstructorFunctions(WebInspector.ProbeSet);

WebInspector.ProbeSet.Event = {
    ProbeAdded: "probe-set-probe-added",
    ProbeRemoved: "probe-set-probe-removed",
    ResolvedStateDidChange: "probe-set-resolved-state-did-change",
    SamplesCleared: "probe-set-samples-cleared"
};

WebInspector.ProbeSet.SampleObjectTitle = "Object";

WebInspector.ProbeSet.prototype = Object.defineProperties({
    constructor: WebInspector.ProbeSet,
    __proto__: WebInspector.Object.prototype,

    clear: function clear() {
        this._breakpoint.clearActions(WebInspector.BreakpointAction.Type.Probe);
    },

    clearSamples: function clearSamples() {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = this._probes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var probe = _step.value;

                probe.clearSamples();
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

        var oldTable = this._dataTable;
        this._createDataTable();
        this.dispatchEventToListeners(WebInspector.ProbeSet.Event.SamplesCleared, { oldTable: oldTable });
    },

    createProbe: function createProbe(expression) {
        this.breakpoint.createAction(WebInspector.BreakpointAction.Type.Probe, null, expression);
    },

    addProbe: function addProbe(probe) {
        console.assert(probe instanceof WebInspector.Probe, "Tried to add non-probe ", probe, " to probe group", this);
        console.assert(probe.breakpoint === this.breakpoint, "Probe and ProbeSet must have same breakpoint.", probe, this);

        this._probes.push(probe);
        this._probesByIdentifier.set(probe.id, probe);

        this.dataTable.addProbe(probe);
        this.dispatchEventToListeners(WebInspector.ProbeSet.Event.ProbeAdded, probe);
    },

    removeProbe: function removeProbe(probe) {
        console.assert(probe instanceof WebInspector.Probe, "Tried to remove non-probe ", probe, " to probe group", this);
        console.assert(this._probes.indexOf(probe) !== -1, "Tried to remove probe", probe, " not in group ", this);
        console.assert(this._probesByIdentifier.has(probe.id), "Tried to remove probe", probe, " not in group ", this);

        this._probes.splice(this._probes.indexOf(probe), 1);
        this._probesByIdentifier["delete"](probe.id);
        this.dataTable.removeProbe(probe);
        this.dispatchEventToListeners(WebInspector.ProbeSet.Event.ProbeRemoved, probe);
    },

    willRemove: function willRemove() {
        console.assert(!this._probes.length, "ProbeSet.willRemove called, but probes still associated with group: ", this._probes);

        WebInspector.Frame.removeEventListener(WebInspector.Frame.Event.MainResourceDidChange, this._mainResourceChanged, this);
        WebInspector.Probe.removeEventListener(WebInspector.Probe.Event.SampleAdded, this._sampleCollected, this);
        WebInspector.Breakpoint.removeEventListener(WebInspector.Breakpoint.Event.ResolvedStateDidChange, this._breakpointResolvedStateDidChange, this);
    },

    // Private

    _mainResourceChanged: function _mainResourceChanged() {
        this.dataTable.mainResourceChanged();
    },

    _createDataTable: function _createDataTable() {
        if (this.dataTable) this.dataTable.willRemove();

        this._dataTable = new WebInspector.ProbeSetDataTable(this);
    },

    _sampleCollected: function _sampleCollected(event) {
        var sample = event.data;
        console.assert(sample instanceof WebInspector.ProbeSample, "Tried to add non-sample to probe group: ", sample);

        var probe = event.target;
        if (!this._probesByIdentifier.has(probe.id)) return;

        console.assert(this.dataTable);
        this.dataTable.addSampleForProbe(probe, sample);
    },

    _breakpointResolvedStateDidChange: function _breakpointResolvedStateDidChange(event) {
        this.dispatchEventToListeners(WebInspector.ProbeSet.Event.ResolvedStateDidChange);
    }
}, {
    breakpoint: { // Public

        get: function get() {
            return this._breakpoint;
        },
        configurable: true,
        enumerable: true
    },
    probes: {
        get: function get() {
            return this._probes.slice();
        },
        configurable: true,
        enumerable: true
    },
    dataTable: {
        get: function get() {
            return this._dataTable;
        },
        configurable: true,
        enumerable: true
    }
});
