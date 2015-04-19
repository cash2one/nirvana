/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    unit/unit.js
 * desc:    推广管理
 * author:  zhouyu
 * date:    $Date: 2011/01/06 $
 */

manage.unitList = new er.Action({
	
	VIEW: 'unitList',
		
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
		navLevel : 'plan',
		planid : '',
		aoEntrance : 'Unitinfo', // Planinfo,Unitinfo,Wordinfo,Ideainfo,Monitor,Nav
		wrapper : 'ManageAoWidget'
	},
	
	//UI参数设置
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
		
		unitTableList : {
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
			datasource : '*unitListData'
		}
	},
	
	CONTEXT_INITER_MAP : {
		pageSizeOption : function(callback){
			if (!this.arg.refresh) {
				this.setContext('pageSizeOption',nirvana.manage.sizeOption);
			}
			callback();
		},
		
		optButton : function(callback){
			if (!this.arg.refresh) {
				this.setContext('runPause',[{
					text:"启用/暂停",
					value:-9999
				},{
					text:"启用",
					value:'start'
				},{
					text:"暂停",
					value:'pause'
				}]);
				this.setContext('moreOpt',[{
					text:"更多操作",
					value:-9999
				},{
					text:"删除",
					value:'delete'
				}]);
				this.setContext('runCancel',[{
					text:"启用电话追踪",
					value:-9999
				},{
					text:"启用电话追踪",
					value:'run'
				},{
					text:"取消电话追踪",
					value:'cancel'
				}])
			}
			
			callback();
		},
		dateRange : nirvana.manage.getStoredDate([0,1,2,3,4,6]),
		
		searchCombo : function (callback){
		    var me = this;
		    //状态列表的设置
			if (!me.arg.refresh) {
				me.setContext('SearchState', 
			      {datasource:nirvana.manage.getStatusSet("unit"), 
			          value: 100, width:120
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
			    nirvana.manage.unitTableField = {
					unitname:{
						content: function(item){
							var title = baidu.encodeHTML(item.unitname), content = getCutString(item.unitname, 30, ".."), html = [];
							html[html.length] = '<div class="edit_td" unitid=' + item.unitid + ' control = "' + title + '">';
							html[html.length] = '	<a title="' + title + '" href="javascript:void(0);" unitid=' + item.unitid + ' level = "unit" data-log="{target:'+"'linkunit_lbl'"+'}" >' + content + '</a>';
							//如果有电话追踪号码 添加小小电话图标
							if (item.extbind != '-') {
								html[html.length] = '<span class = "lsphone-icon-green" title="该单元已启用电话追踪"></span>';
							}
							html[html.length] = '	<a class="edit_btn" edittype="unitname"></a>';
                            html[html.length] = '</div>';
							return html.join("");
						},
						locked: true,
						sortable : true,
						filterable : true,
						field : 'unitname',
						title: '推广单元',
						width: 100
					},
					planname:{
						content: function(item){
							var title = baidu.encodeHTML(item.planname), content = getCutString(item.planname, 30, "..");
						
							return '<a title="' + title + '" " href="javascript:void(0);"  planid=' + item.planid + ' level = "plan" data-log="{target:'+"'linkplan_lbl'"+'}" > ' + content + '</a>';
						},
						title: '推广计划',
						sortable : true,
						filterable : true,
						field : 'planname',
						width: 100
					},
					unitstat:{
						content: function(item){
							var stat = nirvana.util.buildStat('unit', item.unitstat, item.pausestat, {
								unitid: item.unitid
							});
							nirvana.manage.UPDATE_ID_ARR.push(item.unitid);
							return '<span class="unit_update_state" id="unitstat_update_' + item.unitid + '">' + stat + '</span>'
						},
						title: '状态',
						sortable : true,
						filterable : true,
						field : 'unitstat',
						width : 100,
						minWidth: 125,
						noun : true,
						nounName : '推广单元状态'
					},
					unitbid:{
						content:function(item){
							var html = [], unitbid = fixed(item.unitbid);
							html[html.length] = '<div class="edit_td"  planid=' + item.planid + ' unitid=' + item.unitid + ' control = ' + unitbid + '>';
							html[html.length] = '<span>' + unitbid + '</span>';
							html[html.length] = '<a class="edit_btn edit_btn_left" edittype="unitbid"></a>';
                            html[html.length] = '</div>';
							return html.join("");
						},
						field : 'unitbid',
						title: '出价',
						sortable : true,
						filterable : true,
						align:'right',
						width: 50,
						minWidth: 95,
						noun : true,
						nounName : '推广单元出价'
					},
					shows: {
						content: function(item){
							var data = item.shows;
							if (nirvana.manage.hasToday(me)) { // 包含今天数据
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
						field : 'shows',
						title: '展现',
						sortable : true,
						filterable : true,
						align:'right',
						width: 50
					}, 
					clks: {
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
						field : 'clks',
						title: '点击',
						sortable : true,
						filterable : true,
						align:'right',
						width: 50
					}, 
					paysum: {
						content: function (item) {
							if (item.paysum == ''){//SB doris
								return fixed(STATISTICS_NODATA);
							}
						    return fixed(item.paysum);
						},
						title: '消费',
						sortable : true,
						filterable : true,
						field : 'paysum',
						align:'right',
						width: 50
					},
					trans: {
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
						sortable : true,
						filterable : true,
						field : 'trans',
						align:'right',
						width: 50,
						minWidth: 128,
						noun : true,
						nounName: "转化(网页)"
					},
					phonetrans: {
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
						sortable : true,
						filterable : true,
						field : 'phonetrans',
						align:'right',
						width: 50,
						minWidth: 128,
						noun : true,
						nounName: "转化(电话)"
					},
					avgprice: {
						content: function (item) {
							if (item.avgprice == ''){//SB doris
								return fixed(STATISTICS_NODATA);
							}
						    return fixed(item.avgprice);
						},
						title: '平均点击价格',
						field : 'avgprice',
						sortable : true,
						filterable : true,
						align:'right',
						width:115,
						minWidth: 140,
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
						minWidth: 140,
						noun : true
					},
					extbind : {
						content: function (item) {
							if(item.extbind == '-')
								return '无';
							return item.extbind;
						},
						title: '分机号码',
						align: 'right',
						sortable : true,
						filterable : true,
						field : 'extbind',
						width: 115,
						minWidth: 140,
						noun : true
					},
					allnegativecnt:{
						content: function (item) {
						    var len = item.allnegativecnt;
                            var html = [];
							html[html.length] = '<div class="edit_td" unitid=' + item.unitid + '>';
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
						width: 100,
						minWidth: 145,
						noun : true
					}
				};

				nirvana.fuseSuggestion.controller.init('unit', 
					{
						starttime: me.getContext('startDate'),
                    	endtime: me.getContext('endDate')
					}, 
					function() {
						nirvana.manage.UserDefine.getUserDefineList('unit', function(){
							var ud = nirvana.manage.UserDefine,
								localList = ud.attrList['unit'], 
								data = [], i, len;
							for (i = 0, len = localList.length; i < len; i++){
								data.push(nirvana.manage.unitTableField[localList[i]]);
							}
							me.setContext('tableFields', data);
							callback();
						});
					}
				);
			} else{
				callback();
			}
		},

		
		unitData : function(callback){
			var me = this;
			if (!me.arg.refresh) {
				//me.setTab();
				me.setContext('unitListData', []);
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
        }
	},
	
	onafterrender : function(){
		var me = this,
            controlMap = me._controlMap;
		//全投搬家历史记录下载
		nirvana.manage.allDeviceHisDownLoad();


		//表格loading
		controlMap.unitTableList.getBody().innerHTML = ''
			+ '<div class="loading_area">'
			+ '    <img src="asset/img/loading.gif" alt="loading" /> 读取中'
			+ '</div>';

		//给表格注册:排序事件
		controlMap.unitTableList.onsort = function(sortField,order){
			me.setContext("orderBy",sortField.field);
			me.setContext("orderMethod",order);
			me.refresh();
		}
		//给表格注册:筛选事件
		controlMap.unitTableList.onfilter = nirvana.manage.FilterControl.getTableOnfilterHandler(me,'unitTableList');
		//给表格注册:选择事件
        controlMap.unitTableList.onselect = me.selectListHandler();
		//给表格注册:行内编辑处理器
		controlMap.unitTableList.main.onclick = me.inlineEdit();
		
        //启用暂停删除
        controlMap.runPause.onselect = me.operationHandler();
        controlMap.moreOpt.onselect = me.operationHandler();
		
		controlMap.runCancel.onselect = me.getLXBStatus();
		
		 
	    //注册工具箱导入方法
		ToolsModule.setImportDataMethod(function(){
			var selectedList = me.selectedList,
	            data = me.getContext('unitListData'),
	            res = {
					level : 'unit',
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
        baidu.g('searchComboTipContent').onclick = nirvana.manage.SearchTipControl.getSearchTipHandler(me,'unitTableList');
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
		
		//pageSizeSelect
		controlMap.pageSizeSelect.onselect = function(value){
			ui.util.get('unitTableList').resetYpos = true;
			me.setContext('pageSize', +value);
			me.setContext('pageNo', 1);
			me.refresh();
		};
		
		//pagination
		controlMap.pagination.onselect = function(value){
			ui.util.get('unitTableList').resetYpos = true;
			me.setContext('pageNo', +value);
			me.refresh();
		};
		
		//tab
		controlMap.tab.onselect = nirvana.manage.tab.getTabHandler(me,controlMap.tab,'单元');
				
		//自定义列
		controlMap.userDefine.onclick = nirvana.manage.UserDefine.getUserDefineHandler(me, 'unit', 'unitTableList');

		//附加tab
		EXTERNAL_LINK.tabInit("ExtraTab");
		
		//推广时段
		nirvana.manage.initSchedule(me);
		
		//修改出价
		controlMap.modBid.disable(true);
		controlMap.modBid.onclick = me.modBidHandler();
		
		//批量下载 初始化 liuyutong@baidu.com
		nirvana.manage.batchDownload.initCheck();
		
	},
	
	onreload : function(){ 
		this.refresh();
	},
	
	
	
	onentercomplete : function(){
		var me = this,
			controlMap = me._controlMap;


		//获取面包屑信息
		//me.getCrumbsInfo();
		//获取单元列表数据
		var crumbs=new nirvana.manage.crumbs(me);
		// wangkemiao 2012.12.06
		// 因为需要context中的planid等信息，所以在callback中执行
		crumbs.getCrumbsInfo(function(){
			me.getUnitData();
			// wanghuijun 2012.11.30
			// 模块化实践，ao按需加载
			$LAB.script(nirvana.loader('proposal'))
				.wait(function() {
					me.changeAoParams();
					nirvana.aoControl.init(me);
				});
			// wanghuijun 2012.11.30
		});
	
		
		//优化 by linzhifeng@baidu.com 2011-08-29
		nirvana.manage.setModDialog(me);

		nirvana.manage.UserDefine.dialog.hide();
		
		//me.initSearchComboTip();
		nirvana.manage.SearchTipControl.initSearchComboTip(me);
		//恢复账户树状态
        nirvana.manage.restoreAccountTree(me);
		
		//批量下载 by liuyutong@baidu.com
		if(me.getContext("navLevel") == "account"){
			baidu.g('batchDownload_acct').appendChild(nirvana.manage.batchDownload.batchEL);
		}
		
		nirvana.aoPkgControl.popupCtrl.init();

		// 自动展现的周预算新功能提示
		nirvana.manage.switchBudgetBubble(me);
		
	},
	
	onafterinitcontext : function(){
		nirvana.CURRENT_MANAGE_ACTION_NAME = 'unit';
	},
	
	onleave : function(){
		nirvana.CURRENT_MANAGE_ACTION_NAME = '';
		//隐藏搬家历史浮层
		baidu.addClass(baidu.g('downLoadDeviceChange'), 'hide');
	},
	
	
		
		
	//获取单元列表数据
	getUnitData: function(){
		var me = this, 
		param = {
			starttime: me.getContext('startDate'),
			endtime: me.getContext('endDate'),
			limit: nirvana.limit,
			onSuccess: me.getUnitDataHandler(),
			onFail: function(){
				ajaxFailDialog();
			}
		};

		if (me.getContext("planid")) {
			param.condition = {
				planid: [me.getContext("planid")]
			};
		}
		
		nirvana.manage.UserDefine.getUserDefineList('unit', function(){
			var ud = nirvana.manage.UserDefine, localList = [], i, len, data = [];
			for (i = 0, len = ud.attrList['unit'].length; i < len; i++) {
				localList[i] = ud.attrList['unit'][i];
				data.push(nirvana.manage.unitTableField[localList[i]]);
			}
			me.currentFileds = data;
			localList.push('unitid', 'planid', 'pausestat', 'extbind');
	
			//汇总数据需要， zhouyu
			var extraCols = ['shows', 'clks', 'paysum', 'trans', 'unitstat'], extraItem;
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
            		.load(param);
            }
            else {
				fbs.material.getAttribute('unitinfo', localList, param);
			}
		});
	},
	newTableModel: new nirvana.newManage.TableModel({
		level: 'unit'
	}),
	
	//获取单元数据成功回调函数
	getUnitDataHandler: function(){
		var me = this;
		return function(data){
			nirvana.manage.UPDATE_ID_ARR = [];
			var status = data.status, listdata = [], exceed = false;
			nirvana.manage.NOW_TYPE = 'unit';
			nirvana.manage.NOW_DATA = data;
			if (status == 800) { // 数据量过大
				exceed = true;
			}
			else {
				listdata = data.data.listData;
			}
			//如果忽略状态，表格也得清状态    by linfeng 2011-07-05
			nirvana.manage.resetTableStatus(me, "unitTableList");
			
			var field = me.getContext("orderBy"), order = me.getContext("orderMethod"), result;
			//根据状态和Query筛选数据
			result = nirvana.manage.FilterControl.filterData(me, 'unitstat', listdata);
			//表格筛选
			result = nirvana.manage.FilterControl.tableFilterData(me, result);
			
			//根据context值进行排序
			result = nirvana.manage.orderData(result, field, order);
	
		    //设置tab标签里面的数据 yanlingling
		    nirvana.manage.tab.renderTabCount(me,result.length);
		    
			me.setNoDataHtml(exceed);
			me.processData(result);
			nirvana.manage.noDataHtmlClick(me);

			// 融合更新状态+事件绑定，需要注意不要重复绑定事件
			if(me._controlMap.unitTableList) {
				nirvana.fuseSuggestion.controller.update(me._controlMap.unitTableList.main);
			}
		}
	},
			
	
	
	//nodata context 设置
	setNoDataHtml: function(exceed){
		var me = this, 
			status = me.getContext('status'), 
			query = me.getContext('query'), 
			filterCol = me.getContext('filterCol');
		if (exceed) {
			me.setContext("noDataHtml", FILL_HTML.EXCEED);
			return;
		}
		if ((!status || status == '100') && (!query || query == '')) {
			me.setContext("noDataHtml", FILL_HTML.UNIT_NO_DATA);
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
	
	modBidHandler: function(){
		var me = this;
		return function(){
			nirvana.util.openSubActionDialog({
				id: 'modifyUnitBidDialog',
				title: '单元出价',
				width: 440,
				actionPath: 'manage/modUnitPrice',
				params: {
					unitid: me.getSelected('unitid'),
					unitbid: me.getSelected('unitbid'),
					planids : me.getSelected('planid'),
					showmPriceFactor: true
					
				},
				onclose: function(){
				}
			});
		}
	},
	
    getLXBStatus: function(){
		var me = this;
		return function(selected){
			switch (selected) {
				case "run":
					fbs.trans.getLxbStatus({
						onSuccess: me.LXBStatusSuccessHandler(),
						onFail: me.LXBStatusFailHandler
					})
					break;
				case "cancel":
					me.cancelTrailHandler();
					break;
			}
			
		}
	},
	
	LXBStatusSuccessHandler : function(){
		var me = this;
		return function(data){
			if (data.data == 1) {
				me.runPhoneTrail()();
			}
			else {
				nirvana.util.openSubActionDialog({
					id:'LXBstatusDialog',
					title:'启用电话追踪',
					width: 480,
					actionPath: 'manage/LXBstat'+data.data,
					onclose: function(){
					}
				})
				baidu.setStyle(baidu.g('ctrldialogLXBstatusDialog'),'padding-bottom','10px');
				if(data.data == 1000){
					baidu.setStyle(baidu.g('ctrldialogLXBstatusDialog'),'padding-bottom','55px');
				}
			}
		}
	},
	
	LXBStatusFailHandler : function(){
		ajaxFailDialog();  
	},
	
	runPhoneTrail : function(){
		var me = this;
		return function(){
			var selectedList = me.selectedList,
            	data = me.getContext('unitListData'),
				unitList = [],
				len = selectedList.length,
				num = 0;
			
			for(var i = 0; i < len ; i++){
				unitList[unitList.length] = {
					unitid : data[selectedList[i]]['unitid'],
					unitname : data[selectedList[i]]['unitname'],
					extbind : data[selectedList[i]]['extbind']
				}
				if(!data[selectedList[i]]['extbind'] || data[selectedList[i]]['extbind'] == '-'){
					num++;
				}
			}
			if(num == 0){
				ui.Dialog.alert({
	                title : '启用电话追踪',
	                content : '所选单元都已启用电话追踪',
	                onok : function(){
						
					}
	            });
				return;
			}
			nirvana.util.openSubActionDialog({
				id: 'runPhoneTrailDialog',
				title: '启用电话追踪',
				width: 440,
				actionPath: 'manage/runPhoneTrail',
				params: {
					unitList : unitList
				},
				onclose: function(){
				}
			});
			//。。。TODO
			clearTimeout(nirvana.subaction.resizeTimer);
			baidu.g('ctrldialogrunPhoneTrailDialog').style.top = baidu.page.getScrollTop() + 135 +'px';
		}
	},
	//取消电话追踪
	cancelTrailHandler : function(){
		var me = this;
	//	return function(){
			var selectedList = me.selectedList,
            	data = me.getContext('unitListData'),
				unitList = [],
				len = selectedList.length;
			
			for(var i = 0; i < len ; i++){
				if(data[selectedList[i]]['extbind'] && data[selectedList[i]]['extbind'] != '-'){
					unitList[unitList.length] = data[selectedList[i]]['unitid'];		
				}
			}
	
			nirvana.util.openSubActionDialog({
				id: 'cancelPhoneTrailDialog',
				title: '取消电话追踪',
				width: 500,
				actionPath: 'manage/cancelPhoneTrail',
				params: {
					unitList : unitList
				},
				onclose: function(){
				}
			});
	//	}
	},

	nowStat : {
		id : null,
		level : null,
		stat : null
	},
	
	
	
	/**
	 * 处理计划数据并汇总展现数据
	 * @author tongyao@baidu.com
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
		//rs = rs.splice(start, pageSize);
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
		me.setContext('unitListData', rs); 	//table用数据
		
		//统计展现、点击等汇总数据
		var item,
		    clks = 0,
			shows = 0,
			paysum = 0,
			transSum = 0;
		
		for (var i = 0, l = len; i < l; i++){
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
        me.setContext('totalClksTitle', clks);
		
		if (nirvana.manage.hasToday(me)) {
			me.setContext('totalShows', '-');
			me.setContext('totalShowsTitle', '-');
			me.setContext('clickRate', '-');
		} else {
			me.setContext('totalShows', nirvana.manage.abbNumber(shows,1));
			me.setContext('totalShowsTitle', shows);
			me.setContext('clickRate', clickRate + '%');
		}
		
        me.setContext('totalPaysum', '&yen;' + nirvana.manage.abbNumber(paysum));
        me.setContext('paysumTitle', '¥' + fixed(paysum));
		me.setContext('transRate', transSum);
        me.setContext('avgprice', '&yen;' + avgprice);
		me.repaint();
		
		if (me.arg.refresh) {
			//即时更新 by liuyutong@baidu.com
			var updateParam = {};
			updateParam.starttime = me.getContext('startDate');
			updateParam.endtime = me.getContext('endDate');
			updateParam.limit = nirvana.limit;
			
			if (me.getContext("planid")) {
				updateParam.condition = {
					planid: [me.getContext("planid")]
				};
			}
			
			fbs.material.getAttribute('unitinfo', ['unitstat:update'], updateParam);
		}
	},
	
	/**
	 * 构造账户优化请求参数
	 */
	changeAoParams : function() {
		var me = this,
			aoControl = nirvana.aoControl;
		
		if (me.getContext('isSearch')) { // 搜索状态
			aoControl.changeParams({
				level: 'unitinfo',
				command: 'start',
				signature: '',
				condition: me.getAoCondition()
			});
		} else { // 清除搜索
			if (me.getContext('planid')) { // 计划层级
				aoControl.changeParams({
					level: 'planinfo',
					command: 'start',
					signature: '',
					condition: {
						planid: [me.getContext('planid')]
					}
				});
			} else { // 账户层级
				aoControl.changeParams({
					level: 'useracct',
					command: 'start',
					signature: '',
					condition: {}
				});
			}
		}
	},
	
	//获取所有单元id及其对应计划id
	getAoCondition: function(){
		var me = this,
			listData = me.getContext("unitListData"),
			condition = {},
			planids = [],
			unitids = [];
		 for(var i = 0, len = listData.length; i < len; i++){
            planids[planids.length] = listData[i].planid;
			unitids[unitids.length] = listData[i].unitid;
         }
		 condition.planid = planids;
		 condition.unitid = unitids;
		 return condition;
	},

    selectListHandler : function (selected) {
        var me = this,
            controlMap = me._controlMap,
			modBid = controlMap.modBid,
            runPause = controlMap.runPause,
            moreOpt = controlMap.moreOpt,
			runCancel = controlMap.runCancel;
        return function (selected) {
            var enabled = selected.length > 0;
            me.selectedList = selected;
            
			modBid.disable(!enabled);
			//设置 启用、暂停按钮的状态
			runPause.disable(!enabled);//调整启用暂停下拉框 的disabled状态
			//启用、取消电话追踪
			runCancel.disable(!enabled);
            if(enabled) {
                me.setRunPauseOptionsState(selected);
                me.setPhoneTrailOptionsState(selected);
            }
            moreOpt.disable(!enabled);

            // 读写分离，待升级之后不用这种方式了
            // by Leo Wang
			nirvana.acc.accService.processEntrances('manage/unit');
        }  
        
    },
    /**
     * 设置启用暂停按钮下拉框的状态
     */
    setRunPauseOptionsState : function (selectedList) {
        var me = this,
            i = 0, len = selectedList.length,
            data = me.getContext('unitListData'),
            disablePauseState = true, disableStartState = true,
            runPauseControl = me._controlMap.runPause;
        
        for (; i < len; i++) {
            if (!disableStartState && !disablePauseState) {
                break;
            }
            if (data[selectedList[i]].pausestat == '0'){//启用状态
                disablePauseState = false;//可以设置暂停
                continue;
            }
            if (data[selectedList[i]].pausestat == '1'){//暂停状态
                disableStartState = false;//可以设置启用
                continue;
            }
        }
        
        runPauseControl.disableItemByValue('start',disableStartState);
        runPauseControl.disableItemByValue('pause',disablePauseState);
    },
	/**
     * 设置电话启用暂停按钮下拉框的状态
     */
    setPhoneTrailOptionsState : function (selectedList) {
        var me = this, extbind,
            i = 0, len = selectedList.length,
            data = me.getContext('unitListData'),
            disablePauseState = true, disableStartState = true,
            runPauseControl = me._controlMap.runCancel;
        
       	for (; i < len; i++) {
            if (!disableStartState && !disablePauseState) {
                break;
            }
			extbind = data[selectedList[i]]['extbind'];
            if(extbind && extbind != "-"){
                disablePauseState = false;//可以设置取消
                continue;
            }
            if(extbind && extbind == "-"){
                disableStartState = false;//可以设置启用
                continue;
            }
        }
        
        runPauseControl.disableItemByValue('run',disableStartState);
        runPauseControl.disableItemByValue('cancel',disablePauseState);
    },
	
    operationHandler : function () {
        var me = this,
            controlMap = me._controlMap;

        return function (selected) {
            var title = '', msg = '', len = me.selectedList.length;
            
            switch (selected) {
                case 'start' :
                    title = '启用推广单元';
                    msg = '您确定启用所选的推广单元吗？';
                    break;
                case 'pause' :
                    title = '暂停推广单元';
                    msg = '您确定暂停所选的推广单元吗？';
                    break;
                case 'delete' :
                    title = '删除推广单元'; 
                    msg = '您确定要删除所选的' + len +'个推广单元吗？确定将同时删除这些推广单元下所有关键词、创意和附加创意。删除操作不可恢复。';
					break;
            }
            
            ui.Dialog.confirm({
                title : title,
                content : msg,
                onok : me.doOperationHandler(),
                optype: selected
                
            });

        }
    },
    
    doOperationHandler : function () {
        var me = this,
            controlMap = me._controlMap;
        return function (dialog) {
            var func,//需要调用的接口函数
                pauseStat, //0启用,1暂停
                unitid = me.getSelected('unitid'),
				needRefreshSideNav = false;           
                     
            switch (dialog.args.optype) {
				case 'start':
					func = fbs.unit.modPausestat;
					pauseStat = 0;
					break;
				case 'pause':
					func = fbs.unit.modPausestat;
					pauseStat = 1;
					break;
				case 'delete':
					func = fbs.unit.del;
					needRefreshSideNav = true;
					break;
			}
			
           	var param = {unitid: unitid, 
                      onSuccess: me.operationSuccessHandler(unitid, needRefreshSideNav), 
                      onFail: me.operationFailHandler()}; 

            if (typeof pauseStat != 'undefined') {
                param.pausestat = pauseStat;
            }
            func(param);
        }
    },

    operationSuccessHandler : function (unitids, needRefreshSideNav) {
        var me = this;
        return function (response) {
			if (needRefreshSideNav) {//删除操作
				fbs.material.clearCache('unitinfo');
				fbs.material.clearCache('planinfo');//计划下面的单元个数变了，要清空一下
				//创意、关键词、文件夹详情、排行榜
				fbs.material.ModCache('wordinfo', 'unitid', unitids, 'delete');
				fbs.material.ModCache('ideainfo', 'unitid', unitids, 'delete');
				fbs.avatar.getMoniFolders.clearCache();
				fbs.avatar.getMoniWords.ModCache('unitid', unitids, 'delete');
				fbs.material.getTopData.clearCache();
				//只有删除走这个分支，更新整树
				ui.util.get('SideNav').refreshPlanList();
				
				//附加创意缓存清除
                fbs.appendIdea.getAppendIdeaList.ModCache('unitid', unitids, 'delete');
			}
			else {
				var modifyData = response.data;
				fbs.material.ModCache('unitinfo', "unitid", modifyData);
				//是否会影响关键词的状态呢？？TODO
				fbs.material.clearCache('wordinfo');
				fbs.material.clearCache('ideainfo');
			//	fbs.unit.getInfo.clearCache();
			    //bug fix 修改状态也要刷新账户树
                for (var uid in modifyData){
                    ui.util.get('SideNav').refreshNodeInfo('unit',[uid]);
                }
                 //附加创意缓存清除
                fbs.appendIdea.getAppendIdeaList.clearCache();
			}
            me.refresh();
        };
    },

    operationFailHandler : function () {
        var me = this;
        return function (data) {
            ajaxFailDialog();            
        }
    },

    getSelected : function (type) {//修改为可以获取任何数据的方法 by liuyutong 2011-8-12
        var me = this,
            selectedList = me.selectedList,
            data = me.getContext('unitListData'),
            i, len, ids = [];

        for(i = 0, len = selectedList.length; i < len; i++){
            ids.push(data[selectedList[i]][type]);
        }

        return ids;
    },
	
	
	/**
	 * 行内编辑功能
	 */
	inlineEdit : function(){
		var me = this;
		return function(){
			var event = window.event || arguments[0],
				target = event.target || event.srcElement,
				type,parent,
				logParams = {};
			if(target.getAttribute('level')){// by liuyutong@baidu.com 
				var level = target.getAttribute('level');
				//er.locator.redirect('/manage/unit~ignoreState=1&navLevel=plan&planid=3'  );
					
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
				while(target && target != ui.util.get("unitTableList").main){
					if(baidu.dom.hasClass(target,"edit_btn")){
						var current = nirvana.inline.currentLayer;
						if (current && current.parentNode) {
							current.parentNode.removeChild(current);
						}
						type = target.getAttribute("edittype");
						switch(type){
							case "unitname":
								me.inlineUnitName(target);
								logParams.target = "editInlineUnitName_btn";
								break;
							case "unitbid":
								me.inlineUnitBid(target);
								logParams.target = "editInlineUnitBid_btn";
								break;
							case "negative":
								me.inlineNegative(target);
								logParams.target = "editInlineNegative_btn";
								break;
						}
						break;
					}
					if(target.className && target.className == 'status_op_btn'){
						me.doInlinePause(target)
						break;
					}
					
					//小灯泡 by Tongyao
					if(baidu.dom.hasClass(target, 'status_icon')){
						logParams.target = "statusIcon_btn";
						manage.offlineReason.openSubAction({
							type : 'unitinfo',
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
		}
	},
	
	/**
	 * 行内修改单元名称
	 * @param {Object} target 事件目标
	 */
	inlineUnitName: function(target){
		var me = this,
			parent = target.parentNode;
		var unitid = parent.getAttribute("unitid"), 
			unitname = parent.getAttribute("control");
		nirvana.inline.createInlineLayer({
			type: "text",
			value: unitname,
			id: "unitname" + unitid,
			target: parent,
			okHandler: function(name){
				var modifyData = {};
				modifyData[unitid] = {
					"unitname": name
				};
				return {
					func: fbs.unit.modUnitname,
					param: {
						unitid: [unitid],
						unitname: name,
						onSuccess: function(data){
							if (data.status != 300) {
								fbs.material.ModCache("unitinfo", "unitid", modifyData);
								fbs.material.ModCache("ideainfo", "unitid", modifyData);
								fbs.material.ModCache("wordinfo", "unitid", modifyData);
								fbs.avatar.getMoniWords.ModCache("unitid", modifyData);
								fbs.appendIdea.getAppendIdeaList.ModCache("unitid", modifyData);
                                er.controller.fireMain('reload', {});
								//ui.util.get('SideNav').refreshPlanList();
								ui.util.get('SideNav').refreshNodeInfo('unit',[unitid]);
							}
						}
					}
				}
			}
		});
	},
	
	
	/**
	 * 行内修改出价
	 * @param {Object} target 事件目标
	 */
	inlineUnitBid: function(target){
		var me = this;
		var	parent = target.parentNode;
		var unitid = parent.getAttribute("unitid"), 
			unitbid = parent.getAttribute("control"); 
		var nav = me.getContext('navLevel');
		var planid = parent.getAttribute("planid");;
		var devicePrefer = me.getContext(nav+'_deviceprefer');
	    //var mPriceFactor =   me.getContext(nav+'_mPriceFactor');
	    var mPriceFactor =   me.getContext(nav+'_mPriceFactor');
	    var param = {
			type: "text",
			value: unitbid,
			id: "unitbid" + unitid,
			target: parent,
			action: 'modUnitBid',
			showmPriceFactor : true,
			planid: planid,
			okHandler: function(bid){
				var modifyData = {};
				modifyData[unitid] = {
					"unitbid": bid
				};
				return {
					func: fbs.unit.modUnitbid,
					param: {
						unitid: [unitid],
						unitbid: bid,
						onSuccess: function(data){
							fbs.material.ModCache("unitinfo","unitid",modifyData);
							fbs.material.ModCache("wordinfo","unitid",modifyData);
							fbs.avatar.getMoniWords.ModCache("unitid",modifyData);
							er.controller.fireMain('reload', {});
							//ui.util.get('SideNav').refreshPlanList();
							ui.util.get('SideNav').refreshNodeInfo('unit',[unitid]);
						}
					}
				}
			}
		};
		if(devicePrefer == '0' || devicePrefer == 'all'){
			param.mPriceFactor = mPriceFactor;//全部设备的时候，直接把出价比传给行内出价模块
		}
		else if(devicePrefer == '2' || devicePrefer == 'mobile'){
			param.showmPriceFactor = false; //移动设备不显示出价比
		}
	    nirvana.inline.createInlineLayer(param);
	    
		
	},
	
	/**
	 * 行内修改否定关键词
	 * @param {Object} target 事件目标
	 */
	inlineNegative: function(target){
		var parent = target.parentNode;
		var unitid = parent.getAttribute("unitid");
		nirvana.manage.modUnitNeg([unitid]);
	},
	
	/**
     * 根据行内元素,获取一行的ID数组
     */
    getRowIdArr : function (target) {
        var me = this,
            data = me.getContext('unitListData'),
            idArr = [], index;
        index = nirvana.manage.getRowIndex(target);
        idArr.push(data[index].unitid);
        return idArr;
    },

	
    /**
     * 执行行内启用暂停操作
     */
    doInlinePause : function (target) {
        var me = this,
            idArr, pauseSta,
            func = fbs.unit.modPausestat,
			logParams = {
				target: "inlineRunPause_btn"
			};
        idArr = me.getRowIdArr(target);
        var pauseStat = nirvana.manage.getPauseStat(target,[0,1]);
		logParams.pauseStat = pauseStat;
		NIRVANA_LOG.send(logParams);
        nirvana.manage.inserLoadingIcon(target);
        func({
            unitid: idArr,
            pausestat : pauseStat,
            onSuccess: function(response){
				var modifyData = response.data;
				fbs.material.ModCache("unitinfo", "unitid", modifyData);
				//单元的状态改变会影响关键词、创意状态的改变
				fbs.material.clearCache('wordinfo');
				fbs.material.clearCache('ideainfo');
			//	fbs.unit.getInfo.clearCache();
				er.controller.fireMain('reload', {});
				//ui.util.get('SideNav').refreshPlanList();
				ui.util.get('SideNav').refreshNodeInfo('unit',idArr);
			},
            onFail: function(){
				ajaxFailDialog();
			}
        });
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
            //设置组合筛选的context
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
    }
}); 
