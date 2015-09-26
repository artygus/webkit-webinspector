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

WebInspector.DatabaseTreeElement = (function (_WebInspector$GeneralTreeElement) {
    _inherits(DatabaseTreeElement, _WebInspector$GeneralTreeElement);

    function DatabaseTreeElement(representedObject) {
        _classCallCheck(this, DatabaseTreeElement);

        console.assert(representedObject instanceof WebInspector.DatabaseObject);

        _get(Object.getPrototypeOf(DatabaseTreeElement.prototype), "constructor", this).call(this, "database-icon", representedObject.name, null, representedObject, true);

        this.small = true;
        this.hasChildren = false;

        // Since we are initially telling the tree element we don't have any children, make sure that we try to populate
        // the tree element (which will get a list of tables) when the element is created.
        this.onpopulate();
    }

    // Overrides from TreeElement (Private)

    _createClass(DatabaseTreeElement, [{
        key: "oncollapse",
        value: function oncollapse() {
            this.shouldRefreshChildren = true;
        }
    }, {
        key: "onpopulate",
        value: function onpopulate() {
            if (this.children.length && !this.shouldRefreshChildren) return;

            this.shouldRefreshChildren = false;

            this.removeChildren();

            function tableNamesCallback(tableNames) {
                for (var i = 0; i < tableNames.length; ++i) {
                    var databaseTable = new WebInspector.DatabaseTableObject(tableNames[i], this.representedObject);
                    this.appendChild(new WebInspector.DatabaseTableTreeElement(databaseTable));
                }

                this.hasChildren = tableNames.length;
            }

            this.representedObject.getTableNames(tableNamesCallback.bind(this));
        }
    }]);

    return DatabaseTreeElement;
})(WebInspector.GeneralTreeElement);
