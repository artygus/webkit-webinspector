var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * Copyright (C) 2009 Google Inc. All rights reserved.
 * Copyright (C) 2015 Apple Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

WebInspector.RemoteObject = (function () {
    function RemoteObject(objectId, type, subtype, value, description, size, classPrototype, className, preview) {
        _classCallCheck(this, RemoteObject);

        console.assert(type);
        console.assert(!preview || preview instanceof WebInspector.ObjectPreview);

        this._type = type;
        this._subtype = subtype;

        if (objectId) {
            // Object, Function, or Symbol.
            console.assert(!subtype || typeof subtype === "string");
            console.assert(!description || typeof description === "string");
            console.assert(!value);

            this._objectId = objectId;
            this._description = description || "";
            this._hasChildren = type !== "symbol";
            this._size = size;
            this._classPrototype = classPrototype;
            this._preview = preview;

            if (subtype === "class") {
                this._functionDescription = this._description;
                this._description = "class " + className;
            }
        } else {
            // Primitive or null.
            console.assert(type !== "object" || value === null);
            console.assert(!preview);

            this._description = description || value + "";
            this._hasChildren = false;
            this._value = value;
        }
    }

    // Static

    _createClass(RemoteObject, [{
        key: "hasSize",
        value: function hasSize() {
            return this.isArray() || this.isCollectionType();
        }
    }, {
        key: "hasValue",
        value: function hasValue() {
            return "_value" in this;
        }
    }, {
        key: "getOwnPropertyDescriptors",
        value: function getOwnPropertyDescriptors(callback) {
            this._getPropertyDescriptors(true, callback);
        }
    }, {
        key: "getAllPropertyDescriptors",
        value: function getAllPropertyDescriptors(callback) {
            this._getPropertyDescriptors(false, callback);
        }
    }, {
        key: "getDisplayablePropertyDescriptors",
        value: function getDisplayablePropertyDescriptors(callback) {
            if (!this._objectId || this._isSymbol() || this._isFakeObject()) {
                callback([]);
                return;
            }

            // COMPATIBILITY (iOS 8): RuntimeAgent.getDisplayableProperties did not exist.
            // Here we do our best to reimplement it by getting all properties and reducing them down.
            if (!RuntimeAgent.getDisplayableProperties) {
                RuntimeAgent.getProperties(this._objectId, (function (error, allProperties) {
                    var ownOrGetterPropertiesList = [];
                    if (allProperties) {
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = allProperties[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var property = _step.value;

                                if (property.isOwn || property.name === "__proto__") {
                                    // Own property or getter property in prototype chain.
                                    ownOrGetterPropertiesList.push(property);
                                } else if (property.value && property.name !== property.name.toUpperCase()) {
                                    var type = property.value.type;
                                    if (type && type !== "function" && property.name !== "constructor") {
                                        // Possible native binding getter property converted to a value. Also, no CONSTANT name style and not "constructor".
                                        // There is no way of knowing if this is native or not, so just go with it.
                                        ownOrGetterPropertiesList.push(property);
                                    }
                                }
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

                    this._getPropertyDescriptorsResolver(callback, error, ownOrGetterPropertiesList);
                }).bind(this));
                return;
            }

            RuntimeAgent.getDisplayableProperties(this._objectId, true, this._getPropertyDescriptorsResolver.bind(this, callback));
        }

        // FIXME: Phase out these deprecated functions. They return DeprecatedRemoteObjectProperty instead of PropertyDescriptors.
    }, {
        key: "deprecatedGetOwnProperties",
        value: function deprecatedGetOwnProperties(callback) {
            this._deprecatedGetProperties(true, callback);
        }
    }, {
        key: "deprecatedGetAllProperties",
        value: function deprecatedGetAllProperties(callback) {
            this._deprecatedGetProperties(false, callback);
        }
    }, {
        key: "deprecatedGetDisplayableProperties",
        value: function deprecatedGetDisplayableProperties(callback) {
            if (!this._objectId || this._isSymbol() || this._isFakeObject()) {
                callback([]);
                return;
            }

            // COMPATIBILITY (iOS 8): RuntimeAgent.getProperties did not support ownerAndGetterProperties.
            // Here we do our best to reimplement it by getting all properties and reducing them down.
            if (!RuntimeAgent.getDisplayableProperties) {
                RuntimeAgent.getProperties(this._objectId, (function (error, allProperties) {
                    var ownOrGetterPropertiesList = [];
                    if (allProperties) {
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = allProperties[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var property = _step2.value;

                                if (property.isOwn || property.get || property.name === "__proto__") {
                                    // Own property or getter property in prototype chain.
                                    ownOrGetterPropertiesList.push(property);
                                } else if (property.value && property.name !== property.name.toUpperCase()) {
                                    var type = property.value.type;
                                    if (type && type !== "function" && property.name !== "constructor") {
                                        // Possible native binding getter property converted to a value. Also, no CONSTANT name style and not "constructor".
                                        ownOrGetterPropertiesList.push(property);
                                    }
                                }
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
                    }

                    this._deprecatedGetPropertiesResolver(callback, error, ownOrGetterPropertiesList);
                }).bind(this));
                return;
            }

            RuntimeAgent.getDisplayableProperties(this._objectId, this._deprecatedGetPropertiesResolver.bind(this, callback));
        }
    }, {
        key: "setPropertyValue",
        value: function setPropertyValue(name, value, callback) {
            if (!this._objectId || this._isSymbol() || this._isFakeObject()) {
                callback("Can't set a property of non-object.");
                return;
            }

            // FIXME: It doesn't look like setPropertyValue is used yet. This will need to be tested when it is again (editable ObjectTrees).
            RuntimeAgent.evaluate.invoke({ expression: appendWebInspectorSourceURL(value), doNotPauseOnExceptionsAndMuteConsole: true }, evaluatedCallback.bind(this));

            function evaluatedCallback(error, result, wasThrown) {
                if (error || wasThrown) {
                    callback(error || result.description);
                    return;
                }

                function setPropertyValue(propertyName, propertyValue) {
                    this[propertyName] = propertyValue;
                }

                delete result.description; // Optimize on traffic.

                RuntimeAgent.callFunctionOn(this._objectId, appendWebInspectorSourceURL(setPropertyValue.toString()), [{ value: name }, result], true, undefined, propertySetCallback.bind(this));

                if (result._objectId) RuntimeAgent.releaseObject(result._objectId);
            }

            function propertySetCallback(error, result, wasThrown) {
                if (error || wasThrown) {
                    callback(error || result.description);
                    return;
                }

                callback();
            }
        }
    }, {
        key: "isUndefined",
        value: function isUndefined() {
            return this._type === "undefined";
        }
    }, {
        key: "isNode",
        value: function isNode() {
            return this._subtype === "node";
        }
    }, {
        key: "isArray",
        value: function isArray() {
            return this._subtype === "array";
        }
    }, {
        key: "isClass",
        value: function isClass() {
            return this._subtype === "class";
        }
    }, {
        key: "isCollectionType",
        value: function isCollectionType() {
            return this._subtype === "map" || this._subtype === "set" || this._subtype === "weakmap" || this._subtype === "weakset";
        }
    }, {
        key: "isWeakCollection",
        value: function isWeakCollection() {
            return this._subtype === "weakmap" || this._subtype === "weakset";
        }
    }, {
        key: "getCollectionEntries",
        value: function getCollectionEntries(start, numberToFetch, callback) {
            start = typeof start === "number" ? start : 0;
            numberToFetch = typeof numberToFetch === "number" ? numberToFetch : 100;

            console.assert(start >= 0);
            console.assert(numberToFetch >= 0);
            console.assert(this.isCollectionType());

            // WeakMaps and WeakSets are not ordered. We should never send a non-zero start.
            console.assert(this._subtype === "weakmap" && start === 0 || this._subtype !== "weakmap");
            console.assert(this._subtype === "weakset" && start === 0 || this._subtype !== "weakset");

            var objectGroup = this.isWeakCollection() ? this._weakCollectionObjectGroup() : "";

            RuntimeAgent.getCollectionEntries(this._objectId, objectGroup, start, numberToFetch, function (error, entries) {
                entries = entries.map(WebInspector.CollectionEntry.fromPayload);
                callback(entries);
            });
        }
    }, {
        key: "releaseWeakCollectionEntries",
        value: function releaseWeakCollectionEntries() {
            console.assert(this.isWeakCollection());

            RuntimeAgent.releaseObjectGroup(this._weakCollectionObjectGroup());
        }
    }, {
        key: "pushNodeToFrontend",
        value: function pushNodeToFrontend(callback) {
            if (this._objectId) WebInspector.domTreeManager.pushNodeToFrontend(this._objectId, callback);else callback(0);
        }
    }, {
        key: "callFunction",
        value: function callFunction(functionDeclaration, args, generatePreview, callback) {
            function mycallback(error, result, wasThrown) {
                result = result ? WebInspector.RemoteObject.fromPayload(result) : null;
                callback(error, result, wasThrown);
            }

            if (args) args = args.map(WebInspector.RemoteObject.createCallArgument);

            RuntimeAgent.callFunctionOn(this._objectId, appendWebInspectorSourceURL(functionDeclaration.toString()), args, true, undefined, generatePreview, mycallback);
        }
    }, {
        key: "callFunctionJSON",
        value: function callFunctionJSON(functionDeclaration, args, callback) {
            function mycallback(error, result, wasThrown) {
                callback(error || wasThrown ? null : result.value);
            }

            RuntimeAgent.callFunctionOn(this._objectId, appendWebInspectorSourceURL(functionDeclaration.toString()), args, true, true, mycallback);
        }
    }, {
        key: "invokeGetter",
        value: function invokeGetter(getterRemoteObject, callback) {
            console.assert(getterRemoteObject instanceof WebInspector.RemoteObject);

            function backendInvokeGetter(getter) {
                return getter ? getter.call(this) : undefined;
            }

            this.callFunction(backendInvokeGetter, [getterRemoteObject], true, callback);
        }
    }, {
        key: "getOwnPropertyDescriptor",
        value: function getOwnPropertyDescriptor(propertyName, callback) {
            function backendGetOwnPropertyDescriptor(propertyName) {
                return this[propertyName];
            }

            function wrappedCallback(error, result, wasThrown) {
                if (error || wasThrown || !(result instanceof WebInspector.RemoteObject)) {
                    callback(null);
                    return;
                }

                var fakeDescriptor = { name: propertyName, value: result, writable: true, configurable: true, enumerable: false };
                var fakePropertyDescriptor = new WebInspector.PropertyDescriptor(fakeDescriptor, null, true, false, false, false);
                callback(fakePropertyDescriptor);
            }

            // FIXME: Implement a real RuntimeAgent.getOwnPropertyDescriptor?
            this.callFunction(backendGetOwnPropertyDescriptor, [propertyName], false, wrappedCallback);
        }
    }, {
        key: "release",
        value: function release() {
            if (this._objectId && !this._isFakeObject()) RuntimeAgent.releaseObject(this._objectId);
        }
    }, {
        key: "arrayLength",
        value: function arrayLength() {
            if (this._subtype !== "array") return 0;

            var matches = this._description.match(/\[([0-9]+)\]/);
            if (!matches) return 0;

            return parseInt(matches[1], 10);
        }
    }, {
        key: "asCallArgument",
        value: function asCallArgument() {
            return WebInspector.RemoteObject.createCallArgument(this);
        }
    }, {
        key: "findFunctionSourceCodeLocation",
        value: function findFunctionSourceCodeLocation() {
            var result = new WebInspector.WrappedPromise();

            if (!this._isFunction() || !this._objectId) {
                result.resolve(WebInspector.RemoteObject.SourceCodeLocationPromise.MissingObjectId);
                return result.promise;
            }

            DebuggerAgent.getFunctionDetails(this._objectId, function (error, response) {
                if (error) {
                    result.reject(error);
                    return;
                }

                var location = response.location;
                var sourceCode = WebInspector.debuggerManager.scriptForIdentifier(location.scriptId);

                if (!sourceCode || sourceCode.url.startsWith("__WebInspector")) {
                    result.resolve(WebInspector.RemoteObject.SourceCodeLocationPromise.NoSourceFound);
                    return;
                }

                var sourceCodeLocation = sourceCode.createSourceCodeLocation(location.lineNumber, location.columnNumber || 0);
                result.resolve(sourceCodeLocation);
            });

            return result.promise;
        }

        // Private

    }, {
        key: "_isFakeObject",
        value: function _isFakeObject() {
            return this._objectId === WebInspector.RemoteObject.FakeRemoteObjectId;
        }
    }, {
        key: "_isSymbol",
        value: function _isSymbol() {
            return this._type === "symbol";
        }
    }, {
        key: "_isFunction",
        value: function _isFunction() {
            return this._type === "function";
        }
    }, {
        key: "_weakCollectionObjectGroup",
        value: function _weakCollectionObjectGroup() {
            return JSON.stringify(this._objectId) + "-" + this._subtype;
        }
    }, {
        key: "_getPropertyDescriptors",
        value: function _getPropertyDescriptors(ownProperties, callback) {
            if (!this._objectId || this._isSymbol() || this._isFakeObject()) {
                callback([]);
                return;
            }

            RuntimeAgent.getProperties(this._objectId, ownProperties, true, this._getPropertyDescriptorsResolver.bind(this, callback));
        }
    }, {
        key: "getOwnPropertyDescriptorsAsObject",
        value: function getOwnPropertyDescriptorsAsObject(callback) {
            this.getOwnPropertyDescriptors(function (properties) {
                var propertiesResult = {};
                var internalPropertiesResult = {};
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = properties[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var propertyDescriptor = _step3.value;

                        var object = propertyDescriptor.isInternalProperty ? internalPropertiesResult : propertiesResult;
                        object[propertyDescriptor.name] = propertyDescriptor;
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

                callback(propertiesResult, internalPropertiesResult);
            });
        }
    }, {
        key: "_getPropertyDescriptorsResolver",
        value: function _getPropertyDescriptorsResolver(callback, error, properties, internalProperties) {
            if (error) {
                callback(null);
                return;
            }

            var descriptors = properties.map(function (payload) {
                return WebInspector.PropertyDescriptor.fromPayload(payload);
            });

            if (internalProperties) {
                descriptors = descriptors.concat(internalProperties.map(function (payload) {
                    return WebInspector.PropertyDescriptor.fromPayload(payload, true);
                }));
            }

            callback(descriptors);
        }

        // FIXME: Phase out these deprecated functions. They return DeprecatedRemoteObjectProperty instead of PropertyDescriptors.
    }, {
        key: "_deprecatedGetProperties",
        value: function _deprecatedGetProperties(ownProperties, callback) {
            if (!this._objectId || this._isSymbol() || this._isFakeObject()) {
                callback([]);
                return;
            }

            RuntimeAgent.getProperties(this._objectId, ownProperties, this._deprecatedGetPropertiesResolver.bind(this, callback));
        }
    }, {
        key: "_deprecatedGetPropertiesResolver",
        value: function _deprecatedGetPropertiesResolver(callback, error, properties, internalProperties) {
            if (error) {
                callback(null);
                return;
            }

            if (internalProperties) {
                properties = properties.concat(internalProperties.map(function (descriptor) {
                    descriptor.writable = false;
                    descriptor.configurable = false;
                    descriptor.enumerable = false;
                    descriptor.isOwn = true;
                    return descriptor;
                }));
            }

            var result = [];
            for (var i = 0; properties && i < properties.length; ++i) {
                var property = properties[i];
                if (property.get || property.set) {
                    if (property.get) result.push(new WebInspector.DeprecatedRemoteObjectProperty("get " + property.name, WebInspector.RemoteObject.fromPayload(property.get), property));
                    if (property.set) result.push(new WebInspector.DeprecatedRemoteObjectProperty("set " + property.name, WebInspector.RemoteObject.fromPayload(property.set), property));
                } else result.push(new WebInspector.DeprecatedRemoteObjectProperty(property.name, WebInspector.RemoteObject.fromPayload(property.value), property));
            }

            callback(result);
        }
    }, {
        key: "objectId",

        // Public

        get: function get() {
            return this._objectId;
        }
    }, {
        key: "type",
        get: function get() {
            return this._type;
        }
    }, {
        key: "subtype",
        get: function get() {
            return this._subtype;
        }
    }, {
        key: "description",
        get: function get() {
            return this._description;
        }
    }, {
        key: "functionDescription",
        get: function get() {
            console.assert(this.type === "function");

            return this._functionDescription || this._description;
        }
    }, {
        key: "hasChildren",
        get: function get() {
            return this._hasChildren;
        }
    }, {
        key: "value",
        get: function get() {
            return this._value;
        }
    }, {
        key: "size",
        get: function get() {
            return this._size || 0;
        }
    }, {
        key: "classPrototype",
        get: function get() {
            return this._classPrototype;
        }
    }, {
        key: "preview",
        get: function get() {
            return this._preview;
        }
    }], [{
        key: "createFakeRemoteObject",
        value: function createFakeRemoteObject() {
            return new WebInspector.RemoteObject(WebInspector.RemoteObject.FakeRemoteObjectId, "object");
        }
    }, {
        key: "fromPrimitiveValue",
        value: function fromPrimitiveValue(value) {
            return new WebInspector.RemoteObject(undefined, typeof value, undefined, value, undefined, undefined, undefined, undefined);
        }
    }, {
        key: "fromPayload",
        value: function fromPayload(payload) {
            console.assert(typeof payload === "object", "Remote object payload should only be an object");

            if (payload.subtype === "array") {
                // COMPATIBILITY (iOS 8): Runtime.RemoteObject did not have size property,
                // instead it was tacked onto the end of the description, like "Array[#]".
                var match = payload.description.match(/\[(\d+)\]$/);
                if (match) {
                    payload.size = parseInt(match[1]);
                    payload.description = payload.description.replace(/\[\d+\]$/, "");
                }
            }

            if (payload.classPrototype) payload.classPrototype = WebInspector.RemoteObject.fromPayload(payload.classPrototype);

            if (payload.preview) {
                // COMPATIBILITY (iOS 8): iOS 7 and 8 did not have type/subtype/description on
                // Runtime.ObjectPreview. Copy them over from the RemoteObject.
                if (!payload.preview.type) {
                    payload.preview.type = payload.type;
                    payload.preview.subtype = payload.subtype;
                    payload.preview.description = payload.description;
                    payload.preview.size = payload.size;
                }

                payload.preview = WebInspector.ObjectPreview.fromPayload(payload.preview);
            }

            return new WebInspector.RemoteObject(payload.objectId, payload.type, payload.subtype, payload.value, payload.description, payload.size, payload.classPrototype, payload.className, payload.preview);
        }
    }, {
        key: "createCallArgument",
        value: function createCallArgument(valueOrObject) {
            if (valueOrObject instanceof WebInspector.RemoteObject) {
                if (valueOrObject.objectId) return { objectId: valueOrObject.objectId };
                return { value: valueOrObject.value };
            }

            return { value: valueOrObject };
        }
    }, {
        key: "resolveNode",
        value: function resolveNode(node, objectGroup, callback) {
            DOMAgent.resolveNode(node.id, objectGroup, function (error, object) {
                if (!callback) return;

                if (error || !object) callback(null);else callback(WebInspector.RemoteObject.fromPayload(object));
            });
        }
    }, {
        key: "type",
        value: function type(remoteObject) {
            if (remoteObject === null) return "null";

            var type = typeof remoteObject;
            if (type !== "object" && type !== "function") return type;

            return remoteObject.type;
        }
    }]);

    return RemoteObject;
})();

WebInspector.RemoteObject.FakeRemoteObjectId = "fake-remote-object";

WebInspector.RemoteObject.SourceCodeLocationPromise = {
    NoSourceFound: "remote-object-source-code-location-promise-no-source-found",
    MissingObjectId: "remote-object-source-code-location-promise-missing-object-id"
};

// FIXME: Phase out this deprecated class.
WebInspector.DeprecatedRemoteObjectProperty = (function () {
    function DeprecatedRemoteObjectProperty(name, value, descriptor) {
        _classCallCheck(this, DeprecatedRemoteObjectProperty);

        this.name = name;
        this.value = value;
        this.enumerable = descriptor ? !!descriptor.enumerable : true;
        this.writable = descriptor ? !!descriptor.writable : true;
        if (descriptor && descriptor.wasThrown) this.wasThrown = true;
    }

    // Static

    _createClass(DeprecatedRemoteObjectProperty, [{
        key: "fromPrimitiveValue",
        value: function fromPrimitiveValue(name, value) {
            return new WebInspector.DeprecatedRemoteObjectProperty(name, WebInspector.RemoteObject.fromPrimitiveValue(value));
        }
    }]);

    return DeprecatedRemoteObjectProperty;
})();
