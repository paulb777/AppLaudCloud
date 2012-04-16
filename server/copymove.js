//invoke spawn for a copy or move
//or any command without stdout

var spawn = require('child_process').spawn;
var workspace = require('./workspace');

exports.run = function(user, command, options, callback) {
    var base = workspace.getBase(user);
    var saveError = '';
    
    // Code sample adapted from http://nodejs.org/docs/v0.4.10/api/child_processes.html

    var cp = spawn(command, options);

    cp.stderr.on('data', function (data) {
        saveError += data; 
        console.log('stderr: ' + command + options + '\n' + data);
    });

    cp.on('exit', function (code) {
        if (code) console.log('cp child process exited with code ' + code);
        var data = { success : !code, error : saveError.replace(new RegExp(base, 'g'),'') };  // hide base from user
        callback(data);
    });    
};

exports.copy = function(user, options, callback) {
    exports.run(user, 'cp', options, callback);
};

exports.move = function(user, options, callback) {
    exports.run(user, 'mv', options, callback);
};
