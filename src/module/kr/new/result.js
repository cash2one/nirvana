/**
 * 推荐结果（表格数据）
 * 
 * 这部分最复杂的是需要记录每个词的状态
 * 比如加到添词输入框里的需要置灰
 * 扔进回收站里的需要横线划掉
 * 如果从添词输入框删除了某个词，需要还原
 * @author zhujialu
 * @update 2012/8/21
 */
nirvana.krModules.Result = function($) {

    var event = fc.event,
        util = nirvana.krUtil,
        Table = fc.ui.Table,
        Bubble = fc.ui.Bubble,
        Icon = fc.common.Icon,
        ShowReason = fc.common.ShowReason,
        Keyword = fc.common.Keyword,
        Factory = fc.common.Factory,
        RecycleConfig = fc.module.RecycleConfig;        

    function Result() {
        // 当前业务点的数据
        this.businessPointData = null;
        this.businessFlag = 0;

        this.logParam = {
            columns: ['word', 'total_weight', 'pv', 'kwc'],
            sortType: 'default',
            sortOrder: 'default'
        };

        var columns = getColumns(this.logParam.columns, $('#krRecommandResult')[0].clientWidth);
        this.table = new Table($('#krRecommandResult')[0], { columns: columns, group: group, keepContent: true });
        // 点击业务点会出现这个底栏
        this.bottomBar = new BottomBar(this.table);

        addEvents.call(this);
    }

    Result.prototype = {
        // 渲染表格，后两个参数可以设置 data 为空时的提示文本
        render: function(data, emptyTip, isHTML) {
            this.bottomBar.remove();
            // 统计每个分组的关键词数量
            util.formatGroupTitle(data);

            var table = this.table, config = table.config();
            config.emptyTip = isHTML ? emptyTip : Factory.createCenterAlign(emptyTip);

            // 这里只做个记号，便于业务点进行判断当前表格是否已经创建完成
            table.onafterrender = function() {
                var elem = $('.business_point', table.tbody)[0];
                if (elem) {
                    new Bubble($('span', elem)[0], { source: 'business_point' });
                }
                table.onafterrender = null;
            };
            table.render(data);
            
            // 改变数字
            var size = this.getKeywords().length;
            event.fire(this, {
                type: nirvana.KR.EVENT_WORD_SIZE_CHANGE,
                size: size
            });
            
            // 重置一下
            this.logParam.sortType = 'default';
            this.logParam.sortOrder = 'default';
        },
        
        // 获得当前表格正在展现的关键词
        getKeywords: function() {
            if (!this.table.data) return;
            return Keyword.groups2Keywords(this.table.data); 
        },

        // 转成loading状态
        loading: function() {
            this.setTip(Icon.getIcon(Icon.LOADING) + '正在为您分析，请稍候...');
            this.bottomBar.remove();
            this.businessPointData = null;
        },

        setTip: function(tip) {
            this.table.tbody.innerHTML = Factory.createCenterAlign(tip);
        },

        // 返回的关键词还需要经过当前筛选项的过滤。。。。所以有了callback，他会返回一组关键词
        setBusinessPoint: function(param, callback) {    
            var me = this, table = this.table, flag = ++this.businessFlag;
            param.onSuccess = function(json) {
                var groups = json.data.group;
                if (flag !== me.businessFlag || groups.length === 0) return;
                // KR 升级只支持一项
                groups.length = 1;

                if (table.onafterrender) { // 如果 render 还在进行中
                    table.onafterrender = createBusinessPoint;
                } else {
                    createBusinessPoint();
                } 

                function createBusinessPoint(interrupt) {
                    if (interrupt) return;
                    me.businessPointData = groups;
                    // 过滤一遍。。。这个需求太2了。。。。
                    groups = callback(groups);
                    if (!groups.length || !groups[0].resultitem.length) return;
                    util.formatGroupTitle(groups);                        

                    table.onafterrender = function(interrupt) {
                        if (interrupt) return;

                        var elem = $('.business_point', table.tbody)[0];
                        // 默认展开
                        var groupObj = table.getGroup(elem);
                        groupObj.group.open(groupObj.node);

                        var top = me.bottomBar.getBusinessPointTop();
                        if (top >= table.tbody.offsetHeight) {
                            me.bottomBar.add(param.businessPoint, groups[0].resultitem.length);
                        }
                        new Bubble($('span', elem)[0], { source: 'business_point' });
                    };
                    table.appendGroups(groups);

                    // 通知修改 "添加全部"，"下载全部关键词" 按钮 显示的数量
                    event.fire(me, {
                        type: nirvana.KR.EVENT_WORD_SIZE_CHANGE,
                        size: me.getKeywords().length
                    });
                };
            };
            Keyword.businessPoint(param);
        },

        // 自定义列
        changeColumn: function(columnNames) {
            var table = this.table;

            table.config().columns = getColumns(columnNames, table.width());
            table.reset();
            table.render();

            this.logParam.columns = columnNames;
        },

        // 改变关键词的状态，比如添词后，该行不会出现 添加 和 删除按钮
        // 比如删除后，关键词列会出现删除线
        changeKeywordsStatus: function(words) {
            fc.each(words, function(word) {
                var elem = $('#' + word.randomID)[0];
                if (!elem) return;
                elem = fc.parent(elem, 'tr');

                fc.removeClass(elem, 'isAdd');
                fc.removeClass(elem, 'isDel');
                fc.removeClass(elem, 'goldFinger');

                if (word.goldFinger) {
                    fc.addClass(elem, 'goldFinger');
                    delete word.goldFinger;
                }

                if (word.isAdd) {
                    fc.addClass(elem, 'isAdd');
                } else if (word.isDel) {
                    fc.addClass(elem, 'isDel');
                }
            });
        },
        
        /**
         * 下载关键词
         */
        download: function(fileType) {
            fileType = fileType === 'txt' ? 1 : 2;

            var keywords = [], header = '关键词字面,日均搜索量,展现理由',
                list = this.getKeywords();

            fc.each(list, function(item) {
                var icons = fc.grep(item._attr, function(attr) { return attr.field === ShowReason.TEXT; });
                icons = fc.map(icons, function(icon) { return icon.text });
                keywords.push(item.word + '<' + item.pv + '<' + icons.join(','));
            });
            fc.ui.DownloadButton.downloadKeyword(keywords, fileType, header, 1);
        },

        // 这个方法用来动态修改高度
        // 因为推荐结果部分需要底部对齐，而表格组件是根据内容决定高度的
        // 这里需要强行拉高
        updateHeight: function(containerHeight) {
            var table = this.table, top = fc.offset(table.node).top + 33,
                height = containerHeight - top - 14; // 14 是找了一个不会出现滚动条的数字，没有别的意义
            // 最低220px
            fc.height(table.tbody, Math.max(200, height));
        },

        dispose: function() {
            this.table.dispose();
            this.bottomBar && this.bottomBar.dispose();
        }
    };

    var TPL_WORD_BUTTONS = Icon.getIcon(Icon.SEARCH_MINI) + Icon.getIcon(Icon.GOLD_FINGER),

        TPL_BUTTONS = '<div class="inline_buttons">' +
                        Icon.getIcon(Icon.ADD_KEYWORD) + Icon.getIcon(Icon.DEL_KEYWORD)
                      '</div>',

        TPL_BOTTOM_BAR = '<div class="business_point_words background_color_ease">' +
                             '<label class="name"></label> 业务点下的其他词 ( <label></label> ) <span></span>' +
                         '</div>',

        // 删除后的提示
        TPL_DELTIP = '<div class="del_tip">该词已移除，如需恢复，可以从右上角的 ' +
                     '<span class="' + RecycleConfig.CSS_RECYCLE_DIALOG_BUTTON + '">回收站</span> 中还原。';

    // 因为有自定义列，而列的变化会影响列宽(列宽平分)，因此需要单独处理这部分
    // 列宽是个大问题，这里的解决办法是：先算出每列最小宽度，按顺序排就是 135 175 120 130 120
    // 然后给每列加权重，按顺序排就是 2 1 1 1 1
    // 因为可以确定最小总宽度是680px，所以大于 680 时，超出的宽度按权重进行分配
    var minWidth = {
        total: 670,
        total_weight: 155,
        pv: 110,
        kwc: 130,
        pv_trend_month: 120
    },
    columnMap = {
        word: {
            title: '关键词',
            content: function(item) {
                if (item.randomID == null) {
                    item.randomID = fc.random();
                }
                return '<div class="word_wrapper" id="' + item.randomID + '">' +
                    '<span class="word" title="'+ item.word + '">' +fc.text(item.word) + '</span>' + TPL_WORD_BUTTONS +
                       '</div>';
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
        total_weight: {
            title: '展现理由',
            content: function(item) {
                var html = '', attr = [];
                fc.each(item._attr, function(item) {
                    if (item.field === ShowReason.TEXT) {
                        html += ShowReason.getIcon(item.text);
                    }
                });
                return html + TPL_BUTTONS;
            },
            field: 'total_weight',
            type: 'number',
            sortable: true,
            style: {}
        },
        pv: {
            title: '日均搜索量',
            content: lib.field.pageView('pv'),
            field: 'pv',
            sortable: true,
            bubble: 'column_pageview',
            type: 'number',
            style: {
                'text-align': 'right'
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
        },
        pv_trend_month: {
            title: '搜索量最高月份',
            content: function(item) {
                var d = Math.ceil(item.pv_trend_month);
                if (d === 0) {
                    return '-';
                } else if (d === 13) { //显示当前月
                    return baidu.date.format(new Date(), 'M') + '月';
                } else {
                    return d + '月';
                }
            },
            field: 'pv_trend_month',
            type: 'number',
            sortable: true,
            style: {
                'text-align': 'right'
            }
        }
    },
    group = {
        title: 'grouprsn',
        data: 'resultitem',
        foldable: true,
        defaultFolded: true,
        showSize: 3
    };
    
    // 这个方法很重要，主要用来算每列的宽度
    function getColumns(columnNames, totalWidth) {
        // 把多余的宽度分成 6 份（关键词列占 2/6）
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

    function addEvents() {
        var table = this.table, tbody = table.tbody, logParam = this.logParam;
        event.on(tbody, '.word', 'click', addKeyword, this);
        event.on(tbody, '.seed_word', 'click', searchSeedword, this);
        event.on(tbody, '.fc_icon_search_mini', 'click', searchKeyword, this);
        event.on(tbody, '.fc_icon_add_keyword', 'click', addKeyword, this);
        event.on(tbody, '.fc_icon_del_keyword', 'click', delKeyword, this);

        table.onsort = function(field, type) {
            logParam.sortType = field;
            logParam.sortOrder = type;
        };
    }

    function searchKeyword(e) {
        var group = this.table.getGroup(e.target).group,
            data = group.getRow(e.target).row.data;

        event.fire(this, {
            type: nirvana.KR.EVENT_SEARCH,
            query: data.word,
            isResearch: true // 监控
        });
    }

    function searchSeedword(e) {
        event.fire(this, {
            type: nirvana.KR.EVENT_SEARCH,
            query: e.target.innerHTML,
            seed: 'word', // 监控
            seedType: 4   // 监控
        });
    }

    function addKeyword(e) {
        var tr = fc.parent(e.target, 'tr');
        if (fc.hasClass(tr, 'isAdd') || fc.hasClass(tr, 'isDel')) {
            return;
        }

        var group = this.table.getGroup(e.target).group,
            row = group.getRow(e.target).row, word = row.data;

        if (fc.hasClass(e.target, 'fc_icon_add_keyword')) {
            word.goldFinger = true;
        }

        var reasons = fc.grep(word._attr, function(item) { return item.field === ShowReason.TEXT; });
        reasons = fc.map(reasons, function(item) { return item.text; });

        event.fire(this, {
            type: nirvana.KR.EVENT_ADD_KEYWORD,
            word: word,
            goldFinger: word.goldFinger, // 监控
            type1Reason: group.title,    // 监控
            wordSeq: row.index,          // 监控
            attrList: word._attr,        // 监控
            recReason: reasons           // 监控
        });
    }

    function delKeyword(e) {
        var table = this.table, target = e.target, 
            group = table.getGroup(target).group,
            row = group.getRow(target).row,
            word = row.data, me = this;

        event.fire(this, {
            type: nirvana.KR.EVENT_DEL_KEYWORD,
            word: word,
            wordSeq: row.index, // 监控
            callback: function(json) {
                word.isDel = true;
                me.changeKeywordsStatus([word]);

                var cell = table.getCell(target).node,
                    tip = fc.create(TPL_DELTIP);

                cell.appendChild(tip);
            
                // 淡入淡出
                baidu.fx.fadeIn(tip, {
                    onafterfinish: function() {
                        setTimeout(function() {
                            if (fc.contains(table.tbody, tip)) {
                                baidu.fx.fadeOut(tip, {
                                    onafterfinish: function() {
                                        cell.removeChild(tip);
                                    }
                                });
                            }
                        }, RecycleConfig.TIP_TIME);
                    }
                });
            }
        });
    }

    // 底部栏，对外依赖表格组件
    function BottomBar(table) {
        this.table = table;
        this.node = fc.create(TPL_BOTTOM_BAR);
        this.bubble = new Bubble($('span', this.node)[0], { source: 'business_point' });
        event.click(this.node, this.onclick, this);
    }

    BottomBar.prototype = {

        setInfo: function(name, size) {
            var elems = $('label', this.node);
            elems[0].innerHTML = '“' + name + '”';
            elems[1].innerHTML = size || 0;
        },

        getBusinessPointTop: function() {
            var tbody = this.table.tbody, elem = $('.business_point', tbody)[0];
            return fc.offset(elem, tbody).top;                 
        },

        onclick: function() {
            this.remove();
            var tbody = this.table.tbody;
            tbody.scrollTop = this.getBusinessPointTop() - tbody.offsetHeight / 2 + 30 / 2;
        },

        // 加入 DOM
        add: function(name, size) {
            this.setInfo(name, size);
            this.table._private.wrapper.appendChild(this.node);
            // 加入底栏肯定是因为已经存在业务点了
            var me = this, tbody = this.table.tbody, top = this.getBusinessPointTop();
            event.scroll(tbody, function() {
                if (top < tbody.scrollTop + tbody.offsetHeight - 30) { // 30 是底栏的高度
                    me.remove();
                }
            });
        },

        // 从 DOM 中移除
        remove: function() {
            var elem = this.table._private.wrapper;
            if (this.node.parentNode === elem) {
                event.un(this.table.tbody, 'scroll');
                elem.removeChild(this.node);
            }
        },

        dispose: function() {
            this.bubble.dispose();
            event.un(this.node);
        }
    };

    return Result;

}($$);
