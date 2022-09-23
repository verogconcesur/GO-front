(function(factory) {
    /* global define */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        factory(window.jQuery);
    }
}(function($) {

    /**
     * @class plugin.macro-dropdown
     *
     * Initialize in the toolbar like so:
     *   toolbar: ['insert', ['macroList']]
     *
     * Ultimus Custom Macro Plugin
     */
    $.extend($.summernote.plugins, {
        /**
         * @param {Object} context - context object has status of editor.
         */
        'macroList': function(context) {
            var self = this;

            var options = context.options.macroList;
            var defaultOptions = {
              label: '<div class="" style="display: flex; justify-content: center; align-items: center; margin: 1px 0; font-size: .90em;"><i>(x)</i><span style="padding-left: 7px" class="note-icon-caret"></span></div>',
              tooltip: "Insert Macro",
              blockChar : ['[', ']'],
            };
      
            // Assign default values if not supplied
            for (var propertyName in defaultOptions) {
              if (options && options.hasOwnProperty(propertyName) === false) {
                options[propertyName] = defaultOptions[propertyName];
              }
            }
            
            // ui has renders to build ui elements.
            //  - you can create a button with `ui.button`
            var ui = $.summernote.ui;

            // add macro toolbar button
            context.memo('button.macroList', function() {
                var list = "";
                return ui.buttonGroup([
                    ui.button({
                        className: 'dropdown-toggle',
                        contents: options.label,
                        // tooltip: options.tooltip,
                        // container: 'div.note-editor.note-frame',
                        // target: 'div.note-editor.note-frame',
                        data: {
                            toggle: 'dropdown'
                        },
                        click: function () {
                            context.invoke('editor.saveRange');
                        }
                    }),
                    ui.dropdown({
                        className: 'dropdown-style',
                        items: options.items,
                        //contents: list,
                        callback: function($dropdown) {
                          /*
                            $dropdown.find('i').each(function() {
                                $(this).click(function() {
                                    addimg($(this).attr("class"));
                                });
                            });
                            */
                        },
                        click: function (event) {
                          event.preventDefault();
                          
                          var $button = $(event.target);
                          var value   = $button.data('value');
                          var text = options.blockChar[0] + value + options.blockChar[1];
                          context.invoke('editor.insertText', text);
                          
                        //   console.log('$dropdown click : ' + options.blockChar[0] + value + options.blockChar[1]);
                        }
                    })
                ]).render();
            });
        }
    });

}));