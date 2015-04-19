/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: adpreview/adpreview.js 
 * desc: 数据分析业务逻辑处理器 
 * author: wangzhishou@baidu.com tongyao@baidu.com
 * date: $Date: 2011/2/11 $
 */
ToolsModule.report = new ToolsModule.Action('report', {
	/**
	 * 视图模板名，或返回视图模板名的函数
	 */
	VIEW : 'report',
	
	/**
	 * ToolsModule里写statemap没有实际意义，只是当注释用了，标明那些是用于保持的context
	 */
	STATE_MAP : {
		newReportOptName : "",			// 操作人
		newReportTargetType	:	2, //默认账户
		currentParams : {}, //生成当前报告的参数
		expandHistory : [], //下钻报告的历史数据
		pageSize	:	50, //分页尺寸
		pageNum		:	1,	//当前页面
		tipIndex   :   [],  //信息提示区的当前提示
		keywordError : 0,  //储存关键词报告下钻时的错误代码（用于和创意报告的切换。。。）
		reportXijing : ''
	},

	//重置工具时，通过判断.refresh决定是否重置所有STATE_MAP中定义的context
	onbeforeinitcontext : function(){
		var me = this,
			stateMap = this.STATE_MAP || {};
		
		if(!me.arg.refresh){
			me.arg.queryMap.ignoreState = true;
		}
	},

	/**
	 * 在模板中写一长串的控件属性会难以理解。该属性能以“控件id/属性集合”的形式在外部书写控件属性，使格式更清晰。
	 */
	UI_PROP_MAP : {
		NewReportCalendar	:	{
			value : '*reportDateRange',
			availableRange	:	'*newReportCalendarAvailableRange',
			miniOption	:	'*reportMiniOption'
		},
	/*	reportCalendar : {
			type  : 'MultiCalendar',
			value : '*reportDateRange',
			availableRange	:	'*newReportCalendarAvailableRange',
			miniOption	:	'*reportMiniOption'
		},
		*/
		// 物料列表控件
		NewReportMaterialList : {
			level : '*newReportMaterialType',
			form : 'material',
			width : '450',
			height : '300',
			onAddLeft : '*newReportAddObjHandler',
			tableOption : '*newReportMaterialTableOptions',
			onclose : '*newReportMaterialCloseHandler',
			needDel : 'true',
			addWords : '*addedWords',
			noDataHtml : FILL_HTML.EXCEED_LIST.replace(/%s/, '数据报告')
		},
		reportName : {
			datasource	:	'*reportName'
		},
		reportTable : {
			sortable : 'true',
			dragable : 'true',
		//	scrollYFixed:'true',
		//	colViewCounter : 'all',
			noDataHtml : FILL_HTML.NO_DATA,
			fields: '*reportTableFields',		
			datasource : '*reportTableData'
		},
		reportMaxtrixTable : {
			sortable : 'false',
			noDataHtml : FILL_HTML.NO_DATA,
			fields: '*reportTableFields',		
			datasource : '*reportTableData'
		},
		// 分页
		reportPagination : {
			type : 'Page',
			total : '0'
		},
		// 邮件地址输入
		NewMailInput : {
			type : 'TextInput',
			width : '140',
			height: '22'
		},
		// 循环频率
		NewCycleRate : {
			datasource : '*cycleRate',
			value : '2',
			width : '180'
		},
		// 查看权限
		NewReportLevel : {
			datasource : '*reportLevel',
			value : '100',
			width : '180'
		},
		// 查看权限
		NewDoSend : {
			type : 'CheckBox'
		}
	},

	/**
	 * 初始化context的函数集合，name/value型Object。其value为Function的map，value
	 * Function被调用时this指针为Action本身。value
	 * Function的形参需要有一个callback参数，参数为Function类型，手工回调。
	 */
	CONTEXT_INITER_MAP : {
		/**
		 * 初始化
		 */
		init : function(callback) {
			var me = this;
			
			me.initNewReportSelect();
			me.setContext('reportName', '');
			callback();
		},
		
	/*	getChargeModel : function(callback){
			fbs.trans.getChargeModel({
				onSuccess : function(data){
					nirvana.report.chargeModel = data.data;
					callback();
				},
				onFail : function(){
					nirvana.report.chargeModel = 0;
					callback();
				}
			});
		},*/
		
		reportType : function(callback){
			this.setContext('isInstantReport', true);
			callback();
		},
		
		/**
		 * 关于物料选择初始化
		 */
		material : function (callback) {
			// 物料选择器
			this.setContext('newReportMaterialType',['user','plan']);
	        this.setContext('newReportMaterialTableOptions', {width:450, height:200});
			this.setContext('newReportAddObjHandler', this.addObjHandler());
			this.setContext('newReportMaterialCloseHandler', this.newReportMaterialCloseHandler);
			callback();
		},
		
		// 下拉列表渲染
		renderSelect : function(callback) {
			var me = this,
			// 循环报告
			params = me.getContext('currentParams');
			if (!me.getContext('cycleRate')) { //初始化为默认值
				me.setContext('cycleRate', [{
					value: '0',
					text: '一次生成'
				},{
					value: '1',
					text: '每天'
				}]);
			}
			
			// 报告权限
			if (!me.getContext('reportLevel')) {				
				var options = [{
					value: '100',
					text: nirvana.config.LANG.REPORT.REPORTLEVEL[100]
				}, {
					value: '200',
					text: nirvana.config.LANG.REPORT.REPORTLEVEL[200]
				}, {
					value: '201',
					text: nirvana.config.LANG.REPORT.REPORTLEVEL[201]
				}, {
					value: '300',
					text: nirvana.config.LANG.REPORT.REPORTLEVEL[300]
				}];
				
				
				switch (nirvana.env.REPORT_LEVEL) {
					case 201: //客户经理
						options.splice(1,1);
						options.splice(2,1);
						break;
					case 200: //顾问
						options.splice(2, 2);
						break;
					case 100: //用户
						options.splice(1, 3);
						break;
				}
				
				me.setContext('reportLevel', options);
			}
			//定制报告
			if (!me.getContext('generateReport')) { //只初始化一次
				me.setContext('generateReport', [{
					value: -9999,
					text: '生成报告'
				}, {
					value: 'customize',
					text: '定制报告'
				}]);
			}
			
		if (!me.getContext('firstDayOptions')) {
			me.setContext('firstDayOptions', [ 
					{
						value : 1,
						text : '周一为第一天'	
					}, 
					{
						value : 2,
						text : '周二为第一天'
					}, 
					{
						value : 3,
						text : '周三为第一天'
					}, 
					{
						value : 4,
						text : '周四为第一天'
					},
					{
						value : 5,
						text : '周五为第一天'
					}, 
					{
						value : 6,
						text : '周六为第一天'
					}, 
					{
						value : 7,
						text : '周日为第一天'
					}
				]);
		
			}
			callback();
		},
		
		/**************报告展示部分需要的INIT方法**************/
		/**
		 * 报告数据部分的日历（与参数选择部分共用变量）
		 * @param {Object} callback
		 */
		reportCalendar : function(callback){
			var me = this;
			
			me.setContext("reportMiniOption",[0,1,2,3,4]);
			var params = me.getContext('currentParams');
			
			if(params && params.starttime && params.endtime && params.starttime != '' && params.endtime != ''){
				me.setContext('reportDateRange', {
					begin: baidu.date.parse(params.starttime),
					end: baidu.date.parse(params.endtime)
				});
			//	me._setLoopSettingStatus(params.isrelativetime);
			} else {
				//没有params的时候是第一次进入，还未生成报告时
				//进行初始化，默认最近七天
				var dateRange = nirvana.util.dateOptionToDateValue(1); //最近七天
				me.setContext('reportDateRange', dateRange);
				var rangeEndDate = new Date();
				rangeEndDate.setFullYear(dateRange.end.getFullYear());
				rangeEndDate.setMonth(dateRange.end.getMonth());
				rangeEndDate.setDate(dateRange.end.getDate() + 1);
				me.setContext('newReportCalendarAvailableRange', {
					begin : baidu.date.parse('2008-11-01'),
					end : rangeEndDate
				});
			}
			callback();
		},
		
		reportTable : function(callback){
			var me = this;
			if (!me.getContext('reportTableFields')) {
				me.setContext('reportTableFields', []);
				me.setContext('reportTableData', []);
			}
			callback();
		}
	},

	/**
	 * refresh后执行
	 */
	onafterrepaint : function() {
		//每次refresh之后，根据当前的参数重新发起请求
		var me = this;
		baidu.hide('NewReportPrompt');
		me.generateInstantReport(me.getContext('currentParams'));
	},

	/**
	 * 第一次render后执行后最后会触发事件
	 */
	onafterrender : function() {
		var me = this,
		    controlMap = me._controlMap,
			regionOption = controlMap['NewReportAreaOption'];

		//外部链接：蹊径和高级样式
		EXTERNAL_LINK.reportInit("ReportExtLink");
		
		//设置提示话术
	//	 if(nirvana.report.chargeModel == 1){
	//		baidu.g('phonetransTip').innerHTML = LXB.PHONETRANSTIP['0'];
	//	}else{
			baidu.g('phonetransTip').innerHTML = LXB.PHONETRANSTIP['1'];
	//	};
		//初始化特殊权限报告类型的显示
		me.initAuthReport();
	
		//报告参数部分
/*
		baidu.on('ToggleParam', 'click', function(e) {
			me._toggleParamsContainer();
			baidu.event.preventDefault(e);
		});*/
			
		baidu.g('NewReportContainer').onclick = this.closeNewReportMaterial();
		baidu.g('NewReportTargetTypeDiv').onclick = this.typeTabHandler();
		ui.util.get('NewReportSelectedList').onaddclick = this.openMaterialSelect();
		
		// 跳转到我的报告action
		baidu.g('ToMyReport').onclick = baidu.g('MyReportRedirectPrompt').onclick = function() {
			me.redirect('/tools/myReport', {});
			return false;
		};
		
		//指标选择浮动层
		ui.util.get('itemSelect').onclick = function(){
			nirvana.report.lib.itemsSelectPanel.open(me);
	
		};

		var calendar = controlMap['NewReportCalendar'];
		//默认日历时间为最近七天，所以为相对时间
		calendar.relativeValue = 1; //1代表最近七天

		calendar.onselect = function(){
			// var isRelativeTime = controlMap['NewReportCalendar'].relativeValue !== false;
			
			//	me._setLoopSettingStatus(isRelativeTime);

			// bugfix，尝试修复下钻时，时间改变了，但是携带参数是否是相对时间仍然错误的问题
			// by Leo Wang
			// var relativeTimeText = me.getRelativeValue(calendar.getValue());
			// if(relativeTimeText === false) {
			// 	calendar.relativeValue = false;
			// }
			// else {
			// 	var optlist = calendar.controlMap.mmcal.optionList;
			// 	for(i = 0; i < optlist.length; i++) {
			// 		if(relativeTimeText == optlist[i].text) {
			// 			calendar.relativeValue = i;
			// 			break;
			// 		}
			// 	}
			// }
			me.fixRelativeValue();
		};
		
		//初始时隐藏周几为第一天的选择框
		controlMap['firstDayByOption'].hide(true);
		
		//隐藏物料选择器的弹出框
		baidu.hide('NewReportMaterialWrap');
		
		//点击地域指标
		regionOption.onclick = function(){
			//将数据指标置为全部  当对话框存在时 按照层级设置对话框中的项
			baidu.g('itemSelectResult').innerHTML = '全部';
			if(nirvana.report.lib.itemsSelectPanel.itemCheckboxGroup){
				if(ui.util.get("ReportItemSelectDialog")){
					ui.util.get("ReportItemSelectDialog").hide();
				}
				nirvana.report.lib.itemsSelectPanel.setOptions(me);
			}
		};
			
		//查询层级点击响应函数
		baidu.on('NewReportSearchTypeDiv', 'click', function(e){
			var e = e || window.event,
			    target = e.target || e.srcElement,
				tagName = target.tagName.toLowerCase();
			if(tagName == 'input' && target.type == 'radio'){
				//根据查询层级变更排序指标
			//	me._updateItemMap();
				if(ui.util.get("ReportItemSelectDialog")){
					ui.util.get("ReportItemSelectDialog").hide();
				}
				//将数据指标置为全部  当对话框存在时 按照层级设置对话框中的项
				baidu.g('itemSelectResult').innerHTML = '全部';
				if(nirvana.report.lib.itemsSelectPanel.itemCheckboxGroup){
					nirvana.report.lib.itemsSelectPanel.setOptions(me);
				}
				me._updateOrderByOptions();
			}
		});
		//推广平台点击响应函数
		baidu.on('NewReportPlatformDiv', 'click', function(e){
			var e = e || window.event,
			    target = e.target || e.srcElement,
				tagName = target.tagName.toLowerCase();
			if(tagName == 'input' && target.type == 'radio'){
				//如果推广方式选择了网盟，需要禁用关键词的可选项
				me._updateMtlLevelOptions(); //这里直接调用了查询层级的更新方法，设计上有点坏味道，但代码量少，且性能一样
			}
		});
		
		//时间单位选择点击相应 added by huanghainan
		baidu.on('ReportTimeOption', 'click', function(e) {
			var e = e || window.event,
				target = e.target || e.srcElement,
				tagName = target.tagName.toLowerCase();
			var firstDay = controlMap['firstDayByOption'];
			//console.log(firstDay);
			if (tagName == 'a' && target.rel && !baidu.dom.hasClass(target,'time_option_disabled')) {
				baidu.removeClass(baidu.q('current', 'ReportTimeOption', 'a')[0], 'current');
				baidu.addClass(target, 'current');	
				if(target.rel == 'byWeek') {
					baidu.addClass(target, 'by_week_adjust');
					firstDay.hide(false);
				}else {
					baidu.removeClass('Week','by_week_adjust');
					firstDay.hide(true);
				}		
			}
			baidu.event.preventDefault(e);
		});
		//快捷模板点击响应
		baidu.on('ReportParamsShortcut', 'click', function(e){
			var e = e || window.event,
				target = e.target || e.srcElement,
				tagName = target.tagName.toLowerCase(),
				datasource = [];
			
			if (tagName == 'a' && target.rel) {
				if(!baidu.dom.hasClass('ReportParams','hide'))
						baidu.addClass(baidu.g('ReportParams'),'hide');
				if(!baidu.dom.hasClass('AvatarOption','hide'))
						baidu.addClass(baidu.g('AvatarOption'),'hide');
				if(!baidu.dom.hasClass('WMatchModeOption','hide'))
						baidu.addClass(baidu.g('WMatchModeOption'),'hide');
				if(!baidu.dom.hasClass('RegionFixMethod','hide'))
						baidu.addClass(baidu.g('RegionFixMethod'),'hide');
				if(!baidu.dom.hasClass('DeviceOption','hide'))
                        baidu.addClass(baidu.g('DeviceOption'),'hide');
								
				me.setTimeDimEnable();
				var rel = target.rel;
				switch(rel){				
					case 'custom': 
						if(me.getContext('newReportSelectedAutoState') && me.getContext('newReportTargetType') == 8) 
						{//如果物料带入为监控文件夹，则初始转到指定范围报告时物料对象显示为账户
							me.refillInstantForm(nirvana.report.lib.getParamsTemplate('custom', me));
							me.initReportTips('false');
						}
	
						baidu.removeClass(baidu.g('ReportParams'),'hide');
						break;
					case 'avatar':
						baidu.removeClass(baidu.g('AvatarOption'),'hide');
						break;
					case 'match':
						baidu.removeClass(baidu.g('WMatchModeOption'),'hide');
						me.setTimeDimDisable('byDay');
						break;
					case 'invalid':
						me.setTimeDimDisable('byDay');
						break;
					case 'region':
						baidu.removeClass(baidu.g('RegionFixMethod'),'hide');
						break;
					default:
						break;
					}
				nirvana.report.lib.showDeviceArea(rel); //设备选择是否显示处理		
				baidu.removeClass(baidu.q('current', 'ReportParamsShortcut', 'a')[0], 'current');
				baidu.addClass(target, 'current');
				//me._toggleParamsContainer(true); //显示参数部分	\
				
				//蹊径子链报告屏蔽定制报告、循环报告和发送报告功能，下次想打开的时候直接注释掉这段代码(两个地方，另一个在lib_report.js中setReportControl方法)
                if (target.rel == "sublink") {
                    ui.util.get("launchNewReport").disableItemByValue("customize");
                }
                else {
                    ui.util.get("launchNewReport").disableItemByValue("customize", false);
                }
				
				
				
				
				//切换报告类型时清空监控文件夹的物料信息
				if(target.rel != 'avatar' && me.getContext('newReportTargetType') == 8){
					me.setContext('addedWords','');
				}	
			}
			baidu.event.preventDefault(e);
		});
		
		//计划报告设备选择处理
        baidu.on('DeviceOption', 'click', function(e) {
            var e = e || window.event,
                target = e.target || e.srcElement,
                tagName = target.tagName.toLowerCase();
            if (tagName == 'a' && target.rel) {
                baidu.removeClass(baidu.q('current', 'DeviceOption', 'a')[0], 'current');
                baidu.addClass(target, 'current');              
            }
            baidu.event.preventDefault(e);  
        });
		//监控文件夹选择处理
		baidu.on('AvatarOption', 'click', function(e) {
			var e = e || window.event,
				target = e.target || e.srcElement,
				tagName = target.tagName.toLowerCase();
			if (tagName == 'a' && target.rel) {
				baidu.removeClass(baidu.q('current', 'AvatarOption', 'a')[0], 'current');
				baidu.addClass(target, 'current');				
			}
			baidu.event.preventDefault(e);	
		});
		
		//匹配模式选择处理
		baidu.on('WMatchModeOption', 'click', function(e) {
			var e = e || window.event,
				target = e.target || e.srcElement,
				tagName = target.tagName.toLowerCase();
			if (tagName == 'a' && target.rel) {
				baidu.removeClass(baidu.q('current', 'WMatchModeOption', 'a')[0], 'current');
				baidu.addClass(target, 'current');	
			}
			baidu.event.preventDefault(e);	
		});
		
		//有物料选择时默认使用自定义模板，无物料选择时默认打开账户模板
		//特殊case：如果选择的物料为监控文件夹，则打开监控文件夹模板
		//added by huanghainan
		var initParams;
		if(me.getContext('newReportSelectedAutoState')) {
			if(me.getContext('newReportTargetType') == 8) {
				//监控文件夹报告
				initParams = nirvana.report.lib.getParamsTemplate('avatarfile', me);
				initParams.mtldim = me.getContext('newReportTargetType');
				//监控文件夹虽然不用回填表单，但是有个物料集合赋值的问题，待解决
				baidu.removeClass(baidu.q('current', 'ReportParamsShortcut', 'a')[0], 'current');
				baidu.addClass('AvatarReport', 'current');
				baidu.removeClass('AvatarOption','hide');

				//me.refillInstantForm(nirvana.report.lib.getParamsTemplate('custom', me));
				me.initReportTips('false');

			}else {
				//指定范围报告
				initParams = nirvana.report.lib.getParamsTemplate('custom', me);
				initParams.mtldim = me.getContext('newReportTargetType');
				me.refillInstantForm(initParams);
				me.initReportTips('true');
				baidu.removeClass(baidu.q('current', 'ReportParamsShortcut', 'a')[0], 'current');
				baidu.addClass('CustomReport', 'current');
				baidu.removeClass(baidu.g('ReportParams'),'hide');
			}
		}else {
			//无物料带入时虽然不打开指定范围报告模板，但还是要用默认参数初始化一下操作区，否则之后切换会有问题
			me.refillInstantForm(nirvana.report.lib.getParamsTemplate('custom', me));
			me.initReportTips('false');
		}
			
	
		
		//生成报告(包括按钮和提示信息中的链接)
		controlMap.launchNewReport.clickCurFunc = baidu.g('NewReportPromptLaunchBtn').onclick = function(){
			//存一下选定的物料
			me.setContext('newReportSelectedData', baidu.object.clone(me._controlMap['NewReportSelectedList'].datasource));
			
			var param = me.getLaunchReportParams();
			
			if (param.reporttag == 1) { // 循环报告
				me.addReportInfo(param);
			} else {
				me.launchInstantReport(param);
			}
			var logParams = {
				target : "launchNewReport",
				shortcut: baidu.getAttr($$("#ReportParamsShortcut a.current")[0], "rel")
			};
			NIRVANA_LOG.send(logParams);

			return false;
		};
		
		//定制报告 add by liuyutong
			
		controlMap.launchNewReport.onselect = function(typeValue){
			var params = me.getLaunchReportParams();
			var param = baidu.extend(baidu.object.clone(me.defaultParams), params);
			me.setContext('currentParams',param);
			me.reportSelectHandler(typeValue);
		}
		/***报告展示区域的事件***/
		
		//分页
		controlMap['reportPagination'].onselect = function(pageNum){
			me.setContext('pageNum', pageNum);
			//翻页仅刷新表格，就不用refresh了
			nirvana.displayReport.renderInstantReportTable(me.getContext('reportTableData'), me);
		};
		
		//表格的排序
		controlMap["reportTable"].onsort = function(sortField,order){
			var tableData = me.getContext('reportTableData');
			
			nirvana.util.loading.init();	
			tableData = nirvana.displayReport.orderData(tableData, sortField.field, order);
			nirvana.displayReport.renderInstantReportTable(tableData, me);
			nirvana.util.loading.done();
			
			me.setContext('reportTableData', tableData);
		};
		
        // 给表格注册行内编辑处理器
        controlMap.reportTable.main.onclick = me.tableHandler();
		
		//图表Toggle按钮
		baidu.on('ToggleReportChart', 'click', function(e) {
			nirvana.displayReport._toggleChartContainer();
			
			baidu.event.preventDefault(e);
		});
		
		//返回上一个报告
		baidu.g('ReportFoldBtn').onclick = function(){
			me.foldInstantReport();
			return false;
		};
		
		//给操作区添加click事件（为了处理信息提示区部分联动）
		baidu.on('ReportParmasArea', 'click', function(e) {
			var e = e || window.event,
				target = e.target || e.srcElement;
			
			if(target.value == 'area' || target.name == 'NewReportPlatform' || target.name == 'NewReportSearch') {
				me._updateTipContent();
			}
			
		});
	},

	/**
	 * 完成视图更新后最后会触发事件
	 */
	onentercomplete : function() {
		var me = this;
		if(baidu.browser.ie){
			baidu.g('ReportTableWrap').style.zoom = 0;
			baidu.g('ReportTableWrap').style.zoom = 1;
		}
		// fix calendar relative value
		// by Leo Wang
		me.fixRelativeValue();
	},
	
	onleave : function(){
		nirvana.report.lib.itemsSelectPanel.dispose();
	},

	/**
	 * fix calendar relativeValue
	 * by Leo Wang
	 * TODO: FIX Calendar UI
	 */
	fixRelativeValue: function() {
		var me = this;
		// bugfix，尝试修复下钻时，时间改变了，但是携带参数是否是相对时间仍然错误的问题
		// by Leo Wang
		var calendar = me._controlMap['NewReportCalendar'];
		var relativeTimeText = me.getRelativeValue(calendar.getValue());
		if(relativeTimeText === false) {
			calendar.relativeValue = false;
		}
		else {
			var optlist = calendar.controlMap.mmcal.optionList;
			for(var i = 0; i < optlist.length; i++) {
				if(relativeTimeText == optlist[i].text) {
					calendar.relativeValue = i;
					break;
				}
			}
		}
	},

	/**
	 *将时间单位中除了传入rel那一项，其余选项置灰 
	 */
	setTimeDimDisable : function(rel) {
		var me = this,
		timeDim = baidu.dom.children('ReportTimeOption');
		this._controlMap['firstDayByOption'].hide(true);
		for(var i = 0; i < timeDim.length; i++) {
			if(baidu.getAttr(timeDim[i],'rel') == rel) {
				baidu.removeClass(baidu.q('current', 'ReportTimeOption', 'a')[0], 'current');
				baidu.addClass(timeDim[i], 'current');
				
			}else{
				baidu.addClass(timeDim[i],'time_option_disabled');
			}
		}
	},
	/**
	 *将时间单位中置灰的复原
	 */
	setTimeDimEnable : function() {
		var timeDim = baidu.dom.children('ReportTimeOption');
		if (timeDim.length > 0) {
			for (var i = 0; i < timeDim.length; i++) {
				if (baidu.dom.hasClass(timeDim[i], 'time_option_disabled')) {
					baidu.removeClass(timeDim[i], 'time_option_disabled');
				}
			/*
				if (baidu.dom.hasClass(timeDim[i], 'current')) {
					baidu.removeClass(timeDim[i], 'current');
				}*/
			}
			
			//baidu.dom.addClass(timeDim[1],'current');
			
			//var me = this;
			//me._controlMap['firstDayByOption'].hide(true);
		}
	},
	/**
	 * 初始化指定范围报告的信息提示区 by huanghainan
	 * @param {Object} hasMaterial 是否有物料带入（不包括监控文件夹物料）
	 * 如果有物料带入，则发送请求询问是否显示第一条信息
	 */
	initReportTips : function(hasMaterial) {
		var me = this,
			isprompt = false;
		if(hasMaterial != 'true') {
			me.initTipsArea(isprompt);
		}else{			
			//向后台询问是否显示该信息，注意三个月后将不发送该询问
			var serviceTime = new Date(nirvana.env.SERVER_TIME * 1000),
				endTime = baidu.date.parse(nirvana.config.PROMPT_DATE_END);	
			if(serviceTime < endTime){
				fbs.report.isPrompt({
				//optid : nirvana.env.OPT_ID,
				callback : function(data) {					
					if(data && data.data) { //如果返回true					
						isprompt = true;					
					}
					me.initTipsArea(isprompt);					
					}
				});
			}else{
				me.initTipsArea(false);
			}
		}

	},
	/**
	 * 初始化指定范围报告的信息提示区html by huanghainan
	 * @param {Object} isprompt 是否显示第一条信息
	 */
	initTipsArea : function(isprompt) {
		var me = this,
		controlMap = me._controlMap,
		tips = nirvana.config.REPORT_TIPS,
		html = [],
		tipChosen = [],
		tipBtn = [];	
		//console.log(tips);
		//'报告内容：您选择#下的#的#的#数据报告。'（注意配置中该信息需要为最后一条）
		var sel = tips[tips.length-1].split('#');
		if(sel.length >= 5){
			tipChosen.push('<div id="TipChosen">'+sel[0]+'&nbsp;<span id="reportLevelTip" class="tipLabel"></span>&nbsp;');
			tipChosen.push(sel[1]+'&nbsp;<span id="reportObjTip" class="tipLabel"></span>&nbsp;');
			tipChosen.push(sel[2]+'&nbsp;<span id="reportPlatTip" class="tipLabel"></span>&nbsp;');
			tipChosen.push(sel[3]+'<span id="reportRegionTip"></span>');
			tipChosen.push(sel[4]+'&nbsp&nbsp<a href="#" rel="clearContent">清空已选定内容</a>'+'</div>')
		}
		
		if(isprompt) { //是否显示第一条
				html.push('<div id="TipPrompt">' + tips[0]);
				html.push('&nbsp&nbsp<a href="#" rel="noPrompt">下次不再提示</a></div>');
		}
		html.push(tipChosen.join(''));
		baidu.g('ReportTips').innerHTML=html.join('');
		tipBtn.push('<div id="leftTipBtn" class="tips_btn"></div>');
		tipBtn.push('<div id="rightTipBtn" class="tips_btn"></div>');
		baidu.g('ReportTipsBtn').innerHTML=tipBtn.join('');
			
		me._updateTipContent();
		//为信息提示区添加click事件处理，分别处理两条信息中的链接点击	
		baidu.g('ReportTips').onclick = function(e){
			var e = e || window.event,
				target = e.target || e.srcElement,
				tagName = target.tagName.toLowerCase();	
				if(tagName == 'a') {
					if(target.rel == 'noPrompt')
						me._setNoPrompt(e); //设置不再显示该信息
					if(target.rel == 'clearContent')
						me._clearObjContent(e); //清空所选对象
				}
		} 
		//初始化显示第一条信息
		me.setContext('tipIndex',1);
		me.setActiveTip();
		
	},
	/**
	 * 根据tipIndex设置信息提示区当前显示的信息及切换按钮状态 by huanghainan
	 */
	setActiveTip : function() {
		var me = this,
			index = me.getContext('tipIndex') || 1,
			allTips = baidu.dom.children('ReportTips'),
			tipCount = allTips.length;
			for(var i = 0; i<tipCount;i++) {
				if(index == i+1) {
					baidu.dom.removeClass(allTips[i],'hide');
				}else {
					baidu.dom.addClass(allTips[i],'hide');
				}
			}
			baidu.dom.removeClass('leftTipBtn','btn_left_active');
			baidu.dom.removeClass('leftTipBtn','btn_left_inactive');
			baidu.dom.removeClass('rightTipBtn','btn_right_active');
			baidu.dom.removeClass('rightTipBtn','btn_right_inactive');
			baidu.un('leftTipBtn', 'click');
			baidu.un('rightTipBtn', 'click');
			if(index != 1) {
				baidu.dom.addClass('leftTipBtn','btn_left_active');
				baidu.on('leftTipBtn', 'click', function(e) {
					me._showPreTip();
				});	
			}else {
				baidu.dom.addClass('leftTipBtn','btn_left_inactive');
			}
			if(index != allTips.length) {
				baidu.dom.addClass('rightTipBtn','btn_right_active');
				baidu.on('rightTipBtn', 'click', function(e) {
					me._showNextTip();
				});
			}else {
				baidu.dom.addClass('rightTipBtn','btn_right_inactive');
			}
			
	},
	/**
	 * 更新信息提示区报告内容框中所显示的内容，与下方操作区联动 by huanghainan
	 * @param {Object} level 传入的选定层级level，如果不传则从操作区中读取
	 */
	_updateTipContent : function(level){
		var me = this,
			controlMap = me._controlMap,
			levelName = '',
			objName = '',
			platformName = '',
			regionName = '',
			objList = [],
			level = level || controlMap['NewReportAccount'].getGroup().getValue(),
			platform = controlMap['NewReportPlatformAll'].getGroup().getValue(),
			datasource = controlMap.NewReportSelectedList.datasource || [],
			region = controlMap['NewReportAreaOption'].getChecked();
		
		//如果内容更新时当前显示的提示信息不是报告内容的信息，则切换到报告内容的提示信息
		var index = me.getContext('tipIndex') || 1,
		tipCount = baidu.dom.children('ReportTips').length;
		if(index != tipCount) {
				me.setContext('tipIndex',tipCount);
				me.setActiveTip();
		}
		//关联选定层级，注意当切换选定层级后，下方对象列表为空，所以对象内容一栏有个默认值
		switch (level) {
			    case '2':		
			    	levelName = '账户级别';
					objName = '全账户';
			        break;
			    case '3':		
			        levelName = '推广计划级别';
					objName = '所有推广计划';
			        break;
				case '5':		
			        levelName = '推广单元级别';
					objName = '所有推广单元';
			        break;
			    case '6':		
			        levelName = '关键词级别';
					objName = '所有关键词';
			        break;
			    case '7':		
			        levelName = '创意级别';
					objName = '所有创意';
			        break;			    
		}
		//如果当前层级不是账户，且不为空时，读取对象列表中对象名称
		if(level != '2' && datasource.length != 0)
		{
			//读取物料对象列表中的对象名
			for(var i = 0;i<datasource.length;i++)
			{
				objList.push(datasource[i].name);
			}
			var objListStr = objList.join();
			//为了创意名称显示...
			objListStr = objListStr.replace('<span class="linebreak">^</span>','^');
			if(getLengthCase(objListStr) > 24){//超长截断处理...
				objName = subStrCase(objListStr,24);
				if(objName.lastIndexOf(',') == objName.length - 1) {
					objName = objName.substring(0,objName.length - 1);
				}
				objName += '...';
			}else {
				objName = objListStr;
			}	
			if(level != '7'){
				objName = escapeHTML(objName);
				baidu.removeClass(baidu.g('reportObjTip'),'tipIdea');
			}else{
				baidu.addClass(baidu.g('reportObjTip'),'tipIdea');
			}
		}
		
		//关联推广平台
		switch (platform) {
			    case '0':		
			    	platformName = '所有推广方式';
			        break;
			    case '1':		
			        platformName = '搜索推广';
			        break;
				case '2':	
			        platformName = '网盟推广';
			        break;		    
		}
		//如果选中分地域
		if(region) {
			regionName = '分地域';
		}
		baidu.g('reportLevelTip').innerHTML = levelName;
		baidu.g('reportObjTip').innerHTML=objName;
		baidu.g('reportPlatTip').innerHTML = platformName;
		baidu.g('reportRegionTip').innerHTML = regionName;

	},
	/**
	 * 信息切换按钮显示下一条
	 */
	_showNextTip : function(){
		var me = this,
			index = me.getContext('tipIndex') + 1;		
			me.setContext('tipIndex',index);
			me.setActiveTip();
	},
	/**
	 * 信息切换按钮显示上一条
	 */
	_showPreTip : function(){
		var me = this,
			index = me.getContext('tipIndex') - 1;		
			me.setContext('tipIndex',index);
			me.setActiveTip();
	},
	/**
	 * 设置不再显示该信息
	 */
	_setNoPrompt : function(e) {
		var me = this,
			e = e || window.event,
			target = e.target || e.srcElement,
			tagName = target.tagName.toLowerCase(),
			noPrompt = false;	
			
		if(tagName == 'a') {
			baidu.g('ReportTips').removeChild(target.parentNode);
			me.setActiveTip();
	 		fbs.report.setNoPrompt({
				//optid : nirvana.env.OPT_ID,
				callback : function(data) {
					//			
				}
			});
			
		}
		baidu.event.preventDefault(e);
	},
	/**
	 * 点击信息提示区“清空所选对象”链接
	 */
	_clearObjContent : function(e) {
		var me = this,
			e = e || window.event,
			controlMap = me._controlMap,
			dataList = controlMap.NewReportSelectedList.datasource,
			newReportMaterialList = me._controlMap.NewReportMaterialList;
			
		for(var i = 0; i < dataList.length; i++) {
			newReportMaterialList.recover(dataList[i].id);
		}
		controlMap.NewReportSelectedList.datasource = [];
		controlMap.NewReportSelectedList.render();
		me._updateTipContent();
		baidu.event.preventDefault(e);
	},
	/**
	 * 打开物料选择
	 */
	openMaterialSelect : function () {
		var me = this;
		return function() {
	        var newReportMaterialList = me._controlMap.NewReportMaterialList;
			me.setMaterialSelectContext();
	        newReportMaterialList.render(newReportMaterialList.main);		
			newReportMaterialList.main.style.left = 0;
			newReportMaterialList.main.style.top = 0;
			baidu.show('NewReportMaterialWrap');
			me.isNewReportMaterialShow = true;
		}
    },
    
	/**
	 * 关闭对象列表外层
	 * 
	 * @param {Object}
	 *            objId
	 */
    newReportMaterialCloseHandler : function(){
		var me = this;
		baidu.hide('NewReportMaterialWrap');		
		me.isNewReportMaterialShow = false;
	},
	
	/**
	 * 物料添加添加到左侧
	 * 
	 * @param {Object}
	 *            item
	 */
	addObjHandler : function () {
		var me = this;
		return function(item) {
			var newReportSelectedList = me._controlMap.NewReportSelectedList;
			var datasource = newReportSelectedList.datasource;
			
			
			if (me.getContext('newReportTargetType') == 7) { // 创意层级
				item.isIdea = true;
				// 创意的name是已经处理好的，这里不需要处理，控件里直接显示
			} else {
				item.name = baidu.decodeHTML(item.name);
			}
		    datasource.push(item);
			/*
			 * if(datasource.length >= 10){
			 * baidu.g('targetValueErrorMsg').innerHTML = '每次不可选择超过10个对象';
			 * baidu.show('targetValueErrorMsg'); if(datasource.length > 10){
			 * datasource.pop(); return false; } }else {
			 * baidu.hide('targetValueErrorMsg'); }
			 */
			baidu.hide('NewReportTargetValueErrorMsg');
			newReportSelectedList.render(newReportSelectedList.main);
			me._updateTipContent();
		}
    },
    
	/**
	 * 设置候选列表
	 * 
	 * @param {Object}
	 *            type
	 * @param {Object}
	 *            typeValue
	 */
    setMaterialSelectContext : function (type) {
    	var me = this;
        var controlMap = me._controlMap;       
        var newReportMaterialList = controlMap.NewReportMaterialList;
        if(!type){
            var typeValue = controlMap.NewReportAccount.getGroup().getValue();
            switch(typeValue) {
                case '2':
                    type = 'account';
                    break;
                case '3':
                    type = 'plan';
                    break;
				case '5':
                    type = 'unit';
                    break;
                case '6': 
                    type = 'keyword';
                    break
                case '7':
                    type = 'idea';
                    break;
            }
        }		
        switch (type) {
            case  'account':
                me.setContext('newReportMaterialType', ['user']);
                break;
            case 'plan': 
                me.setContext('newReportMaterialType', ['user','plan']);
                break;
            case 'unit': 
                me.setContext('newReportMaterialType', ['user','plan','unit']);
                break;
            case 'keyword': 
                me.setContext('newReportMaterialType', ['user','plan','unit', 'keyword']);
                break;
            case 'idea': 
                me.setContext('newReportMaterialType', ['user','plan','unit', 'idea']);
                break;
        }
        newReportMaterialList.setLevel(me.getContext('newReportMaterialType'));
    },
	
	/**
	 * 物料类型切换响应
	 * 
	 * @param {Object}
	 *            e
	 */
	typeTabHandler : function () {
		var me = this; 
		return function(e) {
	        var e = e || window.event,
				tar = e.target || e.srcElement,
				label = tar.id;
			
			
			if (label == '' || label == 'NewReportTargetTypeDiv'){
				return;
			}
			
			ui.Dialog.confirm({
                title: '提醒',
                content: nirvana.config.LANG.LEVEL_CHANGE_WARN,
                onok: function(){
					var value = tar.value;
					me._setMaterialSelect(value);
					me._updateTipContent(value);
				},
                oncancel: function(){
					// 强制改变radio值
					ui.util.get('NewReportAccount').getGroup().setValue(me.getContext('newReportTargetType'));
                }
            });
			
			baidu.event.stopPropagation(e);
		}
    },
	
	/**
	 * 设置物料选择控件
	 * @param {Object} key
	 */
	_setMaterialSelect : function(key){
		var me = this,
			controlMap = me._controlMap;
		var newReportSelectedList = controlMap.NewReportSelectedList,
			newReportMaterialList = controlMap.NewReportMaterialList,
			datasource = [];
		
		if(me.getContext('newReportTargetType') == key){
			datasource = me.getContext('newReportSelectedData');
		}
		key +='';
		switch (key) {
		    case '2':		//账户
		    	datasource = [{
					id: nirvana.env.USER_ID,
					name: nirvana.env.USER_NAME
				}];
		        newReportSelectedList.autoState = false;
				me.setMaterialSelectContext('account');
		        break;
		    case '3':		//推广计划
		        newReportSelectedList.autoState = true;
				me.setMaterialSelectContext('plan');
		        break;
			case '5':		//推广单元
		        newReportSelectedList.autoState = true;
				me.setMaterialSelectContext('unit');
		        break;
		    case '6':		//关键词
		        newReportSelectedList.autoState = true;
				me.setMaterialSelectContext('keyword');
		        break;
		    case '7':		//创意
		        newReportSelectedList.autoState = true;
				me.setMaterialSelectContext('idea');
		        break;
		    
		}
		
		newReportSelectedList.datasource = baidu.object.clone(datasource);
		newReportMaterialList.addWords = baidu.object.clone(datasource);
				
		me.setContext('newReportTargetType', key);
		me.setContext('newReportSelectedData', datasource);
		
		baidu.hide('NewReportTargetValueErrorMsg');
		
		newReportMaterialList.render(newReportMaterialList.main);
		newReportSelectedList.render(newReportSelectedList.main);
		
		
		if(key == '2'){	//账户层级禁用添加对象按钮
		    baidu.hide('NewReportMaterialWrap');
			ui.util.get('NewReportSelectedList').disableAddLink(true);
		}else{
			ui.util.get('NewReportSelectedList').disableAddLink(false);
		}
		
		var platformBeidou = controlMap['NewReportPlatformBeidou'];
		if(key == '6'){ //在物料选择时如果选择了关键词，则禁止选择网盟推广的platform
			if(platformBeidou.getChecked()){ //如果已经选中了网盟，则修改为选择所有推广方式
				controlMap['NewReportPlatformAll'].setChecked(true);
			}
			platformBeidou.disable(true);
		} else {
			platformBeidou.disable(false);
		}
		
		me._updateMtlLevelOptions();
	},
	
	/**
	 * 点击空白区域关闭对象选择列表
	 */
	closeNewReportMaterial : function(){
		var me = this;
		return function(e) {
			if (!me.isNewReportMaterialShow){
				return;
			}
			
			var e = e || window.event || {},
			    tar = e.target || e.srcElement,
				selectedBox = baidu.g('NewReportSelectedWrap'),
				materialBox = baidu.g('NewReportMaterialWrap');
			
			// 别问我这恶心的判断怎么来的，问ue&pm
			if (tar && 
			    (baidu.dom.contains(selectedBox, tar) || baidu.dom.contains(materialBox, tar) || 
			    tar.className == 'ui_list_del' || tar.className == 'ui_radiobox_label')){
				return
			}
			
			var mPos = baidu.page.getMousePosition(),
				navPos = baidu.dom.getPosition(materialBox);
			if (mPos.x > navPos.left + materialBox.offsetWidth || mPos.y < navPos.top || mPos.y > navPos.top + materialBox.offsetHight || 
			    (tar && tar.id =='NewReportContainer')) {
				baidu.hide('NewReportMaterialWrap');
			}
		}
	},	
	//初始化特殊权限报告按钮及列表 
	initAuthReport : function() {
		var me = this,
		    hasAnti = nirvana.env.AUTH.invalid,
			hasMatch = nirvana.env.AUTH.match,
		    invalid = '<span>|</span><a href="#" id="InvalidClkReport" rel="invalid" data-log="{target:\'antiShortCut_btn\'}">无效点击报告</a>',
			match = '<span>|</span><a href="#" id="WmatchReport" rel="match" data-log="{target:\'matchShortCut_btn\'}">分匹配模式报告</a>',
			auth_btn = '<div id="AuthSelect" class="auth_select_btn"></div>',
		    inner = '',
		    authReport = baidu.g('SpecialAuthorityReport');
			
		if(hasAnti&&hasMatch) {
			inner = invalid + auth_btn;		
		}else if(hasAnti) {
			inner = invalid;
		}else if(hasMatch) {
			inner = match;
		}else {
			baidu.hide('SpecialAuthorityReport');
		}
		if(authReport && inner!='') {
			authReport.innerHTML = inner;
		}
		//添加两种权限都有时的选择事件
		if(baidu.g('AuthSelect')) {
			baidu.g('AuthSelect').appendChild(baidu.g('AuthSelectList'));
			baidu.on('AuthSelectList','click',function(e) {
				var e = e || window.event,
				target = e.target || e.srcElement,
				tagName = target.tagName.toLowerCase();
			if (tagName == 'li') {
				baidu.addClass('AuthSelectList','hide');
				authReport.removeChild(authReport.firstChild);
				authReport.removeChild(authReport.firstChild);
				if(!baidu.dom.hasClass('ReportParams','hide'))
						baidu.addClass(baidu.g('ReportParams'),'hide');
				if(!baidu.dom.hasClass('AvatarOption','hide'))
						baidu.addClass(baidu.g('AvatarOption'),'hide');
				if(!baidu.dom.hasClass('WMatchModeOption','hide'))
						baidu.addClass(baidu.g('WMatchModeOption'),'hide');
				
				if (target.id == 'InvalidClk') {				
					baidu.insertHTML(baidu.g('AuthSelect'),'beforeBegin',invalid); //= inner + auth_btn;
					if(baidu.q('current', 'ReportParamsShortcut', 'a')[0])
						baidu.removeClass(baidu.q('current', 'ReportParamsShortcut', 'a')[0], 'current');
					baidu.addClass('InvalidClkReport','current');	
					me.setTimeDimDisable('byDay');				
				}else if (target.id == "MatchClk") {
					baidu.insertHTML(baidu.g('AuthSelect'),'beforeBegin',match);// + auth_btn;
					if(baidu.q('current', 'ReportParamsShortcut', 'a')[0])
						baidu.removeClass(baidu.q('current', 'ReportParamsShortcut', 'a')[0], 'current');
					baidu.addClass('WmatchReport','current');
					baidu.removeClass('WMatchModeOption','hide');
					me.setTimeDimDisable('byDay');
				}
				nirvana.report.lib.showDeviceArea(target.id); //设备选择是否显示处理		
				baidu.event.preventDefault(e);		
			}
			});
			baidu.on('NewReportContainer', 'click', function(e) {
				var e = e || window.event,
				target = e.target || e.srcElement,
				tagName = target.tagName.toLowerCase();
				if(baidu.g('AuthSelectList')){
					if(target.id != 'InvalidClk' || target.id != 'MatchClk') {
					switch(target.id){
					case 'AuthSelect':
						if(baidu.dom.hasClass('AuthSelectList','hide'))
							baidu.removeClass('AuthSelectList','hide');	
						else
							baidu.addClass('AuthSelectList','hide');	
						break;
					case 'AuthSelectList':
						break;
					default:
						baidu.addClass('AuthSelectList','hide');
						break;
					}		
					}
				}
				
			});
		}
	},
	/**
	 * 新建报告列表选择初始化
	 */
	initNewReportSelect : function() {
		var me = this;
		if (me.arg.refresh) {
			return;	
		}
		me.isNewReportMaterialShow = false;
		me.setContext('newReportSelectedDeleteHandler',
				me.selectedDeleteHandler());
		
		
		// 读取导入的物料
		if (me.arg.queryMap.importMaterials && me.arg.queryMap.importMaterials.data.length > 0) {
			var importMaterials = me.arg.queryMap.importMaterials,
				importData = importMaterials.data,
				i,
				len,
				datasource = [];
			
			switch (importMaterials.level) {
				case 'plan':
					me.setContext('newReportTargetType', 3);
				    for (i = 0, len = importData.length; i < len; i++){
						datasource[i] = {
							id : importData[i].planid,
							name : importData[i].planname
						};
					}
					break;
				case 'unit':
				    me.setContext('newReportTargetType', 5);
				    for (i = 0, len = importData.length; i < len; i++){
						datasource[i] = {
							id : importData[i].unitid,
							name : importData[i].unitname
						};
					}
					break;
				case 'keyword':
					me.setContext('newReportTargetType', 6);
					for (i = 0, len = importData.length; i < len; i++) {
						datasource[i] = {
							id : importData[i].winfoid,
							name : importData[i].showword
						};
					}
					break;
				case 'idea':
					me.setContext('newReportTargetType', 7);
					for (i = 0, len = importData.length; i < len; i++) {
						datasource[i] = {
							id : importData[i].ideaid,
							name : IDEA_RENDER.lineBreak(IDEA_RENDER.wildcard(importData[i].title)),
							isIdea : true
						};
					}
					break;
				case 'folder': //如果物料带入为监控文件夹类型
					me.setContext('newReportTargetType', 8);
					for (i = 0, len = importData.length; i < len; i++) {
						datasource[i] = {
							id : importData[i].folderid,
							name : importData[i].foldername
						};
					}
					break;
				default:
					break;
			}
			me.setContext('newReportSelectedAutoState', true);
			me.setContext('newReportSelectedData', datasource);
			me.setContext('addedWords',datasource); // 设置已添加的词，这样物料才能置灰
		} else {
			me.setContext('newReportSelectedAutoState', false);
			me.setContext('newReportSelectedData', [{
				id: nirvana.env.USER_ID,
				name: nirvana.env.USER_NAME
			}]);
		}
	},

	/**
	 * 已选对象删除响应
	 * 
	 * @param {Object}
	 *            objId
	 */
	selectedDeleteHandler : function() {
		var me = this;
		return function(objId) {
			var newReportMaterialList = me._controlMap.NewReportMaterialList;
			newReportMaterialList.recover(objId);
			baidu.hide('NewReportTargetValueErrorMsg');
			me._updateTipContent();
		}
	},
	/**
	 * 获取当前选择类型报告的参数 added by huanghainan
	 */
	getLaunchReportParams : function() {
		var me = this,
			typeParams = {},
			ids = [],
			type = baidu.getAttr($$("#ReportParamsShortcut a.current")[0], "rel");
		
		//物料集合默认是账户，指定范围报告和监控文件夹报告中重新赋值。
		ids[ids.length]=nirvana.env.USER_ID;
		typeParams.idset = ids;
		
		//获取类型的默认参数，参数模板在lib_report中定义
		typeParams = baidu.extend(baidu.object.clone(typeParams),nirvana.report.lib._paramsTemplate[type]);		
		
		//账户、计划中添加转化(电话)
		//单元中添加转化(电话) 并看计费模式 是否添加 电话追踪消费
		switch(type){ //根据type做一些特殊参数配置
			case 'account':
				typeParams.dataitem = ['shows', 'clks', 'paysum', 'clkrate', 'avgprice', 'trans', 'phonetrans'];
				break;
			case 'plan':
			   typeParams.dataitem = ['shows', 'clks', 'paysum', 'clkrate', 'avgprice', 'trans', 'phonetrans'];
				break;
			case 'unit':
			//	if(nirvana.report.chargeModel == 1){
			//		typeParams.dataitem = ['shows', 'clks', 'paysum', 'clkrate', 'avgprice', 'trans', 'phonetrans','phonepay'];
			//	}else{
					typeParams.dataitem = ['shows', 'clks', 'paysum', 'clkrate', 'avgprice', 'trans', 'phonetrans'];
			//	}
				break;
			case 'invalid':
				//暂时没什么特别要做的
				break;
			case 'keyword':
			case 'idea':
				typeParams.dataitem = ['shows', 'clks', 'paysum', 'clkrate', 'avgprice', 'trans', 'avgrank'];
				break;
			case 'sublink':
				typeParams.dataitem = ['shows', 'clks', 'paysum', 'clkrate', 'avgprice'];
				break;
			case 'region':
				typeParams.rgtag = ui.util.get("siteFix").getChecked() ? 0 : 1;
				break;
			case 'custom':
				//获取选项操作区的参数
				typeParams = baidu.extend(baidu.object.clone(typeParams),me.getInstantReportParams());
				break;
			case 'match':
				//获取匹配模式选择
				typeParams.matchpattern = baidu.getAttr($$("#WMatchModeOption a.current")[0], "rel");
				break;
			case 'avatar':
			//由于监控文件夹选择文件夹和关键词时参数不同，模板配置中属于不同类型，所以要先获取查询层级再确定type
			 	type = baidu.getAttr($$("#AvatarOption a.current")[0], "rel");
				typeParams = baidu.extend(baidu.object.clone(typeParams),nirvana.report.lib._paramsTemplate[type]);		
				//监控关键词数据指标中也增加平均排名这一项
				/*if(type == 'avatarword'){
					typeParams.dataitem = ['shows', 'clks', 'paysum', 'clkrate', 'avgprice', 'trans', 'avgrank'];
				}*/
				//设置idset,platform
				if(me.getContext('addedWords')){
					var datasource = me.getContext('addedWords');
					if(me.getContext('newReportTargetType') == 8){
						var idset = [];
						for(var i=0;i<datasource.length;i++)
						idset.push(datasource[i].id);
						typeParams.idset = idset;
					}else{
						typeParams.idset = [];
					}
				}else{
					typeParams.idset = [];
				}
				//typeParams.platform = 1;
				break;
		}
		 nirvana.report.lib.addDeviceParam(typeParams,type);//添加设备属性参数
                
		//如果勾选了地域指标  并且是指定范围报告  就没有转化(电话)、电话追踪消费
		if(me._controlMap['NewReportAreaOption'].getChecked() &&
		 baidu.getAttr($$("#ReportParamsShortcut a.current")[0], "rel") == 'custom'){
			baidu.array.remove(typeParams.dataitem, function(item){
			//	return item == "phonepay" || item == 'phonetrans';
				return item == 'phonetrans';
			});
		}
		
		nirvana.report.currentReportType = typeParams.reporttype;
		
		/**共有参数获取*/
		//获取日期和时间单位
		typeParams = baidu.extend(baidu.object.clone(typeParams),me.getTimeSelectParams());
		//报告名称
		typeParams.reportname = '';
		//console.log(typeParams);
		return typeParams;
		//
	},
	/**
	 * 读取用户选择的日期和时间单位 added by huanghainan
	 */
	getTimeSelectParams : function() {
		var me = this,
			params = {},
			controlMap = me._controlMap,
			calendar = controlMap['NewReportCalendar'];
		
		//日期参数
		var dateRange = calendar.getValue();
		params.starttime = baidu.date.format(dateRange.begin, 'yyyy-MM-dd');
		params.endtime = baidu.date.format(dateRange.end, 'yyyy-MM-dd');
		if(calendar.relativeValue === false){ //如果用户选的不是相对时间，注意===严格判断
			params.isrelativetime = 0;	
		} else {
			params.isrelativetime = 1;
			params.relativetime = nirvana.report.lib.relativeTransMap[calendar.relativeValue];
		}
		
		//时间单位选择
		var timedim_rel = baidu.getAttr($$("#ReportTimeOption a.current")[0], "rel");
		switch(timedim_rel){
			case 'byDefault':
				params.timedim = 8;
				break;
			case 'byDay':
				params.timedim = 5;
				break;
			case 'byWeek':
				params.timedim = 4;	
				if(controlMap['firstDayByOption'].getValue() != "")	
					params.firstday = controlMap['firstDayByOption'].getValue();
				else
					params.firstday = 1;
				break;
			case 'byMonth':
				params.timedim = 3;
				break;
			default:
				params.timedim = 8;
				break;
		}
		return params;
	},
	/**
	 * 读取指定范围报告下用户选择的操作区参数 modified by huanghainan
	 */
	getInstantReportParams : function(){
		var me = this,
			params = {},
			controlMap = me._controlMap;

			//选定的物料层级
			params.mtldim = controlMap['NewReportAccount'].getGroup().getValue();
			
			//选定的物料ID集合
			var materialSet = controlMap['NewReportSelectedList'].getValue(),
				idSet = [];
			for (var i = 0, l = materialSet.length; i < l; i++){
				idSet.push(materialSet[i].id);
			}
			params.idset = idSet;
			
			//查询层级参数
			params.mtllevel = controlMap['NewReportLevelAccount'].getGroup().getValue();
			
			//报告类型参数
			if(controlMap['NewReportAreaOption'].getChecked()){ //如果勾选了地域指标，则为分地域报告
				params.reporttype = 3;
			} else { //否则根据选择mtlleve来定
				switch(params.mtllevel){
					case "2":	//分账户报告
						params.reporttype = 2;
						break;	
					case "3":	//计划报告
						params.reporttype = 10;
						break;	
					case "5":	//单元报告
						params.reporttype = 11;
						break;
					case "6":	//关键词报告
						params.reporttype = 9;
						break;	
					case "7":	//创意报告
						params.reporttype = 12;
						break;
				}
			}
					
			//推广方式参数
			params.platform = controlMap['NewReportPlatformAll'].getGroup().getValue();
			
			//数据指标
			params.dataitem = nirvana.report.lib.itemsSelectPanel.getSelectedItems(me);
			
			//排序字段
			params.sortlist = controlMap['reportOrderByOption'].getValue();
			
		return params;
	},
			
	/****报告展现的部分****/
	/**
	 * 生成报告的默认参数
	 */
	defaultParams : {
			
		reportid		:	0, //报告id，在实时报告中都为0
		starttime		:	'', //yyyy-MM-dd 当有相对时间时也要填写（用于显示在结果部分的日历中）
		endtime			:	'',	//yyyy-MM-dd 当有相对时间时也要填写（用于显示在结果部分的日历中）
		isrelativetime	:	1,	//是否相对时间，默认相对时间(最近七天)	
		/**
		 * 相对时间
		 * 
		 * 5 本月
		 * 6 上月
		 * 10 上周
		 * 14 昨天(默认)
		 * 15 最近7天
		 */
		relativetime	:	15,	//默认最近七天
		
		/**
		 * 选定的物料层级
		 * 
		 * 2 子账户
		 * 3 推广计划
		 * 5 推广单元
		 * 6 关键词(wordid)
		 * 7 创意 
		 * 8 监控文件夹
		 * 9 监控关键词
		 */
		mtldim			:	2,
		
		idset			:	[],	//选定层级对应物料的id集合（如果reporttype为监控文件夹报告，该参数传空表示所有监控文件夹）
		
		/**
		 * 查询层级
		 * 
		 * 2 子账户
		 * 3 推广计划
		 * 5 推广单元
		 * 6 关键词(wordid)
		 * 7 创意 
		 * 8 监控文件夹
		 * 9 监控关键词
		 */
		mtllevel		:	2,
		
		/**
		 * 报告类型。
		 * 
		 * 2 子账户统计报告
		 * 3 分地域报告
		 * 4 分匹配模式报告
		 * 6 检索词报告（无用）
		 * 9 关键词报告
		 * 10 推广计划报告
		 * 11 推广单元报告
		 * 12 创意报告
		 * 13 无效点击报告
		 * 17 监控文件夹报告
		 * 21 蹊径子链报告
		 */
		reporttype		:	2,	//一般来说根据mtllevel而定，仅在用户勾选“地域指标”时切换为3-分地域报告
		
		/**
		 * 推广平台
		 * 
		 * 0 全部
		 * 1 搜索推广 
		 * 2 网盟推广
		 */
		platform		:	0,
		
		/**
		 * 触发匹配模式
		 * 30 全部（默认）
		 * 15 广泛
		 * 31 短语
		 * 63 精确
		 */
		//matchpattern : 30,
		
		/**
		 * 数据指标
		 *  展现数 shows
		 *  点击数 clks
		 *  消费 paysum
		 *  点击率 clkrate
		 *  平均价格 avgprice
		 *  转化 trans
		 */
		dataitem		:	['shows', 'clks', 'paysum', 'clkrate', 'avgprice', 'trans'],
		
		/**
		 * 报告标签
		 * 
		 * 0 即时待发送
		 * 1 循环报告
		 * 2 预约报告
		 */
		reporttag		:	0,
		
		/**
		 * 循环周期
		 * 
		 * 1 每天
		 * 2 每周（默认）
		 * 3 每月初
		 * 
		 */
		reportcycle		:	2,
		
		/**
		 * 时间粒度
		 * 
		 * 3 TIMEDIM_MONTH
		 * 4 TIMEDIM_WEEK
		 * 5 TIMEDIM_DAY
		 * 7 TIMEDIM_HOUR_DAY(已不存在)
		 * 8 TIMEDIM_NOT_DAY_SENSITIVE（默认值）
		 */
		timedim			:	8, //除非用户在已经生成的报告中切换，否则均默认不分日
		firstday　		: 	1,//分周起始日（1-7）
		ismail			:	0,	//是否发送邮件
		mailaddr		:	'',	//邮箱地址
		
		/**
		 * 初始排序字段
		 * time	时间
		 * planid	推广计划
		 * unitid	推广单元
		 * paysum	消费
		 * clks		点击
		 * shows	展现
		 */
		sortlist		:	'time',	//初始排序字段
		
		reportname		:	'',	//报告名称
		
		userid			:	nirvana.env.USER_ID,
		moduid			:	nirvana.env.OPT_ID,		//最近修改人（操作人）
		
		/**
		 * 报告层级
		 * 
		 * 用户级别 100
		 * 一线客服级别 200
		 * 客服管理员级别 300
		 */
		reportlevel		:	100	,
		
		/*
		 * 地域定位方式
		 * ‘’表示非分地域报告
		 * 0表示按地理位置定位
		 * 1表示按搜索意图定位
		 */
		rgtag: ''
	},
	
	/**
	 * 向表单中回填值
	 * @param {Object} json
	 * @author tongyao@baidu.com
	 */
	refillInstantForm : function(json){
		
		var me = this,
			controlMap = me._controlMap,
			//calendar = controlMap['NewReportCalendar'],
			mtldimDOM = controlMap['NewReportAccount'].getGroup().getDOMList(),
			platformDOM = controlMap['NewReportPlatformAll'].getGroup().getDOMList(),
			mtlLevelDOM = controlMap['NewReportLevelAccount'].getGroup().getDOMList(),
			regionOption = controlMap['NewReportAreaOption'],
			orderbyOption = controlMap['reportOrderByOption'];
			
		
		//选定层级部分
		for(var i = 0, l = mtldimDOM.length; i < l; i++){
			if(mtldimDOM[i].value == json.mtldim){
				mtldimDOM[i].checked = true;
				break;
			}
		}
		//推广方式部分
		for(var i = 0, l = platformDOM.length; i < l; i++){
			if(platformDOM[i].value == json.platform){
				platformDOM[i].checked = true;
				break;
			}
		}
		
		//查询层级部分(如果json.mtllevel > json.mtldim) 会被_updateMtlLevelOptions处理掉
		for(var i = 0, l = mtlLevelDOM.length; i < l; i++){
			if(mtlLevelDOM[i].value == json.mtllevel){
				mtlLevelDOM[i].checked = true;
				break;
			}
		}
		
		//数据指标部分
		var dataItemCheckbox = ui.util.get('reportItemCbclkrate');
		if(!dataItemCheckbox){ //数据指标没被打开过，则什么都不做
			//TODO 这里就限制了所有快捷模板的数据指标都只能默认全部
		} else {
			dataItemCheckbox = dataItemCheckbox.getGroup().getDOMList();
			
			for (var i = 0, l = dataItemCheckbox.length; i < l; i++){
				if(baidu.array.indexOf(json.dataitem, dataItemCheckbox[i].value) > -1){
					dataItemCheckbox[i].checked = true;
				} else {
					dataItemCheckbox[i].checked = false;
				}
			}
			nirvana.report.lib.itemsSelectPanel.displayResults();
		}

		//地域指标选项
		regionOption.setChecked(json.reporttype == 3);
		
		//循环功能
		//TODO 本次暂时用不到，先保持默认:受calendar控制
		
		
		me._setMaterialSelect(json.mtldim); //这句中包含了_updateMtlLevelOptions和_updateOrderByOptions
		
		
		//排序指标选项
		//TODO 这里没有判断是否有值就直接set了
		orderbyOption.setValue(json.sortlist);
	},
	
	/**
	 * 用户点击“生成报告”触发生成实时报告
	 * @param {Object} json
	 */
	launchInstantReport : function(json){
		var me = this;
		
		me.setContext('expandHistory', []);	//清空下钻历史

		var params = baidu.extend(baidu.object.clone(me.defaultParams), json);
		//存储报告的生成参数
		me.setContext('currentParams', params);
		me.setContext('pageNum', 1);
		baidu.hide('NewReportPrompt');
		
		//标记是否是指定范围报告   下钻时候有可能上面的层级改变
		if (baidu.getAttr($$("#ReportParamsShortcut a.current")[0], "rel") == 'custom') {
			me.setContext('isCustom',true);
		}else{
			me.setContext('isCustom',false);
		}
		me.generateInstantReport(me.getContext('currentParams'));
		//me.refresh();
	},
	
	/**
	 * 用户点击“生成报告”触发生成循环报告
	 * @param {Object} param
	 */
	addReportInfo : function(param) {
		var me = this;
		
		var param = baidu.extend(baidu.object.clone(me.defaultParams), param);
		
		fbs.report.addReportInfo({
			reportinfo : param,
			onSuccess : function(response){
				fbs.report.getReportInfos.clearCache();
				// 跳转到我的报告列表
				me.redirect('/tools/myReport', {});
			},
			onFail : function(response) {
				if (response.errorCode) {
					var error = response.errorCode.code;
					
					switch (error) {
						case 'NOT_MAIL':
						case 'TOO_LONG':
						case 'OVER':
							if (baidu.g('NewMailInputWarn')) {
								baidu.g('NewMailInputWarn').innerHTML = nirvana.config.ERROR.REPORT.EAMIL[error];
								baidu.removeClass('NewMailInputWarn', 'hide');
							}
							break;
						case 1902: // 报告数量超过上限
							ui.Dialog.alert({
								title: '提示',
								content: nirvana.config.ERROR.REPORT[error]
							});
							break;
						default:
							ajaxFailDialog();
							break;
					}
				} else {
					ajaxFailDialog();
				}
			}
		});
	},
	
	/**
	 * 生成实时报告 
	 * @param {Object} json 应该是defaultParams的子集
	 * @author tongyao@baidu.com
	 */
	generateInstantReport : function(params){
		var me = this;
		//回填表格
		if (baidu.getAttr($$("#ReportParamsShortcut a.current")[0], "rel") == 'custom') {
			me.refillInstantForm(params);
		}
		//在账户 计划 单元 报告中显示电话转化的提示信息
		if(params.mtllevel == '2' || params.mtllevel == '3' || params.mtllevel == '5'){
			baidu.removeClass(baidu.g('phonetransTip'),'hide');
		}else{
			baidu.addClass(baidu.g('phonetransTip'),'hide');
		}
		var type = baidu.getAttr($$("#ReportParamsShortcut a.current")[0], "rel");

		//计划报告 全部设备 且不是指定范围报告
		if(nirvana.report.lib.isDeviceRelated(type) && !me.getContext('isCustom') && params.mtag != '0' && params.mtag != '1'){
			nirvana.displayReport.devicesumData = {};
			nirvana.displayReport.getAllDevicesumData(me,params);
		}

		fbs.report.getMarsReport({
			reportinfo : params,
			callback : function(data){
				nirvana.displayReport.processInstantReportData(data, me, params.timedim);
			}
		});
			
	},
	
	/**
	 * 在当前已展现的报告中，切换参数导致报告重新渲染(已不用)
	 * @param {Object} alterParams 只需要传入需要改变的参数即可 如：{timedim : 3}
	 * @author tongyao@baidu.com
	 */
	alterInstantReport : function(alterParams){
		var me = this,
			params = me.getContext('currentParams');
			
		params = baidu.extend(params, alterParams);
		
		me.setContext('currentParams', params);
		me.setContext('pageNum', 1);
		//清除排序记录
		ui.util.get('reportTable').orderBy = '';
		me.refresh();
	},

	getRelativeValue: function(value) {
		var me = this;
		var calendar = me._controlMap['NewReportCalendar'];
		var miniOption = calendar.controlMap.mmcal.miniOption;
		var optionList = calendar.controlMap.mmcal.optionList;
		var realOptionList = [];
		var i = 0, l = miniOption.length;
		for(; i < l; i++) {
			realOptionList.push(optionList[miniOption[i]]);
		}

		return nirvana.util.dateOptionToDateText(value, realOptionList);
	},
	
	/**
	 * 下钻报告
	 * @param {Object} alterParams 只需要传入需要改变的参数即可 如：{timedim : 3}
	 * @param {Object} matrixRowIndex 被下钻的行号
	 * @author tongyao@baidu.com
	 */
	expandInstantReport : function(alterParams, matrixRowIndex, noExpand){
		var me = this,
			expandHistory = me.getContext('expandHistory'),
			currentParams = me.getContext('currentParams'),
			reportTable = ui.util.get('reportTable'),
			matrixData,
			matrixCol;

		// bugfix，尝试修复下钻时，时间改变了，但是携带参数是否是相对时间仍然错误的问题
		// by Leo Wang

		var relativeTimeText = me.getRelativeValue({
			begin: baidu.date.parse(alterParams.starttime),
			end: baidu.date.parse(alterParams.endtime)
		});
		// alterParams.isrelativetime =  relativeTimeText!== false ? 1 : 0;

		if(relativeTimeText === false) {
			alterParams.isrelativetime = 0;
		}
		else {
			alterParams.isrelativetime = 1;
			var calendar = me._controlMap['NewReportCalendar'];
			var optlist = calendar.controlMap.mmcal.optionList;
			for(var i = 0; i < optlist.length; i++) {
				if(relativeTimeText == optlist[i].text) {
					alterParams.relativetime = nirvana.report.lib.relativeTransMap[i];
					break;
				}
			}
		}
		// fix end

			
		expandHistory = expandHistory || [];
		
		if (noExpand) {
			//console.log("no expand is 1!!!");
		}else {
			//从当前表格中读取列定义
			matrixCol = baidu.object.clone(reportTable.fields);
			
			//从当前表格中读取被下钻一行的数据
			matrixData = baidu.object.clone(reportTable.datasource[matrixRowIndex]);
			
			//在下钻前存储当前报告参数和对应的母表数据
			expandHistory.push({
				params: currentParams,
				matrixCol: matrixCol,
				matrixData: matrixData
			});
			
		}		
		me.setContext('expandHistory', expandHistory);
		//生成下钻的参数
		currentParams = baidu.extend(baidu.object.clone(currentParams), alterParams);
		if(alterParams.mtllevel == '6' || alterParams.mtllevel == '7'){
			if(!noExpand && baidu.array.indexOf(currentParams.dataitem, "avgrank") < 0){
				currentParams.dataitem = currentParams.dataitem.concat(['avgrank']);
			}
		}
		/******************下钻时候的逻辑****************************/
		//只有单元层级在 收费模式一  下有“电话追踪消费” 列
	/*	if (alterParams.mtllevel != 5 || nirvana.report.chargeModel != 1) {									
			baidu.array.remove(currentParams.dataitem, function(item){
				return item == "phonepay";
			});
		}else{*/
			var dataitem = currentParams.dataitem,
				tempArray = baidu.object.clone(dataitem),
				len = tempArray.length;
			
			dataitem.length = 0;
			for(var i = 0; i < len ; i++){
				dataitem[dataitem.length] = tempArray[i];
			/*	if(tempArray[i] == 'phonetrans'){
					dataitem[dataitem.length] = 'phonepay';
				}*/
			}
	//	}
		//关键词和创意层级没有 “转化（电话）”列
		if (alterParams.mtllevel == 6 || alterParams.mtllevel == 7) {
			baidu.array.remove(currentParams.dataitem, function(item){
				return item == "phonetrans";
			});
		}
		/******************下钻时候的逻辑****************************/
		//在账户 计划 单元 报告中显示电话转化的提示信息
		if(alterParams.mtllevel == '2' || alterParams.mtllevel == '3' || alterParams.mtllevel == '5'){
			baidu.removeClass(baidu.g('phonetransTip'),'hide');
		}else{
			baidu.addClass(baidu.g('phonetransTip'),'hide');
		}
		me.setContext('currentParams', currentParams);
		me.setContext('pageNum', 1);
		
		if (baidu.getAttr($$("#ReportParamsShortcut a.current")[0], "rel") == 'custom') {
				me.refillInstantForm(currentParams);
				me._updateTipContent();
		}
		//计划报告 全部设备 且不是指定范围报告
		if(currentParams.reporttype == 10 && !me.getContext('isCustom') && currentParams.mtag != '0' && currentParams.mtag != '1'){
			nirvana.displayReport.devicesumData = {};
			nirvana.displayReport.getAllDevicesumData(me,currentParams);
		}
		//不知道下面的请求可不可以直接替换成这种处理方式，先开个分支
		//最下面的请求callback逻辑与generateInstantReport中不太一样
		//@author zhouyu
		if(currentParams.reporttype == 21){
			me.generateInstantReport(currentParams);
			return ;
		}
		//这里做成先请求一次，如果可以查看即时报告，则refresh。
		fbs.report.getMarsReport({
			reportinfo : currentParams,
			callback : function(data){
				var errorCode = data.errorCode.code;
				
				if(!errorCode){				
					me.setContext('keywordError',0);
					//清除排序记录
					ui.util.get('reportTable').orderBy = '';	
			
					me.refresh();//不用担心refresh后的fbs重新请求，因为有cache会被命中
					me._updateTipContent();
					return;
					
				}else {
				
					if (errorCode == 1900 || errorCode == 1901) {
						//目前下钻只有关键词数量可能会超，所以这里是针对下钻到关键词报告的处理
						me.setContext('keywordError',errorCode);
						ui.Bubble.show();
					}
				}
			}
		});


	},
	
	/**
	 * 下钻后返回上一层报告
	 * @author tongyao@baidu.com
	 */
	foldInstantReport : function(){
		var me = this,
			expandHistory = me.getContext('expandHistory');
		
		nirvana.util.loading.init();
		if(expandHistory.length > 0){	//只是为了容错
			//从历史堆栈中取出上一层报告的参数
			var params = expandHistory.pop();
			
			if(expandHistory.length == 0){
				baidu.dom.addClass(baidu.g('ReportFoldBtn').parentNode, 'hide');
			}
			//重新存储两项参数
			me.setContext('expandHistory', expandHistory);
			me.setContext('currentParams', params.params);
			me.setContext('pageNum', 1);
			me.setContext('newReportTargetType',params.params.mtldim);
			me.setContext('newReportSearch',params.params.mtllevel);
			me.refillInstantForm(params.params);
			me._updateTipContent();
			//me._updateMtlLevelOptions();
			//if (baidu.getAttr($$("#ReportParamsShortcut a.current")[0], "rel") == 'custom') {
				
			//}
			//这么多context。。。返回上一层级除了表格还有其他地方有变动？？？先开个分支
			//@author zhouyu
			var currentParams = me.getContext('currentParams');
			if(currentParams.reporttype == 21){
				me.generateInstantReport(currentParams);
				return ;
			}
			me.refresh();
		}
		nirvana.util.loading.done();
	},
	
	/**
	 * 切换时间粒度的点击响应函数 （现在不用了）
	 * @param {Object} e
	 */
	reportTimedimClickHandler : function(e){
		var me = this,
			e = e || window.event,
			target = e.target || e.srcElement,
			tagName = target.tagName.toLowerCase();
			
		if(tagName == 'a'){
			if(target.className != 'current'){
				var timedim = '';
				switch(target.id){
					case "ReportTableOptionPeriod":
						timedim = 8;
						break;
					case "ReportTableOptionDay":
						timedim = 5;
						break;
					case "ReportTableOptionWeek":
						timedim = 4;
						break;
					case "ReportTableOptionMonth":
						timedim = 3;
						break;
				}
				
				me.alterInstantReport({
					timedim : timedim
				});
			}
		}
	},
	
	/**
	 * 根据选定层级，更新查询层级的可选择项
	 */
	_updateMtlLevelOptions : function(){
		var me = this,
			controlMap = me._controlMap,
			mtldim = controlMap['NewReportAccount'].getGroup().getValue() - 0,
			mtlLevelOptions = controlMap['NewReportLevelAccount'].getGroup(),
			mtlLevel = mtlLevelOptions.getValue() - 0,
			mtlLevelOptionsDOM = mtlLevelOptions.getDOMList(),
			platform = controlMap['NewReportPlatformAll'].getGroup().getValue(),
			tmp;
		
		for (var i = 0, l = mtlLevelOptionsDOM.length; i < l; i++){
			tmp = mtlLevelOptionsDOM[i].value - 0;
			if(tmp < mtldim){ //disable所有大于选定层级的radio
				mtlLevelOptionsDOM[i].disabled = true;
			} else if(mtldim == 6 && tmp == 7){ //选择关键词时，也要disable掉创意
				mtlLevelOptionsDOM[i].disabled = true;
			} else {
				mtlLevelOptionsDOM[i].disabled = false;
			}
			if((mtlLevel < mtldim || mtlLevel == 7 && mtldim == 6)&& tmp == mtldim){ //如果原来选定的查询层级小于等于选定的物料层级，并且当前循环到的元素值与物料层级一致，则选中
				mtlLevelOptionsDOM[i].checked = true;
			}
		}
		
		//如果选择了网盟或者创意，去除关键词选项
		tmp = controlMap['NewReportLevelKeyword'];
		if(platform == '2' || mtldim ==7){
			//禁用mtllevel的关键词选项
			if(tmp.getChecked()){ //如果关键词选项被选中了，则改变为选创意
				controlMap['NewReportLevelIdea'].setChecked(true);
			}
			tmp.disable(true);
		} else {
			tmp.disable(false);
		}
	//	me._updateItemMap();
		me._updateOrderByOptions();	
	},
	/**
	 * 根据查询层级的选择，更新数据指标的可选择项，关键词和创意层级显示平均排名，其余情况不显示
	 */
/*	_updateItemMap : function(){
		var me = this,
			controlMap = me._controlMap,
			mtlLevel = controlMap['NewReportLevelAccount'].getGroup().getValue();
			
		if (baidu.g('ctrldialogReportItemSelectDialog')) {
			var itemContent = baidu.q('item_select_wrap', baidu.g('ctrldialogReportItemSelectDialog'));
			if (itemContent.length != 0) {
				var items = itemContent[0].getElementsByTagName('td');
				//var idledom = 
				if(mtlLevel != 6 && mtlLevel != 7) {
					baidu.addClass(items[items.length - 2], 'hide');
					baidu.removeClass('idleTd', 'hide');
				}
				else {
					baidu.removeClass(items[items.length - 2], 'hide');
					baidu.addClass('idleTd', 'hide');
				}
			}
		}
	},
	*/
	/**
	 * 根据查询层级和数据指标的选择情况，更新排序指标的可选择项
	 */
	_updateOrderByOptions : function(){
		var me = this,
			controlMap = me._controlMap,
			mtlLevel = controlMap['NewReportLevelAccount'].getGroup().getValue(),
			selectedItems = nirvana.report.lib.itemsSelectPanel.getSelectedItems(me),
			options =  [ 
					{
						text : '时间',
						value : 'time'
					}, 
					{
						text : '消费',
						value : 'paysum'
					}, 
					{
						text : '点击',
						value : 'clks'
					}, 
					{
						text : '展现',
						value : 'shows'
					}
				];
		
		//注意以下Splice都是从后往前的
		if(baidu.array.indexOf(selectedItems, 'shows') == -1){
			options.splice(5, 1);
		}
		
		if(baidu.array.indexOf(selectedItems, 'clks') == -1){
			options.splice(4, 1);
		}
		
		if(baidu.array.indexOf(selectedItems, 'paysum') == -1){
			options.splice(3, 1);
		}
		
		controlMap['reportOrderByOption'].options = options;
		controlMap['reportOrderByOption'].render();
	},
	
	/**
     * toggle循环功能设置
     */
    _toggleLoopSettingContainer : function () {
    	baidu.dom.toggleClass('LoopSettingContainer', 'hide');
    },
	
	/**
	 * 根据传入的status，进行启用/禁用循环功能
	 * @param {Object} status
	 */
	_setLoopSettingStatus : function(status){
		
		var me = this,
			loopControl = me._controlMap['NewReportLoopCheckBox'];
			
		if(status){
			loopControl.disable(false);
		} else {
			loopControl.setChecked(false);
			loopControl.disable(true);
			baidu.addClass('LoopSettingContainer', 'hide');
		}
	},
	
	/**
     * toggle Email容器
     */
    _toggleMailWrap : function () {
    	baidu.dom.toggleClass('NewReportMailWrap', 'hide');
		baidu.removeClass('NewMailInputWarn', 'hide');
    },
	
	/**
	 * toggle 生成参数容器
	 */
	_toggleParamsContainer : function(status){
		var btn = baidu.g('ToggleParam'),
			wrap = baidu.g('ToggleArea');
		if(typeof status == 'undefined'){ //未指定status自动判断
			status = baidu.getStyle(wrap, 'display');
			status = status == 'none' ? true : false;
			var logParams = {};
			if(status){
				logParams.target = "checkNewReportMoreParams_btn";
			}else{
				logParams.target = "foldNewReportParams_btn";
			}
			NIRVANA_LOG.send(logParams);
		}
			
		if(status){ //show
			baidu.dom.show(wrap);
			baidu.dom.removeClass(btn, 'folded');
			btn.innerHTML = '点击收起选项';
		} else {
			baidu.dom.hide(wrap);
			baidu.dom.addClass(btn, 'folded');
			btn.innerHTML = '点击查看更多选项';
		}
		
		nirvana.report.lib._resizeTable();
	},
	
	/**
	 * 预约报告的提示
	 */
	_confirmSubscribe : function(callback){
		var dialog = ui.util.get('ReportConfirmSubscribe'),
			me = this;
			
		if (dialog) {
			dialog.dispose();
		}
		
		// 每次都注销掉上一个dialog，重新生成新dialog，否则onok时还是上一个action
		ui.Dialog.factory.create({
			title: '生成预约报告',
			content: '因为数据量过大，无法直接生成报告，是否生成预约报告？',
			closeButton: false,
			cancel_button: true,
			onok: function(){
				// 生成预约报告
				me.buildSubscribe();
			},
			maskType: 'black',
			maskLevel: '9', //bubble的z-index是2000，我们这个是9*200 + 400
			id: 'ReportConfirmSubscribe',
			width: 300,
			skin: 'ToolsModuleConfirmReImport'
		});
	},
	
	/**
	 * 生成预约报告
	 */
	buildSubscribe : function() {
		var me = this,
			param = me.getContext('currentParams'); // 保证前一步已经设置了currentParams，所以只需要获取最新的currentParams并修改reporttag为预约报告
		
		// 预约报告
		param.reporttag = 2;
		
		fbs.report.addReportInfo({
			reportinfo: param,
			onSuccess: function(response){
				//显示预约成功
				nirvana.displayReport._showSubscribeSuccess(me);
			},
			onFail: function(response){
				if (response.errorCode) {
					var error = response.errorCode.code;
					
					switch (error) {
						case 1902: // 报告数量超过上限
							ui.Dialog.alert({
								title: '提示',
								content: nirvana.config.ERROR.REPORT[error]
							});
							break;
						default:
							ajaxFailDialog();
							break;
					}
				} else {
					ajaxFailDialog();
				}
			}
		});
	},
	
	
	
	/**
     * 表格操作事件代理器
     */
	tableHandler : function() {
		var me = this;
		
        return function(e) {
            var e = e || window.event,
			    target = e.target || e.srcElement,
				randomId = er.random(10), // 页面跳转需要的随机数
				level = target.getAttribute('level'),
				unitid,
				wordid,
				winfoid;
			
			switch(level) {
				// 关键词跳转，跳转到
				case 'keyword' :
					/**
					er.locator.redirect('/manage/keyword~ignoreState=true&_r=' + randomId + '&navLevel=unit&unitid=' + target.getAttribute('unitid') + '&status=100&query=' + encodeURIComponent(target.innerHTML) + '&queryType=accurate');
					break;
					 */
					
				    unitid = target.getAttribute('unitid');
					winfoid = target.getAttribute('winfoid');
					
					// 先要看一下关键词是否已删除或者转移
					fbs.material.isExist({
						unitid : unitid,
						winfoid : winfoid, //根据winfoid判断
						wordid : -1,
						
						onSuccess : function(response) {
							var data = response.data;
							
							if (data == 1) {
								er.locator.redirect('/manage/keyword~ignoreState=true&_r=' + randomId + '&navLevel=unit&unitid=' + unitid + '&status=100&query=' + encodeURIComponent(target.innerHTML) + '&queryType=accurate');
							} else { // 关键词已删除或者转移
								ui.Dialog.alert({
									title: '通知',
									content: '关键词已删除/转移'
								});
							}
						},
						onFail : function(response) {
							ajaxFailDialog();
						}
					});
					break;
			}
        };
	},
	
	//定制报告
	reportSelectHandler : function(typeValue){
		var me = this;
		if(typeValue == 'customize'){
			nirvana.report.lib.display._showCycleSubAction('add',true,me);
		}
	}
});


