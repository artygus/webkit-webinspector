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

WebInspector.ClusterContentView = (function (_WebInspector$ContentView) {
    _inherits(ClusterContentView, _WebInspector$ContentView);

    function ClusterContentView(representedObject) {
        _classCallCheck(this, ClusterContentView);

        _get(Object.getPrototypeOf(ClusterContentView.prototype), "constructor", this).call(this, representedObject);

        this.element.classList.add("cluster");

        this._contentViewContainer = new WebInspector.ContentViewContainer();
        this._contentViewContainer.addEventListener(WebInspector.ContentViewContainer.Event.CurrentContentViewDidChange, this._currentContentViewDidChange, this);
        this.element.appendChild(this._contentViewContainer.element);

        WebInspector.ContentView.addEventListener(WebInspector.ContentView.Event.SelectionPathComponentsDidChange, this._contentViewSelectionPathComponentDidChange, this);
        WebInspector.ContentView.addEventListener(WebInspector.ContentView.Event.SupplementalRepresentedObjectsDidChange, this._contentViewSupplementalRepresentedObjectsDidChange, this);
        WebInspector.ContentView.addEventListener(WebInspector.ContentView.Event.NumberOfSearchResultsDidChange, this._contentViewNumberOfSearchResultsDidChange, this);
    }

    // Public

    _createClass(ClusterContentView, [{
        key: "updateLayout",
        value: function updateLayout() {
            this._contentViewContainer.updateLayout();
        }
    }, {
        key: "shown",
        value: function shown() {
            this._contentViewContainer.shown();
        }
    }, {
        key: "hidden",
        value: function hidden() {
            this._contentViewContainer.hidden();
        }
    }, {
        key: "closed",
        value: function closed() {
            this._contentViewContainer.closeAllContentViews();

            WebInspector.ContentView.removeEventListener(null, null, this);
        }
    }, {
        key: "canGoBack",
        value: function canGoBack() {
            return this._contentViewContainer.canGoBack();
        }
    }, {
        key: "canGoForward",
        value: function canGoForward() {
            return this._contentViewContainer.canGoForward();
        }
    }, {
        key: "goBack",
        value: function goBack() {
            this._contentViewContainer.goBack();
        }
    }, {
        key: "goForward",
        value: function goForward() {
            this._contentViewContainer.goForward();
        }
    }, {
        key: "performSearch",
        value: function performSearch(query) {
            this._searchQuery = query;

            var currentContentView = this._contentViewContainer.currentContentView;
            if (!currentContentView || !currentContentView.supportsSearch) return;
            currentContentView.performSearch(query);
        }
    }, {
        key: "searchCleared",
        value: function searchCleared() {
            this._searchQuery = null;

            var currentContentView = this._contentViewContainer.currentContentView;
            if (!currentContentView || !currentContentView.supportsSearch) return;
            currentContentView.searchCleared();
        }
    }, {
        key: "searchQueryWithSelection",
        value: function searchQueryWithSelection() {
            var currentContentView = this._contentViewContainer.currentContentView;
            if (!currentContentView || !currentContentView.supportsSearch) return null;
            return currentContentView.searchQueryWithSelection();
        }
    }, {
        key: "revealPreviousSearchResult",
        value: function revealPreviousSearchResult(changeFocus) {
            var currentContentView = this._contentViewContainer.currentContentView;
            if (!currentContentView || !currentContentView.supportsSearch) return;
            currentContentView.revealPreviousSearchResult(changeFocus);
        }
    }, {
        key: "revealNextSearchResult",
        value: function revealNextSearchResult(changeFocus) {
            var currentContentView = this._contentViewContainer.currentContentView;
            if (!currentContentView || !currentContentView.supportsSearch) return;
            currentContentView.revealNextSearchResult(changeFocus);
        }

        // Private

    }, {
        key: "_currentContentViewDidChange",
        value: function _currentContentViewDidChange(event) {
            var currentContentView = this._contentViewContainer.currentContentView;
            if (currentContentView && currentContentView.supportsSearch) {
                if (this._searchQuery) currentContentView.performSearch(this._searchQuery);else currentContentView.searchCleared();
            }

            this.dispatchEventToListeners(WebInspector.ContentView.Event.SelectionPathComponentsDidChange);
            this.dispatchEventToListeners(WebInspector.ContentView.Event.NumberOfSearchResultsDidChange);
            this.dispatchEventToListeners(WebInspector.ContentView.Event.NavigationItemsDidChange);
        }
    }, {
        key: "_contentViewSelectionPathComponentDidChange",
        value: function _contentViewSelectionPathComponentDidChange(event) {
            if (event.target !== this._contentViewContainer.currentContentView) return;
            this.dispatchEventToListeners(WebInspector.ContentView.Event.SelectionPathComponentsDidChange);
        }
    }, {
        key: "_contentViewSupplementalRepresentedObjectsDidChange",
        value: function _contentViewSupplementalRepresentedObjectsDidChange(event) {
            if (event.target !== this._contentViewContainer.currentContentView) return;
            this.dispatchEventToListeners(WebInspector.ContentView.Event.SupplementalRepresentedObjectsDidChange);
        }
    }, {
        key: "_contentViewNumberOfSearchResultsDidChange",
        value: function _contentViewNumberOfSearchResultsDidChange(event) {
            if (event.target !== this._contentViewContainer.currentContentView) return;
            this.dispatchEventToListeners(WebInspector.ContentView.Event.NumberOfSearchResultsDidChange);
        }
    }, {
        key: "navigationItems",
        get: function get() {
            var currentContentView = this._contentViewContainer.currentContentView;
            return currentContentView ? currentContentView.navigationItems : [];
        }
    }, {
        key: "contentViewContainer",
        get: function get() {
            return this._contentViewContainer;
        }
    }, {
        key: "supportsSplitContentBrowser",
        get: function get() {
            if (this._contentViewContainer.currentContentView) return this._contentViewContainer.currentContentView.supportsSplitContentBrowser;
            return true;
        }
    }, {
        key: "selectionPathComponents",
        get: function get() {
            if (!this._contentViewContainer.currentContentView) return [];
            return this._contentViewContainer.currentContentView.selectionPathComponents;
        }
    }, {
        key: "supplementalRepresentedObjects",
        get: function get() {
            if (!this._contentViewContainer.currentContentView) return [];
            return this._contentViewContainer.currentContentView.supplementalRepresentedObjects;
        }
    }, {
        key: "handleCopyEvent",
        get: function get() {
            var currentContentView = this._contentViewContainer.currentContentView;
            return currentContentView && typeof currentContentView.handleCopyEvent === "function" ? currentContentView.handleCopyEvent.bind(currentContentView) : null;
        }
    }, {
        key: "supportsSave",
        get: function get() {
            var currentContentView = this._contentViewContainer.currentContentView;
            return currentContentView && currentContentView.supportsSave;
        }
    }, {
        key: "saveData",
        get: function get() {
            var currentContentView = this._contentViewContainer.currentContentView;
            return currentContentView && currentContentView.saveData || null;
        }
    }, {
        key: "supportsSearch",
        get: function get() {
            // Always return true so we can intercept the search query to resend it when switching content views.
            return true;
        }
    }, {
        key: "numberOfSearchResults",
        get: function get() {
            var currentContentView = this._contentViewContainer.currentContentView;
            if (!currentContentView || !currentContentView.supportsSearch) return null;
            return currentContentView.numberOfSearchResults;
        }
    }, {
        key: "hasPerformedSearch",
        get: function get() {
            var currentContentView = this._contentViewContainer.currentContentView;
            if (!currentContentView || !currentContentView.supportsSearch) return false;
            return currentContentView.hasPerformedSearch;
        }
    }, {
        key: "automaticallyRevealFirstSearchResult",
        set: function set(reveal) {
            var currentContentView = this._contentViewContainer.currentContentView;
            if (!currentContentView || !currentContentView.supportsSearch) return;
            currentContentView.automaticallyRevealFirstSearchResult = reveal;
        }
    }]);

    return ClusterContentView;
})(WebInspector.ContentView);
