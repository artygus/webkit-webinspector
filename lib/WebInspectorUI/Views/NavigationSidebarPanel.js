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

WebInspector.NavigationSidebarPanel = (function (_WebInspector$SidebarPanel) {
    _inherits(NavigationSidebarPanel, _WebInspector$SidebarPanel);

    function NavigationSidebarPanel(identifier, displayName, shouldAutoPruneStaleTopLevelResourceTreeElements, wantsTopOverflowShadow, element, role, label) {
        _classCallCheck(this, NavigationSidebarPanel);

        _get(Object.getPrototypeOf(NavigationSidebarPanel.prototype), "constructor", this).call(this, identifier, displayName, element, role, label || displayName);

        this.element.classList.add("navigation");

        this._visibleContentTreeOutlines = new Set();

        this.contentElement.addEventListener("scroll", this._updateContentOverflowShadowVisibility.bind(this));

        this._contentTreeOutline = this.createContentTreeOutline(true);

        this._filterBar = new WebInspector.FilterBar();
        this._filterBar.addEventListener(WebInspector.FilterBar.Event.FilterDidChange, this._filterDidChange, this);
        this.element.appendChild(this._filterBar.element);

        this._bottomOverflowShadowElement = document.createElement("div");
        this._bottomOverflowShadowElement.className = WebInspector.NavigationSidebarPanel.OverflowShadowElementStyleClassName;
        this.element.appendChild(this._bottomOverflowShadowElement);

        if (wantsTopOverflowShadow) {
            this._topOverflowShadowElement = document.createElement("div");
            this._topOverflowShadowElement.classList.add(WebInspector.NavigationSidebarPanel.OverflowShadowElementStyleClassName);
            this._topOverflowShadowElement.classList.add(WebInspector.NavigationSidebarPanel.TopOverflowShadowElementStyleClassName);
            this.element.appendChild(this._topOverflowShadowElement);
        }

        this._boundUpdateContentOverflowShadowVisibility = this._updateContentOverflowShadowVisibility.bind(this);
        window.addEventListener("resize", this._boundUpdateContentOverflowShadowVisibility);

        this._filtersSetting = new WebInspector.Setting(identifier + "-navigation-sidebar-filters", {});
        this._filterBar.filters = this._filtersSetting.value;

        this._emptyContentPlaceholderElement = document.createElement("div");
        this._emptyContentPlaceholderElement.className = WebInspector.NavigationSidebarPanel.EmptyContentPlaceholderElementStyleClassName;

        this._emptyContentPlaceholderMessageElement = document.createElement("div");
        this._emptyContentPlaceholderMessageElement.className = WebInspector.NavigationSidebarPanel.EmptyContentPlaceholderMessageElementStyleClassName;
        this._emptyContentPlaceholderElement.appendChild(this._emptyContentPlaceholderMessageElement);

        this._generateStyleRulesIfNeeded();
        this._generateDisclosureTrianglesIfNeeded();

        this._shouldAutoPruneStaleTopLevelResourceTreeElements = shouldAutoPruneStaleTopLevelResourceTreeElements || false;

        if (this._shouldAutoPruneStaleTopLevelResourceTreeElements) {
            WebInspector.Frame.addEventListener(WebInspector.Frame.Event.MainResourceDidChange, this._checkForStaleResources, this);
            WebInspector.Frame.addEventListener(WebInspector.Frame.Event.ChildFrameWasRemoved, this._checkForStaleResources, this);
            WebInspector.Frame.addEventListener(WebInspector.Frame.Event.ResourceWasRemoved, this._checkForStaleResources, this);
        }
    }

    // Public

    _createClass(NavigationSidebarPanel, [{
        key: "closed",
        value: function closed() {
            window.removeEventListener("resize", this._boundUpdateContentOverflowShadowVisibility);
            WebInspector.Frame.removeEventListener(null, null, this);
        }
    }, {
        key: "cancelRestoringState",
        value: function cancelRestoringState() {
            if (!this._finalAttemptToRestoreViewStateTimeout) return;

            clearTimeout(this._finalAttemptToRestoreViewStateTimeout);
            this._finalAttemptToRestoreViewStateTimeout = undefined;
        }
    }, {
        key: "createContentTreeOutline",
        value: function createContentTreeOutline(dontHideByDefault, suppressFiltering) {
            var contentTreeOutlineElement = document.createElement("ol");
            contentTreeOutlineElement.className = WebInspector.NavigationSidebarPanel.ContentTreeOutlineElementStyleClassName;
            if (!dontHideByDefault) contentTreeOutlineElement.classList.add(WebInspector.NavigationSidebarPanel.ContentTreeOutlineElementHiddenStyleClassName);
            this.contentElement.appendChild(contentTreeOutlineElement);

            var contentTreeOutline = new WebInspector.TreeOutline(contentTreeOutlineElement);
            contentTreeOutline.allowsRepeatSelection = true;

            if (!suppressFiltering) {
                contentTreeOutline.onadd = this._treeElementAddedOrChanged.bind(this);
                contentTreeOutline.onchange = this._treeElementAddedOrChanged.bind(this);
                contentTreeOutline.onexpand = this._treeElementExpandedOrCollapsed.bind(this);
                contentTreeOutline.oncollapse = this._treeElementExpandedOrCollapsed.bind(this);
            }

            if (dontHideByDefault) this._visibleContentTreeOutlines.add(contentTreeOutline);

            return contentTreeOutline;
        }
    }, {
        key: "treeElementForRepresentedObject",
        value: function treeElementForRepresentedObject(representedObject) {
            return this._contentTreeOutline.getCachedTreeElement(representedObject);
        }
    }, {
        key: "showDefaultContentView",
        value: function showDefaultContentView() {
            // Implemented by subclasses if needed to show a content view when no existing tree element is selected.
        }
    }, {
        key: "showDefaultContentViewForTreeElement",
        value: function showDefaultContentViewForTreeElement(treeElement) {
            console.assert(treeElement);
            console.assert(treeElement.representedObject);
            if (!treeElement || !treeElement.representedObject) return;

            this.contentBrowser.showContentViewForRepresentedObject(treeElement.representedObject);
            treeElement.revealAndSelect(true, false, true, true);
        }
    }, {
        key: "saveStateToCookie",
        value: function saveStateToCookie(cookie) {
            console.assert(cookie);

            // This does not save folder selections, which lack a represented object and content view.
            var selectedTreeElement = null;
            this._visibleContentTreeOutlines.forEach(function (outline) {
                if (outline.selectedTreeElement) selectedTreeElement = outline.selectedTreeElement;
            });

            if (!selectedTreeElement) return;

            if (this._isTreeElementWithoutRepresentedObject(selectedTreeElement)) return;

            var representedObject = selectedTreeElement.representedObject;
            cookie[WebInspector.TypeIdentifierCookieKey] = representedObject.constructor.TypeIdentifier;

            if (representedObject.saveIdentityToCookie) representedObject.saveIdentityToCookie(cookie);else console.error("Error: TreeElement.representedObject is missing a saveIdentityToCookie implementation. TreeElement.constructor: ", selectedTreeElement.constructor);
        }

        // This can be supplemented by subclasses that admit a simpler strategy for static tree elements.
    }, {
        key: "restoreStateFromCookie",
        value: function restoreStateFromCookie(cookie, relaxedMatchDelay) {
            this._pendingViewStateCookie = cookie;
            this._restoringState = true;

            // Check if any existing tree elements in any outline match the cookie.
            this._checkOutlinesForPendingViewStateCookie();

            if (this._finalAttemptToRestoreViewStateTimeout) clearTimeout(this._finalAttemptToRestoreViewStateTimeout);

            if (relaxedMatchDelay === 0) return;

            function finalAttemptToRestoreViewStateFromCookie() {
                delete this._finalAttemptToRestoreViewStateTimeout;

                this._checkOutlinesForPendingViewStateCookie(true);

                delete this._pendingViewStateCookie;
                delete this._restoringState;
            }

            // If the specific tree element wasn't found, we may need to wait for the resources
            // to be registered. We try one last time (match type only) after an arbitrary amount of timeout.
            this._finalAttemptToRestoreViewStateTimeout = setTimeout(finalAttemptToRestoreViewStateFromCookie.bind(this), relaxedMatchDelay);
        }
    }, {
        key: "showEmptyContentPlaceholder",
        value: function showEmptyContentPlaceholder(message) {
            console.assert(message);

            if (this._emptyContentPlaceholderElement.parentNode && this._emptyContentPlaceholderMessageElement.textContent === message) return;

            this._emptyContentPlaceholderMessageElement.textContent = message;
            this.element.appendChild(this._emptyContentPlaceholderElement);

            this._updateContentOverflowShadowVisibility();
        }
    }, {
        key: "hideEmptyContentPlaceholder",
        value: function hideEmptyContentPlaceholder() {
            if (!this._emptyContentPlaceholderElement.parentNode) return;

            this._emptyContentPlaceholderElement.parentNode.removeChild(this._emptyContentPlaceholderElement);

            this._updateContentOverflowShadowVisibility();
        }
    }, {
        key: "updateEmptyContentPlaceholder",
        value: function updateEmptyContentPlaceholder(message) {
            if (!this._contentTreeOutline.children.length) {
                // No tree elements, so no results.
                this.showEmptyContentPlaceholder(message);
            } else if (!this._emptyFilterResults) {
                // There are tree elements, and not all of them are hidden by the filter.
                this.hideEmptyContentPlaceholder();
            }
        }
    }, {
        key: "updateFilter",
        value: function updateFilter() {
            this._updateFilter();
        }
    }, {
        key: "hasCustomFilters",
        value: function hasCustomFilters() {
            // Implemented by subclasses if needed.
            return false;
        }
    }, {
        key: "matchTreeElementAgainstCustomFilters",
        value: function matchTreeElementAgainstCustomFilters(treeElement) {
            // Implemented by subclasses if needed.
            return true;
        }
    }, {
        key: "matchTreeElementAgainstFilterFunctions",
        value: function matchTreeElementAgainstFilterFunctions(treeElement) {
            if (!this._filterFunctions || !this._filterFunctions.length) return true;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._filterFunctions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var filterFunction = _step.value;

                    if (filterFunction(treeElement)) return true;
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

            return false;
        }
    }, {
        key: "applyFiltersToTreeElement",
        value: function applyFiltersToTreeElement(treeElement) {
            if (!this._filterBar.hasActiveFilters() && !this.hasCustomFilters()) {
                // No filters, so make everything visible.
                treeElement.hidden = false;

                // If this tree element was expanded during filtering, collapse it again.
                if (treeElement.expanded && treeElement.__wasExpandedDuringFiltering) {
                    delete treeElement.__wasExpandedDuringFiltering;
                    treeElement.collapse();
                }

                return;
            }

            var filterableData = treeElement.filterableData || {};

            var flags = { expandTreeElement: false };

            var self = this;
            function matchTextFilter(inputs) {
                if (!inputs || !self._textFilterRegex) return true;

                // Convert to a single item array if needed.
                if (!(inputs instanceof Array)) inputs = [inputs];

                // Loop over all the inputs and try to match them.
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = inputs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var input = _step2.value;

                        if (!input) continue;
                        if (self._textFilterRegex.test(input)) {
                            flags.expandTreeElement = true;
                            return true;
                        }
                    }

                    // No inputs matched.
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                            _iterator2["return"]();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                return false;
            }

            function makeVisible() {
                // Make this element visible.
                treeElement.hidden = false;

                // Make the ancestors visible and expand them.
                var currentAncestor = treeElement.parent;
                while (currentAncestor && !currentAncestor.root) {
                    currentAncestor.hidden = false;

                    // Only expand if the built-in filters matched, not custom filters.
                    if (flags.expandTreeElement && !currentAncestor.expanded) {
                        currentAncestor.__wasExpandedDuringFiltering = true;
                        currentAncestor.expand();
                    }

                    currentAncestor = currentAncestor.parent;
                }
            }

            if (matchTextFilter(filterableData.text) && this.matchTreeElementAgainstFilterFunctions(treeElement, flags) && this.matchTreeElementAgainstCustomFilters(treeElement, flags)) {
                // Make this element visible since it matches.
                makeVisible();

                // If this tree element didn't match a built-in filter and was expanded earlier during filtering, collapse it again.
                if (!flags.expandTreeElement && treeElement.expanded && treeElement.__wasExpandedDuringFiltering) {
                    delete treeElement.__wasExpandedDuringFiltering;
                    treeElement.collapse();
                }

                return;
            }

            // Make this element invisible since it does not match.
            treeElement.hidden = true;
        }
    }, {
        key: "treeElementAddedOrChanged",
        value: function treeElementAddedOrChanged(treeElement) {
            // Implemented by subclasses if needed.
        }
    }, {
        key: "show",
        value: function show() {
            if (!this.parentSidebar) return;

            _get(Object.getPrototypeOf(NavigationSidebarPanel.prototype), "show", this).call(this);

            this.contentTreeOutlineElement.focus();
        }
    }, {
        key: "shown",
        value: function shown() {
            _get(Object.getPrototypeOf(NavigationSidebarPanel.prototype), "shown", this).call(this);

            this._updateContentOverflowShadowVisibility();
        }

        // Protected

    }, {
        key: "representedObjectWasFiltered",
        value: function representedObjectWasFiltered(representedObject, filtered) {
            // Implemented by subclasses if needed.
        }
    }, {
        key: "pruneStaleResourceTreeElements",
        value: function pruneStaleResourceTreeElements() {
            if (this._checkForStaleResourcesTimeoutIdentifier) {
                clearTimeout(this._checkForStaleResourcesTimeoutIdentifier);
                this._checkForStaleResourcesTimeoutIdentifier = undefined;
            }

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this._visibleContentTreeOutlines[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var contentTreeOutline = _step3.value;

                    // Check all the ResourceTreeElements at the top level to make sure their Resource still has a parentFrame in the frame hierarchy.
                    // If the parentFrame is no longer in the frame hierarchy we know it was removed due to a navigation or some other page change and
                    // we should remove the issues for that resource.
                    for (var i = contentTreeOutline.children.length - 1; i >= 0; --i) {
                        var treeElement = contentTreeOutline.children[i];
                        if (!(treeElement instanceof WebInspector.ResourceTreeElement)) continue;

                        var resource = treeElement.resource;
                        if (!resource.parentFrame || resource.parentFrame.isDetached()) contentTreeOutline.removeChildAtIndex(i, true, true);
                    }
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                        _iterator3["return"]();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }
        }

        // Private

    }, {
        key: "_updateContentOverflowShadowVisibilitySoon",
        value: function _updateContentOverflowShadowVisibilitySoon() {
            if (this._updateContentOverflowShadowVisibilityIdentifier) return;

            this._updateContentOverflowShadowVisibilityIdentifier = setTimeout(this._updateContentOverflowShadowVisibility.bind(this), 0);
        }
    }, {
        key: "_updateContentOverflowShadowVisibility",
        value: function _updateContentOverflowShadowVisibility() {
            delete this._updateContentOverflowShadowVisibilityIdentifier;

            var scrollHeight = this.contentElement.scrollHeight;
            var offsetHeight = this.contentElement.offsetHeight;

            if (scrollHeight < offsetHeight) {
                if (this._topOverflowShadowElement) this._topOverflowShadowElement.style.opacity = 0;
                this._bottomOverflowShadowElement.style.opacity = 0;
                return;
            }

            var edgeThreshold = 1;
            var scrollTop = this.contentElement.scrollTop;

            var topCoverage = Math.min(scrollTop, edgeThreshold);
            var bottomCoverage = Math.max(0, offsetHeight + scrollTop - (scrollHeight - edgeThreshold));

            if (this._topOverflowShadowElement) this._topOverflowShadowElement.style.opacity = (topCoverage / edgeThreshold).toFixed(1);
            this._bottomOverflowShadowElement.style.opacity = (1 - bottomCoverage / edgeThreshold).toFixed(1);
        }
    }, {
        key: "_checkForEmptyFilterResults",
        value: function _checkForEmptyFilterResults() {
            // No tree elements, so don't touch the empty content placeholder.
            if (!this._contentTreeOutline.children.length) return;

            // Iterate over all the top level tree elements. If any are visible, return early.
            var currentTreeElement = this._contentTreeOutline.children[0];
            while (currentTreeElement) {
                if (!currentTreeElement.hidden) {
                    // Not hidden, so hide any empty content message.
                    this.hideEmptyContentPlaceholder();
                    this._emptyFilterResults = false;
                    return;
                }

                currentTreeElement = currentTreeElement.nextSibling;
            }

            // All top level tree elements are hidden, so filtering hid everything. Show a message.
            this.showEmptyContentPlaceholder(WebInspector.UIString("No Filter Results"));
            this._emptyFilterResults = true;
        }
    }, {
        key: "_filterDidChange",
        value: function _filterDidChange() {
            this._updateFilter();
        }
    }, {
        key: "_updateFilter",
        value: function _updateFilter() {
            var selectedTreeElement = this._contentTreeOutline.selectedTreeElement;
            var selectionWasHidden = selectedTreeElement && selectedTreeElement.hidden;

            var filters = this._filterBar.filters;
            this._textFilterRegex = simpleGlobStringToRegExp(filters.text, "i");
            this._filtersSetting.value = filters;
            this._filterFunctions = filters.functions;

            // Don't populate if we don't have any active filters.
            // We only need to populate when a filter needs to reveal.
            var dontPopulate = !this._filterBar.hasActiveFilters() && !this.hasCustomFilters();

            // Update the whole tree.
            var currentTreeElement = this._contentTreeOutline.children[0];
            while (currentTreeElement && !currentTreeElement.root) {
                var currentTreeElementWasHidden = currentTreeElement.hidden;
                this.applyFiltersToTreeElement(currentTreeElement);
                if (currentTreeElementWasHidden !== currentTreeElement.hidden) this.representedObjectWasFiltered(currentTreeElement.representedObject, currentTreeElement.hidden);

                currentTreeElement = currentTreeElement.traverseNextTreeElement(false, null, dontPopulate);
            }

            this._checkForEmptyFilterResults();
            this._updateContentOverflowShadowVisibility();

            // Filter may have hidden the selected resource in the timeline view, which should now notify its listeners.
            // FIXME: This is a layering violation. This should at least be in TimelineSidebarPanel.
            if (selectedTreeElement && selectedTreeElement.hidden !== selectionWasHidden) {
                var currentContentView = this.contentBrowser.currentContentView;
                if (currentContentView instanceof WebInspector.TimelineRecordingContentView && typeof currentContentView.currentTimelineView.filterUpdated === "function") currentContentView.currentTimelineView.filterUpdated();
            }
        }
    }, {
        key: "_treeElementAddedOrChanged",
        value: function _treeElementAddedOrChanged(treeElement) {
            // Don't populate if we don't have any active filters.
            // We only need to populate when a filter needs to reveal.
            var dontPopulate = !this._filterBar.hasActiveFilters() && !this.hasCustomFilters();

            // Apply the filters to the tree element and its descendants.
            var currentTreeElement = treeElement;
            while (currentTreeElement && !currentTreeElement.root) {
                var currentTreeElementWasHidden = currentTreeElement.hidden;
                this.applyFiltersToTreeElement(currentTreeElement);
                if (currentTreeElementWasHidden !== currentTreeElement.hidden) this.representedObjectWasFiltered(currentTreeElement.representedObject, currentTreeElement.hidden);

                currentTreeElement = currentTreeElement.traverseNextTreeElement(false, treeElement, dontPopulate);
            }

            this._checkForEmptyFilterResults();
            this._updateContentOverflowShadowVisibilitySoon();

            if (this.selected) this._checkElementsForPendingViewStateCookie([treeElement]);

            this.treeElementAddedOrChanged(treeElement);
        }
    }, {
        key: "_treeElementExpandedOrCollapsed",
        value: function _treeElementExpandedOrCollapsed(treeElement) {
            this._updateContentOverflowShadowVisibility();
        }
    }, {
        key: "_generateStyleRulesIfNeeded",
        value: function _generateStyleRulesIfNeeded() {
            if (WebInspector.NavigationSidebarPanel._styleElement) return;

            WebInspector.NavigationSidebarPanel._styleElement = document.createElement("style");

            var maximumSidebarTreeDepth = 32;
            var baseLeftPadding = 5; // Matches the padding in NavigationSidebarPanel.css for the item class. Keep in sync.
            var depthPadding = 10;

            var styleText = "";
            var childrenSubstring = "";
            for (var i = 1; i <= maximumSidebarTreeDepth; ++i) {
                // Keep all the elements at the same depth once the maximum is reached.
                childrenSubstring += i === maximumSidebarTreeDepth ? " .children" : " > .children";
                styleText += "." + WebInspector.NavigationSidebarPanel.ContentTreeOutlineElementStyleClassName + childrenSubstring + " > .item { ";
                styleText += "padding-left: " + (baseLeftPadding + depthPadding * i) + "px; }\n";
            }

            WebInspector.NavigationSidebarPanel._styleElement.textContent = styleText;

            document.head.appendChild(WebInspector.NavigationSidebarPanel._styleElement);
        }
    }, {
        key: "_generateDisclosureTrianglesIfNeeded",
        value: function _generateDisclosureTrianglesIfNeeded() {
            if (WebInspector.NavigationSidebarPanel._generatedDisclosureTriangles) return;

            // Set this early instead of in _generateDisclosureTriangle because we don't want multiple panels that are
            // created at the same time to duplicate the work (even though it would be harmless.)
            WebInspector.NavigationSidebarPanel._generatedDisclosureTriangles = true;

            var specifications = {};
            specifications[WebInspector.NavigationSidebarPanel.DisclosureTriangleNormalCanvasIdentifierSuffix] = {
                fillColor: [140, 140, 140]
            };

            specifications[WebInspector.NavigationSidebarPanel.DisclosureTriangleSelectedCanvasIdentifierSuffix] = {
                fillColor: [255, 255, 255]
            };

            generateColoredImagesForCSS("Images/DisclosureTriangleSmallOpen.svg", specifications, 13, 13, WebInspector.NavigationSidebarPanel.DisclosureTriangleOpenCanvasIdentifier);
            generateColoredImagesForCSS("Images/DisclosureTriangleSmallClosed.svg", specifications, 13, 13, WebInspector.NavigationSidebarPanel.DisclosureTriangleClosedCanvasIdentifier);
        }
    }, {
        key: "_checkForStaleResourcesIfNeeded",
        value: function _checkForStaleResourcesIfNeeded() {
            if (!this._checkForStaleResourcesTimeoutIdentifier || !this._shouldAutoPruneStaleTopLevelResourceTreeElements) return;
            this.pruneStaleResourceTreeElements();
        }
    }, {
        key: "_checkForStaleResources",
        value: function _checkForStaleResources(event) {
            console.assert(this._shouldAutoPruneStaleTopLevelResourceTreeElements);

            if (this._checkForStaleResourcesTimeoutIdentifier) return;

            // Check on a delay to coalesce multiple calls to _checkForStaleResources.
            this._checkForStaleResourcesTimeoutIdentifier = setTimeout(this.pruneStaleResourceTreeElements.bind(this));
        }
    }, {
        key: "_isTreeElementWithoutRepresentedObject",
        value: function _isTreeElementWithoutRepresentedObject(treeElement) {
            return treeElement instanceof WebInspector.FolderTreeElement || treeElement instanceof WebInspector.DatabaseHostTreeElement || typeof treeElement.representedObject === "string" || treeElement.representedObject instanceof String;
        }
    }, {
        key: "_checkOutlinesForPendingViewStateCookie",
        value: function _checkOutlinesForPendingViewStateCookie(matchTypeOnly) {
            if (!this._pendingViewStateCookie) return;

            this._checkForStaleResourcesIfNeeded();

            var visibleTreeElements = [];
            this._visibleContentTreeOutlines.forEach(function (outline) {
                var currentTreeElement = outline.hasChildren ? outline.children[0] : null;
                while (currentTreeElement) {
                    visibleTreeElements.push(currentTreeElement);
                    currentTreeElement = currentTreeElement.traverseNextTreeElement(false, null, false);
                }
            });

            return this._checkElementsForPendingViewStateCookie(visibleTreeElements, matchTypeOnly);
        }
    }, {
        key: "_checkElementsForPendingViewStateCookie",
        value: function _checkElementsForPendingViewStateCookie(treeElements, matchTypeOnly) {
            if (!this._pendingViewStateCookie) return;

            var cookie = this._pendingViewStateCookie;

            function treeElementMatchesCookie(treeElement) {
                if (this._isTreeElementWithoutRepresentedObject(treeElement)) return false;

                var representedObject = treeElement.representedObject;
                if (!representedObject) return false;

                var typeIdentifier = cookie[WebInspector.TypeIdentifierCookieKey];
                if (typeIdentifier !== representedObject.constructor.TypeIdentifier) return false;

                if (matchTypeOnly) return true;

                var candidateObjectCookie = {};
                if (representedObject.saveIdentityToCookie) representedObject.saveIdentityToCookie(candidateObjectCookie);

                var candidateCookieKeys = Object.keys(candidateObjectCookie);
                return candidateCookieKeys.length && candidateCookieKeys.every(function valuesMatchForKey(key) {
                    return candidateObjectCookie[key] === cookie[key];
                });
            }

            var matchedElement = null;
            treeElements.some(function (element) {
                if (treeElementMatchesCookie.call(this, element)) {
                    matchedElement = element;
                    return true;
                }
            }, this);

            if (matchedElement) {
                this.showDefaultContentViewForTreeElement(matchedElement);

                delete this._pendingViewStateCookie;

                // Delay clearing the restoringState flag until the next runloop so listeners
                // checking for it in this runloop still know state was being restored.
                setTimeout((function () {
                    delete this._restoringState;
                }).bind(this));

                if (this._finalAttemptToRestoreViewStateTimeout) {
                    clearTimeout(this._finalAttemptToRestoreViewStateTimeout);
                    delete this._finalAttemptToRestoreViewStateTimeout;
                }
            }
        }
    }, {
        key: "contentBrowser",
        get: function get() {
            return this._contentBrowser;
        },
        set: function set(contentBrowser) {
            this._contentBrowser = contentBrowser || null;
        }
    }, {
        key: "contentTreeOutlineElement",
        get: function get() {
            return this._contentTreeOutline.element;
        }
    }, {
        key: "contentTreeOutline",
        get: function get() {
            return this._contentTreeOutline;
        },
        set: function set(newTreeOutline) {
            console.assert(newTreeOutline);
            if (!newTreeOutline) return;

            if (this._contentTreeOutline) this._contentTreeOutline.element.classList.add(WebInspector.NavigationSidebarPanel.ContentTreeOutlineElementHiddenStyleClassName);

            this._contentTreeOutline = newTreeOutline;
            this._contentTreeOutline.element.classList.remove(WebInspector.NavigationSidebarPanel.ContentTreeOutlineElementHiddenStyleClassName);

            this._visibleContentTreeOutlines["delete"](this._contentTreeOutline);
            this._visibleContentTreeOutlines.add(newTreeOutline);

            this._updateFilter();
        }
    }, {
        key: "visibleContentTreeOutlines",
        get: function get() {
            return this._visibleContentTreeOutlines;
        }
    }, {
        key: "hasSelectedElement",
        get: function get() {
            return !!this._contentTreeOutline.selectedTreeElement;
        }
    }, {
        key: "filterBar",
        get: function get() {
            return this._filterBar;
        }
    }, {
        key: "restoringState",
        get: function get() {
            return this._restoringState;
        }
    }]);

    return NavigationSidebarPanel;
})(WebInspector.SidebarPanel);

