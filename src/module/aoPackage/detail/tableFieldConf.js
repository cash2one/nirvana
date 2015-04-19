/**
 * 优化项详情表格fields配置
 */
nirvana.aoPkgControl.widget.fields = {
    /**
     * 计划列
     */
    planinfo: nirvana.tableUtil.getPlanConf,

    /**
     * 单元列
     */
    unitinfo: nirvana.tableUtil.getUnitConf,

    /**
     * 关键词列
     */
    wordinfo: nirvana.tableUtil.getWordConf,

    /**
     * 带有气泡信息的关键词列：气泡用于显示该关键词所属的计划和单元
     * @param param
     * @returns {Object}
     */
    wordinfoWithBubble: function (param) {
        param = param || {};
        var maxLen = param.length || 30;
        var width = param.width || 130;
        return {
            title: '关键词',
            content: function (item) {
                var showword = baidu.encodeHTML(item.showword);

                return '<span class="ui_bubble"  bubblesource="aoPkgTableWordInfo" '
                    +      'index="' + item.winfoid + '" '
                    +      'level="unit" ' + 'planname="' + item.planname + '" '
                    +      'unitname="'+ item.unitname + '" '
                    +      'name="' + showword + '">'
                    +       getCutString(showword, maxLen, '...')
                    + '</span>';
            },
            width: width
        };
    },

    /**
     * 添加关键词列
     */
    addword: function(param){
        param = param || {};
        var length = param.length;
        var width = param.width || 100;
        var title = param.title || '关键词'; // modified by Huiyao 2013.1.10，增加标题定制
        return {
            content: nirvana.aoPkgWidgetRender.addword(length),
            title: function() {
                // WordListSelectCount中存放关键词数量
                // 这里不能直接设置title为含标签的字符串，会导致表头宽度错误
                // 所以采用function的方式
                var html = [];

                html.push(title + '（<span id="WordListSelectCount">');
                // 浏览器resize的时候，表格会重新渲染，导致表头数字会消失
                // 在渲染函数里，直接判断表格的选中数量。。。
                // del by Huiyao 重写为如下形式,不至于依赖特定表格实例 2013.2.26
//                if (ui.util.get("WidgetTable")) {
//                    html.push(ui.util.get("WidgetTable").selectedIndex.length);
//                }
                html.push((this.selectedIndex || []).length);
                html.push('</span>）');

                return html.join('');
            },
            width: width
        };
    },

    /**
     * 较短的目标计划单元
     */
    addshorttarget: function(){
        return {
            content: function(item, row, col){
                var html = [];
                html[html.length] = '<div class="inlineeditable_shortTarget">';
                html[html.length] = '<div class="edit_td" row=' + row + ' unitid=' + item.unitid + ' planid=' + item.planid + '>';
                html[html.length] = '<div class="aopkg_detail_shortTarget">' + nirvana.aoPkgWidgetRender.addtarget(9)(item) + '</div>';
                html[html.length] = '<a class="edit_btn" edittype="addTarget"></a>';
                html[html.length] = '</div>';
                html[html.length] = '</div>';
                return html.join('');
            },
            title: '目标计划和单元',
            width: 150
        }
    },
    /**
     * 出价
     *
     * @param {Object} options 选项
     */
    bid: nirvana.tableUtil.getBidConf,

    /**
     * 建议出价,默认不可编辑
     */
    recmbid: nirvana.tableUtil.getRecmBidConf,

    /**
     * 可行内修改的建议出价
     */
    recmbid_editable : function(param){
        (param = param || {}).editable = true;
        return nirvana.aoPkgWidgetFields.recmbid(param);
    },
    /**
     * 账户内低展现词域配置
     * @return {Object}
     */
    lowPresentWord: function() {
        return {
            content: nirvana.aoPkgWidgetRender.lowPresentWord,
            title: '账户内低展现词',
            width: 125,
            stable: true
        };
    },

    /**
     * 检索量低/下降关键词域配置
     * @param {Object} param 定制参数，当前提供标题和宽度定制，宽度默认180
     * @return {Object}
     */
    lowSearchWord: function(param) {
        return {
            content: nirvana.aoPkgWidgetRender.lowSearchWord,
            title: param.title,
            width: param.width || 180,
            stable: true
        };
    },

    /**
     * 建议原因
     */
    reason: function (param){
        param = param || {};
        return {
            content: nirvana.aoPkgWidgetRender.reason,
            title: '建议原因',
            width: param.width || 200
        };
    },

    /**
     * 匹配模式
     *
     * @param {Object} options 选项
     */
    wmatch: nirvana.tableUtil.getWmatchConf,

    /**
     * 建议匹配
     */
    recmwmatch: nirvana.tableUtil.getRecmWmatchConf,

    /**
     * 建议匹配
     */
    recmwmatch_editable: function(param){
        (param = param || {}).editable = true;
        return nirvana.aoPkgWidgetFields.recmwmatch(param);
    },

    /**
     * 关键词匹配模式变化
     * @return {Object}
     */
    wmatchChange: function() {
        return {
            content: function(item) {
                var beginwmatch = item.beginwmatch,
                    endwmatch = item.endwmatch,
                    html = [];

                html[html.length] = '<span>' + MTYPE[beginwmatch] + '</span>';
                html[html.length] = '<span class="decr_arrow"></span>';
                html[html.length] = '<span>' + MTYPE[endwmatch] + '</span>';
                return html.join('');
            },
            title: '匹配变化',
            width: 9
        };
    },

    /**
     * 期初展现量
     */
    beginvalue: function(param){
        param = param || {};
        param.decrtype = param.decrtype || '展现量';
        var width = param.width || 100;
        var conf = {
            content: 'beginvalue',
            title: '%begindate' + param.decrtype,
            width: width,
            align: 'right',
            stable : true
        };

        // 重写过的详情使用如下方式来渲染标题，通过newversion来区分，等全部替换为新的时候，
        // 可以去掉这种写法
        if (param.newversion) {
            conf.title = function() {
                var me = this;
                var beginDate = me.beginDate || '-月-日';
                return beginDate + param.decrtype;
            };
        }
        return conf;
    },
    /**
     * 期末展现量
     */
    endvalue: function(param){
        param = param || {};
        param.decrtype = param.decrtype || '展现量';
        var width = param.width || 100;
        var conf = {
            content: 'endvalue',
            title: '%enddate' + param.decrtype,
            width: width,
            align: 'right',
            stable : true
        };

        // 重写过的详情使用如下方式来渲染标题，通过newversion来区分，等全部替换为新的时候，
        // 可以去掉这种写法
        if (param.newversion) {
            conf.title = function() {
                var me = this;
                var endDate = me.endDate || '-月-日';
                return endDate + param.decrtype;
            };
        }

        return conf;
    },
    /**
     * 展现量下降
     */
    decr: function(param){
        param = param || {};
        param.decrtype = param.decrtype || '展现量';
        var width = param.width || 85;
        return {
            content: 'decr',
            title: param.decrtype + '下降',
            width: width,
            align: 'right',
            field: 'decr',
            stable : true
        };
    },

    /**
     * 暂停状态
     */
    pausestat : function(param){
        param = param || {};
        var width = param.width || 90;
        var level = param.level;
        return {
            content: nirvana.aoPkgWidgetRender.pauseState(level),
            title: '状态',
            width: width,
            stable : true
        }
    },
    /**
     * 暂停建议域配置
     * @return {Object}
     */
    pauseSuggest: function() {
        return {
            content: function(item) {
                return '启用';
            },
            title: '建议',
            width: 90,
            stable: true
        };
    },
    /**
     * 日均搜索量
     */
    pv : function(param){
        param = param || {};
        var width = param.width || 100;
        return{
            field : 'pv',
            title : param.title || '日均搜索量',
            content : function(item){
                return nirvana.util.translatePv(item.dailypv);
            },
            width : width,
            stable : true
        }
    },
    /**
     * 竞争激烈程度
     */
    kwc : function(param){
        param = param || {};
        var width = param.width || 100;
        return{
            field : 'kwc',
            title : '竞争激烈程度',
            align : 'left',
            content : lib.field.getBarRenderer('kwc'),
            width : width,
            stable : true
        }
    },
    /**
     * 建议原因，推左次数变化
     * @param {Object} field定制的配置选项，当前只支持width
     */
    leftChangeReason: function(option) {
        option = option || {};
        return {
            content: nirvana.aoPkgWidgetRender.leftChangeRenderer,
            title: '建议原因',
            width: option.width || 180
        };
    }
};

nirvana.aoPkgWidgetFields = nirvana.aoPkgControl.widget.fields;