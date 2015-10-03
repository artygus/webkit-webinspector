var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2008, 2013-2015 Apple Inc. All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *        notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *        notice, this list of conditions and the following disclaimer in the
 *        documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.         IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

WebInspector.DataGrid = (function (_WebInspector$Object) {
    _inherits(DataGrid, _WebInspector$Object);

    function DataGrid(columnsData, editCallback, deleteCallback, preferredColumnOrder) {
        _classCallCheck(this, DataGrid);

        _get(Object.getPrototypeOf(DataGrid.prototype), "constructor", this).call(this);

        this.columns = new Map();
        this.orderedColumns = [];

        this._sortColumnIdentifier = null;
        this._sortOrder = WebInspector.DataGrid.SortOrder.Indeterminate;

        this.children = [];
        this.selectedNode = null;
        this.expandNodesWhenArrowing = false;
        this.root = true;
        this.hasChildren = false;
        this.expanded = true;
        this.revealed = true;
        this.selected = false;
        this.dataGrid = this;
        this.indentWidth = 15;
        this.resizers = [];
        this._columnWidthsInitialized = false;

        this.element = document.createElement("div");
        this.element.className = "data-grid";
        this.element.tabIndex = 0;
        this.element.addEventListener("keydown", this._keyDown.bind(this), false);
        this.element.copyHandler = this;

        this._headerTableElement = document.createElement("table");
        this._headerTableElement.className = "header";
        this._headerTableColumnGroupElement = this._headerTableElement.createChild("colgroup");
        this._headerTableBodyElement = this._headerTableElement.createChild("tbody");
        this._headerTableRowElement = this._headerTableBodyElement.createChild("tr");
        this._headerTableCellElements = new Map();

        this._scrollContainerElement = document.createElement("div");
        this._scrollContainerElement.className = "data-container";

        this._dataTableElement = this._scrollContainerElement.createChild("table");
        this._dataTableElement.className = "data";

        this._dataTableElement.addEventListener("mousedown", this._mouseDownInDataTable.bind(this));
        this._dataTableElement.addEventListener("click", this._clickInDataTable.bind(this));
        this._dataTableElement.addEventListener("contextmenu", this._contextMenuInDataTable.bind(this), true);

        // FIXME: Add a createCallback which is different from editCallback and has different
        // behavior when creating a new node.
        if (editCallback) {
            this._dataTableElement.addEventListener("dblclick", this._ondblclick.bind(this), false);
            this._editCallback = editCallback;
        }
        if (deleteCallback) this._deleteCallback = deleteCallback;

        this._dataTableColumnGroupElement = this._headerTableColumnGroupElement.cloneNode(true);
        this._dataTableElement.appendChild(this._dataTableColumnGroupElement);

        // This element is used by DataGridNodes to manipulate table rows and cells.
        this.dataTableBodyElement = this._dataTableElement.createChild("tbody");
        this._fillerRowElement = this.dataTableBodyElement.createChild("tr");
        this._fillerRowElement.className = "filler";

        this.element.appendChild(this._headerTableElement);
        this.element.appendChild(this._scrollContainerElement);

        if (preferredColumnOrder) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = preferredColumnOrder[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var columnIdentifier = _step.value;

                    this.insertColumn(columnIdentifier, columnsData[columnIdentifier]);
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
        } else {
            for (var columnIdentifier in columnsData) this.insertColumn(columnIdentifier, columnsData[columnIdentifier]);
        }

        this._generateSortIndicatorImagesIfNeeded();
    }

    _createClass(DataGrid, [{
        key: "_ondblclick",
        value: function _ondblclick(event) {
            if (this._editing || this._editingNode) return;

            this._startEditing(event.target);
        }
    }, {
        key: "_startEditingNodeAtColumnIndex",
        value: function _startEditingNodeAtColumnIndex(node, columnIndex) {
            console.assert(node, "Invalid argument: must provide DataGridNode to edit.");

            this._editing = true;
            this._editingNode = node;
            this._editingNode.select();

            var element = this._editingNode._element.children[columnIndex];
            WebInspector.startEditing(element, this._startEditingConfig(element));
            window.getSelection().setBaseAndExtent(element, 0, element, 1);
        }
    }, {
        key: "_startEditing",
        value: function _startEditing(target) {
            var element = target.enclosingNodeOrSelfWithNodeName("td");
            if (!element) return;

            this._editingNode = this.dataGridNodeFromNode(target);
            if (!this._editingNode) {
                if (!this.placeholderNode) return;
                this._editingNode = this.placeholderNode;
            }

            // Force editing the 1st column when editing the placeholder node
            if (this._editingNode.isPlaceholderNode) return this._startEditingNodeAtColumnIndex(this._editingNode, 0);

            this._editing = true;
            WebInspector.startEditing(element, this._startEditingConfig(element));

            window.getSelection().setBaseAndExtent(element, 0, element, 1);
        }
    }, {
        key: "_startEditingConfig",
        value: function _startEditingConfig(element) {
            return new WebInspector.EditingConfig(this._editingCommitted.bind(this), this._editingCancelled.bind(this), element.textContent);
        }
    }, {
        key: "_editingCommitted",
        value: function _editingCommitted(element, newText, oldText, context, moveDirection) {
            var columnIdentifier = element.__columnIdentifier;
            var columnIndex = this.orderedColumns.indexOf(columnIdentifier);

            var textBeforeEditing = this._editingNode.data[columnIdentifier] || "";
            var currentEditingNode = this._editingNode;

            // Returns an object with the next node and column index to edit, and whether it
            // is an appropriate time to re-sort the table rows. When editing, we want to
            // postpone sorting until we switch rows or wrap around a row.
            function determineNextCell(valueDidChange) {
                if (moveDirection === "forward") {
                    if (columnIndex < this.orderedColumns.length - 1) return { shouldSort: false, editingNode: currentEditingNode, columnIndex: columnIndex + 1 };

                    // Continue by editing the first column of the next row if it exists.
                    var nextDataGridNode = currentEditingNode.traverseNextNode(true, null, true);
                    return { shouldSort: true, editingNode: nextDataGridNode || currentEditingNode, columnIndex: 0 };
                }

                if (moveDirection === "backward") {
                    if (columnIndex > 0) return { shouldSort: false, editingNode: currentEditingNode, columnIndex: columnIndex - 1 };

                    var previousDataGridNode = currentEditingNode.traversePreviousNode(true, null, true);
                    return { shouldSort: true, editingNode: previousDataGridNode || currentEditingNode, columnIndex: this.orderedColumns.length - 1 };
                }

                // If we are not moving in any direction, then sort and stop.
                return { shouldSort: true };
            }

            function moveToNextCell(valueDidChange) {
                var moveCommand = determineNextCell.call(this, valueDidChange);
                if (moveCommand.shouldSort && this._sortAfterEditingCallback) {
                    this._sortAfterEditingCallback();
                    delete this._sortAfterEditingCallback;
                }
                if (moveCommand.editingNode) this._startEditingNodeAtColumnIndex(moveCommand.editingNode, moveCommand.columnIndex);
            }

            this._editingCancelled(element);

            // Update table's data model, and delegate to the callback to update other models.
            currentEditingNode.data[columnIdentifier] = newText.trim();
            this._editCallback(currentEditingNode, columnIdentifier, textBeforeEditing, newText, moveDirection);

            var textDidChange = textBeforeEditing.trim() !== newText.trim();
            moveToNextCell.call(this, textDidChange);
        }
    }, {
        key: "_editingCancelled",
        value: function _editingCancelled(element) {
            console.assert(this._editingNode.element === element.enclosingNodeOrSelfWithNodeName("tr"));
            delete this._editing;
            this._editingNode = null;
        }
    }, {
        key: "autoSizeColumns",
        value: function autoSizeColumns(minPercent, maxPercent, maxDescentLevel) {
            if (minPercent) minPercent = Math.min(minPercent, Math.floor(100 / this.orderedColumns.length));
            var widths = {};
            // For the first width approximation, use the character length of column titles.
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.columns[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _step2$value = _slicedToArray(_step2.value, 2);

                    var identifier = _step2$value[0];
                    var column = _step2$value[1];

                    widths[identifier] = (column["title"] || "").length;
                } // Now approximate the width of each column as max(title, cells).
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

            var children = maxDescentLevel ? this._enumerateChildren(this, [], maxDescentLevel + 1) : this.children;
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = children[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var node = _step3.value;
                    var _iteratorNormalCompletion9 = true;
                    var _didIteratorError9 = false;
                    var _iteratorError9 = undefined;

                    try {
                        for (var _iterator9 = this.columns.keys()[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                            var identifier = _step9.value;

                            var text = this.textForDataGridNodeColumn(node, identifier);
                            if (text.length > widths[identifier]) widths[identifier] = text.length;
                        }
                    } catch (err) {
                        _didIteratorError9 = true;
                        _iteratorError9 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion9 && _iterator9["return"]) {
                                _iterator9["return"]();
                            }
                        } finally {
                            if (_didIteratorError9) {
                                throw _iteratorError9;
                            }
                        }
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

            var totalColumnWidths = 0;
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this.columns.keys()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var identifier = _step4.value;

                    totalColumnWidths += widths[identifier];
                } // Compute percentages and clamp desired widths to min and max widths.
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

            var recoupPercent = 0;
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this.columns.keys()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var identifier = _step5.value;

                    var width = Math.round(100 * widths[identifier] / totalColumnWidths);
                    if (minPercent && width < minPercent) {
                        recoupPercent += minPercent - width;
                        width = minPercent;
                    } else if (maxPercent && width > maxPercent) {
                        recoupPercent -= width - maxPercent;
                        width = maxPercent;
                    }
                    widths[identifier] = width;
                }

                // If we assigned too much width due to the above, reduce column widths.
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

            while (minPercent && recoupPercent > 0) {
                var _iteratorNormalCompletion6 = true;
                var _didIteratorError6 = false;
                var _iteratorError6 = undefined;

                try {
                    for (var _iterator6 = this.columns.keys()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                        var identifier = _step6.value;

                        if (widths[identifier] > minPercent) {
                            --widths[identifier];
                            --recoupPercent;
                            if (!recoupPercent) break;
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

            // If extra width remains after clamping widths, expand column widths.
            while (maxPercent && recoupPercent < 0) {
                var _iteratorNormalCompletion7 = true;
                var _didIteratorError7 = false;
                var _iteratorError7 = undefined;

                try {
                    for (var _iterator7 = this.columns.keys()[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                        var identifier = _step7.value;

                        if (widths[identifier] < maxPercent) {
                            ++widths[identifier];
                            ++recoupPercent;
                            if (!recoupPercent) break;
                        }
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

            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = this.columns[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var _step8$value = _slicedToArray(_step8.value, 2);

                    var identifier = _step8$value[0];
                    var column = _step8$value[1];

                    column["element"].style.width = widths[identifier] + "%";
                }
            } catch (err) {
                _didIteratorError8 = true;
                _iteratorError8 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion8 && _iterator8["return"]) {
                        _iterator8["return"]();
                    }
                } finally {
                    if (_didIteratorError8) {
                        throw _iteratorError8;
                    }
                }
            }

            this._columnWidthsInitialized = false;
            this.updateLayout();
        }
    }, {
        key: "insertColumn",
        value: function insertColumn(columnIdentifier, columnData, insertionIndex) {
            if (insertionIndex === undefined) insertionIndex = this.orderedColumns.length;
            insertionIndex = Number.constrain(insertionIndex, 0, this.orderedColumns.length);

            var listeners = new WebInspector.EventListenerSet(this, "DataGrid column DOM listeners");

            // Copy configuration properties instead of keeping a reference to the passed-in object.
            var column = Object.shallowCopy(columnData);
            column["listeners"] = listeners;
            column["ordinal"] = insertionIndex;
            column["columnIdentifier"] = columnIdentifier;

            this.orderedColumns.splice(insertionIndex, 0, columnIdentifier);

            var _iteratorNormalCompletion10 = true;
            var _didIteratorError10 = false;
            var _iteratorError10 = undefined;

            try {
                for (var _iterator10 = this.columns[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                    var _step10$value = _slicedToArray(_step10.value, 2);

                    var identifier = _step10$value[0];
                    var existingColumn = _step10$value[1];

                    var ordinal = existingColumn["ordinal"];
                    if (ordinal >= insertionIndex) // Also adjust the "old" column at insertion index.
                        existingColumn["ordinal"] = ordinal + 1;
                }
            } catch (err) {
                _didIteratorError10 = true;
                _iteratorError10 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion10 && _iterator10["return"]) {
                        _iterator10["return"]();
                    }
                } finally {
                    if (_didIteratorError10) {
                        throw _iteratorError10;
                    }
                }
            }

            this.columns.set(columnIdentifier, column);

            if (column["disclosure"]) this.disclosureColumnIdentifier = columnIdentifier;

            var headerColumnElement = document.createElement("col");
            if (column["width"]) headerColumnElement.style.width = column["width"];
            column["element"] = headerColumnElement;
            var referenceElement = this._headerTableColumnGroupElement.children[insertionIndex];
            this._headerTableColumnGroupElement.insertBefore(headerColumnElement, referenceElement);

            var headerCellElement = document.createElement("th");
            headerCellElement.className = columnIdentifier + "-column";
            headerCellElement.columnIdentifier = columnIdentifier;
            if (column["aligned"]) headerCellElement.classList.add(column["aligned"]);
            this._headerTableCellElements.set(columnIdentifier, headerCellElement);
            var referenceElement = this._headerTableRowElement.children[insertionIndex];
            this._headerTableRowElement.insertBefore(headerCellElement, referenceElement);

            var div = headerCellElement.createChild("div");
            if (column["titleDOMFragment"]) div.appendChild(column["titleDOMFragment"]);else div.textContent = column["title"] || "";

            if (column["sortable"]) {
                listeners.register(headerCellElement, "click", this._headerCellClicked);
                headerCellElement.classList.add(WebInspector.DataGrid.SortableColumnStyleClassName);
            }

            if (column["group"]) headerCellElement.classList.add("column-group-" + column["group"]);

            if (column["collapsesGroup"]) {
                console.assert(column["group"] !== column["collapsesGroup"]);

                var dividerElement = headerCellElement.createChild("div");
                dividerElement.className = "divider";

                var collapseDiv = headerCellElement.createChild("div");
                collapseDiv.className = "collapser-button";
                collapseDiv.title = this._collapserButtonCollapseColumnsToolTip();
                listeners.register(collapseDiv, "mouseover", this._mouseoverColumnCollapser);
                listeners.register(collapseDiv, "mouseout", this._mouseoutColumnCollapser);
                listeners.register(collapseDiv, "click", this._clickInColumnCollapser);

                headerCellElement.collapsesGroup = column["collapsesGroup"];
                headerCellElement.classList.add("collapser");
            }

            this._headerTableColumnGroupElement.span = this.orderedColumns.length;

            var dataColumnElement = headerColumnElement.cloneNode();
            var referenceElement = this._dataTableColumnGroupElement.children[insertionIndex];
            this._dataTableColumnGroupElement.insertBefore(dataColumnElement, referenceElement);
            column["bodyElement"] = dataColumnElement;

            var fillerCellElement = document.createElement("td");
            fillerCellElement.className = columnIdentifier + "-column";
            fillerCellElement.__columnIdentifier = columnIdentifier;
            if (column["group"]) fillerCellElement.classList.add("column-group-" + column["group"]);
            var referenceElement = this._fillerRowElement.children[insertionIndex];
            this._fillerRowElement.insertBefore(fillerCellElement, referenceElement);

            listeners.install();

            if (column["hidden"]) this._hideColumn(columnIdentifier);
        }
    }, {
        key: "removeColumn",
        value: function removeColumn(columnIdentifier) {
            console.assert(this.columns.has(columnIdentifier));
            var removedColumn = this.columns.get(columnIdentifier);
            this.columns["delete"](columnIdentifier);
            this.orderedColumns.splice(this.orderedColumns.indexOf(columnIdentifier), 1);

            var removedOrdinal = removedColumn["ordinal"];
            var _iteratorNormalCompletion11 = true;
            var _didIteratorError11 = false;
            var _iteratorError11 = undefined;

            try {
                for (var _iterator11 = this.columns[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                    var _step11$value = _slicedToArray(_step11.value, 2);

                    var identifier = _step11$value[0];
                    var column = _step11$value[1];

                    var ordinal = column["ordinal"];
                    if (ordinal > removedOrdinal) column["ordinal"] = ordinal - 1;
                }
            } catch (err) {
                _didIteratorError11 = true;
                _iteratorError11 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion11 && _iterator11["return"]) {
                        _iterator11["return"]();
                    }
                } finally {
                    if (_didIteratorError11) {
                        throw _iteratorError11;
                    }
                }
            }

            removedColumn["listeners"].uninstall(true);

            if (removedColumn["disclosure"]) delete this.disclosureColumnIdentifier;

            if (this.sortColumnIdentifier === columnIdentifier) this.sortColumnIdentifier = null;

            this._headerTableCellElements["delete"](columnIdentifier);
            this._headerTableRowElement.children[removedOrdinal].remove();
            this._headerTableColumnGroupElement.children[removedOrdinal].remove();
            this._dataTableColumnGroupElement.children[removedOrdinal].remove();
            this._fillerRowElement.children[removedOrdinal].remove();

            this._headerTableColumnGroupElement.span = this.orderedColumns.length;

            var _iteratorNormalCompletion12 = true;
            var _didIteratorError12 = false;
            var _iteratorError12 = undefined;

            try {
                for (var _iterator12 = this.children[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                    var child = _step12.value;

                    child.refresh();
                }
            } catch (err) {
                _didIteratorError12 = true;
                _iteratorError12 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion12 && _iterator12["return"]) {
                        _iterator12["return"]();
                    }
                } finally {
                    if (_didIteratorError12) {
                        throw _iteratorError12;
                    }
                }
            }
        }
    }, {
        key: "_enumerateChildren",
        value: function _enumerateChildren(rootNode, result, maxLevel) {
            if (!rootNode.root) result.push(rootNode);
            if (!maxLevel) return;
            for (var i = 0; i < rootNode.children.length; ++i) this._enumerateChildren(rootNode.children[i], result, maxLevel - 1);
            return result;
        }

        // Updates the widths of the table, including the positions of the column
        // resizers.
        //
        // IMPORTANT: This function MUST be called once after the element of the
        // DataGrid is attached to its parent element and every subsequent time the
        // width of the parent element is changed in order to make it possible to
        // resize the columns.
        //
        // If this function is not called after the DataGrid is attached to its
        // parent element, then the DataGrid's columns will not be resizable.
    }, {
        key: "updateLayout",
        value: function updateLayout() {
            // Do not attempt to use offsetes if we're not attached to the document tree yet.
            if (!this._columnWidthsInitialized && this.element.offsetWidth) {
                // Give all the columns initial widths now so that during a resize,
                // when the two columns that get resized get a percent value for
                // their widths, all the other columns already have percent values
                // for their widths.
                var headerTableColumnElements = this._headerTableColumnGroupElement.children;
                var tableWidth = this._dataTableElement.offsetWidth;
                var numColumns = headerTableColumnElements.length;
                for (var i = 0; i < numColumns; i++) {
                    var headerCellElement = this._headerTableBodyElement.rows[0].cells[i];
                    if (this._isColumnVisible(headerCellElement.columnIdentifier)) {
                        var columnWidth = headerCellElement.offsetWidth;
                        var percentWidth = columnWidth / tableWidth * 100 + "%";
                        this._headerTableColumnGroupElement.children[i].style.width = percentWidth;
                        this._dataTableColumnGroupElement.children[i].style.width = percentWidth;
                    } else {
                        this._headerTableColumnGroupElement.children[i].style.width = 0;
                        this._dataTableColumnGroupElement.children[i].style.width = 0;
                    }
                }

                this._columnWidthsInitialized = true;
            }

            this._positionResizerElements();
            this.dispatchEventToListeners(WebInspector.DataGrid.Event.DidLayout);
        }
    }, {
        key: "columnWidthsMap",
        value: function columnWidthsMap() {
            var result = {};
            var _iteratorNormalCompletion13 = true;
            var _didIteratorError13 = false;
            var _iteratorError13 = undefined;

            try {
                for (var _iterator13 = this.columns[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                    var _step13$value = _slicedToArray(_step13.value, 2);

                    var identifier = _step13$value[0];
                    var column = _step13$value[1];

                    var width = this._headerTableColumnGroupElement.children[column["ordinal"]].style.width;
                    result[columnIdentifier] = parseFloat(width);
                }
            } catch (err) {
                _didIteratorError13 = true;
                _iteratorError13 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion13 && _iterator13["return"]) {
                        _iterator13["return"]();
                    }
                } finally {
                    if (_didIteratorError13) {
                        throw _iteratorError13;
                    }
                }
            }

            return result;
        }
    }, {
        key: "applyColumnWidthsMap",
        value: function applyColumnWidthsMap(columnWidthsMap) {
            var _iteratorNormalCompletion14 = true;
            var _didIteratorError14 = false;
            var _iteratorError14 = undefined;

            try {
                for (var _iterator14 = this.columns[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                    var _step14$value = _slicedToArray(_step14.value, 2);

                    var identifier = _step14$value[0];
                    var column = _step14$value[1];

                    var width = (columnWidthsMap[identifier] || 0) + "%";
                    var ordinal = column["ordinal"];
                    this._headerTableColumnGroupElement.children[ordinal].style.width = width;
                    this._dataTableColumnGroupElement.children[ordinal].style.width = width;
                }
            } catch (err) {
                _didIteratorError14 = true;
                _iteratorError14 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion14 && _iterator14["return"]) {
                        _iterator14["return"]();
                    }
                } finally {
                    if (_didIteratorError14) {
                        throw _iteratorError14;
                    }
                }
            }

            this.updateLayout();
        }
    }, {
        key: "_isColumnVisible",
        value: function _isColumnVisible(columnIdentifier) {
            return !this.columns.get(columnIdentifier)["hidden"];
        }
    }, {
        key: "_showColumn",
        value: function _showColumn(columnIdentifier) {
            delete this.columns.get(columnIdentifier)["hidden"];
        }
    }, {
        key: "_hideColumn",
        value: function _hideColumn(columnIdentifier) {
            var column = this.columns.get(columnIdentifier);
            column["hidden"] = true;

            var columnElement = column["element"];
            columnElement.style.width = 0;

            this._columnWidthsInitialized = false;
        }
    }, {
        key: "isScrolledToLastRow",
        value: function isScrolledToLastRow() {
            return this._scrollContainerElement.isScrolledToBottom();
        }
    }, {
        key: "scrollToLastRow",
        value: function scrollToLastRow() {
            this._scrollContainerElement.scrollTop = this._scrollContainerElement.scrollHeight - this._scrollContainerElement.offsetHeight;
        }
    }, {
        key: "_positionResizerElements",
        value: function _positionResizerElements() {
            var left = 0;
            var previousResizer = null;

            // Make n - 1 resizers for n columns.
            for (var i = 0; i < this.orderedColumns.length - 1; ++i) {
                // Create a new resizer if one does not exist for this column.
                if (i === this.resizers.length) {
                    resizer = new WebInspector.Resizer(WebInspector.Resizer.RuleOrientation.Vertical, this);
                    this.resizers[i] = resizer;
                    // This resizer is associated with the column to its right.
                    this.element.appendChild(resizer.element);
                }

                var resizer = this.resizers[i];

                // Get the width of the cell in the first (and only) row of the
                // header table in order to determine the width of the column, since
                // it is not possible to query a column for its width.
                left += this._headerTableBodyElement.rows[0].cells[i].offsetWidth;

                if (this._isColumnVisible(this.orderedColumns[i])) {
                    resizer.element.style.removeProperty("display");
                    resizer.element.style.left = left + "px";
                    resizer[WebInspector.DataGrid.PreviousColumnOrdinalSymbol] = i;
                    if (previousResizer) previousResizer[WebInspector.DataGrid.NextColumnOrdinalSymbol] = i;
                    previousResizer = resizer;
                } else {
                    resizer.element.style.setProperty("display", "none");
                    resizer[WebInspector.DataGrid.PreviousColumnOrdinalSymbol] = 0;
                    resizer[WebInspector.DataGrid.NextColumnOrdinalSymbol] = 0;
                }
            }
            if (previousResizer) previousResizer[WebInspector.DataGrid.NextColumnOrdinalSymbol] = this.orderedColumns.length - 1;
        }
    }, {
        key: "addPlaceholderNode",
        value: function addPlaceholderNode() {
            if (this.placeholderNode) this.placeholderNode.makeNormal();

            var emptyData = {};
            var _iteratorNormalCompletion15 = true;
            var _didIteratorError15 = false;
            var _iteratorError15 = undefined;

            try {
                for (var _iterator15 = this.columns.keys()[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
                    var identifier = _step15.value;

                    emptyData[identifier] = "";
                }
            } catch (err) {
                _didIteratorError15 = true;
                _iteratorError15 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion15 && _iterator15["return"]) {
                        _iterator15["return"]();
                    }
                } finally {
                    if (_didIteratorError15) {
                        throw _iteratorError15;
                    }
                }
            }

            this.placeholderNode = new WebInspector.PlaceholderDataGridNode(emptyData);
            this.appendChild(this.placeholderNode);
        }
    }, {
        key: "appendChild",
        value: function appendChild(child) {
            this.insertChild(child, this.children.length);
        }
    }, {
        key: "insertChild",
        value: function insertChild(child, index) {
            console.assert(child);
            if (!child) return;

            console.assert(child.parent !== this);
            if (child.parent === this) return;

            if (child.parent) child.parent.removeChild(child);

            this.children.splice(index, 0, child);
            this.hasChildren = true;

            child.parent = this;
            child.dataGrid = this.dataGrid;
            child._recalculateSiblings(index);

            delete child._depth;
            delete child._revealed;
            delete child._attached;
            child._shouldRefreshChildren = true;

            var current = child.children[0];
            while (current) {
                current.dataGrid = this.dataGrid;
                delete current._depth;
                delete current._revealed;
                delete current._attached;
                current._shouldRefreshChildren = true;
                current = current.traverseNextNode(false, child, true);
            }

            if (this.expanded) child._attach();
        }
    }, {
        key: "removeChild",
        value: function removeChild(child) {
            console.assert(child);
            if (!child) return;

            console.assert(child.parent === this);
            if (child.parent !== this) return;

            child.deselect();
            child._detach();

            this.children.remove(child, true);

            if (child.previousSibling) child.previousSibling.nextSibling = child.nextSibling;
            if (child.nextSibling) child.nextSibling.previousSibling = child.previousSibling;

            child.dataGrid = null;
            child.parent = null;
            child.nextSibling = null;
            child.previousSibling = null;

            if (this.children.length <= 0) this.hasChildren = false;

            console.assert(!child.isPlaceholderNode, "Shouldn't delete the placeholder node.");
        }
    }, {
        key: "removeChildren",
        value: function removeChildren() {
            for (var i = 0; i < this.children.length; ++i) {
                var child = this.children[i];
                child.deselect();
                child._detach();

                child.dataGrid = null;
                child.parent = null;
                child.nextSibling = null;
                child.previousSibling = null;
            }

            this.children = [];
            this.hasChildren = false;
        }
    }, {
        key: "removeChildrenRecursive",
        value: function removeChildrenRecursive() {
            var childrenToRemove = this.children;

            var child = this.children[0];
            while (child) {
                if (child.children.length) childrenToRemove = childrenToRemove.concat(child.children);
                child = child.traverseNextNode(false, this, true);
            }

            for (var i = 0; i < childrenToRemove.length; ++i) {
                child = childrenToRemove[i];
                child.deselect();
                child._detach();

                child.children = [];
                child.dataGrid = null;
                child.parent = null;
                child.nextSibling = null;
                child.previousSibling = null;
            }

            this.children = [];
        }
    }, {
        key: "sortNodes",
        value: function sortNodes(comparator) {
            if (this._sortNodesRequestId) return;

            this._sortNodesRequestId = window.requestAnimationFrame(this._sortNodesCallback.bind(this, comparator));
        }
    }, {
        key: "sortNodesImmediately",
        value: function sortNodesImmediately(comparator) {
            this._sortNodesCallback(comparator);
        }
    }, {
        key: "_sortNodesCallback",
        value: function _sortNodesCallback(comparator) {
            function comparatorWrapper(aRow, bRow) {
                var aNode = aRow._dataGridNode;
                var bNode = bRow._dataGridNode;

                if (aNode.isPlaceholderNode) return 1;
                if (bNode.isPlaceholderNode) return -1;

                var reverseFactor = this.sortOrder !== WebInspector.DataGrid.SortOrder.Ascending ? -1 : 1;
                return reverseFactor * comparator(aNode, bNode);
            }

            this._sortNodesRequestId = undefined;

            if (this._editing) {
                this._sortAfterEditingCallback = this.sortNodes.bind(this, comparator);
                return;
            }

            var tbody = this.dataTableBodyElement;
            var childNodes = tbody.childNodes;
            var fillerRowElement = tbody.lastChild;

            var sortedRowElements = Array.prototype.slice.call(childNodes, 0, childNodes.length - 1);
            sortedRowElements.sort(comparatorWrapper.bind(this));

            tbody.removeChildren();

            var previousSiblingNode = null;
            var _iteratorNormalCompletion16 = true;
            var _didIteratorError16 = false;
            var _iteratorError16 = undefined;

            try {
                for (var _iterator16 = sortedRowElements[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
                    var rowElement = _step16.value;

                    var node = rowElement._dataGridNode;
                    node.previousSibling = previousSiblingNode;
                    if (previousSiblingNode) previousSiblingNode.nextSibling = node;
                    tbody.appendChild(rowElement);
                    previousSiblingNode = node;
                }
            } catch (err) {
                _didIteratorError16 = true;
                _iteratorError16 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion16 && _iterator16["return"]) {
                        _iterator16["return"]();
                    }
                } finally {
                    if (_didIteratorError16) {
                        throw _iteratorError16;
                    }
                }
            }

            if (previousSiblingNode) previousSiblingNode.nextSibling = null;

            tbody.appendChild(fillerRowElement); // We expect to find a filler row when attaching nodes.
        }
    }, {
        key: "_keyDown",
        value: function _keyDown(event) {
            if (!this.selectedNode || event.shiftKey || event.metaKey || event.ctrlKey || this._editing) return;

            var handled = false;
            var nextSelectedNode;
            if (event.keyIdentifier === "Up" && !event.altKey) {
                nextSelectedNode = this.selectedNode.traversePreviousNode(true);
                while (nextSelectedNode && !nextSelectedNode.selectable) nextSelectedNode = nextSelectedNode.traversePreviousNode(true);
                handled = nextSelectedNode ? true : false;
            } else if (event.keyIdentifier === "Down" && !event.altKey) {
                nextSelectedNode = this.selectedNode.traverseNextNode(true);
                while (nextSelectedNode && !nextSelectedNode.selectable) nextSelectedNode = nextSelectedNode.traverseNextNode(true);
                handled = nextSelectedNode ? true : false;
            } else if (event.keyIdentifier === "Left") {
                if (this.selectedNode.expanded) {
                    if (event.altKey) this.selectedNode.collapseRecursively();else this.selectedNode.collapse();
                    handled = true;
                } else if (this.selectedNode.parent && !this.selectedNode.parent.root) {
                    handled = true;
                    if (this.selectedNode.parent.selectable) {
                        nextSelectedNode = this.selectedNode.parent;
                        handled = nextSelectedNode ? true : false;
                    } else if (this.selectedNode.parent) this.selectedNode.parent.collapse();
                }
            } else if (event.keyIdentifier === "Right") {
                if (!this.selectedNode.revealed) {
                    this.selectedNode.reveal();
                    handled = true;
                } else if (this.selectedNode.hasChildren) {
                    handled = true;
                    if (this.selectedNode.expanded) {
                        nextSelectedNode = this.selectedNode.children[0];
                        handled = nextSelectedNode ? true : false;
                    } else {
                        if (event.altKey) this.selectedNode.expandRecursively();else this.selectedNode.expand();
                    }
                }
            } else if (event.keyCode === 8 || event.keyCode === 46) {
                if (this._deleteCallback) {
                    handled = true;
                    this._deleteCallback(this.selectedNode);
                }
            } else if (isEnterKey(event)) {
                if (this._editCallback) {
                    handled = true;
                    this._startEditing(this.selectedNode._element.children[0]);
                }
            }

            if (nextSelectedNode) {
                nextSelectedNode.reveal();
                nextSelectedNode.select();
            }

            if (handled) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }, {
        key: "expand",
        value: function expand() {
            // This is the root, do nothing.
        }
    }, {
        key: "collapse",
        value: function collapse() {
            // This is the root, do nothing.
        }
    }, {
        key: "reveal",
        value: function reveal() {
            // This is the root, do nothing.
        }
    }, {
        key: "revealAndSelect",
        value: function revealAndSelect() {
            // This is the root, do nothing.
        }
    }, {
        key: "dataGridNodeFromNode",
        value: function dataGridNodeFromNode(target) {
            var rowElement = target.enclosingNodeOrSelfWithNodeName("tr");
            return rowElement && rowElement._dataGridNode;
        }
    }, {
        key: "dataGridNodeFromPoint",
        value: function dataGridNodeFromPoint(x, y) {
            var node = this._dataTableElement.ownerDocument.elementFromPoint(x, y);
            var rowElement = node.enclosingNodeOrSelfWithNodeName("tr");
            return rowElement && rowElement._dataGridNode;
        }
    }, {
        key: "_headerCellClicked",
        value: function _headerCellClicked(event) {
            var cell = event.target.enclosingNodeOrSelfWithNodeName("th");
            if (!cell || !cell.columnIdentifier || !cell.classList.contains(WebInspector.DataGrid.SortableColumnStyleClassName)) return;

            var clickedColumnIdentifier = cell.columnIdentifier;
            if (this.sortColumnIdentifier === clickedColumnIdentifier) {
                if (this.sortOrder !== WebInspector.DataGrid.SortOrder.Descending) this.sortOrder = WebInspector.DataGrid.SortOrder.Descending;else this.sortOrder = WebInspector.DataGrid.SortOrder.Ascending;
            } else this.sortColumnIdentifier = clickedColumnIdentifier;
        }
    }, {
        key: "_mouseoverColumnCollapser",
        value: function _mouseoverColumnCollapser(event) {
            var cell = event.target.enclosingNodeOrSelfWithNodeName("th");
            if (!cell || !cell.collapsesGroup) return;

            cell.classList.add("mouse-over-collapser");
        }
    }, {
        key: "_mouseoutColumnCollapser",
        value: function _mouseoutColumnCollapser(event) {
            var cell = event.target.enclosingNodeOrSelfWithNodeName("th");
            if (!cell || !cell.collapsesGroup) return;

            cell.classList.remove("mouse-over-collapser");
        }
    }, {
        key: "_clickInColumnCollapser",
        value: function _clickInColumnCollapser(event) {
            var cell = event.target.enclosingNodeOrSelfWithNodeName("th");
            if (!cell || !cell.collapsesGroup) return;

            this._collapseColumnGroupWithCell(cell);

            event.stopPropagation();
            event.preventDefault();
        }
    }, {
        key: "collapseColumnGroup",
        value: function collapseColumnGroup(columnGroup) {
            var collapserColumnIdentifier = null;
            var _iteratorNormalCompletion17 = true;
            var _didIteratorError17 = false;
            var _iteratorError17 = undefined;

            try {
                for (var _iterator17 = this.columns[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
                    var _step17$value = _slicedToArray(_step17.value, 2);

                    var identifier = _step17$value[0];
                    var column = _step17$value[1];

                    if (column["collapsesGroup"] === columnGroup) {
                        collapserColumnIdentifier = identifier;
                        break;
                    }
                }
            } catch (err) {
                _didIteratorError17 = true;
                _iteratorError17 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion17 && _iterator17["return"]) {
                        _iterator17["return"]();
                    }
                } finally {
                    if (_didIteratorError17) {
                        throw _iteratorError17;
                    }
                }
            }

            console.assert(collapserColumnIdentifier);
            if (!collapserColumnIdentifier) return;

            var cell = this._headerTableCellElements.get(collapserColumnIdentifier);
            this._collapseColumnGroupWithCell(cell);
        }
    }, {
        key: "_collapseColumnGroupWithCell",
        value: function _collapseColumnGroupWithCell(cell) {
            var columnsWillCollapse = cell.classList.toggle("collapsed");

            this.willToggleColumnGroup(cell.collapsesGroup, columnsWillCollapse);

            var showOrHide = columnsWillCollapse ? this._hideColumn : this._showColumn;
            var _iteratorNormalCompletion18 = true;
            var _didIteratorError18 = false;
            var _iteratorError18 = undefined;

            try {
                for (var _iterator18 = this.columns[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
                    var _step18$value = _slicedToArray(_step18.value, 2);

                    var identifier = _step18$value[0];
                    var column = _step18$value[1];

                    if (column["group"] === cell.collapsesGroup) showOrHide.call(this, identifier);
                }
            } catch (err) {
                _didIteratorError18 = true;
                _iteratorError18 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion18 && _iterator18["return"]) {
                        _iterator18["return"]();
                    }
                } finally {
                    if (_didIteratorError18) {
                        throw _iteratorError18;
                    }
                }
            }

            var collapserButton = cell.querySelector(".collapser-button");
            if (collapserButton) collapserButton.title = columnsWillCollapse ? this._collapserButtonExpandColumnsToolTip() : this._collapserButtonCollapseColumnsToolTip();

            this.didToggleColumnGroup(cell.collapsesGroup, columnsWillCollapse);
        }
    }, {
        key: "_collapserButtonCollapseColumnsToolTip",
        value: function _collapserButtonCollapseColumnsToolTip() {
            return WebInspector.UIString("Collapse columns");
        }
    }, {
        key: "_collapserButtonExpandColumnsToolTip",
        value: function _collapserButtonExpandColumnsToolTip() {
            return WebInspector.UIString("Expand columns");
        }
    }, {
        key: "willToggleColumnGroup",
        value: function willToggleColumnGroup(columnGroup, willCollapse) {
            // Implemented by subclasses if needed.
        }
    }, {
        key: "didToggleColumnGroup",
        value: function didToggleColumnGroup(columnGroup, didCollapse) {
            // Implemented by subclasses if needed.
        }
    }, {
        key: "headerTableHeader",
        value: function headerTableHeader(columnIdentifier) {
            return this._headerTableCellElements.get(columnIdentifier);
        }
    }, {
        key: "_generateSortIndicatorImagesIfNeeded",
        value: function _generateSortIndicatorImagesIfNeeded() {
            if (WebInspector.DataGrid._generatedSortIndicatorImages) return;

            WebInspector.DataGrid._generatedSortIndicatorImages = true;

            var specifications = { arrow: {
                    fillColor: [81, 81, 81]
                } };

            generateColoredImagesForCSS("Images/SortIndicatorDownArrow.svg", specifications, 9, 8, "data-grid-sort-indicator-down-");
            generateColoredImagesForCSS("Images/SortIndicatorUpArrow.svg", specifications, 9, 8, "data-grid-sort-indicator-up-");
        }
    }, {
        key: "_mouseDownInDataTable",
        value: function _mouseDownInDataTable(event) {
            var gridNode = this.dataGridNodeFromNode(event.target);
            if (!gridNode || !gridNode.selectable) return;

            if (gridNode.isEventWithinDisclosureTriangle(event)) return;

            if (event.metaKey) {
                if (gridNode.selected) gridNode.deselect();else gridNode.select();
            } else gridNode.select();
        }
    }, {
        key: "_contextMenuInDataTable",
        value: function _contextMenuInDataTable(event) {
            var contextMenu = new WebInspector.ContextMenu(event);

            var gridNode = this.dataGridNodeFromNode(event.target);
            if (this.dataGrid._refreshCallback && (!gridNode || gridNode !== this.placeholderNode)) contextMenu.appendItem(WebInspector.UIString("Refresh"), this._refreshCallback.bind(this));

            if (gridNode && gridNode.selectable && gridNode.copyable && !gridNode.isEventWithinDisclosureTriangle(event)) {
                contextMenu.appendItem(WebInspector.UIString("Copy Row"), this._copyRow.bind(this, event.target));

                if (this.dataGrid._editCallback) {
                    if (gridNode === this.placeholderNode) contextMenu.appendItem(WebInspector.UIString("Add New"), this._startEditing.bind(this, event.target));else {
                        var element = event.target.enclosingNodeOrSelfWithNodeName("td");
                        var columnIdentifier = element.__columnIdentifier;
                        var columnTitle = this.dataGrid.columns.get(columnIdentifier)["title"];
                        contextMenu.appendItem(WebInspector.UIString("Edit “%s”").format(columnTitle), this._startEditing.bind(this, event.target));
                    }
                }
                if (this.dataGrid._deleteCallback && gridNode !== this.placeholderNode) contextMenu.appendItem(WebInspector.UIString("Delete"), this._deleteCallback.bind(this, gridNode));
            }

            contextMenu.show();
        }
    }, {
        key: "_clickInDataTable",
        value: function _clickInDataTable(event) {
            var gridNode = this.dataGridNodeFromNode(event.target);
            if (!gridNode || !gridNode.hasChildren) return;

            if (!gridNode.isEventWithinDisclosureTriangle(event)) return;

            if (gridNode.expanded) {
                if (event.altKey) gridNode.collapseRecursively();else gridNode.collapse();
            } else {
                if (event.altKey) gridNode.expandRecursively();else gridNode.expand();
            }
        }
    }, {
        key: "textForDataGridNodeColumn",
        value: function textForDataGridNodeColumn(node, columnIdentifier) {
            var data = node.data[columnIdentifier];
            return (data instanceof Node ? data.textContent : data) || "";
        }
    }, {
        key: "_copyTextForDataGridNode",
        value: function _copyTextForDataGridNode(node) {
            var fields = [];
            var _iteratorNormalCompletion19 = true;
            var _didIteratorError19 = false;
            var _iteratorError19 = undefined;

            try {
                for (var _iterator19 = node.dataGrid.orderedColumns[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
                    var identifier = _step19.value;

                    fields.push(this.textForDataGridNodeColumn(node, identifier));
                }
            } catch (err) {
                _didIteratorError19 = true;
                _iteratorError19 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion19 && _iterator19["return"]) {
                        _iterator19["return"]();
                    }
                } finally {
                    if (_didIteratorError19) {
                        throw _iteratorError19;
                    }
                }
            }

            var tabSeparatedValues = fields.join("\t");
            return tabSeparatedValues;
        }
    }, {
        key: "handleBeforeCopyEvent",
        value: function handleBeforeCopyEvent(event) {
            if (this.selectedNode && window.getSelection().isCollapsed) event.preventDefault();
        }
    }, {
        key: "handleCopyEvent",
        value: function handleCopyEvent(event) {
            if (!this.selectedNode || !window.getSelection().isCollapsed) return;

            var copyText = this._copyTextForDataGridNode(this.selectedNode);
            event.clipboardData.setData("text/plain", copyText);
            event.stopPropagation();
            event.preventDefault();
        }
    }, {
        key: "_copyRow",
        value: function _copyRow(target) {
            var gridNode = this.dataGridNodeFromNode(target);
            if (!gridNode) return;

            var copyText = this._copyTextForDataGridNode(gridNode);
            InspectorFrontendHost.copyText(copyText);
        }
    }, {
        key: "resizerDragStarted",
        value: function resizerDragStarted(resizer) {
            if (!resizer[WebInspector.DataGrid.NextColumnOrdinalSymbol]) return true; // Abort the drag;

            this._currentResizer = resizer;
        }
    }, {
        key: "resizerDragging",
        value: function resizerDragging(resizer, positionDelta) {
            console.assert(resizer === this._currentResizer, resizer, this._currentResizer);
            if (resizer != this._currentResizer) return;

            // Constrain the dragpoint to be within the containing div of the
            // datagrid.
            var dragPoint = resizer.initialPosition - positionDelta - this.element.totalOffsetLeft;
            // Constrain the dragpoint to be within the space made up by the
            // column directly to the left and the column directly to the right.
            var leftCellIndex = resizer[WebInspector.DataGrid.PreviousColumnOrdinalSymbol];
            var rightCellIndex = resizer[WebInspector.DataGrid.NextColumnOrdinalSymbol];
            var firstRowCells = this._headerTableBodyElement.rows[0].cells;
            var leftEdgeOfPreviousColumn = 0;
            for (var i = 0; i < leftCellIndex; i++) leftEdgeOfPreviousColumn += firstRowCells[i].offsetWidth;

            // Differences for other resize methods
            if (this.resizeMethod === WebInspector.DataGrid.ResizeMethod.Last) {
                rightCellIndex = this.resizers.length;
            } else if (this.resizeMethod === WebInspector.DataGrid.ResizeMethod.First) {
                leftEdgeOfPreviousColumn += firstRowCells[leftCellIndex].offsetWidth - firstRowCells[0].offsetWidth;
                leftCellIndex = 0;
            }

            var rightEdgeOfNextColumn = leftEdgeOfPreviousColumn + firstRowCells[leftCellIndex].offsetWidth + firstRowCells[rightCellIndex].offsetWidth;

            // Give each column some padding so that they don't disappear.
            var leftMinimum = leftEdgeOfPreviousColumn + this.ColumnResizePadding;
            var rightMaximum = rightEdgeOfNextColumn - this.ColumnResizePadding;

            dragPoint = Number.constrain(dragPoint, leftMinimum, rightMaximum);

            resizer.element.style.left = dragPoint - this.CenterResizerOverBorderAdjustment + "px";

            var percentLeftColumn = (dragPoint - leftEdgeOfPreviousColumn) / this._dataTableElement.offsetWidth * 100 + "%";
            this._headerTableColumnGroupElement.children[leftCellIndex].style.width = percentLeftColumn;
            this._dataTableColumnGroupElement.children[leftCellIndex].style.width = percentLeftColumn;

            var percentRightColumn = (rightEdgeOfNextColumn - dragPoint) / this._dataTableElement.offsetWidth * 100 + "%";
            this._headerTableColumnGroupElement.children[rightCellIndex].style.width = percentRightColumn;
            this._dataTableColumnGroupElement.children[rightCellIndex].style.width = percentRightColumn;

            this._positionResizerElements();
            event.preventDefault();
            this.dispatchEventToListeners(WebInspector.DataGrid.Event.DidLayout);
        }
    }, {
        key: "resizerDragEnded",
        value: function resizerDragEnded(resizer) {
            console.assert(resizer === this._currentResizer, resizer, this._currentResizer);
            if (resizer != this._currentResizer) return;

            this._currentResizer = null;
            this.dispatchEventToListeners(WebInspector.DataGrid.Event.DidLayout);
        }
    }, {
        key: "refreshCallback",
        get: function get() {
            return this._refreshCallback;
        },
        set: function set(refreshCallback) {
            this._refreshCallback = refreshCallback;
        }
    }, {
        key: "sortOrder",
        get: function get() {
            return this._sortOrder;
        },
        set: function set(order) {
            if (order === this._sortOrder) return;

            this._sortOrder = order;

            if (!this._sortColumnIdentifier) return;

            var sortHeaderCellElement = this._headerTableCellElements.get(this._sortColumnIdentifier);

            sortHeaderCellElement.classList.toggle(WebInspector.DataGrid.SortColumnAscendingStyleClassName, this._sortOrder === WebInspector.DataGrid.SortOrder.Ascending);
            sortHeaderCellElement.classList.toggle(WebInspector.DataGrid.SortColumnDescendingStyleClassName, this._sortOrder === WebInspector.DataGrid.SortOrder.Descending);

            this.dispatchEventToListeners(WebInspector.DataGrid.Event.SortChanged);
        }
    }, {
        key: "sortColumnIdentifier",
        get: function get() {
            return this._sortColumnIdentifier;
        },
        set: function set(columnIdentifier) {
            console.assert(columnIdentifier && this.columns.has(columnIdentifier));
            console.assert("sortable" in this.columns.get(columnIdentifier));

            if (this._sortColumnIdentifier === columnIdentifier) return;

            var oldSortColumnIdentifier = this._sortColumnIdentifier;
            this._sortColumnIdentifier = columnIdentifier;

            if (oldSortColumnIdentifier) {
                var oldSortHeaderCellElement = this._headerTableCellElements.get(oldSortColumnIdentifier);
                oldSortHeaderCellElement.classList.remove(WebInspector.DataGrid.SortColumnAscendingStyleClassName);
                oldSortHeaderCellElement.classList.remove(WebInspector.DataGrid.SortColumnDescendingStyleClassName);
            }

            if (this._sortColumnIdentifier) {
                var newSortHeaderCellElement = this._headerTableCellElements.get(this._sortColumnIdentifier);
                newSortHeaderCellElement.classList.toggle(WebInspector.DataGrid.SortColumnAscendingStyleClassName, this._sortOrder === WebInspector.DataGrid.SortOrder.Ascending);
                newSortHeaderCellElement.classList.toggle(WebInspector.DataGrid.SortColumnDescendingStyleClassName, this._sortOrder === WebInspector.DataGrid.SortOrder.Descending);
            }

            this.dispatchEventToListeners(WebInspector.DataGrid.Event.SortChanged);
        }
    }, {
        key: "scrollContainer",
        get: function get() {
            return this._scrollContainerElement;
        }
    }, {
        key: "resizeMethod",
        get: function get() {
            if (!this._resizeMethod) return WebInspector.DataGrid.ResizeMethod.Nearest;
            return this._resizeMethod;
        },
        set: function set(method) {
            this._resizeMethod = method;
        }
    }], [{
        key: "createSortableDataGrid",
        value: function createSortableDataGrid(columnNames, values) {
            var numColumns = columnNames.length;
            if (!numColumns) return null;

            var columnsData = {};
            var _iteratorNormalCompletion20 = true;
            var _didIteratorError20 = false;
            var _iteratorError20 = undefined;

            try {
                for (var _iterator20 = columnNames[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
                    var columnName = _step20.value;

                    columnsData[columnName] = {
                        width: columnName.length,
                        title: columnName,
                        sortable: true
                    };
                }
            } catch (err) {
                _didIteratorError20 = true;
                _iteratorError20 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion20 && _iterator20["return"]) {
                        _iterator20["return"]();
                    }
                } finally {
                    if (_didIteratorError20) {
                        throw _iteratorError20;
                    }
                }
            }

            var dataGrid = new WebInspector.DataGrid(columnsData, undefined, undefined, columnNames);
            for (var i = 0; i < values.length / numColumns; ++i) {
                var data = {};
                for (var j = 0; j < columnNames.length; ++j) data[columnNames[j]] = values[numColumns * i + j];

                var node = new WebInspector.DataGridNode(data, false);
                dataGrid.appendChild(node);
            }

            function sortDataGrid() {
                var sortColumnIdentifier = dataGrid.sortColumnIdentifier;

                var columnIsNumeric = true;
                var _iteratorNormalCompletion21 = true;
                var _didIteratorError21 = false;
                var _iteratorError21 = undefined;

                try {
                    for (var _iterator21 = dataGrid.children[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
                        var node = _step21.value;

                        var value = dataGrid.textForDataGridNodeColumn(node, sortColumnIdentifier);
                        if (isNaN(Number(value))) columnIsNumeric = false;
                    }
                } catch (err) {
                    _didIteratorError21 = true;
                    _iteratorError21 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion21 && _iterator21["return"]) {
                            _iterator21["return"]();
                        }
                    } finally {
                        if (_didIteratorError21) {
                            throw _iteratorError21;
                        }
                    }
                }

                function comparator(dataGridNode1, dataGridNode2) {
                    var item1 = dataGrid.textForDataGridNodeColumn(dataGridNode1, sortColumnIdentifier);
                    var item2 = dataGrid.textForDataGridNodeColumn(dataGridNode2, sortColumnIdentifier);

                    var comparison;
                    if (columnIsNumeric) {
                        var number1 = parseFloat(item1);
                        var number2 = parseFloat(item2);
                        comparison = number1 < number2 ? -1 : number1 > number2 ? 1 : 0;
                    } else comparison = item1 < item2 ? -1 : item1 > item2 ? 1 : 0;

                    return comparison;
                }

                dataGrid.sortNodes(comparator);
            }

            dataGrid.addEventListener(WebInspector.DataGrid.Event.SortChanged, sortDataGrid, this);

            dataGrid.sortOrder = WebInspector.DataGrid.SortOrder.Ascending;
            dataGrid.sortColumnIdentifier = columnNames[0];

            return dataGrid;
        }
    }]);

    return DataGrid;
})(WebInspector.Object);

