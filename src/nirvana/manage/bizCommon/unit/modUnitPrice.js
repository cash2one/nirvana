/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    manage/modUnitPrice.js
 * desc:    修改单元出价
 * author: 	zhouyu
 * date:    $Date: 2011/1/13 $
 */

/**
 *  修改单元出价
 */
manage.modUnitPrice = new er.Action({
	
	VIEW: 'modifyUnitPrice',
	
	IGNORE_STATE : true,
	
	
	CONTEXT_INITER_MAP : {
		init:function(callback){
			var me = this;
			callback();
		}
		
	},
	
	/**
	 * 批量修改则初始化显示<各异>，否则显示单元出价
	 */
	onafterrender : function(){
		var me = this,
            inp = ui.util.get("setUnitPrice"),
			unitbid = me.arg.unitbid,
			datasource = me.arg.datasource;
	    //var action = me.arg.action;
	   
		nirvana.manage.handleMpriceFactorShow(me.arg);
        if (datasource) { // 如果存在数据来源，则表示来自于添加关键词
			var words = datasource.words,
				len = words.length,
				html = [],
				word,
				i;
			
			for (i = 0; i < len; i++) {
				word = words[i];
				
				html.push('<li><h4>关键词：' + word.showword + '</h4>');
				html.push('<p>最低展现价格：<span class="warn">' + word.minbid + '</span>元</p></li>');
			}
			
			baidu.g('KeywordErrorUL').innerHTML = html.join('');
			
			baidu.removeClass('KeywordUnitBid', 'hide');
			baidu.removeClass('KeywordUnitBidTip', 'hide');
			baidu.g('UnitBidTitle').innerHTML = '修改单元出价（元）：';
			// 显示---修改单元出价 忽略      隐藏-----确定 取消
			baidu.removeClass(ui.util.get('KeywordModUnitBid').main, 'hide');
			baidu.removeClass(ui.util.get('KeywordIgnore').main, 'hide');
			baidu.addClass(ui.util.get('modifyUnitPriceOk').main, 'hide');
			baidu.addClass(ui.util.get('modifyUnitPriceCancel').main, 'hide');
			return;
		}
		// 重置文字，避免被上边修改
		baidu.g('UnitBidTitle').innerHTML = '出价：';
		
		if (unitbid.length == 1) {//add by liuyutong@baidu.com
			inp.setValue(unitbid[0]);
		}
		else {
			inp.setValue(nirvana.config.LANG.DIFFERENCE);
			baidu.addClass(inp.main, "set_unit_price_ini");
			inp.main.onfocus = function(){
				baidu.removeClass(inp.main, "set_unit_price_ini");
				inp.setValue("");
				inp.main.onfocus = null;
			}
		}
		//ui.Bubble.init();
	}
	,
	

	
	/**
	 * 事件绑定
	 */
	onentercomplete : function(){
		var me = this;
		
		// 确定 取消
        ui.util.get("setUnitPrice").onenter = me.modifyUnitPriceOk();
		ui.util.get("modifyUnitPriceOk").onclick = me.modifyUnitPriceOk();
		ui.util.get("modifyUnitPriceCancel").onclick = function(){
			me.onclose();
		};
		
		// 修改单元出价 忽略
		ui.util.get('KeywordModUnitBid').onclick = me.modifyUnitPriceOk();
		ui.util.get('KeywordIgnore').onclick = me.ignore();
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},

	/**
	 * 修改出价事件
	 */
	modifyUnitPriceOk: function(){
		var me = this,
			datasource = me.arg.datasource;
		
		return function(){
			var modifyData = {},
				unitids = me.arg.unitid,
				unitbid = ui.util.get("setUnitPrice").getValue();
			for (var i = 0, l = unitids.length; i < l; i++) {
				modifyData[unitids[i]] = {
					"unitbid": unitbid
				};
			}
				
			fbs.unit.modUnitbid({
				unitid: unitids,
				unitbid: unitbid,
				onSuccess:function(data){
					if (datasource) { // 存在来源，则表明来源于KR
						me.skipToKeyword();
						// 没加成功callback onok，请自行考虑是否添加
					} else {
						fbs.material.ModCache("unitinfo","unitid",modifyData);
						fbs.material.ModCache("wordinfo","unitid",modifyData);
						fbs.avatar.getMoniWords.ModCache("unitid",modifyData);
					//	fbs.unit.getInfo.clearCache();
					//	fbs.material.clearCache("unitinfo");
					//	fbs.material.clearCache("wordinfo");
						er.controller.fireMain('reload', {});

						// Added by Leo Wang(wangkemiao@baidu.com)
		                // 添加处理成功的回调函数
		                var onok = me.arg.onok;
		                if (onok && (typeof onok === 'function')) {
		                    onok({
		                    	modifyData : modifyData
		                    });
		                }

						me.onclose();
					}
					
				},
				onFail:me.saveFailHandler()
			});
		}
	},
	
	/**
	 * 修改失败
	 */
	saveFailHandler: function(){
		var me = this;
		return function(data){
			if (data.status != 500) {
				var error = fbs.util.fetchOneError(data),  
					unitprice = baidu.g("priceErrorTip"), 
					errorcode;
				unitprice.innerHTML = "";
				if (error) {
					for (var item in error) {
						errorcode = error[item].code;
						me.displayError(errorcode);
					}
				}
				else {
					me.displayError(data.errorCode.code);
				}
			}else{
				ajaxFail(0);
			}
		}
	},
	
	/**
	 * 显示错误信息
	 * @param {Object} errorcode
	 */
	displayError: function(errorcode){
		var me = this,
			unitprice = baidu.g("priceErrorTip");
		if (errorcode == 505 || errorcode == 507 || errorcode == 508 || errorcode == 509 || errorcode == 506 || errorcode == 599) {
			unitprice.innerHTML = nirvana.config.ERROR.UNIT.PRICE[errorcode];
			unitprice.style.display = "block";
		}
	},
	
	/**
	 * 跳转到关键词的操作
	 */
	skipToKeyword : function() {
        fbs.material.clearCache('unitinfo');
        fbs.material.clearCache('wordinfo');
		this.onclose();        
	},
	
	/**
	 * 忽略，直接进入下一步
	 */
	ignore : function() {
		var me = this;
		
		return function() {
			me.skipToKeyword();
		};
	}
}); 
