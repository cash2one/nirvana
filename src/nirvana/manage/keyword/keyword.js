/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    keyword/keyword.js
 * desc:    推广管理
 * author:  zhouyu
 * date:    $Date: 2011/01/06 $
 */

manage.keywordList = new er.Action({
	
	VIEW: 'keywordList',
		
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
		navLevel : 'unit',
		unitid : '',
		planid : '',
		aoEntrance : 'Wordinfo', // Planinfo,Unitinfo,Wordinfo,Ideainfo,Monitor,Nav
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
		
		wordTableList : {
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
			datasource : '*keywordListData'
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
				
			}
			this.setContext('moreOpt',baidu.object.clone(this.baseMoreOpt));
			callback();
		},
		dateRange : nirvana.manage.getStoredDate([0,1,2,3,4,6]),
		
		searchCombo : function (callback){
	    var me = this;
			if (!me.arg.refresh) {
				//状态列表的设置
			    me.setContext('SearchState', {
					datasource:nirvana.manage.getStatusSet("keyword"), 
			       	value: 100, 
					width:120
			    });
			    
			    //精确查询相关设置
			    me.setContext('SearchPrecise', {
			        name: 'precise',
			        title: '精确查询',
			        value: 1
			    });
			    
				//高级相关设置
			    me.setContext('searchAdvance', {
			        name: '<b>[+]</b> 高级',
					name2: '<b>[ - ]</b> 取消',
			        title: '高级筛选',
			        value: 0,
					content : {
						"advSearchPaysum":{name:"<span class='ui_bubble' title='消费筛选项'>消费：</span>",type:"radio",needHelp:true,value:[{name:"高消费",value:"H"},{name:"低消费",value:"L"},{name:"为0",value:"0"}]},
						"advSearchPrice":{name:"<span class='ui_bubble' title='平均点击价格筛选项'>平均点击价格：</span>",type:"radio",needHelp:true,value:[{name:"高价格",value:"H"},{name:"低价格",value:"L"}]},
						"advSearchClk":{name:"<span class='ui_bubble' title='点击筛选项'>点击量：</span>",type:"radio",needHelp:true,value:[{name:"高点击",value:"H"},{name:"低点击",value:"L"},{name:"为0",value:"0"}]}
						/*"advSearchShowq":{
								name:"<span class='ui_bubble' title='质量度筛选项'>质量度：</span>",
								type:"radio",
								needHelp:true,
								value: qStar.getFilter()
						},
						"advSearchShowqPc":{
								name:"<span class='ui_bubble' title='计算机质量度筛选项'>计算机质量度：</span>",
								type:"radio",
								needHelp:true,
								value: qStar.getFilter()
						},
						"advSearchShowqM":{
								name:"<span class='ui_bubble' title='移动质量度筛选项'>移动质量度：</span>",
								type:"radio",
								needHelp:true,
								value: qStar.getFilter()
						}*/
					}
			    });
				
				//获取高级筛选的阀值
				ADV_FILTER_VALUE = {
					HPaysum : Number.MAX_VALUE,
					LPaysum : -1,
					HAvgprice : Number.MAX_VALUE,
					LAvgprice : -1,
					HClk : Number.MAX_VALUE,
					LClk : -1,
					HOperate : Number.MAX_VALUE,
					HClkrate : Number.MAX_VALUE,
					HPp : Number.MAX_VALUE
				}
				fbs.avatar.getFilterThreshold({
					fields : ['thdtype','highthreshold','lowthreshold'],
					callback : function(response){
						if (response.status == '200'){
							response = response.data.listData;
							for (var i = 0, len = response.length; i < len; i++){
								switch (response[i].thdtype + ''){
									case '2':
									    ADV_FILTER_VALUE['HClk'] = response[i].highthreshold < 0 ? Number.MAX_VALUE : response[i].highthreshold;
										ADV_FILTER_VALUE['LClk'] = response[i].lowthreshold < 0 ? -1 : response[i].lowthreshold;
										break;
									case '3':
									    ADV_FILTER_VALUE['HPaysum'] = response[i].highthreshold < 0 ? Number.MAX_VALUE : response[i].highthreshold;
										ADV_FILTER_VALUE['LPaysum'] = response[i].lowthreshold < 0 ? -1 : response[i].lowthreshold;
										break;
									case '4':
									    ADV_FILTER_VALUE['HAvgprice'] = response[i].highthreshold < 0 ? Number.MAX_VALUE : response[i].highthreshold;
										ADV_FILTER_VALUE['LAvgprice'] = response[i].lowthreshold < 0 ? -1 : response[i].lowthreshold;
										break;
									case '5':
									    ADV_FILTER_VALUE['HClkrate'] = response[i].highthreshold < 0 ? Number.MAX_VALUE : response[i].highthreshold;
										break;
									case '6':
									    ADV_FILTER_VALUE['HPp'] = response[i].highthreshold < 0 ? Number.MAX_VALUE : response[i].highthreshold;
										break;
									case '7':
									    ADV_FILTER_VALUE['HOperate'] = response[i].highthreshold < 0 ? Number.MAX_VALUE : response[i].highthreshold;
										break;
								}
							}
						}
					}
				})
				
			}
			//恢复搜索控件状态
            me.setContext('searchStateValue', me.arg.queryMap.status || 100);
            me.setContext('searchQueryValue', me.arg.queryMap.query ? me.arg.queryMap.query : '');
            me.setContext('searchPreciseValue', me.arg.queryMap.queryType == 'accurate');
			if (!me.getContext('searchAdvanceValue')){
				me.setContext('searchAdvanceValue', {
					"advSearchPaysum" : '-1',
					"advSearchPrice" : '-1',
					"advSearchClk" : '-1'
					/*"advSearchShowq" : '-1'
					"advSearchShowqPc" : '-1',
					"advSearchShowqM" : '-1'*/
				});
			}
			if (!me.getContext('searchShortcutValue')){
				me.setContext('searchShortcutValue', {
					"scutKeypoint" : '-1',
					"scutHPpRate" : '-1',
					"scutHClkRate" : '-1'
				});
			}
			
		    callback();
		},
		tableFields : function(callback){
			var me = this,
				userrole = nirvana.env.userRole,
			 	fcaudit = (userrole && userrole == nirvana.config.WORDADMIN) ? true : false;
			me.setContext('fcaudit', fcaudit);
			if (!me.arg.refresh) {
				nirvana.manage.wordTableField = {
					showword: {
						content: function(item){
							var title = baidu.encodeHTML(item.showword), content = getCutString(item.showword, 30, ".."), wmatch = item.wmatch, wctrl = item.wctrl, wctrl_auth = nirvana.env.AUTH['gaoduan'];
							
							if (wctrl_auth) {
								title = nirvana.util.buildShowword(title, wmatch, wctrl);
								content = nirvana.util.buildShowword(content, wmatch, wctrl);
							}
							
							var html = [];
							if (wctrl_auth && wmatch == 31) {
								html[html.length] = '<div class="edit_td" winfoid="' + item.winfoid + '">';
							}
						//	html[html.length] = '<span class="" bubblesource="monitorFolderList" id="folderList' + item.winfoid + '">';
							html[html.length] = '<span title="' + title + '">' + content + '</span>';
							if (wctrl_auth && wmatch == 31) { //短语
								html[html.length] = '<a class="edit_btn" edittype="wctrl" title="短语匹配模式设置"></a>';
							}
							html[html.length] = '<span bubblesource="fclabstat" id="labstat' + item.winfoid + '"></span>';
							html[html.length] = '<span bubblesource="monitorFolderList" id="folderList' + item.winfoid + '"></span>';
							
							if (wctrl_auth && wmatch == 31) {
								html[html.length] = '</div>';
							}
							return html.join("");
						},
						locked: true,
						sortable : true,
						filterable : true,
						field : 'showword',
						title: '关键词',
						width: 200,
						minWidth:200
					},
					unitname : {
						content: function(item){
							var title = baidu.encodeHTML(item.unitname), content = getCutString(item.unitname, 30, ".."), html;
							
							html = '<a title="' + title + '" " href="javascript:void(0);" unitid=' + item.unitid + 
							' level = "unit" data-log="{target:' +
							"'linkunit_lbl'" +
							'}" >' +
							content +
							'</a>';
						
							if (me.getContext('fcaudit')) {
								html += '<div><a href=' + FC_AUDIT + 'userid=' + nirvana.env.USER_ID + '&unitid=' + item.unitid + 
								'&planid=' +
								item.planid +
								' target="_blank">审核该单元</a></div>';
							}
							return html;
						},
						title: '推广单元',
						sortable : true,
						filterable : true,
						field : 'unitname',
						width: 100
					},
					planname : {
						content: function(item){
							var title = baidu.encodeHTML(item.planname), content = getCutString(item.planname, 30, "..");
					
							return '<a title="' + title + '" href="javascript:void(0);" planid=' + item.planid + ' level = "plan" data-log="{target:'+"'linkplan_lbl'"+'}" >' + content + '</a>';
						},
						title: '推广计划',
						sortable : true,
						filterable : true,
						field : 'planname',
						width: 100
					},
					wordstat: {
						content: function(item){
							var stat = nirvana.util.buildStat('word', item.wordstat, item.pausestat, {
								winfoid: item.winfoid
							});
							nirvana.manage.UPDATE_ID_ARR.push(Number(item.winfoid));
							return '<span class="word_update_state" id="wordstat_update_' + item.winfoid + '">' + stat + '</span>';
						},
						title: '状态',
						sortable : true,
						filterable : true,
						field : 'wordstat',
						width: 100,
						minWidth: 125,
						noun : true,
						nounName : '关键词状态'
					}, 
					bid: {
						content: function(item){
							var html = [];
							html[html.length] = '<div class="edit_td"  winfoid="' + item.winfoid + '">';
							if(item.bid){
								html[html.length] =  "<span class='word_bid'>" + baidu.number.fixed(item["bid"]) + "</span>";
							}
							else {
								html[html.length] = "<span title='使用单元出价'>" + baidu.number.fixed(item["unitbid"]) + "</span>";
							}
							html[html.length] = '<a class="edit_btn edit_btn_left" edittype="bid"></a>';
                            html[html.length] = '</div>';
							return html.join("");
						},
						field : 'bid',
						title: '出价',
						sortable : true,
						filterable : true,
						align:'right',
						width: 50,
						minWidth: 95,
						noun : true,
						nounName : '关键词出价'
					},
					wmatch: {
						content: function(item){
							var html = [];
							html[html.length] = '<div class="edit_td" winfoid="' + item.winfoid + '">';
							html[html.length] = '<span>' + MTYPE[item["wmatch"]] + '</span>';
							html[html.length] = '<a class="edit_btn" edittype="wmatch"></a>';
                            html[html.length] = '</div>';
							return html.join("");
						},
						field : 'wmatch',
						title: '匹配模式',
						sortable : true,
						filterable : true,
						width: 60
					},
					/*showqstat: qStar.getTableField(me, {
                        noun:       true,
                        nounName:   '质量度', // 20130124由质量度及优化难度修改为质量度，in project '质量度司南'
                        sortable:   true,
                        filterable: true,
                        width:      60,
                        minWidth:   100
                    }),*/
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
						width: 85,
						minWidth: 128,
						noun : true,
						nounName: "转化(网页)"
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
						width:150,
						minWidth: 175,
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
						width: 100,
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
						width: 140,
						minWidth: 165,
						noun : true
					},
					wurl : {
						content:function(item){
							var title = baidu.encodeHTML(item.wurl), content = getCutString(item.wurl, 30, "..");
							var html = [];
							html[html.length] = '<div class="edit_td" winfoid="' + item.winfoid + '">';
							
							if (typeof(item.shadow_wurl) == 'undefined' || fbs.util.removeUrlPrefix(item.shadow_wurl) == "") {
								if (content == "") {
									html[html.length] = "无";
								}
								else {
									html[html.length] = ' <span title="' + title + '">' + content + '</span>';
								}
							}
							else {
								var shadow_title = baidu.encodeHTML(item.shadow_wurl),     //	shadow_wurl_control = item.shadow_wurl.substr(7),
									shadow_wurl = getCutString(item.shadow_wurl,30,"..");
								html[html.length] = '<span title="' + shadow_title + '">' + shadow_wurl + '</span>';
								if(content == ""){
									html[html.length] = '<br /><div class="orig_url">修改前没有为关键词单独设置链接</div>';
								}
								else {
									html[html.length] = '<br /><div class="orig_url"><h3>修改前URL</h3>' + content + '</div>';
								}
							}
							
							html[html.length] = '<a class="edit_btn" edittype="wurl"></a>';
                            html[html.length] = '</div>';
							return html.join("");
						},
						title: '访问URL',
						width: 175,
						minWidth:200,
						noun : true,
						nounName: "URL"
					},
					mwurl : {
                        content:function(item){
                            var title = baidu.encodeHTML(item.mwurl), content = getCutString(item.mwurl, 30, "..");
                            var html = [];
                            html[html.length] = '<div class="edit_td" winfoid="' + item.winfoid + '">';
                            
                            if (typeof(item.shadow_mwurl) == 'undefined' || fbs.util.removeUrlPrefix(item.shadow_mwurl) == "") {
                                if (content == "") {
                                    html[html.length] = "无";
                                }
                                else {
                                    html[html.length] = ' <span title="' + title + '">' + content + '</span>';
                                }
                            }
                            else {
                                var shadow_title = baidu.encodeHTML(item.shadow_mwurl),     //   shadow_wurl_control = item.shadow_wurl.substr(7),
                                    shadow_mwurl = getCutString(item.shadow_mwurl,30,"..");
                                html[html.length] = '<span title="' + shadow_title + '">' + shadow_mwurl + '</span>';
                                if(content == ""){
                                    html[html.length] = '<br /><div class="orig_url">修改前没有为关键词单独设置链接</div>';
                                }
                                else {
                                    html[html.length] = '<br /><div class="orig_url"><h3>修改前URL</h3>' + content + '</div>';
                                }
                            }
                            
                            html[html.length] = '<a class="edit_btn" edittype="mwurl"></a>';
                            html[html.length] = '</div>';
                            return html.join("");
                        },
                        title: '移动访问URL',
                        width: 175,
                        minWidth:200,
                        noun : true,
                        nounName: "移动URL"
                    },
                    pcshowq : (function(){
                    	var _content = qStar.getTableField(me, {}).content;
                    	return {
                    		content : function(item, row) {
                    			if (!item.pcshowq) {
                    				return '—';
                    			}
	                    		item.showqstat = item.pcshowq;
	                    		return _content(item, row);
	                    	},
	                    	sortable:   true,
	                        filterable: true,
	                        width:      60,
	                        minWidth:   130,
	                        title: '计算机质量度',
	                        field: 'pcshowq'
	                    }
                    })(),
                    mshowq : (function(){
                    	var _content = qStar.getTableField(me, {}).content;
                    	return {
                    		content : function(item, row) {
                    			if (!item.mshowq) {
                    				return '—';
                    			}
	                    		return '<div class="star_icon star_' + item.mshowq + '"></div>';
	                    	},
	                    	sortable:   true,
	                        filterable: true,
	                        width:      60,
	                        minWidth:   130,
	                        title: '移动质量度',
	                        field: 'mshowq'
	                    }
                    })()
				};
				var data =[];
				data.push(nirvana.manage.wordTableField['showword']);
				
				data.push(nirvana.manage.wordTableField['wurl']);
                me.setContext('tableFields', data);

				nirvana.manage.UserDefine.getUserDefineList('word', function(){
                    var ud = nirvana.manage.UserDefine, localList = ud.attrList['word'], data = [], i, len;
	                for (i = 0, len = localList.length; i < len; i++){
	                    data.push(nirvana.manage.wordTableField[localList[i]]);
	                }
	                me.setContext('tableFields', data);
	                callback();
	            });
		    
			}else{
				callback();
			}
		},
		
		keywordData : function(callback){
			var me = this;
			if (!me.arg.refresh) {
				//me.setTab();
				me.setContext('keywordListData', []);
				}
				callback();
		},
		
		noDataHtml:function(callback){
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
	
	
	/*基本的更多操作*/
	 baseMoreOpt:[{
                    text:"更多操作",
                    value:-9999
                },{
                    text:"访问URL",
                    value:'url'
                },{
                    text:"转移",
                    value:'transfer'
                },{
                    text:"删除",
                    value:'delete'
                }],
				
	
	/**
	 * 显示物料试验状态 和 监控文件夹图标
	 */
	showStatIcon:function(){
		var me = this;
		var ids = [];
		var words = me.getContext('keywordListData') || [];
		for (var i = 0, l = words.length; i < l; i++) {
			ids[ids.length] = words[i].winfoid;
		}
		if (ids.length > 0) {
			fbs.avatar.getWinfoid2Folders({
				ids: ids,
				onSuccess: me.showFoldersHandler(ids)
			});
			fbs.material.getFclabStat({
				level: "wordinfo",
				idset: ids,
				onSuccess: showLabstatIcon
			});
		}
	},
	
	showFoldersHandler: function(words){
		var me = this;
		return function(data){
			var dat = data.data;
			var winfoids = [];
			for (var item in dat) {
				winfoids[winfoids.length] = +item;
			}
			var folders = ui.Bubble.source.monitorFolderList.folders;
			for (var i = 0, l = words.length; i < l; i++) {
				var id = +words[i];
				if (baidu.array.indexOf(winfoids, id) != -1) {
					baidu.dom.addClass(baidu.g("folderList" + id), "ui_bubble");
					folders[id] = dat[id + ""];
				}
			}
			ui.Bubble.init();
		}
	},
	
	onafterrender : function(){
		var me = this,
		    controlMap = me._controlMap;
		//全投搬家历史记录下载
		nirvana.manage.allDeviceHisDownLoad();

		//表格loading
		controlMap.wordTableList.getBody().innerHTML = ''
			+ '<div class="loading_area">'
			+ '    <img src="asset/img/loading.gif" alt="loading" /> 读取中'
			+ '</div>';

		//给表格注册:排序事件
		controlMap.wordTableList.onsort = function(sortField,order){
			me.setContext("orderBy",sortField.field);
			me.setContext("orderMethod",order);
			me.refresh();
		}
		//给表格注册:筛选事件
		controlMap.wordTableList.onfilter = nirvana.manage.FilterControl.getTableOnfilterHandler(me,'wordTableList');
	    //给表格注册:选择事件
        controlMap.wordTableList.onselect = me.selectListHandler();
		//给表格注册:行内编辑处理器
        controlMap.wordTableList.main.onclick = me.getTableInlineHandler();
		
		//修改出价
		controlMap.modBid.disable(true);
		controlMap.modBid.onclick = me.modBidClickHandler();
		//修改匹配方式
		controlMap.modWmatch.disable(true);
		controlMap.modWmatch.onclick = me.modWmatchClickHandler();
        //启用暂停删除
        controlMap.runPause.onselect = me.operationHandler();
		//更多操作，访问url，转移，删除
        controlMap.moreOpt.onselect = me.operationHandler();
        //激活
        controlMap.activeWord.disable(true);
        controlMap.activeWord.onclick = me.activeClickHandler();
		//监控
        controlMap.monitor.disable(true);
        controlMap.monitor.onclick = me.monitorClickHandler();
        
		//注册工具箱导入方法
		ToolsModule.setImportDataMethod(function(){
			return me.getImportMaterials();
		});
		
		//组合查询
        controlMap.materialQuery.onclick = me.getSearchHandler();
        controlMap.materialQuery.repaint(controlMap.materialQuery.main);
		baidu.g('searchComboTipContent').onclick = nirvana.manage.SearchTipControl.getSearchTipHandler(me,'wordTableList'); 
		//controlMap.cancelComboSearch.onclick = me.getCancelSearchHandler();
		controlMap.MonitorFilterResult.onclick = me.getMonitorFilterResultHandler();
       
		//优化 by linzhifeng@baidu.com 2011-08-29
	    nirvana.manage.setModDialog(me);
		
		controlMap.calendar.onselect = function(data){
			nirvana.manage.SearchShortcut.clearSearchCondition();
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
			ui.util.get('wordTableList').resetYpos = true;
			baidu.event.fire(window,'scroll');
			me.setContext('pageSize', +value);
			me.setContext("pageNo", 1);
			me.refresh();
		};
		
		//pagination
		controlMap.pagination.onselect = function(value){
			ui.util.get('wordTableList').resetYpos = true;
			baidu.event.fire(window,'scroll');
			me.setContext("pageNo", +value);
			me.refresh();
		};
		
		//tab
		controlMap.tab.onselect = nirvana.manage.tab.getTabHandler(me,controlMap.tab,'关键词');
				
		
		// 添加关键词
		controlMap.addkeyword.onclick = me.addKeywordHandler();
		
		//附加tab
		EXTERNAL_LINK.tabInit("ExtraTab");
		
	    //推广时段
        nirvana.manage.initSchedule(me);
		
		ui.util.get('materialQueryShortcutSearch').onclick = nirvana.manage.SearchShortcut.getShortcutHandler(me,'materialQueryShortcutSearch','wordTableList');

		//批量下载 by liuyutong@baidu.com
		nirvana.manage.batchDownload.initCheck();
	},
	
	onreload : function(){ 
		this.refresh();
	},
	
	/**
	 *当前层级应该显示的url 
	 */
	getKeywordUrl : function(){
	    var me = this;
	    var nav = me.getContext('navLevel');
	    var devicePrefer = me.getContext('devicePrefer');
	    var devicecfgstat = me.getContext(nav + '_devicecfgstat');
	    var url = [];
	    if(nav!='account'){
	        
	           if(devicePrefer == 'all'){
	               url.push('wurl');
	               url.push('mwurl');
	             }
	           else if(devicePrefer == 'pc'){
                   url.push('wurl');
                 }
               else if(devicePrefer == 'mobile'){
                   url.push('mwurl');
                 }
	       
	    }
	    else{//账户层级
	    	if(nirvana.env.FCWISE_MOBILE_USER) {//白名单那用户，账户层级只能看到访问url
	    		 url.push('wurl');
	    	}
	    	else{ //普通用户账户层级两个url都可以看到
	    		url.push('wurl');
	            url.push('mwurl');
	    	}
	        
	    }
	    return url;
	  
	},

	/**
	 * 在不同层级获取不同的质量度列,用于改变自定义列
	 * @return {Array<string>} 质量度类型
	 */
	getKeywordShowQ : function() {
		var _me = this;
		var _nav = _me.getContext('navLevel');
		var _device = _me.getContext('devicePrefer');
		var _showq = [];

		if (_nav != 'account') {
			if (_device == 'all') {
				_showq = ['pcshowq', 'mshowq'];
			}
			else if (_device == 'pc') {
				_showq = ['pcshowq'];
			}
			else {
				_showq = ['mshowq'];
			}
		}
		else {
			_showq = ['pcshowq', 'mshowq'];
		}

		return _showq;
	},
	/**
	 * 根据计划的设备属性来设置更多操作的内容
	 */
	setMoreOpt:function(){
	    var me = this;   
	    var devicePrefer = me.getContext('devicePrefer');
	    var navLevel = me.getContext('navLevel');
	    var devicecfgstat = me.getContext(navLevel + '_devicecfgstat');
	    var moreOpt = this.getContext('moreOpt');
	    if(navLevel == 'account' ){//账户层级且非白名单用户的时候，批量操作两种url,否则不提供url操作
	    	if(!nirvana.env.FCWISE_MOBILE_USER){
	    		moreOpt.splice(2,0,{
                text:"移动访问URL",
                value:'murl'
                })
	    	}
	    	else{
	    		moreOpt.splice(1,1);
	    	}
	    	
	    }
	    else{
	    	
	    	if(devicePrefer == 'all'){ //全部设备
	            moreOpt.splice(2,0,{
                text:"移动访问URL",
                value:'murl'
                })
	        }
	        else if(devicePrefer == 'mobile'){//仅移动
	             moreOpt.splice(1,1,{ 
                 text:"移动访问URL",
                 value:'url'  //仅移动的时候还是访问url，只不过是字面变了
                 })
	          }
	    }
	    
	     
         
         me.setContext('moreOpt',moreOpt); 
	     var select = ui.util.get('moreOpt');
	     select.options = moreOpt;//又踩到select控件的坑了，必选要设置options才能刷新
         select.repaint(select.main);
        //me.repaint();
	},
	
	onentercomplete : function(){
	    var me = this,
	    	controlMap = me._controlMap;

		//获取面包屑信息
		var crumbs=new nirvana.manage.crumbs(me);
		var navLevel = me.getContext('navLevel');
		var crumbsCallback = function(){//面包屑之后的回调函数 yll 13-1-6
		var devicePrefer = nirvana.manage.devicePrefer[me.getContext(navLevel+'_deviceprefer')];
            me.setContext('devicePrefer',devicePrefer);
            me.setMoreOpt();//重新设置更多操作  账户层级跟以前一样
			me.getWordData();
			// wanghuijun 2012.11.30
			// 模块化实践，ao按需加载
			$LAB.script(nirvana.loader('proposal'))
				.wait(function() {
					me.changeAoParams();
					nirvana.aoControl.init(me);
				});
			// wanghuijun 2012.11.30
			
		};
		// wangkemiao 2012.12.06
		// 因为需要context中的planid等信息，所以在callback中执行
		crumbs.getCrumbsInfo(crumbsCallback);
		
		
		//nirvana.manage.UserDefine.dialog.hide();
		
		
		
		//me.initSearchComboTip();
		nirvana.manage.SearchTipControl.initSearchComboTip(me);
		//恢复账户树状态
        nirvana.manage.restoreAccountTree(me);
		
		//批量下载 by liuyutong@baidu.com
		if(me.getContext("navLevel") == "account"){
			baidu.g('batchDownload_acct').appendChild(nirvana.manage.batchDownload.batchEL);
		}

		nirvana.aoPkgControl.popupCtrl.init();

        this.expe && this.expe.load();
	},
					
	onafterinitcontext : function(){
		nirvana.CURRENT_MANAGE_ACTION_NAME = 'keyword';
	},
						
	onleave : function(){
		nirvana.CURRENT_MANAGE_ACTION_NAME = '';
		//隐藏搬家历史浮层
		baidu.addClass(baidu.g('downLoadDeviceChange'), 'hide');
        this.expe && this.expe.dispose();
	},
	
	/**
	 *自定义列保存一个固定不变的基本副本
	 */
	baseUserDefineConfig: {
	    defaultCol : ["showword", "unitname", "planname", "wordstat", "bid", "wmatch", "pcshowq", "clks", "paysum", "shows", "trans", "avgprice"],
        all     : ["showword", "unitname", "planname", "wordstat", "bid", "wmatch", "pcshowq", "clks", "paysum", "shows", "trans", "avgprice", "clkrate", "showpay", "wurl"],
        show    : [
                        {key:"showword",   text:"关键词"},
                        {key:"paysum",     text:"消费"},
                        {key:"unitname",   text:"推广单元"},
                        {key:"shows",      text:"展现"},
                        {key:"planname",   text:"推广计划"},
                        {key:"clks",       text:"点击"},
                        {key:"wordstat",   text:"状态（启用/暂停）"},
                        {key:"avgprice",   text:"平均点击价格"},
                        {key:"bid",        text:"出价"},
                        {key:"clkrate",    text:"点击率"},
                        {key:"pcshowq",    text:"计算机质量度"},
                        {key:"wmatch",     text:"匹配模式"},
                        {key:"wurl",       text:"访问URL"},
						{key:"trans",      text:"转化(网页)"},
                        {key:"showpay",    text:"千次展现消费"}
                    ]},
     /**
      *不同计划属性的时候，关键词的自定义列是不同的  yanlingling
      */               
    adaptUseDefineConfig:function() {
        var me = this;
        var url = me.getKeywordUrl();
        var _showq = me.getKeywordShowQ();
        var ud = nirvana.manage.UserDefine;
        var configDefine = baidu.object.clone(me.baseUserDefineConfig);
        var all = configDefine.all;
        var show = configDefine.show;

        var _urlIndex = me.getIndex(show, 'wurl');

        if (url.length == 1 && url[0] == 'mwurl') {//移动
            //实际数据库还是wurl
            show.splice(_urlIndex, 1, {
                key : 'wurl',
                text : '移动访问URL'
            });
            
            me.setContext('onlyM', true);
            nirvana.manage.wordTableField.wurl.title = '移动访问URL';
        } 
        else if (url.length == 2) {//pc+m都显示
            all.splice(all.length, 0, 'mwurl');
            show.splice(_urlIndex + 2, 0, {
                key : 'mwurl',
                text : '移动访问URL'
            });
            nirvana.manage.wordTableField.wurl.title = '访问URL';
        }
        else {//pc 仅pc 跟基本设置一样
           nirvana.manage.wordTableField.wurl.title = '访问URL';
        }
		
		// 设置自定义列的计算机质量度及移动质量度的显示
		var _index = baidu.array.indexOf(all, 'pcshowq');
		var _showIndex = me.getIndex(show, 'pcshowq');
		var _default = configDefine.defaultCol;
		var _defaultIndex = baidu.array.indexOf(_default, 'pcshowq');

        if (_showq.length == 1 && _showq[0] == 'mshowq') {
        	all.splice(_index, 1, 'mshowq');
        	_default.splice(_defaultIndex, 1, 'mshowq');
        	show.splice(_showIndex, 1, {
        		key : 'mshowq',
        		text : '移动质量度'
        	})
        }
        else if (_showq.length == 2) {
        	all.splice(_index + 1, 0, 'mshowq');
        	show.splice(_showIndex + 2, 0, {
        		key : 'mshowq',
        		text : '移动质量度'
        	})
        }
        
		ud.setConfig('word', configDefine); 
    } ,

    /**
     * 获取字段在自定义列的位置
     * @param {Array<Object>} configDefine.show
     * @param {string} name 字段名
     * @return {number} 位置 从0开始
     */
    getIndex : function(array, name) {
    	return baidu.array.indexOf(array, function(item) {
			return item.key == name;
		})
    },
     
	getWordData: function(){
	    var me = this, 
		    param = {
				starttime: me.getContext('startDate'),
				endtime: me.getContext('endDate'),
				limit: nirvana.limit,
				onSuccess: me.getWordDataHandler(),
				onFail: function(){
					ajaxFailDialog();
				}
			};
		var controlMap = me._controlMap;
		//如果存在showword模糊查询
		var showword = me.getContext('query');
		if (showword) {
			param.showword = showword;
		}
		if (me.getContext("unitid")) {
			param.condition = {
				unitid: [me.getContext("unitid")]
			};
		}
		else 
			if (me.getContext("planid")) {
				param.condition = {
					planid: [me.getContext("planid")]
				};
		} 
		var navLevel = me.getContext('navLevel'); 
		
		me.adaptUseDefineConfig();//先改成正确的自定义列配置，跟计划属性相关

		// 因为关键词层级在这里又又又重新搞了一次自定义列
		// 因此只好把融合的自动初始化放到了这里
		// 2013.03.22 by Leo Wang(wangkemiao@baidu.com)
		nirvana.fuseSuggestion.controller.init('word',
			{
				starttime: me.getContext('startDate'),
            	endtime: me.getContext('endDate')
			}, 
			function() {
				nirvana.manage.UserDefine.getUserDefineList('word', function(){
					var ud = nirvana.manage.UserDefine,
					    localList = [],
					    i, len, data = [];
					var nav = me.getContext('navLevel');
					var devicePrefer = me.getContext('devicePrefer');
		            var devicecfgstat = me.getContext(nav + '_devicecfgstat');
		            for (i = 0, len = ud.attrList['word'].length; i < len; i++) {
						if((nav == 'account')  
						    && ud.attrList['word'][i] =='mwurl'
						    && nirvana.env.FCWISE_MOBILE_USER){//白名单账户层级不显示移动url
						    continue;
						}
						
		                else {
		                    if(
		                    	((devicePrefer == 'pc' ||devicePrefer == 'mobile') && ( ud.attrList['word'][i] == 'mwurl') )//仅移动的时候，实际还是访问Url，仅仅是字面不一样
		                    	|| ( devicePrefer == 'pc' && ud.attrList['word'][i] == 'mshowq' ) // pc是没有mshowq
		                    	|| ( devicePrefer == 'mobile' && ud.attrList['word'][i] == 'pcshowq' ) // m是没有pcshowq
	                    	) {
		                        continue;
		                    } 
		                }

						localList[localList.length] = ud.attrList['word'][i];
						data.push(nirvana.manage.wordTableField[localList[localList.length-1]]);
					}
					me.currentFileds = data;
					
					if(!me.getContext('userDefineInit')){//自定义列初始化时在getUserDefineList里面做的，只有初始化之后才能绑定该事件 yll
					   controlMap.userDefine.onclick = nirvana.manage.UserDefine.getUserDefineHandler(me, 'word', 'wordTableList');
		        	   me.setContext('userDefineInit',true);
		        	 }
		          	
					//wctrl:高级短语
					localList.push('winfoid', 'unitid', 'planid', 'unitbid', 'wordid', 'shadow_wurl','shadow_mwurl', 'pausestat', 'activestat', 'wctrl');
					
					/**
					 * 汇总数据需要， MOD BY zhouyu
					 * avgprice——高级查询：平均点击价格
					 * showqstat——高级查询：质量度
					 * wordstat——组合查询：状态
					 */

					 // 跟着showqstat，质量度司南增加两个字段ideaquality, pageexp
					 //无线url新增 mwurl,否则在用户没有勾选移动url自定义列的时候， 批量修改murl的时候总出没有设置murl，实际用户已经设置了 yanlingling
			
	            	var extraCols = ['shows', 'clks', 'paysum', 'trans', 'wurl', 'bid', 'avgprice', 'showqstat', 'ideaquality', 'pageexp', 'wordstat','mwurl'], extraItem;
					for (var k = 0, l = extraCols.length; k < l; k++) {
						extraItem = extraCols[k];
						if (baidu.array.indexOf(localList, extraItem) == -1) {
							localList.push(extraItem);
						}
					}
					
					//高级需要补充的列
					var scValue = me.getContext('searchShortcutValue');
					for (var key in scValue) {
						if (scValue[key] == '1') {
							switch (key) {
								case 'scutKeypoint': //高消费，高操作
									if (baidu.array.indexOf(localList, 'paysum') == -1) {
										localList.push('paysum');
									}
									localList.push('bidoptcount');
									break;
								case 'scutHPpRate': //高左侧展现概率
									localList.push('pprate');
									break;
								case 'scutHClkRate': //高点击率
									if (baidu.array.indexOf(localList, 'clkrate') == -1) {
										localList.push('clkrate');
									}
									break;
							}
						}
					}

					//还原我的查询需要补充的列
					var tablefilter = me.getContext('filterCol');
					for (var key in tablefilter) {
						if (tablefilter[key].on && baidu.array.indexOf(localList, key) == -1) {
							localList.push(key);
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
						fbs.material.getAttribute('wordinfo', localList, param);
					}
				});
			}
		);
	},
	newTableModel: new nirvana.newManage.TableModel({
		level: 'keyword'
	}),
		
	//获取关键词数据成功回调函数	
	getWordDataHandler: function(){
		var me = this;
		return function(data){
		    var status = data.status, 
			    listdata = [],
			    exceed = false;
			nirvana.manage.UPDATE_ID_ARR = [];
			nirvana.manage.NOW_DATA = data;
			nirvana.manage.NOW_TYPE = 'word';
			
			if (status == 800) { // 数据量过大
				exceed = true;
			}
			else {
				listdata = data.data.listData;
			}
			//如果忽略状态，表格也得清状态    by linfeng 2011-07-05
			nirvana.manage.resetTableStatus(me, "wordTableList");
			
			var field = me.getContext("orderBy"), 
				order = me.getContext("orderMethod"),
				result;
			//根据状态和Query筛选数据
			result = nirvana.manage.FilterControl.filterData(me, 'wordstat', listdata);
			//表格筛选
			result = nirvana.manage.FilterControl.tableFilterData(me, result);
			//根据context值进行排序
			result = nirvana.manage.orderData(result, field, order);
			nirvana.manage.tab.renderTabCount(me,result.length);
			//恢复这里，getMonitorFilterResultHandler需要获取
			me.setContext('keywordData', result);
			
			if (result.length <= 50 && nirvana.manage.SearchTipControl.lastSearchControl != '') {
				var kIdForLog = [], stc = nirvana.manage.SearchTipControl;
				for (var i = 0, l = result.length; i < l; i++) {
					kIdForLog.push(result[i].winfoid);
				}
				NIRVANA_LOG.send({
					filter_idlilst: kIdForLog,
					filter_trigger: stc.lastSearchControl,
					filter_condition: stc.searchCondition
			});
			}
			//一键监控
			var monitorFilterResultButton = ui.util.get('MonitorFilterResult');
			if (monitorFilterResultButton) {
				monitorFilterResultButton.disable(!(result.length > 0));
			}
			//me.setTab(result.length);
		
			
			
			me.setNoDataHtml(exceed);
			me.processData(result);
			//显示实验状态 和 监控文件夹图标
            me.showStatIcon();
			nirvana.manage.noDataHtmlClick(me);

			// 融合更新状态+事件绑定，需要注意不要重复绑定事件
			if(me._controlMap.wordTableList) {
				nirvana.fuseSuggestion.controller.update(me._controlMap.wordTableList.main);
			}
		}
	},
		
			
	
	
	//nodata context 设置
	setNoDataHtml: function(exceed){
		var me = this, 
			status = me.getContext('status'), 
			query = me.getContext('query'), 
			advanceFilter = me.getContext('searchAdvanceValue'), 
			shortcutFilter = me.getContext('searchShortcutValue'), 
			filterCol = me.getContext('filterCol');
		
		if (exceed) {
			me.setContext("noDataHtml", FILL_HTML.EXCEED);
			return;
		}
		if ((!status || status == '100') && (!query || query == '')) {
			me.setContext("noDataHtml", FILL_HTML.WORD_NO_DATA);
			if (advanceFilter) {
				for (var key in advanceFilter) {
					//遍历所有高级条件
					if (advanceFilter[key] != '-1') {
						me.setContext("noDataHtml", FILL_HTML.SEARCH_NO_DATA);//有一个search条件就可以return啦
						return;
					}
				}
			}
			if (shortcutFilter) {
				for (var key in shortcutFilter) {
					//遍历所有推荐查询
					if (shortcutFilter[key] == '1') {
						me.setContext("noDataHtml", FILL_HTML.SEARCH_NO_DATA);
						return;
					}
				}
			}
			if (!me.arg.queryMap.ignoreState) {
				for (var field in filterCol) {
					//遍历所有筛选条件
					if (filterCol[field].on) {
						me.setContext("noDataHtml", FILL_HTML.SEARCH_NO_DATA);
						return;
					}
				}
			}
		}
		else {
			me.setContext("noDataHtml", FILL_HTML.SEARCH_NO_DATA);
		}
		
		nirvana.manage.noDataHtmlPlus(me);
	},
	
	//添加关键词按钮点击事件响应
	addKeywordHandler: function(){
		var me = this;
		return function(){
			var unitid = me.getContext('unitid');
			// 如果是在单元层级，首先获取单元下关键词的数量，如果达到上限，则不能添加
			if (unitid) {
				fbs.material.getCount({
					countParam: {
						mtlLevel: 'unitinfo',
						mtlId: unitid,
						targetLevel: 'wordinfo'
				},
					onSuccess: function(response){
						if (response.data >= nirvana.config.NUMBER.KEYWORD.MAX) { //数量到达上限
							ui.Dialog.alert({
								title: '通知',
								content: nirvana.config.ERROR.KEYWORD.ADD['upperlimit']
			});
						}else {
							me.openAddwordDialog();
						}
				},
					onFail: function(){
						ajaxFailDialog();
					}
			});
		}
			else {
				me.openAddwordDialog();
			}
		}
	},
	
	getImportMaterials: function() {
		var me = this, selectedList = me.selectedList, 
			len = selectedList.length, 
			keywordData = me.getContext('keywordListData'), 
			res = {
				level: 'keyword',
				navLevel: me.getContext('navLevel') || '',
				data: []
			};
        // kr 会用到搜索词
        if (me.getContext('query')) {
            res.query = me.getContext('query');
        }
		if (selectedList && len > 0) {
			for (var i = 0; i < len; i++) {
				res.data.push(keywordData[selectedList[i]]);
			}
		}

		// 如果有远征，也需要带入
        var expeData = this.expe && this.expe.getSelectedKeywords();
        if (expeData) {
            res.newKeywords = fc.map(expeData, function(item) { return item.word; });
        }
        
		return res;
	},
	//打开添加关键词浮出框
	openAddwordDialog: function() {
		var	planid = this.getContext('planid'), 
            unitid = this.getContext('unitid'),
            res = this.getImportMaterials();
		
        nirvana.manage.createSubAction.keyword({
			planid: planid,
			unitid: unitid,
			queryMap: {
				importMaterials: res
			},
			popup_entry: 'kr_wordlist_addwords',//入口标识，用于监控
			isInNewFlow: true,
			isInKeyword: true
		});
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
		start = (start > 0) ? start : 0;
		for (i = start; i < l; i++){
			rs.push(result[i]);
		}
		//翻页控件用数据
		me.setContext('totalNum', len);
		me.setContext('pageNo', pageNo);
		me.setContext('totalPage',totalPage);
		//table用数据	
		me.setContext('tableFields', me.currentFileds);
		me.setContext('keywordListData', rs); //table用数据
		
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
		//getRenderDuration();
		me.repaint();
		
		if (me.arg.refresh) {
			//即时更新状态 by liuyutong@baidu.com
			var updateParam = {};
			updateParam.starttime = me.getContext('startDate');
			updateParam.endtime = me.getContext('endDate');
			updateParam.limit = nirvana.limit;
			updateParam.onSuccess = function(data) {
				var _data = data.data.listData;
				var _tempData = {};
				var _len = _data.length;
				
				for (var i = 0; i < _len ; i ++) {
					_tempData[_data[i].winfoid] = _data[i];
				} 
				fbs.material.ModCache('wordinfo', 'winfoid', _tempData);

				me.setContext('statRefresh',true);
				me.getWordData();
			}
			if (me.getContext("unitid")) {
				updateParam.condition = {
					unitid: [me.getContext("unitid")]
				};
			}
			else 
				if (me.getContext("planid")) {
					updateParam.condition = {
						planid: [me.getContext("planid")]
					};
				}
			if (!me.getContext('statRefresh')) {
				fbs.material.getAttribute('wordinfo', ['wordstat:update'], updateParam);
			}
			else {
				me.setContext('statRefresh', false);
			}
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
				level: 'wordinfo',
				command: 'start',
				signature: '',
				condition: me.getAoCondition()
			});
		} else { // 清除搜索
			if (me.getContext('unitid')) { // 单元层级
				aoControl.changeParams({
					level: 'unitinfo',
					command: 'start',
					signature: '',
					condition: {
						planid: [me.getContext('planid')],
						unitid: [me.getContext('unitid')]
					}
				});
			} else if (me.getContext('planid')) { // 计划层级
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
	
		
	//获取所有关键词id及其对应计划和单元id
	getAoCondition: function(){
		var me = this,
			listData = me.getContext("keywordListData"),
			condition = {},
			planids = [],
			unitids = [],
			wordids = [];
		 for(var i = 0, len = listData.length; i < len; i++){
            planids[planids.length] = listData[i].planid;
			unitids[unitids.length] = listData[i].unitid;
			wordids[wordids.length] = listData[i].winfoid;
         }
		 condition.planid = planids;
		 condition.unitid = unitids;
		 condition.winfoid = wordids;
		 return condition;
	},
	
	selectListHandler : function (selected) {
        var me = this,
            controlMap = me._controlMap; 
        return function (selected) {
            var enabled = selected.length > 0,
				modBid = controlMap.modBid,
				modWmatch = controlMap.modWmatch,
                runPause = controlMap.runPause,
                moreOpt = controlMap.moreOpt,
                activeWord = controlMap.activeWord,
                monitor = controlMap.monitor;
            me.selectedList = selected;
            runPause.disable(!enabled);
            //调整启用暂停下拉框 的disabled状态
            if(enabled) {
                me.setRunPauseOptionsState(selected);
            }
			//调整激活按钮 的disabled状态
			me.setActiveState(selected);
            moreOpt.disable(!enabled);
			monitor.disable(!enabled);
			modBid.disable(!enabled);
			modWmatch.disable(!enabled);

            // 读写分离，待升级之后不用这种方式了
            // by Leo Wang
			nirvana.acc.accService.processEntrances('manage/keyword');
        }  
        
    },
	
    /**
     * 设置启用暂停下拉框的状态
     */
    setRunPauseOptionsState : function (selectedList) {
        var me = this,
            i = 0, len = selectedList.length,
            data = me.getContext('keywordListData'),
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
	
    /**
     * 设置激活按钮的状态
     */
	setActiveState : function(selectedList) {
        var me = this,
            i = 0, len = selectedList.length,
            data = me.getContext('keywordListData'),
            disabled = true,
            activeWord = me._controlMap.activeWord;
        
        for (; i < len; i++) {
            if (data[selectedList[i]].activestat == '1'){//待激活状态
                disabled = false;//可以设置激活
                break;
            }
        }
		
        activeWord.disable(disabled);
	},
    
    operationHandler : function () {
        var me = this,
            controlMap = me._controlMap;

        return function (selected) {
            var title = '',
			    msg = '',
				len = me.selectedList.length;
			
            switch (selected) { // 选中的操作项
                case 'start' :
                    title = '启用关键词';
                    msg = '您确定启用所选的关键词吗？';
                    break;
                case 'pause' :
                    title = '暂停关键词';
                    msg = '您确定暂停所选的关键词吗？';
                    break;
                case 'delete' :
                    title = '删除关键词'; 
                    msg = '您确定删除所选的' +len+'个关键词吗？删除操作不可恢复。';
                    break;
				// 转移关键词
                case 'transfer' :
					nirvana.util.openSubActionDialog({
						id : 'KeywordTransferDialog',
						title : '转移关键词',
						width : 440,
						actionPath : 'manage/keywordTransfer',
						params : {
							winfoid : me.getSelected('winfoid'),
							wordlist : me.getSelected('showword')
						},
						onclose : function(){
							// 每次关闭都reload，清cache的逻辑在子action逻辑里实现
							er.controller.fireMain('reload', {});
						}
					});
					break;
				case 'url' :
					nirvana.util.openSubActionDialog({
						id : 'KeywordModUrlDialog',
						title : '访问URL',
						width : 440,
						actionPath : 'manage/modWordUrl',
						params : {
							winfoid : me.getSelected('winfoid'),
							wurl	: me.getSelected('wurl'),
							shadow_wurl : me.getSelected('shadow_wurl'),
							unitid : me.getSelected('unitid')
						},
						onclose : function(){
						}
					});
					break;
				case 'murl' :
                    nirvana.util.openSubActionDialog({
                        id : 'KeywordModMUrlDialog',
                        title : '移动访问URL',
                        width : 440,
                        actionPath : 'manage/modWordUrl',
                        params : {
                            winfoid : me.getSelected('winfoid'),
                            mwurl    : me.getSelected('mwurl'),
                            shadow_wurl : me.getSelected('shadow_mwurl'),
                            unitid : me.getSelected('unitid')
                        },
                        onclose : function(){
                        }
                    });
                    break;  	
            }
			if (selected != "url" && selected != "murl" && selected != "transfer") {
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
                winfoid = me.getSelected('winfoid'),
				needRefreshSideNav = false; 
				            
                switch (dialog.args.optype) {
                    case 'start' :
                        func = fbs.keyword.modPausestat;
                        pauseStat = 0;
                        break;
                    case 'pause' :
                        func = fbs.keyword.modPausestat;
                        pauseStat = 1;
                        break;
                    case 'delete' : 
                        func = fbs.keyword.del;
						needRefreshSideNav = true;
    					break;
                }
				
                var param = {
					winfoid: winfoid, 
                	onFail: me.operationFailHandler()
				};
						 
				if (!needRefreshSideNav) {
					param.onSuccess = function(response){
						if (response.status != 300) {
							var modifyData = response.data;
							fbs.avatar.getMoniWords.ModCache("winfoid", modifyData);
							fbs.material.ModCache('wordinfo', "winfoid", modifyData);
							me.refresh();
						}
					};
				}else{
					param.onSuccess = function(response){
						if (response.status != 300) {
							//ui.util.get('SideNav').refreshPlanList();
							ui.util.get('SideNav').refreshUnitList(me.getSelected('planid'));
							
							fbs.material.clearCache('wordinfo');
							fbs.avatar.getMoniFolders.clearCache();
							fbs.avatar.getMoniWords.clearCache();
							me.refresh();
						}
					};
				}
                if (typeof pauseStat != 'undefined') {
                    param.pausestat = pauseStat;
                }
    
                func(param);
                
            }
    },

    operationFailHandler : function () {
        var me = this;
        return function (data) {
            ajaxFailDialog();            
        }
    },
	
	/**
	 * 获取选中行的数据
	 * @param {Object} id planid等需要得到的数据
	 * @return {Array} ids [planid, planid……]
	 */
    getSelected : function (id) {
        var me = this,
            selectedList = me.selectedList,
            data = me.getContext('keywordListData'),
            i, len, ids = [];
		if (baidu.lang.isArray(id)) {
			for (i = 0, len = selectedList.length; i < len; i++) {
				var dat = {};
				for (var j = 0, l = id.length; j < l; j++) {
					if (id[j] == "bid"){
						//关键词出价可能采用单元出价，需要特殊处理 by linzhifeng@baidu.com
						if (data[selectedList[i]]["bid"]) {
							dat[id[j]] = data[selectedList[i]]["bid"];
						}
						else {
							dat[id[j]] = data[selectedList[i]]["unitbid"];
						}
					}else{
						dat[id[j]] = data[selectedList[i]][id[j]];
					}
				}
				ids.push(dat);
			}
		}
		else {
			if (id == "bid") {
				//关键词出价可能采用单元出价，需要特殊处理 by linzhifeng@baidu.com
				for (i = 0, len = selectedList.length; i < len; i++) {
					if (data[selectedList[i]]["bid"]) {
						ids.push(data[selectedList[i]]["bid"]);
					}
					else {
						ids.push(data[selectedList[i]]["unitbid"]);
					}
				}
			}
			else {
				for (i = 0, len = selectedList.length; i < len; i++) {
					ids.push(data[selectedList[i]][id]);
				}
			}
		}

        return ids;
    },
	
	/**
	 * 判断所选的关键词是否都采用单元出价
	 * author:linzhifeng@baidu.com
	 */
	isUseUnitbid : function(){
		var me = this,
            selectedList = me.selectedList,
            data = me.getContext('keywordListData'),
            i, len, isUse = true;
		for (i = 0, len = selectedList.length; i < len; i++) {
			if (data[selectedList[i]]["bid"]) {
				//多选时只要有一个没用就都没用，显示各自价格
				isUse = false;
				break;
			}
		}
		return isUse;
	},
	
	/**
     * 批量修改出价
     * @returns {Function} 弹窗显示函数
     */
	modBidClickHandler: function(){
		var me = this,
            controlMap = me._controlMap;
        return function(){
			nirvana.util.openSubActionDialog({
				id: 'modifyWordBidDialog',
				title: '关键词出价',
				width: 440,
				actionPath: 'manage/modWordPrice',
				
				params: {
					winfoid : me.getSelected('winfoid'),
					bid : me.getSelected('bid'),
					unitbid : me.getSelected('unitbid'),
					isUseUnitbid : me.isUseUnitbid(),
					name : me.getSelected('showword'),
					showmPriceFactor : true,
					planids : me.getSelected('planid')
				},
				onclose: function(){
				}
			});
			clearTimeout(nirvana.subaction.resizeTimer);
			baidu.g('ctrldialogmodifyWordBidDialog').style.top = baidu.page.getScrollTop() + 200 +'px';
		}
	},
	
	/**
     * 批量修改匹配方式
     * @returns {Function} 弹窗显示函数
     */
	modWmatchClickHandler: function(){
		var me = this,
            controlMap = me._controlMap;
        return function(){
			nirvana.util.openSubActionDialog({
				id: 'modifyWordWmatchDialog',
				title: '匹配方式',
				width: 440,
				actionPath: 'manage/modWordWmatch',
				params: {
					winfoid : me.getSelected('winfoid')
				},
				onclose: function(){
				}
			});
			clearTimeout(nirvana.subaction.resizeTimer);
			baidu.g('ctrldialogmodifyWordWmatchDialog').style.top = baidu.page.getScrollTop() + 200 +'px';
		};
	},
	
	
	
    /**
     * 点击激活时进行的提示操作
     * @returns {Function} 弹窗显示函数
     */ 
    activeClickHandler : function () {
        var me = this,
            controlMap = me._controlMap;
        return function () {
            ui.Dialog.confirm({
                    title : '激活关键词',
                    content : '您确定激活所选择的关键词吗?',
                    onok : me.activeHandler()
            });
        };
    },
    /**
     * 激活所选的
     * @returns {Function} 激活所选函数
     */
    activeHandler: function() {
        var me = this,
            controlMap = me._controlMap;
        return function (dialog) {
            var dialog = dialog,
                func = fbs.keyword.active,//需要调用的接口函数
                winfoid = me.getSelected('winfoid'),
                param = {winfoid: winfoid, 
                         activestat : '0',
                         onSuccess: function(response){
						 	if (response.status != 300) {
						 		var modifyData = response.data;
						 		fbs.avatar.getMoniWords.ModCache("winfoid", modifyData);
						 		fbs.material.ModCache('wordinfo', "winfoid", modifyData);
						 		me.refresh();
						 	}
						 }, 
                         onFail: me.operationFailHandler()};            
                
                func(param);
            }
    },
    

	/**
	 * 监控关键词
	 */
	monitorClickHandler: function() {
        var me = this,
            controlMap = me._controlMap;
        return function(dialog){
			nirvana.util.openSubActionDialog({
				id: 'monikeywordDialog',
				title: '监控该关键词',
				width: 480,
				actionPath: 'manage/moniKeyword',
				params: {
					wordChosen : me.getSelected(["winfoid","showword","wmatch","wctrl"])
				},
				onclose: function(){
				
				}
			});
			clearTimeout(nirvana.subaction.resizeTimer);
			baidu.g('ctrldialogmonikeywordDialog').style.top = baidu.page.getScrollTop() + 135 +'px';
		}
    },
    
    /**
     * 表格行内操作事件代理器
     */
    getTableInlineHandler: function() {
        var me = this;
        return function (e) {
            var event = e || window.event,
                target = event.target || event.srcElement,
				logParams = {},
				level,
				type;
			if(target.getAttribute('level')){//add by liuyutong@baidu.com
				level = target.getAttribute('level');
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
				while(target  && target != ui.util.get("wordTableList").main){
					if(target.className && target.className == 'status_op_btn'){
						me.doInlinePause(target)
						break;
					}
					if(baidu.dom.hasClass(target,"edit_btn")){
						var current = nirvana.inline.currentLayer;
						if (current && current.parentNode) {
							current.parentNode.removeChild(current);
						}
						type = target.getAttribute("edittype");
						switch(type){
							case "bid":
								me.inlineBid(target);
								logParams.target = "editInlineBid_btn";
								break;
							case "wmatch":
								me.inlineWmatch(target);
								logParams.target = "editInlineWmatch_btn";
								break;
							case "wurl":
								me.inlineWurl(target);
								logParams.target = "editInlineWurl_btn";
								break;
							case "mwurl":
                                me.inlineWurl(target,true);
                                logParams.target = "editInlineMWurl_btn";
                                break;
							case "wctrl":
								//关闭监控文件夹的浮出层
								ui.Bubble.hide();
								me.inlineWctrl(target);
								logParams.target = "editInlineWctrl_btn";
								break;
						}
						break;
					}
					
					//小灯泡 by Tongyao
					if(baidu.dom.hasClass(target, 'status_icon')){
						var _tempParams = JSON.parse(target.getAttribute('data'));
						var _statNode = target.parentNode.parentNode;
						var _class = _statNode.className;
						var _stat = _class.match(/wordstatus_(\d+)/);

						_tempParams.stat = _stat[1];
						
						logParams.target = "statusIcon_btn";
						manage.offlineReason.openSubAction({
							type : 'wordinfo',
							params : JSON.stringify(_tempParams)
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
	 * 行内修改出价
	 * @param {Object} target
	 */
	inlineBid:function(target){
		var me = this,
			parent = target.parentNode,
			winfoid = parent.getAttribute("winfoid"), 
			item = me.getLineData(target);
	    var devicePrefer = me.getContext('devicePrefer');
	    var nav = me.getContext('navLevel');
	    //var mPriceFactor =   me.getContext(nav+'_mPriceFactor');
	    if (item.bid) {
			var bid = baidu.number.fixed(item["bid"]);
		}
		else {
			var bid = baidu.number.fixed(item["unitbid"]);
		}
	  

	    if(nav == 'plan'){
	    	 var mPriceFactor =   me.getContext(nav+'_mPriceFactor');
	    	 me.modBid(bid,winfoid,parent,item.planid,devicePrefer,mPriceFactor);
	    }
	    else{
	    	 me.modBid(bid,winfoid,parent,item.planid);
	    }
			
		
	},
	modBid:function(bid,winfoid,parent,planid,devicePrefer,mPriceFactor){
		var me = this;
		var okHanler = function(wbid){
				return {
					func: fbs.keyword.modBid,
					validate: me.bidValidate(wbid),
					param: {
						winfoid: [winfoid],
						bid: wbid,
						onSuccess: function(data){
							if (data.status != 300) {
								var modifyData = {};
								modifyData[winfoid] = {
									"bid": wbid
								};
								var pausestat = data.data[winfoid];
								for (var item in pausestat) {
										modifyData[winfoid][item]= pausestat[item];
								}
								fbs.avatar.getMoniWords.ModCache("winfoid", modifyData);
								fbs.material.ModCache('wordinfo', "winfoid", modifyData);
								me.refresh();
							}
						}
					}
				}
		};
		var param = {
			type: "text",
			value: bid,
			id: "bid" + winfoid,
			target: parent,
			action: "modWordBid",
			showmPriceFactor : true,
			planid : planid,
			
			//html : 
			okHandler: okHanler
		}
		if(devicePrefer == '0' || devicePrefer == 'all'){
			param.mPriceFactor = mPriceFactor;//全部设备的时候，直接把出价比传给行内出价模块
		}
		else if(devicePrefer == '2' || devicePrefer == 'mobile'){
			param.showmPriceFactor = false; //移动设备不显示出价比
		}
		nirvana.inline.createInlineLayer(param);
	},
	
	bidValidate: function(bid){
		var me = this;
		return function(){
			if(bid == "null"){
				baidu.g("errorArea").innerHTML = nirvana.config.ERROR.KEYWORD.PRICE[606];
				return false;
			}
			return true;
		}
	},
    
	/**
	 * 行内修改匹配方式
	 * @param {Object} target
	 */
	inlineWmatch:function(target){
		var me = this,
			parent = target.parentNode,
			winfoid = parent.getAttribute("winfoid"), 
			wmatch = me.getLineData(target).wmatch;
		nirvana.inline.createInlineLayer({
			type: "select",
			value: wmatch,
			id: "wmatch" + winfoid,
			target: parent,
			datasource:[{
				text:"精确",
				value:"63"
			},{
				text:"短语",
				value:"31"
			},{
				text:"广泛",
				value:"15"
			}],
			okHandler: function(match){
				return {
					func: fbs.keyword.modWmatch,
					param: {
						winfoid: [winfoid],
						wmatch: match,
						onSuccess: function(data){
							if (data.status != 300) {
								var modifyData = {};
								modifyData[winfoid] = {
									"wmatch": match
								};
								fbs.avatar.getMoniWords.ModCache("winfoid", modifyData);
								fbs.material.ModCache('wordinfo', "winfoid", modifyData);
								me.refresh();
							}
						}
					}
				}
			}
		});
	},
	
	/**
	 * 行内修改url
	 * @param {Object} target
	 */
	inlineWurl:function(target,isMobile){
		var me = this,
			parent = target.parentNode,
			winfoid = parent.getAttribute("winfoid"),
			wurl = "",
			reqFunc = fbs.keyword.modWurl;
		var data = me.getLineData(target);
		var idPrefix = 'wurl';
		var nav = me.getContext('navLevel');
		if(isMobile==true){
		    if(typeof(data.shadow_mwurl) != 'undefined' && data.shadow_mwurl != ''){
			    wurl = data.shadow_mwurl;
		    }
		    else{
			    wurl = data.mwurl;
		   } 
		    idPrefix = 'mwurl';
		    if(me.getContext('devicePrefer')=='all'
		       || nav == 'account' ){//只有全部设备的时候才是真正修改mwurl,否是还是wurl,账户
		       	                     //账户层级有murl的时候，也就是全投用户的时候，实际设备属性还是all，只不过账户层级获取不到设备属性
		       reqFunc = fbs.keyword.modMWurl;  
		    }
		   
		}
		else{
		    if(typeof(data.shadow_wurl) != 'undefined'){
			wurl = data.shadow_wurl;
		}
		else{
			wurl = data.wurl;
		} 
		}
		
		
		if (wurl != "") {
			wurl = wurl.substr(7);
		}
		
		nirvana.inline.createInlineLayer({
			type: "text",
			prefix:"http://",
			value: wurl,
			id: idPrefix + winfoid,
			target: parent,
			okHandler: function(url){
				if(baidu.trim(url) == ""){
					url = "";
				}else{
					url = "http://" + baidu.trim(url);
				}
				return {
					func: reqFunc,
					param: {
						winfoid: [winfoid],
						wurl: url,//参数适配在接口里
						onSuccess: function(data){
							if (data.status != 300) {
								var modifyData = {};
								if(isMobile == true){
								  modifyData[winfoid] = {
                                    "shadow_mwurl": "http://" + fbs.util.removeUrlPrefix(url)
                                  }     
								}else{
								 modifyData[winfoid] = {
									"shadow_wurl": "http://" + fbs.util.removeUrlPrefix(url)
								}   
								}
								
								//修改为空的URL立即生效没有影子  by linzhifeng@baidu.com @2012-02-15
								if (url == "") {
								    if(isMobile == true){
								        modifyData[winfoid].mwurl = "";
								    }else{
								        modifyData[winfoid].wurl = "";
								    }
									
								};
								fbs.avatar.getMoniWords.ModCache("winfoid", modifyData);
								fbs.material.ModCache('wordinfo', "winfoid", modifyData);
								me.refresh();
							}
						}
					}
				}
			}
		});
	},
	
	/**
	 * 行内修改高短控制符
	 * @param {Object} target
	 */
	inlineWctrl:function(target){
		var me = this,
			parent = target.parentNode,
			winfoid = parent.getAttribute("winfoid"), 
			wctrl = me.getLineData(target).wctrl,
			showword = baidu.encodeHTML(me.getLineData(target).showword);
			
		nirvana.inline.createInlineLayer({
			type: "checkbox",
			defaultError : '<span class="gray">取消“勾选”，为仅匹配精确完全包含关键词的词组</span>',
			value: Math.abs(wctrl - 1),
			id: "wctrl" + winfoid,
			target: parent,
			title : '&quot;' + showword + '&quot;为短语匹配',
			okHandler: function(wctrl){
				wctrl = Math.abs(wctrl - 1);
				return {
					func: function(param){
						NIRVANA_LOG.send({
							action : 'modWctrl',
							winfoid	: winfoid,
							wctrl	:	wctrl
						});
						fbs.keyword.modWctrl(param);
					},
					param: {
						winfoid: [winfoid],
						wctrl: wctrl,
						onSuccess: function(data){
							if (data.status != 300) {
								var modifyData = {};
								modifyData[winfoid] = {
									"wctrl": wctrl
								};
								fbs.avatar.getMoniWords.ModCache("winfoid", modifyData);
								fbs.material.ModCache('wordinfo', "winfoid", modifyData);
								me.refresh();
							}
						}
					}
				}
			}
		});
		
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
			return this.getContext('keywordListData')[index];
		}
		return false;
	},
    
    /**
     * 根据行内元素,获取一行的ID数组
     */
    getRowIdArr : function (target) {
        var me = this,
            data = me.getContext('keywordListData'),
            idArr = [], index;
        index = nirvana.manage.getRowIndex(target);
        idArr.push(data[index].winfoid);
        return idArr;
    },
	
    /**
     * 执行行内启用暂停操作
     */
    doInlinePause : function (target) {
        var me = this,
            idArr, pauseSta,
            func = fbs.keyword.modPausestat,
			logParams = {
				target: "inlineRunPause_btn"
			};
        idArr = me.getRowIdArr(target);
        var pauseStat = nirvana.manage.getPauseStat(target,[0,1]);
		logParams.pauseStat = pauseStat;
		NIRVANA_LOG.send(logParams);
        nirvana.manage.inserLoadingIcon(target);
        func({
            winfoid: idArr,
            pausestat : pauseStat,
            onSuccess: function(response){
				var data = response;
				if (data.status != 300) {
					var modifyData = response.data;
					fbs.avatar.getMoniWords.ModCache("winfoid", modifyData);
					fbs.material.ModCache('wordinfo', "winfoid", modifyData);
					me.refresh();
				}
			}, 
            onFail: me.inlinePauseFailed
        });
    },

    /**
     * 行内启用暂停操作失败
     */
    inlinePauseFailed : function () {
        ajaxFailDialog();
    },
    
    /**
     * 组合查询
     *
     */
    getSearchHandler : function () {
        var me =  this;
        return function (condition) {
			
			var query = nirvana.util.firefoxSpecialURLChars.encode(condition.search),
			    hasChangeDate = false;
			
			if (nirvana.manage.validateCondition([query,condition.state + ''],condition.advance,(me.getContext('searchShortcutValue') || {}),me.getContext('filterCol'),6)){
				me.setContext('query', query);
	            me.setContext('status', condition.state + '');
	            me.setContext('queryType', condition.precise ? 'accurate' : 'fuzzy');
	            //设置组合筛选的context
	            //状态列表的设置
				me.setContext('searchQueryValue', condition.search);
	            me.setContext('searchStateValue', condition.state + '');
	            me.setContext('searchPreciseValue', condition.precise);
				me.setContext('searchAdvanceValue', condition.advance);
	            
				//如有有高级选项则改时间为最近7天
				if (condition.advance &&
				    (condition.advance.advSearchPaysum != -1 ||
				    condition.advance.advSearchPrice != -1 ||
					condition.advance.advSearchClk != -1 )){
					hasChangeDate = nirvana.manage.changeActionStoredDate(me,7);
				}
				
	            //查询时重置到第一页
	            me.setContext('pageNo',1);

                // 查询词字数大于1才触发远征
                if (query.length > 1) {
                    var planid = me.arg.queryMap.planid || me.getContext('planid');
                    nirvana.manage.getRegionInfo(function(region){
                        me.initExpedition(baidu.string.decodeHTML(query), region);
                    }, planid);
                } else if (me.expe) {
                    // 释放掉
                    me.expe.dispose();
                    delete me.expe;
                }
				
				nirvana.manage.SearchTipControl.initSearchComboTip(me);
				nirvana.manage.SearchTipControl.recordSearchcondition('search_combo');
	            me.refresh();
				if (hasChangeDate){
					ui.Bubble.triggerIdentity = baidu.g('ManagerCalendarBubble');
					ui.Bubble.show();
				}
	            //me.initSearchComboTip();
			}else{
				ui.Dialog.alert({
                    title: '筛选条件限制',
                    content: '您的筛选条件已达6项，请重新设定筛选条件'
                });
				var logParams = {};
				logParams.action = "filterExceed";
				NIRVANA_LOG.send(logParams);
			}
        };
    },
	
	/**
	 * 监控筛选结果
	 */
	getMonitorFilterResultHandler : function(){
		var me = this;
		return function(){
			var data = me.getContext('keywordData'),
	            i, len, ids = [];
			for (i = 0, len = data.length; i < len; i++) {
				ids.push({
					winfoid : data[i].winfoid,
					showword : data[i].showword,
					wmatch : data[i].wmatch,
					wctrl : data[i].wctrl
				});
			}
			nirvana.util.openSubActionDialog({
				id: 'monikeywordDialog',
				title: '监控该关键词',
				width: 480,
				actionPath: 'manage/moniKeyword',
				params: {
					wordChosen : ids
				},
				onclose: function(){
				
				}
			});
			clearTimeout(nirvana.subaction.resizeTimer);
			baidu.g('ctrldialogmonikeywordDialog').style.top = baidu.page.getScrollTop() + 135 +'px';
			return;
		}
	},

    initExpedition: function(query, regions) {
        var me = this;
        this.expe && this.expe.dispose();

        this.expe = new fc.module.Expedition(baidu.g('KrExpeInKeyword'), {
            entry: 'kr_expe_searchkeyword',
            planid: me.getContext('planid'),
            unitid: me.getContext('unitid'),
            onSuccess: function() {
                me.refresh();
            }
        });
        this.expe.load(query, regions);
        this.expe.onkropen = function(query, keywords) {
            var res = me.getImportMaterials();
            ToolsModule.open('kr', { 
                needReload: true, 
                queryMap: {
                    importMaterials: res
                }
            });
        };
    }
});

