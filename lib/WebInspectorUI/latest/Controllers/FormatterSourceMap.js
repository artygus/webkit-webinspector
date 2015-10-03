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

WebInspector.FormatterSourceMap = (function (_WebInspector$Object) {
    _inherits(FormatterSourceMap, _WebInspector$Object);

    function FormatterSourceMap(originalLineEndings, formattedLineEndings, mapping) {
        _classCallCheck(this, FormatterSourceMap);

        _get(Object.getPrototypeOf(FormatterSourceMap.prototype), "constructor", this).call(this);

        this._originalLineEndings = originalLineEndings;
        this._formattedLineEndings = formattedLineEndings;
        this._mapping = mapping;
    }

    // Static

    _createClass(FormatterSourceMap, [{
        key: "originalToFormatted",

        // Public

        value: function originalToFormatted(lineNumber, columnNumber) {
            var originalPosition = this._locationToPosition(this._originalLineEndings, lineNumber || 0, columnNumber || 0);
            return this.originalPositionToFormatted(originalPosition);
        }
    }, {
        key: "originalPositionToFormatted",
        value: function originalPositionToFormatted(originalPosition) {
            var formattedPosition = this._convertPosition(this._mapping.original, this._mapping.formatted, originalPosition);
            return this._positionToLocation(this._formattedLineEndings, formattedPosition);
        }
    }, {
        key: "formattedToOriginal",
        value: function formattedToOriginal(lineNumber, columnNumber) {
            var originalPosition = this.formattedToOriginalOffset(lineNumber, columnNumber);
            return this._positionToLocation(this._originalLineEndings, originalPosition);
        }
    }, {
        key: "formattedToOriginalOffset",
        value: function formattedToOriginalOffset(lineNumber, columnNumber) {
            var formattedPosition = this._locationToPosition(this._formattedLineEndings, lineNumber || 0, columnNumber || 0);
            var originalPosition = this._convertPosition(this._mapping.formatted, this._mapping.original, formattedPosition);
            return originalPosition;
        }

        // Private

    }, {
        key: "_locationToPosition",
        value: function _locationToPosition(lineEndings, lineNumber, columnNumber) {
            var lineOffset = lineNumber ? lineEndings[lineNumber - 1] + 1 : 0;
            return lineOffset + columnNumber;
        }
    }, {
        key: "_positionToLocation",
        value: function _positionToLocation(lineEndings, position) {
            var lineNumber = lineEndings.upperBound(position - 1);
            if (!lineNumber) var columnNumber = position;else var columnNumber = position - lineEndings[lineNumber - 1] - 1;
            return { lineNumber: lineNumber, columnNumber: columnNumber };
        }
    }, {
        key: "_convertPosition",
        value: function _convertPosition(positions1, positions2, positionInPosition1) {
            var index = positions1.upperBound(positionInPosition1) - 1;
            var convertedPosition = positions2[index] + positionInPosition1 - positions1[index];
            if (index < positions2.length - 1 && convertedPosition > positions2[index + 1]) convertedPosition = positions2[index + 1];
            return convertedPosition;
        }
    }], [{
        key: "fromBuilder",
        value: function fromBuilder(builder) {
            return new WebInspector.FormatterSourceMap(builder.originalLineEndings, builder.formattedLineEndings, builder.mapping);
        }
    }]);

    return FormatterSourceMap;
})(WebInspector.Object);
