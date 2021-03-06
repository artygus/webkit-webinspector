var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2014-2105 Apple Inc. All rights reserved.
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

WebInspector.ProfileNodeTreeElement = (function (_WebInspector$GeneralTreeElement) {
    _inherits(ProfileNodeTreeElement, _WebInspector$GeneralTreeElement);

    function ProfileNodeTreeElement(profileNode, delegate) {
        _classCallCheck(this, ProfileNodeTreeElement);

        console.assert(profileNode);

        var title = profileNode.functionName;
        var subtitle = "";

        if (!title) {
            switch (profileNode.type) {
                case WebInspector.ProfileNode.Type.Function:
                    title = WebInspector.UIString("(anonymous function)");
                    break;
                case WebInspector.ProfileNode.Type.Program:
                    title = WebInspector.UIString("(program)");
                    break;
                default:
                    title = WebInspector.UIString("(anonymous function)");
                    console.error("Unknown ProfileNode type: " + profileNode.type);
            }
        }

        var sourceCodeLocation = profileNode.sourceCodeLocation;
        if (sourceCodeLocation) {
            subtitle = document.createElement("span");
            sourceCodeLocation.populateLiveDisplayLocationString(subtitle, "textContent");
        }

        var className;

        switch (profileNode.type) {
            case WebInspector.ProfileNode.Type.Function:
                className = WebInspector.CallFrameView.FunctionIconStyleClassName;
                if (!sourceCodeLocation) className = WebInspector.CallFrameView.NativeIconStyleClassName;
                break;
            case WebInspector.ProfileNode.Type.Program:
                className = WebInspector.TimelineRecordTreeElement.EvaluatedRecordIconStyleClass;
                break;
        }

        console.assert(className);

        // This is more than likely an event listener function with an "on" prefix and it is
        // as long or longer than the shortest event listener name -- "oncut".
        if (profileNode.functionName && profileNode.functionName.startsWith("on") && profileNode.functionName.length >= 5) className = WebInspector.CallFrameView.EventListenerIconStyleClassName;

        var hasChildren = !!profileNode.childNodes.length;

        _get(Object.getPrototypeOf(ProfileNodeTreeElement.prototype), "constructor", this).call(this, [className], title, subtitle, profileNode, hasChildren);

        this._profileNode = profileNode;
        this._delegate = delegate || null;

        this.small = true;
        this.shouldRefreshChildren = true;

        if (sourceCodeLocation) this.tooltipHandledSeparately = true;
    }

    // Public

    _createClass(ProfileNodeTreeElement, [{
        key: "onattach",

        // Protected

        value: function onattach() {
            _get(Object.getPrototypeOf(ProfileNodeTreeElement.prototype), "onattach", this).call(this);

            console.assert(this.element);

            if (!this.tooltipHandledSeparately) return;

            var tooltipPrefix = this.mainTitle + "\n";
            this._profileNode.sourceCodeLocation.populateLiveDisplayLocationTooltip(this.element, tooltipPrefix);
        }
    }, {
        key: "onpopulate",
        value: function onpopulate() {
            if (!this.hasChildren || !this.shouldRefreshChildren) return;

            this.shouldRefreshChildren = false;

            this.removeChildren();

            if (this._delegate && typeof this._delegate.populateProfileNodeTreeElement === "function") {
                this._delegate.populateProfileNodeTreeElement(this);
                return;
            }

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._profileNode.childNodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var childProfileNode = _step.value;

                    var childTreeElement = new WebInspector.ProfileNodeTreeElement(childProfileNode);
                    this.appendChild(childTreeElement);
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
        }
    }, {
        key: "profileNode",
        get: function get() {
            return this._profileNode;
        }
    }, {
        key: "filterableData",
        get: function get() {
            var url = this._profileNode.sourceCodeLocation ? this._profileNode.sourceCodeLocation.sourceCode.url : "";
            return { text: [this.mainTitle, url || ""] };
        }
    }]);

    return ProfileNodeTreeElement;
})(WebInspector.GeneralTreeElement);
