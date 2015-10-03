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

WebInspector.ScriptContentView = function (script) {
    WebInspector.ContentView.call(this, script);

    this.element.classList.add(WebInspector.ScriptContentView.StyleClassName);

    // Append a spinner while waiting for _contentWillPopulate.
    var spinner = new WebInspector.IndeterminateProgressSpinner();
    this.element.appendChild(spinner.element);

    this._script = script;

    // This view is only for standalone Scripts with no corresponding Resource. All other Scripts
    // should be handled by TextResourceContentView via the Resource.
    console.assert(!script.resource);
    console.assert(script.range.startLine === 0);
    console.assert(script.range.startColumn === 0);

    this._textEditor = new WebInspector.SourceCodeTextEditor(script);
    this._textEditor.addEventListener(WebInspector.TextEditor.Event.ExecutionLineNumberDidChange, this._executionLineNumberDidChange, this);
    this._textEditor.addEventListener(WebInspector.TextEditor.Event.NumberOfSearchResultsDidChange, this._numberOfSearchResultsDidChange, this);
    this._textEditor.addEventListener(WebInspector.TextEditor.Event.FormattingDidChange, this._textEditorFormattingDidChange, this);
    this._textEditor.addEventListener(WebInspector.SourceCodeTextEditor.Event.ContentWillPopulate, this._contentWillPopulate, this);
    this._textEditor.addEventListener(WebInspector.SourceCodeTextEditor.Event.ContentDidPopulate, this._contentDidPopulate, this);

    var curleyBracesImage;
    if (WebInspector.Platform.isLegacyMacOS) curleyBracesImage = { src: "Images/Legacy/NavigationItemCurleyBraces.svg", width: 16, height: 16 };else curleyBracesImage = { src: "Images/NavigationItemCurleyBraces.svg", width: 13, height: 13 };

    var toolTip = WebInspector.UIString("Pretty print");
    var activatedToolTip = WebInspector.UIString("Original formatting");
    this._prettyPrintButtonNavigationItem = new WebInspector.ActivateButtonNavigationItem("pretty-print", toolTip, activatedToolTip, curleyBracesImage.src, curleyBracesImage.width, curleyBracesImage.height);
    this._prettyPrintButtonNavigationItem.addEventListener(WebInspector.ButtonNavigationItem.Event.Clicked, this._togglePrettyPrint, this);
    this._prettyPrintButtonNavigationItem.enabled = false; // Enabled when the text editor is populated with content.

    var toolTipTypes = WebInspector.UIString("Show type information");
    var activatedToolTipTypes = WebInspector.UIString("Hide type information");
    this._showTypesButtonNavigationItem = new WebInspector.ActivateButtonNavigationItem("show-types", toolTipTypes, activatedToolTipTypes, "Images/NavigationItemTypes.svg", 13, 14);
    this._showTypesButtonNavigationItem.addEventListener(WebInspector.ButtonNavigationItem.Event.Clicked, this._toggleTypeAnnotations, this);
    this._showTypesButtonNavigationItem.enabled = false;

    WebInspector.showJavaScriptTypeInformationSetting.addEventListener(WebInspector.Setting.Event.Changed, this._showJavaScriptTypeInformationSettingChanged, this);
};

WebInspector.ScriptContentView.StyleClassName = "script";

WebInspector.ScriptContentView.prototype = Object.defineProperties({
    constructor: WebInspector.ScriptContentView,

    revealPosition: function revealPosition(position, textRangeToSelect, forceUnformatted) {
        this._textEditor.revealPosition(position, textRangeToSelect, forceUnformatted);
    },

    shown: function shown() {
        this._textEditor.shown();
    },

    hidden: function hidden() {
        this._textEditor.hidden();
    },

    closed: function closed() {
        this._textEditor.close();
    },

    saveToCookie: function saveToCookie(cookie) {
        cookie.type = WebInspector.ContentViewCookieType.Resource;
        cookie.url = this.representedObject.url;
    },

    restoreFromCookie: function restoreFromCookie(cookie) {
        if ("lineNumber" in cookie && "columnNumber" in cookie) this.revealPosition(new WebInspector.SourceCodePosition(cookie.lineNumber, cookie.columnNumber));
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

    _contentWillPopulate: function _contentWillPopulate(event) {
        if (this._textEditor.element.parentNode === this.element) return;

        // Allow editing any local file since edits can be saved and reloaded right from the Inspector.
        if (this._script.urlComponents.scheme === "file") this._textEditor.readOnly = false;

        this.element.removeChildren();
        this.element.appendChild(this._textEditor.element);
    },

    _contentDidPopulate: function _contentDidPopulate(event) {
        this._prettyPrintButtonNavigationItem.enabled = this._textEditor.canBeFormatted();
        this._showTypesButtonNavigationItem.enabled = this._textEditor.canShowTypeAnnotations();
        this._showTypesButtonNavigationItem.activated = WebInspector.showJavaScriptTypeInformationSetting.value;
    },

    _togglePrettyPrint: function _togglePrettyPrint(event) {
        var activated = !this._prettyPrintButtonNavigationItem.activated;
        this._textEditor.formatted = activated;
    },

    _toggleTypeAnnotations: function _toggleTypeAnnotations(event) {
        this._textEditor.toggleTypeAnnotations();
    },

    _showJavaScriptTypeInformationSettingChanged: function _showJavaScriptTypeInformationSettingChanged(event) {
        this._showTypesButtonNavigationItem.activated = WebInspector.showJavaScriptTypeInformationSetting.value;
    },

    _textEditorFormattingDidChange: function _textEditorFormattingDidChange(event) {
        this._prettyPrintButtonNavigationItem.activated = this._textEditor.formatted;
    },

    _executionLineNumberDidChange: function _executionLineNumberDidChange(event) {
        this.dispatchEventToListeners(WebInspector.ContentView.Event.SupplementalRepresentedObjectsDidChange);
    },

    _numberOfSearchResultsDidChange: function _numberOfSearchResultsDidChange(event) {
        this.dispatchEventToListeners(WebInspector.ContentView.Event.NumberOfSearchResultsDidChange);
    }
}, {
    navigationItems: { // Public

        get: function get() {
            return [this._prettyPrintButtonNavigationItem, this._showTypesButtonNavigationItem];
        },
        configurable: true,
        enumerable: true
    },
    script: {
        get: function get() {
            return this._script;
        },
        configurable: true,
        enumerable: true
    },
    textEditor: {
        get: function get() {
            return this._textEditor;
        },
        configurable: true,
        enumerable: true
    },
    supplementalRepresentedObjects: {
        get: function get() {
            if (isNaN(this._textEditor.executionLineNumber)) return [];

            // If the SourceCodeTextEditor has an executionLineNumber, we can assume
            // it is always the active call frame.
            return [WebInspector.debuggerManager.activeCallFrame];
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
            var url = this._script.url || "web-inspector:///" + encodeURI(this._script.displayName) + ".js";
            return { url: url, content: this._textEditor.string };
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

WebInspector.ScriptContentView.prototype.__proto__ = WebInspector.ContentView.prototype;
