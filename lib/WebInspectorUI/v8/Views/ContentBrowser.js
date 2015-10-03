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

WebInspector.ContentBrowser = function (element, delegate, disableBackForward) {
    WebInspector.Object.call(this);

    this._element = element || document.createElement("div");
    this._element.classList.add(WebInspector.ContentBrowser.StyleClassName);

    this._navigationBar = new WebInspector.NavigationBar();
    this._element.appendChild(this._navigationBar.element);

    this._contentViewContainer = new WebInspector.ContentViewContainer();
    this._contentViewContainer.addEventListener(WebInspector.ContentViewContainer.Event.CurrentContentViewDidChange, this._currentContentViewDidChange, this);
    this._element.appendChild(this._contentViewContainer.element);

    this._findBanner = new WebInspector.FindBanner(this);
    this._findKeyboardShortcut = new WebInspector.KeyboardShortcut(WebInspector.KeyboardShortcut.Modifier.CommandOrControl, "F", this._showFindBanner.bind(this));
    this._findBanner.addEventListener(WebInspector.FindBanner.Event.DidShow, this._findBannerDidShow, this);
    this._findBanner.addEventListener(WebInspector.FindBanner.Event.DidHide, this._findBannerDidHide, this);

    this._saveKeyboardShortcut = new WebInspector.KeyboardShortcut(WebInspector.KeyboardShortcut.Modifier.CommandOrControl, "S", this._save.bind(this));
    this._saveAsKeyboardShortcut = new WebInspector.KeyboardShortcut(WebInspector.KeyboardShortcut.Modifier.Shift | WebInspector.KeyboardShortcut.Modifier.CommandOrControl, "S", this._saveAs.bind(this));

    if (!disableBackForward) {
        this._backKeyboardShortcut = new WebInspector.KeyboardShortcut(WebInspector.KeyboardShortcut.Modifier.CommandOrControl | WebInspector.KeyboardShortcut.Modifier.Control, WebInspector.KeyboardShortcut.Key.Left, this._backButtonClicked.bind(this));
        this._forwardKeyboardShortcut = new WebInspector.KeyboardShortcut(WebInspector.KeyboardShortcut.Modifier.CommandOrControl | WebInspector.KeyboardShortcut.Modifier.Control, WebInspector.KeyboardShortcut.Key.Right, this._forwardButtonClicked.bind(this));

        var forwardArrow, backArrow;
        if (WebInspector.Platform.isLegacyMacOS) {
            forwardArrow = { src: "Images/Legacy/ForwardArrow.svg", width: 9, height: 9 };
            backArrow = { src: "Images/Legacy/BackArrow.svg", width: 9, height: 9 };
        } else {
            forwardArrow = { src: "Images/ForwardArrow.svg", width: 8, height: 13 };
            backArrow = { src: "Images/BackArrow.svg", width: 8, height: 13 };
        }

        this._backButtonNavigationItem = new WebInspector.ButtonNavigationItem("back", WebInspector.UIString("Back (%s)").format(this._backKeyboardShortcut.displayName), backArrow.src, backArrow.width, backArrow.height);
        this._backButtonNavigationItem.addEventListener(WebInspector.ButtonNavigationItem.Event.Clicked, this._backButtonClicked, this);
        this._backButtonNavigationItem.enabled = false;
        this._navigationBar.addNavigationItem(this._backButtonNavigationItem);

        this._forwardButtonNavigationItem = new WebInspector.ButtonNavigationItem("forward", WebInspector.UIString("Forward (%s)").format(this._forwardKeyboardShortcut.displayName), forwardArrow.src, forwardArrow.width, forwardArrow.height);
        this._forwardButtonNavigationItem.addEventListener(WebInspector.ButtonNavigationItem.Event.Clicked, this._forwardButtonClicked, this);
        this._forwardButtonNavigationItem.enabled = false;
        this._navigationBar.addNavigationItem(this._forwardButtonNavigationItem);

        this._navigationBar.addNavigationItem(new WebInspector.DividerNavigationItem());
    }

    this._hierarchicalPathNavigationItem = new WebInspector.HierarchicalPathNavigationItem();
    this._hierarchicalPathNavigationItem.addEventListener(WebInspector.HierarchicalPathNavigationItem.Event.PathComponentWasSelected, this._hierarchicalPathComponentWasSelected, this);
    this._navigationBar.addNavigationItem(this._hierarchicalPathNavigationItem);

    this._contentViewSelectionPathNavigationItem = new WebInspector.HierarchicalPathNavigationItem();

    this._navigationBar.addNavigationItem(new WebInspector.FlexibleSpaceNavigationItem());

    WebInspector.ContentView.addEventListener(WebInspector.ContentView.Event.SelectionPathComponentsDidChange, this._contentViewSelectionPathComponentDidChange, this);
    WebInspector.ContentView.addEventListener(WebInspector.ContentView.Event.SupplementalRepresentedObjectsDidChange, this._contentViewSupplementalRepresentedObjectsDidChange, this);
    WebInspector.ContentView.addEventListener(WebInspector.ContentView.Event.NumberOfSearchResultsDidChange, this._contentViewNumberOfSearchResultsDidChange, this);
    WebInspector.ContentView.addEventListener(WebInspector.ContentView.Event.NavigationItemsDidChange, this._contentViewNavigationItemsDidChange, this);

    this._delegate = delegate || null;

    this._currentContentViewNavigationItems = [];
};

