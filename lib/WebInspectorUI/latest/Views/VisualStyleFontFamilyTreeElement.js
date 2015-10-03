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

WebInspector.VisualStyleFontFamilyTreeElement = (function (_WebInspector$GeneralTreeElement) {
    _inherits(VisualStyleFontFamilyTreeElement, _WebInspector$GeneralTreeElement);

    function VisualStyleFontFamilyTreeElement(text) {
        _classCallCheck(this, VisualStyleFontFamilyTreeElement);

        _get(Object.getPrototypeOf(VisualStyleFontFamilyTreeElement.prototype), "constructor", this).call(this, [WebInspector.VisualStyleCommaSeparatedKeywordEditor.ListItemClassName, "visual-style-font-family-list-item"], text);

        this._keywordEditor = document.createElement("input");
        this._keywordEditor.classList.add("visual-style-comma-separated-keyword-item-editor");
        this._keywordEditor.placeholder = WebInspector.UIString("(modify the boxes below to add a value)");
        this._keywordEditor.spellcheck = false;
        this._keywordEditor.addEventListener("keydown", this._keywordEditorKeyDown.bind(this));
        this._keywordEditor.addEventListener("keyup", this._keywordEditorKeyUp.bind(this));
        this._keywordEditor.addEventListener("blur", this._keywordEditorBlurred.bind(this));
    }

    // Public

    _createClass(VisualStyleFontFamilyTreeElement, [{
        key: "editorBounds",
        value: function editorBounds(padding) {
            if (this.keywordEditorHidden) return;

            var bounds = WebInspector.Rect.rectFromClientRect(this._keywordEditor.getBoundingClientRect());
            return bounds.pad(padding || 0);
        }
    }, {
        key: "updateMainTitle",
        value: function updateMainTitle(text) {
            this.mainTitle = this._keywordEditor.value = text;
            this._listItemNode.style.fontFamily = text + ", " + WebInspector.VisualStyleFontFamilyTreeElement.FontFamilyFallback;

            var hasText = text && text.length;
            this._listItemNode.classList.toggle("no-value", !hasText);
            if (!hasText) this.subtitle = this._keywordEditor.placeholder;

            this.dispatchEventToListeners(WebInspector.VisualStyleFontFamilyTreeElement.Event.KeywordChanged);
        }
    }, {
        key: "showKeywordEditor",
        value: function showKeywordEditor() {
            if (!this.keywordEditorHidden) return;

            this.subtitle = "";
            this._listItemNode.classList.remove("editor-hidden");
            this._listItemNode.scrollIntoViewIfNeeded();

            this._keywordEditor.value = this._mainTitle;
            this._keywordEditor.select();
        }
    }, {
        key: "hideKeywordEditor",
        value: function hideKeywordEditor() {
            if (this.keywordEditorHidden) return;

            this.updateMainTitle(this._keywordEditor.value);
            this._listItemNode.classList.add("editor-hidden");
        }
    }, {
        key: "onattach",

        // Protected

        value: function onattach() {
            _get(Object.getPrototypeOf(VisualStyleFontFamilyTreeElement.prototype), "onattach", this).call(this);

            this._listItemNode.style.fontFamily = this._mainTitle;
            this._listItemNode.classList.add("editor-hidden");
            this._listItemNode.appendChild(this._keywordEditor);
            this._listItemNode.addEventListener("click", this.showKeywordEditor.bind(this));
        }
    }, {
        key: "ondeselect",
        value: function ondeselect() {
            this.hideKeywordEditor();
        }

        // Private

    }, {
        key: "_keywordEditorKeyDown",
        value: function _keywordEditorKeyDown(event) {
            if (this.keywordEditorHidden) return;

            var keyCode = event.keyCode;
            var enterKeyCode = WebInspector.KeyboardShortcut.Key.Enter.keyCode;
            if (keyCode === enterKeyCode) {
                this._listItemNode.classList.add("editor-hidden");
                this.dispatchEventToListeners(WebInspector.VisualStyleFontFamilyTreeElement.Event.EditorKeyDown, { key: "Enter" });
                return;
            }

            var escapeKeyCode = WebInspector.KeyboardShortcut.Key.Escape.keyCode;
            if (keyCode === escapeKeyCode) {
                this.dispatchEventToListeners(WebInspector.VisualStyleFontFamilyTreeElement.Event.EditorKeyDown, { key: "Escape" });
                return;
            }

            var tabKeyCode = WebInspector.KeyboardShortcut.Key.Tab.keyCode;
            if (keyCode === tabKeyCode) {
                event.preventDefault();
                this._dontFireKeyUp = true;
                this.dispatchEventToListeners(WebInspector.VisualStyleFontFamilyTreeElement.Event.EditorKeyDown, { key: "Tab" });
                return;
            }

            var key = event.keyIdentifier;
            if (key === "Up" || key === "Down") {
                event.preventDefault();
                this._dontFireKeyUp = true;
                this.dispatchEventToListeners(WebInspector.VisualStyleFontFamilyTreeElement.Event.EditorKeyDown, { key: key });
                return;
            }

            this.dispatchEventToListeners(WebInspector.VisualStyleFontFamilyTreeElement.Event.EditorKeyDown);
        }
    }, {
        key: "_keywordEditorKeyUp",
        value: function _keywordEditorKeyUp() {
            if (this.keywordEditorHidden || this._dontFireKeyUp) return;

            this.updateMainTitle(this._keywordEditor.value);
        }
    }, {
        key: "_keywordEditorBlurred",
        value: function _keywordEditorBlurred() {
            this.hideKeywordEditor();
            this.dispatchEventToListeners(WebInspector.VisualStyleFontFamilyTreeElement.Event.EditorBlurred);
        }
    }, {
        key: "currentlyEditing",
        get: function get() {
            return !this.keywordEditorHidden;
        }
    }, {
        key: "keywordEditorHidden",
        get: function get() {
            return this._listItemNode.classList.contains("editor-hidden");
        }
    }]);

    return VisualStyleFontFamilyTreeElement;
})(WebInspector.GeneralTreeElement);

WebInspector.VisualStyleFontFamilyTreeElement.FontFamilyFallback = "-apple-system, sans-serif";

WebInspector.VisualStyleFontFamilyTreeElement.Event = {
    KeywordChanged: "visual-style-font-family-tree-element-keyword-changed",
    EditorKeyDown: "visual-style-font-family-tree-element-editor-key-down",
    EditorBlurred: "visual-style-font-family-tree-element-editor-blurred"
};
