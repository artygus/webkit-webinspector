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

WebInspector.CompletionSuggestionsView = (function (_WebInspector$Object) {
    _inherits(CompletionSuggestionsView, _WebInspector$Object);

    function CompletionSuggestionsView(delegate) {
        _classCallCheck(this, CompletionSuggestionsView);

        _get(Object.getPrototypeOf(CompletionSuggestionsView.prototype), "constructor", this).call(this);

        this._delegate = delegate || null;

        this._selectedIndex = NaN;

        this._element = document.createElement("div");
        this._element.classList.add("completion-suggestions", WebInspector.Popover.IgnoreAutoDismissClassName);

        this._containerElement = document.createElement("div");
        this._containerElement.classList.add("completion-suggestions-container");
        this._containerElement.addEventListener("mousedown", this._mouseDown.bind(this));
        this._containerElement.addEventListener("mouseup", this._mouseUp.bind(this));
        this._containerElement.addEventListener("click", this._itemClicked.bind(this));
        this._element.appendChild(this._containerElement);
    }

    // Public

    _createClass(CompletionSuggestionsView, [{
        key: "selectNext",
        value: function selectNext() {
            var count = this._containerElement.children.length;

            if (isNaN(this._selectedIndex) || this._selectedIndex === count - 1) this.selectedIndex = 0;else ++this.selectedIndex;

            var selectedItemElement = this._selectedItemElement;
            if (selectedItemElement && this._delegate && typeof this._delegate.completionSuggestionsSelectedCompletion === "function") this._delegate.completionSuggestionsSelectedCompletion(this, selectedItemElement.textContent);
        }
    }, {
        key: "selectPrevious",
        value: function selectPrevious() {
            if (isNaN(this._selectedIndex) || this._selectedIndex === 0) this.selectedIndex = this._containerElement.children.length - 1;else --this.selectedIndex;

            var selectedItemElement = this._selectedItemElement;
            if (selectedItemElement && this._delegate && typeof this._delegate.completionSuggestionsSelectedCompletion === "function") this._delegate.completionSuggestionsSelectedCompletion(this, selectedItemElement.textContent);
        }
    }, {
        key: "isHandlingClickEvent",
        value: function isHandlingClickEvent() {
            return this._mouseIsDown;
        }
    }, {
        key: "show",
        value: function show(anchorBounds) {
            // Measure the container so we can know the intrinsic size of the items.
            this._containerElement.style.position = "absolute";
            document.body.appendChild(this._containerElement);

            var containerWidth = this._containerElement.offsetWidth;
            var containerHeight = this._containerElement.offsetHeight;

            this._containerElement.removeAttribute("style");
            this._element.appendChild(this._containerElement);

            // Lay out the suggest-box relative to the anchorBounds.
            var margin = 10;
            var horizontalPadding = 22;
            var absoluteMaximumHeight = 160;

            var x = anchorBounds.origin.x;
            var y = anchorBounds.origin.y + anchorBounds.size.height;

            var maximumWidth = window.innerWidth - anchorBounds.origin.x - margin;
            var width = Math.min(containerWidth, maximumWidth - horizontalPadding) + horizontalPadding;
            var paddedWidth = containerWidth + horizontalPadding;

            if (width < paddedWidth) {
                // Shift the suggest box to the left to accommodate the content without trimming to the BODY edge.
                maximumWidth = window.innerWidth - margin;
                width = Math.min(containerWidth, maximumWidth - horizontalPadding) + horizontalPadding;
                x = document.body.offsetWidth - width;
            }

            var aboveHeight = anchorBounds.origin.y;
            var underHeight = window.innerHeight - anchorBounds.origin.y - anchorBounds.size.height;
            var maximumHeight = Math.min(absoluteMaximumHeight, Math.max(underHeight, aboveHeight) - margin);
            var height = Math.min(containerHeight, maximumHeight);

            // Position the suggestions below the anchor. If there is no room, position the suggestions above.
            if (underHeight - height < 0) y = aboveHeight - height;

            this._element.style.left = x + "px";
            this._element.style.top = y + "px";
            this._element.style.width = width + "px";
            this._element.style.height = height + "px";

            document.body.appendChild(this._element);
        }
    }, {
        key: "hide",
        value: function hide() {
            this._element.remove();
        }
    }, {
        key: "update",
        value: function update(completions, selectedIndex) {
            this._containerElement.removeChildren();

            if (typeof selectedIndex === "number") this._selectedIndex = selectedIndex;

            for (var i = 0; i < completions.length; ++i) {
                var itemElement = document.createElement("div");
                itemElement.className = WebInspector.CompletionSuggestionsView.ItemElementStyleClassName;
                itemElement.textContent = completions[i];
                if (i === this._selectedIndex) itemElement.classList.add(WebInspector.CompletionSuggestionsView.SelectedItemStyleClassName);
                this._containerElement.appendChild(itemElement);

                if (this._delegate && typeof this._delegate.completionSuggestionsViewCustomizeCompletionElement === "function") this._delegate.completionSuggestionsViewCustomizeCompletionElement(this, itemElement, completions[i]);
            }
        }

        // Private

    }, {
        key: "_mouseDown",
        value: function _mouseDown(event) {
            if (event.button !== 0) return;
            this._mouseIsDown = true;
        }
    }, {
        key: "_mouseUp",
        value: function _mouseUp(event) {
            if (event.button !== 0) return;
            this._mouseIsDown = false;
        }
    }, {
        key: "_itemClicked",
        value: function _itemClicked(event) {
            if (event.button !== 0) return;

            var itemElement = event.target.enclosingNodeOrSelfWithClass(WebInspector.CompletionSuggestionsView.ItemElementStyleClassName);
            console.assert(itemElement);
            if (!itemElement) return;

            if (this._delegate && typeof this._delegate.completionSuggestionsClickedCompletion === "function") this._delegate.completionSuggestionsClickedCompletion(this, itemElement.textContent);
        }
    }, {
        key: "delegate",
        get: function get() {
            return this._delegate;
        }
    }, {
        key: "visible",
        get: function get() {
            return !!this._element.parentNode;
        }
    }, {
        key: "selectedIndex",
        get: function get() {
            return this._selectedIndex;
        },
        set: function set(index) {
            var selectedItemElement = this._selectedItemElement;
            if (selectedItemElement) selectedItemElement.classList.remove(WebInspector.CompletionSuggestionsView.SelectedItemStyleClassName);

            this._selectedIndex = index;

            selectedItemElement = this._selectedItemElement;
            if (!selectedItemElement) return;

            selectedItemElement.classList.add(WebInspector.CompletionSuggestionsView.SelectedItemStyleClassName);
            selectedItemElement.scrollIntoViewIfNeeded(false);
        }
    }, {
        key: "_selectedItemElement",
        get: function get() {
            if (isNaN(this._selectedIndex)) return null;

            var element = this._containerElement.children[this._selectedIndex] || null;
            console.assert(element);
            return element;
        }
    }]);

    return CompletionSuggestionsView;
})(WebInspector.Object);

WebInspector.CompletionSuggestionsView.ItemElementStyleClassName = "item";
WebInspector.CompletionSuggestionsView.SelectedItemStyleClassName = "selected";
