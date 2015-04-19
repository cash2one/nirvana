/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/common/CustomTable.js
 * desc: 定制表格组件，提供分页或者查看更多功能
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/03/08 $
 */
/**
 * 定制表格组件，提供分页或者查看更多功能
 * @class CustomTable
 * @namespace nirvana.aopkg
 */
nirvana.aopkg.CustomTable = function($, T, ui, nirvana) {
    var isArr = T.lang.isArray;

    function CustomTable() {
    }

    CustomTable.prototype = {
        /**
         * 获取选择的行的索引
         * @return {Array}
         */
        getSelRowIdxs: function() {
            return this._table.selectedIndex;
        },
        /**
         * 获取表格的数据源
         * @return {Array}
         */
        getDatasource: function() {
            return this._table.datasource;
        },
        /**
         * 获取表格UI组件
         * @return {ui.Table}
         */
        getUI: function() {
            return this._table;
        },
        /**
         * 为表格组件绑定一些数据，这些数据会绑定到真正的{ui.Table}实例的上下文里
         * 主要用在一些表格title或单元格渲染时候需要用到的其它额外信息.
         * 例如：
         * setData({ regionName: '北京' })
         * 表格的title配置：
         * title: function() {
         *    return this.regionName; // 可以访问到外部传入的数据信息
         * }
         * @param {Object} data 要绑定的数据信息对象
         */
        setData: function(data) {
            for (var k in data) {
                if (data.hasOwnProperty(k)) {
                    this._table[k] =data[k];
                }
            }
        },
        /**
         * 设置当前表格控件展现的子表格组件，如果当前已经存在子表格控件会先dispose掉
         * @param {Object} subTable 子表格组件，必须提供dispose方法，便于表格控件销毁前
         *                          先将子表格组件销毁掉
         */
        setSubTable: function(subTable) {
            this.disposeSubTable();
            this._subTable = subTable;
        },
        /**
         * 获取当前展现的子表格组件
         * @return {Object}
         */
        getSubTable: function() {
            return this._subTable;
        },
        /**
         * 根据给定单元格的样式名，获取其所对应的列索引，如果没找到，返回-1.如果有多个包含相同
         * 的单元格样式名，只返回找到的第一个列索引。
         * @param {string} cellClassName 要确定列索引的单元格包含的样式名
         * @return {number}
         */
        findCellColIdx: function(cellClassName) {
            var table = this._table;
            var colIdx = 0;
            var cellId;
            var cellEle;
            var main = table.main;

            do {
                cellId = table.getBodyCellId(0, colIdx);
                cellEle = $('#' + cellId, main)[0];
                if (cellEle && $('.' + cellClassName, cellEle).length > 0) {
                    return colIdx;
                }
                colIdx++;
            } while(cellEle);

            return -1;
        },
        /**
         * 渲染表格
         * @param {HTMLElement} main 表格渲染挂载的DOM元素
         */
        render: function(main, tableConf) {
            if (!this._table) {
                this._table = ui.util.create('Table', tableConf, main);
            }
            else {
                this._table.render(main);
            }
        },
        /**
         * 重新渲染表格
         */
        repaint: function() {
            // 先销毁子表格组件
            this.disposeSubTable();
            this._table.render();
        },
        /**
         * 更新表格，根据给定的数据源重新渲染表格
         * @param {Array} data 要更新的表格数据
         * @param {string} noDataHtml 更新表格时候，没有数据显示的内容，可选
         */
        update: function(data, noDataHtml) {
            var table = this._table;
            table.datasource = data || [];
            // 绑定没有数据时候的显示信息 如果不存在首屏词，但存在更多，不显示没有数据话术
            noDataHtml && (table.noDataHtml = noDataHtml);
            // 重绘表格控件
            this.repaint();
        },
        /**
         * 更新指定行的数据
         * @param {number|Array} rowIdxs 要更新的行的索引
         * @param {Object|Array} rowData 要更新的行的数据信息，跟rowIdxs一一对应
         *                               如果所有行要更新的数据都是一样的，rowData可以
         *                               只传一个数据对象，不用传入n行一模一样的数据对象
         * @param {string} highlightStyle 要高亮修改的行的样式，如果未传，则不高亮
         */
        updateRowData: function(rowIdxs, rowData, highlightStyle) {
            !isArr(rowIdxs) && (rowIdxs = [rowIdxs]);
            !isArr(rowData) && (rowData = [rowData]);

            var me = this;
            var table = me._table;
            var selIndexArr = table.selectedIndex;
            var tableData = table.datasource;
            var inputEle;
            var idx;
            var isSame = rowData.length === 1;

            for (var i = rowIdxs.length; i --;) {
                idx = rowIdxs[i];

                // 更新行记录
                T.extend(tableData[idx], isSame ? rowData[0] : rowData[i]);
                // 为修改过的行添加样式高亮
                me.highlightRow(idx, highlightStyle);

                // 对于修改的行如果当前没有被选中，将其选中
                if (T.array.indexOf(selIndexArr, idx) === - 1) {
                    inputEle = T.g(table.getId('multiSelect' + idx));
                    inputEle.checked = true;
                    table.selectMulti(idx);
                }
            }
        },
        /**
         * 高亮表格行
         * @param {number|Array} rowIdxs 要高亮的表格行索引
         * @param {string} highlightStyle 要高亮的样式名称
         */
        highlightRow: function(rowIdxs, highlightStyle) {
            if (highlightStyle) {
                !isArr(rowIdxs) && (rowIdxs = [rowIdxs]);
                var table = this._table;
                for (var i = rowIdxs.length; i --;) {
                    T.addClass(table.getRow(rowIdxs[i]), highlightStyle);
                }
            }
        },
        /**
         * 更新单元格内容，根据给定的行列索引，重新渲染单元格内容
         * @param {number|Array} rowIdxs 单元格所在的行索引，如果要更新的列有多个，但行
         *                               都一样，rowIdxs可以只传入一个行索引
         * @param {number|Array} colIdxs 单元格所在的列索引，跟rowIdx一一对应。如果要
         *                               更新的行有多个，列都一样的，colIdxs可以只传入
         *                               一个列索引
         */
        updateCell: function(rowIdxs, colIdxs) {
            !isArr(rowIdxs) && (rowIdxs = [rowIdxs]);
            !isArr(colIdxs) && (colIdxs = [colIdxs]);

            var hasSameRow = rowIdxs.length == 1;
            var hasSameCol = colIdxs.length == 1;

            var table = this._table;
            var fieldIdx;
            var content;
            var rowData;
            var html;
            var cellId;
            var cellContentEle;
            var rIdx;
            var cIdx;

            for (var i = rowIdxs.length; i --;) {
                rIdx = hasSameRow ? rowIdxs[0] : rowIdxs[i];
                cIdx = hasSameCol ? colIdxs[0] : colIdxs[i];

                // 如果第一列有复选框或单选框，域索引要减1
                fieldIdx = table.select ? (cIdx - 1) : cIdx;

                content = table.fields[fieldIdx].content;
                rowData = table.datasource[rIdx];
                html = 'function' == typeof content
                    ? content.call(table, rowData, rIdx, cIdx)
                    : rowData[content];

                cellId = table.getBodyCellId(rIdx,  cIdx);
                cellContentEle = T.dom.children(cellId)[0];
                cellContentEle.innerHTML = html;
            }
        },
        /**
         * 从表格中删除指定的行
         * @param {number|Array} rowIdxs 要删除的行的索引
         */
        delRows: function(rowIdxs) {
            !isArr(rowIdxs) && (rowIdxs = [rowIdxs]);
            // 确保元素索引升序排序
            rowIdxs.sort();

            var ds = this.getDatasource();
            var idx;
            for (var i = rowIdxs.length; i --;) {
                idx = rowIdxs[i];
                if (idx >= 0 && idx < ds.length) {
                    ds.splice(idx, 1);
                }
            }

            // 重绘表格
            this.repaint();
        },
        /**
         * 添加表格行选择处理器
         * @param {string|Function} handler 行选择处理器
         * @param {Object} context 要执行的事件处理器上下文
         */
        addRowSelHandler: function(handler, context) {
            this._table.onselect = nirvana.util.bind(handler, context);
        },
        /**
         * 为表格添加行内操作的事件处理器
         * @param handler
         * @param context
         */
        addInlineHandler: function(handler, context) {
            // 绑定表格行内操作事件处理器
            nirvana.tableUtil.bindInlineHandler(this._table, handler, context);
        },
        /**
         * 销毁子表格组件，如果存在的话
         */
        disposeSubTable: function() {
            if (this._subTable) {
                this._subTable.dispose();
                this._subTable = null;
            }
        },
        /**
         * 销毁定制表格实例
         * @method dispose
         */
        dispose: function() {
            // 先销毁子表格组件
            this.disposeSubTable();
            ui.util.dispose(this._table.id);
            this._table = null;
        }
    };

    return CustomTable;
}($$, baidu, ui, nirvana);