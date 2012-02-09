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

// api-media
var my_media = null;
var mediaTimer = null;
var dur = -1;  // duration of media (song)
var is_paused = false; // need to know when paused or not
function setAudioPosition(position) {
    document.getElementById('audio_position').innerHTML = "<b>" + position + " sec</b>";
}
function onSuccess() {
    setAudioPosition(dur);
    clearInterval(mediaTimer);
    mediaTimer = null;
    my_media = null;
    is_paused = false;
    dur = -1;
}
function onError(error) {
    alert('code: '    + error.code    + '\n' + 
            'message: ' + error.message + '\n');
    clearInterval(mediaTimer);
    mediaTimer = null;
    my_media = null;
    is_paused = false;
    setAudioPosition("0");
}
function playAudio(src) {
    if (my_media === null) {       
        document.getElementById('media_dur').innerHTML = "<b>0</b>"; // ui niceties
        document.getElementById('audio_position').innerHTML = "<b>Loading...</b>";        
        // Create Media object from src
        my_media = new Media(src, onSuccess, onError);       
        //alert('Playing Audio');
        my_media.play();
    } else {
        if (is_paused) {
            // to resume where paused in song: call .play()
            is_paused = false;
            my_media.play();
        }
    }
    // Update my_media position every second
    if (mediaTimer === null) {
        mediaTimer = setInterval(function() {
            my_media.getCurrentPosition(
                    // success callback
                    function(position) {
                        if (position > -1) {
                            setAudioPosition(Math.round(position));
                            // getDuration() can take a few seconds so keep trying
                            // this could be done a better way, no callback for it
                            if (dur <= 0) {
                                dur = my_media.getDuration();                             
                                if (dur > 0) {
                                    dur = Math.round(dur);
                                    document.getElementById('media_dur').innerHTML =  "<b>" + dur + "</b>";
                                }
                            }                                                      
                        }
                    },
                    // error callback
                    function(e) {
                        alert("Error getting pos=" + e);
                        setAudioPosition("<b>Error: " + e + "</b>");
                    }
            );
        }, 1000);
    }
}

function playMyAudio() {      
    check_network();
    if (document.getElementById('connectionstate').innerHTML === 'No network connection') {
        alert("Need network connection to play song from internet");
        return false;
    }
    // Note: Two ways to access media file: (1) web (below)        
    var src = 'http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3';        
    // (2) local (on device): copy file to project's /assets folder, acces with:
    // var src = '/android_asset/yourthemesong.m4a'; 
     
    playAudio(src);
}

function pauseAudio() {
    if (is_paused) { return; }
    if (my_media) {
        is_paused = true;
        my_media.pause();
    }
}
function stopAudio() {
    if (my_media) {
        // A successful .stop() will call .release()
        my_media.stop();
        my_media = null;
    }
    if (mediaTimer) {
        clearInterval(mediaTimer);
        mediaTimer = null;
    }
    is_paused = false;
    dur = 0;
}

// api-media   Live Audio Recording / Playback
var mediaRec = 0;
function playbackRecord() {
    if (mediaRec) {
        //mediaRec.seekTo(0);  gives error ?
        mediaRec.play();
        document.getElementById('record-status').innerHTML = "<b>Playing</b>";
        console.log("Playing Audio");
    }
}
function recordSuccess() {
    console.log("Record Success");
    document.getElementById('record-status').innerHTML = "<b>Success</b>";
}
function recordError(error) {
    // After 1st time always shows error, but may be bug instead
    console.log('Record Error: code: ' + error.code);
}
function startRecord() {
    var src = "myrecording.mp3";
    
    // disable playback while recording
    if (mediaRec) {
        mediaRec.release();  // help prevent errors
    }
    mediaRec = new Media(src, recordSuccess, recordError);

    mediaRec.startRecord();
    document.getElementById('record-status').innerHTML = '<span style="color:#f22;"><b>Recording</b></span>';
    document.getElementById('record-time').innerHTML = '<b>0 sec</b>';

    // Stop recording after 5 sec
    var recTime = 0;
    var recInterval = setInterval(function() {
        recTime = recTime + 1;
        document.getElementById('record-time').innerHTML = "<b>" + recTime + ' sec</b>';
        if (recTime >= 5) {
            clearInterval(recInterval);
            document.getElementById('record-status').innerHTML = '<b>Recorded: 5sec</b>';
            mediaRec.stopRecord();
        }
    }, 1000);    
}

