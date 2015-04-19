/*
 * cb-web
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/MultiCalendar.js
 * desc:    多日期选择器
 * author:  zhaolei,erik
 * date:    2010/12/21
 * 
 * cssList:
 *      'over',
 *      'show',
 *      'point',
 *      'layer',
 *      'body',
 *      'foot',
 *      'begin',
 *      'end',
 *      'input',
 *      'year',
 *      'month',
 *      'itemshow',
 *      'prev',
 *      'next',
 *      'label',
 *      'prev-td',
 *      'next-td',
 *      'yinfo',
 *      'mactive'
 * 
 * idList:
 *      'show',
 *      'layer',
 *      'foot',
 *      'begin',
 *      'end',
 *      'beginInput',
 *      'endInput',
 *      'beginYinfo',
 *      'endYinfo',
 *      'beginMonth',
 *      'endMonth',
 *      'beginCal',
 *      'endCal',
 *      'mPrefix'
 */

/**
 * 多日期选择器
 * 
 * @class MultiCalendar
 * @extends ui.Base
 * @constructor
 * @param {Object} options 控件初始化参数
 * <pre>
 * 参数配置定义如下：
 * {
 *    id:             [String], [REQUIRED] 控件ID
 *    value:          [Object], [OPTIONAL] 当前选择的日期区间，其结构为{begin: [Date], end: [Date]}，
 *                                         默认其值由服务器决定，begin和end值等于服务端日期
 *                                         如果其值为{being: '', end: ''}，表示选择所有时间
 *    availableRange: [Object], [OPTIONAL] 可选日期范围, 其结构为{begin: [Date], end: [Date]}，
 *                                         默认开始日期'2001-01-01'，结束日期为服务器端时间
 *    miniOption:     [Array],  [OPTIONAL] 快捷日期时间段选择器显示的快捷日期种类，默认[0,1,2,3,4]，数字索引代表具体含义见{{#link "ui.MiniMultiCalendar"}}{{/link}} 
 *    show:           [String], [OPTIONAL] 普通日历"normal"or表单日历"form"，默认'normal',
 *    miniDateOption: [Array],  [OPTIONAL] 格式就像 nirvana.config.dateOption （可以动态设置）
 * }
 * </pre>
 */
