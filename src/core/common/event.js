/**
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path: nirvana/core/event.js
 * desc: 定义事件相关的一些静态方法
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/12/31 $
 */
nirvana.event = function($, T) {
    return {
//        /**
//         * 对给定的事件处理器进行上下文绑定，支持事件代理
//         * @param {Object} context handler执行所要绑定的上下文对象
//         * @param {Function} handler 所要执行的事件处理器。handler被调用时，会传递两个参数：event，target。
//         *                   如果使用了事件代理方式,该handler要求返回一个boolean值结果，如果target触发了handler的执行，
//         *                   返回true，否则返回false
//         * @param {HTMLElement} ele 用于绑定事件监听的DOM元素，即事件代理元素，如果该值不存在则默认不使用代理方式
//         * @return {Function} 返回事件处理器
//         * @author WuHuiyao (wuhuiyao@baidu.com)
//         */
//        getEventHandler: function(context, handler, ele) {
//            return function(e) {
//                if (!ele) { // 非事件代理方式
//                    return handler.apply(context, arguments);
//                }
//
//                var event = e || window.event,
//                    target = event.target || event.srcElement;
//
//                while (target && target != ele) {
//                    if (handler.call(context, event, target)) {
//                        break; // 如果handler被执行，退出
//                    }
//                    target = target.parentNode;
//                }
//            };
//        },
        /**
         * 根据给定的代理元素进行事件代理，返回代理的事件处理器
         * @param {HTMLElement} ele 用于绑定事件监听的DOM元素，即事件代理元素
         * @param {Function(...params, event, target)：boolean} handler
         *                  所要执行的事件处理器。该handler可以返回一个boolean值结果，
         *                  如果target触发了handler的执行，返回true，可以终止事件冒泡。
         * @param {Object} context handler执行所要绑定的上下文对象
         * @param {...*} params 为要执行的函数附加的参数列表，在执行的handler的前面传入
         * @return {Function}
         */
        delegate: function(ele, handler, context, params) {
            var slice = Array.prototype.slice;
            var _parm = slice.call(arguments, 3);

            return function(e) {
                var event = e || window.event;
                var target = event.target || event.srcElement;
                var argArr = _parm.concat([event]);
                var len = argArr.length;

                while (target) {
                    argArr[len] = target;
                    if (handler.apply(context, argArr)) {
                        break; // 如果handler被执行，退出
                    }

                    target = target != ele ? target.parentNode : null;
                }
            };
        }
    };
}($$, baidu);
