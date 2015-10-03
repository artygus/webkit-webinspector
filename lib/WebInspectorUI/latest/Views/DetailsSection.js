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

WebInspector.DetailsSection = (function (_WebInspector$Object) {
    _inherits(DetailsSection, _WebInspector$Object);

    function DetailsSection(identifier, title, groups, optionsElement, defaultCollapsedSettingValue) {
        _classCallCheck(this, DetailsSection);

        _get(Object.getPrototypeOf(DetailsSection.prototype), "constructor", this).call(this);

        console.assert(identifier);

        this._element = document.createElement("div");
        this._element.classList.add(identifier, "details-section");

        this._headerElement = document.createElement("div");
        this._headerElement.addEventListener("click", this._headerElementClicked.bind(this));
        this._headerElement.className = "header";
        this._element.appendChild(this._headerElement);

        if (optionsElement instanceof HTMLElement) {
            this._optionsElement = optionsElement;
            this._optionsElement.addEventListener("mousedown", this._optionsElementMouseDown.bind(this));
            this._optionsElement.addEventListener("mouseup", this._optionsElementMouseUp.bind(this));
            this._headerElement.appendChild(this._optionsElement);
        }

        this._titleElement = document.createElement("span");
        this._headerElement.appendChild(this._titleElement);

        this._contentElement = document.createElement("div");
        this._contentElement.className = "content";
        this._element.appendChild(this._contentElement);

        this._generateDisclosureTrianglesIfNeeded();

        this._identifier = identifier;
        this.title = title;
        this.groups = groups || [new WebInspector.DetailsSectionGroup()];

        this._collapsedSetting = new WebInspector.Setting(identifier + "-details-section-collapsed", !!defaultCollapsedSettingValue);
        this.collapsed = this._collapsedSetting.value;
        this._expandedByUser = false;
    }

    // Public

    _createClass(DetailsSection, [{
        key: "_headerElementClicked",

        // Private

        value: function _headerElementClicked(event) {
            if (event.target.isSelfOrDescendant(this._optionsElement)) return;

            var collapsed = this.collapsed;
            this.collapsed = !collapsed;
            this._expandedByUser = collapsed;

            this._element.scrollIntoViewIfNeeded(false);
        }
    }, {
        key: "_optionsElementMouseDown",
        value: function _optionsElementMouseDown(event) {
            this._headerElement.classList.add(WebInspector.DetailsSection.MouseOverOptionsElementStyleClassName);
        }
    }, {
        key: "_optionsElementMouseUp",
        value: function _optionsElementMouseUp(event) {
            this._headerElement.classList.remove(WebInspector.DetailsSection.MouseOverOptionsElementStyleClassName);
        }
    }, {
        key: "_generateDisclosureTrianglesIfNeeded",
        value: function _generateDisclosureTrianglesIfNeeded() {
            if (WebInspector.DetailsSection._generatedDisclosureTriangles) return;

            // Set this early instead of in _generateDisclosureTriangle because we don't want multiple sections that are
            // created at the same time to duplicate the work (even though it would be harmless.)
            WebInspector.DetailsSection._generatedDisclosureTriangles = true;

            var specifications = {};
            specifications[WebInspector.DetailsSection.DisclosureTriangleNormalCanvasIdentifierSuffix] = {
                fillColor: [134, 134, 134]
            };

            specifications[WebInspector.DetailsSection.DisclosureTriangleActiveCanvasIdentifierSuffix] = {
                fillColor: [57, 57, 57]
            };

            generateColoredImagesForCSS("Images/DisclosureTriangleSmallOpen.svg", specifications, 13, 13, WebInspector.DetailsSection.DisclosureTriangleOpenCanvasIdentifier);
            generateColoredImagesForCSS("Images/DisclosureTriangleSmallClosed.svg", specifications, 13, 13, WebInspector.DetailsSection.DisclosureTriangleClosedCanvasIdentifier);
        }
    }, {
        key: "element",
        get: function get() {
            return this._element;
        }
    }, {
        key: "identifier",
        get: function get() {
            return this._identifier;
        }
    }, {
        key: "title",
        get: function get() {
            return this._titleElement.textContent;
        },
        set: function set(title) {
            this._titleElement.textContent = title;
        }
    }, {
        key: "collapsed",
        get: function get() {
            return this._element.classList.contains(WebInspector.DetailsSection.CollapsedStyleClassName);
        },
        set: function set(flag) {
            if (flag) this._element.classList.add(WebInspector.DetailsSection.CollapsedStyleClassName);else this._element.classList.remove(WebInspector.DetailsSection.CollapsedStyleClassName);

            this._collapsedSetting.value = flag || false;
        }
    }, {
        key: "groups",
        get: function get() {
            return this._groups;
        },
        set: function set(groups) {
            this._contentElement.removeChildren();

            this._groups = groups || [];

            for (var i = 0; i < this._groups.length; ++i) this._contentElement.appendChild(this._groups[i].element);
        }
    }, {
        key: "expandedByUser",
        get: function get() {
            return this._expandedByUser;
        }
    }]);

    return DetailsSection;
})(WebInspector.Object);

WebInspector.DetailsSection.CollapsedStyleClassName = "collapsed";
WebInspector.DetailsSection.MouseOverOptionsElementStyleClassName = "mouse-over-options-element";
WebInspector.DetailsSection.DisclosureTriangleOpenCanvasIdentifier = "details-section-disclosure-triangle-open";
WebInspector.DetailsSection.DisclosureTriangleClosedCanvasIdentifier = "details-section-disclosure-triangle-closed";
WebInspector.DetailsSection.DisclosureTriangleNormalCanvasIdentifierSuffix = "-normal";
WebInspector.DetailsSection.DisclosureTriangleActiveCanvasIdentifierSuffix = "-active";
