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

WebInspector.ContentView = function (representedObject) {
    if (this.constructor === WebInspector.ContentView) {
        // When instantiated directly return an instance of a type-based concrete subclass.

        console.assert(representedObject);

        if (representedObject instanceof WebInspector.Frame) return new WebInspector.FrameContentView(representedObject);

        if (representedObject instanceof WebInspector.Resource) return new WebInspector.ResourceClusterContentView(representedObject);

        if (representedObject instanceof WebInspector.Script) return new WebInspector.ScriptContentView(representedObject);

        if (representedObject instanceof WebInspector.TimelineRecording) return new WebInspector.TimelineContentView(representedObject);

        if (representedObject instanceof WebInspector.DOMStorageObject) return new WebInspector.DOMStorageContentView(representedObject);

        if (representedObject instanceof WebInspector.CookieStorageObject) return new WebInspector.CookieStorageContentView(representedObject);

        if (representedObject instanceof WebInspector.DatabaseTableObject) return new WebInspector.DatabaseTableContentView(representedObject);

        if (representedObject instanceof WebInspector.DatabaseObject) return new WebInspector.DatabaseContentView(representedObject);

        if (representedObject instanceof WebInspector.IndexedDatabaseObjectStore) return new WebInspector.IndexedDatabaseObjectStoreContentView(representedObject);

        if (representedObject instanceof WebInspector.IndexedDatabaseObjectStoreIndex) return new WebInspector.IndexedDatabaseObjectStoreContentView(representedObject);

        if (representedObject instanceof WebInspector.ApplicationCacheFrame) return new WebInspector.ApplicationCacheFrameContentView(representedObject);

        if (representedObject instanceof WebInspector.DOMTree) return new WebInspector.FrameDOMTreeContentView(representedObject);

        if (representedObject instanceof WebInspector.LogObject) return new WebInspector.LogContentView(representedObject);

        if (representedObject instanceof WebInspector.LegacyJavaScriptProfileObject) return new WebInspector.LegacyJavaScriptProfileView(representedObject);

        if (representedObject instanceof WebInspector.ContentFlow) return new WebInspector.ContentFlowDOMTreeContentView(representedObject);

        if (typeof representedObject === "string" || representedObject instanceof String) return new WebInspector.TextContentView(representedObject);

        console.assert(!WebInspector.ContentView.isViewable(representedObject));

        throw "Can't make a ContentView for an unknown representedObject.";
    }

    // Concrete object instantiation.
    console.assert(this.constructor !== WebInspector.ContentView && this instanceof WebInspector.ContentView);
    console.assert(WebInspector.ContentView.isViewable(representedObject));

    WebInspector.Object.call(this);

    this._representedObject = representedObject;

    this._element = document.createElement("div");
    this._element.classList.add(WebInspector.ContentView.StyleClassName);

    this._parentContainer = null;
};

WebInspector.Object.addConstructorFunctions(WebInspector.ContentView);

WebInspector.ContentView.isViewable = function (representedObject) {
    if (representedObject instanceof WebInspector.Frame) return true;
    if (representedObject instanceof WebInspector.Resource) return true;
    if (representedObject instanceof WebInspector.Script) return true;
    if (representedObject instanceof WebInspector.TimelineRecording) return true;
    if (representedObject instanceof WebInspector.DOMStorageObject) return true;
    if (representedObject instanceof WebInspector.CookieStorageObject) return true;
    if (representedObject instanceof WebInspector.DatabaseTableObject) return true;
    if (representedObject instanceof WebInspector.DatabaseObject) return true;
    if (representedObject instanceof WebInspector.IndexedDatabaseObjectStore) return true;
    if (representedObject instanceof WebInspector.IndexedDatabaseObjectStoreIndex) return true;
    if (representedObject instanceof WebInspector.ApplicationCacheFrame) return true;
    if (representedObject instanceof WebInspector.DOMTree) return true;
    if (representedObject instanceof WebInspector.LogObject) return true;
    if (representedObject instanceof WebInspector.LegacyJavaScriptProfileObject) return true;
    if (representedObject instanceof WebInspector.ContentFlow) return true;
    if (typeof representedObject === "string" || representedObject instanceof String) return true;
    return false;
};

WebInspector.ContentView.StyleClassName = "content-view";

