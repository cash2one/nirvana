/*
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    ui/Popup.js
 * desc:    弹窗提醒组件
 * author:  LeoWang(wangkemiao@baidu.com)
 * date:    $Date: 2011/12/13 17:00:00 $
 * 参数说明（for options）：
 * 前面有*号的表示暂不支持

 * 1.	view：{String}or{Number}，弹窗初始化时的展现形式，默认为最大化
 * 			支持参数：同controller中单项信息，可以为字符串或者是数字
 * 2.	poptype : {String}, 弹出形式，默认为eachLogin
 * 			支持参数：
 * 				always		永远弹出，不会记忆展现形式
 * 				eachLogin	每次登陆时弹出，不会记忆展现形式
 * 				*eachLoginKeepStatus	每次登陆时弹出，记忆展现形式
 * 				*alwaysKeepStatus		永远弹出，记忆展现形式
 * 3.	canShow : {Function}，用于判断弹窗是否可以展现，外部传入的函数类型参数
 * 			注意：这里的函数可能需要异步获取数据，需要参数callback
 * 4.	title: {String} 标题内容
 * 5.	minititle: {String} 最小化时的标题内容
 * 5.	content : {String} 具体内容
 * 
 * 下面6个函数设计思路，因为弹窗可能需要在最小化、最大化等情况下对弹窗标题或者内容的某些元素进行事件绑定，所以以on开头的事件只要弹窗展现满足，必定执行
 * 而**Click则只在点击按钮时才会触发，自动最大化、关闭等情形不会触发
 * 
 * 6.	onclose : {Function} 关闭时触发
 * 7.	onmini : {Function} 最小化时触发
 * 8.	onmax : {Function} 最大化时触发
 * 9.	closeClick : {Function} 只在点击关闭按钮时触发
 * 10.	miniClick : {Function} 只在点击最小化按钮时触发
 * 11.	maxClick : {Function} 只在点击最大化按钮时触发
 * 
 * 
 * 12.	pos : {Object} 位置信息，{left, top, right, bottom} 优先left/top，如果有则用，否则使用right/bottom
 * 13.	posType : {String} 位置定位类型，{absolute|fixed} 绝对定位，fixed
 * 14.	posBase : {String | Object} 定位时相对的基元素，默认为body
 * 15.	width : {Number} 宽度 单位px
 * 16.	height : {Number} 高度 单位px
 * 
 * 使用说明：
 * 		已经通过绑定事件建立了一个Popup组件，id=‘_Popup_’;
 * 		已经存在了div id="PopupContainer"的dom对象用于显示Popup组件
 * 		初始化时该组件为隐藏
 * 		默认创建的组件id为_Popup_，可以直接通过ui.Popup.Object进行调用
 * 		
 * 		可以直接通过ui.Popup的公共函数进行使用
 * 
 * ui.Popup的公共函数：
 * 1.	ui.Popup.show 显示弹窗，参数可选 options 为之前提及的参数格式，即Popup的参数
 * 2.	ui.Popup.hide 隐藏弹窗
 * 3.	ui.Popup.setTitle 设置标题，参数 html{String}
 * 4.	ui.Popup.setMiniTitle 设置最小化时的标题，参数 html{String}
 * 5.	ui.Popup.setContent 设置内容，参数 html{String}
 * 6.	ui.Popup.setFoot 设置脚部内容，参数 html{String}
 * 7.	ui.Popup.setOnmini 设置最小化时自定义触发函数，无参数        注意，用户自定义函数是在最后执行的，并且根据当前展现状态可能会执行一次
 * 8.	ui.Popup.setOnmax 设置最大化时自定义触发函数，无参数          注意，用户自定义函数是在最后执行的，并且根据当前展现状态可能会执行一次
 * 9.	ui.Popup.setOnclose 设置关闭时自定义触发函数，无参数          注意，用户自定义函数是在最后执行的，并且根据当前展现状态可能会执行一次
 * 10.	ui.Popup.setPos 设置位置信息，参数可以是一个{Object}，也可以是两个值（为两个值时专指left/top）
 * 11.	ui.Popup.setPosType 设置定位类型，参数type{String} {absolute|fixed} 绝对定位，fixed
 * 12.	ui.Popup.setPosBase 设置定位时相对的基元素，参数{Object | String}
 * 13.	ui.Popup.setWidth 设置宽度，参数{Number}
 * 14.	ui.Popup.setHeight 设置高度，参数{Number}
 */

