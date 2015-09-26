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

WebInspector.TreeOutlineDataGridSynchronizer = (function (_WebInspector$Object) {
    _inherits(TreeOutlineDataGridSynchronizer, _WebInspector$Object);

    function TreeOutlineDataGridSynchronizer(treeOutline, dataGrid, delegate) {
        _classCallCheck(this, TreeOutlineDataGridSynchronizer);

        _get(Object.getPrototypeOf(TreeOutlineDataGridSynchronizer.prototype), "constructor", this).call(this);

        this._treeOutline = treeOutline;
        this._dataGrid = dataGrid;
        this._delegate = delegate || null;
        this._enabled = true;

        this._treeOutline.element.parentNode.addEventListener("scroll", this._treeOutlineScrolled.bind(this));
        this._dataGrid.scrollContainer.addEventListener("scroll", this._dataGridScrolled.bind(this));

        this._treeOutline.__dataGridNode = this._dataGrid;

        this._dataGrid.addEventListener(WebInspector.DataGrid.Event.ExpandedNode, this._dataGridNodeExpanded, this);
        this._dataGrid.addEventListener(WebInspector.DataGrid.Event.CollapsedNode, this._dataGridNodeCollapsed, this);
        this._dataGrid.addEventListener(WebInspector.DataGrid.Event.SelectedNodeChanged, this._dataGridNodeSelected, this);

        this._dataGrid.element.addEventListener("focus", this._dataGridGainedFocus.bind(this));
        this._dataGrid.element.addEventListener("blur", this._dataGridLostFocus.bind(this));

        this._treeOutline.element.addEventListener("focus", this._treeOutlineGainedFocus.bind(this));
        this._treeOutline.element.addEventListener("blur", this._treeOutlineLostFocus.bind(this));

        // FIXME: This is a hack. TreeOutline should just dispatch events via WebInspector.Object.
        var existingOnAdd = treeOutline.onadd;
        var existingOnRemove = treeOutline.onremove;
        var existingOnExpand = treeOutline.onexpand;
        var existingOnCollapse = treeOutline.oncollapse;
        var existingOnHidden = treeOutline.onhidden;
        var existingOnSelect = treeOutline.onselect;

        treeOutline.onadd = (function (element) {
            this._treeElementAdded(element);
            if (existingOnAdd) existingOnAdd.call(treeOutline, element);
        }).bind(this);

        treeOutline.onremove = (function (element) {
            this._treeElementRemoved(element);
            if (existingOnRemove) existingOnRemove.call(treeOutline, element);
        }).bind(this);

        treeOutline.onexpand = (function (element) {
            this._treeElementExpanded(element);
            if (existingOnExpand) existingOnExpand.call(treeOutline, element);
        }).bind(this);

        treeOutline.oncollapse = (function (element) {
            this._treeElementCollapsed(element);
            if (existingOnCollapse) existingOnCollapse.call(treeOutline, element);
        }).bind(this);

        treeOutline.onhidden = (function (element, hidden) {
            this._treeElementHiddenChanged(element, hidden);
            if (existingOnHidden) existingOnHidden.call(treeOutline, element, hidden);
        }).bind(this);

        treeOutline.onselect = (function (element, selectedByUser) {
            this._treeElementSelected(element, selectedByUser);
            if (existingOnSelect) existingOnSelect.call(treeOutline, element, selectedByUser);
        }).bind(this);
    }

    // Public

    _createClass(TreeOutlineDataGridSynchronizer, [{
        key: "associate",
        value: function associate(treeElement, dataGridNode) {
            console.assert(treeElement);
            console.assert(dataGridNode);

            treeElement.__dataGridNode = dataGridNode;
            dataGridNode.__treeElement = treeElement;
        }
    }, {
        key: "synchronize",
        value: function synchronize() {
            this._dataGrid.scrollContainer.scrollTop = this._treeOutline.element.parentNode.scrollTop;
            if (this._treeOutline.selectedTreeElement) this._treeOutline.selectedTreeElement.__dataGridNode.select(true);else if (this._dataGrid.selectedNode) this._dataGrid.selectedNode.deselect(true);
        }
    }, {
        key: "treeElementForDataGridNode",
        value: function treeElementForDataGridNode(dataGridNode) {
            return dataGridNode.__treeElement || null;
        }
    }, {
        key: "dataGridNodeForTreeElement",
        value: function dataGridNodeForTreeElement(treeElement) {
            if (treeElement.__dataGridNode) return treeElement.__dataGridNode;

            if (typeof this._delegate.dataGridNodeForTreeElement === "function") {
                var dataGridNode = this._delegate.dataGridNodeForTreeElement(treeElement);
                if (dataGridNode) this.associate(treeElement, dataGridNode);
                return dataGridNode;
            }

            return null;
        }

        // Private

    }, {
        key: "_treeOutlineScrolled",
        value: function _treeOutlineScrolled(event) {
            if (!this._enabled) return;

            if (this._ignoreNextTreeOutlineScrollEvent) {
                delete this._ignoreNextTreeOutlineScrollEvent;
                return;
            }

            this._ignoreNextDataGridScrollEvent = true;
            this._dataGrid.scrollContainer.scrollTop = this._treeOutline.element.parentNode.scrollTop;
        }
    }, {
        key: "_dataGridGainedFocus",
        value: function _dataGridGainedFocus(event) {
            this._treeOutline.element.classList.add("force-focus");
        }
    }, {
        key: "_dataGridLostFocus",
        value: function _dataGridLostFocus(event) {
            this._treeOutline.element.classList.remove("force-focus");
        }
    }, {
        key: "_dataGridScrolled",
        value: function _dataGridScrolled(event) {
            if (!this._enabled) return;

            if (this._ignoreNextDataGridScrollEvent) {
                delete this._ignoreNextDataGridScrollEvent;
                return;
            }

            this._ignoreNextTreeOutlineScrollEvent = true;
            this._treeOutline.element.parentNode.scrollTop = this._dataGrid.scrollContainer.scrollTop;
        }
    }, {
        key: "_dataGridNodeSelected",
        value: function _dataGridNodeSelected(event) {
            if (!this._enabled) return;

            var dataGridNode = this._dataGrid.selectedNode;
            if (dataGridNode) dataGridNode.__treeElement.select(true, true, true, true);
        }
    }, {
        key: "_dataGridNodeExpanded",
        value: function _dataGridNodeExpanded(event) {
            if (!this._enabled) return;

            var dataGridNode = event.data.dataGridNode;
            console.assert(dataGridNode);

            if (!dataGridNode.__treeElement.expanded) dataGridNode.__treeElement.expand();
        }
    }, {
        key: "_dataGridNodeCollapsed",
        value: function _dataGridNodeCollapsed(event) {
            if (!this._enabled) return;

            var dataGridNode = event.data.dataGridNode;
            console.assert(dataGridNode);

            if (dataGridNode.__treeElement.expanded) dataGridNode.__treeElement.collapse();
        }
    }, {
        key: "_treeOutlineGainedFocus",
        value: function _treeOutlineGainedFocus(event) {
            this._dataGrid.element.classList.add("force-focus");
        }
    }, {
        key: "_treeOutlineLostFocus",
        value: function _treeOutlineLostFocus(event) {
            this._dataGrid.element.classList.remove("force-focus");
        }
    }, {
        key: "_treeElementSelected",
        value: function _treeElementSelected(treeElement, selectedByUser) {
            if (!this._enabled) return;

            var dataGridNode = treeElement.__dataGridNode;
            console.assert(dataGridNode);

            dataGridNode.select(true);
        }
    }, {
        key: "_treeElementAdded",
        value: function _treeElementAdded(treeElement) {
            if (!this._enabled) return;

            var dataGridNode = this.dataGridNodeForTreeElement(treeElement);
            console.assert(dataGridNode);

            var parentDataGridNode = treeElement.parent.__dataGridNode;
            console.assert(dataGridNode);

            var childIndex = treeElement.parent.children.indexOf(treeElement);
            console.assert(childIndex !== -1);

            parentDataGridNode.insertChild(dataGridNode, childIndex);
        }
    }, {
        key: "_treeElementRemoved",
        value: function _treeElementRemoved(treeElement) {
            if (!this._enabled) return;

            var dataGridNode = treeElement.__dataGridNode;
            console.assert(dataGridNode);

            if (dataGridNode.parent) dataGridNode.parent.removeChild(dataGridNode);
        }
    }, {
        key: "_treeElementExpanded",
        value: function _treeElementExpanded(treeElement) {
            if (!this._enabled) return;

            var dataGridNode = treeElement.__dataGridNode;
            console.assert(dataGridNode);

            if (!dataGridNode.expanded) dataGridNode.expand();
        }
    }, {
        key: "_treeElementCollapsed",
        value: function _treeElementCollapsed(treeElement) {
            if (!this._enabled) return;

            var dataGridNode = treeElement.__dataGridNode;
            console.assert(dataGridNode);

            if (dataGridNode.expanded) dataGridNode.collapse();
        }
    }, {
        key: "_treeElementHiddenChanged",
        value: function _treeElementHiddenChanged(treeElement, hidden) {
            if (!this._enabled) return;

            var dataGridNode = treeElement.__dataGridNode;
            console.assert(dataGridNode);

            dataGridNode.element.classList.toggle("hidden", hidden);
        }
    }, {
        key: "treeOutline",
        get: function get() {
            return this._treeOutline;
        }
    }, {
        key: "dataGrid",
        get: function get() {
            return this._dataGrid;
        }
    }, {
        key: "delegate",
        get: function get() {
            return this._delegate;
        }
    }, {
        key: "enabled",
        get: function get() {
            return this._enabled;
        },
        set: function set(x) {
            this._enabled = x || false;
        }
    }]);

    return TreeOutlineDataGridSynchronizer;
})(WebInspector.Object);
