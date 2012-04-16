//build.js builds an Android project

var fs = require("fs");
var spawn = require('child_process').spawn;

var copymove = require('./copymove');
var getApks = require('./getWorkspace');
var workspace = require('./workspace');
var myUrl = require('./myUrl');
var inProgress = {};

// Need to check the build separately from running it since client will
// send a duplicate request after two minutes

exports.check = function(user, postValue, callback) {
    var base = workspace.getBase(user);
    var projectDir = base + postValue.project;
//    console.log('check build ' + projectDir + ' ' + new Date());
    if (!inProgress[projectDir]) {
        callback(  { success :false , error : 'Server error - lost track of build'});
        console.log('checkBuild:lost track ' + user + ' projectDir ' + projectDir);
    } else if (inProgress[projectDir] === true) {
        callback(  { inProgress : true});
    } else {
        callback(inProgress[projectDir]);
        delete inProgress[projectDir];
    }
};

//exports.check = function(user, postValue, callback) {
//    var base = workspace.getBase(user);
//    var projectDir = base + postValue.project;
//    
//    var doCheck = function() {  
//        if (timeoutId[projectDir]) {
//            clearTimeout(timeoutId[projectDir]); // clear any lingering timeouts
//            delete timeoutId[projectDir];
//        }
//        console.log('checking to build ' + projectDir + new Date());
//        if (!inProgress[projectDir]) {
//            callback(  { success :false , error : 'Server error - lost track of build'});
//            console.log('checkBuild:lost track ' + user + ' projectDir ' + projectDir);
//        } else if (inProgress[projectDir] === true) {
//            timeoutId[projectDir] = setTimeout(doCheck, 5000);
//        } else {
//            callback(inProgress[projectDir]);
//            delete inProgress[projectDir];
//        }
//    }
//    doCheck();
//};

