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

WebInspector.TypeTreeElement = (function (_WebInspector$GeneralTreeElement) {
    _inherits(TypeTreeElement, _WebInspector$GeneralTreeElement);

    function TypeTreeElement(name, structureDescription, isPrototype) {
        _classCallCheck(this, TypeTreeElement);

        _get(Object.getPrototypeOf(TypeTreeElement.prototype), "constructor", this).call(this, null, null, null, structureDescription || null, false);

        console.assert(!structureDescription || structureDescription instanceof WebInspector.StructureDescription);

        this._name = name;
        this._structureDescription = structureDescription || null;
        this._isPrototype = isPrototype;

        this._populated = false;
        this._autoExpandedChildren = false;

        this.small = true;
        this.toggleOnClick = true;
        this.selectable = false;
        this.tooltipHandledSeparately = true;
        this.hasChildren = structureDescription;

        var displayName = this._isPrototype ? WebInspector.UIString("%s Prototype").format(name.replace(/Prototype$/, "")) : name;
        var nameElement = document.createElement("span");
        nameElement.classList.add("type-name");
        nameElement.textContent = displayName;
        this.mainTitle = nameElement;

        this.addClassName("type-tree-element");
        if (this._isPrototype) this.addClassName("prototype");
    }

    // Public

    _createClass(TypeTreeElement, [{
        key: "onpopulate",

        // Protected

        value: function onpopulate() {
            if (this._populated) return;

            this._populated = true;

            var properties = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._structureDescription.fields[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var name = _step.value;

                    // FIXME: The backend can send us an empty string. Why? (Symbol?)
                    if (name === "") continue;
                    properties.push({ name: name });
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

            properties.sort(WebInspector.ObjectTreeView.comparePropertyDescriptors);

            var optionalProperties = [];
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._structureDescription.optionalFields[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var name = _step2.value;

                    // FIXME: The backend can send us an empty string. Why? (Symbol?)
                    if (name === "") continue;
                    optionalProperties.push({ name: name + "?" });
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

            optionalProperties.sort(WebInspector.ObjectTreeView.comparePropertyDescriptors);

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = properties[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var property = _step3.value;

                    this.appendChild(new WebInspector.TypeTreeElement(property.name, null));
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

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = optionalProperties[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var property = _step4.value;

                    this.appendChild(new WebInspector.TypeTreeElement(property.name, null));
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
                        _iterator4["return"]();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            if (this._structureDescription.imprecise) {
                var truncatedMessageElement = WebInspector.ObjectTreeView.createEmptyMessageElement("…");
                this.appendChild(new WebInspector.TreeElement(truncatedMessageElement, null, false));
            }

            if (!this.children.length) {
                var emptyMessageElement = WebInspector.ObjectTreeView.createEmptyMessageElement(WebInspector.UIString("No properties."));
                this.appendChild(new WebInspector.TreeElement(emptyMessageElement, null, false));
            }

            console.assert(this.children.length > 0);

            var prototypeStructure = this._structureDescription.prototypeStructure;
            if (prototypeStructure) this.appendChild(new WebInspector.TypeTreeElement(prototypeStructure.constructorName, prototypeStructure, true));
        }
    }, {
        key: "onexpand",
        value: function onexpand() {
            if (this._autoExpandedChildren) return;

            this._autoExpandedChildren = true;

            // On first expand, auto-expand children until "Object".
            var lastChild = this.children[this.children.length - 1];
            if (lastChild && lastChild.hasChildren && lastChild.isPrototype && lastChild.name !== "Object") lastChild.expand();
        }
    }, {
        key: "name",
        get: function get() {
            return this._name;
        }
    }, {
        key: "isPrototype",
        get: function get() {
            return this._isPrototype;
        }
    }]);

    return TypeTreeElement;
})(WebInspector.GeneralTreeElement);
