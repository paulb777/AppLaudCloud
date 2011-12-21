$(document).ready(function() {
    
    $("#login-button, #app-button, #helplogin-button").button();
    //$("#app-test-btn").button();
    //$("#app-test-btn, #login-button").click(function() { return false; });
    //  #button1,    $("a").click(function() { return false; });
    
    $('#doc-aside ul li a, #doc-aside h4 a, #doc-aside h3 a').click(function(event) {
        var href = $(this).attr('href');
        if (href.indexOf('#') > 0) {  // only intercept if there's a hash tag
            event.preventDefault();
            $('div#doc-scroll-area').scrollTo($(this).attr('href'));
        }
    });
    $('#main-aside ul li a, #main-aside h4 a, #main-aside h3 a').click(function(event) {
        //alert('clicked : ' + $(this).attr('href'));
        event.preventDefault();
        $('div#main-scroll-area').scrollTo($(this).attr('href'));
    });
});
    