WebInspector.DataGrid.Event = {
    DidLayout: "datagrid-did-layout",
    SortChanged: "datagrid-sort-changed",
    SelectedNodeChanged: "datagrid-selected-node-changed",
    ExpandedNode: "datagrid-expanded-node",
    CollapsedNode: "datagrid-collapsed-node"
};

WebInspector.DataGrid.ResizeMethod = {
    Nearest: "nearest",
    First: "first",
    Last: "last"
};

WebInspector.DataGrid.SortOrder = {
    Indeterminate: "data-grid-sort-order-indeterminate",
    Ascending: "data-grid-sort-order-ascending",
    Descending: "data-grid-sort-order-descending"
};

WebInspector.DataGrid.PreviousColumnOrdinalSymbol = Symbol("previous-column-ordinal");
WebInspector.DataGrid.NextColumnOrdinalSymbol = Symbol("next-column-ordinal");

WebInspector.DataGrid.ColumnResizePadding = 10;
WebInspector.DataGrid.CenterResizerOverBorderAdjustment = 3;

WebInspector.DataGrid.SortColumnAscendingStyleClassName = "sort-ascending";
WebInspector.DataGrid.SortColumnDescendingStyleClassName = "sort-descending";
WebInspector.DataGrid.SortableColumnStyleClassName = "sortable";

