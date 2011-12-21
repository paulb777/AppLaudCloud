// layouts modeled from http://layout.jquery-dev.net/demos/tabs_simple.html

// this file should not have a define around it since it needs to run before the 
// editor tries to start

$(document).ready(function() {

    //   $("#tabs_div").tabs();

    $(".header-footer").hover(function() {
        $(this).addClass('ui-state-hover');
    }, function() {
        $(this).removeClass('ui-state-hover');
    });

    $('body').layout({
        center__onresize: "env.resize();",
        south__initClosed: true             
    });

    // addThemeSwitcher('.ui-layout-north',{ top: '13px', right: '20px' });

});