/**
 * 层级下钻的气泡
 */
ui.Bubble.source.expandReport = {
	type : 'normal',
	iconClass : 'linfeng',
	positionList : [2,3,4,5,6,7,8,1],
	needBlurTrigger : true,
	autoShow : false,
	autoShowInterv : 500,
	showByClick : false,
	showByOver : false,			//鼠标悬浮延时显示
	showByOverInterval : 500,	//悬浮延时间隔
	hideByOut : true,			//鼠标离开延时显示
	hideByOutInterval : 5000,	//离开延时间隔，显示持续时间
	title: function(node){
		var title = '无法呈现报告';
			
		return title;
	},
	content: function(node, fillHandle, timeStamp){
		
		var type = node.getAttribute('rel'),
			randomId = er.random(10),
			html = ['<div class="expandReportBubble" id="' + randomId + '">'],
			onclickStr1 = '',
			onclickStr2 = '',
			onclickBubbleHide = " onclick='ui.Bubble.hide();return true;'",
			rowIndex = node.parentNode.parentNode.parentNode.getAttribute('row'),
			id = node.getAttribute('data-unitid');
			
		if (type == 'unitinfo'){
		
			onclickStr1 = "onclick='nirvana.displayReport.expandInstantReportToIdea(ui.Bubble.triggerIdentity,null,1);return false;'"; //this,"+rowIndex+",0,"+id+
			onclickStr2 = "onclick='nirvana.report.lib.display._showCycleSubAction(\"add\");return false;'";
			html.push('<p>因为数据量过大,可能无法在这里呈现。</p><p>您可以选择查看<a href="#" '+ onclickStr1 + '>创意报告</a>或'+'<a href="#" '+ onclickStr2 + '>循环生成此报告</a>。</p>');
			//id = node.getAttribute('data-unitid');
				
		} 
		
		html.push('</div>');
		
		return html.join('');
	}
};
/*
ui.Bubble.source.expandReport = {
	type : 'normal',
	iconClass : 'linfeng',
	positionList : [2,3,4,5,6,7,8,1],
	needBlurTrigger : true,
	showByClick : true,
	showByOver : true,			//鼠标悬浮延时显示
	showByOverInterval : 500,	//悬浮延时间隔
	hideByOut : true,			//鼠标离开延时显示
	hideByOutInterval : 2000,	//离开延时间隔，显示持续时间
	title: function(node){
		var title = node.getAttribute('bubbletitle');
			
		return title;
	},
	content: function(node, fillHandle, timeStamp){
		
		var type = node.getAttribute('rel'),
			allowExpand = node.getAttribute('data-allowexpand'),
			randomId = er.random(10),
			html = ['<div class="expandReportBubble" id="' + randomId + '">'],
			onclickStr = '',
			onclickBubbleHide = " onclick='ui.Bubble.hide();return true;'",
			rowIndex = node.parentNode.parentNode.getAttribute('row'),
			id;
			
		if(type == 'planinfo'){
		
			id = node.getAttribute('data-planid');
			if (allowExpand == 'true') {
				onclickStr = "onclick='nirvana.displayReport.expandInstantReportToUnit(this, " + rowIndex + "," + id + ",\"" + randomId + "\");return false;'";
				html.push("<p><a href='#' " + onclickStr + " data-log=\"{target:'checkUnitReport_btn'}\">查看单元报告</a></p><br />");
			}
			html.push("<p><a href='#/manage/unit~planid=" + id + "&ignoreState=1&_r=" + randomId + "'" + onclickBubbleHide + " data-log=\"{target:'toUnitList_btn'}\">打开推广管理单元列表</a></p>");
		
		} else if (type == 'unitinfo'){
		
			id = node.getAttribute('data-unitid');
			
			if (allowExpand == 'true') {
				onclickStr = "onclick='nirvana.displayReport.expandInstantReportToKeyword(this, " + rowIndex + "," + id + ",\"" + randomId + "\");return false;'";
				if (node.getAttribute('data-platform') != 2) { //网盟推广不能下钻到关键词
					html.push("<p><a href='#' " + onclickStr + " data-log=\"{target:'checkKeywordReport_btn'}\">查看关键词报告</a></p>");
				}
				onclickStr = onclickStr.replace(/ToKeyword/, 'ToIdea');
				html.push("<p><a href='#' " + onclickStr + " data-log=\"{target:'checkIdeaReport_btn'}\">查看创意报告</a></p><br />");
			}
			html.push("<p><a href='#/manage/keyword~unitid=" + id + "&ignoreState=1&_r=" + randomId + "'" + onclickBubbleHide + " data-log=\"{target:'toKeywordList_btn'}\">打开推广管理关键词列表</a></p>");
		
		} else if (type == 'account'){
			
			if (allowExpand == 'true') {
				onclickStr = "onclick='nirvana.displayReport.expandInstantReportToPlan(this, " + rowIndex + ",\"" + randomId + "\");return false;'";
				html.push("<p><a href='#' " + onclickStr + " data-log=\"{target:'checkPlanReport_btn'}\">查看计划报告</a></p><br />");
			}
			html.push("<p><a href='#/manage/plan~ignoreState=1&_r=" + randomId + "'" + onclickBubbleHide + " data-log=\"{target:'toPlanList_btn'}\">打开推广管理计划列表</a></p>");
		
		}
		
		html.push('</div>');
		
		return html.join('');
	}
};*/