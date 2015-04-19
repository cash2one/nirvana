/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: accountOptimizer/all/selectedList.js 
 * desc: 选中的物料列表信息
 * author: zhouyu01@baidu.com
 * date: $Date: 2011/06/24 $
 */

/**
 * 选中的物料列表信息 actionParam
 */
ToolsModule.selectedList = new er.Action({
	VIEW : 'propSelectedList',
	
	UI_PROP_MAP : {
		// 文字部分
		aoSlLabel : {
			datasource: "*aoSlLabelText",
			classname: "sl_label"
		},
		
		// 数据表格
		aoSlTable : {
			noDataHtml: "*noDataHtml",
			dragable: "false",
			colViewCounter: "all",
			fields: "*tableFields",
			datasource: "*ListData"
		},
		
		//分页
		aoSlPage: {
			page: "*pageNo",
			total: "*totalPage"
		}
	},
	

	/**
	 * 初始化context的函数集合，name/value型Object。其value为Function的map，value
	 * Function被调用时this指针为Action本身。value
	 * Function的形参需要有一个callback参数，参数为Function类型，手工回调。
	 */
	CONTEXT_INITER_MAP : {
		/**
		 * 
		 * @param {Object} callback
		 */
		aoSlLabel: function(callback){
			var me = this,
				label = "",
				type = me.arg.type;
			switch(type){
				case "planinfo":
					label = "计划";
					break;
				case "unitinfo":
					label = "单元";
					break;
				case "wordinfo":
					label = "关键词";
					break;
				case "ideainfo":
					label = "创意";
					break;
			}
			me.setContext("aoSlLabelText","选中的" + label);
			callback();
		},
		
		/**
		 * 表格字段
		 */
		tableFields: function(callback){
			var me = this,
				fields = [],
				type = me.arg.type,
				tc = false,
				len = AO_NAMEDATA_MAXLENGTH;
			if (type == "wordinfo") {
				fields[fields.length] = {
					content: function(item){
						var title = baidu.encodeHTML(item.showword), 
							content = getCutString(item.showword, AO_NAMEDATA_MAXLENGTH, ".."), 
							html = '<div title="' + title + '">' + content + '</div>';
						return html;
					},
					field: 'showword',
					title: '关键词',
					width: 100
				}
				tc = true;
			}
			else 
				if (type == "ideainfo") {
					fields[fields.length] = {
						content: function(item){
							var name = IDEA_RENDER.lineBreak(IDEA_RENDER.wildcard(baidu.decodeHTML(item.title))),
								title = name.replace(/\<.*?\>/ig, ''),
								// 创意不能截断显示
								//content = baidu.decodeHTML(getCutString(name, AO_NAMEDATA_MAXLENGTH, "..")), 
								html = '<div class="ao_idea_list" title="' + title + '">' + name + '</div>';
							return html;
						},
						field: 'title',
						title: '创意',
						width: 100
					}
					tc = true;
				}
			if(tc){
				len = AO_NAMEDATA_MINLENGTH;
			}
			if (type != "unitinfo") {
				fields[fields.length] = {
					content: function(item){
						var title = baidu.encodeHTML(item.planname), 
							content = getCutString(item.planname, len, ".."), 
							html = '<div title="' + title + '">' + content + '</div>';
						return html;
					},
					field: 'planname',
					title: '计划',
					width: 100
				}
			}
			if (type != "planinfo") {
				fields[fields.length] = {
					content: function(item){
						var title = baidu.encodeHTML(item.unitname), 
							content = getCutString(item.unitname, len, ".."), 
							html = '<div title="' + title + '">' + content + '</div>';
						return html;
					},
					field: 'unitname',
					title: '单元',
					width: 100
				}
			}
			if (type == "unitinfo") {
				fields[fields.length] = {
					content: function(item){
						var title = baidu.encodeHTML(item.planname), 
							content = getCutString(item.planname, len, ".."), 
							html = '<div title="' + title + '">' + content + '</div>';
						return html;
					},
					field: 'planname',
					title: '计划',
					width: 100
				}
			}
			me.setContext("tableFields",fields);
			callback();
		},
		
        /**
         * 填充数据表格
         */
		dataTable: function(callback){
			var me = this,
				data = me.arg.data, 
				len = data.length, 
				pageno = me.getContext("pageNo") || me.arg.pageNo || 1, 
				pagesize = nirvana.config.AO.SELECTEDWORDS_PER_PAGE, 
				start = (pageno - 1) * pagesize, 
				totalpage = Math.ceil(len / pagesize), 
				datatable = baidu.object.clone(data).splice(start, pagesize),
				func = function() {},
				param = {},
				type = me.arg.type,
				levelid = [];
				
			me.setContext("totalPage", totalpage);
			me.setContext("pageNo", pageno);
			
			// 因为带入的datatable有可能不包含planname/unitname，所以需要重新请求具体field
			switch (type) {
				case 'planinfo':
					func = fbs.plan.getInfo;
					
					baidu.each(datatable, function(item, index){
						levelid.push(item.planid);
					});
					
					param.condition = {
						planid: levelid
					};
					break;
				case 'unitinfo':
					func = fbs.unit.getInfo;
					
					baidu.each(datatable, function(item, index){
						levelid.push(item.unitid);
					});
					
					param.condition = {
						unitid: levelid
					};
					break;
				case 'wordinfo':
					func = fbs.keyword.getInfo;
					
					baidu.each(datatable, function(item, index){
						levelid.push(item.winfoid);
					});
					
					param.condition = {
						winfoid: levelid
					};
					break;
				case 'ideainfo':
					func = fbs.idea.getInfo;
					
					baidu.each(datatable, function(item, index){
						levelid.push(item.ideaid);
					});
					
					param.condition = {
						ideaid: levelid
					};
					break;
			};
			
			// 这里根据levelid去控制数据length，由于前端是本地构造的数据，所以条数不对
			param.onSuccess = function(response) {
				var listData = response.data.listData;
				
				me.setContext('ListData', listData);
				
				callback();
			};
			
			param.onFail = function(response) {
				ajaxFailDialog();
				
				callback();
			};
			
			func(param);
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
		var me = this,
			controlMap = me._controlMap;
		controlMap.aoSlPage.onselect = me.getPaginationHandler();
		
		ui.util.get("aoSlTable").getWidth = aoRewriteGetWidth;
	},

	/**
	 * 完成视图更新后最后会触发事件
	 */
	onentercomplete : function() {

	},
	
	/**
	 * 翻页
	 */
	getPaginationHandler : function () {
	    var me = this;
	    return function(pageNo){
		//	ui.util.get('aoSlTable').resetYpos = true;
			me.setContext('pageNo', pageNo);
			var stateMap = me.getStateMap();
			me.refreshSelf(stateMap);
		}
	},
	
	/**
	 * 需要状态保持的变量
	 */
	getStateMap: function(){
		var me = this,
			stateMap = {};
		stateMap.pageNo = me.getContext("pageNo") || me.arg.pageNo || 1;
	//	stateMap.type = me.arg.type;
	//	stateMap.data = me.arg.data;
		return stateMap;
	}
});