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

WebInspector.VisualStyleTimingEditor = (function (_WebInspector$VisualStyleKeywordPicker) {
    _inherits(VisualStyleTimingEditor, _WebInspector$VisualStyleKeywordPicker);

    function VisualStyleTimingEditor(propertyNames, text, possibleValues, layoutReversed) {
        _classCallCheck(this, VisualStyleTimingEditor);

        _get(Object.getPrototypeOf(VisualStyleTimingEditor.prototype), "constructor", this).call(this, propertyNames, text, possibleValues, layoutReversed);

        this.element.classList.add("timing-editor");

        this._customValueOptionElement = document.createElement("option");
        this._customValueOptionElement.value = "custom";
        this._customValueOptionElement.text = WebInspector.UIString("Custom");
        this._keywordSelectElement.appendChild(this._customValueOptionElement);

        this._bezierMarkerElement = document.createElement("span");
        this._bezierMarkerElement.title = WebInspector.UIString("Click to open a cubic-bezier editor");
        this._bezierMarkerElement.classList.add("bezier-editor");
        this._bezierMarkerElement.hidden = true;
        this._bezierMarkerElement.addEventListener("click", this._bezierMarkerClicked.bind(this));
        this.contentElement.appendChild(this._bezierMarkerElement);

        this._bezierEditor = new WebInspector.BezierEditor();
        this._bezierEditor.addEventListener(WebInspector.BezierEditor.Event.BezierChanged, this._valueDidChange.bind(this));
        this._bezierEditor.bezier = WebInspector.CubicBezier.fromString("linear");
    }

    // Protected

    _createClass(VisualStyleTimingEditor, [{
        key: "parseValue",
        value: function parseValue(text) {
            return (/(cubic-bezier\(.+\))/.exec(text)
            );
        }
    }, {
        key: "_getValue",

        // Private

        value: function _getValue() {
            return this._customValueOptionElement.selected ? this.bezierValue : _get(Object.getPrototypeOf(VisualStyleTimingEditor.prototype), "_getValue", this).call(this);
        }
    }, {
        key: "_setValue",
        value: function _setValue(value) {
            this.bezierValue = value;
            if (this.valueIsSupportedKeyword(value)) {
                _get(Object.getPrototypeOf(VisualStyleTimingEditor.prototype), "_setValue", this).call(this, value);
                this._bezierMarkerElement.hidden = true;
                return;
            }

            var bezier = this.bezierValue;
            this._customValueOptionElement.selected = !!bezier;
            this._bezierMarkerElement.hidden = !bezier;
            this.specialPropertyPlaceholderElement.hidden = !!bezier;
            if (!bezier) _get(Object.getPrototypeOf(VisualStyleTimingEditor.prototype), "_setValue", this).call(this, value);
        }
    }, {
        key: "_generateSynthesizedValue",
        value: function _generateSynthesizedValue() {
            return this._customValueOptionElement.selected ? this.bezierValue : _get(Object.getPrototypeOf(VisualStyleTimingEditor.prototype), "_generateSynthesizedValue", this).call(this);
        }
    }, {
        key: "_bezierMarkerClicked",
        value: function _bezierMarkerClicked() {
            var bounds = WebInspector.Rect.rectFromClientRect(this._bezierMarkerElement.getBoundingClientRect());
            this._cubicBezierEditorPopover = new WebInspector.Popover(this);
            this._cubicBezierEditorPopover.content = this._bezierEditor.element;
            this._cubicBezierEditorPopover.present(bounds.pad(2), [WebInspector.RectEdge.MIN_X]);
        }
    }, {
        key: "_handleKeywordChanged",
        value: function _handleKeywordChanged() {
            _get(Object.getPrototypeOf(VisualStyleTimingEditor.prototype), "_handleKeywordChanged", this).call(this);
            var customOptionSelected = this._customValueOptionElement.selected;
            this._bezierMarkerElement.hidden = !customOptionSelected;
            this.specialPropertyPlaceholderElement.hidden = !!customOptionSelected;
            if (customOptionSelected) this.bezierValue = "linear";
        }
    }, {
        key: "bezierValue",
        get: function get() {
            var bezier = this._bezierEditor.bezier;
            if (!bezier) return null;

            return bezier.toString();
        },
        set: function set(text) {
            var bezier = WebInspector.CubicBezier.fromString(text);
            this._bezierEditor.bezier = bezier;
        }
    }]);

    return VisualStyleTimingEditor;
})(WebInspector.VisualStyleKeywordPicker);
