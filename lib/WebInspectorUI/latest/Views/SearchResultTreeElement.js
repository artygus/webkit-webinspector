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

WebInspector.SearchResultTreeElement = (function (_WebInspector$GeneralTreeElement) {
    _inherits(SearchResultTreeElement, _WebInspector$GeneralTreeElement);

    function SearchResultTreeElement(representedObject) {
        _classCallCheck(this, SearchResultTreeElement);

        console.assert(representedObject instanceof WebInspector.DOMSearchMatchObject || representedObject instanceof WebInspector.SourceCodeSearchMatchObject);

        var title = WebInspector.SearchResultTreeElement.truncateAndHighlightTitle(representedObject.title, representedObject.searchTerm, representedObject.sourceCodeTextRange);

        _get(Object.getPrototypeOf(SearchResultTreeElement.prototype), "constructor", this).call(this, representedObject.className, title, null, representedObject, false);

        this.small = true;
    }

    // Static

    _createClass(SearchResultTreeElement, [{
        key: "filterableData",

        // Public

        get: function get() {
            return { text: this.representedObject.title };
        }
    }], [{
        key: "truncateAndHighlightTitle",
        value: function truncateAndHighlightTitle(title, searchTerm, sourceCodeTextRange) {
            // Use the original location, since those line/column offsets match the line text in title.
            var textRange = sourceCodeTextRange.textRange;

            var searchTermIndex = textRange.startColumn;

            // We should only have one line text ranges, so make sure that is the case.
            console.assert(textRange.startLine === textRange.endLine);

            // Show some characters before the matching text (if there are enough) for context. TreeOutline takes care of the truncating
            // at the end of the string.
            var modifiedTitle = null;
            if (searchTermIndex > WebInspector.SearchResultTreeElement.CharactersToShowBeforeSearchMatch) {
                modifiedTitle = "…" + title.substring(searchTermIndex - WebInspector.SearchResultTreeElement.CharactersToShowBeforeSearchMatch);
                searchTermIndex = WebInspector.SearchResultTreeElement.CharactersToShowBeforeSearchMatch + 1;
            } else modifiedTitle = title;

            // Truncate the tail of the title so the tooltip isn't so large.
            modifiedTitle = modifiedTitle.trimEnd(searchTermIndex + searchTerm.length + WebInspector.SearchResultTreeElement.CharactersToShowAfterSearchMatch);

            console.assert(modifiedTitle.substring(searchTermIndex, searchTermIndex + searchTerm.length).toLowerCase() === searchTerm.toLowerCase());

            var highlightedTitle = document.createDocumentFragment();

            highlightedTitle.append(modifiedTitle.substring(0, searchTermIndex));

            var highlightSpan = document.createElement("span");
            highlightSpan.className = "highlighted";
            highlightSpan.append(modifiedTitle.substring(searchTermIndex, searchTermIndex + searchTerm.length));
            highlightedTitle.appendChild(highlightSpan);

            highlightedTitle.append(modifiedTitle.substring(searchTermIndex + searchTerm.length));

            return highlightedTitle;
        }
    }]);

    return SearchResultTreeElement;
})(WebInspector.GeneralTreeElement);

WebInspector.SearchResultTreeElement.CharactersToShowBeforeSearchMatch = 15;
WebInspector.SearchResultTreeElement.CharactersToShowAfterSearchMatch = 50;
