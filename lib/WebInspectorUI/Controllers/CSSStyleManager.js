var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

WebInspector.CSSStyleManager = (function (_WebInspector$Object) {
    _inherits(CSSStyleManager, _WebInspector$Object);

    function CSSStyleManager() {
        _classCallCheck(this, CSSStyleManager);

        _get(Object.getPrototypeOf(CSSStyleManager.prototype), "constructor", this).call(this);

        if (window.CSSAgent) CSSAgent.enable();

        WebInspector.Frame.addEventListener(WebInspector.Frame.Event.MainResourceDidChange, this._mainResourceDidChange, this);
        WebInspector.Frame.addEventListener(WebInspector.Frame.Event.ResourceWasAdded, this._resourceAdded, this);
        WebInspector.Resource.addEventListener(WebInspector.SourceCode.Event.ContentDidChange, this._resourceContentDidChange, this);
        WebInspector.Resource.addEventListener(WebInspector.Resource.Event.TypeDidChange, this._resourceTypeDidChange, this);

        WebInspector.DOMNode.addEventListener(WebInspector.DOMNode.Event.AttributeModified, this._nodeAttributesDidChange, this);
        WebInspector.DOMNode.addEventListener(WebInspector.DOMNode.Event.AttributeRemoved, this._nodeAttributesDidChange, this);
        WebInspector.DOMNode.addEventListener(WebInspector.DOMNode.Event.EnabledPseudoClassesChanged, this._nodePseudoClassesDidChange, this);

        this._colorFormatSetting = new WebInspector.Setting("default-color-format", WebInspector.Color.Format.Original);

        this._styleSheetIdentifierMap = new Map();
        this._styleSheetFrameURLMap = new Map();
        this._nodeStylesMap = {};

        // COMPATIBILITY (iOS 9): Legacy backends did not send stylesheet
        // added/removed events and must be fetched manually.
        this._fetchedInitialStyleSheets = window.CSSAgent && window.CSSAgent.hasEvent("styleSheetAdded");
    }

    // Static

    _createClass(CSSStyleManager, [{
        key: "canForcePseudoClasses",
        value: function canForcePseudoClasses() {
            return window.CSSAgent && !!CSSAgent.forcePseudoState;
        }
    }, {
        key: "propertyNameHasOtherVendorPrefix",
        value: function propertyNameHasOtherVendorPrefix(name) {
            if (!name || name.length < 4 || name.charAt(0) !== "-") return false;

            var match = name.match(/^(?:-moz-|-ms-|-o-|-epub-)/);
            if (!match) return false;

            return true;
        }
    }, {
        key: "propertyValueHasOtherVendorKeyword",
        value: function propertyValueHasOtherVendorKeyword(value) {
            var match = value.match(/(?:-moz-|-ms-|-o-|-epub-)[-\w]+/);
            if (!match) return false;

            return true;
        }
    }, {
        key: "canonicalNameForPropertyName",
        value: function canonicalNameForPropertyName(name) {
            if (!name || name.length < 8 || name.charAt(0) !== "-") return name;

            var match = name.match(/^(?:-webkit-|-khtml-|-apple-)(.+)/);
            if (!match) return name;

            return match[1];
        }
    }, {
        key: "fetchStyleSheetsIfNeeded",
        value: function fetchStyleSheetsIfNeeded() {
            if (this._fetchedInitialStyleSheets) return;

            this._fetchInfoForAllStyleSheets(function () {});
        }
    }, {
        key: "styleSheetForIdentifier",
        value: function styleSheetForIdentifier(id) {
            var styleSheet = this._styleSheetIdentifierMap.get(id);
            if (styleSheet) return styleSheet;

            styleSheet = new WebInspector.CSSStyleSheet(id);
            this._styleSheetIdentifierMap.set(id, styleSheet);
            return styleSheet;
        }
    }, {
        key: "stylesForNode",
        value: function stylesForNode(node) {
            if (node.id in this._nodeStylesMap) return this._nodeStylesMap[node.id];

            var styles = new WebInspector.DOMNodeStyles(node);
            this._nodeStylesMap[node.id] = styles;
            return styles;
        }
    }, {
        key: "preferredInspectorStyleSheetForFrame",
        value: function preferredInspectorStyleSheetForFrame(frame, callback) {
            var inspectorStyleSheets = this._inspectorStyleSheetsForFrame(frame);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = inspectorStyleSheets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var styleSheet = _step.value;

                    if (styleSheet[WebInspector.CSSStyleManager.PreferredInspectorStyleSheetSymbol]) {
                        callback(styleSheet);
                        return;
                    }
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

            if (CSSAgent.createStyleSheet) {
                CSSAgent.createStyleSheet(frame.id, function (error, styleSheetId) {
                    var styleSheet = WebInspector.cssStyleManager.styleSheetForIdentifier(styleSheetId);
                    styleSheet[WebInspector.CSSStyleManager.PreferredInspectorStyleSheetSymbol] = true;
                    callback(styleSheet);
                });
                return;
            }

            // COMPATIBILITY (iOS 9): CSS.createStyleSheet did not exist.
            // Legacy backends can only create the Inspector StyleSheet through CSS.addRule.
            // Exploit that to create the Inspector StyleSheet for the document.body node in
            // this frame, then get the StyleSheet for the new rule.

            var expression = appendWebInspectorSourceURL("document");
            var contextId = frame.pageExecutionContext.id;
            RuntimeAgent.evaluate.invoke({ expression: expression, objectGroup: "", includeCommandLineAPI: false, doNotPauseOnExceptionsAndMuteConsole: true, contextId: contextId, returnByValue: false, generatePreview: false }, documentAvailable);

            function documentAvailable(error, documentRemoteObjectPayload) {
                if (error) {
                    callback(null);
                    return;
                }

                var remoteObject = WebInspector.RemoteObject.fromPayload(documentRemoteObjectPayload);
                remoteObject.pushNodeToFrontend(documentNodeAvailable.bind(null, remoteObject));
            }

            function documentNodeAvailable(remoteObject, documentNodeId) {
                remoteObject.release();

                if (!documentNodeId) {
                    callback(null);
                    return;
                }

                DOMAgent.querySelector(documentNodeId, "body", bodyNodeAvailable);
            }

            function bodyNodeAvailable(error, bodyNodeId) {
                if (error) {
                    console.error(error);
                    callback(null);
                    return;
                }

                var selector = ""; // Intentionally empty.
                CSSAgent.addRule(bodyNodeId, selector, cssRuleAvailable);
            }

            function cssRuleAvailable(error, payload) {
                if (error || !payload.ruleId) {
                    callback(null);
                    return;
                }

                var styleSheetId = payload.ruleId.styleSheetId;
                var styleSheet = WebInspector.cssStyleManager.styleSheetForIdentifier(styleSheetId);
                if (!styleSheet) {
                    callback(null);
                    return;
                }

                styleSheet[WebInspector.CSSStyleManager.PreferredInspectorStyleSheetSymbol] = true;

                console.assert(styleSheet.isInspectorStyleSheet());
                console.assert(styleSheet.parentFrame === frame);

                callback(styleSheet);
            }
        }

        // Protected

    }, {
        key: "mediaQueryResultChanged",
        value: function mediaQueryResultChanged() {
            // Called from WebInspector.CSSObserver.

            for (var key in this._nodeStylesMap) this._nodeStylesMap[key].mediaQueryResultDidChange();
        }
    }, {
        key: "styleSheetChanged",
        value: function styleSheetChanged(styleSheetIdentifier) {
            // Called from WebInspector.CSSObserver.
            var styleSheet = this.styleSheetForIdentifier(styleSheetIdentifier);
            console.assert(styleSheet);

            // Do not observe inline styles
            if (styleSheet.isInlineStyleAttributeStyleSheet()) return;

            styleSheet.noteContentDidChange();
            this._updateResourceContent(styleSheet);
        }
    }, {
        key: "styleSheetAdded",
        value: function styleSheetAdded(styleSheetInfo) {
            console.assert(!this._styleSheetIdentifierMap.has(styleSheetInfo.styleSheetId), "Attempted to add a CSSStyleSheet but identifier was already in use");
            var styleSheet = this.styleSheetForIdentifier(styleSheetInfo.styleSheetId);
            var parentFrame = WebInspector.frameResourceManager.frameForIdentifier(styleSheetInfo.frameId);
            var origin = WebInspector.CSSStyleManager.protocolStyleSheetOriginToEnum(styleSheetInfo.origin);
            styleSheet.updateInfo(styleSheetInfo.sourceURL, parentFrame, origin, styleSheetInfo.isInline, styleSheetInfo.startLine, styleSheetInfo.startColumn);

            this.dispatchEventToListeners(WebInspector.CSSStyleManager.Event.StyleSheetAdded, { styleSheet: styleSheet });
        }
    }, {
        key: "styleSheetRemoved",
        value: function styleSheetRemoved(styleSheetIdentifier) {
            var styleSheet = this._styleSheetIdentifierMap.get(styleSheetIdentifier);
            console.assert(styleSheet, "Attempted to remove a CSSStyleSheet that was not tracked");
            if (!styleSheet) return;

            this._styleSheetIdentifierMap["delete"](styleSheetIdentifier);

            this.dispatchEventToListeners(WebInspector.CSSStyleManager.Event.StyleSheetRemoved, { styleSheet: styleSheet });
        }

        // Private

    }, {
        key: "_inspectorStyleSheetsForFrame",
        value: function _inspectorStyleSheetsForFrame(frame) {
            var styleSheets = [];

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.styleSheets[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var styleSheet = _step2.value;

                    if (styleSheet.isInspectorStyleSheet() && styleSheet.parentFrame === frame) styleSheets.push(styleSheet);
                }
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

            return styleSheets;
        }
    }, {
        key: "_nodePseudoClassesDidChange",
        value: function _nodePseudoClassesDidChange(event) {
            var node = event.target;

            for (var key in this._nodeStylesMap) {
                var nodeStyles = this._nodeStylesMap[key];
                if (nodeStyles.node !== node && !nodeStyles.node.isDescendant(node)) continue;
                nodeStyles.pseudoClassesDidChange(node);
            }
        }
    }, {
        key: "_nodeAttributesDidChange",
        value: function _nodeAttributesDidChange(event) {
            var node = event.target;

            for (var key in this._nodeStylesMap) {
                var nodeStyles = this._nodeStylesMap[key];
                if (nodeStyles.node !== node && !nodeStyles.node.isDescendant(node)) continue;
                nodeStyles.attributeDidChange(node, event.data.name);
            }
        }
    }, {
        key: "_mainResourceDidChange",
        value: function _mainResourceDidChange(event) {
            console.assert(event.target instanceof WebInspector.Frame);

            if (!event.target.isMainFrame()) return;

            // Clear our maps when the main frame navigates.

            this._fetchedInitialStyleSheets = window.CSSAgent && window.CSSAgent.hasEvent("styleSheetAdded");
            this._styleSheetIdentifierMap.clear();
            this._styleSheetFrameURLMap.clear();
            this._nodeStylesMap = {};
        }
    }, {
        key: "_resourceAdded",
        value: function _resourceAdded(event) {
            console.assert(event.target instanceof WebInspector.Frame);

            var resource = event.data.resource;
            console.assert(resource);

            if (resource.type !== WebInspector.Resource.Type.Stylesheet) return;

            this._clearStyleSheetsForResource(resource);
        }
    }, {
        key: "_resourceTypeDidChange",
        value: function _resourceTypeDidChange(event) {
            console.assert(event.target instanceof WebInspector.Resource);

            var resource = event.target;
            if (resource.type !== WebInspector.Resource.Type.Stylesheet) return;

            this._clearStyleSheetsForResource(resource);
        }
    }, {
        key: "_clearStyleSheetsForResource",
        value: function _clearStyleSheetsForResource(resource) {
            // Clear known stylesheets for this URL and frame. This will cause the stylesheets to
            // be updated next time _fetchInfoForAllStyleSheets is called.
            this._styleSheetIdentifierMap["delete"](this._frameURLMapKey(resource.parentFrame, resource.url));
        }
    }, {
        key: "_frameURLMapKey",
        value: function _frameURLMapKey(frame, url) {
            return frame.id + ":" + url;
        }
    }, {
        key: "_lookupStyleSheetForResource",
        value: function _lookupStyleSheetForResource(resource, callback) {
            this._lookupStyleSheet(resource.parentFrame, resource.url, callback);
        }
    }, {
        key: "_lookupStyleSheet",
        value: function _lookupStyleSheet(frame, url, callback) {
            console.assert(frame instanceof WebInspector.Frame);

            var key = this._frameURLMapKey(frame, url);

            function styleSheetsFetched() {
                callback(this._styleSheetFrameURLMap.get(key) || null);
            }

            var styleSheet = this._styleSheetFrameURLMap.get(key) || null;
            if (styleSheet) callback(styleSheet);else this._fetchInfoForAllStyleSheets(styleSheetsFetched.bind(this));
        }
    }, {
        key: "_fetchInfoForAllStyleSheets",
        value: function _fetchInfoForAllStyleSheets(callback) {
            console.assert(typeof callback === "function");

            function processStyleSheets(error, styleSheets) {
                this._styleSheetFrameURLMap.clear();

                if (error) {
                    callback();
                    return;
                }

                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = styleSheets[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var styleSheetInfo = _step3.value;

                        var parentFrame = WebInspector.frameResourceManager.frameForIdentifier(styleSheetInfo.frameId);
                        var _origin = WebInspector.CSSStyleManager.protocolStyleSheetOriginToEnum(styleSheetInfo.origin);

                        // COMPATIBILITY (iOS 9): The info did not have 'isInline', 'startLine', and 'startColumn', so make false and 0 in these cases.
                        var isInline = styleSheetInfo.isInline || false;
                        var startLine = styleSheetInfo.startLine || 0;
                        var startColumn = styleSheetInfo.startColumn || 0;

                        var styleSheet = this.styleSheetForIdentifier(styleSheetInfo.styleSheetId);
                        styleSheet.updateInfo(styleSheetInfo.sourceURL, parentFrame, _origin, isInline, startLine, startColumn);

                        var key = this._frameURLMapKey(parentFrame, styleSheetInfo.sourceURL);
                        this._styleSheetFrameURLMap.set(key, styleSheet);
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

                callback();
            }

            CSSAgent.getAllStyleSheets(processStyleSheets.bind(this));
        }
    }, {
        key: "_resourceContentDidChange",
        value: function _resourceContentDidChange(event) {
            var resource = event.target;
            if (resource === this._ignoreResourceContentDidChangeEventForResource) return;

            // Ignore if it isn't a CSS stylesheet.
            if (resource.type !== WebInspector.Resource.Type.Stylesheet || resource.syntheticMIMEType !== "text/css") return;

            function applyStyleSheetChanges() {
                function styleSheetFound(styleSheet) {
                    resource.__pendingChangeTimeout = undefined;

                    console.assert(styleSheet);
                    if (!styleSheet) return;

                    // To prevent updating a TextEditor's content while the user is typing in it we want to
                    // ignore the next _updateResourceContent call.
                    resource.__ignoreNextUpdateResourceContent = true;

                    WebInspector.branchManager.currentBranch.revisionForRepresentedObject(styleSheet).content = resource.content;
                }

                this._lookupStyleSheetForResource(resource, styleSheetFound.bind(this));
            }

            if (resource.__pendingChangeTimeout) clearTimeout(resource.__pendingChangeTimeout);
            resource.__pendingChangeTimeout = setTimeout(applyStyleSheetChanges.bind(this), 500);
        }
    }, {
        key: "_updateResourceContent",
        value: function _updateResourceContent(styleSheet) {
            console.assert(styleSheet);

            function fetchedStyleSheetContent(parameters) {
                var styleSheet = parameters.sourceCode;
                var content = parameters.content;

                styleSheet.__pendingChangeTimeout = undefined;

                console.assert(styleSheet.url);
                if (!styleSheet.url) return;

                var resource = styleSheet.parentFrame.resourceForURL(styleSheet.url);;
                if (!resource) return;

                // Only try to update stylesheet resources. Other resources, like documents, can contain
                // multiple stylesheets and we don't have the source ranges to update those.
                if (resource.type !== WebInspector.Resource.Type.Stylesheet) return;

                if (resource.__ignoreNextUpdateResourceContent) {
                    resource.__ignoreNextUpdateResourceContent = false;
                    return;
                }

                this._ignoreResourceContentDidChangeEventForResource = resource;
                WebInspector.branchManager.currentBranch.revisionForRepresentedObject(resource).content = content;
                this._ignoreResourceContentDidChangeEventForResource = null;
            }

            function styleSheetReady() {
                styleSheet.requestContent().then(fetchedStyleSheetContent.bind(this));
            }

            function applyStyleSheetChanges() {
                if (styleSheet.url) styleSheetReady.call(this);else this._fetchInfoForAllStyleSheets(styleSheetReady.bind(this));
            }

            if (styleSheet.__pendingChangeTimeout) clearTimeout(styleSheet.__pendingChangeTimeout);
            styleSheet.__pendingChangeTimeout = setTimeout(applyStyleSheetChanges.bind(this), 500);
        }
    }, {
        key: "preferredColorFormat",

        // Public

        get: function get() {
            return this._colorFormatSetting.value;
        }
    }, {
        key: "styleSheets",
        get: function get() {
            return [].concat(_toConsumableArray(this._styleSheetIdentifierMap.values()));
        }
    }], [{
        key: "protocolStyleSheetOriginToEnum",
        value: function protocolStyleSheetOriginToEnum(origin) {
            switch (origin) {
                case CSSAgent.StyleSheetOrigin.Regular:
                    return WebInspector.CSSStyleSheet.Type.Author;
                case CSSAgent.StyleSheetOrigin.User:
                    return WebInspector.CSSStyleSheet.Type.User;
                case CSSAgent.StyleSheetOrigin.UserAgent:
                    return WebInspector.CSSStyleSheet.Type.UserAgent;
                case CSSAgent.StyleSheetOrigin.Inspector:
                    return WebInspector.CSSStyleSheet.Type.Inspector;
                default:
                    console.assert(false, "Unknown CSS.StyleSheetOrigin", origin);
                    return CSSAgent.StyleSheetOrigin.Regular;
            }
        }
    }, {
        key: "protocolMediaSourceToEnum",
        value: function protocolMediaSourceToEnum(source) {
            switch (source) {
                case CSSAgent.CSSMediaSource.MediaRule:
                    return WebInspector.CSSMedia.Type.MediaRule;
                case CSSAgent.CSSMediaSource.ImportRule:
                    return WebInspector.CSSMedia.Type.ImportRule;
                case CSSAgent.CSSMediaSource.LinkedSheet:
                    return WebInspector.CSSMedia.Type.LinkedStyleSheet;
                case CSSAgent.CSSMediaSource.InlineSheet:
                    return WebInspector.CSSMedia.Type.InlineStyleSheet;
                default:
                    console.assert(false, "Unknown CSS.CSSMediaSource", origin);
                    return WebInspector.CSSMedia.Type.MediaRule;
            }
        }
    }]);

    return CSSStyleManager;
})(WebInspector.Object);

WebInspector.CSSStyleManager.Event = {
    StyleSheetAdded: "css-style-manager-style-sheet-added",
    StyleSheetRemoved: "css-style-manager-style-sheet-removed"
};

WebInspector.CSSStyleManager.ForceablePseudoClasses = ["active", "focus", "hover", "visited"];
WebInspector.CSSStyleManager.PreferredInspectorStyleSheetSymbol = Symbol("css-style-manager-preferred-inspector-stylesheet");
