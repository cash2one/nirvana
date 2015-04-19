/**
 * 搜索框
 * 虽然这是搜索模块，但触发搜索的行为统一放在 KR 模块处理
 * 理由是触发搜索行为不是单一的，有时需要考虑很多条件
 * 而这些条件靠单个模块无法全部获得，KR 则可以
 */
nirvana.krModules.Search = function($) {

    var config = nirvana.krConfig,
        event = fc.event,
        Keyword = fc.common.Keyword,
        Suggestion = fc.ui.Suggestion,
        util = nirvana.krUtil;

    // suggest 需要入口信息，这里就不发给主模块处理了，依赖这一个条件，传进来得了
    function Search(entry) {
        this.entry = entry;
        // 搜索按钮
        this.searchBtn = $('#krSearchBtn')[0];

        initUI.call(this);
        addEvents.call(this);
    }

    Search.prototype = {

        value: function(value) {
            return this.sug.value(value);
        },

        dispose: function() {
            removeEvents.call(this);
            this.sug.dispose();
            delete this.searchBtn;
            delete this.sug;
        }
    };

    var CSS_ACTIVE = 'active',
        CSS_SEEDURL = 'seed_url'; // 用来显示 suggestion 展开列表的 header
    
    function initUI() {
        var me = this;
        this.sug = new Suggestion($('#krSearchInput')[0], {
            id: 'krSuggestion',
            request: function(callback) {
                Keyword.suggest({
                    query: me.value(),
                    entry: me.entry,
                    onSuccess: function(data) {
                        callback(data);
                    }
                });
            },
            onsubmit: function(value) {
                var seedType, suggestionType;
                if (typeof value !== 'string') {
                    event.fire(me, {
                        type: nirvana.KR.EVENT_SUGGESTION_MONITOR,
                        wordid: value.id,
                        lineNum: value.index + 1 // 因为索引是从0开始的，行号则从1开始
                    });
                    value = value.text;
                    if (util.isURL(value)) {
                        seedType = 1;
                    } else {
                        suggestionType = 0;
                    }
                }
                event.fire(me, {
                    type: nirvana.KR.EVENT_SEARCH,
                    query: value,
                    seedType: seedType,
                    suggestionType: suggestionType
                });
            }
        });
    }

    function addEvents() {
        event.click(this.searchBtn, clickSearchBtn, this);

        var me = this;
        this.sug.onfocus = function(value) {
            if (me.clickOnSearchBtn) {
                delete me.clickOnSearchBtn;
            }
            changeValue.call(me, value);
            fc.addClass(me.searchBtn, CSS_ACTIVE);
        };

        this.sug.onchange = function(value) {
            p(111)
            changeValue.call(me, value);
        };

        this.sug.onblur = function(value) {
            // 如果点击在搜索按钮上，不算失焦
            if (me.clickOnSearchBtn) {
                delete me.clickOnSearchBtn;
                return;
            }
            if (value === '') {
                event.fire(me, nirvana.KR.EVENT_SEED_STARTPLAY);
            }
            fc.removeClass(me.searchBtn, CSS_ACTIVE);
        };
    }

    function removeEvents() {
        event.un(this.searchBtn, 'click', clickSearchBtn);
    }

    function clickSearchBtn() {
        var query = this.value();
        if (!query) {
            // 为 suggestion 组件的 onblur 设置一个标识
            this.clickOnSearchBtn = true;

            query = this.sug.placeholder();
            if (query === config.TEXT_DEFAULT_SEEDWORD || 
                query === config.TEXT_DEFAULT_SEEDURL || 
                query === config.TEXT_INPUT_PLACEHOLDER) {
                this.sug.value('');
                this.sug.focus();
                return;
            }
        }
        event.fire(this, {
            type: nirvana.KR.EVENT_SEARCH,
            query: query,
            seedType: 2 // 监控中用于判断是否是种子词或种子url
        });
    }

    function changeValue(value) {
        if (KR_DEFAULT_INPUT_MESSAGE === trim(value)) {
            this.sug.value('');
        }
        if (this.sug.value() === '') {
            fc.addClass(this.sug.node, CSS_SEEDURL);
            event.fire(this, nirvana.KR.EVENT_OPEN_SEED_LAYER);
        } else {
            fc.removeClass(this.sug.node, CSS_SEEDURL);
        }
    }

    return Search;

}($$);
