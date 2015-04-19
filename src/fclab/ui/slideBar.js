/**
 * ABTEST 流量分布 滑动选择控件
 * 使用方法：
 * new fclab.slideBar({
			container: "",	//控件容器
			value: "",		//滑动条默认位置，单位%，左侧占比,默认值50
			minvalue: "",	//滑动条左侧位置限制，单位%，默认10
			maxvalue: "",	//滑动条右侧位置限制，单位%，默认10
			callback: func	//滑动过程中的回调方法
		});
 * @author zhouyu01
 */
fclab.slideBar = function(params){
	this.container = params.container || null;//必传项
	if (this.container) {
		this.container = baidu.g(this.container);
		this.callback = params.callback || null;
		
		this.value = params.value || 50;//默认各50%,value值为左侧占比
		this.minvalue = params.minvalue || 10;//左侧不能小于10%
		this.maxvalue = params.maxvalue || 90;//右侧不能小于10%
		
		this.totalwidth = this.getTotalWidth(this.container);
		this.minwidth = this.getWidth(this.minvalue);
		this.maxwidth = this.getWidth(this.maxvalue);
		
		this.init();
	}
};

fclab.slideBar.prototype = {
	tpl : '<div class="slidebar_outter">'
		+ '	<div class="slidebar_inner">'
		+ '		<div class="slidebar_slider"></div>'
		+ '	</div>'
		+ '</div>',
		
	/**
	 * 初始化滑动条，并监听滑动事件
	 */
	init: function(){
		var me = this;
		me.container.innerHTML = me.tpl;
		me.slider = baidu.q("slidebar_slider", me.container, "div")[0];
		me.innerbar = baidu.q("slidebar_inner", me.container, "div")[0];
		me.outterbar = baidu.q("slidebar_outter", me.container, "div")[0];
		
		me.setValue(me.value);
		
		me.slider.onmousedown = me.start();
		me.outterbar.onmousemove = me.move();
		me.outterbar.onmouseup = me.mouseupEnd();
		me.outterbar.onmouseout = me.mouseoutEnd();
	},
	
	/**
	 * 滑动过程中设置右侧长度条的位置，并获取分布值
	 * @param {Object} width
	 */
	setInnerLeft: function(width){
		var me = this;
		if (width >= me.minwidth && width <= me.maxwidth) {
			me.innerbar.style.left = width + "px";
			if (typeof(value) == "undefined") {
				//滑动过程中计算left值
				var value = Math.round(width / me.totalwidth * 100);
			}
			me.value = value;
			me.callback && me.callback(value);
		}
	},
	
	/**
	 * 获取DOM完整宽度
	 * 不适合隐藏元素，如果控件容器的父元素处于隐藏状态，也无法获取宽度值
	 * 所以这里不对隐藏元素特殊处理，外部调用时自己进行处理
	 * @param {Object} elem
	 */
	getTotalWidth: function(elem){
		return elem.offsetWidth || 
					parseInt(baidu.dom.getStyle(elem, "width"));
	},
	
	/**
	 * 根据占比计算宽度
	 * @param {Object} value
	 */
	getWidth: function(value){
		return Math.round(this.totalwidth * value / 100);
	},
	
	/**
	 * 设置value
	 * @param {Object} value
	 */
	setValue: function(value){
		var me = this;
		var width = me.getWidth(value);
		me.setInnerLeft(width, value);
	},
	
	/**
	 * 获取value
	 */
	getValue: function(){
		return this.value;
	},

	/**
	 * 开始滑动
	 */
	start: function(){
		var me = this;
		return function(e){
			me.started = true;
			me.mouseStartPos = baidu.page.getMousePosition().x;
			me.referValue = me.getWidth(me.value);
			e && baidu.event.preventDefault(e);
		}
	},
	
	/**
	 * 滑动过程中
	 */
	move: function(){
		var me = this;
		return function(e){
			if (me.started) {
				var space = baidu.page.getMousePosition().x - me.mouseStartPos;
				var left = me.referValue + space;
				me.setInnerLeft(left);
				e && baidu.event.preventDefault(e);
			}
			
		}
	},
	
	
	/**
	 * 放开鼠标，滑动结束
	 */
	mouseupEnd: function(){
		var me = this;
		return function(e){
			me.started = false;
			e && baidu.event.preventDefault(e);
		}
	},
	
	/**
	 * 鼠标移出容器，滑动结束
	 */
	mouseoutEnd: function(){
		var me = this;
		return function(e){
			var e = e || window.event;
			var relatedTarget = e.relatedTarget || e.toElement;
			if (relatedTarget 
					&& !(baidu.dom.contains(me.outterbar, relatedTarget) 
								|| baidu.dom.hasClass(relatedTarget, "slidebar_outter"))) {
				me.started = false;
			}
			e && baidu.event.preventDefault(e);
		}
	}
}