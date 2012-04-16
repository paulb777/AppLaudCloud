// Manage the workspace location
var fs = require('fs');

var workspaceRoot = "/Users/paulb/aw5/";
//var workspaceRoot = "./applaud-workspace/";

exports.initWorkspace = function(u) {   // TODO make async
    fs.mkdirSync(workspaceRoot + u, 0755);
};

exports.getBase = function(user) {
    return workspaceRoot + user ;
};

exports.getDemoBase = function() {
    return workspaceRoot + 'demo' ;
};

exports.getRoot = function() {
    return workspaceRoot;
};
