/**
 * 市场风向标   时段分布模块
 * @author mayue@baidu.com
 */
(function($){

marketTrend.time = new marketTrend.moduleBase({
    id: 'marketTime',
    tip: '为您分析投放与未投放的时段在行业中的变化'
});
var timeExtend =  {
    data: {
        requestType: '',
        currentType: '',
        businessIndex: 0,
        flashWidth: 800,
        failFlag: false,
        hour: {}
    },
    //恢复默认数据
    revertData: function(){
        this.data = {
            requestType: '',
	        currentType: '',
	        businessIndex: 0,
	        flashWidth: 800,
	        failFlag: false,
	        hour: {}
        }
    },
    init: function(businessIndex){
        var me = this;
        me.data.requestType = 'init';
        me.data.businessIndex = businessIndex;
        
        //类的功能，初始化模块外围结构
        me.initTitle(businessIndex);
        me.initTip();
        
        me.initDiagramWidth();
        
        baidu.hide('timeWeekAnalyze');
        baidu.hide('timeWeekendAnalyze');
        
        //设置tab中工作日为选中
        baidu.dom.addClass($('#timeTabControl a')[1], 'current_tab');
        
        function callback(){
            //初始化工作日模块
            marketTrend.time.checkTab('weekday');
            
            me.initEvents();
        }
        
        me.fetch(callback);
    },
    refresh: function(businessIndex){
        var me = this;
        me.data.requestType = 'refresh';
        me.data.businessIndex = businessIndex;
        //类的功能，初始化模块外围结构
        me.initTitle(businessIndex);
        
        //设置tab中工作日为选中，初始化工作日模块
        me.removeTabClass();
        baidu.dom.addClass($('#timeTabControl a')[1], 'current_tab');
        
        function callback(){
            me.revertSubModules();
            
            marketTrend.time.checkTab('weekday');
            
            me.initEvents();
        }
        
        me.fetch(callback);
    },
    fetch: function(callback){
        var me = this;
        function onSuccess(response) {
            var data = response.data || {};
            me.data.hour = baidu.object.clone(data);
            
            if (me.data.failFlag) {
                me.onSuccess();
            }
            
            callback();
        };
        var params = {
            industryID: marketTrend.control.businessDivide.data.business[me.data.businessIndex].id,
            callback: me.goNext,
            onSuccess: onSuccess,
            onFail: me.onFail,
			onTimeout: me.goNext
        };
        fbs.mktinsight.getBusinessHour(params);
    },
    initEvents: function(){
        var me = this;
        baidu.on('timeTabControl', 'click', function(e){
            var event = e || window.event;
            var target = event.target || event.srcElement;
            var type = baidu.dom.getAttr(target, 'tabLabel');
            if (type && (type != me.data.currentType)) {
                me.checkTab(baidu.dom.getAttr(target, 'tabLabel'));
                me.removeTabClass();
                baidu.dom.addClass(target, 'current_tab');
                
                marketTrend.log.click('timeTabChange');
            }
            
            return false;
        });
    },
    checkTab: function(type){
        var me = this;
        me.data.currentType = type;
        
        baidu.hide('timeWeekAnalyze');
        baidu.hide('timeWeekdayAnalyze');
        baidu.hide('timeWeekendAnalyze');
        
        baidu.show('time' + type.charAt(0).toUpperCase() + type.slice(1) + 'Analyze');
        
        if (marketTrend.time[type].data.initialized == false) {
            marketTrend.time[type].init();
        }
    },
    initDiagramWidth: function(){
        var bodyWidth = baidu.g('marketBody').offsetWidth;
        this.data.flashWidth = bodyWidth - 400;
    },
    removeTabClass: function(){
        var tabs = $('#timeTabControl a');
        var len = tabs.length;
        for (var i = 0; i < len; i ++) {
            baidu.dom.removeClass(tabs[i], 'current_tab');
        }
    },
    revertSubModules: function(){
        var me = this;
        me.week.data.initialized = false;
        me.weekday.data.initialized = false;
        me.weekend.data.initialized = false;
    },
    goNext: function(){
        var me = marketTrend.time;
        marketTrend.area[me.data.requestType](marketTrend.control.businessDivide.data.currentIndex);
    },
    onFail: function(){
        baidu.removeClass(baidu.q('market_fail_wrapper', baidu.g('marketTime'))[0], 'hide');
        marketTrend.time.data.failFlag = true;
    },
    onSuccess: function(){
        baidu.addClass(baidu.q('market_fail_wrapper', baidu.g('marketTime'))[0], 'hide');
        marketTrend.time.data.failFlag = false;
    },
    dispose: function(){
    	var me = this;
    	me.revertData();
    	me.weekday.revertData();
    	me.weekend.revertData();
    	me.week.revertData();
    }
};

baidu.object.extend(marketTrend.time, timeExtend);

/**
 * 时段模块下的工作日模块 
 */
marketTrend.time.weekday = {
    data: {
        flashId: 'businessWeekdayHour',
        diagramFailFlag: false,
        initialized: false
    },
    revertData: function(){
    	this.data.diagramFailFlag = false;
    	this.data.initialized = false;
    },
    init: function(){
        var me = this;
        //生成Flash
        var mainDom = baidu.g('weekdayDiagram'),
            flashName = 'market_busi_hour_weekday.swf',
            width = marketTrend.time.data.flashWidth,
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
        
        me.initFocused();
        
        if (!baidu.g('weekdayCompeteDegree')) {
            baidu.q('business_time_diagram', 'weekdayDiagramPart')[0].appendChild(
                fc.create(
                    '<div style="display:inline;float:right;margin-right:60px;margin-top:5px">' +
                        '<span>什么是流量占比<span _ui="id:weekdayflowRate;type:Bubble;source:market_flow_rate;"></span></span>' +
                        '<span style="margin-left:5px">什么是竞争度<span _ui="id:weekdayCompeteDegree;type:Bubble;source:market_compete_degree;"></span></span>' +
                    '</div>'
                )
            );
            fc.ui.init(baidu.g('weekdayDiagramPart'));
        }
        
        me.data.initialized = true;
    },
    initFocused: function(){
        var me = this;
        var hourData = baidu.object.clone(marketTrend.time.data.hour);
        function processHour(hour) {
            if (hour > 11) {
                return (hour + 1) - 12;
            }
            else {
                return (hour + 1);
            }
        }
        var hourArray = [
            '00:00-01:00', '01:00-02:00', '02:00-03:00', '03:00-04:00', '04:00-05:00', '05:00-06:00',
            '06:00-07:00', '07:00-08:00', '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
            '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00',
            '18:00-19:00', '19:00-20:00', '20:00-21:00', '21:00-22:00', '22:00-23:00', '23:00-24:00'
        ];
        
        var hottestStr = '<ul class="clearfix">';
        if (hourData.workPV && (hourData.workPV.length >= 3)) {
            for (var i = 0; i < 3; i ++) {
                hottestStr = hottestStr +'<li class="trend_time_hour' + processHour(hourData.workPV[i].time) + '">' 
                    + hourArray[hourData.workPV[i].time] + '</li>';
            }
        }
        else {
            hottestStr　=　hottestStr + '<div class="market_fail_wrapper">'
                + '<span class="market_fail_tip">暂无数据</span>'
                + '</div>';
        }
        hottestStr = hottestStr + '</ul>';
        baidu.g('weekdayHottestHourContent').innerHTML = hottestStr;
        
        var bestStr = '<ul class="clearfix">';
        if (hourData.workCPTPeerMin && (hourData.workCPTPeerMin.length >= 3)) {
            for (var j = 0; j < 3; j ++) {
            	if (hourData.workCPTPeerMin[j].rate) {
	            	bestStr = bestStr +'<li class="trend_time_hour' + processHour(hourData.workCPTPeerMin[j].time) + '">' 
	                    + hourArray[hourData.workCPTPeerMin[j].time] + '</li>';	
            	}
            }
        }
        else {
            bestStr　=　bestStr　+ '<div class="market_fail_wrapper">'
                + '<span class="market_fail_tip">暂无数据</span>'
                + '</div>';
        }
        bestStr = bestStr + '</ul>';
        baidu.g('weekdayBestHourContent').innerHTML = bestStr;
    },
    transLabel: function(array){
        var len = array.length;
        var newArray = [];
        for (var i = 0; i < len; i ++) {
            newArray.push({
               time: array[i].time,
               value: array[i].rate
            });
        }
        return newArray;
    },
    onDiagramFail: function(){
        baidu.removeClass(baidu.q('market_fail_wrapper', baidu.g('weekdayDiagramPart'))[0], 'hide');
        marketTrend.time.weekday.data.diagramFailFlag = true;
    },
    onDiagramSuccess: function(){
        baidu.addClass(baidu.q('market_fail_wrapper', baidu.g('weekdayDiagramPart'))[0], 'hide');
        marketTrend.time.weekday.data.diagramFailFlag = false;
    },
    loadFlashData: function(objectId){
        var me = this;
        var flashData = {};
        var hourData = baidu.object.clone(marketTrend.time.data.hour);
        
        if ((hourData.workPV &&　hourData.workPV.length　> 0) 
            || (hourData.workCPTPeer && hourData.workCPTPeer.length > 0)) {
            
            if (me.data.diagramFailFlag) {
                me.onDiagramSuccess();
            }
            
            function compare(a, b){
                return (a.time - b.time);
            }
            if (hourData.workPV) {
                hourData.workPV.sort(compare);
                flashData.search = me.transLabel(hourData.workPV);
                flashData.search.push({
                    time: 24,
                    value: 0
                });
            }
            if (hourData.workCPTPeer) {
                hourData.workCPTPeer.sort(compare);
                flashData.intensity = me.transLabel(hourData.workCPTPeer);
                flashData.intensity.push({
                    time: 24,
                    value: 0
                });
            }
            if (hourData.workMyHour) {
                hourData.workMyHour.sort(compare);
                flashData.myhour = me.transLabel(hourData.workMyHour);
                flashData.myhour.push({
                    time: 24,
                    value: 0
                });
            }
            
            var flashObject = baidu.swf.getMovie(objectId);
            flashObject.resizeSwf(marketTrend.time.data.flashWidth);
            flashObject.setData(flashData);
        }
        else {
            me.onDiagramFail();
        }
    }
};
/**
 * 时段模块下的周末模块 
 */
marketTrend.time.weekend = {
    data: {
        flashId: 'businessWeekendHour',
        diagramFailFlag: false,
        initialized: false
    },
    revertData: function(){
    	this.data.diagramFailFlag = false;
    	this.data.initialized = false;
    },
    init: function(){
        var me = this;
        //生成Flash
        var mainDom = baidu.g('weekendDiagram'),
            flashName = 'market_busi_hour_weekend.swf',
            width = marketTrend.time.data.flashWidth,
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
        
        me.initFocused();
        
        if (!baidu.g('weekendCompeteDegree')) {
            baidu.q('business_time_diagram', 'weekendDiagramPart')[0].appendChild(
                fc.create(
                    '<div style="display:inline;float:right;margin-right:60px;margin-top:5px">' +
                        '<span>什么是流量占比<span _ui="id:weekendflowRate;type:Bubble;source:market_flow_rate;"></span></span>' +
                        '<span style="margin-left:5px">什么是竞争度<span _ui="id:weekendCompeteDegree;type:Bubble;source:market_compete_degree;"></span></span>' +
                    '</div>'
                )
            );
            fc.ui.init(baidu.g('weekendDiagramPart'));
        }
        
        me.data.initialized = true;
    },
    initFocused: function(){
        var me = this;
        var hourData = baidu.object.clone(marketTrend.time.data.hour);
        function processHour(hour) {
            if (hour > 11) {
                return (hour + 1) - 12;
            }
            else {
                return (hour + 1);
            }
        }
        var hourArray = [
            '00:00-01:00', '01:00-02:00', '02:00-03:00', '03:00-04:00', '04:00-05:00', '05:00-06:00',
            '06:00-07:00', '07:00-08:00', '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
            '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00',
            '18:00-19:00', '19:00-20:00', '20:00-21:00', '21:00-22:00', '22:00-23:00', '23:00-24:00'
        ];
        
        var hottestStr = '<ul class="clearfix">';
        if (hourData.weekendPV && (hourData.weekendPV.length >= 3)) {
            for (var i = 0; i < 3; i ++) {
                hottestStr = hottestStr +'<li class="trend_time_hour' + processHour(hourData.weekendPV[i].time) + '">' 
                    + hourArray[hourData.weekendPV[i].time] + '</li>';
            }
        }
        else {
            hottestStr　=　hottestStr　+ '<div class="market_fail_wrapper">'
                + '<span class="market_fail_tip">暂无数据</span>'
                + '</div>';
        }
        hottestStr = hottestStr + '</ul>';
        baidu.g('weekendHottestHourContent').innerHTML = hottestStr;
        
        var bestStr = '<ul class="clearfix">';
        if (hourData.weekendCPTPeerMin && (hourData.weekendCPTPeerMin.length >= 3)) {
            for (var j = 0; j < 3; j ++) {
            	if (hourData.weekendCPTPeerMin[j].rate) {
	            	bestStr = bestStr +'<li class="trend_time_hour' + processHour(hourData.weekendCPTPeerMin[j].time) + '">' 
	                    + hourArray[hourData.weekendCPTPeerMin[j].time] + '</li>';
            	}
            }
        }
        else {
            bestStr　=　bestStr　+ '<div class="market_fail_wrapper">'
                + '<span class="market_fail_tip">暂无数据</span>'
                + '</div>';
        }
        bestStr = bestStr + '</ul>';
        baidu.g('weekendBestHourContent').innerHTML = bestStr;
    },
    transLabel: function(array){
        var len = array.length;
        var newArray = [];
        for (var i = 0; i < len; i ++) {
            newArray.push({
               time: array[i].time,
               value: array[i].rate
            });
        }
        return newArray;
    },
    onDiagramFail: function(){
        baidu.removeClass(baidu.q('market_fail_wrapper', baidu.g('weekendDiagramPart'))[0], 'hide');
        marketTrend.time.weekend.data.diagramFailFlag = true;
    },
    onDiagramSuccess: function(){
        baidu.addClass(baidu.q('market_fail_wrapper', baidu.g('weekendDiagramPart'))[0], 'hide');
        marketTrend.time.weekend.data.diagramFailFlag = false;
    },
    loadFlashData: function(objectId){
        var me = this;
        var flashData = {};
        var hourData = baidu.object.clone(marketTrend.time.data.hour);
        
        if ((hourData.weekendPV &&　hourData.weekendPV.length　> 0) 
            || (hourData.weekendCPTPeer && hourData.weekendCPTPeer.length > 0)){
            
            if (me.data.diagramFailFlag) {
                me.onDiagramSuccess();
            }
            
            function compare(a, b){
                return (a.time - b.time);
            }
            if (hourData.weekendPV) {
                hourData.weekendPV.sort(compare);
                flashData.search = me.transLabel(hourData.weekendPV);
                flashData.search.push({
                    time: 24,
                    value: 0
                });
            }
            if (hourData.weekendCPTPeer) {
                hourData.weekendCPTPeer.sort(compare);
                flashData.intensity = me.transLabel(hourData.weekendCPTPeer);
                flashData.intensity.push({
                    time: 24,
                    value: 0
                });
            }
            if (hourData.weekendMyHour) {
                hourData.weekendMyHour.sort(compare);
                flashData.myhour = me.transLabel(hourData.weekendMyHour);
                flashData.myhour.push({
                    time: 24,
                    value: 0
                });
            }
            
            var flashObject = baidu.swf.getMovie(objectId);
            flashObject.resizeSwf(marketTrend.time.data.flashWidth);
            flashObject.setData(flashData);
        }
        else {
            me.onDiagramFail();
        }
    }
};
/**
 * 时段模块下的 工作日vs周末 模块
 */
marketTrend.time.week = {
    data: {
        flashId: 'businessWeek',
        failFlag: false,
        initialized: false
    },
    revertData: function(){
    	this.data.failFlag = false;
    	this.data.initialized = false;
    },
    init: function(){
        var me = this;
        //生成Flash
        var mainDom = baidu.g('weekDiagram'),
            flashName = 'market_busi_week.swf',
            width = marketTrend.time.data.flashWidth,
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
        
        me.initFocused();
        
        me.data.initialized = true;
        me.initEvents();
    },
    initEvents: function(){
        var me = this;
        document.getElementById('linkToWeekend').onclick = function(){
            //设置tab中工作日为选中，初始化工作日模块
            marketTrend.time.removeTabClass();
            baidu.dom.addClass($('#timeTabControl a')[2], 'current_tab');
            marketTrend.time.checkTab('weekend');
            return false;
        }
        //查看行业新购词
        baidu.g('weekendFeatureWordBtn').onclick = function(){
        	var options = {
                domId: 'ctrldialogweekendWordsbody',
                givenId: 'weekendWords',
                titleArray: ['关键词', '工作日日均检索量', '周末日均检索量'],
                oringinKeys: ['word', 'value', 'upRate'],
                barKey: ['value', 'upRate'],
                downloadKeys: [
                    function(item) {
                        return item.word;
                    },
                    function(item) {
                        return item.value;
                    },
                    function(item) {
                        return item.upRate;
                    }
                ],
                downloadName: 'weekend',
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
                        return '<div class="valueBar market_trend_skin"/></div><span class="valueLiteral">约' + item.upRate + '</span>';
                    }
                ],
                //获取并在回调中载入topn数据
                refreshTopn: function(){
                    function onSuccess(response){
                        me.weekendWords.words = response.data || {};
                        me.weekendWords.topn.refresh(me.weekendWords.words);
                        baidu.each(baidu.q('market_trend_skin', baidu.g(me.weekendWords.domId)), function(item){
                            baidu.addClass(item, 'skin_type_' + marketTrend.control.businessDivide.data.currentIndex);
                        });
                    }
                    var params = {
                        industryID: marketTrend.control.businessDivide.data.business[marketTrend.time.data.businessIndex].id,
                        onSuccess: onSuccess,
                        onFail: function(response){
                            var errorStr;
                            if (response.errorCode && response.errorCode.code && (response.errorCode.code == 10002)) {
                                errorStr = '暂时没有推荐';
                            }
                            else {
                                errorStr = '暂时没有数据';
                            }
                            
                            baidu.q('rank_rec_body', baidu.g(me.weekendWords.domId))[0].innerHTML = '<div class="rank_rec_fail_wrapper">'
                               + errorStr + '</div>';
                        }
                    };
                    fbs.mktinsight.getWeekendWords(params);
                },
                onAddWord: function(datasource){
                	var words = [];
                	var len = datasource.length;
                	for (var i = 0; i < len; i ++) {
                		words.push(datasource[i].keyword);
                	}
                	
                	marketTrend.log.add('weekendWords', {
	                	words: words.join(',')
	                });
                },
                onAddWordSuccess: function(datasource){
                	var words = [];
                	var len = datasource.length;
                	for (var i = 0; i < len; i ++) {
                		words.push(datasource[i].word);
                	}
                	
                	marketTrend.log.addSuccess('weekendWords', {
	                	words: words.join(',')
	                });
                },
                onDownload: function(){
                	marketTrend.log.download('weekendWords');
                }
            };
        	
            if (!me.weekendWordsDialog) {
	            me.weekendWordsDialog = ui.Dialog.factory.create({
	                id: 'weekendWords',
	                title: '周末关键词',
	                auto_show: true,
	                ok_button: false,
	                cancel_button: false
	            });
            }
            else {
            	me.weekendWordsDialog.show();
            }
            
            me.weekendWords = new rankRec(options);
            $('#ctrldialogweekendWordsbody .rank_rec_foot')[0].appendChild(fc.create('<a id="weekendWordsDownloadAll" class="download_more_words" href="#">下载更多词包</a>'));
            document.getElementById('weekendWordsDownloadAll').onclick = function(){
                var params = {fileName: me.weekendWords.downloadName, moreWords: true, industryID: marketTrend.control.businessDivide.data.business[marketTrend.time.data.businessIndex].id};
                var form = baidu.q('download_words_form', baidu.g(me.weekendWords.domId))[0];
                form['userid'].value = nirvana.env.USER_ID;
                form['params'].value = baidu.json.stringify(params);
                
                marketTrend.log.downloadAll('weekendWords');
                
                form.submit();
                
                return false;
            }
            
            marketTrend.log.click('weekendWords');
            
            return false;
        }
    },
    initFocused: function(){
        var me = this;
        var data = marketTrend.time.data.hour;
        
        var pvCompare = me.getWeekCompare(data.weekPV || []);
        var showCompare = me.getWeekCompare(data.weekShow || []);
        
        baidu.g('businessAveragePVCompare').innerHTML = pvCompare;
        if (typeof pvCompare == 'number') {
        	baidu.q('n', baidu.g('businessAveragePV'))[0].style.width = Math.max(Math.round(100 / (1 + pvCompare)), 15) + '%';
        }
        baidu.g('businessAverageShowCompare').innerHTML = showCompare;
        if (typeof showCompare == 'number') {
        	baidu.q('n', baidu.g('businessAverageShow'))[0].style.width = Math.max(Math.round(100 / (1 + showCompare)), 15) + '%';
        }
        if ((typeof pvCompare == 'number') && (typeof showCompare == 'number') && (showCompare < pvCompare)) {
            baidu.removeClass('weekendBetterTip', 'hide');
        } else {
            baidu.addClass('weekendBetterTip', 'hide');
        }
    },
    /*
     * 根据数组得出周末与工作日平均数的比值 
     * @param array 要分析的数组
     * @return 得出的比值
     */
    getWeekCompare: function(array){
        var weekdayAll = 0;
        var weekendAll = 0;
        var weekdayNum = 0;
        var weekendNum = 0;
        var num = array.length;
        for (var i = 0; i < num; i ++) {
            var date = new Date(array[i].date);
            var day = date.getDay();
            if ((day != 0) && (day != 6)) {
                weekdayNum ++;
                weekdayAll = weekdayAll + array[i].value;
            }
            else {
                weekendNum ++;
                weekendAll = weekendAll + array[i].value;
            }
        }
        if ((weekdayNum == 0) || (weekendNum == 0)) {
            return '-';
        }
        var averageWeekday = weekdayAll/weekdayNum;
        var averageWeekend = weekendAll/weekendNum;
        
        if (averageWeekday == 0) {
            return '-';
        }
        return Math.round(10*(averageWeekend/averageWeekday))/10;
    },
    transLabel: function(array){
        var len = array.length;
        var newArray = [];
        var week = ['日', '一', '二', '三', '四', '五', '六'];
        for (var i = 0; i < len; i ++) {
            var tempDate = new Date(array[i].date);
            newArray.push({
               label: baidu.date.format(tempDate, 'yyyy-MM-dd') + '星期' + week[tempDate.getDay()],
               value: array[i].value
            });
        }
        return newArray;
    },
    onFail: function(){
        baidu.removeClass(baidu.q('market_fail_wrapper', baidu.g('weekDiagramPart'))[0], 'hide');
        marketTrend.time.week.data.failFlag = true;
    },
    onSuccess: function(){
        baidu.addClass(baidu.q('market_fail_wrapper', baidu.g('weekDiagramPart'))[0], 'hide');
        marketTrend.time.week.data.failFlag = false;
    },
    loadFlashData: function(objectId){
        var me = this;
        var flashData = {};
        var hourData = baidu.object.clone(marketTrend.time.data.hour);
        
        if (hourData.weekPV || hourData.weekShow) {
            if (me.data.failFlag) {
                me.onSuccess();
            }
            
            if (hourData.weekPV) {
	            flashData.oldSearch = [];
	            flashData.oldSearch.push({
	                hot: false,
	                data: me.transLabel(hourData.weekPV)
	            });
            }
            if (hourData.weekShow) {
            	flashData.myShow = me.transLabel(hourData.weekShow);
            }
            
            var flashObject = baidu.swf.getMovie(objectId);
            flashObject.resizeSwf(marketTrend.time.data.flashWidth);
            flashObject.setData(flashData);
            if (flashData.oldSearch) {
                flashObject.showOldSearch(true);
            }
            if (flashData.myShow) {
                flashObject.showMyShow(true);
            }
        }
        else {
            me.onFail();
        }
    }
};
})($$);
