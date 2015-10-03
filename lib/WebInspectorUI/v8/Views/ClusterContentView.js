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

WebInspector.ClusterContentView = function (representedObject) {
    WebInspector.ContentView.call(this, representedObject);

    this.element.classList.add(WebInspector.ClusterContentView.StyleClassName);

    this._contentViewContainer = new WebInspector.ContentViewContainer();
    this._contentViewContainer.addEventListener(WebInspector.ContentViewContainer.Event.CurrentContentViewDidChange, this._currentContentViewDidChange, this);
    this.element.appendChild(this._contentViewContainer.element);

    WebInspector.ContentView.addEventListener(WebInspector.ContentView.Event.SelectionPathComponentsDidChange, this._contentViewSelectionPathComponentDidChange, this);
    WebInspector.ContentView.addEventListener(WebInspector.ContentView.Event.SupplementalRepresentedObjectsDidChange, this._contentViewSupplementalRepresentedObjectsDidChange, this);
    WebInspector.ContentView.addEventListener(WebInspector.ContentView.Event.NumberOfSearchResultsDidChange, this._contentViewNumberOfSearchResultsDidChange, this);
};

WebInspector.ClusterContentView.StyleClassName = "cluster";

WebInspector.ClusterContentView.prototype = Object.defineProperties({
    constructor: WebInspector.ClusterContentView,

    updateLayout: function updateLayout() {
        var currentContentView = this._contentViewContainer.currentContentView;
        if (currentContentView) currentContentView.updateLayout();
    },

    shown: function shown() {
        this._contentViewContainer.shown();
    },

    hidden: function hidden() {
        this._contentViewContainer.hidden();
    },

    closed: function closed() {
        this._contentViewContainer.closeAllContentViews();

        WebInspector.ContentView.removeEventListener(WebInspector.ContentView.Event.SelectionPathComponentsDidChange, this._contentViewSelectionPathComponentDidChange, this);
        WebInspector.ContentView.removeEventListener(WebInspector.ContentView.Event.SupplementalRepresentedObjectsDidChange, this._contentViewSupplementalRepresentedObjectsDidChange, this);
        WebInspector.ContentView.removeEventListener(WebInspector.ContentView.Event.NumberOfSearchResultsDidChange, this._contentViewNumberOfSearchResultsDidChange, this);
    },

    canGoBack: function canGoBack() {
        return this._contentViewContainer.canGoBack();
    },

    canGoForward: function canGoForward() {
        return this._contentViewContainer.canGoForward();
    },

    goBack: function goBack() {
        this._contentViewContainer.goBack();
    },

    goForward: function goForward() {
        this._contentViewContainer.goForward();
    },

    performSearch: function performSearch(query) {
        this._searchQuery = query;

        var currentContentView = this._contentViewContainer.currentContentView;
        if (!currentContentView || !currentContentView.supportsSearch) return;
        currentContentView.performSearch(query);
    },

    searchCleared: function searchCleared() {
        this._searchQuery = null;

        var currentContentView = this._contentViewContainer.currentContentView;
        if (!currentContentView || !currentContentView.supportsSearch) return;
        currentContentView.searchCleared();
    },

    searchQueryWithSelection: function searchQueryWithSelection() {
        var currentContentView = this._contentViewContainer.currentContentView;
        if (!currentContentView || !currentContentView.supportsSearch) return null;
        return currentContentView.searchQueryWithSelection();
    },

    revealPreviousSearchResult: function revealPreviousSearchResult(changeFocus) {
        var currentContentView = this._contentViewContainer.currentContentView;
        if (!currentContentView || !currentContentView.supportsSearch) return;
        currentContentView.revealPreviousSearchResult(changeFocus);
    },

    revealNextSearchResult: function revealNextSearchResult(changeFocus) {
        var currentContentView = this._contentViewContainer.currentContentView;
        if (!currentContentView || !currentContentView.supportsSearch) return;
        currentContentView.revealNextSearchResult(changeFocus);
    },

    // Private

    _currentContentViewDidChange: function _currentContentViewDidChange(event) {
        var currentContentView = this._contentViewContainer.currentContentView;
        if (currentContentView && currentContentView.supportsSearch) {
            if (this._searchQuery) currentContentView.performSearch(this._searchQuery);else currentContentView.searchCleared();
        }

        this.dispatchEventToListeners(WebInspector.ContentView.Event.SelectionPathComponentsDidChange);
        this.dispatchEventToListeners(WebInspector.ContentView.Event.NumberOfSearchResultsDidChange);
        this.dispatchEventToListeners(WebInspector.ContentView.Event.NavigationItemsDidChange);
    },

    _contentViewSelectionPathComponentDidChange: function _contentViewSelectionPathComponentDidChange(event) {
        if (event.target !== this._contentViewContainer.currentContentView) return;
        this.dispatchEventToListeners(WebInspector.ContentView.Event.SelectionPathComponentsDidChange);
    },

    _contentViewSupplementalRepresentedObjectsDidChange: function _contentViewSupplementalRepresentedObjectsDidChange(event) {
        if (event.target !== this._contentViewContainer.currentContentView) return;
        this.dispatchEventToListeners(WebInspector.ContentView.Event.SupplementalRepresentedObjectsDidChange);
    },

    _contentViewNumberOfSearchResultsDidChange: function _contentViewNumberOfSearchResultsDidChange(event) {
        if (event.target !== this._contentViewContainer.currentContentView) return;
        this.dispatchEventToListeners(WebInspector.ContentView.Event.NumberOfSearchResultsDidChange);
    }
}, {
    navigationItems: { // Public

        get: function get() {
            var currentContentView = this._contentViewContainer.currentContentView;
            return currentContentView ? currentContentView.navigationItems : [];
        },
        configurable: true,
        enumerable: true
    },
    contentViewContainer: {
        get: function get() {
            return this._contentViewContainer;
        },
        configurable: true,
        enumerable: true
    },
    supportsSplitContentBrowser: {
        get: function get() {
            if (this._contentViewContainer.currentContentView) return this._contentViewContainer.currentContentView.supportsSplitContentBrowser;
            return true;
        },
        configurable: true,
        enumerable: true
    },
    selectionPathComponents: {
        get: function get() {
            if (!this._contentViewContainer.currentContentView) return [];
            return this._contentViewContainer.currentContentView.selectionPathComponents;
        },
        configurable: true,
        enumerable: true
    },
    supplementalRepresentedObjects: {
        get: function get() {
            if (!this._contentViewContainer.currentContentView) return [];
            return this._contentViewContainer.currentContentView.supplementalRepresentedObjects;
        },
        configurable: true,
        enumerable: true
    },
    handleCopyEvent: {
        get: function get() {
            var currentContentView = this._contentViewContainer.currentContentView;
            return currentContentView && typeof currentContentView.handleCopyEvent === "function" ? currentContentView.handleCopyEvent.bind(currentContentView) : null;
        },
        configurable: true,
        enumerable: true
    },
    supportsSave: {
        get: function get() {
            var currentContentView = this._contentViewContainer.currentContentView;
            return currentContentView && currentContentView.supportsSave;
        },
        configurable: true,
        enumerable: true
    },
    saveData: {
        get: function get() {
            var currentContentView = this._contentViewContainer.currentContentView;
            return currentContentView && currentContentView.saveData || null;
        },
        configurable: true,
        enumerable: true
    },
    supportsSearch: {
        get: function get() {
            // Always return true so we can intercept the search query to resend it when switching content views.
            return true;
        },
        configurable: true,
        enumerable: true
    },
    numberOfSearchResults: {
        get: function get() {
            var currentContentView = this._contentViewContainer.currentContentView;
            if (!currentContentView || !currentContentView.supportsSearch) return null;
            return currentContentView.numberOfSearchResults;
        },
        configurable: true,
        enumerable: true
    },
    hasPerformedSearch: {
        get: function get() {
            var currentContentView = this._contentViewContainer.currentContentView;
            if (!currentContentView || !currentContentView.supportsSearch) return false;
            return currentContentView.hasPerformedSearch;
        },
        configurable: true,
        enumerable: true
    },
    automaticallyRevealFirstSearchResult: {
        set: function set(reveal) {
            var currentContentView = this._contentViewContainer.currentContentView;
            if (!currentContentView || !currentContentView.supportsSearch) return;
            currentContentView.automaticallyRevealFirstSearchResult = reveal;
        },
        configurable: true,
        enumerable: true
    }
});

WebInspector.ClusterContentView.prototype.__proto__ = WebInspector.ContentView.prototype;
