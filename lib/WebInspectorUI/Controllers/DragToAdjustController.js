var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * Copyright (C) 2014 Antoine Quint
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

WebInspector.DragToAdjustController = (function () {
    function DragToAdjustController(delegate) {
        _classCallCheck(this, DragToAdjustController);

        this._delegate = delegate;

        this._element = null;
        this._active = false;
        this._enabled = false;
        this._dragging = false;
        this._tracksMouseClickAndDrag = false;
    }

    // Public

    _createClass(DragToAdjustController, [{
        key: "reset",
        value: function reset() {
            this._setTracksMouseClickAndDrag(false);
            this._element.classList.remove(WebInspector.DragToAdjustController.StyleClassName);

            if (this._delegate && typeof this._delegate.dragToAdjustControllerDidReset === "function") this._delegate.dragToAdjustControllerDidReset(this);
        }

        // Protected

    }, {
        key: "handleEvent",
        value: function handleEvent(event) {
            switch (event.type) {
                case "mouseenter":
                    if (!this._dragging) {
                        if (this._delegate && typeof this._delegate.dragToAdjustControllerCanBeActivated === "function") this.active = this._delegate.dragToAdjustControllerCanBeActivated(this);else this.active = true;
                    }
                    break;
                case "mouseleave":
                    if (!this._dragging) this.active = false;
                    break;
                case "mousemove":
                    if (this._dragging) this._mouseWasDragged(event);else this._mouseMoved(event);
                    break;
                case "mousedown":
                    this._mouseWasPressed(event);
                    break;
                case "mouseup":
                    this._mouseWasReleased(event);
                    break;
                case "contextmenu":
                    event.preventDefault();
                    break;
            }
        }

        // Private

    }, {
        key: "_setDragging",
        value: function _setDragging(dragging) {
            if (this._dragging === dragging) return;

            console.assert(window.event);
            if (dragging) WebInspector.elementDragStart(this._element, this, this, window.event, "col-resize", window);else WebInspector.elementDragEnd(window.event);

            this._dragging = dragging;
        }
    }, {
        key: "_setTracksMouseClickAndDrag",
        value: function _setTracksMouseClickAndDrag(tracksMouseClickAndDrag) {
            if (this._tracksMouseClickAndDrag === tracksMouseClickAndDrag) return;

            if (tracksMouseClickAndDrag) {
                this._element.classList.add(WebInspector.DragToAdjustController.StyleClassName);
                window.addEventListener("mousedown", this, true);
                window.addEventListener("contextmenu", this, true);
            } else {
                this._element.classList.remove(WebInspector.DragToAdjustController.StyleClassName);
                window.removeEventListener("mousedown", this, true);
                window.removeEventListener("contextmenu", this, true);
                this._setDragging(false);
            }

            this._tracksMouseClickAndDrag = tracksMouseClickAndDrag;
        }
    }, {
        key: "_modifiersDidChange",
        value: function _modifiersDidChange(event) {
            var canBeAdjusted = WebInspector.modifierKeys.altKey;
            if (canBeAdjusted && this._delegate && typeof this._delegate.dragToAdjustControllerCanBeAdjusted === "function") canBeAdjusted = this._delegate.dragToAdjustControllerCanBeAdjusted(this);

            this._setTracksMouseClickAndDrag(canBeAdjusted);
        }
    }, {
        key: "_mouseMoved",
        value: function _mouseMoved(event) {
            var canBeAdjusted = event.altKey;
            if (canBeAdjusted && this._delegate && typeof this._delegate.dragToAdjustControllerCanAdjustObjectAtPoint === "function") canBeAdjusted = this._delegate.dragToAdjustControllerCanAdjustObjectAtPoint(this, WebInspector.Point.fromEvent(event));

            this._setTracksMouseClickAndDrag(canBeAdjusted);
        }
    }, {
        key: "_mouseWasPressed",
        value: function _mouseWasPressed(event) {
            this._lastX = event.screenX;

            this._setDragging(true);

            event.preventDefault();
            event.stopPropagation();
        }
    }, {
        key: "_mouseWasDragged",
        value: function _mouseWasDragged(event) {
            var x = event.screenX;
            var amount = x - this._lastX;

            if (Math.abs(amount) < 1) return;

            this._lastX = x;

            if (event.ctrlKey) amount /= 10;else if (event.shiftKey) amount *= 10;

            if (this._delegate && typeof this._delegate.dragToAdjustControllerWasAdjustedByAmount === "function") this._delegate.dragToAdjustControllerWasAdjustedByAmount(this, amount);

            event.preventDefault();
            event.stopPropagation();
        }
    }, {
        key: "_mouseWasReleased",
        value: function _mouseWasReleased(event) {
            this._setDragging(false);

            event.preventDefault();
            event.stopPropagation();

            this.reset();
        }
    }, {
        key: "element",
        get: function get() {
            return this._element;
        },
        set: function set(element) {
            this._element = element;
        }
    }, {
        key: "enabled",
        get: function get() {
            return this._enabled;
        },
        set: function set(enabled) {
            if (this._enabled === enabled) return;

            if (enabled) {
                this._element.addEventListener("mouseenter", this);
                this._element.addEventListener("mouseleave", this);
            } else {
                this._element.removeEventListener("mouseenter", this);
                this._element.removeEventListener("mouseleave", this);
            }
        }
    }, {
        key: "active",
        get: function get() {
            return this._active;
        },
        set: function set(active) {
            if (!this._element) return;

            if (this._active === active) return;

            if (active) {
                WebInspector.notifications.addEventListener(WebInspector.Notification.GlobalModifierKeysDidChange, this._modifiersDidChange, this);
                this._element.addEventListener("mousemove", this);
            } else {
                WebInspector.notifications.removeEventListener(WebInspector.Notification.GlobalModifierKeysDidChange, this._modifiersDidChange, this);
                this._element.removeEventListener("mousemove", this);
                this._setTracksMouseClickAndDrag(false);
            }

            this._active = active;

            if (this._delegate && typeof this._delegate.dragToAdjustControllerActiveStateChanged === "function") this._delegate.dragToAdjustControllerActiveStateChanged(this);
        }
    }]);

    return DragToAdjustController;
})();

WebInspector.DragToAdjustController.StyleClassName = "drag-to-adjust";
