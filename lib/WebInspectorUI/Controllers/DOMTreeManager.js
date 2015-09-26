var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2009, 2010 Google Inc. All rights reserved.
 * Copyright (C) 2009 Joseph Pecoraro
 * Copyright (C) 2013 Apple Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

WebInspector.DOMTreeManager = (function (_WebInspector$Object) {
    _inherits(DOMTreeManager, _WebInspector$Object);

    function DOMTreeManager() {
        _classCallCheck(this, DOMTreeManager);

        _get(Object.getPrototypeOf(DOMTreeManager.prototype), "constructor", this).call(this);

        this._idToDOMNode = {};
        this._document = null;
        this._attributeLoadNodeIds = {};
        this._flows = new Map();
        this._contentNodesToFlowsMap = new Map();
        this._restoreSelectedNodeIsAllowed = true;

        WebInspector.Frame.addEventListener(WebInspector.Frame.Event.MainResourceDidChange, this._mainResourceDidChange, this);
    }

    // Static

    _createClass(DOMTreeManager, [{
        key: "requestDocument",

        // Public

        value: function requestDocument(callback) {
            if (this._document) {
                callback(this._document);
                return;
            }

            if (this._pendingDocumentRequestCallbacks) {
                this._pendingDocumentRequestCallbacks.push(callback);
                return;
            }

            this._pendingDocumentRequestCallbacks = [callback];

            function onDocumentAvailable(error, root) {
                if (!error) this._setDocument(root);

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this._pendingDocumentRequestCallbacks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var _callback = _step.value;

                        _callback(this._document);
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

                this._pendingDocumentRequestCallbacks = null;
            }

            DOMAgent.getDocument(onDocumentAvailable.bind(this));
        }
    }, {
        key: "pushNodeToFrontend",
        value: function pushNodeToFrontend(objectId, callback) {
            this._dispatchWhenDocumentAvailable(DOMAgent.requestNode.bind(DOMAgent, objectId), callback);
        }
    }, {
        key: "pushNodeByPathToFrontend",
        value: function pushNodeByPathToFrontend(path, callback) {
            this._dispatchWhenDocumentAvailable(DOMAgent.pushNodeByPathToFrontend.bind(DOMAgent, path), callback);
        }

        // Private

    }, {
        key: "_wrapClientCallback",
        value: function _wrapClientCallback(callback) {
            if (!callback) return null;

            return function (error, result) {
                if (error) console.error("Error during DOMAgent operation: " + error);
                callback(error ? null : result);
            };
        }
    }, {
        key: "_dispatchWhenDocumentAvailable",
        value: function _dispatchWhenDocumentAvailable(func, callback) {
            var callbackWrapper = this._wrapClientCallback(callback);

            function onDocumentAvailable() {
                if (this._document) func(callbackWrapper);else {
                    if (callbackWrapper) callbackWrapper("No document");
                }
            }
            this.requestDocument(onDocumentAvailable.bind(this));
        }
    }, {
        key: "_attributeModified",
        value: function _attributeModified(nodeId, name, value) {
            var node = this._idToDOMNode[nodeId];
            if (!node) return;

            node._setAttribute(name, value);
            this.dispatchEventToListeners(WebInspector.DOMTreeManager.Event.AttributeModified, { node: node, name: name });
            node.dispatchEventToListeners(WebInspector.DOMNode.Event.AttributeModified, { name: name });
        }
    }, {
        key: "_attributeRemoved",
        value: function _attributeRemoved(nodeId, name) {
            var node = this._idToDOMNode[nodeId];
            if (!node) return;

            node._removeAttribute(name);
            this.dispatchEventToListeners(WebInspector.DOMTreeManager.Event.AttributeRemoved, { node: node, name: name });
            node.dispatchEventToListeners(WebInspector.DOMNode.Event.AttributeRemoved, { name: name });
        }
    }, {
        key: "_inlineStyleInvalidated",
        value: function _inlineStyleInvalidated(nodeIds) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = nodeIds[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var nodeId = _step2.value;

                    this._attributeLoadNodeIds[nodeId] = true;
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

            if ("_loadNodeAttributesTimeout" in this) return;
            this._loadNodeAttributesTimeout = setTimeout(this._loadNodeAttributes.bind(this), 0);
        }
    }, {
        key: "_loadNodeAttributes",
        value: function _loadNodeAttributes() {
            function callback(nodeId, error, attributes) {
                if (error) {
                    console.error("Error during DOMAgent operation: " + error);
                    return;
                }
                var node = this._idToDOMNode[nodeId];
                if (node) {
                    node._setAttributesPayload(attributes);
                    this.dispatchEventToListeners(WebInspector.DOMTreeManager.Event.AttributeModified, { node: node, name: "style" });
                    node.dispatchEventToListeners(WebInspector.DOMNode.Event.AttributeModified, { name: "style" });
                }
            }

            this._loadNodeAttributesTimeout = undefined;

            for (var nodeId in this._attributeLoadNodeIds) {
                var nodeIdAsNumber = parseInt(nodeId);
                DOMAgent.getAttributes(nodeIdAsNumber, callback.bind(this, nodeIdAsNumber));
            }
            this._attributeLoadNodeIds = {};
        }
    }, {
        key: "_characterDataModified",
        value: function _characterDataModified(nodeId, newValue) {
            var node = this._idToDOMNode[nodeId];
            node._nodeValue = newValue;
            this.dispatchEventToListeners(WebInspector.DOMTreeManager.Event.CharacterDataModified, { node: node });
        }
    }, {
        key: "nodeForId",
        value: function nodeForId(nodeId) {
            return this._idToDOMNode[nodeId];
        }
    }, {
        key: "_documentUpdated",
        value: function _documentUpdated() {
            this._setDocument(null);
        }
    }, {
        key: "_setDocument",
        value: function _setDocument(payload) {
            this._idToDOMNode = {};
            if (payload && "nodeId" in payload) this._document = new WebInspector.DOMNode(this, null, false, payload);else this._document = null;
            this.dispatchEventToListeners(WebInspector.DOMTreeManager.Event.DocumentUpdated, this._document);
        }
    }, {
        key: "_setDetachedRoot",
        value: function _setDetachedRoot(payload) {
            new WebInspector.DOMNode(this, null, false, payload);
        }
    }, {
        key: "_setChildNodes",
        value: function _setChildNodes(parentId, payloads) {
            if (!parentId && payloads.length) {
                this._setDetachedRoot(payloads[0]);
                return;
            }

            var parent = this._idToDOMNode[parentId];
            parent._setChildrenPayload(payloads);
        }
    }, {
        key: "_childNodeCountUpdated",
        value: function _childNodeCountUpdated(nodeId, newValue) {
            var node = this._idToDOMNode[nodeId];
            node.childNodeCount = newValue;
            this.dispatchEventToListeners(WebInspector.DOMTreeManager.Event.ChildNodeCountUpdated, node);
        }
    }, {
        key: "_childNodeInserted",
        value: function _childNodeInserted(parentId, prevId, payload) {
            var parent = this._idToDOMNode[parentId];
            var prev = this._idToDOMNode[prevId];
            var node = parent._insertChild(prev, payload);
            this._idToDOMNode[node.id] = node;
            this.dispatchEventToListeners(WebInspector.DOMTreeManager.Event.NodeInserted, { node: node, parent: parent });
        }
    }, {
        key: "_childNodeRemoved",
        value: function _childNodeRemoved(parentId, nodeId) {
            var parent = this._idToDOMNode[parentId];
            var node = this._idToDOMNode[nodeId];
            parent._removeChild(node);
            this._unbind(node);
            this.dispatchEventToListeners(WebInspector.DOMTreeManager.Event.NodeRemoved, { node: node, parent: parent });
        }
    }, {
        key: "_pseudoElementAdded",
        value: function _pseudoElementAdded(parentId, pseudoElement) {
            var parent = this._idToDOMNode[parentId];
            if (!parent) return;

            var node = new WebInspector.DOMNode(this, parent.ownerDocument, false, pseudoElement);
            node.parentNode = parent;
            this._idToDOMNode[node.id] = node;
            console.assert(!parent.pseudoElements().get(node.pseudoType()));
            parent.pseudoElements().set(node.pseudoType(), node);
            this.dispatchEventToListeners(WebInspector.DOMTreeManager.Event.NodeInserted, { node: node, parent: parent });
        }
    }, {
        key: "_pseudoElementRemoved",
        value: function _pseudoElementRemoved(parentId, pseudoElementId) {
            var pseudoElement = this._idToDOMNode[pseudoElementId];
            if (!pseudoElement) return;

            var parent = pseudoElement.parentNode;
            console.assert(parent);
            console.assert(parent.id === parentId);
            if (!parent) return;

            parent._removeChild(pseudoElement);
            this._unbind(pseudoElement);
            this.dispatchEventToListeners(WebInspector.DOMTreeManager.Event.NodeRemoved, { node: pseudoElement, parent: parent });
        }
    }, {
        key: "_unbind",
        value: function _unbind(node) {
            this._removeContentNodeFromFlowIfNeeded(node);

            delete this._idToDOMNode[node.id];

            for (var i = 0; node.children && i < node.children.length; ++i) {
                this._unbind(node.children[i]);
            }var templateContent = node.templateContent();
            if (templateContent) this._unbind(templateContent);

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = node.pseudoElements().values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var pseudoElement = _step3.value;

                    this._unbind(pseudoElement);
                } // FIXME: Handle shadow roots.
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
    }, {
        key: "inspectElement",
        value: function inspectElement(nodeId) {
            var node = this._idToDOMNode[nodeId];
            if (!node || !node.ownerDocument) return;

            this.dispatchEventToListeners(WebInspector.DOMTreeManager.Event.DOMNodeWasInspected, { node: node });

            this._inspectModeEnabled = false;
            this.dispatchEventToListeners(WebInspector.DOMTreeManager.Event.InspectModeStateChanged);
        }
    }, {
        key: "inspectNodeObject",
        value: function inspectNodeObject(remoteObject) {
            this._restoreSelectedNodeIsAllowed = false;

            function nodeAvailable(nodeId) {
                remoteObject.release();

                console.assert(nodeId);
                if (!nodeId) return;

                this.inspectElement(nodeId);
            }

            remoteObject.pushNodeToFrontend(nodeAvailable.bind(this));
        }
    }, {
        key: "performSearch",
        value: function performSearch(query, searchCallback) {
            this.cancelSearch();

            function callback(error, searchId, resultsCount) {
                this._searchId = searchId;
                searchCallback(resultsCount);
            }
            DOMAgent.performSearch(query, callback.bind(this));
        }
    }, {
        key: "searchResult",
        value: function searchResult(index, callback) {
            function mycallback(error, nodeIds) {
                if (error) {
                    console.error(error);
                    callback(null);
                    return;
                }
                if (nodeIds.length !== 1) return;

                callback(this._idToDOMNode[nodeIds[0]]);
            }

            if (this._searchId) DOMAgent.getSearchResults(this._searchId, index, index + 1, mycallback.bind(this));else callback(null);
        }
    }, {
        key: "cancelSearch",
        value: function cancelSearch() {
            if (this._searchId) {
                DOMAgent.discardSearchResults(this._searchId);
                this._searchId = undefined;
            }
        }
    }, {
        key: "querySelector",
        value: function querySelector(nodeId, selectors, callback) {
            DOMAgent.querySelector(nodeId, selectors, this._wrapClientCallback(callback));
        }
    }, {
        key: "querySelectorAll",
        value: function querySelectorAll(nodeId, selectors, callback) {
            DOMAgent.querySelectorAll(nodeId, selectors, this._wrapClientCallback(callback));
        }
    }, {
        key: "highlightDOMNode",
        value: function highlightDOMNode(nodeId, mode) {
            if (this._hideDOMNodeHighlightTimeout) {
                clearTimeout(this._hideDOMNodeHighlightTimeout);
                this._hideDOMNodeHighlightTimeout = undefined;
            }

            this._highlightedDOMNodeId = nodeId;
            if (nodeId) DOMAgent.highlightNode.invoke({ nodeId: nodeId, highlightConfig: this._buildHighlightConfig(mode) });else DOMAgent.hideHighlight();
        }
    }, {
        key: "highlightSelector",
        value: function highlightSelector(selectorText, frameId, mode) {
            // COMPATIBILITY (iOS 8): DOM.highlightSelector did not exist.
            if (!DOMAgent.highlightSelector) return;

            DOMAgent.highlightSelector(this._buildHighlightConfig(mode), selectorText, frameId);
        }
    }, {
        key: "highlightRect",
        value: function highlightRect(rect, usePageCoordinates) {
            DOMAgent.highlightRect.invoke({
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                color: { r: 111, g: 168, b: 220, a: 0.66 },
                outlineColor: { r: 255, g: 229, b: 153, a: 0.66 },
                usePageCoordinates: usePageCoordinates
            });
        }
    }, {
        key: "hideDOMNodeHighlight",
        value: function hideDOMNodeHighlight() {
            this.highlightDOMNode(0);
        }
    }, {
        key: "highlightDOMNodeForTwoSeconds",
        value: function highlightDOMNodeForTwoSeconds(nodeId) {
            this.highlightDOMNode(nodeId);
            this._hideDOMNodeHighlightTimeout = setTimeout(this.hideDOMNodeHighlight.bind(this), 2000);
        }
    }, {
        key: "_buildHighlightConfig",
        value: function _buildHighlightConfig() {
            var mode = arguments.length <= 0 || arguments[0] === undefined ? "all" : arguments[0];

            var highlightConfig = { showInfo: mode === "all" };

            if (mode === "all" || mode === "content") highlightConfig.contentColor = { r: 111, g: 168, b: 220, a: 0.66 };

            if (mode === "all" || mode === "padding") highlightConfig.paddingColor = { r: 147, g: 196, b: 125, a: 0.66 };

            if (mode === "all" || mode === "border") highlightConfig.borderColor = { r: 255, g: 229, b: 153, a: 0.66 };

            if (mode === "all" || mode === "margin") highlightConfig.marginColor = { r: 246, g: 178, b: 107, a: 0.66 };

            return highlightConfig;
        }
    }, {
        key: "_createContentFlowFromPayload",
        value: function _createContentFlowFromPayload(flowPayload) {
            // FIXME: Collect the regions from the payload.
            var flow = new WebInspector.ContentFlow(flowPayload.documentNodeId, flowPayload.name, flowPayload.overset, flowPayload.content.map(this.nodeForId.bind(this)));

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = flow.contentNodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var contentNode = _step4.value;

                    console.assert(!this._contentNodesToFlowsMap.has(contentNode.id));
                    this._contentNodesToFlowsMap.set(contentNode.id, flow);
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
                        _iterator4["return"]();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            return flow;
        }
    }, {
        key: "_updateContentFlowFromPayload",
        value: function _updateContentFlowFromPayload(contentFlow, flowPayload) {
            console.assert(contentFlow.contentNodes.length === flowPayload.content.length);
            console.assert(contentFlow.contentNodes.every(function (node, i) {
                return node.id === flowPayload.content[i];
            }));

            // FIXME: Collect the regions from the payload.
            contentFlow.overset = flowPayload.overset;
        }
    }, {
        key: "getNamedFlowCollection",
        value: function getNamedFlowCollection(documentNodeIdentifier) {
            function onNamedFlowCollectionAvailable(error, flows) {
                if (error) return;
                this._contentNodesToFlowsMap.clear();
                var contentFlows = [];
                for (var i = 0; i < flows.length; ++i) {
                    var flowPayload = flows[i];
                    var flowKey = WebInspector.DOMTreeManager._flowPayloadHashKey(flowPayload);
                    var contentFlow = this._flows.get(flowKey);
                    if (contentFlow) this._updateContentFlowFromPayload(contentFlow, flowPayload);else {
                        contentFlow = this._createContentFlowFromPayload(flowPayload);
                        this._flows.set(flowKey, contentFlow);
                    }
                    contentFlows.push(contentFlow);
                }
                this.dispatchEventToListeners(WebInspector.DOMTreeManager.Event.ContentFlowListWasUpdated, { documentNodeIdentifier: documentNodeIdentifier, flows: contentFlows });
            }

            if (window.CSSAgent) CSSAgent.getNamedFlowCollection(documentNodeIdentifier, onNamedFlowCollectionAvailable.bind(this));
        }
    }, {
        key: "namedFlowCreated",
        value: function namedFlowCreated(flowPayload) {
            var flowKey = WebInspector.DOMTreeManager._flowPayloadHashKey(flowPayload);
            console.assert(!this._flows.has(flowKey));
            var contentFlow = this._createContentFlowFromPayload(flowPayload);
            this._flows.set(flowKey, contentFlow);
            this.dispatchEventToListeners(WebInspector.DOMTreeManager.Event.ContentFlowWasAdded, { flow: contentFlow });
        }
    }, {
        key: "namedFlowRemoved",
        value: function namedFlowRemoved(documentNodeIdentifier, flowName) {
            var flowKey = WebInspector.DOMTreeManager._flowPayloadHashKey({ documentNodeId: documentNodeIdentifier, name: flowName });
            var contentFlow = this._flows.get(flowKey);
            console.assert(contentFlow);
            this._flows["delete"](flowKey);

            // Remove any back links to this flow from the content nodes.
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = contentFlow.contentNodes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var contentNode = _step5.value;

                    this._contentNodesToFlowsMap["delete"](contentNode.id);
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
                        _iterator5["return"]();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            this.dispatchEventToListeners(WebInspector.DOMTreeManager.Event.ContentFlowWasRemoved, { flow: contentFlow });
        }
    }, {
        key: "_sendNamedFlowUpdateEvents",
        value: function _sendNamedFlowUpdateEvents(flowPayload) {
            var flowKey = WebInspector.DOMTreeManager._flowPayloadHashKey(flowPayload);
            console.assert(this._flows.has(flowKey));
            this._updateContentFlowFromPayload(this._flows.get(flowKey), flowPayload);
        }
    }, {
        key: "regionOversetChanged",
        value: function regionOversetChanged(flowPayload) {
            this._sendNamedFlowUpdateEvents(flowPayload);
        }
    }, {
        key: "registeredNamedFlowContentElement",
        value: function registeredNamedFlowContentElement(documentNodeIdentifier, flowName, contentNodeId, nextContentElementNodeId) {
            var flowKey = WebInspector.DOMTreeManager._flowPayloadHashKey({ documentNodeId: documentNodeIdentifier, name: flowName });
            console.assert(this._flows.has(flowKey));
            console.assert(!this._contentNodesToFlowsMap.has(contentNodeId));

            var flow = this._flows.get(flowKey);
            var contentNode = this.nodeForId(contentNodeId);

            this._contentNodesToFlowsMap.set(contentNode.id, flow);

            if (nextContentElementNodeId) flow.insertContentNodeBefore(contentNode, this.nodeForId(nextContentElementNodeId));else flow.appendContentNode(contentNode);
        }
    }, {
        key: "_removeContentNodeFromFlowIfNeeded",
        value: function _removeContentNodeFromFlowIfNeeded(node) {
            if (!this._contentNodesToFlowsMap.has(node.id)) return;
            var flow = this._contentNodesToFlowsMap.get(node.id);
            this._contentNodesToFlowsMap["delete"](node.id);
            flow.removeContentNode(node);
        }
    }, {
        key: "unregisteredNamedFlowContentElement",
        value: function unregisteredNamedFlowContentElement(documentNodeIdentifier, flowName, contentNodeId) {
            console.assert(this._contentNodesToFlowsMap.has(contentNodeId));

            var flow = this._contentNodesToFlowsMap.get(contentNodeId);
            console.assert(flow.id === WebInspector.DOMTreeManager._flowPayloadHashKey({ documentNodeId: documentNodeIdentifier, name: flowName }));

            this._contentNodesToFlowsMap["delete"](contentNodeId);
            flow.removeContentNode(this.nodeForId(contentNodeId));
        }
    }, {
        key: "_coerceRemoteArrayOfDOMNodes",
        value: function _coerceRemoteArrayOfDOMNodes(objectId, callback) {
            var length,
                nodes,
                received = 0,
                lastError = null,
                domTreeManager = this;

            function nodeRequested(index, error, nodeId) {
                if (error) lastError = error;else nodes[index] = domTreeManager._idToDOMNode[nodeId];
                if (++received === length) callback(lastError, nodes);
            }

            WebInspector.runtimeManager.getPropertiesForRemoteObject(objectId, function (error, properties) {
                if (error) {
                    callback(error);
                    return;
                }

                var lengthProperty = properties.get("length");
                if (!lengthProperty || lengthProperty.value.type !== "number") {
                    callback(null);
                    return;
                }

                length = lengthProperty.value.value;
                if (!length) {
                    callback(null, []);
                    return;
                }

                nodes = new Array(length);
                for (var i = 0; i < length; ++i) {
                    var nodeProperty = properties.get(String(i));
                    console.assert(nodeProperty.value.type === "object");
                    DOMAgent.requestNode(nodeProperty.value.objectId, nodeRequested.bind(null, i));
                }
            });
        }
    }, {
        key: "getNodeContentFlowInfo",
        value: function getNodeContentFlowInfo(domNode, resultReadyCallback) {
            DOMAgent.resolveNode(domNode.id, domNodeResolved.bind(this));

            function domNodeResolved(error, remoteObject) {
                if (error) {
                    resultReadyCallback(error);
                    return;
                }
                // Serialize "backendFunction" and execute it in the context of the page
                // passing the DOMNode as the "this" reference.
                var evalParameters = {
                    objectId: remoteObject.objectId,
                    functionDeclaration: appendWebInspectorSourceURL(backendFunction.toString()),
                    doNotPauseOnExceptionsAndMuteConsole: true,
                    returnByValue: false,
                    generatePreview: false
                };
                RuntimeAgent.callFunctionOn.invoke(evalParameters, regionNodesAvailable.bind(this));
            }

            function regionNodesAvailable(error, remoteObject, wasThrown) {
                if (error) {
                    resultReadyCallback(error);
                    return;
                }

                if (wasThrown) {
                    // We should never get here, but having the error is useful for debugging.
                    console.error("Error while executing backend function:", JSON.stringify(remoteObject));
                    resultReadyCallback(null);
                    return;
                }

                // The backend function can never return null.
                console.assert(remoteObject.type === "object");
                console.assert(remoteObject.objectId);
                WebInspector.runtimeManager.getPropertiesForRemoteObject(remoteObject.objectId, remoteObjectPropertiesAvailable.bind(this));
            }

            function remoteObjectPropertiesAvailable(error, properties) {
                if (error) {
                    resultReadyCallback(error);
                    return;
                }

                var result = {
                    regionFlow: null,
                    contentFlow: null,
                    regions: null
                };

                var regionFlowNameProperty = properties.get("regionFlowName");
                if (regionFlowNameProperty && regionFlowNameProperty.value && regionFlowNameProperty.value.value) {
                    console.assert(regionFlowNameProperty.value.type === "string");
                    var regionFlowKey = WebInspector.DOMTreeManager._flowPayloadHashKey({ documentNodeId: domNode.ownerDocument.id, name: regionFlowNameProperty.value.value });
                    result.regionFlow = this._flows.get(regionFlowKey);
                }

                var contentFlowNameProperty = properties.get("contentFlowName");
                if (contentFlowNameProperty && contentFlowNameProperty.value && contentFlowNameProperty.value.value) {
                    console.assert(contentFlowNameProperty.value.type === "string");
                    var contentFlowKey = WebInspector.DOMTreeManager._flowPayloadHashKey({ documentNodeId: domNode.ownerDocument.id, name: contentFlowNameProperty.value.value });
                    result.contentFlow = this._flows.get(contentFlowKey);
                }

                var regionsProperty = properties.get("regions");
                if (!regionsProperty || !regionsProperty.value.objectId) {
                    // The list of regions is null.
                    resultReadyCallback(null, result);
                    return;
                }

                console.assert(regionsProperty.value.type === "object");
                console.assert(regionsProperty.value.subtype === "array");
                this._coerceRemoteArrayOfDOMNodes(regionsProperty.value.objectId, function (error, nodes) {
                    result.regions = nodes;
                    resultReadyCallback(error, result);
                });
            }

            // Note that "backendFunction" is serialized and executed in the context of the page.
            function backendFunction() {
                function getComputedProperty(node, propertyName) {
                    if (!node.ownerDocument || !node.ownerDocument.defaultView) return null;
                    var computedStyle = node.ownerDocument.defaultView.getComputedStyle(node);
                    return computedStyle ? computedStyle[propertyName] : null;
                }

                function getContentFlowName(node) {
                    for (; node; node = node.parentNode) {
                        var flowName = getComputedProperty(node, "webkitFlowInto");
                        if (flowName && flowName !== "none") return flowName;
                    }
                    return null;
                }

                var node = this;

                // Even detached nodes have an ownerDocument.
                console.assert(node.ownerDocument);

                var result = {
                    regionFlowName: getComputedProperty(node, "webkitFlowFrom"),
                    contentFlowName: getContentFlowName(node),
                    regions: null
                };

                if (result.contentFlowName) {
                    var flowThread = node.ownerDocument.webkitGetNamedFlows().namedItem(result.contentFlowName);
                    if (flowThread) result.regions = flowThread.getRegionsByContent(node);
                }

                return result;
            }
        }

        // Private

    }, {
        key: "_mainResourceDidChange",
        value: function _mainResourceDidChange(event) {
            if (event.target.isMainFrame()) this._restoreSelectedNodeIsAllowed = true;
        }
    }, {
        key: "restoreSelectedNodeIsAllowed",
        get: function get() {
            return this._restoreSelectedNodeIsAllowed;
        }
    }, {
        key: "inspectModeEnabled",
        get: function get() {
            return this._inspectModeEnabled;
        },
        set: function set(enabled) {
            function callback(error) {
                this._inspectModeEnabled = error ? false : enabled;
                this.dispatchEventToListeners(WebInspector.DOMTreeManager.Event.InspectModeStateChanged);
            }

            DOMAgent.setInspectModeEnabled(enabled, this._buildHighlightConfig(), callback.bind(this));
        }
    }], [{
        key: "_flowPayloadHashKey",
        value: function _flowPayloadHashKey(flowPayload) {
            // Use the flow node id, to avoid collisions when we change main document id.
            return flowPayload.documentNodeId + ":" + flowPayload.name;
        }
    }]);

    return DOMTreeManager;
})(WebInspector.Object);

WebInspector.DOMTreeManager.Event = {
    AttributeModified: "dom-tree-manager-attribute-modified",
    AttributeRemoved: "dom-tree-manager-attribute-removed",
    CharacterDataModified: "dom-tree-manager-character-data-modified",
    NodeInserted: "dom-tree-manager-node-inserted",
    NodeRemoved: "dom-tree-manager-node-removed",
    DocumentUpdated: "dom-tree-manager-document-updated",
    ChildNodeCountUpdated: "dom-tree-manager-child-node-count-updated",
    DOMNodeWasInspected: "dom-tree-manager-dom-node-was-inspected",
    InspectModeStateChanged: "dom-tree-manager-inspect-mode-state-changed",
    ContentFlowListWasUpdated: "dom-tree-manager-content-flow-list-was-updated",
    ContentFlowWasAdded: "dom-tree-manager-content-flow-was-added",
    ContentFlowWasRemoved: "dom-tree-manager-content-flow-was-removed",
    RegionOversetChanged: "dom-tree-manager-region-overset-changed"
};
