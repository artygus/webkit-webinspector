var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2014-2015 Apple Inc.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

WebInspector.GradientSlider = (function (_WebInspector$Object) {
    _inherits(GradientSlider, _WebInspector$Object);

    function GradientSlider(delegate) {
        _classCallCheck(this, GradientSlider);

        _get(Object.getPrototypeOf(GradientSlider.prototype), "constructor", this).call(this);

        this.delegate = delegate;

        this._element = null;
        this._stops = [];
        this._knobs = [];

        this._selectedKnob = null;
        this._canvas = document.createElement("canvas");

        this._keyboardShortcutEsc = new WebInspector.KeyboardShortcut(null, WebInspector.KeyboardShortcut.Key.Escape);
    }

    // Public

    _createClass(GradientSlider, [{
        key: "handleEvent",

        // Protected

        value: function handleEvent(event) {
            switch (event.type) {
                case "mouseover":
                    this._handleMouseover(event);
                    break;
                case "mousemove":
                    this._handleMousemove(event);
                    break;
                case "mouseout":
                    this._handleMouseout(event);
                    break;
                case "click":
                    this._handleClick(event);
                    break;
            }
        }
    }, {
        key: "handleKeydownEvent",
        value: function handleKeydownEvent(event) {
            if (!this._keyboardShortcutEsc.matchesEvent(event) || !this._selectedKnob || !this._selectedKnob.selected) return false;

            this._selectedKnob.selected = false;

            return true;
        }
    }, {
        key: "knobXDidChange",
        value: function knobXDidChange(knob) {
            knob.stop.offset = knob.x / WebInspector.GradientSlider.Width;
            this._sortStops();
            this._updateCanvas();
        }
    }, {
        key: "knobCanDetach",
        value: function knobCanDetach(knob) {
            return this._knobs.length > 2;
        }
    }, {
        key: "knobWillDetach",
        value: function knobWillDetach(knob) {
            knob.element.classList.add(WebInspector.GradientSlider.DetachingClassName);

            this._stops.remove(knob.stop);
            this._knobs.remove(knob);
            this._sortStops();
            this._updateCanvas();
        }
    }, {
        key: "knobSelectionChanged",
        value: function knobSelectionChanged(knob) {
            if (this._selectedKnob && this._selectedKnob !== knob && knob.selected) this._selectedKnob.selected = false;

            this._selectedKnob = knob.selected ? knob : null;

            if (this.delegate && typeof this.delegate.gradientSliderStopWasSelected === "function") this.delegate.gradientSliderStopWasSelected(this, knob.stop);

            if (this._selectedKnob) WebInspector.addWindowKeydownListener(this);else WebInspector.removeWindowKeydownListener(this);
        }

        // Private

    }, {
        key: "_handleMouseover",
        value: function _handleMouseover(event) {
            this._updateShadowKnob(event);
        }
    }, {
        key: "_handleMousemove",
        value: function _handleMousemove(event) {
            this._updateShadowKnob(event);
        }
    }, {
        key: "_handleMouseout",
        value: function _handleMouseout(event) {
            if (!this._shadowKnob) return;

            this._shadowKnob.element.remove();
            delete this._shadowKnob;
        }
    }, {
        key: "_handleClick",
        value: function _handleClick(event) {
            this._updateShadowKnob(event);

            this._knobs.push(this._shadowKnob);

            this._shadowKnob.element.classList.remove(WebInspector.GradientSlider.ShadowClassName);

            var stop = { offset: this._shadowKnob.x / WebInspector.GradientSlider.Width, color: this._shadowKnob.wellColor };
            this._stops.push(stop);
            this._sortStops();
            this._updateStops();

            this._knobs[this._stops.indexOf(stop)].selected = true;

            delete this._shadowKnob;
        }
    }, {
        key: "_updateShadowKnob",
        value: function _updateShadowKnob(event) {
            if (!this._shadowKnob) {
                this._shadowKnob = new WebInspector.GradientSliderKnob(this);
                this._shadowKnob.element.classList.add(WebInspector.GradientSlider.ShadowClassName);
                this.element.appendChild(this._shadowKnob.element);
            }

            this._shadowKnob.x = window.webkitConvertPointFromPageToNode(this.element, new WebKitPoint(event.pageX, event.pageY)).x;

            var colorData = this._canvas.getContext("2d").getImageData(this._shadowKnob.x - 1, 0, 1, 1).data;
            this._shadowKnob.wellColor = new WebInspector.Color(WebInspector.Color.Format.RGB, [colorData[0], colorData[1], colorData[2], colorData[3] / 255]);
        }
    }, {
        key: "_sortStops",
        value: function _sortStops() {
            this._stops.sort(function (a, b) {
                return a.offset - b.offset;
            });
        }
    }, {
        key: "_updateStops",
        value: function _updateStops() {
            this._updateCanvas();
            this._updateKnobs();
        }
    }, {
        key: "_updateCanvas",
        value: function _updateCanvas() {
            var w = WebInspector.GradientSlider.Width;
            var h = WebInspector.GradientSlider.Height;

            this._canvas.width = w;
            this._canvas.height = h;

            var ctx = this._canvas.getContext("2d");
            var gradient = ctx.createLinearGradient(0, 0, w, 0);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._stops[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var stop = _step.value;

                    gradient.addColorStop(stop.offset, stop.color);
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

            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);

            if (this.delegate && typeof this.delegate.gradientSliderStopsDidChange === "function") this.delegate.gradientSliderStopsDidChange(this);
        }
    }, {
        key: "_updateKnobs",
        value: function _updateKnobs() {
            var selectedStop = this._selectedKnob ? this._selectedKnob.stop : null;

            while (this._knobs.length > this._stops.length) this._knobs.pop().element.remove();

            while (this._knobs.length < this._stops.length) {
                var knob = new WebInspector.GradientSliderKnob(this);
                this.element.appendChild(knob.element);
                this._knobs.push(knob);
            }

            for (var i = 0; i < this._stops.length; ++i) {
                var stop = this._stops[i];
                var knob = this._knobs[i];

                knob.stop = stop;
                knob.x = Math.round(stop.offset * WebInspector.GradientSlider.Width);
                knob.selected = stop === selectedStop;
            }
        }
    }, {
        key: "element",
        get: function get() {
            if (!this._element) {
                this._element = document.createElement("div");
                this._element.className = "gradient-slider";
                this._element.appendChild(this._canvas);

                this._addArea = this._element.appendChild(document.createElement("div"));
                this._addArea.addEventListener("mouseover", this);
                this._addArea.addEventListener("mousemove", this);
                this._addArea.addEventListener("mouseout", this);
                this._addArea.addEventListener("click", this);
                this._addArea.className = WebInspector.GradientSlider.AddAreaClassName;
            }
            return this._element;
        }
    }, {
        key: "stops",
        get: function get() {
            return this._stops;
        },
        set: function set(stops) {
            this._stops = stops;

            this._updateStops();
        }
    }, {
        key: "selectedStop",
        get: function get() {
            return this._selectedKnob ? this._selectedKnob.stop : null;
        }
    }]);

    return GradientSlider;
})(WebInspector.Object);

