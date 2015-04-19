/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/common/ModBidDlg.js
 * desc: 修改关键词出价对话框
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/05/17 $
 */
/**
 * 修改关键词出价对话框
 * @class ModBidDlg
 * @namespace nirvana.aopkg
 * @extends ui.CustomDialog
 */
nirvana.aopkg.ModBidDlg = function($, ui, T, nirvana) {
    function ModBidDlg() {
    }

    ModBidDlg.prototype = {
        /**
         * 显示关键词出价修改对话框
         * @param {Object} initData 浮出层初始化数据
         * @param {number} initData.winfoid 要修改的关键词的winfoid
         * @param {string} initData.showword 要修改的关键词的字面值
         * @param {number} initData.showqstar 关键词的质量度
         * @param {number} initData.bid 关键词当前出价
         * @param {number} initData.recmbid 关键词建议出价
         * @param {string} initData.reason 关键词建议原因
         * @override
         */
        show: function(initData) {
            var me = this;

            var dlgOption = {
                id: 'modWBidDlg',
                title: '修改关键词出价',
                width: 600,
                maskLevel: nirvana.aoPkgWidgetCommon.getMaskLevel()
            };

            var tplData = T.object.clone(initData);
            tplData.showqstar = qStar.getStar(initData.showqstat);
            tplData.showword = T.encodeHTML(initData.showword);
            tplData.reason = nirvana.aoPkgWidgetRender.reason(initData);
            tplData.recmbid = T.number.fixed(initData.recmbid);
            // 初始化对话框，'aopkgModWBidForm'为模板名
            me.init(dlgOption, 'aopkgModWBidForm', tplData, initData);

            // 创建提示元素
            me.useTip();

            me.getWBidInputUI().focusAndSelect();
        },
        /**
         * @override
         */
        onOk: function() {
            var me = this;

            me.showTip('');

            var newBidValue = T.string.trim(me.getWBidInputUI().getValue());
            var failHandler = nirvana.bizUtil.getModMaterialFailHandler(
                function (errorCode) {
                    me.modWBidFail(errorCode);
                }
            );

            fbs.keyword.modBid({
                winfoid: [me.getAttr('winfoid')],
                bid: newBidValue,
                onSuccess: nirvana.util.bind('modWBidSuccess', me, newBidValue),
                onFail: failHandler
            });

            return false;
        },
        modWBidSuccess: function (newWBid, response) {
            var me = this;

            // 更新本地数据缓存信息
            var winfoid = me.getAttr('winfoid');
            nirvana.bizUtil.updateWordCacheOfBid(newWBid, winfoid, response);

            var wordInfo = me.getAttr();
            /**
             * 修改关键词出价成功的事件回调
             * @event onSuccess
             * @param {number} winfoid 所修改关键词的winfoid
             * @param {number} newWBid 修改后的关键词新的出价
             * @param {number} oldWBid 修改前关键词的出价
             */
            nirvana.util.executeCallback('onSuccess', [wordInfo, newWBid], me);

            // 关闭对话框
            me.close();
        },
        modWBidFail: function (errorCode) {
            var errorMsg = nirvana.bizUtil.getMaterialModErrorInfo(errorCode);
            this.showTip(errorMsg);

            this.getWBidInputUI().focusAndSelect();
        },
        /**
         * 获取关键词出价输入控件
         * @returns {ui.TextInput}
         */
        getWBidInputUI: function () {
            return this._widgetMap.wordBid;
        },
        /**
         * 获取要初始化的控件的配置选项
         * @override
         */
        getWidgetConfig: function() {
            var bid = +this.getAttr('bid');
            bid = bid || this.getAttr('unitbid');
            return {
                wordBid: {
                    value: baidu.number.fixed(bid),
                    width: 150
                }
            };
        }
    };

    T.inherits(ModBidDlg, ui.CustomDialog);

    return ModBidDlg;
}($$, ui, baidu, nirvana);