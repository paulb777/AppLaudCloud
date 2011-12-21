define(function(require, exports, module) {
    var util = require('util');
    exports.find = function() {    // TODO add support for options - see https://github.com/ajaxorg/ace/wiki/Embedding---API
        var dialogId = "#find_replace";
        var editor = util.editor();

        // Clear replace value.  Find keeps last value
        document.getElementById("frreplace").value = '';
        var getFindVal = function() {
            return document.getElementById("frfind").value;
        };
        var getReplaceVal = function() {
            return document.getElementById("frreplace").value;
        };
        $(dialogId).dialog({
            autoOpen: true,
            draggable: true,
            resizable: true,
            width: 425,
            title: "Find and Replace",
            buttons: {
                "Find": function() {
                    var f = getFindVal();
                    editor.find(f);
                },
                "Replace/Find": function() {
                    var f = getFindVal();
                    var r = getReplaceVal();
                    editor.$tryReplace(editor.getSelectionRange(), r);
                    editor.find(f);
                },
                "Replace": function() {
                    var r = getReplaceVal();
                    editor.$tryReplace(editor.getSelectionRange(), r);
                },
                "Replace All": function() {
                    var f = getFindVal();
                    var r = getReplaceVal();
                    editor.find(f);
                    editor.replaceAll(r);
                },
                "Cancel": function() {
                    $(dialogId).dialog('close');
                    return false;
                }
            }
        });

        $(dialogId).keyup(function(e) {
            if (e.keyCode === 13) {   // Same as find click
                var f = getFindVal();
                editor.find(f);
            }
        });  
    };
});