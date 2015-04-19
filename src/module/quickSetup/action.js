/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: quickSetup/action.js 
 * desc: 快速新建action所在
 * author: wangkemiao@baidu.com
 * date: $Date: 2012/02/08 $
 */

nirvana.quicksetup.module = new er.Module({
    config: {
        'action': [
			{
				path : 'quicksetup/main',
				action : 'nirvana.quicksetup.action'
			},
			{
				path : 'quicksetup/step1region',
				action : 'nirvana.quickSetupLib.step1.region.action'
			},
			{
				path : 'quicksetup/step1example',
				action : 'nirvana.quickSetupLib.step1.example.action'
			},
			{
				path : 'quicksetup/schemedetail',
				action : 'nirvana.quickSetupLib.step3.schemeDetail.action'
			}/*,//Deleted by Wu Huiyao
			{
				path : 'quicksetup/step3planschedule',
				action : 'nirvana.quickSetupLib.step3.planSchedule.action'
			}*/
        ]
    }
});


nirvana.quicksetup.action = new er.Action({
	/**
	 * 视图模板名，或返回视图模板名的函数
	 */
	VIEW : 'quickSetupMain',
	
	targetId : nirvana.quicksetup.lib.containerId,
	
	STATE_MAP : {},
	
	UI_PROP_MAP: {
		QuickSetupStep1Text : {
			virtualValue : '*step1TextVirtual'
		},
		QuickSetup1BudgetInfo : {
			datasource : '*budgetInfoData',
			width : '120'
		}
	},
	
	CONTEXT_INITER_MAP : {
		init : function(callback){
			var me = this,
				step = me.getContext('step') || +me.arg.step || 1;
				//subStep = me.getContext('subStep') || +me.arg.subStep || 1;
			
			me.setContext('step', step);
			
			callback();
		}
	},
	
	onbeforeinitcontext: function(){},
	
	/**
	 * refresh后执行
	 */
	onafterrepaint : function() {},

	/**
	 * 第一次render后执行后最后会触发事件
	 */
	onafterrender : function() {},
	
	/**
	 * 完成视图更新后最后会触发事件
	 */
	onentercomplete : function() {
		var me = this;
			//target = baidu.g(me.targetId),
			//controlMap = me._controlMap,
			//uiList,
			//step = me.getContext('step');
		
		//根据当前的step信息，进行相应的渲染
		
		nirvana.quickSetupControl.render(me);
	}
});

nirvana.quicksetup.show = function(settings){
	var lib = nirvana.quickSetupLib,
		param = {},
		settings = settings || {};
	
	//默认参数处理
	if('object' !== typeof settings){
		settings = {
			type : 'useracct',
			redirect : true
		}
	}
	settings.type = settings.type || 'useracct';  //useracct为快速新建账户，planinfo为快速新建计划，详见nirvana.quicksetup.actionTitle
	settings.redirect = (!settings.redirect && settings.redirect === false) ? false : true; //默认转向
	
	//强制令type必须是String
	if('string' !== typeof settings.type){
		settings.type = 'useracct';
	}
	/* 
	 * taskstate状态：
	 *		0：没开始
	 *		1: 开始生成方案
	 *		2：成功
	 *		3：开始入库
	 *		4：成功
	 *		5：部分成功
	 *		6：推广方案生成失败
	 *		7：推广方案入库失败
	 *
	 * 		8：新增于20130225：标记没有新建计划权限而进入流程，出现新建账户成功界面
	 */
	
	lib.getTaskStatus(
		function(taskstatus, tasktype){
			var title,
				options;
			
			switch(taskstatus){
				case 0:
					param.step = 1;
					
					//如果没开始任务，则清空与步骤相关的所有缓存，并重新开始
					nirvana.quickSetupLib.cache.clearStepInfo();

					//发送请求：推送当天注册的用户的url给后端
					//发送过就不再发送了（以缓存为准）
//					if(!nirvana.quickSetupLib.cache.get('taskinited')){
//						fbs.eos.inittask({});
//						nirvana.quickSetupLib.cache.set('taskinited', true);
//					}

					break;
				case 1:
				case 6:
				case 101:  //前段针对第一阶段生成成功但是结果为空的情况自定义错误状态
					param.step = 2;
					break;
				case 2:
				case 3:
				case 4:
				case 5:
				case 7:
					param.step = 3;
					break;
				default:
					ajaxFailDialog();
					return;
			}
			
			// 修改当前流程类型为从后端读取到的
			settings.type = tasktype || settings.type;
			
			lib.resetParams(); //重置基础参数，清除之前遗留的信息
			
			lib.setParam('type', settings.type);
			lib.setParam('entrance', settings.entrance);
			lib.setParam('dialogOptions', settings);
			lib.setParam('taskstatus', taskstatus);

			lib.setParam('needClearCache', false);



			// 判断权限，看用户是否有小流量的快速新建计划的权限
			if( tasktype == 'planinfo' // 如果是快速新建计划
				&& nirvana.env.EXP != '7240') { // 权限判断
				// 错误处理，直接转至上一次方案入库成功页面
				param.step = 4;
				settings.type = 'useracct';
				lib.setParam('type', 'useracct');
				lib.setParam('taskstatus', 8);
			}

			title = lib.getActionTitle();
			if(title && title.length > 0){
				options = {
					id: 'QuickSetup',
					title: title,
					width: 1000,
					height: 603,
					unresize : true,
					className : 'quicksetup_dialog',
					actionPath: 'quicksetup/main',
					params: param,
					onclose: function(){
					}
				};
				
				/**
				 * 监控，进入流程
				 */
				nirvana.quickSetupLogger('quicksetup_enter', {
					entrance : settings.entrance
				});
				// 清除body的滚动条
				//if(settings.entrance != 0 && settings.entrance != 5){
					//baidu.addClass(document.documentElement, 'no_scroll_body');
				//}
				
				//打开浮出框
				nirvana.util.openSubActionDialog(options);
			}
			else{
				ui.Dialog.alert({
					title: '错误',
					content: '请从正确途径执行！'
				});
			}
			
			
		}
	);
	return false;
};

nirvana.quicksetup.hide = function(){
	
	ui.util.get('QuickSetup').close('x');

	// 恢复body的滚动条
	//baidu.removeClass(document.documentElement, 'no_scroll_body');
	
	if(nirvana.quickSetupLib.interval){
		clearTimeout(nirvana.quickSetupLib.interval);
		nirvana.quickSetupLib.interval = null;
	}

	if(nirvana.quickSetupLib.getParam('needClearCache')){
		fbs.material.clearCache('useracct');
		fbs.material.clearCache('planinfo');
		fbs.material.clearCache('unitinfo');
		fbs.material.clearCache('ideainfo');
		fbs.material.clearCache('wordinfo');
		fbs.avatar.getMoniFolders.clearCache();
		fbs.avatar.getMoniWords.clearCache();
		fbs.material.getTopData.clearCache();

		ui.util.get('SideNav') && ui.util.get('SideNav').refreshPlanList();
	}


	// 如果是在向导页面，自动跳转至推广管理页面
	var settings = nirvana.quickSetupLib.getParam('dialogOptions');

    if (nirvana.quickSetupLib.getParam('toKeyword') === true) {
        location.href = '#/manage/keyword~ignoreState=true&navLevel=account';
        return;
    }

    /*
     * 注释掉，老户转全修改，不需要进行跳转了
     *
	if(location.href.indexOf('#/manage') == -1 && settings.redirect){
		location.href = '#/manage/plan';
    } else {
		er.controller.fireMain('reload', {});
	}
	*/
	er.controller.fireMain('reload', {});
};
