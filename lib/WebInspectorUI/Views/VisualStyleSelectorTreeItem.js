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

WebInspector.VisualStyleSelectorTreeItem = (function (_WebInspector$GeneralTreeElement) {
    _inherits(VisualStyleSelectorTreeItem, _WebInspector$GeneralTreeElement);

    function VisualStyleSelectorTreeItem(style, title, subtitle) {
        _classCallCheck(this, VisualStyleSelectorTreeItem);

        var iconClassName = undefined;
        switch (style.type) {
            case WebInspector.CSSStyleDeclaration.Type.Rule:
                console.assert(style.ownerRule instanceof WebInspector.CSSRule, style.ownerRule);

                if (style.inherited) iconClassName = WebInspector.CSSStyleDeclarationSection.InheritedStyleRuleIconStyleClassName;else if (style.ownerRule.type === WebInspector.CSSStyleSheet.Type.Author) iconClassName = WebInspector.CSSStyleDeclarationSection.AuthorStyleRuleIconStyleClassName;else if (style.ownerRule.type === WebInspector.CSSStyleSheet.Type.User) iconClassName = WebInspector.CSSStyleDeclarationSection.UserStyleRuleIconStyleClassName;else if (style.ownerRule.type === WebInspector.CSSStyleSheet.Type.UserAgent) iconClassName = WebInspector.CSSStyleDeclarationSection.UserAgentStyleRuleIconStyleClassName;else if (style.ownerRule.type === WebInspector.CSSStyleSheet.Type.Inspector) iconClassName = WebInspector.CSSStyleDeclarationSection.InspectorStyleRuleIconStyleClassName;
                break;

            case WebInspector.CSSStyleDeclaration.Type.Inline:
            case WebInspector.CSSStyleDeclaration.Type.Attribute:
                if (style.inherited) iconClassName = WebInspector.CSSStyleDeclarationSection.InheritedElementStyleRuleIconStyleClassName;else iconClassName = WebInspector.DOMTreeElementPathComponent.DOMElementIconStyleClassName;
                break;
        }

        title = title.trim();

        _get(Object.getPrototypeOf(VisualStyleSelectorTreeItem.prototype), "constructor", this).call(this, ["visual-style-selector-item", iconClassName], title, subtitle, style);

        this._iconClassName = iconClassName;
        this._lastValue = title;
        this._enableEditing = true;
    }

    // Public

    _createClass(VisualStyleSelectorTreeItem, [{
        key: "onattach",

        // Protected

        value: function onattach() {
            _get(Object.getPrototypeOf(VisualStyleSelectorTreeItem.prototype), "onattach", this).call(this);

            this._listItemNode.addEventListener("mouseover", this._highlightNodesWithSelector.bind(this));
            this._listItemNode.addEventListener("mouseout", this._hideDOMNodeHighlight.bind(this));
            this._listItemNode.addEventListener("contextmenu", this._handleContextMenuEvent.bind(this));

            this._checkboxElement = document.createElement("input");
            this._checkboxElement.type = "checkbox";
            this._checkboxElement.checked = !this.representedObject[WebInspector.VisualStyleDetailsPanel.StyleDisabledSymbol];
            this._updateCheckboxTitle();
            this._checkboxElement.addEventListener("change", this._handleCheckboxChanged.bind(this));
            this._listItemNode.insertBefore(this._checkboxElement, this._iconElement);

            this._mainTitleElement.spellcheck = false;
            this._mainTitleElement.addEventListener("mousedown", this._handleMainTitleMouseDown.bind(this));
            this._mainTitleElement.addEventListener("keydown", this._handleMainTitleKeyDown.bind(this));
            this._mainTitleElement.addEventListener("keyup", this._highlightNodesWithSelector.bind(this));
            this._mainTitleElement.addEventListener("blur", this._commitSelector.bind(this));

            this.representedObject.addEventListener(WebInspector.CSSStyleDeclaration.Event.InitialTextModified, this._styleTextModified, this);
            if (this.representedObject.ownerRule) this.representedObject.ownerRule.addEventListener(WebInspector.CSSRule.Event.SelectorChanged, this._selectorChanged, this);

            this._styleTextModified();
        }
    }, {
        key: "ondeselect",
        value: function ondeselect() {
            this._listItemNode.classList.remove("editable");
        }

        // Private

    }, {
        key: "_highlightNodesWithSelector",
        value: function _highlightNodesWithSelector() {
            if (!this.representedObject.ownerRule) {
                WebInspector.domTreeManager.highlightDOMNode(this.representedObject.node.id);
                return;
            }

            WebInspector.domTreeManager.highlightSelector(this.selectorText, this.representedObject.node.ownerDocument.frameIdentifier);
        }
    }, {
        key: "_hideDOMNodeHighlight",
        value: function _hideDOMNodeHighlight() {
            WebInspector.domTreeManager.hideDOMNodeHighlight();
        }
    }, {
        key: "_handleContextMenuEvent",
        value: function _handleContextMenuEvent(event) {
            var contextMenu = new WebInspector.ContextMenu(event);

            if (this.representedObject.ownerRule) {
                contextMenu.appendItem(WebInspector.UIString("Show Source"), (function () {
                    if (event.metaKey) WebInspector.showOriginalUnformattedSourceCodeLocation(this.representedObject.ownerRule.sourceCodeLocation);else WebInspector.showSourceCodeLocation(this.representedObject.ownerRule.sourceCodeLocation);
                }).bind(this));
            }

            contextMenu.appendItem(WebInspector.UIString("Copy Rule"), (function () {
                var selectorText = !this.representedObject.ownerRule ? this.representedObject.node.appropriateSelectorFor(true) : null;
                InspectorFrontendHost.copyText(this.representedObject.generateCSSRuleString(selectorText));
            }).bind(this));

            contextMenu.appendItem(WebInspector.UIString("Reset"), (function () {
                this.representedObject.resetText();
                this.dispatchEventToListeners(WebInspector.VisualStyleSelectorTreeItem.Event.StyleTextReset);
            }).bind(this));

            contextMenu.show();
        }
    }, {
        key: "_handleCheckboxChanged",
        value: function _handleCheckboxChanged(event) {
            this._updateCheckboxTitle();
            this.dispatchEventToListeners(WebInspector.VisualStyleSelectorTreeItem.Event.CheckboxChanged, { enabled: this._checkboxElement.checked });
        }
    }, {
        key: "_updateCheckboxTitle",
        value: function _updateCheckboxTitle() {
            if (this._checkboxElement.checked) this._checkboxElement.title = WebInspector.UIString("Click to disable the selected rule");else this._checkboxElement.title = WebInspector.UIString("Click to enable the selected rule");
        }
    }, {
        key: "_handleMainTitleMouseDown",
        value: function _handleMainTitleMouseDown(event) {
            if (event.button !== 0 || event.ctrlKey) return;

            this._listItemNode.classList.toggle("editable", this.selected);
        }
    }, {
        key: "_handleMainTitleKeyDown",
        value: function _handleMainTitleKeyDown(event) {
            this._highlightNodesWithSelector();

            var enterKeyCode = WebInspector.KeyboardShortcut.Key.Enter.keyCode;
            if (event.keyCode === enterKeyCode) this._mainTitleElement.blur();
        }
    }, {
        key: "_commitSelector",
        value: function _commitSelector() {
            this._hideDOMNodeHighlight();
            this._listItemNode.classList.remove("editable");
            this._updateTitleTooltip();

            var value = this.selectorText;
            if (value === this._lastValue && this._valid) return;

            this.representedObject.ownerRule.selectorText = value;
        }
    }, {
        key: "_styleTextModified",
        value: function _styleTextModified() {
            this._listItemNode.classList.toggle("modified", this.representedObject.modified);
        }
    }, {
        key: "_selectorChanged",
        value: function _selectorChanged(event) {
            this._valid = event && event.data && event.data.valid;
            this._listItemNode.classList.toggle("selector-invalid", !this._valid);
            var invalidTitle = WebInspector.UIString("The selector '%s' is invalid.").format(this.selectorText);
            this._iconElement.title = !this._valid ? invalidTitle : null;
        }
    }, {
        key: "iconClassName",
        get: function get() {
            return this._iconClassName;
        }
    }, {
        key: "selectorText",
        get: function get() {
            var titleText = this._mainTitleElement.textContent;
            if (!titleText || !titleText.length) titleText = this._mainTitle;

            return titleText.trim();
        }
    }]);

    return VisualStyleSelectorTreeItem;
})(WebInspector.GeneralTreeElement);

WebInspector.VisualStyleSelectorTreeItem.Event = {
    StyleTextReset: "visual-style-selector-item-style-text-reset",
    CheckboxChanged: "visual-style-selector-item-checkbox-changed"
};
