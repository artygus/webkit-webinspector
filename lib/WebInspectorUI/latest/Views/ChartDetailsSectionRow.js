var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2015 Apple Inc. All rights reserved.
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

WebInspector.ChartDetailsSectionRow = (function (_WebInspector$DetailsSectionRow) {
    _inherits(ChartDetailsSectionRow, _WebInspector$DetailsSectionRow);

    function ChartDetailsSectionRow(delegate, chartSize, innerRadiusRatio) {
        _classCallCheck(this, ChartDetailsSectionRow);

        _get(Object.getPrototypeOf(ChartDetailsSectionRow.prototype), "constructor", this).call(this, WebInspector.UIString("No Chart Available"));

        innerRadiusRatio = innerRadiusRatio || 0;
        console.assert(chartSize > 0, chartSize);
        console.assert(innerRadiusRatio >= 0 && innerRadiusRatio < 1, innerRadiusRatio);

        this.element.classList.add("chart");

        this._titleElement = document.createElement("div");
        this._titleElement.className = "title";
        this.element.appendChild(this._titleElement);

        var chartContentElement = document.createElement("div");
        chartContentElement.className = "chart-content";
        this.element.appendChild(chartContentElement);

        this._chartElement = createSVGElement("svg");
        chartContentElement.appendChild(this._chartElement);

        this._legendElement = document.createElement("div");
        this._legendElement.className = "legend";
        chartContentElement.appendChild(this._legendElement);

        this._delegate = delegate;
        this._items = new Map();
        this._title = "";
        this._chartSize = chartSize;
        this._radius = this._chartSize / 2 - 1; // Subtract one to accomodate chart stroke width.
        this._innerRadius = innerRadiusRatio ? Math.floor(this._radius * innerRadiusRatio) : 0;
        this._total = 0;

        this._svgFiltersElement = document.createElement("svg");
        this._svgFiltersElement.classList.add("defs-only");
        this.element.append(this._svgFiltersElement);

        this._checkboxStyleElement = document.createElement("style");
        this._checkboxStyleElement.id = "checkbox-styles";
        document.getElementsByTagName("head")[0].append(this._checkboxStyleElement);

        function createEmptyChartPathData(c, r1, r2) {
            var a1 = 0;
            var a2 = Math.PI * 1.9999;
            var x1 = c + Math.cos(a1) * r1,
                y1 = c + Math.sin(a1) * r1,
                x2 = c + Math.cos(a2) * r1,
                y2 = c + Math.sin(a2) * r1,
                x3 = c + Math.cos(a2) * r2,
                y3 = c + Math.sin(a2) * r2,
                x4 = c + Math.cos(a1) * r2,
                y4 = c + Math.sin(a1) * r2;
            return ["M", x1, y1, // Starting position.
            "A", r1, r1, 0, 1, 1, x2, y2, // Draw outer arc.
            "Z", // Close path.
            "M", x3, y3, // Starting position.
            "A", r2, r2, 0, 1, 0, x4, y4, // Draw inner arc.
            "Z" // Close path.
            ].join(" ");
        }

        this._emptyChartPath = createSVGElement("path");
        this._emptyChartPath.setAttribute("d", createEmptyChartPathData(this._chartSize / 2, this._radius, this._innerRadius));
        this._emptyChartPath.classList.add("empty-chart");
        this._chartElement.appendChild(this._emptyChartPath);
    }

    // Public

    _createClass(ChartDetailsSectionRow, [{
        key: "addItem",
        value: function addItem(id, label, value, color, checkbox, checked) {
            console.assert(!this._items.has(id), "Already added item with id: " + id);
            if (this._items.has(id)) return;

            console.assert(value >= 0, "Value cannot be negative.");
            if (value < 0) return;

            this._items.set(id, { label: label, value: value, color: color, checkbox: checkbox, checked: checked });
            this._total += value;

            this._needsLayout();
        }
    }, {
        key: "setItemValue",
        value: function setItemValue(id, value) {
            var item = this._items.get(id);
            console.assert(item, "Cannot set value for invalid item id: " + id);
            if (!item) return;

            console.assert(value >= 0, "Value cannot be negative.");
            if (value < 0) return;

            if (item.value === value) return;

            this._total += value - item.value;
            item.value = value;

            this._needsLayout();
        }
    }, {
        key: "clearItems",
        value: function clearItems() {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._items.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var item = _step.value;

                    var path = item[WebInspector.ChartDetailsSectionRow.ChartSegmentPathSymbol];
                    if (path) path.remove();
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

            this._total = 0;
            this._items.clear();

            this._needsLayout();
        }

        // Private

    }, {
        key: "_addCheckboxColorFilter",
        value: function _addCheckboxColorFilter(id, r, g, b) {
            for (var i = 0; i < this._svgFiltersElement.childNodes.length; ++i) {
                if (this._svgFiltersElement.childNodes[i].id === id) return;
            }

            r /= 255;
            b /= 255;
            g /= 255;

            // Create an svg:filter element that approximates "background-blend-mode: color", for grayscale input.
            var filterElement = createSVGElement("filter");
            filterElement.id = id;
            filterElement.setAttribute("color-interpolation-filters", "sRGB");

            var values = [1 - r, 0, 0, 0, r, 1 - g, 0, 0, 0, g, 1 - b, 0, 0, 0, b, 0, 0, 0, 1, 0];

            var colorMatrixPrimitive = createSVGElement("feColorMatrix");
            colorMatrixPrimitive.setAttribute("type", "matrix");
            colorMatrixPrimitive.setAttribute("values", values.join(" "));

            function createGammaPrimitive(tagName, value) {
                var gammaPrimitive = createSVGElement(tagName);
                gammaPrimitive.setAttribute("type", "gamma");
                gammaPrimitive.setAttribute("exponent", value);
                return gammaPrimitive;
            }

            var componentTransferPrimitive = createSVGElement("feComponentTransfer");
            componentTransferPrimitive.append(createGammaPrimitive("feFuncR", 1.4), createGammaPrimitive("feFuncG", 1.4), createGammaPrimitive("feFuncB", 1.4));
            filterElement.append(colorMatrixPrimitive, componentTransferPrimitive);

            this._svgFiltersElement.append(filterElement);

            var styleSheet = this._checkboxStyleElement.sheet;
            styleSheet.insertRule(".details-section > .content > .group > .row.chart > .chart-content > .legend > .legend-item > label > input[type=checkbox]." + id + " { filter: grayscale(1) url(#" + id + ") }", 0);
        }
    }, {
        key: "_updateLegend",
        value: function _updateLegend() {
            if (!this._items.size) {
                this._legendElement.removeChildren();
                return;
            }

            function formatItemValue(item) {
                if (this._delegate && typeof this._delegate.formatChartValue === "function") return this._delegate.formatChartValue(item.value);
                return item.value;
            }

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._items[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _step2$value = _slicedToArray(_step2.value, 2);

                    var id = _step2$value[0];
                    var item = _step2$value[1];

                    if (item[WebInspector.ChartDetailsSectionRow.LegendItemValueElementSymbol]) {
                        var _valueElement = item[WebInspector.ChartDetailsSectionRow.LegendItemValueElementSymbol];
                        _valueElement.textContent = formatItemValue.call(this, item);
                        continue;
                    }

                    var labelElement = document.createElement("label");
                    var keyElement = undefined;
                    if (item.checkbox) {
                        var className = id.toLowerCase();
                        var rgb = item.color.substring(4, item.color.length - 1).replace(/ /g, "").split(",");
                        if (rgb[0] === rgb[1] && rgb[1] === rgb[2]) rgb[0] = rgb[1] = rgb[2] = Math.min(160, rgb[0]);

                        keyElement = document.createElement("input");
                        keyElement.type = "checkbox";
                        keyElement.classList.add(className);
                        keyElement.checked = item.checked;
                        keyElement[WebInspector.ChartDetailsSectionRow.DataItemIdSymbol] = id;

                        keyElement.addEventListener("change", this._legendItemCheckboxValueChanged.bind(this));

                        this._addCheckboxColorFilter(className, rgb[0], rgb[1], rgb[2]);
                    } else {
                        keyElement = document.createElement("div");
                        keyElement.classList.add("color-key");
                        keyElement.style.backgroundColor = item.color;
                    }

                    labelElement.append(keyElement, item.label);

                    var valueElement = document.createElement("div");
                    valueElement.classList.add("value");
                    valueElement.textContent = formatItemValue.call(this, item);

                    item[WebInspector.ChartDetailsSectionRow.LegendItemValueElementSymbol] = valueElement;

                    var legendItemElement = document.createElement("div");
                    legendItemElement.classList.add("legend-item");
                    legendItemElement.append(labelElement, valueElement);

                    this._legendElement.append(legendItemElement);
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
        }
    }, {
        key: "_legendItemCheckboxValueChanged",
        value: function _legendItemCheckboxValueChanged(event) {
            var checkbox = event.target;
            var id = checkbox[WebInspector.ChartDetailsSectionRow.DataItemIdSymbol];
            this.dispatchEventToListeners(WebInspector.ChartDetailsSectionRow.Event.LegendItemChecked, { id: id, checked: checkbox.checked });
        }
    }, {
        key: "_needsLayout",
        value: function _needsLayout() {
            if (this._scheduledLayoutUpdateIdentifier) return;

            this._scheduledLayoutUpdateIdentifier = requestAnimationFrame(this._updateLayout.bind(this));
        }
    }, {
        key: "_updateLayout",
        value: function _updateLayout() {
            if (this._scheduledLayoutUpdateIdentifier) {
                cancelAnimationFrame(this._scheduledLayoutUpdateIdentifier);
                this._scheduledLayoutUpdateIdentifier = undefined;
            }

            this._updateLegend();

            this._chartElement.setAttribute("width", this._chartSize);
            this._chartElement.setAttribute("height", this._chartSize);
            this._chartElement.setAttribute("viewbox", "0 0 " + this._chartSize + " " + this._chartSize);

            function createSegmentPathData(c, a1, a2, r1, r2) {
                var largeArcFlag = (a2 - a1) % (Math.PI * 2) > Math.PI ? 1 : 0;
                var x1 = c + Math.cos(a1) * r1,
                    y1 = c + Math.sin(a1) * r1,
                    x2 = c + Math.cos(a2) * r1,
                    y2 = c + Math.sin(a2) * r1,
                    x3 = c + Math.cos(a2) * r2,
                    y3 = c + Math.sin(a2) * r2,
                    x4 = c + Math.cos(a1) * r2,
                    y4 = c + Math.sin(a1) * r2;
                return ["M", x1, y1, // Starting position.
                "A", r1, r1, 0, largeArcFlag, 1, x2, y2, // Draw outer arc.
                "L", x3, y3, // Connect outer and innner arcs.
                "A", r2, r2, 0, largeArcFlag, 0, x4, y4, // Draw inner arc.
                "Z" // Close path.
                ].join(" ");
            }

            // Balance item values so that all non-zero chart segments are visible.
            var minimumDisplayValue = this._total * 0.015;

            var items = [];
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this._items.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var item = _step3.value;

                    item.displayValue = item.value ? Math.max(minimumDisplayValue, item.value) : 0;
                    if (item.displayValue) items.push(item);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                        _iterator3["return"]();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            if (items.length > 1) {
                items.sort(function (a, b) {
                    return a.value - b.value;
                });

                var largeItemCount = items.length;
                var totalAdjustedValue = 0;
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = items[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var item = _step4.value;

                        if (item.value < minimumDisplayValue) {
                            totalAdjustedValue += minimumDisplayValue - item.value;
                            largeItemCount--;
                            continue;
                        }

                        if (!totalAdjustedValue || !largeItemCount) break;

                        var donatedValue = totalAdjustedValue / largeItemCount;
                        if (item.displayValue - donatedValue >= minimumDisplayValue) {
                            item.displayValue -= donatedValue;
                            totalAdjustedValue -= donatedValue;
                        }

                        largeItemCount--;
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
                            _iterator4["return"]();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
                        }
                    }
                }
            }

            var center = this._chartSize / 2;
            var startAngle = -Math.PI / 2;
            var endAngle = 0;
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this._items[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var _step5$value = _slicedToArray(_step5.value, 2);

                    var id = _step5$value[0];
                    var item = _step5$value[1];

                    var path = item[WebInspector.ChartDetailsSectionRow.ChartSegmentPathSymbol];
                    if (!path) {
                        path = createSVGElement("path");
                        path.classList.add("chart-segment");
                        path.setAttribute("fill", item.color);
                        this._chartElement.appendChild(path);

                        item[WebInspector.ChartDetailsSectionRow.ChartSegmentPathSymbol] = path;
                    }

                    if (!item.value) {
                        path.classList.add("hidden");
                        continue;
                    }

                    var angle = item.displayValue / this._total * Math.PI * 2;
                    endAngle = startAngle + angle;

                    path.setAttribute("d", createSegmentPathData(center, startAngle, endAngle, this._radius, this._innerRadius));
                    path.classList.remove("hidden");

                    startAngle = endAngle;
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
                        _iterator5["return"]();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }
        }
    }, {
        key: "chartSize",
        get: function get() {
            return this._chartSize;
        }
    }, {
        key: "title",
        set: function set(title) {
            if (this._title === title) return;

            this._title = title;
            this._titleElement.textContent = title;
        }
    }, {
        key: "total",
        get: function get() {
            return this._total;
        }
    }]);

    return ChartDetailsSectionRow;
})(WebInspector.DetailsSectionRow);

WebInspector.ChartDetailsSectionRow.DataItemIdSymbol = Symbol("chart-details-section-row-data-item-id");
WebInspector.ChartDetailsSectionRow.ChartSegmentPathSymbol = Symbol("chart-details-section-row-chart-segment-path");
WebInspector.ChartDetailsSectionRow.LegendItemValueElementSymbol = Symbol("chart-details-section-row-legend-item-value-element");

WebInspector.ChartDetailsSectionRow.Event = {
    LegendItemChecked: "chart-details-section-row-legend-item-checked"
};
