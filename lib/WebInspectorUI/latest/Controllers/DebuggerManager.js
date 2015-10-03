var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2013, 2014 Apple Inc. All rights reserved.
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

WebInspector.DebuggerManager = (function (_WebInspector$Object) {
    _inherits(DebuggerManager, _WebInspector$Object);

    function DebuggerManager() {
        _classCallCheck(this, DebuggerManager);

        _get(Object.getPrototypeOf(DebuggerManager.prototype), "constructor", this).call(this);

        if (window.DebuggerAgent) DebuggerAgent.enable();

        WebInspector.Breakpoint.addEventListener(WebInspector.Breakpoint.Event.DisplayLocationDidChange, this._breakpointDisplayLocationDidChange, this);
        WebInspector.Breakpoint.addEventListener(WebInspector.Breakpoint.Event.DisabledStateDidChange, this._breakpointDisabledStateDidChange, this);
        WebInspector.Breakpoint.addEventListener(WebInspector.Breakpoint.Event.ConditionDidChange, this._breakpointEditablePropertyDidChange, this);
        WebInspector.Breakpoint.addEventListener(WebInspector.Breakpoint.Event.AutoContinueDidChange, this._breakpointEditablePropertyDidChange, this);
        WebInspector.Breakpoint.addEventListener(WebInspector.Breakpoint.Event.ActionsDidChange, this._breakpointEditablePropertyDidChange, this);

        WebInspector.Frame.addEventListener(WebInspector.Frame.Event.MainResourceDidChange, this._mainResourceDidChange, this);

        window.addEventListener("pagehide", this._inspectorClosing.bind(this));

        this._allExceptionsBreakpointEnabledSetting = new WebInspector.Setting("break-on-all-exceptions", false);
        this._allUncaughtExceptionsBreakpointEnabledSetting = new WebInspector.Setting("break-on-all-uncaught-exceptions", false);

        var specialBreakpointLocation = new WebInspector.SourceCodeLocation(null, Infinity, Infinity);

        this._allExceptionsBreakpoint = new WebInspector.Breakpoint(specialBreakpointLocation, !this._allExceptionsBreakpointEnabledSetting.value);
        this._allExceptionsBreakpoint.resolved = true;

        this._allUncaughtExceptionsBreakpoint = new WebInspector.Breakpoint(specialBreakpointLocation, !this._allUncaughtExceptionsBreakpointEnabledSetting.value);

        this._breakpoints = [];
        this._breakpointURLMap = {};
        this._breakpointScriptIdentifierMap = {};
        this._breakpointIdMap = {};

        this._nextBreakpointActionIdentifier = 1;

        this._paused = false;
        this._pauseReason = null;
        this._pauseData = null;

        this._scriptIdMap = {};
        this._scriptURLMap = {};

        this._breakpointsSetting = new WebInspector.Setting("breakpoints", []);
        this._breakpointsEnabledSetting = new WebInspector.Setting("breakpoints-enabled", true);

        if (window.DebuggerAgent) DebuggerAgent.setBreakpointsActive(this._breakpointsEnabledSetting.value);

        this._updateBreakOnExceptionsState();

        function restoreBreakpointsSoon() {
            this._restoringBreakpoints = true;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._breakpointsSetting.value[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var cookie = _step.value;

                    this.addBreakpoint(new WebInspector.Breakpoint(cookie));
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

            this._restoringBreakpoints = false;
        }

        // Ensure that all managers learn about restored breakpoints,
        // regardless of their initialization order.
        setTimeout(restoreBreakpointsSoon.bind(this), 0);
    }

    // Public

    _createClass(DebuggerManager, [{
        key: "pause",
        value: function pause() {
            if (this._paused) return Promise.resolve();

            this.dispatchEventToListeners(WebInspector.DebuggerManager.Event.WaitingToPause);

            var listener = new WebInspector.EventListener(this, true);

            var managerResult = new Promise(function (resolve, reject) {
                listener.connect(WebInspector.debuggerManager, WebInspector.DebuggerManager.Event.Paused, resolve);
            });

            var protocolResult = DebuggerAgent.pause()["catch"](function (error) {
                listener.disconnect();
                console.error("DebuggerManager.pause failed: ", error);
                throw error;
            });

            return Promise.all([managerResult, protocolResult]);
        }
    }, {
        key: "resume",
        value: function resume() {
            if (!this._paused) return Promise.resolve();

            var listener = new WebInspector.EventListener(this, true);

            var managerResult = new Promise(function (resolve, reject) {
                listener.connect(WebInspector.debuggerManager, WebInspector.DebuggerManager.Event.Resumed, resolve);
            });

            var protocolResult = DebuggerAgent.resume()["catch"](function (error) {
                listener.disconnect();
                console.error("DebuggerManager.resume failed: ", error);
                throw error;
            });

            return Promise.all([managerResult, protocolResult]);
        }
    }, {
        key: "stepOver",
        value: function stepOver() {
            if (!this._paused) return Promise.reject(new Error("Cannot step over because debugger is not paused."));

            var listener = new WebInspector.EventListener(this, true);

            var managerResult = new Promise(function (resolve, reject) {
                listener.connect(WebInspector.debuggerManager, WebInspector.DebuggerManager.Event.ActiveCallFrameDidChange, resolve);
            });

            var protocolResult = DebuggerAgent.stepOver()["catch"](function (error) {
                listener.disconnect();
                console.error("DebuggerManager.stepOver failed: ", error);
                throw error;
            });

            return Promise.all([managerResult, protocolResult]);
        }
    }, {
        key: "stepInto",
        value: function stepInto() {
            if (!this._paused) return Promise.reject(new Error("Cannot step into because debugger is not paused."));

            var listener = new WebInspector.EventListener(this, true);

            var managerResult = new Promise(function (resolve, reject) {
                listener.connect(WebInspector.debuggerManager, WebInspector.DebuggerManager.Event.ActiveCallFrameDidChange, resolve);
            });

            var protocolResult = DebuggerAgent.stepInto()["catch"](function (error) {
                listener.disconnect();
                console.error("DebuggerManager.stepInto failed: ", error);
                throw error;
            });

            return Promise.all([managerResult, protocolResult]);
        }
    }, {
        key: "stepOut",
        value: function stepOut() {
            if (!this._paused) return Promise.reject(new Error("Cannot step out because debugger is not paused."));

            var listener = new WebInspector.EventListener(this, true);

            var managerResult = new Promise(function (resolve, reject) {
                listener.connect(WebInspector.debuggerManager, WebInspector.DebuggerManager.Event.ActiveCallFrameDidChange, resolve);
            });

            var protocolResult = DebuggerAgent.stepOut()["catch"](function (error) {
                listener.disconnect();
                console.error("DebuggerManager.stepOut failed: ", error);
                throw error;
            });

            return Promise.all([managerResult, protocolResult]);
        }
    }, {
        key: "breakpointsForSourceCode",
        value: function breakpointsForSourceCode(sourceCode) {
            console.assert(sourceCode instanceof WebInspector.Resource || sourceCode instanceof WebInspector.Script);

            if (sourceCode instanceof WebInspector.SourceMapResource) {
                var mappedResourceBreakpoints = [];
                var originalSourceCodeBreakpoints = this.breakpointsForSourceCode(sourceCode.sourceMap.originalSourceCode);
                return originalSourceCodeBreakpoints.filter(function (breakpoint) {
                    return breakpoint.sourceCodeLocation.displaySourceCode === sourceCode;
                });
            }

            if (sourceCode.url in this._breakpointURLMap) {
                var urlBreakpoint = this._breakpointURLMap[sourceCode.url] || [];
                this._associateBreakpointsWithSourceCode(urlBreakpoint, sourceCode);
                return urlBreakpoint;
            }

            if (sourceCode instanceof WebInspector.Script && sourceCode.id in this._breakpointScriptIdentifierMap) {
                var scriptIdentifierBreakpoints = this._breakpointScriptIdentifierMap[sourceCode.id] || [];
                this._associateBreakpointsWithSourceCode(scriptIdentifierBreakpoints, sourceCode);
                return scriptIdentifierBreakpoints;
            }

            return [];
        }
    }, {
        key: "breakpointForIdentifier",
        value: function breakpointForIdentifier(id) {
            return this._breakpointIdMap[id];
        }
    }, {
        key: "scriptForIdentifier",
        value: function scriptForIdentifier(id) {
            return this._scriptIdMap[id] || null;
        }
    }, {
        key: "scriptsForURL",
        value: function scriptsForURL(url) {
            // FIXME: This may not be safe. A Resource's URL may differ from a Script's URL.
            return this._scriptURLMap[url] || [];
        }
    }, {
        key: "continueToLocation",
        value: function continueToLocation(scriptIdentifier, lineNumber, columnNumber) {
            DebuggerAgent.continueToLocation({ scriptId: scriptIdentifier, lineNumber: lineNumber, columnNumber: columnNumber });
        }
    }, {
        key: "addBreakpoint",
        value: function addBreakpoint(breakpoint, skipEventDispatch, shouldSpeculativelyResolve) {
            console.assert(breakpoint instanceof WebInspector.Breakpoint, "Bad argument to DebuggerManger.addBreakpoint: ", breakpoint);
            if (!breakpoint) return;

            if (breakpoint.url) {
                var urlBreakpoints = this._breakpointURLMap[breakpoint.url];
                if (!urlBreakpoints) urlBreakpoints = this._breakpointURLMap[breakpoint.url] = [];
                urlBreakpoints.push(breakpoint);
            }

            if (breakpoint.scriptIdentifier) {
                var scriptIdentifierBreakpoints = this._breakpointScriptIdentifierMap[breakpoint.scriptIdentifier];
                if (!scriptIdentifierBreakpoints) scriptIdentifierBreakpoints = this._breakpointScriptIdentifierMap[breakpoint.scriptIdentifier] = [];
                scriptIdentifierBreakpoints.push(breakpoint);
            }

            this._breakpoints.push(breakpoint);

            function speculativelyResolveBreakpoint(breakpoint) {
                breakpoint.resolved = true;
            }

            if (!breakpoint.disabled) this._setBreakpoint(breakpoint, shouldSpeculativelyResolve ? speculativelyResolveBreakpoint.bind(null, breakpoint) : null);

            if (!skipEventDispatch) this.dispatchEventToListeners(WebInspector.DebuggerManager.Event.BreakpointAdded, { breakpoint: breakpoint });
        }
    }, {
        key: "removeBreakpoint",
        value: function removeBreakpoint(breakpoint) {
            console.assert(breakpoint);
            if (!breakpoint) return;

            console.assert(this.isBreakpointRemovable(breakpoint));
            if (!this.isBreakpointRemovable(breakpoint)) return;

            this._breakpoints.remove(breakpoint);

            if (breakpoint.identifier) this._removeBreakpoint(breakpoint);

            if (breakpoint.url) {
                var urlBreakpoints = this._breakpointURLMap[breakpoint.url];
                if (urlBreakpoints) {
                    urlBreakpoints.remove(breakpoint);
                    if (!urlBreakpoints.length) delete this._breakpointURLMap[breakpoint.url];
                }
            }

            if (breakpoint.scriptIdentifier) {
                var scriptIdentifierBreakpoints = this._breakpointScriptIdentifierMap[breakpoint.scriptIdentifier];
                if (scriptIdentifierBreakpoints) {
                    scriptIdentifierBreakpoints.remove(breakpoint);
                    if (!scriptIdentifierBreakpoints.length) delete this._breakpointScriptIdentifierMap[breakpoint.scriptIdentifier];
                }
            }

            // Disable the breakpoint first, so removing actions doesn't re-add the breakpoint.
            breakpoint.disabled = true;
            breakpoint.clearActions();

            this.dispatchEventToListeners(WebInspector.DebuggerManager.Event.BreakpointRemoved, { breakpoint: breakpoint });
        }
    }, {
        key: "breakpointResolved",
        value: function breakpointResolved(breakpointIdentifier, location) {
            // Called from WebInspector.DebuggerObserver.

            var breakpoint = this._breakpointIdMap[breakpointIdentifier];
            console.assert(breakpoint);
            if (!breakpoint) return;

            console.assert(breakpoint.identifier === breakpointIdentifier);

            if (!breakpoint.sourceCodeLocation.sourceCode) {
                var sourceCodeLocation = this._sourceCodeLocationFromPayload(location);
                breakpoint.sourceCodeLocation.sourceCode = sourceCodeLocation.sourceCode;
            }

            breakpoint.resolved = true;
        }
    }, {
        key: "reset",
        value: function reset() {
            // Called from WebInspector.DebuggerObserver.

            var wasPaused = this._paused;

            WebInspector.Script.resetUniqueDisplayNameNumbers();

            this._paused = false;
            this._pauseReason = null;
            this._pauseData = null;

            this._scriptIdMap = {};
            this._scriptURLMap = {};

            this._ignoreBreakpointDisplayLocationDidChangeEvent = true;

            // Mark all the breakpoints as unresolved. They will be reported as resolved when
            // breakpointResolved is called as the page loads.
            for (var i = 0; i < this._breakpoints.length; ++i) {
                var breakpoint = this._breakpoints[i];
                breakpoint.resolved = false;
                if (breakpoint.sourceCodeLocation.sourceCode) breakpoint.sourceCodeLocation.sourceCode = null;
            }

            this._ignoreBreakpointDisplayLocationDidChangeEvent = false;

            this.dispatchEventToListeners(WebInspector.DebuggerManager.Event.ScriptsCleared);

            if (wasPaused) this.dispatchEventToListeners(WebInspector.DebuggerManager.Event.Resumed);
        }
    }, {
        key: "debuggerDidPause",
        value: function debuggerDidPause(callFramesPayload, reason, data) {
            // Called from WebInspector.DebuggerObserver.

            if (this._delayedResumeTimeout) {
                clearTimeout(this._delayedResumeTimeout);
                this._delayedResumeTimeout = undefined;
            }

            var wasStillPaused = this._paused;

            this._paused = true;
            this._callFrames = [];

            this._pauseReason = this._pauseReasonFromPayload(reason);
            this._pauseData = data || null;

            for (var i = 0; i < callFramesPayload.length; ++i) {
                var callFramePayload = callFramesPayload[i];
                var sourceCodeLocation = this._sourceCodeLocationFromPayload(callFramePayload.location);
                // FIXME: There may be useful call frames without a source code location (native callframes), should we include them?
                if (!sourceCodeLocation) continue;
                if (!sourceCodeLocation.sourceCode) continue;
                // Exclude the case where the call frame is in the inspector code.
                if (sourceCodeLocation.sourceCode.url && sourceCodeLocation.sourceCode.url.startsWith("__WebInspector")) continue;
                var thisObject = WebInspector.RemoteObject.fromPayload(callFramePayload["this"]);
                var scopeChain = this._scopeChainFromPayload(callFramePayload.scopeChain);
                var callFrame = new WebInspector.CallFrame(callFramePayload.callFrameId, sourceCodeLocation, callFramePayload.functionName, thisObject, scopeChain);
                this._callFrames.push(callFrame);
            }

            this._activeCallFrame = this._callFrames[0];

            if (!wasStillPaused) this.dispatchEventToListeners(WebInspector.DebuggerManager.Event.Paused);
            this.dispatchEventToListeners(WebInspector.DebuggerManager.Event.CallFramesDidChange);
            this.dispatchEventToListeners(WebInspector.DebuggerManager.Event.ActiveCallFrameDidChange);
        }
    }, {
        key: "debuggerDidResume",
        value: function debuggerDidResume() {
            // Called from WebInspector.DebuggerObserver.

            // We delay clearing the state and firing events so the user interface does not flash
            // between brief steps or successive breakpoints.
            this._delayedResumeTimeout = setTimeout(this._didResumeInternal.bind(this), 50);
        }
    }, {
        key: "playBreakpointActionSound",
        value: function playBreakpointActionSound(breakpointActionIdentifier) {
            InspectorFrontendHost.beep();
        }
    }, {
        key: "scriptDidParse",
        value: function scriptDidParse(scriptIdentifier, url, isContentScript, startLine, startColumn, endLine, endColumn, sourceMapURL) {
            // Don't add the script again if it is already known.
            if (this._scriptIdMap[scriptIdentifier]) {
                console.assert(this._scriptIdMap[scriptIdentifier].url === (url || null));
                console.assert(this._scriptIdMap[scriptIdentifier].range.startLine === startLine);
                console.assert(this._scriptIdMap[scriptIdentifier].range.startColumn === startColumn);
                console.assert(this._scriptIdMap[scriptIdentifier].range.endLine === endLine);
                console.assert(this._scriptIdMap[scriptIdentifier].range.endColumn === endColumn);
                return;
            }

            var script = new WebInspector.Script(scriptIdentifier, new WebInspector.TextRange(startLine, startColumn, endLine, endColumn), url, isContentScript, sourceMapURL);

            this._scriptIdMap[scriptIdentifier] = script;

            if (script.url) {
                var scripts = this._scriptURLMap[script.url];
                if (!scripts) scripts = this._scriptURLMap[script.url] = [];
                scripts.push(script);
            }

            this.dispatchEventToListeners(WebInspector.DebuggerManager.Event.ScriptAdded, { script: script });
        }
    }, {
        key: "isBreakpointRemovable",
        value: function isBreakpointRemovable(breakpoint) {
            return breakpoint !== this._allExceptionsBreakpoint && breakpoint !== this._allUncaughtExceptionsBreakpoint;
        }
    }, {
        key: "isBreakpointEditable",
        value: function isBreakpointEditable(breakpoint) {
            return this.isBreakpointRemovable(breakpoint);
        }
    }, {
        key: "_sourceCodeLocationFromPayload",

        // Private

        value: function _sourceCodeLocationFromPayload(payload) {
            var script = this._scriptIdMap[payload.scriptId];
            console.assert(script);
            if (!script) return null;

            return script.createSourceCodeLocation(payload.lineNumber, payload.columnNumber);
        }
    }, {
        key: "_scopeChainFromPayload",
        value: function _scopeChainFromPayload(payload) {
            var scopeChain = [];
            for (var i = 0; i < payload.length; ++i) scopeChain.push(this._scopeChainNodeFromPayload(payload[i]));
            return scopeChain;
        }
    }, {
        key: "_scopeChainNodeFromPayload",
        value: function _scopeChainNodeFromPayload(payload) {
            var type = null;
            switch (payload.type) {
                case "local":
                    type = WebInspector.ScopeChainNode.Type.Local;
                    break;
                case "global":
                    type = WebInspector.ScopeChainNode.Type.Global;
                    break;
                case "with":
                    type = WebInspector.ScopeChainNode.Type.With;
                    break;
                case "closure":
                    type = WebInspector.ScopeChainNode.Type.Closure;
                    break;
                case "catch":
                    type = WebInspector.ScopeChainNode.Type.Catch;
                    break;
                case "functionName":
                    type = WebInspector.ScopeChainNode.Type.FunctionName;
                    break;
                default:
                    console.error("Unknown type: " + payload.type);
            }

            var object = WebInspector.RemoteObject.fromPayload(payload.object);
            return new WebInspector.ScopeChainNode(type, object);
        }
    }, {
        key: "_pauseReasonFromPayload",
        value: function _pauseReasonFromPayload(payload) {
            // FIXME: Handle other backend pause reasons.
            switch (payload) {
                case DebuggerAgent.PausedReason.Assert:
                    return WebInspector.DebuggerManager.PauseReason.Assertion;
                case DebuggerAgent.PausedReason.Breakpoint:
                    return WebInspector.DebuggerManager.PauseReason.Breakpoint;
                case DebuggerAgent.PausedReason.CSPViolation:
                    return WebInspector.DebuggerManager.PauseReason.CSPViolation;
                case DebuggerAgent.PausedReason.DebuggerStatement:
                    return WebInspector.DebuggerManager.PauseReason.DebuggerStatement;
                case DebuggerAgent.PausedReason.Exception:
                    return WebInspector.DebuggerManager.PauseReason.Exception;
                case DebuggerAgent.PausedReason.PauseOnNextStatement:
                    return WebInspector.DebuggerManager.PauseReason.PauseOnNextStatement;
                default:
                    return WebInspector.DebuggerManager.PauseReason.Other;
            }
        }
    }, {
        key: "_debuggerBreakpointActionType",
        value: function _debuggerBreakpointActionType(type) {
            switch (type) {
                case WebInspector.BreakpointAction.Type.Log:
                    return DebuggerAgent.BreakpointActionType.Log;
                case WebInspector.BreakpointAction.Type.Evaluate:
                    return DebuggerAgent.BreakpointActionType.Evaluate;
                case WebInspector.BreakpointAction.Type.Sound:
                    return DebuggerAgent.BreakpointActionType.Sound;
                case WebInspector.BreakpointAction.Type.Probe:
                    return DebuggerAgent.BreakpointActionType.Probe;
                default:
                    console.assert(false);
                    return DebuggerAgent.BreakpointActionType.Log;
            }
        }
    }, {
        key: "_setBreakpoint",
        value: function _setBreakpoint(breakpoint, callback) {
            console.assert(!breakpoint.identifier);
            console.assert(!breakpoint.disabled);

            if (breakpoint.identifier || breakpoint.disabled) return;

            if (!this._restoringBreakpoints) {
                // Enable breakpoints since a breakpoint is being set. This eliminates
                // a multi-step process for the user that can be confusing.
                this.breakpointsEnabled = true;
            }

            function didSetBreakpoint(error, breakpointIdentifier, locations) {
                if (error) return;

                this._breakpointIdMap[breakpointIdentifier] = breakpoint;

                breakpoint.identifier = breakpointIdentifier;

                // Debugger.setBreakpoint returns a single location.
                if (!(locations instanceof Array)) locations = [locations];

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = locations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var location = _step2.value;

                        this.breakpointResolved(breakpointIdentifier, location);
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                            _iterator2["return"]();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                if (typeof callback === "function") callback();
            }

            // The breakpoint will be resolved again by calling DebuggerAgent, so mark it as unresolved.
            // If something goes wrong it will stay unresolved and show up as such in the user interface.
            breakpoint.resolved = false;

            // Convert BreakpointAction types to DebuggerAgent protocol types.
            // NOTE: Breakpoint.options returns new objects each time, so it is safe to modify.
            // COMPATIBILITY (iOS 7): Debugger.BreakpointActionType did not exist yet.
            var options;
            if (DebuggerAgent.BreakpointActionType) {
                options = breakpoint.options;
                if (options.actions.length) {
                    for (var i = 0; i < options.actions.length; ++i) options.actions[i].type = this._debuggerBreakpointActionType(options.actions[i].type);
                }
            }

            // COMPATIBILITY (iOS 7): iOS 7 and earlier, DebuggerAgent.setBreakpoint* took a "condition" string argument.
            // This has been replaced with an "options" BreakpointOptions object.
            if (breakpoint.url) {
                DebuggerAgent.setBreakpointByUrl.invoke({
                    lineNumber: breakpoint.sourceCodeLocation.lineNumber,
                    url: breakpoint.url,
                    urlRegex: undefined,
                    columnNumber: breakpoint.sourceCodeLocation.columnNumber,
                    condition: breakpoint.condition,
                    options: options
                }, didSetBreakpoint.bind(this));
            } else if (breakpoint.scriptIdentifier) {
                DebuggerAgent.setBreakpoint.invoke({
                    location: { scriptId: breakpoint.scriptIdentifier, lineNumber: breakpoint.sourceCodeLocation.lineNumber, columnNumber: breakpoint.sourceCodeLocation.columnNumber },
                    condition: breakpoint.condition,
                    options: options
                }, didSetBreakpoint.bind(this));
            }
        }
    }, {
        key: "_removeBreakpoint",
        value: function _removeBreakpoint(breakpoint, callback) {
            if (!breakpoint.identifier) return;

            function didRemoveBreakpoint(error) {
                if (error) console.error(error);

                delete this._breakpointIdMap[breakpoint.identifier];

                breakpoint.identifier = null;

                // Don't reset resolved here since we want to keep disabled breakpoints looking like they
                // are resolved in the user interface. They will get marked as unresolved in reset.

                if (typeof callback === "function") callback();
            }

            DebuggerAgent.removeBreakpoint(breakpoint.identifier, didRemoveBreakpoint.bind(this));
        }
    }, {
        key: "_breakpointDisplayLocationDidChange",
        value: function _breakpointDisplayLocationDidChange(event) {
            if (this._ignoreBreakpointDisplayLocationDidChangeEvent) return;

            var breakpoint = event.target;
            if (!breakpoint.identifier || breakpoint.disabled) return;

            // Remove the breakpoint with its old id.
            this._removeBreakpoint(breakpoint, breakpointRemoved.bind(this));

            function breakpointRemoved() {
                // Add the breakpoint at its new lineNumber and get a new id.
                this._setBreakpoint(breakpoint);

                this.dispatchEventToListeners(WebInspector.DebuggerManager.Event.BreakpointMoved, { breakpoint: breakpoint });
            }
        }
    }, {
        key: "_breakpointDisabledStateDidChange",
        value: function _breakpointDisabledStateDidChange(event) {
            var breakpoint = event.target;

            if (breakpoint === this._allExceptionsBreakpoint) {
                if (!breakpoint.disabled) this.breakpointsEnabled = true;
                this._allExceptionsBreakpointEnabledSetting.value = !breakpoint.disabled;
                this._updateBreakOnExceptionsState();
                return;
            }

            if (breakpoint === this._allUncaughtExceptionsBreakpoint) {
                if (!breakpoint.disabled) this.breakpointsEnabled = true;
                this._allUncaughtExceptionsBreakpointEnabledSetting.value = !breakpoint.disabled;
                this._updateBreakOnExceptionsState();
                return;
            }

            if (breakpoint.disabled) this._removeBreakpoint(breakpoint);else this._setBreakpoint(breakpoint);
        }
    }, {
        key: "_breakpointEditablePropertyDidChange",
        value: function _breakpointEditablePropertyDidChange(event) {
            var breakpoint = event.target;
            if (breakpoint.disabled) return;

            console.assert(this.isBreakpointEditable(breakpoint));
            if (!this.isBreakpointEditable(breakpoint)) return;

            // Remove the breakpoint with its old id.
            this._removeBreakpoint(breakpoint, breakpointRemoved.bind(this));

            function breakpointRemoved() {
                // Add the breakpoint with its new condition and get a new id.
                this._setBreakpoint(breakpoint);
            }
        }
    }, {
        key: "_mainResourceDidChange",
        value: function _mainResourceDidChange(event) {
            if (!event.target.isMainFrame()) return;

            this._didResumeInternal();
        }
    }, {
        key: "_didResumeInternal",
        value: function _didResumeInternal() {
            if (!this._activeCallFrame) return;

            if (this._delayedResumeTimeout) {
                clearTimeout(this._delayedResumeTimeout);
                this._delayedResumeTimeout = undefined;
            }

            this._paused = false;
            this._callFrames = null;
            this._activeCallFrame = null;

            this.dispatchEventToListeners(WebInspector.DebuggerManager.Event.Resumed);
            this.dispatchEventToListeners(WebInspector.DebuggerManager.Event.CallFramesDidChange);
            this.dispatchEventToListeners(WebInspector.DebuggerManager.Event.ActiveCallFrameDidChange);
        }
    }, {
        key: "_updateBreakOnExceptionsState",
        value: function _updateBreakOnExceptionsState() {
            var state = "none";

            if (this._breakpointsEnabledSetting.value) {
                if (!this._allExceptionsBreakpoint.disabled) state = "all";else if (!this._allUncaughtExceptionsBreakpoint.disabled) state = "uncaught";
            }

            switch (state) {
                case "all":
                    // Mark the uncaught breakpoint as unresolved since "all" includes "uncaught".
                    // That way it is clear in the user interface that the breakpoint is ignored.
                    this._allUncaughtExceptionsBreakpoint.resolved = false;
                    break;
                case "uncaught":
                case "none":
                    // Mark the uncaught breakpoint as resolved again.
                    this._allUncaughtExceptionsBreakpoint.resolved = true;
                    break;
            }

            DebuggerAgent.setPauseOnExceptions(state);
        }
    }, {
        key: "_inspectorClosing",
        value: function _inspectorClosing(event) {
            this._saveBreakpoints();
        }
    }, {
        key: "_saveBreakpoints",
        value: function _saveBreakpoints() {
            var savedBreakpoints = [];

            for (var i = 0; i < this._breakpoints.length; ++i) {
                var breakpoint = this._breakpoints[i];

                // Only breakpoints with URLs can be saved. Breakpoints for transient scripts can't.
                if (!breakpoint.url) continue;

                savedBreakpoints.push(breakpoint.info);
            }

            this._breakpointsSetting.value = savedBreakpoints;
        }
    }, {
        key: "_associateBreakpointsWithSourceCode",
        value: function _associateBreakpointsWithSourceCode(breakpoints, sourceCode) {
            this._ignoreBreakpointDisplayLocationDidChangeEvent = true;

            for (var i = 0; i < breakpoints.length; ++i) {
                var breakpoint = breakpoints[i];
                if (breakpoint.sourceCodeLocation.sourceCode === null) breakpoint.sourceCodeLocation.sourceCode = sourceCode;
                // SourceCodes can be unequal if the SourceCodeLocation is associated with a Script and we are looking at the Resource.
                console.assert(breakpoint.sourceCodeLocation.sourceCode === sourceCode || breakpoint.sourceCodeLocation.sourceCode.url === sourceCode.url);
            }

            this._ignoreBreakpointDisplayLocationDidChangeEvent = false;
        }
    }, {
        key: "breakpointsEnabled",
        get: function get() {
            return this._breakpointsEnabledSetting.value;
        },
        set: function set(enabled) {
            if (this._breakpointsEnabledSetting.value === enabled) return;

            this._breakpointsEnabledSetting.value = enabled;

            this.dispatchEventToListeners(WebInspector.DebuggerManager.Event.BreakpointsEnabledDidChange);

            DebuggerAgent.setBreakpointsActive(enabled);

            this._updateBreakOnExceptionsState();
        }
    }, {
        key: "paused",
        get: function get() {
            return this._paused;
        }
    }, {
        key: "pauseReason",
        get: function get() {
            return this._pauseReason;
        }
    }, {
        key: "pauseData",
        get: function get() {
            return this._pauseData;
        }
    }, {
        key: "callFrames",
        get: function get() {
            return this._callFrames;
        }
    }, {
        key: "activeCallFrame",
        get: function get() {
            return this._activeCallFrame;
        },
        set: function set(callFrame) {
            if (callFrame === this._activeCallFrame) return;

            this._activeCallFrame = callFrame || null;

            this.dispatchEventToListeners(WebInspector.DebuggerManager.Event.ActiveCallFrameDidChange);
        }
    }, {
        key: "allExceptionsBreakpoint",
        get: function get() {
            return this._allExceptionsBreakpoint;
        }
    }, {
        key: "allUncaughtExceptionsBreakpoint",
        get: function get() {
            return this._allUncaughtExceptionsBreakpoint;
        }
    }, {
        key: "breakpoints",
        get: function get() {
            return this._breakpoints;
        }
    }, {
        key: "knownNonResourceScripts",
        get: function get() {
            var knownScripts = [];
            for (var id in this._scriptIdMap) {
                var script = this._scriptIdMap[id];
                if (script.resource) continue;
                if (script.url && script.url.startsWith("__WebInspector")) continue;
                knownScripts.push(script);
            }

            return knownScripts;
        }
    }, {
        key: "nextBreakpointActionIdentifier",
        get: function get() {
            return this._nextBreakpointActionIdentifier++;
        }
    }]);

    return DebuggerManager;
})(WebInspector.Object);

WebInspector.DebuggerManager.Event = {
    BreakpointAdded: "debugger-manager-breakpoint-added",
    BreakpointRemoved: "debugger-manager-breakpoint-removed",
    BreakpointMoved: "debugger-manager-breakpoint-moved",
    WaitingToPause: "debugger-manager-waiting-to-pause",
    Paused: "debugger-manager-paused",
    Resumed: "debugger-manager-resumed",
    CallFramesDidChange: "debugger-manager-call-frames-did-change",
    ActiveCallFrameDidChange: "debugger-manager-active-call-frame-did-change",
    ScriptAdded: "debugger-manager-script-added",
    ScriptsCleared: "debugger-manager-scripts-cleared",
    BreakpointsEnabledDidChange: "debugger-manager-breakpoints-enabled-did-change"
};

WebInspector.DebuggerManager.PauseReason = {
    Assertion: "assertion",
    Breakpoint: "breakpoint",
    CSPViolation: "CSP-violation",
    DebuggerStatement: "debugger-statement",
    Exception: "exception",
    PauseOnNextStatement: "pause-on-next-statement",
    Other: "other"
};
