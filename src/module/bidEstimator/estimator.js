ToolsModule.estimator = new ToolsModule.Action('estimator', {
    VIEW : 'estimator',
    
    STATE_MAP : {
        daymaxbid : '',
		totalNum	: 1,
		pageSize	:	10,
		pageNo      : 1,
		pageTotal  : 1
    },
    
    CONTEXT_INITER_MAP : {
        
        keywordList : function (callback) {
            var materials = this.arg.queryMap.importMaterials, 
                i = 0,data,  len, nameArr = [];
            if(materials && materials.level == 'keyword') {
                data = materials.data;
                len = data.length;
                for(;i < len; i++) {
                    nameArr.push(data[i].showword);
                }
                this.setContext('keywordList', nameArr.join('\n'))
                
            }else {
                this.setContext('keywordList', '')
            }
            callback();
        },
        estimatorResultFields : function (callback) {
            this.setContext('resultTableFields',[
                {
                    content:function (item){
                        //return item.keyword;
                        var title = baidu.encodeHTML(item.keyword),
                            content = getCutString(item.keyword,30,"..");
                        return '<span title="' + title + '">' + content + '</span>';
                    },
                    title: '关键词',
					width	:	110
                },
                {
                    content:function (item){
                        switch(item.status + '') {
                            case '0' : 
                                return '有效';
                                break;
                            case '1' : 
                                return '搜索无效';
                                break;
                            case '2' : 
                                return '有效 数据不足,无法预估';
                                break;
                            case '3' :
                            case '4' :
                            case '5' :
                                return '系统繁忙,请稍后再试';
                                break;
                        }
                    },
                    title: '估算状态',
					width	:	110
                },
                {
                    content:function (item){
                        if(typeof item.daypv_level == 'undefined'){//bug fix by linfeng
                            return '-';
                        }
                        var map = ['低','中','高'];
                        var rank = map[item.daypv_level];
                        return '<span class="pvStatus">' + rank + '</span><span class="percentBar"><span style="width:' + item.showbar_length + '%"></span></span>';
                    },
                    title: '估算检索量',
					width	:	110
                },
                {
                    content:function (item){
                        if(!item.rank_high ) {
                            return '-';
                        }
                        return item.rank_low + '-' +  item.rank_high;
                    },
                    title: '估算排名',
					width	:	110,
					noun	:	true
                },
                {
                    content:function (item){
                        if(!item.dayclk_low && !item.dayclk_high) {
                            return '-';
                        }
                        return item.dayclk_low + '-' + item.dayclk_high;
                    },
                    title: '估算日均点击',
					width	:	110
                }
            ]);
			
            callback();
        },
        
        estimatorRegion : function (callback) {
            this.setContext('checkedRegion', this.getAllRegion());
            callback();
        },
		
		pagination : function (callback){
		    var me = this,
		        pageNo = me.arg.pageNo,
		        totalNum = me.getContext('totalNum'),
		        pageSize = me.getContext('pageSize'),
		        totalPage = Math.ceil(totalNum/pageSize);
		        
		    me.setContext('pageNo', pageNo || me.getContext("pageNo") || 1);
		    me.setContext('pageTotal', totalPage);
		    callback();
		}
        
    },
    
    UI_PROP_MAP : {
        
        // 创意描述一输入框
        keywordsToEstimate : {
            height : '108',
            width : '255'
        },
        
        // 创意标题输入框
        keywordBid : {
            type : 'TextInput',
            height: '24',
            width : '150',
            value: '*daymaxbid'
        },
        
        estimatorRegion : {
            type : 'Region',
            mode : 'multi',
            checked:'*checkedRegion'
        },
        
        setEstimatorRegion : {
            type : 'Button',
            skin : 'shrink_16'
        },
        advanceTipDetailBtn : {
            type : 'Button',
            skin : 'shrink_16'
        },
        
        estimatorResult : {
            type : 'Table', 
            noDataHtml : FILL_HTML.NO_DATA,
            fields: '*resultTableFields',      
            datasource : '*estimatorListData'
        },
        
        estimatorVCode : {
            type : 'TextInput',
            height: '24',
            width : '50'
        }
        
    },
    onafterrender : function () {
        var me = this,
            controlMap = me._controlMap;
        
        controlMap.keywordsToEstimate.textArea.setValue(me.getContext('keywordList'));
		controlMap.keywordsToEstimate.resetLine();
		controlMap.keywordsToEstimate.textAreaScrollBottom();
		
        //初始化地域部分
        me.initRegion();
        me.initAdvanceTip();
        //立即出价
        controlMap.estimateButton.onclick = me.getEstimateResultHandler();
        controlMap.keywordBid.onenter = me.getEstimateResultHandler();
        //请输入验证码
        controlMap.estimatorVCode.disable(true);
        
		//分页
		controlMap.pagination.onselect = me.getPaginationHandler();
		
        baidu.g('refreshVCode').onclick = me.refreshVCode;
        
    },
	
	
    onentercomplete : function(){
		if (this.getContext('estimatorListData')) {
			if (baidu.dom.hasClass('EstimatorResultWrap', 'hidden')) {
				baidu.removeClass('EstimatorResultWrap', 'hidden');
				// 表格重新渲染一下否则,否则显示宽度异常
				/*var table = ui.util.get('estimatorResult');
				table.render(table.main);
				setTimeout(function(){
					ui.util.get('estimatorResult').handleResize();
				},800);*/
			}
		} else {
			baidu.addClass('EstimatorResultWrap', 'hidden');
		}
    },
    
    onafterrepaint : function(){
        //console.log('main.tools onafterrepaint');
    },
    
    initRegion : function () {
        var me = this,
            controlMap = me._controlMap;
        controlMap.estimatorAllRegion.onclick = me.checkAllRegionHandler();
        controlMap.estimatorPartRegion.onclick = me.checkPartRegionHandler();
        controlMap.estimatorRegionOk.onclick = me.saveRegionHandler();
        controlMap.estimatorRegionCancel.onclick = me.toggleRegionArea;
        
        baidu.g('estimatorCloseRegionSet').onclick = me.toggleRegionArea;
        
        controlMap.setEstimatorRegion.onclick = me.toggleRegionArea;
        if(me.getContext('checkedRegion').length != 36){
            controlMap.estimatorPartRegion.setChecked(true);
            controlMap.estimatorRegion.main.style.display = 'block';
        }
    },
    
    initAdvanceTip : function () {
        var me = this,
            controlMap = me._controlMap;
        controlMap.advanceTipDetailBtn.onclick = me.toggleAdvanceDetail;  
        baidu.g('estimatorCloseAdvance').onclick = me.toggleAdvanceDetail;  
        controlMap.gotcha.onclick = me.toggleAdvanceDetail; 
        baidu.g('advanceTipLink').onclick = me.toggleAdvanceDetail;
    },
    
    
    /**
     * 保存所选择的地域到Context
     */
    saveRegionHandler : function () {
        var me = this;
        return function () {
            var controlMap = me._controlMap,
                checkedRegion = controlMap.estimatorRegion.getCheckedRegion(),
                displayRegion = nirvana.manage.region.abbRegion(checkedRegion);
            
            me.setContext('checkedRegion', checkedRegion);
            if(checkedRegion.length == 0){
                displayRegion = '全部地域';
            }
            baidu.g('displayRegion').innerHTML = displayRegion.word;
            baidu.g('displayRegion').title = displayRegion.title;
            me.toggleRegionArea();
        };
    },
    /**
     * 选择全部地域
     */
    checkAllRegionHandler : function () {
        var me = this;
        return function () {
            var controlMap = me._controlMap,
                list = controlMap.estimatorRegion.main;
            controlMap.estimatorAllRegion.setChecked(true);
            me.setContext('checkedRegion', me.getAllRegion());
            
            controlMap.estimatorRegion.checked = me.getAllRegion();
            controlMap.estimatorRegion.fillChecked();
            
            me.setContext('checkedRegion', []);
            list.style.display = "none";
        }
    },
    /**
     * 选择部分地域
     */
    checkPartRegionHandler : function () {
        var me = this;
        return function () {
            var controlMap = me._controlMap,
                list = controlMap.estimatorRegion.main;
            controlMap.estimatorPartRegion.setChecked(true);
            list.style.display = "block";
        }
    },
    /**
     * 开关地域选择区
     */
    toggleRegionArea : function () {

        var regionArea = baidu.g('setEstimatorRegion');
        if(regionArea.style.display != 'none'){
            baidu.hide(regionArea);
        }else{
            regionArea.style.display = 'block'
        }
        return false;
    },
    /**
     * 开关如何设置细节
     */
    toggleAdvanceDetail : function () {
        var advanceTip = baidu.g('advanceTipDetail');
        if(advanceTip.style.display != 'none'){
            baidu.hide(advanceTip);
        }else{
            advanceTip.style.display = 'block'
        }
        return false;
    },
    /**
     * 估算处理器
     */
    getEstimateResultHandler : function () {
        var me = this;
        return function () {
            var param = me.getEstimatorParam();
			
			me.setContext('pageNo', 1);
			me.setContext('totalNum', param.keywords.length);
			me.setContext('estimateParam', param);
			
			if (param.keywords.length > 100) {
				baidu.g('keywordsError').innerHTML = "最大只能输入100个词，请重新输入。";
				baidu.show('keywordsError');
				return false;
			}
			else {
				for (var i = 0, l = param.keywords.length; i < l; i++) {
					if (getLengthCase(param.keywords[i].replace(/["\[\]]/g, '')) > 40) { //符号不计入长度
						baidu.g('keywordsError').innerHTML = "关键词长度不能超过40个字符，请重新输入。";
						baidu.show('keywordsError');
						return false;
					}
				}
			}
            me.hideAllError();
			
			me.getEstimateRequest(param);
        };
    },
    /**
     * 获取参数
     */
    getEstimatorParam : function () {
        var me = this,
            controlMap = me._controlMap,
            param = {},
			uniqueMap = {},
			onlyWord;
        
        param.keywords = controlMap.keywordsToEstimate.getArray();
		
		for(var i = 0; i < param.keywords.length; i++){ //存在splice, length不能缓存
			param.keywords[i] = baidu.decodeHTML(param.keywords[i]);
			
			onlyWord = param.keywords[i];
			//add by linfeng
			param.keywords[i] = param.keywords[i].replace(/</g, '&lt;').replace(/>/g, '&gt;');

			if (onlyWord.substr(0, 1) == '"' && onlyWord.substr(onlyWord.length - 1, 1) == '"') {
				if (onlyWord.substr(1, 1) == '[' && onlyWord.substr(onlyWord.length - 2, 1) == ']') {
					onlyWord = onlyWord.substr(2, onlyWord.length - 4);
				} else {
					onlyWord = onlyWord.substr(1, onlyWord.length - 2);
				}
			} else if (onlyWord.substr(0, 1) == '[' && onlyWord.substr(onlyWord.length - 1, 1) == ']') {
				onlyWord = onlyWord.substr(1, onlyWord.length - 2);
			}
			
			//去掉匹配模式,按字面去重。相同字面情况下使用第一个的匹配模式。
			if(typeof uniqueMap[onlyWord] != 'undefined'){
                param.keywords.splice(i--, 1);
            }
			
			uniqueMap[onlyWord] = true;
		}
		
		
        param.daymaxbid = controlMap.keywordBid.getValue();
        me.setContext('daymaxbid', param.daymaxbid + '');

        if(controlMap.estimatorPartRegion.getChecked()) {
            var checkedRegions = controlMap.estimatorRegion.getCheckedRegion(),
                allRegions = me.getAllRegion();
            if(checkedRegions.length == allRegions.length){
                param.areas = '0';
            }else {
                param.areas = controlMap.estimatorRegion.getCheckedRegion().join(',');
            }
            
        }else {
            param.areas = '0';
        }
        //console.log(param.areas);
        if(!controlMap.estimatorVCode.getState('disabled')){
            param.vcode = controlMap.estimatorVCode.getValue();
        }
        
        param.onSuccess = me.getResultSucessHandler();
        param.onFail = me.getResultFailHandler();
        
        return param; 
    },
	
	getEstimateRequest : function(param){
		var me = this;
		param = baidu.object.clone(param);
		
		//根据当前页码切分请求参数
		var pageNo = me.getContext('pageNo'),
			pageSize = me.getContext('pageSize');
		
		var offset = (pageNo - 1) * pageSize;
		param.keywords = param.keywords.slice(offset, offset + pageSize);
		
        fbs.estimator.getResult(param);
	},
	
    /**
     * 获取估算结果成功
     */
    getResultSucessHandler : function () {
        var me = this;
        return function (data) {
            me.setContext('estimatorListData', data.data);
            me.refresh();
        };
    },
    /**
     * 获取估算结果失败
     */
    getResultFailHandler : function () {
        var me = this;
        return function (data) {
			if (!data.errorCode) { // 没有errorCode，则代表status = 500/600...，系统异常
				ajaxFailDialog();
				return;
			}
            var error = data.errorCode;
			
            //关键词验证
            if(error.keywords == 1402) {
                baidu.g('keywordsError').innerHTML = "请输入关键词";
                baidu.show('keywordsError');
            }else {
                baidu.hide('keywordsError');
            }
			
            //显示验证码
            switch(error.code) {
                case 1400 :
                    me._controlMap.estimatorVCode.disable(false);
                    baidu.g('estimatorVCodeImg').src = 'vcode?src=prv&nocache=' + Math.random();
                    baidu.show('estimatorVCodeWrapper');
                    baidu.g('estimatorVCodeError').innerHTML = "提示：请先输入页面验证码,再进行估算";
                    baidu.show('estimatorVCodeError');
                    break;
                case 1401 :
                    me._controlMap.estimatorVCode.disable(false);
                    baidu.g('estimatorVCodeImg').src = 'vcode?src=prv&nocache=' + Math.random();
                    baidu.show('estimatorVCodeWrapper');
                    baidu.g('estimatorVCodeError').innerHTML = "提示：您输入的验证码不正确,请重新输入";
                    baidu.show('estimatorVCodeError');
                    break;
                case 0 : // AKA验证失败，直接显示message
                	baidu.g('keywordsError').innerHTML = error.message;
                	baidu.show('keywordsError');
                    break;
                default:
                    baidu.hide('estimatorVCodeError');
                        
            }
            //出价验证
			switch (error.daymaxbid) {
				case 1403:
                	baidu.g('keywordBidError').innerHTML = "请填写每次点击最高出价";
                	baidu.show('keywordBidError');
					break;
				case 1404:
                	baidu.g('keywordBidError').innerHTML = "只能填写数字";
                	baidu.show('keywordBidError');
					break;
				case 1405:
                	baidu.g('keywordBidError').innerHTML = "请填写大于0的数字";
                	baidu.show('keywordBidError');
					break;
				// 1406 1407 为前端自定义的errcode
				case 1406:
                	baidu.g('keywordBidError').innerHTML = "出价最多只能保留两位小数";
                	baidu.show('keywordBidError');
					break;
				case 1407:
                	baidu.g('keywordBidError').innerHTML = '出价不能高于' + nirvana.config.NUMBER.BID_MAX + '元';
                	baidu.show('keywordBidError');
					break;
				default:
					baidu.hide('keywordBidError');
					break;
			}
        };
    },
    
    hideAllError : function () {
        baidu.hide('estimatorVCodeError');  
        baidu.hide('keywordBidError');
        baidu.hide('keywordsError');
    },
    
    getAllRegion : function () {
        return [1,2,3,4,5,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37];
    },
    
    refreshVCode : function () {
        baidu.g('estimatorVCodeImg').src = 'vcode?src=prv&nocache=' + Math.random();
        return false;
    },
	
	getPaginationHandler : function(){
		var me = this;
	    return function (pageNo) {
	        me.setContext('pageNo',pageNo);
	        me.getEstimateRequest(me.getContext('estimateParam'));
	    }
	}
});

