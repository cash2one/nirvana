/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path: core/common/date.js
 * desc: 日期相关的工具方法
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/01/04 $
 */
/**
 * 日期时间工具方法定义
 * @namespace nirvana
 */
nirvana.date = function($) {
    return {
        /**
         * 将用秒数表示的数字转成'xx:xx'格式的时间
         * @method parseSecondsToTime
         * @param {Array|Number} seconds 要换算的秒数
         * @return {Array|String}
         * @author Wuhuiyao (wuhuiyao@baidu.com)
         */
        parseSecondsToTime: function(seconds) {
            var isArr = (seconds instanceof Array);
            var timeArr = [];
            var hour;
            var minute;
            var secondArr = isArr ? seconds : [seconds];

            for (var i = 0, len = secondArr.length; i < len; i ++) {
                hour = parseInt(secondArr[i] / 3600);
                minute = parseInt((secondArr[i] % 3600) / 60);
                timeArr[i] = (String(hour).replace(/^(\d)$/, "0$1")) + ':'
                    + (String(minute).replace(/^(\d)$/, "0$1"));
            }

            return isArr ? timeArr : timeArr[0];
        }
    };
}($$);