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

WebInspector.TabBarItem = (function (_WebInspector$Object) {
    _inherits(TabBarItem, _WebInspector$Object);

    function TabBarItem(image, title, pinned, representedObject) {
        _classCallCheck(this, TabBarItem);

        _get(Object.getPrototypeOf(TabBarItem.prototype), "constructor", this).call(this);

        this._parentTabBar = null;

        this._element = document.createElement("div");
        this._element.classList.add(WebInspector.TabBarItem.StyleClassName);
        this._element.setAttribute("role", "tab");
        this._element.tabIndex = 0;
        if (pinned) this._element.classList.add("pinned");
        this._element[WebInspector.TabBarItem.ElementReferenceSymbol] = this;

        if (!pinned) {
            this._closeButtonElement = document.createElement("div");
            this._closeButtonElement.classList.add(WebInspector.TabBarItem.CloseButtonStyleClassName);
            this._closeButtonElement.title = WebInspector.UIString("Click to close this tab");
            this._element.appendChild(this._closeButtonElement);

            var flexSpaceElement = document.createElement("div");
            flexSpaceElement.classList.add("flex-space");
            this._element.appendChild(flexSpaceElement);

            this._element.addEventListener("contextmenu", this._handleContextMenuEvent.bind(this));
        }

        this._iconElement = document.createElement("img");
        this._iconElement.classList.add("icon");
        this._element.appendChild(this._iconElement);

        if (!pinned) {
            var flexSpaceElement = document.createElement("div");
            flexSpaceElement.classList.add("flex-space");
            this._element.appendChild(flexSpaceElement);
        }

        this.title = title;
        this.image = image;
        this.representedObject = representedObject;
    }

    // Public

    _createClass(TabBarItem, [{
        key: "_handleContextMenuEvent",

        // Private

        value: function _handleContextMenuEvent(event) {
            if (!this._parentTabBar) return;

            var hasOtherNonPinnedTabs = false;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._parentTabBar.tabBarItems[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var item = _step.value;

                    if (item === this || item.pinned) continue;
                    hasOtherNonPinnedTabs = true;
                    break;
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

            function closeTab() {
                this._parentTabBar.removeTabBarItem(this);
            }

            function closeOtherTabs() {
                var tabBarItems = this._parentTabBar.tabBarItems;
                for (var i = tabBarItems.length - 1; i >= 0; --i) {
                    var item = tabBarItems[i];
                    if (item === this || item.pinned) continue;
                    this._parentTabBar.removeTabBarItem(item);
                }
            }

            var contextMenu = new WebInspector.ContextMenu(event);
            contextMenu.appendItem(WebInspector.UIString("Close Tab"), closeTab.bind(this), !hasOtherNonPinnedTabs);
            contextMenu.appendItem(WebInspector.UIString("Close Other Tabs"), closeOtherTabs.bind(this), !hasOtherNonPinnedTabs);
            contextMenu.show();
        }
    }, {
        key: "element",
        get: function get() {
            return this._element;
        }
    }, {
        key: "representedObject",
        get: function get() {
            return this._representedObject;
        },
        set: function set(representedObject) {
            this._representedObject = representedObject || null;
        }
    }, {
        key: "parentTabBar",
        get: function get() {
            return this._parentTabBar;
        },
        set: function set(tabBar) {
            this._parentTabBar = tabBar || null;
        }
    }, {
        key: "selected",
        get: function get() {
            return this._element.classList.contains("selected");
        },
        set: function set(selected) {
            this._element.classList.toggle("selected", selected);

            if (selected) this._element.setAttribute("aria-selected", "true");else this._element.removeAttribute("aria-selected");
        }
    }, {
        key: "disabled",
        get: function get() {
            return this._element.classList.contains("disabled");
        },
        set: function set(disabled) {
            this._element.classList.toggle("disabled", disabled);
        }
    }, {
        key: "isDefaultTab",
        get: function get() {
            return this._element.classList.contains("default-tab");
        },
        set: function set(isDefaultTab) {
            this._element.classList.toggle("default-tab", isDefaultTab);
        }
    }, {
        key: "pinned",
        get: function get() {
            return this._element.classList.contains("pinned");
        }
    }, {
        key: "image",
        get: function get() {
            return this._iconElement.src;
        },
        set: function set(url) {
            this._iconElement.src = url || "";
        }
    }, {
        key: "title",
        get: function get() {
            return this._element.title || "";
        },
        set: function set(title) {
            if (title && !this.pinned) {
                this._titleElement = document.createElement("span");
                this._titleElement.classList.add("title");

                this._titleContentElement = document.createElement("span");
                this._titleContentElement.classList.add("content");
                this._titleElement.appendChild(this._titleContentElement);

                this._titleContentElement.textContent = title;

                this._element.insertBefore(this._titleElement, this._element.lastChild);
            } else {
                if (this._titleElement) this._titleElement.remove();

                this._titleContentElement = null;
                this._titleElement = null;
            }

            this._element.title = title || "";
        }
    }]);

    return TabBarItem;
})(WebInspector.Object);

WebInspector.TabBarItem.StyleClassName = "item";
WebInspector.TabBarItem.CloseButtonStyleClassName = "close";
WebInspector.TabBarItem.ElementReferenceSymbol = Symbol("tab-bar-item");
