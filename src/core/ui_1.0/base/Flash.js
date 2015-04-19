/*
 * nirvana
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:    ui/Flash.js
 * desc:    提供Flash显示的组件
 * author:  wuhuiyao (wuhuiyao@baidu.com)  
 * date:    $Date: 2012/11/08 $
 */

/**
 * 提供Flash显示的组件
 * @class Flash
 * @namespace ui
 */
ui.Flash = function ($) {
    var flashMap = {};

    /**
     * 展现/隐藏Flash插件
     * @param {boolean} isHide 是否隐藏Flash插件
     */
    function toggleFlashPlugin(isHide, container) {
        // 保证当前flash容器是显示状态
        var flashContainer = container && $('.ui-flash-wrapper', container)[0];
        if (flashContainer) {
            isHide ? baidu.hide(flashContainer) : baidu.show(flashContainer);
        }
    }

    /**
     * Flash构造函数
     * @constructor
     * @param {Function} requester 请求数据的接口
     * @param {HTMLElement} container Flash对象渲染要挂载的DOM元素
     * @param {Object} flashConfig Flash的配置参数定义，嵌入到DOM的Flash对象初始化配置信息，
     *                             其配置的值，参见baidu.swf.createHTML方法
     * <b>Notice:</b>falsh配置选项id属性是必须的
     */
    function Flash(requester, container, flashConfig) {
        this.config = flashConfig;
        this.container = container;
        this.requester = requester;
        // 创建Loading元素
        this.loading = new ui.Loading({"container": container});
        // 缓存Flash实例
        flashMap[flashConfig.id] = this;
    }

    Flash.prototype = {
        /**
         * 定义Flash数据请求出错在Flash渲染区域显示的信息
         * @attribute errorMsg
         * @type {String}
         * @default '数据读取异常，请刷新后重试'
         * @public
         */
        errorMsg: '数据读取异常，请刷新后重试',
        /**
         * 显示加载中状态
         * @method showLoading
         * @protected
         */
        showLoading: function () {
            this.loading.show();
        },
        /**
         * 隐藏加载中状态
         * @method hideLoading
         * @protected
         */
        hideLoading: function () {
            this.loading.hide();
        },
        /**
         * 更新Flash图表数据区的内容，调用该方法前必须保证已经调用过show方法
         * 该方法，详见{@link #show}方法说明。
         * @method update
         * @param {Object} data 要更新的falsh数据
         */
        update: function (data) {
            if (data) {
                this.data = data;

                // Flash没有准备好，直接退出，什么都不做，等flash ready之后会自动更新
                // 传入的数据，所以前面要this.data = data
                if (!this.isReady) {
                    return;
                }
                var flashObj = this.getFlashObj();
                try {
                    flashObj && flashObj.setData(data);
                } catch (e) {
                    alert(e);
                }
            }
        },
        /**
         * 获取创建Flash插件对象
         * @returns {HTMLElement}
         */
        getFlashObj: function () {
            return baidu.swf.getMovie(this.config.id);
        },
        /**
         * 卸载当前Flash插件，重置flash状态及清空当前flash数据，为下次flash重新加载渲染数据
         * 做准备。主要为了减少复杂度，避免每次重新load数据，要把当前flash隐藏，避免影响当前
         * loading状态显示，此外flash下次显示又得重新显示。。
         * @private
         */
        unloadPlugin: function () {
            var me = this;
            var container = me.container;

            var exceptionEle = $('.ui-loading-exception', container)[0];
            exceptionEle && baidu.hide(exceptionEle);

            // 把当前flash插件移除掉
            var flashContainer = $('.ui-flash-wrapper', container)[0];
            flashContainer && baidu.dom.remove(flashContainer);

            me.isReady = false;
            me.data = null;
        },
        /**
         * 加载Flash用到的数据，通过执行异步请求来加载数据。请求回调不要使用callback选项，使用<br/>
         * onSuccess和onFail回调，对于onFail可以不配置，将默认使用Flash提供的失败处理器：<br/>
         * 弹窗报错，并在flash显示区域显示出错的文本信息。
         * @method loadData
         * @param {Object} requestParam
         */
        loadData: function (requestParam) {
            var me = this;

            // 卸载当前flash插件
            me.unloadPlugin();

            // 显示loading状态
            me.showLoading();
            // 执行数据请求
            var failHandler = requestParam.onFail;
            var successHandler = requestParam.onSuccess;

            requestParam.onSuccess = function (json) {
                if (!me.container) {
                    return;
                }

                me.hideLoading();
                var data = json.data;
                successHandler && successHandler(data);
            };
            requestParam.onFail = function (json) {
                if (!me.container) {
                    return;
                }

                me.hideLoading();
                // 在flash渲染的地方显示一段出错的信息
                me.showFailMsg();

                if (failHandler) {
                    failHandler(json);
                }
            };
            me.requester(requestParam);
        },
        /**
         * 在Flash区域显示数据加载出错信息
         * @method showFailMsg
         */
        showFailMsg: function () {
            var container = this.container;

            var exceptionEle = $('.ui-loading-exception', container)[0];
            if (!exceptionEle) {
                var html = fc.common.Factory.createCenterAlign(this.errorMsg);

                exceptionEle = fc.create(html);
                baidu.addClass(exceptionEle, 'ui-loading-exception request_exception');
                container.appendChild(exceptionEle);
            }

            baidu.show(exceptionEle);
        },
        /**
         * 显示Flash图表区，第一次调用会加载Flash，Flash加载成功后会自动触发Flash数据的更新<br/>
         * 如果已经加载Flash过且成功，直接调用update方法进行Flash数据的更新。
         * @method show
         * @param {Object} data 要显示的Flash的数据，可选，对于异步请求加载数据的，可以
         *                      统一在onReady事件里做数据更新以及其它flash操作。
         */
        show: function (data) {
            var me = this;
            var container = me.container;
            if (me.config && container) {
                var flashContainer = $('.ui-flash-wrapper', container)[0];
                if (me.isReady) {
                    me.update(data);
                }
                else if (!flashContainer) {
                    me.data = data;
                    // 创建Flash对象并渲染到DOM元素
                    var flashContainer = fc.create('<div class="ui-flash-wrapper"></div>');
                    container.appendChild(flashContainer);
                    baidu.swf.create(me.config, flashContainer);
                }
            }
        },
        /**
         * 销毁实例
         * @method dispose
         */
        dispose: function () {
            if (this.loading) {
                this.loading.dispose();
            }
            this.data = null;
            this.container = null;
            delete flashMap[this.config.id];
        }
    };
    /**
     * Flash插件加载成功的回调函数，由flash插件触发执行
     */
    Flash.onReady = function (id) {
        var instance = id && flashMap[id];
        if (instance) {
            instance.isReady = true;
            instance.update(instance.data);
            /**
             * Flash插件加载成功触发的事件
             * @event onReady
             */
            instance.onReady && instance.onReady();
        }
    }

    return Flash;
}($$);