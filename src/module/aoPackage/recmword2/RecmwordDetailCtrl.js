/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/recmword2/RecmwordDetailCtrl.js
 * desc: 智能提词包推荐的词的详情控制类
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/02/19 $
 */
/**
 * 智能提词包推荐的词的详情控制类
 * @class RecmwordDetailCtrl
 * @namespace nirvana.aoPkgControl
 */
nirvana.aoPkgControl.RecmwordDetailCtrl = function($, T, ui, nirvana) {
    /**
     * 推词详情控制器
     * @constructor
     */
    function RecmwordDetailCtrl() {
    }

    RecmwordDetailCtrl.prototype = {
        /**
         * 初始化推词详情的控制器
         * @param {nirvana.RecmwordPackage2} pkgInstance
         * @param {HTMLElement} container 当前视图容器
         */
        init: function(pkgInstance, container) {
            // 初始化要渲染的视图
            this._view = $('#recmword-tab-container', container)[0];
            this._tipEle = $('.warn-info', container)[0];
            this._pkg = pkgInstance;
        },
        /**
         * 显示详情信息
         * @param {Object} initData 要初始化详情的上下文数据
         */
        show: function(initData) {
            var me = this;

            // 卸载旧的详情信息
            me.unloadDetail();

            me._recmwordView = me.createRecmwordView(initData);
            me._recmwordView.show(me._view);
        },
        /**
         * 创建推词详情视图
         * @param {Object} initData 要初始化数据
         * @return {nirvana.aoPkgControl.RecmwordDetailView}
         */
        createRecmwordView: function(initData) {
            var me = this;
            var opttypeid = initData.opttypeid;
            var view = new nirvana.aoPkgControl.RecmwordDetailView();
            var params = {
                tpl: 'recmwordTabContent',
                title: '关键词检索量过低',
                contentStyle: 'aopkg_widget_table',
                tableStyle: 'recmword-table',
                applyBtnLabel: '添加所选',
                applyType: 'addWords',
                fields: me.getFieldConf(opttypeid),
                batchApplyBtn: me._pkg.getAddWordBtn(),
                tipEle: me._tipEle
            };
            T.object.extend(params, initData);
            view.init(params);

            // 添加推词表格显示关键词数量变化事件处理器
            view.onWordsNumChange = function(showWordNum) {
                me._pkg.updateTabInfo(opttypeid, showWordNum);
            };

            return view;
        },
        /**
         * 获取当前显示的详情视图
         * @return {nirvana.aoPkgControl.RecmwordDetailView}
         */
        getDetailView: function() {
            return this._recmwordView;
        },
        /**
         * 获取推词表格的域配置
         * @param {string} opttypeid 推词的优化项类型id
         * @return {Array}
         */
        getFieldConf: function(opttypeid) {
            var titleMap = {
                501: '添加热搜词',
                502: '添加潜力词',
                504: '添加行业词'
            }

            switch (+ opttypeid) {
                // 501: 热搜词
                case 501:
                // 502: 潜力词
                case 502:
                // 504: 行业词
                case 504:
                    return [
                        ['addword', { title: titleMap[opttypeid], width: 80 }],
                        'pv',
                        'kwc',
                        'recmbid_editable',
                        'recmwmatch_editable',
                        'addshorttarget'
                    ];
                // 503: 质优词
                case 503:
                    return [
                        ['addword', { title: '添加质优词', width: 65 }],
                        ['pv', { width: 80 }],
                        ['kwc', { width: 90 }],
                        ['recmbid_editable', { width: 80 }],
                        ['recmwmatch_editable', { width: 80 }],
                        'addshorttarget',
                        'lowPresentWord'
                    ];
                // 505: 关键词搜索
                case 505:
                    return [
                        ['addword', { title: '添加关键词', width: 80 }],
                        'pv',
                        'kwc',
                        ['recmbid_editable', { width: 100 }],
                        ['recmwmatch_editable', { width: 100 }],
                        'addshorttarget'
                    ];
            }
        },
        /**
         * 卸载当前推词详情信息
         * @private
         */
        unloadDetail: function() {
            var recmwordView = this._recmwordView;
            if (recmwordView) {
                recmwordView.disableBatchBtn(true);
                recmwordView.clearTip();
                recmwordView.dispose();
            }
            // 避免优化包关掉时候表格DOM元素没有移除掉，导致打开其它优化包包含相同ID元素获取
            // 失败，比如更多按钮
            this._view && (this._view.innerHTML = '');
        },
        /**
         * 销毁推词控制器实例
         */
        dispose: function() {
            this.unloadDetail();
            this._pkg = null;
            this._tipEle = null;
            this._recmwordView = null;
            this._view = null;
        }
    };

    return RecmwordDetailCtrl;
}($$, baidu, ui, nirvana);