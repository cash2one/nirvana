/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/corewords/Countdowner.js
 * desc: 重点词排名包的倒计时组件
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/12/13 $
 */

/**
 * 重点词排名包的倒计时组件
 * @class Countdowner
 * @namespace nirvana.aopkg
 */
nirvana.aopkg.Countdowner = function($, nirvana) {
    var bindContext = nirvana.util.bind;

    /**
     * 倒计时组件的构造函数
     * @param {number} interval 倒计时数字变化的间隔时间，默认是一分钟
     * @constructor
     */
    function Countdowner(interval) {
        // 默认每隔一分钟触发一次计数器的变化
        this._interval = interval || 60000;
        this._scheduler = bindContext(this.minusOne, this);
    }

    // 定义的倒计时变化的事件名称常量
    Countdowner.CHANGE = '_counter_change';

    Countdowner.prototype = {
        /**
         * 停止倒计时
         * @method stop
         */
        stop: function() {
            clearTimeout(this._schedulerId);
        },
        /**
         * 重置倒计时的时间并重新开始
         * @method reset
         * @param {number} remainder 倒计时初始剩下的时间，只有大于0的数才会执行倒计时
         */
        reset: function(remainder) {
            this.stop();
            this._counter = remainder;
            this.start();
        },
        /**
         * 开始倒计时，要求倒计时时间不能从小于等于0的数开始
         * @method start
         */
        start: function() {
            this.stop();
            // 倒计时不能从零开始
            if (this._counter && this._counter > 0) {
                this._schedulerId = setTimeout(this._scheduler, this._interval);
            }
        },
        /**
         * 倒计时减一操作
         * @private
         */
        minusOne: function() {
            -- this._counter;

            this.publish(Countdowner.CHANGE, this._counter);
            this.start();
        },
        /**
         * 销毁倒计时组件
         * @method dispose
         */
        dispose: function() {
            this.stop();
        }
    };

    // 继承Pub/Sub接口
//    baidu.inherits(Countdowner, nirvana.EventListener);
    baidu.extend(Countdowner.prototype, nirvana.listener);

    return Countdowner;
}($$, nirvana);