/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    account/baseSet.js
 * desc:    账户基本设置
 * author: 	zhouyu
 * date:    $Date: 2011/1/13 $
 */

/**
 * 账户基本设置
 */
manage.acctBaseSet = new er.Action({
	//模板
	VIEW: 'setAcctBase',
	
	IGNORE_STATE : true,
	
	CONTEXT_INITER_MAP : {
		/**
		 * 设置账户其他设置的tab
		 * @param {Object} callback
		 */
		init: function(callback){
			var me = this;
			var tabsText = '';
		    me.setContext("acctSetTab",manage.account.otherSetting.getConfig('tabs'));

			var activeTime = [{
				text:"立即确认",
				value:0
			},{
				text:"24小时内确认",
				value:24				
			},{
				text:"72小时内确认",
				value:72
			}];
			me.setContext("activeTimeSelect",activeTime);
			callback();
		}
		
	},
	
	/**
	 * 获取激活时长，填充到select中
	 * 绑定按钮事件
	 */
	onafterrender : function(){
		var me = this,
			controlMap = me._controlMap;
		fbs.account.getActivetimeout({
			onSuccess:function(data){
				var dat = data.data.listData[0].activetimeout;
				dat = dat ? dat : 24;
				controlMap.activeTime.setValue(dat);
			},
			onFail:function(data){}
		});
		controlMap.setAcctBaseOk.onclick = me.okHandler();
		controlMap.setAcctBaseCancel.onclick = me.cancelHandler();	
		controlMap.acctSetTab.onselect = manage.account.otherSetting.tabClickHandler;
	
	},
	
	

	/**
	 * 保存设置
	 */
	okHandler: function(){
		var me = this;
		return function(){
			fbs.account.modActiveTimeout({
				activetimeout : me._controlMap.activeTime.getValue(),
				onSuccess:function(data){
					baidu.g("acctBaseSeccessTip").innerHTML = "保存成功";
					fbs.account.getActivetimeout.clearCache();//清除cache
				},
				onFail:function(data){
					ajaxFail(0);
				}
			});
		}
	},
	
	/**
	 * 取消设置
	 */
	cancelHandler:function(){
		var me = this;
		return function(){
			me.onclose()
		}
	}
}); 