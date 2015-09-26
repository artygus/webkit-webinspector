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

WebInspector.ButtonNavigationItem = (function (_WebInspector$NavigationItem) {
    _inherits(ButtonNavigationItem, _WebInspector$NavigationItem);

    function ButtonNavigationItem(identifier, toolTipOrLabel, image, imageWidth, imageHeight, suppressEmboss, role, label) {
        _classCallCheck(this, ButtonNavigationItem);

        _get(Object.getPrototypeOf(ButtonNavigationItem.prototype), "constructor", this).call(this, identifier);

        this._embossedImageStates = WebInspector.ButtonNavigationItem.States;
        this._imageCacheable = true;

        console.assert(identifier);
        console.assert(toolTipOrLabel);

        this.toolTip = toolTipOrLabel;

        this._element.addEventListener("click", this._mouseClicked.bind(this));

        this._element.setAttribute("role", role || "button");

        if (label) this._element.setAttribute("aria-label", label);

        this._imageWidth = imageWidth || 16;
        this._imageHeight = imageHeight || 16;
        this._suppressEmboss = suppressEmboss || false;

        if (suppressEmboss) this._element.classList.add(WebInspector.ButtonNavigationItem.SuppressEmbossStyleClassName);

        if (image) this.image = image;else this.label = toolTipOrLabel;
    }

    // Public

    _createClass(ButtonNavigationItem, [{
        key: "generateStyleText",
        value: function generateStyleText(parentSelector) {
            var classNames = this._classNames.join(".");

            if (this._suppressEmboss) var styleText = parentSelector + " ." + classNames + " > .glyph { width: " + this._imageWidth + "px; height: " + this._imageHeight + "px; }\n";else {
                // Default state.
                var styleText = parentSelector + " ." + classNames + " > .glyph { background-image: -webkit-canvas(" + this._canvasIdentifier() + "); background-size: " + this._imageWidth + "px " + this._imageHeight + "px; }\n";

                // Pressed state.
                styleText += parentSelector + " ." + classNames + ":not(.disabled):active > .glyph { background-image: -webkit-canvas(" + this._canvasIdentifier(WebInspector.ButtonNavigationItem.States.Active) + "); }\n";

                // Focused state.
                styleText += parentSelector + " ." + classNames + ":not(.disabled):focus > .glyph { background-image: -webkit-canvas(" + this._canvasIdentifier(WebInspector.ButtonNavigationItem.States.Focus) + "); }\n";
            }

            return styleText;
        }

        // Protected

    }, {
        key: "_mouseClicked",

        // Private

        value: function _mouseClicked(event) {
            if (!this.enabled) return;
            this.dispatchEventToListeners(WebInspector.ButtonNavigationItem.Event.Clicked);
        }
    }, {
        key: "_canvasIdentifier",
        value: function _canvasIdentifier(state) {
            console.assert(!this._suppressEmboss);
            return "navigation-item-" + this._identifier + "-" + (state || WebInspector.ButtonNavigationItem.States.Normal);
        }
    }, {
        key: "_updateImage",
        value: function _updateImage() {
            if (this._suppressEmboss) this._glyphElement.style.webkitMask = "url(" + this._image + ")";else this._generateImages();
        }
    }, {
        key: "_generateImages",
        value: function _generateImages() {
            console.assert(!this._suppressEmboss);
            if (this._suppressEmboss) return;
            generateEmbossedImages(this.image, this._imageWidth, this._imageHeight, this._embossedImageStates, this._canvasIdentifier.bind(this), !this._imageCacheable);
        }
    }, {
        key: "toolTip",
        get: function get() {
            return this._element.title;
        },
        set: function set(newToolTip) {
            console.assert(newToolTip);
            if (!newToolTip) return;

            this._element.title = newToolTip;
        }
    }, {
        key: "label",
        get: function get() {
            return this._element.textContent;
        },
        set: function set(newLabel) {
            this._element.classList.add(WebInspector.ButtonNavigationItem.TextOnlyClassName);
            this._element.textContent = newLabel || "";
            if (this.parentNavigationBar) this.parentNavigationBar.updateLayout();
        }
    }, {
        key: "image",
        get: function get() {
            return this._image;
        },
        set: function set(newImage) {
            if (!newImage) {
                this._element.removeChildren();
                return;
            }

            this._element.removeChildren();
            this._element.classList.remove(WebInspector.ButtonNavigationItem.TextOnlyClassName);

            this._image = newImage;

            this._glyphElement = document.createElement("div");
            this._glyphElement.className = "glyph";
            this._element.appendChild(this._glyphElement);

            this._updateImage();
        }
    }, {
        key: "enabled",
        get: function get() {
            return !this._element.classList.contains(WebInspector.ButtonNavigationItem.DisabledStyleClassName);
        },
        set: function set(flag) {
            if (flag) this._element.classList.remove(WebInspector.ButtonNavigationItem.DisabledStyleClassName);else this._element.classList.add(WebInspector.ButtonNavigationItem.DisabledStyleClassName);
        }
    }, {
        key: "suppressBezel",
        get: function get() {
            return this._element.classList.contains(WebInspector.ButtonNavigationItem.SuppressBezelStyleClassName);
        },
        set: function set(flag) {
            if (flag) this._element.classList.add(WebInspector.ButtonNavigationItem.SuppressBezelStyleClassName);else this._element.classList.remove(WebInspector.ButtonNavigationItem.SuppressBezelStyleClassName);
        }
    }, {
        key: "additionalClassNames",
        get: function get() {
            return ["button"];
        }
    }]);

    return ButtonNavigationItem;
})(WebInspector.NavigationItem);

WebInspector.ButtonNavigationItem.DisabledStyleClassName = "disabled";
WebInspector.ButtonNavigationItem.SuppressBezelStyleClassName = "suppress-bezel";
WebInspector.ButtonNavigationItem.SuppressEmbossStyleClassName = "suppress-emboss";
WebInspector.ButtonNavigationItem.TextOnlyClassName = "text-only";

WebInspector.ButtonNavigationItem.States = {};
WebInspector.ButtonNavigationItem.States.Normal = "normal";
WebInspector.ButtonNavigationItem.States.Active = "active";
WebInspector.ButtonNavigationItem.States.Focus = "focus";
WebInspector.ButtonNavigationItem.States.ActiveFocus = "active-focus";

WebInspector.ButtonNavigationItem.Event = {
    Clicked: "button-navigation-item-clicked"
};
