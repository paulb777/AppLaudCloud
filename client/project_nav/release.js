// Processes user input to set up an Android release build
// The key file upload is modeled after the code in upload.js

define(function(require, exports, module) {
    var connection = require('project_nav/connection');
    
    var dialogId = "#release_dialog";
    var doBuild = null;
    var keyAlias = '';
    var keyStorePassword = '';
    var keyAliasPassword ='';

    function preRequest(formData, jqForm, options) { 
        if (formData[0].value === '') {  
            alert('Choose your keystore location. For information about creating a keystore see http://developer.android.com/guide/publishing/app-signing.html#cert');
            return false;
        }
        keyAlias = document.getElementById("nrd-alias").value;
        keyStorePassword = document.getElementById("nrd-ks-password").value;
        keyAliasPassword = document.getElementById("nrd-alias-password").value;
        connection.post('/setSession'); 
        return true; 
    } 

    var processResponse = function(r) {
        $(dialogId).dialog('close');
        var start = r.indexOf('START');
        var end = r.indexOf('END');
        var keyStoreFile = r.substring(start+5, end);
        doBuild({ keyStore : keyStoreFile, keyAlias : keyAlias, keyStorePassword : keyStorePassword,
                        keyAliasPassword : keyAliasPassword});
    };
    
    var options = { 
        beforeSubmit:  preRequest,  // pre-submit callback 
        success:       processResponse,  // post-submit callback 
        clearForm: true        // clear all form fields after successful submit 
    }; 

    $('#releaseForm').ajaxForm(options);

    exports.getInfo = function(callback) {  
        doBuild = callback;
        $(dialogId).dialog({
            autoOpen: true,
            draggable: true,
            resizable: true,
            width: 520,
            title: "Release Build",
            buttons: {
                "Close": function() {
                    $(dialogId).dialog('close');
                    return false;
                }
            }
        });
    };
});