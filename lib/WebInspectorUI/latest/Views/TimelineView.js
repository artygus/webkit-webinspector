var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2013, 2015 Apple Inc. All rights reserved.
 * Copyright (C) 2015 University of Washington.
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

WebInspector.TimelineView = (function (_WebInspector$ContentView) {
    _inherits(TimelineView, _WebInspector$ContentView);

    function TimelineView(representedObject, extraArguments) {
        _classCallCheck(this, TimelineView);

        console.assert(extraArguments);
        console.assert(extraArguments.timelineSidebarPanel instanceof WebInspector.TimelineSidebarPanel);

        _get(Object.getPrototypeOf(TimelineView.prototype), "constructor", this).call(this, representedObject);

        // This class should not be instantiated directly. Create a concrete subclass instead.
        console.assert(this.constructor !== WebInspector.TimelineView && this instanceof WebInspector.TimelineView);

        this._timelineSidebarPanel = extraArguments.timelineSidebarPanel;

        this._contentTreeOutline = this._timelineSidebarPanel.createContentTreeOutline();
        this._contentTreeOutline.onselect = this.treeElementSelected.bind(this);
        this._contentTreeOutline.ondeselect = this.treeElementDeselected.bind(this);
        this._contentTreeOutline.__canShowContentViewForTreeElement = this.canShowContentViewForTreeElement.bind(this);

        this.element.classList.add("timeline-view");

        this._zeroTime = 0;
        this._startTime = 0;
        this._endTime = 5;
        this._currentTime = 0;
    }

    // Public

    _createClass(TimelineView, [{
        key: "reset",
        value: function reset() {
            this._contentTreeOutline.removeChildren();
            this._timelineSidebarPanel.hideEmptyContentPlaceholder();
        }
    }, {
        key: "filterDidChange",
        value: function filterDidChange() {
            // Implemented by sub-classes if needed.
        }
    }, {
        key: "matchTreeElementAgainstCustomFilters",
        value: function matchTreeElementAgainstCustomFilters(treeElement) {
            // Implemented by sub-classes if needed.
            return true;
        }
    }, {
        key: "updateLayout",
        value: function updateLayout() {
            if (this._scheduledLayoutUpdateIdentifier) {
                cancelAnimationFrame(this._scheduledLayoutUpdateIdentifier);
                this._scheduledLayoutUpdateIdentifier = undefined;
            }

            // Implemented by sub-classes if needed.
        }
    }, {
        key: "updateLayoutIfNeeded",
        value: function updateLayoutIfNeeded() {
            if (!this._scheduledLayoutUpdateIdentifier) return;
            this.updateLayout();
        }
    }, {
        key: "filterUpdated",
        value: function filterUpdated() {
            this.dispatchEventToListeners(WebInspector.ContentView.Event.SelectionPathComponentsDidChange);
        }

        // Protected

    }, {
        key: "canShowContentViewForTreeElement",
        value: function canShowContentViewForTreeElement(treeElement) {
            // Implemented by sub-classes if needed.

            if (treeElement instanceof WebInspector.TimelineRecordTreeElement) return !!treeElement.sourceCodeLocation;
            return false;
        }
    }, {
        key: "showContentViewForTreeElement",
        value: function showContentViewForTreeElement(treeElement) {
            // Implemented by sub-classes if needed.

            if (!(treeElement instanceof WebInspector.TimelineRecordTreeElement)) {
                console.error("Unknown tree element selected.", treeElement);
                return;
            }

            var sourceCodeLocation = treeElement.sourceCodeLocation;
            if (!sourceCodeLocation) {
                this._timelineSidebarPanel.showTimelineViewForTimeline(this.representedObject);
                return;
            }

            WebInspector.showOriginalOrFormattedSourceCodeLocation(sourceCodeLocation);
        }
    }, {
        key: "treeElementPathComponentSelected",
        value: function treeElementPathComponentSelected(event) {
            // Implemented by sub-classes if needed.
        }
    }, {
        key: "treeElementDeselected",
        value: function treeElementDeselected(treeElement) {
            // Implemented by sub-classes if needed.
        }
    }, {
        key: "treeElementSelected",
        value: function treeElementSelected(treeElement, selectedByUser) {
            // Implemented by sub-classes if needed.

            this.dispatchEventToListeners(WebInspector.ContentView.Event.SelectionPathComponentsDidChange);

            if (!this._timelineSidebarPanel.canShowDifferentContentView()) return;

            if (treeElement instanceof WebInspector.FolderTreeElement) return;

            this.showContentViewForTreeElement(treeElement);
        }
    }, {
        key: "needsLayout",
        value: function needsLayout() {
            if (!this.visible) return;

            if (this._scheduledLayoutUpdateIdentifier) return;

            this._scheduledLayoutUpdateIdentifier = requestAnimationFrame(this.updateLayout.bind(this));
        }
    }, {
        key: "navigationSidebarTreeOutline",
        get: function get() {
            return this._contentTreeOutline;
        }
    }, {
        key: "navigationSidebarTreeOutlineLabel",
        get: function get() {
            // Implemented by sub-classes if needed.
            return null;
        }
    }, {
        key: "navigationSidebarTreeOutlineScopeBar",
        get: function get() {
            return this._scopeBar;
        }
    }, {
        key: "timelineSidebarPanel",
        get: function get() {
            return this._timelineSidebarPanel;
        }
    }, {
        key: "selectionPathComponents",
        get: function get() {
            if (!this._contentTreeOutline.selectedTreeElement || this._contentTreeOutline.selectedTreeElement.hidden) return null;

            var pathComponent = new WebInspector.GeneralTreeElementPathComponent(this._contentTreeOutline.selectedTreeElement);
            pathComponent.addEventListener(WebInspector.HierarchicalPathComponent.Event.SiblingWasSelected, this.treeElementPathComponentSelected, this);
            return [pathComponent];
        }
    }, {
        key: "zeroTime",
        get: function get() {
            return this._zeroTime;
        },
        set: function set(x) {
            if (this._zeroTime === x) return;

            this._zeroTime = x || 0;

            this.needsLayout();
        }
    }, {
        key: "startTime",
        get: function get() {
            return this._startTime;
        },
        set: function set(x) {
            if (this._startTime === x) return;

            this._startTime = x || 0;

            this.needsLayout();
        }
    }, {
        key: "endTime",
        get: function get() {
            return this._endTime;
        },
        set: function set(x) {
            if (this._endTime === x) return;

            this._endTime = x || 0;

            this.needsLayout();
        }
    }, {
        key: "currentTime",
        get: function get() {
            return this._currentTime;
        },
        set: function set(x) {
            if (this._currentTime === x) return;

            var oldCurrentTime = this._currentTime;

            this._currentTime = x || 0;

            function checkIfLayoutIsNeeded(currentTime) {
                // Include some wiggle room since the current time markers can be clipped off the ends a bit and still partially visible.
                var wiggleTime = 0.05; // 50ms
                return this._startTime - wiggleTime <= currentTime && currentTime <= this._endTime + wiggleTime;
            }

            if (checkIfLayoutIsNeeded.call(this, oldCurrentTime) || checkIfLayoutIsNeeded.call(this, this._currentTime)) this.needsLayout();
        }
    }]);

    return TimelineView;
})(WebInspector.ContentView);
