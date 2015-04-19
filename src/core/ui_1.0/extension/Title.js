/*
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:    ui/Title.js
 * desc:    标题控件
 * depend：  	
 * author:  mayue@baidu.com
 * date:    2012/03/08
 * 
 * 使用说明：
 * 
 * eg：<span class='ui_title'>鼠标移到我的上面可以显示标题</span>
 * 指定class为'ui_Title'，页面中执行ui.Title.init()时自动寻找并初始化，也可以init中传入指定对象初始化
 */
 
 /**
  * 自定义的提示组件，用于替换浏览器内置的title提示
  * @class Title
  * @namespace ui
  * @static
  */
ui.Title={
	/**
     * 标识要添加Title的class名，只读的属性
     * @property triggerClass
     * @type String
     * @default 'ui_title'
     * @final
     */
	triggerClass : 'ui_title', 	//触发Info行为的className,
	_obj : null,	//提示div
	intervalShow : 500,		//显示时间
	timershow : 0,
	/**
	 * 初始化要添加Title提示的DOM元素
	 * 
	 * @method init
	 * @param {String|Array} specified 要添加title提示的DOM元素
	 *                                 如果未指定，则将查找所有添加triggerClass的DOM元素;
	 *                                 如果传递值为字符串，必须是DOM元素ID;
	 *                                 如果传递的值为数组，数组元素必须是DOM元素;
	 * <p>
	 * <b>NOTICE</b>: 要添加Title的DOM元素必须通过<b>rel</b>属性来绑定要提示的内容，而且不能再设置title属性，否则会出现两个提示<br/>    
	 *         通过rel属性值可以是HTML片段，这样可以自定义提示风格，比如提示内容分行显示     
	 * </p>                             
	 * @static
	 */
	init : function(specified){
		var triggers,
			_this = this;
		
		this._obj = baidu.dom.create('div', {className: 'ui_title_block'});//测试后换为ui_title_block
		this._obj.style.display = 'none';
		document.body.appendChild(this._obj);
		
		if (typeof specified == 'undefined'){
			triggers = baidu.dom.q(ui.Title.triggerClass);
		} else if (typeof specified == 'string' && baidu.g(specified)){
			triggers = [baidu.g(specified)];
		} else if (baidu.lang.isArray(specified)){	//支持数组传入对象
		 	triggers = specified;
		}else {
			return;
		}
		
		for (var i = 0, l = triggers.length; i < l; i++) {
            var node = triggers[i];
            //判断该节点是否被监听过
			if(baidu.getAttr(node,'title_listened') == undefined){
				//逻辑部分
				node.onmouseover = function(){
					var _that = this,
					    title = baidu.getAttr(this,'rel');
					if ((title == null)||(title == '')){
						return;
					}
					_this.timerShow = setTimeout(function(){
						_this.show(_that,title);
					}, _this.intervalShow);
				};
				node.onclick = function(){
					clearTimeout(_this.timerShow);
					_this.hide();
				};
				node.onmouseout = function(){
					clearTimeout(_this.timerShow);
					_this.hide();
				};
				baidu.setAttr(node,'title_listened','true');
			}
			
        }
	},
	/**
	 * 显示title
	 * @param {Object} d 含色块的span元素
	 * @param {Object} title 状态信息
	 * @author tongyao@baidu.com
	 */
	show: function(d, title){
		this._obj.innerHTML = title;
		this._obj.style.top = baidu.page.getMousePosition().y + 15 + 'px';
		this._obj.style.left = baidu.page.getMousePosition().x + 5 + 'px';
		baidu.show(this._obj);
	},
	
	/**
	 * 隐藏title
	 * @author tongyao@baidu.com
	 */
	hide: function(){
		baidu.hide(this._obj);
	}
}