/**
 * 弹窗提醒组件，通过该组件的静态方法来创建Popup组件，该组件是单例的。<br/>
 * 可以直接通过ui.Popup.Object来访问创建的Popup实例。
 * 
 * @class Popup
 * @namespace ui
 * @extends ui.Base
 * @constructor
 * @param {Object} options 控件初始化参数
 * <pre>
 * 配置项定义如下：
 * {
 *    id:        [String],             [REQUIRED] 控件ID
 *    view:      [String],             [OPTIONAL] 弹窗初始化时的展现形式，默认为最大化，有效值为
 *                                                'minimization'|'maximum'|'close'|'init'
 *    poptype:   [String],             [OPTIONAL] 弹出形式，默认为eachLogin
 *                                                支持参数: always 永远弹出，不会记忆展现形式;	
 *                                                       eachLogin 每次登陆时弹出，不会记忆展现形式
 *    canShow:   [Function],           [OPTIONAL] 用于判断弹窗是否可以展现，在弹窗显示前自动执行该函数，并为
 *                                                该函数提供一个回调函数(doShow)，可以在完成一些事情后，
 *                                                通过执行该回调函数来显示弹窗 
 *    title:     [String],             [OPTIONAL] 弹窗标题内容, HTML片段
 *    minititle: [String],             [OPTIONAL] 弹窗最小化时的标题内容, HTML片段
 *    pos:       [Object],             [OPTIONAL] 弹窗位置信息，{left:xx, top:xx, right:xx, bottom:xx} 
 *                                                优先left/top，如果有则用，否则使用right/bottom
 *    posType:   ['absolute'|'fixed'], [OPTIONAL] 弹窗位置定位类型，默认fixed
 *    posBase:   [HTMLElement|String], [OPTIONAL] 弹窗定位时相对的基元素，默认为body，要求必须是DOM元素或者元素ID
 *    width:     [Number],             [OPTIONAL] 弹窗宽度，单位px，默认300
 *    height:    [Number],             [OPTIONAL] 弹窗高度，单位px
 * }
 * 
 * </pre>
 */
ui.Popup = function (options) {
    this._initOptions(options);
    this.id = this._id;
    this._type = this.type = "popup";
    this._view = this._view || this.getView() || 'maximum';
    this._poptype = this._poptype || 'eachLogin';
    this._title = this._title || '';
    this._content = this._content || '';
    this._width = this._width || 300;
    this._posType = this._posType || 'fixed';
    this._foot = this._foot || '';
    this._titleHeight = this._titleHeight || '20';
};

