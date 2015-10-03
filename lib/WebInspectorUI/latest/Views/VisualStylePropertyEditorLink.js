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

WebInspector.VisualStylePropertyEditorLink = (function (_WebInspector$Object) {
    _inherits(VisualStylePropertyEditorLink, _WebInspector$Object);

    function VisualStylePropertyEditorLink(linkedProperties, className, linksToHideWhenLinked) {
        _classCallCheck(this, VisualStylePropertyEditorLink);

        _get(Object.getPrototypeOf(VisualStylePropertyEditorLink.prototype), "constructor", this).call(this);

        this._linkedProperties = linkedProperties || [];
        this._linksToHideWhenLinked = linksToHideWhenLinked || [];
        this._lastPropertyEdited = null;

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = this._linkedProperties[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var property = _step.value;

                property.addEventListener(WebInspector.VisualStylePropertyEditor.Event.ValueDidChange, this._linkedPropertyValueChanged, this);
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

        this._element = document.createElement("div");
        this._element.classList.add("visual-style-property-editor-link", className || "");

        var leftLineElement = document.createElement("div");
        leftLineElement.classList.add("visual-style-property-editor-link-border", "left");
        this._element.appendChild(leftLineElement);

        this._iconElement = document.createElement("div");
        this._iconElement.classList.add("visual-style-property-editor-link-icon");
        this._iconElement.title = WebInspector.UIString("Click to link property values");
        this._iconElement.addEventListener("mouseover", this._iconMouseover.bind(this));
        this._iconElement.addEventListener("mouseout", this._iconMouseout.bind(this));
        this._iconElement.addEventListener("click", this._iconClicked.bind(this));

        wrappedSVGDocument("Images/VisualStylePropertyUnlinked.svg", "unlinked-icon", null, (function (wrapper) {
            this._iconElement.appendChild(wrapper);
            this._unlinkedIcon = wrapper;
        }).bind(this));

        wrappedSVGDocument("Images/VisualStylePropertyLinked.svg", "linked-icon", null, (function (wrapper) {
            this._iconElement.appendChild(wrapper);
            this._linkedIcon = wrapper;
            this._linkedIcon.hidden = true;
        }).bind(this));

        this._element.appendChild(this._iconElement);

        var rightLineElement = document.createElement("div");
        rightLineElement.classList.add("visual-style-property-editor-link-border", "right");
        this._element.appendChild(rightLineElement);

        this._linked = false;
        this._disabled = false;
    }

    // Public

    _createClass(VisualStylePropertyEditorLink, [{
        key: "_linkedPropertyValueChanged",

        // Private

        value: function _linkedPropertyValueChanged(event) {
            if (!event) return;

            var property = event.target;
            if (!property) return;

            this._lastPropertyEdited = property;
            if (!this._linked) return;

            this._updateLinkedEditors(property);
        }
    }, {
        key: "_updateLinkedEditors",
        value: function _updateLinkedEditors(property) {
            var style = property.style;
            var text = style.text;
            var value = property.synthesizedValue || null;

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._linkedProperties[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var linkedProperty = _step2.value;

                    text = linkedProperty.updateValueFromText(text, value);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                        _iterator2["return"]();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            style.text = text;
        }
    }, {
        key: "_iconMouseover",
        value: function _iconMouseover() {
            this._linkedIcon.hidden = this._linked;
            this._unlinkedIcon.hidden = !this._linked;
        }
    }, {
        key: "_iconMouseout",
        value: function _iconMouseout() {
            this._linkedIcon.hidden = !this._linked;
            this._unlinkedIcon.hidden = this._linked;
        }
    }, {
        key: "_iconClicked",
        value: function _iconClicked() {
            this.linked = !this._linked;
            this._updateLinkedEditors(this._lastPropertyEdited || this._linkedProperties[0]);
        }
    }, {
        key: "element",
        get: function get() {
            return this._element;
        }
    }, {
        key: "linked",
        set: function set(flag) {
            this._linked = flag;
            this._element.classList.toggle("linked", this._linked);

            if (this._linkedIcon) this._linkedIcon.hidden = !this._linked;

            if (this._unlinkedIcon) this._unlinkedIcon.hidden = this._linked;

            this._iconElement.title = this._linked ? WebInspector.UIString("Click to remove link") : WebInspector.UIString("Click to link property values");

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this._linksToHideWhenLinked[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var linkToHide = _step3.value;

                    linkToHide.disabled = this._linked;
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                        _iterator3["return"]();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }
        }
    }, {
        key: "disabled",
        set: function set(flag) {
            this._disabled = flag;
            this._element.classList.toggle("disabled", this._disabled);
        }
    }]);

    return VisualStylePropertyEditorLink;
})(WebInspector.Object);
