var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

WebInspector.QuickConsole = (function (_WebInspector$Object) {
    _inherits(QuickConsole, _WebInspector$Object);

    function QuickConsole(element) {
        _classCallCheck(this, QuickConsole);

        _get(Object.getPrototypeOf(QuickConsole.prototype), "constructor", this).call(this);

        this._toggleOrFocusKeyboardShortcut = new WebInspector.KeyboardShortcut(null, WebInspector.KeyboardShortcut.Key.Escape, this._toggleOrFocus.bind(this));

        var mainFrameExecutionContext = new WebInspector.ExecutionContext(WebInspector.QuickConsole.MainFrameContextExecutionIdentifier, WebInspector.UIString("Main Frame"), true, null);
        this._mainFrameExecutionContextPathComponent = this._createExecutionContextPathComponent(mainFrameExecutionContext.name, mainFrameExecutionContext.identifier);
        this._selectedExecutionContextPathComponent = this._mainFrameExecutionContextPathComponent;

        this._otherExecutionContextPathComponents = [];
        this._frameIdentifierToExecutionContextPathComponentMap = {};

        this._element = element || document.createElement("div");
        this._element.classList.add("quick-console");

        this.prompt = new WebInspector.ConsolePrompt(null, "text/javascript");
        this.prompt.element.classList.add("text-prompt");
        this._element.appendChild(this.prompt.element);

        // FIXME: CodeMirror 4 has a default "Esc" key handler that always prevents default.
        // Our keyboard shortcut above will respect the default prevented and ignore the event
        // and not toggle the console. Install our own Escape key handler that will trigger
        // when the ConsolePrompt is empty, to restore toggling behavior. A better solution
        // would be for CodeMirror's event handler to pass if it doesn't do anything.
        this.prompt.escapeKeyHandlerWhenEmpty = function () {
            WebInspector.toggleSplitConsole();
        };

        this.prompt.shown();

        this._navigationBar = new WebInspector.QuickConsoleNavigationBar();
        this._element.appendChild(this._navigationBar.element);

        this._executionContextSelectorItem = new WebInspector.HierarchicalPathNavigationItem();
        this._executionContextSelectorItem.showSelectorArrows = true;
        this._navigationBar.addNavigationItem(this._executionContextSelectorItem);

        this._executionContextSelectorDivider = new WebInspector.DividerNavigationItem();
        this._navigationBar.addNavigationItem(this._executionContextSelectorDivider);

        this._rebuildExecutionContextPathComponents();

        WebInspector.Frame.addEventListener(WebInspector.Frame.Event.PageExecutionContextChanged, this._framePageExecutionContextsChanged, this);
        WebInspector.Frame.addEventListener(WebInspector.Frame.Event.ExecutionContextsCleared, this._frameExecutionContextsCleared, this);

        WebInspector.debuggerManager.addEventListener(WebInspector.DebuggerManager.Event.ActiveCallFrameDidChange, this._debuggerActiveCallFrameDidChange, this);
    }

    // Public

    _createClass(QuickConsole, [{
        key: "updateLayout",
        value: function updateLayout() {
            // A hard maximum size of 33% of the window.
            var maximumAllowedHeight = Math.round(window.innerHeight * 0.33);
            this.prompt.element.style.maxHeight = maximumAllowedHeight + "px";
        }
    }, {
        key: "consoleLogVisibilityChanged",
        value: function consoleLogVisibilityChanged(visible) {
            if (visible === this.element.classList.contains(WebInspector.QuickConsole.ShowingLogClassName)) return;

            this.element.classList.toggle(WebInspector.QuickConsole.ShowingLogClassName, visible);

            this.dispatchEventToListeners(WebInspector.QuickConsole.Event.DidResize);
        }

        // Private

    }, {
        key: "_executionContextPathComponentsToDisplay",
        value: function _executionContextPathComponentsToDisplay() {
            // If we are in the debugger the console will use the active call frame, don't show the selector.
            if (WebInspector.debuggerManager.activeCallFrame) return [];

            // If there is only the Main Frame, don't show the selector.
            if (!this._otherExecutionContextPathComponents.length) return [];

            return [this._selectedExecutionContextPathComponent];
        }
    }, {
        key: "_rebuildExecutionContextPathComponents",
        value: function _rebuildExecutionContextPathComponents() {
            var components = this._executionContextPathComponentsToDisplay();
            var isEmpty = !components.length;

            this._executionContextSelectorItem.components = components;

            this._executionContextSelectorItem.hidden = isEmpty;
            this._executionContextSelectorDivider.hidden = isEmpty;
        }
    }, {
        key: "_framePageExecutionContextsChanged",
        value: function _framePageExecutionContextsChanged(event) {
            var frame = event.target;

            var shouldAutomaticallySelect = this._restoreSelectedExecutionContextForFrame === frame;

            var newExecutionContextPathComponent = this._insertExecutionContextPathComponentForFrame(frame, shouldAutomaticallySelect);

            if (shouldAutomaticallySelect) {
                delete this._restoreSelectedExecutionContextForFrame;
                this._selectedExecutionContextPathComponent = newExecutionContextPathComponent;
                this._rebuildExecutionContextPathComponents();
            }
        }
    }, {
        key: "_frameExecutionContextsCleared",
        value: function _frameExecutionContextsCleared(event) {
            var frame = event.target;

            // If this frame is navigating and it is selected in the UI we want to reselect its new item after navigation.
            if (event.data.committingProvisionalLoad && !this._restoreSelectedExecutionContextForFrame) {
                var executionContextPathComponent = this._frameIdentifierToExecutionContextPathComponentMap[frame.id];
                if (this._selectedExecutionContextPathComponent === executionContextPathComponent) {
                    this._restoreSelectedExecutionContextForFrame = frame;
                    // As a fail safe, if the frame never gets an execution context, clear the restore value.
                    setTimeout((function () {
                        delete this._restoreSelectedExecutionContextForFrame;
                    }).bind(this), 10);
                }
            }

            this._removeExecutionContextPathComponentForFrame(frame);
        }
    }, {
        key: "_createExecutionContextPathComponent",
        value: function _createExecutionContextPathComponent(name, identifier) {
            var pathComponent = new WebInspector.HierarchicalPathComponent(name, "execution-context", identifier, true, true);
            pathComponent.addEventListener(WebInspector.HierarchicalPathComponent.Event.SiblingWasSelected, this._pathComponentSelected, this);
            pathComponent.addEventListener(WebInspector.HierarchicalPathComponent.Event.Clicked, this._pathComponentClicked, this);
            pathComponent.truncatedDisplayNameLength = 50;
            pathComponent._executionContextIdentifier = identifier;
            return pathComponent;
        }
    }, {
        key: "_createExecutionContextPathComponentFromFrame",
        value: function _createExecutionContextPathComponentFromFrame(frame) {
            var name = frame.name ? frame.name + " — " + frame.mainResource.displayName : frame.mainResource.displayName;

            var pathComponent = this._createExecutionContextPathComponent(name, frame.pageExecutionContext.id);
            pathComponent._frame = frame;

            return pathComponent;
        }
    }, {
        key: "_compareExecutionContextPathComponents",
        value: function _compareExecutionContextPathComponents(a, b) {
            // "Main Frame" always on top.
            if (!a._frame) return -1;
            if (!b._frame) return 1;

            // Frames with a name above frames without a name.
            if (a._frame.name && !b._frame.name) return -1;
            if (!a._frame.name && b._frame.name) return 1;

            return a.displayName.localeCompare(b.displayName);
        }
    }, {
        key: "_insertExecutionContextPathComponentForFrame",
        value: function _insertExecutionContextPathComponentForFrame(frame, skipRebuild) {
            if (frame.isMainFrame()) return this._mainFrameExecutionContextPathComponent;

            console.assert(!this._frameIdentifierToExecutionContextPathComponentMap[frame.id]);
            if (this._frameIdentifierToExecutionContextPathComponentMap[frame.id]) return null;

            var executionContextPathComponent = this._createExecutionContextPathComponentFromFrame(frame);

            var index = insertionIndexForObjectInListSortedByFunction(executionContextPathComponent, this._otherExecutionContextPathComponents, this._compareExecutionContextPathComponents);

            var prev = index > 0 ? this._otherExecutionContextPathComponents[index - 1] : this._mainFrameExecutionContextPathComponent;
            var next = this._otherExecutionContextPathComponents[index] || null;
            if (prev) {
                prev.nextSibling = executionContextPathComponent;
                executionContextPathComponent.previousSibling = prev;
            }
            if (next) {
                next.previousSibling = executionContextPathComponent;
                executionContextPathComponent.nextSibling = next;
            }

            this._otherExecutionContextPathComponents.splice(index, 0, executionContextPathComponent);
            this._frameIdentifierToExecutionContextPathComponentMap[frame.id] = executionContextPathComponent;

            if (!skipRebuild) this._rebuildExecutionContextPathComponents();

            return executionContextPathComponent;
        }
    }, {
        key: "_removeExecutionContextPathComponentForFrame",
        value: function _removeExecutionContextPathComponentForFrame(frame, skipRebuild) {
            if (frame.isMainFrame()) return;

            var executionContextPathComponent = this._frameIdentifierToExecutionContextPathComponentMap[frame.id];
            console.assert(executionContextPathComponent);
            if (!executionContextPathComponent) return;

            executionContextPathComponent.removeEventListener(WebInspector.HierarchicalPathComponent.Event.SiblingWasSelected, this._pathComponentSelected, this);
            executionContextPathComponent.removeEventListener(WebInspector.HierarchicalPathComponent.Event.Clicked, this._pathComponentClicked, this);

            var prev = executionContextPathComponent.previousSibling;
            var next = executionContextPathComponent.nextSibling;
            if (prev) prev.nextSibling = next;
            if (next) next.previousSibling = prev;

            if (this._selectedExecutionContextPathComponent === executionContextPathComponent) this._selectedExecutionContextPathComponent = this._mainFrameExecutionContextPathComponent;

            this._otherExecutionContextPathComponents.remove(executionContextPathComponent, true);
            delete this._frameIdentifierToExecutionContextPathComponentMap[frame.id];

            if (!skipRebuild) this._rebuildExecutionContextPathComponents();
        }
    }, {
        key: "_updateExecutionContextPathComponentForFrame",
        value: function _updateExecutionContextPathComponentForFrame(frame) {
            if (frame.isMainFrame()) return;

            var executionContextPathComponent = this._frameIdentifierToExecutionContextPathComponentMap[frame.id];
            if (!executionContextPathComponent) return;

            var wasSelected = this._selectedExecutionContextPathComponent === executionContextPathComponent;

            this._removeExecutionContextPathComponentForFrame(frame, true);
            var newExecutionContextPathComponent = this._insertExecutionContextPathComponentForFrame(frame, true);

            if (wasSelected) this._selectedExecutionContextPathComponent = newExecutionContextPathComponent;

            this._rebuildExecutionContextPathComponents();
        }
    }, {
        key: "_pathComponentSelected",
        value: function _pathComponentSelected(event) {
            if (event.data.pathComponent === this._selectedExecutionContextPathComponent) return;

            this._selectedExecutionContextPathComponent = event.data.pathComponent;

            this._rebuildExecutionContextPathComponents();
        }
    }, {
        key: "_pathComponentClicked",
        value: function _pathComponentClicked(event) {
            this.prompt.focus();
        }
    }, {
        key: "_debuggerActiveCallFrameDidChange",
        value: function _debuggerActiveCallFrameDidChange(event) {
            this._rebuildExecutionContextPathComponents();
        }
    }, {
        key: "_toggleOrFocus",
        value: function _toggleOrFocus(event) {
            if (this.prompt.focused) WebInspector.toggleSplitConsole();else if (!WebInspector.isEditingAnyField() && !WebInspector.isEventTargetAnEditableField(event)) this.prompt.focus();
        }
    }, {
        key: "element",
        get: function get() {
            return this._element;
        }
    }, {
        key: "navigationBar",
        get: function get() {
            return this._navigationBar;
        }
    }, {
        key: "executionContextIdentifier",
        get: function get() {
            return this._selectedExecutionContextPathComponent._executionContextIdentifier;
        }
    }]);

    return QuickConsole;
})(WebInspector.Object);

WebInspector.QuickConsole.ShowingLogClassName = "showing-log";

WebInspector.QuickConsole.ToolbarSingleLineHeight = 21;
WebInspector.QuickConsole.ToolbarPromptPadding = 4;
WebInspector.QuickConsole.ToolbarTopBorder = 1;

WebInspector.QuickConsole.MainFrameContextExecutionIdentifier = undefined;

WebInspector.QuickConsole.Event = {
    DidResize: "quick-console-did-resize"
};
