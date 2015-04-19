/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/corewords/RecmdCoreword.js
 * desc: 重点词排名包的推荐重点词模型
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/12/04 $
 */
/**
 * 重点词排名包的推荐重点词模型
 * @class RecmdCoreword
 * @namespace nirvana.aopkg
 */
nirvana.aopkg.RecmdCoreword = function($, nirvana) {
    /**
     * 推荐重点词类的构造函数
     * @constructor
     */
    function RecmdCoreword() {
    }

    /**
     * 推荐重点词理由类型ID数组：
     * 1高消费，2高操作，4同行关注, 8消费变化大, 16质量度变化大
     * 优先级从高到低
     * @property RECM_ADD_REASON_TYPES
     * @type {Array}
     * @const
     */
    RecmdCoreword.RECM_ADD_REASON_TYPES = [1, 2, 4, 8, 16];// TODO 后续对照组下掉，4可以去掉
    /**
     * 推荐重点词理由类型所对应的字面值常量
     * @property RECMD_RESON_VALUE_MAP
     * @type {Object}
     * @const
     */
    RecmdCoreword.RECM_ADD_RESON_VALUE_MAP = {
        1: '高消费',
        2: '高操作',
        4: '同行关注', // TODO 后续对照组下掉，这个可以去掉
        8: '消费变化大',
        16: '质量度变化大'
    };

    /**
     * 推荐取消关注的重点词理由类型ID数组：
     * 32低消费，64低操作
     * 优先级从高到低
     * @property RECM_DEL_REASON_TYPES
     * @type {Array}
     * @const
     */
    RecmdCoreword.RECM_DEL_REASON_TYPES = [32, 64];
    /**
     * 推荐取消关注的重点词理由类型所对应的字面值常量
     * @property RECM_DEL_RESON_VALUE_MAP
     * @type {Object}
     * @const
     */
    RecmdCoreword.RECM_DEL_RESON_VALUE_MAP = {
        32: '低消费',
        64: '低操作'
    };

    /**
     * 推荐词移除触发的事件，这个事件只是从内存数据中移除，只在有推荐词被移除才触发
     */
    RecmdCoreword.REMOVE = '_remove';

    RecmdCoreword.prototype = {
        /**
         * 获取Top N个推荐的重点词，如果当前推荐重点词数量少于N个，则只返回当前可返回的所有
         * 推荐重点词。
         * @method getTopN
         * @param {number} topNum 要返回的推荐的重点词的top数量，
         *                        如果给定值小于等于0或者未给，将返回全部推荐的词
         * @return {Array}
         */
        getTopN: function(topNum) { // TODO 对照组下线之后，这个方法可以删掉
            var topWordArr = [];
            if (this._data) {
                var maxNum = this._data.length;
                if (!topNum || topNum > maxNum || topNum < 0) {
                    topNum = maxNum;
                }

                for (var i = 0; i < topNum; i ++) {
                    topWordArr[i] = this._data[i];
                }
            }

            return topWordArr;
        },
        /**
         * 获取推荐关注的重点词数量
         * @return {number}
         */
        getRecmAddNum: function () {
            return this.getRecmAddCorewrds().length;
        },
        /**
         * 获取推荐取消关注的重点词数量
         * @return {Number}
         */
        getRecmDelNum: function() {
            return this.getRecmDelCorewords().length;
        },
        /**
         * 获取推荐添加关注的重点词
         * @return {Array}
         */
        getRecmAddCorewrds: function () {
            return this._getRecmCorewords(this._data,
                RecmdCoreword.RECM_ADD_REASON_TYPES);
        },
        /**
         * 获取推荐取消关注的重点词
         * @return {Array}
         */
        getRecmDelCorewords: function () {
            return this._getRecmCorewords(this._data,
                RecmdCoreword.RECM_DEL_REASON_TYPES);
        },
        /**
         * 获取推荐添加/取消关注的重点词
         * @param {Array} data 原始的推荐的重点词
         * @param {Array} reasonTypes 建议关注或取消关注的理由类型，
         *                见常量定义{@link RecmdCoreword.RECM_ADD_REASON_TYPES}和
         *                {@link RecmdCoreword.RECM_DEL_REASON_TYPES}
         * @return {Array}
         * @private
         */
        _getRecmCorewords: function (data, reasonTypes) {
            data = data || [];

            var wordArr = [];
            for (var i = data.length; i --;) {
                if (this._isRecmWord(data[i], reasonTypes)) {
                    wordArr.push(data[i]);
                }
            }
            return wordArr;
        },
        /**
         * 确定给定的重点词是否是推荐添加或取消关注的重点词
         * @param {Object} word 重点词数据对象
         * @param {Array} reasonTypes 建议关注或取消关注的理由类型
         * @return {boolean}
         * @private
         */
        _isRecmWord: function(word, reasonTypes) {
            var reason = word.recmreason;
            for (var i = reasonTypes.length; i --;) {
                if (reason & reasonTypes[i]) {
                    return true;
                }
            }
            return false;
        },
        /**
         * 获取重点词关注的上限数量
         * @return {number}
         */
        getMaxCorewordNum: function () {
            return this._maxNum;
        },
        /**
         * 加载推荐的重点词,该方法将向后端发送一个异步的请求
         * @method load
         */
        load: function() {
            // 重置数据属性
            this._data = null;

            var params = {
                onSuccess: this.successHandler,
                onFail: this.failHandler
            };

            nirvana.util.request(fbs.nikon.getRecmdCorwords, params, this);
        },
        /**
         * 移除给定的推荐词的ID列表
         * @method remove
         * @param {array} removeWordIds
         */
        remove: function(removeWordIds) {
            if (!removeWordIds || removeWordIds.length <= 0 || !this._data) {
                return;
            }

            var temp = [];
            for (var i = 0, len = this._data.length; i < len; i ++) {
                if (baidu.array.indexOf(removeWordIds, + this._data[i].winfoid)
                    == -1) {
                    temp.push(this._data[i]);
                }
            }

            if (temp.length === this._data.length) {
                // 没有找到要被移除的词，直接退出
                temp.length = 0;
            } else {
                this._data = temp;
                this.publish(RecmdCoreword.REMOVE, this._data);
            }
        },
        /**
         * 加载数据成功的回调
         * @private
         * @param {Object} json 返回的json数据
         */
        successHandler: function(json) {
            var data = json.data || {};

            this._data = data.recmcorewords;
            // 可以添加关注的重点词数量上限
            this._maxNum = +data.corewordmaxsize
                || nirvana.aoPkgConfig.NUMBER.COREWORDSLIMIT;

            var autoShowRecmdDlg = (0 === +data.type);

            // TODO 对照组下线后，可以去掉对照组判断的调价，
            // 为什么这么干见RecmCWordBroadcaster.js的注释
            if (!nirvana.auth.isCorewordExp()) {
                // 是否自动弹窗要求必须有推荐添加的词
                autoShowRecmdDlg = autoShowRecmdDlg && this.getRecmAddNum();
            }

            this.publish(nirvana.listener.LOAD_SUCCESS,
                autoShowRecmdDlg);
        },
        /**
         * 加载数据失败的回调
         * @private
         */
        failHandler: function() {
            this.publish(nirvana.listener.LOAD_FAIL, []);
        },
        /**
         * 获取推荐的重点词数据
         * @method getData
         * @return {?Array}
         */
        getData: function() {
            return this._data;
        },
        /**
         * 销毁实例
         * @method dispose
         */
        dispose: function() {
            this._data = null;
        }
    };

    // 继承Pub/Sub接口
    baidu.extend(RecmdCoreword.prototype, nirvana.listener);

    return RecmdCoreword;
}($$, nirvana);