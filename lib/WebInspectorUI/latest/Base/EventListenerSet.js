var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * Copyright (C) 2014, 2015 Apple Inc. All rights reserved.
 * Copyright (C) 2013, 2014 University of Washington. All rights reserved.
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
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// This class supports adding and removing many listeners at once.
// Add DOM or Inspector event listeners to the set using `register()`.
// Use `install()` and `uninstall()` to enable or disable all listeners
// in the set at once.

WebInspector.EventListenerSet = (function () {
    function EventListenerSet(defaultThisObject, name) {
        _classCallCheck(this, EventListenerSet);

        this.name = name;
        this._defaultThisObject = defaultThisObject;

        this._listeners = [];
        this._installed = false;
    }

    // Public

    _createClass(EventListenerSet, [{
        key: "register",
        value: function register(emitter, type, callback, thisObject, usesCapture) {
            console.assert(callback, "Missing callback for event: " + type);
            console.assert(type, "Tried to register listener for unknown event: " + type);
            var emitterIsValid = emitter && (emitter instanceof WebInspector.Object || emitter instanceof Node || typeof emitter.addEventListener === "function");
            console.assert(emitterIsValid, "Event emitter ", emitter, " (type:" + type + ") is null or does not implement Node or WebInspector.Object!");

            if (!emitterIsValid || !type || !callback) return;

            this._listeners.push({ listener: new WebInspector.EventListener(thisObject || this._defaultThisObject), emitter: emitter, type: type, callback: callback, usesCapture: usesCapture });
        }
    }, {
        key: "unregister",
        value: function unregister() {
            if (this._installed) this.uninstall();
            this._listeners = [];
        }
    }, {
        key: "install",
        value: function install() {
            console.assert(!this._installed, "Already installed listener group: " + this.name);
            if (this._installed) return;

            this._installed = true;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._listeners[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var data = _step.value;

                    data.listener.connect(data.emitter, data.type, data.callback, data.usesCapture);
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
        key: "uninstall",
        value: function uninstall(unregisterListeners) {
            console.assert(this._installed, "Trying to uninstall listener group " + this.name + ", but it isn't installed.");
            if (!this._installed) return;

            this._installed = false;

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._listeners[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var data = _step2.value;

                    data.listener.disconnect();
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

            if (unregisterListeners) this._listeners = [];
        }
    }]);

    return EventListenerSet;
})();
