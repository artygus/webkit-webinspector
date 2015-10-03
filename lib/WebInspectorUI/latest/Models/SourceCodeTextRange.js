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

WebInspector.SourceCodeTextRange = (function (_WebInspector$Object) {
    _inherits(SourceCodeTextRange, _WebInspector$Object);

    function SourceCodeTextRange(sourceCode) /* textRange || startLocation, endLocation */
    {
        _classCallCheck(this, SourceCodeTextRange);

        _get(Object.getPrototypeOf(SourceCodeTextRange.prototype), "constructor", this).call(this);

        console.assert(sourceCode instanceof WebInspector.SourceCode);
        console.assert(arguments.length === 2 || arguments.length === 3);

        this._sourceCode = sourceCode;

        if (arguments.length === 2) {
            var textRange = arguments[1];
            console.assert(textRange instanceof WebInspector.TextRange);
            this._startLocation = sourceCode.createSourceCodeLocation(textRange.startLine, textRange.startColumn);
            this._endLocation = sourceCode.createSourceCodeLocation(textRange.endLine, textRange.endColumn);
        } else {
            console.assert(arguments[1] instanceof WebInspector.SourceCodeLocation);
            console.assert(arguments[2] instanceof WebInspector.SourceCodeLocation);
            this._startLocation = arguments[1];
            this._endLocation = arguments[2];
        }

        this._startLocation.addEventListener(WebInspector.SourceCodeLocation.Event.LocationChanged, this._sourceCodeLocationChanged, this);
        this._endLocation.addEventListener(WebInspector.SourceCodeLocation.Event.LocationChanged, this._sourceCodeLocationChanged, this);
    }

    // Public

    _createClass(SourceCodeTextRange, [{
        key: "_startAndEndLocationsInSameMappedResource",

        // Private

        value: function _startAndEndLocationsInSameMappedResource() {
            return this._startLocation.hasMappedLocation() && this._endLocation.hasMappedLocation() && this._startLocation.displaySourceCode === this._endLocation.displaySourceCode;
        }
    }, {
        key: "_sourceCodeLocationChanged",
        value: function _sourceCodeLocationChanged(event) {
            this.dispatchEventToListeners(WebInspector.SourceCodeLocation.Event.RangeChanged);
        }
    }, {
        key: "sourceCode",
        get: function get() {
            return this._sourceCode;
        }

        // Raw text range in the original source code.

    }, {
        key: "textRange",
        get: function get() {
            var startLine = this._startLocation.lineNumber;
            var startColumn = this._startLocation.columnNumber;
            var endLine = this._endLocation.lineNumber;
            var endColumn = this._endLocation.columnNumber;
            return new WebInspector.TextRange(startLine, startColumn, endLine, endColumn);
        }

        // Formatted text range in the original source code if it is pretty printed.
        // This is the same as the raw text range if the source code has no formatter.

    }, {
        key: "formattedTextRange",
        get: function get() {
            var startLine = this._startLocation.formattedLineNumber;
            var startColumn = this._startLocation.formattedColumnNumber;
            var endLine = this._endLocation.formattedLineNumber;
            var endColumn = this._endLocation.formattedColumnNumber;
            return new WebInspector.TextRange(startLine, startColumn, endLine, endColumn);
        }

        // Display values:
        //   - Mapped resource and text range locations if the original source code has a
        //     source map and both start and end locations are in the same mapped resource.
        //   - Otherwise this is the formatted / raw text range.

    }, {
        key: "displaySourceCode",
        get: function get() {
            if (!this._startAndEndLocationsInSameMappedResource()) return this._sourceCode;

            return this._startLocation.displaySourceCode;
        }
    }, {
        key: "displayTextRange",
        get: function get() {
            if (!this._startAndEndLocationsInSameMappedResource()) return this.formattedTextRange;

            var startLine = this._startLocation.displayLineNumber;
            var startColumn = this._startLocation.displayColumnNumber;
            var endLine = this._endLocation.displayLineNumber;
            var endColumn = this._endLocation.displayColumnNumber;
            return new WebInspector.TextRange(startLine, startColumn, endLine, endColumn);
        }
    }]);

    return SourceCodeTextRange;
})(WebInspector.Object);

WebInspector.SourceCodeTextRange.Event = {
    RangeChanged: "source-code-text-range-range-changed"
};
