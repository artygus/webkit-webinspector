var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

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

WebInspector.ProbeManager = (function (_WebInspector$Object) {
    _inherits(ProbeManager, _WebInspector$Object);

    function ProbeManager() {
        _classCallCheck(this, ProbeManager);

        _get(Object.getPrototypeOf(ProbeManager.prototype), "constructor", this).call(this);

        // Used to detect deleted probe actions.
        this._knownProbeIdentifiersForBreakpoint = new Map();

        // Main lookup tables for probes and probe sets.
        this._probesByIdentifier = new Map();
        this._probeSetsByBreakpoint = new Map();

        WebInspector.debuggerManager.addEventListener(WebInspector.DebuggerManager.Event.BreakpointAdded, this._breakpointAdded, this);
        WebInspector.debuggerManager.addEventListener(WebInspector.DebuggerManager.Event.BreakpointRemoved, this._breakpointRemoved, this);
        WebInspector.Breakpoint.addEventListener(WebInspector.Breakpoint.Event.ActionsDidChange, this._breakpointActionsChanged, this);

        // Saved breakpoints should not be restored on the first event loop turn, because it
        // makes manager initialization order very fragile. No breakpoints should be available.
        console.assert(!WebInspector.debuggerManager.breakpoints.length, "No breakpoints should exist before all the managers are constructed.");
    }

    // Public

    _createClass(ProbeManager, [{
        key: "probeForIdentifier",
        value: function probeForIdentifier(identifier) {
            return this._probesByIdentifier.get(identifier);
        }

        // Protected (called by WebInspector.DebuggerObserver)

    }, {
        key: "didSampleProbe",
        value: function didSampleProbe(sample) {
            console.assert(this._probesByIdentifier.has(sample.probeId), "Unknown probe identifier specified for sample: ", sample);
            var probe = this._probesByIdentifier.get(sample.probeId);
            var elapsedTime = WebInspector.timelineManager.computeElapsedTime(sample.timestamp);
            probe.addSample(new WebInspector.ProbeSample(sample.sampleId, sample.batchId, elapsedTime, sample.payload));
        }

        // Private

    }, {
        key: "_breakpointAdded",
        value: function _breakpointAdded(breakpointOrEvent) {
            var breakpoint;
            if (breakpointOrEvent instanceof WebInspector.Breakpoint) breakpoint = breakpointOrEvent;else breakpoint = breakpointOrEvent.data.breakpoint;

            console.assert(breakpoint instanceof WebInspector.Breakpoint, "Unknown object passed as breakpoint: ", breakpoint);

            if (this._knownProbeIdentifiersForBreakpoint.has(breakpoint)) return;

            this._knownProbeIdentifiersForBreakpoint.set(breakpoint, new Set());

            this._breakpointActionsChanged(breakpoint);
        }
    }, {
        key: "_breakpointRemoved",
        value: function _breakpointRemoved(event) {
            var breakpoint = event.data.breakpoint;
            console.assert(this._knownProbeIdentifiersForBreakpoint.has(breakpoint));

            this._breakpointActionsChanged(breakpoint);
            this._knownProbeIdentifiersForBreakpoint["delete"](breakpoint);
        }
    }, {
        key: "_breakpointActionsChanged",
        value: function _breakpointActionsChanged(breakpointOrEvent) {
            var breakpoint;
            if (breakpointOrEvent instanceof WebInspector.Breakpoint) breakpoint = breakpointOrEvent;else breakpoint = breakpointOrEvent.target;

            console.assert(breakpoint instanceof WebInspector.Breakpoint, "Unknown object passed as breakpoint: ", breakpoint);

            // Sometimes actions change before the added breakpoint is fully dispatched.
            if (!this._knownProbeIdentifiersForBreakpoint.has(breakpoint)) {
                this._breakpointAdded(breakpoint);
                return;
            }

            var knownProbeIdentifiers = this._knownProbeIdentifiersForBreakpoint.get(breakpoint);
            var seenProbeIdentifiers = new Set();

            breakpoint.probeActions.forEach(function (probeAction) {
                var probeIdentifier = probeAction.id;
                console.assert(probeIdentifier, "Probe added without breakpoint action identifier: ", breakpoint);

                seenProbeIdentifiers.add(probeIdentifier);
                if (!knownProbeIdentifiers.has(probeIdentifier)) {
                    // New probe; find or create relevant probe set.
                    knownProbeIdentifiers.add(probeIdentifier);
                    var probeSet = this._probeSetForBreakpoint(breakpoint);
                    var newProbe = new WebInspector.Probe(probeIdentifier, breakpoint, probeAction.data);
                    this._probesByIdentifier.set(probeIdentifier, newProbe);
                    probeSet.addProbe(newProbe);
                    return;
                }

                var probe = this._probesByIdentifier.get(probeIdentifier);
                console.assert(probe, "Probe known but couldn't be found by identifier: ", probeIdentifier);
                // Update probe expression; if it differed, change events will fire.
                probe.expression = probeAction.data;
            }, this);

            // Look for missing probes based on what we saw last.
            knownProbeIdentifiers.forEach(function (probeIdentifier) {
                if (seenProbeIdentifiers.has(probeIdentifier)) return;

                // The probe has gone missing, remove it.
                var probeSet = this._probeSetForBreakpoint(breakpoint);
                var probe = this._probesByIdentifier.get(probeIdentifier);
                this._probesByIdentifier["delete"](probeIdentifier);
                knownProbeIdentifiers["delete"](probeIdentifier);
                probeSet.removeProbe(probe);

                // Remove the probe set if it has become empty.
                if (!probeSet.probes.length) {
                    this._probeSetsByBreakpoint["delete"](probeSet.breakpoint);
                    probeSet.willRemove();
                    this.dispatchEventToListeners(WebInspector.ProbeManager.Event.ProbeSetRemoved, { probeSet: probeSet });
                }
            }, this);
        }
    }, {
        key: "_probeSetForBreakpoint",
        value: function _probeSetForBreakpoint(breakpoint) {
            if (this._probeSetsByBreakpoint.has(breakpoint)) return this._probeSetsByBreakpoint.get(breakpoint);

            var newProbeSet = new WebInspector.ProbeSet(breakpoint);
            this._probeSetsByBreakpoint.set(breakpoint, newProbeSet);
            this.dispatchEventToListeners(WebInspector.ProbeManager.Event.ProbeSetAdded, { probeSet: newProbeSet });
            return newProbeSet;
        }
    }, {
        key: "probeSets",
        get: function get() {
            return [].concat(_toConsumableArray(this._probeSetsByBreakpoint.values()));
        }
    }]);

    return ProbeManager;
})(WebInspector.Object);

WebInspector.ProbeManager.Event = {
    ProbeSetAdded: "probe-manager-probe-set-added",
    ProbeSetRemoved: "probe-manager-probe-set-removed"
};
