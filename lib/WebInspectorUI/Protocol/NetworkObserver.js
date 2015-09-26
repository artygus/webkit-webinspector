var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * Copyright (C) 2013, 2015 Apple Inc. All rights reserved.
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

WebInspector.NetworkObserver = (function () {
    function NetworkObserver() {
        _classCallCheck(this, NetworkObserver);
    }

    _createClass(NetworkObserver, [{
        key: "requestWillBeSent",

        // Events defined by the "Network" domain.

        value: function requestWillBeSent(requestId, frameId, loaderId, documentURL, request, timestamp, initiator, redirectResponse, type) {
            WebInspector.frameResourceManager.resourceRequestWillBeSent(requestId, frameId, loaderId, request, type, redirectResponse, timestamp, initiator);
        }
    }, {
        key: "requestServedFromCache",
        value: function requestServedFromCache(requestId) {
            WebInspector.frameResourceManager.markResourceRequestAsServedFromMemoryCache(requestId);
        }
    }, {
        key: "responseReceived",
        value: function responseReceived(requestId, frameId, loaderId, timestamp, type, response) {
            WebInspector.frameResourceManager.resourceRequestDidReceiveResponse(requestId, frameId, loaderId, type, response, timestamp);
        }
    }, {
        key: "dataReceived",
        value: function dataReceived(requestId, timestamp, dataLength, encodedDataLength) {
            WebInspector.frameResourceManager.resourceRequestDidReceiveData(requestId, dataLength, encodedDataLength, timestamp);
        }
    }, {
        key: "loadingFinished",
        value: function loadingFinished(requestId, timestamp, sourceMapURL) {
            WebInspector.frameResourceManager.resourceRequestDidFinishLoading(requestId, timestamp, sourceMapURL);
        }
    }, {
        key: "loadingFailed",
        value: function loadingFailed(requestId, timestamp, errorText, canceled) {
            WebInspector.frameResourceManager.resourceRequestDidFailLoading(requestId, canceled, timestamp);
        }
    }, {
        key: "requestServedFromMemoryCache",
        value: function requestServedFromMemoryCache(requestId, frameId, loaderId, documentURL, timestamp, initiator, resource) {
            WebInspector.frameResourceManager.resourceRequestWasServedFromMemoryCache(requestId, frameId, loaderId, resource, timestamp, initiator);
        }
    }, {
        key: "webSocketWillSendHandshakeRequest",
        value: function webSocketWillSendHandshakeRequest(requestId, timestamp, request) {
            // FIXME: Not implemented.
        }
    }, {
        key: "webSocketHandshakeResponseReceived",
        value: function webSocketHandshakeResponseReceived(requestId, timestamp, response) {
            // FIXME: Not implemented.
        }
    }, {
        key: "webSocketCreated",
        value: function webSocketCreated(requestId, url) {
            // FIXME: Not implemented.
        }
    }, {
        key: "webSocketClosed",
        value: function webSocketClosed(requestId, timestamp) {
            // FIXME: Not implemented.
        }
    }, {
        key: "webSocketFrameReceived",
        value: function webSocketFrameReceived(requestId, timestamp, response) {
            // FIXME: Not implemented.
        }
    }, {
        key: "webSocketFrameError",
        value: function webSocketFrameError(requestId, timestamp, errorMessage) {
            // FIXME: Not implemented.
        }
    }, {
        key: "webSocketFrameSent",
        value: function webSocketFrameSent(requestId, timestamp, response) {
            // FIXME: Not implemented.
        }
    }]);

    return NetworkObserver;
})();
