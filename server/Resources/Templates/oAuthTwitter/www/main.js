function checkConnection() {
    var networkState = navigator.network.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'No network connection';

    if (states[networkState] === 'No network connection') {
        alert('No network connection detected. Check settings.');
    } else {
        alert('Connection type: ' + states[networkState]);
    }
}

function onDeviceReady() {
    document.addEventListener("offline", checkConnection, false);
    document.addEventListener("online", checkConnection, false);
}

function init() {
    document.addEventListener("deviceready", onDeviceReady, false);
}

$('#page-home').live('pageinit', function() {
    var oauth;
    var requestParams;
    var options = { 
            consumerKey: 'YOUR-CONSUMER-KEY',
            consumerSecret: 'YOUR-CONSUMER-SECRET',
            callbackUrl: 'http://www.your-callback-url.com' };
    var mentionsId = 0;
    var localStoreKey = "applaudcloudtwitter";
    $('#stage-data').hide();
    $('#stage-auth').hide();

    // Check for access token key/secret in localStorage
    var storedAccessData, rawData = localStorage.getItem(localStoreKey);
    if (rawData !== null) {
        storedAccessData = JSON.parse(rawData);                 
        options.accessTokenKey = storedAccessData.accessTokenKey;
        options.accessTokenSecret = storedAccessData.accessTokenSecret;
          
        console.log("AppLaudLog: Attemping oauth with stored token key/secret");           
        oauth = OAuth(options);
        oauth.get('https://api.twitter.com/1/account/verify_credentials.json?skip_status=true',
                function(data) {
                    var entry = JSON.parse(data.text);
                    console.log("AppLaudLog: Success getting credentials. screen_name: " + entry.screen_name);
                        
                    $('#confirm-user').live('click', function() {
                        $('#oauthStatus').html('<span style="color:green;">Success!</span>');
                        $('#userInfo').html('Current user: <strong>' + entry.screen_name + '</strong>');
                        $('#stage-data').show();
                        $.mobile.changePage($('#page-home'), { reverse : true, changeHash: false });
                        return false;
                    });
                    $('#cancel-user').live('click', function() {
                        $('#cancel').trigger('click');
                        $.mobile.changePage($('#page-home'), { reverse : true, changeHash: false });
                        return false;
                    });

                    $('#dialog-confirm-text').html('<p>Twitter user: <strong>' +
                         entry.screen_name + '</strong><br> already authorized.<br>Continue as <strong>' +
                         entry.screen_name + '</strong>?</p><p>Cancel to log in a different user.</p><hr>');
                    $('#stage-reading-local-store').hide();
                    $.mobile.changePage($('#page-dialog-confirm'), { role: 'dialog', changeHash: false });
                },
                function(data) { 
                    alert('Error with stored user data. Re-start authorization.');
                    options.accessTokenKey = '';
                    options.accessTokenSecret = '';
                    localStorage.removeItem(localStoreKey);
                    $('#stage-reading-local-store').hide();
                    $('#stage-auth').show();
                    console.log("AppLaudLog: No Authorization from localStorage data"); 
                }
        );
    } else {
        console.log("AppLaudLog: No localStorage data");
        $('#stage-reading-local-store').hide();
        $('#stage-auth').show();
    }

    function textCount() {
        var remaining = 140 - $('#tweettextarea').val().length;
        var color = (remaining < 0) ? 'red' : 'green';
        $('#textcount').html('<span style="color:' + color + ';">' + remaining + '</span> chars left. Enter text:');
    }
    textCount();
    $('#tweettextarea').change(textCount);
    $('#tweettextarea').keyup(textCount);
    
    $('#startbutton').click(function() {       
        // Set childBrowser callback to detect our oauth_callback_url
        if (typeof window.plugins.childBrowser.onLocationChange !== "function") {
            window.plugins.childBrowser.onLocationChange = function(loc){
                console.log("AppLaudLog: onLocationChange : " + loc);
  
                // If user hit "No, thanks" when asked to authorize access
                if (loc.indexOf("http://www.your-callback-url.com/?denied") >= 0) {
                    $('#oauthStatus').html('<span style="color:red;">User declined access</span>');
                    window.plugins.childBrowser.close();
                    return;
                }

                // Same as above, but user went to app's homepage instead
                // of back to app. Don't close the browser in this case.
                if (loc === "http://www.your-app-homepage-url.com/") {
                    $('#oauthStatus').html('<span style="color:red;">User declined access</span>');
                    return;
                }
                
                // The supplied oauth_callback_url for this session is being loaded
                if (loc.indexOf("http://www.your-callback-url.com/?") >= 0) {
                    var verifier = '';            
                    var params = loc.substr(loc.indexOf('?') + 1);
                    
                    params = params.split('&');
                    for (var i = 0; i < params.length; i++) {
                        var y = params[i].split('=');
                        if(y[0] === 'oauth_verifier') {
                            verifier = y[1];
                        }
                    }
               
                    // Exchange request token for access token
                    oauth.get('https://api.twitter.com/oauth/access_token?oauth_verifier='+verifier+'&'+requestParams,
                            function(data) {               
                                var accessParams = {};
                                var qvars_tmp = data.text.split('&');
                                for (var i = 0; i < qvars_tmp.length; i++) {
                                    var y = qvars_tmp[i].split('=');
                                    accessParams[y[0]] = decodeURIComponent(y[1]);
                                }
                                console.log('AppLaudLog: ' + accessParams.oauth_token + ' : ' + accessParams.oauth_token_secret);
                                $('#oauthStatus').html('<span style="color:green;">Success!</span>');
                                $('#stage-auth').hide();
                                $('#stage-data').show();
                                oauth.setAccessToken([accessParams.oauth_token, accessParams.oauth_token_secret]);
                                
                                // Save access token/key in localStorage
                                var accessData = {};
                                accessData.accessTokenKey = accessParams.oauth_token;
                                accessData.accessTokenSecret = accessParams.oauth_token_secret;
                                console.log("AppLaudLog: Storing token key/secret in localStorage");
                                localStorage.setItem(localStoreKey, JSON.stringify(accessData));

                                oauth.get('https://api.twitter.com/1/account/verify_credentials.json?skip_status=true',
                                        function(data) {
                                            var entry = JSON.parse(data.text);
                                            $('#userInfo').html('Current user: <strong>' + entry.screen_name + '</strong>');
                                            console.log("AppLaudLog: screen_name: " + entry.screen_name);
                                        },
                                        function(data) { 
                                            alert('Error getting user credentials'); 
                                            console.log("AppLaudLog: Error " + data); 
                                            $('#oauthStatus').html('<span style="color:red;">Error getting user credentials</span>');
                                        }
                                );                                         
                                window.plugins.childBrowser.close();
                        },
                        function(data) { 
                            alert('Error : No Authorization'); 
                            console.log("AppLaudLog: 1 Error " + data); 
                            $('#oauthStatus').html('<span style="color:red;">Error during authorization</span>');
                        }
                    );
                }
            };  
        } // end if
        
        // Note: Consumer Key/Secret and callback url always the same for this app.        
        $('#oauthStatus').html('<span style="color:blue;">Getting authorization...</span>');
        oauth = OAuth(options);
        oauth.get('https://api.twitter.com/oauth/request_token',
                function(data) {
                    requestParams = data.text;
                    console.log("AppLaudLog: requestParams: " + data.text);
                    window.plugins.childBrowser.showWebPage('https://api.twitter.com/oauth/authorize?'+data.text, 
                            { showLocationBar : false });                    
                },
                function(data) { 
                    alert('Error : No Authorization'); 
                    console.log("AppLaudLog: 2 Error " + data); 
                    $('#oauthStatus').html('<span style="color:red;">Error during authorization</span>');
                }
        );
        mentionsId = 0;
    });

    $('#cancel').click(function() {
        $('#oauthStatus').html('<span style="color:red;">Cancelled by User</span>');
        $('#userInfo').empty();
        $('#twitterdata').empty();
        $('#stage-auth').show();
        $('#stage-data').hide();
        localStorage.removeItem(localStoreKey);
        options.accessTokenKey = '';
        options.accessTokenSecret = '';
        oauth.post('http://api.twitter.com/1/account/end_session.json',
                {}, function(data) {
                    console.log("AppLaudLog: User ended session");
                }, function(data) {
                    console.log("AppLaudLog: Error: End session");
                });
    });

    $('#homeTimeline').click(function() {
        oauth.get('https://api.twitter.com/1/statuses/home_timeline.json?count=10',
                function(data) {
                    var entries = JSON.parse(data.text);
                    var count = entries.length;
                    var data_html = '<h4>Home Timeline: 1 of ' + count + ' entries</h4>';

                    if (count >= 0) {
                        // Use count value to display all timelines
                        // for (var i = 0; i < count; i++) {
                        for (var i = 0; i < 1; i++) {
                            console.log("AppLaudLog: count: " + count);                            
                            data_html = data_html.concat('<div><img src="' +
                                entries[i].user.profile_image_url + '">' +
                                entries[i].user.name + '</div>');
                            data_html = data_html.concat('<p>' + entries[i].text + '<br>' +
                                entries[i].created_at + '</p>');
                        }
                    }
                    $('#twitterdata').prepend(data_html);
                },
                function(data) { 
                    alert('Error getting home timeline'); 
                    console.log("AppLaudLog: Error " + data); 
                    $('#oauthStatus').html('<span style="color:red;">Error getting home timeline</span>');
                }
        );          
    });        
        
    $('#mentions').click(function() {
        var mentionsParams = (mentionsId === 0) ? '' : ('?since_id=' + mentionsId);
        oauth.get('https://api.twitter.com/1/statuses/mentions.json' + mentionsParams,
                function(data) {
                    var entries = JSON.parse(data.text);
                    var count = entries.length;
                    var data_html = '<h4>Mentions: 1 of ' + count + ' entries</h4>';
                    
                    if (count > 0) {
                        // Use count value to display all mentions
                        // for (var i = 0; i < count; i++) {
                        for (var i = 0; i < 1; i++) {
                            console.log("AppLaudLog: count : " + count);
                            data_html = data_html.concat('<div><img src="' +
                                entries[i].user.profile_image_url + '">' +
                                entries[i].user.name + '</div>');
                            data_html = data_html.concat('<p>' + entries[i].text + '<br>' +
                                entries[i].created_at + '</p>');
                        }
                        mentionsId = entries[i-1].id;
                        console.log("AppLaudLog: mentionsId : " + mentionsId);
                    }
                    $('#twitterdata').prepend(data_html);
            },
            function(data) { 
                alert('Error getting mentions.'); 
                console.log("AppLaudLog: Error " + data);
                $('#oauthStatus').html('<span style="color:red;">Error getting mentions</span>');
            }
        );             
    });

    $('#tweet').click(function() {                       
        if ($('#tweettextarea').val().length === 0) {
            alert('You must enter text before tweeting.');
            return false;
        }
        var theTweet = $('#tweettextarea').val();
        $('#confirm-tweet').click(function() {
            oauth.post('https://api.twitter.com/1/statuses/update.json',
                    { 'status' : theTweet,  // jsOAuth encodes for us
                      'trim_user' : 'true' },
                    function(data) {
                        var entry = JSON.parse(data.text);
                        var data_html = '<h4>You Tweeted:</h4>';
                            
                        console.log("AppLaudLog: Tweet id: " + entry.id_str + " text: " + entry.text);
                        data_html = data_html.concat('<p>Id: ' + entry.id_str + '<br>Text: ' + entry.text + '</p>');
                        $('#twitterdata').prepend(data_html);
                        $('#tweettextarea').empty();
                        $.mobile.changePage($('#page-home'), { reverse : true, changeHash: false });
                    },
                    function(data) { 
                        alert('Error Tweeting.'); 
                        console.log("AppLaudLog: Error during tweet " + data.text);
                        $('#oauthStatus').html('<span style="color:red;">Error Tweeting</span>');                           
                        $.mobile.changePage($('#page-home'), { reverse : true, changeHash: false });
                    }
            );                  
        });
        $('#cancel-tweet').click(function() {
             console.log("AppLaudLog: tweet cancelled by user");
             $.mobile.changePage($('#page-home'), { reverse : true, changeHash: false });
        });

        $('#dialog-tweet-text').html('<p>Really tweet ' + $('#tweettextarea').val().length +
                 ' characters?<br>Your status:<br>"' + theTweet + '"');
        $.mobile.changePage($('#page-dialog-tweet'), { role: 'dialog', changeHash: false });
    });
   
    $('#networkbutton').click(function() {
        checkConnection();
    });
});
