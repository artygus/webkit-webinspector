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

WebInspector.TextResourceContentView = (function (_WebInspector$ResourceContentView) {
    _inherits(TextResourceContentView, _WebInspector$ResourceContentView);

    function TextResourceContentView(resource) {
        _classCallCheck(this, TextResourceContentView);

        _get(Object.getPrototypeOf(TextResourceContentView.prototype), "constructor", this).call(this, resource, "text");

        resource.addEventListener(WebInspector.SourceCode.Event.ContentDidChange, this._sourceCodeContentDidChange, this);

        this._textEditor = new WebInspector.SourceCodeTextEditor(resource);
        this._textEditor.addEventListener(WebInspector.TextEditor.Event.ExecutionLineNumberDidChange, this._executionLineNumberDidChange, this);
        this._textEditor.addEventListener(WebInspector.TextEditor.Event.NumberOfSearchResultsDidChange, this._numberOfSearchResultsDidChange, this);
        this._textEditor.addEventListener(WebInspector.TextEditor.Event.ContentDidChange, this._textEditorContentDidChange, this);
        this._textEditor.addEventListener(WebInspector.TextEditor.Event.FormattingDidChange, this._textEditorFormattingDidChange, this);
        this._textEditor.addEventListener(WebInspector.SourceCodeTextEditor.Event.ContentWillPopulate, this._contentWillPopulate, this);
        this._textEditor.addEventListener(WebInspector.SourceCodeTextEditor.Event.ContentDidPopulate, this._contentDidPopulate, this);

        WebInspector.probeManager.addEventListener(WebInspector.ProbeManager.Event.ProbeSetAdded, this._probeSetsChanged, this);
        WebInspector.probeManager.addEventListener(WebInspector.ProbeManager.Event.ProbeSetRemoved, this._probeSetsChanged, this);

        var toolTip = WebInspector.UIString("Pretty print");
        var activatedToolTip = WebInspector.UIString("Original formatting");
        this._prettyPrintButtonNavigationItem = new WebInspector.ActivateButtonNavigationItem("pretty-print", toolTip, activatedToolTip, "Images/NavigationItemCurleyBraces.svg", 13, 13);
        this._prettyPrintButtonNavigationItem.addEventListener(WebInspector.ButtonNavigationItem.Event.Clicked, this._togglePrettyPrint, this);
        this._prettyPrintButtonNavigationItem.enabled = false; // Enabled when the text editor is populated with content.

        var toolTipTypes = WebInspector.UIString("Show type information");
        var activatedToolTipTypes = WebInspector.UIString("Hide type information");
        this._showTypesButtonNavigationItem = new WebInspector.ActivateButtonNavigationItem("show-types", toolTipTypes, activatedToolTipTypes, "Images/NavigationItemTypes.svg", 13, 14);
        this._showTypesButtonNavigationItem.addEventListener(WebInspector.ButtonNavigationItem.Event.Clicked, this._toggleTypeAnnotations, this);
        this._showTypesButtonNavigationItem.enabled = false;

        WebInspector.showJavaScriptTypeInformationSetting.addEventListener(WebInspector.Setting.Event.Changed, this._showJavaScriptTypeInformationSettingChanged, this);
    }

    // Public

    _createClass(TextResourceContentView, [{
        key: "revealPosition",
        value: function revealPosition(position, textRangeToSelect, forceUnformatted) {
            this._textEditor.revealPosition(position, textRangeToSelect, forceUnformatted);
        }
    }, {
        key: "shown",
        value: function shown() {
            _get(Object.getPrototypeOf(TextResourceContentView.prototype), "shown", this).call(this);

            this._textEditor.shown();
        }
    }, {
        key: "hidden",
        value: function hidden() {
            _get(Object.getPrototypeOf(TextResourceContentView.prototype), "hidden", this).call(this);

            this._textEditor.hidden();
        }
    }, {
        key: "closed",
        value: function closed() {
            _get(Object.getPrototypeOf(TextResourceContentView.prototype), "closed", this).call(this);

            this.resource.removeEventListener(null, null, this);
            WebInspector.probeManager.removeEventListener(null, null, this);
            WebInspector.showJavaScriptTypeInformationSetting.removeEventListener(null, null, this);

            this._textEditor.close();
        }
    }, {
        key: "performSearch",
        value: function performSearch(query) {
            this._textEditor.performSearch(query);
        }
    }, {
        key: "searchCleared",
        value: function searchCleared() {
            this._textEditor.searchCleared();
        }
    }, {
        key: "searchQueryWithSelection",
        value: function searchQueryWithSelection() {
            return this._textEditor.searchQueryWithSelection();
        }
    }, {
        key: "revealPreviousSearchResult",
        value: function revealPreviousSearchResult(changeFocus) {
            this._textEditor.revealPreviousSearchResult(changeFocus);
        }
    }, {
        key: "revealNextSearchResult",
        value: function revealNextSearchResult(changeFocus) {
            this._textEditor.revealNextSearchResult(changeFocus);
        }
    }, {
        key: "updateLayout",
        value: function updateLayout() {
            this._textEditor.updateLayout();
        }

        // Private

    }, {
        key: "_contentWillPopulate",
        value: function _contentWillPopulate(event) {
            if (this._textEditor.element.parentNode === this.element) return;

            // Check the MIME-type for CSS since Resource.Type.Stylesheet also includes XSL, which we can't edit yet.
            if (this.resource.type === WebInspector.Resource.Type.Stylesheet && this.resource.syntheticMIMEType === "text/css") this._textEditor.readOnly = false;

            // Allow editing any local file since edits can be saved and reloaded right from the Inspector.
            if (this.resource.urlComponents.scheme === "file") this._textEditor.readOnly = false;

            this.element.removeChildren();
            this.element.appendChild(this._textEditor.element);
        }
    }, {
        key: "_contentDidPopulate",
        value: function _contentDidPopulate(event) {
            this._prettyPrintButtonNavigationItem.enabled = this._textEditor.canBeFormatted();
            this._showTypesButtonNavigationItem.enabled = this._textEditor.canShowTypeAnnotations();
            this._showTypesButtonNavigationItem.activated = WebInspector.showJavaScriptTypeInformationSetting.value;
        }
    }, {
        key: "_togglePrettyPrint",
        value: function _togglePrettyPrint(event) {
            var activated = !this._prettyPrintButtonNavigationItem.activated;
            this._textEditor.formatted = activated;
        }
    }, {
        key: "_toggleTypeAnnotations",
        value: function _toggleTypeAnnotations(event) {
            this._textEditor.toggleTypeAnnotations();
        }
    }, {
        key: "_showJavaScriptTypeInformationSettingChanged",
        value: function _showJavaScriptTypeInformationSettingChanged(event) {
            this._showTypesButtonNavigationItem.activated = WebInspector.showJavaScriptTypeInformationSetting.value;
        }
    }, {
        key: "_textEditorFormattingDidChange",
        value: function _textEditorFormattingDidChange(event) {
            this._prettyPrintButtonNavigationItem.activated = this._textEditor.formatted;
        }
    }, {
        key: "_sourceCodeContentDidChange",
        value: function _sourceCodeContentDidChange(event) {
            if (this._ignoreSourceCodeContentDidChangeEvent) return;

            this._textEditor.string = this.resource.currentRevision.content;
        }
    }, {
        key: "_textEditorContentDidChange",
        value: function _textEditorContentDidChange(event) {
            this._ignoreSourceCodeContentDidChangeEvent = true;
            WebInspector.branchManager.currentBranch.revisionForRepresentedObject(this.resource).content = this._textEditor.string;
            delete this._ignoreSourceCodeContentDidChangeEvent;
        }
    }, {
        key: "_executionLineNumberDidChange",
        value: function _executionLineNumberDidChange(event) {
            this.dispatchEventToListeners(WebInspector.ContentView.Event.SupplementalRepresentedObjectsDidChange);
        }
    }, {
        key: "_numberOfSearchResultsDidChange",
        value: function _numberOfSearchResultsDidChange(event) {
            this.dispatchEventToListeners(WebInspector.ContentView.Event.NumberOfSearchResultsDidChange);
        }
    }, {
        key: "_probeSetsChanged",
        value: function _probeSetsChanged(event) {
            var breakpoint = event.data.probeSet.breakpoint;
            if (breakpoint.sourceCodeLocation.sourceCode === this.resource) this.dispatchEventToListeners(WebInspector.ContentView.Event.SupplementalRepresentedObjectsDidChange);
        }
    }, {
        key: "navigationItems",
        get: function get() {
            return [this._prettyPrintButtonNavigationItem, this._showTypesButtonNavigationItem];
        }
    }, {
        key: "managesOwnIssues",
        get: function get() {
            // SourceCodeTextEditor manages the issues, we don't need ResourceContentView doing it.
            return true;
        }
    }, {
        key: "textEditor",
        get: function get() {
            return this._textEditor;
        }
    }, {
        key: "supplementalRepresentedObjects",
        get: function get() {
            var objects = WebInspector.probeManager.probeSets.filter(function (probeSet) {
                return this._resource.url === probeSet.breakpoint.url;
            }, this);

            // If the SourceCodeTextEditor has an executionLineNumber, we can assume
            // it is always the active call frame.
            if (!isNaN(this._textEditor.executionLineNumber)) objects.push(WebInspector.debuggerManager.activeCallFrame);

            return objects;
        }
    }, {
        key: "supportsSave",
        get: function get() {
            return true;
        }
    }, {
        key: "saveData",
        get: function get() {
            return { url: this.resource.url, content: this._textEditor.string };
        }
    }, {
        key: "supportsSearch",
        get: function get() {
            return true;
        }
    }, {
        key: "numberOfSearchResults",
        get: function get() {
            return this._textEditor.numberOfSearchResults;
        }
    }, {
        key: "hasPerformedSearch",
        get: function get() {
            return this._textEditor.currentSearchQuery !== null;
        }
    }, {
        key: "automaticallyRevealFirstSearchResult",
        set: function set(reveal) {
            this._textEditor.automaticallyRevealFirstSearchResult = reveal;
        }
    }]);

    return TextResourceContentView;
})(WebInspector.ResourceContentView);
