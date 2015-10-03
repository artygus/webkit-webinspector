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

WebInspector.ConsolePrompt = (function (_WebInspector$Object) {
    _inherits(ConsolePrompt, _WebInspector$Object);

    function ConsolePrompt(delegate, mimeType, element) {
        _classCallCheck(this, ConsolePrompt);

        _get(Object.getPrototypeOf(ConsolePrompt.prototype), "constructor", this).call(this);

        mimeType = parseMIMEType(mimeType).type;

        this._element = element || document.createElement("div");
        this._element.classList.add("console-prompt", WebInspector.SyntaxHighlightedStyleClassName);

        this._delegate = delegate || null;

        this._codeMirror = CodeMirror(this.element, {
            lineWrapping: true,
            mode: mimeType,
            indentWithTabs: true,
            indentUnit: 4,
            matchBrackets: true
        });

        var keyMap = {
            "Up": this._handlePreviousKey.bind(this),
            "Down": this._handleNextKey.bind(this),
            "Ctrl-P": this._handlePreviousKey.bind(this),
            "Ctrl-N": this._handleNextKey.bind(this),
            "Enter": this._handleEnterKey.bind(this),
            "Cmd-Enter": this._handleCommandEnterKey.bind(this),
            "Tab": this._handleTabKey.bind(this),
            "Esc": this._handleEscapeKey.bind(this)
        };

        this._codeMirror.addKeyMap(keyMap);

        this._completionController = new WebInspector.CodeMirrorCompletionController(this._codeMirror, this);
        this._completionController.addExtendedCompletionProvider("javascript", WebInspector.javaScriptRuntimeCompletionProvider);

        this._history = [{}];
        this._historyIndex = 0;
    }

    // Public

    _createClass(ConsolePrompt, [{
        key: "focus",
        value: function focus() {
            this._codeMirror.focus();
        }
    }, {
        key: "shown",
        value: function shown() {
            this._codeMirror.refresh();
        }
    }, {
        key: "updateLayout",
        value: function updateLayout() {
            this._codeMirror.refresh();
        }
    }, {
        key: "updateCompletions",
        value: function updateCompletions(completions, implicitSuffix) {
            this._completionController.updateCompletions(completions, implicitSuffix);
        }
    }, {
        key: "pushHistoryItem",
        value: function pushHistoryItem(text) {
            this._commitHistoryEntry({ text: text });
        }

        // Protected

    }, {
        key: "completionControllerCompletionsNeeded",
        value: function completionControllerCompletionsNeeded(completionController, prefix, defaultCompletions, base, suffix, forced) {
            if (this.delegate && typeof this.delegate.consolePromptCompletionsNeeded === "function") this.delegate.consolePromptCompletionsNeeded(this, defaultCompletions, base, prefix, suffix, forced);else this._completionController.updateCompletions(defaultCompletions);
        }
    }, {
        key: "completionControllerShouldAllowEscapeCompletion",
        value: function completionControllerShouldAllowEscapeCompletion(completionController) {
            // Only allow escape to complete if there is text in the prompt. Otherwise allow it to pass through
            // so escape to toggle the quick console still works.
            return !!this.text;
        }

        // Private

    }, {
        key: "_handleTabKey",
        value: function _handleTabKey(codeMirror) {
            var cursor = codeMirror.getCursor();
            var line = codeMirror.getLine(cursor.line);

            if (!line.trim().length) return CodeMirror.Pass;

            var firstNonSpace = line.search(/[^\s]/);

            if (cursor.ch <= firstNonSpace) return CodeMirror.Pass;

            this._completionController.completeAtCurrentPositionIfNeeded().then(function (result) {
                if (result === WebInspector.CodeMirrorCompletionController.UpdatePromise.NoCompletionsFound) InspectorFrontendHost.beep();
            });
        }
    }, {
        key: "_handleEscapeKey",
        value: function _handleEscapeKey(codeMirror) {
            if (this.text) return CodeMirror.Pass;

            if (!this._escapeKeyHandlerWhenEmpty) return CodeMirror.Pass;

            this._escapeKeyHandlerWhenEmpty();
        }
    }, {
        key: "_handlePreviousKey",
        value: function _handlePreviousKey(codeMirror) {
            if (this._codeMirror.somethingSelected()) return CodeMirror.Pass;

            // Pass unless we are on the first line.
            if (this._codeMirror.getCursor().line) return CodeMirror.Pass;

            var historyEntry = this._history[this._historyIndex + 1];
            if (!historyEntry) return CodeMirror.Pass;

            this._rememberCurrentTextInHistory();

            ++this._historyIndex;

            this._restoreHistoryEntry(this._historyIndex);
        }
    }, {
        key: "_handleNextKey",
        value: function _handleNextKey(codeMirror) {
            if (this._codeMirror.somethingSelected()) return CodeMirror.Pass;

            // Pass unless we are on the last line.
            if (this._codeMirror.getCursor().line !== this._codeMirror.lastLine()) return CodeMirror.Pass;

            var historyEntry = this._history[this._historyIndex - 1];
            if (!historyEntry) return CodeMirror.Pass;

            this._rememberCurrentTextInHistory();

            --this._historyIndex;

            this._restoreHistoryEntry(this._historyIndex);
        }
    }, {
        key: "_handleEnterKey",
        value: function _handleEnterKey(codeMirror, forceCommit, keepCurrentText) {
            var currentText = this.text;

            // Always do nothing when there is just whitespace.
            if (!currentText.trim()) return;

            var cursor = this._codeMirror.getCursor();
            var lastLine = this._codeMirror.lastLine();
            var lastLineLength = this._codeMirror.getLine(lastLine).length;
            var cursorIsAtLastPosition = positionsEqual(cursor, { line: lastLine, ch: lastLineLength });

            function positionsEqual(a, b) {
                console.assert(a);
                console.assert(b);
                return a.line === b.line && a.ch === b.ch;
            }

            function commitTextOrInsertNewLine(commit) {
                if (!commit) {
                    // Only insert a new line if the previous cursor and the current cursor are in the same position.
                    if (positionsEqual(cursor, this._codeMirror.getCursor())) CodeMirror.commands.newlineAndIndent(this._codeMirror);
                    return;
                }

                this._commitHistoryEntry(this._historyEntryForCurrentText());

                if (!keepCurrentText) {
                    this._codeMirror.setValue("");
                    this._codeMirror.clearHistory();
                }

                if (this.delegate && typeof this.delegate.consolePromptHistoryDidChange === "function") this.delegate.consolePromptHistoryDidChange(this);

                if (this.delegate && typeof this.delegate.consolePromptTextCommitted === "function") this.delegate.consolePromptTextCommitted(this, currentText);
            }

            if (!forceCommit && this.delegate && typeof this.delegate.consolePromptShouldCommitText === "function") {
                this.delegate.consolePromptShouldCommitText(this, currentText, cursorIsAtLastPosition, commitTextOrInsertNewLine.bind(this));
                return;
            }

            commitTextOrInsertNewLine.call(this, true);
        }
    }, {
        key: "_commitHistoryEntry",
        value: function _commitHistoryEntry(historyEntry) {
            // Replace the previous entry if it does not have text or if the text is the same.
            if (this._history[1] && (!this._history[1].text || this._history[1].text === historyEntry.text)) {
                this._history[1] = historyEntry;
                this._history[0] = {};
            } else {
                // Replace the first history entry and push a new empty one.
                this._history[0] = historyEntry;
                this._history.unshift({});

                // Trim the history length if needed.
                if (this._history.length > WebInspector.ConsolePrompt.MaximumHistorySize) this._history = this._history.slice(0, WebInspector.ConsolePrompt.MaximumHistorySize);
            }

            this._historyIndex = 0;
        }
    }, {
        key: "_handleCommandEnterKey",
        value: function _handleCommandEnterKey(codeMirror) {
            this._handleEnterKey(codeMirror, true, true);
        }
    }, {
        key: "_restoreHistoryEntry",
        value: function _restoreHistoryEntry(index) {
            var historyEntry = this._history[index];

            this._codeMirror.setValue(historyEntry.text || "");

            if (historyEntry.undoHistory) this._codeMirror.setHistory(historyEntry.undoHistory);else this._codeMirror.clearHistory();

            this._codeMirror.setCursor(historyEntry.cursor || { line: 0 });
        }
    }, {
        key: "_historyEntryForCurrentText",
        value: function _historyEntryForCurrentText() {
            return { text: this.text, undoHistory: this._codeMirror.getHistory(), cursor: this._codeMirror.getCursor() };
        }
    }, {
        key: "_rememberCurrentTextInHistory",
        value: function _rememberCurrentTextInHistory() {
            this._history[this._historyIndex] = this._historyEntryForCurrentText();

            if (this.delegate && typeof this.delegate.consolePromptHistoryDidChange === "function") this.delegate.consolePromptHistoryDidChange(this);
        }
    }, {
        key: "element",
        get: function get() {
            return this._element;
        }
    }, {
        key: "delegate",
        get: function get() {
            return this._delegate;
        },
        set: function set(delegate) {
            this._delegate = delegate || null;
        }
    }, {
        key: "escapeKeyHandlerWhenEmpty",
        set: function set(handler) {
            this._escapeKeyHandlerWhenEmpty = handler;
        }
    }, {
        key: "text",
        get: function get() {
            return this._codeMirror.getValue();
        },
        set: function set(text) {
            this._codeMirror.setValue(text || "");
            this._codeMirror.clearHistory();
            this._codeMirror.markClean();
        }
    }, {
        key: "history",
        get: function get() {
            this._history[this._historyIndex] = this._historyEntryForCurrentText();
            return this._history;
        },
        set: function set(history) {
            this._history = history instanceof Array ? history.slice(0, WebInspector.ConsolePrompt.MaximumHistorySize) : [{}];
            this._historyIndex = 0;
            this._restoreHistoryEntry(0);
        }
    }, {
        key: "focused",
        get: function get() {
            return this._codeMirror.getWrapperElement().classList.contains("CodeMirror-focused");
        }
    }]);

    return ConsolePrompt;
})(WebInspector.Object);

WebInspector.ConsolePrompt.MaximumHistorySize = 30;
