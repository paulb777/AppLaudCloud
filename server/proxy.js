var httpProxy = require('http-proxy');
var myUrl = require('./myUrl');

exports.init = function() {
    var url = myUrl.getUrl();
    var options = {
          router: {
            '/debug': '192.168.0.104:8080',
            '/search' : 'www.google.com',
            'http://192.168.0.104/': '127.0.0.1:8013'
          }
    }
    var proxyServer = httpProxy.createServer(options);
    proxyServer.listen(8014);
};