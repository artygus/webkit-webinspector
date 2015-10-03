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

WebInspector.ActivateButtonNavigationItem = (function (_WebInspector$ButtonNavigationItem) {
    _inherits(ActivateButtonNavigationItem, _WebInspector$ButtonNavigationItem);

    function ActivateButtonNavigationItem(identifier, defaultToolTip, activatedToolTip, image, imageWidth, imageHeight, suppressEmboss, role) {
        _classCallCheck(this, ActivateButtonNavigationItem);

        _get(Object.getPrototypeOf(ActivateButtonNavigationItem.prototype), "constructor", this).call(this, identifier, defaultToolTip, image, imageWidth, imageHeight, suppressEmboss, role);

        this._defaultToolTip = defaultToolTip;
        this._activatedToolTip = activatedToolTip || defaultToolTip;
        this._role = role;
    }

    // Public

    _createClass(ActivateButtonNavigationItem, [{
        key: "generateStyleText",
        value: function generateStyleText(parentSelector) {
            var classNames = this._classNames.join(".");

            if (this._suppressEmboss) var styleText = parentSelector + " ." + classNames + " > .glyph { width: " + this._imageWidth + "px; height: " + this._imageHeight + "px; }\n";else {
                var activatedClassName = "." + WebInspector.ActivateButtonNavigationItem.ActivatedStyleClassName;

                // Default state.
                var styleText = parentSelector + " ." + classNames + " > .glyph { background-image: -webkit-canvas(" + this._canvasIdentifier(WebInspector.ButtonNavigationItem.States.Normal) + "); background-size: " + this._imageWidth + "px " + this._imageHeight + "px; }\n";

                // Pressed state.
                styleText += parentSelector + " ." + classNames + ":not(.disabled):active > .glyph { background-image: -webkit-canvas(" + this._canvasIdentifier(WebInspector.ButtonNavigationItem.States.Active) + "); }\n";

                // Activated state.
                styleText += parentSelector + " ." + classNames + activatedClassName + ":not(.disabled) > .glyph { background-image: -webkit-canvas(" + this._canvasIdentifier(WebInspector.ButtonNavigationItem.States.Focus) + "); }\n";

                // Activated and pressed state.
                styleText += parentSelector + " ." + classNames + activatedClassName + ":not(.disabled):active > .glyph { background-image: -webkit-canvas(" + this._canvasIdentifier(WebInspector.ButtonNavigationItem.States.ActiveFocus) + "); }\n";
            }

            return styleText;
        }

        // Protected

    }, {
        key: "defaultToolTip",
        get: function get() {
            return this._defaultToolTip;
        }
    }, {
        key: "activatedToolTip",
        get: function get() {
            return this._activatedToolTip;
        }
    }, {
        key: "activated",
        get: function get() {
            return this.element.classList.contains(WebInspector.ActivateButtonNavigationItem.ActivatedStyleClassName);
        },
        set: function set(flag) {
            if (flag) {
                this.toolTip = this._activatedToolTip;
                this.element.classList.add(WebInspector.ActivateButtonNavigationItem.ActivatedStyleClassName);
                if (this._role === "tab") this.element.setAttribute("aria-selected", "true");
            } else {
                this.toolTip = this._defaultToolTip;
                this.element.classList.remove(WebInspector.ActivateButtonNavigationItem.ActivatedStyleClassName);
                if (this._role === "tab") this.element.removeAttribute("aria-selected");
            }
        }
    }, {
        key: "additionalClassNames",
        get: function get() {
            return ["activate", "button"];
        }
    }]);

    return ActivateButtonNavigationItem;
})(WebInspector.ButtonNavigationItem);

WebInspector.ActivateButtonNavigationItem.ActivatedStyleClassName = "activated";
