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

WebInspector.ResourceClusterContentView = (function (_WebInspector$ClusterContentView) {
    _inherits(ResourceClusterContentView, _WebInspector$ClusterContentView);

    function ResourceClusterContentView(resource) {
        _classCallCheck(this, ResourceClusterContentView);

        _get(Object.getPrototypeOf(ResourceClusterContentView.prototype), "constructor", this).call(this, resource);

        this._resource = resource;
        this._resource.addEventListener(WebInspector.Resource.Event.TypeDidChange, this._resourceTypeDidChange, this);
        this._resource.addEventListener(WebInspector.Resource.Event.LoadingDidFinish, this._resourceLoadingDidFinish, this);

        function createPathComponent(displayName, className, identifier) {
            var pathComponent = new WebInspector.HierarchicalPathComponent(displayName, className, identifier, false, true);
            pathComponent.addEventListener(WebInspector.HierarchicalPathComponent.Event.SiblingWasSelected, this._pathComponentSelected, this);
            return pathComponent;
        }

        this._requestPathComponent = createPathComponent.call(this, WebInspector.UIString("Request"), WebInspector.ResourceClusterContentView.RequestIconStyleClassName, WebInspector.ResourceClusterContentView.RequestIdentifier);
        this._responsePathComponent = createPathComponent.call(this, WebInspector.UIString("Response"), WebInspector.ResourceClusterContentView.ResponseIconStyleClassName, WebInspector.ResourceClusterContentView.ResponseIdentifier);

        this._requestPathComponent.nextSibling = this._responsePathComponent;
        this._responsePathComponent.previousSibling = this._requestPathComponent;

        this._currentContentViewSetting = new WebInspector.Setting("resource-current-view-" + this._resource.url.hash, WebInspector.ResourceClusterContentView.ResponseIdentifier);
    }

    // Public

    _createClass(ResourceClusterContentView, [{
        key: "shown",
        value: function shown() {
            _get(Object.getPrototypeOf(ResourceClusterContentView.prototype), "shown", this).call(this);

            if (this._shownInitialContent) return;

            this._showContentViewForIdentifier(this._currentContentViewSetting.value);
        }
    }, {
        key: "closed",
        value: function closed() {
            _get(Object.getPrototypeOf(ResourceClusterContentView.prototype), "closed", this).call(this);

            this._shownInitialContent = false;
        }
    }, {
        key: "saveToCookie",
        value: function saveToCookie(cookie) {
            cookie[WebInspector.ResourceClusterContentView.ContentViewIdentifierCookieKey] = this._currentContentViewSetting.value;
        }
    }, {
        key: "restoreFromCookie",
        value: function restoreFromCookie(cookie) {
            var contentView = this._showContentViewForIdentifier(cookie[WebInspector.ResourceClusterContentView.ContentViewIdentifierCookieKey]);
            if (typeof contentView.revealPosition === "function" && "lineNumber" in cookie && "columnNumber" in cookie) contentView.revealPosition(new WebInspector.SourceCodePosition(cookie.lineNumber, cookie.columnNumber));
        }
    }, {
        key: "showRequest",
        value: function showRequest() {
            this._shownInitialContent = true;

            return this._showContentViewForIdentifier(WebInspector.ResourceClusterContentView.RequestIdentifier);
        }
    }, {
        key: "showResponse",
        value: function showResponse(positionToReveal, textRangeToSelect, forceUnformatted) {
            this._shownInitialContent = true;

            if (!this._resource.finished) {
                this._positionToReveal = positionToReveal;
                this._textRangeToSelect = textRangeToSelect;
                this._forceUnformatted = forceUnformatted;
            }

            var responseContentView = this._showContentViewForIdentifier(WebInspector.ResourceClusterContentView.ResponseIdentifier);
            if (typeof responseContentView.revealPosition === "function") responseContentView.revealPosition(positionToReveal, textRangeToSelect, forceUnformatted);
            return responseContentView;
        }

        // Private

    }, {
        key: "_canShowRequestContentView",
        value: function _canShowRequestContentView() {
            var requestData = this._resource.requestData;
            if (!requestData) return false;

            var requestDataContentType = this._resource.requestDataContentType;
            if (requestDataContentType && requestDataContentType.match(/^application\/x-www-form-urlencoded\s*(;.*)?$/i)) return false;

            return true;
        }
    }, {
        key: "_pathComponentForContentView",
        value: function _pathComponentForContentView(contentView) {
            console.assert(contentView);
            if (!contentView) return null;
            if (contentView === this._requestContentView) return this._requestPathComponent;
            if (contentView === this._responseContentView) return this._responsePathComponent;
            console.error("Unknown contentView.");
            return null;
        }
    }, {
        key: "_identifierForContentView",
        value: function _identifierForContentView(contentView) {
            console.assert(contentView);
            if (!contentView) return null;
            if (contentView === this._requestContentView) return WebInspector.ResourceClusterContentView.RequestIdentifier;
            if (contentView === this._responseContentView) return WebInspector.ResourceClusterContentView.ResponseIdentifier;
            console.error("Unknown contentView.");
            return null;
        }
    }, {
        key: "_showContentViewForIdentifier",
        value: function _showContentViewForIdentifier(identifier) {
            var contentViewToShow = null;

            switch (identifier) {
                case WebInspector.ResourceClusterContentView.RequestIdentifier:
                    contentViewToShow = this._canShowRequestContentView() ? this.requestContentView : null;
                    break;
                case WebInspector.ResourceClusterContentView.ResponseIdentifier:
                    contentViewToShow = this.responseContentView;
                    break;
            }

            if (!contentViewToShow) contentViewToShow = this.responseContentView;

            console.assert(contentViewToShow);

            this._currentContentViewSetting.value = this._identifierForContentView(contentViewToShow);

            return this.contentViewContainer.showContentView(contentViewToShow);
        }
    }, {
        key: "_pathComponentSelected",
        value: function _pathComponentSelected(event) {
            this._showContentViewForIdentifier(event.data.pathComponent.representedObject);
        }
    }, {
        key: "_resourceTypeDidChange",
        value: function _resourceTypeDidChange(event) {
            // Since resource views are based on the type, we need to make a new content view and tell the container to replace this
            // content view with the new one. Make a new ResourceContentView which will use the new resource type to make the correct
            // concrete ResourceContentView subclass.

            var currentResponseContentView = this._responseContentView;
            if (!currentResponseContentView) return;

            delete this._responseContentView;

            this.contentViewContainer.replaceContentView(currentResponseContentView, this.responseContentView);
        }
    }, {
        key: "_resourceLoadingDidFinish",
        value: function _resourceLoadingDidFinish(event) {
            if ("_positionToReveal" in this) {
                if (this._contentViewContainer.currentContentView === this._responseContentView) this._responseContentView.revealPosition(this._positionToReveal, this._textRangeToSelect, this._forceUnformatted);

                delete this._positionToReveal;
                delete this._textRangeToSelect;
                delete this._forceUnformatted;
            }
        }
    }, {
        key: "resource",
        get: function get() {
            return this._resource;
        }
    }, {
        key: "responseContentView",
        get: function get() {
            if (this._responseContentView) return this._responseContentView;

            switch (this._resource.type) {
                case WebInspector.Resource.Type.Document:
                case WebInspector.Resource.Type.Script:
                case WebInspector.Resource.Type.Stylesheet:
                case WebInspector.Resource.Type.XHR:
                    this._responseContentView = new WebInspector.TextResourceContentView(this._resource);
                    break;

                case WebInspector.Resource.Type.Image:
                    this._responseContentView = new WebInspector.ImageResourceContentView(this._resource);
                    break;

                case WebInspector.Resource.Type.Font:
                    this._responseContentView = new WebInspector.FontResourceContentView(this._resource);
                    break;

                default:
                    this._responseContentView = new WebInspector.GenericResourceContentView(this._resource);
                    break;
            }

            return this._responseContentView;
        }
    }, {
        key: "requestContentView",
        get: function get() {
            if (!this._canShowRequestContentView()) return null;

            if (this._requestContentView) return this._requestContentView;

            this._requestContentView = new WebInspector.TextContentView(this._resource.requestData || "", this._resource.requestDataContentType);

            return this._requestContentView;
        }
    }, {
        key: "selectionPathComponents",
        get: function get() {
            var currentContentView = this._contentViewContainer.currentContentView;
            if (!currentContentView) return [];

            if (!this._canShowRequestContentView()) return currentContentView.selectionPathComponents;

            // Append the current view's path components to the path component representing the current view.
            var components = [this._pathComponentForContentView(currentContentView)];
            return components.concat(currentContentView.selectionPathComponents);
        }
    }]);

    return ResourceClusterContentView;
})(WebInspector.ClusterContentView);

WebInspector.ResourceClusterContentView.ContentViewIdentifierCookieKey = "resource-cluster-content-view-identifier";

WebInspector.ResourceClusterContentView.RequestIconStyleClassName = "request-icon";
WebInspector.ResourceClusterContentView.ResponseIconStyleClassName = "response-icon";
WebInspector.ResourceClusterContentView.RequestIdentifier = "request";
WebInspector.ResourceClusterContentView.ResponseIdentifier = "response";
