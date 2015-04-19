/**
 * 市场风向标
 * @author zhujialu
 * @date 2011-12-26
 */
marketTrend.index1 = new er.Action({
    VIEW : 'marketTrendIndex1',
    UI_PROP_MAP : {
        selectIndustry: {
            datasource: '*industrys',
            width: '194'
        },
        //行业分析与市场竞争分析tab
        marketAnalysisTab : {
        	title : '*marketAnalysisTitles',
        	container : '*marketAnalysisContainers'
        },
        // 关键词展现趋势的tab控件
        /*wordsTrendSelect: {
        	width:150,
            datasource: '*wordsTrendSelectOption'
        },*/
        //时段分布的select控件
        timeDistributionType : {
        	datasource:'*timeDistributionType',
        	width: '175'
        },
        timeDistributionTime : {
        	datasource:'*timeDistributionTime',
        	width: '194'
        },
        //地域分布的select控件
        areaDistributionType : {
        	datasource:'*areaDistributionType',
        	width: '175'
        },
        areaDistributionTime : {
        	value : '*calendarDateSelected',
            availableRange : '*calendarAvailableRange',
            show : 'form',
            miniOption: '*CalendarMiniOption'
        },
        //行业规模趋势
        industryTrendTime: {
        	value : '*calendarDateSelected',
            availableRange : '*calendarAvailableRange',
            show : 'form',
            miniOption: '*CalendarMiniOption'
        },
        myTrendTime:{
        	value : '*calendarDateSelected',
            availableRange : '*calendarAvailableRange',
            show : 'form',
            miniOption: '*CalendarMiniOption'
        },
        // 地域分布：商业检索量的topN控件
        searchAmount: {
            N: '10',
            keys: '*searchAmountKeys',
            values: '*searchAmountValues',
            barKey: 'epvRate'
        }
        /*oneDayTopWords: {
            data: '*oneDayTopWordsData',
            keys: '*topWordsKeys',
            values: '*topWordsValues',
            barKey: 'value'
        },
        oneDayExplosiveWords: {
            data: '*oneDayExplosiveWordsData',
            keys: '*explosiveWordsKeys',
            values: '*explosiveWordsValues',
            barKey: 'value'
        },
        sevenDayTopWords: {
            data: '*sevenDayTopWordsData',
            keys: '*topWordsKeys',
            values: '*topWordsValues',
            barKey: 'value'
        },
        sevenDayExplosiveWords: {
            data: '*sevenDayExplosiveWordsData',
            keys: '*explosiveWordsKeys',
            values: '*explosiveWordsValues',
            barKey: 'value'
        }*/
    },
    CONTEXT_INITER_MAP: {
        // 初始化URL携带的参数，转换编码
        initParams: function(callback) {
            
            // 用一个map表示每个模块是否初始化过
            var initedMap = { area: false, myTrend: false, time: false, wordsTrend: false };

            this.params = {initedMap: initedMap};

            callback();
        },
        initSelect: function(callback) {
            var me = this;
            
            fbs.marketTrend.getMyTrade({
                onSuccess: function(json) {
                    var data = json.data, ret = [];

                    for (var i = 0, len = data.length; i < len; i++) {
                        ret[i] = {
                            text: eval(data[i].name).join(' > '),
                            value: data[i].id
                        };
                    }
                    me.setContext('defaultIndustry', data[0].id);
                    me.setContext('industrys', ret);
                    callback();
                },
                onFail: function() {
               	 	callback();
                }
            });
        },
        /**
         * 初始化时间选择控件
         * 配置条件: 开始时间为一年前的今天，结束时间为昨天
         * 举个例子，如果今天是2012-1-1，配置为 2011-1-1 至 2011-12-31
         */
        initCalendar: function(callback) {
            // 一年前的今天
            var oneYearBefore = new Date(nirvana.env.SERVER_TIME * 1000), 
                year = oneYearBefore.getFullYear();

            oneYearBefore.setFullYear(--year);
            
            // itac只能提供2011-09-01之后的数据
            var startPoint = baidu.date.parse('2011-09-01');
            if (oneYearBefore.getTime() < startPoint.getTime()) {
                oneYearBefore = startPoint;
            }

            // 昨天
            var yesterday = new Date(nirvana.env.SERVER_TIME * 1000), 
                day = yesterday.getDate();
            yesterday.setDate(--day);

            // 当前选择时间范围，默认是最近7天
            var dateSelected = nirvana.util.dateOptionToDateValue(1);
            
            // 可选时间范围
            var dateAvailableRange = {
                begin: oneYearBefore, // 一年前的今天
                end: yesterday // 昨天
            };

            this.setContext('calendarDateSelected', dateSelected);
            this.setContext('calendarAvailableRange', dateAvailableRange);

            this.setContext('CalendarMiniOption', [0, 1, 2, 4]);
            
            callback();
            
        },
		
		marketAnalysisTab : function(callback){
			this.setContext('marketAnalysisTitles',['行业分析','竞争市场分析']);
			this.setContext('marketAnalysisContainers',['marketAnalysis_industry','marketAnalysis_market']);
			
			callback();
		},
		
        /*wordsTrendTab: function(callback) {
            marketTrend.wordsTrend.initWordsTrend(this);
            callback();
        },*/
        
        timeDistribution: function(callback){
        	var action = this;
        	marketTrend.timeDistribution.initTimeDistribution(action);
        	
        	callback();
		},
        areaDistribution: function(callback) {
           var action = this;
           marketTrend.areaDistribution.initAreaDistribution(action);
           
           callback();
        },
        
        industryTrend : function(callback){
        	var action = this;
        	marketTrend.industryTrend.initIndustryTrend(action);
        	
        	callback();
        }
    },
    onentercomplete : function() {
        ui.Bubble.init();
        this.wordsTrendIndustry = new marketTrend.wordsTrend("wordsTrendIndustry");
        this.wordsTrendMarket = new marketTrend.wordsTrend("wordsTrendMarket");
    },
    onafterrender: function(){
        var me = this;
        
        // 返回 按钮
        baidu.g('backBtn').onclick = function() {
            er.locator.redirect('/overview/index');
            return false;
        };
        
        var select = ui.util.get('selectIndustry'),
            value = this.getContext('defaultIndustry');
        
        select.setValue(value);
        this.params.industryID = value;
        
        select.onselect = function(id) {
            me.params.industryID = id;
            setLog(id);
        };
        //点击tab时 对有topN控件的进行刷新
        ui.util.get('marketAnalysisTab').onselect = function(tab){
        	if(me.getContext('queryIndustry')){
        		if(!tab){
        			marketTrend.areaDistribution.getAreaDistribution(me);
    				me.wordsTrendIndustry.getWordsTrend(me);
        		}else{
        			me.wordsTrendMarket.getWordsTrend(me);
        		}
    			me.setContext('queryIndustry',false);
        	}
        }
        //行业规模趋势
        marketTrend.industryTrend.init(me);
        //地域分布
        marketTrend.areaDistribution.firstAreaDistribution(me);
        //我的趋势
        marketTrend.myTrend.firstMyTrend(me);
        //电梯直达
        baidu.each($$('.lift span'),function(item){
        	item.onclick = marketTrend.index.tools.liftTo;
        });
        //返回顶部
        baidu.each($$('.marketTrend_goback'),function(item){
        	item.onclick = marketTrend.index.tools.goBack;
        });
        // 查询按钮
        var queryBtn = ui.util.get('query');
        queryBtn.onclick = function() {
			me.setContext('queryIndustry',true);
            me.query();
        };
        
        me.query();
        
        setLog(value);

        function setLog(id) {
            var param = {
                target: 'query_button',
                industryID: id
            };
            queryBtn.main.setAttribute('data-log', baidu.json.stringify(param));
        }
    },
    /**
     * 用户点击“查询”或者重新选择行业时，开始渲染四个小模块
     */
    query: function() {
        // 模块状态变成loading
        var loadings = baidu.q('loading');
        for (var i = 0, item; item = loadings[i]; i++) {
            item.style.display = 'block';    
        }

        var errors = baidu.q('error');
        for (i = 0; item = errors[i]; i++) {
            item.style.display = 'none';    
        }

        var contents = baidu.q('content_wrapper');
        for (i = 0; item = contents[i]; i++) {
            item.style.display = 'none';
        }

        // 开始串行请求
        this.isSerialRequest = true;
        marketTrend.industryTrend.getIndustryTrend(this);
    },
    /**
     * @return {boolean} true表示有error，false反之
     */
    errorHandler: function(errorCode, node, interFace) {
        var loading = baidu.q('loading', node)[0],
            error = baidu.q('error', node)[0],
            content = baidu.q('content_wrapper', node)[0];

        if (errorCode && (errorCode.code == 10002 ||
            errorCode.code == 10003)) {
            
            if (errorCode.code == 10002) {
                error.innerHTML = '对不起，当前没有数据。'
            } else {
                error.innerHTML = '数据读取异常';
            }
            error.style.display = 'block';
            loading.style.display = 'none';
            content.style.display = 'none';
            
            // 清除缓存
            interFace.clearCache();

            return true;
        } else {
            content.style.display = 'block';
            loading.style.display = 'none';
            error.style.display = 'none';

            return false;
        }

    },
    // 所有接口的名称
    interfaceNames: [
    	'getIndustryTrend',
    	'getTimeDistribution',
        'getAreaDistribution',
        'getWordsTrendIndustry',
        'getMyTrend',
        'getWordsTrendMarket'
    ],
    
    getAreaDistribution : marketTrend.areaDistribution.getAreaDistribution,
    
    getMyTrend : marketTrend.myTrend.getMyTrend,
    
    getTimeDistribution : marketTrend.timeDistribution.getTimeDistribution,
    
    getWordsTrendIndustry : function(){
    	this.wordsTrendIndustry.getWordsTrend(this);
    },
    getWordsTrendMarket : function(){
    	this.wordsTrendMarket.getWordsTrend(this);
    },
    /**
     * 私有方法, 管理串行请求
     * @param {number} requestIndex 请求的顺序位置
     * 请求地域      =>0
     * 请求我的趋势  =>1
     * 请求时段      =>2
     * 请求关键词趋势=>3
     */
    _request: function(requestIndex, params, successFun) {
        var me = this, interfaces = fbs.marketTrend;

        requestIndex = marketTrend.index.tools.getLegalNumber(requestIndex);

        var curRequestName = this.interfaceNames[requestIndex],
            curInterface = interfaces[curRequestName],
            nextRequestName;

        if (requestIndex < this.interfaceNames.length - 1) {
            nextRequestName = this.interfaceNames[requestIndex + 1];
        } else {
            // 结束串行请求
            this.isSerialRequest = false;
        }
        
        // 当前请求模块对应的DOM节点
        var node;
        switch (requestIndex) {
            case 0:
            	node = baidu.g('market_industry_trend');
                break;
            case 1:
           		node = baidu.g('market_timedistribution');
                break;
            case 2:
                 node = baidu.g('market_areadistribution');
                break;
            case 3:
                node = baidu.g('wordsTrendIndustry');
           	 	break;
            case 4:
           	 	node = baidu.g('market_mytrend');
           	 	break;
           	case 5:
	            node = baidu.g('wordsTrendMarket');
	            break;
        }
        
        // 准备好params
        if (params) {
            params.onSuccess = function(json) {
                if (me.isSerialRequest && nextRequestName) {
                  	me[nextRequestName](me);
                }

                if (me.errorHandler(json.errorCode, node, curInterface)) {
                    // 如果有错，直接返回
                    return;
                }
                if (typeof successFun === 'function') {
                    successFun(json);
                }
            };
            params.onFail = function(json) {
                if (me.isSerialRequest && nextRequestName) {
                  	me[nextRequestName](me);
                }

                me.errorHandler({code: 10003}, node, curInterface);
            };
        }
        
        if (curInterface) {
            curInterface(params);
        }
    }
});

