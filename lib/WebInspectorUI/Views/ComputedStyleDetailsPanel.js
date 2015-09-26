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

WebInspector.ComputedStyleDetailsPanel = (function (_WebInspector$StyleDetailsPanel) {
    _inherits(ComputedStyleDetailsPanel, _WebInspector$StyleDetailsPanel);

    function ComputedStyleDetailsPanel(delegate) {
        _classCallCheck(this, ComputedStyleDetailsPanel);

        _get(Object.getPrototypeOf(ComputedStyleDetailsPanel.prototype), "constructor", this).call(this, delegate, WebInspector.ComputedStyleDetailsPanel.StyleClassName, "computed", WebInspector.UIString("Styles — Computed"));

        this._computedStyleShowAllSetting = new WebInspector.Setting("computed-style-show-all", false);

        var computedStyleShowAllLabel = document.createElement("label");
        computedStyleShowAllLabel.textContent = WebInspector.UIString("Show All");

        this._computedStyleShowAllCheckbox = document.createElement("input");
        this._computedStyleShowAllCheckbox.type = "checkbox";
        this._computedStyleShowAllCheckbox.checked = this._computedStyleShowAllSetting.value;
        this._computedStyleShowAllCheckbox.addEventListener("change", this._computedStyleShowAllCheckboxValueChanged.bind(this));
        computedStyleShowAllLabel.appendChild(this._computedStyleShowAllCheckbox);

        this._propertiesTextEditor = new WebInspector.CSSStyleDeclarationTextEditor(this);
        this._propertiesTextEditor.showsImplicitProperties = this._computedStyleShowAllSetting.value;
        this._propertiesTextEditor.alwaysShowPropertyNames = ["display", "width", "height"];
        this._propertiesTextEditor.sortProperties = true;

        var propertiesRow = new WebInspector.DetailsSectionRow();
        var propertiesGroup = new WebInspector.DetailsSectionGroup([propertiesRow]);
        var propertiesSection = new WebInspector.DetailsSection("computed-style-properties", WebInspector.UIString("Properties"), [propertiesGroup], computedStyleShowAllLabel);

        propertiesRow.element.appendChild(this._propertiesTextEditor.element);

        // Region flow name is used to display the "flow-from" property of the Region Containers.
        this._regionFlowFragment = document.createElement("span");
        this._regionFlowFragment.appendChild(document.createElement("img")).className = "icon";
        this._regionFlowNameLabelValue = this._regionFlowFragment.appendChild(document.createElement("span"));

        var goToRegionFlowButton = this._regionFlowFragment.appendChild(WebInspector.createGoToArrowButton());
        goToRegionFlowButton.addEventListener("click", this._goToRegionFlowArrowWasClicked.bind(this));

        this._regionFlowNameRow = new WebInspector.DetailsSectionSimpleRow(WebInspector.UIString("Region Flow"));
        this._regionFlowNameRow.element.classList.add("content-flow-link");

        // Content flow name is used to display the "flow-into" property of the Content nodes.
        this._contentFlowFragment = document.createElement("span");
        this._contentFlowFragment.appendChild(document.createElement("img")).className = "icon";
        this._contentFlowNameLabelValue = this._contentFlowFragment.appendChild(document.createElement("span"));

        var goToContentFlowButton = this._contentFlowFragment.appendChild(WebInspector.createGoToArrowButton());
        goToContentFlowButton.addEventListener("click", this._goToContentFlowArrowWasClicked.bind(this));

        this._contentFlowNameRow = new WebInspector.DetailsSectionSimpleRow(WebInspector.UIString("Content Flow"));
        this._contentFlowNameRow.element.classList.add("content-flow-link");

        var flowNamesGroup = new WebInspector.DetailsSectionGroup([this._regionFlowNameRow, this._contentFlowNameRow]);
        this._flowNamesSection = new WebInspector.DetailsSection("content-flow", WebInspector.UIString("Flows"), [flowNamesGroup]);

        this._containerRegionsDataGrid = new WebInspector.DOMTreeDataGrid();
        this._containerRegionsDataGrid.element.classList.add("no-header");

        var containerRegionsRow = new WebInspector.DetailsSectionDataGridRow(this._containerRegionsDataGrid);
        var containerRegionsGroup = new WebInspector.DetailsSectionGroup([containerRegionsRow]);
        this._containerRegionsFlowSection = new WebInspector.DetailsSection("container-regions", WebInspector.UIString("Container Regions"), [containerRegionsGroup]);

        this.element.appendChild(propertiesSection.element);
        this.element.appendChild(this._flowNamesSection.element);
        this.element.appendChild(this._containerRegionsFlowSection.element);

        this._resetFlowDetails();

        this._boxModelDiagramRow = new WebInspector.BoxModelDetailsSectionRow();

        var boxModelGroup = new WebInspector.DetailsSectionGroup([this._boxModelDiagramRow]);
        var boxModelSection = new WebInspector.DetailsSection("style-box-model", WebInspector.UIString("Box Model"), [boxModelGroup]);

        this.element.appendChild(boxModelSection.element);

        this.cssStyleDeclarationTextEditorShouldAddPropertyGoToArrows = true;
    }

    // Public

    _createClass(ComputedStyleDetailsPanel, [{
        key: "cssStyleDeclarationTextEditorShowProperty",
        value: function cssStyleDeclarationTextEditorShowProperty(property) {
            if (typeof this._delegate.computedStyleDetailsPanelShowProperty === "function") this._delegate.computedStyleDetailsPanelShowProperty(property);
        }
    }, {
        key: "refresh",
        value: function refresh(significantChange) {
            // We only need to do a rebuild on significant changes. Other changes are handled
            // by the sections and text editors themselves.
            if (!significantChange) {
                _get(Object.getPrototypeOf(ComputedStyleDetailsPanel.prototype), "refresh", this).call(this);
                return;
            }

            this._propertiesTextEditor.style = this.nodeStyles.computedStyle;
            this._refreshFlowDetails(this.nodeStyles.node);
            this._boxModelDiagramRow.nodeStyles = this.nodeStyles;

            _get(Object.getPrototypeOf(ComputedStyleDetailsPanel.prototype), "refresh", this).call(this);
        }
    }, {
        key: "filterDidChange",
        value: function filterDidChange(filterBar) {
            this._propertiesTextEditor.removeNonMatchingProperties(filterBar.filters.text);
        }

        // Protected

    }, {
        key: "shown",
        value: function shown() {
            _get(Object.getPrototypeOf(ComputedStyleDetailsPanel.prototype), "shown", this).call(this);

            this._propertiesTextEditor.updateLayout();
        }
    }, {
        key: "widthDidChange",
        value: function widthDidChange() {
            this._propertiesTextEditor.updateLayout();
        }

        // Private

    }, {
        key: "_computedStyleShowAllCheckboxValueChanged",
        value: function _computedStyleShowAllCheckboxValueChanged(event) {
            var checked = this._computedStyleShowAllCheckbox.checked;
            this._computedStyleShowAllSetting.value = checked;
            this._propertiesTextEditor.showsImplicitProperties = checked;
        }
    }, {
        key: "_updateFlowNamesSectionVisibility",
        value: function _updateFlowNamesSectionVisibility() {
            this._flowNamesSection.element.classList.toggle("hidden", !this._contentFlow && !this._regionFlow);
        }
    }, {
        key: "_resetFlowDetails",
        value: function _resetFlowDetails() {
            this.regionFlow = null;
            this.contentFlow = null;
            this.containerRegions = null;
        }
    }, {
        key: "_refreshFlowDetails",
        value: function _refreshFlowDetails(domNode) {
            this._resetFlowDetails();
            if (!domNode) return;

            function contentFlowInfoReady(error, flowData) {
                // Element is not part of any flow.
                if (error || !flowData) {
                    this._resetFlowDetails();
                    return;
                }

                this.regionFlow = flowData.regionFlow;
                this.contentFlow = flowData.contentFlow;
                this.containerRegions = flowData.regions;
            }

            WebInspector.domTreeManager.getNodeContentFlowInfo(domNode, contentFlowInfoReady.bind(this));
        }
    }, {
        key: "_goToRegionFlowArrowWasClicked",
        value: function _goToRegionFlowArrowWasClicked() {
            WebInspector.showContentFlowDOMTree(this._regionFlow);
        }
    }, {
        key: "_goToContentFlowArrowWasClicked",
        value: function _goToContentFlowArrowWasClicked() {
            WebInspector.showContentFlowDOMTree(this._contentFlow, this.nodeStyles.node);
        }
    }, {
        key: "regionFlow",
        get: function get() {
            return this._regionFlow;
        },
        set: function set(regionFlow) {
            this._regionFlow = regionFlow;
            this._regionFlowNameLabelValue.textContent = regionFlow ? regionFlow.name : "";
            this._regionFlowNameRow.value = regionFlow ? this._regionFlowFragment : null;
            this._updateFlowNamesSectionVisibility();
        }
    }, {
        key: "contentFlow",
        get: function get() {
            return this._contentFlow;
        },
        set: function set(contentFlow) {
            this._contentFlow = contentFlow;
            this._contentFlowNameLabelValue.textContent = contentFlow ? contentFlow.name : "";
            this._contentFlowNameRow.value = contentFlow ? this._contentFlowFragment : null;
            this._updateFlowNamesSectionVisibility();
        }
    }, {
        key: "containerRegions",
        get: function get() {
            return this._containerRegions;
        },
        set: function set(regions) {
            this._containerRegions = regions;

            if (!regions || !regions.length) {
                this._containerRegionsFlowSection.element.classList.add("hidden");
                return;
            }

            this._containerRegionsDataGrid.removeChildren();
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = regions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var regionNode = _step.value;

                    this._containerRegionsDataGrid.appendChild(new WebInspector.DOMTreeDataGridNode(regionNode));
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

            this._containerRegionsFlowSection.element.classList.remove("hidden");
        }
    }]);

    return ComputedStyleDetailsPanel;
})(WebInspector.StyleDetailsPanel);

WebInspector.ComputedStyleDetailsPanel.StyleClassName = "computed";
