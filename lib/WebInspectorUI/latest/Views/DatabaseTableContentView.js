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

WebInspector.DatabaseTableContentView = (function (_WebInspector$ContentView) {
    _inherits(DatabaseTableContentView, _WebInspector$ContentView);

    function DatabaseTableContentView(representedObject) {
        _classCallCheck(this, DatabaseTableContentView);

        _get(Object.getPrototypeOf(DatabaseTableContentView.prototype), "constructor", this).call(this, representedObject);

        this.element.classList.add("database-table");

        this._refreshButtonNavigationItem = new WebInspector.ButtonNavigationItem("database-table-refresh", WebInspector.UIString("Refresh"), "Images/ReloadFull.svg", 13, 13);
        this._refreshButtonNavigationItem.addEventListener(WebInspector.ButtonNavigationItem.Event.Clicked, this._refreshButtonClicked, this);

        this.update();
    }

    // Public

    _createClass(DatabaseTableContentView, [{
        key: "update",
        value: function update() {
            this.representedObject.database.executeSQL("SELECT * FROM \"" + this._escapeTableName(this.representedObject.name) + "\"", this._queryFinished.bind(this), this._queryError.bind(this));
        }
    }, {
        key: "updateLayout",
        value: function updateLayout() {
            if (this._dataGrid) this._dataGrid.updateLayout();
        }
    }, {
        key: "saveToCookie",
        value: function saveToCookie(cookie) {
            cookie.type = WebInspector.ContentViewCookieType.DatabaseTable;
            cookie.host = this.representedObject.host;
            cookie.name = this.representedObject.name;
            cookie.database = this.representedObject.database.name;
        }
    }, {
        key: "_escapeTableName",

        // Private

        value: function _escapeTableName(name) {
            return name.replace(/\"/g, "\"\"");
        }
    }, {
        key: "_queryFinished",
        value: function _queryFinished(columnNames, values) {
            // It would be nice to do better than creating a new data grid each time the table is updated, but the table updating
            // doesn't happen very frequently. Additionally, using DataGrid's createSortableDataGrid makes our code much cleaner and it knows
            // how to sort arbitrary columns.
            this.element.removeChildren();

            this._dataGrid = WebInspector.DataGrid.createSortableDataGrid(columnNames, values);
            if (!this._dataGrid || !this._dataGrid.element) {
                this._dataGrid = undefined;

                // If the DataGrid is empty, then we were returned a table with no columns. This can happen when a table has
                // no data, the SELECT query only returns column names when there is data.
                this.element.removeChildren();
                this.element.appendChild(WebInspector.createMessageTextView(WebInspector.UIString("The “%s”\ntable is empty.").format(this.representedObject.name), false));
                return;
            }

            this.element.appendChild(this._dataGrid.element);
            this._dataGrid.updateLayout();
        }
    }, {
        key: "_queryError",
        value: function _queryError(error) {
            this.element.removeChildren();
            this.element.appendChild(WebInspector.createMessageTextView(WebInspector.UIString("An error occured trying to\nread the “%s” table.").format(this.representedObject.name), true));
        }
    }, {
        key: "_refreshButtonClicked",
        value: function _refreshButtonClicked() {
            this.update();
        }
    }, {
        key: "navigationItems",
        get: function get() {
            return [this._refreshButtonNavigationItem];
        }
    }, {
        key: "scrollableElements",
        get: function get() {
            if (!this._dataGrid) return [];
            return [this._dataGrid.scrollContainer];
        }
    }]);

    return DatabaseTableContentView;
})(WebInspector.ContentView);
