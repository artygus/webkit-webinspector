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

WebInspector.ApplicationCacheDetailsSidebarPanel = (function (_WebInspector$DetailsSidebarPanel) {
    _inherits(ApplicationCacheDetailsSidebarPanel, _WebInspector$DetailsSidebarPanel);

    function ApplicationCacheDetailsSidebarPanel() {
        _classCallCheck(this, ApplicationCacheDetailsSidebarPanel);

        _get(Object.getPrototypeOf(ApplicationCacheDetailsSidebarPanel.prototype), "constructor", this).call(this, "application-cache-details", WebInspector.UIString("Storage"), WebInspector.UIString("Storage"));

        this.element.classList.add("application-cache");

        this._applicationCacheFrame = null;

        this._locationManifestURLRow = new WebInspector.DetailsSectionSimpleRow(WebInspector.UIString("Manifest URL"));
        this._locationFrameURLRow = new WebInspector.DetailsSectionSimpleRow(WebInspector.UIString("Frame URL"));

        this._locationGroup = new WebInspector.DetailsSectionGroup([this._locationManifestURLRow, this._locationFrameURLRow]);

        this._locationSection = new WebInspector.DetailsSection("application-cache-location", WebInspector.UIString("Location"), [this._locationGroup]);

        this._onlineRow = new WebInspector.DetailsSectionSimpleRow(WebInspector.UIString("Online"));
        this._statusRow = new WebInspector.DetailsSectionSimpleRow(WebInspector.UIString("Status"));

        this._statusGroup = new WebInspector.DetailsSectionGroup([this._onlineRow, this._statusRow]);

        this._statusSection = new WebInspector.DetailsSection("application-cache-status", WebInspector.UIString("Status"), [this._statusGroup]);

        this.contentElement.appendChild(this._locationSection.element);
        this.contentElement.appendChild(this._statusSection.element);

        WebInspector.applicationCacheManager.addEventListener(WebInspector.ApplicationCacheManager.Event.NetworkStateUpdated, this._networkStateUpdated, this);
        WebInspector.applicationCacheManager.addEventListener(WebInspector.ApplicationCacheManager.Event.FrameManifestStatusChanged, this._frameManifestStatusChanged, this);
    }

    // Public

    _createClass(ApplicationCacheDetailsSidebarPanel, [{
        key: "inspect",
        value: function inspect(objects) {
            // Convert to a single item array if needed.
            if (!(objects instanceof Array)) objects = [objects];

            var applicationCacheFrameToInspect = null;

            // Iterate over the objects to find a WebInspector.ApplicationCacheFrame to inspect.
            for (var i = 0; i < objects.length; ++i) {
                if (objects[i] instanceof WebInspector.ApplicationCacheFrame) {
                    applicationCacheFrameToInspect = objects[i];
                    break;
                }
            }

            this.applicationCacheFrame = applicationCacheFrameToInspect;

            return !!this.applicationCacheFrame;
        }
    }, {
        key: "refresh",
        value: function refresh() {
            if (!this.applicationCacheFrame) return;

            this._locationFrameURLRow.value = this.applicationCacheFrame.frame.url;
            this._locationManifestURLRow.value = this.applicationCacheFrame.manifest.manifestURL;

            this._refreshOnlineRow();
            this._refreshStatusRow();
        }

        // Private

    }, {
        key: "_networkStateUpdated",
        value: function _networkStateUpdated(event) {
            if (!this.applicationCacheFrame) return;

            this._refreshOnlineRow();
        }
    }, {
        key: "_frameManifestStatusChanged",
        value: function _frameManifestStatusChanged(event) {
            if (!this.applicationCacheFrame) return;

            console.assert(event.data.frameManifest instanceof WebInspector.ApplicationCacheFrame);
            if (event.data.frameManifest !== this.applicationCacheFrame) return;

            this._refreshStatusRow();
        }
    }, {
        key: "_refreshOnlineRow",
        value: function _refreshOnlineRow() {
            this._onlineRow.value = WebInspector.applicationCacheManager.online ? WebInspector.UIString("Yes") : WebInspector.UIString("No");
        }
    }, {
        key: "_refreshStatusRow",
        value: function _refreshStatusRow() {
            this._statusRow.value = WebInspector.ApplicationCacheDetailsSidebarPanel.Status[this.applicationCacheFrame.status];
        }
    }, {
        key: "applicationCacheFrame",
        get: function get() {
            return this._applicationCacheFrame;
        },
        set: function set(applicationCacheFrame) {
            if (this._applicationCacheFrame === applicationCacheFrame) return;

            this._applicationCacheFrame = applicationCacheFrame;

            this.needsRefresh();
        }
    }]);

    return ApplicationCacheDetailsSidebarPanel;
})(WebInspector.DetailsSidebarPanel);

// This needs to be kept in sync with ApplicationCacheManager.js.
WebInspector.ApplicationCacheDetailsSidebarPanel.Status = {
    0: "Uncached",
    1: "Idle",
    2: "Checking",
    3: "Downloading",
    4: "UpdateReady",
    5: "Obsolete"
};
