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

WebInspector.ObjectTreeArrayIndexTreeElement = (function (_WebInspector$ObjectTreeBaseTreeElement) {
    _inherits(ObjectTreeArrayIndexTreeElement, _WebInspector$ObjectTreeBaseTreeElement);

    function ObjectTreeArrayIndexTreeElement(property, propertyPath) {
        _classCallCheck(this, ObjectTreeArrayIndexTreeElement);

        console.assert(property.isIndexProperty(), "ObjectTreeArrayIndexTreeElement expects numeric property names");

        _get(Object.getPrototypeOf(ObjectTreeArrayIndexTreeElement.prototype), "constructor", this).call(this, property, propertyPath, property);

        this.mainTitle = this._titleFragment();
        this.addClassName("object-tree-property");
        this.addClassName("object-tree-array-index");

        if (!this.property.hasValue()) this.addClassName("accessor");
    }

    // Protected

    _createClass(ObjectTreeArrayIndexTreeElement, [{
        key: "invokedGetter",
        value: function invokedGetter() {
            this.mainTitle = this._titleFragment();

            this.removeClassName("accessor");
        }

        // Private

    }, {
        key: "_titleFragment",
        value: function _titleFragment() {
            var container = document.createDocumentFragment();

            // Array index name.
            var nameElement = container.appendChild(document.createElement("span"));
            nameElement.className = "index-name";
            nameElement.textContent = this.property.name;
            nameElement.title = this.propertyPathString(this.thisPropertyPath());

            // Value.
            var valueElement = container.appendChild(document.createElement("span"));
            valueElement.className = "index-value";

            var resolvedValue = this.resolvedValue();
            if (resolvedValue) valueElement.appendChild(WebInspector.FormattedValue.createObjectTreeOrFormattedValueForRemoteObject(resolvedValue, this.resolvedValuePropertyPath()));else {
                if (this.property.hasGetter()) container.appendChild(this.createGetterElement(true));
                if (this.property.hasSetter()) container.appendChild(this.createSetterElement());
            }

            valueElement.classList.add("value");
            if (this.hadError()) valueElement.classList.add("error");

            return container;
        }
    }]);

    return ObjectTreeArrayIndexTreeElement;
})(WebInspector.ObjectTreeBaseTreeElement);
