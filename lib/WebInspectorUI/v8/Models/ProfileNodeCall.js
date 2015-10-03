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

WebInspector.ProfileNodeCall = function (startTime, totalTime) {
    WebInspector.Object.call(this);

    console.assert(startTime);

    this._startTime = startTime;
    this._totalTime = totalTime || 0;
    this._parentNode = null;
    this._previousSibling = null;
    this._nextSibling = null;
};

WebInspector.ProfileNodeCall.prototype = Object.defineProperties({
    constructor: WebInspector.ProfileNodeCall,
    __proto__: WebInspector.Object.prototype,

    // Protected

    establishRelationships: function establishRelationships(parentNode, previousSibling, nextSibling) {
        this._parentNode = parentNode || null;
        this._previousSibling = previousSibling || null;
        this._nextSibling = nextSibling || null;
    }
}, {
    startTime: { // Public

        get: function get() {
            return this._startTime;
        },
        configurable: true,
        enumerable: true
    },
    totalTime: {
        get: function get() {
            return this._totalTime;
        },
        configurable: true,
        enumerable: true
    },
    endTime: {
        get: function get() {
            return this._startTime + this._totalTime;
        },
        configurable: true,
        enumerable: true
    }
});
