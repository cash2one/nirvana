/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/common/RecmwordTable.js
 * desc: 推词表格控件，支持查看更多功能
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/03/11 $
 */
/**
 * 推词表格控件，支持查看更多功能
 * @class RecmwordTable
 * @namespace nirvana.aopkg
 */
nirvana.aopkg.RecmwordTable = function($, T, ui, nirvana) {
    var isArr = T.lang.isArray;
    var executeCallback = nirvana.util.executeCallback;
    // 为行内修改未保存添加的定制样式
    var MOD_ROW_STYLE = 'ui_table_trmark';

    function RecmwordTable() {
    }

    RecmwordTable.prototype = {
        /**
         * 获取推荐的词的总数量
         * @return {number}
         */
        getRecmwordNum: function() {
            return this._recmwordData ? this._recmwordData.length : 0;
        },
        /**
         * 获取首屏词的数量
         * @return {number}
         */
        getFirScreenWordNum: function() {
            return this._firScreenWordNum;
        },
        /**
         * 初始化首屏词的数量
         * @param {Array} data 推荐的词数据
         * @private
         */
        initFirScreenWordNum: function(data) {
            var firScreenWordNum = 0;

            while (data[firScreenWordNum]
                && (+ data[firScreenWordNum].isfstscreen == 1)) {
                firScreenWordNum ++;
            }

            this._firScreenWordNum = firScreenWordNum;
        },
        /**
         * 获取当前表格被修改未添加保存的词的数量
         * @return {number}
         */
        getModRecordNum: function() {
            // 初始化修改过的行未保存的行数
            var modRecordNum = 0;
            var table = this._table;
            var row;
            var idx = 0;

            while (row = table.getRow(idx)) {
                // offsetHeight不为0表示该行并没有被隐藏掉，由于当前表格行删除实际上只是
                // 通过隐藏行实现
                if (row.offsetHeight && T.dom.hasClass(row, MOD_ROW_STYLE)) {
                    modRecordNum ++;
                }
                idx ++;
            }

            return modRecordNum;
        },
        /**
         * 更新表格
         * @param {Array} data 要更新的表格数据
         * @param {string} noDataHtml 更新表格时候，没有数据显示的内容
         * @override
         */
        update: function(data, noDataHtml) {
            var me = this;
            // 初始化所有推荐词的数据
            me._recmwordData = data;
            // 初始化首屏词数量
            me.initFirScreenWordNum(data);
            // 缓存推荐信息
            me._cacheRecmdInfo(data);

            // 是否存在获取更多按钮
            var hasMoreBtn = me.getRecmwordNum() > me.getFirScreenWordNum();

            var table = me._table;
            // 更新表格的数据源, 初次只展现首屏词
            me.getRecmwords(0);
            // 绑定没有数据时候的显示信息 如果不存在首屏词，但存在更多，不显示没有数据话术
            table.noDataHtml = (table.datasource.length === 0 && hasMoreBtn)
                ? '' : noDataHtml;
            // 重绘表格控件
            me.repaint();

            // 是否存在获取更多按钮
            var hasMoreBtn = me.getRecmwordNum() > me.getFirScreenWordNum();
            me.addwordTable = new nirvana.util.addwordTable(
                me._table,
                function(i) {
                    return me.getRecmwords(i);
                },
                hasMoreBtn
            );
            // 注册行记录删除的回调
            me.addwordTable.onRowDel = function(leftRecordNum) {
                // 缓存当前显示的关键词数量
                me._currShowWordNum = leftRecordNum;
                // 触发显示关键词数量发生变化事件
                me.fireShowWordChange(leftRecordNum);

                if (!leftRecordNum && !me._hasMore) {
                    table.getBody().innerHTML = noDataHtml;
                }
            };
            // 注册行选中的事件回调
            me.addwordTable.onRowSel = nirvana.util.bind('onRowSel', me);
        },
        /**
         * 更新指定行的数据
         * @param {number|Array} rowIdxs 要更新的行的索引
         * @param {Object|Array} rowData 要更新的行的数据信息，跟rowIdxs一一对应
         * @override
         */
        updateRowData: function(rowIdxs, rowData) {
            var parentMethod = RecmwordTable.superClass.updateRowData;
            parentMethod.call(this, rowIdxs, rowData, MOD_ROW_STYLE);
        },
        /**
         * 从表格中删除指定的行
         * @param {number|Array} rowIdxs 要删除的行的索引
         * @override
         */
        delRows: function(rowIdxs) {
            !isArr(rowIdxs) && (rowIdxs = [rowIdxs]);
            // 删除添加过的数据
            this.addwordTable.deleteRows(rowIdxs);
        },
        /**
         * 缓存推荐的提词的信息：推荐的出价、匹配、计划和单元，由于当前推荐出价、匹配等可以被直接
         * 修改，导致推荐信息丢失，所以这里做了一份拷贝。
         * @param {Object} item
         * @param {number} index item记录在缓存数据里所在的记录行索引
         * @private
         */
        _cacheRecmdInfo: function(data) {
            var item;
            var match;
            var field;

            for (var i = data.length; i --;) {
                item = data[i];
                for (field in item) {
                    // 将recm*域值拷贝一份存储在_recm*域
                    if (item.hasOwnProperty(field)
                        && (match = /^(recm.*)/.exec(field))
                        ) {
                        item['_' + match[1]] = item[field];
                    }
                }
            }
        },
        /**
         * 分批获取关键词
         * @param {number} nthLoad 第nth次加载推荐的关键词，从0开始
         */
        getRecmwords: function(nthLoad) {
            var me = this;
            var pace = 100;
            var firScreenNum = me.getFirScreenWordNum();
            var totalNum = me.getRecmwordNum();

            var startIdx = (0 === nthLoad)
                ? 0 : (firScreenNum + pace * (nthLoad - 1));
            var endIdx = firScreenNum + nthLoad * pace;

            // 缓存是否还有推词可加载
            me._hasMore = endIdx < totalNum;
            if (endIdx > totalNum) {
                endIdx = totalNum;
            }

            var recmdwordArr = [];
            for (var j = startIdx; j < endIdx; j++){
                recmdwordArr.push(me._recmwordData[j]);
            }

            if (nthLoad > 0) {
                // 通过点击更多触发加载
                me.addwordTable.setData(recmdwordArr, nthLoad);

                /**
                 * 点击更多按钮触发的事件
                 * @event onClickMore
                 * @param {number} nthLoad 第几次点击更多按钮
                 * @param {Array} recmdwordArr 点击更多追加的关键词数据
                 */
                    // 执行点击more按钮事件处理器
                executeCallback('onClickMore', [nthLoad, recmdwordArr], me);
            }
            else {
                me._table.datasource = recmdwordArr;
            }

            // 缓存当前显示的关键词数量
            var curShowWordNum = me._currShowWordNum || 0;
            curShowWordNum += recmdwordArr.length;
            me._currShowWordNum = curShowWordNum;
            // 触发关键词表格展现词数量变化的事件
            me.fireShowWordChange(curShowWordNum);

            return !me._hasMore;
        },
        /**
         * 触发展现的关键词数量发送变化的事件
         * @private
         */
        fireShowWordChange: function(showWordNum) {
            /**
             * 触发关键词表格展现词数量变化的事件
             * @event onWordsNumChange
             * @param {number} showWordNum 显示的关键词数量
             */
            executeCallback('onWordsNumChange', [showWordNum], this);
        }
    };

    T.inherits(RecmwordTable, nirvana.aopkg.CustomTable);

    return RecmwordTable;
}($$, baidu, ui, nirvana);