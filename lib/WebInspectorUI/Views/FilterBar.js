var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

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

WebInspector.FilterBar = (function (_WebInspector$Object) {
    _inherits(FilterBar, _WebInspector$Object);

    function FilterBar(element) {
        _classCallCheck(this, FilterBar);

        _get(Object.getPrototypeOf(FilterBar.prototype), "constructor", this).call(this);

        this._element = element || document.createElement("div");
        this._element.classList.add("filter-bar");

        this._filtersNavigationBar = new WebInspector.NavigationBar();
        this._element.appendChild(this._filtersNavigationBar.element);

        this._filterFunctionsMap = new Map();

        this._inputField = document.createElement("input");
        this._inputField.type = "search";
        this._inputField.spellcheck = false;
        this._inputField.incremental = true;
        this._inputField.addEventListener("search", this._handleFilterChanged.bind(this), false);
        this._element.appendChild(this._inputField);

        this._lastFilterValue = this.filters;
    }

    // Public

    _createClass(FilterBar, [{
        key: "addFilterBarButton",
        value: function addFilterBarButton(identifier, filterFunction, activatedByDefault, defaultToolTip, activatedToolTip, image, imageWidth, imageHeight, suppressEmboss) {
            var filterBarButton = new WebInspector.FilterBarButton(identifier, filterFunction, activatedByDefault, defaultToolTip, activatedToolTip, image, imageWidth, imageHeight, suppressEmboss);
            filterBarButton.addEventListener(WebInspector.ButtonNavigationItem.Event.Clicked, this._handleFilterBarButtonClicked, this);
            filterBarButton.addEventListener(WebInspector.FilterBarButton.Event.ActivatedStateToggled, this._handleFilterButtonToggled, this);
            this._filtersNavigationBar.addNavigationItem(filterBarButton);
            if (filterBarButton.activated) {
                this._filterFunctionsMap.set(filterBarButton.identifier, filterBarButton.filterFunction);
                this._handleFilterChanged();
            }
        }
    }, {
        key: "hasActiveFilters",
        value: function hasActiveFilters() {
            return !!this._inputField.value || !!this._filterFunctionsMap.size;
        }
    }, {
        key: "hasFilterChanged",
        value: function hasFilterChanged() {
            var currentFunctions = this.filters.functions;

            if (this._lastFilterValue.text !== this._inputField.value || this._lastFilterValue.functions.length !== currentFunctions.length) return true;

            for (var i = 0; i < currentFunctions.length; ++i) {
                if (this._lastFilterValue.functions[i] !== currentFunctions[i]) return true;
            }

            return false;
        }

        // Private

    }, {
        key: "_handleFilterBarButtonClicked",
        value: function _handleFilterBarButtonClicked(event) {
            var filterBarButton = event.target;
            filterBarButton.toggle();
        }
    }, {
        key: "_handleFilterButtonToggled",
        value: function _handleFilterButtonToggled(event) {
            var filterBarButton = event.target;
            if (filterBarButton.activated) this._filterFunctionsMap.set(filterBarButton.identifier, filterBarButton.filterFunction);else this._filterFunctionsMap["delete"](filterBarButton.identifier);
            this._handleFilterChanged();
        }
    }, {
        key: "_handleFilterChanged",
        value: function _handleFilterChanged() {
            if (this.hasFilterChanged()) {
                this._lastFilterValue = this.filters;
                this.dispatchEventToListeners(WebInspector.FilterBar.Event.FilterDidChange);
            }
        }
    }, {
        key: "element",
        get: function get() {
            return this._element;
        }
    }, {
        key: "placeholder",
        get: function get() {
            return this._inputField.getAttribute("placeholder");
        },
        set: function set(text) {
            this._inputField.setAttribute("placeholder", text);
        }
    }, {
        key: "inputField",
        get: function get() {
            return this._inputField;
        }
    }, {
        key: "filters",
        get: function get() {
            return { text: this._inputField.value, functions: [].concat(_toConsumableArray(this._filterFunctionsMap.values())) };
        },
        set: function set(filters) {
            filters = filters || {};

            var oldTextValue = this._inputField.value;
            this._inputField.value = filters.text || "";
            if (oldTextValue !== this._inputField.value) this._handleFilterChanged();
        }
    }]);

    return FilterBar;
})(WebInspector.Object);

WebInspector.FilterBar.Event = {
    FilterDidChange: "filter-bar-text-filter-did-change"
};