ui.Popup.prototype = {
	
	/**
	 * 支持的控制功能列表
	 */
	_supportCtrls : {
		0 : 'all',
		1 : 'minimization',
		2 : 'maximum',
		3 : 'close'
		//4 : 'open'
	},
	
	/**
	 * 支持的展现形式
	 */
	_supportViews : {
		1 : 'minimization',
		2 : 'maximum',
		3 : 'close',
		4 : 'init'  //表示系统自动生成时的展现状态，应该默认为关闭状态的
	},
	
	_isHide : false,
	
	/**
	 * 获取某个成员变量的值
	 */
	get : function(attr){
		return this['_' + attr];
	},
	
	/**
	 * 设置某个成员变量的值
	 */
	set : function(attr, value){
		this['_' + attr] = value;
	},
	
	/**
     * 初始化参数
     * 
     * @protected
     * @param {Object} options 参数集合
     */
    _initOptions: function (options) {
        for (var k in options) {
        	//这里只对变量做前加_的控制
        	if('function' == typeof options[k]){
        		this[k] = options[k];
        	}
        	else{
            	//this[k] = options[k];
            	this['_' + k] = options[k];
        	}
        }
    },
	
	/**
	 * 判断是否可以展现，即是否展现弹窗
	 * 判断方法：首先根据poptype进行分支处理，如果用户传入自定义判断函数，执行它
	 */
	_canShow : function(callback, failcallback){
		var me = this,
			pass = false;
		/*
		//没有内容的话 就没有必要显示了
		if(!me.get('title') && !me.get('content') && !me.get('foot')){
			return false;
		}
		*/
		
		/**
		 * 根据弹出类型分支处理
		 */
		switch(me._poptype){
			/**
			 * 每次登陆都要弹出，本次登陆期间需要保存状态。
			 */
			case 'eachLogin':
				var tokenData = FlashStorager.get(nirvana.env.OPT_ID + me.main.id + '__tokenData' + '__cas__rn__');
				//判断当前是否是本次登陆第一次调用控件
				pass = (tokenData != LoginTime.getTokenData('Popup'));
				if(pass){
					//说明是第一次调用，需要重置token数据，清除view数据
					FlashStorager.set(nirvana.env.OPT_ID + me.main.id + '__tokenData' + '__cas__rn__', LoginTime.getTokenData('Popup'));
					FlashStorager.set(nirvana.env.OPT_ID + me.main.id + '__viewType' + '__cas__rn__');
					me.setView('maximum');
					if(!me.canShow){
						return true;
					}
					else{
						me.canShow(callback);
					}
				}
				else{
					//本次登陆不是第一次调用控件的话，根据记忆的状态去处理
					var viewType = FlashStorager.get(nirvana.env.OPT_ID + me.main.id + '__viewType' + '__cas__rn__');
					if('undefined' != typeof viewType && viewType != null){
						if(viewType == 'close'){
							failcallback && failcallback();
							return false;
						}
						else{
							if(!me.canShow){
								return true;
							}
							else{
								//callback();
								//请求执行吧
								me.canShow(callback);
							}
						}
					}
				}
				
				break;
			
			// case 'eachLoginKeepStatus':
			// case 'alwaysKeepStatus':
			/**
			 * 永远展现，默认展现处理
			 * 执行用户自定义判断函数 if exists，
			 * or return true
			 */
			case 'always':
			default:
				if(!me.canShow){
					return true;
				}
				else{
					me.canShow(callback);
				}
				return true;
		}
	},
	
	
	/**
	 * 初始化弹窗控件
	 */
	init : function(){
		var me = this,
			div = baidu.g(ui.Popup.mainDiv);
		if(!div){
			var html = [];
            html[html.length] = '<div id="PopupContainer" class="ui_popup_container" >';
            html[html.length] = '</div>';
            
            div = document.createElement('div');
			div.id = 'PopupContainer';
			div.className = 'ui_popup_container';
			
			//添加到body中
            //document.body.appendChild(div);
            
            //在这里，为了在ie下能够实现被工具栏挡住的效果，需要调整位置
            baidu.dom.insertBefore(div, baidu.dom.g("Toolbar"));
            
            //如果是系统自动生成的控件或者控件状态为close，均隐藏
            if(me.get('view') == 'init' || me.get('view') == 'close'){
            	baidu.hide(div);
            }
            ui.Popup.mainDiv = div;
		}
    	me.main = ui.Popup.mainDiv;
    	if(me.isRendered){
    		me.repaint();
    	}
    	else{
    		me.render(ui.Popup.mainDiv);
    		/*
    		// 15s后自动收起
    		setTimeout(function(){
    			me.mini();
    		}, 15000);
    		*/
    	}
	},
	
	
	/**
	 * 附加渲染到某个dom元素中
	 * @param {HTMLElement} container 渲染的控件添加到的目标DOM元素
	 */
	appendTo: function (container) {
        var main = document.createElement('div');
        container.appendChild(main);
        this.render(main);
    },  
    
    /**
     * 渲染控件
     * @protected
     * @param {Object} main 控件挂载的DOM
     */ 
    render: function (main) {
        var me = this;
        if(!me.isRendered) {
            main.setAttribute('control', me.id);
            ui.Base.render.call(me, me.main);
            me.main.innerHTML = me.getMainHtml();
            me.isRendered = true;
        }
    },
    
    /**
	 * 重绘控件
	 * @param {Object} data
	 */
	repaint : function(data){
		var me = this;
        me.main && (me.main.innerHTML = me.getMainHtml());
	},
	
	/**
	 * 获取主HTML代码
	 */
	getMainHtml: function () {
        var me = this;
            
        return me.getHeadHtml()
        		+ me.getBodyHtml()
        		+ me.getFootHtml();
    },
    
    /**
     * 获取头部的html
     */
    tplHead: '<div id="{0}" class="{1}"><div id="{2}" class="{3}" onmouseover="{6}" onmouseout="{7}">{4}</div>{5}</div>',
    getHeadHtml : function(){
    	var me = this,
            head = 'head',
            title = 'title',
            close = 'close';
            
        return ui.format(me.tplHead,
	                        me.getId(head),
	                        me.getClass(head),
	                        me.getId(title),
	                        me.getClass(title),
	                        this.getView() == 'minimization' ? me.get('minititle') : me.get('title'),
	                        me.getControllerHtml(),
							me.getStrCall('headOver'),
							me.getStrCall('headOut'));
    },
    
    /**
     * 获取控制按钮的html
     */
    tplController : '<div class="{0}" id="{1}">{2}</div>',
    tplClose: '<div class="{0}" id="{1}" onclick="{2}" onmouseover="{3}" onmouseout="{4}">&nbsp;</div>',
    tplMini: '<div class="{0}" id="{1}" onclick="{2}" onmouseover="{3}" onmouseout="{4}">&nbsp;</div>',
    tplMax: '<div class="{0}" id="{1}" onclick="{2}" onmouseover="{3}" onmouseout="{4}">&nbsp;</div>',
    getControllerHtml : function(){
    	var me = this,
    		buttonHtml = [];
    	switch(me.get('view')){
    		case 'minimization':
    			buttonHtml.push(me.getMaxHtml());
    			buttonHtml.push(me.getCloseHtml());
    			break;
			case 'maximum':
    			buttonHtml.push(me.getMiniHtml());
    			buttonHtml.push(me.getCloseHtml());
    			break;
    	}
    	return ui.format(me.tplController,
    					 me.getClass('controller'),
    					 me.getId('controller'),
    					 buttonHtml.join(''));
    	
    	
    },
    getCloseHtml : function(){
    	var me = this;
    	return ui.format(me.tplClose,
                     me.getClass('close'),
                     me.getId('close'),
                     me.getStrCall('closeClickHandler', 'x'),  // 增加param，用于监控时区别于其他关闭按钮
                     me.getStrCall('closeOver'),
                     me.getStrCall('closeOut'));
    },
    getMiniHtml : function(){
    	var me = this;
    	return ui.format(me.tplMini,
                     me.getClass('mini'),
                     me.getId('mini'),
                     me.getStrCall('miniClickHandler'),  
                     me.getStrCall('miniOver'),
                     me.getStrCall('miniOut'));
    },
    getMaxHtml : function(){
    	var me = this;
    	return ui.format(me.tplMax,
                     me.getClass('max'),
                     me.getId('max'),
                     me.getStrCall('maxClickHandler'), 
                     me.getStrCall('maxOver'),
                     me.getStrCall('maxOut'));
    },
    
    /**
     * 获取主体的html
     */
    tplBody: '<div id="{0}" class="{1}"><div id="{2}" class="{3}"{5}>{4}</div></div>',
    getBodyHtml : function(){
    	var me = this;
            
        return ui.format(me.tplBody,
	                        me.getId('body'),
	                        me.getClass('body'),
	                        me.getId('content'),
	                        me.getClass('content'),
	                        me.get('content') || '',
	                        me.get('view') == 'minimization' ? ' style="display:none;"' : '');
    },
    
    /**
     * 获取脚部的html
     */
    tplFoot: '<div id="{0}" class="{1}"{3}>{2}</div>',
    getFootHtml : function(){
    	var me = this;
            
        return ui.format(me.tplFoot,
	                        me.getId('foot'),
	                        me.getClass('foot'),
	                        me.get('foot') || '',
	                        me.get('view') == 'minimization' ? ' style="display:none;"' : '');
    },
    
	/**
	 * 获取弹窗头部dom元素
     * @method getHead
     * @public
     * @return {HTMLElement}
	 */
	getHead: function () {
        return baidu.g(this.getId('head'));
    },
    
    /**
     * 获取弹窗主体的dom元素
     * @method getBody
     * @public
     * @return {HTMLElement}
     */
    getBody: function () {
        return baidu.g(this.getId('body'));
    },

    /**
     * 获取弹窗脚部的dom元素
     * @method getFoot
     * @public
     * @return {HTMLElement}
     */
    getFoot: function () {
        return baidu.g(this.getId('foot'));
    },
    
    /**
     * 获取close按钮元素
     * 
     * @private
     * @return {HTMLElement}
     */
    getClose: function () {
        return baidu.g(this.getId('close'));
    },
    /**
     * 获取最小化按钮元素
     * 
     * @private
     * @return {HTMLElement}
     */
    getMini: function () {
        return baidu.g(this.getId('mini'));
    },
    /**
     * 获取最大化按钮元素
     * 
     * @private
     * @return {HTMLElement}
     */
    getMax: function () {
        return baidu.g(this.getId('max'));
    },
    
	/**
	 * 获取展现类型
	 */
	getView : function(){
		var me = this;
		switch(me.get('poptype')){
			case 'eachLogin':
				if(me.main){
					var viewType = FlashStorager.get(nirvana.env.OPT_ID + me.main.id + '__viewType' + '__cas__rn__');
					if('undefined' != typeof viewType && null != viewType){
						return viewType;
					}
				}
				
				return me.get('view');
			// case 'eachLoginKeepStatus':
			// case 'alwaysKeepStatus':
			case 'always':
			default:
				return me.get('view');
		}
	},
	/**
	 * 设置展现类型
	 */
	setView : function(value){
		var me = this;
		if(baidu.array.indexOf(me._supportViews, value) >= 0){
			return false;
		}
		switch(me.get('poptype')){
			case 'eachLogin':
				this.set('view', value);
				me.main && FlashStorager.set(nirvana.env.OPT_ID + me.main.id + '__viewType' + '__cas__rn__', value);
				break;
			// case 'eachLoginKeepStatus':
			// case 'alwaysKeepStatus':
			case 'always':
			default:
				this.set('view', value);
				break;
		}
	},
	
	/**
	 * 显示弹窗
	 */
	show : function(){
		var me = this;
		if(me.canShow){
			me._canShow(function(){
				me.doShow();
			});
		}
		else{
			if(me._canShow()){
				me.doShow();
			}
			else{
				me.hide();
			}
		}
		//重设大小
		me.reSize();
		//重新定位
		me.rePosition();
	},
	
	/**
	 * 实际的显示函数
	 */
	doShow : function(){
		var me = this;
		//baidu.show(ui.Popup.mainDiv);
		
		
		if(!me.isRendered){
			me.render(ui.Popup.mainDiv);
		}
		else{
			me.repaint();
		}
		me.setView(me.get('view'));
		
		//baidu.show(ui.Popup.mainDiv);
		//baidu.hide(me.getHead());
		//baidu.hide(me.getBody());
		//baidu.hide(me.getFoot());
		//baidu.fx.expand(me.getHead());
		
		switch(me.get('view')){
			case 'minimization':
				me.mini(true);
				break;
			case 'maximum':
				me.max(true);
				break;
			case 'close':
				me.close();
				break;
		}
		me.rePosition();
		baidu.fx.expand(ui.Popup.mainDiv, {
			duration : 900,
			interval : 5,
			onafterfinish : function(){
			    baidu.dom.setStyle('PopupContainer', 'bottom', location.href.indexOf('#/manage') > -1 ? 34 : 0);
			}
		});
		me.set('isHide', false);
	},
	
	/**
	 * 隐藏弹窗
	 */
	hide : function(){
		baidu.hide(ui.Popup.mainDiv);
        this.set('isHide', true);
	},
	
	/**
	 * 设置标题
	 */
	setTitle : function(html){
		this.set('title', html);
		if(this.getView() == 'maximum' && baidu.g(this.getId('title'))){
			baidu.g(this.getId('title')).innerHTML = html;
		}
	},
	/**
	 * 设置最小化时的标题
	 */
	setMiniTitle : function(html){
		this.set('minititle', html);
		if(this.getView() == 'minimization' && baidu.g(this.getId('title'))){
			baidu.g(this.getId('title')).innerHTML = html;
		}
	},
	
	/**
	 * 设置内容
	 */
	setContent : function(html){
		this.set('content', html);
		baidu.g(this.getId('content')).innerHTML = html;
	},
	
	/**
	 * 设置脚部
	 */
	setFoot : function(html){
		this.set('foot', html);
		baidu.g(this.getId('foot')).innerHTML = html;
	},
	
	/**
     * 鼠标移上头部的handler
     * 
     * @private
     */
    headOver: function () {
        baidu.addClass(this.getHead(), 
                       this.getClass('head_hover'));
    },
    
    /**
     * 鼠标移出头部的handler
     * 
     * @private
     */
    headOut: function () {
        baidu.removeClass(this.getHead(), 
                          this.getClass('head_hover'));
    },
	
    /**
     * 鼠标移上close按钮的handler
     * 
     * @private
     */
    closeOver: function () {
        baidu.addClass(this.getClose(), 
                       this.getClass('close_hover'));
    },
    
    /**
     * 鼠标移出close按钮的handler
     * 
     * @private
     */
    closeOut: function () {
        baidu.removeClass(this.getClose(), 
                          this.getClass('close_hover'));
    },
    
    /**
     * 鼠标移上最小化按钮的handler
     * 
     * @private
     */
    miniOver: function () {
	        baidu.addClass(this.getMini(), 
	                       this.getClass('mini_hover'));
    },
    
    /**
     * 鼠标移出最小化按钮的handler
     * 
     * @private
     */
    miniOut: function () {
    	if(this.getMini()){
	        baidu.removeClass(this.getMini(), 
	                          this.getClass('mini_hover'));
       }
    },
    
    /**
     * 鼠标移上最大化按钮的handler
     * 
     * @private
     */
    maxOver: function () {
        baidu.addClass(this.getMax(), 
                       this.getClass('max_hover'));
    },
    
    /**
     * 鼠标移出最大化按钮的handler
     * 
     * @private
     */
    maxOut: function () {
    	if(this.getMax()){
	        baidu.removeClass(this.getMax(), 
	                          this.getClass('max_hover'));
    	}
    },
    
    
	/**
     * 关闭handler
     */
	close : function(param){
		var me = this;
		me.setView('close');
		me.hide();
		/**
		 * 关闭弹窗触发的事件，该事件触发不一定通过用户点击关闭才触发，触发该事件时，弹窗已经被隐藏（注意没有被销毁）
         * @event onclose
         * @param {Object} param 监控的数据对象，用于监控时区别于其他关闭按钮
		 */
		me.onclose && me.onclose(param);
	},
	
	closeClickHandler : function(param){
		var me = this;
		me.close(param);
		/**
		 * 通过点击弹窗右上角的'x'关闭对话框触发的事件，触发该事件时，弹窗已经被隐藏（注意没有被销毁）
         * @event closeClick
         * @param {Object} param 监控的数据对象，用于监控时区别于其他关闭按钮
		 */
		me.closeClick && me.closeClick(param);
	},
    
    /**
     * 最小化handler
     * @param isNoFx {Boolean} 是否不要动画
     */
	mini : function(isNoFx){
		var me = this;
		isNoFx = isNoFx || false;
		if(isNoFx){
			baidu.hide(me.getBody());
			baidu.hide(me.getFoot());
		}
		else{
			baidu.fx.collapse(me.getBody());
			baidu.fx.collapse(me.getFoot(), {
				onafterfinish : function(){
					me.setView('minimization');
					me.repaint(ui.Popup.mainDiv);
				}
			});
		}
		/**
		 * 通过点击弹窗的最小化触发的事件 
         * @event onmini
		 */
		me.onmini && me.onmini();
	},
	
	miniClickHandler : function(param){
		var me = this;
		me.mini(param);
		/**
		 * 弹窗的最小化时，触发的事件 
         * @event miniClick
		 */
		me.miniClick && me.miniClick(param);
	},
	
	/**
     * 最大化handler
     * @param isNoFx {Boolean} 是否不要动画
     */
	max : function(isNoFx){
		var me = this;
		isNoFx = isNoFx || false;
		me.setView('maximum');
		me.repaint(ui.Popup.mainDiv);
		if(isNoFx){
			baidu.show(me.getBody());
			baidu.show(me.getFoot());
		}
		else{
			baidu.fx.expand(me.getBody());
			baidu.fx.expand(me.getFoot());
		}
		/**
		 * 弹窗的最大化时，触发的事件 
         * @event onmax
		 */
		me.onmax && me.onmax();
	},
	
	maxClickHandler : function(param){
		var me = this;
		me.max(param);
		/**
		 * 弹窗的最大化时，触发的事件 
         * @event maxClick
		 */
		me.maxClick && me.maxClick(param);
	},
	
	
	/**
	 * 设置位置信息，参数可以是一个{Object}，也可以是两个值（为两个值时专指left/top）
	 * @param arg0 参数一，可以是{Object}，也可以是{Number}参数left值
	 * @param arg1 参数二，top值
	 */
	setPos : function(arg0, arg1){ 
		var me = this;
		if('object' == typeof arg0){
			me.set('pos', arg0);
			
		}
		else{
			var pos = me.get('pos');
			if(!pos){
				pos = {};
			}
			pos.left = arg0;
			pos.top = arg1;
			me.set('pos', pos);
		}
		if(me.get('view') != 'init' && me.get('view') != 'close'){
        	me.rePosition();
        }
	},
	/**
	 * 设置定位类型
	 * @param type {String}
	 */
	setPosType : function(type){
		var me = this;
		me.set('posType', type);
		if(me.get('view') != 'init' && me.get('view') != 'close'){
        	me.rePosition();
        }
	},
	/**
	 * 设置定位时相对的基元素
	 * @param target {Object | String}
	 */
	setPosBase : function(target){
		var me = this;
		if('string' == typeof target){
			target = baidu.g(target);
		}
		me.set('posBase', target);
		if(me.get('view') != 'init' && me.get('view') != 'close'){
        	me.rePosition();
        }
	},
	/**
	 * 获取定位时相对的基元素
	 */
	getPosBase : function(){
		var me = this,
			posBase = me.get('posBase');
		if(!posBase){
			return null;
		}
		if('string' == typeof posBase){
			posBase = baidu.g(posBase);
		}
		return posBase;
	},
	/**
	 * 设置宽度
	 * @param value {Number}
	 */
	setWidth : function(value){
		var me = this;
		value = value || 0;
		me.set('width', value);
		if(me.get('view') != 'init' && me.get('view') != 'close'){
        	me.reSize();
        }
	},
	/**
	 * 设置高度
	 * @param value {Number}
	 */
	setHeight : function(value){
		var me = this;
		value = value || 0;
		me.set('height', value);
		if(me.get('view') != 'init' && me.get('view') != 'close'){
        	me.reSize();
        }
	},
	
	/**
	 * 获取dom元素宽度
	 */
	getDomWidth : function(target){
		var me = this;
		if('string' == typeof target){
			target = baidu.g(target);
		}
		if(!target){
			return 0;
		}
		if(target.clip!=null){
			return target.clip.right-target.clip.left;
		}
		else if(target.scrollWidth!=null){
			return target.scrollWidth;
		}
		else if(target.offsetWidth!=null){
			return target.offsetWidth;
		}
		else if(target.style.pixelWidth!=null){
			return target.style.pixelWidth;
		}
		return 0;
	},
	
	/**
	 * 获取dom元素高度
	 */
	getDomHeight : function(target){
		var me = this;
		if('string' == typeof target){
			target = baidu.g(target);
		}
		if(!target){
			return 0;
		}
		if(target.clip!=null){
			return target.clip.bottom-target.clip.top;
		}
		else if(target.scrollWidth!=null){
			return target.scrollHeight;
		}
		else if(target.offsetWidth!=null){
			return target.offsetHeight;
		}
		else if(target.style.pixelWidth!=null){
			return target.style.pixelHeight;
		}
		return 0;
	},
	
	/**
	 * removeStyle
	 */
	removeStyle : function (){
	    var ele = document.createElement("DIV"),
	        fn,
	        _g = baidu.dom._g;
	    
	    if (ele.style.removeProperty) {// W3C, (gecko, opera, webkit)
	        fn = function (el, st){
	            el = _g(el);
	            el.style.removeProperty(st);
	            return el;
	        };
	    } else if (ele.style.removeAttribute) { // IE
	        fn = function (el, st){
	            el = _g(el);
	            el.style.removeAttribute(baidu.string.toCamelCase(st));
	            return el;
	        };
	    }
	    ele = null;
	    return fn;
	}(),
	
	/**
	 * 重设大小
	 */
	reSize : function(){
		var me = this,
			main = me.main;
		if(!main){
			me.init();
		}
		var width = me.get('width'),
			height = me.get('height'),
			style = {};
		if(width){
			style.width = width + 'px';
		}
		else{
			 me.removeStyle(main, "width");
		}
		if(height){
			style.height = height + 'px';
		}
		else{
			 me.removeStyle(main, "height");
		}
		baidu.dom.setStyles(main, style);
	},
	/**
	 * 重新定位弹窗
	 */
	rePosition : function(){
		var me = this,
			main = me.main;
		if(!main){
			me.init();
		}
		var pos = me.get('pos'),
			posType = me.get('posType'),
			posBase = me.getPosBase(),
			style = {},
			basePos, lv = 0, tv = 0, rv = 0, bv = 0;  //用于根据基准dom位置调整的值
		if(!pos){
			return;
		}
		else{
			if(posType == 'fixed'){
				style.position = 'fixed';
				//style._position = 'absolute';
			}
			else if(posType == 'absolute'){
				style.position = 'absolute';
			}
			
			//如果有基准dom，需要根据其位置进行调整
			if(posBase){
				basePos = baidu.dom.getPosition(posBase);
				lv = basePos.left || 0;
				tv = basePos.top || 0;
				rv = baidu.page.getWidth() - (basePos.left + me.getDomWidth(basePos));
				bv = baidu.page.getHeight() - (basePos.top + me.getDomHeight(basePos));
			}
			
			//优先left，top，无值时采用right，bottom
			if('undefined' != typeof pos.left){
				me.removeStyle(me.main, "right");
				style.left = (pos.left + lv) + 'px';
			}
			else if('undefined' != typeof pos.right){
				me.removeStyle(me.main, "left");
				style.right = (pos.right + rv) + 'px';
			}
			if('undefined' != typeof pos.top){
				me.removeStyle(me.main, "bottom");
				style.top = (pos.top + tv) + 'px';
			}
			else if('undefined' != typeof pos.bottom){
				me.removeStyle(me.main, "top");
				style.bottom = (pos.bottom + bv) + 'px';
			}
			
			baidu.dom.setStyles(me.main, style);
		}
	}
};

