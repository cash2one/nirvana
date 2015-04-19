/**
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: aoPackage/business/widget_302.js
 * desc: 优化匹配详情
 * author: zhujialu@baidu.com
 * date: $Date: 2012/05/02 $
 */

/**
 * 返回30x公共的代码
 * @deprecated
 */
nirvana.aoPkgControl.widget302 = new er.Action({
    VIEW: 'aoPkgDetail',
    title: {
        302: '单元无生效创意'
    },
    fields: {
        302: [
            nirvana.aoPkgWidgetFields.planinfo({length: 26}),
            nirvana.aoPkgWidgetFields.unitinfo({length: 26}),
            {
                title : '操作',
                content : function(item, row) {
                    var html = '';
                    if (item.ideaid) {
                        html += '<a id="' + this.getSubentryId(row) + '" act="watchIdea">查看创意</a>&nbsp;&nbsp;&nbsp;&nbsp;'; 
                    }
                    return html + '<a act="addIdea">添加创意</a>';
                }
            }
        ]
    },
    btn: {
        302: '删除'
    },
    applyType: {
        302: 'deleteUnit'
    },
    UI_PROP_MAP: {
        WidgetTable: {
            fields : '*widgetTableFields',
            datasource : '*widgetTableData',
            noDataHtml : FILL_HTML.NO_DATA,
            select: 'multi',
            isSelectAll: 'true',
            subrow: '1'
        },
        WidgetPage: {
            page : '*pageNo',
            total : '*totalPage'
        }
    },
    CONTEXT_INITER_MAP: {
        init: nirvana.aoPkgWidgetCommon.getInit(),
        initTable: function(callback) {
            var me = this,
                opttypeid = me.getContext('opttypeid'),
                tableFields = me.fields[opttypeid];
            
            me.setContext('widgetTableFields', tableFields);

            nirvana.aoPkgWidgetCommon.getDetail(me, function() {
                callback();
            });
        }
    },

    onentercomplete: function() {
        var me = this;
        // Modified by Wu Huiyao 解决因为修改lib.delegate的事件绑定方式引入的bug
        var delegateElem = ui.util.get('WidgetTable').main.parentNode;
        lib.delegate.init(delegateElem, me);
        nirvana.aoPkgWidgetHandle.basicClickHandler(me);
    },
    
    /**
     * 查看创意
     */
    watchIdea: function(event) {
        var prev = this.getContext('watchIdeaNode');
        // 如果之前点击过“查看创意”却没关
        if (prev) {
            this.ideaNode('close', prev);
        }

        // 小型的上下文环境，管理子表格和翻页
        var target = event.target;
        this.ideaNode('open', target);
        this.setContext('watchIdeaNode', target);

        var me = this,
            // 主表格
            table = me._controlMap.WidgetTable,
            // 当前行号
            curRow = table.curRow,
            rowDOM = table.getSubrow(curRow),
            // 行号对应的数据
            dataItem = nirvana.aoPkgControl.widget.common.rows2Data(me, curRow)[0];

        // 先把小环境的变量初始化好, 定义常量
        var PAGE_SIZE = 3,
            KEY_PAGENO = 'curSubPageNo' + curRow;

        // 分页相关
        var totalPage, totalData, pageNo;
        // The buttons that change idea's state
        var activeBtn, enableBtn, deleteBtn;
        
        //监控
        
        nirvana.aoPkgControl.logCenter.extend({
            planid : dataItem.planid,
            unitid : dataItem.unitid,
            action_type : 1,
            opttypeid : 302
        }).sendAs('nikon_modifyidea_view');
        
        
        var isOpen = false;
        renderSubTable();
        
        function renderSubTable() {
            // 创建按钮，子表格，翻页
            lib.idea.getIdeaList({ideaid: dataItem.ideaid.split(',')}, function(json) {
                if (!json) {
                    // 数据读取异常
                    return;
                }
                totalData = json.data.listData;
                // 总页数
                totalPage = Math.ceil(totalData.length / PAGE_SIZE);
                pageNo = me.getContext(KEY_PAGENO);
                
                if (pageNo === null) {
                    pageNo = 1;
                    me.setContext(KEY_PAGENO, pageNo);
                }
    

                // 创建表格的容器
                table.getSubrow(curRow).innerHTML = '<div id="subTableContainer' + curRow + '" class="subTableContainer">' +
                                                        '<div id="widget_option' + curRow + '" class="widget_option">' +
                                                            '<div id="activeBtn' + curRow + '" class="active-idea" act="activeIdeas">激活</div>' +
                                                            '<div id="enableBtn' + curRow + '" class="enable-idea" act="enableIdeas">启用</div>' +
                                                            '<div id="deleteBtn' + curRow + '" act="deleteIdeas">删除</div>' +
                                                        '</div>' +
                                                        '<div class="widget_table"></div>' +
                                                        '<div class="subPager" id="subPage' + curRow + '"></div>' +
                                                    '</div>';
    
                var optionNode = $$('.widget_option', rowDOM)[0],
                    tableNode = $$('.widget_table', rowDOM)[0];

                // 创建表格顶部的按钮
                activeBtn = createButton('activeBtn');
                enableBtn = createButton('enableBtn');
                deleteBtn = createButton('deleteBtn');
                
                me.setContext('activeBtn', activeBtn);
                me.setContext('enableBtn', enableBtn);
                me.setContext('deleteBtn', deleteBtn);

                // 创建表格
                var subData = getPageData(),
                    subTable = ui.util.create('Table', 
                    {
                        id : 'SubrowTable' + curRow,
                        fields : [
                            {
                                title: '创意',
                                content: function(item) {
                                    return lib.idea.getIdeaCell(item);
                                },
                                width : 720,
                                minWidth : 720
                            },
                            {
                                title: '状态',
                                content: function(item) {
                                    return lib.idea.getIdeaState(item);
                                },
                                width: 100
                            }
                        ],
                        datasource : subData,
                        noDataHtml : FILL_HTML.NO_DATA,
                        select : "multi",
                        noScroll: true
                    },
                    tableNode
                );
                
                subTable.onselect = subTableSelect;

                // 需要分页
                var subPageNode = $$('.subPager', rowDOM)[0];

                if (totalData.length > PAGE_SIZE) {
                    var pager = ui.util.create('Page', 
                        {
                            id : 'SubrowPager' + curRow,
                            total : totalPage,
                            page : pageNo
                        },
                        subPageNode
                    );
                    pager.onselect = subPageHandler;
                } else {
                    subPageNode.parentNode.removeChild(subPageNode);
                }
                
                me.setContext('subTable', subTable);
                me.setContext('subData', subData);

                if (!isOpen) {
                    isOpen = true;
                    table.fireSubrow(curRow);
                }
                table.refreshView();

            });
        }
        

        // 子表格选中的数据
        function subTableSelect(selected) {
            me.setContext('selected', selected); 
            changeButtonState(selected);
        }

        function createButton(name) {
            var btn = ui.util.create('Button', 
                    {
                        id: name + curRow
                    },
                    baidu.g(name + curRow)
                );
            btn.disable(true);
            return btn;
        }
        /**
         * Manage the states of the three buttons
         */
        function changeButtonState(selected) {
            selected = me.rows2Data(selected);

            var ideaLib = lib.idea,
                activeDisable = ideaLib.disableActive(selected),
                enableDisable = ideaLib.disableEnable(selected),
                deleteDisable = ideaLib.disableDelete(selected);

            activeBtn.disable(activeDisable);
            enableBtn.disable(enableDisable);
            deleteBtn.disable(deleteDisable);
        }

        /**
         * 获得当前页的数据
         */
        function getPageData() {
            var startIndex = (pageNo - 1) * PAGE_SIZE,
                endIndex = Math.min(startIndex + PAGE_SIZE, totalData.length);

            return totalData.slice(startIndex, endIndex);
        }
        function subPageHandler(page) {
            me.setContext(KEY_PAGENO, page);
            renderSubTable();
        }
    },
    rows2Data: function(rows, field) {
        if (!rows) {
            rows = this.getContext('selected');
        }
        return nirvana.aoPkgWidgetCommon.rows2Data(this, rows, field, this.getContext('subData'));
    },
    /**
     * 收起创意
     */
    collapseIdea: function(event) {
        this.ideaNode('close', event.target);
        
        var table = this._controlMap.WidgetTable;
        
        var dataItem = nirvana.aoPkgControl.widget.common.rows2Data(this, table.curRow)[0];
        nirvana.aoPkgControl.logCenter.extend({
            planid : dataItem.planid,
            unitid : dataItem.unitid,
            action_type : 0,
            opttypeid : 302
        }).sendAs('nikon_modifyidea_view');
        
        table.fireSubrow(table.curRow);
    },
    /**
     * 这个专门处理节点
     * @param {String} which 展开还是收起(open | close)
     * @param {Element} node
     */
    ideaNode: function(which, node) {
        node.setAttribute('act', which === 'open' ? 'collapseIdea' : 'watchIdea');
        node.innerHTML = which === 'open' ? '收起创意' : '查看创意';
    },
    addIdea: function() {
        var me = this,
            table = this._controlMap.WidgetTable,
            dataItem = this.getContext('widgetTableData')[table.curRow];

        dataItem.changeable = false;
        // 这个是为了修bug
        dataItem.maskLevel = nirvana.aoPkgWidgetCommon.getMaskLevel();
        
        dataItem.opttypeid = 302;
        
        // 监控
        nirvana.aoPkgControl.logCenter.extend({
            action_type : 0,
            planname : dataItem.planname,
            unitname : dataItem.unitname,
            opttypeid : dataItem.opttypeid
        }).sendAs('nikon_modifyidea_add');
        
        dataItem.entranceType = 'aoPackage';
        
        lib.idea.addIdea(dataItem, function() {
            me.update();
        });
    },
    update: function() {
        nirvana.aoPkgWidgetHandle.hasModified();
        this.refresh();
    },
    refresh: function() {
        nirvana.aoPkgControl.widget.handle.refresh();    
    },
    editIdea: function() {
        var me = this,
            subTable = this.getContext('subTable'),
            idea = this.rows2Data([subTable.curRow])[0];

        // 这个是为了修bug
        idea.maskLevel = nirvana.aoPkgWidgetCommon.getMaskLevel();
        
        var dataItem = baidu.object.clone(idea);
        dataItem.opttypeid = 302;
        
        // 监控
        nirvana.aoPkgControl.logCenter.extend({
            action_type : 0,
            planid : dataItem.planid,
            unitid : dataItem.unitid,
            ideaid : dataItem.ideaid,
            ideastat : dataItem.ideastat,
            pausestat : dataItem.pausestat,
            opttypeid : dataItem.opttypeid
        }).sendAs('nikon_modifyidea_edit');
        
        dataItem.entranceType = 'aoPackage';
        
        lib.idea.editIdea(dataItem, function() {
            me.update();
        });
    },
    activeIdeas: function() {
        var me = this,
            btn = this.getContext('activeBtn');
        if (btn.isDisable()) {
            return;
        }

        var ideaids = this.rows2Data(null, 'ideaid');
        nirvana.aoPkgControl.logCenter.extend({
            applycount : ideaids.length,
            opttypeid : 302,
            selectedids : ideaids.join(),
            action_type : 0
        }).sendAs('nikon_multiapply_idea_active');
        lib.idea.activeIdea(ideaids, function(success) {
            if (success) {
                nirvana.aoPkgControl.logCenter.extend({
                    applycount : ideaids.length,
                    opttypeid : 302,
                    selectedids : ideaids.join(),
                    action_type : 1
                }).sendAs('nikon_multiapply_idea_active');
                me.update();
            }
            else{
                nirvana.aoPkgControl.logCenter.extend({
                    applycount : ideaids.length,
                    opttypeid : 302,
                    selectedids : ideaids.join(),
                    action_type : -1
                }).sendAs('nikon_multiapply_idea_active');
            }
        });
    },
    enableIdeas: function() {
        var me = this,
            btn = this.getContext('enableBtn');
        if (btn.isDisable()) {
            return;
        }

        var ideaids = this.rows2Data(null, 'ideaid');
        nirvana.aoPkgControl.logCenter.extend({
            applycount : ideaids.length,
            opttypeid : 302,
            selectedids : ideaids.join(),
            action_type : 0
        }).sendAs('nikon_multiapply_idea_run');
        lib.idea.enableIdea(ideaids, function(success) {
            if (success) {
                nirvana.aoPkgControl.logCenter.extend({
                    applycount : ideaids.length,
                    opttypeid : 302,
                    selectedids : ideaids.join(),
                    action_type : 1
                }).sendAs('nikon_multiapply_idea_run');
                me.update();
            }
            else{
                nirvana.aoPkgControl.logCenter.extend({
                    applycount : ideaids.length,
                    opttypeid : 302,
                    selectedids : ideaids.join(),
                    action_type : -1
                }).sendAs('nikon_multiapply_idea_run');
            }
        });
    },
    enableIdea: function() {
        var me = this,
            subTable = this.getContext('subTable'),
            curRow = subTable.getRow(subTable.curRow),
            ideaids = this.rows2Data([subTable.curRow], 'ideaid');
        
        nirvana.aoPkgControl.logCenter.extend({
            opttypeid : 302,
            ideaid : ideaids.join(),
            action_type : 0
        }).sendAs('nikon_modifyidea_run');
        
        lib.idea.enableIdea(ideaids, function(success) {
            if (success) {
                nirvana.aoPkgControl.logCenter.extend({
                    opttypeid : 302,
                    ideaid : ideaids.join(),
                    action_type : 1
                }).sendAs('nikon_modifyidea_run');
                me.update();
            }
            else{
                nirvana.aoPkgControl.logCenter.extend({
                    opttypeid : 302,
                    ideaid : ideaids.join(),
                    action_type : -1
                }).sendAs('nikon_modifyidea_run');
            }
        });
    },
    pauseIdea: function() {
        var me = this,
            subTable = this.getContext('subTable'),
            curRow = subTable.getRow(subTable.curRow),
            ideaids = this.rows2Data([subTable.curRow], 'ideaid');
        
        nirvana.aoPkgControl.logCenter.extend({
            opttypeid : 302,
            ideaid : ideaids.join(),
            action_type : 0
        }).sendAs('nikon_modifyidea_pause');
        lib.idea.pauseIdea(ideaids, function(success) {
            if (success) {
                nirvana.aoPkgControl.logCenter.extend({
                    opttypeid : 302,
                    ideaid : ideaids.join(),
                    action_type : 1
                }).sendAs('nikon_modifyidea_pause');
                me.update();
            }
            else{
                nirvana.aoPkgControl.logCenter.extend({
                    opttypeid : 302,
                    ideaid : ideaids.join(),
                    action_type : -1
                }).sendAs('nikon_modifyidea_pause');
            }
        });     
    },

    deleteIdeas: function() {
        var me = this,
            btn = this.getContext('deleteBtn');
        if (btn.isDisable()) {
            return;
        }

        var ideaids = this.rows2Data(null, 'ideaid');
        
        // 监控
        nirvana.aoPkgControl.logCenter.extend({
            applycount : ideaids.length,
            opttypeid : 302,
            selectedids : ideaids.join(),
            action_type : 0
        }).sendAs('nikon_multiapply_idea_del');
        
        lib.idea.deleteIdea(ideaids, function(success) {
            if (success) {
                nirvana.aoPkgControl.logCenter.extend({
                    applycount : ideaids.length,
                    opttypeid : 302,
                    selectedids : ideaids.join(),
                    action_type : 1
                }).sendAs('nikon_multiapply_idea_del');
                me.update();
            }
            else{
                nirvana.aoPkgControl.logCenter.extend({
                    applycount : ideaids.length,
                    opttypeid : 302,
                    selectedids : ideaids.join(),
                    action_type : -1
                }).sendAs('nikon_multiapply_idea_del');
            }
        });  
    },
    switchShadow: function() {
        var subTable = this.getContext('subTable'),
            curRow = subTable.getRow(subTable.curRow),
            idea = this.rows2Data([subTable.curRow])[0];
        
        // 获得单元格
        var cells = $$('.ui_table_tdcell', curRow);
        cells.shift();

        lib.idea.switchShadow(idea, cells);
    }
});
