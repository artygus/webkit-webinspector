var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2015 Apple Inc. All rights reserved.
 * Copyright (C) 2015 University of Washington.
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

WebInspector.Resizer = (function (_WebInspector$Object) {
    _inherits(Resizer, _WebInspector$Object);

    function Resizer(ruleOrientation, delegate) {
        _classCallCheck(this, Resizer);

        console.assert(delegate);

        _get(Object.getPrototypeOf(Resizer.prototype), "constructor", this).call(this);

        this._delegate = delegate;
        this._orientation = ruleOrientation;
        this._element = document.createElement("div");
        this._element.classList.add("resizer");

        if (this._orientation === WebInspector.Resizer.RuleOrientation.Horizontal) this._element.classList.add("horizontal-rule");else if (this._orientation === WebInspector.Resizer.RuleOrientation.Vertical) this._element.classList.add("vertical-rule");

        this._element.addEventListener("mousedown", this._resizerMouseDown.bind(this), false);
        this._resizerMouseMovedEventListener = this._resizerMouseMoved.bind(this);
        this._resizerMouseUpEventListener = this._resizerMouseUp.bind(this);
    }

    // Public

    _createClass(Resizer, [{
        key: "_currentPosition",

        // Private

        value: function _currentPosition() {
            if (this._orientation === WebInspector.Resizer.RuleOrientation.Vertical) return event.pageX;
            if (this._orientation === WebInspector.Resizer.RuleOrientation.Horizontal) return event.pageY;

            console.assert(false, "Should not be reached!");
        }
    }, {
        key: "_resizerMouseDown",
        value: function _resizerMouseDown(event) {
            if (event.button !== 0 || event.ctrlKey) return;

            this._resizerMouseDownPosition = this._currentPosition();

            var delegateRequestedAbort = false;
            if (typeof this._delegate.resizerDragStarted === "function") delegateRequestedAbort = this._delegate.resizerDragStarted(this, event.target);

            if (delegateRequestedAbort) {
                delete this._resizerMouseDownPosition;
                return;
            }

            if (this._orientation === WebInspector.Resizer.RuleOrientation.Vertical) document.body.style.cursor = "col-resize";else {
                console.assert(this._orientation === WebInspector.Resizer.RuleOrientation.Horizontal);
                document.body.style.cursor = "row-resize";
            }

            // Register these listeners on the document so we can track the mouse if it leaves the resizer.
            document.addEventListener("mousemove", this._resizerMouseMovedEventListener, false);
            document.addEventListener("mouseup", this._resizerMouseUpEventListener, false);

            event.preventDefault();
            event.stopPropagation();

            // Install a global "glass pane" which prevents cursor from changing during the drag interaction.
            // The cursor could change when hovering over links, text, or other elements with cursor cues.
            // FIXME: when Pointer Events support is available this could be implemented by drawing the cursor ourselves.
            if (WebInspector._elementDraggingGlassPane) WebInspector._elementDraggingGlassPane.remove();

            var glassPaneElement = document.createElement("div");
            glassPaneElement.className = "glass-pane-for-drag";
            document.body.appendChild(glassPaneElement);
            WebInspector._elementDraggingGlassPane = glassPaneElement;
        }
    }, {
        key: "_resizerMouseMoved",
        value: function _resizerMouseMoved(event) {
            event.preventDefault();
            event.stopPropagation();

            if (typeof this._delegate.resizerDragging === "function") this._delegate.resizerDragging(this, this._resizerMouseDownPosition - this._currentPosition());
        }
    }, {
        key: "_resizerMouseUp",
        value: function _resizerMouseUp(event) {
            if (event.button !== 0 || event.ctrlKey) return;

            document.body.style.removeProperty("cursor");

            if (WebInspector._elementDraggingGlassPane) {
                WebInspector._elementDraggingGlassPane.remove();
                delete WebInspector._elementDraggingGlassPane;
            }

            document.removeEventListener("mousemove", this._resizerMouseMovedEventListener, false);
            document.removeEventListener("mouseup", this._resizerMouseUpEventListener, false);

            event.preventDefault();
            event.stopPropagation();

            if (typeof this._delegate.resizerDragEnded === "function") this._delegate.resizerDragEnded(this);

            delete this._resizerMouseDownPosition;
        }
    }, {
        key: "element",
        get: function get() {
            return this._element;
        }
    }, {
        key: "orientation",
        get: function get() {
            return this._orientation;
        }
    }, {
        key: "initialPosition",
        get: function get() {
            return this._resizerMouseDownPosition || NaN;
        }
    }]);

    return Resizer;
})(WebInspector.Object);

WebInspector.Resizer.RuleOrientation = {
    Horizontal: Symbol("resizer-rule-orientation-horizontal"),
    Vertical: Symbol("resizer-rule-orientation-vertical")
};