WebInspector.Object.addConstructorFunctions(WebInspector.ContentBrowser);

WebInspector.ContentBrowser.StyleClassName = "content-browser";

WebInspector.ContentBrowser.Event = {
    CurrentRepresentedObjectsDidChange: "content-browser-current-represented-objects-did-change",
    CurrentContentViewDidChange: "content-browser-current-content-view-did-change"
};

WebInspector.ContentBrowser.prototype = Object.defineProperties({
    constructor: WebInspector.ContentBrowser,

    updateLayout: function updateLayout() {
        this._navigationBar.updateLayout();
        this._contentViewContainer.updateLayout();
    },

    showContentViewForRepresentedObject: function showContentViewForRepresentedObject(representedObject, cookie) {
        var contentView = this.contentViewForRepresentedObject(representedObject);
        return this._contentViewContainer.showContentView(contentView, cookie);
    },

    showContentView: function showContentView(contentView, cookie) {
        return this._contentViewContainer.showContentView(contentView, cookie);
    },

    contentViewForRepresentedObject: function contentViewForRepresentedObject(representedObject, onlyExisting) {
        return this._contentViewContainer.contentViewForRepresentedObject(representedObject, onlyExisting);
    },

    canGoBack: function canGoBack() {
        var currentContentView = this.currentContentView;
        if (currentContentView && currentContentView.canGoBack()) return true;
        return this._contentViewContainer.canGoBack();
    },

    canGoForward: function canGoForward() {
        var currentContentView = this.currentContentView;
        if (currentContentView && currentContentView.canGoForward()) return true;
        return this._contentViewContainer.canGoForward();
    },

    goBack: function goBack() {
        var currentContentView = this.currentContentView;
        if (currentContentView && currentContentView.canGoBack()) {
            currentContentView.goBack();
            this._updateBackForwardButtons();
            return;
        }

        this._contentViewContainer.goBack();

        // The _updateBackForwardButtons function is called by _currentContentViewDidChange,
        // so it does not need to be called here.
    },

    goForward: function goForward() {
        var currentContentView = this.currentContentView;
        if (currentContentView && currentContentView.canGoForward()) {
            currentContentView.goForward();
            this._updateBackForwardButtons();
            return;
        }

        this._contentViewContainer.goForward();

        // The _updateBackForwardButtons function is called by _currentContentViewDidChange,
        // so it does not need to be called here.
    },

    findBannerPerformSearch: function findBannerPerformSearch(findBanner, query) {
        var currentContentView = this.currentContentView;
        if (!currentContentView || !currentContentView.supportsSearch) return;

        currentContentView.performSearch(query);
    },

    findBannerSearchCleared: function findBannerSearchCleared(findBanner) {
        var currentContentView = this.currentContentView;
        if (!currentContentView || !currentContentView.supportsSearch) return;

        currentContentView.searchCleared();
    },

    findBannerSearchQueryForSelection: function findBannerSearchQueryForSelection(findBanner) {
        var currentContentView = this.currentContentView;
        if (!currentContentView || !currentContentView.supportsSearch) return null;

        return currentContentView.searchQueryWithSelection();
    },

    findBannerRevealPreviousResult: function findBannerRevealPreviousResult(findBanner) {
        var currentContentView = this.currentContentView;
        if (!currentContentView || !currentContentView.supportsSearch) return;

        currentContentView.revealPreviousSearchResult(!findBanner.showing);
    },

    findBannerRevealNextResult: function findBannerRevealNextResult(findBanner) {
        var currentContentView = this.currentContentView;
        if (!currentContentView || !currentContentView.supportsSearch) return;

        currentContentView.revealNextSearchResult(!findBanner.showing);
    },

    // Private

    _backButtonClicked: function _backButtonClicked(event) {
        this.goBack();
    },

    _forwardButtonClicked: function _forwardButtonClicked(event) {
        this.goForward();
    },

    _saveDataToFile: function _saveDataToFile(saveData, forceSaveAs) {
        console.assert(saveData);
        if (!saveData) return;

        if (typeof saveData.customSaveHandler === "function") {
            saveData.customSaveHandler(forceSaveAs);
            return;
        }

        console.assert(saveData.url);
        console.assert(typeof saveData.content === "string");
        if (!saveData.url || typeof saveData.content !== "string") return;

        InspectorFrontendHost.save(saveData.url, saveData.content, false, forceSaveAs || saveData.forceSaveAs);
    },

    _save: function _save(event) {
        var currentContentView = this.currentContentView;
        if (!currentContentView || !currentContentView.supportsSave) return;

        this._saveDataToFile(currentContentView.saveData);
    },

    _saveAs: function _saveAs(event) {
        var currentContentView = this.currentContentView;
        if (!currentContentView || !currentContentView.supportsSave) return;

        this._saveDataToFile(currentContentView.saveData, true);
    },

    _showFindBanner: function _showFindBanner(event) {
        var currentContentView = this.currentContentView;
        if (!currentContentView || !currentContentView.supportsSearch) return;

        this._findBanner.show();
    },

    _findBannerDidShow: function _findBannerDidShow(event) {
        var currentContentView = this.currentContentView;
        if (!currentContentView || !currentContentView.supportsSearch) return;

        currentContentView.automaticallyRevealFirstSearchResult = true;
    },

    _findBannerDidHide: function _findBannerDidHide(event) {
        var currentContentView = this.currentContentView;
        if (!currentContentView || !currentContentView.supportsSearch) return;

        currentContentView.automaticallyRevealFirstSearchResult = false;
    },

    _contentViewNumberOfSearchResultsDidChange: function _contentViewNumberOfSearchResultsDidChange(event) {
        if (event.target !== this.currentContentView) return;

        this._findBanner.numberOfResults = this.currentContentView.numberOfSearchResults;
    },

    _updateHierarchicalPathNavigationItem: function _updateHierarchicalPathNavigationItem(representedObject) {
        if (!this.delegate || typeof this.delegate.contentBrowserTreeElementForRepresentedObject !== "function") return;

        var treeElement = representedObject ? this.delegate.contentBrowserTreeElementForRepresentedObject(this, representedObject) : null;
        var pathComponents = [];

        while (treeElement && !treeElement.root) {
            var pathComponent = new WebInspector.GeneralTreeElementPathComponent(treeElement);
            pathComponents.unshift(pathComponent);
            treeElement = treeElement.parent;
        }

        this._hierarchicalPathNavigationItem.components = pathComponents;
    },

    _updateContentViewSelectionPathNavigationItem: function _updateContentViewSelectionPathNavigationItem(contentView) {
        var selectionPathComponents = contentView ? contentView.selectionPathComponents || [] : [];
        this._contentViewSelectionPathNavigationItem.components = selectionPathComponents;

        if (!selectionPathComponents.length) {
            this._hierarchicalPathNavigationItem.alwaysShowLastPathComponentSeparator = false;
            this._navigationBar.removeNavigationItem(this._contentViewSelectionPathNavigationItem);
            return;
        }

        // Insert the _contentViewSelectionPathNavigationItem after the _hierarchicalPathNavigationItem, if needed.
        if (!this._navigationBar.navigationItems.contains(this._contentViewSelectionPathNavigationItem)) {
            var hierarchicalPathItemIndex = this._navigationBar.navigationItems.indexOf(this._hierarchicalPathNavigationItem);
            console.assert(hierarchicalPathItemIndex !== -1);
            this._navigationBar.insertNavigationItem(this._contentViewSelectionPathNavigationItem, hierarchicalPathItemIndex + 1);
            this._hierarchicalPathNavigationItem.alwaysShowLastPathComponentSeparator = true;
        }
    },

    _updateBackForwardButtons: function _updateBackForwardButtons() {
        if (!this._backButtonNavigationItem || !this._forwardButtonNavigationItem) return;

        this._backButtonNavigationItem.enabled = this.canGoBack();
        this._forwardButtonNavigationItem.enabled = this.canGoForward();
    },

    _updateContentViewNavigationItems: function _updateContentViewNavigationItems() {
        var navigationBar = this.navigationBar;

        // First, we remove the navigation items added by the previous content view.
        this._currentContentViewNavigationItems.forEach(function (navigationItem) {
            navigationBar.removeNavigationItem(navigationItem);
        });

        var currentContentView = this.currentContentView;
        if (!currentContentView) {
            this._currentContentViewNavigationItems = [];
            return;
        }

        var insertionIndex = navigationBar.navigationItems.length;
        console.assert(insertionIndex >= 0);

        // Keep track of items we'll be adding to the navigation bar.
        var newNavigationItems = [];

        // Go through each of the items of the new content view and add a divider before them.
        currentContentView.navigationItems.forEach(function (navigationItem, index) {
            // Add dividers before items unless it's the first item and not a button.
            if (index !== 0 || navigationItem instanceof WebInspector.ButtonNavigationItem) {
                var divider = new WebInspector.DividerNavigationItem();
                navigationBar.insertNavigationItem(divider, insertionIndex++);
                newNavigationItems.push(divider);
            }
            navigationBar.insertNavigationItem(navigationItem, insertionIndex++);
            newNavigationItems.push(navigationItem);
        });

        // Remember the navigation items we inserted so we can remove them
        // for the next content view.
        this._currentContentViewNavigationItems = newNavigationItems;
    },

    _updateFindBanner: function _updateFindBanner(currentContentView) {
        if (!currentContentView) {
            this._findBanner.targetElement = null;
            this._findBanner.numberOfResults = null;
            return;
        }

        this._findBanner.targetElement = currentContentView.element;
        this._findBanner.numberOfResults = currentContentView.hasPerformedSearch ? currentContentView.numberOfSearchResults : null;

        if (currentContentView.supportsSearch && this._findBanner.searchQuery) {
            currentContentView.automaticallyRevealFirstSearchResult = this._findBanner.showing;
            currentContentView.performSearch(this._findBanner.searchQuery);
        }
    },

    _dispatchCurrentRepresentedObjectsDidChangeEventSoon: function _dispatchCurrentRepresentedObjectsDidChangeEventSoon() {
        if (this._currentRepresentedObjectsDidChangeTimeout) return;
        this._currentRepresentedObjectsDidChangeTimeout = setTimeout(this._dispatchCurrentRepresentedObjectsDidChangeEvent.bind(this), 0);
    },

    _dispatchCurrentRepresentedObjectsDidChangeEvent: function _dispatchCurrentRepresentedObjectsDidChangeEvent() {
        if (this._currentRepresentedObjectsDidChangeTimeout) {
            clearTimeout(this._currentRepresentedObjectsDidChangeTimeout);
            delete this._currentRepresentedObjectsDidChangeTimeout;
        }

        this.dispatchEventToListeners(WebInspector.ContentBrowser.Event.CurrentRepresentedObjectsDidChange);
    },

    _contentViewSelectionPathComponentDidChange: function _contentViewSelectionPathComponentDidChange(event) {
        if (event.target !== this.currentContentView) return;

        this._updateContentViewSelectionPathNavigationItem(event.target);
        this._updateBackForwardButtons();

        this._updateContentViewNavigationItems();

        this._navigationBar.updateLayout();

        this._dispatchCurrentRepresentedObjectsDidChangeEventSoon();
    },

    _contentViewSupplementalRepresentedObjectsDidChange: function _contentViewSupplementalRepresentedObjectsDidChange(event) {
        if (event.target !== this.currentContentView) return;

        this._dispatchCurrentRepresentedObjectsDidChangeEventSoon();
    },

    _currentContentViewDidChange: function _currentContentViewDidChange(event) {
        var currentContentView = this.currentContentView;

        this._updateHierarchicalPathNavigationItem(currentContentView ? currentContentView.representedObject : null);
        this._updateContentViewSelectionPathNavigationItem(currentContentView);
        this._updateBackForwardButtons();

        this._updateContentViewNavigationItems();
        this._updateFindBanner(currentContentView);

        this._navigationBar.updateLayout();

        this.dispatchEventToListeners(WebInspector.ContentBrowser.Event.CurrentContentViewDidChange);

        this._dispatchCurrentRepresentedObjectsDidChangeEvent();
    },

    _contentViewNavigationItemsDidChange: function _contentViewNavigationItemsDidChange(event) {
        if (event.target !== this.currentContentView) return;

        this._updateContentViewNavigationItems();
        this._navigationBar.updateLayout();
    },

    _hierarchicalPathComponentWasSelected: function _hierarchicalPathComponentWasSelected(event) {
        console.assert(event.data.pathComponent instanceof WebInspector.GeneralTreeElementPathComponent);

        var treeElement = event.data.pathComponent.generalTreeElement;
        var originalTreeElement = treeElement;

        // Some tree elements (like folders) are not viewable. Find the first descendant that is viewable.
        while (treeElement && !WebInspector.ContentView.isViewable(treeElement.representedObject)) treeElement = treeElement.traverseNextTreeElement(false, originalTreeElement, false);

        if (!treeElement) return;

        this.showContentViewForRepresentedObject(treeElement.representedObject);
    }
}, {
    element: { // Public

        get: function get() {
            return this._element;
        },
        configurable: true,
        enumerable: true
    },
    navigationBar: {
        get: function get() {
            return this._navigationBar;
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
    delegate: {
        get: function get() {
            return this._delegate;
        },
        set: function set(newDelegate) {
            this._delegate = newDelegate || null;
        },
        configurable: true,
        enumerable: true
    },
    currentContentView: {
        get: function get() {
            return this._contentViewContainer.currentContentView;
        },
        configurable: true,
        enumerable: true
    },
    currentRepresentedObjects: {
        get: function get() {
            var representedObjects = [];

            var lastComponent = this._hierarchicalPathNavigationItem.lastComponent;
            if (lastComponent && lastComponent.representedObject) representedObjects.push(lastComponent.representedObject);

            lastComponent = this._contentViewSelectionPathNavigationItem.lastComponent;
            if (lastComponent && lastComponent.representedObject) representedObjects.push(lastComponent.representedObject);

            var currentContentView = this.currentContentView;
            if (currentContentView) {
                var supplementalRepresentedObjects = currentContentView.supplementalRepresentedObjects;
                if (supplementalRepresentedObjects && supplementalRepresentedObjects.length) representedObjects = representedObjects.concat(supplementalRepresentedObjects);
            }

            return representedObjects;
        },
        configurable: true,
        enumerable: true
    }
});

WebInspector.ContentBrowser.prototype.__proto__ = WebInspector.Object.prototype;
