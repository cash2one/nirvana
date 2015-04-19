/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path: core/common/utilities.js
 * desc: 所有可公用的静态工具方法，没有一个好的分类就放这里
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/01/04 $
 */
/**
 * 工具方法定义
 * @namespace nirvana
 */
nirvana.util = function($, T) {

    return {

        /**
         * 当前用于debug模式的异常披露
            后续可用于出错时的log记录
         */
        logError: function(msg) {
            var isDebug = IS_DEBUG_MODE || false;
            if(isDebug) {
                try{
                    throw new Error(msg);
                }
                catch(e) {
                    console.error(e.message);
                }
            }
        },

        /**
         * 对要执行的函数绑定上下文，可选的可以对要执行的函数追加参数
         * @param {(Function | string)} handler 要执行的函数或者函数名
         * @param {Object} context 要执行的函数的上下文
         * @param {...*} params 为要执行的函数附加的参数列表，在执行的handler的前面传入
         * @return {Function}
         * @author Wuhuiyao (wuhuiyao@baidu.com)
         * @example
         *      <code>
         *      nirvana.util.bind(myHandler, context, 1, [33,55])
         *      // 或 nirvana.util.bind('handlerName', context)
         *      // 触发回调myHandler的执行:param1:1,param2:[33,55],otherparams：
         *      // 其它触发该回调传入的参数，如果是事件回调，otherparams就为事件对象
         *      myHandler: function(param1, parm2, otherparams) {}
         *      </code>
         */
        bind: function(handler, context, params) {
            var slice = Array.prototype.slice;
            var _parm = slice.call(arguments, 2);
            if (typeof handler === 'string') {
                handler = context[handler];
            }
            return function() {
                var argArr = slice.call(arguments, 0);
                return handler.apply(context, _parm.concat(argArr));
            }
        },
        /**
         * 加强baidu.object.extend方法
         * @param {Object|undefined} options 选项对象，该方法会对该对象进行修改，
         *                           如果其不为null/undefined
         * @param {Object|undefined} defaultOptions 默认选项对象，该方法不会对其进行修改
         * @return {Object} 返回扩展后的选项对象，该方法不会返回null/undefined，
         *                  若两个参数都是undefined，返回空对象
         * @author Wuhuiyao (wuhuiyao@baidu.com)
         */
        extend: function(options, defaultOptions) {
            options = options || {};

            var config = options;
            if (defaultOptions) {
                config = T.object.clone(defaultOptions);
                T.extend(config, options);
            }

            return config;
        },
        /**
         * 深度extend
            baidu.object.extend方法不支持深度，如果子对象是引用类型，会导致级联……
         */
        deepExtend: function(target, source) {
            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    if(T.lang.isObject(source[key])) {
                        if('undefined' == typeof target[key]
                            || typeof target[key] !== typeof source[key]) {
                            target[key] = T.object.clone(source[key]);
                        }
                        else {
                            nirvana.util.deepExtend(target[key], source[key]);
                        }
                    }
                    else {
                        target[key] = source[key];
                    }
                }
            }

            return target;
        },
        /**
         * 用于封装请求数据接口，可以对请求响应的回调函数的执行进行上下文绑定
         * @param {Function} requester 执行数据请求的接口
         * @param {Object} param 数据请求的参数
         * @param {Object} context 用来绑定请求响应的回调函数执行的上下文
         * @author Wuhuiyao (wuhuiyao@baidu.com)
         */
        request: function(requester, param, context) {
            if (context) {
                var handlerArr = ['onFail', 'onSuccess', 'callback', 'onTimeout'];
                var handler;
                var proxy = nirvana.util.bind;
                for (var i = 0, len = handlerArr.length; i < len; i ++) {
                    if ((handler = param[handlerArr[i]])) {
                        param[handlerArr[i]] = proxy(handler, context);
                    }
                }
            }
            // 执行数据请求
            requester(param);
        },
        /**
         * 用于校验后端返回的值是否是空的值：以下几种情况都认为是空的值
         * null, undefined, 'null', ''
         * @param {Any} value 要check的值
         * @return  {boolean}
         * @author Wuhuiyao (wuhuiyao@baidu.com)
         */
        isEmptyValue: function(value) {
            return (null === value || typeof value == 'undefined'
                || '' === value || 'null' === value);
        },
        /**
         * 判断给定值是否是未定义
         * @param {*} value 要判断的值
         * @return {boolean}
         */
        isUndef: function(value) {
            return 'undefined' === typeof value;
        },
        /**
         * 执行回调函数
         * @method executeCallback
         * @param {Function|string} callback 要执行的回调函数或者函数名
         * @param {Array} paramArr 要执行的回调函数要传递的参数数组
         * @param {Object} context 执行的回调函数的上下文
         * @return {*}
         * @author Wuhuiyao (wuhuiyao@baidu.com)
         */
        executeCallback: function(callback, paramArr, context) {
            var func = callback;
            (typeof func === 'string') && (func = context && context[func]);

            if (typeof func === 'function') {
                return func.apply(context, paramArr || []);
            }
        },
        /**
         * 获取默认请求失败的处理器：直接弹窗出错
         * @param {string} title 弹窗的标题，可选
         * @param {string} content 弹窗的消息，可选
         * @return {Function}
         */
        getReqFailHandler: function(title, content) {
            return function() {
                ajaxFailDialog(title, content);
            };
        },
        /**
         * 获取请求超时的默认处理器，以弹窗方式
         * @param {string} title 弹窗的标题，可选，默认为'数据获取超时'
         * @param {string} content 弹窗的内容，可选，默认为'数据获取超时，请刷新后重试！'
         * @return {Function}
         */
        getReqTimeoutHandler: function(title, content) {
            title = title || '数据获取超时';
            content = content || '数据获取超时，请刷新后重试！';
            return function() {
                ajaxFailDialog(title, content);
            };
        },
        /**
         * 拷贝指定源对象的特定属性，返回新的对象，注意这里是浅拷贝。
         * 可以指定要拷贝的属性名拷贝后的新的属性名。
         * @param {Object} sourceObj 要拷贝的源对象
         * @param {Array|string|Object|null} attrNames 要拷贝的属性，可以指定多个，传入
         *        数组，如果要为拷贝的属性指定新的属性名，通过k-v对象方式传入,key为源对象的属
         *        性名，value为拷贝后要赋予的新属性名, 如果跟原来一样，可以直接设为空串。
         *        如果attrNames为指定，即值未定义或Null将直接返回源对象。
         * @return {Object}
         * @example
         *      <code>
         *          nirvana.util.copy({a: 3, b: 5}, 'a')
         *          result: {a: 3}
         *
         *          nirvana.util.copy({a: 3, b: 5}, ['a', 'b'])
         *          result: {a: 3, b: 5}
         *
         *          nirvana.util.copy({a: 3, b: 5}, {a: '', b: 'c'})
         *          result: {a: 3, c: 5}
         *      </code>
         */
        copy: function(sourceObj, attrNames) {
            if (attrNames) {
                var isArr = T.lang.isArray(attrNames);
                if (!isArr && typeof attrNames !== 'object') {
                    attrNames = [attrNames];
                    isArr = true;
                }

                var value = {};
                var name;
                var newAttrName;
                for (var k in attrNames) {
                    name = isArr ? attrNames[k] : k;
                    newAttrName = attrNames[k] === '' ? k : attrNames[k];
                    value[newAttrName] = sourceObj[name];
                }

                return value;
            }
            else {
                return sourceObj;
            }
        }
    };
}($$, baidu);



