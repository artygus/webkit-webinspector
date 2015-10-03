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

WebInspector.ElementsTabContentView = (function (_WebInspector$ContentBrowserTabContentView) {
    _inherits(ElementsTabContentView, _WebInspector$ContentBrowserTabContentView);

    function ElementsTabContentView(identifier) {
        _classCallCheck(this, ElementsTabContentView);

        var tabBarItem = new WebInspector.TabBarItem("Images/Elements.svg", WebInspector.UIString("Elements"));
        var detailsSidebarPanels = [WebInspector.domNodeDetailsSidebarPanel, WebInspector.cssStyleDetailsSidebarPanel];

        if (WebInspector.layerTreeDetailsSidebarPanel) detailsSidebarPanels.push(WebInspector.layerTreeDetailsSidebarPanel);

        _get(Object.getPrototypeOf(ElementsTabContentView.prototype), "constructor", this).call(this, identifier || "elements", "elements", tabBarItem, null, detailsSidebarPanels, true);

        WebInspector.frameResourceManager.addEventListener(WebInspector.FrameResourceManager.Event.MainFrameDidChange, this._mainFrameDidChange, this);
        WebInspector.Frame.addEventListener(WebInspector.Frame.Event.MainResourceDidChange, this._mainResourceDidChange, this);

        this._showDOMTreeContentView();
    }

    // Public

    _createClass(ElementsTabContentView, [{
        key: "canShowRepresentedObject",
        value: function canShowRepresentedObject(representedObject) {
            return representedObject instanceof WebInspector.DOMTree;
        }
    }, {
        key: "showRepresentedObject",
        value: function showRepresentedObject(representedObject, cookie) {
            var domTreeContentView = this.contentBrowser.currentContentView;
            console.assert(!domTreeContentView || domTreeContentView instanceof WebInspector.DOMTreeContentView);
            if (!domTreeContentView || !(domTreeContentView instanceof WebInspector.DOMTreeContentView)) {
                // FIXME: Remember inspected node for later when _mainFrameDidChange.
                return;
            }

            if (!cookie || !cookie.nodeToSelect) return;

            domTreeContentView.selectAndRevealDOMNode(cookie.nodeToSelect);

            // Because nodeToSelect is ephemeral, we don't want to keep
            // it around in the back-forward history entries.
            cookie.nodeToSelect = undefined;
        }
    }, {
        key: "closed",
        value: function closed() {
            _get(Object.getPrototypeOf(ElementsTabContentView.prototype), "closed", this).call(this);

            WebInspector.frameResourceManager.removeEventListener(null, null, this);
            WebInspector.Frame.removeEventListener(null, null, this);
        }

        // Private

    }, {
        key: "_showDOMTreeContentView",
        value: function _showDOMTreeContentView() {
            this.contentBrowser.contentViewContainer.closeAllContentViews();

            var mainFrame = WebInspector.frameResourceManager.mainFrame;
            if (mainFrame) this.contentBrowser.showContentViewForRepresentedObject(mainFrame.domTree);
        }
    }, {
        key: "_mainFrameDidChange",
        value: function _mainFrameDidChange(event) {
            this._showDOMTreeContentView();
        }
    }, {
        key: "_mainResourceDidChange",
        value: function _mainResourceDidChange(event) {
            if (!event.target.isMainFrame()) return;

            this._showDOMTreeContentView();
        }
    }, {
        key: "type",
        get: function get() {
            return WebInspector.ElementsTabContentView.Type;
        }
    }]);

    return ElementsTabContentView;
})(WebInspector.ContentBrowserTabContentView);

WebInspector.ElementsTabContentView.Type = "elements";
