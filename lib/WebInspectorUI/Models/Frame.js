var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

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

WebInspector.Frame = (function (_WebInspector$Object) {
    _inherits(Frame, _WebInspector$Object);

    function Frame(id, name, securityOrigin, loaderIdentifier, mainResource) {
        _classCallCheck(this, Frame);

        _get(Object.getPrototypeOf(Frame.prototype), "constructor", this).call(this);

        console.assert(id);

        this._id = id;

        this._name = null;
        this._securityOrigin = null;

        this._resourceCollection = new WebInspector.ResourceCollection();
        this._provisionalResourceCollection = new WebInspector.ResourceCollection();

        this._childFrames = [];
        this._childFrameIdentifierMap = {};

        this._parentFrame = null;
        this._isMainFrame = false;

        this._domContentReadyEventTimestamp = NaN;
        this._loadEventTimestamp = NaN;

        this._executionContextList = new WebInspector.ExecutionContextList();

        this.initialize(name, securityOrigin, loaderIdentifier, mainResource);
    }

    // Public

    _createClass(Frame, [{
        key: "initialize",
        value: function initialize(name, securityOrigin, loaderIdentifier, mainResource) {
            console.assert(loaderIdentifier);
            console.assert(mainResource);

            var oldName = this._name;
            var oldSecurityOrigin = this._securityOrigin;
            var oldMainResource = this._mainResource;

            this._name = name || null;
            this._securityOrigin = securityOrigin || null;
            this._loaderIdentifier = loaderIdentifier || null;

            this._mainResource = mainResource;
            this._mainResource._parentFrame = this;

            if (oldMainResource && this._mainResource !== oldMainResource) this._disassociateWithResource(oldMainResource);

            this.removeAllResources();
            this.removeAllChildFrames();
            this.clearExecutionContexts();
            this.clearProvisionalLoad();

            if (this._mainResource !== oldMainResource) this._dispatchMainResourceDidChangeEvent(oldMainResource);

            if (this._securityOrigin !== oldSecurityOrigin) this.dispatchEventToListeners(WebInspector.Frame.Event.SecurityOriginDidChange, { oldSecurityOrigin: oldSecurityOrigin });

            if (this._name !== oldName) this.dispatchEventToListeners(WebInspector.Frame.Event.NameDidChange, { oldName: oldName });
        }
    }, {
        key: "startProvisionalLoad",
        value: function startProvisionalLoad(provisionalMainResource) {
            console.assert(provisionalMainResource);

            this._provisionalMainResource = provisionalMainResource;
            this._provisionalMainResource._parentFrame = this;

            this._provisionalLoaderIdentifier = provisionalMainResource.loaderIdentifier;

            this._provisionalResourceCollection.removeAllResources();

            this.dispatchEventToListeners(WebInspector.Frame.Event.ProvisionalLoadStarted);
        }
    }, {
        key: "commitProvisionalLoad",
        value: function commitProvisionalLoad(securityOrigin) {
            console.assert(this._provisionalMainResource);
            console.assert(this._provisionalLoaderIdentifier);
            if (!this._provisionalLoaderIdentifier) return;

            var oldSecurityOrigin = this._securityOrigin;
            var oldMainResource = this._mainResource;

            this._securityOrigin = securityOrigin || null;
            this._loaderIdentifier = this._provisionalLoaderIdentifier;
            this._mainResource = this._provisionalMainResource;

            this._domContentReadyEventTimestamp = NaN;
            this._loadEventTimestamp = NaN;

            if (oldMainResource && this._mainResource !== oldMainResource) this._disassociateWithResource(oldMainResource);

            this.removeAllResources();

            this._resourceCollection = this._provisionalResourceCollection;
            this._provisionalResourceCollection = new WebInspector.ResourceCollection();

            this.clearExecutionContexts(true);
            this.clearProvisionalLoad(true);
            this.removeAllChildFrames();

            this.dispatchEventToListeners(WebInspector.Frame.Event.ProvisionalLoadCommitted);

            if (this._mainResource !== oldMainResource) this._dispatchMainResourceDidChangeEvent(oldMainResource);

            if (this._securityOrigin !== oldSecurityOrigin) this.dispatchEventToListeners(WebInspector.Frame.Event.SecurityOriginDidChange, { oldSecurityOrigin: oldSecurityOrigin });
        }
    }, {
        key: "clearProvisionalLoad",
        value: function clearProvisionalLoad(skipProvisionalLoadClearedEvent) {
            if (!this._provisionalLoaderIdentifier) return;

            this._provisionalLoaderIdentifier = null;
            this._provisionalMainResource = null;
            this._provisionalResourceCollection.removeAllResources();

            if (!skipProvisionalLoadClearedEvent) this.dispatchEventToListeners(WebInspector.Frame.Event.ProvisionalLoadCleared);
        }
    }, {
        key: "clearExecutionContexts",
        value: function clearExecutionContexts(committingProvisionalLoad) {
            if (this._executionContextList.contexts.length) {
                this._executionContextList.clear();
                this.dispatchEventToListeners(WebInspector.Frame.Event.ExecutionContextsCleared, { committingProvisionalLoad: !!committingProvisionalLoad });
            }
        }
    }, {
        key: "addExecutionContext",
        value: function addExecutionContext(context) {
            var changedPageContext = this._executionContextList.add(context);

            if (changedPageContext) this.dispatchEventToListeners(WebInspector.Frame.Event.PageExecutionContextChanged);
        }
    }, {
        key: "isMainFrame",
        value: function isMainFrame() {
            return this._isMainFrame;
        }
    }, {
        key: "markAsMainFrame",
        value: function markAsMainFrame() {
            this._isMainFrame = true;
        }
    }, {
        key: "unmarkAsMainFrame",
        value: function unmarkAsMainFrame() {
            this._isMainFrame = false;
        }
    }, {
        key: "markDOMContentReadyEvent",
        value: function markDOMContentReadyEvent(timestamp) {
            this._domContentReadyEventTimestamp = timestamp || NaN;
        }
    }, {
        key: "markLoadEvent",
        value: function markLoadEvent(timestamp) {
            this._loadEventTimestamp = timestamp || NaN;
        }
    }, {
        key: "isDetached",
        value: function isDetached() {
            var frame = this;
            while (frame) {
                if (frame.isMainFrame()) return false;
                frame = frame.parentFrame;
            }

            return true;
        }
    }, {
        key: "childFrameForIdentifier",
        value: function childFrameForIdentifier(frameId) {
            return this._childFrameIdentifierMap[frameId] || null;
        }
    }, {
        key: "addChildFrame",
        value: function addChildFrame(frame) {
            console.assert(frame instanceof WebInspector.Frame);
            if (!(frame instanceof WebInspector.Frame)) return;

            if (frame._parentFrame === this) return;

            if (frame._parentFrame) frame._parentFrame.removeChildFrame(frame);

            this._childFrames.push(frame);
            this._childFrameIdentifierMap[frame._id] = frame;

            frame._parentFrame = this;

            this.dispatchEventToListeners(WebInspector.Frame.Event.ChildFrameWasAdded, { childFrame: frame });
        }
    }, {
        key: "removeChildFrame",
        value: function removeChildFrame(frameOrFrameId) {
            console.assert(frameOrFrameId);

            if (frameOrFrameId instanceof WebInspector.Frame) var childFrameId = frameOrFrameId._id;else var childFrameId = frameOrFrameId;

            // Fetch the frame by id even if we were passed a WebInspector.Frame.
            // We do this incase the WebInspector.Frame is a new object that isn't in _childFrames,
            // but the id is a valid child frame.
            var childFrame = this.childFrameForIdentifier(childFrameId);
            console.assert(childFrame instanceof WebInspector.Frame);
            if (!(childFrame instanceof WebInspector.Frame)) return;

            console.assert(childFrame.parentFrame === this);

            this._childFrames.remove(childFrame);
            delete this._childFrameIdentifierMap[childFrame._id];

            childFrame._detachFromParentFrame();

            this.dispatchEventToListeners(WebInspector.Frame.Event.ChildFrameWasRemoved, { childFrame: childFrame });
        }
    }, {
        key: "removeAllChildFrames",
        value: function removeAllChildFrames() {
            this._detachFromParentFrame();

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._childFrames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var childFrame = _step.value;

                    childFrame.removeAllChildFrames();
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

            this._childFrames = [];
            this._childFrameIdentifierMap = {};

            this.dispatchEventToListeners(WebInspector.Frame.Event.AllChildFramesRemoved);
        }
    }, {
        key: "resourceForURL",
        value: function resourceForURL(url, recursivelySearchChildFrames) {
            var resource = this._resourceCollection.resourceForURL(url);
            if (resource) return resource;

            // Check the main resources of the child frames for the requested URL.
            for (var i = 0; i < this._childFrames.length; ++i) {
                resource = this._childFrames[i].mainResource;
                if (resource.url === url) return resource;
            }

            if (!recursivelySearchChildFrames) return null;

            // Recursively search resources of child frames.
            for (var i = 0; i < this._childFrames.length; ++i) {
                resource = this._childFrames[i].resourceForURL(url, true);
                if (resource) return resource;
            }

            return null;
        }
    }, {
        key: "resourcesWithType",
        value: function resourcesWithType(type) {
            return this._resourceCollection.resourcesWithType(type);
        }
    }, {
        key: "addResource",
        value: function addResource(resource) {
            console.assert(resource instanceof WebInspector.Resource);
            if (!(resource instanceof WebInspector.Resource)) return;

            if (resource.parentFrame === this) return;

            if (resource.parentFrame) resource.parentFrame.removeResource(resource);

            this._associateWithResource(resource);

            if (this._isProvisionalResource(resource)) {
                this._provisionalResourceCollection.addResource(resource);
                this.dispatchEventToListeners(WebInspector.Frame.Event.ProvisionalResourceWasAdded, { resource: resource });
            } else {
                this._resourceCollection.addResource(resource);
                this.dispatchEventToListeners(WebInspector.Frame.Event.ResourceWasAdded, { resource: resource });
            }
        }
    }, {
        key: "removeResource",
        value: function removeResource(resourceOrURL) {
            // This does not remove provisional resources.

            var resource = this._resourceCollection.removeResource(resourceOrURL);
            if (!resource) return;

            this._disassociateWithResource(resource);

            this.dispatchEventToListeners(WebInspector.Frame.Event.ResourceWasRemoved, { resource: resource });
        }
    }, {
        key: "removeAllResources",
        value: function removeAllResources() {
            // This does not remove provisional resources, use clearProvisionalLoad for that.

            var resources = this.resources;
            if (!resources.length) return;

            for (var i = 0; i < resources.length; ++i) this._disassociateWithResource(resources[i]);

            this._resourceCollection.removeAllResources();

            this.dispatchEventToListeners(WebInspector.Frame.Event.AllResourcesRemoved);
        }
    }, {
        key: "saveIdentityToCookie",
        value: function saveIdentityToCookie(cookie) {
            cookie[WebInspector.Frame.MainResourceURLCookieKey] = this.mainResource.url.hash;
            cookie[WebInspector.Frame.IsMainFrameCookieKey] = this._isMainFrame;
        }

        // Private

    }, {
        key: "_detachFromParentFrame",
        value: function _detachFromParentFrame() {
            if (this._domTree) {
                this._domTree.disconnect();
                this._domTree = null;
            }

            this._parentFrame = null;
        }
    }, {
        key: "_isProvisionalResource",
        value: function _isProvisionalResource(resource) {
            return resource.loaderIdentifier && this._provisionalLoaderIdentifier && resource.loaderIdentifier === this._provisionalLoaderIdentifier;
        }
    }, {
        key: "_associateWithResource",
        value: function _associateWithResource(resource) {
            console.assert(!resource._parentFrame);
            if (resource._parentFrame) return;

            resource._parentFrame = this;
        }
    }, {
        key: "_disassociateWithResource",
        value: function _disassociateWithResource(resource) {
            console.assert(resource.parentFrame === this);
            if (resource.parentFrame !== this) return;

            resource._parentFrame = null;
        }
    }, {
        key: "_dispatchMainResourceDidChangeEvent",
        value: function _dispatchMainResourceDidChangeEvent(oldMainResource) {
            this.dispatchEventToListeners(WebInspector.Frame.Event.MainResourceDidChange, { oldMainResource: oldMainResource });
        }
    }, {
        key: "id",
        get: function get() {
            return this._id;
        }
    }, {
        key: "loaderIdentifier",
        get: function get() {
            return this._loaderIdentifier;
        }
    }, {
        key: "provisionalLoaderIdentifier",
        get: function get() {
            return this._provisionalLoaderIdentifier;
        }
    }, {
        key: "name",
        get: function get() {
            return this._name;
        }
    }, {
        key: "securityOrigin",
        get: function get() {
            return this._securityOrigin;
        }
    }, {
        key: "url",
        get: function get() {
            return this._mainResource._url;
        }
    }, {
        key: "domTree",
        get: function get() {
            if (!this._domTree) this._domTree = new WebInspector.DOMTree(this);
            return this._domTree;
        }
    }, {
        key: "pageExecutionContext",
        get: function get() {
            return this._executionContextList.pageExecutionContext;
        }
    }, {
        key: "executionContextList",
        get: function get() {
            return this._executionContextList;
        }
    }, {
        key: "mainResource",
        get: function get() {
            return this._mainResource;
        }
    }, {
        key: "provisionalMainResource",
        get: function get() {
            return this._provisionalMainResource;
        }
    }, {
        key: "parentFrame",
        get: function get() {
            return this._parentFrame;
        }
    }, {
        key: "childFrames",
        get: function get() {
            return this._childFrames;
        }
    }, {
        key: "domContentReadyEventTimestamp",
        get: function get() {
            return this._domContentReadyEventTimestamp;
        }
    }, {
        key: "loadEventTimestamp",
        get: function get() {
            return this._loadEventTimestamp;
        }
    }, {
        key: "resources",
        get: function get() {
            return this._resourceCollection.resources;
        }
    }]);

    return Frame;
})(WebInspector.Object);