WebInspector.GradientSlider.Width = 238;
WebInspector.GradientSlider.Height = 19;

WebInspector.GradientSlider.AddAreaClassName = "add-area";
WebInspector.GradientSlider.DetachingClassName = "detaching";
WebInspector.GradientSlider.ShadowClassName = "shadow";

WebInspector.GradientSliderKnob = (function (_WebInspector$Object2) {
    _inherits(GradientSliderKnob, _WebInspector$Object2);

    function GradientSliderKnob(delegate) {
        _classCallCheck(this, GradientSliderKnob);

        _get(Object.getPrototypeOf(GradientSliderKnob.prototype), "constructor", this).call(this);

        this._x = 0;
        this._y = 0;
        this._stop = null;

        this.delegate = delegate;

        this._element = document.createElement("div");
        this._element.className = "gradient-slider-knob";

        // Checkers pattern.
        this._element.appendChild(document.createElement("img"));

        this._well = this._element.appendChild(document.createElement("div"));

        this._element.addEventListener("mousedown", this);
    }

    // Public

    _createClass(GradientSliderKnob, [{
        key: "handleEvent",

        // Protected

        value: function handleEvent(event) {
            event.preventDefault();
            event.stopPropagation();

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
                case "transitionend":
                    this._handleTransitionEnd(event);
                    break;
            }
        }

        // Private

    }, {
        key: "_handleMousedown",
        value: function _handleMousedown(event) {
            this._moved = false;
            this._detaching = false;

            window.addEventListener("mousemove", this, true);
            window.addEventListener("mouseup", this, true);

            this._startX = this.x;
            this._startMouseX = event.pageX;
            this._startMouseY = event.pageY;
        }
    }, {
        key: "_handleMousemove",
        value: function _handleMousemove(event) {
            var w = WebInspector.GradientSlider.Width;

            this._moved = true;

            if (!this._detaching && Math.abs(event.pageY - this._startMouseY) > 50) {
                this._detaching = this.delegate && typeof this.delegate.knobCanDetach === "function" && this.delegate.knobCanDetach(this);
                if (this._detaching && this.delegate && typeof this.delegate.knobWillDetach === "function") {
                    var translationFromParentToBody = window.webkitConvertPointFromNodeToPage(this.element.parentNode, new WebKitPoint(0, 0));
                    this._startMouseX -= translationFromParentToBody.x;
                    this._startMouseY -= translationFromParentToBody.y;
                    document.body.appendChild(this.element);
                    this.delegate.knobWillDetach(this);
                }
            }

            var x = this._startX + event.pageX - this._startMouseX;
            if (!this._detaching) x = Math.min(Math.max(0, x), w);
            this.x = x;

            if (this._detaching) this.y = event.pageY - this._startMouseY;else if (this.delegate && typeof this.delegate.knobXDidChange === "function") this.delegate.knobXDidChange(this);
        }
    }, {
        key: "_handleMouseup",
        value: function _handleMouseup(event) {
            window.removeEventListener("mousemove", this, true);
            window.removeEventListener("mouseup", this, true);

            if (this._detaching) {
                this.element.addEventListener("transitionend", this);
                this.element.classList.add(WebInspector.GradientSliderKnob.FadeOutClassName);
                this.selected = false;
            } else if (!this._moved) this.selected = !this.selected;
        }
    }, {
        key: "_handleTransitionEnd",
        value: function _handleTransitionEnd(event) {
            this.element.removeEventListener("transitionend", this);
            this.element.classList.remove(WebInspector.GradientSliderKnob.FadeOutClassName);
            this.element.remove();
        }
    }, {
        key: "_updateTransform",
        value: function _updateTransform() {
            this.element.style.webkitTransform = "translate3d(" + this._x + "px, " + this._y + "px, 0)";
        }
    }, {
        key: "element",
        get: function get() {
            return this._element;
        }
    }, {
        key: "stop",
        get: function get() {
            return this._stop;
        },
        set: function set(stop) {
            this.wellColor = stop.color;
            this._stop = stop;
        }
    }, {
        key: "x",
        get: function get() {
            return this._x;
        },
        set: function set(x) {
            this._x = x;
            this._updateTransform();
        }
    }, {
        key: "y",
        get: function get() {
            return this._x;
        },
        set: function set(y) {
            this._y = y;
            this._updateTransform();
        }
    }, {
        key: "wellColor",
        get: function get() {
            return this._wellColor;
        },
        set: function set(color) {
            this._wellColor = color;
            this._well.style.backgroundColor = color;
        }
    }, {
        key: "selected",
        get: function get() {
            return this._element.classList.contains(WebInspector.GradientSliderKnob.SelectedClassName);
        },
        set: function set(selected) {
            if (this.selected === selected) return;

            this._element.classList.toggle(WebInspector.GradientSliderKnob.SelectedClassName, selected);

            if (this.delegate && typeof this.delegate.knobSelectionChanged === "function") this.delegate.knobSelectionChanged(this);
        }
    }]);

    return GradientSliderKnob;
})(WebInspector.Object);

WebInspector.GradientSliderKnob.SelectedClassName = "selected";
WebInspector.GradientSliderKnob.FadeOutClassName = "fade-out";
