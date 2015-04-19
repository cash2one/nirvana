/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/season/SeasonPkg.js
 * desc: 行业旺季包定义，扩展自aoPackage.js
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/05/07 $
 */
/**
 * 行业旺季包定义
 * @class SeasonPackage
 * @namespace nirvana
 * @extends nirvana.aoPackage
 */
nirvana.SeasonPackage = function(T, nirvana) {
    // 选择的Tab样式定义
    var SEL_TAB_CLASS = 'selected-tab';
    // 请求所有行业的trade id
    var ALL_TRADE_ID = -1;
    // 预定义的全部行业Tab
    var ALL_TRADE_TAB_ITEM = {
        tradeid: ALL_TRADE_ID,
        tradename: '全部行业'
    };
    // 全部旺季行业优化建议标题显示的行业名称
    var ALL_TRADE_NAME = '全部旺季';

    /**
     * 各种旺季类型常量定义
     */
    // 旺季前行业类型
    var BEFORE_PEAK_TRADE = 1;
    // 旺季中行业类型
    var IN_PEAK_TRADE = 2;
    // 旺季末行业类型
    var AFTER_PEAK_TRADE = 3;

    function getChangeClass(changeValue) {
        if (nirvana.util.isEmptyValue(changeValue)) {
            return '';
        }
        return changeValue >= 0 ? 'up' : 'down';
    }

    var seasonPkg = {
        /**
         * 渲染行业旺季包对话框内容
         * @override
         */
        renderAppAllInfo: function () {
            var me = this;

            // 初始化旺季包内容
            me.renderBasicInfo();
            me.$('.aopkg_overview_main')[0].innerHTML = er.template.get('seasonPkgContent');

            // 初始化上下文属性
            me.initAttrs();

            // 设置当前优化包上下文属性信息，确保在当前上下文后续发送监控能带上该参数：默认为全部行业
            nirvana.aoPkgControl.logCenter.extendDefault({ tradeid: ALL_TRADE_ID });

            // 渲染旺季行业Tab:初始化时候先显示“全部行业”
            me.renderTradeNavTab([ALL_TRADE_TAB_ITEM]);

            // 渲染Flash图表区
            me.renderDataArea();

            // 加载旺季行业列表
            me.reqAllTradeList();

            // 渲染优化建议区域
            me.renderOptimizeArea();
        },
        /**
         * 渲染图表区域
         * @override
         */
        renderDataArea: function() {
            var me = this;
            var FlashCtrl = me.controller.SeasonPkgFlashCtrl;

            me.dataCtrl = new FlashCtrl({
                pkgid: me.pkgid,
                view: me.$('.season-pkg-flash-wrapper')[0]
            });
            me.dataCtrl.onLoad = function(tradeId, tradeType, descData) {
                me.hideLoading();
                me.renderTradeDescription(tradeId, tradeType, descData);
            };
        },
        /**
         * 渲染优化建议区域
         */
        renderOptimizeArea: function () {
            var me = this;

            // 默认显示全部旺季行业的优化建议信息
            me.setOptimizeItemsTradeName(ALL_TRADE_NAME, false);

            // 渲染详细优化建议内容
            var newoptions = T.object.clone(me.optimizer);
            T.extend(newoptions, {
                modifiedItem: me.data.get('modifiedItem'),
                level: me.level,
                view: me.$('.season-pkg-optitem-wrapper')[0],
                tradeId: ALL_TRADE_ID
            });
            me.optimizerCtrl = new nirvana.aoPkgControl.SeasonPkgOptimizeCtrl(
                me.pkgid, newoptions);
            me.optimizerCtrl.show();
        },
        /**
         * 请求所有旺季行业信息（用于显示旺季行业Tab）
         */
        reqAllTradeList: function () {
            var me = this;
            var param = {
                pkgid: me.pkgid,
                onSuccess: me.loadTradeListSuccess,
                onFail: me.loadTradeListFail
            };

            // 显示loading图标
            me.showLoading();

            // 发送数据请求
            nirvana.util.request(fbs.nikon.getPeakTradeList, param, me);
        },
        /**
         * 显示旺季行业信息loading状态
         */
        showLoading: function() {
            this.toggleLoading(true);
        },
        /**
         * 隐藏旺季行业信息loading状态
         */
        hideLoading: function () {
            this.toggleLoading(false);
        },
        /**
         * 切换loading状态的显示/隐藏
         * @param {boolean} isShow 是否显示loading状态
         */
        toggleLoading: function (isShow) {
            var loadingEle = this.$('.season-pkg-descr-loading')[0];
            if (loadingEle) {
                var toggleClass = isShow ? T.removeClass : T.addClass;
                toggleClass(loadingEle, 'hide');
            }
        },
        /**
         * 加载旺季行业列表成功处理
         * @param {Object} response 响应的数据对象
         */
        loadTradeListSuccess: function (response) {
            this.hideLoading();

            // 初始化全部旺季行业信息
            var tradeInfo = response.data.desc;
            this.setAttr('allTradeInfo', tradeInfo);

            // 渲染旺季行业Tab
            var tradeList = response.data.listData || [];
            tradeList.unshift(ALL_TRADE_TAB_ITEM);
            this.setAttr('tradeList', tradeList);
            this.renderTradeNavTab(tradeList);

            // 显示全部旺季行业的描述信息
            this.showAllTradeDescInfo();
        },
        /**
         * 加载旺季行业列表失败处理
         */
        loadTradeListFail: function () {
            this.hideLoading();
            ajaxFailDialog("获取旺季行业信息失败");

            // 显示全部旺季行业的描述信息
            this.showAllTradeDescInfo();
        },
        /**
         * 渲染旺季行业导航Tab
         * @param {Array} tradeList 旺季行业列表
         */
        renderTradeNavTab: function (tradeList) {
            var me = this;

            var TRADE_TAB_CLASS = {};
            TRADE_TAB_CLASS[BEFORE_PEAK_TRADE] = 'peak-season-start';
            TRADE_TAB_CLASS[IN_PEAK_TRADE] = 'peak-season-ing';
            TRADE_TAB_CLASS[AFTER_PEAK_TRADE] = 'peak-season-end';

            var tradeItem;
            var isAllTrade;
            var tradeClass;
            var tabListHtml = '';

            for (var i = 0, len = tradeList.length; i < len; i ++) {
                tradeItem = tradeList[i];
                isAllTrade = me.isAllTrade(tradeItem.tradeid);
                tradeClass = TRADE_TAB_CLASS[tradeItem.tradetype];

                tabListHtml += lib.tpl.parseTpl({
                    tabClass: isAllTrade ? SEL_TAB_CLASS : tradeClass,
                    tradeId: tradeItem.tradeid,
                    tradeType: tradeItem.tradetype,
                    iconType: isAllTrade ? '' : tradeClass,
                    iconClass: isAllTrade ? 'hide' : '',
                    tradeName: tradeItem.tradename,
                    tradeTitle: T.encodeHTML(tradeItem.tradename)
                }, 'seasonPkgTabItem', true);
            }

            var tabList = this.$('.trade-tab-list')[0];
            tabList.innerHTML = tabListHtml;

            // 初始化旺季类型Icon的Bubble
            ui.Bubble.init(this.$('.peak-season-icon'));
        },
        /**
         * 渲染旺季行业Tab下的描述信息
         * @param {number} tradeId 旺季行业的id
         * @param {number} tradeType 旺季行业的类型：旺季前、中、末
         * @param {Object} descrData 旺季行业具体的描述数据
         */
        renderTradeDescription: function (tradeId, tradeType, descrData) {
            var me = this;

            var descrHtml;
            if (me.isAllTrade(tradeId)) { // 全部行业显示话术处理逻辑
                var beforePeakNum = +descrData.beforepeaknum || 0;
                var inPeakNum = +descrData.inpeaknum || 0;
                var afterPeakNum = +descrData.afterpeaknum || 0;

                if (beforePeakNum || inPeakNum) {
                    var tplName = 'seasonPkgAllTradeDescr';
                    if (!beforePeakNum) {
                        tplName += 'In';
                    }
                    else if (!inPeakNum) {
                        tplName += 'Before';
                    }
                    descrHtml = lib.tpl.parseTpl({
                        beforePeakNum: beforePeakNum,
                        inPeakNum: inPeakNum
                    }, tplName, true);
                }
                else if (afterPeakNum) {
                    descrHtml = lib.tpl.parseTpl({
                        num: afterPeakNum
                    }, 'seasonPkgAllTradeAfterPeakDescr', true);
                }
            }
            else if (descrData) { // 具体旺季行业显示的话术
                descrHtml = me.getTradeDescrHtml(tradeId, tradeType, descrData);
            }

            me.setTradeDscrInfo(descrHtml || FILL_HTML.EXCEPTION);
        },
        /**
         * 查找指定的tradeId所对应的行业信息
         * @param {number} tradeId 行业id
         * @returns {Object}
         */
        findTradeItemInfo: function (tradeId) {
            var tradeList = this.getAttr('tradeList') || [];
            for (var i = 0, len = tradeList.length; i < len; i ++) {
                if (tradeList[i].tradeid == tradeId) {
                    return tradeList[i];
                }
            }
        },
        /**
         * 获取具体的旺季行业的描述信息显示的HTML
         * @param {number} tradeId 旺季行业的id
         * @param {number} tradeType 旺季行业的类型：旺季前、中、末
         * @param {Object} descrData 旺季行业具体的描述数据
         * @returns {string}
         */
        getTradeDescrHtml: function (tradeId, tradeType, descrData) {
            var me = this;
            var tplName;
            var tplData = {};
            var tradePvChange = +descrData.tradepvratio;

            switch (+tradeType) {
                case BEFORE_PEAK_TRADE:
                    tplName = 'seasonPkgTradePeakStartDescr';
                    tplData = me.getTradeDescrTplData(tradePvChange);

                    break;
                case IN_PEAK_TRADE:
                    tplName = 'seasonPkgTradeInPeakDescr';

                    var clkRatio = +descrData.clkratio;
                    var showChange;
                    var clkChange;
                    var unit = '';

                    if (clkRatio <= 1000) {
                        showChange = +descrData.showratio;
                        clkChange = +descrData.clkratio;
                        unit = '%';
                    }
                    else { // 超过1000表示点击量增幅太大
                        showChange = +descrData.show;
                        clkChange = +descrData.clk;
                    }

                    tplData = me.getTradeDescrTplData(
                        tradePvChange, showChange, clkChange, unit);

                    break;
                case AFTER_PEAK_TRADE:
                    tplName = 'seasonPkgTradePeakEndDescr';

                    var showChange = +descrData.avgshow;
                    var clkChange = +descrData.avgclk;

                    tplData = me.getTradeDescrTplData(
                        tradePvChange, showChange, clkChange);

                    break;
            }

            if (tplName) {
                return lib.tpl.parseTpl(tplData, tplName, true);
            }

            return '';
        },
        /**
         * 获取旺季行业Tab描述信息的模板的数据
         * @param {number} tradePvChange 行业检索量变化值
         * @param {?number} showChange 用户的展现量（比例）变化值
         * @param {?number} clkChange 用户的点击量（比例）变化值
         * @param {?string} unit 用户的展现/点击变化值的单位
         * @returns {Object}
         */
        getTradeDescrTplData: function (tradePvChange, showChange, clkChange, unit) {
            var tplData = {
                changeTypeClass: getChangeClass(tradePvChange),
                tradePvChange: Math.abs(tradePvChange)
            };

            T.object.extend(tplData, {
                showChangeClass: getChangeClass(showChange),
                showChange: showChange && Math.abs(showChange),
                clkChangeClass: getChangeClass(clkChange),
                clkChange: clkChange && Math.abs(clkChange),
                unit: unit
            });

            return tplData;
        },
        /**
         * 设置旺季行业Tab展现的描述信息
         * @param {string} html 要展现的html字符串
         */
        setTradeDscrInfo: function (html) {
            var descrContainer = this.$('.season-pkg-descr-wrapper')[0];
            var descrEle = this.$('.descr-info', descrContainer)[0];
            descrEle.innerHTML = html;
        },
        /**
         * 是否是全部旺季行业
         * @param {number} tradeId 旺季行业的id
         * @returns {boolean}
         */
        isAllTrade: function (tradeId) {
            return +tradeId === ALL_TRADE_ID;
        },
        /**
         * @implemented
         */
        bindHandlers: function () {
            var me = this;
            // 绑定Tab选择事件处理器
            var tabContainer = me.$('.season-pkg-tab-wrapper')[0];
            var tabSelHandler = nirvana.event.delegate(tabContainer,
                function (event, target) {
                    var hasClass = T.dom.hasClass;
                    if (!hasClass(target, SEL_TAB_CLASS)
                        && hasClass(target, 'trade-tab')
                        ) {
                        me.onTabSel(target);
                        return true;
                    }
                }
            );
            tabContainer.onclick = tabSelHandler;
        },
        /**
         * 选择旺季行业Tab的事件处理器
         * @param {HTMLElement} target 选择的目标Tab的DOM元素
         * @event onTabSel
         */
        onTabSel: function (target) {
            var tradeId = target.getAttribute('tradeId');
            var tradeType = target.getAttribute('tradeType');
            var me = this;

            // 修改选中Tab样式
            var selTabEle = me.$('.' + SEL_TAB_CLASS)[0];
            selTabEle && (T.removeClass(selTabEle, SEL_TAB_CLASS));
            T.addClass(target, SEL_TAB_CLASS);

            // 设置当前优化包上下文属性信息，确保在当前上下文后续发送监控能带上该参数
            nirvana.aoPkgControl.logCenter.extendDefault({ tradeid: tradeId });
            // 发送监控
            nirvana.AoPkgMonitor.switchPeakSeasonTradeTab(tradeId);

            // 通过动画效果移动箭头指向当前选中的Tab
            var arrowEle = me.$('.arrow-up')[0];
            var tradeListEle = me.$('.trade-tab-list')[0];
            var offsetX = tradeListEle.offsetLeft + target.offsetLeft
                + parseInt(target.offsetWidth / 2) - parseInt(arrowEle.offsetWidth / 2);
            T.fx.moveTo(arrowEle, [offsetX, arrowEle.offsetTop]);

            if (me.isAllTrade(tradeId)) {
                // 如果是全部行业，直接渲染全部行业的描述信息
                me.showAllTradeDescInfo();
            }
            else {
                me.setTradeDscrInfo('');
                me.showLoading();
                // 显示Flash数据区域，重新加载Flash数据
                me.dataCtrl.show();
                me.dataCtrl.loadData(tradeId, tradeType);

                var tradeItem = me.findTradeItemInfo(tradeId);
                var tradeName = '“' + tradeItem.tradename + '”';
                me.setOptimizeItemsTradeName(tradeName, true);
            }
            // 重新加载优化建议项
            me.optimizerCtrl.loadOptItems(tradeId);
        },
        /**
         * 显示全部旺季行业的描述信息
         */
        showAllTradeDescInfo: function () {
            var me = this;
            me.hideLoading();
            me.renderTradeDescription(ALL_TRADE_ID, null, me.getAttr('allTradeInfo'));
            // 隐藏Falsh数据区域
            me.dataCtrl.hide();
            me.setOptimizeItemsTradeName(ALL_TRADE_NAME, false);
        },
        /**
         * 设置优化建议标题的行业名称
         * @param {string} tradeName 要显示的行业名称
         * @param {boolean} isSpecifiedTrade 是否是特定的旺季行业，
         *                                   用于区分全部旺季行业和特定旺季行业
         */
        setOptimizeItemsTradeName: function (tradeName, isSpecifiedTrade) {
            var tradeNameEle = this.$('.season-pkg-optitem-wrapper .trade-name')[0];
            var tradeNameClass = 'specified-trade-name';
            var toggleClass = isSpecifiedTrade ? T.addClass : T.removeClass;

            toggleClass(tradeNameEle, tradeNameClass);
            tradeNameEle.innerHTML = T.encodeHTML(tradeName);
        },
        /**
         * @implemented
         */
        disposeAoPkg: function() {
            // 清除旺季包特定的上下文监控属性信息
            nirvana.aoPkgControl.logCenter.delKeyFromDefault('tradeid');
            this.dataCtrl.dispose();
            this.clearAttr();
        }
    };

    // 支持属性读写功能
    T.extend(seasonPkg, nirvana.attrHelper);

    return nirvana.myPackage(seasonPkg);
}(baidu, nirvana);