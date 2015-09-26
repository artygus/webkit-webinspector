var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2015 Apple Inc. All rights reserved.
 * Copyright (C) 2015 Saam Barati <saambarati1@gmail.com>
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

WebInspector.BasicBlockAnnotator = (function (_WebInspector$Annotator) {
    _inherits(BasicBlockAnnotator, _WebInspector$Annotator);

    function BasicBlockAnnotator(sourceCodeTextEditor, script) {
        _classCallCheck(this, BasicBlockAnnotator);

        _get(Object.getPrototypeOf(BasicBlockAnnotator.prototype), "constructor", this).call(this, sourceCodeTextEditor);

        this._script = script;
        this._basicBlockMarkers = new Map(); // Only contains unexecuted basic blocks.
    }

    // Protected

    _createClass(BasicBlockAnnotator, [{
        key: "clearAnnotations",
        value: function clearAnnotations() {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._basicBlockMarkers.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var key = _step.value;

                    this._clearRangeForBasicBlockMarker(key);
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
    }, {
        key: "insertAnnotations",
        value: function insertAnnotations() {
            if (!this.isActive()) return;
            this._annotateBasicBlockExecutionRanges();
        }

        // Private

    }, {
        key: "_annotateBasicBlockExecutionRanges",
        value: function _annotateBasicBlockExecutionRanges() {
            var sourceID = this._script.id;
            var startTime = Date.now();

            RuntimeAgent.getBasicBlocks(sourceID, (function (error, basicBlocks) {
                if (error) {
                    console.error("Error in getting basic block locations: " + error);
                    return;
                }

                if (!this.isActive()) return;

                var _sourceCodeTextEditor$visibleRangeOffsets = this.sourceCodeTextEditor.visibleRangeOffsets();

                var startOffset = _sourceCodeTextEditor$visibleRangeOffsets.startOffset;
                var endOffset = _sourceCodeTextEditor$visibleRangeOffsets.endOffset;

                basicBlocks = basicBlocks.filter(function (block) {
                    return block.startOffset >= startOffset && block.startOffset <= endOffset || block.startOffset <= startOffset && block.endOffset >= endOffset;
                });

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = basicBlocks[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var block = _step2.value;

                        var key = block.startOffset + ":" + block.endOffset;
                        var hasKey = this._basicBlockMarkers.has(key);
                        var hasExecuted = block.hasExecuted;
                        if (hasKey && hasExecuted) this._clearRangeForBasicBlockMarker(key);else if (!hasKey && !hasExecuted) {
                            var marker = this._highlightTextForBasicBlock(block);
                            this._basicBlockMarkers.set(key, marker);
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

                var totalTime = Date.now() - startTime;
                var timeoutTime = Number.constrain(30 * totalTime, 500, 5000);
                this._timeoutIdentifier = setTimeout(this.insertAnnotations.bind(this), timeoutTime);
            }).bind(this));
        }
    }, {
        key: "_highlightTextForBasicBlock",
        value: function _highlightTextForBasicBlock(basicBlock) {
            console.assert(basicBlock.startOffset <= basicBlock.endOffset && basicBlock.startOffset >= 0 && basicBlock.endOffset >= 0, "" + basicBlock.startOffset + ":" + basicBlock.endOffset);
            console.assert(!basicBlock.hasExecuted);

            var startPosition = this.sourceCodeTextEditor.originalOffsetToCurrentPosition(basicBlock.startOffset);
            var endPosition = this.sourceCodeTextEditor.originalOffsetToCurrentPosition(basicBlock.endOffset);
            if (this._isTextRangeOnlyClosingBrace(startPosition, endPosition)) return null;

            var marker = this.sourceCodeTextEditor.addStyleToTextRange(startPosition, endPosition, WebInspector.BasicBlockAnnotator.HasNotExecutedClassName);
            return marker;
        }
    }, {
        key: "_isTextRangeOnlyClosingBrace",
        value: function _isTextRangeOnlyClosingBrace(startPosition, endPosition) {
            var isOnlyClosingBrace = /^\s*\}$/;
            return isOnlyClosingBrace.test(this.sourceCodeTextEditor.getTextInRange(startPosition, endPosition));
        }
    }, {
        key: "_clearRangeForBasicBlockMarker",
        value: function _clearRangeForBasicBlockMarker(key) {
            console.assert(this._basicBlockMarkers.has(key));
            var marker = this._basicBlockMarkers.get(key);
            if (marker) marker.clear();
            this._basicBlockMarkers["delete"](key);
        }
    }]);

    return BasicBlockAnnotator;
})(WebInspector.Annotator);

WebInspector.BasicBlockAnnotator.HasNotExecutedClassName = "basic-block-has-not-executed";
