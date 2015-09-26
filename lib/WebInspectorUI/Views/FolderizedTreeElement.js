var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2014-2015 Apple Inc. All rights reserved.
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

WebInspector.FolderizedTreeElement = (function (_WebInspector$GeneralTreeElement) {
    _inherits(FolderizedTreeElement, _WebInspector$GeneralTreeElement);

    function FolderizedTreeElement(classNames, title, subtitle, representedObject, hasChildren) {
        _classCallCheck(this, FolderizedTreeElement);

        _get(Object.getPrototypeOf(FolderizedTreeElement.prototype), "constructor", this).call(this, classNames, title, subtitle, representedObject, hasChildren);

        this.shouldRefreshChildren = true;

        this._folderSettingsKey = "";
        this._folderTypeMap = new Map();
        this._folderizeSettingsMap = new Map();
        this._groupedIntoFolders = false;
        this._clearNewChildQueue();
    }

    // Public

    _createClass(FolderizedTreeElement, [{
        key: "registerFolderizeSettings",
        value: function registerFolderizeSettings(type, folderDisplayName, validateRepresentedObjectCallback, countChildrenCallback, treeElementConstructor) {
            console.assert(type);
            console.assert(folderDisplayName);
            console.assert(typeof validateRepresentedObjectCallback === "function");
            console.assert(typeof countChildrenCallback === "function");
            console.assert(typeof treeElementConstructor === "function");

            var settings = {
                type: type,
                folderDisplayName: folderDisplayName,
                validateRepresentedObjectCallback: validateRepresentedObjectCallback,
                countChildrenCallback: countChildrenCallback,
                treeElementConstructor: treeElementConstructor
            };

            this._folderizeSettingsMap.set(type, settings);
        }

        // Overrides from TreeElement (Private).

    }, {
        key: "removeChildren",
        value: function removeChildren() {
            _get(Object.getPrototypeOf(FolderizedTreeElement.prototype), "removeChildren", this).call(this);

            this._clearNewChildQueue();

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._folderTypeMap.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var folder = _step.value;

                    folder.removeChildren();
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

            this._folderTypeMap.clear();

            this._groupedIntoFolders = false;
        }

        // Protected

    }, {
        key: "addChildForRepresentedObject",
        value: function addChildForRepresentedObject(representedObject) {
            var settings = this._settingsForRepresentedObject(representedObject);
            console.assert(settings);
            if (!settings) {
                console.error("No settings for represented object", representedObject);
                return;
            }

            if (!this.treeOutline) {
                // Just mark as needing to update to avoid doing work that might not be needed.
                this.shouldRefreshChildren = true;
                return;
            }

            var childTreeElement = this.treeOutline.getCachedTreeElement(representedObject);
            if (!childTreeElement) childTreeElement = new settings.treeElementConstructor(representedObject);

            this._addTreeElement(childTreeElement);
        }
    }, {
        key: "addRepresentedObjectToNewChildQueue",
        value: function addRepresentedObjectToNewChildQueue(representedObject) {
            // This queue reduces flashing as resources load and change folders when their type becomes known.

            this._newChildQueue.push(representedObject);
            if (!this._newChildQueueTimeoutIdentifier) this._newChildQueueTimeoutIdentifier = setTimeout(this._populateFromNewChildQueue.bind(this), WebInspector.FolderizedTreeElement.NewChildQueueUpdateInterval);
        }
    }, {
        key: "removeChildForRepresentedObject",
        value: function removeChildForRepresentedObject(representedObject) {
            this._removeRepresentedObjectFromNewChildQueue(representedObject);
            this.updateParentStatus();

            if (!this.treeOutline) {
                // Just mark as needing to update to avoid doing work that might not be needed.
                this.shouldRefreshChildren = true;
                return;
            }

            // Find the tree element for the frame by using getCachedTreeElement
            // to only get the item if it has been created already.
            var childTreeElement = this.treeOutline.getCachedTreeElement(representedObject);
            if (!childTreeElement || !childTreeElement.parent) return;

            this._removeTreeElement(childTreeElement);
        }
    }, {
        key: "compareChildTreeElements",
        value: function compareChildTreeElements(a, b) {
            return this._compareTreeElementsByMainTitle(a, b);
        }
    }, {
        key: "updateParentStatus",
        value: function updateParentStatus() {
            var hasChildren = false;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._folderizeSettingsMap.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var settings = _step2.value;

                    if (settings.countChildrenCallback()) {
                        hasChildren = true;
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

            this.hasChildren = hasChildren;
            if (!this.hasChildren) this.removeChildren();
        }
    }, {
        key: "prepareToPopulate",
        value: function prepareToPopulate() {
            if (!this._groupedIntoFolders && this._shouldGroupIntoFolders()) {
                this._groupedIntoFolders = true;
                return true;
            }

            return false;
        }

        // Private

    }, {
        key: "_clearNewChildQueue",
        value: function _clearNewChildQueue() {
            this._newChildQueue = [];
            if (this._newChildQueueTimeoutIdentifier) {
                clearTimeout(this._newChildQueueTimeoutIdentifier);
                this._newChildQueueTimeoutIdentifier = null;
            }
        }
    }, {
        key: "_populateFromNewChildQueue",
        value: function _populateFromNewChildQueue() {
            if (!this.children.length) {
                this.updateParentStatus();
                this.shouldRefreshChildren = true;
                return;
            }

            if (this.prepareToPopulate()) {
                // Will now folderize, repopulate children.
                this._clearNewChildQueue();
                this.shouldRefreshChildren = true;
                return;
            }

            for (var i = 0; i < this._newChildQueue.length; ++i) this.addChildForRepresentedObject(this._newChildQueue[i]);

            this._clearNewChildQueue();
        }
    }, {
        key: "_removeRepresentedObjectFromNewChildQueue",
        value: function _removeRepresentedObjectFromNewChildQueue(representedObject) {
            this._newChildQueue.remove(representedObject);
        }
    }, {
        key: "_addTreeElement",
        value: function _addTreeElement(childTreeElement) {
            console.assert(childTreeElement);
            if (!childTreeElement) return;

            var wasSelected = childTreeElement.selected;

            this._removeTreeElement(childTreeElement, true, true);

            var parentTreeElement = this._parentTreeElementForRepresentedObject(childTreeElement.representedObject);
            if (parentTreeElement !== this && !parentTreeElement.parent) this._insertFolderTreeElement(parentTreeElement);

            this._insertChildTreeElement(parentTreeElement, childTreeElement);

            if (wasSelected) childTreeElement.revealAndSelect(true, false, true, true);
        }
    }, {
        key: "_compareTreeElementsByMainTitle",
        value: function _compareTreeElementsByMainTitle(a, b) {
            return a.mainTitle.localeCompare(b.mainTitle);
        }
    }, {
        key: "_insertFolderTreeElement",
        value: function _insertFolderTreeElement(folderTreeElement) {
            console.assert(this._groupedIntoFolders);
            console.assert(!folderTreeElement.parent);
            this.insertChild(folderTreeElement, insertionIndexForObjectInListSortedByFunction(folderTreeElement, this.children, this._compareTreeElementsByMainTitle));
        }
    }, {
        key: "_insertChildTreeElement",
        value: function _insertChildTreeElement(parentTreeElement, childTreeElement) {
            console.assert(!childTreeElement.parent);
            parentTreeElement.insertChild(childTreeElement, insertionIndexForObjectInListSortedByFunction(childTreeElement, parentTreeElement.children, this.compareChildTreeElements.bind(this)));
        }
    }, {
        key: "_removeTreeElement",
        value: function _removeTreeElement(childTreeElement, suppressOnDeselect, suppressSelectSibling) {
            var oldParent = childTreeElement.parent;
            if (!oldParent) return;

            oldParent.removeChild(childTreeElement, suppressOnDeselect, suppressSelectSibling);

            if (oldParent === this) return;

            console.assert(oldParent instanceof WebInspector.FolderTreeElement);
            if (!(oldParent instanceof WebInspector.FolderTreeElement)) return;

            // Remove the old parent folder if it is now empty.
            if (!oldParent.children.length) oldParent.parent.removeChild(oldParent);
        }
    }, {
        key: "_parentTreeElementForRepresentedObject",
        value: function _parentTreeElementForRepresentedObject(representedObject) {
            if (!this._groupedIntoFolders) return this;

            console.assert(this._folderSettingsKey !== "");

            function createFolderTreeElement(type, displayName) {
                var folderTreeElement = new WebInspector.FolderTreeElement(displayName);
                folderTreeElement.__expandedSetting = new WebInspector.Setting(type + "-folder-expanded-" + this._folderSettingsKey, false);
                if (folderTreeElement.__expandedSetting.value) folderTreeElement.expand();
                folderTreeElement.onexpand = this._folderTreeElementExpandedStateChange.bind(this);
                folderTreeElement.oncollapse = this._folderTreeElementExpandedStateChange.bind(this);
                return folderTreeElement;
            }

            var settings = this._settingsForRepresentedObject(representedObject);
            if (!settings) {
                console.error("Unknown representedObject", representedObject);
                return this;
            }

            var folder = this._folderTypeMap.get(settings.type);
            if (folder) return folder;

            folder = createFolderTreeElement.call(this, settings.type, settings.folderDisplayName);
            this._folderTypeMap.set(settings.type, folder);
            return folder;
        }
    }, {
        key: "_folderTreeElementExpandedStateChange",
        value: function _folderTreeElementExpandedStateChange(folderTreeElement) {
            console.assert(folderTreeElement.__expandedSetting);
            folderTreeElement.__expandedSetting.value = folderTreeElement.expanded;
        }
    }, {
        key: "_settingsForRepresentedObject",
        value: function _settingsForRepresentedObject(representedObject) {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this._folderizeSettingsMap.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var settings = _step3.value;

                    if (settings.validateRepresentedObjectCallback(representedObject)) return settings;
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

            return null;
        }
    }, {
        key: "_shouldGroupIntoFolders",
        value: function _shouldGroupIntoFolders() {
            // Already grouped into folders, keep it that way.
            if (this._groupedIntoFolders) return true;

            // Child objects are grouped into folders if one of two thresholds are met:
            // 1) Once the number of medium categories passes NumberOfMediumCategoriesThreshold.
            // 2) When there is a category that passes LargeChildCountThreshold and there are
            //    any child objects in another category.

            // Folders are avoided when there is only one category or most categories are small.

            var numberOfSmallCategories = 0;
            var numberOfMediumCategories = 0;
            var foundLargeCategory = false;

            function pushCategory(childCount) {
                if (!childCount) return false;

                // If this type has any resources and there is a known large category, make folders.
                if (foundLargeCategory) return true;

                // If there are lots of this resource type, then count it as a large category.
                if (childCount >= WebInspector.FolderizedTreeElement.LargeChildCountThreshold) {
                    // If we already have other resources in other small or medium categories, make folders.
                    if (numberOfSmallCategories || numberOfMediumCategories) return true;

                    foundLargeCategory = true;
                    return false;
                }

                // Check if this is a medium category.
                if (childCount >= WebInspector.FolderizedTreeElement.MediumChildCountThreshold) {
                    // If this is the medium category that puts us over the maximum allowed, make folders.
                    return ++numberOfMediumCategories >= WebInspector.FolderizedTreeElement.NumberOfMediumCategoriesThreshold;
                }

                // This is a small category.
                ++numberOfSmallCategories;
                return false;
            }

            // Iterate over all the available child object types.
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this._folderizeSettingsMap.values()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var settings = _step4.value;

                    if (pushCategory(settings.countChildrenCallback())) return true;
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

            return false;
        }
    }, {
        key: "groupedIntoFolders",
        get: function get() {
            return this._groupedIntoFolders;
        }
    }, {
        key: "folderSettingsKey",
        set: function set(x) {
            this._folderSettingsKey = x;
        }
    }]);

    return FolderizedTreeElement;
})(WebInspector.GeneralTreeElement);

WebInspector.FolderizedTreeElement.MediumChildCountThreshold = 5;
WebInspector.FolderizedTreeElement.LargeChildCountThreshold = 15;
WebInspector.FolderizedTreeElement.NumberOfMediumCategoriesThreshold = 2;
WebInspector.FolderizedTreeElement.NewChildQueueUpdateInterval = 500;
