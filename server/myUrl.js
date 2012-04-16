// Server URL definition

var rawUrl = '192.168.0.106';
var url = 'http://' + rawUrl;
// var url = 'http://ec2-204-236-144-1.us-west-1.compute.amazonaws.com';

var port = 8027;
var weinrePort = 8080;

exports.getRawUrl = function() {
    return rawUrl;
};

exports.getUrl = function() {
    return url;
};

exports.getPort = function() {
    return port;
};

exports.getWeinrePort = function() {
    return weinrePort;
};
