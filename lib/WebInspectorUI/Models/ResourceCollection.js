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

WebInspector.ResourceCollection = (function (_WebInspector$Object) {
    _inherits(ResourceCollection, _WebInspector$Object);

    function ResourceCollection() {
        _classCallCheck(this, ResourceCollection);

        _get(Object.getPrototypeOf(ResourceCollection.prototype), "constructor", this).call(this);

        this._resources = [];
        this._resourceURLMap = new Map();
        this._resourcesTypeMap = new Map();
    }

    // Public

    _createClass(ResourceCollection, [{
        key: "resourceForURL",
        value: function resourceForURL(url) {
            return this._resourceURLMap.get(url) || null;
        }
    }, {
        key: "resourcesWithType",
        value: function resourcesWithType(type) {
            return this._resourcesTypeMap.get(type) || [];
        }
    }, {
        key: "addResource",
        value: function addResource(resource) {
            console.assert(resource instanceof WebInspector.Resource);
            if (!(resource instanceof WebInspector.Resource)) return;

            this._associateWithResource(resource);
        }
    }, {
        key: "removeResource",
        value: function removeResource(resourceOrURL) {
            console.assert(resourceOrURL);

            if (resourceOrURL instanceof WebInspector.Resource) var url = resourceOrURL.url;else var url = resourceOrURL;

            // Fetch the resource by URL even if we were passed a WebInspector.Resource.
            // We do this incase the WebInspector.Resource is a new object that isn't in _resources,
            // but the URL is a valid resource.
            var resource = this.resourceForURL(url);
            console.assert(resource instanceof WebInspector.Resource);
            if (!(resource instanceof WebInspector.Resource)) return null;

            this._disassociateWithResource(resource);

            return resource;
        }
    }, {
        key: "removeAllResources",
        value: function removeAllResources() {
            if (!this._resources.length) return;

            for (var i = 0; i < this._resources.length; ++i) this._disassociateWithResource(this._resources[i], true);

            this._resources = [];
            this._resourceURLMap.clear();
            this._resourcesTypeMap.clear();
        }

        // Private

    }, {
        key: "_associateWithResource",
        value: function _associateWithResource(resource) {
            this._resources.push(resource);
            this._resourceURLMap.set(resource.url, resource);

            if (!this._resourcesTypeMap.has(resource.type)) this._resourcesTypeMap.set(resource.type, [resource]);else this._resourcesTypeMap.get(resource.type).push(resource);

            resource.addEventListener(WebInspector.Resource.Event.URLDidChange, this._resourceURLDidChange, this);
            resource.addEventListener(WebInspector.Resource.Event.TypeDidChange, this._resourceTypeDidChange, this);
        }
    }, {
        key: "_disassociateWithResource",
        value: function _disassociateWithResource(resource, skipRemoval) {
            if (skipRemoval) {
                this._resources.remove(resource);
                if (this._resourcesTypeMap.has(resource.type)) this._resourcesTypeMap.get(resource.type).remove(resource);
                this._resourceURLMap["delete"](resource.url);
            }

            resource.removeEventListener(WebInspector.Resource.Event.URLDidChange, this._resourceURLDidChange, this);
            resource.removeEventListener(WebInspector.Resource.Event.TypeDidChange, this._resourceTypeDidChange, this);
        }
    }, {
        key: "_resourceURLDidChange",
        value: function _resourceURLDidChange(event) {
            var resource = event.target;
            console.assert(resource instanceof WebInspector.Resource);
            if (!(resource instanceof WebInspector.Resource)) return;

            var oldURL = event.data.oldURL;
            console.assert(oldURL);
            if (!oldURL) return;

            this._resourceURLMap.set(resource.url, resource);
            this._resourceURLMap["delete"](oldURL);
        }
    }, {
        key: "_resourceTypeDidChange",
        value: function _resourceTypeDidChange(event) {
            var resource = event.target;
            console.assert(resource instanceof WebInspector.Resource);
            if (!(resource instanceof WebInspector.Resource)) return;

            var oldType = event.data.oldType;
            console.assert(oldType);
            if (!oldType) return;

            if (!this._resourcesTypeMap.has(resource.type)) this._resourcesTypeMap.set(resource.type, [resource]);else this._resourcesTypeMap.get(resource.type).push(resource);

            if (this._resourcesTypeMap.has(oldType)) this._resourcesTypeMap.get(oldType).remove(resource);
        }
    }, {
        key: "resources",
        get: function get() {
            return this._resources;
        }
    }]);

    return ResourceCollection;
})(WebInspector.Object);
