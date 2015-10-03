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

WebInspector.CSSProperty = function (index, text, name, value, priority, enabled, overridden, implicit, anonymous, valid, styleSheetTextRange, styleDeclarationTextRange) {
    WebInspector.Object.call(this);

    this._ownerStyle = null;
    this._index = index;

    this.update(text, name, value, priority, enabled, overridden, implicit, anonymous, valid, styleSheetTextRange, styleDeclarationTextRange, true);
};

WebInspector.Object.addConstructorFunctions(WebInspector.CSSProperty);

WebInspector.CSSProperty.Event = {
    Changed: "css-property-changed",
    OverriddenStatusChanged: "css-property-overridden-status-changed"
};

WebInspector.CSSProperty.prototype = Object.defineProperties({
    constructor: WebInspector.CSSProperty,

    update: function update(text, name, value, priority, enabled, overridden, implicit, anonymous, valid, styleSheetTextRange, styleDeclarationTextRange, dontFireEvents) {
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

        if (styleDeclarationTextRange) this._styleDeclarationTextRange = styleDeclarationTextRange;else delete this._styleDeclarationTextRange;

        this._relatedShorthandProperty = null;
        this._relatedLonghandProperties = [];

        delete this._canonicalName;
        delete this._hasOtherVendorNameOrKeyword;

        if (!this._updatePropertySoonTimeout) {
            delete this._pendingName;
            delete this._pendingValue;
            delete this._pendingPriority;
        }

        if (changed) this.dispatchEventToListeners(WebInspector.CSSProperty.Event.Changed);
    },

    addRelatedLonghandProperty: function addRelatedLonghandProperty(property) {
        this._relatedLonghandProperties.push(property);
    },

    clearRelatedLonghandProperties: function clearRelatedLonghandProperties(property) {
        this._relatedLonghandProperties = [];
    },

    hasOtherVendorNameOrKeyword: function hasOtherVendorNameOrKeyword() {
        if ("_hasOtherVendorNameOrKeyword" in this) return this._hasOtherVendorNameOrKeyword;

        this._hasOtherVendorNameOrKeyword = WebInspector.cssStyleManager.propertyNameHasOtherVendorPrefix(this.name) || WebInspector.cssStyleManager.propertyValueHasOtherVendorKeyword(this.value);

        return this._hasOtherVendorNameOrKeyword;
    },

    add: function add() {
        // We can only add if the index is NaN. Return early otherwise.
        if (!this._ownerStyle || !this._ownerStyle.editable || !isNaN(this._index)) return;

        this._cancelPendingUpdate();
        this._ownerStyle.addProperty(this);
    },

    remove: function remove() {
        // We can only remove if the index is not NaN. Return early otherwise.
        if (!this._ownerStyle || !this._ownerStyle.editable || isNaN(this._index)) return;

        this._cancelPendingUpdate();
        this._ownerStyle.removeProperty(this);
    },

    // Private

    _updatePropertySoon: function _updatePropertySoon() {
        if (!this._ownerStyle || isNaN(this._index) || this._updatePropertySoonTimeout) return;

        function performUpdate() {
            delete this._updatePropertySoonTimeout;

            if (!this._ownerStyle || isNaN(this._index)) return;

            var name = "_pendingName" in this ? this._pendingName : this._name;
            var value = "_pendingValue" in this ? this._pendingValue : this._value;
            var priority = "_pendingPriority" in this ? this._pendingPriority : this._priority;

            delete this._pendingName;
            delete this._pendingValue;
            delete this._pendingPriority;

            this._ownerStyle.nodeStyles.changeProperty(this, name, value, priority);
        }

        this._updatePropertySoonTimeout = setTimeout(performUpdate.bind(this), 0);
    },

    _cancelPendingUpdate: function _cancelPendingUpdate() {
        if (!this._updatePropertySoonTimeout) return;
        clearTimeout(this._updatePropertySoonTimeout);
        delete this._updatePropertySoonTimeout;
    }
}, {
    ownerStyle: { // Public

        get: function get() {
            return this._ownerStyle;
        },
        set: function set(ownerStyle) {
            this._ownerStyle = ownerStyle || null;
        },
        configurable: true,
        enumerable: true
    },
    index: {
        get: function get() {
            return this._index;
        },
        set: function set(index) {
            this._index = index;
        },
        configurable: true,
        enumerable: true
    },
    synthesizedText: {
        get: function get() {
            var name = this.name;
            if (!name) return "";

            var priority = this.priority;
            return name + ": " + this.value.trim() + (priority ? " !" + priority : "") + ";";
        },
        configurable: true,
        enumerable: true
    },
    text: {
        get: function get() {
            return this._text || this.synthesizedText;
        },
        set: function set(text) {
            if (!this._ownerStyle || !this._ownerStyle.editable) return;

            if (this._text === text) return;

            if (isNaN(this._index)) {
                this._text = text || "";

                // Clear the name, value and priority since they might not match the text now.
                this._name = "";
                this._value = "";
                this._priority = "";

                // Ditto for the canonical and pending properties.
                delete this._canonicalName;
                delete this._pendingName;
                delete this._pendingValue;
                delete this._pendingPriority;

                return;
            }

            this._cancelPendingUpdate();
            this._ownerStyle.nodeStyles.changePropertyText(this, text);
        },
        configurable: true,
        enumerable: true
    },
    name: {
        get: function get() {
            if (isNaN(this._index)) return this._pendingName || this._name;
            return this._name;
        },
        set: function set(name) {
            if (!this._ownerStyle || !this._ownerStyle.editable) return;

            if (this._name === name) return;

            if (isNaN(this._index)) {
                this._name = name;
                this._text = "";

                delete this._canonicalName;
            } else {
                this._pendingName = name;
                this._updatePropertySoon();
            }
        },
        configurable: true,
        enumerable: true
    },
    canonicalName: {
        get: function get() {
            if (this._canonicalName) return this._canonicalName;

            this._canonicalName = WebInspector.cssStyleManager.canonicalNameForPropertyName(this.name);

            return this._canonicalName;
        },
        configurable: true,
        enumerable: true
    },
    value: {
        get: function get() {
            if (isNaN(this._index)) return this._pendingValue || this._value;
            return this._value;
        },
        set: function set(value) {
            if (!this._ownerStyle || !this._ownerStyle.editable) return;

            if (this._value === value) return;

            if (isNaN(this._index)) {
                this._value = value;
                this._text = "";
            } else {
                this._pendingValue = value;
                this._updatePropertySoon();
            }
        },
        configurable: true,
        enumerable: true
    },
    important: {
        get: function get() {
            return this.priority === "important";
        },
        set: function set(important) {
            this.priority = important ? "important" : "";
        },
        configurable: true,
        enumerable: true
    },
    priority: {
        get: function get() {
            if (isNaN(this._index)) return this._pendingPriority || this._priority;
            return this._priority;
        },
        set: function set(priority) {
            if (!this._ownerStyle || !this._ownerStyle.editable) return;

            if (this._priority === priority) return;

            if (isNaN(this._index)) {
                this._priority = priority;
                this._text = "";
            } else {
                this._pendingPriority = priority;
                this._updatePropertySoon();
            }
        },
        configurable: true,
        enumerable: true
    },
    enabled: {
        get: function get() {
            return this._enabled && this._ownerStyle && (!isNaN(this._index) || this._ownerStyle.type === WebInspector.CSSStyleDeclaration.Type.Computed);
        },
        set: function set(enabled) {
            if (!this._ownerStyle || !this._ownerStyle.editable) return;

            this._ownerStyle.nodeStyles.changePropertyEnabledState(this, enabled);
        },
        configurable: true,
        enumerable: true
    },
    overridden: {
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
        },
        configurable: true,
        enumerable: true
    },
    implicit: {
        get: function get() {
            return this._implicit;
        },
        configurable: true,
        enumerable: true
    },
    anonymous: {
        get: function get() {
            return this._anonymous;
        },
        configurable: true,
        enumerable: true
    },
    inherited: {
        get: function get() {
            return this._inherited;
        },
        configurable: true,
        enumerable: true
    },
    valid: {
        get: function get() {
            return this._valid;
        },
        configurable: true,
        enumerable: true
    },
    styleSheetTextRange: {
        get: function get() {
            return this._styleSheetTextRange;
        },
        configurable: true,
        enumerable: true
    },
    styleDeclarationTextRange: {
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
        },
        configurable: true,
        enumerable: true
    },
    relatedShorthandProperty: {
        get: function get() {
            return this._relatedShorthandProperty;
        },
        set: function set(property) {
            this._relatedShorthandProperty = property || null;
        },
        configurable: true,
        enumerable: true
    },
    relatedLonghandProperties: {
        get: function get() {
            return this._relatedLonghandProperties;
        },
        configurable: true,
        enumerable: true
    }
});

WebInspector.CSSProperty.prototype.__proto__ = WebInspector.Object.prototype;