exports.run = function(user, postValue, callback) {
    var base = workspace.getBase(user);
    var projectDir = base + postValue.project;
        
    var exit = function(msg) {
        inProgress[projectDir] = msg;  // hold until polling
    };
    
    if (inProgress[projectDir] === true) {
        console.log('2 builds ' + user + '--' + projectDir);
        callback( { success : false, error : 'Only one project build can occur at a time. The first build will continue' });
        return;
    }
    
    inProgress[projectDir] = true;
    
    var kind = postValue.kind;   // basic, weinre, or release 
    var saveAntProperties = '';
    
    console.log('starting build ' + kind + ' ' + projectDir + new Date());

    var makeWeinreIndexHtml = function(ant) {
        var weinreFull = projectDir + "/assets/www/weinre_index.html";
        var weinreRel = postValue.project + "/assets/www/weinre_index.html";
        
        copymove.copy(user, [projectDir + "/assets/www/index.html", weinreFull], function (r) {
            if (!r.success) {
                var msg = { success : false, error : 'Failed to find ' + postValue.project + '/assets/www/index.html' };
                exit(msg);
            } else {
                fs.readFile(weinreFull,'utf8', function(err, data) {
                    if (err) {
                        console.log("Failed to read" + weinreRel);
                        var msg = { success : false, error : 'Failed to read ' + weinreRel.replace(new RegExp(base, 'g'),'') };
                        exit(msg);
                    } else {      
                        // Add weinre script - TODO right link and plugin username
                        data = data.replace("</head>", 
                            '\t<script src="' + myUrl.getUrl() + ':' + myUrl.getPort() + '/weinre/target/target-script-min.js#' + user +
                            '"></script>\n\t</head>');
        
                        // Add comment to top
                        data = "<!-- DO NOT EDIT!!!  This file is automatically created when Build->Debug is selected. -->\n\n" + data;
    
                        fs.writeFile(weinreFull, data, 'utf8', function(err) {
                            if (err) {
                                var msg = { success : false, error : 'Failed to write ' + weinreRel.replace(new RegExp(base, 'g'),'')  };
                                exit(msg);
                            } else {  
                                // Success - now we can go ahead with the build
                                ant();
                            }
                        });
                    }
                });
            }
        });
    };
    
    var processSuccess = function() {
        getApks.getProjectApks(['debug'], projectDir, postValue.project, function(r) {
            if (r && r[0] && r[0].appName) {
                var prefix = projectDir + '/bin/' + r[0].appName;
                copymove.move(user, [prefix + '-debug.apk', prefix + '-' + kind + '.apk'], function(r) {
                    if (!r.success) console.log('build: apk file move failed : ' + projectDir);
                });
            } else {
                console.log('build.js processSuccess: getApks failed for ' + projectDir);
            }
        });
    };
    
    var restoreAntProperties = function() {
        // delete temp file keystore and restore ant.properties to original
        fs.unlink(postValue.keyStore, function(err) {
            if (err) console.log('restoreAntProperties: failed to delete keystore: ' + err);
        });

        fs.writeFile(projectDir + "/ant.properties", saveAntProperties, 'utf8', function(err) {
            if (err) {
                if (err) console.log('restoreAntProperties: failed to restore ant.properties: ' + err);
            } 
        });
    };
    
    var doAnt = function() {     
        var saveError = '';
        var saveStdOut = '';  
        var options = kind === 'release' ? kind : 'debug';
        var ant = spawn('ant', [ options ], { cwd : projectDir });  

        ant.stdout.on('data', function (data) {
            saveStdOut += data;
            saveError += data;
//            console.log('stdout: ' + data);
        });
    
        ant.stderr.on('data', function (data) {
            saveError += data; 
            console.log('stderr: ' + data);  
        });
    
        ant.on('exit', function (code) {
            var success, error;
            var index = saveStdOut.indexOf('BUILD SUCCESSFUL');
            if (index === -1) {
                success = false;
                error = saveError;
            } else {
                if (kind !== 'release') {
                    processSuccess();
                }
                success = true;
                error = '';
                console.log('build success ' + projectDir + ' ' + new Date());
            }
            if (kind === 'release') {
                restoreAntProperties();
            }
            var data = { success : success, error : error.replace(new RegExp(base, 'g'),'') };  // hide base from user
            exit(data);
        }); 
    };
    
    var updateWeinreXml = function(next) {
        var isWeinre = kind === 'weinre';
        var oldVal, newVal;
        if (postValue.kind === 'weinre') {
            oldVal = 'false';
            newVal = 'true';
        } else {
            oldVal = 'true';
            newVal = 'false';
        }
        var file = projectDir + "/res/values/weinre.xml";
        
        fs.readFile(file,'utf8', function(err, data) {
            if (err) {   // silently continue if not a weinre build
                if (isWeinre) {
                    console.log("Failed to read" + file);
                    var msg = { success : false, error : 'Failed to read ' + file.replace(new RegExp(base, 'g'),'') };
                    exit(msg);
                } else {
                    next();
                }
            } else {      
                data = data.replace(oldVal, newVal); 
                fs.writeFile(file, data, 'utf8', function(err) {
                    if (err && isWeinre) {
                        var msg = { success : false, error : 'Failed to write ' + file.replace(new RegExp(base, 'g'),'') };
                        exit(msg);
                    } else {  
                        next();
                    }
                });
            }
        });
    };
    
    var setupReleaseBuild = function(next) {
        var antProperties = projectDir + "/ant.properties";
        fs.readFile(antProperties,'utf8', function(err, data) {
            if (err) {
                data = ''; // ant.properties doesn't exist
            }
            saveAntProperties = data;  // OK because next line does conversion from buffer to string
            data += '\nkey.store=' + postValue.keyStore;
            data += '\nkey.alias=' + postValue.keyAlias;
            data += '\nkey.store.password=' + postValue.keyStorePassword;
            data += '\nkey.alias.password=' + postValue.keyAliasPassword + '\n';
            fs.writeFile(antProperties, data, 'utf8', function(err) {
                if (err) {
                    var msg = { success : false, error : 'Failed to write ant.properties'};
                    exit(msg);
                } else {  
                    next();
                }
            });
        });
    };

    var continueRun = function() {
        if (kind === 'weinre') {
            makeWeinreIndexHtml(doAnt);
        } else if (kind === 'release') {
            setupReleaseBuild(doAnt);
        } else {
            doAnt();
        }
    };
    
    updateWeinreXml(continueRun);  
    callback({});
};