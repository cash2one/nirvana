/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: accountOptimizer/all/action.js 
 * desc: 优化建议
 * author: wanghuijun@baidu.com
 * date: $Date: 2011/05/31 $
 */

/**
 * 账户优化 actionParam
 */
nirvana.ao.lib.action = {
	/**
	 * 视图模板名，或返回视图模板名的函数
	 */
	VIEW : 'proposal',
	
	/**
	 * ToolsModule里写statemap没有实际意义，只是当注释用了，标明那些是用于保持的context
	 */
	STATE_MAP : {
		aoEntrance : 'Tool', // Planinfo,Unitinfo,Wordinfo,Ideainfo,Monitor,Nav
		
		wrapper : 'ProposalWidget',

		// 数据区域的目标文字，不同的阶段有不同的单位
		targetsText : {
			'shows' : {
				title : '展现量',
				unit : '次'
			},
			'clks' : {
				title : '点击量',
				unit : '次'
			},
			'pv' : {
				title : '浏览量',
				unit : '次'
			},
			'trans' : {
				title : '转化量',
				unit : '次'
			},
			'lastofftime' : {
				title : '最晚下线时间',
				unit : ''
			},
			'effwordnum' : {
				title : '生效词量',
				unit : '个'
			},
			'leftshowrate' : {
				title : '左侧展现概率',
				unit : ''
			},
			'star3numrate' : {
				title : '生效三星词比例',
				unit : ''
			},
			'conntime' : {
				title : '网站打开速度',
				unit : '秒'
			},
			'attraction' : {
				title : '网站吸引力',
				unit : '分'
			}
		},
		isImport: false,
		importData: []
	},

	/**
	 * 在模板中写一长串的控件属性会难以理解。该属性能以“控件id/属性集合”的形式在外部书写控件属性，使格式更清晰。
	 */
	UI_PROP_MAP : {
		// 数据范围表格
		AoDataTable : {
			noTitle : 'true',
			noDataHtml : FILL_HTML.NO_DATA,
			fields: '*dataTableFields',
			datasource: '*dataTableData',
			noScroll: 'true'
		}
	},
	
	/**
	 * 重置工具时，通过判断.refresh决定是否重置所有STATE_MAP中定义的context
	 */
	onbeforeinitcontext : function(){
        // 清除正在渲染线程，避免切换Tab报错
        nirvana.aoControl.clearRenderThread();
        // 手动版效果突降下线，不需要这个了。
        //nirvana.decrControl.clearRenderThread();
		// 卸载效果突降
        ToolsModule.unloadTrans('decrease');
        nirvana.aoControl.toolsName = 'proposal';
	},

	/**
	 * 初始化context的函数集合，name/value型Object。其value为Function的map，value
	 * Function被调用时this指针为Action本身。value
	 * Function的形参需要有一个callback参数，参数为Function类型，手工回调。
	 */
	CONTEXT_INITER_MAP : {
        /**
         * 填充数据范围
         */
		dataScope : function(callback) {
			var me = this;
			
			// 固定值不需要每次填充，只需要在第一次进入时设置
			if (!me.arg.refresh) {
				me.setContext('dataScope', [{
					value: '0',
					text: '昨天'
				}, {
					value: '1',
					text: '最近7天'
				}, {
					value: '7',
					text: '最近14天'
				}]);
			}
			
			callback();
		},
		
        /**
         * 填充数据表格
         */
		dataTable : function(callback) {
			var me = this,
				fields = [],
				datasource = [];
			
			fields = [{
				content: 'left',
				title: ''
			}, {
				content: 'right',
				title: ''
			}];
			
			datasource = [{
				left : '',
				right : ''
			}];
			
			me.setContext('dataTableFields', fields);
			me.setContext('dataTableData', datasource);
			
			callback();
		},
		
        /**
         * 获取推广阶段及各指标的权限
         */
		getStages : function(callback) {
			var me = this;
			
			fbs.ao.getStagesAndTargets({
				onSuccess: function(response){
					var transAuth = response.data.stages.trans,
						pvAuth = response.data.stages.pv,
						bouncerateAuth = response.data.targets.bouncerate;
					
					// 浏览、转化、跳出率权限
					nirvana.aoControl.pvAuth = pvAuth;
					nirvana.aoControl.transAuth = transAuth;
					nirvana.aoControl.bouncerateAuth = bouncerateAuth;
					
					if (pvAuth == 3) { // 没有浏览权限，则一定没有转化权限
						me.setContext('stageClass', 'no_pv');
					} else if (transAuth == 3) { // 没有转化权限
						me.setContext('stageClass', 'no_trans');
					} else {
						me.setContext('stageClass', '');
					}
					
					// 各项指标的权限
					me.setContext('targetsAuth', response.data.targets);
					
					callback();
				},
				onFail: function(response){
					ajaxFailDialog();
					
					callback();
				}
			});
		},
		
        /**
         * 获取Holmes状态
         */
		getHolmesStatus : function(callback) {
			var that = nirvana.aoControl;
			
			fbs.ao.getHolmesStatus({
				onSuccess: function(response){
					var data = response.data;
					
					that.holmesStatus = data.holmesstatus;
					that.transTarget = data.transtarget;
					
					callback();
				},
				onFail: function(response){
					ajaxFailDialog();
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
		var me = this;
		
		// 携带物料进入初始化
		me.importDataInit();
		
		// 左侧导航绑定点击事件
		baidu.on('PropAside', 'click', me.bindShortcut());
	},

	/**
	 * 完成视图更新后最后会触发事件
	 */
	onentercomplete : function() {
		var me = this,
			controlMap = me._controlMap;
		
		// 重置推广阶段
		me.resetStages();
		
		me.initStages();
		
		// 这里修改需要请求的params，然后初始化账户优化
		me.initParams();
		nirvana.aoControl.init(me);
		
		//设置current tab的样式
		me.setCurrentStype();
		me.initDataArea();

		baidu.g('ProposalStageList').onclick = me.bindStages();
	},
	
	/**
	 * 账户优化参数初始化
	 */
	initParams : function() {
		var me = this,
			level = me.getContext('level');
		
		// 当前层级是携带物料进入的，则使用携带物料condition
		if (level == me.getContext('importLevel')) {
			nirvana.aoControl.changeParams({
				level : level,
				condition : me.getImportIds()
			});
		} else {
			nirvana.aoControl.changeParams({
				level : level,
				condition : {}
			});
		}
	},
	
	/**
	 * 携带物料进入初始化
	 */
	importDataInit : function() {
		var me = this,
			importdata = me.arg.queryMap.importMaterials;
		
		if (importdata && importdata.data.length > 0 && importdata.level != 'folder') { // 携带监控文件夹进入时，默认为账户层级
			var level = importdata.level,
				data = importdata.data,
				html = '';
			
			level = level == 'keyword' ? 'word' : level;
			level = level + 'info';
			
			me.setContext('isImport', true);
			me.setContext('importLevel', level);
			me.setContext('importData', data);
			
			switch(level){
				case 'planinfo':
					html = '计划';
					break;
				case 'unitinfo':
					html = '单元';
					break;
				case 'wordinfo':
					html = '关键词';
					break;
				case 'ideainfo':
					html = '创意';
					break;
			}
			
			baidu.g('propMySelected').innerHTML = '选中的' + html;
			
			baidu.removeClass('mySelectedMaterial', 'hide');
		} else {
			baidu.addClass('mySelectedMaterial', 'hide');
		}
		
		// 重置level，只在第一次进入时执行
		me.resetLevel();
	},
	
	/**
	 * 重置level
	 */
	resetLevel : function() {
		var me = this;
		
		// 这里不修改参数，直接设置level，参数统一在initParams里修改
		// 首先判断是否有带入的level，说明是从其他tab切回全部建议
		// 然后获取携带进入的level
		// 默认为账户层级
		me.setContext('level', me.arg.level || me.getContext('importLevel') || 'useracct');
	},
	
	/**
	 * 设置current tab的样式
	 */
	setCurrentStype: function(){
		var me = this,
			level = nirvana.aoControl.params.level,
			lis = baidu.g("PropAside").getElementsByTagName("li"),
			find = false;
		
		// 根据<li>的自定义属性level，判断当前active的标签
		for (var i = 0, l = lis.length; i < l; i++) {
			if (baidu.getAttr(lis[i], "level") == level) {
				baidu.addClass(lis[i], "active");
				find = true;
			} else{
				baidu.removeClass(lis[i], "active");
			}
		}
		
		if(!find && me.getContext("isImport")){
			baidu.addClass('mySelectedMaterial', 'active');
		}
	},
	
	/**
	 * 初始化推广阶段
	 */
	initStages : function() {
		var me = this;
		
		baidu.setAttr('ProposalStageList', 'class', me.getContext('stageClass'));
	},
	
	/************************************  快捷筛选 start  ************************************/

	/**
	 * 快捷筛选绑定事件
	 */
	bindShortcut : function() {
		var me = this;
		
		return function(e){
			var e = e || window.event, 
				target = e.target || e.srcElement,
				needRefresh = false,
				isDetail = false, 
				params = {
					level: '',
					condition: {},
					signature: '',
					command: 'start',
					opttype: nirvana.config.AO.OPTTYPE['ALL']
				},
				dialogParams = {
                   	id: '',
                    title: '',
					dragable : false,
					needMask : false,
					unresize : true,
					maskLevel: 5,
                    width: 550,
                    actionPath: '',
					father : baidu.g('Tools_proposal_body'),
                    params: {
                    },
                    onclose: function(){
                    }
                };
			
			//如果点击的是button的label，则取父元素button
			if (baidu.dom.hasClass(target, 'ui_button_label')) {
				target = target.parentNode;
			}
			
			switch (target.id) {
				// 全部优化建议
				case 'AoAll':
					me.refresh();
					break;
				
				// 效果突降分析
				case 'AoDecrease':
					// 跳转到效果突降action，携带当前level，用于返回时定位分析对象
					me.redirect('/tools/decrease', {
						level : me.getContext('level')
					});
					//监控
					nirvana.decrWidgetAction.logCenter('ao_tab_decr');
					break;
				
				// 分析对象
				// 全账户
				case 'AoAccount':
					me.setContext('level', 'useracct');
					needRefresh = true;
					break;
				// 高消费词
				case 'TopPaysum':
					me.setContext('level', 'toppaysumwords');
					needRefresh = true;
					break;
				// 高点击词
				case 'TopClks':
					me.setContext('level', 'topclkswords');
					needRefresh = true;
					break;
				// 高展现词
				case 'TopShows':
					me.setContext('level', 'topshowswords');
					needRefresh = true;
					break;
				// 监控的关键词
				case 'PropFolders':
					me.setContext('level', 'selectedfolder');
					needRefresh = true;
					break;
				// 携带物料
				case 'propMySelected':
					me.setContext('level', me.getContext('importLevel'));
					needRefresh = true;
					break;
				
				// 高消费词按钮...
				case 'ctrlbuttonTopPaysumSet':
					dialogParams.id = "materialList";
					dialogParams.actionPath = "/tools/proposal/materialList";
					dialogParams.params = {
						type: "toppaysumwords"
					};
					isDetail = true;
					break;
				// 高点击词按钮...
				case 'ctrlbuttonTopClksSet':
					dialogParams.id = "materialList";
					dialogParams.actionPath = "/tools/proposal/materialList";
					dialogParams.params = {
						type: "topclkswords"
					};
					isDetail = true;
					break;
				// 高展现词按钮...
				case 'ctrlbuttonTopShowsSet':
					dialogParams.id = "materialList";
					dialogParams.actionPath = "/tools/proposal/materialList";
					dialogParams.params = {
						type: "topshowswords"
					};
					isDetail = true;
					break;
				// 监控的关键词按钮...
				case 'ctrlbuttonFolderSet':
					dialogParams.id = "aoFolderList";
					dialogParams.actionPath = "/tools/proposal/folderList";
					dialogParams.width = 320;
					isDetail = true;
					break;
				// 携带物料按钮...
				case 'ctrlbuttonMySelectedList':
					dialogParams.actionPath = "/tools/proposal/selectedList";
					dialogParams.params = {
						type: me.getContext("importLevel"),
						data: me.getContext("importData")
					};
					// 计划单元和关键词创意的宽度不同
					switch (me.getContext('importLevel')) {
						case 'planinfo':
						case 'unitinfo':
							dialogParams.id = 'aoMySelectedPUList';
							dialogParams.width = 320;
							break;
						case 'wordinfo':
						case 'ideainfo':
							dialogParams.id = 'aoMySelectedWIList';
							dialogParams.width = 430;
							break;
					}
					isDetail = true;
					break;
				
				// 设置
				case 'PropSet':
					setPropThreshold(me);
					nirvana.aoWidgetAction.logCenter('ao_custom_set');
					break;
			}
			
			if (needRefresh) {
				nirvana.aoControl.changeParams(params);
				
				nirvana.aoWidgetAction.logCenter('ao_level_switch');
				
				// 筛选切换时重置全部建议
				//me.resetStages();
				me.refresh();
			}
			if (isDetail) {
				nirvana.aoWidgetAction.logCenter('ao_level_list');
				
				var pos = baidu.dom.getPosition(target);
				dialogParams.left = pos.left - 9;
				dialogParams.top = pos.top - 73;
				//打开浮出框
				nirvana.util.openSubActionDialog(dialogParams);
			}
			
			baidu.event.stop(e);
		}
	},
	
	//获取导入的数据id
	getImportIds: function(){
		var me = this,
			level = me.getContext("importLevel"), 
			data = me.getContext("importData"), 
			planids = [],
			unitids = [],
			wordids = [],
			ideaids = [],
			condition = {};
		
		switch (level) {
			case "planinfo":
				for (var i = 0, l = data.length; i < l; i++) {
					planids[i] = data[i]["planid"];
				}
				condition["planid"] = planids;
				break;
			case "unitinfo":
				for (var i = 0, l = data.length; i < l; i++) {
					planids[i] = data[i]["planid"];
					unitids[i] = data[i]["unitid"];
				}
				condition["planid"] = planids;
				condition["unitid"] = unitids;
				break;
			case "wordinfo":
				for (var i = 0, l = data.length; i < l; i++) {
					planids[i] = data[i]["planid"];
					unitids[i] = data[i]["unitid"];
					wordids[i] = data[i]["winfoid"];
				}
				condition["planid"] = planids;
				condition["unitid"] = unitids;
				condition["winfoid"] = wordids;
				break;
			case "ideainfo":
				for (var i = 0, l = data.length; i < l; i++) {
					planids[i] = data[i]["planid"];
					unitids[i] = data[i]["unitid"];
					ideaids[i] = data[i]["ideaid"];
				}
				condition["planid"] = planids;
				condition["unitid"] = unitids;
				condition["ideaid"] = ideaids;
				break;
		}
		return condition;
	},
	/************************************  快捷筛选 end  ************************************/
	
	
	/************************************  漏斗区域 start  ************************************/
	
	/**
	 * 推广阶段绑定事件
	 */
	bindStages : function() {
		var me = this;
		
		return function(e) {
			var e = e || window.event,
				target = e.target || e.srcElement,
				tagName = target.tagName.toLowerCase(),
				controlMap = me._controlMap,
				parentTarget,
				subStage;
			
			me.clearStages();
			
			if (tagName == 'a') {
				parentTarget = baidu.dom.getAncestorByTag(target, 'li');
				
				baidu.addClass(target, 'active');
				if (!baidu.dom.hasClass(parentTarget, 'all')) {
					baidu.addClass(parentTarget, 'active');
				}
				
				subStage = target.id.replace('AoStage', '');
				
				me.setContext('stage', subStage);
				
				// 推广阶段筛选
				me.filtetStages();
				
				me.setContext('targets', nirvana.config.AO.TARGETS[subStage.toUpperCase()]);
								
				me.initDataArea();
				
				// 监控参数
				var logParam = {
					type : target.getAttribute('id').replace(/AoStage/, '').toLowerCase()
				};
				
				nirvana.aoWidgetAction.logCenter('ao_stage_filter', logParam);
				
				// 数据区域表格重新计算
				if (controlMap.AoDataTable) {
					controlMap.AoDataTable.refreshView();
				}
				
				baidu.event.stop(e);
			}
		};
	},
	
	/**
	 * 推广阶段筛选
	 */
	filtetStages : function() {
		var me = this,
			stage = me.getContext('stage'),
			idArr = ['AoGroupTime', 'AoGroupKeyword', 'AoGroupBid', 'AoGroupQuality', 'AoGroupSpeed', 'AoGroupPage', 'AoGroupTrans', 'AoGroupPvTip', 'AoGroupTransTip'],
			i;
		
		for (i in idArr) {
			if (baidu.g(idArr[i])) {
				baidu.addClass(idArr[i], 'hide');
			}
		}
		
		switch (stage) {
			case 'All':
				for (i in idArr) {
					if (baidu.g(idArr[i])) {
						baidu.removeClass(idArr[i], 'hide');
					}
				}
				me.refresh();
				break;
			case 'Speed':
			case 'Page':
				if (baidu.g('AoGroupPvTip')) {
					baidu.removeClass('AoGroupPvTip', 'hide');
				}
				if (baidu.g('AoGroup' + stage)) {
					baidu.removeClass('AoGroup' + stage, 'hide');
				}
				break;
			case 'Trans':
				if (baidu.g('AoGroupTransTip')) {
					baidu.removeClass('AoGroupTransTip', 'hide');
				}
				if (baidu.g('AoGroup' + stage)) {
					baidu.removeClass('AoGroup' + stage, 'hide');
				}
				break;
			default:
				if (baidu.g('AoGroup' + stage)) {
					baidu.removeClass('AoGroup' + stage, 'hide');
				}
				break;
		}
	},
	
	/**
	 * 清除当前激活的阶段
	 */
	clearStages: function(){
		var list = baidu.q('active', 'ProposalStageList');
		
		for (var i = 0, j = list.length; i < j; i++) {
			// 清除当前激活的阶段
			baidu.removeClass(list[i], 'active');
		}
	},
	
	/**
	 * 重置推广阶段，选中全部建议
	 */
	resetStages : function() {
		var me = this;
		
		me.clearStages();
		
		// 导航定位到“全部优化建议”
		// 这里全部优化建议代替了原来的全部建议，全部建议隐藏
		baidu.addClass('AoAll', 'active');
		
		//baidu.addClass('AoStageAll', 'active');
		
		nirvana.aoControl.opttype = nirvana.config.AO.OPTTYPE['ALL'];
		
		me.setContext('stage', 'All');
		me.setContext('targets', nirvana.config.AO.TARGETS['ALL']);
	},
	
	/************************************  漏斗区域 end  ************************************/
	
	
	/************************************  数据区域 start  ************************************/
	
	/**
	 * 数据区域初始化
	 */
	initDataArea : function() {
		var me = this,
			targetsText = me.getContext('targetsText'),
			html = '<span class="gray">%title：</span><span class="ao_em" title="%tip">%sum</span>%unit<span>%desc</span>',
			datasource = [],
			targets;
		
		me.dataAreaLoading();
		
		baidu.removeClass('ProposalData', 'hide');
		
		me.filtetTargets();
		
		targets	= me.getContext('targets'); // 获取当前的targets
		
		if (targets.length == 0) {
			ui.util.get('AoDataTable').datasource = [];
			ui.util.get('AoDataTable').render();
			
			me.dataAreaDone();
			
			return;
		}
		
		fbs.ao.getTargetsSum({
			level       : 'useracct',
			condition   : {},
			targets		:	targets,
			onSuccess	:	function(response) {
				if (!ui.util.get('AoDataTable')) { // 关闭工具栏时，控件被注销
					return;
				}
				
				var data = response.data.sumData,
					date = baidu.date.parse(response.data.date),
					len = data.length,
					desc = '',
					value = '',
					sumTip = '',
					rate	=	'',
					unit = '',
					i, j,
					tmp,
					target,
					tmpData = [];
				
				if (baidu.g('AoDataDate')) {
					baidu.g('AoDataDate').innerHTML = baidu.date.format(date, 'MM月dd日');
				}
				
				for(i = 0; i < len; i++) {
					tmp = data[i];
					
					target = tmp.target;

					// 与同行的百分比
					rate = tmp.percentage;
					
					// 后端返回的value都是字符串包含的数字
					value = tmp.value;
					
					unit = targetsText[target].unit;
					
					// 设置desc描述信息
					if (rate == '0%') {
						desc = '（行业优秀水平）';
					} else if (rate != '-1') {
						switch (target) {
							case 'lastofftime' :
								// 最晚下线时间
								desc = '（早于' + rate + '的同行）';
								break;
							default :
								desc = '（低于' + rate + '的同行）';
								break;
						}
					} else {
						desc = '';
					}

					// value为-1时，代表数据没有计算完成
					if (value == '-1') {
						value = '-';
						unit = '';
						desc = '';
						sumTip = '数据尚需积累，还请明日查看。';
					} else {
						sumTip = '';
						
						// 设置特殊的value和desc
						switch (target) {
							case 'lastofftime' :
								value = baidu.date.format(new Date(+value), 'HH:mm:ss');
								break;
							case 'conntime' :
								value = +value;
								if (value <= 5) {
									desc = '（您的网站打开时间良好）';
								} else if (value <= 10) {
									desc = '（您的网站打开时间一般）';
								} else {
								desc = '（您的网站打开时间过长）';
								}
							break;
						}
					}
					
					tmpData.push(html.replace(/%title/, targetsText[target].title).
										replace(/%sum/, value).
										replace(/%tip/, sumTip).
										replace(/%unit/, unit).
										replace(/%desc/, desc));
				}
				
				for (i = 0, j = tmpData.length; i < j; i = i + 2) {
					datasource.push({
						left : tmpData[i],
						right : tmpData[i + 1] ? tmpData[i + 1] : ''
					});
				}
				
				ui.util.get('AoDataTable').datasource = datasource;
				
				ui.util.get('AoDataTable').render();
				
				// 数据区域表格适应
				baidu.event.fire(window, 'resize');
				
				me.dataAreaDone();
			},
			onFail  :   function(response){
				ajaxFailDialog();
				me.dataAreaDone();
			}
		});
	},
	
	/**
	 * 根据权限，过滤请求所需的targets
	 * 对于所有指标均设置开关，对于userid可配，且开关状态与账户分析模块保持一致。
	 */
	filtetTargets : function() {
		var me = this,
			targets = me.getContext('targets'),
			targetsAuth = me.getContext('targetsAuth');
		
		targets = baidu.array.filter(targets, function(target, index) {
			return targetsAuth[target] == 0; // 有权限
		});
		
		me.setContext('targets', targets);
	},
	
	/**
	 * 数据区域loading
	 */
	dataAreaLoading : function() {
		var me = this,
			loadId = 'AoDataTableLoading',
			table = ui.util.get('AoDataTable').main;
		
		if (!me.arg.refresh) {
			baidu.g(loadId).innerHTML = FILL_HTML.LOADING.replace(/%s/, nirvana.config.LANG.LOADING);
		}
		
		baidu.removeClass(loadId, 'hide');
		baidu.addClass(table, 'hide');
	},
	
	/**
	 * 数据区域加载完毕
	 */
	dataAreaDone : function() {
		var me = this,
			loadId = 'AoDataTableLoading',
			table = ui.util.get('AoDataTable').main;
		
		baidu.addClass(loadId, 'hide');
		baidu.removeClass(table, 'hide');
	}
	
	/************************************  数据区域 end  ************************************/
	
};

ToolsModule.proposal = new ToolsModule.Action('proposal', nirvana.ao.lib.action);