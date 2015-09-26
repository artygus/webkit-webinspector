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

WebInspector.Branch = (function (_WebInspector$Object) {
    _inherits(Branch, _WebInspector$Object);

    function Branch(displayName, revisions, locked) {
        _classCallCheck(this, Branch);

        _get(Object.getPrototypeOf(Branch.prototype), "constructor", this).call(this);

        console.assert(displayName);

        this._displayName = displayName;
        this._revisions = revisions instanceof Array ? revisions.slice() : [];
        this._locked = locked || false;
    }

    // Public

    _createClass(Branch, [{
        key: "revisionForRepresentedObject",
        value: function revisionForRepresentedObject(representedObject, doNotCreateIfNeeded) {
            for (var i = 0; i < this._revisions.length; ++i) {
                var revision = this._revisions[i];
                if (revision instanceof WebInspector.SourceCodeRevision && revision.sourceCode === representedObject) return revision;
            }

            if (doNotCreateIfNeeded) return null;

            if (representedObject instanceof WebInspector.SourceCode) {
                var revision = representedObject.originalRevision.copy();
                representedObject.currentRevision = revision;
                this.addRevision(revision);
                return revision;
            }

            return null;
        }
    }, {
        key: "addRevision",
        value: function addRevision(revision) {
            console.assert(revision instanceof WebInspector.Revision);

            if (this._locked) return;

            if (this._revisions.includes(revision)) return;

            this._revisions.push(revision);
        }
    }, {
        key: "removeRevision",
        value: function removeRevision(revision) {
            console.assert(revision instanceof WebInspector.Revision);

            if (this._locked) return;

            this._revisions.remove(revision);
        }
    }, {
        key: "reset",
        value: function reset() {
            if (this._locked) return;

            this._revisions = [];
        }
    }, {
        key: "fork",
        value: function fork(displayName) {
            var copiedRevisions = this._revisions.map(function (revision) {
                return revision.copy();
            });
            return new WebInspector.Branch(displayName, copiedRevisions);
        }
    }, {
        key: "apply",
        value: function apply() {
            for (var i = 0; i < this._revisions.length; ++i) this._revisions[i].apply();
        }
    }, {
        key: "revert",
        value: function revert() {
            for (var i = this._revisions.length - 1; i >= 0; --i) this._revisions[i].revert();
        }
    }, {
        key: "lock",
        value: function lock() {
            console.assert(!this._locked);
            this._locked = true;
        }
    }, {
        key: "unlock",
        value: function unlock() {
            console.assert(this._locked);
            this._locked = false;
        }
    }, {
        key: "displayName",
        get: function get() {
            return this._displayName;
        },
        set: function set(displayName) {
            console.assert(displayName);
            if (!displayName) return;

            this._displayName = displayName;
        }
    }, {
        key: "revisions",
        get: function get() {
            return this._revisions;
        }
    }, {
        key: "locked",
        get: function get() {
            return this._locked;
        }
    }]);

    return Branch;
})(WebInspector.Object);
