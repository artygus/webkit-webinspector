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

WebInspector.SourceMap = (function (_WebInspector$Object) {
    _inherits(SourceMap, _WebInspector$Object);

    function SourceMap(sourceMappingURL, payload, originalSourceCode) {
        _classCallCheck(this, SourceMap);

        _get(Object.getPrototypeOf(SourceMap.prototype), "constructor", this).call(this);

        if (!WebInspector.SourceMap._base64Map) {
            var base64Digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            WebInspector.SourceMap._base64Map = {};
            for (var i = 0; i < base64Digits.length; ++i) WebInspector.SourceMap._base64Map[base64Digits.charAt(i)] = i;
        }

        this._originalSourceCode = originalSourceCode || null;
        this._sourceMapResources = {};
        this._sourceMapResourcesList = [];

        this._sourceMappingURL = sourceMappingURL;
        this._reverseMappingsBySourceURL = {};
        this._mappings = [];
        this._sources = {};
        this._sourceRoot = null;
        this._sourceContentByURL = {};
        this._parseMappingPayload(payload);
    }

    // Public

    _createClass(SourceMap, [{
        key: "addResource",
        value: function addResource(resource) {
            console.assert(!(resource.url in this._sourceMapResources));
            this._sourceMapResources[resource.url] = resource;
            this._sourceMapResourcesList.push(resource);
        }
    }, {
        key: "resourceForURL",
        value: function resourceForURL(url) {
            return this._sourceMapResources[url];
        }
    }, {
        key: "sources",
        value: function sources() {
            return Object.keys(this._sources);
        }
    }, {
        key: "sourceContent",
        value: function sourceContent(sourceURL) {
            return this._sourceContentByURL[sourceURL];
        }
    }, {
        key: "_parseMappingPayload",
        value: function _parseMappingPayload(mappingPayload) {
            if (mappingPayload.sections) this._parseSections(mappingPayload.sections);else this._parseMap(mappingPayload, 0, 0);
        }
    }, {
        key: "_parseSections",
        value: function _parseSections(sections) {
            for (var i = 0; i < sections.length; ++i) {
                var section = sections[i];
                this._parseMap(section.map, section.offset.line, section.offset.column);
            }
        }
    }, {
        key: "findEntry",
        value: function findEntry(lineNumber, columnNumber) {
            var first = 0;
            var count = this._mappings.length;
            while (count > 1) {
                var step = count >> 1;
                var middle = first + step;
                var mapping = this._mappings[middle];
                if (lineNumber < mapping[0] || lineNumber === mapping[0] && columnNumber < mapping[1]) count = step;else {
                    first = middle;
                    count -= step;
                }
            }
            var entry = this._mappings[first];
            if (!first && entry && (lineNumber < entry[0] || lineNumber === entry[0] && columnNumber < entry[1])) return null;
            return entry;
        }
    }, {
        key: "findEntryReversed",
        value: function findEntryReversed(sourceURL, lineNumber) {
            var mappings = this._reverseMappingsBySourceURL[sourceURL];
            for (; lineNumber < mappings.length; ++lineNumber) {
                var mapping = mappings[lineNumber];
                if (mapping) return mapping;
            }
            return this._mappings[0];
        }
    }, {
        key: "_parseMap",
        value: function _parseMap(map, lineNumber, columnNumber) {
            var sourceIndex = 0;
            var sourceLineNumber = 0;
            var sourceColumnNumber = 0;
            var nameIndex = 0;

            var sources = [];
            var originalToCanonicalURLMap = {};
            for (var i = 0; i < map.sources.length; ++i) {
                var originalSourceURL = map.sources[i];
                var href = originalSourceURL;
                if (map.sourceRoot && href.charAt(0) !== "/") href = map.sourceRoot.replace(/\/+$/, "") + "/" + href;
                var url = absoluteURL(href, this._sourceMappingURL) || href;
                originalToCanonicalURLMap[originalSourceURL] = url;
                sources.push(url);
                this._sources[url] = true;

                if (map.sourcesContent && map.sourcesContent[i]) this._sourceContentByURL[url] = map.sourcesContent[i];
            }

            this._sourceRoot = map.sourceRoot || null;

            var stringCharIterator = new WebInspector.SourceMap.StringCharIterator(map.mappings);
            var sourceURL = sources[sourceIndex];

            while (true) {
                if (stringCharIterator.peek() === ",") stringCharIterator.next();else {
                    while (stringCharIterator.peek() === ";") {
                        lineNumber += 1;
                        columnNumber = 0;
                        stringCharIterator.next();
                    }
                    if (!stringCharIterator.hasNext()) break;
                }

                columnNumber += this._decodeVLQ(stringCharIterator);
                if (this._isSeparator(stringCharIterator.peek())) {
                    this._mappings.push([lineNumber, columnNumber]);
                    continue;
                }

                var sourceIndexDelta = this._decodeVLQ(stringCharIterator);
                if (sourceIndexDelta) {
                    sourceIndex += sourceIndexDelta;
                    sourceURL = sources[sourceIndex];
                }
                sourceLineNumber += this._decodeVLQ(stringCharIterator);
                sourceColumnNumber += this._decodeVLQ(stringCharIterator);
                if (!this._isSeparator(stringCharIterator.peek())) nameIndex += this._decodeVLQ(stringCharIterator);

                this._mappings.push([lineNumber, columnNumber, sourceURL, sourceLineNumber, sourceColumnNumber]);
            }

            for (var i = 0; i < this._mappings.length; ++i) {
                var mapping = this._mappings[i];
                var url = mapping[2];
                if (!url) continue;
                if (!this._reverseMappingsBySourceURL[url]) this._reverseMappingsBySourceURL[url] = [];
                var reverseMappings = this._reverseMappingsBySourceURL[url];
                var sourceLine = mapping[3];
                if (!reverseMappings[sourceLine]) reverseMappings[sourceLine] = [mapping[0], mapping[1]];
            }
        }
    }, {
        key: "_isSeparator",
        value: function _isSeparator(char) {
            return char === "," || char === ";";
        }
    }, {
        key: "_decodeVLQ",
        value: function _decodeVLQ(stringCharIterator) {
            // Read unsigned value.
            var result = 0;
            var shift = 0;
            do {
                var digit = WebInspector.SourceMap._base64Map[stringCharIterator.next()];
                result += (digit & WebInspector.SourceMap.VLQ_BASE_MASK) << shift;
                shift += WebInspector.SourceMap.VLQ_BASE_SHIFT;
            } while (digit & WebInspector.SourceMap.VLQ_CONTINUATION_MASK);

            // Fix the sign.
            var negative = result & 1;
            result >>= 1;
            return negative ? -result : result;
        }
    }, {
        key: "originalSourceCode",
        get: function get() {
            return this._originalSourceCode;
        }
    }, {
        key: "sourceMappingBasePathURLComponents",
        get: function get() {
            if (this._sourceMappingURLBasePathComponents) return this._sourceMappingURLBasePathComponents;

            if (this._sourceRoot) {
                var baseURLPath = absoluteURL(this._sourceRoot, this._sourceMappingURL);
                console.assert(baseURLPath);
                if (baseURLPath) {
                    var urlComponents = parseURL(baseURLPath);
                    if (!/\/$/.test(urlComponents.path)) urlComponents.path += "/";
                    this._sourceMappingURLBasePathComponents = urlComponents;
                    return this._sourceMappingURLBasePathComponents;
                }
            }

            var urlComponents = parseURL(this._sourceMappingURL);
            urlComponents.path = urlComponents.path.substr(0, urlComponents.path.lastIndexOf(urlComponents.lastPathComponent));
            urlComponents.lastPathComponent = null;
            this._sourceMappingURLBasePathComponents = urlComponents;
            return this._sourceMappingURLBasePathComponents;
        }
    }, {
        key: "resources",
        get: function get() {
            return this._sourceMapResourcesList;
        }
    }]);

    return SourceMap;
})(WebInspector.Object);

WebInspector.SourceMap.VLQ_BASE_SHIFT = 5;
WebInspector.SourceMap.VLQ_BASE_MASK = (1 << 5) - 1;
WebInspector.SourceMap.VLQ_CONTINUATION_MASK = 1 << 5;

WebInspector.SourceMap.StringCharIterator = (function () {
    function StringCharIterator(string) {
        _classCallCheck(this, StringCharIterator);

        this._string = string;
        this._position = 0;
    }

    _createClass(StringCharIterator, [{
        key: "next",
        value: function next() {
            return this._string.charAt(this._position++);
        }
    }, {
        key: "peek",
        value: function peek() {
            return this._string.charAt(this._position);
        }
    }, {
        key: "hasNext",
        value: function hasNext() {
            return this._position < this._string.length;
        }
    }]);

    return StringCharIterator;
})();
