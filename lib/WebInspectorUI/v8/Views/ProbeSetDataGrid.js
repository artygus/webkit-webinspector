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

WebInspector.ProbeSetDataGrid = function (probeSet) {
    console.assert(probeSet instanceof WebInspector.ProbeSet, "Invalid ProbeSet argument: ", probeSet);
    this.probeSet = probeSet;

    var columnsData = {};
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = probeSet.probes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var probe = _step.value;

            var probeTitle = probe.expression || WebInspector.UIString("(uninitialized)");
            columnsData[probe.id] = { title: probeTitle };
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

    WebInspector.DataGrid.call(this, columnsData);

    this.element.classList.add("inline");

    this._frameNodes = new Map();
    this._nodesSinceLastNavigation = [];

    this._listeners = new WebInspector.EventListenerSet(this, "ProbeSetDataGrid instance listeners");
    this._listeners.register(probeSet, WebInspector.ProbeSet.Event.ProbeAdded, this._setupProbe);
    this._listeners.register(probeSet, WebInspector.ProbeSet.Event.ProbeRemoved, this._teardownProbe);
    this._listeners.register(probeSet, WebInspector.ProbeSet.Event.SamplesCleared, this._setupData);
    this._listeners.register(WebInspector.Probe, WebInspector.Probe.Event.ExpressionChanged, this._probeExpressionChanged);
    this._listeners.install();

    this._setupData();
};

WebInspector.ProbeSetDataGrid.DataUpdatedStyleClassName = "data-updated";
WebInspector.ProbeSetDataGrid.PastFrameStyleClassName = "past-value";
WebInspector.ProbeSetDataGrid.HighlightedFrameStyleClassName = "highlighted";

WebInspector.ProbeSetDataGrid.DataUpdatedAnimationDuration = 300; // milliseconds

WebInspector.ProbeSetDataGrid.prototype = {
    constructor: WebInspector.ProbeSetDataGrid,
    __proto__: WebInspector.DataGrid.prototype,

    // Public

    closed: function closed() {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = this.probeSet[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var probe = _step2.value;

                this._teardownProbe(probe);
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

        this._listeners.uninstall(true);
    },

    // Private

    _setupProbe: function _setupProbe(event) {
        var probe = event.data;
        this.insertColumn(probe.id, { title: probe.expression });

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = this._data.frames[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var frame = _step3.value;

                this._updateNodeForFrame(frame);
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
    },

    _teardownProbe: function _teardownProbe(event) {
        var probe = event.data;
        this.removeColumn(probe.id);

        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = this._data.frames[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var frame = _step4.value;

                this._updateNodeForFrame(frame);
            }
        } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
                    _iterator4["return"]();
                }
            } finally {
                if (_didIteratorError4) {
                    throw _iteratorError4;
                }
            }
        }
    },

    _setupData: function _setupData() {
        this._data = this.probeSet.dataTable;
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
            for (var _iterator5 = this._data.frames[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var frame = _step5.value;

                this._updateNodeForFrame(frame);
            }
        } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
                    _iterator5["return"]();
                }
            } finally {
                if (_didIteratorError5) {
                    throw _iteratorError5;
                }
            }
        }

        this._dataListeners = new WebInspector.EventListenerSet(this, "ProbeSetDataGrid data table listeners");
        this._dataListeners.register(this._data, WebInspector.ProbeSetDataTable.Event.FrameInserted, this._dataFrameInserted);
        this._dataListeners.register(this._data, WebInspector.ProbeSetDataTable.Event.SeparatorInserted, this._dataSeparatorInserted);
        this._dataListeners.register(this._data, WebInspector.ProbeSetDataTable.Event.WillRemove, this._teardownData);
        this._dataListeners.install();
    },

    _teardownData: function _teardownData() {
        this._dataListeners.uninstall(true);
        this.removeChildren();
        this._frameNodes = new Map();
        this._separators = new Map();
        delete this._lastUpdatedFrame;
    },

    _updateNodeForFrame: function _updateNodeForFrame(frame) {
        console.assert(frame instanceof WebInspector.ProbeSetDataFrame, "Invalid ProbeSetDataFrame argument: ", frame);
        var node = null;
        if (this._frameNodes.has(frame)) {
            node = this._frameNodes.get(frame);
            node.frame = frame;
            node.refresh();
        } else {
            node = new WebInspector.ProbeSetDataGridNode(this);
            node.frame = frame;
            this._frameNodes.set(frame, node);
            node.createCells();

            var sortFunction = function sortFunction(a, b) {
                return WebInspector.ProbeSetDataFrame.compare(a.frame, b.frame);
            };
            var insertionIndex = insertionIndexForObjectInListSortedByFunction(node, this.children, sortFunction);
            if (insertionIndex === this.children.length) this.appendChild(node);else if (this.children[insertionIndex].frame.key === frame.key) {
                this.removeChild(this.children[insertionIndex]);
                this.insertChild(node, insertionIndex);
            } else this.insertChild(node, insertionIndex);
        }
        console.assert(node);

        node.element.classList.add(WebInspector.ProbeSetDataGrid.DataUpdatedStyleClassName);
        window.setTimeout(function () {
            node.element.classList.remove(WebInspector.ProbeSetDataGrid.DataUpdatedStyleClassName);
        }, WebInspector.ProbeSetDataGrid.DataUpdatedAnimationDuration);

        this._nodesSinceLastNavigation.push(node);
    },

    _updateNodeForSeparator: function _updateNodeForSeparator(frame) {
        console.assert(this._frameNodes.has(frame), "Tried to add separator for unknown data frame: ", frame);
        this._frameNodes.get(frame).updateCellsForSeparator(frame, this.probeSet);

        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
            for (var _iterator6 = this._nodesSinceLastNavigation[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                var node = _step6.value;

                node.element.classList.add(WebInspector.ProbeSetDataGrid.PastFrameStyleClassName);
            }
        } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion6 && _iterator6["return"]) {
                    _iterator6["return"]();
                }
            } finally {
                if (_didIteratorError6) {
                    throw _iteratorError6;
                }
            }
        }

        this._nodesSinceLastNavigation = [];
    },

    _dataFrameInserted: function _dataFrameInserted(event) {
        var frame = event.data;
        this._lastUpdatedFrame = frame;
        this._updateNodeForFrame(frame);
    },

    _dataSeparatorInserted: function _dataSeparatorInserted(event) {
        var frame = event.data;
        this._updateNodeForSeparator(frame);
    },

    _probeExpressionChanged: function _probeExpressionChanged(event) {
        var probe = event.target;
        if (probe.breakpoint !== this.probeSet.breakpoint) return;

        if (!this.columns.has(probe.id)) return;

        var oldColumn = this.columns.get(probe.id);
        this.removeColumn(probe.id);
        var ordinal = oldColumn["ordinal"];
        var newColumn = { title: event.data.newValue };
        this.insertColumn(probe.id, newColumn, ordinal);

        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
            for (var _iterator7 = this._data.frames[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                var frame = _step7.value;

                this._updateNodeForFrame(frame);
            }
        } catch (err) {
            _didIteratorError7 = true;
            _iteratorError7 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion7 && _iterator7["return"]) {
                    _iterator7["return"]();
                }
            } finally {
                if (_didIteratorError7) {
                    throw _iteratorError7;
                }
            }
        }
    }
};
