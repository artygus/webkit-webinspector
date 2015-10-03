var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

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

WebInspector.TabBar = (function (_WebInspector$Object) {
    _inherits(TabBar, _WebInspector$Object);

    function TabBar(element, tabBarItems) {
        _classCallCheck(this, TabBar);

        _get(Object.getPrototypeOf(TabBar.prototype), "constructor", this).call(this);

        this._element = element || document.createElement("div");
        this._element.classList.add("tab-bar");
        this._element.setAttribute("role", "tablist");

        var topBorderElement = document.createElement("div");
        topBorderElement.classList.add("top-border");
        this._element.appendChild(topBorderElement);

        this._element.addEventListener("mousedown", this._handleMouseDown.bind(this));
        this._element.addEventListener("click", this._handleClick.bind(this));
        this._element.addEventListener("mouseleave", this._handleMouseLeave.bind(this));

        this._tabBarItems = [];

        if (tabBarItems) {
            for (var tabBarItem in tabBarItems) this.addTabBarItem(tabBarItem);
        }
    }

    // Public

    _createClass(TabBar, [{
        key: "addTabBarItem",
        value: function addTabBarItem(tabBarItem, doNotAnimate) {
            return this.insertTabBarItem(tabBarItem, this._tabBarItems.length, doNotAnimate);
        }
    }, {
        key: "insertTabBarItem",
        value: function insertTabBarItem(tabBarItem, index, doNotAnimate) {
            console.assert(tabBarItem instanceof WebInspector.TabBarItem);
            if (!(tabBarItem instanceof WebInspector.TabBarItem)) return null;

            if (tabBarItem.parentTabBar === this) return;

            if (this._tabAnimatedClosedSinceMouseEnter) {
                // Delay adding the new tab until we can expand the tabs after a closed tab.
                this._finishExpandingTabsAfterClose().then((function () {
                    this.insertTabBarItem(tabBarItem, index, doNotAnimate);
                }).bind(this));
                return;
            }

            if (tabBarItem.parentTabBar) tabBarItem.parentTabBar.removeTabBarItem(tabBarItem);

            tabBarItem.parentTabBar = this;

            var lastIndex = this._newTabItem ? this._tabBarItems.length - 1 : this._tabBarItems.length;
            index = Math.max(0, Math.min(index, lastIndex));

            if (this._element.classList.contains("animating")) {
                requestAnimationFrame(removeStyles.bind(this));
                doNotAnimate = true;
            }

            var beforeTabSizesAndPositions;
            if (!doNotAnimate) beforeTabSizesAndPositions = this._recordTabBarItemSizesAndPositions();

            this._tabBarItems.splice(index, 0, tabBarItem);

            var nextSibling = this._tabBarItems[index + 1];
            var nextSiblingElement = nextSibling ? nextSibling.element : this._newTabItem ? this._newTabItem.element : null;

            this._element.insertBefore(tabBarItem.element, nextSiblingElement);

            this._element.classList.toggle("single-tab", !this._hasMoreThanOneNormalTab());

            tabBarItem.element.style.left = null;
            tabBarItem.element.style.width = null;

            function animateTabs() {
                this._element.classList.add("animating");
                this._element.classList.add("inserting-tab");

                this._applyTabBarItemSizesAndPositions(afterTabSizesAndPositions);

                this._element.addEventListener("webkitTransitionEnd", removeStylesListener);
            }

            function removeStyles() {
                this._element.classList.remove("static-layout");
                this._element.classList.remove("animating");
                this._element.classList.remove("inserting-tab");

                tabBarItem.element.classList.remove("being-inserted");

                this._clearTabBarItemSizesAndPositions();

                this._element.removeEventListener("webkitTransitionEnd", removeStylesListener);
            }

            if (!doNotAnimate) {
                var afterTabSizesAndPositions = this._recordTabBarItemSizesAndPositions();

                this.updateLayout();

                var previousTabBarItem = this._tabBarItems[this._tabBarItems.indexOf(tabBarItem) - 1] || null;
                var previousTabBarItemSizeAndPosition = previousTabBarItem ? beforeTabSizesAndPositions.get(previousTabBarItem) : null;

                if (previousTabBarItemSizeAndPosition) beforeTabSizesAndPositions.set(tabBarItem, { left: previousTabBarItemSizeAndPosition.left + previousTabBarItemSizeAndPosition.width, width: 0 });else beforeTabSizesAndPositions.set(tabBarItem, { left: 0, width: 0 });

                this._element.classList.add("static-layout");
                tabBarItem.element.classList.add("being-inserted");

                this._applyTabBarItemSizesAndPositions(beforeTabSizesAndPositions);

                var removeStylesListener = removeStyles.bind(this);

                requestAnimationFrame(animateTabs.bind(this));
            } else this.updateLayoutSoon();

            this.dispatchEventToListeners(WebInspector.TabBar.Event.TabBarItemAdded, { tabBarItem: tabBarItem });

            return tabBarItem;
        }
    }, {
        key: "removeTabBarItem",
        value: function removeTabBarItem(tabBarItemOrIndex, doNotAnimate, doNotExpand) {
            var tabBarItem = this._findTabBarItem(tabBarItemOrIndex);
            if (!tabBarItem) return null;

            tabBarItem.parentTabBar = null;

            if (tabBarItem === this._newTabItem) this.newTabItem = null;

            if (this._selectedTabBarItem === tabBarItem) {
                var index = this._tabBarItems.indexOf(tabBarItem);
                var nextTabBarItem = this._tabBarItems[index + 1];
                if (!nextTabBarItem || nextTabBarItem.pinned) nextTabBarItem = this._tabBarItems[index - 1];

                this.selectedTabBarItem = nextTabBarItem;
            }

            if (this._element.classList.contains("animating")) {
                requestAnimationFrame(removeStyles.bind(this));
                doNotAnimate = true;
            }

            var beforeTabSizesAndPositions;
            if (!doNotAnimate) beforeTabSizesAndPositions = this._recordTabBarItemSizesAndPositions();

            var wasLastNormalTab = this._tabBarItems.indexOf(tabBarItem) === (this._newTabItem ? this._tabBarItems.length - 2 : this._tabBarItems.length - 1);

            this._tabBarItems.remove(tabBarItem);
            tabBarItem.element.remove();

            var hasMoreThanOneNormalTab = this._hasMoreThanOneNormalTab();
            this._element.classList.toggle("single-tab", !hasMoreThanOneNormalTab);

            var shouldOpenDefaultTab = !tabBarItem.isDefaultTab && !this.hasNormalTab();
            if (shouldOpenDefaultTab) doNotAnimate = true;

            if (!hasMoreThanOneNormalTab || wasLastNormalTab || !doNotExpand) {
                if (!doNotAnimate) {
                    this._tabAnimatedClosedSinceMouseEnter = true;
                    this._finishExpandingTabsAfterClose(beforeTabSizesAndPositions);
                } else this.updateLayoutSoon();

                this.dispatchEventToListeners(WebInspector.TabBar.Event.TabBarItemRemoved, { tabBarItem: tabBarItem });

                if (shouldOpenDefaultTab) this._openDefaultTab();

                return tabBarItem;
            }

            var lastNormalTabBarItem;

            function animateTabs() {
                this._element.classList.add("animating");
                this._element.classList.add("closing-tab");

                var left = 0;
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this._tabBarItems[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var currentTabBarItem = _step.value;

                        var sizeAndPosition = beforeTabSizesAndPositions.get(currentTabBarItem);

                        if (!currentTabBarItem.pinned) {
                            currentTabBarItem.element.style.left = left + "px";
                            left += sizeAndPosition.width;
                            lastNormalTabBarItem = currentTabBarItem;
                        } else left = sizeAndPosition.left + sizeAndPosition.width;
                    }

                    // The selected tab and last tab need to draw a right border as well, so make them 1px wider.
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

                if (this._selectedTabBarItem) this._selectedTabBarItem.element.style.width = parseFloat(this._selectedTabBarItem.element.style.width) + 1 + "px";

                if (lastNormalTabBarItem !== this._selectedTabBarItem) lastNormalTabBarItem.element.style.width = parseFloat(lastNormalTabBarItem.element.style.width) + 1 + "px";

                this._element.addEventListener("webkitTransitionEnd", removeStylesListener);
            }

            function removeStyles() {
                // The selected tab needs to stop drawing the right border, so make it 1px smaller. Only if it isn't the last.
                if (this._selectedTabBarItem && this._selectedTabBarItem !== lastNormalTabBarItem) this._selectedTabBarItem.element.style.width = parseFloat(this._selectedTabBarItem.element.style.width) - 1 + "px";

                this._element.classList.remove("animating");
                this._element.classList.remove("closing-tab");

                this.updateLayout();

                this._element.removeEventListener("webkitTransitionEnd", removeStylesListener);
            }

            if (!doNotAnimate) {
                this._element.classList.add("static-layout");

                this._tabAnimatedClosedSinceMouseEnter = true;

                this._applyTabBarItemSizesAndPositions(beforeTabSizesAndPositions);

                var removeStylesListener = removeStyles.bind(this);

                requestAnimationFrame(animateTabs.bind(this));
            } else this.updateLayoutSoon();

            this.dispatchEventToListeners(WebInspector.TabBar.Event.TabBarItemRemoved, { tabBarItem: tabBarItem });

            if (shouldOpenDefaultTab) this._openDefaultTab();

            return tabBarItem;
        }
    }, {
        key: "selectPreviousTab",
        value: function selectPreviousTab() {
            if (this._tabBarItems.length <= 1) return;

            var startIndex = this._tabBarItems.indexOf(this._selectedTabBarItem);
            var newIndex = startIndex;
            do {
                if (newIndex === 0) newIndex = this._tabBarItems.length - 1;else newIndex--;

                if (!this._tabBarItems[newIndex].pinned) break;
            } while (newIndex !== startIndex);

            if (newIndex === startIndex) return;

            this.selectedTabBarItem = this._tabBarItems[newIndex];
        }
    }, {
        key: "selectNextTab",
        value: function selectNextTab() {
            if (this._tabBarItems.length <= 1) return;

            var startIndex = this._tabBarItems.indexOf(this._selectedTabBarItem);
            var newIndex = startIndex;
            do {
                if (newIndex === this._tabBarItems.length - 1) newIndex = 0;else newIndex++;

                if (!this._tabBarItems[newIndex].pinned) break;
            } while (newIndex !== startIndex);

            if (newIndex === startIndex) return;

            this.selectedTabBarItem = this._tabBarItems[newIndex];
        }
    }, {
        key: "updateLayoutSoon",
        value: function updateLayoutSoon() {
            if (this._updateLayoutIdentifier) return;

            this._needsLayout = true;

            function update() {
                this._updateLayoutIdentifier = undefined;

                if (this._needsLayout) this.updateLayout();
            }

            this._updateLayoutIdentifier = requestAnimationFrame(update.bind(this));
        }
    }, {
        key: "updateLayout",
        value: function updateLayout() {
            if (this._updateLayoutIdentifier) {
                cancelAnimationFrame(this._updateLayoutIdentifier);
                this._updateLayoutIdentifier = undefined;
            }

            if (this._element.classList.contains("static-layout")) return;

            this._needsLayout = false;

            this._element.classList.remove("hide-titles");
            this._element.classList.remove("collapsed");

            var firstNormalTabItem = null;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._tabBarItems[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var tabItem = _step2.value;

                    if (tabItem.pinned) continue;
                    firstNormalTabItem = tabItem;
                    break;
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

            if (!firstNormalTabItem) return;

            if (firstNormalTabItem.element.offsetWidth >= 120) return;

            this._element.classList.add("collapsed");

            if (firstNormalTabItem.element.offsetWidth >= 60) return;

            this._element.classList.add("hide-titles");
        }
    }, {
        key: "hasNormalTab",
        value: function hasNormalTab() {
            return this._tabBarItems.some(function (tab) {
                return !tab.pinned;
            });
        }

        // Private

    }, {
        key: "_findTabBarItem",
        value: function _findTabBarItem(tabBarItemOrIndex) {
            if (typeof tabBarItemOrIndex === "number") return this._tabBarItems[tabBarItemOrIndex] || null;

            if (tabBarItemOrIndex instanceof WebInspector.TabBarItem) {
                if (this._tabBarItems.includes(tabBarItemOrIndex)) return tabBarItemOrIndex;
            }

            return null;
        }
    }, {
        key: "_hasMoreThanOneNormalTab",
        value: function _hasMoreThanOneNormalTab() {
            var normalTabCount = 0;
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this._tabBarItems[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var tabBarItem = _step3.value;

                    if (tabBarItem.pinned) continue;
                    ++normalTabCount;
                    if (normalTabCount >= 2) return true;
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

            return false;
        }
    }, {
        key: "_openDefaultTab",
        value: function _openDefaultTab() {
            this.dispatchEventToListeners(WebInspector.TabBar.Event.OpenDefaultTab);
        }
    }, {
        key: "_recordTabBarItemSizesAndPositions",
        value: function _recordTabBarItemSizesAndPositions() {
            var tabBarItemSizesAndPositions = new Map();

            var barRect = this._element.getBoundingClientRect();

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this._tabBarItems[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var tabBarItem = _step4.value;

                    var boundingRect = tabBarItem.element.getBoundingClientRect();
                    tabBarItemSizesAndPositions.set(tabBarItem, { left: boundingRect.left - barRect.left, width: boundingRect.width });
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
                        _iterator4["return"]();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            return tabBarItemSizesAndPositions;
        }
    }, {
        key: "_applyTabBarItemSizesAndPositions",
        value: function _applyTabBarItemSizesAndPositions(tabBarItemSizesAndPositions, skipTabBarItem) {
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = tabBarItemSizesAndPositions[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var _step5$value = _slicedToArray(_step5.value, 2);

                    var tabBarItem = _step5$value[0];
                    var sizeAndPosition = _step5$value[1];

                    if (skipTabBarItem && tabBarItem === skipTabBarItem) continue;
                    tabBarItem.element.style.left = sizeAndPosition.left + "px";
                    tabBarItem.element.style.width = sizeAndPosition.width + "px";
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
                        _iterator5["return"]();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }
        }
    }, {
        key: "_clearTabBarItemSizesAndPositions",
        value: function _clearTabBarItemSizesAndPositions(skipTabBarItem) {
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = this._tabBarItems[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var tabBarItem = _step6.value;

                    if (skipTabBarItem && tabBarItem === skipTabBarItem) continue;
                    tabBarItem.element.style.left = null;
                    tabBarItem.element.style.width = null;
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6["return"]) {
                        _iterator6["return"]();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }
        }
    }, {
        key: "_finishExpandingTabsAfterClose",
        value: function _finishExpandingTabsAfterClose(beforeTabSizesAndPositions) {
            return new Promise((function (resolve, reject) {
                console.assert(this._tabAnimatedClosedSinceMouseEnter);
                this._tabAnimatedClosedSinceMouseEnter = false;

                if (!beforeTabSizesAndPositions) beforeTabSizesAndPositions = this._recordTabBarItemSizesAndPositions();

                this._element.classList.remove("static-layout");
                this._clearTabBarItemSizesAndPositions();

                var afterTabSizesAndPositions = this._recordTabBarItemSizesAndPositions();

                this._applyTabBarItemSizesAndPositions(beforeTabSizesAndPositions);
                this.element.classList.add("static-layout");

                function animateTabs() {
                    this._element.classList.add("static-layout");
                    this._element.classList.add("animating");
                    this._element.classList.add("expanding-tabs");

                    this._applyTabBarItemSizesAndPositions(afterTabSizesAndPositions);

                    this._element.addEventListener("webkitTransitionEnd", removeStylesListener);
                }

                function removeStyles() {
                    this._element.classList.remove("static-layout");
                    this._element.classList.remove("animating");
                    this._element.classList.remove("expanding-tabs");

                    this._clearTabBarItemSizesAndPositions();

                    this.updateLayout();

                    this._element.removeEventListener("webkitTransitionEnd", removeStylesListener);

                    resolve();
                }

                var removeStylesListener = removeStyles.bind(this);

                requestAnimationFrame(animateTabs.bind(this));
            }).bind(this));
        }
    }, {
        key: "_handleMouseDown",
        value: function _handleMouseDown(event) {
            // Only consider left mouse clicks for tab movement.
            if (event.button !== 0 || event.ctrlKey) return;

            var itemElement = event.target.enclosingNodeOrSelfWithClass(WebInspector.TabBarItem.StyleClassName);
            if (!itemElement) return;

            var tabBarItem = itemElement[WebInspector.TabBarItem.ElementReferenceSymbol];
            if (!tabBarItem) return;

            if (tabBarItem.disabled) return;

            if (tabBarItem === this._newTabItem) return;

            var closeButtonElement = event.target.enclosingNodeOrSelfWithClass(WebInspector.TabBarItem.CloseButtonStyleClassName);
            if (closeButtonElement) return;

            this.selectedTabBarItem = tabBarItem;

            if (tabBarItem.pinned || !this._hasMoreThanOneNormalTab()) return;

            this._firstNormalTabItemIndex = 0;
            for (var i = 0; i < this._tabBarItems.length; ++i) {
                if (this._tabBarItems[i].pinned) continue;
                this._firstNormalTabItemIndex = i;
                break;
            }

            this._mouseIsDown = true;

            this._mouseMovedEventListener = this._handleMouseMoved.bind(this);
            this._mouseUpEventListener = this._handleMouseUp.bind(this);

            // Register these listeners on the document so we can track the mouse if it leaves the tab bar.
            document.addEventListener("mousemove", this._mouseMovedEventListener, true);
            document.addEventListener("mouseup", this._mouseUpEventListener, true);

            event.preventDefault();
            event.stopPropagation();
        }
    }, {
        key: "_handleClick",
        value: function _handleClick(event) {
            var itemElement = event.target.enclosingNodeOrSelfWithClass(WebInspector.TabBarItem.StyleClassName);
            if (!itemElement) return;

            var tabBarItem = itemElement[WebInspector.TabBarItem.ElementReferenceSymbol];
            if (!tabBarItem) return;

            if (tabBarItem.disabled) return;

            var clickedMiddleButton = event.button === 1;

            var closeButtonElement = event.target.enclosingNodeOrSelfWithClass(WebInspector.TabBarItem.CloseButtonStyleClassName);
            if (closeButtonElement || clickedMiddleButton) {
                // Disallow closing the default tab if it is the only tab.
                if (tabBarItem.isDefaultTab && this._element.classList.contains("single-tab")) return;

                this.removeTabBarItem(tabBarItem, false, true);
            }
        }
    }, {
        key: "_handleMouseMoved",
        value: function _handleMouseMoved(event) {
            console.assert(event.button === 0);
            console.assert(this._mouseIsDown);
            if (!this._mouseIsDown) return;

            console.assert(this._selectedTabBarItem);
            if (!this._selectedTabBarItem) return;

            event.preventDefault();
            event.stopPropagation();

            if (!this._element.classList.contains("static-layout")) {
                this._applyTabBarItemSizesAndPositions(this._recordTabBarItemSizesAndPositions());
                this._element.classList.add("static-layout");
                this._element.classList.add("dragging-tab");
            }

            if (this._mouseOffset === undefined) this._mouseOffset = event.pageX - this._selectedTabBarItem.element.totalOffsetLeft;

            var tabBarMouseOffset = event.pageX - this.element.totalOffsetLeft;
            var newLeft = tabBarMouseOffset - this._mouseOffset;

            this._selectedTabBarItem.element.style.left = newLeft + "px";

            var selectedTabMidX = newLeft + this._selectedTabBarItem.element.realOffsetWidth / 2;

            var currentIndex = this._tabBarItems.indexOf(this._selectedTabBarItem);
            var newIndex = currentIndex;

            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = this._tabBarItems[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var tabBarItem = _step7.value;

                    if (tabBarItem === this._selectedTabBarItem) continue;

                    var tabBarItemRect = tabBarItem.element.getBoundingClientRect();

                    if (selectedTabMidX < tabBarItemRect.left || selectedTabMidX > tabBarItemRect.right) continue;

                    newIndex = this._tabBarItems.indexOf(tabBarItem);
                    break;
                }
            } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion7 && _iterator7["return"]) {
                        _iterator7["return"]();
                    }
                } finally {
                    if (_didIteratorError7) {
                        throw _iteratorError7;
                    }
                }
            }

            newIndex = Math.max(this._firstNormalTabItemIndex, newIndex);
            newIndex = Math.min(this._newTabItem ? this._tabBarItems.length - 2 : this._tabBarItems.length - 1, newIndex);

            if (currentIndex === newIndex) return;

            this._tabBarItems.splice(currentIndex, 1);
            this._tabBarItems.splice(newIndex, 0, this._selectedTabBarItem);

            var nextSibling = this._tabBarItems[newIndex + 1];
            var nextSiblingElement = nextSibling ? nextSibling.element : this._newTabItem ? this._newTabItem.element : null;

            this._element.insertBefore(this._selectedTabBarItem.element, nextSiblingElement);

            // FIXME: Animate the tabs that move to make room for the selected tab. This was causing me trouble when I tried.

            var left = 0;
            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = this._tabBarItems[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var tabBarItem = _step8.value;

                    if (tabBarItem !== this._selectedTabBarItem && tabBarItem !== this._newTabItem && parseFloat(tabBarItem.element.style.left) !== left) tabBarItem.element.style.left = left + "px";
                    left += parseFloat(tabBarItem.element.style.width);
                }
            } catch (err) {
                _didIteratorError8 = true;
                _iteratorError8 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion8 && _iterator8["return"]) {
                        _iterator8["return"]();
                    }
                } finally {
                    if (_didIteratorError8) {
                        throw _iteratorError8;
                    }
                }
            }
        }
    }, {
        key: "_handleMouseUp",
        value: function _handleMouseUp(event) {
            console.assert(event.button === 0);
            console.assert(this._mouseIsDown);
            if (!this._mouseIsDown) return;

            this._element.classList.remove("dragging-tab");

            if (!this._tabAnimatedClosedSinceMouseEnter) {
                this._element.classList.remove("static-layout");
                this._clearTabBarItemSizesAndPositions();
            } else {
                var left = 0;
                var _iteratorNormalCompletion9 = true;
                var _didIteratorError9 = false;
                var _iteratorError9 = undefined;

                try {
                    for (var _iterator9 = this._tabBarItems[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                        var tabBarItem = _step9.value;

                        if (tabBarItem === this._selectedTabBarItem) tabBarItem.element.style.left = left + "px";
                        left += parseFloat(tabBarItem.element.style.width);
                    }
                } catch (err) {
                    _didIteratorError9 = true;
                    _iteratorError9 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion9 && _iterator9["return"]) {
                            _iterator9["return"]();
                        }
                    } finally {
                        if (_didIteratorError9) {
                            throw _iteratorError9;
                        }
                    }
                }
            }

            this._mouseIsDown = false;
            this._mouseOffset = undefined;

            document.removeEventListener("mousemove", this._mouseMovedEventListener, true);
            document.removeEventListener("mouseup", this._mouseUpEventListener, true);

            this._mouseMovedEventListener = null;
            this._mouseUpEventListener = null;

            event.preventDefault();
            event.stopPropagation();

            this.dispatchEventToListeners(WebInspector.TabBar.Event.TabBarItemsReordered);
        }
    }, {
        key: "_handleMouseLeave",
        value: function _handleMouseLeave(event) {
            if (this._mouseIsDown || !this._tabAnimatedClosedSinceMouseEnter || !this._element.classList.contains("static-layout") || this._element.classList.contains("animating")) return;

            // This event can still fire when the mouse is inside the element if DOM nodes are added, removed or generally change inside.
            // Check if the mouse really did leave the element by checking the bounds.
            // FIXME: Is this a WebKit bug or correct behavior?
            var barRect = this._element.getBoundingClientRect();
            var newTabItemRect = this._newTabItem ? this._newTabItem.element.getBoundingClientRect() : null;
            if (event.pageY > barRect.top && event.pageY < barRect.bottom && event.pageX > barRect.left && event.pageX < (newTabItemRect ? newTabItemRect.right : barRect.right)) return;

            this._finishExpandingTabsAfterClose();
        }
    }, {
        key: "_handleNewTabClick",
        value: function _handleNewTabClick(event) {
            if (this._newTabItem.disabled) return;
            this.dispatchEventToListeners(WebInspector.TabBar.Event.NewTabItemClicked);
        }
    }, {
        key: "_handleNewTabMouseEnter",
        value: function _handleNewTabMouseEnter(event) {
            if (!this._tabAnimatedClosedSinceMouseEnter || !this._element.classList.contains("static-layout") || this._element.classList.contains("animating")) return;

            this._finishExpandingTabsAfterClose();
        }
    }, {
        key: "newTabItem",
        get: function get() {
            return this._newTabItem || null;
        },
        set: function set(newTabItem) {
            if (!this._handleNewTabClickListener) this._handleNewTabClickListener = this._handleNewTabClick.bind(this);

            if (!this._handleNewTabMouseEnterListener) this._handleNewTabMouseEnterListener = this._handleNewTabMouseEnter.bind(this);

            if (this._newTabItem) {
                this._newTabItem.element.classList.remove("new-tab-button");
                this._newTabItem.element.removeEventListener("click", this._handleNewTabClickListener);
                this._newTabItem.element.removeEventListener("mouseenter", this._handleNewTabMouseEnterListener);
                this.removeTabBarItem(this._newTabItem, true);
            }

            if (newTabItem) {
                newTabItem.element.classList.add("new-tab-button");
                newTabItem.element.addEventListener("click", this._handleNewTabClickListener);
                newTabItem.element.addEventListener("mouseenter", this._handleNewTabMouseEnterListener);
                this.addTabBarItem(newTabItem, true);
            }

            this._newTabItem = newTabItem || null;
        }
    }, {
        key: "selectedTabBarItem",
        get: function get() {
            return this._selectedTabBarItem;
        },
        set: function set(tabBarItemOrIndex) {
            var tabBarItem = this._findTabBarItem(tabBarItemOrIndex);
            if (tabBarItem === this._newTabItem) tabBarItem = this._tabBarItems[this._tabBarItems.length - 2];

            if (this._selectedTabBarItem === tabBarItem) return;

            if (this._selectedTabBarItem) this._selectedTabBarItem.selected = false;

            this._selectedTabBarItem = tabBarItem || null;

            if (this._selectedTabBarItem) this._selectedTabBarItem.selected = true;

            this.dispatchEventToListeners(WebInspector.TabBar.Event.TabBarItemSelected);
        }
    }, {
        key: "tabBarItems",
        get: function get() {
            return this._tabBarItems;
        }
    }, {
        key: "element",
        get: function get() {
            return this._element;
        }
    }]);

    return TabBar;
})(WebInspector.Object);

WebInspector.TabBar.Event = {
    TabBarItemSelected: "tab-bar-tab-bar-item-selected",
    TabBarItemAdded: "tab-bar-tab-bar-item-added",
    TabBarItemRemoved: "tab-bar-tab-bar-item-removed",
    TabBarItemsReordered: "tab-bar-tab-bar-items-reordered",
    NewTabItemClicked: "tab-bar-new-tab-item-clicked",
    OpenDefaultTab: "tab-bar-open-default-tab"
};
