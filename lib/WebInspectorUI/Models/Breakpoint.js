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

WebInspector.Breakpoint = (function (_WebInspector$Object) {
    _inherits(Breakpoint, _WebInspector$Object);

    function Breakpoint(sourceCodeLocationOrInfo, disabled, condition) {
        _classCallCheck(this, Breakpoint);

        _get(Object.getPrototypeOf(Breakpoint.prototype), "constructor", this).call(this);

        if (sourceCodeLocationOrInfo instanceof WebInspector.SourceCodeLocation) {
            var sourceCode = sourceCodeLocationOrInfo.sourceCode;
            var url = sourceCode ? sourceCode.url : null;
            var scriptIdentifier = sourceCode instanceof WebInspector.Script ? sourceCode.id : null;
            var location = sourceCodeLocationOrInfo;
        } else if (sourceCodeLocationOrInfo && typeof sourceCodeLocationOrInfo === "object") {
            var url = sourceCodeLocationOrInfo.url;
            var lineNumber = sourceCodeLocationOrInfo.lineNumber || 0;
            var columnNumber = sourceCodeLocationOrInfo.columnNumber || 0;
            var location = new WebInspector.SourceCodeLocation(null, lineNumber, columnNumber);
            var autoContinue = sourceCodeLocationOrInfo.autoContinue || false;
            var actions = sourceCodeLocationOrInfo.actions || [];
            for (var i = 0; i < actions.length; ++i) actions[i] = new WebInspector.BreakpointAction(this, actions[i]);
            disabled = sourceCodeLocationOrInfo.disabled;
            condition = sourceCodeLocationOrInfo.condition;
        } else console.error("Unexpected type passed to WebInspector.Breakpoint", sourceCodeLocationOrInfo);

        this._id = null;
        this._url = url || null;
        this._scriptIdentifier = scriptIdentifier || null;
        this._disabled = disabled || false;
        this._condition = condition || "";
        this._autoContinue = autoContinue || false;
        this._actions = actions || [];
        this._resolved = false;

        this._sourceCodeLocation = location;
        this._sourceCodeLocation.addEventListener(WebInspector.SourceCodeLocation.Event.LocationChanged, this._sourceCodeLocationLocationChanged, this);
        this._sourceCodeLocation.addEventListener(WebInspector.SourceCodeLocation.Event.DisplayLocationChanged, this._sourceCodeLocationDisplayLocationChanged, this);
    }

    // Public

    _createClass(Breakpoint, [{
        key: "cycleToNextMode",
        value: function cycleToNextMode() {
            if (this.disabled) {
                // When cycling, clear auto-continue when going from disabled to enabled.
                this.autoContinue = false;
                this.disabled = false;
                return;
            }

            if (this.autoContinue) {
                this.disabled = true;
                return;
            }

            if (this.actions.length) {
                this.autoContinue = true;
                return;
            }

            this.disabled = true;
        }
    }, {
        key: "createAction",
        value: function createAction(type, precedingAction, data) {
            var newAction = new WebInspector.BreakpointAction(this, type, data || null);

            if (!precedingAction) this._actions.push(newAction);else {
                var index = this._actions.indexOf(precedingAction);
                console.assert(index !== -1);
                if (index === -1) this._actions.push(newAction);else this._actions.splice(index + 1, 0, newAction);
            }

            this.dispatchEventToListeners(WebInspector.Breakpoint.Event.ActionsDidChange);

            return newAction;
        }
    }, {
        key: "recreateAction",
        value: function recreateAction(type, actionToReplace) {
            var newAction = new WebInspector.BreakpointAction(this, type, null);

            var index = this._actions.indexOf(actionToReplace);
            console.assert(index !== -1);
            if (index === -1) return null;

            this._actions[index] = newAction;

            this.dispatchEventToListeners(WebInspector.Breakpoint.Event.ActionsDidChange);

            return newAction;
        }
    }, {
        key: "removeAction",
        value: function removeAction(action) {
            var index = this._actions.indexOf(action);
            console.assert(index !== -1);
            if (index === -1) return;

            this._actions.splice(index, 1);

            if (!this._actions.length) this.autoContinue = false;

            this.dispatchEventToListeners(WebInspector.Breakpoint.Event.ActionsDidChange);
        }
    }, {
        key: "clearActions",
        value: function clearActions(type) {
            if (!type) this._actions = [];else this._actions = this._actions.filter(function (action) {
                action.type !== type;
            });

            this.dispatchEventToListeners(WebInspector.Breakpoint.Event.ActionsDidChange);
        }
    }, {
        key: "saveIdentityToCookie",
        value: function saveIdentityToCookie(cookie) {
            cookie[WebInspector.Breakpoint.URLCookieKey] = this.url;
            cookie[WebInspector.Breakpoint.LineNumberCookieKey] = this.sourceCodeLocation.lineNumber;
            cookie[WebInspector.Breakpoint.ColumnNumberCookieKey] = this.sourceCodeLocation.columnNumber;
        }

        // Protected (Called by BreakpointAction)

    }, {
        key: "breakpointActionDidChange",
        value: function breakpointActionDidChange(action) {
            var index = this._actions.indexOf(action);
            console.assert(index !== -1);
            if (index === -1) return;

            this.dispatchEventToListeners(WebInspector.Breakpoint.Event.ActionsDidChange);
        }

        // Private

    }, {
        key: "_serializableActions",
        value: function _serializableActions() {
            var actions = [];
            for (var i = 0; i < this._actions.length; ++i) actions.push(this._actions[i].info);
            return actions;
        }
    }, {
        key: "_sourceCodeLocationLocationChanged",
        value: function _sourceCodeLocationLocationChanged(event) {
            this.dispatchEventToListeners(WebInspector.Breakpoint.Event.LocationDidChange, event.data);
        }
    }, {
        key: "_sourceCodeLocationDisplayLocationChanged",
        value: function _sourceCodeLocationDisplayLocationChanged(event) {
            this.dispatchEventToListeners(WebInspector.Breakpoint.Event.DisplayLocationDidChange, event.data);
        }
    }, {
        key: "id",
        get: function get() {
            return this._id;
        },
        set: function set(id) {
            this._id = id || null;
        }
    }, {
        key: "url",
        get: function get() {
            return this._url;
        }
    }, {
        key: "scriptIdentifier",
        get: function get() {
            return this._scriptIdentifier;
        }
    }, {
        key: "sourceCodeLocation",
        get: function get() {
            return this._sourceCodeLocation;
        }
    }, {
        key: "resolved",
        get: function get() {
            return this._resolved;
        },
        set: function set(resolved) {
            if (this._resolved === resolved) return;

            function isSpecialBreakpoint() {
                return this._sourceCodeLocation.isEqual(new WebInspector.SourceCodeLocation(null, Infinity, Infinity));
            }

            console.assert(!resolved || this._sourceCodeLocation.sourceCode || isSpecialBreakpoint.call(this), "Breakpoints must have a SourceCode to be resolved.", this);

            this._resolved = resolved || false;

            this.dispatchEventToListeners(WebInspector.Breakpoint.Event.ResolvedStateDidChange);
        }
    }, {
        key: "disabled",
        get: function get() {
            return this._disabled;
        },
        set: function set(disabled) {
            if (this._disabled === disabled) return;

            this._disabled = disabled || false;

            this.dispatchEventToListeners(WebInspector.Breakpoint.Event.DisabledStateDidChange);
        }
    }, {
        key: "condition",
        get: function get() {
            return this._condition;
        },
        set: function set(condition) {
            if (this._condition === condition) return;

            this._condition = condition;

            this.dispatchEventToListeners(WebInspector.Breakpoint.Event.ConditionDidChange);
        }
    }, {
        key: "autoContinue",
        get: function get() {
            return this._autoContinue;
        },
        set: function set(cont) {
            if (this._autoContinue === cont) return;

            this._autoContinue = cont;

            this.dispatchEventToListeners(WebInspector.Breakpoint.Event.AutoContinueDidChange);
        }
    }, {
        key: "actions",
        get: function get() {
            return this._actions;
        }
    }, {
        key: "options",
        get: function get() {
            return {
                condition: this._condition,
                actions: this._serializableActions(),
                autoContinue: this._autoContinue
            };
        }
    }, {
        key: "info",
        get: function get() {
            // The id, scriptIdentifier and resolved state are tied to the current session, so don't include them for serialization.
            return {
                url: this._url,
                lineNumber: this._sourceCodeLocation.lineNumber,
                columnNumber: this._sourceCodeLocation.columnNumber,
                disabled: this._disabled,
                condition: this._condition,
                actions: this._serializableActions(),
                autoContinue: this._autoContinue
            };
        }
    }, {
        key: "probeActions",
        get: function get() {
            return this._actions.filter(function (action) {
                return action.type === WebInspector.BreakpointAction.Type.Probe;
            });
        }
    }]);

    return Breakpoint;
})(WebInspector.Object);

WebInspector.Breakpoint.DefaultBreakpointActionType = WebInspector.BreakpointAction.Type.Log;

WebInspector.Breakpoint.TypeIdentifier = "breakpoint";
WebInspector.Breakpoint.URLCookieKey = "breakpoint-url";
WebInspector.Breakpoint.LineNumberCookieKey = "breakpoint-line-number";
WebInspector.Breakpoint.ColumnNumberCookieKey = "breakpoint-column-number";

WebInspector.Breakpoint.Event = {
    DisabledStateDidChange: "breakpoint-disabled-state-did-change",
    ResolvedStateDidChange: "breakpoint-resolved-state-did-change",
    ConditionDidChange: "breakpoint-condition-did-change",
    ActionsDidChange: "breakpoint-actions-did-change",
    AutoContinueDidChange: "breakpoint-auto-continue-did-change",
    LocationDidChange: "breakpoint-location-did-change",
    DisplayLocationDidChange: "breakpoint-display-location-did-change"
};
