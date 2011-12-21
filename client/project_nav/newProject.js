define(function(require, exports, module) {
    var openFile = require('project_nav/openFile');
    var connection = require('project_nav/connection');

    var dialogInit = false;
    
    // Initialize project template options
    $.post("template", {}, function(r) {
        if (r.success === 0) {
            alert('Error initializing project creation wizard');
        } else {
            var options = r.result;

            var orderedList = [];
            var unorderedStr = '';
            var str;
            for (var i in options) {
                str = '<option value="' + options[i].template + ':' + options[i].jqm +'"';
                if (options[i].select) str += ' selected="selected" ';
                str += '>' + i + '</option>';
                if (options[i].order !== undefined) {
                    orderedList[options[i].order] = str;
                } else {
                    unorderedStr += str;
                }
            }
            $('#npd-template').html(orderedList.join(' ') + unorderedStr);
        }
    });

    // Ugly - in env scope so setTimeout works
    var openPath = function(p, stop) {
        var node = $('li[title="' + p + '"]');
        var jst_ref = $.jstree._reference(node);
        if (node && jst_ref) {
            jst_ref.open_node(node);
            jst_ref.select_node(node);
        } else if (!stop) { // try one more time - a hack, but it's not obvious how to cascade the openPaths
            setTimeout('env.openPath("' + p + '", true)', 500);
        }
    };
    
    var success = function(project) {
        env.openPath = openPath;
        $("#projects").jstree('refresh', -1).one("reopen.jstree", function (event, data) {
            openFile.path('/' + project + '/assets/www/index.html');
            openPath('/' + project);
        }).one("open_node.jstree", function (e, data) {
            openPath('/' + project + '/assets');
        }).one("open_node.jstree", function (e, data) {
            openPath('/' + project + '/assets/www');
        });
    };

    var createProject = function() {
        var project = document.getElementById("npd-project").value;
//        var app = document.getElementById("npd-app").value;
        var pkg = document.getElementById("npd-package").value;
//        var activity = document.getElementById("npd-activity").value;
        var opts = document.getElementById("npd-template").value;
        opts = opts.split(':');
        var template = opts[0];
        var jqm = opts[1];
        var target = document.getElementById("npd-android-target").value;
        connection.ajax({ url : "/phonegapCreate",  type : "POST", data: {project: project, pkg : pkg, 
            template : template, jqm : jqm, target : target}, success : function(r) {
                if (r.success) {
                    success(project);
                } else {
                    alert('Error creating project ' + project + ': ' + r.error);
                }
            }, error : function(r, m) { alert ('Internal Error: project creation server connection lost ' + JSON.stringify(r) + m); }});
//        connection.post("/phonegapCreate", {project: project, pkg : pkg, 
//            template : template, jqm : jqm, target : target}, function(r) {
//                if (r.success) {
//                    success(project);
//                } else {
//                    alert('Error creating project ' + project + ': ' + r.error);
//                }
//            });
    };

    exports.run = function() { 
        var dialogId = "#new_project_dialog";

        if (dialogInit) {
            $(dialogId).dialog('open');
        } else {
            dialogInit = true;
            $(dialogId).dialog({
                autoOpen: true,
                draggable: true,
                resizable: true,
                width: 480,
                title: "Project Creation Wizard",
                buttons: {
                    "Create": function() {
                        createProject();
                        $(dialogId).dialog('close');
                    },
                    "Close": function() {
                        $(dialogId).dialog('close');
                        return false;
                    }
                }
            });
            $(dialogId).keyup(function(e) {
                if (e.keyCode === 13) {
                    createProject();
                    $(dialogId).dialog('close');
                }
            });
            $('#npd-project').keyup(function(e) {
                var newVal = $(this).val();
                if ($('#npd-package').val().search('com.example.') === 0) {
                    $('#npd-package').val("com.example." + newVal);
                }
            });
        }
    };
    
    var importDialogId = "#project_import_dialog";
    var importProject = '';
    
    function preRequest(formData, jqForm, options) { 
        if (!(/.zip$/.test(formData[0].value))) {  
            alert('Please select a zipfile. The name must end with .zip');
            return false;
        }
        var name = document.getElementById("pid-name").value;
        if (name === '') {  
            alert('Please enter a project name for the new imported project');
            return false;
        }
        importProject = name;
        connection.post('/setSession'); 
        return true; 
    } 

    var processResponse = function(r) {
        $(importDialogId).dialog('close');
        var start = r.indexOf('START');
        var end = r.indexOf('END');
        var zipFile = r.substring(start+5, end);
        connection.post('/projectImport', { zipFile : zipFile, project : importProject }, function(r) {
            if (r.success) {
                success(importProject);
            } else {
                alert('Error importing project ' + importProject + ': ' + r.error);
            }            
        });
    };
    
    var options = { 
        beforeSubmit:  preRequest,  // pre-submit callback 
        success:       processResponse,  // post-submit callback 
        clearForm: true        // clear all form fields after successful submit 
    }; 
    
    $('#projectImportForm').ajaxForm(options);
    
    exports.importProject = function() {
 //           doBuild = callback;
        $(importDialogId).dialog({
            autoOpen: true,
            draggable: true,
            resizable: true,
            width: 570,
            title: "Import Android Project",
            buttons: {
                "Close": function() {
                    $(importDialogId).dialog('close');
                    return false;
                }
            }
        });      
    };
});
