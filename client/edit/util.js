define(function(require, exports, module) {
    var sessions = require("sessions"); 
    var tabs = require("project_nav/tabs");
    
//    var EditSession = require("ace/edit_session").EditSession;

    // Set up blank editor screen 
//    exports.initBlankEditor = function() {
//        var session = new EditSession(document.getElementById("blankeditor").innerHTML);
//        env.split.setSession(session);
//        env.editor.setReadOnly(true);
//        env.editor.focus();
//    };
    exports.editor = function() {
        return env.editor;
    };
    exports.currentSession = function() {
        return env.editor.getSession();
    };
    exports.saveCurrentSession = function() {
        this.saveFile(env.editor.getSession());
    };
    // checkIfOpen checks if any of the nodes passed in have open editor buffers.
    // It returns the list
    exports.checkIfOpen = function(nodeList, closeThem) {
        var i, j;
        var list = '';
        var sessionList = sessions.getSessionsArray();
        for (i in sessionList) {
            var f = sessionList[i].filename;
            for (j = 0; j < nodeList.length; j++) {
                var node = nodeList[j];
                var title = node.title + ($(node).attr("rel") === 'default' ? '' : "/") ;
                if (f.search(title) === 0) {
                    if (closeThem && !sessions.isDirty(sessionList[i])) {
                        tabs.doClose(sessionList[i], false);
                    } else {
                        list += f + ' ';
                    }
                    break;
                }
            } 
        }
        return list;
    };
});