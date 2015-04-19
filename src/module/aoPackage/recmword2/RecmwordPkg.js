/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/recmword2/RecmwordPkg.js
 * desc: 新版的智能提词包定义，扩展自aoPackage.js
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/02/18 $
 */
/**
 * 新版的智能提词包定义 NOTICE: 全流量之后，把老的提词包删掉，这边加的数字2去掉
 * @class RecmwordPackage2
 * @namespace nirvana
 * @extends nirvana.aoPackage
 */
nirvana.RecmwordPackage2 = function($, T, nirvana) {
    // 搜索优化项类型ID
    var SEARCH_OPTTYPE = 505;
    // 搜索Tab索引，如果Tab改变，该索引值也要调整
    var SEARCH_TAB_IDX = 4;
    var bind = nirvana.util.bind;

    var RecmwordPackage = {
        /**
         * 渲染智能提词优化包对话框内容
         * @override
         */
        renderAppAllInfo: function() {
            var me = this;
            var view = me.getDialog().getDOM();

            // 初始化提词组件
            var newoptions = T.object.clone(me.optimizer);
            T.extend(newoptions, {
                modifiedItem: me.data.get('modifiedItem'),
                level: me.level
            });

            // 创建优化项控制器
            me.createOptCtrl(newoptions);

            /**
             * 各个Tab的基本配置信息
             */
            me._recmwordTabs = [
                {
                    opttype: 501,
                    name: '热搜词',
                    iconClass: 'hot-recmword-icon'
                },
                {
                    opttype: 502,
                    name: '潜力词',
                    iconClass: 'potential-recmword-icon'
                },
                {
                    opttype: 504,
                    name: '行业词',
                    iconClass: 'industry-recmword-icon'
                },
                {
                    opttype: 503,
                    name: '质优词',
                    iconClass: 'quality-recmword-icon'
                },
                {
                    opttype: SEARCH_OPTTYPE,
                    tpl: 'recmwordSearchTabTitle'
                }
            ];

            me.renderBasicInfo('recmwordPkgContent', 'recmwordPkgFoot');
            me.createSearchBox(view);
            me._container = $('#recmwordpkg-wrapper', view)[0];

            // 初始化详情控制器
            me.detailCtrl = new nirvana.aoPkgControl.RecmwordDetailCtrl();
            me.detailCtrl.init(me, view);

            me.optimizerCtrl.show();
            me.showInitSelTabDetail();
        },
        /**
         * 创建优化项摘要请求控制器实例（用于初始化Tab标题信息）
         * @private
         */
        createOptCtrl: function(options) {
            var me = this;

            me.optimizerCtrl =
                new nirvana.aoPkgControl.RecmwordOptCtrl(me.pkgid, options);

            var optCtrl = me.optimizerCtrl;
            optCtrl.onAbstractLoad = bind('onAbstractLoad', me);
            optCtrl.onRequestFail = bind('onAbstractLoadFail', me);
            optCtrl.onRequestTimeout = bind('onAbstractLoadTimeout', me);

            // 先执行清空操作，由于Tab初始化在optimizerCtrl.show之前，它会读取
            // optimizerCtrl的缓存信息，由于optimizerCtrl缓存信息是搁在prototype，所有
            // 实例都会共用该缓存
            optCtrl.data.clear();
        },
        /**
         * 创建关键词搜索框
         * @param {HTMLElement} view 要创建搜索框所属的视图
         * @private
         */
        createSearchBox: function(view) {
            var me = this;
            // 初始化搜索按钮的点击的事件处理
            var searchBtn = $('#recmword-search-btn', view)[0];
            searchBtn.onclick = bind('searchRemcword', me);

            // 创建搜索输入框组件
            var searchBox = new fc.ui.Input($('#recmword-search-input', view)[0]);
            me.uiObjs['recmword-search-input'] = searchBox;

            searchBox.placeholder('搜索想添加的关键词');
            // 搜索框聚焦的事件处理
            searchBox.onfocus = function() {
                T.dom.addClass(searchBtn, 'active');
            };
            // 搜索框失焦的事件处理
            searchBox.onblur = function() {
                T.dom.removeClass(searchBtn, 'active');
            };
            // 搜索框按回车键事件处理
            searchBox.node.onkeydown = function(e) {
                var event = e || window.event;
                if (event.keyCode === 13) {
                    me.searchRemcword();
                }
            };
            // 搜索输入长度是有限制的，监听输入变化，对于超过长度限制将其截断
            searchBox.node.onkeyup = function() {
                var maxLen = nirvana.aoPkgConfig.SEARCHWORD_MAXLEN;
                var value = me.getSearchValue();
                if (getLengthCase(value) > maxLen) {
                    searchBox.value(subStrCase(value, maxLen));
                }
            };
        },
        /**
         * 获取搜索框输入值
         * @return {string}
         */
        getSearchValue: function() {
            var searchBox = this.getSearchBox();
            return T.trim(searchBox.value());
        },
        /**
         * 验证搜索框输入在是否有效
         * @param {string} value 要验证的值
         * @return {boolean} 有效，返回true
         */
        checkSearchValue: function(value) {
            var me = this;
            var searchBox = me.getSearchBox();
            if (searchBox.placeholder() === value || !value.length) {
                searchBox.value('');
                searchBox.focus();
                return false;
            }
            return true;
        },
        /**
         * 搜索关键词
         */
        searchRemcword: function() {
            this.getTabUI().select(SEARCH_TAB_IDX);
        },
        /**
         * 请求优化项摘要失败回调
         */
        onAbstractLoadFail: function(response) {
            // 这里不弹窗报错，主要是由于optCtrl里已经做了
            this._isRequestFail = true;
            this.showInitSelTabDetail();
        },
        /**
         * 请求优化项摘要超时回调，整体优化项摘要请求超时
         */
        onAbstractLoadTimeout: function() {
            this._isRequestTimeout = true;
            nirvana.util.getReqTimeoutHandler()();
            this.showInitSelTabDetail();
        },
        /**
         * 初始化优化项超时信息，由于每个优化项（对应Tab，不包括搜索Tab）的摘要信息请求可能超时
         * @param {string} opttypeid 优化项类型ID
         * @param {boolean} isTimeout 是否超时
         */
        initOptItemTimeoutInfo: function(opttypeid, isTimeout) {
            var item = this.getOptItemConf(opttypeid);
            item.timeout = isTimeout;
        },
        /**
         * 获取优化项的配置信息
         * @param {string} opttypeid 优化项类型ID
         * @return {Object}
         */
        getOptItemConf: function(opttypeid) {
            var tabArr = this._recmwordTabs;
            var item;
            for (var i = tabArr.length; i --;) {
                item = tabArr[i];
                if (item.opttype === + opttypeid) {
                    return item;
                }
            }
        },
        /**
         * 每个Tab对应一个优化项，其摘要信息加载成功的回调
         * @param {string} opttypeid 优化项id
         * @param {Object} optItem 优化项摘要数据
         * @param {boolean} isTimeout 该优化项请求是否超时
         */
        onAbstractLoad: function(opttypeid, optItem, isTimeout) {
            if (this.isQuit()) {
                return;
            }

            var data = optItem.data;
            // 初始化超时信息
            this.initOptItemTimeoutInfo(opttypeid, isTimeout);

            // 推荐词详情必须在摘要加载结束之后才能发送请求
            var selOpttype = this.getCurrSelTabOpttype();
            var hasNew = selOpttype == opttypeid ? false : data.isnew;
            // 更新Tab标题区域的信息
            this.updateTabInfo(opttypeid, data.totalnum, hasNew || false);

            if (selOpttype == opttypeid) {
                this.showRecmwordInfo(selOpttype);
            }
        },
        /**
         * 更新Tab标题的信息
         * @param {string} opttypeid 优化项id
         * @param {number} wordNum 要显示的关键词数量
         * @param {boolean} hasNew 是否包含更新标识，如果未传该参数，则忽略更新标识
         */
        updateTabInfo: function(opttypeid, wordNum, hasNew) {
            // 对于搜索Tab不需要更新
            if (this.isSearchRequest(opttypeid)) {
                return;
            }

            // 缓存当前显示的关键词数量，用于tab重新渲染使用
            var item = this.getOptItemConf(opttypeid);
            item.num = wordNum || 0;

            var tabEle = $('.recmword-tab[opttype="' + opttypeid + '"]',
                this._container)[0];

            var valueEle = $('.value', tabEle)[0];
            valueEle.innerHTML = item.num;

            if (nirvana.util.isUndef(hasNew)) {
                return;
            }

            // 缓存是否有更新标识信息
            item.hasNew = hasNew;

            var newFlagEle = $('.hasnew-recmword-flag', tabEle)[0];
            if (hasNew === 'true') {
                T.removeClass(newFlagEle, 'hide');
            }
            else {
                T.addClass(newFlagEle, 'hide');
            }
        },
        /**
         * 显示当前选择的Tab的详情信息
         */
        showInitSelTabDetail: function() {
            var selOpttype = this.getCurrSelTabOpttype();
            this.showRecmwordInfo(selOpttype);
        },
        /**
         * 获取优化包内容的UI初始化的配置，如果子类有定制的UI的配置信息，可以重写该方法
         * @return {Object}
         */
        getUIConfig: function() {
            // 渲染ui控件
            return {
                recmwordPkgTab: this.getTabUIConfig()
            };
        },
        /**
         * 获取当前选择的Tab所对应的opttype
         * @return {string}
         */
        getCurrSelTabOpttype: function() {
            var selTabIdx = this.getTabUI().tab;
            var tabItem = this._recmwordTabs[selTabIdx];
            return tabItem && tabItem.opttype;
        },
        /**
         * 获取Tab的标题信息
         * @param {number} index tab的索引
         * @param {number} selTabIdx 当前选择的Tab的索引
         * @return {Object}
         */
        getRecmTabTitle: function(index, selTabIdx) {
            var me = this;
            var tplData = me.getRecmTabTplData(index, selTabIdx);

            var tpl = tplData.tpl || 'recmwordTabTitle';
            var title = tplData.name || '';

            var content = lib.tpl.parseTpl(tplData, tpl, true);
            return {
                content: content,
                title: title
            };
        },
        /**
         * 获取Tab组件的配置
         */
        getTabUIConfig: function() {
            var me = this;

            var dlgDOM = me.getDialog().getDOM();
            var tabContainer = $('#recmword-tab-container', dlgDOM)[0];

            var tabNum = me._recmwordTabs.length;
            var tabContainerArr = [];
            var tabTitleArr = [];
            var tabClassArr = []
            var getTabTitle = bind('getRecmTabTitle', me);
            for (var i = tabNum; i --;) {
                tabContainerArr[i] = tabContainer;
                tabTitleArr[i] = getTabTitle;
                tabClassArr[i] = '';
            }

            tabClassArr[tabNum - 1] = 'recmword-search-tab';

            return {
                skin: 'recmword_pkg_tab',
                title: tabTitleArr,
                container: tabContainerArr,
                itemClassName: tabClassArr
            };
        },
        /**
         * 初始化Tab标题的模板数据
         * @param {Object} tplData 要被完善的模板数据
         * @param {number} selTabIdx 当前选择的tab的索引
         * @private
         */
        getRecmTabTplData: function(index, selTabIdx) {
            var data = this._recmwordTabs[index];
            data.num = data.num || 0;
            data.flagClass =
                (selTabIdx === index || data.hasNew !== 'true') ? 'hide' : '';

            return data;
        },
        /**
         * 绑定事件处理器
         * @implemented
         */
        bindHandlers: function() {
            var me = this;
            me.getTabUI().onselect = bind('selectRecmwordTab', me);
        },
        /**
         * 获取Tab UI组件
         * @return {ui.Tab}
         */
        getTabUI: function() {
            return this.uiObjs['recmwordPkgTab'];
        },
        /**
         * 获取搜索框组件
         * @return {fc.ui.Input}
         */
        getSearchBox: function() {
            return this.uiObjs['recmword-search-input'];
        },
        /**
         * 获取添加所选按钮组件
         * @return {ui.Button}
         */
        getAddWordBtn: function() {
            return this.uiObjs['WidgetApply'];
        },
        /**
         * 是否是搜索请求
         * @param {string} opttypeid 请求的opttypeid
         * @return {boolean}
         */
        isSearchRequest: function(opttypeid) {
            return SEARCH_OPTTYPE === + opttypeid;
        },
        /**
         * 选择给定tab索引的Tab
         * @param {number} tabIdx 要选择的tab索引
         */
        selectRecmwordTab: function(tabIdx) {
            var me = this;
            var tabCtrl = me.getTabUI();

            var selTabEle = $('ul li', tabCtrl.main)[tabIdx];
            var tabTitleWrapper = $('.recmword-tab', selTabEle)[0];

            var opttype = tabTitleWrapper.getAttribute('opttype');
            me.showRecmwordInfo(opttype);
        },
        /**
         * 显示推词详情信息即Tab内容
         * @param opttypeid
         */
        showRecmwordInfo: function(opttypeid) {
            var me = this;

            var params= {
                opttypeid: opttypeid,
                level: me.level
            };
            var isSearch;
            var isTimeout = false;
            var isFail = false;
            // 标识当前是否准备好可以发送详情请求
            var isNotReady = false;
            if (isSearch = me.isSearchRequest(opttypeid)) {
                var value = me.getSearchValue();
                if (me.checkSearchValue(value)) {
                    // 发送搜索关键词监控
                    nirvana.AoPkgMonitor.searchRecmwords(SEARCH_OPTTYPE);
                    params.searchword = value;
                    // 后端要求传个5000，最多返回5000条记录
                    params.totalrecmnum = 5000;
                }
                else {
                    isNotReady = true;
                }
            }
            else {
                var optCtrl = me.optimizerCtrl;
                var itemData = optCtrl.getRecmwordOptData(opttypeid);
                // 可能是请求超时，失败或者请求还没结束
                isNotReady = !itemData;

                var optItemConf = me.getOptItemConf(opttypeid);
                if (itemData) { // 只有摘要数据准备好了，才能发送详情查看监控
                    // 发送查看详情监控
                    nirvana.AoPkgMonitor.viewRecmwordDetail(itemData);
                }
                else {
                    isTimeout = optItemConf.timeout || me._isRequestTimeout;
                    isFail = me._isRequestFail;
                }

                params.totalrecmnum = (itemData || { data: {} }).data.totalrecmnum;
                // 将hasNew标识置为false，标识该Tab被点击过，有更新已经被查看过
                optItemConf.hasNew = false;
            }

            T.object.extend(params, {
                isSearch: isSearch,
                isNotReady: isNotReady,
                isTimeout: isTimeout,
                isFail: isFail
            });
            me.detailCtrl.show(params);
        },
        /**
         * @implemented
         */
        disposeAoPkg: function() {
            var me = this;

            me._container = null;
            me._isRequestFail = false;
            me._isRequestTimeout = false;

            var detailCtrl = me.detailCtrl;
            var detailView = detailCtrl.getDetailView();
            var hasWordAdded = detailView.hasModified();
            detailCtrl.dispose();

            if (!hasWordAdded) {
                return;
            }

            var msg = er.template.get('createIdeaForRecmword');
            ui.Dialog.confirm({
                title: '提醒',
                content: msg,
                ok_button_lang: '立即添加',
                onok: function() {
                    nirvana.manage.createSubAction.idea({
                        type: 'add',
                        changeable: true,
                        entranceType: 'aoPackage_recm',
                        batch: {
                            isbatch: true,
                            type: 'default'
                        },
                        wordref: {
                            show: true,
                            source: 'normal'
                        }
                    });
                }
            });
        },
        /**
         * 关闭突降急救优化包触发的回调
         * @override
         */
        onclose: function(currview, closeByX) {
            var me = this;
            var detailCtrl = me.detailCtrl;
            var detailView = detailCtrl.getDetailView();

            if (detailView.hasInlineMod()) {
                var msg = detailView.getInlineModTip() + '<br/>确定现在退出?';
                ui.Dialog.confirm({
                    title: '确认',
                    content: msg,
                    onok: function(currDlg) {
                        currDlg.hide();
                        me.closeAoPkg(currview, closeByX);
                        return false;
                    }
                });
                return false;
            }
        }
    };

    return nirvana.myPackage(RecmwordPackage);
}($$, baidu, nirvana);