/**
 * 获得各种图标
 * @author zhujialu
 * @update 2012/10/20
 */
fc.common.Icon = function() {

    var tpl = fc.tpl;

    // 保存 常量名 和 title，这么写可以减少一点代码量
    var map = {
        loading:                  ['LOADING'],
        restore:                  ['RESTORE', '还原'],
        recycle:                  ['RECYCLE'],
        cancel:                   ['CANCEL'],
        search_mini:              ['SEARCH_MINI', '搜索更多类似关键词'],
        // 金手指
        gold_finger:              ['GOLD_FINGER', '系统已记录，以后还展现这类相关词'],
        // 添加关键词
        add_keyword:              ['ADD_KEYWORD', '我要添加！以后继续展现这类词！'],
        // 删除关键词 
        del_keyword:              ['DEL_KEYWORD', '移除到回收站，不要再出现这个词。'],
        // 另一个删除关键词，title不同 
        del_keyword_new:          ['DEL_KEYWORD_NEW', '删除'],
        // 展现理由图标
        show_reason_darkhorse:    ['SHOW_REASON_DARKHORSE', '最新出现的网民搜索词，助您快人一步，抢占商机'],
        show_reason_baidu:        ['SHOW_REASON_BAIDU', '百度搜索结果底部的相关搜索词，助您准确捕捉网民的搜索意图'],
        show_reason_potential:    ['SHOW_REASON_POTENTIAL', '这些词网民爱搜，针对性强 —— 网民曾经通过这些真实的搜索词寻找过您的网站'],
        show_reason_sameindustry: ['SHOW_REASON_SAMEINDUSTRY', '您所在行业的关键词，和您的业务非常相关并且您的同行也非常关注'],
        show_reason_mychoice:     ['SHOW_REASON_MYCHOICE', '根据您反馈的关键词，定位到的相关词 —— 您反馈的越多，这些词也会越准'],
        show_reason_suggestion:   ['SHOW_REASON_SUGGESTION', '百度搜索框内建议的相关词，及时反映网民搜索动向'],
        show_reason_page:         ['SHOW_REASON_PAGE', '您推广页面所包含的核心词，助您快速定位推广业务'],
        show_reason_local:        ['SHOW_REASON_LOCAL', '适合商户在移动端进行推广的词']
    };

    var TPL = '<span class="fc_icon_{name}" {title}></span>';

    // 对外的接口
    var exports = {

        /**
         * 获得 name 图标
         * @method getIcon
         * @param {String} name 图标名称
         * @param {String} tip 可选。图标的提示文本，如果需要特殊处理，就传吧
         */
        getIcon: function(name, tip) {
            tip = tip || map[name][1];
            var title = tip ? 'title="' + tip + '"' : '';
            return tpl.parse({ name: name, title: title }, TPL);
        }
    };

    // 导出常量
    for (var key in map) {
        exports[map[key][0]] = key;
    }

    return exports;

}();
