/*
 * cb-web
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/MonthView.js
 * desc:    日历月份显示单元
 * author:  zhaolei,erik
 * date:    $Date: 2010/05/07 11:57:07 $
 */

/**
 * 日历月份显示单元
 * 
 * @class MonthView
 * @namespace ui
 * @extends ui.Base
 * @constructor
 * @param {Object} options 控件初始化参数
 * <pre>
 * 参数配置定义如下：
 * {
 *    id:             [String],        [REQUIRED] 控件ID
 *    value:          [Date],          [OPTIONAL] 当前选择的日期，如果设置该值，其年月必須和year/month保持一致
 *    year:           [String|Number], [OPTIONAL] 当前选择的年份，默认服务器端时间
 *    month:          [String|Number], [OPTIONAL] 当前选择的月份，默认服务器端时间
 *    availableRange: [Object],        [OPTIONAL] 可选日期范围, 对象结构见下面定义，默认开始日期'2001-01-01'，
 *                                                结束日期为服务器端时间
 *    getDateRange:   [Function],      [OPTIONAL] 当前选择的日期范围，该函数要求返回一个对象，其结构同availableRange
 *    wrap:           [HTMLElement]    [OPTIONAL] 渲染的控件添加到的目标DOM元素，如果未设置，渲染该控件，需要调用appendTo方法
 * }
 * 
 * availableRange数据结构定义如下：
 * {
 *    begin: [Date] [REQUIRED] 可以选择的开始日期
 *    end:   [Date] [REQUIRED] 可以选择的结束日期
 * }
 * </pre>
 */
ui.MonthView = function (options) {
	this.initOptions( options);
	this.eventTypes = ['mouseover', 'mouseout', 'focus', 'blur'];
	this.handlers = {};
	
	this.type = "month";
	
	var now = new Date(nirvana.env.SERVER_TIME * 1000);
	this.year = parseInt(this.year, 10) || now.getFullYear();
	this.month = parseInt(this.month, 10) || now.getMonth();
	
	//初始化可选日期范围
	if (!this.availableRange){
		this.availableRange = {
			begin : baidu.date.parse('2001-01-01'),
			end : new Date(nirvana.env.SERVER_TIME * 1000)
		}
	}
};

