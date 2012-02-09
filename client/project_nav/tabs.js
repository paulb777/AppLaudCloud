define(function(require, exports, module) {

    var sessions = require('sessions');
    var preferences = require('preferences');
    
    var tabsDiv = '#tabs_div';
    var tabsOpen = 0;
    
    exports.doClose = function(session, automatic) {
        if (session.dirty && !confirm("Do you really want to close "
                        + session.filename + " without saving it?")) {
            return false;
        }
        if (!automatic) {
            $(tabsDiv).tabs('remove', '#' + session.name);
        }
        sessions.remove(session.filename);
        tabsOpen--;
        if (tabsOpen === 0) {
            $('#editor').hide();
            $('#editor_help').show();
        }
        return true;
    };

    $(function() {
        var curSelected = null;

        var selectTab = function(tabName) {
            curSelected = tabName;
            var session = sessions.get(tabName);
            var split = env.split.setSession(session);
            split.name = tabName;

            preferences.update();
            env.editor.focus();
        };
        
        var closeOthers = function(keep) {
            var i;
            var sessionList = sessions.getSessionsArray();
            for (i in sessionList) {
                if (sessionList[i].name !== keep) {
                    exports.doClose(sessionList[i], false);
                }
            }
        };
        
        var closeAll = function() {
            closeOthers('');
        };

        $(tabsDiv).tabs(
                {
                    closable : true,
                    cache : true,
                    add : function(e, ui) {
                        var tabName = ui.panel.id;
                        if (tabsOpen === 0) { // enable editable
                            $('#editor').show();
                            $('#editor_help').hide();
//                          env.editor.setReadOnly(false);
                        }
                        tabsOpen++;
                        $(tabsDiv).tabs('select', '#' + ui.panel.id);

                        if (curSelected !== tabName) {
                            // select callback doesn't happen for first tab
                            selectTab(tabName);
                        }
                        var session = env.editor.getSession();
                        ui.tab.parentNode.title = session.filename; // set tooltip
                        session.dirty = false;
                        env.editor.getSession().on('change', function() {
                            if (session.dirty === false) {
                                sessions.setDirty(session);
                            }
                        });

                        // Show context menu for Close Others and Close All when tab is right clicked
                        $(tabsDiv + ' a[href=#' + tabName + ']').parent().contextMenu({
                            menu: 'tabContextMenu'
                        },
                        function(action, el, pos) {
                            if (action === 'closeOthers') {
                                closeOthers(tabName);
                            } else if (action === 'closeAll' ) {
                                closeAll();
                            } else {
                                alert('tabs.js : invalid action ' + action);
                            }
                        });
                    },
                    closableClick : function(event, ui) {
                        // always just return true if not dirty
 //                       var filename = ui.tab.text;
                        var session = sessions.get(ui.panel.id);
                        return exports.doClose(session, true);
                    },
                    select : function(event, ui) {
                        selectTab(ui.panel.id);
                    }
                });
        //		$('#tab_creator').click(function() {
        //			tab_counter += 1;
        //			$('#tabs1').tabs('add', 'blank.txt', 'Tab ' + tab_counter);
        //			return false;
        //		});
    });
    exports.selectIfOpen = function(datastring) {
        var exist = sessions.getByFilename(datastring);
        if (exist) {
            $(tabsDiv).tabs('select', '#' + exist);
            return true;
        } else {
            return false;
        }
    };
});
