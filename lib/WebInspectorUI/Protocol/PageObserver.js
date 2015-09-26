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

WebInspector.PageObserver = (function () {
    function PageObserver() {
        _classCallCheck(this, PageObserver);
    }

    _createClass(PageObserver, [{
        key: "domContentEventFired",

        // Events defined by the "Page" domain.

        value: function domContentEventFired(timestamp) {
            // Covered by Timeline "MarkDOMContent" record.
        }
    }, {
        key: "loadEventFired",
        value: function loadEventFired(timestamp) {
            WebInspector.timelineManager.pageDidLoad(timestamp);
        }
    }, {
        key: "frameNavigated",
        value: function frameNavigated(frame, loaderId) {
            WebInspector.frameResourceManager.frameDidNavigate(frame, loaderId);
        }
    }, {
        key: "frameDetached",
        value: function frameDetached(frameId) {
            WebInspector.frameResourceManager.frameDidDetach(frameId);
        }
    }, {
        key: "frameStartedLoading",
        value: function frameStartedLoading(frameId) {
            // Not handled yet.
        }
    }, {
        key: "frameStoppedLoading",
        value: function frameStoppedLoading(frameId) {
            // Not handled yet.
        }
    }, {
        key: "frameScheduledNavigation",
        value: function frameScheduledNavigation(frameId, delay) {
            // Not handled yet.
        }
    }, {
        key: "frameClearedScheduledNavigation",
        value: function frameClearedScheduledNavigation(frameId) {
            // Not handled yet.
        }
    }, {
        key: "javascriptDialogOpening",
        value: function javascriptDialogOpening(message) {
            // Not handled yet.
        }
    }, {
        key: "javascriptDialogClosed",
        value: function javascriptDialogClosed() {
            // Not handled yet.
        }
    }, {
        key: "scriptsEnabled",
        value: function scriptsEnabled(enabled) {
            // Not handled yet.
        }
    }]);

    return PageObserver;
})();
