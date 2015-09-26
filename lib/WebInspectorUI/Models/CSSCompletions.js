var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * Copyright (C) 2010 Nikita Vasilyev. All rights reserved.
 * Copyright (C) 2010 Joseph Pecoraro. All rights reserved.
 * Copyright (C) 2010 Google Inc. All rights reserved.
 * Copyright (C) 2013 Apple Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

WebInspector.CSSCompletions = (function () {
    function CSSCompletions(properties, acceptEmptyPrefix) {
        _classCallCheck(this, CSSCompletions);

        this._values = [];
        this._longhands = {};
        this._shorthands = {};

        // The `properties` parameter can be either a list of objects with 'name' / 'longhand'
        // properties when initialized from the protocol for CSSCompletions.cssNameCompletions.
        // Or it may just a list of strings when quickly initialized for other completion purposes.
        if (properties.length && typeof properties[0] === "string") this._values = this._values.concat(properties);else {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = properties[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var property = _step.value;

                    var propertyName = property.name;
                    console.assert(propertyName);

                    this._values.push(propertyName);

                    var longhands = property.longhands;
                    if (longhands) {
                        this._longhands[propertyName] = longhands;

                        for (var j = 0; j < longhands.length; ++j) {
                            var longhandName = longhands[j];

                            var shorthands = this._shorthands[longhandName];
                            if (!shorthands) {
                                shorthands = [];
                                this._shorthands[longhandName] = shorthands;
                            }

                            shorthands.push(propertyName);
                        }
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
        }

        this._values.sort();

        this._acceptEmptyPrefix = acceptEmptyPrefix;
    }

    // Static

    _createClass(CSSCompletions, [{
        key: "startsWith",
        value: function startsWith(prefix) {
            var firstIndex = this._firstIndexOfPrefix(prefix);
            if (firstIndex === -1) return [];

            var results = [];
            while (firstIndex < this._values.length && this._values[firstIndex].startsWith(prefix)) results.push(this._values[firstIndex++]);
            return results;
        }
    }, {
        key: "firstStartsWith",
        value: function firstStartsWith(prefix) {
            var foundIndex = this._firstIndexOfPrefix(prefix);
            return foundIndex === -1 ? "" : this._values[foundIndex];
        }
    }, {
        key: "_firstIndexOfPrefix",
        value: function _firstIndexOfPrefix(prefix) {
            if (!this._values.length) return -1;
            if (!prefix) return this._acceptEmptyPrefix ? 0 : -1;

            var maxIndex = this._values.length - 1;
            var minIndex = 0;
            var foundIndex;

            do {
                var middleIndex = maxIndex + minIndex >> 1;
                if (this._values[middleIndex].startsWith(prefix)) {
                    foundIndex = middleIndex;
                    break;
                }
                if (this._values[middleIndex] < prefix) minIndex = middleIndex + 1;else maxIndex = middleIndex - 1;
            } while (minIndex <= maxIndex);

            if (foundIndex === undefined) return -1;

            while (foundIndex && this._values[foundIndex - 1].startsWith(prefix)) foundIndex--;

            return foundIndex;
        }
    }, {
        key: "keySet",
        value: function keySet() {
            if (!this._keySet) this._keySet = this._values.keySet();
            return this._keySet;
        }
    }, {
        key: "next",
        value: function next(str, prefix) {
            return this._closest(str, prefix, 1);
        }
    }, {
        key: "previous",
        value: function previous(str, prefix) {
            return this._closest(str, prefix, -1);
        }
    }, {
        key: "_closest",
        value: function _closest(str, prefix, shift) {
            if (!str) return "";

            var index = this._values.indexOf(str);
            if (index === -1) return "";

            if (!prefix) {
                index = (index + this._values.length + shift) % this._values.length;
                return this._values[index];
            }

            var propertiesWithPrefix = this.startsWith(prefix);
            var j = propertiesWithPrefix.indexOf(str);
            j = (j + propertiesWithPrefix.length + shift) % propertiesWithPrefix.length;
            return propertiesWithPrefix[j];
        }
    }, {
        key: "isShorthandPropertyName",
        value: function isShorthandPropertyName(shorthand) {
            return shorthand in this._longhands;
        }
    }, {
        key: "isLonghandPropertyName",
        value: function isLonghandPropertyName(longhand) {
            return longhand in this._shorthands;
        }
    }, {
        key: "longhandsForShorthand",
        value: function longhandsForShorthand(shorthand) {
            return this._longhands[shorthand] || [];
        }
    }, {
        key: "shorthandsForLonghand",
        value: function shorthandsForLonghand(longhand) {
            return this._shorthands[longhand] || [];
        }
    }, {
        key: "isValidPropertyName",
        value: function isValidPropertyName(name) {
            return this._values.includes(name);
        }
    }, {
        key: "propertyRequiresWebkitPrefix",
        value: function propertyRequiresWebkitPrefix(name) {
            return this._values.includes("-webkit-" + name) && !this._values.includes(name);
        }
    }, {
        key: "getClosestPropertyName",
        value: function getClosestPropertyName(name) {
            var bestMatches = [{ distance: Infinity, name: null }];

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._values[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var property = _step2.value;

                    var distance = name.levenshteinDistance(property);

                    if (distance < bestMatches[0].distance) bestMatches = [{ distance: distance, name: property }];else if (distance === bestMatches[0].distance) bestMatches.push({ distance: distance, name: property });
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

            return bestMatches.length < 3 ? bestMatches[0].name : false;
        }
    }, {
        key: "values",

        // Public

        get: function get() {
            return this._values;
        }
    }], [{
        key: "requestCSSCompletions",
        value: function requestCSSCompletions() {
            if (WebInspector.CSSCompletions.cssNameCompletions) return;

            function propertyNamesCallback(error, names) {
                if (error) return;

                WebInspector.CSSCompletions.cssNameCompletions = new WebInspector.CSSCompletions(names, false);

                WebInspector.CSSKeywordCompletions.addCustomCompletions(names);

                // CodeMirror is not included by tests so we shouldn't assume it always exists.
                // If it isn't available we skip MIME type associations.
                if (!window.CodeMirror) return;

                var propertyNamesForCodeMirror = {};
                var valueKeywordsForCodeMirror = { "inherit": true, "initial": true };
                var colorKeywordsForCodeMirror = {};

                function nameForCodeMirror(name) {
                    // CodeMirror parses the vendor prefix separate from the property or keyword name,
                    // so we need to strip vendor prefixes from our names. Also strip function parenthesis.
                    return name.replace(/^-[^-]+-/, "").replace(/\(\)$/, "");
                }

                function collectPropertyNameForCodeMirror(propertyName) {
                    // Properties can also be value keywords, like when used in a transition.
                    // So we add them to both lists.
                    var codeMirrorPropertyName = nameForCodeMirror(propertyName);
                    propertyNamesForCodeMirror[codeMirrorPropertyName] = true;
                    valueKeywordsForCodeMirror[codeMirrorPropertyName] = true;
                }

                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = names[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var property = _step3.value;

                        collectPropertyNameForCodeMirror(property.name);
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

                for (var propertyName in WebInspector.CSSKeywordCompletions._propertyKeywordMap) {
                    var keywords = WebInspector.CSSKeywordCompletions._propertyKeywordMap[propertyName];
                    for (var i = 0; i < keywords.length; ++i) {
                        // Skip numbers, like the ones defined for font-weight.
                        if (!isNaN(Number(keywords[i]))) continue;
                        valueKeywordsForCodeMirror[nameForCodeMirror(keywords[i])] = true;
                    }
                }

                WebInspector.CSSKeywordCompletions._colors.forEach(function (colorName) {
                    colorKeywordsForCodeMirror[nameForCodeMirror(colorName)] = true;
                });

                function updateCodeMirrorCSSMode(mimeType) {
                    var modeSpec = CodeMirror.resolveMode(mimeType);

                    console.assert(modeSpec.propertyKeywords);
                    console.assert(modeSpec.valueKeywords);
                    console.assert(modeSpec.colorKeywords);

                    modeSpec.propertyKeywords = propertyNamesForCodeMirror;
                    modeSpec.valueKeywords = valueKeywordsForCodeMirror;
                    modeSpec.colorKeywords = colorKeywordsForCodeMirror;

                    CodeMirror.defineMIME(mimeType, modeSpec);
                }

                updateCodeMirrorCSSMode("text/css");
                updateCodeMirrorCSSMode("text/x-scss");
            }

            function fontFamilyNamesCallback(error, fontFamilyNames) {
                if (error) return;

                WebInspector.CSSKeywordCompletions.addPropertyCompletionValues("font-family", fontFamilyNames);
                WebInspector.CSSKeywordCompletions.addPropertyCompletionValues("font", fontFamilyNames);
            }

            if (window.CSSAgent) {
                CSSAgent.getSupportedCSSProperties(propertyNamesCallback);

                // COMPATIBILITY (iOS 9): CSS.getSupportedSystemFontFamilyNames did not exist.
                if (CSSAgent.getSupportedSystemFontFamilyNames) CSSAgent.getSupportedSystemFontFamilyNames(fontFamilyNamesCallback);
            }
        }
    }]);

    return CSSCompletions;
})();

WebInspector.CSSCompletions.cssNameCompletions = null;
