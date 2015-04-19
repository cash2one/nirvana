/**
 * @author zhouyu01
 */
var IDEA_EDIT_PACKAGE = {
	/******************************参考关键词****************/
	
	/**
	 * 没有注释。。
	 * @param {Object} actionInstance
	 */
	initWordRef: function(actionInstance){
		var wordref = actionInstance.arg.wordref;
		if (typeof(wordref) != "undefined" && wordref.show == true) {
			nirvana.manage.keyWordRef.init(wordref.source, wordref.listdata);
		}
		else {
			nirvana.manage.keyWordRef.revert();
		}
	},
	
	
	/**
	 * 没有注释。。
	 * @param {Object} actionInstance
	 */
	getWordRef: function(actionInstance){
		var me = actionInstance, wordref = me.arg.wordref, type = me.arg.type;
		
		//加入关键词参考功能  by mayue@baidu.com
		if (typeof(wordref) != "undefined" && wordref.show == true) {
			var source = wordref.source;
			if (typeof source === 'string') {
				if (type == 'edit' || type == 'saveas') {
					switch (source) {
						case 'normal':
							nirvana.manage.keyWordRef.get(me.getContext("unitid"));
							break;
						case 'selected':
							nirvana.manage.keyWordRef.get(me.getContext("ideaid"));
							break;
					}
				}
			}
			else {
				nirvana.manage.keyWordRef.fillWords(source);
			}
		}
	},
	
	/******************************右侧提示*******************/
	
	/**
	 * 加入右侧提示功能  by mayue@baidu.com
	 * @param {Object} actionInstance
	 */
	ideaTip: function(actionInstance){
		var me = actionInstance, tip = me.arg.tip;
		if (typeof tip !== 'undefined' && tip.show == true) {
			baidu.removeClass('IdeaTipArea', 'hide');
			baidu.g('IdeaTipTitle').innerHTML = tip.title;
			baidu.g('IdeaTipContent').innerHTML = tip.content;
		}
	},
	
	/******************************弱化的确定取消按钮****************/
	
	
	/**
	 * aoPackage优化包中也要增加“新增”按钮，同时把原“确定”“取消”按钮隐藏掉，增加了一个相对弱化的确定取消按钮
	 */
	lightSaveas: function(actionInstance){
		var me = actionInstance;
		baidu.removeClass("LightIdeaSubmit", "hide");
		baidu.removeClass("LightIdeaCancel", "hide");
		baidu.addClass(ui.util.get("IdeaSubmit").main.id, "hide");
		baidu.addClass(ui.util.get("IdeaCancel").main.id, "hide");
		//监听弱化了的确定按钮
		baidu.g("LightIdeaSubmit").onclick = IDEA_EDIT_PACKAGE.lightIdeaSubmitHandler(me);
		baidu.g("LightIdeaCancel").onclick = function(){
			me.cancelAction();
			return false;
		}
	},
	
	/**
	 * 弱化的确定按钮点击事件
	 */
	lightIdeaSubmitHandler: function(actionInstance){
		var me = actionInstance;
		return function(){
			if (IDEA_CREATION.validate() == 1) {
				ui.Dialog.confirm({
					title: "提示",
					content: "建议以新增方式保存，避免直接修改导致质量度下降",
					ok_button_lang: "保存为新增",
					cancel_button_lang: "确定修改",
					onok: function(){
						me.saveasAction();
					},
					oncancel: function(){
						me.saveAction();
					}
				});
			}
			return false;
		}
	},
	
	
	/******************************批量添加****************/
	
	/*
	 * 批量添加创意时需要执行的一系列操作 by mayue@baidu.com
	 */
	batchAction: function(actionInstance){
		var me = actionInstance, controlMap = me._controlMap;
		//隐藏掉“确定”、“取消”，显示“下一条创意”“跳过本条”以及提示区域
		baidu.addClass(ui.util.get("IdeaSubmit").main.id, "hide");
		baidu.addClass(ui.util.get("IdeaCancel").main.id, "hide");
		baidu.removeClass(ui.util.get("IdeaBatchNext").main.id, "hide");
		//baidu.dom.removeClass("IdeaBatchRefBlock","hide");
		baidu.removeClass("IdeaBatchSkip", "hide");
		baidu.removeClass("IdeaBatchTip", "hide");
		
		// 用新方法获取计划单元列表并填充
		nirvana.manage.batchIdea.init(me);
		// 清掉缓存，确保下次打开是重新请求
		lib.idea.cleanCache();
		
		//填入用户上次填写的内容
		nirvana.manage.batchIdea.fillContent(nirvana.manage.batchIdea.content);
		
		
		// 批量添加中的“下一条创意”按钮 by mayue@baidu.com
		controlMap.IdeaBatchNext.onclick = function(){
			nirvana.manage.batchIdea.getContent();//记录当前填写的信息
			me.saveAction();
		}
		
		// 批量添加中“跳过本条”按钮 by mayue@baidu.com
		baidu.g('IdeaBatchSkip').onclick = function(){
			/**
			 * 监控，第四步中点击跳过本条
			 */
			if (me.arg.entranceType == 'aoPackage') {
				var logParam = {};
				logParam.planid = me.getContext('planid');
				logParam.unitid = me.getContext('unitid');
				nirvana.aoPkgControl.logCenter.extend(logParam).sendAs('recmpkg_skipidea');
			}
			else {
				nirvana.quickSetupLogger('quicksetup_step4_writelater', {
					type: 2
				});
			}
			
			me.onclose();
			IDEA_EDIT_PACKAGE.afterBatchSave(me);
			return false;
		};
		//关闭按钮二次确认事件
		ui.util.get('AddIdeaDialog').getClose().onclick = function(){
			var flag = false;
			
			ui.Dialog.confirm({
				content: "你的创意撰写工作尚未完成，无创意的单元无法正常进行推广，是否确认离开？",
				title: '离开' + nirvana.quicksetup.lib.getActionTitle() + '流程',
				onok: function(dialog){
					ui.util.get('AddIdeaDialog').close('x');
					nirvana.manage.batchIdea.revert();
					//清空缓存并刷新账户数
					fbs.material.clearCache('ideainfo');
					fbs.material.clearCache('planinfo');
					fbs.material.clearCache('wordinfo');
					fbs.material.clearCache('unitinfo');
					
					if (ui.util.get('SideNav')) {
						var pid = me.getContext('planid');
						pid && ui.util.get('SideNav').refreshUnitList([pid]);
					}
					
					// 如果被标记从子Action传递过来的请求，则需要去刷新传过来的子Action，而不是去刷新整个主页面
					if (me.arg.fromSubAction) {
						//清空来源子Action中所有的参数，去刷新
						var father = me.arg.father, stateMap = father.getClearStateMap();
						
						father.refreshSelf(stateMap);
					}
					else 
						if (me.arg.fromSubTable) {
							me.onclose();
							me.arg.subTableRender();
							
							return;
						}
						else {
							me.arg.onclose && me.arg.onclose();
						}
				},
				oncancel: function(){
				
				}
			});
		}
		
		// 如果要显示“回到精简版”按钮，需传入showBack为true
		if (me.arg.showBack) {
			var back = $$('.idea_edit .back_to_simple')[0];
			baidu.show(back);
			baidu.on(back, 'click', function(){
				me.onclose();
				me.arg.backToSimple && me.arg.backToSimple();
			});
		}
	},
		

	/*
	 * 批量添加时保存后，对单元树进行操作并打开新的子Action	by mayue@baidu.com
	 */
	afterBatchSave: function(actionInstance){
		var me = actionInstance;
		nirvana.manage.batchIdea.beforeNext();
		if(!nirvana.manage.batchIdea.isLast){
			//打开下一个窗口
            var param = {};
            for (var key in me.arg) {
                param[key] = me.arg[key];
            }
            param.batch = {};
            param.batch.isbatch = true;
            param.batch.type = 'default';
            param.wordref = typeof me.arg.wordref === 'undefined' ? {} : me.arg.wordref;
            param.changeable = typeof me.arg.changeable === 'undefined' ? true : me.arg.changeable;
			
            nirvana.manage.createSubAction.idea(param);
		}else{
			nirvana.manage.batchIdea.revert();
			//清空缓存并刷新账户数
			fbs.material.clearCache('ideainfo');
			fbs.material.clearCache('planinfo');
			fbs.material.clearCache('wordinfo');
			fbs.material.clearCache('unitinfo');
			
			if (ui.util.get('SideNav')){
                var pid = me.getContext('planid');
                pid && ui.util.get('SideNav').refreshUnitList([pid]);
            }
			
			if(me.arg.fromSubAction){
				//清空来源子Action中所有的参数，去刷新
				var father = me.arg.father,
					stateMap = father.getClearStateMap();
				
				father.refreshSelf(stateMap);
			}else if(me.arg.fromSubTable){
				me.onclose();
				me.arg.subTableRender();
				
				return;
			}else{
				er.controller.fireMain('reload', {});
			}
		}
	},

    /*
     * wsy-移动优化包-搬家方案-所有按钮都是连接样式
     */
    changeButtonStyle: function(){

        baidu.dom.removeClass('ctrlbuttonIdeaSaveaslabel', 'ui_button_label');
        baidu.dom.addClass('ctrlbuttonIdeaSaveaslabel', 'light_idea_submit');
        baidu.dom.removeClass('ctrlbuttonIdeaSaveas', 'ui_button');
    }
}
