marketTrend.control = {
	init: function(){
		var me = this;
		me.businessDivide.init();
		me.contender.init();
	}
};
marketTrend.control.businessDivide = {
	data: {
		flashId: 'businessDivide',
		currentIndex: 0,
		business: []
	},
	revertData: function(){
		this.data.currentIndex = 0;
	},
	ui: {
		select: {}
	},
	init: function(){
		var me = this;
		function callback(){
			//处理数据，转化旺季值
			var dataLen = me.data.business.length;
			for (var i = 0; i < dataLen; i ++){
				if (me.data.business[i].hotBegin){
					me.data.business[i].hot = marketTrend.tool.formatHotObject(
						me.data.business[i].hotBegin,
						me.data.business[i].hotEnd
					);
				} else {
					me.data.business[i].hot = {
						ishot: false
					}
				}
				
				//处理本地存储的currentIndex
				//if (FlashStorager.get('defaultBusinessId')) {
					//var currentIndex = FlashStorager.get('defaultBusinessId');
					//if (me.data.business[i].id == currentIndex) {
						//me.data.currentIndex = i;
					//}
				//}
			}
			
			//生成Flash
			var mainDom = baidu.g('businessDivideFlash'),
				flashName = 'market_busi_divide.swf',
				width = 220,
				height = 220;
			
			me.flash = baidu.swf.create({
				id: me.data.flashId,
				url: './asset/swf/' + flashName,
				width: width,
				height: height,
				scale : 'showall',
				wmode : 'opaque',
				allowscriptaccess : 'always'
			}, mainDom);
			
			//设置select下拉选框，注意value值是在数组中的序号
			var businessNum = me.data.business.length;
			if (businessNum > 0) {
				var selectSource = [];
				for (var j = 0; j < businessNum; j++){
					var item = {};
					item.text = me.data.business[j].name;
					item.value = j;
					selectSource.push(item);
				}
				me.ui.select = ui.util.create('Select',{
					id: 'businessSelect',
					width: 250,
					datasource: selectSource
				}, baidu.g('businessSelect'));
				me.ui.select.setValue(me.data.currentIndex);
				
				//展示选中行业的具体值
				me.showBusinessData(me.data.currentIndex);
				
				me.initModules();
				
				me.initEvents();
			}
			else {
				me.onFail();
			}
		};
		
		this.fetch(callback);
	},
	initEvents: function(){
		//Flash加载完成事件，自动回调loadFlashData
		
		//Flash点击事件，自动回调flashClickCallback
		
		//select选择事件
		var me = this;
		me.ui.select.onselect = function(value){
			//FlashStorager.set('defaultBusinessId', me.data.business[value].id);
			var flashObj = baidu.swf.getMovie(me.data.flashId);
			me.data.currentIndex = value;
			flashObj.setDefaultIndex(value);
			me.showBusinessData(value);
			me.refreshModules();
		}
	},
	fetch: function(callback) {
		var me = this;
		function onSuccess(response) {
			var data = response.data || [];
			me.data.business = baidu.object.clone(data);
			callback();
		};
		var params = {
			onSuccess: onSuccess,
			onFail: me.onFail,
			onTimeout: me.onFail
		}
		fbs.mktinsight.getBusinessDivide(params);
	},
	showBusinessData: function(index) {
		var me = this,
			curBusiData = me.data.business[index];
		//行业消费占比
		baidu.g('businessConsumePercent').innerHTML = Math.round(100*curBusiData.percent) + '%';
		//旺季提示
		if (curBusiData.hot && curBusiData.hot.ishot){
			baidu.show('businessHotTip');
			var hotTipText = '';
			if (curBusiData.hot.timeleft != undefined){
				if (curBusiData.hot.timeleft > 0){
					hotTipText = '还有' + curBusiData.hot.timeleft + '天进入旺季';
				} else {
					hotTipText = '旺季中';
				}
			}
			baidu.g('businessHotTipText').innerHTML = hotTipText;
		} else {
			baidu.hide('businessHotTip');
		}
		//具体的展现和点击数据
		baidu.g('businessShowNum').innerHTML = (curBusiData.show || (curBusiData.show == 0)) 
			? ((curBusiData.show >= 100000) ? Math.round(curBusiData.show/1000)/10 + '万' : curBusiData.show) 
			: '-';
		baidu.g('businessShowRate').innerHTML = me.processRateData(curBusiData.showRate); 
		baidu.g('businessClickNum').innerHTML = (curBusiData.click  || (curBusiData.click == 0)) 
			? ((curBusiData.click >= 100000) ? Math.round(curBusiData.click/1000)/10 + '万' : curBusiData.click)  
			: '-';
		baidu.g('businessClickRate').innerHTML = me.processRateData(curBusiData.clickRate);
	},
	processRateData: function(rate){
	    var rateStr;
        rateStr = (rate || rate == 0) 
            ? ((rate >= 0) ? '<span class="divide_rate_up">↑' : '<span class="divide_rate_down">↓') 
                + '<span class="number"> ' + Math.round(1000*Math.abs(rate))/10 + '%' + '</span></span>' 
            : '<span class="divide_rate_down">-</span>';
	    
	    return rateStr;
	},
	//flash各行业被点击时的回调
    flashClickCallback: function(objectId, index){
        var me = this;
        //FlashStorager.set('defaultBusinessId', me.data.business[index].id);
        
        me.ui.select.setValue(index);
        me.showBusinessData(index);
        
        var flashObj = baidu.swf.getMovie(objectId);
        flashObj.setDefaultIndex(index);
        
        if (me.data.currentIndex != index) {
            me.data.currentIndex = index;
            me.refreshModules();
        }
        else {
            marketTrend.log.click('controlFlashCurrentTab');
        }
        
        marketTrend.log.click('controlFlash');
    },
    //初始化下面的各个模块
    initModules: function(){
        var me = this;
        baidu.each(baidu.q('market_trend_skin'), function(item){
            baidu.addClass(item, 'skin_type_' + me.data.currentIndex);
        });
        baidu.each(baidu.q('market_trend_skin_text'), function(item){
            baidu.addClass(item, 'skin_type_text_' + me.data.currentIndex);
        });
        marketTrend.business.init(me.data.currentIndex);
        //marketTrend.time.init(me.data.currentIndex);
        //marketTrend.area.init(me.data.currentIndex);
        //marketTrend.word.init(me.data.currentIndex);
        
        marketTrend.log.queryBusiness();
    },
    //刷新下面的各个模块
    refreshModules: function(){
        var me = this;
        baidu.each(baidu.q('market_trend_skin'), function(item){
            var classValue = baidu.getAttr(item, 'class');
            classValue = classValue.replace(/skin_type_\d/, 'skin_type_' + me.data.currentIndex);
            baidu.setAttr(item, 'class', classValue);
        });
        baidu.each(baidu.q('market_trend_skin_text'), function(item){
            var classValue = baidu.getAttr(item, 'class');
            classValue = classValue.replace(/skin_type_text_\d/, 'skin_type_text_' + me.data.currentIndex);
            baidu.setAttr(item, 'class', classValue);
        });
        marketTrend.business.refresh(me.data.currentIndex);
        //marketTrend.time.refresh(me.data.currentIndex);
        //marketTrend.area.refresh(me.data.currentIndex);
        //marketTrend.word.refresh(me.data.currentIndex);
        
        marketTrend.log.queryBusiness();
    },
    onFail: function(){
        baidu.removeClass(baidu.q('market_fail_wrapper', baidu.q('business_data', baidu.g('marketControl'))[0])[0], 'hide');
        this.hideAll();
    },
    hideAll: function(){
    	baidu.addClass('marketBusiness', 'hide');
    	baidu.addClass('marketTime', 'hide');
    	baidu.addClass('marketArea', 'hide');
    	baidu.addClass('marketWord', 'hide');
    },
	loadFlashData: function(objectId){
		var me = this,
			flashObj = baidu.swf.getMovie(objectId),
			businessNum = me.data.business.length,
			flashSource = {};
		flashSource.data = [];
		for (var i = 0; i < businessNum; i++){
			var item = {};
			if (me.data.business[i].name) {
			    item.label = marketTrend.tool.getShortBusinessName(me.data.business[i].name);
			} else {
				item.label = '';
			}
			item.value = Math.round(100*me.data.business[i].percent);
			item.hot = baidu.object.clone(me.data.business[i].hot);
			flashSource.data.push(item);
		}
		flashSource.defaultIndex = me.data.currentIndex;
		
		flashObj.setData(flashSource);
	},
    dispose: function(){
    	this.revertData();
    	marketTrend.business.dispose();
    	marketTrend.time.dispose();
    	marketTrend.area.dispose();
    }
};
marketTrend.control.contender = {
    data: {
        business: []
    },
    init: function(businessId){
        var me = this;
        function callback(){
            //处理数据，转化旺季值
            var dataLen = me.data.business.length;
            for (var i = 0; i < dataLen; i ++){
                if (me.data.business[i].hotBegin){
                    me.data.business[i].hot = marketTrend.tool.formatHotObject(
                        me.data.business[i].hotBegin,
                        me.data.business[i].hotEnd
                    );
                } else {
                    me.data.business[i].hot = {
                        ishot: false
                    }
                }
            }
            me.fillBusiness();
        }
        me.fetch(callback);
    },
    fetch: function(callback){
        var me = this;
        function onSuccess(response) {
            var data = response.data || [];
            me.data.business = baidu.object.clone(data);
            callback();
        };
        var params = {
            onSuccess: onSuccess,
            onFail: function(response){
                var flag;
                if (response.errorCode && response.errorCode.code && (response.errorCode.code == 10002)) {
                    flag = 1;
                }
                else {
                    flag = 0;
                }
                
                me.onFail(flag);
            },
			onTimeout: me.onFail
        };
        fbs.mktinsight.getPeer(params);
    },
    initEvents: function(){
        var me = this;
        baidu.each(baidu.q('contend_business_word_btn'), function(item){
            item.onclick = function(){
                var index = baidu.getAttr(item, 'businessIndex');
                var businessId = me.data.business[baidu.getAttr(item, 'businessIndex')].id;
                
                var options = {
                    domId: 'ctrldialogpeerWords' + index + 'body',
                    givenId: 'peerWords' + index,
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
                    downloadName: 'peerbusi',
                    downloadIndustry: marketTrend.tool.getShortBusinessName(me.data.business[baidu.getAttr(item, 'businessIndex')].name),
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
                            me['peerWords' + index].words = response.data || {};
                            me['peerWords' + index].topn.refresh(me['peerWords' + index].words);
                            baidu.each(baidu.q('market_trend_skin', baidu.g(me['peerWords' + index].domId)), function(item){
                                baidu.addClass(item, 'skin_type_' + marketTrend.control.businessDivide.data.currentIndex);
                            });
                        }
                        var params = {
                            industryID: businessId,
                            onSuccess: onSuccess,
                            onFail: function(response){
                                var errorStr;
                                if (response.errorCode && response.errorCode.code && (response.errorCode.code == 10002)) {
                                    errorStr = '暂时没有推荐';
                                }
                                else {
                                    errorStr = '暂时没有数据';
                                }
                                
                                baidu.q('rank_rec_body', baidu.g(me['peerWords' + index].domId))[0].innerHTML = '<div class="rank_rec_fail_wrapper">'
                                   + errorStr + '</div>';
                            }
                        };
                        fbs.mktinsight.getPeerWords(params);
                    },
                    onAddWord: function(datasource){
                    	var words = [];
                    	var len = datasource.length;
                    	for (var i = 0; i < len; i ++) {
                    		words.push(datasource[i].keyword);
                    	}
                    	
                    	marketTrend.log.add('peerWords', {
		                	peerBusinessId: businessId,
		                	words: words.join(',')
		                });
                    },
                    onAddWordSuccess: function(datasource){
                    	var words = [];
                    	var len = datasource.length;
                    	for (var i = 0; i < len; i ++) {
                    		words.push(datasource[i].word);
                    	}
                    	
                    	marketTrend.log.addSuccess('peerWords', {
		                	peerBusinessId: businessId,
		                	words: words.join(',')
		                });
                    },
	                onDownload: function(){
	                	marketTrend.log.download('peerWords');
	                }
                };
                if (!me['peerWordsDialog' + index]) {
                	me['peerWordsDialog' + index] = ui.Dialog.factory.create({
	                    id: 'peerWords' + index,
	                    title: '行业热词',
	                    auto_show: true,
	                    ok_button: false,
	                    cancel_button: false
	                });
                } else {
                	me['peerWordsDialog' + index].show();
                }
                
                me['peerWords' + index] = new rankRec(options);
                
                marketTrend.log.click('peerWords', {
                	peerBusinessId: businessId
                });
                
                return false;
            }
        });
    },
    fillBusiness: function(){
        var me = this;
        var tpl = er.template.get('contenderBusinessLi');
        var data = me.data.business;
        var len = data.length;
        var innerText = '';
        if (len != 0) {
            for (var i = 0; i < len; i ++) {
                var hideStr, hotLeft;
                if (data[i].hot.ishot) {
                    hideStr = '';
                    hotLeft = data[i].hot.timeleft ? data[i].hot.timeleft + '天' : '';
                }
                else {
                    hideStr = 'hide';
                    hotLeft = '';
                }
                
                var height, percent;
                if (data[i].percent || (data[i].percent == 0)) {
                    height = Math.round(140*data[i].percent);
                    percent = Math.round(1000*data[i].percent)/10 + '%';
                }
                else {
                    height = 0;
                    percent = '-';
                }
                
                var name = marketTrend.tool.getShortBusinessName(data[i].name);
                var shortName = getCutString(name, 8, '..');
                var businessIndex = i;
                var innerText = innerText + ui.format(tpl, hideStr, hotLeft, height, percent, shortName, name, businessIndex);
            }
        }
        else {
            innerText = '<div class="market_fail_wrapper">'
                + '<span class="market_fail_tip">您的同行没有其他行业推荐</span>'
                + '</div>';
        }
        
        baidu.g('contendBusiness').innerHTML = innerText;
        if (len != 0) {
            me.initEvents();
        }
    },
    /*
     * 同行地域请求失败后的回调
     * @param flag {boolean} 0表示数据异常，1表示没有推荐
     */
    onFail: function(flag){
        var errorStr = flag ? '您的同行没有其他行业推荐' : '暂时没有数据';
        
        var innerText = '<div class="market_fail_wrapper">'
                + '<span class="market_fail_tip">' + errorStr + '</span>'
                + '</div>';
        
        baidu.g('contendBusiness').innerHTML = innerText;
    }
};