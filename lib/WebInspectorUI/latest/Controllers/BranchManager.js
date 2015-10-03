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

WebInspector.BranchManager = (function (_WebInspector$Object) {
    _inherits(BranchManager, _WebInspector$Object);

    function BranchManager() {
        _classCallCheck(this, BranchManager);

        _get(Object.getPrototypeOf(BranchManager.prototype), "constructor", this).call(this);

        WebInspector.Frame.addEventListener(WebInspector.Frame.Event.MainResourceDidChange, this._mainResourceDidChange, this);

        this.initialize();
    }

    // Public

    _createClass(BranchManager, [{
        key: "initialize",
        value: function initialize() {
            this._originalBranch = new WebInspector.Branch(WebInspector.UIString("Original"), null, true);
            this._currentBranch = this._originalBranch.fork(WebInspector.UIString("Working Copy"));
            this._branches = [this._originalBranch, this._currentBranch];
        }
    }, {
        key: "createBranch",
        value: function createBranch(displayName, fromBranch) {
            if (!fromBranch) fromBranch = this._originalBranch;

            console.assert(fromBranch instanceof WebInspector.Branch);
            if (!(fromBranch instanceof WebInspector.Branch)) return null;

            var newBranch = fromBranch.fork(displayName);
            this._branches.push(newBranch);
            return newBranch;
        }
    }, {
        key: "deleteBranch",
        value: function deleteBranch(branch) {
            console.assert(branch instanceof WebInspector.Branch);
            if (!(branch instanceof WebInspector.Branch)) return;

            console.assert(branch !== this._originalBranch);
            if (branch === this._originalBranch) return;

            this._branches.remove(branch);

            if (branch === this._currentBranch) this._currentBranch = this._originalBranch;
        }

        // Private

    }, {
        key: "_mainResourceDidChange",
        value: function _mainResourceDidChange(event) {
            console.assert(event.target instanceof WebInspector.Frame);

            if (!event.target.isMainFrame()) return;

            this.initialize();
        }
    }, {
        key: "branches",
        get: function get() {
            return this._branches;
        }
    }, {
        key: "currentBranch",
        get: function get() {
            return this._currentBranch;
        },
        set: function set(branch) {
            console.assert(branch instanceof WebInspector.Branch);
            if (!(branch instanceof WebInspector.Branch)) return;

            this._currentBranch.revert();

            this._currentBranch = branch;

            this._currentBranch.apply();
        }
    }]);

    return BranchManager;
})(WebInspector.Object);
