//androidCreate creates an Android project

var workspace = require('./workspace');
var spawn = require('child_process').spawn;

exports.run = function(user, postValue, callback) {
    var project = postValue.project;
    var pkg = postValue.pkg;
    var base = workspace.getBase(user);
    var path = base + '/' + project;
    var saveError = '';
    
    /**
     * android project creation example 
     * android create project --target android-8 --name test1 --path ~/android-command-line/test1dir 
     * --activity myactivity --package com.mds.test1
     * 
     * See http://developer.android.com/guide/developing/projects/projects-cmdline.html for android create
     * project spec
     */
    
    var command = 'android';
    var args = [ "create", "project", 
                "--target", 'android-15', // always use latest SDK, minSDK is used to support earlier versions
                "--path", path, 
                "--activity", project, 
                "--package", pkg];

    var android = spawn(command, args); 
    
    android.stdout.on('data', function (data) {
//      console.log('stdout: ' + data);
    });
    
    android.stderr.on('data', function (data) {
        saveError += data; 
        console.log('stderr: ' + data);  
    });

    android.on('exit', function (code) {
        if (code) console.log('android process exited with code ' + code);
        var data = { projectDir : path, status : !code, error : saveError.replace(new RegExp(base, 'g'),'') };  // hide base from user
        callback(data);
    }); 
};
