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

WebInspector.VisualStyleNumberInputBox = (function (_WebInspector$VisualStylePropertyEditor) {
    _inherits(VisualStyleNumberInputBox, _WebInspector$VisualStylePropertyEditor);

    function VisualStyleNumberInputBox(propertyNames, text, possibleValues, possibleUnits, allowNegativeValues, layoutReversed) {
        _classCallCheck(this, VisualStyleNumberInputBox);

        _get(Object.getPrototypeOf(VisualStyleNumberInputBox.prototype), "constructor", this).call(this, propertyNames, text, possibleValues, possibleUnits || [WebInspector.UIString("Number")], "number-input-box", layoutReversed);

        this._hasUnits = !!possibleUnits;
        this._allowNegativeValues = !!allowNegativeValues || false;

        this.contentElement.classList.toggle("no-values", !possibleValues || !possibleValues.length);
        this.contentElement.classList.toggle("no-units", !this._hasUnits);

        var focusRingElement = document.createElement("div");
        focusRingElement.classList.add("focus-ring");
        this.contentElement.appendChild(focusRingElement);

        this._keywordSelectElement = document.createElement("select");
        this._keywordSelectElement.classList.add("number-input-keyword-select");
        if (this._possibleUnits.advanced) this._keywordSelectElement.title = WebInspector.UIString("Option-click to show all units");

        this._unchangedOptionElement = document.createElement("option");
        this._unchangedOptionElement.value = "";
        this._unchangedOptionElement.text = WebInspector.UIString("Unchanged");
        this._keywordSelectElement.appendChild(this._unchangedOptionElement);

        this._keywordSelectElement.appendChild(document.createElement("hr"));

        if (this._possibleValues) {
            this._createValueOptions(this._possibleValues.basic);
            this._keywordSelectElement.appendChild(document.createElement("hr"));
        }

        if (this._possibleUnits) this._createUnitOptions(this._possibleUnits.basic);

        this._advancedUnitsElements = null;

        this._keywordSelectElement.addEventListener("focus", this._focusContentElement.bind(this));
        this._keywordSelectElement.addEventListener("mousedown", this._keywordSelectMouseDown.bind(this));
        this._keywordSelectElement.addEventListener("change", this._keywordChanged.bind(this));
        this._keywordSelectElement.addEventListener("blur", this._blurContentElement.bind(this));
        this.contentElement.appendChild(this._keywordSelectElement);

        this._numberUnitsContainer = document.createElement("div");
        this._numberUnitsContainer.classList.add("number-input-container");

        this._valueNumberInputElement = document.createElement("input");
        this._valueNumberInputElement.classList.add("number-input-value");
        this._valueNumberInputElement.spellcheck = false;
        this._valueNumberInputElement.addEventListener("focus", this._focusContentElement.bind(this));
        this._valueNumberInputElement.addEventListener("keydown", this._valueNumberInputKeyDown.bind(this));
        this._valueNumberInputElement.addEventListener("keyup", this._valueNumberInputKeyUp.bind(this));
        this._valueNumberInputElement.addEventListener("blur", this._blurContentElement.bind(this));
        this._valueNumberInputElement.addEventListener("change", this._valueNumberInputChanged.bind(this));
        this._numberUnitsContainer.appendChild(this._valueNumberInputElement);

        this._unitsElement = document.createElement("span");
        this._numberUnitsContainer.appendChild(this._unitsElement);

        this.contentElement.appendChild(this._numberUnitsContainer);

        this._numberInputIsEditable = true;
        this.contentElement.classList.add("number-input-editable");
        this._valueNumberInputElement.value = null;
        this._valueNumberInputElement.setAttribute("placeholder", 0);
        if (this._hasUnits && this.valueIsSupportedUnit("px")) this._unitsElementTextContent = this._keywordSelectElement.value = "px";
    }

    // Public

    _createClass(VisualStyleNumberInputBox, [{
        key: "updateValueFromText",
        value: function updateValueFromText(text, value) {
            var match = this.parseValue(value);
            this.value = match ? match[1] : value;
            this.units = match ? match[2] : null;
            return this.modifyPropertyText(text, value);
        }

        // Protected

    }, {
        key: "parseValue",
        value: function parseValue(text) {
            return (/^(-?[\d.]+)([^\s\d]{0,4})(?:\s*;?)$/.exec(text)
            );
        }

        // Private

    }, {
        key: "_setNumberInputIsEditable",
        value: function _setNumberInputIsEditable(flag) {
            this._numberInputIsEditable = flag || false;
            this.contentElement.classList.toggle("number-input-editable", this._numberInputIsEditable);
        }
    }, {
        key: "_markUnitsContainerIfInputHasValue",
        value: function _markUnitsContainerIfInputHasValue() {
            var numberInputValue = this._valueNumberInputElement.value;
            this._numberUnitsContainer.classList.toggle("has-value", numberInputValue && numberInputValue.length);
        }
    }, {
        key: "_keywordChanged",
        value: function _keywordChanged() {
            var unchangedOptionSelected = this._unchangedOptionElement.selected;
            if (!unchangedOptionSelected) {
                var selectedKeywordIsUnit = this.valueIsSupportedUnit(this._keywordSelectElement.value);
                if (!this._numberInputIsEditable && selectedKeywordIsUnit) this._valueNumberInputElement.value = null;

                this._unitsElementTextContent = this._keywordSelectElement.value;
                this._setNumberInputIsEditable(selectedKeywordIsUnit);
            } else this._setNumberInputIsEditable(false);

            this._valueDidChange();
            this.specialPropertyPlaceholderElement.hidden = !unchangedOptionSelected;
        }
    }, {
        key: "_valueNumberInputKeyDown",
        value: function _valueNumberInputKeyDown(event) {
            if (!this._numberInputIsEditable) return;

            function adjustValue(delta) {
                var newValue = undefined;
                var value = this.value;
                if (!value && isNaN(value)) {
                    var placeholderValue = this.placeholder && !isNaN(this.placeholder) ? parseFloat(this.placeholder) : 0;
                    newValue = placeholderValue + delta;
                } else newValue = value + delta;

                if (!this._allowNegativeValues && newValue < 0) newValue = 0;

                this._updatedValues.propertyMissing = false;
                this.value = Math.round(newValue * 100) / 100;
                this._valueDidChange();
            }

            var shift = 1;
            if (event.ctrlKey) shift /= 10;else if (event.shiftKey) shift *= 10;

            var key = event.keyIdentifier;
            if (key.startsWith("Page")) shift *= 10;

            if (key === "Up" || key === "PageUp") {
                event.preventDefault();
                adjustValue.call(this, shift);
                return;
            }

            if (key === "Down" || key === "PageDown") {
                event.preventDefault();
                adjustValue.call(this, -shift);
                return;
            }

            this._markUnitsContainerIfInputHasValue();
            this._valueDidChange();
        }
    }, {
        key: "_valueNumberInputKeyUp",
        value: function _valueNumberInputKeyUp(event) {
            if (!this._numberInputIsEditable) return;

            this._markUnitsContainerIfInputHasValue();
            this._valueDidChange();
        }
    }, {
        key: "_keywordSelectMouseDown",
        value: function _keywordSelectMouseDown(event) {
            if (event.altKey) this._addAdvancedUnits();else if (!this._valueIsSupportedAdvancedUnit()) this._removeAdvancedUnits();
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
        key: "_createUnitOptions",
        value: function _createUnitOptions(units) {
            var addedElements = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = units[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var unit = _step.value;

                    var option = document.createElement("option");
                    option.text = unit;
                    this._keywordSelectElement.appendChild(option);
                    addedElements.push(option);
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

            return addedElements;
        }
    }, {
        key: "_addAdvancedUnits",
        value: function _addAdvancedUnits() {
            if (this._advancedUnitsElements) return;

            this._keywordSelectElement.appendChild(document.createElement("hr"));
            this._advancedUnitsElements = this._createUnitOptions(this._possibleUnits.advanced);
        }
    }, {
        key: "_removeAdvancedUnits",
        value: function _removeAdvancedUnits() {
            if (!this._advancedUnitsElements) return;

            this._keywordSelectElement.removeChild(this._advancedUnitsElements[0].previousSibling);
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._advancedUnitsElements[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var element = _step2.value;

                    this._keywordSelectElement.removeChild(element);
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

            this._advancedUnitsElements = null;
        }
    }, {
        key: "_focusContentElement",
        value: function _focusContentElement(event) {
            this.contentElement.classList.add("focused");
        }
    }, {
        key: "_blurContentElement",
        value: function _blurContentElement(event) {
            this.contentElement.classList.remove("focused");
        }
    }, {
        key: "_valueNumberInputChanged",
        value: function _valueNumberInputChanged(event) {
            var newValue = this.value;
            if (!newValue && isNaN(newValue)) newValue = this.placeholder && !isNaN(this.placeholder) ? parseFloat(this.placeholder) : 0;

            if (!this._allowNegativeValues && newValue < 0) newValue = 0;

            this.value = Math.round(newValue * 100) / 100;
            this._valueDidChange();
        }
    }, {
        key: "_toggleTabbingOfSelectableElements",
        value: function _toggleTabbingOfSelectableElements(disabled) {
            this._keywordSelectElement.tabIndex = disabled ? "-1" : null;
            this._valueNumberInputElement.tabIndex = disabled ? "-1" : null;
        }
    }, {
        key: "value",
        get: function get() {
            if (this._numberInputIsEditable) return parseFloat(this._valueNumberInputElement.value);

            if (!this._numberInputIsEditable) return this._keywordSelectElement.value;

            return null;
        },
        set: function set(value) {
            if (value && value === this.value) return;

            if (this._updatedValues.propertyMissing) {
                if (value || this._updatedValues.placeholder) this.specialPropertyPlaceholderElement.textContent = (value || this._updatedValues.placeholder) + (this._updatedValues.units || "");

                if (isNaN(value)) {
                    this._unchangedOptionElement.selected = true;
                    this._setNumberInputIsEditable();
                    this.specialPropertyPlaceholderElement.hidden = false;
                    return;
                }
            }

            this.specialPropertyPlaceholderElement.hidden = true;

            if (!value) {
                this._valueNumberInputElement.value = null;
                this._markUnitsContainerIfInputHasValue();
                return;
            }

            if (!isNaN(value)) {
                this._setNumberInputIsEditable(true);
                this._valueNumberInputElement.value = Math.round(value * 100) / 100;
                this._markUnitsContainerIfInputHasValue();
                return;
            }

            if (this.valueIsSupportedKeyword(value)) {
                this._setNumberInputIsEditable();
                this._keywordSelectElement.value = value;
                return;
            }
        }
    }, {
        key: "units",
        get: function get() {
            if (this._unchangedOptionElement.selected) return null;

            var keyword = this._keywordSelectElement.value;
            if (!this.valueIsSupportedUnit(keyword)) return null;

            return keyword;
        },
        set: function set(unit) {
            if (this._unchangedOptionElement.selected) return;

            if (!unit || unit === this.units) return;

            if (!this.valueIsSupportedUnit(unit)) return;

            if (this._valueIsSupportedAdvancedUnit(unit)) this._addAdvancedUnits();

            this._setNumberInputIsEditable(true);
            this._keywordSelectElement.value = unit;
            this._unitsElementTextContent = unit;
        }
    }, {
        key: "placeholder",
        get: function get() {
            return this._valueNumberInputElement.getAttribute("placeholder");
        },
        set: function set(text) {
            if (text === this.placeholder) return;

            var onlyNumericalText = text && !isNaN(text) && Math.round(text * 100) / 100;
            this._valueNumberInputElement.setAttribute("placeholder", onlyNumericalText || 0);

            if (!onlyNumericalText) this.specialPropertyPlaceholderElement.textContent = this._canonicalizedKeywordForKey(text) || text;
        }
    }, {
        key: "synthesizedValue",
        get: function get() {
            if (this._unchangedOptionElement.selected) return null;

            var value = this._valueNumberInputElement.value;
            if (this._numberInputIsEditable && !value) return null;

            var keyword = this._keywordSelectElement.value;
            return this.valueIsSupportedUnit(keyword) ? value + (this._hasUnits ? keyword : "") : keyword;
        }
    }, {
        key: "_unitsElementTextContent",
        set: function set(text) {
            if (!this._hasUnits) return;

            this._unitsElement.textContent = text;
            this._markUnitsContainerIfInputHasValue();
        }
    }]);

    return VisualStyleNumberInputBox;
})(WebInspector.VisualStylePropertyEditor);
