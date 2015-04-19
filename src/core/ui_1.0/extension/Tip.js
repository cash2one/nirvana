/*
 * nirvana
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:    ui/Tip.js
 * desc:    Tip组件
 * author:  wuhuiyao (wuhuiyao@baidu.com)  
 * date:    $Date: 2012/10/08 $
 */
 
/**
 * Tip组件。
 * 
 * @class Tip
 * @namespace ui
 * @extends ui.Base
 * @constructor
 * @param {String} text 显示的Tip的信息
 * @param {Object} options Tip配置参数
 * 配置项如下：
 * {
 *   content:      [String],   [OPTIONAL] Tip显示的内容，若未设置该值，将尝试从所要添加Tip的元素的title属性去获取，
 *                                        如获取失败，则忽略该Tip的创建，值可以是HTML片段
 *   color:        [String],   [OPTIONAL] 添加到Tip的样式，该样式被添加到Tip上 
 *   showTimeout:  [Number],   [OPTIONAL] 显示Tip的延时，默认值500
 *   hideTimeout:  [Number],   [OPTIONAL] 隐藏Tip的延时, 默认值100
 *   showOn:       [String],   [OPTIONAL] 显示Tip的触发方式，默认'hover'- 鼠标hover到要添加Tip的元素上显示Tip;
 *                                        其它有效值包括'manual' - 手动显示Tip; 'auto' - 自动显示 
 *   animation:    [Boolean],  [OPTIONAL] 是否开启显示/隐藏Tip的动画效果，默认true
 *   animDuration: [Number],   [OPTIONAL] 显示/隐藏Tip的动画延时，默认500, 开启animation，该值才有效
 *   arrowPos:     [String],   [OPTIONAL] 箭头指向在所要添加Tip的元素的位置,有效值'bottom', 'top', 默认'top'
 *   offsetX:      [Number],   [OPTIONAL] 显示的Tip的水平偏移量，单位px 
 *   offsetY:      [Number],   [OPTIONAL] 显示的Tip的垂直偏移量，单位px
 *   onHide:       [Function], [OPTIONAL] 隐藏Tip触发的事件， 默认值null
 *   onShow:       [Function], [OPTIONAL] 显示Tip触发的事件， 默认值null
 *   onClick:      [Function], [OPTIONAL] 单击Tip触发的事件， 默认值null
 * }
 */
