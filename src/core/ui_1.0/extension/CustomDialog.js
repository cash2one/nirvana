/*
 * nirvana
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path:    ui/CustomDialog.js
 * desc:    定制的对话框组件，用于不走ER流程来初始化渲染一个对话框
 * author:  wuhuiyao (wuhuiyao@baidu.com)
 * date:    $Date: 2012/12/03 $
 */

/**
 * 定制的对话框组件，用于不走ER流程来初始化渲染一个对话框
 * @class CustomDialog
 * @namespace ui
 */
ui.CustomDialog = function($, T, ui) {
    /**
     * 定制对话框的构造函数
     * @constructor
     */
    function CustomDialog() {
    }

    var bindContext = nirvana.util.bind;

    CustomDialog.prototype = {
        /**
         * 初始化对话框内容
         * @method init
         * @protected
         */
        init: function(dlgOption, tplName, tplData, attrData) {
            if (this._dlg) {
                return;
            }

            dlgOption = dlgOption || {};
            // 创建对话框
            this._dlg = ui.Dialog.factory.create(dlgOption);
            // 初始化视图元素
            this._elem = $('#' + this._dlg.getId())[0];
            // 初始化上下文属性
            this.initAttrs(attrData);
            // 初始化对话框内容
            this.initDlgContent(tplName, tplData);
            // 绑定对话框的事件处理器
            this.bindHandlers();
        },
        /**
         * 绑定事件处理器
         * @method bindHandlers
         * @protected
         */
        bindHandlers: function() {
            var me = this,
                dlg = me._dlg;

            // 绑定对话框关闭事件处理器
            dlg.onclose = bindContext(me.dispose, me);
            // 无奈oncancel执行前，dialog还未hide，不能立刻执行dispose
            // 修改原始的hide方法，让其触发onclose事件
            dlg.hide = function() {
                // 调用原始的Hide函数
                ui.Dialog.prototype.hide.call(this);
                // 触发关闭事件
                this.onclose();
            };
            // 重写close方法，避免两次触发onclose，由于重写的hide又触发了一次onclose
            // 而原来的close方法执行了hide和onclose这两个方法
            dlg.close = function(param) {
                // 通过右上角的关闭按钮也是会触发onCancel事件，点击取消和'x'触发同一类事件
                // 这里param为了保持跟原有对话框关闭传递参数一致，故这里这么干
                var result = me.onCancel.call(me, param === 'x' ? param : undefined);
                (result !== false) && dlg.hide();
            };

            // 绑定对话框确定的事件处理
            dlg.onok = bindContext(me.onOk, me);
            // 重写对话框取消按钮的事件处理
            dlg.cancelBtn && (dlg.cancelBtn.onclick = dlg.close);
        },
        /**
         * 初始化对话框的内容
         * @private
         */
        initDlgContent: function (tplName, tplData) {
            var dlg = this._dlg;

            // 初始化对话框内容
            var tpl = lib.tpl.parseTpl(tplData || {}, tplName, true);
            dlg.setContent(tpl);

            // 初始化对话框内容的组件
            this.initWidgets();
        },
        /**
         * 初始化对话框内容的组件
         * @method initWidgets
         * @protected
         */
        initWidgets: function() {
            var config = this.getWidgetConfig();
            this._widgetMap = ui.util.init(this._elem, config);
        },
        /**
         * 获取对话框初始化创建的UI组件
         * @param {string} id ui控件的id
         * @return {Object}
         */
        getUI: function(id) {
            return this._widgetMap[id];
        },
        /**
         * 获取要初始化的控件的配置选项，默认返回null
         * @method getWidgetConfig
         * @protected
         * @return {Object} 要初始化的控件的配置选项，具体定义见
         *                 {@link ui.util.init}方法的第二个参数说明
         */
        getWidgetConfig: function() {
            return null;
        },
        /**
         * 获取对话框内部元素
         * @param {string} selector 元素选择器
         * @return {HTMLElement}
         */
        getElement: function(selector) {
            return this._elem && $(selector, this._elem);
        },
        /**
         * 使用Tip元素，用于在确定取消按钮边上显示提示消息，可以传入定制的Tip样式名，默认警告消息
         * 样式，该方法必须在对话框初始化结束后调用
         * @param {?string} styleName 定制的样式名，可选
         */
        useTip: function(styleName) {
            // 创建提示元素
            var footEle = this._dlg.getFoot();
            var tpl = '<div class="warn-info ' + (styleName || '') + '"></div>';
            this._tipEle = fc.create(tpl);
            footEle.appendChild(this._tipEle);
        },
        /**
         * 显示提示消息，必须启用Tip调用该方法才有效，即调用方法{@link #useTip}
         * @param {string} msg
         */
        showTip: function(msg) {
            this._tipEle && (this._tipEle.innerHTML = msg || '');
        },
        /**
         * 点击确定的默认事件处理器
         * @event onOk
         * @return {Boolean} 不允许关闭，return false
         */
        onOk: function() {
            return false;
        },
        /**
         * 点击取消的默认事件处理器，通过点击取消按钮或者右上角的'x'都会触发该事件
         * @event onCancel
         * @param {boolean} cancelByX 是否是通过对话框右上角的关闭按钮取消关闭
         * @return {Boolean} 不允许关闭，return false
         */
        onCancel: function(cancelByX) {
        },
        /**
         * 显示对话框
         * @param {Object} dlgOption 对话框的配置属性，参见{@link ui.Dialog}的属性
         *                           配置，NOTICE: 不要尝试在选项里绑定事件的处理
         * @param {String} tplName 对话框内容的模板的名称
         * @param {Object} tplData 模板数据，可选
         * @param {Object} attrData 要初始化的属性数据，可选
         * @method show
         */
        show: function(dlgOption, tplName, tplData, attrData) {
            this.init(dlgOption, tplName, tplData, attrData);
        },
        /**
         * 关闭对话框
         * @method close
         */
        close: function() {
            // 关闭对话框
            this._dlg.hide();
        },
        /**
         * 对话框是否已经被关闭
         * @return {boolean}
         */
        isClosed: function() {
            return !this._dlg;
        },
        /**
         * 销毁实例, 对话框关闭后，会自动调用该方法
         * @method dispose
         */
        dispose: function() {
            ui.util.disposeWidgetMap(this._widgetMap);
            // ui.Dialog.factory.create的对话框的dispose比较特殊
            ui.util.disposeDlg(this._dlg);
            this._dlg = null;
            this._elem = null;
            this._tipEle = null;
            this.clearAttr();
        }
    };
    // 支持属性读写功能
    T.extend(CustomDialog.prototype, nirvana.attrHelper);

    return CustomDialog;
}($$, baidu, ui);