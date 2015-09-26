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

WebInspector.ObjectTreeMapEntryTreeElement = (function (_WebInspector$ObjectTreeBaseTreeElement) {
    _inherits(ObjectTreeMapEntryTreeElement, _WebInspector$ObjectTreeBaseTreeElement);

    function ObjectTreeMapEntryTreeElement(object, propertyPath) {
        _classCallCheck(this, ObjectTreeMapEntryTreeElement);

        console.assert(object instanceof WebInspector.RemoteObject);

        // Treat the same as an array-index just with different strings and widths.
        _get(Object.getPrototypeOf(ObjectTreeMapEntryTreeElement.prototype), "constructor", this).call(this, object, propertyPath);

        this._object = object;

        this.addClassName("object-tree-array-index");
        this.addClassName("object-tree-map-entry");
    }

    // Public

    _createClass(ObjectTreeMapEntryTreeElement, [{
        key: "resolvedValue",

        // Protected

        value: function resolvedValue() {
            return this._object;
        }
    }, {
        key: "propertyPathType",
        value: function propertyPathType() {
            return WebInspector.PropertyPath.Type.Value;
        }
    }, {
        key: "titleFragment",
        value: function titleFragment() {
            var container = document.createDocumentFragment();

            var propertyPath = this.resolvedValuePropertyPath();

            // Index name.
            var nameElement = container.appendChild(document.createElement("span"));
            nameElement.className = "index-name";
            nameElement.textContent = this.displayPropertyName();
            nameElement.title = this.propertyPathString(propertyPath);

            // Value.
            var valueElement = container.appendChild(document.createElement("span"));
            valueElement.className = "index-value";
            valueElement.appendChild(WebInspector.FormattedValue.createObjectTreeOrFormattedValueForRemoteObject(this._object, propertyPath));

            return container;
        }
    }, {
        key: "object",
        get: function get() {
            return this._object;
        }
    }]);

    return ObjectTreeMapEntryTreeElement;
})(WebInspector.ObjectTreeBaseTreeElement);

WebInspector.ObjectTreeMapKeyTreeElement = (function (_WebInspector$ObjectTreeMapEntryTreeElement) {
    _inherits(ObjectTreeMapKeyTreeElement, _WebInspector$ObjectTreeMapEntryTreeElement);

    function ObjectTreeMapKeyTreeElement(object, propertyPath) {
        _classCallCheck(this, ObjectTreeMapKeyTreeElement);

        _get(Object.getPrototypeOf(ObjectTreeMapKeyTreeElement.prototype), "constructor", this).call(this, object, propertyPath);

        this.mainTitle = this.titleFragment();

        this.addClassName("key");
    }

    // Protected

    _createClass(ObjectTreeMapKeyTreeElement, [{
        key: "displayPropertyName",
        value: function displayPropertyName() {
            return WebInspector.UIString("key");
        }
    }, {
        key: "resolvedValuePropertyPath",
        value: function resolvedValuePropertyPath() {
            return this._propertyPath.appendMapKey(this._object);
        }
    }]);

    return ObjectTreeMapKeyTreeElement;
})(WebInspector.ObjectTreeMapEntryTreeElement);

WebInspector.ObjectTreeMapValueTreeElement = (function (_WebInspector$ObjectTreeMapEntryTreeElement2) {
    _inherits(ObjectTreeMapValueTreeElement, _WebInspector$ObjectTreeMapEntryTreeElement2);

    function ObjectTreeMapValueTreeElement(object, propertyPath, key) {
        _classCallCheck(this, ObjectTreeMapValueTreeElement);

        _get(Object.getPrototypeOf(ObjectTreeMapValueTreeElement.prototype), "constructor", this).call(this, object, propertyPath);

        this._key = key;

        this.mainTitle = this.titleFragment();

        this.addClassName("value");
    }

    // Protected

    _createClass(ObjectTreeMapValueTreeElement, [{
        key: "displayPropertyName",
        value: function displayPropertyName() {
            return WebInspector.UIString("value");
        }
    }, {
        key: "resolvedValuePropertyPath",
        value: function resolvedValuePropertyPath() {
            return this._propertyPath.appendMapValue(this._object, this._key);
        }
    }]);

    return ObjectTreeMapValueTreeElement;
})(WebInspector.ObjectTreeMapEntryTreeElement);
