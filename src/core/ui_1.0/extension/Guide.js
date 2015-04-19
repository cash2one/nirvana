/*
 * nirvana
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:    ui/Guide.js
 * desc:    引导页组件
 * author:  wuhuiyao (wuhuiyao@baidu.com)  
 * date:    $Date: 2012/10/10 $
 */
/**
 * <p>引导页框架组件，主要用于优化包引导页</p>
 * NOTICE: 该引导页用到了z-index:2600,2700,2800,2801<br/>
 * 其中2600~2800对应ui.Mask的level:11~13
 * @class Guide
 * @namespace ui
 * @constructor
 * @param {Object} options 引导页配置项定义
 * <pre>
 * 配置项定义如下：
 * {
 *    skin:         [String],             [OPTIONAL] 定制的引导页样式皮肤
 *    content:      [Array],              [REQUIRED] 引导页内容，元素为String类型的图片名称，引导页
 *                                                   将按照元素的顺序来显示
 *    tpl:          [String],             [OPTIONAL] 显示图片上附加显示的内容模板，默认
 *                                                   为用于优化包的立即体验/关闭/打开。
 *                                                   为了保持close,try,open事件可用
 *                                                   要求可点击元素class按照默认的模板来。
 *    highLightDom: [String|HTMLElement], [OPTIONAL] 要高亮的DOM元素的ID或DOM元素
 *    highLightPic: [String],             [OPTIONAL] 要高亮的DOM元素所截取的图片名称，主要用于修复
 *                                                   IE7无法高亮的替代方案
 *    logoTitle:    [String],             [OPTIONAL] 鼠标移到优化包Logo显示的Title信息
 *    onClose:      [Function],           [OPTIONAL] 关闭引导页触发的事件
 *    onNext:       [Function],           [OPTIONAL] 点击Next下一页按钮触发的事件
 *    onPrev:       [Function],           [OPTIONAL] 点击Previous上一页按钮触发的事件
 *    onOpen:       [Function],           [OPTIONAL] 点击左边优化包Logo触发的事件
 *    onTry:        [Function],           [OPTIONAL] 点击立即体验按钮触发的事件
 *    onGuideClick: [Function],           [OPTIONAL] 除了上面几个内置事件外，触发的引导
 *                                                   页内容点击事件
 * }
 * </pre>
 */
