var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

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

WebInspector.TimelineOverview = (function (_WebInspector$Object) {
    _inherits(TimelineOverview, _WebInspector$Object);

    function TimelineOverview(identifier, timelineRecording, minimumDurationPerPixel, maximumDurationPerPixel, defaultSettingsValues) {
        _classCallCheck(this, TimelineOverview);

        _get(Object.getPrototypeOf(TimelineOverview.prototype), "constructor", this).call(this);

        this._recording = timelineRecording;
        this._recording.addEventListener(WebInspector.TimelineRecording.Event.TimelineAdded, this._timelineAdded, this);
        this._recording.addEventListener(WebInspector.TimelineRecording.Event.TimelineRemoved, this._timelineRemoved, this);

        this._element = document.createElement("div");
        this._element.classList.add("timeline-overview", identifier);
        this._element.addEventListener("wheel", this._handleWheelEvent.bind(this));

        this._graphsContainerElement = document.createElement("div");
        this._graphsContainerElement.classList.add("graphs-container");
        this._element.appendChild(this._graphsContainerElement);

        this._timelineOverviewGraphsMap = new Map();

        this._timelineRuler = new WebInspector.TimelineRuler();
        this._timelineRuler.allowsClippedLabels = true;
        this._timelineRuler.allowsTimeRangeSelection = true;
        this._timelineRuler.element.addEventListener("mousedown", this._timelineRulerMouseDown.bind(this));
        this._timelineRuler.element.addEventListener("click", this._timelineRulerMouseClicked.bind(this));
        this._timelineRuler.addEventListener(WebInspector.TimelineRuler.Event.TimeRangeSelectionChanged, this._timeRangeSelectionChanged, this);
        this._element.appendChild(this._timelineRuler.element);

        this._currentTimeMarker = new WebInspector.TimelineMarker(0, WebInspector.TimelineMarker.Type.CurrentTime);
        this._timelineRuler.addMarker(this._currentTimeMarker);

        this._scrollContainerElement = document.createElement("div");
        this._scrollContainerElement.classList.add("scroll-container");
        this._scrollContainerElement.addEventListener("scroll", this._handleScrollEvent.bind(this));
        this._element.appendChild(this._scrollContainerElement);

        this._scrollWidthSizer = document.createElement("div");
        this._scrollWidthSizer.classList.add("scroll-width-sizer");
        this._scrollContainerElement.appendChild(this._scrollWidthSizer);

        this._defaultSettingsValues = defaultSettingsValues;
        this._durationPerPixelSetting = new WebInspector.Setting(identifier + "-timeline-overview-duration-per-pixel", this._defaultSettingsValues.durationPerPixel);
        this._selectionStartValueSetting = new WebInspector.Setting(identifier + "-timeline-overview-selection-start-value", this._defaultSettingsValues.selectionStartValue);
        this._selectionDurationSetting = new WebInspector.Setting(identifier + "-timeline-overview-selection-duration", this._defaultSettingsValues.selectionDuration);

        this._startTime = 0;
        this._currentTime = 0;
        this._revealCurrentTime = false;
        this._endTime = 0;
        this._minimumDurationPerPixel = minimumDurationPerPixel;
        this._maximumDurationPerPixel = maximumDurationPerPixel;
        this._durationPerPixel = Math.min(this._maximumDurationPerPixel, Math.max(this._minimumDurationPerPixel, this._durationPerPixelSetting.value));
        this._pixelAlignDuration = false;
        this._mouseWheelDelta = 0;
        this._scrollStartTime = 0;
        this._cachedScrollContainerWidth = NaN;
        this._timelineRulerSelectionChanged = false;

        this.selectionStartTime = this._selectionStartValueSetting.value;
        this.selectionDuration = this._selectionDurationSetting.value;

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = this._recording.timelines.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var timeline = _step.value;

                this._timelineAdded(timeline);
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

        if (!WebInspector.timelineManager.isCapturingPageReload()) this._resetSelection();
    }

    // Public

    _createClass(TimelineOverview, [{
        key: "shown",
        value: function shown() {
            this._visible = true;

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._timelineOverviewGraphsMap.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var timelineOverviewGraph = _step2.value;

                    timelineOverviewGraph.shown();
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

            this.updateLayout();
        }
    }, {
        key: "hidden",
        value: function hidden() {
            this._visible = false;

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this._timelineOverviewGraphsMap.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var timelineOverviewGraph = _step3.value;

                    timelineOverviewGraph.hidden();
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
        }
    }, {
        key: "reset",
        value: function reset() {
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this._timelineOverviewGraphsMap.values()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var timelineOverviewGraph = _step4.value;

                    timelineOverviewGraph.reset();
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

            this._mouseWheelDelta = 0;

            this._resetSelection();
        }
    }, {
        key: "addMarker",
        value: function addMarker(marker) {
            this._timelineRuler.addMarker(marker);
        }
    }, {
        key: "revealMarker",
        value: function revealMarker(marker) {
            this.scrollStartTime = marker.time - this.visibleDuration / 2;
        }
    }, {
        key: "recordWasFiltered",
        value: function recordWasFiltered(timeline, record, filtered) {
            console.assert(this.canShowTimeline(timeline), timeline);

            var overviewGraph = this._timelineOverviewGraphsMap.get(timeline);
            console.assert(overviewGraph, "Missing overview graph for timeline type " + timeline.type);
            if (!overviewGraph) return;

            overviewGraph.recordWasFiltered(record, filtered);
        }
    }, {
        key: "selectRecord",
        value: function selectRecord(timeline, record) {
            console.assert(this.canShowTimeline(timeline), timeline);

            var overviewGraph = this._timelineOverviewGraphsMap.get(timeline);
            console.assert(overviewGraph, "Missing overview graph for timeline type " + timeline.type);
            if (!overviewGraph) return;

            overviewGraph.selectedRecord = record;
        }
    }, {
        key: "updateLayoutForResize",
        value: function updateLayoutForResize() {
            this._cachedScrollContainerWidth = NaN;
            this.updateLayout();
        }
    }, {
        key: "updateLayout",
        value: function updateLayout() {
            if (this._scheduledLayoutUpdateIdentifier) {
                cancelAnimationFrame(this._scheduledLayoutUpdateIdentifier);
                delete this._scheduledLayoutUpdateIdentifier;
            }

            // Calculate the required width based on the duration and seconds per pixel.
            var duration = this._endTime - this._startTime;
            var newWidth = Math.ceil(duration / this._durationPerPixel);

            // Update all relevant elements to the new required width.
            this._updateElementWidth(this._scrollWidthSizer, newWidth);

            this._currentTimeMarker.time = this._currentTime;

            if (this._revealCurrentTime) {
                this.revealMarker(this._currentTimeMarker);
                this._revealCurrentTime = false;
            }

            var visibleDuration = this.visibleDuration;

            // Clamp the scroll start time to match what the scroll bar would allow.
            var scrollStartTime = Math.min(this._scrollStartTime, this._endTime - visibleDuration);
            scrollStartTime = Math.max(this._startTime, scrollStartTime);

            this._timelineRuler.zeroTime = this._startTime;
            this._timelineRuler.startTime = scrollStartTime;
            this._timelineRuler.secondsPerPixel = this._durationPerPixel;

            if (!this._dontUpdateScrollLeft) {
                this._ignoreNextScrollEvent = true;
                this._scrollContainerElement.scrollLeft = Math.ceil((scrollStartTime - this._startTime) / this._durationPerPixel);
            }

            this._timelineRuler.updateLayout();

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this._timelineOverviewGraphsMap.values()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var timelineOverviewGraph = _step5.value;

                    timelineOverviewGraph.zeroTime = this._startTime;
                    timelineOverviewGraph.startTime = scrollStartTime;
                    timelineOverviewGraph.currentTime = this._currentTime;
                    timelineOverviewGraph.endTime = scrollStartTime + visibleDuration;
                    timelineOverviewGraph.updateLayout();
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
        key: "updateLayoutIfNeeded",
        value: function updateLayoutIfNeeded() {
            if (this._scheduledLayoutUpdateIdentifier) {
                this.updateLayout();
                return;
            }

            this._timelineRuler.updateLayoutIfNeeded();

            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = this._timelineOverviewGraphsMap.values()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var timelineOverviewGraph = _step6.value;

                    timelineOverviewGraph.updateLayoutIfNeeded();
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6["return"]) {
                        _iterator6["return"]();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }
        }

        // Protected

    }, {
        key: "canShowTimeline",
        value: function canShowTimeline(timeline) {
            // Implemented by subclasses.
            console.error("Needs to be implemented by a subclass.");
        }

        // Private

    }, {
        key: "_updateElementWidth",
        value: function _updateElementWidth(element, newWidth) {
            var currentWidth = parseInt(element.style.width);
            if (currentWidth !== newWidth) element.style.width = newWidth + "px";
        }
    }, {
        key: "_needsLayout",
        value: function _needsLayout() {
            if (!this._visible) return;

            if (this._scheduledLayoutUpdateIdentifier) return;

            this._scheduledLayoutUpdateIdentifier = requestAnimationFrame(this.updateLayout.bind(this));
        }
    }, {
        key: "_handleScrollEvent",
        value: function _handleScrollEvent(event) {
            if (this._ignoreNextScrollEvent) {
                delete this._ignoreNextScrollEvent;
                return;
            }

            this._dontUpdateScrollLeft = true;

            var scrollOffset = this._scrollContainerElement.scrollLeft;
            this.scrollStartTime = this._startTime + scrollOffset * this._durationPerPixel;

            // Force layout so we can update with the scroll position synchronously.
            this.updateLayoutIfNeeded();

            delete this._dontUpdateScrollLeft;
        }
    }, {
        key: "_handleWheelEvent",
        value: function _handleWheelEvent(event) {
            // Ignore cloned events that come our way, we already handled the original.
            if (event.__cloned) return;

            // Require twice the vertical delta to overcome horizontal scrolling. This prevents most
            // cases of inadvertent zooming for slightly diagonal scrolls.
            if (Math.abs(event.deltaX) >= Math.abs(event.deltaY) * 0.5) {
                // Clone the event to dispatch it on the scroll container. Mark it as cloned so we don't get into a loop.
                var newWheelEvent = new event.constructor(event.type, event);
                newWheelEvent.__cloned = true;

                this._scrollContainerElement.dispatchEvent(newWheelEvent);
                return;
            }

            // Remember the mouse position in time.
            var mouseOffset = event.pageX - this._element.totalOffsetLeft;
            var mousePositionTime = this._scrollStartTime + mouseOffset * this._durationPerPixel;
            var deviceDirection = event.webkitDirectionInvertedFromDevice ? 1 : -1;
            var delta = event.deltaY * (this._durationPerPixel / WebInspector.TimelineOverview.ScrollDeltaDenominator) * deviceDirection;

            // Reset accumulated wheel delta when direction changes.
            if (this._pixelAlignDuration && (delta < 0 && this._mouseWheelDelta >= 0 || delta >= 0 && this._mouseWheelDelta < 0)) this._mouseWheelDelta = 0;

            var previousDurationPerPixel = this._durationPerPixel;
            this._mouseWheelDelta += delta;
            this.secondsPerPixel += this._mouseWheelDelta;

            if (this._durationPerPixel === this._minimumDurationPerPixel && delta < 0 || this._durationPerPixel === this._maximumDurationPerPixel && delta >= 0) this._mouseWheelDelta = 0;else this._mouseWheelDelta = previousDurationPerPixel + this._mouseWheelDelta - this._durationPerPixel;

            // Center the zoom around the mouse based on the remembered mouse position time.
            this.scrollStartTime = mousePositionTime - mouseOffset * this._durationPerPixel;

            event.preventDefault();
            event.stopPropagation();
        }
    }, {
        key: "_timelineAdded",
        value: function _timelineAdded(timelineOrEvent) {
            var timeline = timelineOrEvent;
            if (!(timeline instanceof WebInspector.Timeline)) timeline = timelineOrEvent.data.timeline;

            console.assert(timeline instanceof WebInspector.Timeline, timeline);
            console.assert(!this._timelineOverviewGraphsMap.has(timeline), timeline);
            if (!this.canShowTimeline(timeline)) return;

            var overviewGraph = WebInspector.TimelineOverviewGraph.createForTimeline(timeline, this);
            overviewGraph.addEventListener(WebInspector.TimelineOverviewGraph.Event.RecordSelected, this._recordSelected, this);
            this._timelineOverviewGraphsMap.set(timeline, overviewGraph);
            this._graphsContainerElement.appendChild(overviewGraph.element);
        }
    }, {
        key: "_timelineRemoved",
        value: function _timelineRemoved(event) {
            var timeline = event.data.timeline;
            console.assert(timeline instanceof WebInspector.Timeline, timeline);
            if (!this.canShowTimeline(timeline)) return;

            console.assert(this._timelineOverviewGraphsMap.has(timeline), timeline);

            var overviewGraph = this._timelineOverviewGraphsMap.take(timeline);
            overviewGraph.removeEventListener(WebInspector.TimelineOverviewGraph.Event.RecordSelected, this._recordSelected, this);
            this._graphsContainerElement.removeChild(overviewGraph.element);
        }
    }, {
        key: "_timelineRulerMouseDown",
        value: function _timelineRulerMouseDown(event) {
            this._timelineRulerSelectionChanged = false;
        }
    }, {
        key: "_timelineRulerMouseClicked",
        value: function _timelineRulerMouseClicked(event) {
            if (this._timelineRulerSelectionChanged) return;

            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = this._timelineOverviewGraphsMap.values()[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var overviewGraph = _step7.value;

                    var graphRect = overviewGraph.element.getBoundingClientRect();
                    if (!(event.pageX >= graphRect.left && event.pageX <= graphRect.right && event.pageY >= graphRect.top && event.pageY <= graphRect.bottom)) continue;

                    // Clone the event to dispatch it on the overview graph element.
                    var newClickEvent = new event.constructor(event.type, event);
                    overviewGraph.element.dispatchEvent(newClickEvent);
                    return;
                }
            } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion7 && _iterator7["return"]) {
                        _iterator7["return"]();
                    }
                } finally {
                    if (_didIteratorError7) {
                        throw _iteratorError7;
                    }
                }
            }
        }
    }, {
        key: "_timeRangeSelectionChanged",
        value: function _timeRangeSelectionChanged(event) {
            this._timelineRulerSelectionChanged = true;
            this._selectionStartValueSetting.value = this.selectionStartTime - this._startTime;
            this._selectionDurationSetting.value = this.selectionDuration;

            this.dispatchEventToListeners(WebInspector.TimelineOverview.Event.TimeRangeSelectionChanged);
        }
    }, {
        key: "_recordSelected",
        value: function _recordSelected(event) {
            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = this._timelineOverviewGraphsMap[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var _step8$value = _slicedToArray(_step8.value, 2);

                    var timeline = _step8$value[0];
                    var overviewGraph = _step8$value[1];

                    if (overviewGraph !== event.target) continue;

                    this.dispatchEventToListeners(WebInspector.TimelineOverview.Event.RecordSelected, { timeline: timeline, record: event.data.record });
                    return;
                }
            } catch (err) {
                _didIteratorError8 = true;
                _iteratorError8 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion8 && _iterator8["return"]) {
                        _iterator8["return"]();
                    }
                } finally {
                    if (_didIteratorError8) {
                        throw _iteratorError8;
                    }
                }
            }
        }
    }, {
        key: "_resetSelection",
        value: function _resetSelection() {
            this.secondsPerPixel = this._defaultSettingsValues.durationPerPixel;
            this.selectionStartTime = this._defaultSettingsValues.selectionStartValue;
            this.selectionDuration = this._defaultSettingsValues.selectionDuration;
        }
    }, {
        key: "element",
        get: function get() {
            return this._element;
        }
    }, {
        key: "startTime",
        get: function get() {
            return this._startTime;
        },
        set: function set(x) {
            if (this._startTime === x) return;

            this._startTime = x || 0;

            this._needsLayout();
        }
    }, {
        key: "currentTime",
        get: function get() {
            return this._currentTime;
        },
        set: function set(x) {
            if (this._currentTime === x) return;

            this._currentTime = x || 0;
            this._revealCurrentTime = true;

            this._needsLayout();
        }
    }, {
        key: "secondsPerPixel",
        get: function get() {
            return this._durationPerPixel;
        },
        set: function set(x) {
            x = Math.min(this._maximumDurationPerPixel, Math.max(this._minimumDurationPerPixel, x));

            if (this._durationPerPixel === x) return;

            if (this._pixelAlignDuration) {
                x = 1 / Math.round(1 / x);
                if (this._durationPerPixel === x) return;
            }

            this._durationPerPixel = x;
            this._durationPerPixelSetting.value = x;

            this._needsLayout();
        }
    }, {
        key: "pixelAlignDuration",
        get: function get() {
            return this._pixelAlignDuration;
        },
        set: function set(x) {
            if (this._pixelAlignDuration === x) return;

            this._mouseWheelDelta = 0;
            this._pixelAlignDuration = x;
            if (this._pixelAlignDuration) this.secondsPerPixel = 1 / Math.round(1 / this._durationPerPixel);
        }
    }, {
        key: "endTime",
        get: function get() {
            return this._endTime;
        },
        set: function set(x) {
            if (this._endTime === x) return;

            this._endTime = x || 0;

            this._needsLayout();
        }
    }, {
        key: "scrollStartTime",
        get: function get() {
            return this._scrollStartTime;
        },
        set: function set(x) {
            if (this._scrollStartTime === x) return;

            this._scrollStartTime = x || 0;

            this._needsLayout();
        }
    }, {
        key: "visibleDuration",
        get: function get() {
            if (isNaN(this._cachedScrollContainerWidth)) {
                this._cachedScrollContainerWidth = this._scrollContainerElement.offsetWidth;
                if (!this._cachedScrollContainerWidth) this._cachedScrollContainerWidth = NaN;
            }

            return this._cachedScrollContainerWidth * this._durationPerPixel;
        }
    }, {
        key: "selectionStartTime",
        get: function get() {
            return this._timelineRuler.selectionStartTime;
        },
        set: function set(x) {
            x = x || 0;

            var selectionDuration = this.selectionDuration;
            this._timelineRuler.selectionStartTime = x;
            this._timelineRuler.selectionEndTime = x + selectionDuration;
        }
    }, {
        key: "selectionDuration",
        get: function get() {
            return this._timelineRuler.selectionEndTime - this._timelineRuler.selectionStartTime;
        },
        set: function set(x) {
            x = Math.max(this._timelineRuler.minimumSelectionDuration, x);

            this._timelineRuler.selectionEndTime = this._timelineRuler.selectionStartTime + x;
        }
    }, {
        key: "visible",
        get: function get() {
            return this._visible;
        }
    }, {
        key: "timelineRuler",
        get: function get() {
            return this._timelineRuler;
        }
    }]);

    return TimelineOverview;
})(WebInspector.Object);

WebInspector.TimelineOverview.ScrollDeltaDenominator = 500;

WebInspector.TimelineOverview.Event = {
    RecordSelected: "timeline-overview-record-selected",
    TimeRangeSelectionChanged: "timeline-overview-time-range-selection-changed"
};
