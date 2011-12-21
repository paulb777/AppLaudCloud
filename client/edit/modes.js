define(function(require, exports, module) {
    var JavaScriptMode = require("ace/mode/javascript").Mode;
    var CssMode = require("ace/mode/css").Mode;
    var HtmlMode = require("ace/mode/html").Mode;
    var XmlMode = require("ace/mode/xml").Mode;
    var PhpMode = require("ace/mode/php").Mode;
    var JavaMode = require("ace/mode/java").Mode;
    var CoffeeMode = require("ace/mode/coffee").Mode;
    var JsonMode = require("ace/mode/json").Mode;
    var TextMode = require("ace/mode/text").Mode;

    var modes = {
            text: new TextMode(),
            xml: new XmlMode(),
            html: new HtmlMode(),
            css: new CssMode(),
            javascript: new JavaScriptMode(),
            php: new PhpMode(),
            java: new JavaMode(),
            coffee: new CoffeeMode(),
            json: new JsonMode()
    };

    exports.getMode = function(filename) {
        var mode;
        if (/^.*\.js$/i.test(filename)) {
            mode = "javascript";
        } else if (/^.*\.xml$/i.test(filename)) {
            mode = "xml";
        } else if (/^.*\.html$/i.test(filename)) {
            mode = "html";
        } else if (/^.*\.css$/i.test(filename)) {
            mode = "css";
        } else if (/^.*\.php$/i.test(filename)) {
            mode = "php";
        } else if (/^.*\.java$/i.test(filename)) {
            mode = "java";
        } else if (/^.*\.coffee$/i.test(filename)) {
            mode = "coffee";
        } else if (/^.*\.json$/i.test(filename)) {
            mode = "json";
        } else {
            mode = "text";
        }
        return modes[mode];
    };
    exports.getModeForMenu = function(string) {
        return modes[string];
    };

    exports.getStringFromMode = function(mode) {
        if (mode instanceof JavaScriptMode) {
            return "javascript";
        }
        else if (mode instanceof CssMode) {
            return "css";
        }
        else if (mode instanceof HtmlMode) {
            return "html";
        }
        else if (mode instanceof XmlMode) {
            return "xml";
        }
        else if (mode instanceof PhpMode) {
            return "php";
        }
        else if (mode instanceof JavaMode) {
            return "java";
        }
        else if (mode instanceof CoffeeMode) {
            return "coffee";
        }
        else if (mode instanceof JsonMode) {
            return "json";
        }
        else {
            return "text";
        }
    };
});


