// createNode removes a file or directory for jstree

var fs = require('fs');
var workspace = require('./workspace');
var rimraf = require('./rimraf');

var removeReturn = function(err, callback) {
    var data = { status : !err };
    if (err) data.error = err.toString().replace(new RegExp(base, 'g'), '');
    callback(data);
};

exports.run = function(user, postValue, callback) {

    var p = postValue.path ;  // path from base to name
    var base = workspace.getBase(user);
    var rmName = base + p;
    
    var isFile = postValue.type === "default" || postValue.type === 'file';
    if (isFile) {
        fs.unlink(rmName, function(err) {
            removeReturn(err, callback);
        });
    } else {
        rimraf(rmName, function(err) {
            removeReturn(err, callback);
        });
    }
};
