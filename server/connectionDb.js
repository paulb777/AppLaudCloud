// Manage connection database
// key is users data is session
// used to reconnect users to server after server restart
// there are up to four sessions per user

var db = require('dirty').dirtydirty('connection.db');

db.on('load', function() {
    console.log('connection.db loaded');
});

//exports.get = function(user) {
//    return db.get(user);
//};

// check returns true if the session existed for the user
// If newSession is passed, it will also update that entry

exports.check = function(user, oldSession, newSession) {
    var arr = db.get(user);
    if (arr) {
        var i;
        for (i = 0; i < arr.length; i++) {
            if (arr[i] === oldSession) {
                if (newSession) {
                    arr[i] = newSession;
                    db.set(user, arr);
                }
                return true;
            }
        }
    }
    return false;
};

exports.set = function(user, session) {
    var arr = db.get(user) || [];
    if (!exports.check(user, session)) {   // don't let array fill up with dupes on multiple logins
        if (arr.length >= 4) arr.pop();
        arr.unshift(session);
        db.set(user, arr);
    }
};

exports.remove = function(user, session) {
    var arr = db.get(user);
    if (arr) {
        var i;
        for (i = 0; i < arr.length; i++) {
            if (arr[i] === session) {
                console.log('pre ' + JSON.stringify(arr));
                arr.splice(i, 1);
                db.set(user, arr);
                console.log('post ' + JSON.stringify(arr) + ' session ' + session);
                return true;
            }
        }
    }
    return false;
};
