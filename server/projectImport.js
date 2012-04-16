//projectImport creates an Android project from a zipfile

var fs = require("fs");
var path = require('path');
var zipfile = require('zipfile');
var workspace = require('./workspace');
var write = require('./write');
var copymove = require('./copymove');
var unzip = require('./unzip');

exports.run = function(user, postValue, writeData) {
    var count = 0;
    var errorString = '';
    var base = workspace.getBase(user);
    var project = postValue.project;
    var zipFile = postValue.zipFile;
    var newName = base + '/' + project;
    console.log('Project Import ' + user + '--' + project + '--' + zipFile + '--' + new Date());
    
    var postUnzipTweaks = function() {
        var doWeinre = function() {
            var weinre = '<?xml version="1.0" encoding="utf-8"?>\n' +
                    '<resources>\n' +
                    '\t<item format="boolean" type="bool" name="weinre">false</item>\n' +
                    '</resources>\n';
            fs.writeFile(newName + '/res/values/weinre.xml', weinre, 'utf8', function(err) {
                if (err) {
                    console.log("getResFiles: Error creating weinre.xml. Error: " + err);
                    return;
                }
            });  
        };

        var updateJavaForWeinre = function(dir) {
            fs.readdir(dir, function (err, filenames) {
                if (err) {
                    console.log("updateJavaForWeinre: Error opening directory: " + dir + ". Error: " + err);
                    return;
                }
                filenames.forEach(function (filename) {
                    var fullname = dir + '/' + filename;
                    fs.stat(fullname, function (err, stat) {
                        if (err) {
                            console.log( "updateJavaForWeinre: Error opening file: " + fullname + ". Error: " + err);
                            return;
                        }
                        if (stat.isDirectory()) {
                            updateJavaForWeinre(fullname);
                        } else if (/\.java$/.test(filename)) {
                            fs.readFile(fullname,'utf8', function(err, data) {
                                if (err) {
                                    console.log("updateJavaForWeinre: Error reading file: " + fullname + ". Error: " + err);
                                    return;
                                }
                                data = data.replace('super.loadUrl("file:///android_asset/www/index.html");',
                                        'if (getResources().getBoolean(R.bool.weinre)) {\n' +
                                        '\t\t\tsuper.loadUrl("file:///android_asset/www/weinre_index.html");\n' +
                                        '\t\t} else {\n' +
                                        '\t\t\tsuper.loadUrl("file:///android_asset/www/index.html");\n' +
                                    '\t\t}');
    
                                fs.writeFile(fullname, data, 'utf8', function(err) {
                                    if (err) {
                                        console.log("updateJavaForWeinre: Error writing file: " + fullname + ". Error: " + err);
                                        return;
                                    }
                                });
                            });
                        }
                    });
                });
            });
        };
    
        doWeinre();
        updateJavaForWeinre(newName + '/src');
        
        fs.mkdir(newName + '/libs', 0755, function() {
            copymove.copy(user, [__dirname + "/Resources/phonegap/jar/phonegap.jar", newName + '/libs/phonegap.jar'], function (data) {
                if (!data.success) {
                    console.log( "getPhonegapJar: Error copying phonegap.jar to " + newName + " for PhoneGap project. " + data.error);
                }
            }); 
        });
        
        copymove.copy(user, ["-r", __dirname + "/Resources/import/.", newName + "/"], function (data) {
            if (!data.success) {
                console.log( "getWWWSources: Error copying Resources/import to " + newName + " for PhoneGap project. " + data.error);
            } else {
                var buildXml = newName + '/build.xml';
                fs.readFile(buildXml,'utf8', function(err, data) {
                    if (err) {
                        console.log("updateJavaForWeinre: Error reading file: " + buildXml + ". Error: " + err);
                        return;
                    }
                    data = data.replace('{PROJNAME}', project);
                    fs.writeFile(buildXml, data, 'utf8', function(err) {
                        if (err) {
                            console.log("updateJavaForWeinre: Error writing file: " + buildXml + ". Error: " + err);
                            return;
                        }
                    });
                });                
            }
        }); 
    };
  
    var doFile = function(oldDir, dir, zf, file) {
        
        var finish = function() {
            count--;
            if (count === 0) {
                fs.unlink(zipFile, function(err) {  // remove temp zipfile
                    if (err) console.log('projectImport :' + err);
                });

                var data = {};
                data.error = errorString;
                data.success = errorString === '';
                if (data.success) {
                    postUnzipTweaks(); // accept failures on these for now
                }
                writeData(data);
            }
        };
        
 //       console.log('file ' + file + '--' + oldDir +'--' + dir);
        var outFile = file.replace(oldDir, dir + '/');
        var fullFileName = base + '/' + outFile; 
        
        var p = path.dirname(fullFileName);
        if (!path.existsSync(p)) {
            // first make sure containing directory exists
            // zipfiles from eclipse don't included directories
            // and can include deep files early
            unzip.makePath(p);
        }
    
//        console.log('unzip ' + fullFileName);
        if (file.charAt(file.length - 1) === '/') {
            fs.mkdirSync(fullFileName, 0755);   // sync so that subfiles don't get ahead
            finish();
        } else {
            var buffer = zf.readFileSync(file);
            if (oldDir + '.classpath' === file) {   // old phonegap.jar may be absolute path, 
                    // but .classpath is not required for the build so this code is kind of optional
                 var str = buffer.toString('utf8');
                 str = str.replace('</classpath>', '\t<classpathentry kind="lib" path="libs/phonegap.jar"/>\n</classpath>');
                 buffer = new Buffer(str);
            }
            write.doWrite(fullFileName, buffer, function(r) {
                if (!r.success) {
                    errorString += outFile + ': write failed';
                }
                finish();
            });
        }
    };
    
    var earlyError = function(data) {
        writeData(data);
        fs.unlink(zipFile, function(err) {  // remove temp zipfile
            if (err) console.log('projectImport: ' + newName + '--' + zipFile + '--' + err); 
        });
    };
    
    path.exists(newName, function(exists) {
        if (exists) {
            earlyError( { success : 0, error : 'Project ' + project + ' already exists'} );
        } else {
            try {
                var zf = new zipfile.ZipFile(zipFile);
            } catch (e) {
                // if user moved a non zip formatted file to .zip
                earlyError( { success : 0, error : e.message + " Make sure the specified zip file is valid zipfile format." } );  
                console.log(JSON.stringify(e) + new Date());
                return;
            };
            count = zf.count;
            errorString = '';
            var i;
            var oldProject = zf.names[0];
            oldProject = oldProject.substring(0, oldProject.indexOf('/') + 1);
            
            // Check for valid project.  For now, just make sure AndroidManifest.xml is there
            var foundManifest = false;
            for (i = 0; i < zf.count; i++) {
                if (oldProject + 'AndroidManifest.xml' === zf.names[i]) {
                    foundManifest = true;
                    break;
                }
            }
            if (!foundManifest) {
                earlyError( { success : 0, error : 'Invalid zipfile. Missing ' + oldProject + 'AndroidManifest.xml'} );
            } else {
                for (i = 0; i < zf.count; i++) {
                    doFile(oldProject, project, zf, zf.names[i]);
                }
            }
        }
    });
};