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

WebInspector.RuntimeManager = (function (_WebInspector$Object) {
    _inherits(RuntimeManager, _WebInspector$Object);

    function RuntimeManager() {
        _classCallCheck(this, RuntimeManager);

        _get(Object.getPrototypeOf(RuntimeManager.prototype), "constructor", this).call(this);

        // Enable the RuntimeAgent to receive notification of execution contexts.
        RuntimeAgent.enable();
    }

    // Public

    _createClass(RuntimeManager, [{
        key: "evaluateInInspectedWindow",
        value: function evaluateInInspectedWindow(expression, objectGroup, includeCommandLineAPI, doNotPauseOnExceptionsAndMuteConsole, returnByValue, generatePreview, saveResult, callback) {
            if (!expression) {
                // There is no expression, so the completion should happen against global properties.
                expression = "this";
            }

            expression = appendWebInspectorSourceURL(expression);

            function evalCallback(error, result, wasThrown, savedResultIndex) {
                this.dispatchEventToListeners(WebInspector.RuntimeManager.Event.DidEvaluate, { objectGroup: objectGroup });

                if (error) {
                    console.error(error);
                    callback(null, false);
                    return;
                }

                if (returnByValue) callback(null, wasThrown, wasThrown ? null : result, savedResultIndex);else callback(WebInspector.RemoteObject.fromPayload(result), wasThrown, savedResultIndex);
            }

            if (WebInspector.debuggerManager.activeCallFrame) {
                // COMPATIBILITY (iOS 8): "saveResult" did not exist.
                DebuggerAgent.evaluateOnCallFrame.invoke({ callFrameId: WebInspector.debuggerManager.activeCallFrame.id, expression: expression, objectGroup: objectGroup, includeCommandLineAPI: includeCommandLineAPI, doNotPauseOnExceptionsAndMuteConsole: doNotPauseOnExceptionsAndMuteConsole, returnByValue: returnByValue, generatePreview: generatePreview, saveResult: saveResult }, evalCallback.bind(this));
                return;
            }

            // COMPATIBILITY (iOS 8): "saveResult" did not exist.
            var contextId = WebInspector.quickConsole.executionContextIdentifier;
            RuntimeAgent.evaluate.invoke({ expression: expression, objectGroup: objectGroup, includeCommandLineAPI: includeCommandLineAPI, doNotPauseOnExceptionsAndMuteConsole: doNotPauseOnExceptionsAndMuteConsole, contextId: contextId, returnByValue: returnByValue, generatePreview: generatePreview, saveResult: saveResult }, evalCallback.bind(this));
        }
    }, {
        key: "saveResult",
        value: function saveResult(remoteObject, callback) {
            console.assert(remoteObject instanceof WebInspector.RemoteObject);

            // COMPATIBILITY (iOS 8): Runtime.saveResult did not exist.
            if (!RuntimeAgent.saveResult) {
                callback(undefined);
                return;
            }

            function mycallback(error, savedResultIndex) {
                callback(savedResultIndex);
            }

            if (remoteObject.objectId) RuntimeAgent.saveResult(remoteObject.asCallArgument(), mycallback);else RuntimeAgent.saveResult(remoteObject.asCallArgument(), WebInspector.quickConsole.executionContextIdentifier, mycallback);
        }
    }, {
        key: "getPropertiesForRemoteObject",
        value: function getPropertiesForRemoteObject(objectId, callback) {
            RuntimeAgent.getProperties(objectId, function (error, result) {
                if (error) {
                    callback(error);
                    return;
                }

                var properties = new Map();
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = result[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var property = _step.value;

                        properties.set(property.name, property);
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

                callback(null, properties);
            });
        }
    }]);

    return RuntimeManager;
})(WebInspector.Object);

WebInspector.RuntimeManager.Event = {
    DidEvaluate: "runtime-manager-did-evaluate"
};
