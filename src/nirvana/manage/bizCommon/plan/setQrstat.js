/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    manage/setQrstat.js
 * desc:    设置搜索意图定位
 * author: 	zhouyu
 * date:    $Date: 2012/1/16 $
 */

/**
 * 修改创意展现方式
 */
manage.setQrstat = new er.Action({	
	VIEW: 'setPlanQrstat',
	
	IGNORE_STATE : true,	
	/**
	 * 保存
	 */
	onafterrender : function(){
		var me = this;
		ui.util.get("qrstatOk").onclick = function(){
			var modifyData = {}, 
				planid = me.arg.planid, 
				qrstat = ui.util.get("qrstatOpt").getGroup().getValue();
			for (var i = 0, l = planid.length; i < l; i++) {
				modifyData[planid[i]] = {
					"qrstat1": qrstat
				};
			}
			fbs.plan.modRegion({
				planid: me.arg.planid,
				qrstat1: qrstat,
				onSuccess: function(data){
				//	fbs.material.clearCache("planinfo");
					fbs.material.ModCache("planinfo", "planid", modifyData);
					er.controller.fireMain('reload', {});
					me.onclose();
				},
				onFail: function(data){
					me.onclose();
				}
			});
		};
		ui.util.get("qrstatCancel").onclick = function(){
			me.onclose();
		};	
	}
}); 