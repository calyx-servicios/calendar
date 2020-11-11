odoo.define('calendar_colors', function (require) {
    "use strict";
    console.log('========Calendar Colors=====')

    var core = require('web.core');
    var time = require('web.time');
    var _t  = core._t;

    var CalendarView = require('web.CalendarView');
    var CalendarRenderer = require('web.CalendarRenderer');
    var CalendarModel = require('web.CalendarModel');
    var fieldUtils = require('web.field_utils');

    var AbstractService = require('web.AbstractService');
    var session = require('web.session');
    
    CalendarModel.include({
        load: function (handle, params) {
            console.log('Load ====== Init')
            var response=this._super.apply(this, arguments);
            console.log('Load Response====',response)
            
            return response
        },
        reload: function (handle, params) {
            console.log('Reload ====== Init')
            var response=this._super.apply(this, arguments);
            console.log('Reload After====')
            return response
        },
        init: function (parent, state, params) {
            console.log('Render ====== Init')
            var response= this._super.apply(this, arguments);
            console.log('Initial Color Map ====== Init')
            return response

        },
        _loadColors: function (element, events) {
            console.log('Load Colors ====== Init')
            console.log(element)
            console.log(events)
            var response= this._super.apply(this, arguments);
            console.log('After Load Colors =====')
            return response
            
        },

        changeFilter: function (filter) {
            console.log('ChangeFilter ====== Init')
            console.log(filter)
            var response= this._super.apply(this, arguments);
            console.log('After ChangeFilter=====')
            return response
        },

        
        _loadRecordsToFilters: function (element, events) {
            console.log('LoadFilters ====== Init')
            console.log('Element',element)
            console.log('Events',events)
            console.log('Filters:',this.data.filters)
            console.log('Res:',this.data.res)
            var self = this;
            var new_filters = {};
            var to_read = {};

            _.each(this.data.filters, function (filter, fieldName) {
                var field = self.fields[fieldName];

                new_filters[fieldName] = filter;
                if (filter.write_model) {
                    if (field.relation === self.model_color) {
                        _.each(filter.filters, function (f) {
                            f.color_index = f.value;
                        });
                    }
                    return;
                }

                _.each(filter.filters, function (filter) {
                    filter.display = !filter.active;
                });

                var fs = [];
                var undefined_fs = [];
                _.each(events, function (event) {
                    var data =  event.record[fieldName];
                    if (!_.contains(['many2many', 'one2many'], field.type)) {
                        data = [data];
                    } else {
                        to_read[field.relation] = (to_read[field.relation] || []).concat(data);
                    }
                    _.each(data, function (_value) {
                        var value = _.isArray(_value) ? _value[0] : _value;
                        var color_index_bkp=value
                        _.each(self.data.data.res, function(calendar_color) {
                            if (calendar_color['color']==value){
                                value=calendar_color['id']
                            }
                        })

                        var f = {
                            'color_index': self.model_color === (field.relation || element.model) ? color_index_bkp : false,
                            'value': value,
                            'label': fieldUtils.format[field.type](_value, field) || _t("Undefined"),
                            'avatar_model': field.relation || element.model,
                        };
                        // if field used as color does not have value then push filter in undefined_fs,
                        // such filters should come last in filter list with Undefined string, later merge it with fs
                        value ? fs.push(f) : undefined_fs.push(f);
                    });
                });
                _.each(_.union(fs, undefined_fs), function (f) {
                    var f1 = _.findWhere(filter.filters, f);
                    if (f1) {
                        f1.display = true;
                    } else {
                        f.display = f.active = true;
                        filter.filters.push(f);
                    }
                });
            });

            var defs = [];
            _.each(to_read, function (ids, model) {
                defs.push(self._rpc({
                        model: model,
                        method: 'name_get',
                        args: [_.uniq(ids)],
                    })
                    .then(function (res) {
                        to_read[model] = _.object(res);
                    }));
            });
            return $.when.apply($, defs).then(function () {
                _.each(self.data.filters, function (filter) {
                    if (filter.write_model) {
                        return;
                    }
                    if (filter.filters.length && (filter.filters[0].avatar_model in to_read)) {
                        _.each(filter.filters, function (f) {
                            f.label = to_read[f.avatar_model][f.value];
                        });
                    }
                });
            });
        },


        _getCalendarColors: function (events) {
            console.log('_getCalendarColors =====')
            var self = this;
            var calendar_ids=[]
            _.each(events, function(event) {
                    console.log('event:',event)
                    var calendar_id=event['calendar_id']
                    console.log('event calendar_id:',calendar_id)
                    calendar_ids.push(calendar_id[0])
                });
            return $.when(self._rpc({
                model: 'calendar.calendar',
                method: 'search_read',
                domain: [["id", "=", calendar_ids]]
                //fields: ['color'],
            }).then(function (res) {
                //The calendar colors are stored because we need it to render 
                //filters on the sidebar too
                self.data.data.res=res
                console.log('REAL CALENDAR SEARCH RESULT?',self.data.data.res)
                console.log('Filter Stuff to change=>',self.data.filters)
                console.log('Showing data ======');
                var addEvent= function(element,index,array){
                    
                    console.log('array=>',array)
                    console.log('index=>',index)
                    console.log('element',element)
                    console.log('record.calendar_id?',element['record']['calendar_id'])
                    _.each(self.data.data.res, function(calendar_color) {
                        if (calendar_color['id']==element['record']['calendar_id'][0]){
                            element['record']['calendar_id'][0]=calendar_color['color']
                            array[index] = element
                        }
                    })
                    
                    
                };
                self.data.data.forEach(addEvent);
                
                _.each(self.data.data, function(event) {
                    console.log('event=>',event)
                    console.log('color_index=>',event['record'])
                    console.log('color_index=>',event['record']['calendar_id'])
                })
                return $.when(

                    self._loadColors(self.data, self.data.data),
                    self._loadRecordsToFilters(self.data, self.data.data)
                );

            }));
            
                
           
        },

        _loadCalendar: function () {
            console.log('_LoadCalendar Befor RPC call ====== Init')
            var self = this;
            this.data.fullWidth = this.call('local_storage', 'getItem', 'calendar_fullWidth') === 'true';
            this.data.fc_options = this._getFullCalendarOptions();
    
            var defs = _.map(this.data.filters, this._loadFilter.bind(this));
    
            return $.when.apply($, defs).then(function () {
                return self._rpc({
                        model: self.modelName,
                        method: 'search_read',
                        context: self.data.context,
                        fields: self.fieldNames,
                        domain: self.data.domain.concat(self._getRangeDomain()).concat(self._getFilterDomain())
                })
                .then(function (events) {
                    console.log('After Loading Data ======')
                    self._parseServerData(events);
                    self.data.data = _.map(events, self._recordToCalendarEvent.bind(self));
                    //Here The original code was replaced to obtain stored color field from calendar_id field.
                    return $.when(self._getCalendarColors(events)); 
                    
                });
            });
        },
   
    })


    CalendarRenderer.include({

        getColor: function (key) {
            console.log('getColor ====== Key',key)
            return key;
        },

        init: function (parent, state, params) {
            console.log('Render ====== Init')
            this._super.apply(this, arguments);
            console.log('Initial Color Map ====== Init',this.color_map)
        },
        
        _render: function () {
            console.log('Render ======')
            var render= this._super.apply(this);
            console.log('Render After Super======')
            return render;
        },
        _initCalendar: function () {
            console.log('Init Calendar ======')
            var init_calendar= this._super.apply(this);
            console.log('Init Calendar After Super======')
            return init_calendar;
        },

    });


});

