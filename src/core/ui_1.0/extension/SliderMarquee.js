/**
 * fc-web
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/SliderMarquee.js
 * desc:    滑动跑马灯UI控件
 * author:  wangzhishou@baidu.com
 * date:    $Date: 2011/01/25 17:54:38 $
 */

/**
 * 滑动跑马灯UI控件，应用场景推广管理的工具栏的推广概况、关键词工具
 * @class SliderMarquee
 * @namespace ui
 * @extends ui.Base
 * @constructor
 * @param {Object} options 控件初始化参数定义
 * <pre>
 * 参数配置定义如下：
 * {
 *    id:              [String],  [REQUIRED] 控件的Id
 *    datasource:      [Array],   [REQUIRED] 显示的内容绑定的数据源，数据元素为字符串
 *    isshow:          [Boolean], [OPTIONAL] 是否立即显示该控件内容，默认false
 *    keywordSelected: [String],  [OPTIONAL] 要高亮的关键词
 * }
 * </pre>
 */
ui.SliderMarquee = function(options) {
	// 初始化事件
	this.initOptions(options);
	// 类型声明，用于生成控件子dom的id和class
	this.type = 'SliderMarquee';
	this.currentScenceNumber = 1;
};

ui.SliderMarquee.prototype = {
	/**
	 * 模板片段
	 */
	itemtpl : '<li><a href="#" title="{0}">{1}</a></li>',

	/**
	 * 单击关键词触发的事件
	 * @event onTextClick
	 * @param {String} keyword
	 */
	onTextClick : new Function(),

	/**
	 * 渲染控件
	 * @method render
	 * @param {HTMLElement} main 控件挂载的DOM元素，为了正确显示，main元素必须包含一堆元素，具体见kr.html
	 */
	render : function(main) {
		var me = this;
		if (!me.main) {
			ui.Base.render.call(me, main, true);
		}
		if (me.isshow) {
			var ul = me.main.getElementsByTagName("ul");
			var db = me.datasource;
			var html = [];
			for ( var i = 0, n = db.length; i < n; i++) {
				html.push(ui.format(me.itemtpl, db[i], db[i]));
			}
			ul[0].innerHTML = html.join('');
			this.init();
		} else {
			me.main.style.display = "none";
		}
	},

	/**
	 * 初始化
	 */
	init : function() {
		this.setDefaultHeightLight(this.keywordSelected);
		this.fixedWidth();
		this.setBtnStatus();
		this.bindLink();
	},

	/**
	 * 设置默认第一个高亮
	 * @var String keyword 要高亮的关键词
	 */
	setDefaultHeightLight : function(keyword) {
		var me = this;
		if (keyword) {
			/**
			var link = baidu.G(me.getId()).getElementsByTagName("a");
			var keyword = link[0].innerHTML;
			 */
			me.heightLight(keyword);
		}
	},

	/**
	 * 设置前进后退按钮状态
	 */
	setBtnStatus : function() {
		var me = this;
		var div = baidu.G(me.getId()).getElementsByTagName("div");
		var link = div[2].getElementsByTagName("a");
		if (this.currentScenceNumber == 1) {
			link[0].className = "prev";
			if (this.currentScenceNumber < this.scenceNumer) {
				link[1].className = "next-active";
			} else {
				link[1].className = "next";
			}
		} else if (this.currentScenceNumber > 1) {
			link[0].className = "prev-active";
			if (this.currentScenceNumber < this.scenceNumer) {
				link[1].className = "next-active";
			} else {
				link[1].className = "next";
			}
		} else if (this.scenceNumer == this.currentScenceNumber) {
			link[1].className = "next";
		}
	},

	/**
	 * 初始化宽度
	 */
	fixedWidth : function() {
		var me = this;
		var div = baidu.G(me.getId()).getElementsByTagName("div");
		var ul = baidu.G(me.getId()).getElementsByTagName("ul");
		var li = ul[0].getElementsByTagName("li");
		var w = 0;
		for ( var i = 0, n = li.length; i < n; i++) {
			w = w + parseInt(li[i].offsetWidth);
		}
		this.fullWidth = w;
		this.scenceWidth = div[1].offsetWidth;
		this.scenceNumer = Math.ceil(this.fullWidth / this.scenceWidth);
		this.fullWidth = this.scenceNumer * this.scenceWidth;
		ul[0].style.width = this.fullWidth + "px";
	},

	/**
	 * 元素X轴滚动到某个位置
	 */
	scrollBy : function(offset) {
		var me = this;
		var div = baidu.G(me.getId()).getElementsByTagName("div");
		div[1].scrollLeft = Math.round(offset);
	},

	/**
	 * 自动滚动到相应位置
	 */
	autoPosition : function() {
		var offset = this.scenceWidth * (this.currentScenceNumber - 1);
		this.scrollBy(offset);
		this.setBtnStatus();
	},

	/**
	 * 给a链接挂载事件
	 */
	bindLink : function() {
		var me = this;
		var link = baidu.G(me.getId()).getElementsByTagName("a");
		for ( var i = 0, n = link.length; i < n; i++) {
			var elm = link[i];
			if (elm.className.indexOf('prev') > -1
					|| elm.className.indexOf('next') > -1) {
				elm.onclick = me.onBtnClick();
			} else {
				elm.onclick = me.onTextSelect();
			}
		}
	},

	/**
	 * 文字选中事件处理控制器
	 */
	onTextSelect : function() {
		var me = this;
		return function(e) {
			e = e || window.event;
			baidu.event.preventDefault(e);
			var keyword = this.innerHTML;
			me.onTextClick && me.onTextClick.call(me, keyword);
		};
	},

	/**
	 * 按钮点击事件处理控制器
	 */
	onBtnClick : function() {
		var me = this;
		return function(e) {
			e = e || window.event;
			baidu.event.preventDefault(e);
			this.blur();
			if (this.className.indexOf('next') > -1) {
				me.currentScenceNumber = Math.min(me.currentScenceNumber + 1,
						me.scenceNumer);
						
			} else {
				me.currentScenceNumber = Math
						.max(me.currentScenceNumber - 1, 1);
			}
			me.autoPosition();
		};
	},

	/**
	 * 根据关键词, 高亮关键词
	 * @method heightLight
	 * @param {String} keyword 要高亮的关键词
	 */
	heightLight : function(keyword) {
		var me = this;
		var div = baidu.G(me.getId()).getElementsByTagName("div");
		var link = div[1].getElementsByTagName("a");
		for ( var i = 0, n = link.length; i < n; i++) {
			var txt = link[i].innerHTML;
			if (baidu.string.decodeHTML(keyword) == txt) {
				baidu.addClass(link[i], "heightlight");
			} else {
				baidu.removeClass(link[i], "heightlight");
			}
		}
	}
};
ui.Base.derive(ui.SliderMarquee);