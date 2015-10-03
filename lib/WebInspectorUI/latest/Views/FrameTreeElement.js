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

WebInspector.FrameTreeElement = (function (_WebInspector$ResourceTreeElement) {
    _inherits(FrameTreeElement, _WebInspector$ResourceTreeElement);

    function FrameTreeElement(frame, representedObject) {
        _classCallCheck(this, FrameTreeElement);

        console.assert(frame instanceof WebInspector.Frame);

        _get(Object.getPrototypeOf(FrameTreeElement.prototype), "constructor", this).call(this, frame.mainResource, representedObject || frame);

        this._frame = frame;

        this._updateExpandedSetting();

        frame.addEventListener(WebInspector.Frame.Event.MainResourceDidChange, this._mainResourceDidChange, this);
        frame.addEventListener(WebInspector.Frame.Event.ResourceWasAdded, this._resourceWasAdded, this);
        frame.addEventListener(WebInspector.Frame.Event.ResourceWasRemoved, this._resourceWasRemoved, this);
        frame.addEventListener(WebInspector.Frame.Event.ChildFrameWasAdded, this._childFrameWasAdded, this);
        frame.addEventListener(WebInspector.Frame.Event.ChildFrameWasRemoved, this._childFrameWasRemoved, this);

        frame.domTree.addEventListener(WebInspector.DOMTree.Event.ContentFlowWasAdded, this._childContentFlowWasAdded, this);
        frame.domTree.addEventListener(WebInspector.DOMTree.Event.ContentFlowWasRemoved, this._childContentFlowWasRemoved, this);
        frame.domTree.addEventListener(WebInspector.DOMTree.Event.RootDOMNodeInvalidated, this._rootDOMNodeInvalidated, this);

        if (this._frame.isMainFrame()) this._downloadingPage = false;

        this.shouldRefreshChildren = true;
        this.folderSettingsKey = this._frame.url.hash;

        this.registerFolderizeSettings("frames", WebInspector.UIString("Frames"), function (representedObject) {
            return representedObject instanceof WebInspector.Frame;
        }, (function () {
            return this.frame.childFrames.length;
        }).bind(this), WebInspector.FrameTreeElement);

        this.registerFolderizeSettings("flows", WebInspector.UIString("Flows"), function (representedObject) {
            return representedObject instanceof WebInspector.ContentFlow;
        }, (function () {
            return this.frame.domTree.flowsCount;
        }).bind(this), WebInspector.ContentFlowTreeElement);

        function makeValidateCallback(resourceType) {
            return function (representedObject) {
                return representedObject instanceof WebInspector.Resource && representedObject.type === resourceType;
            };
        }

        function makeChildCountCallback(frame, resourceType) {
            return function () {
                return frame.resourcesWithType(resourceType).length;
            };
        }

        for (var key in WebInspector.Resource.Type) {
            var value = WebInspector.Resource.Type[key];
            var folderName = WebInspector.Resource.displayNameForType(value, true);
            this.registerFolderizeSettings(key, folderName, makeValidateCallback(value), makeChildCountCallback(this.frame, value), WebInspector.ResourceTreeElement);
        }

        this.updateParentStatus();
    }

    // Public

    _createClass(FrameTreeElement, [{
        key: "descendantResourceTreeElementTypeDidChange",
        value: function descendantResourceTreeElementTypeDidChange(resourceTreeElement, oldType) {
            // Called by descendant ResourceTreeElements.

            // Add the tree element again, which will move it to the new location
            // based on sorting and possible folder changes.
            this._addTreeElement(resourceTreeElement);
        }
    }, {
        key: "descendantResourceTreeElementMainTitleDidChange",
        value: function descendantResourceTreeElementMainTitleDidChange(resourceTreeElement, oldMainTitle) {
            // Called by descendant ResourceTreeElements.

            // Add the tree element again, which will move it to the new location
            // based on sorting and possible folder changes.
            this._addTreeElement(resourceTreeElement);
        }

        // Overrides from SourceCodeTreeElement.

    }, {
        key: "updateSourceMapResources",
        value: function updateSourceMapResources() {
            // Frames handle their own SourceMapResources.

            if (!this.treeOutline || !this.treeOutline.includeSourceMapResourceChildren) return;

            if (!this._frame) return;

            this.updateParentStatus();

            if (this.resource && this.resource.sourceMaps.length) this.shouldRefreshChildren = true;
        }
    }, {
        key: "onattach",
        value: function onattach() {
            // Immediate superclasses are skipped, since Frames handle their own SourceMapResources.
            WebInspector.GeneralTreeElement.prototype.onattach.call(this);
        }

        // Overrides from FolderizedTreeElement (Protected).

    }, {
        key: "compareChildTreeElements",
        value: function compareChildTreeElements(a, b) {
            if (a === b) return 0;

            var aIsResource = a instanceof WebInspector.ResourceTreeElement;
            var bIsResource = b instanceof WebInspector.ResourceTreeElement;

            if (aIsResource && bIsResource) return WebInspector.ResourceTreeElement.compareResourceTreeElements(a, b);

            if (!aIsResource && !bIsResource) {
                // When both components are not resources then default to base class comparison.
                return _get(Object.getPrototypeOf(FrameTreeElement.prototype), "compareChildTreeElements", this).call(this, a, b);
            }

            // Non-resources should appear before the resources.
            // FIXME: There should be a better way to group the elements by their type.
            return aIsResource ? 1 : -1;
        }

        // Overrides from TreeElement (Private).

    }, {
        key: "onpopulate",
        value: function onpopulate() {
            if (this.children.length && !this.shouldRefreshChildren) return;
            this.shouldRefreshChildren = false;

            this.removeChildren();
            this.updateParentStatus();
            this.prepareToPopulate();

            for (var i = 0; i < this._frame.childFrames.length; ++i) this.addChildForRepresentedObject(this._frame.childFrames[i]);

            for (var i = 0; i < this._frame.resources.length; ++i) this.addChildForRepresentedObject(this._frame.resources[i]);

            var sourceMaps = this.resource && this.resource.sourceMaps;
            for (var i = 0; i < sourceMaps.length; ++i) {
                var sourceMap = sourceMaps[i];
                for (var j = 0; j < sourceMap.resources.length; ++j) this.addChildForRepresentedObject(sourceMap.resources[j]);
            }

            var flowMap = this._frame.domTree.flowMap;
            for (var flowKey in flowMap) this.addChildForRepresentedObject(flowMap[flowKey]);
        }
    }, {
        key: "onexpand",
        value: function onexpand() {
            this._expandedSetting.value = true;
            this._frame.domTree.requestContentFlowList();
        }
    }, {
        key: "oncollapse",
        value: function oncollapse() {
            // Only store the setting if we have children, since setting hasChildren to false will cause a collapse,
            // and we only care about user triggered collapses.
            if (this.hasChildren) this._expandedSetting.value = false;
        }

        // Private

    }, {
        key: "_updateExpandedSetting",
        value: function _updateExpandedSetting() {
            this._expandedSetting = new WebInspector.Setting("frame-expanded-" + this._frame.url.hash, this._frame.isMainFrame() ? true : false);
            if (this._expandedSetting.value) this.expand();else this.collapse();
        }
    }, {
        key: "_mainResourceDidChange",
        value: function _mainResourceDidChange(event) {
            this._updateResource(this._frame.mainResource);

            this.updateParentStatus();
            this.removeChildren();

            // Change the expanded setting since the frame URL has changed. Do this before setting shouldRefreshChildren, since
            // shouldRefreshChildren will call onpopulate if expanded is true.
            this._updateExpandedSetting();

            this.shouldRefreshChildren = true;
        }
    }, {
        key: "_resourceWasAdded",
        value: function _resourceWasAdded(event) {
            this.addRepresentedObjectToNewChildQueue(event.data.resource);
        }
    }, {
        key: "_resourceWasRemoved",
        value: function _resourceWasRemoved(event) {
            this.removeChildForRepresentedObject(event.data.resource);
        }
    }, {
        key: "_childFrameWasAdded",
        value: function _childFrameWasAdded(event) {
            this.addRepresentedObjectToNewChildQueue(event.data.childFrame);
        }
    }, {
        key: "_childFrameWasRemoved",
        value: function _childFrameWasRemoved(event) {
            this.removeChildForRepresentedObject(event.data.childFrame);
        }
    }, {
        key: "_childContentFlowWasAdded",
        value: function _childContentFlowWasAdded(event) {
            this.addRepresentedObjectToNewChildQueue(event.data.flow);
        }
    }, {
        key: "_childContentFlowWasRemoved",
        value: function _childContentFlowWasRemoved(event) {
            this.removeChildForRepresentedObject(event.data.flow);
        }
    }, {
        key: "_rootDOMNodeInvalidated",
        value: function _rootDOMNodeInvalidated() {
            if (this.expanded) this._frame.domTree.requestContentFlowList();
        }
    }, {
        key: "frame",
        get: function get() {
            return this._frame;
        }
    }]);

    return FrameTreeElement;
})(WebInspector.ResourceTreeElement);
