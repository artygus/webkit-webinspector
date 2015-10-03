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

WebInspector.ScopeBar = (function (_WebInspector$NavigationItem) {
    _inherits(ScopeBar, _WebInspector$NavigationItem);

    function ScopeBar(identifier, items, defaultItem, shouldGroupNonExclusiveItems) {
        _classCallCheck(this, ScopeBar);

        _get(Object.getPrototypeOf(ScopeBar.prototype), "constructor", this).call(this, identifier);

        this._element.classList.add("scope-bar");

        this._items = items;
        this._defaultItem = defaultItem;
        this._shouldGroupNonExclusiveItems = shouldGroupNonExclusiveItems || false;

        this._populate();
    }

    // Public

    _createClass(ScopeBar, [{
        key: "item",
        value: function item(id) {
            return this._itemsById.get(id);
        }
    }, {
        key: "hasNonDefaultItemSelected",
        value: function hasNonDefaultItemSelected() {
            return this._items.some(function (item) {
                return item.selected && item !== this._defaultItem;
            }, this);
        }

        // Private

    }, {
        key: "_populate",
        value: function _populate() {
            this._itemsById = new Map();

            if (this._shouldGroupNonExclusiveItems) {
                var nonExclusiveItems = [];

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this._items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var item = _step.value;

                        this._itemsById.set(item.id, item);

                        if (item.exclusive) this._element.appendChild(item.element);else nonExclusiveItems.push(item);

                        item.addEventListener(WebInspector.ScopeBarItem.Event.SelectionChanged, this._itemSelectionDidChange, this);
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

                this._multipleItem = new WebInspector.MultipleScopeBarItem(nonExclusiveItems);
                this._element.appendChild(this._multipleItem.element);
            } else {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = this._items[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var item = _step2.value;

                        this._itemsById.set(item.id, item);
                        this._element.appendChild(item.element);

                        item.addEventListener(WebInspector.ScopeBarItem.Event.SelectionChanged, this._itemSelectionDidChange, this);
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

            if (!this.selectedItems.length && this._defaultItem) this._defaultItem.selected = true;

            this._element.classList.toggle("default-item-selected", this._defaultItem.selected);
        }
    }, {
        key: "_itemSelectionDidChange",
        value: function _itemSelectionDidChange(event) {
            var sender = event.target;
            var item;

            // An exclusive item was selected, unselect everything else.
            if (sender.exclusive && sender.selected) {
                for (var i = 0; i < this._items.length; ++i) {
                    item = this._items[i];
                    if (item !== sender) item.selected = false;
                }
            } else {
                var replacesCurrentSelection = this._shouldGroupNonExclusiveItems || !event.data.withModifier;
                for (var i = 0; i < this._items.length; ++i) {
                    item = this._items[i];
                    if (item.exclusive && item !== sender && sender.selected) item.selected = false;else if (sender.selected && replacesCurrentSelection && sender !== item) item.selected = false;
                }
            }

            // If nothing is selected anymore, select the default item.
            if (!this.selectedItems.length && this._defaultItem) this._defaultItem.selected = true;

            this._element.classList.toggle("default-item-selected", this._defaultItem.selected);
            this.dispatchEventToListeners(WebInspector.ScopeBar.Event.SelectionChanged);
        }
    }, {
        key: "defaultItem",
        get: function get() {
            return this._defaultItem;
        }
    }, {
        key: "items",
        get: function get() {
            return this._items;
        }
    }, {
        key: "selectedItems",
        get: function get() {
            return this._items.filter(function (item) {
                return item.selected;
            });
        }
    }]);

    return ScopeBar;
})(WebInspector.NavigationItem);

WebInspector.ScopeBar.Event = {
    SelectionChanged: "scopebar-selection-did-change"
};
