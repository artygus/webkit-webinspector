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

WebInspector.BezierEditor = (function (_WebInspector$Object) {
    _inherits(BezierEditor, _WebInspector$Object);

    function BezierEditor() {
        _classCallCheck(this, BezierEditor);

        _get(Object.getPrototypeOf(BezierEditor.prototype), "constructor", this).call(this);

        this._element = document.createElement("div");
        this._element.classList.add("bezier-editor");

        var editorWidth = 184;
        var editorHeight = 200;
        this._padding = 25;
        this._controlHandleRadius = 7;
        this._bezierWidth = editorWidth - this._controlHandleRadius * 2;
        this._bezierHeight = editorHeight - this._controlHandleRadius * 2 - this._padding * 2;
        this._bezierPreviewAnimationStyleText = "bezierPreview 2s 250ms forwards ";

        var bezierPreviewContainer = document.createElement("div");
        bezierPreviewContainer.id = "bezierPreview";
        bezierPreviewContainer.classList.add("bezier-preview");
        bezierPreviewContainer.title = WebInspector.UIString("Click to restart the animation");
        bezierPreviewContainer.addEventListener("mousedown", this._resetPreviewAnimation.bind(this));

        this._bezierPreview = document.createElement("div");
        bezierPreviewContainer.appendChild(this._bezierPreview);

        this._element.appendChild(bezierPreviewContainer);

        this._bezierContainer = createSVGElement("svg");
        this._bezierContainer.id = "bezierContainer";
        this._bezierContainer.setAttribute("width", editorWidth);
        this._bezierContainer.setAttribute("height", editorHeight);
        this._bezierContainer.classList.add("bezier-container");

        var svgGroup = createSVGElement("g");
        svgGroup.setAttribute("transform", "translate(0, " + this._padding + ")");

        var linearCurve = createSVGElement("line");
        linearCurve.classList.add("linear-curve");
        linearCurve.setAttribute("x1", this._controlHandleRadius);
        linearCurve.setAttribute("y1", this._bezierHeight + this._controlHandleRadius);
        linearCurve.setAttribute("x2", this._bezierWidth + this._controlHandleRadius);
        linearCurve.setAttribute("y2", this._controlHandleRadius);
        svgGroup.appendChild(linearCurve);

        this._bezierCurve = createSVGElement("path");
        this._bezierCurve.classList.add("bezier-curve");
        svgGroup.appendChild(this._bezierCurve);

        function createControl(x1, y1) {
            x1 += this._controlHandleRadius;
            y1 += this._controlHandleRadius;

            var line = createSVGElement("line");
            line.classList.add("control-line");
            line.setAttribute("x1", x1);
            line.setAttribute("y1", y1);
            line.setAttribute("x2", x1);
            line.setAttribute("y2", y1);
            svgGroup.appendChild(line);

            var handle = createSVGElement("circle");
            handle.classList.add("control-handle");
            svgGroup.appendChild(handle);

            return { point: null, line: line, handle: handle };
        }

        this._inControl = createControl.call(this, 0, this._bezierHeight);
        this._outControl = createControl.call(this, this._bezierWidth, 0);

        this._bezierContainer.appendChild(svgGroup);
        this._element.appendChild(this._bezierContainer);

        this._bezierPreviewTiming = document.createElement("div");
        this._bezierPreviewTiming.classList.add("bezier-preview-timing");
        this._element.appendChild(this._bezierPreviewTiming);

        this._selectedControl = null;
        this._bezierContainer.addEventListener("mousedown", this);
    }

    // Public

    _createClass(BezierEditor, [{
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
            if (event.button !== 0) return;

            window.addEventListener("mousemove", this, true);
            window.addEventListener("mouseup", this, true);

            this._bezierPreview.style.animation = null;
            this._bezierPreviewTiming.classList.remove("animate");

            this._updateControlPointsForMouseEvent(event, true);
        }
    }, {
        key: "_handleMousemove",
        value: function _handleMousemove(event) {
            this._updateControlPointsForMouseEvent(event);
        }
    }, {
        key: "_handleMouseup",
        value: function _handleMouseup(event) {
            this._selectedControl.handle.classList.remove("selected");
            this._selectedControl = null;
            this._triggerPreviewAnimation();

            window.removeEventListener("mousemove", this, true);
            window.removeEventListener("mouseup", this, true);
        }
    }, {
        key: "_updateControlPointsForMouseEvent",
        value: function _updateControlPointsForMouseEvent(event, calculateSelectedControlPoint) {
            var point = WebInspector.Point.fromEventInElement(event, this._bezierContainer);
            point.x = Number.constrain(point.x - this._controlHandleRadius, 0, this._bezierWidth);
            point.y -= this._controlHandleRadius + this._padding;

            if (calculateSelectedControlPoint) {
                if (this._inControl.point.distance(point) < this._outControl.point.distance(point)) this._selectedControl = this._inControl;else this._selectedControl = this._outControl;
            }

            this._selectedControl.point = point;
            this._selectedControl.handle.classList.add("selected");
            this._updateValue();
        }
    }, {
        key: "_updateValue",
        value: function _updateValue() {
            function round(num) {
                return Math.round(num * 100) / 100;
            }

            var inValueX = round(this._inControl.point.x / this._bezierWidth);
            var inValueY = round(1 - this._inControl.point.y / this._bezierHeight);

            var outValueX = round(this._outControl.point.x / this._bezierWidth);
            var outValueY = round(1 - this._outControl.point.y / this._bezierHeight);

            this._bezier = new WebInspector.CubicBezier(inValueX, inValueY, outValueX, outValueY);
            this._updateBezier();

            this.dispatchEventToListeners(WebInspector.BezierEditor.Event.BezierChanged, { bezier: this._bezier });
        }
    }, {
        key: "_updateBezier",
        value: function _updateBezier() {
            var r = this._controlHandleRadius;
            var inControlX = this._inControl.point.x + r;
            var inControlY = this._inControl.point.y + r;
            var outControlX = this._outControl.point.x + r;
            var outControlY = this._outControl.point.y + r;
            var path = "M " + r + " " + (this._bezierHeight + r) + " C " + inControlX + " " + inControlY + " " + outControlX + " " + outControlY + " " + (this._bezierWidth + r) + " " + r;
            this._bezierCurve.setAttribute("d", path);
            this._updateControl(this._inControl);
            this._updateControl(this._outControl);
        }
    }, {
        key: "_updateControl",
        value: function _updateControl(control) {
            control.handle.setAttribute("cx", control.point.x + this._controlHandleRadius);
            control.handle.setAttribute("cy", control.point.y + this._controlHandleRadius);

            control.line.setAttribute("x2", control.point.x + this._controlHandleRadius);
            control.line.setAttribute("y2", control.point.y + this._controlHandleRadius);
        }
    }, {
        key: "_triggerPreviewAnimation",
        value: function _triggerPreviewAnimation() {
            this._bezierPreview.style.animation = this._bezierPreviewAnimationStyleText + this._bezier.toString();
            this._bezierPreviewTiming.classList.add("animate");
        }
    }, {
        key: "_resetPreviewAnimation",
        value: function _resetPreviewAnimation() {
            var parent = this._bezierPreview.parentNode;
            parent.removeChild(this._bezierPreview);
            parent.appendChild(this._bezierPreview);

            this._element.removeChild(this._bezierPreviewTiming);
            this._element.appendChild(this._bezierPreviewTiming);
        }
    }, {
        key: "element",
        get: function get() {
            return this._element;
        }
    }, {
        key: "bezier",
        set: function set(bezier) {
            if (!bezier) return;

            var isCubicBezier = bezier instanceof WebInspector.CubicBezier;
            console.assert(isCubicBezier);
            if (!isCubicBezier) return;

            this._bezier = bezier;
            this._inControl.point = new WebInspector.Point(this._bezier.inPoint.x * this._bezierWidth, (1 - this._bezier.inPoint.y) * this._bezierHeight);
            this._outControl.point = new WebInspector.Point(this._bezier.outPoint.x * this._bezierWidth, (1 - this._bezier.outPoint.y) * this._bezierHeight);

            this._updateBezier();
            this._triggerPreviewAnimation();
        },
        get: function get() {
            return this._bezier;
        }
    }]);

    return BezierEditor;
})(WebInspector.Object);

WebInspector.BezierEditor.Event = {
    BezierChanged: "bezier-editor-bezier-changed"
};