ui.Base.derive(ui.Popup);
/**
 * 初始化弹窗
 * <b>NOTICE</b>: 该方法会在页面onload的时候自动执行
 * @method initUI
 * @protected
 * @static
 */
ui.Popup.initUI = function(){
	if(!ui.Popup.Object){
		ui.Popup.Object = ui.util.create('Popup', {
			id : '_Popup_',
			view : 'init'  //第一次自动生成，应该为init展现状态
		});
		ui.Popup.Object.init();
	}
};
/**
 * 显示弹窗
 * @method show
 * @param {Object} options 可选，同Popup控件初始化参数
 * @static
 */
ui.Popup.show = function(options){
	if(!ui.Popup.Object){
		return;
	}
	if('undefined' != typeof options){
		//清除了之前的Object，重新生成一个Object，并保存了之前的控件的展现状态
		//dispose是为了如果可能需要的话，完全清除了之前的控件对象的痕迹
		var view = 'init' == ui.Popup.Object.getView() ? null : ui.Popup.Object.getView();
		ui.Popup.Object.dispose();
		//baidu.dom.remove(baidu.g(ui.Popup.mainDiv));
		
		//新的控件对象的参数设置
		options['id'] = '_Popup_';
		//还原控件的展现状态
		
		options['view'] = options['view'] || view;
		ui.Popup.Object = ui.util.create('Popup', options);
		ui.Popup.Object.init();
	}
	ui.Popup.Object.show();
};
/**
 * 隐藏弹窗
 * @method hide
 * @static
 */
