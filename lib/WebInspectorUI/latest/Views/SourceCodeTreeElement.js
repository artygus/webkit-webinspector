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

WebInspector.SourceCodeTreeElement = (function (_WebInspector$FolderizedTreeElement) {
    _inherits(SourceCodeTreeElement, _WebInspector$FolderizedTreeElement);

    function SourceCodeTreeElement(sourceCode, classNames, title, subtitle, representedObject, hasChildren) {
        _classCallCheck(this, SourceCodeTreeElement);

        console.assert(sourceCode instanceof WebInspector.SourceCode);

        _get(Object.getPrototypeOf(SourceCodeTreeElement.prototype), "constructor", this).call(this, classNames, title, subtitle, representedObject || sourceCode, hasChildren);

        this.small = true;

        this._updateSourceCode(sourceCode);
    }

    // Public

    _createClass(SourceCodeTreeElement, [{
        key: "updateSourceMapResources",
        value: function updateSourceMapResources() {
            if (!this.treeOutline || !this.treeOutline.includeSourceMapResourceChildren) return;

            this.hasChildren = !!this._sourceCode.sourceMaps.length;
            this.shouldRefreshChildren = this.hasChildren;

            if (!this.hasChildren) this.removeChildren();
        }

        // Overrides from TreeElement

    }, {
        key: "onattach",
        value: function onattach() {
            _get(Object.getPrototypeOf(SourceCodeTreeElement.prototype), "onattach", this).call(this);

            this.updateSourceMapResources();
        }
    }, {
        key: "onpopulate",
        value: function onpopulate() {
            if (!this.treeOutline || !this.treeOutline.includeSourceMapResourceChildren) return;

            if (!this.hasChildren || !this.shouldRefreshChildren) return;

            this.shouldRefreshChildren = false;

            this.removeChildren();

            function combineFolderChain(topFolder, bottomFolder) {
                console.assert(topFolder.children.length === 1);

                var components = [];

                for (var currentFolder = bottomFolder; currentFolder !== topFolder; currentFolder = currentFolder.parent) components.push(currentFolder.mainTitle);
                components.push(topFolder.mainTitle);

                var folderName = components.reverse().join("/");
                var newFolder = new WebInspector.FolderTreeElement(folderName);

                var folderIndex = topFolder.parent.children.indexOf(topFolder);
                topFolder.parent.insertChild(newFolder, folderIndex);
                topFolder.parent.removeChild(topFolder);

                var children = bottomFolder.children;
                bottomFolder.removeChildren();
                for (var i = 0; i < children.length; ++i) newFolder.appendChild(children[i]);
            }

            function findAndCombineFolderChains(treeElement, previousSingleTreeElement) {
                if (!(treeElement instanceof WebInspector.FolderTreeElement)) {
                    if (previousSingleTreeElement && previousSingleTreeElement !== treeElement.parent) combineFolderChain(previousSingleTreeElement, treeElement.parent);
                    return;
                }

                if (previousSingleTreeElement && treeElement.children.length !== 1) {
                    combineFolderChain(previousSingleTreeElement, treeElement);
                    previousSingleTreeElement = null;
                }

                if (!previousSingleTreeElement && treeElement.children.length === 1) previousSingleTreeElement = treeElement;

                for (var i = 0; i < treeElement.children.length; ++i) findAndCombineFolderChains(treeElement.children[i], previousSingleTreeElement);
            }

            var sourceMaps = this._sourceCode.sourceMaps;
            for (var i = 0; i < sourceMaps.length; ++i) {
                var sourceMap = sourceMaps[i];
                for (var j = 0; j < sourceMap.resources.length; ++j) {
                    var sourceMapResource = sourceMap.resources[j];
                    var relativeSubpath = sourceMapResource.sourceMapDisplaySubpath;
                    var folderTreeElement = this.createFoldersAsNeededForSubpath(relativeSubpath);
                    var sourceMapTreeElement = new WebInspector.SourceMapResourceTreeElement(sourceMapResource);
                    folderTreeElement.insertChild(sourceMapTreeElement, insertionIndexForObjectInListSortedByFunction(sourceMapTreeElement, folderTreeElement.children, WebInspector.ResourceTreeElement.compareFolderAndResourceTreeElements));
                }
            }

            for (var i = 0; i < this.children.length; ++i) findAndCombineFolderChains(this.children[i], null);
        }

        // Protected

    }, {
        key: "createFoldersAsNeededForSubpath",
        value: function createFoldersAsNeededForSubpath(subpath) {
            if (!subpath) return this;

            var components = subpath.split("/");
            if (components.length === 1) return this;

            if (!this._subpathFolderTreeElementMap) this._subpathFolderTreeElementMap = {};

            var currentPath = "";
            var currentFolderTreeElement = this;

            for (var i = 0; i < components.length - 1; ++i) {
                var componentName = components[i];
                currentPath += (i ? "/" : "") + componentName;

                var cachedFolder = this._subpathFolderTreeElementMap[currentPath];
                if (cachedFolder) {
                    currentFolderTreeElement = cachedFolder;
                    continue;
                }

                var newFolder = new WebInspector.FolderTreeElement(componentName);
                newFolder.__path = currentPath;
                this._subpathFolderTreeElementMap[currentPath] = newFolder;

                var index = insertionIndexForObjectInListSortedByFunction(newFolder, currentFolderTreeElement.children, WebInspector.ResourceTreeElement.compareFolderAndResourceTreeElements);
                currentFolderTreeElement.insertChild(newFolder, index);
                currentFolderTreeElement = newFolder;
            }

            return currentFolderTreeElement;
        }
    }, {
        key: "descendantResourceTreeElementTypeDidChange",
        value: function descendantResourceTreeElementTypeDidChange(childTreeElement, oldType) {
            // Called by descendant SourceMapResourceTreeElements.

            console.assert(this.hasChildren);

            var wasSelected = childTreeElement.selected;

            var parentTreeElement = childTreeElement.parent;
            parentTreeElement.removeChild(childTreeElement, true, true);
            parentTreeElement.insertChild(childTreeElement, insertionIndexForObjectInListSortedByFunction(childTreeElement, parentTreeElement.children, WebInspector.ResourceTreeElement.compareFolderAndResourceTreeElements));

            if (wasSelected) childTreeElement.revealAndSelect(true, false, true, true);
        }

        // Protected (ResourceTreeElement calls this when its Resource changes dynamically for Frames)

    }, {
        key: "_updateSourceCode",
        value: function _updateSourceCode(sourceCode) {
            console.assert(sourceCode instanceof WebInspector.SourceCode);

            if (this._sourceCode === sourceCode) return;

            if (this._sourceCode) this._sourceCode.removeEventListener(WebInspector.SourceCode.Event.SourceMapAdded, this.updateSourceMapResources, this);

            this._sourceCode = sourceCode;
            this._sourceCode.addEventListener(WebInspector.SourceCode.Event.SourceMapAdded, this.updateSourceMapResources, this);

            this.updateSourceMapResources();
        }
    }]);

    return SourceCodeTreeElement;
})(WebInspector.FolderizedTreeElement);
