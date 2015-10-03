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

WebInspector.ApplicationCacheFrame = function (frame, manifest, status) {
    console.assert(frame instanceof WebInspector.Frame);
    console.assert(manifest instanceof WebInspector.ApplicationCacheManifest);

    WebInspector.Object.call(this);

    this._frame = frame;
    this._manifest = manifest;
    this._status = status;
};

WebInspector.ApplicationCacheFrame.TypeIdentifier = "application-cache-frame";
WebInspector.ApplicationCacheFrame.FrameURLCookieKey = "application-cache-frame-url";
WebInspector.ApplicationCacheFrame.ManifestURLCookieKey = "application-cache-frame-manifest-url";

WebInspector.ApplicationCacheFrame.prototype = Object.defineProperties({
    constructor: WebInspector.ApplicationCacheFrame,

    saveIdentityToCookie: function saveIdentityToCookie(cookie) {
        cookie[WebInspector.ApplicationCacheFrame.FrameURLCookieKey] = this.frame.url;
        cookie[WebInspector.ApplicationCacheFrame.ManifestURLCookieKey] = this.manifest.manifestURL;
    }
}, {
    frame: { // Public

        get: function get() {
            return this._frame;
        },
        configurable: true,
        enumerable: true
    },
    manifest: {
        get: function get() {
            return this._manifest;
        },
        configurable: true,
        enumerable: true
    },
    status: {
        get: function get() {
            return this._status;
        },
        set: function set(status) {
            this._status = status;
        },
        configurable: true,
        enumerable: true
    }
});

WebInspector.ApplicationCacheFrame.prototype.__proto__ = WebInspector.Object.prototype;
