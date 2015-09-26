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

WebInspector.ErrorObjectView = (function (_WebInspector$Object) {
    _inherits(ErrorObjectView, _WebInspector$Object);

    function ErrorObjectView(object) {
        _classCallCheck(this, ErrorObjectView);

        _get(Object.getPrototypeOf(ErrorObjectView.prototype), "constructor", this).call(this);

        console.assert(object instanceof WebInspector.RemoteObject && object.subtype === "error", object);

        this._object = object;

        this._element = document.createElement("div");
        this._element.classList.add("error-object");
        var previewElement = WebInspector.FormattedValue.createElementForError(this._object);
        this._element.append(previewElement);
        previewElement.addEventListener("click", this._handlePreviewOrTitleElementClick.bind(this));

        this._outlineElement = this._element.appendChild(document.createElement("div"));
        this._outlineElement.classList.add("error-object-outline");
        this._outline = new WebInspector.TreeOutline(this._outlineElement);
    }

    // Static

    _createClass(ErrorObjectView, [{
        key: "update",
        value: function update() {
            this._object.getOwnPropertyDescriptorsAsObject((function (properties) {
                console.assert(properties && properties.stack && properties.stack.value);

                if (!this._hasStackTrace) this._buildStackTrace(properties.stack.value.value);

                this._hasStackTrace = true;
            }).bind(this));
        }
    }, {
        key: "expand",
        value: function expand() {
            if (this._expanded) return;

            this._expanded = true;
            this._element.classList.add("expanded");

            if (this._previewView) this._previewView.showTitle();

            this.update();
        }
    }, {
        key: "collapse",
        value: function collapse() {
            if (!this._expanded) return;

            this._expanded = false;
            this._element.classList.remove("expanded");

            if (this._previewView) this._previewView.showPreview();
        }

        // Private

    }, {
        key: "_handlePreviewOrTitleElementClick",
        value: function _handlePreviewOrTitleElementClick(event) {
            if (!this._expanded) this.expand();else this.collapse();

            event.stopPropagation();
        }
    }, {
        key: "_buildStackTrace",
        value: function _buildStackTrace(stackString) {
            var stackTrace = WebInspector.StackTrace.fromString(stackString);
            var stackTraceElement = new WebInspector.StackTraceView(stackTrace).element;
            this._outlineElement.appendChild(stackTraceElement);
        }
    }, {
        key: "object",

        // Public

        get: function get() {
            return this._object;
        }
    }, {
        key: "element",
        get: function get() {
            return this._element;
        }
    }, {
        key: "treeOutline",
        get: function get() {
            return this._outline;
        }
    }, {
        key: "expanded",
        get: function get() {
            return this._expanded;
        }
    }], [{
        key: "makeSourceLinkWithPrefix",
        value: function makeSourceLinkWithPrefix(sourceURL, lineNumber, columnNumber) {
            if (!sourceURL) return null;

            var span = document.createElement("span");
            span.classList.add("error-object-link-container");
            span.textContent = " — ";

            var a = WebInspector.linkifyLocation(sourceURL, parseInt(lineNumber) - 1, parseInt(columnNumber));
            a.classList.add("error-object-link");
            span.appendChild(a);

            return span;
        }
    }]);

    return ErrorObjectView;
})(WebInspector.Object);
