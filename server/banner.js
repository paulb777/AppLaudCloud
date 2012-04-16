// Return banner (if it exists)

var fs = require('fs');

exports.run = function(writeDataCallback) {

    fs.readFile('banner', 'utf8', function (err, data) {
        if (err) {
            writeDataCallback('');
        } else {
            writeDataCallback(data.toString());
        }
    });
};
