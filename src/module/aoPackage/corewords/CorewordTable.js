/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/corewords/CorewordTable.js
 * desc: 重点词排名包的重点词表格组件
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/12/03 $
 */
/**
 * 重点词排名包的重点词表格组件
 * @class CorewordTable
 * @namespace nirvana.aoPkgControl
 */
nirvana.aoPkgControl.CorewordTable = function($, nirvana) {
    /**
     * 重点词表格的构造函数定义
     * @constructor
     */
    function CorewordTable() {
        this._id = 'corewordInfoTable';
        this._data = [];
        this._bubbleData = [];
    }

    var utils = nirvana.corewordUtil;
    var Store = nirvana.aopkg.CorewordStorage;

    CorewordTable.prototype = {
        /**
         * 显示重点词表格
         * @method show
         * @param {HTMLElement} main 表格渲染挂载的DOM元素
         */
        show: function(main) {
            this.init(main);
        },
        /**
         * 初始化重点词表格
         * @param {HTMLElement} main 表格渲染挂载的DOM元素
         * @private
         */
        init: function(main) {
            var config = this.getTableConfig();

            this._table = ui.util.create('Table', config, main);
            /**
             * 判断是否显示倒计时时间
             * @param {Object} word 重点词数据对象
             * @return {boolean}
             */
            this._table.hasCounter = function(word) {
                return (typeof this._updateRemainder === 'number')
                    && Store.isExist(this._selRegionId, word.winfoid);
            };

            this.bindHandler();
        },
        /**
         * 添加行内编辑事件处理器
         * @method addInlineHandler
         * @param {Function} handler 事件处理器
         * @param {Object} context 事件处理器执行的上下文
         */
        addInlineHandler: function(handler, context) {
            var table = this._table,
                tableEle = table.main;
            // 给表格注册:行内编辑处理器
            handler = nirvana.event.delegate(tableEle, handler, context);
            tableEle.onclick = handler;
        },
        /**
         * 绑定事件处理器
         * @private
         */
        bindHandler: function() {
            var me = this;
            // 给表格注册:排序事件
            me._table.onsort = function(sortField,order){
                // 更新状态信息
                me._orderBy = sortField.field;
                me._orderType = order;

                // 直接使用缓存的数据，重新更新
                me.applyDetailsData(me._data);
            };
        },
        /**
         * 设置选择的展现地域名称
         * @method setSelRegionName
         * @param {string} name 要设置的展现地域名称
         */
        setSelRegionName: function(regionId, name) {
            this._table._selRegionId = regionId;
            this._table._selRegionName = name;
        },
        /**
         * 设置诊断的时间和离下次更新诊断信息还剩的分钟数
         * @method setDiagnosisTime
         * @param {string} time 格式化过的诊断时间
         * @param {number} remainder 剩余的分钟数
         */
        setDiagnosisTime: function(time, remainder) {
            this._table._diagnosisTime = time || '';
            this.setUpdateRemainder(remainder);
        },
        /**
         * 设置离下次更新诊断信息还剩的分钟数
         * @method setUpdateRemainder
         * @param {number} remainder 剩余的分钟数
         */
        setUpdateRemainder: function(remainder) {
            this._table._updateRemainder = remainder;
        },
//        /**
//         * 移除表格中指定索引的行
//         * @method removeRow
//         * @param {number} index 要移除的行的索引
//         */
//        removeRow: function(index) {
//            if (index >= 0 && index < this._data.length) {
//                // 移除表格数据源指定位置的行的数据
//                this._data.splice(index, 1);
//                // 重绘表格控件
//                this.repaint();
//            }
//        },
        /**
         * 更新表格的数据源
         * @method update
         * @param {Array} data 要更新的数据
         */
        update: function(data) {
            var me = this,
                oldData = me._data,
                bubbleIdArr = me._bubbleData;

            // 缓存旧的数据，主要为了dispose bubble用
            var tableData = me.getTableData();
            for (var i = 0, len = tableData.length; i < len; i ++) {
                bubbleIdArr[i] = tableData[i].winfoid;
            }

            // 清空旧的数据
            oldData.length = 0;
            // 保存表格数据源
            me._data = data || [];
            // 初始化表格数据
            this.applyDetailsData(me._data);
        },
        /**
         * 清除表格的排序状态
         * @method clearSortState
         */
        clearSortState: function() {
            // 清掉排序状态
            this._orderBy = null;
            this._orderType = null;

            // 清除表格控件的排序状态
            var table = this._table;
            table.order = null;
            table.orderBy = null;
        },
        /**
         * 初始化重点词优化详情的表格的数据，同时更新相应的重点词优化包详情信息
         * @param {Array} result 重点词优化详情的数组
         * @private
         */
        applyDetailsData: function(result) {
            var me = this;

            // 对重点词数据进行排序
            utils.sortCorewordsList(result, me._orderBy, me._orderType);

            // 更新重点词优化包详情
            var table = me._table;

            // 更新表格的数据源
            table.datasource = result;
            // 绑定没有数据时候的显示信息,放在这里，主要不想让一开始就出现没有数据提示消息
            table.noDataHtml = FILL_HTML.NO_DATA;

            // 重绘表格控件
            me.repaint();
//            me.updateDetail(result);
        },
//        /**
//         * 更新重点词优化包详情信息
//         * @private
//         */
//        updateDetail: function(tableData) {
//            var me = this,
//                table = me._table;
//
//            // 更新表格的数据源
//            table.datasource = tableData;
//            // 绑定没有数据时候的显示信息,放在这里，主要不想让一开始就出现没有数据提示消息
//            table.noDataHtml = FILL_HTML.NO_DATA;
//
//            // 重绘表格控件
//            me.repaint();
//        },
        /**
         * 重绘表格控件
         * @param {ui.Table} table 表格控件
         * @private
         */
        repaint: function() {
            var me = this,
                table = me._table;

            // 对于表格控件先销毁表格上bubble控件实例，避免内存泄露
            me.disposeBubbles();
            // 重绘控件
            table.render(table.main, false);
            // 初始化表格关键词列信息图标的Bubble
            fc.ui.init(table.getBody());
        },
        /**
         * 获取当前表格组件显示的表格数据
         * @method getTableData
         * @return {Array}
         */
        getTableData: function() {
            return this._data;
        },
        /**
         * 销毁重点词表格关键词列定义的Bubble控件
         * @private
         */
        disposeBubbles: function() {
            var me = this,
                bubbleIdArr = me._bubbleData,
                bubble;

            for (var i = 0, len = bubbleIdArr.length; i < len; i ++) {
                bubble = fc.ui.get('bubble_' + bubbleIdArr[i]);
                if (bubble) {
                    bubble.dispose();
                }
            }

            // 删除旧的Bubble Data
            bubbleIdArr.length = 0;
        },
        /**
         * 获取表格的配置信息
         * @private
         * @return {Object}
         */
        getTableConfig: function() {
            var fieldConfig = [
                utils.getWordFieldConfig(),
                utils.getRankFieldConfig({
                    sortable: true,
                    width: 160,
                    align: 'center'
                }),
                nirvana.tableUtil.getBidConf({
                    width: 45,
                    stable: false
                }),
                nirvana.tableUtil.getClksConf({
                    width: 40,
                    sortable: true,
                    align: 'center'
                }),
                nirvana.tableUtil.getPaysumConf({
                    width: 40,
                    sortable: true,
                    align: 'center'
                }),
                utils.getQStarFieldConfig({
                    sortable: true,
                    align: 'left',
                    width: 100
                }),
                {
                    title: '问题',
                    field: 'problem',
                    width: 90,
                    content: utils.corewordProblemRenderer
                },
                {
                    content: utils.corewordSuggestRenderer,
                    field: 'suggestion',
                    title: '建议操作',
                    width: 90
                }
            ];

            return {
                id: this._id,
                // 设置表格内容高度，超过该高度出现滚动条
                bodyHeight: 357,//378,
                sortable: 'true',
                fields: fieldConfig,
                datasource: []
            };
        },
        /**
         * 销毁重点词表格实例
         * @method dispose
         */
        dispose: function() {
            ui.util.dispose(this._id);
            this._table = null;
            this._data.length = 0;
            this._bubbleData.length = 0;
        }
    };

    return CorewordTable;
}($$, nirvana);