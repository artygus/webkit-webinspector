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

WebInspector.DetailsSectionSimpleRow = (function (_WebInspector$DetailsSectionRow) {
    _inherits(DetailsSectionSimpleRow, _WebInspector$DetailsSectionRow);

    function DetailsSectionSimpleRow(label, value) {
        _classCallCheck(this, DetailsSectionSimpleRow);

        _get(Object.getPrototypeOf(DetailsSectionSimpleRow.prototype), "constructor", this).call(this);

        this.element.classList.add("simple");

        this._labelElement = document.createElement("div");
        this._labelElement.className = "label";
        this.element.appendChild(this._labelElement);

        this._valueElement = document.createElement("div");
        this._valueElement.className = "value";
        this.element.appendChild(this._valueElement);

        // Workaround for <rdar://problem/12668870> Triple-clicking text within a
        // <div> set to "display: table-cell" selects text outside the cell.
        //
        // On triple-click, adjust the selection range to include only the value
        // element if the selection extends WebInspector.beyond it.
        var valueElementClicked = function valueElementClicked(event) {
            event.stopPropagation();

            if (event.detail < 3) return;

            var currentSelection = window.getSelection();
            if (!currentSelection) return;

            var currentRange = currentSelection.getRangeAt(0);
            if (!currentRange || currentRange.startContainer === currentRange.endContainer) return;

            var correctedRange = document.createRange();
            correctedRange.selectNodeContents(event.currentTarget);
            currentSelection.removeAllRanges();
            currentSelection.addRange(correctedRange);
        };
        this._valueElement.addEventListener("click", valueElementClicked);

        this.label = label;
        this.value = value;
    }

    // Public

    _createClass(DetailsSectionSimpleRow, [{
        key: "label",
        get: function get() {
            return this._labelElement.textContent;
        },
        set: function set(label) {
            this._labelElement.textContent = label;
        }
    }, {
        key: "value",
        get: function get() {
            return this._value;
        },
        set: function set(value) {
            this._value = value || "";

            if (this._value) {
                this.element.classList.remove(WebInspector.DetailsSectionSimpleRow.EmptyStyleClassName);

                // If the value has space characters that cause word wrapping then we don't need the data class.
                if (/[\s\u200b]/.test(this._value)) this.element.classList.remove(WebInspector.DetailsSectionSimpleRow.DataStyleClassName);else this.element.classList.add(WebInspector.DetailsSectionSimpleRow.DataStyleClassName);
            } else {
                this.element.classList.add(WebInspector.DetailsSectionSimpleRow.EmptyStyleClassName);
                this.element.classList.remove(WebInspector.DetailsSectionSimpleRow.DataStyleClassName);
            }

            if (value instanceof Node) {
                this._valueElement.removeChildren();
                this._valueElement.appendChild(this._value);
            } else this._valueElement.textContent = this._value;
        }
    }]);

    return DetailsSectionSimpleRow;
})(WebInspector.DetailsSectionRow);

WebInspector.DetailsSectionSimpleRow.DataStyleClassName = "data";
WebInspector.DetailsSectionSimpleRow.EmptyStyleClassName = "empty";
