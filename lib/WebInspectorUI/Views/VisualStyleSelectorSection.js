var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2015 Apple Inc. All rights reserved.
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

WebInspector.VisualStyleSelectorSection = (function (_WebInspector$DetailsSection) {
    _inherits(VisualStyleSelectorSection, _WebInspector$DetailsSection);

    function VisualStyleSelectorSection(delegate) {
        _classCallCheck(this, VisualStyleSelectorSection);

        var selectorSection = { element: document.createElement("div") };
        selectorSection.element.classList.add("selectors");

        var controlElement = document.createElement("div");
        controlElement.classList.add("controls");

        _get(Object.getPrototypeOf(VisualStyleSelectorSection.prototype), "constructor", this).call(this, "visual-style-selector-section", WebInspector.UIString("Style Rules"), [selectorSection], controlElement);

        this._delegate = delegate || null;
        this._nodeStyles = null;

        this._currentSelectorElement = document.createElement("div");
        this._currentSelectorElement.classList.add("current-selector");

        var currentSelectorIconElement = document.createElement("img");
        currentSelectorIconElement.classList.add("icon");
        this._currentSelectorElement.appendChild(currentSelectorIconElement);

        this._currentSelectorText = document.createElement("span");
        this._currentSelectorElement.appendChild(this._currentSelectorText);

        this._headerElement.appendChild(this._currentSelectorElement);

        var selectorListElement = document.createElement("ol");
        selectorListElement.classList.add("selector-list");
        selectorSection.element.appendChild(selectorListElement);

        this._selectors = new WebInspector.TreeOutline(selectorListElement);
        this._selectors.onselect = this._selectorChanged.bind(this);
        this._focusNextNewInspectorRule = false;

        wrappedSVGDocument("Images/Plus13.svg", "visual-style-selector-section-add-rule", WebInspector.UIString("Click to add a new rule."), (function (wrapper) {
            wrapper.addEventListener("click", this._addNewRule.bind(this));
            controlElement.appendChild(wrapper);
        }).bind(this));

        this._headerElement.addEventListener("mouseover", this._handleMouseOver.bind(this));
        this._headerElement.addEventListener("mouseout", this._handleMouseOut.bind(this));
    }

    // Public

    _createClass(VisualStyleSelectorSection, [{
        key: "update",
        value: function update(nodeStyles) {
            var style = this.currentStyle();
            if (style) this._nodeStyles[WebInspector.VisualStyleSelectorSection.LastSelectedRuleSymbol] = style;

            if (nodeStyles) this._nodeStyles = nodeStyles;

            if (!this._nodeStyles) return;

            this._selectors.removeChildren();
            var previousRule = null;

            // Pseudo Styles
            var pseudoRules = [];
            var pseudoElements = this._nodeStyles.pseudoElements;
            for (var pseudoIdentifier in pseudoElements) {
                pseudoRules = pseudoRules.concat(pseudoElements[pseudoIdentifier].matchedRules);
            }var orderedPseudoRules = uniqueOrderedRules(pseudoRules);
            // Reverse the array to ensure that splicing the array will not mess with the order.
            if (orderedPseudoRules.length) orderedPseudoRules.reverse();

            function createSelectorItem(style, title, subtitle) {
                var selector = new WebInspector.VisualStyleSelectorTreeItem(style, title, subtitle);
                selector.addEventListener(WebInspector.VisualStyleSelectorTreeItem.Event.StyleTextReset, this._styleTextReset, this);
                selector.addEventListener(WebInspector.VisualStyleSelectorTreeItem.Event.CheckboxChanged, this._treeElementCheckboxToggled, this);
                this._selectors.appendChild(selector);

                if (this._focusNextNewInspectorRule && style.ownerRule && style.ownerRule.type === WebInspector.CSSStyleSheet.Type.Inspector) {
                    selector.select(true);
                    selector.element.scrollIntoView();
                    this._nodeStyles[WebInspector.VisualStyleSelectorSection.LastSelectedRuleSymbol] = style;
                    this._focusNextNewInspectorRule = false;
                    return;
                }

                if (this._nodeStyles[WebInspector.VisualStyleSelectorSection.LastSelectedRuleSymbol] === style) {
                    selector.select(true);
                    selector.element.scrollIntoView();
                }
            }

            function uniqueOrderedRules(orderedRules) {
                if (!orderedRules || !orderedRules.length) return new Array();

                var uniqueRules = new Map();
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = orderedRules[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var rule = _step.value;

                        if (!uniqueRules.has(rule.id)) uniqueRules.set(rule.id, rule);
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

                return Array.from(uniqueRules.values());
            }

            function insertAllMatchingPseudoRules(force) {
                if (!orderedPseudoRules.length) return;

                if (force) {
                    for (var i = orderedPseudoRules.length - 1; i >= 0; --i) {
                        var pseudoRule = orderedPseudoRules[i];
                        createSelectorItem.call(this, pseudoRule.style, pseudoRule.selectorText, pseudoRule.mediaText);
                    }
                    orderedPseudoRules = [];
                }

                if (!previousRule) return;

                for (var i = orderedPseudoRules.length - 1; i >= 0; --i) {
                    var pseudoRule = orderedPseudoRules[i];
                    if (!pseudoRule.selectorIsGreater(previousRule.mostSpecificSelector)) continue;

                    createSelectorItem.call(this, pseudoRule.style, pseudoRule.selectorText, pseudoRule.mediaText);
                    previousRule = pseudoRule;
                    orderedPseudoRules.splice(i, 1);
                }
            }

            if (this._nodeStyles.inlineStyle) {
                if (!this._nodeStyles[WebInspector.VisualStyleSelectorSection.LastSelectedRuleSymbol]) this._nodeStyles[WebInspector.VisualStyleSelectorSection.LastSelectedRuleSymbol] = this._nodeStyles.inlineStyle;

                // Inline Style
                createSelectorItem.call(this, this._nodeStyles.inlineStyle, WebInspector.UIString("This Element"));
            } else if (!this._nodeStyles[WebInspector.VisualStyleSelectorSection.LastSelectedRuleSymbol]) this._nodeStyles[WebInspector.VisualStyleSelectorSection.LastSelectedRuleSymbol] = this._nodeStyles.matchedRules[0].style;

            // Matched Rules
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = uniqueOrderedRules(this._nodeStyles.matchedRules)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var rule = _step2.value;

                    if (rule.type === WebInspector.CSSStyleSheet.Type.UserAgent) {
                        insertAllMatchingPseudoRules.call(this, true);
                        continue;
                    }

                    insertAllMatchingPseudoRules.call(this);
                    createSelectorItem.call(this, rule.style, rule.selectorText, rule.mediaText);
                    previousRule = rule;
                }

                // Just in case there are any remaining pseudo-styles.
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

            insertAllMatchingPseudoRules.call(this, true);

            // Inherited Rules
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this._nodeStyles.inheritedRules[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var inherited = _step3.value;

                    if (!inherited.matchedRules || !inherited.matchedRules.length) continue;

                    var dividerText = WebInspector.UIString("Inherited from %s").format(WebInspector.displayNameForNode(inherited.node));
                    var divider = new WebInspector.GeneralTreeElement("section-divider", dividerText);
                    divider.selectable = false;
                    this._selectors.appendChild(divider);

                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                        for (var _iterator4 = uniqueOrderedRules(inherited.matchedRules)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var rule = _step4.value;

                            if (rule.type === WebInspector.CSSStyleSheet.Type.UserAgent) continue;

                            createSelectorItem.call(this, rule.style, rule.selectorText, rule.mediaText);
                        }
                    } catch (err) {
                        _didIteratorError4 = true;
                        _iteratorError4 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
                                _iterator4["return"]();
                            }
                        } finally {
                            if (_didIteratorError4) {
                                throw _iteratorError4;
                            }
                        }
                    }
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                        _iterator3["return"]();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            this._focusNextNewInspectorRule = false;
        }
    }, {
        key: "currentStyle",
        value: function currentStyle() {
            if (!this._nodeStyles || !this._selectors.selectedTreeElement) return;

            return this._selectors.selectedTreeElement.representedObject;
        }

        // Private

    }, {
        key: "_selectorChanged",
        value: function _selectorChanged(selectedTreeElement) {
            console.assert(selectedTreeElement);
            if (!selectedTreeElement) return;

            // The class needs to be completely reset as the previously selected treeElement most likely had
            // a different icon className and it is simpler to regenerate the class than to find out which
            // class was previously applied.
            this._currentSelectorElement.className = "current-selector " + selectedTreeElement.iconClassName;

            var selectorText = selectedTreeElement.mainTitle;
            var mediaText = selectedTreeElement.subtitle;
            if (mediaText && mediaText.length) selectorText += " — " + mediaText; // em-dash

            this._currentSelectorText.textContent = selectorText;

            this.dispatchEventToListeners(WebInspector.VisualStyleSelectorSection.Event.SelectorChanged);
        }
    }, {
        key: "_styleTextReset",
        value: function _styleTextReset() {
            this.dispatchEventToListeners(WebInspector.VisualStyleSelectorSection.Event.StyleTextChanged);
        }
    }, {
        key: "_addNewRule",
        value: function _addNewRule(event) {
            if (!this._nodeStyles) return;

            this._nodeStyles.addEmptyRule();
            this._focusNextNewInspectorRule = true;
        }
    }, {
        key: "_treeElementCheckboxToggled",
        value: function _treeElementCheckboxToggled(event) {
            var style = this.currentStyle();
            if (!style) return;

            var styleText = style.text;
            if (!styleText || !styleText.length) return;

            // Comment or uncomment the style text.
            var newStyleText = "";
            var styleEnabled = event && event.data && event.data.enabled;
            if (styleEnabled) newStyleText = styleText.replace(/\s*(\/\*|\*\/)\s*/g, "");else newStyleText = "/* " + styleText.replace(/(\s*;(?!$)\s*)/g, "$1 *//* ") + " */";

            style.text = newStyleText;
            style[WebInspector.VisualStyleDetailsPanel.StyleDisabledSymbol] = !styleEnabled;
            this.dispatchEventToListeners(WebInspector.VisualStyleSelectorSection.Event.SelectorChanged);
        }
    }, {
        key: "_handleMouseOver",
        value: function _handleMouseOver() {
            if (!this.collapsed) return;

            var style = this.currentStyle();
            if (!style.ownerRule) {
                WebInspector.domTreeManager.highlightDOMNode(style.node.id);
                return;
            }

            WebInspector.domTreeManager.highlightSelector(style.ownerRule.selectorText, style.node.ownerDocument.frameIdentifier);
        }
    }, {
        key: "_handleMouseOut",
        value: function _handleMouseOut() {
            if (!this.collapsed) return;

            WebInspector.domTreeManager.hideDOMNodeHighlight();
        }
    }]);

    return VisualStyleSelectorSection;
})(WebInspector.DetailsSection);

WebInspector.VisualStyleSelectorSection.LastSelectedRuleSymbol = Symbol("visual-style-selector-section-last-selected-rule");

WebInspector.VisualStyleSelectorSection.Event = {
    SelectorChanged: "visual-style-selector-section-selector-changed",
    StyleTextChanged: "visual-style-selector-section-style-text-changed"
};
