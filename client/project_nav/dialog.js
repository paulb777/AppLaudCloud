define(function(require, exports, module) {
    exports.make = function (prompt, html, yes, no) {
        var tag = "#generic_dialog";
        $(tag).html(html).dialog({
            autoOpen: true,
            draggable: true,
            resizable: true,
            width: 400,
            title: prompt,
            modal: true,  // also implies keyup === 13 goes to Confirm
            buttons: {
                "Confirm": function() {
                    yes();
                    $(tag).dialog('close');
                },
                "Cancel": function() {
                    $(tag).dialog('close');
                    if (no) no();
                    return false;
                }
            }
        });
    };
});