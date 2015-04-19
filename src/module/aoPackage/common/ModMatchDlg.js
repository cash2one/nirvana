/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/common/ModMatchDlg.js
 * desc: 修改关键词匹配对话框
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/05/18 $
 */
/**
 * 修改关键词匹配对话框
 * @class ModMatchDlg
 * @namespace nirvana.aopkg
 * @extends ui.CustomDialog
 */
nirvana.aopkg.ModMatchDlg = function($, ui, T, nirvana) {
    function ModMatchDlg() {

    }

    ModMatchDlg.prototype = {
        /**
         * 显示关键词匹配修改对话框
         * @param {Object} initData 浮出层初始化数据
         * @param {number} initData.winfoid 要修改的关键词的winfoid
         * @param {string} initData.showword 要修改的关键词的字面值
         * @param {number} initData.showqstar 关键词的质量度
         * @param {number} initData.bid 关键词当前出价
         * @param {number} initData.wmatch 关键词当前匹配
         * @param {number} initData.recmwmatch 关键词建议匹配
         * @override
         */
        show: function(initData) {
            var me = this;

            var dlgOption = {
                id: 'modWMatchDlg',
                title: '修改关键词匹配',
                width: 600,
                maskLevel: nirvana.aoPkgWidgetCommon.getMaskLevel()
            };

            var tplData = T.object.clone(initData);
            tplData.showqstar = qStar.getStar(initData.showqstat);
            tplData.showword = T.encodeHTML(initData.showword);
            tplData.recmwmatch = MTYPE[initData.recmwmatch];
            tplData.bid = baidu.number.fixed(+initData.bid || initData.unitbid);

            // 初始化对话框，'aopkgModWBidForm'为模板名
            me.init(dlgOption, 'aopkgModWMatchForm', tplData, initData);

            // 创建提示元素
            me.useTip();
        },
        /**
         * @override
         */
        onOk: function() {
            var me = this;

            me.showTip('');

            var newWMatchValue = me._widgetMap.AddwordWmatch.getValue();
            var failHandler = nirvana.bizUtil.getModMaterialFailHandler(
                function (errorCode) {
                    me.modWMatchFail(errorCode);
                }
            );

            fbs.keyword.modWmatch({
                winfoid: [me.getAttr('winfoid')],
                wmatch: newWMatchValue,
                onSuccess: nirvana.util.bind('modWMatchSuccess', me, newWMatchValue),
                onFail: failHandler
            });

            return false;
        },
        modWMatchSuccess: function (newWMatch) {
            var me = this;

            // 更新本地数据缓存信息
            var winfoid = me.getAttr('winfoid');
            nirvana.bizUtil.updateWordCacheOfMatch(newWMatch, winfoid);

            var wordInfo = me.getAttr();
            /**
             * 修改关键词出价成功的事件回调
             * @event onSuccess
             * @param {number} winfoid 所修改关键词的winfoid
             * @param {number} newWMatch 修改后的关键词新的匹配
             * @param {number} oldWMatch 修改前关键词的匹配
             */
            nirvana.util.executeCallback('onSuccess', [wordInfo, newWMatch], me);

            // 关闭对话框
            me.close();
        },
        modWMatchFail: function (errorCode) {
            var errorMsg = nirvana.bizUtil.getMaterialModErrorInfo(errorCode);
            this.showTip(errorMsg);
        },
        /**
         * 获取要初始化的控件的配置选项
         * @override
         */
        getWidgetConfig: function() {
            return {
                wordBid: {
                    value: this.getAttr('bid'),
                    width: 150
                },
                AddwordWmatch: {
                    datasource: nirvana.config.WMATCH.DATASOURCE,
                    value: this.getAttr('wmatch'),
                    width: 150
                }
            };
        }
    };

    T.inherits(ModMatchDlg, ui.CustomDialog);

    return ModMatchDlg;
}($$, ui, baidu, nirvana);