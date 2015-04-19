/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    monitorDetail/monitorDetail.js
 * desc:    监控文件夹详情
 * author:  zhouyu
 * date:    $Date: 2011/01/06 $
 */

manage.monitorDetail = new er.Action({
	
	VIEW: 'monitorDetail',
		
	STATE_MAP : {
		startDate : '',
		endDate : '',
		status	: '100',
		query	:	'',
		queryType	: 'fuzzy',
		orderBy	:	'',
		orderMethod	: 	'',
		pageSize	:	50,
		customCol	:	'default',
		navLevel : 'keyword',
		folderid :"",
		aoEntrance : 'Monitor', // Planinfo,Unitinfo,Wordinfo,Ideainfo,Monitor,Nav
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
			datasource : '*pageSizeOption',
			value :'*pageSize'
		},
		
		pagination : {
			type : 'Page',
			total : '*totalPage'
		},
		
		wordTableList : {
			type : 'Table',
			select : 'multi',
			sortable : 'true',
			orderBy : '',
			order : '',
			noDataHtml : '*noDataHtml',
			dragable : 'true',
			colViewCounter : '13',
			scrollYFixed : 'true',
			fields: '*tableFields',
			datasource : '*keywordListData',
			subrow:'true',
			matchRow : 'true'
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
			callback();
		},
		
		tableFields : function(callback){
		    var me = this;
			if (!me.arg.refresh) {

                // 获得质量度的配置项
                var qStarField = qStar.getTableField(me, {
                    noun: true,
                    nounName: '质量度', // 20130124由质量度及优化难度修改为质量度，in project '质量度司南'
                    sortable: true,
                    width: 60,
                    minWidth: 85
                });

				nirvana.manage.monitorWordTableField = {
					showword: {
						content: function(item){
							var title = baidu.encodeHTML(item.showword), 
							    content = getCutString(item.showword, 30, ".."), 
								wmatch = item.wmatch, 
								wctrl = item.wctrl, 
								wctrl_auth = nirvana.env.AUTH['gaoduan'],
								html = [];
							
							if (wctrl_auth) {
								title = nirvana.util.buildShowword(title, wmatch, wctrl);
								content = nirvana.util.buildShowword(content, wmatch, wctrl);
							}
							if (wctrl_auth && wmatch == 31) {
								html[html.length] = '<div class="edit_td" winfoid="' + item.winfoid + '">';
							}
							html[html.length] = '<span title="' + title + '">' + content + '</span>';
							if (wctrl_auth && wmatch == 31) { //短语
								html[html.length] = '<a class="edit_btn" edittype="wctrl" title="短语匹配模式设置"></a>';
							}
							html[html.length] = '</span>';
							if (wctrl_auth && wmatch == 31) {
								html[html.length] = '</div>';
							}
							return html.join('');
						},
						locked: true,
						sortable : true,
						field : 'showword',
						title: '关键词',
						subEntry : true,
						width: 130,
						subEntryTipOpen : '点击查看通过本关键词触发的创意'
					},
					unitname : {
						content: function(item){
							var title = baidu.encodeHTML(item.unitname),
								content = getCutString(item.unitname,30,".."),
								html = '<a title="' + title + '" href="#/manage/keyword~ignoreState=1&navLevel=unit&unitid=' + item.unitid + '">' + content + '</a>';
							if(item.unitstat>0)
								html+='<span class="moni_stat_yellow"></span>';
							return html;
						},
						title: '推广单元',
						sortable : true,
						field : 'unitname',
						width: 100
					},
					planname : {
						content: function(item){
							var title = baidu.encodeHTML(item.planname),
								content = getCutString(item.planname,30,".."),
								html = '<a  title="' + title + '" href="#/manage/unit~ignoreState=1&navLevel=plan&planid=' + item.planid + '">' + content + '</a>';
							if(item.planstat==1||item.planstat==2)
								html +='<span class="moni_stat_yellow"></span>';
							if(item.planstat==11||item.planstat==3)
								html +='<span class="moni_stat_red"></span>';
							return html;
						},
						title: '推广计划',
						sortable : true,
						field : 'planname',
						width: 100
					},
					wordstat: {
						content: function (item) {// by liuyutong@baidu.com 
							var stat = nirvana.util.buildStat('word', item.wordstat, item.pausestat, {
								winfoid: item.winfoid
							});
							nirvana.manage.UPDATE_ID_ARR.push(Number(item.winfoid));
							return '<span class="word_update_state" id="wordstat_update_' + item.winfoid + '">' + stat + '</span>';
						},
						title: '状态',
						sortable : true,
						field : 'wordstat',
						width: 100,
						minWidth: 125,
						noun:true,
						nounName : '关键词状态'
					}, 
					bid: {
						content: function(item){
							var html = [];
							html[html.length] = '<div class="edit_td"  winfoid="' + item.winfoid + '">';
							if(item.bid){
								html[html.length] =  "<span class='word_bid'>" + baidu.number.fixed(item["bid"]) + "</span>";
							}else{
								html[html.length] = "<span title='使用单元出价'>" + baidu.number.fixed(item["unitbid"]) + "</span>";
							}
							html[html.length] = '<a class="edit_btn edit_btn_left" edittype="bid"></a>';
                            html[html.length] = '</div>';
							return html.join("");
						},
						field : 'bid',
						title: '出价',
						sortable : true,
						align:'right',
						width: 60,
						minWidth: 90,
						noun:true,
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
						width: 60
					},
					showqstat: qStarField,
					clks: {
						content: function(item){
							var data = item.clks;
							if (data == '' || data == '-') {
								return data;
							}
							return parseNumber(data);
						},
						field : 'clks',
						title: '点击',
						sortable : true,
						align:'right',
						width: 50
					},
					paysum: {
						content: function (item) {
						    return fixed(item.paysum);
						},
						title: '消费',
						sortable : true,
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
							if (data == '' || data == '-') {
								return data;
							}
							return parseNumber(data);
						},
						field : 'shows',
						title: '展现',
						sortable : true,
						align:'right',
						width: 50,
						minWidth: 80,
						noun:true,
						nounName: "展现量"
					},
					trans: {
						content: function(item){
							var data = item.trans;
							if (data == '' || data == '-') {
								return data;
							}
							return parseNumber(data);
						},
						title: '转化(网页)',
						sortable : true,
						field : 'trans',
						align:'right',
						width: 50,
						minWidth: 128,
						noun:true
					}, 
					avgprice: {
						content: function (item) {
						    return fixed(item.avgprice);
						},
						title: '平均点击价格',
						field : 'avgprice',
						sortable : true,
						align:'right',
						width:100,
						minWidth: 125,
						noun:true
					},
					clkrate:{
						content: function (item) {
							if (nirvana.manage.hasToday(me)) { // 包含今天数据
								return '-';
							}
						    return floatToPercent(item.clkrate);
						},
						title: '点击率',
						align: 'right',
						sortable : true,
						field : 'clkrate',
						width: 60
					},
					showpay:{
						content: function (item) {
						    return fixed(item.showpay);
						},
						title: '千次展现消费',
						align: 'right',
						sortable : true,
						field : 'showpay',
						width: 100,
						minWidth:100
					},
					wurl : {
						content:function(item){
							var title = baidu.encodeHTML(item.wurl),
								content = getCutString(item.wurl,30,"..");
							var html = [];
							html[html.length] = '<div class="edit_td" winfoid="' + item.winfoid + '">';
							
							if (typeof(item.shadow_wurl) == 'undefined' || fbs.util.removeUrlPrefix(item.shadow_wurl) == "") {
								if (content == "") {
									html[html.length] = "无";
								}else{
									html[html.length] = ' <span title="' + title + '">' + content + '</span>';
								}
							}else{
								var shadow_title = baidu.encodeHTML(item.shadow_wurl),
								//	shadow_wurl_control = item.shadow_wurl.substr(7),
									shadow_wurl = getCutString(item.shadow_wurl,30,"..");
								html[html.length] = '<span title="' + shadow_title + '">' + shadow_wurl + '</span>';
								if(content == ""){
									html[html.length] = '<br /><div class="orig_url">修改前没有为关键词单独设置链接</div>';
								}else{
									html[html.length] = '<br /><div class="orig_url"><h3>修改前URL</h3>' + content + '</div>';
								}
							}
							
							html[html.length] = '<a class="edit_btn" edittype="wurl"></a>';
                            html[html.length] = '</div>';
							return html.join("");
						},
						title: '访问URL',
						width: 200,
						minWidth:200
					}
				};
			}
			nirvana.manage.UserDefine.getUserDefineList('folder', function(){
				var ud = nirvana.manage.UserDefine,
					localList = [],
					lastLocalList = me.getContext('lastLocalListWord'),
				    data = [],
					i, len;
				
				for (i = 0,len = ud.attrList['folder'].length; i < len; i++)	{
					localList[i] = ud.attrList['folder'][i];
				}
				for (i = 0, len = localList.length; i < len; i++){
					data.push(nirvana.manage.monitorWordTableField[localList[i]]);
				}
				
				me.setContext('tableFields', data);
				
				localList = baidu.json.stringify(localList);				
				if (!lastLocalList || lastLocalList != localList){
					ui.util.get('wordTableList') && ui.util.get('wordTableList').resetTableAfterFieldsChanged();
					me.setContext('lastLocalListWord', localList);
				}
				
				callback();
			});
		},
		
		dateRange : nirvana.manage.getStoredDate([0,1,2,3,4,6]),
		
		//tab，只有一个监控文件夹
		tab: function(callback){
		    if (!this.arg.refresh) {
				var tabData = ['监控关键词'];
				this.setContext('tab', tabData);
			}
			callback();
		},
		
		searchCombo : function (callback){
		    var me = this;
		    //状态列表的设置
			if (!me.arg.refresh) {
				me.setContext('SearchState', 
			      {
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
			}
			
			me.setContext('searchStateValue', me.arg.queryMap.status || 100);
			me.setContext('searchQueryValue', me.arg.queryMap.query ? me.arg.queryMap.query : '');
            me.setContext('searchPreciseValue', me.arg.queryMap.queryType == 'accurate');
			
		    callback();
		},
		
		moniData : function(callback){
			var me = this,
				param = {};
			param.starttime = me.getContext('startDate');
			param.endtime = me.getContext('endDate');
			me.setContext("folderid",+me.getContext("folderid"));
			param.folderid = [me.getContext("folderid")];
			param.onSuccess = me.getTableDataHandler(callback);
			param.onFail = function(data){
				ajaxFailDialog();
				callback();
			};
			
			nirvana.manage.UserDefine.getUserDefineList('folder', function(){
				var ud = nirvana.manage.UserDefine,
				    localList = [],
				    i,len;
				for (i = 0, len = ud.attrList['folder'].length; i < len; i++){
					localList[i] = ud.attrList['folder'][i];
				}
				localList.push('winfoid');
				localList.push('unitid');
				localList.push('planid');
				localList.push('unitbid');
				localList.push('wordid');
				localList.push('pausestat');
				localList.push('shadow_wurl');
				//汇总数据需要，add by linzhifeng@baidu.com
				if (baidu.array.indexOf(localList,'shows') == -1){
					localList.push('shows');
				}
				if (baidu.array.indexOf(localList,'clks') == -1){
					localList.push('clks');
				}
				if (baidu.array.indexOf(localList,'paysum') == -1){
					localList.push('paysum');
				}
				if (baidu.array.indexOf(localList,'trans') == -1){
					localList.push('trans');
				}

				// 质量度司南，需要在showqstat的基础上，增加ideaquality和pageexp两个字段
				var extraCols = ['showqstat', 'ideaquality', 'pageexp'], extraItem;
				for (var k = 0, l = extraCols.length; k < l; k++) {
					extraItem = extraCols[k];
					if (baidu.array.indexOf(localList, extraItem) == -1) {
						localList.push(extraItem);
					}
				}
				
				//加一列高级短语
				localList.push('wctrl');
				
				param.fields = localList;
				fbs.avatar.getMoniWords(param);
			});
		},
		
		noDataHtml:function(callback){
			var me = this,
				status = me.getContext('status'),
				query = me.getContext('query');
			if((!status || status == '100') && (!query || query == '')){
				me.setContext("noDataHtml",FILL_HTML.FOLDDETAIL_NO_DATA);
			}else{
				me.setContext("noDataHtml",FILL_HTML.SEARCH_NO_DATA);
			}
			callback();
		}

	},
	
	/**
	 * 获取所有关键词的id
	 */
	getAllKwData: function(data){
		var me = this,
			//data = me.getContext("keywordData"),
			len = data.length,
			tmp = [];
				
		for (var i = 0; i < len; i++) {
			tmp[tmp.length] = {
				id:data[i].winfoid,
				name:data[i].showword
			};
		}
		return tmp;
	},
	
	/**
	 *  获取数据成功处理
	 * @param {Object} callback
	 */
	getTableDataHandler:function(callback){
		nirvana.manage.UPDATE_ID_ARR = [];
		var me = this;
		return function(data){
				var listdata = data.data.listData || [];
				//me.setContext('keywordData', listdata);
				me.setContext('allKwData',me.getAllKwData(listdata));
				
				//如果忽略状态，表格也得清状态    by linfeng 2011-07-05
				nirvana.manage.resetTableStatus(me,"wordTableList");
				
				var field = me.getContext("orderBy"),
					order = me.getContext("orderMethod"),
					result;
				//根据状态和Query筛选数据
				result = nirvana.manage.FilterControl.filterData(me,'wordstat',listdata);
				//根据context值进行排序
				result = nirvana.manage.orderData(result,field,order);
				
				
				//显示table
				me.processData(result);
				
				callback();
			};
	},
	matchIdeaTableFields : function(){
		var me= this;
		return {
			ideaid:{
				content: function (item) {
					var tmp = [],
					className = 'idea noborder',
					html = [],
					rel;
								
					//创意内容
					var ideaData = [item.title, item.desc1, item.desc2, item.showurl];
						tmp = IDEA_RENDER.idea(ideaData, className);
								
					var _bc = "";
					if (item.shadow_title && item.shadow_title != "") {
						_bc = 'style="background:#ffdfd5"';
					}
					
					
					var href = item.url;
					
					if (tmp.join("").indexOf("<u>") != -1) {
						tmp[0] = '<div  class="' + className + '" ' + _bc + ' title="访问URL：&#13;&#10;' + escapeQuote(href) + '&#13;&#10; &#13;&#10;您的创意包含了通配符，创意在展现时，将以触发创意展现的关键词替代通配符。插入创意的关键词在推广页面中显示，将提高客户对创意的关注度和点击率。">';
					} else {
						tmp[0] = '<div  class="' + className + '" ' + _bc + ' title="访问URL：&#13;&#10;' + escapeQuote(href) + '&#13;&#10; &#13;&#10;建议您在创意中包含通配符，通配符可以帮助您在创意中插入关键词。插入创意的关键词在推广页面中显示，将提高客户对创意的关注度和点击率。">';
					}
					for (key in item){
						item[key] = escapeHTML(unescapeHTML(item[key]));
					}
								
								
					if (item.shadow_title && item.shadow_title != "") {
						// 有修改创意
						var modIdea = [],
							href = item.shadow_url,
							className = className + ' display_none';
						var modifiedIdeaData = [item.shadow_title, item.shadow_desc1, item.shadow_desc2, item.shadow_showurl];    
						modIdea = IDEA_RENDER.idea(modifiedIdeaData, className);
						
				
						if (modIdea.join("").indexOf("<u>") != -1) {
							modIdea[0] = '<div class="' + className + '" title="访问URL：&#13;&#10;' + escapeQuote(href) + '&#13;&#10; &#13;&#10;您的创意包含了通配符，创意在展现时，将以触发创意展现的关键词替代通配符。插入创意的关键词在推广页面中显示，将提高客户对创意的关注度和点击率。">';
						} else {
							modIdea[0] = '<div class="' + className + '" title="访问URL：&#13;&#10;' + escapeQuote(href) + '&#13;&#10; &#13;&#10;建议您在创意中包含通配符，通配符可以帮助您在创意中插入关键词。插入创意的关键词在推广页面中显示，将提高客户对创意的关注度和点击率。">';
						}
						tmp[tmp.length] = modIdea.join("");
						tmp[tmp.length] = '<p style="text-align:right"><a href="javascript:void(0);" onclick="viewIdeaSwap(this, ' + item.ideaid + ', ' + item.shadow_ideaid + ');return false" data-log="{target:\'viewIdeaSwap' + item.ideaid + '-btn\'}">查看修改后创意及状态</a></p>';
				
									
					}
					
					html[html.length] = '<div class="edit_td">';
					html[html.length] = '<div class="idea_wrapper">' + tmp.join("") + '</div>';
					html[html.length] = '<a class="edit_btn" id="IdeaEdit_' + item.ideaid + '" edittype="ideaid" ideaid="' + item.ideaid + '"></a>';
							 html[html.length] = '</div>';
					
					 rel = '<div style= "padding-left:35px">' + html.join('') + '</div>';
					 
					 return rel
						 },
				locked: true,
				title:  '<div style="padding-left:35px">通过本关键词展现的创意</div>',
				width: 350,
				minWidth:270,
				locked: true,
				noun : true,
				//stable:true,
				field : 'ideaid',
				nounName : '关键词触发的创意'
			},
			ideastat: {
				content: function (item) {
					nirvana.manage.UPDATE_ID_ARR_MATCH.push(item.ideaid);
					return '<span class="idea_update_state" id="ideastat_update_'+item.ideaid+'"><img src="asset/img/loading_1.gif"/></span>';
				},
				title: '状态',
				sortable : true,
				filterable : true,
				field : 'ideastat',
				width: 220,
				minWidth:150
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
				align:'right',
				width: 160,
				minWidth:80
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
				align:'right',
				width: 160,
				minWidth:80
			},
			paysum: {
				content: function (item) {
					if (item.paysum == ''){//SB doris
						return fixed(STATISTICS_NODATA);
					}
					if (item.paysum == '-'){
						return '-';
					}
					return fixed(item.paysum);
				},
				title: '消费',
				field : 'paysum',
				align:'right',
				width: 160,
				minWidth:80
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
				field : 'clkrate',
				width: 160,
				minWidth:80			
			}
		}
	},
	matchTableFields : function(callback){
			var me = this;
			nirvana.manage.UserDefine.getUserDefineList('folder', function(){
				var localList = nirvana.manage.UserDefine.attrList['folder'],
					field = me.matchIdeaTableFields(),
				    data = [field['ideaid'],field['ideastat']],
					i, len = localList.length;
				for(i = 0 ;i < len;i++){
					if(field[localList[i]]){
							data.push(field[localList[i]])
					}
				}
				me.setContext('matchTableFields',data);
				callback && callback();
			});
    },
	getMatchTableInlineHandler : function (param) {
        var me = this;
		
        return function (e) {
            var event = e || window.event,
                target = event.target || event.srcElement,
				logParams = {},
				type;
               
            
				while(target && target.tagName.toUpperCase() !="BODY" && target.id != 'ctrltableideaTableListbody'){
					if(target.className && target.className == 'status_op_btn match_status_op_btn'){
						me.doMatchInlinePause(target)
						break;
					}
					if(baidu.dom.hasClass(target, 'edit_btn')){
						type = target.getAttribute('edittype');
						switch(type){
							case 'ideaid':
								param.ideaid = target.getAttribute('ideaid');
								NIRVANA_LOG.send(param);
								nirvana.manage.createSubAction.idea({
									type : 'saveas',
									ideaid : target.getAttribute('ideaid'),
									planid : me.getContext('keywordDataNow').planid,
									unitid : me.getContext('keywordDataNow').unitid,
									matchLogParams : baidu.object.clone(param),
									fromSubTable : true,
									subTableRender : function(){
											me._controlMap.wordTableList.onsubrowopen(me.subRowIndex)
										}
								});
								break;
						}
						break;
					}
					if(baidu.dom.hasClass(target, 'match_status_icon')){
						manage.offlineReason.openSubAction({
							type : 'ideainfo',
							params : target.getAttribute('data')
						});
						
						break;
					}
					
					target = target.parentNode;
				}
				
			
        };
    },
	onafterrender : function(){
	    var me = this,
		    controlMap = me._controlMap;

		nirvana.manage.setModDialog(me);
		
		//给表格注册排序
		controlMap.wordTableList.onsort = function(sortField,order){
			me.setContext("orderBy",sortField.field);
			me.setContext("orderMethod",order);
			me.refresh();
		}
	   	//给表格选择注册事件
        controlMap.wordTableList.onselect = me.selectListHandler();
		//给表格注册行内编辑处理器
        controlMap.wordTableList.main.onclick = me.getTableInlineHandler();
		
		//修改出价
		controlMap.modBid.disable(true);
		controlMap.modBid.onclick = me.modBidClickHandler();
		//修改匹配方式
		controlMap.modWmatch.disable(true);
		controlMap.modWmatch.onclick = me.modWmatchClickHandler();
        //启用暂停删除
        controlMap.runPause.onselect = me.operationHandler();
		//停止监控
		controlMap.delMonitor.disable(true);
		controlMap.delMonitor.onclick = me.delMonitorClickHandler();
        //转移监控关键词
		controlMap.transMonitor.disable(true);
		controlMap.transMonitor.onclick = me.transMonitorClickHandler();
		
		//注册工具箱导入方法
		ToolsModule.setImportDataMethod(function(){
			var selectedList = me.selectedList,
	            data = me.getContext('keywordListData'),
	            res = {
					level : 'keyword',
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
        baidu.g('searchComboTipContent').onclick = nirvana.manage.SearchTipControl.getSearchTipHandler(me,'wordTableList');
		//controlMap.cancelComboSearch.onclick = me.getCancelSearchHandler();
		
		//优化 by linzhifeng@baidu.com 2011-08-29
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
			ui.util.get('wordTableList').resetYpos = true;
			me.setContext('pageSize', +value);
			me.setContext("pageNo", 1);
			me.refresh();
		};
		
		//pagination
		controlMap.pagination.onselect = function(value){
			ui.util.get('wordTableList').resetYpos = true;
			me.setContext("pageNo", +value);
			me.refresh();
		};
	},
	
	onreload : function(){ 
		this.refresh();
	},
	
	onentercomplete : function(){
	    var me = this,
			controlMap = me._controlMap,
			addkeyword = controlMap.addkeyword,
			wordTable = controlMap.wordTableList;
		me.setLevel();
		wordTable.onsubrowopen = function ( index ) {//匹配分析 liuyutong
			var fatherTable = this,
				tableId = 'matchIdeaTable' + index ;
			me.subRowIndex = index;
			wordTable.getSubrow( index ).innerHTML = '<div class="ui_table_matchSubrow ui_table_matchSubrow_loading" id="' + tableId + '"><img src= "asset/img/loading.gif"/>数据正在加载中,请稍侯...</div>';
			var data = me.getContext('keywordListData')[index],
				logParams = {
					target : 'IdeaMatchEntry_btn',
					winfoid : data.winfoid,
					unitid : data.unitid,
					planid : data.planid
				},
				logParams_edit = {
					target : 'IdeaMatchEdit_btn',
					winfoid : data.winfoid,
					unitid : data.unitid,
					planid : data.planid,
					showword : data.showword
				};
			NIRVANA_LOG.send(logParams);
			me.setContext('keywordDataNow',data);
			fbs.avatar.getMatchIdea(
				{
					winfoids :[data.winfoid],
					starttime : me.getContext('startDate'),
					endtime : me.getContext('endDate'),
					onSuccess : function(data){
						var tableEl = baidu.g(tableId);
						if(data.data.listData.length == 0){
							tableEl.innerHTML = '没有匹配的创意';
							return;
						}
						nirvana.manage.UPDATE_ID_ARR_MATCH = [];
						var param = {
							id : 'matchIdeaDetail',
							afterrender : function(){
								var updateParam = {
									starttime   : me.getContext('startDate'),
									endtime     : me.getContext('endDate'),
									limit : nirvana.limit_idea,
									matchUpdate : true
								}
								fbs.material.getAttribute('ideainfo',['ideastat:update'],updateParam);
								//翻页引起的表格上部空白问题 by zhouyu
								if (fatherTable.scrollYFixed && baidu.ie && fatherTable.topReseter) {
									fatherTable.topReseter();
								}
							}
						},k,listData = data.data.listData , len = listData.length;
				//		me.setContext('ideaMatchListData',listData);
						if(me.matchTable){
							me.matchTable.dispose();
						}
						param.tableParam = {
							datasource : listData,
							noScroll : true,
							autoResize : false,
							isSubTable :true 
						} ;
						param.pageParam = {
							pageSize : 4,
							isMatchStyle :true
						};
						me.matchTableFields(function() {
							param.tableParam.fields =  me.getContext('matchTableFields');
							me.matchTable = ui.util.create('Match',param);
							tableEl.innerHTML = '';
							baidu.removeClass(tableEl,'ui_table_matchSubrow_loading');
							me.matchTable.appendTo(tableEl);
							me.matchTable.table.main.onclick = me.getMatchTableInlineHandler(logParams_edit);
						});
						
					},
					onFail : function(data){
						wordTable.getSubrow( index ).innerHTML = '<div class="ui_table_matchSubrow ui_table_matchSubrow_loading" id="' + tableId + '">数据读取异常，请重新尝试</div>';
					}
				}
			)
			
			return true;
			
		}
		wordTable.onsubrowclose = function(index){
			nirvana.manage.UPDATE_ID_ARR_MATCH = [];
		}
		// 添加关键词
		addkeyword.onclick = function(){
			nirvana.util.openSubActionDialog({
				id: 'addMoniKwDialog',
				title: '新增监控关键词',
				width: 928,
				actionPath: 'manage/addMoniWords',
				params: {
					folderid:me.getContext("folderid"),
					foldername:me.getContext("foldername"),
					addwords:me.getContext("allKwData")
				},
				onclose: function(){
					if (me.arg.type !== 'prop') { // me.arg.type默认为sub，所以这里要具体判断，在账户优化工具中打开时，不需要reload
						er.controller.fireMain('reload', {});
					}
				}
			});
			clearTimeout(nirvana.subaction.resizeTimer);
			baidu.g('ctrldialogaddMoniKwDialog').style.top = baidu.page.getScrollTop() + 93 +'px';
		};
		
		me._controlMap.userDefine.onclick = nirvana.manage.UserDefine.getUserDefineHandler(me, 'folder', 'wordTableList');
		nirvana.manage.UserDefine.dialog.hide();
		
		//me.initSearchComboTip();
		nirvana.manage.SearchTipControl.initSearchComboTip(me);
		//恢复账户树状态
        nirvana.manage.restoreAccountTree(me);
		
		//unitstat,planstat更新
		me.updateStat();
		
		// wanghuijun 2012.11.30
		// 账户优化初始化
		// me.changeAoParams();
		// nirvana.aoControl.init(me);
		// wanghuijun 2012.11.30
		// 模块化实践，ao按需加载
		$LAB.script(nirvana.loader('proposal'))
			.wait(function() {
				me.changeAoParams();
				nirvana.aoControl.init(me);
			});
		// wanghuijun 2012.11.30
	},
	
	onafterinitcontext : function(){
		nirvana.CURRENT_MANAGE_ACTION_NAME = 'monitorDetail';
	},
	
	onleave : function(){
		nirvana.CURRENT_MANAGE_ACTION_NAME = '';
	},
	
	/**
	 * 获取当前页监控文件夹的属性
	 */
	setLevel : function() {
		var me = this,
			folderid = me.getContext("folderid");
		fbs.avatar.getMoniFolders({
			folderid:[folderid],
			fields:["folderid","foldername","fstat","moniwordcount"],
			onSuccess:me.setLevelHandler(),
			onFail:me.readFailHandler()
		});
	},
	
	/**
	 * 物料层级初始化
	 */
	setLevelHandler:function(){
		var me = this;
		return function(data){
			var data = data.data.listData || [{foldername:"",moniwordcount:0}] ,
				attr = data[0],
				foldername = attr.foldername,
				wordcount = attr.moniwordcount,
				levelHtml = [];
			levelHtml[levelHtml.length++] = '账户：<span class="bold"><span id="MoniListLxbStatus">' + nirvana.env.USER_NAME + '</span></span>';
			levelHtml[levelHtml.length++] = '&nbsp;>&nbsp;';
			levelHtml[levelHtml.length++] = '监控文件夹：<span class="bold">' + baidu.encodeHTML(foldername) + '</span>(' + wordcount + '个关键词)'
			baidu.g("foldListLevel").innerHTML = levelHtml.join("");
			me.setContext("foldername",foldername);
			//离线宝状态
			nirvana.manage.LXB.setStatus("MoniListLxbStatus");
		}
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
		me.setContext('keywordListData', rs); //table用数据
		
		//统计展现、点击等汇总数据
		var item,
		    clks = 0,
			shows = 0,
			paysum = 0,
			transSum = 0;
		
		for (var i = 0, l = result.length; i < l; i++){
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
			nirvana.aoControl.changeParams({
				level: 'folder',
				command: 'start',
				signature: '',
				condition: {
					folderid: [me.getContext('folderid')]
				}
			});
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
			wordids[unitids.length] = listData[i].winfoid;
         }
		 condition.planid = planids;
		 condition.unitid = unitids;
		 condition.winfoid = wordids;
		 return condition;
	},
	
	/**
	 * table复选框选择事件处理
	 * @param {Object} selected
	 */
	selectListHandler : function (selected) {
        var me = this,
            controlMap = me._controlMap; 
        return function (selected) {
            var enabled = selected.length > 0,
				modBid = controlMap.modBid,
				modWmatch = controlMap.modWmatch,
                runPause = controlMap.runPause,
				delMonitor = controlMap.delMonitor,
				transMonitor = controlMap.transMonitor;

            //调整启用暂停下拉框 的disabled状态
            if(enabled) {
                me.setRunPauseOptionsState(selected);
            }
            me.selectedList = selected;
            runPause.disable(!enabled);
			modBid.disable(!enabled);
			modWmatch.disable(!enabled);
			delMonitor.disable(!enabled);
			transMonitor.disable(!enabled);
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

        // 读写分离，待升级之后不用这种方式了
        // by Leo Wang
		nirvana.acc.accService.processEntrances('manage/monitorDetail');
    },
	/**
	 * 启用暂停关键词确认
	 */
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
            }
			ui.Dialog.confirm({
				title: title,
				content: msg,
				onok: me.doOperationHandler(),
				optype: selected
			});
        }
    },
    
	/**
	 * 启用暂停关键词
	 */
    doOperationHandler : function () {
        var me = this,
            controlMap = me._controlMap;
        return function (dialog) {
            var dialog = dialog,
                pauseStat, //0启用,1暂停
                winfoid = me.getSelected('winfoid'),
                param = {winfoid: winfoid, 
                         onFail: me.operationFailHandler()};            
                switch (dialog.args.optype) {
                    case 'start' :
                        pauseStat = 0;
                        break;
                    case 'pause' :
                        pauseStat = 1;
                        break;
                }
    			param.pausestat = pauseStat;
                param.onSuccess = function(response){
				 	if (response.status != 300) {
				 		var modifyData = response.data;
				 		fbs.avatar.getMoniWords.ModCache("winfoid", modifyData);
						fbs.material.ModCache('wordinfo',"winfoid", modifyData);
				 		me.refresh();
				 	}
				};
                fbs.keyword.modPausestat(param);
            }
    },

	
	/**
	 * 获取选中行的数据
	 * @param {Object} id 
	 * @return {Array} ids
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
					dat[id[j]] = data[selectedList[i]][id[j]];
				}
				ids.push(dat);
			}
		}
		else {
			if (id == "bid") {
				for (i = 0, len = selectedList.length; i < len; i++) {
					if (data[selectedList[i]][id]) {
						ids.push(data[selectedList[i]][id]);
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
					name:me.getSelected('showword'),
					avatar:true
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
	 * 停止监控关键词确认
	 */
	delMonitorClickHandler:function(){
		var me = this;
		return function(){
            var title = '停止监控关键词',
			    msg = '您确定要停止监控该关键词吗？<br />提示：对原相应单元下的关键词没有影响',
				len = me.selectedList.length;
			ui.Dialog.confirm({
				title: title,
				content: msg,
				onok: me.doDelMoniHandler()
			});
		}
	},
	
	/**
	 * 停止监控关键词
	 */
	doDelMoniHandler : function () {
        var me = this,
            controlMap = me._controlMap;
        return function (dialog) {
            var param = {
					folderid:me.getContext("folderid"),		
 					winfoids:me.getSelected('winfoid'),
                    onSuccess: function(data){
							if (data.status != 300) {
								fbs.avatar.getMoniFolders.clearCache();
								fbs.avatar.getMoniWords.clearCache();
								fbs.avatar.getMoniWordCount.clearCache();
								fbs.avatar.getWinfoid2Folders.clearCache();
								//ui.util.get('SideNav').refreshFolderList();
								ui.util.get('SideNav').refreshNodeInfo('folder',[me.getContext("folderid")]);
								me.refresh();
							}
						}, 
                    onFail: me.operationFailHandler()};
                fbs.avatar.delMoniWords(param);
            }
    },
    /**
	 * 转移监控关键词
	 */
    transMonitorClickHandler : function () {
		var me = this,
            controlMap = me._controlMap;
        return function(dialog){
			nirvana.util.openSubActionDialog({
				id: 'monikeywordDialog',
				title: '转移监控该关键词',
				width: 480,
				actionPath: 'manage/moniKeyword',
				params: {
					wordChosen : me.getSelected(["winfoid","showword","wmatch","wctrl"]),
					trans : true,
					srcfolderid :me.getContext("folderid"),
					onsuccess : function(){
						//ui.util.get('SideNav').refreshFolderList();
						me.refresh();
					}
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
    getTableInlineHandler : function () {
        var me = this;
        return function (e) {
            var event = e || window.event,
                target = event.target || event.srcElement,
				logParams = {},
				type;
            while(target  && target != ui.util.get("wordTableList").main){
                if(target.className && target.className == 'status_op_btn' ){
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
						case "wctrl":
							me.inlineWctrl(target);
							logParams.target = "editInlineWctrl_btn";
							break;
					}
					break;
				}
				//小灯泡 by Tongyao
				if(baidu.dom.hasClass(target, 'status_icon')&&!baidu.dom.hasClass(target, 'match_status_icon')){
					logParams.target = "statusIcon_btn";
					manage.offlineReason.openSubAction({
						type : 'wordinfo',
						params : target.getAttribute('data')
					});
					break;
				}
                target = target.parentNode;
            }
			if(logParams.target){
				NIRVANA_LOG.send(logParams);
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
			if (item.bid) {
				var bid = baidu.number.fixed(item["bid"]);
			}
			else {
				var bid = baidu.number.fixed(item["unitbid"]);
			}
		nirvana.inline.createInlineLayer({
			type: "text",
			value: bid,
			id: "bid" + winfoid,
			target: parent,
			action: "modWordBid",
			okHandler: function(wbid){
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
			}
		});
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
	inlineWurl:function(target){
		var me = this,
			parent = target.parentNode,
			winfoid = parent.getAttribute("winfoid"),
			wurl = "";
		var data = me.getLineData(target);
		if(typeof(data.shadow_wurl) != 'undefined'){
			wurl = data.shadow_wurl;
		}else{
			wurl = data.wurl;
		}
		if (wurl != "") {
			wurl = wurl.substr(7);
		}
		nirvana.inline.createInlineLayer({
			type: "text",
			prefix:"http://",
			value: wurl,
			id: "wurl" + winfoid,
			target: parent,
			okHandler: function(url){
				if(baidu.trim(url) == ""){
					url = "";
				}else{
					url = "http://" + baidu.trim(url);
				}
				return {
					func: fbs.keyword.modWurl,
					param: {
						winfoid: [winfoid],
						wurl: url,
						onSuccess: function(data){
							if (data.status != 300) {
								var modifyData = {};
								modifyData[winfoid] = {
									"shadow_wurl": "http://" + fbs.util.removeUrlPrefix(url)
								};
								//修改为空的URL立即生效没有影子  by linzhifeng@baidu.com @2012-02-15
								if (url == "") {
									modifyData[winfoid].wurl = "";
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
		var isFind = false,isSubrow = true;
		while (target && target.tagName != "TR") {
			if(target.tagName == "TD"&&target.getAttribute("row")){
				isFind = true;
				break;
			}
			target = target.parentNode;
			if(target.tagName == "TR"&&isSubrow){
				target = target.parentNode;
			}
			if(baidu.dom.hasClass(target,"ui_table_subentry")){
				isSubrow = true;
			}
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
    getRowIdArr : function (target,match) {
        var me = this,
            data = me.getContext('keywordListData'),
            idArr = [], index;
        index = nirvana.manage.getRowIndex(target);
        
		if(match){
			//ideaMatchListData是不变的，翻页会导致获取的当前行的id不正确 
			//modify by zhouyu
		//	data = me.getContext('ideaMatchListData');
			data = me.matchTable.table.datasource;
			idArr.push(data[index].ideaid);
			
		}else{
			idArr.push(data[index].winfoid);
		}
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
				if (response.status != 300) {
					var modifyData = response.data;
					fbs.avatar.getMoniWords.ModCache("winfoid", modifyData);
					fbs.material.ModCache('wordinfo', "winfoid", modifyData);
					me.refresh();
				}
			}, 
            onFail: me.operationFailHandler()
        });
    },
	doMatchInlinePause : function (target) {
        var me = this,
            idArr, pauseSta,
            func = fbs.idea.modPausestat,
			logParams = {
				target: "inlineRunPause_btn"
			};
        idArr = me.getRowIdArr(target,true);
        var pauseStat = nirvana.manage.getPauseStat(target,[0,1]);
		logParams.pauseStat = pauseStat;
		NIRVANA_LOG.send(logParams);
        nirvana.manage.inserLoadingIcon(target);
        func({
            ideaid: idArr,
            pausestat : pauseStat,
            onSuccess: function(response){
				var modifyData = response.data;
				fbs.material.ModCache("ideainfo", "ideaid", modifyData);
				nirvana.manage.UPDATE_ID_ARR_MATCH = idArr;
				var updateParam = {
						starttime   : me.getContext('startDate'),
						endtime     : me.getContext('endDate'),
						limit : nirvana.limit_idea,
						matchUpdate : true
					}
				fbs.material.getAttribute('ideainfo',['ideastat:update'],updateParam);
			},
            onFail: me.operationFailHandler()
        });
    },
	
	/**
	 * 读操作系统异常
	 */
    readFailHandler : function () {
        var me = this;
        return function (data) {
            ajaxFailDialog();            
        }
    },
	
    /**
     * 写操作系统异常
     */
    operationFailHandler : function () {
		var me = this;
        return function (data) {
            ajaxFail(0);           
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
            
            //me.initSearchComboTip();
			nirvana.manage.SearchTipControl.initSearchComboTip(me);
			nirvana.manage.SearchTipControl.recordSearchcondition('search_combo');
			
			me.refresh();
        };
    },
	
	/**
	 * unitstat,planstat更新状态
	 */
	updateStat : function(){
		var me=this;
		 	
		fbs.request.send({
			nocache : true,
			fields : ['winfoid', 'unitstat', 'planstat'],
			condition :{
				folderid: [me.getContext('folderid')]
				},
			path : fbs.config.path.GET_MONI_WORDS,
			onSuccess : me.updateStatHandler()
		})
	},
	/**
	 * 更新成功
	 */
	updateStatHandler : function(){
		var me=this,
			controlMap = me._controlMap;
		return function(data){
			var tableData = baidu.object.clone(me.getContext('keywordListData')), 
				statData = data.data.listData;
			
			for (var i = 0, len = tableData.length; i < len; i++) {
				for (var j = 0, len1 = statData.length; j < len1; j++) {
					if (tableData[i].winfoid == statData[j].winfoid) {
						tableData[i].unitstat = statData[j].unitstat;
						tableData[i].planstat = statData[j].planstat;
						break;
					}
				}
				
			}
			me.setContext('keywordListData', tableData);
			
			controlMap.wordTableList.datasource = tableData;
			controlMap.wordTableList.render();
			ui.Bubble.init();
			
			//状态即时更新
			var updateParam = {};
				updateParam.starttime = me.getContext('startDate');
				updateParam.endtime = me.getContext('endDate');
				updateParam.limit = nirvana.limit;
			fbs.material.getAttribute('wordinfo',['wordstat:update'],updateParam);
		}
	}
});
