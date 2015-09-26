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

WebInspector.CSSStyleDeclarationSection = (function (_WebInspector$Object) {
    _inherits(CSSStyleDeclarationSection, _WebInspector$Object);

    function CSSStyleDeclarationSection(delegate, style) {
        _classCallCheck(this, CSSStyleDeclarationSection);

        console.assert(style instanceof WebInspector.CSSStyleDeclaration, style);

        _get(Object.getPrototypeOf(CSSStyleDeclarationSection.prototype), "constructor", this).call(this);

        this._delegate = delegate || null;

        this._style = style || null;
        this._selectorElements = [];
        this._ruleDisabled = false;

        this._element = document.createElement("div");
        this._element.classList.add("style-declaration-section");

        this._headerElement = document.createElement("div");
        this._headerElement.classList.add("header");

        this._iconElement = document.createElement("img");
        this._iconElement.classList.add("icon");
        this._headerElement.appendChild(this._iconElement);

        this._selectorElement = document.createElement("span");
        this._selectorElement.classList.add("selector");
        this._selectorElement.setAttribute("spellcheck", "false");
        this._selectorElement.addEventListener("mouseover", this._handleMouseOver.bind(this));
        this._selectorElement.addEventListener("mouseout", this._handleMouseOut.bind(this));
        this._selectorElement.addEventListener("keydown", this._handleKeyDown.bind(this));
        this._selectorElement.addEventListener("keyup", this._handleKeyUp.bind(this));
        this._selectorElement.addEventListener("paste", this._handleSelectorPaste.bind(this));
        this._headerElement.appendChild(this._selectorElement);

        this._originElement = document.createElement("span");
        this._originElement.classList.add("origin");
        this._headerElement.appendChild(this._originElement);

        this._propertiesElement = document.createElement("div");
        this._propertiesElement.classList.add("properties");

        this._editorActive = false;
        this._propertiesTextEditor = new WebInspector.CSSStyleDeclarationTextEditor(this, style);
        this._propertiesTextEditor.addEventListener(WebInspector.CSSStyleDeclarationTextEditor.Event.ContentChanged, this._editorContentChanged.bind(this));
        this._propertiesTextEditor.addEventListener(WebInspector.CSSStyleDeclarationTextEditor.Event.Blurred, this._editorBlurred.bind(this));
        this._propertiesElement.appendChild(this._propertiesTextEditor.element);

        this._element.appendChild(this._headerElement);
        this._element.appendChild(this._propertiesElement);

        var iconClassName;
        switch (style.type) {
            case WebInspector.CSSStyleDeclaration.Type.Rule:
                console.assert(style.ownerRule);

                if (style.inherited) iconClassName = WebInspector.CSSStyleDeclarationSection.InheritedStyleRuleIconStyleClassName;else if (style.ownerRule.type === WebInspector.CSSStyleSheet.Type.Author) iconClassName = WebInspector.CSSStyleDeclarationSection.AuthorStyleRuleIconStyleClassName;else if (style.ownerRule.type === WebInspector.CSSStyleSheet.Type.User) iconClassName = WebInspector.CSSStyleDeclarationSection.UserStyleRuleIconStyleClassName;else if (style.ownerRule.type === WebInspector.CSSStyleSheet.Type.UserAgent) iconClassName = WebInspector.CSSStyleDeclarationSection.UserAgentStyleRuleIconStyleClassName;else if (style.ownerRule.type === WebInspector.CSSStyleSheet.Type.Inspector) iconClassName = WebInspector.CSSStyleDeclarationSection.InspectorStyleRuleIconStyleClassName;
                break;

            case WebInspector.CSSStyleDeclaration.Type.Inline:
            case WebInspector.CSSStyleDeclaration.Type.Attribute:
                if (style.inherited) iconClassName = WebInspector.CSSStyleDeclarationSection.InheritedElementStyleRuleIconStyleClassName;else iconClassName = WebInspector.DOMTreeElementPathComponent.DOMElementIconStyleClassName;
                break;
        }

        if (style.editable) {
            this._iconElement.classList.add("toggle-able");
            this._iconElement.title = WebInspector.UIString("Comment All Properties");
            this._iconElement.addEventListener("click", this._toggleRuleOnOff.bind(this));
        }

        console.assert(iconClassName);
        this._element.classList.add(iconClassName);

        if (!style.editable) this._element.classList.add(WebInspector.CSSStyleDeclarationSection.LockedStyleClassName);else if (style.ownerRule) {
            this._style.ownerRule.addEventListener(WebInspector.CSSRule.Event.SelectorChanged, this._markSelector.bind(this));
            this._commitSelectorKeyboardShortcut = new WebInspector.KeyboardShortcut(null, WebInspector.KeyboardShortcut.Key.Enter, this._commitSelector.bind(this), this._selectorElement);
            this._selectorElement.addEventListener("blur", this._commitSelector.bind(this));
        } else this._element.classList.add(WebInspector.CSSStyleDeclarationSection.SelectorLockedStyleClassName);

        if (!WebInspector.CSSStyleDeclarationSection._generatedLockImages) {
            WebInspector.CSSStyleDeclarationSection._generatedLockImages = true;

            var specifications = { "style-lock-normal": { fillColor: [0, 0, 0, 0.5] } };
            generateColoredImagesForCSS("Images/Locked.svg", specifications, 8, 10);
        }

        this.refresh();

        this._headerElement.addEventListener("contextmenu", this._handleContextMenuEvent.bind(this));
    }

    // Public

    _createClass(CSSStyleDeclarationSection, [{
        key: "focus",
        value: function focus() {
            this._propertiesTextEditor.focus();
        }
    }, {
        key: "refresh",
        value: function refresh() {
            this._selectorElement.removeChildren();
            this._originElement.removeChildren();
            this._selectorElements = [];

            this._originElement.append(" — ");

            function appendSelector(selector, matched) {
                console.assert(selector instanceof WebInspector.CSSSelector);

                var selectorElement = document.createElement("span");
                selectorElement.textContent = selector.text;

                if (matched) selectorElement.classList.add(WebInspector.CSSStyleDeclarationSection.MatchedSelectorElementStyleClassName);

                var specificity = selector.specificity;
                if (specificity) {
                    var tooltip = WebInspector.UIString("Specificity: (%d, %d, %d)").format(specificity[0], specificity[1], specificity[2]);
                    if (selector.dynamic) {
                        tooltip += "\n";
                        if (this._style.inherited) tooltip += WebInspector.UIString("Dynamically calculated for the parent element");else tooltip += WebInspector.UIString("Dynamically calculated for the selected element");
                    }
                    selectorElement.title = tooltip;
                } else if (selector.dynamic) {
                    var tooltip = WebInspector.UIString("Specificity: No value for selected element");
                    tooltip += "\n";
                    tooltip += WebInspector.UIString("Dynamically calculated for the selected element and did not match");
                    selectorElement.title = tooltip;
                }

                this._selectorElement.appendChild(selectorElement);
                this._selectorElements.push(selectorElement);
            }

            function appendSelectorTextKnownToMatch(selectorText) {
                var selectorElement = document.createElement("span");
                selectorElement.textContent = selectorText;
                selectorElement.classList.add(WebInspector.CSSStyleDeclarationSection.MatchedSelectorElementStyleClassName);
                this._selectorElement.appendChild(selectorElement);
            }

            switch (this._style.type) {
                case WebInspector.CSSStyleDeclaration.Type.Rule:
                    console.assert(this._style.ownerRule);

                    var selectors = this._style.ownerRule.selectors;
                    var matchedSelectorIndices = this._style.ownerRule.matchedSelectorIndices;
                    var alwaysMatch = !matchedSelectorIndices.length;
                    if (selectors.length) {
                        for (var i = 0; i < selectors.length; ++i) {
                            appendSelector.call(this, selectors[i], alwaysMatch || matchedSelectorIndices.includes(i));
                            if (i < selectors.length - 1) this._selectorElement.append(", ");
                        }
                    } else appendSelectorTextKnownToMatch.call(this, this._style.ownerRule.selectorText);

                    if (this._style.ownerRule.sourceCodeLocation) {
                        var sourceCodeLink = WebInspector.createSourceCodeLocationLink(this._style.ownerRule.sourceCodeLocation, true);
                        this._originElement.appendChild(sourceCodeLink);
                    } else {
                        var originString;
                        switch (this._style.ownerRule.type) {
                            case WebInspector.CSSStyleSheet.Type.Author:
                                originString = WebInspector.UIString("Author Stylesheet");
                                break;

                            case WebInspector.CSSStyleSheet.Type.User:
                                originString = WebInspector.UIString("User Stylesheet");
                                break;

                            case WebInspector.CSSStyleSheet.Type.UserAgent:
                                originString = WebInspector.UIString("User Agent Stylesheet");
                                break;

                            case WebInspector.CSSStyleSheet.Type.Inspector:
                                originString = WebInspector.UIString("Web Inspector");
                                break;
                        }

                        console.assert(originString);
                        if (originString) this._originElement.append(originString);
                    }

                    break;

                case WebInspector.CSSStyleDeclaration.Type.Inline:
                    appendSelectorTextKnownToMatch.call(this, WebInspector.displayNameForNode(this._style.node));
                    this._originElement.append(WebInspector.UIString("Style Attribute"));
                    break;

                case WebInspector.CSSStyleDeclaration.Type.Attribute:
                    appendSelectorTextKnownToMatch.call(this, WebInspector.displayNameForNode(this._style.node));
                    this._originElement.append(WebInspector.UIString("HTML Attributes"));
                    break;
            }
        }
    }, {
        key: "highlightProperty",
        value: function highlightProperty(property) {
            if (this._propertiesTextEditor.highlightProperty(property)) {
                this._element.scrollIntoView();
                return true;
            }

            return false;
        }
    }, {
        key: "findMatchingPropertiesAndSelectors",
        value: function findMatchingPropertiesAndSelectors(needle) {
            this._element.classList.remove(WebInspector.CSSStyleDetailsSidebarPanel.NoFilterMatchInSectionClassName, WebInspector.CSSStyleDetailsSidebarPanel.FilterMatchingSectionHasLabelClassName);

            var hasMatchingSelector = false;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._selectorElements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var selectorElement = _step.value;

                    selectorElement.classList.remove(WebInspector.CSSStyleDetailsSidebarPanel.FilterMatchSectionClassName);

                    if (needle && selectorElement.textContent.includes(needle)) {
                        selectorElement.classList.add(WebInspector.CSSStyleDetailsSidebarPanel.FilterMatchSectionClassName);
                        hasMatchingSelector = true;
                    }
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

            if (!needle) {
                this._propertiesTextEditor.resetFilteredProperties();
                return false;
            }

            var hasMatchingProperty = this._propertiesTextEditor.findMatchingProperties(needle);

            if (!hasMatchingProperty && !hasMatchingSelector) {
                this._element.classList.add(WebInspector.CSSStyleDetailsSidebarPanel.NoFilterMatchInSectionClassName);
                return false;
            }

            return true;
        }
    }, {
        key: "updateLayout",
        value: function updateLayout() {
            this._propertiesTextEditor.updateLayout();
        }
    }, {
        key: "clearSelection",
        value: function clearSelection() {
            this._propertiesTextEditor.clearSelection();
        }
    }, {
        key: "cssStyleDeclarationTextEditorFocused",
        value: function cssStyleDeclarationTextEditorFocused() {
            if (typeof this._delegate.cssStyleDeclarationSectionEditorFocused === "function") this._delegate.cssStyleDeclarationSectionEditorFocused(this);
        }
    }, {
        key: "cssStyleDeclarationTextEditorSwitchRule",
        value: function cssStyleDeclarationTextEditorSwitchRule(reverse) {
            if (!this._delegate) return;

            if (reverse && typeof this._delegate.cssStyleDeclarationSectionEditorPreviousRule === "function") this._delegate.cssStyleDeclarationSectionEditorPreviousRule(this);else if (!reverse && typeof this._delegate.cssStyleDeclarationSectionEditorNextRule === "function") this._delegate.cssStyleDeclarationSectionEditorNextRule(this);
        }
    }, {
        key: "focusRuleSelector",
        value: function focusRuleSelector(reverse) {
            if (this.selectorLocked) {
                this.focus();
                return;
            }

            if (this.locked) {
                this.cssStyleDeclarationTextEditorSwitchRule(reverse);
                return;
            }

            var selection = window.getSelection();
            selection.removeAllRanges();

            this._element.scrollIntoViewIfNeeded();

            var range = document.createRange();
            range.selectNodeContents(this._selectorElement);
            selection.addRange(range);
        }
    }, {
        key: "selectLastProperty",
        value: function selectLastProperty() {
            this._propertiesTextEditor.selectLastProperty();
        }
    }, {
        key: "_handleSelectorPaste",
        value: function _handleSelectorPaste(event) {
            if (this._style.type === WebInspector.CSSStyleDeclaration.Type.Inline || !this._style.ownerRule) return;

            if (!event || !event.clipboardData) return;

            var data = event.clipboardData.getData("text/plain");
            if (!data) return;

            function parseTextForRule(_x4) {
                var _again2 = true;

                _function2: while (_again2) {
                    var text = _x4;
                    containsBraces = match = undefined;
                    _again2 = false;

                    var containsBraces = /[\{\}]/;
                    if (!containsBraces.test(text)) return null;

                    var match = text.match(/([^{]+){(.*)}/);
                    if (!match) return null;

                    // If the match "body" contains braces, parse that body as if it were a rule.
                    // This will usually happen if the user includes a media query in the copied text.
                    if (containsBraces.test(match[2])) {
                        _x4 = match[2];
                        _again2 = true;
                        continue _function2;
                    } else {
                        return match;
                    }
                }
            }

            var match = parseTextForRule(data);
            if (!match) return;

            var selector = match[1].trim();
            this._selectorElement.textContent = selector;
            this._style.nodeStyles.changeRule(this._style.ownerRule, selector, match[2]);
            event.preventDefault();
        }
    }, {
        key: "_handleContextMenuEvent",
        value: function _handleContextMenuEvent(event) {
            if (window.getSelection().toString().length) return;

            var contextMenu = new WebInspector.ContextMenu(event);

            if (!this._style.inherited) {
                contextMenu.appendItem(WebInspector.UIString("Duplicate Selector"), (function () {
                    if (this._delegate && typeof this._delegate.cssStyleDeclarationSectionFocusNextNewInspectorRule === "function") this._delegate.cssStyleDeclarationSectionFocusNextNewInspectorRule();

                    this._style.nodeStyles.addRuleWithSelector(this._currentSelectorText);
                }).bind(this));
            }

            contextMenu.appendItem(WebInspector.UIString("Copy Rule"), (function () {
                InspectorFrontendHost.copyText(this._style.generateCSSRuleString());
            }).bind(this));

            contextMenu.show();
        }
    }, {
        key: "_toggleRuleOnOff",
        value: function _toggleRuleOnOff() {
            if (this._hasInvalidSelector) return;

            this._ruleDisabled = this._ruleDisabled ? !this._propertiesTextEditor.uncommentAllProperties() : this._propertiesTextEditor.commentAllProperties();
            this._iconElement.title = this._ruleDisabled ? WebInspector.UIString("Uncomment All Properties") : WebInspector.UIString("Comment All Properties");
            this._element.classList.toggle("rule-disabled", this._ruleDisabled);
        }
    }, {
        key: "_highlightNodesWithSelector",
        value: function _highlightNodesWithSelector() {
            if (!this._style.ownerRule) {
                WebInspector.domTreeManager.highlightDOMNode(this._style.node.id);
                return;
            }

            WebInspector.domTreeManager.highlightSelector(this._currentSelectorText, this._style.node.ownerDocument.frameIdentifier);
        }
    }, {
        key: "_hideDOMNodeHighlight",
        value: function _hideDOMNodeHighlight() {
            WebInspector.domTreeManager.hideDOMNodeHighlight();
        }
    }, {
        key: "_handleMouseOver",
        value: function _handleMouseOver(event) {
            this._highlightNodesWithSelector();
        }
    }, {
        key: "_handleMouseOut",
        value: function _handleMouseOut(event) {
            this._hideDOMNodeHighlight();
        }
    }, {
        key: "_handleKeyDown",
        value: function _handleKeyDown(event) {
            if (event.keyCode !== 9) {
                this._highlightNodesWithSelector();
                return;
            }

            if (event.shiftKey && this._delegate && typeof this._delegate.cssStyleDeclarationSectionEditorPreviousRule === "function") {
                event.preventDefault();
                this._delegate.cssStyleDeclarationSectionEditorPreviousRule(this, true);
                return;
            }

            if (!event.metaKey) {
                event.preventDefault();
                this.focus();
                this._propertiesTextEditor.selectFirstProperty();
                return;
            }
        }
    }, {
        key: "_handleKeyUp",
        value: function _handleKeyUp(event) {
            this._highlightNodesWithSelector();
        }
    }, {
        key: "_commitSelector",
        value: function _commitSelector(mutations) {
            console.assert(this._style.ownerRule);
            if (!this._style.ownerRule) return;

            var newSelectorText = this._selectorElement.textContent.trim();
            if (!newSelectorText) {
                // Revert to the current selector (by doing a refresh) since the new selector is empty.
                this.refresh();
                return;
            }

            this._style.ownerRule.selectorText = newSelectorText;
        }
    }, {
        key: "_markSelector",
        value: function _markSelector(event) {
            var valid = event && event.data && event.data.valid;
            this._element.classList.toggle(WebInspector.CSSStyleDeclarationSection.SelectorInvalidClassName, !valid);
            if (valid) {
                this._iconElement.title = this._ruleDisabled ? WebInspector.UIString("Uncomment All Properties") : WebInspector.UIString("Comment All Properties");
                this._selectorElement.title = null;
                return;
            }

            this._iconElement.title = WebInspector.UIString("The selector '%s' is invalid.").format(this._selectorElement.textContent.trim());
            this._selectorElement.title = WebInspector.UIString("Using the previous selector '%s'.").format(this._style.ownerRule.selectorText);
            for (var i = 0; i < this._selectorElement.children.length; ++i) this._selectorElement.children[i].title = null;
        }
    }, {
        key: "_editorContentChanged",
        value: function _editorContentChanged(event) {
            this._editorActive = true;
        }
    }, {
        key: "_editorBlurred",
        value: function _editorBlurred(event) {
            this._editorActive = false;
            this.dispatchEventToListeners(WebInspector.CSSStyleDeclarationSection.Event.Blurred);
        }
    }, {
        key: "element",
        get: function get() {
            return this._element;
        }
    }, {
        key: "style",
        get: function get() {
            return this._style;
        }
    }, {
        key: "lastInGroup",
        get: function get() {
            return this._element.classList.contains(WebInspector.CSSStyleDeclarationSection.LastInGroupStyleClassName);
        },
        set: function set(last) {
            if (last) this._element.classList.add(WebInspector.CSSStyleDeclarationSection.LastInGroupStyleClassName);else this._element.classList.remove(WebInspector.CSSStyleDeclarationSection.LastInGroupStyleClassName);
        }
    }, {
        key: "focused",
        get: function get() {
            return this._propertiesTextEditor.focused;
        }
    }, {
        key: "selectorLocked",
        get: function get() {
            return !this.locked && !this._style.ownerRule;
        }
    }, {
        key: "locked",
        get: function get() {
            return !this._style.editable;
        }
    }, {
        key: "editorActive",
        get: function get() {
            return this._editorActive;
        }

        // Private

    }, {
        key: "_currentSelectorText",
        get: function get() {
            var selectorText = this._selectorElement.textContent;
            if (!selectorText || !selectorText.length) {
                if (!this._style.ownerRule) return;

                selectorText = this._style.ownerRule.selectorText;
            }

            return selectorText.trim();
        }
    }, {
        key: "_hasInvalidSelector",
        get: function get() {
            return this._element.classList.contains(WebInspector.CSSStyleDeclarationSection.SelectorInvalidClassName);
        }
    }]);

    return CSSStyleDeclarationSection;
})(WebInspector.Object);

WebInspector.CSSStyleDeclarationSection.Event = {
    Blurred: "css-style-declaration-sections-blurred"
};

WebInspector.CSSStyleDeclarationSection.LockedStyleClassName = "locked";
WebInspector.CSSStyleDeclarationSection.SelectorLockedStyleClassName = "selector-locked";
WebInspector.CSSStyleDeclarationSection.SelectorInvalidClassName = "invalid-selector";
WebInspector.CSSStyleDeclarationSection.LastInGroupStyleClassName = "last-in-group";
WebInspector.CSSStyleDeclarationSection.MatchedSelectorElementStyleClassName = "matched";

WebInspector.CSSStyleDeclarationSection.AuthorStyleRuleIconStyleClassName = "author-style-rule-icon";
WebInspector.CSSStyleDeclarationSection.UserStyleRuleIconStyleClassName = "user-style-rule-icon";
WebInspector.CSSStyleDeclarationSection.UserAgentStyleRuleIconStyleClassName = "user-agent-style-rule-icon";
WebInspector.CSSStyleDeclarationSection.InspectorStyleRuleIconStyleClassName = "inspector-style-rule-icon";
WebInspector.CSSStyleDeclarationSection.InheritedStyleRuleIconStyleClassName = "inherited-style-rule-icon";
WebInspector.CSSStyleDeclarationSection.InheritedElementStyleRuleIconStyleClassName = "inherited-element-style-rule-icon";
