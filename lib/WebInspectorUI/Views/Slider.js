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

WebInspector.Slider = (function (_WebInspector$Object) {
    _inherits(Slider, _WebInspector$Object);

    function Slider() {
        _classCallCheck(this, Slider);

        _get(Object.getPrototypeOf(Slider.prototype), "constructor", this).call(this);

        this._element = document.createElement("div");
        this._element.className = "slider";

        this._knob = this._element.appendChild(document.createElement("img"));

        this._value = 0;
        this._knobX = 0;
        this._maxX = 0;

        this._element.addEventListener("mousedown", this);
    }

    // Public

    _createClass(Slider, [{
        key: "handleEvent",

        // Protected

        value: function handleEvent(event) {
            switch (event.type) {
                case "mousedown":
                    this._handleMousedown(event);
                    break;
                case "mousemove":
                    this._handleMousemove(event);
                    break;
                case "mouseup":
                    this._handleMouseup(event);
                    break;
            }
        }

        // Private

    }, {
        key: "_handleMousedown",
        value: function _handleMousedown(event) {
            if (event.target !== this._knob) this.value = (this._localPointForEvent(event).x - 3) / this.maxX;

            this._startKnobX = this._knobX;
            this._startMouseX = this._localPointForEvent(event).x;

            this._element.classList.add("dragging");

            window.addEventListener("mousemove", this, true);
            window.addEventListener("mouseup", this, true);
        }
    }, {
        key: "_handleMousemove",
        value: function _handleMousemove(event) {
            var dx = this._localPointForEvent(event).x - this._startMouseX;
            var x = Math.max(Math.min(this._startKnobX + dx, this.maxX), 0);

            this.value = x / this.maxX;
        }
    }, {
        key: "_handleMouseup",
        value: function _handleMouseup(event) {
            this._element.classList.remove("dragging");

            window.removeEventListener("mousemove", this, true);
            window.removeEventListener("mouseup", this, true);
        }
    }, {
        key: "_localPointForEvent",
        value: function _localPointForEvent(event) {
            // We convert all event coordinates from page coordinates to local coordinates such that the slider
            // may be transformed using CSS Transforms and interaction works as expected.
            return window.webkitConvertPointFromPageToNode(this._element, new WebKitPoint(event.pageX, event.pageY));
        }
    }, {
        key: "element",
        get: function get() {
            return this._element;
        }
    }, {
        key: "value",
        get: function get() {
            return this._value;
        },
        set: function set(value) {
            value = Math.max(Math.min(value, 1), 0);

            if (value === this._value) return;

            this.knobX = value;

            if (this.delegate && typeof this.delegate.sliderValueDidChange === "function") this.delegate.sliderValueDidChange(this, value);
        }
    }, {
        key: "knobX",
        set: function set(value) {
            this._value = value;
            this._knobX = Math.round(value * this.maxX);
            this._knob.style.webkitTransform = "translate3d(" + this._knobX + "px, 0, 0)";
        }
    }, {
        key: "maxX",
        get: function get() {
            if (this._maxX <= 0 && document.body.contains(this._element)) this._maxX = Math.max(this._element.offsetWidth - Math.ceil(WebInspector.Slider.KnobWidth / 2), 0);

            return this._maxX;
        }
    }]);

    return Slider;
})(WebInspector.Object);

WebInspector.Slider.KnobWidth = 13;
