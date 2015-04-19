/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    plan/plan.js
 * desc:    推广管理
 * author:  tongyao,chenjincai,linzhifeng
 * date:    $Date: 2010/12/27 $ 2011/8/29
 */




/**
 * @namespace 计划列表模块
 */
manage.planList = new er.Action({
	VIEW: 'planList',
	
	STATE_MAP : {
		startDate : '',
		endDate : '',
		status	: '100',
		query	:	'',
		queryType	: 'fuzzy',
		orderBy	:	'',
		orderMethod	: 	'',
		pageSize	:	50,
		pageNo      : 1,
		customCol	:	'default',
		navLevel : 'account',
		aoEntrance : 'Planinfo', // Planinfo,Unitinfo,Wordinfo,Ideainfo,Monitor,Nav
		wrapper : 'ManageAoWidget'
	},
	
	UI_PROP_MAP : {
		calendar : {
			type : 'MultiCalendar',
			value : '*dateRange'
		},
		
		pageSizeSelect : {
			type : 'Select',
			width : '60',
			datasource : '*pageSizeOption'
		},
		
		pagination : {
			type : 'Page',
			total : '*totalPage'
		},
		
		planTableList : {
			type : 'Table',
			select : 'multi',
			sortable : 'true',
			filterable : 'true',
			orderBy : '',
			order : '',
			noDataHtml : '*noDataHtml',
			dragable : 'true',
			colViewCounter : 'all',
			scrollYFixed : 'true',
			fields: '*tableFields',		
			datasource : '*planListData'
		},
		
		AddPlanPlus : {
			value : '-9999',
			width : '120',
            datasource : '*addPlanData',
            options : '*addPlanData',
			clickRightOnly : '1'
		}
	},
	
	CONTEXT_INITER_MAP : {
		
		pageSizeOption : function(callback){
			if (!this.arg.refresh) {
				this.setContext('pageSizeOption',nirvana.manage.sizeOption);
			}
			callback();
		},
		
		/**
		 *自定义列白名单有不同 
		 */
		
		userDefineInit : function(callback) {
			if (!this.arg.refresh){
			var planConfig = nirvana.manage.UserDefine.getConfig('PLAN');
			if(nirvana.env.FCWISE_MOBILE_USER) {//移动白名单,全投小流量外用户的话，多投放设备的自定义列
				if( baidu.array.indexOf(planConfig.all,'deviceprefer') == -1){//不然每重新load一次，就又加载一次全部设备列
					planConfig.all.splice(1, 0, 'deviceprefer');
				    planConfig.show.splice(2, 0, {
					key : "deviceprefer",
					text : "投放设备"
				   });
				}
				
			}
			}
			callback();
		}, 

		optButton : function(callback){
            if (!this.arg.refresh) {
				this.setContext('runPause', [{
					text: "启用/暂停",
					value: -9999
				}, {
					text: "启用",
					value: "start"
				}, {
					text: "暂停",
					value: "pause"
				}]);
				var moreopt = [{
					text: "更多操作",
					value: -9999
				}, {
					text: "删除",
					value: "delete"
				}, {
					text: "展现方式",
					value: 'showprob'
				}, {
					text: "设置搜索意图定位",
					value: 'setQrstat'
				}];
				/*if (nirvana.env.USER_ID != nirvana.env.OPT_ID) {//全投后没有多设备推广管理了
					moreopt[4] = {
						text: "启用多设备管理",
						value: 'setMulDevice'
					}
				}*/
				this.setContext('moreOpt', moreopt);
			}
            callback();
        },
		level : function(callback) {
			if (!this.arg.refresh) {
				var level = [{
					level : 0,
					word: nirvana.env.USER_NAME,
					click : function(){}
				}];
				
				this.setContext('materialLevel', level);
			}
			
			callback();
		},
		
		dateRange : nirvana.manage.getStoredDate([0,1,2,3,4,6]),
				
		searchCombo : function (callback){
		    var me = this;
		    //状态列表的设置
			if (!me.arg.refresh) {
				me.setContext('SearchState', 
			      {datasource: nirvana.manage.getStatusSet("plan"), 
			          value: '100', width:120
			    });
			    
			    //精确查询相关设置
			    me.setContext('SearchPrecise', {
			        name: 'precise',
			        title: '精确查询',
			        value: 1
			    });
			}
			
		    //恢复搜索控件状态
		    me.setContext('searchStateValue', me.arg.queryMap.status || 100);
			me.setContext('searchQueryValue', me.arg.queryMap.query ? me.arg.queryMap.query : '');
            me.setContext('searchPreciseValue', me.arg.queryMap.queryType == 'accurate');
		    callback();
		},
		
		tableFields : function(callback){
			var me = this;
			if (!me.arg.refresh) {
				nirvana.manage.planTableField = {
					planname:{
						content: function (item) {
							var title = baidu.encodeHTML(item.planname), content = getCutString(item.planname, 30, "..");
                            var html = [];
							html[html.length] = '<div class="edit_td" planid=' + item.planid + ' control = "' + title + '">';
							html[html.length] = 	'<a title="' + title +  '" href="javascript:void(0);" planid=' + item.planid + ' level = "plan" data-log="{target:'+"'linkplan_lbl'"+'}" > ' + content + '</a>';
							html[html.length] = 	'<a class="edit_btn" edittype="planname"></a>';
							// 预先加上fclab
							html[html.length] = '<span bubblesource="fclabcpastat" id="labcpastat' + item.planid + '"></span>';
                            html[html.length] = '</div>';
							return html.join("");
						},
						locked: true,
						sortable : true,
						filterable : true,
						field : 'planname',
						title: '推广计划',
						width: 250						
					}, 
                    deviceprefer: {
                        content: function(item) {
                            var data;
                            if (!item) {
                                data = '仅计算机';
                            } else {
                                if (item.deviceprefer === 0) {
                                    data = '全部设备';
                                } else if (item.deviceprefer === 2) {
                                    data = '仅移动设备';
                                } else {
                                    data = '仅计算机';
                                }
                            }
                            return data;
                        },
                        title: '投放设备',
                        field: 'deviceprefer',
                        sortable: true,
                        width: 100
                    },
					planstat:{
						content: function (item) {
							var stat = nirvana.util.buildStat('plan', item.planstat, item.pausestat, {
								planid: item.planid
							});
							nirvana.manage.UPDATE_ID_ARR.push(item.planid);
							return '<span class="plan_update_state" id="planstat_update_' + item.planid + '">' + stat + '</span>';
						},
						title: '状态',
						sortable : true,
						filterable : true,
						field : 'planstat',
						width: 130,
						noun:true,
						minWidth : 130,
						nounName : '推广计划状态'
					}, 
					shows:{
						content: function(item){
							var data = item.shows;
							if (nirvana.manage.hasToday(me)) { // 包含当天数据  只有展现和点击率显示为-
								data = '-';
							}
							if (data == ''){//SB doris
								return STATISTICS_NODATA;
							}
							if (data == '-') {
								return data;
							}
							return parseNumber(data);
						},
						title: '展现',
						align: 'right',
						sortable : true,
						filterable : true,
						field : 'shows',
						width: 60
					}, 
					clks:{
						content: function(item){
							var data = item.clks;
							if (data == ''){//SB doris
								return STATISTICS_NODATA;
							}
							if (data == '-') {
								return data;
							}
							return parseNumber(data);
						},
						title: '点击',
						align: 'right',
						sortable : true,
						filterable : true,
						field : 'clks',
						width: 60
					}, 
					qrstat1:{
						content: function(item){
							var data = item.qrstat1, html = [], aqr = me.getContext("acctQrstat");
							if(aqr == 1){
								return "全账户关闭";
							}
							else {
								html[html.length] = '<div class="edit_td" planid=' + item.planid + ' control = "' + data + '">';
								html[html.length] = data == 0 ? '开启' : '关闭';
								html[html.length] = '<a class="edit_btn" edittype="qrstat1"></a>';
	                            html[html.length] = '</div>';
								return html.join("");
							}
						},
						title: '搜索意图定位',
						field : 'qrstat1',
						width:115,
						minWidth: 115,
						noun:true,
						nounName: "搜索意图定位"
					},
					paysum:{
						content: function (item) {
							if (item.paysum == ''){//SB doris
								return fixed(STATISTICS_NODATA);
							}
						    return fixed(item.paysum);
						},
						title: '消费',
						align: 'right',
						sortable : true,
						filterable : true,
						field : 'paysum',
						width: 60
					},
					trans:{
						content: function(item){
							var data = item.trans;
							if (data == ''){//SB doris
								return STATISTICS_NODATA;
							}
							if (data == '-') {
								return data;
							}
							return parseNumber(data);
						},
						title: '转化(网页)',
						align: 'right',
						sortable : true,
						filterable : true,
						field : 'trans',
						width: 100,
						minWidth: 118,
						noun : true,
						nounName: "转化(网页)"
					}, 
					phonetrans:{
						content: function(item){
							var data = item.phonetrans;
							if (data == ''){//SB doris
								return STATISTICS_NODATA;
							}
							if (data == '-') {
								return data;
							}
							return parseNumber(data);
						},
						title: '转化(电话)',
						align: 'right',
						sortable : true,
						filterable : true,
						field : 'phonetrans',
						width: 80,
						minWidth: 118,
						noun : true,
						nounName: "转化(电话)"
					}, 
					avgprice:{
						content: function (item) {
							if (item.avgprice == ''){//SB doris
								return fixed(STATISTICS_NODATA);
							}
						    return fixed(item.avgprice);
						},
						title: '平均点击价格',
						align: 'right',
						sortable : true,
						filterable : true,
						field : 'avgprice',
						width: 130,
						minWidth: 150,
						noun : true
					},
					clkrate:{
						content: function (item) {
							if (nirvana.manage.hasToday(me)) { // 包含今天数据
								return '-';
							}
							if (item.clkrate == ''){//SB doris
								return floatToPercent(STATISTICS_NODATA);
							}
						    return floatToPercent(item.clkrate);
						},
						title: '点击率',
						align: 'right',
						sortable : true,
						filterable : true,
						field : 'clkrate',
						width: 75,
						minWidth: 110,
						noun : true
					},
					showpay:{
						content: function (item) {
							if (item.showpay == ''){//SB doris
								return fixed(STATISTICS_NODATA);
							}
						    return fixed(item.showpay);
						},
						title: '千次展现消费',
						align: 'right',
						sortable : true,
						filterable : true,
						field : 'showpay',
						width: 115,
						minWidth:140,
						noun : true
					},
					wbudget:{
						content: function (item) {
							var html = [], budget = item.wbudget == "" ? "不限定" : fixed(item.wbudget), title = baidu.encodeHTML(item.planname);
							html[html.length] = '<div class="edit_td">';
							html[html.length] = '<span>' + budget + '</span>';
							html[html.length] = '<a class="edit_btn edit_btn_left" edittype="wbudget" planid="' + item.planid + '" wbudget="' + item.wbudget + '"' + ' control = "' + title + '"></a>';
                            html[html.length] = '</div>';
							return html.join("");
						},
						title: '每日预算',
						align: 'right',
						sortable : true,
						filterable : true,
						field : 'wbudget',
						width: 90
					},
					wregion:{
						content: function (item) {
							var list = item.wregion == '' ? [] : item.wregion.split(','), 
								abregion = nirvana.manage.region.abbRegion(list, 'plan'), 
								word = abregion.word, 
								title = abregion.title,
								html = [];
							html[html.length] = '<div class="edit_td" planid=' + item.planid + ' control="' + item.wregion + '">';
							html[html.length] = '<span title="' + title + '">' + word + '</span>';
							html[html.length] = '<a class="edit_btn" edittype="wregion"></a>';
                            html[html.length] = '</div>';
							return html.join("");
						},
						title: '推广地域',
						width: 110,
						minWidth:130
					},
					plancyc:{
						content: function (item) {
							if (item.plancyc == ''){
								var content = '全部';
							}
							else {
								var content = '自定义';
							}
							var html = [];
							html[html.length] = '<div class="edit_td" planid=' + item.planid + '>';
							html[html.length] = '<span>' + content + '</span>';
							html[html.length] = '<a class="edit_btn" edittype="plancyc"></a>';
                            html[html.length] = '</div>';
							return html.join("");
						},
						title: '推广时段',
						width: 100
					},
					showprob:{
						content: function (item) {
							switch (item.showprob + ''){
								case '1':
								    var content = '优选';
									break;
								case '2':
								    var content = '轮替';
									break;
								default:
								    var content = '轮替';
									break;
							}
							var html = [];
							html[html.length] = '<div class="edit_td" planid=' + item.planid + ' control = "' + item.showprob + '">';
							html[html.length] = '<span>' + content + '</span>';
							html[html.length] = '<a class="edit_btn" edittype="showprob"></a>';
                            html[html.length] = '</div>';
							return html.join("");
						},
						title: '创意展现方式',
						sortable : true,
						filterable : true,
						field : 'showprob',
						width: 115					
					},
					allnegativecnt:{
						content: function (item) {
							var len = item.allnegativecnt;
                            var html = [];
							html[html.length] = '<div class="edit_td" planid=' + item.planid + '>';
							html[html.length] = '<span>' + len + '</span>';
							html[html.length] = '<a class="edit_btn edit_btn_left" edittype="negative"></a>';
                            html[html.length] = '</div>';
							return html.join("");
						},
						title: '否定关键词',
						sortable : true,
						filterable : true,
						field : 'allnegativecnt',
						align: 'right',
						width: 100
					},
					allipblackcnt:{
						content: function (item) {
							var len = item.allipblackcnt;
                            var html = [];
							html[html.length] = '<div class="edit_td" planid=' + item.planid + '>';
							html[html.length] = '<span>' + len + '</span>';
							html[html.length] = '<a class="edit_btn edit_btn_left" edittype="ipblack"></a>';
                            html[html.length] = '</div>';
							return html.join("");
							
						},
						title: 'IP排除',
						sortable : true,
						filterable : true,
						field : 'allipblackcnt',
						align: 'right',
						width: 100
					}
				};

				nirvana.manage.UserDefine.getUserDefineList('plan', function(){
					// 融合1.0，主控制器初始化
					// 使用回调，是因为初始化时需要请求当前展开/收起状态
					// added by Leo Wang(wangkemiao)
					// 2013-03-31
					nirvana.fuseSuggestion.controller.init('plan',
						{
							starttime: me.getContext('startDate'),
                        	endtime: me.getContext('endDate')
						}, 
						function() {
							var ud = nirvana.manage.UserDefine,
								localList = ud.attrList['plan'],
								data = [], i, len;

							for (i = 0, len = localList.length; i < len; i++) {
								data.push(nirvana.manage.planTableField[localList[i]]);
							}
							
							me.setContext('tableFields', data);
							callback();
						});
					}
				);
			}else{
				callback();
			}
		},
		
		planData : function(callback){
			var me = this;
			if (!me.arg.refresh) {
				var tabData = ['推广计划 <sup>()</sup>', '推广单元', '创意', '关键词'];
				me.setContext('tab', tabData);
				me.setContext('planListData', []);
			}
			callback();
		},
		
		noDataHtml: function(callback){
			if (!this.arg.refresh) {
				this.setContext("noDataHtml", "");
			}
			callback();
		},
		
		/**
		 * 获取新建账户状态
		 * @param {Object} callback
		 */
		getUserType : function(callback) {
			var me = this;
			
			nirvana.manage.getUserType(me, callback);
		},
		
		getAddPlan: function(callback){
			var me = this;
			
			me.setAddPlanData();
			
			callback();
		}
	},

	onafterrender : function(){
		var me = this,
			planid = [],
			controlMap = me._controlMap;
			
		//全投搬家历史记录下载
		nirvana.manage.allDeviceHisDownLoad();
		
		//全投提示浮层
		//如果用户没有权限，则不作任何操作
	    if (nirvana.env.readMobileNotice) {//有显示浮层的权限
			me.showMobileNoticeFloat();
		}

		// 表格loading
		controlMap.planTableList.getBody().innerHTML = ''
			+ '<div class="loading_area">'
			+ '    <img src="asset/img/loading.gif" alt="loading" /> 读取中'
			+ '</div>';
				
		//给表格注册:排序事件
		controlMap.planTableList.onsort = function(sortField,order){
			me.setContext("orderBy",sortField.field);
			me.setContext("orderMethod",order);
			me.refresh();
		}
		//给表格注册:筛选事件
		controlMap.planTableList.onfilter = nirvana.manage.FilterControl.getTableOnfilterHandler(me,'planTableList'); 
		//给表格注册:选择事件
        controlMap.planTableList.onselect = me.selectListHandler();
		//给表格注册:行内编辑处理器
        controlMap.planTableList.main.onclick = me.getTableInlineHandler();		
		
		// 修改预算按钮默认为disable状态
		controlMap.modifyPlanBudget.disable(true);
		
        //启用暂停删除
        controlMap.runPause.onselect = me.operationHandler();
        controlMap.moreOpt.onselect = me.operationHandler();
        
		//注册工具箱导入方法
		ToolsModule.setImportDataMethod(function(){
			var selectedList = me.selectedList,
	            data = me.getContext('planListData'),
	            res = {
					level : 'plan',
					data : []
				},
				i, len;
			
	        if (selectedList && selectedList.length > 0){
				for(i = 0, len = selectedList.length; i < len; i++){
		            res.data.push(data[selectedList[i]]);
		        }
			}
			
			return res;
		});
		
		//组合查询
        controlMap.materialQuery.onclick = me.getSearchHandler();
		controlMap.materialQuery.repaint(controlMap.materialQuery.main);
		baidu.g('searchComboTipContent').onclick = nirvana.manage.SearchTipControl.getSearchTipHandler(me,'planTableList');
        //controlMap.cancelComboSearch.onclick = me.getCancelSearchHandler();
		
		//优化 by linzhifeng@baidu.com 2011-08-29
		nirvana.manage.setModDialog(me);
		
		controlMap.calendar.onselect = function(data){
			for(var i in data){
				data[i] = data[i] && baidu.date.format(data[i],'yyyy-MM-dd');
			}
			me.setContext('startDate', data.begin);
			me.setContext('endDate', data.end);
			nirvana.manage.setStoredDate(data);
			me.refresh();
		};
		
		//这里只做保存时间的事儿就行了 因为快捷方式被选的时候上面的onselect也会触发
		controlMap.calendar.onminiselect = function(data){
			nirvana.manage.setStoredDate(data);
		};
		
		//tab select
		controlMap.tab.onselect = nirvana.manage.tab.getTabHandler(me,controlMap.tab,'计划');
		
		//pageSizeSelect
		controlMap.pageSizeSelect.onselect = me.getPageSizeHandler();
		
		//pagination
	    controlMap.pagination.onselect = me.getPaginationHandler();
		
		//自定义列
		controlMap.userDefine.onclick = nirvana.manage.UserDefine.getUserDefineHandler(me, 'plan', 'planTableList');
		
		baidu.g("acctStat").style.display = "block";
		
		//附加tab
		EXTERNAL_LINK.tabInit("ExtraTab");
		
		//批量下载 初始化 liuyutong@baidu.com
		nirvana.manage.batchDownload.initCheck();
	},
	
	onreload : function(){ 
		this.refresh();
	},

	onbeforerepaint : function(){
		var me = this;
		me.refreshAddPlan(); // 这里是为了能够更新button状态
	},
	
	onentercomplete : function(){
		var me = this,
		    controlMap = me._controlMap,
			span = $$('#manageLevel .ui_bubble');
			
		me.createBtnInit();

		var crumbs = new nirvana.manage.crumbs(me);
		// wangkemiao 2012.12.06
		// 因为需要context中的planid等信息，所以在callback中执行
		crumbs.getCrumbsInfo(function(){
			me.getPlanData();
			// wanghuijun 2012.11.30
			// 模块化实践，ao按需加载
			$LAB.script(nirvana.loader('proposal'))
				.wait(function() {
					me.changeAoParams();
					nirvana.aoControl.init(me);
				});
			// wanghuijun 2012.11.30
		});
		
        //面包屑
		nirvana.manage.LXB.setStatus(span[0]);

		nirvana.manage.UserDefine.dialog.hide();
		
		nirvana.manage.SearchTipControl.initSearchComboTip(me);


		//恢复账户树状态
	    nirvana.manage.restoreAccountTree(me);
	
		//批量下载  by liuyutong@baidu.com 2011-8-2
			baidu.g('batchDownload_acct').appendChild(nirvana.manage.batchDownload.batchEL);

		nirvana.aoPkgControl.popupCtrl.init();

		// 自动展现的周预算新功能提示
		nirvana.manage.switchBudgetBubble(me);
	},
	
	onafterinitcontext : function(){
		nirvana.CURRENT_MANAGE_ACTION_NAME = 'plan';
	},
	
	
	
	onleave : function(){
		nirvana.CURRENT_MANAGE_ACTION_NAME = '';
		//隐藏搬家历史浮层
		
		baidu.addClass(baidu.g('downLoadDeviceChange'), 'hide');
	},
	
	
	//用于面包屑数据即时更新时使用
	nowStat : {
		id : null,
		level : null,
		stat : null
	    },

	/**
	 * 获取fclab cpa状态
	 */
	getFclabCpaState: function() {
		var me = this,
			controlMap = me._controlMap;
		var tableData  = controlMap['planTableList'];
		if(!tableData || tableData.datasource) {
			return;
		}
		var ids = [];
		for(var i = 0, len = tableData.datasource.length; i < len; i ++) {
			ids.push(
				tableData.datasource[i].planid
			);
		}
		fbs.material.getFclabStat({
			level: "useracct",
			idset: ids,
			onSuccess: function(o) {
				var result = o.data;
				ui.Bubble.source.fclabcpastat.cpastat = result;
				for(var key in result) {
					if(!!~baidu.array.indexOf(result[key], 2)) {
						var icon = baidu.g("labcpastat" + key);
						if (icon) {
							baidu.dom.addClass(icon, "ui_bubble");
						}
					}
				}
				ui.Bubble.init();
			}
		});
	},
	
	
	/**
	 * 打开无线提醒浮层
	 * @param {Object} idarr userid集合
	 * @zhouyu	2012-12-10
	 */
	showMobileNoticeFloat: function(idarr){
		//隐藏主页面的滚动条
		ui.ToolBar.prototype.setMain(true);
		var minRange = "0.1";
		if(nirvana.env.OLD_ALLDEVICE_FLOAT){//旧的浮层 搬家方案为0.2
			minRange = '0.2';
		}
		baidu.g("MobileNotice").innerHTML = ui.format(er.template.get("mobileNotice"),minRange);
		
			
		baidu.removeClass("MobileNotice", "hide");
		baidu.on("ReadMobileNotice", "click", function(){
			//显示主页面的滚动条
			ui.ToolBar.prototype.setMain(false);
			//隐藏无线提醒浮层
			baidu.addClass("MobileNotice", "hide");
			baidu.g("MobileNotice").innerHTML = "";
			nirvana.env.readMobileNotice = false;
			fbs.account.readAllDeviceFloat({});//向后端发送请求，该浮层用户已经点了我知道
			
		});
		
	},

		
	/**
	 * 获取计划列表数据
	 */
	getPlanData: function(){
		var me = this;
        fbs.account.getQrstat1({
            nocache: true,
            onSuccess: function(response){
                var acctQrstat = +response.data.listData[0].qrstat1;
                me.setContext("acctQrstat", acctQrstat);
                //由cache保证不对后端造成过大压力
                nirvana.manage.UserDefine.getUserDefineList('plan', function(){
                    var ud = nirvana.manage.UserDefine, localList = [], i, len, data = [];
                    for (i = 0, len = ud.attrList['plan'].length; i < len; i++) {
                        localList[i] = ud.attrList['plan'][i];
						data.push(nirvana.manage.planTableField[localList[i]]);
                    }
					me.currentFileds = data;
					
                    localList.push('planid', 'pausestat');
                    //汇总数据需要，mod by linzhifeng zhouyu
                    var extraCols = ['shows', 'clks', 'paysum', 'trans', 'planstat'], extraItem;
                    for (var k = 0, l = extraCols.length; k < l; k++) {
                        extraItem = extraCols[k];
                        if (baidu.array.indexOf(localList, extraItem) == -1) {
                            localList.push(extraItem);
                        }
                    }

                    // 获取数据之前，针对于融合1.0新增的列optsug
                    // 不要发之，获取它会让数据很慢
                    // so...
                    // added by Leo Wang(wangkemiao)
                    // 2013-03-31
                    nirvana.fuseSuggestion.controller.cancelRequestFusefield(localList);
                    // console.log(localList);

                    if(nirvana.acc.expControl.isArrowUser()) {
                    	me.newTableModel.setFieldList(localList)
                    		.load({
	                    		starttime: me.getContext('startDate'),
		                        endtime: me.getContext('endDate'),
		                        onSuccess: me.getPlanDataHandler(),
		                        onFail: function(data){
		                            ajaxFailDialog();
		                        }
	                    	});
                    }
                    else {
	                    fbs.material.getAttribute('planinfo', localList, {
	                        starttime: me.getContext('startDate'),
	                        endtime: me.getContext('endDate'),
	                        
	                        onSuccess: me.getPlanDataHandler(),
	                        onFail: function(data){
	                            ajaxFailDialog();
	                        }
	                    });
	                }
                });
            },
            onFail: function(response){
                ajaxFailDialog();
            }
        });
	},

	newTableModel: new nirvana.newManage.TableModel({
		level: 'plan'
	}),
	
	/**
	 * 新建按钮初始化
	 */
	createBtnInit : function() {
		var me = this,
		    controlMap = me._controlMap;

		// 计划转全直接去除判断条件
		if (nirvana.env.FCWISE_MOBILE_USER
			|| this.getContext('userType') == 0  // 如果是快速新建账户的话
			|| (nirvana.env.EXP == '7240' && this.getContext('userType') == 1)){ // 或者是快速新建计划且是名单内用户
			// 隐藏原有新建按钮
            baidu.addClass(ui.util.get('addplan').main, 'hide');
            baidu.removeClass(ui.util.get('AddPlanPlus').main, 'hide');

            me.refreshAddPlan();
            
            // 快速新建按钮事件
            controlMap.AddPlanPlus.clickCurFunc = function() {
                if(nirvana.env.EXP == '7240' || me.getContext('userType') == 0){
	                nirvana.quicksetup.show({
						type : me.getContext('tasktype'),
						entrance : 1
					});
				}else{
					me.createPlan();
				}
            };
            // 新建计划按钮事件
            controlMap.AddPlanPlus.onselect = function(value) {
				// 在点击按钮时，taskstate与进入页面时的状态已经改变，所以需要重新请求。。。
                if (value == 'addplan') {
                    fbs.eos.taskstatus({
                        onSuccess: function(response){
                            var taskstate = response.data.taskstate,
                                tasktype = response.data.tasktype,
                                msg = tasktype == 'useracct' ? '账户' : '计划';
                            
                            switch (taskstate) {
                                case 0:
                                    me.createPlan();
                                    break;
                                case 1:
                                case 2:
                                    ui.Dialog.confirm({
                                        title: '快速新建' + msg + '任务正在进行',
                                        content: '您有一个快速新建' + msg + '任务已经在进行，是否仍然继续手动新建计划？',
                                        ok_button_lang : '取消新建',
                                        cancel_button_lang : '继续新建',
                                        onok: function() {
                                        },
                                        oncancel: function() {
                                            me.createPlan();
                                        }
                                    });
                                    break;
                                case 3:
                                case 4:
                                case 5:
                                case 6:
                                case 7:
                                    ui.Dialog.confirm({
                                        title: '快速新建' + msg + '任务等待确认',
                                        content: '您有一个快速新建' + msg + '任务已完成并等待确认，是否仍然手动新建计划？',
                                        ok_button_lang : '查看任务',
                                        cancel_button_lang : '继续新建',
                                        onok: function() {
                                            nirvana.quicksetup.show({
                                                type : tasktype,
												entrance : 4
                                            });
                                        },
                                        oncancel: function() {
                                            me.createPlan();
                                        }
                                    });
                                    break;
                                default:
                                    break;
                            }
                        },
                        onFail: function(response){
                            ajaxFailDialog();
                        }
                    });
                }else if(value == 'addwirelessplan'){
                	me.createPlan(value);
                }
            };

            // 快速新建计划才有新功能提示
            if (this.getContext('userType') != 0) {	
                fc.ui.init($$('#BubbleNewAccountTip'));
            }
        } else {
			// 隐藏新增下拉按钮
            baidu.addClass(ui.util.get('AddPlanPlus').main, 'hide');
            baidu.removeClass(ui.util.get('addplan').main, 'hide');
        }
	},
	
	/**
	 * 刷新下拉按钮
	 */
	refreshAddPlan : function() {
		var me = this;
		
		me.setAddPlanData();
		
		me._controlMap.AddPlanPlus.render();
	},
	
	/**
	 * 新建计划
	 */
	createPlan : function(type) {
        nirvana.util.openSubActionDialog({
            id: 'createPlanDialog',
            title: '新建推广计划',
            width: 440,
            actionPath: 'manage/createPlan',
            params: {
            	type : type
            },
            onclose: function(){
            }
        });
	},
	
	/**
	 * 处理计划列表数据
	 * @param {Object} callback
	 */
	getPlanDataHandler: function(){
		var me = this;
		return function(data){
			// console.log(data);
			nirvana.manage.UPDATE_ID_ARR = [];
			nirvana.manage.NOW_TYPE = 'plan';
			nirvana.manage.NOW_DATA = data;
			//如果忽略状态，表格也得清状态    by linfeng 2011-07-05
			nirvana.manage.resetTableStatus(me, "planTableList");
			
			var field = me.getContext("orderBy"), 
				order = me.getContext("orderMethod"), 
				result;
			//根据状态和Query筛选数据
			result = nirvana.manage.FilterControl.filterData(me, 'planstat', data.data.listData);
			//表格筛选
			result = nirvana.manage.FilterControl.tableFilterData(me, result);
			
			//根据context值进行排序
			result = nirvana.manage.orderData(result, field, order);
			
			//设置tab标签里面的数据 yanlingling
		    nirvana.manage.tab.renderTabCount(me,result.length);
			
			//var tabData = ['推广计划 <sup>(' + result.length + ')</sup>', '推广单元', '创意', '关键词'];
			//me.setContext('tab', tabData);
			
			me.setNoDataHtml();
			me.processData(result);
			nirvana.manage.noDataHtmlClick(me);

			// 融合更新状态+事件绑定，需要注意不要重复绑定事件
			if(me._controlMap.planTableList) {
				nirvana.fuseSuggestion.controller.update(me._controlMap.planTableList.main);
			}
		}
	},
	
	//无数据
	setNoDataHtml: function(){
		var me = this,
			status = me.getContext('status'), 
			query = me.getContext('query'), 
			filterCol = me.getContext('filterCol');
		
		if ((!status || status == '100') && (!query || query == '')) {
			me.setContext("noDataHtml", FILL_HTML.PLAN_NO_DATA);
            if (!me.arg.queryMap.ignoreState) {
                for (var field in filterCol) {
                    //遍历所有筛选条件
                    if (filterCol[field].on) {
                        me.setContext("noDataHtml", FILL_HTML.SEARCH_NO_DATA);
                        break;
                    }
                }
            }
		}
		else {
			me.setContext("noDataHtml", FILL_HTML.SEARCH_NO_DATA);
		}
		
		nirvana.manage.noDataHtmlPlus(me);
	},
	
	/**
	 * 处理计划数据并汇总展现数据
	 * @author tongyao@baidu.com zhouyu01@baidu.com
	 */
	processData : function(result){
		var me = this,
		    pageSize = +me.getContext('pageSize'),
		    pageNo = me.arg.pageNo || me.getContext('pageNo') || 1,
			start,totalPage,i,l,len,
			rs = [];	//= baidu.object.clone(result); //优化 by linzhifeng@baidu.com 2011-08-29
		
		len = result.length;
		totalPage = Math.ceil(len/pageSize) || 1; // 这里len有可能为0，所以totalPage要更改为1
		pageNo = pageNo > totalPage ? totalPage : pageNo;
		start = (pageNo - 1) * pageSize;
		//优化 by linzhifeng@baidu.com 2011-08-29
		l = (len > (start + pageSize)) ? (start + pageSize) : len;
		for (i = start; i < l; i++){
			rs.push(result[i]);
		}
		//翻页控件用数据
		me.setContext('totalNum', len);
		me.setContext('pageNo', pageNo);
		me.setContext('totalPage',totalPage);
		
		//table用数据	
		me.setContext('tableFields', me.currentFileds);
		me.setContext('planListData', rs); 
		
		//统计展现、点击等汇总数据
		var item,
		    clks = 0,
			shows = 0,
			paysum = 0,
			transSum = 0;
		
		for (i = 0; i < len; i++){
			item = result[i];
			clks += item.clks - 0;
            shows += item.shows - 0;
            paysum += item.paysum - 0;
			transSum += item.trans - 0;
		}
		
		var transRate = clks <= 0 ? '0' : (transSum / clks * 100).toFixed(2),//转化而已，没用
			avgprice = clks <= 0 ? '0.00' : (paysum / clks).toFixed(2),
			clickRate = shows <= 0 ? '0' : (clks / shows * 100).toFixed(2);
		
		me.setContext('totalClks', nirvana.manage.abbNumber(clks,1));
		me.setContext('totalClksTitle', clks);//点击
		
		if (nirvana.manage.hasToday(me)) {
			me.setContext('totalShows', '-');
			me.setContext('totalShowsTitle', '-');
			me.setContext('clickRate', '-');
		} else {
			me.setContext('totalShows', nirvana.manage.abbNumber(shows,1));
			me.setContext('totalShowsTitle', shows);//展现
			me.setContext('clickRate', clickRate + '%');//点击率
		}
		
        me.setContext('totalPaysum', '&yen;' + nirvana.manage.abbNumber(paysum));//消费
        me.setContext('paysumTitle', '¥' + fixed(paysum));
		me.setContext('transRate', transSum);//转化
        me.setContext('avgprice', '&yen;' + avgprice);//平均点击
		me.repaint();
		
        //即时更新，refresh时才执行 zhouyu
        if (me.arg.refresh) {
            //即时更新 by liuyutong@baidu.com
            var updateParam = {};
            updateParam.starttime = me.getContext('startDate');
            updateParam.endtime = me.getContext('endDate');
            if (me.getContext("planid")) {
                updateParam.condition = {
                    planid: [me.getContext("planid")]
                };
            }
            fbs.material.getAttribute('planinfo', ['planstat:update'], updateParam);
        }

		// 获取fclab cpa状态
		me.getFclabCpaState();
	},
	
	/**
	 * 构造账户优化请求参数
	 */
	changeAoParams : function() {
		var me = this,
			aoControl = nirvana.aoControl;
		
		if (me.getContext('isSearch')) { // 搜索状态
			aoControl.changeParams({
				level: 'planinfo',
				command: 'start',
				signature: '',
				condition: me.getAoCondition()
			});
		} else { // 清除搜索
			aoControl.changeParams({
				level: 'useracct',
				command: 'start',
				signature: '',
				condition: {}
			});
		}
	},
	
	getPageSizeHandler : function () {
	    var me = this;
	    return function (value){
			//document.documentElement.scrollTop = ui.util.get('planTableList').fixedTop + 35;
			ui.util.get('planTableList').resetYpos = true;
            //切换每页显示条数的时候有重置到第一页
            me.setContext('pageNo',1);
	        me.setContext('pageSize', value);
	        me.refresh();
	    }
	},
	
	getPaginationHandler : function () {
	    var me = this;
	    return function (pageNo) {
			//document.documentElement.scrollTop = ui.util.get('planTableList').fixedTop + 35;
			ui.util.get('planTableList').resetYpos = true;
	        me.setContext('pageNo',pageNo);
	        me.refresh();
	    }
	},
    
    selectListHandler : function (selected) {
        var me = this,
            controlMap = me._controlMap,
            runPause = controlMap.runPause,
            moreOpt = controlMap.moreOpt,
			modifyPlanBudget = controlMap.modifyPlanBudget;
        return function (selected) {
            var enabled = selected.length > 0;
            me.selectedList = selected;
            runPause.disable(!enabled);
            //调整启用暂停下拉框 的disabled状态
            if(enabled) {
                me.setRunPauseOptionsState(selected);
            }
            moreOpt.disable(!enabled);
            modifyPlanBudget.disable(!enabled);
 			if(me.getContext("acctQrstat") == 1){
				moreOpt.disableItemByValue('setQrstat',true);
			}else{
				moreOpt.disableItemByValue('setQrstat',false);
			}

            // 读写分离，待升级之后不用这种方式了
            // by Leo Wang
			nirvana.acc.accService.processEntrances('manage/plan');
        }  
        
    },
    /**
     * 设置启用暂停按钮下拉框的状态
     */
    setRunPauseOptionsState : function (selectedList) {
        var me = this,
            i = 0, len = selectedList.length,
            data = me.getContext('planListData'),
            disablePauseState = true, disableStartState = true,
            runPauseControl = me._controlMap.runPause;
        
        for (; i < len; i++) {
            if (data[selectedList[i]].pausestat == '0'){//启用状态
                disablePauseState = false;//可以设置暂停
                continue;
            }
            if (data[selectedList[i]].pausestat == '1'){//暂停状态
                disableStartState = false;//可以设置启用
                continue;
            }
            if (!disablePauseState && !disablePauseState) {
                break;
            }
        }
        
        runPauseControl.disableItemByValue('start',disableStartState);
        runPauseControl.disableItemByValue('pause',disablePauseState);
    },
    
    
    operationHandler : function () {
        var me = this,
            controlMap = me._controlMap;

        return function (selected) {
            var title = '', msg = '', len = me.selectedList.length;
            switch (selected) {
                case 'start' :
                    title = '启用推广计划';
                    msg = '您确定启用所选的推广计划吗？';
                    break;
                case 'pause' :
                    title = '暂停推广计划';
                    msg = '您确定暂停所选的推广计划吗？';
                    break;
                case 'delete' :
                    title = '删除推广计划'; 
                    msg = '您确定删除所选的' +len+'个推广计划吗？确定将同时删除这些推广计划下所有推广单元，以及该单元下所有关键词、创意和附加创意。删除操作不可恢复。';
					break;
                case 'showprob' :
                    nirvana.util.openSubActionDialog({
                        id: 'modifyShowprobDialog',
                        title: '创意展现设置',
                        width: 440,
                        actionPath: 'manage/modPlanShowprob',
                        params: {
                            planid: me.getSelectedId()
                        },
                        onclose: function(){
                        }
                    });
                    break;
                case 'setQrstat' :
                    nirvana.util.openSubActionDialog({
                        id: 'setQrstatDialog',
                        title: '搜索意图定位设置',
                        width: 440,
                        actionPath: 'manage/setQrstat',
                        params: {
                            planid: me.getSelectedId()
                        },
                        onclose: function(){
                        }
                    });
                    break;
				case 'setMulDevice':
					title = '启用多设备管理';
                    msg = '确定启用多设备推广管理？';
					break;
            }
       	if (selected != "showprob" && selected != "setQrstat" ) {
		 	ui.Dialog.confirm({
		 		title: title,
		 		content: msg,
		 		onok: me.doOperationHandler(),
		 		optype: selected
		 	
		 	});
		 }
        }
    },
    
    doOperationHandler : function () {
        var me = this,
            controlMap = me._controlMap;
        return function (dialog) {
            var dialog = dialog,
                func,//需要调用的接口函数
                pauseStat, //0启用,1暂停
                planid = me.getSelectedId(),
                param = {planid: planid, 
                         onSuccess: me.operationSuccessHandler(), 
                         onFail: me.operationFailHandler(planid,dialog.args.optype)};            
                switch (dialog.args.optype) {
                    case 'start' :
                        func = fbs.plan.modPausestat;
                        pauseStat = 0;
                        break;
                    case 'pause' :
                        func = fbs.plan.modPausestat;
                        pauseStat = 1;
                        break;
                    case 'delete' : 
                        func = fbs.plan.del;
						param.onSuccess = me.operationSuccessHandler(planid, true);
    					break;
					case 'setMulDevice':
						func = fbs.plan.setMulDevice;
						param.onSuccess = me.setMulDeviceSuccessHandler(planid);
                }
    
                if (typeof pauseStat != 'undefined') {
                    param.pausestat = pauseStat;
                }
    
                func(param);
            }
    },
	
	
	/**
	 * 批量启用多设备推广管理成功
	 * @zhouyu
	 */
	setMulDeviceSuccessHandler: function(planids){
		var me = this;
		return function(response){
			//后台同学保证300是全部失败
		/*	if (response.status == 300) {
				planids = response.data;
			}*/
			var modifyData = {};
			for (var i = 0, len = planids.length; i < len; i++) {
				modifyData[planids[i]] = {
					"devicecfgstat": 1
				};
			}
			
			fbs.material.ModCache("planinfo", "planid", modifyData);
			//页面上没有任何有关多设备推广管理是否开启的提示，所以不用刷新页面，取消选择即可
			ui.util.get("planTableList").selectAll(false);
		}
	},
	
	
	/**
	 * 批量启用、暂停、删除计划成功
	 * @param {Object} planids
	 * @param {Object} needRefreshSideNav
	 */
    operationSuccessHandler : function (planids, needRefreshSideNav) {
        var me = this;
        return function (response) {
			if (needRefreshSideNav) {    //删除相对应的缓存操作
				fbs.material.clearCache('planinfo');
				//单元、创意、关键词、文件夹详情、排行榜
				fbs.material.ModCache('unitinfo', 'planid', planids, 'delete');
				fbs.material.ModCache('wordinfo', 'planid', planids, 'delete');
				fbs.material.ModCache('ideainfo', 'planid', planids, 'delete');
				fbs.avatar.getMoniFolders.clearCache();
				fbs.avatar.getMoniWords.ModCache('planid', planids, 'delete');
				fbs.material.getTopData.clearCache();
				//只有删除走这个分支，更新整树
				ui.util.get('SideNav').refreshPlanList();
				
				//附加创意缓存清除
                fbs.appendIdea.getAppendIdeaList.ModCache('planid', planids, 'delete');
			}
			else {   //修改操作相对应的缓存操作
				var modifyData = response.data;
				fbs.material.ModCache('planinfo', "planid", modifyData);
				fbs.material.clearCache('unitinfo');
				fbs.material.clearCache('wordinfo');
				fbs.material.clearCache('ideainfo');
				//bug fix 修改状态也要刷新账户树
				for (var pid in modifyData){
                    ui.util.get('SideNav').refreshUnitList([pid]);
                }
                //附加创意缓存清除
                fbs.appendIdea.getAppendIdeaList.clearCache();
            
			}
            me.refresh();
        };
    },

    operationFailHandler : function (planid,type) {
        var me = this,
        	optPlanid = planid,
            optType = type;
        return function (data) {
        	if (data.status == '400') {
				var errorcode = +data.errorCode.code;
				switch (errorcode) {
					case 406:
						var func,//需要调用的接口函数
 						param = {
							planid: optPlanid,
							onSuccess: me.operationSuccessHandler(),
							onFail: me.operationFailHandler(optPlanid, optType)
						};
						switch (optType) {
							case 'start':
								func = fbs.plan.modPausestat;
								param.pausestat = 0;
								break;
							case 'pause':
								func = fbs.plan.modPausestat;
								param.pausestat = 1;
								break;
							case 'delete':
								func = fbs.plan.del;
								param.onSuccess = me.operationSuccessHandler(optPlanid, true);
								break;
						}
						ui.Dialog.confirm({
							title: '操作失败',
							content: nirvana.config.LANG[errorcode],
							onok: function(){
								func(param);
							},
							oncancel: function(){
								//ajaxFailDialog();
								me.refresh();
							}
						});
						return;
					case 407:
					case 408:
						me.abnormalUser(errorcode);
						return ;
					default:
						ajaxFailDialog();
						return ;
				}
			}
			ajaxFailDialog();

        }
    },
	
	//限制变态用户操作
	abnormalUser:function(errorcode){
		ui.Dialog.alert({
							title: '系统提示',
							content: nirvana.config.LANG[errorcode],
							width: 290
						});
	},

    getSelectedId : function () {
        var me = this,
            selectedList = me.selectedList,
            data = me.getContext('planListData'),
            i, len, ids = [];

        for(i = 0, len = selectedList.length; i < len; i++){
            ids.push(data[selectedList[i]].planid);
        }

        return ids;
    },

    //获取选中的计划的名称
    //add by LeoWang(wangkemiao@baidu.com)
    getSelectedPlanName : function(){
    	var me = this,
	        selectedList = me.selectedList,
	        data = me.getContext('planListData'),
	        i, len, names = [];
	
	    for(i = 0, len = selectedList.length; i < len; i++){
	    	names.push(data[selectedList[i]].planname);
	    }
	
	    return names;
    },
    getSelectedBgttype : function(){
    	var me = this,
	        selectedList = me.selectedList,
	        data = me.getContext('planListData'),
	        i, len, bgttype, wbudget, tmp;
    	
    	//多个计划的话 直接返回1 日预算
    	if(selectedList.length > 1){
    		return 1;
    	}
    	else if(selectedList.length == 1){
    		wbudget = data[selectedList[0]].wbudget
        	return (wbudget == '' ? 0 : 1);
    	}
    		
	    return null;
    },
    //add ended
	
	//获取计划列表所有计划id
	getAoCondition: function(){
		var me = this,
			listData = me.getContext("planListData"),
			condition = {},
			planids = [];
		 for(var i = 0, len = listData.length; i < len; i++){
            planids[planids.length] = listData[i].planid;
         }
		 condition.planid = planids;
		 return condition;
	},
	
    /**
     * 表格行内操作事件代理器
	 * modify by zhouyu 
     */
    getTableInlineHandler : function () {
        var me = this;
        return function (e) {
            var event = e || window.event,
                target = event.target || event.srcElement,
				type,parent,
				logParams = {};
			if(target.getAttribute('level')){//by liuyutong@baidu.com
				var level = target.getAttribute('level');
				switch(level) {
				
				// 跳转 到计划层级
				case 'plan' :
				    er.locator.redirect('/manage/unit~ignoreState=1&navLevel=plan&planid=' + target.getAttribute('planid') );
					break;
				
				// 跳转 到单元层级
				case 'unit' :
				    er.locator.redirect('/manage/keyword~ignoreState=1&navLevel=unit&unitid=' + target.getAttribute('unitid') );
					break;
				default:  break;
				}
			}else{
				while(target  && target != ui.util.get("planTableList").main){
					if(target.className && target.className == 'status_op_btn'){
						me.doInlinePause(target)
						break;
					}
					if(baidu.dom.hasClass(target,"edit_btn")){
						var current = nirvana.inline.currentLayer;
						if (current && current.parentNode) {
							nirvana.inline.editArea.dispose();
							current.parentNode.removeChild(current);
						}
						type = target.getAttribute("edittype");
						switch(type){
							case "planname":
								me.inlinePlanName(target);
								logParams.target = "editInlinePlanName_btn";
								break;
							case "wregion":
								me.inlineWregion(target);
								logParams.target = "editInlineWregion_btn";
								break;
							case "qrstat1":
								me.inlineQrstat1(target);
								logParams.target = "editInlineQueryRegion_btn";
								break;
							case "plancyc":
								me.inlinePlancyc(target);
								logParams.target = "editInlinePlancyc_btn";
								break;
							case "showprob":
								me.inlineShowprob(target);
								logParams.target = "editInlineShowprob_btn";
								break;
							case "negative":
								me.inlineNegative(target);
								logParams.target = "editInlineNegative_btn";
								break;
							case "ipblack":
								me.inlineIpBlack(target);
								logParams.target = "editInlineIpBlack_btn";
								break;
							case 'wbudget':
                                //add by LeoWang(wangkemiao@baidu.com)
                                manage.budget.logParam = {
                                    'entrancetype' : 2
                                };
                                //add ended
								manage.budget.openSubAction({
									type : 'planinfo',
									planid : [target.getAttribute('planid')],
									planname : [target.getAttribute('control')]
								});
								logParams.target = "editInlineWbudget_btn";
								break;
						}
						break;
					}
					
					//小灯泡 by Tongyao
					if(baidu.dom.hasClass(target, 'status_icon')){
						logParams.target = "statusIcon_btn";
						manage.offlineReason.openSubAction({
							type : 'planinfo',
							params : target.getAttribute('data')
						});
						break;
					}
					
					target = target.parentNode;
				}
				if(logParams.target){
					NIRVANA_LOG.send(logParams);
				}
			}
        };
    },
	

	/**
	 * 行内修改计划ip排除
	 * @param {Object} target
	 */
	inlineIpBlack: function(target){
		var me = this,
			parent = target.parentNode,
			planid = parent.getAttribute("planid");
		nirvana.util.openSubActionDialog({
					id: 'planSetDialog',
					title: '计划IP排除',
					width: 440,
					actionPath: 'manage/planIpExclusion',
					params: {
						planid:[planid],
						type:"inline"
					},
					onclose: function(){
					//	fbs.material.clearCache("planinfo");
					//	fbs.plan.getInfo.clearCache();
						er.controller.fireMain('reload', {});
					}
				});
	},
	
	
	/**
	 * 行内修改否定关键词
	 * @param {Object} target 事件目标
	 */
	inlineNegative: function(target){
		var parent = target.parentNode;
		var planid = parent.getAttribute("planid");
		nirvana.manage.modPlanNeg([planid]);
	},
	
	/**
	 * 行内修改创意展现方式
	 * @param {Object} target
	 */
	inlineShowprob: function(target){
		var me = this,
			parent = target.parentNode,
			planid = parent.getAttribute("planid"), 
			showprob = parent.getAttribute("control");
		nirvana.inline.createInlineLayer({
			type: "select",
			value: showprob,
			id: "showprob" + planid,
			datasource:[{
				text:'优选',
				value:'1'
			},{
				text:'轮替',
				value:'2'
			}],
			target: parent,
			okHandler: function(sprob){
				var modifyData = {};
				modifyData[planid] = {
					"showprob": sprob
				};
				return {
					func: fbs.plan.modShowprob,
					param: {
						planid: [planid],
						showprob: sprob,
						onSuccess: function(data){
							fbs.material.ModCache("planinfo", "planid", modifyData);
							er.controller.fireMain('reload', {});
						}
					}
				}
			}
		});
	},
	
	/**
	 * 行内修改计划推广时段
	 * @param {Object} target
	 */
	inlinePlancyc: function(target){
		var me = this,
        	row = me.getLineData(target);
		if(row){
			var parent = target.parentNode,
				planid = parent.getAttribute("planid"), 
				plancyc = row.plancyc;
			nirvana.manage.modPlanSchedule([planid],plancyc);
		} 
	},
	
	/**
	 * 根据编辑按钮对象获取当前行数据
	 * @param {Object} target
	 */
	getLineData: function(target){
		var isFind = false;
		while (target && target.tagName != "TR") {
			if(target.tagName == "TD"){
				isFind = true;
				break;
			}
			target = target.parentNode;
		}
		if(isFind){
			var index = target.getAttribute("row");
			return this.getContext('planListData')[index];
		}
		return false;
	},
	
	/**
	 * 行内修改计划地域
	 * @param {Object} target 事件目标
	 * @author zhouyu
	 */
	inlineWregion: function(target){
		var me = this,
			parent = target.parentNode,
			planid = parent.getAttribute("planid"), 
			wregion = parent.getAttribute("control");
		wregion = wregion == ''? [] : wregion.split(',');
		nirvana.manage.modPlanRegion([planid],wregion);
	},
	
	inlineQrstat1: function(target){
		var me = this,
			parent = target.parentNode,
			planid = parent.getAttribute("planid"), 
			qrstat = parent.getAttribute("control");
		nirvana.inline.createInlineLayer({
			type: "select",
			value: qrstat,
			id: "qrstat" + planid,
			datasource:[{
				text:'开启',
				value:'0'
			},{
				text:'关闭',
				value:'1'
			}],
			target: parent,
			okHandler: function(stat){
				var modifyData = {};
				modifyData[planid] = {
					"qrstat1": stat
				};
				return {
					func: fbs.plan.modRegion,
					param: {
						planid: [planid],
						qrstat1: stat,
						onSuccess: function(data){
							if (data.status != 300) {
								fbs.material.ModCache("planinfo", "planid", modifyData);
								//		er.controller.fireMain('reload', {});
								//		直接改context值，通过innHTML更改页面内容
								var linedata = me.getLineData(target);
								linedata.qrstat1 = stat;
								parent.parentNode.innerHTML = nirvana.manage.planTableField.qrstat1.content(linedata);
							}
							var current = nirvana.inline.currentLayer;
							if (current && current.parentNode) {
								current.style.left = "-9999px";
								current.style.top = "-9999px";
							}
						}
					}
				}
			}
		});
	},
	
		
	/**
	 * 行内修改计划名称
	 * @param {Object} target 事件目标
	 * @author zhouyu
	 */
	inlinePlanName: function(target){
		var me = this,
			parent = target.parentNode,
			planid = parent.getAttribute("planid"), 
			planname = parent.getAttribute("control");
		nirvana.inline.createInlineLayer({
			type: "text",
			value: planname,
			id: "planname" + planid,
			target: parent,
			okHandler: function(name){
				var modifyData = {};
				modifyData[planid] = {
					"planname": name
				};
				return {
					func: fbs.plan.modPlanname,
					param: {
						planid: [planid],
						planname: name,
						onSuccess: function(data){
                            if (data.status != 300) {
                                fbs.material.ModCache("planinfo", "planid", modifyData);
                                fbs.material.ModCache("unitinfo", "planid", modifyData);
                                fbs.material.ModCache("ideainfo", "planid", modifyData);
                                fbs.material.ModCache("wordinfo", "planid", modifyData);
                                fbs.avatar.getMoniWords.ModCache("planid", modifyData);
                                fbs.appendIdea.getAppendIdeaList.ModCache("planid", modifyData);
                                er.controller.fireMain('reload', {});
                                //ui.util.get('SideNav').refreshPlanList();
                                ui.util.get('SideNav').refreshUnitList([planid]);
                            }
						}
					}
				}
			}
		});
	},
	
    
    /**
     * 根据行内元素,获取一行的ID数组
     */
    getRowIdArr : function (target) {
        var me = this,
            data = me.getContext('planListData'),
            idArr = [], index;
        index = nirvana.manage.getRowIndex(target);
        idArr.push(data[index].planid);
        return idArr;
    },
    /**
     * 执行行内启用暂停操作
     */
    doInlinePause : function (target) {
        var me = this,
            idArr, pauseSta,
            func = fbs.plan.modPausestat,
			logParams = {
				target: "inlineRunPause_btn"
			};
        idArr = me.getRowIdArr(target);
        var pauseStat = nirvana.manage.getPauseStat(target,[0,1]);
		logParams.pauseStat = pauseStat;
		NIRVANA_LOG.send(logParams);

        nirvana.manage.inserLoadingIcon(target);
        func({
            planid: idArr,
            pausestat : pauseStat,
            onSuccess: me.inlinePauseSuccess,
            onFail: me.inlinePauseFailed(idArr,pauseStat, target)
        });
    },
    /**
     * 行内启用暂停操作成功
     */
    inlinePauseSuccess : function (response) {  
       	var modifyData = response.data;
		fbs.material.ModCache("planinfo", "planid", modifyData);
		fbs.material.clearCache('unitinfo');
		fbs.material.clearCache('wordinfo');
		fbs.material.clearCache('ideainfo');
		er.controller.fireMain('reload', {});
		//ui.util.get('SideNav').refreshPlanList();
		for (var pid in modifyData){
		    ui.util.get('SideNav').refreshUnitList([pid]);
		}
		
    },
    /**
     * 行内启用暂停操作失败
     */
    inlinePauseFailed : function (idArr,pauseStat, target) {
    	var me = this;
    	return function (data) {
		  	if (data.status == '400'){
				var errorcode = +data.errorCode.code;
				switch (errorcode) {
					case 406:
						ui.Dialog.confirm({
							title: '操作失败',
							content: nirvana.config.LANG[errorcode],
							onok: function(){
								fbs.plan.modPausestat({
									planid: idArr,
									pausestat: pauseStat,
									onSuccess: me.inlinePauseSuccess,
									onFail: me.inlinePauseFailed(idArr, pauseStat, target)
								});
							},
							oncancel: function(){
								me.refresh();
							}
						});
						return;
					case 407:
					case 408:
						me.abnormalUser(errorcode);
						target.innerHTML = "";
						return;
					default:
						ajaxFailDialog();
						return;				
				}
	    	}
	        ajaxFailDialog();
		}
    },
    
    /**
     * 组合查询
     *
     */
    getSearchHandler : function () {
        var me =  this;
        return function (condition) {
			
			var query = nirvana.util.firefoxSpecialURLChars.encode(condition.search);
			
            me.setContext('query', query);
            me.setContext('status', condition.state + '');
            me.setContext('queryType', condition.precise ? 'accurate' : 'fuzzy');
            
            me.setContext('searchStateValue', condition.state + '');
            me.setContext('searchQueryValue', condition.search);
            me.setContext('searchPreciseValue', condition.precise);
			
            //查询时重置到第一页
            me.setContext('pageNo',1);
            
            //me.initSearchComboTip();
			nirvana.manage.SearchTipControl.initSearchComboTip(me);
			nirvana.manage.SearchTipControl.recordSearchcondition('search_combo');
			
			me.refresh();
        };
    },
    
    /**
     *设置addPlanData 
     */
    setAddPlanData : function(){
    	var me = this,
    		exp = nirvana.env.EXP,   	
    		whiteList = nirvana.env.FCWISE_MOBILE_USER,//新建移动计划白名单用户
    		array = [{
				value: -9999,
				text: (me.getContext('userType') == 0 ? '快速新建账户' : '快速新建计划')
			}, {
				value: 'addplan',
				text: '新建计划'
			},{
				value: 'addwirelessplan',
				text: '新增移动设备计划'
			}],
			addPlanData = [];
		
		if(exp == '7240' || me.getContext('userType') == 0){ // 10.31快速新建帐户转全
			addPlanData[addPlanData.length] = array[0];
		}
		addPlanData[addPlanData.length] = array[1];
		addPlanData[0].value = -9999;
		if(whiteList){
			addPlanData[addPlanData.length] = array[2];
		}
		
		me.setContext('addPlanData',addPlanData);
    }
}); 

/**
 * 气泡
 */
ui.Bubble.source.defaultHelp.content = function(node, fillHandle, timeStamp){
		var ti = node.getAttribute('title') || node.getAttribute('bubbletitle') || node.parentNode.getAttribute('bubbletitle') || node.parentNode.getAttribute('title'),
			content = "";
		fbs.noun.getNoun({
			word: baidu.encodeHTML(ti),
			onSuccess: function(res){
				content = baidu.decodeHTML(res.data);
				setTimeout(function(){
					//为了防止第二次缓存作用下比return还快
					fillHandle(content, timeStamp);
				},200);
			},
			onFail: function(res){
				content = "读取数据失败";
				setTimeout(function(){
					//为了防止第二次缓存作用下比return还快
					fillHandle(content, timeStamp);
				},200);
			}
		});
		return IMGSRC.LOADING_FOR_TEXT;
};
