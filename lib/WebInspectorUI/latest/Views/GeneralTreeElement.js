var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

WebInspector.GeneralTreeElement = (function (_WebInspector$TreeElement) {
    _inherits(GeneralTreeElement, _WebInspector$TreeElement);

    function GeneralTreeElement(classNames, title, subtitle, representedObject, hasChildren) {
        _classCallCheck(this, GeneralTreeElement);

        _get(Object.getPrototypeOf(GeneralTreeElement.prototype), "constructor", this).call(this, "", representedObject, hasChildren);

        this.classNames = classNames;

        this._tooltipHandledSeparately = false;
        this._mainTitle = title || "";
        this._subtitle = subtitle || "";
        this._status = "";
    }

    // Public

    _createClass(GeneralTreeElement, [{
        key: "addClassName",
        value: function addClassName(className) {
            if (this._classNames.includes(className)) return;

            this._classNames.push(className);

            if (this._listItemNode) this._listItemNode.classList.add(className);
        }
    }, {
        key: "removeClassName",
        value: function removeClassName(className) {
            if (!this._classNames.includes(className)) return;

            this._classNames.remove(className);

            if (this._listItemNode) this._listItemNode.classList.remove(className);
        }
    }, {
        key: "isEventWithinDisclosureTriangle",

        // Overrides from TreeElement (Private)

        value: function isEventWithinDisclosureTriangle(event) {
            return event.target === this._disclosureButton;
        }
    }, {
        key: "onattach",
        value: function onattach() {
            var _listItemNode$classList;

            this._createElementsIfNeeded();
            this._updateTitleElements();

            this._listItemNode.classList.add("item");

            if (this._classNames) (_listItemNode$classList = this._listItemNode.classList).add.apply(_listItemNode$classList, _toConsumableArray(this._classNames));

            if (this._small) this._listItemNode.classList.add(WebInspector.GeneralTreeElement.SmallStyleClassName);

            if (this._twoLine) this._listItemNode.classList.add(WebInspector.GeneralTreeElement.TwoLineStyleClassName);

            this._listItemNode.appendChild(this._disclosureButton);
            this._listItemNode.appendChild(this._iconElement);
            if (this._statusElement) this._listItemNode.appendChild(this._statusElement);
            this._listItemNode.appendChild(this._titlesElement);

            if (this.oncontextmenu && typeof this.oncontextmenu === "function") {
                this._boundContextMenuEventHandler = this.oncontextmenu.bind(this);
                this._listItemNode.addEventListener("contextmenu", this._boundContextMenuEventHandler);
            }

            if (!this._boundContextMenuEventHandler && this.treeOutline.oncontextmenu && typeof this.treeOutline.oncontextmenu === "function") {
                this._boundContextMenuEventHandler = (function (event) {
                    this.treeOutline.oncontextmenu(event, this);
                }).bind(this);
                this._listItemNode.addEventListener("contextmenu", this._boundContextMenuEventHandler);
            }
        }
    }, {
        key: "ondetach",
        value: function ondetach() {
            if (this._boundContextMenuEventHandler) {
                this._listItemNode.removeEventListener("contextmenu", this._boundContextMenuEventHandler);
                delete this._boundContextMenuEventHandler;
            }
        }
    }, {
        key: "onreveal",
        value: function onreveal() {
            if (this._listItemNode) this._listItemNode.scrollIntoViewIfNeeded(false);
        }

        // Protected

    }, {
        key: "callFirstAncestorFunction",
        value: function callFirstAncestorFunction(functionName, args) {
            // Call the first ancestor that implements a function named functionName (if any).
            var currentNode = this.parent;
            while (currentNode) {
                if (typeof currentNode[functionName] === "function") {
                    currentNode[functionName].apply(currentNode, args);
                    break;
                }

                currentNode = currentNode.parent;
            }
        }

        // Private

    }, {
        key: "_createElementsIfNeeded",
        value: function _createElementsIfNeeded() {
            if (this._createdElements) return;

            this._disclosureButton = document.createElement("button");
            this._disclosureButton.className = WebInspector.GeneralTreeElement.DisclosureButtonStyleClassName;

            // Don't allow the disclosure button to be keyboard focusable. The TreeOutline is focusable and has
            // its own keybindings for toggling expand and collapse.
            this._disclosureButton.tabIndex = -1;

            this._iconElement = document.createElement("img");
            this._iconElement.className = WebInspector.GeneralTreeElement.IconElementStyleClassName;

            this._titlesElement = document.createElement("div");
            this._titlesElement.className = WebInspector.GeneralTreeElement.TitlesElementStyleClassName;

            this._mainTitleElement = document.createElement("span");
            this._mainTitleElement.className = WebInspector.GeneralTreeElement.MainTitleElementStyleClassName;
            this._titlesElement.appendChild(this._mainTitleElement);

            this._createdElements = true;
        }
    }, {
        key: "_createSubtitleElementIfNeeded",
        value: function _createSubtitleElementIfNeeded() {
            if (this._subtitleElement) return;

            this._subtitleElement = document.createElement("span");
            this._subtitleElement.className = WebInspector.GeneralTreeElement.SubtitleElementStyleClassName;
            this._titlesElement.appendChild(this._subtitleElement);
        }
    }, {
        key: "_updateTitleElements",
        value: function _updateTitleElements() {
            if (!this._createdElements) return;

            if (typeof this._mainTitle === "string") {
                if (this._mainTitleElement.textContent !== this._mainTitle) this._mainTitleElement.textContent = this._mainTitle;
            } else if (this._mainTitle instanceof Node) {
                this._mainTitleElement.removeChildren();
                this._mainTitleElement.appendChild(this._mainTitle);
            }

            if (typeof this._subtitle === "string" && this._subtitle) {
                this._createSubtitleElementIfNeeded();
                if (this._subtitleElement.textContent !== this._subtitle) this._subtitleElement.textContent = this._subtitle;
                this._titlesElement.classList.remove(WebInspector.GeneralTreeElement.NoSubtitleStyleClassName);
            } else if (this._subtitle instanceof Node) {
                this._createSubtitleElementIfNeeded();
                this._subtitleElement.removeChildren();
                this._subtitleElement.appendChild(this._subtitle);
            } else {
                if (this._subtitleElement) this._subtitleElement.textContent = "";
                this._titlesElement.classList.add(WebInspector.GeneralTreeElement.NoSubtitleStyleClassName);
            }

            // Set a default tooltip if there isn't a custom one already assigned.
            if (!this.tooltip && !this._tooltipHandledSeparately) this._updateTitleTooltip();
        }
    }, {
        key: "_updateTitleTooltip",
        value: function _updateTitleTooltip() {
            console.assert(this._listItemNode);
            if (!this._listItemNode) return;

            // Get the textContent for the elements since they can contain other nodes,
            // and the tool tip only cares about the text.
            var mainTitleText = this._mainTitleElement.textContent;
            var subtitleText = this._subtitleElement ? this._subtitleElement.textContent : "";
            if (mainTitleText && subtitleText) this._listItemNode.title = mainTitleText + (this._small && !this._twoLine ? " — " : "\n") + subtitleText;else if (mainTitleText) this._listItemNode.title = mainTitleText;else this._listItemNode.title = subtitleText;
        }
    }, {
        key: "_updateStatusElement",
        value: function _updateStatusElement() {
            if (!this._statusElement) return;

            if (!this._statusElement.parentNode && this._listItemNode) this._listItemNode.insertBefore(this._statusElement, this._titlesElement);

            if (this._status instanceof Node) {
                this._statusElement.removeChildren();
                this._statusElement.appendChild(this._status);
            } else this._statusElement.textContent = this._status;
        }
    }, {
        key: "element",
        get: function get() {
            return this._listItemNode;
        }
    }, {
        key: "iconElement",
        get: function get() {
            this._createElementsIfNeeded();
            return this._iconElement;
        }
    }, {
        key: "titlesElement",
        get: function get() {
            this._createElementsIfNeeded();
            return this._titlesElement;
        }
    }, {
        key: "mainTitleElement",
        get: function get() {
            this._createElementsIfNeeded();
            return this._mainTitleElement;
        }
    }, {
        key: "subtitleElement",
        get: function get() {
            this._createElementsIfNeeded();
            this._createSubtitleElementIfNeeded();
            return this._subtitleElement;
        }
    }, {
        key: "classNames",
        get: function get() {
            return this._classNames;
        },
        set: function set(x) {
            if (this._listItemNode && this._classNames) {
                var _listItemNode$classList2;

                (_listItemNode$classList2 = this._listItemNode.classList).remove.apply(_listItemNode$classList2, _toConsumableArray(this._classNames));
            }

            if (typeof x === "string") x = [x];

            this._classNames = x || [];

            if (this._listItemNode) {
                var _listItemNode$classList3;

                (_listItemNode$classList3 = this._listItemNode.classList).add.apply(_listItemNode$classList3, _toConsumableArray(this._classNames));
            }
        }
    }, {
        key: "small",
        get: function get() {
            return this._small;
        },
        set: function set(x) {
            this._small = x;

            if (this._listItemNode) {
                if (this._small) this._listItemNode.classList.add(WebInspector.GeneralTreeElement.SmallStyleClassName);else this._listItemNode.classList.remove(WebInspector.GeneralTreeElement.SmallStyleClassName);
            }
        }
    }, {
        key: "twoLine",
        get: function get() {
            return this._twoLine;
        },
        set: function set(x) {
            this._twoLine = x;

            if (this._listItemNode) {
                if (this._twoLine) this._listItemNode.classList.add(WebInspector.GeneralTreeElement.TwoLineStyleClassName);else this._listItemNode.classList.remove(WebInspector.GeneralTreeElement.TwoLineStyleClassName);
            }
        }
    }, {
        key: "mainTitle",
        get: function get() {
            return this._mainTitle;
        },
        set: function set(x) {
            this._mainTitle = x || "";
            this._updateTitleElements();
            this.didChange();
            this.dispatchEventToListeners(WebInspector.GeneralTreeElement.Event.MainTitleDidChange);
        }
    }, {
        key: "subtitle",
        get: function get() {
            return this._subtitle;
        },
        set: function set(x) {
            this._subtitle = x || "";
            this._updateTitleElements();
            this.didChange();
        }
    }, {
        key: "status",
        get: function get() {
            return this._status;
        },
        set: function set(x) {
            if (this._status === x) return;

            if (!this._statusElement) {
                this._statusElement = document.createElement("div");
                this._statusElement.className = WebInspector.GeneralTreeElement.StatusElementStyleClassName;
            }

            this._status = x || "";
            this._updateStatusElement();
            this.didChange();
        }
    }, {
        key: "filterableData",
        get: function get() {
            return { text: [this.mainTitle, this.subtitle] };
        }
    }, {
        key: "tooltipHandledSeparately",
        get: function get() {
            return this._tooltipHandledSeparately;
        },
        set: function set(x) {
            this._tooltipHandledSeparately = x || false;
        }
    }]);

    return GeneralTreeElement;
})(WebInspector.TreeElement);

WebInspector.GeneralTreeElement.DisclosureButtonStyleClassName = "disclosure-button";
WebInspector.GeneralTreeElement.IconElementStyleClassName = "icon";
WebInspector.GeneralTreeElement.StatusElementStyleClassName = "status";
WebInspector.GeneralTreeElement.TitlesElementStyleClassName = "titles";
WebInspector.GeneralTreeElement.MainTitleElementStyleClassName = "title";
WebInspector.GeneralTreeElement.SubtitleElementStyleClassName = "subtitle";
WebInspector.GeneralTreeElement.NoSubtitleStyleClassName = "no-subtitle";
WebInspector.GeneralTreeElement.SmallStyleClassName = "small";
WebInspector.GeneralTreeElement.TwoLineStyleClassName = "two-line";

WebInspector.GeneralTreeElement.Event = {
    MainTitleDidChange: "general-tree-element-main-title-did-change"
};
