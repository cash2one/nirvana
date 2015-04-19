/**
 * 远征三栏显示模块
 * 配置项如下：
 * {
 *   entry: '',                                     入口,
 *   planid: '',                                    计划ID，设置后，默认会选中该计划
 *   unitid: '',                                    单元ID，设置 planid 和 unitid 后，默认会选中该计划单元
 *   hideHeader: true,                              是否隐藏头部，如果不需要展开折叠功能，可以隐藏掉，默认显示
 *   hideMore: true,                                是否隐藏更多（右下角那个，包括kr入口链接），默认显示
 *   callback: function(keywordsText, keywordsObj), 推词请求返回后的回调
 *   onSuccess: function(json),                     关键词保存成功的回调
 *   onFail: function(error)                        关键词保存失败的回调
 * }
 *
 * 使用步骤如下：
 * var expe = new Expedition(node, { entry: '必须传入口' });
 * expe.load('query', 'regions');
 *
 * 远征一般被嵌入到一个模块中，作为搜索词的拓词出现
 */
fc.module.Expedition = function($) {

    var event = fc.event,
        Icon = fc.common.Icon,
        Unit = fc.common.Unit,
        Factory = fc.common.Factory,
        Keyword = fc.common.Keyword,
        KeywordError = fc.common.Error.KEYWORD.SAVE,
        Table = fc.ui.Table,
        PlanUnitSelector = fc.ui.PlanUnitSelector,
        monitor = fc.module.ExpeditionMonitor;

    function Expedition(node, config) {
        this._super(node, 'expedition', config);
        fc.addClass(this.node, Expedition.CSS_MODULE);

        if (config.hideHeader) {
            fc.hide($('.' + Expedition.CSS_HEADER, this.node)[0]);
        }
        if (config.hideMore) {
            fc.hide($('.' + Expedition.CSS_MORE, this.node)[0]);
        }
        // 默认是5，嵌入式远征为6
        if (config.querytype == null) {
            config.querytype = 5;
        }

        /**
         * 显示错误的元素
         * @property {HTMLElement} errorNode
         */
        this.errorNode = $('.' + Expedition.CSS_ERROR, this.node)[0];

        /**
         * 记录上次的请求参数
         * @property {Object} param
         */
        this.param = { };
               
        /**
         * 是否展开，默认为true
         * @property {Boolean} opened
         */
        this.opened = true;

        /**
         * 一般是三列，嵌入式远征只有一列，这里统一用 columns 保存 Table 组件
         * @property {Array} columns
         */
        this.columns = [];
        /**
         * 计划单元选择器
         * @property {PlanUnitSelector} selector
         */
        this.selector = new PlanUnitSelector($('.selector', this.node)[0], { planid: config.planid, unitid: config.unitid });

        addEvents.call(this);
    }

    Expedition.prototype = {
        
        /**
         * 请求远征数据
         * @method load
         * @param {String} query
         * @param {String} regions
         * @param {Number} device
         */
        load: function(query, regions, device) {
            regions = '' + regions;
            device = device || 0;
            // 无视重复请求相同的 query 和 regions
            if (this.param.query === query && 
                this.param.regions === regions && 
                this.param.device == device) return;

            // load() 表示刷新
            if (arguments.length >= 2) {
                if (regions.split(',').length === fc.common.Region.SIZE) {
                    regions = '0';
                }
                this.param.query = query;
                this.param.regions = regions;
                this.param.device = device;
            } else {
                query = this.param.query;
                regions = this.param.regions;
                device = this.param.device;
            }

            this.keywords = [];
            this.setSelectedSize(0);
            this.errorNode.innerHTML = '';

            var target = $('.' + Expedition.CSS_CONTENT, this.node)[0];
            target.innerHTML = Icon.getIcon(Icon.LOADING) + '正在为您分析，请稍候...';

            var queryNode = $('.' + Expedition.CSS_HEADER + ' > h1 em', this.node)[0];
            if (queryNode) {
                queryNode.innerHTML = query;
            }

            var me = this, config = this.config;

            monitor.request(config, query, regions);
            Keyword.recommend({
                query: query,
                entry: config.entry,
                regions: regions,
                device: device,
                querytype: config.querytype,
                onSuccess: function(json) {
                    me.show();
                    if (json.data.group.length > 0 && (me.keywords = Keyword.groups2Keywords(json.data.group)) && me.keywords.length > 0) {
                        keywordFactory = Factory.createKeywordIcons(json.data.attr);
                        // 折叠时，如果再次请求，生成的表格样式会有问题，所以要让他先显示出来
                        me.open();
                        me.render(me.keywords, query);
                    } else {
                        me.empty();
                    }
                    if (typeof config.callback === 'function') {
                        config.callback(fc.map(me.keywords, function(item) { return item.word; }), me.keywords);
                    }

                    // 这句监控要用。。。
                    config.logid = json.data.logid != null ? json.data.logid : -1;
                    monitor.requestCompleted(config, query, me.keywords.length, json.data.attr);           
                },
                onFail: function(json, errorCode) {
                    disposeTables.call(me);
                    me.hide();
                    if (typeof config.callback === 'function') {
                        config.callback([], []);
                    }
                    monitor.requestCompleted(config, query, me.keywords.length, json.data.attr, errorCode);    
                }
            });
        },

        /**
         * 渲染数据
         * @method render
         * @param {Array} keywords 提供给用户勾选的关键词
         * @param {String} query 搜索词
         */
        render: function(keywords, query) {
            disposeTables.call(this);
            fc.removeClass(this.node, Expedition.CSS_EMPTY);            

            var contentNode = $('.' + Expedition.CSS_CONTENT, this.node)[0],
                columns = contentNode.children;

            contentNode.innerHTML = '<div></div>';

            // 计算每列的数量，从左往右递减
            var total = keywords.length, size1, size2, size3;
            size1 = size2 = size3 = Math.floor(total / 3);
            if (total % 3) {
                size2 = Math.floor((total - size3) / 2);
                size1 = total - size2 - size3;
            }
            
            this.columns.push(createTable(columns[0], keywords.slice(0, size1)));
            if (size2 > 0) {
                this.columns.push(createTable(contentNode.appendChild(fc.create('div')), keywords.slice(size1, size1 + size2)));
                if (size3 > 0) {
                    this.columns.push(createTable(contentNode.appendChild(fc.create('div')), keywords.slice(size1 + size2)));
                }
            }
            // 给最后一个元素加一个class
            fc.addClass(columns[columns.length - 1], 'last');

            this.setSelectedSize(0);
        },

        /**
         * 设置已选中的数量，更新 footer 的 size / total 
         * @method setSelectedSize
         * @param {Number} size 选中数量
         */
        setSelectedSize: function(size) {
            var node = $('.' + Expedition.CSS_FOOTER + ' .value', this.node)[0];
            node.innerHTML = '<em>' + size + '</em> / ' + this.keywords.length;  
        },

        /**
         * 获得选中的关键词
         * @method getSelectedKeywords
         * @return {Array}
         */
        getSelectedKeywords: function() {
            var ret = [];
            fc.each(this.columns, function(col) {
                fc.push(ret, col.getSelectedData());
            })
            return ret;
        },

        /**
         * 收起
         * @method close
         * @param {Boolean} forever 是否永久收起
         */
        close: function(forever) {
            if (!this.opened) return;
            var node = $('.' + Expedition.CSS_TOGGLE, this.node)[0];      
            node.innerHTML = TEXT_OPEN;
            
            fc.addClass(this.node, Expedition.CSS_CLOSE);
            this.opened = false;
        },

        /**
         * 展开
         * @method open
         */
        open: function() {
            if (this.opened) return;
            var node = $('.' + Expedition.CSS_TOGGLE, this.node)[0];      
            node.innerHTML = TEXT_CLOSE;

            fc.removeClass(this.node, Expedition.CSS_CLOSE);
            this.opened = true;
        },

        /**
         * 数据为空时更新界面
         * @method empty
         */
        empty: function() {
            disposeTables.call(this);
            fc.addClass(this.node, Expedition.CSS_EMPTY);
            $('.' + Expedition.CSS_CONTENT, this.node)[0].innerHTML = TPL_EMPTY;
        },

        /**
         * 点击“关键词工具”触发
         * @event onkropen
         * @param {String} query 当前搜索词
         * @param {Array} keywords 当前勾选词
         */
        onkropen: null,
        
        dispose: function() {
            disposeTables.call(this);
            this.selector && this.selector.dispose();
            this._super();
        },

        getTpl: function() {
            return TPL;
        }
    };

    Expedition = fc.ui.extend(fc.module.Base, Expedition);

    Expedition.CSS_MODULE = 'module-expedition';
    // 数据为空
    Expedition.CSS_EMPTY = 'expedition-empty';
    Expedition.CSS_CLOSE = 'expedition-close';

    Expedition.CSS_HEADER = 'expedition-header';
    Expedition.CSS_CONTENT = 'expedition-content';
    Expedition.CSS_FOOTER = 'expedition-footer';

    Expedition.CSS_TOGGLE = 'expedition-toggle';

    Expedition.CSS_MORE = 'expedition-more';
    Expedition.CSS_TOKR = 'expedition-tokr';
    Expedition.CSS_ERROR = 'expedition-error';

    Expedition.CONFIG_TABLE = {
        selectable: true,
        buddy: 1,
        keepContent: true,
        columns: [
            { 
                field: 'word', 
                title: '关键词', 
                content: function(item) {
                    return keywordFactory(item);
                }
            },
            {
                field: 'pv',
                title: '日均搜索量',
                content: lib.field.pageView('pv'),
                sortable: true,
                type: 'number',
                style: {
                    width: 80,
                    'text-align': 'right'
                }
            }
        ]
    };

    //=================================================================================================================

    var keywordFactory;

    var TEXT_CLOSE = '[ - ] 收起',
        TEXT_OPEN = '[ + ] 展开';

    var TPL = '<div class="' + Expedition.CSS_HEADER + '">' +
                  '<span class="' + Expedition.CSS_TOGGLE + '">' + TEXT_CLOSE + '</span>' +
                  '<h1>与您查询的“<em></em>”相关的关键词：</h1>' +
              '</div>' +
              
              '<div class="'+ Expedition.CSS_CONTENT + '"></div>' +
              
              '<div class="' + Expedition.CSS_FOOTER + '">' +
                  '<span class="' + Expedition.CSS_MORE + '">更多结果请使用<em class="' + Expedition.CSS_TOKR + '">关键词工具</em></span>' +
                  '<div class="field">' +
                      '<span class="key">已选择：</span>' +
                      '<span class="value">0 / 0</span>' +
                  '</div>' +
                  '<div class="' +Expedition.CSS_ERROR + '"></div>' +
                  '<div class="selector"></div>' +
              '</div>',

        TPL_EMPTY = '暂无相关结果，若需获取更为丰富的推荐请使用<em class="' + Expedition.CSS_TOKR + '">关键词工具</em>';

    function disposeTables() {
        fc.each(this.columns, function(col) {
            col.dispose();
        })
        this.columns.length = 0;
    }

    function addEvents() {
        event.on(this.node, 'input[type="checkbox"]', 'click', clickCheckbox, this);
        event.on(this.node, '.' + Expedition.CSS_TOGGLE, 'click', toggle, this);
        event.on(this.node, '.' + Expedition.CSS_TOKR, 'click', clickKR, this);

        var me = this;
        this.selector.isSaveEnable = function() {
            return me.getSelectedKeywords().length > 0;
        };
        this.selector.onsave = function(type, plan, unit, callback) {
            var keywords = me.getSelectedKeywords();
            keywords = fc.map(keywords, function(item) { return item.word; });
            var param = {
                planid: plan.id,
                unitid: unit.id,
                pattern: type == -1 ? 0 : type,
                keywords: keywords,
                onSuccess: function(json) {
                    Unit.checkMinBid(plan.id, unit.id, json.data, function() {
                        if (typeof me.config.onSuccess === 'function') {
                            me.config.onSuccess(json);
                        }
                    });
                },
                onFail: function(json, errorMap) {
                    me.errorNode.innerHTML = KeywordError.getText(errorMap);
                    if (fc.isArray(json.data)) {
                        Unit.checkMinBid(plan.id, unit.id, json.data, function() {
                            if (typeof me.config.onFail === 'function') {
                                me.config.onFail(error);
                            }
                        });
                    }
                }
            };
            fc.common.Keyword.save(param);
            monitor.saveKeywords(me.config, keywords.length, type);
        };
    }
    
    function removeEvents() {
        event.un(this.node);
    }

    function createTable(node, keywords) {
        var table = new Table(node, Expedition.CONFIG_TABLE);
        table.render(keywords);
        return table;
    }
    
    function toggle() {
        this.opened ? this.close() : this.open();
    }

    function clickCheckbox() {
        var selected = this.getSelectedKeywords().length;
        this.setSelectedSize(selected);
        if (this.selector.status == 2) {
            this.selector.save.disable(selected === 0);
        }
    }

    function clickKR() {
        if (typeof this.onkropen === 'function') {
            monitor.openKR(this.config, this.param.query, this.keywords.length > 0);
            var keywords = this.getSelectedKeywords();
            keywords = fc.map(keywords, function(item) { return item.word; });
            this.onkropen(this.param.query, keywords);
        }
    }

    return Expedition;

}($$);
