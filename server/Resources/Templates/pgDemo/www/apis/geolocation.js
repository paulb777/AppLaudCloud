/* Copyright (c) 2012 Mobile Developer Solutions. All rights reserved.
 * This software is available under the MIT License:
 * The MIT License
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
 * and associated documentation files (the "Software"), to deal in the Software without restriction, 
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, 
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software 
 * is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies 
 * or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE 
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// api-geolocation
var getCurrentPosition = function() {
    var map = document.getElementById('map');
    var success = function(pos) {                
        var text = "<div>Latitude: " + pos.coords.latitude + 
                    "<br/>" + "Longitude: " + pos.coords.longitude + "<br/>" + 
                    "Accuracy: " + pos.coords.accuracy + "m<br/>" + "</div>";
        document.getElementById('cur_position').innerHTML = text;
        console.log(text);
        map.style.display = 'block';
        var mapwidth = 270;  // a mungy compromise between the 2 sizes
        var mapheight = 210; // since we can't get w / h dynamically
        map.src = "http://maps.googleapis.com/maps/api/staticmap?center=" + 
            pos.coords.latitude + "," + pos.coords.longitude + 
            "&zoom=14&size=" + mapwidth + "x" + mapheight + "&maptype=roadmap&markers=color:green%7C" +
            pos.coords.latitude + "," + pos.coords.longitude + "&sensor=false";
    };
    var fail = function(error) {
        document.getElementById('cur_position').innerHTML = "Error getting geolocation: " + error.code;
        console.log("Error getting geolocation: code=" + error.code + " message=" + error.message);
    };

    map.style.display = 'none';
    document.getElementById('cur_position').innerHTML = "Getting geolocation . . .";
    console.log("Getting geolocation . . .");
    navigator.geolocation.getCurrentPosition(success, fail);
};

// api-geolocation Watch Position
var watchID = null;
function clearWatch() {
    if (watchID !== null) {
        navigator.geolocation.clearWatch(watchID);
        watchID = null;
        document.getElementById('cur_position').innerHTML = "";
        document.getElementById('map').style.display = 'none';
    }
}
var wsuccess = function(pos) { 
    var map = document.getElementById('map');
    document.getElementById('cur_position').innerHTML = "Watching geolocation . . .";
    map.style.display = 'none';
    var text = "<div>Latitude: " + pos.coords.latitude + 
                " (watching)<br/>" + "Longitude: " + pos.coords.longitude + "<br/>" + 
                "Accuracy: " + pos.coords.accuracy + "m<br/>" + "</div>";
    document.getElementById('cur_position').innerHTML = text;
    console.log(text);    
    map.style.display = 'block';
    var mapwidth = 270;  // a mungy compromise between the 2 sizes
    var mapheight = 210; // since we can't get w / h dynamically
    map.src = "http://maps.googleapis.com/maps/api/staticmap?center=" + 
        pos.coords.latitude + "," + pos.coords.longitude + 
        "&zoom=13&size=" + mapwidth + "x" + mapheight + "&maptype=roadmap&markers=color:green%7C" +
        pos.coords.latitude + "," + pos.coords.longitude + "&sensor=false";
};
var wfail = function(error) {
    document.getElementById('cur_position').innerHTML = "Error getting geolocation: " + error.code;
    console.log("Error getting geolocation: code=" + error.code + " message=" + error.message);
};
var toggleWatchPosition = function() {
    if (watchID) {
        console.log("Stopped watching position");
        clearWatch();  // sets watchID = null;
    } else {
        document.getElementById('map').style.display = 'none';
        document.getElementById('cur_position').innerHTML = "Watching geolocation . . .";
        console.log("Watching geolocation . . .");
        var options = { frequency: 3000, maximumAge: 5000, timeout: 5000, enableHighAccuracy: true };
        watchID = navigator.geolocation.watchPosition(wsuccess, wfail, options);
    }
};
