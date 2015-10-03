var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 *  Copyright (C) 2013 University of Washington. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

WebInspector.BackForwardEntry = (function (_WebInspector$Object) {
    _inherits(BackForwardEntry, _WebInspector$Object);

    function BackForwardEntry(contentView, cookie) {
        _classCallCheck(this, BackForwardEntry);

        _get(Object.getPrototypeOf(BackForwardEntry.prototype), "constructor", this).call(this);

        this._contentView = contentView;

        // Cookies are compared with Object.shallowEqual, so should not store objects or arrays.
        this._cookie = cookie || {};
        this._scrollPositions = [];

        contentView.saveToCookie(this._cookie);
    }

    // Public

    _createClass(BackForwardEntry, [{
        key: "prepareToShow",
        value: function prepareToShow(shouldCallShown) {
            this._restoreFromCookie();

            this.contentView.visible = true;
            if (shouldCallShown) this.contentView.shown();
            this.contentView.updateLayout();
        }
    }, {
        key: "prepareToHide",
        value: function prepareToHide() {
            this.contentView.visible = false;
            this.contentView.hidden();

            this._saveScrollPositions();
        }

        // Private

    }, {
        key: "_restoreFromCookie",
        value: function _restoreFromCookie() {
            this._restoreScrollPositions();
            this.contentView.restoreFromCookie(this.cookie);
        }
    }, {
        key: "_restoreScrollPositions",
        value: function _restoreScrollPositions() {
            // If no scroll positions are saved, do nothing.
            if (!this._scrollPositions.length) return;

            var scrollableElements = this.contentView.scrollableElements || [];
            console.assert(this._scrollPositions.length === scrollableElements.length);

            for (var i = 0; i < scrollableElements.length; ++i) {
                var position = this._scrollPositions[i];
                var element = scrollableElements[i];
                if (!element) continue;

                // Restore the top scroll position by either scrolling to the bottom or to the saved position.
                element.scrollTop = position.isScrolledToBottom ? element.scrollHeight : position.scrollTop;

                // Don't restore the left scroll position when scrolled to the bottom. This way the when content changes
                // the user won't be left in a weird horizontal position.
                element.scrollLeft = position.isScrolledToBottom ? 0 : position.scrollLeft;
            }
        }
    }, {
        key: "_saveScrollPositions",
        value: function _saveScrollPositions() {
            var scrollableElements = this.contentView.scrollableElements || [];
            var scrollPositions = [];
            for (var i = 0; i < scrollableElements.length; ++i) {
                var element = scrollableElements[i];
                if (!element) continue;

                var position = { scrollTop: element.scrollTop, scrollLeft: element.scrollLeft };
                if (this.contentView.shouldKeepElementsScrolledToBottom) position.isScrolledToBottom = element.isScrolledToBottom();

                scrollPositions.push(position);
            }

            this._scrollPositions = scrollPositions;
        }
    }, {
        key: "contentView",
        get: function get() {
            return this._contentView;
        }
    }, {
        key: "cookie",
        get: function get() {
            // Cookies are immutable; they represent a specific navigation action.
            return Object.shallowCopy(this._cookie);
        }
    }]);

    return BackForwardEntry;
})(WebInspector.Object);
