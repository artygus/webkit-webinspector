var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2014 Apple Inc. All rights reserved.
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

WebInspector.AnalyzerManager = (function (_WebInspector$Object) {
    _inherits(AnalyzerManager, _WebInspector$Object);

    function AnalyzerManager() {
        _classCallCheck(this, AnalyzerManager);

        _get(Object.getPrototypeOf(AnalyzerManager.prototype), "constructor", this).call(this);

        this._eslintConfig = {
            env: {
                "browser": true,
                "node": false
            },
            globals: {
                "document": true
            },
            rules: {
                "consistent-return": 2,
                "curly": 0,
                "eqeqeq": 0,
                "new-parens": 0,
                "no-comma-dangle": 0,
                "no-console": 0,
                "no-constant-condition": 0,
                "no-extra-bind": 2,
                "no-extra-semi": 2,
                "no-proto": 0,
                "no-return-assign": 2,
                "no-trailing-spaces": 2,
                "no-underscore-dangle": 0,
                "no-unused-expressions": 2,
                "no-wrap-func": 2,
                "semi": 2,
                "space-infix-ops": 2,
                "space-return-throw-case": 2,
                "strict": 0,
                "valid-typeof": 2
            }
        };

        this._sourceCodeMessagesMap = new WeakMap();

        WebInspector.SourceCode.addEventListener(WebInspector.SourceCode.Event.ContentDidChange, this._handleSourceCodeContentDidChange, this);
    }

    // Public

    _createClass(AnalyzerManager, [{
        key: "getAnalyzerMessagesForSourceCode",
        value: function getAnalyzerMessagesForSourceCode(sourceCode) {
            return new Promise((function (resolve, reject) {
                var analyzer = WebInspector.AnalyzerManager._typeAnalyzerMap.get(sourceCode.type);
                if (!analyzer) {
                    reject(new Error("This resource type cannot be analyzed."));
                    return;
                }

                if (this._sourceCodeMessagesMap.has(sourceCode)) {
                    resolve(this._sourceCodeMessagesMap.get(sourceCode));
                    return;
                }

                function retrieveAnalyzerMessages(properties) {
                    var analyzerMessages = [];
                    var rawAnalyzerMessages = analyzer.verify(sourceCode.content, this._eslintConfig);

                    // Raw line and column numbers are one-based. SourceCodeLocation expects them to be zero-based so we subtract 1 from each.
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = rawAnalyzerMessages[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var rawAnalyzerMessage = _step.value;

                            analyzerMessages.push(new WebInspector.AnalyzerMessage(new WebInspector.SourceCodeLocation(sourceCode, rawAnalyzerMessage.line - 1, rawAnalyzerMessage.column - 1), rawAnalyzerMessage.message, rawAnalyzerMessage.ruleId));
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

                    this._sourceCodeMessagesMap.set(sourceCode, analyzerMessages);

                    resolve(analyzerMessages);
                }

                sourceCode.requestContent().then(retrieveAnalyzerMessages.bind(this));
            }).bind(this));
        }
    }, {
        key: "sourceCodeCanBeAnalyzed",
        value: function sourceCodeCanBeAnalyzed(sourceCode) {
            return sourceCode.type === WebInspector.Resource.Type.Script;
        }

        // Private

    }, {
        key: "_handleSourceCodeContentDidChange",
        value: function _handleSourceCodeContentDidChange(event) {
            var sourceCode = event.target;

            // Since sourceCode has changed, remove it and its messages from the map so getAnalyzerMessagesForSourceCode will have to reanalyze the next time it is called.
            this._sourceCodeMessagesMap["delete"](sourceCode);
        }
    }]);

    return AnalyzerManager;
})(WebInspector.Object);

WebInspector.AnalyzerManager._typeAnalyzerMap = new Map();
WebInspector.AnalyzerManager._typeAnalyzerMap.set(WebInspector.Resource.Type.Script, eslint);
