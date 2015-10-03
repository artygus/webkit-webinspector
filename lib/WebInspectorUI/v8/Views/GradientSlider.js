/*
 * Copyright (C) 2014 Apple Inc.  All rights reserved.
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

WebInspector.GradientSlider = function (delegate) {
    this.delegate = delegate;

    this._element = null;
    this._stops = [];
    this._knobs = [];

    this._selectedKnob = null;
    this._canvas = document.createElement("canvas");

    this._keyboardShortcutEsc = new WebInspector.KeyboardShortcut(null, WebInspector.KeyboardShortcut.Key.Escape);
};

WebInspector.GradientSlider.Width = 238;
WebInspector.GradientSlider.Height = 19;

WebInspector.GradientSlider.StyleClassName = "gradient-slider";
WebInspector.GradientSlider.AddAreaClassName = "add-area";
WebInspector.GradientSlider.DetachingClassName = "detaching";
WebInspector.GradientSlider.ShadowClassName = "shadow";

WebInspector.GradientSlider.prototype = Object.defineProperties({
    constructor: WebInspector.GradientSlider,

    // Protected

    handleEvent: function handleEvent(event) {
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
    },

    handleKeydownEvent: function handleKeydownEvent(event) {
        if (!this._keyboardShortcutEsc.matchesEvent(event) || !this._selectedKnob || !this._selectedKnob.selected) return false;

        this._selectedKnob.selected = false;

        return true;
    },

    knobXDidChange: function knobXDidChange(knob) {
        knob.stop.offset = knob.x / WebInspector.GradientSlider.Width;
        this._sortStops();
        this._updateCanvas();
    },

    knobCanDetach: function knobCanDetach(knob) {
        return this._knobs.length > 2;
    },

    knobWillDetach: function knobWillDetach(knob) {
        knob.element.classList.add(WebInspector.GradientSlider.DetachingClassName);

        this._stops.remove(knob.stop);
        this._knobs.remove(knob);
        this._sortStops();
        this._updateCanvas();
    },

    knobSelectionChanged: function knobSelectionChanged(knob) {
        if (this._selectedKnob && this._selectedKnob !== knob && knob.selected) this._selectedKnob.selected = false;

        this._selectedKnob = knob.selected ? knob : null;

        if (this.delegate && typeof this.delegate.gradientSliderStopWasSelected === "function") this.delegate.gradientSliderStopWasSelected(this, knob.stop);

        if (this._selectedKnob) WebInspector.addWindowKeydownListener(this);else WebInspector.removeWindowKeydownListener(this);
    },

    // Private

    _handleMouseover: function _handleMouseover(event) {
        this._updateShadowKnob(event);
    },

    _handleMousemove: function _handleMousemove(event) {
        this._updateShadowKnob(event);
    },

    _handleMouseout: function _handleMouseout(event) {
        if (!this._shadowKnob) return;

        this._shadowKnob.element.remove();
        delete this._shadowKnob;
    },

    _handleClick: function _handleClick(event) {
        this._updateShadowKnob(event);

        this._knobs.push(this._shadowKnob);

        this._shadowKnob.element.classList.remove(WebInspector.GradientSlider.ShadowClassName);

        var stop = { offset: this._shadowKnob.x / WebInspector.GradientSlider.Width, color: this._shadowKnob.wellColor };
        this._stops.push(stop);
        this._sortStops();
        this._updateStops();

        this._knobs[this._stops.indexOf(stop)].selected = true;

        delete this._shadowKnob;
    },

    _updateShadowKnob: function _updateShadowKnob(event) {
        if (!this._shadowKnob) {
            this._shadowKnob = new WebInspector.GradientSliderKnob(this);
            this._shadowKnob.element.classList.add(WebInspector.GradientSlider.ShadowClassName);
            this.element.appendChild(this._shadowKnob.element);
        }

        this._shadowKnob.x = window.webkitConvertPointFromPageToNode(this.element, new WebKitPoint(event.pageX, event.pageY)).x;

        var colorData = this._canvas.getContext("2d").getImageData(this._shadowKnob.x - 1, 0, 1, 1).data;
        this._shadowKnob.wellColor = new WebInspector.Color(WebInspector.Color.Format.RGB, [colorData[0], colorData[1], colorData[2], colorData[3] / 255]);
    },

    _sortStops: function _sortStops() {
        this._stops.sort(function (a, b) {
            return a.offset - b.offset;
        });
    },

    _updateStops: function _updateStops() {
        this._updateCanvas();
        this._updateKnobs();
    },

    _updateCanvas: function _updateCanvas() {
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
    },

    _updateKnobs: function _updateKnobs() {
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
    element: { // Public

        get: function get() {
            if (!this._element) {
                this._element = document.createElement("div");
                this._element.className = WebInspector.GradientSlider.StyleClassName;
                this._element.appendChild(this._canvas);

                this._addArea = this._element.appendChild(document.createElement("div"));
                this._addArea.addEventListener("mouseover", this);
                this._addArea.addEventListener("mousemove", this);
                this._addArea.addEventListener("mouseout", this);
                this._addArea.addEventListener("click", this);
                this._addArea.className = WebInspector.GradientSlider.AddAreaClassName;
            }
            return this._element;
        },
        configurable: true,
        enumerable: true
    },
    stops: {
        get: function get() {
            return this._stops;
        },
        set: function set(stops) {
            this._stops = stops;

            this._updateStops();
        },
        configurable: true,
        enumerable: true
    },
    selectedStop: {
        get: function get() {
            return this._selectedKnob ? this._selectedKnob.stop : null;
        },
        configurable: true,
        enumerable: true
    }
});

WebInspector.GradientSliderKnob = function (delegate) {
    this._x = 0;
    this._y = 0;
    this._stop = null;

    this.delegate = delegate;

    this._element = document.createElement("div");
    this._element.className = WebInspector.GradientSliderKnob.StyleClassName;

    // Checkers pattern.
    this._element.appendChild(document.createElement("img"));

    this._well = this._element.appendChild(document.createElement("div"));

    this._element.addEventListener("mousedown", this);
};

WebInspector.GradientSliderKnob.StyleClassName = "gradient-slider-knob";
WebInspector.GradientSliderKnob.SelectedClassName = "selected";
WebInspector.GradientSliderKnob.FadeOutClassName = "fade-out";

WebInspector.GradientSliderKnob.prototype = Object.defineProperties({
    constructor: WebInspector.GradientSliderKnob,

    // Protected

    handleEvent: function handleEvent(event) {
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
    },

    // Private

    _handleMousedown: function _handleMousedown(event) {
        this._moved = false;
        this._detaching = false;

        window.addEventListener("mousemove", this, true);
        window.addEventListener("mouseup", this, true);

        this._startX = this.x;
        this._startMouseX = event.pageX;
        this._startMouseY = event.pageY;
    },

    _handleMousemove: function _handleMousemove(event) {
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
    },

    _handleMouseup: function _handleMouseup(event) {
        window.removeEventListener("mousemove", this, true);
        window.removeEventListener("mouseup", this, true);

        if (this._detaching) {
            this.element.addEventListener("transitionend", this);
            this.element.classList.add(WebInspector.GradientSliderKnob.FadeOutClassName);
            this.selected = false;
        } else if (!this._moved) this.selected = !this.selected;
    },

    _handleTransitionEnd: function _handleTransitionEnd(event) {
        this.element.removeEventListener("transitionend", this);
        this.element.classList.remove(WebInspector.GradientSliderKnob.FadeOutClassName);
        this.element.remove();
    },

    _updateTransform: function _updateTransform() {
        this.element.style.webkitTransform = "translate3d(" + this._x + "px, " + this._y + "px, 0)";
    }
}, {
    element: { // Public

        get: function get() {
            return this._element;
        },
        configurable: true,
        enumerable: true
    },
    stop: {
        get: function get() {
            return this._stop;
        },
        set: function set(stop) {
            this.wellColor = stop.color;
            this._stop = stop;
        },
        configurable: true,
        enumerable: true
    },
    x: {
        get: function get() {
            return this._x;
        },
        set: function set(x) {
            this._x = x;
            this._updateTransform();
        },
        configurable: true,
        enumerable: true
    },
    y: {
        get: function get() {
            return this._x;
        },
        set: function set(y) {
            this._y = y;
            this._updateTransform();
        },
        configurable: true,
        enumerable: true
    },
    wellColor: {
        get: function get() {
            return this._wellColor;
        },
        set: function set(color) {
            this._wellColor = color;
            this._well.style.backgroundColor = color;
        },
        configurable: true,
        enumerable: true
    },
    selected: {
        get: function get() {
            return this._element.classList.contains(WebInspector.GradientSliderKnob.SelectedClassName);
        },
        set: function set(selected) {
            if (this.selected === selected) return;

            this._element.classList.toggle(WebInspector.GradientSliderKnob.SelectedClassName, selected);

            if (this.delegate && typeof this.delegate.knobSelectionChanged === "function") this.delegate.knobSelectionChanged(this);
        },
        configurable: true,
        enumerable: true
    }
});