WebInspector.DataGridNode = (function (_WebInspector$Object2) {
    _inherits(DataGridNode, _WebInspector$Object2);

    function DataGridNode(data, hasChildren) {
        _classCallCheck(this, DataGridNode);

        _get(Object.getPrototypeOf(DataGridNode.prototype), "constructor", this).call(this);

        this._expanded = false;
        this._selected = false;
        this._copyable = true;
        this._shouldRefreshChildren = true;
        this._data = data || {};
        this.hasChildren = hasChildren || false;
        this.children = [];
        this.dataGrid = null;
        this.parent = null;
        this.previousSibling = null;
        this.nextSibling = null;
        this.disclosureToggleWidth = 10;
    }

    _createClass(DataGridNode, [{
        key: "createCells",
        value: function createCells() {
            var _iteratorNormalCompletion22 = true;
            var _didIteratorError22 = false;
            var _iteratorError22 = undefined;

            try {
                for (var _iterator22 = this.dataGrid.orderedColumns[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
                    var columnIdentifier = _step22.value;

                    this._element.appendChild(this.createCell(columnIdentifier));
                }
            } catch (err) {
                _didIteratorError22 = true;
                _iteratorError22 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion22 && _iterator22["return"]) {
                        _iterator22["return"]();
                    }
                } finally {
                    if (_didIteratorError22) {
                        throw _iteratorError22;
                    }
                }
            }
        }
    }, {
        key: "refreshIfNeeded",
        value: function refreshIfNeeded() {
            if (!this._needsRefresh) return;

            delete this._needsRefresh;

            this.refresh();
        }
    }, {
        key: "needsRefresh",
        value: function needsRefresh() {
            this._needsRefresh = true;

            if (!this._revealed) return;

            if (this._scheduledRefreshIdentifier) return;

            this._scheduledRefreshIdentifier = requestAnimationFrame(this.refresh.bind(this));
        }
    }, {
        key: "refresh",
        value: function refresh() {
            if (!this._element || !this.dataGrid) return;

            if (this._scheduledRefreshIdentifier) {
                cancelAnimationFrame(this._scheduledRefreshIdentifier);
                delete this._scheduledRefreshIdentifier;
            }

            delete this._needsRefresh;

            this._element.removeChildren();
            this.createCells();
        }
    }, {
        key: "updateLayout",
        value: function updateLayout() {
            // Implemented by subclasses if needed.
        }
    }, {
        key: "createCell",
        value: function createCell(columnIdentifier) {
            var cellElement = document.createElement("td");
            cellElement.className = columnIdentifier + "-column";
            cellElement.__columnIdentifier = columnIdentifier;

            var column = this.dataGrid.columns.get(columnIdentifier);

            if (column["aligned"]) cellElement.classList.add(column["aligned"]);

            if (column["group"]) cellElement.classList.add("column-group-" + column["group"]);

            var div = cellElement.createChild("div");
            var content = this.createCellContent(columnIdentifier, cellElement);
            div.append(content);

            if (columnIdentifier === this.dataGrid.disclosureColumnIdentifier) {
                cellElement.classList.add("disclosure");
                if (this.leftPadding) cellElement.style.setProperty("padding-left", this.leftPadding + "px");
            }

            return cellElement;
        }
    }, {
        key: "createCellContent",
        value: function createCellContent(columnIdentifier) {
            return this.data[columnIdentifier] || "​"; // Zero width space to keep the cell from collapsing.
        }
    }, {
        key: "elementWithColumnIdentifier",
        value: function elementWithColumnIdentifier(columnIdentifier) {
            var index = this.dataGrid.orderedColumns.indexOf(columnIdentifier);
            if (index === -1) return null;

            return this._element.children[index];
        }

        // Share these functions with DataGrid. They are written to work with a DataGridNode this object.
    }, {
        key: "appendChild",
        value: function appendChild() {
            return WebInspector.DataGrid.prototype.appendChild.apply(this, arguments);
        }
    }, {
        key: "insertChild",
        value: function insertChild() {
            return WebInspector.DataGrid.prototype.insertChild.apply(this, arguments);
        }
    }, {
        key: "removeChild",
        value: function removeChild() {
            return WebInspector.DataGrid.prototype.removeChild.apply(this, arguments);
        }
    }, {
        key: "removeChildren",
        value: function removeChildren() {
            return WebInspector.DataGrid.prototype.removeChildren.apply(this, arguments);
        }
    }, {
        key: "removeChildrenRecursive",
        value: function removeChildrenRecursive() {
            return WebInspector.DataGrid.prototype.removeChildrenRecursive.apply(this, arguments);
        }
    }, {
        key: "_recalculateSiblings",
        value: function _recalculateSiblings(myIndex) {
            if (!this.parent) return;

            var previousChild = myIndex > 0 ? this.parent.children[myIndex - 1] : null;

            if (previousChild) {
                previousChild.nextSibling = this;
                this.previousSibling = previousChild;
            } else this.previousSibling = null;

            var nextChild = this.parent.children[myIndex + 1];

            if (nextChild) {
                nextChild.previousSibling = this;
                this.nextSibling = nextChild;
            } else this.nextSibling = null;
        }
    }, {
        key: "collapse",
        value: function collapse() {
            if (this._element) this._element.classList.remove("expanded");

            this._expanded = false;

            for (var i = 0; i < this.children.length; ++i) this.children[i].revealed = false;

            this.dispatchEventToListeners("collapsed");

            if (this.dataGrid) this.dataGrid.dispatchEventToListeners(WebInspector.DataGrid.Event.CollapsedNode, { dataGridNode: this });
        }
    }, {
        key: "collapseRecursively",
        value: function collapseRecursively() {
            var item = this;
            while (item) {
                if (item.expanded) item.collapse();
                item = item.traverseNextNode(false, this, true);
            }
        }
    }, {
        key: "expand",
        value: function expand() {
            if (!this.hasChildren || this.expanded) return;

            if (this.revealed && !this._shouldRefreshChildren) for (var i = 0; i < this.children.length; ++i) this.children[i].revealed = true;

            if (this._shouldRefreshChildren) {
                for (var i = 0; i < this.children.length; ++i) this.children[i]._detach();

                this.dispatchEventToListeners("populate");

                if (this._attached) {
                    for (var i = 0; i < this.children.length; ++i) {
                        var child = this.children[i];
                        if (this.revealed) child.revealed = true;
                        child._attach();
                    }
                }

                delete this._shouldRefreshChildren;
            }

            if (this._element) this._element.classList.add("expanded");

            this._expanded = true;

            this.dispatchEventToListeners("expanded");

            if (this.dataGrid) this.dataGrid.dispatchEventToListeners(WebInspector.DataGrid.Event.ExpandedNode, { dataGridNode: this });
        }
    }, {
        key: "expandRecursively",
        value: function expandRecursively() {
            var item = this;
            while (item) {
                item.expand();
                item = item.traverseNextNode(false, this);
            }
        }
    }, {
        key: "reveal",
        value: function reveal() {
            var currentAncestor = this.parent;
            while (currentAncestor && !currentAncestor.root) {
                if (!currentAncestor.expanded) currentAncestor.expand();
                currentAncestor = currentAncestor.parent;
            }

            this.element.scrollIntoViewIfNeeded(false);

            this.dispatchEventToListeners("revealed");
        }
    }, {
        key: "select",
        value: function select(suppressSelectedEvent) {
            if (!this.dataGrid || !this.selectable || this.selected) return;

            if (this.dataGrid.selectedNode) this.dataGrid.selectedNode.deselect(true);

            this._selected = true;
            this.dataGrid.selectedNode = this;

            if (this._element) this._element.classList.add("selected");

            if (!suppressSelectedEvent) this.dataGrid.dispatchEventToListeners(WebInspector.DataGrid.Event.SelectedNodeChanged);
        }
    }, {
        key: "revealAndSelect",
        value: function revealAndSelect() {
            this.reveal();
            this.select();
        }
    }, {
        key: "deselect",
        value: function deselect(suppressDeselectedEvent) {
            if (!this.dataGrid || this.dataGrid.selectedNode !== this || !this.selected) return;

            this._selected = false;
            this.dataGrid.selectedNode = null;

            if (this._element) this._element.classList.remove("selected");

            if (!suppressDeselectedEvent) this.dataGrid.dispatchEventToListeners(WebInspector.DataGrid.Event.SelectedNodeChanged);
        }
    }, {
        key: "traverseNextNode",
        value: function traverseNextNode(skipHidden, stayWithin, dontPopulate, info) {
            if (!dontPopulate && this.hasChildren) this.dispatchEventToListeners("populate");

            if (info) info.depthChange = 0;

            var node = !skipHidden || this.revealed ? this.children[0] : null;
            if (node && (!skipHidden || this.expanded)) {
                if (info) info.depthChange = 1;
                return node;
            }

            if (this === stayWithin) return null;

            node = !skipHidden || this.revealed ? this.nextSibling : null;
            if (node) return node;

            node = this;
            while (node && !node.root && !(!skipHidden || node.revealed ? node.nextSibling : null) && node.parent !== stayWithin) {
                if (info) info.depthChange -= 1;
                node = node.parent;
            }

            if (!node) return null;

            return !skipHidden || node.revealed ? node.nextSibling : null;
        }
    }, {
        key: "traversePreviousNode",
        value: function traversePreviousNode(skipHidden, dontPopulate) {
            var node = !skipHidden || this.revealed ? this.previousSibling : null;
            if (!dontPopulate && node && node.hasChildren) node.dispatchEventToListeners("populate");

            while (node && (!skipHidden || node.revealed && node.expanded ? node.children.lastValue : null)) {
                if (!dontPopulate && node.hasChildren) node.dispatchEventToListeners("populate");
                node = !skipHidden || node.revealed && node.expanded ? node.children.lastValue : null;
            }

            if (node) return node;

            if (!this.parent || this.parent.root) return null;

            return this.parent;
        }
    }, {
        key: "isEventWithinDisclosureTriangle",
        value: function isEventWithinDisclosureTriangle(event) {
            if (!this.hasChildren) return false;
            var cell = event.target.enclosingNodeOrSelfWithNodeName("td");
            if (!cell.classList.contains("disclosure")) return false;

            var left = cell.totalOffsetLeft + this.leftPadding;
            return event.pageX >= left && event.pageX <= left + this.disclosureToggleWidth;
        }
    }, {
        key: "_attach",
        value: function _attach() {
            if (!this.dataGrid || this._attached) return;

            this._attached = true;

            var nextElement = null;

            if (!this.isPlaceholderNode) {
                var previousGridNode = this.traversePreviousNode(true, true);
                if (previousGridNode && previousGridNode.element.parentNode) nextElement = previousGridNode.element.nextSibling;else if (!previousGridNode) nextElement = this.dataGrid.dataTableBodyElement.firstChild;
            }

            // If there is no next grid node, then append before the last child since the last child is the filler row.
            console.assert(this.dataGrid.dataTableBodyElement.lastChild.classList.contains("filler"));

            if (!nextElement) nextElement = this.dataGrid.dataTableBodyElement.lastChild;

            this.dataGrid.dataTableBodyElement.insertBefore(this.element, nextElement);

            if (this.expanded) for (var i = 0; i < this.children.length; ++i) this.children[i]._attach();
        }
    }, {
        key: "_detach",
        value: function _detach() {
            if (!this._attached) return;

            this._attached = false;

            if (this._element && this._element.parentNode) this._element.parentNode.removeChild(this._element);

            for (var i = 0; i < this.children.length; ++i) this.children[i]._detach();
        }
    }, {
        key: "savePosition",
        value: function savePosition() {
            if (this._savedPosition) return;

            console.assert(this.parent);
            if (!this.parent) return;

            this._savedPosition = {
                parent: this.parent,
                index: this.parent.children.indexOf(this)
            };
        }
    }, {
        key: "restorePosition",
        value: function restorePosition() {
            if (!this._savedPosition) return;

            if (this.parent !== this._savedPosition.parent) this._savedPosition.parent.insertChild(this, this._savedPosition.index);

            delete this._savedPosition;
        }
    }, {
        key: "selectable",
        get: function get() {
            return !this._element || !this._element.classList.contains("hidden");
        }
    }, {
        key: "copyable",
        get: function get() {
            return this._copyable;
        },
        set: function set(x) {
            this._copyable = x;
        }
    }, {
        key: "element",
        get: function get() {
            if (this._element) return this._element;

            if (!this.dataGrid) return null;

            this._element = document.createElement("tr");
            this._element._dataGridNode = this;

            if (this.hasChildren) this._element.classList.add("parent");
            if (this.expanded) this._element.classList.add("expanded");
            if (this.selected) this._element.classList.add("selected");
            if (this.revealed) this._element.classList.add("revealed");

            this.createCells();
            return this._element;
        }
    }, {
        key: "data",
        get: function get() {
            return this._data;
        },
        set: function set(x) {
            this._data = x || {};
            this.needsRefresh();
        }
    }, {
        key: "revealed",
        get: function get() {
            if ("_revealed" in this) return this._revealed;

            var currentAncestor = this.parent;
            while (currentAncestor && !currentAncestor.root) {
                if (!currentAncestor.expanded) {
                    this._revealed = false;
                    return false;
                }

                currentAncestor = currentAncestor.parent;
            }

            this._revealed = true;
            return true;
        },
        set: function set(x) {
            if (this._revealed === x) return;

            this._revealed = x;

            if (this._element) {
                if (this._revealed) this._element.classList.add("revealed");else this._element.classList.remove("revealed");
            }

            this.refreshIfNeeded();

            for (var i = 0; i < this.children.length; ++i) this.children[i].revealed = x && this.expanded;
        }
    }, {
        key: "hasChildren",
        set: function set(x) {
            if (this._hasChildren === x) return;

            this._hasChildren = x;

            if (!this._element) return;

            if (this._hasChildren) {
                this._element.classList.add("parent");
                if (this.expanded) this._element.classList.add("expanded");
            } else {
                this._element.classList.remove("parent", "expanded");
            }
        },
        get: function get() {
            return this._hasChildren;
        }
    }, {
        key: "depth",
        get: function get() {
            if ("_depth" in this) return this._depth;
            if (this.parent && !this.parent.root) this._depth = this.parent.depth + 1;else this._depth = 0;
            return this._depth;
        }
    }, {
        key: "leftPadding",
        get: function get() {
            if (typeof this._leftPadding === "number") return this._leftPadding;

            this._leftPadding = this.depth * this.dataGrid.indentWidth;
            return this._leftPadding;
        }
    }, {
        key: "shouldRefreshChildren",
        get: function get() {
            return this._shouldRefreshChildren;
        },
        set: function set(x) {
            this._shouldRefreshChildren = x;
            if (x && this.expanded) this.expand();
        }
    }, {
        key: "selected",
        get: function get() {
            return this._selected;
        },
        set: function set(x) {
            if (x) this.select();else this.deselect();
        }
    }, {
        key: "expanded",
        get: function get() {
            return this._expanded;
        },
        set: function set(x) {
            if (x) this.expand();else this.collapse();
        }
    }]);

    return DataGridNode;
})(WebInspector.Object);

// Used to create a new table row when entering new data by editing cells.
WebInspector.PlaceholderDataGridNode = (function (_WebInspector$DataGridNode) {
    _inherits(PlaceholderDataGridNode, _WebInspector$DataGridNode);

    function PlaceholderDataGridNode(data) {
        _classCallCheck(this, PlaceholderDataGridNode);

        _get(Object.getPrototypeOf(PlaceholderDataGridNode.prototype), "constructor", this).call(this, data, false);
        this.isPlaceholderNode = true;
    }

    _createClass(PlaceholderDataGridNode, [{
        key: "makeNormal",
        value: function makeNormal() {
            this.isPlaceholderNode = false;
        }
    }]);

    return PlaceholderDataGridNode;
})(WebInspector.DataGridNode);
