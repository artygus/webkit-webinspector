var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2013 Adobe Systems Incorporated. All rights reserved.
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

WebInspector.ContentFlow = (function (_WebInspector$Object) {
    _inherits(ContentFlow, _WebInspector$Object);

    function ContentFlow(documentNodeIdentifier, name, overset, contentNodes) {
        _classCallCheck(this, ContentFlow);

        _get(Object.getPrototypeOf(ContentFlow.prototype), "constructor", this).call(this);

        this._documentNodeIdentifier = documentNodeIdentifier;
        this._name = name;
        this._overset = overset;
        this._contentNodes = contentNodes;
    }

    // Public

    _createClass(ContentFlow, [{
        key: "insertContentNodeBefore",
        value: function insertContentNodeBefore(contentNode, referenceNode) {
            var index = this._contentNodes.indexOf(referenceNode);
            console.assert(index !== -1);
            this._contentNodes.splice(index, 0, contentNode);
            this.dispatchEventToListeners(WebInspector.ContentFlow.Event.ContentNodeWasAdded, { node: contentNode, before: referenceNode });
        }
    }, {
        key: "appendContentNode",
        value: function appendContentNode(contentNode) {
            this._contentNodes.push(contentNode);
            this.dispatchEventToListeners(WebInspector.ContentFlow.Event.ContentNodeWasAdded, { node: contentNode });
        }
    }, {
        key: "removeContentNode",
        value: function removeContentNode(contentNode) {
            var index = this._contentNodes.indexOf(contentNode);
            console.assert(index !== -1);
            this._contentNodes.splice(index, 1);
            this.dispatchEventToListeners(WebInspector.ContentFlow.Event.ContentNodeWasRemoved, { node: contentNode });
        }
    }, {
        key: "id",
        get: function get() {
            // Use the flow node id, to avoid collisions when we change main document id.
            return this._documentNodeIdentifier + ":" + this._name;
        }
    }, {
        key: "documentNodeIdentifier",
        get: function get() {
            return this._documentNodeIdentifier;
        }
    }, {
        key: "name",
        get: function get() {
            return this._name;
        }
    }, {
        key: "overset",
        get: function get() {
            return this._overset;
        },
        set: function set(overset) {
            if (this._overset === overset) return;
            this._overset = overset;
            this.dispatchEventToListeners(WebInspector.ContentFlow.Event.FlowOversetWasChanged);
        }
    }, {
        key: "contentNodes",
        get: function get() {
            return this._contentNodes;
        }
    }]);

    return ContentFlow;
})(WebInspector.Object);

WebInspector.ContentFlow.Event = {
    OversetWasChanged: "content-flow-overset-was-changed",
    ContentNodeWasAdded: "content-flow-content-node-was-added",
    ContentNodeWasRemoved: "content-flow-content-node-was-removed"
};