ui.Tip = function($){
    var DEFAULT_SETTING = {
            arrowPos: 'top',
            showOn: 'hover',
            showTimeout: 500,
            hideTimeout: 100,
            //offsetX: 0,
            //offsetY: 0,
            animation: true,
            animDuration: 500
    };
    
    var isIE7 = (7 == baidu.browser.ie);
    
    /**
     * Tip的构造函数
     */
    function Tip(options) {
        // 初始化配置信息
        this.initOptions(options, DEFAULT_SETTING);
        
        this.showScheduler = new EventScheduler();
        this.hideScheduler = new EventScheduler();
        //this.shown = false;
        this.type = 'tip';
    };
    
    Tip.prototype = {
        /**
         * 产生Tip模板的DOM元素
         * @private
         */
        generateTPLElem: function() {
            if (!this.tipElem) {
            	var tpl = '<div class="ui-tip {color}">{content}<span class="tip-arrow-border {arrowBorderClass}"></span><span class="tip-arrow {arrowClass}"></span></div>',
                    html = fc.tpl.parse({
	                    color: this.color || "", 
	                    content: this.content, 
	                    arrowBorderClass: "tip-arrow-border-" + this.arrowPos, 
	                    arrowClass: "tip-arrow-" + this.arrowPos
                    }, tpl);
                    
                this.tipElem = fc.create(html);
            }
             
            return this.tipElem;
        },
        /**
         * 显示Tip
         * @method show
         */
        show: function() {
        	var me = this;
        	
            this.hideScheduler.clear();
        	this.showScheduler.set(function(){
        		if (me.animation) {
        			baidu.fx.fadeIn(me.tipElem, {duraton: me.animDuration});
        		} else {
        			// baidu.dom.setStyle(me.tipElem, 'visibility', "visible");
        			baidu.dom.show(me.tipElem);
        			// 修复IE7 下Tip被挡住问题
		        	// 层级的表现有时候不是看子标签的z-index有多高，而要看它们的父标签的z-index谁高谁低
			        if (isIE7) {
			        	baidu.dom.addClass(me.main, "fix-tip-IE7");
			        }
        		}
        	}, this.hideTimeout);
            
            /**
             * 显示Tip触发的事件
             * @event onShow
             * @param {HTMLElement} 添加Tip的DOM元素
             */
            if (typeof this.onShow == 'function') {
                // 触发show事件
                this.onShow.apply(this, [this.main]);
            }
        },
        /**
         * 隐藏Tip
         * @method hide
         */
        hide: function() {
        	var me = this;
        	
        	this.showScheduler.clear();
        	this.hideScheduler.set(function(){
        		if (me.animation) {
        			baidu.fx.fadeOut(me.tipElem, {duraton: me.animDuration});
        		} else {
        			//baidu.dom.setStyle(me.tipElem, 'visibility', "hidden");
        			baidu.dom.hide(me.tipElem);
        			// 修复IE7 下Tip被挡住问题, 由于存在float的情况下，且所有的Element都添加了Tip的话，如果都添加了fix-tip-IE7
		        	// fix-tip-IE7就没起到它的作用了，同时也为了避免使用一堆z-index=1,2,...，简单办法隐藏的Tip就不要z-index，
		        	// 确保显示Tip的z-index永远最高
			        if (isIE7) {
			        	baidu.dom.removeClass(me.main, "fix-tip-IE7");
			        }
        		}
        	}, this.hideTimeout);
        	
            /**
             * 隐藏Tip触发的事件
             * @event onHide
             * @param {HTMLElement} 添加Tip的DOM元素
             */
            if (typeof this.onHide == 'function') {
                // 触发hide事件
                this.onHide.apply(this, [this.main]);
            }
        },
        /**
         * 渲染Tip
         * @method render
         * @param {HTMLElement} main 要添加Tip的Element 
         * @override
         */
        render: function(main) {
        	var me = this,
        	    renderElem = main || me.main;
	    	
	    	if (!me.isRender) {
	    		/**
	    		 * 显示Tip的DOM元素
	    		 * @attribute main
	    		 * @final  
	    		 */
	    		me.main = renderElem;
	    		me.isRender = true;
	    		me.doRender(renderElem);
	    	}
	    	
	    	// 如果是自动显示，立即显示该Tip
	    	if ('auto' == this.showOn) {
	    		me.show();
	    	}
        },
        /**
         * 执行Render操作，该方法只在控件重新初始化或初次初始化调用
         * @param {HTMLElement} renderElem 要渲染的DOM元素
         * @private
         */
        doRender: function(renderElem) {
        	// 不调用UIBase的render方法, Tip不同于其它UI，给定的DOM元素是用来添加Tip控件
        	// ui.Base.render.call(this, renderElem, false);
        	
        	var content = this.content;
        	 
            // 不存在content信息，尝试从title属性获取
            if (!content) {
                content = baidu.dom.getAttr(renderElem, 'title');
                if (content) {
                    renderElem.removeAttribute('title');
                    this.content = baidu.encodeHTML(content);
                }
            }
            
            // Tip的内容不存在，忽略该元素的Tip的创建
            if (!content) {
                return;
            }
    
            // 产生Tip的DOM元素
            var tipEle = this.generateTPLElem();
            // 为元素添加Tip
            renderElem.appendChild(tipEle);
            
            // 调整显示Tip的位置
            this.resetTipPosition(tipEle, renderElem);
            
            // 事件绑定
            this.bindEvents(renderElem, tipEle);
           
            // 设置要添加Tip的elem的overflow属性为可见，避免Tip无法正常显示
            baidu.dom.setStyles(renderElem, {'overflow': 'visible'});
        },
        /**
         * 重新计算Tip显示的位置  
         * @param {HTMLElement} renderElem 要添加Tip的DOM元素
         * @param {HTMLElement} tipElem Tip的DOM元素
         * @private
         */
        resetTipPosition: function(tipEle, renderElem) {
        	var left = 0,
        	    offset = tipEle.offsetHeight + 4,
        	    width = tipEle.offsetWidth,
        	    elemWidth = renderElem.offsetWidth,
        	    position = {};
        	
        	// 一开始Tip是设置visibility:hidden，为了能够计算其高度，现在重新用display
        	baidu.dom.hide(this.tipElem);
        	baidu.dom.setStyle(this.tipElem, 'visibility', "inherit");
        	
        	if (typeof this.offsetX != 'undefined') {
        		left = parseInt(this.offsetX, 10) - parseInt(width / 2);
        		
        		// 修复Tip的位置避免Tip超出所要添加Tip的DOM元素的最右边界
        		var overflowWidth = parseInt(this.offsetX, 10) + parseInt(width / 2) - elemWidth,
        		    // 设置允许超出的边界的大小
        		    allowOverflowSize = 25;
        		overflowWidth -= allowOverflowSize;
	        	if (overflowWidth > 0) {
	        		left -= overflowWidth;
	        		var tipArrowBorderElem = $('.tip-arrow-border', tipEle)[0],
	        		    tipArrowElem = $('.tip-arrow', tipEle)[0],
	        		    arrowOffset = parseInt(width / 2) + overflowWidth;
	        		    
	        		tipArrowBorderElem.style.left = arrowOffset + 'px';
	        		tipArrowElem.style.left = arrowOffset + 'px';
	        	}
        	}
        	
        	if (typeof this.offsetY != 'undefined') {
        		offset += parseInt(this.offsetY, 10);
        	}
        	
        	offset = -1 * offset;
        	position.left = left + 'px';
        	position[this.arrowPos] = offset + 'px';
        	
        	baidu.dom.setStyles(tipEle, position);
        },
        /**
         * 单击Tip的事件处理 
         * @param {Object} e 事件对象
         * @private
         */
        clickHandler: function(e) {
        	var me = this;
        	
            e = e || window.event;
            // 停止事件传播
            baidu.event.stop(e);
            
            /**
             * 点击Tip触发的事件
             * @event onClick
             */
            if (typeof me.onClick == 'function') {
            	// 触发click事件
            	me.onClick.call(me, e);
            }
        },
        /**
         * 鼠标移到添加Tip的目标元素的事件处理
         * @private
         */
        hoverHandler: function() {
        	// 显示Tip
            this.show();
        },
        /**
         * 鼠标移出添加Tip的目标元素的事件处理 
         * @private
         */
        outHandler: function() {
        	// 隐藏Tip
            this.hide();
        },
        /**
         * 绑定Tip的事件处理 
         * @param {HTMLElement} renderElem 要添加Tip的DOM元素
         * @param {HTMLElement} tipElem Tip的DOM元素
         * @private
         */
        bindEvents: function(renderElem, tipElem) {
        	var me = this;
        	var bindContext = nirvana.util.bind;
    	    me.clickHandler = bindContext(me.clickHandler, me);
    		baidu.on(tipElem, 'click', me.clickHandler);
         
            if ('hover' ===  me.showOn) {
            	me.hoverHandler = bindContext(me.hoverHandler, me);
            	me.outHandler = bindContext(me.outHandler, me);
            	
            	baidu.on(renderElem, 'mouseover', me.hoverHandler);
            	baidu.on(renderElem, 'mouseout', me.outHandler);
            }
        },
        /**
         * 销毁控件实例
         * @method dispose
         * @override
         */
        dispose: function() {
        	if (this.tipElem) {
        		baidu.un(this.tipElem, 'click', this.clickHandler);
	            baidu.un(this.main, 'mouseover', this.hoverHandler);
	            baidu.un(this.main, 'mouseout', this.outHandler);
	            
	            this.showScheduler.clear();
	            this.hideScheduler.clear();
	            
				baidu.dom.remove(this.tipElem);
	            // this.main.removeChild(this.tipElem);
	            this.tipElem = null;
        	}
        	ui.Base.dispose.call(this);
        }
    };
    
    var tipMap = {};
    /**
     * 供外部调用的Tip初始化函数
     * 
     * @method init
     * @static
     * @param {String|HTMLElement} eleSelector 如果参数为类型字符串的选择器使用Sizzle来查询
     * @param {Object} setting 配置定义见Tip构造函数说明 
     */
    Tip.init = function(eleSelector, setting) {
    	// 不管存不存在先销毁已有Tip实例
    	Tip.destory(eleSelector);
    	
    	var eleArr;
    	if (typeof eleSelector == 'string') {
    		eleArr = $(eleSelector);
    	} else {
    		eleArr = [eleSelector];
    	}
    	
        var tip,
            tipArr = [];
        
        // 为元素添加Tip功能
        for (var i = 0, len = eleArr.length; i < len; i ++) {
            tip = new Tip(setting);
            tip.render(eleArr[i]);
            // 缓存Tip实例
            tipArr[i] = tip;
        }
        
        if (tipArr.length > 0) {
        	tipMap[eleSelector] = tipArr;
        }
    };
    /**
     * 销毁Tip实例
     * @method destory
     * @static 
     * @param {String} eleSelector 要销毁的Tip的实例的元素选择器，和Tip.init参数必须对应，未指定所有缓存实例全部移除
     */
    Tip.destory = function(eleSelector) {
    	if (eleSelector) {
    		destoryTips(eleSelector);
    	} else {
    		for (var k in tipMap) {
    			destoryTips(k);
    		}
    	}
    };
    
    function destoryTips(eleSelector) {
    	var tipArr = tipMap[eleSelector];
		if (tipArr) {
			for (var k in tipArr) {
				tipArr[k].dispose();
			}
		}
		delete tipMap[eleSelector];
    }
    
    /**
     * 事件调度器 
     */
    function EventScheduler() {
    }
    
    EventScheduler.prototype = {
    	/**
    	 * 设置要执行的事件
    	 * @param {Function} func 要执行的函数
    	 * @param {Number} timeout 执行的事件的延时
    	 * @return {Boolean} 设置结果，true表示成功，false表示失败
    	 */
        set : function (func,timeout) {
        	// 如果当前已经有事件在等待执行，则退出，避免重复执行事件
        	if (!this.executed && this.timer) {
        		return false;
        	}
        	
        	this.executed = false;
            this.timer = setTimeout(function() {
            	this.executed = true;
            	func();
            }, timeout);
            
            return true;
        },
        /**
         * 清除等待执行的事件 
         */
        clear: function() {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    ui.Base.derive(Tip);
    
    return Tip;
}($$);