ui.Popup.hide = function(){
	if(!ui.Popup.Object){
		return;
	}
	ui.Popup.Object.hide();
};
/**
 * 销毁并重置置弹窗默认对象
 * @method rebuild
 * @static
 */
ui.Popup.rebuild = function(){
    ui.Popup.Object.setView('init');
    //默认为隐藏状态
    baidu.hide(ui.Popup.mainDiv);
    ui.Popup.Object.dispose();
	//baidu.dom.remove(baidu.g(ui.Popup.mainDiv));
    ui.Popup.Object = ui.util.create('Popup', {
        id : '_Popup_',
        view : 'init'  //第一次自动生成，应该为init展现状态
    });
    ui.Popup.Object.init();
};
/**
 * 获取弹窗的展现形式
 * @method getView
 * @return {String} 弹窗的展现形式，有效值为'minimization', 'maximum', 'close', 'init'
 * @static
 */
ui.Popup.getView = function(){
    if(!ui.Popup.Object){
        return;
    }
    return ui.Popup.Object.get('view');
};
/**
 * 弹窗是否隐藏
 * @method isHide
 * @return {Boolean}  
 * @static
 */
ui.Popup.isHide = function(){
    if(!ui.Popup.Object){
        return;
    }
    ui.Popup.Object.get('isHide');
};

