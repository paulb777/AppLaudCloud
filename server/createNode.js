// createNode creates a file or directory for jstree

var fs = require('fs');
var path = require('path');
var workspace = require('./workspace');

var createSuccess = function(path, callback) {
    var data = { status : 1,
                title : path};
    callback(data);
};

var createDuplicate = function(path, callback) {
    var data = { status : 0,
                 error : 'File ' + path + ' already exists'};
    callback(data);
};

exports.run = function(user, postValue, callback) {
    var p = postValue.path;  // path from base to name
    var newName = workspace.getBase(user) + p;
    
    path.exists(newName, function(exists) {
        if (exists) {
            createDuplicate(p, callback);
        } else { 
            var isFile = postValue.type === "default";
            if (isFile) {
                fs.writeFile(newName, "", 'utf8', function(err) {
                    if (err) throw err;
                    createSuccess(p, callback);
                });
            } else {
                fs.mkdir(newName, 0755,  function(err) {
                    if (err) throw err;
                    createSuccess(p, callback);
                });
            }
        }
    });
};
