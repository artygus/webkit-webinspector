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

WebInspector.DOMTreeElementPathComponent = (function (_WebInspector$HierarchicalPathComponent) {
    _inherits(DOMTreeElementPathComponent, _WebInspector$HierarchicalPathComponent);

    function DOMTreeElementPathComponent(domTreeElement, representedObject) {
        _classCallCheck(this, DOMTreeElementPathComponent);

        var node = domTreeElement.representedObject;

        var title = null;
        var className = null;

        switch (node.nodeType()) {
            case Node.ELEMENT_NODE:
                if (node.isPseudoElement()) {
                    className = WebInspector.DOMTreeElementPathComponent.DOMPseudoElementIconStyleClassName;
                    title = "::" + node.pseudoType();
                } else {
                    className = WebInspector.DOMTreeElementPathComponent.DOMElementIconStyleClassName;
                    title = WebInspector.displayNameForNode(node);
                }
                break;

            case Node.TEXT_NODE:
                className = WebInspector.DOMTreeElementPathComponent.DOMTextNodeIconStyleClassName;
                title = "\"" + node.nodeValue().trimEnd(32) + "\"";
                break;

            case Node.COMMENT_NODE:
                className = WebInspector.DOMTreeElementPathComponent.DOMCommentIconStyleClassName;
                title = "<!--" + node.nodeValue().trimEnd(32) + "-->";
                break;

            case Node.DOCUMENT_TYPE_NODE:
                className = WebInspector.DOMTreeElementPathComponent.DOMDocumentTypeIconStyleClassName;
                title = "<!DOCTYPE>";
                break;

            case Node.DOCUMENT_NODE:
                className = WebInspector.DOMTreeElementPathComponent.DOMDocumentIconStyleClassName;
                title = node.nodeNameInCorrectCase();
                break;

            case Node.CDATA_SECTION_NODE:
                className = WebInspector.DOMTreeElementPathComponent.DOMCharacterDataIconStyleClassName;
                title = "<![CDATA[" + node.trimEnd(32) + "]]>";
                break;

            case Node.DOCUMENT_FRAGMENT_NODE:
                // FIXME: At some point we might want a different icon for this.
                // <rdar://problem/12800950> Need icon for DOCUMENT_FRAGMENT_NODE and PROCESSING_INSTRUCTION_NODE
                className = WebInspector.DOMTreeElementPathComponent.DOMDocumentTypeIconStyleClassName;
                if (node.isInShadowTree()) title = WebInspector.UIString("Shadow Content");else title = WebInspector.displayNameForNode(node);
                break;

            case Node.PROCESSING_INSTRUCTION_NODE:
                // FIXME: At some point we might want a different icon for this.
                // <rdar://problem/12800950> Need icon for DOCUMENT_FRAGMENT_NODE and PROCESSING_INSTRUCTION_NODE.
                className = WebInspector.DOMTreeElementPathComponent.DOMDocumentTypeIconStyleClassName;
                title = node.nodeNameInCorrectCase();
                break;

            default:
                console.error("Unknown DOM node type: ", node.nodeType());
                className = WebInspector.DOMTreeElementPathComponent.DOMNodeIconStyleClassName;
                title = node.nodeNameInCorrectCase();
        }

        _get(Object.getPrototypeOf(DOMTreeElementPathComponent.prototype), "constructor", this).call(this, title, className, representedObject || domTreeElement.representedObject);

        this._domTreeElement = domTreeElement;
    }

    // Public

    _createClass(DOMTreeElementPathComponent, [{
        key: "mouseOver",

        // Protected

        value: function mouseOver() {
            var nodeId = this._domTreeElement.representedObject.id;
            WebInspector.domTreeManager.highlightDOMNode(nodeId);
        }
    }, {
        key: "mouseOut",
        value: function mouseOut() {
            WebInspector.domTreeManager.hideDOMNodeHighlight();
        }
    }, {
        key: "domTreeElement",
        get: function get() {
            return this._domTreeElement;
        }
    }, {
        key: "previousSibling",
        get: function get() {
            if (!this._domTreeElement.previousSibling) return null;
            return new WebInspector.DOMTreeElementPathComponent(this._domTreeElement.previousSibling);
        }
    }, {
        key: "nextSibling",
        get: function get() {
            if (!this._domTreeElement.nextSibling) return null;
            if (this._domTreeElement.nextSibling.isCloseTag()) return null;
            return new WebInspector.DOMTreeElementPathComponent(this._domTreeElement.nextSibling);
        }
    }]);

    return DOMTreeElementPathComponent;
})(WebInspector.HierarchicalPathComponent);

WebInspector.DOMTreeElementPathComponent.DOMElementIconStyleClassName = "dom-element-icon";
WebInspector.DOMTreeElementPathComponent.DOMPseudoElementIconStyleClassName = "dom-pseudo-element-icon";
WebInspector.DOMTreeElementPathComponent.DOMTextNodeIconStyleClassName = "dom-text-node-icon";
WebInspector.DOMTreeElementPathComponent.DOMCommentIconStyleClassName = "dom-comment-icon";
WebInspector.DOMTreeElementPathComponent.DOMDocumentTypeIconStyleClassName = "dom-document-type-icon";
WebInspector.DOMTreeElementPathComponent.DOMDocumentIconStyleClassName = "dom-document-icon";
WebInspector.DOMTreeElementPathComponent.DOMCharacterDataIconStyleClassName = "dom-character-data-icon";
WebInspector.DOMTreeElementPathComponent.DOMNodeIconStyleClassName = "dom-node-icon";