// flash专用
marketTrend.index.flash = {
    // map存id->data的映射关系
    map: {},
	vars : {
		timeDistribution: {},
		areaDistribution: {}
	},
    callback: function(id) {
        var swf = baidu.swf.getMovie(id),
        	name,
        	type;
        if(id == 'time_distribution_oneday' || id == 'time_distribution_sevenday'){
        	name = this.vars.timeDistribution.name;
        	type = this.vars.timeDistribution.type;
        }else if(id == 'areaDistributionFlash'){
        	name = this.vars.areaDistribution.name;
        	type = this.vars.areaDistribution.type;
        }
            
        if(name){
        	swf.setData(this.map[id],name,type);
        }else{
        	swf.setData(this.map[id]);
        }
              
    },
    // 我的趋势模块，当鼠标划过其中一个flash时，
    // 另一个flash会联动
    onTrackMove: function(id, index) {
        id = id === 'showShare' ? 'promotionShowTrend' : 'showShare';
        var swf = baidu.swf.getMovie(id);
		swf.moveTrack(index);
    }
}
// 工具方法集
marketTrend.index.tools = {
    /**
     * 获得合法数字，如num非法，返回0
     */
    getLegalNumber: function(num) {
        if (typeof num === 'number') {
            return num;

        } else {
            num = parseInt(num, 10);
            if (isNaN(num)) {
                num = 0;
            }
            return num;
        }
    },
    /**
     * 获得input对象，type是radio或checkbox
     * HTML结构是: <input id="xx" type="radio"/><label for="xx">text</label>
     * 
     * @param {Event} e
     */
    getInput: function(e) {
        e = e || window.event;
        var target = e.target || e.srcElement,
            tagName = target.tagName.toLowerCase();

        if (tagName !== 'input' && tagName !== 'label') {
            return;
        }

        if (tagName === 'input' && (target.type === 'radio' || target.type === 'checkbox')) {
            return target;
        } else {
            var id = target['for'];
            return id ? baidu.g(id) : null;
        }
    },
    /**
     * 格式化time，转成10:00~11:59这样的格式
     * @param {number} time 值为0-23
     */
    formatTime: function(time) {
        if (time < 10){
            time = '0' + time;
        }
        return time + ':00~' + time + ':59';
    },
    /**
     * 关键词去重，根据字面量去重
     * @return {object}
     */
    distinctWords: function(selectedWords) {
        var wordsMap = {}, item;

        for (var key in selectedWords) {
            item = selectedWords[key];
            if (!wordsMap[item.word]) {
                wordsMap[item.word] = item;
            }
        }
        return wordsMap;
    },
    //电梯直达
    liftTo:function(e){
    	var e = e || window.event,
    		target = e.target || e.srcElement,
    		targetId = baidu.getAttr(target,'targetId');
    	
    	if(baidu.browser.chrome){
    		document.body.scrollTop = baidu.g(targetId).offsetTop;
    	}else{
    		document.documentElement.scrollTop = baidu.g(targetId).offsetTop;
    	}
    },
    //回到顶部
    goBack:function(){
    	if(baidu.browser.chrome){
    		document.body.scrollTop = 0;
    	}else{
    		document.documentElement.scrollTop = 0;
    	}
    }
    /**
     * 修正激增词表头的偏移，因为出现滚动条会偏离
     */
    /*correctOffset: function(day) {
        var id = day === 1 ? 'wordstrend_oneday' : 'wordstrend_sevenday',
            container = baidu.g(id),
            el = baidu.q('rank_content', container)[0];

        // 1.计算滚动条宽度
        var scrollBarWidth = el.offsetWidth - el.clientWidth;
        // 2.获取表头元素
        var header = baidu.q('explosive_words', container)[0];
        // 3.修正偏移
        header.style.marginRight = scrollBarWidth + 'px';
    }*/
}

