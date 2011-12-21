define(function(require, exports, module) {

    var contents = require('contents');
    var tabs = require('project_nav/tabs');
    var connection = require('project_nav/connection');

    exports.path = function(file) {
        if (tabs.selectIfOpen(file)) return;
        connection.post("/read", {filename: file}, function(r) {
            contents.put(file, r.contents);
            $("body").layout().resizeAll();  // probably only needed the first open
        });
    };
    exports.run = function(node) {
        exports.path($(node).attr("title"));
    };
});