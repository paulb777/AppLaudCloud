//phonegapCreate creates a PhoneGap for Android project

//read this file bottom up

var fs = require("fs");
var path = require('path');

var androidCreate = require("./androidCreate");
var copymove = require("./copymove");
var workspace = require('./workspace');

exports.run = function(user, postValue, writeDataCallback) {

    var base = workspace.getBase(user);
    var successCount = 0; // Needs to be incremented to 11 for a successful project creation
    var errorLogged = false; // Just send first error back to client (all logged on console)
    var projectDir = null; // Project's path - returned from android project creator
    var jqm = postValue.jqm === 'true'; // include jQuery Mobile or not
    var template = postValue.template; // template to create project from
    var pgVersion = postValue.version;
    var pgVersionDir = __dirname + "/Resources/phonegap/" + pgVersion + "/"; // bundled PhoneGap version directory

    var log = function(str) {
        console.log(str);
        if (errorLogged === false) {  // Just send first failure back to client
            writeDataCallback({ success : 0, error : str.replace(new RegExp(base, 'g'),'') });
            errorLogged = true;
        }
    };

    var register = function() {
        if (++successCount === 11) {
            writeDataCallback({ success : 1});
        }
    };

    var updateJavaMain = function(filename) {
        fs.readFile(filename,'utf8', function(err, data) {
            if (err) {
                log("updateJavaMain: Error reading file: " + filename + ". Error: " + err);
                return;
            }

            // Import com.phonegap instead of Activity
            if (pgVersion === '1.4.1') {
                data = data.replace("import android.app.Activity;", "import com.phonegap.*;");
            } else {
                data = data.replace("import android.app.Activity;", "import org.apache.cordova.DroidGap;");
            }

            // Change superclass to DroidGap instead of Activity
            data = data.replace("extends Activity", "extends DroidGap");

            // Change to start with index.html
            data = data.replace('setContentView(R.layout.main);',
                    'if (getResources().getBoolean(R.bool.weinre)) {\n' +
                    '\t\t\tsuper.loadUrl("file:///android_asset/www/weinre_index.html");\n' +
                    '\t\t} else {\n' +
                    '\t\t\tsuper.loadUrl("file:///android_asset/www/index.html");\n' +
                    '\t\t}');

            fs.writeFile(filename, data, 'utf8', function(err) {
                if (err) {
                    log("updateJavaMain: Error writing file: " + filename + ". Error: " + err);
                    return;
                }
                register(); // #1 success
            });
        });
    };

    // Recursively search for java file. Assuming there is only one in the new
    // Android project

    var findJavaFile = function(dir) {
        fs.readdir(dir, function (err, filenames) {
            if (err) {
                log("findJavaFile: Error opening directory: " + dir + ". Error: " + err);
                return;
            }
            filenames.forEach(function (filename) {
                var fullname = dir + '/' + filename;
                fs.stat(fullname, function (err, stat) {
                    if (err) {
                        log( "findJavaFile: Error opening file: " + fullname + ". Error: " + err);
                        return;
                    }
                    if (stat.isDirectory()) {
                        findJavaFile(fullname);
                    } else if (/\.java$/.test(filename)) {
                        updateJavaMain(fullname);
                    }
                });
            });          
        });
    };

    var getPhonegapJar = function() {
        // Get phonegap.jar and the classpath
        var jarDir = pgVersionDir + "jar/";
        copymove.copy(user, [jarDir + "phonegap.jar", projectDir + '/libs/phonegap.jar'], function (data) {
            if (!data.success) {
                log( "getPhonegapJar: Error copying phonegap.jar to " + projectDir + " for PhoneGap project. " + data.error);
            } else {
                register(); // #2 success
            }
        }); 
        copymove.copy(user, [jarDir + "dot_classpath", projectDir + '/.classpath'], function (data) {
            if (!data.success) {
                log( "getPhonegapJar: Error copying .classpath to " + projectDir + " for PhoneGap project. " + data.error);
            } else {
                register(); // #3 success
            }
        }); 
    };

    var mkdirs = function(dirs, cb) {
        (function next(e) {
            (!e && dirs.length) ? fs.mkdir(dirs.shift(), 0755, next) : cb(e);
        })(null);
    };

    var getWWWSources = function() {
        var newDirs = [projectDir + "/assets", projectDir + "/assets/www/"];
        if (jqm) newDirs.push(projectDir + "/assets/www/jquery.mobile");
        mkdirs(newDirs, function(err) {
            if (err) {
                log( "getWWWSources: Error creating assets/www directory: " + err);
            } else {
                copymove.copy(user, ["-r", pgVersionDir + "js/.", projectDir + "/assets/www/"], function (data) {
                    if (!data.success) {
                        log( "getWWWSources: Error copying phonegap.js to " + projectDir + " for PhoneGap project. " + data.error);
                    } else {
                        register(); // #4 success
                    }
                }); 
                //var wwwSrc = __dirname + (jqm ? "/Resources/jqm/phonegapExample/." : "/Resources/phonegap/Sample/.");
                var wwwSrc = __dirname + "/Resources/Templates/" + template + '/www/.';
                copymove.copy(user, ["-r", wwwSrc, projectDir + "/assets/www/"], function (data) {
                    if (!data.success) {
                        log( "getWWWSources: Error populating www for PhoneGap project. " + data.error);
                    } else {
                        register(); // #5 success
                    }
                });

                if (jqm) {           
                    copymove.copy(user, ["-r", __dirname + "/Resources/jqm/jquery.mobile/.", projectDir + "/assets/www/jquery.mobile/"], function (data) {
                        if (!data.success) {
                            log( "getWWWSources: Error populating jquery.mobile for PhoneGap project. " + data.error);
                        } else {
                            register(); // #6 success
                        }
                    });
                } else {
                    register(); // #6 success (dummy to stay even with jqm case)
                }
            }   
        });
    };

    var getManifestScreensAndPermissions = function(manifest) {
        var startIndex;
        startIndex = manifest.indexOf("<supports-screens");
        if (startIndex === -1)
            startIndex = manifest.indexOf("<uses-permissions");
        if (startIndex === -1)
            return null;
        var index = startIndex;
        var lastIndex;
        do {
            lastIndex = index;
            index = manifest.indexOf("<uses-permission", lastIndex + 1);
            if (index < 0) {  // <uses-feature added in PhoneGap 1.0.0 manifest
                index = manifest.indexOf("<uses-feature", lastIndex + 1);
            }
        } while (index > 0);
        lastIndex = manifest.indexOf('<', lastIndex + 1);
        return manifest.substring(startIndex, lastIndex);
    };
    
    
    // Don't let PhoneGap override any longer
    // Instead, generate uses-sdk string based on user specified min Android version

    var getMinSdk = function(data) {
//        var startIndex = data.indexOf("<uses-sdk");
//        var endIndex = data.indexOf("<", startIndex + 1);
//        return data.substring(startIndex, endIndex);
        var target = postValue.target;
        var val = target.substring(target.lastIndexOf('-') + 1);
        return '\t<uses-sdk android:minSdkVersion="' + val + '" />\n';
    };

    var phonegapizeAndroidManifest = function() {
        // First get reference file. TODO - add GitHub and installation references

        fs.readFile(__dirname + "/Resources/phonegap/AndroidManifest.xml", 'utf8', function(err, templateData) {
            if (err) {
                log( "phonegapizeAndroidManifest: Error reading AndroidManifest.xml in: " + __dirname + ". Error: " + err);
                return;
            }
            var manifestInsert = getManifestScreensAndPermissions(templateData);
            var minSdk = getMinSdk(templateData);

            var newManifestFile = projectDir + "/AndroidManifest.xml";
            fs.readFile(newManifestFile, 'utf8', function(err, data) {
                if (err) {
                    log( "phonegapizeAndroidManifest: Error reading: " + newManifestFile + ". Error: " + err);
                    return;
                }

                // Add phonegap screens, permissions and turn on debuggable
                data = data.replace("<application android:", manifestInsert + "<application" + 
                    " android:debuggable=\"true\" android:");

                // Add android:configChanges="orientation|keyboardHidden" to the activity
                data = data.replace("<activity android:", "<activity android:configChanges=\"orientation|keyboardHidden\" android:");

                // Copy additional activities from source to destination - especially the DroidGap activity
                var activityIndex = templateData.indexOf("<activity");
                var secondActivityIndex = templateData.indexOf("<activity", activityIndex + 1);
                if (secondActivityIndex > 0) {
                    var endIndex = templateData.lastIndexOf("</activity>");
                    data = data.replace("</activity>", "</activity>\n\t\t" +
                            templateData.substring(secondActivityIndex, endIndex + 11));
                }

                data = data.replace("</manifest>", minSdk + "</manifest>");

                fs.writeFile(newManifestFile, data, 'utf8', function(err) {
                    if (err) {
                        log( "updateJavaMain: Error writing file: " + newManifestFile + ". Error: " + err);
                    } else {
                        register(); // #7 success
                    }
                });
            });
        });
    };

    var getResFiles = function() {    
        copymove.copy(user, [__dirname + "/Resources/phonegap/layout/main.xml", projectDir + '/res/layout/main.xml'], function (data) {
            if (!data.success) {
                log( "getResFiles: Error copying layout files to " + projectDir + " for PhoneGap project. " + data.error);
            } else {
                register(); // #8 success
            }
        });
        
        var weinre = '<?xml version="1.0" encoding="utf-8"?>\n' +
            '<resources>\n' +
            '\t<item format="boolean" type="bool" name="weinre">false</item>\n' +
            '</resources>\n';
        fs.writeFile(projectDir + '/res/values/weinre.xml', weinre, 'utf8', function(err) {
                if (err) {
                    log("getResFiles: Error creating weinre.xml. Error: " + err);
                    return;
                }
                register(); // #9 success
            });    

        mkdirs([projectDir + "/res/xml/"], function(err) {
            if (err) {
                log( "getResFiles: Error creating res/xml directory: " + err);
            } else {
                copymove.copy(user, ["-r", pgVersionDir + "xml/.", projectDir + '/res/xml/'], function (data) {
                    if (!data.success) {
                        log( "getResFiles: Error copying res/xml/* to " + projectDir + " for PhoneGap project. " + data.error);
                    } else {
                        register(); // #10 success
                    }
                });
        
                fs.readdir(projectDir + "/res", function (err, filenames) {
                    if (err) {
                        log( "getResFiles: Error opening directory: " + projectDir + ". Error: " + err);
                        return;
                    }
//                      SDK Tools 15 has the directories created
//                    var newDirs = [projectDir + "/res/drawable-hdpi", projectDir + "/res/drawable-mdpi", projectDir + "/res/drawable-ldpi"];
//                    mkdirs(newDirs, function() {  // OK if directories already exist (older SDKs)
                    
                    copymove.copy(user, [__dirname + "/Resources/phonegap/icons/appicon-ldpi.png", projectDir + "/res/drawable-ldpi/ic_launcher.png"], function (data) {
                        if (!data.success) {
                            log( "getResFiles: Error copying icon for PhoneGap project: " + projectDir + "/res/drawable-ldpi/appicon.png" + ": Error: " + data.error);
                            return;
                        }
                    });
                    copymove.copy(user, [__dirname + "/Resources/phonegap/icons/appicon-mdpi.png", projectDir + "/res/drawable-mdpi/ic_launcher.png"], function (data) {
                        if (!data.success) {
                            log( "getResFiles: Error copying icon for PhoneGap project: " + projectDir + "/res/drawable-mdpi/appicon.png" + ": Error: " + data.error);
                            return;
                        }
                    });
                    copymove.copy(user, [__dirname + "/Resources/phonegap/icons/appicon-hdpi.png", projectDir + "/res/drawable-hdpi/ic_launcher.png"], function (data) {
                        if (!data.success) {
                            log( "getResFiles: Error copying icon for PhoneGap project: " + projectDir + "/res/drawable-hdpi/appicon.png" + ": Error: " + data.error);
                            return;
                        }
                    });
                    register(); // #11 success
                });
            }
        });
    };

    var afterAndroid = function(r) {
//        console.log('after android ' + r.status + (r.error || ''));
        if (!r.status) {
            writeDataCallback({ status : 0, error : r.error });
        } else {
            projectDir = r.projectDir;
            findJavaFile(projectDir + '/src');  // First, find and update the Java Main file
            getPhonegapJar();
            getWWWSources();
            phonegapizeAndroidManifest();
            getResFiles();
        }
    }; 

    var project = postValue.project;
    var newName = base + '/' + project;
    path.exists(newName, function(exists) {
        if (exists) {
            writeDataCallback( { success : 0, error : 'Project ' + project + ' already exists'} );
        } else {
            androidCreate.run(user, postValue, afterAndroid);
        }
    });
};