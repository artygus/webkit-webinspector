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

WebInspector.SidebarPanel = function (identifier, displayName, showToolTip, hideToolTip, image, element, role, label) {
    WebInspector.Object.call(this);

    this._identifier = identifier;

    this._toolbarItem = new WebInspector.ActivateButtonToolbarItem(identifier, showToolTip, hideToolTip, displayName, image, null, "tab");
    this._toolbarItem.addEventListener(WebInspector.ButtonNavigationItem.Event.Clicked, this.toggle, this);
    this._toolbarItem.enabled = false;

    this._element = element || document.createElement("div");
    this._element.classList.add(WebInspector.SidebarPanel.StyleClassName);
    this._element.classList.add(identifier);

    this._element.setAttribute("role", role || "group");
    this._element.setAttribute("aria-label", label || displayName);
};

WebInspector.SidebarPanel.StyleClassName = "panel";
WebInspector.SidebarPanel.SelectedStyleClassName = "selected";

WebInspector.SidebarPanel.prototype = Object.defineProperties({
    constructor: WebInspector.SidebarPanel,

    show: function show() {
        if (!this._parentSidebar) return;

        this._parentSidebar.collapsed = false;
        this._parentSidebar.selectedSidebarPanel = this;
    },

    hide: function hide() {
        if (!this._parentSidebar) return;

        this._parentSidebar.collapsed = true;
        this._parentSidebar.selectedSidebarPanel = null;
    },

    toggle: function toggle() {
        if (this.visible) this.hide();else this.show();
    },

    added: function added() {
        console.assert(this._parentSidebar);
        this._toolbarItem.enabled = true;
        this._toolbarItem.activated = this.visible;
    },

    removed: function removed() {
        console.assert(!this._parentSidebar);
        this._toolbarItem.enabled = false;
        this._toolbarItem.activated = false;
    },

    willRemove: function willRemove() {
        // Implemented by subclasses.
    },

    shown: function shown() {
        // Implemented by subclasses.
    },

    hidden: function hidden() {
        // Implemented by subclasses.
    },

    widthDidChange: function widthDidChange() {
        // Implemented by subclasses.
    },

    visibilityDidChange: function visibilityDidChange() {
        this._toolbarItem.activated = this.visible;
    }
}, {
    identifier: { // Public

        get: function get() {
            return this._identifier;
        },
        configurable: true,
        enumerable: true
    },
    toolbarItem: {
        get: function get() {
            return this._toolbarItem;
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
    visible: {
        get: function get() {
            return this.selected && this._parentSidebar && !this._parentSidebar.collapsed;
        },
        configurable: true,
        enumerable: true
    },
    selected: {
        get: function get() {
            return this._element.classList.contains(WebInspector.SidebarPanel.SelectedStyleClassName);
        },
        set: function set(flag) {
            if (flag) this._element.classList.add(WebInspector.SidebarPanel.SelectedStyleClassName);else this._element.classList.remove(WebInspector.SidebarPanel.SelectedStyleClassName);
        },
        configurable: true,
        enumerable: true
    },
    parentSidebar: {
        get: function get() {
            return this._parentSidebar;
        },
        configurable: true,
        enumerable: true
    }
});

WebInspector.SidebarPanel.prototype.__proto__ = WebInspector.Object.prototype;
