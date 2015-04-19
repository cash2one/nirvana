/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/mobile/mobileDetailConf.js
 * desc: 定义移动优化包搬家方案优化项详情视图配置
 * author: wangshiying@baidu.com
 * date: $Date: 2013/05/08 $
 */
/**
 * 定义移动优化包搬家方案优化项详情视图配置
 * @namespace nirvana.aoPkgControl
 */
nirvana.aoPkgControl.mobileDetailConf = function () {
    var ideafields={
        base: 'getPageViewBaseParam',
        containerStyle: 'opttype_806',
        title: '优化URL',
        tableOption: {
            select: 'multi',
            isSelectAll: true
        },
        fields: [
            {
                content: function(data) {
                    return lib.idea.getIdeaCell(data);
                },
                title : '创意',
                field: 'title',
                width: 370,
                minWidth: 370
            },
            {
                content: function(data) {
                    var ideaid = data.ideaid || data.creativeid;
                    // wsy 为了让当有影子的时候，状态列不显示橘红色的背景
                    data.hasBackgroundColor = 1;
                    return '<div class="idea_update_state" id="ideastat_update_' + ideaid + '">' +
                        buildIdeaStat(data) + '</div>';
                },
                title: '当前状态',
                field: 'ideastat',
                width: 113
            },
            {
                content: function(item) {
                    var returnHtml = '<div title="计划：' + item.planname + '；单元：' + item.unitname + '">计划：'
                        + getCutString(baidu.encodeHTML(item.planname), 16, '...')
                    if(item.deviceprefer == 2){
                        returnHtml = returnHtml + '<span style="color: red;padding-left: 5px;">[仅移动]</span>'
                    }
                    returnHtml = returnHtml + '<br/>单元：' + getCutString(baidu.encodeHTML(item.unitname), 16, '...')
                                            + '</div>';
                    return returnHtml;
                },
                title : '计划单元',
                width: 217,
                minWidth: 217
            },
            {
                content: function(data) {
                    var me=this;
                    me.reason;
                    return nirvana.aoPkgConfig.SETTING.MOBILE.reason[data.reason]
                },
                title : '当前问题',
                field: 'reason',
                width: 200,
                minWidth: 200
            }
        ],
        extend: nirvana.aoPkgControl.URLOptimizeDetail
    };
    return {
        805: {
            base: 'getPageViewBaseParam',
            data: '*',
            title: '优化URL',
            tableOption: {
                select: 'multi',
                isSelectAll: true
            },
            fields: [
                ['wordinfo', { length: 20, width: 140 }],
                qStar.getTableField({ VIEW: 'Pkg' }),
                {
                    content: function(item){
                        var stat = nirvana.util.buildStat('word', item.wordstat, item.pausestat, {
                            winfoid: item.winfoid
                        });
                        return '<div class="word_update_state" id="wordstat_update_' + item.winfoid + '">' +
                            stat + '</div>';
                    },
                    title : '当前状态',
                    field: 'wordstat',
                    width: 113,
                    minWidth: 113
                },
                {
                    content: function(item) {
                        var returnHtml = '<div title="计划：' + item.planname + '；单元：' + item.unitname + '">计划：'
                            + getCutString(baidu.encodeHTML(item.planname), 16, '...')
                        if(item.deviceprefer == 2){
                            returnHtml = returnHtml + '<span style="color: red;padding-left: 5px;">[仅移动]</span>'
                        }
                        returnHtml = returnHtml + '<br/>单元：' + getCutString(baidu.encodeHTML(item.unitname), 16, '...')
                            + '</div>';
                        return returnHtml;
                    },
                    title : '计划单元',
                    width: 197,
                    minWidth: 197
                },
                {
                    content: function(item) {
                        var me=this;
                        me.reason;
                        return nirvana.aoPkgConfig.SETTING.MOBILE.reason[item.reason]
                    },
                    title : '当前问题',
                    field: 'reason',
                    width: 180,
                    minWidth: 180
                },
                {
                    content: function() {
                        return '<a style="cursor: pointer" act="optimizeWordURL">优化关键词url</a>';
                    },
                    title : '操作',
                    width: 100,
                    minWidth: 100
                }
            ],
            extend: nirvana.aoPkgControl.URLOptimizeDetail
        },
        806: ideafields,
        807: ideafields
    };

}();