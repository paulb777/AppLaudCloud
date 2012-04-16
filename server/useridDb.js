// Manage userid database

var db = require('dirty')('userid.db');
var preRegister = [];  // hold logins that are not yet registered

db.on('load', function() {
    console.log('userid.db loaded');
});

exports.getOrPreRegister = function(claimedId, session, email) {
    var userid = db.get(claimedId);
//    console.log('useridDB get vals:' + claimedId + '-' + userid + '-' + session);
    if (!userid) {
        preRegister[session] = { claimedId : claimedId, email : email} ;
    }
    return userid;
};

exports.insert = function(userid, session) {
    var data = preRegister[session];
    if (!data) {
        console.log('useridDB: mismatched sessions in insert:' + userid + '-' + session);
        return null;
    }     
    var claimedId = data.claimedId;
//    console.log('useridDB insert vals:' + claimedId + '-' + userid + '-' + session);
    db.set(claimedId, userid);
    delete preRegister[claimedId];
    return data.email;
};