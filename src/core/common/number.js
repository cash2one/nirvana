/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 *
 * path:    lib/number.js
 * desc:    数字处理
 * author:  wanghuijun
 * date:    $Date: 2010/12/31 $
 */

/**
 * 输出小数点后为两位的格式化数字
 * @param {Number} d
 * @return {String}
 * @author zuming@baidu.com wanghuijun@baidu.com
 */
function fixed(d) {
    d = +d;
    return (d.toFixed(2));
}

/**
 * 四舍五入
 * @param {Number} d
 * @return {Number}
 * @author zuming@baidu.com
 */
function round(d){
    d = +d;
    return (Math.round(d));
}

/**
 * 数字直接增加百分号，保留小数点后2位
 * @param {Number} d
 * @return {String}
 * @author zuming@baidu.com
 */
function percent(d){
    return (fixed(d) + '%');
}

/**
 * 小数转换为百分比
 * @param {Number} d
 * @return {String}
 * @author wanghuijun@baidu.com
 */
function floatToPercent(d) {
	//先乘100再格式化，否则结果格式不准确，有可能为x.000000000000000001
    return (fixed(d * 100) + '%');
}

/**
 * 取整
 * @param {Object} d
 * @author tongyao@baidu.com
 */
function ceil(d){
    d = d - 0;
    return Math.ceil(d);
}

/**
 * 数字转化为金钱，保留2位小数
 * @param {Number} d
 * @return {String}
 * @author wanghuijun@baidu.com
 */
function money(d) {
    return ('&yen; ' + fixed(d));
}

/**
 * 个位数补0
 * @param {Number} d
 * @return {String}
 * @author wanghuijun@baidu.com
 */
function addZero(d) {
	if (d < 10) {
		return ('0' + d);
	}
	return d;
}

/**
 * 转换为数字形式
 * @param {Object} d
 */
function parseNumber(d){
	return d - 0;
}

/**
 * 计算渲染时间
 */
function getRenderDuration() {
	var now = (new Date()).valueOf(),
		duration = (now - nirvana.renderBegin);
	
	baidu.g('Duration').innerHTML = duration + ' ms';
}

/**
 * 当前该方法只是简单将0~10转成中文，如果想把更复杂的数字转成中文，自己完善该方法
 * @method parseDigitToChinese
 * @param {Number} digit 要转成中文的数字
 * @return {String} 中文的数字
 */
function parseDigitToChinese(digit) {
    var chineseArr = [
        "零", "一", "二", "三", "四", "五",
        "六", "七", "八", "九", "十"
    ];
    return chineseArr[digit];
}

/**
 * 将数字1~7转换成中文的星期
 * @method parseNumToChineseWeek
 * @param {Number} num 要转成中文星期x的数字
 * @param {isNormalize} isNormalize 返回是否是规范化的星期描述,
 *                      true 返回星期x，false 返回周x
 * @return {String}
 * @example
 *       parseNumToChineseWeek(3, true)
 *       返回结果："星期三"
 */
function parseNumToChineseWeek(num, isNormalize) {
    num = +num;

    var prefix = isNormalize ? "星期" : "周";

    if (num > 7) {
        return "";
    } else if (7 == num) {
        return prefix + "日";
    } else {
        return prefix + parseDigitToChinese(num);
    }
}

/**
 * 根据给定的日期对象获取中文的星期
 * @method parseDateToChineseWeek
 * @param {Date} date 要转成中文星期x的日期对象
 * @param {isNormalize} isNormalize 返回是否是规范化的星期描述,
 *                      true 返回星期x，false 返回周x
 * @return {String}
 * @see parseNumToChineseWeek
 */
function parseDateToChineseWeek(date, isNormalize) {
    var day = date.getDay();
    // 把0表示的星期天换成7
    day = (0 == day) ? 7 : day;

    return parseNumToChineseWeek(day, isNormalize);
}

/**
 * 对数组进行排序，该方法默认要排序的元素都是数字，且按数字的正常大小进行比较，若不符合该逻辑，请自行创建排序方法
 * @method sortNumArray
 * @param {Array} data 要被排序的数据
 * @param {String} orderBy 要排序的列的field,必须能通过data[orderBy]获取对应的field的数据
 * @param {String} orderType 排序的方式，可能取值为{desc|asc}，未传递该参数，默认使用desc排序
 */
function sortNumArray(data, orderBy, orderType) {
    var defaultSortFunc = function(ele1, ele2) {
        var value1 = ele1[orderBy],
            value2 = ele2[orderBy],
            result = value1 - value2;

        if (!orderType || 'desc' == orderType) {
            result = -1 * result;
        }

        return result;
    };

    // 对数组进行排序
    data.sort(defaultSortFunc);
}