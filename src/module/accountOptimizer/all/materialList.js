/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: accountOptimizer/all/materialList.js 
 * desc: 物料列表信息
 * author: zhouyu01@baidu.com
 * date: $Date: 2011/06/24 $
 */

/**
 * 物料列表信息 actionParam
 */
ToolsModule.materialList = new er.Action({
	VIEW : 'propMaterialList',
	
	UI_PROP_MAP : {
		// 文字部分
		aoMlLabel : {
			datasource: "*aoMlLabelText",
			classname: "ml_label"
		},
		
		// 数据表格
		aoMlTable : {
		//	sortable: true,
			noDataHtml: "*noDataHtml",
			dragable: "false",
			colViewCounter: "all",
	//		scrollYFixed: "true",
			fields: "*tableFields",
			datasource: "*ListData"
		},
		
		//分页
		aoMlPage: {
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
		aoMlLabel: function(callback){
			var me = this,
				lang = nirvana.config.AO.LANG[me.arg.type],
				html = lang + "列表" + "<span class='define_topwords' id='DefineTopWords'>定义\"" + lang + "\"</span>";
			me.setContext("aoMlLabelText",html);
			callback();
		},
		
		/**
		 * 表格字段
		 */
		tableFields: function(callback){
			var me = this,
				valueTitle = "", 
				rateTitle = "",
				fields = [
				{
					content: function(item){
						var title = baidu.encodeHTML(item.showword), 
							content = getCutString(item.showword, AO_NAMEDATA_MAXLENGTH, ".."), 
							html = '<div title="' + title + '">' + content + '</div>';
						return html;
					},
					field: 'showword',
					title: '关键词',
					width: 200
				},
				{
					content: function(item){
						var title = baidu.encodeHTML(item.planname), 
							content = getCutString(item.planname, AO_NAMEDATA_MINLENGTH, ".."), 
							html = '<div title="' + title + '">' + content + '</div>';
						return html;
					},
					field: 'planname',
					title: '计划',
					width: 100
				},
				{
					content: function(item){
						var title = baidu.encodeHTML(item.unitname), 
							content = getCutString(item.unitname, AO_NAMEDATA_MINLENGTH, ".."), 
							html = '<div title="' + title + '">' + content + '</div>';
						return html;
					},
					field: 'unitname',
					title: '单元',
					width: 100
				}
				];
			switch(me.arg.type){
				case "toppaysumwords":
					valueTitle = "消费";
					rateTitle = "占账户总消费";
					break;
				case "topclkswords":
					valueTitle = "点击";
					rateTitle = "占账户总点击";
					break;
				case "topshowswords":
					valueTitle = "展现";
					rateTitle = "占账户总展现";
					break;
			}
			fields[fields.length] = {
				content: function(item){
					return item.value || "-";
				},
				align: 'right',
				field: 'value',
				title: valueTitle,
				width: 150
			};
			fields[fields.length] = {
				content: function(item){
					return item.rate || "-";
				},
				align: 'right',
				field: 'rate',
				title: rateTitle,
				width: 100
			};
			me.setContext("tableFields",fields);
			callback();
		},
		
        /**
         * 填充数据表格
         */
		dataTable : function(callback) {
			var me = this;
			fbs.ao.getTopWords({
				level : me.arg.type,
				onSuccess : function(res){
					var data = res.data.listData,
						len = data.length,
						pageno = me.getContext("pageNo") || me.arg.pageNo || 1,
						pagesize = nirvana.config.AO.TOPWORDS_PER_PAGE,
						start = (pageno - 1) * pagesize,
						totalpage = Math.ceil(len/pagesize),
						datatable = baidu.object.clone(data).splice(start, pagesize);
					if(len > 0){
						me.setContext("allData",data);
						me.setContext("ListData",datatable);
						if(totalpage > 1){
							me.setContext("totalPage", totalpage);
							me.setContext("pageNo", pageno);
						}
					}else{
						me.setContext("noDataHtml",FILL_HTML.NO_DATA);
					}
					callback();
				},
				onFail : function(res){
					me.setContext("noDataHtml","读取数据失败！");
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
		var me = this,
			controlMap = me._controlMap;
			
		controlMap.aoMlPage.onselect = me.getPaginationHandler();
		
		baidu.g("DefineTopWords").onclick = function(){
			me.onclose();
			setPropThreshold(me, me.arg.type);
			
			//add by LeoWang(wangkemiao@baidu.com) 添加级别设置监控
			nirvana.aoWidgetAction.logCenter('ao_level_option', {
				level : me.arg.type
			});
			//add ended
		}
		ui.util.get("aoMlTable").getWidth = aoRewriteGetWidth;
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
		//	ui.util.get('aoMlTable').resetYpos = true;
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
		stateMap.pageNo = me.getContext("pageNo") || 1;
		return stateMap;
	}
});

function aoRewriteGetWidth(){
	if (this.width) {
		return this.width;
	}
	
	var me = this, 
		width, 
		rulerDiv = document.createElement('div'), 
		parent = me.main;
	
	do {
		parent = parent.parentNode;
		if (!parent) {
			return this._width;
		}
		parent.appendChild(rulerDiv);
		width = rulerDiv.offsetWidth;
	}
	while (width <= 0)
	
	return width;
}