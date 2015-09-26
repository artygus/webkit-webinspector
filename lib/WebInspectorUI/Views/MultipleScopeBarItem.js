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

WebInspector.MultipleScopeBarItem = (function (_WebInspector$Object) {
    _inherits(MultipleScopeBarItem, _WebInspector$Object);

    function MultipleScopeBarItem(scopeBarItems) {
        _classCallCheck(this, MultipleScopeBarItem);

        _get(Object.getPrototypeOf(MultipleScopeBarItem.prototype), "constructor", this).call(this);

        this._element = document.createElement("li");
        this._element.classList.add("multiple");

        this._titleElement = document.createElement("span");
        this._element.appendChild(this._titleElement);
        this._element.addEventListener("click", this._clicked.bind(this));

        this._selectElement = document.createElement("select");
        this._selectElement.addEventListener("change", this._selectElementSelectionChanged.bind(this));
        this._element.appendChild(this._selectElement);

        wrappedSVGDocument("Images/UpDownArrows.svg", "arrows", null, (function (element) {
            this._element.appendChild(element);
        }).bind(this));

        this.scopeBarItems = scopeBarItems;
    }

    // Public

    _createClass(MultipleScopeBarItem, [{
        key: "_clicked",

        // Private

        value: function _clicked(event) {
            // Only support click to select when the item is not selected yet.
            // Clicking when selected will cause the menu it appear instead.
            if (this._element.classList.contains("selected")) return;
            this.selected = true;
        }
    }, {
        key: "_selectElementSelectionChanged",
        value: function _selectElementSelectionChanged(event) {
            this.selectedScopeBarItem = this._scopeBarItems[this._selectElement.selectedIndex];
        }
    }, {
        key: "_itemSelectionDidChange",
        value: function _itemSelectionDidChange(event) {
            if (this._ignoreItemSelectedEvent) return;
            this.selectedScopeBarItem = event.target.selected ? event.target : null;
        }
    }, {
        key: "element",
        get: function get() {
            return this._element;
        }
    }, {
        key: "exclusive",
        get: function get() {
            return false;
        }
    }, {
        key: "scopeBarItems",
        get: function get() {
            return this._scopeBarItems;
        },
        set: function set(scopeBarItems) {
            if (this._scopeBarItems) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this._scopeBarItems[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var scopeBarItem = _step.value;

                        scopeBarItem.removeEventListener(null, null, this);
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

            this._scopeBarItems = scopeBarItems || [];
            this._selectedScopeBarItem = null;

            this._selectElement.removeChildren();

            function createOption(scopeBarItem) {
                var optionElement = document.createElement("option");
                var maxPopupMenuLength = 130; // <rdar://problem/13445374> <select> with very long option has clipped text and popup menu is still very wide
                optionElement.textContent = scopeBarItem.label.length <= maxPopupMenuLength ? scopeBarItem.label : scopeBarItem.label.substring(0, maxPopupMenuLength) + "…";
                return optionElement;
            }

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._scopeBarItems[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var scopeBarItem = _step2.value;

                    if (scopeBarItem.selected && !this._selectedScopeBarItem) this._selectedScopeBarItem = scopeBarItem;else if (scopeBarItem.selected) {
                        // Only one selected item is allowed at a time.
                        // Deselect any other items after the first.
                        scopeBarItem.selected = false;
                    }

                    scopeBarItem.addEventListener(WebInspector.ScopeBarItem.Event.SelectionChanged, this._itemSelectionDidChange, this);

                    this._selectElement.appendChild(createOption(scopeBarItem));
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

            this._lastSelectedScopeBarItem = this._selectedScopeBarItem || this._scopeBarItems[0] || null;
            this._titleElement.textContent = this._lastSelectedScopeBarItem ? this._lastSelectedScopeBarItem.label : "";

            this._element.classList.toggle("selected", !!this._selectedScopeBarItem);
            this._selectElement.selectedIndex = this._scopeBarItems.indexOf(this._selectedScopeBarItem);
        }
    }, {
        key: "selected",
        get: function get() {
            return !!this._selectedScopeBarItem;
        },
        set: function set(selected) {
            this.selectedScopeBarItem = selected ? this._lastSelectedScopeBarItem : null;
        }
    }, {
        key: "selectedScopeBarItem",
        get: function get() {
            return this._selectedScopeBarItem;
        },
        set: function set(selectedScopeBarItem) {
            this._ignoreItemSelectedEvent = true;

            if (this._selectedScopeBarItem) {
                this._selectedScopeBarItem.selected = false;
                this._lastSelectedScopeBarItem = this._selectedScopeBarItem;
            } else if (!this._lastSelectedScopeBarItem) this._lastSelectedScopeBarItem = selectedScopeBarItem;

            this._element.classList.toggle("selected", !!selectedScopeBarItem);
            this._selectedScopeBarItem = selectedScopeBarItem || null;
            this._selectElement.selectedIndex = this._scopeBarItems.indexOf(this._selectedScopeBarItem);

            if (this._selectedScopeBarItem) {
                this._titleElement.textContent = this._selectedScopeBarItem.label;
                this._selectedScopeBarItem.selected = true;
            }

            var withModifier = WebInspector.modifierKeys.metaKey && !WebInspector.modifierKeys.ctrlKey && !WebInspector.modifierKeys.altKey && !WebInspector.modifierKeys.shiftKey;
            this.dispatchEventToListeners(WebInspector.ScopeBarItem.Event.SelectionChanged, { withModifier: withModifier });

            this._ignoreItemSelectedEvent = false;
        }
    }]);

    return MultipleScopeBarItem;
})(WebInspector.Object);
