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

WebInspector.TextContentView = function (string, mimeType) {
    WebInspector.ContentView.call(this, string);

    this.element.classList.add(WebInspector.TextContentView.StyleClassName);

    this._textEditor = new WebInspector.TextEditor();
    this._textEditor.addEventListener(WebInspector.TextEditor.Event.NumberOfSearchResultsDidChange, this._numberOfSearchResultsDidChange, this);
    this._textEditor.addEventListener(WebInspector.TextEditor.Event.FormattingDidChange, this._textEditorFormattingDidChange, this);

    this.element.appendChild(this._textEditor.element);

    this._textEditor.readOnly = true;
    this._textEditor.mimeType = mimeType;
    this._textEditor.string = string;

    var curleyBracesImage;
    if (WebInspector.Platform.isLegacyMacOS) curleyBracesImage = { src: "Images/Legacy/NavigationItemCurleyBraces.svg", width: 16, height: 16 };else curleyBracesImage = { src: "Images/NavigationItemCurleyBraces.svg", width: 13, height: 13 };

    var toolTip = WebInspector.UIString("Pretty print");
    var activatedToolTip = WebInspector.UIString("Original formatting");
    this._prettyPrintButtonNavigationItem = new WebInspector.ActivateButtonNavigationItem("pretty-print", toolTip, activatedToolTip, curleyBracesImage.src, curleyBracesImage.width, curleyBracesImage.height);
    this._prettyPrintButtonNavigationItem.addEventListener(WebInspector.ButtonNavigationItem.Event.Clicked, this._togglePrettyPrint, this);
    this._prettyPrintButtonNavigationItem.enabled = this._textEditor.canBeFormatted();

    var toolTipTypes = WebInspector.UIString("Show type information");
    var activatedToolTipTypes = WebInspector.UIString("Hide type information");
    this._showTypesButtonNavigationItem = new WebInspector.ActivateButtonNavigationItem("show-types", toolTipTypes, activatedToolTipTypes, "Images/NavigationItemTypes.svg", 13, 14);
    this._showTypesButtonNavigationItem.enabled = false;
};

WebInspector.TextContentView.StyleClassName = "text";

WebInspector.TextContentView.prototype = Object.defineProperties({
    constructor: WebInspector.TextContentView,

    revealPosition: function revealPosition(position, textRangeToSelect, forceUnformatted) {
        this._textEditor.revealPosition(position, textRangeToSelect, forceUnformatted);
    },

    shown: function shown() {
        WebInspector.ContentView.prototype.shown.call(this);

        this._textEditor.shown();
    },

    hidden: function hidden() {
        WebInspector.ContentView.prototype.hidden.call(this);

        this._textEditor.hidden();
    },

    closed: function closed() {
        WebInspector.ContentView.prototype.closed.call(this);

        this._textEditor.close();
    },

    performSearch: function performSearch(query) {
        this._textEditor.performSearch(query);
    },

    searchCleared: function searchCleared() {
        this._textEditor.searchCleared();
    },

    searchQueryWithSelection: function searchQueryWithSelection() {
        return this._textEditor.searchQueryWithSelection();
    },

    revealPreviousSearchResult: function revealPreviousSearchResult(changeFocus) {
        this._textEditor.revealPreviousSearchResult(changeFocus);
    },

    revealNextSearchResult: function revealNextSearchResult(changeFocus) {
        this._textEditor.revealNextSearchResult(changeFocus);
    },

    updateLayout: function updateLayout() {
        this._textEditor.updateLayout();
    },

    // Private

    _togglePrettyPrint: function _togglePrettyPrint(event) {
        var activated = !this._prettyPrintButtonNavigationItem.activated;
        this._textEditor.formatted = activated;
    },

    _textEditorFormattingDidChange: function _textEditorFormattingDidChange(event) {
        this._prettyPrintButtonNavigationItem.activated = this._textEditor.formatted;
    },

    _numberOfSearchResultsDidChange: function _numberOfSearchResultsDidChange(event) {
        this.dispatchEventToListeners(WebInspector.ContentView.Event.NumberOfSearchResultsDidChange);
    }
}, {
    textEditor: { // Public

        get: function get() {
            return this._textEditor;
        },
        configurable: true,
        enumerable: true
    },
    navigationItems: {
        get: function get() {
            return [this._prettyPrintButtonNavigationItem, this._showTypesButtonNavigationItem];
        },
        configurable: true,
        enumerable: true
    },
    supportsSave: {
        get: function get() {
            return true;
        },
        configurable: true,
        enumerable: true
    },
    saveData: {
        get: function get() {
            var url = "web-inspector:///" + encodeURI(WebInspector.UIString("Untitled")) + ".txt";
            return { url: url, content: this._textEditor.string, forceSaveAs: true };
        },
        configurable: true,
        enumerable: true
    },
    supportsSearch: {
        get: function get() {
            return true;
        },
        configurable: true,
        enumerable: true
    },
    numberOfSearchResults: {
        get: function get() {
            return this._textEditor.numberOfSearchResults;
        },
        configurable: true,
        enumerable: true
    },
    hasPerformedSearch: {
        get: function get() {
            return this._textEditor.currentSearchQuery !== null;
        },
        configurable: true,
        enumerable: true
    },
    automaticallyRevealFirstSearchResult: {
        set: function set(reveal) {
            this._textEditor.automaticallyRevealFirstSearchResult = reveal;
        },
        configurable: true,
        enumerable: true
    }
});

WebInspector.TextContentView.prototype.__proto__ = WebInspector.ContentView.prototype;
