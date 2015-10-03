var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2013-2015 Apple Inc. All rights reserved.
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

WebInspector.BreakpointTreeElement = (function (_WebInspector$DebuggerTreeElement) {
    _inherits(BreakpointTreeElement, _WebInspector$DebuggerTreeElement);

    function BreakpointTreeElement(breakpoint, className, title) {
        _classCallCheck(this, BreakpointTreeElement);

        console.assert(breakpoint instanceof WebInspector.Breakpoint);

        if (!className) className = WebInspector.BreakpointTreeElement.GenericLineIconStyleClassName;

        _get(Object.getPrototypeOf(BreakpointTreeElement.prototype), "constructor", this).call(this, ["breakpoint", className], title, null, breakpoint, false);

        this._breakpoint = breakpoint;

        this._listeners = new WebInspector.EventListenerSet(this, "BreakpointTreeElement listeners");
        if (!title) this._listeners.register(breakpoint, WebInspector.Breakpoint.Event.LocationDidChange, this._breakpointLocationDidChange);
        this._listeners.register(breakpoint, WebInspector.Breakpoint.Event.DisabledStateDidChange, this._updateStatus);
        this._listeners.register(breakpoint, WebInspector.Breakpoint.Event.AutoContinueDidChange, this._updateStatus);
        this._listeners.register(breakpoint, WebInspector.Breakpoint.Event.ResolvedStateDidChange, this._updateStatus);
        this._listeners.register(WebInspector.debuggerManager, WebInspector.DebuggerManager.Event.BreakpointsEnabledDidChange, this._updateStatus);

        this._listeners.register(WebInspector.probeManager, WebInspector.ProbeManager.Event.ProbeSetAdded, this._probeSetAdded);
        this._listeners.register(WebInspector.probeManager, WebInspector.ProbeManager.Event.ProbeSetRemoved, this._probeSetRemoved);

        this._statusImageElement = document.createElement("img");
        this._statusImageElement.className = WebInspector.BreakpointTreeElement.StatusImageElementStyleClassName;
        this._listeners.register(this._statusImageElement, "mousedown", this._statusImageElementMouseDown);
        this._listeners.register(this._statusImageElement, "click", this._statusImageElementClicked);

        if (!title) this._updateTitles();
        this._updateStatus();

        this.status = this._statusImageElement;
        this.small = true;

        this._iconAnimationLayerElement = document.createElement("span");
        this.iconElement.appendChild(this._iconAnimationLayerElement);
    }

    // Public

    _createClass(BreakpointTreeElement, [{
        key: "ondelete",
        value: function ondelete() {
            if (!WebInspector.debuggerManager.isBreakpointRemovable(this._breakpoint)) return false;

            WebInspector.debuggerManager.removeBreakpoint(this._breakpoint);
            return true;
        }
    }, {
        key: "onenter",
        value: function onenter() {
            this._breakpoint.cycleToNextMode();
            return true;
        }
    }, {
        key: "onspace",
        value: function onspace() {
            this._breakpoint.cycleToNextMode();
            return true;
        }
    }, {
        key: "oncontextmenu",
        value: function oncontextmenu(event) {
            var contextMenu = new WebInspector.ContextMenu(event);
            WebInspector.breakpointPopoverController.appendContextMenuItems(contextMenu, this._breakpoint, this._statusImageElement);
            contextMenu.show();
        }
    }, {
        key: "onattach",
        value: function onattach() {
            _get(Object.getPrototypeOf(BreakpointTreeElement.prototype), "onattach", this).call(this);

            this._listeners.install();

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = WebInspector.probeManager.probeSets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var probeSet = _step.value;

                    if (probeSet.breakpoint === this._breakpoint) this._addProbeSet(probeSet);
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
        }
    }, {
        key: "ondetach",
        value: function ondetach() {
            _get(Object.getPrototypeOf(BreakpointTreeElement.prototype), "ondetach", this).call(this);

            this._listeners.uninstall();

            if (this._probeSet) this._removeProbeSet(this._probeSet);
        }
    }, {
        key: "removeStatusImage",
        value: function removeStatusImage() {
            this._statusImageElement.remove();
            this._statusImageElement = null;
        }

        // Private

    }, {
        key: "_updateTitles",
        value: function _updateTitles() {
            var sourceCodeLocation = this._breakpoint.sourceCodeLocation;

            var displayLineNumber = sourceCodeLocation.displayLineNumber;
            var displayColumnNumber = sourceCodeLocation.displayColumnNumber;
            if (displayColumnNumber > 0) this.mainTitle = WebInspector.UIString("Line %d:%d").format(displayLineNumber + 1, displayColumnNumber + 1); // The user visible line and column numbers are 1-based.
            else this.mainTitle = WebInspector.UIString("Line %d").format(displayLineNumber + 1); // The user visible line number is 1-based.

            if (sourceCodeLocation.hasMappedLocation()) {
                this.subtitle = sourceCodeLocation.formattedLocationString();

                if (sourceCodeLocation.hasFormattedLocation()) this.subtitleElement.classList.add(WebInspector.BreakpointTreeElement.FormattedLocationStyleClassName);else this.subtitleElement.classList.remove(WebInspector.BreakpointTreeElement.FormattedLocationStyleClassName);

                this.tooltip = this.mainTitle + " — " + WebInspector.UIString("originally %s").format(sourceCodeLocation.originalLocationString());
            }
        }
    }, {
        key: "_updateStatus",
        value: function _updateStatus() {
            if (!this._statusImageElement) return;

            if (this._breakpoint.disabled) this._statusImageElement.classList.add(WebInspector.BreakpointTreeElement.StatusImageDisabledStyleClassName);else this._statusImageElement.classList.remove(WebInspector.BreakpointTreeElement.StatusImageDisabledStyleClassName);

            if (this._breakpoint.autoContinue) this._statusImageElement.classList.add(WebInspector.BreakpointTreeElement.StatusImageAutoContinueStyleClassName);else this._statusImageElement.classList.remove(WebInspector.BreakpointTreeElement.StatusImageAutoContinueStyleClassName);

            if (this._breakpoint.resolved && WebInspector.debuggerManager.breakpointsEnabled) this._statusImageElement.classList.add(WebInspector.BreakpointTreeElement.StatusImageResolvedStyleClassName);else this._statusImageElement.classList.remove(WebInspector.BreakpointTreeElement.StatusImageResolvedStyleClassName);
        }
    }, {
        key: "_addProbeSet",
        value: function _addProbeSet(probeSet) {
            console.assert(probeSet instanceof WebInspector.ProbeSet);
            console.assert(probeSet.breakpoint === this._breakpoint);
            console.assert(probeSet !== this._probeSet);

            this._probeSet = probeSet;
            probeSet.addEventListener(WebInspector.ProbeSet.Event.SamplesCleared, this._samplesCleared, this);
            probeSet.dataTable.addEventListener(WebInspector.ProbeSetDataTable.Event.FrameInserted, this._dataUpdated, this);
        }
    }, {
        key: "_removeProbeSet",
        value: function _removeProbeSet(probeSet) {
            console.assert(probeSet instanceof WebInspector.ProbeSet);
            console.assert(probeSet === this._probeSet);

            probeSet.removeEventListener(WebInspector.ProbeSet.Event.SamplesCleared, this._samplesCleared, this);
            probeSet.dataTable.removeEventListener(WebInspector.ProbeSetDataTable.Event.FrameInserted, this._dataUpdated, this);
            delete this._probeSet;
        }
    }, {
        key: "_probeSetAdded",
        value: function _probeSetAdded(event) {
            var probeSet = event.data.probeSet;
            if (probeSet.breakpoint === this._breakpoint) this._addProbeSet(probeSet);
        }
    }, {
        key: "_probeSetRemoved",
        value: function _probeSetRemoved(event) {
            var probeSet = event.data.probeSet;
            if (probeSet.breakpoint === this._breakpoint) this._removeProbeSet(probeSet);
        }
    }, {
        key: "_samplesCleared",
        value: function _samplesCleared(event) {
            console.assert(this._probeSet);

            var oldTable = event.data.oldTable;
            oldTable.removeEventListener(WebInspector.ProbeSetDataTable.Event.FrameInserted, this._dataUpdated, this);
            this._probeSet.dataTable.addEventListener(WebInspector.ProbeSetDataTable.Event.FrameInserted, this._dataUpdated, this);
        }
    }, {
        key: "_dataUpdated",
        value: function _dataUpdated() {
            if (this.element.classList.contains(WebInspector.BreakpointTreeElement.ProbeDataUpdatedStyleClassName)) {
                clearTimeout(this._removeIconAnimationTimeoutIdentifier);
                this.element.classList.remove(WebInspector.BreakpointTreeElement.ProbeDataUpdatedStyleClassName);
                // We want to restart the animation, which can only be done by removing the class,
                // performing layout, and re-adding the class. Try adding class back on next run loop.
                window.requestAnimationFrame(this._dataUpdated.bind(this));
                return;
            }

            this.element.classList.add(WebInspector.BreakpointTreeElement.ProbeDataUpdatedStyleClassName);
            this._removeIconAnimationTimeoutIdentifier = setTimeout((function () {
                this.element.classList.remove(WebInspector.BreakpointTreeElement.ProbeDataUpdatedStyleClassName);
            }).bind(this), WebInspector.BreakpointTreeElement.ProbeDataUpdatedAnimationDuration);
        }
    }, {
        key: "_breakpointLocationDidChange",
        value: function _breakpointLocationDidChange(event) {
            console.assert(event.target === this._breakpoint);

            // The Breakpoint has a new display SourceCode. The sidebar will remove us, and ondetach() will clear listeners.
            if (event.data.oldDisplaySourceCode === this._breakpoint.displaySourceCode) return;

            this._updateTitles();
        }
    }, {
        key: "_statusImageElementMouseDown",
        value: function _statusImageElementMouseDown(event) {
            // To prevent the tree element from selecting.
            event.stopPropagation();
        }
    }, {
        key: "_statusImageElementClicked",
        value: function _statusImageElementClicked(event) {
            this._breakpoint.cycleToNextMode();
        }
    }, {
        key: "breakpoint",
        get: function get() {
            return this._breakpoint;
        }
    }, {
        key: "filterableData",
        get: function get() {
            return { text: this.breakpoint.url };
        }
    }]);

    return BreakpointTreeElement;
})(WebInspector.DebuggerTreeElement);

WebInspector.BreakpointTreeElement.GenericLineIconStyleClassName = "breakpoint-generic-line-icon";
WebInspector.BreakpointTreeElement.StatusImageElementStyleClassName = "status-image";
WebInspector.BreakpointTreeElement.StatusImageResolvedStyleClassName = "resolved";
WebInspector.BreakpointTreeElement.StatusImageAutoContinueStyleClassName = "auto-continue";
WebInspector.BreakpointTreeElement.StatusImageDisabledStyleClassName = "disabled";
WebInspector.BreakpointTreeElement.FormattedLocationStyleClassName = "formatted-location";
WebInspector.BreakpointTreeElement.ProbeDataUpdatedStyleClassName = "data-updated";

WebInspector.BreakpointTreeElement.ProbeDataUpdatedAnimationDuration = 400; // milliseconds
