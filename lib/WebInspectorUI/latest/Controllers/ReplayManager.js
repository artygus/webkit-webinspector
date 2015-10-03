var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

WebInspector.ReplayManager = (function (_WebInspector$Object) {
    _inherits(ReplayManager, _WebInspector$Object);

    function ReplayManager() {
        _classCallCheck(this, ReplayManager);

        _get(Object.getPrototypeOf(ReplayManager.prototype), "constructor", this).call(this);

        this._sessionState = WebInspector.ReplayManager.SessionState.Inactive;
        this._segmentState = WebInspector.ReplayManager.SegmentState.Unloaded;

        this._activeSessionIdentifier = null;
        this._activeSegmentIdentifier = null;
        this._currentPosition = new WebInspector.ReplayPosition(0, 0);
        this._initialized = false;

        // These hold actual instances of sessions and segments.
        this._sessions = new Map();
        this._segments = new Map();
        // These hold promises that resolve when the instance data is recieved.
        this._sessionPromises = new Map();
        this._segmentPromises = new Map();

        // Playback speed is specified in replayToPosition commands, and persists
        // for the duration of the playback command until another playback begins.
        this._playbackSpeed = WebInspector.ReplayManager.PlaybackSpeed.RealTime;

        if (window.ReplayAgent) {
            var instance = this;
            this._initializationPromise = ReplayAgent.currentReplayState().then(function (payload) {
                console.assert(payload.sessionState in WebInspector.ReplayManager.SessionState, "Unknown session state: " + payload.sessionState);
                console.assert(payload.segmentState in WebInspector.ReplayManager.SegmentState, "Unknown segment state: " + payload.segmentState);

                instance._activeSessionIdentifier = payload.sessionIdentifier;
                instance._activeSegmentIdentifier = payload.segmentIdentifier;
                instance._sessionState = WebInspector.ReplayManager.SessionState[payload.sessionState];
                instance._segmentState = WebInspector.ReplayManager.SegmentState[payload.segmentState];
                instance._currentPosition = payload.replayPosition;

                instance._initialized = true;
            }).then(function () {
                return ReplayAgent.getAvailableSessions();
            }).then(function (payload) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = payload.ids[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var sessionId = _step.value;

                        instance.sessionCreated(sessionId);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator["return"]) {
                            _iterator["return"]();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            })["catch"](function (error) {
                console.error("ReplayManager initialization failed: ", error);
                throw error;
            });
        }
    }

    // Public

    // The following state is invalid unless called from a function that's chained
    // to the (resolved) ReplayManager.waitUntilInitialized promise.

    _createClass(ReplayManager, [{
        key: "waitUntilInitialized",

        // These return promises even if the relevant instance is already created.
        value: function waitUntilInitialized() // --> ()
        {
            return this._initializationPromise;
        }

        // Return a promise that resolves to a session, if it exists.
    }, {
        key: "getSession",
        value: function getSession(sessionId) // --> (WebInspector.ReplaySession)
        {
            if (this._sessionPromises.has(sessionId)) return this._sessionPromises.get(sessionId);

            var newPromise = ReplayAgent.getSessionData(sessionId).then(function (payload) {
                return Promise.resolve(WebInspector.ReplaySession.fromPayload(sessionId, payload));
            });

            this._sessionPromises.set(sessionId, newPromise);
            return newPromise;
        }

        // Return a promise that resolves to a session segment, if it exists.
    }, {
        key: "getSegment",
        value: function getSegment(segmentId) // --> (WebInspector.ReplaySessionSegment)
        {
            if (this._segmentPromises.has(segmentId)) return this._segmentPromises.get(segmentId);

            var newPromise = ReplayAgent.getSegmentData(segmentId).then(function (payload) {
                return Promise.resolve(new WebInspector.ReplaySessionSegment(segmentId, payload));
            });

            this._segmentPromises.set(segmentId, newPromise);
            return newPromise;
        }

        // Switch to the specified session.
        // Returns a promise that resolves when the switch completes.
    }, {
        key: "switchSession",
        value: function switchSession(sessionId) // --> ()
        {
            var manager = this;
            var result = this.waitUntilInitialized();

            if (this.sessionState === WebInspector.ReplayManager.SessionState.Capturing) {
                result = result.then(function () {
                    return WebInspector.replayManager.stopCapturing();
                });
            }

            if (this.sessionState === WebInspector.ReplayManager.SessionState.Replaying) {
                result = result.then(function () {
                    return WebInspector.replayManager.cancelPlayback();
                });
            }

            result = result.then(function () {
                console.assert(manager.sessionState === WebInspector.ReplayManager.SessionState.Inactive);
                console.assert(manager.segmentState === WebInspector.ReplayManager.SegmentState.Unloaded);

                return manager.getSession(sessionId);
            }).then(function ensureSessionDataIsLoaded(session) {
                return ReplayAgent.switchSession(session.identifier);
            })["catch"](function (error) {
                console.error("Failed to switch to session: ", error);
                throw error;
            });

            return result;
        }

        // Start capturing into the current session as soon as possible.
        // Returns a promise that resolves when capturing begins.
    }, {
        key: "startCapturing",
        value: function startCapturing() // --> ()
        {
            var manager = this;
            var result = this.waitUntilInitialized();

            if (this.sessionState === WebInspector.ReplayManager.SessionState.Capturing) return result; // Already capturing.

            if (this.sessionState === WebInspector.ReplayManager.SessionState.Replaying) {
                result = result.then(function () {
                    return WebInspector.replayManager.cancelPlayback();
                });
            }

            result = result.then(this._suppressBreakpointsAndResumeIfNeeded());

            result = result.then(function () {
                console.assert(manager.sessionState === WebInspector.ReplayManager.SessionState.Inactive);
                console.assert(manager.segmentState === WebInspector.ReplayManager.SegmentState.Unloaded);

                return ReplayAgent.startCapturing();
            })["catch"](function (error) {
                console.error("Failed to start capturing: ", error);
                throw error;
            });

            return result;
        }

        // Stop capturing into the current session as soon as possible.
        // Returns a promise that resolves when capturing ends.
    }, {
        key: "stopCapturing",
        value: function stopCapturing() // --> ()
        {
            console.assert(this.sessionState === WebInspector.ReplayManager.SessionState.Capturing, "Cannot stop capturing unless capture is active.");
            console.assert(this.segmentState === WebInspector.ReplayManager.SegmentState.Appending);

            return ReplayAgent.stopCapturing()["catch"](function (error) {
                console.error("Failed to stop capturing: ", error);
                throw error;
            });
        }

        // Pause playback as soon as possible.
        // Returns a promise that resolves when playback is paused.
    }, {
        key: "pausePlayback",
        value: function pausePlayback() // --> ()
        {
            console.assert(this.sessionState !== WebInspector.ReplayManager.SessionState.Capturing, "Cannot pause playback while capturing.");

            var manager = this;
            var result = this.waitUntilInitialized();

            if (this.sessionState === WebInspector.ReplayManager.SessionState.Inactive) return result; // Already stopped.

            if (this.segmentState !== WebInspector.ReplayManager.SegmentState.Dispatching) return result; // Already stopped.

            result = result.then(function () {
                console.assert(manager.sessionState === WebInspector.ReplayManager.SessionState.Replaying);
                console.assert(manager.segmentState === WebInspector.ReplayManager.SegmentState.Dispatching);

                return ReplayAgent.pausePlayback();
            })["catch"](function (error) {
                console.error("Failed to pause playback: ", error);
                throw error;
            });

            return result;
        }

        // Pause playback and unload the current session segment as soon as possible.
        // Returns a promise that resolves when the current segment is unloaded.
    }, {
        key: "cancelPlayback",
        value: function cancelPlayback() // --> ()
        {
            console.assert(this.sessionState !== WebInspector.ReplayManager.SessionState.Capturing, "Cannot stop playback while capturing.");

            var manager = this;
            var result = this.waitUntilInitialized();

            if (this.sessionState === WebInspector.ReplayManager.SessionState.Inactive) return result; // Already stopped.

            result = result.then(function () {
                console.assert(manager.sessionState === WebInspector.ReplayManager.SessionState.Replaying);
                console.assert(manager.segmentState !== WebInspector.ReplayManager.SegmentState.Appending);

                return ReplayAgent.cancelPlayback();
            })["catch"](function (error) {
                console.error("Failed to stop playback: ", error);
                throw error;
            });

            return result;
        }

        // Replay to the specified position as soon as possible using the current replay speed.
        // Returns a promise that resolves when replay has begun (NOT when the position is reached).
    }, {
        key: "replayToPosition",
        value: function replayToPosition(replayPosition) // --> ()
        {
            console.assert(replayPosition instanceof WebInspector.ReplayPosition, "Cannot replay to a position while capturing.");

            var manager = this;
            var result = this.waitUntilInitialized();

            if (this.sessionState === WebInspector.ReplayManager.SessionState.Capturing) {
                result = result.then(function () {
                    return WebInspector.replayManager.stopCapturing();
                });
            }

            result = result.then(this._suppressBreakpointsAndResumeIfNeeded());

            result = result.then(function () {
                console.assert(manager.sessionState !== WebInspector.ReplayManager.SessionState.Capturing);
                console.assert(manager.segmentState !== WebInspector.ReplayManager.SegmentState.Appending);

                return ReplayAgent.replayToPosition(replayPosition, manager.playbackSpeed === WebInspector.ReplayManager.PlaybackSpeed.FastForward);
            })["catch"](function (error) {
                console.error("Failed to start playback to position: ", replayPosition, error);
                throw error;
            });

            return result;
        }

        // Replay to the end of the session as soon as possible using the current replay speed.
        // Returns a promise that resolves when replay has begun (NOT when the end is reached).
    }, {
        key: "replayToCompletion",
        value: function replayToCompletion() // --> ()
        {
            var manager = this;
            var result = this.waitUntilInitialized();

            if (this.segmentState === WebInspector.ReplayManager.SegmentState.Dispatching) return result; // Already running.

            if (this.sessionState === WebInspector.ReplayManager.SessionState.Capturing) {
                result = result.then(function () {
                    return WebInspector.replayManager.stopCapturing();
                });
            }

            result = result.then(this._suppressBreakpointsAndResumeIfNeeded());

            result = result.then(function () {
                console.assert(manager.sessionState !== WebInspector.ReplayManager.SessionState.Capturing);
                console.assert(manager.segmentState === WebInspector.ReplayManager.SegmentState.Loaded || manager.segmentState === WebInspector.ReplayManager.SegmentState.Unloaded);

                return ReplayAgent.replayToCompletion(manager.playbackSpeed === WebInspector.ReplayManager.PlaybackSpeed.FastForward);
            })["catch"](function (error) {
                console.error("Failed to start playback to completion: ", error);
                throw error;
            });

            return result;
        }

        // Protected (called by ReplayObserver)

        // Since these methods update session and segment state, they depend on the manager
        // being properly initialized. So, each function body is prepended with a retry guard.
        // This makes call sites simpler and avoids an extra event loop turn in the common case.

    }, {
        key: "captureStarted",
        value: function captureStarted() {
            if (!this._initialized) return this.waitUntilInitialized().then(this.captureStarted.bind(this));

            this._changeSessionState(WebInspector.ReplayManager.SessionState.Capturing);

            this.dispatchEventToListeners(WebInspector.ReplayManager.Event.CaptureStarted);
        }
    }, {
        key: "captureStopped",
        value: function captureStopped() {
            if (!this._initialized) return this.waitUntilInitialized().then(this.captureStopped.bind(this));

            this._changeSessionState(WebInspector.ReplayManager.SessionState.Inactive);
            this._changeSegmentState(WebInspector.ReplayManager.SegmentState.Unloaded);

            if (this._breakpointsWereSuppressed) {
                delete this._breakpointsWereSuppressed;
                WebInspector.debuggerManager.breakpointsEnabled = true;
            }

            this.dispatchEventToListeners(WebInspector.ReplayManager.Event.CaptureStopped);
        }
    }, {
        key: "playbackStarted",
        value: function playbackStarted() {
            if (!this._initialized) return this.waitUntilInitialized().then(this.playbackStarted.bind(this));

            if (this.sessionState === WebInspector.ReplayManager.SessionState.Inactive) this._changeSessionState(WebInspector.ReplayManager.SessionState.Replaying);

            this._changeSegmentState(WebInspector.ReplayManager.SegmentState.Dispatching);

            this.dispatchEventToListeners(WebInspector.ReplayManager.Event.PlaybackStarted);
        }
    }, {
        key: "playbackHitPosition",
        value: function playbackHitPosition(replayPosition, timestamp) {
            if (!this._initialized) return this.waitUntilInitialized().then(this.playbackHitPosition.bind(this, replayPosition, timestamp));

            console.assert(this.sessionState === WebInspector.ReplayManager.SessionState.Replaying);
            console.assert(this.segmentState === WebInspector.ReplayManager.SegmentState.Dispatching);
            console.assert(replayPosition instanceof WebInspector.ReplayPosition);

            this._currentPosition = replayPosition;
            this.dispatchEventToListeners(WebInspector.ReplayManager.Event.PlaybackPositionChanged);
        }
    }, {
        key: "playbackPaused",
        value: function playbackPaused(position) {
            if (!this._initialized) return this.waitUntilInitialized().then(this.playbackPaused.bind(this, position));

            console.assert(this.sessionState === WebInspector.ReplayManager.SessionState.Replaying);
            this._changeSegmentState(WebInspector.ReplayManager.SegmentState.Loaded);

            if (this._breakpointsWereSuppressed) {
                delete this._breakpointsWereSuppressed;
                WebInspector.debuggerManager.breakpointsEnabled = true;
            }

            this.dispatchEventToListeners(WebInspector.ReplayManager.Event.PlaybackPaused);
        }
    }, {
        key: "playbackFinished",
        value: function playbackFinished() {
            if (!this._initialized) return this.waitUntilInitialized().then(this.playbackFinished.bind(this));

            this._changeSessionState(WebInspector.ReplayManager.SessionState.Inactive);
            console.assert(this.segmentState === WebInspector.ReplayManager.SegmentState.Unloaded);

            if (this._breakpointsWereSuppressed) {
                delete this._breakpointsWereSuppressed;
                WebInspector.debuggerManager.breakpointsEnabled = true;
            }

            this.dispatchEventToListeners(WebInspector.ReplayManager.Event.PlaybackFinished);
        }
    }, {
        key: "sessionCreated",
        value: function sessionCreated(sessionId) {
            if (!this._initialized) return this.waitUntilInitialized().then(this.sessionCreated.bind(this, sessionId));

            console.assert(!this._sessions.has(sessionId), "Tried to add duplicate session identifier:", sessionId);
            var sessionMap = this._sessions;
            this.getSession(sessionId).then(function (session) {
                sessionMap.set(sessionId, session);
            })["catch"](function (error) {
                console.error("Error obtaining session data: ", error);
                throw error;
            });

            this.dispatchEventToListeners(WebInspector.ReplayManager.Event.SessionAdded, { sessionId: sessionId });
        }
    }, {
        key: "sessionModified",
        value: function sessionModified(sessionId) {
            if (!this._initialized) return this.waitUntilInitialized().then(this.sessionModified.bind(this, sessionId));

            this.getSession(sessionId).then(function (session) {
                session.segmentsChanged();
            });
        }
    }, {
        key: "sessionRemoved",
        value: function sessionRemoved(sessionId) {
            if (!this._initialized) return this.waitUntilInitialized().then(this.sessionRemoved.bind(this, sessionId));

            console.assert(this._sessions.has(sessionId), "Unknown session identifier:", sessionId);

            if (!this._sessionPromises.has(sessionId)) return;

            var manager = this;

            this.getSession(sessionId)["catch"](function (error) {
                // Wait for any outstanding promise to settle so it doesn't get re-added.
            }).then(function () {
                manager._sessionPromises["delete"](sessionId);
                var removedSession = manager._sessions.take(sessionId);
                console.assert(removedSession);
                manager.dispatchEventToListeners(WebInspector.ReplayManager.Event.SessionRemoved, { removedSession: removedSession });
            });
        }
    }, {
        key: "segmentCreated",
        value: function segmentCreated(segmentId) {
            if (!this._initialized) return this.waitUntilInitialized().then(this.segmentCreated.bind(this, segmentId));

            console.assert(!this._segments.has(segmentId), "Tried to add duplicate segment identifier:", segmentId);

            this._changeSegmentState(WebInspector.ReplayManager.SegmentState.Appending);

            // Create a dummy segment, and don't try to load any data for it. It will
            // be removed once the segment is complete, and then its data will be fetched.
            var incompleteSegment = new WebInspector.IncompleteSessionSegment(segmentId);
            this._segments.set(segmentId, incompleteSegment);
            this._segmentPromises.set(segmentId, Promise.resolve(incompleteSegment));

            this.dispatchEventToListeners(WebInspector.ReplayManager.Event.SessionSegmentAdded, { segmentIdentifier: segmentId });
        }
    }, {
        key: "segmentCompleted",
        value: function segmentCompleted(segmentId) {
            if (!this._initialized) return this.waitUntilInitialized().then(this.segmentCompleted.bind(this, segmentId));

            var placeholderSegment = this._segments.take(segmentId);
            console.assert(placeholderSegment instanceof WebInspector.IncompleteSessionSegment);
            this._segmentPromises["delete"](segmentId);

            var segmentMap = this._segments;
            this.getSegment(segmentId).then(function (segment) {
                segmentMap.set(segmentId, segment);
            })["catch"](function (error) {
                console.error("Error obtaining segment data: ", error);
                throw error;
            });
        }
    }, {
        key: "segmentRemoved",
        value: function segmentRemoved(segmentId) {
            if (!this._initialized) return this.waitUntilInitialized().then(this.segmentRemoved.bind(this, segmentId));

            console.assert(this._segments.has(segmentId), "Unknown segment identifier:", segmentId);

            if (!this._segmentPromises.has(segmentId)) return;

            var manager = this;

            // Wait for any outstanding promise to settle so it doesn't get re-added.
            this.getSegment(segmentId)["catch"](function (error) {
                return Promise.resolve();
            }).then(function () {
                manager._segmentPromises["delete"](segmentId);
                var removedSegment = manager._segments.take(segmentId);
                console.assert(removedSegment);
                manager.dispatchEventToListeners(WebInspector.ReplayManager.Event.SessionSegmentRemoved, { removedSegment: removedSegment });
            });
        }
    }, {
        key: "segmentLoaded",
        value: function segmentLoaded(segmentId) {
            if (!this._initialized) return this.waitUntilInitialized().then(this.segmentLoaded.bind(this, segmentId));

            console.assert(this._segments.has(segmentId), "Unknown segment identifier:", segmentId);

            console.assert(this.sessionState !== WebInspector.ReplayManager.SessionState.Capturing);
            this._changeSegmentState(WebInspector.ReplayManager.SegmentState.Loaded);

            var previousIdentifier = this._activeSegmentIdentifier;
            this._activeSegmentIdentifier = segmentId;
            this.dispatchEventToListeners(WebInspector.ReplayManager.Event.ActiveSegmentChanged, { previousSegmentIdentifier: previousIdentifier });
        }
    }, {
        key: "segmentUnloaded",
        value: function segmentUnloaded() {
            if (!this._initialized) return this.waitUntilInitialized().then(this.segmentUnloaded.bind(this));

            console.assert(this.sessionState === WebInspector.ReplayManager.SessionState.Replaying);
            this._changeSegmentState(WebInspector.ReplayManager.SegmentState.Unloaded);

            var previousIdentifier = this._activeSegmentIdentifier;
            this._activeSegmentIdentifier = null;
            this.dispatchEventToListeners(WebInspector.ReplayManager.Event.ActiveSegmentChanged, { previousSegmentIdentifier: previousIdentifier });
        }

        // Private

    }, {
        key: "_changeSessionState",
        value: function _changeSessionState(newState) {
            // Warn about no-op state changes. We shouldn't be seeing them.
            var isAllowed = this._sessionState !== newState;

            switch (this._sessionState) {
                case WebInspector.ReplayManager.SessionState.Capturing:
                    isAllowed &= newState === WebInspector.ReplayManager.SessionState.Inactive;
                    break;

                case WebInspector.ReplayManager.SessionState.Replaying:
                    isAllowed &= newState === WebInspector.ReplayManager.SessionState.Inactive;
                    break;
            }

            console.assert(isAllowed, "Invalid session state change: ", this._sessionState, " to ", newState);
            if (isAllowed) this._sessionState = newState;
        }
    }, {
        key: "_changeSegmentState",
        value: function _changeSegmentState(newState) {
            // Warn about no-op state changes. We shouldn't be seeing them.
            var isAllowed = this._segmentState !== newState;

            switch (this._segmentState) {
                case WebInspector.ReplayManager.SegmentState.Appending:
                    isAllowed &= newState === WebInspector.ReplayManager.SegmentState.Unloaded;
                    break;
                case WebInspector.ReplayManager.SegmentState.Unloaded:
                    isAllowed &= newState === WebInspector.ReplayManager.SegmentState.Appending || newState === WebInspector.ReplayManager.SegmentState.Loaded;
                    break;
                case WebInspector.ReplayManager.SegmentState.Loaded:
                    isAllowed &= newState === WebInspector.ReplayManager.SegmentState.Unloaded || newState === WebInspector.ReplayManager.SegmentState.Dispatching;
                    break;
                case WebInspector.ReplayManager.SegmentState.Dispatching:
                    isAllowed &= newState === WebInspector.ReplayManager.SegmentState.Loaded;
                    break;
            }

            console.assert(isAllowed, "Invalid segment state change: ", this._segmentState, " to ", newState);
            if (isAllowed) this._segmentState = newState;
        }
    }, {
        key: "_suppressBreakpointsAndResumeIfNeeded",
        value: function _suppressBreakpointsAndResumeIfNeeded() {
            var manager = this;

            return new Promise(function (resolve, reject) {
                manager._breakpointsWereSuppressed = WebInspector.debuggerManager.breakpointsEnabled;
                WebInspector.debuggerManager.breakpointsEnabled = false;

                return WebInspector.debuggerManager.resume();
            });
        }
    }, {
        key: "sessionState",
        get: function get() {
            console.assert(this._initialized);
            return this._sessionState;
        }
    }, {
        key: "segmentState",
        get: function get() {
            console.assert(this._initialized);
            return this._segmentState;
        }
    }, {
        key: "activeSessionIdentifier",
        get: function get() {
            console.assert(this._initialized);
            return this._activeSessionIdentifier;
        }
    }, {
        key: "activeSegmentIdentifier",
        get: function get() {
            console.assert(this._initialized);
            return this._activeSegmentIdentifier;
        }
    }, {
        key: "playbackSpeed",
        get: function get() {
            console.assert(this._initialized);
            return this._playbackSpeed;
        },
        set: function set(value) {
            console.assert(this._initialized);
            this._playbackSpeed = value;
        }
    }, {
        key: "currentPosition",
        get: function get() {
            console.assert(this._initialized);
            return this._currentPosition;
        }
    }]);

    return ReplayManager;
})(WebInspector.Object);

