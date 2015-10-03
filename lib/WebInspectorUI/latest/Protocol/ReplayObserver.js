var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * Copyright (C) 2013 University of Washington. All rights reserved.
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

// FIXME: This ReplayPosition class shouldn't be here, no matter how simple it is.
WebInspector.ReplayPosition = function ReplayPosition(segmentOffset, inputOffset) {
    _classCallCheck(this, ReplayPosition);

    this.segmentOffset = segmentOffset;
    this.inputOffset = inputOffset;
};

WebInspector.ReplayObserver = (function () {
    function ReplayObserver() {
        _classCallCheck(this, ReplayObserver);
    }

    _createClass(ReplayObserver, [{
        key: "captureStarted",

        // Events defined by the "Replay" domain.

        value: function captureStarted() {
            WebInspector.replayManager.captureStarted();
        }
    }, {
        key: "captureStopped",
        value: function captureStopped() {
            WebInspector.replayManager.captureStopped();
        }
    }, {
        key: "playbackStarted",
        value: function playbackStarted() {
            WebInspector.replayManager.playbackStarted();
        }
    }, {
        key: "playbackHitPosition",
        value: function playbackHitPosition(replayPosition, timestamp) {
            WebInspector.replayManager.playbackHitPosition(new WebInspector.ReplayPosition(replayPosition.segmentOffset, replayPosition.inputOffset), timestamp);
        }
    }, {
        key: "playbackPaused",
        value: function playbackPaused(replayPosition) {
            WebInspector.replayManager.playbackPaused(new WebInspector.ReplayPosition(replayPosition.segmentOffset, replayPosition.inputOffset));
        }
    }, {
        key: "playbackFinished",
        value: function playbackFinished() {
            WebInspector.replayManager.playbackFinished();
        }
    }, {
        key: "inputSuppressionChanged",
        value: function inputSuppressionChanged(willSuppress) {
            // Not handled yet.
        }
    }, {
        key: "sessionCreated",
        value: function sessionCreated(sessionId) {
            WebInspector.replayManager.sessionCreated(sessionId);
        }
    }, {
        key: "sessionModified",
        value: function sessionModified(sessionId) {
            WebInspector.replayManager.sessionModified(sessionId);
        }
    }, {
        key: "sessionRemoved",
        value: function sessionRemoved(sessionId) {
            WebInspector.replayManager.sessionRemoved(sessionId);
        }
    }, {
        key: "sessionLoaded",
        value: function sessionLoaded(sessionId) {
            WebInspector.replayManager.sessionLoaded(sessionId);
        }
    }, {
        key: "segmentCreated",
        value: function segmentCreated(segmentId) {
            WebInspector.replayManager.segmentCreated(segmentId);
        }
    }, {
        key: "segmentRemoved",
        value: function segmentRemoved(segmentId) {
            WebInspector.replayManager.segmentRemoved(segmentId);
        }
    }, {
        key: "segmentCompleted",
        value: function segmentCompleted(segmentId) {
            WebInspector.replayManager.segmentCompleted(segmentId);
        }
    }, {
        key: "segmentLoaded",
        value: function segmentLoaded(segmentId) {
            WebInspector.replayManager.segmentLoaded(segmentId);
        }
    }, {
        key: "segmentUnloaded",
        value: function segmentUnloaded() {
            WebInspector.replayManager.segmentUnloaded();
        }
    }]);

    return ReplayObserver;
})();
