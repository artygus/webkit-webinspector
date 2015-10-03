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

WebInspector.FontResourceContentView = (function (_WebInspector$ResourceContentView) {
    _inherits(FontResourceContentView, _WebInspector$ResourceContentView);

    function FontResourceContentView(resource) {
        _classCallCheck(this, FontResourceContentView);

        _get(Object.getPrototypeOf(FontResourceContentView.prototype), "constructor", this).call(this, resource, "font");

        this._styleElement = null;
        this._previewElement = null;
    }

    // Public

    _createClass(FontResourceContentView, [{
        key: "sizeToFit",
        value: function sizeToFit() {
            if (!this._previewElement) return;

            // Start at the maximum size and try progressively smaller font sizes until minimum is reached or the preview element is not as wide as the main element.
            for (var fontSize = WebInspector.FontResourceContentView.MaximumFontSize; fontSize >= WebInspector.FontResourceContentView.MinimumFontSize; fontSize -= 5) {
                this._previewElement.style.fontSize = fontSize + "px";
                if (this._previewElement.offsetWidth <= this.element.offsetWidth) break;
            }
        }
    }, {
        key: "contentAvailable",
        value: function contentAvailable(content, base64Encoded) {
            this.element.removeChildren();

            var uniqueFontName = "WebInspectorFontPreview" + ++WebInspector.FontResourceContentView._uniqueFontIdentifier;

            var format = "";

            // We need to specify a format when loading SVG fonts to make them work.
            if (this.resource.mimeTypeComponents.type === "image/svg+xml") format = " format(\"svg\")";

            if (this._styleElement && this._styleElement.parentNode) this._styleElement.parentNode.removeChild(this._styleElement);

            this._fontObjectURL = this.resource.createObjectURL();

            this._styleElement = document.createElement("style");
            this._styleElement.textContent = "@font-face { font-family: \"" + uniqueFontName + "\"; src: url(" + this._fontObjectURL + ")" + format + "; }";

            // The style element will be added when shown later if we are not visible now.
            if (this.visible) document.head.appendChild(this._styleElement);

            this._previewElement = document.createElement("div");
            this._previewElement.className = "preview";
            this._previewElement.style.fontFamily = uniqueFontName;

            function createMetricElement(className) {
                var metricElement = document.createElement("div");
                metricElement.className = "metric " + className;
                return metricElement;
            }

            var lines = WebInspector.FontResourceContentView.PreviewLines;
            for (var i = 0; i < lines.length; ++i) {
                var lineElement = document.createElement("div");
                lineElement.className = "line";

                lineElement.appendChild(createMetricElement("top"));
                lineElement.appendChild(createMetricElement("xheight"));
                lineElement.appendChild(createMetricElement("middle"));
                lineElement.appendChild(createMetricElement("baseline"));
                lineElement.appendChild(createMetricElement("bottom"));

                var contentElement = document.createElement("div");
                contentElement.className = "content";
                contentElement.textContent = lines[i];
                lineElement.appendChild(contentElement);

                this._previewElement.appendChild(lineElement);
            }

            this.element.appendChild(this._previewElement);

            this.sizeToFit();
        }
    }, {
        key: "updateLayout",
        value: function updateLayout() {
            this.sizeToFit();
        }
    }, {
        key: "shown",
        value: function shown() {
            // Add the style element since it is removed when hidden.
            if (this._styleElement) document.head.appendChild(this._styleElement);
        }
    }, {
        key: "hidden",
        value: function hidden() {
            // Remove the style element so it will not stick around when this content view is destroyed.
            if (this._styleElement && this._styleElement.parentNode) this._styleElement.parentNode.removeChild(this._styleElement);
        }
    }, {
        key: "closed",
        value: function closed() {
            // This is a workaround for the fact that the browser does not send any events
            // when a @font-face resource is loaded. So, we assume it could be needed until
            // the content view is destroyed, as re-attaching the style element would cause
            // the object URL to be resolved again.
            if (this._fontObjectURL) URL.revokeObjectURL(this._fontObjectURL);
        }
    }, {
        key: "previewElement",
        get: function get() {
            return this._previewElement;
        }
    }]);

    return FontResourceContentView;
})(WebInspector.ResourceContentView);

WebInspector.FontResourceContentView._uniqueFontIdentifier = 0;

WebInspector.FontResourceContentView.PreviewLines = ["ABCDEFGHIJKLM", "NOPQRSTUVWXYZ", "abcdefghijklm", "nopqrstuvwxyz", "1234567890"];

WebInspector.FontResourceContentView.MaximumFontSize = 72;
WebInspector.FontResourceContentView.MinimumFontSize = 12;
