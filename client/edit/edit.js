/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mozilla Skywriter.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *      Fabian Jakobs <fabian AT ajax DOT org>
 *      Kevin Dangoor (kdangoor@mozilla.com)
 *      Julian Viereck <julian DOT viereck AT gmail DOT com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

define(function(require, exports, module) {

exports.launch = function() {
    var env = {};  // may need to change back to param from boot for command line
    var event = require("ace/lib/event");
    var theme = require("ace/theme/textmate"); 
    var save = require("save");
    
    var preferences = require("preferences");
    var container = document.getElementById("editor");

    // Splitting.
    var Split = require("ace/split").Split;
    var split = new Split(container, theme, 1);
    env.editor = split.getEditor(0);
    split.on("focus", function(editor) {
        env.editor = editor;
        preferences.update();
    });
    env.split = split;
    window.env = env;
    window.ace = env.editor;
    
    preferences.init();
     
    var help = require("help");
    var find = require("find");
    var contents = require("contents");

    // more resize handling in layoutInit.js
    env.resize = function () {
        env.split.resize();
        env.editor.resize();
    };
    env.resize();
    
//    util.initBlankEditor();
    $('#editor_help').html(help.html);
    $('#pop_help_contents').html(help.html);

    // Call resize on the cli explizit. This is necessary for Firefox.
 //   env.cli.cliView.resizer();

    event.addListener(container, "dragover", function(e) {
        return event.preventDefault(e);
    });

    event.addListener(container, "drop", function(e) {
        var file;
        try {
            file = e.dataTransfer.files[0];
        } catch(e2) {
            return event.stopEvent();
        }

        if (window.FileReader) {
            var reader = new FileReader();
            reader.onload = function(e) {
                contents.put(file.name, reader.result, true);
            };
            reader.readAsText(file);
        }
        return event.preventDefault(e);
    });

    window.env = env;

    /**
     * This demonstrates how you can define commands and bind shortcuts to them.
     */

    // Command to focus the command line from the editor.
//    canon.addCommand({
//        name: "focuscli",
//        bindKey: {
//            win: "Ctrl-J",
//            mac: "Command-J",
//            sender: "editor"
//        },
//        exec: function() {
//            env.cli.cliView.element.focus();
//        }
//    });

    // Command to focus the editor line from the command line.
//    canon.addCommand({
//        name: "focuseditor",
//        bindKey: {
//            win: "Ctrl-J",
//            mac: "Command-J",
//            sender: "cli"
//        },
//        exec: function() {
//            env.editor.focus();
//        }
//    });
    
    var commands = env.editor.commands;

    // Save, works from the editor and the command line.
    commands.addCommand({
        name: "save",
        bindKey: {
            win: "Ctrl-S",
            mac: "Command-S",
            sender: "editor|cli"
        },
        exec: function() {
            save.saveFile(env.editor.getSession());
        }
    });
    
    // Save as, works from the editor and the command line.
    commands.addCommand({
        name: "saveas",
        bindKey: {
            win: "Ctrl-Shift-S",
            mac: "Command-Shift-S",
            sender: "editor|cli"
        },
        exec: function() {
            save.saveAs();
        }
    });
    
    // Find, works from the editor and the command line.
    commands.addCommand({
        name: "find",
        bindKey: {
            win: "Ctrl-F",
            mac: "Command-F",
            sender: "editor|cli"
        },
        exec: function() {
           find.find();
        }
    });
};
});