WebInspector.NavigationSidebarPanel.OverflowShadowElementStyleClassName = "overflow-shadow";
WebInspector.NavigationSidebarPanel.TopOverflowShadowElementStyleClassName = "top";
WebInspector.NavigationSidebarPanel.ContentTreeOutlineElementHiddenStyleClassName = "hidden";
WebInspector.NavigationSidebarPanel.ContentTreeOutlineElementStyleClassName = "navigation-sidebar-panel-content-tree-outline";
WebInspector.NavigationSidebarPanel.HideDisclosureButtonsStyleClassName = "hide-disclosure-buttons";
WebInspector.NavigationSidebarPanel.EmptyContentPlaceholderElementStyleClassName = "empty-content-placeholder";
WebInspector.NavigationSidebarPanel.EmptyContentPlaceholderMessageElementStyleClassName = "message";
WebInspector.NavigationSidebarPanel.DisclosureTriangleOpenCanvasIdentifier = "navigation-sidebar-panel-disclosure-triangle-open";
WebInspector.NavigationSidebarPanel.DisclosureTriangleClosedCanvasIdentifier = "navigation-sidebar-panel-disclosure-triangle-closed";
WebInspector.NavigationSidebarPanel.DisclosureTriangleNormalCanvasIdentifierSuffix = "-normal";
WebInspector.NavigationSidebarPanel.DisclosureTriangleSelectedCanvasIdentifierSuffix = "-selected";
