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

WebInspector.RulesStyleDetailsPanel = (function (_WebInspector$StyleDetailsPanel) {
    _inherits(RulesStyleDetailsPanel, _WebInspector$StyleDetailsPanel);

    function RulesStyleDetailsPanel(delegate) {
        _classCallCheck(this, RulesStyleDetailsPanel);

        _get(Object.getPrototypeOf(RulesStyleDetailsPanel.prototype), "constructor", this).call(this, delegate, "rules", "rules", WebInspector.UIString("Styles — Rules"));

        this._sections = [];
        this._previousFocusedSection = null;
        this._ruleMediaAndInherticanceList = [];
        this._propertyToSelectAndHighlight = null;

        this._emptyFilterResultsElement = document.createElement("div");
        this._emptyFilterResultsElement.classList.add("no-filter-results");

        this._emptyFilterResultsMessage = document.createElement("div");
        this._emptyFilterResultsMessage.classList.add("no-filter-results-message");
        this._emptyFilterResultsMessage.textContent = WebInspector.UIString("No Results Found");
        this._emptyFilterResultsElement.appendChild(this._emptyFilterResultsMessage);

        this._boundRemoveSectionWithActiveEditor = this._removeSectionWithActiveEditor.bind(this);
    }

    // Public

    _createClass(RulesStyleDetailsPanel, [{
        key: "refresh",
        value: function refresh(significantChange) {
            // We only need to do a rebuild on significant changes. Other changes are handled
            // by the sections and text editors themselves.
            if (!significantChange) {
                _get(Object.getPrototypeOf(RulesStyleDetailsPanel.prototype), "refresh", this).call(this);
                return;
            }

            if (!this._forceSignificantChange) {
                this._sectionWithActiveEditor = null;
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this._sections[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var section = _step.value;

                        if (!section.editorActive) continue;

                        this._sectionWithActiveEditor = section;
                        break;
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

                if (this._sectionWithActiveEditor) {
                    this._sectionWithActiveEditor.addEventListener(WebInspector.CSSStyleDeclarationSection.Event.Blurred, this._boundRemoveSectionWithActiveEditor);
                    return;
                }
            }

            var newSections = [];
            var newDOMFragment = document.createDocumentFragment();

            var previousMediaList = [];
            var previousSection = null;

            var pseudoElements = this.nodeStyles.pseudoElements;
            var pseudoElementsStyle = [];
            for (var pseudoIdentifier in pseudoElements) pseudoElementsStyle = pseudoElementsStyle.concat(pseudoElements[pseudoIdentifier].orderedStyles);

            var orderedPseudoStyles = uniqueOrderedStyles(pseudoElementsStyle);
            // Reverse the array to allow ensure that splicing the array will not mess with the order.
            if (orderedPseudoStyles.length) orderedPseudoStyles.reverse();

            function mediaListsEqual(a, b) {
                a = a || [];
                b = b || [];

                if (a.length !== b.length) return false;

                for (var i = 0; i < a.length; ++i) {
                    var aMedia = a[i];
                    var bMedia = b[i];

                    if (aMedia.type !== bMedia.type) return false;

                    if (aMedia.text !== bMedia.text) return false;

                    if (!aMedia.sourceCodeLocation && bMedia.sourceCodeLocation) return false;

                    if (aMedia.sourceCodeLocation && !aMedia.sourceCodeLocation.isEqual(bMedia.sourceCodeLocation)) return false;
                }

                return true;
            }

            function uniqueOrderedStyles(orderedStyles) {
                var uniqueStyles = [];

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = orderedStyles[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var style = _step2.value;

                        var rule = style.ownerRule;
                        if (!rule) {
                            uniqueStyles.push(style);
                            continue;
                        }

                        var found = false;
                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                            for (var _iterator3 = uniqueStyles[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var existingStyle = _step3.value;

                                if (rule.isEqualTo(existingStyle.ownerRule)) {
                                    found = true;
                                    break;
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

                        if (!found) uniqueStyles.push(style);
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

                return uniqueStyles;
            }

            function appendStyleSection(style) {
                var section = style.__rulesSection;
                if (section && section.focused && !this._previousFocusedSection) this._previousFocusedSection = section;

                if (!section) {
                    section = new WebInspector.CSSStyleDeclarationSection(this, style);
                    style.__rulesSection = section;
                } else section.refresh();

                if (this._focusNextNewInspectorRule && style.ownerRule && style.ownerRule.type === WebInspector.CSSStyleSheet.Type.Inspector) {
                    this._previousFocusedSection = section;
                    delete this._focusNextNewInspectorRule;
                }

                // Reset lastInGroup in case the order/grouping changed.
                section.lastInGroup = false;

                newDOMFragment.appendChild(section.element);
                newSections.push(section);

                previousSection = section;
            }

            function insertMediaOrInheritanceLabel(style) {
                if (previousSection && previousSection.style.type === WebInspector.CSSStyleDeclaration.Type.Inline) previousSection.lastInGroup = true;

                var hasMediaOrInherited = [];

                if (previousSection && previousSection.style.node !== style.node) {
                    previousSection.lastInGroup = true;

                    var prefixElement = document.createElement("strong");
                    prefixElement.textContent = WebInspector.UIString("Inherited From: ");

                    var inheritedLabel = document.createElement("div");
                    inheritedLabel.className = "label";
                    inheritedLabel.appendChild(prefixElement);
                    inheritedLabel.appendChild(WebInspector.linkifyNodeReference(style.node));
                    newDOMFragment.appendChild(inheritedLabel);

                    hasMediaOrInherited.push(inheritedLabel);
                }

                // Only include the media list if it is different from the previous media list shown.
                var currentMediaList = style.ownerRule && style.ownerRule.mediaList || [];
                if (!mediaListsEqual(previousMediaList, currentMediaList)) {
                    previousMediaList = currentMediaList;

                    // Break the section group even if the media list is empty. That way the user knows
                    // the previous displayed media list does not apply to the next section.
                    if (previousSection) previousSection.lastInGroup = true;

                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                        for (var _iterator4 = currentMediaList[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var media = _step4.value;

                            var prefixElement = document.createElement("strong");
                            prefixElement.textContent = WebInspector.UIString("Media: ");

                            var mediaLabel = document.createElement("div");
                            mediaLabel.className = "label";
                            mediaLabel.append(prefixElement, media.text);

                            if (media.sourceCodeLocation) mediaLabel.append(" — ", WebInspector.createSourceCodeLocationLink(media.sourceCodeLocation, true));

                            newDOMFragment.appendChild(mediaLabel);

                            hasMediaOrInherited.push(mediaLabel);
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

                if (!hasMediaOrInherited.length && style.type !== WebInspector.CSSStyleDeclaration.Type.Inline) {
                    if (previousSection && !previousSection.lastInGroup) hasMediaOrInherited = this._ruleMediaAndInherticanceList.lastValue;else {
                        var prefixElement = document.createElement("strong");
                        prefixElement.textContent = WebInspector.UIString("Media: ");

                        var mediaLabel = document.createElement("div");
                        mediaLabel.className = "label";
                        mediaLabel.append(prefixElement, "all");

                        newDOMFragment.appendChild(mediaLabel);
                        hasMediaOrInherited.push(mediaLabel);
                    }
                }

                this._ruleMediaAndInherticanceList.push(hasMediaOrInherited);
            }

            function insertAllMatchingPseudoStyles(force) {
                if (!orderedPseudoStyles.length) return;

                if (force) {
                    for (var j = orderedPseudoStyles.length - 1; j >= 0; --j) {
                        var pseudoStyle = orderedPseudoStyles[j];
                        insertMediaOrInheritanceLabel.call(this, pseudoStyle);
                        appendStyleSection.call(this, pseudoStyle);
                    }
                    orderedPseudoStyles = [];
                }

                if (!previousSection) return;

                var ownerRule = previousSection.style.ownerRule;
                if (!ownerRule) return;

                for (var j = orderedPseudoStyles.length - 1; j >= 0; --j) {
                    var pseudoStyle = orderedPseudoStyles[j];
                    if (!pseudoStyle.ownerRule.selectorIsGreater(ownerRule.mostSpecificSelector)) continue;

                    insertMediaOrInheritanceLabel.call(this, pseudoStyle);
                    appendStyleSection.call(this, pseudoStyle);
                    ownerRule = pseudoStyle.ownerRule;
                    orderedPseudoStyles.splice(j, 1);
                }
            }

            this._ruleMediaAndInherticanceList = [];
            var orderedStyles = uniqueOrderedStyles(this.nodeStyles.orderedStyles);
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = orderedStyles[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var style = _step5.value;

                    var isUserAgentStyle = style.ownerRule && style.ownerRule.type === WebInspector.CSSStyleSheet.Type.UserAgent;
                    insertAllMatchingPseudoStyles.call(this, isUserAgentStyle || style.inerhited);

                    insertMediaOrInheritanceLabel.call(this, style);
                    appendStyleSection.call(this, style);
                }

                // Just in case there are any pseudo-selectors left that haven't been added.
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
                        _iterator5["return"]();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            insertAllMatchingPseudoStyles.call(this, true);

            if (previousSection) previousSection.lastInGroup = true;

            this.element.removeChildren();
            this.element.appendChild(newDOMFragment);
            this.element.appendChild(this._emptyFilterResultsElement);

            this._sections = newSections;

            for (var i = 0; i < this._sections.length; ++i) this._sections[i].updateLayout();

            _get(Object.getPrototypeOf(RulesStyleDetailsPanel.prototype), "refresh", this).call(this);
        }
    }, {
        key: "scrollToSectionAndHighlightProperty",
        value: function scrollToSectionAndHighlightProperty(property) {
            if (!this._visible) {
                this._propertyToSelectAndHighlight = property;
                return false;
            }

            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = this._sections[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var section = _step6.value;

                    if (section.highlightProperty(property)) return true;
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6["return"]) {
                        _iterator6["return"]();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }

            return false;
        }
    }, {
        key: "cssStyleDeclarationSectionEditorFocused",
        value: function cssStyleDeclarationSectionEditorFocused(ignoredSection) {
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = this._sections[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var section = _step7.value;

                    if (section !== ignoredSection) section.clearSelection();
                }
            } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion7 && _iterator7["return"]) {
                        _iterator7["return"]();
                    }
                } finally {
                    if (_didIteratorError7) {
                        throw _iteratorError7;
                    }
                }
            }
        }
    }, {
        key: "cssStyleDeclarationSectionEditorNextRule",
        value: function cssStyleDeclarationSectionEditorNextRule(currentSection) {
            currentSection.clearSelection();

            var index = this._sections.indexOf(currentSection);
            this._sections[index < this._sections.length - 1 ? index + 1 : 0].focusRuleSelector();
        }
    }, {
        key: "cssStyleDeclarationSectionEditorPreviousRule",
        value: function cssStyleDeclarationSectionEditorPreviousRule(currentSection, selectLastProperty) {
            currentSection.clearSelection();

            if (selectLastProperty || currentSection.selectorLocked) {
                var index = this._sections.indexOf(currentSection);
                index = index > 0 ? index - 1 : this._sections.length - 1;

                var section = this._sections[index];
                while (section.locked) {
                    index = index > 0 ? index - 1 : this._sections.length - 1;
                    section = this._sections[index];
                }

                section.focus();
                section.selectLastProperty();
                return;
            }

            currentSection.focusRuleSelector(true);
        }
    }, {
        key: "filterDidChange",
        value: function filterDidChange(filterBar) {
            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = this._ruleMediaAndInherticanceList[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var labels = _step8.value;

                    for (var i = 0; i < labels.length; ++i) {
                        labels[i].classList.toggle(WebInspector.CSSStyleDetailsSidebarPanel.NoFilterMatchInSectionClassName, filterBar.hasActiveFilters());

                        if (i === labels.length - 1) labels[i].classList.toggle("filter-matching-label", filterBar.hasActiveFilters());
                    }
                }
            } catch (err) {
                _didIteratorError8 = true;
                _iteratorError8 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion8 && _iterator8["return"]) {
                        _iterator8["return"]();
                    }
                } finally {
                    if (_didIteratorError8) {
                        throw _iteratorError8;
                    }
                }
            }

            var matchFound = !filterBar.hasActiveFilters();
            for (var i = 0; i < this._sections.length; ++i) {
                var section = this._sections[i];

                if (section.findMatchingPropertiesAndSelectors(filterBar.filters.text) && filterBar.hasActiveFilters()) {
                    if (this._ruleMediaAndInherticanceList[i].length) {
                        var _iteratorNormalCompletion9 = true;
                        var _didIteratorError9 = false;
                        var _iteratorError9 = undefined;

                        try {
                            for (var _iterator9 = this._ruleMediaAndInherticanceList[i][Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                                var label = _step9.value;

                                label.classList.remove(WebInspector.CSSStyleDetailsSidebarPanel.NoFilterMatchInSectionClassName);
                            }
                        } catch (err) {
                            _didIteratorError9 = true;
                            _iteratorError9 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion9 && _iterator9["return"]) {
                                    _iterator9["return"]();
                                }
                            } finally {
                                if (_didIteratorError9) {
                                    throw _iteratorError9;
                                }
                            }
                        }
                    } else section.element.classList.add(WebInspector.CSSStyleDetailsSidebarPanel.FilterMatchingSectionHasLabelClassName);

                    matchFound = true;
                }
            }

            this.element.classList.toggle("filter-non-matching", !matchFound);
        }
    }, {
        key: "cssStyleDeclarationSectionFocusNextNewInspectorRule",
        value: function cssStyleDeclarationSectionFocusNextNewInspectorRule() {
            this._focusNextNewInspectorRule = true;
        }
    }, {
        key: "newRuleButtonClicked",
        value: function newRuleButtonClicked() {
            if (this.nodeStyles.node.isInShadowTree()) return;

            this._focusNextNewInspectorRule = true;
            this.nodeStyles.addEmptyRule();
        }

        // Protected

    }, {
        key: "shown",
        value: function shown() {
            _get(Object.getPrototypeOf(RulesStyleDetailsPanel.prototype), "shown", this).call(this);

            // Associate the style and section objects so they can be reused.
            // Also update the layout in case we changed widths while hidden.
            for (var i = 0; i < this._sections.length; ++i) {
                var section = this._sections[i];
                section.style.__rulesSection = section;
                section.updateLayout();
            }
        }
    }, {
        key: "hidden",
        value: function hidden() {
            _get(Object.getPrototypeOf(RulesStyleDetailsPanel.prototype), "hidden", this).call(this);

            // Disconnect the style and section objects so they have a chance
            // to release their objects when this panel is not visible.
            for (var i = 0; i < this._sections.length; ++i) delete this._sections[i].style.__rulesSection;
        }
    }, {
        key: "widthDidChange",
        value: function widthDidChange() {
            for (var i = 0; i < this._sections.length; ++i) this._sections[i].updateLayout();
        }
    }, {
        key: "nodeStylesRefreshed",
        value: function nodeStylesRefreshed(event) {
            _get(Object.getPrototypeOf(RulesStyleDetailsPanel.prototype), "nodeStylesRefreshed", this).call(this, event);

            if (this._propertyToSelectAndHighlight) {
                this.scrollToSectionAndHighlightProperty(this._propertyToSelectAndHighlight);
                this._propertyToSelectAndHighlight = null;
            }

            if (this._previousFocusedSection && this._visible) {
                this._previousFocusedSection.focus();
                this._previousFocusedSection = null;
            }
        }

        // Private

    }, {
        key: "_removeSectionWithActiveEditor",
        value: function _removeSectionWithActiveEditor(event) {
            this._sectionWithActiveEditor.removeEventListener(WebInspector.CSSStyleDeclarationSection.Event.Blurred, this._boundRemoveSectionWithActiveEditor);
            this.refresh(true);
        }
    }]);

    return RulesStyleDetailsPanel;
})(WebInspector.StyleDetailsPanel);
