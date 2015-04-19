/**
 * @file nirvana/src/message/msgCenter/config.js 消息盒子的相关配置
 * @author peilonghui@baidu.com
 */


;(function() {

    var newAccountPlanHandler = [function(tasktype){
       nirvana.quicksetup.show({
            type : tasktype,
            entrance : 3,
            maskLevel: 2
        });
    }, nirvana.quicksetup, ['useracct']];

    var openAoPackage = nirvana.aoPkgControl.openAoPackage;
    var openBudget = function(type, planid, planname) {
        if (planid && (planid.constructor !== Array)) { 
            planid = [planid]
        }
        manage.budget.openSubAction({
            type: type,
            planid: planid || [],
            planname: planname,
            maskLevel: 2
        });
        return false;
    }

    var config = msgcenter.config = {
        FLAG2GROUP: {
            'Today': '今天',
            'YesterDay': '昨天',
            'BeforeYesterDay': '前天',
            'Monday': '星期一',
            'TuesDay': '星期二',
            'WednesDay': '星期三',
            'ThursDay': '星期四',
            'LastWeek': '上周',
            'Earlier': '更早'
        },
        DATE_FLAGS: [
            [],
            ['Today', 'LastWeek', 'Earlier'],
            ['Today', 'YesterDay', 'LastWeek', 'Earlier'],
            ['Today', 'YesterDay', 'BeforeYesterDay', 'LastWeek', 'Earlier'],
            ['Today', 'YesterDay', 'BeforeYesterDay', 'Monday', 'LastWeek', 'Earlier'],
            ['Today', 'YesterDay', 'BeforeYesterDay', 'TuesDay', 'Monday', 'LastWeek', 'Earlier'],
            ['Today', 'YesterDay', 'BeforeYesterDay', 'WednesDay', 'TuesDay', 'Monday', 'LastWeek', 'Earlier'],
            ['Today', 'YesterDay', 'BeforeYesterDay', 'ThursDay', 'WednesDay', 'TuesDay', 'Monday', 'LastWeek', 'Earlier']
        ],
        CATEGORY_MAP: {
            '0': '全部消息',
            '1': '系统消息',
            '2': '消费消息',
            '3': '优化消息'
        },

        SET_CATEGORY_MAP : {
            '1': '消费消息',
            '2': '优化消息',
            '3': '系统消息'
        },
        SUB_CATEGORY_MAP: {
            '1': '续费',
            '2': '账户当日消费',
            '3': '计划当日消费<br/><div title="点击设置要关注的重点计划" ui="id:McAddImportantPlans;type:Button;typeid:{{typeid}}">设置计划</div> ',
            '4': '效果突降',
            '5': '重点词监控',
            '6': '信息审核结果'
        },
        MESSAGE_DETAIL_MAP: {
            '1': '余额低于<div ui="id:McAccountBalanceSelect;type:Select;typeid:{{typeid}};width:64"></div>元时',
            '2': '余额为零',
            '3': '账户当日消费<input type="text" ui="id:McAccountCost;type:TextInput;value:100;typeid:{{typeid}};width:37;" style="float:none;" />元<span id="McAccountCostInputError" class="warn"></span>',
            '4': '账户到达预算下线',
            '5': '<span title="点击设置要关注的重点计划" id="McImportantPlans" class="mc-active"></span><span id="McImportantPlansSuffix"></span>到达预算下线',
            '6': '账户推广效果发生突降',/*'点击突降<input type="text" ui="id:McClickDecrease;type:TextInput;typeid:{{typeid}};width:37;" style="float:none" />%时',*/
            '7': '重点词预算不足/不在左侧/质量度过低/搜索无效/搜索量过低',
            '8': '注册信息、资质审核结果，资质到期信息'
        },
        TAB_ARRAY: {
            'list': 0,
            'set': 1,
            'receiver': 2
        },
        DATA_LOAD_ERROR: {
            0: '消息列表加载失败，请稍候重试',
            1: '提醒设置加载失败，请稍候重试',
            2: '接收人信息加载失败, 请稍候重试'
        },
        CATEGORY_SUB: {
            '1': ['1', '2', '3'],
            '2': ['4', '5'],
            '3': ['6']
        },
        SUB_DETAIL: {
            '1': ['1','2'],
            '2': ['3', '4'],
            '3': ['5'],
            '4': ['6'],
            '5': ['7'],
            '6': ['8']
        },
        ACCOUNT_BALANCE_VALUES: [{
                            'text': '10',
                            'value': '10'
                        },
                        {
                            'text': '20',
                            'value': '20'
                        },
                        {
                            'text': '30',
                            'value': '30'
                        },
                        {
                            'text': '50',
                            'value': '50'
                        },
                        {
                            'text': '100',
                            'value': '100'
                        },
                        {
                            'text': '200',
                            'value': '200'
                        },
                        {
                            'text': '500',
                            'value': '500'
                        },
                        {
                            'text': '1000',
                            'value': '1000'
                        },
                        {
                            'text': '5000',
                            'value': '5000'
                        },
                        {
                            'text': '10000',
                            'value': '10000'
                        },
                        {
                            'text': '20000',
                            'value': '20000'
                        }],
        DISABLE_CHECKS: {
            '2': '111',
            '6': '001',
            '7': '001',
            '8': '101'
        },
        MSG_CUSTOM: {
            /**
             * 值为区分标识，例如：
                'McMessageSetsCheckBox' + typeid + len
                就是这个len，typeid是用来区分行 or 设置类型的
             */
            CHECKBOXCOUNT: 3,
            CHECKBOX: {
                EMAIL: 0,
                SMS: 1,
                STATION_LETTER: 2
            }
        },
        DEFAULT_TYPEIDS: [1, 2, 3, 4, 5, 6, 7, 8],
        CLICK_NOT_REDIRECT: {
            13: newAccountPlanHandler,
            14: newAccountPlanHandler,
            15: newAccountPlanHandler,
            16: newAccountPlanHandler,
            17: newAccountPlanHandler,
            18: newAccountPlanHandler,
            19: newAccountPlanHandler,
            20: newAccountPlanHandler,
            21: newAccountPlanHandler,
            22: newAccountPlanHandler,
            7: [openAoPackage, nirvana.aoPkgControl, [4, 3]], // 3是代表是从消息中心进入的
            23: [openAoPackage, nirvana.aoPkgControl, [4, 3]],
            6: [openAoPackage, nirvana.aoPkgControl, [7, 3]], // 4是代表使用的是突降包
            3: [openBudget, manage.budget, ['useracct']],
            4: [openBudget, manage.budget, ['useracct']],
            5: [openBudget, manage.budget, ['planinfo']]
        },
        UNREAD_CATEGORY_NAV: {
            0: 'McAllUnreadMsgCnt',
            2: 'McPaysumUnreadMsgCnt',
            3: 'McOptimizeUnreadMsgCnt',
            1: 'McSystemUnreadMsgCnt'
        },
        UNREAD_CATEGORY_PROP: {
            0: 'allUnreadMsgCnt',
            2: 'paysumUnreadMsgCnt',
            1: 'systemUnreadMsgCnt',
            3: 'optimizeUnreadMsgCnt'
        }
    };

})();

