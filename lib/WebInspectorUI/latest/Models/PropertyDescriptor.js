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

WebInspector.PropertyDescriptor = (function (_WebInspector$Object) {
    _inherits(PropertyDescriptor, _WebInspector$Object);

    function PropertyDescriptor(descriptor, symbol, isOwnProperty, wasThrown, nativeGetter, isInternalProperty) {
        _classCallCheck(this, PropertyDescriptor);

        _get(Object.getPrototypeOf(PropertyDescriptor.prototype), "constructor", this).call(this);

        console.assert(descriptor);
        console.assert(descriptor.name);
        console.assert(!descriptor.value || descriptor.value instanceof WebInspector.RemoteObject);
        console.assert(!descriptor.get || descriptor.get instanceof WebInspector.RemoteObject);
        console.assert(!descriptor.set || descriptor.set instanceof WebInspector.RemoteObject);
        console.assert(!symbol || symbol instanceof WebInspector.RemoteObject);

        this._name = descriptor.name;
        this._value = descriptor.value;
        this._hasValue = "value" in descriptor;
        this._get = descriptor.get;
        this._set = descriptor.set;
        this._symbol = symbol;

        this._writable = descriptor.writable || false;
        this._configurable = descriptor.configurable || false;
        this._enumerable = descriptor.enumerable || false;

        this._own = isOwnProperty || false;
        this._wasThrown = wasThrown || false;
        this._nativeGetterValue = nativeGetter || false;
        this._internal = isInternalProperty || false;
    }

    // Static

    // Runtime.PropertyDescriptor or Runtime.InternalPropertyDescriptor (second argument).

    _createClass(PropertyDescriptor, [{
        key: "hasValue",
        value: function hasValue() {
            return this._hasValue;
        }
    }, {
        key: "hasGetter",
        value: function hasGetter() {
            return this._get && this._get.type === "function";
        }
    }, {
        key: "hasSetter",
        value: function hasSetter() {
            return this._set && this._set.type === "function";
        }
    }, {
        key: "isIndexProperty",
        value: function isIndexProperty() {
            return !isNaN(Number(this._name));
        }
    }, {
        key: "isSymbolProperty",
        value: function isSymbolProperty() {
            return !!this._symbol;
        }
    }, {
        key: "name",

        // Public

        get: function get() {
            return this._name;
        }
    }, {
        key: "value",
        get: function get() {
            return this._value;
        }
    }, {
        key: "get",
        get: function get() {
            return this._get;
        }
    }, {
        key: "set",
        get: function get() {
            return this._set;
        }
    }, {
        key: "writable",
        get: function get() {
            return this._writable;
        }
    }, {
        key: "configurable",
        get: function get() {
            return this._configurable;
        }
    }, {
        key: "enumerable",
        get: function get() {
            return this._enumerable;
        }
    }, {
        key: "symbol",
        get: function get() {
            return this._symbol;
        }
    }, {
        key: "isOwnProperty",
        get: function get() {
            return this._own;
        }
    }, {
        key: "wasThrown",
        get: function get() {
            return this._wasThrown;
        }
    }, {
        key: "nativeGetter",
        get: function get() {
            return this._nativeGetterValue;
        }
    }, {
        key: "isInternalProperty",
        get: function get() {
            return this._internal;
        }
    }], [{
        key: "fromPayload",
        value: function fromPayload(payload, internal) {
            if (payload.value) payload.value = WebInspector.RemoteObject.fromPayload(payload.value);
            if (payload.get) payload.get = WebInspector.RemoteObject.fromPayload(payload.get);
            if (payload.set) payload.set = WebInspector.RemoteObject.fromPayload(payload.set);

            if (payload.symbol) payload.symbol = WebInspector.RemoteObject.fromPayload(payload.symbol);

            if (internal) {
                console.assert(payload.value);
                payload.writable = payload.configurable = payload.enumerable = false;
                payload.isOwn = true;
            }

            return new WebInspector.PropertyDescriptor(payload, payload.symbol, payload.isOwn, payload.wasThrown, payload.nativeGetter, internal);
        }
    }]);

    return PropertyDescriptor;
})(WebInspector.Object);
