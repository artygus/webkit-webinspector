var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

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

WebInspector.DOMNode = (function (_WebInspector$Object) {
    _inherits(DOMNode, _WebInspector$Object);

    function DOMNode(domAgent, doc, isInShadowTree, payload) {
        _classCallCheck(this, DOMNode);

        _get(Object.getPrototypeOf(DOMNode.prototype), "constructor", this).call(this);

        this._domAgent = domAgent;
        this._isInShadowTree = isInShadowTree;

        this.id = payload.nodeId;
        domAgent._idToDOMNode[this.id] = this;

        this._nodeType = payload.nodeType;
        this._nodeName = payload.nodeName;
        this._localName = payload.localName;
        this._nodeValue = payload.nodeValue;
        this._pseudoType = payload.pseudoType;
        this._computedRole = payload.role;

        if (this._nodeType === Node.DOCUMENT_NODE) this.ownerDocument = this;else this.ownerDocument = doc;

        this._attributes = [];
        this._attributesMap = {};
        if (payload.attributes) this._setAttributesPayload(payload.attributes);

        this._childNodeCount = payload.childNodeCount;
        this._children = null;
        this._filteredChildren = null;
        this._filteredChildrenNeedsUpdating = true;

        this._nextSibling = null;
        this._previousSibling = null;
        this.parentNode = null;

        this._enabledPseudoClasses = [];

        this._shadowRoots = [];
        if (payload.shadowRoots) {
            for (var i = 0; i < payload.shadowRoots.length; ++i) {
                var root = payload.shadowRoots[i];
                var node = new WebInspector.DOMNode(this._domAgent, this.ownerDocument, true, root);
                this._shadowRoots.push(node);
            }
        }

        if (payload.templateContent) {
            this._templateContent = new WebInspector.DOMNode(this._domAgent, this.ownerDocument, true, payload.templateContent);
            this._templateContent.parentNode = this;
        }

        if (payload.children) this._setChildrenPayload(payload.children);

        this._pseudoElements = new Map();
        if (payload.pseudoElements) {
            for (var i = 0; i < payload.pseudoElements.length; ++i) {
                var node = new WebInspector.DOMNode(this._domAgent, this.ownerDocument, this._isInShadowTree, payload.pseudoElements[i]);
                node.parentNode = this;
                this._pseudoElements.set(node.pseudoType(), node);
            }
        }

        if (payload.contentDocument) {
            this._contentDocument = new WebInspector.DOMNode(domAgent, null, false, payload.contentDocument);
            this._children = [this._contentDocument];
            this._renumber();
        }

        if (payload.frameId) this._frameIdentifier = payload.frameId;

        if (this._nodeType === Node.ELEMENT_NODE) {
            // HTML and BODY from internal iframes should not overwrite top-level ones.
            if (this.ownerDocument && !this.ownerDocument.documentElement && this._nodeName === "HTML") this.ownerDocument.documentElement = this;
            if (this.ownerDocument && !this.ownerDocument.body && this._nodeName === "BODY") this.ownerDocument.body = this;
            if (payload.documentURL) this.documentURL = payload.documentURL;
        } else if (this._nodeType === Node.DOCUMENT_TYPE_NODE) {
            this.publicId = payload.publicId;
            this.systemId = payload.systemId;
            this.internalSubset = payload.internalSubset;
        } else if (this._nodeType === Node.DOCUMENT_NODE) {
            this.documentURL = payload.documentURL;
            this.xmlVersion = payload.xmlVersion;
        } else if (this._nodeType === Node.ATTRIBUTE_NODE) {
            this.name = payload.name;
            this.value = payload.value;
        }
    }

    // Public

    _createClass(DOMNode, [{
        key: "computedRole",
        value: function computedRole() {
            return this._computedRole;
        }
    }, {
        key: "hasAttributes",
        value: function hasAttributes() {
            return this._attributes.length > 0;
        }
    }, {
        key: "hasChildNodes",
        value: function hasChildNodes() {
            return this.childNodeCount > 0;
        }
    }, {
        key: "hasShadowRoots",
        value: function hasShadowRoots() {
            return !!this._shadowRoots.length;
        }
    }, {
        key: "isInShadowTree",
        value: function isInShadowTree() {
            return this._isInShadowTree;
        }
    }, {
        key: "isPseudoElement",
        value: function isPseudoElement() {
            return this._pseudoType !== undefined;
        }
    }, {
        key: "nodeType",
        value: function nodeType() {
            return this._nodeType;
        }
    }, {
        key: "nodeName",
        value: function nodeName() {
            return this._nodeName;
        }
    }, {
        key: "nodeNameInCorrectCase",
        value: function nodeNameInCorrectCase() {
            return this.isXMLNode() ? this.nodeName() : this.nodeName().toLowerCase();
        }
    }, {
        key: "setNodeName",
        value: function setNodeName(name, callback) {
            DOMAgent.setNodeName(this.id, name, this._makeUndoableCallback(callback));
        }
    }, {
        key: "localName",
        value: function localName() {
            return this._localName;
        }
    }, {
        key: "templateContent",
        value: function templateContent() {
            return this._templateContent || null;
        }
    }, {
        key: "pseudoType",
        value: function pseudoType() {
            return this._pseudoType;
        }
    }, {
        key: "hasPseudoElements",
        value: function hasPseudoElements() {
            return this._pseudoElements.size > 0;
        }
    }, {
        key: "pseudoElements",
        value: function pseudoElements() {
            return this._pseudoElements;
        }
    }, {
        key: "beforePseudoElement",
        value: function beforePseudoElement() {
            return this._pseudoElements.get(WebInspector.DOMNode.PseudoElementType.Before) || null;
        }
    }, {
        key: "afterPseudoElement",
        value: function afterPseudoElement() {
            return this._pseudoElements.get(WebInspector.DOMNode.PseudoElementType.After) || null;
        }
    }, {
        key: "nodeValue",
        value: function nodeValue() {
            return this._nodeValue;
        }
    }, {
        key: "setNodeValue",
        value: function setNodeValue(value, callback) {
            DOMAgent.setNodeValue(this.id, value, this._makeUndoableCallback(callback));
        }
    }, {
        key: "getAttribute",
        value: function getAttribute(name) {
            var attr = this._attributesMap[name];
            return attr ? attr.value : undefined;
        }
    }, {
        key: "setAttribute",
        value: function setAttribute(name, text, callback) {
            DOMAgent.setAttributesAsText(this.id, text, name, this._makeUndoableCallback(callback));
        }
    }, {
        key: "setAttributeValue",
        value: function setAttributeValue(name, value, callback) {
            DOMAgent.setAttributeValue(this.id, name, value, this._makeUndoableCallback(callback));
        }
    }, {
        key: "attributes",
        value: function attributes() {
            return this._attributes;
        }
    }, {
        key: "removeAttribute",
        value: function removeAttribute(name, callback) {
            function mycallback(error, success) {
                if (!error) {
                    delete this._attributesMap[name];
                    for (var i = 0; i < this._attributes.length; ++i) {
                        if (this._attributes[i].name === name) {
                            this._attributes.splice(i, 1);
                            break;
                        }
                    }
                }

                this._makeUndoableCallback(callback)(error);
            }
            DOMAgent.removeAttribute(this.id, name, mycallback.bind(this));
        }
    }, {
        key: "getChildNodes",
        value: function getChildNodes(callback) {
            if (this.children) {
                if (callback) callback(this.children);
                return;
            }

            function mycallback(error) {
                if (!error && callback) callback(this.children);
            }

            DOMAgent.requestChildNodes(this.id, mycallback.bind(this));
        }
    }, {
        key: "getSubtree",
        value: function getSubtree(depth, callback) {
            function mycallback(error) {
                if (callback) callback(error ? null : this.children);
            }

            DOMAgent.requestChildNodes(this.id, depth, mycallback.bind(this));
        }
    }, {
        key: "getOuterHTML",
        value: function getOuterHTML(callback) {
            DOMAgent.getOuterHTML(this.id, callback);
        }
    }, {
        key: "setOuterHTML",
        value: function setOuterHTML(html, callback) {
            DOMAgent.setOuterHTML(this.id, html, this._makeUndoableCallback(callback));
        }
    }, {
        key: "removeNode",
        value: function removeNode(callback) {
            DOMAgent.removeNode(this.id, this._makeUndoableCallback(callback));
        }
    }, {
        key: "copyNode",
        value: function copyNode() {
            function copy(error, text) {
                if (!error) InspectorFrontendHost.copyText(text);
            }
            DOMAgent.getOuterHTML(this.id, copy);
        }
    }, {
        key: "eventListeners",
        value: function eventListeners(callback) {
            DOMAgent.getEventListenersForNode(this.id, callback);
        }
    }, {
        key: "accessibilityProperties",
        value: function accessibilityProperties(callback) {
            function accessibilityPropertiesCallback(error, accessibilityProperties) {
                if (!error && callback && accessibilityProperties) {
                    callback({
                        activeDescendantNodeId: accessibilityProperties.activeDescendantNodeId,
                        busy: accessibilityProperties.busy,
                        checked: accessibilityProperties.checked,
                        childNodeIds: accessibilityProperties.childNodeIds,
                        controlledNodeIds: accessibilityProperties.controlledNodeIds,
                        current: accessibilityProperties.current,
                        disabled: accessibilityProperties.disabled,
                        exists: accessibilityProperties.exists,
                        expanded: accessibilityProperties.expanded,
                        flowedNodeIds: accessibilityProperties.flowedNodeIds,
                        focused: accessibilityProperties.focused,
                        ignored: accessibilityProperties.ignored,
                        ignoredByDefault: accessibilityProperties.ignoredByDefault,
                        invalid: accessibilityProperties.invalid,
                        hidden: accessibilityProperties.hidden,
                        label: accessibilityProperties.label,
                        liveRegionAtomic: accessibilityProperties.liveRegionAtomic,
                        liveRegionRelevant: accessibilityProperties.liveRegionRelevant,
                        liveRegionStatus: accessibilityProperties.liveRegionStatus,
                        mouseEventNodeId: accessibilityProperties.mouseEventNodeId,
                        nodeId: accessibilityProperties.nodeId,
                        ownedNodeIds: accessibilityProperties.ownedNodeIds,
                        parentNodeId: accessibilityProperties.parentNodeId,
                        pressed: accessibilityProperties.pressed,
                        readonly: accessibilityProperties.readonly,
                        required: accessibilityProperties.required,
                        role: accessibilityProperties.role,
                        selected: accessibilityProperties.selected,
                        selectedChildNodeIds: accessibilityProperties.selectedChildNodeIds
                    });
                }
            }
            DOMAgent.getAccessibilityPropertiesForNode(this.id, accessibilityPropertiesCallback.bind(this));
        }
    }, {
        key: "path",
        value: function path() {
            var path = [];
            var node = this;
            while (node && "index" in node && node._nodeName.length) {
                path.push([node.index, node._nodeName]);
                node = node.parentNode;
            }
            path.reverse();
            return path.join(",");
        }
    }, {
        key: "appropriateSelectorFor",
        value: function appropriateSelectorFor(justSelector) {
            if (this.isPseudoElement()) return this.parentNode.appropriateSelectorFor() + "::" + this._pseudoType;

            var lowerCaseName = this.localName() || this.nodeName().toLowerCase();

            var id = this.getAttribute("id");
            if (id) {
                if (/[\s'"]/.test(id)) {
                    id = id.replace(/\\/g, "\\\\").replace(/\"/g, "\\\"");
                    selector = lowerCaseName + "[id=\"" + id + "\"]";
                } else selector = "#" + id;
                return justSelector ? selector : lowerCaseName + selector;
            }

            var className = this.getAttribute("class");
            if (className) {
                var selector = "." + className.trim().replace(/\s+/g, ".");
                return justSelector ? selector : lowerCaseName + selector;
            }

            if (lowerCaseName === "input" && this.getAttribute("type")) return lowerCaseName + "[type=\"" + this.getAttribute("type") + "\"]";

            return lowerCaseName;
        }
    }, {
        key: "isAncestor",
        value: function isAncestor(node) {
            if (!node) return false;

            var currentNode = node.parentNode;
            while (currentNode) {
                if (this === currentNode) return true;
                currentNode = currentNode.parentNode;
            }
            return false;
        }
    }, {
        key: "isDescendant",
        value: function isDescendant(descendant) {
            return descendant !== null && descendant.isAncestor(this);
        }
    }, {
        key: "_setAttributesPayload",
        value: function _setAttributesPayload(attrs) {
            this._attributes = [];
            this._attributesMap = {};
            for (var i = 0; i < attrs.length; i += 2) this._addAttribute(attrs[i], attrs[i + 1]);
        }
    }, {
        key: "_insertChild",
        value: function _insertChild(prev, payload) {
            var node = new WebInspector.DOMNode(this._domAgent, this.ownerDocument, this._isInShadowTree, payload);
            if (!prev) {
                if (!this._children) {
                    // First node
                    this._children = this._shadowRoots.concat([node]);
                } else this._children.unshift(node);
            } else this._children.splice(this._children.indexOf(prev) + 1, 0, node);
            this._renumber();
            return node;
        }
    }, {
        key: "_removeChild",
        value: function _removeChild(node) {
            // FIXME: Handle removal if this is a shadow root.
            if (node.isPseudoElement()) {
                this._pseudoElements["delete"](node.pseudoType());
                node.parentNode = null;
            } else {
                this._children.splice(this._children.indexOf(node), 1);
                node.parentNode = null;
                this._renumber();
            }
        }
    }, {
        key: "_setChildrenPayload",
        value: function _setChildrenPayload(payloads) {
            // We set children in the constructor.
            if (this._contentDocument) return;

            this._children = this._shadowRoots.slice();
            for (var i = 0; i < payloads.length; ++i) {
                var node = new WebInspector.DOMNode(this._domAgent, this.ownerDocument, this._isInShadowTree, payloads[i]);
                this._children.push(node);
            }
            this._renumber();
        }
    }, {
        key: "_renumber",
        value: function _renumber() {
            this._filteredChildrenNeedsUpdating = true;

            var childNodeCount = this._children.length;
            if (childNodeCount === 0) return;

            for (var i = 0; i < childNodeCount; ++i) {
                var child = this._children[i];
                child.index = i;
                child._nextSibling = i + 1 < childNodeCount ? this._children[i + 1] : null;
                child._previousSibling = i - 1 >= 0 ? this._children[i - 1] : null;
                child.parentNode = this;
            }
        }
    }, {
        key: "_addAttribute",
        value: function _addAttribute(name, value) {
            var attr = { name: name, value: value, _node: this };
            this._attributesMap[name] = attr;
            this._attributes.push(attr);
        }
    }, {
        key: "_setAttribute",
        value: function _setAttribute(name, value) {
            var attr = this._attributesMap[name];
            if (attr) attr.value = value;else this._addAttribute(name, value);
        }
    }, {
        key: "_removeAttribute",
        value: function _removeAttribute(name) {
            var attr = this._attributesMap[name];
            if (attr) {
                this._attributes.remove(attr);
                delete this._attributesMap[name];
            }
        }
    }, {
        key: "moveTo",
        value: function moveTo(targetNode, anchorNode, callback) {
            DOMAgent.moveTo(this.id, targetNode.id, anchorNode ? anchorNode.id : undefined, this._makeUndoableCallback(callback));
        }
    }, {
        key: "isXMLNode",
        value: function isXMLNode() {
            return !!this.ownerDocument && !!this.ownerDocument.xmlVersion;
        }
    }, {
        key: "setPseudoClassEnabled",
        value: function setPseudoClassEnabled(pseudoClass, enabled) {
            var pseudoClasses = this._enabledPseudoClasses;
            if (enabled) {
                if (pseudoClasses.includes(pseudoClass)) return;
                pseudoClasses.push(pseudoClass);
            } else {
                if (!pseudoClasses.includes(pseudoClass)) return;
                pseudoClasses.remove(pseudoClass);
            }

            function changed(error) {
                if (!error) this.dispatchEventToListeners(WebInspector.DOMNode.Event.EnabledPseudoClassesChanged);
            }

            CSSAgent.forcePseudoState(this.id, pseudoClasses, changed.bind(this));
        }
    }, {
        key: "_makeUndoableCallback",
        value: function _makeUndoableCallback(callback) {
            return function (error) {
                if (!error) DOMAgent.markUndoableState();

                if (callback) callback.apply(null, arguments);
            };
        }
    }, {
        key: "frameIdentifier",
        get: function get() {
            return this._frameIdentifier || this.ownerDocument.frameIdentifier;
        }
    }, {
        key: "frame",
        get: function get() {
            if (!this._frame) this._frame = WebInspector.frameResourceManager.frameForIdentifier(this.frameIdentifier);
            return this._frame;
        }
    }, {
        key: "children",
        get: function get() {
            if (!this._children) return null;

            if (WebInspector.showShadowDOMSetting.value) return this._children;

            if (this._filteredChildrenNeedsUpdating) {
                this._filteredChildrenNeedsUpdating = false;
                this._filteredChildren = this._children.filter(function (node) {
                    return !node._isInShadowTree;
                });
            }

            return this._filteredChildren;
        }
    }, {
        key: "firstChild",
        get: function get() {
            var children = this.children;

            if (children && children.length > 0) return children[0];

            return null;
        }
    }, {
        key: "lastChild",
        get: function get() {
            var children = this.children;

            if (children && children.length > 0) return children.lastValue;

            return null;
        }
    }, {
        key: "nextSibling",
        get: function get() {
            if (WebInspector.showShadowDOMSetting.value) return this._nextSibling;

            var node = this._nextSibling;
            while (node) {
                if (!node._isInShadowTree) return node;
                node = node._nextSibling;
            }
            return null;
        }
    }, {
        key: "previousSibling",
        get: function get() {
            if (WebInspector.showShadowDOMSetting.value) return this._previousSibling;

            var node = this._previousSibling;
            while (node) {
                if (!node._isInShadowTree) return node;
                node = node._previousSibling;
            }
            return null;
        }
    }, {
        key: "childNodeCount",
        get: function get() {
            var children = this.children;
            if (children) return children.length;

            if (WebInspector.showShadowDOMSetting.value) return this._childNodeCount + this._shadowRoots.length;

            return this._childNodeCount;
        },
        set: function set(count) {
            this._childNodeCount = count;
        }
    }, {
        key: "enabledPseudoClasses",
        get: function get() {
            return this._enabledPseudoClasses;
        }
    }]);

    return DOMNode;
})(WebInspector.Object);

WebInspector.DOMNode.Event = {
    EnabledPseudoClassesChanged: "dom-node-enabled-pseudo-classes-did-change",
    AttributeModified: "dom-node-attribute-modified",
    AttributeRemoved: "dom-node-attribute-removed"
};

WebInspector.DOMNode.PseudoElementType = {
    Before: "before",
    After: "after"
};
