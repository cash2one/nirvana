/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path: core/common/listener.js
 * desc: 实现发布/订阅事件的接口
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/12/04 $
 */
/**
 * 实现发布/订阅事件的接口，要想提供自定义的发布/订阅接口，继承该类即可
 */
nirvana.listener = function($) {

    return {
        /**
         * 一些公用的事件常量定义
         */
        // 请求数据失败事件
        LOAD_FAIL: '_load_fail',
        // 请求数据成功事件
        LOAD_SUCCESS: '_load_success',
        /**
         * 订阅事件
         * @method subscribe
         * @param {String} eventName 要订阅的事件名
         * @param {Function} callback 要订阅的事件回调
         * @return {Object} this 支持链式写法
         */
        subscribe: function (eventName, callback) {
            this._callbacks = this._callbacks || {};
            (this._callbacks[eventName]
                || (this._callbacks[eventName] = [])).push(callback);
            return this;
        },
        /**
         * 取消事件订阅
         * @method unsubscribe
         * @param {String} eventName 要取消订阅的事件名
         * @param {Function} callback 要取消订阅的事件回调
         * @return {Object} this 支持链式写法
         */
        unsubscribe: function(eventName, callback) {
            if (this._callbacks) {
                var eventQueue = this._callbacks[eventName] || [];
                baidu.array.remove(eventQueue, function(item) {
                    return callback === item;
                });
            }
            return this;
        },
        /**
         * 发布事件
         * @method publish
         * @param {String} eventName 要发布的事件名
         * @param {any} args 其它要附加到触发的事件的参数
         * @return {Object} this 支持链式写法
         */
        publish: function() {
            if (this._callbacks) {
                var argArr = Array.prototype.slice.call(arguments, 0);
                var eventName = argArr.shift();
                var eventQueue = this._callbacks[eventName] || [];

                for (var i = 0, len = eventQueue.length; i < len; i ++) {
                    eventQueue[i].apply(this, argArr);
                }
            }
            return this;
        }
    };
}($$);