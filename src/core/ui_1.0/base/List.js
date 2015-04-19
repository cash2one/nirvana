/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/List.js
 * desc:    列表操作控件
 * author:  zhouyu
 * date:    2010/12/14
 */

/**
 * 
 * 列表操作控件
 * <br/>
 * 注意： 列表中的内容可以传入html标签，以便控制内容的样式，故需要转义的内容必须在控件外做处理
 * 
 * @class List
 * @extend ui.Base
 * @namespace ui
 * @constructor
 * @param {Object} options  options 控件初始化参数(content)
 * <pre>
 * 配置项如下：
 * {
 *     id:      [String], [REQUIRED] List的id属性，值为字符串，此值并不对应DOM元素的ID
 *     content: [Array],  [OPTIONAL] List显示的content，数组元素结构见line结构说明
 * }
 * line结构：
 * {
 *  classname: [String], 单行样式
 *  html:      [String], 要填充的内容
 *  key:       [String], 键名，默认为"value"
 *  value:     [String], 键值
 *  tip:       [Object], 内容后的提示语
 *                       {
 *                          content:  [String], 提示内容
 *                          tipClass: [String], 提示语的样式
 *                          isDel:    [Boolean], 是否在tip上绑定点击删除节点事件，默认false
 *                       }
 *  autoState: [Boolean], 是否在mouseover和mouseout时切换样式,默认值为false
 * }
 * </pre>
 */
ui.List = function (options) {
    this.initOptions(options);
    this.type = 'list';
	this.key = "value";//value的默认键值
};

ui.List.prototype = {
	tplList: '<div autostate={2}  class="{0}"{6}>' +
				'<div>{1}</div>' +
				'<div class="{3}" isdel={4}>{5}</div>' +
			 '</div>',
	tplNoTipList: '<div autostate={2}  class="{0}"{3}>' +
					'<div>{1}</div>' +
			 	  '</div>',
	/**
	 * 渲染控件
	 * @method render
	 * @param {HTMLElement} main 控件挂载的DOM
	 */
	render: function(main){
        var me = this;
	//	if (!me.isRendered) {
			var len = me.content ? me.content.length : 0;
			var html = [];
			ui.Base.render.call(me, main, false);
			if (len > 0) {
				for (var i = 0; i < len; i++) {
					html[html.length] = me.formatHtml(me.content[i]);
				}
			}
			this.main.innerHTML = html.join("");
            me.bindEvent();
			me.isRendered = true;
	//	}else {
	//		me.repaint();
	//	}
	},
	
	repaint: function(){
		
	},
	
	/**
	 * 格式化一行内容
	 * @param {Object} line 要增加的内容
	 * line结构：
	 * {
	 *  classname:单行样式
	 *  html：要填充的内容
	 *  key:键名，默认为"value"
	 *  value:键值
	 *  tip:内容后的提示语
	 *  	{
	 *  		content:提示内容
	 *  		tipClass:提示语的样式
	 *  		isDel:是否在tip上绑定点击删除节点事件
	 *  	}
	 *  autoState:是否在mouseover和mouseout时切换样式
	 * }
	 */
	formatHtml: function(line){
		var me = this;
		var lineHtml = "";
		var keyValue = "";
		if (typeof(line.value) != "undefined") {
			var key = line.key ? line.key : me.key;
			keyValue = " " + key + "=" + line.value;
		}
		if (line.tip) {
			lineHtml = ui.format(me.tplList, 
								line.classname || '', 
								line.html, 
								line.autoState || false,
								line.tip.tipClass || '', 
								line.tip.isDel || false, 
								line.tip.content || '',
								keyValue
								);
		}
		else{
			lineHtml = ui.format(me.tplNoTipList, 
								line.classname || '', 
								line.html, 
								line.autoState || false,
								keyValue
								);
		}
		return lineHtml;
	},
	
	
	/**
	 * 增加一行内容 
	 * @method add
	 * @param {Object} line 要增加的内容，其结构见List定义
	 */
	add: function(line){
		this.main.innerHTML += this.formatHtml(line);
	},
	
	/**
	 * 增加多行内容
	 * @method addList
	 * @param {Array} addword 其数据元素结果见List定义
	 */
	addList: function(addword){
		var html = '';
		for(var i = 0 , len = addword.length; i < len; i++){
			html += this.formatHtml(addword[i]);
		};
		this.main.innerHTML += html;
	},
	
	/**
	 * 获取单行value值
	 * @method getItemValue
	 * @param {HTMLElement} target 单行DOM元素
	 * @param {Object} key value键名
	 * @return {Object}
	 */
	getItemValue: function(target,key){
		key = key || this.key;
		return target.getAttribute(key);
	},
	
	
	/**
	 * 获取list中所有对象的value值
	 * @method getValue
	 * @param {Object} key value键名
	 * @return {Array}
	 */
	getValue: function(key){
		var me = this,
			main = me.main,
			key = key || me.key,
			children = main.childNodes;
		var value = [];
		for(var i = 0,l = children.length; i < l ; i++){
			value[value.length] = children[i].getAttribute(key);
		}
		return value;
	},
	
	/**
	 * 删除行触发的事件
	 * @event ondelete
	 * @param {HTMLElement} target 单行DOM元素
	 * @return {Boolean} 如果返回false表示该项不能被删除
	 */
	ondelete: new Function(),
	
	/**
	 * 绑定事件
	 */
	bindEvent: function(){
		var me = this;
		me.main.onmouseover = me.mouseoverhandler();
		me.main.onmouseout = me.mouseouthandler();
		me.main.onclick = me.clickhandler();
	},
	
	/**
	 * 鼠标经过切换样式
	 */
	mouseoverhandler: function(){
		var me = this;
		return function(){
			var event = window.event || arguments[0], target = event.srcElement || event.target;
			
			while (target && target.id != me.main.id) {
				if (target.getAttribute("autostate") == 'true') {
                    baidu.addClass(target, me.getClass('line_over'));
					break;
				}
				else {
					target = target.parentNode;
				}
			}
		};
	},
	
	/**
	 * 鼠标离开移除切换样式
	 */
	mouseouthandler: function(){
		var me = this;
		return function(){
			var event = window.event || arguments[0], target = event.srcElement || event.target;
			
			while (target && target.id != me.main.id) {
				if (target.getAttribute("autostate")  == 'true') {
                    if (baidu.dom.hasClass(target, me.getClass('line_over'))) {
                        baidu.removeClass(target, me.getClass('line_over'));
					}
					break;
				}
				else {
					target = target.parentNode;
				}
			}
		}
	},
	
	/**
	 * 删除一行内容
	 */
	clickhandler: function(){
		var me = this;
		return function(){
			var event = window.event || arguments[0], target = event.srcElement || event.target;
			
			while (target && target.id != me.main.id) {
				if (target.getAttribute("isdel") == "true") {
					var parent = target.parentNode,
						logParams = {
							target: baidu.string.toCamelCase("del_" + me.id + "_item") + "_" + me.type + "_btn"
						};
					NIRVANA_LOG.send(logParams);
					if ((me.ondelete(parent)) !== false) {
						me.main.removeChild(parent);
					}
					break;
				}
				else {
					target = target.parentNode;
				}
			}
		}
	},
	
	/**
     * 释放List控件实例
     * @method dispose
     */
    dispose: function () {
		var main = this.main;
		main.onmouseover = null;
		main.onmouseout = null;
		main.onclick = null;
        ui.Base.dispose.call(this);
    }
}

ui.Base.derive(ui.List);
