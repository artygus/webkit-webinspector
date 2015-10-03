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

WebInspector.LayerTreeDetailsSidebarPanel = (function (_WebInspector$DOMDetailsSidebarPanel) {
    _inherits(LayerTreeDetailsSidebarPanel, _WebInspector$DOMDetailsSidebarPanel);

    function LayerTreeDetailsSidebarPanel() {
        _classCallCheck(this, LayerTreeDetailsSidebarPanel);

        _get(Object.getPrototypeOf(LayerTreeDetailsSidebarPanel.prototype), "constructor", this).call(this, "layer-tree", WebInspector.UIString("Layers"), WebInspector.UIString("Layer"));

        this._dataGridNodesByLayerId = {};

        this.element.classList.add("layer-tree");

        WebInspector.showShadowDOMSetting.addEventListener(WebInspector.Setting.Event.Changed, this._showShadowDOMSettingChanged, this);

        window.addEventListener("resize", this._windowResized.bind(this));

        this._buildLayerInfoSection();
        this._buildDataGridSection();
        this._buildBottomBar();
    }

    // DetailsSidebarPanel Overrides.

    _createClass(LayerTreeDetailsSidebarPanel, [{
        key: "shown",
        value: function shown() {
            WebInspector.layerTreeManager.addEventListener(WebInspector.LayerTreeManager.Event.LayerTreeDidChange, this._layerTreeDidChange, this);

            console.assert(this.parentSidebar);

            this.needsRefresh();

            _get(Object.getPrototypeOf(LayerTreeDetailsSidebarPanel.prototype), "shown", this).call(this);
        }
    }, {
        key: "hidden",
        value: function hidden() {
            WebInspector.layerTreeManager.removeEventListener(WebInspector.LayerTreeManager.Event.LayerTreeDidChange, this._layerTreeDidChange, this);

            _get(Object.getPrototypeOf(LayerTreeDetailsSidebarPanel.prototype), "hidden", this).call(this);
        }
    }, {
        key: "refresh",
        value: function refresh() {
            if (!this.domNode) return;

            WebInspector.layerTreeManager.layersForNode(this.domNode, (function (layerForNode, childLayers) {
                this._unfilteredChildLayers = childLayers;
                this._updateDisplayWithLayers(layerForNode, childLayers);
            }).bind(this));
        }

        // DOMDetailsSidebarPanel Overrides

    }, {
        key: "supportsDOMNode",
        value: function supportsDOMNode(nodeToInspect) {
            return WebInspector.layerTreeManager.supported && nodeToInspect.nodeType() === Node.ELEMENT_NODE;
        }

        // Private

    }, {
        key: "_layerTreeDidChange",
        value: function _layerTreeDidChange(event) {
            this.needsRefresh();
        }
    }, {
        key: "_showShadowDOMSettingChanged",
        value: function _showShadowDOMSettingChanged(event) {
            if (this.selected) this._updateDisplayWithLayers(this._layerForNode, this._unfilteredChildLayers);
        }
    }, {
        key: "_windowResized",
        value: function _windowResized(event) {
            if (this._popover && this._popover.visible) this._updatePopoverForSelectedNode();
        }
    }, {
        key: "_buildLayerInfoSection",
        value: function _buildLayerInfoSection() {
            var rows = this._layerInfoRows = {};
            var rowsArray = [];

            rowsArray.push(rows["Width"] = new WebInspector.DetailsSectionSimpleRow(WebInspector.UIString("Width")));
            rowsArray.push(rows["Height"] = new WebInspector.DetailsSectionSimpleRow(WebInspector.UIString("Height")));
            rowsArray.push(rows["Paints"] = new WebInspector.DetailsSectionSimpleRow(WebInspector.UIString("Paints")));
            rowsArray.push(rows["Memory"] = new WebInspector.DetailsSectionSimpleRow(WebInspector.UIString("Memory")));

            this._layerInfoGroup = new WebInspector.DetailsSectionGroup(rowsArray);

            var emptyRow = new WebInspector.DetailsSectionRow(WebInspector.UIString("No Layer Available"));
            emptyRow.showEmptyMessage();
            this._noLayerInformationGroup = new WebInspector.DetailsSectionGroup([emptyRow]);

            this._layerInfoSection = new WebInspector.DetailsSection("layer-info", WebInspector.UIString("Layer Info"), [this._noLayerInformationGroup]);

            this.contentElement.appendChild(this._layerInfoSection.element);
        }
    }, {
        key: "_buildDataGridSection",
        value: function _buildDataGridSection() {
            var columns = { name: {}, paintCount: {}, memory: {} };

            columns.name.title = WebInspector.UIString("Node");
            columns.name.sortable = false;

            columns.paintCount.title = WebInspector.UIString("Paints");
            columns.paintCount.sortable = true;
            columns.paintCount.aligned = "right";
            columns.paintCount.width = "50px";

            columns.memory.title = WebInspector.UIString("Memory");
            columns.memory.sortable = true;
            columns.memory.aligned = "right";
            columns.memory.width = "70px";

            this._dataGrid = new WebInspector.DataGrid(columns);
            this._dataGrid.addEventListener(WebInspector.DataGrid.Event.SortChanged, this._sortDataGrid, this);
            this._dataGrid.addEventListener(WebInspector.DataGrid.Event.SelectedNodeChanged, this._selectedDataGridNodeChanged, this);

            this.sortColumnIdentifier = "memory";
            this.sortOrder = WebInspector.DataGrid.SortOrder.Descending;

            var element = this._dataGrid.element;
            element.classList.add("inline");
            element.addEventListener("focus", this._dataGridGainedFocus.bind(this), false);
            element.addEventListener("blur", this._dataGridLostFocus.bind(this), false);
            element.addEventListener("click", this._dataGridWasClicked.bind(this), false);

            this._childLayersRow = new WebInspector.DetailsSectionDataGridRow(null, WebInspector.UIString("No Child Layers"));
            var group = new WebInspector.DetailsSectionGroup([this._childLayersRow]);
            var section = new WebInspector.DetailsSection("layer-children", WebInspector.UIString("Child Layers"), [group], null, true);

            var element = this.contentElement.appendChild(section.element);
            element.classList.add(section.identifier);
        }
    }, {
        key: "_buildBottomBar",
        value: function _buildBottomBar() {
            var bottomBar = this.element.appendChild(document.createElement("div"));
            bottomBar.className = "bottom-bar";

            this._layersCountLabel = bottomBar.appendChild(document.createElement("div"));
            this._layersCountLabel.className = "layers-count-label";

            this._layersMemoryLabel = bottomBar.appendChild(document.createElement("div"));
            this._layersMemoryLabel.className = "layers-memory-label";
        }
    }, {
        key: "_sortDataGrid",
        value: function _sortDataGrid() {
            var sortColumnIdentifier = this._dataGrid.sortColumnIdentifier;

            function comparator(a, b) {
                var item1 = a.layer[sortColumnIdentifier] || 0;
                var item2 = b.layer[sortColumnIdentifier] || 0;
                return item1 - item2;
            }

            this._dataGrid.sortNodes(comparator);
            this._updatePopoverForSelectedNode();
        }
    }, {
        key: "_selectedDataGridNodeChanged",
        value: function _selectedDataGridNodeChanged() {
            if (this._dataGrid.selectedNode) {
                this._highlightSelectedNode();
                this._showPopoverForSelectedNode();
            } else {
                WebInspector.domTreeManager.hideDOMNodeHighlight();
                this._hidePopover();
            }
        }
    }, {
        key: "_dataGridGainedFocus",
        value: function _dataGridGainedFocus(event) {
            this._highlightSelectedNode();
            this._showPopoverForSelectedNode();
        }
    }, {
        key: "_dataGridLostFocus",
        value: function _dataGridLostFocus(event) {
            WebInspector.domTreeManager.hideDOMNodeHighlight();
            this._hidePopover();
        }
    }, {
        key: "_dataGridWasClicked",
        value: function _dataGridWasClicked(event) {
            if (this._dataGrid.selectedNode && event.target.parentNode.classList.contains("filler")) this._dataGrid.selectedNode.deselect();
        }
    }, {
        key: "_highlightSelectedNode",
        value: function _highlightSelectedNode() {
            var dataGridNode = this._dataGrid.selectedNode;
            if (!dataGridNode) return;

            var layer = dataGridNode.layer;
            if (layer.isGeneratedContent || layer.isReflection || layer.isAnonymous) WebInspector.domTreeManager.highlightRect(layer.bounds, true);else WebInspector.domTreeManager.highlightDOMNode(layer.nodeId);
        }
    }, {
        key: "_updateDisplayWithLayers",
        value: function _updateDisplayWithLayers(layerForNode, childLayers) {
            if (!WebInspector.showShadowDOMSetting.value) {
                childLayers = childLayers.filter(function (layer) {
                    return !layer.isInShadowTree;
                });
            }

            this._updateLayerInfoSection(layerForNode);
            this._updateDataGrid(layerForNode, childLayers);
            this._updateMetrics(layerForNode, childLayers);

            this._layerForNode = layerForNode;
            this._childLayers = childLayers;
        }
    }, {
        key: "_updateLayerInfoSection",
        value: function _updateLayerInfoSection(layer) {
            this._layerInfoSection.groups = layer ? [this._layerInfoGroup] : [this._noLayerInformationGroup];

            if (!layer) return;

            this._layerInfoRows["Memory"].value = Number.bytesToString(layer.memory);
            this._layerInfoRows["Width"].value = layer.compositedBounds.width + "px";
            this._layerInfoRows["Height"].value = layer.compositedBounds.height + "px";
            this._layerInfoRows["Paints"].value = layer.paintCount + "";
        }
    }, {
        key: "_updateDataGrid",
        value: function _updateDataGrid(layerForNode, childLayers) {
            var dataGrid = this._dataGrid;

            var mutations = WebInspector.layerTreeManager.layerTreeMutations(this._childLayers, childLayers);

            mutations.removals.forEach(function (layer) {
                var node = this._dataGridNodesByLayerId[layer.layerId];
                if (node) {
                    dataGrid.removeChild(node);
                    delete this._dataGridNodesByLayerId[layer.layerId];
                }
            }, this);

            mutations.additions.forEach(function (layer) {
                var node = this._dataGridNodeForLayer(layer);
                if (node) dataGrid.appendChild(node);
            }, this);

            mutations.preserved.forEach(function (layer) {
                var node = this._dataGridNodesByLayerId[layer.layerId];
                if (node) node.layer = layer;
            }, this);

            this._sortDataGrid();

            this._childLayersRow.dataGrid = !isEmptyObject(childLayers) ? this._dataGrid : null;
        }
    }, {
        key: "_dataGridNodeForLayer",
        value: function _dataGridNodeForLayer(layer) {
            var node = new WebInspector.LayerTreeDataGridNode(layer);

            this._dataGridNodesByLayerId[layer.layerId] = node;

            return node;
        }
    }, {
        key: "_updateMetrics",
        value: function _updateMetrics(layerForNode, childLayers) {
            var layerCount = 0;
            var totalMemory = 0;

            if (layerForNode) {
                layerCount++;
                totalMemory += layerForNode.memory || 0;
            }

            childLayers.forEach(function (layer) {
                layerCount++;
                totalMemory += layer.memory || 0;
            });

            this._layersCountLabel.textContent = WebInspector.UIString("Layer Count: %d").format(layerCount);
            this._layersMemoryLabel.textContent = WebInspector.UIString("Memory: %s").format(Number.bytesToString(totalMemory));
        }
    }, {
        key: "_showPopoverForSelectedNode",
        value: function _showPopoverForSelectedNode() {
            var dataGridNode = this._dataGrid.selectedNode;
            if (!dataGridNode) return;

            this._contentForPopover(dataGridNode.layer, (function (content) {
                if (dataGridNode === this._dataGrid.selectedNode) this._updatePopoverForSelectedNode(content);
            }).bind(this));
        }
    }, {
        key: "_updatePopoverForSelectedNode",
        value: function _updatePopoverForSelectedNode(content) {
            var dataGridNode = this._dataGrid.selectedNode;
            if (!dataGridNode) return;

            var popover = this._popover;
            if (!popover) popover = this._popover = new WebInspector.Popover();

            var targetFrame = WebInspector.Rect.rectFromClientRect(dataGridNode.element.getBoundingClientRect());

            if (content) popover.content = content;

            popover.present(targetFrame.pad(2), [WebInspector.RectEdge.MIN_X]);
        }
    }, {
        key: "_hidePopover",
        value: function _hidePopover() {
            if (this._popover) this._popover.dismiss();
        }
    }, {
        key: "_contentForPopover",
        value: function _contentForPopover(layer, callback) {
            var content = document.createElement("div");
            content.className = "layer-tree-popover";

            content.appendChild(document.createElement("p")).textContent = WebInspector.UIString("Reasons for compositing:");

            var list = content.appendChild(document.createElement("ul"));

            WebInspector.layerTreeManager.reasonsForCompositingLayer(layer, (function (compositingReasons) {
                if (isEmptyObject(compositingReasons)) {
                    callback(content);
                    return;
                }

                this._populateListOfCompositingReasons(list, compositingReasons);

                callback(content);
            }).bind(this));

            return content;
        }
    }, {
        key: "_populateListOfCompositingReasons",
        value: function _populateListOfCompositingReasons(list, compositingReasons) {
            function addReason(reason) {
                list.appendChild(document.createElement("li")).textContent = reason;
            }

            if (compositingReasons.transform3D) addReason(WebInspector.UIString("Element has a 3D transform"));
            if (compositingReasons.video) addReason(WebInspector.UIString("Element is <video>"));
            if (compositingReasons.canvas) addReason(WebInspector.UIString("Element is <canvas>"));
            if (compositingReasons.plugin) addReason(WebInspector.UIString("Element is a plug-in"));
            if (compositingReasons.iFrame) addReason(WebInspector.UIString("Element is <iframe>"));
            if (compositingReasons.backfaceVisibilityHidden) addReason(WebInspector.UIString("Element has “backface-visibility: hidden” style"));
            if (compositingReasons.clipsCompositingDescendants) addReason(WebInspector.UIString("Element clips compositing descendants"));
            if (compositingReasons.animation) addReason(WebInspector.UIString("Element is animated"));
            if (compositingReasons.filters) addReason(WebInspector.UIString("Element has CSS filters applied"));
            if (compositingReasons.positionFixed) addReason(WebInspector.UIString("Element has “position: fixed” style"));
            if (compositingReasons.positionSticky) addReason(WebInspector.UIString("Element has “position: sticky” style"));
            if (compositingReasons.overflowScrollingTouch) addReason(WebInspector.UIString("Element has “-webkit-overflow-scrolling: touch” style"));
            if (compositingReasons.stacking) addReason(WebInspector.UIString("Element establishes a stacking context"));
            if (compositingReasons.overlap) addReason(WebInspector.UIString("Element overlaps other compositing element"));
            if (compositingReasons.negativeZIndexChildren) addReason(WebInspector.UIString("Element has children with a negative z-index"));
            if (compositingReasons.transformWithCompositedDescendants) addReason(WebInspector.UIString("Element has a 2D transform and composited descendants"));
            if (compositingReasons.opacityWithCompositedDescendants) addReason(WebInspector.UIString("Element has opacity applied and composited descendants"));
            if (compositingReasons.maskWithCompositedDescendants) addReason(WebInspector.UIString("Element is masked and composited descendants"));
            if (compositingReasons.reflectionWithCompositedDescendants) addReason(WebInspector.UIString("Element has a reflection and composited descendants"));
            if (compositingReasons.filterWithCompositedDescendants) addReason(WebInspector.UIString("Element has CSS filters applied and composited descendants"));
            if (compositingReasons.blendingWithCompositedDescendants) addReason(WebInspector.UIString("Element has CSS blending applied and composited descendants"));
            if (compositingReasons.isolatesCompositedBlendingDescendants) addReason(WebInspector.UIString("Element is a stacking context and has composited descendants with CSS blending applied"));
            if (compositingReasons.perspective) addReason(WebInspector.UIString("Element has perspective applied"));
            if (compositingReasons.preserve3D) addReason(WebInspector.UIString("Element has “transform-style: preserve-3d” style"));
            if (compositingReasons.willChange) addReason(WebInspector.UIString("Element has “will-change” style with includes opacity, transform, transform-style, perspective, filter or backdrop-filter"));
            if (compositingReasons.root) addReason(WebInspector.UIString("Element is the root element"));
            if (compositingReasons.blending) addReason(WebInspector.UIString("Element has “blend-mode” style"));
        }
    }]);

    return LayerTreeDetailsSidebarPanel;
})(WebInspector.DOMDetailsSidebarPanel);
