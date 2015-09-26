var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

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

WebInspector.DOMSearchMatchObject = (function (_WebInspector$Object) {
    _inherits(DOMSearchMatchObject, _WebInspector$Object);

    function DOMSearchMatchObject(resource, domNode, title, searchTerm, textRange) {
        _classCallCheck(this, DOMSearchMatchObject);

        _get(Object.getPrototypeOf(DOMSearchMatchObject.prototype), "constructor", this).call(this);

        console.assert(resource instanceof WebInspector.Resource);
        console.assert(domNode instanceof WebInspector.DOMNode);

        this._resource = resource;
        this._domNode = domNode;
        this._title = title;
        this._searchTerm = searchTerm;
        this._sourceCodeTextRange = resource.createSourceCodeTextRange(textRange);
    }

    // Static

    _createClass(DOMSearchMatchObject, [{
        key: "saveIdentityToCookie",
        value: function saveIdentityToCookie(cookie) {
            cookie[WebInspector.DOMSearchMatchObject.URLCookieKey] = this._resource.url.hash;
            cookie[WebInspector.DOMSearchMatchObject.TitleKey] = this._title;
            var textRange = this._sourceCodeTextRange.textRange;
            cookie[WebInspector.DOMSearchMatchObject.TextRangeKey] = [textRange.startLine, textRange.startColumn, textRange.endLine, textRange.endColumn].join();
        }

        // Private

    }, {
        key: "_generateClassName",
        value: function _generateClassName() {
            switch (this._domNode.nodeType()) {
                case Node.ELEMENT_NODE:
                    return WebInspector.DOMSearchMatchObject.DOMMatchElementIconStyleClassName;

                case Node.TEXT_NODE:
                    return WebInspector.DOMSearchMatchObject.DOMMatchTextNodeIconStyleClassName;

                case Node.COMMENT_NODE:
                    return WebInspector.DOMSearchMatchObject.DOMMatchCommentIconStyleClassName;

                case Node.DOCUMENT_TYPE_NODE:
                    return WebInspector.DOMSearchMatchObject.DOMMatchDocumentTypeIconStyleClassName;

                case Node.CDATA_SECTION_NODE:
                    return WebInspector.DOMSearchMatchObject.DOMMatchCharacterDataIconStyleClassName;

                case Node.PROCESSING_INSTRUCTION_NODE:
                    // <rdar://problem/12800950> Need icon for DOCUMENT_FRAGMENT_NODE and PROCESSING_INSTRUCTION_NODE
                    return WebInspector.DOMSearchMatchObject.DOMMatchDocumentTypeIconStyleClassName;

                default:
                    console.error("Unknown DOM node type: ", this._domNode.nodeType());
                    return WebInspector.DOMSearchMatchObject.DOMMatchNodeIconStyleClassName;
            }
        }
    }, {
        key: "resource",

        // Public

        get: function get() {
            return this._resource;
        }
    }, {
        key: "domNode",
        get: function get() {
            return this._domNode;
        }
    }, {
        key: "title",
        get: function get() {
            return this._title;
        }
    }, {
        key: "className",
        get: function get() {
            if (!this._className) this._className = this._generateClassName();

            return this._className;
        }
    }, {
        key: "searchTerm",
        get: function get() {
            return this._searchTerm;
        }
    }, {
        key: "sourceCodeTextRange",
        get: function get() {
            return this._sourceCodeTextRange;
        }
    }], [{
        key: "titleForDOMNode",
        value: function titleForDOMNode(domNode) {
            switch (domNode.nodeType()) {
                case Node.ELEMENT_NODE:
                    var title = "<" + domNode.nodeNameInCorrectCase();
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = domNode.attributes()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var attribute = _step.value;

                            title += " " + attribute.name;
                            if (attribute.value.length) title += "=\"" + attribute.value + "\"";
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

                    return title + ">";

                case Node.TEXT_NODE:
                    return "\"" + domNode.nodeValue() + "\"";

                case Node.COMMENT_NODE:
                    return "<!--" + domNode.nodeValue() + "-->";

                case Node.DOCUMENT_TYPE_NODE:
                    var title = "<!DOCTYPE " + domNode.nodeName();
                    if (domNode.publicId) {
                        title += " PUBLIC \"" + domNode.publicId + "\"";
                        if (domNode.systemId) title += " \"" + domNode.systemId + "\"";
                    } else if (domNode.systemId) title += " SYSTEM \"" + domNode.systemId + "\"";

                    if (domNode.internalSubset) title += " [" + domNode.internalSubset + "]";

                    return title + ">";

                case Node.CDATA_SECTION_NODE:
                    return "<![CDATA[" + domNode + "]]>";

                case Node.PROCESSING_INSTRUCTION_NODE:
                    var data = domNode.nodeValue();
                    var dataString = data.length ? " " + data : "";
                    var title = "<?" + domNode.nodeNameInCorrectCase() + dataString + "?>";
                    return title;

                default:
                    console.error("Unknown DOM node type: ", domNode.nodeType());
                    return domNode.nodeNameInCorrectCase();
            }
        }
    }]);

    return DOMSearchMatchObject;
})(WebInspector.Object);

WebInspector.DOMSearchMatchObject.DOMMatchElementIconStyleClassName = "dom-match-element-icon";
WebInspector.DOMSearchMatchObject.DOMMatchTextNodeIconStyleClassName = "dom-match-text-node-icon";
WebInspector.DOMSearchMatchObject.DOMMatchCommentIconStyleClassName = "dom-match-comment-icon";
WebInspector.DOMSearchMatchObject.DOMMatchDocumentTypeIconStyleClassName = "dom-match-document-type-icon";
WebInspector.DOMSearchMatchObject.DOMMatchCharacterDataIconStyleClassName = "dom-match-character-data-icon";
WebInspector.DOMSearchMatchObject.DOMMatchNodeIconStyleClassName = "dom-match-node-icon";

WebInspector.DOMSearchMatchObject.TypeIdentifier = "dom-search-match-object";
WebInspector.DOMSearchMatchObject.URLCookieKey = "resource-url";
WebInspector.DOMSearchMatchObject.TitleKey = "title";
WebInspector.DOMSearchMatchObject.TextRangeKey = "text-range";
