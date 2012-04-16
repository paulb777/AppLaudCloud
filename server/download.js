// Download files from the workspace
// Directories are zipped and then downloaded

//Thanks to http://stackoverflow.com/questions/7288814/download-file-from-nodejs-server

var fs = require('fs');
var url = require('url');
var path = require('path');
var mime = require('mime');
var spawn = require('child_process').spawn;

var workspace = require('./workspace');

var doDownload = function(file, res) {
    var filename = path.basename(file);
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
//  res.setHeader('Content-type', 'application/vnd.android.package-archive');
    res.setHeader('Content-type', mime.lookup(file));
    var filestream = fs.createReadStream(file);
    filestream.on('data', function(chunk) {
        res.write(chunk);
    });
    res.statusCode = 200;   
    filestream.on('end', function() {
        res.end("");
        // This doesn't work to put output in the blank window opened by the client -- BECAUSE it goes into the file!!
        // res.end('Successful download of ' + file + ". Retrieve download from the broswer's download folder. Close this window\n");
    });  
};

var getZipfileName = function(f) {
    var j = 1;
    if (!path.existsSync(f + '.zip')) {   // TODO change to async
        console.log('getZipfileName ' + f);
        return f;
    } else {
        while (path.existsSync(f + '-' + j + '.zip')) j++;
        return f + '-' + j;
    }
};

var doZip = function(file, res, callback) {
    var dir = path.dirname(file);
    var zipfile = getZipfileName(file);
    var saveError = '';
    var saveStdOut = '';  
    var zip = spawn('zip', [ '-r', path.basename(zipfile), path.basename(file) ], { cwd : dir});  

    zip.stdout.on('data', function (data) {
        saveStdOut += data;
//        console.log('zip stdout: ' + data);
    });

    zip.stderr.on('data', function (data) {
        saveError += data; 
        console.log('zip stderr: ' + data);  
    });

    zip.on('exit', function (code) {
        if (!saveError) {
            callback(zipfile + '.zip', res);
        }
    }); 
};

exports.run = function(user, relFile, res){

    var file = workspace.getBase(user) + relFile;
//    console.log(file);

    fs.stat(file, function(err, stats) {

        if (!err) {           
            if (stats.isDirectory()) {
                doZip(file, res, doDownload);
            } else {
                doDownload(file, res);
            }
        } else {
            res.statusCode = 410;  // Gone
            res.setHeader('Content-disposition', 'attachment; filename=failed');
            res.end('\n');
        }
    });
};