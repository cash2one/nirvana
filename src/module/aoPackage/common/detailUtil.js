nirvana.aoPkgControl = nirvana.aoPkgControl || {};

nirvana.aoPkgControl.widget = nirvana.aoPkgControl.widget || {};
/**
 * @param {Array} tableFields 表格的字段
 * @param {Object} extra action的其他属性，非共用部分
 */
nirvana.aoPkgControl.widget.common = {
    /**
     * 获得公共的UI_PROP_MAP
     */
    getUI_PROP_MAP: function(extra) {
        var tableCfg = {
                fields : '*widgetTableFields',
                datasource : '*widgetTableData',
                noDataHtml : FILL_HTML.NO_DATA,
                select : 'multi',
                isSelectAll : 'true',
                noScroll : 'true' // 不需要横向滚动条
            },
            pageCfg = {
                page : '*pageNo',
                total : '*totalPage'
            };

        var map = {
            WidgetTable: tableCfg,
            WidgetPage: pageCfg
        };


        if (extra) {
            for (var key in extra) {
                map[key] = extra[key];
            }
        }
        return map;
    },
    /**
     * CONTEXT_INITER_MAP中公用的init函数
     * 用于初始化各种公用参数
     */
    getInit: function(extra) {
        return function(callback) {
            var me = this,
                tab = me.arg.tab || 0,
                pageNo = me.arg.pageNo || 1,
                opttypeid = me.arg.opttypeid,
                extraObj = me.arg.extra,
                pkgid = me.arg.pkgid,
                appId = me.arg.appId,
                modifiedInfo = me.arg.modifiedInfo || {
                    levelId : '',
                    ids : []
                },
                isModified = me.arg.isModified || false;

            // 将子项action传入公用方法
            nirvana.aoPkgWidgetHandle.init(me);

            me.setContext('tabIndex', tab);
            me.setContext('extra', extraObj);
            me.setContext('opttypeid', opttypeid);
            me.setContext('pkgid', pkgid);
            me.setContext('appId', appId);
            me.setContext('pageNo', pageNo);
            me.setContext('pageSize', nirvana.aoPkgConfig.DETAIL_PAGESIZE);
            me.setContext('isModified', isModified);

            if (me.applyType) {
                me.setContext('applyType', me.applyType[opttypeid]);
            }
            if (me.btn) {
                me.setContext('widget_btn', me.btn[opttypeid]);
            }
            if (me.title) {
                me.setContext(
                    'widget_title',
                    '<span class="return">'
                        + nirvana.aoPkgConfig.SETTING[me.arg.appId.toUpperCase()].name
                        + '</span>'
                        + '<em>&gt;</em>' +me.title[opttypeid]
                );
            }

            // 修改行的id
            me.setContext('modifiedInfo', modifiedInfo);

            if (opttypeid == 302) {
                me.setContext('widget_tipclass', 'hide');
            }

            if (opttypeid != 303) {
                me.setContext('widget_tabclass', 'hide');
                me.setContext('widget_queryclass', 'hide');
            } else {
                // 303的tab 0要隐藏tab
                if (!tab) {
                    me.setContext('widget_queryclass', 'hide');
                }
            }
//            if(opttypeid == 805 || opttypeid == 806){
//                me.setContext('widget_tabclass', 'show');
//                me.setContext('widget_queryclass', 'hide');
//                //me.setContext('widget_selectclass', 'show');
//                //me.setContext('widget_selectclass', 'hide');
//                me.setContext('widget_modifyclass', 'show');
//            }else{
//                //me.setContext('widget_selectclass', 'hide');
//                me.setContext('widget_modifyclass', 'hide');
//            }

            if (extra) {
                for (var key in extra) {
                    me.setContext(key, extra[key]);
                }
            }

            callback();
        }
    },
    /**
     * CONTEXT_INITER_MAP初始化表格
     * @param {Array} tableFields
     */
    getInitTable: function(tableFields) {
        return function(callback) {
            var me = this;

            me.setContext('widgetTableFields', tableFields);

            nirvana.aoPkgWidgetCommon.getDetail(me, function(data) {

                callback();

            });
        }
    },

    /**
     * 行号的数组转成所需数据的数组
     * @param {Array} rows 行号的数组
     * @param {String} fields 【可选】指定的字段
     * @param {Array} data 如果不是getContext('widgetTableData')取值，传入你的数据集
     * @param {boolean} isGetRecmInfo 是否是获取推荐信息
     */
    rows2Data: function(action, rows, field, data/*, isGetRecmInfo*/) {
        var all = data || action.getContext('widgetTableData');

        if (!baidu.lang.isArray(rows)) {
            rows = [rows];
        }

        var ret = [], row, match, temp;
        for (var i = 0, len = rows.length; i < len; i++) {
            row = rows[i];
            if (field) {
//                // 判断是否有缓存的推荐信息，有则使用，无则使用默认:modified by Huiyao 2013.1.15
//                // 由于当前有的优化项能直接修改推荐信息，导致推荐信息丢失，所以做了
//                // 一下缓存，见方法_cacheRecmdInfo,做这个缓存就为了发送监控需要
//                if (isGetRecmInfo && (match = /^(recm.*)/.exec(field))) {
//                    temp = all[row]['_' + match[1]];
//                    if (temp) {
//                        ret.push(temp);
//                        continue;
//                    }
//                }
                ret.push(all[row][field]);
            } else {
                ret.push(all[row]);
            }
        }
        return ret;
    },

    /**
     * 获取当前的masklevel，提供给新的子action
     * 默认为当前层级+1
     */
    getMaskLevel : function() {
        var maskLevel = 1;

        baidu.each(baidu.q('ui_blackmask'), function(item){
            // 只计算当前显示的mask，这里的逻辑应该在mask控件里增加，但是影响太大，只好在这里了
            if (item.style.display != 'none') {
                maskLevel++;
            }
        });
        return maskLevel;
    },

    updateTableData : function(action, index, data){
        var table = action._controlMap.WidgetTable,
            datasource = table.datasource,
            selectedIndex = table.selectedIndex,
        // cachedata = action.getContext('widgetTableData'),
            cachedata = action._controlMap.WidgetTable.datasource,
            i, l, inputId, o;

        if('undefined' !== typeof index && !baidu.lang.isArray(index)){
            index = [index];
        }
        if('undefined' !== typeof data && !baidu.lang.isArray(data)){
            data = [data];
        }

        for(i = 0, l = index.length; i < l; i++){
            if(data[i]){
                baidu.extend(cachedata[index[i]], data[i]);
                baidu.addClass(table.getRow(index[i]), 'ui_table_trmark');

                if(baidu.array.indexOf(selectedIndex, index[i]) == -1){
                    inputId = table.getId('multiSelect' + index[i]);
                    baidu.g(inputId)
                    && (baidu.g(inputId).checked = true);
                    table.selectMulti(index[i]);
                }
            }
        }

        action.setContext('widgetTableData', cachedata);
        table.datasource = cachedata;
        action.setContext('hasInlineRecmModified', true);
        nirvana.aoPkgWidgetHandle.showInlineModWarn('您已经进行了行内修改，需要勾选并点击“' + action.getContext('widget_btn') + '”按钮才能生效。');
    },
    /**
     * @param {Action} action
     * @param {Function} callback
     * @param {Object} extraParams 如果还要传别的参数，通过这个指定
     */
    getDetail: function(action, callback, extraParams) {

        // 特殊逻辑，为了监控需要，在展现详情时，认为一次展现就是一个动作
        nirvana.aoPkgControl.logCenter.actionStepPlus1();

        var me = this,
        // 每页多少条数据
            pageSize = action.getContext('pageSize'),
            opttypeid = action.getContext('opttypeid'),
        // 基本的请求参数
            startindex = (action.getContext('pageNo') - 1) * pageSize,
            endindex = startindex + pageSize - 1,
            optmd5 = action.arg.optmd5,

        // condition字段，主要的查询参数都在这
            condition = {
                startindex : startindex,
                endindex : endindex,
                optmd5 : action.arg.suboptmd5,
                pkgContext : nirvana.aoPkgControl.logCenter.pkgContext,
                actionStep : nirvana.aoPkgControl.logCenter.actionStep,
                recalculate : me.recalculate || 0 // 0表示不重新计算详情，1表示重新计算详情。如果不填，默认为0
            };

        // 如果有特殊的参数，通过extraParams配置
        if (extraParams) {
            for (var key in extraParams) {
                condition[key] = extraParams[key];
            }
        }

        function onSuccess(response) {
            var data = response.data,
                detailresitems = data.detailresitems,
                totalnum = data.totalnum,
                listData = [];

            // 请求成功以后，重置是否需要重新计算
            me.recalculate = 0;

            // 如果当前页没有数据，则返回第一页重新请求
            if (totalnum > 0 && detailresitems.length == 0) {
                if (startindex == 0) { // 如果在第一页，则将totalnum强制置为0
                    totalnum = 0;
                } else {
                    action.setContext('pageNo', 1);
                    me.getDetail(action, callback, extraParams);
                    return;
                }
            }

            baidu.each(detailresitems, function(item){
                listData.push(item.data);
            });

            // 设置提示信息
            if (action.tip) {
                var tip = action.tip[opttypeid];
                action.setContext('widget_tip', tip.replace(/%count/, totalnum));
            }
            // 计算总页数
            var totalPage = Math.ceil(data.totalnum / pageSize);
            // 保持原有逻辑，最大为100页
            totalPage = Math.min(totalPage, nirvana.aoPkgConfig.MAX_PAGE);
            action.setContext('totalPage', totalPage);
            // 设置表格数据
            action.setContext('widgetTableData', listData);

            callback(data);
        }

        var params = {
            level: 'useracct',
            opttypeid: opttypeid,
            optmd5 : optmd5,
            condition: condition,

            onSuccess: onSuccess,
            onFail: function(){
                ajaxFailDialog();
                callback();
            }
        };

        fbs.nikon.getDetail(params);
    }
};

nirvana.aoPkgWidgetCommon = nirvana.aoPkgControl.widget.common;