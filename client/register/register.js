// Thanks to http://www.queness.com/post/160/create-a-ajax-based-form-submission-with-jquery

$(document).ready(function() {
    
    var params, pairs, email = null;
    params = document.URL.substr(document.URL.indexOf('?') + 1);
    params = params.split('&');               
    pairs = params[0].split('=');
    if(pairs[0] === 'email') {
        email = pairs[1];
    }
    
    $('#email_title').html('<h3>Register <span style="color:#3e9b6a;">' + email + '</span> with AppLaud Cloud</h3>');

    $("#submit-button").button();
    $('#submit-button').click(function () {        
        //Get the data from all the fields
        var name = $('input[name=name]');
        var company = $('input[name=company]');
        var userid = $('input[name=userid]');
        var retVal = true;

        //Simple validation to make sure user entered something
        //If error found, add highlight class to the text field
        if (name.val()==='') {
            name.addClass('highlight');
            retVal = false;
        } else name.removeClass('highlight');
        
        if (userid.val()==='') {
            userid.addClass('highlight');
            retVal = false;
        } else userid.removeClass('highlight');
        
        if (!retVal) return false;
 
        //disabled all the text fields
//        $('.text').attr('disabled','true');
        
        //show the loading sign
        $('.loading').show();
        
        //start the ajax
        $.ajax({
            //this is the php file that processes the data and send mail
            url: "/register", 
            
            //GET method is used
            type: "GET",

            //pass the data         
            data : { 
                "name" : name.val(),
                "company" : company.val(),
                "userid" : userid.val()
            },     
            
            //Do not cache the page
            cache: false,
            
            //success
            success: function (r) {     
                $('.loading').hide();
                //if process.php returned 1/true (send mail success)
                if (r.success) {   
                    var url = document.URL;
                    window.open(url.substring(0, url.lastIndexOf('/')) + '/applaud.html', '_self');
                    
                //if process.php returned 0/false (send mail failed)
                } else {
                    userid.addClass('highlight');
                    $('#askeduserid').text(userid.val());
                    $('#reg-dialog').dialog('open');
                    userid.val('');     
                }
            }       
        });
        
        //cancel the submit button default behaviours
        return false;
    }); 

    $("#reg-accordion").accordion({ header: "h3", collapsible: true, active: false });  

}); 