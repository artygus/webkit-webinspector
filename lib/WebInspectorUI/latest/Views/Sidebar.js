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

WebInspector.Sidebar = (function (_WebInspector$Object) {
    _inherits(Sidebar, _WebInspector$Object);

    function Sidebar(element, side, sidebarPanels, role, label, hasNavigationBar) {
        _classCallCheck(this, Sidebar);

        _get(Object.getPrototypeOf(Sidebar.prototype), "constructor", this).call(this);

        console.assert(!side || side === WebInspector.Sidebar.Sides.Left || side === WebInspector.Sidebar.Sides.Right);
        this._side = side || WebInspector.Sidebar.Sides.Left;

        this._element = element || document.createElement("div");
        this._element.classList.add("sidebar", this._side, WebInspector.Sidebar.CollapsedStyleClassName);

        this._element.setAttribute("role", role || "group");
        if (label) this._element.setAttribute("aria-label", label);

        if (hasNavigationBar) {
            this._element.classList.add("has-navigation-bar");

            this._navigationBar = new WebInspector.NavigationBar(null, null, "tablist");
            this._navigationBar.addEventListener(WebInspector.NavigationBar.Event.NavigationItemSelected, this._navigationItemSelected, this);
            this._element.appendChild(this._navigationBar.element);
        }

        this._resizer = new WebInspector.Resizer(WebInspector.Resizer.RuleOrientation.Vertical, this);
        this._element.insertBefore(this._resizer.element, this._element.firstChild);

        this._sidebarPanels = [];

        if (sidebarPanels) {
            for (var i = 0; i < sidebarPanels.length; ++i) this.addSidebarPanel(sidebarPanels[i]);
        }
    }

    // Public

    _createClass(Sidebar, [{
        key: "addSidebarPanel",
        value: function addSidebarPanel(sidebarPanel) {
            console.assert(sidebarPanel instanceof WebInspector.SidebarPanel);
            if (!(sidebarPanel instanceof WebInspector.SidebarPanel)) return null;

            console.assert(!sidebarPanel.parentSidebar);
            if (sidebarPanel.parentSidebar) return null;

            sidebarPanel._parentSidebar = this;

            this._sidebarPanels.push(sidebarPanel);
            this._element.appendChild(sidebarPanel.element);

            if (this._navigationBar) {
                console.assert(sidebarPanel.navigationItem);
                this._navigationBar.addNavigationItem(sidebarPanel.navigationItem);
            }

            sidebarPanel.added();

            return sidebarPanel;
        }
    }, {
        key: "removeSidebarPanel",
        value: function removeSidebarPanel(sidebarPanelOrIdentifierOrIndex) {
            var sidebarPanel = this.findSidebarPanel(sidebarPanelOrIdentifierOrIndex);
            if (!sidebarPanel) return null;

            sidebarPanel.willRemove();

            if (sidebarPanel.visible) {
                sidebarPanel.hidden();
                sidebarPanel.visibilityDidChange();
            }

            sidebarPanel._parentSidebar = null;

            if (this._selectedSidebarPanel === sidebarPanel) {
                var index = this._sidebarPanels.indexOf(sidebarPanel);
                this.selectedSidebarPanel = this._sidebarPanels[index - 1] || this._sidebarPanels[index + 1] || null;
            }

            this._sidebarPanels.remove(sidebarPanel);
            this._element.removeChild(sidebarPanel.element);

            if (this._navigationBar) {
                console.assert(sidebarPanel.navigationItem);
                this._navigationBar.removeNavigationItem(sidebarPanel.navigationItem);
            }

            sidebarPanel.removed();

            return sidebarPanel;
        }
    }, {
        key: "findSidebarPanel",
        value: function findSidebarPanel(sidebarPanelOrIdentifierOrIndex) {
            var sidebarPanel = null;

            if (sidebarPanelOrIdentifierOrIndex instanceof WebInspector.SidebarPanel) {
                if (this._sidebarPanels.includes(sidebarPanelOrIdentifierOrIndex)) sidebarPanel = sidebarPanelOrIdentifierOrIndex;
            } else if (typeof sidebarPanelOrIdentifierOrIndex === "number") {
                sidebarPanel = this._sidebarPanels[sidebarPanelOrIdentifierOrIndex];
            } else if (typeof sidebarPanelOrIdentifierOrIndex === "string") {
                for (var i = 0; i < this._sidebarPanels.length; ++i) {
                    if (this._sidebarPanels[i].identifier === sidebarPanelOrIdentifierOrIndex) {
                        sidebarPanel = this._sidebarPanels[i];
                        break;
                    }
                }
            }

            return sidebarPanel;
        }

        // Protected

    }, {
        key: "resizerDragStarted",
        value: function resizerDragStarted(resizer) {
            this._widthBeforeResize = this.width;
        }
    }, {
        key: "resizerDragging",
        value: function resizerDragging(resizer, positionDelta) {
            if (this._side === WebInspector.Sidebar.Sides.Left) positionDelta *= -1;

            var newWidth = positionDelta + this._widthBeforeResize;
            this.width = newWidth;
            this.collapsed = newWidth < this.minimumWidth / 2;
        }

        // Private

    }, {
        key: "_navigationItemSelected",
        value: function _navigationItemSelected(event) {
            this.selectedSidebarPanel = event.target.selectedNavigationItem ? event.target.selectedNavigationItem.identifier : null;
        }
    }, {
        key: "selectedSidebarPanel",
        get: function get() {
            return this._selectedSidebarPanel || null;
        },
        set: function set(sidebarPanelOrIdentifierOrIndex) {
            var sidebarPanel = this.findSidebarPanel(sidebarPanelOrIdentifierOrIndex);
            if (this._selectedSidebarPanel === sidebarPanel) return;

            if (this._selectedSidebarPanel) {
                var wasVisible = this._selectedSidebarPanel.visible;

                this._selectedSidebarPanel.selected = false;

                if (wasVisible) {
                    this._selectedSidebarPanel.hidden();
                    this._selectedSidebarPanel.visibilityDidChange();
                }
            }

            this._selectedSidebarPanel = sidebarPanel || null;

            if (this._navigationBar) this._navigationBar.selectedNavigationItem = sidebarPanel ? sidebarPanel.navigationItem : null;

            if (this._selectedSidebarPanel) {
                this._selectedSidebarPanel.selected = true;

                if (this._selectedSidebarPanel.visible) {
                    this._selectedSidebarPanel.shown();
                    this._selectedSidebarPanel.visibilityDidChange();
                }
            }

            this.dispatchEventToListeners(WebInspector.Sidebar.Event.SidebarPanelSelected);
        }
    }, {
        key: "minimumWidth",
        get: function get() {
            if (this._navigationBar) return Math.max(WebInspector.Sidebar.AbsoluteMinimumWidth, this._navigationBar.minimumWidth);
            return WebInspector.Sidebar.AbsoluteMinimumWidth;
        }
    }, {
        key: "maximumWidth",
        get: function get() {
            // FIXME: This is kind of arbitrary and ideally would be a more complex calculation based on the
            // available space for the sibling elements.
            return Math.round(window.innerWidth / 3);
        }
    }, {
        key: "width",
        get: function get() {
            return this._element.offsetWidth;
        },
        set: function set(newWidth) {
            if (newWidth === this.width) return;

            newWidth = Math.max(this.minimumWidth, Math.min(newWidth, this.maximumWidth));

            this._element.style.width = newWidth + "px";

            if (!this.collapsed && this._navigationBar) this._navigationBar.updateLayout();

            if (!this.collapsed && this._selectedSidebarPanel) this._selectedSidebarPanel.widthDidChange();

            this.dispatchEventToListeners(WebInspector.Sidebar.Event.WidthDidChange);
        }
    }, {
        key: "collapsed",
        get: function get() {
            return this._element.classList.contains(WebInspector.Sidebar.CollapsedStyleClassName);
        },
        set: function set(flag) {
            if (flag === this.collapsed) return;

            if (flag) this._element.classList.add(WebInspector.Sidebar.CollapsedStyleClassName);else {
                this._element.classList.remove(WebInspector.Sidebar.CollapsedStyleClassName);

                if (this._navigationBar) this._navigationBar.updateLayout();
            }

            if (this._selectedSidebarPanel) {
                if (this._selectedSidebarPanel.visible) this._selectedSidebarPanel.shown();else this._selectedSidebarPanel.hidden();

                this._selectedSidebarPanel.visibilityDidChange();

                this._selectedSidebarPanel.widthDidChange();
            }

            this.dispatchEventToListeners(WebInspector.Sidebar.Event.CollapsedStateDidChange);
            this.dispatchEventToListeners(WebInspector.Sidebar.Event.WidthDidChange);
        }
    }, {
        key: "sidebarPanels",
        get: function get() {
            return this._sidebarPanels;
        }
    }, {
        key: "element",
        get: function get() {
            return this._element;
        }
    }, {
        key: "side",
        get: function get() {
            return this._side;
        }
    }]);

    return Sidebar;
})(WebInspector.Object);

WebInspector.Sidebar.CollapsedStyleClassName = "collapsed";
WebInspector.Sidebar.AbsoluteMinimumWidth = 200;

WebInspector.Sidebar.Sides = {
    Right: "right",
    Left: "left"
};

WebInspector.Sidebar.Event = {
    SidebarPanelSelected: "sidebar-panel-selected",
    CollapsedStateDidChange: "sidebar-collapsed-state-did-change",
    WidthDidChange: "sidebar-width-did-change"
};
