/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/quality/qualityDetailConf.js
 * desc: 定义质量度优化包部分优化项详情视图配置
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/05/07 $
 */
/**
 * 定义质量度优化包302、303优化项详情视图配置
 * @namespace nirvana.aoPkgControl
 */
nirvana.aoPkgControl.qualityDetailConf = {
    // 质量度优化包无生效创意优化项
    302: {
        base: 'getPageViewBaseParam',
        applyBtnLabel: '删除所选',
        applyType: 'deleteUnit',
        title: '单元无生效创意',
        materialName: '单元',
        tipStyle: 'hide', // 不显示顶部的tip信息
        tableOption: {
            subrow: '1'
        },
        fields: [
            ['planinfo', { length: 50 }],
            ['unitinfo', { length: 50 }],
            {
                title: '操作',
                content: function (item, row) {
                    var html = '';
                    if (item.ideaid) {
                        html = ''
                            + '<span class="clickable aopkg-cell-href-btn" '
                            +       'id="' + this.getSubentryId(row) + '" '
                            +       'action="expandIdea">'
                            +       '查看创意'
                            + '</span>';
                    }
                    return html
                        + '<span class="clickable aopkg-cell-href-btn" action="addIdea">'
                        +       '添加创意'
                        + '</span>';
                }
            }
        ],
        /**
         * @extends nirvana.aoPkgControl.PaginationView
         */
        extend: {
            /**
             * 行内添加创意事件处理
             * @param {HTMLElement} target 触发该动作的目标DOM元素
             * @param {Object} item 要添加创意的数据对象
             */
            addIdea: function(target, item) {
                var me = this;

                item.changeable = false;
                item.maskLevel = nirvana.aoPkgWidgetCommon.getMaskLevel();
                item.opttypeid = me.getOpttypeid();
                item.entranceType = 'aoPackage';

                lib.idea.addIdea(item, function() {
                    me.fireMod('addIdea', item);
                });
            },
            /**
             * 改变查看/收起创意的超链接的状态事件处理
             * @param {HTMLElement} target 触发该动作的目标DOM元素
             * @param {boolean} isExpand 当前是否是处于展开状态
             */
            toggleIdeaHrefState: function(target, isExpand) {
                target.setAttribute('action', isExpand ? 'collapseIdea': 'expandIdea');
                target.innerHTML = isExpand ? '收起创意' : '查看创意';
            },
            /**
             * 收起创意事件处理
             * @param {HTMLElement} target 触发该动作的目标DOM元素
             * @param {Object} item 触发该动作的行所对应的数据对象
             */
            collapseIdea: function(target, item) {
                var me = this;

                me.toggleIdeaHrefState(target, false);

                // 发送收起创意监控
                me.logger.collapseIdea(item, me.getOpttypeid());

                var table = me.getTable();
                // dispose掉已经存在的子表格控件
                table.setSubTable(null);
            },
            /**
             * 展开创意事件处理
             * @param {HTMLElement} target 触发该动作的目标DOM元素
             * @param {Object} 触发该动作的行所对应的数据对象
             * @param {number} rowIdx 触发该动作所在的行的索引
             */
            expandIdea: function(target, item, rowIdx) {
                var me = this;

                me.toggleIdeaHrefState(target, true);

                var table = me.getTable();
                var ideaTable = new nirvana.aoPkgControl.IdeaSubTable();
                var oldIdeaTable = table.getSubTable();
                if (oldIdeaTable) {
                    me.toggleIdeaHrefState(oldIdeaTable.getAttr('target'), false);
                }
                table.setSubTable(ideaTable);

                ideaTable.init({
                    target: target,
                    item: item,
                    row: rowIdx,
                    parentTable: table.getUI(),
                    opttypeid: me.getOpttypeid()
                });
                ideaTable.show();
            },
            /**
             * 获取子表格所对应的行的记录
             * @param {number} row 行索引
             * @returns {Object}
             */
            getSubTableRowData: function (row) {
                var ideaSubTable = this.getTable().getSubTable();
                return ideaSubTable.getRowData(row);
            },
            /**
             * ###创意子表格的事件处理###
             * 查看修改创意前/后的状态
             * @param {HTMLElement} target 触发该动作的目标DOM元素
             * @param {Object} idea 要编辑的创意的数据对象
             * @param {number} row 触发该动作的表格行索引
             * @event
             */
            switchShadow: function(target, idea, row) {
                var me = this;
                var ideaSubTable = me.getTable().getSubTable();
                // 注意这里传入数据是错的，由于这是子表格的事件处理器
                idea = me.getSubTableRowData(row);
                var curRow = ideaSubTable.getTable().getRow(row);

                // 获得单元格
                var cells = $$('.ui_table_tdcell', curRow);
                cells.shift();

                lib.idea.switchShadow(idea, cells);
            },
            /**
             * ###创意子表格的事件处理###
             * 行内编辑创意
             * @param {HTMLElement} target 触发该动作的目标DOM元素
             * @param {Object} idea 要编辑的创意的数据对象
             * @param {number} row 触发该动作的表格行索引
             * @event
             */
            editIdea: function(target, idea, row) {
                var me = this;
                // 注意这里传入数据是错的，由于这是子表格的事件处理器
                idea = me.getSubTableRowData(row);
                var dataItem = baidu.object.clone(idea);

                dataItem.maskLevel = nirvana.aoPkgWidgetCommon.getMaskLevel();
                dataItem.opttypeid = me.getOpttypeid();
                dataItem.entranceType = 'aoPackage';

                // 发送监控
                me.logger.editIdea(dataItem);

                lib.idea.editIdea(dataItem, function() {
                    me.fireMod();
                });
            },
            /**
             * ###创意子表格的事件处理###
             * 行内启用创意
             * @param {HTMLElement} target 触发该动作的目标DOM元素
             * @param {Object} idea 要启用创意的数据对象
             * @param {number} row 触发该动作的表格行索引
             * @event
             */
            enableIdea: function(target, idea, row) {
                // 注意这里传入数据是错的，由于这是子表格的事件处理器
                idea = this.getSubTableRowData(row);
                this.modIdea('enableIdea', 'enableIdea', [idea.ideaid]);
            },
            /**
             * ###创意子表格的事件处理###
             * 行内暂停创意
             * @param {HTMLElement} target 触发该动作的目标DOM元素
             * @param {Object} idea 要暂停创意的数据对象
             * @param {number} row 触发该动作的表格行索引
             * @event
             */
            pauseIdea: function(target, idea, row) {
                // 注意这里传入数据是错的，由于这是子表格的事件处理器
                idea = this.getSubTableRowData(row);
                this.modIdea('pauseIdea', 'pauseIdea', [idea.ideaid]);
            },
            /**
             * 修改创意的公共处理逻辑
             * @param {string} actionName 修复操作的动作名称，其引用lib.idea[actionName]
             * @param {string} logName 修改操作所触发的发送监控名称，其引用logger[logName]
             * @param {Array} ideaids 要修改的创意id（数组）
             */
            modIdea: function(actionName, logName, ideaids) {
                var me = this;
                var opttypeid = me.getOpttypeid();
                var logger = me.logger;
                var ACTION_STATE = logger.ACTION_STATE;

                // 发送点击激活监控
                logger[logName](ideaids, opttypeid, ACTION_STATE.CLICK);

                var callback = function (success) {
                    if (success) {
                        // 发送确认修复且成功的监控
                        logger[logName](ideaids, opttypeid, ACTION_STATE.CONFIRM);
                        me.fireMod();
                    }
                    else {
                        // 发送取消监控或失败监控
                        logger[logName](ideaids, opttypeid, ACTION_STATE.CANCEL);
                    }
                };

                lib.idea[actionName](ideaids, callback);
            },
            /**
             * ###创意子表格的事件处理###
             * 批量修改创意
             * @param {string} actionName 修复操作的动作名称，其引用lib.idea[actionName]
             * @param {string} logName 修改操作所触发的发送监控名称，其引用logger[logName]
             * @param {string} btnGetter 获取批量修改按钮控件的方法名
             * @event
             */
            batchModIdea: function(actionName, logName, btnGetter) {
                var me = this;
                var ideaSubTable = me.getTable().getSubTable();

                if (ideaSubTable[btnGetter]().isDisable()) {
                    return;
                }
                var ideaids = ideaSubTable.getSelRowData('ideaid');
                me.modIdea(actionName, logName, ideaids);
            },
            /**
             * ###创意子表格的事件处理###
             * 批量激活创意的事件处理
             * @event
             */
            batchActiveIdea: function() {
                this.batchModIdea('activeIdea', 'batchActiveIdea', 'getActiveBtn');
            },
            /**
             * ###创意子表格的事件处理###
             * 批量启用创意
             * @event
             */
            batchEnableIdea: function() {
                this.batchModIdea('enableIdea', 'batchEnableIdea', 'getEnableBtn');
            },
            /**
             * ###创意子表格的事件处理###
             * 批量删除创意
             * @event
             */
            batchDelIdea: function() {
                this.batchModIdea('deleteIdea', 'batchDelIdea', 'getDelBtn');
            }
        }
    },
    // 质量度优化包优化质量优化项包括303.1和303.2两类
    303: {
        base: 'getPageViewBaseParam',
        data: '*',
        containerStyle: 'opttype_303',
        fields0: [
            {
                content: function (data) {
                    return lib.idea.getIdeaCell(data);
                },
                title: '创意',
                field: 'title',
                width: 600,
                minWidth: 600
            },
            {
                content: function (data) {
                    var words = eval(data.showword), word, ret = '<div class="effected_words">';

                    for (var i = 0, len = words.length; i < len; i++) {
                        word = words[i];
                        word = '<span title="' + word + '">' + getCutString(word, 22, '...') + '</span>';
                        ret += word;
                    }
                    ret += '</div>';

                    return ret;
                },
                title: '影响的关键词',
                field: 'words',
                width: 300
            }
        ],
        fields1: [
            {
                content: function (item) {
                    var opttype = 303;
                    return lib.field.wordinfo_decrease(23, opttype)(item);
                },
                title: '关键词',
                width:100
            },
            ['planinfo', { length: 30 }],
            ['unitinfo', { length: 30 }],
            qStar.getTableField({ VIEW: 'QualityPkg' }),
            {
                content: function() {
                    return '<a act="optimizeIdea">优化创意</a>';
                },
                title: '操作'
            }
        ],
        extend: nirvana.aoPkgControl.IdeaTabDetail
    }
};