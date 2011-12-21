define(function(require, exports, module) {
    var unzip = require("project_nav/unzip");
//    var connection = require("project_nav/connection");

    exports.build = function(node) {
        var isProject = node.attr("rel") === 'project';
        var isFile = node.attr("rel") === 'default';

        var ret = {};
        if (!isFile) {
            ret.create = {
                    "separator_before"  : false,
                    "separator_after"   : false,
                    "label"             : "New File",
                    "action"            : function (obj) { this.create(obj); }
            };
            ret.createFolder = {
                    "separator_before"  : false,
                    "separator_after"   : true,
                    "label"             : "New Folder",
                    "action"            : function (obj) { this.create(obj, "last", { "attr" : { "rel" : "folder" } }); }
            };
        }
        if (!isProject) {
            ret.rename = {
                    "separator_before"  : false,
                    "separator_after"   : false,
                    "label"             : "Rename",
                    "action"            : function (obj) { this.rename(obj); }
            };
        }
        ret.remove = {
                "separator_before"  : false,
                "icon"              : false,
                "separator_after"   : true,
                "label"             : "Delete",
                "action"            : function (obj) { if(this.is_selected(obj)) { this.remove(); } else { this.remove(obj); } }
        };
        if  (!isProject) {
            ret.cut = {
                    "separator_before"  : true,
                    "separator_after"   : false,
                    "label"             : "Cut",
                    "action"            : function (obj) { this.cut(obj); }
            };
            ret.copy = {
                    "separator_before"  : false,
                    "icon"              : false,
                    "separator_after"   : false,
                    "label"             : "Copy",
                    "action"            : function (obj) { this.copy(obj); }
            };
        }
        if (!isFile) {
            ret.paste = {
                    "separator_before"  : false,
                    "icon"              : false,
                    "separator_after"   : false,
                    "label"             : "Paste",
                    "action"            : function (obj) { this.paste(obj); }
            };
        }
        if (isFile && /.zip$/.test(node.attr("title"))) {
            ret.unzip = {
                    "separator_before"  : false,
                    "icon"              : false,
                    "separator_after"   : false,
                    "label"             : "Unzip",
                    "action"            : function (obj) { unzip.run(node.attr("title"), obj); }
            };
        }
        ret.download = {
                "separator_before"  : false,
                "icon"              : false,
                "separator_after"   : false,
                "label"             : "Download     ",
                "action"            : function (obj) {  var w = window;   // right window context after ajax callback
                                   //     connection.post('/setSession', null, function () {    // causes pop up
                                        w.open('/download?' +  node.attr("title"));   
                                        w.opener.focus(); 
                                   //     });
                }
        };

        return ret;
    };
});