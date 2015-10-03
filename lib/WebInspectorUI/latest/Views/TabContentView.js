var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

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

WebInspector.TabContentView = (function (_WebInspector$ContentView) {
    _inherits(TabContentView, _WebInspector$ContentView);

    function TabContentView(identifier, styleClassNames, tabBarItem, navigationSidebarPanel, detailsSidebarPanels) {
        var _element$classList;

        _classCallCheck(this, TabContentView);

        console.assert(typeof identifier === "string");
        console.assert(typeof styleClassNames === "string" || styleClassNames.every(function (className) {
            return typeof className === "string";
        }));
        console.assert(tabBarItem instanceof WebInspector.TabBarItem);
        console.assert(!navigationSidebarPanel || navigationSidebarPanel instanceof WebInspector.NavigationSidebarPanel);
        console.assert(!detailsSidebarPanels || detailsSidebarPanels.every(function (detailsSidebarPanel) {
            return detailsSidebarPanel instanceof WebInspector.DetailsSidebarPanel;
        }));

        _get(Object.getPrototypeOf(TabContentView.prototype), "constructor", this).call(this, null);

        this.element.classList.add("tab");

        if (typeof styleClassNames === "string") styleClassNames = [styleClassNames];

        (_element$classList = this.element.classList).add.apply(_element$classList, _toConsumableArray(styleClassNames));

        this._identifier = identifier;
        this._tabBarItem = tabBarItem;
        this._navigationSidebarPanel = navigationSidebarPanel || null;
        this._detailsSidebarPanels = detailsSidebarPanels || [];

        this._navigationSidebarCollapsedSetting = new WebInspector.Setting(identifier + "-navigation-sidebar-collapsed", false);

        this._detailsSidebarCollapsedSetting = new WebInspector.Setting(identifier + "-details-sidebar-collapsed", true);
        this._detailsSidebarSelectedPanelSetting = new WebInspector.Setting(identifier + "-details-sidebar-selected-panel", null);

        this._cookieSetting = new WebInspector.Setting(identifier + "-tab-cookie", {});
    }

    // Public

    _createClass(TabContentView, [{
        key: "showDetailsSidebarPanels",
        value: function showDetailsSidebarPanels() {
            // Implemented by subclasses.
        }
    }, {
        key: "showRepresentedObject",
        value: function showRepresentedObject(representedObject, cookie) {
            // Implemented by subclasses.
        }
    }, {
        key: "canShowRepresentedObject",
        value: function canShowRepresentedObject(representedObject) {
            // Implemented by subclasses.
            return false;
        }
    }, {
        key: "shown",
        value: function shown() {
            if (this._shouldRestoreStateWhenShown) this.restoreStateFromCookie(WebInspector.StateRestorationType.Delayed);
        }
    }, {
        key: "restoreStateFromCookie",
        value: function restoreStateFromCookie(restorationType) {
            if (!this.navigationSidebarPanel) return;

            if (!this.visible) {
                this._shouldRestoreStateWhenShown = true;
                return;
            }

            this._shouldRestoreStateWhenShown = false;

            var relaxMatchDelay = 0;
            if (restorationType === WebInspector.StateRestorationType.Load) relaxMatchDelay = 1000;else if (restorationType === WebInspector.StateRestorationType.Navigation) relaxMatchDelay = 2000;

            this.navigationSidebarPanel.restoreStateFromCookie(this._cookieSetting.value || {}, relaxMatchDelay);
        }
    }, {
        key: "saveStateToCookie",
        value: function saveStateToCookie() {
            if (!this.navigationSidebarPanel) return;

            if (this._shouldRestoreStateWhenShown) return;

            var cookie = {};
            this.navigationSidebarPanel.saveStateToCookie(cookie);
            this._cookieSetting.value = cookie;
        }
    }, {
        key: "type",
        get: function get() {
            // Implemented by subclasses.
            return null;
        }
    }, {
        key: "parentTabBrowser",
        get: function get() {
            return this._parentTabBrowser;
        },
        set: function set(tabBrowser) {
            this._parentTabBrowser = tabBrowser || null;
        }
    }, {
        key: "identifier",
        get: function get() {
            return this._identifier;
        }
    }, {
        key: "tabBarItem",
        get: function get() {
            return this._tabBarItem;
        }
    }, {
        key: "managesDetailsSidebarPanels",
        get: function get() {
            // Implemented by subclasses.
            return false;
        }
    }, {
        key: "navigationSidebarPanel",
        get: function get() {
            return this._navigationSidebarPanel;
        }
    }, {
        key: "navigationSidebarCollapsedSetting",
        get: function get() {
            return this._navigationSidebarCollapsedSetting;
        }
    }, {
        key: "detailsSidebarPanels",
        get: function get() {
            return this._detailsSidebarPanels;
        }
    }, {
        key: "detailsSidebarCollapsedSetting",
        get: function get() {
            return this._detailsSidebarCollapsedSetting;
        }
    }, {
        key: "detailsSidebarSelectedPanelSetting",
        get: function get() {
            return this._detailsSidebarSelectedPanelSetting;
        }
    }]);

    return TabContentView;
})(WebInspector.ContentView);