/**
 * 设置弹窗标题
 * @method setTitle
 * @param {String} html 要显示的标题的HTML片段
 * @static 
 */
ui.Popup.setTitle = function(html){
	if(!ui.Popup.Object){
		return;
	}
	ui.Popup.Object.setTitle(html);
};
/**
 * 设置弹窗最小化时标题
 * @method setMiniTitle
 * @param {String} html 要显示的最小化标题的HTML片段
 * @static
 */
ui.Popup.setMiniTitle = function(html){
	if(!ui.Popup.Object){
		return;
	}
	ui.Popup.Object.setMiniTitle(html);
};

/**
 * 设置弹窗内容
 * @method setContent
 * @param {String} html 要显示的内容的HTML片段
 * @static 
 */
ui.Popup.setContent = function(html){
	if(!ui.Popup.Object){
		return;
	}
	ui.Popup.Object.setContent(html);
};

/**
 * 设置脚部内容
 * @method setFoot
 * @param {String} html 要显示的脚部的HTML片段
 * @static
 */
ui.Popup.setFoot = function(html){
	if(!ui.Popup.Object){
		return;
	}
	ui.Popup.Object.setFoot(html);
};
/**
 * 设置弹窗最小化时触发的事件回调函数，如果当前弹窗已经最小化，则立即执行该回调函数<br/>
 * 注意，用户自定义函数是在最后执行的
 * @method setOnmini
 * @param {Function} func 要执行的回调函数
 * @static
 */
