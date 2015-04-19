/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/Region.js
 * desc:    基础选择控件
 * author:  zhouyu
 * date:    2010/12/10
 */

/**
 * 地域选择控件
 * 
 * @class Region
 * @namespace ui
 * @extends ui.Base
 * @constructor
 * @param {Object} options 控件初始化参数
 * <pre>
 * 参数配置定义如下：
 * {
 *    id:         [String],           [REQUIRED] 控件ID
 *    datasource: [Array],            [OPTIONAL] 绑定的数据源，默认src/nirvana/config.js#REGION_LIST
 *    mode:       ['multi'|'single'], [REQUIRED] 地域选择的方式，多选or单选
 *    checked:    [Array],            [OPTIONAL] 已选择的地域ID列表
 * }
 * </pre>
 */
ui.Region = function (options) {
	this.initOptions(options);
	this.source = this.datasource || REGION_LIST;
	this.tmpHTML = [];
	this.hashSon = [];
	this.hashFather = [];
	this.hashMoni = [];
	this.suffix = '_' + this.id;
	this.type="region";
};

 
ui.Region.prototype = {
	/**
     * 渲染控件
     * 
     * @method render
     * @param {Object} main 控件挂载的DOM
     */
    render: function (main) {
		var me = this;
		if (!me.isRender) {
			ui.Base.render.call(me,main,true);
			if (me.mode == "multi") {
				me.multiInit();
			}
			else 
				if (me.mode == "single") {
					me.singleInit();
				}
			
			me.isRender = true;
		}else{
			me.repaint();
		}
	},
	
	repaint: function(){
		
		
	},
	
	
	/**
	 * 多选地域初始化
	 */
	multiInit: function(){
		var me = this;
		me.tmpHTML[me.tmpHTML.length] = '<div class="regionSelect">';
		me.initData(null, me.source);
		me.tmpHTML[me.tmpHTML.length] = '</div>';
		baidu.g(me.main.id).innerHTML = me.tmpHTML.join("");
		me.fillChecked();
		me._setStyle();
		baidu.on(me.main, "click", me.multiClickHandler(me));
	},
	
	multiClickHandler: function(me){
		return function(){
			var e = window.event || arguments[0], t = e.target || e.srcElement, logParams = {};
			if (t.tagName == "INPUT") {
				if (me.isLeaf(t)) {
					me.checkFather(t);
					logParams.value = nirvana.config.region[+me.getValue(t)][0];
				}
				else {
					me.checkSon(t);
					if (!me.isRoot(t)) {
						me.checkFather(t);
					}
				}
				me.onclick(me.getCheckedRegion());
				logParams.target = t.id + "_checkbox";
				logParams.checked = t.checked;
				NIRVANA_LOG.send(logParams);
			}
		};
	},

	onclick: new Function(),

	
	/**
	 * 构造父节点，并递归构造 子节点 
	 * @param {Object} d
	 * @param {Object} item
	 */
	showFather: function(d,item){
		var name = d[item].name,
			list = d[item].list,
			me = this;;
		me.tmpHTML[me.tmpHTML.length] = '<dl>';
		me.tmpHTML[me.tmpHTML.length] = '<dt>';
		me.tmpHTML[me.tmpHTML.length] = '<input id="' + me.getId(item)+ '" type="checkbox">';
		me.tmpHTML[me.tmpHTML.length] = '<label for="' + me.getId(item) + '">' + name + '</label>';
		me.tmpHTML[me.tmpHTML.length] = '</dt>';
		me.tmpHTML[me.tmpHTML.length] = '<dd>';
		me.tmpHTML[me.tmpHTML.length] = '<div id="' + item + me.suffix + '">';
		me.initData(item, list);
		me.tmpHTML[me.tmpHTML.length] = '</div>';
		me.tmpHTML[me.tmpHTML.length] = '</dd>';
		me.tmpHTML[me.tmpHTML.length] = '</dl>';
	},
	
	
	/**
	 * 构造叶子节点
	 * @param {Object} d
	 * @param {Object} item
	 */
	showLeaf: function(d, item){
		var me = this;
		var name = d[item];
		me.tmpHTML[me.tmpHTML.length] = '<span class="leaf">';
		me.tmpHTML[me.tmpHTML.length] = '<input id="' + me.getId(item)+ '" type="checkbox">';
		me.tmpHTML[me.tmpHTML.length] = '<label for="' + me.getId(item) + '" >' + name + '</label>';
		me.tmpHTML[me.tmpHTML.length] = '</span>';
	},
	
	
	
	/**
	 * 构造初始化数据，被递归调用
	 * @param {Object} father
	 * @param {Object} d
	 */
	initData : function(father,d){
		var me = this;
		if (father) {
			me.hashSon[father] = [];
			var i = 0;
			for (var item in d) {
				if (typeof(d[item]) == "object") {
					me.showFather(d,item);
				}
				else 
					if (typeof(d[item]) == "string") {
						me.hashSon[item] = null;
						me.showLeaf(d,item);
					}
				me.hashFather[item] = father;
				me.hashSon[father][i++] = item;
			}
		}
		else {
			for (var item in d) {
				if (typeof(d[item]) == "object") {
					me.showFather(d,item);
				}
				else 
					if (typeof(d[item]) == "string") {
						me.showLeaf(d,item);
					}
				me.hashFather[item] = father;
			}
		}
	},
	
	
	/**
	 * 填充已选择项
	 * @method fillChecked
	 * @private 
	 */
	fillChecked : function(){
		var me = this;
		if (me.checked) {
			var len = me.checked.length, tmp = null;
			for (var i = 0; i < len; i++) {
				tmp = baidu.g(me.getId(me.checked[i]));
				tmp.checked = true;
				me.checkFather(tmp);
			}
		}
	},
	
	
	
	/**
	 * 根据子节点设置父节点的选择状态，递归调用
	 * @param {Object} target
	 */
	checkFather: function(target){
		var me = this;
		var va = me.getValue(target);
		var fa = me.hashFather[va];
		if(fa){
			var father = baidu.g(me.getId(fa));
			if (me.sonAllChecked(fa)) {
				father.checked = true;
			}else{
				father.checked =false;
			}
			me.checkFather(father);
		}
	},
	
	
	/**
	 * 根据父节点设置子节点的选择状态，递归调用
	 * @param {Object} target
	 */
	checkSon: function(target){
		var me = this;
		var stat = target.checked,
			va = me.getValue(target),
			children = me.hashSon[va],
			child = null,
			l = children ? children.length : 0;
		for (var i = 0 ; i < l; i++) {
			child = baidu.g(me.getId(children[i]));
			child.checked = stat;
			me.checkSon(child);
		}
	},
	
	
	/**
	 * 检查是否所有的子节点被选择
	 * @param {Object} father
	 */
	sonAllChecked: function(father){
		var me = this;
		var children = me.hashSon[father];
		for (var i = 0, l = children.length; i < l; i++) {
			if (!baidu.g(me.getId(children[i])).checked) {
				return false;
			}
		}
		return true;
	},
	
	
	/**
	 * 检查是否叶子节点
	 * @param {Object} target
	 */
	isLeaf: function(target){
		var me = this;
		var va = me.getValue(target);
		if (!me.hashSon[va]) {
			return true;
		}
		else {
			return false;
		}
	},
	
	
	/**
	 * 检查是否根节点
	 * @param {Object} target
	 */
	isRoot: function(target){
		var me = this;
		var va = me.getValue(target);
		if(!me.hashFather[va]){
			return true;
		}
		else{
			return false;
		}
	},
	
	
	/**
	 * 根据dom对象获取其复选框的value值
	 * @param {Object} target
	 */
	getValue: function(target){
		return target.id.substring(this.getId().length);
	},
	
	
	
	/**
	 * 获取已选地区列表
	 * @method getCheckedRegion
	 * @return {Array} 已选择的地域ID列表
	 */
	getCheckedRegion: function(){
		var me = this;
		var checkedRegion = [], input = $$.find("input", me.main).set, tmp;
		for (var i = 0, l = input.length; i < l; i++) {
			if (input[i].checked) {
				tmp = me.getValue(input[i]);
				if (!me.hashSon[tmp]) {
					checkedRegion[checkedRegion.length++] = tmp;
				}
			}
		}
		return checkedRegion;
	},
	
	/**
	 * 取消所有选择
	 */
	unCheckedAll: function(){
		var me = this, input = $$.find("input", me.main).set;
		for (var i = 0, l = input.length; i < l; i++) {
			input[i].checked = false;
		}
	},
	
	/**
 	* 以下针对凤巢地域设置样式
 	*/
	//start
	whiteLine : ["North","East","South","NorthWest"],
	grayLine: ["NorthEast","Middle","SouthWest","Other","Abroad"],
	tmpLine: null,
	_getLine: function(line){
		return baidu.g(line + this.suffix);
	},
	
	_setStyle: function(){
		var me = this,
		    tmpLine;
		for (var i = 0, l = me.whiteLine.length; i < l; i++) {
			tmpLine = me._getLine(me.whiteLine[i]).parentNode.parentNode;
			baidu.addClass(tmpLine,"whitebg");
		}
		for (var i = 0, l = me.grayLine.length; i < l; i++) {
			if ((me.grayLine[i]) == "Abroad") {
				tmpLine = me._getLine(me.grayLine[i]);
			}
			else{
				tmpLine = me._getLine(me.grayLine[i]).parentNode.parentNode;
			}
			baidu.addClass(tmpLine,"graybg");
		}
	},
	//end	
	
	
	//******以下是单选模式各方法*******/
	
	/**
	 * 单选地域初始化
	 */
	singleInit: function(){
		var me = this;
		me.optData = [];
		var options = {
			id: me.id + "region",
			type: "Select",
			datasource: [{
				text:"当前地域", 
				value:0
			}],
			value: 0,
			width:100
		};
		this.sinSelect = ui.util.create("Select",options);
		this.sinSelect.appendTo(me.main);

		me.fillOptions(me.source);
	},	
	
	/**
	 * 填充下拉框选项
	 * @param {Object} data	循环源数据，将叶子填充到下拉框中
	 */
	fillOptions: function(data){
		var me = this;
		for (var item in data) {
			if (typeof(data[item]) == "object") {
				me.fillOptions(data[item].list);
			}
			else 
				if (typeof(data[item]) == "string") {
					var tmp = {
						text: data[item],
						value: item
					};
					me.optData[me.optData.length] = tmp;
				}
		}
		me.sinSelect.fill(me.optData);
	},
	
	/**
	 * 设置选择值，用于单选模式的地域选择
	 * @param {Object} value 要设置的值
	 * @method setSinValue
	 */
	setSinValue: function(value){
		this.sinSelect.setValue(value);
	},
	
	
	/**
	 * 获取选择值，用于单选模式的地域选择
	 * @method getSinValue
	 * @return {String}
	 */
	getSinValue: function(){
		return this.sinSelect.getValue();
	},
	
	/**
     * 释放控件
     * @method dispose
     */
    dispose: function () {
		var me = this;
        if (me.mode == "multi") {
			baidu.un(me.main, "click", me.multiClickHandler(me));
		}
		else 
			if (me.mode == "single") {
				this.sinSelect = null;
			}
        ui.Base.dispose.call(this);
    }
} 


ui.Base.derive(ui.Region);