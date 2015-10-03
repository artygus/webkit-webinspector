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

WebInspector.TimelineSidebarPanel = (function (_WebInspector$NavigationSidebarPanel) {
    _inherits(TimelineSidebarPanel, _WebInspector$NavigationSidebarPanel);

    function TimelineSidebarPanel(contentBrowser) {
        _classCallCheck(this, TimelineSidebarPanel);

        _get(Object.getPrototypeOf(TimelineSidebarPanel.prototype), "constructor", this).call(this, "timeline", WebInspector.UIString("Timelines"));

        this.contentBrowser = contentBrowser;

        var timelineEventsTitleBarContainer = document.createElement("div");
        timelineEventsTitleBarContainer.classList.add(WebInspector.TimelineSidebarPanel.TitleBarStyleClass);
        timelineEventsTitleBarContainer.classList.add(WebInspector.TimelineSidebarPanel.TimelineEventsTitleBarStyleClass);

        this._timelineEventsTitleBarElement = document.createElement("div");
        this._timelineEventsTitleBarElement.classList.add(WebInspector.TimelineSidebarPanel.TitleBarTextStyleClass);
        timelineEventsTitleBarContainer.appendChild(this._timelineEventsTitleBarElement);

        this._timelineEventsTitleBarScopeContainer = document.createElement("div");
        this._timelineEventsTitleBarScopeContainer.classList.add(WebInspector.TimelineSidebarPanel.TitleBarScopeBarStyleClass);
        timelineEventsTitleBarContainer.appendChild(this._timelineEventsTitleBarScopeContainer);

        this.element.insertBefore(timelineEventsTitleBarContainer, this.element.firstChild);

        this.contentTreeOutlineLabel = "";

        this._timelinesContentContainerElement = document.createElement("div");
        this._timelinesContentContainerElement.classList.add(WebInspector.TimelineSidebarPanel.TimelinesContentContainerStyleClass);
        this.element.insertBefore(this._timelinesContentContainerElement, this.element.firstChild);

        this._displayedRecording = null;
        this._displayedContentView = null;
        this._viewMode = null;
        this._previousSelectedTimelineType = null;

        // Maintain an invisible tree outline containing tree elements for all recordings.
        // The visible recording's tree element is selected when the content view changes.
        this._recordingTreeElementMap = new Map();
        this._recordingsTreeOutline = this.createContentTreeOutline(true, true);
        this._recordingsTreeOutline.element.classList.add(WebInspector.NavigationSidebarPanel.HideDisclosureButtonsStyleClassName);
        this._recordingsTreeOutline.element.classList.add(WebInspector.NavigationSidebarPanel.ContentTreeOutlineElementHiddenStyleClassName);
        this._recordingsTreeOutline.onselect = this._recordingsTreeElementSelected.bind(this);
        this._timelinesContentContainerElement.appendChild(this._recordingsTreeOutline.element);

        // Maintain a tree outline with tree elements for each timeline of the selected recording.
        this._timelinesTreeOutline = this.createContentTreeOutline(true, true);
        this._timelinesTreeOutline.element.classList.add(WebInspector.NavigationSidebarPanel.HideDisclosureButtonsStyleClassName);
        this._timelinesTreeOutline.onselect = this._timelinesTreeElementSelected.bind(this);
        this._timelinesContentContainerElement.appendChild(this._timelinesTreeOutline.element);

        this._timelineTreeElementMap = new Map();

        // COMPATIBILITY (iOS 8): TimelineAgent.EventType.RenderingFrame did not exist.
        this._renderingFramesSupported = window.TimelineAgent && TimelineAgent.EventType.RenderingFrame;

        if (this._renderingFramesSupported) {
            var timelinesNavigationItem = new WebInspector.RadioButtonNavigationItem(WebInspector.TimelineSidebarPanel.ViewMode.Timelines, WebInspector.UIString("Timelines"));
            var renderingFramesNavigationItem = new WebInspector.RadioButtonNavigationItem(WebInspector.TimelineSidebarPanel.ViewMode.RenderingFrames, WebInspector.UIString("Rendering Frames"));
            this._viewModeNavigationBar = new WebInspector.NavigationBar(null, [timelinesNavigationItem, renderingFramesNavigationItem], "tablist");
            this._viewModeNavigationBar.addEventListener(WebInspector.NavigationBar.Event.NavigationItemSelected, this._viewModeSelected, this);

            var container = document.createElement("div");
            container.className = "navigation-bar-container";
            container.appendChild(this._viewModeNavigationBar.element);
            this.element.insertBefore(container, this.element.firstChild);

            this._chartColors = new Map();
            this._chartColors.set(WebInspector.RenderingFrameTimelineRecord.TaskType.Script, "rgb(153, 113, 185)");
            this._chartColors.set(WebInspector.RenderingFrameTimelineRecord.TaskType.Layout, "rgb(212, 108, 108)");
            this._chartColors.set(WebInspector.RenderingFrameTimelineRecord.TaskType.Paint, "rgb(152, 188, 77)");
            this._chartColors.set(WebInspector.RenderingFrameTimelineRecord.TaskType.Other, "rgb(221, 221, 221)");

            this._frameSelectionChartRow = new WebInspector.ChartDetailsSectionRow(this, 74, 0.5);
            this._frameSelectionChartRow.addEventListener(WebInspector.ChartDetailsSectionRow.Event.LegendItemChecked, this._frameSelectionLegendItemChecked, this);

            for (var key in WebInspector.RenderingFrameTimelineRecord.TaskType) {
                var taskType = WebInspector.RenderingFrameTimelineRecord.TaskType[key];
                var label = WebInspector.RenderingFrameTimelineRecord.displayNameForTaskType(taskType);
                var color = this._chartColors.get(taskType);
                var checkbox = taskType !== WebInspector.RenderingFrameTimelineRecord.TaskType.Other;
                this._frameSelectionChartRow.addItem(taskType, label, 0, color, checkbox, true);
            }

            this._renderingFrameTaskFilter = new Set();

            var chartGroup = new WebInspector.DetailsSectionGroup([this._frameSelectionChartRow]);
            this._frameSelectionChartSection = new WebInspector.DetailsSection("frames-selection-chart", WebInspector.UIString("Selected Frames"), [chartGroup], null, true);
            this._timelinesContentContainerElement.appendChild(this._frameSelectionChartSection.element);
        } else {
            var timelinesTitleBarElement = document.createElement("div");
            timelinesTitleBarElement.textContent = WebInspector.UIString("Timelines");
            timelinesTitleBarElement.classList.add(WebInspector.TimelineSidebarPanel.TitleBarStyleClass);
            timelinesTitleBarElement.classList.add(WebInspector.TimelineSidebarPanel.TimelinesTitleBarStyleClass);
            this.element.insertBefore(timelinesTitleBarElement, this.element.firstChild);
        }

        var statusBarElement = this._statusBarElement = document.createElement("div");
        statusBarElement.classList.add(WebInspector.TimelineSidebarPanel.StatusBarStyleClass);
        this.element.insertBefore(statusBarElement, this.element.firstChild);

        this._recordGlyphElement = document.createElement("div");
        this._recordGlyphElement.className = WebInspector.TimelineSidebarPanel.RecordGlyphStyleClass;
        this._recordGlyphElement.title = WebInspector.UIString("Click or press the spacebar to record.");
        this._recordGlyphElement.addEventListener("mouseover", this._recordGlyphMousedOver.bind(this));
        this._recordGlyphElement.addEventListener("mouseout", this._recordGlyphMousedOut.bind(this));
        this._recordGlyphElement.addEventListener("click", this._recordGlyphClicked.bind(this));
        statusBarElement.appendChild(this._recordGlyphElement);

        this._recordStatusElement = document.createElement("div");
        this._recordStatusElement.className = WebInspector.TimelineSidebarPanel.RecordStatusStyleClass;
        statusBarElement.appendChild(this._recordStatusElement);

        WebInspector.showReplayInterfaceSetting.addEventListener(WebInspector.Setting.Event.Changed, this._updateReplayInterfaceVisibility, this);

        // We always create a replay navigation bar; its visibility is controlled by WebInspector.showReplayInterfaceSetting.
        this._replayNavigationBar = new WebInspector.NavigationBar();
        this.element.appendChild(this._replayNavigationBar.element);

        var toolTip = WebInspector.UIString("Begin Capturing");
        var altToolTip = WebInspector.UIString("End Capturing");
        this._replayCaptureButtonItem = new WebInspector.ActivateButtonNavigationItem("replay-capture", toolTip, altToolTip, "Images/Circle.svg", 16, 16);
        this._replayCaptureButtonItem.addEventListener(WebInspector.ButtonNavigationItem.Event.Clicked, this._replayCaptureButtonClicked, this);
        this._replayCaptureButtonItem.enabled = true;
        this._replayNavigationBar.addNavigationItem(this._replayCaptureButtonItem);

        toolTip = WebInspector.UIString("Start Playback");
        altToolTip = WebInspector.UIString("Pause Playback");
        this._replayPauseResumeButtonItem = new WebInspector.ToggleButtonNavigationItem("replay-pause-resume", toolTip, altToolTip, "Images/Resume.svg", "Images/Pause.svg", 15, 15, true);
        this._replayPauseResumeButtonItem.addEventListener(WebInspector.ButtonNavigationItem.Event.Clicked, this._replayPauseResumeButtonClicked, this);
        this._replayPauseResumeButtonItem.enabled = false;
        this._replayNavigationBar.addNavigationItem(this._replayPauseResumeButtonItem);

        WebInspector.replayManager.addEventListener(WebInspector.ReplayManager.Event.CaptureStarted, this._captureStarted, this);
        WebInspector.replayManager.addEventListener(WebInspector.ReplayManager.Event.CaptureStopped, this._captureStopped, this);

        this._statusBarElement.oncontextmenu = this._contextMenuNavigationBarOrStatusBar.bind(this);
        this._replayNavigationBar.element.oncontextmenu = this._contextMenuNavigationBarOrStatusBar.bind(this);
        this._updateReplayInterfaceVisibility();

        WebInspector.timelineManager.addEventListener(WebInspector.TimelineManager.Event.RecordingCreated, this._recordingCreated, this);
        WebInspector.timelineManager.addEventListener(WebInspector.TimelineManager.Event.RecordingLoaded, this._recordingLoaded, this);

        this.contentBrowser.addEventListener(WebInspector.ContentBrowser.Event.CurrentContentViewDidChange, this._contentBrowserCurrentContentViewDidChange, this);
        WebInspector.timelineManager.addEventListener(WebInspector.TimelineManager.Event.CapturingStarted, this._capturingStarted, this);
        WebInspector.timelineManager.addEventListener(WebInspector.TimelineManager.Event.CapturingStopped, this._capturingStopped, this);

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = WebInspector.timelineManager.recordings[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var recording = _step.value;

                this._addRecording(recording);
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

        this._recordingCountChanged();

        if (WebInspector.timelineManager.activeRecording) this._recordingLoaded();

        this._toggleRecordingShortcut = new WebInspector.KeyboardShortcut(null, WebInspector.KeyboardShortcut.Key.Space, this._toggleRecordingOnSpacebar.bind(this));
        this._toggleRecordingShortcut.implicitlyPreventsDefault = false;

        this._toggleNewRecordingShortcut = new WebInspector.KeyboardShortcut(WebInspector.KeyboardShortcut.Modifier.Shift, WebInspector.KeyboardShortcut.Key.Space, this._toggleNewRecordingOnSpacebar.bind(this));
        this._toggleNewRecordingShortcut.implicitlyPreventsDefault = false;
    }

    // Public

    _createClass(TimelineSidebarPanel, [{
        key: "shown",
        value: function shown() {
            _get(Object.getPrototypeOf(TimelineSidebarPanel.prototype), "shown", this).call(this);

            if (this._displayedContentView) this.contentBrowser.showContentView(this._displayedContentView);

            if (this.viewMode === WebInspector.TimelineSidebarPanel.ViewMode.RenderingFrames) this._refreshFrameSelectionChart();

            this._toggleRecordingShortcut.disabled = false;
            this._toggleNewRecordingShortcut.disabled = false;
        }
    }, {
        key: "hidden",
        value: function hidden() {
            _get(Object.getPrototypeOf(TimelineSidebarPanel.prototype), "hidden", this).call(this);

            this._toggleRecordingShortcut.disabled = true;
            this._toggleNewRecordingShortcut.disabled = true;
        }
    }, {
        key: "closed",
        value: function closed() {
            _get(Object.getPrototypeOf(TimelineSidebarPanel.prototype), "closed", this).call(this);

            WebInspector.showReplayInterfaceSetting.removeEventListener(null, null, this);
            WebInspector.replayManager.removeEventListener(null, null, this);
            WebInspector.timelineManager.removeEventListener(null, null, this);

            WebInspector.timelineManager.reset();
        }
    }, {
        key: "showDefaultContentView",
        value: function showDefaultContentView() {
            if (this._displayedContentView) this.showTimelineOverview();
        }
    }, {
        key: "treeElementForRepresentedObject",
        value: function treeElementForRepresentedObject(representedObject) {
            if (representedObject instanceof WebInspector.TimelineRecording) return this._recordingTreeElementMap.get(representedObject);

            // This fails if the timeline does not belong to the selected recording.
            if (representedObject instanceof WebInspector.Timeline) {
                var foundTreeElement = this._timelineTreeElementMap.get(representedObject);
                if (foundTreeElement) return foundTreeElement;
            }

            // The main resource is used as the representedObject instead of Frame in our tree.
            if (representedObject instanceof WebInspector.Frame) representedObject = representedObject.mainResource;

            var foundTreeElement = this.contentTreeOutline.getCachedTreeElement(representedObject);
            if (foundTreeElement) return foundTreeElement;

            // Look for TreeElements loosely based on represented objects that can contain the represented
            // object we are really looking for. This allows a SourceCodeTimelineTreeElement or a
            // TimelineRecordTreeElement to stay selected when the Resource it represents is showing.

            function looselyCompareRepresentedObjects(candidateTreeElement) {
                if (!candidateTreeElement) return false;

                var candidateRepresentedObject = candidateTreeElement.representedObject;
                if (candidateRepresentedObject instanceof WebInspector.SourceCodeTimeline) {
                    if (candidateRepresentedObject.sourceCode === representedObject) return true;
                    return false;
                } else if (candidateRepresentedObject instanceof WebInspector.Timeline && representedObject instanceof WebInspector.Timeline) {
                    // Reopen to the same timeline, even if a different parent recording is currently shown.
                    if (candidateRepresentedObject.type === representedObject.type) return true;
                    return false;
                }

                if (candidateRepresentedObject instanceof WebInspector.TimelineRecord) {
                    if (!candidateRepresentedObject.sourceCodeLocation) return false;
                    if (candidateRepresentedObject.sourceCodeLocation.sourceCode === representedObject) return true;
                    return false;
                }

                if (candidateRepresentedObject instanceof WebInspector.ProfileNode) return false;

                console.error("Unknown TreeElement", candidateTreeElement);
                return false;
            }

            // Check the selected tree element first so we don't need to do a longer search and it is
            // likely to be the best candidate for the current view.
            if (looselyCompareRepresentedObjects(this.contentTreeOutline.selectedTreeElement)) return this.contentTreeOutline.selectedTreeElement;

            var currentTreeElement = this._contentTreeOutline.children[0];
            while (currentTreeElement && !currentTreeElement.root) {
                if (looselyCompareRepresentedObjects(currentTreeElement)) return currentTreeElement;
                currentTreeElement = currentTreeElement.traverseNextTreeElement(false, null, false);
            }

            return null;
        }
    }, {
        key: "showTimelineOverview",
        value: function showTimelineOverview() {
            if (this._timelinesTreeOutline.selectedTreeElement) this._timelinesTreeOutline.selectedTreeElement.deselect();

            this._displayedContentView.showOverviewTimelineView();
            this.contentBrowser.showContentView(this._displayedContentView);

            var selectedByUser = false;
            this._changeViewMode(WebInspector.TimelineSidebarPanel.ViewMode.Timelines, selectedByUser);
        }
    }, {
        key: "showTimelineViewForTimeline",
        value: function showTimelineViewForTimeline(timeline) {
            console.assert(timeline instanceof WebInspector.Timeline, timeline);
            console.assert(this._displayedRecording.timelines.has(timeline.type), "Cannot show timeline because it does not belong to the shown recording.", timeline.type);

            // The sidebar view mode must be in the correct state before changing the content view.
            var selectedByUser = false;
            this._changeViewMode(this._viewModeForTimeline(timeline), selectedByUser);

            if (this._timelineTreeElementMap.has(timeline)) {
                // Defer showing the relevant timeline to the onselect handler of the timelines tree element.
                var wasSelectedByUser = true;
                var shouldSuppressOnSelect = false;
                this._timelineTreeElementMap.get(timeline).select(true, wasSelectedByUser, shouldSuppressOnSelect, true);
            } else {
                this._displayedContentView.showTimelineViewForTimeline(timeline);
                this.contentBrowser.showContentView(this._displayedContentView);
            }
        }
    }, {
        key: "updateFrameSelection",
        value: function updateFrameSelection(startFrameIndex, endFrameIndex) {
            console.assert(startFrameIndex <= endFrameIndex);
            console.assert(this.viewMode === WebInspector.TimelineSidebarPanel.ViewMode.RenderingFrames, this._viewMode);
            if (this._startFrameIndex === startFrameIndex && this._endFrameIndex === endFrameIndex) return;

            this._startFrameIndex = startFrameIndex;
            this._endFrameIndex = endFrameIndex;

            this._refreshFrameSelectionChart();
        }
    }, {
        key: "formatChartValue",
        value: function formatChartValue(value) {
            return this._frameSelectionChartRow.total === 0 ? "" : Number.secondsToString(value);
        }

        // Protected

    }, {
        key: "representedObjectWasFiltered",
        value: function representedObjectWasFiltered(representedObject, filtered) {
            _get(Object.getPrototypeOf(TimelineSidebarPanel.prototype), "representedObjectWasFiltered", this).call(this, representedObject, filtered);

            if (representedObject instanceof WebInspector.TimelineRecord) this._displayedContentView.recordWasFiltered(representedObject, filtered);
        }
    }, {
        key: "updateFilter",
        value: function updateFilter() {
            _get(Object.getPrototypeOf(TimelineSidebarPanel.prototype), "updateFilter", this).call(this);

            this._displayedContentView.filterDidChange();
        }
    }, {
        key: "hasCustomFilters",
        value: function hasCustomFilters() {
            return true;
        }
    }, {
        key: "matchTreeElementAgainstCustomFilters",
        value: function matchTreeElementAgainstCustomFilters(treeElement) {
            if (!this._displayedContentView) return true;

            if (this._viewMode === WebInspector.TimelineSidebarPanel.ViewMode.RenderingFrames && this._renderingFrameTaskFilter.size) {
                while (treeElement && !(treeElement.record instanceof WebInspector.TimelineRecord)) treeElement = treeElement.parent;

                console.assert(treeElement, "Cannot apply task filter: no TimelineRecord found.");
                if (!treeElement) return false;

                var records = undefined;
                if (treeElement.record instanceof WebInspector.RenderingFrameTimelineRecord) records = treeElement.record.children;else records = [treeElement.record];

                var filtered = records.every(function (record) {
                    var taskType = WebInspector.RenderingFrameTimelineRecord.taskTypeForTimelineRecord(record);
                    return this._renderingFrameTaskFilter.has(taskType);
                }, this);

                if (filtered) return false;
            }

            return this._displayedContentView.matchTreeElementAgainstCustomFilters(treeElement);
        }
    }, {
        key: "treeElementAddedOrChanged",
        value: function treeElementAddedOrChanged(treeElement) {
            if (treeElement.status) return;

            if (!treeElement.treeOutline || typeof treeElement.treeOutline.__canShowContentViewForTreeElement !== "function") return;

            if (!treeElement.treeOutline.__canShowContentViewForTreeElement(treeElement)) return;

            wrappedSVGDocument("Images/Close.svg", null, WebInspector.UIString("Close resource view"), (function (element) {
                var fragment = document.createDocumentFragment();

                var closeButton = new WebInspector.TreeElementStatusButton(element);
                closeButton.element.classList.add("close");
                closeButton.addEventListener(WebInspector.TreeElementStatusButton.Event.Clicked, this._treeElementCloseButtonClicked, this);
                fragment.appendChild(closeButton.element);

                var goToButton = new WebInspector.TreeElementStatusButton(WebInspector.createGoToArrowButton());
                goToButton.__treeElement = treeElement;
                goToButton.addEventListener(WebInspector.TreeElementStatusButton.Event.Clicked, this._treeElementGoToArrowWasClicked, this);
                fragment.appendChild(goToButton.element);

                treeElement.status = fragment;
            }).bind(this));
        }
    }, {
        key: "canShowDifferentContentView",
        value: function canShowDifferentContentView() {
            if (this._clickedTreeElementGoToArrow) return true;

            if (this.contentBrowser.currentContentView instanceof WebInspector.TimelineRecordingContentView) return false;

            return !this.restoringState || !this._restoredShowingTimelineRecordingContentView;
        }
    }, {
        key: "saveStateToCookie",
        value: function saveStateToCookie(cookie) {
            console.assert(cookie);

            cookie[WebInspector.TimelineSidebarPanel.ShowingTimelineRecordingContentViewCookieKey] = this.contentBrowser.currentContentView instanceof WebInspector.TimelineRecordingContentView;

            if (this._viewMode === WebInspector.TimelineSidebarPanel.ViewMode.RenderingFrames) cookie[WebInspector.TimelineSidebarPanel.SelectedTimelineViewIdentifierCookieKey] = WebInspector.TimelineRecord.Type.RenderingFrame;else {
                var selectedTreeElement = this._timelinesTreeOutline.selectedTreeElement;
                if (selectedTreeElement) cookie[WebInspector.TimelineSidebarPanel.SelectedTimelineViewIdentifierCookieKey] = selectedTreeElement.representedObject.type;else cookie[WebInspector.TimelineSidebarPanel.SelectedTimelineViewIdentifierCookieKey] = WebInspector.TimelineSidebarPanel.OverviewTimelineIdentifierCookieValue;
            }

            _get(Object.getPrototypeOf(TimelineSidebarPanel.prototype), "saveStateToCookie", this).call(this, cookie);
        }
    }, {
        key: "restoreStateFromCookie",
        value: function restoreStateFromCookie(cookie, relaxedMatchDelay) {
            console.assert(cookie);

            // The _displayedContentView is not ready on initial load, so delay the restore.
            // This matches the delayed work in the WebInspector.TimelineSidebarPanel constructor.
            if (!this._displayedContentView) {
                setTimeout(this.restoreStateFromCookie.bind(this, cookie, relaxedMatchDelay), 0);
                return;
            }

            this._restoredShowingTimelineRecordingContentView = cookie[WebInspector.TimelineSidebarPanel.ShowingTimelineRecordingContentViewCookieKey];

            var selectedTimelineViewIdentifier = cookie[WebInspector.TimelineSidebarPanel.SelectedTimelineViewIdentifierCookieKey];
            if (selectedTimelineViewIdentifier === WebInspector.TimelineRecord.Type.RenderingFrame && !this._renderingFramesSupported) selectedTimelineViewIdentifier = null;

            if (selectedTimelineViewIdentifier && this._displayedRecording.timelines.has(selectedTimelineViewIdentifier)) this.showTimelineViewForTimeline(this._displayedRecording.timelines.get(selectedTimelineViewIdentifier));else this.showTimelineOverview();

            // Don't call NavigationSidebarPanel.restoreStateFromCookie, because it tries to match based
            // on type only as a last resort. This would cause the first recording to be reselected on reload.
        }

        // Private

    }, {
        key: "_toggleRecordingOnSpacebar",
        value: function _toggleRecordingOnSpacebar(event) {
            if (WebInspector.isEventTargetAnEditableField(event)) return;

            this._toggleRecording();
        }
    }, {
        key: "_toggleNewRecordingOnSpacebar",
        value: function _toggleNewRecordingOnSpacebar(event) {
            if (WebInspector.isEventTargetAnEditableField(event)) return;

            this._toggleRecording(true);
        }
    }, {
        key: "_toggleRecording",
        value: function _toggleRecording(shouldCreateRecording) {
            if (WebInspector.timelineManager.isCapturing()) {
                WebInspector.timelineManager.stopCapturing();

                this._recordGlyphElement.title = WebInspector.UIString("Click or press the spacebar to record.");
            } else {
                WebInspector.timelineManager.startCapturing(shouldCreateRecording);
                // Show the timeline to which events will be appended.
                this._recordingLoaded();

                this._recordGlyphElement.title = WebInspector.UIString("Click or press the spacebar to stop recording.");
            }
        }
    }, {
        key: "_treeElementGoToArrowWasClicked",
        value: function _treeElementGoToArrowWasClicked(event) {
            this._clickedTreeElementGoToArrow = true;

            var treeElement = event.target.__treeElement;
            console.assert(treeElement instanceof WebInspector.TreeElement);

            treeElement.select(true, true);

            this._clickedTreeElementGoToArrow = false;
        }
    }, {
        key: "_treeElementCloseButtonClicked",
        value: function _treeElementCloseButtonClicked(event) {
            var currentTimelineView = this._displayedContentView ? this._displayedContentView.currentTimelineView : null;
            if (currentTimelineView && currentTimelineView.representedObject instanceof WebInspector.Timeline) this.showTimelineViewForTimeline(currentTimelineView.representedObject);else this.showTimelineOverview();
        }
    }, {
        key: "_recordingsTreeElementSelected",
        value: function _recordingsTreeElementSelected(treeElement, selectedByUser) {
            console.assert(treeElement.representedObject instanceof WebInspector.TimelineRecording);

            this._recordingSelected(treeElement.representedObject);
        }
    }, {
        key: "_renderingFrameTimelineTimesUpdated",
        value: function _renderingFrameTimelineTimesUpdated(event) {
            if (this.viewMode === WebInspector.TimelineSidebarPanel.ViewMode.RenderingFrames) this._refreshFrameSelectionChart();
        }
    }, {
        key: "_timelinesTreeElementSelected",
        value: function _timelinesTreeElementSelected(treeElement, selectedByUser) {
            console.assert(this._timelineTreeElementMap.get(treeElement.representedObject) === treeElement, treeElement);

            // If not selected by user, then this selection merely synced the tree element with the content view's contents.
            if (!selectedByUser) {
                console.assert(this._displayedContentView.currentTimelineView.representedObject === treeElement.representedObject);
                return;
            }

            var timeline = treeElement.representedObject;
            console.assert(timeline instanceof WebInspector.Timeline, timeline);
            console.assert(this._displayedRecording.timelines.get(timeline.type) === timeline, timeline);

            this._previousSelectedTimelineType = timeline.type;

            this._displayedContentView.showTimelineViewForTimeline(timeline);
            this.contentBrowser.showContentView(this._displayedContentView);
        }
    }, {
        key: "_contentBrowserCurrentContentViewDidChange",
        value: function _contentBrowserCurrentContentViewDidChange(event) {
            var didShowTimelineRecordingContentView = this.contentBrowser.currentContentView instanceof WebInspector.TimelineRecordingContentView;
            this.element.classList.toggle(WebInspector.TimelineSidebarPanel.TimelineRecordingContentViewShowingStyleClass, didShowTimelineRecordingContentView);

            if (this.viewMode === WebInspector.TimelineSidebarPanel.ViewMode.RenderingFrames) this._refreshFrameSelectionChart();
        }
    }, {
        key: "_capturingStarted",
        value: function _capturingStarted(event) {
            this._recordStatusElement.textContent = WebInspector.UIString("Recording");
            this._recordGlyphElement.classList.add(WebInspector.TimelineSidebarPanel.RecordGlyphRecordingStyleClass);
        }
    }, {
        key: "_capturingStopped",
        value: function _capturingStopped(event) {
            this._recordStatusElement.textContent = "";
            this._recordGlyphElement.classList.remove(WebInspector.TimelineSidebarPanel.RecordGlyphRecordingStyleClass);
        }
    }, {
        key: "_recordingCreated",
        value: function _recordingCreated(event) {
            this._addRecording(event.data.recording);
            this._recordingCountChanged();
        }
    }, {
        key: "_addRecording",
        value: function _addRecording(recording) {
            console.assert(recording instanceof WebInspector.TimelineRecording, recording);

            var recordingTreeElement = new WebInspector.GeneralTreeElement(WebInspector.TimelineSidebarPanel.StopwatchIconStyleClass, recording.displayName, null, recording);
            this._recordingTreeElementMap.set(recording, recordingTreeElement);
            this._recordingsTreeOutline.appendChild(recordingTreeElement);
        }
    }, {
        key: "_recordingCountChanged",
        value: function _recordingCountChanged() {
            var previousTreeElement = null;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._recordingTreeElementMap.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var treeElement = _step2.value;

                    if (previousTreeElement) {
                        previousTreeElement.nextSibling = treeElement;
                        treeElement.previousSibling = previousTreeElement;
                    }

                    previousTreeElement = treeElement;
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
        key: "_recordingSelected",
        value: function _recordingSelected(recording) {
            console.assert(recording instanceof WebInspector.TimelineRecording, recording);

            var oldRecording = this._displayedRecording || null;

            if (oldRecording) {
                oldRecording.removeEventListener(WebInspector.TimelineRecording.Event.TimelineAdded, this._timelineAdded, this);
                oldRecording.removeEventListener(WebInspector.TimelineRecording.Event.TimelineRemoved, this._timelineRemoved, this);

                // Destroy tree elements in one operation to avoid unnecessary fixups.
                this._timelinesTreeOutline.removeChildren();
                this._timelineTreeElementMap.clear();
            }

            this._displayedRecording = recording;
            this._displayedRecording.addEventListener(WebInspector.TimelineRecording.Event.TimelineAdded, this._timelineAdded, this);
            this._displayedRecording.addEventListener(WebInspector.TimelineRecording.Event.TimelineRemoved, this._timelineRemoved, this);

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = recording.timelines.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var timeline = _step3.value;

                    this._timelineAdded(timeline);
                } // Save the current state incase we need to restore it to a new recording.
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

            var cookie = {};
            this.saveStateToCookie(cookie);

            // Try to get the recording content view if it exists already, if it does we don't want to restore the cookie.
            var onlyExisting = true;
            this._displayedContentView = this.contentBrowser.contentViewForRepresentedObject(this._displayedRecording, onlyExisting, { timelineSidebarPanel: this });
            if (this._displayedContentView) {
                // Show the timeline that was being shown to update the sidebar tree state.
                var currentTimelineView = this._displayedContentView.currentTimelineView;
                if (currentTimelineView && currentTimelineView.representedObject instanceof WebInspector.Timeline) this.showTimelineViewForTimeline(currentTimelineView.representedObject);else this.showTimelineOverview();

                this.updateFilter();
                return;
            }

            onlyExisting = false;
            this._displayedContentView = this.contentBrowser.contentViewForRepresentedObject(this._displayedRecording, onlyExisting, { timelineSidebarPanel: this });

            // Restore the cookie to carry over the previous recording view state to the new recording.
            this.restoreStateFromCookie(cookie);

            this.updateFilter();
        }
    }, {
        key: "_recordingLoaded",
        value: function _recordingLoaded(event) {
            this._recordingSelected(WebInspector.timelineManager.activeRecording);
        }
    }, {
        key: "_timelineAdded",
        value: function _timelineAdded(timelineOrEvent) {
            var timeline = timelineOrEvent;
            if (!(timeline instanceof WebInspector.Timeline)) timeline = timelineOrEvent.data.timeline;

            console.assert(timeline instanceof WebInspector.Timeline, timeline);
            console.assert(!this._timelineTreeElementMap.has(timeline), timeline);

            if (timeline.type === WebInspector.TimelineRecord.Type.RenderingFrame) {
                timeline.addEventListener(WebInspector.Timeline.Event.TimesUpdated, this._renderingFrameTimelineTimesUpdated, this);
                return;
            }

            var timelineTreeElement = new WebInspector.GeneralTreeElement([timeline.iconClassName, WebInspector.TimelineSidebarPanel.LargeIconStyleClass], timeline.displayName, null, timeline);
            var tooltip = WebInspector.UIString("Close %s timeline view").format(timeline.displayName);
            wrappedSVGDocument("Images/CloseLarge.svg", WebInspector.TimelineSidebarPanel.CloseButtonStyleClass, tooltip, (function (element) {
                var button = new WebInspector.TreeElementStatusButton(element);
                button.addEventListener(WebInspector.TreeElementStatusButton.Event.Clicked, this.showTimelineOverview, this);
                timelineTreeElement.status = button.element;
            }).bind(this));

            this._timelinesTreeOutline.appendChild(timelineTreeElement);
            this._timelineTreeElementMap.set(timeline, timelineTreeElement);

            this._timelineCountChanged();
        }
    }, {
        key: "_timelineRemoved",
        value: function _timelineRemoved(event) {
            var timeline = event.data.timeline;
            console.assert(timeline instanceof WebInspector.Timeline, timeline);

            if (timeline.type === WebInspector.TimelineRecord.Type.RenderingFrame) {
                timeline.removeEventListener(WebInspector.Timeline.Event.TimesUpdated, this._renderingFrameTimelineTimesUpdated, this);
                return;
            }

            console.assert(this._timelineTreeElementMap.has(timeline), timeline);

            var timelineTreeElement = this._timelineTreeElementMap.take(timeline);
            var shouldSuppressOnDeselect = false;
            var shouldSuppressSelectSibling = true;
            this._timelinesTreeOutline.removeChild(timelineTreeElement, shouldSuppressOnDeselect, shouldSuppressSelectSibling);
            this._timelineTreeElementMap["delete"](timeline);

            this._timelineCountChanged();
        }
    }, {
        key: "_timelineCountChanged",
        value: function _timelineCountChanged() {
            var previousTreeElement = null;
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this._timelineTreeElementMap.values()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var treeElement = _step4.value;

                    if (previousTreeElement) {
                        previousTreeElement.nextSibling = treeElement;
                        treeElement.previousSibling = previousTreeElement;
                    }

                    previousTreeElement = treeElement;
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

            var timelineHeight = 36;
            var eventTitleBarOffset = 58;
            var contentElementOffset = 81;
            var timelineCount = this._timelineTreeElementMap.size;

            this._timelinesContentContainerElement.style.height = timelineHeight * timelineCount + "px";
            this._timelineEventsTitleBarElement.style.top = timelineHeight * timelineCount + eventTitleBarOffset + "px";
            this.contentElement.style.top = timelineHeight * timelineCount + contentElementOffset + "px";
        }
    }, {
        key: "_recordGlyphMousedOver",
        value: function _recordGlyphMousedOver(event) {
            this._recordGlyphElement.classList.remove(WebInspector.TimelineSidebarPanel.RecordGlyphRecordingForcedStyleClass);

            if (WebInspector.timelineManager.isCapturing()) this._recordStatusElement.textContent = WebInspector.UIString("Stop Recording");else this._recordStatusElement.textContent = WebInspector.UIString("Start Recording");
        }
    }, {
        key: "_recordGlyphMousedOut",
        value: function _recordGlyphMousedOut(event) {
            this._recordGlyphElement.classList.remove(WebInspector.TimelineSidebarPanel.RecordGlyphRecordingForcedStyleClass);

            if (WebInspector.timelineManager.isCapturing()) this._recordStatusElement.textContent = WebInspector.UIString("Recording");else this._recordStatusElement.textContent = "";
        }
    }, {
        key: "_recordGlyphClicked",
        value: function _recordGlyphClicked(event) {
            // Add forced class to prevent the glyph from showing a confusing status after click.
            this._recordGlyphElement.classList.add(WebInspector.TimelineSidebarPanel.RecordGlyphRecordingForcedStyleClass);

            this._toggleRecording(event.shiftKey);
        }
    }, {
        key: "_viewModeSelected",
        value: function _viewModeSelected(event) {
            console.assert(event.target.selectedNavigationItem);
            if (!event.target.selectedNavigationItem) return;

            var selectedNavigationItem = event.target.selectedNavigationItem;
            var selectedByUser = true;
            this._changeViewMode(selectedNavigationItem.identifier, selectedByUser);
        }
    }, {
        key: "_viewModeForTimeline",
        value: function _viewModeForTimeline(timeline) {
            if (timeline && timeline.type === WebInspector.TimelineRecord.Type.RenderingFrame) return WebInspector.TimelineSidebarPanel.ViewMode.RenderingFrames;

            return WebInspector.TimelineSidebarPanel.ViewMode.Timelines;
        }
    }, {
        key: "_changeViewMode",
        value: function _changeViewMode(mode, selectedByUser) {
            if (!this._renderingFramesSupported || this._viewMode === mode) return;

            this._viewMode = mode;
            this._viewModeNavigationBar.selectedNavigationItem = this._viewMode;

            if (this._viewMode === WebInspector.TimelineSidebarPanel.ViewMode.Timelines) {
                this._timelinesTreeOutline.element.classList.remove(WebInspector.NavigationSidebarPanel.ContentTreeOutlineElementHiddenStyleClassName);
                this._frameSelectionChartSection.collapsed = true;
            } else {
                this._timelinesTreeOutline.element.classList.add(WebInspector.NavigationSidebarPanel.ContentTreeOutlineElementHiddenStyleClassName);
                this._frameSelectionChartSection.collapsed = false;
            }

            if (selectedByUser) {
                var timelineType = this._previousSelectedTimelineType;
                if (this._viewMode === WebInspector.TimelineSidebarPanel.ViewMode.RenderingFrames) {
                    this._previousSelectedTimelineType = this._timelinesTreeOutline.selectedTreeElement ? this._timelinesTreeOutline.selectedTreeElement.representedObject.type : null;
                    timelineType = WebInspector.TimelineRecord.Type.RenderingFrame;
                }

                if (timelineType) {
                    console.assert(this._displayedRecording.timelines.has(timelineType), timelineType);
                    this.showTimelineViewForTimeline(this._displayedRecording.timelines.get(timelineType));
                } else this.showTimelineOverview();
            }

            this.updateFilter();
        }
    }, {
        key: "_frameSelectionLegendItemChecked",
        value: function _frameSelectionLegendItemChecked(event) {
            if (event.data.checked) this._renderingFrameTaskFilter["delete"](event.data.id);else this._renderingFrameTaskFilter.add(event.data.id);

            this.updateFilter();
        }
    }, {
        key: "_refreshFrameSelectionChart",
        value: function _refreshFrameSelectionChart() {
            var _this = this;

            if (!this.visible) return;

            function getSelectedRecords() {
                console.assert(this._displayedRecording);
                console.assert(this._displayedRecording.timelines.has(WebInspector.TimelineRecord.Type.RenderingFrame), "Cannot find rendering frames timeline in displayed recording");

                var timeline = this._displayedRecording.timelines.get(WebInspector.TimelineRecord.Type.RenderingFrame);
                var selectedRecords = [];
                var _iteratorNormalCompletion5 = true;
                var _didIteratorError5 = false;
                var _iteratorError5 = undefined;

                try {
                    for (var _iterator5 = timeline.records[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                        var record = _step5.value;

                        console.assert(record instanceof WebInspector.RenderingFrameTimelineRecord);
                        // If this frame is completely before the bounds of the graph, skip this record.
                        if (record.frameIndex < this._startFrameIndex) continue;

                        // If this record is completely after the end time, break out now.
                        // Records are sorted, so all records after this will be beyond the end time too.
                        if (record.frameIndex > this._endFrameIndex) break;

                        selectedRecords.push(record);
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

                return selectedRecords;
            }

            var records = getSelectedRecords.call(this);

            var _loop = function (key) {
                var taskType = WebInspector.RenderingFrameTimelineRecord.TaskType[key];
                var value = records.reduce(function (previousValue, currentValue) {
                    return previousValue + currentValue.durationForTask(taskType);
                }, 0);
                _this._frameSelectionChartRow.setItemValue(taskType, value);
            };

            for (var key in WebInspector.RenderingFrameTimelineRecord.TaskType) {
                _loop(key);
            }

            if (!records.length) {
                this._frameSelectionChartRow.title = WebInspector.UIString("Frames: None Selected");
                return;
            }

            var firstRecord = records[0];
            var lastRecord = records.lastValue;

            if (records.length > 1) {
                this._frameSelectionChartRow.title = WebInspector.UIString("Frames: %d – %d (%s – %s)").format(firstRecord.frameNumber, lastRecord.frameNumber, Number.secondsToString(firstRecord.startTime), Number.secondsToString(lastRecord.endTime));
            } else {
                this._frameSelectionChartRow.title = WebInspector.UIString("Frame: %d (%s – %s)").format(firstRecord.frameNumber, Number.secondsToString(firstRecord.startTime), Number.secondsToString(lastRecord.endTime));
            }
        }

        // These methods are only used when ReplayAgent is available.

    }, {
        key: "_updateReplayInterfaceVisibility",
        value: function _updateReplayInterfaceVisibility() {
            var shouldShowReplayInterface = window.ReplayAgent && WebInspector.showReplayInterfaceSetting.value;

            this._statusBarElement.classList.toggle(WebInspector.TimelineSidebarPanel.HiddenStyleClassName, shouldShowReplayInterface);
            this._replayNavigationBar.element.classList.toggle(WebInspector.TimelineSidebarPanel.HiddenStyleClassName, !shouldShowReplayInterface);
        }
    }, {
        key: "_contextMenuNavigationBarOrStatusBar",
        value: function _contextMenuNavigationBarOrStatusBar() {
            if (!window.ReplayAgent) return;

            function toggleReplayInterface() {
                WebInspector.showReplayInterfaceSetting.value = !WebInspector.showReplayInterfaceSetting.value;
            }

            var contextMenu = new WebInspector.ContextMenu(event);
            if (WebInspector.showReplayInterfaceSetting.value) contextMenu.appendItem(WebInspector.UIString("Hide Replay Controls"), toggleReplayInterface);else contextMenu.appendItem(WebInspector.UIString("Show Replay Controls"), toggleReplayInterface);
            contextMenu.show();
        }
    }, {
        key: "_replayCaptureButtonClicked",
        value: function _replayCaptureButtonClicked() {
            if (!this._replayCaptureButtonItem.activated) {
                WebInspector.replayManager.startCapturing();
                WebInspector.timelineManager.startCapturing();

                // De-bounce further presses until the backend has begun capturing.
                this._replayCaptureButtonItem.activated = true;
                this._replayCaptureButtonItem.enabled = false;
            } else {
                WebInspector.replayManager.stopCapturing();
                WebInspector.timelineManager.stopCapturing();

                this._replayCaptureButtonItem.enabled = false;
            }
        }
    }, {
        key: "_replayPauseResumeButtonClicked",
        value: function _replayPauseResumeButtonClicked() {
            if (this._replayPauseResumeButtonItem.toggled) WebInspector.replayManager.pausePlayback();else WebInspector.replayManager.replayToCompletion();
        }
    }, {
        key: "_captureStarted",
        value: function _captureStarted() {
            this._replayCaptureButtonItem.enabled = true;
        }
    }, {
        key: "_captureStopped",
        value: function _captureStopped() {
            this._replayCaptureButtonItem.activated = false;
            this._replayPauseResumeButtonItem.enabled = true;
        }
    }, {
        key: "_playbackStarted",
        value: function _playbackStarted() {
            this._replayPauseResumeButtonItem.toggled = true;
        }
    }, {
        key: "_playbackPaused",
        value: function _playbackPaused() {
            this._replayPauseResumeButtonItem.toggled = false;
        }
    }, {
        key: "viewMode",
        get: function get() {
            return this._viewMode;
        }
    }, {
        key: "hasSelectedElement",
        get: function get() {
            return !!this._contentTreeOutline.selectedTreeElement || !!this._recordingsTreeOutline.selectedTreeElement;
        }
    }, {
        key: "contentTreeOutlineLabel",
        get: function get() {
            return this._timelineEventsTitleBarElement.textContent;
        },
        set: function set(label) {
            label = label || WebInspector.UIString("Timeline Events");

            this._timelineEventsTitleBarElement.textContent = label;
            this.filterBar.placeholder = WebInspector.UIString("Filter %s").format(label);
        }
    }, {
        key: "contentTreeOutlineScopeBar",
        get: function get() {
            return this._timelineEventsTitleBarScopeContainer.children;
        },
        set: function set(scopeBar) {
            this._timelineEventsTitleBarScopeContainer.removeChildren();

            if (!scopeBar || !scopeBar.element) return;

            this._timelineEventsTitleBarScopeContainer.appendChild(scopeBar.element);
        }
    }]);

    return TimelineSidebarPanel;
})(WebInspector.NavigationSidebarPanel);

WebInspector.TimelineSidebarPanel.ViewMode = {
    Timelines: "timeline-sidebar-panel-view-mode-timelines",
    RenderingFrames: "timeline-sidebar-panel-view-mode-frames"
};

WebInspector.TimelineSidebarPanel.HiddenStyleClassName = "hidden";
WebInspector.TimelineSidebarPanel.StatusBarStyleClass = "status-bar";
WebInspector.TimelineSidebarPanel.RecordGlyphStyleClass = "record-glyph";
WebInspector.TimelineSidebarPanel.RecordGlyphRecordingStyleClass = "recording";
WebInspector.TimelineSidebarPanel.RecordGlyphRecordingForcedStyleClass = "forced";
WebInspector.TimelineSidebarPanel.RecordStatusStyleClass = "record-status";
WebInspector.TimelineSidebarPanel.TitleBarStyleClass = "title-bar";
WebInspector.TimelineSidebarPanel.TitleBarTextStyleClass = "title-bar-text";
WebInspector.TimelineSidebarPanel.TitleBarScopeBarStyleClass = "title-bar-scope-bar";
WebInspector.TimelineSidebarPanel.TimelinesTitleBarStyleClass = "timelines";
WebInspector.TimelineSidebarPanel.TimelineEventsTitleBarStyleClass = "timeline-events";
WebInspector.TimelineSidebarPanel.TimelinesContentContainerStyleClass = "timelines-content";
WebInspector.TimelineSidebarPanel.CloseButtonStyleClass = "close-button";
WebInspector.TimelineSidebarPanel.LargeIconStyleClass = "large";
WebInspector.TimelineSidebarPanel.StopwatchIconStyleClass = "stopwatch-icon";
WebInspector.TimelineSidebarPanel.NetworkIconStyleClass = "network-icon";
WebInspector.TimelineSidebarPanel.ColorsIconStyleClass = "colors-icon";
WebInspector.TimelineSidebarPanel.ScriptIconStyleClass = "script-icon";
WebInspector.TimelineSidebarPanel.RenderingFrameIconStyleClass = "rendering-frame-icon";
WebInspector.TimelineSidebarPanel.TimelineRecordingContentViewShowingStyleClass = "timeline-recording-content-view-showing";

WebInspector.TimelineSidebarPanel.ShowingTimelineRecordingContentViewCookieKey = "timeline-sidebar-panel-showing-timeline-recording-content-view";
WebInspector.TimelineSidebarPanel.SelectedTimelineViewIdentifierCookieKey = "timeline-sidebar-panel-selected-timeline-view-identifier";
WebInspector.TimelineSidebarPanel.OverviewTimelineIdentifierCookieValue = "overview";
