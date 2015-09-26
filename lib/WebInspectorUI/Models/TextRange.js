var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2013 Apple Inc. All rights reserved.
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

WebInspector.TextRange = (function (_WebInspector$Object) {
    _inherits(TextRange, _WebInspector$Object);

    function TextRange(startLineOrStartOffset, startColumnOrEndOffset, endLine, endColumn) {
        _classCallCheck(this, TextRange);

        _get(Object.getPrototypeOf(TextRange.prototype), "constructor", this).call(this);

        if (arguments.length === 4) {
            console.assert(startLineOrStartOffset <= endLine);
            console.assert(startLineOrStartOffset !== endLine || startColumnOrEndOffset <= endColumn);

            this._startLine = typeof startLineOrStartOffset === "number" ? startLineOrStartOffset : NaN;
            this._startColumn = typeof startColumnOrEndOffset === "number" ? startColumnOrEndOffset : NaN;
            this._endLine = typeof endLine === "number" ? endLine : NaN;
            this._endColumn = typeof endColumn === "number" ? endColumn : NaN;

            this._startOffset = NaN;
            this._endOffset = NaN;
        } else if (arguments.length === 2) {
            console.assert(startLineOrStartOffset <= startColumnOrEndOffset);

            this._startOffset = typeof startLineOrStartOffset === "number" ? startLineOrStartOffset : NaN;
            this._endOffset = typeof startColumnOrEndOffset === "number" ? startColumnOrEndOffset : NaN;

            this._startLine = NaN;
            this._startColumn = NaN;
            this._endLine = NaN;
            this._endColumn = NaN;
        }
    }

    // Public

    _createClass(TextRange, [{
        key: "startPosition",
        value: function startPosition() {
            return new WebInspector.SourceCodePosition(this._startLine, this._startColumn);
        }
    }, {
        key: "endPosition",
        value: function endPosition() {
            return new WebInspector.SourceCodePosition(this._endLine, this._endColumn);
        }
    }, {
        key: "resolveOffsets",
        value: function resolveOffsets(text) {
            console.assert(typeof text === "string");
            if (typeof text !== "string") return;

            console.assert(!isNaN(this._startLine));
            console.assert(!isNaN(this._startColumn));
            console.assert(!isNaN(this._endLine));
            console.assert(!isNaN(this._endColumn));
            if (isNaN(this._startLine) || isNaN(this._startColumn) || isNaN(this._endLine) || isNaN(this._endColumn)) return;

            var lastNewLineOffset = 0;
            for (var i = 0; i < this._startLine; ++i) lastNewLineOffset = text.indexOf("\n", lastNewLineOffset) + 1;

            this._startOffset = lastNewLineOffset + this._startColumn;

            for (var i = this._startLine; i < this._endLine; ++i) lastNewLineOffset = text.indexOf("\n", lastNewLineOffset) + 1;

            this._endOffset = lastNewLineOffset + this._endColumn;
        }
    }, {
        key: "startLine",
        get: function get() {
            return this._startLine;
        }
    }, {
        key: "startColumn",
        get: function get() {
            return this._startColumn;
        }
    }, {
        key: "endLine",
        get: function get() {
            return this._endLine;
        }
    }, {
        key: "endColumn",
        get: function get() {
            return this._endColumn;
        }
    }, {
        key: "startOffset",
        get: function get() {
            return this._startOffset;
        }
    }, {
        key: "endOffset",
        get: function get() {
            return this._endOffset;
        }
    }]);

    return TextRange;
})(WebInspector.Object);
