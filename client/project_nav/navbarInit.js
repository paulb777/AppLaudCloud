//Thanks to http://woork.blogspot.com/2009/09/how-to-implement-perfect-multi-level.html 
//combined with the dropdown example from http://layout.jquery-dev.net/demos/simple.html
    
define(function(require, exports, module) {
    var preferences = require('preferences');
    var find = require('find');
    var save = require('save');
    var openFile = require('project_nav/openFile');
    var newProject = require('project_nav/newProject');
    var build = require('project_nav/build');
    var upload = require('project_nav/upload');
    var connection = require('project_nav/connection');
    
    $('#north-banner').live('click', function() {
        $('#north-banner').hide();
        $('body').layout().resizeAll();
    });
    
    $.post('/getBanner', function(s) {
        if (s && s !== '') {
            $('#north-banner').html(s);
            $('#north-banner').show();
            $('body').layout().resizeAll();
        }
    });
    
    function nav(){
        $("div#nav ul li").mouseover(function() {
            $(this).find('ul:first').show();
        });

        $("div#nav ul li").mouseleave(function() {
            $("div#nav ul li ul").hide();
        });

        $("div#nav ul li ul").mouseleave(function() {
            $("div#nav ul li ul").hide();
        });

    }
    
    getBaseUrl = function() {
        var url = document.URL;
        var index = url.lastIndexOf('/');
        return url.substring(0, index);
    };
    
    
    $(document).ready(function(){
        nav();

        $('.submenu').delegate('a', 'click', function(e) { 
            var url;
            $('.submenu').hide();   // hide after click
            var id = this.id;
            switch(id) {
            case "new_project":
                newProject.run();
                break;
            case "new_import_project":
                newProject.importProject();
                break;
            case "add_folder":
                $("#projects").jstree("create", null, "last", { "attr" : { "rel" : "folder" } });
                break;
            case "add_default":
                $("#projects").jstree("create", null, "last", { "attr" : { "rel" : "default" } });
                break;
            case "nav-upload":
                upload.run();
                break;
            case "nav-save":
                save.saveFile(env.editor.getSession());
                break;
            case "nav-save-as":
                save.saveAs();
                break;
            case "nav-save-all":
                save.saveAll();
                break;
            case "open": 
                var node = $.jstree._focused().get_selected();
                if ($(node).attr("rel") === 'default') {
                    openFile.run(node );
                } else {
                    var ref = $.jstree._reference(node);
                    if (!ref) {   // can happen on startup - nothing yet selected
                        alert('Select an element in the project view to open');
                    } else {
                        $.jstree._reference(node).open_node();
                    }
                }
                break;
//              case "search":
//              $("#projects").jstree("search", document.getElementById("text").value);
//              break;
//              case "text": break;
            case "refresh":
                var n2 = $.jstree._focused().get_selected();
                if (!n2) {
                    n2 = -1; // nothing selected - to full refresh
                } else {
                    if ($(n2).attr("rel") === 'default') { 
                        alert('Refresh is not yet supported for files. Please select a folder or project');
                        // TODO refresh files - reload them
                        break;
                    }
                }
                $("#projects").jstree('refresh', n2);
                break;
            case "nav-find":
                find.find();
                break;
                
            case "nav-build-basic":
                build.run('basic');
                break; 
                
            case "nav-build-weinre":
                build.run('weinre');
                break; 
                
            case "nav-build-release":
                build.run('release');
                break; 
                
            case "nav-emulate-ripple":
                build.ripple(this);
                break; 
                
            case "nav-debug-weinre":
                url = getBaseUrl() + "/weinre/client/#" + connection.getUser();
//                window.open("http://192.168.0.104:8080/client/#" + connection.getUser(), '_blank');
                window.open(url, '_blank');
                break; 
                
            case "nav-pref-editor":
                preferences.run();
                break; 
                
            case "nav-pref-logout":
                connection.post('logout');
                url = getBaseUrl() + "/login.html";
                window.open(url, '_self');
                break; 
                
//            case "nav-help":
//                url = getBaseUrl() + "/help.html";
//                window.open(url, '_blank');
//                break; 
                
//            case "nav-apks-test":
// //               $.get("/getApks", {}, function(list) {
//                $.ajax("http://192.168.0.104:8001/getApk", {cache : false}, function(list) {
//                    alert(list.success);
//                    alert(list.list);
//                    alert(list.list[0].appName);
//                    
//                });
//                break; 
            default:
                $("#projects").jstree(id);
            break;
            }
        });
    });
});