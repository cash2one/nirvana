/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/MaterialLevel.js
 * desc:    物料层级控件
 * author:  zhouyu
 * date:    2010/12/23
 */
/**
 * 物料层级，就是在推广管理上半部分看到的面包屑导航、监控文件夹添加监控关键字右边面包屑导航等<br/>
 * 比如: 账户：UserName >> 计划：PlanName >> 单元: UnitName <br/>
 * 或者      计划列表 >> 计划：PlanName >> 单元: UnitName <br/>
 * 除了第一层级在不同应用上下文会发生变化，后面层级是固定的，只是层级深度可能不一样
 * 
 * @class MaterialLevel
 * @extend ui.Base
 * @namespace ui
 * @constructor
 * @param {Object} options 控件初始化参数
 * <pre>
 * {
 *     id:          [String], [REQUIRED] 层级控件ID
 *     space:       [String], [OPTIONAL] 层级的分隔符，默认'>>'
 *     material:    [Array],  [REQUIRED] 物料数据，数组元素为对象，其数据结构见下面material结构定义
 *     fatherWidth: [Number], [OPTIONAL] 物料层级所要渲染的父容器的宽度，默认undefined
 * }
 * material:
 * [
 *     {
 *        level:      [Number],   [REQUIRED] 物料层级0对应账户或者其他非账户层级，1对应计划层级，2对应单元层级
 *        id:         [String],   [REQUIRED] 物料层级id
 *        tipContent: [String],   [OPTIONAL] 对于level为0即第一层级，<b>若不是账户，需要提供该参数</b>，
 *                                           否则默认第一层级用"账户"来显示
 *        type:       [String],   [OPTIONAL] 物料类型，默认账户:acct、计划:plan、单元:unit
 *        word:       [String],   [REQUIRED] 物料层级每一层级所对应的字面值
 *        click:      [Function], [OPTIONAL] 物料层级被点击事件处理器
 *     },
 *     ...
 * ]
 * </pre>
 * <b>NOTICE</b>: 层级必须按0,1,2,...顺序来定义层级数据,即<br/>
 * <code>
 * [
 *     {
 *        level: 0,
 *        ...
 *     },
 *     {
 *        level: 1,
 *        ...
 *     },
 *     ...
 * ]
 * </code>
 * <p>当前业务背景，只到level=2的级别，因此level不要超过2</p>
 */
ui.MaterialLevel = function (options) {
    this.initOptions(options);
    this.type = 'materiallevel';
	this.space = this.space || ">>";
	
	this.material = this.material || [{level:0,word:"",click:function(){alert("让你懒，烦死你！");}}];
};

