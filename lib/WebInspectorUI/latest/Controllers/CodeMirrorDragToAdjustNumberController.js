var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2013 Apple Inc. All rights reserved.
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

WebInspector.CodeMirrorDragToAdjustNumberController = (function (_WebInspector$Object) {
    _inherits(CodeMirrorDragToAdjustNumberController, _WebInspector$Object);

    function CodeMirrorDragToAdjustNumberController(codeMirror) {
        _classCallCheck(this, CodeMirrorDragToAdjustNumberController);

        _get(Object.getPrototypeOf(CodeMirrorDragToAdjustNumberController.prototype), "constructor", this).call(this);

        this._codeMirror = codeMirror;

        this._dragToAdjustController = new WebInspector.DragToAdjustController(this);
    }

    // Public

    _createClass(CodeMirrorDragToAdjustNumberController, [{
        key: "dragToAdjustControllerActiveStateChanged",

        // Protected

        value: function dragToAdjustControllerActiveStateChanged(dragToAdjustController) {
            if (!dragToAdjustController.active) this._hoveredTokenInfo = null;
        }
    }, {
        key: "dragToAdjustControllerCanBeActivated",
        value: function dragToAdjustControllerCanBeActivated(dragToAdjustController) {
            return !this._codeMirror.getOption("readOnly");
        }
    }, {
        key: "dragToAdjustControllerCanBeAdjusted",
        value: function dragToAdjustControllerCanBeAdjusted(dragToAdjustController) {

            return this._hoveredTokenInfo && this._hoveredTokenInfo.containsNumber;
        }
    }, {
        key: "dragToAdjustControllerWasAdjustedByAmount",
        value: function dragToAdjustControllerWasAdjustedByAmount(dragToAdjustController, amount) {
            this._codeMirror.alterNumberInRange(amount, this._hoveredTokenInfo.startPosition, this._hoveredTokenInfo.endPosition, false);
        }
    }, {
        key: "dragToAdjustControllerDidReset",
        value: function dragToAdjustControllerDidReset(dragToAdjustController) {
            this._hoveredTokenInfo = null;
        }
    }, {
        key: "dragToAdjustControllerCanAdjustObjectAtPoint",
        value: function dragToAdjustControllerCanAdjustObjectAtPoint(dragToAdjustController, point) {
            var position = this._codeMirror.coordsChar({ left: point.x, top: point.y });
            var token = this._codeMirror.getTokenAt(position);

            if (!token || !token.type || !token.string) {
                if (this._hoveredTokenInfo) dragToAdjustController.reset();
                return false;
            }

            // Stop right here if we're hovering the same token as we were last time.
            if (this._hoveredTokenInfo && this._hoveredTokenInfo.line === position.line && this._hoveredTokenInfo.token.start === token.start && this._hoveredTokenInfo.token.end === token.end) return this._hoveredTokenInfo.token.type.indexOf("number") !== -1;

            var containsNumber = token.type.indexOf("number") !== -1;
            this._hoveredTokenInfo = {
                token: token,
                line: position.line,
                containsNumber: containsNumber,
                startPosition: {
                    ch: token.start,
                    line: position.line
                },
                endPosition: {
                    ch: token.end,
                    line: position.line
                }
            };

            return containsNumber;
        }
    }, {
        key: "enabled",
        get: function get() {
            return this._dragToAdjustController.enabled;
        },
        set: function set(enabled) {
            if (this.enabled === enabled) return;

            this._dragToAdjustController.element = this._codeMirror.getWrapperElement();
            this._dragToAdjustController.enabled = enabled;
        }
    }]);

    return CodeMirrorDragToAdjustNumberController;
})(WebInspector.Object);

CodeMirror.defineOption("dragToAdjustNumbers", true, function (codeMirror, value, oldValue) {
    if (!codeMirror.dragToAdjustNumberController) codeMirror.dragToAdjustNumberController = new WebInspector.CodeMirrorDragToAdjustNumberController(codeMirror);
    codeMirror.dragToAdjustNumberController.enabled = value;
});
