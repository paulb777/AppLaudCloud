// getChildren loads the contents of a directory for jstree

var fs = require('fs');
var workspace = require('./workspace');

exports.run = function(user, postValue, callback) {
    
    var path = postValue.title;
    var isProject = path === '';

    var relValue = "project";
    var stateValue = "closed";

    var directory = workspace.getBase(user) + path;
    fs.readdir(directory, function(err, files) {
        if (err) {
            console.log('getChildren error ' + directory);
            throw err;
        }
        var data = [];
        var i;
        for (i = 0; i < files.length; i++) {
            var f = files[i];
            var relFile = path + '/' + f;
            var isFile = fs.statSync(directory + '/' + f).isFile();
            if (isProject) {
                if (isFile) continue;
            } else {
                if (isFile) {
                    relValue = "default";
                    stateValue = "";
                } else { // is folder
                    relValue = "folder";
                    stateValue = fs.readdirSync(directory + '/' + f).length > 0 ? "closed" : "";
                }
            }
 //           var fileId = fileTable.add(relFile);
            data.push({"data" : f, 
                "attr" : { "title" : relFile, "rel" : relValue },
                "state" : stateValue
            });
        }
        callback(data);  // to write data
    });
};