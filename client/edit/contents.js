define(function(require, exports, module) {
    var sessions = require("sessions");
    var modes = require("modes");
    var EditSession = require("ace/edit_session").EditSession;
    var UndoManager = require("ace/undomanager").UndoManager;
    var tabCounter = 0;

    exports.put = function(filename, contents, dropped) {
        tabCounter = tabCounter + 1;
        var tabName = 'tab' + tabCounter;
        var session = new EditSession(contents, modes.getMode(filename));
        session.setUndoManager(new UndoManager());
        session.filename = filename;
        if (dropped) {
            session.dropped = true;
        }
        sessions.add(tabName, session); 

        $('#tabs_div').append("<div id='" + tabName + "'></div>");
        $('#tabs_div').tabs('add', '#' + tabName, filename.substring(filename.lastIndexOf('/') + 1));
    };
});   