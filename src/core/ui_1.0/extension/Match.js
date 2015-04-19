/*
 * path:    ui/Match.js
 * desc:    match控件
 * author:  liuyutong
 * date:    2011/10/17
 */

/**
 * Match控件，用于对表格数据搜索结果显示
 * 
 * @class Match
 * @namespace ui
 * @extends ui.Base
 * @constructor
 * @param {Object} options 控件初始化参数
 * <pre>
 * 参数配置定义如下：
 * {
 *    tableParam:  [Object],   [REQUIRED] 创建表格控件初始化参数，这里无需配置id属性，
 *                                        具体见{{#crossLink "ui.Table"}}{{/crossLink}}初始化时options的定义
 *    pageParam:   [Object],   [REQUIRED] 显示的分页控件的参数配置，具体见下面的定义
 *    afterrender: [Function], [REQUIRED] 表格控件渲染结束后触发的事件
 * }
 * 
 * pageParam的定义如下：
 * {
 *    pageSize:     [Number],  分页大小
 *    isMatchStyle: [Boolean], 默认false, 貌似这个属性没啥用。。。
 * }
 * </pre>
 */
ui.Match = function(options){
	this.initOptions(options);
    this.type = 'match';
	this.logSwitch = this.logSwitch || true;
};

ui.Match.prototype = {
	/**
	 * 匹配结果显示的分页的记录条数，只读。
	 * @property pageSize
	 * @type Number
	 * @final
	 */
	pageSize : this.pageSize,
	table : function (){
		var me = this,tableParam;
		tableParam = baidu.object.clone(me.tableParam);
		tableParam.datasource = me.listData();
		tableParam.id = me.id + 'table';
		return ui.util.create('Table',tableParam);
	},
	totalNumTPL : '<span class="match_total">共{0}条</span>',
	page : function (){
		var me = this,isMatchStyle = false,pageParam;
		pageParam = me.pageParam;
		me.dataLength = me.tableParam.datasource.length;
		pageParam.total = Math.ceil(me.dataLength / me.pageParam.pageSize);
		pageParam.id = me.id + 'page';
		if(me.pageParam.isMatchStyle){
			isMatchStyle = true;
		}
		return ui.util.create('Page',pageParam); 
	},
	listData : function(value){//翻页数据
		var me = this,
			pageSize = me.pageParam.pageSize,
			data = me.tableParam.datasource,
			pageNo = value || 1,
			tableData = [];	
		for(var i = pageSize * (pageNo - 1) ; i < data.length&& i <pageSize * pageNo;i++ ){
			tableData.push(data[i]);
		}
		return tableData;
	}, 
	init : function(){
		var me = this;
		me.table = me.table();
		me.page = me.page();
		me.page.onselect = function(value){
			me.pageNo = value;
			me.table.datasource = me.listData(value);
			me.table.render();
			me.afterrender();
		}
		
	},
	/**
	 * 绘制控件
	 * @method render
	 * @public
	 * @param {HTMLElement} main 控件挂载DOM元素
	 */
	render : function(main){
		var me = this;
		if(!me.main){
			ui.Base.render.call(me, main, true);
		}
		me.init();
		me.table.appendTo(me.main);
		me.page.appendTo(me.main);
		setTimeout(function(){
				baidu.event.fire(window,'resize');
			},300);
		if(me.pageParam.total > 1){
			var span = document.createElement('span');
			span.innerHTML = ui.format(me.totalNumTPL,me.dataLength);
			baidu.dom.insertAfter(span,me.page.main);
		}
		me.afterrender();
	},	
	/**
     * 将未渲染的Match控件渲染到指定的DOM元素里
     * @method appendTo
     * @param {HTMLElement} container 渲染的控件添加到的目标DOM元素
     */
	appendTo: function (container) {
        var main = document.createElement('div');
        container.appendChild(main);
        this.render(main);
    },
    /**
	 * 释放控件实例
	 * @method dispose
	 */
	dispose : function (){
		var me = this,
			controlMap = this.controlMap,
			main = this.main;
			// dispose子控件
			me.table.main.innerHTML = '';
			me.page.main.innerHTML = '';				
			// 释放控件主区域的事件以及引用
			if (main) {
				main.onmouseover = null;
				main.onmouseout = null;
				main.onmousedown = null;
				main.onmouseup = null;
			}
			this.main = null; 
	}
}
ui.Base.derive(ui.Match);
 