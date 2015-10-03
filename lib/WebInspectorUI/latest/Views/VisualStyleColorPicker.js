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

WebInspector.VisualStyleColorPicker = (function (_WebInspector$VisualStylePropertyEditor) {
    _inherits(VisualStyleColorPicker, _WebInspector$VisualStylePropertyEditor);

    function VisualStyleColorPicker(propertyNames, text, layoutReversed) {
        _classCallCheck(this, VisualStyleColorPicker);

        _get(Object.getPrototypeOf(VisualStyleColorPicker.prototype), "constructor", this).call(this, propertyNames, text, null, null, "input-color-picker", layoutReversed);

        this._swatchElement = document.createElement("span");
        this._swatchElement.classList.add("color-swatch");
        this._swatchElement.title = WebInspector.UIString("Click to select a color. Shift-click to switch color formats.");
        this._swatchElement.addEventListener("click", this._colorSwatchClicked.bind(this));

        this._swatchInnerElement = document.createElement("span");
        this._swatchElement.appendChild(this._swatchInnerElement);

        this.contentElement.appendChild(this._swatchElement);

        this._textInputElement = document.createElement("input");
        this._textInputElement.spellcheck = false;
        this._textInputElement.addEventListener("keydown", this._textInputKeyDown.bind(this));
        this._textInputElement.addEventListener("keyup", this._textInputKeyUp.bind(this));
        this._textInputElement.addEventListener("blur", this._hideCompletions.bind(this));
        this.contentElement.appendChild(this._textInputElement);

        this._completionController = new WebInspector.VisualStyleCompletionsController(this);
        this._completionController.addEventListener(WebInspector.VisualStyleCompletionsController.Event.CompletionSelected, this._completionClicked, this);

        this._formatChanged = false;
        this._updateColorSwatch();
    }

    // Public

    _createClass(VisualStyleColorPicker, [{
        key: "_updateColorSwatch",

        // Private

        value: function _updateColorSwatch() {
            var value = this._textInputElement.value;
            this._color = WebInspector.Color.fromString(value || "transparent");
            this._swatchInnerElement.style.backgroundColor = this._color ? value : null;
        }
    }, {
        key: "_colorSwatchClicked",
        value: function _colorSwatchClicked(event) {
            var color = this._color;
            if (event.shiftKey) {
                var nextFormat = color.nextFormat();

                console.assert(nextFormat);
                if (!nextFormat) return;

                color.format = nextFormat;
                this.value = color.toString();

                this._formatChanged = true;
                this._valueDidChange();
                return;
            }

            var bounds = WebInspector.Rect.rectFromClientRect(this._swatchElement.getBoundingClientRect());

            var colorPicker = new WebInspector.ColorPicker();
            colorPicker.addEventListener(WebInspector.ColorPicker.Event.ColorChanged, this._colorPickerColorDidChange, this);

            var popover = new WebInspector.Popover(this);
            popover.content = colorPicker.element;
            popover.present(bounds.pad(2), [WebInspector.RectEdge.MIN_X]);

            colorPicker.color = color;
        }
    }, {
        key: "_colorPickerColorDidChange",
        value: function _colorPickerColorDidChange(event) {
            var format = !this._formatChanged ? WebInspector.Color.Format.HEX : null;
            this.value = event.data.color.toString(format);
            this._valueDidChange();
        }
    }, {
        key: "_completionClicked",
        value: function _completionClicked(event) {
            this.value = event.data.text;
            this._valueDidChange();
        }
    }, {
        key: "_textInputKeyDown",
        value: function _textInputKeyDown(event) {
            if (!this._completionController.visible) return;

            var keyCode = event.keyCode;
            var enterKeyCode = WebInspector.KeyboardShortcut.Key.Enter.keyCode;
            var tabKeyCode = WebInspector.KeyboardShortcut.Key.Tab.keyCode;
            if (keyCode === enterKeyCode || keyCode === tabKeyCode) {
                this.value = this._completionController.currentCompletion;
                this._hideCompletions();
                this._valueDidChange();
                return;
            }

            var escapeKeyCode = WebInspector.KeyboardShortcut.Key.Escape.keyCode;
            if (keyCode === escapeKeyCode) {
                this._hideCompletions();
                return;
            }

            var key = event.keyIdentifier;
            if (key === "Up") {
                this._completionController.previous();
                return;
            }

            if (key === "Down") {
                this._completionController.next();
                return;
            }
        }
    }, {
        key: "_textInputKeyUp",
        value: function _textInputKeyUp() {
            this._showCompletionsIfAble();
            this._updateColorSwatch();
            this._valueDidChange();
        }
    }, {
        key: "_showCompletionsIfAble",
        value: function _showCompletionsIfAble() {
            if (!this.hasCompletions) return;

            var result = this._valueDidChange();
            if (!result) return;

            if (this._completionController.update(this.value)) {
                var bounds = WebInspector.Rect.rectFromClientRect(this._textInputElement.getBoundingClientRect());
                if (!bounds) return;

                this._completionController.show(bounds, 2);
            }
        }
    }, {
        key: "_hideCompletions",
        value: function _hideCompletions() {
            this._completionController.hide();
        }
    }, {
        key: "_toggleTabbingOfSelectableElements",
        value: function _toggleTabbingOfSelectableElements(disabled) {
            this._textInputElement.tabIndex = disabled ? "-1" : null;
        }
    }, {
        key: "value",
        get: function get() {
            return this._textInputElement.value;
        },
        set: function set(value) {
            if (value && value === this.value) return;

            this._textInputElement.value = this._hasMultipleConflictingValues() ? null : value;
            this._updateColorSwatch();
        }
    }, {
        key: "placeholder",
        get: function get() {
            return this._textInputElement.getAttribute("placeholder");
        },
        set: function set(text) {
            if (text && text === this.placeholder) return;

            if (this._hasMultipleConflictingValues()) text = this.specialPropertyPlaceholderElement.textContent;

            this._textInputElement.setAttribute("placeholder", text || "transparent");
        }
    }, {
        key: "synthesizedValue",
        get: function get() {
            return this.value || null;
        }
    }, {
        key: "hasCompletions",
        get: function get() {
            return this._completionController.hasCompletions;
        }
    }, {
        key: "completions",
        set: function set(completions) {
            this._completionController.completions = completions;
        }
    }]);

    return VisualStyleColorPicker;
})(WebInspector.VisualStylePropertyEditor);
