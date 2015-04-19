/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: core/common/validate.js
 * desc: 提供可重用的全局值验证方法
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/02/15 $
 */
/**
 * 提供可重用的全局值验证方法
 */
nirvana.validate = function($, T, fbs, nirvana) {
    function getLevelName(isPlan) {
        return isPlan ? '计划' : '单元';
    }

    return {
        /**
         * 行内修改出价验证（从detailHandler.js抽出来)
         * @param {number} wbid 要验证的关键词的出价
         * @return {boolean}
         */
        bid: function(wbid) {
            var result = false;
            var displayError = nirvana.inline.displayError;

            // '605':'关键词出价不能为空',
            // '607':'关键词出价不能低于' + nirvana.config.NUMBER.BID_MIN + '元',
            // '608':'关键词出价不能高于' + nirvana.config.NUMBER.BID_MAX + '元',
            // '606':'关键词出价不是数字',
            // '699':'关键词出价小数点后不超过两位',
            if (wbid == '') {
                displayError('605');
            }
            else if (isNaN(wbid)) {
                displayError('606');
            }
            else if (! fbs.validate.number.decPlaces(wbid, 2)) {
                displayError('699');
            }
            else if (+ wbid <= nirvana.config.NUMBER.BID_MIN) {
                displayError('607');
            }
            else if (+ wbid > nirvana.config.NUMBER.BID_MAX) {
                displayError('608');
            }
            else {
                result = true;
            }

            return result;
        },
        /**
         * 验证突降的阈值，如果验证失败，返回验证失败的消息，如果成功，不返回任何东西
         * @param {number} value 要设定的阈值
         * @return {string}
         */
        decrThreshold: function(value) {
            var msg;

            if (!value) {
                msg = '设定的阈值不能为空';
            }
            else if (
                !fbs.validate.number.isInt(value)
                    || +value === 0
                    || +value > 100
                ) {
                msg = '设定的阈值需要是大于0并且小于等于100的整数';
            }

            return msg;
        },
        /**
         * 验证计划/单元名称。如果验证失败，返回验证失败消息，如果验证通过，不返回任何东西
         * @param {string} value 要验证的计划/单元的值
         * @param {boolean} isPlan 要验证的是否是计划名称
         * @return {string}
         */
        planUnitName: function(value, isPlan) {
            var typeName = getLevelName(isPlan);
            var msg;

            if (!value || value.length == 0) {
                msg = '推广' + typeName + '名称不能为空';
            }
            else if (value.length > 30) {
                msg = '推广' + typeName + '名称长度不能超过30个字符';
            }

            return msg;
        },
        /**
         * 验证选择的计划单元值
         * @param {string} value 计划/单元的ID值
         * @param {boolean} isPlan 要验证的是否是计划
         */
        selPlanUnitValue: function(value, isPlan) {
            if (!value || parseInt(value) < 0) {
                return '必须选择推广' + getLevelName(isPlan);
            }
        }
    };
}($$, baidu, fbs, nirvana);