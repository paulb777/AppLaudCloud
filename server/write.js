// write writes out a file

var fs = require('fs');
var path = require('path');
var workspace = require('./workspace');

exports.doWrite = function(outName, contents, callback) {
    fs.writeFile(outName, contents, 'utf8', function (err) {
        var data;
        if (err) {
            console.log('Write failed on ' + outName + '--' + err);
            data = { success : false };
        } else { 
            data = { success : true };
        }
        callback(data);
    });
};
    
exports.run = function(user, postValue, callback) {
    var outName = workspace.getBase(user) + '/' + postValue.filename;
    var contents = postValue.contents;
    if (postValue.saveas === 'true') {      
        // make sure the file doesn't exist
        path.exists(outName, function(exists) {
            if (exists) {
                callback( { success : false, ret : 'overwrite'} );
            } else { 
              exports.doWrite(outName, contents, callback);
            }
        });
    } else { 
        exports.doWrite(outName, contents, callback);
    }
};
    
