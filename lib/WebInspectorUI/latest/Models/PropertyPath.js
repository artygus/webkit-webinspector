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

WebInspector.PropertyPath = (function (_WebInspector$Object) {
    _inherits(PropertyPath, _WebInspector$Object);

    function PropertyPath(object, pathComponent, parent, isPrototype) {
        _classCallCheck(this, PropertyPath);

        _get(Object.getPrototypeOf(PropertyPath.prototype), "constructor", this).call(this);

        console.assert(object instanceof WebInspector.RemoteObject || object === null);
        console.assert(!pathComponent || typeof pathComponent === "string");
        console.assert(!parent || parent instanceof WebInspector.PropertyPath);
        console.assert(!parent || pathComponent.length);

        // We allow property pathes with null objects as end-caps only.
        // Disallow appending to a PropertyPath with null objects.
        if (parent && !parent.object) throw new Error("Attempted to append to a PropertyPath with null object.");

        this._object = object;
        this._pathComponent = typeof pathComponent === "string" ? pathComponent : null;
        this._parent = parent || null;
        this._isPrototype = isPrototype || false;
    }

    // Static

    _createClass(PropertyPath, [{
        key: "displayPath",
        value: function displayPath(type) {
            return type === WebInspector.PropertyPath.Type.Value ? this.reducedPath : this.fullPath;
        }
    }, {
        key: "isRoot",
        value: function isRoot() {
            return !this._parent;
        }
    }, {
        key: "isScope",
        value: function isScope() {
            return this._pathComponent === WebInspector.PropertyPath.SpecialPathComponent.EmptyPathComponentForScope;
        }
    }, {
        key: "isPathComponentImpossible",
        value: function isPathComponentImpossible() {
            return this._pathComponent && this._pathComponent.startsWith("@");
        }
    }, {
        key: "isFullPathImpossible",
        value: function isFullPathImpossible() {
            if (this.isPathComponentImpossible()) return true;

            if (this._parent) return this._parent.isFullPathImpossible();

            return false;
        }
    }, {
        key: "appendPropertyName",
        value: function appendPropertyName(object, propertyName) {
            var isPrototype = propertyName === "__proto__";

            if (this.isScope()) return new WebInspector.PropertyPath(object, propertyName, this, isPrototype);

            var component = this._canPropertyNameBeDotAccess(propertyName) ? "." + propertyName : "[" + doubleQuotedString(propertyName) + "]";
            return new WebInspector.PropertyPath(object, component, this, isPrototype);
        }
    }, {
        key: "appendPropertySymbol",
        value: function appendPropertySymbol(object, symbolName) {
            var component = WebInspector.PropertyPath.SpecialPathComponent.SymbolPropertyName + (symbolName.length ? "(" + symbolName + ")" : "");
            return new WebInspector.PropertyPath(object, component, this);
        }
    }, {
        key: "appendInternalPropertyName",
        value: function appendInternalPropertyName(object, propertyName) {
            var component = WebInspector.PropertyPath.SpecialPathComponent.InternalPropertyName + "[" + propertyName + "]";
            return new WebInspector.PropertyPath(object, component, this);
        }
    }, {
        key: "appendGetterPropertyName",
        value: function appendGetterPropertyName(object, propertyName) {
            var component = ".__lookupGetter__(" + doubleQuotedString(propertyName) + ")";
            return new WebInspector.PropertyPath(object, component, this);
        }
    }, {
        key: "appendSetterPropertyName",
        value: function appendSetterPropertyName(object, propertyName) {
            var component = ".__lookupSetter__(" + doubleQuotedString(propertyName) + ")";
            return new WebInspector.PropertyPath(object, component, this);
        }
    }, {
        key: "appendArrayIndex",
        value: function appendArrayIndex(object, indexString) {
            var component = "[" + indexString + "]";
            return new WebInspector.PropertyPath(object, component, this);
        }
    }, {
        key: "appendMapKey",
        value: function appendMapKey(object) {
            var component = WebInspector.PropertyPath.SpecialPathComponent.MapKey;
            return new WebInspector.PropertyPath(object, component, this);
        }
    }, {
        key: "appendMapValue",
        value: function appendMapValue(object, keyObject) {
            console.assert(!keyObject || keyObject instanceof WebInspector.RemoteObject);

            if (keyObject && keyObject.hasValue()) {
                if (keyObject.type === "string") {
                    var component = ".get(" + doubleQuotedString(keyObject.description) + ")";
                    return new WebInspector.PropertyPath(object, component, this);
                }

                var component = ".get(" + keyObject.description + ")";
                return new WebInspector.PropertyPath(object, component, this);
            }

            var component = WebInspector.PropertyPath.SpecialPathComponent.MapValue;
            return new WebInspector.PropertyPath(object, component, this);
        }
    }, {
        key: "appendSetIndex",
        value: function appendSetIndex(object) {
            var component = WebInspector.PropertyPath.SpecialPathComponent.SetIndex;
            return new WebInspector.PropertyPath(object, component, this);
        }
    }, {
        key: "appendSymbolProperty",
        value: function appendSymbolProperty(object) {
            var component = WebInspector.PropertyPath.SpecialPathComponent.SymbolPropertyName;
            return new WebInspector.PropertyPath(object, component, this);
        }
    }, {
        key: "appendPropertyDescriptor",
        value: function appendPropertyDescriptor(object, descriptor, type) {
            console.assert(descriptor instanceof WebInspector.PropertyDescriptor);

            if (descriptor.isInternalProperty) return this.appendInternalPropertyName(object, descriptor.name);
            if (descriptor.symbol) return this.appendSymbolProperty(object);

            if (type === WebInspector.PropertyPath.Type.Getter) return this.appendGetterPropertyName(object, descriptor.name);
            if (type === WebInspector.PropertyPath.Type.Setter) return this.appendSetterPropertyName(object, descriptor.name);

            console.assert(type === WebInspector.PropertyPath.Type.Value);

            if (this._object.subtype === "array" && !isNaN(parseInt(descriptor.name))) return this.appendArrayIndex(object, descriptor.name);

            return this.appendPropertyName(object, descriptor.name);
        }

        // Private

    }, {
        key: "_canPropertyNameBeDotAccess",
        value: function _canPropertyNameBeDotAccess(propertyName) {
            return (/^(?![0-9])\w+$/.test(propertyName)
            );
        }
    }, {
        key: "object",

        // Public

        get: function get() {
            return this._object;
        }
    }, {
        key: "parent",
        get: function get() {
            return this._parent;
        }
    }, {
        key: "isPrototype",
        get: function get() {
            return this._isPrototype;
        }
    }, {
        key: "rootObject",
        get: function get() {
            return this._parent ? this._parent.rootObject : this._object;
        }
    }, {
        key: "lastNonPrototypeObject",
        get: function get() {
            if (!this._parent) return this._object;

            var p = this._parent;
            while (p) {
                if (!p.isPrototype) break;
                if (!p.parent) break;
                p = p.parent;
            }

            return p.object;
        }
    }, {
        key: "pathComponent",
        get: function get() {
            return this._pathComponent;
        }
    }, {
        key: "fullPath",
        get: function get() {
            var components = [];
            for (var p = this; p && p.pathComponent; p = p.parent) components.push(p.pathComponent);
            components.reverse();
            return components.join("");
        }
    }, {
        key: "reducedPath",
        get: function get() {
            // The display path for a value should not include __proto__.
            // The path for "foo.__proto__.bar.__proto__.x" is better shown as "foo.bar.x".
            // FIXME: We should keep __proto__ if this property was overridden.
            var components = [];

            var p = this;

            // Include trailing __proto__s.
            for (; p && p.isPrototype; p = p.parent) components.push(p.pathComponent);

            // Skip other __proto__s.
            for (; p && p.pathComponent; p = p.parent) {
                if (p.isPrototype) continue;
                components.push(p.pathComponent);
            }

            components.reverse();
            return components.join("");
        }
    }], [{
        key: "emptyPropertyPathForScope",
        value: function emptyPropertyPathForScope(object) {
            return new WebInspector.PropertyPath(object, WebInspector.PropertyPath.SpecialPathComponent.EmptyPathComponentForScope);
        }
    }]);

    return PropertyPath;
})(WebInspector.Object);

WebInspector.PropertyPath.SpecialPathComponent = {
    InternalPropertyName: "@internal",
    SymbolPropertyName: "@symbol",
    MapKey: "@mapkey",
    MapValue: "@mapvalue",
    SetIndex: "@setindex",
    EmptyPathComponentForScope: ""
};

WebInspector.PropertyPath.Type = {
    Value: "value",
    Getter: "getter",
    Setter: "setter"
};
