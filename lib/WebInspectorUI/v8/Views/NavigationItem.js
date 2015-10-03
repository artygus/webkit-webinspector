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

WebInspector.NavigationItem = function (identifier, role, label) {
    WebInspector.Object.call(this);

    this._identifier = identifier || null;

    this._element = document.createElement("div");
    this._hidden = false;

    if (role) this._element.setAttribute("role", role);
    if (label) this._element.setAttribute("aria-label", label);

    var classNames = this._classNames;
    for (var i = 0; i < classNames.length; ++i) this._element.classList.add(classNames[i]);

    this._element.navigationItem = this;
};

WebInspector.NavigationItem.StyleClassName = "item";
WebInspector.NavigationItem.HiddenStyleClassName = "hidden";

WebInspector.NavigationItem.prototype = Object.defineProperties({
    constructor: WebInspector.NavigationItem,

    updateLayout: function updateLayout(expandOnly) {
        // Implemented by subclasses.
    }

}, {
    identifier: { // Public

        get: function get() {
            return this._identifier;
        },
        configurable: true,
        enumerable: true
    },
    element: {
        get: function get() {
            return this._element;
        },
        configurable: true,
        enumerable: true
    },
    parentNavigationBar: {
        get: function get() {
            return this._parentNavigationBar;
        },
        configurable: true,
        enumerable: true
    },
    hidden: {
        get: function get() {
            return this._hidden;
        },
        set: function set(flag) {
            if (this._hidden === flag) return;

            this._hidden = flag;

            if (flag) this._element.classList.add(WebInspector.NavigationItem.HiddenStyleClassName);else this._element.classList.remove(WebInspector.NavigationItem.HiddenStyleClassName);

            if (this._parentNavigationBar) this._parentNavigationBar.updateLayoutSoon();
        },
        configurable: true,
        enumerable: true
    },
    _classNames: {

        // Private

        get: function get() {
            var classNames = [WebInspector.NavigationItem.StyleClassName];
            if (this._identifier) classNames.push(this._identifier);
            if (this._additionalClassNames instanceof Array) classNames = classNames.concat(this._additionalClassNames);
            return classNames;
        },
        configurable: true,
        enumerable: true
    }
});

WebInspector.NavigationItem.prototype.__proto__ = WebInspector.Object.prototype;
