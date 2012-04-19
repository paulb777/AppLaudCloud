//getApks.js returns a list of available .apk files for download

var fs = require('fs');
var path = require('path');

var workspace = require('./workspace');

exports.getProjectApks = function(searches, projPath, projName, callback) {
    fs.readdir(projPath + '/bin', function(err, binFiles) {
        var res = [];
        var i;
        for (i = 0; i < searches.length; i++) {
            res[i] = new RegExp('-' + searches[i] + '.apk$');
        }
        var apks = [];
        if (!err) {  // bin folder exists
            var j, k;
            for (j = 0; j < binFiles.length; j++) {
                var binFile = binFiles[j];
                for (k = 0; k < res.length; k++) {
                    if (res[k].test(binFile)) {
                        var app = binFile.substring(0, binFile.length - searches[k].length - 5);
 //                       if (searches[k] !== 'basic' && searches[k] !== 'debug') app += '(' + searches[k] +')';
                        apks.push({ appName : app, link : '/' + projName + '/bin/' + binFile, weinre : searches[k] === 'weinre'});
                    }
                }
            }
        }
        callback(apks);   // done for directory
    });    
};

exports.apks = function(user, session, callback) {
    var base = user === 'demo' ? workspace.getDemoBase() : workspace.getBase(user);
    var data = [];
    var callbackCountdown = 0;
    
    var registerDone = function(apks) {
        if (apks) data = data.concat(apks); 
        callbackCountdown -= 1;
        if (callbackCountdown === 0) {
            if (data.length === 0) {
                callback({ success : false, error : 'No projects found.' });
            } else {
                callback({ success : true, user: user, session: session, list : data });
            }
        }
    };
    
    var getBinDir = function(projPath, projName) {
        if (fs.statSync(projPath).isDirectory()) {
            exports.getProjectApks(['basic', 'weinre', 'release'], projPath, projName, registerDone);
        } else {
            registerDone(); // for non-directories
        }
    };
    
    fs.readdir(base, function(err, files) {
        if (err) {
            console.log('getApks directory read error ' + base);
            throw err;
        }
        var i;
        callbackCountdown = files.length;
        if (callbackCountdown === 0) {
            callback({ success : false, error : 'No projects found.' });
        } else {
            for (i = 0; i < files.length; i++) {
                var f = files[i];
                var projPath = base + '/' + f;
                getBinDir(projPath, f);
            }
        }
    });
};

exports.projects = function(user, callback) {
    var base = user === 'demo' ? workspace.getDemoBase() : workspace.getBase(user);
    var data = [];
    var callbackCountdown = 0;
    
    var registerDone = function() {
        callbackCountdown -= 1;
        if (callbackCountdown === 0) {
            if (data.length === 0) {
                callback({ success : false, error : 'No projects found.' });
            } else {
                data.sort(function(a,b) {
                    return b.ctime - a.ctime;
                });
                callback({ success : true, list : data });
            }
        }
    };
    
    var checkForIndex = function(f) {
        var indexFile = f + '/assets/www/index.html';
        path.exists(base + '/' + indexFile, function(exists) {
            if (exists) {
                fs.stat(base + '/' + f, function(err, stats) {
                    if (!err) {
                        data.push({ project : f, ctime : stats.ctime.getTime() });
                        registerDone();
                    } else {
                        registerDone();
                    }  
                });
            } else {
                registerDone();
            };
        });
    };
    
    fs.readdir(base, function(err, files) {
        if (err) {
            console.log('getProjects directory read error ' + base);
            throw err;
        }
        var i;
        callbackCountdown = files.length;
        if (callbackCountdown === 0) {
            callback({ success : false, error : 'No projects found.' });
        } else {
            for (i = 0; i < files.length; i++) {
                checkForIndex(files[i]);
            }
        }
    });
};