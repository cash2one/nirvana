/*
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/Tab.js
 * desc:    Tab标签控件
 * author:  wanghuijun
 * date:    $Date: 2010/12/13 15:00:00 $
 */

/**
 * Tab组件
 * 
 * @class Tab
 * @extend ui.Base
 * @namespace ui
 * @constructor
 * @param {Object} options 控件初始化参数
 * <pre>
 * 配置项的定义如下：
 * {
 *    id:            [String],   [REQUIRED] 控件的Id
 *    allowEdit:     [Boolean],  [OPTIONAL] 是否允许编辑，默认false
 *    title:         [Array],    [OPTIONAL] 所有标签的标题数组，数组元素类型为字符串，默认空数组
 *    noun:          [Array],    [OPTIONAL] 是否在Tab标题旁显示帮助信息的图标，数组元素为Boolean类型，true显示，
 *                                          false不显示，默认为空数组，即所有Tab都不显示
 *    threshold:     [Number],   [OPTIONAL] 标签的标题最多显示字符数，未设置，默认全部显示
 *    container:     [Array],    [OPTIONAL] 每个标签用于显示内容的DOM元素数组，默认空数组
 *    itemClassName: [Array],    [OPTIONAL] 每个标签单独定制的样式class名，默认为空数组
 *    className:     [String],   [OPTIONAL] 要设置的Tab所挂载的DOM元素的样式名，默认为空串
 *    tab:           [Number],   [OPTIONAL] 当前选择的标签的索引，默认为0，即选择第一个标签
 *    fixedIndex:    [Array],    [OPTIONAL] 固定的标签的配置，数组元素为Boolean类型，true表示固定即没有
 *                                          标签关闭按钮，false不固定，默认为空数组，即都不固定，可以关闭
 *    upperLimit:    [Number],   [OPTIONAL] 标签数量上限，默认最多显示5个标签，若当前显示的标签小于该上限,
 *                                          会显示添加标签的按钮
 * }
 * </pre>
 */
ui.Tab = function (options) {
    this.initOptions(options);
    this.type = "tab";
	this.allowEdit = this.allowEdit || false; //默认不可编辑
	this.title = this.title || [];
	this.noun = this.noun || [];
	this.container = this.container || [];
	this.itemClassName = this.itemClassName || []; // tab独立class
	this.className = this.className || '';
	this.tab = this.tab || 0; //从0开始
	this.fixedIndex = this.fixedIndex || []; //固定标签，不可删除 [true]
	this.upperLimit = this.upperLimit || 5; //标签数量上限，默认最多5个标签
};

