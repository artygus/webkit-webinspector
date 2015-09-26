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

WebInspector.TabBrowser = (function (_WebInspector$Object) {
    _inherits(TabBrowser, _WebInspector$Object);

    function TabBrowser(element, tabBar, navigationSidebar, detailsSidebar) {
        _classCallCheck(this, TabBrowser);

        _get(Object.getPrototypeOf(TabBrowser.prototype), "constructor", this).call(this);

        this._element = element || document.createElement("div");
        this._element.classList.add("tab-browser");

        this._tabBar = tabBar || new WebInspector.TabBar();
        if (!tabBar) this._element.appendChild(this._tabBar.element);

        this._navigationSidebar = navigationSidebar || null;
        this._detailsSidebar = detailsSidebar || null;

        if (this._navigationSidebar) this._navigationSidebar.addEventListener(WebInspector.Sidebar.Event.CollapsedStateDidChange, this._sidebarCollapsedStateDidChange, this);

        if (this._detailsSidebar) {
            this._detailsSidebar.addEventListener(WebInspector.Sidebar.Event.CollapsedStateDidChange, this._sidebarCollapsedStateDidChange, this);
            this._detailsSidebar.addEventListener(WebInspector.Sidebar.Event.SidebarPanelSelected, this._sidebarPanelSelected, this);
        }

        this._contentViewContainer = new WebInspector.ContentViewContainer();
        this._element.appendChild(this._contentViewContainer.element);

        var showNextTab = this._showNextTab.bind(this);
        var showPreviousTab = this._showPreviousTab.bind(this);

        this._showNextTabKeyboardShortcut1 = new WebInspector.KeyboardShortcut(WebInspector.KeyboardShortcut.Modifier.CommandOrControl | WebInspector.KeyboardShortcut.Modifier.Shift, WebInspector.KeyboardShortcut.Key.RightCurlyBrace, showNextTab);
        this._showPreviousTabKeyboardShortcut1 = new WebInspector.KeyboardShortcut(WebInspector.KeyboardShortcut.Modifier.CommandOrControl | WebInspector.KeyboardShortcut.Modifier.Shift, WebInspector.KeyboardShortcut.Key.LeftCurlyBrace, showPreviousTab);
        this._showNextTabKeyboardShortcut2 = new WebInspector.KeyboardShortcut(WebInspector.KeyboardShortcut.Modifier.Control, WebInspector.KeyboardShortcut.Key.Tab, showNextTab);
        this._showPreviousTabKeyboardShortcut2 = new WebInspector.KeyboardShortcut(WebInspector.KeyboardShortcut.Modifier.Control | WebInspector.KeyboardShortcut.Modifier.Shift, WebInspector.KeyboardShortcut.Key.Tab, showPreviousTab);

        this._showNextTabKeyboardShortcut3 = new WebInspector.KeyboardShortcut(WebInspector.KeyboardShortcut.Modifier.CommandOrControl | WebInspector.KeyboardShortcut.Modifier.Shift, WebInspector.KeyboardShortcut.Key.Right, this._showNextTabCheckingForEditableField.bind(this));
        this._showNextTabKeyboardShortcut3.implicitlyPreventsDefault = false;
        this._showPreviousTabKeyboardShortcut3 = new WebInspector.KeyboardShortcut(WebInspector.KeyboardShortcut.Modifier.CommandOrControl | WebInspector.KeyboardShortcut.Modifier.Shift, WebInspector.KeyboardShortcut.Key.Left, this._showPreviousTabCheckingForEditableField.bind(this));
        this._showPreviousTabKeyboardShortcut3.implicitlyPreventsDefault = false;

        this._tabBar.newTabItem = new WebInspector.TabBarItem("Images/NewTabPlus.svg", WebInspector.UIString("Create a new tab"), true);

        this._tabBar.addEventListener(WebInspector.TabBar.Event.TabBarItemSelected, this._tabBarItemSelected, this);
        this._tabBar.addEventListener(WebInspector.TabBar.Event.TabBarItemRemoved, this._tabBarItemRemoved, this);

        this._recentTabContentViews = [];
    }

    // Public

    _createClass(TabBrowser, [{
        key: "updateLayout",
        value: function updateLayout() {
            this._tabBar.updateLayout();
            this._contentViewContainer.updateLayout();
        }
    }, {
        key: "bestTabContentViewForClass",
        value: function bestTabContentViewForClass(constructor) {
            console.assert(!this.selectedTabContentView || this.selectedTabContentView === this._recentTabContentViews[0]);

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._recentTabContentViews[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var tabContentView = _step.value;

                    if (tabContentView instanceof constructor) return tabContentView;
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

            return null;
        }
    }, {
        key: "bestTabContentViewForRepresentedObject",
        value: function bestTabContentViewForRepresentedObject(representedObject) {
            console.assert(!this.selectedTabContentView || this.selectedTabContentView === this._recentTabContentViews[0]);

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._recentTabContentViews[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var tabContentView = _step2.value;

                    if (tabContentView.canShowRepresentedObject(representedObject)) return tabContentView;
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                        _iterator2["return"]();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            return null;
        }
    }, {
        key: "addTabForContentView",
        value: function addTabForContentView(tabContentView, doNotAnimate, insertionIndex) {
            console.assert(tabContentView instanceof WebInspector.TabContentView);
            if (!(tabContentView instanceof WebInspector.TabContentView)) return false;

            var tabBarItem = tabContentView.tabBarItem;

            console.assert(tabBarItem instanceof WebInspector.TabBarItem);
            if (!(tabBarItem instanceof WebInspector.TabBarItem)) return false;

            if (tabBarItem.representedObject !== tabContentView) tabBarItem.representedObject = tabContentView;

            tabContentView.parentTabBrowser = this;

            if (tabBarItem.parentTabBar === this._tabBar) return true;

            // Add the tab after the first tab content view, since the first
            // tab content view is the currently selected one.
            if (this._recentTabContentViews.length && this.selectedTabContentView) this._recentTabContentViews.splice(1, 0, tabContentView);else this._recentTabContentViews.push(tabContentView);

            if (typeof insertionIndex === "number") this._tabBar.insertTabBarItem(tabBarItem, insertionIndex, doNotAnimate);else this._tabBar.addTabBarItem(tabBarItem, doNotAnimate);

            console.assert(this._recentTabContentViews.length === this._tabBar.tabBarItems.length - (this._tabBar.newTabItem ? 1 : 0));
            console.assert(!this.selectedTabContentView || this.selectedTabContentView === this._recentTabContentViews[0]);

            return true;
        }
    }, {
        key: "showTabForContentView",
        value: function showTabForContentView(tabContentView, doNotAnimate, insertionIndex) {
            if (!this.addTabForContentView(tabContentView, doNotAnimate, insertionIndex)) return false;

            this._tabBar.selectedTabBarItem = tabContentView.tabBarItem;

            return true;
        }
    }, {
        key: "closeTabForContentView",
        value: function closeTabForContentView(tabContentView, doNotAnimate) {
            console.assert(tabContentView instanceof WebInspector.TabContentView);
            if (!(tabContentView instanceof WebInspector.TabContentView)) return false;

            console.assert(tabContentView.tabBarItem instanceof WebInspector.TabBarItem);
            if (!(tabContentView.tabBarItem instanceof WebInspector.TabBarItem)) return false;

            if (tabContentView.tabBarItem.parentTabBar !== this._tabBar) return false;

            this._tabBar.removeTabBarItem(tabContentView.tabBarItem, doNotAnimate);

            console.assert(this._recentTabContentViews.length === this._tabBar.tabBarItems.length - (this._tabBar.newTabItem ? 1 : 0));
            console.assert(!this.selectedTabContentView || this.selectedTabContentView === this._recentTabContentViews[0]);

            return true;
        }

        // Private

    }, {
        key: "_tabBarItemSelected",
        value: function _tabBarItemSelected(event) {
            var tabContentView = this._tabBar.selectedTabBarItem ? this._tabBar.selectedTabBarItem.representedObject : null;

            if (tabContentView) {
                this._recentTabContentViews.remove(tabContentView);
                this._recentTabContentViews.unshift(tabContentView);

                this._contentViewContainer.showContentView(tabContentView);

                console.assert(this.selectedTabContentView);
                console.assert(this._recentTabContentViews.length === this._tabBar.tabBarItems.length - (this._tabBar.newTabItem ? 1 : 0));
                console.assert(this.selectedTabContentView === this._recentTabContentViews[0]);
            } else {
                this._contentViewContainer.closeAllContentViews();

                console.assert(!this.selectedTabContentView);
            }

            this._showNavigationSidebarPanelForTabContentView(tabContentView);
            this._showDetailsSidebarPanelsForTabContentView(tabContentView);

            this.dispatchEventToListeners(WebInspector.TabBrowser.Event.SelectedTabContentViewDidChange);
        }
    }, {
        key: "_tabBarItemRemoved",
        value: function _tabBarItemRemoved(event) {
            var tabContentView = event.data.tabBarItem.representedObject;

            console.assert(tabContentView);
            if (!tabContentView) return;

            this._recentTabContentViews.remove(tabContentView);
            this._contentViewContainer.closeContentView(tabContentView);

            tabContentView.parentTabBrowser = null;

            console.assert(this._recentTabContentViews.length === this._tabBar.tabBarItems.length - (this._tabBar.newTabItem ? 1 : 0));
            console.assert(!this.selectedTabContentView || this.selectedTabContentView === this._recentTabContentViews[0]);
        }
    }, {
        key: "_sidebarPanelSelected",
        value: function _sidebarPanelSelected(event) {
            if (this._ignoreSidebarEvents) return;

            var tabContentView = this.selectedTabContentView;
            if (!tabContentView) return;

            console.assert(event.target === this._detailsSidebar);

            if (tabContentView.managesDetailsSidebarPanels) return;

            var selectedSidebarPanel = this._detailsSidebar.selectedSidebarPanel;
            tabContentView.detailsSidebarSelectedPanelSetting.value = selectedSidebarPanel ? selectedSidebarPanel.identifier : null;
        }
    }, {
        key: "_sidebarCollapsedStateDidChange",
        value: function _sidebarCollapsedStateDidChange(event) {
            if (this._ignoreSidebarEvents) return;

            var tabContentView = this.selectedTabContentView;
            if (!tabContentView) return;

            if (event.target === this._navigationSidebar) tabContentView.navigationSidebarCollapsedSetting.value = this._navigationSidebar.collapsed;else if (event.target === this._detailsSidebar && !tabContentView.managesDetailsSidebarPanels) tabContentView.detailsSidebarCollapsedSetting.value = this._detailsSidebar.collapsed;
        }
    }, {
        key: "_showNavigationSidebarPanelForTabContentView",
        value: function _showNavigationSidebarPanelForTabContentView(tabContentView) {
            if (!this._navigationSidebar) return;

            this._ignoreSidebarEvents = true;

            this._navigationSidebar.removeSidebarPanel(0);

            console.assert(!this._navigationSidebar.sidebarPanels.length);

            if (!tabContentView) {
                this._ignoreSidebarEvents = false;
                return;
            }

            var navigationSidebarPanel = tabContentView.navigationSidebarPanel;
            if (!navigationSidebarPanel) {
                this._navigationSidebar.collapsed = true;
                this._ignoreSidebarEvents = false;
                return;
            }

            this._navigationSidebar.addSidebarPanel(navigationSidebarPanel);
            this._navigationSidebar.selectedSidebarPanel = navigationSidebarPanel;

            this._navigationSidebar.collapsed = tabContentView.navigationSidebarCollapsedSetting.value;

            this._ignoreSidebarEvents = false;
        }
    }, {
        key: "_showDetailsSidebarPanelsForTabContentView",
        value: function _showDetailsSidebarPanelsForTabContentView(tabContentView) {
            if (!this._detailsSidebar) return;

            this._ignoreSidebarEvents = true;

            for (var i = this._detailsSidebar.sidebarPanels.length - 1; i >= 0; --i) this._detailsSidebar.removeSidebarPanel(i);

            console.assert(!this._detailsSidebar.sidebarPanels.length);

            if (!tabContentView) {
                this._ignoreSidebarEvents = false;
                return;
            }

            if (tabContentView.managesDetailsSidebarPanels) {
                tabContentView.showDetailsSidebarPanels();
                this._ignoreSidebarEvents = false;
                return;
            }

            var detailsSidebarPanels = tabContentView.detailsSidebarPanels;
            if (!detailsSidebarPanels) {
                this._detailsSidebar.collapsed = true;
                this._ignoreSidebarEvents = false;
                return;
            }

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = detailsSidebarPanels[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var detailsSidebarPanel = _step3.value;

                    this._detailsSidebar.addSidebarPanel(detailsSidebarPanel);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                        _iterator3["return"]();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            this._detailsSidebar.selectedSidebarPanel = tabContentView.detailsSidebarSelectedPanelSetting.value || detailsSidebarPanels[0];

            this._detailsSidebar.collapsed = tabContentView.detailsSidebarCollapsedSetting.value || !detailsSidebarPanels.length;

            this._ignoreSidebarEvents = false;
        }
    }, {
        key: "_showPreviousTab",
        value: function _showPreviousTab(event) {
            this._tabBar.selectPreviousTab();
        }
    }, {
        key: "_showNextTab",
        value: function _showNextTab(event) {
            this._tabBar.selectNextTab();
        }
    }, {
        key: "_showNextTabCheckingForEditableField",
        value: function _showNextTabCheckingForEditableField(event) {
            if (WebInspector.isEventTargetAnEditableField(event)) return;

            this._showNextTab(event);

            event.preventDefault();
        }
    }, {
        key: "_showPreviousTabCheckingForEditableField",
        value: function _showPreviousTabCheckingForEditableField(event) {
            if (WebInspector.isEventTargetAnEditableField(event)) return;

            this._showPreviousTab(event);

            event.preventDefault();
        }
    }, {
        key: "element",
        get: function get() {
            return this._element;
        }
    }, {
        key: "tabBar",
        get: function get() {
            return this._tabBar;
        }
    }, {
        key: "navigationSidebar",
        get: function get() {
            return this._navigationSidebar;
        }
    }, {
        key: "detailsSidebar",
        get: function get() {
            return this._detailsSidebar;
        }
    }, {
        key: "selectedTabContentView",
        get: function get() {
            return this._contentViewContainer.currentContentView;
        }
    }]);

    return TabBrowser;
})(WebInspector.Object);

WebInspector.TabBrowser.Event = {
    SelectedTabContentViewDidChange: "tab-browser-selected-tab-content-view-did-change"
};
