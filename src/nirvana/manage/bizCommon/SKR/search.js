/**
 * 搜索模块 
 * 主要功能：监听搜索动作（包括focus时的回车），focus时改变搜索按钮样式
 * 定制：suggestion
 * 
 */
nirvana.skrModules.Search = (function($) {

    var config = nirvana.skrConfig,
        event = fc.event,
        Keyword = fc.common.Keyword,
        Suggestion = fc.ui.Suggestion;

    // suggest 需要入口信息，这里就不发给主模块处理了，依赖这一个条件，传进来得了
    function Search() {
        // 搜索按钮
        this.searchBtn = $('#krSearchBtn')[0];
        this.searchInput = ui.util.create('TextInput', {
            id: 'krSearchInput'
        });
        this.searchInput.appendTo($('#krSearchInput')[0]);

        addEvents.call(this);
    }

    Search.prototype = {

        value: function(value) {
            if (value === undefined) {
                return this.searchInput.getValue();
            } else {
                if (value && (typeof value == 'string')) {
                    this.searchInput.setValue(value);
                }
            }
        },

        dispose: function() {
            removeEvents.call(this);
            this.searchInput.dispose();
            delete this.searchBtn;
        }
    };
    
    var CSS_ACTIVE = 'active';
    
    function addEvents() {
        var me = this;
        event.click(me.searchBtn, clickSearchBtn, me);
        //监听回车
        event.on($('#krSearchInput')[0], 'keyup', function(e){
            e = e || window.event;
            if (e.keyCode == 13){
                clickSearchBtn.call(me);
            }
        });
        
        me.searchInput.onfocus = function() {
            fc.addClass(me.searchBtn, CSS_ACTIVE);
        };
        
        me.searchInput.onblur = function(value) {
            fc.removeClass(me.searchBtn, CSS_ACTIVE);
        };
    }

    function removeEvents() {
        event.un(this.searchBtn, 'click', clickSearchBtn);
    }

    function clickSearchBtn() {
        var query = trim(this.value());
        if (query === '' ||
            query === this.searchInput.getVirtualValue()) {
            return;
        }
        event.fire(this, {
            type: nirvana.SKR.EVENT_SEARCH,
            query: query
        });
    }

    return Search;

})($$);
