/**
 * 市场风向标  地域分布模块
 * @author mayue@baidu.com
 */
(function($){

marketTrend.area = new marketTrend.moduleBase({
    id: 'marketArea',
    tip: '为您分析行业在各个地区的分布变化，以及您和同行的表现'
});
var areaExtend = {
    //修改data结构必须同时修改后面的revertData
    data: {
        businessIndex: 0,
        currentType: '',
        endFlag: false,
        endCount: 0,
        yesterday: {
            mainInited: false,
            contendInited: false,
            mainData: [],
            contendData: []
        },
        sevenday: {
            mainInited: false,
            contendInited: false,
            mainData: [],
            contendData: []
        },
        thirtyday: {
            mainInited: false,
            contendInited: false,
            mainData: [],
            contendData: []
        }
    },
    //恢复默认数据
    revertData: function(){
        this.data = {
            businessIndex: 0,
            currentType: '',
            endFlag: false,
            endCount: 0,
            yesterday: {
                mainInited: false,
                contendInited: false,
                mainData: [],
                contendData: []
            },
            sevenday: {
                mainInited: false,
                contendInited: false,
                mainData: [],
                contendData: []
            },
            thirtyday: {
                mainInited: false,
                contendInited: false,
                mainData: [],
                contendData: []
            }
        }
    },
    requestType: '',
    flashWidth: 800,
    diagramFailFlag: false,
    //地域列表，与上面的data区分开，因为data会在行业切换时revert，而regionList会一直保持
    regionList: {
        initialized: false,
        data: []
    },
    init: function(businessIndex){
        var me = this;
        me.requestType = 'init';
        me.data.businessIndex = businessIndex;
        
        //类的功能，初始化模块外围结构
        me.initTitle(businessIndex);
        me.initTip();
        
        me.initDiagramWidth();
        
        me.initEvents();
        
        baidu.dom.addClass($('#areaRangeControl a')[1], 'current_tab');
        me.checkRange('sevenday');
    },
    refresh: function(businessIndex){
        var me = this;
        me.requestType = 'refresh';
        me.revertData();
        
        me.data.businessIndex = businessIndex;
        
        //类的功能，初始化模块外围结构
        me.initTitle(businessIndex);
        
        me.removeTabClass();
        baidu.dom.addClass($('#areaRangeControl a')[1], 'current_tab');
        me.checkRange('sevenday');
    },
    initEvents: function(){
        var me = this;
        baidu.on('areaRangeControl', 'click', function(e){
            var event = e || window.event;
            var target = event.target || event.srcElement;
            
            var type = baidu.dom.getAttr(target, 'tabLabel');
            if (type && (type != me.data.currentType)) {
                me.removeTabClass();
                baidu.dom.addClass(target, 'current_tab');
                me.checkRange(type);
                
                marketTrend.log.click('areaTabChange');
            }
        });
        
        me.initRegionReset();
    },
    fetch: function(callback, type){
        var me = this;
        function onSuccess(response) {
            var data = response.data || [];
            me.data[type].mainData = baidu.object.clone(data);
            
            if (me.diagramFailFlag) {
                me.onDiagramSuccess();
            }
            
            callback();
        };
        var typeToIndex = {
            yesterday: 0,
            sevenday: 1,
            thirtyday: 8
        };
        var params = {
            starttime:  baidu.date.format(nirvana.util.dateOptionToDateValue(typeToIndex[type]).begin, 'yyyy-MM-dd'),
            endtime:  baidu.date.format(nirvana.util.dateOptionToDateValue(typeToIndex[type]).end, 'yyyy-MM-dd'),
            industryID: marketTrend.control.businessDivide.data.business[me.data.businessIndex].id,
            callback: me.onRequestEnd,
            onSuccess: onSuccess,
            onFail: me.onDiagramFail,
            onTimeout: me.onRequestEnd
        };
        fbs.mktinsight.getBusinessArea(params);
    },
    fetchContend: function(callback, type){
        var me = this;
        function onSuccess(response) {
            var data = response.data || [];
            me.data[type].contendData = baidu.object.clone(data);
            
            callback();
        };
        var typeToIndex = {
            yesterday: 0,
            sevenday: 1,
            thirtyday: 8
        };
        var params = {
            starttime: baidu.date.format(nirvana.util.dateOptionToDateValue(typeToIndex[type]).begin, 'yyyy-MM-dd'),
            endtime: baidu.date.format(nirvana.util.dateOptionToDateValue(typeToIndex[type]).end, 'yyyy-MM-dd'),
            industryID: marketTrend.control.businessDivide.data.business[me.data.businessIndex].id,
            callback: me.onRequestEnd,
            onSuccess: onSuccess,
            onFail: function(response){
                var flag;
                if (response.errorCode && response.errorCode.code && (response.errorCode.code == 10002)) {
                    flag = 1;
                }
                else {
                    flag = 0;
                }
                
                me.onContendFail(flag);
            },
            onTimeout: me.onRequestEnd
        };
        fbs.mktinsight.getBusinessAreaContend(params);
    },
    initRegionReset: function(){
        var me = this;
        //推广地域设置
        baidu.g('mktModifyAcctRegion').onclick = function(){
            nirvana.util.openSubActionDialog({
                id : 'accountRegionDialog',
                title : '账户推广地域',
                width : 440,
                actionPath : 'manage/region',
                params : {
                    type: 'account',
                    //wregion: me.regionList.initialized ? me.regionList.data : null,
                    onok: function(chosenRegion){
                        if (chosenRegion.length == 0) {
                            chosenRegion = [
                                "1", "3", "13", "26", "22", "21", "18", "15", "2", "19", "32", "9",
                                "5", "20", "25", "14", "16", "17", "4", "8", "12", "33", "28", "10",
                                "31", "29", "27", "11", "24", "23", "30", "34", "36", "35"
                            ];
                        }
                        
                        for (var i = 0; i < chosenRegion.length; i ++) {
                            if ((chosenRegion[i] == '7') || (chosenRegion[i] == '37')) {
                                chosenRegion.splice(i, 1);
                                i --;
                            }
                        }
                        
                        me.regionList.initialized = true;
                        me.regionList.data = chosenRegion;
                        var flashObject =  baidu.swf.getMovie(me.getFlashName(me.data.currentType));
                        if (flashObject && flashObject.setBidding) {
                            flashObject.setBidding({
                                data: me.transFlashRegion(chosenRegion)
                            });
                        }
                    },
                    onMod : function(option){
                        marketTrend.log.mod('region', option);
                    }
                },
                onclose : function(){
                    
                }
            });
            clearTimeout(nirvana.subaction.resizeTimer);
            baidu.g('ctrldialogaccountRegionDialog').style.top = baidu.page.getScrollTop() + 135 +'px';
            
            marketTrend.log.click('region');
            return false;
        };
    },
    initDiagramWidth: function(){
        var bodyWidth = baidu.g('marketBody').offsetWidth;
        baidu.g('areaRangeControl').style.width = (bodyWidth - 394) + 'px';
        this.flashWidth = bodyWidth - 400;
    },
    //选中某个时间范围后的操作
    checkRange: function(type){
        var me = this;
        me.data.currentType = type;
        if (!me.data[type].mainInited) {
            function callback(){
                me.data[type].mainInited = true;
                me.setRangeData(type);
            }
            me.fetch(callback, type);
        }
        else {
            me.setRangeData(type);
            if (me.diagramFailFlag) {
                me.onDiagramSuccess();
            }
        }
        
        if (!me.data[type].contendInited) {
            function contendCallback(){
                me.data[type].contendInited = true;
                me.showContendFocused(type);
            }
            me.fetchContend(contendCallback, type);
        }
        else {
            me.showContendFocused(type);
        }
    },
    //将某时间范围的数据放入页面结构,type=yesterday/sevenday/thirtyday
    setRangeData: function(type){
        var me = this;
        me.initFlash(type);
        me.showFocused(type);
    },
    //用相应时段的数据初始化flash
    initFlash: function(type){
        //生成Flash
        var me = this;
        var mainDom = baidu.g('businessAreaDiagram'),
            flashName = 'market_busi_area.swf',
            width = me.flashWidth,
            height = 400;

        me.flash = baidu.swf.create({
            id: me.getFlashName(type),
            url: './asset/swf/' + flashName,
            width: width,
            height: height,
            scale : 'showall',
            wmode : 'opaque',
            allowscriptaccess : 'always'
        }, mainDom);
    },
    getFlashName: function(type){
        return type + 'AreaDiagram';
    },
    //用相应时段的数据初始化右侧解读
    showFocused: function(type){
        var me = this;
        var mainData = me.data[type].mainData;
        var inner = '';
        var areaNum = mainData.length;
        if (areaNum > 0) {
            for (var i = 0; i < Math.min(areaNum, 3); i ++) {
                inner = inner 
                    + '<li>' 
                    +     nirvana.config.region[mainData[i].id][0]
                    + '</li>';
            }
        }
        else {
            inner = '<div class="market_fail_wrapper">'
                + '<span class="market_fail_tip">暂无数据</span>'
                + '</div>';
        }
        
        $('#businessHottesAreaContent ul')[0].innerHTML = inner;
    },
    showContendFocused: function(type){
        var me = this;
        var contendData = me.data[type].contendData;
        
        var inner = '';
        var areaNum = contendData.length;
        if (areaNum > 0) {
            for (var i = 0; i < Math.min(areaNum, 3); i ++) {
                inner = inner 
                    + '<li>' 
                    +     nirvana.config.region[contendData[i].id][0]
                    +     '<span>' + Math.round(100*(contendData[i].value)) + '%同行</span>'
                    + '</li>';
            }
        }
        else {
            inner = '<div class="market_fail_wrapper">'
                + '<span class="market_fail_tip">您的同行没有其他地域推荐</span>'
                + '</div>';
        }
        
        $('#businessContendArea ul')[0].innerHTML = inner;
    },
    removeTabClass: function(){
        var tabs = $('#areaRangeControl a');
        var len = tabs.length;
        for (var i = 0; i < len; i ++) {
            baidu.dom.removeClass(tabs[i], 'current_tab');
        }
    },
    //获取并传递投放地域数据给flash
    initRegion: function(flashObject){
        var me = this;
        if (me.regionList.initialized == false) {
            //获取账户层级地域
            fbs.account.getWregion({
                onSuccess: function(response){
                	if (response.data) {
	                    var acctRegion = response.data.listData[0].wregion;
	                    acctRegion = (acctRegion == "") 
	                        ? [
	                            "1", "3", "13", "26", "22", "21", "18", "15", "2", "19", "32", "9",
	                            "5", "20", "25", "14", "16", "17", "4", "8", "12", "33", "28", "10",
	                            "31", "29", "27", "11", "24", "23", "30", "34", "36", "35"
	                        ] 
	                        : acctRegion.split(',');
	                    
	                    for (var i = 0; i < acctRegion.length; i ++) {
                            if ((acctRegion[i] == '7') || (acctRegion[i] == '37')) {
                                acctRegion.splice(i, 1);
                                i --;
                            }
                        }
	                    
	                    me.regionList.initialized = true;
	                    me.regionList.data = acctRegion;
	                    
	                    flashObject.setBidding({
	                        data: me.transFlashRegion(acctRegion)
	                    });
                	}
                },
                onFail: function(data){
                    ajaxFailDialog();
                }
            });
        }
        else {
            flashObject.setBidding({
                data: me.transFlashRegion(me.regionList.data)
            });
        }
    },
    /**
     * 将地域数组转化为flash需要的格式   
     * @param regionArray {array}
     * @return transedArray {array}
     */
    transFlashRegion: function(regionArray){
        var transedArray = [];
        var len = regionArray.length;
        for (var i = 0; i < len; i ++) {
            transedArray.push({
                name: nirvana.config.region[regionArray[i]][0],
                isBidding: true
            });
        }
        return transedArray;
    },
    /**
     * 将请求得到的地域数组转化为flash setData需要的格式   
     * @param rawArray {array}
     * @return newArray {array}
     */
    transRegionData: function(rawArray){
        var newArray = [];
        var len = rawArray.length;
        for (var i = 0; i < len; i ++) {
            newArray.push({
                name: nirvana.config.region[rawArray[i].id][0],
                epvRate: rawArray[i].epvRate ? Math.round(10000*rawArray[i].epvRate)/100 : '-',
                acp: rawArray[i].acp ? Math.round(100*rawArray[i].acp)/100 : '-'
            });
        }
        return newArray;
    },
    /*
     * 同行地域请求失败后的回调
     * @param flag {boolean} 0表示数据异常，1表示没有推荐
     */
    onContendFail: function(flag){
        var errorStr = flag ? '您的同行没有其他地域推荐' : '暂时没有数据';
        
        var inner = '<div class="market_fail_wrapper">'
                + '<span class="market_fail_tip">' + errorStr + '</span>'
                + '</div>';
        
        $('#businessContendArea ul')[0].innerHTML = inner;
    },
    onDiagramFail: function(){
        baidu.removeClass(baidu.q('market_fail_wrapper', baidu.q('area_diagram_frame', baidu.g('marketArea'))[0])[0], 'hide');
        baidu.removeClass(baidu.q('market_fail_wrapper', baidu.g('businessHottesAreaContent'))[0], 'hide');
        marketTrend.area.diagramFailFlag = true;
    },
    onDiagramSuccess: function(){
        baidu.addClass(baidu.q('market_fail_wrapper', baidu.q('area_diagram_frame', baidu.g('marketArea'))[0])[0], 'hide');
        baidu.addClass(baidu.q('market_fail_wrapper', baidu.g('businessHottesAreaContent'))[0], 'hide');
        marketTrend.area.diagramFailFlag = false;
    },
    onRequestEnd: function(){
        var me = marketTrend.area;
        if (!me.data.endFlag) {
            me.data.endCount ++;
            if (me.data.endCount == 2) {
                me.goNext();
                me.data.endFlag = true;
            }
        }
    },
    goNext: function(){
        var me = this;
        marketTrend.word[me.requestType](marketTrend.control.businessDivide.data.currentIndex);
    },
    loadFlashData: function(objectId){
        var end = objectId.indexOf('AreaDiagram');
        var type = objectId.slice(0, end);
        
        var me = this;
        var flashObject = baidu.swf.getMovie(objectId);
        flashObject.resizeSwf(me.flashWidth);
        flashObject.setData({
            data: me.transRegionData(me.data[type].mainData)
        });
        
        me.initRegion(flashObject);
    },
    dispose: function(){
        var me = this;
        me.revertData();
        me.diagramFailFlag = false;
        me.regionList = {
            initialized: false,
            data: []
        };
    }
};

baidu.object.extend(marketTrend.area, areaExtend);

})($$);
