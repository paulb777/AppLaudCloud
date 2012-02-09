define(function(require, exports, module) {
    var openFile = require("project_nav/openFile");
    var dialog = require("project_nav/dialog");
    var util = require("util");
    var jstContextMenu = require("project_nav/jstContextMenu");
    var connection = require("project_nav/connection");

    $(function () {
        $("#projects")
//      .bind("before.jstree", function (e, data) {
//      $("#alog").append(data.func + "<br />");
//      })
        .jstree({ 
            // List of active plugins
            "plugins" : [ 
                         "themes","json_data","ui","crrm","cookies","dnd","search","types","hotkeys","contextmenu", "sort" 
                         ],

                         // I usually configure the plugin that handles the data first
                         // This example uses JSON as it is most common
                         "json_data" : { 
                             // This tree is ajax enabled - as this is most common, and maybe a bit more complex
                             // All the options are almost the same as jQuery's AJAX (read the docs)
                             "ajax" : {
                                 // the URL to fetch the data
                                 "url" : "/jstree",
                                 "type" : "POST",
                                 // the `data` function is executed in the instance's scope
                                 // the parameter is the node being loaded 
                                 // (may be -1, 0, or undefined when loading the root nodes)
                                 "data" : function (n) { 
                                     // the result is fed to the AJAX request `data` option
                                     return { 
                                         "operation" : "get_children", 
                                         "title" : n.attr ? n.attr("title") : '',
                                         "user" : connection.getUser(),
                                         "session" : connection.getSession()
                                     }; 
                                 },
                                 "success" : function (r) { if (r[0] && r[0].newSession) connection.setSession(r[0].newSession); }
                             }
                         },
                         // Configuring the search plugin
//                       "search" : {
//                       // As this has been a common question - async search
//                       // Same as above - the `ajax` config option is actually jQuery's AJAX object
//                       "ajax" : {
//                       "url" : "./server.php",
//                       // You get the search string as a parameter
//                       "data" : function (str) {
//                       return { 
//                       "operation" : "search", 
//                       "search_str" : str 
//                       }; 
//                       }
//                       }
//                       },
                         // Using types - most of the time this is an overkill
                         // read the docs carefully to decide whether you need types
                         "types" : {
                             // I set both options to -2, as I do not need depth and children count checking
                             // Those two checks may slow jstree a lot, so use only when needed
                             "max_depth" : -2,
                             "max_children" : -2,
                             // I want only `project` nodes to be root nodes 
                             // This will prevent moving or creating any other type as a root node
                             "valid_children" : [ "project" ],
                             "types" : {
                                 // The default type
                                 "default" : {
                                     // I want this type to have no children (so only leaf nodes)
                                     // In my case - those are files
                                     "valid_children" : "none",
                                     // If we specify an icon for the default type it WILL OVERRIDE the theme icons
                                     "icon" : {
                                         "image" : "./icon/file.png"
                                     }
                                 },
                                 // The `folder` type
                                 "folder" : {
                                     // can have files and other folders inside of it, but NOT `project` nodes
                                     "valid_children" : [ "default", "folder" ],
                                     "icon" : {
                                         "image" : "./icon/folder.png"
                                     }
                                 },
                                 // The `project` nodes 
                                 "project" : {
                                     // can have files and folders inside, but NOT other `project` nodes
                                     "valid_children" : [ "default", "folder" ],
                                     "icon" : {
                                         "image" : "./icon/root.png"
                                     },
                                     // those prevent the functions with the same name to be used on `project` nodes
                                     // internally the `before` event is used
                                     "start_drag" : false,
                                     "move_node" : false,
                                     "rename" : false
                                 }
                             }
                         },
                         // UI & core - the nodes to initially select and open will be overwritten by the cookie plugin

                         // the UI plugin - it handles selecting/deselecting/hovering nodes
                         "ui" : {
                             // this makes the node with ID node_4 selected onload
 //                            "initially_select" : [ "node_4" ]
                         },
                         // the core plugin - not many options here
                         "core" : { 
                             // just open those two nodes up
                             // as this is an AJAX enabled tree, both will be downloaded from the server
 //                            "initially_open" : [ "node_2" , "node_3" ] 
                         },
                         "contextmenu" : {
                             select_node : true, // requires UI plugin
                             show_at_node : true,
                             items : function(node) { return jstContextMenu.build(node); }
                         }
        })
        .bind("create.jstree", function (e, data) {
            connection.post(
                    "/jstree", 
                    { 
                        "operation" : "create_node", 
                        "path" : data.rslt.parent.attr("title") + '/' + data.rslt.name, 
                        "type" : data.rslt.obj.attr("rel")
                    }, 
                    function (r) {
                        if(r.status) {
                            $(data.rslt.obj).attr("title", r.title);
                        }
                        else {
                            $.jstree.rollback(data.rlbk);
                            if (r.error) alert(r.error);
                        }
                    }
            );
        })
        .bind("remove.jstree", function (e, data) {
            var items;
            var obj = data.rslt.obj;
            var count = obj.length;
            if (count > 1) {
                items = count + ' resources'; 
            } else {
                items = obj[0].title;
            }
            
            dialog.make("Delete", "Are you sure you want to delete " + items + '?', function() {
                
                var unsaved = util.checkIfOpen(obj, true);
                if (unsaved) {
                    $.jstree.rollback(data.rlbk);
                    alert('Please save -' + unsaved + '- before doing this delete');
                    return;
                }
                
                data.rslt.obj.each(function () {
                    connection.ajax({
                        async : false,
                        type: 'POST',
                        url: "/jstree",
                        data : { 
                            "operation" : "remove_node", 
                            "path" : $(this).attr("title"),
                            "type" : $(this).attr("rel")
                        }, 
                        success : function (r) {
                            if(!r.status) {
                                alert('Delete failed : ' + r.error);
                                data.inst.refresh(data.inst._get_parent(obj)); 
                            }
                        }
                    });
                });
            }, function() {  // rollback when user cancels delete
                $.jstree.rollback(data.rlbk);
            });
        })
        .bind("rename.jstree", function (e, data) {
            var obj = data.rslt.obj;
            if (obj.attr("rel") === 'project') {
                $.jstree.rollback(data.rlbk);
                alert('Projects cannot be renamed');
                return;
            }
            var open = util.checkIfOpen(obj);
            if (open) {
                $.jstree.rollback(data.rlbk);
                alert('Please close -' + open + '- before doing this rename');
                return;
            }
            connection.post(
                "/jstree", 
                { 
                    "operation" : "rename_node", 
                    "path" : obj.attr("title"),
                    "title" : data.rslt.new_name
                }, 
                function (r) {
                    if (r.success) {
                        var node = data.rslt.obj;
                        node[0].title = r.newTitle;
                        if (obj.attr("rel") === 'folder') {
                            data.inst.refresh(node); // refresh directory so files have right path
                        } 
                    } else {
                        $.jstree.rollback(data.rlbk);
                        alert('Rename failed: ' + r.error);
                    }
                }
            );
        })
        .bind("move_node.jstree", function (e, data) {
            if (!data.rslt.cy) {
                var obj = data.rslt.o;
                var open = util.checkIfOpen(obj);
                if (open) {
                    $.jstree.rollback(data.rlbk);
                    alert('Cannot move open files. Please close the following: ' + open);
                    return;
                }
            }
            
            data.rslt.o.each(function (i) {
                connection.ajax({
                    async : false,
                    type: 'POST',
                    url: "/jstree",
                    data : { 
                        "operation" : "move_node", 
                        "path" : $(this).attr("title"), 
                        "ref" : data.rslt.cr === -1 ? '' : data.rslt.np.attr("title"), 
                        "title" : data.rslt.name,
                        "copy" : data.rslt.cy ? 1 : 0
                    },
                    success : function (r) {
                        if(!r.success) {
                            $.jstree.rollback(data.rlbk);
                            alert((data.rslt.cy ? 'copy' : 'move') + ' failed: ' + r.error);
                        }
                        else {
//                          PB - id not returned from node. need to do refresh to update BOTH
//                          copy's and move's because datatable needs paths updated
//                          $(data.rslt.oc).attr("id", "node_" + r.id);
//                          if(data.rslt.cy && $(data.rslt.oc).children("UL").length) {
//                          data.inst.refresh(data.inst._get_parent(data.rslt.oc));
                            // see http://www.jstree.com/documentation/core for definition of .oc and .o
                            data.inst.refresh(data.inst._get_parent(data.rslt.cy ? data.rslt.oc : data.rslt.o));
//                          }
                        }
                        //                   $("#analyze").click();
                    }
                });
            });
        })
        // Rest of the file is completely new code

        .bind("dblclick.jstree", function (e) {
            var node = $.jstree._focused().get_selected();
            if ($(node).attr("rel") === 'default') {
                openFile.run(node );
            } else {
                $.jstree._reference(node).toggle_node();
            }
        });
    });
});