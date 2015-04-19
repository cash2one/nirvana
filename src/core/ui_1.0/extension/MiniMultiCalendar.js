/*
 * cb-web
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/MiniMultiCalendar.js
 * desc:    小型多日期选择器
 * author:  zhaolei,erik
 * date:    $Date: 2010/05/24 10:39:01 $
 */

/**
 * 快捷日期时间段选择器，多日期选择器
 * 
 * @class MiniMultiCalendar
 * @namespace ui
 * @extends ui.Base
 * @constructor
 * @param {Object} options 控件初始化参数
 * <pre>
 * 参数配置定义如下：
 * {
 *   id:         [String], [REQUIRED] 控件ID
 *   now:        [Date],   [OPTIONAL] 当前时间，用于计算快捷日期时间段，默认服务器端时间
 *   value:      [Object], [OPTIONAL] 当前选择日期时间段，其结构为{begin: [Date], end: [Date]}，
 *                                    默认其值由now属性值决定，begin和end值等于now值，只有其值等于某个
 *                                    快捷类别的时间段，该类别才会被选中
 *   miniOption: [Array],  [REQUIRED] 要显示的快捷日期时间段选择类别，数组元素为类别的数字索引，当前支持如下几种：
 *                                    0: 昨天 | 1: 最近7天 | 2: 上周 | 3: 本月 | 4: 上个月 | 
 *                                    5: 上个季度 | 6: 所有时间 | 7: 最近14天
 * }
 * </pre>
 */
ui.MiniMultiCalendar = function (options) {
    this.initOptions(options);
    
    // 类型声明，用于生成控件子dom的id和class
    this.type = 'mmcal';
    
    this.now = this.now || new Date(nirvana.env.SERVER_TIME * 1000);
    
    // 初始化当前日期
    this.value = this.value || {
        begin: this.now,
        end: this.now
    };
	
};

ui.MiniMultiCalendar.prototype = {
    /**
     * 比较两个日期是否同一天
     * 
     * @private
     * @param {Date} date1 日期
     * @param {Date} date2 日期
     * @return {boolean}
     */
    isSameDate: function (date1, date2) {
		//所有时间，有时传入今天的时间，有时传入空字符串，需统一转化后进行比较
		date1 = date1.toString() == (new Date(nirvana.env.SERVER_TIME * 1000)).toString() ? "" : date1;
		date2 = date2.toString() == (new Date(nirvana.env.SERVER_TIME * 1000)).toString() ? "" : date2;
		if (date2 != "" && date1 != "") {
			if (date1.getFullYear() == date2.getFullYear() &&
			date1.getMonth() == date2.getMonth() &&
			date1.getDate() == date2.getDate()) {
				return true;
			}
		}else{
			if(date1 == "" && date2 == ""){
				return true;
			}
		}
        return false;
    },
    
    /**
     * 日期区间选项列表
     * 
     * @private
     */
    optionList: nirvana.config.dateOption,
    
    /**
     * 设置optionList
     * @method setOptionList
     * @public
     */
    setMiniDateOption: function(option) {
        option && (this.optionList = option);
    },

    /**
     * 获取选中的日期区间
     * @method getValue
     * @public
     * @return {Object} 选择的日期时间段，其结构为{begin: [Date], end: [Date]}
     */
    getValue: function () {
        return this.value;
    },
    
    /**
     * 绘制控件
     * @method render
     * @public
     * @param {HTMLElement} main 控件元素,必须是DIV元素
     */
    render: function (main) {
        var me = this;
        if (main && main.tagName != 'DIV') {
            return;
        }
        
        ui.Base.render.call(me, main);
        me.main.innerHTML = me.getHtml();
		me.main.onclick = me.onclick;
    },
    
    /**
     * 获取控件的html
     * 
     * @private
     * @return {string}
     */
    getHtml: function () {
        var me = this,
            value = me.value,
            opList = me.optionList,
            len = opList.length, i, opValue, option,
            idPrefix = me.getId('option'), clazz, callStr,
            html = [];
       	
		//支持用户配置快捷方式个数和显示顺序
	    for (var j = 0, l = me.miniOption.length || 0; j < l; j++){
			for (i = 0; i < len; i++) {
				if (opList[i].optionIdx == me.miniOption[j]){
					option = opList[i];
		            opValue = option.getValue.call(me);
					clazz = me.getClass('option');
		            callStr = ' onclick="' + me.getStrCall("_selectIndex", i) + '"';
					
		            if (me.isSameDate(value.begin, opValue.begin)
		                && me.isSameDate(value.end, opValue.end)) {
		                clazz = clazz + ' ' + me.getClass('option_selected');
		                callStr = '';
		            }
		            
		            html.push(
		                ui.format(me.itemTpl,
		                    i,
		                    clazz,
		                    idPrefix + i,
		                    option.text,
		                    callStr));
					break;
				}
			}			
		}  
        return html.join('&nbsp;|&nbsp;');
    },
    
    itemTpl: '<span index="{0}" class="{1}" id="{2}"{4}>{3}</span>',
    /**
     * 选择快捷日期时间段触发的事件
     * @event onselect
     * @param {Object} value 选择的快捷日期时间段多对应的时间段值，结构为{begin: [Date], end: [Date]}
     * @param {Number} index 所选择的快捷日期时间段所对应的索引，索引含义见控件初始化参数说明
     * @return {Boolean} 如果该快捷方式不允许选择，返回false
     */
    onselect: new Function(),
	/**
	 * 控件被点击触发的事件
	 * @event onclick 
	 * @param {Object} e 浏览器事件对象，是否传递该参数由浏览器决定，这里不做任何处理
	 */
	onclick: new Function(),
    
    /**
     * 根据索引选取日期
     * 
     * @private
     * @param {number} index 所选择的快捷日期时间段所对应的索引，索引含义见控件初始化参数说明
     */
    _selectIndex: function (index) {
		var me = this;
        var opList = me.optionList, value, text, logParams = {};
        if (index < 0 || index >= opList.length) {
            return;
        }
        
        value = opList[index].getValue.call(this);
		logParams.target = baidu.string.toCamelCase(this.id + "_index" + index) + "_" + this.type + "_lbl";
		logParams.value = nirvana.util.dateOptionToDateText(value, me.optionList);
		logParams.index = index;
		NIRVANA_LOG.send(logParams);
		
        if (me.onselect(value, index) !== false) {
            me.select(value);
        }
    },
	/**
	 * 获取快捷日期选择索引所对应的DOM元素
	 * @method getOption
	 * @param {Number} index 
	 */
	getOption: function(index){
		return baidu.g(this.getId('option') + index);
	},
    
    /**
     * 选取快捷的日期区间，该方法触发控件重新渲染
     * @method select
     * @public
     * @param {Object} value 日期区间对象，其值必须等于所要选择的类别计算出来的日期区间值，才会被选中
     */
    select: function (value) {
        this.value = value;
        this.render();
    }
};

ui.Base.derive(ui.MiniMultiCalendar);