ui.MultiCalendar = function (options) {
    this.initOptions(options);
    
    // 类型声明，用于生成控件子dom的id和class
    this.type = 'mcal';

    var me = this;
	
	var now = new Date(nirvana.env.SERVER_TIME * 1000);
	
	// 初始化当前日期
    this.value = this.value || {
        begin: now,
        end: now
    };
	
	this.isAllTime = false;
	// relativeValue: 选择的快捷日期时间段索引，数字索引代表具体含义见ui.MiniMultiCalendar的miniOption配置属性说明
	//初始化相对时间存储
	this.relativeValue = this.relativeValue ||false;
	
	
	if(this.value.begin == '' 
	&& this.value.end == ''){
		
		this.value = {
	        begin: now,
	        end: now
	    };
	
		this.isAllTime= true;
	}
	

	//初始化可选日期范围
	if (!this.availableRange){
		this.availableRange = {
			begin : baidu.date.parse('2001-01-01'),
			end : new Date(nirvana.env.SERVER_TIME * 1000)
		}
	}
	
	me.startYear = this.availableRange.begin.getFullYear();
	me.endYear = this.availableRange.end.getFullYear();
	me.startMonth = this.availableRange.begin.getMonth() + 1;
	me.endMonth = this.availableRange.end.getMonth() + 1;
	
    me.yearData = (function(start,end){
        var years = [];
        for(var i = start; i <= end; i++){
            years.push({text:i, value:i});
        }
        return years;
    })(me.startYear,me.endYear);
	
   me.monthData = (function(start,end){
        var monthes = [];
        for(var i = start; i <= end; i++){
            monthes.push({text:i, value:i-1});
        }
        return monthes;
    })(1,12);
	
    // 创建子控件对象：日历部件与按钮
    var id = this.id,
        now = new Date(nirvana.env.SERVER_TIME * 1000),
        beginMonthView  = ui.util.create('MonthView', {'id': id + 'begin', 'getDateRange': this.getDateRange(), 'availableRange':this.availableRange}),
        endMonthView    = ui.util.create('MonthView',{'id': id + 'end', 'getDateRange': this.getDateRange(),'availableRange':this.availableRange}),
        okButton        = ui.util.create('Button', {'id': id + 'ok','skin': 'empha_22'}),
        cancelButton    = ui.util.create('Button', {'id': id + 'cancel'}),
        yearSelectionBegin   = ui.util.create('Select', {'id': id + 'yearselbein', datasource:this.yearData, value:2010, width:55}),
        monthSelectionBegin  = ui.util.create('Select', {'id': id + 'monthselbegin', datasource: this.monthData, value: 1, width:40}),
        yearSelectionEnd   = ui.util.create('Select', {'id': id + 'yearselend', datasource:this.yearData, value:2010, width:55}),
        monthSelectionEnd  = ui.util.create('Select', {'id': id + 'monthselend', datasource: this.monthData, value: 1, width:40}),
		//by zhouyu
		mmcal = ui.util.create('MiniMultiCalendar',{'id':id + 'mmcal','value':this.value, 'miniOption':this.miniOption||[0,1,2,3,4]});
	
    // 如果有optionList参数则设置optionList
	this.miniDateOption && mmcal.setMiniDateOption(this.miniDateOption);

    //me.beginMonthView = beginMonthView;
	//me.endMonthView = endMonthView;
	
    beginMonthView.onselect = this.getSelectHandler('begin');

    endMonthView.onselect   = this.getSelectHandler('end');
    
    cancelButton.onclick    = this.getCancelHandler();
    okButton.onclick        = this.getOkHandler();
    yearSelectionBegin.onselect  = this.getYearSelectHandler('begin');
    monthSelectionBegin.onselect = this.getMonthSelectHandler('begin');
    yearSelectionEnd.onselect  = this.getYearSelectHandler('end');
    monthSelectionEnd.onselect = this.getMonthSelectHandler('end');
	
	//by zhouyu
	mmcal.onselect = this.mmcalHandler();
    
    this.controlMap = {
        'begin' : beginMonthView,
        'end'   : endMonthView,
        'ok'    : okButton,
        'cancel': cancelButton,
        'yearselbegin': yearSelectionBegin,
        'monthselbegin': monthSelectionBegin,
        'yearselend'   : yearSelectionEnd,
        'monthselend'  : monthSelectionEnd,
		'mmcal' : mmcal
    };
    
    // 声明按钮文字
    this.okStr = '确定';
    this.cancelStr = '取消';
    
    // 初始化显示的日期
    this.view = {
        begin: new Date(this.value.begin),
        end: new Date(this.value.end)
    };
    
    // 声明日期格式
    this.dateFormat = 'yyyy-MM-dd';
    
    // 声明浮动层侧边的说明
    this.beginSideTitle = '起始时间';
    this.endSideTitle = '结束时间';
    
    // 偏向大小
    this.offsetSize = '-10000px';
	
	//普通日历or表单日历
	this.show = this.show ? this.show : "normal"; 
	/**
	 * 该控件是否被禁用，该属性是只读
	 * @property disabled
	 * @type Boolean
	 * @defulat false
	 * @final
	 */
	this.disabled = false;
};

