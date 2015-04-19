/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: accountOptimizer/decrease/lib.js 
 * desc: 效果突降公用函数库 
 * author: wanghuijun@baidu.com
 * date: $Date: 2011/11/16 $
 */

/**
 * @namespace 账户优化模块
 */

nirvana.decrease = {};

nirvana.decrease.lib = {};

/**
 * 效果突降控制中心
 */
nirvana.decrease.lib.control = {
	// 期初时间
	beginDate : new Date(),
	
	// 期末时间
	endDate : new Date(),
	
	// 是否已经请求了突降日期，突降日期是固定的，所以只请求一次，请求以后置为true
	hasDateType : false,
    
    /**
     * 获得LOG对象的值传递，有参数传入时仅进行传入对象的拷贝
     * @param {Object} json
     */
    getLogParamByVal : function(json){
        var me = this;
        
        if(typeof json == 'undefined'){
            json = {};
        }
        
        json = baidu.object.clone(json); //值拷贝，避免污染原数据
        
        return json;
    },
    
    sendLog : function(userParam, snapShot){
        var me = this,
            i;
        
        snapShot = me.getLogParamByVal(snapShot);
        
        for (i in userParam){
            snapShot[i] = userParam[i];
        }
        
        NIRVANA_LOG.send(snapShot);
    },
	
	/**
	 * 获取突降的期初期末时间
	 */
	getDate : function() {
		var me = this;
		
		if (me.hasDateType) {
			return;
		}
		
		fbs.aodecr.getDate({
			onSuccess: function(response){
				var data = response.data;
				
				me.beginDate = baidu.date.parse(data.begindate); // 期初时间 yyyy-MM-dd
				me.endDate = baidu.date.parse(data.enddate); // 期末时间
				me.dateType = data.type;
				
				me.hasDateType = true;
			},
			onFail: function(response){
				ajaxFailDialog();
			}
		});
	}
};

/**
 * 声明快捷方式
 */
nirvana.decrControl = nirvana.decrease.lib.control;


nirvana.decrease.lib.widgetAction = {	
	/**
	 * 监控
	 * @param {Object} actionName
	 * @param {Object} param
	 * 
	 * logCenter('decr_view_problem');                    	// 点击查看各个子项详情
	 * logCenter('decr_quick_accept');				  	  	// 快捷启用
	 * logCenter('decr_pop_show');							// 有弹窗
	 * logCenter('decr_pop_min');							// 点击弹窗的最小化按钮
	 * logCenter('decr_pop_max');							// 点击弹窗的最大化按钮
	 * logCenter('decr_pop_close');							// 点击弹窗的关闭按钮
	 * logCenter('decr_value_set');							// 点击效果突降的“设置”按钮
	 * logCenter('decr_pop_watch');							// 点击弹窗的“立即查看”按钮
	 * logCenter('ao_tab_decr');							// 点击“效果突降”tab页
	 */
	logCenter : function(actionName, param) {
		var logParam = {
			target : actionName
		};
		
		baidu.extend(logParam, param);
		
		if (actionName.indexOf('aowidget') !== -1) { // 详情监控需要记录打开时的快照
			nirvana.decrControl.sendLog(logParam, nirvana.decrControl.snapShot);
		} else {
			nirvana.decrControl.sendLog(logParam);
		}
	}
}


/**
 * 声明快捷方式
 */
nirvana.decrWidgetAction = nirvana.decrease.lib.widgetAction;
