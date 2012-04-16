// Unzip a zipfile.  Errors will be returned if any elements already exist

var fs = require('fs');
var zipfile = require('zipfile');
var path = require('path');

var write = require('./write');
var workspace = require('./workspace');

var count = 0;
var existArray = [];
var errorString = '';

exports.makePath = function(p) {
    if (!path.existsSync(path.dirname(p))) {
        exports.makePath(path.dirname(p));
    }
    fs.mkdirSync(p, 0755);
};

var doFile = function(base, dir, zf, file, writeData) {
    
    var finish = function() {
        count--;
        if (count === 0) {
            var data = {};
            data.error = errorString;
            data.exist = existArray;
            data.success = errorString === '' && existArray.length === 0;
            writeData(data);
        }
    };
        
    var relFileName = dir + '/' + file;
    var fullFileName = base + relFileName;
    
    var p = path.dirname(fullFileName);
    
            console.log(fullFileName + '--' + p);
    if (!path.existsSync(p)) {
        // first make sure containing directory exists
        // zipfiles from eclipse don't included directories
        // and can include deep files early
        exports.makePath(p);
    }
    
    if (path.existsSync(fullFileName)) { 
        existArray.push(relFileName);
        finish();
    } else if (file.charAt(file.length - 1) === '/') {
        fs.mkdirSync(fullFileName, 0755);   // sync so that subfiles don't get ahead
        finish();
    } else {
        var buffer = zf.readFileSync(file);
        write.doWrite(fullFileName, buffer, function(r) {
            if (!r.success) {
                errorString += relFileName + ': write failed';
            }
            finish();
        });
    }
};

exports.run = function(user, postValue, writeData) {
    var file = postValue.zipfile;
    var dir = file.substring(0, file.lastIndexOf('/'));
    var base = workspace.getBase(user);
    var zf = new zipfile.ZipFile(base + file);
    count = zf.count;
    existArray = [];
    errorString = '';
    var i;
    for (i = 0; i < zf.count; i++) {
        doFile(base, dir, zf, zf.names[i], writeData);
    }
};

    
//> zf
//{ names: [ 'world_merc.dbf', 'world_merc.prj', 'world_merc.shp', 'world_merc.shx' ],
//  count: 4 }
//> var buffer = zf.readFileSync('world_merc.prj')
//> buffer.toString()