WebInspector.ReplayManager.Event = {
    CaptureStarted: "replay-manager-capture-started",
    CaptureStopped: "replay-manager-capture-stopped",

    PlaybackStarted: "replay-manager-playback-started",
    PlaybackPaused: "replay-manager-playback-paused",
    PlaybackFinished: "replay-manager-playback-finished",
    PlaybackPositionChanged: "replay-manager-play-back-position-changed",

    ActiveSessionChanged: "replay-manager-active-session-changed",
    ActiveSegmentChanged: "replay-manager-active-segment-changed",

    SessionSegmentAdded: "replay-manager-session-segment-added",
    SessionSegmentRemoved: "replay-manager-session-segment-removed",

    SessionAdded: "replay-manager-session-added",
    SessionRemoved: "replay-manager-session-removed"
};

WebInspector.ReplayManager.SessionState = {
    Capturing: "replay-manager-session-state-capturing",
    Inactive: "replay-manager-session-state-inactive",
    Replaying: "replay-manager-session-state-replaying"
};

WebInspector.ReplayManager.SegmentState = {
    Appending: "replay-manager-segment-state-appending",
    Unloaded: "replay-manager-segment-state-unloaded",
    Loaded: "replay-manager-segment-state-loaded",
    Dispatching: "replay-manager-segment-state-dispatching"
};

WebInspector.ReplayManager.PlaybackSpeed = {
    RealTime: "replay-manager-playback-speed-real-time",
    FastForward: "replay-manager-playback-speed-fast-forward"
};
