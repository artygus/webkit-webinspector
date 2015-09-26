var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2015 Apple Inc. All rights reserved.
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

WebInspector.VisualStyleCommaSeparatedKeywordEditor = (function (_WebInspector$VisualStylePropertyEditor) {
    _inherits(VisualStyleCommaSeparatedKeywordEditor, _WebInspector$VisualStylePropertyEditor);

    function VisualStyleCommaSeparatedKeywordEditor(propertyNames, text, insertNewItemsBeforeSelected, layoutReversed) {
        _classCallCheck(this, VisualStyleCommaSeparatedKeywordEditor);

        _get(Object.getPrototypeOf(VisualStyleCommaSeparatedKeywordEditor.prototype), "constructor", this).call(this, propertyNames, text, null, null, "comma-separated-keyword-editor", layoutReversed);

        this._insertNewItemsBeforeSelected = insertNewItemsBeforeSelected || false;

        var listElement = document.createElement("ol");
        listElement.classList.add("visual-style-comma-separated-keyword-list");
        listElement.addEventListener("keydown", this._listElementKeyDown.bind(this));
        this.contentElement.appendChild(listElement);

        this._commaSeparatedKeywords = new WebInspector.TreeOutline(listElement);
        this._commaSeparatedKeywords.onselect = this._treeElementSelected.bind(this);

        var controlContainer = document.createElement("div");
        controlContainer.classList.add("visual-style-comma-separated-keyword-controls");
        this.contentElement.appendChild(controlContainer);

        wrappedSVGDocument("Images/Plus13.svg", "visual-style-add-comma-separated-keyword", WebInspector.UIString("Click to add a new item."), (function (wrapper) {
            wrapper.addEventListener("click", this._addEmptyCommaSeparatedKeyword.bind(this));
            controlContainer.appendChild(wrapper);
        }).bind(this));

        wrappedSVGDocument("Images/Minus.svg", "visual-style-remove-comma-separated-keyword", WebInspector.UIString("Click to remove the selected item."), (function (wrapper) {
            wrapper.addEventListener("click", this._removeSelectedCommaSeparatedKeyword.bind(this));
            controlContainer.appendChild(wrapper);
        }).bind(this));
    }

    // Public

    _createClass(VisualStyleCommaSeparatedKeywordEditor, [{
        key: "_listElementKeyDown",

        // Private

        value: function _listElementKeyDown(event) {
            var selectedTreeElement = this._commaSeparatedKeywords.selectedTreeElement;
            if (!selectedTreeElement) return;

            if (selectedTreeElement.currentlyEditing) return;

            var keyCode = event.keyCode;
            var backspaceKeyCode = WebInspector.KeyboardShortcut.Key.Backspace.keyCode;
            var deleteKeyCode = WebInspector.KeyboardShortcut.Key.Delete.keyCode;
            if (keyCode === backspaceKeyCode || keyCode === deleteKeyCode) this._removeSelectedCommaSeparatedKeyword();
        }
    }, {
        key: "_treeElementSelected",
        value: function _treeElementSelected(item, selectedByUser) {
            this._removeEmptyCommaSeparatedKeywords();
            this.dispatchEventToListeners(WebInspector.VisualStyleCommaSeparatedKeywordEditor.Event.TreeItemSelected, { text: item.mainTitle });
        }
    }, {
        key: "_treeElementIsEmpty",
        value: function _treeElementIsEmpty(item) {
            return !item._mainTitle || !item._mainTitle.length;
        }
    }, {
        key: "_addEmptyCommaSeparatedKeyword",
        value: function _addEmptyCommaSeparatedKeyword() {
            var newTreeElement = this._addCommaSeparatedKeyword(null, this._commaSeparatedKeywords.selectedTreeElementIndex);
            newTreeElement.subtitle = WebInspector.UIString("(modify the boxes below to add a value)");
            newTreeElement.element.classList.add("no-value");
            newTreeElement.select(true, true);
            return newTreeElement;
        }
    }, {
        key: "_removeSelectedCommaSeparatedKeyword",
        value: function _removeSelectedCommaSeparatedKeyword() {
            var selectedTreeElement = this._commaSeparatedKeywords.selectedTreeElement;
            this._removeCommaSeparatedKeyword(selectedTreeElement);
        }
    }, {
        key: "_removeEmptyCommaSeparatedKeywords",
        value: function _removeEmptyCommaSeparatedKeywords() {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._commaSeparatedKeywords.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var treeElement = _step.value;

                    if (!this._treeElementIsEmpty(treeElement) || treeElement.selected) continue;

                    treeElement.deselect();
                    this._removeCommaSeparatedKeyword(treeElement);
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
        key: "_addCommaSeparatedKeyword",
        value: function _addCommaSeparatedKeyword(value, index) {
            var valueElement = this._createNewTreeElement(value);
            if (!isNaN(index)) this._commaSeparatedKeywords.insertChild(valueElement, index + !this._insertNewItemsBeforeSelected);else this._commaSeparatedKeywords.appendChild(valueElement);

            return valueElement;
        }
    }, {
        key: "_removeCommaSeparatedKeyword",
        value: function _removeCommaSeparatedKeyword(treeElement) {
            if (!treeElement) return;

            this._commaSeparatedKeywords.removeChild(treeElement);
            if (!this._commaSeparatedKeywords.children.length) this.dispatchEventToListeners(WebInspector.VisualStyleCommaSeparatedKeywordEditor.Event.NoRemainingTreeItems);

            this._valueDidChange();
        }
    }, {
        key: "_createNewTreeElement",
        value: function _createNewTreeElement(value) {
            return new WebInspector.GeneralTreeElement(WebInspector.VisualStyleCommaSeparatedKeywordEditor.ListItemClassName, value);
        }
    }, {
        key: "selectedTreeElementValue",
        set: function set(text) {
            var selectedTreeElement = this._commaSeparatedKeywords.selectedTreeElement;
            if (!selectedTreeElement) return;

            selectedTreeElement.element.classList.toggle("no-value", !text || !text.length);
            selectedTreeElement.mainTitle = text;
            this._valueDidChange();
        }
    }, {
        key: "value",
        get: function get() {
            if (!this._commaSeparatedKeywords.hasChildren) return;

            var value = "";
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._commaSeparatedKeywords.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var treeItem = _step2.value;

                    if (this._treeElementIsEmpty(treeItem)) continue;

                    if (value.length) value += ", ";

                    var text = treeItem.mainTitle;
                    if (typeof this._modifyCommaSeparatedKeyword === "function") text = this._modifyCommaSeparatedKeyword(text);

                    value += text;
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

            return value;
        },
        set: function set(commaSeparatedValue) {
            if (commaSeparatedValue && commaSeparatedValue === this.value) return;

            this._commaSeparatedKeywords.removeChildren();
            if (!commaSeparatedValue || !commaSeparatedValue.length) {
                this.dispatchEventToListeners(WebInspector.VisualStyleCommaSeparatedKeywordEditor.Event.NoRemainingTreeItems);
                return;
            }

            var values = commaSeparatedValue.split(/\s*,\s*(?![^\(]*\))/);
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = values[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var value = _step3.value;

                    this._addCommaSeparatedKeyword(value);
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

            this._commaSeparatedKeywords.children[0].select(true);
        }
    }, {
        key: "synthesizedValue",
        get: function get() {
            return this.value || null;
        }
    }]);

    return VisualStyleCommaSeparatedKeywordEditor;
})(WebInspector.VisualStylePropertyEditor);

WebInspector.VisualStyleCommaSeparatedKeywordEditor.ListItemClassName = "visual-style-comma-separated-keyword-item";

WebInspector.VisualStyleCommaSeparatedKeywordEditor.Event = {
    TreeItemSelected: "visual-style-comma-separated-keyword-editor-tree-item-selected",
    NoRemainingTreeItems: "visual-style-comma-separated-keyword-editor-no-remaining-tree-items"
};