ui.MonthView.prototype = {
    /**
     * 日期的模板
     * @private
     */
    tplItem: '<td year="{1}" month="{2}" date="{0}" class="{4}" id="{3}" onmouseover="{5}" onmouseout="{6}" onclick="{7}">{0}</td>',
	//TODO: 是否需要对模板string进行抽取
	
	/**
	 * 标题显示配置
	 */
	titleWords: ['一', '二', '三', '四', '五', '六', '日'],
	
	/**
	 * 设置当前显示的月份日期，会触发render方法重新执行<BR/>
	 * NOTICE: 只对当前选择的年和月进行设置，不会对当前选择的月份日期进行设置
	 * @method setView
	 * @public
	 * @param {Date} view 当前显示的年份-月份
	 */
	setView: function (view) {
        this.month = view.getMonth();
        this.year = view.getFullYear();
        this.render();   
	},
	
	/**
	 * 绘制控件
	 * @method render
	 * @protected
	 */
	render: function () {
	    var el = this.wrap;
	    if (el) {
            el.className = this.getClass();
	        el.innerHTML = this.getHtml();
	        this.paintSelected(this.value);
	    }
    },
    /**
     * 将未渲染的月份控件渲染到指定的DOM元素里
     * @method appendTo
     * @param {HTMLElement} wrap 渲染的控件添加到的目标DOM元素
     */
    appendTo: function (wrap) {
        this.wrap = wrap;
        if (wrap) {
           this.render();
        }
    },
    
    /**
     * 获取控件的html
     * 
     * @private
     * @return {string}
     */
    getHtml: function () {
        var me = this,
            html = ['<table border="0" cellpadding="0" cellspacing="0" class=' + me.getClass('main') + '><thead><tr>'],
            index = 0,
            year = me.year,
            month = me.month,
            repeater = new Date(year, month, 1),
            nextMonth = new Date(year, month + 1, 1),
            begin = 1 - (repeater.getDay() + 6) % 7, //
            titles = me.titleWords,
            tLen = titles.length,
            tIndex, //列序号
            virtual, //布尔值，该日期当前是否可点击
            overClass = me.getClass('over'),
            overHandler = "baidu.addClass(this, '" + overClass + "')",
            outHandler = "baidu.removeClass(this, '" + overClass + "')",
            dateRange = me.getDateRange(), //日历选择生效前的日期范围（点击"确定“之前）
			inRange = false,
			inRangeClassName;
        
        
        if(dateRange && dateRange.begin && dateRange.end){                
            var beginDate = new Date(dateRange.begin.getFullYear(), dateRange.begin.getMonth(), dateRange.begin.getDate());
            var endDate = new Date(dateRange.end.getFullYear(), dateRange.end.getMonth(), dateRange.end.getDate());
        }
        //生成title（星期几）
        for (tIndex = 0; tIndex < tLen; tIndex++) {
            html.push('<td class="' + me.getClass('title') + '">' + titles[tIndex] + '</td>');
        }
        html.push('</tr></thead><tbody><tr>')        
        repeater.setDate(begin);

		var now = new Date(nirvana.env.SERVER_TIME * 1000);
        while (nextMonth - repeater > 0 || index % 7 !== 0) {
            if (begin > 0 && index % 7 === 0) {
                html.push('</tr><tr>');
            }
            
            virtual = (repeater.getMonth() != month) || (repeater > now || repeater < me.availableRange.begin || repeater > me.availableRange.end);
            if(dateRange && dateRange.begin && dateRange.end){
                //console.log(dateRange.begin, " | ",repeater, " | ", dateRange.end)
                inRange = beginDate <= repeater  && repeater <= endDate;
            }
            inRangeClassName = inRange ? ' ' + me.getClass('inrange') : '';
            html.push(
                ui.format(me.tplItem, 
                    repeater.getDate(),
                    repeater.getFullYear(),
                    repeater.getMonth(),
                    me.getItemId(repeater),
                    (virtual ? me.getClass('virtual') : me.getClass('item') + inRangeClassName),
                    (virtual ? '' : overHandler),
                    (virtual ? '' : outHandler),
                    (virtual ? '' : me.getStrRef() + ".selectByItem(this)")
                ));
                          
            repeater = new Date(year, month, ++begin);
            index ++;
        }
               
        html.push('</tr></tbody></table>');
        return html.join('');
    },
    
    /**
     * 通过item的dom元素选择日期
     * 
     * @private
     * @param {HTMLElement} item dom元素td
     */
    selectByItem: function (item) {
        var date = item.getAttribute('date'),
            month = item.getAttribute('month'),
            year = item.getAttribute('year'),
            range = this.getDateRange();
            
        this.select(new Date(year, month, date));
    },
    /**
     * 选择月份当中的日期触发的事件
     * @event onselect
     * @param {Date} date 当前选择的日期
     * @return {Boolean} 如果当前日期不能选择，返回false
     */
    onselect: new Function(),
    
    getDateRange: new Function(),
    
    /**
     * 选择当前日期
     * 
     * @param {Date} date 当前日期
     */
    select: function (date) {
        if (!date) {
            return;
        }
        if (this.onselect(date) !== false) {
            this.paintSelected(date);
        }
    },
    
    /**
     * 绘制当前选择的日期
     * @method paintSelected
     * @private
     * @param {Date} date 要绘制的当前选择日期
     */
    paintSelected: function (date) {
        var me = this,
            selectedClass = me.getClass('selected'),
            item;
            
        if (me.value) {
            item = baidu.g(me.getItemId(me.value));
            item && baidu.removeClass(item, selectedClass);
        }
        
        if (date) {
            me.value = date;
            item = baidu.g(me.getItemId(date));
            item && baidu.addClass(item, selectedClass);
        }
    },
    
    /**
     * 获取日期对应的dom元素item的id
     * 
     * @private
     * @param {Date} date 日期
     * @return {string}
     */
    getItemId: function (date) {
        return this.getId()
                    + date.getFullYear() 
                    + date.getMonth() 
                    + date.getDate();
    },
    
    /**
     * 获取当前选择的日期
     * @method getValue
     * @public
     * @return {Date}
     */
    getValue: function () {
        return this.value || null;
    },
	
	/**
     * 设置可选的日期范围，该方法并不会触发控件重新渲染
     * @method setAvailableRange
     * @public
     * @param {Object} date 选取的日期范围，其结构定义如下
     * {
	 *    begin: [Date] [REQUIRED] 可以选择的开始日期
	 *    end:   [Date] [REQUIRED] 可以选择的结束日期
	 * }
     */
    setAvailableRange: function (date) {
		var me = this;
        if (date && date.begin && date.end) {
			me.availableRange = date;
		}
	}
};

ui.Base.derive(ui.MonthView);
