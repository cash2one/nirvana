/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/SelectCombo.js
 * desc:    物料选择控件
 * author:  zhouyu
 * date:    2010/12/23
 */

/**
 * 物料选择控件
 * @class SelectCombo
 * @extend ui.Base
 * @namespace ui
 * @constructor
 * @param {Object} options 控件初始化参数 
 * <pre>
 * 配置项定义如下：
 * {
 *     id:            [String],        [REQUIRED] SelectCombo的id属性，值为字符串，此值并不对应DOM元素的ID
 *     width:         [Number],        [OPTIONAL] 控件的宽度，默认400
 *     height:        [Number|'auto'], [OPTIONAL] 控件的高度，默认500
 *     needDel:       [Boolean],       [OPTIONAL] 是否提供显示已删除的复选框，默认false
 *     close:         [Boolean],       [OPTIONAL] 是否提供关闭按钮，默认false
 *     materialLevel: [Object],        [OPTIONAL] 创建物料层级控件初始化参数, 这里无需配置id属性，
 *                                                具体见{{#crossLink "ui.MaterialLevel"}}{{/crossLink}}初始化时options的定义
 *     searchOption:  [Object],        [OPTIONAL] 创建搜索下拉列表控件初始化参数，这里无需配置id属性，
 *                                                具体见{{#crossLink "ui.SearchCombo"}}{{/crossLink}}初始化时options的定义
 *     tableOption:   [Object],        [OPTIONAL] 创建表格控件列表初始化参数，这里无需配置id属性，
 *                                                具体见{{#crossLink "ui.Table"}}{{/crossLink}}初始化时options的定义
 *     pageOption:    [Object],        [OPTIONAL] 创建表格分页控件初始化参数，这里无需配置id属性，
 *                                                具体见{{#crossLink "ui.Page"}}{{/crossLink}}初始化时options的定义
 * }
 * </pre>
 */
ui.SelectCombo = function (options) {
    this.initOptions(options);
    this.type = 'selectcombo';
	
	this.width = this.width || 400;
	this.height = this.height || 500;
};

