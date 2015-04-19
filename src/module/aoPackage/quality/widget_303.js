/**
 * @author: zhujialu
 * @deprecated
 */
nirvana.aoPkgControl.widget303 = new er.Action({
    VIEW: 'aoPkgDetail',

    tip: {
        303: '加底色（粉色）的关键词或创意最近3天内优化过，建议观察一段时间的网民点击情况，再做调整',
        304: '加底色（粉色）的关键词或创意最近3天内优化过，建议观察一段时间的网民点击情况，再做调整'
    },
    fields: {
        303: {
            0: [
                {
                    content: function(data) {
                        return lib.idea.getIdeaCell(data);
                    },
                    title : '创意',
                    field: 'title',
                    width: 600,
                    minWidth: 600
                },
                {
                    content : function(data) {
                        var words = eval(data.showword), word, ret = '<div class="effected_words">';

                        for (var i = 0, len = words.length; i < len; i++) {
                            word = words[i];
                            word = '<span title="' + word + '">' + getCutString(word, 22, '...') + '</span>';
                            ret += word;
                        }
                        ret += '</div>';

                        return ret;
                    },
                    title: '影响的关键词',
                    field: 'words',
                    width: 300
                }
            ],
            1: [
                {
                    content: function(item) {
                        var opttype = 303;//this.arg.opttypeid;
                        return lib.field.wordinfo_decrease(23, opttype)(item);
                    }, 
                    title : '关键词'
                },
                {
                    // wanghuijun 2012.11.30
                    // 解除与手动版ao的依赖
                    // content : nirvana.aoWidgetRender.planinfo(23),
                    content : lib.field.getPlanRenderer(23),//nirvana.aoPkgWidgetRender.planinfo(23),
                    title : '推广计划'
                },
                {
                    // wanghuijun 2012.11.30
                    // 解除与手动版ao的依赖
                    // content : nirvana.aoWidgetRender.unitinfo(23),
                    content : lib.field.getUnitRenderer(23), //nirvana.aoPkgWidgetRender.unitinfo(23),
                    title : '推广单元'
                },
                qStar.getTableField({ VIEW: 'QualityPkg' }),
                {
                    content: function() {
                        return '<a act="optimizeIdea">优化创意</a>';         
                    },
                    title : '操作'
                }
            ]
    
        }
    },
    dict: {
        11: '较易优化', 
        12: '优化难度中等',
        13: '较难优化',
        21: '较易优化', 
        23: '较难优化' 
    },
    UI_PROP_MAP: {
        WidgetTab: {
           title: '*tabTitle',
           container: '*tabContainer'
        },
        WidgetTable: {
            fields : '*widgetTableFields',
            datasource : '*widgetTableData',
            noDataHtml : FILL_HTML.NO_DATA
        },
        WidgetPage: {
            page : '*pageNo',
            total : '*totalPage'
        }
    },
    CONTEXT_INITER_MAP: {
        init: nirvana.aoPkgWidgetCommon.getInit({
            opttype_class: 'opttype_303'
        }),
        initTitle: function(callback) {
            var title = '优化创意（',
                star = this.getStarNumber();
            // 加上几星
            if (star > 10 && star < 20) {
                title += '一星';
            } else if (star > 20 && star < 30) {
                title += '二星';
            }
            // 加上优化难度
            title += this.dict[star] + '）';

            // this.setContext('widget_title', title);
            this.setContext(
                'widget_title', 
                '<span class="return">'
                    + nirvana.aoPkgConfig.SETTING[this.arg.appId.toUpperCase()].name
                    + '</span>'
                    + '<em>&gt;</em>' + title
            );
            callback();
        },
        setPageSize: function(callback) {
            var tab = this.getContext('tabIndex');
            if (tab == 0) {
                this.setContext('pageSize', 5);
            }
            callback();
        },
        initTab: function(callback) {
            this.setContext('tabTitle', ['创意', '关键词']);
            callback();
        },
        initTable: function(callback) {
            var me = this,
                opttypeid = me.getContext('opttypeid'),
                tableFields = me.fields[opttypeid],
                extra = this.getContext('extra');
            
            // 需要从tabFields[tab]取值
            var tab = this.getContext('tabIndex');
            tableFields = tableFields[tab];
            
            // 获得几星词
            if (!extra) {
                var star = this.getStarNumber();
                extra = tab == 0 ? {extra: star + '_idea'} : {extra: star + '_word'};
            } else {
                // 如果已经有参数，肯定是304
                me.setContext('opttypeid', 304);
            }
            
            me.setContext('widgetTableFields', tableFields);

            nirvana.aoPkgWidgetCommon.getDetail(me, function(data) {
                var items = data.detailresitems;
                baidu.each(items, function(item){
                    var data = item.data;
                    data.showqstat = me.getStarNumber();
                    if (data.isopted == 1) {
                        if (tab == 1) {
                            nirvana.aoPkgWidgetHandle.setModifiedInfo('winfoid', data.winfoid);
                        } else {
                            nirvana.aoPkgWidgetHandle.setModifiedInfo('ideaid', data.ideaid);
                        }
                    }
                });
                if (tab == 1) {
                    var beginDate;
                    if (data.commData && (beginDate = data.commData.begindate)) {
                        beginDate = +beginDate;
                        if (typeof beginDate === 'number') {
                            // wanghuijun 2012.12.03
                            // 效果突降下线
                            if (nirvana.decrControl) {
                                nirvana.decrControl.beginDate = new Date(beginDate);
                            } else {
                                nirvana.decrControl = {
                                    beginDate : new Date(beginDate)
                                }
                            }
                            
                        }
                    }
                }
                callback();
            }, extra);
        }
    },

    onentercomplete: function() {
        var me = this;

        // Modified by Wu Huiyao 解决因为修改lib.delegate的事件绑定方式引入的bug
        var delegateElem = ui.util.get('WidgetTable').main.parentNode;
        lib.delegate.init(delegateElem, me);
        nirvana.aoPkgWidgetHandle.basicClickHandler(me);

        var tab = ui.util.get('WidgetTab'),
            tabIndex = this.getContext('tabIndex');
        tab.select(tabIndex);
        tab.onselect = function(value) {
            me.setContext('tabIndex', value);
            me.setContext('extra', null);
            me.setContext('pageNo', 1);
            nirvana.aoPkgControl.widget.handle.refresh();
        };

        // 隐藏按钮
        ui.util.get('WidgetApply').main.style.display = 'none';

        if (tabIndex == 1) {
            var input = ui.util.get('WidgetQueryInput');
            ui.util.get('WidgetQueryBtn').onclick = function() {
                var value = input.getValue();
                if (baidu.trim(value) === '') {
                    return;
                }
                
                var extra = me.getStarNumber() + '_' + value;
                me.setContext('extra', {extra: extra});
                me.setContext('pageNo', 1);
                
                nirvana.aoPkgControl.logCenter.extend({
                    searchstr : value,
                    showqstat : me.getStarNumber(),
                    opttypeid : me.getContext('opttypeid')
                }).sendAs('nikon_search_dosearch');
                
                me.refresh();
            };
            
            $$('.aopkg_widget_query > a')[0].onclick = function() {
                me.setContext('extra', null);
                me.setContext('pageNo', 1);
                nirvana.aoPkgControl.logCenter.extend({
                    showqstat : me.getStarNumber(),
                    opttypeid : me.getContext('opttypeid')
                }).sendAs('nikon_search_cancelsearch');
                me.refresh();
            };
        }
        
    },
    refresh: function() {
        nirvana.aoPkgControl.widget.handle.refresh();
    },
    /**
     * @param {HTMLElement}
     */
    editIdea: function() {
         var me = this,
             curRow = ui.util.get('WidgetTable').curRow,
            dataItem = nirvana.aoPkgWidgetCommon.rows2Data(this, curRow)[0];

         dataItem.maskLevel = nirvana.aoPkgWidgetCommon.getMaskLevel();

         this.request(dataItem.ideaid, function(words, reason) {
            if (words) {
                dataItem.wordref = {
                    show: true,
                    source: words
                };
            }
            if (reason && reason != 0) {
                var reasonArr = lib.idea.getDiagnosisText(reason);

                dataItem.tip = {
                    show: true,
                    title: '诊断结果',
                    content: (function() {
                        var html = '';
                        baidu.each(reasonArr, function(item) {
                            html += '<p>' + item + '</p>';
                        });
                        return html;
                    })()
                };
            }
            dataItem.type = 'saveas';
            
            dataItem.opttypeid = 303;
            
            // 监控
            nirvana.aoPkgControl.logCenter.extend({
                action_type : 0,
                planid : dataItem.planid || 0,
                unitid : dataItem.unitid || 0,
                ideaid : dataItem.ideaid,
                ideastat : dataItem.ideastat,
                pausestat : dataItem.pausestat,
                opttypeid : dataItem.opttypeid,
                showqstat : dataItem.showqstat,
                winfoid : dataItem.winfoid,
                showword : dataItem.showword
            }).sendAs('nikon_modifyidea_modasnew');
            
            dataItem.entranceType = 'aoPackage';
            dataItem.highsaveas = true;
            dataItem.fromSubAction = true;
            lib.idea.editIdea(dataItem, function() {
                nirvana.aoPkgWidgetHandle.hasModified();
                me.refresh();
             });
         })
    },
    optimizeIdea: function() {
        this.editIdea();
    },

    switchShadow: function() {
        var table = ui.util.get('WidgetTable'),
            curRow = table.getRow(table.curRow),
            idea = nirvana.aoPkgWidgetCommon.rows2Data(this, table.curRow)[0]; 
        
        // 获得单元格
        var cells = $$('.ui_table_tdcell', curRow);
        cells = [cells[0]];

        lib.idea.switchShadow(idea, cells);
    },
    /**
     * 返回11，12，13，21，23之类的质量度
     */
    getStarNumber: function() {
        var params = this.arg.params, star;
        for (var key in params) {
            // if key starts with 'word_cnt'
            if (key.indexOf('word_cnt') === 0) {
                star = key.substr(9);
                break;
            }
        }
        return star;
    },

    // 请求创意诊断的数据
    request: function(ideaid, callback) {
        var params = {
            level: 'useracct',
            opttypeid: 305,
			condition: {
                extra: ideaid,
                recalculate: 1
            },
			
			onSuccess: function(json) {
                if (json.data 
                    && json.data.detailresitems
                    && json.data.detailresitems[0]) {
                    
                    var data = json.data.detailresitems[0].data,
                        winfoids = data.winfoids.split(','),
                        showword = eval(data.showword),
                        reason = data.reason,
                        wordList = [];

                    for (var i = 0, len = showword.length; i < len; i++) {
                        wordList.push({
                            winfoid: winfoids[i] || 0,
                            showword: showword[i]
                        });
                    }
                    if (wordList.length === 0) {
                        wordList = null;
                    }

                    callback(wordList, reason);
                } else {
                    callback();
                }
            },
			onFail: function() {
                callback();
			}
        };

		fbs.nikon.getDetail(params);
    }
});
