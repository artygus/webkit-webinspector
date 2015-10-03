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

WebInspector.Frame = function (id, name, securityOrigin, loaderIdentifier, mainResource) {
    WebInspector.Object.call(this);

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
};

WebInspector.Object.addConstructorFunctions(WebInspector.Frame);

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

WebInspector.Frame.prototype = Object.defineProperties({
    constructor: WebInspector.Frame,

    // Public

    initialize: function initialize(name, securityOrigin, loaderIdentifier, mainResource) {
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
    },

    startProvisionalLoad: function startProvisionalLoad(provisionalMainResource) {
        console.assert(provisionalMainResource);

        this._provisionalMainResource = provisionalMainResource;
        this._provisionalMainResource._parentFrame = this;

        this._provisionalLoaderIdentifier = provisionalMainResource.loaderIdentifier;

        this._provisionalResourceCollection.removeAllResources();

        this.dispatchEventToListeners(WebInspector.Frame.Event.ProvisionalLoadStarted);
    },

    commitProvisionalLoad: function commitProvisionalLoad(securityOrigin) {
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
    },

    clearProvisionalLoad: function clearProvisionalLoad(skipProvisionalLoadClearedEvent) {
        if (!this._provisionalLoaderIdentifier) return;

        this._provisionalLoaderIdentifier = null;
        this._provisionalMainResource = null;
        this._provisionalResourceCollection.removeAllResources();

        if (!skipProvisionalLoadClearedEvent) this.dispatchEventToListeners(WebInspector.Frame.Event.ProvisionalLoadCleared);
    },

    clearExecutionContexts: function clearExecutionContexts(committingProvisionalLoad) {
        if (this._executionContextList.contexts.length) {
            this._executionContextList.clear();
            this.dispatchEventToListeners(WebInspector.Frame.Event.ExecutionContextsCleared, { committingProvisionalLoad: !!committingProvisionalLoad });
        }
    },

    addExecutionContext: function addExecutionContext(context) {
        var changedPageContext = this._executionContextList.add(context);

        if (changedPageContext) this.dispatchEventToListeners(WebInspector.Frame.Event.PageExecutionContextChanged);
    },

    isMainFrame: function isMainFrame() {
        return this._isMainFrame;
    },

    markAsMainFrame: function markAsMainFrame() {
        this._isMainFrame = true;
    },

    unmarkAsMainFrame: function unmarkAsMainFrame() {
        this._isMainFrame = false;
    },

    markDOMContentReadyEvent: function markDOMContentReadyEvent(timestamp) {
        this._domContentReadyEventTimestamp = timestamp || NaN;
    },

    markLoadEvent: function markLoadEvent(timestamp) {
        this._loadEventTimestamp = timestamp || NaN;
    },

    isDetached: function isDetached() {
        var frame = this;
        while (frame) {
            if (frame.isMainFrame()) return false;
            frame = frame.parentFrame;
        }

        return true;
    },

    childFrameForIdentifier: function childFrameForIdentifier(frameId) {
        return this._childFrameIdentifierMap[frameId] || null;
    },

    addChildFrame: function addChildFrame(frame) {
        console.assert(frame instanceof WebInspector.Frame);
        if (!(frame instanceof WebInspector.Frame)) return;

        if (frame._parentFrame === this) return;

        if (frame._parentFrame) frame._parentFrame.removeChildFrame(frame);

        this._childFrames.push(frame);
        this._childFrameIdentifierMap[frame._id] = frame;

        frame._parentFrame = this;

        this.dispatchEventToListeners(WebInspector.Frame.Event.ChildFrameWasAdded, { childFrame: frame });
    },

    removeChildFrame: function removeChildFrame(frameOrFrameId) {
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

        childFrame._parentFrame = null;

        this.dispatchEventToListeners(WebInspector.Frame.Event.ChildFrameWasRemoved, { childFrame: childFrame });
    },

    removeAllChildFrames: function removeAllChildFrames() {
        if (!this._childFrames.length) return;

        for (var i = 0; i < this._childFrames.length; ++i) this._childFrames[i]._parentFrame = null;

        this._childFrames = [];
        this._childFrameIdentifierMap = {};

        this.dispatchEventToListeners(WebInspector.Frame.Event.AllChildFramesRemoved);
    },

    resourceForURL: function resourceForURL(url, recursivelySearchChildFrames) {
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
    },

    resourcesWithType: function resourcesWithType(type) {
        return this._resourceCollection.resourcesWithType(type);
    },

    addResource: function addResource(resource) {
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
    },

    removeResource: function removeResource(resourceOrURL) {
        // This does not remove provisional resources.

        var resource = this._resourceCollection.removeResource(resourceOrURL);
        if (!resource) return;

        this._disassociateWithResource(resource);

        this.dispatchEventToListeners(WebInspector.Frame.Event.ResourceWasRemoved, { resource: resource });
    },

    removeAllResources: function removeAllResources() {
        // This does not remove provisional resources, use clearProvisionalLoad for that.

        var resources = this.resources;
        if (!resources.length) return;

        for (var i = 0; i < resources.length; ++i) this._disassociateWithResource(resources[i]);

        this._resourceCollection.removeAllResources();

        this.dispatchEventToListeners(WebInspector.Frame.Event.AllResourcesRemoved);
    },

    saveIdentityToCookie: function saveIdentityToCookie(cookie) {
        cookie[WebInspector.Frame.MainResourceURLCookieKey] = this.mainResource.url.hash;
    },

    // Private

    _isProvisionalResource: function _isProvisionalResource(resource) {
        return resource.loaderIdentifier && this._provisionalLoaderIdentifier && resource.loaderIdentifier === this._provisionalLoaderIdentifier;
    },

    _associateWithResource: function _associateWithResource(resource) {
        console.assert(!resource._parentFrame);
        if (resource._parentFrame) return;

        resource._parentFrame = this;
    },

    _disassociateWithResource: function _disassociateWithResource(resource) {
        console.assert(resource.parentFrame === this);
        if (resource.parentFrame !== this) return;

        resource._parentFrame = null;
    },

    _dispatchMainResourceDidChangeEvent: function _dispatchMainResourceDidChangeEvent(oldMainResource) {
        this.dispatchEventToListeners(WebInspector.Frame.Event.MainResourceDidChange, { oldMainResource: oldMainResource });
    }
}, {
    id: {
        get: function get() {
            return this._id;
        },
        configurable: true,
        enumerable: true
    },
    loaderIdentifier: {
        get: function get() {
            return this._loaderIdentifier;
        },
        configurable: true,
        enumerable: true
    },
    provisionalLoaderIdentifier: {
        get: function get() {
            return this._provisionalLoaderIdentifier;
        },
        configurable: true,
        enumerable: true
    },
    name: {
        get: function get() {
            return this._name;
        },
        configurable: true,
        enumerable: true
    },
    securityOrigin: {
        get: function get() {
            return this._securityOrigin;
        },
        configurable: true,
        enumerable: true
    },
    url: {
        get: function get() {
            return this._mainResource._url;
        },
        configurable: true,
        enumerable: true
    },
    domTree: {
        get: function get() {
            if (!this._domTree) this._domTree = new WebInspector.DOMTree(this);
            return this._domTree;
        },
        configurable: true,
        enumerable: true
    },
    pageExecutionContext: {
        get: function get() {
            return this._executionContextList.pageExecutionContext;
        },
        configurable: true,
        enumerable: true
    },
    executionContextList: {
        get: function get() {
            return this._executionContextList;
        },
        configurable: true,
        enumerable: true
    },
    mainResource: {
        get: function get() {
            return this._mainResource;
        },
        configurable: true,
        enumerable: true
    },
    provisionalMainResource: {
        get: function get() {
            return this._provisionalMainResource;
        },
        configurable: true,
        enumerable: true
    },
    parentFrame: {
        get: function get() {
            return this._parentFrame;
        },
        configurable: true,
        enumerable: true
    },
    childFrames: {
        get: function get() {
            return this._childFrames;
        },
        configurable: true,
        enumerable: true
    },
    domContentReadyEventTimestamp: {
        get: function get() {
            return this._domContentReadyEventTimestamp;
        },
        configurable: true,
        enumerable: true
    },
    loadEventTimestamp: {
        get: function get() {
            return this._loadEventTimestamp;
        },
        configurable: true,
        enumerable: true
    },
    resources: {
        get: function get() {
            return this._resourceCollection.resources;
        },
        configurable: true,
        enumerable: true
    }
});

WebInspector.Frame.prototype.__proto__ = WebInspector.Object.prototype;
