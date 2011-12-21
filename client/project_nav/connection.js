define(function(require, exports, module) {
    var connection = null;
    
    var outputLoginButton = function() {
        $("#login").html('<a id="navbar_login" href="login.html">Login</a>');
        $("#navbar_login").button({icons: {primary:'ui-icon-alert'}});
        $("#navbar_login").removeClass("ui-state-default").addClass("ui-state-error");
//        $("#login").html('<input type=button value="Login" onClick="' + 
//                "window.open(document.URL.substring(0, document.URL.lastIndexOf('/')) + '/login.html', '_self');" + '">'); 
    };
    
    $.get("/getConnection", { }, function(r) {
        if (r.user && r.session && r.user !== 'Guest') {
            connection = r;
            $("#login").html('User: <span style="color:#d6e600;">' + r.user + '</span>'); 
        } else {
            outputLoginButton(); 
        }
    });

    exports.getUser = function() {
        return connection && connection.user;
    };
    exports.getSession = function() {
        return connection && connection.session;
    };   
    exports.setSession = function(s) {
        connection.session = s;
    };
    // wrap post with connection check
    exports.post = function(url, data, callback) {
        var d = data || {};
        d.user = connection.user;
        d.session = connection.session;
        $.post(url, d, function (r) {
            if (r.newSession) {
                connection.session = r.newSession;
            }
            if (callback) callback(r);
        });
    };
    exports.ajax = function(settings) {
        settings.data.user = connection.user;
        settings.data.session = connection.session;
        var saveSuccess = settings.success;
        settings.success = function(r) {
            if (r.newSession) {
                connection.session = r.newSession;
            } else if (r.loggedOut) {
                outputLoginButton();
            }
            if (saveSuccess) saveSuccess(r);
        };
        $.ajax(settings);
    };
});