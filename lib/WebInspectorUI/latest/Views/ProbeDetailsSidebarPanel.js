var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2014-2015 Apple Inc. All rights reserved.
 * Copyright (C) 2013 University of Washington. All rights reserved.
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

WebInspector.ProbeDetailsSidebarPanel = (function (_WebInspector$DetailsSidebarPanel) {
    _inherits(ProbeDetailsSidebarPanel, _WebInspector$DetailsSidebarPanel);

    function ProbeDetailsSidebarPanel() {
        _classCallCheck(this, ProbeDetailsSidebarPanel);

        _get(Object.getPrototypeOf(ProbeDetailsSidebarPanel.prototype), "constructor", this).call(this, "probe", WebInspector.UIString("Probes"), WebInspector.UIString("Probes"));

        WebInspector.probeManager.addEventListener(WebInspector.ProbeManager.Event.ProbeSetAdded, this._probeSetAdded, this);
        WebInspector.probeManager.addEventListener(WebInspector.ProbeManager.Event.ProbeSetRemoved, this._probeSetRemoved, this);

        this._probeSetSections = new Map();
        this._inspectedProbeSets = [];

        // Initialize sidebar sections for probe sets that already exist.
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = WebInspector.probeManager.probeSets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var probeSet = _step.value;

                this._probeSetAdded(probeSet);
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

    // Public

    _createClass(ProbeDetailsSidebarPanel, [{
        key: "inspect",
        value: function inspect(objects) {
            if (!(objects instanceof Array)) objects = [objects];

            var inspectedProbeSets = objects.filter(function (object) {
                return object instanceof WebInspector.ProbeSet;
            });

            inspectedProbeSets.sort(function sortBySourceLocation(aProbeSet, bProbeSet) {
                var aLocation = aProbeSet.breakpoint.sourceCodeLocation;
                var bLocation = bProbeSet.breakpoint.sourceCodeLocation;
                var comparisonResult = aLocation.sourceCode.displayName.localeCompare(bLocation.sourceCode.displayName);
                if (comparisonResult !== 0) return comparisonResult;

                comparisonResult = aLocation.displayLineNumber - bLocation.displayLineNumber;
                if (comparisonResult !== 0) return comparisonResult;

                return aLocation.displayColumnNumber - bLocation.displayColumnNumber;
            });

            this.inspectedProbeSets = inspectedProbeSets;

            return !!this._inspectedProbeSets.length;
        }

        // Private

    }, {
        key: "_probeSetAdded",
        value: function _probeSetAdded(probeSetOrEvent) {
            var probeSet;
            if (probeSetOrEvent instanceof WebInspector.ProbeSet) probeSet = probeSetOrEvent;else probeSet = probeSetOrEvent.data.probeSet;
            console.assert(!this._probeSetSections.has(probeSet), "New probe group ", probeSet, " already has its own sidebar.");

            var newSection = new WebInspector.ProbeSetDetailsSection(probeSet);
            this._probeSetSections.set(probeSet, newSection);
        }
    }, {
        key: "_probeSetRemoved",
        value: function _probeSetRemoved(event) {
            var probeSet = event.data.probeSet;
            console.assert(this._probeSetSections.has(probeSet), "Removed probe group ", probeSet, " doesn't have a sidebar.");

            // First remove probe set from inspected list, then from mapping.
            var inspectedProbeSets = this.inspectedProbeSets;
            var index = inspectedProbeSets.indexOf(probeSet);
            if (index !== -1) {
                inspectedProbeSets.splice(index, 1);
                this.inspectedProbeSets = inspectedProbeSets;
            }
            var removedSection = this._probeSetSections.get(probeSet);
            this._probeSetSections["delete"](probeSet);
            removedSection.closed();
        }
    }, {
        key: "inspectedProbeSets",
        get: function get() {
            return this._inspectedProbeSets.slice();
        },
        set: function set(newProbeSets) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._inspectedProbeSets[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var probeSet = _step2.value;

                    var removedSection = this._probeSetSections.get(probeSet);
                    this.contentElement.removeChild(removedSection.element);
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

            this._inspectedProbeSets = newProbeSets;

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = newProbeSets[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var probeSet = _step3.value;

                    var shownSection = this._probeSetSections.get(probeSet);
                    this.contentElement.appendChild(shownSection.element);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                        _iterator3["return"]();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }
        }
    }]);

    return ProbeDetailsSidebarPanel;
})(WebInspector.DetailsSidebarPanel);
