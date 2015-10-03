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

WebInspector.ColorPicker = (function (_WebInspector$Object) {
    _inherits(ColorPicker, _WebInspector$Object);

    function ColorPicker() {
        _classCallCheck(this, ColorPicker);

        _get(Object.getPrototypeOf(ColorPicker.prototype), "constructor", this).call(this);

        this._colorWheel = new WebInspector.ColorWheel();
        this._colorWheel.delegate = this;
        this._colorWheel.dimension = 200;

        this._brightnessSlider = new WebInspector.Slider();
        this._brightnessSlider.delegate = this;
        this._brightnessSlider.element.classList.add("brightness");

        this._opacitySlider = new WebInspector.Slider();
        this._opacitySlider.delegate = this;
        this._opacitySlider.element.classList.add("opacity");

        this._element = document.createElement("div");
        this._element.className = "color-picker";

        this._element.appendChild(this._colorWheel.element);
        this._element.appendChild(this._brightnessSlider.element);
        this._element.appendChild(this._opacitySlider.element);

        this._opacity = 0;
        this._opacityPattern = "url(Images/Checkers.svg)";

        this._color = "white";
    }

    // Public

    _createClass(ColorPicker, [{
        key: "colorWheelColorDidChange",
        value: function colorWheelColorDidChange(colorWheel) {
            this._updateColor();
            this._updateSliders(this._colorWheel.rawColor, this._colorWheel.tintedColor);
        }
    }, {
        key: "sliderValueDidChange",
        value: function sliderValueDidChange(slider, value) {
            if (slider === this._opacitySlider) this.opacity = value;else if (slider === this._brightnessSlider) this.brightness = value;
        }

        // Private

    }, {
        key: "_updateColor",
        value: function _updateColor() {
            if (this._dontUpdateColor) return;

            var opacity = Math.round(this._opacity * 100) / 100;

            var components;
            if (this._colorFormat === WebInspector.Color.Format.HSL || this._colorFormat === WebInspector.Color.Format.HSLA) components = this._colorWheel.tintedColor.hsl.concat(opacity);else components = this._colorWheel.tintedColor.rgb.concat(opacity);

            this._color = new WebInspector.Color(this._colorFormat, components);
            this.dispatchEventToListeners(WebInspector.ColorPicker.Event.ColorChanged, { color: this._color });
        }
    }, {
        key: "_updateSliders",
        value: function _updateSliders(rawColor, tintedColor) {
            var rgb = this._colorWheel.tintedColor.rgb;
            var opaque = new WebInspector.Color(WebInspector.Color.Format.RGBA, rgb.concat(1)).toString();
            var transparent = new WebInspector.Color(WebInspector.Color.Format.RGBA, rgb.concat(0)).toString();

            this._opacitySlider.element.style.backgroundImage = "linear-gradient(90deg, " + transparent + ", " + opaque + "), " + this._opacityPattern;
            this._brightnessSlider.element.style.backgroundImage = "linear-gradient(90deg, black, " + rawColor + ")";
        }
    }, {
        key: "element",
        get: function get() {
            return this._element;
        }
    }, {
        key: "brightness",
        set: function set(brightness) {
            if (brightness === this._brightness) return;

            this._colorWheel.brightness = brightness;

            this._updateColor();
            this._updateSliders(this._colorWheel.rawColor, this._colorWheel.tintedColor);
        }
    }, {
        key: "opacity",
        set: function set(opacity) {
            if (opacity === this._opacity) return;

            this._opacity = opacity;
            this._updateColor();
        }
    }, {
        key: "colorWheel",
        get: function get() {
            return this._colorWheel;
        }
    }, {
        key: "color",
        get: function get() {
            return this._color;
        },
        set: function set(color) {
            this._dontUpdateColor = true;

            this._colorFormat = color.format;

            this._colorWheel.tintedColor = color;
            this._brightnessSlider.value = this._colorWheel.brightness;

            this._opacitySlider.value = color.alpha;
            this._updateSliders(this._colorWheel.rawColor, color);

            delete this._dontUpdateColor;
        }
    }]);

    return ColorPicker;
})(WebInspector.Object);

WebInspector.ColorPicker.Event = {
    ColorChanged: "css-color-picker-color-changed"
};
