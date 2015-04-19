/**
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path: nirvana/core/auth.js
 * desc: 定义权限相关的一些静态方法
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/12/21 $
 */
nirvana.auth = function($, T, nirvana) {
    /**
     * 所有要初始化的权限信息数组
     * @type {Array}
     */
    var AUTH_MAP = {
        /**
         * 标识重点词对照组的用户
         */
        // name必须跟后端返回的标识权限的值一致！！！
        COREWORD_EXP: {
            name: 'corewordexp'
        },
        /**
         * 标识智能提词包对照组的用户
         */
        RECMWORD_EXP: {
            name: 'recmwordexp'
        },
        FUSESUG_EXP: {
            name: 'aofuse1.0'
        },
        /**
         * 标识是否有ao积分活动的权限
         */
        AO_POINT_ACTIVITY: {
            name: 'aopointactivity'
        },
        /**
         * 标识是否是第二批ao积分活动名单
         */
        AO_POINT_ACTIVITY2: {
            name: 'aopointactivity2'
        }
    };

    /**
     * 初始化用户的权限信息
     * @param {Array} aoauth 用户的权限信息
     */
    function init(aoauth) {
        if (!(aoauth instanceof Array)) {
            aoauth = [];
        }

        var expType;
        for (var key in AUTH_MAP) {
            expType = AUTH_MAP[key];
            if (T.array.indexOf(aoauth, expType.name) != -1) {
                expType.value = true;
            }
        }
    }

    return {
        /**
         * 初始化用户的权限信息，该方法会被自动调用，见nirvana/init.js，不要调用该方法！
         */
        init: init,
        /**
         * 该用户是否是重点词排名包对照组用户，使用老功能
         * @return {boolean}
         */
        isCorewordExp: function() {
            return AUTH_MAP.COREWORD_EXP.value;
        },
        /**
         * 该用户是否是智能提词包对照组用户
         * @return {boolean}
         */
        isRecmwordExp: function() {
            return AUTH_MAP.RECMWORD_EXP.value;
        },
        isFuseSugExp: function() {
            return AUTH_MAP.FUSESUG_EXP.value;
        },
        /**
         * 确认当前用户是否有参与智能账户优化活动的权限，
         * 活动时间为4.24至5.23，活动结束后链接和引导页下线
         * @return {boolean}
         */
        hasAoPointActivity: function () {
            return AUTH_MAP.AO_POINT_ACTIVITY.value;
        },
        /**
         * 确认当前用户是第二批参与智能账户优化活动的客户，
         * 其显示的活动链接跟第一批不一样，两批客户的下线
         * 时间统一延后到6.27,活动结束后链接和引导页下线
         * NOTICE: 跟上面hasAoPointActivity是互斥的
         * @return {boolean}
         */
        isSecondAoPointActivity: function () {
            return AUTH_MAP.AO_POINT_ACTIVITY2.value;
        },
        /**
         * 判断当前的AO积分活动是否已经结束
         * @return {boolean}
         */
        isAoPointActivityExpire: function () {
            return nirvana.auth.isExpire("2013-7-1"); // 即7.1 00:00下线
        },
        /**
         * 获取智能优化积分活动链接（现改成抽大奖活动），如果不存在参与该活动权限，返回空链接
         * @returns {string}
         */
        getAoPointActivityHref: function () {
            if (nirvana.auth.hasAoPointActivity()) {
                // 第一批客户活动链接
                return 'http://promote.baidu.com/gift/index.html#/activity/info~id=7';
            }
            else if (nirvana.auth.isSecondAoPointActivity()) {
                // 第二批客户活动链接
                return 'http://pro.baidu.com/topic/152/topic.html';
            }

            return '';
        },
        /**
         * 是否是大客户
         * @return {boolean}
         */
        isBigCustomers: function() {
            return (nirvana.env.ULEVELID == 10104);
        },
        /**
         * 根据给定的截止日期跟服务器时间判断是否已经过期
         * @param {string} endDate 结束日期（eclusive），小于这个结束日期才算不过期
         * @return {boolean}
         */
        isExpire: function (endDate) {
            var serverDate = new Date(nirvana.env.SERVER_TIME * 1000);
            return serverDate >= T.date.parse(endDate);
        }
    };

}($$, baidu, nirvana);