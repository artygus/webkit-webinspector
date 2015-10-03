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

WebInspector.ObjectTreePropertyTreeElement = (function (_WebInspector$ObjectTreeBaseTreeElement) {
    _inherits(ObjectTreePropertyTreeElement, _WebInspector$ObjectTreeBaseTreeElement);

    function ObjectTreePropertyTreeElement(property, propertyPath, mode, prototypeName) {
        _classCallCheck(this, ObjectTreePropertyTreeElement);

        _get(Object.getPrototypeOf(ObjectTreePropertyTreeElement.prototype), "constructor", this).call(this, property, propertyPath, property);

        this._mode = mode || WebInspector.ObjectTreeView.Mode.Properties;
        this._prototypeName = prototypeName;

        this.mainTitle = this._titleFragment();
        this.addClassName("object-tree-property");

        if (this.property.hasValue()) {
            this.addClassName(this.property.value.type);
            if (this.property.value.subtype) this.addClassName(this.property.value.subtype);
        } else this.addClassName("accessor");

        if (this.property.wasThrown) this.addClassName("had-error");
        if (this.property.name === "__proto__") this.addClassName("prototype-property");

        this._updateTooltips();
        this._updateHasChildren();
    }

    // Protected

    _createClass(ObjectTreePropertyTreeElement, [{
        key: "onpopulate",
        value: function onpopulate() {
            this._updateChildren();
        }
    }, {
        key: "onexpand",
        value: function onexpand() {
            if (this._previewView) this._previewView.showTitle();
        }
    }, {
        key: "oncollapse",
        value: function oncollapse() {
            if (this._previewView) this._previewView.showPreview();
        }
    }, {
        key: "invokedGetter",
        value: function invokedGetter() {
            this.mainTitle = this._titleFragment();

            var resolvedValue = this.resolvedValue();
            this.addClassName(resolvedValue.type);
            if (resolvedValue.subtype) this.addClassName(resolvedValue.subtype);
            if (this.hadError()) this.addClassName("had-error");
            this.removeClassName("accessor");

            this._updateHasChildren();
        }

        // Private

    }, {
        key: "_updateHasChildren",
        value: function _updateHasChildren() {
            var resolvedValue = this.resolvedValue();
            var valueHasChildren = resolvedValue && resolvedValue.hasChildren;
            var wasThrown = this.hadError();

            if (this._mode === WebInspector.ObjectTreeView.Mode.Properties) this.hasChildren = !wasThrown && valueHasChildren;else this.hasChildren = !wasThrown && valueHasChildren && (this.property.name === "__proto__" || this._alwaysDisplayAsProperty());
        }
    }, {
        key: "_updateTooltips",
        value: function _updateTooltips() {
            var attributes = [];

            if (this.property.configurable) attributes.push("configurable");
            if (this.property.enumerable) attributes.push("enumerable");
            if (this.property.writable) attributes.push("writable");

            this.iconElement.title = attributes.join(" ");
        }
    }, {
        key: "_titleFragment",
        value: function _titleFragment() {
            if (this.property.name === "__proto__") return this._createTitlePrototype();

            if (this._mode === WebInspector.ObjectTreeView.Mode.Properties) return this._createTitlePropertyStyle();else return this._createTitleAPIStyle();
        }
    }, {
        key: "_createTitlePrototype",
        value: function _createTitlePrototype() {
            console.assert(this.property.hasValue());
            console.assert(this.property.name === "__proto__");

            var nameElement = document.createElement("span");
            nameElement.className = "prototype-name";
            nameElement.textContent = WebInspector.UIString("%s Prototype").format(this._sanitizedPrototypeString(this.property.value));
            nameElement.title = this.propertyPathString(this.thisPropertyPath());
            return nameElement;
        }
    }, {
        key: "_createTitlePropertyStyle",
        value: function _createTitlePropertyStyle() {
            var container = document.createDocumentFragment();

            // Property name.
            var nameElement = document.createElement("span");
            nameElement.className = "property-name";
            nameElement.textContent = this.property.name + ": ";
            nameElement.title = this.propertyPathString(this.thisPropertyPath());

            // Property attributes.
            if (this._mode === WebInspector.ObjectTreeView.Mode.Properties) {
                if (!this.property.enumerable) nameElement.classList.add("not-enumerable");
            }

            // Value / Getter Value / Getter.
            var valueOrGetterElement;
            var resolvedValue = this.resolvedValue();
            if (resolvedValue) {
                if (resolvedValue.preview) {
                    this._previewView = new WebInspector.ObjectPreviewView(resolvedValue.preview);
                    valueOrGetterElement = this._previewView.element;
                } else {
                    valueOrGetterElement = WebInspector.FormattedValue.createElementForRemoteObject(resolvedValue, this.hadError());

                    // Special case a function property string.
                    if (resolvedValue.type === "function") valueOrGetterElement.textContent = this._functionPropertyString();
                }
            } else {
                valueOrGetterElement = document.createElement("span");
                if (this.property.hasGetter()) valueOrGetterElement.appendChild(this.createGetterElement(this._mode !== WebInspector.ObjectTreeView.Mode.ClassAPI));
                if (this.property.hasSetter()) valueOrGetterElement.appendChild(this.createSetterElement());
            }

            valueOrGetterElement.classList.add("value");
            if (this.hadError()) valueOrGetterElement.classList.add("error");

            container.appendChild(nameElement);
            container.appendChild(valueOrGetterElement);
            return container;
        }
    }, {
        key: "_createTitleAPIStyle",
        value: function _createTitleAPIStyle() {
            // Fixed values and special properties display like a property.
            if (this._alwaysDisplayAsProperty()) return this._createTitlePropertyStyle();

            // No API to display.
            var isFunction = this.property.hasValue() && this.property.value.type === "function";
            if (!isFunction && !this.property.hasGetter() && !this.property.hasSetter()) return null;

            var container = document.createDocumentFragment();

            // Function / Getter / Setter.
            var nameElement = document.createElement("span");
            nameElement.className = "property-name";
            nameElement.textContent = this.property.name;
            nameElement.title = this.propertyPathString(this.thisPropertyPath());
            container.appendChild(nameElement);

            if (isFunction) {
                var paramElement = document.createElement("span");
                paramElement.className = "function-parameters";
                paramElement.textContent = this._functionParameterString();
                container.appendChild(paramElement);
            } else {
                var spacer = container.appendChild(document.createElement("span"));
                spacer.className = "spacer";
                if (this.property.hasGetter()) container.appendChild(this.createGetterElement(this._mode !== WebInspector.ObjectTreeView.Mode.ClassAPI));
                if (this.property.hasSetter()) container.appendChild(this.createSetterElement());
            }

            return container;
        }
    }, {
        key: "_alwaysDisplayAsProperty",
        value: function _alwaysDisplayAsProperty() {
            // Constructor, though a function, is often better treated as an expandable object.
            if (this.property.name === "constructor") return true;

            // Non-function objects are often better treated as properties.
            if (this.property.hasValue() && this.property.value.type !== "function") return true;

            // Fetched getter value.
            if (this._getterValue) return true;

            return false;
        }
    }, {
        key: "_functionPropertyString",
        value: function _functionPropertyString() {
            return "function" + this._functionParameterString();
        }
    }, {
        key: "_functionParameterString",
        value: function _functionParameterString() {
            var resolvedValue = this.resolvedValue();
            console.assert(resolvedValue.type === "function");

            // For Native methods, the toString is poor. We try to provide good function parameter strings.
            if (isFunctionStringNativeCode(resolvedValue.description)) {
                // Native function on a prototype, likely "Foo.prototype.method".
                if (this._prototypeName) {
                    if (WebInspector.NativePrototypeFunctionParameters[this._prototypeName]) {
                        var params = WebInspector.NativePrototypeFunctionParameters[this._prototypeName][this._property.name];
                        return params ? "(" + params + ")" : "()";
                    }
                }

                var parentDescription = this._propertyPath.object.description;

                // Native function property on a native function is likely a "Foo.method".
                if (isFunctionStringNativeCode(parentDescription)) {
                    var match = parentDescription.match(/^function\s+([^)]+?)\(/);
                    if (match) {
                        var name = match[1];
                        if (WebInspector.NativeConstructorFunctionParameters[name]) {
                            var params = WebInspector.NativeConstructorFunctionParameters[name][this._property.name];
                            return params ? "(" + params + ")" : "()";
                        }
                    }
                }

                // Native DOM constructor or on native objects that are not functions.
                if (parentDescription.endsWith("Constructor") || parentDescription === "Math" || parentDescription === "JSON") {
                    var name = parentDescription;
                    if (WebInspector.NativeConstructorFunctionParameters[name]) {
                        var params = WebInspector.NativeConstructorFunctionParameters[name][this._property.name];
                        return params ? "(" + params + ")" : "()";
                    }
                }
            }

            var match = resolvedValue.functionDescription.match(/^function.*?(\([^)]*?\))/);
            return match ? match[1] : "()";
        }
    }, {
        key: "_sanitizedPrototypeString",
        value: function _sanitizedPrototypeString(value) {
            // FIXME: <https://webkit.org/b/141610> For many X, X.prototype is an X when it must be a plain object
            if (value.type === "function") return "Function";
            if (value.subtype === "date") return "Date";
            if (value.subtype === "regexp") return "RegExp";

            return value.description.replace(/Prototype$/, "");
        }
    }, {
        key: "_updateChildren",
        value: function _updateChildren() {
            if (this.children.length && !this.shouldRefreshChildren) return;

            var resolvedValue = this.resolvedValue();
            if (resolvedValue.isCollectionType() && this._mode === WebInspector.ObjectTreeView.Mode.Properties) resolvedValue.getCollectionEntries(0, 100, this._updateChildrenInternal.bind(this, this._updateEntries, this._mode));else if (this._mode === WebInspector.ObjectTreeView.Mode.ClassAPI) resolvedValue.getOwnPropertyDescriptors(this._updateChildrenInternal.bind(this, this._updateProperties, WebInspector.ObjectTreeView.Mode.ClassAPI));else if (this.property.name === "__proto__") resolvedValue.getOwnPropertyDescriptors(this._updateChildrenInternal.bind(this, this._updateProperties, WebInspector.ObjectTreeView.Mode.PrototypeAPI));else resolvedValue.getDisplayablePropertyDescriptors(this._updateChildrenInternal.bind(this, this._updateProperties, this._mode));
        }
    }, {
        key: "_updateChildrenInternal",
        value: function _updateChildrenInternal(handler, mode, list) {
            this.removeChildren();

            if (!list) {
                var errorMessageElement = WebInspector.ObjectTreeView.createEmptyMessageElement(WebInspector.UIString("Could not fetch properties. Object may no longer exist."));
                this.appendChild(new WebInspector.TreeElement(errorMessageElement, null, false));
                return;
            }

            handler.call(this, list, this.resolvedValuePropertyPath(), mode);
        }
    }, {
        key: "_updateEntries",
        value: function _updateEntries(entries, propertyPath, mode) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = entries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var entry = _step.value;

                    if (entry.key) {
                        this.appendChild(new WebInspector.ObjectTreeMapKeyTreeElement(entry.key, propertyPath));
                        this.appendChild(new WebInspector.ObjectTreeMapValueTreeElement(entry.value, propertyPath, entry.key));
                    } else this.appendChild(new WebInspector.ObjectTreeSetIndexTreeElement(entry.value, propertyPath));
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

            if (!this.children.length) {
                var emptyMessageElement = WebInspector.ObjectTreeView.createEmptyMessageElement(WebInspector.UIString("No Entries."));
                this.appendChild(new WebInspector.TreeElement(emptyMessageElement, null, false));
            }

            // Show the prototype so users can see the API.
            var resolvedValue = this.resolvedValue();
            resolvedValue.getOwnPropertyDescriptor("__proto__", (function (propertyDescriptor) {
                if (propertyDescriptor) this.appendChild(new WebInspector.ObjectTreePropertyTreeElement(propertyDescriptor, propertyPath, mode));
            }).bind(this));
        }
    }, {
        key: "_updateProperties",
        value: function _updateProperties(properties, propertyPath, mode) {
            properties.sort(WebInspector.ObjectTreeView.comparePropertyDescriptors);

            var resolvedValue = this.resolvedValue();
            var isArray = resolvedValue.isArray();
            var isPropertyMode = mode === WebInspector.ObjectTreeView.Mode.Properties || this._getterValue;
            var isAPI = mode !== WebInspector.ObjectTreeView.Mode.Properties;

            var prototypeName;
            if (this.property.name === "__proto__") {
                if (resolvedValue.description) prototypeName = this._sanitizedPrototypeString(resolvedValue);
            }

            var hadProto = false;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = properties[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var propertyDescriptor = _step2.value;

                    // FIXME: If this is a pure API ObjectTree, we should show the native getters.
                    // For now, just skip native binding getters in API mode, since we likely
                    // already showed them in the Properties section.
                    if (isAPI && propertyDescriptor.nativeGetter) continue;

                    // COMPATIBILITY (iOS 8): Sometimes __proto__ is not a value, but a get/set property.
                    // In those cases it is actually not useful to show.
                    if (propertyDescriptor.name === "__proto__" && !propertyDescriptor.hasValue()) continue;

                    if (isArray && isPropertyMode) {
                        if (propertyDescriptor.isIndexProperty()) this.appendChild(new WebInspector.ObjectTreeArrayIndexTreeElement(propertyDescriptor, propertyPath));else if (propertyDescriptor.name === "__proto__") this.appendChild(new WebInspector.ObjectTreePropertyTreeElement(propertyDescriptor, propertyPath, mode, prototypeName));
                    } else this.appendChild(new WebInspector.ObjectTreePropertyTreeElement(propertyDescriptor, propertyPath, mode, prototypeName));

                    if (propertyDescriptor.name === "__proto__") hadProto = true;
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

            if (!this.children.length || hadProto && this.children.length === 1) {
                var emptyMessageElement = WebInspector.ObjectTreeView.createEmptyMessageElement(WebInspector.UIString("No Properties."));
                this.insertChild(new WebInspector.TreeElement(emptyMessageElement, null, false), 0);
            }
        }
    }]);

    return ObjectTreePropertyTreeElement;
})(WebInspector.ObjectTreeBaseTreeElement);
