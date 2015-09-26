var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2015 Apple Inc. All rights reserved.
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

WebInspector.VisualStyleKeywordIconList = (function (_WebInspector$VisualStylePropertyEditor) {
    _inherits(VisualStyleKeywordIconList, _WebInspector$VisualStylePropertyEditor);

    function VisualStyleKeywordIconList(propertyNames, text, possibleValues, layoutReversed) {
        _classCallCheck(this, VisualStyleKeywordIconList);

        _get(Object.getPrototypeOf(VisualStyleKeywordIconList.prototype), "constructor", this).call(this, propertyNames, text, possibleValues, null, "keyword-icon-list", layoutReversed);

        this._iconListContainer = document.createElement("div");
        this._iconListContainer.classList.add("keyword-icon-list-container");

        this._iconElements = [];
        this._computedIcon = null;
        this._selectedIcon = null;

        function dashToCapital(match) {
            return match[1].toUpperCase();
        }

        var prettyPropertyReferenceName = this._propertyReferenceName.capitalize().replace(/(-.)/g, dashToCapital);

        function createListItem(value, title) {
            var iconButtonElement = document.createElement("button");
            iconButtonElement.id = value;
            iconButtonElement.title = title;
            iconButtonElement.classList.add("keyword-icon");
            iconButtonElement.addEventListener("click", this._handleKeywordChanged.bind(this));

            var imageName = value === "none" ? "VisualStyleNone" : prettyPropertyReferenceName + title.replace(/\s/g, "");
            wrappedSVGDocument("Images/" + imageName + ".svg", null, null, (function (wrapper) {
                iconButtonElement.appendChild(wrapper);
            }).bind(this));

            return iconButtonElement;
        }

        for (var key in this._possibleValues.basic) {
            var iconElement = createListItem.call(this, key, this._possibleValues.basic[key]);
            this._iconListContainer.appendChild(iconElement);
            this._iconElements.push(iconElement);
        }

        this.contentElement.appendChild(this._iconListContainer);
    }

    // Public

    _createClass(VisualStyleKeywordIconList, [{
        key: "_handleKeywordChanged",

        // Private

        value: function _handleKeywordChanged(event) {
            this._updatedValues.propertyMissing = false;
            this.value = event.target.id;
            this._valueDidChange();
        }
    }, {
        key: "value",
        get: function get() {
            if (!this._selectedIcon) return null;

            return this._selectedIcon.id;
        },
        set: function set(value) {
            this._computedIcon = null;
            this._selectedIcon = null;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._iconElements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var icon = _step.value;

                    if (icon.id === this._updatedValues.placeholder) this._computedIcon = icon;

                    if (icon.id === value && !this._updatedValues.propertyMissing) this._selectedIcon = icon;else icon.classList.remove("selected", "computed");
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

            if (!this._computedIcon) this._computedIcon = this._iconElements[0];

            var iconIsSelected = this._selectedIcon && this._selectedIcon.classList.toggle("selected");
            if (!iconIsSelected) {
                this._selectedIcon = null;
                this._updatedValues.propertyMissing = true;
                this._computedIcon.classList.add("computed");
            }
        }
    }, {
        key: "synthesizedValue",
        get: function get() {
            return this.value;
        }
    }]);

    return VisualStyleKeywordIconList;
})(WebInspector.VisualStylePropertyEditor);
