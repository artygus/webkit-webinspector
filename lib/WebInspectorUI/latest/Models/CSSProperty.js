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

WebInspector.CSSProperty = (function (_WebInspector$Object) {
    _inherits(CSSProperty, _WebInspector$Object);

    function CSSProperty(index, text, name, value, priority, enabled, overridden, implicit, anonymous, valid, styleSheetTextRange) {
        _classCallCheck(this, CSSProperty);

        _get(Object.getPrototypeOf(CSSProperty.prototype), "constructor", this).call(this);

        this._ownerStyle = null;
        this._index = index;

        this.update(text, name, value, priority, enabled, overridden, implicit, anonymous, valid, styleSheetTextRange, true);
    }

    // Public

    _createClass(CSSProperty, [{
        key: "update",
        value: function update(text, name, value, priority, enabled, overridden, implicit, anonymous, valid, styleSheetTextRange, dontFireEvents) {
            text = text || "";
            name = name || "";
            value = value || "";
            priority = priority || "";
            enabled = enabled || false;
            overridden = overridden || false;
            implicit = implicit || false;
            anonymous = anonymous || false;
            valid = valid || false;

            var changed = false;

            if (!dontFireEvents) {
                changed = this._name !== name || this._value !== value || this._priority !== priority || this._enabled !== enabled || this._implicit !== implicit || this._anonymous !== anonymous || this._valid !== valid;
            }

            // Use the setter for overridden if we want to fire events since the
            // OverriddenStatusChanged event coalesces changes before it fires.
            if (!dontFireEvents) this.overridden = overridden;else this._overridden = overridden;

            this._text = text;
            this._name = name;
            this._value = value;
            this._priority = priority;
            this._enabled = enabled;
            this._implicit = implicit;
            this._anonymous = anonymous;
            this._inherited = name in WebInspector.CSSKeywordCompletions.InheritedProperties;
            this._valid = valid;
            this._styleSheetTextRange = styleSheetTextRange || null;

            this._relatedShorthandProperty = null;
            this._relatedLonghandProperties = [];

            // Clear computed properties.
            delete this._styleDeclarationTextRange;
            delete this._canonicalName;
            delete this._hasOtherVendorNameOrKeyword;

            if (changed) this.dispatchEventToListeners(WebInspector.CSSProperty.Event.Changed);
        }
    }, {
        key: "addRelatedLonghandProperty",
        value: function addRelatedLonghandProperty(property) {
            this._relatedLonghandProperties.push(property);
        }
    }, {
        key: "clearRelatedLonghandProperties",
        value: function clearRelatedLonghandProperties(property) {
            this._relatedLonghandProperties = [];
        }
    }, {
        key: "hasOtherVendorNameOrKeyword",
        value: function hasOtherVendorNameOrKeyword() {
            if ("_hasOtherVendorNameOrKeyword" in this) return this._hasOtherVendorNameOrKeyword;

            this._hasOtherVendorNameOrKeyword = WebInspector.cssStyleManager.propertyNameHasOtherVendorPrefix(this.name) || WebInspector.cssStyleManager.propertyValueHasOtherVendorKeyword(this.value);

            return this._hasOtherVendorNameOrKeyword;
        }
    }, {
        key: "ownerStyle",
        get: function get() {
            return this._ownerStyle;
        },
        set: function set(ownerStyle) {
            this._ownerStyle = ownerStyle || null;
        }
    }, {
        key: "index",
        get: function get() {
            return this._index;
        },
        set: function set(index) {
            this._index = index;
        }
    }, {
        key: "synthesizedText",
        get: function get() {
            var name = this.name;
            if (!name) return "";

            var priority = this.priority;
            return name + ": " + this.value.trim() + (priority ? " !" + priority : "") + ";";
        }
    }, {
        key: "text",
        get: function get() {
            return this._text || this.synthesizedText;
        }
    }, {
        key: "name",
        get: function get() {
            return this._name;
        }
    }, {
        key: "canonicalName",
        get: function get() {
            if (this._canonicalName) return this._canonicalName;

            this._canonicalName = WebInspector.cssStyleManager.canonicalNameForPropertyName(this.name);

            return this._canonicalName;
        }
    }, {
        key: "value",
        get: function get() {
            return this._value;
        }
    }, {
        key: "important",
        get: function get() {
            return this.priority === "important";
        }
    }, {
        key: "priority",
        get: function get() {
            return this._priority;
        }
    }, {
        key: "enabled",
        get: function get() {
            return this._enabled && this._ownerStyle && (!isNaN(this._index) || this._ownerStyle.type === WebInspector.CSSStyleDeclaration.Type.Computed);
        }
    }, {
        key: "overridden",
        get: function get() {
            return this._overridden;
        },
        set: function set(overridden) {
            overridden = overridden || false;

            if (this._overridden === overridden) return;

            var previousOverridden = this._overridden;

            this._overridden = overridden;

            if (this._overriddenStatusChangedTimeout) return;

            function delayed() {
                delete this._overriddenStatusChangedTimeout;

                if (this._overridden === previousOverridden) return;

                this.dispatchEventToListeners(WebInspector.CSSProperty.Event.OverriddenStatusChanged);
            }

            this._overriddenStatusChangedTimeout = setTimeout(delayed.bind(this), 0);
        }
    }, {
        key: "implicit",
        get: function get() {
            return this._implicit;
        }
    }, {
        key: "anonymous",
        get: function get() {
            return this._anonymous;
        }
    }, {
        key: "inherited",
        get: function get() {
            return this._inherited;
        }
    }, {
        key: "valid",
        get: function get() {
            return this._valid;
        }
    }, {
        key: "styleSheetTextRange",
        get: function get() {
            return this._styleSheetTextRange;
        }
    }, {
        key: "styleDeclarationTextRange",
        get: function get() {
            if ("_styleDeclarationTextRange" in this) return this._styleDeclarationTextRange;

            if (!this._ownerStyle || !this._styleSheetTextRange) return null;

            var styleTextRange = this._ownerStyle.styleSheetTextRange;
            if (!styleTextRange) return null;

            var startLine = this._styleSheetTextRange.startLine - styleTextRange.startLine;
            var endLine = this._styleSheetTextRange.endLine - styleTextRange.startLine;

            var startColumn = this._styleSheetTextRange.startColumn;
            if (!startLine) startColumn -= styleTextRange.startColumn;

            var endColumn = this._styleSheetTextRange.endColumn;
            if (!endLine) endColumn -= styleTextRange.startColumn;

            this._styleDeclarationTextRange = new WebInspector.TextRange(startLine, startColumn, endLine, endColumn);

            return this._styleDeclarationTextRange;
        }
    }, {
        key: "relatedShorthandProperty",
        get: function get() {
            return this._relatedShorthandProperty;
        },
        set: function set(property) {
            this._relatedShorthandProperty = property || null;
        }
    }, {
        key: "relatedLonghandProperties",
        get: function get() {
            return this._relatedLonghandProperties;
        }
    }]);

    return CSSProperty;
})(WebInspector.Object);

WebInspector.CSSProperty.Event = {
    Changed: "css-property-changed",
    OverriddenStatusChanged: "css-property-overridden-status-changed"
};
