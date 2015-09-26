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

WebInspector.ScopeChainDetailsSidebarPanel = (function (_WebInspector$DetailsSidebarPanel) {
    _inherits(ScopeChainDetailsSidebarPanel, _WebInspector$DetailsSidebarPanel);

    function ScopeChainDetailsSidebarPanel() {
        _classCallCheck(this, ScopeChainDetailsSidebarPanel);

        _get(Object.getPrototypeOf(ScopeChainDetailsSidebarPanel.prototype), "constructor", this).call(this, "scope-chain", WebInspector.UIString("Scope Chain"), WebInspector.UIString("Scope Chain"));

        this._callFrame = null;

        this._watchExpressionsSetting = new WebInspector.Setting("watch-expressions", []);

        this._watchExpressionOptionsElement = document.createElement("div");
        this._watchExpressionOptionsElement.classList.add("options");

        var refreshAllWatchExpressionButton = this._watchExpressionOptionsElement.appendChild(document.createElement("img"));
        refreshAllWatchExpressionButton.classList.add("watch-expression-refresh");
        refreshAllWatchExpressionButton.setAttribute("role", "button");
        refreshAllWatchExpressionButton.title = WebInspector.UIString("Refresh All Watch Expressions");
        refreshAllWatchExpressionButton.addEventListener("click", this._refreshAllWatchExpressionsButtonClicked.bind(this));

        var clearAllWatchExpressionButton = this._watchExpressionOptionsElement.appendChild(document.createElement("img"));
        clearAllWatchExpressionButton.classList.add("watch-expression-clear");
        clearAllWatchExpressionButton.setAttribute("role", "button");
        clearAllWatchExpressionButton.title = WebInspector.UIString("Clear All Watch Expressions");
        clearAllWatchExpressionButton.addEventListener("click", this._clearAllWatchExpressionsButtonClicked.bind(this));

        var addWatchExpressionButton = this._watchExpressionOptionsElement.appendChild(document.createElement("img"));
        addWatchExpressionButton.classList.add("watch-expression-add");
        addWatchExpressionButton.title = WebInspector.UIString("Add Watch Expression");
        addWatchExpressionButton.setAttribute("role", "button");
        addWatchExpressionButton.addEventListener("click", this._addWatchExpressionButtonClicked.bind(this));

        this._watchExpressionsSectionGroup = new WebInspector.DetailsSectionGroup();
        this._watchExpressionsSection = new WebInspector.DetailsSection("watch-expressions", WebInspector.UIString("Watch Expressions"), [this._watchExpressionsSectionGroup], this._watchExpressionOptionsElement);
        this.contentElement.appendChild(this._watchExpressionsSection.element);

        this.needsRefresh();

        // Update on console prompt eval as objects in the scope chain may have changed.
        WebInspector.runtimeManager.addEventListener(WebInspector.RuntimeManager.Event.DidEvaluate, this._didEvaluateExpression, this);

        // Update watch expressions on navigations.
        WebInspector.Frame.addEventListener(WebInspector.Frame.Event.MainResourceDidChange, this._mainResourceDidChange, this);
    }

    // Public

    _createClass(ScopeChainDetailsSidebarPanel, [{
        key: "inspect",
        value: function inspect(objects) {
            // Convert to a single item array if needed.
            if (!(objects instanceof Array)) objects = [objects];

            var callFrameToInspect = null;

            // Iterate over the objects to find a WebInspector.CallFrame to inspect.
            for (var i = 0; i < objects.length; ++i) {
                if (!(objects[i] instanceof WebInspector.CallFrame)) continue;
                callFrameToInspect = objects[i];
                break;
            }

            this.callFrame = callFrameToInspect;

            return true;
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var callFrame = this._callFrame;

            Promise.all([this._generateWatchExpressionsSection(), this._generateCallFramesSection()]).then((function (sections) {
                var _sections = _slicedToArray(sections, 2);

                var watchExpressionsSection = _sections[0];
                var callFrameSections = _sections[1];

                function delayedWork() {
                    // Clear the timeout so we don't update the interface twice.
                    clearTimeout(timeout);

                    if (watchExpressionsSection) this._watchExpressionsSectionGroup.rows = [watchExpressionsSection];else {
                        var emptyRow = new WebInspector.DetailsSectionRow(WebInspector.UIString("No Watch Expressions"));
                        this._watchExpressionsSectionGroup.rows = [emptyRow];
                        emptyRow.showEmptyMessage();
                    }

                    this.contentElement.removeChildren();
                    this.contentElement.appendChild(this._watchExpressionsSection.element);

                    // Bail if the call frame changed while we were waiting for the async response.
                    if (this._callFrame !== callFrame) return;

                    if (!callFrameSections) return;

                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = callFrameSections[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var callFrameSection = _step.value;

                            this.contentElement.appendChild(callFrameSection.element);
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
                }

                // We need a timeout in place in case there are long running, pending backend dispatches. This can happen
                // if the debugger is paused in code that was executed from the console. The console will be waiting for
                // the result of the execution and without a timeout we would never update the scope variables.
                var delay = WebInspector.ScopeChainDetailsSidebarPanel._autoExpandProperties.size === 0 ? 50 : 250;
                var timeout = setTimeout(delayedWork.bind(this), delay);

                // Since ObjectTreeView populates asynchronously, we want to wait to replace the existing content
                // until after all the pending asynchronous requests are completed. This prevents severe flashing while stepping.
                InspectorBackend.runAfterPendingDispatches(delayedWork.bind(this));
            }).bind(this))["catch"](function (e) {
                console.error(e);
            });
        }
    }, {
        key: "_generateCallFramesSection",
        value: function _generateCallFramesSection() {
            var callFrame = this._callFrame;
            if (!callFrame) return Promise.resolve(null);

            var detailsSections = [];
            var foundLocalScope = false;

            var sectionCountByType = {};
            for (var type in WebInspector.ScopeChainNode.Type) sectionCountByType[WebInspector.ScopeChainNode.Type[type]] = 0;

            var scopeChain = callFrame.scopeChain;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = scopeChain[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var scope = _step2.value;

                    var title = null;
                    var extraPropertyDescriptor = null;
                    var collapsedByDefault = false;

                    ++sectionCountByType[scope.type];

                    switch (scope.type) {
                        case WebInspector.ScopeChainNode.Type.Local:
                            foundLocalScope = true;
                            collapsedByDefault = false;

                            title = WebInspector.UIString("Local Variables");

                            if (callFrame.thisObject) extraPropertyDescriptor = new WebInspector.PropertyDescriptor({ name: "this", value: callFrame.thisObject });
                            break;

                        case WebInspector.ScopeChainNode.Type.Closure:
                            title = WebInspector.UIString("Closure Variables");
                            collapsedByDefault = false;
                            break;

                        case WebInspector.ScopeChainNode.Type.Catch:
                            title = WebInspector.UIString("Catch Variables");
                            collapsedByDefault = false;
                            break;

                        case WebInspector.ScopeChainNode.Type.FunctionName:
                            title = WebInspector.UIString("Function Name Variable");
                            collapsedByDefault = true;
                            break;

                        case WebInspector.ScopeChainNode.Type.With:
                            title = WebInspector.UIString("With Object Properties");
                            collapsedByDefault = foundLocalScope;
                            break;

                        case WebInspector.ScopeChainNode.Type.Global:
                            title = WebInspector.UIString("Global Variables");
                            collapsedByDefault = true;
                            break;
                    }

                    var detailsSectionIdentifier = scope.type + "-" + sectionCountByType[scope.type];

                    var scopePropertyPath = WebInspector.PropertyPath.emptyPropertyPathForScope(scope.object);
                    var objectTree = new WebInspector.ObjectTreeView(scope.object, WebInspector.ObjectTreeView.Mode.Properties, scopePropertyPath);

                    objectTree.showOnlyProperties();

                    if (extraPropertyDescriptor) objectTree.appendExtraPropertyDescriptor(extraPropertyDescriptor);

                    var treeOutline = objectTree.treeOutline;
                    treeOutline.onadd = this._objectTreeAddHandler.bind(this, detailsSectionIdentifier);
                    treeOutline.onexpand = this._objectTreeExpandHandler.bind(this, detailsSectionIdentifier);
                    treeOutline.oncollapse = this._objectTreeCollapseHandler.bind(this, detailsSectionIdentifier);

                    var detailsSection = new WebInspector.DetailsSection(detailsSectionIdentifier, title, null, null, collapsedByDefault);
                    detailsSection.groups[0].rows = [new WebInspector.DetailsSectionPropertiesRow(objectTree)];
                    detailsSections.push(detailsSection);
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

            return Promise.resolve(detailsSections);
        }
    }, {
        key: "_generateWatchExpressionsSection",
        value: function _generateWatchExpressionsSection() {
            var watchExpressions = this._watchExpressionsSetting.value;
            if (!watchExpressions.length) {
                if (this._usedWatchExpressionsObjectGroup) {
                    this._usedWatchExpressionsObjectGroup = false;
                    RuntimeAgent.releaseObjectGroup(WebInspector.ScopeChainDetailsSidebarPanel.WatchExpressionsObjectGroupName);
                }
                return Promise.resolve(null);
            }

            RuntimeAgent.releaseObjectGroup(WebInspector.ScopeChainDetailsSidebarPanel.WatchExpressionsObjectGroupName);
            this._usedWatchExpressionsObjectGroup = true;

            var watchExpressionsRemoteObject = WebInspector.RemoteObject.createFakeRemoteObject();
            var fakePropertyPath = WebInspector.PropertyPath.emptyPropertyPathForScope(watchExpressionsRemoteObject);
            var objectTree = new WebInspector.ObjectTreeView(watchExpressionsRemoteObject, WebInspector.ObjectTreeView.Mode.Properties, fakePropertyPath);
            objectTree.showOnlyProperties();

            var treeOutline = objectTree.treeOutline;
            var watchExpressionSectionIdentifier = "watch-expressions";
            treeOutline.onadd = this._objectTreeAddHandler.bind(this, watchExpressionSectionIdentifier);
            treeOutline.onexpand = this._objectTreeExpandHandler.bind(this, watchExpressionSectionIdentifier);
            treeOutline.oncollapse = this._objectTreeCollapseHandler.bind(this, watchExpressionSectionIdentifier);
            treeOutline.objectTreeElementAddContextMenuItems = this._objectTreeElementAddContextMenuItems.bind(this);

            var promises = [];
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                var _loop = function () {
                    var expression = _step3.value;

                    promises.push(new Promise(function (resolve, reject) {
                        WebInspector.runtimeManager.evaluateInInspectedWindow(expression, WebInspector.ScopeChainDetailsSidebarPanel.WatchExpressionsObjectGroupName, false, true, false, true, false, function (object, wasThrown) {
                            var propertyDescriptor = new WebInspector.PropertyDescriptor({ name: expression, value: object }, undefined, undefined, wasThrown);
                            objectTree.appendExtraPropertyDescriptor(propertyDescriptor);
                            resolve(propertyDescriptor);
                        });
                    }));
                };

                for (var _iterator3 = watchExpressions[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    _loop();
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

            return Promise.all(promises).then(function () {
                return Promise.resolve(new WebInspector.DetailsSectionPropertiesRow(objectTree));
            });
        }
    }, {
        key: "_addWatchExpression",
        value: function _addWatchExpression(expression) {
            var watchExpressions = this._watchExpressionsSetting.value.slice(0);
            watchExpressions.push(expression);
            this._watchExpressionsSetting.value = watchExpressions;

            this.needsRefresh();
        }
    }, {
        key: "_removeWatchExpression",
        value: function _removeWatchExpression(expression) {
            var watchExpressions = this._watchExpressionsSetting.value.slice(0);
            watchExpressions.remove(expression, true);
            this._watchExpressionsSetting.value = watchExpressions;

            this.needsRefresh();
        }
    }, {
        key: "_clearAllWatchExpressions",
        value: function _clearAllWatchExpressions() {
            this._watchExpressionsSetting.value = [];

            this.needsRefresh();
        }
    }, {
        key: "_addWatchExpressionButtonClicked",
        value: function _addWatchExpressionButtonClicked(event) {
            function presentPopoverOverTargetElement() {
                var target = WebInspector.Rect.rectFromClientRect(event.target.getBoundingClientRect());
                popover.present(target, [WebInspector.RectEdge.MAX_Y, WebInspector.RectEdge.MIN_Y, WebInspector.RectEdge.MAX_X]);
            }

            var popover = new WebInspector.Popover(this);
            var content = document.createElement("div");
            content.classList.add("watch-expression");
            content.appendChild(document.createElement("div")).textContent = WebInspector.UIString("Add New Watch Expression");

            var editorElement = content.appendChild(document.createElement("div"));
            editorElement.classList.add("watch-expression-editor", WebInspector.SyntaxHighlightedStyleClassName);

            this._codeMirror = CodeMirror(editorElement, {
                lineWrapping: true,
                mode: "text/javascript",
                indentWithTabs: true,
                indentUnit: 4,
                matchBrackets: true,
                value: ""
            });

            this._popoverCommitted = false;

            this._codeMirror.addKeyMap({
                "Enter": (function () {
                    this._popoverCommitted = true;popover.dismiss();
                }).bind(this)
            });

            var completionController = new WebInspector.CodeMirrorCompletionController(this._codeMirror);
            completionController.addExtendedCompletionProvider("javascript", WebInspector.javaScriptRuntimeCompletionProvider);

            // Resize the popover as best we can when the CodeMirror editor changes size.
            var previousHeight = 0;
            this._codeMirror.on("changes", function (cm, event) {
                var height = cm.getScrollInfo().height;
                if (previousHeight !== height) {
                    previousHeight = height;
                    popover.update(false);
                }
            });

            // Reposition the popover when the window resizes.
            this._windowResizeListener = presentPopoverOverTargetElement;
            window.addEventListener("resize", this._windowResizeListener);

            popover.content = content;
            presentPopoverOverTargetElement();

            // CodeMirror needs a refresh after the popover displays, to layout, otherwise it doesn't appear.
            setTimeout((function () {
                this._codeMirror.refresh();
                this._codeMirror.focus();
                popover.update();
            }).bind(this), 0);
        }
    }, {
        key: "willDismissPopover",
        value: function willDismissPopover(popover) {
            if (this._popoverCommitted) {
                var expression = this._codeMirror.getValue().trim();
                if (expression) this._addWatchExpression(expression);
            }

            window.removeEventListener("resize", this._windowResizeListener);
            this._windowResizeListener = null;
            this._codeMirror = null;
        }
    }, {
        key: "_refreshAllWatchExpressionsButtonClicked",
        value: function _refreshAllWatchExpressionsButtonClicked(event) {
            this.needsRefresh();
        }
    }, {
        key: "_clearAllWatchExpressionsButtonClicked",
        value: function _clearAllWatchExpressionsButtonClicked(event) {
            this._clearAllWatchExpressions();
        }
    }, {
        key: "_didEvaluateExpression",
        value: function _didEvaluateExpression(event) {
            if (event.data.objectGroup === WebInspector.ScopeChainDetailsSidebarPanel.WatchExpressionsObjectGroupName) return;

            this.needsRefresh();
        }
    }, {
        key: "_mainResourceDidChange",
        value: function _mainResourceDidChange(event) {
            if (!event.target.isMainFrame()) return;

            this.needsRefresh();
        }
    }, {
        key: "_objectTreeElementAddContextMenuItems",
        value: function _objectTreeElementAddContextMenuItems(objectTreeElement, contextMenu) {
            // Only add our watch expression context menus to the top level ObjectTree elements.
            if (objectTreeElement.parent !== objectTreeElement.treeOutline) return;

            contextMenu.appendItem(WebInspector.UIString("Remove Watch Expression"), (function () {
                var expression = objectTreeElement.property.name;
                this._removeWatchExpression(expression);
            }).bind(this));
        }
    }, {
        key: "_propertyPathIdentifierForTreeElement",
        value: function _propertyPathIdentifierForTreeElement(identifier, objectPropertyTreeElement) {
            if (!objectPropertyTreeElement.property) return null;

            var propertyPath = objectPropertyTreeElement.thisPropertyPath();
            if (propertyPath.isFullPathImpossible()) return null;

            return identifier + "-" + propertyPath.fullPath;
        }
    }, {
        key: "_objectTreeAddHandler",
        value: function _objectTreeAddHandler(identifier, treeElement) {
            var propertyPathIdentifier = this._propertyPathIdentifierForTreeElement(identifier, treeElement);
            if (!propertyPathIdentifier) return;

            if (WebInspector.ScopeChainDetailsSidebarPanel._autoExpandProperties.has(propertyPathIdentifier)) treeElement.expand();
        }
    }, {
        key: "_objectTreeExpandHandler",
        value: function _objectTreeExpandHandler(identifier, treeElement) {
            var propertyPathIdentifier = this._propertyPathIdentifierForTreeElement(identifier, treeElement);
            if (!propertyPathIdentifier) return;

            WebInspector.ScopeChainDetailsSidebarPanel._autoExpandProperties.add(propertyPathIdentifier);
        }
    }, {
        key: "_objectTreeCollapseHandler",
        value: function _objectTreeCollapseHandler(identifier, treeElement) {
            var propertyPathIdentifier = this._propertyPathIdentifierForTreeElement(identifier, treeElement);
            if (!propertyPathIdentifier) return;

            WebInspector.ScopeChainDetailsSidebarPanel._autoExpandProperties["delete"](propertyPathIdentifier);
        }
    }, {
        key: "callFrame",
        get: function get() {
            return this._callFrame;
        },
        set: function set(callFrame) {
            if (callFrame === this._callFrame) return;

            this._callFrame = callFrame;

            this.needsRefresh();
        }
    }]);

    return ScopeChainDetailsSidebarPanel;
})(WebInspector.DetailsSidebarPanel);

WebInspector.ScopeChainDetailsSidebarPanel._autoExpandProperties = new Set();
WebInspector.ScopeChainDetailsSidebarPanel.WatchExpressionsObjectGroupName = "watch-expressions";
