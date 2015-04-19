/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/Schedule.js
 * desc:    推广时段控件
 * author:  chenjincai
 * date:    $Date: 2010/12/09 $
 */
 
/**
 * 推广时段控件
 * 
 * @class Schedule
 * @namespace ui
 * @extends ui.Base
 * @constructor
 * @param {Object} options 控件初始化参数
 * <pre>
 * 参数配置定义如下：
 * {
 *     value: [Array],             二维数组7*24(7天*24小时).
 *                                 如果要指定周几某一小时是推广时段设置其值为1：value[dayOfWeek][dayOfHour] = 1;
 *                                 如果要指定周几某一小时是建议的推广时段设置其值为2：value[dayOfWeek][dayOfHour] = 2;
 *                                 默认7*24都是投放时段, dayOfWeek的取值范围: [0,6], dayOfHour的取值范围: [0,23]
 *     showRecommed: [Boolean], 是否显示推荐时段功能，默认true                             
 *     suggestAsChosen: [Boolean], 是否对推荐的时段作为选择的推广时段，默认false; 如果true,通过{{#crossLink "ui.Schedule/getParamObj"}}{{/crossLink}}获取的未推广时段将不包括推荐时段
 * }
 * </pre>
 */
ui.Schedule = function (options) {
	// added by wuhuiyao
	// 标识是否提供推荐时段功能
	this.showRecommed = true;
	
    // 初始化参数
    this.initOptions(options);
    
    // 类型声明，用于生成控件子dom的id和class
    this.type = 'schedule';
    //以下尺寸单位均为px
    
}


