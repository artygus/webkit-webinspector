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

WebInspector.VisualStyleFontFamilyListEditor = (function (_WebInspector$VisualStyleCommaSeparatedKeywordEditor) {
    _inherits(VisualStyleFontFamilyListEditor, _WebInspector$VisualStyleCommaSeparatedKeywordEditor);

    function VisualStyleFontFamilyListEditor(propertyNames, text, layoutReversed) {
        _classCallCheck(this, VisualStyleFontFamilyListEditor);

        _get(Object.getPrototypeOf(VisualStyleFontFamilyListEditor.prototype), "constructor", this).call(this, propertyNames, text, true, layoutReversed);

        this._commaSeparatedKeywords.element.addEventListener("scroll", this._hideCompletions.bind(this));

        this._completionController = new WebInspector.VisualStyleCompletionsController(this);
        this._completionController.addEventListener(WebInspector.VisualStyleCompletionsController.Event.CompletionSelected, this._completionClicked, this);

        this._wrapWithQuotesRegExp = /^[a-zA-Z\-]+$/;
        this._removeWrappedQuotesRegExp = /[\"\']/g;
    }

    // Public

    _createClass(VisualStyleFontFamilyListEditor, [{
        key: "visualStyleCompletionsControllerCustomizeCompletionElement",
        value: function visualStyleCompletionsControllerCustomizeCompletionElement(suggestionsView, element, item) {
            element.style.fontFamily = item;
        }
    }, {
        key: "_modifyCommaSeparatedKeyword",

        // Private

        value: function _modifyCommaSeparatedKeyword(text) {
            if (!this._wrapWithQuotesRegExp.test(text)) text = "\"" + text + "\"";

            return text;
        }
    }, {
        key: "_addCommaSeparatedKeyword",
        value: function _addCommaSeparatedKeyword(value, index) {
            if (value) value = value.replace(this._removeWrappedQuotesRegExp, "");

            var valueElement = _get(Object.getPrototypeOf(VisualStyleFontFamilyListEditor.prototype), "_addCommaSeparatedKeyword", this).call(this, value, index);
            valueElement.addEventListener(WebInspector.VisualStyleFontFamilyTreeElement.Event.EditorKeyDown, this._treeElementKeyDown, this);
            valueElement.addEventListener(WebInspector.VisualStyleFontFamilyTreeElement.Event.KeywordChanged, this._treeElementKeywordChanged, this);
            valueElement.addEventListener(WebInspector.VisualStyleFontFamilyTreeElement.Event.EditorBlurred, this._hideCompletions, this);
            return valueElement;
        }
    }, {
        key: "_addEmptyCommaSeparatedKeyword",
        value: function _addEmptyCommaSeparatedKeyword() {
            var newItem = _get(Object.getPrototypeOf(VisualStyleFontFamilyListEditor.prototype), "_addEmptyCommaSeparatedKeyword", this).call(this);
            newItem.showKeywordEditor();
        }
    }, {
        key: "_completionClicked",
        value: function _completionClicked(event) {
            this.value = event.data.text;
            this._valueDidChange();
        }
    }, {
        key: "_treeElementKeyDown",
        value: function _treeElementKeyDown(event) {
            if (!this._completionController.visible) return;

            var key = event && event.data && event.data.key;
            if (!key) return;

            if (key === "Enter" || key === "Tab") {
                var selectedTreeElement = this._commaSeparatedKeywords.selectedTreeElement;
                if (!selectedTreeElement) return;

                selectedTreeElement.updateMainTitle(this._completionController.currentCompletion);
                this._completionController.hide();
                return;
            }

            if (key === "Escape") {
                this._hideCompletions();
                return;
            }

            if (key === "Up") {
                this._completionController.previous();
                return;
            }

            if (key === "Down") {
                this._completionController.next();
                return;
            }
        }
    }, {
        key: "_treeElementKeywordChanged",
        value: function _treeElementKeywordChanged() {
            if (!this.hasCompletions) return;

            var result = this._valueDidChange();
            if (!result) return;

            var treeElement = this._commaSeparatedKeywords.selectedTreeElement;
            if (!treeElement) return;

            if (this._completionController.update(treeElement.mainTitle)) {
                var bounds = treeElement.editorBounds(2);
                if (!bounds) return;

                this._completionController.show(bounds);
            }
        }
    }, {
        key: "_hideCompletions",
        value: function _hideCompletions() {
            this._completionController.hide();
        }
    }, {
        key: "_createNewTreeElement",
        value: function _createNewTreeElement(value) {
            return new WebInspector.VisualStyleFontFamilyTreeElement(value);
        }
    }, {
        key: "hasCompletions",
        get: function get() {
            return this._completionController.hasCompletions;
        }
    }, {
        key: "completions",
        set: function set(completions) {
            this._completionController.completions = completions;
        }
    }]);

    return VisualStyleFontFamilyListEditor;
})(WebInspector.VisualStyleCommaSeparatedKeywordEditor);
