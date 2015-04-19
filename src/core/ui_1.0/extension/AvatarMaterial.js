/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    ui/AvatarMaterial.js
 * desc:    阿凡达物料搜索控件
 * author:  zhouyu
 * date:    2011/02/12
 */

/**
 * 阿凡达物料搜索控件，使用场景比如推广管理监控文件夹右边的关键词选择、概况页的监控文件夹添加
 * 
 * @class AvatarMaterial
 * @namespace ui
 * @extends ui.Base
 * @constructor
 * @param {Object} options 控件初始化参数
 * <pre>
 * 参数配置定义如下：
 * {
 *    id:       [String], [REQUIRED] 控件的id属性
 *    level:    [Array],  [OPTIONAL] 物料层级，默认["user","plan","unit","keyword"]，数组元素顺序为层级顺序
 *    pagesize: [Number], [OPTIONAL] 显示的物料每页显示的数量，默认50
 *    addWords: [Array],  [OPTIONAL] 默认空数组，已选择的关键词数组，其数据结构定义如下
 *    form :    [String], [REQUIRED] 标识是普通物料选择还是监控文件夹，有效值'material':计划列表; 
 *                                   'avatar': 所有监控文件夹
 *    width:    [Number], [OPTIONAL] 控件的宽度
 *    height:   [Number], [OPTIONAL] 控件的高度
 * }
 * 
 * addWords数据结构定义如下：
 * [
 *    {
 *       id:   [String], 关键词或监控文件夹id
 *       name: [Stirng], 关键词或监控文件夹显示的名称，可以是HTML片段
 *       ...,  其它属性定义
 *    },
 *    ...
 * ]
 * NOTICE: 对于不同form下，addWords代表不同含义，form = "avatar"为监控文件夹
 * </pre>
 */
ui.AvatarMaterial = function (options) {
    this.initOptions(options);
    this.type = 'avatarmaterial'; 
	this.userid = nirvana.env.USER_ID;
	this.username = nirvana.env.USER_NAME;
	this.wordFields = this.wordFields || ["winfoid", "showword", "showqstat", "clks","paysum","avgprice","wmatch", "wctrl","deviceprefer"];
	//数组中按顺序写出层级名，目前包括[user,plan,unit,keyword,idea],以后再扩展folder等
	this.level = this.level || ["user","plan","unit","keyword"]; 
	this.pagesize = this.pagesize || 50;
	this.levelFunc = {
		"user" : this.renderPlanList(),
		"plan" : this.renderUnitList(),
		"unit" : this.renderMatList()
	};
	this.upArray = [];
};

