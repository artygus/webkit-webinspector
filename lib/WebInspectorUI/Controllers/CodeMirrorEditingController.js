var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2014 Apple Inc. All rights reserved.
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

WebInspector.CodeMirrorEditingController = (function (_WebInspector$Object) {
    _inherits(CodeMirrorEditingController, _WebInspector$Object);

    function CodeMirrorEditingController(codeMirror, marker) {
        _classCallCheck(this, CodeMirrorEditingController);

        _get(Object.getPrototypeOf(CodeMirrorEditingController.prototype), "constructor", this).call(this);

        this._codeMirror = codeMirror;
        this._marker = marker;
        this._delegate = null;

        this._range = marker.range;

        // The value must support .toString() and .copy() methods.
        this._value = this.initialValue;

        this._keyboardShortcutEsc = new WebInspector.KeyboardShortcut(null, WebInspector.KeyboardShortcut.Key.Escape);
    }

    // Public

    _createClass(CodeMirrorEditingController, [{
        key: "popoverTargetFrameWithRects",
        value: function popoverTargetFrameWithRects(rects) {
            return WebInspector.Rect.unionOfRects(rects);
        }
    }, {
        key: "presentHoverMenu",
        value: function presentHoverMenu() {
            this._hoverMenu = new WebInspector.HoverMenu(this);
            this._hoverMenu.element.classList.add(this.cssClassName);
            this._rects = this._marker.rects;
            this._hoverMenu.present(this._rects);
        }
    }, {
        key: "dismissHoverMenu",
        value: function dismissHoverMenu(discrete) {
            this._hoverMenu.dismiss(discrete);
        }
    }, {
        key: "popoverWillPresent",
        value: function popoverWillPresent(popover) {
            // Implemented by subclasses.
        }
    }, {
        key: "popoverDidPresent",
        value: function popoverDidPresent(popover) {}
        // Implemented by subclasses.

        // Protected

    }, {
        key: "handleKeydownEvent",
        value: function handleKeydownEvent(event) {
            if (!this._keyboardShortcutEsc.matchesEvent(event) || !this._popover.visible) return false;

            this.value = this._originalValue;
            this._popover.dismiss();

            return true;
        }
    }, {
        key: "hoverMenuButtonWasPressed",
        value: function hoverMenuButtonWasPressed(hoverMenu) {
            this._popover = new WebInspector.Popover(this);
            this.popoverWillPresent(this._popover);
            this._popover.present(this.popoverTargetFrameWithRects(this._rects).pad(2), this.popoverPreferredEdges);
            this.popoverDidPresent(this._popover);

            WebInspector.addWindowKeydownListener(this);

            hoverMenu.dismiss();

            if (this._delegate && typeof this._delegate.editingControllerDidStartEditing === "function") this._delegate.editingControllerDidStartEditing(this);

            this._originalValue = this._value.copy();
        }
    }, {
        key: "didDismissPopover",
        value: function didDismissPopover(popover) {
            delete this._popover;
            delete this._originalValue;

            WebInspector.removeWindowKeydownListener(this);

            if (this._delegate && typeof this._delegate.editingControllerDidFinishEditing === "function") this._delegate.editingControllerDidFinishEditing(this);
        }
    }, {
        key: "marker",
        get: function get() {
            return this._marker;
        }
    }, {
        key: "range",
        get: function get() {
            return this._range;
        }
    }, {
        key: "value",
        get: function get() {
            return this._value;
        },
        set: function set(value) {
            this.text = value.toString();
            this._value = value;
        }
    }, {
        key: "delegate",
        get: function get() {
            return this._delegate;
        },
        set: function set(delegate) {
            this._delegate = delegate;
        }
    }, {
        key: "text",
        get: function get() {
            var from = { line: this._range.startLine, ch: this._range.startColumn };
            var to = { line: this._range.endLine, ch: this._range.endColumn };
            return this._codeMirror.getRange(from, to);
        },
        set: function set(text) {
            var from = { line: this._range.startLine, ch: this._range.startColumn };
            var to = { line: this._range.endLine, ch: this._range.endColumn };
            this._codeMirror.replaceRange(text, from, to);

            var lines = text.split("\n");
            var endLine = this._range.startLine + lines.length - 1;
            var endColumn = lines.length > 1 ? lines.lastValue.length : this._range.startColumn + text.length;
            this._range = new WebInspector.TextRange(this._range.startLine, this._range.startColumn, endLine, endColumn);
        }
    }, {
        key: "initialValue",
        get: function get() {
            // Implemented by subclasses.
            return this.text;
        }
    }, {
        key: "cssClassName",
        get: function get() {
            // Implemented by subclasses.
            return "";
        }
    }, {
        key: "popover",
        get: function get() {
            return this._popover;
        }
    }, {
        key: "popoverPreferredEdges",
        get: function get() {
            // Best to display the popover to the left or above the edited range since its end position may change, but not its start
            // position. This way we minimize the chances of overlaying the edited range as it changes.
            return [WebInspector.RectEdge.MIN_X, WebInspector.RectEdge.MIN_Y, WebInspector.RectEdge.MAX_Y, WebInspector.RectEdge.MAX_X];
        }
    }]);

    return CodeMirrorEditingController;
})(WebInspector.Object);
