/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/recmword2/RecmwordDetailView.js
 * desc: 智能提词包升级后的详情视图
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/03/13 $
 */
/**
 * 智能提词包升级后的详情视图
 * @class RecmwordDetailView
 * @namespace nirvana.aoPkgControl
 */
nirvana.aoPkgControl.RecmwordDetailView = function($, T, nirvana) {
    function RecmwordDetailView() {
    }

    RecmwordDetailView.prototype = {
        /**
         * 获取详情视图模板数据
         * @return {Object}
         * @override
         */
        getViewTplData: function() {
            var me = this;
            var tipTpl = 'RecmwordTip' +  me.getOpttypeid();
            var tip = lib.tpl.parseTpl(
                { searchword: me.getAttr('searchword') }, tipTpl, true
            );
            return {
                tip: tip
            };
        },
        /**
         * 初始化推词表格
         * @param {HTMLElement} main 渲染表格要挂载的DOM元素
         * @param {nirvana.aopkg.RecmwordTable} recmTable
         * @override
         */
        bindTableViewHandler: function(recmTable) {
            var me = this;
            // 调用父类方法
            var parentMethod = RecmwordDetailView.superClass.bindTableViewHandler;
            parentMethod.call(me, recmTable);

            // 添加推词表格显示关键词数量变化事件处理器
            recmTable.onWordsNumChange = nirvana.util.bind('onWordsNumChange', me);
        },
        /**
         * 加载推词的详情触发事件
         * @override
         */
        onLoadDetail: function() {
            var me = this;
            // 如果还没准备好，就不会发送详情请求，比如摘要请求还没回来
            if (me.getAttr('isNotReady')) {
                return false;
            }
            if (!me.getAttr('totalrecmnum')) {
                // 如果首屏词数量为0或者不存在，直接不请求
                me.requestDetailSuccess({ data: { detailresitems: [] }});
                return false;
            }
        },
        /**
         * 获取没有数据时候显示的提示消息
         * {boolean} isInit 是否当前处在初始化状态
         * @return {string}
         * @override
         */
        getNoDataTip: function(isInit) {
            var me = this;
            var tplName;

            var isSearch = me.getAttr('isSearch');
            var searchEmptyTip = 'recmwordSearchNoResultTip';
            var requestTip = 'recmwordRequestTip';

            if (isInit) {
                // 摘要请求失败，导致详情请求被中断，直接显示失败消息
                var isTimeout = me.getAttr('isTimeout');
                if (isTimeout || me.getAttr('isFail')) {
                    return me.getFailTip(isTimeout);
                }

                if (me.getAttr('isNotReady')) {
                    if (isSearch) {
                        // 对于搜索Tab没有准备好，是指输入为空，不发送请求，直接显示结果信息
                        tplName = searchEmptyTip;
                    }
                    else {
                        // 在还没发送详情请求时候，先在表格视图显示请求中话术
                        tplName = requestTip;
                    }
                }
                else {
                    // 已经准备好了，要发送详情请求
                    tplName = requestTip;
                }
            }
            else {
                tplName = isSearch ? searchEmptyTip : 'noRecmwordTip';
            }

            return er.template.get(tplName);
        },
        /**
         * 显示提示消息，在底部返回上一级右边显示
         * @param {string} tip 要显示的消息
         * @override
         */
        showTip: function(tip) {
            var tipEle = this.getAttr('tipEle');
            tipEle && (tipEle.innerHTML = tip);
        },
        /**
         * 获取批量应用按钮
         * @return {ui.Button}
         * @override
         */
        getBatchApplyBtn: function() {
            return this.getAttr('batchApplyBtn');
        }
    };

    // 继承推词视图
    T.inherits(RecmwordDetailView, nirvana.aoPkgControl.RecmwordView);

    return RecmwordDetailView;
}($$, baidu, nirvana);