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

WebInspector.LayerTreeManager = (function (_WebInspector$Object) {
    _inherits(LayerTreeManager, _WebInspector$Object);

    function LayerTreeManager() {
        _classCallCheck(this, LayerTreeManager);

        _get(Object.getPrototypeOf(LayerTreeManager.prototype), "constructor", this).call(this);

        this._supported = !!window.LayerTreeAgent;

        if (this._supported) LayerTreeAgent.enable();
    }

    // Public

    _createClass(LayerTreeManager, [{
        key: "layerTreeMutations",
        value: function layerTreeMutations(previousLayers, newLayers) {
            console.assert(this.supported);

            if (isEmptyObject(previousLayers)) {
                return {
                    preserved: [],
                    additions: newLayers,
                    removals: []
                };
            }

            function nodeIdForLayer(layer) {
                return layer.isGeneratedContent ? layer.pseudoElementId : layer.nodeId;
            }

            var layerIdsInPreviousLayers = [];
            var nodeIdsInPreviousLayers = [];
            var nodeIdsForReflectionsInPreviousLayers = [];

            previousLayers.forEach(function (layer) {
                layerIdsInPreviousLayers.push(layer.layerId);

                var nodeId = nodeIdForLayer(layer);
                if (!nodeId) return;

                if (layer.isReflection) nodeIdsForReflectionsInPreviousLayers.push(nodeId);else nodeIdsInPreviousLayers.push(nodeId);
            });

            var preserved = [];
            var additions = [];

            var layerIdsInNewLayers = [];
            var nodeIdsInNewLayers = [];
            var nodeIdsForReflectionsInNewLayers = [];

            newLayers.forEach(function (layer) {
                layerIdsInNewLayers.push(layer.layerId);

                var existed = layerIdsInPreviousLayers.includes(layer.layerId);

                var nodeId = nodeIdForLayer(layer);
                if (!nodeId) return;

                if (layer.isReflection) {
                    nodeIdsForReflectionsInNewLayers.push(nodeId);
                    existed = existed || nodeIdsForReflectionsInPreviousLayers.includes(nodeId);
                } else {
                    nodeIdsInNewLayers.push(nodeId);
                    existed = existed || nodeIdsInPreviousLayers.includes(nodeId);
                }

                if (existed) preserved.push(layer);else additions.push(layer);
            });

            var removals = previousLayers.filter(function (layer) {
                var nodeId = nodeIdForLayer(layer);

                if (layer.isReflection) return !nodeIdsForReflectionsInNewLayers.includes(nodeId);else return !nodeIdsInNewLayers.includes(nodeId) && !layerIdsInNewLayers.includes(layer.layerId);
            });

            return { preserved: preserved, additions: additions, removals: removals };
        }
    }, {
        key: "layersForNode",
        value: function layersForNode(node, callback) {
            console.assert(this.supported);

            LayerTreeAgent.layersForNode(node.id, function (error, layers) {
                if (error || isEmptyObject(layers)) {
                    callback(null, []);
                    return;
                }

                var firstLayer = layers[0];
                var layerForNode = firstLayer.nodeId === node.id && !firstLayer.isGeneratedContent ? layers.shift() : null;
                callback(layerForNode, layers);
            });
        }
    }, {
        key: "reasonsForCompositingLayer",
        value: function reasonsForCompositingLayer(layer, callback) {
            console.assert(this.supported);

            LayerTreeAgent.reasonsForCompositingLayer(layer.layerId, function (error, reasons) {
                callback(error ? 0 : reasons);
            });
        }
    }, {
        key: "layerTreeDidChange",
        value: function layerTreeDidChange() {
            this.dispatchEventToListeners(WebInspector.LayerTreeManager.Event.LayerTreeDidChange);
        }
    }, {
        key: "supported",
        get: function get() {
            return this._supported;
        }
    }]);

    return LayerTreeManager;
})(WebInspector.Object);

WebInspector.LayerTreeManager.Event = {
    LayerTreeDidChange: "layer-tree-did-change"
};
