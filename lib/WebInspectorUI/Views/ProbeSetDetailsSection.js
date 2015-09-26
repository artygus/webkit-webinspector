var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2015 Apple Inc. All rights reserved.
 * Copyright (C) 2013 University of Washington. All rights reserved.
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

WebInspector.ProbeSetDetailsSection = (function (_WebInspector$DetailsSection) {
    _inherits(ProbeSetDetailsSection, _WebInspector$DetailsSection);

    function ProbeSetDetailsSection(probeSet) {
        _classCallCheck(this, ProbeSetDetailsSection);

        console.assert(probeSet instanceof WebInspector.ProbeSet, "Invalid ProbeSet argument:", probeSet);

        var optionsElement = document.createElement("div");
        optionsElement.classList.add(WebInspector.ProbeSetDetailsSection.SectionOptionsStyleClassName);

        var dataGrid = new WebInspector.ProbeSetDataGrid(probeSet);

        var singletonRow = new WebInspector.DetailsSectionRow();
        singletonRow.element.appendChild(dataGrid.element);

        var probeSectionGroup = new WebInspector.DetailsSectionGroup([singletonRow]);

        _get(Object.getPrototypeOf(ProbeSetDetailsSection.prototype), "constructor", this).call(this, "probe", "", [probeSectionGroup], optionsElement);

        this.element.classList.add("probe-set");

        this._optionsElement = optionsElement;

        this._listeners = new WebInspector.EventListenerSet(this, "ProbeSetDetailsSection UI listeners");
        this._probeSet = probeSet;
        this._dataGrid = dataGrid;

        var removeProbeButton = optionsElement.createChild("img");
        removeProbeButton.classList.add(WebInspector.ProbeSetDetailsSection.ProbeRemoveStyleClassName);
        removeProbeButton.classList.add(WebInspector.ProbeSetDetailsSection.ProbeButtonEnabledStyleClassName);
        this._listeners.register(removeProbeButton, "click", this._removeButtonClicked);

        var clearSamplesButton = optionsElement.createChild("img");
        clearSamplesButton.classList.add(WebInspector.ProbeSetDetailsSection.ProbeClearSamplesStyleClassName);
        clearSamplesButton.classList.add(WebInspector.ProbeSetDetailsSection.ProbeButtonEnabledStyleClassName);
        this._listeners.register(clearSamplesButton, "click", this._clearSamplesButtonClicked);

        var addProbeButton = optionsElement.createChild("img");
        addProbeButton.classList.add(WebInspector.ProbeSetDetailsSection.AddProbeValueStyleClassName);
        this._listeners.register(addProbeButton, "click", this._addProbeButtonClicked);

        // Update the source link when the breakpoint's resolved state changes,
        // so that it can become a live location link when possible.
        this._updateLinkElement();
        this._listeners.register(this._probeSet.breakpoint, WebInspector.Breakpoint.Event.ResolvedStateDidChange, this._updateLinkElement);

        this._listeners.install();
    }

    // Public

    _createClass(ProbeSetDetailsSection, [{
        key: "closed",
        value: function closed() {
            this._listeners.uninstall(true);
            this.element.remove();
        }

        // Private

    }, {
        key: "_updateLinkElement",
        value: function _updateLinkElement() {
            var breakpoint = this._probeSet.breakpoint;
            var titleElement = null;
            if (breakpoint.sourceCodeLocation.sourceCode) titleElement = WebInspector.createSourceCodeLocationLink(breakpoint.sourceCodeLocation);else {
                // Fallback for when we can't create a live source link.
                console.assert(!breakpoint.resolved);

                var location = breakpoint.sourceCodeLocation;
                titleElement = WebInspector.linkifyLocation(breakpoint.url, location.displayLineNumber, location.displayColumnNumber);
            }

            titleElement.classList.add(WebInspector.ProbeSetDetailsSection.DontFloatLinkStyleClassName);

            if (this._linkElement) this._optionsElement.removeChild(this._linkElement);

            this._linkElement = titleElement;
            this._optionsElement.appendChild(this._linkElement);
        }
    }, {
        key: "_addProbeButtonClicked",
        value: function _addProbeButtonClicked(event) {
            function createProbeFromEnteredExpression(visiblePopover, event) {
                if (event.keyCode !== 13) return;
                var expression = event.target.value;
                this._probeSet.createProbe(expression);
                visiblePopover.dismiss();
            }

            var popover = new WebInspector.Popover();
            var content = document.createElement("div");
            content.classList.add(WebInspector.ProbeSetDetailsSection.ProbePopoverElementStyleClassName);
            content.createChild("div").textContent = WebInspector.UIString("Add New Probe Expression");
            var textBox = content.createChild("input");
            textBox.addEventListener("keypress", createProbeFromEnteredExpression.bind(this, popover));
            textBox.addEventListener("click", function (event) {
                event.target.select();
            });
            textBox.type = "text";
            textBox.placeholder = WebInspector.UIString("Expression");
            popover.content = content;
            var target = WebInspector.Rect.rectFromClientRect(event.target.getBoundingClientRect());
            popover.present(target, [WebInspector.RectEdge.MAX_Y, WebInspector.RectEdge.MIN_Y, WebInspector.RectEdge.MAX_X]);
            textBox.select();
        }
    }, {
        key: "_removeButtonClicked",
        value: function _removeButtonClicked(event) {
            this._probeSet.clear();
        }
    }, {
        key: "_clearSamplesButtonClicked",
        value: function _clearSamplesButtonClicked(event) {
            this._probeSet.clearSamples();
        }
    }]);

    return ProbeSetDetailsSection;
})(WebInspector.DetailsSection);

WebInspector.ProbeSetDetailsSection.AddProbeValueStyleClassName = "probe-add";
WebInspector.ProbeSetDetailsSection.DontFloatLinkStyleClassName = "dont-float";
WebInspector.ProbeSetDetailsSection.ProbeButtonEnabledStyleClassName = "enabled";
WebInspector.ProbeSetDetailsSection.ProbePopoverElementStyleClassName = "probe-popover";
WebInspector.ProbeSetDetailsSection.ProbeClearSamplesStyleClassName = "probe-clear-samples";
WebInspector.ProbeSetDetailsSection.ProbeRemoveStyleClassName = "probe-remove";
WebInspector.ProbeSetDetailsSection.SectionOptionsStyleClassName = "options";
