/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: report/myReport.js 
 * desc: 我的报告
 * author: wanghuijun@baidu.com
 * date: $Date: 2011/2/16 $
 */
ToolsModule.myReport = new ToolsModule.Action('report', {
	/**
	 * 视图模板名，或返回视图模板名的函数
	 */
	VIEW : 'myReport',
	
	/**
	 * ToolsModule里写statemap没有实际意义，只是当注释用了，标明那些是用于保持的context
	 */
	STATE_MAP : {
		pageNum : 1,
		myReportXijing : ''
	},

	/**
	 * 在模板中写一长串的控件属性会难以理解。该属性能以“控件id/属性集合”的形式在外部书写控件属性，使格式更清晰。
	 */
	UI_PROP_MAP : {
		// 显示类型tab
		/*ShowTypeTab : {
			'title' : '*typeTab',
			'className' : 'tab_showtype'
		},*/
		
		// 报告列表table
		ReportlistTable : {
			'skin' : 'reportlist',
			'noDataHtml' : FILL_HTML.NO_DATA,
			'bodyHeight' : '270',
			'sortable' : 'true'
		},
		
		// 显示报告的列表
		reportTable : {
			sortable : 'true',
			noDataHtml : FILL_HTML.NO_DATA,
			fields: '*reportTableFields',		
			datasource : '*reportTableData',
			dragable : 'true'
		},
		
		/********定制报告显示***********/
		reportCalendar : {
			type  : 'Label',
			datasource : ''
		},
		reportName : {
			datasource	:	'*reportName'
		},
		// 分页
		reportPagination : {
			type : 'Page',
			total : '*reportTotalPage'
		}
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
	 * 初始化context的函数集合，name/value型Object。其value为Function的map，value
	 * Function被调用时this指针为Action本身。value
	 * Function的形参需要有一个callback参数，参数为Function类型，手工回调。
	 */
	CONTEXT_INITER_MAP : {
		getReportData : function(callback){
			var me = this;
			if (!me.arg.refresh) { //第一次不执行
				me.setContext('reportTableFields', []);
				me.setContext('reportTableData', []);
				callback();
				return;	
			}
			me.getReportData(callback);
		},
		
		reportType : function(callback){
			this.setContext('isInstantReport', false);
			callback();
		}
	},

	/**
	 * refresh后执行
	 */
	onafterrepaint : function() {
		var me = this;
		//隐藏参数部分
		me._toggleParamsContainer(false);
		
	},

	/**
	 * 第一次render后执行后最后会触发事件
	 */
	onafterrender : function() {
		var me = this,
		    controlMap = me._controlMap;
		
		//外部链接：蹊径和高级样式
		EXTERNAL_LINK.reportInit("MyReportExtLink");
		
		//设置提示话术
	//	 if(nirvana.report.chargeModel == 1){
	//		baidu.g('phonetransTip').innerHTML = LXB.PHONETRANSTIP['0'];
	//	}else{
			baidu.g('phonetransTip').innerHTML = LXB.PHONETRANSTIP['1'];
	//	};
		// 报告列表渲染
		me.reportList();
//		console.log("onafterrender");
		
		// 切换显示类型
		//controlMap.ShowTypeTab.onselect = me.listRefresh();
		
        // 给表格注册行内编辑处理器
        controlMap.ReportlistTable.main.onclick = me.listHandler();
	
		//收起展开选项
		baidu.on('ToggleParam', 'click', function(e) {
			me._toggleParamsContainer();
			baidu.event.preventDefault(e);
		});
		
		// 跳转到我的报告action
		baidu.g('ToNewReport').onclick = function() {
			me.redirect('/tools/report', {});
		};
		
		//分页
		controlMap['reportPagination'].onselect = function(pageNum){
			me.setContext('pageNum', pageNum);
			me.refresh();
		};
		
		//图表Toggle按钮
		baidu.on('ToggleReportChart', 'click', function(e) {
			nirvana.displayReport._toggleChartContainer();
			
			baidu.event.preventDefault(e);
		});
		
		//给表格注册排序 add by liuyutong
		controlMap.ReportlistTable.onsort = function(sortField,order){
			//console.log(controlMap.ReportlistTable,sortField,order)
			var result = me.getContext('listData');
			result = nirvana.manage.orderData(result,sortField.field,order);
			me.setContext('listData',result);
			controlMap.ReportlistTable.datasource = result;
			controlMap.ReportlistTable.render(controlMap.ReportlistTable.main);
			//me.refresh();
		}
	},

	/**
	 * 完成视图更新后最后会触发事件
	 */
	onentercomplete : function() {
		var me = this;
	//	console.log("onentercomplete");
		if(baidu.browser.ie){
			baidu.g('ReportTableWrap').style.zoom = 0;
			baidu.g('ReportTableWrap').style.zoom = 1;
		}
	},
	
	/**
	 * 生成报告列表
	 */
	reportList : function() {
		var me = this;
		
		// fbs里已经配置了不缓存，这里不需要单独清除
		fbs.report.getReportInfos({
			onSuccess : me.reportListSuccess(),
			onFail : me.reportListFail()
		});
	},
	
	/**
	 * 列表内容更新
	 */
	listRefresh : function() {
		var me = this;
		
		return function(tab) {
			var table = me._controlMap.ReportlistTable,
				listData = me.getContext('listData'),
				type;
			
			if (typeof(tab) == 'undefined') {
				var tab = 0;
			}
			
			/*switch (tab) {
				case 0:
					type = 'all';
					break;
				case 1:
					type = 'order';
					break;
				case 2:
					type = 'loop';
					break;
			}
			
			table.datasource = listData[type];*/
			table.datasource = listData;
			table.render(table.main);
		};
	},
	
	/**
	 * 处理列表数据
	 * @param {Object} data 列表原始数据
	 */
	/*initListData : function(data) {
		var me = this,
			len = data.length,
			i,
			tmp,
			loopData = [], // 循环报告数据
			orderData = []; // 预约报告数据
		
		for (i = 0; i < len; i++) {
			tmp = data[i];
			
			switch (tmp.reporttag) {
				// 1 循环报告
				case 1 :
				    loopData.push(tmp);
					break;
				// 2 预约报告
				case 2 :
				    orderData.push(tmp);
				    break;
			}
		}
		
		// 设置保持数据
		me.setContext('listData' , {
			all : data,
			loop : loopData,
			order : orderData
		});
	},*/
	
	/**
	 * 生成列表成功
	 */
	reportListSuccess : function() {
		var me = this;
		
		return function(response){
			var table = me._controlMap.ReportlistTable,
			    data = response.data,
				fields = [{
					content: me.listRender.reportname,
					title: '名称',
					width: 220,
					sortable:true,
					field: 'reportname'
				}, {
					content: me.listRender.reportlevel,
					title: '报告权限',
					width: 80,
					sortable:true,
					field: 'reportlevel'
				},{
					content: 'timerange',
					title: '时间范围',
					width: 175,
					sortable:true,
					field: 'timerange'
				},{
					content: 'createtime',
					title: '最近修改时间',
					width: 175,
					sortable:true,
					field: 'createtime'
				},{
					content: me.listRender.reporttag,
					title: '类型',
					align: 'center',
					stable: true,
					width: 80,
					sortable:true,
					field: 'reporttag'
				}, {
					content: me.listRender.handle,
					title: '操作',
					align: 'center',
					stable: true,
					width: 160
				}];
			
			table.fields = fields;
			//me.initListData(data);
			me.setContext('listData' , data);
			// 列表刷新
			(me.listRefresh())();
		};
	},
	
	/**
	 * 生成列表失败
	 */
	reportListFail : function() {
		var me = this;
		
		return function(response) {
			ajaxFailDialog();
		};
	},
	
	/**
     * 列表行内操作事件代理器
     */
	listHandler : function() {
		var me = this;
		
        return function(event) {
            var event = event || window.event,
				target = baidu.event.getTarget(event),
				type;
			
			if (baidu.dom.hasClass(target, 'edit_btn')) {
				type = target.getAttribute('edittype');
				
				switch (type) {
					// 修改报告名称
					case 'reportname':
						me.inlineReportName(target);
						break;
				}
				
				return;
			}
			
			if (baidu.dom.hasClass(target, 'del')) { // 删除报告
				me.inlineDel(target);
				baidu.event.preventDefault(event);
				return;
			}
			
			if (baidu.dom.hasClass(target, 'download_report')) { // 下载报告
				me.inlineDownload(target);
				baidu.event.preventDefault(event);
				return;
			}
			
			//查看报告
			if(baidu.dom.hasClass(target, 'view_report')){
				me.launchViewReport(target.getAttribute('reportid'), target.getAttribute('fileid'));
				baidu.event.preventDefault(event);
			}
        };
	},
		
	/**
	 * 行内修改报告名称
	 * @param {Object} target 事件目标
	 */
	inlineReportName: function(target){
		var me = this,
			parent = target.parentNode,
			reportid = parent.getAttribute('reportid'), 
			reportname = parent.getAttribute('control');
		
		nirvana.inline.createInlineLayer({
			type: 'text',
			value: reportname,
			virtualValue : '可以输入' + nirvana.config.NUMBER.REPORT.MAX_LENGTH + '个字符',
			id: 'reportname' + reportid,
			target: parent,
			okHandler: function(name){
				if (name == '可以输入' + nirvana.config.NUMBER.REPORT.MAX_LENGTH + '个字符') {
					name = '';
				}
				return {
					func: fbs.report.modName,
					param: {
						reportid: reportid,
						reportname: name,
						onSuccess: me.inlineSuccessHandler('Mod',reportid,name),
						onFail: me.inlineFailHandler()
					}
				}
			}
		});
	},
	
	/**
	 * 行内删除报告
	 * @param {Object} target 事件目标
	 */
	inlineDel : function(target) {
		var me = this,
			reportid = target.getAttribute('reportid'), 
			reportname = target.getAttribute('reportname');
		
		ui.Dialog.confirm({
			title: '删除报告',
			content: '您确定删除<strong>“' + baidu.encodeHTML(baidu.decodeHTML(reportname)) + '”</strong>吗？删除操作无法恢复。',
			onok: function(){
				fbs.report.delInfo({
					reportid : reportid,
					onSuccess: me.inlineSuccessHandler('Del',reportid)
				});
			},
			oncancel: function(){
			}
		});
	},
	
	/**
	 * 行内下载报告
	 * @param {Object} target 事件目标
	 */
	inlineDownload : function(target) {
		var me = this,
			reportid = target.getAttribute('reportid'),
			fileid = target.getAttribute('fileid'),
			reportfail = target.getAttribute('reportfail');
			
		fbs.report.getMyReportParams({
			reportid	:	reportid,
			onSuccess	:	function(response){
				var params = response.data.reportinfo;
			//	console.log(0,response)
				//将定制报告参数处理后设置为兼容lib_report的currentParams格式
				
				me.setContext('currentParams', params);
				
				// 设置下载的fileid
				me.setContext('downloadFileid', fileid);
				
				// 设置下载的reportstatus
				me.setContext('reportfail', reportfail);
				
				// 打开下载action
				nirvana.displayReport._showDownloadSubAction(me);
			}
		});
	},
	
	/**
	 * 行内编辑成功后清缓存，refresh页面
	 */
	inlineSuccessHandler: function(type,reportid,name){
		var me = this,
		controlMap = me._controlMap.ReportlistTable;
		return function(response){
			// 报告列表渲染
			var listData = me.getContext('listData');
			for(var key in listData){
				if(listData[key].reportid == reportid){
					if(type == 'Mod'){
						listData[key].reportname = name;
					}else if(type == 'Del'){
						listData.splice(key,1);
					}
					me.setContext('listData',listData);
					break;
				}
			}
			controlMap.datasource = listData;
			controlMap.render(controlMap.main); 
		};
	},
	
	/**
	 * 行内编辑失败，用于修改报告名称
	 */
	inlineFailHandler : function() {
		var me = this;
		
		return function(response){
			var error = fbs.util.fetchOneError(response),
				errorcode;
				
			if (error) {
				for (var item in error) {
					errorcode = error[item].code;
				}
			}
			
			if (response.status == 600) {
				errorcode = 1933; // 名称超过上限
			}
			
			if (errorcode) {
				switch (errorcode) {
					case 1932:
					case 1933:
						if (baidu.g('errorArea')) {
							baidu.g('errorArea').innerHTML = nirvana.config.ERROR.REPORT.NAME[errorcode];
						}
						
						break;
				}
			} else {
				ajaxFailDialog();
			}
		};
	},
	
	/**
	 * 列表渲染方法
	 */
	listRender : {
		/**
		 * 计划名称
		 * @param {Object} item
		 */
		reportname : function(item) {
			var reportstatus = item.reportstatus,
				reportname = baidu.encodeHTML(item.reportname),
			    reportid = item.reportid,
				fileid	 = item.fileid,
				html = [];
			
			html.push('<div class="edit_td" reportid="' + reportid + '" control="' + reportname + '">');
			if (reportstatus == 2) {
				html.push('<a class="view_report" href="#" reportid="' + reportid + '" fileid="' + fileid + '" title="' + reportname + '">' + reportname + '</a>');
			} else {
				html.push(reportname);
			}
			
			html.push('<a class="edit_btn" edittype="reportname" title="重命名"></a>');
			html.push('</div>');
			
			return html.join('');
		},
		
		/**
		 * 报告类型  1 循环报告 2 预约报告 与显示类型顺序不一致，需要注意
		 * @param {Object} item
		 */
		reporttag : function(item) {
			var reporttag = item.reporttag,
			    classname = ['', 'type_loop', 'type_order'],
				title = ['', '循环生成', '一次生成'];
			
			return '<span class="type ' + classname[reporttag] + '" >' + title[reporttag] + '</span>'
		},
		
		/**
		 * 查看权限  100 用户报告 200 推广顾问报告 300 管理员报告
		 * @param {Object} item
		 */
		reportlevel : function(item) {
			var reportlevel = item.reportlevel;
			
			return nirvana.config.LANG.REPORT.REPORTLEVEL[reportlevel];
		},
		
        /**
         * 操作列 依据 reportstatus
         * 0 未生成
         * 1 生成中
         * 2 已生成
         * 3 生成异常（数据量过大）
         * 4 生成异常（预约报告入Q时错误）
         * 5 生成异常（报告生成异常）
         * @param {Object} item
         */
		handle : function(item) {
			var reportstatus = item.reportstatus,
			    reporttag = item.reporttag,
				reportid = item.reportid,
				fileid	 = item.fileid,
			    reportname = baidu.encodeHTML(item.reportname),
				html = [];
			
			if (reporttag == 1) { // 1 循环报告
				switch (reportstatus) {
					case 0:
					case 1:
					case 2: // 循环报告不可能有2的状态，这里先留着
						if (fileid == -1) { // fileid代表最后一个文件的fileid
							html.push('<span class="going">生成中...</span>');
						} else {
							html.push('<div class="handle">');
							html.push('<a class="view_report" reportid="' + reportid + '" fileid="' + fileid + '" href="#" data-log="{target:\'inlineViewReport_btn\'}">查看</a>');
							html.push('<a class="download_report" href="#" reportid="' + reportid + '" fileid="' + fileid + '" data-log="{target:\'inlineDownloadReport_btn\'}">下载</a>');
							html.push('<a class="del" href="#" reportid="' + reportid + '" reportname="' + reportname + '" data-log="{target:\'inlineDelReport_btn\'}">删除</a>');
							html.push('</div>');
						}
						break;
					case 3:
					case 4:
					case 5:
						html.push('<div class="handle">');
						html.push('<span class="going">无法生成</span>');
						html.push('<a class="download_report" href="#" reportid="' + reportid + '" fileid="' + fileid + '" reportfail="fail" data-log="{target:\'inlineDownloadReport_btn\'}">下载</a>');
						html.push('<a class="del" href="#" reportid="' + reportid + '" reportname="' + reportname + '" data-log="{target:\'inlineDelReport_btn\'}">删除</a>');
						html.push('</div>');
						break;
					case 6:
						html.push('<span class="going">生成中...</span>');
						break;
				}
			} else { // 2 预约报告
				switch (reportstatus) {
					case 0:
					case 1:
						html.push('<span class="going">生成中...</span>');
						break;
					case 2:
						html.push('<div class="handle">');
						html.push('<a class="view_report" reportid="' + reportid + '" fileid="' + fileid + '" href="#" data-log="{target:\'inlineViewReport_btn\'}">查看</a>');
						html.push('<a class="download_report" href="#" reportid="' + reportid + '" fileid="' + fileid + '" data-log="{target:\'inlineDownloadReport_btn\'}">下载</a>');
						html.push('<a class="del" href="#" reportid="' + reportid + '" reportname="' + reportname + '" data-log="{target:\'inlineDelReport_btn\'}">删除</a>');
						html.push('</div>');
						break;
					case 3:
					case 4:
					case 5:
						html.push('<div class="handle">');
						html.push('<span class="going">无法生成</span>');
						html.push('<a class="del" href="#" reportid="' + reportid + '" reportname="' + reportname + '" data-log="{target:\'inlineDelReport_btn\'}">删除</a>');
						html.push('</div>');
						break;
					case 6:
						html.push('<span class="going">生成中...</span>');
						break;
				}
			}
			
			return html.join('');
		}
	},
	
	
	/**
	 * toggle 列表容器
	 */
	_toggleParamsContainer : function(status){
		var btn = baidu.g('ToggleParam'),
			wrap = ui.util.get('ReportlistTable').main;
		
		if(typeof status == 'undefined'){ //未指定status自动判断
			status = baidu.dom.hasClass(wrap, 'hide');
			var logParams = {};
			if(status){
				logParams.target = "checkMyReportMoreParams_btn";
			}else{
				logParams.target = "foldMyReportParams_btn";
			}
			NIRVANA_LOG.send(logParams);
		}
			
		if(status){ //show
			baidu.dom.removeClass(wrap, 'hide');
			baidu.dom.removeClass(btn, 'folded');
			btn.innerHTML = '点击收起选项';
		} else {
			baidu.dom.addClass(wrap, 'hide');
			baidu.dom.addClass(btn, 'folded');
			btn.innerHTML = '点击查看更多选项';
		}
		
		nirvana.report.lib._resizeTable();
	},
	
	
	/****************定制报告展现部分******************/
	/**
	 * 启动查看某一个定制报告
	 * @param {Object} reportid
	 */
	launchViewReport : function(reportid, fileid){
		var me = this;
		//先获取报告的具体Params
		me.setContext('myReportFileid', fileid);
		// 这里需要更新下载的fileid
		me.setContext('downloadFileid', fileid);
		me.getReportParams(reportid, fileid);
	},
	
	/**
	 * 读取报告的具体Params
	 * @param {Object} reportid
	 */
	getReportParams : function(reportid){
		var me = this;
		fbs.report.getMyReportParams({
			reportid	:	reportid,
			onSuccess	:	function(response){	
				if(typeof response.data.reportinfo.idset == 'string'){
					var idArr = response.data.reportinfo.idset.split(',');
					response.data.reportinfo.idset = idArr;
				}
				 //response.data.mltinfos可以用来做我的报告的信息的显示
		//		console.log(1,response)
				var params = baidu.object.clone(response.data.reportinfo); // 避免污染
				params.dataitem = params['dataitem'].split(',');
				//将定制报告参数处理后设置为兼容lib_report的currentParams格式
				me.setContext('currentParams', params);	
				
				//设置报告名称
				me.setContext('reportName', params.reportname);
				
				nirvana.report.currentReportType = params.reporttype;
				
				//账户 计划 单元报告显示信息
				if(params.mtllevel == '2' || params.mtllevel == '3' || params.mtllevel == '5'){
					baidu.removeClass(baidu.g('phonetransTip'),'hide');
				}else{
					baidu.addClass(baidu.g('phonetransTip'),'hide');
				}
				
				//读取报告信息
				me.getReportInfo();
				
				//读取总计数据
				me.getReportSum();
			}
		});
	},
	
	/**
	 * 获取报告信息
	 */
	getReportInfo : function() {
		var me = this,
		    params = me.getContext('currentParams'),
			param,
			key,
			id,
			html;
		for (key in params) {
			param = params[key];
			id = 'ReportInfo' + initialString(key);
			//console.log(key + ' : ' + param);
			
			if (!baidu.g(id)) { // 没有相应的容器，则无需继续下去
				continue;
			}
			
			switch (key) {
				// 选定对象
				case 'mtldim':
					switch (param) {
						// 账户层级
						case 2:
							if (nirvana.config.LANG.REPORT[key.toUpperCase()][param]) {
								baidu.g(id).innerHTML = nirvana.config.LANG.REPORT[key.toUpperCase()][param];
								baidu.removeClass(baidu.g(id).parentNode, 'hide');
							} else { // 没有值，则隐藏父元素
								baidu.addClass(baidu.g(id).parentNode, 'hide');
							}
							break;
						// 推广计划
						case 3:
							if(params.idset == ''){
								me.buildMtlName('所有推广计划');
								break;
							}
							fbs.plan.getPlanname({
								condition: {
									planid: params.idset
								},
								onSuccess: function(respnose){
									var data = respnose.data.listData,
										planname = [];
									
									// 获取计划名称
									for (var i = 0, j = data.length; i < j; i++) {
										planname.push('"' + data[i].planname + '"计划');
									}
									
									me.buildMtlName(planname);
								}
							});
							break;
						// 推广单元
						case 5:
							if(params.idset == ''){
								me.buildMtlName('所有推广单元');
								break;
							}
							fbs.unit.getUnitname({
								condition: {
									unitid: params.idset
								},
								onSuccess: function(respnose){
									var data = respnose.data.listData,
										unitname = [];
									
									// 获取单元名称
									for (var i = 0, j = data.length; i < j; i++) {
										unitname.push('"' + data[i].unitname + '"单元');
									}
									
									me.buildMtlName(unitname);
								}
							});
							break;
						// 关键词
						case 6:
							if(params.idset == ''){
								me.buildMtlName('所有关键词');
								break;
							}
							fbs.keyword.getShowword({
								condition: {
									winfoid: params.idset
								},
								onSuccess: function(respnose){
									var data = respnose.data.listData,
										showword = [];
									
									// 获取关键词
									for (var i = 0, j = data.length; i < j; i++) {
										showword.push('"' + data[i].showword + '"关键词');
									}
									
									me.buildMtlName(showword);
								}
							});
							break;
						// 创意
						case 7:
							if(params.idset == ''){
								me.buildMtlName('所有创意');
								break;
							}
							fbs.idea.getTitle({
								condition: {
									ideaid: params.idset
								},
								onSuccess: function(respnose){
									var data = respnose.data.listData,
										title = [];
									
									// 获取创意
									for (var i = 0, j = data.length; i < j; i++) {
										title.push('"' + data[i].title + '"创意');
									}
									
									me.buildMtlName(title);
								}
							});
							break;
						case 8:
							if(params.idset == ''){
								me.buildMtlName('所有监控文件夹');
								break;
								
							}
							fbs.avatar.getMoniFolders({
								folderid : params.idset,
								 "fields":["foldername"],
								onSuccess: function(respnose){
									var data = respnose.data.listData,
										title = [];
									
									// 获取监控文件夹
									for (var i = 0, j = data.length; i < j; i++) {
										title.push('"' + data[i].foldername + '"监控文件夹');
									}
									
									me.buildMtlName(title);
								}
							});
							break;
					}
					break;
				
				// 推广方式
				case 'platform':
				// 查询层级
				case 'mtllevel':
				// 循环频率
				case 'reportcycle':
				// 查看权限
				case 'reportlevel':
					if (nirvana.config.LANG.REPORT[key.toUpperCase()][param]) {
						// 文字在config中配置
						baidu.g(id).innerHTML = nirvana.config.LANG.REPORT[key.toUpperCase()][param];
						if(key == 'reportlevel'){
							baidu.g('ReportInfoLoopReportlevel').innerHTML = nirvana.config.LANG.REPORT[key.toUpperCase()][param];
						}
						baidu.removeClass(baidu.g(id).parentNode, 'hide');
					} else { // 没有值，则隐藏父元素
						baidu.addClass(baidu.g(id).parentNode, 'hide');
					}
					break;
					
				// 保存类型
				case 'filetype':
					if (nirvana.config.LANG.REPORT[key.toUpperCase()][param] && params.ismail) { // ismail有可能为0，因为新建报告时，可能保存了邮箱而没有勾选发送邮件的复选框
						// 文字在config中配置
						baidu.g(id).innerHTML = nirvana.config.LANG.REPORT[key.toUpperCase()][param];
						baidu.removeClass(baidu.g(id).parentNode, 'hide');
					} else { // 没有值，则隐藏父元素
						baidu.addClass(baidu.g(id).parentNode, 'hide');
					}
					break;
				
				// 收件人邮箱
				case 'mailaddr':
					if (param && params.ismail) { // ismail有可能为0，因为新建报告时，可能保存了邮箱而没有勾选发送邮件的复选框
						baidu.g(id).innerHTML = param;
						baidu.removeClass(baidu.g(id).parentNode, 'hide');
					} else { // 没有值，则隐藏父元素
						baidu.addClass(baidu.g(id).parentNode, 'hide');
					}
					break;
			}
		}
		// 循环报告需要显示循环信息
		if (params.reporttag == 1) {
			baidu.removeClass('ReportInfoLoop', 'hide');
			baidu.addClass('ReportInfoAuth','hide');
		} else {
			baidu.addClass('ReportInfoLoop', 'hide');
			baidu.removeClass('ReportInfoAuth','hide');
		}
		
		// 显示报告信息区域
		baidu.removeClass('ReportInfo', 'hide');
	},
	
	
	/**
	 * 选定对象名称
	 * @param {Array} namelist 名称列表[]
	 */
	buildMtlName : function(namelist) {
		if(typeof namelist == 'string'){
			baidu.g('ReportInfoMtldim').innerHTML = namelist;
			return;
		}
		var html = [],
		    name = namelist.join('，');
		
		html.push('<span class="ui_bubble" bubblesource="mtlName" title="选定对象详情">');
		html.push(getCutString(name, 30, '...'));
		html.push('</span>');
		
		baidu.g('ReportInfoMtldim').innerHTML = html.join('');
		
		// 保存物料名称，显示bubble
		nirvana.report.lib.mtlName = baidu.encodeHTML(name);
		ui.Bubble.init();
	},
	
	/**
	 * 获取报告总计
	 */
	getReportSum : function(){
		var me = this,
			fileid = me.getContext('myReportFileid');
		fbs.report.getMyReportSum({
			fileid: fileid,
			onSuccess: function(response){
				response = baidu.object.clone(response);
				//将总计中clkrate的百分号去掉
				var row;
				for(var i = 0, l = response.data['sum'].length; i < l; i++){
					row = response.data['sum'][i];
					if(row['clkrate']){
						row['clkrate'] = row['clkrate'].substr(0, row['clkrate'].length - 1); //去掉最后一个百分号
						row['clkrate'] = row['clkrate'] / 100;
					}
				}
				
				me.setContext('reportTableRows', response.data['rownum']);
				me.setContext('reportTotalPage', Math.ceil(response.data['rownum'] / 50));
				
				nirvana.displayReport.buildSumData(response.data['sum'], me, true);
				
				//将后端返回的wordid_name planid_name等col转换为与实时报告一样的key
				var translateMap = {
						'userid_name'	:	'useracct',
						'planid_name'	:	'planinfo',
						'unitid_name'	:	'unitinfo',
						'ideatitle'	:	'ideainfo',
						'wordid_name'	:	'word',
						'provid_name'	:	'prov',
						'folderid_name' :    'folderinfo'
					},
					col;
				for(var i = 0; i < response.data['cols'].length; i++){ //此处length不能提前计算
					col = response.data['cols'][i];
					if(translateMap[col]){
						response.data['cols'][i] = translateMap[col];
					}
					//后端会额外传回ideadesc1、ideadesc2、ideaurl,将他们删掉
					if(col == 'ideadesc1' || col == 'ideadesc2' || col == 'ideaurl'){
						response.data['cols'].splice(i, 1);
						i--;
					}
				}
				
				var col = nirvana.report.lib.buildTableCol(response.data['cols']);
				
				//将表的排序设置为false
				for (var key in col){
					if (col[key]) { // col是数组，col[key]有可能不存在
						col[key].sortable = false;
					}
				}
				me.setContext('reportTableFields', col);
				//读取FLASH数据
				me.getReportFlashData(); 
				
				//设定下载报告、循环报告、发送报告的状态 
				nirvana.displayReport.setReportControl(me);
			}
		});
			
	},
	
	/**
	 * 获取FLASH数据
	 */
	getReportFlashData : function(callback){
		var me = this,
			params = me.getContext('currentParams'),
			currentParams = me.getContext('currentParams'),
			fileid = me.getContext('myReportFileid');
		if(currentParams.reporttype != 13 && currentParams.reporttype != 4 && currentParams.reporttype != 21){
			fbs.report.getMyReportFlashData({
				fileid		:	fileid,
				dataitems	:	params.dataitem, //直接都请求回来
				onSuccess: function(response){
					if (response.data.length > 0) {
						//渲染Flash
						baidu.dom.removeClass('ReportChart', 'hide');
						nirvana.displayReport.initInstantReportChart(response.data, me);
					} else {
						baidu.dom.addClass('ReportChart', 'hide');
					}
					
					baidu.removeClass('ReportView', 'hide');
					baidu.removeClass('ReportTableWrap', 'hide');
					
					me.refresh(); //refresh渲染表格
				}
			});
		}else{
			baidu.dom.addClass('ReportChart', 'hide');
			baidu.removeClass('ReportView', 'hide');
			baidu.removeClass('ReportTableWrap', 'hide');
			me.refresh();
		}
			
	},
	
	/**
	 * 分页获取定制报告数据
	 */
	getReportData : function(callback){
		var me = this,
			fileid = me.getContext('myReportFileid'),
			pageNum = me.getContext('pageNum');
		
		fbs.report.getMyReportData({
			fileid	:	fileid,
			curPage: pageNum, //当前页
 			pageSize:50,
			onSuccess : function(response){
				//将后端返回的wordid_name planid_name等col转换为与实时报告一样的结构
				var data = baidu.object.clone(response['data']),
					row;
				
				for (var i = 0, l = data.length; i < l; i++){
					row = data[i];
					if(row['userid_name']){
						row['useracct'] = {
							id		:	-1,
							name	:	row['userid_name']
						};
						delete row['userid_name'];
					}
					
					if(row['planid_name']){
						row['planinfo'] = {
							id		:	-1,
							name	:	row['planid_name']
						};
						delete row['planid_name'];
					}
					
					if(row['unitid_name']){
						row['unitinfo'] = {
							id		:	-1,
							name	:	row['unitid_name']
						};
						delete row['unitid_name'];
					}
					
					if(row['wordid_name']){
						row['word'] = {
							id		:	-1,
							name	:	row['wordid_name']
						};
						delete row['wordid_name'];
					}
					
					if(row['provid_name']){
						row['prov'] = {
							name	:	row['provid_name']
						};
						delete row['provid_name'];
					}
					
					if(row['folderid_name']){
						row['folderinfo'] = {
							id		:	-1,
							name	:	row['folderid_name']
						};
						delete row['folder_name'];
					}
					
					if(row['ideatitle']){
						row['ideainfo'] = {
							ideaid		:	-1,
							ideatitle	:	row['ideatitle'],
							ideadesc1	:	row['ideadesc1'],
							ideadesc2	:	row['ideadesc2'],
							ideaurl	:	row['ideaurl']
						};
						delete row['ideatitle'];
						delete row['ideadesc1'];
						delete row['ideadesc2'];
						delete row['ideaurl'];
					}
					
					//去掉点击率中的百分号
					if (row['clkrate']) {
						row['clkrate'] = row['clkrate'].substr(0, row['clkrate'].length - 1); //去掉最后一个百分号
						row['clkrate'] = row['clkrate'] / 100;
					}
				}
				
				
				//后端分页，不用担心原始数据被污染
				if (nirvana.report.currentReportType == 21) {
					me.setContext('reportTableData', nirvana.displayReport.getSublinkTableData(data));
				}
				else {
					me.setContext('reportTableData', data);
				}
				callback && callback();
			}
		});
	}
	
});

ui.Bubble.source.mtlName = {
	type : 'normal',
	iconClass : 'ui_bubble_icon_info',
	positionList : [2,3,4,5,6,7,8,1],
	needBlurTrigger : true,
	showByClick : true,
	showByOver : true,			//鼠标悬浮延时显示
	showByOverInterval : 500,	//悬浮延时间隔
	hideByOut : true,			//鼠标离开延时显示
	hideByOutInterval : 2000,	//离开延时间隔，显示持续时间
	title: function(node){
		return node.getAttribute('title');
	},
	content: function(node, fillHandle, timeStamp){
		return '<div class="mtl_name"><div style="max-height:190px;_height:expression((document.documentElement.clientHeight||document.body.clientHeight)<190?\'190px\':\'\');overflow-y:auto;">' + nirvana.report.lib.mtlName + '</div></div>';
	}
};
