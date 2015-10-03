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

WebInspector.KeyboardShortcut = function (modifiers, key, callback, targetElement) {
    WebInspector.Object.call(this);

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
};

WebInspector.KeyboardShortcut._handleKeyDown = function (event) {
    if (event.defaultPrevented) return;

    for (var targetElement = event.target; targetElement; targetElement = targetElement.parentNode) {
        if (!targetElement._keyboardShortcuts) continue;

        for (var i = 0; i < targetElement._keyboardShortcuts.length; ++i) {
            var keyboardShortcut = targetElement._keyboardShortcuts[i];
            if (!keyboardShortcut.matchesEvent(event)) continue;

            keyboardShortcut.callback(event, keyboardShortcut);

            if (keyboardShortcut.implicitlyPreventsDefault) event.preventDefault();

            return;
        }
    }
};

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

WebInspector.Key = function (keyCode, displayName) {
    this._keyCode = keyCode;
    this._displayName = displayName;
};

WebInspector.Key.prototype = Object.defineProperties({

    toString: function toString() {
        return this._displayName;
    }
}, {
    keyCode: {
        get: function get() {
            return this._keyCode;
        },
        configurable: true,
        enumerable: true
    },
    displayName: {
        get: function get() {
            return this._displayName;
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
    Backslash: new WebInspector.Key(220, "\\"),
    Apostrophe: new WebInspector.Key(192, "`"),
    SingleQuote: new WebInspector.Key(222, "\'")
};

WebInspector.KeyboardShortcut.prototype = Object.defineProperties({
    constructor: WebInspector.KeyboardShortcut,

    unbind: function unbind() {
        this._disabled = true;

        if (!this._targetElement) return;

        var targetKeyboardShortcuts = this._targetElement._keyboardShortcuts;
        if (!targetKeyboardShortcuts) return;

        targetKeyboardShortcuts.remove(this);
    },

    matchesEvent: function matchesEvent(event) {
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
    modifiers: { // Public

        get: function get() {
            return this._modifiers;
        },
        configurable: true,
        enumerable: true
    },
    key: {
        get: function get() {
            return this._key;
        },
        configurable: true,
        enumerable: true
    },
    displayName: {
        get: function get() {
            var result = "";

            if (this._modifiers & WebInspector.KeyboardShortcut.Modifier.Control) result += "⌃";
            if (this._modifiers & WebInspector.KeyboardShortcut.Modifier.Option) result += WebInspector.Platform.name === "mac" ? "⌥" : "⎇";
            if (this._modifiers & WebInspector.KeyboardShortcut.Modifier.Shift) result += "⇧";
            if (this._modifiers & WebInspector.KeyboardShortcut.Modifier.Command) result += "⌘";

            result += this._key.toString();

            return result;
        },
        configurable: true,
        enumerable: true
    },
    callback: {
        get: function get() {
            return this._callback;
        },
        configurable: true,
        enumerable: true
    },
    disabled: {
        get: function get() {
            return this._disabled;
        },
        set: function set(disabled) {
            this._disabled = disabled || false;
        },
        configurable: true,
        enumerable: true
    },
    implicitlyPreventsDefault: {
        get: function get() {
            return this._implicitlyPreventsDefault;
        },
        set: function set(implicitly) {
            this._implicitlyPreventsDefault = implicitly;
        },
        configurable: true,
        enumerable: true
    }
});

WebInspector.KeyboardShortcut.prototype.__proto__ = WebInspector.Object.prototype;
