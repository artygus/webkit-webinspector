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

WebInspector.DatabaseContentView = (function (_WebInspector$ContentView) {
    _inherits(DatabaseContentView, _WebInspector$ContentView);

    function DatabaseContentView(representedObject) {
        _classCallCheck(this, DatabaseContentView);

        _get(Object.getPrototypeOf(DatabaseContentView.prototype), "constructor", this).call(this, representedObject);

        this.database = representedObject;

        this.element.classList.add("storage-view", "query", "monospace");

        this._promptElement = document.createElement("div");
        this._promptElement.classList.add("database-query-prompt");
        this.element.appendChild(this._promptElement);

        this.prompt = new WebInspector.ConsolePrompt(this, "text/x-sql");
        this._promptElement.appendChild(this.prompt.element);

        this.element.addEventListener("click", this._messagesClicked.bind(this), true);
    }

    // Public

    _createClass(DatabaseContentView, [{
        key: "shown",
        value: function shown() {
            this.prompt.shown();
        }
    }, {
        key: "updateLayout",
        value: function updateLayout() {
            this.prompt.updateLayout();

            var results = this.element.querySelectorAll(".database-query-result");
            for (var i = 0; i < results.length; ++i) {
                var resultElement = results[i];
                if (resultElement.dataGrid) resultElement.dataGrid.updateLayout();
            }
        }
    }, {
        key: "saveToCookie",
        value: function saveToCookie(cookie) {
            cookie.type = WebInspector.ContentViewCookieType.Database;
            cookie.host = this.representedObject.host;
            cookie.name = this.representedObject.name;
        }
    }, {
        key: "consolePromptCompletionsNeeded",
        value: function consolePromptCompletionsNeeded(prompt, defaultCompletions, base, prefix, suffix) {
            var results = [];

            prefix = prefix.toLowerCase();

            function accumulateMatches(textArray) {
                for (var i = 0; i < textArray.length; ++i) {
                    var lowerCaseText = textArray[i].toLowerCase();
                    if (lowerCaseText.startsWith(prefix)) results.push(textArray[i]);
                }
            }

            function tableNamesCallback(tableNames) {
                accumulateMatches(tableNames);
                accumulateMatches(["SELECT", "FROM", "WHERE", "LIMIT", "DELETE FROM", "CREATE", "DROP", "TABLE", "INDEX", "UPDATE", "INSERT INTO", "VALUES"]);

                this.prompt.updateCompletions(results, " ");
            }

            this.database.getTableNames(tableNamesCallback.bind(this));
        }
    }, {
        key: "consolePromptTextCommitted",
        value: function consolePromptTextCommitted(prompt, query) {
            this.database.executeSQL(query, this._queryFinished.bind(this, query), this._queryError.bind(this, query));
        }

        // Private

    }, {
        key: "_messagesClicked",
        value: function _messagesClicked() {
            this.prompt.focus();
        }
    }, {
        key: "_queryFinished",
        value: function _queryFinished(query, columnNames, values) {
            var dataGrid = WebInspector.DataGrid.createSortableDataGrid(columnNames, values);
            var trimmedQuery = query.trim();

            if (dataGrid) {
                dataGrid.element.classList.add("inline");
                this._appendViewQueryResult(trimmedQuery, dataGrid);
                dataGrid.autoSizeColumns(5);
            }

            if (trimmedQuery.match(/^create /i) || trimmedQuery.match(/^drop table /i)) this.dispatchEventToListeners(WebInspector.DatabaseContentView.Event.SchemaUpdated, this.database);
        }
    }, {
        key: "_queryError",
        value: function _queryError(query, error) {
            if (error.message) var message = error.message;else if (error.code === 2) var message = WebInspector.UIString("Database no longer has expected version.");else var message = WebInspector.UIString("An unexpected error %s occurred.").format(error.code);

            this._appendErrorQueryResult(query, message);
        }
    }, {
        key: "_appendViewQueryResult",
        value: function _appendViewQueryResult(query, view) {
            var resultElement = this._appendQueryResult(query);

            // Add our DataGrid with the results to the database query result div.
            resultElement.dataGrid = view;
            resultElement.appendChild(view.element);

            this._promptElement.scrollIntoView(false);
        }
    }, {
        key: "_appendErrorQueryResult",
        value: function _appendErrorQueryResult(query, errorText) {
            var resultElement = this._appendQueryResult(query);
            resultElement.classList.add("error");
            resultElement.textContent = errorText;

            this._promptElement.scrollIntoView(false);
        }
    }, {
        key: "_appendQueryResult",
        value: function _appendQueryResult(query) {
            var element = document.createElement("div");
            element.className = "database-user-query";
            this.element.insertBefore(element, this._promptElement);

            var commandTextElement = document.createElement("span");
            commandTextElement.className = "database-query-text";
            commandTextElement.textContent = query;
            element.appendChild(commandTextElement);

            var resultElement = document.createElement("div");
            resultElement.className = "database-query-result";
            element.appendChild(resultElement);
            return resultElement;
        }
    }]);

    return DatabaseContentView;
})(WebInspector.ContentView);

WebInspector.DatabaseContentView.Event = {
    SchemaUpdated: "SchemaUpdated"
};
