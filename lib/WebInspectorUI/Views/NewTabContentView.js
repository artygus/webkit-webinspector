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

WebInspector.NewTabContentView = (function (_WebInspector$TabContentView) {
    _inherits(NewTabContentView, _WebInspector$TabContentView);

    function NewTabContentView(identifier) {
        _classCallCheck(this, NewTabContentView);

        var tabBarItem = new WebInspector.TabBarItem("Images/NewTab.svg", WebInspector.UIString("New Tab"));
        tabBarItem.isDefaultTab = true;

        _get(Object.getPrototypeOf(NewTabContentView.prototype), "constructor", this).call(this, identifier || "new-tab", "new-tab", tabBarItem);

        var allowedNewTabs = [{ image: "Images/Console.svg", title: WebInspector.UIString("Console"), type: WebInspector.ConsoleTabContentView.Type }, { image: "Images/Debugger.svg", title: WebInspector.UIString("Debugger"), type: WebInspector.DebuggerTabContentView.Type }, { image: "Images/Elements.svg", title: WebInspector.UIString("Elements"), type: WebInspector.ElementsTabContentView.Type }, { image: "Images/Network.svg", title: WebInspector.UIString("Network"), type: WebInspector.NetworkTabContentView.Type }, { image: "Images/Resources.svg", title: WebInspector.UIString("Resources"), type: WebInspector.ResourcesTabContentView.Type }, { image: "Images/Storage.svg", title: WebInspector.UIString("Storage"), type: WebInspector.StorageTabContentView.Type }, { image: "Images/Timeline.svg", title: WebInspector.UIString("Timelines"), type: WebInspector.TimelineTabContentView.Type }];

        allowedNewTabs.sort(function (a, b) {
            return a.title.localeCompare(b.title);
        });

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = allowedNewTabs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var info = _step.value;

                if (!WebInspector.isTabTypeAllowed(info.type)) continue;

                var tabItemElement = document.createElement("div");
                tabItemElement.classList.add(WebInspector.NewTabContentView.TabItemStyleClassName);
                tabItemElement.addEventListener("click", this._createNewTabWithType.bind(this, info.type));
                tabItemElement[WebInspector.NewTabContentView.TypeSymbol] = info.type;

                var boxElement = tabItemElement.appendChild(document.createElement("div"));
                boxElement.classList.add("box");

                var imageElement = boxElement.appendChild(document.createElement("img"));
                imageElement.src = info.image;

                var labelElement = tabItemElement.appendChild(document.createElement("label"));
                labelElement.textContent = info.title;

                this.element.appendChild(tabItemElement);
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
    }

    // Public

    _createClass(NewTabContentView, [{
        key: "shown",
        value: function shown() {
            WebInspector.tabBrowser.tabBar.addEventListener(WebInspector.TabBar.Event.TabBarItemAdded, this._updateTabItems, this);
            WebInspector.tabBrowser.tabBar.addEventListener(WebInspector.TabBar.Event.TabBarItemRemoved, this._updateTabItems, this);

            this._updateTabItems();
        }
    }, {
        key: "hidden",
        value: function hidden() {
            WebInspector.tabBrowser.tabBar.removeEventListener(null, null, this);
        }
    }, {
        key: "_createNewTabWithType",

        // Private

        value: function _createNewTabWithType(tabType, event) {
            if (!WebInspector.isNewTabWithTypeAllowed(tabType)) return;

            var canCreateAdditionalTabs = this._allowableTabTypes().length > 1;
            var options = {
                referencedView: this,
                shouldReplaceTab: !canCreateAdditionalTabs || !WebInspector.modifierKeys.metaKey,
                shouldShowNewTab: !WebInspector.modifierKeys.metaKey
            };
            WebInspector.createNewTabWithType(tabType, options);
        }
    }, {
        key: "_allowableTabTypes",
        value: function _allowableTabTypes() {
            var tabItemElements = this.tabItemElements;
            var tabTypes = tabItemElements.map(function (tabItemElement) {
                return tabItemElement[WebInspector.NewTabContentView.TypeSymbol];
            });
            return tabTypes.filter(function (type) {
                return WebInspector.isNewTabWithTypeAllowed(type);
            });
        }
    }, {
        key: "_updateTabItems",
        value: function _updateTabItems() {
            var tabItemElements = this.tabItemElements;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = tabItemElements[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var tabItemElement = _step2.value;

                    var type = tabItemElement[WebInspector.NewTabContentView.TypeSymbol];
                    var allowed = WebInspector.isNewTabWithTypeAllowed(type);
                    tabItemElement.classList.toggle(WebInspector.NewTabContentView.DisabledStyleClassName, !allowed);
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
        }
    }, {
        key: "type",
        get: function get() {
            return WebInspector.NewTabContentView.Type;
        }
    }, {
        key: "supportsSplitContentBrowser",
        get: function get() {
            // Showing the split console is problematic because some new tabs will cause it to
            // disappear and not reappear, but others won't. Just prevent it from ever showing.
            return false;
        }
    }, {
        key: "tabItemElements",
        get: function get() {
            return Array.from(this.element.querySelectorAll("." + WebInspector.NewTabContentView.TabItemStyleClassName));
        }
    }]);

    return NewTabContentView;
})(WebInspector.TabContentView);

WebInspector.NewTabContentView.Type = "new-tab";
WebInspector.NewTabContentView.TypeSymbol = Symbol("type");

WebInspector.NewTabContentView.TabItemStyleClassName = "tab-item";
WebInspector.NewTabContentView.DisabledStyleClassName = "disabled";
