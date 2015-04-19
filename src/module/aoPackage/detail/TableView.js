/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/detail/TableView.js
 * desc: AO优化包详情表格视图类
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/03/14 $
 */
/**
 * AO优化包详情表格视图类
 * @class TableView
 * @namespace nirvana.aoPkgControl
 */
nirvana.aoPkgControl.TableView = function($, T, nirvana) {
    function TableView() {
    }

    TableView.prototype = {
        /**
         * 初始化详情视图
         * @param {Object} initData 要初始化详情视图的数据
         * @param {string} initData.tpl 详情视图模板名，可选，默认'aoPkgDetailView'
         * @param {string} initData.appId 优化包应用ID
         * @param {number} initData.pkgid 优化包id
         * @param {number} initData.opttypeid 显示的详情所属的优化类型id
         * @param {string} initData.level 当前所属的层级
         * @param {string} initData.title 显示的详情的标题
         * @param {string} initData.materialName 详情显示的物料名称，可选，默认'关键词'
         *                 用于批量应用提示确认消息用，其它可选有'计划'、'单元'、'创意'
         * @param {string} initData.applyBtnLabel 批量操作按钮的标签
         * @param {string} initData.containerStyle 显示的详情容器样式，可选
         * @param {string} initData.tipStyle 显示的详情提示信息样式，可选
         * @param {string} initData.contentStyle 显示的详情内容样式，可选
         * @param {Object} initData.tableOption 表格定制的配置选项，可选
         */
        // init: function(initData) {...}
        /**
         * 显示详情视图
         * @param {HTMElement} view 要显示的视图容器
         * @implemented
         */
        show: function(view) {
            var me = this;

            me._view = view;

            // 渲染视图框架
            me.renderView(view);

            // 渲染内容
            var contentView = me.$('.aopkg-detail-content')[0];
            /**
             * 渲染详情核心内容，子类需要实现该接口
             * @param {HTMLElement} contentView 要渲染的内容视图
             */
            me.renderContent(contentView, me.getAttr('tableOption'));

            // 绑定事件处理器
            me.bindHandler();

            // 初始化时候先禁用批量应用按钮
            me.disableBatchBtn(true);

            // 加载详情数据
            me.loadDetail();
        },
        /**
         * 渲染详情视图
         * @param {HTMLElement} view 视图容器
         */
        renderView: function(view) {
            var me = this;

            var tplName = me.getAttr('tpl') || 'aoPkgDetailView';
            var tplData = me.getViewTplData();

            var html = lib.tpl.parseTpl(tplData, tplName, true);
            view.innerHTML = html;

            me._UIMap = ui.util.init(view);

            // 对于未配置批量应用按钮的标签默认不显示批量应用按钮
            if (!me.getBatchApplyBtnLabel()) {
                var applyBtn = me.getBatchApplyBtn();
                applyBtn && T.hide(applyBtn.main);
            }
        },
        /**
         * 获取详情视图模板数据
         * @return {Object}
         */
        getViewTplData: function() {
            var me = this;
            var tip = me.getViewTip();
            var appId = me.getAttr('appId').toUpperCase();

            return {
                title: me.getAttr('title'),
                tip: tip,
                pkgName: nirvana.aoPkgConfig.SETTING[appId].name,
                applyBtnLabel: me.getBatchApplyBtnLabel() || '',
                containerStyle: me.getAttr('containerStyle'),
                tipStyle: me.getAttr('tipStyle'),
                contentStyle: me.getAttr('contentStyle')
            };
        },
        /**
         * 获取详情视图的Tip信息
         * @return {string}
         */
        getViewTip: function() {
            return lib.tpl.parseTpl(this.getViewTipTplData(),
                'aoPkgDetailTip' + this.getOpttypeid(), true);
        },
        /**
         * 获取详情视图的Tip信息的模板数据，如果tip包含动态的模板数据，需要重写该方法
         * @return {Object}
         */
        getViewTipTplData: function() {
            return {};
        },
        /**
         * 渲染详情核心内容
         * @param {HTMLElement} contentView 要渲染的内容视图
         * @param {?Object} tableOption 定制的表格配置，可选
         */
        renderContent: function(contentView, tableOption) {
            var tableView = document.createElement('DIV');
            contentView.appendChild(tableView);
            this.createTable(nirvana.aopkg.CustomTable, tableView, tableOption);
        },
        /**
         * 创建表格组件
         * @param {nirvana.aopkg.CustomTable} 要实例化的表格Class
         * @param {HTMLElement} tableView 要渲染表格组件的DOM视图
         * @param {？Object} tableOption 定制的表格配置，可选
         */
        createTable: function(tableClazz, tableView, tableOption) {
            var me = this;

            var table = new tableClazz();
            table.render(tableView, me.getTableConf(tableOption));

            me.bindTableViewHandler(table);

            me._table = table;
        },
        /**
         * 获取表格组件
         * @return {nirvana.aopkg.CustomTable}
         */
        getTable: function() {
            return this._table;
        },
        /**
         * 获取真正用于表格组件初始化的域配置
         * @param {Array} orgFieldArr 原始的域配置，要被转化为表格控件的域配置
         * @return {Array}
         */
        getFieldConf: function(orgFieldArr) {
            var fieldArr = [];
            var field;
            var FIELD_DEF = nirvana.aoPkgWidgetFields;

            for (var i = orgFieldArr.length; i --;) {
                field = orgFieldArr[i];
                if (typeof field === 'string') {
                    fieldArr[i] = FIELD_DEF[field]();
                }
                else if (T.lang.isArray(field)) {
                    fieldArr[i] = FIELD_DEF[field[0]](field[1]);
                }
                else {
                    fieldArr[i] = field;
                }
            }

            return fieldArr;
        },
        /**
         * 获取表格的配置
         * @param {Object} tableOption 定制的表格配置
         * @return {Object}
         */
        getTableConf: function(tableOption) {
            var conf = {
                id: 'WidgetTable',
                fields: this.getFieldConf(this.getAttr('fields')),
                noDataHtml: this.getNoDataTip(true),
                noScroll: true
            };
            // 对于配置批量应用按钮的标签默认支持多选
            if (this.getBatchApplyBtnLabel()) {
                T.object.extend(conf, {
                    select: 'multi',
                    isSelectAll: true
                });
            }
            T.object.extend(conf, tableOption || {});
            return conf;
        },
        /**
         * 绑定详情视图的事件处理器
         */
        bindHandler: function() {
            var me = this;

            // 绑定批量应用的事件处理器
            var batchApplyBtn = me.getBatchApplyBtn();
            batchApplyBtn.onclick = nirvana.util.bind('batchApplyHandler', me);

            // 添加详情视图返回摘要视图的事件处理器
            var closeHandler = function() {
                me.closeView();
            };
            var closeViewBtns = me.$('.return');
            for (var i = closeViewBtns.length; i --;) {
                closeViewBtns[i].onclick = closeHandler;
            }
        },
        /**
         * 批量应用的事件处理器
         */
        batchApplyHandler: function() {
            var me = this;
            /**
             * 获取批量应用数量，子类需要重写该方法
             * @return {number}
             */
            var applyNum = me.getBatchApplyNum();

            if (applyNum <= 0) {
                return;
            }

            var msg = me.getBatchApplyConfirmMsg();
            var BATCH_HANDLER = nirvana.tableHandler.batchHandlerMap;
            var applyType = me.getAttr('applyType');

            ui.Dialog.confirm({
                title: '确认',
                content: msg,
                onok: function() {
                    var handler = BATCH_HANDLER[applyType];
                    /**
                     * 触发批量应用事件处理器
                     * @event
                     * @param {Function} handler 执行批量应用的事件处理器
                     */
                    nirvana.util.executeCallback('onBatchApply', [handler], me);
                }
            });
        },
        /**
         * 获取批量应用的确认消息
         * @return {string}
         */
        getBatchApplyConfirmMsg: function() {
            var me = this;
            var tplData = {
                num: me.getBatchApplyNum(),
                name: me.getAttr('materialName') || '关键词'
            };
            return lib.tpl.parseTpl(tplData, 'aoPkgDetailBatchApplyMsg', true);
        },
        /**
         * 获取批量应用按钮的标签
         * @return {string}
         */
        getBatchApplyBtnLabel: function() {
            return this.getAttr('applyBtnLabel');
        },
        /**
         * 获取批量应用按钮
         * @return {ui.Button}
         */
        getBatchApplyBtn: function() {
            return this._UIMap['WidgetApply'];
        },
        /**
         * 禁用批量应用按钮
         * @param {boolean} disabled 是否禁用
         */
        disableBatchBtn: function(disabled) {
            var btn = this.getBatchApplyBtn();
            btn && btn.disable(disabled);
        },
        /**
         * 获取批量应用数量
         * @return {number}
         * @override
         */
        getBatchApplyNum: function() {
            var selRowIdxs = this.getTable().getSelRowIdxs();
            return selRowIdxs.length;
        },
        /**
         * 获取没有数据时候表格视图显示的提示消息
         * @param {boolean} isInit 是否当前处在初始化状态
         * @return {string}
         */
        getNoDataTip: function(isInit) {
            return isInit ? '' : FILL_HTML.NO_DATA;
        },
        /**
         * 获取数据加载失败表格视图显示的提示消息
         * @param {boolean} isTimeout 是否超时
         * @return {string}
         */
        getFailTip: function(isTimeout) {
            return nirvana.tableUtil.getNoDataTip(true, isTimeout);
        },
        /**
         * 加载详情
         */
        loadDetail: function() {
            var me = this;

            /**
             * 加载详情触发的事件，如果不允许执行详情加载，返回false
             * @event onLoadDetail
             * @return {boolean}
             */
            if (me.onLoadDetail && me.onLoadDetail() === false) {
                return;
            }

            var params = me.getRequestParam();
            T.object.extend(params, {
                onSuccess: me.requestDetailSuccess,
                onFail: me.requestDetailFail,
                onTimeout: me.requestDetailTimeout
            });

            nirvana.util.request(fbs.nikon.getDetail, params, me);
        },
        /**
         * 请求详情失败的回调
         * @implemented
         */
        requestDetailFail: function(isTimeout) {
            var me = this;
            var tip = me.getFailTip(isTimeout === true);
            this.getTable().update([], tip);
        },
        /**
         * 请求详情超时的回调
         * @implemented
         */
        requestDetailTimeout: function() {
            this.requestDetailFail(true);
        },
        /**
         * 批量应用事件处理器
         * @implemented
         */
        onBatchApply: function(handler) {
            var me = this;
            var recmTable = me.getTable();
            var selRowIdxs = recmTable.getSelRowIdxs();
            var ds = recmTable.getDatasource();
            var opttypeid = me.getOpttypeid();

            /////////////////////////////////////////移动优化包引入特殊逻辑 mayue
            var acceptIdea;
            //判断是否接受推荐创意，暂时只在移动优化包中加入
            if (T.g('acceptRecmIdea')) {
                acceptIdea = T.g('acceptRecmIdea').checked;
            }
            /////////////////////////////////////////

            /**
             * 批量应用成功的事件回调
             * @event onBatchApplySuccess
             */
            handler.call(me, selRowIdxs, ds, 'onBatchApplySuccess',
                opttypeid, acceptIdea);
        },
        /**
         * 清空提示消息
         */
        clearTip: function() {
            this.showTip('');
        },
        /**
         * 显示提示消息，在底部返回上一级右边显示
         * @param {string} tip 要显示的消息
         */
        showTip: function(tip) {
            var tipEle = this.$('.warn-info')[0];
            tipEle && (tipEle.innerHTML = tip);
        },
        /**
         * 查询当前详情视图的DOM元素，基于sizzle
         * @param {string} selector 元素选择器
         * @return {Array}
         */
        $: function(selector) {
            return this._view && $(selector, this._view);
        },
        /**
         * 销毁表格视图实例
         */
        dispose: function() {
            this._table.dispose();
            ui.util.disposeWidgetMap(this._UIMap);
            this._view = null;
            TableView.superClass.dispose.call(this);
        }
    };

    // 继承详情视图
    T.inherits(TableView, nirvana.aoPkgControl.DetailView);
    return TableView;
}($$, baidu, nirvana);