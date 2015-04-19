/*
 * cb-web
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/FormTab.js
 * desc:    表单Tab控件
 * author:  zhaolei,erik
 * date:    $Date: 2010/05/13 07:55:55 $
 */

/**
 * 表单Tab控件,使用单选框来作为Tab的切换，实现上这些单选框必须作为控件先渲染出来，再作为参数传入该FormTab。
 * 
 * @class FormTab
 * @namespace ui
 * @extend ui.Base
 * @constructor
 * @param {object} options 构造的选项.
 * <pre>
 * 配置项定义如下：
 * {
 *      id:            [String],  [REQUIRED] FormTab的id属性
 *      disableHidden: [Boolean], [OPTIONAL] 默认true
 *      datasource:    [Array],   [OPTIONAL] FormTab绑定的数据源，其数组元素定义见下面说明
 *      value:         [String],  [OPTIONAL] 当前要选择的Tab，其值为要选择的Tab的label值
 * }
 * 
 * datasource的数据元素定义即每个显示的Tab的配置：
 * {
 *      label:   [String], 单选控件的ID，要求该控件已经创建，FormTab会通过ui.util.get方法来获取该控件
 *      content: [String], DOM元素的ID，对应的每个Tab的容器
 * }
 * </pre>
 */
ui.FormTab = function (options) {
    this.initOptions(options);
    this.disableHidden = (typeof this.disableHidden  != 'undefined')? this.disableHidden : true;
    this.tabs = this.datasource || this.tabs;
	this.type = "formtab";
};

ui.FormTab.prototype = {
    /**
     * 初始化FormTab行为
     */
    init: function(isRefresh) {
        var me = this,
            listener,
            tabs = me.tabs,
            len = tabs.length,
            i = 0,
            tab,
            tabLabel,
            current;
        
        me.labelClickListeners = me.labelClickListeners || [];
        for (; i < len; i++) {
            tab = tabs[i];
            tabLabel = me.getLabel(tab['label']);
            if (tabLabel.checked) {
                current = tab['label'];
            }else if(me.value == tab.label){
                current = tab.label;
            }
            
            if (!isRefresh) {
                tabLabel.setAttribute('formTab', me.id);
                listener =  me.getLabelClickListener(tab['label']);
                tabLabel.onclick =  listener;
                me.labelClickListeners.push([tabLabel, listener]);
            }
        }
        
        me.gotoTab(current);
    },
    
    /**
     * 获取label点击的事件监听器
     * 
     * @private
     * @return {Function}
     */
    getLabelClickListener: function  (labelName) {
    	var me = this;
    	return function () {
			var logParams = {
				target: me.id + "_" + me.type + "_radio",
				label: labelName
			};
			NIRVANA_LOG.send(logParams);
    		me.gotoTab(labelName);
    	};
    },
      
    /**
     * goto一个tab
     * 
     * @private
     * @param {string} labelStr 要goto的label
     */
    gotoTab: function (labelStr) {
        var me = this,
            tabs = me.tabs,
            len = tabs.length,
            i = 0, key,
            tab,
            content,
            tabLabel,
            isCur,
            els, elLen, tabAttr, subTabInited = {};
        
        for (; i < len; i++) {
            tab = tabs[i];
            isCur = (labelStr == tab['label']);
            content = me.getContent(tab.content);
            tabLabel = me.getLabel(tab['label']);
            content.style.display = isCur ? 'block' : 'none';
            // FIXME 和#851相关，待修复
            // 这个问题是这样的，比如在新建物料这个表单里，有四种类型的广告物料类型，
            // 这里的切换使用了formTab。假设我们要创建的是文字类型广告物料因为提交
            // 表单前要对表单控件进行验证，如果不disable掉其他类型下 的表单控件，验证就通不过。
            if(me.disableHidden){
                ui.util.disableFormByContainer(content, !isCur);
            }
            
            // 这里暂时没有return false的需求……
            // 所以先控制显示隐藏，然后触发事件
            if (isCur) {

                me.onselect(tab);
            }
            
            // 重新初始化子fromtab的状态
            if (isCur) {
                els = content.getElementsByTagName('*');
                elLen = els.length;
                while (elLen--) {
                    tabAttr = els[elLen].getAttribute('formTab');
                    if (tabAttr && !subTabInited[tabAttr]) {
                        subTabInited[tabAttr] = 1;
                        ui.util.get(tabAttr).init(true);
                    }
                }
            }
            
            tabLabel.checked = isCur;
        }
    },
    /**
     * 选择Tab触发的事件
     * 
     * @event onselect
     * @param {Object} tab 其数据结构定义见FormTab的datasource的数据元素的定义
     */
    onselect: new Function(),
    
    /**
     * 获取label对应的dom元素
     * 
     * @private
     * @param {string} tabLabel label名称
     * @return {HTMLElement}
     */
    getLabel: function (tabLabel) {
        return ui.util.get(tabLabel).main;
    },
    
    /**
     * 通过值获取labelId
     * 
     * @private
     * @param {string} value 值
     * @return {Object}
     */
    getLabelNameByValue: function(value) {
        var tabs = this.tabs,
            len = tabs.length,
            i = 0,
            tab;
        
        for (; i < len; i++) {
            tab = ui.util.get(tabs[i].label);
            if (tab.getValue() == value) {
                return tab.id;
            }
        }
    },
    
    gotoTabByValue: function(value){
        var me          = this,
            labelName   = me.getLabelNameByValue(value);
        
        me.gotoTab(labelName);
    },
    
    /**
     * 获取content对应的dom元素
     * 
     * @private
     * @param {string} content content名称
     * @return {HTMLElement}
     */
    getContent: function (content) {
        return baidu.g(content);
    },
    
    /**
     * 释放控件
     * 
     * @method dispose
     * @public
     */
    dispose: function () {
    	var me = this,
            listeners = me.labelClickListeners,
            len = listeners.length, i, item;
        
        while (len--) {
        	item = listeners[len];
        	baidu.un(item[0], 'click', item[1]);
        	item.splice(0, 1);
        	listeners.splice(len, 1);
        }    
    	ui.Base.dispose.call(me);
    }
};

ui.Base.derive(ui.FormTab);
