/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/quality/IdeaSubTable.js
 * desc: 用于质量度优化包302关键词的创意优化详情查看创意的创意表格信息
 *       基于quality/widget_302.js重写
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * author: zhujialu@baidu.com
 * date: $Date: 2013/05/07 $
 */
/**
 * 用于质量度优化包302关键词的创意优化的创意表格类
 * @class IdeaSubTable
 * @namespace nirvana.aoPkgControl
 */
nirvana.aoPkgControl.IdeaSubTable = function($, T, ui, nirvana) {
    function IdeaSubTable() {
    }

    IdeaSubTable.prototype = {
        /**
         * 初始化表格上下文
         * @param {Object} options 初始化到上下文的选项信息
         * @param {number} options.pageNo 初始化显示的分页号，默认1
         * @param {number} options.pageSize 初始化显示的分页大小，默认3
         * @param {ui.Table} options.parentTable 该创意子表格的父表格组件
         * @param {Object} options.item 该子表格所在的父表格行对应的行记录
         * @param {number} options.row 该子表格所在的父表格所对应的行索引
         */
        init: function(options) {
            var defaultOptions = {
                pageNo: 1,
                pageSize: 3
            };

            T.object.extend(defaultOptions, options || {});
            this.initAttrs(defaultOptions);
        },
        /**
         * 渲染表格
         * @param {HTMLElement} main 表格渲染挂载的DOM元素
         */
        render: function(main) {
            var me = this;

            main.innerHTML = er.template.get('aoPkgIdeaSubTable');
            me._UIMap = ui.util.init(main, me.getUIConf());
            me.initUIAttr();
            me.updateBtnState([]);
        },
        /**
         * 初始化UI控制的属性，并创建相应的UI控件Getter方法
         */
        initUIAttr: function() {
            var me = this;
            var uiMap = me._UIMap;
            var attrMap = {
                table: 'subrowIdeaTable',
                pager: 'subrowIdeaPage',
                activeBtn: 'aoPkgActiveIdea',
                enableBtn: 'aoPkgEnableIdea',
                delBtn: 'aoPkgDelIdea'
            };

            for (var name in attrMap) {
                me.setAttr(name, uiMap[attrMap[name]]);
                me.createAttrGetter(name);
            }
        },
        /**
         * 获取行记录
         * @param {number} rowIdx 要获取的行的索引
         * @returns {Object}
         */
        getRowData: function (rowIdx) {
            var ds = this.getTable().datasource;
            return ds && ds[rowIdx];
        },
        /**
         * 显示创意子表格
         */
        show: function() {
            var me = this;

            var parentTable = me.getAttr('parentTable');
            var rowIdx = me.getAttr('row');
            me._view =  parentTable.getSubrow(rowIdx);;

            me.render(me._view);
            me.bindHandlers();

            parentTable.fireSubrow(rowIdx);
            parentTable.refreshView();
            me.loadData();
        },
        /**
         * 隐藏创意子表格
         */
        hide: function() {
            var me = this;
            var parentTable = me.getAttr('parentTable');
            var rowIdx = me.getAttr('row');
            // 隐藏子表格
            parentTable.fireSubrow(rowIdx);
        },
        /**
         * 销毁创意子表格
         */
        dispose: function() {
            var me = this;

            me.hide();
            // 销毁控件实例
            ui.util.disposeWidgetMap(me._UIMap);
            me.clearAttr();

            // 清空渲染的子表格
            me._view.innerHTML = '';
            me._view = null;
        },
        /**
         * 绑定事件处理器
         */
        bindHandlers: function() {
            var me = this;

            // 绑定表格行选择事件处理器
            var table = me.getTable();
            table.onselect = function(selRowIdxs) {
                me.updateBtnState(selRowIdxs);
            };

            // 绑定分页组件的选择分页事件处理
            me.getPager().onselect = function(page) {
                me.setAttr('pageNo', page);
                me.loadData();
            };
        },
        /**
         * 加载创意相关的数据并更新UI
         */
        loadData: function() {
            var me = this;

            var callback = function(json) {
                if (json) {
                    var totalData = json.data.listData;
                    var pageNo = me.getAttr('pageNo');
                    var pageSize = +me.getAttr('pageSize');
                    var totalNum = totalData.length;
                    var totalPage = Math.ceil(totalNum / pageSize);

                    // 如果请求的页码超过当前的最大页数则重置为第一页
                    if (totalPage && pageNo > totalPage) {
                        pageNo = 1;
                        me.setAttr('pageNo', pageNo);
                    }

                    // 更新表格组件
                    var startIndex = (pageNo - 1) * pageSize;
                    var endIndex = Math.min(startIndex + pageSize, totalNum);
                    me.updateTable(totalData.slice(startIndex, endIndex));

                    // 更新分页组件
                    me.updatePageUI(pageNo, totalPage);
                }
                else {
                    // 数据读取异常
                    me.updateTable([], true);
                }
            };

            var item = me.getAttr('item');
            var ideaIds = item.ideaid.split(',');

            lib.idea.getIdeaList({ ideaid: ideaIds }, callback);
        },
        /**
         * 更新表格
         * @param {Array} data 要更新的表格数据
         * @param {boolean} isFail 是否请求失败
         */
        updateTable: function(data, isFail) {
            var table = this.getTable();
            table.datasource = data || [];
            table.noDataHtml = nirvana.tableUtil.getNoDataTip(isFail);
            table.render();
        },
        /**
         * 更新分页组件
         * @param {number} pageNo 当前显示的分页号
         * @param {number} totalPage 总的分页数
         */
        updatePageUI: function(pageNo, totalPage) {
            var pageUI = this.getPager();
            // 如果分页总数或当前选择的分页发生变化，则重新渲染分页组件
            if (totalPage !== pageUI.total || pageUI.page !== pageNo) {
                pageUI.total = totalPage;
                pageUI.page = pageNo;
                pageUI.render();
            }
        },
        /**
         * 获取选择的行（对应的域）的数据
         * @param {string} field 要获取的行记录的域名称，可选，未指定，返回所有域
         * @param {string} selRowIdxs 要获取的行的记录，可选，未指定，自动返回当前表格选择
         *                            的行
         * @return {Array}
         */
        getSelRowData: function(field, selRowIdxs) {
            var table = this.getTable();
            var ds = table.datasource;
            selRowIdxs || (selRowIdxs = table.selectedIndex);
            return nirvana.tableUtil.getFieldData(selRowIdxs, field, ds);
        },
        /**
         * 更新工具栏按钮的状态
         * @param {Array} selRowIdxs 当前选择的表格的行索引数组
         */
        updateBtnState: function(selRowIdxs) {
            var selRowData = this.getSelRowData(null, selRowIdxs);

            var ideaLib = lib.idea;
            var activeDisable = ideaLib.disableActive(selRowData);
            var enableDisable = ideaLib.disableEnable(selRowData);
            var deleteDisable = ideaLib.disableDelete(selRowData);

            var me = this;
            me.getActiveBtn().disable(activeDisable);
            me.getEnableBtn().disable(enableDisable);
            me.getDelBtn().disable(deleteDisable);

            // 读写分离，待升级之后不用这种方式了
            // by Leo Wang
            nirvana.acc.accService.processEntrances('aoPackage/detail/' + me.getAttr('opttypeid'));
        },
        /**
         * 获取UI初始化的配置信息
         * @return {Object}
         */
        getUIConf: function () {
            return {
                subrowIdeaTable: {
                    fields: [
                        {
                            title: '创意',
                            content: function(item) {
                                return lib.idea.getIdeaCell(item);
                            },
                            width: 720,
                            minWidth: 720
                        },
                        {
                            title: '状态',
                            content: function(item) {
//                                return lib.idea.getIdeaState(item);
                                var ideaid = item.ideaid || item.creativeid;
                                return '<div class="idea_update_state" id="ideastat_update_' + ideaid + '">' +
                                    buildIdeaStat(item) + '</div>';
                            },
                            width: 100,
                            minWidth: 100
                        }
                    ],
                    datasource: [],
                    noDataHtml: '',
                    select: "multi",
                    noScroll: true
                }
            };
        }
    };

    // 支持属性读写功能
    T.extend(IdeaSubTable.prototype, nirvana.attrHelper);

    return IdeaSubTable;
}($$, baidu, ui, nirvana);