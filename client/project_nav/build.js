define(function(require, exports, module) {
    var connection = require("project_nav/connection");
    var release = require("project_nav/release");

    var getProject = function() {
        var node = $.jstree._focused().get_selected();
        if (!node) {
            return null;
        }
        var path = $(node).attr("title");
        if (!path) return null;
        var secondSlash = path.indexOf('/',1);
        if (secondSlash === -1) {  
            return path;   // path is the project
        } else {
            return path.substring(0, secondSlash);
        }
    };
    
    var dialogTag = "#build_dialog";
    var openBuildDialog = function(html, width) {
        $(dialogTag).html(html).dialog({
            autoOpen: true,
            draggable: true,
            resizable: true,
            width: width,
            title: 'Build Dialog',
            modal: false, 
            buttons: {
                "Dismiss": function() {
                    $(dialogTag).dialog('close');
                    return false;
                }
            }
        });
    };
    
    exports.run = function(kind) { 
        var project = getProject();
        if (!project) {
            openBuildDialog('Please select a project to build.');
            return;
        }
        
        var checkBuild = function(data) {
            var doCheckBuild = function() {
                connection.ajax({ url : "/checkBuild", type : "POST",  data: data, success : function(r) {
                    if (r.inProgress) {
                        setTimeout(doCheckBuild, 20000);
                    } else if (r.success) {
                        openBuildDialog('Project ' + project + ' built successfully! Refresh APKs on the device app to download to your device');
                    } else {
                        openBuildDialog('Project ' + project + ' build FAILED.' + r.error, 1000);
                    }
                }, error : function(r, m) { 
                    if (m === 'timeout') { 
                        openBuildDialog ('The ajax connection to the server has timed out. However, the build is likely continuing. Select the bin directory and do File-> Refresh');
                    } else {
                        openBuildDialog ('ajax build error: ' + JSON.stringify(r) + '--' + m); 
                    }
                }});  
            };
            doCheckBuild();
        };
        
        var doBuild = function(data) {
            data = data || {};
            data.project = project;
            data.kind = kind;
            connection.post('./build', data, function(r) {
                if (r.success === false) {
                    openBuildDialog('Project ' + project + ' build FAILED: ' + r.error);  // user trying to build twice at same time
                } else {
                    checkBuild(data);
                }
            });

//            connection.post("/build", data, function(r) {
//                $(dialogTag).dialog('close');
//                if (r.success) {
//                    openBuildDialog('Project ' + project + ' built successfully! Refresh APKs on the device app to download to your device');
//                } else {
//                    openBuildDialog('Project ' + project + ' build FAILED.' + r.error, 1000);  
//                }
//            });
            openBuildDialog('The ' + kind + ' build of project ' + project + ' has started on the server. Close this dialog and in a minute or two it will return to inform you of the build completion.');
        };

        if (kind === 'release') {
            release.getInfo(doBuild);
        } else {
            doBuild();
        }
    };
    
    exports.ripple = function(node) { 
        var project = getProject();
        if (!project) {
            alert('Please select a project to emulate');
            return;
        }
        connection.post('ripple');
        var origin = node.origin;
        window.open(origin + '/ripple/index.html?' + origin + '/workspace' + 
                project + '/assets/www/index.html', '_blank');
    };
});