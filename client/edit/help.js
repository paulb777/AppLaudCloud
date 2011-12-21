var html =         "    <h4>AppLaud User Guide<\/h4>" +
"<p><em><small>This page is also at Help -> User Guide</small></em></p>" +
"<h4>Starting a Project<\/h4>" +
"<ul>" +
"<li>Choose New->Project" +
"<li>Give it a name, select a Project Template, and click Create" +
"<li>Double click files in left pane to edit" +
"<li>File and Edit options available with right click and New/File/Edit menus" +
"<li>Make sure browser pop-ups are enabled" +
"<\/ul>" +
"<h4>Running the App<\/h4>" +
"<img src='icon/applaudappapk100x100.png' class='floatRight'>" +
"<ul>" +
"<li>Build not required" +
"<li>Scan the QR Code to download the app to the device" +
"<li>AppLaud App <a href='applauddoc.html#applaud-app' target='_blank'>Documentation</a>" +
"<li>Tap 'Refresh Project List' " +
"<li>Tap a project to begin running it" +
"<\/ul>" +
"<h4>Debugging<\/h4>" +
"<ul>" +
"<li>Tap 'W' icon on device app's Project List" +
"<li>Tap the project" +
"<li>On the desktop, select Debug->Weinre Controller" +
"<li>Make sure there is a green client and select Elements" +
"<li>Examine HTML, change CSS, call functions, etc" +
"<li>More at <a href='http://phonegap.github.com/weinre/Home.html' target='_blank'>Weinre Home</a>" +
"<\/ul>" +
"<h4>Emulating<\/h4>" +
"<ul>" +
"<li>Select Emulate->Ripple Emulator" +
"<li>Use Chrome Developer Tools to run and examine the project" +
"<li>Use Ripple Console to simulate PhoneGap APIs" +
"<li>More at <a href='http://ripple.tinyhippos.com/' target='_blank'>Ripple Home</a>" +
"<\/ul>" +
"<h4>Packaging/Building<\/h4>" +
"<ul>" +
"<li>Choose a build type" +
"<li>Wait a minute or two for server build" +
"<li>On the app, choose 'Refresh APK List" +
"<li>Select app to download to your device" +
"<\/ul>" +
"<h4>Uploading Files<\/h4>" +
"<ul>" +
"<li>Select File->Upload" +
"<li>Right click on .zip files and select unzip" +
"<li>Also drag and drop files onto window and select File->Save As" +
"<\/ul>" +
"<h4>Downloading Files/Folders/Projects<\/h4>" +
"<ul>" +
"<li>Right click -> Download" +
"<\/ul>"+
"<h4>More Information<\/h4>" +
"<ul>" +
"<li><a href='http://www.applaudcloud.com/' target='_blank'>AppLaud Cloud Home</a>" +
"<li><a href='https://groups.google.com/forum/#!forum/applaud-cloud' target='_blank'>AppLaud Forum</a>" +
"<\/ul>";

define(function(require, exports, module) {
    exports.html = html;
});