ui.MaterialLevel.prototype = {
	/**
	 * 渲染控件
	 * @method render
	 * @param {Object} main 挂载控件的DOM
	 */
	render: function(main){
		var me = this;
		
		if (main) {
			ui.Base.render.call(me, main, true);
		}
		me.main.innerHTML = me.getMainHtml();
		me.main.onclick = me.clickHandler();
	},
	
	/**
	 * 物料选择控件中根据选择控件的宽度来动态定义截断长度
	 */
	getThreshLen:function(){
		var me = this,
			len = me.material.length,
			threshLen = {};
			
		if(len > 1){
			//210px是关闭符号以及“账户”、“计划”、“单元”等固定字符的宽度之和
			var tWidth = me.fatherWidth - 210,
			//可显示字符数，按照平均每个字符最大8px来计算（最长字符M为9px，其余均小于8px）
				avgChars = Math.floor(tWidth/8);
			switch(len){
				case 2:
					threshLen["1"] = avgChars + 4;
					break;
				case 3:
					threshLen["1"] = Math.ceil(avgChars/2);
					threshLen["2"] = Math.ceil(avgChars/2);
					break;
				default:
					break;
			}
		}
		return threshLen;
	},
	
	/**
	 * 填充html
	 */
	getMainHtml: function(){
		var me = this,
			mat,level,word,title,
		//	threshLen = 14,
			html = [],
			id = "",
			type = "",
			cla = "",
			log = "",
			lastlevel = false,
			len = me.material.length,
			threshLen = null;
	    /**
	     * 物料层级所要渲染的父容器的宽度
	     * @property fatherWidth
	     * @type Number
	     * @default undefined
	     */
		if(me.fatherWidth){
			threshLen = me.getThreshLen();
		}
		for (var i = 0; i < len; i++) {
			mat = me.material[i];
			level = mat.level;
			
			title = escapeQuote(mat.word);
			word = baidu.string.decodeHTML(mat.word); //从table中传过来的值经过encode编码
			
			if (threshLen && threshLen[level]) {
				if (baidu.string.getByteLength(word) > threshLen[level]) {
					word = baidu.string.subByte(word, threshLen[level]) + "..";
				}
			}	
			
			word = baidu.string.encodeHTML(word);
			id = mat.id ? (" id = " + mat.id) : "";
		//	type = mat.type ? (" type = " + mat.type) : "";
			if (i != 0) {
				html[html.length] = '&nbsp;<span class="' + me.getClass("space") + '">' + me.space + '</span>&nbsp;';
			}
			if (i == level) {
				switch (level) {
					case 0:
						//部分层级关系中第一层关系不是“账户：账户名”的形式
						if (typeof(mat.tipContent) != "undefined") {
							html[html.length] = '<i>' + mat.tipContent + '</i>';
						}
						else {
							html[html.length] = '<i>账户:</i>';
							type = mat.type || "acct";
						}
						break;
					case 1:
						html[html.length] = '<i>计划:</i>';
						type = mat.type || "plan";
						break;
					case 2:
						html[html.length] = '<i>单元:</i>';
						type = mat.type || "unit";
						break;
				}
				if(i != len-1){
					cla = me.getClass("word");
					lastlevel = false;
				}else{
					cla = me.getClass("lastword");
					lastlevel = true;
				}
				if(type.length > 0){
					var datalog = {
						target: me.id + "_" + me.type + "_lbl",
						type: type,
						id: mat.id,
						lastlevel: lastlevel
					};
					log = " data-log=" + baidu.json.stringify(datalog);
				}
				html[html.length] = '<span level="' + level + '"' + id + log + ' class="' + cla + '" title="' + title + '">' + word + '</span>';
			}else{
				alert("出错啦！！！");
			}
		}
		return html.join("");
	},
	
	/**
	 * 获取当前层级深度
	 * @method getLevel
	 * @return {Number}
	 */
	getLevel: function(){
		return this.material.length;
	},
	
	/**
	 * 增加新的层级到当前层级最后，并立即更新界面
	 * @method add
	 * @param {Object} mat 增加的层级的数据对象，数据结构定义见控件配置参数
	 */
	add: function(mat){
		var me = this;
		me.material[me.material.length] = mat;
		me.render();
	},
	/**
	 * 选择层级触发的事件
	 * @event onselect
	 * @param {Number} level 当前层级索引
	 */
	onselect: new Function(),
	
	/**
	 * 点击事件
	 */
	clickHandler: function(){
		var me = this;
		return function(){
			var e = window.event || arguments[0],
				target = e.target || e.srcElement;
			while(target && target.id != me.main.id){
				if (baidu.dom.hasClass(target, me.getClass("word"))) {
					var level = target.getAttribute("level"), 
						id = target.getAttribute("id"),
						logParams = {};
					logParams.target = me.id + ""
					me.changeLevel(level, id);
					return;
				}
				else {
					target = target.parentNode;
				}
			}
		}
	},
	
	/**
	 * 通过点击改变当前层级
	 * @param {Object} level
	 * @param {Object} id
	 */
	changeLevel: function(level,id){
		var me = this;
		var len = me.material.length,
			click = me.material[level]["click"],
			start = +level + 1,
			num = len -(+level) -1;
		me.material.splice(start,num);
		me.render();
		if (typeof(click) == 'function' && typeof(id) != "undefined") {
			click(id);
		}
		me.onselect(level);
	},
	/**
	 * 释放控件实例
	 * @method dispose
	 */
	dispose: function(){
		ui.Base.dispose.call(this);
		if (this.main) {
			this.main.onclick = null;
		}
	}
};

ui.Base.derive(ui.MaterialLevel);
