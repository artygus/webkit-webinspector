var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2013, 2015 Apple Inc. All rights reserved.
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

WebInspector.TimelineDataGrid = (function (_WebInspector$DataGrid) {
    _inherits(TimelineDataGrid, _WebInspector$DataGrid);

    function TimelineDataGrid(treeOutline, columns, delegate, editCallback, deleteCallback) {
        _classCallCheck(this, TimelineDataGrid);

        _get(Object.getPrototypeOf(TimelineDataGrid.prototype), "constructor", this).call(this, columns, editCallback, deleteCallback);

        this._treeOutlineDataGridSynchronizer = new WebInspector.TreeOutlineDataGridSynchronizer(treeOutline, this, delegate);

        this.element.classList.add("timeline");

        this._filterableColumns = [];

        // Check if any of the cells can be filtered.
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = this.columns[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var _step$value = _slicedToArray(_step.value, 2);

                var identifier = _step$value[0];
                var column = _step$value[1];

                var scopeBar = column.scopeBar;

                if (!scopeBar) continue;

                this._filterableColumns.push(identifier);
                scopeBar.columnIdentifier = identifier;
                scopeBar.addEventListener(WebInspector.ScopeBar.Event.SelectionChanged, this._scopeBarSelectedItemsDidChange, this);
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

        if (this._filterableColumns.length > 1) {
            console.error("Creating a TimelineDataGrid with more than one filterable column is not yet supported.");
            return;
        }

        this.addEventListener(WebInspector.DataGrid.Event.SelectedNodeChanged, this._dataGridSelectedNodeChanged, this);
        this.addEventListener(WebInspector.DataGrid.Event.SortChanged, this._sort, this);

        window.addEventListener("resize", this);
    }

    _createClass(TimelineDataGrid, [{
        key: "reset",

        // Public

        value: function reset() {
            // May be overridden by subclasses. If so, they should call the superclass.

            this._hidePopover();
        }
    }, {
        key: "shown",
        value: function shown() {
            // May be overridden by subclasses. If so, they should call the superclass.

            this._treeOutlineDataGridSynchronizer.synchronize();
        }
    }, {
        key: "hidden",
        value: function hidden() {
            // May be overridden by subclasses. If so, they should call the superclass.

            this._hidePopover();
        }
    }, {
        key: "closed",
        value: function closed() {
            window.removeEventListener("resize", this);
        }
    }, {
        key: "treeElementForDataGridNode",
        value: function treeElementForDataGridNode(dataGridNode) {
            return this._treeOutlineDataGridSynchronizer.treeElementForDataGridNode(dataGridNode);
        }
    }, {
        key: "dataGridNodeForTreeElement",
        value: function dataGridNodeForTreeElement(treeElement) {
            return this._treeOutlineDataGridSynchronizer.dataGridNodeForTreeElement(treeElement);
        }
    }, {
        key: "callFramePopoverAnchorElement",
        value: function callFramePopoverAnchorElement() {
            // Implemented by subclasses.
            return null;
        }
    }, {
        key: "treeElementMatchesActiveScopeFilters",
        value: function treeElementMatchesActiveScopeFilters(treeElement) {
            var dataGridNode = this._treeOutlineDataGridSynchronizer.dataGridNodeForTreeElement(treeElement);
            console.assert(dataGridNode);

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._filterableColumns[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var identifier = _step2.value;

                    var scopeBar = this.columns.get(identifier).scopeBar;
                    if (!scopeBar || scopeBar.defaultItem.selected) continue;

                    var value = dataGridNode.data[identifier];
                    var matchesFilter = scopeBar.selectedItems.some(function (scopeBarItem) {
                        return scopeBarItem.value === value;
                    });

                    if (!matchesFilter) return false;
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

            return true;
        }
    }, {
        key: "addRowInSortOrder",
        value: function addRowInSortOrder(treeElement, dataGridNode, parentElement) {
            this._treeOutlineDataGridSynchronizer.associate(treeElement, dataGridNode);

            parentElement = parentElement || this._treeOutlineDataGridSynchronizer.treeOutline;
            var parentNode = parentElement.root ? this : this._treeOutlineDataGridSynchronizer.dataGridNodeForTreeElement(parentElement);

            console.assert(parentNode);

            if (this.sortColumnIdentifier) {
                var insertionIndex = insertionIndexForObjectInListSortedByFunction(dataGridNode, parentNode.children, this._sortComparator.bind(this));

                // Insert into the parent, which will cause the synchronizer to insert into the data grid.
                parentElement.insertChild(treeElement, insertionIndex);
            } else {
                // Append to the parent, which will cause the synchronizer to append to the data grid.
                parentElement.appendChild(treeElement);
            }
        }
    }, {
        key: "shouldIgnoreSelectionEvent",
        value: function shouldIgnoreSelectionEvent() {
            return this._ignoreSelectionEvent || false;
        }

        // Protected

    }, {
        key: "handleEvent",
        value: function handleEvent(event) {
            console.assert(event.type === "resize");

            this._windowResized(event);
        }
    }, {
        key: "dataGridNodeNeedsRefresh",
        value: function dataGridNodeNeedsRefresh(dataGridNode) {
            if (!this._dirtyDataGridNodes) this._dirtyDataGridNodes = new Set();
            this._dirtyDataGridNodes.add(dataGridNode);

            if (this._scheduledDataGridNodeRefreshIdentifier) return;

            this._scheduledDataGridNodeRefreshIdentifier = requestAnimationFrame(this._refreshDirtyDataGridNodes.bind(this));
        }

        // Private

    }, {
        key: "_refreshDirtyDataGridNodes",
        value: function _refreshDirtyDataGridNodes() {
            if (this._scheduledDataGridNodeRefreshIdentifier) {
                cancelAnimationFrame(this._scheduledDataGridNodeRefreshIdentifier);
                delete this._scheduledDataGridNodeRefreshIdentifier;
            }

            if (!this._dirtyDataGridNodes) return;

            var selectedNode = this.selectedNode;
            var sortComparator = this._sortComparator.bind(this);
            var treeOutline = this._treeOutlineDataGridSynchronizer.treeOutline;

            this._treeOutlineDataGridSynchronizer.enabled = false;

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this._dirtyDataGridNodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var dataGridNode = _step3.value;

                    dataGridNode.refresh();

                    if (!this.sortColumnIdentifier) continue;

                    if (dataGridNode === selectedNode) this._ignoreSelectionEvent = true;

                    var treeElement = this._treeOutlineDataGridSynchronizer.treeElementForDataGridNode(dataGridNode);
                    console.assert(treeElement);

                    console.assert(!treeElement.parent || treeElement.parent === treeOutline);
                    if (treeElement.parent === treeOutline) treeOutline.removeChild(treeElement);

                    console.assert(!dataGridNode.parent || dataGridNode.parent === this);
                    if (dataGridNode.parent === this) this.removeChild(dataGridNode);

                    var insertionIndex = insertionIndexForObjectInListSortedByFunction(dataGridNode, this.children, sortComparator);
                    treeOutline.insertChild(treeElement, insertionIndex);
                    this.insertChild(dataGridNode, insertionIndex);

                    // Adding the tree element back to the tree outline subjects it to filters.
                    // Make sure we keep the hidden state in-sync while the synchronizer is disabled.
                    dataGridNode.element.classList.toggle("hidden", treeElement.hidden);

                    if (dataGridNode === selectedNode) {
                        selectedNode.revealAndSelect();
                        delete this._ignoreSelectionEvent;
                    }
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

            this._treeOutlineDataGridSynchronizer.enabled = true;

            delete this._dirtyDataGridNodes;
        }
    }, {
        key: "_sort",
        value: function _sort() {
            var sortColumnIdentifier = this.sortColumnIdentifier;
            if (!sortColumnIdentifier) return;

            var selectedNode = this.selectedNode;
            this._ignoreSelectionEvent = true;

            this._treeOutlineDataGridSynchronizer.enabled = false;

            var treeOutline = this._treeOutlineDataGridSynchronizer.treeOutline;
            if (treeOutline.selectedTreeElement) treeOutline.selectedTreeElement.deselect(true);

            // Collect parent nodes that need their children sorted. So this in two phases since
            // traverseNextNode would get confused if we sort the tree while traversing it.
            var parentDataGridNodes = [this];
            var currentDataGridNode = this.children[0];
            while (currentDataGridNode) {
                if (currentDataGridNode.children.length) parentDataGridNodes.push(currentDataGridNode);
                currentDataGridNode = currentDataGridNode.traverseNextNode(false, null, true);
            }

            // Sort the children of collected parent nodes.
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = parentDataGridNodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var parentDataGridNode = _step4.value;

                    var parentTreeElement = parentDataGridNode === this ? treeOutline : this._treeOutlineDataGridSynchronizer.treeElementForDataGridNode(parentDataGridNode);
                    console.assert(parentTreeElement);

                    var childDataGridNodes = parentDataGridNode.children.slice();

                    parentDataGridNode.removeChildren();
                    parentTreeElement.removeChildren();

                    childDataGridNodes.sort(this._sortComparator.bind(this));

                    var _iteratorNormalCompletion5 = true;
                    var _didIteratorError5 = false;
                    var _iteratorError5 = undefined;

                    try {
                        for (var _iterator5 = childDataGridNodes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                            var dataGridNode = _step5.value;

                            var treeElement = this._treeOutlineDataGridSynchronizer.treeElementForDataGridNode(dataGridNode);
                            console.assert(treeElement);

                            parentTreeElement.appendChild(treeElement);
                            parentDataGridNode.appendChild(dataGridNode);

                            // Adding the tree element back to the tree outline subjects it to filters.
                            // Make sure we keep the hidden state in-sync while the synchronizer is disabled.
                            dataGridNode.element.classList.toggle("hidden", treeElement.hidden);
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

            this._treeOutlineDataGridSynchronizer.enabled = true;

            if (selectedNode) selectedNode.revealAndSelect();

            delete this._ignoreSelectionEvent;
        }
    }, {
        key: "_sortComparator",
        value: function _sortComparator(node1, node2) {
            var sortColumnIdentifier = this.sortColumnIdentifier;
            if (!sortColumnIdentifier) return 0;

            var sortDirection = this.sortOrder === WebInspector.DataGrid.SortOrder.Ascending ? 1 : -1;

            var value1 = node1.data[sortColumnIdentifier];
            var value2 = node2.data[sortColumnIdentifier];

            if (typeof value1 === "number" && typeof value2 === "number") {
                if (isNaN(value1) && isNaN(value2)) return 0;
                if (isNaN(value1)) return -sortDirection;
                if (isNaN(value2)) return sortDirection;
                return (value1 - value2) * sortDirection;
            }

            if (typeof value1 === "string" && typeof value2 === "string") return value1.localeCompare(value2) * sortDirection;

            if (value1 instanceof WebInspector.CallFrame || value2 instanceof WebInspector.CallFrame) {
                // Sort by function name if available, then fall back to the source code object.
                value1 = value1 && value1.functionName ? value1.functionName : value1 && value1.sourceCodeLocation ? value1.sourceCodeLocation.sourceCode : "";
                value2 = value2 && value2.functionName ? value2.functionName : value2 && value2.sourceCodeLocation ? value2.sourceCodeLocation.sourceCode : "";
            }

            if (value1 instanceof WebInspector.SourceCode || value2 instanceof WebInspector.SourceCode) {
                value1 = value1 ? value1.displayName || "" : "";
                value2 = value2 ? value2.displayName || "" : "";
            }

            // For everything else (mostly booleans).
            return (value1 < value2 ? -1 : value1 > value2 ? 1 : 0) * sortDirection;
        }
    }, {
        key: "_updateScopeBarForcedVisibility",
        value: function _updateScopeBarForcedVisibility() {
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = this._filterableColumns[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var identifier = _step6.value;

                    var scopeBar = this.columns.get(identifier).scopeBar;
                    if (scopeBar) {
                        this.element.classList.toggle(WebInspector.TimelineDataGrid.HasNonDefaultFilterStyleClassName, scopeBar.hasNonDefaultItemSelected());
                        break;
                    }
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
        }
    }, {
        key: "_scopeBarSelectedItemsDidChange",
        value: function _scopeBarSelectedItemsDidChange(event) {
            this._updateScopeBarForcedVisibility();

            var columnIdentifier = event.target.columnIdentifier;
            this.dispatchEventToListeners(WebInspector.TimelineDataGrid.Event.FiltersDidChange, { columnIdentifier: columnIdentifier });
        }
    }, {
        key: "_dataGridSelectedNodeChanged",
        value: function _dataGridSelectedNodeChanged(event) {
            if (!this.selectedNode) {
                this._hidePopover();
                return;
            }

            var record = this.selectedNode.record;
            if (!record || !record.callFrames || !record.callFrames.length) {
                this._hidePopover();
                return;
            }

            this._showPopoverForSelectedNodeSoon();
        }
    }, {
        key: "_windowResized",
        value: function _windowResized(event) {
            if (this._popover && this._popover.visible) this._updatePopoverForSelectedNode(false);
        }
    }, {
        key: "_showPopoverForSelectedNodeSoon",
        value: function _showPopoverForSelectedNodeSoon() {
            if (this._showPopoverTimeout) return;

            function delayedWork() {
                if (!this._popover) this._popover = new WebInspector.Popover();

                this._updatePopoverForSelectedNode(true);
            }

            this._showPopoverTimeout = setTimeout(delayedWork.bind(this), WebInspector.TimelineDataGrid.DelayedPopoverShowTimeout);
        }
    }, {
        key: "_hidePopover",
        value: function _hidePopover() {
            if (this._showPopoverTimeout) {
                clearTimeout(this._showPopoverTimeout);
                delete this._showPopoverTimeout;
            }

            if (this._popover) this._popover.dismiss();

            function delayedWork() {
                if (this._popoverCallStackTreeOutline) this._popoverCallStackTreeOutline.removeChildren();
            }

            if (this._hidePopoverContentClearTimeout) clearTimeout(this._hidePopoverContentClearTimeout);
            this._hidePopoverContentClearTimeout = setTimeout(delayedWork.bind(this), WebInspector.TimelineDataGrid.DelayedPopoverHideContentClearTimeout);
        }
    }, {
        key: "_updatePopoverForSelectedNode",
        value: function _updatePopoverForSelectedNode(updateContent) {
            if (!this._popover || !this.selectedNode) return;

            var targetPopoverElement = this.callFramePopoverAnchorElement();
            console.assert(targetPopoverElement, "TimelineDataGrid subclass should always return a valid element from callFramePopoverAnchorElement.");
            if (!targetPopoverElement) return;

            var targetFrame = WebInspector.Rect.rectFromClientRect(targetPopoverElement.getBoundingClientRect());

            // The element might be hidden if it does not have a width and height.
            if (!targetFrame.size.width && !targetFrame.size.height) return;

            if (this._hidePopoverContentClearTimeout) {
                clearTimeout(this._hidePopoverContentClearTimeout);
                delete this._hidePopoverContentClearTimeout;
            }

            if (updateContent) this._popover.content = this._createPopoverContent();

            this._popover.present(targetFrame.pad(2), [WebInspector.RectEdge.MAX_Y, WebInspector.RectEdge.MIN_Y, WebInspector.RectEdge.MAX_X]);
        }
    }, {
        key: "_createPopoverContent",
        value: function _createPopoverContent() {
            if (!this._popoverCallStackTreeOutline) {
                var contentElement = document.createElement("ol");
                contentElement.classList.add("timeline-data-grid-tree-outline");
                this._popoverCallStackTreeOutline = new WebInspector.TreeOutline(contentElement);
                this._popoverCallStackTreeOutline.onselect = this._popoverCallStackTreeElementSelected.bind(this);
            } else this._popoverCallStackTreeOutline.removeChildren();

            var callFrames = this.selectedNode.record.callFrames;
            for (var i = 0; i < callFrames.length; ++i) {
                var callFrameTreeElement = new WebInspector.CallFrameTreeElement(callFrames[i]);
                this._popoverCallStackTreeOutline.appendChild(callFrameTreeElement);
            }

            var content = document.createElement("div");
            content.className = "timeline-data-grid-popover";
            content.appendChild(this._popoverCallStackTreeOutline.element);
            return content;
        }
    }, {
        key: "_popoverCallStackTreeElementSelected",
        value: function _popoverCallStackTreeElementSelected(treeElement, selectedByUser) {
            this._popover.dismiss();

            console.assert(treeElement instanceof WebInspector.CallFrameTreeElement, "TreeElements in TimelineDataGrid popover should always be CallFrameTreeElements");
            var callFrame = treeElement.callFrame;
            if (!callFrame.sourceCodeLocation) return;

            WebInspector.showSourceCodeLocation(callFrame.sourceCodeLocation);
        }
    }], [{
        key: "createColumnScopeBar",
        value: function createColumnScopeBar(prefix, map) {
            prefix = prefix + "-timeline-data-grid-";

            var scopeBarItems = [];
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = map[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var _step7$value = _slicedToArray(_step7.value, 2);

                    var key = _step7$value[0];
                    var value = _step7$value[1];

                    var id = prefix + key;
                    var item = new WebInspector.ScopeBarItem(id, value);
                    item.value = key;
                    scopeBarItems.push(item);
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

            var allItem = new WebInspector.ScopeBarItem(prefix + "type-all", WebInspector.UIString("All"));
            scopeBarItems.unshift(allItem);

            return new WebInspector.ScopeBar(prefix + "scope-bar", scopeBarItems, allItem, true);
        }
    }]);

    return TimelineDataGrid;
})(WebInspector.DataGrid);

WebInspector.TimelineDataGrid.HasNonDefaultFilterStyleClassName = "has-non-default-filter";
WebInspector.TimelineDataGrid.DelayedPopoverShowTimeout = 250;
WebInspector.TimelineDataGrid.DelayedPopoverHideContentClearTimeout = 500;

WebInspector.TimelineDataGrid.Event = {
    FiltersDidChange: "timelinedatagrid-filters-did-change"
};
