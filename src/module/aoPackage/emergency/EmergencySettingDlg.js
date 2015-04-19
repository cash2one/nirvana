/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/emergency/EmergencySettingDlg.js
 * desc: 突降急救包设置对话框
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/01/06 $
 */
/**
 * 突降急救包设置对话框
 * @class EmergencySettingDlg
 * @namespace nirvana.aoPkgControl
 */
nirvana.aoPkgControl.EmergencySettingDlg = function($, ui, T, nirvana, fbs) {
    function SettingDlg() {
    }

    // 点击类型常量定义
    var CLK_TYPE = "clks";

    SettingDlg.prototype = {
        /**
         * @override
         */
        show: function(maskLevel) {
            var dlgOption = {
                id: 'emergencyPkgSetDlg',
                title: '阈值设置',
                width: 450,
                height: 150,
                maskLevel: maskLevel || nirvana.aoPkgWidgetCommon.getMaskLevel(),
                ok_button_lang: '保存'
            };

            this.init(dlgOption, 'emergencyPkgSetting');

            // 创建提示元素
            this.useTip();
//            var footEle = this._dlg.getFoot();
//            this._tipEle = fc.create(
//                '<span class="emergency_pkg_set_tip text_red inline_block"></span>'
//            );
//            footEle.appendChild(this._tipEle);

            this._requestSettingInfo();
        },
        /**
         * @override
         */
        onOk: function() {
            // check输入值是否有效
            if (!this._checkClkDecrValue()) {
                return false;
            }

            var param = {
                condition: {
                    type: CLK_TYPE,
                    value: this.getClkDecrValue()
                },
                onSuccess: this._submitSuccessHandler,
                onFail: this._submitFailHandler
            };

            nirvana.util.request(fbs.nikon.setDecrThresholdValue, param, this);
            return false;
        },
        _submitSuccessHandler: function(result) {
            // 发送监控
            nirvana.AoPkgMonitor.setDecrThresholdValueSuccess(
                CLK_TYPE, CLK_TYPE, this._oldValue, this.getClkDecrValue()
            );
            /**
             * 修改突降阈值成功触发的事件
             * @event onSuccess
             */
            nirvana.util.executeCallback(this.onSuccess, [], this);
            // 关闭对话框
            this.close();
        },
        _submitFailHandler: function() {
            ajaxFailDialog();
            // check 一下是否是由于数据设置没有符合要求导致
            this._checkClkDecrValue();
        },
        /**
         * 获取要初始化的控件的配置选项
         * @override
         */
        getWidgetConfig: function() {
            var config = {};

            this._textBoxId = 'decrClkInput';
            config[this._textBoxId] = {
                width: 30/*,
                // 注册输入变化事件处理器 由于IE7、9下还是有输入变化监听问题，这里去掉，放在提交前验证
                onchange: nirvana.util.bind(this._checkClkDecrValue, this)*/
            };
            return config;
        },
        _requestSettingInfo: function() {
            var param = {
                condition: {
                    type: CLK_TYPE
                },
                onSuccess: this._responseLoadSuccess,
                onFail: this._responseLoadFail
            };
            // 获取突降类型阈值
            nirvana.util.request(fbs.nikon.getDecrThresholdValue, param, this);
        },
        _responseLoadSuccess: function(result) {
            var data = result.data;
            this.setClkDecrValue(data.value);
        },
        _responseLoadFail: function() {
            ajaxFailDialog();
        },
        /**
         * 检查当然输入的阈值是否有效，如果无效将更新相关错误信息到界面
         * @private
         */
        _checkClkDecrValue: function() {
//            var tipEle = this._tipEle;
//
//            if (!tipEle) {
//                return;
//            }

            var value = this.getClkDecrValue();
            var msg = nirvana.validate.decrThreshold(value);
//            var validate = false;
//            var msg;
//
//            if (!value) {
//                //tipEle.innerHTML
//                msg = '设定的阈值不能为空';
//            }
//            else if (
//                !fbs.validate.number.isInt(value)
//                || +value === 0
//                || +value > 100
//                ) {
//                // tipEle.innerHTML
//                msg = '设定的阈值需要是大于0并且小于等于100的整数';
//            }
//            else {
//                // tipEle.innerHTML
//                msg = '';
//                validate = true;
//            }

            this.showTip(msg || '');

//            this._dlg.okBtn.disable(!validate);

//            return validate;
            return !msg;
        },
        /**
         * 设置点击量突降值
         * @param {string} value 要设置阈值
         */
        setClkDecrValue: function(value) {
            var inputWidget = ui.util.get(this._textBoxId);
            inputWidget && inputWidget.setValue(value);
            // 缓存当前设置的值，用于发送监控需要
            this._oldValue = value;
        },
        /**
         * 获取当前点击量突降输入框设置的值
         * @return {string}
         */
        getClkDecrValue: function() {
            var inputWidget = ui.util.get(this._textBoxId);
            return inputWidget && T.trim(inputWidget.getValue());
        },
        /**
         * 销毁推荐对话框实例
         * @override
         */
        dispose: function() {
//            this._tipEle = null;
            ui.CustomDialog.prototype.dispose.call(this);
        }
    };

    T.inherits(SettingDlg, ui.CustomDialog);
    return SettingDlg;
}($$, ui, baidu, nirvana, fbs);