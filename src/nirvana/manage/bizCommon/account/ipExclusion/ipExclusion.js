/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    manage/ipExclusion.js
 * desc:    IP排除
 * author: 	zhouyu
 * date:    $Date: 2011/1/13 $
 */

/**
 * 账户IP设置
 */
manage.acctIpExclusion = new er.Action({
	VIEW: 'setAcctIpExclusion',
	
	IGNORE_STATE : true,
	
	/**
	 * 设置tab
	 * @param {Object} callback
	 */
	CONTEXT_INITER_MAP : {
		tabSet: function(callback){
			var me = this;
			me.setContext("ipType","acct");
            me.setContext("ipMaxNum",manage.account.otherSetting.getConfig('ACC_IP_NUM_MAX'));
			var tabsText = '';
			me.setContext("acctSetTab",manage.account.otherSetting.getConfig('tabs'));

			callback();
		}
		
	},
	
	/**
	 * 获取ip，对文本框进行初始化
	 */
	onafterrender : function(){
		var me = this,
			controlMap = me._controlMap;
			
		fbs.account.getIpblack({
			onSuccess:function(data){
				var dat = data.data.listData[0].ipblack;
				if (dat && dat.length > 0) {
					controlMap.acctIpExclusion.addText(dat);
				}
			},
			onFail:function(data){
				ajaxFailDialog();
			}
		});
		//绑定提交事件
		controlMap.acctIpExclusionOk.onclick = function(){
			var iplist = controlMap.acctIpExclusion.getArray();
			fbs.account.modIpExclusion({
				ipblack: iplist,
				onSuccess: function(data){
					baidu.g("ipSaveTip").innerHTML = "保存成功";
					fbs.account.getIpblack.clearCache();//清除cache
				},
				onFail:manage.account.otherSetting.modAccIpFail
			});
		};
		
		controlMap.acctIpExclusionCancel.onclick = function(){me.onclose();}
		//tab切换函数，各个地方统一调一个函数  yanlingling
		controlMap.acctSetTab.onselect = manage.account.otherSetting.tabClickHandler;
    
	}
	
})




manage.planIpExclusion = new er.Action({
	
	VIEW: 'setPlanIpExclusion',
	
	IGNORE_STATE : true,
	
	CONTEXT_INITER_MAP : {
		tabSet: function(callback){
			var me = this;
			me.setContext("ipType", "plan");
            me.setContext("ipMaxNum",fbs.config.IP_NUM_MAX);
			if (!me.arg.type || me.arg.type != "inline") {
				me.setContext("planSetTab", ['基本设置', '计划IP排除', '高级设置']);
			}
			callback();
		}

	},
	
	onafterrender : function(){
		var me = this,
			controlMap = me._controlMap;
		fbs.plan.getIpblack({
			condition:{
				planid:me.arg.planid
			},
			onSuccess:function(data){
				var dat = data.data.listData[0].ipblack;
				if (dat && dat.length > 0) {
					controlMap.planIpExclusion.addText(dat);
				}
			},
			onFail:function(data){
				ajaxFailDialog();
			}
		});
		controlMap.planIpExclusionOk.onclick = function(){
			var iplist = controlMap.planIpExclusion.getArray();
			fbs.plan.modIpExclusion({
				planid:me.arg.planid,
				ipblack: iplist,
				onSuccess: function(data){
					var planids = me.arg.planid,
						modifyData = {};
					for (var i = 0, l = planids.length; i < l; i++) {
						modifyData[planids[i]] = {
							"ipblack":iplist,
							"allipblackcnt": iplist.length
						};
					}
					fbs.material.ModCache("planinfo", "planid", modifyData);
					if (!me.arg.type || me.arg.type != "inline") {
						baidu.g("ipSaveTip").innerHTML = "保存成功";
					}
					else {
						me.onclose();
					}
				},
				onFail: function(data){
					if (data.status != 500) {
						var error = fbs.util.fetchOneError(data), 
							errortip = baidu.g("ipSaveTip"), 
							errorcode;
						errortip.innerHTML = "";
						for (var item in error) {
							errorcode = error[item].code;
							switch (errorcode) {
								case 460:
								case 461:
								case 811:
									errortip.innerHTML = nirvana.config.ERROR.IPEXCLUSION[errorcode];
									break;
							}
						}
					}
					else {
						ajaxFail(0);
					}
				}
			});
		};
		
		controlMap.planIpExclusionCancel.onclick = function(){
			me.onclose();
		}
		
	},
	
	onentercomplete : function(){
		var me = this;
		baidu.setStyle(
            baidu.g('ctrldialogplanSetDialog'), 'height', ''
        );
		if (!me.arg.type || me.arg.type != "inline") {
			me._controlMap.planSetTab.onselect = function(tab){
				if (+tab == 0) {
					nirvana.util.openSubActionDialog({
						id: 'planSetDialog',
						title: '计划其他设置',
						width: 440,
						actionPath: 'manage/planBaseSet',
						params: {
							planid: me.arg.planid
						},
						onclose: function(){
							er.controller.fireMain('reload', {});
						}
					});
				} else if (tab == 2) {
                    nirvana.util.openSubActionDialog({
						id: 'planSetDialog',
						title: '计划其他设置',
						width: 440,
						actionPath: 'manage/planAdvancedSet',
						params: {
							planid: me.arg.planid
						},
						onclose: function(){
							er.controller.fireMain('reload', {});
						}
					});
				}
			}
		}else{
			baidu.hide(me._controlMap.planSetTab.main);
		}
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	}

}); 