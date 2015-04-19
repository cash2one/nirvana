/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: accountOptimizer/decrease/action.js 
 * desc: 效果突降
 * author: wanghuijun@baidu.com
 * date: $Date: 2011/11/14 $
 */

/**
 * 效果突降 actionParam
 */
nirvana.decrease.lib.action = {
	/**
	 * 视图模板名，或返回视图模板名的函数
	 */
	VIEW : 'decrease',
	
	/**
	 * ToolsModule里写statemap没有实际意义，只是当注释用了，标明那些是用于保持的context
	 */
	STATE_MAP : {
	},

	/**
	 * 在模板中写一长串的控件属性会难以理解。该属性能以“控件id/属性集合”的形式在外部书写控件属性，使格式更清晰。
	 */
	UI_PROP_MAP : {
	},
	
	/**
	 * 重置工具时，通过判断.refresh决定是否重置所有STATE_MAP中定义的context
	 */
	onbeforeinitcontext : function(){
		// 清除正在渲染线程，避免切换Tab报错
        nirvana.aoControl.clearRenderThread();
        //nirvana.decrControl.clearRenderThread();
        // 卸载全部优化建议
        ToolsModule.unloadTrans('proposal');
		nirvana.aoControl.toolsName = 'decrease';
	},

	/**
	 * 初始化context的函数集合，name/value型Object。其value为Function的map，value
	 * Function被调用时this指针为Action本身。value
	 * Function的形参需要有一个callback参数，参数为Function类型，手工回调。
	 */
	CONTEXT_INITER_MAP : {
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
		var me = this;
		
		me.aoTabInit();
		
		// 左侧导航绑定点击事件
		baidu.on('PropAside', 'click', me.bindShortcut());
	},

	/**
	 * 完成视图更新后最后会触发事件
	 */
	onentercomplete : function() {
		var me = this,
			controlMap = me._controlMap;
		
		baidu.g('DecreaseResult').innerHTML = '请至<strong>推广概况</strong>页使用<strong>突降急救包</strong>查看分析结果。';
	},
	
	/**
	 * 导航定位到“效果突降分析”
	 */
	aoTabInit : function() {
		baidu.addClass('AoDecrease', 'active');
	},
	
	/**
	 * 快捷筛选绑定事件
	 */
	bindShortcut: function() {
		var me = this;
		
		return function(e){
			var e = e || window.event,
				target = e.target || e.srcElement;
			
			switch (target.id) {
				// 全部优化建议
				case 'AoAll':
					me.redirect('/tools/proposal', {
						// 携带level返回，保持分析对象的状态
						level : me.arg.level
					});
					break;
					
				// 效果突降分析
				case 'AoDecrease':
					// 跳转到效果突降action
					//me.refresh();
					//监控
					nirvana.decrWidgetAction.logCenter('ao_tab_decr');
					break;
			}
			
			baidu.event.stop(e);
		};
	}
};

ToolsModule.decrease = new ToolsModule.Action('decrease', nirvana.decrease.lib.action);