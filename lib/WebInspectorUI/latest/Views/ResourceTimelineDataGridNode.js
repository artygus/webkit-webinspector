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

WebInspector.ResourceTimelineDataGridNode = (function (_WebInspector$TimelineDataGridNode) {
    _inherits(ResourceTimelineDataGridNode, _WebInspector$TimelineDataGridNode);

    function ResourceTimelineDataGridNode(resourceTimelineRecord, graphOnly, graphDataSource) {
        _classCallCheck(this, ResourceTimelineDataGridNode);

        _get(Object.getPrototypeOf(ResourceTimelineDataGridNode.prototype), "constructor", this).call(this, graphOnly, graphDataSource);

        this._resource = resourceTimelineRecord.resource;
        this._record = resourceTimelineRecord;

        this._record.addEventListener(WebInspector.TimelineRecord.Event.Updated, graphOnly ? this._timelineRecordUpdated : this._needsRefresh, this);

        if (!graphOnly) {
            this._resource.addEventListener(WebInspector.Resource.Event.URLDidChange, this._needsRefresh, this);
            this._resource.addEventListener(WebInspector.Resource.Event.TypeDidChange, this._needsRefresh, this);
            this._resource.addEventListener(WebInspector.Resource.Event.LoadingDidFinish, this._needsRefresh, this);
            this._resource.addEventListener(WebInspector.Resource.Event.LoadingDidFail, this._needsRefresh, this);
            this._resource.addEventListener(WebInspector.Resource.Event.SizeDidChange, this._needsRefresh, this);
            this._resource.addEventListener(WebInspector.Resource.Event.TransferSizeDidChange, this._needsRefresh, this);
        }
    }

    // Public

    _createClass(ResourceTimelineDataGridNode, [{
        key: "createCellContent",
        value: function createCellContent(columnIdentifier, cell) {
            var resource = this._resource;

            if (resource.failed || resource.canceled || resource.statusCode >= 400) cell.classList.add("error");

            var emptyValuePlaceholderString = "—";
            var value = this.data[columnIdentifier];

            switch (columnIdentifier) {
                case "type":
                    return WebInspector.Resource.displayNameForType(value);

                case "statusCode":
                    cell.title = resource.statusText || "";
                    return value || emptyValuePlaceholderString;

                case "cached":
                    return value ? WebInspector.UIString("Yes") : WebInspector.UIString("No");

                case "domain":
                    return value || emptyValuePlaceholderString;

                case "size":
                case "transferSize":
                    return isNaN(value) ? emptyValuePlaceholderString : Number.bytesToString(value, true);

                case "requestSent":
                case "latency":
                case "duration":
                    return isNaN(value) ? emptyValuePlaceholderString : Number.secondsToString(value, true);
            }

            return _get(Object.getPrototypeOf(ResourceTimelineDataGridNode.prototype), "createCellContent", this).call(this, columnIdentifier, cell);
        }
    }, {
        key: "refresh",
        value: function refresh() {
            if (this._scheduledRefreshIdentifier) {
                cancelAnimationFrame(this._scheduledRefreshIdentifier);
                delete this._scheduledRefreshIdentifier;
            }

            delete this._cachedData;

            _get(Object.getPrototypeOf(ResourceTimelineDataGridNode.prototype), "refresh", this).call(this);
        }

        // Private

    }, {
        key: "_needsRefresh",
        value: function _needsRefresh() {
            if (this.dataGrid instanceof WebInspector.TimelineDataGrid) {
                this.dataGrid.dataGridNodeNeedsRefresh(this);
                return;
            }

            if (this._scheduledRefreshIdentifier) return;

            this._scheduledRefreshIdentifier = requestAnimationFrame(this.refresh.bind(this));
        }
    }, {
        key: "_timelineRecordUpdated",
        value: function _timelineRecordUpdated(event) {
            if (this.isRecordVisible(this._record)) this.needsGraphRefresh();
        }
    }, {
        key: "records",
        get: function get() {
            return [this._record];
        }
    }, {
        key: "resource",
        get: function get() {
            return this._resource;
        }
    }, {
        key: "data",
        get: function get() {
            if (this._cachedData) return this._cachedData;

            var resource = this._resource;
            var data = {};

            if (!this._graphOnly) {
                var zeroTime = this.graphDataSource ? this.graphDataSource.zeroTime : 0;

                data.domain = WebInspector.displayNameForHost(resource.urlComponents.host);
                data.scheme = resource.urlComponents.scheme ? resource.urlComponents.scheme.toUpperCase() : "";
                data.method = resource.requestMethod;
                data.type = resource.type;
                data.statusCode = resource.statusCode;
                data.cached = resource.cached;
                data.size = resource.size;
                data.transferSize = resource.transferSize;
                data.requestSent = resource.requestSentTimestamp - zeroTime;
                data.duration = resource.receiveDuration;
                data.latency = resource.latency;
            }

            data.graph = this._record.startTime;

            this._cachedData = data;
            return data;
        }
    }]);

    return ResourceTimelineDataGridNode;
})(WebInspector.TimelineDataGridNode);