ui.SelectCombo.prototype = {
	/**
	 * 绘制控件
	 * @method render
	 * @public
	 * @param {HTMLElement} main 控件挂载DOM元素，必须是DIV元素
	 */
	render: function(main){
		var me = this;
		if (main && main.tagName != 'DIV') {
			return;
		}
		
		if (!me.isRender) {
			ui.Base.render.call(me, main, true);
			if(me.width){
				me.main.style.width = me.width + "px";
			}
			if(me.height){
				me.main.style.height = (me.height == 'auto') ? 'auto' : me.height + "px";
				me.main.style.overflow = "auto";
			}
			me.renderParts();
			
			me.level.onselect = me.levelChangeHandler();
			me.search.onclick = me.searchHandler();
			if(me.page){
				me.page.onselect = me.onPageChange;
			}
			if(me.main){
				baidu.on(me.main,"click",me.clickHandler());
			}
			me.isRender = true;
		}
		else {
			me.repaint();
		}
	},
	
	/**
	 * 渲染各个组件
	 */
	renderParts: function(){
		var me = this;
		me.setLevel();
		me.setSearch();
		me.setTable();
		if(me.pageOption){
			me.setPage();
		}
		if(me.needDel){
			me.setShowDel();
		}
		if(me.close){
			me.setClose();
		}
	},
	
	/**
	 * 重置ui的option，用于refresh
	 * @param {Object} Obj
	 * @param {Object} option
	 */
	refreshOption:function(Obj,option){
		for(var item in option){
			Obj[item] = option[item];
		}
	},
	
	/**
	 * 渲染层级
	 */
	setLevel: function(){
		var me = this;
		var data = me.materialLevel || {};
		if (!me.level) {
			data.id = me.id + "level";
			me.level = ui.util.create('MaterialLevel', data);
		}else{
			me.refreshOption(me.level,data);
		}
		var levelId = me.level.getId();
		var part = baidu.g(levelId);
			
		if(!part){
			part = document.createElement('div');
			part.id = levelId;
			me.main.appendChild(part);
		}
		me.level.render(part);
	},
	
	
	/**
	 * 渲染组合搜索
	 */
	setSearch: function(){
		var me = this;
		var data = me.searchOption || {};
		if (!me.search) {
			data.id = me.id + "search";
			me.search = ui.util.create('SearchCombo', data);
		}else{
			me.refreshOption(me.search,data);
		}
		var searchId = me.search.getId();
		var part = baidu.g(searchId);
		
		if (!part) {
			part = document.createElement('div');
			part.id = searchId;
			me.main.appendChild(part);
		}
		me.search.render(part);
	},
	
	/**
	 * 渲染table
	 */
	setTable: function(){
		var me = this;
		var data = me.tableOption || {};
		if (!me.table) {
			data.id = me.id + "table";
			me.table = ui.util.create('Table', data);
		}else{
			me.refreshOption(me.table,data);
		}
		var tableId = me.table.getId();
		var part = baidu.g(tableId);
		
		if (!part) {
			part = document.createElement('div');
			part.id = tableId;
			me.main.appendChild(part);
		}
		me.table.render(part);
		if (me.table.width) {
			me.table.main.style.width = me.table.width + "px";
		}
		if (me.table.height) {
			me.table.main.style.height = me.table.height + "px";
		}
	},
	
	/**
	 * 渲染页码
	 */
	setPage: function(){
		var me = this;
		var data = me.pageOption;
		if (!me.page) {
			data.id = me.id + "page";
			me.page = ui.util.create('Page', data);
		}else{
			me.refreshOption(me.page,data);
		}
		var pageId = me.page.getId();
		var part = baidu.g(pageId);
		
		if (!part) {
			part = document.createElement('div');
			part.id = pageId;
			me.main.appendChild(part);
		}
		me.page.render(part);
	},
	
	/**
	 * 显示已删除
	 */
	setShowDel : function() {
		var me = this;
		
		if (!me.showDel) {
			var me = this,
				div = document.createElement('div'),
				input = document.createElement('input');
			
			me.showDel = ui.util.create('CheckBox', {
				'id': me.getId()
			});
			
			div.className = 'mtl_showdel';
			div.id = me.getId('needDel');
			input.type = 'checkbox';
			input.title = '显示已删除';
			
			div.appendChild(input);
			me.main.appendChild(div);
			
			me.showDel.render(input);
			me.showDel.onclick = function() {
				me.checkShowDelStat();
				me.showDelHandler();
			};
		}
		
		// 检查已删除状态
		me.checkShowDelStat();
	},
	
	/**
	 * 检查显示已删除的状态
	 */
	checkShowDelStat : function() {
		var me = this;
		
		if(me.showDel){
			me.isShowDel = me.showDel.getChecked();
		}else{
			me.isShowDel = false;
		}
		
	},
	
	/**
	 * 显示已删除点击事件
	 * @event showDelHandler
	 */
	showDelHandler : new Function,
	
	/**
	 * 渲染关闭按钮
	 */
	setClose: function(){
		var me = this,
			close = document.createElement('div');
		close.id = me.getId("close");
		baidu.addClass(close,me.getClass("close"));
		me.main.appendChild(close);
	},
	
	/**
	 * 控件的点击事件：关闭按钮点击事件、物料名点击事件（进入下一层级或者加入左侧选择框）
	 */
	clickHandler: function(){
		var me = this;
		return function(){
			var e = window.event || arguments[0],
				target = e.srcElement || e.target;
			while(target && target.id != me.main.id){
				if(target.id == me.getId("close")){
					me.closeMe();
					return;
				}
				//当页添加
				if(target.id == 'addAll'){
					me.addAllToLeft();
					return;
				}
				if(target.getAttribute("lastlevel") == "y" && !baidu.dom.hasClass(target,me.getClass("disabled"))){
					me.addToLeft(target);
					return;
				}else if(target.getAttribute("lastlevel") == "n"){
					me.toNextLevel(target);
					return;
				}
				target = target.parentNode;
			}
		}
	},
	
	/**
	 * 关闭控件
	 */
	closeMe: function(){
		var me = this;
		me.main.style.top = "-10000px";
		me.main.style.left = "-10000px";
		/**
		 * 关闭物料选择触发的事件
		 * @event onclose
		 */
		if (me.onclose){
			me.onclose();
		}
	},
	
	/**
	 * 添加到左侧选择框
	 * @param {Object} tar 要添加的对象
	 */
	addToLeft: function(tar){
		var me = this,
			id = tar.getAttribute("id"),
			name = baidu.getAttr(tar,"saveword");
		var opt = {
			id: id,
			name: name
		};
		if(me.onAddLeft(opt) !== false){
			baidu.addClass(tar,me.getClass("disabled"));
		}
	},
	
	/**
	 * 添加指定的物料到左侧，添加物料成功返回true,失败返回false
	 * @event onAddLeft
	 * @param {Object} opt 要添加的物料，数据结构定义：{id: '', name: ''}
	 * @return {Boolean} result 添加物料是否成功，成功返回true,失败返回false
	 */
	onAddLeft: new Function(), //将数据添加到左侧
	
	/**
	 * 当页添加
	 */
	addAllToLeft : function(){
		var me = this,
			tars = baidu.q('ui_avatarmaterial_lastlevel'),
			opts = [];
		for(var i=0,len=tars.length;i<len;i++){
			var id = tars[i].getAttribute('id'),
				name = baidu.getAttr(tars[i],'saveword');
			opts.push({id:id,name:name});	
		}
		me.onAddAllLeft(opts);
	},

	/**
	 * 添加当前页面所有物料到左侧触发的事件
	 * @event onAddAllLeft
	 * @param {Array} data 所有要添加的物料的数据，数组元素的数据结构：{id: '', name : ''}
	 */
	onAddAllLeft : new Function(),
	/**
	 * 数据从左侧选择框还原
	 * @method recover
	 * @param {Object} key
	 * @param {Object} value
	 */
	recover: function(key,value){
		var me = this,
			table = me.table.main;
		//获取table下面所有a对象
		var links = $$.find("a", table).set;
	
		for (var i = 0, l = links.length; i < l; i++) {
			if(links[i].getAttribute(key) == value && baidu.dom.hasClass(links[i],me.getClass("disabled"))){
				baidu.removeClass(links[i],me.getClass("disabled"));
				break;
			}
		}
		
	},
	
	
	/**
	 * 点击进入到下一层级
	 * @param {Object} target 点击的对象
	 */
	toNextLevel: function(target){
		var me = this,
			id = target.getAttribute("id"),
			name = target.innerHTML;
		var opt = {
			id: id,
			name: name
		};
		me.onToNextLevel(opt);
	},

	/**
	 * 点击进入下一层级触发的事件
	 * @event onToNextLevel
	 * @param {Object} opt 数据结构定义{id: '', name: ''}
	 */
	onToNextLevel: new Function(),//重新构造level和table数据 
	
	/**
	 * 获取当前层级
	 * @method getLevel
	 * @return {Object} level 层级对象
	 */
	getLevel: function(){
		return this.level.getLevel();
	},
	
	/**
	 * 获取当前页码
	 * @method getPage
	 * @return {Number} 
	 */
	getPage: function(){
		return this.page.getPage();
	},
	
	/**
	 * 层级改变事件处理
	 */
	levelChangeHandler: function(){
		var me = this;
		return function(level){
			me.search.setValue("");
			if(me.onLevelChange(level)){
				me.setTable();
				me.tableOption.datasource = me.table.datasource;
			}
		};
	},
	/**
	 * 物料层级改变触发的事件
	 * @event onLevelChange
	 * @param {Object} level 选择的新层级
	 */
	onLevelChange: new Function(),
	
	/**
	 * 查询事件处理
	 */
	searchHandler: function(){
		var me = this;
		return function(condi){
			if(me.onsearch(condi) !== false){ //在onsearch接口中重设this.tableOption
				me.setTable();
				me.setPage();
				me.page.onselect = me.onPageChange;
			}
		};
	},

	/**
	 * 可搜索的下拉列表搜索触发的事件, 返回搜索成功的状态, true为成功，false为失败
	 * @event onsearch
	 * @param {String} condition 组合搜索框输入的搜索值
	 * @return {Boolean} result 返回搜索成功的状态, true为成功，false为失败
	 */
	onsearch: new Function(),//根据condition筛选结果
	/**
	 * 选择不同分页或者分页导航（上一页/下一页）触发的事件
	 * @event onPageChange
	 * @param {Number} page 选择的分页
	 * @param {String} prevOrNext 其值可能能为'prev'或'next'或者undefined
	 */
	onPageChange: new Function(), //翻页更新table数据
	
	/**
	 * 重绘控件
	 */
	repaint: function(){
		var me = this;
		me.main.style.top = 0;
		me.main.style.left = 0;
		me.renderParts(); 
	},
	
	/**
	 * 释放控件实例
	 * @method dispose
	 */
	dispose: function(){
		var me = this;
		ui.Base.dispose.call(me);
		document.body.removeChild(baidu.g(me.getId('level')));
		document.body.removeChild(baidu.g(me.getId('search')));
		document.body.removeChild(baidu.g(me.getId('table')));
		document.body.removeChild(baidu.g(me.getId('page')));
		if(me.needDel){
			document.body.removeChild(baidu.g(me.getId('needDel')));
		}
		if(me.close){
			document.body.removeChild(baidu.g(me.getId('close')));
		}
		if(me.main){
			baidu.un(me.main,"click",me.clickHandler());
		}
	}
};

ui.Base.derive(ui.SelectCombo);
