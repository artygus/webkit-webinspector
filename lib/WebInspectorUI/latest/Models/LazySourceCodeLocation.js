var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2014 Apple Inc. All rights reserved.
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

// FIXME: Investigate folding this into SourceCodeLocation proper so it can always be as lazy as possible.

// Lazily compute the full SourceCodeLocation information only when such information is needed.
//  - raw information doesn't require initialization, we have that information
//  - formatted information does require initialization, done by overriding public APIs.
//  - display information does require initialization, done by overriding private funnel API resolveMappedLocation.

WebInspector.LazySourceCodeLocation = (function (_WebInspector$SourceCodeLocation) {
    _inherits(LazySourceCodeLocation, _WebInspector$SourceCodeLocation);

    function LazySourceCodeLocation(sourceCode, lineNumber, columnNumber) {
        _classCallCheck(this, LazySourceCodeLocation);

        _get(Object.getPrototypeOf(LazySourceCodeLocation.prototype), "constructor", this).call(this, null, lineNumber, columnNumber);

        console.assert(sourceCode);

        this._initialized = false;
        this._lazySourceCode = sourceCode;
    }

    // Public

    _createClass(LazySourceCodeLocation, [{
        key: "isEqual",
        value: function isEqual(other) {
            if (!other) return false;
            return this._lazySourceCode === other._sourceCode && this._lineNumber === other._lineNumber && this._columnNumber === other._columnNumber;
        }
    }, {
        key: "formattedPosition",
        value: function formattedPosition() {
            this._lazyInitialization();
            return new WebInspector.SourceCodePosition(this._formattedLineNumber, this._formattedColumnNumber);
        }
    }, {
        key: "hasFormattedLocation",
        value: function hasFormattedLocation() {
            this._lazyInitialization();
            return _get(Object.getPrototypeOf(LazySourceCodeLocation.prototype), "hasFormattedLocation", this).call(this);
        }
    }, {
        key: "hasDifferentDisplayLocation",
        value: function hasDifferentDisplayLocation() {
            this._lazyInitialization();
            return _get(Object.getPrototypeOf(LazySourceCodeLocation.prototype), "hasDifferentDisplayLocation", this).call(this);
        }

        // Protected

    }, {
        key: "resolveMappedLocation",
        value: function resolveMappedLocation() {
            this._lazyInitialization();
            _get(Object.getPrototypeOf(LazySourceCodeLocation.prototype), "resolveMappedLocation", this).call(this);
        }

        // Private

    }, {
        key: "_lazyInitialization",
        value: function _lazyInitialization() {
            if (!this._initialized) {
                this._initialized = true;
                this.sourceCode = this._lazySourceCode;
            }
        }
    }, {
        key: "sourceCode",
        get: function get() {
            return this._lazySourceCode;
        },
        set: function set(sourceCode) {
            // Getter and setter must be provided together.
            this.setSourceCode(sourceCode);
        }
    }, {
        key: "formattedLineNumber",
        get: function get() {
            this._lazyInitialization();
            return this._formattedLineNumber;
        }
    }, {
        key: "formattedColumnNumber",
        get: function get() {
            this._lazyInitialization();
            return this._formattedColumnNumber;
        }
    }]);

    return LazySourceCodeLocation;
})(WebInspector.SourceCodeLocation);
