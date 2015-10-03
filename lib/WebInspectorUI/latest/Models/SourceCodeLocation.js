var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2013 Apple Inc. All rights reserved.
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

WebInspector.SourceCodeLocation = (function (_WebInspector$Object) {
    _inherits(SourceCodeLocation, _WebInspector$Object);

    function SourceCodeLocation(sourceCode, lineNumber, columnNumber) {
        _classCallCheck(this, SourceCodeLocation);

        _get(Object.getPrototypeOf(SourceCodeLocation.prototype), "constructor", this).call(this);

        console.assert(sourceCode === null || sourceCode instanceof WebInspector.SourceCode);
        console.assert(!(sourceCode instanceof WebInspector.SourceMapResource));
        console.assert(typeof lineNumber === "number" && !isNaN(lineNumber) && lineNumber >= 0);
        console.assert(typeof columnNumber === "number" && !isNaN(columnNumber) && columnNumber >= 0);

        this._sourceCode = sourceCode || null;
        this._lineNumber = lineNumber;
        this._columnNumber = columnNumber;
        this._resolveFormattedLocation();

        if (this._sourceCode) {
            this._sourceCode.addEventListener(WebInspector.SourceCode.Event.SourceMapAdded, this._sourceCodeSourceMapAdded, this);
            this._sourceCode.addEventListener(WebInspector.SourceCode.Event.FormatterDidChange, this._sourceCodeFormatterDidChange, this);
        }

        this._resetMappedLocation();
    }

    // Public

    _createClass(SourceCodeLocation, [{
        key: "isEqual",
        value: function isEqual(other) {
            if (!other) return false;
            return this._sourceCode === other._sourceCode && this._lineNumber === other._lineNumber && this._columnNumber === other._columnNumber;
        }
    }, {
        key: "position",
        value: function position() {
            return new WebInspector.SourceCodePosition(this.lineNumber, this.columnNumber);
        }

        // Formatted line and column if the original source code is pretty printed.
        // This is the same as the raw location if there is no formatter.

    }, {
        key: "formattedPosition",
        value: function formattedPosition() {
            return new WebInspector.SourceCodePosition(this.formattedLineNumber, this.formattedColumnNumber);
        }

        // Display line and column:
        //   - Mapped line and column if the original source code has a source map.
        //   - Otherwise this is the formatted / raw line and column.

    }, {
        key: "displayPosition",
        value: function displayPosition() {
            return new WebInspector.SourceCodePosition(this.displayLineNumber, this.displayColumnNumber);
        }

        // User presentable location strings: "file:lineNumber:columnNumber".

    }, {
        key: "originalLocationString",
        value: function originalLocationString(columnStyle, nameStyle, prefix) {
            return this._locationString(this.sourceCode, this.lineNumber, this.columnNumber, columnStyle, nameStyle, prefix);
        }
    }, {
        key: "formattedLocationString",
        value: function formattedLocationString(columnStyle, nameStyle, prefix) {
            return this._locationString(this.sourceCode, this.formattedLineNumber, this.formattedColumn, columnStyle, nameStyle, prefix);
        }
    }, {
        key: "displayLocationString",
        value: function displayLocationString(columnStyle, nameStyle, prefix) {
            return this._locationString(this.displaySourceCode, this.displayLineNumber, this.displayColumnNumber, columnStyle, nameStyle, prefix);
        }
    }, {
        key: "tooltipString",
        value: function tooltipString() {
            if (!this.hasDifferentDisplayLocation()) return this.originalLocationString(WebInspector.SourceCodeLocation.ColumnStyle.Shown, WebInspector.SourceCodeLocation.NameStyle.Full);

            var tooltip = WebInspector.UIString("Located at %s").format(this.displayLocationString(WebInspector.SourceCodeLocation.ColumnStyle.Shown, WebInspector.SourceCodeLocation.NameStyle.Full));
            tooltip += "\n" + WebInspector.UIString("Originally %s").format(this.originalLocationString(WebInspector.SourceCodeLocation.ColumnStyle.Shown, WebInspector.SourceCodeLocation.NameStyle.Full));
            return tooltip;
        }
    }, {
        key: "hasMappedLocation",
        value: function hasMappedLocation() {
            this.resolveMappedLocation();
            return this._mappedResource !== null;
        }
    }, {
        key: "hasFormattedLocation",
        value: function hasFormattedLocation() {
            return this._formattedLineNumber !== this._lineNumber || this._formattedColumnNumber !== this._columnNumber;
        }
    }, {
        key: "hasDifferentDisplayLocation",
        value: function hasDifferentDisplayLocation() {
            return this.hasMappedLocation() || this.hasFormattedLocation();
        }
    }, {
        key: "update",
        value: function update(sourceCode, lineNumber, columnNumber) {
            console.assert(sourceCode === this._sourceCode || this._mappedResource && sourceCode === this._mappedResource);
            console.assert(typeof lineNumber === "number" && !isNaN(lineNumber) && lineNumber >= 0);
            console.assert(typeof columnNumber === "number" && !isNaN(columnNumber) && columnNumber >= 0);

            if (sourceCode === this._sourceCode && lineNumber === this._lineNumber && columnNumber === this._columnNumber) return;
            if (this._mappedResource && sourceCode === this._mappedResource && lineNumber === this._mappedLineNumber && columnNumber === this._mappedColumnNumber) return;

            var newSourceCodeLocation = sourceCode.createSourceCodeLocation(lineNumber, columnNumber);
            console.assert(newSourceCodeLocation.sourceCode === this._sourceCode);

            this._makeChangeAndDispatchChangeEventIfNeeded(function () {
                this._lineNumber = newSourceCodeLocation._lineNumber;
                this._columnNumber = newSourceCodeLocation._columnNumber;
                if (newSourceCodeLocation._mappedLocationIsResolved) {
                    this._mappedLocationIsResolved = true;
                    this._mappedResource = newSourceCodeLocation._mappedResource;
                    this._mappedLineNumber = newSourceCodeLocation._mappedLineNumber;
                    this._mappedColumnNumber = newSourceCodeLocation._mappedColumnNumber;
                }
            });
        }
    }, {
        key: "populateLiveDisplayLocationTooltip",
        value: function populateLiveDisplayLocationTooltip(element, prefix) {
            prefix = prefix || "";

            element.title = prefix + this.tooltipString();

            this.addEventListener(WebInspector.SourceCodeLocation.Event.DisplayLocationChanged, function (event) {
                if (this.sourceCode) element.title = prefix + this.tooltipString();
            }, this);
        }
    }, {
        key: "populateLiveDisplayLocationString",
        value: function populateLiveDisplayLocationString(element, propertyName, columnStyle, nameStyle, prefix) {
            var currentDisplay;

            function updateDisplayString(showAlternativeLocation, forceUpdate) {
                if (!forceUpdate && currentDisplay === showAlternativeLocation) return;

                currentDisplay = showAlternativeLocation;

                if (!showAlternativeLocation) {
                    element[propertyName] = this.displayLocationString(columnStyle, nameStyle, prefix);
                    element.classList.toggle(WebInspector.SourceCodeLocation.DisplayLocationClassName, this.hasDifferentDisplayLocation());
                } else if (this.hasDifferentDisplayLocation()) {
                    element[propertyName] = this.originalLocationString(columnStyle, nameStyle, prefix);
                    element.classList.remove(WebInspector.SourceCodeLocation.DisplayLocationClassName);
                }
            }

            function mouseOverOrMove(event) {
                updateDisplayString.call(this, event.metaKey && !event.altKey && !event.shiftKey);
            }

            updateDisplayString.call(this, false);

            this.addEventListener(WebInspector.SourceCodeLocation.Event.DisplayLocationChanged, function (event) {
                if (this.sourceCode) updateDisplayString.call(this, currentDisplay, true);
            }, this);

            var boundMouseOverOrMove = mouseOverOrMove.bind(this);
            element.addEventListener("mouseover", boundMouseOverOrMove);
            element.addEventListener("mousemove", boundMouseOverOrMove);

            element.addEventListener("mouseout", (function (event) {
                updateDisplayString.call(this, false);
            }).bind(this));
        }

        // Protected

    }, {
        key: "setSourceCode",
        value: function setSourceCode(sourceCode) {
            console.assert(this._sourceCode === null && sourceCode instanceof WebInspector.SourceCode || this._sourceCode instanceof WebInspector.SourceCode && sourceCode === null);

            if (sourceCode === this._sourceCode) return;

            this._makeChangeAndDispatchChangeEventIfNeeded(function () {
                if (this._sourceCode) {
                    this._sourceCode.removeEventListener(WebInspector.SourceCode.Event.SourceMapAdded, this._sourceCodeSourceMapAdded, this);
                    this._sourceCode.removeEventListener(WebInspector.SourceCode.Event.FormatterDidChange, this._sourceCodeFormatterDidChange, this);
                }

                this._sourceCode = sourceCode;

                if (this._sourceCode) {
                    this._sourceCode.addEventListener(WebInspector.SourceCode.Event.SourceMapAdded, this._sourceCodeSourceMapAdded, this);
                    this._sourceCode.addEventListener(WebInspector.SourceCode.Event.FormatterDidChange, this._sourceCodeFormatterDidChange, this);
                }
            });
        }
    }, {
        key: "resolveMappedLocation",
        value: function resolveMappedLocation() {
            if (this._mappedLocationIsResolved) return;

            console.assert(this._mappedResource === null);
            console.assert(isNaN(this._mappedLineNumber));
            console.assert(isNaN(this._mappedColumnNumber));

            this._mappedLocationIsResolved = true;

            if (!this._sourceCode) return;

            var sourceMaps = this._sourceCode.sourceMaps;
            if (!sourceMaps.length) return;

            for (var i = 0; i < sourceMaps.length; ++i) {
                var sourceMap = sourceMaps[i];
                var entry = sourceMap.findEntry(this._lineNumber, this._columnNumber);
                if (!entry || entry.length === 2) continue;
                console.assert(entry.length === 5);
                var url = entry[2];
                var sourceMapResource = sourceMap.resourceForURL(url);
                if (!sourceMapResource) return;
                this._mappedResource = sourceMapResource;
                this._mappedLineNumber = entry[3];
                this._mappedColumnNumber = entry[4];
                return;
            }
        }

        // Private

    }, {
        key: "_locationString",
        value: function _locationString(sourceCode, lineNumber, columnNumber, columnStyle, nameStyle, prefix) {
            console.assert(sourceCode);
            if (!sourceCode) return "";

            columnStyle = columnStyle || WebInspector.SourceCodeLocation.ColumnStyle.OnlyIfLarge;
            nameStyle = nameStyle || WebInspector.SourceCodeLocation.NameStyle.Short;
            prefix = prefix || "";

            var lineString = lineNumber + 1; // The user visible line number is 1-based.
            if (columnStyle === WebInspector.SourceCodeLocation.ColumnStyle.Shown && columnNumber > 0) lineString += ":" + (columnNumber + 1); // The user visible column number is 1-based.
            else if (columnStyle === WebInspector.SourceCodeLocation.ColumnStyle.OnlyIfLarge && columnNumber > WebInspector.SourceCodeLocation.LargeColumnNumber) lineString += ":" + (columnNumber + 1); // The user visible column number is 1-based.

            switch (nameStyle) {
                case WebInspector.SourceCodeLocation.NameStyle.None:
                    return prefix + lineString;

                case WebInspector.SourceCodeLocation.NameStyle.Short:
                case WebInspector.SourceCodeLocation.NameStyle.Full:
                    var displayURL = sourceCode.displayURL;
                    var lineSuffix = displayURL ? ":" + lineString : WebInspector.UIString(" (line %s)").format(lineString);
                    return prefix + (nameStyle === WebInspector.SourceCodeLocation.NameStyle.Full && displayURL ? displayURL : sourceCode.displayName) + lineSuffix;

                default:
                    console.error("Unknown nameStyle: " + nameStyle);
                    return prefix + lineString;
            }
        }
    }, {
        key: "_resetMappedLocation",
        value: function _resetMappedLocation() {
            this._mappedLocationIsResolved = false;
            this._mappedResource = null;
            this._mappedLineNumber = NaN;
            this._mappedColumnNumber = NaN;
        }
    }, {
        key: "_setMappedLocation",
        value: function _setMappedLocation(mappedResource, mappedLineNumber, mappedColumnNumber) {
            // Called by SourceMapResource when it creates a SourceCodeLocation and already knows the resolved location.
            this._mappedLocationIsResolved = true;
            this._mappedResource = mappedResource;
            this._mappedLineNumber = mappedLineNumber;
            this._mappedColumnNumber = mappedColumnNumber;
        }
    }, {
        key: "_resolveFormattedLocation",
        value: function _resolveFormattedLocation() {
            if (this._sourceCode && this._sourceCode.formatterSourceMap) {
                var formattedLocation = this._sourceCode.formatterSourceMap.originalToFormatted(this._lineNumber, this._columnNumber);
                this._formattedLineNumber = formattedLocation.lineNumber;
                this._formattedColumnNumber = formattedLocation.columnNumber;
            } else {
                this._formattedLineNumber = this._lineNumber;
                this._formattedColumnNumber = this._columnNumber;
            }
        }
    }, {
        key: "_makeChangeAndDispatchChangeEventIfNeeded",
        value: function _makeChangeAndDispatchChangeEventIfNeeded(changeFunction) {
            var oldSourceCode = this._sourceCode;
            var oldLineNumber = this._lineNumber;
            var oldColumnNumber = this._columnNumber;

            var oldFormattedLineNumber = this._formattedLineNumber;
            var oldFormattedColumnNumber = this._formattedColumnNumber;

            var oldDisplaySourceCode = this.displaySourceCode;
            var oldDisplayLineNumber = this.displayLineNumber;
            var oldDisplayColumnNumber = this.displayColumnNumber;

            this._resetMappedLocation();

            if (changeFunction) changeFunction.call(this);

            this.resolveMappedLocation();
            this._resolveFormattedLocation();

            // If the display source code is non-null then the addresses are not NaN and can be compared.
            var displayLocationChanged = false;
            var newDisplaySourceCode = this.displaySourceCode;
            if (oldDisplaySourceCode !== newDisplaySourceCode) displayLocationChanged = true;else if (newDisplaySourceCode && (oldDisplayLineNumber !== this.displayLineNumber || oldDisplayColumnNumber !== this.displayColumnNumber)) displayLocationChanged = true;

            var anyLocationChanged = false;
            if (displayLocationChanged) anyLocationChanged = true;else if (oldSourceCode !== this._sourceCode) anyLocationChanged = true;else if (this._sourceCode && (oldLineNumber !== this._lineNumber || oldColumnNumber !== this._columnNumber)) anyLocationChanged = true;else if (this._sourceCode && (oldFormattedLineNumber !== this._formattedLineNumber || oldFormattedColumnNumber !== this._formattedColumnNumber)) anyLocationChanged = true;

            if (displayLocationChanged || anyLocationChanged) {
                var oldData = {
                    oldSourceCode: oldSourceCode,
                    oldLineNumber: oldLineNumber,
                    oldColumnNumber: oldColumnNumber,
                    oldFormattedLineNumber: oldFormattedLineNumber,
                    oldFormattedColumnNumber: oldFormattedColumnNumber,
                    oldDisplaySourceCode: oldDisplaySourceCode,
                    oldDisplayLineNumber: oldDisplayLineNumber,
                    oldDisplayColumnNumber: oldDisplayColumnNumber
                };
                if (displayLocationChanged) this.dispatchEventToListeners(WebInspector.SourceCodeLocation.Event.DisplayLocationChanged, oldData);
                if (anyLocationChanged) this.dispatchEventToListeners(WebInspector.SourceCodeLocation.Event.LocationChanged, oldData);
            }
        }
    }, {
        key: "_sourceCodeSourceMapAdded",
        value: function _sourceCodeSourceMapAdded() {
            this._makeChangeAndDispatchChangeEventIfNeeded(null);
        }
    }, {
        key: "_sourceCodeFormatterDidChange",
        value: function _sourceCodeFormatterDidChange() {
            this._makeChangeAndDispatchChangeEventIfNeeded(null);
        }
    }, {
        key: "sourceCode",
        get: function get() {
            return this._sourceCode;
        },
        set: function set(sourceCode) {
            this.setSourceCode(sourceCode);
        }

        // Raw line and column in the original source code.

    }, {
        key: "lineNumber",
        get: function get() {
            return this._lineNumber;
        }
    }, {
        key: "columnNumber",
        get: function get() {
            return this._columnNumber;
        }
    }, {
        key: "formattedLineNumber",
        get: function get() {
            return this._formattedLineNumber;
        }
    }, {
        key: "formattedColumnNumber",
        get: function get() {
            return this._formattedColumnNumber;
        }
    }, {
        key: "displaySourceCode",
        get: function get() {
            this.resolveMappedLocation();
            return this._mappedResource || this._sourceCode;
        }
    }, {
        key: "displayLineNumber",
        get: function get() {
            this.resolveMappedLocation();
            return isNaN(this._mappedLineNumber) ? this._formattedLineNumber : this._mappedLineNumber;
        }
    }, {
        key: "displayColumnNumber",
        get: function get() {
            this.resolveMappedLocation();
            return isNaN(this._mappedColumnNumber) ? this._formattedColumnNumber : this._mappedColumnNumber;
        }
    }]);

    return SourceCodeLocation;
})(WebInspector.Object);

WebInspector.SourceCodeLocation.DisplayLocationClassName = "display-location";

WebInspector.SourceCodeLocation.LargeColumnNumber = 80;

WebInspector.SourceCodeLocation.NameStyle = {
    None: "none", // File name not included.
    Short: "short", // Only the file name.
    Full: "full" // Full URL is used.
};

WebInspector.SourceCodeLocation.ColumnStyle = {
    Hidden: "hidden", // column numbers are not included.
    OnlyIfLarge: "only-if-large", // column numbers greater than 80 are shown.
    Shown: "shown" // non-zero column numbers are shown.
};

WebInspector.SourceCodeLocation.Event = {
    LocationChanged: "source-code-location-location-changed",
    DisplayLocationChanged: "source-code-location-display-location-changed"
};
