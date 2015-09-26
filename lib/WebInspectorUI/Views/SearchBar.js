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

WebInspector.SearchBar = (function (_WebInspector$NavigationItem) {
    _inherits(SearchBar, _WebInspector$NavigationItem);

    function SearchBar(identifier, placeholder, delegate, suppressIncremental) {
        _classCallCheck(this, SearchBar);

        _get(Object.getPrototypeOf(SearchBar.prototype), "constructor", this).call(this, identifier);

        this.delegate = delegate;

        this._element.classList.add("search-bar");

        this._keyboardShortcutEsc = new WebInspector.KeyboardShortcut(null, WebInspector.KeyboardShortcut.Key.Escape);
        this._keyboardShortcutEnter = new WebInspector.KeyboardShortcut(null, WebInspector.KeyboardShortcut.Key.Enter);

        this._searchInput = this._element.appendChild(document.createElement("input"));
        this._searchInput.type = "search";
        this._searchInput.spellcheck = false;
        this._searchInput.incremental = !suppressIncremental;
        this._searchInput.setAttribute("results", 5);
        this._searchInput.setAttribute("autosave", identifier + "-autosave");
        this._searchInput.setAttribute("placeholder", placeholder);
        this._searchInput.addEventListener("search", this._handleSearchEvent.bind(this));
        this._searchInput.addEventListener("keydown", this._handleKeydownEvent.bind(this));
    }

    // Public

    _createClass(SearchBar, [{
        key: "focus",
        value: function focus() {
            this._searchInput.focus();
            this._searchInput.select();
        }

        // Private

    }, {
        key: "_handleSearchEvent",
        value: function _handleSearchEvent(event) {
            this.dispatchEventToListeners(WebInspector.SearchBar.Event.TextChanged);
        }
    }, {
        key: "_handleKeydownEvent",
        value: function _handleKeydownEvent(event) {
            if (this._keyboardShortcutEsc.matchesEvent(event)) {
                if (this.delegate && typeof this.delegate.searchBarWantsToLoseFocus === "function") {
                    this.delegate.searchBarWantsToLoseFocus(this);
                    event.stopPropagation();
                    event.preventDefault();
                }
            } else if (this._keyboardShortcutEnter.matchesEvent(event)) {
                if (this.delegate && typeof this.delegate.searchBarDidActivate === "function") {
                    this.delegate.searchBarDidActivate(this);
                    event.stopPropagation();
                    event.preventDefault();
                }
            }
        }
    }, {
        key: "text",
        get: function get() {
            return this._searchInput.value;
        },
        set: function set(newText) {
            this._searchInput.value = newText;
        }
    }]);

    return SearchBar;
})(WebInspector.NavigationItem);

WebInspector.SearchBar.Event = {
    TextChanged: "searchbar-text-did-change"
};