ui.AvatarMaterial.prototype = {
	/**
	 * 渲染控件
	 * @method render
	 * @param {Object} main 控件挂载的DOM元素，main必须是DIV元素
	 */
	render: function(main){
		var me = this;
		if (main && main.tagName != 'DIV') {
			return;
		}
		
		if(!me.main){
			ui.Base.render.call(me, main, true);
		}
		/**
		 * 已添加的关键词, 只读
		 * @property addWords
		 * @type Array
		 * @default []
		 */
		me.addWords = me.addWords || [];
		me.renderLevelOption();
		me.renderSearchOption();
		me.renderTableOption();
		me.isRender = true;
		me.addUpIcon();
	},
	
	/**
	 * 添加返回上一层图标
	 */
	addUpIcon:function(){
		var me = this,
			main = document.createElement("div"),
			up = ui.util.create("Label",{"id":me.getId("up"),"classname":"up","datasouce":"向上"});
		up.render(main);
		me.up = main;
		me.main.appendChild(main);
		main.onclick = me.upClickHandler();
	},
	/**
	 * 隐藏返回上一层图标
	 */
	hideUpIcon: function(){
		var me = this;
		me.up.style.display = "none";
	},
	/**
	 * 显示返回上一层图标
	 */
	showUpIcon: function(){
		var me = this;
		me.up.style.display = "block";
	},
	/**
	 * 点击返回上一层图标
	 */
	upClickHandler: function(){
		var me = this;
		return function(){
			var uparray = me.upArray, len = uparray.length;
			if (len == 2) {
				var planid = uparray[0];
				me.upLevelChange();
				me.getUnitList(+planid);
			}
			else 
				if (len == 1) {
					me.hideUpIcon();
					me.upLevelChange();
					me.getPlanList(1);
				}
		}
	},
	/**
	 * 点击返回上一层图标设置层级
	 */
	upLevelChange: function(){
		var me = this;
		var mat = me.selectCombo.materialLevel.material, len = mat.length;
		baidu.array.removeAt(mat, len - 1);
	},
	
	/**
	 * 初始化level层级参数，每次都从第一层开始
	 */
	renderLevelOption: function(){
		var me = this;
		if (me.form == "material") {
			me.materialLevel = {
				material: [{
					level: 0,
					id: 0,
					word: "计划列表",
					tipContent: "",
					click: me.renderPlanList()
				}]
			};
		}
		else 
			if (me.form == "avatar") {
				me.materialLevel = {
					material: [{
						level: 0,
						id: 1,
						word: "所有监控文件夹",
						tipContent: "",
						click: new Function()
					}]
				};
			}
		me.materialLevel.fatherWidth = me.width;
		if (me.isRender && me.selectCombo) {
			me.selectCombo.materialLevel = me.materialLevel;
			me.selectCombo.level.material = me.materialLevel.material;
		}
	},
	
	
	/**
	 * 初始化搜索组合控件参数，每次render输入框的值都必须为空
	 */
	renderSearchOption: function(){
		var me = this;
		me.searchOption = {};
		if (me.isRender) {
			me.selectCombo.search.setValue("");
		}
	},
	
	/**
	 * 初始化tableOption
	 */
	renderTableOption: function(){
		var me = this;
		var last = false,
			classname = "";
		if (me.level.length == 1 || me.level.length == 2) {
			last = true;
		}
		var dataTable = {
			"fields": [{
				content: me.setTableFields(last),
				stable: false,
				title: '',
				width: 300
			}],
			"noTitle": false,
			"noDataHtml": "<div class='noData'>暂无数据</div>",
			"width": 370,
			"height": 300
		};
		//与外层div一致，不需要每次定义table的width和height
		if(me.width){
			dataTable.width = me.width;
		}
		if(me.height){
			dataTable.height = me.height - 112;
		}
		
		if (!me.tableOption) {
			me.tableOption = dataTable;
		}
		else {
			for(var item in dataTable){
				if(!me.tableOption[item]){
					me.tableOption[item] = dataTable[item];
				}
			}
		}
		if (me.form == "material") {
			me.getPlanList(0);
		}else{
			me.getFolderList();
		}
	},
	
	
	/**
	 * 设置table的fields参数
	 * @param {Object} last
	 */
	setTableFields: function(last){
		var me = this;
		if (last) {
			var lastlevel = 'lastlevel="y"';
		}
		else {
			var lastlevel = 'lastlevel="n"';
		}
		return function(item){
					var disabled = "",
						classname = "",
						isAdd = false,
						name = item.name;
					
					if(last){
						isAdd = me.isWordAdded(item.id);
						//最后一个层级，用于区分样式
						classname = ' class = "' + me.getClass("lastlevel"); 
						//用于区分点击样式
						if(isAdd !== false && isAdd !== -1){
							classname = classname + ' ' + 
										me.selectCombo.getClass("disabled"); 
						}
						classname += '"';
						name = getCutString(name,20,"..");
						//高短
						if(nirvana.env.AUTH['gaoduan'] && typeof item.wctrl != 'undefined'){
							name = nirvana.util.buildShowword(name, item.wmatch, item.wctrl);
						}
					}
					return '<a id="' + item.id + '" ' + lastlevel + classname + ' saveword="' + item.name + '" title="' + item.name + '">' + name + '</a>';
				};
	},
	
	
	
	/**
	 * 创建基层控件对象
	 */
	createSelectCombo: function(){
		var me = this;
		var option = {
			"id": me.getId("materialSelect"),
			"materialLevel": me.materialLevel,
			"searchOption": me.searchOption,
			"tableOption": me.tableOption,
			"pageOption": me.pageOption
		};
		
		if (me.height) {
			option.height = me.height;
		}
		if (me.width) {
			option.width = me.width;
		}
		
		me.selectCombo = ui.util.create("SelectCombo", option);
		me.selectCombo.onAddLeft = me.addLeft();
		//当页添加
		me.selectCombo.onAddAllLeft = me.addAllLeft();
		me.selectCombo.onToNextLevel = me.ToNextLevel();
		me.selectCombo.onsearch = me.search();
		me.selectCombo.onLevelChange = me.levelChange();
		me.selectCombo.onPageChange = me.setPageSelect();
		
		me.selectCombo.render(me.main);
		me.main.style.overflow = "hidden";
		me.hideSearch();
		if (me.form == "avatar") {
			me.displayTableHead(true);
		}
	},
	
	/**
	 * 物料是否已添加
	 * @param {Object} id
	 */
	isWordAdded: function(id){
		var me = this;
		for (var i = 0, l = me.addWords.length; i < l; i++) {
			if(me.addWords[i].id == id){
				return i;
			}
		}
		return false;
	},
	
	/**
	 * 删除已添加物料
	 * @param {Object} id
	 */
	removeAddedWord: function(id){
		var me = this;
		var index = me.isWordAdded(id);
		if(index != -1){
			return me.addWords.splice(index, 1);
		}
		return false;
	},
	
	/**
	 * 重新获取计划列表的datasource
	 */
	renderPlanList: function(){
		var me = this;
		return function(userid){
			me.getPlanList(1);
		}
	},
	
	/**
	 * 重新获取单元列表的datasource
	 * @param {Object} planid
	 */
	renderUnitList: function(){
		var me = this;
		return function(planid){
			me.getUnitList(planid);
		}
	},
	
	
	/**
	 * 重新获取关键词或创意列表的datasource
	 * @param {Object} unitid
	 */
	renderMatList: function(){
		var me = this;
		return function(unitid){
			if(baidu.array.indexOf(me.level,"keyword") != -1){
				me.getKeywordList(unitid);
			}else if(baidu.array.indexOf(me.level,"idea") != -1){
				me.getIdeaList(unitid);
			}
		}
	},
	
	/**
	 * 每次操作重新设置pageOption
	 */
	setPageOption: function(data){
		var me = this;
		var total = Math.ceil(data.length / me.pagesize);
		if (total > 1) {
			return {
				page: 0,
				total: total
			};
		}
		return {page: 0, total: 0};
	},
	
	hideSearch: function(){
		var me = this,
			main = me.selectCombo.search.main;
		if (!baidu.dom.hasClass(main, "search_hide")) {
			baidu.addClass(main, "search_hide");
		}
	},
	
	showSearch: function(){
		var me = this,
			main = me.selectCombo.search.main;
			
		if (baidu.dom.hasClass(main, "search_hide")) {
			baidu.removeClass(main, "search_hide");
		}
	},
	
	/**
	 * 获取计划列表
	 */
	getPlanList: function(type){
		var me = this;
		fbs.plan.getNameList({
			onSuccess:function(data){
				var planlist = [];
				var datalist = data.data.listData;
				var len = datalist.length;
				var tableData = [];
				for (var i = 0; i < len; i++) {
					planlist[planlist.length] = {
						id : datalist[i].planid,
						name : baidu.encodeHTML(datalist[i].planname)
					}
				}
				me.currentData = me.resultData = planlist;
				tableData = baidu.object.clone(me.resultData).splice(0, me.pagesize);
				if(!me.selectCombo){
					me.tableOption.datasource = tableData;
					me.pageOption = me.setPageOption(planlist);
					me.createSelectCombo();
				}else{
					me.upArray.length = 0;
					me.hideUpIcon();
					me.selectCombo.tableOption.datasource = tableData;
					me.changeTableSet();
					me.selectCombo.pageOption = me.setPageOption(planlist);
					me.hideSearch();
					if(type == 1){
						me.reset();
					}
				}
			//	me.currentData = tableData;
			},
			onFail:me.failHandler()
		});
		
	},
	
	/**
	 * 获取文件夹列表
	 */
	getFolderList:function(){
		var me = this;
		fbs.avatar.getMoniFolders({
			fields:["folderid","foldername","fstat","moniwordcount","clks","paysum"],
			onSuccess:function(data){
				var foldlist =[];
				var datalist = data.data.listData || [];
				var len = datalist.length;
				for (var i = 0; i < len; i++) {
					foldlist[foldlist.length] = {
						id : datalist[i].folderid,
						name : baidu.encodeHTML(datalist[i].foldername),
						moniwordcount : datalist[i].moniwordcount,
						clks: datalist[i].clks,
						paysum: datalist[i].paysum
					}
				}
				/**
				 * 可用的监控文件夹列表，只读
				 * @property folderList
				 * @type Array
				 */
				me.folderList = foldlist;
				var fields = me.addFoldCols();
				if(!me.selectCombo){
					me.tableOption.datasource = foldlist;
					me.tableOption.fields = fields;
					me.createSelectCombo();
				}
			},
			onFail:me.failHandler()
		});
	},
	
	
	/**
	 * 获取单元列表
	 */
	getUnitList: function(planid){
		var me = this;
		fbs.unit.getNameList({
			condition: {
				planid: [planid]
			},
			onSuccess : function(data){
				var unitlist =[];
				var datalist = data.data.listData;
				var len = datalist.length;
				me.upArray[0] = planid;
				me.upArray.length = 1;
				me.showUpIcon();
				for (var i = 0; i < len; i++) {
					unitlist[unitlist.length] = {
						id : datalist[i].unitid,
						name : baidu.encodeHTML(datalist[i].unitname)
					}
				}
				me.currentData = me.resultData = unitlist;
				var tableData = baidu.object.clone(me.resultData).splice(0, me.pagesize);
				me.selectCombo.tableOption.datasource = tableData;
				me.changeTableSet();
				me.selectCombo.pageOption = me.setPageOption(unitlist);
			//	me.currentData = tableData;
				me.hideSearch();
				me.reset();
			},
			onFail:me.failHandler()
		});
	},
	
	
	/**
	 * 获取关键词列表
	 */
	getKeywordList: function(unitid){
		var me = this;
		var attrList = me.wordFields;
		var params = {};
		if (me.timeRange && me.timeRange.begin && me.timeRange.end) {
			params.starttime = me.timeRange.begin;
			params.endtime = me.timeRange.end;
		}
		fbs.material.getAttribute('wordinfo', attrList, baidu.object.extend(params,{
			condition: {
				unitid: [unitid]
			},
			onSuccess : function(data){
				var kwlist =[];
				var datalist = data.data.listData;
				var len = datalist.length;
				me.upArray[1] = unitid;
				me.upArray.length = 2;
				me.showUpIcon();
				for (var i = 0; i < len; i++) {
					kwlist[i] = {};
					for (var item in datalist[i]) {
						if (item == "showword") {
							kwlist[i].name = baidu.encodeHTML(datalist[i].showword);
						}
						else {
							kwlist[i][item] = datalist[i][item];
						}
					}
					kwlist[i].id = datalist[i].winfoid;
				}
				me.currentData = me.resultData = kwlist;
				var tableData = baidu.object.clone(me.resultData).splice(0, me.pagesize);
				me.selectCombo.tableOption.datasource = tableData;
				me.changeKwSet();
				me.selectCombo.pageOption = me.setPageOption(kwlist);
			//	me.currentData = tableData;
				me.showSearch();
				me.reset();
				ui.Bubble.init();
			},
			onFail:me.failHandler()
		}));
	},
	
		
	/**
	 * 获取数据失败
	 */
	failHandler: function(){
		var me = this;
		return function(data){
			if (me.selectCombo) {
				me.upLevelChange();
			}
			else {
				me.tableOption.datasource = [];
				me.pageOption = {
					page: 0,
					total: 1
				};
				me.createSelectCombo();
			}
			
			ajaxFailDialog();
		}
	},
	
	/**
	 * 切换到计划和单元时改变table的设置
	 */
	changeTableSet: function(){
		var me = this;
		var fields = [];
		fields[0] = {
			content: me.setTableFields(false),
			stable: false,
			title: '',
			width: 300
		};
		me.selectCombo.tableOption.fields = fields;
		me.selectCombo.table.colsWidthBak.length = 0;
		
		me.displayTableHead(false);
	},
	
	displayTableHead: function(display){
		var me = this,
			display = display ? "block" : "none",
			table = me.selectCombo.table,
			head = baidu.g(table.getId("head"));
		head.style.display = display;
	},
	
	
	/**
	 * 切换到文件夹时改变tableOption的fields
	 */
	addFoldCols: function(){
		var me = this;
		var fields = [];
		fields[fields.length] = {
			content: me.setTableFields(true),
			stable: false,
			title: '监控文件夹',
			field : 'foldername',
			width:150
		};
		fields[fields.length] = {
			content: function(item){
				var data = item.clks;
				if (data == '' || data == '-') {
					return data;
				}
				return parseNumber(data);
			},
			align:'right',
			title: '点击',
			field : 'clks',
			width: 50
		};
		fields[fields.length] = {
			content: function(item){
				return fixed(item.paysum);
			},
			title: '消费',
			align:'right',
			field : 'paysum',
			width: 50
		};
		fields[fields.length] = {
			content: function(item){
				return "";
			},
			title: '',
			field : '',
			align:'right',
			width: 10
		};
		return fields;
	},
	
	
	/**
	 * 切换到关键词时改变table的设置
	 */
	changeKwSet: function(){
		var me = this;
		me.addKwCols();
		me.selectCombo.table.colsWidthBak.length = 0;
		
		me.displayTableHead(true);
	},
	
	/**
	 * 关键词fields配置项
	 */
	kwFieldsConfig: {
		"clks": {
			content: function(item){
				var data = item.clks;
				if (data == '' || data == '-') {
					return data;
				}
				return parseNumber(data);
			},
			align: 'right',
			title: '点击',
			field: 'clks',
			width: 50
		},
		"paysum": {
			content: function(item){
				return fixed(item.paysum);
			},
			title: '消费',
			align: 'right',
			field: 'paysum',
			width: 50
		},
		"avgprice": {
			content: function(item){
				return fixed(item.avgprice);
			},
			title: '平均点击价格',
			field: 'avgprice',
			align: 'right',
			width: 80
		},
		"wordstat": {
			content: function(item){
				var paramString = baidu.json.stringify({
					winfoid: item.winfoid
				});
				
				var tpl = '<div class="{0}">' 
						+ '	<span class="status_text">' 
						+ '		<span class="status_icon" data=\'' 
						+ 		paramString + '\'></span>{1}' 
						+ '	</span>' 
						+ '</div>';
				return nirvana.util.generateStat("word", item.wordstat, tpl, item.pausestat);
				
			},
			title: '状态',
			field: 'wordstat',
			align: 'center',
			width: 80
		},
		"shows": {
			content: function(item){
				var data = item.shows;
				if (data == '' || data == '-') {
					return '-';
				}
				return parseNumber(data);
			},
			field: 'shows',
			title: '展现',
			align: 'right',
			width: 50
		}
	},
	
	/**
	 * 切换到关键词时改变tableOption的fields
	 */
	addKwCols: function(){
		var me = this;
		var fields = [];
		var fieldConfig = {
			"showword": {
				content: me.setTableFields(true),
				stable: false,
				title: function(){
					return '<a id="addAll" href="#" onclick="return false;"><<当页添加（' + me.wordNum() + '个）</a>';
				},
				field: 'showword',
				width: 150
			},
			"showqstat": (function(){
				var qStarField = qStar.getTableField();
				qStarField.align = 'left';
				return qStarField;
			})()
		};
		
		fieldConfig = baidu.object.extend(fieldConfig, me.kwFieldsConfig);
		
		var cols = me.wordFields;
		for (var i = 0, len = cols.length; i < len; i++) {
			if (fieldConfig[cols[i]]) {
				fields[fields.length] = fieldConfig[cols[i]];
			}
		}
		
		fields[fields.length] = {
			content: function(item){
				return "";
			},
			title: '',
			field: '',
			align: 'right',
			width: 10
		};
		me.selectCombo.tableOption.fields = fields;
	},
	
	
	reset: function(){
		var me = this, selectcombo = me.selectCombo;
		selectcombo.search.setValue("");
		selectcombo.level.material = selectcombo.materialLevel.material;
		selectcombo.setLevel();
		selectcombo.setTable();
		selectcombo.setPage();
		me.selectCombo.page.onselect = me.setPageSelect();
	},
	
	/**
	 * 设置页码选择事件
	 */
	setPageSelect:function(){
		var me = this;
		return function(page){
			var start = (page - 1) * me.pagesize;
			var currentData = baidu.object.clone(me.currentData);
			currentData = currentData.splice(start, me.pagesize);
		//	me.currentData = resultData;
		//	resultData = me.filterData(me.selectCombo.search.getValue());
			me.selectCombo.tableOption.datasource = currentData;
			me.selectCombo.setTable();
			if(baidu.g('addAll'))
				baidu.g('addAll').innerHTML='<<当页添加（'+me.wordNum(page)+'个）';
		}
	},
	
	/**
	 * 计算当页可添加数
	 */
	wordNum : function(page){
		var me = this,
		selPage = me.selectCombo.page?me.selectCombo.getPage():2,
		page = page? parseInt(page)-1 : parseInt(selPage)-2,
		pagesize = me.pagesize,
		num = 0;
		
		for (var i = page*pagesize, len = me.currentData.length;i<(page+1)*pagesize&& i < len; i++) {
			var isAdd = false;
			isAdd = me.isWordAdded(me.currentData[i].id);
			if (!(isAdd !== false && isAdd !== -1)) {
				num++;
			}
		}
		return num;
		
	},
	
	/**
	 * 将数据添加到左侧
	 */
	addLeft: function(){
		var me = this;
		return function(option){
			if (me.onAddLeft(option) !== false) {
				me.addWords[me.addWords.length] = option;
				if(baidu.g('addAll'))
					baidu.g('addAll').innerHTML='<<当页添加（'+me.wordNum()+'个）';
				return true;
			}
			else {
				return false;
			}
		}
	},
	/**
	 * 添加指定的物料到左侧，添加物料成功返回true,失败返回false
	 * @event onAddLeft
	 * @param {Object} obj 要添加的物料，数据结构定义：{id: '', name: ''}
	 */
	onAddLeft: new Function,
	
	/**
	 * 当页添加
	 */
	addAllLeft: function(){
		var me = this;
		return function(option){
			var opts = [];
			for (var i = 0, len = option.length; i < len; i++) {
				var flag = 0;
				for (var j = 0; j < me.addWords.length && flag == 0; j++) {
					if (option[i].id == me.addWords[j].id) 
						flag = 1;
				}
				if (flag == 0) 
					opts[opts.length] = option[i];
			}
			me.onAddAllLeft(opts);
		}
	},
	
	/**
	 * 全部添加后处理
	 * modify  by zhouyu 20130104
	 * 将selectCombo中的addallleftHandler移过来，
	 * 由于添加全部未必所有添加成功，需要判断后再置灰
	 * @param {Object} opts
	 */
	onAddAllLeftHandler: function(opts){
		var me = this;
		for (var i = 0; i < opts.length; i++) {
			me.addWords[me.addWords.length] = opts[i];
		}
		baidu.g('addAll').innerHTML = '<<当页添加（' + me.wordNum() + '个）';
		
		//添加当前页面所有物料到左侧触发界面的更新
		var tars = baidu.q('ui_avatarmaterial_lastlevel');
		var disable = me.selectCombo.getClass("disabled");
		for (var i = 0, len = tars.length; i < len; i++) {
			if (baidu.array.indexOf(opts, function(item){
				return item.id == baidu.getAttr(tars[i], "id");
			}) > -1) {
				baidu.addClass(tars[i], disable);
			}
		}
	},
	
	/**
	 * 添加当前页面所有物料到左侧触发的事件
	 * @event onAddAllLeft
	 * @param {Array} data 所有要添加的物料的数据，数组元素的数据结构：{id: '', name : ''}
	 */
	onAddAllLeft : new Function(),
	/**
	 * 到下一层级，重新构造level和table数据
	 */
	ToNextLevel: function(){
		var me = this;
		return function(option){
			var mat = me.selectCombo.materialLevel.material,
				currentLevel = mat.length,
				id = option.id,
				name = option.name,
				last = false;
			mat[currentLevel] = {
				level : currentLevel,
				id : id,
				word : name,
				click : me.levelFunc[me.level[currentLevel]]
			};
			
			if (currentLevel == me.level.length - 2) {
				last = true;
			}
			me.selectCombo.tableOption.fields[0].content = me.setTableFields(last);
			
			me.levelFunc[me.level[currentLevel]](id);
		}
	},
	
	
	levelChange: function(){
		var me = this;
		return function(level){
			var last = false;
				
			if (level == me.level.length - 2) {
				last = true;
			}
			me.selectCombo.tableOption.fields[0].content = me.setTableFields(last);
			return true;
		}
	},
	
	/**
	 * 根据condition筛选结果
	 */
	search: function(){
		var me = this;
		return function(condition){
			me.currentData= me.filterData(condition);
			me.selectCombo.tableOption.datasource = baidu.object.clone(me.currentData).splice(0, me.pagesize);
			me.setNoTable();
			me.selectCombo.pageOption = me.setPageOption(me.currentData);
		}
	},
	
	/**
	 * 过滤数据
	 * @param {Object} condition
	 */
	filterData: function(condition){
		var me = this, value = "", data = me.resultData, len = data.length;
		var tmp = [];
		if(condition && condition.search){
			value = baidu.encodeHTML(condition.search);
		}
		if (value == "") {
			tmp = data;
		}
		else {
			for (var i = 0; i < len; i++) {
				if ((data[i].name).toUpperCase().indexOf(value.toUpperCase()) != -1) {
					tmp[tmp.length] = data[i];
				}
			}
		}
		return tmp;
	},
	
	setNoTable: function(){
		var me = this;
		me.selectCombo.table.noDataHtml = "<span class='" + me.getClass("noResult") + "'>抱歉，没有结果！</span>";
	},
	
	/**
	 * 设置层级
	 * @method setLevel
	 * @param {Array} level 所要设置的新的层级
	 */
	setLevel: function(level){
		this.level = level || this.level;
	},
	
	
	/**
	 * 恢复已经添加的词
	 * @method recover
	 * @param {String} id 恢复的关键词的id
	 */
	recover: function(id){
		var me = this;
		if (me.onRecover(id) !== false) {
			me.removeAddedWord(id);
			me.selectCombo.recover("id", id);
			if(baidu.g('addAll'))
				baidu.g('addAll').innerHTML='<<当页添加（'+me.wordNum()+'个）';
		}
	},
	/**
	 * 恢复已经添加的词触发的事件，如果恢复失败，返回false
	 * @event onRecover
	 * @param {String} id 恢复的关键词的id
	 */
	onRecover: new Function,
	
	
	/**
	 * 重绘控件
	 */
	repaint: new Function(),
	
	/**
	 * 释放控件
	 * @method dispose
	 */
	dispose: function(){
		ui.Base.dispose.call(this);
	}
};

ui.Base.derive(ui.AvatarMaterial);
