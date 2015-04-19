/*
 * nirvana
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:    ui/ColorBar.js
 * desc:    显示数据指标情况的组件
 * author:  wuhuiyao (wuhuiyao@baidu.com)  
 * date:    $Date: 2012/10/16 $
 */

/**
 * Bar图，通过用一个长方形的图，来表示一个数据指标的情况。Bar可以通过设置使其存在不同颜色的连续区块。<br/>
 * 当前用于行业领先包和账户质量评分。
 * 
 * @class ColorBar
 * @namespace ui
 * @extends ui.Base
 * @depend ui.Tip
 * @constructor
 * @param {Object} options ColorBar的初始化配置参数
 * <pre>
 * 可配置的选项的定义如下：
 * {
 *    id:          [String], [REQUIRED] ColorBar组件的ID --- 暂时没用到
 *    title:       [String], [OPTIONAL] 显示在Bar左边的标题信息
 *    description: [String], [OPTIONAL] 显示在Bar右边的描述信息
 *    intervals:   [Array],  [REQUIRED] 所要显示的连续的区块的颜色值以及对应比例信息，数组元素顺序为对应的显示
 *                                      的连续区块的顺序具体结构定义见下面
 *    graduations: [Array],  [OPTIONAL] bar下方显示的刻度信息，每个刻度包括其值和描述信息，具体结构定义见下面
 *                                      如果该bar是三色Bar，即intervals长度为3，那么刻度配置长度为4，
 *                                      包括最右边和最左边刻度,刻度顺序对应显示的连续区块的顺序。 
 *    barLabels:   [Array],  [OPTIONAL] bar每个区段上显示的label以及样式信息，具体结构定义见下面
 *                                      label顺序对应显示的连续区块的顺序。 
 *    barWidth:    [Number], [REQUIRED] 要显示的Bar的宽度，默认266px,可以传具体的宽度值要求带单位,
 *                                      也可以传百分比，e.g., '30%', '266px' 
 *    barHeight:   [Height], [OPTIONAL] 显示的Bar的高度，默认30，单位px
 *    titleWidth:  [Number], [OPTIONAL] 要显示的Bar的标题的宽度，单位px
 *    descrWidth:  [Number], [OPTIONAL] 要显示的Bar的描述信息的宽度，单位px
 *    value:       [String], [OPTIONAL] 当前要显示的数据指标的值
 *    tipPosition: [Number], [OPTIONAL] 显示的数据指标值的Tip的水平偏移量,默认0，单位px 
 * }
 * 
 * intervals结构定义如下：
 * [
 *    {
 *       color:   [String], [REQUIRED] 区块的颜色,e.g., '#CECECE'
 *       percent: [String], [REQUIRED] 区块宽度占整个bar的比例,也可以传具体的宽度值，要求带单位,
 *                                     e.g., '30%', '200px'
 *    },
 *    ...
 * ]
 *  
 * graduations结构定义如下：
 * [
 *    {
 *       value: [String|Number], [REQUIRED] 显示在Bar下方的刻度值
 *       note:  [String],        [OPTIONAL] 显示在Bar下方的刻度值的下方，用于对value进行说明
 *    },
 *    ...
 * ]
 * <b>NOTICE:</b> 如果某一位置不存在刻度信息，该位置设为null即可，若只存在前n个有刻度，可以只初始化前n个刻度信息
 * 
 * barLabels结构定义如下：
 * [
 *     {
 *        label: [String], [REQUIRED] 显示在Bar上的文本信息
 *        color: [String], [REQUIRED] 显示在Bar上的文本颜色
 *     },
 *     ...
 * ]
 * <b>NOTICE:</b> 如果某一区块不存在label信息，该位置设为null即可，若只存在前n个有label，可以只初始化前n个
 * </pre>
 */
