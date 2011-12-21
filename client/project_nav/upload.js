// thanks to http://jquery.malsup.com/form/#ajaxSubmit

define(function(require, exports, module) {
    var connection = require('project_nav/connection');
    
    var dialogId = "#upload_dialog";
    var uploadFolderNode = null;

    function preRequest(formData, jqForm, options) { 
        
        uploadFolderNode = $.jstree._focused().get_selected();
        if (!uploadFolderNode || uploadFolderNode.length !== 1 || 
                $(uploadFolderNode).attr("rel") === 'default') {
            alert('Please select a single folder to upload into');
            return false;
        }
        
        if (formData[0].value === '') {
            alert('Choose at least one file to upload');
            return false;
        }
        
        var folderName = $(uploadFolderNode).attr("title");
        options.url = '/upload?' + folderName;
        
        // It's not obvious how to wrap form post with connection.post
        // so make sure the server is connected as close as possible
        connection.post('/setSession'); 

        // here we could return false to prevent the form from being submitted; 
        // returning anything other than false will allow the form submit to continue 
        return true; 
    } 

    var processResponse = function(r) {
        $(dialogId).dialog('close');
        $("#projects").jstree('refresh', uploadFolderNode);
        var start = r.indexOf('START');
        var end = r.indexOf('END');
        alert(r.substring(start+5, end));
    };
    


    var options = { 
//        target:        '#output1',   // target element(s) to be updated with server response 
        beforeSubmit:  preRequest,  // pre-submit callback 
        success:       processResponse,  // post-submit callback 

        // other available options: 
        //url:       url         // override for form's 'action' attribute 
        //type:      type        // 'get' or 'post', override for form's 'method' attribute 
        //dataType:  null        // 'xml', 'script', or 'json' (expected server response type) 
        //clearForm: true        // clear all form fields after successful submit 
        resetForm: true        // reset the form after successful submit 

        // $.ajax options can be used here too, for example: 
        //timeout:   3000 
    }; 

    $('#uploadForm').ajaxForm(options);

    exports.run = function() {   
        $(dialogId).dialog({
            autoOpen: true,
            draggable: true,
            resizable: true,
            width: 450,
            title: "Choose File(s) to Upload",
            buttons: {
                "Close": function() {
                    $(dialogId).dialog('close');
                    return false;
                }
            }
        });
    };
});