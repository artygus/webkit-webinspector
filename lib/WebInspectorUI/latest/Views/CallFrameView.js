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

WebInspector.CallFrameView = (function (_WebInspector$Object) {
    _inherits(CallFrameView, _WebInspector$Object);

    function CallFrameView(callFrame, showFunctionName) {
        _classCallCheck(this, CallFrameView);

        _get(Object.getPrototypeOf(CallFrameView.prototype), "constructor", this).call(this);
        console.assert(callFrame instanceof WebInspector.CallFrame);

        var callFrameElement = document.createElement("div");
        callFrameElement.classList.add("call-frame", WebInspector.CallFrameView.iconClassNameForCallFrame(callFrame));

        var subtitleElement = document.createElement("span");
        subtitleElement.classList.add("subtitle");

        var sourceCodeLocation = callFrame.sourceCodeLocation;
        if (sourceCodeLocation) {
            WebInspector.linkifyElement(callFrameElement, sourceCodeLocation);

            var linkElement = document.createElement("a");
            linkElement.classList.add("source-link");
            linkElement.href = sourceCodeLocation.sourceCode.url;

            if (showFunctionName) {
                var separatorElement = document.createElement("span");
                separatorElement.classList.add("separator");
                separatorElement.textContent = " — ";
                subtitleElement.append(separatorElement);
            }

            subtitleElement.append(linkElement);

            sourceCodeLocation.populateLiveDisplayLocationTooltip(linkElement);
            sourceCodeLocation.populateLiveDisplayLocationString(linkElement, "textContent");
        }

        var titleElement = document.createElement("span");
        titleElement.classList.add("title");

        if (showFunctionName) {
            var imgElement = document.createElement("img");
            imgElement.classList.add("icon");

            titleElement.append(imgElement, callFrame.functionName || WebInspector.UIString("(anonymous function)"));
        }

        callFrameElement.append(titleElement, subtitleElement);

        return callFrameElement;
    }

    _createClass(CallFrameView, null, [{
        key: "iconClassNameForCallFrame",
        value: function iconClassNameForCallFrame(callFrame) {
            // This is more than likely an event listener function with an "on" prefix and it is
            // as long or longer than the shortest event listener name -- "oncut".
            if (callFrame.functionName && callFrame.functionName.startsWith("on") && callFrame.functionName.length >= 5) return WebInspector.CallFrameView.EventListenerIconStyleClassName;

            if (callFrame.nativeCode) return WebInspector.CallFrameView.NativeIconStyleClassName;

            return WebInspector.CallFrameView.FunctionIconStyleClassName;
        }
    }]);

    return CallFrameView;
})(WebInspector.Object);

WebInspector.CallFrameView.FunctionIconStyleClassName = "function-icon";
WebInspector.CallFrameView.EventListenerIconStyleClassName = "event-listener-icon";
WebInspector.CallFrameView.NativeIconStyleClassName = "native-icon";
