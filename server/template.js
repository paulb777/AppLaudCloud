// Return info about the available project templates

var fs = require('fs');

var load = function(callback) {
    var dir = __dirname + "/Resources/Templates";

    fs.readdir(dir, function (err, templates) {
        if (err) {
            callback(err);
        }
//        console.log(JSON.stringify(templates));
        var count = templates.length;
        var results = {};
        templates.forEach(function (template) {
            var fullname = dir + '/' + template + '/package.json';
            fs.readFile(fullname, 'utf8', function (err, data) {
                if (err) { callback(err); return; }
                var d = JSON.parse(data);
                results[d.name] = { "template" : template, "jqm" : d.jqm, "select" : !!d.select };
                if (d.order !== undefined) results[d.name].order = d.order;
                count--;
                if (count === 0) {
                    callback(null, results);
                }
            });
        });
    });          
};

exports.run = function(writeDataCallback) {
    load(function (err, result) {
        if (err) {
            writeDataCallback({ success : 0, error : 'template.js:' + err});
        } else {
//            console.log('template result :' + JSON.stringify(result));
            writeDataCallback({ success : 1, result : result});
        }
    });
};