WebInspector.Frame.Event = {
    NameDidChange: "frame-name-did-change",
    SecurityOriginDidChange: "frame-security-origin-did-change",
    MainResourceDidChange: "frame-main-resource-did-change",
    ProvisionalLoadStarted: "frame-provisional-load-started",
    ProvisionalLoadCommitted: "frame-provisional-load-committed",
    ProvisionalLoadCleared: "frame-provisional-load-cleared",
    ProvisionalResourceWasAdded: "frame-provisional-resource-was-added",
    ResourceWasAdded: "frame-resource-was-added",
    ResourceWasRemoved: "frame-resource-was-removed",
    AllResourcesRemoved: "frame-all-resources-removed",
    ChildFrameWasAdded: "frame-child-frame-was-added",
    ChildFrameWasRemoved: "frame-child-frame-was-removed",
    AllChildFramesRemoved: "frame-all-child-frames-removed",
    PageExecutionContextChanged: "frame-page-execution-context-changed",
    ExecutionContextsCleared: "frame-execution-contexts-cleared"
};

WebInspector.Frame.TypeIdentifier = "Frame";
WebInspector.Frame.MainResourceURLCookieKey = "frame-main-resource-url";
WebInspector.Frame.IsMainFrameCookieKey = "frame-is-main-frame";
