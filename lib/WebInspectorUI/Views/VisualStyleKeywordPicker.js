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

WebInspector.VisualStyleKeywordPicker = (function (_WebInspector$VisualStylePropertyEditor) {
    _inherits(VisualStyleKeywordPicker, _WebInspector$VisualStylePropertyEditor);

    function VisualStyleKeywordPicker(propertyNames, text, possibleValues, layoutReversed) {
        _classCallCheck(this, VisualStyleKeywordPicker);

        _get(Object.getPrototypeOf(VisualStyleKeywordPicker.prototype), "constructor", this).call(this, propertyNames, text, possibleValues, null, "keyword-picker", layoutReversed);

        this._keywordSelectElement = document.createElement("select");
        this._keywordSelectElement.classList.add("keyword-picker-select");
        if (this._possibleValues.advanced) this._keywordSelectElement.title = WebInspector.UIString("Option-click to show all values");

        this._unchangedOptionElement = document.createElement("option");
        this._unchangedOptionElement.value = "";
        this._unchangedOptionElement.text = WebInspector.UIString("Unchanged");
        this._keywordSelectElement.appendChild(this._unchangedOptionElement);

        this._keywordSelectElement.appendChild(document.createElement("hr"));

        this._createValueOptions(this._possibleValues.basic);
        this._advancedValuesElements = null;

        this._keywordSelectElement.addEventListener("mousedown", this._keywordSelectMouseDown.bind(this));
        this._keywordSelectElement.addEventListener("change", this._handleKeywordChanged.bind(this));
        this.contentElement.appendChild(this._keywordSelectElement);
    }

    // Public

    _createClass(VisualStyleKeywordPicker, [{
        key: "updateEditorValues",
        value: function updateEditorValues(updatedValues) {
            if (!updatedValues.conflictingValues) {
                var missing = updatedValues.propertyMissing || !updatedValues.value;
                this._unchangedOptionElement.selected = missing;
                this.specialPropertyPlaceholderElement.hidden = !missing;
            }

            _get(Object.getPrototypeOf(VisualStyleKeywordPicker.prototype), "updateEditorValues", this).call(this, updatedValues);
        }

        // Private

    }, {
        key: "_getValue",
        value: function _getValue() {
            return this._keywordSelectElement.value;
        }
    }, {
        key: "_setValue",
        value: function _setValue(value) {
            if (!value || !value.length) {
                this._unchangedOptionElement.selected = true;
                this.specialPropertyPlaceholderElement.hidden = false;
                return;
            }

            if (this._updatedValues.propertyMissing || !this.valueIsSupportedKeyword(value)) return;

            if (value === this._keywordSelectElement.value) return;

            if (this._valueIsSupportedAdvancedKeyword(value)) this._addAdvancedValues();

            this._keywordSelectElement.value = value;
        }
    }, {
        key: "_generateSynthesizedValue",
        value: function _generateSynthesizedValue() {
            return this._unchangedOptionElement.selected ? null : this._keywordSelectElement.value;
        }
    }, {
        key: "_handleKeywordChanged",
        value: function _handleKeywordChanged() {
            this._valueDidChange();
            this.specialPropertyPlaceholderElement.hidden = !this._unchangedOptionElement.selected;
        }
    }, {
        key: "_keywordSelectMouseDown",
        value: function _keywordSelectMouseDown(event) {
            if (event.altKey) this._addAdvancedValues();else if (!this._valueIsSupportedAdvancedKeyword()) this._removeAdvancedValues();
        }
    }, {
        key: "_createValueOptions",
        value: function _createValueOptions(values) {
            var addedElements = [];
            for (var key in values) {
                var option = document.createElement("option");
                option.value = key;
                option.text = values[key];
                this._keywordSelectElement.appendChild(option);
                addedElements.push(option);
            }
            return addedElements;
        }
    }, {
        key: "_addAdvancedValues",
        value: function _addAdvancedValues() {
            if (this._advancedValuesElements) return;

            this._keywordSelectElement.appendChild(document.createElement("hr"));
            this._advancedValuesElements = this._createValueOptions(this._possibleValues.advanced);
        }
    }, {
        key: "_removeAdvancedValues",
        value: function _removeAdvancedValues() {
            if (!this._advancedValuesElements) return;

            this._keywordSelectElement.removeChild(this._advancedValuesElements[0].previousSibling);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._advancedValuesElements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var element = _step.value;

                    this._keywordSelectElement.removeChild(element);
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

            this._advancedValuesElements = null;
        }
    }, {
        key: "_toggleTabbingOfSelectableElements",
        value: function _toggleTabbingOfSelectableElements(disabled) {
            this._keywordSelectElement.tabIndex = disabled ? "-1" : null;
        }
    }, {
        key: "value",
        get: function get() {
            // FIXME: <https://webkit.org/b/147064> Getter and setter on super are called with wrong "this" object
            return this._getValue();
        },
        set: function set(value) {
            // FIXME: <https://webkit.org/b/147064> Getter and setter on super are called with wrong "this" object
            this._setValue(value);
        }
    }, {
        key: "placeholder",
        set: function set(placeholder) {
            if (this._updatedValues.conflictingValues) return;

            this.specialPropertyPlaceholderElement.textContent = this._canonicalizedKeywordForKey(placeholder) || placeholder;
        }
    }, {
        key: "synthesizedValue",
        get: function get() {
            // FIXME: <https://webkit.org/b/147064> Getter and setter on super are called with wrong "this" object
            return this._generateSynthesizedValue();
        }
    }]);

    return VisualStyleKeywordPicker;
})(WebInspector.VisualStylePropertyEditor);
