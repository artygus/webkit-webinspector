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

WebInspector.SourceCode = (function (_WebInspector$Object) {
    _inherits(SourceCode, _WebInspector$Object);

    function SourceCode() {
        _classCallCheck(this, SourceCode);

        _get(Object.getPrototypeOf(SourceCode.prototype), "constructor", this).call(this);

        this._originalRevision = new WebInspector.SourceCodeRevision(this, null, false);
        this._currentRevision = this._originalRevision;

        this._sourceMaps = null;
        this._formatterSourceMap = null;
        this._requestContentPromise = null;
    }

    // Public

    _createClass(SourceCode, [{
        key: "addSourceMap",
        value: function addSourceMap(sourceMap) {
            console.assert(sourceMap instanceof WebInspector.SourceMap);

            if (!this._sourceMaps) this._sourceMaps = [];

            this._sourceMaps.push(sourceMap);

            this.dispatchEventToListeners(WebInspector.SourceCode.Event.SourceMapAdded);
        }
    }, {
        key: "requestContent",
        value: function requestContent() {
            this._requestContentPromise = this._requestContentPromise || this.requestContentFromBackend().then(this._processContent.bind(this));

            return this._requestContentPromise;
        }
    }, {
        key: "createSourceCodeLocation",
        value: function createSourceCodeLocation(lineNumber, columnNumber) {
            return new WebInspector.SourceCodeLocation(this, lineNumber, columnNumber);
        }
    }, {
        key: "createLazySourceCodeLocation",
        value: function createLazySourceCodeLocation(lineNumber, columnNumber) {
            return new WebInspector.LazySourceCodeLocation(this, lineNumber, columnNumber);
        }
    }, {
        key: "createSourceCodeTextRange",
        value: function createSourceCodeTextRange(textRange) {
            return new WebInspector.SourceCodeTextRange(this, textRange);
        }

        // Protected

    }, {
        key: "revisionContentDidChange",
        value: function revisionContentDidChange(revision) {
            if (this._ignoreRevisionContentDidChangeEvent) return;

            if (revision !== this._currentRevision) return;

            this.handleCurrentRevisionContentChange();

            this.dispatchEventToListeners(WebInspector.SourceCode.Event.ContentDidChange);
        }
    }, {
        key: "handleCurrentRevisionContentChange",
        value: function handleCurrentRevisionContentChange() {
            // Implemented by subclasses if needed.
        }
    }, {
        key: "markContentAsStale",
        value: function markContentAsStale() {
            this._requestContentPromise = null;
            this._contentReceived = false;
        }
    }, {
        key: "requestContentFromBackend",
        value: function requestContentFromBackend() {
            // Implemented by subclasses.
            console.error("Needs to be implemented by a subclass.");
            return Promise.reject(new Error("Needs to be implemented by a subclass."));
        }
    }, {
        key: "_processContent",

        // Private

        value: function _processContent(parameters) {
            // Different backend APIs return one of `content, `body`, `text`, or `scriptSource`.
            var content = parameters.content || parameters.body || parameters.text || parameters.scriptSource;
            var error = parameters.error;
            if (parameters.base64Encoded) content = decodeBase64ToBlob(content, this.mimeType);

            var revision = this.revisionForRequestedContent;

            this._ignoreRevisionContentDidChangeEvent = true;
            revision.content = content || null;
            this._ignoreRevisionContentDidChangeEvent = false;

            // FIXME: Returning the content in this promise is misleading. It may not be current content
            // now, and it may become out-dated later on. We should drop content from this promise
            // and require clients to ask for the current contents from the sourceCode in the result.

            return Promise.resolve({
                error: error,
                sourceCode: this,
                content: content
            });
        }
    }, {
        key: "displayName",
        get: function get() {
            // Implemented by subclasses.
            console.error("Needs to be implemented by a subclass.");
            return "";
        }
    }, {
        key: "originalRevision",
        get: function get() {
            return this._originalRevision;
        }
    }, {
        key: "currentRevision",
        get: function get() {
            return this._currentRevision;
        },
        set: function set(revision) {
            console.assert(revision instanceof WebInspector.SourceCodeRevision);
            if (!(revision instanceof WebInspector.SourceCodeRevision)) return;

            console.assert(revision.sourceCode === this);
            if (revision.sourceCode !== this) return;

            this._currentRevision = revision;

            this.dispatchEventToListeners(WebInspector.SourceCode.Event.ContentDidChange);
        }
    }, {
        key: "content",
        get: function get() {
            return this._currentRevision.content;
        }
    }, {
        key: "sourceMaps",
        get: function get() {
            return this._sourceMaps || [];
        }
    }, {
        key: "formatterSourceMap",
        get: function get() {
            return this._formatterSourceMap;
        },
        set: function set(formatterSourceMap) {
            console.assert(this._formatterSourceMap === null || formatterSourceMap === null);
            console.assert(formatterSourceMap === null || formatterSourceMap instanceof WebInspector.FormatterSourceMap);

            this._formatterSourceMap = formatterSourceMap;

            this.dispatchEventToListeners(WebInspector.SourceCode.Event.FormatterDidChange);
        }
    }, {
        key: "revisionForRequestedContent",
        get: function get() {
            // Implemented by subclasses if needed.
            return this._originalRevision;
        }
    }, {
        key: "mimeType",
        get: function get() {
            // Implemented by subclasses.
            console.error("Needs to be implemented by a subclass.");
        }
    }]);

    return SourceCode;
})(WebInspector.Object);

WebInspector.SourceCode.Event = {
    ContentDidChange: "source-code-content-did-change",
    SourceMapAdded: "source-code-source-map-added",
    FormatterDidChange: "source-code-formatter-did-change",
    LoadingDidFinish: "source-code-loading-did-finish",
    LoadingDidFail: "source-code-loading-did-fail"
};
