var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2014 Apple Inc. All rights reserved.
 * Copyright (C) 2014 Saam Barati <saambarati1@gmail.com>
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

WebInspector.Annotator = (function (_WebInspector$Object) {
    _inherits(Annotator, _WebInspector$Object);

    function Annotator(sourceCodeTextEditor) {
        _classCallCheck(this, Annotator);

        _get(Object.getPrototypeOf(Annotator.prototype), "constructor", this).call(this);

        console.assert(sourceCodeTextEditor instanceof WebInspector.SourceCodeTextEditor, sourceCodeTextEditor);

        this._sourceCodeTextEditor = sourceCodeTextEditor;
        this._timeoutIdentifier = null;
        this._isActive = false;
    }

    // Public

    _createClass(Annotator, [{
        key: "isActive",
        value: function isActive() {
            return this._isActive;
        }
    }, {
        key: "pause",
        value: function pause() {
            this._clearTimeoutIfNeeded();
            this._isActive = false;
        }
    }, {
        key: "resume",
        value: function resume() {
            this._clearTimeoutIfNeeded();
            this._isActive = true;
            this.insertAnnotations();
        }
    }, {
        key: "refresh",
        value: function refresh() {
            console.assert(this._isActive);
            if (!this._isActive) return;

            this._clearTimeoutIfNeeded();
            this.insertAnnotations();
        }
    }, {
        key: "reset",
        value: function reset() {
            this._clearTimeoutIfNeeded();
            this._isActive = true;
            this.clearAnnotations();
            this.insertAnnotations();
        }
    }, {
        key: "clear",
        value: function clear() {
            this.pause();
            this.clearAnnotations();
        }

        // Protected

    }, {
        key: "insertAnnotations",
        value: function insertAnnotations() {
            // Implemented by subclasses.
        }
    }, {
        key: "clearAnnotations",
        value: function clearAnnotations() {}
        // Implemented by subclasses.

        // Private

    }, {
        key: "_clearTimeoutIfNeeded",
        value: function _clearTimeoutIfNeeded() {
            if (this._timeoutIdentifier) {
                clearTimeout(this._timeoutIdentifier);
                this._timeoutIdentifier = null;
            }
        }
    }, {
        key: "sourceCodeTextEditor",
        get: function get() {
            return this._sourceCodeTextEditor;
        }
    }]);

    return Annotator;
})(WebInspector.Object);
