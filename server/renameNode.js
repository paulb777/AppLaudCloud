// renameNode renames a file or directory for jstree

var fs = require('fs');
var path = require('path');
var workspace = require('./workspace');

exports.run = function(user, postValue, callback) {

    var p = postValue.path ;  // path from base to name
    var base = workspace.getBase(user);
    var oldName = base + p;
    var newP = p.substring(0, p.lastIndexOf("/") + 1) + postValue.title;
    var newName = base + newP;
    
    path.exists(newName, function(exists) {
        if (exists) {
            var data = { success : 0,
                        error : 'File ' + newP + ' already exists'};
            callback(data);
        } else {
//            console.log('oldName:' + oldName);
            fs.rename(oldName, newName, function(err) {
                var data = { success : !err, newTitle : newP, error : err ? err.toString() : null };
                callback(data);
            });
        }
    });
};
