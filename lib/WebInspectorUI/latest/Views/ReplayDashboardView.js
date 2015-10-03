var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2015 Apple Inc. All rights reserved.
 * Copyright (C) 2014 University of Washington. All rights reserved.
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

WebInspector.ReplayDashboardView = (function (_WebInspector$DashboardView) {
    _inherits(ReplayDashboardView, _WebInspector$DashboardView);

    function ReplayDashboardView(representedObject) {
        _classCallCheck(this, ReplayDashboardView);

        _get(Object.getPrototypeOf(ReplayDashboardView.prototype), "constructor", this).call(this, representedObject, "replay");

        this._navigationBar = new WebInspector.NavigationBar();
        this.element.appendChild(this._navigationBar.element);

        this._captureButtonItem = new WebInspector.ActivateButtonNavigationItem("replay-dashboard-capture", WebInspector.UIString("Start Recording"), WebInspector.UIString("Stop Recording"), "Images/ReplayRecordingButton.svg", 16, 16);
        this._captureButtonItem.addEventListener(WebInspector.ButtonNavigationItem.Event.Clicked, this._captureButtonItemClicked, this);
        this._captureButtonItem.hidden = true;
        this._navigationBar.addNavigationItem(this._captureButtonItem);

        this._replayButtonItem = new WebInspector.ToggleButtonNavigationItem("replay-dashboard-replay", WebInspector.UIString("Start Playback"), WebInspector.UIString("Pause Playback"), "Images/ReplayPlayButton.svg", "Images/ReplayPauseButton.svg", 16, 16);
        this._replayButtonItem.addEventListener(WebInspector.ButtonNavigationItem.Event.Clicked, this._replayButtonItemClicked, this);
        this._replayButtonItem.hidden = true;
        this._navigationBar.addNavigationItem(this._replayButtonItem);

        // Add events required to track capture and replay state.
        WebInspector.replayManager.addEventListener(WebInspector.ReplayManager.Event.CaptureStarted, this._captureStarted, this);
        WebInspector.replayManager.addEventListener(WebInspector.ReplayManager.Event.CaptureStopped, this._captureStopped, this);
        WebInspector.replayManager.addEventListener(WebInspector.ReplayManager.Event.PlaybackStarted, this._playbackStarted, this);
        WebInspector.replayManager.addEventListener(WebInspector.ReplayManager.Event.PlaybackPaused, this._playbackPaused, this);
        WebInspector.replayManager.addEventListener(WebInspector.ReplayManager.Event.PlaybackFinished, this._playbackFinished, this);

        // Manually initialize style classes by querying current replay state.
        if (WebInspector.replayManager.sessionState === WebInspector.ReplayManager.SessionState.Capturing) this._captureStarted();else if (WebInspector.replayManager.sessionState === WebInspector.ReplayManager.SessionState.Inactive) this._captureStopped();
        // ReplayManager.sessionState must be Replaying.
        else if (WebInspector.replayManager.segmentState === WebInspector.ReplayManager.SegmentState.Dispatching) this._playbackStarted();
            // ReplayManager.sessionState must be Unloaded or Loaded, so execution is paused.
            else this._playbackPaused();
    }

    // Private

    _createClass(ReplayDashboardView, [{
        key: "_captureButtonItemClicked",
        value: function _captureButtonItemClicked() {
            if (WebInspector.replayManager.sessionState !== WebInspector.ReplayManager.SessionState.Capturing) WebInspector.replayManager.startCapturing();else WebInspector.replayManager.stopCapturing();
        }
    }, {
        key: "_replayButtonItemClicked",
        value: function _replayButtonItemClicked(event) {
            console.assert(WebInspector.replayManager.sessionState !== WebInspector.ReplayManager.SessionState.Capturing, "Tried to start replaying while SessionState is Capturing!");

            if (WebInspector.replayManager.sessionState === WebInspector.ReplayManager.SessionState.Inactive) WebInspector.replayManager.replayToCompletion();else if (WebInspector.replayManager.segmentState === WebInspector.ReplayManager.SegmentState.Dispatching) WebInspector.replayManager.pausePlayback();else WebInspector.replayManager.replayToCompletion();
        }
    }, {
        key: "_captureStarted",
        value: function _captureStarted() {
            this._captureButtonItem.hidden = false;
            this._captureButtonItem.activated = true;
            this._replayButtonItem.hidden = true;
        }
    }, {
        key: "_captureStopped",
        value: function _captureStopped() {
            this._captureButtonItem.activated = false;
            this._captureButtonItem.hidden = true;
            this._replayButtonItem.hidden = false;
        }
    }, {
        key: "_playbackStarted",
        value: function _playbackStarted() {
            this._replayButtonItem.toggled = true;
        }
    }, {
        key: "_playbackPaused",
        value: function _playbackPaused() {
            this._replayButtonItem.toggled = false;
        }
    }, {
        key: "_playbackFinished",
        value: function _playbackFinished() {
            this._replayButtonItem.toggled = false;
        }
    }]);

    return ReplayDashboardView;
})(WebInspector.DashboardView);
