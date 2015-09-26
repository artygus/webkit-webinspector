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

WebInspector.ObjectTreeView = (function (_WebInspector$Object) {
    _inherits(ObjectTreeView, _WebInspector$Object);

    function ObjectTreeView(object, mode, propertyPath, forceExpanding) {
        _classCallCheck(this, ObjectTreeView);

        _get(Object.getPrototypeOf(ObjectTreeView.prototype), "constructor", this).call(this);

        console.assert(object instanceof WebInspector.RemoteObject);
        console.assert(!propertyPath || propertyPath instanceof WebInspector.PropertyPath);

        var providedPropertyPath = propertyPath instanceof WebInspector.PropertyPath;

        this._object = object;
        this._mode = mode || WebInspector.ObjectTreeView.defaultModeForObject(object);
        this._propertyPath = propertyPath || new WebInspector.PropertyPath(this._object, "this");
        this._expanded = false;
        this._hasLosslessPreview = false;

        // If ObjectTree is used outside of the console, we do not know when to release
        // WeakMap entries. Currently collapse would work. For the console, we can just
        // listen for console clear events. Currently all ObjectTrees are in the console.
        this._inConsole = true;

        // Always force expanding for classes.
        if (this._object.isClass()) forceExpanding = true;

        this._element = document.createElement("div");
        this._element.className = "object-tree";

        if (this._object.preview) {
            this._previewView = new WebInspector.ObjectPreviewView(this._object.preview);
            this._previewView.setOriginatingObjectInfo(this._object, providedPropertyPath ? propertyPath : null);
            this._previewView.element.addEventListener("click", this._handlePreviewOrTitleElementClick.bind(this));
            this._element.appendChild(this._previewView.element);

            if (this._previewView.lossless && !this._propertyPath.parent && !forceExpanding) {
                this._hasLosslessPreview = true;
                this.element.classList.add("lossless-preview");
            }
        } else {
            this._titleElement = document.createElement("span");
            this._titleElement.className = "title";
            this._titleElement.appendChild(WebInspector.FormattedValue.createElementForRemoteObject(this._object));
            this._titleElement.addEventListener("click", this._handlePreviewOrTitleElementClick.bind(this));
            this._element.appendChild(this._titleElement);
        }

        this._outlineElement = document.createElement("ol");
        this._outlineElement.className = "object-tree-outline";
        this._outline = new WebInspector.TreeOutline(this._outlineElement);
        this._element.appendChild(this._outlineElement);

        // FIXME: Support editable ObjectTrees.
    }

    // Static

    _createClass(ObjectTreeView, [{
        key: "expand",
        value: function expand() {
            if (this._expanded) return;

            this._expanded = true;
            this._element.classList.add("expanded");

            if (this._previewView) this._previewView.showTitle();

            this._trackWeakEntries();

            this.update();
        }
    }, {
        key: "collapse",
        value: function collapse() {
            if (!this._expanded) return;

            this._expanded = false;
            this._element.classList.remove("expanded");

            if (this._previewView) this._previewView.showPreview();

            this._untrackWeakEntries();
        }
    }, {
        key: "showOnlyProperties",
        value: function showOnlyProperties() {
            this._inConsole = false;

            this._element.classList.add("properties-only");
        }
    }, {
        key: "appendTitleSuffix",
        value: function appendTitleSuffix(suffixElement) {
            if (this._previewView) this._previewView.element.appendChild(suffixElement);else this._titleElement.appendChild(suffixElement);
        }
    }, {
        key: "appendExtraPropertyDescriptor",
        value: function appendExtraPropertyDescriptor(propertyDescriptor) {
            if (!this._extraProperties) this._extraProperties = [];

            this._extraProperties.push(propertyDescriptor);
        }

        // Protected

    }, {
        key: "update",
        value: function update() {
            if (this._object.isCollectionType() && this._mode === WebInspector.ObjectTreeView.Mode.Properties) this._object.getCollectionEntries(0, 100, this._updateChildren.bind(this, this._updateEntries));else if (this._object.isClass()) this._object.classPrototype.getDisplayablePropertyDescriptors(this._updateChildren.bind(this, this._updateProperties));else this._object.getDisplayablePropertyDescriptors(this._updateChildren.bind(this, this._updateProperties));
        }

        // Private

    }, {
        key: "_updateChildren",
        value: function _updateChildren(handler, list) {
            this._outline.removeChildren();

            if (!list) {
                var errorMessageElement = WebInspector.ObjectTreeView.createEmptyMessageElement(WebInspector.UIString("Could not fetch properties. Object may no longer exist."));
                this._outline.appendChild(new WebInspector.TreeElement(errorMessageElement, null, false));
                return;
            }

            handler.call(this, list, this._propertyPath);

            this.dispatchEventToListeners(WebInspector.ObjectTreeView.Event.Updated);
        }
    }, {
        key: "_updateEntries",
        value: function _updateEntries(entries, propertyPath) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = entries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var entry = _step.value;

                    if (entry.key) {
                        this._outline.appendChild(new WebInspector.ObjectTreeMapKeyTreeElement(entry.key, propertyPath));
                        this._outline.appendChild(new WebInspector.ObjectTreeMapValueTreeElement(entry.value, propertyPath, entry.key));
                    } else this._outline.appendChild(new WebInspector.ObjectTreeSetIndexTreeElement(entry.value, propertyPath));
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

            if (!this._outline.children.length) {
                var emptyMessageElement = WebInspector.ObjectTreeView.createEmptyMessageElement(WebInspector.UIString("No Entries."));
                this._outline.appendChild(new WebInspector.TreeElement(emptyMessageElement, null, false));
            }

            // Show the prototype so users can see the API.
            this._object.getOwnPropertyDescriptor("__proto__", (function (propertyDescriptor) {
                if (propertyDescriptor) this._outline.appendChild(new WebInspector.ObjectTreePropertyTreeElement(propertyDescriptor, propertyPath, this._mode));
            }).bind(this));
        }
    }, {
        key: "_updateProperties",
        value: function _updateProperties(properties, propertyPath) {
            if (this._extraProperties) properties = properties.concat(this._extraProperties);

            properties.sort(WebInspector.ObjectTreeView.comparePropertyDescriptors);

            var isArray = this._object.isArray();
            var isPropertyMode = this._mode === WebInspector.ObjectTreeView.Mode.Properties;

            var hadProto = false;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = properties[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var propertyDescriptor = _step2.value;

                    // COMPATIBILITY (iOS 8): Sometimes __proto__ is not a value, but a get/set property.
                    // In those cases it is actually not useful to show.
                    if (propertyDescriptor.name === "__proto__" && !propertyDescriptor.hasValue()) continue;

                    if (isArray && isPropertyMode) {
                        if (propertyDescriptor.isIndexProperty()) this._outline.appendChild(new WebInspector.ObjectTreeArrayIndexTreeElement(propertyDescriptor, propertyPath));else if (propertyDescriptor.name === "__proto__") this._outline.appendChild(new WebInspector.ObjectTreePropertyTreeElement(propertyDescriptor, propertyPath, this._mode));
                    } else this._outline.appendChild(new WebInspector.ObjectTreePropertyTreeElement(propertyDescriptor, propertyPath, this._mode));

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

            if (!this._outline.children.length || hadProto && this._outline.children.length === 1) {
                var emptyMessageElement = WebInspector.ObjectTreeView.createEmptyMessageElement(WebInspector.UIString("No Properties."));
                this._outline.insertChild(new WebInspector.TreeElement(emptyMessageElement, null, false), 0);
            }
        }
    }, {
        key: "_handlePreviewOrTitleElementClick",
        value: function _handlePreviewOrTitleElementClick(event) {
            if (this._hasLosslessPreview) return;

            if (!this._expanded) this.expand();else this.collapse();

            event.stopPropagation();
        }
    }, {
        key: "_trackWeakEntries",
        value: function _trackWeakEntries() {
            if (this._trackingEntries) return;

            if (!this._object.isWeakCollection()) return;

            this._trackingEntries = true;

            if (this._inConsole) {
                WebInspector.logManager.addEventListener(WebInspector.LogManager.Event.Cleared, this._untrackWeakEntries, this);
                WebInspector.logManager.addEventListener(WebInspector.LogManager.Event.SessionStarted, this._untrackWeakEntries, this);
            }
        }
    }, {
        key: "_untrackWeakEntries",
        value: function _untrackWeakEntries() {
            if (!this._trackingEntries) return;

            if (!this._object.isWeakCollection()) return;

            this._trackingEntries = false;

            this._object.releaseWeakCollectionEntries();

            if (this._inConsole) {
                WebInspector.logManager.removeEventListener(WebInspector.LogManager.Event.Cleared, this._untrackWeakEntries, this);
                WebInspector.logManager.removeEventListener(WebInspector.LogManager.Event.SessionStarted, this._untrackWeakEntries, this);
            }

            // FIXME: This only tries to release weak entries if this object was a WeakMap.
            // If there was a WeakMap expanded in a sub-object, we will never release those values.
            // Should we attempt walking the entire tree and release weak collections?
        }
    }, {
        key: "object",

        // Public

        get: function get() {
            return this._object;
        }
    }, {
        key: "element",
        get: function get() {
            return this._element;
        }
    }, {
        key: "treeOutline",
        get: function get() {
            return this._outline;
        }
    }, {
        key: "expanded",
        get: function get() {
            return this._expanded;
        }
    }], [{
        key: "defaultModeForObject",
        value: function defaultModeForObject(object) {
            if (object.subtype === "class") return WebInspector.ObjectTreeView.Mode.ClassAPI;

            return WebInspector.ObjectTreeView.Mode.Properties;
        }
    }, {
        key: "createEmptyMessageElement",
        value: function createEmptyMessageElement(message) {
            var emptyMessageElement = document.createElement("div");
            emptyMessageElement.className = "empty-message";
            emptyMessageElement.textContent = message;
            return emptyMessageElement;
        }
    }, {
        key: "comparePropertyDescriptors",
        value: function comparePropertyDescriptors(propertyA, propertyB) {
            var a = propertyA.name;
            var b = propertyB.name;

            // Put __proto__ at the bottom.
            if (a === "__proto__") return 1;
            if (b === "__proto__") return -1;

            // Put Internal properties at the top.
            if (propertyA.isInternalProperty && !propertyB.isInternalProperty) return -1;
            if (propertyB.isInternalProperty && !propertyA.isInternalProperty) return 1;

            // Put Symbol properties at the bottom.
            if (propertyA.symbol && !propertyB.symbol) return 1;
            if (propertyB.symbol && !propertyA.symbol) return -1;

            // Symbol properties may have the same description string but be different objects.
            if (a === b) return 0;

            var diff = 0;
            var chunk = /^\d+|^\D+/;
            var chunka, chunkb, anum, bnum;
            while (diff === 0) {
                if (!a && b) return -1;
                if (!b && a) return 1;
                chunka = a.match(chunk)[0];
                chunkb = b.match(chunk)[0];
                anum = !isNaN(chunka);
                bnum = !isNaN(chunkb);
                if (anum && !bnum) return -1;
                if (bnum && !anum) return 1;
                if (anum && bnum) {
                    diff = chunka - chunkb;
                    if (diff === 0 && chunka.length !== chunkb.length) {
                        if (! +chunka && ! +chunkb) // chunks are strings of all 0s (special case)
                            return chunka.length - chunkb.length;else return chunkb.length - chunka.length;
                    }
                } else if (chunka !== chunkb) return chunka < chunkb ? -1 : 1;
                a = a.substring(chunka.length);
                b = b.substring(chunkb.length);
            }
            return diff;
        }
    }]);

    return ObjectTreeView;
})(WebInspector.Object);

WebInspector.ObjectTreeView.Mode = {
    Properties: Symbol("object-tree-properties"), // Properties
    PrototypeAPI: Symbol("object-tree-prototype-api"), // API view on a live object instance, so getters can be invoked.
    ClassAPI: Symbol("object-tree-class-api") };

// API view without an object instance, can not invoke getters.
WebInspector.ObjectTreeView.Event = {
    Updated: "object-tree-updated"
};
