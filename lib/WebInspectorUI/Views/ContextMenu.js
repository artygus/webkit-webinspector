var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2013, 2015 Apple Inc. All rights reserved.
 * Copyright (C) 2009 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

WebInspector.ContextMenuItem = (function (_WebInspector$Object) {
    _inherits(ContextMenuItem, _WebInspector$Object);

    function ContextMenuItem(topLevelMenu, type, label, disabled, checked) {
        _classCallCheck(this, ContextMenuItem);

        _get(Object.getPrototypeOf(ContextMenuItem.prototype), "constructor", this).call(this);

        this._type = type;
        this._label = label;
        this._disabled = disabled;
        this._checked = checked;
        this._contextMenu = topLevelMenu || this;

        if (type === "item" || type === "checkbox") this._id = topLevelMenu.nextId();
    }

    // Public

    _createClass(ContextMenuItem, [{
        key: "id",
        value: function id() {
            return this._id;
        }
    }, {
        key: "type",
        value: function type() {
            return this._type;
        }
    }, {
        key: "isEnabled",
        value: function isEnabled() {
            return !this._disabled;
        }
    }, {
        key: "setEnabled",
        value: function setEnabled(enabled) {
            this._disabled = !enabled;
        }

        // Private

    }, {
        key: "_buildDescriptor",
        value: function _buildDescriptor() {
            switch (this._type) {
                case "item":
                    return { type: "item", id: this._id, label: this._label, enabled: !this._disabled };
                case "separator":
                    return { type: "separator" };
                case "checkbox":
                    return { type: "checkbox", id: this._id, label: this._label, checked: !!this._checked, enabled: !this._disabled };
            }
        }
    }]);

    return ContextMenuItem;
})(WebInspector.Object);

WebInspector.ContextSubMenuItem = (function (_WebInspector$ContextMenuItem) {
    _inherits(ContextSubMenuItem, _WebInspector$ContextMenuItem);

    function ContextSubMenuItem(topLevelMenu, label, disabled) {
        _classCallCheck(this, ContextSubMenuItem);

        _get(Object.getPrototypeOf(ContextSubMenuItem.prototype), "constructor", this).call(this, topLevelMenu, "subMenu", label, disabled);

        this._items = [];
    }

    // Public

    _createClass(ContextSubMenuItem, [{
        key: "appendItem",
        value: function appendItem(label, handler, disabled) {
            var item = new WebInspector.ContextMenuItem(this._contextMenu, "item", label, disabled);
            this._pushItem(item);
            this._contextMenu._setHandler(item.id(), handler);
            return item;
        }
    }, {
        key: "appendSubMenuItem",
        value: function appendSubMenuItem(label, disabled) {
            var item = new WebInspector.ContextSubMenuItem(this._contextMenu, label, disabled);
            this._pushItem(item);
            return item;
        }
    }, {
        key: "appendCheckboxItem",
        value: function appendCheckboxItem(label, handler, checked, disabled) {
            var item = new WebInspector.ContextMenuItem(this._contextMenu, "checkbox", label, disabled, checked);
            this._pushItem(item);
            this._contextMenu._setHandler(item.id(), handler);
            return item;
        }
    }, {
        key: "appendSeparator",
        value: function appendSeparator() {
            if (this._items.length) this._pendingSeparator = true;
        }
    }, {
        key: "_pushItem",
        value: function _pushItem(item) {
            if (this._pendingSeparator) {
                this._items.push(new WebInspector.ContextMenuItem(this._contextMenu, "separator"));
                delete this._pendingSeparator;
            }
            this._items.push(item);
        }
    }, {
        key: "isEmpty",
        value: function isEmpty() {
            return !this._items.length;
        }
    }, {
        key: "_buildDescriptor",
        value: function _buildDescriptor() {
            var result = { type: "subMenu", label: this._label, enabled: !this._disabled, subItems: [] };
            for (var i = 0; i < this._items.length; ++i) result.subItems.push(this._items[i]._buildDescriptor());
            return result;
        }
    }]);

    return ContextSubMenuItem;
})(WebInspector.ContextMenuItem);

WebInspector.ContextMenu = (function (_WebInspector$ContextSubMenuItem) {
    _inherits(ContextMenu, _WebInspector$ContextSubMenuItem);

    function ContextMenu(event) {
        _classCallCheck(this, ContextMenu);

        _get(Object.getPrototypeOf(ContextMenu.prototype), "constructor", this).call(this, null, "");

        this._event = event;
        this._handlers = {};
        this._id = 0;
    }

    // Static

    _createClass(ContextMenu, [{
        key: "nextId",

        // FIXME: Unfortunately, contextMenuCleared is invoked between show and item selected
        // so we can't delete last menu object from WebInspector. Fix the contract.

        // Public

        value: function nextId() {
            return this._id++;
        }
    }, {
        key: "show",
        value: function show() {
            console.assert(this._event instanceof MouseEvent);

            var menuObject = this._buildDescriptor();

            if (menuObject.length) {
                WebInspector.ContextMenu._lastContextMenu = this;

                if (this._event.type !== "contextmenu" && typeof InspectorFrontendHost.dispatchEventAsContextMenuEvent === "function") {
                    this._menuObject = menuObject;
                    this._event.target.addEventListener("contextmenu", this, true);
                    InspectorFrontendHost.dispatchEventAsContextMenuEvent(this._event);
                } else InspectorFrontendHost.showContextMenu(this._event, menuObject);
            }

            if (this._event) this._event.stopImmediatePropagation();
        }

        // Protected

    }, {
        key: "handleEvent",
        value: function handleEvent(event) {
            this._event.target.removeEventListener("contextmenu", this, true);
            InspectorFrontendHost.showContextMenu(event, this._menuObject);
            delete this._menuObject;

            event.stopImmediatePropagation();
        }

        // Private

    }, {
        key: "_setHandler",
        value: function _setHandler(id, handler) {
            if (handler) this._handlers[id] = handler;
        }
    }, {
        key: "_buildDescriptor",
        value: function _buildDescriptor() {
            var result = [];
            for (var i = 0; i < this._items.length; ++i) result.push(this._items[i]._buildDescriptor());
            return result;
        }
    }, {
        key: "_itemSelected",
        value: function _itemSelected(id) {
            if (this._handlers[id]) this._handlers[id].call(this);
        }
    }], [{
        key: "contextMenuItemSelected",
        value: function contextMenuItemSelected(id) {
            if (WebInspector.ContextMenu._lastContextMenu) WebInspector.ContextMenu._lastContextMenu._itemSelected(id);
        }
    }, {
        key: "contextMenuCleared",
        value: function contextMenuCleared() {}
    }]);

    return ContextMenu;
})(WebInspector.ContextSubMenuItem);