ui.MultiCalendar.prototype = {
    
    getDateRange : function(){
        var me = this; 
        return function (){
            return me.value;
        }
    },
    /**
     * 主显示区域的模板
     * @private
     */
    tplMain: '<div class="{3}"><span id="{0}" class="{1}">{2}</span></div>',
    
    /**
     * 浮动层html模板
     * @private
     * modify by zhouyu
     */
    tplLayer: '<div id="{5}"></div><div id="{6}" class="{7}"></div><div class="{0}">{1}{2}</div><div id="{3}" class="{4}"></div>',
    
    /**
     * 浮动层单侧html模板
     * @private
     */
    tplSide: '<div class="{9}"><div class="{1}"><span class="{2}">{3}</span><span id="{4}"></span></div><div class="{0}"><div id="{5}" class="{6}">{7}</div><div id="{8}"></div></div></div>',
    
    /**
     * 浮动层月份单元的html模板
     * @private
     */
    tplMonth: '<td class="{1}" id="{2}" month="{3}" onclick="{4}">{0}</td>',
    
    tplSelect: '<td><div class="{0}" id="{1}"></div></td>',
    
    /**
     * 浮动层侧边头部的html模板
     * @private
     */
    tplSideHead: '<span class="{4}">{0}</span><input type="text" id="{1}" value="{2}" class="{3}">',
    
    /**
     * 浮动层年份单元的html模板
     * @private
     */
    tplYear: '<span class="{1}" id="{2}">{0}</span>',
	
	/**
	 * 点击快捷键处理函数
	 * @author:zhouyu
	 * 
	 */
	mmcalHandler: function(){
		var me = this;
		return function(value, index){
			//var value = me.controlMap["mmcal"].getValue();
			if(value != 6){	//硬编码 6代表所有时间
				me.isAllTime = false;
			}
			me.value = value;
			me.relativeValue = index;
			me.repaintMain();
			me.hideLayer();
			me.onselect(baidu.object.clone(value));
			//快捷方式的响应函数在后面执行，实现对外部暴露点选日期和点选快捷方式的区别
			me.onminiselect(index);
		};
	},
    
    /**
     * 获取取消按钮的点击handler
     * 
     * @private
     * @return {Function}
     */
    getCancelHandler: function () {
        var me = this;
        return function () {
            me.hideLayer();
        };
    },
    
    /**
     * 获取确定按钮的点击handler
     * 
     * @private
     * @return {Function}
     */
    getOkHandler: function () {
        var me = this,
            parse = baidu.date.parse;
            
        function getValue(type) {
            return  me.controlMap[type].getValue();
        }
        
        return function () {
			
			if(me.isAllTime){
				me.isAllTime = false;
			}
			
            var begin = getValue('begin'),
                end = getValue('end'),
                dvalue = end - begin, 
                value;

            if (dvalue > 0) {
                value = {
                    'begin': begin,
                    'end': end
                };
            } else {
                value = {
                    'begin': end,
                    'end': begin
                };
            }

            if (me.ruleCheck(value) !== false) {
                me.value = value;
				me.relativeValue = false;
				me.controlMap["mmcal"].value = value;
                me.repaintMain();
                me.hideLayer();
				me.onselect(baidu.object.clone(value));
            }
        };
    },
    
	/**
	 * 判断选择时间是否不符合规则
	 * @param {Object} value 选择的时间
	 * @author zhouyu
	 */
    ruleCheck: function(value){
		var begin = value["begin"], end = value["end"],
			tmp = new Date(nirvana.env.SERVER_TIME * 1000);
		
		tmp.setFullYear(begin.getFullYear() + 1);
		tmp.setMonth(begin.getMonth());
		tmp.setDate(begin.getDate() - 1);
		
		if (tmp < end) {
			baidu.g(this.getId("tip")).innerHTML = "时间选择跨度不能超过一年";
			return false;
		}
		else {
			baidu.g(this.getId("tip")).innerHTML = "";
			return true;
		}
	},
    /**
     * 选择日期范围后点击确定或者点击快捷日期范围链接（e.g. 所有时间, 上周, etc.）触发的事件
     * @event onselect
     * @param {Object} value 其数据结构为 {begin: [Date], end: [Date]}
     */
	onselect: new Function(),
    /**
     * 点击快捷日期范围链接（e.g. 所有时间, 上周, etc.）触发的事件
     * @event onminiselect
     * @param {Number} index 选择的快捷日期范围索引，具体索引代表含义：
     * 0: 昨天 | 1: 最近7天 | 2: 上周 | 3: 本月 | 4: 上个月 | 5: 上个季度 | 6: 所有时间 | 7: 最近14天
     */
	//快捷方式被选中时的响应函数
	onminiselect : new Function(),
    
    /**
     * 获取日历选择的事件handler
     * 
     * @private
     * @return {Function}
     */
    getSelectHandler: function (type) {
        var me = this;
        return function (date) {
            me.view[type] = date;
            me.repaintSideTime(type);
        };
    },
	
	
	/**
	 * 填充时间提示
	 * @param {Object} type begin||end
	 * author zhouyu
	 */
	repaintSideTime: function(type){
		var me = this,
			viewDate = me.view[type], 
			year = viewDate.getFullYear(), 
			month = viewDate.getMonth() + 1, 
			date = viewDate.getDate(),
			sidetime = baidu.g(me.getId(type + "sidetime")),
			html = [];
		if (sidetime) {
			if (!baidu.dom.hasClass(sidetime, me.getClass("side_time"))) {
				baidu.addClass(sidetime, me.getClass("side_time"));
			}
			html[html.length] = year + "年";
			if(month < 10){
				html[html.length] = "0";
			}
			html[html.length] = month + "月";
			if(date < 10){
				html[html.length] = "0";
			}
			html[html.length] = date + "日";
			sidetime.innerHTML = html.join("");
		}
	},
	
	/**
	 * 如果当月没有某个日期，则设置为当月最后一天
	 * @param {Object} year
	 * @param {Object} month
	 * @param {Object} date
	 * @author zhouyu
	 */
	setTime: function(year,month,date){
		var nextMonth = new Date(year, month + 1, 1),
			current = new Date(year, month, date);
		if(current >= nextMonth){
			current.setDate(nextMonth.getDate() - 1);
		}
		return current;
	},
	
	
	/**
     * 事件handler
     * @param {Object} type 侧边栏类型，begin|end
     * @author zhouyu
     */
    getYearChangeHandler: function(type, oldyear, newyear){
		var me = this;
		var monthes = [], 
			start = 1,
			end = 12, 
			selection = null,
			oldyear = (+oldyear == 0) ? 0 : (+oldyear),
			newyear = (+newyear == 0) ? 0 : (+newyear);
		if (oldyear != newyear) {
			if (newyear == me.endYear) {
				start = 1;
				end = me.endMonth;
			}
			else 
				if (newyear == me.startYear) {
					start = me.startMonth;
					end = 12;
				}
			//new added
			if(me.startYear == me.endYear) {
				start = me.startMonth;
				end = me.endMonth;
			} 
			
			for (var i = start; i <= end; i++) {
				monthes.push({
					text: i,
					value: i - 1
				});
			}
			if (type == "begin") {
				selection = me.controlMap["monthselbegin"];
			}
			else 
				if (type == "end") {
					selection = me.controlMap["monthselend"];
				}
			if (selection) {
				var month = me.view[type].getMonth();
				selection.fill(monthes);
				if (month > start - 2 && month < end) {
					selection.setValue(month);
				}else{
					month = selection.getValue(0);
				}
				me.view[type] = me.setTime(newyear,month,me.view[type].getDate());
		//		me.repaintSideTime(type);
				me.repaintSide(type);
			}
		}
	},
    
    /**
     * 年份选择事件handler
     * @param {Object} type 侧边栏类型，begin|end
     * @author zhouyu
     */
    getYearSelectHandler: function (type) {
        var me  = this;
        
        return function () {
			var viewDate = me.view[type],
				month = viewDate.getMonth(),
				date = viewDate.getDate(),
				oldyear = viewDate.getFullYear(),
				selection = null;
			if(type == "begin"){
				selection = me.controlMap["yearselbegin"];
			}else if(type == "end"){
				selection = me.controlMap["yearselend"];
			}
            var year = selection.getValue();
			me.view[type] = me.setTime(year,month,date);
			me.getYearChangeHandler(type,oldyear,year);
			me.repaintSide(type);
		};
    },
    
	/**
	 * 月份选择事件handler
	 * @param {Object} type 侧边栏类型，begin|end
     * @author zhouyu
	 */
    getMonthSelectHandler: function (type) {
        var me = this;
        
        return function () {
			var viewDate = me.view[type],
				year = viewDate.getFullYear(),
				date = viewDate.getDate(),
				selection = null;
			if(type == "begin"){
				selection = me.controlMap["monthselbegin"];
			}else if(type == "end"){
				selection = me.controlMap["monthselend"];
			}
            var month = selection.getValue();
			me.view[type] = me.setTime(year,month,date);
			me.repaintSide(type);
		};
    },
    
    /**
     * 重新绘制main区域
     * 
     * @private
     */
    repaintMain: function () {
        baidu.g(this.getId(this.show)).innerHTML = this.getValueText();
    },
    
    /**
     * 重新绘制浮动层侧边栏的显示内容
     * 
     * @private
     * @param {string} type 侧边栏类型，begin|end
     */
    repaintSide: function (type) {
        var me = this,
            viewDate = me.view[type],
            year  = viewDate.getFullYear(),
            month = viewDate.getMonth(),
	//		date = viewDate.getDate(),
    //      value = me.value[type],
            cal   = me.controlMap[type];
    //      idPrefix = me.getId('mPrefix') + type,
    //      mactiveClass = me.getClass('mactive'),
	//		sidetime = baidu.g(me.getId(type + "sidetime")),
    //      td;
        
        // 绘制输入框的内容
        //me.getInput(type).value = baidu.date.format(value, me.dateFormat);
        
        // 绘制年份    
        //baidu.g(me.getId(type + 'Yinfo')).innerHTML = year + '年';
		
		//设置小箭头状态
		me.setArrowDisable(year, month, "prev", type);
		me.setArrowDisable(year, month, "next", type);
      
        // 绘制导航
        me.repaintNav(type, year, month);
		
		//填充时间提示
		me.repaintSideTime(type);
		
        // 绘制日历部件 zhouyu
        cal.value = viewDate;
        cal.setView(viewDate);
    },
    

    /**
     * 绘制控件
     * @method render
     * @public
     * @param {HTMLElement} main 控件挂载的元素, 必须是DIV元素
     */
    render: function (main) {
        var me = this;
        if (main && main.tagName != 'DIV') {
            return;
        }
        ui.Base.render.call(me, main, true);
        me.main.innerHTML = me.getMainHtml(me.show);
        me.renderLayer();
    },
    /**
     * 重新绘制控件，实现上重新调用render方法
     * @method repaint
     */
	repaint : function(){
		var me = this;
		me.render(me.main);
	},
	
    /**
     * 获取控件的html
     * 
     * @private
     * @param {HTMLElement} show 普通日历"normal"or表单日历"form"
     * @return {string}
     * @modify by zhouyu
     */
    getMainHtml: function (show) {
        var me = this;
        return ui.format(me.tplMain,
                            me.getId(show),
                            me.getClass(show),
                            me.getValueText(),
                            me.getClass(show + '_point'));
    },
    
    /**
     * 绘制浮动层
     * 
     * @private
     */
    renderLayer: function () {
        var me = this,
            layerId = me.getId('layer'),
            layer = baidu.g(layerId),
            value = me.value,
            begin = value.begin,
            end = value.end,
            foot, btn;
        
        if (layer) {
            me.repaintLayer();
            return;
        }
        // 初始化浮动层div属性
        layer = document.createElement('div');
        layer.className = me.getClass('layer');
        layer.id = layerId;
        layer.style.left = me.offsetSize;
        layer.style.top = me.offsetSize;
        layer.setAttribute('control', me.id);
        
        layer.innerHTML = ui.format(me.tplLayer,
            me.getClass('body'),
            me.getLayerSideHtml('begin', begin),
            me.getLayerSideHtml('end', end),
            me.getId('foot'),
            me.getClass('foot'),
			me.getId("head"),
			me.getId("close"),
			me.getClass("close")
			);
            
        // 将浮动层+到页面中
        document.body.appendChild(layer);
		
		//绘制浮动层的快捷键
		me.controlMap["mmcal"].render(baidu.g(me.getId("head")));

        // 绘制浮动层内的日历部件
        me.renderMonthView();
        
        // 绘制浮动层腿部的按钮
        foot = baidu.g(me.getId('foot'));
        function renderBtn(type) {
            btn = document.createElement('div');
            btn.innerHTML = me[type + 'Str'];
            foot.appendChild(btn);
            me.controlMap[type].render(btn);
        }
        renderBtn('ok');
        renderBtn('cancel');
        var tip = document.createElement('div');
        tip.id = me.getId("tip");
		baidu.addClass(tip,me.getClass("tip"));
        foot.appendChild(tip);
        //绘制浮动出层的年选择和月选择
        
        me.renderSelection();
        
        // 挂载浮动层的全局点击关闭
        me.layerController = me.getLayerController();
        baidu.on(document, 'click', me.layerController);
    },
    
    
    renderSelection : function () {
        var me = this,
            begin = me.value.begin, 
			begin = begin == "" ? new Date(nirvana.env.SERVER_TIME * 1000) : begin,
            end = me.value.end,
			end = end == "" ? new Date(nirvana.env.SERVER_TIME * 1000) : end,
            beginYear = begin.getFullYear(),
            beginMonth = begin.getMonth(),
            endYear = end.getFullYear(),
            endMonth = end.getMonth(),
            yearSelBegin, monthSelBegin,
            yearSelEnd, monthSelEnd,
			oldBeginYear = me.controlMap.yearselbegin.getValue(),
			oldEndYear = me.controlMap.yearselend.getValue();
            
        yearSelBegin = baidu.g(me.getId('yearselbegin'));
        monthSelBegin = baidu.g(me.getId('monthselbegin'));
        yearSelEnd = baidu.g(me.getId('yearselend'));
        monthSelEnd = baidu.g(me.getId('monthselend'));
        
        
        
        me.controlMap.yearselbegin.render(yearSelBegin);
        me.controlMap.monthselbegin.render(monthSelBegin);
        me.controlMap.yearselend.render(yearSelEnd);
        me.controlMap.monthselend.render(monthSelEnd);
        
        
        me.controlMap.yearselbegin.setValue(beginYear);
		me.getYearChangeHandler("begin",oldBeginYear,beginYear);
        me.controlMap.monthselbegin.setValue(beginMonth);
        me.controlMap.yearselend.setValue(endYear);
		me.getYearChangeHandler("end",oldEndYear,endYear);
        me.controlMap.monthselend.setValue(endMonth);
    },
    
    repaintNav : function (type, year, month) {
        var me = this;
		var oldyear = me.controlMap['yearsel' + type].getValue();
        me.controlMap['yearsel' + type].setValue(year);
		me.getYearChangeHandler(type,oldyear,year);
        me.controlMap['monthsel' + type].setValue(month);   
    },
    /**
     * 获取浮动层侧边栏的html
     * 
     * @private
     * @param {string} type 侧边栏类型，begin|end
     * @param {Date} date 要显示的日期
     * @return {string}
     */
    getLayerSideHtml: function (type, date) {
        var me = this,
            month = date.getMonth(),
            year = date.getFullYear(),
            valueStr = baidu.date.format(date, me.dateFormat),
			title;
		if (type == "begin") {
			title = me.beginSideTitle;
		}
		else {
			title = me.endSideTitle;
		}
        return ui.format(me.tplSide, 
                            me.getClass('time_body'),
                            me.getClass('show_time'),
                            me.getClass('side_title'),
                            title,
                            me.getId(type + "sidetime"),
                            me.getId(type + 'Month'),
                            me.getClass('month'),
                            me.getNavHtml(type, month),
                            me.getId(type + 'Cal'),
							me.getClass(type))
    },
    
    /**
     * 获取浮动层中月份显示区域的html
     * 
     * @private
     * @param {string} type 侧边栏类型，begin|end
     * @param {string} month 要显示的月份
     * @return {string}
     */
    getNavHtml: function (type, year, month) {
        var me = this,
            html = ['<table cellpadding="0" cellspacing="0" border="0"><tr>'],
            unit = 'month';

        
        html.push('<td class="' + me.getClass('prev-td') + '">' 
                        + me.getArrowHtml(type, unit, 'prev') + '</td>',
                    me.dealYearItems(type),
                    me.dealMonthItems(type),
                    '<td class="' + me.getClass('next-td') + '">' 
                        + me.getArrowHtml(type, unit, 'next') + '</td>',
                    '</tr></table>');
        return html.join('');
    },
    dealYearItems: function (type) {
        var me = this;
        return ui.format(
            me.tplSelect,
            me.getClass('yearsel'),
            me.getId('yearsel' + type)
        );
    },
    /**
     * 处理月份选择单元的显示
     * 
     * @private
     * @param {string} type 侧边栏类型，begin|end
     * @param {string} month 要显示的月份
     * @param {string} re 需要返回html or 直接渲染
     * @return {string}
     */
    dealMonthItems: function (type, month, re) {
        var me = this;
        return ui.format(
            me.tplSelect,
            me.getClass('monthsel'),
            me.getId('monthsel' + type)
        );
    },
    

    /**
     * 获取月份或年份的小箭头的html
     * 
     * @private
     * @param {string} type 侧边栏类型，begin|end
     * @param {string} unit 箭头所属单元，year|month
     * @param {string} prevOrNext 箭头表示的前进或后退
     * @return {string}
     */
    getArrowHtml: function (type, unit, prevOrNext) {
        return ui.format('<span class="{0}" id={1} onclick="{2}"></span>',
                            this.getClass(prevOrNext),
							this.getId(type + prevOrNext),
                            this.getStrCall('changeView', type, unit, prevOrNext));
    },
    
    /**
     * 改变浮动层view显示的日期
     * 
     * @private
     * @param {string} type 侧边栏类型，begin|end
     * @param {string} unit 箭头所属单元，year|month
     * @param {string} prevOrNext 箭头表示的前进或后退
     */
    changeView: function (type, unit, prevOrNext) {
        var me = this,
            viewDate = me.view[type],
            year = viewDate.getFullYear(),
            month = viewDate.getMonth(),
			date = viewDate.getDate(),
			logParams = {};
		if (!me.checkArrowDisable(year, month, prevOrNext)) {
			if (unit == 'month') {
				if (prevOrNext == 'prev') {
					month--;
				}
				else {
					month++;
				}
			}
			else {
				if (prevOrNext == 'prev') {
					year--;
					
				}
				else {
					year++;
					
				}
			}
			me.view[type] = me.setTime(year,month,date);
		//	me.repaintNav(type, year, month);
			me.repaintSide(type);
			
			logParams.target = baidu.string.toCamelCase(prevOrNext + "_" + type + "_" + unit) + "_" + me.type + "_btn";
			NIRVANA_LOG.send(logParams);
		}
    },
	
	
	/**
	 * 检查当前年月是否到达边界值
	 * @param {Object} year
	 * @param {Object} month
	 * @param {Object} prevOrNext  左边界or右边界
	 * @author zhouyu
	 */
	checkArrowDisable: function(year,month,prevOrNext){
		var me = this;
		if (prevOrNext == 'prev'){
			if(year < me.startYear || year == me.startYear && month <= me.startMonth - 1){
				return true;
			}
		} else {
		//	var now = new Date(),
		//		nowYear = now.getFullYear(),
		//		nowMonth = now.getMonth();
				
			if (year > me.endYear || year == me.endYear && month >= me.endMonth - 1) {
				return true;
			}
		}
		return false;
	},
	
	
	/**
	 * 设置小箭头的可点状态
	 * @param {Object} year
	 * @param {Object} month
	 * @param {Object} prevOrNext
	 * @param {Object} type
	 * @author zhouyu
	 */
	setArrowDisable: function(year,month,prevOrNext,type){
		var me = this,
			id = me.getId(type + prevOrNext),
			target = baidu.g(id),
			classname = me.getClass(prevOrNext + "_disable");
		if (me.checkArrowDisable(year, month, prevOrNext)) {
			if(!baidu.dom.hasClass(target, classname)){
				baidu.addClass(target, classname);
			}
		}else{
			if(baidu.dom.hasClass(target, classname)){
				baidu.removeClass(target, classname);
			}
		}
	},
	
    
    /**
     * 获取侧边栏头部的html
     * 
     * @private
     * @param {string} type 侧边栏类型，begin|end
     * @param {string} value 日期输入框的值
     * @return {string}
     */
    getSideHeadHtml: function (type, value) {
        var me = this;
        return ui.format(me.tplSideHead,
                            me[type + 'SideTitle'],
                            me.getId(type + 'Input'),
                            value,
                            me.getClass('input'),
                            me.getClass('label'));
    },
    
    /**
     * 获取浮动层关闭器
     * 
     * @private
     * @return {Function}
     */
    getLayerController: function () {
        var me = this;
		return function (e) {
            e = e || window.event;
            var tar = e.target || e.srcElement;
			var control,
				logParams = {};
			var yearselbegin = me.controlMap['yearselbegin'],
				monthselbegin = me.controlMap['monthselbegin'],
				yearselend = me.controlMap['yearselend'],
				monthselend = me.controlMap['monthselend'];
            
            while (tar && tar.nodeType === 1) {
				control = tar.getAttribute('control');
                if (control == me.id) {
					if (tar.id != me.getId('layer')) {
						me.toggleLayer();
						logParams.target = baidu.string.toCamelCase(me.id + "_main") + "_" + me.type + "_btn";
						NIRVANA_LOG.send(logParams);
					}
					return;
				}
				else 
					if (control == yearselbegin.id || 
						control == monthselbegin.id || 
						control == yearselend.id || 
						control == monthselend.id) {
						return;
					}
				if(tar == baidu.g(me.getId("close"))){
					me.hideLayer();
					logParams.target = baidu.string.toCamelCase("close_" + me.id + "_layer") + "_" + me.type + "_btn";
					NIRVANA_LOG.send(logParams);
					return;
				}
                tar = tar.parentNode;
            }
            me.hideLayer();
        };
    },
    
    /**
     * 显示|隐藏 浮动层
     * 
     * @private
     */
    toggleLayer: function () {
        var me = this;
        if (this.getLayer().style.left != this.offsetSize) {
            me.hideLayer();
        } else {
            me.showLayer();
        }
    },
    
    /**
     * 隐藏浮动层
     * 
     * @private
     */
    hideLayer: function () {
        this.getLayer().style.left = this.offsetSize;
        this.getLayer().style.top = this.offsetSize;
        this.removeState('active');
    },
    
    /**
     * 显示浮动层
     * 
     * @private
     */
    showLayer: function () {
        var me = this,
            main = me.main,
            pos = baidu.dom.getPosition(main),
            pageWidth = document.documentElement.clientWidth,//baidu.page.getWidth(), modify by linfeng
            layer = me.getLayer(),
            value = me.value,
            layerLeft;
        
        // 更新浮动层显示的日期
		if (value.begin == "" && value.end == "") {
			var today = {
				"begin": new Date(nirvana.env.SERVER_TIME * 1000),
				"end": new Date(nirvana.env.SERVER_TIME * 1000)
			};
			me.controlMap["mmcal"].value = today;
			me.view = today;
		}
		else {
			me.view = {
				'begin': value.begin,
				'end': value.end
			};
		}
		
        me.controlMap["mmcal"].render(baidu.g(me.getId("head")));
        me.repaintLayer();
        if (pageWidth < (pos.left + layer.offsetWidth)) {
            layerLeft = pos.left + main.offsetWidth - layer.offsetWidth + 'px';
        } else {
            layerLeft = pos.left + 'px';
        }
        layer.style.left = layerLeft;
        layer.style.top = pos.top + main.offsetHeight + 'px';
        this.setState('active');
    },
    
    /**
     * 获取浮动层元素
     * 
     * @private
     * @return {HTMLElement}
     */
    getLayer: function () {
        return baidu.g(this.getId('layer'));
    },
	
    /**
     * 重新绘制layer
     * 
     * @private
     */
    repaintLayer: function () {  
	    var me = this;
		if (me.layerController){
			baidu.un(document, 'click', me.layerController);	
		}
		me.layerController = me.getLayerController();
		baidu.on(document, 'click', me.layerController);
		//重新绘制快捷方式
		me.controlMap["mmcal"].value = me.value;
        me.controlMap["mmcal"].render(baidu.g(me.getId("head")));
		
		this.renderSelection();	
        this.repaintSide('begin');
        this.repaintSide('end');
    },
    
    /**
     * 绘制浮动层内的日历部件
     * 
     * @private
     */
    renderMonthView: function () {
        var me = this,
            view = me.view,
            begin = me.controlMap['begin'],
            end = me.controlMap['end'];
        
        // 设置左右日历部件的显示
        begin.setView(view.begin);
        end.setView(view.end);

        // 重新绘制日历部件
        begin.appendTo(baidu.g(me.getId('beginCal')));
        end.appendTo(baidu.g(me.getId('endCal')));
    },

    /**
     * 获取当前选中日期区间的显示字符
     * 
     * @private
     * @return {string}
     */
    getValueText: function () {
        var value = this.getValue(),
            begin = value.begin,
            end   = value.end,
            format    = this.dateFormat,
            formatter = baidu.date.format;
		if(this.isAllTime){
			value = {
				begin:"",
				end:""
			};
		}
		var miniOpt = nirvana.util.dateOptionToDateText(value, this.miniDateOption);
  		if(miniOpt){
			return miniOpt;
		}
        if (begin && end) {
            return formatter(begin, format) 
                    + " 至 " 
                    + formatter(end, format);
        }
        
    //    return '所有时间';
    },
    
    /**
     * 获取当前选取的日期时间段
     * @method getValue
     * @public
     * @return {Object} value 选择的日期时间区间对象，结构为{begin: [Date], end: [Date]}
     */
    getValue: function () {
        return this.value;
    },
    
    /**
     * 设置当前选取的日期时间段，会触发日期选择输入框当前选择值重新渲染
     * @method setValue
     * @public
     * @param {Object} date 选取的日期区间，其结构为{begin: [Date], end: [Date]}
     */
    setValue: function (date) {
        if (date && date.begin && date.end) {
            this.value = date;
            this.repaintMain();
        }
    },
	
	/**
     * 设置可选的日期范围，会触发控件重新渲染
     * @method setAvailableRange
     * @public
     * @param {Object} date 可选取的日期范围，其结构定义如下
     * {
	 *    begin: [Date] [REQUIRED] 可以选择的开始日期
	 *    end:   [Date] [REQUIRED] 可以选择的结束日期
	 * }
     */
    setAvailableRange: function (date) {
		var me = this;
        if (date && date.begin && date.end) {
            me.availableRange = date;
			
			me.startYear = date.begin.getFullYear();
			me.endYear = date.end.getFullYear();
			me.startMonth = date.begin.getMonth() + 1;
			me.endMonth = date.end.getMonth() + 1;
			
		    me.yearData = (function(start,end){
		        var years = [];
		        for(var i = start; i <= end; i++){
		            years.push({text:i, value:i});
		        }
		        return years;
		    })(me.startYear,me.endYear);
			
		   me.monthData = (function(start,end){
		        var monthes = [];
		        for(var i = start; i <= end; i++){
		            monthes.push({text:i, value:i-1});
		        }
		        return monthes;
		    })(1,12);
				
			me.controlMap.begin.setAvailableRange(date);
			me.controlMap.begin.render();
			me.controlMap.end.setAvailableRange(date);
			me.controlMap.end.render();
			me.controlMap.yearselbegin.fill(me.yearData);
			me.controlMap.monthselbegin.fill(me.monthData);
			me.controlMap.yearselend.fill(me.yearData);
			me.controlMap.monthselend.fill(me.monthData);
            this.repaintMain();
        }		
    },
	
	/**
	 * 设置控件可用状态
	 * @method disable
	 * @param {Boolean} diaabled 控件是否被禁用
	 */
	disable: function(diaabled){
		var me = this;
		if(diaabled){
			baidu.addClass(me.main, me.getClass("disabled"));
			baidu.un(document, 'click', this.layerController);
			me.disabled = true;
		}else{
			baidu.removeClass(me.main, me.getClass("disabled"));
			baidu.on(document, 'click', this.layerController);
			me.disabled = false;
		}
	},
    
    /**
     * 释放控件
     * @method dispose
     * @protected
     */
    dispose: function () {
        ui.Base.dispose.call(this);
        
        document.body.removeChild(baidu.g(this.getId('layer')));
		
		if(!this.disabled){
       		baidu.un(document, 'click', this.layerController);
		}
    }
};

ui.Base.derive(ui.MultiCalendar);
