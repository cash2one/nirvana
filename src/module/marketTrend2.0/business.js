/**
 * 市场风向标  行业趋势模块
 * @author mayue 2012/12/03
 */

(function($){

marketTrend.business = new marketTrend.moduleBase({
    id: 'marketBusiness',
    tip: '为您分析整个行业的趋势变化，以及您和同行的表现，帮助您更好的赢得行业的优质流量'
});
//标识当前请求状态，init/refresh
marketTrend.business.requestType = '';
marketTrend.business.endCount = 0;
marketTrend.business.init = function(businessIndex){
    //类的功能，初始化模块外围结构
    this.initTitle(businessIndex);
    this.refreshTip(businessIndex);
    
    this.requestType = 'init';
    marketTrend.business.diagram.init(businessIndex);
    marketTrend.business.table.init(businessIndex);
    
    if (!marketTrend.control.businessDivide.data.business[businessIndex].hot.ishot) {
        marketTrend.business.read.init(businessIndex);
        baidu.addClass(baidu.q('business_trend_hot')[0], 'hide');
        baidu.removeClass(baidu.q('business_trend_read')[0], 'hide');
    }
    else {
        marketTrend.business.hot.init(businessIndex);
        baidu.addClass(baidu.q('business_trend_read')[0], 'hide');
        baidu.removeClass(baidu.q('business_trend_hot')[0], 'hide');
    }
};
marketTrend.business.refresh = function(businessIndex){
    //类的功能，初始化模块外围结构
    this.initTitle(businessIndex);
    this.refreshTip(businessIndex);
    
    this.requestType = 'refresh';
    marketTrend.business.diagram.refresh(businessIndex);
    marketTrend.business.table.init(businessIndex);
    
    if (!marketTrend.control.businessDivide.data.business[businessIndex].hot.ishot) {
        marketTrend.business.read.init(businessIndex);
        baidu.addClass(baidu.q('business_trend_hot')[0], 'hide');
        baidu.removeClass(baidu.q('business_trend_read')[0], 'hide');
    }
    else {
        if (marketTrend.business.hot.initialized) {
            marketTrend.business.hot.refresh(businessIndex);
        }
        else {
            marketTrend.business.hot.init(businessIndex);
        }
        
        baidu.addClass(baidu.q('business_trend_read')[0], 'hide');
        baidu.removeClass(baidu.q('business_trend_hot')[0], 'hide');
    }
};
marketTrend.business.refreshTip = function(businessIndex){
    var me = this;
    var tempTip;
    if (!marketTrend.control.businessDivide.data.business[businessIndex].hot.ishot) {
        tempTip = this.tip;
    }
    else {
        if (marketTrend.control.businessDivide.data.business[businessIndex].hot.timeleft > 0) {
            tempTip = '旺季即将来临，请把握流量';
        }
        else {
            tempTip = '目前正处于旺季，请加大投放，以获得更好的效果';
        }
    }
    
    $('#' + me.id + ' .market_module_tip')[0].innerHTML = tempTip;
};
marketTrend.business.onRequestEnd = function(){
    var me = marketTrend.business;
    me.endCount ++;
    if (me.endCount == 3) {
        me.goNext();
        me.endCount = 0;
    }
};
marketTrend.business.goNext = function(){
    var me = marketTrend.business;
    marketTrend.time[me.requestType](marketTrend.control.businessDivide.data.currentIndex);
};
marketTrend.business.dispose = function(){
    marketTrend.business.hot.revertData();
};
/**
 *行业趋势图表模块
 */
marketTrend.business.diagram = {
	data: {
	    businessIndex: 0,
	    flashWidth: 800,
	    failFlag: false,
		flashId: 'businessTrend',
		business: {}
	},
	init: function(businessIndex) {
    	var me = this;
    	me.data.businessIndex = businessIndex;
    	
    	var flashWidth = baidu.g('marketBody').offsetWidth - 400;
        me.data.flashWidth = flashWidth;
    	
    	function callback() {
    		//生成Flash
			var mainDom = baidu.g('businessTrendDiagram'),
				flashName = 'market_busi_trend.swf',
				width = me.data.flashWidth,
				height = 200;
			
			me.flash = baidu.swf.create({
				id: me.data.flashId,
				url: './asset/swf/' + flashName,
				width: width,
				height: height,
				scale : 'showall',
				wmode : 'opaque',
				allowscriptaccess : 'always'
			}, mainDom);
			
    		me.initEvents();
    	}
    	
        me.fetch(callback);
    },
    refresh: function(businessIndex){
        var me = this;
        me.data.businessIndex = businessIndex;
        
        function callback() {
            //生成Flash
            var mainDom = baidu.g('businessTrendDiagram'),
                flashName = 'market_busi_trend.swf',
                width = me.data.flashWidth,
                height = 200;
            
            me.flash = baidu.swf.create({
                id: me.data.flashId,
                url: './asset/swf/' + flashName,
                width: width,
                height: height,
                scale : 'showall',
                wmode : 'opaque',
                allowscriptaccess : 'always'
            }, mainDom);
        }
        
        me.fetch(callback);
    },
    fetch: function(callback) {
    	var me = this;
		function onSuccess(response) {
			var data = response.data || {};
			me.data.business = baidu.object.clone(data);
			if (me.data.failFlag) {
			    me.onSuccess();
			}
			callback();
		};
		var params = {
		    industryID: marketTrend.control.businessDivide.data.business[me.data.businessIndex].id,
			onSuccess: onSuccess,
			callback: marketTrend.business.onRequestEnd,
			onFail: me.onFail,
			onTimeout: marketTrend.business.onRequestEnd
		};
		fbs.mktinsight.getBusinessTrend(params);
    },
    initEvents: function() {
    	var me = this;
        //监听checkbox点击
        baidu.on('businessDiagramControl', 'click', function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;
        	if (target.nodeName.toLowerCase() == 'input') {
        		var targetId = baidu.dom.getAttr(target, 'id');
	        	var targetName = targetId.slice(8);
	        	var flashObj = baidu.swf.getMovie(me.data.flashId);
	        	flashObj['show' + targetName](target.checked);
        	}
        });
    },
    //将checkboxs设为默认状态
    resetCheckbox: function(){
        baidu.g('checkboxMyShow').checked = true;
        baidu.g('checkboxOtherShow').checked = false;
        //baidu.g('checkboxNewSearch').checked = false;
    },
    //处理flash数据，主要是将毫秒值转化为日期字符串，以及奖励是搜索量按淡旺季分段
    getFlashSource: function(){
    	var me = this;
    	var flashSource = {};
    	
    	if (me.data.business.mainData.myShow) {
    	    baidu.show('checkboxMyShow');
            baidu.show($('#businessDiagramControl label')[0]);
    	    flashSource.myShow = [];
        	var myShowLen = me.data.business.mainData.myShow.length;
            for (var i = 0; i < myShowLen; i ++) {
                flashSource.myShow.push({
                    label: baidu.date.format(new Date(me.data.business.mainData.myShow[i].date), 'yyyy-MM-dd'),
                    value: me.data.business.mainData.myShow[i].value
                });
            }
    	} else {
            baidu.hide('checkboxMyShow');
            baidu.hide($('#businessDiagramControl label')[0]);
        }
		
		if (me.data.business.mainData.otherShow) {
		    flashSource.otherShow = [];
    		baidu.show('checkboxOtherShow');
    		baidu.show($('#businessDiagramControl label')[1]);
    		
    		var otherShowLen = me.data.business.mainData.otherShow.length;
            for (var i = 0; i < otherShowLen; i ++) {
                flashSource.otherShow.push({
                    label: baidu.date.format(new Date(me.data.business.mainData.otherShow[i].date), 'yyyy-MM-dd'),
                    value: me.data.business.mainData.otherShow[i].value
                });
            }
		} else {
		    baidu.hide('checkboxOtherShow');
		    baidu.hide($('#businessDiagramControl label')[1]);
		}
		
		/*if (me.data.business.mainData.newPV) {
		    baidu.show('checkboxNewSearch');
            baidu.show($('#businessDiagramControl label')[2]);
		    flashSource.newSearch = [];
            var newSearchLen = me.data.business.mainData.newPV.length;
            for (var i = 0; i < newSearchLen; i ++) {
                flashSource.newSearch.push({
                    label: baidu.date.format(new Date(me.data.business.mainData.newPV[i].date), 'yyyy-MM-dd'),
                    value: me.data.business.mainData.newPV[i].value
                });
            }
		} else {
            baidu.hide('checkboxNewSearch');
            baidu.hide($('#businessDiagramControl label')[2]);
        }*/
		
		if (me.data.business.mainData.oldPV && (me.data.business.mainData.oldPV.length != 0)) {
		    flashSource.oldSearch = [];
		    var oldSearch;
            if (me.data.business.hotData && (me.data.business.hotData.length != 0)) {
                oldSearch = me.getCutedOldSearch();
            }
            else {
                oldSearch = [{
                   hot: false,
                   data: baidu.object.clone(me.data.business.mainData.oldPV)
                }];
            }
            
            var oldSearchLen = oldSearch.length;
            for (var i = 0; i < oldSearchLen; i ++) {
                var tempItem = {
                    hot: oldSearch[i].hot,
                    data: []
                };
                var tempLen = oldSearch[i].data.length;
                for (var j = 0; j < tempLen; j ++) {
                    var tempDate = new Date(oldSearch[i].data[j].date);
                    tempItem.data.push({
                        label: baidu.date.format(tempDate, 'yyyy-MM-dd'),
                        value: oldSearch[i].data[j].value
                    });
                }
                flashSource.oldSearch.push(tempItem);
            }
		}
		
		
		return flashSource;
    },
    //通过hotData将main.oldSearch切分成区分淡旺季的小块，生成新数组并返回
    getCutedOldSearch: function() {
    	var me = this;
		var tempOldSearch = [];
		var tempNum = 0;
		
		function compare(a, b){
			return a.begin - b.begin;
		}
		me.data.business.hotData.sort(compare);
		
		var hotNum = me.data.business.hotData.length;
		var oldSearch = baidu.object.clone(me.data.business.mainData.oldPV);
		var oldNum = oldSearch.length;
		for (var i = 0; i < hotNum; i ++) {
		    tempOldSearch[2*i] = {
		    	hot: false,
		    	data: []
		    };
		    tempOldSearch[2*i + 1] = {
		    	hot: true,
		    	data: []
		    };
		    for (var j = tempNum; (oldSearch[j].date < me.data.business.hotData[i].end) && (j < oldNum); j ++) {
		    	if (oldSearch[j].date < me.data.business.hotData[i].begin) {
		    		tempOldSearch[2*i].data.push(oldSearch[j]);
		    	} else {
		    		tempOldSearch[2*i + 1].data.push(oldSearch[j]);
		    	}
		    	tempNum ++;
		    }
		}
		//最后一个淡季部分的处理
		var tempOldItem = {
			hot: false,
			data: []
		};
		for (var m = tempNum; m < oldNum; m ++) {
		    tempOldItem.data.push(oldSearch[m]);
		}
		tempOldSearch.push(tempOldItem);
		
		for (var n = 0; n < tempOldSearch.length; n ++) {
			if (tempOldSearch[n].data.length == 0) {
				tempOldSearch.splice(n, 1);
				n --;
			}
		}
		
		return tempOldSearch;
    },
    onFail: function(){
        baidu.removeClass(baidu.q('market_fail_wrapper', baidu.q('business_trend_diagram')[0])[0], 'hide');
        marketTrend.business.diagram.data.failFlag = true;
    },
    onSuccess: function(){
        baidu.addClass(baidu.q('market_fail_wrapper', baidu.q('business_trend_diagram')[0])[0], 'hide');
        marketTrend.business.diagram.data.failFlag = false;
    },
    loadFlashData: function(objectId) {
        var me = this;
        
        var flashObj = baidu.swf.getMovie(objectId);
        
        //宽度值需要计算
        flashObj.resizeSwf(me.data.flashWidth);
        
        var flashSource = me.getFlashSource();
        
        var hasOldSearch;
        //如果历史数据没有，flash的x轴无法正常展现，用其他数据填充历史数据
        if (flashSource.oldSearch) {
            hasOldSearch = true;
        } else {
            flashSource.oldSearch = [{
                hot: false,
                data: baidu.object.clone(flashSource.myShow || flashSource.otherShow || flashSource.newPV)
            }];
            hasOldSearch = false;
        }
        
        flashObj.setData(flashSource);
        
        if (hasOldSearch) {
            flashObj.showOldSearch(true);
        }
        if (flashSource.myShow) {
            flashObj.showMyShow(true);
        }
        me.resetCheckbox();
    }
};
/**
 *行业趋势图表右侧的百分比模块 
 */
marketTrend.business.table = {
    data: {
        businessIndex: 0,
        failFlag: false,
        compare: {}
    },
    init: function(businessIndex) {
        var me = this;
        me.data.businessIndex = businessIndex;
        
        function callback(){
            me.showCompareData();
            
            me.initEvents();
        }
        
        me.fetch(callback);
    },
    fetch: function(callback) {
        var me = this;
        function onSuccess(response) {
            var data = response.data || {};
            me.data.compare = baidu.object.clone(data);
            if (me.data.failFlag) {
                me.onSuccess();
            }
            callback();
        };
        var params = {
            industryID: marketTrend.control.businessDivide.data.business[me.data.businessIndex].id,
            callback: marketTrend.business.onRequestEnd,
            onSuccess: onSuccess,
            onFail: me.onFail,
			onTimeout: marketTrend.business.onRequestEnd
        };
        fbs.mktinsight.getBusinessCompare(params);
    },
    initEvents: function(){},
    showCompareData: function() {
        var me = this;
        var nullStr =  '<span class="business_compare_up">-</span>';
        if (me.data.compare.industryRatio) {
            $('#trendTableYesterday dd')[0].innerHTML = me.processRateData(me.data.compare.industryRatio[0]);
            $('#trendTableSevenday dd')[0].innerHTML = me.processRateData(me.data.compare.industryRatio[1]);
            $('#trendTableThirtyday dd')[0].innerHTML = me.processRateData(me.data.compare.industryRatio[2]);
        }
        else {
            $('#trendTableYesterday dd')[0].innerHTML = nullStr;
            $('#trendTableSevenday dd')[0].innerHTML = nullStr;
            $('#trendTableThirtyday dd')[0].innerHTML = nullStr;
        }
        
        if (me.data.compare.myRatio) {
            $('#trendTableYesterday dd')[1].innerHTML = me.processRateData(me.data.compare.myRatio[0]);
            $('#trendTableSevenday dd')[1].innerHTML = me.processRateData(me.data.compare.myRatio[1]);
            $('#trendTableThirtyday dd')[1].innerHTML = me.processRateData(me.data.compare.myRatio[2]);
        }
        else {
            $('#trendTableYesterday dd')[1].innerHTML = nullStr;
            $('#trendTableSevenday dd')[1].innerHTML = nullStr;
            $('#trendTableThirtyday dd')[1].innerHTML = nullStr;
        }
        
        if (me.data.compare.otherRatio) {
            $('#trendTableYesterday dd')[2].innerHTML = me.processRateData(me.data.compare.otherRatio[0]);
            $('#trendTableSevenday dd')[2].innerHTML = me.processRateData(me.data.compare.otherRatio[1]);
            $('#trendTableThirtyday dd')[2].innerHTML = me.processRateData(me.data.compare.otherRatio[2]);
        }
        else {
            $('#trendTableYesterday dd')[2].innerHTML = nullStr;
            $('#trendTableSevenday dd')[2].innerHTML = nullStr;
            $('#trendTableThirtyday dd')[2].innerHTML = nullStr;
        }
    },
    processRateData: function(rate) {
        return (rate || rate == 0)
            ? (
                (rate >= 0) 
                ? '<span class="business_compare_up"' + ((rate > 10) ? ('title="' + Math.round(1000*Math.abs(rate))/10 + '%"') : '') + '>+'
                : '<span class="business_compare_down"' + ((rate > 10) ? ('title="' + Math.round(1000*Math.abs(rate))/10 + '%"') : '') + '>-'
              )
                + ((rate > 10) ? '>1000' : Math.round(1000*Math.abs(rate))/10) + '%</span>'
            : '<span class="business_compare_up">-</span>';
    },
    onFail: function(){
        baidu.removeClass(baidu.q('market_fail_wrapper', baidu.g('businessTrendTable'))[0], 'hide');
        marketTrend.business.table.data.failFlag = true;
    },
    onSuccess: function(){
        baidu.addClass(baidu.q('market_fail_wrapper', baidu.g('businessTrendTable'))[0], 'hide');
        marketTrend.business.table.data.failFlag = false;
    }
};
/**
 *行业解读模块
 */
marketTrend.business.read = {
    data: {
        businessIndex: 0,
        read: {}
    },
    init: function(businessIndex){
        var me = this;
        me.data.businessIndex = businessIndex;
        
        function callback() {
            me.fillNum();
            
            me.initBar();
        }
        
        me.fetch(callback);
    },
    fetch: function(callback){
        var me = this;
        function onSuccess(response) {
            var data = response.data || {};
            me.data.read = baidu.object.clone(data);
            callback();
        };
        var params = {
            industryID: marketTrend.control.businessDivide.data.business[me.data.businessIndex].id,
            onSuccess: onSuccess,
            callback: marketTrend.business.onRequestEnd,
            onFail: me.onFail,
			onTimeout: marketTrend.business.onRequestEnd
        };
        fbs.mktinsight.getBusinessRead(params);
    },
    fillNum: function(){
        var me = this;
        baidu.each($('#businessReadWord .business_average_num'), function(item){
            item.innerHTML = (me.data.read.averageWord || (me.data.read.averageWord == 0)) ? me.data.read.averageWord : '-';
        });
        baidu.each($('#businessReadWord .business_your_num'), function(item){
            item.innerHTML = (me.data.read.myWord || (me.data.read.myWord == 0)) ? me.data.read.myWord : '-';
        });
        baidu.each($('#businessReadWord .business_compare_rate'), function(item){
            item.innerHTML = (me.data.read.comparedWord || (me.data.read.comparedWord == 0)) ? Math.round(10000*(1 - me.data.read.comparedWord))/100 + '%' : '-';
        });
        baidu.each($('#businessReadShow .business_average_num'), function(item){
            item.innerHTML = (me.data.read.averageShow || (me.data.read.averageShow == 0)) ? Math.round(10000*me.data.read.averageShow)/100 + '%' : '-';
        });
        baidu.each($('#businessReadShow .business_your_num'), function(item){
            item.innerHTML = (me.data.read.myShow || (me.data.read.myShow == 0)) ? Math.round(10000*me.data.read.myShow)/100 + '%' : '-';
        });
        baidu.each($('#businessReadShow .business_compare_rate'), function(item){
            item.innerHTML = (me.data.read.comparedShow || (me.data.read.comparedShow == 0)) ? Math.round(10000*(1 - me.data.read.comparedShow))/100 + '%' : '-';
        });
    },
    initBar: function(){
        var me = this;
        if (me.data.read.myWord && me.data.read.averageWord) {
            if (me.data.read.myWord > me.data.read.averageWord) {
                $('#businessReadWord .business_average_bar')[0].style.width = Math.max(
                    290*me.data.read.averageWord/me.data.read.myWord,
                    $('#businessReadWord .business_average_bar .business_average_num')[0].offsetWidth + 35
                ) + 'px';
            }
            else {
                $('#businessReadWord .business_your_bar')[0].style.width = Math.max(
                    me.data.read.myWord/me.data.read.averageWord*$('#businessReadWord .business_average_bar')[0].offsetWidth,
                    $('#businessReadWord .business_your_bar .business_your_num')[0].offsetWidth + 20
                ) + 'px';
            }
        }
        
        if (me.data.read.myShow && me.data.read.averageShow) {
            if (me.data.read.myShow > me.data.read.averageShow) {
                $('#businessReadShow .business_average_bar')[0].style.width = Math.max(
                    me.data.read.averageShow/me.data.read.myShow*$('#businessReadShow .business_your_bar')[0].offsetWidth,
                    $('#businessReadShow .business_average_bar .business_average_num')[0].offsetWidth + 30
                ) + 'px';
            }
            else {
                $('#businessReadShow .business_your_bar')[0].style.width = Math.max(
                    me.data.read.myShow/me.data.read.averageShow*$('#businessReadShow .business_average_bar')[0].offsetWidth,
                    $('#businessReadShow .business_your_bar .business_your_num')[0].offsetWidth + 15
                ) + 'px';
            }
        }
    },
    onFail: function(){
        baidu.addClass(baidu.q('business_trend_read')[0], 'hide');
    }
};
/**
 *行业旺季解读
 */
marketTrend.business.hot = {
    data: {
        initialized: false,
        businessIndex: 0,
        hot: {}
    },
    revertData: function(){
        this.data.initialized = false;
    },
    init: function(businessIndex){
        var me = this;
        me.data.businessIndex = businessIndex;
        
        me.initEvents();
        
        function callback() {
            me.fillNum();
        }
        
        me.fetch(callback);
        me.data.initialized = true;
    },
    refresh: function(businessIndex){
        var me = this;
        me.data.businessIndex = businessIndex;
        
        function callback() {
            me.fillNum();
        }
        
        me.fetch(callback);
    },
    fetch: function(callback){
        var me = this;
        function onSuccess(response) {
            var data = response.data || {};
            me.data.hot = baidu.object.clone(data);
            callback();
        };
        var params = {
            industryID: marketTrend.control.businessDivide.data.business[me.data.businessIndex].id,
            callback: marketTrend.business.onRequestEnd,
            onSuccess: onSuccess,
            onFail: me.onFail,
			onTimeout: marketTrend.business.onRequestEnd
        };
        fbs.mktinsight.getBusinessHotRead(params);
    },
    initEvents: function(){
        var me = this;
        //查看行业旺季词
        baidu.g('businessHotWordsBtn').onclick = function(){
        	var options = {
                domId: 'ctrldialoghotWordsbody',
                givenId: 'hotWords',
                titleArray: ['关键词', '旺季日均增长量', '增幅'],
                oringinKeys: ['word', 'value', 'upRate'],
                barKey: 'value',
                downloadKeys: [
                    function(item) {
                        return item.word;
                    },
                    function(item) {
                        return item.value;
                    },
                    function(item) {
                        return Math.round(10000*item.upRate)/100 + '%';
                    }
                ],
                downloadName: 'hotseason',
                oringinValues: [
                    function(item) {
                        var randomID = er.random();
                        item.randomID = randomID;
                        return '<input type="checkbox" id="randomID_' + randomID +
                        '"/>&nbsp;<label for="randomID_' + randomID +
                        '" title="' + item.word + '">' + getCutString(item.word, 16, '..') + '</label>';
                    },
                    function(item) {
                        return '<div class="valueBar market_trend_skin"/></div><span class="valueLiteral">约' + item.value + '</span>';
                    },
                    function(item) {
                        return '<span class="red">' + Math.round(10000*item.upRate)/100 + '%</span>';
                    }
                ],
                //获取并在回调中载入topn数据
                refreshTopn: function(){
                    function onSuccess(response){
                        me.hotWords.words = response.data || {};
                        me.hotWords.topn.refresh(me.hotWords.words);
                        baidu.each(baidu.q('market_trend_skin', baidu.g(me.hotWords.domId)), function(item){
                            baidu.addClass(item, 'skin_type_' + marketTrend.control.businessDivide.data.currentIndex);
                        });
                    }
                    var params = {
                        industryID: marketTrend.control.businessDivide.data.business[me.data.businessIndex].id,
                        onSuccess: onSuccess,
                        onFail: function(response){
                            var errorStr;
                            if (response.errorCode && response.errorCode.code && (response.errorCode.code == 10002)) {
                                errorStr = '暂时没有推荐';
                            }
                            else {
                                errorStr = '暂时没有数据';
                            }
                            
                            baidu.q('rank_rec_body', baidu.g(me.hotWords.domId))[0].innerHTML = '<div class="rank_rec_fail_wrapper">'
                               + errorStr + '</div>';
                        }
                    };
                    fbs.mktinsight.getBusinessHotWords(params);
                },
                onAddWord: function(datasource){
                	var words = [];
                	var len = datasource.length;
                	for (var i = 0; i < len; i ++) {
                		words.push(datasource[i].keyword);
                	}
                	
                	marketTrend.log.add('hotWords', {
	                	words: words.join(',')
	                });
                },
                onAddWordSuccess: function(datasource){
                	var words = [];
                	var len = datasource.length;
                	for (var i = 0; i < len; i ++) {
                		words.push(datasource[i].word);
                	}
                	
                	marketTrend.log.addSuccess('hotWords', {
	                	words: words.join(',')
	                });
                },
                onDownload: function(){
                	marketTrend.log.download('hotWords');
                }
        	};
        	if (!me.hotWordsDialog) {
        		me.hotWordsDialog = ui.Dialog.factory.create({
	                id: 'hotWords',
	                title: '行业旺季词',
	                auto_show: true,
	                ok_button: false,
	                cancel_button: false
	            });
        	} else {
        		me.hotWordsDialog.show();
        	}
        	
            me.hotWords = new rankRec(options);
            $('#ctrldialoghotWordsbody .rank_rec_foot')[0].appendChild(fc.create('<a id="hotWordsDownloadAll" class="download_more_words" href="#">下载更多词包</a>'));
            document.getElementById('hotWordsDownloadAll').onclick = function(){
                var params = {fileName: me.hotWords.downloadName, moreWords: true, industryID: marketTrend.control.businessDivide.data.business[me.data.businessIndex].id};
                var form = baidu.q('download_words_form', baidu.g(me.hotWords.domId))[0];
                form['userid'].value = nirvana.env.USER_ID;
                form['params'].value = baidu.json.stringify(params);
                
                marketTrend.log.downloadAll('hotWords');
                
                form.submit();
                
                return false;
            }
            
            marketTrend.log.click('hotWords');
            
            return false;
        }
        
        
        //修改预算
        baidu.g('businessHotBudgetBtn').onclick = function() {
            manage.budget.openSubAction({ //此方法可查看budget.js
                type : 'useracct',
                bgttype : 0,
                planid : [],
                onMod : function(option){
                	marketTrend.log.mod('budget', option);
                }
            });
            
            marketTrend.log.click('budget');
            
            return false;
        };
        
        
        //查看行业提价词
        baidu.g('businessHotWordRaisedBtn').onclick = function(){
        	var options = {
                domId: 'ctrldialograisedWordsbody',
                givenId: 'raisedWords',
                titleArray: ['关键词', '同行关注度', '建议'],
                oringinKeys: ['word', 'value', 'upRate'],
                barKey: 'value',
                downloadKeys: [
                    function(item) {
                        return item.word;
                    },
                    function(item) {
                        return item.value/100 + '%';
                    },
                    function(item) {
                        var tipArray = ['建议购买', '已购买'];
                        return tipArray[item.upRate];
                    }
                ],
                downloadName: 'priceup',
                oringinValues: [
                    function(item) {
                        var randomID = er.random();
                        item.randomID = randomID;
                        return '<input type="checkbox" id="randomID_' + randomID +
                        '"/>&nbsp;<label for="randomID_' + randomID +
                        '" title="' + item.word + '">' + getCutString(item.word, 16, '..') + '</label>';
                    },
                    function(item) {
                        return '<div class="valueBar market_trend_skin"/></div><span class="valueLiteral">约' + item.value/100 + '%</span>';
                    },
                    function(item) {
                        var tipArray = ['建议购买', '已购买'];
                        return tipArray[item.upRate];
                    }
                ],
                //获取并在回调中载入topn数据
                refreshTopn: function(){
                    function onSuccess(response){
                        me.raisedWords.words = response.data || {};
                        me.raisedWords.topn.refresh(me.raisedWords.words);
                        baidu.each(baidu.q('market_trend_skin', baidu.g(me.raisedWords.domId)), function(item){
                            baidu.addClass(item, 'skin_type_' + marketTrend.control.businessDivide.data.currentIndex);
                        });
                    }
                    var params = {
                        industryID: marketTrend.control.businessDivide.data.business[me.data.businessIndex].id,
                        onSuccess: onSuccess,
                        onFail: function(response){
                            var errorStr;
                            if (response.errorCode && response.errorCode.code && (response.errorCode.code == 10002)) {
                                errorStr = '暂时没有推荐';
                            }
                            else {
                                errorStr = '暂时没有数据';
                            }
                            
                            baidu.q('rank_rec_body', baidu.g(me.raisedWords.domId))[0].innerHTML = '<div class="rank_rec_fail_wrapper">'
                               + errorStr + '</div>';
                        }
                    };
                    fbs.mktinsight.getBusinessRaisedWords(params);
                },
                onAddWord: function(datasource){
                	var words = [];
                	var len = datasource.length;
                	for (var i = 0; i < len; i ++) {
                		words.push(datasource[i].keyword);
                	}
                	
                	marketTrend.log.add('raisedWords', {
	                	words: words.join(',')
	                });
                },
                onAddWordSuccess: function(datasource){
                	var words = [];
                	var len = datasource.length;
                	for (var i = 0; i < len; i ++) {
                		words.push(datasource[i].word);
                	}
                	
                	marketTrend.log.addSuccess('raisedWords', {
	                	words: words.join(',')
	                });
                },
                onDownload: function(){
                	marketTrend.log.download('raisedWords');
                }
            };
            
        	if (!me.raisedWordsDialog) {
	        	me.raisedWordsDialog = ui.Dialog.factory.create({
	                id: 'raisedWords',
	                title: '提价关键词',
	                auto_show: true,
	                ok_button: false,
	                cancel_button: false
	            });
        	} else {
        		me.raisedWordsDialog.show();
        	}
            
	        me.raisedWords = new rankRec(options);
        	
            marketTrend.log.click('raisedWords');
            
            return false;
        }
        
        //查看行业新购词
        baidu.g('businessHotWordBoughtBtn').onclick = function(){
        	var options = {
                domId: 'ctrldialogboughtWordsbody',
                givenId: 'boughtWords',
                titleArray: ['关键词', '检索量'],
                oringinKeys: ['word', 'value'],
                barKey: ['value'],
                downloadKeys: [
                    function(item) {
                        return item.word;
                    },
                    function(item) {
                        return item.value;
                    }
                ],
                downloadName: 'peerbuy',
                oringinValues: [
                    function(item) {
                        var randomID = er.random();
                        item.randomID = randomID;
                        return '<input type="checkbox" id="randomID_' + randomID +
                        '"/>&nbsp;<label for="randomID_' + randomID +
                        '" title="' + item.word + '">' + getCutString(item.word, 16, '..') + '</label>';
                    },
                    function(item) {
                        return '<div class="valueBar market_trend_skin"/></div><span class="valueLiteral">约' + item.value + '</span>';
                    }
                ],
                //获取并在回调中载入topn数据
                refreshTopn: function(){
                    function onSuccess(response){
                        me.boughtWords.words = response.data || {};
                        me.boughtWords.topn.refresh(me.boughtWords.words);
                        baidu.each(baidu.q('market_trend_skin', baidu.g(me.boughtWords.domId)), function(item){
                            baidu.addClass(item, 'skin_type_' + marketTrend.control.businessDivide.data.currentIndex);
                        });
                    }
                    var params = {
                        industryID: marketTrend.control.businessDivide.data.business[me.data.businessIndex].id,
                        onSuccess: onSuccess,
                        onFail: function(response){
                            var errorStr;
                            if (response.errorCode && response.errorCode.code && (response.errorCode.code == 10002)) {
                                errorStr = '暂时没有推荐';
                            }
                            else {
                                errorStr = '暂时没有数据';
                            }
                            
                            baidu.q('rank_rec_body', baidu.g(me.boughtWords.domId))[0].innerHTML = '<div class="rank_rec_fail_wrapper">'
                               + errorStr + '</div>';
                        }
                    };
                    fbs.mktinsight.getBusinessBoughtWords(params);
                },
                onAddWord: function(datasource){
                	var words = [];
                	var len = datasource.length;
                	for (var i = 0; i < len; i ++) {
                		words.push(datasource[i].keyword);
                	}
                	
                	marketTrend.log.add('boughtWords', {
	                	words: words.join(',')
	                });
                },
                onAddWordSuccess: function(datasource){
                	var words = [];
                	var len = datasource.length;
                	for (var i = 0; i < len; i ++) {
                		words.push(datasource[i].word);
                	}
                	
                	marketTrend.log.addSuccess('boughtWords', {
	                	words: words.join(',')
	                });
                },
                onDownload: function(){
                	marketTrend.log.download('boughtWords');
                }
            };
            
            if (!me.boughtWordsDialog) {
            	me.boughtWordsDialog = ui.Dialog.factory.create({
	                id: 'boughtWords',
	                title: '新购关键词',
	                auto_show: true,
	                ok_button: false,
	                cancel_button: false
	            });
            } else {
            	me.boughtWordsDialog.show();
            }
            
            me.boughtWords = new rankRec(options);
            
            marketTrend.log.click('boughtWords');
            
            return false;
        }
    },
    fillNum: function(){
        var me = this;
        baidu.g('businessHotRaise').innerHTML 
            = Math.round(10000*marketTrend.control.businessDivide.data.business[me.data.businessIndex].hotIncrease)/100;
        if ((me.data.hot.budgetPercent || (me.data.hot.pricedPercent == 0)) 
        	&& (me.data.hot.budgetRaised || (me.data.hot.budgetRaised == 0))) {
            baidu.show('businessHotBudget');
            baidu.q('contender_percent', baidu.g('businessHotBudget'))[0].innerHTML = Math.round(10000*me.data.hot.budgetPercent)/100;
            baidu.q('n', baidu.g('businessHotBudget'))[0].style.width = Math.round(10000*me.data.hot.budgetPercent)/100 + '%';
            baidu.q('raise_percent', baidu.g('businessHotBudget'))[0].innerHTML = Math.floor(100*me.data.hot.budgetRaised)/100;
            
            marketTrend.log.show('budget');
        }
        else {
            baidu.hide('businessHotBudget');
        }
        
        if (me.data.hot.pricedPercent || (me.data.hot.pricedPercent == 0)) {
            baidu.show('businessHotWordPrice');
            baidu.q('contender_percent', baidu.g('businessHotWordPrice'))[0].innerHTML = Math.round(10000*me.data.hot.pricedPercent)/100;
            baidu.q('n', baidu.g('businessHotWordPrice'))[0].style.width = Math.round(10000*me.data.hot.pricedPercent)/100 + '%';
            
            marketTrend.log.show('raisedWords');
        }
        else {
            baidu.hide('businessHotWordPrice');
        }
        
        if (me.data.hot.increasedPercent || (me.data.hot.increasedPercent == 0)) {
            baidu.show('businessBuyWordNum');
            baidu.q('contender_percent', baidu.g('businessBuyWordNum'))[0].innerHTML = Math.round(10000*me.data.hot.increasedPercent)/100;
            baidu.q('n', baidu.g('businessBuyWordNum'))[0].style.width = Math.round(10000*me.data.hot.increasedPercent)/100 + '%';
            
            marketTrend.log.show('boughtWords');
        }
        else {
            baidu.hide('businessBuyWordNum');
        }
    },
    onFail: function(){
        baidu.addClass(baidu.q('business_trend_hot')[0], 'hide');
    }
};
})($$);
