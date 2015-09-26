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

WebInspector.CSSStyleDetailsSidebarPanel = (function (_WebInspector$DOMDetailsSidebarPanel) {
    _inherits(CSSStyleDetailsSidebarPanel, _WebInspector$DOMDetailsSidebarPanel);

    function CSSStyleDetailsSidebarPanel() {
        _classCallCheck(this, CSSStyleDetailsSidebarPanel);

        _get(Object.getPrototypeOf(CSSStyleDetailsSidebarPanel.prototype), "constructor", this).call(this, "css-style", WebInspector.UIString("Styles"), WebInspector.UIString("Style"), null, true);

        this._selectedPanel = null;

        this._forcedPseudoClassCheckboxes = {};

        if (WebInspector.cssStyleManager.canForcePseudoClasses()) {
            this._forcedPseudoClassContainer = document.createElement("div");
            this._forcedPseudoClassContainer.className = "pseudo-classes";

            var groupElement = null;

            WebInspector.CSSStyleManager.ForceablePseudoClasses.forEach(function (pseudoClass) {
                // We don't localize the label since it is a CSS pseudo-class from the CSS standard.
                var label = pseudoClass.capitalize();

                var labelElement = document.createElement("label");

                var checkboxElement = document.createElement("input");
                checkboxElement.addEventListener("change", this._forcedPseudoClassCheckboxChanged.bind(this, pseudoClass));
                checkboxElement.type = "checkbox";

                this._forcedPseudoClassCheckboxes[pseudoClass] = checkboxElement;

                labelElement.appendChild(checkboxElement);
                labelElement.append(label);

                if (!groupElement || groupElement.children.length === 2) {
                    groupElement = document.createElement("div");
                    groupElement.className = "group";
                    this._forcedPseudoClassContainer.appendChild(groupElement);
                }

                groupElement.appendChild(labelElement);
            }, this);

            this.contentElement.appendChild(this._forcedPseudoClassContainer);
        }

        this._computedStyleDetailsPanel = new WebInspector.ComputedStyleDetailsPanel(this);
        this._rulesStyleDetailsPanel = new WebInspector.RulesStyleDetailsPanel(this);
        this._visualStyleDetailsPanel = new WebInspector.VisualStyleDetailsPanel(this);

        this._computedStyleDetailsPanel.addEventListener(WebInspector.StyleDetailsPanel.Event.Refreshed, this._filterDidChange, this);
        this._rulesStyleDetailsPanel.addEventListener(WebInspector.StyleDetailsPanel.Event.Refreshed, this._filterDidChange, this);

        this._panels = [this._computedStyleDetailsPanel, this._rulesStyleDetailsPanel, this._visualStyleDetailsPanel];
        this._panelNavigationInfo = [this._computedStyleDetailsPanel.navigationInfo, this._rulesStyleDetailsPanel.navigationInfo, this._visualStyleDetailsPanel.navigationInfo];

        this._lastSelectedSectionSetting = new WebInspector.Setting("last-selected-style-details-panel", this._rulesStyleDetailsPanel.navigationInfo.identifier);

        var selectedPanel = this._panelMatchingIdentifier(this._lastSelectedSectionSetting.value);
        if (!selectedPanel) selectedPanel = this._rulesStyleDetailsPanel;

        this._switchPanels(selectedPanel);

        this._navigationItem = new WebInspector.ScopeRadioButtonNavigationItem(this._identifier, this._displayName, this._panelNavigationInfo, selectedPanel.navigationInfo);
        this._navigationItem.addEventListener(WebInspector.ScopeRadioButtonNavigationItem.Event.SelectedItemChanged, this._handleSelectedItemChanged, this);

        var optionsContainer = document.createElement("div");
        optionsContainer.classList.add("options-container");

        var newRuleButton = document.createElement("img");
        newRuleButton.classList.add("new-rule");
        newRuleButton.title = WebInspector.UIString("New Rule");
        newRuleButton.addEventListener("click", this._newRuleButtonClicked.bind(this));
        optionsContainer.appendChild(newRuleButton);

        this._filterBar = new WebInspector.FilterBar();
        this._filterBar.placeholder = WebInspector.UIString("Filter Styles");
        this._filterBar.addEventListener(WebInspector.FilterBar.Event.FilterDidChange, this._filterDidChange, this);
        optionsContainer.appendChild(this._filterBar.element);

        WebInspector.cssStyleManager.addEventListener(WebInspector.CSSStyleManager.Event.StyleSheetAdded, this.refresh, this);
        WebInspector.cssStyleManager.addEventListener(WebInspector.CSSStyleManager.Event.StyleSheetRemoved, this.refresh, this);

        this.element.appendChild(optionsContainer);
    }

    // Public

    _createClass(CSSStyleDetailsSidebarPanel, [{
        key: "supportsDOMNode",
        value: function supportsDOMNode(nodeToInspect) {
            return nodeToInspect.nodeType() === Node.ELEMENT_NODE;
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var domNode = this.domNode;
            if (!domNode) return;

            this.contentElement.scrollTop = this._initialScrollOffset;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._panels[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var panel = _step.value;

                    panel.element._savedScrollTop = undefined;
                    panel.markAsNeedsRefresh(domNode);
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

            this._updatePseudoClassCheckboxes();
        }
    }, {
        key: "visibilityDidChange",
        value: function visibilityDidChange() {
            _get(Object.getPrototypeOf(CSSStyleDetailsSidebarPanel.prototype), "visibilityDidChange", this).call(this);

            if (!this._selectedPanel) return;

            if (!this.visible) {
                this._selectedPanel.hidden();
                return;
            }

            this._updateNoForcedPseudoClassesScrollOffset();

            this._selectedPanel.shown();
            this._selectedPanel.markAsNeedsRefresh(this.domNode);
        }
    }, {
        key: "widthDidChange",
        value: function widthDidChange() {
            this._updateNoForcedPseudoClassesScrollOffset();

            if (this._selectedPanel) this._selectedPanel.widthDidChange();
        }
    }, {
        key: "computedStyleDetailsPanelShowProperty",
        value: function computedStyleDetailsPanelShowProperty(property) {
            this._rulesStyleDetailsPanel.scrollToSectionAndHighlightProperty(property);
            this._switchPanels(this._rulesStyleDetailsPanel);

            this._navigationItem.selectedItemIdentifier = this._lastSelectedSectionSetting.value;
        }

        // Protected

    }, {
        key: "addEventListeners",
        value: function addEventListeners() {
            var effectiveDOMNode = this.domNode.isPseudoElement() ? this.domNode.parentNode : this.domNode;
            if (!effectiveDOMNode) return;

            effectiveDOMNode.addEventListener(WebInspector.DOMNode.Event.EnabledPseudoClassesChanged, this._updatePseudoClassCheckboxes, this);
        }
    }, {
        key: "removeEventListeners",
        value: function removeEventListeners() {
            var effectiveDOMNode = this.domNode.isPseudoElement() ? this.domNode.parentNode : this.domNode;
            if (!effectiveDOMNode) return;

            effectiveDOMNode.removeEventListener(null, null, this);
        }

        // Private

    }, {
        key: "_updateNoForcedPseudoClassesScrollOffset",
        value: function _updateNoForcedPseudoClassesScrollOffset() {
            if (this._forcedPseudoClassContainer) WebInspector.CSSStyleDetailsSidebarPanel.NoForcedPseudoClassesScrollOffset = this._forcedPseudoClassContainer.offsetHeight;
        }
    }, {
        key: "_panelMatchingIdentifier",
        value: function _panelMatchingIdentifier(identifier) {
            var selectedPanel;

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._panels[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var panel = _step2.value;

                    if (panel.navigationInfo.identifier !== identifier) continue;

                    selectedPanel = panel;
                    break;
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

            return selectedPanel;
        }
    }, {
        key: "_handleSelectedItemChanged",
        value: function _handleSelectedItemChanged() {
            var selectedIdentifier = this._navigationItem.selectedItemIdentifier;
            var selectedPanel = this._panelMatchingIdentifier(selectedIdentifier);
            this._switchPanels(selectedPanel);
        }
    }, {
        key: "_switchPanels",
        value: function _switchPanels(selectedPanel) {
            console.assert(selectedPanel);

            if (this._selectedPanel) {
                this._selectedPanel.hidden();
                this._selectedPanel.element._savedScrollTop = this.contentElement.scrollTop;
                this._selectedPanel.element.remove();
            }

            this._selectedPanel = selectedPanel;

            if (this._selectedPanel) {
                this.contentElement.appendChild(this._selectedPanel.element);

                if (typeof this._selectedPanel.element._savedScrollTop === "number") this.contentElement.scrollTop = this._selectedPanel.element._savedScrollTop;else this.contentElement.scrollTop = this._initialScrollOffset;

                var hasFilter = typeof this._selectedPanel.filterDidChange === "function";
                this.contentElement.classList.toggle("has-filter-bar", hasFilter);
                if (this._filterBar) this.contentElement.classList.toggle(WebInspector.CSSStyleDetailsSidebarPanel.FilterInProgressClassName, hasFilter && this._filterBar.hasActiveFilters());

                this.contentElement.classList.toggle("supports-new-rule", typeof this._selectedPanel.newRuleButtonClicked === "function");
                this._selectedPanel.shown();

                this._lastSelectedSectionSetting.value = selectedPanel.navigationInfo.identifier;
            }
        }
    }, {
        key: "_forcedPseudoClassCheckboxChanged",
        value: function _forcedPseudoClassCheckboxChanged(pseudoClass, event) {
            if (!this.domNode) return;

            var effectiveDOMNode = this.domNode.isPseudoElement() ? this.domNode.parentNode : this.domNode;

            effectiveDOMNode.setPseudoClassEnabled(pseudoClass, event.target.checked);
        }
    }, {
        key: "_updatePseudoClassCheckboxes",
        value: function _updatePseudoClassCheckboxes() {
            if (!this.domNode) return;

            var effectiveDOMNode = this.domNode.isPseudoElement() ? this.domNode.parentNode : this.domNode;

            var enabledPseudoClasses = effectiveDOMNode.enabledPseudoClasses;

            for (var pseudoClass in this._forcedPseudoClassCheckboxes) {
                var checkboxElement = this._forcedPseudoClassCheckboxes[pseudoClass];
                checkboxElement.checked = enabledPseudoClasses.includes(pseudoClass);
            }
        }
    }, {
        key: "_newRuleButtonClicked",
        value: function _newRuleButtonClicked() {
            if (this._selectedPanel && typeof this._selectedPanel.newRuleButtonClicked === "function") this._selectedPanel.newRuleButtonClicked();
        }
    }, {
        key: "_filterDidChange",
        value: function _filterDidChange() {
            this.contentElement.classList.toggle(WebInspector.CSSStyleDetailsSidebarPanel.FilterInProgressClassName, this._filterBar.hasActiveFilters());

            this._selectedPanel.filterDidChange(this._filterBar);
        }
    }, {
        key: "_initialScrollOffset",
        get: function get() {
            if (!WebInspector.cssStyleManager.canForcePseudoClasses()) return 0;
            return this.domNode && this.domNode.enabledPseudoClasses.length ? 0 : WebInspector.CSSStyleDetailsSidebarPanel.NoForcedPseudoClassesScrollOffset;
        }
    }]);

    return CSSStyleDetailsSidebarPanel;
})(WebInspector.DOMDetailsSidebarPanel);

WebInspector.CSSStyleDetailsSidebarPanel.NoForcedPseudoClassesScrollOffset = 30; // Default height of the forced pseudo classes container. Updated in widthDidChange.
WebInspector.CSSStyleDetailsSidebarPanel.FilterInProgressClassName = "filter-in-progress";
WebInspector.CSSStyleDetailsSidebarPanel.FilterMatchingSectionHasLabelClassName = "filter-section-has-label";
WebInspector.CSSStyleDetailsSidebarPanel.FilterMatchSectionClassName = "filter-matching";
WebInspector.CSSStyleDetailsSidebarPanel.NoFilterMatchInSectionClassName = "filter-section-non-matching";
WebInspector.CSSStyleDetailsSidebarPanel.NoFilterMatchInPropertyClassName = "filter-property-non-matching";
