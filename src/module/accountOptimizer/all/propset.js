/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: accountOptimizer/all/setThreshold.js 
 * desc: 三高设置阈值
 * author: zhouyu01@baidu.com
 * date: $Date: 2011/06/24 $
 */

/**
 * 设置阈值 actionParam
 */
ToolsModule.setThreshold = new er.Action({
	VIEW : 'setPropThreshold',
	
	UI_PROP_MAP : {
		// 阈值
		aoThreshold : {
			width: '30',
			height: '20',
			value: '*threshold'
		}
	},
	
	CONTEXT_INITER_MAP : {
		label: function(callback){
			var me = this,
				level = me.arg.level || "topclkswords";
			me.setContext("level", level);
			switch (level) {
				case "toppaysumwords":
					me.setContext("topWordsLabel", "消费");
					me.setContext("topFieldLabel", "消费");
					break;
				case "topclkswords":
					me.setContext("topWordsLabel", "点击");
					me.setContext("topFieldLabel", "点击量");
					break;
				case "topshowswords":
					me.setContext("topWordsLabel", "展现");
					me.setContext("topFieldLabel", "展现量");
					break;
				default:
					break;
			}
			callback();
		},
		
		/**
		 * 阈值
		 */
		threshlod: function(callback){
			var me = this,
				type = me.getContext("level");
			fbs.ao.getCustom({
				level: type,
				onSuccess: function(res){
					me.setContext("threshold", res.data);
					callback();
				} ,
				onFail: function(res){
					callback();
				}
			});
		}
	},

	/**
	 * refresh后执行
	 */
	onafterrepaint : function() {
	},

	/**
	 * 第一次render后执行后最后会触发事件
	 */
	onafterrender : function() {
		var me = this,
			controlMap = me._controlMap,
			level = me.getContext("level");
		
		switch (level) {
			case "toppaysumwords":
				controlMap.setTypePaysum.setChecked(true);
				break;
			case "topclkswords":
				controlMap.setTypeClks.setChecked(true);
				break;
			case "topshowswords":
				controlMap.setTypeShow.setChecked(true);
				break;
			default:
				break;
		}
		
		// 默认关闭时不需要刷新，这里不使用setContext，因为从自定义打开设置时，传入的action没有needRefresh
		me.needRefresh = me.arg.needRefresh || 0;
		
		controlMap.setTypePaysum.onclick = me.changeLevel("toppaysumwords");
		controlMap.setTypeClks.onclick = me.changeLevel("topclkswords");
		controlMap.setTypeShow.onclick = me.changeLevel("topshowswords");
		controlMap.aoThresholdOK.onclick = me.modThresholdOK();
		controlMap.aoThresholdClose.onclick = me.modThresholdClose();
		controlMap.aoThreshold.onchange = me.changeValue();
	},

	/**
	 * 完成视图更新后最后会触发事件
	 */
	onentercomplete : function() {

	},
	
	//改变设置类型
	changeLevel: function(level){
		var me = this;
		return function(){
			setPropThreshold(me, level);
		}
	},
	
	//修改阈值
	modThresholdOK: function(){
		var me = this,
			controlMap = me._controlMap;
		
		return function(){
			var threshold = baidu.trim(controlMap.aoThreshold.getValue()),
				level = me.getContext('level');
			
			fbs.ao.modCustom({
				level: level,
				value: threshold,
				onSuccess: function(res){
					var tip = baidu.g("TipArea");
			//		fbs.ao.getCustom.clearCache();
					tip.innerHTML = "阈值设置成功！";
					baidu.removeClass(tip, 'hide');
					
					if (level === nirvana.aoControl.params.level) { // 如果修改阈值与当前level相同，则关闭时需要refresh
						me.needRefresh = 1;
					}
				},
				onFail: me.saveFailHandler()
			});
			
			//add by LeoWang(wangkemiao@baidu.com) 添加监控
			nirvana.aoWidgetAction.logCenter('ao_custom_save', {
				level : me.getContext('level'),
				value : threshold
			});
			//add ended
		}
	},
	
	/**
	 * 保存失败
	 */
	saveFailHandler: function(){
		var me = this;
		return function(data){
			if (data.status != 500) {
				var error = fbs.util.fetchOneError(data), 
					tip = baidu.g("TipArea"), 
					errorcode;
				
				tip.innerHTML = '';
				baidu.addClass(tip, 'hide');
				
				for (var item in error) {
					errorcode = error[item].code;
					switch (errorcode) {
						case 6005:
						case 6006:
						case 6007:
						case 6008:
						case 6099:
							tip.innerHTML = nirvana.config.ERROR.AO.THRESHOLD[errorcode];
							baidu.removeClass(tip, 'hide');
							break;
					}
				}
			}else{
				ajaxFail(0);
			}
			
		}
	},
	
	//修改阈值后提示
	changeValue: function(){
		return function(){
			baidu.g("TipArea").innerHTML = "您已经进行了修改，点击保存后修改才能生效";
		}
	},
	
	
	//关闭窗口
	modThresholdClose: function(){
		var me = this;
		
		return function() {
			// 修改了当前层级的阈值，则需要刷新
			if (me.needRefresh) {
				nirvana.aoControl.action.refresh();
			}
			
			me.onclose();
		}
	}

});


function setPropThreshold(me, type, closeCallback){
	var param = {};
	if(type){
		param.level = type;
	}
	
	if (me.needRefresh) {
		param.needRefresh = 1;
	}
	
	//var pos = baidu.dom.getPosition(baidu.g("PropSet"));
	//打开浮出框
	nirvana.util.openSubActionDialog({
		id: 'propset',
		title: '阈值设置',
		width: 550,
		//left: pos.left + 30,
		//top: pos.top,
		maskLevel: 6,
		unresize: "false",
		actionPath: '/tools/proposal/setThreshold',
		params: param,
		onclose: function(){
			closeCallback && closeCallback();
		}
	});
}
