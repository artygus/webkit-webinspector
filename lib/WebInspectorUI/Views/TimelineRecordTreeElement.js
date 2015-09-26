var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2014-2015 Apple Inc. All rights reserved.
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

WebInspector.TimelineRecordTreeElement = (function (_WebInspector$GeneralTreeElement) {
    _inherits(TimelineRecordTreeElement, _WebInspector$GeneralTreeElement);

    function TimelineRecordTreeElement(timelineRecord, subtitleNameStyle, includeTimerIdentifierInMainTitle, sourceCodeLocation, representedObject) {
        _classCallCheck(this, TimelineRecordTreeElement);

        console.assert(timelineRecord);

        sourceCodeLocation = sourceCodeLocation || timelineRecord.sourceCodeLocation || null;

        var title = "";
        var subtitle = "";

        if (sourceCodeLocation) {
            subtitle = document.createElement("span");

            if (subtitleNameStyle !== WebInspector.SourceCodeLocation.NameStyle.None) sourceCodeLocation.populateLiveDisplayLocationString(subtitle, "textContent", null, subtitleNameStyle);else sourceCodeLocation.populateLiveDisplayLocationString(subtitle, "textContent", null, WebInspector.SourceCodeLocation.NameStyle.None, WebInspector.UIString("line "));
        }

        var iconStyleClass = null;

        switch (timelineRecord.type) {
            case WebInspector.TimelineRecord.Type.Layout:
                title = WebInspector.LayoutTimelineRecord.displayNameForEventType(timelineRecord.eventType);

                switch (timelineRecord.eventType) {
                    case WebInspector.LayoutTimelineRecord.EventType.InvalidateStyles:
                    case WebInspector.LayoutTimelineRecord.EventType.RecalculateStyles:
                        iconStyleClass = WebInspector.TimelineRecordTreeElement.StyleRecordIconStyleClass;
                        break;
                    case WebInspector.LayoutTimelineRecord.EventType.InvalidateLayout:
                    case WebInspector.LayoutTimelineRecord.EventType.ForcedLayout:
                    case WebInspector.LayoutTimelineRecord.EventType.Layout:
                        iconStyleClass = WebInspector.TimelineRecordTreeElement.LayoutRecordIconStyleClass;
                        break;
                    case WebInspector.LayoutTimelineRecord.EventType.Paint:
                        iconStyleClass = WebInspector.TimelineRecordTreeElement.PaintRecordIconStyleClass;
                        break;
                    case WebInspector.LayoutTimelineRecord.EventType.Composite:
                        iconStyleClass = WebInspector.TimelineRecordTreeElement.CompositeRecordIconStyleClass;
                        break;
                    default:
                        console.error("Unknown LayoutTimelineRecord eventType: " + timelineRecord.eventType, timelineRecord);
                }

                break;

            case WebInspector.TimelineRecord.Type.Script:
                title = WebInspector.ScriptTimelineRecord.EventType.displayName(timelineRecord.eventType, timelineRecord.details, includeTimerIdentifierInMainTitle);

                switch (timelineRecord.eventType) {
                    case WebInspector.ScriptTimelineRecord.EventType.ScriptEvaluated:
                        iconStyleClass = WebInspector.TimelineRecordTreeElement.EvaluatedRecordIconStyleClass;
                        break;
                    case WebInspector.ScriptTimelineRecord.EventType.EventDispatched:
                        iconStyleClass = WebInspector.TimelineRecordTreeElement.EventRecordIconStyleClass;
                        break;
                    case WebInspector.ScriptTimelineRecord.EventType.ProbeSampleRecorded:
                        iconStyleClass = WebInspector.TimelineRecordTreeElement.ProbeRecordIconStyleClass;
                        break;
                    case WebInspector.ScriptTimelineRecord.EventType.ConsoleProfileRecorded:
                        iconStyleClass = WebInspector.TimelineRecordTreeElement.ConsoleProfileIconStyleClass;
                        break;
                    case WebInspector.ScriptTimelineRecord.EventType.TimerFired:
                    case WebInspector.ScriptTimelineRecord.EventType.TimerInstalled:
                    case WebInspector.ScriptTimelineRecord.EventType.TimerRemoved:
                        iconStyleClass = WebInspector.TimelineRecordTreeElement.TimerRecordIconStyleClass;
                        break;
                    case WebInspector.ScriptTimelineRecord.EventType.AnimationFrameFired:
                    case WebInspector.ScriptTimelineRecord.EventType.AnimationFrameRequested:
                    case WebInspector.ScriptTimelineRecord.EventType.AnimationFrameCanceled:
                        iconStyleClass = WebInspector.TimelineRecordTreeElement.AnimationRecordIconStyleClass;
                        break;
                    default:
                        console.error("Unknown ScriptTimelineRecord eventType: " + timelineRecord.eventType, timelineRecord);
                }

                break;

            case WebInspector.TimelineRecord.Type.RenderingFrame:
                title = WebInspector.UIString("Frame %d").format(timelineRecord.frameNumber);
                iconStyleClass = WebInspector.TimelineRecordTreeElement.RenderingFrameRecordIconStyleClass;
                break;

            default:
                console.error("Unknown TimelineRecord type: " + timelineRecord.type, timelineRecord);
        }

        _get(Object.getPrototypeOf(TimelineRecordTreeElement.prototype), "constructor", this).call(this, [iconStyleClass], title, subtitle, representedObject || timelineRecord, false);

        this._record = timelineRecord;
        this._sourceCodeLocation = sourceCodeLocation;

        this.small = true;

        if (this._sourceCodeLocation) this.tooltipHandledSeparately = true;
    }

    // Public

    _createClass(TimelineRecordTreeElement, [{
        key: "onattach",

        // Protected

        value: function onattach() {
            _get(Object.getPrototypeOf(TimelineRecordTreeElement.prototype), "onattach", this).call(this);

            console.assert(this.element);

            if (!this.tooltipHandledSeparately) return;

            var tooltipPrefix = this.mainTitle + "\n";
            this._sourceCodeLocation.populateLiveDisplayLocationTooltip(this.element, tooltipPrefix);
        }
    }, {
        key: "record",
        get: function get() {
            return this._record;
        }
    }, {
        key: "filterableData",
        get: function get() {
            var url = this._sourceCodeLocation ? this._sourceCodeLocation.sourceCode.url : "";
            return { text: [this.mainTitle, url || "", this._record.details || ""] };
        }
    }, {
        key: "sourceCodeLocation",
        get: function get() {
            return this._sourceCodeLocation;
        }
    }]);

    return TimelineRecordTreeElement;
})(WebInspector.GeneralTreeElement);

WebInspector.TimelineRecordTreeElement.StyleRecordIconStyleClass = "style-record";
WebInspector.TimelineRecordTreeElement.LayoutRecordIconStyleClass = "layout-record";
WebInspector.TimelineRecordTreeElement.PaintRecordIconStyleClass = "paint-record";
WebInspector.TimelineRecordTreeElement.CompositeRecordIconStyleClass = "composite-record";
WebInspector.TimelineRecordTreeElement.RenderingFrameRecordIconStyleClass = "rendering-frame-record";
WebInspector.TimelineRecordTreeElement.EvaluatedRecordIconStyleClass = "evaluated-record";
WebInspector.TimelineRecordTreeElement.EventRecordIconStyleClass = "event-record";
WebInspector.TimelineRecordTreeElement.TimerRecordIconStyleClass = "timer-record";
WebInspector.TimelineRecordTreeElement.AnimationRecordIconStyleClass = "animation-record";
WebInspector.TimelineRecordTreeElement.ProbeRecordIconStyleClass = "probe-record";
WebInspector.TimelineRecordTreeElement.ConsoleProfileIconStyleClass = "console-profile-record";
