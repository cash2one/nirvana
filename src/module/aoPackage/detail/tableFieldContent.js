
/**
 * 优化项详情渲染方法
 */
nirvana.aoPkgControl.widget.render = {
    /**
     * 获取计划、单元或关键词暂停状态的渲染方法
     *
     * @param {string} level 支持level、unit、word暂停状态
     * 需要注意的是：
     * 		level=plan在暂停时有两种状态：调用参数为2, 1时为暂停推广；
     * 		为1，1时为处在暂停时段；0，0为启用
     * 		level=unit在暂停时有两种状态：调用参数为1, 1时为暂停推广；
     * 		为11，1时为推广计划暂停推广；0，0为启用
     * 		level=word调用参数为1, 1时为暂停推广；0，0为启用
     * TODO: 这段代码最好跟nirvana.util.buildStat统一下，不要搞成两套，而且当前这个方法
     * 处理逻辑有点固化：直接对status,paustat直接赋值
     */
    pauseState: function (level) {
        return function (item) {
            var status;
            var pauseStat;

            switch (level) {
                case 'plan':
                    status = 2;
                    pauseStat = 1;
                    break;
                case 'unit':
                    status = 1;
                    pauseStat = 1;
                case 'word':
                    status = 1;
                    pauseStat = 1;
                    break;
                default:
                    return '';
            }

            var act = 'enable' + level.charAt(0).toUpperCase() + level.substr(1);
            var tpl = ''
                + '<div class="{0}">'
                +     '<span class="status_text">{1}</span>'
                +     '<span class="status_op_btn" actLevel="' + level + '" '
                +           'act="' + act + '"></span>'
                + '</div>';

            return nirvana.util.generateStat(
                level, status, tpl, pauseStat
            );
        }
    },
    /**
     * 添加关键词
     * @param {Object} item
     * @param {Object} options
     */
    addword : function(length, options){
        options = options || {};
        options.plusstr = options.plusstr || '';
        return function(item){
            var showword = baidu.encodeHTML(item.showword),
                html = [],
                limit = length || nirvana.aoPkgConfig.DETAIL_MAX_LENGTH,
                shortword = getCutString(item.showword, limit, '..'),
                isnewword = item.isnewword;
            html.push('<div class="aopkg_detail_word">');
            html.push('<span title="' + showword + '">' + shortword + options.plusstr + '</span>');
            // 在智能提词包中，会提示今日新增建议关键词，没有此字段则没有影响
            // isnewword 1表示是，0表示否
            if (+isnewword == 1) {
                html.push('<span class="isnew" title="今日新增的建议关键词">&nbsp;</span>');
            }
            //html.push('<a class="edit_btn" edittype="addword"></a>');
            html.push('</div>');
            return html.join('');
        };
    },

    /**
     * 目标计划单元列
     * @param {Object} item
     */
    addtarget : function(length){
        return function(item){
            var planname = baidu.encodeHTML(item.recmplanname),
                unitname = baidu.encodeHTML(item.recmunitname),
                html = [],
                limit = length || nirvana.aoPkgConfig.DETAIL_MAX_LENGTH,
                shortplan = getCutString(item.recmplanname, limit, '..'),
                shortunit = getCutString(item.recmunitname, limit, '..'),
                recmunitid = item.recmunitid;

            html.push('<dl class="add_target">');
            html.push('<dt>计划：</dt>');
            html.push('<dd title="' + planname + '">' + shortplan + '</dd>');
            html.push('<dt>单元：</dt>');
            html.push('<dd title="' + unitname + '">' + shortunit + '</dd>');
            html.push('</dl>');

            // 在智能提词包中，会提示新建单元
            // recmunitid为0 表示新建单元
            if (typeof recmunitid != 'undefined' && (+recmunitid == 0)) {
                html.push('<span class="isnew" title="此单元为新建单元，需添加创意">&nbsp;</span>');
            }

            return html.join('');
        }
    },

    /**
     * 最右侧的关键词列
     * @param {Object} item
     */
    origwordinfo : function(length){
        return function(item){
            var showword = item.origshowword || item.showword,
            //winfoid = item.wordid,
                html = [],
                limit = length || nirvana.aoPkgConfig.DETAIL_MAX_LENGTH,
                shortword = getCutString(showword, limit, '..');

            showword = baidu.encodeHTML(showword);

            // 将最大长度缩短来放突降图标
            // if (item.decrLimit) {
            //	 limit -= 8;
            // }

            html.push('<span title="' + showword + '">' + shortword + '</span>');

            return html.join('');
        }
    },
    /**
     * 渲染推左次数变化的函数，当前只用于突降急救包升级版
     * @param {Object} item 要渲染的数据对象
     * @return {string}
     */
    leftChangeRenderer: function(item) {
        var reason = + item.reason;
        var labelMap = {
            1: '左侧展现概率：',
            2: '平均排名：',
            3: '展现机会突降'
        };
        var tpl = '{label}'
            +      '<span class={className}>'
            +           '<span>{sValue}{unit}</span>'
            +           '<span class="decr_arrow"></span>'
            +           '<span>{eValue}{unit}</span>'
            +      '</span>';

        return lib.tpl.parseTpl(
            {
                label: labelMap[reason],
                className: reason === 3 ? 'hide' : '',
                sValue: item.begincount,
                eValue: item.endcount,
                unit: reason === 1 ? '%' : ''
            },
            tpl
        );
    },

    /**
     * 账户内低展现词域content渲染方法
     * @param {Object} item 关键词对象
     * @return {string}
     */
    lowPresentWord: function(item) {
        var origshowword = baidu.encodeHTML(item.origshowword);

        return '<span class="aopkg_detail_gray" title="' + origshowword + '">'
            + getCutString(origshowword, 16, '..') + '</span>';
    },

    /**
     * 检索量低/下降关键词域渲染方法
     * @param {Object} item 关键词对象
     * @return {string}
     */
    lowSearchWord: function(item) {
        return '<div class="aopkg_detail_gray">'
            +       nirvana.aoPkgWidgetRender.origwordinfo(11)(item)
            +       ' (点击量-' + item.decr + ')'
            +  '</div>';
    },
    /**
     * 推荐原因
     * @param {Object} item
     */
    reason : function(item){
        var reasonInfo = nirvana.aoPkgConfig.REASON[item.reason];

        var recmbid = item.recmbid;
        var tplData = baidu.object.clone(item);

        recmbid && (tplData.recmbid = baidu.number.fixed(recmbid));

        return lib.tpl.parseTpl(tplData, reasonInfo);
    }
};

nirvana.aoPkgWidgetRender = nirvana.aoPkgControl.widget.render;