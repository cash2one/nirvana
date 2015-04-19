/*
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/Table.js
 * desc:    表格控件
 * author:  erik, wanghuijun, linzhifeng
 * date:    $Date: 2010/12/16 13:04:00 $
 * 
 * 表格级属性：
 * 1.	dragable：‘true’ or ‘false’，默认为false，为true则开启列宽拖拽改变功能（计划、单元、关键词、创意中已修改为打开状态）
 * 2.	colViewCounter：‘all’ or  ‘number’，默认为all，该值设置表格默认显示列数，all为全部显示，数字代表显示列数。表格会自动计算屏幕宽度和需要显示的列总宽，屏宽和表格显示列总宽的差值将被平均伸缩到指定的显示列中可被拉伸的列里。
 * 3.	scrollYFixed：‘true’ or ‘false’，默认为false，为true则开启纵向滚动表头悬停功能，如需添加表格外部元素与表头悬浮同时锁定，可在该元素上添加class：scroll_y_top_fixed，如目前表格上方的操作和总计区域，（计划、单元、关键词、创意中已修改为打开状态）
 * 4.	lockable：：‘true’ or ‘false’，默认为false，暂不开放使用，该属性开启表格自由锁定功能
 * 5.	subrow : 'true' or 'false' 默认为false,加一行div //by wangkemiao
 * 6.   matchRow : 'true' or 'false' 默认为false,设置子行与对应行的样式是否联动，（用于匹配分析）。 //by liuyutong
 *
 * 列级属性：
 * 1.	stable： true’ or ‘false’，默认为false，该值代表该列是否可伸缩，进入页面或屏宽改变时表格将自动计算用户可视区域宽度，并自动伸缩各列，当某列带stable为true时该列则别伸缩。这个值尽量少用，保存整个表格是灵活可伸缩效果最好，大家担心的列宽太窄影响显示的问题可以通过minWidth属性解决。
 * 2.	locked： true’ or ‘false’，默认为false，该值指定列锁定，锁定列在出现横向滚动条时不被滚动。
 * 3.	minWidth：number，默认自动计算为表头宽度（文字+排序图标），可设定该列被拖拽或被自适应拉伸时的最小宽度
 * 4.	dragable： true’ or ‘false’，默认为true，当表格属性dragable为true时该值才生效，代表该列是否开启拖拽改变列宽功能
 * 5.	lockable： true’ or ‘false’，默认为false，当表格属性lockable为true时该值才生效，代表该列是否开启自由锁定列宽功能（暂不开放使用）
 * 6.   subEntry： true or false 默认为 false ，列前加入‘+’符号 firesubrow（index）
 */

/**
 * 表格控件
 * 
 * @class Table
 * @extend ui.Base
 * @namespace ui
 * @constructor
 * @param {Object} options 控件初始化参数
 * <pre>
 * 配置项定义如下：
 * {
 *     id:             [String],           [REQUIRED] 表格控件ID
 *     width:          [Number],           [OPTIONAL] 设置表格的宽度
 *     colViewCounter: ['all'|Number],     [OPTIONAL] 默认为all，该值设置表格默认显示列数，all为全部显示，
 *                                                    数字代表显示列数。表格会自动计算屏幕宽度和需要显示的列
 *                                                    总宽，屏宽和表格显示列总宽的差值将被平均伸缩到指定的显
 *                                                    示列中可被拉伸的列里。
 *     autoResize:     [Boolean],          [OPTIONAL] 是否自动调整列的宽度，默认true
 *     dragable:       [Boolean],          [OPTIONAL] 默认为false，为true则开启列宽拖拽改变功能，调整列
 *                                                    的宽度，而不是拖拽改变列的位置
 *     sortable:       [Boolean],          [OPTIONAL] 列是否提供排序功能，默认false
 *     orderBy:        [String],           [OPTIONAL] 表格初始排序的列，其值必须等于fields配置信息的field
 *                                                    属性值，该属性必须在开启表格和列排序才有效
 *     order:          ['desc'|'asc'],     [OPTIONAL] 表格初始要排序的列的排序方式，默认按降序排序，该属性必
 *                                                    须在开启表格和列排序才有效 
 *     filterable:     [Boolean],          [OPTIONAL] 表格是否提供列过滤功能, 默认false
 *     hasFoot:        [Boolean],          [OPTIONAL] 是否显示表尾，默认为false
 *     noTitle:        [Boolean],          [OPTIONAL] 是否不显示表头，默认false，即显示表头
 *     noDataHtml:     [String],           [OPTIONAL] 当表格数据为空时，显示的信息，默认为空串，即不显示
 *     scrollYFixed:   [Boolean],          [OPTIONAL] 默认为false，为true则开启纵向滚动表头悬停功能，如
 *                                                    需添加表格外部元素与表头悬浮同时锁定，可在该元素上添加
 *                                                    class：scroll_y_top_fixed，如目前表格上方的
 *                                                    操作和总计区域，（计划、单元、关键词、创意中已修改为打开状态）
 *     matchRow:       [Boolean],          [OPTIONAL] 默认为false,设置子行与对应行的样式是否联动，如果为
 *                                                    true，比如当前行为选中样式，子行也将是选中样式。 
 *     subrow:         [Boolean],          [OPTIONAL] 默认为false, 是否每一行还包括可以展开的子行（实现上
 *                                                    是包含子行的当前行插入一个用于渲染子行的DIV容器作为兄
 *                                                    弟节点），实现上得自己监听展开/折叠行，进行子行数据的
 *                                                    渲染和移除(隐藏)
 *     isSubTable:     [Boolean],          [OPTIONAL] 默认为false， 是否是嵌套的子表格
 *     noScroll:       [Boolean],          [OPTIONAL] 是否不显示横行滚动条，默认false，即显示横行滚动条
 *     isSelectAll:    [Boolean],          [OPTIONAL] 表格行是否默认全部选中，默认false
 *     select:         ['multi'|'single'], [OPTIONAL] 表格的第一列显示复选或者单选框，默认不显示
 *     bodyHeight:     [Number],           [OPTIONAL] 设置表格显示的最大高度，超过该高度，将出现滚动条
 *     fields:         [Object],           [REQUIRED] 表格列的配置信息，详见下面fields定义
 *     datasource:     [Array],            [OPTIONAL] 表格绑定的数据源，其定义详见下面的datasource
 *     footdata:       [Array],            [OPTIONAL] 表格脚注绑定的数据源，该属性在表格的hasFoot属性为
 *                                                    true时才有效，其定义详见下面的footdata
 * }
 * 
 * fields定义如下：
 * {
 *     {
 *         field:           [String],          [REQUIRED] 表格列所绑定的数据源的字段名
 *         title:           [String|Function], [REQUIRED] 列标题，可以是HTML片段，也可以是一个函数，该函数
 *                                                        要求返回字符串
 *         content:         [Function|String], [REQUIRED] 列的单元格的渲染方式，值为函数的payload:
 *                                                        function(data, rowIdx, colIdx)
 *                                                        data为datasource所配置的数据源记录，该函数
 *                                                        必须返回字符串;如果值为String，其值应对应列的
 *                                                        字段名field，将简单输出该字段的值进行单元格的渲染:
 *                                                        data[field]
 *         noun:            [Boolean],         [OPTIONAL] 是否在列头显示帮助信息的图标，默认false
 *         nounName:        [String],          [OPTIONAL] 显示的帮助内容，未设置，默认显示title的信息，
 *                                                        该属性必须在noun开启的时候才有效
 *         minWidth:        [Number],          [OPTIONAL] 默认自动计算为表头宽度（文字+排序图标），可设定
 *                                                        该列被拖拽或被自适应拉伸时的最小宽度
 *         width:           [Number],          [OPTIONAL] 列的宽度
 *         align:           [String],          [OPTIONAL] 列对齐方式，其支持有效值:'right', 'center',
 *                                                        'left'，未设置默认左对齐
 *         dragable:        [Boolean],         [OPTIONAL] 默认为true，<b>当表格属性dragable为true时
 *                                                        该值才生效</b>，代表该列是否开启拖拽改变列宽功能
 *         sortable:        [Boolean],         [OPTIONAL] 列是否提供排序功能，默认false, 
 *                                                        <b>只有当表格sortable属性设为true时，该属性值才生效</b>
 *         filterable:      [Boolean],         [OPTIONAL] 列是否提供过滤功能，默认false，
 *                                                        <b>只有当表格filterable属性设为true时，该属性值才生效</b>
 *         stable:          [Boolean],         [OPTIONAL] 默认为false，该值代表该列是否可伸缩，进入页面
 *                                                        或屏宽改变时表格将自动计算用户可视区域宽度，并自
 *                                                        动伸缩各列，当某列带stable为true时该列则不伸缩。
 *                                                        这个值尽量少用，保证整个表格灵活可伸缩的效果最好，
 *                                                        大家担心的列宽太窄影响显示的问题可以通过minWidth属性解决。
 *         locked:          [Boolean],         [OPTIONAL] 默认为false，该值指定列锁定，锁定列在出现横向滚动条时不被滚动。
 *         breakLine:       [Boolean],         [OPTIONAL] 显示内容超过当前列宽，是否自动换行，默认false，超出部分将不可见
 *         subEntry:        [Boolean],         [OPTIONAL] 默认为 false ，是否在单元格前显示用于展开折叠子行的按钮
 *         subEntryTipOpen: [String],          [OPTIONAL] 子条目展开按钮提示的信息，未设置默认显示'点击展开'，
 *                                                        对于折叠的提示信息都是'点击收起'
 *         isSubEntryShow:  [Function],        [OPTIONAL] 表格显示的时候是否显示子条目展开按钮的回调函数, 函数的payload:
 *                                                        function(data, rowIdx, colIdx)
 *                                                        如果不显示子条目展开的按钮，该函数返回false，默认显示展开按钮
 *         select:          [Boolean],         [OPTIONAL] 表格列是否被选中，默认false
 *         footContent:     [Function|String], [OPTIONAL] 列的脚注的渲染方式, 值为函数的payload:
 *                                                        function(data, rowIdx, colIdx)
 *                                                        data为footdata所配置的数据源记录，该函数必须返回字符串;
 *                                                        如果值为String，其值应对应列的字段名field，将简单输出该
 *                                                        字段的值进行单元格的渲染:data[field]
 *     },
 *     ...
 * }
 * 
 * datasource定义如下:
 * [
 *      {
 *         fieldName: value,
 *         ...
 *      },
 *      ...
 * ]
 * 
 * footdata定义如下:
 * [
 *      {
 *         fieldName: value,
 *         ...
 *      }
 * ]
 * </pre>
 */
