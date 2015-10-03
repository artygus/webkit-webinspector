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

WebInspector.ContentBrowser = (function (_WebInspector$Object) {
    _inherits(ContentBrowser, _WebInspector$Object);

    function ContentBrowser(element, delegate, disableBackForward) {
        _classCallCheck(this, ContentBrowser);

        _get(Object.getPrototypeOf(ContentBrowser.prototype), "constructor", this).call(this);

        this._element = element || document.createElement("div");
        this._element.classList.add("content-browser");

        this._navigationBar = new WebInspector.NavigationBar();
        this._element.appendChild(this._navigationBar.element);

        this._contentViewContainer = new WebInspector.ContentViewContainer();
        this._contentViewContainer.addEventListener(WebInspector.ContentViewContainer.Event.CurrentContentViewDidChange, this._currentContentViewDidChange, this);
        this._element.appendChild(this._contentViewContainer.element);

        this._findBanner = new WebInspector.FindBanner(this);
        this._findBanner.addEventListener(WebInspector.FindBanner.Event.DidShow, this._findBannerDidShow, this);
        this._findBanner.addEventListener(WebInspector.FindBanner.Event.DidHide, this._findBannerDidHide, this);

        if (!disableBackForward) {
            this._backKeyboardShortcut = new WebInspector.KeyboardShortcut(WebInspector.KeyboardShortcut.Modifier.CommandOrControl | WebInspector.KeyboardShortcut.Modifier.Control, WebInspector.KeyboardShortcut.Key.Left, this._backButtonClicked.bind(this), this._element);
            this._forwardKeyboardShortcut = new WebInspector.KeyboardShortcut(WebInspector.KeyboardShortcut.Modifier.CommandOrControl | WebInspector.KeyboardShortcut.Modifier.Control, WebInspector.KeyboardShortcut.Key.Right, this._forwardButtonClicked.bind(this), this._element);

            this._backButtonNavigationItem = new WebInspector.ButtonNavigationItem("back", WebInspector.UIString("Back (%s)").format(this._backKeyboardShortcut.displayName), "Images/BackArrow.svg", 8, 13);
            this._backButtonNavigationItem.addEventListener(WebInspector.ButtonNavigationItem.Event.Clicked, this._backButtonClicked, this);
            this._backButtonNavigationItem.enabled = false;
            this._navigationBar.addNavigationItem(this._backButtonNavigationItem);

            this._forwardButtonNavigationItem = new WebInspector.ButtonNavigationItem("forward", WebInspector.UIString("Forward (%s)").format(this._forwardKeyboardShortcut.displayName), "Images/ForwardArrow.svg", 8, 13);
            this._forwardButtonNavigationItem.addEventListener(WebInspector.ButtonNavigationItem.Event.Clicked, this._forwardButtonClicked, this);
            this._forwardButtonNavigationItem.enabled = false;
            this._navigationBar.addNavigationItem(this._forwardButtonNavigationItem);

            this._navigationBar.addNavigationItem(new WebInspector.DividerNavigationItem());
        }

        this._hierarchicalPathNavigationItem = new WebInspector.HierarchicalPathNavigationItem();
        this._hierarchicalPathNavigationItem.addEventListener(WebInspector.HierarchicalPathNavigationItem.Event.PathComponentWasSelected, this._hierarchicalPathComponentWasSelected, this);
        this._navigationBar.addNavigationItem(this._hierarchicalPathNavigationItem);

        this._contentViewSelectionPathNavigationItem = new WebInspector.HierarchicalPathNavigationItem();

        this._dividingFlexibleSpaceNavigationItem = new WebInspector.FlexibleSpaceNavigationItem();
        this._navigationBar.addNavigationItem(this._dividingFlexibleSpaceNavigationItem);

        WebInspector.ContentView.addEventListener(WebInspector.ContentView.Event.SelectionPathComponentsDidChange, this._contentViewSelectionPathComponentDidChange, this);
        WebInspector.ContentView.addEventListener(WebInspector.ContentView.Event.SupplementalRepresentedObjectsDidChange, this._contentViewSupplementalRepresentedObjectsDidChange, this);
        WebInspector.ContentView.addEventListener(WebInspector.ContentView.Event.NumberOfSearchResultsDidChange, this._contentViewNumberOfSearchResultsDidChange, this);
        WebInspector.ContentView.addEventListener(WebInspector.ContentView.Event.NavigationItemsDidChange, this._contentViewNavigationItemsDidChange, this);

        this._delegate = delegate || null;

        this._currentContentViewNavigationItems = [];
    }

    // Public

    _createClass(ContentBrowser, [{
        key: "updateLayout",
        value: function updateLayout() {
            this._navigationBar.updateLayout();
            this._contentViewContainer.updateLayout();
        }
    }, {
        key: "showContentViewForRepresentedObject",
        value: function showContentViewForRepresentedObject(representedObject, cookie, extraArguments) {
            var contentView = this.contentViewForRepresentedObject(representedObject, false, extraArguments);
            return this._contentViewContainer.showContentView(contentView, cookie);
        }
    }, {
        key: "showContentView",
        value: function showContentView(contentView, cookie) {
            return this._contentViewContainer.showContentView(contentView, cookie);
        }
    }, {
        key: "contentViewForRepresentedObject",
        value: function contentViewForRepresentedObject(representedObject, onlyExisting, extraArguments) {
            return this._contentViewContainer.contentViewForRepresentedObject(representedObject, onlyExisting, extraArguments);
        }
    }, {
        key: "updateHierarchicalPathForCurrentContentView",
        value: function updateHierarchicalPathForCurrentContentView() {
            var currentContentView = this.currentContentView;
            this._updateHierarchicalPathNavigationItem(currentContentView ? currentContentView.representedObject : null);
        }
    }, {
        key: "canGoBack",
        value: function canGoBack() {
            var currentContentView = this.currentContentView;
            if (currentContentView && currentContentView.canGoBack()) return true;
            return this._contentViewContainer.canGoBack();
        }
    }, {
        key: "canGoForward",
        value: function canGoForward() {
            var currentContentView = this.currentContentView;
            if (currentContentView && currentContentView.canGoForward()) return true;
            return this._contentViewContainer.canGoForward();
        }
    }, {
        key: "goBack",
        value: function goBack() {
            var currentContentView = this.currentContentView;
            if (currentContentView && currentContentView.canGoBack()) {
                currentContentView.goBack();
                this._updateBackForwardButtons();
                return;
            }

            this._contentViewContainer.goBack();

            // The _updateBackForwardButtons function is called by _currentContentViewDidChange,
            // so it does not need to be called here.
        }
    }, {
        key: "goForward",
        value: function goForward() {
            var currentContentView = this.currentContentView;
            if (currentContentView && currentContentView.canGoForward()) {
                currentContentView.goForward();
                this._updateBackForwardButtons();
                return;
            }

            this._contentViewContainer.goForward();

            // The _updateBackForwardButtons function is called by _currentContentViewDidChange,
            // so it does not need to be called here.
        }
    }, {
        key: "handleFindEvent",
        value: function handleFindEvent(event) {
            var currentContentView = this.currentContentView;
            if (!currentContentView || !currentContentView.supportsSearch) return;

            // LogContentView has custom search handling.
            if (typeof currentContentView.handleFindEvent === "function") {
                currentContentView.handleFindEvent(event);
                return;
            }

            this._findBanner.show();
        }
    }, {
        key: "findBannerPerformSearch",
        value: function findBannerPerformSearch(findBanner, query) {
            var currentContentView = this.currentContentView;
            if (!currentContentView || !currentContentView.supportsSearch) return;

            currentContentView.performSearch(query);
        }
    }, {
        key: "findBannerSearchCleared",
        value: function findBannerSearchCleared(findBanner) {
            var currentContentView = this.currentContentView;
            if (!currentContentView || !currentContentView.supportsSearch) return;

            currentContentView.searchCleared();
        }
    }, {
        key: "findBannerSearchQueryForSelection",
        value: function findBannerSearchQueryForSelection(findBanner) {
            var currentContentView = this.currentContentView;
            if (!currentContentView || !currentContentView.supportsSearch) return null;

            return currentContentView.searchQueryWithSelection();
        }
    }, {
        key: "findBannerRevealPreviousResult",
        value: function findBannerRevealPreviousResult(findBanner) {
            var currentContentView = this.currentContentView;
            if (!currentContentView || !currentContentView.supportsSearch) return;

            currentContentView.revealPreviousSearchResult(!findBanner.showing);
        }
    }, {
        key: "findBannerRevealNextResult",
        value: function findBannerRevealNextResult(findBanner) {
            var currentContentView = this.currentContentView;
            if (!currentContentView || !currentContentView.supportsSearch) return;

            currentContentView.revealNextSearchResult(!findBanner.showing);
        }
    }, {
        key: "shown",
        value: function shown() {
            this._contentViewContainer.shown();

            this._findBanner.enableKeyboardShortcuts();
        }
    }, {
        key: "hidden",
        value: function hidden() {
            this._contentViewContainer.hidden();

            this._findBanner.disableKeyboardShortcuts();
        }

        // Private

    }, {
        key: "_backButtonClicked",
        value: function _backButtonClicked(event) {
            this.goBack();
        }
    }, {
        key: "_forwardButtonClicked",
        value: function _forwardButtonClicked(event) {
            this.goForward();
        }
    }, {
        key: "_findBannerDidShow",
        value: function _findBannerDidShow(event) {
            var currentContentView = this.currentContentView;
            if (!currentContentView || !currentContentView.supportsSearch) return;

            currentContentView.automaticallyRevealFirstSearchResult = true;
        }
    }, {
        key: "_findBannerDidHide",
        value: function _findBannerDidHide(event) {
            var currentContentView = this.currentContentView;
            if (!currentContentView || !currentContentView.supportsSearch) return;

            currentContentView.automaticallyRevealFirstSearchResult = false;
        }
    }, {
        key: "_contentViewNumberOfSearchResultsDidChange",
        value: function _contentViewNumberOfSearchResultsDidChange(event) {
            if (event.target !== this.currentContentView) return;

            this._findBanner.numberOfResults = this.currentContentView.numberOfSearchResults;
        }
    }, {
        key: "_updateHierarchicalPathNavigationItem",
        value: function _updateHierarchicalPathNavigationItem(representedObject) {
            if (!this.delegate || typeof this.delegate.contentBrowserTreeElementForRepresentedObject !== "function") return;

            var treeElement = representedObject ? this.delegate.contentBrowserTreeElementForRepresentedObject(this, representedObject) : null;
            var pathComponents = [];

            while (treeElement && !treeElement.root) {
                var pathComponent = new WebInspector.GeneralTreeElementPathComponent(treeElement);
                pathComponents.unshift(pathComponent);
                treeElement = treeElement.parent;
            }

            this._hierarchicalPathNavigationItem.components = pathComponents;
        }
    }, {
        key: "_updateContentViewSelectionPathNavigationItem",
        value: function _updateContentViewSelectionPathNavigationItem(contentView) {
            var selectionPathComponents = contentView ? contentView.selectionPathComponents || [] : [];
            this._contentViewSelectionPathNavigationItem.components = selectionPathComponents;

            if (!selectionPathComponents.length) {
                this._hierarchicalPathNavigationItem.alwaysShowLastPathComponentSeparator = false;
                this._navigationBar.removeNavigationItem(this._contentViewSelectionPathNavigationItem);
                return;
            }

            // Insert the _contentViewSelectionPathNavigationItem after the _hierarchicalPathNavigationItem, if needed.
            if (!this._navigationBar.navigationItems.includes(this._contentViewSelectionPathNavigationItem)) {
                var hierarchicalPathItemIndex = this._navigationBar.navigationItems.indexOf(this._hierarchicalPathNavigationItem);
                console.assert(hierarchicalPathItemIndex !== -1);
                this._navigationBar.insertNavigationItem(this._contentViewSelectionPathNavigationItem, hierarchicalPathItemIndex + 1);
                this._hierarchicalPathNavigationItem.alwaysShowLastPathComponentSeparator = true;
            }
        }
    }, {
        key: "_updateBackForwardButtons",
        value: function _updateBackForwardButtons() {
            if (!this._backButtonNavigationItem || !this._forwardButtonNavigationItem) return;

            this._backButtonNavigationItem.enabled = this.canGoBack();
            this._forwardButtonNavigationItem.enabled = this.canGoForward();
        }
    }, {
        key: "_updateContentViewNavigationItems",
        value: function _updateContentViewNavigationItems() {
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

            var insertionIndex = navigationBar.navigationItems.indexOf(this._dividingFlexibleSpaceNavigationItem) + 1;
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
        }
    }, {
        key: "_updateFindBanner",
        value: function _updateFindBanner(currentContentView) {
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
        }
    }, {
        key: "_dispatchCurrentRepresentedObjectsDidChangeEventSoon",
        value: function _dispatchCurrentRepresentedObjectsDidChangeEventSoon() {
            if (this._currentRepresentedObjectsDidChangeTimeout) return;
            this._currentRepresentedObjectsDidChangeTimeout = setTimeout(this._dispatchCurrentRepresentedObjectsDidChangeEvent.bind(this), 0);
        }
    }, {
        key: "_dispatchCurrentRepresentedObjectsDidChangeEvent",
        value: function _dispatchCurrentRepresentedObjectsDidChangeEvent() {
            if (this._currentRepresentedObjectsDidChangeTimeout) {
                clearTimeout(this._currentRepresentedObjectsDidChangeTimeout);
                delete this._currentRepresentedObjectsDidChangeTimeout;
            }

            this.dispatchEventToListeners(WebInspector.ContentBrowser.Event.CurrentRepresentedObjectsDidChange);
        }
    }, {
        key: "_contentViewSelectionPathComponentDidChange",
        value: function _contentViewSelectionPathComponentDidChange(event) {
            if (event.target !== this.currentContentView) return;

            this._updateContentViewSelectionPathNavigationItem(event.target);
            this._updateBackForwardButtons();

            this._updateContentViewNavigationItems();

            this._navigationBar.updateLayoutSoon();

            this._dispatchCurrentRepresentedObjectsDidChangeEventSoon();
        }
    }, {
        key: "_contentViewSupplementalRepresentedObjectsDidChange",
        value: function _contentViewSupplementalRepresentedObjectsDidChange(event) {
            if (event.target !== this.currentContentView) return;

            this._dispatchCurrentRepresentedObjectsDidChangeEventSoon();
        }
    }, {
        key: "_currentContentViewDidChange",
        value: function _currentContentViewDidChange(event) {
            var currentContentView = this.currentContentView;

            this._updateHierarchicalPathNavigationItem(currentContentView ? currentContentView.representedObject : null);
            this._updateContentViewSelectionPathNavigationItem(currentContentView);
            this._updateBackForwardButtons();

            this._updateContentViewNavigationItems();
            this._updateFindBanner(currentContentView);

            this._navigationBar.updateLayout();

            this.dispatchEventToListeners(WebInspector.ContentBrowser.Event.CurrentContentViewDidChange);

            this._dispatchCurrentRepresentedObjectsDidChangeEvent();
        }
    }, {
        key: "_contentViewNavigationItemsDidChange",
        value: function _contentViewNavigationItemsDidChange(event) {
            if (event.target !== this.currentContentView) return;

            this._updateContentViewNavigationItems();
            this._navigationBar.updateLayout();
        }
    }, {
        key: "_hierarchicalPathComponentWasSelected",
        value: function _hierarchicalPathComponentWasSelected(event) {
            console.assert(event.data.pathComponent instanceof WebInspector.GeneralTreeElementPathComponent);

            var treeElement = event.data.pathComponent.generalTreeElement;
            var originalTreeElement = treeElement;

            // Some tree elements (like folders) are not viewable. Find the first descendant that is viewable.
            while (treeElement && !WebInspector.ContentView.isViewable(treeElement.representedObject)) treeElement = treeElement.traverseNextTreeElement(false, originalTreeElement, false);

            if (!treeElement) return;

            treeElement.revealAndSelect();
        }
    }, {
        key: "element",
        get: function get() {
            return this._element;
        }
    }, {
        key: "navigationBar",
        get: function get() {
            return this._navigationBar;
        }
    }, {
        key: "contentViewContainer",
        get: function get() {
            return this._contentViewContainer;
        }
    }, {
        key: "delegate",
        get: function get() {
            return this._delegate;
        },
        set: function set(newDelegate) {
            this._delegate = newDelegate || null;
        }
    }, {
        key: "currentContentView",
        get: function get() {
            return this._contentViewContainer.currentContentView;
        }
    }, {
        key: "currentRepresentedObjects",
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
        }
    }]);

    return ContentBrowser;
})(WebInspector.Object);

WebInspector.ContentBrowser.Event = {
    CurrentRepresentedObjectsDidChange: "content-browser-current-represented-objects-did-change",
    CurrentContentViewDidChange: "content-browser-current-content-view-did-change"
};
