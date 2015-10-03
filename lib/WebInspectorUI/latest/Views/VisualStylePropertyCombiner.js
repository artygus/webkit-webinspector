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

WebInspector.VisualStylePropertyCombiner = (function (_WebInspector$Object) {
    _inherits(VisualStylePropertyCombiner, _WebInspector$Object);

    function VisualStylePropertyCombiner(propertyName, propertyEditors) {
        _classCallCheck(this, VisualStylePropertyCombiner);

        _get(Object.getPrototypeOf(VisualStylePropertyCombiner.prototype), "constructor", this).call(this);

        this._style = null;
        this._propertyName = propertyName;
        this._propertyMissing = false;
        this._propertyEditors = propertyEditors || [];

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = this._propertyEditors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var editor = _step.value;

                editor.addEventListener(WebInspector.VisualStylePropertyEditor.Event.ValueDidChange, this._handlePropertyEditorValueChanged, this);
                editor.suppressStyleTextUpdate = true;
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

        this._textContainsNameRegExp = new RegExp("(?:(?:^|;)\\s*" + this._propertyName + "\\s*:)");
        this._replacementRegExp = new RegExp("((?:^|;)\\s*)(" + this._propertyName + ")(.+?(?:;|$))");
        this._valueRegExp = /([^\s]+\(.+\)|[^\s]+)(?:;?)/g;
    }

    _createClass(VisualStylePropertyCombiner, [{
        key: "modifyPropertyText",
        value: function modifyPropertyText(text, value) {
            if (this._textContainsNameRegExp.test(text)) text = text.replace(this._replacementRegExp, value !== null ? "$1$2: " + value + ";" : "$1");else if (value !== null) text += WebInspector.VisualStylePropertyEditor.generateFormattedTextForNewProperty(text, this._propertyName, value);

            return text;
        }
    }, {
        key: "update",
        value: function update(style) {
            if (style) this._style = style;else if (this._ignoreNextUpdate) {
                this._ignoreNextUpdate = false;
                return;
            }

            if (!this._style || !this._valueRegExp) return;

            var property = this._style.propertyForName(this._propertyName, true);
            var propertyMissing = !property;
            if (propertyMissing && this._style.nodeStyles) property = this._style.nodeStyles.computedStyle.propertyForName(this._propertyName);

            if (!property) return;

            this.updateValuesFromText(property.value, propertyMissing);
            this._propertyMissing = propertyMissing;
        }
    }, {
        key: "updateValuesFromText",
        value: function updateValuesFromText(styleText, propertyMissing) {
            if (styleText === this.synthesizedValue) return;

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._propertyEditors[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var editor = _step2.value;

                    editor[WebInspector.VisualStylePropertyCombiner.EditorUpdatedSymbol] = false;
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

            function updateCompatibleEditor(value) {
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = this._propertyEditors[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var editor = _step3.value;

                        if (value && !editor.valueIsCompatible(value) || editor[WebInspector.VisualStylePropertyCombiner.EditorUpdatedSymbol]) continue;

                        if (this._currentValueIsKeyword && editor.disabled) continue;

                        var updatedValues = editor.getValuesFromText(value || "", propertyMissing);
                        editor.updateEditorValues(updatedValues);
                        editor[WebInspector.VisualStylePropertyCombiner.EditorUpdatedSymbol] = true;

                        if (value) return;
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
            }

            var matches = styleText.match(this._valueRegExp);
            for (var i = 0; i < this._propertyEditors.length; ++i) {
                updateCompatibleEditor.call(this, matches && matches[i]);
            }
        }
    }, {
        key: "resetEditorValues",
        value: function resetEditorValues(value) {
            this._ignoreNextUpdate = false;
            this.updateValuesFromText(value || "");
        }

        // Private

    }, {
        key: "_markEditors",
        value: function _markEditors(ignoredEditor, disabled) {
            this._currentValueIsKeyword = disabled || false;
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this._propertyEditors[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var editor = _step4.value;

                    if (ignoredEditor && editor === ignoredEditor) continue;

                    editor.disabled = this._currentValueIsKeyword;
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
        }
    }, {
        key: "_handlePropertyEditorValueChanged",
        value: function _handlePropertyEditorValueChanged() {
            this._ignoreNextUpdate = true;
            var value = this.synthesizedValue;
            if (this._style) this._style.text = this.modifyPropertyText(this._style.text, value);

            this._propertyMissing = !value;
            this.dispatchEventToListeners(WebInspector.VisualStylePropertyEditor.Event.ValueDidChange);
        }
    }, {
        key: "style",
        get: function get() {
            return this._style;
        }
    }, {
        key: "synthesizedValue",
        get: function get() {
            var value = "";
            var oneEditorHasValue = false;
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this._propertyEditors[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var editor = _step5.value;

                    var editorValue = editor.synthesizedValue;
                    if (editorValue && editorValue.length) oneEditorHasValue = true;else if (editor.optionalProperty) continue;

                    if (editor.masterProperty && editor.valueIsSupportedKeyword()) {
                        this._markEditors(editor, true);
                        return editorValue;
                    }

                    if (editor !== this._propertyEditors[0]) value += " ";

                    value += editorValue || (editor.colorProperty ? "transparent" : 0);
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

            this._markEditors();
            return value.length && oneEditorHasValue ? value : null;
        }
    }, {
        key: "propertyMissing",
        get: function get() {
            return this._propertyMissing;
        }
    }]);

    return VisualStylePropertyCombiner;
})(WebInspector.Object);

WebInspector.VisualStylePropertyCombiner.EditorUpdatedSymbol = Symbol("visual-style-property-combiner-editor-updated");
