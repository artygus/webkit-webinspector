var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

WebInspector.DOMObserver = (function () {
    function DOMObserver() {
        _classCallCheck(this, DOMObserver);
    }

    _createClass(DOMObserver, [{
        key: "documentUpdated",

        // Events defined by the "DOM" domain.

        value: function documentUpdated() {
            WebInspector.domTreeManager._documentUpdated();
        }
    }, {
        key: "setChildNodes",
        value: function setChildNodes(parentId, payloads) {
            WebInspector.domTreeManager._setChildNodes(parentId, payloads);
        }
    }, {
        key: "attributeModified",
        value: function attributeModified(nodeId, name, value) {
            WebInspector.domTreeManager._attributeModified(nodeId, name, value);
        }
    }, {
        key: "attributeRemoved",
        value: function attributeRemoved(nodeId, name) {
            WebInspector.domTreeManager._attributeRemoved(nodeId, name);
        }
    }, {
        key: "inlineStyleInvalidated",
        value: function inlineStyleInvalidated(nodeIds) {
            WebInspector.domTreeManager._inlineStyleInvalidated(nodeIds);
        }
    }, {
        key: "characterDataModified",
        value: function characterDataModified(nodeId, characterData) {
            WebInspector.domTreeManager._characterDataModified(nodeId, characterData);
        }
    }, {
        key: "childNodeCountUpdated",
        value: function childNodeCountUpdated(nodeId, childNodeCount) {
            WebInspector.domTreeManager._childNodeCountUpdated(nodeId, childNodeCount);
        }
    }, {
        key: "childNodeInserted",
        value: function childNodeInserted(parentNodeId, previousNodeId, payload) {
            WebInspector.domTreeManager._childNodeInserted(parentNodeId, previousNodeId, payload);
        }
    }, {
        key: "childNodeRemoved",
        value: function childNodeRemoved(parentNodeId, nodeId) {
            WebInspector.domTreeManager._childNodeRemoved(parentNodeId, nodeId);
        }
    }, {
        key: "shadowRootPushed",
        value: function shadowRootPushed(parentNodeId, nodeId) {
            WebInspector.domTreeManager._childNodeInserted(parentNodeId, 0, nodeId);
        }
    }, {
        key: "shadowRootPopped",
        value: function shadowRootPopped(parentNodeId, nodeId) {
            WebInspector.domTreeManager._childNodeRemoved(parentNodeId, nodeId);
        }
    }, {
        key: "pseudoElementAdded",
        value: function pseudoElementAdded(parentNodeId, pseudoElement) {
            WebInspector.domTreeManager._pseudoElementAdded(parentNodeId, pseudoElement);
        }
    }, {
        key: "pseudoElementRemoved",
        value: function pseudoElementRemoved(parentNodeId, pseudoElementId) {
            WebInspector.domTreeManager._pseudoElementRemoved(parentNodeId, pseudoElementId);
        }
    }]);

    return DOMObserver;
})();
