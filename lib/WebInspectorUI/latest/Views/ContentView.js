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

WebInspector.ContentView = (function (_WebInspector$Object) {
    _inherits(ContentView, _WebInspector$Object);

    function ContentView(representedObject, extraArguments) {
        _classCallCheck(this, ContentView);

        // Concrete object instantiation.
        console.assert(!representedObject || WebInspector.ContentView.isViewable(representedObject), representedObject);

        _get(Object.getPrototypeOf(ContentView.prototype), "constructor", this).call(this);

        this._representedObject = representedObject;

        this._element = document.createElement("div");
        this._element.classList.add("content-view");

        this._parentContainer = null;
    }

    // Public

    _createClass(ContentView, [{
        key: "updateLayout",
        value: function updateLayout() {
            // Implemented by subclasses.
        }
    }, {
        key: "shown",
        value: function shown() {
            // Implemented by subclasses.
        }
    }, {
        key: "hidden",
        value: function hidden() {
            // Implemented by subclasses.
        }
    }, {
        key: "closed",
        value: function closed() {
            // Implemented by subclasses.
        }
    }, {
        key: "saveToCookie",
        value: function saveToCookie(cookie) {
            // Implemented by subclasses.
        }
    }, {
        key: "restoreFromCookie",
        value: function restoreFromCookie(cookie) {
            // Implemented by subclasses.
        }
    }, {
        key: "canGoBack",
        value: function canGoBack() {
            // Implemented by subclasses.
            return false;
        }
    }, {
        key: "canGoForward",
        value: function canGoForward() {
            // Implemented by subclasses.
            return false;
        }
    }, {
        key: "goBack",
        value: function goBack() {
            // Implemented by subclasses.
        }
    }, {
        key: "goForward",
        value: function goForward() {
            // Implemented by subclasses.
        }
    }, {
        key: "performSearch",

        // Implemented by subclasses.
        value: function performSearch(query) {
            // Implemented by subclasses.
        }
    }, {
        key: "searchCleared",
        value: function searchCleared() {
            // Implemented by subclasses.
        }
    }, {
        key: "searchQueryWithSelection",
        value: function searchQueryWithSelection() {
            // Implemented by subclasses.
            return null;
        }
    }, {
        key: "revealPreviousSearchResult",
        value: function revealPreviousSearchResult(changeFocus) {
            // Implemented by subclasses.
        }
    }, {
        key: "revealNextSearchResult",
        value: function revealNextSearchResult(changeFocus) {
            // Implemented by subclasses.
        }
    }, {
        key: "representedObject",

        // Public

        get: function get() {
            return this._representedObject;
        }
    }, {
        key: "navigationItems",
        get: function get() {
            // Navigation items that will be displayed by the ContentBrowser instance,
            // meant to be subclassed. Implemented by subclasses.
            return [];
        }
    }, {
        key: "element",
        get: function get() {
            return this._element;
        }
    }, {
        key: "parentContainer",
        get: function get() {
            return this._parentContainer;
        }
    }, {
        key: "visible",
        get: function get() {
            return this._visible;
        },
        set: function set(flag) {
            this._visible = flag;
        }
    }, {
        key: "scrollableElements",
        get: function get() {
            // Implemented by subclasses.
            return [];
        }
    }, {
        key: "shouldKeepElementsScrolledToBottom",
        get: function get() {
            // Implemented by subclasses.
            return false;
        }
    }, {
        key: "selectionPathComponents",
        get: function get() {
            // Implemented by subclasses.
            return [];
        }
    }, {
        key: "supplementalRepresentedObjects",
        get: function get() {
            // Implemented by subclasses.
            return [];
        }
    }, {
        key: "supportsSplitContentBrowser",
        get: function get() {
            // Implemented by subclasses.
            return true;
        }
    }, {
        key: "supportsSearch",
        get: function get() {
            // Implemented by subclasses.
            return false;
        }
    }, {
        key: "numberOfSearchResults",
        get: function get() {
            // Implemented by subclasses.
            return null;
        }
    }, {
        key: "hasPerformedSearch",
        get: function get() {
            // Implemented by subclasses.
            return false;
        }
    }, {
        key: "automaticallyRevealFirstSearchResult",
        set: function set(reveal) {}
    }], [{
        key: "createFromRepresentedObject",
        value: function createFromRepresentedObject(representedObject, extraArguments) {
            console.assert(representedObject);

            if (representedObject instanceof WebInspector.Frame) return new WebInspector.ResourceClusterContentView(representedObject.mainResource, extraArguments);

            if (representedObject instanceof WebInspector.Resource) return new WebInspector.ResourceClusterContentView(representedObject, extraArguments);

            if (representedObject instanceof WebInspector.Script) return new WebInspector.ScriptContentView(representedObject, extraArguments);

            if (representedObject instanceof WebInspector.TimelineRecording) return new WebInspector.TimelineRecordingContentView(representedObject, extraArguments);

            if (representedObject instanceof WebInspector.Timeline) {
                var timelineType = representedObject.type;
                if (timelineType === WebInspector.TimelineRecord.Type.Network) return new WebInspector.NetworkTimelineView(representedObject, extraArguments);

                if (timelineType === WebInspector.TimelineRecord.Type.Layout) return new WebInspector.LayoutTimelineView(representedObject, extraArguments);

                if (timelineType === WebInspector.TimelineRecord.Type.Script) return new WebInspector.ScriptTimelineView(representedObject, extraArguments);

                if (timelineType === WebInspector.TimelineRecord.Type.RenderingFrame) return new WebInspector.RenderingFrameTimelineView(representedObject, extraArguments);
            }

            if (representedObject instanceof WebInspector.Breakpoint) {
                if (representedObject.sourceCodeLocation) return WebInspector.ContentView.createFromRepresentedObject(representedObject.sourceCodeLocation.displaySourceCode, extraArguments);
            }

            if (representedObject instanceof WebInspector.DOMStorageObject) return new WebInspector.DOMStorageContentView(representedObject, extraArguments);

            if (representedObject instanceof WebInspector.CookieStorageObject) return new WebInspector.CookieStorageContentView(representedObject, extraArguments);

            if (representedObject instanceof WebInspector.DatabaseTableObject) return new WebInspector.DatabaseTableContentView(representedObject, extraArguments);

            if (representedObject instanceof WebInspector.DatabaseObject) return new WebInspector.DatabaseContentView(representedObject, extraArguments);

            if (representedObject instanceof WebInspector.IndexedDatabaseObjectStore) return new WebInspector.IndexedDatabaseObjectStoreContentView(representedObject, extraArguments);

            if (representedObject instanceof WebInspector.IndexedDatabaseObjectStoreIndex) return new WebInspector.IndexedDatabaseObjectStoreContentView(representedObject, extraArguments);

            if (representedObject instanceof WebInspector.ApplicationCacheFrame) return new WebInspector.ApplicationCacheFrameContentView(representedObject, extraArguments);

            if (representedObject instanceof WebInspector.DOMTree) return new WebInspector.FrameDOMTreeContentView(representedObject, extraArguments);

            if (representedObject instanceof WebInspector.DOMSearchMatchObject) {
                var resultView = new WebInspector.FrameDOMTreeContentView(WebInspector.frameResourceManager.mainFrame.domTree, extraArguments);
                resultView.restoreFromCookie({ nodeToSelect: representedObject.domNode });
                return resultView;
            }

            if (representedObject instanceof WebInspector.SourceCodeSearchMatchObject) {
                var resultView;
                if (representedObject.sourceCode instanceof WebInspector.Resource) resultView = new WebInspector.ResourceClusterContentView(representedObject.sourceCode, extraArguments);else if (representedObject.sourceCode instanceof WebInspector.Script) resultView = new WebInspector.ScriptContentView(representedObject.sourceCode, extraArguments);else console.error("Unknown SourceCode", representedObject.sourceCode);

                var textRangeToSelect = representedObject.sourceCodeTextRange.formattedTextRange;
                var startPosition = textRangeToSelect.startPosition();
                resultView.restoreFromCookie({ lineNumber: startPosition.lineNumber, columnNumber: startPosition.columnNumber });

                return resultView;
            }

            if (representedObject instanceof WebInspector.LogObject) return new WebInspector.LogContentView(representedObject, extraArguments);

            if (representedObject instanceof WebInspector.ContentFlow) return new WebInspector.ContentFlowDOMTreeContentView(representedObject, extraArguments);

            if (typeof representedObject === "string" || representedObject instanceof String) return new WebInspector.TextContentView(representedObject, extraArguments);

            console.assert(!WebInspector.ContentView.isViewable(representedObject));

            throw new Error("Can't make a ContentView for an unknown representedObject.");
        }
    }, {
        key: "isViewable",
        value: function isViewable(representedObject) {
            if (representedObject instanceof WebInspector.Frame) return true;
            if (representedObject instanceof WebInspector.Resource) return true;
            if (representedObject instanceof WebInspector.Script) return true;
            if (representedObject instanceof WebInspector.TimelineRecording) return true;
            if (representedObject instanceof WebInspector.Timeline) return true;
            if (representedObject instanceof WebInspector.Breakpoint) return representedObject.sourceCodeLocation;
            if (representedObject instanceof WebInspector.DOMStorageObject) return true;
            if (representedObject instanceof WebInspector.CookieStorageObject) return true;
            if (representedObject instanceof WebInspector.DatabaseTableObject) return true;
            if (representedObject instanceof WebInspector.DatabaseObject) return true;
            if (representedObject instanceof WebInspector.IndexedDatabaseObjectStore) return true;
            if (representedObject instanceof WebInspector.IndexedDatabaseObjectStoreIndex) return true;
            if (representedObject instanceof WebInspector.ApplicationCacheFrame) return true;
            if (representedObject instanceof WebInspector.DOMTree) return true;
            if (representedObject instanceof WebInspector.DOMSearchMatchObject) return true;
            if (representedObject instanceof WebInspector.SourceCodeSearchMatchObject) return true;
            if (representedObject instanceof WebInspector.LogObject) return true;
            if (representedObject instanceof WebInspector.ContentFlow) return true;
            if (typeof representedObject === "string" || representedObject instanceof String) return true;
            return false;
        }
    }]);

    return ContentView;
})(WebInspector.Object);

WebInspector.ContentView.Event = {
    SelectionPathComponentsDidChange: "content-view-selection-path-components-did-change",
    SupplementalRepresentedObjectsDidChange: "content-view-supplemental-represented-objects-did-change",
    NumberOfSearchResultsDidChange: "content-view-number-of-search-results-did-change",
    NavigationItemsDidChange: "content-view-navigation-items-did-change"
};