ui.ColorBar = function($){
	// 默认配置
	var DEFAULT_SETTING = {
		barHeight: 28,
		barWidth: "266px"
	};
	
	/**
	 * ColorBar的构造函数
	 */
	function ColorBar(options) {
		// 初始化配置信息
        this.initOptions(options, DEFAULT_SETTING);
        this.type = 'colorBar';
	}
	/**
	 * 计算给定元素的宽度 
	 */
	function computeElemWidth(elem) {
		var container = baidu.dom.create("DIV", {style: "visibility: hidden;position:absolute;"});
		document.body.appendChild(container);
		container.appendChild(elem);
		
		var width = elem.offsetWidth;
		
		container.removeChild(elem);
		document.body.removeChild(container);
		
		return width;
	}
	/**
	 * 重置value，如果value是null或者undefined，返回空串，否则原值返回 
	 */
	function getValue(value) {
		if (typeof value == 'undefined' || value === null) {
			return '';
		} else {
			return value;
		}
	}
	
	/**
	 * 创建Bar上刻度元素
	 * @param {Boolean} isLast 是否是最后一个刻度 
	 */
	function createBarGraduationElem(context, graduationData, isLast) {
		var barGraduationTPL = '<div class="bar-graduation">\
		                            <p class="value">{value}</p>\
                                    <p class="note">{note}</p>\
		                        </div>';
		var	value = '',
	        note = '',
	        html,
	        elem;
	    
	    if (graduationData) {
	    	value = graduationData.value;
	    	note = graduationData.note;
	    }
	    
		value = getValue(value);
		note = getValue(note);
		
		// 创建区间刻度元素
		html = fc.tpl.parse({
			    	value: value,
			    	note: note
		       }, barGraduationTPL);
		
		elem = fc.create(html);
		
		// 调整Bar刻度的位置
		elem.style.top = parseInt(context.barHeight, 10) + "px";
		if (isLast) {
			elem.style.right = "-" + parseInt(computeElemWidth(elem) / 2) + "px";
		} else {
			elem.style.left = "-" + parseInt(computeElemWidth(elem) / 2) + "px";
		}
		
		return elem;
	}
	/**
	 * 创建Bar上区间元素包括刻度信息 
	 * @param {Object} lastGraduationData 最后一个区间的附加的刻度，如果不是最后一个区间，不传词参数。区间数据比
	 *                                    刻度数量少一个，因此最后一个区间有两个刻度。
	 */
	function createBarInterval(context, intervalData, barLabelData, graduationData, lastGraduationData) {
		var barIntervalTPL = '<div class="interval" style="{intervalStyle}">\
		                          <div class="bar-label" style="{barLabelStyle}">{label}</div>\
		                      </div>';
		var graduationEle,
		    html,
        	intervalElem,
        	graduationElem,
        	label = '',
        	barLabelStyle = '',
        	intervalStyle = '';   
        
        // 创建Document Fragment存储Bar Interval的DOM结构
		var barIntervalContainer = document.createDocumentFragment();
		    
    	intervalStyle = "width:" + intervalData.percent + ";background-color:" 
    	                + intervalData.color + ";";
    	
    	if (barLabelData) {
    		label = barLabelData.label;
    		barLabelStyle = "color:" + barLabelData.color 
		                + ";line-height:" + parseInt(context.barHeight, 10) + "px;";
    	}
    	
		label = getValue(label);
		 
    	// 创建Bar上区间元素 
    	html = fc.tpl.parse({
    		        intervalStyle: intervalStyle,
    		        barLabelStyle: barLabelStyle,
			    	label: label
		       }, barIntervalTPL);
		intervalElem = fc.create(html);
		// 添加临时的容器元素里
		barIntervalContainer.appendChild(intervalElem);
		
		// 创建区间刻度元素
		graduationElem = createBarGraduationElem(context, graduationData);
		// 将刻度添加到区间元素
		intervalElem.appendChild(graduationElem);
		
		if (lastGraduationData) {
			// 再创建最后一个刻度
			graduationElem = createBarGraduationElem(context, lastGraduationData, true);
			// 将刻度添加到区间元素
			intervalElem.appendChild(graduationElem);
    	}
    	
		return barIntervalContainer;
	}
	/**
	 * 设置给定元素的宽度或高度值 
	 * @param {Boolean} noParse 是否不对传递进来的值强制解析成以'px'为单位的值，如果为true，则设置的值为传递进来
	 *                          的值，不会尝试对其进行解析
	 */
	function setElementWidthOrHeight(element, styleValue, isWidth, noParse) {
    	if (styleValue) {
    		var propertyOfStyle = isWidth ? "width" : "height",
	    	    value;
	    	
	    	if (noParse) {
	    		value = styleValue;
	    	} else {
	    		value = parseInt(styleValue, 10) + 'px';
	    	}
	    	
	    	element.style[propertyOfStyle] = value;
    	}
    }
    /**
     * 创建Bar左边的标题信息元素或者后面的描述信息元素
     */
    function createBarTitleOrDescrElem(context, isTitle) {
    	var elem = null,
    	    tpl = isTitle ? '<li class="bar-title">{title}</li>' : '<li class="bar-descr">{description}</li>',
    	    property = isTitle ? "title" : "description",
    	    styleProperty = isTitle ? "titleWidth" : "descrWidth";
    	
    	if (context[property]) {
			var tplArgObj = {};
			
			tplArgObj[property] = context[property];
			// 生成模板
	    	var html = fc.tpl.parse(tplArgObj, tpl);
	    	
	    	// 将模板转成 DOM元素
	    	elem = fc.create(html);
	    	
	    	// 设置元素的样式
	    	setElementWidthOrHeight(elem, context[styleProperty], true);
	    	/*if (isTitle) {
	    		elem.style.lineHeight = parseInt(context.barHeight, 10) + "px";
	    	}*/
	    }
	    
	    return elem;
    }
    /**
     * 创建Bar视图元素 
     */
    function createBarView(context) {
    	var barViewTPL = '<li class="bar-view"></li>';
    	// 创建Bar View的DOM
	    var barViewContainer = fc.create(barViewTPL);

	    // 设置Bar View的宽度、高度
		setElementWidthOrHeight(barViewContainer, context['barWidth'], true, true);
		setElementWidthOrHeight(barViewContainer, context['barHeight'], false);
	     
	    /*------ 创建Bar View内容的DOM元素 BEGIN -----------*/
	    var len = context.intervals.length - 1,
	        barLabels = context.barLabels,
	        graduations = context.graduations,
	        intervals = context.intervals,
    	    intervalElem,
    	    barLabelData,
    	    graduationData;
    	// 遍历所有Bar的区间并创建对应的DOM元素
	    for (var i = 0; i <= len; i ++) {
	    	// 创建Bar上区间元素
	    	barLabelData = barLabels ? barLabels[i] : null;
	    	graduationData = graduations ? graduations[i] : null;
	    	intervalElem = createBarInterval(context, intervals[i], barLabelData, 
	    	               graduationData, (len == i) ? graduations[i + 1] : null);
	    	                          
			// 将创建的bar区间DOM元素添加到Bar ViewDOM容器元素
			barViewContainer.appendChild(intervalElem);
	    }
	    /*------ 创建Bar View内容的DOM元素  END-----------*/
	    
	    // 创建Bar下方的阴影遮罩
	    barViewContainer.appendChild(fc.create('<div class="bar-mask"></div>'));
		    
	    return barViewContainer;
    }
	
	ColorBar.prototype = {
		/**
         * 产生ColorBar的模版的DOM元素
         * @private
         */
        generateTPLElem: function() {
        	// 已经创建过直接返回创建过的DOM元素
        	if (this.barElem) {
        		return this.barElem;
        	}
        	
        	var me = this,
        	    // 创建Document Fragment存储Bar的DOM结构
        	    barContainer = document.createDocumentFragment();
			
		    // 创建Bar Title的DOM
		    var titleElem = createBarTitleOrDescrElem(me, true);
		    titleElem && barContainer.appendChild(titleElem);
		    
		    // 创建Bar View的DOM
		    var barViewElem = createBarView(me);
		    barContainer.appendChild(barViewElem);
		    
		    // 创建Bar描述的DOM元素
            var descrElem = createBarTitleOrDescrElem(me, false);
            descrElem && barContainer.appendChild(descrElem);
            
		    // 缓存创建的模板元素
			this.barElem = barContainer;
			
            return this.barElem;
        },
		/**
	     * 渲染控件
	     * @method render
	     * @param {Object} main 控件挂载的DOM，必须是UL元素
	     * @override
	     */
	    render: function(main) {
	    	var me = this,
	    	    renderElem = main || me.main;
	    	
	    	if (renderElem.tagName != 'UL') {
	    		return;
	    	}
	    	
	    	if (!me.isRender) {
	    		// 调用UIBase的render方法 
        	    // ui.Base.render.call(this, renderElem, false);
	    		me.main = renderElem;
	    		me.isRender = true;
	    		me.doRender(renderElem);
	    	}  
	    },
	    /**
         * 执行Render操作，该方法只在控件重新初始化或初次初始化调用
         * @param {HTMLElement} renderElem 要渲染的DOM元素
         * @private
         */
        doRender: function(renderElem) {
        	baidu.dom.hasClass(renderElem, 'ui-colorbar') || baidu.dom.addClass(renderElem, 'ui-colorbar');
        
        	var barEle = this.generateTPLElem();
        	renderElem.appendChild(barEle);
        	
        	/*------- 创建Bar上的Tip --------------------*/
		    if (this.value !== null && this.value !== '' && typeof this.value != 'undefined') {
		    	var tipContent = '<span class="value">' + this.value + '</span>您的位置';
	        	var tip = new ui.Tip({
							color : 'black-color',
							showOn : 'auto',
							content : tipContent,
							offsetX : this.tipPosition || 0
						});
	        	
			    var barViewContainer = baidu.dom.q('bar-view', renderElem)[0];
	        	tip.render(barViewContainer);
	        	this.controlMap = {tip: tip};
		    }
        },
        /**
         * 销毁控件实例
         * @method dispose
         * @override
         */
        dispose: function() {
	        this.barElem = null;
        	ui.Base.dispose.call(this);
        }
	};
	
	ui.Base.derive(ColorBar);
	
	return ColorBar;
}($$);
 