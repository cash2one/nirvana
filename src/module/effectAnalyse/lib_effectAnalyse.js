/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: effectAnalyse/lib_effectAnalyse.js 
 * desc: 效果分析公用函数库 
 * author: huanghainan@baidu.com
 * date: $Date: 2012/1/16 $
 */

nirvana.effectAnalyse = {};
nirvana.effectAnalyse.flashReady = false;
 
 //定义table属性和方法,漏斗数据的渲染方法也写在此处了
nirvana.effectAnalyse.keywordList = {
     //定义表格的所有列
	 allTableFields:{},
	 
     initTableFields:function(action){ 
	 var me=action;

     // 获得质量度的配置项
     var qStarField = qStar.getTableField(me, {
        sortable:   true,
        filterable: true,
        width:      60,
        minWidth:   80
     });

	 nirvana.effectAnalyse.keywordList.allTableFields=
	 {
					showword: {
						content: function(item){
							var title = baidu.encodeHTML(item.showword),
								content = getCutString(item.showword,30,".."),
								wmatch = item.wmatch,
								wctrl = item.wctrl,
								wctrl_auth = nirvana.env.AUTH['gaoduan'];
							
							if (wctrl_auth) {
								title = nirvana.util.buildShowword(title, wmatch, wctrl);
								content = nirvana.util.buildShowword(content, wmatch, wctrl);
							}
							
							var html = [];
							if (wctrl_auth && wmatch == 31) {
								html[html.length] = '<div  winfoid="' + item.winfoid + '">';
							}
							html[html.length] = '<span class=""  bubblesource="analyseMonitorFolderList" id="analyseFolderList' + item.winfoid + '">';
							html[html.length] = '<span title="' + title + '">' + content + '</span>';
							
							html[html.length] = '</span>';
							
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
						footContent : 'avg',
						width: 130,
						minWidth :150
					},
					editIdea:{
						content: function(item){
						
							return "<a level='idea' href='javascript:void(0);'> 查看创意 </a>";
						},
						title: '创意',
						sortable : false,
						filterable : false,
						field : '',
						width: 90,
						minWidth :70
					},
					unitname : {
						content: function(item){
							var title = baidu.encodeHTML(item.unitname),
								content = getCutString(item.unitname,30,"..");
						
							return '<a title="' + title + '" " href="javascript:void(0);" unitid=' + item.unitid + ' level = "unit" data-log="{target:'+"'linkunit_lbl'"+'}" >' + content + '</a>';
						},
						title: '推广单元',
						sortable : true,
						filterable : true,
						field : 'unitname',
						width: 100
					},
					planname : {
						content: function(item){
							var title = baidu.encodeHTML(item.planname),
								content = getCutString(item.planname,30,"..");
					
							return '<a title="' + title + '" href="javascript:void(0);" planid=' + item.planid + ' level = "plan" data-log="{target:'+"'linkplan_lbl'"+'}" >' + content + '</a>';
						},
						title: '推广计划',
						sortable : true,
						filterable : true,
						field : 'planname',
						width: 100
					},
					wordstat: {
						content: function (item) {
							return nirvana.effectAnalyse.keywordList.buildStat('word',item.wordstat, item.pausestat, {
								winfoid : item.winfoid
							});
						},
						title: '状态',
						sortable : true,
						filterable : true,
						field : 'wordstat',
						width: 80
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
						filterable : true,
						align:'right',
						width: 50
						
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
					showqstat: qStarField,
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
						footContent : 'avgClks',
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
						width: 50,
						footContent : 'avgPaysum'
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
						width: 50,
						footContent : 'avgShows'
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
						title: '转化',
						sortable : true,
						filterable : true,
						field : 'trans',
						align:'right',
						width: 85,
						minWidth: 95,
						footContent : 'avgTrans'
					
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
						footContent : 'avgAvgprice'
						//noun : true
					},
					clkrate:{
						content: function (item) {
							if (nirvana.manage.hasToday(me)) { // 包含今天数据
								return '-';
							}
							if (item.clkrate == ''){//SB doris
								return floatToPercent(STATISTICS_NODATA);
							}
						   return floatToPercent(item.clkrate);//这里数据源datacore做过百分号处理了，所以就不用再转了
						},
						title: '点击率',
						align: 'right',
						sortable : true,
						filterable : true,
						field : 'clkrate',
						width: 100,
						minWidth: 110,
						footContent : 'avgClkrate'
						//noun : true
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
						minWidth: 165
						//noun : true
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
							
							 html[html.length] = '</div>';
							return html.join("");
						},
						title: '访问URL',
						width: 175,
					    minWidth:200
					//	noun : true,
						//nounName: "URL"
					}
				}
				},
	
		
				
	/**
	 * 表格数据的接受和渲染
	 * @param {Object} actionInstance action实例
	 * @param {Object} data    表格所有的数据集合
	 */
	renderFlashSelectedTable:function(actionInstance,data){
	var me = actionInstance,
		 table = ui.util.get('analyseTableList'),
		 effectTool = nirvana.effectAnalyse.keywordList;
		 me.setContext('analysePageNo', 1);
		 me.setContext('allTableData', data.listData);
		 me.setContext('filteredAllTableData',baidu.object.clone(data.listData) );
	     effectTool.setTableFootFlashData(data.selectedAvg,me);
		 table.hasFoot = true;
		 table.footdata = me.getContext("avgData");
	 //    console.log(data);
	  //清空筛选
	  var  filterCol = me.getContext('filterCol');
				
	  for (var field in filterCol) {
	  	filterCol[field].on=false;
		
	  }
	 var tableFilterCol=table.filterCol;
	 for (var field in tableFilterCol) {
	  	tableFilterCol[field]=false;
	  }
	
	 // tableFilterCol.isRendered=false;//需要重绘一下表头
		 effectTool.getPaginationHandler(me)(1);
		 //渲染分页控件
		//  effectTool.funnelAnalysisRender();
		var pageSize = me.getContext('analysePageSize'); 
		//var pageNo =  1; //me.getContext('analysePageNo') ||
		var analysePage =  ui.util.get('analysePagination');
	        analysePage.page = 1;//将页码设置为第一页
		    me.setContext('analysePageNo',1);
		var totalNum = data.listData.length;
	    var totalPage = Math.ceil(totalNum / pageSize);
	    me.setContext('totalNum', totalNum);
	    me.setContext('totalPage', totalPage);
	    if (totalPage <= 1) {
	        baidu.dom.hide('ctrlpageanalysePagination');
	    }
	    else {
	        baidu.dom.show('ctrlpageanalysePagination');
	    }

	  ui.util.get('analysePagination').total = totalPage;
	  
      analysePage.render(analysePage.main);
	 
	  
	 
	},
	
	/**
	 * 翻页响应事件
	 * @param {Object} value  当前待显示页页码
	 */
	getPaginationHandler : function (actionInstance) {
		var me = actionInstance ;
		return function(value){
			var effectTool = nirvana.effectAnalyse.keywordList,
			   analyseTableList = ui.util.get('analyseTableList'),
			   datasource,
			   pageSize = me.getContext('analysePageSize');
		//hc.index = pageSize * (value - 1);
		
	    me.setContext('analysePageNo',value);
        datasource = effectTool.getDataPerPage(me, pageSize, value, me.getContext("filteredAllTableData"));
		me.setContext('analyseListData', datasource);		
		analyseTableList.datasource = datasource;
	    analyseTableList.render(analyseTableList.main);
		effectTool.showFolders(me);//添加监控文件夹
		};
		   
		
	},
	
			
   /**
    * 获取表格中每页的数据
    * @param {Object} pageSize
    * @param {Object} pageNo
    */
	getDataPerPage : function(actionInstance, pageSize, pageNo,data){
		var me =actionInstance ,
           // data = me.getContext("allTableData"),
		    result = baidu.object.clone(data);
	
        return nirvana.util.getPageData(result, pageSize, pageNo);
	},
	
	/**
	 * 行内事件处理器
	 * @param {Object} action
	 */
    getTableInlineHandler:function(action){
		var me = action,
		    tableTool = nirvana.effectAnalyse.keywordList;

        return function (e) {
            var event = e || window.event,
                target = event.target || event.srcElement,
				logParams = {},
				level,
				type;
			if(target.getAttribute('level')){
				level = target.getAttribute('level');
				switch(level) {
				
				// 跳转 到计划层级
				case 'plan' :
					var url='/manage/unit~ignoreState=1&navLevel=plan&planid=' + target.getAttribute('planid'),
					    currentURL=er.locator.getLocation() ;
						
					var logparam = {};
	                        logparam.redirect = 'plan';
	                        nirvana.effectAnalyse.lib.logCenter("", logparam);
					if(url==currentURL){//如果当前已经在该层级下，直接将工具收起
						ToolsModule.close();
					}
					else{
						er.locator.redirect('/manage/unit~ignoreState=1&navLevel=plan&planid=' + target.getAttribute('planid') );	
					}             
					break;
				
				// 跳转 到单元层级
				case 'unit' :
				    var url='/manage/keyword~ignoreState=1&navLevel=unit&unitid=' + target.getAttribute('unitid'),
				    currentURL=er.locator.getLocation() ;
					var logparam = {};
                        logparam.redirect = 'unit';
                        nirvana.effectAnalyse.lib.logCenter("", logparam);
					if (url == currentURL) {//如果当前已经在该层级下，直接将工具收起
						ToolsModule.close();
					}
					else {
						er.locator.redirect('/manage/keyword~ignoreState=1&navLevel=unit&unitid=' + target.getAttribute('unitid'));
					}
					
                
					break;
				case 'idea'://查看创意 
				  tableTool.inlineIdea(target, me);
				  logParams.target = "";
								
				break;
				default:  break;
				}
			}else{
				while(target  && target != ui.util.get("analyseTableList").main){
					
					if(baidu.dom.hasClass(target,"edit_btn")){
						var current = nirvana.inline.currentLayer;
						if (current && current.parentNode) {
							current.parentNode.removeChild(current);
						}
						type = target.getAttribute("edittype");
						switch(type){
							case "bid":
								tableTool.inlineBid(target, me);
								logParams.target = "editInlineBid_btn";
								break;
							case "wmatch":
								tableTool.inlineWmatch(target, me);
								logParams.target = "editInlineWmatch_btn";
								break;
							
						
						}
						break;
					}
					
					//小灯泡 by Tongyao
					if(baidu.dom.hasClass(target, 'status_icon')){
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
			}
        };
	},
	
	/**
	 * 根据编辑按钮对象获取当前行数据
	 * @param {Object} target
	 */
	getLineData: function(target, tableData){
		var isFind = false;
		    // me = action;
		while (target && target.tagName != "TR") {
			if(target.tagName == "TD"){
				isFind = true;
				break;
			}
			target = target.parentNode;
		}
		if(isFind){
			var index = target.getAttribute("row");
			//tableData
			return  tableData[index];
			//return  me.getContext('analyseListData')[index];
		}
		return false;
	},
	/**
	 * 行内修改出价
	 * @param {Object} target
	 */
	inlineBid:function(target,action){
		var me = action,
			parent = target.parentNode,
			winfoid = parent.getAttribute("winfoid"),
			tableTool = nirvana.effectAnalyse.keywordList, 
			item = tableTool.getLineData(target,me.getContext('analyseListData'));
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
					validate: tableTool.bidValidate(wbid),
					param: {
						winfoid: [winfoid],
						bid: wbid,
						onSuccess: function(data){
							if (data.status != 300) {
								NIRVANA_LOG.send({
									target : 'effectAnalyseTool_modify_bid',
									oldvalue : bid,
									newvalue : wbid
								});

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
								
								var tableList = ui.util.get("analyseTableList");
								tableTool.modifyTableData(tableList.datasource,winfoid,"bid",wbid);
								tableTool.modifyTableData(me.getContext("allTableData"),winfoid,"bid",wbid);
								tableTool.modifyTableData(me.getContext("filteredAllTableData"),winfoid,"bid",wbid);
								
								me.getContext('listDataObj')[winfoid]['bid']=wbid;                          //修改所有查询数据的值
								 if (tableList.filterCol["bid"] == true) {
                                    tableTool.filterChangeHandler(me)();
                                }
                                else {
                                    tableList.render(tableList.main);
									tableTool.showFolders(action);//添加监控文件夹
                                    
                                }
							}
						}
					}
				}
			}
		});
	},
	bidValidate: function(bid){
	
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
	inlineWmatch:function(target,action){
		var me = action,
			parent = target.parentNode,
			winfoid = parent.getAttribute("winfoid"), 
			tableTool = nirvana.effectAnalyse.keywordList, 
			wmatch = tableTool.getLineData(target,me.getContext('analyseListData')).wmatch;
		
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

								NIRVANA_LOG.send({
									target : 'effectAnalyseTool_modify_wmatch',
									oldvalue : wmatch,
									newvalue : match
								});

								var modifyData = {};
								modifyData[winfoid] = {
									"wmatch": match
								};
								fbs.avatar.getMoniWords.ModCache("winfoid", modifyData);
								fbs.material.ModCache('wordinfo', "winfoid", modifyData);
							    var tableList = ui.util.get("analyseTableList");
								tableTool.modifyTableData(tableList.datasource,winfoid,"wmatch",match);//修改表格当前的展现值
								tableTool.modifyTableData(me.getContext("allTableData"),winfoid,"wmatch",match);//修改表格数据缓存的当前展现值
								tableTool.modifyTableData(me.getContext("filteredAllTableData"),winfoid,"wmatch",match);//修改表格数据缓存的当前展现值
								//如何当前正在对匹配模式进行筛选，则需要将数据重新筛选一遍
								me.getContext('listDataObj')[winfoid]['wmatch']=match;                          //修改所有查询数据的值
								
                               // console.log(tableList.filterCol["wmatch"]);
                                if (tableList.filterCol["wmatch"] == true) {
                                    tableTool.filterChangeHandler(me)();
                                }
                                else {
                                    tableList.render(tableList.main);
									tableTool.showFolders(action);//添加监控文件夹
                                    
                                }
								
							}
						}
					}
				}
			}
		});
	},
	
	/**
	 * 行内查看创意
	 * @param {Object} target
	 * @param {Object} action
	 */
	inlineIdea:function(target,action){
			var me = action,
                controlMap = me._controlMap;
	        var tableTool=nirvana.effectAnalyse.keywordList,
		        parent = target.parentNode,
			    winfoid = tableTool.getLineData(target,me.getContext('analyseListData')).winfoid, 
			    planid = tableTool.getLineData(target,me.getContext('analyseListData')).planid,
			    unitid = tableTool.getLineData(target,me.getContext('analyseListData')).unitid;
				
			nirvana.util.openSubActionDialog({
			id: 'affectIdeaDialog',
			title: '创意',
			width: 630,
			actionPath: 'manage/editIdea',
			maskLevel : 2,
			params: {
				action : me,
				fromProcedure : 'effectAnalyse',
				winfoid :winfoid,
				planid : planid,
				unitid : unitid
		     },
			onclose: function(){}
			});
			clearTimeout(nirvana.subaction.resizeTimer);
			baidu.g('ctrldialogaffectIdeaDialog').style.top = baidu.page.getScrollTop() + 50 +'px';
		
	},
	
	/**
	 * 成功获取创意后的回调函数
	 * @param {Object} action
	 * callback action的 CONTEXT_INITER_MAP中的callback
	 */
	getIdeaListSuccessHandler:function(action,callback){
		var me = action,
		    tableTool=nirvana.effectAnalyse.keywordList;
		return function(res){
			var data = res.data, listData,
				pageNo, pageSize = 5,
	            listData = data.listData,
				pageSize = me.getContext('pageSize'), 
	            pageNo = me.getContext('pageNo') || 1, 
		        totalNum = listData.length,
			    totalPage = Math.ceil(totalNum / pageSize),
			    datasource;
			    
		    me.setContext('totalNum', totalNum);
		    me.setContext('totalPage', totalPage);
			me.setContext('allTableData', listData);
			datasource = tableTool.getDataPerPage(me, pageSize,1, me.getContext("allTableData"));
		    me.setContext('ideaTableData', datasource);		
	    	callback();
					
		}
		
	},
	
	/**
	 * 创意表格翻页响应事件
	 * @param {Object} value  当前待显示页页码
	 */
	getIdeaPaginationHandler : function (actionInstance) {
	   	var me = actionInstance ;
		return function(value){
			var effectTool = nirvana.effectAnalyse.keywordList,
			    ideaTableList = ui.util.get('analyseIdeaTable'),
			    datasource,
			    pageSize;
			
			pageSize = me.getContext('pageSize');
			me.setContext('pageNo',value);
	        datasource = effectTool.getDataPerPage(me, pageSize, value, me.getContext("allTableData"));
			me.setContext('analyseIdeaTable', datasource);		
			ideaTableList.datasource = datasource;
		    ideaTableList.render(ideaTableList.main);
		};
		   
		
	},
		/**
		 * 创意显示
		 * @param item 当前行内容Object
		 * @param row 行
		 * @param col 列
		 * @returns
		 */
		ideainfo : function(item, row, col){
			var tmp = [],
	            className = 'idea noborder',
				html = [];
	        
	        //创意内容
	        var ideaData = [item.title, item.desc1, item.desc2, item.showurl];
	        tmp = IDEA_RENDER.idea(ideaData, className);
	        
	        var _bc = "";
	        if (item.shadow_title && item.shadow_title != "" && item.shadow_title != 'null') {
	            _bc = 'style="background:#ffdfd5"';
	        }
	        
	        
	        var href = item.url;
	        
	        if (tmp.join("").indexOf("<u>") != -1) {
	            tmp[0] = '<div class="' + className + '" ' + _bc + ' title="访问URL：&#13;&#10;' + escapeQuote(href) + '&#13;&#10; &#13;&#10;您的创意包含了通配符，创意在展现时，将以触发创意展现的关键词替代通配符。插入创意的关键词在推广页面中显示，将提高客户对创意的关注度和点击率。">';
	        } else {
	            tmp[0] = '<div class="' + className + '" ' + _bc + ' title="访问URL：&#13;&#10;' + escapeQuote(href) + '&#13;&#10; &#13;&#10;建议您在创意中包含通配符，通配符可以帮助您在创意中插入关键词。插入创意的关键词在推广页面中显示，将提高客户对创意的关注度和点击率。">';
	        }
	        
	        for (key in item){
	            item[key] = escapeHTML(unescapeHTML(item[key]));
	        }
	        
	        
	        if (item.shadow_title && item.shadow_title != "" && item.shadow_title != 'null') {
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
	            tmp[tmp.length] = '<p style="text-align:right"><a href="javascript:void(0);" onclick="viewIdeaSwap(this, ' + item.ideaid + ', ' + item.shadow_ideaid + ');return false" data-log="{target:\'viewIdeaSwap' + item.ideaid + '-btn\'}">查看修改后创意</a></p>';
	    
	            
	        }
			
			html[html.length] = '<div class="edit_td">';
			html[html.length] = '<div class="idea_wrapper">' + tmp.join("") + '</div>';
			html[html.length] = '<a class="edit_btn" id="IdeaEdit_' + item.ideaid + '" edittype="ideaid" ideaid="' + item.ideaid + '"></a>';
	        html[html.length] = '</div>';
			
			return html.join('');
		},
		
		/**
		 * 编辑创意处理函数
		 */
		editIdeaHandler:function(target,action){
			var me = action,
			parent = target.parentNode,
			tableTool=this,
			winfoid = parent.getAttribute("winfoid"), 
			param = {};
			param.ideaid = tableTool.getLineData( target, me.getContext("ideaTableData")).ideaid;
				param.type = "edit";
				param.changeable = false;
				param.fromSubAction = me;//父级子action ,通过传次参数来控制子action的刷新
				param.maskLevel = 3;
				nirvana.aoWidgetAction.createSubActionForIdea(param, me);
			
		},
		
		/**
		 * 新增创意处理函数
		 */
		addIdeaHandler:function(action){
			var me = action,
			//parent = target.parentNode,
			tableTool=this,
			param = {},
			item={};
            
            
            return function(){
                //winfoid = parent.getAttribute("winfoid"), 
                //监控
              
                item.unitid = action.arg.unitid;
                item.planid = action.arg.planid;
                //console.log(item);
                fbs.material.getCount({
                    countParam: {
                        mtlLevel: 'unitinfo',
                        mtlId: item.unitid,
                        targetLevel: 'ideainfo'
                    },
                    
                    onSuccess: function(response){
                        var data = response.data;
                        if (data >= IDEA_THRESHOLD) { //数量到达上限
                            ui.Dialog.alert({
                                title: '通知',
                                content: nirvana.config.ERROR.IDEA.ADD['712']
                            });
                        }
                        else {
                            param.unitid = item.unitid;
                            param.planid = item.planid;
                            param.type = "add";
                            param.changeable = false;
                            param.fromSubAction = me;
                            nirvana.aoWidgetAction.createSubActionForIdea(param, me);
                        }
                    },
                    
                    onFail: function(response){
                        ajaxFailDialog();
                    }
                });
            }
			
		},
	/**
	 * 修改表格数据中对应字段的值
	 * @param {Object} data 表格数据集合
	 * @param {Object} winfoid 
	 * @param {Object} name 字段名
	 * @param {Object} value 修改后的值
	 */
	 
	modifyTableData:function (data, winfoid, name, value){
		var len = data.length;
		for (var i = 0;i < len; i++){
	//		console.log("yuan--"+data[i].winfoid+"---"+winfoid);
				 if(data[i].winfoid==winfoid){
				 	data[i][name]=value;
					break;
				 }
				}
		
	},
	
	/**
	 * 自定义列确认
	 * @param {Object} action
	 */
	userDefineOk: function(action){
		var me = action;
		return function(attrList){
			  //监控
           var logparam = {};
                logparam.userDefine = 'ok';
                nirvana.effectAnalyse.lib.logCenter("", logparam);
			var ud = nirvana.manage.UserDefine, 
			localList = [], 
			lastLocalList = me.getContext('lastLocalListWord'), data = [], i, len;
			
			for (i = 0, len = attrList.length; i < len; i++) {
				localList[i] = attrList[i];
			}
			
			var tempAll = nirvana.effectAnalyse.keywordList.allTableFields;
			data.push(tempAll[localList[0]]);
			data.push(tempAll["editIdea"]);//手动添加创意列
			for (i = 1, len = localList.length; i < len; i++) {
				data.push(tempAll[localList[i]]);
			}
			
			me.setContext('analyseTableFields', data);
			
			localList = baidu.json.stringify(localList);
			if (!lastLocalList || lastLocalList != localList) {
				ui.util.get('analyseTableList') && ui.util.get('analyseTableList').resetTableAfterFieldsChanged();
				me.setContext('lastLocalListWord', localList);
			}
			me.setContext('lastLocalListWord', localList);
			
								
			var tableList = ui.util.get("analyseTableList");
			tableList.fields=data;//必须手动设置，否则关联不上
			tableList.resetTableAfterFieldsChanged();
			tableList.render(tableList.main);
			
			
		}
	},
	
	/**
	 * 表格状态列渲染函数，去掉了行内修改状态的按钮
	 * @param {Object} type
	 * @param {Object} statusCode
	 * @param {Object} pauseStat
	 * @param {Object} params
	 */
	buildStat : function (type, statusCode, pauseStat, params) {
	var paramString = '';
	if(params){
		paramString = baidu.json.stringify(params);//params里仅携带id等没有xss风险的属性
	}
    var tpl = '<div class="{0}"><span class="status_text"><span class="status_icon" data=\'' + paramString + '\'></span>{1}</span> </div>';
    return nirvana.util.generateStat(type, statusCode, tpl, pauseStat);
},

   /**
    * 漏斗数据渲染
    * @param {Object} data
    */
    funnelAnalysisRender:function(data){
		if( typeof data !='object'){//无数据时不传参数data
		       baidu.g("analyseShowsNum").innerHTML = "-";
                baidu.g("analyseClksNum").innerHTML = "-";
                baidu.g("analysePvNum").innerHTML = "-";
                baidu.g("analyseTransNum").innerHTML = "-";
            if (data == 0) {//无转化字段
                baidu.addClass(baidu.g("analyseStageList"),'no_trans');
            }else{
				 baidu.removeClass(baidu.g("analyseStageList"),'no_trans');
				
			}
			
		}
		else{
			baidu.g("analyseShowsNum").innerHTML = data.shows;
			baidu.g("analyseClksNum").innerHTML = data.clks;
			if(data.visit<0){//无浏览数据时(必无转化)
			baidu.g("analysePvNum").innerHTML = "-";
		    baidu.addClass(baidu.g("analyseStageList"),'no_trans');
			}
			else{
			baidu.g("analysePvNum").innerHTML = data.visit;
		    if(data.trans<0) {//无转化数据时
		     baidu.addClass(baidu.g("analyseStageList"),'no_trans');
			}
			else{
				 baidu.removeClass(baidu.g("analyseStageList"),'no_trans');
				 baidu.g("analyseTransNum").innerHTML = data.trans; 
			}
			}	
		}
		
		
	},
	/**
	 * 设置表尾flash选择数据
	 * @param {Object} data
	 * @param {Object} action
	 */
	setTableFootFlashData:function(data,action){
		var me = action,
			table = ui.util.get("analyseTableList"),
			avgFlashData = {},
			tableFoot=[];
			avgFlashData.avg = '已选关键词平均值';
			avgFlashData.avgClks = data[0];
            avgFlashData.avgPaysum = data[1];
			avgFlashData.avgShows = data[2];
			avgFlashData.avgTrans = data[3];
			avgFlashData.avgAvgprice = data[4];//待填充
			avgFlashData.avgClkrate = data[5];//待填充
			me.getContext("avgData")[0]=avgFlashData;
	},
	
	/**
	 * 设置表尾全部关键词平均值
	 * @param {Object} action
	 */
	setTableFootAllData:function(action){
	    var me=action,
		    avgAllData = {},
			tableFoot=[],
			
			data=[];
			data=me.getContext("keywordAvg");
		    //data=[1,2,3,3,5,7];
			avgAllData.avg = '图中关键词平均值';
			avgAllData.avgClks = data[0];
            avgAllData.avgPaysum = data[1];
			avgAllData.avgShows = data[2];
			avgAllData.avgTrans = data[3];
			avgAllData.avgAvgprice = data[4];//待填充
			avgAllData.avgClkrate = data[5];//待填充
			me.getContext("avgData")[1]=avgAllData;
	},
	/**
	 * 复选响应事件
	 * @param {Object} selected
	 */
	selectListHandler : function (action) {
        var me = action,
            controlMap = me._controlMap; 
        return function (selected) {
            var enabled = selected.length > 0,
				modBid = controlMap.analyseModBid,
				modWmatch = controlMap.analyseModMatch,
                
                kr = controlMap.analysekr,
               
                monitor = controlMap.analyseAddMonitor;
			
            me.selectedList = selected;	
	//		console.log("selected")
	//		console.log(selected)
            kr.disable(!enabled);
			monitor.disable(!enabled);
			modBid.disable(!enabled);
			modWmatch.disable(!enabled);
        }  
        
    },
	
	/**
	 * 获取选中行的数据
	 * @param {Object} id planid等需要得到的数据
	 * @return {Array} ids [planid, planid……]
	 */
    getSelected : function (id,action) {
        var me = action,
            selectedList = me.selectedList,
            data = me.getContext('analyseListData'),
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
	isUseUnitbid : function(action){
		var me = action,
            selectedList = me.selectedList,
            data = me.getContext('analyseListData'),
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
	 */
	modBidClickHandler:function(action){
		//	console.log("winfoid");
			var me = action,
            controlMap = me._controlMap;
						
	    return function(){
		
			var tableTool=nirvana.effectAnalyse.keywordList;
		    nirvana.util.openSubActionDialog({
			id: 'modifyWordBidDialog',
			title: '关键词出价',
			width: 440,
			actionPath: 'manage/modWordPrice',
			maskLevel : 2,
			params: {
				action : me,
				fromProcedure : 'effectAnalyse',
				winfoid : tableTool.getSelected('winfoid',me),
				bid : tableTool.getSelected('bid',me),
				unitbid : tableTool.getSelected('unitbid',me),
				isUseUnitbid : tableTool.isUseUnitbid(me),
				name:tableTool.getSelected('showword',me)
		     },
			onclose: function(){}
			});
			clearTimeout(nirvana.subaction.resizeTimer);
			baidu.g('ctrldialogmodifyWordBidDialog').style.top = baidu.page.getScrollTop() + 200 +'px';
			
		};
		
	},
	
	/**
	 * 批量修改匹配模式
	 */
	modWmatchClickHandler:function(action){
		var me = action,
            controlMap = me._controlMap;
		
        return function(){
		var tableTool=nirvana.effectAnalyse.keywordList;
			nirvana.util.openSubActionDialog({
				id: 'modifyWordWmatchDialog',
				title: '匹配方式',
				width: 440,
				actionPath: 'manage/modWordWmatch',
				params: {
					winfoid : tableTool.getSelected('winfoid',me),
					action : me,
					fromProcedure : 'effectAnalyse'
			    },
				onclose: function(){
				}
			});
			clearTimeout(nirvana.subaction.resizeTimer);
			baidu.g('ctrldialogmodifyWordWmatchDialog').style.top = baidu.page.getScrollTop() + 200 +'px';
		    
		};
	},
	
	
	/**
	 * 批量添加监控
	 * @param {Object} action
	 */
	monitorClickHandler: function(action){
		var me = action,
            controlMap = me._controlMap,
			tableTool = nirvana.effectAnalyse.keywordList;
		
        return function(dialog){
			nirvana.util.openSubActionDialog({
				id: 'monikeywordDialog',
				title: '监控该关键词',
				width: 480,
				actionPath: 'manage/moniKeyword',
				params: {
					wordChosen : tableTool.getSelected(["winfoid","showword","wmatch","wctrl"],me),
					action : me,
					fromProcedure : 'effectAnalyse'
					
				},
				onclose: function(){
				
				}
			});
			clearTimeout(nirvana.subaction.resizeTimer);
			baidu.g('ctrldialogmonikeywordDialog').style.top = baidu.page.getScrollTop() + 135 +'px';
		};
	},
	
	/**
	 * 关键词推荐
	 * @param {Object} action
	 */
	analysekrHandler:function(action){
		var tableTool = nirvana.effectAnalyse.keywordList,
		    me = action;		
			
		return function(){
			nirvana.util.openSubActionDialog({
			id: 'analyseKRDialog',
			title: '拓展关键词',
			width: 630,
			actionPath: 'manage/analyseKR',
			maskLevel : 2,
			params: {
				action : me,
				wordlist : tableTool.getSelected('showword',me),
				unitid : tableTool.getSelected('unitid',me),
				planid : tableTool.getSelected('planid',me)
		     },
			onclose: function(){}
			});
			clearTimeout(nirvana.subaction.resizeTimer);
			baidu.g('ctrldialoganalyseKRDialog').style.top = baidu.page.getScrollTop() + 50 +'px';
			var logparam = {};
            logparam.batchOpType = 'kr';
            nirvana.effectAnalyse.lib.logCenter("", logparam);
		};
			
		
	}
	,
		
	/**
	 * 显示监控文件夹图标
	 */
	showFolders:function(action){
		var me = action,
		    tableTool=nirvana.effectAnalyse.keywordList;
		var words = me.getContext('analyseListData') || [],
			ids = [];
		for (var i = 0, l = words.length; i < l; i++) {
			ids[ids.length] = words[i].winfoid;
		}
		//console.log(ids);
		if (ids.length > 0) {
			fbs.avatar.getWinfoid2Folders({
				ids: ids,
				onSuccess: tableTool.showFoldersHandler(me),
				onFail: function(data){
					ajaxFailDialog();
				}
			})
		}
	},
	showFoldersHandler:function(action){
		var me = action;
		return function(data){
			var dat = data.data,
				words = me.getContext('analyseListData'),
				winfoids = [];
			for (var item in dat) {
				winfoids[winfoids.length] = +item;
			}
			var folders = ui.Bubble.source.analyseMonitorFolderList.folders;
			for (var i = 0, l = words.length; i < l; i++) {
				var id = +words[i].winfoid;
				if(baidu.array.indexOf(winfoids,id) != -1){
					
				baidu.dom.addClass(baidu.g("analyseFolderList" + id),"ui_bubble");
					id = id.toString();
					folders[id] = dat[id];
				}
			}
			ui.Bubble.init();
		}
	},
	
	/**
	 * 每页显示行数选择
	 * @param {Object} value
	 */
	
	getPageSizeHandler : function (action) {
	    var me = action,
		    tableTool=nirvana.effectAnalyse.keywordList;
            
            return function(value){
                var analyseTableList = ui.util.get('analyseTableList'),
				    analysePagination = ui.util.get('analysePagination'), 
					totalNum = me.getContext('totalNum'), 
					totalPage, datasource;
                me.setContext('analysePageSize', value);
                datasource = tableTool.getDataPerPage(me, value, 1, me.getContext("filteredAllTableData"));//(me, pageSize, value, me.getContext("allTableData"));
                me.setContext('analyseListData', datasource);
                analyseTableList.datasource = datasource;
                analyseTableList.render(analyseTableList.main);
                totalPage = Math.ceil(totalNum / value);
				 if (totalPage <= 1) {
						        baidu.dom.hide('ctrlpageanalysePagination');
						    }
						    else {
						        baidu.dom.show('ctrlpageanalysePagination');
						    }
                me.setContext('totalPage', totalPage);
                me.setContext('analysePageNo', 1);
                analysePagination.total = totalPage;
                analysePagination.page = 1;
                analysePagination.render(analysePagination.main);
                
            }
			
       
	},
	/**
		 * 表格排序处理
		 * @param {Object} sortField
		 * @param {Object} order
		 */
    sortHandler: function(action){
	//	console.log("?????");
		var me=action,
		    tableTool=nirvana.effectAnalyse.keywordList;
		return function(sortField, order){
			
        var filtedDatasource = me.getContext("filteredAllTableData"), 
		    allDatasource = me.getContext("allTableData"),
		    analyseTableList = ui.util.get('analyseTableList'),
			analysePagination = ui.util.get('analysePagination'), 
			totalNum = me.getContext('totalNum'), 
		
		pageSize = me.getContext('analysePageSize'), 
		field = sortField.field;
        //页码
        me.setContext('analysePageNo', 1);
        analysePagination.page = 1;
        analysePagination.render(analysePagination.main);
        
        me.setContext("orderBy", field);
        me.setContext("orderMethod", order);
        //数据
        var allData = nirvana.manage.orderData(allDatasource, field, order),
		    filterData = nirvana.manage.orderData(filtedDatasource, field, order),
		    currentData=tableTool.getDataPerPage(me, pageSize, 1, filterData);
        me.setContext("allTableData",allData);
		me.setContext("filteredAllTableData",filterData);
	    me.setContext('analyseListData', currentData);
        analyseTableList.datasource = currentData;
        analyseTableList.render(analyseTableList.main);
        tableTool.showFolders(me);//添加监控文件夹
    }
	}
	,
	filterChangeHandler:function(action){
		var me=action,
		    effectTool = nirvana.effectAnalyse.keywordList;;
        return function(){
            var result = nirvana.manage.FilterControl.tableFilterData(me, me.getContext("allTableData")),
			    totalNum = result.length,
			    pageSize=me.getContext("analysePageSize");
                me.setContext("filteredAllTableData", result)
            var totalPage = Math.ceil(totalNum / pageSize);
               me.setContext('totalNum', totalNum);
               me.setContext('totalPage', totalPage);
               me.setContext('analysePageNo', 1);
		 effectTool.getPaginationHandler(me)(1);
		 //渲染分页控件
		//  effectTool.funnelAnalysisRender();
	    var analysePage = ui.util.get('analysePagination');
	        analysePage.page = 1;//将页码设置为第一页
		    me.setContext('analysePageNo',1);
		    me.setContext('totalNum', totalNum);
	        me.setContext('totalPage', totalPage);
	    if (totalPage <= 1) {
	        baidu.dom.hide('ctrlpageanalysePagination');
	    }
	    else {
	        baidu.dom.show('ctrlpageanalysePagination');
	    }

	  ui.util.get('analysePagination').total = totalPage;
	  analysePage.render(analysePage.main);
	      
        }
	},
	
	/**
	 * 用于用户自定义列对话框不能全部显示时的处理
	 * @param {Object} action
	 */
	userDefineDilogShowHandler:function(action){
		var me = action;
		
		if(baidu.ie){
		//	baidu.g('ToolsEffectContainer').style.position = 'static';
		
		}
		    return function(){
		   	var tableHeight = 0,//表格body的高度
	            minHeigh= 192,//让自定义对话框能显示的表格最小高度
                analyseTableList = ui.util.get('analyseTableList');
				if(analyseTableList.datasource.length==0){//表格无数据时
					minHeigh=255;
				}
			//console.log("kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk");
			tableHeight = baidu.g("ctrltableanalyseTableListbody").offsetHeight;//表格body的高度
	      //	console.log(tableHeight);
		
		  if(tableHeight>minHeigh){
				return;
			}
			else{
                var repareHeight = minHeigh - tableHeight;
                baidu.g("analyse_adaptUserDefine").style.height = repareHeight + "px";
                baidu.g("analyse_adaptUserDefine").style.display = "block";
                var container = baidu.g("Tools_effectAnalyse_body")
                container.scrollTop = container.scrollHeight;//滚动条置底
             }
		   }
		   
	},
	
	/**
	 * 用户自定义列关闭响应 用于用户自定义列不能完全显示时
	 */
	userDefineDilogCloseHandler:function(){
			baidu.g("analyse_adaptUserDefine").style.display = "none";
		},
		
	/**
	 * 下载按钮响应事件
	 * @param {Object} action
	 */	
	downLoadHandler:function(action){
		var me=action;
		
		return function(){
			         var urlParam = [],
				//	 'tool/optlog/download_optlog.do?'
						url = '/nirvana/tool/effectana/downloadwordinfos.do?',
                        startTime = me.getContext("currentParams").starttime,
					    endTime = me.getContext("currentParams").endtime, 
						len,
						winfoids,
						userid = nirvana.env.USER_ID,
                        tableData = me.getContext("analyseListData");
                        len = tableData.length;
                        winfoids = tableData[0].winfoid;
                        for (var i = 1; i < len; i++) {
                            winfoids += ">" + tableData[i].winfoid;//多个winfoids之间用>连接。
                        }
                        urlParam.push("userid=" + userid);
                        urlParam.push("winfoids=" + winfoids);
                        urlParam.push("starttime=" + startTime);
                        urlParam.push("endtime=" + endTime);
                       // console.log("sss"+url + urlParam.join('&'));
                        window.open(url + urlParam.join('&'));
						//日志
						var logparam = {};
              			logparam.tableOp = 'download';
               			nirvana.effectAnalyse.lib.logCenter("", logparam);
                
			
		}
			
		}
		
	
};
/***
 * 定义flash相关属性、方法
 * 海南添加
 */
nirvana.effectAnalyse.flashControl = {
	listDataObj : {},
	actionInstance : {},
	//生成flash
	initAnalyseFlashChart : function(actionInstance){
		nirvana.effectAnalyse.flashReady = false;
		
		this.actionInstance = actionInstance;
		var url = './asset/swf/analyser.swf';
        baidu.g('analyserFlashContainer').innerHTML = baidu.swf.createHTML({
            id: "analyserFlash",
            url: url,
            width: '100%',
            height: '400',
            scale: 'showall',
            wmode: 'Opaque',
            allowscriptaccess: 'always',
			'vars' : {
                AS_CALL_JS_FLASH_LOADED:"nirvana.effectAnalyse.flashControl.effectana_flash_loaded", 
                AS_CALL_JS_SELECT_DATA:"nirvana.effectAnalyse.flashControl.effectana_flash_select_data", 
                AS_CALL_JS_STATS : "nirvana.effectAnalyse.flashControl.effectana_flash_stats"
             }
        });
		
	},

	//组装数据给flash
	displayAnalyseFlashChart : function(actionInstance){
		var me = actionInstance || this.actionInstance,
		    itemsSelected = me.getContext("flashItemOptionSelected")+'',
			extraData = me.getContext("extraData"),
			listData = me.getContext("listData"),
			flashStatData = me.getContext('flashStatTableData'),
			flashTableData = {},
			pointsAllItem = [],
			xfield,yfield,xmax,ymax,xsplit,ysplit,xname,yname;

		if(nirvana.effectAnalyse.flashReady == true){
		    nirvana.util.loading.init();

		    var showMax = extraData.showMax,
			    clkMax = extraData.clkMax,
				payMax = extraData.payMax,
				transMax = extraData.transMax,
				showAvg = extraData.showAvg,
				clkAvg = extraData.clkAvg,
				payAvg = extraData.payAvg,
				transAvg = extraData.transAvg;
			//指标切换时重新定义x轴和y轴，flash点重新生成
			switch (itemsSelected) {
				case '1':
				    xfield = '展现';
                    yfield = '点击';
                    xmax = showMax;
                    ymax = clkMax;
					xsplit = showAvg;
					ysplit = clkAvg;
					xname = 'shows';
					yname = 'clks';
					flashTableData = flashStatData.clkShow;
                    break;
				case '2':
				    xfield = '点击';
                    yfield = '消费';
                    xmax = clkMax;
                    ymax = payMax;
					xsplit = clkAvg;
                    ysplit = payAvg; 
					xname = 'clks';
                    yname = 'paysum';
					flashTableData = flashStatData.payClk;             
                    break;
				case '3':
				    xfield = '展现';
                    yfield = '消费';
                    xmax = showMax;
                    ymax = payMax;
                    xsplit = showAvg;
                    ysplit = payAvg;
					xname = 'shows';
                    yname = 'paysum';
					flashTableData = flashStatData.payShow;
                    break;
				case '4':
				    xfield = '点击';
                    yfield = '转化';
                    xmax = clkMax;
                    ymax = transMax;
                    xsplit = clkAvg;
                    ysplit = transAvg;
					xname = 'clks';
                    yname = 'trans';
					flashTableData = flashStatData.transClk;				
					break;
				case '5':
				    xfield = '转化';
                    yfield = '消费';
                    xmax = transMax;
                    ymax = payMax;
                    xsplit = transAvg;
                    ysplit = payAvg;
					xname = 'trans';
                    yname = 'paysum';
					flashTableData = flashStatData.payTrans;
					break;
				default:
				    break;
			}
		    //组装flash点
			for(var i = 0;i < listData.length;i++){
				var tmp = {},
				    sd = listData[i];
				tmp.showword = sd.showword;
				tmp.winfoid = sd.winfoid;
				tmp.x = sd[xname];
				tmp.y = sd[yname];
				pointsAllItem.push(tmp);
			}
			
			
			var params = [xfield,yfield,xmax,ymax,xsplit,ysplit,pointsAllItem];
		//	var params = [xfield,yfield,349,249,220,150,pointsAllItem];
		//	console.log(params);
		//	console.log(pointsAllItem);
		
		me.setContext('currentXfield',xfield);
		me.setContext('currentYfield',yfield);
		
		me.setContext('allKeywordCount',listData.length);
		
		
		/**flash ready前暂时注释掉*/
        invokeFlash('analyserFlash','setData2Flash',params);
		
		//调用右侧统计小表格初始化方法
        nirvana.effectAnalyse.flashControl.renderFlashStatTable(flashTableData,xsplit,ysplit,true);
		}

	},
	//展现flash右侧的统计小表格
	renderFlashStatTable : function(flashTableData,xAvg,yAvg,isRender){
		var me = this.actionInstance,
		    itemsSelected = me.getContext("flashItemOptionSelected")+'',
			flashTableData = flashTableData,
		    statTable = me._controlMap.flashStatTable,
			isRender = isRender || true;
	//	console.log('renderFlashStatTable!!!!!');
		var statFileds = [{
                        content: function(item){
							if (typeof item.area != 'undefined') {
								var html = [];
								html[html.length] = '<div><a href="javascript:void(0)" rel="'+item.index+'">';
								html[html.length] = item.area;
								html[html.length] = '</a><span class="ui_bubble" bubblesource="defaultHelp" bubbletitle="'+item.area+'">&nbsp;</span></div>';
								return html.join("");
							}else if (typeof item.avg != 'undefined'){
								return item.avg;
							}
                        },
                        title: '区域',
                        field : 'area',
                        sortable : false,
                        width: 80                      
                    }, 
                    {
                        content: 'count',
                        title: '关键词数',
                        field : 'count',
                        sortable : false,
                        width: 80
                    }, 
                    {
                        content: function(item){
                            if (typeof item.avgX != 'undefined') {
                                return fixed(item.avgX);
                            }else{
                                return "-";
                            }
                        },//'avgX',
                        title: '平均' + me.getContext('currentXfield'),
                        field : 'avgX',
                        sortable : false,
                        width: 80
                    }, 
                    {
                        content: function(item){
                            if (typeof item.avgY != 'undefined') {
                                return fixed(item.avgY);
                            }else{
                                return "-";
                            }
                        },//'avgY',
                        title: '平均' + me.getContext('currentYfield'),
                        field : 'avgY',
                        sortable : false,
                        width: 80
                    }];
	
		statTable.fields = statFileds;
		statTable.datasource = [
		      {
			  	'area':'A区',
			    'count':flashTableData.aWcnt,
			    'avgX':flashTableData.aXAvg,
			    'avgY':flashTableData.aYAvg,
				'index':0
			   },
			   {
                'area':'B区',
                'count':flashTableData.bWcnt,
                'avgX':flashTableData.bXAvg,
                'avgY':flashTableData.bYAvg,
				'index':1
               },
			   {
                'area':'C区',
                'count':flashTableData.cWcnt,
                'avgX':flashTableData.cXAvg,
                'avgY':flashTableData.cYAvg,
				'index':2
               },
			   {
                'area':'D区',
                'count':flashTableData.dWcnt,
                'avgX':flashTableData.dXAvg,
                'avgY':flashTableData.dYAvg,
				'index':3
               },
			   {
                'avg':'平均值',
                'count':'-',
                'avgX':fixed(xAvg),
                'avgY':fixed(yAvg)
               }];
			
		statTable.render();
		ui.Bubble.init();
		//首次渲染默认将c区勾选上
		
		if(isRender){
			var selectedRow = statTable.getRow(2);
			baidu.addClass(selectedRow,'flashTableActiveRow');
			me.setContext('currentSelectRow',2);
		}
	//	console.log(statTable);
	},
	//象限描述建议区域
	showFlashAreaStat : function(selectedAreas,selectedLength,highlightArea){
		var me = this.actionInstance,
		    statTable = me._controlMap.flashStatTable,
		    itemIndex = me.getContext("flashItemOptionSelected") - 1,
			areaIndex = parseInt(selectedAreas,2);
	//	console.log(selectedAreas);
	//	console.log(areaIndex);
		if (selectedLength == 0) {
			baidu.g('flashAreaStat').innerHTML = "您没有选中任何关键词，请重新选择。";
			baidu.g('SelectedKeywordCount').innerHTML = "(" + selectedLength + "/" + me.getContext('allKeywordCount') + ")";	
		}else {
			var statText = nirvana.effectAnalyse.lib.flashStatContent[itemIndex][areaIndex];
			baidu.g('flashAreaStat').innerHTML = statText;
			baidu.g('SelectedKeywordCount').innerHTML = "(" + selectedLength + "/" + me.getContext('allKeywordCount') + ")";
		}
		
		//改变选中区域颜色，逻辑有点变态...但是没办法..
		var selectedRow = statTable.getRow(0);
		var isActive = true;
		if (selectedRow != null) {
			for (var i = 0; i < 4; i++) {	
				var selectedRow = statTable.getRow(i);
				if (baidu.dom.hasClass(selectedRow, 'flashTableActiveRow')) {
					baidu.removeClass(selectedRow, 'flashTableActiveRow');
				}
			}
			switch (areaIndex) {
				case 8:
					selectedRow = statTable.getRow(0);
					break;
				case 4:
					selectedRow = statTable.getRow(1);
					break;
				case 2:
					selectedRow = statTable.getRow(2);
					break;
				case 1:
					selectedRow = statTable.getRow(3);
					break;
				default:
					isActive = false;
					break;				
			}
			if (highlightArea && isActive) {
				baidu.addClass(selectedRow, 'flashTableActiveRow');
			}
		}
	},
	//methods for flash to call
	effectana_flash_loaded : function(){
	//	console.log('flash loaded');
		nirvana.effectAnalyse.flashReady = true;
		nirvana.effectAnalyse.flashControl.displayAnalyseFlashChart();
	},
	/**
     * @params selectedIDs    Array数组类型    每个元素是选中的数据点id  无序
     * @params selectedAreas  String字符串类型   该次选择操作涉及到的象限0000
    */
	effectana_flash_select_data : function(selectedIDs, selectedAreas,highlightArea){
		var me = this.actionInstance;
	    if(selectedIDs == null){
			return;
		}
		var myListData = me.getContext('listDataObj'),
		    tableDataObj = {},
		    tableListData = [],
			clksum = 0, showsum = 0, paysum = 0, transum = 0,
			selectedLength = selectedIDs.length;
		for(var i = 0;i < selectedLength; i++){
			var tmp = myListData[selectedIDs[i]];
			if(typeof tmp != 'undefined'){
				tableListData.push(tmp);
				//for已选平均值
				clksum += (tmp.clks - 0);
				showsum += (tmp.shows - 0);
				paysum += (tmp.paysum - 0);
				transum += (tmp.trans - 0);
			}
		}
		if (selectedLength == 0) {
			tableDataObj.selectedAvg = [0, 0, 0, 0, 0, 0];
		}else {
			var clks = fixed(clksum / selectedLength), 
			    shows = fixed(showsum / selectedLength), 
				pay = fixed(paysum / selectedLength), 
				trans = fixed(transum / selectedLength), 
				avgPay = (clksum == 0 ? 0 : (paysum / clksum)), 
				clkRate = (showsum == 0 ? 0 : (clksum / showsum));
			tableDataObj.selectedAvg = [clks, pay, shows, trans, fixed(avgPay), floatToPercent(clkRate)];
		}
		tableDataObj.listData = tableListData;

		nirvana.effectAnalyse.keywordList.renderFlashSelectedTable(me,tableDataObj);
		
		//通过传入的所选象限值，确定右侧优化建议的文字描述
		this.showFlashAreaStat(selectedAreas,selectedLength,highlightArea);
	//	nirvana.util.loading.done();
		baidu.show('analyserFlashStat');
		nirvana.util.loading.done();
	},
	//flash监控相关
	effectana_flash_stats : function(type){
		var logparam = {};
		logparam.flashEventType = type;
		nirvana.effectAnalyse.lib.logCenter("flash",logparam);
		
	},
	//鼠标滚轮事件响应
	scrollFunc:function(e){ 
	    var delta=0; 
	    e=e || window.event;

		if(e.wheelDelta){
			delta = e.wheelDelta > 0 ? 3 : -3;
		}else if(e.detail){
	       //ff下e.detail鼠标向上时是-3，向下是3....
			delta = e.detail > 0 ? -3 : 3;
		}
		
		baidu.event.preventDefault(e);
		//调用flash的接口
		invokeFlash('analyserFlash','zoomByMouseWheel2Flash ',[delta]);
    } 

};

nirvana.effectAnalyse.lib = {
    //定义公用属性和方法，如果需要的话
	
	flashItemsOptions : [
		{
	      value: 1,
	      text: '点击-展现'
	    }, {
	      value: 2,
	      text: '消费-点击'
	    }, {
	      value: 3,
	      text: '消费-展现'
	    }, {
	      value: 4,
	      text: '转化-点击'
	    }, {
	      value: 5,
	      text: '消费-转化'
	    }],
	/**
	 * 处理请求返回的数据
	 * @param {Object} actionInstance
	 * @param {Object} data
	 */
	processEffectData : function(actionInstance,data){
	//	console.log('return data~');
	//	console.log(data);
		var me = actionInstance,
		    flashItemsSelect = me._controlMap.flashItemsSelect,
		    funnelData = {},
			listDataObj = {},
			errorFlag = false;
		if(!data || data.status != 200){
			baidu.g('effectResultErrorTip').innerHTML = '抱歉，未成功加载，建议缩小范围重新尝试。';
			nirvana.effectAnalyse.keywordList.funnelAnalysisRender(0);
            baidu.show('effectResultErrorTip');
            baidu.hide('effectResultArea');
            return;
		}else if(data.data == null || data.data.listData == null || data.data.listData.length == 0){
            baidu.g('effectResultErrorTip').innerHTML = '当前无数据，请重新选择。';
			if(data.data.hastrans){
				nirvana.effectAnalyse.keywordList.funnelAnalysisRender(1);
			}else{
				nirvana.effectAnalyse.keywordList.funnelAnalysisRender(0);
			} 
            baidu.show('effectResultErrorTip');
            baidu.hide('effectResultArea');
            return;		
		}else{
			baidu.hide('effectResultErrorTip');
            baidu.show('effectResultArea');
		}
		//如果trans为false的话，flash指标选择为三项，没有消费-转化和转化-点击
		if(data.data.hastrans == false){
			var options = nirvana.effectAnalyse.lib.flashItemsOptions.slice(0,3);
		//	console.log(flashItemsSelect);
			me.setContext('flashItemOption',options);
			flashItemsSelect.datasource = options;
			flashItemsSelect.options = options;
			flashItemsSelect.render();
		//	console.log(flashItemsSelect);
		}
		
		var extraData = baidu.object.clone(data.data.extraData),
		    listData = data.data.listData,
            statTableData = data.data.tableData;
		//漏斗数据中转化没有传-1，visit也有一种情况没有
		funnelData.shows = extraData.showSum;
		funnelData.clks = extraData.clkSum;
		funnelData.visit = extraData.visitSum;
		if(data.data.hastrans == false || typeof extraData.transSum == 'undefined'){
			funnelData.trans = -1;
		}else{
			funnelData.trans = extraData.transSum;
		}
		//=====调用玲玲的方法，传入funnelData=====
		nirvana.effectAnalyse.keywordList.funnelAnalysisRender(funnelData);
		
		//处理一下传来的均值的格式
		extraData.clkrAvg = floatToPercent(extraData.clkrAvg);
		extraData.showAvg = fixed(extraData.showAvg);
		extraData.payAvg = fixed(extraData.payAvg);
		extraData.acpAvg = fixed(extraData.acpAvg);
		extraData.clkAvg = fixed(extraData.clkAvg);
		extraData.transAvg = fixed(extraData.transAvg);
		
		me.setContext('extraData',extraData);
		me.setContext('listData',listData);
		me.setContext('flashStatTableData',statTableData);
		
		//分别代表点击，消费，展现，转化，平均点击价格，点击率的均值。玲玲用于组装表尾数据。
		var keywordAvg = [extraData.clkAvg, extraData.payAvg, extraData.showAvg, 
		                  extraData.transAvg, extraData.acpAvg, extraData.clkrAvg];
		me.setContext("keywordAvg",keywordAvg);
	
		nirvana.effectAnalyse.keywordList.setTableFootAllData(me);
		//将数组形式变成对象形式，以便于flash选取点后下方表格数据的展现。
        for(var i = 0; i < listData.length; i++){
          listDataObj[listData[i].winfoid] = listData[i];
        }
		
		me.setContext('listDataObj',listDataObj);
		//将鼠标拖拽方式复原
		me.setContext('effectMouseType',0);
		me._controlMap['EffectMouseArea'].setChecked(true);
		//调用flash方法
		nirvana.effectAnalyse.flashControl.initAnalyseFlashChart(me);
		
//	console.log(fbs.cachePool);
		
	},
	
	/**
     * 监控中心
     * @param {Object} actionName
     * @param {Object} param
     */
    logCenter : function(actionName, param) {
        var me = this,
            logParam = {};
        
        baidu.extend(logParam, param);
        logParam.path = "Tools_effectAnalyse";
        if(actionName === ''){
            
        }
		
		NIRVANA_LOG.send(logParam);
    },
	/**
	 * 选中关键词所在象限的描述语言话术
	 * 当用户选择的区域没有关键词时，提示：您没有选中任何关键词，请重新选择。
	 */
	flashStatContent:[
	   {//点击-展现
		8:'您筛选的关键词处于高展现和高点击的A区。<br/><b>特征：</b>展现高于已选词的平均水平，点击高于已选词的平均水平。<br/><b>优化方向：</b>密切监控这些关键词的推广表现，拓展同类关键词，继续优化账户推广效果。',
		4:'您筛选的关键词处于低展现和高点击的B区。<br/><b>特征：</b>展现低于已选词的平均水平，点击高于已选词的平均水平。<br/><b>优化方向：</b>优化匹配模式，提高预算，拓展推广地域和推广时段，争取提高流量。',
		2:'您筛选的关键词处于低展现和低点击的C区。<br/><b>特征：</b>展现低于已选词的平均水平，点击低于已选词的平均水平。<br/><b>优化方向：</b>通过优化匹配模式等方式提高流量，通过提高创意吸引力等方式提高点击率，同时添加更多优质的关键词。',
		1:'您筛选的关键词处于高展现和低点击的D区。<br/><b>特征：</b>展现高于已选词的平均水平，点击低于已选词的平均水平。<br/><b>优化方向：</b>提高创意吸引力，提高出价，将无关搜索词添加为否定关键词，提高点击率。',
		12:'您筛选的关键词处于点击较高的A区和B区。<br/><b>特征：</b>点击高于已选词的平均水平。<br/><b>优化方向：</b>部分关键词需要提高展现，请根据关键词相关属性结合推广数据进行优化。',
		3:'您筛选的关键词处于点击较低的C区和D区。<br/><b>特征：</b>点击低于已选词的平均水平。<br/><b>优化方向：</b>优化创意，提高出价，将无关搜索词添加为否定关键词，提高点击率。',
		9:'您筛选的关键词处于展现较高的A区和D区。<br/><b>特征：</b>展现高于已选词的平均水平。<br/><b>优化方向：</b>部分关键词需要提高点击率，请根据关键词相关属性结合推广数据进行优化。',
		6:'您筛选的关键词处于展现较低的B区和C区。<br/><b>特征：</b>展现低于已选词的平均水平。<br/><b>优化方向：</b>优化匹配模式，提高预算，拓展推广地域和推广时段，争取提高流量，同时添加更多优质关键词。',		
		5:'您选择的关键词展现分布较为平均，点击有差异。部分关键词点击可以根据实际情况进行优化。',
		10:'您选择的关键词点击分布较为平均，展现有差异。部分关键词的展现可以根据实际情况进行优化。',
		7:'您选择的关键词遍布3个区域，展现和点击表现各异，需要根据实际情况进行优化。',
		11:'您选择的关键词遍布3个区域，展现和点击表现各异，需要根据实际情况进行优化。',
		13:'您选择的关键词遍布3个区域，展现和点击表现各异，需要根据实际情况进行优化。',
		14:'您选择的关键词遍布3个区域，展现和点击表现各异，需要根据实际情况进行优化。',
		15:'您选择的关键词遍布4个区域，展现和点击表现各异，需要根据实际情况进行优化。'
	   },
	   {//消费-点击
        8:'您筛选的关键词处于高消费和高点击的A区。<br/><b>特征：</b>消费高于已选词的平均水平，点击高于已选词的平均水平。<br/><b>优化方向：</b>优化创意，提高质量度，降低点击成本。 同时将重点消费词加至监控文件夹，密切监控这些关键词的推广表现，拓展同类关键词，继续优化账户推广效果。',
        4:'您筛选的关键词处于低点击和高消费的B区。<br/><b>特征：</b>点击低于已选词的平均水平，消费高于已选词的平均水平。<br/><b>优化方向：</b>将重点消费词加至监控文件夹，密切关注点击率和转化率等指标。',
        2:'您筛选的关键词处于低消费和低点击的C区。<br/><b>特征：</b>消费低于已选词的平均水平，点击低于已选词的平均水平。<br/><b>优化方向：</b>提高出价，提高排名，增加点击。',
        1:'您筛选的关键词处于高点击和低消费的D区。<br/><b>特征：</b>点击高于已选词的平均水平，消费低于已选词的平均水平。<br/><b>优化方向：</b>该区域关键词性价比较高，可以继续增加该区域关键词的预算。',
        12:'您筛选的关键词处于消费较高的A区和B区。<br/><b>特征：</b>消费高于已选词的平均水平。<br/><b>优化方向：</b>需要重点监控高消费的关键词，优化创意，提高质量度。',
        3:'您筛选的关键词处于消费较低的C区和D区。<br/><b>特征：</b>消费低于已选词的平均水平。<br/><b>优化方向：</b>根据点击率等指标考虑是否提高出价，并根据实际需要合理分配预算。',
        9:'您筛选的关键词处于点击较高的A区和D区。<br/><b>特征：</b>点击高于已选词的平均水平。<br/><b>优化方向：</b>请重点监控高消费的关键词，同时适当提高点击高、消费低的关键词的预算。',
        6:'您筛选的关键词处于点击较低的B区和C区。<br/><b>特征：</b>点击低于已选词的平均水平。<br/><b>优化方向：</b>通过优化匹配模式等方式提高流量，并通过提高创意吸引力、提高出价等方式提高点击率。',
        5:'您选择的关键词点击分布较为平均，消费有差异。部分关键词可以根据实际情况进行优化。',
		10:'您选择的关键词消费分布较为平均，点击有差异。部分关键词可以根据实际情况进行优化，提高点击。',
		7:'您选择的关键词遍布3个区域，消费和点击表现各异，需要根据实际情况进行优化。',
		11:'您选择的关键词遍布3个区域，消费和点击表现各异，需要根据实际情况进行优化。',
		13:'您选择的关键词遍布3个区域，消费和点击表现各异，需要根据实际情况进行优化。',
		14:'您选择的关键词遍布3个区域，消费和点击表现各异，需要根据实际情况进行优化。',
		15:'您选择的关键词遍布4个区域，消费和点击表现各异，需要根据实际情况进行优化。'
	   },
       {//消费-展现
        8:'您筛选的关键词处于高消费和高展现的A区。<br/><b>特征：</b>消费高于已选词的平均水平，展现高于已选词的平均水平。<br/><b>优化方向：</b>优化创意，提高质量度，降低点击成本；或选择添加竞争激烈程度相对较低的关键词。将重点消费词加至监控文件夹，密切监控这些关键词的推广表现，拓展同类关键词，继续优化账户推广效果。',
        4:'您筛选的关键词处于低展现和高消费的B区。<br/><b>特征：</b>展现低于已选词的平均水平，消费高于已选词的平均水平。<br/><b>优化方向：</b>建议将重点的消费词添加至监控文件夹中监控，密切监视推广效果；或选择添加竞争激烈程度相对较低的关键词。',
        2:'您筛选的关键词处于低展现和低消费的C区。<br/><b>特征：</b>展现低于已选词的平均水平，消费低于已选词的平均水平。<br/><b>优化方向：</b>根据实际情况提高预算并合理分配预算，通过优化匹配方式、拓展推广地域和推广时段等方式提高流量。',
        1:'您筛选的关键词处于高展现和低消费的D区。<br/><b>特征：</b>展现高于已选词的平均水平，消费低于已选词的平均水平。<br/><b>优化方向：</b>该区域关键词展现机会较好，可根据点击率目标适当提高出价和优化创意。',
        12:'您筛选的关键词处于消费较高的A区和B区。<br/><b>特征：</b>消费高于已选词的平均水平。<br/><b>优化方向：</b>需要重点监控高消费的关键词，优化创意，提高质量度。',
        3:'您筛选的关键词处于消费较低的C区和D区。<br/><b>特征：</b>点击低于已选词的平均水平。<br/><b>优化方向：</b>根据点击率等指标考虑是否提高出价，并根据实际需要合理分配预算。',
        9:'您筛选的关键词处于展现较高的A区和D区。<br/><b>特征：</b>展现高于已选词的平均水平。<br/><b>优化方向：</b>部分关键词需要根据点击率目标适当提高出价和优化创意，请根据关键词相关属性结合推广数据进行优化。',
        6:'您筛选的关键词处于展现较低的B区和C区。<br/><b>特征：</b>展现低于已选词的平均水平。<br/><b>优化方向：</b>通过优化匹配模式等方式提高流量，通过提高创意吸引力等方式提高点击率，同时添加更多优质的关键词。',
        5:'您选择的关键词展现分布较为平均，消费有差异。部分关键词可以根据实际情况进行优化。',
		10:'您选择的关键词消费分布较为平均，展现有差异。部分关键词的展现可以根据实际情况进行优化。',
		7:'您选择的关键词遍布3个区域，展现和消费表现各异，需要根据实际情况进行优化。',
		11:'您选择的关键词遍布3个区域，展现和消费表现各异，需要根据实际情况进行优化。',
		13:'您选择的关键词遍布3个区域，展现和消费表现各异，需要根据实际情况进行优化。',
		14:'您选择的关键词遍布3个区域，展现和消费表现各异，需要根据实际情况进行优化。',
		15:'您选择的关键词遍布4个区域，展现和消费表现各异，需要根据实际情况进行优化。'
       },
       {//转化-点击
        8:'您筛选的关键词处于高点击和高转化的A区。<br/><b>特征：</b>点击高于已选词的平均水平，转化高于已选词的平均水平。<br/><b>优化方向：</b>密切监控这些关键词的推广表现，拓展同类关键词，继续优化账户推广效果。',
        4:'您筛选的关键词处于低点击和高转化的B区。<br/><b>特征：</b>点击低于已选词的平均水平，转化高于已选词的平均水平。<br/><b>优化方向：</b>通过优化匹配模式等方式提高流量，并通过提高创意吸引力、提高出价等方式提高点击率。',
        2:'您筛选的关键词处于低转化和低点击的C区。<br/><b>特征：</b>转化低于已选词的平均水平，点击低于已选词的平均水平。<br/><b>优化方向：</b>通过提高创意吸引力等方式提高点击率，通过优化网站质量、网页相关性等方式提高转化，同时获取更多优质的关键词。',
        1:'您筛选的关键词处于高点击和低转化的D区。<br/><b>特征：</b>点击高于已选词的平均水平，转化低于已选词的平均水平。<br/><b>优化方向：</b>优化网站质量，网页相关性，提高转化。',
		12:'您筛选的关键词处于转化较高的A区和B区。<br/><b>特征：</b>转化高于已选词的平均水平。<br/><b>优化方向：</b>部分关键词需要提高点击，请根据关键词相关属性结合推广数据进行优化。',
        3:'您筛选的关键词处于转化较低的C区和D区。<br/><b>特征：</b>转化低于已选词的平均水平。<br/><b>优化方向：</b>优化网站质量，网页相关性，提高转化。',
        9:'您筛选的关键词处于点击较高的A区和D区。<br/><b>特征：</b>点击高于已选词的平均水平。<br/><b>优化方向：</b>部分关键词需要提高转化，请根据关键词相关属性结合推广数据进行优化。',
        6:'您筛选的关键词处于点击较低的B区和C区。<br/><b>特征：</b>点击低于已选词的平均水平。<br/><b>优化方向：</b>通过优化匹配模式等方式提高流量，并通过提高创意吸引力、提高出价等方式提高点击率。',
        5:'您选择的关键词点击分布较为平均，转化有差异。部分关键词转化可以根据实际情况进行优化。',
		10:'您选择的关键词转化分布较为平均，点击有差异。部分关键词的点击可以根据实际情况进行优化。',
		7:'您选择的关键词遍布3个区域，转化和点击表现各异，需要根据实际情况进行优化。',
		11:'您选择的关键词遍布3个区域，转化和点击表现各异，需要根据实际情况进行优化。',
		13:'您选择的关键词遍布3个区域，转化和点击表现各异，需要根据实际情况进行优化。',
		14:'您选择的关键词遍布3个区域，转化和点击表现各异，需要根据实际情况进行优化。',
		15:'您选择的关键词遍布4个区域，转化和点击表现各异，需要根据实际情况进行优化。'
       },
       {//消费-转化
        8:'您筛选的关键词处于高消费和高转化的A区。<br/><b>特征：</b>消费高于已选词的平均水平，转化高于已选词的平均水平。<br/><b>优化方向：</b>优化创意，提高质量度，降低点击成本，密切监控这些关键词的推广表现，拓展同类关键词，继续优化账户推广效果。',
        4:'您筛选的关键词处于低转化和高消费的B区。<br/><b>特征：</b>转化低于已选词的平均水平，消费高于已选词的平均水平。<br/><b>优化方向：</b>优化网站质量，网页相关性，提高转化。建议将重点的消费词添加至监控文件夹中监控，密切监视推广效果。',
        2:'您筛选的关键词处于低转化和低消费的C区。<br/><b>特征：</b>转化低于已选词的平均水平，消费低于已选词的平均水平。<br/><b>优化方向：</b>提高出价，提高排名，增加点击；同时优化网站质量，网页相关性，提高转化。',
        1:'您筛选的关键词处于高转化和低消费的D区。<br/><b>特征：</b>转化高于已选词的平均水平，消费低于已选词的平均水平。<br/><b>优化方向：</b>该区域关键词ROI比较高，可以继续增加该区域关键词的预算。',
        12:'您筛选的关键词处于消费较高的A区和B区。<br/><b>特征：</b>消费高于已选词的平均水平。<br/><b>优化方向：</b>需要重点监控高消费的关键词，优化创意，提高质量度。',
        3:'您筛选的关键词处于消费较低的C区和D区。<br/><b>特征：</b>消费低于已选词的平均水平。<br/><b>优化方向：</b>根据转化率等指标考虑是否提高出价，并根据实际需要合理分配预算。',
        9:'您筛选的关键词处于转化较高的A区和D区。<br/><b>特征：</b>转化高于已选词的平均水平。<br/><b>优化方向：</b>请重点监控高消费的关键词，同时适当提高转化高、消费低的关键词的预算。',
        6:'您筛选的关键词处于转化较低的B区和C区。<br/><b>特征：</b>转化低于已选词的平均水平。<br/><b>优化方向：</b>优化网站质量，网页相关性，提高转化。',
        5:'您选择的关键词转化分布较为平均，消费有差异。部分关键词可以根据实际情况进行优化。',
        10:'您选择的关键词消费分布较为平均，转化有差异。部分关键词的转化可以根据实际情况进行优化。',
        7:'您选择的关键词遍布3个区域，转化和消费表现各异，需要根据实际情况进行优化。',
        11:'您选择的关键词遍布3个区域，转化和消费表现各异，需要根据实际情况进行优化。',
        13:'您选择的关键词遍布3个区域，转化和消费表现各异，需要根据实际情况进行优化。',
        14:'您选择的关键词遍布3个区域，转化和消费表现各异，需要根据实际情况进行优化。',
		15:'您选择的关键词遍布4个区域，转化和消费表现各异，需要根据实际情况进行优化。'
       }
	]
};
/**
 * 监控文件夹气泡
 */
ui.Bubble.source.analyseMonitorFolderList = {
	type : 'normal',
	iconClass : 'bubble_icon_folder',
	positionList : [2,3,4,5,6,7,8,1],
	needBlurTrigger : true,
	showByClick : true,
	showByOver : true,			//鼠标悬浮延时显示
	showByOverInterval : 500,	//悬浮延时间隔
	hideByOut : true,			//鼠标离开延时显示
	hideByOutInterval : 5000,	//离开延时间隔，显示持续时间
	folders:{},
	clickHandler:function(id){
		ui.Bubble.hide();
		er.locator.redirect("/manage/monitorDetail~ignoreState=true&folderid=" + id);
	},
	title: function(node){
		return "该词已被监控";
	},
	content: function(node, fillHandle, timeStamp){
		var id = node.getAttribute("id").substr(17),
			folders = this.folders[id],
			html = [],
			title = '',
			name = '',
			id;
		html[html.length] = '<div class="bubble_folder_title">所属监控文件夹：</div>';
		for (var i = 0, l = folders.length; i < l; i++) {
			id = folders[i].folderid;
			title = baidu.encodeHTML(folders[i].foldername);
			name = getCutString(folders[i].foldername,30,"..");
			html[html.length] = '<div class="bubble_folder_content"><a title="' + title + '" href="javascript:void(0)" onclick="ui.Bubble.source.monitorFolderList.clickHandler(' + id + ');">' + name + '</a></div>';
		}
		return html.join("");
	}
};