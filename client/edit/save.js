define(function(require, exports, module) {
    var connection = require('project_nav/connection');
    var dialog = require('project_nav/dialog');
    var sessions = require('sessions'); 
    
    var nameFromPath = function(p) {
        return p.substring(p.lastIndexOf('/') + 1);
    };

    exports.saveFile = function(session, saveas, isSaveAll, callback) {  // callback used only by saveas
        var contents = session.getValue();
        var id;
        var name = null;
        var isSaveAs = !!saveas;
        if (saveas) {
            id = saveas;
            name = nameFromPath(id);
        } else {
            id = session.filename;
            if (session.dropped) {
                if (isSaveAll) {
                    if (!session.warned) {
                        alert(id + " will not be saved. 'File->Save As' is required for drag and dropped files");
                        session.warned = true;
                    }
                } else {
                    alert("'Save as' is required for drag and dropped files");
                }
                return;
            }
        }
        connection.post('/write', { filename: id, saveas : isSaveAs, contents : contents }, function(r){
            if (!r.success) {
                if (r.ret === 'overwrite') { 
                    alert("'Save As' failed. 'Save As' cannot over-write an existing file");
                } else {
                    alert('Save failed ' + id);
                }
            } else {
                sessions.clearDirty(session);
                delete session.dropped;
                if (callback) {    
                    callback();
                }
            }
        });
    };
    exports.saveAs = function() {          
        var node = null;
        var f = $.jstree._focused();
        if (f) { 
            node = f.get_selected();
        }
        if (!f || !node || node.length !== 1 || $(node).attr("rel") === 'default') {
            alert('Exactly one folder must be selected for the container for Save As');
            return;  
        }

        var session = env.editor.getSession();
        var name = nameFromPath(session.filename);
        var folder = $(node).attr("title");
        var saveFile = this.saveFile;
        var id = folder + '/' + name;
        dialog.make('Save as ' + folder + '/', name, function() {
            saveFile(session, id, false, function() {
                sessions.updateFilename(session, id, name);
                $("#projects").jstree('refresh', node);
            });
        });   
    };
    exports.saveAll = function() {
        var sessionList = sessions.getSessionsArray();
        var d;
        for (d in sessionList) {
            if (sessions.isDirty(sessionList[d])) {
                this.saveFile(sessionList[d], null, true);
            }
        }  
    };
});