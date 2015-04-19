/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    manage/modWordUrl.js
 * desc:    修改关键词匹配方式
 * author: 	zhouyu
 * date:    $Date: 2011/1/26 $
 */

/**
 *  修改关键词URL
 */
manage.modWordUrl = new er.Action({
	
	VIEW: 'modWordUrl',
	
	IGNORE_STATE : true,
	
	/**
	 * 填充ui
	 * @param {Object} callback
	 */
	CONTEXT_INITER_MAP : {
		init:function(callback){
			var me = this;
			callback();
		}
		
	},
	
	/**
	 * 事件绑定
	 */
	onafterrender : function(){
		var me = this,
			controlMap = me._controlMap;
			//add by liuyutong@baidu.com
			if(me.arg.mwurl){//修改移动的
			  me.arg.wurl = me.arg.mwurl;
			}
			if(me.arg.wurl.length==1){
				if(me.arg.shadow_wurl[0]){//影子的时候修改影子的
					controlMap.newWordUrl.setValue(me.arg.shadow_wurl[0].substring(7));
				}else if(me.arg.wurl[0]){
					controlMap.newWordUrl.setValue(me.arg.wurl[0].substring(7));
				}else{
					baidu.addClass(controlMap.newWordUrl.main, "set_unit_price_ini");
					controlMap.newWordUrl.setValue('修改前没有为关键词单独设置链接');
					controlMap.newWordUrl.main.onfocus = function(){
						baidu.removeClass(controlMap.newWordUrl.main, "set_unit_price_ini");
						//console.log(controlMap.newWordUrl)
						controlMap.newWordUrl.setValue("");
						controlMap.newWordUrl.onfocus = null;
					}
				}
			}else{
				
				me.handleActOnUnit(me.arg.unitid) ;
				baidu.addClass(controlMap.newWordUrl.main, "set_unit_price_ini");
				controlMap.newWordUrl.setValue(nirvana.config.LANG.DIFFERENCE);
				controlMap.newWordUrl.main.onfocus = function(){
					baidu.removeClass(controlMap.newWordUrl.main, "set_unit_price_ini");
					//console.log(controlMap.newWordUrl)
					controlMap.newWordUrl.setValue("");
					controlMap.newWordUrl.onfocus = null;
				}
			}
        controlMap.newWordUrl.onenter = me.modWordUrlOk();
		controlMap.modWordUrlOk.onclick = me.modWordUrlOk();
		controlMap.modWordUrlCancel.onclick = function(){
			me.onclose();
		};
		
	},
	
	handleActOnUnit : function(unitset){
		var  actOnUnit = baidu.g('act-on-unit');
		var canAct = baidu.array.unique(unitset).length == 1 ? true:false;
		if(!canAct){
			actOnUnit.disabled = true;
			baidu.removeClass(baidu.g('act-on-unit-tips'),'hide');  
		}else{
			actOnUnit.disabled = false;
			baidu.addClass(baidu.g('act-on-unit-tips'),'hide');
		}		
	},
	
	onentercomplete : function(){
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},

    


	/**
	 * 修改提交
	 */
	modWordUrlOk: function(){
		var me = this,
			controlMap = me._controlMap;
		return function(){
			var winfoids = me.arg.winfoid,
				url = baidu.trim(controlMap.newWordUrl.getValue());
			if(url != "" && url.toUpperCase()!= "HTTP://"){
				url = url;
			}else{
				url = "";
			}
			var reqFunc = fbs.keyword.modWurl;
			if(me.arg.mwurl){//移动url
			    reqFunc = fbs.keyword.modMWurl; 
			}
			var actOnUnit = baidu.g('act-on-unit').checked ? 1 : 0;
			reqFunc({
				winfoid : winfoids,
				wurl: url,
				actonunit : actOnUnit,
				onSuccess:function(data){
					if (data.status != 300) {
						/*var modifyData = {};//应用到该单元的不好modcache，直接清缓存吧。。
						for (var i = 0, l = winfoids.length; i < l; i++) {
						    if(me.arg.mwurl){//移动url
						         modifyData[winfoids[i]] = {
                                        "shadow_mwurl": "http://" + fbs.util.removeUrlPrefix(url)
                                    };  
						        }else{
						          modifyData[winfoids[i]] = {
								        "shadow_wurl": "http://" + fbs.util.removeUrlPrefix(url)
							        };  
						        }
							
						}
						fbs.avatar.getMoniWords.ModCache("winfoid", modifyData);
						*/
						fbs.material.clearCache('wordinfo');
						er.controller.fireMain('reload', {});
                        // wsy 移动优化包-搬家方案-监控需要
                        if(typeof me.arg.callback == 'function') me.arg.callback(url,me.arg.action);
						me.onclose();
						me._sendLog();
					}
				},
				onFail: me.saveFailHandler()
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
					wordurl = baidu.g("modWordUrlErrorTip"), 
					errorcode;
				wordurl.innerHTML = "";
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
			wordurl = baidu.g("modWordUrlErrorTip");
		if (errorcode == 671 || errorcode == 624 || errorcode == 625 || errorcode == 626 || errorcode == 627 || 
				errorcode == 628 || errorcode == 629 || errorcode == 622 || errorcode == 623) {
			wordurl.innerHTML = nirvana.config.ERROR.KEYWORD.URL[errorcode];
			wordurl.style.display = "block";
		}
	},

	/**
	 * 发送监控
	 */ 
	_sendLog : function() {
		var me = this;
		var _type = me.arg.mwurl ? 'mwurl' : 'wurl';
		
		NIRVANA_LOG.send({
			target : 'batch-mod-keyword-url',
			type : _type,
			optulevelid : nirvana.env.OPT_ULEVELID
		})
	}
}); 
