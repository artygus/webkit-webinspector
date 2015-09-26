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

WebInspector.NavigationItem = (function (_WebInspector$Object) {
    _inherits(NavigationItem, _WebInspector$Object);

    function NavigationItem(identifier, role, label) {
        var _element$classList;

        _classCallCheck(this, NavigationItem);

        _get(Object.getPrototypeOf(NavigationItem.prototype), "constructor", this).call(this);

        this._identifier = identifier || null;

        this._element = document.createElement("div");
        this._hidden = false;

        if (role) this._element.setAttribute("role", role);
        if (label) this._element.setAttribute("aria-label", label);

        (_element$classList = this._element.classList).add.apply(_element$classList, _toConsumableArray(this._classNames));
        this._element.navigationItem = this;
    }

    // Public

    _createClass(NavigationItem, [{
        key: "updateLayout",
        value: function updateLayout(expandOnly) {
            // Implemented by subclasses.
        }
    }, {
        key: "identifier",
        get: function get() {
            return this._identifier;
        }
    }, {
        key: "element",
        get: function get() {
            return this._element;
        }
    }, {
        key: "parentNavigationBar",
        get: function get() {
            return this._parentNavigationBar;
        }
    }, {
        key: "hidden",
        get: function get() {
            return this._hidden;
        },
        set: function set(flag) {
            if (this._hidden === flag) return;

            this._hidden = flag;

            this._element.classList.toggle("hidden", flag);

            if (this._parentNavigationBar) this._parentNavigationBar.updateLayoutSoon();
        }

        // Private

    }, {
        key: "_classNames",
        get: function get() {
            var classNames = ["item"];
            if (this._identifier) classNames.push(this._identifier);
            if (this.additionalClassNames instanceof Array) classNames = classNames.concat(this.additionalClassNames);
            return classNames;
        }
    }]);

    return NavigationItem;
})(WebInspector.Object);
