// Register a new user

var path = require('path');
var check = require('validator').check;
var sanitize = require('validator').sanitize;

var useridDb = require('./useridDb');
var connectionDb = require('./connectionDb');
var workspace = require('./workspace');

exports.run = function(req, data, writeData){
    var userid = data.userid;
//    console.log(JSON.stringify(data));
    try {
        check(userid).isAlphanumeric();
    } catch(e) {
        console.log('register: Invalid userid: ' + userid);
        writeData({ success : false, error : 'Userid must be alphanumeric'});
        return;
    }
    if (userid !== sanitize(userid).xss()) {
        writeData({ success : false, error : 'Userid fails sanitization :' + sanitize(userid)});
        return;
    }
    if (userid === 'Guest') {
        writeData({ success : false, error : 'User ID is not available. Please choose another.' });
        return;
    }
        
    path.exists(workspace.getRoot() + userid, function(exists) {
        if (exists) {
            writeData({ success : false, error : 'User ID is not available. Please choose another.' });
        } else {
            var email = useridDb.insert(userid, req.session.id);
            if (email === null) {
                console.log('register: Database insert failed. ' + userid);
                writeData({ success : false, error : 'Database insert failed. Please try again' });
            } else {
                console.log('register: ' + userid + '--' + email + '--' + data.name + '--' + data.company);
                req.session.data.user = userid;
                connectionDb.set(userid, req.session.id);
                workspace.initWorkspace(userid);
                writeData( { success : true });
            }
        }
    });
};