ui.Tab.prototype = {
	
    /**
     * 渲染控件
     * @method render
     * @protected
     * @param {HTMLElement} main 控件挂载的DOM
     */
    render: function (main) {
        var me = this;
        ui.Base.render.call(me, main, false);
		
        // 绘制内容部分
        this.renderTabs();
        this.resetClass();
    },

    
    tplMain: '<ul>{0}</ul>',
    tplItem: '<li class="{1}"><h6 onclick="{2}" title="{4}" data-log="{target:\'{5}\', text:\'{4}\'}" >{0}</h6>{3}</li>',
    tplItem_noun: '<li class="{1}"><h6 onclick="{2}" title="{4}" data-log="{target:\'{5}\', text:\'{4}\'}" {7}>{0}</h6>{6}{3}</li>',
    tplInfo: '<li class="active {1}"><h6 title="{3}">{0}</h6>{2}</li>',
    tplInfo_noun: '<li class="active {1}"><h6 title="{3}">{0}{4}</h6>{2}</li>',
    tplAdd: '<li class="add" onclick="{0}" data-log="{target:\'{1}\'}">+</li>',
    tplClose: '<span class="closeIcon" onclick="{1}" data-log="{target:\'{2}\'}">{0}</span>',
    tplNoun: '<span class="ui_bubble" bubblesource="defaultHelp" bubbletitle="{0}">&nbsp;</span>',
    /**
     * 绘制标签区
     * 
     * @private
     */
    renderTabs: function () {
        var me        = this,
            total     = me.title.length,
			html      = [],
			itemClass = '',
            i,
			tmp,
			title,
			tmpClose = '',
			nounHtml='',
			target = "";
		
        if (total == 0) {
            this.main.innerHTML = '';
            return;
        }
		if (total <= me.tab) { //如果tab超出数据范围，则默认归0
			me.tab = 0;
		}
		if (me.allowEdit) {
			for (i = 0; i < total; i++) {
				title = me.title[i];
				tmp = me.threshold ? getCutString(me.title[i], +me.threshold, "..") : me.title[i];
				itemClass = '';
				
				if (me.fixedIndex[i]) {
					tmpClose = '';
				} else {
					itemClass = 'close';
					target = baidu.string.toCamelCase('close_' + me.id) + '_' + me.type + '_btn';
					tmpClose = ui.format(me.tplClose,
					                     '关闭',
										 me.getStrCall('onclose', i),
										 target);
				}
				
				if (i == 0) { // 第一个节点增加特殊样式
					itemClass += itemClass ? ' first' : 'first';
				}
				
				if (i == me.tab) { //绘制当前标签
					html[html.length] = ui.format(me.tplInfo, tmp, itemClass, tmpClose, title);
				}
				else { //绘制其他标签
					target = baidu.string.toCamelCase('item_' + me.id) + '_' + me.type + '_lbl';
					html[html.length] = ui.format(me.tplItem, tmp, itemClass, me.getStrCall('select', i), tmpClose, title, target);
				}
			}
			
			if (total < me.upperLimit) {
				target = baidu.string.toCamelCase('add_' + me.id) + '_' + me.type + '_btn';
				html[html.length] = ui.format(me.tplAdd, me.getStrCall('onadd'), target);
			}
		} else {
            var titleValue;
			for (i = 0; i < total; i++) {
                titleValue = me.title[i];// 对于不可编辑的title, 支持传入一个函数， modified by Huiyao 2013.2.18
                if (typeof titleValue === 'function') {
                    titleValue = titleValue.call(me, i, me.tab);
                    tmp = titleValue.content;
                    title = titleValue.title;
                }
                else {
                    title = me.title[i].replace(/<.*?>/g,'');//title显示修正 by linzhifeng@baidu.com
                    tmp = me.threshold ? getCutString(me.title[i], +me.threshold, "..") : me.title[i];
                }

				itemClass = me.itemClassName[i] || '';
				
				if (i == 0) { // 第一个节点增加特殊样式
					itemClass += ' first';
				}
				
				if(me.noun[i]){//小问号 by:liuyutong@baidu.com
					var tmpNoun = ui.format(me.tplNoun,typeof(me.noun[i]) == "string" ? me.noun[i] : title);
					//console.log(title);
					if (i == me.tab) { //绘制当前标签
						html[html.length] = ui.format(me.tplInfo_noun, tmp, itemClass, tmpClose, title,tmpNoun);
					}
					else { //绘制其他标签
						target = baidu.string.toCamelCase('item_' + me.id) + '_' + me.type + '_lbl';
						html[html.length] = ui.format(me.tplItem_noun, tmp, itemClass, me.getStrCall('select', i), tmpClose, title, target,tmpNoun,'style="float:left"');
					}
				}else{
					if (i == me.tab) { //绘制当前标签
						html[html.length] = ui.format(me.tplInfo, tmp, itemClass, tmpClose, title);
					}
					else { //绘制其他标签
						target = baidu.string.toCamelCase('item_' + me.id) + '_' + me.type + '_lbl';
						html[html.length] = ui.format(me.tplItem, tmp, itemClass, me.getStrCall('select', i), tmpClose, title, target);
					}
				}
			}
		}
		
        me.main && (me.main.innerHTML = ui.format(me.tplMain,
                                        html.join('')));
		ui.Bubble.init();
		me.resetContainer();
    },
	
    /**
     * 重新设置控件class
     * 
     * @private
     */
	resetClass : function() {
		var me = this;
		
		if (me.className) {
			baidu.removeClass(me.main, me.getClass());
			baidu.addClass(me.main, me.className);
		}
	},
	
    /**
     * 设置容器区域显示隐藏
     * 
     * @private
     */
	resetContainer : function() {
        var me = this,
            container = me.container,
			len = container.length,
            i;
			
		if (len) {
			for (i = 0; i < len; i++) {
				if(!baidu.dom.hasClass(container[i], 'hide')){
					baidu.addClass(container[i], 'hide');
				}
			}
			//害我追了三个小时啊，0怎么会变成""了呢
			baidu.removeClass(container[+me.tab], 'hide');
		}
	},
    /**
     * 选择标签触发的事件
     * @event onselect
     * @param {Number} tab 选中标签的索引
     * @return {Boolean} result 返回false，禁止选择该标签
     */
    onselect: new Function(),
    
    /**
     * 选择标签,该方法会触发select事件
     * 
     * @method select
     * @public
     * @param {Number} tab 选中标签的索引
     */
    select: function (tab) {
        if (this.onselect(tab) !== false) {
            this.tab = tab;
            
            this.renderTabs();
        }
    },
	/**
	 * 关闭标签页触发的事件
	 * @event onclose
	 * @param {Number} tab 选中标签的索引
	 */
	onclose: new Function(),

	
	/**
	 * 添加新标签触发的事件，为了完成新标签的添加，要求添加title和container
	 * @event onadd
	 */
	onadd: new Function(),
	
    /**
     * 隐藏Tab控件的dom
     * @method hide
     * @public
     */
	hide: function() {
		var dom = this.main;
		
		baidu.hide(dom);
	},
	
    /**
     * 显示Tab控件的dom
     * @method show
     * @public
     */
	show: function() {
		var dom = this.main;
		
		baidu.show(dom);
	}
};

ui.Base.derive(ui.Tab);
