var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2014, 2015 Apple Inc. All rights reserved.
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

WebInspector.TimelineDataGridNode = (function (_WebInspector$DataGridNode) {
    _inherits(TimelineDataGridNode, _WebInspector$DataGridNode);

    function TimelineDataGridNode(graphOnly, graphDataSource, hasChildren) {
        _classCallCheck(this, TimelineDataGridNode);

        _get(Object.getPrototypeOf(TimelineDataGridNode.prototype), "constructor", this).call(this, {}, hasChildren);

        this.copyable = false;

        this._graphOnly = graphOnly || false;
        this._graphDataSource = graphDataSource || null;

        if (graphDataSource) {
            this._graphContainerElement = document.createElement("div");
            this._timelineRecordBars = [];
        }
    }

    // Public

    _createClass(TimelineDataGridNode, [{
        key: "collapse",
        value: function collapse() {
            _get(Object.getPrototypeOf(TimelineDataGridNode.prototype), "collapse", this).call(this);

            if (!this._graphDataSource || !this.revealed) return;

            // Refresh to show child bars in our graph now that we collapsed.
            this.refreshGraph();
        }
    }, {
        key: "expand",
        value: function expand() {
            _get(Object.getPrototypeOf(TimelineDataGridNode.prototype), "expand", this).call(this);

            if (!this._graphDataSource || !this.revealed) return;

            // Refresh to remove child bars from our graph now that we expanded.
            this.refreshGraph();

            // Refresh child graphs since they haven't been updating while we were collapsed.
            var childNode = this.children[0];
            while (childNode) {
                if (childNode instanceof WebInspector.TimelineDataGridNode) childNode.refreshGraph();
                childNode = childNode.traverseNextNode(true, this);
            }
        }
    }, {
        key: "createCellContent",
        value: function createCellContent(columnIdentifier, cell) {
            if (columnIdentifier === "graph" && this._graphDataSource) {
                this.needsGraphRefresh();
                return this._graphContainerElement;
            }

            var value = this.data[columnIdentifier];
            if (!value) return "—";

            if (value instanceof WebInspector.SourceCodeLocation) {
                if (value.sourceCode instanceof WebInspector.Resource) {
                    cell.classList.add(WebInspector.ResourceTreeElement.ResourceIconStyleClassName);
                    cell.classList.add(value.sourceCode.type);
                } else if (value.sourceCode instanceof WebInspector.Script) {
                    if (value.sourceCode.url) {
                        cell.classList.add(WebInspector.ResourceTreeElement.ResourceIconStyleClassName);
                        cell.classList.add(WebInspector.Resource.Type.Script);
                    } else cell.classList.add(WebInspector.ScriptTreeElement.AnonymousScriptIconStyleClassName);
                } else console.error("Unknown SourceCode subclass.");

                // Give the whole cell a tooltip and keep it up to date.
                value.populateLiveDisplayLocationTooltip(cell);

                var fragment = document.createDocumentFragment();

                var goToArrowButtonLink = WebInspector.createSourceCodeLocationLink(value, false, true);
                fragment.appendChild(goToArrowButtonLink);

                var icon = document.createElement("div");
                icon.className = "icon";
                fragment.appendChild(icon);

                var titleElement = document.createElement("span");
                value.populateLiveDisplayLocationString(titleElement, "textContent");
                fragment.appendChild(titleElement);

                return fragment;
            }

            if (value instanceof WebInspector.CallFrame) {
                var callFrame = value;

                var isAnonymousFunction = false;
                var functionName = callFrame.functionName;
                if (!functionName) {
                    functionName = WebInspector.UIString("(anonymous function)");
                    isAnonymousFunction = true;
                }

                cell.classList.add(WebInspector.CallFrameView.FunctionIconStyleClassName);

                var fragment = document.createDocumentFragment();

                if (callFrame.sourceCodeLocation && callFrame.sourceCodeLocation.sourceCode) {
                    // Give the whole cell a tooltip and keep it up to date.
                    callFrame.sourceCodeLocation.populateLiveDisplayLocationTooltip(cell);

                    var goToArrowButtonLink = WebInspector.createSourceCodeLocationLink(callFrame.sourceCodeLocation, false, true);
                    fragment.appendChild(goToArrowButtonLink);

                    var icon = document.createElement("div");
                    icon.classList.add("icon");
                    fragment.appendChild(icon);

                    if (isAnonymousFunction) {
                        // For anonymous functions we show the resource or script icon and name.
                        if (callFrame.sourceCodeLocation.sourceCode instanceof WebInspector.Resource) {
                            cell.classList.add(WebInspector.ResourceTreeElement.ResourceIconStyleClassName);
                            cell.classList.add(callFrame.sourceCodeLocation.sourceCode.type);
                        } else if (callFrame.sourceCodeLocation.sourceCode instanceof WebInspector.Script) {
                            if (callFrame.sourceCodeLocation.sourceCode.url) {
                                cell.classList.add(WebInspector.ResourceTreeElement.ResourceIconStyleClassName);
                                cell.classList.add(WebInspector.Resource.Type.Script);
                            } else cell.classList.add(WebInspector.ScriptTreeElement.AnonymousScriptIconStyleClassName);
                        } else console.error("Unknown SourceCode subclass.");

                        var titleElement = document.createElement("span");
                        callFrame.sourceCodeLocation.populateLiveDisplayLocationString(titleElement, "textContent");

                        fragment.appendChild(titleElement);
                    } else {
                        // Show the function name and icon.
                        cell.classList.add(WebInspector.CallFrameView.FunctionIconStyleClassName);

                        fragment.append(functionName);

                        var subtitleElement = document.createElement("span");
                        subtitleElement.classList.add("subtitle");
                        callFrame.sourceCodeLocation.populateLiveDisplayLocationString(subtitleElement, "textContent");

                        fragment.appendChild(subtitleElement);
                    }

                    return fragment;
                }

                var icon = document.createElement("div");
                icon.classList.add("icon");

                fragment.append(icon, functionName);

                return fragment;
            }

            return _get(Object.getPrototypeOf(TimelineDataGridNode.prototype), "createCellContent", this).call(this, columnIdentifier, cell);
        }
    }, {
        key: "refresh",
        value: function refresh() {
            if (this._graphDataSource && this._graphOnly) {
                this.needsGraphRefresh();
                return;
            }

            _get(Object.getPrototypeOf(TimelineDataGridNode.prototype), "refresh", this).call(this);
        }
    }, {
        key: "refreshGraph",
        value: function refreshGraph() {
            if (!this._graphDataSource) return;

            if (this._scheduledGraphRefreshIdentifier) {
                cancelAnimationFrame(this._scheduledGraphRefreshIdentifier);
                this._scheduledGraphRefreshIdentifier = undefined;
            }

            // We are not visible, but an ancestor will draw our graph.
            // They need notified by using our needsGraphRefresh.
            console.assert(this.revealed);
            if (!this.revealed) return;

            var secondsPerPixel = this._graphDataSource.secondsPerPixel;
            console.assert(isFinite(secondsPerPixel) && secondsPerPixel > 0);

            var recordBarIndex = 0;

            function createBar(records, renderMode) {
                var timelineRecordBar = this._timelineRecordBars[recordBarIndex];
                if (!timelineRecordBar) timelineRecordBar = this._timelineRecordBars[recordBarIndex] = new WebInspector.TimelineRecordBar(records, renderMode);else {
                    timelineRecordBar.renderMode = renderMode;
                    timelineRecordBar.records = records;
                }
                timelineRecordBar.refresh(this._graphDataSource);
                if (!timelineRecordBar.element.parentNode) this._graphContainerElement.appendChild(timelineRecordBar.element);
                ++recordBarIndex;
            }

            function collectRecordsByType(records, recordsByTypeMap) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = records[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var record = _step.value;

                        var typedRecords = recordsByTypeMap.get(record.type);
                        if (!typedRecords) {
                            typedRecords = [];
                            recordsByTypeMap.set(record.type, typedRecords);
                        }

                        typedRecords.push(record);
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

            var boundCreateBar = createBar.bind(this);

            if (this.expanded) {
                // When expanded just use the records for this node.
                WebInspector.TimelineRecordBar.createCombinedBars(this.records, secondsPerPixel, this._graphDataSource, boundCreateBar);
            } else {
                // When collapsed use the records for this node and its descendants.
                // To share bars better, group records by type.

                var recordTypeMap = new Map();
                collectRecordsByType(this.records, recordTypeMap);

                var childNode = this.children[0];
                while (childNode) {
                    if (childNode instanceof WebInspector.TimelineDataGridNode) collectRecordsByType(childNode.records, recordTypeMap);
                    childNode = childNode.traverseNextNode(false, this);
                }

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = recordTypeMap.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var records = _step2.value;

                        WebInspector.TimelineRecordBar.createCombinedBars(records, secondsPerPixel, this._graphDataSource, boundCreateBar);
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

            // Remove the remaining unused TimelineRecordBars.
            for (; recordBarIndex < this._timelineRecordBars.length; ++recordBarIndex) {
                this._timelineRecordBars[recordBarIndex].records = null;
                this._timelineRecordBars[recordBarIndex].element.remove();
            }
        }
    }, {
        key: "needsGraphRefresh",
        value: function needsGraphRefresh() {
            if (!this.revealed) {
                // We are not visible, but an ancestor will be drawing our graph.
                // Notify the next visible ancestor that their graph needs to refresh.
                var ancestor = this;
                while (ancestor && !ancestor.root) {
                    if (ancestor.revealed && ancestor instanceof WebInspector.TimelineDataGridNode) {
                        ancestor.needsGraphRefresh();
                        return;
                    }

                    ancestor = ancestor.parent;
                }

                return;
            }

            if (!this._graphDataSource || this._scheduledGraphRefreshIdentifier) return;

            this._scheduledGraphRefreshIdentifier = requestAnimationFrame(this.refreshGraph.bind(this));
        }

        // Protected

    }, {
        key: "isRecordVisible",
        value: function isRecordVisible(record) {
            if (!this._graphDataSource) return false;

            if (isNaN(record.startTime)) return false;

            // If this bar is completely before the bounds of the graph, not visible.
            if (record.endTime < this.graphDataSource.startTime) return false;

            // If this record is completely after the current time or end time, not visible.
            if (record.startTime > this.graphDataSource.currentTime || record.startTime > this.graphDataSource.endTime) return false;

            return true;
        }
    }, {
        key: "records",
        get: function get() {
            // Implemented by subclasses.
            return [];
        }
    }, {
        key: "graphDataSource",
        get: function get() {
            return this._graphDataSource;
        }
    }, {
        key: "data",
        get: function get() {
            if (!this._graphDataSource) return {};

            var records = this.records || [];
            return { graph: records.length ? records[0].startTime : 0 };
        }
    }]);

    return TimelineDataGridNode;
})(WebInspector.DataGridNode);