WebInspector.ContentView.Event = {
    SelectionPathComponentsDidChange: "content-view-selection-path-components-did-change",
    SupplementalRepresentedObjectsDidChange: "content-view-supplemental-represented-objects-did-change",
    NumberOfSearchResultsDidChange: "content-view-number-of-search-results-did-change",
    NavigationItemsDidChange: "content-view-navigation-items-did-change"
};

WebInspector.ContentView.prototype = Object.defineProperties({
    constructor: WebInspector.ContentView,

    updateLayout: function updateLayout() {
        // Implemented by subclasses.
    },

    shown: function shown() {
        // Implemented by subclasses.
    },

    hidden: function hidden() {
        // Implemented by subclasses.
    },

    closed: function closed() {
        // Implemented by subclasses.
    },

    saveToCookie: function saveToCookie(cookie) {
        // Implemented by subclasses.
    },

    restoreFromCookie: function restoreFromCookie(cookie) {
        // Implemented by subclasses.
    },

    canGoBack: function canGoBack() {
        // Implemented by subclasses.
        return false;
    },

    canGoForward: function canGoForward() {
        // Implemented by subclasses.
        return false;
    },

    goBack: function goBack() {
        // Implemented by subclasses.
    },

    goForward: function goForward() {
        // Implemented by subclasses.
    },

    // Implemented by subclasses.

    performSearch: function performSearch(query) {
        // Implemented by subclasses.
    },

    searchCleared: function searchCleared() {
        // Implemented by subclasses.
    },

    searchQueryWithSelection: function searchQueryWithSelection() {
        // Implemented by subclasses.
        return null;
    },

    revealPreviousSearchResult: function revealPreviousSearchResult(changeFocus) {
        // Implemented by subclasses.
    },

    revealNextSearchResult: function revealNextSearchResult(changeFocus) {
        // Implemented by subclasses.
    }
}, {
    representedObject: { // Public

        get: function get() {
            return this._representedObject;
        },
        configurable: true,
        enumerable: true
    },
    navigationItems: {
        get: function get() {
            // Navigation items that will be displayed by the ContentBrowser instance,
            // meant to be subclassed. Implemented by subclasses.
            return [];
        },
        configurable: true,
        enumerable: true
    },
    allowedNavigationSidebarPanels: {
        get: function get() {
            // Allow any navigation sidebar panel.
            return [];
        },
        configurable: true,
        enumerable: true
    },
    element: {
        get: function get() {
            return this._element;
        },
        configurable: true,
        enumerable: true
    },
    parentContainer: {
        get: function get() {
            return this._parentContainer;
        },
        configurable: true,
        enumerable: true
    },
    visible: {
        get: function get() {
            return this._visible;
        },
        set: function set(flag) {
            this._visible = flag;
        },
        configurable: true,
        enumerable: true
    },
    scrollableElements: {
        get: function get() {
            // Implemented by subclasses.
            return [];
        },
        configurable: true,
        enumerable: true
    },
    shouldKeepElementsScrolledToBottom: {
        get: function get() {
            // Implemented by subclasses.
            return false;
        },
        configurable: true,
        enumerable: true
    },
    selectionPathComponents: {
        get: function get() {
            // Implemented by subclasses.
            return [];
        },
        configurable: true,
        enumerable: true
    },
    supplementalRepresentedObjects: {
        get: function get() {
            // Implemented by subclasses.
            return [];
        },
        configurable: true,
        enumerable: true
    },
    supportsSplitContentBrowser: {
        get: function get() {
            // Implemented by subclasses.
            return true;
        },
        configurable: true,
        enumerable: true
    },
    supportsSearch: {
        get: function get() {
            // Implemented by subclasses.
            return false;
        },
        configurable: true,
        enumerable: true
    },
    numberOfSearchResults: {
        get: function get() {
            // Implemented by subclasses.
            return null;
        },
        configurable: true,
        enumerable: true
    },
    hasPerformedSearch: {
        get: function get() {
            // Implemented by subclasses.
            return false;
        },
        configurable: true,
        enumerable: true
    },
    automaticallyRevealFirstSearchResult: {
        set: function set(reveal) {},
        configurable: true,
        enumerable: true
    }
});

WebInspector.ContentView.prototype.__proto__ = WebInspector.Object.prototype;
