var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2013, 2015 Apple Inc. All rights reserved.
 * Copyright (C) 2015 Tobias Reiss <tobi+webkit@basecode.de>
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

WebInspector.CSSStyleDeclarationTextEditor = (function (_WebInspector$Object) {
    _inherits(CSSStyleDeclarationTextEditor, _WebInspector$Object);

    function CSSStyleDeclarationTextEditor(delegate, style, element) {
        _classCallCheck(this, CSSStyleDeclarationTextEditor);

        _get(Object.getPrototypeOf(CSSStyleDeclarationTextEditor.prototype), "constructor", this).call(this);

        this._element = element || document.createElement("div");
        this._element.classList.add(WebInspector.CSSStyleDeclarationTextEditor.StyleClassName);
        this._element.classList.add(WebInspector.SyntaxHighlightedStyleClassName);
        this._element.addEventListener("mousedown", this._handleMouseDown.bind(this));
        this._element.addEventListener("mouseup", this._handleMouseUp.bind(this));

        this._mouseDownCursorPosition = null;

        this._showsImplicitProperties = true;
        this._alwaysShowPropertyNames = {};
        this._filterResultPropertyNames = null;
        this._sortProperties = false;

        this._prefixWhitespace = "\n";
        this._suffixWhitespace = "\n";
        this._linePrefixWhitespace = "";

        this._delegate = delegate || null;

        this._codeMirror = CodeMirror(this.element, {
            readOnly: true,
            lineWrapping: true,
            mode: "css-rule",
            electricChars: false,
            indentWithTabs: false,
            indentUnit: 4,
            smartIndent: false,
            matchBrackets: true,
            autoCloseBrackets: true
        });

        this._codeMirror.addKeyMap({
            "Enter": this._handleEnterKey.bind(this),
            "Shift-Enter": this._insertNewlineAfterCurrentLine.bind(this),
            "Shift-Tab": this._handleShiftTabKey.bind(this),
            "Tab": this._handleTabKey.bind(this)
        });

        this._completionController = new WebInspector.CodeMirrorCompletionController(this._codeMirror, this);
        this._tokenTrackingController = new WebInspector.CodeMirrorTokenTrackingController(this._codeMirror, this);

        this._completionController.noEndingSemicolon = true;

        this._jumpToSymbolTrackingModeEnabled = false;
        this._tokenTrackingController.classNameForHighlightedRange = WebInspector.CodeMirrorTokenTrackingController.JumpToSymbolHighlightStyleClassName;
        this._tokenTrackingController.mouseOverDelayDuration = 0;
        this._tokenTrackingController.mouseOutReleaseDelayDuration = 0;
        this._tokenTrackingController.mode = WebInspector.CodeMirrorTokenTrackingController.Mode.NonSymbolTokens;

        // Make sure CompletionController adds event listeners first.
        // Otherwise we end up in race conditions during complete or delete-complete phases.
        this._codeMirror.on("change", this._contentChanged.bind(this));
        this._codeMirror.on("blur", this._editorBlured.bind(this));
        this._codeMirror.on("beforeChange", this._handleBeforeChange.bind(this));

        if (typeof this._delegate.cssStyleDeclarationTextEditorFocused === "function") this._codeMirror.on("focus", this._editorFocused.bind(this));

        this.style = style;
    }

    // Public

    _createClass(CSSStyleDeclarationTextEditor, [{
        key: "focus",
        value: function focus() {
            this._codeMirror.focus();
        }
    }, {
        key: "refresh",
        value: function refresh() {
            this._resetContent();
        }
    }, {
        key: "updateLayout",
        value: function updateLayout(force) {
            this._codeMirror.refresh();
        }
    }, {
        key: "highlightProperty",
        value: function highlightProperty(property) {
            function propertiesMatch(cssProperty) {
                if (cssProperty.enabled && !cssProperty.overridden) {
                    if (cssProperty.canonicalName === property.canonicalName || hasMatchingLonghandProperty(cssProperty)) return true;
                }

                return false;
            }

            function hasMatchingLonghandProperty(cssProperty) {
                var cssProperties = cssProperty.relatedLonghandProperties;

                if (!cssProperties.length) return false;

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = cssProperties[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var property = _step.value;

                        if (propertiesMatch(property)) return true;
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

                return false;
            }

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.style.properties[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var cssProperty = _step2.value;

                    if (propertiesMatch(cssProperty)) {
                        var selection = cssProperty.__propertyTextMarker.find();
                        this._codeMirror.setSelection(selection.from, selection.to);
                        this.focus();

                        return true;
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

            return false;
        }
    }, {
        key: "clearSelection",
        value: function clearSelection() {
            this._codeMirror.setCursor({ line: 0, ch: 0 });
        }
    }, {
        key: "findMatchingProperties",
        value: function findMatchingProperties(needle) {
            if (!needle) {
                this.resetFilteredProperties();
                return false;
            }

            var propertiesList = this._style.visibleProperties.length ? this._style.visibleProperties : this._style.properties;
            var matchingProperties = [];

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = propertiesList[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var property = _step3.value;

                    matchingProperties.push(property.text.includes(needle));
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

            if (!matchingProperties.includes(true)) {
                this.resetFilteredProperties();
                return false;
            }

            for (var i = 0; i < matchingProperties.length; ++i) {
                var property = propertiesList[i];

                if (matchingProperties[i]) property.__filterResultClassName = WebInspector.CSSStyleDetailsSidebarPanel.FilterMatchSectionClassName;else property.__filterResultClassName = WebInspector.CSSStyleDetailsSidebarPanel.NoFilterMatchInPropertyClassName;

                this._updateTextMarkerForPropertyIfNeeded(property);
            }

            return true;
        }
    }, {
        key: "resetFilteredProperties",
        value: function resetFilteredProperties() {
            var propertiesList = this._style.visibleProperties.length ? this._style.visibleProperties : this._style.properties;

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = propertiesList[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var property = _step4.value;

                    if (property.__filterResultClassName) {
                        property.__filterResultClassName = null;
                        this._updateTextMarkerForPropertyIfNeeded(property);
                    }
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
        }
    }, {
        key: "removeNonMatchingProperties",
        value: function removeNonMatchingProperties(needle) {
            this._filterResultPropertyNames = null;

            if (!needle) {
                this._resetContent();
                return false;
            }

            var matchingPropertyNames = [];

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this._style.properties[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var property = _step5.value;

                    var indexesOfNeedle = property.text.getMatchingIndexes(needle);

                    if (indexesOfNeedle.length) {
                        matchingPropertyNames.push(property.name);
                        property.__filterResultClassName = WebInspector.CSSStyleDetailsSidebarPanel.FilterMatchSectionClassName;
                        property.__filterResultNeedlePosition = { start: indexesOfNeedle, length: needle.length };
                    }
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
                        _iterator5["return"]();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            this._filterResultPropertyNames = matchingPropertyNames.length ? matchingPropertyNames.keySet() : {};

            this._resetContent();

            return matchingPropertyNames.length > 0;
        }
    }, {
        key: "uncommentAllProperties",
        value: function uncommentAllProperties() {
            function uncommentProperties(properties) {
                if (!properties.length) return false;

                var _iteratorNormalCompletion6 = true;
                var _didIteratorError6 = false;
                var _iteratorError6 = undefined;

                try {
                    for (var _iterator6 = properties[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                        var property = _step6.value;

                        if (property._commentRange) {
                            this._uncommentRange(property._commentRange);
                            property._commentRange = null;
                        }
                    }
                } catch (err) {
                    _didIteratorError6 = true;
                    _iteratorError6 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion6 && _iterator6["return"]) {
                            _iterator6["return"]();
                        }
                    } finally {
                        if (_didIteratorError6) {
                            throw _iteratorError6;
                        }
                    }
                }

                return true;
            }

            return uncommentProperties.call(this, this._style.pendingProperties) || uncommentProperties.call(this, this._style.properties);
        }
    }, {
        key: "commentAllProperties",
        value: function commentAllProperties() {
            if (!this._style.properties.length) return false;

            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = this._style.properties[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var property = _step7.value;

                    if (property.__propertyTextMarker) this._commentProperty(property);
                }
            } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion7 && _iterator7["return"]) {
                        _iterator7["return"]();
                    }
                } finally {
                    if (_didIteratorError7) {
                        throw _iteratorError7;
                    }
                }
            }

            return true;
        }
    }, {
        key: "selectFirstProperty",
        value: function selectFirstProperty() {
            var line = this._codeMirror.getLine(0);
            var trimmedLine = line.trimRight();

            if (!line || !trimmedLine.trimLeft().length) this.clearSelection();

            var index = line.indexOf(":");
            var cursor = { line: 0, ch: 0 };

            this._codeMirror.setSelection(cursor, { line: 0, ch: index < 0 || this._textAtCursorIsComment(this._codeMirror, cursor) ? trimmedLine.length : index });
        }
    }, {
        key: "selectLastProperty",
        value: function selectLastProperty() {
            var line = this._codeMirror.lineCount() - 1;
            var lineText = this._codeMirror.getLine(line);
            var trimmedLine = lineText.trimRight();

            var lastAnchor;
            var lastHead;

            if (this._textAtCursorIsComment(this._codeMirror, { line: line, ch: line.length })) {
                lastAnchor = 0;
                lastHead = line.length;
            } else {
                var colon = /(?::\s*)/.exec(lineText);
                lastAnchor = colon ? colon.index + colon[0].length : 0;
                lastHead = trimmedLine.length - trimmedLine.endsWith(";");
            }

            this._codeMirror.setSelection({ line: line, ch: lastAnchor }, { line: line, ch: lastHead });
        }

        // Protected

    }, {
        key: "didDismissPopover",
        value: function didDismissPopover(popover) {
            if (popover === this._colorPickerPopover) this._colorPickerPopover = null;
            if (popover === this._cubicBezierEditorPopover) this._cubicBezierEditorPopover = null;
        }
    }, {
        key: "completionControllerCompletionsHidden",
        value: function completionControllerCompletionsHidden(completionController) {
            var styleText = this._style.text;
            var currentText = this._formattedContent();

            // If the style text and the current editor text differ then we need to commit.
            // Otherwise we can just update the properties that got skipped because a completion
            // was pending the last time _propertiesChanged was called.
            if (styleText !== currentText) this._commitChanges();else this._propertiesChanged();
        }

        // Private

    }, {
        key: "_textAtCursorIsComment",
        value: function _textAtCursorIsComment(codeMirror, cursor) {
            var token = codeMirror.getTokenTypeAt(cursor);
            return token && token.includes("comment");
        }
    }, {
        key: "_highlightNextNameOrValue",
        value: function _highlightNextNameOrValue(codeMirror, cursor, text) {
            var nextAnchor;
            var nextHead;

            if (this._textAtCursorIsComment(codeMirror, cursor)) {
                nextAnchor = 0;
                nextHead = text.length;
            } else {
                var colonIndex = text.indexOf(":");
                var substringIndex = colonIndex >= 0 && cursor.ch >= colonIndex ? colonIndex : 0;

                var regExp = /(?:[^:;\s]\s*)+/g;
                regExp.lastIndex = substringIndex;
                var match = regExp.exec(text);

                nextAnchor = match.index;
                nextHead = nextAnchor + match[0].length;
            }

            codeMirror.setSelection({ line: cursor.line, ch: nextAnchor }, { line: cursor.line, ch: nextHead });
        }
    }, {
        key: "_handleMouseDown",
        value: function _handleMouseDown(event) {
            if (this._codeMirror.options.readOnly) return;

            var cursor = this._codeMirror.coordsChar({ left: event.x, top: event.y });
            var line = this._codeMirror.getLine(cursor.line);
            var trimmedLine = line.trimRight();
            if (!trimmedLine.trimLeft().length || cursor.ch !== trimmedLine.length) return;

            this._mouseDownCursorPosition = cursor;
        }
    }, {
        key: "_handleMouseUp",
        value: function _handleMouseUp(event) {
            if (this._codeMirror.options.readOnly || !this._mouseDownCursorPosition) return;

            var cursor = this._codeMirror.coordsChar({ left: event.x, top: event.y });
            if (this._mouseDownCursorPosition.line === cursor.line && this._mouseDownCursorPosition.ch === cursor.ch) {
                var nextLine = this._codeMirror.getLine(cursor.line + 1);
                if (cursor.line < this._codeMirror.lineCount() - 1 && (!nextLine || !nextLine.trim().length)) {
                    this._codeMirror.setCursor({ line: cursor.line + 1, ch: 0 });
                } else {
                    var line = this._codeMirror.getLine(cursor.line);
                    var replacement = "\n";
                    if (!line.trimRight().endsWith(";") && !this._textAtCursorIsComment(this._codeMirror, cursor)) replacement = ";" + replacement;

                    this._codeMirror.replaceRange(replacement, cursor);
                }
            }

            this._mouseDownCursorPosition = null;
        }
    }, {
        key: "_handleBeforeChange",
        value: function _handleBeforeChange(codeMirror, change) {
            if (change.origin !== "+delete" || this._completionController.isShowingCompletions()) return CodeMirror.Pass;

            if (!change.to.line && !change.to.ch) {
                if (codeMirror.lineCount() === 1) return CodeMirror.Pass;

                var line = codeMirror.getLine(change.to.line);
                if (line && line.trim().length) return CodeMirror.Pass;

                codeMirror.execCommand("deleteLine");
                return;
            }

            var marks = codeMirror.findMarksAt(change.to);
            if (!marks.length) return CodeMirror.Pass;

            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = marks[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var mark = _step8.value;

                    mark.clear();
                }
            } catch (err) {
                _didIteratorError8 = true;
                _iteratorError8 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion8 && _iterator8["return"]) {
                        _iterator8["return"]();
                    }
                } finally {
                    if (_didIteratorError8) {
                        throw _iteratorError8;
                    }
                }
            }
        }
    }, {
        key: "_handleEnterKey",
        value: function _handleEnterKey(codeMirror) {
            var cursor = codeMirror.getCursor();
            var line = codeMirror.getLine(cursor.line);
            var trimmedLine = line.trimRight();
            var hasEndingSemicolon = trimmedLine.endsWith(";");

            if (!trimmedLine.trimLeft().length) return CodeMirror.Pass;

            if (hasEndingSemicolon && cursor.ch === trimmedLine.length - 1) ++cursor.ch;

            if (cursor.ch === trimmedLine.length) {
                var replacement = "\n";

                if (!hasEndingSemicolon && !this._textAtCursorIsComment(this._codeMirror, cursor)) replacement = ";" + replacement;

                this._codeMirror.replaceRange(replacement, cursor);
                return;
            }

            return CodeMirror.Pass;
        }
    }, {
        key: "_insertNewlineAfterCurrentLine",
        value: function _insertNewlineAfterCurrentLine(codeMirror) {
            var cursor = codeMirror.getCursor();
            var line = codeMirror.getLine(cursor.line);
            var trimmedLine = line.trimRight();

            cursor.ch = trimmedLine.length;

            if (cursor.ch) {
                var replacement = "\n";

                if (!trimmedLine.endsWith(";") && !this._textAtCursorIsComment(this._codeMirror, cursor)) replacement = ";" + replacement;

                this._codeMirror.replaceRange(replacement, cursor);
                return;
            }

            return CodeMirror.Pass;
        }
    }, {
        key: "_handleShiftTabKey",
        value: function _handleShiftTabKey(codeMirror) {
            function switchRule() {
                if (this._delegate && typeof this._delegate.cssStyleDeclarationTextEditorSwitchRule === "function") {
                    this._delegate.cssStyleDeclarationTextEditorSwitchRule(true);
                    return;
                }

                return CodeMirror.Pass;
            }

            var cursor = codeMirror.getCursor();
            var line = codeMirror.getLine(cursor.line);
            var previousLine = codeMirror.getLine(cursor.line - 1);

            if (!line && !previousLine && !cursor.line) return switchRule.call(this);

            var trimmedPreviousLine = previousLine ? previousLine.trimRight() : "";
            var previousAnchor;
            var previousHead;
            var isComment = this._textAtCursorIsComment(codeMirror, cursor);

            if (cursor.ch === line.indexOf(":") || line.indexOf(":") < 0 || isComment) {
                if (previousLine) {
                    --cursor.line;

                    if (this._textAtCursorIsComment(codeMirror, cursor)) {
                        previousAnchor = 0;
                        previousHead = trimmedPreviousLine.length;
                    } else {
                        var colon = /(?::\s*)/.exec(previousLine);
                        previousAnchor = colon ? colon.index + colon[0].length : 0;
                        previousHead = trimmedPreviousLine.length - trimmedPreviousLine.endsWith(";");
                    }

                    codeMirror.setSelection({ line: cursor.line, ch: previousAnchor }, { line: cursor.line, ch: previousHead });
                    return;
                }

                if (cursor.line) {
                    codeMirror.setCursor(cursor.line - 1, 0);
                    return;
                }

                return switchRule.call(this);
            }

            if (isComment) {
                previousAnchor = 0;
                previousHead = line.length;
            } else {
                var match = /(?:[^:;\s]\s*)+/.exec(line);
                previousAnchor = match.index;
                previousHead = previousAnchor + match[0].length;
            }

            codeMirror.setSelection({ line: cursor.line, ch: previousAnchor }, { line: cursor.line, ch: previousHead });
        }
    }, {
        key: "_handleTabKey",
        value: function _handleTabKey(codeMirror) {
            function switchRule() {
                if (this._delegate && typeof this._delegate.cssStyleDeclarationTextEditorSwitchRule === "function") {
                    this._delegate.cssStyleDeclarationTextEditorSwitchRule();
                    return;
                }

                return CodeMirror.Pass;
            }

            var cursor = codeMirror.getCursor();
            var line = codeMirror.getLine(cursor.line);
            var trimmedLine = line.trimRight();
            var lastLine = cursor.line === codeMirror.lineCount() - 1;
            var nextLine = codeMirror.getLine(cursor.line + 1);
            var trimmedNextLine = nextLine ? nextLine.trimRight() : "";

            if (!trimmedLine.trimLeft().length) {
                if (lastLine) return switchRule.call(this);

                if (!trimmedNextLine.trimLeft().length) {
                    codeMirror.setCursor(cursor.line + 1, 0);
                    return;
                }

                ++cursor.line;
                this._highlightNextNameOrValue(codeMirror, cursor, nextLine);
                return;
            }

            if (trimmedLine.endsWith(":")) {
                codeMirror.setCursor(cursor.line, line.length);
                this._completionController._completeAtCurrentPosition(true);
                return;
            }

            var hasEndingSemicolon = trimmedLine.endsWith(";");

            if (cursor.ch >= line.trimRight().length - hasEndingSemicolon) {
                this._completionController.completeAtCurrentPositionIfNeeded().then((function (result) {
                    if (result !== WebInspector.CodeMirrorCompletionController.UpdatePromise.NoCompletionsFound) return;

                    var replacement = "";

                    if (!hasEndingSemicolon && !this._textAtCursorIsComment(codeMirror, cursor)) replacement += ";";

                    if (lastLine) replacement += "\n";

                    if (replacement.length) codeMirror.replaceRange(replacement, { line: cursor.line, ch: trimmedLine.length });

                    if (!nextLine) {
                        codeMirror.setCursor(cursor.line + 1, 0);
                        return;
                    }

                    this._highlightNextNameOrValue(codeMirror, { line: cursor.line + 1, ch: 0 }, nextLine);
                }).bind(this));

                return;
            }

            this._highlightNextNameOrValue(codeMirror, cursor, line);
        }
    }, {
        key: "_clearRemoveEditingLineClassesTimeout",
        value: function _clearRemoveEditingLineClassesTimeout() {
            if (!this._removeEditingLineClassesTimeout) return;

            clearTimeout(this._removeEditingLineClassesTimeout);
            delete this._removeEditingLineClassesTimeout;
        }
    }, {
        key: "_removeEditingLineClasses",
        value: function _removeEditingLineClasses() {
            this._clearRemoveEditingLineClassesTimeout();

            function removeEditingLineClasses() {
                var lineCount = this._codeMirror.lineCount();
                for (var i = 0; i < lineCount; ++i) this._codeMirror.removeLineClass(i, "wrap", WebInspector.CSSStyleDeclarationTextEditor.EditingLineStyleClassName);
            }

            this._codeMirror.operation(removeEditingLineClasses.bind(this));
        }
    }, {
        key: "_removeEditingLineClassesSoon",
        value: function _removeEditingLineClassesSoon() {
            if (this._removeEditingLineClassesTimeout) return;
            this._removeEditingLineClassesTimeout = setTimeout(this._removeEditingLineClasses.bind(this), WebInspector.CSSStyleDeclarationTextEditor.RemoveEditingLineClassesDelay);
        }
    }, {
        key: "_formattedContent",
        value: function _formattedContent() {
            // Start with the prefix whitespace we stripped.
            var content = this._prefixWhitespace;

            // Get each line and add the line prefix whitespace and newlines.
            var lineCount = this._codeMirror.lineCount();
            for (var i = 0; i < lineCount; ++i) {
                var lineContent = this._codeMirror.getLine(i);
                content += this._linePrefixWhitespace + lineContent;
                if (i !== lineCount - 1) content += "\n";
            }

            // Add the suffix whitespace we stripped.
            content += this._suffixWhitespace;

            // This regular expression replacement removes extra newlines
            // in between properties while preserving leading whitespace
            return content.replace(/\s*\n\s*\n(\s*)/g, "\n$1");
        }
    }, {
        key: "_commitChanges",
        value: function _commitChanges() {
            if (this._commitChangesTimeout) {
                clearTimeout(this._commitChangesTimeout);
                delete this._commitChangesTimeout;
            }

            this._style.text = this._formattedContent();
        }
    }, {
        key: "_editorBlured",
        value: function _editorBlured(codeMirror) {
            // Clicking a suggestion causes the editor to blur. We don't want to reset content in this case.
            if (this._completionController.isHandlingClickEvent()) return;

            // Reset the content on blur since we stop accepting external changes while the the editor is focused.
            // This causes us to pick up any change that was suppressed while the editor was focused.
            this._resetContent();
            this.dispatchEventToListeners(WebInspector.CSSStyleDeclarationTextEditor.Event.Blurred);
        }
    }, {
        key: "_editorFocused",
        value: function _editorFocused(codeMirror) {
            if (typeof this._delegate.cssStyleDeclarationTextEditorFocused === "function") this._delegate.cssStyleDeclarationTextEditorFocused();
        }
    }, {
        key: "_contentChanged",
        value: function _contentChanged(codeMirror, change) {
            // Return early if the style isn't editable. This still can be called when readOnly is set because
            // clicking on a color swatch modifies the text.
            if (!this._style || !this._style.editable || this._ignoreCodeMirrorContentDidChangeEvent) return;

            this._markLinesWithCheckboxPlaceholder();

            this._clearRemoveEditingLineClassesTimeout();
            this._codeMirror.addLineClass(change.from.line, "wrap", WebInspector.CSSStyleDeclarationTextEditor.EditingLineStyleClassName);

            // When the change is a completion change, create color swatches now since the changes
            // will not go through _propertiesChanged until completionControllerCompletionsHidden happens.
            // This way any auto completed colors get swatches right away.
            if (this._completionController.isCompletionChange(change)) {
                this._createColorSwatches(false, change.from.line);
                this._createBezierEditors(false, change.from.line);
            }

            // Use a short delay for user input to coalesce more changes before committing. Other actions like
            // undo, redo and paste are atomic and work better with a zero delay. CodeMirror identifies changes that
            // get coalesced in the undo stack with a "+" prefix on the origin. Use that to set the delay for our coalescing.
            var delay = change.origin && change.origin.charAt(0) === "+" ? WebInspector.CSSStyleDeclarationTextEditor.CommitCoalesceDelay : 0;

            // Reset the timeout so rapid changes coalesce after a short delay.
            if (this._commitChangesTimeout) clearTimeout(this._commitChangesTimeout);
            this._commitChangesTimeout = setTimeout(this._commitChanges.bind(this), delay);

            this.dispatchEventToListeners(WebInspector.CSSStyleDeclarationTextEditor.Event.ContentChanged);
        }
    }, {
        key: "_updateTextMarkers",
        value: function _updateTextMarkers(nonatomic) {
            function update() {
                this._clearTextMarkers(true);

                this._iterateOverProperties(true, function (property) {
                    var styleTextRange = property.styleDeclarationTextRange;
                    console.assert(styleTextRange);
                    if (!styleTextRange) return;

                    var from = { line: styleTextRange.startLine, ch: styleTextRange.startColumn };
                    var to = { line: styleTextRange.endLine, ch: styleTextRange.endColumn };

                    // Adjust the line position for the missing prefix line.
                    if (this._prefixWhitespace) {
                        --from.line;
                        --to.line;
                    }

                    // Adjust the column for the stripped line prefix whitespace.
                    from.ch -= this._linePrefixWhitespace.length;
                    to.ch -= this._linePrefixWhitespace.length;

                    this._createTextMarkerForPropertyIfNeeded(from, to, property);
                });

                if (!this._codeMirror.getOption("readOnly")) {
                    // Look for comments that look like properties and add checkboxes in front of them.
                    this._codeMirror.eachLine((function (lineHandler) {
                        this._createCommentedCheckboxMarker(lineHandler);
                    }).bind(this));
                }

                // Look for colors and make swatches.
                this._createColorSwatches(true);
                this._createBezierEditors(true);

                this._markLinesWithCheckboxPlaceholder();
            }

            if (nonatomic) update.call(this);else this._codeMirror.operation(update.bind(this));
        }
    }, {
        key: "_createCommentedCheckboxMarker",
        value: function _createCommentedCheckboxMarker(lineHandle) {
            var lineNumber = lineHandle.lineNo();

            // Since lineNumber can be 0, it is also necessary to check if it is a number before returning.
            if (!lineNumber && isNaN(lineNumber)) return;

            // Matches a comment like: /* -webkit-foo: bar; */
            var commentedPropertyRegex = /\/\*\s*[-\w]+\s*:\s*[^;]+;?\s*\*\//g;

            var match = commentedPropertyRegex.exec(lineHandle.text);
            if (!match) return;

            while (match) {
                var checkboxElement = document.createElement("input");
                checkboxElement.type = "checkbox";
                checkboxElement.checked = false;
                checkboxElement.addEventListener("change", this._propertyCommentCheckboxChanged.bind(this));

                var from = { line: lineNumber, ch: match.index };
                var to = { line: lineNumber, ch: match.index + match[0].length };

                var checkboxMarker = this._codeMirror.setUniqueBookmark(from, checkboxElement);
                checkboxMarker.__propertyCheckbox = true;

                var commentTextMarker = this._codeMirror.markText(from, to);

                checkboxElement.__commentTextMarker = commentTextMarker;

                match = commentedPropertyRegex.exec(lineHandle.text);
            }
        }
    }, {
        key: "_createColorSwatches",
        value: function _createColorSwatches(nonatomic, lineNumber) {
            function update() {
                var range = typeof lineNumber === "number" ? new WebInspector.TextRange(lineNumber, 0, lineNumber + 1, 0) : null;

                // Look for color strings and add swatches in front of them.
                createCodeMirrorColorTextMarkers(this._codeMirror, range, (function (marker, color, colorString) {
                    var swatchElement = document.createElement("span");
                    swatchElement.title = WebInspector.UIString("Click to select a color. Shift-click to switch color formats.");
                    swatchElement.className = WebInspector.CSSStyleDeclarationTextEditor.ColorSwatchElementStyleClassName;
                    swatchElement.addEventListener("click", this._colorSwatchClicked.bind(this));

                    var swatchInnerElement = document.createElement("span");
                    swatchInnerElement.style.backgroundColor = colorString;
                    swatchElement.appendChild(swatchInnerElement);

                    var codeMirrorTextMarker = marker.codeMirrorTextMarker;
                    this._codeMirror.setUniqueBookmark(codeMirrorTextMarker.find().from, swatchElement);

                    swatchInnerElement.__colorTextMarker = codeMirrorTextMarker;
                    swatchInnerElement.__color = color;
                }).bind(this));
            }

            if (nonatomic) update.call(this);else this._codeMirror.operation(update.bind(this));
        }
    }, {
        key: "_createBezierEditors",
        value: function _createBezierEditors(nonatomic, lineNumber) {
            function update() {
                var range = typeof lineNumber === "number" ? new WebInspector.TextRange(lineNumber, 0, lineNumber + 1, 0) : null;

                // Look for cubic-bezier and timing functions and add cubic-bezier icons in front of them.
                createCodeMirrorCubicBezierTextMarkers(this._codeMirror, range, (function (marker, cubicBezier) {
                    var bezierMarker = document.createElement("span");
                    bezierMarker.title = WebInspector.UIString("Click to open a cubic-bezier editor");
                    bezierMarker.className = WebInspector.CSSStyleDeclarationTextEditor.BezierEditorClassName;
                    bezierMarker.addEventListener("click", this._cubicBezierMarkerClicked.bind(this));

                    var codeMirrorTextMarker = marker.codeMirrorTextMarker;
                    this._codeMirror.setUniqueBookmark(codeMirrorTextMarker.find().from, bezierMarker);

                    bezierMarker.__textMarker = codeMirrorTextMarker;
                    bezierMarker.__bezier = cubicBezier;
                }).bind(this));
            }

            if (nonatomic) update.call(this);else this._codeMirror.operation(update.bind(this));
        }
    }, {
        key: "_updateTextMarkerForPropertyIfNeeded",
        value: function _updateTextMarkerForPropertyIfNeeded(property) {
            var textMarker = property.__propertyTextMarker;
            console.assert(textMarker);
            if (!textMarker) return;

            var range = textMarker.find();
            console.assert(range);
            if (!range) return;

            this._createTextMarkerForPropertyIfNeeded(range.from, range.to, property);
        }
    }, {
        key: "_createTextMarkerForPropertyIfNeeded",
        value: function _createTextMarkerForPropertyIfNeeded(from, to, property) {
            if (!this._codeMirror.getOption("readOnly")) {
                // Create a new checkbox element and marker.

                console.assert(property.enabled);

                var checkboxElement = document.createElement("input");
                checkboxElement.type = "checkbox";
                checkboxElement.checked = true;
                checkboxElement.addEventListener("change", this._propertyCheckboxChanged.bind(this));
                checkboxElement.__cssProperty = property;

                var checkboxMarker = this._codeMirror.setUniqueBookmark(from, checkboxElement);
                checkboxMarker.__propertyCheckbox = true;
            } else if (this._delegate.cssStyleDeclarationTextEditorShouldAddPropertyGoToArrows && !property.implicit && typeof this._delegate.cssStyleDeclarationTextEditorShowProperty === "function") {

                var arrowElement = WebInspector.createGoToArrowButton();

                var delegate = this._delegate;
                arrowElement.addEventListener("click", function () {
                    delegate.cssStyleDeclarationTextEditorShowProperty(property);
                });

                this._codeMirror.setUniqueBookmark(to, arrowElement);
            }

            function duplicatePropertyExistsBelow(cssProperty) {
                var propertyFound = false;

                var _iteratorNormalCompletion9 = true;
                var _didIteratorError9 = false;
                var _iteratorError9 = undefined;

                try {
                    for (var _iterator9 = this._style.properties[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                        var property = _step9.value;

                        if (property === cssProperty) propertyFound = true;else if (property.name === cssProperty.name && propertyFound) return true;
                    }
                } catch (err) {
                    _didIteratorError9 = true;
                    _iteratorError9 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion9 && _iterator9["return"]) {
                            _iterator9["return"]();
                        }
                    } finally {
                        if (_didIteratorError9) {
                            throw _iteratorError9;
                        }
                    }
                }

                return false;
            }

            var propertyNameIsValid = false;
            if (WebInspector.CSSCompletions.cssNameCompletions) propertyNameIsValid = WebInspector.CSSCompletions.cssNameCompletions.isValidPropertyName(property.name);

            var classNames = ["css-style-declaration-property"];

            if (property.overridden) classNames.push("overridden");

            if (property.implicit) classNames.push("implicit");

            if (this._style.inherited && !property.inherited) classNames.push("not-inherited");

            if (!property.valid && property.hasOtherVendorNameOrKeyword()) classNames.push("other-vendor");else if (!property.valid && (!propertyNameIsValid || duplicatePropertyExistsBelow.call(this, property))) classNames.push("invalid");

            if (!property.enabled) classNames.push("disabled");

            if (property.__filterResultClassName && !property.__filterResultNeedlePosition) classNames.push(property.__filterResultClassName);

            var classNamesString = classNames.join(" ");

            // If there is already a text marker and it's in the same document, then try to avoid recreating it.
            // FIXME: If there are multiple CSSStyleDeclarationTextEditors for the same style then this will cause
            // both editors to fight and always recreate their text markers. This isn't really common.
            if (property.__propertyTextMarker && property.__propertyTextMarker.doc.cm === this._codeMirror && property.__propertyTextMarker.find()) {
                // If the class name is the same then we don't need to make a new marker.
                if (property.__propertyTextMarker.className === classNamesString) return;

                property.__propertyTextMarker.clear();
            }

            var propertyTextMarker = this._codeMirror.markText(from, to, { className: classNamesString });

            propertyTextMarker.__cssProperty = property;
            property.__propertyTextMarker = propertyTextMarker;

            property.addEventListener(WebInspector.CSSProperty.Event.OverriddenStatusChanged, this._propertyOverriddenStatusChanged, this);

            this._removeCheckboxPlaceholder(from.line);

            if (property.__filterResultClassName && property.__filterResultNeedlePosition) {
                var _iteratorNormalCompletion10 = true;
                var _didIteratorError10 = false;
                var _iteratorError10 = undefined;

                try {
                    for (var _iterator10 = property.__filterResultNeedlePosition.start[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                        var needlePosition = _step10.value;

                        var start = { line: from.line, ch: needlePosition };
                        var end = { line: to.line, ch: start.ch + property.__filterResultNeedlePosition.length };

                        this._codeMirror.markText(start, end, { className: property.__filterResultClassName });
                    }
                } catch (err) {
                    _didIteratorError10 = true;
                    _iteratorError10 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion10 && _iterator10["return"]) {
                            _iterator10["return"]();
                        }
                    } finally {
                        if (_didIteratorError10) {
                            throw _iteratorError10;
                        }
                    }
                }
            }

            if (property.hasOtherVendorNameOrKeyword() || property.text.trim().endsWith(":")) return;

            var propertyHasUnnecessaryPrefix = property.name.startsWith("-webkit-") && WebInspector.CSSCompletions.cssNameCompletions.isValidPropertyName(property.canonicalName);

            function generateInvalidMarker(options) {
                var invalidMarker = document.createElement("button");
                invalidMarker.className = "invalid-warning-marker";
                invalidMarker.title = options.title;

                if (typeof options.correction === "string") {
                    // Allow for blank strings
                    invalidMarker.classList.add("clickable");
                    invalidMarker.addEventListener("click", (function () {
                        this._codeMirror.replaceRange(options.correction, from, to);

                        if (options.autocomplete) {
                            this._codeMirror.setCursor(to);
                            this.focus();
                            this._completionController._completeAtCurrentPosition(true);
                        }
                    }).bind(this));
                }

                this._codeMirror.setBookmark(options.position, invalidMarker);
            }

            function instancesOfProperty(propertyName) {
                var count = 0;

                var _iteratorNormalCompletion11 = true;
                var _didIteratorError11 = false;
                var _iteratorError11 = undefined;

                try {
                    for (var _iterator11 = this._style.properties[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                        var property = _step11.value;

                        if (property.name === propertyName) ++count;
                    }
                } catch (err) {
                    _didIteratorError11 = true;
                    _iteratorError11 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion11 && _iterator11["return"]) {
                            _iterator11["return"]();
                        }
                    } finally {
                        if (_didIteratorError11) {
                            throw _iteratorError11;
                        }
                    }
                }

                return count;
            }

            // Number of times this property name is listed in the rule.
            var instances = instancesOfProperty.call(this, property.name);
            var invalidMarkerInfo;

            if (propertyHasUnnecessaryPrefix && !instancesOfProperty.call(this, property.canonicalName)) {
                // This property has a prefix and is valid without the prefix and the rule containing this property does not have the unprefixed version of the property.
                generateInvalidMarker.call(this, {
                    position: from,
                    title: WebInspector.UIString("The 'webkit' prefix is not necessary.\nClick to insert a duplicate without the prefix."),
                    correction: property.text + "\n" + property.text.replace("-webkit-", ""),
                    autocomplete: false
                });
            } else if (instances > 1) {
                invalidMarkerInfo = {
                    position: from,
                    title: WebInspector.UIString("Duplicate property '%s'.\nClick to delete this property.").format(property.name),
                    correction: "",
                    autocomplete: false
                };
            }

            if (property.valid) {
                if (invalidMarkerInfo) generateInvalidMarker.call(this, invalidMarkerInfo);

                return;
            }

            if (propertyNameIsValid) {
                // The property's name is valid but its value is not (either it is not supported for this property or there is no value).
                var semicolon = /:\s*/.exec(property.text);
                var start = { line: from.line, ch: semicolon.index + semicolon[0].length };
                var end = { line: to.line, ch: start.ch + property.value.length };

                this._codeMirror.markText(start, end, { className: "invalid" });

                if (/^(?:\d+)$/.test(property.value)) {
                    invalidMarkerInfo = {
                        position: start,
                        title: WebInspector.UIString("The value '%s' needs units.\nClick to add 'px' to the value.").format(property.value),
                        correction: property.name + ": " + property.value + "px;",
                        autocomplete: false
                    };
                } else {
                    var valueReplacement = property.value.length ? WebInspector.UIString("The value '%s' is not supported for this property.\nClick to delete and open autocomplete.").format(property.value) : WebInspector.UIString("This property needs a value.\nClick to open autocomplete.");

                    invalidMarkerInfo = {
                        position: start,
                        title: valueReplacement,
                        correction: property.name + ": ",
                        autocomplete: true
                    };
                }
            } else if (!instancesOfProperty.call(this, "-webkit-" + property.name) && WebInspector.CSSCompletions.cssNameCompletions.propertyRequiresWebkitPrefix(property.name)) {
                // The property is valid and exists in the rule while its prefixed version does not.
                invalidMarkerInfo = {
                    position: from,
                    title: WebInspector.UIString("The 'webkit' prefix is needed for this property.\nClick to insert a duplicate with the prefix."),
                    correction: "-webkit-" + property.text + "\n" + property.text,
                    autocomplete: false
                };
            } else if (!propertyHasUnnecessaryPrefix && !WebInspector.CSSCompletions.cssNameCompletions.isValidPropertyName("-webkit-" + property.name)) {
                // The property either has no prefix and is invalid with a prefix or is invalid without a prefix.
                var closestPropertyName = WebInspector.CSSCompletions.cssNameCompletions.getClosestPropertyName(property.name);

                if (closestPropertyName) {
                    // The property name has less than 3 other properties that have the same Levenshtein distance.
                    invalidMarkerInfo = {
                        position: from,
                        title: WebInspector.UIString("Did you mean '%s'?\nClick to replace.").format(closestPropertyName),
                        correction: property.text.replace(property.name, closestPropertyName),
                        autocomplete: true
                    };
                } else if (property.name.startsWith("-webkit-") && (closestPropertyName = WebInspector.CSSCompletions.cssNameCompletions.getClosestPropertyName(property.canonicalName))) {
                    // The unprefixed property name has less than 3 other properties that have the same Levenshtein distance.
                    invalidMarkerInfo = {
                        position: from,
                        title: WebInspector.UIString("Did you mean '%s'?\nClick to replace.").format("-webkit-" + closestPropertyName),
                        correction: property.text.replace(property.canonicalName, closestPropertyName),
                        autocomplete: true
                    };
                } else {
                    // The property name is so vague or nonsensical that there are more than 3 other properties that have the same Levenshtein value.
                    invalidMarkerInfo = {
                        position: from,
                        title: WebInspector.UIString("The property '%s' is not supported.").format(property.name),
                        correction: false,
                        autocomplete: false
                    };
                }
            }

            if (!invalidMarkerInfo) return;

            generateInvalidMarker.call(this, invalidMarkerInfo);
        }
    }, {
        key: "_clearTextMarkers",
        value: function _clearTextMarkers(nonatomic, all) {
            function clear() {
                var markers = this._codeMirror.getAllMarks();
                for (var i = 0; i < markers.length; ++i) {
                    var textMarker = markers[i];

                    if (!all && textMarker.__checkboxPlaceholder) {
                        var position = textMarker.find();

                        // Only keep checkbox placeholders if they are in the first column.
                        if (position && !position.ch) continue;
                    }

                    if (textMarker.__cssProperty) {
                        textMarker.__cssProperty.removeEventListener(null, null, this);

                        delete textMarker.__cssProperty.__propertyTextMarker;
                        delete textMarker.__cssProperty;
                    }

                    textMarker.clear();
                }
            }

            if (nonatomic) clear.call(this);else this._codeMirror.operation(clear.bind(this));
        }
    }, {
        key: "_iterateOverProperties",
        value: function _iterateOverProperties(onlyVisibleProperties, callback) {
            var properties = onlyVisibleProperties ? this._style.visibleProperties : this._style.properties;

            if (this._filterResultPropertyNames) {
                properties = properties.filter(function (property) {
                    return (!property.implicit || this._showsImplicitProperties) && property.name in this._filterResultPropertyNames;
                }, this);

                if (this._sortProperties) properties.sort(function (a, b) {
                    return a.name.localeCompare(b.name);
                });
            } else if (!onlyVisibleProperties) {
                // Filter based on options only when all properties are used.
                properties = properties.filter(function (property) {
                    return !property.implicit || this._showsImplicitProperties || property.canonicalName in this._alwaysShowPropertyNames;
                }, this);

                if (this._sortProperties) properties.sort(function (a, b) {
                    return a.name.localeCompare(b.name);
                });
            }

            for (var i = 0; i < properties.length; ++i) {
                if (callback.call(this, properties[i], i === properties.length - 1)) break;
            }
        }
    }, {
        key: "_propertyCheckboxChanged",
        value: function _propertyCheckboxChanged(event) {
            var property = event.target.__cssProperty;
            console.assert(property);
            if (!property) return;

            this._commentProperty(property);
        }
    }, {
        key: "_commentProperty",
        value: function _commentProperty(property) {
            var textMarker = property.__propertyTextMarker;
            console.assert(textMarker);
            if (!textMarker) return;

            // Check if the property has been removed already, like from double-clicking
            // the checkbox and calling this event listener multiple times.
            var range = textMarker.find();
            if (!range) return;

            property._commentRange = range;
            property._commentRange.to.ch += 6; // Number of characters added by comments.

            var text = this._codeMirror.getRange(range.from, range.to);

            function update() {
                // Replace the text with a commented version.
                this._codeMirror.replaceRange("/* " + text + " */", range.from, range.to);

                // Update the line for any color swatches or cubic-beziers that got removed.
                this._createColorSwatches(true, range.from.line);
                this._createBezierEditors(true, range.from.line);
            }

            this._codeMirror.operation(update.bind(this));
        }
    }, {
        key: "_propertyCommentCheckboxChanged",
        value: function _propertyCommentCheckboxChanged(event) {
            var commentTextMarker = event.target.__commentTextMarker;
            console.assert(commentTextMarker);
            if (!commentTextMarker) return;

            // Check if the comment has been removed already, like from double-clicking
            // the checkbox and calling event listener multiple times.
            var range = commentTextMarker.find();
            if (!range) return;

            this._uncommentRange(range);
        }
    }, {
        key: "_uncommentRange",
        value: function _uncommentRange(range) {
            var text = this._codeMirror.getRange(range.from, range.to);

            // Remove the comment prefix and suffix.
            text = text.replace(/^\/\*\s*/, "").replace(/\s*\*\/$/, "");

            // Add a semicolon if there isn't one already.
            if (text.length && text.charAt(text.length - 1) !== ";") text += ";";

            function update() {
                this._codeMirror.addLineClass(range.from.line, "wrap", WebInspector.CSSStyleDeclarationTextEditor.EditingLineStyleClassName);
                this._codeMirror.replaceRange(text, range.from, range.to);

                // Update the line for any color swatches or cubic-beziers that got removed.
                this._createColorSwatches(true, range.from.line);
                this._createBezierEditors(true, range.from.line);
            }

            this._codeMirror.operation(update.bind(this));
        }
    }, {
        key: "_colorSwatchClicked",
        value: function _colorSwatchClicked(event) {
            if (this._colorPickerPopover) return;

            var swatch = event.target;

            var color = swatch.__color;
            console.assert(color);
            if (!color) return;

            var colorTextMarker = swatch.__colorTextMarker;
            console.assert(colorTextMarker);
            if (!colorTextMarker) return;

            var range = colorTextMarker.find();
            console.assert(range);
            if (!range) return;

            function updateCodeMirror(newColorText) {
                function update() {
                    // The original text marker might have been cleared by a style update,
                    // in this case we need to find the new color text marker so we know
                    // the right range for the new style color text.
                    if (!colorTextMarker || !colorTextMarker.find()) {
                        colorTextMarker = null;

                        var marks = this._codeMirror.findMarksAt(range.from);
                        if (!marks.length) return;

                        for (var i = 0; i < marks.length; ++i) {
                            var mark = marks[i];
                            if (WebInspector.TextMarker.textMarkerForCodeMirrorTextMarker(mark).type !== WebInspector.TextMarker.Type.Color) continue;
                            colorTextMarker = mark;
                            break;
                        }
                    }

                    if (!colorTextMarker) return;

                    // Sometimes we still might find a stale text marker with findMarksAt.
                    var newRange = colorTextMarker.find();
                    if (!newRange) return;

                    range = newRange;

                    colorTextMarker.clear();

                    this._codeMirror.replaceRange(newColorText, range.from, range.to);

                    // The color's text format could have changed, so we need to update the "range"
                    // variable to anticipate a different "range.to" property.
                    range.to.ch = range.from.ch + newColorText.length;

                    colorTextMarker = this._codeMirror.markText(range.from, range.to);

                    swatch.__colorTextMarker = colorTextMarker;
                }

                this._codeMirror.operation(update.bind(this));
            }

            if (event.shiftKey || this._codeMirror.getOption("readOnly")) {
                var nextFormat = color.nextFormat();
                console.assert(nextFormat);
                if (!nextFormat) return;
                color.format = nextFormat;

                var newColorText = color.toString();

                // Ignore the change so we don't commit the format change. However, any future user
                // edits will commit the color format.
                this._ignoreCodeMirrorContentDidChangeEvent = true;
                updateCodeMirror.call(this, newColorText);
                delete this._ignoreCodeMirrorContentDidChangeEvent;
            } else {
                this._colorPickerPopover = new WebInspector.Popover(this);

                var colorPicker = new WebInspector.ColorPicker();

                colorPicker.addEventListener(WebInspector.ColorPicker.Event.ColorChanged, (function (event) {
                    updateCodeMirror.call(this, event.data.color.toString());
                }).bind(this));

                var bounds = WebInspector.Rect.rectFromClientRect(swatch.getBoundingClientRect());

                this._colorPickerPopover.content = colorPicker.element;
                this._colorPickerPopover.present(bounds.pad(2), [WebInspector.RectEdge.MIN_X]);

                colorPicker.color = color;
            }
        }
    }, {
        key: "_cubicBezierMarkerClicked",
        value: function _cubicBezierMarkerClicked(event) {
            if (this._cubicBezierEditorPopover) return;

            var bezierMarker = event.target;

            var bezier = bezierMarker.__bezier;
            console.assert(bezier);
            if (!bezier) return;

            var bezierTextMarker = bezierMarker.__textMarker;
            console.assert(bezierTextMarker);
            if (!bezierTextMarker) return;

            var range = bezierTextMarker.find();
            console.assert(range);
            if (!range) return;

            function updateCodeMirror(newCubicBezierText) {
                function update() {
                    // The original text marker might have been cleared by a style update,
                    // in this case we need to find the new bezier text marker so we know
                    // the right range for the new style bezier text.
                    if (!bezierTextMarker || !bezierTextMarker.find()) {
                        bezierTextMarker = null;

                        var marks = this._codeMirror.findMarksAt(range.from);
                        if (!marks.length) return;

                        for (var i = 0; i < marks.length; ++i) {
                            var mark = marks[i];
                            if (WebInspector.TextMarker.textMarkerForCodeMirrorTextMarker(mark).type !== WebInspector.TextMarker.Type.CubicBezier) continue;
                            bezierTextMarker = mark;
                            break;
                        }
                    }

                    if (!bezierTextMarker) return;

                    // Sometimes we still might find a stale text marker with findMarksAt.
                    var newRange = bezierTextMarker.find();
                    if (!newRange) return;

                    range = newRange;

                    bezierTextMarker.clear();

                    this._codeMirror.replaceRange(newCubicBezierText, range.from, range.to);

                    // The bezier's text format could have changed, so we need to update the "range"
                    // variable to anticipate a different "range.to" property.
                    range.to.ch = range.from.ch + newCubicBezierText.length;

                    bezierTextMarker = this._codeMirror.markText(range.from, range.to);

                    bezierMarker.__textMarker = bezierTextMarker;
                }

                this._codeMirror.operation(update.bind(this));
            }

            this._cubicBezierEditorPopover = new WebInspector.Popover(this);

            var bezierEditor = new WebInspector.BezierEditor();

            bezierEditor.addEventListener(WebInspector.BezierEditor.Event.BezierChanged, (function (event) {
                updateCodeMirror.call(this, event.data.bezier.toString());
            }).bind(this));

            var bounds = WebInspector.Rect.rectFromClientRect(bezierMarker.getBoundingClientRect());

            this._cubicBezierEditorPopover.content = bezierEditor.element;
            this._cubicBezierEditorPopover.present(bounds.pad(2), [WebInspector.RectEdge.MIN_X]);

            bezierEditor.bezier = bezier;
        }
    }, {
        key: "_propertyOverriddenStatusChanged",
        value: function _propertyOverriddenStatusChanged(event) {
            this._updateTextMarkerForPropertyIfNeeded(event.target);
        }
    }, {
        key: "_propertiesChanged",
        value: function _propertiesChanged(event) {
            // Don't try to update the document while completions are showing. Doing so will clear
            // the completion hint and prevent further interaction with the completion.
            if (this._completionController.isShowingCompletions()) return;

            // Reset the content if the text is different and we are not focused.
            if (!this.focused && (!this._style.text || this._style.text !== this._formattedContent())) {
                this._resetContent();
                return;
            }

            this._removeEditingLineClassesSoon();

            this._updateTextMarkers();
        }
    }, {
        key: "_markLinesWithCheckboxPlaceholder",
        value: function _markLinesWithCheckboxPlaceholder() {
            if (this._codeMirror.getOption("readOnly")) return;

            var linesWithPropertyCheckboxes = {};
            var linesWithCheckboxPlaceholders = {};

            var markers = this._codeMirror.getAllMarks();
            for (var i = 0; i < markers.length; ++i) {
                var textMarker = markers[i];
                if (textMarker.__propertyCheckbox) {
                    var position = textMarker.find();
                    if (position) linesWithPropertyCheckboxes[position.line] = true;
                } else if (textMarker.__checkboxPlaceholder) {
                    var position = textMarker.find();
                    if (position) linesWithCheckboxPlaceholders[position.line] = true;
                }
            }

            var lineCount = this._codeMirror.lineCount();

            for (var i = 0; i < lineCount; ++i) {
                if (i in linesWithPropertyCheckboxes || i in linesWithCheckboxPlaceholders) continue;

                var position = { line: i, ch: 0 };

                var placeholderElement = document.createElement("div");
                placeholderElement.className = WebInspector.CSSStyleDeclarationTextEditor.CheckboxPlaceholderElementStyleClassName;

                var placeholderMark = this._codeMirror.setUniqueBookmark(position, placeholderElement);
                placeholderMark.__checkboxPlaceholder = true;
            }
        }
    }, {
        key: "_removeCheckboxPlaceholder",
        value: function _removeCheckboxPlaceholder(lineNumber) {
            var marks = this._codeMirror.findMarksAt({ line: lineNumber, ch: 0 });
            for (var i = 0; i < marks.length; ++i) {
                var mark = marks[i];
                if (!mark.__checkboxPlaceholder) continue;

                mark.clear();
                return;
            }
        }
    }, {
        key: "_formattedContentFromEditor",
        value: function _formattedContentFromEditor() {
            var mapping = { original: [0], formatted: [0] };
            // FIXME: <rdar://problem/10593948> Provide a way to change the tab width in the Web Inspector
            var indentString = "    ";
            var builder = new WebInspector.FormatterContentBuilder(mapping, [], [], 0, 0, indentString);
            var formatter = new WebInspector.Formatter(this._codeMirror, builder);
            var start = { line: 0, ch: 0 };
            var end = { line: this._codeMirror.lineCount() - 1 };
            formatter.format(start, end);

            return builder.formattedContent.trim();
        }
    }, {
        key: "_resetContent",
        value: function _resetContent() {
            if (this._commitChangesTimeout) {
                clearTimeout(this._commitChangesTimeout);
                this._commitChangesTimeout = null;
            }

            this._removeEditingLineClasses();

            // Only allow editing if we have a style, it is editable and we have text range in the stylesheet.
            var readOnly = !this._style || !this._style.editable || !this._style.styleSheetTextRange;
            this._codeMirror.setOption("readOnly", readOnly);

            if (readOnly) {
                this.element.classList.add(WebInspector.CSSStyleDeclarationTextEditor.ReadOnlyStyleClassName);
                this._codeMirror.setOption("placeholder", WebInspector.UIString("No Properties"));
            } else {
                this.element.classList.remove(WebInspector.CSSStyleDeclarationTextEditor.ReadOnlyStyleClassName);
                this._codeMirror.setOption("placeholder", WebInspector.UIString("No Properties — Click to Edit"));
            }

            if (!this._style) {
                this._ignoreCodeMirrorContentDidChangeEvent = true;

                this._clearTextMarkers(false, true);
                this._codeMirror.setValue("");
                this._codeMirror.clearHistory();
                this._codeMirror.markClean();

                this._ignoreCodeMirrorContentDidChangeEvent = false;
                return;
            }

            function update() {
                var _this = this;

                // Remember the cursor position/selection.
                var isEditorReadOnly = this._codeMirror.getOption("readOnly");
                var styleText = this._style.text;
                var trimmedStyleText = styleText.trim();

                // We only need to format non-empty styles, but prepare checkbox placeholders
                // in any case because that will indent the cursor when the User starts typing.
                if (!trimmedStyleText && !isEditorReadOnly) {
                    this._markLinesWithCheckboxPlaceholder();
                    return;
                }

                // Generate formatted content for readonly editors by iterating properties.
                if (isEditorReadOnly) {
                    var _ret = (function () {
                        _this._codeMirror.setValue("");
                        var lineNumber = 0;
                        _this._iterateOverProperties(false, function (property) {
                            var from = { line: lineNumber, ch: 0 };
                            var to = { line: lineNumber };
                            // Readonly properties are pretty printed by `synthesizedText` and not the Formatter.
                            this._codeMirror.replaceRange((lineNumber ? "\n" : "") + property.synthesizedText, from);
                            this._createTextMarkerForPropertyIfNeeded(from, to, property);
                            lineNumber++;
                        });
                        return {
                            v: undefined
                        };
                    })();

                    if (typeof _ret === "object") return _ret.v;
                }

                var selectionAnchor = this._codeMirror.getCursor("anchor");
                var selectionHead = this._codeMirror.getCursor("head");
                var whitespaceRegex = /\s+/g;

                // FIXME: <rdar://problem/10593948> Provide a way to change the tab width in the Web Inspector
                this._linePrefixWhitespace = "    ";
                var styleTextPrefixWhitespace = styleText.match(/^\s*/);

                // If there is a match and the style text contains a newline, attempt to pull out the prefix whitespace
                // in front of the first line of CSS to use for every line.  If  there is no newline, we want to avoid
                // adding multiple spaces to a single line CSS rule and instead format it on multiple lines.
                if (styleTextPrefixWhitespace && trimmedStyleText.includes("\n")) {
                    var linePrefixWhitespaceMatch = styleTextPrefixWhitespace[0].match(/[^\S\n]+$/);
                    if (linePrefixWhitespaceMatch) this._linePrefixWhitespace = linePrefixWhitespaceMatch[0];
                }

                // Set non-optimized, valid and invalid styles in preparation for the Formatter.
                this._codeMirror.setValue(trimmedStyleText);

                // Now the Formatter pretty prints the styles.
                this._codeMirror.setValue(this._formattedContentFromEditor());

                // We need to workaround the fact that...
                // 1) `this._style.properties` only holds valid CSSProperty instances but not
                // comments and invalid properties like `color;`.
                // 2) `_createTextMarkerForPropertyIfNeeded` relies on CSSProperty instances.
                var cssPropertiesMap = new Map();
                this._iterateOverProperties(false, function (cssProperty) {
                    cssProperty.__refreshedAfterBlur = false;

                    var propertyTextSansWhitespace = cssProperty.text.replace(whitespaceRegex, "");
                    var existingProperties = cssPropertiesMap.get(propertyTextSansWhitespace) || [];
                    existingProperties.push(cssProperty);

                    cssPropertiesMap.set(propertyTextSansWhitespace, existingProperties);
                });

                // Go through the Editor line by line and create TextMarker when a
                // CSSProperty instance for that property exists. If not, then don't create a TextMarker.
                this._codeMirror.eachLine((function (lineHandler) {
                    var lineNumber = lineHandler.lineNo();
                    var lineContentSansWhitespace = lineHandler.text.replace(whitespaceRegex, "");
                    var properties = cssPropertiesMap.get(lineContentSansWhitespace);
                    if (!properties) {
                        this._createCommentedCheckboxMarker(lineHandler);
                        return;
                    }

                    var _iteratorNormalCompletion12 = true;
                    var _didIteratorError12 = false;
                    var _iteratorError12 = undefined;

                    try {
                        for (var _iterator12 = properties[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                            var property = _step12.value;

                            if (property.__refreshedAfterBlur) continue;

                            var from = { line: lineNumber, ch: 0 };
                            var to = { line: lineNumber };
                            this._createTextMarkerForPropertyIfNeeded(from, to, property);
                            property.__refreshedAfterBlur = true;
                            break;
                        }
                    } catch (err) {
                        _didIteratorError12 = true;
                        _iteratorError12 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion12 && _iterator12["return"]) {
                                _iterator12["return"]();
                            }
                        } finally {
                            if (_didIteratorError12) {
                                throw _iteratorError12;
                            }
                        }
                    }
                }).bind(this));

                // Look for colors and make swatches.
                this._createColorSwatches(true);
                this._createBezierEditors(true);

                // Restore the cursor position/selection.
                this._codeMirror.setSelection(selectionAnchor, selectionHead);

                // Reset undo history since undo past the reset is wrong when the content was empty before
                // or the content was representing a previous style object.
                this._codeMirror.clearHistory();

                // Mark the editor as clean (unedited state).
                this._codeMirror.markClean();

                this._markLinesWithCheckboxPlaceholder();
            }

            // This needs to be done first and as a separate operation to avoid an exception in CodeMirror.
            this._clearTextMarkers(false, true);

            this._ignoreCodeMirrorContentDidChangeEvent = true;
            this._codeMirror.operation(update.bind(this));
            this._ignoreCodeMirrorContentDidChangeEvent = false;
        }
    }, {
        key: "_updateJumpToSymbolTrackingMode",
        value: function _updateJumpToSymbolTrackingMode() {
            var oldJumpToSymbolTrackingModeEnabled = this._jumpToSymbolTrackingModeEnabled;

            if (!this._style || !this._style.ownerRule || !this._style.ownerRule.sourceCodeLocation) this._jumpToSymbolTrackingModeEnabled = false;else this._jumpToSymbolTrackingModeEnabled = WebInspector.modifierKeys.altKey && !WebInspector.modifierKeys.metaKey && !WebInspector.modifierKeys.shiftKey;

            if (oldJumpToSymbolTrackingModeEnabled !== this._jumpToSymbolTrackingModeEnabled) {
                if (this._jumpToSymbolTrackingModeEnabled) {
                    this._tokenTrackingController.highlightLastHoveredRange();
                    this._tokenTrackingController.enabled = !this._codeMirror.getOption("readOnly");
                } else {
                    this._tokenTrackingController.removeHighlightedRange();
                    this._tokenTrackingController.enabled = false;
                }
            }
        }
    }, {
        key: "tokenTrackingControllerHighlightedRangeWasClicked",
        value: function tokenTrackingControllerHighlightedRangeWasClicked(tokenTrackingController) {
            console.assert(this._style.ownerRule.sourceCodeLocation);
            if (!this._style.ownerRule.sourceCodeLocation) return;

            // Special case command clicking url(...) links.
            var token = this._tokenTrackingController.candidate.hoveredToken;
            if (/\blink\b/.test(token.type)) {
                var url = token.string;
                var baseURL = this._style.ownerRule.sourceCodeLocation.sourceCode.url;
                WebInspector.openURL(absoluteURL(url, baseURL));
                return;
            }

            // Jump to the rule if we can't find a property.
            // Find a better source code location from the property that was clicked.
            var sourceCodeLocation = this._style.ownerRule.sourceCodeLocation;
            var marks = this._codeMirror.findMarksAt(this._tokenTrackingController.candidate.hoveredTokenRange.start);
            for (var i = 0; i < marks.length; ++i) {
                var mark = marks[i];
                var property = mark.__cssProperty;
                if (property) {
                    var sourceCode = sourceCodeLocation.sourceCode;
                    var styleSheetTextRange = property.styleSheetTextRange;
                    sourceCodeLocation = sourceCode.createSourceCodeLocation(styleSheetTextRange.startLine, styleSheetTextRange.startColumn);
                }
            }

            WebInspector.showSourceCodeLocation(sourceCodeLocation);
        }
    }, {
        key: "tokenTrackingControllerNewHighlightCandidate",
        value: function tokenTrackingControllerNewHighlightCandidate(tokenTrackingController, candidate) {
            this._tokenTrackingController.highlightRange(candidate.hoveredTokenRange);
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
        key: "style",
        get: function get() {
            return this._style;
        },
        set: function set(style) {
            if (this._style === style) return;

            if (this._style) {
                this._style.removeEventListener(WebInspector.CSSStyleDeclaration.Event.PropertiesChanged, this._propertiesChanged, this);
                if (this._style.ownerRule && this._style.ownerRule.sourceCodeLocation) WebInspector.notifications.removeEventListener(WebInspector.Notification.GlobalModifierKeysDidChange, this._updateJumpToSymbolTrackingMode, this);
            }

            this._style = style || null;

            if (this._style) {
                this._style.addEventListener(WebInspector.CSSStyleDeclaration.Event.PropertiesChanged, this._propertiesChanged, this);
                if (this._style.ownerRule && this._style.ownerRule.sourceCodeLocation) WebInspector.notifications.addEventListener(WebInspector.Notification.GlobalModifierKeysDidChange, this._updateJumpToSymbolTrackingMode, this);
            }

            this._updateJumpToSymbolTrackingMode();

            this._resetContent();
        }
    }, {
        key: "focused",
        get: function get() {
            return this._codeMirror.getWrapperElement().classList.contains("CodeMirror-focused");
        }
    }, {
        key: "alwaysShowPropertyNames",
        get: function get() {
            return Object.keys(this._alwaysShowPropertyNames);
        },
        set: function set(alwaysShowPropertyNames) {
            this._alwaysShowPropertyNames = (alwaysShowPropertyNames || []).keySet();

            this._resetContent();
        }
    }, {
        key: "showsImplicitProperties",
        get: function get() {
            return this._showsImplicitProperties;
        },
        set: function set(showsImplicitProperties) {
            if (this._showsImplicitProperties === showsImplicitProperties) return;

            this._showsImplicitProperties = showsImplicitProperties;

            this._resetContent();
        }
    }, {
        key: "sortProperties",
        get: function get() {
            return this._sortProperties;
        },
        set: function set(sortProperties) {
            if (this._sortProperties === sortProperties) return;

            this._sortProperties = sortProperties;

            this._resetContent();
        }
    }]);

    return CSSStyleDeclarationTextEditor;
})(WebInspector.Object);

WebInspector.CSSStyleDeclarationTextEditor.Event = {
    ContentChanged: "css-style-declaration-text-editor-content-changed",
    Blurred: "css-style-declaration-text-editor-blurred"
};

WebInspector.CSSStyleDeclarationTextEditor.StyleClassName = "css-style-text-editor";
WebInspector.CSSStyleDeclarationTextEditor.ReadOnlyStyleClassName = "read-only";
WebInspector.CSSStyleDeclarationTextEditor.ColorSwatchElementStyleClassName = "color-swatch";
WebInspector.CSSStyleDeclarationTextEditor.BezierEditorClassName = "cubic-bezier-marker";
WebInspector.CSSStyleDeclarationTextEditor.CheckboxPlaceholderElementStyleClassName = "checkbox-placeholder";
WebInspector.CSSStyleDeclarationTextEditor.EditingLineStyleClassName = "editing-line";
WebInspector.CSSStyleDeclarationTextEditor.CommitCoalesceDelay = 250;
WebInspector.CSSStyleDeclarationTextEditor.RemoveEditingLineClassesDelay = 2000;
