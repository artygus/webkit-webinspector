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

WebInspector.VisualStylePropertyEditor = (function (_WebInspector$Object) {
    _inherits(VisualStylePropertyEditor, _WebInspector$Object);

    function VisualStylePropertyEditor(propertyNames, label, possibleValues, possibleUnits, className, layoutReversed) {
        _classCallCheck(this, VisualStylePropertyEditor);

        _get(Object.getPrototypeOf(VisualStylePropertyEditor.prototype), "constructor", this).call(this);

        this._propertyInfoList = [];
        this._style = null;

        function canonicalizeValues(values) {
            if (!values) return;

            var canonicalizedValues = {};
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = values[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var value = _step.value;

                    canonicalizedValues[value.toLowerCase().replace(/\s/g, "-")] = value;
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

            return canonicalizedValues;
        }

        this._possibleValues = null;
        if (possibleValues) {
            this._possibleValues = {};
            if (Array.isArray(possibleValues)) this._possibleValues.basic = canonicalizeValues(possibleValues);else {
                this._possibleValues.basic = canonicalizeValues(possibleValues.basic);
                this._possibleValues.advanced = canonicalizeValues(possibleValues.advanced);
            }
        }
        this._possibleUnits = null;
        if (possibleUnits) {
            this._possibleUnits = {};
            if (Array.isArray(possibleUnits)) this._possibleUnits.basic = possibleUnits;else this._possibleUnits = possibleUnits;
        }

        this._element = document.createElement("div");
        this._element.classList.add("visual-style-property-container", className);
        this._element.classList.toggle("layout-reversed", layoutReversed);

        if (label && label.length) {
            var titleContainer = document.createElement("div");
            titleContainer.classList.add("visual-style-property-title");

            this._titleElement = document.createElement("span");
            this._titleElement.appendChild(document.createTextNode(label));
            this._titleElement.addEventListener("mouseover", this._titleElementMouseOver.bind(this));
            this._titleElement.addEventListener("mouseout", this._titleElementMouseOut.bind(this));
            this._titleElement.addEventListener("click", this._titleElementClick.bind(this));
            titleContainer.appendChild(this._titleElement);

            this._element.appendChild(titleContainer);

            this._boundTitleElementPrepareForClick = this._titleElementPrepareForClick.bind(this);
        }

        this._contentElement = document.createElement("div");
        this._contentElement.classList.add("visual-style-property-value-container");

        this._specialPropertyPlaceholderElement = document.createElement("span");
        this._specialPropertyPlaceholderElement.classList.add("visual-style-special-property-placeholder");
        this._specialPropertyPlaceholderElement.hidden = true;
        this._contentElement.appendChild(this._specialPropertyPlaceholderElement);

        this._element.appendChild(this._contentElement);

        this._updatedValues = {};
        this._lastValue = null;

        if (typeof propertyNames === "string") propertyNames = [propertyNames];else {
            this._hasMultipleProperties = true;
            this._element.classList.add("multiple");
        }

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = propertyNames[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var _name = _step2.value;

                this._element.classList.add(_name);
                this._propertyInfoList.push({
                    name: _name,
                    textContainsNameRegExp: new RegExp("(?:(?:^|;)\\s*" + _name + "\\s*:)"),
                    replacementRegExp: new RegExp("((?:^|;)\\s*)(" + _name + ")(.+?(?:;|$))")
                });
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

        this._propertyReferenceName = propertyNames[0];
        this._propertyReferenceText = WebInspector.VisualStyleDetailsPanel.propertyReferenceInfo[this._propertyReferenceName];
        this._hasPropertyReference = this._propertyReferenceText && !!this._propertyReferenceText.trim().length;
        this._representedProperty = null;
    }

    // Static

    _createClass(VisualStylePropertyEditor, [{
        key: "update",
        value: function update(style) {
            if (style) this._style = style;else if (this._ignoreNextUpdate) {
                this._ignoreNextUpdate = false;
                return;
            }

            if (!this._style) return;

            this._updatedValues = {};
            var propertyValuesConflict = false;
            var propertyMissing = false;
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this._propertyInfoList[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var propertyInfo = _step3.value;

                    var property = this._style.propertyForName(propertyInfo.name, true);
                    propertyMissing = !property;
                    if (propertyMissing && this._style.nodeStyles) property = this._style.nodeStyles.computedStyle.propertyForName(propertyInfo.name);

                    if (!property) continue;

                    if (!propertyMissing && property.anonymous) this._representedProperty = property;

                    var newValues = this.getValuesFromText(property.value, propertyMissing);
                    if (this._updatedValues.placeholder && this._updatedValues.placeholder !== newValues.placeholder) propertyValuesConflict = true;

                    if (!this._updatedValues.placeholder) this._updatedValues = newValues;

                    if (propertyValuesConflict) {
                        this._updatedValues.conflictingValues = true;
                        this._specialPropertyPlaceholderElement.textContent = WebInspector.UIString("(multiple)");
                        break;
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

            if (this._hasMultipleProperties) this._specialPropertyPlaceholderElement.hidden = !propertyValuesConflict;

            this.updateEditorValues(this._updatedValues);
        }
    }, {
        key: "updateEditorValues",
        value: function updateEditorValues(updatedValues) {
            this.value = updatedValues.value;
            this.units = updatedValues.units;
            this.placeholder = updatedValues.placeholder;

            this._lastValue = this.synthesizedValue;
            this.disabled = false;
        }
    }, {
        key: "resetEditorValues",
        value: function resetEditorValues(value) {
            this._ignoreNextUpdate = false;
            if (!value || !value.length) {
                this.value = null;
                this._specialPropertyPlaceholderElement.hidden = false;
                return;
            }

            var updatedValues = this.getValuesFromText(value);
            this.updateEditorValues(updatedValues);
        }
    }, {
        key: "modifyPropertyText",
        value: function modifyPropertyText(text, value) {
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this._propertyInfoList[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var property = _step4.value;

                    if (property.textContainsNameRegExp.test(text)) text = text.replace(property.replacementRegExp, value !== null ? "$1$2: " + value + ";" : "$1");else if (value !== null) text += WebInspector.VisualStylePropertyEditor.generateFormattedTextForNewProperty(text, property.name, value);
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

            return text;
        }
    }, {
        key: "getValuesFromText",
        value: function getValuesFromText(text, propertyMissing) {
            var match = this.parseValue(text);
            var placeholder = match ? match[1] : text;
            var units = match ? match[2] : null;
            var value = placeholder;
            if (propertyMissing) value = this.valueIsSupportedKeyword(text) ? text : null;

            return { value: value, units: units, placeholder: placeholder, propertyMissing: propertyMissing };
        }
    }, {
        key: "valueIsCompatible",
        value: function valueIsCompatible(value) {
            if (!value || !value.length) return false;

            return this.valueIsSupportedKeyword(value) || !!this.parseValue(value);
        }
    }, {
        key: "valueIsSupportedKeyword",
        value: function valueIsSupportedKeyword(value) {
            if (!this._possibleValues) return false;

            value = value || this.value;
            if (Object.keys(this._possibleValues.basic).includes(value)) return true;

            return this._valueIsSupportedAdvancedKeyword(value);
        }
    }, {
        key: "valueIsSupportedUnit",
        value: function valueIsSupportedUnit(unit) {
            if (!this._possibleUnits) return false;

            unit = unit || this.units;
            if (this._possibleUnits.basic.includes(unit)) return true;

            return this._valueIsSupportedAdvancedUnit(unit);
        }

        // Protected

    }, {
        key: "parseValue",
        value: function parseValue(text) {
            return (/^([^;]+)\s*;?$/.exec(text)
            );
        }

        // Private

    }, {
        key: "_valueIsSupportedAdvancedKeyword",
        value: function _valueIsSupportedAdvancedKeyword(value) {
            return this._possibleValues.advanced && Object.keys(this._possibleValues.advanced).includes(value || this.value);
        }
    }, {
        key: "_valueIsSupportedAdvancedUnit",
        value: function _valueIsSupportedAdvancedUnit(unit) {
            return this._possibleUnits.advanced && this._possibleUnits.advanced.includes(unit || this.units);
        }
    }, {
        key: "_canonicalizedKeywordForKey",
        value: function _canonicalizedKeywordForKey(value) {
            if (!value || !this._possibleValues) return null;

            return this._possibleValues.basic[value] || this._possibleValues.advanced && this._possibleValues.advanced[value] || null;
        }
    }, {
        key: "_keyForKeyword",
        value: function _keyForKeyword(keyword) {
            if (!keyword || !keyword.length || !this._possibleValues) return null;

            for (var basicKey in this._possibleValues.basic) {
                if (this._possibleValues.basic[basicKey] === keyword) return basicKey;
            }

            if (!this._possibleValues.advanced) return null;

            for (var advancedKey in this._possibleValues.advanced) {
                if (this._possibleValues.advanced[advancedKey] === keyword) return advancedKey;
            }

            return null;
        }
    }, {
        key: "_valueDidChange",
        value: function _valueDidChange() {
            var value = this.synthesizedValue;
            if (value === this._lastValue) return false;

            if (this._style && !this._suppressStyleTextUpdate) {
                var newText = this._style.text;
                newText = this._replaceShorthandPropertyWithLonghandProperties(newText);
                newText = this.modifyPropertyText(newText, value);
                this._style.text = newText;
                if (!newText.length) this._style.update(null, null, this._style.styleSheetTextRange);
            }

            this._lastValue = value;
            this._updatedValues.propertyMissing = !value;
            this._ignoreNextUpdate = true;
            this._specialPropertyPlaceholderElement.hidden = true;

            this.dispatchEventToListeners(WebInspector.VisualStylePropertyEditor.Event.ValueDidChange);
            return true;
        }
    }, {
        key: "_replaceShorthandPropertyWithLonghandProperties",
        value: function _replaceShorthandPropertyWithLonghandProperties(text) {
            if (!this._representedProperty) return text;

            var shorthand = this._representedProperty.relatedShorthandProperty;
            if (!shorthand) return text;

            var longhandText = "";
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = shorthand.relatedLonghandProperties[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var longhandProperty = _step5.value;

                    if (longhandProperty.anonymous) longhandText += longhandProperty.synthesizedText;
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

            return longhandText ? text.replace(shorthand.text, longhandText) : text;
        }
    }, {
        key: "_titleElementPrepareForClick",
        value: function _titleElementPrepareForClick(event) {
            this._titleElement.classList.toggle("property-reference-info", event.type === "keydown" && event.altKey);
        }
    }, {
        key: "_titleElementMouseOver",
        value: function _titleElementMouseOver(event) {
            if (!this._hasPropertyReference) return;

            this._titleElement.classList.toggle("property-reference-info", event.altKey);
            document.addEventListener("keydown", this._boundTitleElementPrepareForClick);
            document.addEventListener("keyup", this._boundTitleElementPrepareForClick);
        }
    }, {
        key: "_titleElementMouseOut",
        value: function _titleElementMouseOut() {
            if (!this._hasPropertyReference) return;

            this._titleElement.classList.remove("property-reference-info");
            document.removeEventListener("keydown", this._boundTitleElementPrepareForClick);
            document.removeEventListener("keyup", this._boundTitleElementPrepareForClick);
        }
    }, {
        key: "_titleElementClick",
        value: function _titleElementClick(event) {
            if (event.altKey) this._showPropertyInfoPopover();
        }
    }, {
        key: "_hasMultipleConflictingValues",
        value: function _hasMultipleConflictingValues() {
            return this._hasMultipleProperties && !this._specialPropertyPlaceholderElement.hidden;
        }
    }, {
        key: "_showPropertyInfoPopover",
        value: function _showPropertyInfoPopover() {
            if (!this._hasPropertyReference) return;

            var propertyInfoElement = document.createElement("p");
            propertyInfoElement.classList.add("visual-style-property-info-popover");

            var propertyInfoTitleElement = document.createElement("h3");
            propertyInfoTitleElement.appendChild(document.createTextNode(this._propertyReferenceName));
            propertyInfoElement.appendChild(propertyInfoTitleElement);

            propertyInfoElement.appendChild(document.createTextNode(this._propertyReferenceText));

            var bounds = WebInspector.Rect.rectFromClientRect(this._titleElement.getBoundingClientRect());
            var popover = new WebInspector.Popover(this);
            popover.content = propertyInfoElement;
            popover.present(bounds.pad(2), [WebInspector.RectEdge.MIN_Y]);
        }
    }, {
        key: "_toggleTabbingOfSelectableElements",
        value: function _toggleTabbingOfSelectableElements(disabled) {
            // Implemented by subclass.
        }
    }, {
        key: "element",

        // Public

        get: function get() {
            return this._element;
        }
    }, {
        key: "style",
        get: function get() {
            return this._style;
        }
    }, {
        key: "value",
        get: function get() {
            // Implemented by subclass.
        },
        set: function set(value) {
            // Implemented by subclass.
        }
    }, {
        key: "units",
        get: function get() {
            // Implemented by subclass.
        },
        set: function set(unit) {
            // Implemented by subclass.
        }
    }, {
        key: "placeholder",
        get: function get() {
            // Implemented by subclass.
        },
        set: function set(text) {
            // Implemented by subclass.
        }
    }, {
        key: "synthesizedValue",
        get: function get() {
            // Implemented by subclass.
        }
    }, {
        key: "suppressStyleTextUpdate",
        set: function set(flag) {
            this._suppressStyleTextUpdate = flag;
        }
    }, {
        key: "masterProperty",
        set: function set(flag) {
            this._masterProperty = flag;
        },
        get: function get() {
            return this._masterProperty;
        }
    }, {
        key: "optionalProperty",
        set: function set(flag) {
            this._optionalProperty = flag;
        },
        get: function get() {
            return this._optionalProperty;
        }
    }, {
        key: "colorProperty",
        set: function set(flag) {
            this._colorProperty = flag;
        },
        get: function get() {
            return this._colorProperty;
        }
    }, {
        key: "propertyReferenceName",
        get: function get() {
            return this._propertyReferenceName;
        },
        set: function set(name) {
            if (!name || !name.length) return;

            this._propertyReferenceName = name;
        }
    }, {
        key: "disabled",
        set: function set(flag) {
            this._disabled = flag;
            this._element.classList.toggle("disabled", this._disabled);
            this._toggleTabbingOfSelectableElements(this._disabled);
        },
        get: function get() {
            return this._disabled;
        }
    }, {
        key: "propertyMissing",
        get: function get() {
            return this._updatedValues && this._updatedValues.propertyMissing;
        }
    }, {
        key: "contentElement",
        get: function get() {
            return this._contentElement;
        }
    }, {
        key: "specialPropertyPlaceholderElement",
        get: function get() {
            return this._specialPropertyPlaceholderElement;
        }
    }], [{
        key: "generateFormattedTextForNewProperty",
        value: function generateFormattedTextForNewProperty(styleText, propertyName, propertyValue) {
            if (!propertyName || !propertyValue) return "";

            styleText = styleText || "";

            // FIXME: <rdar://problem/10593948> Provide a way to change the tab width in the Web Inspector
            var linePrefixText = "    ";
            var lineSuffixWhitespace = "\n";
            var trimmedText = styleText.trimRight();
            var textHasNewlines = trimmedText.includes("\n");

            if (trimmedText.trimLeft().length) {
                var styleTextPrefixWhitespace = trimmedText.match(/^\s*/);
                if (styleTextPrefixWhitespace) {
                    var linePrefixWhitespaceMatch = styleTextPrefixWhitespace[0].match(/[^\S\n]+$/);
                    if (linePrefixWhitespaceMatch && textHasNewlines) linePrefixText = linePrefixWhitespaceMatch[0];else {
                        linePrefixText = "";
                        lineSuffixWhitespace = styleTextPrefixWhitespace[0];
                    }
                }

                if (!trimmedText.endsWith(";")) linePrefixText = ";" + linePrefixText;
            } else linePrefixText = "\n" + linePrefixText;

            return linePrefixText + propertyName + ": " + propertyValue + ";" + lineSuffixWhitespace;
        }
    }]);

    return VisualStylePropertyEditor;
})(WebInspector.Object);

WebInspector.VisualStylePropertyEditor.Event = {
    ValueDidChange: "visual-style-property-editor-value-changed"
};
