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

WebInspector.Branch = function (displayName, revisions, locked) {
    WebInspector.Object.call(this);

    console.assert(displayName);

    this._displayName = displayName;
    this._revisions = revisions instanceof Array ? revisions.slice() : [];
    this._locked = locked || false;
};

WebInspector.Branch.prototype = Object.defineProperties({
    constructor: WebInspector.Branch,

    revisionForRepresentedObject: function revisionForRepresentedObject(representedObject, doNotCreateIfNeeded) {
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
    },

    addRevision: function addRevision(revision) {
        console.assert(revision instanceof WebInspector.Revision);

        if (this._locked) return;

        if (this._revisions.contains(revision)) return;

        this._revisions.push(revision);
    },

    removeRevision: function removeRevision(revision) {
        console.assert(revision instanceof WebInspector.Revision);

        if (this._locked) return;

        this._revisions.remove(revision);
    },

    reset: function reset() {
        if (this._locked) return;

        this._revisions = [];
    },

    fork: function fork(displayName) {
        var copiedRevisions = this._revisions.map(function (revision) {
            return revision.copy();
        });
        return new WebInspector.Branch(displayName, copiedRevisions);
    },

    apply: function apply() {
        for (var i = 0; i < this._revisions.length; ++i) this._revisions[i].apply();
    },

    revert: function revert() {
        for (var i = this._revisions.length - 1; i >= 0; --i) this._revisions[i].revert();
    },

    lock: function lock() {
        console.assert(!this._locked);
        this._locked = true;
    },

    unlock: function unlock() {
        console.assert(this._locked);
        this._locked = false;
    }
}, {
    displayName: { // Public

        get: function get() {
            return this._displayName;
        },
        set: function set(displayName) {
            console.assert(displayName);
            if (!displayName) return;

            this._displayName = displayName;
        },
        configurable: true,
        enumerable: true
    },
    revisions: {
        get: function get() {
            return this._revisions;
        },
        configurable: true,
        enumerable: true
    },
    locked: {
        get: function get() {
            return this._locked;
        },
        configurable: true,
        enumerable: true
    }
});

WebInspector.Branch.prototype.__proto__ = WebInspector.Object.prototype;