ui.Table = function (options) {
	this.autoResize = true;
    this.initOptions(options);
    this.type = 'table';
    /**
     * 
     * 过滤列的信息，可读写，该属性必须在开启表格和列过滤才有效，可以通过设置已经过滤的field为true，改变列已经过滤的状态<br/>
     * 如果<code>table.filterCol[fieldName] == true</code>，则显示已经过滤的状态
     * @property filterCol
     * @type Object
     * @default {}
     */
	this.filterCol = {};
	this.hasFoot = this.hasFoot || false; // 默认为没有表尾
	
	this.noScroll = this.noScroll || false; // 默认为存在横向滚动，传入noScroll为true则不显示横向滚动条
    
    this.curRow = 0; // 鼠标点击的当前行
    this.isSelectAll = this.isSelectAll || false; // 表格是否全部选中，默认为不选中
};

ui.Table.prototype = {
    subEntryTipOpen: '点击展开',
    subEntryTipClose: '点击收起',
    /**
     * 初始化表格的字段
     * 
     * @protected
     * @param {Array} fields 字段数组
     */
    setFields: function (fields) {
        if (!this.fields) {
            return;
        }
        
        // 避免刷新时重新注入
		var fields = this.fields,
            _fields = fields.slice(0),
            len = _fields.length;
        while (len--) {
            if (!_fields[len]) {
                _fields.splice(len, 1);
            }
        }
        this._fields = _fields;
        if (!this.select) {
            return;
        }
        
        switch (this.select.toLowerCase()) {
            case 'multi':
                _fields.unshift(this.checkboxField);
                break;
            case 'single':
                _fields.unshift(this.radioboxField);
                break;
        }
    },
    
    /**
     * 获取表格的body的DOM元素
     * @method getBody
     * @public
     * @return {HTMLElement}
     */
    getBody: function () {
        return baidu.g(this.getId('body'));
    },
    
    /**
     * 获取表格头的DOM元素
     * @method getHead
     * @public
     * @return {HTMLElement}
     */
    getHead: function () {
        return baidu.g(this.getId('head'));
    },
    
	 /**
     * 获取表格的foot的DOM元素
     * @method getFoot
     * @public
     * @return {HTMLElement}
     */
    getFoot: function () {
        return baidu.g(this.getId('foot'));
    },
	
    /**
     * 获取表格内容行的dom元素
     * @method getRow
     * @public
     * @param {number} index 行号
     * @return {HTMLElement}
     */
    getRow: function (index) {
        return baidu.g(this.getId('row') + index);
    },
    
    /**
     * 获取checkbox选择列表格头部的checkbox表单
     * 
     * @private
     * @return {HTMLElement}
     */
    getHeadCheckbox: function () {
        return baidu.g(this.getId('selectAll'));
    },
    
    /**
     * 获取表格所在区域宽度
     * 
     * @private
     * @return {number}
     */
    getWidth: function () {  
	    if (this.width){
			return this.width;
		}
		
		// add By wanghuijun
		if (!this.main) {
			return;
		}
		
        var me = this,
            width,
            rulerDiv = document.createElement('div'),
            parent = me.main ? me.main.parentNode : false;
		
		if (!parent){
			return this._width;
		}	
		parent.appendChild(rulerDiv);	
		/*
		if (me.datasource){
			rulerDiv.style.height = me.datasource.length * 30 + 30 + 'px';
		}
		*/
        width = rulerDiv.offsetWidth;
        parent.removeChild(rulerDiv);
		
		return width;
    },
	
    /**
     * dom表格起始的html模板
     * 
     * @private
     */
    tplTablePrefix: '<table cellpadding="0" cellspacing="0" width="{0}" control="{1}">',
    
    /**
     * 将控件填充到容器元素
     * @method appendTo
     * @public
     * @param {HTMLElement} container 容器元素
     */
    appendTo: function (container) {
        var div = document.createElement('div');
        container.appendChild(div);
        this.render(div);
    },
    
    /**
     * 绘制表格
     * @method render
     * @public
     * @param {HTMLElement} main 控件挂载DOM元素
     */
    render: function (main) {
        var me = this;

        me.main = main || me.main;
        main = me.main;
		me.setFields();
        if (!me._fields) {
            return;
        }
        // 如果未绘制过，初始化main元素
        if (!me.isRendered) {
            main.id = me.getId();
            main.setAttribute('control', me.id);
            baidu.addClass(main, me.getClass());
			me.fixedOffsetHeight = [0,0];
			me.initMinColsWidth();
        }  
        me.subrowIndex = null;
        me._width = me.getWidth();
        main.style.width = me._width + 'px';
		
		if(me.colsWidthBak && me.colsWidthBak.length != me._fields.length){
			me.resetTableAfterFieldsChanged();
		}
		if (me.colsWidthBak && me.colsWidthBak.length != 0){
			//计算表格总宽度
			for (var i = 0,len = me.colsWidthBak.length; i < len; i++){
				me.colsWidth[i] = me.colsWidthBak[i];
				me._fields[i].stable =  me.colsStateLock[i];
			}
		}else{
			me.initColsWidth();
		}
		
		me.renderXScroll();
		// 增加横向滚动条的隐藏判断
		if (me.noScroll) {
			if (me.sxHandle) {
				baidu.dom.hide(me.sxHandle);
			}
		}
		
        me.renderHead();    // 绘制表格头
        me.renderBody();    // 绘制列表
        me.renderFoot();    // 绘制表格尾，用于总计数据
		if (me.sxHandle.scrollLeft > 0){
			//刷新保持			
			me.getXScrollHandle()();
		}
		
        // 如果未绘制过，初始化resize处理
        if (!me.isRendered) {
            me.initResizeHandler();
			me.initTopResetHandler();	
        } else {
            // 重绘时触发onselect事件
            switch (me.select) {
            case 'multi':
                me.getSelectedIndex();
                me.onselect([]);
                break;
            }
        }
		/*
		setTimeout(function(){
			if (me._width  != me.getWidth()){
				//数据填入后发现宽度变化了（主要是滚动条出现或消失后导致宽度变化），修正一下宽度
				me.handleResize();
				me.renderHead();//表头总是有问题，不知道为什么，先牺牲一下性能
			}
		},500);
		*/
		/**
		 * 属性作用不明？可读写
		 * @property resetYpos
		 * @type Boolean
		 * @default undefined
		 */
		if (me.resetYpos && me.scrollYFixed){
			var domFixedPlace = baidu.g(me.getId('domFixedPlace'));
			baidu.show(domFixedPlace);
			me.fixedTop = baidu.dom.getPosition(domFixedPlace).top;
			baidu.hide(domFixedPlace);	
			if (!baidu.browser.chrome){
				document.documentElement.scrollTop = me.fixedTop;
				if (baidu.browser.ie && document.body.offsetHeight - document.documentElement.clientHeight < me.fixedTop){
					//sb ie
					document.documentElement.scrollTop = 0;
				}
			}else{
				//chorme对documentElement.scrollTop不识别
				document.body.scrollTop = me.fixedTop;
				
			}
			me.resetYpos = false;	
		}
		if (me._width != me.getWidth()){
			//数据填入后发现宽度变化了（主要是滚动条出现或消失后导致宽度变化），修正一下宽度
			me.handleResize();
			me.renderHead();//表头总是有问题，不知道为什么，先牺牲一下性能
		}else{
			setTimeout(function(){
				if (me._width != me.getWidth()){
					//数据填入后发现宽度变化了（主要是滚动条出现或消失后导致宽度变化），修正一下宽度
					me.handleResize();
					me.renderHead();//表头总是有问题，不知道为什么，先牺牲一下性能
				}
			},500);
		}
		
		// 增加表格默认全部选中的状态
		if (me.isSelectAll) {
			me.selectAll(true);
		}
		
        me.isRendered = true;
        ui.Bubble.init(baidu.q('ui_bubble', this.main)); 
        
        // Added by Wu Huiyao (wuhuiyao@baidu.com)
        // 原本判断添加滚动条逻辑在renderBody实现，移到render结束后，重置样式，解决一些发现bug：重新渲染内容消失问题，浮出层被上层容器挡住问题
        var id = me.getId('body'),
            list = baidu.g(id),
            style = list.style;
        
        if (me.bodyHeight) { // 只有表格高度高出设置高度时，才出现滚动
            // 原来实现逻辑为offetHeight，这里改为scrollHeight
            if (list.scrollHeight > me.bodyHeight) {
                style.height = me.bodyHeight + 'px';
                style.overflowX = 'hidden';
                style.overflowY = 'auto';
            } else {
                style.height = '';
                style.overflowX = '';
                style.overflowY = '';
            }   
        } 
        // End added     
    },
	
	/**
	 * 列改变后调用
	 */
	resetTableAfterFieldsChanged : function(){
		var me = this;
		me.initMinColsWidth();
		me.colsWidthBak = [];
	},
	/**
	 * 选择表格行触发的事件
	 * @event onselect
	 * @param {Array|Number} selRowIndex 对于单选传入参数类型为Number，对于复选，传入为Array
	 * @return {Boolean} 对于单选，要求返回单选成功的状态，true表示成功
	 */
	onselect: new Function (),
	
	/**
	 * 初始最小列宽
	 */
    initMinColsWidth : function(){
		var me = this,
		    fields = me._fields,
			len = fields.length,
			i;
		me.minColsWidth = [];
        if (!me.noTitle) {
            for (i = 0; i < len; i++) {
				if (fields[i].minWidth){
					me.minColsWidth[i] = fields[i].minWidth;
				}else{
					me.minColsWidth[i] = fields[i].title.length * 13 + 15; //10包括外层padding
					if (fields[i].sortable){
						me.minColsWidth[i] += 10;	//排序
					}
					if (fields[i].filterable){		//筛选
						me.minColsWidth[i] += 15;
					}
				}
            }
        }else{
			for (i = 0; i < len; i++) {
                me.minColsWidth[i] = 40;
            }
		}
	},
    
    /**
     * 初始化列宽
     * 
     * @private
     */
    initColsWidth: function () {
        var me = this,
            canExpand = [],
            leaveAverage,
            leftWidth,
            fields = me._fields,
            field,
            len = fields.length,
            offset,
            width,
			maxCanExpandIdx = 0,
			minWidth;
        
        me.colsWidth = [];
		
        // 减去边框的宽度
        leftWidth = me._width - 2;
        
		//初始可显示的最大列数
		me.colViewCounter = me.colViewCounter || 'all';
		if (me.colViewCounter == 'all'){
			maxCanExpandIdx = len;
		}else{
			maxCanExpandIdx = +me.colViewCounter;
			maxCanExpandIdx = maxCanExpandIdx > 0 ? maxCanExpandIdx : len;
		}
		
        // 读取列宽并保存
        for (var i = 0; i < len; i++) {
            field = fields[i];
			
			if (me.colsWidthBak && me.colsWidthBak.length > i){
				width = me.colsWidthBak[i];
			}else{
				if (field.width) {
					width = parseInt(field.width, 10);
				} else {
					width = 0;
				}
			}
			
            me.colsWidth.push(width);
			if (i < maxCanExpandIdx){
				leftWidth -= width;
			}
            if (!field.stable && i < maxCanExpandIdx) {				
                canExpand.push(i);
            }
        }
		
        // 根据当前容器的宽度，计算可拉伸的每列宽度
		len = canExpand.length;	 
		//leftWidth -= len;     		
        leaveAverage = Math.round(leftWidth / len);
		for (i = 0; i < len; i++) {
			offset = Math.abs(leftWidth) > Math.abs(leaveAverage) 
						? leaveAverage 
						: leftWidth;
			leftWidth -= offset;
			me.colsWidth[canExpand[i]] += offset;
			//计算最小宽度
			minWidth = me.minColsWidth[canExpand[i]];
			if (minWidth > me.colsWidth[canExpand[i]]){
				leftWidth += me.colsWidth[canExpand[i]] - minWidth;
				me.colsWidth[canExpand[i]] = minWidth;
			}
		}
		
		if (leftWidth < 0){
			//调整后一个出现宽度不够的问题，需要找前面宽裕的挤点空间
			i = 0;
			while (i < len && leftWidth != 0&&!me.autoResize) {
				minWidth = me.minColsWidth[canExpand[i]];
				if (minWidth < me.colsWidth[canExpand[i]]){
					offset = me.colsWidth[canExpand[i]] - minWidth;
					offset = offset > Math.abs(leftWidth) ? leftWidth : -offset;
					leftWidth += Math.abs(offset);
					me.colsWidth[canExpand[i]] += offset;
				}
				i++;
			}
		}else if (leftWidth > 0){
			//调整后一个出现宽度有多的问题，把多余的空间给到最前面
			me.colsWidth[canExpand[0]] += leftWidth;
		}
		
		//计算表格总宽度，记录元素宽度和原始锁定状态
		me.colsWidthBak = [];	//备份
		me.colsWidthLock = [];	//锁保持使用
		me.colsStateLock = [];	//锁保持使用
		width = 0;
		
		for (i = 0,len = me.colsWidth.length; i < len; i++){
			width += me.colsWidth[i];
			me.colsWidthBak[i] = me.colsWidth[i];
			me.colsWidthLock[i] = me.colsWidth[i];
			me.colsStateLock[i] = fields[i].locked ? true : false;
		}
		me._totalWidth = width;
    },
    
	/**
	 * 绘制横向滚动条
	 * @author linzhifeng@baidu.com
	 */	
	renderXScroll : function(){
		var me = this;
		if (!me.sxHandle){
			me.sxHandle = document.createElement('div');
			me.sxHandle.className = me.getClass('scroll_x_handle');
			me.sxContent = document.createElement('div');
			me.sxContent.style.borderBottom = '1px solid #ECECEC';		
			me.sxHandle.appendChild(me.sxContent);
			me.main.appendChild(me.sxHandle);	
			me.sxHandle.onscroll = function(){
				clearTimeout(me.sxTimer);
				me.sxTimer = setTimeout(me.getXScrollHandle(),50);
			};
		}
		if (me._width >= me._totalWidth){
			baidu.dom.hide(me.sxHandle);
			me.fixedOffsetHeight[me.fixedOffsetHeight.length - 1] = me.fixedOffsetHeight[me.fixedOffsetHeight.length - 2];
		}else{
			baidu.dom.show(me.sxHandle);
			me.fixedOffsetHeight[me.fixedOffsetHeight.length - 1] = me.fixedOffsetHeight[me.fixedOffsetHeight.length - 2] + me.sxHandle.offsetHeight;
		}
		me.topReseter && me.topReseter();
		if(me._totalWidth < 0){
			me._totalWidth = 0;
		}
		me.sxContent.style.width = me._totalWidth + 'px';
	//	me.sxHandle.style.width = me._totalWidth + 'px';
	},
	
    /**
     * 绘制表格头
     * 
     * @private
     */
    renderHead: function () {
        var me = this,
            type = 'head',
            id = me.getId(type),
            head = baidu.g(id),
			headChecked,
			headDisabled;
            
        if (me.noTitle) {
            return;
        }
        if (!head) {
            head = document.createElement('div');
            head.id = me.getId(type);
            head.className = me.getClass(type);
            head.setAttribute('control', me.id);
            
            // 绑定拖拽的事件处理
            if (me.dragable) {
                head.onmousemove = me.getHeadMoveHandler();
                head.onmousedown = me.getDragStartHandler();
            }
			
			// me.main有可能不存在   add By wanghuijun
			if (!me.main) {
				return;
			}
            me.main.appendChild(head);
        }    
        
		if(me.isSubTable){
			head.style.width = '100%';
		}else{
			head.style.width = me._width + 'px';//'100%';
		}
		
		// 这里不能提前赋值，selectAll = me.getHeadCheckbox()
		// selectAll != me.getHeadCheckbox()
		if (me.getHeadCheckbox()) {
			headChecked = me.getHeadCheckbox().checked;
			headDisabled = me.getHeadCheckbox().disabled;
		}
		
		// 这里给head重新赋值，如果原来为全选状态，会导致head的全选框状态恢复为未选状态
		// 所以在此处前判断全选状态，赋值之后重置全选状态
		// 正常逻辑在resize时不应该重新innerHTML，这里是临时修改方案，硬性修改了
		// add By wanghuijun
        head.innerHTML = me.getHeadHtml();
		
        if (me.getHeadCheckbox()) {
            me.getHeadCheckbox().checked = headChecked;
            me.getHeadCheckbox().disabled = headDisabled;
        }
        ui.Bubble.init(baidu.q('ui_bubble', this.main));       
    },
    
    /**
     * 获取表格头的html
     * 
     * @private
     * @return {string}
     */
    getHeadHtml: function () {
        var me = this,
            fields = this._fields,
            len = fields.length,
            html = [],
            i, field, title, canDragBegin, canDragEnd,
            thCellClass = me.getClass('thcell'),
            thTextClass = me.getClass('thtext'),
            sortClass   = me.getClass('thsort'),
            selClass    = me.getClass('thsel'),
            tipClass    = me.getClass('thhelp'),
            contentTpl = '<div class="{0}">{1}</div>',
            contentHtml,
            orderClass,
			alignClass,
            sortIconHtml,
            sortable,
			filterable,
			filterClass,
			filterColClass,
            tipHtml,
			nounHtml,
			dataLogTarget,
			currentSort;
        
        // 计算最开始可拖拽的单元格
        for (i = 0; i < len; i++) {
            if (typeof fields[i].dragable != 'undefined' && !fields[i].dragable) {
                canDragBegin = i + 1;
                break;
            }
        }
		if(me.dragable && typeof canDragBegin == "undefined"){
			canDragBegin = 0;
		}
		/*
        // 计算最后可拖拽的单元格
        for (i = len - 1; i >= 0; i--) {
            if (typeof fields[i].dragable == 'undefined' || fields[i].dragable) {
                canDragEnd = i;
                break;
            }
        }
        */
		
        // 拼装html
        html.push('<div class="ui_table_head_row">');
        html.push(ui.format(me.tplTablePrefix, '100%', me.id));//me._totalWidth - 2
        html.push('<tr>'); 
        for (i = 0; i < len; i++) {
			nounHtml = ''
			thTextClass = me.getClass('thtext');
            field = fields[i];
            title = field.title;
            sortable = (me.sortable && field.sortable);
            currentSort = (sortable 
                            && field.field 
                            && field.field == me.orderBy);
            
            /* 
             * 用bubble代替
             *小提示图标html
            tipHtml = '';
            if (!me.noTip && field.tip) {
                tipHtml = ui.format(me.tplTipIcon,
                                    tipClass,
                                    ui.ToolTip.getEventString(field.tip));
            }
            */
			
            // 计算排序图标样式
            sortIconHtml = '';
            orderClass = '';
            if (sortable) {
                if (currentSort) {
                    orderClass = ' ' + me.getClass('th' + me.order)
                                    + ' ' + me.getClass('thcell_sort');
                }             
                sortIconHtml = ui.format(me.tplSortIcon,
                                         sortClass);
				thTextClass += ' ' + sortClass;
            }
			
			// 计算表格对齐样式
			alignClass = '';
			if (field.align) {
				alignClass = ' table_align_' + field.align;
			}
            
            // 计算内容html
            // 如果通过function制定title，则不绘制排序小图标
            if (typeof title == 'function') {
                contentHtml = title.call(me);
                sortIconHtml = '';
            } else {
                contentHtml = title || '';
            }
            dataLogTarget = 'data-log={target:"tableHead_' + contentHtml.replace(/<[^>]+>/g, '') + '_btn"}';
			
			if(field.noun){
				var nounName = field.nounName || contentHtml;
				nounHtml = '<span class="ui_bubble " bubblesource="defaultHelp" bubbletitle="' + nounName + '">&nbsp;</span>';
			}
            contentHtml = ui.format(contentTpl, 
                                    		thTextClass, 
                                   			contentHtml);
			if (field.align == 'right') {
				contentHtml = nounHtml + contentHtml;
			}else{
				contentHtml = contentHtml + nounHtml;
			}
			
			filterColClass = '';
			filterable =  (me.filterable && field.filterable);
			if (filterable){
				
				if (me.filterCol[field.field]&&me.filterCol[field.field]==true){//只有filterCol[field.field]==true的时候才是真正有筛选 add by yanlingling
					//有筛选状态
					filterClass = me.getClass('thfilter') + ' ' + me.getClass('thfilter_active');
					filterColClass = ' ' + me.getClass('thfilterCol');
				}else{
					//无筛选状态
					filterClass = me.getClass('thfilter');
				}
				if (field.align == 'right'){
					contentHtml = '<a href="javascript:void(0)" id="' + me.getId('filter' + i) + '" class="' + filterClass +'" title="点击筛选">&nbsp;</a>' + contentHtml;
				}else{
					contentHtml += '<a href="javascript:void(0)" id="' + me.getId('filter' + i) + '" class="' + filterClass +'" title="点击筛选">&nbsp;</a>';
				}
			}
			
            html.push('<th id="' + this.getTitleCellId(i) + '" index="' + i + '"',
                        sortfilterAction(field, i),
                        (i >= canDragBegin ? ' dragright="1"' : ''),
                        (i > canDragBegin ? ' dragleft="1"' : ''),
                        ' style="width:' + me.colsWidth[i] + 'px;">',
                        '<div class="' + thCellClass + orderClass + alignClass + filterColClass +
                        (field.select ? ' ' + selClass : '') + '" ' + dataLogTarget + ' >',
                        contentHtml,
                        tipHtml,
                        '</div></th>');
        }
        html.push('</tr></table></div>');
        return html.join('');
        
        /**
         * 获取表格排序的单元格预定义属性html
         * 
         * @private
         * @internal
         * @return {string}
         */
        function sortfilterAction(field, index) {
            if ((me.sortable && field.sortable)||(me.filterable && field.filterable)) {
                return ui.format(
                            ' onmouseover="{0}" onmouseout="{1}" onclick="{2}"' +
                            ((me.sortable && field.sortable) ? ' sortable="1" ' : ''),
                            me.getStrRef() + '.titleOverHandler(this)',
                            me.getStrRef() + '.titleOutHandler(this)',
                            me.getStrRef() + '.titleClickHandler(this,event)');
            }
            
            return '';
        }
    },
    
    tplSortIcon: '<div class="{0}"></div>',
    tplTipIcon: '<div class="{0}" {1}></div>', //***提示模板，此处还未定实现方式
    
    /**
     * 获取表格头单元格的id
     * 
     * @private
     * @param {number} index 单元格的序号
     * @return {string}
     */
    getTitleCellId: function (index) {
        return this.getId('titleCell') + index;
    },
    
    /**
     * 表格头单元格鼠标移入的事件handler
     * 
     * @private
     * @param {HTMLElement} cell 移出的单元格
     */
    titleOverHandler: function (cell) {
        if (this.isDraging || this.dragReady) {
            return;
        }
        this.sortReady = 1;
        baidu.addClass(cell.firstChild, this.getClass('thcntr_hover'));
    },
    
    /**
     * 表格头单元格鼠标移出的事件handler
     * 
     * @private
     * @param {HTMLElement} cell 移出的单元格
     */
    titleOutHandler: function (cell) {
        this.sortReady = 0;
        baidu.removeClass(cell.firstChild, this.getClass('thcntr_hover'));
    },
    /**
     * 点击表格头进行排序触发的事件，Table控件并没有提供任何内置的排序支持，因此需要外部使用者实现，包括更新表格数据源、重新渲染表格
     * @event onsort
     * @param {Object} field 过滤的当前列的配置信息，对象数据结构参加表格的fields配置
     * @param {String} order 排序的方式，升序or降序，对应的值为'asc'和'desc'
     */
    onsort: new Function(),
    /**
     * 点击过滤按钮触发的事件，Table控件并没有提供任何过滤的内置支持，因此需要外部使用者实现，包括更新表格数据源、重新渲染表格
     * @event onfilter
     * @param {Object} field 过滤的当前列的配置信息，对象数据结构参加表格的fields配置
     * @param {HTMLElement} target 触发过滤的DOM元素
     */
	onfilter : new Function(),
	
    /**
     * 表格头单元格点击的事件handler
     * 
     * @private
     * @param {HTMLElement} cell 点击的单元格
     * @modify by zhouyu01@baidu.com
     */
    titleClickHandler: function (cell,event) {
        if (this.sortReady) { // 避免拖拽触发排序行为
            var me = this,
                field = me._fields[cell.getAttribute('index')],
                orderBy = me.orderBy,
                order = me.order,
				event = event || window.event,
				target = event.target || event.srcElement,
				logParams = {};
			if(baidu.dom.hasClass(target, 'ui_bubble_icon_help')){
				return ;
			}
			//筛选	
			if (field.filterable && baidu.dom.hasClass(target, me.getClass('thfilter'))){
				me.onfilter.call(me, field, target);
            	me.renderHead();
				logParams.target = baidu.string.toCamelCase("filter_" + me.id + "_" + field.field) + "_" + me.type + "_btn";
				logParams.action = "filter";
				logParams.column = field.field;
				NIRVANA_LOG.send(logParams);
				return;
			}
			if(!field.sortable){
			    return;
			}
              
			//排序
			if (orderBy == field.field) {
                order = (!order || order == 'asc') ? 'desc' : 'asc';
            } else {
                order = 'desc';
            }
			//这里me.orderBy 要在onsort之前赋值，否则onsort中存在refresh的时候渲染table所用的orderBy是上一次点击的单元格
            me.order = order;
            me.orderBy = field.field;
            me.onsort.call(me, field, order);
            me.renderHead();
			logParams.target = baidu.string.toCamelCase("order_" + me.id + "_" + field.field) + "_" + me.type + "_btn";
			logParams.action = "order";
			logParams.column = field.field;
			logParams.order = order;
			NIRVANA_LOG.send(logParams);
        }
    },
    
    /**
     * 获取表格头鼠标移动的事件handler
     * 
     * @private
     * @return {Function}
     */
    getHeadMoveHandler: function () {
        var me = this,
            dragClass = me.getClass('startdrag'),
            page = baidu.page,
            range = 8; // 可拖拽的单元格边界范围
            
        return function (e) {
            if (me.isDraging) {
                return;
            }
            
            e = e || window.event;
            var tar = e.srcElement || e.target,
                pageX = e.pageX || e.clientX + page.getScrollLeft(),
                pos, 
                index,
                sortable;
            
            // 寻找th节点。如果查找不到，退出
            tar = me.findDragCell(tar);
            if (!tar) {
                return;
            }
            
            // 获取位置与序号
            pos = baidu.dom.getPosition(tar);
            index = tar.getAttribute('index');
            sortable = tar.getAttribute('sortable');
            filterable = tar.getAttribute('filterable');
            
            // 如果允许拖拽，设置鼠标手型样式与当前拖拽点
            if (tar.getAttribute('dragleft') 
                && pageX - pos.left < range
            ) {
                (sortable || filterable) && (me.titleOutHandler(tar)); // 清除可排序列的over样式
                baidu.addClass(this, dragClass);
                me.dragPoint = 'left';
                me.dragReady = 1;
            } else if (tar.getAttribute('dragright') 
                       && pos.left + tar.offsetWidth - pageX < range
            ) {
                (sortable || filterable) && (me.titleOutHandler(tar)); // 清除可排序列的over样式
                baidu.addClass(this, dragClass);
                me.dragPoint = 'right';
                me.dragReady = 1;
            } else {
                baidu.removeClass(this, dragClass);
                (sortable || filterable) && (me.titleOverHandler(tar)); // 附加可排序列的over样式
                me.dragPoint = '';
                me.dragReady = 0;
            }
        };
    },
    
    /**
     * 查询拖拽相关的表格头单元格
     * 
     * @private
     * @param {HTMLElement} target 触发事件的元素
     * @return {HTMLTHElement}
     */
    findDragCell: function (target) {    
        while (target.nodeType == 1) {
            if (target.tagName == 'TH') {
                return target;
            }
            target = target.parentNode;
        }
        
        return null;
    },
    
	/**
	 * 获取列锁定事件handler
	 */
	getLockXHandler : function(){
		var me = this;
		
		return function(e){
			e = e || window.event;
            var tar = e.target || e.srcElement,
			    idx = +tar.getAttribute('index'),
			    i,len;	
			if (!idx || !me._fields[idx]){
				return;
			}
					
			if (me._fields[idx].locked){
				//选择以后的状态设为未锁定
				for (i = idx, len = me._fields.length; i < len; i++){
					me._fields[i].locked = false;
					me.colsStateLock[i] = false;
					me.colsWidth[i] = me.colsWidthLock[i];
					me.colsWidthBak[i] = me.colsWidthLock[i];
				}
			}else{
				//选择以及选择以前状态为锁定
				for (i = 0; i <= idx; i++){
					me._fields[i].locked = true;
					me.colsStateLock[i] = true;
					me.colsWidthBak[i] = me.colsWidth[i];
				}
				//选择以后的状态设为未锁定
				for (i = idx + 1, len = me._fields.length; i < len; i++){
					me._fields[i].locked = false;
					me.colsStateLock[i] = false;
					me.colsWidth[i] = me.colsWidthLock[i];
					me.colsWidthBak[i] = me.colsWidthLock[i];
				}	
			}
			me.renderHead();
			
			//修正滚动宽度
			me._totalWidth = 0;
			for (i = 0, len = me.colsWidth.length; i < len; i++){
				me._totalWidth += me.colsWidth[i];
			}
			if (me._width >= me._totalWidth){
				baidu.dom.hide(me.sxHandle);
				me.fixedOffsetHeight[me.fixedOffsetHeight.length - 1] = me.fixedOffsetHeight[me.fixedOffsetHeight.length - 2];
			}else{
				baidu.dom.show(me.sxHandle);
				me.fixedOffsetHeight[me.fixedOffsetHeight.length - 1] = me.fixedOffsetHeight[me.fixedOffsetHeight.length - 2] + me.sxHandle.offsetHeight;
			}
			me.topReseter();
			me.sxContent.style.width = me._totalWidth + 'px';
			me.sxHandle.scrollLeft = 0;
		}
	},
	
    /**
     * 获取表格头鼠标点击拖拽起始的事件handler
     * 
     * @private
     * @return {Function}
     */
    getDragStartHandler: function () {
        var me = this,
            dragClass = me.getClass('startdrag');
            
        return function (e) {
			e = e || window.event;
            var tar = e.target || e.srcElement;
			
			// 寻找th节点，如果查找不到，退出
            tar = me.findDragCell(tar);
            if (!tar) {
                return;
            }
			
            if (baidu.g(me.getId('head')).className.indexOf(dragClass) < 0) {
                return;
            }            
                        
            // 获取显示区域高度
            me.htmlHeight = document.documentElement.clientHeight;
            
            // 记忆起始拖拽的状态
            me.isDraging = true;
            me.dragIndex = tar.getAttribute('index');
            me.dragStart = e.pageX || e.clientX + baidu.page.getScrollLeft();
            
            // 绑定拖拽事件
            document.onmousemove = me.getDragingHandler();
            document.onmouseup = me.getDragEndHandler();
            
            // 显示拖拽基准线
            me.showDragMark(me.dragStart);
            
            // 阻止默认行为
            baidu.event.preventDefault(e);
            return false;
        };
    },
    
    /**
     * 获取拖拽中的事件handler
     * 
     * @private
     * @desc 移动拖拽基准线
     * @return {Function}
     */
    getDragingHandler: function () {
        var me = this;
        return function (e) {
            e = e || window.event;
            me.showDragMark(e.pageX || e.clientX + baidu.page.getScrollLeft());
            baidu.event.preventDefault(e);
            return false;
        };
    },
    
    /**
     * 显示基准线
     * 
     * @private
     */
    showDragMark: function (left) {
        var me = this,
            mark = me.getDragMark();
        
        if (!me.top) {
            me.top = baidu.dom.getPosition(me.main).top;
        }    
        
        if (!mark) {
            mark = me.createDragMark();
        }
        
        mark.style.top = me.top + 'px';
        mark.style.left = left + 'px';
        mark.style.height = me.htmlHeight - me.top + baidu.page.getScrollTop() + 'px';
    },
    
    /**
     * 隐藏基准线
     * 
     * @private
     */
    hideDragMark: function () {
        var mark = this.getDragMark();
        mark.style.left = '-10000px';
        mark.style.top = '-10000px';
    },
    
    /**
     * 创建拖拽基准线
     * 
     * @private
     * @return {HTMLElement}
     */
    createDragMark: function () {
        var mark = document.createElement('div');
        mark.id = this.getId('dragMark');
        mark.className = this.getClass('mark');
        mark.style.top = '-10000px';
        mark.style.left = '-10000px';
        document.body.appendChild(mark);
        
        return mark;
    },
    
    /**
     * 获取基准线的dom元素
     * 
     * @private
     * @return {HTMLElement}
     */
    getDragMark: function () {
        return baidu.g(this.getId('dragMark'));
    },
    
    /**
     * 获取拖拽结束的事件handler
     * 
     * @private
     * @return {Function}
     */
    getDragEndHandler: function () {
        var me = this;
        return function (e) {
            e = e || window.event;
            var minWidth,
                index = parseInt(me.dragIndex, 10),
                pageX = e.pageX || e.clientX + baidu.page.getScrollLeft(),
                offsetX,
                fields = me._fields, field,
                fieldLen = fields.length,
                alters = [], alterWidths = [], alter, alterLen, alterWidth, alterSum = 0,
                colsWidth = me.colsWidth,
                leave, i, revise = 0, totalWidth,
                offsetWidth, currentWidth, roughWidth;

            // 校正拖拽元素
            // 如果是从左边缘拖动的话，拖拽元素应该上一列
            if (me.dragPoint == 'left') {
                index--;
            }
            
			minWidth = me.minColsWidth[index];
            // 校正拖拽列的宽度
            // 不允许小于最小宽度
            offsetX = pageX - me.dragStart;
            currentWidth = colsWidth[index] + offsetX;
            if (currentWidth < minWidth) {
                offsetX += (minWidth - currentWidth);
                currentWidth = minWidth;
            }
			
			if (colsWidth[index] > currentWidth){
				/* 拖拽减少列宽
				 *
				 * 如果拖拽减少宽度需要判断当前是否都已经显示了
				 * 		如果是，则改变其他允许改变宽度的列
				 * 		如果不是，则还有其他未完全显示的列，修正宽度后显示其他列即可
				 */
				if (me._width >= me._totalWidth){			//当前已经全显示
					//查找宽度允许改变的列
		            for (i = 0; i < fieldLen; i++) {
		                if (!fields[i].stable && i != index) {
		                    alters.push(i);
		                    alterWidth = colsWidth[i];
		                    alterWidths.push(alterWidth);
		                    alterSum += alterWidth;
		                }
		            }
					// 计算允许改变的列每列的宽度
					leave = offsetX;
            		alterLen = alters.length;
					for (i = 0; i < alterLen; i++) {
		                alter = alters[i];
		                alterWidth = alterWidths[i];    //当前列宽
		                roughWidth = offsetX * alterWidth / alterSum; // 变更的列宽
		                
		                // 校正变更的列宽
		                // roughWidth可能存在小数点
		                if (leave > 0) {
		                    offsetWidth = Math.ceil(roughWidth);
		                } else {
		                    offsetWidth = Math.floor(roughWidth);
		                }
		                offsetWidth = (Math.abs(offsetWidth) < Math.abs(leave) ? offsetWidth : leave);
		                
		                // offsetWidth为负数，宽度增加的，可以保证不少于最小宽度
		                alterWidth -= offsetWidth;
		                leave -= offsetWidth;
		                colsWidth[alter] = alterWidth;
		            }
				}else{										//还有没被显示的列
				    if (me._totalWidth - me._width < offsetX){
						// 拖拽列的宽度变为差距
						currentWidth = colsWidth[index] + me._totalWidth - me._width;					
					}
					me._totalWidth -= (colsWidth[index] - currentWidth);							
				}
			}else{
				// 拖拽增加列宽
				me._totalWidth -= (colsWidth[index] - currentWidth);
			}
			
			if (me._width >= me._totalWidth){
				baidu.dom.hide(me.sxHandle);
				me.fixedOffsetHeight[me.fixedOffsetHeight.length - 1] = me.fixedOffsetHeight[me.fixedOffsetHeight.length - 2];
			}else{
				baidu.dom.show(me.sxHandle);
				me.fixedOffsetHeight[me.fixedOffsetHeight.length - 1] = me.fixedOffsetHeight[me.fixedOffsetHeight.length - 2] + me.sxHandle.offsetHeight;
			}
			if (me.scrollYFixed) {
				me.topReseter();
			}
			me.sxContent.style.width = me._totalWidth + 'px';
			
            colsWidth[index] = currentWidth;
			me.colsWidthBak[index] = currentWidth;
			me.colsWidthLock[index] = currentWidth;
			
            // 重新绘制每一列
            me.resetColumns();
            
            // 清除拖拽向全局绑定的事件
            document.onmousemove = null;
            document.onmouseup = null;
            
            me.isDraging = false;
            me.hideDragMark();
            
            baidu.event.preventDefault(e);
            return false;
        };
    },
    
    /**
     * 绘制表格主体
     * 
     * @private
     */
    renderBody: function () {
        var me = this,
            type = 'body',
            id = me.getId(type),
            list = baidu.g(id),
            style;
            
        if (!list) {
            list = document.createElement('div');
            list.id = id;
            list.className = me.getClass(type);
            
            me.main.appendChild(list);
        }

        list.style.width = '100%';
        list.innerHTML = me.getBodyHtml();
		
		/*if (me.bodyHeight && list.offsetHeight > me.bodyHeight) { // 只有表格高度高出设置高度时，才出现滚动
			style = list.style;
			style.height = me.bodyHeight + 'px';
			style.overflowX = 'hidden';
			style.overflowY = 'auto';
		} */ 
        if (me.datasource && me.datasource.length > 0 && me.select === 'multi') {
            var checkbox = me.getHeadCheckbox();
            checkbox.checked = this.isAllSelected();
        }
    },
    isAllSelected: function() {
        if (this.select !== 'multi') return false;

        var inputs = $$('td[col="0"] input', this.main);

        var input;
        for (var i = 0, len = inputs.length; i < len; i++) {
            input = inputs[i];
            if (input && !input.checked) {
                return false;
            }
        }
        return true;
    },
    /**
     * 获取表格主体的html
     * 
     * @private
     * @return {string}
     */
    getBodyHtml: function () {
        var data = this.datasource || [],
            noDataHtml = this.noDataHtml || '',
			dataLen = data.length,
            html = [],
            i, j, item, field;
        
        if (!dataLen) {
            return noDataHtml;
        }
        
        for (i = 0; i < dataLen; i++) {
            item = data[i];
            html.push(this.getRowHtml(item, i));
        }
        
        return html.join('');
    },
    
    tplRowPrefix: '<div id="{0}" class="{1}" onmouseover="{2}" onmouseout="{3}" onclick="{4}">',
    
    /**
     * 获取表格体的单元格id
     * 
     * @protected
     * @param {number} rowIndex 当前行序号
     * @param {number} fieldIndex 当前字段序号
     * @return {string}
     */
    getBodyCellId: function (rowIndex, fieldIndex) {
        return this.getId('cell') + rowIndex + "_" + fieldIndex;
    },
    
    /**
     * 获取表格行的html
     * 
     * @protected
     * @param {Object} data 当前行的数据
     * @param {number} index 当前行的序号
     * @param {string} mark 可添加的class值，主要用于appendRows 	by mayue@baidu.com
     * @return {string}
     */
    getRowHtml: function (data, index, mark) {
        var me = this,
            html = [],
            fields = me._fields,
            fieldLen = fields.length,
            colWidth,
            content,
            tdCellClass = me.getClass('tdcell'),
            tdBreakClass = me.getClass('tdbreak'),
            tdClass,
			alignClass,
			sortClass,
            subrow = me.subrow && me.subrow != 'false',
            subentry,
            subentryHtml,
            contentHtml,
            mark = mark ? ' '+mark : '',
            i, field;
            
        html.push(ui.format(me.tplRowPrefix,
                            me.getId('row') + index,
                            me.getClass('row') + mark,
                            me.getStrCall('rowOverHandler', index),
                            me.getStrCall('rowOutHandler', index),
                            me.getStrCall('rowClickHandler', index)),
                  ui.format(me.tplTablePrefix, '100%', me.id));//me._totalWidth - 2

        for (i = 0; i < fieldLen; i++) {
            field = fields[i];
            content = field.content;
            colWidth = me.colsWidth[i];
            subentry = subrow && field.subEntry;
			if(field.subEntry&&field.subEntryTipOpen){
				me.subEntryTipOpen = field.subEntryTipOpen;
			}
            tdClass = field.breakLine ? tdBreakClass : tdCellClass;
            if (field.select) {
                tdClass += " " + me.getClass('tdsel');
            }
			
			// 计算表格对齐样式
			alignClass = '';
			if (field.align) {
				alignClass = ' table_align_' + field.align;
			}
			
			//计算表格排序样式
			sortClass = ''
			if (field.field && field.field == me.orderBy) {
				sortClass = ' td_sort';
			}
			
            contentHtml = '<div class="' + tdClass + alignClass + '">'
                            + ('function' == typeof content ? content.call(me, data, index, i) : data[content])
                            + '</div>';

            subentryHtml = '&nbsp;';
            if (subentry) {
                if (typeof field.isSubEntryShow != 'function'
                    || field.isSubEntryShow.call(me, data, index, i) !== false
                ) {
                    subentryHtml = me.getSubEntryHtml(index);
                }
                
                contentHtml = '<table width="100%" collpadding="0" collspacing="0">'
                                + '<tr><td >' + subentryHtml 
                                 + contentHtml + '</td></tr></table>';
            }
			
            html.push('<td id="' + me.getBodyCellId(index, i) + '"',
                    'class="' + sortClass + (subentry ? me.getClass('subentryfield') : '') + '"',
                    ' style="width:' + colWidth + 'px;" control="' + me.id,
                    '" row="' + index + '" col="' + i + '">',
                    contentHtml,
                    '</td>');
        }
        html.push('</tr></table></div>');
        
        // 子行html
        if (subrow) {
            html.push(me.getSubrowHtml(index));
        }
        
        return html.join('');
    },
    
    /**
     * 表格行鼠标移上的事件handler
     * 
     * @private
     * @param {number} index 表格行序号
     */
    rowOverHandler: function (index) {
        if (this.isDraging) {
            return;
        }
        
        var row = this.getRow(index);
        if (row) {
			if(opened&&this.matchRow){
				var el = baidu.g(this.getSubentryId(index)),
				opened = /subentry_opened/.test(el.className);
				return;
			}
            baidu.addClass(row, this.getClass('row_over'));
        }
    },
    
    /**
     * 表格行鼠标移出的事件handler
     * 
     * @private
     * @param {number} index 表格行序号
     */
    rowOutHandler: function (index) {
        var row = this.getRow(index);
        if (row) {
            baidu.removeClass(row, this.getClass('row_over'));
        }
    },
	
    /**
     * 绘制表格底部
     * 
     * @private
     */
	renderFoot : function() {
		var me = this,
            data = me.datasource || [],
			type = 'foot',
            id = me.getId(type),
            list = baidu.g(id),
            style,
			dataLen = data.length;
        
		// 如果没有数据，则直接不渲染表尾
        if (!dataLen) {
			if (list) {
				 list.parentNode.removeChild(list);
			}
            return;
        }
		
        if (!me.hasFoot) {
			if (list) {
				 list.parentNode.removeChild(list);
			}
            return;
        }
            
        if (!list) {
            list = document.createElement('div');
            list.id = id;
            list.className = me.getClass(type);
            
            me.main.appendChild(list);
        }

        list.style.width = '100%';
        list.innerHTML = me.getFootHtml();
	},
    
    /**
     * 获取表格底部的html
     * 
     * @private
     * @return {string}
     */
    getFootHtml: function () {
        var data = this.footdata || [],
			dataLen = data.length,
            html = [],
            i, j, item, field;
        
        if (!dataLen) {
            return '';
        }
        
        for (i = 0; i < dataLen; i++) {
            item = data[i];
            html.push(this.getFootRowHtml(item, i));
        }
        
        return html.join('');
    },
	
    /**
     * 获取表格尾部行的html
     * 
     * @protected
     * @param {Object} data 当前行的数据
     * @param {number} index 当前行的序号
     * @return {string}
     */
    getFootRowHtml: function (data, index) {
        var me = this,
            html = [],
            fields = me._fields,
            fieldLen = fields.length,
            colWidth,
            content,
            tdClass,
			alignClass,
            contentHtml,
            i, field;
            
        html.push('<div class="ui_table_foot_row">');
        html.push(ui.format(me.tplTablePrefix, '100%', me.id)); //me._totalWidth - 2

        for (i = 0; i < fieldLen; i++) {
            field = fields[i];
			tdClass = me.getClass('tdcell');
            content = field.footContent;
            colWidth = me.colsWidth[i];
			
			// 计算表格对齐样式
			alignClass = '';
			if (field.align) {
				alignClass = ' table_align_' + field.align;
			}
			
			if('function' == typeof content){
				content = content.call(me, data, index, i);
			} else if ('undefined' != typeof content){
				content = data[content];
			}
			
			if ('undefined' == typeof content) { // 如果该列没有数据
				tdClass += ' heightHide';
			}		
            contentHtml = '<div class="' + tdClass + alignClass + '">'
                            + content
                            + '</div>';

            html.push('<td id="' + me.getBodyCellId(index, i) + '"',
                    ' style="width:' + colWidth + 'px" control="' + me.id,
                    '" row="' + index + '" col="' + i + '">',
                    contentHtml,
                    '</td>');
        }
        html.push('</tr></table></div>');
        
        return html.join('');
    },
	
    /**
     * 阻止行选，用于点击在行的其他元素，不希望被行选时。<br/>
     * 该方法只用在当selectMode是行的时候，当前表格控件默认选择模式不是行。
     * @method preventLineSelect
     * @public
     */
    preventLineSelect: function () {
        this.dontSelectLine = 1;
    },
    
    /**
     * 表格行鼠标点击的事件handler
     * 
     * @private
     * @param {number} index 表格行序号
     */
    rowClickHandler: function (index) {
        this.curRow = index;
        if (this.selectMode == 'line') {
            if (this.dontSelectLine) {
                this.dontSelectLine = false;
                return;
            }
            
            var input;
            
            switch (this.select) {
                case 'multi':
                    input = baidu.g(this.getId('multiSelect') + index);
                    // 如果点击的是checkbox，则不做checkbox反向处理
                    if (!baidu.lang.hasValue(this.preSelectIndex)) {
                        input.checked = !input.checked;
                    }
                    this.selectMulti(index);
                    this.preSelectIndex = null;
                    break;
                case 'single':
                    input = baidu.g(this.getId('singleSelect') + index);
                    input.checked = true;
                    this.selectSingle(index);
                    break;
            }
        }
    },
    
    /**
     * subrow入口的html模板
     * 
     * @private
     */
    tplSubEntry: '<div class="{0}" onmouseover="{2}" onmouseout="{3}" onclick="{4}" id="{1}" title="{5}"></div>',
    
    getSubEntryHtml: function(index) {
        var me = this;
        return ui.format(me.tplSubEntry,
                         me.getClass('subentry'),
                         me.getSubentryId(index),
                         me.getStrCall('entryOver', index),
                         me.getStrCall('entryOut', index),
                         me.getStrCall('fireSubrow', index),
                         me.subEntryTipOpen);
    },
    
    getSubrowHtml: function (index) {
        return '<div id="' + this.getSubrowId(index)
                    + '" class="' + this.getClass('subrow') + '"'
                    + ' style="display:none"></div>';
    },
    /**
     * 获取指定行索引用于渲染子行的容器元素
     * @param {Number} index 行的索引
     * @return {HTMLElement}
     */
    getSubrow: function (index) {
        return baidu.g(this.getSubrowId(index));    
    },
    
    getSubrowId: function (index) {
        return this.getId('subrow') + index;
    },
    
    getSubentryId: function (index) {
        return this.getId('subentry') + index;
    },
    
    entryOver: function (index) {
        var el = baidu.g(this.getSubentryId(index)),
            opened = /subentry_opened/.test(el.className),
            classBase = 'subentry_hover';
            
        if (opened) {
            classBase = 'subentry_opened_hover';
        }    
        
        baidu.addClass(el, this.getClass(classBase));
    },
    
    entryOut: function (index) {
        var id = this.getSubentryId(index);
        baidu.removeClass(id, this.getClass('subentry_hover'));
        baidu.removeClass(id, this.getClass('subentry_opened_hover'));
    },
    
    fireSubrow: function (index) {
        var me = this,
            currentIndex = me.subrowIndex,
            datasource = me.datasource,
            dataLen = (datasource instanceof Array && datasource.length),
            dataItem;
        
        if (!dataLen || index >= dataLen) {
            return;
        }
        
        if (currentIndex !== index) {
            dataItem = datasource[index];
            if (me.onsubrowopen(index, dataItem) !== false) {
                me.openSubrow(index);
            }
        } else {
			if (me.onsubrowclose(index) !== false) {
				me.closeSubrow(currentIndex);
				setTimeout(function(){
					baidu.event.fire(window, 'resize');
				}, 300);
			}
        }
		//打开子表格，scrollTop会发生改变，IE的onscroll事件监听不到这种情况，手动调用topReseter
		// modify by zhouyu
		if (me.scrollYFixed && baidu.ie && me.topReseter) {
			me.topReseter();
		}
        me.entryOver(index);
    },
    
    closeSubrow: function (index) {
        var me = this,
            subrowId = me.getSubrowId(index),
            entryId = me.getSubentryId(index);
        me.entryOut(index);
        me.subrowIndex = null;
        baidu.removeClass(entryId, me.getClass('subentry_opened'));
        baidu.removeClass(me.getRow(index), me.getClass('row_unfolded'));
		if(me.matchRow){
			baidu.removeClass(me.getRow(index), me.getClass('row_unfolded_matchRow'));
			baidu.removeClass(me.getRow(index).nextSibling, me.getClass('row_unfolded_matchsubRow'));
		}
        baidu.hide(subrowId);
        baidu.setAttr(entryId, 'title', me.subEntryTipOpen);
        
        return true;
    },
    /**
     * 展开表格子行触发的事件，即显示行的子行
     * @event onsubrowopen
     * @param {Number} index 所要展开的行的索引
     * @param {Object} data 该行所绑定的数据记录，具体参见表格datasource的配置
     * @return {Boolean} 返回false，不展开子行
     */
    onsubrowopen: new Function(),
	/**
     * 折叠表格子行触发的事件，即显示行的子行<br/>
     * NOTICE: 对于互斥导致的行自动折叠，不会触发折叠的事件，必须是用户手动关闭才会触发
     * @event onsubrowclose
     * @param {Number} index 所要折叠的行的索引
     * @return {Boolean} 返回false，不折叠子行
     */
    onsubrowclose: new Function(),
    
    openSubrow: function (index) {
        var me = this,
            currentIndex = me.subrowIndex,
            entry = baidu.g(me.getSubentryId(index));
        
        if (baidu.lang.hasValue(currentIndex)) {
            me.closeSubrow(currentIndex);
        }
        
        baidu.addClass(entry, me.getClass('subentry_opened'));
        baidu.addClass(me.getRow(index), me.getClass('row_unfolded'));
		if(me.matchRow){
			baidu.addClass(me.getRow(index), me.getClass('row_unfolded_matchRow'));
			baidu.addClass(me.getRow(index).nextSibling, me.getClass('row_unfolded_matchsubRow'));
		}
        entry.setAttribute('title', me.subEntryTipClose);
        baidu.show(me.getSubrowId(index));
        me.subrowIndex = index;
    },
    
    /**
     * 初始化resize的event handler
     * 
     * @private
     */
    initResizeHandler: function () {
        var me = this;
		if (!me.autoResize){
		   // return;
		}
        me.viewWidth = baidu.page.getViewWidth();
        me.viewHeight = baidu.page.getViewHeight();
        
        me.resizeHandler = function () {
            var viewWidth = baidu.page.getViewWidth(),
                viewHeight = baidu.page.getViewHeight();
              
            if (viewWidth == me.viewWidth
                && viewHeight == me.viewHeight) {
				setTimeout(function(){
					if(me.isSubTable){
						return;
					}
					if (me._width != me.getWidth()){
						//数据填入后发现宽度变化了（主要是滚动条出现或消失后导致宽度变化），修正一下宽度
						me.handleResize();
						me.renderHead();//表头总是有问题，不知道为什么，先牺牲一下性能
					}
				},500);
                return;
            }
            me.viewWidth = viewWidth;
            me.viewHeight = viewHeight;
			me.handleResize();
			me.renderHead();//表头总是有问题，不知道为什么，先牺牲一下性能
			setTimeout(function(){
				if (me._width != me.getWidth()){
					//数据填入后发现宽度变化了（主要是滚动条出现或消失后导致宽度变化），修正一下宽度
					me.handleResize();
					me.renderHead();//表头总是有问题，不知道为什么，先牺牲一下性能
				}
			},500);
			return;
        };
        baidu.on(window, 'resize', me.resizeHandler);
    },
	
	/**
	 * 浏览器resize
	 */
    handleResize: function () {
        var me = this,
            head = baidu.g(me.getId('head'));
		
		// add by wanghuijun
		if (!me.main) {
			return;
		}
        me._width = me.getWidth();
        // 设置主区域宽度
        me.main.style.width = me._width + 'px';
        //baidu.g(me.getId('body')).style.width = me._width + 'px';
        //head && (head.style.width = me._width + 'px');
        
        // 重新绘制每一列	
		me.initColsWidth();
		//console.log(me._totalWidth +'  ' + me._width);
        me.resetColumns();	
		if (me.scrollYFixed){
			var domFixedList = baidu.dom.q('scroll_y_top_fixed'),
			    domWidth;
			for (var i = 0, len = domFixedList.length; i < len; i++){
				domWidth = me._width - me.fixedWidth[i];
				domWidth = domWidth > 0 ? domWidth : 0;
				domFixedList[i].style.width = domWidth + 'px';
			}
			me.sxHandle.style.width = me._width + 'px';
			me.getHead().style.width = me._width + 'px';
			
			if (me._width >= me._totalWidth){
				baidu.dom.hide(me.sxHandle);
				me.fixedOffsetHeight[me.fixedOffsetHeight.length - 1] = me.fixedOffsetHeight[me.fixedOffsetHeight.length - 2];
			}else{
				baidu.dom.show(me.sxHandle);
				me.fixedOffsetHeight[me.fixedOffsetHeight.length - 1] = me.fixedOffsetHeight[me.fixedOffsetHeight.length - 2] + me.sxHandle.offsetHeight;
			}
			me.topReseter();
			me.sxContent.style.width = me._totalWidth + 'px';
			me.sxHandle.scrollLeft = 0;
		}	
    },
    
	/**
	 * 纵向锁定初始化
	 */
	initTopResetHandler : function(){
		var me = this,
			domFixedList = baidu.dom.q('scroll_y_top_fixed'),
			domSxHandle = me.sxHandle,
			domHead = me.getHead(),
			i,len,fWidth,style2Nun,domFixedPlace,domPlaceholder,domShadow;
		
		if (!me.scrollYFixed){
			return;
		}
		
		domFixedPlace = document.createElement('div');	//标记位置
		domFixedPlace.id = me.getId('domFixedPlace');
		domFixedPlace.style.width = '100%';
		domFixedPlace.style.height = '1px';
		if (domFixedList[0]){
			baidu.dom.insertBefore(domFixedPlace,domFixedList[0]);
		}else{
			baidu.dom.insertBefore(domFixedPlace,domPlaceholder);
		}
		me.fixedTop = baidu.dom.getPosition(domFixedPlace).top;
		baidu.hide(domFixedPlace);
		
		domPlaceholder = document.createElement('div');	//占位用的，否则元素浮动后原位置空了将导致页面高度减少，影响滚动条
		//domPlaceholder.id = 'TopResetPlaceholder';
		baidu.dom.insertBefore(domPlaceholder,domSxHandle);
		domPlaceholder.style.width = '100%';
		baidu.hide(domPlaceholder);
		
		domShadow = document.createElement('div');	//行隐藏提示阴影
		domShadow.className = me.getClass('domShadow');
		//domPlaceholder.id = 'TopResetPlaceholder';
		baidu.dom.insertBefore(domShadow,domSxHandle);
		domShadow.style.width = '100%';
		baidu.hide(domShadow);
		/**
		 * 偏移索引计算
		 */
		me.fixedWidth = [];
		me.fixedOffsetHeight[0] = 0;
		for (i = 0, len = domFixedList.length; i < len; i++){
			fWidth = 0;
			style2Nun = baidu.dom.getStyle(domFixedList[i], 'padding-left');
			style2Nun = style2Nun == '' ? 0 : +(style2Nun.replace('px',''));
			fWidth += style2Nun;
			style2Nun = baidu.dom.getStyle(domFixedList[i], 'padding-right');
			style2Nun = style2Nun == '' ? 0 : +(style2Nun.replace('px',''));
			fWidth += style2Nun;
			/*
			style2Nun = baidu.dom.getStyle(domFixedList[i], 'border-left-width');
			style2Nun = style2Nun == '' ? 0 : +(style2Nun.replace('px',''));
			fWidth += style2Nun;
			style2Nun = baidu.dom.getStyle(domFixedList[i], 'border-right-width');
			style2Nun = style2Nun == '' ? 0 : +(style2Nun.replace('px',''));
			fWidth += style2Nun;
			*/
			me.fixedWidth[i] = fWidth;			 
			domFixedList[i].style.width = me._width - fWidth + 'px';
			
			me.fixedOffsetHeight[i + 1] = me.fixedOffsetHeight[i] + domFixedList[i].offsetHeight;
		}
		me.fixedOffsetHeight[me.fixedOffsetHeight.length] = me.fixedOffsetHeight[me.fixedOffsetHeight.length - 1] + domSxHandle.offsetHeight;
		
		domSxHandle.style.width = me._width + 'px';
		domHead.style.width = me._width + 'px';
				
        me.topReseter = function () {
            var scrollTop = baidu.page.getScrollTop(),	             
				posTop,
				fhLen = me.fixedOffsetHeight.length, 
	            posStyle = 'relative';
	        
	       // 2x2的判断，真恶心
	        if (baidu.ie && baidu.ie < 7) {
	            if (scrollTop >= me.fixedTop) {
					posStyle = 'absolute';
	                posTop = scrollTop + 10;
					domPlaceholder.style.height = me.fixedOffsetHeight[fhLen - 1] + domHead.offsetHeight + 'px';
					baidu.show(domPlaceholder);
					for(var i = 0,len = domFixedList.length; i < len; i++){
						domFixedList[i].style.top = me.fixedOffsetHeight[i] + scrollTop + 'px';
						domFixedList[i].style.zIndex = '2';
	        			domFixedList[i].style.position = posStyle;
					}
					
					domSxHandle.style.top = me.fixedOffsetHeight[fhLen - 2] + scrollTop + 'px';
					domSxHandle.style.zIndex = '2';
	        		domSxHandle.style.position = posStyle;
					
					domHead.style.top = me.fixedOffsetHeight[fhLen - 1] + scrollTop + 'px';
					domHead.style.zIndex = '2';
	        		domHead.style.position = posStyle;
					
					if (scrollTop != me.fixedTop){
						domShadow.style.top = me.fixedOffsetHeight[fhLen - 1] + scrollTop + 31 + 'px';
						domShadow.style.width = me._width + 'px';
						domShadow.style.zIndex = '2';
		        		domShadow.style.position = posStyle;
						baidu.show(domShadow);
					}else{
						baidu.hide(domShadow);
					}
	            } else {
					domPlaceholder.style.height = 0;
					baidu.hide(domPlaceholder);
					baidu.hide(domShadow);
					
	                posStyle = 'relative';
					
					for(var i = 0,len = domFixedList.length; i < len; i++){
						domFixedList[i].style.zIndex = '0';
						domFixedList[i].style.top = 0;
	        			domFixedList[i].style.position = posStyle;
					}
					
					domSxHandle.style.zIndex = '0';
					domSxHandle.style.top = 0;
	        		domSxHandle.style.position = posStyle;
					
					domHead.style.zIndex = '0';
					domHead.style.top = 0;
	        		domHead.style.position = posStyle;
	            }
	        } else {
	            if (scrollTop >= me.fixedTop) {
					domPlaceholder.style.height = me.fixedOffsetHeight[fhLen - 1] + domHead.offsetHeight + 'px';
	                baidu.show(domPlaceholder);
					
				    posStyle = 'fixed';
						
					for(var i = 0,len = domFixedList.length; i < len; i++){
						domFixedList[i].style.top = me.fixedOffsetHeight[i] + 'px';
						domFixedList[i].style.zIndex = '2';
	        			domFixedList[i].style.position = posStyle;
					}
					
					domSxHandle.style.top = me.fixedOffsetHeight[fhLen - 2] + 'px';
					domSxHandle.style.zIndex = '2';
	        		domSxHandle.style.position = posStyle;
					
					domHead.style.top = me.fixedOffsetHeight[fhLen - 1] + 'px';
					domHead.style.zIndex = '2';
	        		domHead.style.position = posStyle;
					
					if (scrollTop != me.fixedTop){
						domShadow.style.top = me.fixedOffsetHeight[fhLen - 1] + 31 + 'px';
						domShadow.style.width = me._width + 'px';
						domShadow.style.zIndex = '2';
		        		domShadow.style.position = posStyle;
						baidu.show(domShadow);
					}else{
						baidu.hide(domShadow);
					}
	            } else {
					domPlaceholder.style.height = 0;
					baidu.hide(domPlaceholder);
	                baidu.hide(domShadow);
					
					posStyle = 'relative';
					
					for(var i = 0,len = domFixedList.length; i < len; i++){
						domFixedList[i].style.zIndex = '0';
						domFixedList[i].style.top = 0;
	        			domFixedList[i].style.position = posStyle;
					}
					
					domSxHandle.style.top = 0;
					domSxHandle.style.zIndex = '0';
	        		domSxHandle.style.position = posStyle;
					
					domHead.style.top = 0;
					domHead.style.zIndex = '0';
	        		domHead.style.position = posStyle;
	            }
	        }
	        
        };
		baidu.on(window, 'scroll', me.topReseter);	
	},
	
    /**
     * 重新设置表格每个单元格的宽度
     * 
     * @private
     */
    resetColumns: function () {
        var me = this,
            datasource = me.datasource || [],
            colsWidth = me.colsWidth,
            id = me.id,
            len = colsWidth.length,
            dLen = datasource.length,
            tds = me.getBody() ? me.getBody().getElementsByTagName('td'): [],
            tfoots = me.getFoot() ? me.getFoot().getElementsByTagName('td'): [],
            tables = me.main.getElementsByTagName('table'),
            tdsLen = tds.length,
            tfootsLen = tfoots.length,
            index = 0,
            td,
            width, i, j;
        // 重新设置表格头的每列宽度
        if (!me.noTitle) {
			//me.renderHead();
            for (i = 0; i < len; i++) {
                width = colsWidth[i];
				if(width < 0){
					width = 0;
				}
				td = baidu.g(me.getTitleCellId(i));
				if (width == 0){
					baidu.hide(td);
				}else{
					baidu.show(td);
				}
				if (td) { // 有时候td不存在会报错
					td.style.width = width + 'px';
				}
            }
        }
        
        /*重新设置表格体的每行宽度
        j = tables.length;
        while (j--) {
            td = tables[j];
            if (td.getAttribute('control') == me.id) {
                td.setAttribute('width', me._totalWidth - 2);
            }
        }
		*/
        // 重新设置表格体的每列宽度
        j = 0;
		var colspan = 0;
        for (i = 0; i < tdsLen; i++) {
            td = tds[i];
            if (td.getAttribute('control') == id) {
				colspan = baidu.dom.getAttr(td,'colspan');
				//多列合并修正
				if (colspan && colspan > 1){
					var c = j % len,
					    lasCol = 0;
					width = 0;
					if (j % len + colspan > colsWidth.length){
						lasCol = colsWidth.length;
						j = 0;
					}else{
						lasCol = j % len + colspan;
						j += colspan;
					}
					for (; c < lasCol; c++){
						width += colsWidth[c];
					}
					td.style.width = width + 'px';
					continue;
				}
				
				width = colsWidth[j % len];
				if(width < 0){
					width = 0;
				}
				if (width == 0){
					baidu.hide(td);
				}else{
					baidu.show(td);
				}
                td.style.width = width + 'px';
                j++;
            }
        }
		 // 重新设置表尾的每列宽度
        j = 0;
        for (i = 0; i < tfootsLen; i++) {
            td = tfoots[i];
            if (td.getAttribute('control') == id) {
				width = colsWidth[j % len];
				if(width < 0){
					width = 0;
				}
				if (width == 0){
					baidu.hide(td);
				}else{
					baidu.show(td);
				}
                td.style.width = width + 'px';
                j++;
            }
        }
    },
    
	/**
	 * 横向滚动
	 * @author linzhifeng@baidu.com
	 */
	getXScrollHandle : function(){
		var me = this;
        return function () {
            if (me.isChanging){
				return;
			}
			me.isChanging = true;
			
		    var fields = me._fields,
			    sWidth = me.sxHandle.scrollLeft,
				len = fields.length,
				field,i;
			
			// 改变列宽
			
	        for (i = 0; i < len; i++) {
	            field = fields[i];					            
	            if (!field.locked) {				
	                if (me.colsWidthBak[i] > sWidth){
						me.colsWidth[i] = me.colsWidthBak[i] - sWidth;
						for (var j = i+1; j < len; j++){
							//恢复之后的
							me.colsWidth[j] = me.colsWidthBak[j];
						}
						break;
					}else{
						sWidth = sWidth - me.colsWidthBak[i];
						me.colsWidth[i] = 0;
					}
	            }
	        }
			//console.log(me.colsWidth);
			me.resetColumns();
			me.isChanging = false;
        };
	},
	
    /**
     * 第一列的多选框
     * 
     * @private
     */
    checkboxField: {
        width: 30,
        stable: true,
        select: true,
		locked: true,
		dragable : false,
        title: function () {
            return '<input type="checkbox" data-log="{\'target\':\'' 
                    + this.getId('selectAll') + '_checkbox\'}" id="' 
                    + this.getId('selectAll') 
                    + '" onclick="' 
                    + this.getStrCall('toggleSelectAll') 
                    + '">';
        },
        
        content: function (item, index) {
            return '<input type="checkbox" data-log="{\'target\':\'' 
                    + this.getId('multiSelect')  +'_checkbox\'}" id="' 
                    + this.getId('multiSelect') + index
                    + '" onclick="' + this.getStrCall('rowCheckboxClick', index) + '">';
        }
    },
    
    /**
     * 第一列的单选框
     * 
     * @private
     */
    radioboxField: {
        width: 30,
        stable: true,
        title: '&nbsp;',
        select: true,
        content: function (item, index) {
            var id = this.getId('singleSelect');
            return '<input type="radio" id="' 
                    + id + index
                    + '" name=' + id + ' onclick="' 
                    + this.getStrCall('selectSingle', index) 
                    + '">';
        }
    },
    
    /**
     * 行的checkbox点击时间处理函数
     * 
     * @private
     */
    rowCheckboxClick: function (index) {
        if (this.selectMode != 'line') {
            this.selectMulti(index);
        } else {
            this.preSelectIndex = index;
        }
    },
    
    /**
     * 根据checkbox是否全部选中，更新头部以及body的checkbox状态
     * 
     * @private
     * @param {number} index 需要更新的body中checkbox行，不传则更新全部
     */
    selectMulti: function (index) {
        var me = this,
            inputs = me.getBody().getElementsByTagName('input'),
            i = 0,
            currentIndex = 0,
            allChecked = me,
            len = inputs.length,
            selectAll = me.getHeadCheckbox(),
            selected = [],
            selectedClass = me.getClass('row-selected'),
            cbIdPrefix = me.getId('multiSelect'),
            input, inputId, row,
            updateAll = !baidu.lang.hasValue(index);
           
        for (; i < len; i++) {
            input = inputs[i];
            inputId = input.id;
            if (input.getAttribute('type') == 'checkbox' 
                && inputId && inputId.indexOf(cbIdPrefix) >= 0
            ) {
                // row = me.getRow(currentIndex); // add speed
                if (updateAll) {
                    row = input.parentNode;
                    while (1) {
                        if (row.tagName == 'DIV' // speed
                            && /^ui_table_row/.test(row.className)
                        ) {
                            break;
                        }
                        row = row.parentNode;
                    }
                }
				if (inputId.indexOf("hidden") < 0){	//为了aoPackage推词升级的表格删除功能，不得已而为 mayue
	                if (!input.checked) {
	                    allChecked = false;
	                    
	                    updateAll && baidu.removeClass(row, selectedClass); // add speed
						if(me.matchRow){
							updateAll && baidu.removeClass(row.nextSibling, selectedClass);
						}
	                } else {
	                    selected.push(currentIndex);
	                    updateAll && baidu.addClass(row, selectedClass);
						if(me.matchRow){
							updateAll && baidu.addClass(row.nextSibling, selectedClass);
						}
	                }
	            }
                currentIndex++;
            }
        }
        

        this.getSelectedIndex(selected);
        this.onselect(selected);
        if (!updateAll) {
			row = me.getRow(index);
			input = baidu.g(cbIdPrefix + index);
			if (input.checked) {
				baidu.addClass(row, selectedClass);
				if(me.matchRow){	
					baidu.addClass(row.nextSibling,  selectedClass)
				}
			}
			else {
				baidu.removeClass(row, selectedClass);
				if(me.subrow){
					baidu.removeClass(row.nextSibling,  selectedClass)
				}
			}
			var me = this, logParams = {};
			logParams.target = me.id + "MultiSelect" + index + "_" + me.type + "_cbx";
			logParams.checked = input.checked;
			NIRVANA_LOG.send(logParams);
		}
        selectAll.checked = allChecked;
    },
    
    /**
     * 全选/不选 所有的checkbox表单
     * 
     * @private
     */
    toggleSelectAll: function () {
		var checked = this.getHeadCheckbox().checked,
			logParams = {},
			me = this;
        this.selectAll(checked);
		logParams.target = me.id + "SelectAll_" + me.type + "_cbx";
		logParams.checked = checked;
		NIRVANA_LOG.send(logParams);
    },
    
    /**
     * 更新所有checkbox的选择状态
     * 
     * @private
     * @param {boolean} checked 是否选中
     * @param {Array} indexes 索引数组
     */
    selectAll: function (checked, indexes) {
        var inputs = this.getBody().getElementsByTagName('input'),
            len = inputs.length,
            i = 0,
            index = 0,
            selected = [],
            selectedClass = this.getClass('row-selected'),
			selectAll = this.getHeadCheckbox(),
            input, inputId,
            controlAll = false;

        if(!indexes || !(indexes instanceof Array) || indexes.length == 0){
            controlAll = true;
        }
            
        for (; i < len; i++) {
            input = inputs[i];
            inputId = input.id;
            if (input.getAttribute('type') == 'checkbox' 
                && inputId 
                && inputId.indexOf('multiSelect') > 0
                && inputId.indexOf(this.getId()) > -1) { //只选自己本身这个表格 而不去选子表格 当前以ID区分，看是否包含表格的ID。 by LeoWang(wangkemiao@baidu.com)
                
                if(controlAll || baidu.array.indexOf(indexes, index) > -1){ // 如果是可操作的索引行
                    inputs[i].checked = checked;
                    if (inputId.indexOf("hidden") < 0){	//为了aoPackage推词升级的表格删除功能，不得已而为 mayue
                    	if (checked) {
    	                    selected.push(index);
    	                    baidu.addClass(this.getRow(index), selectedClass);
    						if(this.matchRow){
    							baidu.addClass(this.getRow(index).nextSibling, selectedClass);
    						}
    	                } else {
    	                    baidu.removeClass(this.getRow(index), selectedClass);
    						if(this.matchRow){
    							baidu.removeClass(this.getRow(index).nextSibling, selectedClass);
    						}
    	                }
                    }
                }
                else{
                    if (inputId.indexOf("hidden") < 0){
                        if(input.checked){
                            selected.push(index);
                        }
                    }
                }
                
                index ++;
            }
        }
        
        // 修改全选按钮的状态 add by wanghuijun
        selectAll.checked = this.isAllSelected();
        
        this.getSelectedIndex(selected);
        this.onselect(selected);
    },

    /**
     * 获取选中行的index，在onselect之前直接调用，对外暴露selectedIndex
     * 
     * @private
     * @param {Array} index 选取的序号
     */
	getSelectedIndex : function(index) {
		if (typeof index == 'undefined') {
			index = [];
		}
		/**
		 * 当前选择的行的索引，该属性是只读的
		 * @property selectedIndex
		 * @type Number | Array
		 * @final
		 */
		this.selectedIndex = index;
	},
    
    /**
     * 单选选取
     * 
     * @private
     * @param {number} index 选取的序号
     */
    selectSingle: function (index) {
        var selectedClass = this.getClass('row-selected'),
            selectedIndex = this.selectedIndex;
        
        if (this.onselect(index)) {
            if ('number' == typeof selectedIndex) {
                baidu.removeClass(this.getRow(selectedIndex), selectedClass);
				if(this.matchRow){
					baidu.removeClass(this.getRow(selectedIndex).nextSibling, selectedClass);
				}
            }
            
            this.selectedIndex = index;
            baidu.addClass(this.getRow(index), selectedClass);
			if(this.matchRow){
				baidu.addClass(this.getRow(index).nextSibling, selectedClass);
			}
        }
    },
    
    /**
     * 重置表头样式
     * 
     * @private
     */
    resetHeadStyle: function () {
        var ths = this.getHead().getElementsByTagName('th'),
            len = ths.length,
            th;
            
        while (len--) {
            th = ths[len];
            baidu.removeClass(th.firstChild, this.getClass('thcell_sort'));
        }    
    },
    /**
     * 重新渲染一下表格头部和触发一下表格的resize<br/>
     * 在表格里嵌套子表格，展开的时候，如果渲染结束不调用该方法，可能导致表格计算渲染位置出现偏差包括出现滚动条
     * @method refreshView
     */
    refreshView: function () {
		var me = this;
		
		// 这里增加表头的重绘，否则表头容易计算错误
		// 另外这里打一个时间差吧，延时执行一会儿
		// add by wanghuijun
		setTimeout(function() {
			me.renderHead();
			me.handleResize();
		}, 100);
    },
    
    /**
     * 释放控件
     * @method dispose
     */
    dispose: function () {
        var head = baidu.g(this.getId('head')),
            mark = baidu.g(this.getId('dragMark'));

        if (head) {
            head.onmousemove = null;
            head.onmousedown = null;
        }

        if (mark) {
            document.body.removeChild(mark);
        }
		
		if (this.sxHandle) {
			this.sxHandle.onscroll = null;
		}
		
        if (this.resizeHandler) {
            baidu.un(window, 'resize', this.resizeHandler);
        }
		
		if (this.scrollYFixed){
			baidu.un(window, 'scroll', this.topReseter);
		}
		
		ui.Base.dispose.call(this);
    },
    /**
     * 用新数据扩充表格
     * @method appendRows
     * @param {object} data 用来扩充的数据，必须与原数据一致
     * @params {string} mark 做为类名，用来标识此次添加的行（可选）
     * @public
     */
    appendRows : function(data, mark){
    	var me =this,
    		noDataHtml = me.noDataHtml || '',
			dataLen = data.length,
            html = [],
            dataPre = me.datasource || [],
            dataPreLen = dataPre.length,
            i, j, item, field;
        
        for (i = 0; i < dataLen; i++) {
            item = data[i];
            html.push(me.getRowHtml(item, dataPreLen + i, mark));
        }
        baidu.dom.insertHTML(me.getBody(), 'beforeEnd', dataLen != 0 ? html.join('') : noDataHtml);
    	me.datasource = me.datasource.concat(data);
    	me.selectTarget('true', '.' + mark + ' input');
    }
};

ui.Base.derive(ui.Table);
