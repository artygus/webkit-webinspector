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

WebInspector.KeyboardShortcut = (function (_WebInspector$Object) {
    _inherits(KeyboardShortcut, _WebInspector$Object);

    function KeyboardShortcut(modifiers, key, callback, targetElement) {
        _classCallCheck(this, KeyboardShortcut);

        _get(Object.getPrototypeOf(KeyboardShortcut.prototype), "constructor", this).call(this);

        console.assert(key);
        console.assert(!callback || typeof callback === "function");
        console.assert(!targetElement || targetElement instanceof Element);

        if (typeof key === "string") {
            key = key[0].toUpperCase();
            key = new WebInspector.Key(key.charCodeAt(0), key);
        }

        if (callback && !targetElement) targetElement = document;

        this._modifiers = modifiers || WebInspector.KeyboardShortcut.Modifier.None;
        this._key = key;
        this._targetElement = targetElement;
        this._callback = callback;
        this._disabled = false;
        this._implicitlyPreventsDefault = true;

        if (targetElement) {
            var targetKeyboardShortcuts = targetElement._keyboardShortcuts;
            if (!targetKeyboardShortcuts) targetKeyboardShortcuts = targetElement._keyboardShortcuts = [];

            targetKeyboardShortcuts.push(this);

            if (!WebInspector.KeyboardShortcut._registeredKeyDownListener) {
                WebInspector.KeyboardShortcut._registeredKeyDownListener = true;
                window.addEventListener("keydown", WebInspector.KeyboardShortcut._handleKeyDown);
            }
        }
    }

    // Static

    _createClass(KeyboardShortcut, [{
        key: "unbind",
        value: function unbind() {
            this._disabled = true;

            if (!this._targetElement) return;

            var targetKeyboardShortcuts = this._targetElement._keyboardShortcuts;
            if (!targetKeyboardShortcuts) return;

            targetKeyboardShortcuts.remove(this);
        }
    }, {
        key: "matchesEvent",
        value: function matchesEvent(event) {
            if (this._disabled) return false;

            if (this._key.keyCode !== event.keyCode) return false;

            var eventModifiers = WebInspector.KeyboardShortcut.Modifier.None;
            if (event.shiftKey) eventModifiers |= WebInspector.KeyboardShortcut.Modifier.Shift;
            if (event.ctrlKey) eventModifiers |= WebInspector.KeyboardShortcut.Modifier.Control;
            if (event.altKey) eventModifiers |= WebInspector.KeyboardShortcut.Modifier.Option;
            if (event.metaKey) eventModifiers |= WebInspector.KeyboardShortcut.Modifier.Command;
            return this._modifiers === eventModifiers;
        }
    }, {
        key: "modifiers",

        // Public

        get: function get() {
            return this._modifiers;
        }
    }, {
        key: "key",
        get: function get() {
            return this._key;
        }
    }, {
        key: "displayName",
        get: function get() {
            var result = "";

            if (this._modifiers & WebInspector.KeyboardShortcut.Modifier.Control) result += "⌃";
            if (this._modifiers & WebInspector.KeyboardShortcut.Modifier.Option) result += WebInspector.Platform.name === "mac" ? "⌥" : "⎇";
            if (this._modifiers & WebInspector.KeyboardShortcut.Modifier.Shift) result += "⇧";
            if (this._modifiers & WebInspector.KeyboardShortcut.Modifier.Command) result += "⌘";

            result += this._key.toString();

            return result;
        }
    }, {
        key: "callback",
        get: function get() {
            return this._callback;
        },
        set: function set(callback) {
            console.assert(!callback || typeof callback === "function");

            this._callback = callback || null;
        }
    }, {
        key: "disabled",
        get: function get() {
            return this._disabled;
        },
        set: function set(disabled) {
            this._disabled = disabled || false;
        }
    }, {
        key: "implicitlyPreventsDefault",
        get: function get() {
            return this._implicitlyPreventsDefault;
        },
        set: function set(implicitly) {
            this._implicitlyPreventsDefault = implicitly;
        }
    }], [{
        key: "_handleKeyDown",
        value: function _handleKeyDown(event) {
            if (event.defaultPrevented) return;

            for (var targetElement = event.target; targetElement; targetElement = targetElement.parentNode) {
                if (!targetElement._keyboardShortcuts) continue;

                for (var i = 0; i < targetElement._keyboardShortcuts.length; ++i) {
                    var keyboardShortcut = targetElement._keyboardShortcuts[i];
                    if (!keyboardShortcut.matchesEvent(event)) continue;

                    if (!keyboardShortcut.callback) continue;

                    keyboardShortcut.callback(event, keyboardShortcut);

                    if (keyboardShortcut.implicitlyPreventsDefault) event.preventDefault();

                    return;
                }
            }
        }
    }]);

    return KeyboardShortcut;
})(WebInspector.Object);