ui.Popup.setOnmini = function(func){
	if(!ui.Popup.Object){
		return;
	}
	ui.Popup.Object.onmini = func;
	if(ui.Popup.Object.getView() == 'minimization'){
		ui.Popup.Object.onmini();
	}
};
/**
 * 设置弹窗最大化时触发的事件回调函数，如果当前弹窗已经最大化，则立即执行该回调函数<br/>
 * 注意，用户自定义函数是在最后执行的
 * @method setOnmax
 * @param {Function} func 要执行的回调函数
 * @static
 */
ui.Popup.setOnmax = function(func){
	if(!ui.Popup.Object){
		return;
	}
	ui.Popup.Object.onmax = func;
	if(ui.Popup.Object.getView() == 'maximum'){
		ui.Popup.Object.onmax();
	}
};
/**
 * 设置弹窗关闭时触发的事件回调函数，如果当前弹窗已经关闭，则立即执行该回调函数<br/>
 * 注意，用户自定义函数是在最后执行的
 * @method setOnclose
 * @param {Function} func 要执行的回调函数
 * @static
 */
ui.Popup.setOnclose = function(func){
	if(!ui.Popup.Object){
		return;
	}
	ui.Popup.Object.onclose = func;
	if(ui.Popup.Object.getView() == 'close'){
		ui.Popup.Object.onclose();
	}
};
/**
 * 设置弹窗位置信息<br/>
 * 参数可以是一个Object: {left: xx, top: xx}，也可以是两个值（为两个值时专指left/top）
 * @method setPos
 * @param arg0 {Object|Number} 一个位置对象或者left值
 * @param arg1 {Number} top值
 * @static
 */
