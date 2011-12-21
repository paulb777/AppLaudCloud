define(function(require, exports, module) {
    var sessions = {};
    var filenames = {};
    exports.add = function(tabName, session) {
        sessions[tabName] = session;
        filenames[session.filename] = tabName;
        session.tabId = tabName;
    };
    exports.remove = function(filename) {
        var tabName = filenames[filename];
        delete sessions[tabName];
        delete filenames[filename];
    };
    exports.get = function(name) {
        return sessions[name];
    };
    exports.getByFilename = function(filename) {  //full path
        return filenames[filename];  // the tab name
    };
    exports.isDirty = function(session) {
        return session.dirty;
    };
    exports.setDirty = function(session) {
        var tabId = session.tabId;
        session.dirty = true;
        $('a[href=#' + tabId + ']').css( "font-style", "italic" );
    };
    exports.clearDirty = function(session) {
        var tabId = session.tabId;
        session.dirty = false;
        $('a[href=#' + tabId + ']').css( "font-style", "" );
    };
    exports.getSessionsArray = function() {
        return sessions;
    };
    exports.updateFilename = function(session, filename, newName) {
        var tabId = filenames[session.filename];
        delete filenames[session.filename];
        session.filename = filename;
        filenames[session.filename] = tabId;
        $('a[href=#' + tabId + ']').html(newName);
    };
});
