/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/ToolBar.js
 * desc:    工具栏控件
 * author:  zhouyu
 * date:    2010/12/15
 */
/**
 * 工具栏控件
 * 
 * @class ToolBar
 * @namespace ui
 * @extends ui.Base
 * @constructor
 * @param {Object} options 控件初始化参数
 * <pre>
 * 配置参数定义如下：
 * {
 *    id:         [String], [REQUIRED] 控件ID
 *    datasource: [String], [REQUIRED] ToolBar要渲染的内容的HTML片段
 * }
 * </pre>
 */
 ui.ToolBar = function (options) {
    this.initOptions(options);
    this.type = 'toolbar';
	this.scrolltop = 0;
	this.scrollleft = 0;
	this.offsetX = 0;
	this.offsetY = 0;
	this.intervalTime = 500;
	this.scrollTop = 0;
	this.scrollLeft = 0;
	this.task = null;
	this.status = 'hide';
	//框架搭好后修改，导航栏的高度和宽度
	this.navWidth = 980;
	this.navHeight = 55;
};

ui.ToolBar.prototype = {
	tpltool: "<div id={0} class={1}></div>",
	/**
	 * 渲染控件
	 * 
	 * @method render
	 * @param {Object} main 控件挂载的元素
	 */
	render: function(main){
		var me = this;
		if (!me.isRendered) {
			ui.Base.render.call(me, main, false);
			//工具栏的背景与定位可直接设置在ui_toolbar类中，其内容在context中使用按钮控件构造好以后直接传到工具栏控件中
			//这里不在控件中写入工具栏中的各项内容是为了方便以后系统中有类似fixed定位的元素可以使用
			me.main.innerHTML = me.datasource;
			if (baidu.ie && baidu.ie < 7) {
				me.offsetX = me.main.offsetTop;
				me.offsetY = me.main.offsetLeft;
				me.task = setInterval(me.relocate, me.intervalTime);
			}
            me.bindEvent();
			me.isRendered = true;
		}else{
			me.repaint();
		}
	},
	
	repaint: function(){
		
	},
	
	/**
	 * 创建一个浮出层DOM，指定id和classname
	 * @method createFloat
	 * @param {Object} toolsNameText
	 * @param {Object} id
	 * @param {Object} classname
	 */
	createFloat: function(toolsName, id, classname){
		if (!baidu.g(id)) {
			var main = document.createElement('div'),
				navHeight = this.navHeight,
				toolsNameText = nirvana.config.LANG.TOOLS_NAME[toolsName],
				logname = baidu.string.toCamelCase("mini_" + id);
				
			this.floatMain = main;
			
			
			main.id = id;
			classname = classname || "tools";
			baidu.addClass(main, classname);
			main.innerHTML = ui.format(er.template.get('ToolbarFloat'),
										classname,
										id,
										toolsNameText,
										logname);
			baidu.g('Tools').appendChild(main);
			
			er.UIAdapter.init(main);
			
			baidu.on(baidu.g(id + '_minimize'), 'click', function(){
				ToolsModule.close();
				
				// 关闭搜索词工具时，如果添加过关键词或者否定关键词，reload父页面，四个列表页都刷新，因为计划层级有否定关键词
				if (id.indexOf('queryReport') != -1 && nirvana.queryReport.addSuccess) {
					er.controller.fireMain('reload', {});
					
					// 重置 nirvana.queryReport.addSuccess
					nirvana.queryReport.addSuccess = false;
				}
				
                // 全部优化建议和效果突降分析
                if (toolsName === 'proposal' || toolsName === 'decrease') {
					nirvana.aoControl.close(toolsName);
				}
				
				return false;
			});
			
			baidu.on(baidu.g(id + 'ResetBtn'), 'click', function(){
				ToolsModule.reset(toolsName);
				nirvana.trans.resetTool(id);
			});
			
			baidu.on(baidu.g(id + 'ResetBtn'), 'mouseover', function(){
				baidu.addClass(baidu.g(id+ 'ResetBtn'),'tools_reset_hover');
			});
			
			baidu.on(baidu.g(id + 'ResetBtn'), 'mouseout', function(){
				baidu.removeClass(baidu.g(id+ 'ResetBtn'),'tools_reset_hover');
			});
			
			baidu.on(baidu.g(id + '_minimize'), 'mouseover', function(){
				baidu.addClass(baidu.g(id+ '_minimize'),'tools_head_minimize_hover');
			});
			
			baidu.on(baidu.g(id + '_minimize'), 'mouseout', function(){
				baidu.removeClass(baidu.g(id+ '_minimize'),'tools_head_minimize_hover');
			});
			
			var resizeFunc = function(){
				var height = document.documentElement.clientHeight - 34 - navHeight,
				//window.screen.width是根据分辨率取的，不能直接跟clientWidth相比，会导致切换屏幕时工具箱宽度异常
				//	width = document.body.clientWidth < window.screen.width? window.screen.width - 14 : document.body.clientWidth  - 14,
					width = document.body.clientWidth  - 14,
					element = baidu.g(id + '_body');
				if(element.offsetHeight != height){
					element.style.height = height + 'px';
				}
				
				baidu.g(id).style.width = width + 'px';
				baidu.g(id).style.left = '7px';
			};
			
			resizeFunc();
			setInterval(resizeFunc, 500);
			
			return true;
		}
		return false;
	},
	
	
	/**
	 * 打开浮动层
	 * @method showFloat
	 */
	showFloat: function(){
		var me = this;
		me.status = 'show';
		
		me.setMain(true);
		
		me.setToolFloat(true);

		// 推广实况，隐藏左右btn
		if (me.floatMain.id.indexOf('adpreview') != -1) {
			baidu.setStyle('preview-right-btn', 'position', 'fixed');
			baidu.setStyle('preview-left-btn', 'position', 'fixed');
		};
		
		//隐藏工具栏
		me.hide();
	},
	/**
	 * 关闭浮动层
	 * @method hideFloat
	 */
	hideFloat : function(){
		var me = this;
		if(me.status == 'hide'){
			return;
		}
		me.status = 'hide';
		
		me.setMain(false);

		me.setToolFloat(false);
		
		// 推广实况，隐藏左右btn
		if (me.floatMain.id.indexOf('adpreview') != -1) {
			baidu.setStyle('preview-right-btn', 'position', 'absolute');
			baidu.setStyle('preview-left-btn', 'position', 'absolute');
		};
		
		//显示工具栏
		me.open();
		
	},
	
	
	setToolFloat: function(status){
		var me = this;
		if(!status){//关闭
			baidu.removeClass(me.floatMain,"tool_show");
		} else{//打开
			baidu.addClass(me.floatMain,"tool_show");
		}
	},
	
	/**
	 * 下层内容的隐藏与复现
	 */
	setMain: function(status){
		var me = this;
		if (status) {
			me.scrollTop = document.documentElement.scrollTop;
			me.scrollLeft = document.documentElement.scrollLeft;
			window.scrollTo(0, 0);
			//让scroll飞一会儿
			setTimeout(function(){
				document.documentElement.style.overflow = "hidden";
				if (baidu.browser.firefox) {
					baidu.g("Main").style.overflow = "hidden";
					baidu.g("Main").style.height = 0;
				}
				//baidu.g("Main").style.height = me.navHeight + "px";
				//baidu.g("Main").style.width = me.navWidth + "px";
			}, 100);
			
		} else {
			document.documentElement.style.overflow = "";
			if (baidu.browser.firefox) {
				baidu.g("Main").style.overflow = "";
				baidu.g("Main").style.height = "100%";
			}
			//baidu.g("Main").style.height = "100%";
			//baidu.g("Main").style.width = '';
			window.scrollTo(me.scrollLeft, me.scrollTop);
		}
	},
	
	/**
	 * 打开工具浮出层时隐藏工具栏
	 */
	hide: function(){
		var me = this;
		if (baidu.ie && baidu.ie < 7) {
			me.main.style.top = "-1000px";
			me.main.style.left = "-1000px";
		}else{
			me.setState("hide");
		}
	},
	
	/**
	 * 最小化工具浮出层时打开工具栏
	 */
	open: function(){
		var me = this;
		if (baidu.ie && baidu.ie < 7) {
			me.main.style.top = (me.scrolltop + me.offsetX) + "px";
			me.main.style.left = (me.scrollleft + me.offsetY) + "px";
		}else{
			me.removeState("hide");
		}
	},
	
	
	/**
	 * IE6下滚动条位置发生改变时重定位工具栏的位置
	 */
	relocate: function(){
		var me = this;
		if (me.scrolltop != document.documentElement.scrollTop ||
			me.scrollleft != document.documentElement.scrollLeft) {
				me.scrolltop = document.documentElement.scrollTop;
				me.scrollleft = document.documentElement.scrollLeft;
				me.main.style.top = (me.scrolltop + me.offsetX) + "px";
				me.main.style.left = (me.scrollleft + me.offsetY) + "px";
			}
	},
	/**
	 * 点击ToolBar触发的事件
	 * @event clickhandler
	 * @param {Object} event 事件对象
	 */
	clickhandler : new Function(),
	
	bindEvent: function(){
		this.main.onclick = this.clickhandler;
	},
	
	/**
     * 释放控件
     * @method dispose
     */
    dispose: function () {
        if(this.main){
            this.main.onclick = null;
        }
		this.task && clearInterval(this.task);
		if(this.floatMain){
			document.body.removeChild(this.floatMain);
		}
        ui.Base.dispose.call(this);
    }
}
ui.Base.derive(ui.ToolBar);
