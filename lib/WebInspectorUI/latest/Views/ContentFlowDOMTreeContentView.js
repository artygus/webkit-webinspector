var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2013 Adobe Systems Incorporated. All rights reserved.
 * Copyright (C) 2015 Apple Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions of source code must retain the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer.
 * 2. Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials
 *    provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDER "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
 * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
 * THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 */

WebInspector.ContentFlowDOMTreeContentView = (function (_WebInspector$DOMTreeContentView) {
    _inherits(ContentFlowDOMTreeContentView, _WebInspector$DOMTreeContentView);

    function ContentFlowDOMTreeContentView(contentFlow) {
        _classCallCheck(this, ContentFlowDOMTreeContentView);

        console.assert(contentFlow instanceof WebInspector.ContentFlow, contentFlow);

        _get(Object.getPrototypeOf(ContentFlowDOMTreeContentView.prototype), "constructor", this).call(this, contentFlow);

        contentFlow.addEventListener(WebInspector.ContentFlow.Event.ContentNodeWasAdded, this._contentNodeWasAdded, this);
        contentFlow.addEventListener(WebInspector.ContentFlow.Event.ContentNodeWasRemoved, this._contentNodeWasRemoved, this);

        this._createContentTrees();
    }

    // Public

    _createClass(ContentFlowDOMTreeContentView, [{
        key: "closed",
        value: function closed() {
            this.representedObject.removeEventListener(null, null, this);

            _get(Object.getPrototypeOf(ContentFlowDOMTreeContentView.prototype), "closed", this).call(this);
        }
    }, {
        key: "getSearchContextNodes",
        value: function getSearchContextNodes(callback) {
            callback(this.domTreeOutline.children.map(function (treeOutline) {
                return treeOutline.representedObject.id;
            }));
        }

        // Private

    }, {
        key: "_createContentTrees",
        value: function _createContentTrees() {
            var contentNodes = this.representedObject.contentNodes;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = contentNodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var contentNode = _step.value;

                    this.domTreeOutline.appendChild(new WebInspector.DOMTreeElement(contentNode));
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

            var documentURL = contentNodes.length ? contentNodes[0].ownerDocument.documentURL : null;
            this._restoreSelectedNodeAfterUpdate(documentURL, contentNodes[0]);
        }
    }, {
        key: "_contentNodeWasAdded",
        value: function _contentNodeWasAdded(event) {
            var treeElement = new WebInspector.DOMTreeElement(event.data.node);
            if (!event.data.before) {
                this.domTreeOutline.appendChild(treeElement);
                return;
            }

            var beforeElement = this.domTreeOutline.findTreeElement(event.data.before);
            console.assert(beforeElement);

            var index = this.domTreeOutline.children.indexOf(beforeElement);
            console.assert(index !== -1);

            this.domTreeOutline.insertChild(treeElement, index);
        }
    }, {
        key: "_contentNodeWasRemoved",
        value: function _contentNodeWasRemoved(event) {
            var treeElement = this.domTreeOutline.findTreeElement(event.data.node);
            console.assert(treeElement);
            this.domTreeOutline.removeChild(treeElement);
        }
    }]);

    return ContentFlowDOMTreeContentView;
})(WebInspector.DOMTreeContentView);
