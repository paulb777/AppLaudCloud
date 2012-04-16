// Use node_formidable to upload files. Then rename from tmp directory to user's 
// specified directory

var fs = require('fs');
var path = require('path');
var formidable = require('formidable');
var sys = require('sys');
var util = require('util');

var workspace = require('./workspace');

var renameFiles = function(user, p, files, res) {
    var count;
    var log = '';
    
    var finish = function(err) {
        if (err) log += err;
        count--;
        if (count === 0) {
            if (log === '') log = 'Upload succeeded to ' + p;
            res.writeHead(200, {'content-type': 'text/plain'});  // text/json doesn't work here
            res.write('START' + log + 'END');
            res.end('\n');
        }
    };
    
    // Thanks to http://stackoverflow.com/questions/4568689/move-file-to-a-different-partition-using-node-js
    var partitionRename = function(fromFile, toFile, callback) {
        console.log(fromFile + '--' + toFile);
        var is = fs.createReadStream(fromFile);
        var os = fs.createWriteStream(toFile);
        
        util.pump(is, os, function(err) {
            fs.unlinkSync(fromFile);
            callback(err);
        });
    };
    
    var fullPath = workspace.getBase(user) + p;
    count = 0;
    var i;
    for (i in files) count++;
    for (i in files) {
        var newFile = fullPath + '/' + i;
        var logFile = p + '/' + i;
        if (path.existsSync(newFile)) {   // TODO change to async
            var j = 1;
            while (path.existsSync(newFile + '-' + j)) j++;
            log += logFile + ' already exists. Uploading to ' + logFile + '-' + j + ' instead. ';
            newFile = newFile + '-' + j;
        }
        partitionRename(files[i].path, newFile, finish); 
    }
};

exports.run = function(user, p, req, res) {
    // do a multiple file upload and put in directory p
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
//        console.log(JSON.stringify(files));
        renameFiles(user, p, files, res);
    });
};

exports.one = function(req, res) {
    // do a single file upload and put return temp file
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
//        console.log(JSON.stringify(files));
        var path = '';
        for (var i in files) {
//            console.log(i + '--' + files[i].path);
            path = files[i].path;
        }
        res.writeHead(200, {'content-type': 'text/plain'});  // text/json doesn't work here
        res.write('START' + path + 'END');
        res.end('\n');
    });
};
        
