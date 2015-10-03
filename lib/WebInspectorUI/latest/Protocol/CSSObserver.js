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

WebInspector.CSSObserver = (function () {
    function CSSObserver() {
        _classCallCheck(this, CSSObserver);
    }

    _createClass(CSSObserver, [{
        key: "mediaQueryResultChanged",

        // Events defined by the "CSS" domain.

        value: function mediaQueryResultChanged() {
            WebInspector.cssStyleManager.mediaQueryResultChanged();
        }
    }, {
        key: "styleSheetChanged",
        value: function styleSheetChanged(styleSheetId) {
            WebInspector.cssStyleManager.styleSheetChanged(styleSheetId);
        }
    }, {
        key: "styleSheetAdded",
        value: function styleSheetAdded(styleSheetInfo) {
            WebInspector.cssStyleManager.styleSheetAdded(styleSheetInfo);
        }
    }, {
        key: "styleSheetRemoved",
        value: function styleSheetRemoved(id) {
            WebInspector.cssStyleManager.styleSheetRemoved(id);
        }
    }, {
        key: "namedFlowCreated",
        value: function namedFlowCreated(namedFlow) {
            WebInspector.domTreeManager.namedFlowCreated(namedFlow);
        }
    }, {
        key: "namedFlowRemoved",
        value: function namedFlowRemoved(documentNodeId, flowName) {
            WebInspector.domTreeManager.namedFlowRemoved(documentNodeId, flowName);
        }

        // COMPATIBILITY (iOS 7): regionLayoutUpdated was removed and replaced by regionOversetChanged.
    }, {
        key: "regionLayoutUpdated",
        value: function regionLayoutUpdated(namedFlow) {
            this.regionOversetChanged(namedFlow);
        }
    }, {
        key: "regionOversetChanged",
        value: function regionOversetChanged(namedFlow) {
            WebInspector.domTreeManager.regionOversetChanged(namedFlow);
        }
    }, {
        key: "registeredNamedFlowContentElement",
        value: function registeredNamedFlowContentElement(documentNodeId, flowName, contentNodeId, nextContentElementNodeId) {
            WebInspector.domTreeManager.registeredNamedFlowContentElement(documentNodeId, flowName, contentNodeId, nextContentElementNodeId);
        }
    }, {
        key: "unregisteredNamedFlowContentElement",
        value: function unregisteredNamedFlowContentElement(documentNodeId, flowName, contentNodeId) {
            WebInspector.domTreeManager.unregisteredNamedFlowContentElement(documentNodeId, flowName, contentNodeId);
        }
    }]);

    return CSSObserver;
})();
