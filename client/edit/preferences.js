define(function(require, exports, module) {
    
    var net = require("ace/lib/net");
    var modes = require('modes');
    var save = require('save');
    var viM = require("ace/keyboard/keybinding/vim");
    var emacS = require("ace/keyboard/keybinding/emacs");
    var hashHandler = require("ace/keyboard/hash_handler");

    var vim = viM.Vim;
    var emacs = emacS.Emacs;
    var HashHandler = hashHandler.HashHandler;

    var keybindings = {
      // Null = use "default" keymapping
      ace: null,
      vim: vim,
      emacs: emacs,
      // This is a way to define simple keyboard remappings
      custom: new HashHandler({
          "gotoright": "Tab"
      })
    };

    var modeEl = document.getElementById("mode");
    var wrapModeEl = document.getElementById("soft_wrap");
    var themeEl = document.getElementById("theme");
    var selectStyleEl = document.getElementById("select_style");
    var highlightActiveEl = document.getElementById("highlight_active");
    var showHiddenEl = document.getElementById("show_hidden");
    var showGutterEl = document.getElementById("show_gutter");
    var showPrintMarginEl = document.getElementById("show_print_margin");
    var highlightSelectedWordE = document.getElementById("highlight_selected_word");
    var showHScrollEl = document.getElementById("show_hscroll");
    var softTabEl = document.getElementById("soft_tab");
    var behavioursEl = document.getElementById("enable_behaviours");
    
    var updateUIEditorOptions = function() {
        var editor = env.editor;
        var session = editor.session;

        var mode = session.getMode();
        modeEl.value = modes.getStringFromMode(mode);

        if (!session.getUseWrapMode()) {
            wrapModeEl.value = "off";
        } else {
            wrapModeEl.value = session.getWrapLimitRange().min || "free";
        }

        selectStyleEl.checked = editor.getSelectionStyle() === "line";
        themeEl.value = editor.getTheme();
        highlightActiveEl.checked = editor.getHighlightActiveLine();
        showHiddenEl.checked = editor.getShowInvisibles();
        showGutterEl.checked = editor.renderer.getShowGutter();
        showPrintMarginEl.checked = editor.renderer.getShowPrintMargin();
        highlightSelectedWordE.checked = editor.getHighlightSelectedWord();
        showHScrollEl.checked = editor.renderer.getHScrollBarAlwaysVisible();
        softTabEl.checked = session.getUseSoftTabs();
        behavioursEl.checked = editor.getBehavioursEnabled();
    };
    
    function bindCheckbox(id, callback) {
        var el = document.getElementById(id);
        var onCheck = function() {
            callback(!!el.checked);
        };
        el.onclick = onCheck;
        onCheck();
    }

    function bindDropdown(id, callback) {
        var el = document.getElementById(id);
        var onChange = function() {
            callback(el.value);
        };
        el.onchange = onChange;
        onChange();
    }
    
    setupCallbacks = function() {
        var editor = env.editor;

        bindDropdown("mode", function(value) {
            editor.getSession().setMode(modes.getModeForMenu(value));
        });

        bindDropdown("theme", function(value) {
            if (window.require.packaged) {
                loadTheme(value, function() {
                    env.editor.setTheme(value);
                });
            }
            else {
                env.editor.setTheme(value);
            }
        });

        bindDropdown("keybinding", function(value) {
            editor.setKeyboardHandler(keybindings[value]);
        });

        bindDropdown("fontsize", function(value) {
            env.split.setFontSize(value);
        });

        bindDropdown("soft_wrap", function(value) {
            var session = editor.getSession();
            var renderer = editor.renderer;
            switch (value) {
            case "off":
                session.setUseWrapMode(false);
                renderer.setPrintMarginColumn(80);
                break;
            case "40":
                session.setUseWrapMode(true);
                session.setWrapLimitRange(40, 40);
                renderer.setPrintMarginColumn(40);
                break;
            case "80":
                session.setUseWrapMode(true);
                session.setWrapLimitRange(80, 80);
                renderer.setPrintMarginColumn(80);
                break;
            case "free":
                session.setUseWrapMode(true);
                session.setWrapLimitRange(null, null);
                renderer.setPrintMarginColumn(80);
                break;
            }
        });

        bindCheckbox("select_style", function(checked) {
            editor.setSelectionStyle(checked ? "line" : "text");
        });

        bindCheckbox("highlight_active", function(checked) {
            editor.setHighlightActiveLine(checked);
        });

        bindCheckbox("show_hidden", function(checked) {
            editor.setShowInvisibles(checked);
        });

        bindCheckbox("show_gutter", function(checked) {
            editor.renderer.setShowGutter(checked);
        });

        bindCheckbox("show_print_margin", function(checked) {
            editor.renderer.setShowPrintMargin(checked);
        });

        bindCheckbox("highlight_selected_word", function(checked) {
            editor.setHighlightSelectedWord(checked);
        });

        bindCheckbox("show_hscroll", function(checked) {
            editor.renderer.setHScrollBarAlwaysVisible(checked);
        });

        bindCheckbox("soft_tab", function(checked) {
            editor.getSession().setUseSoftTabs(checked);
        });
        
        bindCheckbox("enable_behaviours", function(checked) {
            editor.setBehavioursEnabled(checked);
        });
        
        var saveAllIntervalHandle = null;
        bindDropdown("automatic_saveall", function(value) {
            if (saveAllIntervalHandle) {  // clear any existing intervals
                clearInterval(saveAllIntervalHandle);
                saveAllIntervalHandle = null;
            }
            if (value !== "off") {
                var seconds = parseInt(value, 10);
                saveAllIntervalHandle = setInterval(function() {
                    save.saveAll(); }, seconds * 1000);
//                    save.saveAll.call(save); }, seconds * 1000);
            }
        });

        var secondSession = null;
        bindDropdown("split", function(value) {
            var sp = env.split;
            if (value === "none") {
                if (sp.getSplits() === 2) {
                    secondSession = sp.getEditor(1).session;
                }
                sp.setSplits(1);
            } else {
                var newEditor = (sp.getSplits() === 1);
                if (value === "below") {
                    sp.setOriantation(sp.BELOW);
                } else {
                    sp.setOriantation(sp.BESIDE);
                }
                
                sp.setSplits(2);

                if (newEditor) {
                    var session = secondSession || sp.getEditor(0).session;
                    var newSession = sp.setSession(session, 1);
                    newSession.name = session.name;
                }
            }
        });
    };
    
    exports.init = function() {
        setupCallbacks();  // need to wait for edit.js launch to bind
    };
    exports.run = function() {  
        var dialogId = "#edit_preferences";

        $(dialogId).dialog({
            autoOpen: true,
            draggable: true,
            resizable: true,
            width: 450,
            title: "Editor Preferences",
            buttons: {
                "Close": function() {
                    $(dialogId).dialog('close');
                    return false;
                }
            }
        });
    };
    exports.update = function() {
        updateUIEditorOptions();
    };

    var themes = {};
    function loadTheme(name, callback) {
        if (themes[name]) {
            callback();
            return;
        }
            
        themes[name] = 1;
        var base = name.split("/").pop();
        var fileName = "src/theme-" + base + ".js";
        net.loadScript(fileName, callback);
    }
});