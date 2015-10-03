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

WebInspector.CSSRule = (function (_WebInspector$Object) {
    _inherits(CSSRule, _WebInspector$Object);

    function CSSRule(nodeStyles, ownerStyleSheet, id, type, sourceCodeLocation, selectorText, selectors, matchedSelectorIndices, style, mediaList) {
        _classCallCheck(this, CSSRule);

        _get(Object.getPrototypeOf(CSSRule.prototype), "constructor", this).call(this);

        console.assert(nodeStyles);
        this._nodeStyles = nodeStyles;

        this._ownerStyleSheet = ownerStyleSheet || null;
        this._id = id || null;
        this._type = type || null;

        this.update(sourceCodeLocation, selectorText, selectors, matchedSelectorIndices, style, mediaList, true);
    }

    // Public

    _createClass(CSSRule, [{
        key: "update",
        value: function update(sourceCodeLocation, selectorText, selectors, matchedSelectorIndices, style, mediaList, dontFireEvents) {
            sourceCodeLocation = sourceCodeLocation || null;
            selectorText = selectorText || "";
            selectors = selectors || [];
            matchedSelectorIndices = matchedSelectorIndices || [];
            style = style || null;
            mediaList = mediaList || [];

            var changed = false;
            if (!dontFireEvents) {
                changed = this._selectorText !== selectorText || !Object.shallowEqual(this._selectors, selectors) || !Object.shallowEqual(this._matchedSelectorIndices, matchedSelectorIndices) || this._style !== style || !!this._sourceCodeLocation !== !!sourceCodeLocation || this._mediaList.length !== mediaList.length;
                // FIXME: Look for differences in the media list arrays.
            }

            if (this._style) this._style.ownerRule = null;

            this._sourceCodeLocation = sourceCodeLocation;
            this._selectorText = selectorText;
            this._selectors = selectors;
            this._matchedSelectorIndices = matchedSelectorIndices;
            this._mostSpecificSelector = null;
            this._style = style;
            this._mediaList = mediaList;

            this._matchedSelectors = null;
            this._matchedSelectorText = null;

            if (this._style) this._style.ownerRule = this;

            if (changed) this.dispatchEventToListeners(WebInspector.CSSRule.Event.Changed);
        }
    }, {
        key: "isEqualTo",
        value: function isEqualTo(rule) {
            if (!rule) return false;

            return Object.shallowEqual(this._id, rule.id);
        }
    }, {
        key: "selectorIsGreater",
        value: function selectorIsGreater(otherSelector) {
            var mostSpecificSelector = this.mostSpecificSelector;

            if (!mostSpecificSelector) return false;

            return mostSpecificSelector.isGreaterThan(otherSelector);
        }

        // Protected

    }, {
        key: "_determineMostSpecificSelector",

        // Private

        value: function _determineMostSpecificSelector() {
            if (!this._selectors || !this._selectors.length) return null;

            var selectors = this.matchedSelectors;

            if (!selectors.length) selectors = this._selectors;

            var specificSelector = selectors[0];

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = selectors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var selector = _step.value;

                    if (selector.isGreaterThan(specificSelector)) specificSelector = selector;
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

            return specificSelector;
        }
    }, {
        key: "_selectorRejected",
        value: function _selectorRejected(error) {
            this.dispatchEventToListeners(WebInspector.CSSRule.Event.SelectorChanged, { valid: !error });
        }
    }, {
        key: "_selectorResolved",
        value: function _selectorResolved(rulePayload) {
            this.dispatchEventToListeners(WebInspector.CSSRule.Event.SelectorChanged, { valid: !!rulePayload });
        }
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
        key: "editable",
        get: function get() {
            return !!this._id && (this._type === WebInspector.CSSStyleSheet.Type.Author || this._type === WebInspector.CSSStyleSheet.Type.Inspector);
        }
    }, {
        key: "type",
        get: function get() {
            return this._type;
        }
    }, {
        key: "sourceCodeLocation",
        get: function get() {
            return this._sourceCodeLocation;
        }
    }, {
        key: "selectorText",
        get: function get() {
            return this._selectorText;
        },
        set: function set(selectorText) {
            console.assert(this.editable);
            if (!this.editable) return;

            if (this._selectorText === selectorText) {
                this._selectorResolved(true);
                return;
            }

            this._nodeStyles.changeRuleSelector(this, selectorText).then(this._selectorResolved.bind(this), this._selectorRejected.bind(this));
        }
    }, {
        key: "selectors",
        get: function get() {
            return this._selectors;
        }
    }, {
        key: "matchedSelectorIndices",
        get: function get() {
            return this._matchedSelectorIndices;
        }
    }, {
        key: "matchedSelectors",
        get: function get() {
            if (this._matchedSelectors) return this._matchedSelectors;

            this._matchedSelectors = this._selectors.filter(function (element, index) {
                return this._matchedSelectorIndices.includes(index);
            }, this);

            return this._matchedSelectors;
        }
    }, {
        key: "matchedSelectorText",
        get: function get() {
            if ("_matchedSelectorText" in this) return this._matchedSelectorText;

            this._matchedSelectorText = this.matchedSelectors.map(function (x) {
                return x.text;
            }).join(", ");

            return this._matchedSelectorText;
        }
    }, {
        key: "style",
        get: function get() {
            return this._style;
        }
    }, {
        key: "mediaList",
        get: function get() {
            return this._mediaList;
        }
    }, {
        key: "mediaText",
        get: function get() {
            if (!this._mediaList.length) return;

            var mediaText = "";
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._mediaList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var media = _step2.value;

                    mediaText += media.text;
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

            return mediaText;
        }
    }, {
        key: "mostSpecificSelector",
        get: function get() {
            if (!this._mostSpecificSelector) this._mostSpecificSelector = this._determineMostSpecificSelector();

            return this._mostSpecificSelector;
        }
    }, {
        key: "nodeStyles",
        get: function get() {
            return this._nodeStyles;
        }
    }]);

    return CSSRule;
})(WebInspector.Object);

WebInspector.CSSRule.Event = {
    Changed: "css-rule-changed",
    SelectorChanged: "css-rule-invalid-selector"
};
