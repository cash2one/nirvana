/*
 * SKR即Standard Keyword Recommend
 * 本模块提供一个成熟的推荐关键词功能参考，由各个子模块组成，这部分主要负责初始化和事件的传递
 * @author mayue
 * @param {HTMLElement} target 目标dom节点
 * @param {Object} options 参数对象，具体属性如下
 * {
 *     tpl {string} 自己设置的模板的id，可引入skr模板配置
 * 	   result {Object} 自己配置的result模块构造函数
 *     resultOptions {Object} 需要传入result模块的配置项
 *     addWordsOptions {Object} 需要传入addWords模块的配置项
 *     searchEmptyTip {string} 没有搜索结果时的提示
 *     filterEmptyTip {string} 没有筛选结果是的提示
 *     onafteraddall {Function} 全部添加后的回调，传递地参数是添加的词语构成的数组
 *     onaftersearch {Function} 搜索词后的回调，传递的参数是搜索的内容
 *     onaftergetsmart {Function} 获取智能词后的回调，传递的参数是种子词构成的数组
 *     onafterwordboxchange {Function} 提词栏词语变化时的回调，传递参数是提词栏的textline组件实例
 * }
 */
nirvana.skrModules = {};

nirvana.SKR = (function($){
    var T = baidu,
        event = fc.event,
        Keyword = fc.common.Keyword,
        Button = fc.ui.Button,
        modules = nirvana.skrModules;
    
    function SKR(target, options) {
        var me = this;
        me.target = target;
        me.searchEmptyTip = TEXT_SEARCH_EMPTY;
        me.filterEmptyTip = TEXT_FILTER_EMPTY;
        T.object.extend(me, options);
        //render是将html结构放进去，必须最先进行
        render.call(me);
        
        me.node = $('#kr')[0];
        
        me.search = new modules.Search();
        me.result = new modules.Result(me.resultOptions || {});
        me.addWords = new modules.AddWords();
        me.toolbar = new modules.Toolbar(me.node);
        me.filter = new fc.ui.Filter($('#krFilter')[0], {
        	max_include: 1,
        	max_exclude: 5,
        	onchange: function(include, exclude) {
        	    var resultData = (me.result && me.result.data) || [];
        		me.result.filter.include = include;
        		me.result.filter.exclude = exclude;
        		
        		if (!include.length && !exclude.length) {
        		    me.result.filter.flag = false;
        		}
        		else {
        		    me.result.filter.flag = true;
        		}
        		
        		me.result.render(resultData, {
        		    emptyTip: me.filterEmptyTip
        		});
        	}
        });
        
        resize.call(me);
        me.addEvents();
        
        me.KRCore = new nirvana.KRCore(me.result, me.addWords, me.toolbar, {
            onafteraddall: me.onafteraddall,
            onafterwordboxchange: me.onafterwordboxchange
        });
    }
    SKR.prototype = {
        //只有被外部调用或需要被继承的方法才放到原型里
        addEvents: function() {
            event.on(this.search, SKR.EVENT_SEARCH, this.onsearch, this);
            event.on(this.result, SKR.EVENT_GET_SMART, this.getSmartWords, this);
        },
        /**
         * 用户进行搜索时触发
         * @event
         * @param {Object} e 事件
         * @param {string} e.query 搜索内容
         */
        onsearch: function(e) {
            this.filter.clear(false);
            this.result.clearFilter();
            this.result.clearSmart();
            this.getWords(e.query);
            
            this.onaftersearch && this.onaftersearch(e.query);
        },
        //根据搜索词获取数据
        getWords: function(query) {
            var me = this;
            var param = {};
            var seeds = query.split(/[,，]/);
            var seedNum = seeds.length;
            for (var i = 0; i < seedNum; i ++) {
                seeds[i] = fc.trim(seeds[i]);
            }
            seeds = fc.grep(seeds, function(item) {
                return !(item === '');
            });
            seeds= T.array.unique(seeds);
            param.seeds = seeds;
            param.region = me.region;
            param.onSuccess = function(response) {
                var config = nirvana.skrConfig;
                if (response.data && response.data.words && (response.data.words.length > 0)) {
                    var temp = {}, groupData = [];
                    temp[me.result.groupConfig.title] = '';
                    temp[me.result.groupConfig.data] = T.object.clone(response.data.words);
                    groupData.push(temp);
                    
                    me.result.data = groupData;
                    
                    me.result.render(groupData, {
                        emptyTip: me.searchEmptyTip
                    });
                    // 触发左右比对
                    event.fire(me.result, nirvana.KRCore.EVENT_WORD_CHANGE);
                }
                else {
                    onFail(response);
                }
            }
            param.onFail = onFail;
            param.onTimeout = onFail;
            param.timeout = 5000;
            function onFail(response) {
                var config = nirvana.skrConfig;
                me.result.render([],  {
                    emptyTip: me.searchEmptyTip
                });
            }
            me.result.loading();
            fbs.eos.getwords(param);
        },
        /**
         * 用户点击获取智能推词时触发
         * @event
         */
        getSmartWords: function() {
            var param = {};
            var me = this;
            param.seeds = me.result.smart.data;
            param.region = me.region;
            param.onSuccess = function(response){
                if (response.data && response.data.words && (response.data.words.length > 0)) {
                    me.result.smart = {
                        flag: false,
                        data: []
                    };
                    var temp = {};
                    temp[me.result.groupConfig.title] = '智能推词结果';
                    temp[me.result.groupConfig.data] = me.filterNewWords(T.object.clone(response.data.words));
                    me.result.data.push(temp);
                    
                    me.result.appendSmartWords([temp]);
                    baidu.dom.remove('krSmartRec');
                    // 触发左右比对
                    event.fire(me.result, nirvana.KRCore.EVENT_WORD_CHANGE);
                }
                else {
                    onFail(response);
                }
            }
            param.onFail = onFail;
            param.onTimeout = onFail;
            param.timeout = 5000;
            function onFail(response) {
                me.result.smart = {
                    flag: false,
                    data: []
                };
                
                me.result.addFailNotice();
                baidu.dom.remove('krSmartRec');
            }
            fbs.eos.getwords(param);
            
            me.onaftergetsmart && me.onaftergetsmart(param.seeds);
        },
        //获取更多得到的词，需要与原有词语对比去重
        filterNewWords: function(words) {
            var existing = this.result.getAllKeywords();
            var test = {};
            fc.each(existing, function(item){
                test[item.word] = true;
            });
            
            var ret = fc.grep(words, function(item){
                return !(test[item.word] === true);
            });
            
            return ret;
        },
        dispose: function() {
            for (var key in this) {
                this[key] && this[key].dispose && this[key].dispose();
            }
        }
    }
    
    SKR.EVENT_SEARCH = 'search';
    SKR.EVENT_GET_SMART = 'get_smart';
    
    var TEXT_SEARCH_EMPTY = '<div class="nodata">非常抱歉，您输入的关键词暂时无法为您提供较好的结果，您可以尝试输入其他关键词再进行搜索。</div>';
    var TEXT_FILTER_EMPTY = '<div class="nodata">对不起，没有符合的结果，您可以尝试更换筛选条件</div>';
    
    function render() {
        var me = this;
        me.target && (me.target.innerHTML = er.template.get(me.tpl ? me.tpl : 'skr'));
    }
    
    function resize() {
        var total = this.node.parentNode.parentNode.offsetHeight;
        this.addWords.updateBoxHeight(total);
        this.result.updateHeight(total);
    }
    
    return SKR;
})($$);
