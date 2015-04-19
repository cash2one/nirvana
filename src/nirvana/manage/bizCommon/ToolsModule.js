/*
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * desc:    ToolsModule 工具箱模块
 * author:  tongyao
 */

var ToolsModule = new er.Module({
    config: {
        'action': [
            {
                path: '/tools/history',
                action: 'ToolsModule.history'
            },
            {
                path: '/tools/estimator',
                action: 'ToolsModule.estimator'
            },
			{
                path: '/tools/adpreview',
                action: 'ToolsModule.adpreview'
            },
			{
                path: '/tools/queryReport',
                action: 'ToolsModule.queryReport'
            },
			// 搜索词报告 添加关键词
            {
                path: '/tools/queryReport/addQuery',
                action: 'ToolsModule.addQuery'
            },
			// 搜索词报告 添加为否定关键词
            {
                path: '/tools/queryReport/addQueryNeg',
                action: 'ToolsModule.addQueryNeg'
            },
			// 搜索词报告 添加为关键词回调
            {
                path: '/tools/queryReport/addQueryCallback',
                action: 'ToolsModule.addQueryCallback'
            },
			{
                path: '/tools/report',
                action: 'ToolsModule.report'
            },
			{
                path: '/tools/myReport',
                action: 'ToolsModule.myReport'
            },
			{
                path: '/tools/report/download',
                action: 'ToolsModule.reportDownload'
            },
			{
                path: '/tools/report/mail',
                action: 'ToolsModule.reportMail'
            },
			{
                path: '/tools/report/cycle',
                action: 'ToolsModule.reportCycle'
            },
            {
                path: '/tools/kr',
                action: 'ToolsModule.kr'
            },
            {
                path: '/tools/trans',
                action: 'ToolsModule.trans'
            },
            {
                path: '/tools/newtrans',
                action: 'ToolsModule.newtrans'
            },
            {
                path: '/tools/translist',
                action: 'ToolsModule.translist'
            },
            {
                path: '/tools/translist/transmodify',
                action: 'ToolsModule.transModify'
            },
            {
                path: '/tools/translist/getcode',
                action: 'ToolsModule.getCode'
            },
            {
                path: '/tools/transCheckSingle',
                action: 'ToolsModule.transCheckSingle'
            },
            {
                path: '/tools/transcheck',
                action: 'ToolsModule.transcheck'
            },
			{
				path: '/tools/effectAnalyse',
                action: 'ToolsModule.effectAnalyse'
			},
            {
                path: '/tools/proposal',
                action: 'ToolsModule.proposal'
            },
            {
                path: '/tools/proposal/materialList',
                action: 'ToolsModule.materialList'
            },
            {
                path: '/tools/proposal/folderList',
                action: 'ToolsModule.folderList'
            },
            {
                path: '/tools/proposal/setThreshold',
                action: 'ToolsModule.setThreshold'
            },
            {
                path: '/tools/proposal/selectedList',
                action: 'ToolsModule.selectedList'
            },
            {
                path: '/tools/decrease',
                action: 'ToolsModule.decrease'
            }/*, del by Huiyao 2013.1.7 管理页的优化建议的效果突降下掉之后，这个没用了,转移到aoPkgControl.js
            {
                path: '/tools/proposal/setPropForAoDecr',
                action: 'ToolsModule.setPropForAoDecr'
            }*/
        ]
    }
});

