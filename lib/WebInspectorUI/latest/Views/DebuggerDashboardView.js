var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2014-2015 Apple Inc. All rights reserved.
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

WebInspector.DebuggerDashboardView = (function (_WebInspector$DashboardView) {
    _inherits(DebuggerDashboardView, _WebInspector$DashboardView);

    function DebuggerDashboardView(representedObject) {
        _classCallCheck(this, DebuggerDashboardView);

        _get(Object.getPrototypeOf(DebuggerDashboardView.prototype), "constructor", this).call(this, representedObject, "debugger");

        WebInspector.debuggerManager.addEventListener(WebInspector.DebuggerManager.Event.ActiveCallFrameDidChange, this._rebuildLocation, this);

        this._navigationBar = new WebInspector.NavigationBar();
        this.element.appendChild(this._navigationBar.element);

        var tooltip = WebInspector.UIString("Continue script execution (%s or %s)").format(WebInspector.pauseOrResumeKeyboardShortcut.displayName, WebInspector.pauseOrResumeAlternateKeyboardShortcut.displayName);
        this._debuggerResumeButtonItem = new WebInspector.ActivateButtonNavigationItem("debugger-dashboard-pause", tooltip, tooltip, "Images/Resume.svg", 15, 15, true);
        this._debuggerResumeButtonItem.activated = true;
        this._debuggerResumeButtonItem.addEventListener(WebInspector.ButtonNavigationItem.Event.Clicked, this._resumeButtonClicked, this);
        this._navigationBar.addNavigationItem(this._debuggerResumeButtonItem);

        var message = this._messageElement = document.createElement("div");
        message.classList.add("message");
        message.title = message.textContent = WebInspector.UIString("Debugger Paused");
        this.element.appendChild(message);

        var dividerElement = document.createElement("div");
        dividerElement.classList.add("divider");
        this.element.appendChild(dividerElement);

        var locationElement = this._locationElement = document.createElement("div");
        locationElement.classList.add("location");
        this.element.appendChild(locationElement);

        this._rebuildLocation();
    }

    // Private

    _createClass(DebuggerDashboardView, [{
        key: "_rebuildLocation",
        value: function _rebuildLocation() {
            if (!WebInspector.debuggerManager.activeCallFrame) return;

            this._locationElement.removeChildren();

            var callFrame = WebInspector.debuggerManager.activeCallFrame;
            var functionName = callFrame.functionName || WebInspector.UIString("(anonymous function)");

            var iconClassName = WebInspector.DebuggerDashboardView.FunctionIconStyleClassName;

            // This is more than likely an event listener function with an "on" prefix and it is
            // as long or longer than the shortest event listener name -- "oncut".
            if (callFrame.functionName && callFrame.functionName.startsWith("on") && callFrame.functionName.length >= 5) iconClassName = WebInspector.DebuggerDashboardView.EventListenerIconStyleClassName;

            var iconElement = document.createElement("div");
            iconElement.classList.add(iconClassName);
            this._locationElement.appendChild(iconElement);

            var iconImageElement = document.createElement("img");
            iconImageElement.className = "icon";
            iconElement.appendChild(iconImageElement);

            var nameElement = document.createElement("div");
            nameElement.append(functionName);
            nameElement.classList.add("function-name");
            this._locationElement.appendChild(nameElement);

            var sourceCodeLocation = WebInspector.debuggerManager.activeCallFrame.sourceCodeLocation;
            var shouldPreventLinkFloat = true;
            var linkElement = WebInspector.createSourceCodeLocationLink(sourceCodeLocation, shouldPreventLinkFloat);
            this._locationElement.appendChild(linkElement);
        }
    }, {
        key: "_resumeButtonClicked",
        value: function _resumeButtonClicked() {
            WebInspector.debuggerManager.resume();
        }
    }]);

    return DebuggerDashboardView;
})(WebInspector.DashboardView);

WebInspector.DebuggerDashboardView.FunctionIconStyleClassName = WebInspector.CallFrameView.FunctionIconStyleClassName;
WebInspector.DebuggerDashboardView.EventListenerIconStyleClassName = WebInspector.CallFrameView.EventListenerIconStyleClassName;
