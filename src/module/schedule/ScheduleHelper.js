/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: schedule/ScheduleHelper.js
 * desc: 推广时段的辅助的工具类
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/10/23 $
 */
/**
 * 推广时段辅助工具类
 *
 * @class ScheduleHelper
 * @namespace nirvana
 * @static
 */
nirvana.ScheduleHelper = function ($, T) {
    /**
     * 通过Nikon优化详情请求接口请求数据
     * @param {Object} data 请求时段的数据
     * @param {Function} successHandler 请求成功处理器
     * @param {Function} failHandler 请求失败处理器
     * @param {Object} context 请求回调要执行的上下文，不提供，在默认上下文下执行
     */
    function requestNikonOptimizeDetail(data, successHandler, failHandler, context) {
        var params = {
            level: data.level,
            opttypeid: data.opttypeid,
            optmd5: data.optmd5,
            condition: {
                planid: data.planid[0], // 这里是计划ID不是数组，不同于下面接口！！！
                decrtype: data.decrtype || '', // 这字段当前老版突降包才有，升级版的突降可以直接传''
                optmd5: data.suboptmd5
            },
            onSuccess: successHandler,
            onFail: failHandler
        };

        nirvana.util.request(fbs.nikon.getDetail, params, context);
    }

    /**
     * 处理包含推荐时段信息的数据，返回处理过的推荐时段信息
     * @param {Object} data 推荐时段信息的数据
     * @param {?Object} commonData 可选的附加common数据字段信息
     * @return {Object}
     */
    function processRecmSchedule(data, commonData) {
        var json = {};

        if (data) {
            var parser = T.json.parse;

            json = {
                // 返回的plancyc是未投放的时段，不是投放的时段！
                plancyc: data.plancyc && parser(data.plancyc),
                suggestcyc: data.suggestcyc && parser(data.suggestcyc),
                potionalclk: data.potionalclk && parser(data.potionalclk),
                hotlevel: data.hotlevel && parser(data.hotlevel)
            };

            if (commonData && commonData.begindate && commonData.enddate) {
                var beginDate = new Date(+commonData.begindate);
                var endDate = new Date(+commonData.enddate);
                var format = T.date.format;

                T.object.extend(json, {
                    beginDate: format(beginDate, 'yyyy-MM-dd'),
                    beginWeek: parseDateToChineseWeek(beginDate, true),
                    endDate: format(endDate, 'yyyy-MM-dd'),
                    endWeek: parseDateToChineseWeek(endDate, true)
                });
            }
            // 初始化推荐的时段数量，该字段只有手动版账户优化的时段才有
            (typeof data.suggestcyccnt == 'number')
            && (json.cycnum = data.suggestcyccnt);
        }

        return json;
    }

    /**
     * Nikon时段请求接口响应的数据处理接口
     * @param {Object} result 响应的数据对象
     * @return {Object} 处理过的数据对象
     */
    function nikonOptimizaDetailResponse(result) {
        var detailresitems = result.data.detailresitems,
            data = detailresitems[0] && detailresitems[0].data;

        return processRecmSchedule(data, result.data.commData);
    }

    /**
     * 通过标准的计划时段接口请求搁置时段
     * @param {Object} data 请求时段的数据
     * @param {Function} successHandler 请求成功处理器
     * @param {Function} failHandler 请求失败处理器
     * @param {Object} context 请求回调要执行的上下文，不提供，在默认上下文下执行
     */
    function requestPlanSchedule(data, successHandler, failHandler, context) {
        var params = {
            condition: {
                planid: data.planid // planid是数组！！！
            },
            onSuccess: successHandler,
            onFail: failHandler
        };
        nirvana.util.request(fbs.plan.getPlancyc, params, context);
    }

    /**
     * 标准的计划时段请求接口响应的数据处理接口
     * @param {Object} result 响应的数据对象
     * @return {Object} 处理过的数据对象
     */
    function planSheduleResponse(result) {
        var data = result.data.listData[0];
        return data ? { plancyc: data.plancyc } : {};
    }

    /**
     * 手动版账户优化时段详情请求接口
     * @param {Object} data 请求时段的数据
     * @param {Function} successHandler 请求成功处理器
     * @param {Function} failHandler 请求失败处理器
     * @param {Object} context 请求回调要执行的上下文，不提供，在默认上下文下执行
     */
    function requestAoSchedule(data, successHandler, failHandler, context) {
        var params = {
            level: 'planinfo',
            startindex: 0,
            endindex: 200,
            condition: {
                planid: data.planid // planid是数组！！！
            },
            onSuccess: successHandler,
            onFail: failHandler
        };
        nirvana.util.request(fbs.ao.getRecmScheduleDetail, params, context);
    }

    /**
     * 手动版账户优化时段详情请求响应处理接口
     * @param {Object} result 响应的数据对象
     * @return {Object} 处理过的数据对象
     */
    function aoSheduleResponse(result) {
        var listData = result.data.listData;
        return processRecmSchedule(listData && listData[0]);
    }

    var ScheduleHelper = {
        /**
         * 时段请求接口
         * @type {Object}
         * @const
         */
        requester: {
            /**
             * 用于Nikon（优化包）的时段请求接口
             */
            nikon: {
                /**
                 * 发送请求的接口
                 */
                request: requestNikonOptimizeDetail,
                /**
                 * 处理响应数据的接口
                 */
                response: nikonOptimizaDetailResponse
            },
            /**
             * 用于推广管理的时段请求接口
             */
            manage: {
                request: requestPlanSchedule,
                response: planSheduleResponse
            },
            /**
             * 用于手动版账户优化的时段请求和响应接口
             */
            ao: {
                request: requestAoSchedule,
                response: aoSheduleResponse
            }
        },
        /**
         * 获取用于显示的推广时段，这里的时段对应时段编辑器的一个小格子
         * @method getDisplayScheduleTime
         * @param {Number} time 要推广的时段，这里的时段对应时段编辑器的一个小格子
         * @return {String} 返回用于显示的时段
         * @example
         *      getDisplayScheduleTime(103)
         *      返回结果为：周一 03:00 - 04:00
         */
        getDisplayScheduleTime: function (time) {
            var week = parseInt(+time / 100),
                hour = +time % 100;

            var regex = /^(\d)$/;
            var startHour = (String(hour)).replace(regex, "0$1"),
                endHour = (String(hour + 1)).replace(regex, "0$1"),
                weekDay = parseNumToChineseWeek(week);

            return weekDay + " " + startHour
                + ":00 - " + endHour + ":00";
        }
    };

    return ScheduleHelper;
}($$, baidu);