ui.Popup.setPos = function(arg0, arg1){
	if(!ui.Popup.Object){
		return;
	}
	ui.Popup.Object.setPos(arg0, arg1);
};
/**
 * 设置弹窗定位类型
 * @param type {String} 定位类型  有效值为absolute|fixed
 * @method setPosType
 * @static
 */
ui.Popup.setPosType = function(type){
	if(!ui.Popup.Object){
		return;
	}
	ui.Popup.Object.setPosType(type);
};
/**
 * 设置弹窗定位时相对的基元素
 * @param target {HTMLElement|String} DOM元素或者是id
 * @method setPosBase
 * @static
 */
ui.Popup.setPosBase = function(target){
	if(!ui.Popup.Object){
		return;
	}
	ui.Popup.Object.setPosBase(type);
};
/**
 * 设置弹窗宽度
 * @param {Number} value 
 * @method setWidth
 * @static
 */
ui.Popup.setWidth = function(value){
	if(!ui.Popup.Object){
		return;
	}
	ui.Popup.Object.setWidth(value);
};
/**
 * 设置弹窗高度
 * @param {Number} value 
 * @method setHeight
 * @static
 */
ui.Popup.setHeight = function(value){
	if(!ui.Popup.Object){
		return;
	}
	ui.Popup.Object.setHeight(value);
};

/**
 * 重设大小
 */
ui.Popup.reSize = function(){
	if(!ui.Popup.Object){
		return;
	}
	var main = ui.Popup.Object.main;
	ui.Popup.Object.reSize();
};

/**
 * 使弹窗重新定位显示
 */
ui.Popup.rePosition = function(){
	if(!ui.Popup.Object){
		return;
	}
	ui.Popup.Object.rePosition();
	
};

baidu.on(window, 'load', ui.Popup.initUI);
