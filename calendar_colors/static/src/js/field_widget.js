odoo.define('calendar_colors.int_color', function (require) {
    "use strict";
    console.log('====color widget init====');
    var AbstractField = require('web.AbstractField');
    var fieldRegistry = require('web.field_registry');

    var ColorField = AbstractField.extend({
        className: 'o_int_colorpicker',
        tagName: 'span',
        supportedFieldTypes: ['integer'],
        events: {
            'click .o_color_pill': 'clickPill',
        },
        init: function () {
            this.totalColors = 24;
            this._super.apply(this, arguments);
            
        },
        _renderEdit: function () {
            this.$el.empty();
            for (var i = 0; i < this.totalColors; i++ ) {
                var className = "o_color_pill o_int_color_" + i;
                if (this.value === i ) {
                    className += ' active';
                }
                this.$el.append($('<span>', {
                    'class': className,
                    'data-val': i,
                }));
            }
        },
        _renderReadonly: function () {
            var className = "o_color_pill active readonly o_int_color_" + this.value;
            this.$el.append($('<span>', {
                'class': className,
            }));
        },
        clickPill: function (ev) {
            var $target = $(ev.currentTarget);
            var data = $target.data();
            this._setValue(data.val.toString());
        }

    });



    fieldRegistry.add('int_color', ColorField);

    return {
        colorField: ColorField,
    };
    });
