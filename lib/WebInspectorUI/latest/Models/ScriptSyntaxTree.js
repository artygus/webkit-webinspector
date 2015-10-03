var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2014, 2015 Apple Inc. All rights reserved.
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

WebInspector.ScriptSyntaxTree = (function (_WebInspector$Object) {
    _inherits(ScriptSyntaxTree, _WebInspector$Object);

    function ScriptSyntaxTree(sourceText, script) {
        _classCallCheck(this, ScriptSyntaxTree);

        _get(Object.getPrototypeOf(ScriptSyntaxTree.prototype), "constructor", this).call(this);

        console.assert(script && script instanceof WebInspector.Script, script);

        this._script = script;

        try {
            var esprimaSyntaxTree = esprima.parse(sourceText, { range: true });
            this._syntaxTree = this._createInternalSyntaxTree(esprimaSyntaxTree);
            this._parsedSuccessfully = true;
        } catch (error) {
            this._parsedSuccessfully = false;
            this._syntaxTree = null;
            console.error("Couldn't parse JavaScript File: " + script.url, error);
        }
    }

    // Public

    _createClass(ScriptSyntaxTree, [{
        key: "forEachNode",
        value: function forEachNode(callback) {
            console.assert(this._parsedSuccessfully);
            if (!this._parsedSuccessfully) return;

            this._recurse(this._syntaxTree, callback, this._defaultParserState());
        }
    }, {
        key: "filter",
        value: function filter(predicate, startNode) {
            console.assert(startNode && this._parsedSuccessfully);
            if (!this._parsedSuccessfully) return [];

            var nodes = [];
            function filter(node, state) {
                if (predicate(node)) nodes.push(node);else state.skipChildNodes = true;
            }

            this._recurse(startNode, filter, this._defaultParserState());

            return nodes;
        }
    }, {
        key: "filterByRange",
        value: function filterByRange(startOffset, endOffset) {
            console.assert(this._parsedSuccessfully);
            if (!this._parsedSuccessfully) return [];

            var allNodes = [];
            var start = 0;
            var end = 1;
            function filterForNodesInRange(node, state) {
                // program start        range            program end
                // [                 [         ]               ]
                //            [ ]  [   [        ] ]  [ ]

                // If a node's range ends before the range we're interested in starts, we don't need to search any of its
                // enclosing ranges, because, by definition, those enclosing ranges are contained within this node's range.
                if (node.range[end] < startOffset) state.skipChildNodes = true;

                // We are only interested in nodes whose start position is within our range.
                if (startOffset <= node.range[start] && node.range[start] <= endOffset) allNodes.push(node);

                // Once we see nodes that start beyond our range, we can quit traversing the AST. We can do this safely
                // because we know the AST is traversed using depth first search, so it will traverse into enclosing ranges
                // before it traverses into adjacent ranges.
                if (node.range[start] > endOffset) state.shouldStopEarly = true;
            }

            this.forEachNode(filterForNodesInRange);

            return allNodes;
        }
    }, {
        key: "containsNonEmptyReturnStatement",
        value: function containsNonEmptyReturnStatement(startNode) {
            console.assert(startNode && this._parsedSuccessfully);
            if (!this._parsedSuccessfully) return false;

            if (startNode.attachments._hasNonEmptyReturnStatement !== undefined) return startNode.attachments._hasNonEmptyReturnStatement;

            function removeFunctionsFilter(node) {
                return node.type !== WebInspector.ScriptSyntaxTree.NodeType.FunctionExpression && node.type !== WebInspector.ScriptSyntaxTree.NodeType.FunctionDeclaration && node.type !== WebInspector.ScriptSyntaxTree.NodeType.ArrowFunctionExpression;
            }

            var nodes = this.filter(removeFunctionsFilter, startNode);
            var hasNonEmptyReturnStatement = false;
            var returnStatementType = WebInspector.ScriptSyntaxTree.NodeType.ReturnStatement;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var node = _step.value;

                    if (node.type === returnStatementType && node.argument) {
                        hasNonEmptyReturnStatement = true;
                        break;
                    }
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

            startNode.attachments._hasNonEmptyReturnStatement = hasNonEmptyReturnStatement;

            return hasNonEmptyReturnStatement;
        }
    }, {
        key: "updateTypes",
        value: function updateTypes(nodesToUpdate, callback) {
            console.assert(RuntimeAgent.getRuntimeTypesForVariablesAtOffsets);
            console.assert(Array.isArray(nodesToUpdate) && this._parsedSuccessfully);

            if (!this._parsedSuccessfully) return;

            var allRequests = [];
            var allRequestNodes = [];
            var sourceID = this._script.id;

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = nodesToUpdate[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var node = _step2.value;

                    switch (node.type) {
                        case WebInspector.ScriptSyntaxTree.NodeType.FunctionDeclaration:
                        case WebInspector.ScriptSyntaxTree.NodeType.FunctionExpression:
                        case WebInspector.ScriptSyntaxTree.NodeType.ArrowFunctionExpression:
                            var _iteratorNormalCompletion3 = true;
                            var _didIteratorError3 = false;
                            var _iteratorError3 = undefined;

                            try {
                                for (var _iterator3 = node.params[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                    var param = _step3.value;
                                    var _iteratorNormalCompletion4 = true;
                                    var _didIteratorError4 = false;
                                    var _iteratorError4 = undefined;

                                    try {
                                        for (var _iterator4 = this._gatherIdentifiersInDeclaration(param)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                            var identifier = _step4.value;

                                            allRequests.push({
                                                typeInformationDescriptor: WebInspector.ScriptSyntaxTree.TypeProfilerSearchDescriptor.NormalExpression,
                                                sourceID: sourceID,
                                                divot: identifier.range[0]
                                            });
                                            allRequestNodes.push(identifier);
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

                            allRequests.push({
                                typeInformationDescriptor: WebInspector.ScriptSyntaxTree.TypeProfilerSearchDescriptor.FunctionReturn,
                                sourceID: sourceID,
                                divot: WebInspector.ScriptSyntaxTree.functionReturnDivot(node)
                            });
                            allRequestNodes.push(node);
                            break;
                        case WebInspector.ScriptSyntaxTree.NodeType.VariableDeclarator:
                            var _iteratorNormalCompletion5 = true;
                            var _didIteratorError5 = false;
                            var _iteratorError5 = undefined;

                            try {
                                for (var _iterator5 = this._gatherIdentifiersInDeclaration(node.id)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                    var identifier = _step5.value;

                                    allRequests.push({
                                        typeInformationDescriptor: WebInspector.ScriptSyntaxTree.TypeProfilerSearchDescriptor.NormalExpression,
                                        sourceID: sourceID,
                                        divot: identifier.range[0]
                                    });
                                    allRequestNodes.push(identifier);
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

                            break;
                    }
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

            console.assert(allRequests.length === allRequestNodes.length);

            function handleTypes(error, typeInformationArray) {
                if (error) return;

                console.assert(typeInformationArray.length === allRequests.length);

                for (var i = 0; i < typeInformationArray.length; i++) {
                    var node = allRequestNodes[i];
                    var typeInformation = WebInspector.TypeDescription.fromPayload(typeInformationArray[i]);
                    if (allRequests[i].typeInformationDescriptor === WebInspector.ScriptSyntaxTree.TypeProfilerSearchDescriptor.FunctionReturn) node.attachments.returnTypes = typeInformation;else node.attachments.types = typeInformation;
                }

                callback(allRequestNodes);
            }

            RuntimeAgent.getRuntimeTypesForVariablesAtOffsets(allRequests, handleTypes);
        }

        // Private

    }, {
        key: "_gatherIdentifiersInDeclaration",
        value: function _gatherIdentifiersInDeclaration(node) {
            function gatherIdentifiers(_x4) {
                var _again2 = true;

                _function2: while (_again2) {
                    var node = _x4;
                    identifiers = _iteratorNormalCompletion6 = _didIteratorError6 = _iteratorError6 = identifiers = _iteratorNormalCompletion8 = _didIteratorError8 = _iteratorError8 = undefined;
                    _again2 = false;

                    switch (node.type) {
                        case WebInspector.ScriptSyntaxTree.NodeType.Identifier:
                            return [node];
                        case WebInspector.ScriptSyntaxTree.NodeType.Property:
                            _x4 = node.value;
                            _again2 = true;
                            continue _function2;

                        case WebInspector.ScriptSyntaxTree.NodeType.ObjectPattern:
                            var identifiers = [];
                            var _iteratorNormalCompletion6 = true;
                            var _didIteratorError6 = false;
                            var _iteratorError6 = undefined;

                            try {
                                for (var _iterator6 = node.properties[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                    var property = _step6.value;
                                    var _iteratorNormalCompletion7 = true;
                                    var _didIteratorError7 = false;
                                    var _iteratorError7 = undefined;

                                    try {
                                        for (var _iterator7 = gatherIdentifiers(property)[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                                            var identifier = _step7.value;

                                            identifiers.push(identifier);
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

                            return identifiers;
                        case WebInspector.ScriptSyntaxTree.NodeType.ArrayPattern:
                            var identifiers = [];
                            var _iteratorNormalCompletion8 = true;
                            var _didIteratorError8 = false;
                            var _iteratorError8 = undefined;

                            try {
                                for (var _iterator8 = node.elements[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                                    var element = _step8.value;
                                    var _iteratorNormalCompletion9 = true;
                                    var _didIteratorError9 = false;
                                    var _iteratorError9 = undefined;

                                    try {
                                        for (var _iterator9 = gatherIdentifiers(element)[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                                            var identifier = _step9.value;

                                            identifiers.push(identifier);
                                        }
                                    } catch (err) {
                                        _didIteratorError9 = true;
                                        _iteratorError9 = err;
                                    } finally {
                                        try {
                                            if (!_iteratorNormalCompletion9 && _iterator9["return"]) {
                                                _iterator9["return"]();
                                            }
                                        } finally {
                                            if (_didIteratorError9) {
                                                throw _iteratorError9;
                                            }
                                        }
                                    }
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

                            return identifiers;
                        case WebInspector.ScriptSyntaxTree.NodeType.AssignmentPattern:
                            _x4 = node.left;
                            _again2 = true;
                            continue _function2;

                        default:
                            console.assert(false, "Unexpected node type in variable declarator: " + node.type);
                            return [];
                    }
                }
            }

            console.assert(node.type === WebInspector.ScriptSyntaxTree.NodeType.Identifier || node.type === WebInspector.ScriptSyntaxTree.NodeType.ObjectPattern || node.type === WebInspector.ScriptSyntaxTree.NodeType.ArrayPattern);

            return gatherIdentifiers(node);
        }
    }, {
        key: "_defaultParserState",
        value: function _defaultParserState() {
            return {
                shouldStopEarly: false,
                skipChildNodes: false
            };
        }
    }, {
        key: "_recurse",
        value: function _recurse(node, callback, state) {
            if (!node) return;

            if (state.shouldStopEarly || state.skipChildNodes) return;

            switch (node.type) {
                case WebInspector.ScriptSyntaxTree.NodeType.AssignmentExpression:
                    callback(node, state);
                    this._recurse(node.left, callback, state);
                    this._recurse(node.right, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.ArrayExpression:
                case WebInspector.ScriptSyntaxTree.NodeType.ArrayPattern:
                    callback(node, state);
                    this._recurseArray(node.elements, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.AssignmentPattern:
                    callback(node, state);
                    this._recurse(node.left, callback, state);
                    this._recurse(node.right, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.BlockStatement:
                    callback(node, state);
                    this._recurseArray(node.body, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.BinaryExpression:
                    callback(node, state);
                    this._recurse(node.left, callback, state);
                    this._recurse(node.right, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.BreakStatement:
                    callback(node, state);
                    this._recurse(node.label, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.CatchClause:
                    callback(node, state);
                    this._recurse(node.param, callback, state);
                    this._recurse(node.body, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.CallExpression:
                    callback(node, state);
                    this._recurse(node.callee, callback, state);
                    this._recurseArray(node.arguments, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.ClassBody:
                    callback(node, state);
                    this._recurseArray(node.body, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.ClassDeclaration:
                case WebInspector.ScriptSyntaxTree.NodeType.ClassExpression:
                    callback(node, state);
                    this._recurse(node.id, callback, state);
                    this._recurse(node.superClass, callback, state);
                    this._recurse(node.body, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.ContinueStatement:
                    callback(node, state);
                    this._recurse(node.label, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.DoWhileStatement:
                    callback(node, state);
                    this._recurse(node.body, callback, state);
                    this._recurse(node.test, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.ExpressionStatement:
                    callback(node, state);
                    this._recurse(node.expression, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.ForStatement:
                    callback(node, state);
                    this._recurse(node.init, callback, state);
                    this._recurse(node.test, callback, state);
                    this._recurse(node.update, callback, state);
                    this._recurse(node.body, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.ForInStatement:
                case WebInspector.ScriptSyntaxTree.NodeType.ForOfStatement:
                    callback(node, state);
                    this._recurse(node.left, callback, state);
                    this._recurse(node.right, callback, state);
                    this._recurse(node.body, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.FunctionDeclaration:
                case WebInspector.ScriptSyntaxTree.NodeType.FunctionExpression:
                case WebInspector.ScriptSyntaxTree.NodeType.ArrowFunctionExpression:
                    callback(node, state);
                    this._recurse(node.id, callback, state);
                    this._recurseArray(node.params, callback, state);
                    this._recurseArray(node.defaults, callback, state);
                    this._recurse(node.body, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.IfStatement:
                    callback(node, state);
                    this._recurse(node.test, callback, state);
                    this._recurse(node.consequent, callback, state);
                    this._recurse(node.alternate, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.LabeledStatement:
                    callback(node, state);
                    this._recurse(node.label, callback, state);
                    this._recurse(node.body, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.LogicalExpression:
                    callback(node, state);
                    this._recurse(node.left, callback, state);
                    this._recurse(node.right, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.MemberExpression:
                    callback(node, state);
                    this._recurse(node.object, callback, state);
                    this._recurse(node.property, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.MethodDefinition:
                    callback(node, state);
                    this._recurse(node.key, callback, state);
                    this._recurse(node.value, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.NewExpression:
                    callback(node, state);
                    this._recurse(node.callee, callback, state);
                    this._recurseArray(node.arguments, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.ObjectExpression:
                case WebInspector.ScriptSyntaxTree.NodeType.ObjectPattern:
                    callback(node, state);
                    this._recurseArray(node.properties, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.Program:
                    callback(node, state);
                    this._recurseArray(node.body, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.Property:
                    callback(node, state);
                    this._recurse(node.key, callback, state);
                    this._recurse(node.value, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.ReturnStatement:
                    callback(node, state);
                    this._recurse(node.argument, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.SequenceExpression:
                    callback(node, state);
                    this._recurseArray(node.expressions, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.SpreadElement:
                    callback(node, state);
                    this._recurse(node.argument, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.SwitchStatement:
                    callback(node, state);
                    this._recurse(node.discriminant, callback, state);
                    this._recurseArray(node.cases, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.SwitchCase:
                    callback(node, state);
                    this._recurse(node.test, callback, state);
                    this._recurseArray(node.consequent, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.ConditionalExpression:
                    callback(node, state);
                    this._recurse(node.test, callback, state);
                    this._recurse(node.consequent, callback, state);
                    this._recurse(node.alternate, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.TaggedTemplateExpression:
                    callback(node, state);
                    this._recurse(node.tag, callback, state);
                    this._recurse(node.quasi, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.TemplateLiteral:
                    callback(node, state);
                    this._recurseArray(node.quasis, callback, state);
                    this._recurseArray(node.expressions, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.ThrowStatement:
                    callback(node, state);
                    this._recurse(node.argument, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.TryStatement:
                    callback(node, state);
                    this._recurse(node.block, callback, state);
                    this._recurse(node.handler, callback, state);
                    this._recurse(node.finalizer, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.UnaryExpression:
                    callback(node, state);
                    this._recurse(node.argument, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.UpdateExpression:
                    callback(node, state);
                    this._recurse(node.argument, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.VariableDeclaration:
                    callback(node, state);
                    this._recurseArray(node.declarations, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.VariableDeclarator:
                    callback(node, state);
                    this._recurse(node.id, callback, state);
                    this._recurse(node.init, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.WhileStatement:
                    callback(node, state);
                    this._recurse(node.test, callback, state);
                    this._recurse(node.body, callback, state);
                    break;
                case WebInspector.ScriptSyntaxTree.NodeType.WithStatement:
                    callback(node, state);
                    this._recurse(node.object, callback, state);
                    this._recurse(node.body, callback, state);
                    break;
                // All the leaf nodes go here.
                case WebInspector.ScriptSyntaxTree.NodeType.DebuggerStatement:
                case WebInspector.ScriptSyntaxTree.NodeType.EmptyStatement:
                case WebInspector.ScriptSyntaxTree.NodeType.Identifier:
                case WebInspector.ScriptSyntaxTree.NodeType.Literal:
                case WebInspector.ScriptSyntaxTree.NodeType.MetaProperty:
                case WebInspector.ScriptSyntaxTree.NodeType.Super:
                case WebInspector.ScriptSyntaxTree.NodeType.ThisExpression:
                case WebInspector.ScriptSyntaxTree.NodeType.TemplateElement:
                    callback(node, state);
                    break;
            }

            state.skipChildNodes = false;
        }
    }, {
        key: "_recurseArray",
        value: function _recurseArray(array, callback, state) {
            var _iteratorNormalCompletion10 = true;
            var _didIteratorError10 = false;
            var _iteratorError10 = undefined;

            try {
                for (var _iterator10 = array[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                    var node = _step10.value;

                    this._recurse(node, callback, state);
                }
            } catch (err) {
                _didIteratorError10 = true;
                _iteratorError10 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion10 && _iterator10["return"]) {
                        _iterator10["return"]();
                    }
                } finally {
                    if (_didIteratorError10) {
                        throw _iteratorError10;
                    }
                }
            }
        }

        // This function translates from esprima's Abstract Syntax Tree to ours.
        // Mostly, this is just the identity function. We've added an extra typeProfilingReturnDivot property for functions/methods.
        // Our AST complies with the Mozilla parser API:
        // https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API
    }, {
        key: "_createInternalSyntaxTree",
        value: function _createInternalSyntaxTree(node) {
            if (!node) return null;

            var result = null;
            switch (node.type) {
                case "ArrayExpression":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.ArrayExpression,
                        elements: node.elements.map(this._createInternalSyntaxTree, this)
                    };
                    break;
                case "ArrayPattern":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.ArrayPattern,
                        elements: node.elements.map(this._createInternalSyntaxTree, this)
                    };
                    break;
                case "ArrowFunctionExpression":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.ArrowFunctionExpression,
                        id: this._createInternalSyntaxTree(node.id),
                        params: node.params.map(this._createInternalSyntaxTree, this),
                        defaults: node.defaults.map(this._createInternalSyntaxTree, this),
                        body: this._createInternalSyntaxTree(node.body),
                        expression: node.expression, // Boolean indicating if the body a single expression or a block statement.
                        typeProfilingReturnDivot: node.range[0]
                    };
                    break;
                case "AssignmentExpression":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.AssignmentExpression,
                        operator: node.operator,
                        left: this._createInternalSyntaxTree(node.left),
                        right: this._createInternalSyntaxTree(node.right)
                    };
                    break;
                case "AssignmentPattern":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.AssignmentPattern,
                        left: this._createInternalSyntaxTree(node.left),
                        right: this._createInternalSyntaxTree(node.right)
                    };
                    break;
                case "BlockStatement":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.BlockStatement,
                        body: node.body.map(this._createInternalSyntaxTree, this)
                    };
                    break;
                case "BinaryExpression":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.BinaryExpression,
                        operator: node.operator,
                        left: this._createInternalSyntaxTree(node.left),
                        right: this._createInternalSyntaxTree(node.right)
                    };
                    break;
                case "BreakStatement":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.BreakStatement,
                        label: this._createInternalSyntaxTree(node.label)
                    };
                    break;
                case "CallExpression":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.CallExpression,
                        callee: this._createInternalSyntaxTree(node.callee),
                        arguments: node.arguments.map(this._createInternalSyntaxTree, this)
                    };
                    break;
                case "CatchClause":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.CatchClause,
                        param: this._createInternalSyntaxTree(node.param),
                        body: this._createInternalSyntaxTree(node.body)
                    };
                    break;
                case "ClassBody":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.ClassBody,
                        body: node.body.map(this._createInternalSyntaxTree, this)
                    };
                    break;
                case "ClassDeclaration":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.ClassDeclaration,
                        id: this._createInternalSyntaxTree(node.id),
                        superClass: this._createInternalSyntaxTree(node.superClass),
                        body: this._createInternalSyntaxTree(node.body)
                    };
                    break;
                case "ClassExpression":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.ClassExpression,
                        id: this._createInternalSyntaxTree(node.id),
                        superClass: this._createInternalSyntaxTree(node.superClass),
                        body: this._createInternalSyntaxTree(node.body)
                    };
                    break;
                case "ConditionalExpression":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.ConditionalExpression,
                        test: this._createInternalSyntaxTree(node.test),
                        consequent: this._createInternalSyntaxTree(node.consequent),
                        alternate: this._createInternalSyntaxTree(node.alternate)
                    };
                    break;
                case "ContinueStatement":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.ContinueStatement,
                        label: this._createInternalSyntaxTree(node.label)
                    };
                    break;
                case "DoWhileStatement":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.DoWhileStatement,
                        body: this._createInternalSyntaxTree(node.body),
                        test: this._createInternalSyntaxTree(node.test)
                    };
                    break;
                case "DebuggerStatement":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.DebuggerStatement
                    };
                    break;
                case "EmptyStatement":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.EmptyStatement
                    };
                    break;
                case "ExpressionStatement":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.ExpressionStatement,
                        expression: this._createInternalSyntaxTree(node.expression)
                    };
                    break;
                case "ForStatement":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.ForStatement,
                        init: this._createInternalSyntaxTree(node.init),
                        test: this._createInternalSyntaxTree(node.test),
                        update: this._createInternalSyntaxTree(node.update),
                        body: this._createInternalSyntaxTree(node.body)
                    };
                    break;
                case "ForInStatement":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.ForInStatement,
                        left: this._createInternalSyntaxTree(node.left),
                        right: this._createInternalSyntaxTree(node.right),
                        body: this._createInternalSyntaxTree(node.body)
                    };
                    break;
                case "ForOfStatement":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.ForOfStatement,
                        left: this._createInternalSyntaxTree(node.left),
                        right: this._createInternalSyntaxTree(node.right),
                        body: this._createInternalSyntaxTree(node.body)
                    };
                    break;
                case "FunctionDeclaration":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.FunctionDeclaration,
                        id: this._createInternalSyntaxTree(node.id),
                        params: node.params.map(this._createInternalSyntaxTree, this),
                        defaults: node.defaults.map(this._createInternalSyntaxTree, this),
                        body: this._createInternalSyntaxTree(node.body),
                        typeProfilingReturnDivot: node.range[0]
                    };
                    break;
                case "FunctionExpression":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.FunctionExpression,
                        id: this._createInternalSyntaxTree(node.id),
                        params: node.params.map(this._createInternalSyntaxTree, this),
                        defaults: node.defaults.map(this._createInternalSyntaxTree, this),
                        body: this._createInternalSyntaxTree(node.body),
                        typeProfilingReturnDivot: node.range[0] // This may be overridden in the Property AST node.
                    };
                    break;
                case "Identifier":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.Identifier,
                        name: node.name
                    };
                    break;
                case "IfStatement":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.IfStatement,
                        test: this._createInternalSyntaxTree(node.test),
                        consequent: this._createInternalSyntaxTree(node.consequent),
                        alternate: this._createInternalSyntaxTree(node.alternate)
                    };
                    break;
                case "Literal":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.Literal,
                        value: node.value,
                        raw: node.raw
                    };
                    break;
                case "LabeledStatement":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.LabeledStatement,
                        label: this._createInternalSyntaxTree(node.label),
                        body: this._createInternalSyntaxTree(node.body)
                    };
                    break;
                case "LogicalExpression":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.LogicalExpression,
                        left: this._createInternalSyntaxTree(node.left),
                        right: this._createInternalSyntaxTree(node.right),
                        operator: node.operator
                    };
                    break;
                case "MemberExpression":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.MemberExpression,
                        object: this._createInternalSyntaxTree(node.object),
                        property: this._createInternalSyntaxTree(node.property),
                        computed: node.computed
                    };
                    break;
                case "MetaProperty":
                    // i.e: new.target produces {meta: "new", property: "target"}
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.MetaProperty,
                        meta: node.meta,
                        property: node.property
                    };
                    break;
                case "MethodDefinition":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.MethodDefinition,
                        key: this._createInternalSyntaxTree(node.key),
                        value: this._createInternalSyntaxTree(node.value),
                        computed: node.computed,
                        kind: node.kind,
                        "static": node["static"]
                    };
                    result.value.typeProfilingReturnDivot = node.range[0]; // "g" in "get" or "s" in "set" or "[" in "['computed']" or "m" in "methodName".
                    break;
                case "NewExpression":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.NewExpression,
                        callee: this._createInternalSyntaxTree(node.callee),
                        arguments: node.arguments.map(this._createInternalSyntaxTree, this)
                    };
                    break;
                case "ObjectExpression":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.ObjectExpression,
                        properties: node.properties.map(this._createInternalSyntaxTree, this)
                    };
                    break;
                case "ObjectPattern":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.ObjectPattern,
                        properties: node.properties.map(this._createInternalSyntaxTree, this)
                    };
                    break;
                case "Program":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.Program,
                        sourceType: node.sourceType,
                        body: node.body.map(this._createInternalSyntaxTree, this)
                    };
                    break;
                case "Property":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.Property,
                        key: this._createInternalSyntaxTree(node.key),
                        value: this._createInternalSyntaxTree(node.value),
                        kind: node.kind,
                        method: node.method,
                        computed: node.computed
                    };
                    if (result.kind === "get" || result.kind === "set" || result.method) result.value.typeProfilingReturnDivot = node.range[0]; // "g" in "get" or "s" in "set" or "[" in "['computed']" method or "m" in "methodName".
                    break;
                case "ReturnStatement":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.ReturnStatement,
                        argument: this._createInternalSyntaxTree(node.argument)
                    };
                    break;
                case "SequenceExpression":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.SequenceExpression,
                        expressions: node.expressions.map(this._createInternalSyntaxTree, this)
                    };
                    break;
                case "SpreadElement":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.SpreadElement,
                        argument: this._createInternalSyntaxTree(node.argument)
                    };
                    break;
                case "Super":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.Super
                    };
                    break;
                case "SwitchStatement":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.SwitchStatement,
                        discriminant: this._createInternalSyntaxTree(node.discriminant),
                        cases: node.cases.map(this._createInternalSyntaxTree, this)
                    };
                    break;
                case "SwitchCase":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.SwitchCase,
                        test: this._createInternalSyntaxTree(node.test),
                        consequent: node.consequent.map(this._createInternalSyntaxTree, this)
                    };
                    break;
                case "TaggedTemplateExpression":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.TaggedTemplateExpression,
                        tag: this._createInternalSyntaxTree(node.tag),
                        quasi: this._createInternalSyntaxTree(node.quasi)
                    };
                    break;
                case "TemplateElement":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.TemplateElement,
                        value: node.value,
                        tail: node.tail
                    };
                    break;
                case "TemplateLiteral":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.TemplateLiteral,
                        quasis: node.quasis.map(this._createInternalSyntaxTree, this),
                        expressions: node.expressions.map(this._createInternalSyntaxTree, this)
                    };
                    break;
                case "ThisExpression":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.ThisExpression
                    };
                    break;
                case "ThrowStatement":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.ThrowStatement,
                        argument: this._createInternalSyntaxTree(node.argument)
                    };
                    break;
                case "TryStatement":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.TryStatement,
                        block: this._createInternalSyntaxTree(node.block),
                        handler: this._createInternalSyntaxTree(node.handler),
                        finalizer: this._createInternalSyntaxTree(node.finalizer)
                    };
                    break;
                case "UnaryExpression":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.UnaryExpression,
                        operator: node.operator,
                        argument: this._createInternalSyntaxTree(node.argument)
                    };
                    break;
                case "UpdateExpression":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.UpdateExpression,
                        operator: node.operator,
                        prefix: node.prefix,
                        argument: this._createInternalSyntaxTree(node.argument)
                    };
                    break;
                case "VariableDeclaration":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.VariableDeclaration,
                        declarations: node.declarations.map(this._createInternalSyntaxTree, this),
                        kind: node.kind
                    };
                    break;
                case "VariableDeclarator":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.VariableDeclarator,
                        id: this._createInternalSyntaxTree(node.id),
                        init: this._createInternalSyntaxTree(node.init)
                    };
                    break;
                case "WhileStatement":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.WhileStatement,
                        test: this._createInternalSyntaxTree(node.test),
                        body: this._createInternalSyntaxTree(node.body)
                    };
                    break;
                case "WithStatement":
                    result = {
                        type: WebInspector.ScriptSyntaxTree.NodeType.WithStatement,
                        object: this._createInternalSyntaxTree(node.object),
                        body: this._createInternalSyntaxTree(node.body)
                    };
                    break;
                default:
                    console.error("Unsupported Syntax Tree Node: " + node.type, node);
                    return null;
            }

            result.range = node.range;
            // This is an object for which you can add fields to an AST node without worrying about polluting the syntax-related fields of the node.
            result.attachments = {};

            return result;
        }
    }, {
        key: "parsedSuccessfully",
        get: function get() {
            return this._parsedSuccessfully;
        }
    }], [{
        key: "functionReturnDivot",
        value: function functionReturnDivot(node) {
            console.assert(node.type === WebInspector.ScriptSyntaxTree.NodeType.FunctionDeclaration || node.type === WebInspector.ScriptSyntaxTree.NodeType.FunctionExpression || node.type === WebInspector.ScriptSyntaxTree.NodeType.MethodDefinition || node.type === WebInspector.ScriptSyntaxTree.NodeType.ArrowFunctionExpression);

            // COMPATIBILITY (iOS 9): Legacy Backends view the return type as being the opening "{" of the function body.
            // After iOS 9, this is to move to the start of the function statement/expression. See below:
            // FIXME: Need a better way to determine backend versions. Using DOM.pseudoElement because that was added after iOS 9.
            if (!DOMAgent.hasEvent("pseudoElementAdded")) return node.body.range[0];

            // "f" in "function". "s" in "set". "g" in "get". First letter in any method name for classes and object literals.
            // The "[" for computed methods in classes and object literals.
            return node.typeProfilingReturnDivot;
        }
    }]);

    return ScriptSyntaxTree;
})(WebInspector.Object);

// This should be kept in sync with an enum in JavaSciptCore/runtime/TypeProfiler.h
WebInspector.ScriptSyntaxTree.TypeProfilerSearchDescriptor = {
    NormalExpression: 1,
    FunctionReturn: 2
};

WebInspector.ScriptSyntaxTree.NodeType = {
    ArrayExpression: Symbol("array-expression"),
    ArrayPattern: Symbol("array-pattern"),
    ArrowFunctionExpression: Symbol("arrow-function-expression"),
    AssignmentExpression: Symbol("assignment-expression"),
    AssignmentPattern: Symbol("assignment-pattern"),
    BinaryExpression: Symbol("binary-expression"),
    BlockStatement: Symbol("block-statement"),
    BreakStatement: Symbol("break-statement"),
    CallExpression: Symbol("call-expression"),
    CatchClause: Symbol("catch-clause"),
    ClassBody: Symbol("class-body"),
    ClassDeclaration: Symbol("class-declaration"),
    ClassExpression: Symbol("class-expression"),
    ConditionalExpression: Symbol("conditional-expression"),
    ContinueStatement: Symbol("continue-statement"),
    DebuggerStatement: Symbol("debugger-statement"),
    DoWhileStatement: Symbol("do-while-statement"),
    EmptyStatement: Symbol("empty-statement"),
    ExpressionStatement: Symbol("expression-statement"),
    ForInStatement: Symbol("for-in-statement"),
    ForOfStatement: Symbol("for-of-statement"),
    ForStatement: Symbol("for-statement"),
    FunctionDeclaration: Symbol("function-declaration"),
    FunctionExpression: Symbol("function-expression"),
    Identifier: Symbol("identifier"),
    IfStatement: Symbol("if-statement"),
    LabeledStatement: Symbol("labeled-statement"),
    Literal: Symbol("literal"),
    LogicalExpression: Symbol("logical-expression"),
    MemberExpression: Symbol("member-expression"),
    MetaProperty: Symbol("meta-property"),
    MethodDefinition: Symbol("method-definition"),
    NewExpression: Symbol("new-expression"),
    ObjectExpression: Symbol("object-expression"),
    ObjectPattern: Symbol("object-pattern"),
    Program: Symbol("program"),
    Property: Symbol("property"),
    ReturnStatement: Symbol("return-statement"),
    SequenceExpression: Symbol("sequence-expression"),
    SpreadElement: Symbol("spread-element"),
    Super: Symbol("super"),
    SwitchCase: Symbol("switch-case"),
    SwitchStatement: Symbol("switch-statement"),
    TaggedTemplateExpression: Symbol("tagged-template-expression"),
    TemplateElement: Symbol("template-element"),
    TemplateLiteral: Symbol("template-literal"),
    ThisExpression: Symbol("this-expression"),
    ThrowStatement: Symbol("throw-statement"),
    TryStatement: Symbol("try-statement"),
    UnaryExpression: Symbol("unary-expression"),
    UpdateExpression: Symbol("update-expression"),
    VariableDeclaration: Symbol("variable-declaration"),
    VariableDeclarator: Symbol("variable-declarator"),
    WhileStatement: Symbol("while-statement"),
    WithStatement: Symbol("with-statement")
};
