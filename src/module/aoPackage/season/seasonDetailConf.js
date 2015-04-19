/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/season/seasonDetailConf.js
 * desc: 定义行业旺季包优化项详情视图配置
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/05/13 $
 */
/**
 * 行业旺季包优化项详情视图配置定义
 * @namespace nirvana.aoPkgControl
 */
nirvana.aoPkgControl.seasonDetailConf = {
    901: { // 账户预算
        base: 'getBudgetDetailConf'
    },
    902: { // 计划预算
        base: 'getPageViewBaseParam',
        title: '计划预算建议',
        materialName: '计划',
        applyBtnLabel: '应用所选',
        applyType: 'modPlanBudget',
        fields: [
            ['planinfo', { length: 40 }],
            {
                title: '近期下线时间',
                content: function (item) {
                    var offTime = new Date(+item.offtime);
                    return baidu.date.format(offTime, 'MM月dd日 HH:mm');
                }
            },
            {
                title: '近期损失点击',
                content: function (item) {
                    return item.clklost;
                }
            },
            {
                title: '当前预算',
                content: function (item, row) {
                    var html = '<div class="inline-recmbuget">'
                        +           '<div class="edit_td" row="' + row + '">'
                        +               '<span class="recmbudget">'
                        +                   item.wbudget
                        +               '</span>'
                        +               '<a class="edit_btn" edittype="planBudget"></a>'
                        +           '</div>'
                        +       '</div>';
                    return html;
                }
            },
            {
                title: '建议预算',
                content: function (item) {
                    return item.suggestbudget;
                }
            }
        ],
        extend: {
            /**
             * 行内修改计划预算成功的事件回调
             * @param {Object} item 修改的计划对象
             * @param {number} wbudget 修改后计划的预算
             */
            onModPlanBudgetSuccess: function(item, wbudget) {
                var me = this;
                me.addModifiedInfo('planid', item.planid);
                me.fireMod('inlineModPlanBudget', item, wbudget);
            }

        }
    },
    903: { // 关键词出价
        base: 'getModBidViewConf',
        title: '出价建议',
        fields: [
            ['wordinfoWithBubble', { width: 135, length: 25 }],
            qStar.getTableField({ VIEW: 'SeasonPkg' }, { width: 20 }),
            ['wmatch', { editable: false, width: 80 }],
            ['bid', { width: 80 }],
            ['recmbid', { width: 80 }],
            ['reason', { width: 350 }]
        ]
    },
    904: { // 新提词
        base: 'getAddwordViewConf',
        title: '新提词',
        fields: [
            ['addword', { length: 30, width: 70 }],
            ['pv', { width: 80 }],
            ['kwc', { width: 90 }],
            'addshorttarget',
            ['recmbid_editable', { width: 120 }],
            ['recmwmatch_editable', { width: 120 }]
        ]
    },
    906: { // 扩匹配
        base: 'getModWmatchViewConf',
        title: '匹配建议',
        fields: [
            'wordinfo',
            'planinfo',
            'unitinfo',
            qStar.getTableField({ VIEW: 'SeasonPkg' }, { width: 30 }),
            ['bid', { editable: false }],
            ['wmatch', { width: 120 }],
            ['recmwmatch', { width: 120 }]
        ]
    }
};