baidu.extend(ToolsModule, function(){
	var actionContainer = {},
		actionInstanceContainer = {},
		toolStatus = {},
		infoHolder = {
						importDataMethod : null
					},
		ACTION_NAME = "__ToolsAction__",
		MAIN_ID_PREFIX = "Tools_",
		MAIN_CONTAINER_ID = 'Tools',
		
		
		/**
		 * 设置导入物料的方法（该方法应该return一个obj对象）
		 * @param {Object} func
		 */
		setImportDataMethod = function(func){
			infoHolder.importDataMethod = func;
		},
		
		/**
		 * 清除之前注册的导入物料的方法
		 */
		clearImportDataMethod = function(){
			infoHolder.importDataMethod = null;
		},
		
		/**
		 * 更新选中物料的二次确认
		 */
		confirmReImport = function(callback){
			var dialog = ui.util.get('ToolsModuleConfirmReImport');
			if (!dialog) {
				ui.Dialog.factory.create({
					title: '提醒',
					content: '您更新勾选对象后使用该工具，会造成结果的变化，确认覆盖原来的结果吗？',
					closeButton: false,
					cancel_button: true,
					onok : function(){callback(true)},
					oncancel : function(){callback(false)},
					maskType: 'black',
					maskLevel: '3',
					id: 'ToolsModuleConfirmReImport',
					width: 300,
					skin : 'ToolsModuleConfirmReImport'
				});
			} else {
				dialog.onok = function(){callback(true)};
				dialog.oncancel = function(){callback(false)};
				dialog.show();
			}
		},
		
		/**
		 * 重置某一个工具
		 */
		reset = function(toolsName){
			unload(toolsName);

			if(toolsName == "kr"){ 
			//kr自动分组功能，点击重置后，需要清空flash 存储不然还是会进入分组界面
			//建议增加一个beforeReset的钩子方法，这样可以实现解耦,对一些重要方法，比如close和reset应该增加钩子方法，
			//这样就解耦了，不用苦逼的写恶心的特殊逻辑代码
                fc.common.Keyword.saveKeywordsToStorage([]);
				AUTOUNIT_MODEL.cleanSnapShot();
				
				if (AUTOUNIT_MODEL.isInAutoUnitPage()) {
					nirvana.krMonitor.autoUnitResetKR();
				}
			}

			open(toolsName);
		},
		
		unload = function(toolsName){
			er.controller.unloadSub(actionInstanceContainer[toolsName]);
			delete actionInstanceContainer[toolsName];
			delete toolStatus[toolsName];
		},
		
		loadAction = function(toolsName, argMap, isMaterialRelate, needReloadAction){
			
			var containerId = MAIN_ID_PREFIX + toolsName;
			
			//生成容器
			if (!baidu.g(containerId)) {
				ui.util.get('Toolbar').createFloat(toolsName, containerId);
			}
			
			//展开浮动层
			var children =  baidu.dom.children(MAIN_CONTAINER_ID);
			 baidu.array.each(children, function(item){
			 	if(item.id != containerId){
					//baidu.dom.hide(item.id);
					// 这里使用display none 会引起表格宽度为0，临时替换为position隐藏的方式
					baidu.removeClass(item.id,"tool_show");
				} else {
					ui.util.get('Toolbar').floatMain = item;
					//baidu.dom.show(item.id);
					baidu.addClass(item.id,"tool_show");
				}
			 });
			
			if (!toolStatus[toolsName] || needReloadAction) {	
				
				argMap = argMap || {};
				argMap.queryMap = argMap.queryMap || {};
				
				if (isMaterialRelate) {
					var materials = argMap.queryMap.importMaterials;                    
                    if (!materials) {
                        materials = infoHolder.importDataMethod && infoHolder.importDataMethod(); 
					    argMap.queryMap.importMaterials  = materials || {};	//未选择物料时默认为空
                    }

					var logParams = {};
					logParams.target = "importData";
					logParams.toolsName = toolsName;
					if(materials){
						logParams.level = materials.level;
						logParams.dataLen = materials.data.length;
					}else{	//未选择物料时materials也会有值
						logParams.dataLen = 0;
					}
					NIRVANA_LOG.send(logParams);
				}

				if(toolStatus[toolsName]){
					//卸载原有Action
					unload(toolsName);
				}
				
				//加载Action
				var actionName = 'ToolsModule.' + toolsName,
					actionInstance = er.controller.loadSub(containerId + '_body', actionName, argMap);
	
				actionInstanceContainer[toolsName] = actionInstance;
				
				if (isMaterialRelate) {
					//actionInstance.IMPORT_MATERIAL_HOLDER[materials.level] = materials;
					actionInstance.IMPORT_MATERIAL_HOLDER = materials;
				}
				
				actionInstance.__ACTION_NAME = toolsName;
								
				toolStatus[toolsName] = true;	
			}
			 
			 ui.util.get('Toolbar').showFloat();
		},
		
		open = function (toolsName, argMap) {
			//检查是否设定了物料导入函数，以确定其是否需要导入物料的工具
			var isMaterialRelate = typeof infoHolder.importDataMethod == 'function',
				supportMaterialImport = false,//某工具是否支持带入某物料
				needReloadAction  = false,
				materials = {},
				tic = nirvana.config.TOOL_IMPORT_CONFIRM,//工具支持带入物料的配置
				loadFunc = function(needReload){
                    needReload = needReload || (argMap && argMap.needReload) ||  false;
					loadAction(toolsName, argMap, isMaterialRelate, needReload);
				};
			if (isMaterialRelate) {//如果设置了物料导入函数
				materials = infoHolder.importDataMethod && infoHolder.importDataMethod();
				for (var i = 0, l = tic.length; i < l; i++) {
					if (tic[i].tool == toolsName && baidu.array.indexOf(tic[i].material, materials.level) != -1) {
						supportMaterialImport = true;//工具支持该物料带入
						break;
					}
				}
			}
			isMaterialRelate = isMaterialRelate && supportMaterialImport;
			
			//如果打开报告工具箱，则unload“我的报告”action,防止从我的报告跳到推广管理后重新进入报告工具箱带来的各种问题
			if(toolsName === "report"){
				 unload("myReport");
			}
			
			// 判断是否有物料选择以及物料是否有改变 
			if (isMaterialRelate && toolStatus[toolsName]) { //如果主Action可以导入物料,且如果是已经初始化的Action，判断物料是否有改变
				var actionMaterials = actionInstanceContainer[toolsName].IMPORT_MATERIAL_HOLDER;
				
				if (baidu.json.stringify(materials) != baidu.json.stringify(actionMaterials)) {
					if (actionMaterials['data'] && materials['data'].length == 0 && actionMaterials['data'].length == 0) {
						loadFunc();
						return;
					}

                    // actionMaterials  有可能是个{ }，这是怎么回事。。。。
                    if (baidu.lang.isArray(actionMaterials.data)) {
                        confirmReImport(loadFunc);
                    } else {
                        loadFunc(true);
                    }

					return;
				}
			}
			
			loadFunc();
			
			// 最小化再打开工具时，表格会空白，需要resize add by wanghuijun
			setTimeout(function(){
				baidu.event.fire(window,'resize');
			},300);
			
			// 如果打开账户优化或者效果突降，需要给导航按钮绑定点击事件，点击时卸载账户优化工具
			if (toolsName == 'proposal' || toolsName == 'decrease') {
                nirvana.aoControl.bindNavMain();
			}
		};
		
		er.Action.extend({
			IMPORT_MATERIAL_HOLDER : {},
			
			onenter : function(){},
					
			redirect : function(path, argMap, option){
				var actionName = er.controller.getActionConfigByPath(path),
					actionName = actionName.action,
					option = option || {};
				
				//坏味道，硬性取出了ToolModule.actionName中的actionName部分
				actionName = actionName.split('.')[1];
				
				if(actionInstanceContainer[this.__ACTION_NAME]){
					if (typeof option['skipUnload'] == 'undefined') {
						var __actionName = this.__ACTION_NAME;
						unload(__actionName);
					}
				}
				
				ToolsModule.open(actionName, argMap);
			},
			
			refresh: function () {
				var stateMap = this.STATE_MAP || {},
					queryMap = {};
				
				for (var key in stateMap){
					queryMap[key] = this.getContext(key);
				}
				
				var argMap = {
					refresh : 1,
					queryMap : queryMap,
					domId	: this.arg.domId
				}
				this.enter(argMap);	
			}
		}, ACTION_NAME);
		
	return {
		Action: function (name, options) {
			var action = new er.Action(options, ACTION_NAME);
			actionContainer[name] = action;
			return action;
		},
		
		reset: reset,
		open: open,
		
		//目前只对外暴露KR的unload
		unloadKR : function(){
			unload('kr');
		},
		
		// 转化跟踪几个页面之间切换时，需要unload，临时性方法
		unloadTrans : function(toolsName){
			unload(toolsName);
		},
		
		close: function(){
			//close掉浮动层
			var toolbar = ui.util.get('Toolbar');
			toolbar && toolbar.hideFloat();
			//add by linfeng
			baidu.event.fire(window,'resize');

            if (KR_COM.needReload) {
                KR_COM.needReload = false;
                fbs.material.clearCache('wordinfo');
				er.controller.fireMain('reload', {});
            }

            if (toolbar && toolbar.floatMain && toolbar.floatMain.id == 'Tools_kr') {
                var kr = ToolsModule.kr.obj;
                if (kr && kr.param.planid) {
                    ui.util.get('SideNav').refreshUnitList([kr.param.planid]);
                }
                fc.common.Keyword.saveKeywordsFromCacheToStorage();
				AUTOUNIT_MODEL.takeSnapShot();
			}
		},
		
		setImportDataMethod   : setImportDataMethod,
		clearImportDataMethod : clearImportDataMethod,
		
		//这个方法如果取名为init 就会被er框架自动调一次  by tongyao
		initiate: function(){
			var advanceToolClass = "";
			var baseToolClass = "";
			if (nirvana.env.FCLAB) {
				baseToolClass = "base_tools";
			}
			else {
				advanceToolClass = "hide";
			}
			var map = er.UIAdapter.init(baidu.g('Toolbar'), {
					Toolbar : {
						datasource : ui.format(
	                    				er.template.get('Toolbar'),
										baseToolClass,
										advanceToolClass
									)
					}
				});
			var btnMap = er.UIAdapter.init(map.Toolbar.main);
			
			var btnClickHander = function(actionName){
				//TODO KR kener
				return function(){
                    // del by Huiyao 2013.1.6: FIXBUG: 进入推广管理立即点击工具栏优化建议会出错，由于nirvana.aoControl代码还未加载进来
                    // 应在下面按需加载完成之后执行下面逻辑
//					if (actionName === 'proposal' || actionName === 'decrease') { // 优化建议增加监控标识，需要在open之前执行
//						nirvana.aoControl.resetStat();
//					}

                    // wanghuijun 2012.12.03
                    // 模块化实践，ao按需加载
                    // todo 工具箱逐步实现按需加载，只需要增加相应的case
                    // 全部实现按需要加载以后移除swtich语句
                    switch (actionName) {
                        case 'proposal' :
                        case 'decrease' :
                            $LAB.script(nirvana.loader(actionName))
                                .wait(function() {
                                    // add by Huiyao: 2013.1.6，理由见上面
                                    if (actionName === 'proposal' || actionName === 'decrease') { // 优化建议增加监控标识，需要在open之前执行
                                        nirvana.aoControl.resetStat();
                                    }
                                    ToolsModule.open(actionName);
                                });
                            break;
                        default :
                            ToolsModule.open(actionName);
                            break;
                    }
					//ToolsModule.open(actionName);
                    // wanghuijun 2012.12.03
				}
			}
			
			btnMap.DataAnalyseBtn.onclick = btnClickHander('report');
			btnMap.KrBtn.onclick = btnClickHander('kr');
			btnMap.BidBtn.onclick = btnClickHander('estimator');
			btnMap.PreviewBtn.onclick = btnClickHander('adpreview');
			btnMap.HistoryBtn.onclick = btnClickHander('history');
			btnMap.QueryReportBtn.onclick = btnClickHander('queryReport');
			btnMap.AdvanceToolsBtn.onclick = btnClickHander('advance');
			//添加效果分析按钮
			btnMap.EffectAnalyseBtn.onclick = btnClickHander('effectAnalyse');
			btnMap.TransBtn.onclick = nirvana.trans.openTool;
			btnMap.ProposalBtn.onclick = btnClickHander('proposal');
			
			//效果分析小流量，发送该请求
			
			fbs.effectAnalyse.getEffectAuth({
				callback : function(data) {				
					if (data && data.data) { //如果返回true	
						baidu.dom.removeClass(baidu.g('ctrlbuttonEffectAnalyseBtn'), 'hide');
                        // 去掉效果分析的bubble
						// ui.Bubble.source.effectAnalyse = {
						//     type : 'tail',
						//     showByClickIcon: true,
						//     iconClass : 'ui_bubble_icon_none',
						//     positionList : [1,8,4,5,2,3,6,7],
						//     showTimeConfig : 'showonce',        //显示控制
						//     needBlurTrigger : true, 
						//     showByClick : false,
						//     showByOver : false,             //鼠标悬浮延时显示
						//     showByOverInterval : 3000,       //悬浮延时间隔
						//     hideByOut : true,               //鼠标离开延时关闭
						//     hideByOutInterval : 60000,      //离开延时间隔，显示持续时间
						//     autoShow : true,
						//     autoShowDelay : 25,
						//     bubblePosition : 'fixed',
						//     priority : 15,
						//     title: '',
						//     content: '效果分析工具上线啦，您可以直观地查看关键词的表现，从展现、点击、消费等维度分析和优化推广效果。'
						// };
						// ui.Bubble.init();
						baidu.dom.removeClass('Toolbar', 'hide');
					}else{
						baidu.dom.removeClass('Toolbar', 'hide');
					}
					
				}
			
			});
			
		}
	}
}());
