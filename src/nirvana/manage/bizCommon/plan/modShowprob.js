/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    manage/modshowprob.js
 * desc:    修改创意展现方式
 * author: 	zhouyu
 * date:    $Date: 2011/1/13 $
 */

/**
 * 修改创意展现方式
 */
manage.modPlanShowprob = new er.Action({
	
	VIEW: 'modifyPlanShowProb',
	
	IGNORE_STATE : true,
	
	
	CONTEXT_INITER_MAP : {
		init: function(callback){
			var me = this;
			callback();
		}
	},
	
	/**
	 * 保存
	 */
	onafterrender : function(){
		var me = this;
		ui.util.get("showProbOk").onclick = function(){
			var modifyData = {}, 
				planid = me.arg.planid, 
				showprob = ui.util.get("planOpt").getGroup().getValue();
			for (var i = 0, l = planid.length; i < l; i++) {
				modifyData[planid[i]] = {
					"showprob": showprob
				};
			}
			fbs.plan.modShowprob({
				planid: me.arg.planid,
				showprob: showprob,
				onSuccess: function(data){
				//	fbs.material.clearCache("planinfo");
					fbs.material.ModCache("planinfo", "planid", modifyData);
					er.controller.fireMain('reload', {});
					me.onclose();
				},
				onFail: function(data){
				
				}
			});
		};
		ui.util.get("showProbCancel").onclick = function(){
			me.onclose();
		};	
	},
	
	onentercomplete : function(){
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	}
}); 