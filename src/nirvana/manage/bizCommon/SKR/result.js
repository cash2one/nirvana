/*
 * 推词结果模块
 * @param {object} options 参数对象，具体属性如下
 * {
 *     groupConfig 表格组数据格式配置，具体形式见代码中同名变量
 *     columnMap 表格列配置，具体形式见代码中同名变量
 *     minWidth 最小宽度值，用来计算各列宽度，具体形式见代码中同名变量
 * }
 */
nirvana.skrModules.Result = (function($) {

    var T = baidu,
        event = fc.event,
        Table = fc.ui.Table,
        Bubble = fc.ui.Bubble,
        Button = fc.ui.Button,
        Icon = fc.common.Icon,
        Factory = fc.common.Factory;

    function Result(options) {
        var me = this;
        me.activeColumns = activeColumns;
        me.groupConfig = groupConfig;
        me.columnMap = columnMap;
        me.minWidth = minWidth;
        T.object.extend(me, options);
        
        var columns = getColumns(me.activeColumns, $('#krRecommandResult')[0].clientWidth);
        me.table = new Table($('#krRecommandResult')[0], {
            columns: columns,
            group: me.groupConfig,
            keepContent: true
        });
		
		me.data = [];
		me.smart = {
		    flag: false,
		    data: []
		};
		me.filter = {
		    flag: false,
		    include: [],
		    exclude: []
		};

        this.addEvents();
    }

    Result.prototype = {
        /*
         * 渲染表格
         * @param {object} data
         * @param {object} options 具体如下
         * {
         *     {string} emptyTip  data为空时的提示文本
         *     {boolean} isHTML 提示文本是否为完整的html
         * } 
         */ 
        render: function(data, options) {
            var me = this;
            var table = me.table, config = table.config();
            config.emptyTip = options.isHTML ? options.emptyTip : Factory.createCenterAlign(options.emptyTip);
            
            var hasafterrender = false;
            //筛选后重新渲染时，需要保留原有的获取更多按钮
            if (me.smart.flag) {
                table.onafterrender = function(){
                    me.addSmartBtn();
                }
                hasafterrender = true;
            }
            if (!hasafterrender) {
                table.onafterrender = function(){}
            }
            
            if (me.filter.flag) {
                data = me.filterKeywordGroups(data, me.filter.include, true);
                data = me.filterKeywordGroups(data, me.filter.exclude, false);
            }
            
            table.render(data);
            
            // 改变数字
            event.fire(me, {
                type: nirvana.KRCore.EVENT_WORD_SIZE_CHANGE,
                size: me.getActiveKeywords().length
            });
        },
        appendSmartWords: function(data) {
            var me = this;
            var table = me.table, config = table.config();
            table.onafterrender = function(){};
            
            if (me.filter.flag) {
                data = me.filterKeywordGroups(data, me.filter.include, true);
                data = me.filterKeywordGroups(data, me.filter.exclude, false);
            }
            
            table.appendGroups(data);
            
            // 改变数字
            event.fire(me, {
                type: nirvana.KRCore.EVENT_WORD_SIZE_CHANGE,
                size: me.getActiveKeywords().length
            });
        },
        addEvents: function() {
            var table = this.table, tbody = table.tbody;
            event.on(tbody, '.word', 'click', addKeyword, this);
            event.on(tbody, '.fc_icon_add_keyword', 'click', addKeyword, this);
            event.on(tbody, '.fc_icon_del_keyword_new', 'click', delKeyword, this);
            event.on(tbody, '.fc_icon_restore', 'click', resKeyword, this);
        },
        // 改变关键词的状态，比如添词后，该行不会出现 添加 和 删除按钮；删除后，关键词列会出现删除线
        changeKeywordsStatus: function(words) {
            fc.each(words, function(word) {
                var elem = $('#' + word.randomID)[0];
                if (!elem) return;
                elem = fc.parent(elem, 'tr');

                fc.removeClass(elem, 'isAdd');
                fc.removeClass(elem, 'isDel');

                if (word.isAdd) {
                    fc.addClass(elem, 'isAdd');
                } else if (word.isDel) {
                    fc.addClass(elem, 'isDel');
                }
            });
            
            // 改变数字
            event.fire(this, {
                type: nirvana.KRCore.EVENT_WORD_SIZE_CHANGE,
                size: this.getActiveKeywords().length
            });
        },
        /*
         * 获取可用词字面的数组，去掉了添加了的和删除了的，主要用来批量添加以及获取现有可用词数目
         * @return {Array} 可用词字面组成的数组
         */
        getActiveKeywords: function() {
            var words= this.groups2Keywords(this.table.data);
            var ret = [];
            fc.each(words, function(item){
                if (!item.isAdd && !item.isDel) {
                    ret.push(item.word);
                }
            });
            return ret;
        },
        /*
         * 获得当前搜索结果中的所有词语项
         * @return {Array} 所有词语项组成的数组
         */
        getAllKeywords: function() {
            if (!this.data) return;
            return this.groups2Keywords(this.data);
        },
        /*
         * 将group 列表转成keyword 列表
         * @param {Array} groups 关键词分组数据
         * @return {Array}
         */
        groups2Keywords: function(groups) {
            var me = this;
            var ret = [];
            fc.each(groups, function(item) {
                fc.push(ret, item[me.groupConfig.data]);
            });
            return ret;
        },
        // 转成loading状态
        loading: function() {
            this.setTip(Icon.getIcon(Icon.LOADING) + '正在为您分析，请稍候...');
        },
        setTip: function(tip) {
            this.table.tbody.innerHTML = Factory.createCenterAlign(tip);
        },
        // 这个方法用来动态修改高度
        updateHeight: function(containerHeight) {
            var table = this.table, top = fc.offset(table.node, $('#kr')[0]).top,
                height = containerHeight - top -33 -3;//33是表头高度，3是底部padding
                
            fc.height(table.tbody, Math.max(200, height));
        },
        addSmartBtn: function() {
            var me = this;
            if (baidu.g('krSmartFail')) {
                baidu.dom.remove('krSmartFail');
            }
            var smartDiv = fc.create('<div id="krSmartRec"><div></div></div>');
            var tableBody = $('#krRecommandResult .table-tbody')[0];
            tableBody.appendChild(smartDiv);
            me.smartBtn = new Button(
                $('#krSmartRec')[0].firstChild, 
                {
                    text: '查看更多智能推词'
                }
            );
            me.smartBtn.onclick = function() {
                event.fire(me, {
                    type: nirvana.SKR.EVENT_GET_SMART
                });
            }
        },
        addFailNotice: function() {
            var me = this;
            var noticeDiv = fc.create('<div id="krSmartFail"><div class="nodata">没有得到新智能推词<div></div>');
            var tableBody = $('#krRecommandResult .table-tbody')[0];
            tableBody.appendChild(noticeDiv);
        },
        /*
         * 筛选关键词。从 groups 中选出符合 filters 要求的数据
         * @param {Array} groups 要筛选的group数组
         * @param {Array} filters 用作筛选的数组
         * @param {boolean} flag 标识  true包含还是false不包含
         * @return {Array} 筛选后的数组
         */ 
        filterKeywordGroups: function(groups, filters, flag) {
            var me = this;
            var ret = [];
            // 筛选符合条件的关键词
            fc.each(groups, function(group) {
                var arr = fc.grep(group[me.groupConfig.data], function(item) {
                    var re = true;
                    fc.each(filters, function(filter) {
                        function test(word, filter) {
                            if (word.indexOf(filter) < 0) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }
                        
                        if (flag) {
                            re = test(item.word, filter);
                        }
                        else {
                            re = !test(item.word, filter);
                        }
                        
                        if (!re) return false;
                    });
                    return re;
                });
                if (arr.length > 0) {
                    var temp = {};
                    temp[me.groupConfig.title] = group[me.groupConfig.title];
                    temp[me.groupConfig.data] = arr;
                    ret.push(temp);
                }
            });
            
            return ret;
        },
        //清除现有筛选规则
        clearFilter: function() {
            this.filter = {
                flag: false,
                include: [],
                exclude: []
            };
        },
        //清除现有智能词记录
        clearSmart: function() {
            this.smart = {
                flag: false,
                data: []
            };
        },
        dispose: function() {
            this.table.dispose();
        }
    };

    var TPL_WORD_BUTTONS = Icon.getIcon(Icon.SEARCH_MINI) + Icon.getIcon(Icon.GOLD_FINGER);

    var TPL_BUTTONS = ''
        + '<div class="inline_buttons">'
        +     Icon.getIcon(Icon.DEL_KEYWORD_NEW) + Icon.getIcon(Icon.RESTORE)
        + '</div>';

    /*
     * 因为有自定义列，而列的变化会影响列宽(列宽平分)，因此需要单独处理这部分
     * 列宽是个大问题，这里的解决办法是：先算出每列最小宽度，按顺序排就是 135 120 130
     * 然后给每列加权重，按顺序排就是 2 1 1
     * 因为可以确定最小总宽度是680px，所以大于 680 时，超出的宽度按权重进行分配
     */
    var minWidth = {
        total: 385,
        pv: 110,
        kwc: 130
    };
    var activeColumns = ['word', 'pv', 'kwc'];
    var columnMap = {
        word: {
            title: '关键词',
            content: function(item) {
                if (item.randomID == null) {
                    item.randomID = fc.random();
                }
                return '<div class="word_wrapper" id="' + item.randomID + '">'
                     +     '<span class="word" title="'+ item.word + '">' +fc.text(item.word) + '</span>'
                     + '</div>'
                     + TPL_BUTTONS;
            },
            rowClass: function(item) {
                if (item.isAdd) {
                    return 'isAdd';
                } else if (item.isDel) {
                    return 'isDel';
                }
            },
            field: 'word',
            sortable: true,
            style: { 'min-width': 160 }
        },
        pv: {
            title: '日均搜索量',
            content: lib.field.pageView('pv'),
            field: 'pv',
            sortable: true,
            bubble: 'column_pageview',
            type: 'number',
            style: {
                'text-align': 'center'
            }
        },
        kwc: {
            title: '竞争激烈程度',
            content: lib.field.percentGraph('kwc'),
            field: 'kwc',
            type: 'number',
            sortable: true,
            bubble: 'column_cmprate',
            style: {
                'text-align': 'right'
            }
        }
    };
    var groupConfig = {
        title: 'grouprsn',
        data: 'resultitem',
        foldable: true,
        defaultFolded: false
    };

    function addKeyword(e) {
        var tr = fc.parent(e.target, 'tr');
        if (fc.hasClass(tr, 'isAdd') || fc.hasClass(tr, 'isDel')) {
            return;
        }

        var group = this.table.getGroup(e.target).group,
            row = group.getRow(e.target).row, item = row.data;

        event.fire(this, {
            type: nirvana.KRCore.EVENT_ADD_KEYWORD,
            word: item.word
        });
    }

    function delKeyword(e) {
        var table = this.table, target = e.target, 
            group = table.getGroup(target).group,
            row = group.getRow(target).row,
            word = row.data, me = this;

        word.isDel = true;
        me.changeKeywordsStatus([word]);
    }
    
    function resKeyword(e) {
        var table = this.table, target = e.target, 
            group = table.getGroup(target).group,
            row = group.getRow(target).row,
            word = row.data, me = this;

        word.isDel = false;
        me.changeKeywordsStatus([word]);
    }

    /* 
     * 计算每列的宽度
     * @param {Array} columnNames 需要的列名称的数组
     * @param {number} 目前的总宽度 
     * @return {Array} 修改过的列配置
     */
    function getColumns(columnNames, totalWidth) {
        // 把多余的宽度分成 6 份（关键词列占 4/6）
        var columns = [], rest = Math.floor(Math.max(0, totalWidth - minWidth.total) / 6);
        for (var key in columnMap) {
            if (fc.grep(columnNames, function(item) { return item === key; }).length > 0) {
                if (key !== 'word') {
                    columnMap[key].style.width = minWidth[key] + rest;
                } else {
                    columnMap[key].style.width = null;
                }
                columns.push(columnMap[key]);
            }
        }
        return columns;
    }

    return Result;

})($$);
