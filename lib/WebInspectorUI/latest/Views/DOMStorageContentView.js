var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2013-2015 Apple Inc. All rights reserved.
 * Copyright (C) 2013 Samsung Electronics. All rights reserved.
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

WebInspector.DOMStorageContentView = (function (_WebInspector$ContentView) {
    _inherits(DOMStorageContentView, _WebInspector$ContentView);

    function DOMStorageContentView(representedObject) {
        _classCallCheck(this, DOMStorageContentView);

        _get(Object.getPrototypeOf(DOMStorageContentView.prototype), "constructor", this).call(this, representedObject);

        this.element.classList.add("dom-storage");

        representedObject.addEventListener(WebInspector.DOMStorageObject.Event.ItemsCleared, this.itemsCleared, this);
        representedObject.addEventListener(WebInspector.DOMStorageObject.Event.ItemAdded, this.itemAdded, this);
        representedObject.addEventListener(WebInspector.DOMStorageObject.Event.ItemRemoved, this.itemRemoved, this);
        representedObject.addEventListener(WebInspector.DOMStorageObject.Event.ItemUpdated, this.itemUpdated, this);

        var columns = {};
        columns.key = { title: WebInspector.UIString("Key"), sortable: true };
        columns.value = { title: WebInspector.UIString("Value"), sortable: true };

        this._dataGrid = new WebInspector.DataGrid(columns, this._editingCallback.bind(this), this._deleteCallback.bind(this));
        this._dataGrid.sortOrder = WebInspector.DataGrid.SortOrder.Ascending;
        this._dataGrid.sortColumnIdentifier = "key";
        this._dataGrid.addEventListener(WebInspector.DataGrid.Event.SortChanged, this._sortDataGrid, this);

        this.element.appendChild(this._dataGrid.element);

        this._populate();
    }

    // Public

    _createClass(DOMStorageContentView, [{
        key: "saveToCookie",
        value: function saveToCookie(cookie) {
            cookie.type = WebInspector.ContentViewCookieType.DOMStorage;
            cookie.isLocalStorage = this.representedObject.isLocalStorage();
            cookie.host = this.representedObject.host;
        }
    }, {
        key: "itemsCleared",
        value: function itemsCleared(event) {
            this._dataGrid.removeChildren();
            this._dataGrid.addPlaceholderNode();
        }
    }, {
        key: "itemRemoved",
        value: function itemRemoved(event) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._dataGrid.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var node = _step.value;

                    if (node.data.key === event.data.key) return this._dataGrid.removeChild(node);
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
        key: "itemAdded",
        value: function itemAdded(event) {
            var key = event.data.key;
            var value = event.data.value;

            // Enforce key uniqueness.
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._dataGrid.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var node = _step2.value;

                    if (node.data.key === key) return;
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

            var data = { key: key, value: value };
            this._dataGrid.appendChild(new WebInspector.DataGridNode(data, false));
            this._sortDataGrid();
        }
    }, {
        key: "itemUpdated",
        value: function itemUpdated(event) {
            var key = event.data.key;
            var value = event.data.value;

            var keyFound = false;
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this._dataGrid.children[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var childNode = _step3.value;

                    if (childNode.data.key === key) {
                        // Remove any rows that are now duplicates.
                        if (keyFound) {
                            this._dataGrid.removeChild(childNode);
                            continue;
                        }

                        keyFound = true;
                        childNode.data.value = value;
                        childNode.refresh();
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

            this._sortDataGrid();
        }
    }, {
        key: "updateLayout",
        value: function updateLayout() {
            if (this._dataGrid) this._dataGrid.updateLayout();
        }
    }, {
        key: "_populate",

        // Private

        value: function _populate() {
            this.representedObject.getEntries((function (error, entries) {
                if (error) return;

                var nodes = [];
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = entries[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var entry = _step4.value;

                        if (!entry[0] || !entry[1]) continue;
                        var data = { key: entry[0], value: entry[1] };
                        var node = new WebInspector.DataGridNode(data, false);
                        this._dataGrid.appendChild(node);
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

                this._sortDataGrid();
                this._dataGrid.addPlaceholderNode();
                this._dataGrid.updateLayout();
            }).bind(this));
        }
    }, {
        key: "_sortDataGrid",
        value: function _sortDataGrid() {
            var sortColumnIdentifier = this._dataGrid.sortColumnIdentifier || "key";

            function comparator(a, b) {
                return a.data[sortColumnIdentifier].localeCompare(b.data[sortColumnIdentifier]);
            }

            this._dataGrid.sortNodesImmediately(comparator);
        }
    }, {
        key: "_deleteCallback",
        value: function _deleteCallback(node) {
            if (!node || node.isPlaceholderNode) return;

            this._dataGrid.removeChild(node);
            this.representedObject.removeItem(node.data["key"]);
        }
    }, {
        key: "_editingCallback",
        value: function _editingCallback(editingNode, columnIdentifier, oldText, newText, moveDirection) {
            var key = editingNode.data["key"].trim().removeWordBreakCharacters();
            var value = editingNode.data["value"].trim().removeWordBreakCharacters();
            var previousValue = oldText.trim().removeWordBreakCharacters();
            var enteredValue = newText.trim().removeWordBreakCharacters();
            var hasUncommittedEdits = editingNode.__hasUncommittedEdits;
            var hasChange = previousValue !== enteredValue;
            var isEditingKey = columnIdentifier === "key";
            var isEditingValue = !isEditingKey;
            var domStorage = this.representedObject;

            // Nothing changed, just bail.
            if (!hasChange && !hasUncommittedEdits) return;

            // Something changed, save the original key/value and enter uncommitted state.
            if (hasChange && !editingNode.__hasUncommittedEdits) {
                editingNode.__hasUncommittedEdits = true;
                editingNode.__originalKey = isEditingKey ? previousValue : key;
                editingNode.__originalValue = isEditingValue ? previousValue : value;
            }

            function cleanup() {
                editingNode.element.classList.remove(WebInspector.DOMStorageContentView.MissingKeyStyleClassName);
                editingNode.element.classList.remove(WebInspector.DOMStorageContentView.MissingValueStyleClassName);
                editingNode.element.classList.remove(WebInspector.DOMStorageContentView.DuplicateKeyStyleClassName);
                editingNode.__hasUncommittedEdits = undefined;
                editingNode.__originalKey = undefined;
                editingNode.__originalValue = undefined;
            }

            function restoreOriginalValues() {
                editingNode.data.key = editingNode.__originalKey;
                editingNode.data.value = editingNode.__originalValue;
                editingNode.refresh();
                cleanup();
            }

            // If the key/value field was cleared, add "missing" style.
            if (isEditingKey) {
                if (key.length) editingNode.element.classList.remove(WebInspector.DOMStorageContentView.MissingKeyStyleClassName);else editingNode.element.classList.add(WebInspector.DOMStorageContentView.MissingKeyStyleClassName);
            } else if (isEditingValue) {
                if (value.length) editingNode.element.classList.remove(WebInspector.DOMStorageContentView.MissingValueStyleClassName);else editingNode.element.classList.add(WebInspector.DOMStorageContentView.MissingValueStyleClassName);
            }

            // Check for key duplicates. If this is a new row, or an existing row that changed key.
            var keyChanged = key !== editingNode.__originalKey;
            if (keyChanged) {
                if (domStorage.entries.has(key)) editingNode.element.classList.add(WebInspector.DOMStorageContentView.DuplicateKeyStyleClassName);else editingNode.element.classList.remove(WebInspector.DOMStorageContentView.DuplicateKeyStyleClassName);
            }

            // See if we are done editing this row or not.
            var columnIndex = this._dataGrid.orderedColumns.indexOf(columnIdentifier);
            var mayMoveToNextRow = moveDirection === "forward" && columnIndex === this._dataGrid.orderedColumns.length - 1;
            var mayMoveToPreviousRow = moveDirection === "backward" && columnIndex === 0;
            var doneEditing = mayMoveToNextRow || mayMoveToPreviousRow || !moveDirection;

            // Expecting more edits on this row.
            if (!doneEditing) return;

            // Key and value were cleared, remove the row.
            if (!key.length && !value.length && !editingNode.isPlaceholderNode) {
                this._dataGrid.removeChild(editingNode);
                domStorage.removeItem(editingNode.__originalKey);
                return;
            }

            // Done editing but leaving the row in an invalid state. Leave in uncommitted state.
            var isDuplicate = editingNode.element.classList.contains(WebInspector.DOMStorageContentView.DuplicateKeyStyleClassName);
            if (!key.length || !value.length || isDuplicate) return;

            // Commit.
            if (keyChanged && !editingNode.isPlaceholderNode) domStorage.removeItem(editingNode.__originalKey);
            if (editingNode.isPlaceholderNode) this._dataGrid.addPlaceholderNode();
            cleanup();
            domStorage.setItem(key, value);
        }
    }, {
        key: "scrollableElements",
        get: function get() {
            if (!this._dataGrid) return [];
            return [this._dataGrid.scrollContainer];
        }
    }]);

    return DOMStorageContentView;
})(WebInspector.ContentView);

WebInspector.DOMStorageContentView.DuplicateKeyStyleClassName = "duplicate-key";
WebInspector.DOMStorageContentView.MissingKeyStyleClassName = "missing-key";
WebInspector.DOMStorageContentView.MissingValueStyleClassName = "missing-value";
