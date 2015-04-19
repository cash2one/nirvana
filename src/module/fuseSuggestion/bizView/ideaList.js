/**
 * @file src/module/fuseSuggestion/bizView/ideaList.js 业务通用模块之idea列表界面
    不想写在这里…… 但是现在还不能动现有代码…… so……
    使用bizCommon的通用方法，让其自动调用
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

nirvana.bizView = nirvana.bizView || {};

nirvana.bizView.ideaList = (function() {
    // @requires 输入

    // sizzle => $$
    // tangram => baidu
    // er => er
    // manage => manage
    // ui1.0 => ui

    // nirvana.bizCommon => bizCommon
    var bizCommon = nirvana.bizCommon;
    // var ideaCommon = nirvana.bizCommon.idea;
    var util = nirvana.util;
    // lib.tpl => lib.tpl

    var bizView = nirvana.bizView; // a short namespace

    // 定义输出
    var exports = {};


    // 默认LIST配置
    var DEFAULT_OPTION = {
        // 数据相关的
        data: {},

        // 自定义行为
        custom: {

            // 基础配置,
            tpl: 'bizViewIdeaList',  // 只要模板名就行了

            fields: ['idea', 'status'], // 表格View的fields

            // has表示是否有，一般指功能
            hasMultiAction: true,
            // call bizView.idea.multi[Action]
            multiAction: ['active', 'enable', 'delete'],
            hasPager: true,
            pagesize: 3,

            // is表示是否是，指状态、行为
            isNoRequest: false // 是否使用灌入数据而不请求
        },

        // DIALOG的相关配置
        dialog: {
            id: 'ideaViewListDlg',
            title: '创意列表',
            // skin: "modeless", // 可以指定skin
            dragable: true,
            needMask: true,
            unresize: true,
            maskLevel: 1, // 打开时计算
            width: 980,
            height: 544,
            ok_button: true, // 确定按钮?
            ok_button_lang: '关闭',
            cancel_button: false  // 取消按钮?
        },

        // 条件
        condition: {}
    };

    var DEFAULT = {
        btn: {
            lang: {
                'active': '激活',
                'enable': '启用',
                'delete': '删除'
            },
            action: {
                'active': 'idea.active',
                'enable': 'idea.enable',
                'delete': 'idea.delete'
            }
        }
    };

    /**
     * 创意列表基类
     * @constructor
     * @param {Object} options 配置，格式看DEFAULT_OPTION
     */
    exports = IdeaListView = function(options) {
        // 默认
        this._options = baidu.object.clone(DEFAULT_OPTION);
        // 扩展
        util.deepExtend(this._options, options);
        // dialog的配置
        this._dlgopts = this._options.dialog; // 别名而已
        // 容错
        this.data = this._options.data || {}; // 数据会保存至此，也同时支持灌入数据

        this.pageNo = 1;
    };

    IdeaListView.prototype = {

        /** @lends IdeaListView.prototype */

        /**
         * 展现界面
         * @return {IdeaListView}
         */
        show: function() {
            var self = this;
            // 如果之前没展现过，新建一个
            if(!self.dialog) {
                // 这时才去计算模板的level
                self._dlgopts.maskLevel = nirvana.aoPkgWidgetCommon.getMaskLevel();
                self._dlgopts.onclose = function() {
                    self.dispose();
                    if(self.isModified) {
                        if(baidu.lang.isFunction(self._options.onSave)) {
                            self._options.onSave();
                        }
                        er.controller.fireMain('reload');
                    }
                };
                self._dlgopts.onok = function() {
                    this.close();
                };
                self.dialog = ui.Dialog.factory.create(self._dlgopts);
            }
            else {
                // 已经有了，那么重置状态，含事件注销
                self.clear();
            }
            // 初始化
            self._init();

            return self;
        },

        /**
         * 初始化界面
         * @private
         */
        _init: function() {
            var self = this;

            if(!self.dialog) {
                return;
            }

            self.setContent();

        },

        clear: function() {
            var self = this;
            self.dialog.setContent('');
        },

        /**
         * 设置对话框的body内容
         * @param {string=} html 可选参数
                string为html，不传则使用当前数据
         */
        setContent: function(html) {
            var self = this;
            if(!self.dialog) {
                return;
            }

            var contentHtml = '';
            if('undefined' == typeof html) {
                // 灌入模板
                contentHtml = er.template.get(self._options.custom.tpl);
                self.dialog.setContent(contentHtml);

                // init ui
                self._ui = ui.util.init(self.dialog.getDOM());

                self.initCustomUIs();
                self.initTableData();

                // 然后就要立刻bind，注意不要重复绑定
                self._bindHandlers();
            }
            else {
                contentHtml = html;
            }
        },

        initCustomUIs: function() {
            var self = this;
            var i, l, key;
            var uiId;
            var custom = self._options.custom;
            var cont;
            var header = $$('.bizview-idealist-header', self.dialog.getDOM())[0];

            if(custom.hasMultiAction) {
                // 'active', 'run', 'delete'
                for(i = 0, l = custom.multiAction.length; i < l; i++) {
                    key = custom.multiAction[i];
                    uiId = key + 'MultiBtn';
                    cont = document.createElement('div');
                    header.appendChild(cont);

                    self._ui[uiId] = ui.util.create(
                        'Button', {
                            'id': uiId,
                            'content': DEFAULT.btn.lang[key],
                            'onclick': self.getMultiActHandler(key)
                        },
                        cont
                    );
                    self._ui[uiId].disable(true);
                }
            }
        },

        /**
         * 更新并修改当前的按钮状态
         */
        changeButtonState: function() {
            var self = this;
            var table = self._ui['bizViewIdeaListTable'];
            var selectedIndex = table.selectedIndex;
            var selectedData = rowToData(selectedIndex, table.datasource);

            var ideaLib = lib.idea,
                activeDisable = ideaLib.disableActive(selectedData),
                enableDisable = ideaLib.disableEnable(selectedData),
                deleteDisable = ideaLib.disableDelete(selectedData);

            var activeBtn = self._ui['activeMultiBtn'];
            var enableBtn = self._ui['enableMultiBtn'];
            var deleteBtn = self._ui['deleteMultiBtn'];
            activeBtn.disable(activeDisable);
            enableBtn.disable(enableDisable);
            deleteBtn.disable(deleteDisable);

            // 读写分离，待升级之后不用这种方式了
            // by Leo Wang
            nirvana.acc.accService.processEntrances('fuseSuggestion/detail/ideaList');
        },

        _getBizViewParams: function() {
            var self = this;
            var params = {
                data: null,
                custom: {},
                dialog: {
                    maskLevel: nirvana.aoPkgWidgetCommon.getMaskLevel()
                },
                condition: {},
                onSave: function() {
                    self.isModified = true;
                    self.initTableData();
                },
                onCancel: function() {
                }
            };

            return params;
        },

        getMultiActHandler: function(command) {
            var self = this;
            command = command || '';

            return function() {
                var table = self.table;
                var selectedIndex = table.selectedIndex;
                var selectedData = rowToData(selectedIndex, table.datasource);
                var ids = [];
                for(var key in selectedData) {
                    ids.push(selectedData[key].ideaid);
                }

                var params = self._getBizViewParams();
                params.condition.ideaid = ids;

                var func = bizView.idea[command];
                if(func) {
                    func(params);
                }
                else {
                    util.logError('no valid method for multi act'
                        + ' [idea.' + command + ']'
                    );
                }
            };
        },


        /**
         * 初始化Dialog的具体信息
         */
        initTableData: function() {
            var self = this;
            // 是否需要请求数据？
            if(self._options.custom.isNoRequest) {
                self.setTableData();
            }
            else {
                bizCommon.idea.getList({
                    condition: self._options.condition,
                    onSuccess: function(response) { // 成功回调处理
                        if(response || response.data) {
                            self.data = response.data.listData;
                        }
                        self.setTableData();
                    },
                    onFail: function() { // 失败回调处理
                        ajaxFailDialog();
                    },
                    timeout: 5000, // 超时时间，单位ms
                    onTimeout: function() { // 超时回调处理
                        ajaxFailDialog();
                    }
                });
            }
        },

        /**
         * 初始化表格数据
         * @private
         */
        setTableData: function() {
            var self = this;

            // 总页数
            var pageSize = self._options.custom.pagesize;
            var totalPage = Math.ceil(self.data.length / pageSize);
            self.pageNo = self.pageNo || 1;

            var tabledata = getPageData(self.data, self.pageNo, pageSize);

            var tablecontainer = baidu.g('idealist-table-container');

            var table = self._ui['bizViewIdeaListTable'];
            if(!table) {
                table = ui.util.create(
                    'Table',
                    {
                        id : 'bizViewIdeaListTable',
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
                                    return '<div class="idea_update_state" id="ideastat_update_' + item.ideaid + '">'
                                        +        buildIdeaStat(item)
                                        +  '</div>';
//                                    return lib.idea.getIdeaState(item);
                                },
                                width: 100
                            }
                        ],
                        datasource : tabledata,
                        noDataHtml : FILL_HTML.NO_DATA,
                        select : "multi",
                        noScroll: true
                    },
                    tablecontainer
                );
                table.onselect = self.getTableSelectHandler();
                self._ui['bizViewIdeaListTable'] = table;
                self.table = table;
            }
            else {
                table.datasource = tabledata;
            }

            table.render();

            // 需要分页
            var pager = self._ui['bizViewIdeaListPager'];
            if(!pager) {
                var pagerContainer = baidu.g('idealist-pager-container');

                if (self.data.length > pageSize) {
                    pager = ui.util.create('Page',
                        {
                            id : 'bizViewIdeaListPager',
                            total : totalPage,
                            page : self.pageNo
                        },
                        pagerContainer
                    );
                    pager.onselect = self.getPageClickHandler();
                    self._ui['bizViewIdeaListPager'] = pager;
                }
                else {
                    pagerContainer.innerHTML = '';
                }
            }
            else {
                pager.select(self.pageNo - 1);
            }
        },

        /**
         * 获取ui.Table控件的选择事件处理函数
         */
        getTableSelectHandler: function() {
            var self = this;

            return function() {
                // 按钮状态
                self.changeButtonState();
            };
        },

        /**
         * 获取翻页控件点击事件处理函数
         */
        getPageClickHandler: function() {
            var self = this;

            return function(newPage) {
                self.pageNo = +newPage;
                self.refreshView();
            };
        },

        refreshView: function() {
            var self = this;
            // 总页数
            var pageSize = self._options.custom.pagesize;
            var tabledata = getPageData(self.data, self.pageNo, pageSize);
            if(self._ui['bizViewIdeaListTable']) {
                self._ui['bizViewIdeaListTable'].datasource = tabledata;
                self._ui['bizViewIdeaListTable'].render();
            }
            // 按钮状态
            self.changeButtonState();
        },

        /**
         * 事件绑定
         * @private
         */
        _bindHandlers: function() {
            var self = this;
            self.dialog.getBody().onclick = function(e) {
                e = e || window.event;
                var target = e.target || e.srcElement;

                var act = baidu.dom.getAttr(target, 'act');
                if(act) {
                    switch(act) {
                        case 'switchShadow':
                            var table = self._ui['bizViewIdeaListTable'],
                                curRow = table.getRow(table.curRow),
                                idea = table.datasource[table.curRow];

                            // 获得单元格
                            var cells = $$('.ui_table_tdcell', curRow);
                            cells.shift();

                            lib.idea.switchShadow(idea, cells);
                            break;
                        default:
                            self.doInlineAction(act)(getCurrLineData(target));
                    }
                }
            };

            // var closeBtn = self._ui['idealistClose'];
            // closeBtn.onclick = function() {
            //     self.dialog.close();
            // };
        },

        /**
         * 执行行内动作
         * @param {string} command 动作命令
         */
        doInlineAction: function(command) {
            var self = this;
            command = command || '';

            return function(data) {
                var params = self._getBizViewParams();
                params.data = data;
                var func;

                switch(command) {
                    case 'editIdea':
                        params.condition.ideaid = [data.ideaid];
                        func = bizView.idea.modify;
                        break;
                    case 'enableIdea':
                        params.condition.ideaid = [data.ideaid];
                        func = bizView.idea.enable;
                        break;
                    case 'pauseIdea':
                        params.condition.ideaid = [data.ideaid];
                        func = bizView.idea.pause;
                        break;
                }

                if(func) {
                    func(params);
                }
            };
        },

        /**
         * 自销毁
         */
        dispose: function() {
            var self = this;
            var k;
            for(k in self._ui) {
                if(self._ui.hasOwnProperty(k)) {
                    self._ui[k].dispose();
                }
            }
            self.dialog.dispose();
        }
    };

    /**
     * 获得当前页的数据
     * @private
     *
     * @param {Array} datasource 数据源
     * @param {number} pageNo 当前页数
     * @param {number} pageSize 每页数据条数
     */
    function getPageData(datasource, pageNo, pageSize) {
        var startIndex = (pageNo - 1) * pageSize,
            endIndex = Math.min(startIndex + pageSize, datasource.length);

        return datasource.slice(startIndex, endIndex);
    }

    /**
     * 根据某个ui.Table中的某个HtmlElement，获取改行的数据
     * @private
     *
     * @param {HtmlElement} target
     */
    function getCurrLineData(target) {
        if(!target) {
            return;
        }
        var parent = target.parentNode;
        var row = -1;
        var table;
        // var col = -1;
        // 寻找当前行索引
        while(parent && !baidu.dom.hasClass(parent, 'ui_table')) {
            if(parent.tagName.toLowerCase() == 'td'
                && baidu.dom.hasAttr(parent, 'row')) {
                row = baidu.dom.getAttr(parent, 'row');
                table = ui.util.get(baidu.dom.getAttr(parent, 'control'));
                break;
            }
            parent = parent.parentNode;
        }
        // 继续寻找当前的ui_Table

        if(row > -1 && table) {
            return table.datasource[row];
        }
        else {
            util.logError('no valid row or table found'
                + ' when trying to get ui.Table\'s line data.'
            );
        }
    }

    /**
     * 根据索引值，返回对应索引的数据数组
     * @private
     *
     * @param {Array} indexes 索引数组
     * @param {Array} datasource 数据源
     */
    function rowToData(indexes, datasource) {
        var result = [];
        if(indexes && indexes.length > 0) {
            var i = 0, l = indexes.length;
            for(; i < l; i++) {
                result.push(datasource[indexes[i]]);
            }
        }
        return result;
    }

    exports = IdeaListView;
    return exports;

})();