ui.Schedule.prototype = {
    /**
     * 时间选择功能
     */

    /**
     * 检测用户选择的值是否合法.
     * FIX BUG #856
     *
     * @private
     * @param {Array.<*>} value 控件的值.
     * @param {string} modName 模块的类型，例如region, resolution之类的.
     * @param {ui.Orientation} control 当前控件的实例.
     *
     * @return {boolean} true -> 合法，false -> 非法
     */
    validate : function(value, me){
        for(var i = 0; i < 7; i ++){
            for(var j = 0; j < 24; j ++){
                if(value[i][j] != 0){
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * 时间选择模块初始化器
     * 
     * @method render
     * @private
     * @param {HTMLElement} main 控件挂载的dom元素
     */
    render: function (main) {
        var me = this,
            idPrefix = 'SelectorDate', 

            modValue = me.value,
            defaultValue = [],
            lineValue, i, j;
        
        // 初始化视图的值
        if (!modValue) {
            for (i = 0; i < 7; i++) {
                lineValue = [];
                defaultValue.push(lineValue);
                
                for (j = 0; j < 24; j++) {
                    lineValue.push(0);// Modified by Wu huiyao将其默认值该为0
                }
            }
            
            me.value = defaultValue;
        }
        main.innerHTML = ui.format(
                            er.template.get('UIOrientSelectorWeektime'),
                            me.getId('WeektimeBody'),
                            me.getId('WeektimeCount'),
                            me.getStrCall('selSelectAllTime'),
                            me.getStrCall('selSelectWorkTime'),
                            me.getStrCall('selSelectWeekendTime'),
                            // added by wuhuiyao
                            me.getStrRef() + '.toggleSelRecommedTime(this)');
        
        // added by wuhuiyao
        main.id = me.getId();
        
        var recmdElem = $$("#" + me.getId() + " .ui_schedule_sel_recmd")[0],
            wttimeElem = $$("#" + me.getId() + " .ui_schedule_sel_wttime")[0],
            egtextElem = $$("#" + me.getId() + " .ui_schedule_sel_wt_egtext")[0];
            
        if(this.showRecommed){
			//显示推荐时段
			recmdElem && baidu.show(recmdElem);
			wttimeElem && baidu.show(wttimeElem);
			egtextElem && baidu.show(egtextElem);
		}else{
			//隐藏推荐时段
			recmdElem && baidu.hide(recmdElem);
			wttimeElem && baidu.hide(wttimeElem);
			egtextElem && baidu.hide(egtextElem);
		}
		// added end 
		
        me.initWeektimeBody(me);
    },
    
    /**
     * 初始化weektime选择器主体视图
     * 
     * 
     */
    initWeektimeBody: function () {
        var me = this,
            html = [],
            dayWords = ['一','二','三','四','五','六','日'],
            ctrlRef = me.getStrRef(),
            line, cbid,
            i, j,
            tplPrefix = 'UIOrientSelectorWt',
            timeTpl = er.template.get(tplPrefix + 'Time'),
            headTimeTpl = er.template.get(tplPrefix + 'HeadTime'),
            lineBeginTpl = er.template.get(tplPrefix + 'LineBegin'),
            lineMidTpl = er.template.get(tplPrefix + 'LineMid'),
            lineEndTpl = er.template.get(tplPrefix + 'LineEnd');
       
       
        // 拼装html：头部time列表 
        html.push('<div class="ui_schedule_sel_wtbodyline" id="' 
                      + me.getId('WeektimeHead') + '">'
                      + '<div class="ui_schedule_sel_wtday">&nbsp;'
                      + lineMidTpl);
        for (j = 0; j < 24; j++) {
            if (j > 0 && j % 6 == 0) {
                html.push(lineMidTpl);
            }
            html.push(
                ui.format(
                    headTimeTpl,
                    me.getId('SelWTTimeHead' + j),
                    j,
                    ctrlRef + '.selTimeHeadOverOut(this,1)',
                    ctrlRef + '.selTimeHeadOverOut(this)',
                    ctrlRef + ".selSelectTimes(this)"
                    ));
        }
        html.push(lineEndTpl);
        
        // 拼装html：时间体列表 
        for (i = 0; i < 7; i++) {
            cbid = me.getId('SelWTtimeDayCheckbox' + i);
            html.push(
                ui.format(
                    lineBeginTpl,
                    me.getId('SelWTtimeDayLine' + i),
                    cbid,
                    i,
                    ctrlRef + '.selSelectTimeDay(this)',
                    '星期' + dayWords[i]
                ),
                lineMidTpl);
                      
            for (j = 0; j < 24; j++) {
                if (j > 0 && j % 6 == 0) {
                    html.push(lineMidTpl);
                }
                html.push(
                    ui.format(
                        timeTpl,
                        me.getId('SelWTtime_' + i + '_' + j),
                        i,
                        j,
                        ctrlRef + '.selTimeOverOut(this,1)',
                        ctrlRef + '.selTimeOverOut(this)',
                        ctrlRef + ".selWTtimeClick(this)"
                    ));
            }
            html.push(lineEndTpl);
        }
        
        // html写入
        baidu.g(me.getId('WeektimeBody')).innerHTML = html.join('');
        
        // 挂载行移入移出事件
        function lineOver(e) {
            baidu.addClass(this, me.getClass('sel_wtbodylinehover'));    
        }
        
        function lineOut(e) {
            baidu.removeClass(this, me.getClass('sel_wtbodylinehover'));     
        }
        
        for (i = 0; i < 7; i++) {
            line = baidu.g(me.getId('SelWTtimeDayLine' + i));
            line.onmouseover = lineOver;            
            line.onmouseout = lineOut;
        }
        
        // 释放dom对象的引用
        line = null;
        me.refresh();
    },
    
    /**
     * 刷新weektime选择器的视图
     * 
     * @private
     * @param {Object} control 控件对象
     */
    refresh: function () {
        var me = this,
            value = me.value,
            lineValue, lineActive, lineCb,
            headStates = [],
            activeHeadClass = me.getClass('sel_wttimehead_active'),
            selectedClass = me.getClass('sel_wktimesel'),
			suggestFlagClass = me.getClass('sug_wktimesel'),//用于标识是否为推荐时间段
            head = baidu.g(me.getId('WeektimeHead')).getElementsByTagName('div'),
            divs = baidu.g(me.getId('WeektimeBody')).getElementsByTagName('div'),
            divLen = divs.length,
            div,
            divMatch,
            headDiv,
            i, j, pass,
            count = 0,
            lineEl, lineDivs, wttime, time;

        // 初始化状态表
        for (i = 0; i < 24; i++) {
            headStates.push(1);
        }
        
        // 遍历头部状态
        for (i = 0; i < 7; i++) {
            lineEl = baidu.g(me.getId('SelWTtimeDayLine' + i));
            lineDivs = lineEl.getElementsByTagName('div');
            j = lineDivs.length;
            while (j--) {
                wttime = lineDivs[j];
                if (me.selIsWTtime(wttime)) {
                    time = parseInt(wttime.getAttribute('time'), 10);
                    // Modified by Wu huiyao FIX BUG: 推荐时段并不是投放的时段
                    if (value[i][time] != 1) { // if (!value[i][time]) {
                        headStates[time] = 0;
                    }
                }
            }
        }
        
        // 刷新time头部状态
        j = head.length;
        while (j--) {
            div = head[j];
            divMatch = /SelWTTimeHead([0-9]+)$/.exec(div.id);
            if (divMatch && divMatch.length == 2) {
                if (headStates[parseInt(divMatch[1], 10)]) {
                    baidu.addClass(div, activeHeadClass);
                } else {
                    baidu.removeClass(div, activeHeadClass);
                }
            }
        }

        // 刷新时间项状态
        while (divLen--) {
            div = divs[divLen];
            divMatch = /SelWTtime_([0-9]+)_([0-9]+)$/.exec(div.id);
            if (divMatch && divMatch.length == 3) {
                if (value[parseInt(divMatch[1], 10)][parseInt(divMatch[2], 10)] == 1) {
                    baidu.addClass(div, selectedClass);
                } else {
                    baidu.removeClass(div, selectedClass);
                }
				if(value[parseInt(divMatch[1], 10)][parseInt(divMatch[2], 10)] == 2){
					baidu.addClass(div, suggestFlagClass);
				}
				me.setSuggestTime(div);
            }
        }

        // 刷新checkbox状态
        for (i = 0; i < 7; i++) {
            lineValue = value[i];
            lineActive = true;
            pass = false;
            
            for (j = 0; j < 24; j++) {
                if(me.suggestAsChosen && parseInt(me.suggestAsChosen)){
                    pass = !lineValue[j];
                }
                else{
                    pass = (lineValue[j] != 1);
                }
                if (pass) {
                    lineActive = false;
                } else {
                    count++;
                }
            }
            
            baidu.g(me.getId('SelWTtimeDayCheckbox' + i)).checked = lineActive;
        }

        // added by wuhuiyao
        // 更新选择全部推荐的复选框的样式
        var recmdTimeFlagClass = me.getClass('sug_wktimesel'),
            recmdTimeUnSelClass= me.getClass('sug_wktimesug'),
            selector = "#" + me.getId('WeektimeBody') + " .",
            // 获取所有推荐的时段的元素
            recmdElemArr = $$(selector + recmdTimeFlagClass),
            // 获取所有推荐的已经被选中的时段
            recmdSelElemArr = $$(selector + recmdTimeFlagClass + "." + me.getClass('sel_wktimesel')),
            selAllRecmdCheckElem = $$("#" + me.getId() + " .ui_schedule_sel_recmd input")[0];
        
        if (selAllRecmdCheckElem && recmdElemArr.length) {
        	selAllRecmdCheckElem.checked = (recmdElemArr.length == recmdSelElemArr.length);
        }
        // added end
        
        // 刷新选中日期数状态
        baidu.g(me.getId('WeektimeCount')).innerHTML = count;
    },
    
    /**
     * 获取时间的显示串
     * 
     * @private
     * @param {Array} value 时间值
     * @return {string}
     */
    getValueString: function () {
        var me = this,
            value = me.value,
            beginTime, prevTime,
            html = [], lineHtml,
            dayList = ['一','二','三','四','五','六','日'],
            emptyDay,
            sep = '<br>';
        
        function pushTime() {
            if (baidu.lang.hasValue(beginTime)) {
                if (beginTime == 0 && prevTime == 24) {
                    lineHtml.push('全天投放');
                } else {
                    lineHtml.push(beginTime + ":00 -- " + prevTime + ':00');
                }
            }
            
            beginTime = null;
            prevTime = null;
        }
        
        
        for (var i = 0; i < 7; i++) {
            lineHtml = [];
            emptyDay = 1;
            
            for (var j = 0; j < 24; j++) {
                if (value[i][j]) {
                    if (!baidu.lang.hasValue(beginTime)) {
                        beginTime = j; 
                    }
                    
                    prevTime = j + 1;
                    emptyDay = 0;
                } else {
                    pushTime();
                }
            }
            
            pushTime();
            if (emptyDay) {
                lineHtml.push('全天暂停');
            }
            html.push('星期' + dayList[i] + '：' + lineHtml.join(', '));
        }
        
        
        for (i = 0; i < 13; i++) {
            sep += '&nbsp;';
        }
        return html.join(sep);
    },
    
    /**
     * 获取时间的参数串
     * 
     * @private
     * @param {Array} value 时间值
     * @return {string}
     */
    getParamString: function () {
        var me = this,
            value  = me.value,
            beginTime, prevTime,
            str = [];
        
        function formatTime(time) {
            time = String(time);
            if (time.length > 1) {
                return time;
            }
            
            return '0' + time;
        }
        
        function pushTime() {
            if (baidu.lang.hasValue(beginTime)) {
                str.push(i + formatTime(beginTime), i + formatTime(prevTime));
            }
            beginTime = null;
            prevTime = null;
        }
        
        for (var i = 1; i < 8; i++) {
            for (var j = 0; j < 24; j++) {
                if (value[i - 1][j]) {
                    if (!baidu.lang.hasValue(beginTime)) {
                        beginTime = j; 
                    }
                    
                    prevTime = j + 1;
                } else {
                    pushTime();
                }
            }
            
            pushTime();
        }
        
        return str.join(',');
    },
    /**
     * 获取不投放广告的时间段<br/>
     * 注意:是不投放广告的时间段,也就是下线时间段<br/>
     * 如果suggestAsChosen属性设为true，则建议推广时段不作为未投放时段返回
     * @method getParamObj
     * @return {Array|''} 未投放的时间段，若没有，返回空串；存在未投放的时间段，其返回一个二维数组，每个数组元素为一个大小为
     *                    2的数组，其值包括星级x未投放的时间段开始时段到结束时段。
     * @example
     *      [[100,103],[104,124],[500,524]]
     *      其中[100,103]表示周一从0点到3点为未投放时段，即方格子0,1,2为未投放时段，不包括3，其它以此类推。
     */
    getParamObj : function () {
        var me = this,
            value  = me.value,
            beginTime, prevTime,
            paramObj = [],
            pass = false;
        
        function formatTime(time) {
            time = String(time);
            if (time.length > 1) {
                return time;
            }
            
            return '0' + time;
        }
        
        function pushTime() {
            if (baidu.lang.hasValue(beginTime)) {
                paramObj.push([parseInt(i + formatTime(beginTime),10), parseInt(i + formatTime(prevTime),10)]);
            }
            beginTime = null;
            prevTime = null;
        }
        for (var i = 1; i < 8; i++) {
            for (var j = 0; j < 24; j++) {
                if(me.suggestAsChosen && parseInt(me.suggestAsChosen)){
                    pass = !value[i - 1][j];
                }
                else{
                    pass = (value[i - 1][j] != 1);
                }
                if (pass) {
                    if (!baidu.lang.hasValue(beginTime)) {
                        beginTime = j; 
                    }
                    prevTime = j + 1;
                } else{
                    pushTime();
                }
            }
            
            pushTime();
        }
        if(paramObj.length == 0){
            return '';
        }
        return paramObj;
    },
    
    /**
     * 设置时段的值，该方法同时会触发界面的刷新
     * @method setValue
     * @param {Array} value 二维数组7*24(7天*24小时).具体定义见控件选项配置说明
     * @author wuhuiyao (wuhuiyao@baidu.com)
     */
    setValue: function(value) {
    	this.value = value;
    	this.refresh();
    },
    
    /**
     * 为控件扩展的方法表
     */

    /**
     * 选择/取消所有推荐时间段
     * @param {HTMLElement} dom 触发该动作的复选框DOM元素
     * @author wuhuiyao (wuhuiyao@baidu.com)
     */
    toggleSelRecommedTime: function(dom) {
    	var me = this,
            isSelected = dom.checked,
            recmdTimeFlagClass = me.getClass('sug_wktimesel'),
            recmdTimeUnSelClass= me.getClass('sug_wktimesug');
            
        var selector = "#" + me.getId('WeektimeBody') + " .";
        
        if (isSelected) {
        	selector = selector + recmdTimeUnSelClass;
        } else {
        	selector = selector + recmdTimeFlagClass + "." + me.getClass('sel_wktimesel'); 
        }
            
        var recmdTimeElemArr = $$(selector),
            dom;
        
        for (var i = 0, len = recmdTimeElemArr.length; i < len; i ++) {
        	dom = recmdTimeElemArr[i];
	        this.selSelectTime(
                    parseInt(dom.getAttribute('day'), 10),
                    parseInt(dom.getAttribute('time'), 10),
                    isSelected,
                    true);
        }
        
        this.refresh(this);
    },
    
    /**
     * 选中时间
     * 
     * @private

     * @param {Object} day 星期
     * @param {Object} time 时间
     * @param {Object} isSelected 是否选中
     * @param {Object} noRrefresh 是否不刷新视图
     */
    selSelectTime: function (day, time, isSelected, noRrefresh) {
        var value = this.value,
            // added by wuhuiyao
            old = value[day][time],
            flag = (isSelected ? 1 : 0);
            
        value[day][time] = flag;
        
        if (!noRrefresh) {
            this.refresh(this);
        }
        
        // added by wuhuiyao
        /**
         *
         * 选中或取消某个时间段（对应一个小格子）触发的事件
         * @event onToggleTime
         * @param {Number} day 选中的时段的星期，其有效值为0~6（对应周一~周日）
         * @param {Number} time 选中的时段的小时，其有效值为0~23(对应小格子的0~23)
         * @param {Boolean} isSelected 该时段是否被选中
         */
        var handler = this.onToggleTime;
        // 该时段状态发生变化才触发该事件
        if (typeof handler == 'function' && (old != flag)) {
        	handler.call(this, day, time, isSelected);
        }
    },
    
    /**
     * 根据时间选中时间区块
     * 
     * @private

     * @param {Object} dom 时间区块的dom元素
     */
    selSelectTimes: function (dom) {
        var me = this,
            isSelected = (dom.className.indexOf(this.getClass('sel_wttimehead_active')) < 0),
            time = parseInt(dom.getAttribute('time'), 10),
            div;
        
        for (var i = 0; i < 7; i++) {
            div = baidu.g(this.getId('SelWTtime_' + i + '_' + time));
            this.selSelectTime(
                 
                parseInt(div.getAttribute('day'), 10), 
                time, 
                isSelected, 
                true);
        }           
        
        me.refresh(this);
    },
    
    /**
     * 根据星期选中时间区块
     * 
     * @private

     * @param {Object} dom 星期表单的dom元素
     */
    selSelectTimeDay: function (dom, dontRefresh) {
        var me = this,
            isSelected = dom.checked,
            divs = dom.parentNode.parentNode.getElementsByTagName('div'),
            len = divs.length, div;

        while (len--) {
            div = divs[len];
            if (this.selIsWTtime(div)) {
                this.selSelectTime(

                    parseInt(div.getAttribute('day'), 10),
                    parseInt(div.getAttribute('time'), 10),
                    isSelected,
                    true);
            }
        }
        
        if (!dontRefresh) {
            me.refresh(me);
        }
    },
    
    /**
     * 选中所有时间
     * 
     * @private

     */
    selSelectAllTime: function (begin, end, checkbox) {
        begin = 0;
        end = 7;
        
        for (; begin < end; begin++) {
            checkbox = baidu.g(this.getId('SelWTtimeDayCheckbox' + begin));
            checkbox.checked = true;
            this.selSelectTimeDay( 
                                  checkbox,
                                  true);
        }
        
        this.refresh(this);
    },
    
    /**
     * 选中工作日的时间
     * 
     * @private

     */
    selSelectWorkTime: function () {
        var begin,
            end,
            checkbox,
            idPrefix = 'SelWTtimeDayCheckbox';
        
            
        for (begin = 0, end = 5; begin < end; begin++) {
            checkbox = baidu.g(this.getId('SelWTtimeDayCheckbox' + begin));
            checkbox.checked = true;
            this.selSelectTimeDay( 
                                  checkbox,
                                  true);
        }
        
        for (begin = 5, end = 7; begin < end; begin++) {
            checkbox = baidu.g(this.getId('SelWTtimeDayCheckbox' + begin));
            checkbox.checked = false;
            this.selSelectTimeDay( 
                                  checkbox,
                                  true);
        }
        
        this.refresh(this);
    },
    
    /**
     * 选中周末的时间
     * 
     * @private

     */
    selSelectWeekendTime: function () {
        var begin,
            end,
            checkbox,
            idPrefix = 'SelWTtimeDayCheckbox';
        
            
        for (begin = 0, end = 5; begin < end; begin++) {
            checkbox = baidu.g(this.getId('SelWTtimeDayCheckbox' + begin));
            checkbox.checked = false;
            this.selSelectTimeDay( 
                                  checkbox,
                                  true);
        }
        
        for (begin = 5, end = 7; begin < end; begin++) {
            checkbox = baidu.g(this.getId('SelWTtimeDayCheckbox' + begin));
            checkbox.checked = true;
            this.selSelectTimeDay( 
                                  checkbox,
                                  true);
        }
        
        this.refresh(this);
    },
    
    /**
     * 时间dom元素的点击行为
     * 
     * @private

     * @param {Object} dom 时间dom元素
     */
    selWTtimeClick: function ( dom) {
        var day = parseInt(dom.getAttribute('day'), 10),
            time = parseInt(dom.getAttribute('time'), 10),
            isSelected = true;
        
        if (dom.className.indexOf(this.getClass('sel_wktimesel')) >= 0) {
            isSelected = false;
        }
        this.selSelectTime(day, time, isSelected)
    },
    
    /**
     * 时间区块dom元素的鼠标移入移出行为处理
     * 
     * @private
     * @param {Object} dom 时间区块dom元素
     * @param {Object} isOver 是否移入行为
     */
    selTimeHeadOverOut: function (dom, isOver) {
        var time = dom.getAttribute('time'),
            divs = baidu.g(this.getId('WeektimeBody')).getElementsByTagName('div'),
            len = divs.length,
            wttime;
        
        while (len--) {
            wttime = divs[len];
            if (this.selIsWTtime(wttime) 
                && wttime.getAttribute('time') == time) {
                this.selTimeOverOut(wttime, isOver);
            }
        }
    },
    
    /**
     * 判断dom元素是否时间元素
     * 
     * @param {Object} dom
     */
    selIsWTtime: function (dom) {
        return !!dom.getAttribute('timeitem');
    },
    
    /**
     * 时间dom元素的鼠标移入移出行为处理
     * 
     * @private
     * @param {Object} dom 时间dom元素
     * @param {Object} isOver 是否移入行为
     */
    selTimeOverOut: function (dom, isOver) {
        var className = this.getClass('sel_wktimehover');
        if (isOver) {
            baidu.addClass(dom, className);
        } else {
            baidu.removeClass(dom, className);
        }
		this.setSuggestTime(dom);
    },
	
	/**
	 * 设置推荐时间段
	 * @param {Object} dom
	 */
	setSuggestTime : function(dom){
		var suggestClass = this.getClass('sug_wktimesug'),//推荐时间段样式
			suggestFlagClass = this.getClass('sug_wktimesel'),//用于标识是否为推荐时间段
			selectedClass = this.getClass('sel_wktimesel'),//选中时状态
			className = this.getClass('sel_wktimehover');//悬停时状态
			
		if(baidu.dom.hasClass(dom,suggestFlagClass) 
			&& !baidu.dom.hasClass(dom,selectedClass)
			&& !baidu.dom.hasClass(dom,className)){
			baidu.addClass(dom, suggestClass);
		}else{
			baidu.removeClass(dom,this.getClass('sug_wktimesug'));
		}
	}



}

ui.Base.derive(ui.Schedule);