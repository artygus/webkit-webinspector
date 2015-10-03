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

WebInspector.DOMTreeContentView = (function (_WebInspector$ContentView) {
    _inherits(DOMTreeContentView, _WebInspector$ContentView);

    function DOMTreeContentView(representedObject) {
        _classCallCheck(this, DOMTreeContentView);

        console.assert(representedObject);

        _get(Object.getPrototypeOf(DOMTreeContentView.prototype), "constructor", this).call(this, representedObject);

        this._compositingBordersButtonNavigationItem = new WebInspector.ActivateButtonNavigationItem("layer-borders", WebInspector.UIString("Show compositing borders"), WebInspector.UIString("Hide compositing borders"), "Images/LayerBorders.svg", 13, 13);
        this._compositingBordersButtonNavigationItem.addEventListener(WebInspector.ButtonNavigationItem.Event.Clicked, this._toggleCompositingBorders, this);
        this._compositingBordersButtonNavigationItem.enabled = !!PageAgent.getCompositingBordersVisible;

        WebInspector.showPaintRectsSetting.addEventListener(WebInspector.Setting.Event.Changed, this._showPaintRectsSettingChanged, this);
        this._paintFlashingButtonNavigationItem = new WebInspector.ActivateButtonNavigationItem("paint-flashing", WebInspector.UIString("Enable paint flashing"), WebInspector.UIString("Disable paint flashing"), "Images/PaintFlashing.svg", 16, 16);
        this._paintFlashingButtonNavigationItem.addEventListener(WebInspector.ButtonNavigationItem.Event.Clicked, this._togglePaintFlashing, this);
        this._paintFlashingButtonNavigationItem.enabled = !!PageAgent.setShowPaintRects;
        this._paintFlashingButtonNavigationItem.activated = PageAgent.setShowPaintRects && WebInspector.showPaintRectsSetting.value;

        WebInspector.showShadowDOMSetting.addEventListener(WebInspector.Setting.Event.Changed, this._showShadowDOMSettingChanged, this);
        this._showsShadowDOMButtonNavigationItem = new WebInspector.ActivateButtonNavigationItem("shows-shadow-DOM", WebInspector.UIString("Show shadow DOM nodes"), WebInspector.UIString("Hide shadow DOM nodes"), "Images/ShadowDOM.svg", 13, 13);
        this._showsShadowDOMButtonNavigationItem.addEventListener(WebInspector.ButtonNavigationItem.Event.Clicked, this._toggleShowsShadowDOMSetting, this);
        this._showShadowDOMSettingChanged();

        this.element.classList.add("dom-tree");
        this.element.addEventListener("click", this._mouseWasClicked.bind(this), false);

        this._domTreeOutline = new WebInspector.DOMTreeOutline(true, true, true);
        this._domTreeOutline.addEventListener(WebInspector.DOMTreeOutline.Event.SelectedNodeChanged, this._selectedNodeDidChange, this);
        this._domTreeOutline.wireToDomAgent();
        this._domTreeOutline.editable = true;
        this.element.appendChild(this._domTreeOutline.element);

        WebInspector.domTreeManager.addEventListener(WebInspector.DOMTreeManager.Event.AttributeModified, this._domNodeChanged, this);
        WebInspector.domTreeManager.addEventListener(WebInspector.DOMTreeManager.Event.AttributeRemoved, this._domNodeChanged, this);
        WebInspector.domTreeManager.addEventListener(WebInspector.DOMTreeManager.Event.CharacterDataModified, this._domNodeChanged, this);

        this._lastSelectedNodePathSetting = new WebInspector.Setting("last-selected-node-path", null);

        this._numberOfSearchResults = null;
    }

    // Public

    _createClass(DOMTreeContentView, [{
        key: "updateLayout",
        value: function updateLayout() {
            this._domTreeOutline.updateSelection();
        }
    }, {
        key: "shown",
        value: function shown() {
            this._domTreeOutline.setVisible(true, WebInspector.isConsoleFocused());
            this._updateCompositingBordersButtonToMatchPageSettings();
        }
    }, {
        key: "hidden",
        value: function hidden() {
            WebInspector.domTreeManager.hideDOMNodeHighlight();
            this._domTreeOutline.setVisible(false);
        }
    }, {
        key: "closed",
        value: function closed() {
            WebInspector.showPaintRectsSetting.removeEventListener(null, null, this);
            WebInspector.showShadowDOMSetting.removeEventListener(null, null, this);
            WebInspector.domTreeManager.removeEventListener(null, null, this);

            this._domTreeOutline.close();
        }
    }, {
        key: "restoreFromCookie",
        value: function restoreFromCookie(cookie) {
            if (!cookie || !cookie.nodeToSelect) return;

            this.selectAndRevealDOMNode(cookie.nodeToSelect);

            // Because nodeToSelect is ephemeral, we don't want to keep
            // it around in the back-forward history entries.
            cookie.nodeToSelect = undefined;
        }
    }, {
        key: "selectAndRevealDOMNode",
        value: function selectAndRevealDOMNode(domNode, preventFocusChange) {
            this._domTreeOutline.selectDOMNode(domNode, !preventFocusChange);
        }
    }, {
        key: "handleCopyEvent",
        value: function handleCopyEvent(event) {
            var selectedDOMNode = this._domTreeOutline.selectedDOMNode();
            if (!selectedDOMNode) return;

            event.clipboardData.clearData();
            event.preventDefault();

            selectedDOMNode.copyNode();
        }
    }, {
        key: "performSearch",
        value: function performSearch(query) {
            if (this._searchQuery === query) return;

            if (this._searchIdentifier) {
                DOMAgent.discardSearchResults(this._searchIdentifier);
                this._hideSearchHighlights();
            }

            this._searchQuery = query;
            this._searchIdentifier = null;
            this._numberOfSearchResults = null;
            this._currentSearchResultIndex = -1;

            function searchResultsReady(error, searchIdentifier, resultsCount) {
                if (error) return;

                this._searchIdentifier = searchIdentifier;
                this._numberOfSearchResults = resultsCount;

                this.dispatchEventToListeners(WebInspector.ContentView.Event.NumberOfSearchResultsDidChange);

                this._showSearchHighlights();

                if (this._automaticallyRevealFirstSearchResult) this.revealNextSearchResult();
            }

            function contextNodesReady(nodeIds) {
                DOMAgent.performSearch(query, nodeIds, searchResultsReady.bind(this));
            }

            this.getSearchContextNodes(contextNodesReady.bind(this));
        }
    }, {
        key: "getSearchContextNodes",
        value: function getSearchContextNodes(callback) {
            // Overwrite this to limit the search to just a subtree.
            // Passing undefined will make DOMAgent.performSearch search through all the documents.
            callback(undefined);
        }
    }, {
        key: "searchCleared",
        value: function searchCleared() {
            if (this._searchIdentifier) {
                DOMAgent.discardSearchResults(this._searchIdentifier);
                this._hideSearchHighlights();
            }

            this._searchQuery = null;
            this._searchIdentifier = null;
            this._numberOfSearchResults = null;
            this._currentSearchResultIndex = -1;
        }
    }, {
        key: "revealPreviousSearchResult",
        value: function revealPreviousSearchResult(changeFocus) {
            if (!this._numberOfSearchResults) return;

            if (this._currentSearchResultIndex > 0) --this._currentSearchResultIndex;else this._currentSearchResultIndex = this._numberOfSearchResults - 1;

            this._revealSearchResult(this._currentSearchResultIndex, changeFocus);
        }
    }, {
        key: "revealNextSearchResult",
        value: function revealNextSearchResult(changeFocus) {
            if (!this._numberOfSearchResults) return;

            if (this._currentSearchResultIndex + 1 < this._numberOfSearchResults) ++this._currentSearchResultIndex;else this._currentSearchResultIndex = 0;

            this._revealSearchResult(this._currentSearchResultIndex, changeFocus);
        }

        // Private

    }, {
        key: "_revealSearchResult",
        value: function _revealSearchResult(index, changeFocus) {
            console.assert(this._searchIdentifier);

            var searchIdentifier = this._searchIdentifier;

            function revealResult(error, nodeIdentifiers) {
                if (error) return;

                // Bail if the searchIdentifier changed since we started.
                if (this._searchIdentifier !== searchIdentifier) return;

                console.assert(nodeIdentifiers.length === 1);

                var domNode = WebInspector.domTreeManager.nodeForId(nodeIdentifiers[0]);
                console.assert(domNode);
                if (!domNode) return;

                this._domTreeOutline.selectDOMNode(domNode, changeFocus);

                var selectedTreeElement = this._domTreeOutline.selectedTreeElement;
                if (selectedTreeElement) selectedTreeElement.emphasizeSearchHighlight();
            }

            DOMAgent.getSearchResults(this._searchIdentifier, index, index + 1, revealResult.bind(this));
        }
    }, {
        key: "_restoreSelectedNodeAfterUpdate",
        value: function _restoreSelectedNodeAfterUpdate(documentURL, defaultNode) {
            if (!WebInspector.domTreeManager.restoreSelectedNodeIsAllowed) return;

            function selectNode(lastSelectedNode) {
                var nodeToFocus = lastSelectedNode;
                if (!nodeToFocus) nodeToFocus = defaultNode;

                if (!nodeToFocus) return;

                this._dontSetLastSelectedNodePath = true;
                this.selectAndRevealDOMNode(nodeToFocus, WebInspector.isConsoleFocused());
                this._dontSetLastSelectedNodePath = false;

                // If this wasn't the last selected node, then expand it.
                if (!lastSelectedNode && this._domTreeOutline.selectedTreeElement) this._domTreeOutline.selectedTreeElement.expand();
            }

            function selectLastSelectedNode(nodeId) {
                if (!WebInspector.domTreeManager.restoreSelectedNodeIsAllowed) return;

                selectNode.call(this, WebInspector.domTreeManager.nodeForId(nodeId));
            }

            if (documentURL && this._lastSelectedNodePathSetting.value && this._lastSelectedNodePathSetting.value.path && this._lastSelectedNodePathSetting.value.url === documentURL.hash) WebInspector.domTreeManager.pushNodeByPathToFrontend(this._lastSelectedNodePathSetting.value.path, selectLastSelectedNode.bind(this));else selectNode.call(this);
        }
    }, {
        key: "_selectedNodeDidChange",
        value: function _selectedNodeDidChange(event) {
            var selectedDOMNode = this._domTreeOutline.selectedDOMNode();
            if (selectedDOMNode && !this._dontSetLastSelectedNodePath) this._lastSelectedNodePathSetting.value = { url: selectedDOMNode.ownerDocument.documentURL.hash, path: selectedDOMNode.path() };

            if (selectedDOMNode) ConsoleAgent.addInspectedNode(selectedDOMNode.id);

            this.dispatchEventToListeners(WebInspector.ContentView.Event.SelectionPathComponentsDidChange);
        }
    }, {
        key: "_pathComponentSelected",
        value: function _pathComponentSelected(event) {
            console.assert(event.data.pathComponent instanceof WebInspector.DOMTreeElementPathComponent);
            console.assert(event.data.pathComponent.domTreeElement instanceof WebInspector.DOMTreeElement);

            this._domTreeOutline.selectDOMNode(event.data.pathComponent.domTreeElement.representedObject, true);
        }
    }, {
        key: "_domNodeChanged",
        value: function _domNodeChanged(event) {
            var selectedDOMNode = this._domTreeOutline.selectedDOMNode();
            if (selectedDOMNode !== event.data.node) return;

            this.dispatchEventToListeners(WebInspector.ContentView.Event.SelectionPathComponentsDidChange);
        }
    }, {
        key: "_mouseWasClicked",
        value: function _mouseWasClicked(event) {
            var anchorElement = event.target.enclosingNodeOrSelfWithNodeName("a");
            if (!anchorElement || !anchorElement.href) return;

            // Prevent the link from navigating, since we don't do any navigation by following links normally.
            event.preventDefault();
            event.stopPropagation();

            if (WebInspector.isBeingEdited(anchorElement)) {
                // Don't follow the link when it is being edited.
                return;
            }

            // Cancel any pending link navigation.
            if (this._followLinkTimeoutIdentifier) {
                clearTimeout(this._followLinkTimeoutIdentifier);
                delete this._followLinkTimeoutIdentifier;
            }

            // If this is a double-click (or multiple-click), return early.
            if (event.detail > 1) return;

            function followLink() {
                // Since followLink is delayed, the call to WebInspector.openURL can't look at window.event
                // to see if the command key is down like it normally would. So we need to do that check
                // before calling WebInspector.openURL.
                var alwaysOpenExternally = event ? event.metaKey : false;
                WebInspector.openURL(anchorElement.href, this._frame, alwaysOpenExternally, anchorElement.lineNumber);
            }

            // Start a timeout since this is a single click, if the timeout is canceled before it fires,
            // then a double-click happened or another link was clicked.
            // FIXME: The duration might be longer or shorter than the user's configured double click speed.
            this._followLinkTimeoutIdentifier = setTimeout(followLink.bind(this), 333);
        }
    }, {
        key: "_toggleCompositingBorders",
        value: function _toggleCompositingBorders(event) {
            console.assert(PageAgent.setCompositingBordersVisible);

            var activated = !this._compositingBordersButtonNavigationItem.activated;
            this._compositingBordersButtonNavigationItem.activated = activated;
            PageAgent.setCompositingBordersVisible(activated);
        }
    }, {
        key: "_togglePaintFlashing",
        value: function _togglePaintFlashing(event) {
            WebInspector.showPaintRectsSetting.value = !WebInspector.showPaintRectsSetting.value;
        }
    }, {
        key: "_updateCompositingBordersButtonToMatchPageSettings",
        value: function _updateCompositingBordersButtonToMatchPageSettings() {
            var button = this._compositingBordersButtonNavigationItem;

            // We need to sync with the page settings since these can be controlled
            // in a different way than just using the navigation bar button.
            PageAgent.getCompositingBordersVisible(function (error, compositingBordersVisible) {
                button.activated = error ? false : compositingBordersVisible;
                button.enabled = error !== "unsupported";
            });
        }
    }, {
        key: "_showPaintRectsSettingChanged",
        value: function _showPaintRectsSettingChanged(event) {
            console.assert(PageAgent.setShowPaintRects);

            this._paintFlashingButtonNavigationItem.activated = WebInspector.showPaintRectsSetting.value;

            PageAgent.setShowPaintRects(this._paintFlashingButtonNavigationItem.activated);
        }
    }, {
        key: "_showShadowDOMSettingChanged",
        value: function _showShadowDOMSettingChanged(event) {
            this._showsShadowDOMButtonNavigationItem.activated = WebInspector.showShadowDOMSetting.value;
        }
    }, {
        key: "_toggleShowsShadowDOMSetting",
        value: function _toggleShowsShadowDOMSetting(event) {
            WebInspector.showShadowDOMSetting.value = !WebInspector.showShadowDOMSetting.value;
        }
    }, {
        key: "_showSearchHighlights",
        value: function _showSearchHighlights() {
            console.assert(this._searchIdentifier);

            this._searchResultNodes = [];

            var searchIdentifier = this._searchIdentifier;

            DOMAgent.getSearchResults(this._searchIdentifier, 0, this._numberOfSearchResults, (function (error, nodeIdentifiers) {
                if (error) return;

                if (this._searchIdentifier !== searchIdentifier) return;

                console.assert(nodeIdentifiers.length === this._numberOfSearchResults);

                for (var i = 0; i < nodeIdentifiers.length; ++i) {
                    var domNode = WebInspector.domTreeManager.nodeForId(nodeIdentifiers[i]);
                    console.assert(domNode);
                    if (!domNode) continue;

                    this._searchResultNodes.push(domNode);

                    var treeElement = this._domTreeOutline.findTreeElement(domNode);
                    console.assert(treeElement);
                    if (treeElement) treeElement.highlightSearchResults(this._searchQuery);
                }
            }).bind(this));
        }
    }, {
        key: "_hideSearchHighlights",
        value: function _hideSearchHighlights() {
            if (!this._searchResultNodes) return;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._searchResultNodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var domNode = _step.value;

                    var treeElement = this._domTreeOutline.findTreeElement(domNode);
                    if (treeElement) treeElement.hideSearchHighlights();
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator["return"]) {
                        _iterator["return"]();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            delete this._searchResultNodes;
        }
    }, {
        key: "navigationItems",
        get: function get() {
            return [this._showsShadowDOMButtonNavigationItem, this._compositingBordersButtonNavigationItem, this._paintFlashingButtonNavigationItem];
        }
    }, {
        key: "domTreeOutline",
        get: function get() {
            return this._domTreeOutline;
        }
    }, {
        key: "scrollableElements",
        get: function get() {
            return [this.element];
        }
    }, {
        key: "selectionPathComponents",
        get: function get() {
            var treeElement = this._domTreeOutline.selectedTreeElement;
            var pathComponents = [];

            while (treeElement && !treeElement.root) {
                // The close tag is contained within the element it closes. So skip it since we don't want to
                // show the same node twice in the hierarchy.
                if (treeElement.isCloseTag()) {
                    treeElement = treeElement.parent;
                    continue;
                }

                var pathComponent = new WebInspector.DOMTreeElementPathComponent(treeElement, treeElement.representedObject);
                pathComponent.addEventListener(WebInspector.HierarchicalPathComponent.Event.Clicked, this._pathComponentSelected, this);
                pathComponents.unshift(pathComponent);
                treeElement = treeElement.parent;
            }

            return pathComponents;
        }
    }, {
        key: "supportsSave",
        get: function get() {
            return WebInspector.canArchiveMainFrame();
        }
    }, {
        key: "saveData",
        get: function get() {
            function saveHandler(forceSaveAs) {
                WebInspector.archiveMainFrame();
            }

            return { customSaveHandler: saveHandler };
        }
    }, {
        key: "supportsSearch",
        get: function get() {
            return true;
        }
    }, {
        key: "numberOfSearchResults",
        get: function get() {
            return this._numberOfSearchResults;
        }
    }, {
        key: "hasPerformedSearch",
        get: function get() {
            return this._numberOfSearchResults !== null;
        }
    }, {
        key: "automaticallyRevealFirstSearchResult",
        set: function set(reveal) {
            this._automaticallyRevealFirstSearchResult = reveal;

            // If we haven't shown a search result yet, reveal one now.
            if (this._automaticallyRevealFirstSearchResult && this._numberOfSearchResults > 0) {
                if (this._currentSearchResultIndex === -1) this.revealNextSearchResult();
            }
        }
    }]);

    return DOMTreeContentView;
})(WebInspector.ContentView);
