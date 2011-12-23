#!/usr/bin/env node

/* used Ace's Makefile.dryice.js as a template along with docs 
 * at https://github.com/mozilla/dryice
 */

/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * ***** END LICENSE BLOCK ***** */

var fs = require("fs");

var args = process.argv;
var target = null;
var targetDir = "applaud";
if (args.length == 3) {
    target = args[2];
    // Check if 'target' contains some allowed value.
    if (target != "normal") {
        target = "normal";   // only normal now
    }
}

try {
    var version = JSON.parse(fs.readFileSync(__dirname + "/package.json")).version;
    var ref = fs.readFileSync(__dirname + "/.git-ref").toString();
} catch(e) {
    ref = "";
    version = "";
}

console.log("using targetDir '", targetDir, "'");

var copy = require('dryice').copy;

var home = __dirname;

console.log('# applaud ---------');

var applaudProject = {
        roots: [
 //                     home + '/client/ace/support/pilot/lib',
                      home + '/client/ace/lib',
 //                     home + '/client/ace',
                      home + '/client/edit',
                      home + '/client'
                      ],
        textPluginPattern: /^ace\/requirejs\/text!/
};

function filterTextPlugin(text) {
    return text.replace(/(['"])ace\/requirejs\/text\!/g, "$1text!");
}

console.log('# jquery ---------');

var jquery = copy.createDataObject();
copy({
    source: [ 'client/jquery/jquery-1.7.1.min.js', 
              'client/jquery/jquery-ui-1.8.16.custom.min.js',
              "client/jquery/jquery.layout-29.15.min.js",
              "client/jquery/ui.tabs.closable.min.js",
              "client/jquery/jquery.scrollTo-min.js"
              ],
     dest: jquery
});

copy({
    source: [ "client/jquery/jquery.jstree.js",
              "client/jquery/jquery.hotkeys.js",
              "client/jquery/jquery.cookie.js",
              "client/jquery/jquery.form.js",
              "client/jquery/jquery.contextMenu.js"],
     filter: [ copy.filter.uglifyjs ],
     dest: jquery
});


copy({
    source: jquery,
    dest: 'build/client/jquery-all.js'
});

copy({
    source: [ // "client/css/applaudweb.css",
              "client/css/navbar.css",
//              "client/jquery/themes/ui-lightness/jquery-ui-1.8.14.custom.css",  // images mess up if not hard-coded
              "client/jquery/layout-29.15.css",
              "client/jquery/jquery.contextMenu.css",
              "client/css/styles.css", 
//              "jquery/themes/default/style.css"   // hardcoded for jstree
              ],
//    filter: [ copy.filter.addDefines ],  - only works if require already there
    dest: "build/client/jquery-rest.css"
});



function filterHtml(data) {
    return (data
            .replace("DEVELJQ-->", "")
            .replace("<!--DEVELJQ", "")
            .replace("<!--PACKAGEJQ-->", "")
            .replace("<!--PACKAGEJQ", "")
        .replace("DEVEL-->", "")
        .replace("<!--DEVEL", "")
        .replace("<!--PACKAGE-->", "")
        .replace("<!--PACKAGE", "")
             .replace("<!--ANALYTICS-->", "")
            .replace("<!--ANALYTICS", "")
        .replace("%version%", version)
        .replace("%commit%", ref)
    );
}

console.log('# applaud.html ---------');

copy({
    source: "client/applaud.html",
    dest:   "build/client/applaud.html",
    filter: [ filterHtml ]
});

copy({
    source: "client/login.html",
    dest:   "build/client/login.html",
    filter: [ filterHtml ]
});

copy({
    source: "client/loginresult.html",
    dest:   "build/client/loginresult.html",
    filter: [ filterHtml ]
});

copy({
    source: "client/register.html",
    dest:   "build/client/register.html",
    filter: [ filterHtml ]
});

copy({
    source: "client/index.html",
    dest:   "build/client/index.html",
    filter: [ filterHtml ]
});

copy({
    source: "client/app.html",
    dest:   "build/client/app.html",
    filter: [ filterHtml ]
});
copy({
    source: "client/applauddoc.html",
    dest:   "build/client/applauddoc.html",
    filter: [ filterHtml ]
});

console.log('# demo1 ---------');

var project = copy.createCommonJsProject(applaudProject);
var demo = copy.createDataObject();
copy({
    source: [
        'client/ace/build_support/mini_require.js'
    ],
    dest: demo
});

//copy({ 
//    source: demo,
//    dest: 'demo1.js'
//});

console.log('# demo2 ---------');

copy({
    source: [
        copy.source.commonjs({
            project: project,
            require: [ 
                       "project_nav/layoutInit",
                       "project_nav/navbarInit", "project_nav/jstree", "project_nav/tabs",
                       "edit", "boot" ]
        })
    ],
    filter: [ copy.filter.moduleDefines ],
    dest: demo
});

//copy({ 
//    source: demo,
//    dest: 'demo2.js'
//});

console.log('# demo3 ---------');

copy({
    source: {
        root: project,
        include: /demo\/docs\/.*$/,
        exclude: /tests?\//
    },
    filter: [ copy.filter.addDefines ],
    dest: demo
});

//copy({ 
//    source: demo,
//    dest: 'demo3.js'
//});

copy({
    source: {
        root: project,
        include: /.*\.css$/,
        exclude: /(tests?\/|jquery\/|ripple\/|openid\/|server\/|applaud\/|register\/|node_modules\/)/
    },
    filter: [ copy.filter.addDefines ],
    dest: demo
});

copy({
    source: demo,
    filter: [ filterTextPlugin ],
    dest: 'applaud-' + (new Date()).getTime() + '.js'
});
copy({
    source: demo,
    filter: [ copy.filter.uglifyjs, filterTextPlugin ],
    dest: 'build/client/applaud.js'
});
