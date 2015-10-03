/*
 * Copyright (C) 2013 Google Inc. All rights reserved.
 * Copyright (C) 2013, 2014 Apple Inc. All rights reserved.
 * Copyright (C) 2014 University of Washington. All rights reserved.
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

// DO NOT EDIT THIS FILE. It is automatically generated from Inspector-iOS-6.0.json
// by the script: Source/JavaScriptCore/inspector/scripts/generate-inspector-protocol-bindings.py

// Inspector.
InspectorBackend.registerInspectorDispatcher = InspectorBackend.registerDomainDispatcher.bind(InspectorBackend, "Inspector");
InspectorBackend.registerEvent("Inspector.evaluateForTestInFrontend", ["testCallId", "script"]);
InspectorBackend.registerEvent("Inspector.inspect", ["object", "hints"]);
InspectorBackend.registerEvent("Inspector.didCreateWorker", ["id", "url", "isShared"]);
InspectorBackend.registerEvent("Inspector.didDestroyWorker", ["id"]);
InspectorBackend.registerCommand("Inspector.enable", [], []);
InspectorBackend.registerCommand("Inspector.disable", [], []);

// Page.
InspectorBackend.registerPageDispatcher = InspectorBackend.registerDomainDispatcher.bind(InspectorBackend, "Page");
InspectorBackend.registerEnum("Page.ResourceType", { Document: "Document", Stylesheet: "Stylesheet", Image: "Image", Font: "Font", Script: "Script", XHR: "XHR", WebSocket: "WebSocket", Other: "Other" });
InspectorBackend.registerEvent("Page.domContentEventFired", ["timestamp"]);
InspectorBackend.registerEvent("Page.loadEventFired", ["timestamp"]);
InspectorBackend.registerEvent("Page.frameNavigated", ["frame"]);
InspectorBackend.registerEvent("Page.frameDetached", ["frameId"]);
InspectorBackend.registerCommand("Page.enable", [], []);
InspectorBackend.registerCommand("Page.disable", [], []);
InspectorBackend.registerCommand("Page.addScriptToEvaluateOnLoad", [{ "name": "scriptSource", "type": "string", "optional": false }], ["identifier"]);
InspectorBackend.registerCommand("Page.removeScriptToEvaluateOnLoad", [{ "name": "identifier", "type": "string", "optional": false }], []);
InspectorBackend.registerCommand("Page.reload", [{ "name": "ignoreCache", "type": "boolean", "optional": true }, { "name": "scriptToEvaluateOnLoad", "type": "string", "optional": true }], []);
InspectorBackend.registerCommand("Page.navigate", [{ "name": "url", "type": "string", "optional": false }], []);
InspectorBackend.registerCommand("Page.getCookies", [], ["cookies", "cookiesString"]);
InspectorBackend.registerCommand("Page.deleteCookie", [{ "name": "cookieName", "type": "string", "optional": false }, { "name": "domain", "type": "string", "optional": false }], []);
InspectorBackend.registerCommand("Page.getResourceTree", [], ["frameTree"]);
InspectorBackend.registerCommand("Page.getResourceContent", [{ "name": "frameId", "type": "string", "optional": false }, { "name": "url", "type": "string", "optional": false }], ["content", "base64Encoded"]);
InspectorBackend.registerCommand("Page.searchInResource", [{ "name": "frameId", "type": "string", "optional": false }, { "name": "url", "type": "string", "optional": false }, { "name": "query", "type": "string", "optional": false }, { "name": "caseSensitive", "type": "boolean", "optional": true }, { "name": "isRegex", "type": "boolean", "optional": true }], ["result"]);
InspectorBackend.registerCommand("Page.searchInResources", [{ "name": "text", "type": "string", "optional": false }, { "name": "caseSensitive", "type": "boolean", "optional": true }, { "name": "isRegex", "type": "boolean", "optional": true }], ["result"]);
InspectorBackend.registerCommand("Page.setDocumentContent", [{ "name": "frameId", "type": "string", "optional": false }, { "name": "html", "type": "string", "optional": false }], []);
InspectorBackend.registerCommand("Page.setShowPaintRects", [{ "name": "result", "type": "boolean", "optional": false }], []);
InspectorBackend.registerCommand("Page.getScriptExecutionStatus", [], ["result"]);
InspectorBackend.registerCommand("Page.setScriptExecutionDisabled", [{ "name": "value", "type": "boolean", "optional": false }], []);

// Runtime.
InspectorBackend.registerEnum("Runtime.RemoteObjectType", { Object: "object", Function: "function", Undefined: "undefined", String: "string", Number: "number", Boolean: "boolean" });
InspectorBackend.registerEnum("Runtime.RemoteObjectSubtype", { Array: "array", Null: "null", Node: "node", Regexp: "regexp", Date: "date" });
InspectorBackend.registerCommand("Runtime.evaluate", [{ "name": "expression", "type": "string", "optional": false }, { "name": "objectGroup", "type": "string", "optional": true }, { "name": "includeCommandLineAPI", "type": "boolean", "optional": true }, { "name": "doNotPauseOnExceptionsAndMuteConsole", "type": "boolean", "optional": true }, { "name": "frameId", "type": "string", "optional": true }, { "name": "returnByValue", "type": "boolean", "optional": true }], ["result", "wasThrown"]);
InspectorBackend.registerCommand("Runtime.callFunctionOn", [{ "name": "objectId", "type": "string", "optional": false }, { "name": "functionDeclaration", "type": "string", "optional": false }, { "name": "arguments", "type": "object", "optional": true }, { "name": "doNotPauseOnExceptionsAndMuteConsole", "type": "boolean", "optional": true }, { "name": "returnByValue", "type": "boolean", "optional": true }], ["result", "wasThrown"]);
InspectorBackend.registerCommand("Runtime.getProperties", [{ "name": "objectId", "type": "string", "optional": false }, { "name": "ownProperties", "type": "boolean", "optional": true }], ["result"]);
InspectorBackend.registerCommand("Runtime.releaseObject", [{ "name": "objectId", "type": "string", "optional": false }], []);
InspectorBackend.registerCommand("Runtime.releaseObjectGroup", [{ "name": "objectGroup", "type": "string", "optional": false }], []);
InspectorBackend.registerCommand("Runtime.run", [], []);

// Console.
InspectorBackend.registerConsoleDispatcher = InspectorBackend.registerDomainDispatcher.bind(InspectorBackend, "Console");
InspectorBackend.registerEnum("Console.ConsoleMessageSource", { HTML: "html", XML: "xml", Javascript: "javascript", Network: "network", ConsoleAPI: "console-api", Other: "other" });
InspectorBackend.registerEnum("Console.ConsoleMessageLevel", { Tip: "tip", Log: "log", Warning: "warning", Error: "error", Debug: "debug" });
InspectorBackend.registerEnum("Console.ConsoleMessageType", { Log: "log", Dir: "dir", DirXML: "dirxml", Trace: "trace", StartGroup: "startGroup", StartGroupCollapsed: "startGroupCollapsed", EndGroup: "endGroup", Assert: "assert" });
InspectorBackend.registerEvent("Console.messageAdded", ["message"]);
InspectorBackend.registerEvent("Console.messageRepeatCountUpdated", ["count"]);
InspectorBackend.registerEvent("Console.messagesCleared", []);
InspectorBackend.registerCommand("Console.enable", [], []);
InspectorBackend.registerCommand("Console.disable", [], []);
InspectorBackend.registerCommand("Console.clearMessages", [], []);
InspectorBackend.registerCommand("Console.setMonitoringXHREnabled", [{ "name": "enabled", "type": "boolean", "optional": false }], []);
InspectorBackend.registerCommand("Console.addInspectedNode", [{ "name": "nodeId", "type": "number", "optional": false }], []);

// Network.
InspectorBackend.registerNetworkDispatcher = InspectorBackend.registerDomainDispatcher.bind(InspectorBackend, "Network");
InspectorBackend.registerEnum("Network.InitiatorType", { Parser: "parser", Script: "script", Other: "other" });
InspectorBackend.registerEvent("Network.requestWillBeSent", ["requestId", "frameId", "loaderId", "documentURL", "request", "timestamp", "initiator", "redirectResponse"]);
InspectorBackend.registerEvent("Network.requestServedFromCache", ["requestId"]);
InspectorBackend.registerEvent("Network.responseReceived", ["requestId", "frameId", "loaderId", "timestamp", "type", "response"]);
InspectorBackend.registerEvent("Network.dataReceived", ["requestId", "timestamp", "dataLength", "encodedDataLength"]);
InspectorBackend.registerEvent("Network.loadingFinished", ["requestId", "timestamp"]);
InspectorBackend.registerEvent("Network.loadingFailed", ["requestId", "timestamp", "errorText", "canceled"]);
InspectorBackend.registerEvent("Network.requestServedFromMemoryCache", ["requestId", "frameId", "loaderId", "documentURL", "timestamp", "initiator", "resource"]);
InspectorBackend.registerEvent("Network.webSocketWillSendHandshakeRequest", ["requestId", "timestamp", "request"]);
InspectorBackend.registerEvent("Network.webSocketHandshakeResponseReceived", ["requestId", "timestamp", "response"]);
InspectorBackend.registerEvent("Network.webSocketCreated", ["requestId", "url"]);
InspectorBackend.registerEvent("Network.webSocketClosed", ["requestId", "timestamp"]);
InspectorBackend.registerEvent("Network.webSocketFrameReceived", ["requestId", "timestamp", "response"]);
InspectorBackend.registerEvent("Network.webSocketFrameError", ["requestId", "timestamp", "errorMessage"]);
InspectorBackend.registerEvent("Network.webSocketFrameSent", ["requestId", "timestamp", "response"]);
InspectorBackend.registerCommand("Network.enable", [], []);
InspectorBackend.registerCommand("Network.disable", [], []);
InspectorBackend.registerCommand("Network.setExtraHTTPHeaders", [{ "name": "headers", "type": "object", "optional": false }], []);
InspectorBackend.registerCommand("Network.getResponseBody", [{ "name": "requestId", "type": "string", "optional": false }], ["body", "base64Encoded"]);
InspectorBackend.registerCommand("Network.canClearBrowserCache", [], ["result"]);
InspectorBackend.registerCommand("Network.clearBrowserCache", [], []);
InspectorBackend.registerCommand("Network.canClearBrowserCookies", [], ["result"]);
InspectorBackend.registerCommand("Network.clearBrowserCookies", [], []);
InspectorBackend.registerCommand("Network.setCacheDisabled", [{ "name": "cacheDisabled", "type": "boolean", "optional": false }], []);

// Database.
InspectorBackend.registerDatabaseDispatcher = InspectorBackend.registerDomainDispatcher.bind(InspectorBackend, "Database");
InspectorBackend.registerEvent("Database.addDatabase", ["database"]);
InspectorBackend.registerEvent("Database.sqlTransactionSucceeded", ["transactionId", "columnNames", "values"]);
InspectorBackend.registerEvent("Database.sqlTransactionFailed", ["transactionId", "sqlError"]);
InspectorBackend.registerCommand("Database.enable", [], []);
InspectorBackend.registerCommand("Database.disable", [], []);
InspectorBackend.registerCommand("Database.getDatabaseTableNames", [{ "name": "databaseId", "type": "string", "optional": false }], ["tableNames"]);
InspectorBackend.registerCommand("Database.executeSQL", [{ "name": "databaseId", "type": "string", "optional": false }, { "name": "query", "type": "string", "optional": false }], ["success", "transactionId"]);

// DOMStorage.
InspectorBackend.registerDOMStorageDispatcher = InspectorBackend.registerDomainDispatcher.bind(InspectorBackend, "DOMStorage");
InspectorBackend.registerEvent("DOMStorage.addDOMStorage", ["storage"]);
InspectorBackend.registerEvent("DOMStorage.updateDOMStorage", ["storageId"]);
InspectorBackend.registerCommand("DOMStorage.enable", [], []);
InspectorBackend.registerCommand("DOMStorage.disable", [], []);
InspectorBackend.registerCommand("DOMStorage.getDOMStorageEntries", [{ "name": "storageId", "type": "string", "optional": false }], ["entries"]);
InspectorBackend.registerCommand("DOMStorage.setDOMStorageItem", [{ "name": "storageId", "type": "string", "optional": false }, { "name": "key", "type": "string", "optional": false }, { "name": "value", "type": "string", "optional": false }], ["success"]);
InspectorBackend.registerCommand("DOMStorage.removeDOMStorageItem", [{ "name": "storageId", "type": "string", "optional": false }, { "name": "key", "type": "string", "optional": false }], ["success"]);

// ApplicationCache.
InspectorBackend.registerApplicationCacheDispatcher = InspectorBackend.registerDomainDispatcher.bind(InspectorBackend, "ApplicationCache");
InspectorBackend.registerEvent("ApplicationCache.applicationCacheStatusUpdated", ["frameId", "manifestURL", "status"]);
InspectorBackend.registerEvent("ApplicationCache.networkStateUpdated", ["isNowOnline"]);
InspectorBackend.registerCommand("ApplicationCache.getFramesWithManifests", [], ["frameIds"]);
InspectorBackend.registerCommand("ApplicationCache.enable", [], []);
InspectorBackend.registerCommand("ApplicationCache.getManifestForFrame", [{ "name": "frameId", "type": "string", "optional": false }], ["manifestURL"]);
InspectorBackend.registerCommand("ApplicationCache.getApplicationCacheForFrame", [{ "name": "frameId", "type": "string", "optional": false }], ["applicationCache"]);

// DOM.
InspectorBackend.registerDOMDispatcher = InspectorBackend.registerDomainDispatcher.bind(InspectorBackend, "DOM");
InspectorBackend.registerEvent("DOM.documentUpdated", []);
InspectorBackend.registerEvent("DOM.setChildNodes", ["parentId", "nodes"]);
InspectorBackend.registerEvent("DOM.attributeModified", ["nodeId", "name", "value"]);
InspectorBackend.registerEvent("DOM.attributeRemoved", ["nodeId", "name"]);
InspectorBackend.registerEvent("DOM.inlineStyleInvalidated", ["nodeIds"]);
InspectorBackend.registerEvent("DOM.characterDataModified", ["nodeId", "characterData"]);
InspectorBackend.registerEvent("DOM.childNodeCountUpdated", ["nodeId", "childNodeCount"]);
InspectorBackend.registerEvent("DOM.childNodeInserted", ["parentNodeId", "previousNodeId", "node"]);
InspectorBackend.registerEvent("DOM.childNodeRemoved", ["parentNodeId", "nodeId"]);
InspectorBackend.registerEvent("DOM.shadowRootPushed", ["hostId", "root"]);
InspectorBackend.registerEvent("DOM.shadowRootPopped", ["hostId", "rootId"]);
InspectorBackend.registerCommand("DOM.getDocument", [], ["root"]);
InspectorBackend.registerCommand("DOM.requestChildNodes", [{ "name": "nodeId", "type": "number", "optional": false }], []);
InspectorBackend.registerCommand("DOM.querySelector", [{ "name": "nodeId", "type": "number", "optional": false }, { "name": "selector", "type": "string", "optional": false }], ["nodeId"]);
InspectorBackend.registerCommand("DOM.querySelectorAll", [{ "name": "nodeId", "type": "number", "optional": false }, { "name": "selector", "type": "string", "optional": false }], ["nodeIds"]);
InspectorBackend.registerCommand("DOM.setNodeName", [{ "name": "nodeId", "type": "number", "optional": false }, { "name": "name", "type": "string", "optional": false }], ["nodeId"]);
InspectorBackend.registerCommand("DOM.setNodeValue", [{ "name": "nodeId", "type": "number", "optional": false }, { "name": "value", "type": "string", "optional": false }], []);
InspectorBackend.registerCommand("DOM.removeNode", [{ "name": "nodeId", "type": "number", "optional": false }], []);
InspectorBackend.registerCommand("DOM.setAttributeValue", [{ "name": "nodeId", "type": "number", "optional": false }, { "name": "name", "type": "string", "optional": false }, { "name": "value", "type": "string", "optional": false }], []);
InspectorBackend.registerCommand("DOM.setAttributesAsText", [{ "name": "nodeId", "type": "number", "optional": false }, { "name": "text", "type": "string", "optional": false }, { "name": "name", "type": "string", "optional": true }], []);
InspectorBackend.registerCommand("DOM.removeAttribute", [{ "name": "nodeId", "type": "number", "optional": false }, { "name": "name", "type": "string", "optional": false }], []);
InspectorBackend.registerCommand("DOM.getEventListenersForNode", [{ "name": "nodeId", "type": "number", "optional": false }], ["listeners"]);
InspectorBackend.registerCommand("DOM.getOuterHTML", [{ "name": "nodeId", "type": "number", "optional": false }], ["outerHTML"]);
InspectorBackend.registerCommand("DOM.setOuterHTML", [{ "name": "nodeId", "type": "number", "optional": false }, { "name": "outerHTML", "type": "string", "optional": false }], []);
InspectorBackend.registerCommand("DOM.performSearch", [{ "name": "query", "type": "string", "optional": false }], ["searchId", "resultCount"]);
InspectorBackend.registerCommand("DOM.getSearchResults", [{ "name": "searchId", "type": "string", "optional": false }, { "name": "fromIndex", "type": "number", "optional": false }, { "name": "toIndex", "type": "number", "optional": false }], ["nodeIds"]);
InspectorBackend.registerCommand("DOM.discardSearchResults", [{ "name": "searchId", "type": "string", "optional": false }], []);
InspectorBackend.registerCommand("DOM.requestNode", [{ "name": "objectId", "type": "string", "optional": false }], ["nodeId"]);
InspectorBackend.registerCommand("DOM.setInspectModeEnabled", [{ "name": "enabled", "type": "boolean", "optional": false }, { "name": "highlightConfig", "type": "object", "optional": true }], []);
InspectorBackend.registerCommand("DOM.highlightRect", [{ "name": "x", "type": "number", "optional": false }, { "name": "y", "type": "number", "optional": false }, { "name": "width", "type": "number", "optional": false }, { "name": "height", "type": "number", "optional": false }, { "name": "color", "type": "object", "optional": true }, { "name": "outlineColor", "type": "object", "optional": true }], []);
InspectorBackend.registerCommand("DOM.highlightNode", [{ "name": "nodeId", "type": "number", "optional": false }, { "name": "highlightConfig", "type": "object", "optional": false }], []);
InspectorBackend.registerCommand("DOM.hideHighlight", [], []);
InspectorBackend.registerCommand("DOM.highlightFrame", [{ "name": "frameId", "type": "string", "optional": false }, { "name": "contentColor", "type": "object", "optional": true }, { "name": "contentOutlineColor", "type": "object", "optional": true }], []);
InspectorBackend.registerCommand("DOM.pushNodeByPathToFrontend", [{ "name": "path", "type": "string", "optional": false }], ["nodeId"]);
InspectorBackend.registerCommand("DOM.resolveNode", [{ "name": "nodeId", "type": "number", "optional": false }, { "name": "objectGroup", "type": "string", "optional": true }], ["object"]);
InspectorBackend.registerCommand("DOM.getAttributes", [{ "name": "nodeId", "type": "number", "optional": false }], ["attributes"]);
InspectorBackend.registerCommand("DOM.moveTo", [{ "name": "nodeId", "type": "number", "optional": false }, { "name": "targetNodeId", "type": "number", "optional": false }, { "name": "insertBeforeNodeId", "type": "number", "optional": true }], ["nodeId"]);
InspectorBackend.registerCommand("DOM.setTouchEmulationEnabled", [{ "name": "enabled", "type": "boolean", "optional": false }], []);
InspectorBackend.registerCommand("DOM.undo", [], []);
InspectorBackend.registerCommand("DOM.redo", [], []);
InspectorBackend.registerCommand("DOM.markUndoableState", [], []);

// CSS.
InspectorBackend.registerCSSDispatcher = InspectorBackend.registerDomainDispatcher.bind(InspectorBackend, "CSS");
InspectorBackend.registerEnum("CSS.CSSRuleOrigin", { User: "user", UserAgent: "user-agent", Inspector: "inspector", Regular: "regular" });
InspectorBackend.registerEnum("CSS.CSSPropertyStatus", { Active: "active", Inactive: "inactive", Disabled: "disabled", Style: "style" });
InspectorBackend.registerEnum("CSS.CSSMediaSource", { MediaRule: "mediaRule", ImportRule: "importRule", LinkedSheet: "linkedSheet", InlineSheet: "inlineSheet" });
InspectorBackend.registerEvent("CSS.mediaQueryResultChanged", []);
InspectorBackend.registerEvent("CSS.styleSheetChanged", ["styleSheetId"]);
InspectorBackend.registerCommand("CSS.enable", [], []);
InspectorBackend.registerCommand("CSS.disable", [], []);
InspectorBackend.registerCommand("CSS.getMatchedStylesForNode", [{ "name": "nodeId", "type": "number", "optional": false }, { "name": "forcedPseudoClasses", "type": "object", "optional": true }, { "name": "includePseudo", "type": "boolean", "optional": true }, { "name": "includeInherited", "type": "boolean", "optional": true }], ["matchedCSSRules", "pseudoElements", "inherited"]);
InspectorBackend.registerCommand("CSS.getInlineStylesForNode", [{ "name": "nodeId", "type": "number", "optional": false }], ["inlineStyle", "attributesStyle"]);
InspectorBackend.registerCommand("CSS.getComputedStyleForNode", [{ "name": "nodeId", "type": "number", "optional": false }, { "name": "forcedPseudoClasses", "type": "object", "optional": true }], ["computedStyle"]);
InspectorBackend.registerCommand("CSS.getAllStyleSheets", [], ["headers"]);
InspectorBackend.registerCommand("CSS.getStyleSheet", [{ "name": "styleSheetId", "type": "string", "optional": false }], ["styleSheet"]);
InspectorBackend.registerCommand("CSS.getStyleSheetText", [{ "name": "styleSheetId", "type": "string", "optional": false }], ["text"]);
InspectorBackend.registerCommand("CSS.setStyleSheetText", [{ "name": "styleSheetId", "type": "string", "optional": false }, { "name": "text", "type": "string", "optional": false }], []);
InspectorBackend.registerCommand("CSS.setPropertyText", [{ "name": "styleId", "type": "object", "optional": false }, { "name": "propertyIndex", "type": "number", "optional": false }, { "name": "text", "type": "string", "optional": false }, { "name": "overwrite", "type": "boolean", "optional": false }], ["style"]);
InspectorBackend.registerCommand("CSS.toggleProperty", [{ "name": "styleId", "type": "object", "optional": false }, { "name": "propertyIndex", "type": "number", "optional": false }, { "name": "disable", "type": "boolean", "optional": false }], ["style"]);
InspectorBackend.registerCommand("CSS.setRuleSelector", [{ "name": "ruleId", "type": "object", "optional": false }, { "name": "selector", "type": "string", "optional": false }], ["rule"]);
InspectorBackend.registerCommand("CSS.addRule", [{ "name": "contextNodeId", "type": "number", "optional": false }, { "name": "selector", "type": "string", "optional": false }], ["rule"]);
InspectorBackend.registerCommand("CSS.getSupportedCSSProperties", [], ["cssProperties"]);
InspectorBackend.registerCommand("CSS.startSelectorProfiler", [], []);
InspectorBackend.registerCommand("CSS.stopSelectorProfiler", [], ["profile"]);

// Timeline.
InspectorBackend.registerTimelineDispatcher = InspectorBackend.registerDomainDispatcher.bind(InspectorBackend, "Timeline");
InspectorBackend.registerEnum("Timeline.EventType", { EventDispatch: "EventDispatch", Layout: "Layout", RecalculateStyles: "RecalculateStyles", Paint: "Paint", ParseHTML: "ParseHTML", TimerInstall: "TimerInstall", TimerRemove: "TimerRemove", TimerFire: "TimerFire", EvaluateScript: "EvaluateScript", MarkLoad: "MarkLoad", MarkDOMContent: "MarkDOMContent", TimeStamp: "TimeStamp", ScheduleResourceRequest: "ScheduleResourceRequest", ResourceSendRequest: "ResourceSendRequest", ResourceReceiveResponse: "ResourceReceiveResponse", ResourceReceivedData: "ResourceReceivedData", ResourceFinish: "ResourceFinish", XHRReadyStateChange: "XHRReadyStateChange", XHRLoad: "XHRLoad", FunctionCall: "FunctionCall", GCEvent: "GCEvent", RequestAnimationFrame: "RequestAnimationFrame", CancelAnimationFrame: "CancelAnimationFrame", FireAnimationFrame: "FireAnimationFrame" });
InspectorBackend.registerEvent("Timeline.eventRecorded", ["record"]);
InspectorBackend.registerCommand("Timeline.start", [{ "name": "maxCallStackDepth", "type": "number", "optional": true }], []);
InspectorBackend.registerCommand("Timeline.stop", [], []);

// Debugger.
InspectorBackend.registerDebuggerDispatcher = InspectorBackend.registerDomainDispatcher.bind(InspectorBackend, "Debugger");
InspectorBackend.registerEnum("Debugger.ScopeType", { Global: "global", Local: "local", With: "with", Closure: "closure", Catch: "catch" });
InspectorBackend.registerEvent("Debugger.globalObjectCleared", []);
InspectorBackend.registerEvent("Debugger.scriptParsed", ["scriptId", "url", "startLine", "startColumn", "endLine", "endColumn", "isContentScript", "sourceMapURL"]);
InspectorBackend.registerEvent("Debugger.scriptFailedToParse", ["url", "scriptSource", "startLine", "errorLine", "errorMessage"]);
InspectorBackend.registerEvent("Debugger.breakpointResolved", ["breakpointId", "location"]);
InspectorBackend.registerEvent("Debugger.paused", ["callFrames", "reason", "data"]);
InspectorBackend.registerEvent("Debugger.resumed", []);
InspectorBackend.registerCommand("Debugger.supportsNativeBreakpoints", [], ["result"]);
InspectorBackend.registerCommand("Debugger.enable", [], []);
InspectorBackend.registerCommand("Debugger.disable", [], []);
InspectorBackend.registerCommand("Debugger.setBreakpointsActive", [{ "name": "active", "type": "boolean", "optional": false }], []);
InspectorBackend.registerCommand("Debugger.setBreakpointByUrl", [{ "name": "lineNumber", "type": "number", "optional": false }, { "name": "url", "type": "string", "optional": true }, { "name": "urlRegex", "type": "string", "optional": true }, { "name": "columnNumber", "type": "number", "optional": true }, { "name": "condition", "type": "string", "optional": true }], ["breakpointId", "locations"]);
InspectorBackend.registerCommand("Debugger.setBreakpoint", [{ "name": "location", "type": "object", "optional": false }, { "name": "condition", "type": "string", "optional": true }], ["breakpointId", "actualLocation"]);
InspectorBackend.registerCommand("Debugger.removeBreakpoint", [{ "name": "breakpointId", "type": "string", "optional": false }], []);
InspectorBackend.registerCommand("Debugger.continueToLocation", [{ "name": "location", "type": "object", "optional": false }], []);
InspectorBackend.registerCommand("Debugger.stepOver", [], []);
InspectorBackend.registerCommand("Debugger.stepInto", [], []);
InspectorBackend.registerCommand("Debugger.stepOut", [], []);
InspectorBackend.registerCommand("Debugger.pause", [], []);
InspectorBackend.registerCommand("Debugger.resume", [], []);
InspectorBackend.registerCommand("Debugger.searchInContent", [{ "name": "scriptId", "type": "string", "optional": false }, { "name": "query", "type": "string", "optional": false }, { "name": "caseSensitive", "type": "boolean", "optional": true }, { "name": "isRegex", "type": "boolean", "optional": true }], ["result"]);
InspectorBackend.registerCommand("Debugger.getScriptSource", [{ "name": "scriptId", "type": "string", "optional": false }], ["scriptSource"]);
InspectorBackend.registerCommand("Debugger.getFunctionDetails", [{ "name": "functionId", "type": "string", "optional": false }], ["details"]);
InspectorBackend.registerCommand("Debugger.setPauseOnExceptions", [{ "name": "state", "type": "string", "optional": false }], []);
InspectorBackend.registerCommand("Debugger.evaluateOnCallFrame", [{ "name": "callFrameId", "type": "string", "optional": false }, { "name": "expression", "type": "string", "optional": false }, { "name": "objectGroup", "type": "string", "optional": true }, { "name": "includeCommandLineAPI", "type": "boolean", "optional": true }, { "name": "doNotPauseOnExceptionsAndMuteConsole", "type": "boolean", "optional": true }, { "name": "returnByValue", "type": "boolean", "optional": true }], ["result", "wasThrown"]);

// DOMDebugger.
InspectorBackend.registerEnum("DOMDebugger.DOMBreakpointType", { SubtreeModified: "subtree-modified", AttributeModified: "attribute-modified", NodeRemoved: "node-removed" });
InspectorBackend.registerCommand("DOMDebugger.setDOMBreakpoint", [{ "name": "nodeId", "type": "number", "optional": false }, { "name": "type", "type": "string", "optional": false }], []);
InspectorBackend.registerCommand("DOMDebugger.removeDOMBreakpoint", [{ "name": "nodeId", "type": "number", "optional": false }, { "name": "type", "type": "string", "optional": false }], []);
InspectorBackend.registerCommand("DOMDebugger.setEventListenerBreakpoint", [{ "name": "eventName", "type": "string", "optional": false }], []);
InspectorBackend.registerCommand("DOMDebugger.removeEventListenerBreakpoint", [{ "name": "eventName", "type": "string", "optional": false }], []);
InspectorBackend.registerCommand("DOMDebugger.setInstrumentationBreakpoint", [{ "name": "eventName", "type": "string", "optional": false }], []);
InspectorBackend.registerCommand("DOMDebugger.removeInstrumentationBreakpoint", [{ "name": "eventName", "type": "string", "optional": false }], []);
InspectorBackend.registerCommand("DOMDebugger.setXHRBreakpoint", [{ "name": "url", "type": "string", "optional": false }], []);
InspectorBackend.registerCommand("DOMDebugger.removeXHRBreakpoint", [{ "name": "url", "type": "string", "optional": false }], []);

// Profiler.
InspectorBackend.registerProfilerDispatcher = InspectorBackend.registerDomainDispatcher.bind(InspectorBackend, "Profiler");
InspectorBackend.registerEnum("Profiler.ProfileHeaderTypeId", { CPU: "CPU" });
InspectorBackend.registerEvent("Profiler.addProfileHeader", ["header"]);
InspectorBackend.registerEvent("Profiler.setRecordingProfile", ["isProfiling"]);
InspectorBackend.registerEvent("Profiler.resetProfiles", []);
InspectorBackend.registerCommand("Profiler.enable", [], []);
InspectorBackend.registerCommand("Profiler.disable", [], []);
InspectorBackend.registerCommand("Profiler.start", [], []);
InspectorBackend.registerCommand("Profiler.stop", [], []);
InspectorBackend.registerCommand("Profiler.getProfileHeaders", [], ["headers"]);
InspectorBackend.registerCommand("Profiler.getProfile", [{ "name": "type", "type": "string", "optional": false }, { "name": "uid", "type": "number", "optional": false }], ["profile"]);
InspectorBackend.registerCommand("Profiler.removeProfile", [{ "name": "type", "type": "string", "optional": false }, { "name": "uid", "type": "number", "optional": false }], []);
InspectorBackend.registerCommand("Profiler.clearProfiles", [], []);

// Worker.
InspectorBackend.registerWorkerDispatcher = InspectorBackend.registerDomainDispatcher.bind(InspectorBackend, "Worker");
InspectorBackend.registerEvent("Worker.workerCreated", ["workerId", "url", "inspectorConnected"]);
InspectorBackend.registerEvent("Worker.workerTerminated", ["workerId"]);
InspectorBackend.registerEvent("Worker.dispatchMessageFromWorker", ["workerId", "message"]);
InspectorBackend.registerEvent("Worker.disconnectedFromWorker", []);
InspectorBackend.registerCommand("Worker.setWorkerInspectionEnabled", [{ "name": "value", "type": "boolean", "optional": false }], []);
InspectorBackend.registerCommand("Worker.sendMessageToWorker", [{ "name": "workerId", "type": "number", "optional": false }, { "name": "message", "type": "object", "optional": false }], []);
InspectorBackend.registerCommand("Worker.connectToWorker", [{ "name": "workerId", "type": "number", "optional": false }], []);
InspectorBackend.registerCommand("Worker.disconnectFromWorker", [{ "name": "workerId", "type": "number", "optional": false }], []);
InspectorBackend.registerCommand("Worker.setAutoconnectToWorkers", [{ "name": "value", "type": "boolean", "optional": false }], []);