WebInspector.Key = (function () {
    function Key(keyCode, displayName) {
        _classCallCheck(this, Key);

        this._keyCode = keyCode;
        this._displayName = displayName;
    }

    // Public

    _createClass(Key, [{
        key: "toString",
        value: function toString() {
            return this._displayName;
        }
    }, {
        key: "keyCode",
        get: function get() {
            return this._keyCode;
        }
    }, {
        key: "displayName",
        get: function get() {
            return this._displayName;
        }
    }]);

    return Key;
})();

WebInspector.KeyboardShortcut.Modifier = Object.defineProperties({
    None: 0,
    Shift: 1,
    Control: 2,
    Option: 4,
    Command: 8

}, {
    CommandOrControl: {
        get: function get() {
            return WebInspector.Platform.name === "mac" ? this.Command : this.Control;
        },
        configurable: true,
        enumerable: true
    }
});

WebInspector.KeyboardShortcut.Key = {
    Backspace: new WebInspector.Key(8, "⌫"),
    Tab: new WebInspector.Key(9, "⇥"),
    Enter: new WebInspector.Key(13, "↩"),
    Escape: new WebInspector.Key(27, "⎋"),
    Space: new WebInspector.Key(32, "Space"),
    PageUp: new WebInspector.Key(33, "⇞"),
    PageDown: new WebInspector.Key(34, "⇟"),
    End: new WebInspector.Key(35, "↘"),
    Home: new WebInspector.Key(36, "↖"),
    Left: new WebInspector.Key(37, "←"),
    Up: new WebInspector.Key(38, "↑"),
    Right: new WebInspector.Key(39, "→"),
    Down: new WebInspector.Key(40, "↓"),
    Delete: new WebInspector.Key(46, "⌦"),
    Zero: new WebInspector.Key(48, "0"),
    F1: new WebInspector.Key(112, "F1"),
    F2: new WebInspector.Key(113, "F2"),
    F3: new WebInspector.Key(114, "F3"),
    F4: new WebInspector.Key(115, "F4"),
    F5: new WebInspector.Key(116, "F5"),
    F6: new WebInspector.Key(117, "F6"),
    F7: new WebInspector.Key(118, "F7"),
    F8: new WebInspector.Key(119, "F8"),
    F9: new WebInspector.Key(120, "F9"),
    F10: new WebInspector.Key(121, "F10"),
    F11: new WebInspector.Key(122, "F11"),
    F12: new WebInspector.Key(123, "F12"),
    Semicolon: new WebInspector.Key(186, ";"),
    Plus: new WebInspector.Key(187, "+"),
    Comma: new WebInspector.Key(188, ","),
    Minus: new WebInspector.Key(189, "-"),
    Period: new WebInspector.Key(190, "."),
    Slash: new WebInspector.Key(191, "/"),
    Apostrophe: new WebInspector.Key(192, "`"),
    LeftCurlyBrace: new WebInspector.Key(219, "{"),
    Backslash: new WebInspector.Key(220, "\\"),
    RightCurlyBrace: new WebInspector.Key(221, "}"),
    SingleQuote: new WebInspector.Key(222, "\'")
};
