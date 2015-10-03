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

InspectorFrontendAPI = {
    _loaded: false,
    _pendingCommands: [],

    savedURL: function savedURL(url) {
        // Not used yet.
    },

    appendedToURL: function appendedToURL(url) {
        // Not used yet.
    },

    isTimelineProfilingEnabled: function isTimelineProfilingEnabled() {
        return WebInspector.timelineManager.isCapturing();
    },

    setTimelineProfilingEnabled: function setTimelineProfilingEnabled(enabled) {
        if (WebInspector.timelineManager.isCapturing() === enabled) return;

        if (enabled) {
            WebInspector.showTimelineTab();
            WebInspector.timelineManager.startCapturing();
        } else {
            WebInspector.timelineManager.stopCapturing();
        }
    },

    setDockingUnavailable: function setDockingUnavailable(unavailable) {
        WebInspector.updateDockingAvailability(!unavailable);
    },

    setDockSide: function setDockSide(side) {
        WebInspector.updateDockedState(side);
    },

    showConsole: function showConsole() {
        WebInspector.showConsoleTab();

        WebInspector.quickConsole.prompt.focus();

        // If the page is still loading, focus the quick console again after tabindex autofocus.
        if (document.readyState !== "complete") document.addEventListener("readystatechange", this);
    },

    handleEvent: function handleEvent(event) {
        console.assert(event.type === "readystatechange");

        if (document.readyState === "complete") {
            WebInspector.quickConsole.prompt.focus();
            document.removeEventListener("readystatechange", this);
        }
    },

    showResources: function showResources() {
        WebInspector.showResourcesTab();
    },

    showMainResourceForFrame: function showMainResourceForFrame(frameIdentifier) {
        WebInspector.showSourceCodeForFrame(frameIdentifier);
    },

    contextMenuItemSelected: function contextMenuItemSelected(id) {
        WebInspector.ContextMenu.contextMenuItemSelected(id);
    },

    contextMenuCleared: function contextMenuCleared() {
        WebInspector.ContextMenu.contextMenuCleared();
    },

    dispatchMessageAsync: function dispatchMessageAsync(messageObject) {
        WebInspector.dispatchMessageFromBackend(messageObject);
    },

    dispatchMessage: function dispatchMessage(messageObject) {
        InspectorBackend.dispatch(messageObject);
    },

    dispatch: function dispatch(signature) {
        if (!InspectorFrontendAPI._loaded) {
            InspectorFrontendAPI._pendingCommands.push(signature);
            return null;
        }

        var methodName = signature.shift();
        console.assert(InspectorFrontendAPI[methodName], "Unexpected InspectorFrontendAPI method name: " + methodName);
        if (!InspectorFrontendAPI[methodName]) return;

        return InspectorFrontendAPI[methodName].apply(InspectorFrontendAPI, signature);
    },

    loadCompleted: function loadCompleted() {
        InspectorFrontendAPI._loaded = true;

        for (var i = 0; i < InspectorFrontendAPI._pendingCommands.length; ++i) InspectorFrontendAPI.dispatch(InspectorFrontendAPI._pendingCommands[i]);

        delete InspectorFrontendAPI._pendingCommands;
    }
};
