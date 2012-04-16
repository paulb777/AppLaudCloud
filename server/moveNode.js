//moveNode moves or copies files or directories for jstree

var fs = require('fs');
var workspace = require('./workspace');
var copymove = require('./copymove');

exports.run = function(user, postValue, callback) {

    var p = postValue.path;               // path from base to name
    var base = workspace.getBase(user);
    var fromName = base + p;
    var toP = postValue.ref;  // destination directory
    var toName = base + toP;
    var command, options; 

    if (postValue.copy === '1') {
        command = 'cp';
        options = ['-r', fromName, toName];
    } else {
        command = 'mv';
        options = [ fromName, toName];
    }
    
    copymove.run(user, command, options, callback);  
};
