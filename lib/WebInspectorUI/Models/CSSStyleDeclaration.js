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

WebInspector.CSSStyleDeclaration = (function (_WebInspector$Object) {
    _inherits(CSSStyleDeclaration, _WebInspector$Object);

    function CSSStyleDeclaration(nodeStyles, ownerStyleSheet, id, type, node, inherited, text, properties, styleSheetTextRange) {
        _classCallCheck(this, CSSStyleDeclaration);

        _get(Object.getPrototypeOf(CSSStyleDeclaration.prototype), "constructor", this).call(this);

        console.assert(nodeStyles);
        this._nodeStyles = nodeStyles;

        this._ownerRule = null;

        this._ownerStyleSheet = ownerStyleSheet || null;
        this._id = id || null;
        this._type = type || null;
        this._node = node || null;
        this._inherited = inherited || false;

        this._pendingProperties = [];
        this._propertyNameMap = {};

        this._initialText = text;
        this._hasModifiedInitialText = false;

        this.update(text, properties, styleSheetTextRange, true);
    }

    // Public

    _createClass(CSSStyleDeclaration, [{
        key: "update",
        value: function update(text, properties, styleSheetTextRange, dontFireEvents) {
            text = text || "";
            properties = properties || [];

            var oldProperties = this._properties || [];
            var oldText = this._text;

            this._text = text;
            this._properties = properties;
            this._styleSheetTextRange = styleSheetTextRange;
            this._propertyNameMap = {};

            delete this._visibleProperties;

            var editable = this.editable;

            for (var i = 0; i < this._properties.length; ++i) {
                var property = this._properties[i];
                property.ownerStyle = this;

                // Store the property in a map if we arn't editable. This
                // allows for quick lookup for computed style. Editable
                // styles don't use the map since they need to account for
                // overridden properties.
                if (!editable) this._propertyNameMap[property.name] = property;else {
                    // Remove from pendingProperties (if it was pending).
                    this._pendingProperties.remove(property);
                }
            }

            var removedProperties = [];
            for (var i = 0; i < oldProperties.length; ++i) {
                var oldProperty = oldProperties[i];

                if (!this._properties.includes(oldProperty)) {
                    // Clear the index, since it is no longer valid.
                    oldProperty.index = NaN;

                    removedProperties.push(oldProperty);

                    // Keep around old properties in pending in case they
                    // are needed again during editing.
                    if (editable) this._pendingProperties.push(oldProperty);
                }
            }

            if (dontFireEvents) return;

            var addedProperties = [];
            for (var i = 0; i < this._properties.length; ++i) {
                if (!oldProperties.includes(this._properties[i])) addedProperties.push(this._properties[i]);
            }

            // Don't fire the event if there is text and it hasn't changed.
            if (oldText && this._text && oldText === this._text) {
                // We shouldn't have any added or removed properties in this case.
                console.assert(!addedProperties.length && !removedProperties.length);
                if (!addedProperties.length && !removedProperties.length) return;
            }

            function delayed() {
                this.dispatchEventToListeners(WebInspector.CSSStyleDeclaration.Event.PropertiesChanged, { addedProperties: addedProperties, removedProperties: removedProperties });
            }

            // Delay firing the PropertiesChanged event so DOMNodeStyles has a chance to mark overridden and associated properties.
            setTimeout(delayed.bind(this), 0);
        }
    }, {
        key: "resetText",
        value: function resetText() {
            this.text = this._initialText;
        }
    }, {
        key: "propertyForName",
        value: function propertyForName(name, dontCreateIfMissing) {
            console.assert(name);
            if (!name) return null;

            if (!this.editable) return this._propertyNameMap[name] || null;

            // Editable styles don't use the map since they need to
            // account for overridden properties.

            function findMatch(properties) {
                for (var i = 0; i < properties.length; ++i) {
                    var property = properties[i];
                    if (property.canonicalName !== name && property.name !== name) continue;
                    if (bestMatchProperty && !bestMatchProperty.overridden && property.overridden) continue;
                    bestMatchProperty = property;
                }
            }

            var bestMatchProperty = null;

            findMatch(this._properties);

            if (bestMatchProperty) return bestMatchProperty;

            if (dontCreateIfMissing || !this.editable) return null;

            findMatch(this._pendingProperties, true);

            if (bestMatchProperty) return bestMatchProperty;

            var newProperty = new WebInspector.CSSProperty(NaN, null, name);
            newProperty.ownerStyle = this;

            this._pendingProperties.push(newProperty);

            return newProperty;
        }
    }, {
        key: "generateCSSRuleString",
        value: function generateCSSRuleString() {
            if (!this._ownerRule) return;

            var styleText = "";
            var mediaQueriesCount = 0;
            var mediaList = this._ownerRule.mediaList;
            if (mediaList.length) {
                mediaQueriesCount = mediaList.length;

                for (var i = mediaQueriesCount - 1; i >= 0; --i) {
                    styleText += "    ".repeat(mediaQueriesCount - i - 1) + "@media " + mediaList[i].text + " {\n";
                }
            }

            styleText += "    ".repeat(mediaQueriesCount) + this._ownerRule.selectorText + " {\n";

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._properties[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var property = _step.value;

                    if (property.anonymous) continue;

                    styleText += "    ".repeat(mediaQueriesCount + 1) + property.text.trim();

                    if (!styleText.endsWith(";")) styleText += ";";

                    styleText += "\n";
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

            for (var i = mediaQueriesCount; i > 0; --i) {
                styleText += "    ".repeat(i) + "}\n";
            }styleText += "}";

            return styleText;
        }

        // Protected

    }, {
        key: "id",
        get: function get() {
            return this._id;
        }
    }, {
        key: "ownerStyleSheet",
        get: function get() {
            return this._ownerStyleSheet;
        }
    }, {
        key: "type",
        get: function get() {
            return this._type;
        }
    }, {
        key: "inherited",
        get: function get() {
            return this._inherited;
        }
    }, {
        key: "node",
        get: function get() {
            return this._node;
        }
    }, {
        key: "editable",
        get: function get() {
            if (!this._id) return false;

            if (this._type === WebInspector.CSSStyleDeclaration.Type.Rule) return this._ownerRule && this._ownerRule.editable;

            if (this._type === WebInspector.CSSStyleDeclaration.Type.Inline) return !this._node.isInShadowTree();

            return false;
        }
    }, {
        key: "ownerRule",
        get: function get() {
            return this._ownerRule;
        },
        set: function set(rule) {
            this._ownerRule = rule || null;
        }
    }, {
        key: "text",
        get: function get() {
            return this._text;
        },
        set: function set(text) {
            if (this._text === text) return;

            var trimmedText = text.trim();
            if (this._text === trimmedText) return;

            if (!trimmedText.length || this._type === WebInspector.CSSStyleDeclaration.Type.Inline) text = trimmedText;

            var modified = text !== this._initialText;
            if (modified !== this._hasModifiedInitialText) {
                this._hasModifiedInitialText = modified;
                this.dispatchEventToListeners(WebInspector.CSSStyleDeclaration.Event.InitialTextModified);
            }

            this._nodeStyles.changeStyleText(this, text);
        }
    }, {
        key: "modified",
        get: function get() {
            return this._hasModifiedInitialText;
        }
    }, {
        key: "properties",
        get: function get() {
            return this._properties;
        }
    }, {
        key: "visibleProperties",
        get: function get() {
            if (this._visibleProperties) return this._visibleProperties;

            this._visibleProperties = this._properties.filter(function (property) {
                return !!property.styleDeclarationTextRange;
            });

            return this._visibleProperties;
        }
    }, {
        key: "pendingProperties",
        get: function get() {
            return this._pendingProperties;
        }
    }, {
        key: "styleSheetTextRange",
        get: function get() {
            return this._styleSheetTextRange;
        }
    }, {
        key: "nodeStyles",
        get: function get() {
            return this._nodeStyles;
        }
    }]);

    return CSSStyleDeclaration;
})(WebInspector.Object);

WebInspector.CSSStyleDeclaration.Event = {
    PropertiesChanged: "css-style-declaration-properties-changed",
    InitialTextModified: "css-style-declaration-initial-text-modified"
};

WebInspector.CSSStyleDeclaration.Type = {
    Rule: "css-style-declaration-type-rule",
    Inline: "css-style-declaration-type-inline",
    Attribute: "css-style-declaration-type-attribute",
    Computed: "css-style-declaration-type-computed"
};
