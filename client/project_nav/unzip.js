define(function(require, exports, module) {
    var connection = require('project_nav/connection');

    exports.run = function(zipfile, node) {  
        connection.post("/unzip", { "zipfile" : zipfile },  function (r) {
            if (r.success) {
                alert(zipfile + ' successfully unzipped');
            } else {
                var out = '';
                if (r.error !== '') out = 'Unzip errors: ' + r.error;
                if (r.exist) out += 'Some files already exist. Unzip failed for the following: ' + r.exist;
                alert(out);
            }
            $("#projects").jstree('refresh', $.jstree._reference(node)._get_parent());
        });
    };
});