ui.Guide = function ($) {
    var isIE7 = (7 == baidu.browser.ie);
    // 引导页存放的图片的基路径
    var baseImgPath = "asset/img/guide/";
    /**
     * 默认引导页操作模板
     * @type {string}
     */
    var OP_TPL = ''
        + '<a class="try" title="立即体验"></a>'
        + '<a class="close" title="关闭"></a>'
        + '<a class="open" title={logoTitle}></a>';
    
    /**
     * 引导页构造函数
     */    
    function Guide(options) {
        options = options || {};
        
        for (var k in options) {
        	this[k] = options[k];
        }
        
    	// 引导页当前显示到的步数，有效值从1-N 
    	this.step = 0;
    }
    
    /**
     * 显示遮罩层，底层为黑色背景，上层为白色背景
     * 介绍内容z-index介于两者之间，上层的白色背景用于屏蔽点击操作
     */
    function showMask() {
        ui.Mask.show('black', 11); // z-index:2600
        ui.Mask.show('white', 12); // z-index:2800
    }
    
    /**
     * 隐藏遮罩层
     */
    function hideMask() {
        ui.Mask.hide(11);
        ui.Mask.hide(12);
    }
    
    /**
     * 高亮夹心层
     * @param {String|HTMLElement} dom DOM元素ID或DOM元素
     * @param {String} highlightPicName 用于替代CSS高亮的图片名称
     * @return {HTMLElement|undefined} 对于IE7会返回创建的高亮的DOM元素
     */
    function highlight(dom, highlightPicName) {
    	var elem = dom && baidu.g(dom);
    	if (isIE7) {
			return elem && highlightForIE7(elem, highlightPicName);
		} else {
			elem && baidu.addClass(elem, 'guide-highlight');
		}
    }
    
    /**
     * 取消高亮夹心层
     * @param {String|HTMLElement} dom DOM元素ID或DOM元素
     * @param {HTMLElement} highlightPicElem 用于替代CSS高亮的图片DOM元素
     */
    function cancelHighlight(dom, highlightPicElem) {
    	var elem = dom && baidu.g(dom);
    	if (isIE7) {
    		highlightPicElem && document.body.removeChild(highlightPicElem);
    	} else {
    		elem && baidu.removeClass(elem, 'guide-highlight');
    	}
    }
    
    /**
     * 用图片替代样式实现的高亮，用于IE7 
     * @return {HTMLElement} 创建的高亮DOM元素
     */
    function highlightForIE7(dom, picName) {
    	var tpl = '<img style="position:absolute;z-index:{zIndex};" src="{basePath}{imgName}" alt="" />',
    	    tplData = {
    	    	zIndex: 2600,
    	    	basePath: baseImgPath,
    	    	imgName: picName
    	    };
    	    
    	var  html = fc.tpl.parse(tplData, tpl),
    	     imgElem = fc.create(html);
    	     
        var offset = baidu.dom.getPosition(dom);
        // modify highlight image position
        imgElem.style.left = offset.left + "px";
        imgElem.style.top = (offset.top - 3) + "px";
        
    	document.body.appendChild(imgElem);
    	
    	return imgElem;
    }
    
    Guide.prototype = {
        /**
         * 移除引导内容
         * @private
         */
        remove: function () {
        	// 取消高亮
        	cancelHighlight(this.highLightDom, this.highlightIE7Elem);
        	// 移除引导层
        	if (this.guideElem) {
        		document.body.removeChild(this.guideElem);
        	}
        },
        /**
         * 引导层页面按钮被单击事件处理
         * @private
         */
        clickHandler: function(e, target) {
            e = e || window.event;
            var target = e.target || e.srcElement;

            var hasClass = baidu.dom.hasClass;
            var action;
            if (hasClass(target, "open")) {
            	/**
            	 * 点击Logo触发的事件
            	 * @event onOpen
            	 * @param {Number} step 当前进入的引导页的步数
            	 */
            	action = "onOpen";
            }
            else if (hasClass(target, "try")) {
            	/**
            	 * 点击立即体验触发的事件
            	 * @event onTry
            	 * @param {Number} step 当前进入的引导页的步数
            	 */
                action = 'onTry';
            }
            else if (hasClass(target, "close")) {
                /**
                 * 关闭引导页触发的事件
                 * @event onClose
                 * @param {Number} step 当前进入的引导页的步数
                 */
            	action = 'onClose';
            }

            if (action) {
                // 先执行引导页的close动作，再执行回调
                this.close();
                this.fire(action, [this.step]);
            }
            else {
                /**
                 * 点击引导页触发的事件（除了内置的几个事件外）
                 * @event onGuideClick
                 * @param {HTMLElement} target 触发点击操作的目标DOM元素
                 * @param {Number} step 当前进入的引导页的步数
                 */
                this.fire('onGuideClick', [target, this.step]);
            }
            
            // 阻止事件的传播
//            baidu.event.stop(e);
        },
    	/**
    	 * 产生引导页模版元素
    	 * @private 
    	 */
    	generateTPLElem: function() {
    		if (this.guideElem) {
    			return this.guideElem;
    		}
    		// 模版定义
    		var guideTpl = '<ul class="ui-guide{skin}">'
	                     +     '<li class="guide-prev{prevClass}" title="上一步"></li>'
	                     +     '<li class="guide-content">'
                         +         '<ul></ul>'
                         +         '<div class="guide-indicator{indicatorClass}"></div>'
                         +         (this.tpl || OP_TPL)
	                     + 	   '</li>'
                         +     '<li class="guide-next{nextClass}" title="下一步"></li>'
                         + '</ul>';
            var guidePageTpl = '<li class="guide-page" style="background:url({basePath}{imgName}) no-repeat;">'
                 			 + '</li>';
            var indicatorTpl = '<span></span>';

            var content = this.content;
            var len = content.length;
            var hideClass = (len <= 1) ? ' no-guide-nav' : '';
            var skin = this.skin ? (" " + this.skin) : '';
			 // 引导框架的DOM元素
			var guideElem = fc.create(fc.tpl.parse({
						skin: skin,
						logoTitle: this.logoTitle || '',
                        prevClass: hideClass,
                        nextClass: hideClass,
                        indicatorClass: hideClass
					}, guideTpl));   

			var tplData = {
				    basePath : baseImgPath
				},
				contentListElem = $(".guide-content UL", guideElem)[0],
				indicatorContainer = $(".guide-indicator", guideElem)[0],
			    html = "",
			    indicatorHTML = "";
			    
			// 创建引导页面的DOM元素模板
			for (var i = 0; i < len; i ++) {
				tplData.imgName = content[i];
				html += fc.tpl.parse(tplData, guidePageTpl);
				
				indicatorHTML += indicatorTpl;
			}
			
			// 将模板添加到引导页内容 DOM元素
	    	contentListElem.innerHTML = html;
	    	// 设置引导页内容列表宽度
	    	contentListElem.style.width = len * 100 + "%";
	    	
	    	// 创建引导指示进度的DOM
	    	indicatorContainer.innerHTML = indicatorHTML;
	    	
	    	// 缓存引导页DOM元素
			this.guideElem = guideElem;
			
	    	return this.guideElem;
    	},
    	/**
    	 * 触发事件
    	 * @private
    	 */
    	fire: function(eventName, paramArr) {
    		var me = this,
    		    handler = me[eventName];

    		if (typeof handler == 'function') {
    			handler.apply(this, paramArr);
    		}
    	},
    	/**
    	 * 重置引导页前进后退按钮状态
    	 * @private  
    	 */
    	resetNextPrevBtnState: function(totalSteps, toEnterStep, currentStep) {
    		var me = this;
    		
    		// reset guide button state
    	    var prevElem = $(".guide-prev", me.guideElem)[0];
    	    var nextElem = $(".guide-next", me.guideElem)[0];
    	    
    	    if (1 == toEnterStep) {
    	    	baidu.addClass(prevElem, "guide-prev-disable");
    	    } else if (1 == currentStep) {
                baidu.removeClass(prevElem, "guide-prev-disable");
            }

            if (totalSteps == toEnterStep) {
    	    	baidu.dom.addClass(nextElem, "guide-next-disable");
    	    } else if (totalSteps == currentStep) {
    	    	baidu.dom.removeClass(nextElem, "guide-next-disable");
    	    }
    	},
    	/**
    	 * 执行引导页的next/prevous动作
    	 * @private 
    	 */
    	doGuide: function(toEnterStep, isNext) {
    		var me = this,
    		    currentStep = me.step,
    		    total = me.content.length;
    		    
    	    if (toEnterStep <= 0 || toEnterStep > total) {
    	    	return;
    	    }
    	    
    	    // reset guide button state
    	    this.resetNextPrevBtnState(total, toEnterStep, currentStep);
    	    
    	    // 重置引导页指示器
    	    var oldIndciatorElem = $(".sel-page", me.guideElem)[0],
    	        newIndicatorElem = $(".guide-indicator span", me.guideElem)[toEnterStep - 1];
    	    
    	    oldIndciatorElem && baidu.dom.removeClass(oldIndciatorElem, 'sel-page');
    	    baidu.dom.addClass(newIndicatorElem, 'sel-page');
    	    
    	    var pageContainerElem = $(".guide-content UL", me.guideElem)[0],
    	        // 计算要显示的分页的位置
    	        left = (toEnterStep - 1) * me.guidePageWidth * -1;
    	    pageContainerElem.style.marginLeft = left + "px";
    	    
    	    // 记录当前所处的step
    	    me.step = toEnterStep;
    	    
    	    /**
    	     * 点击下一步触发的事件<br/>
    	     * 刚打开引导页，会自动触发进入下一步的事件
    	     * @event onNext
    	     * @param {Number} step 当前进入的引导页的步数 
    	     */
    	    /**
    	     * 点击上一步触发的事件
    	     * @event onPrev
    	     * @param {Number} step 当前进入的引导页的步数 
    	     */
    	    // 触发Next/previous事件
    	    var eventName = isNext ? "onNext" : "onPrev";
    	    me.fire(eventName, [me.step]);
    	},
    	/**
    	 * 进入下一步的引导页 
    	 * @private
    	 */
    	next: function() {
    		this.doGuide(this.step + 1, true);    
    	},
    	/**
    	 * 进入上一步的引导页 
    	 * @private
    	 */
    	prev: function() {
    		this.doGuide(this.step - 1, false);    
    	},
    	/**
    	 * 初始化引导页 
    	 * @private 
    	 */
    	init: function() {
    		if (this.guideElem) {
    			// 已经初始化过直接return
    			return;
    		}
    		
    		// 创建引导页模板元素
    		var elem = this.generateTPLElem();
    		// 附加到body节点
    		document.body.appendChild(elem);
    		// reset引导页位置
    		this.resetGuidePosition();
    		
    		// var bindContext = nirvana.util.getEventHanlder;
    		// 记录当前引导页宽度
    		this.guidePageWidth = $('.guide-content', elem)[0].offsetWidth;
    		// 绑定点击事件处理器
    		this.bindHandlers();
    	},
    	/**
    	 * 重置引导页位置，使其显示在正确的位置 
    	 * @private
    	 */
    	resetGuidePosition: function() {
    		var guideElem = this.guideElem,
    		    guideWidth = guideElem.offsetWidth,
    		    guideHeight = guideElem.offsetHeight,
    		    viewportWidth = document.documentElement.clientWidth,
    		    viewportHeight = document.documentElement.clientHeight;
    		    
    		var offsetX = parseInt((viewportWidth - guideWidth) / 2),
    		    elem = this.highLightDom && baidu.g(this.highLightDom),
    		    // baseTop是距离文档左上角的位置不是当前可视区域的左上角所以下面和可视高度比较要减去滚动条滚动的距离
    		    baseTop = elem ? baidu.dom.getPosition(elem).top : 0,
    		    highLightHeight = elem ? elem.offsetHeight : 0,
    		    maxHeight = baseTop + highLightHeight + guideHeight;
    		
    		// 经测试，Chrome下必须使用document.body才能修改其滚动条位置，对于FF/IE测试使用documentElemnt都ok
    		var scrollElem = baidu.browser.isWebkit ? document.body : document.documentElement;
    		// check一下当前是否能完全显示引导页
    		if ((maxHeight - scrollElem.scrollTop) > viewportHeight) {
    			var fixOffsetY = maxHeight - viewportHeight + 5;
    			// 为了避免出现引导页不能全部可见，要调整baseTop大小，尝试将滚动条往下滚，保证引导页能全部看到
    			baidu.fx.scrollTo(scrollElem, [0, fixOffsetY], {duration: 1000});
    		}  
    	    // 要高亮的元素不存在，垂直方向居中显示
    		var offsetY;
    		if (elem) {
    			offsetY = baseTop + highLightHeight + 5;
    		} else {
    			offsetY = parseInt((viewportHeight - guideHeight) / 2) + scrollElem.scrollTop;
    		}
    		
    		guideElem.style.top = offsetY + "px";
    		guideElem.style.left = offsetX + "px";
    	},
    	/**
    	 * 绑定事件处理器
    	 * @private 
    	 */
    	bindHandlers: function() {
    		var guideElem = this.guideElem;
    		
    		var pageContainerElem = $('.guide-content', guideElem)[0],
    		    prevElem = $('.guide-prev', guideElem)[0],
    		    nextElem = $('.guide-next', guideElem)[0],
    		    bindContext = nirvana.util.bind;
    		    
    		// 绑定点击事件处理器
    		pageContainerElem.onclick = bindContext(this.clickHandler, this);
    		// 绑定上一步、下一步事件处理器
    		prevElem.onclick = bindContext(this.prev, this);
    		nextElem.onclick = bindContext(this.next, this);
    		
    	},
    	/**
    	 * 显示引导页 
    	 * @mehtod show
    	 */
    	show: function() {
    		if (!this.content || 0 == this.content.length) {
    			return;
    		}
        	
    		// 显示遮罩
    		showMask();
    		// 高亮DOM元素
			this.highlightIE7Elem = highlight(this.highLightDom, this.highLightPic);
    		
    		// 初始化引导页内容
    		this.init();
    		// 进入第一个引导页
    		this.next();
    	},
    	/**
    	 * 关闭引导页
    	 * @method close 
    	 */
    	close: function() {
    		// 隐藏遮罩
    		hideMask();
            this.remove();
    	} 
    };
    
    return Guide;
}($$); 
 