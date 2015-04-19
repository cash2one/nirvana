/*
 * cb-web
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/BaseBox.js
 * desc:    基础选择控件
 * author:  zhaolei,erik
 * date:    2010/03/23
 */

/**
 * 基础选择控件<br/>
 * 不直接拿来使用，供CheckBox和RadioBox继承 
 * @class BaseBox
 * @namespace ui
 * @constructor
 * @description 不直接拿来使用，供CheckBox和RadioBox继承
 * @param {Object} options 控件初始化参数
 * <pre>
 * 配置项定义如下：
 * {
 *     formName:   [String],              [OPTIONAL] 该控件所关联的选择控件所在组的名称
 *     disabled:   [Boolean],             [OPTIONAL] 是否禁用该控件，默认false
 *     datasource: [Number|String|Array], [OPTIONAL] 被选中的值，多个被选中用数组表示，如果当前控件的value
 *                                                   与datasource相等，或包含在数组中，则该控件会显示选中状态
 * }
 * </pre>
 */
ui.BaseBox = function (options) {
	//this.logSwitch = this.logSwitch || true;
};

ui.BaseBox.prototype = {
    /**
     * 默认的onclick事件执行函数
     * 不做任何事，容错
     * @event onclick  
     */
    onclick: new Function(),

    /**
     * 设置选中状态
     * @method setChecked
     * @protected setChecked
     * @param {boolean} stat 状态
     */
    setChecked: function (stat) {
        this.getDOM().checked = !!stat;
    },
    
    /**
     * 获取选中状态
     * @method getChecked
     * @return {boolean}
     * @public
     */
    getChecked: function() {
        return this.getDOM().checked;
    },
    
    /**
     * 将box设置为不可用
     * @method disable
     * @param {Boolean} disabled 是否不可用
     * @public
     */
    disable: function (disabled) {
        this.main.disabled = disabled;
        if (disabled) {
            this.setState('disabled');
			if(this.label){
				baidu.dom.addClass(this.label, "text_gray");
			}
        } else {
            this.removeState('disabled');
			if(this.label){
				baidu.dom.removeClass(this.label, "text_gray");
			}
        }
    },
    
    /**
     * 将box设置为只读
     * @method readOnly
     * @param {Boolean} readOnly 是否只读
     * @public
     */
    readOnly: function (readOnly) {
        this.main.disabled = readOnly;
        readOnly?this.setState('readonly'):this.removeState('readonly');
    },
    
    /**
     * 获取分组
     * @method getGroup
     * @return {ui.BoxGroup}
     * @public
     */
    getGroup: function() {
        return ui.util.create('BoxGroup', 
                                    {
                                        id: this.formName, 
                                        ui: this.boxType
                                    });
    },
    
    /**
     * 设置值
     * @method setValue
     * @param {string} value
     * @public 
     */
    setValue: function(value) {
        this.getDOM().setAttribute('value', value);
    },
    
    /**
     * 获取值
     * @method getValue
     * @return {String}
     * @public 
     */
    getValue: function() {
        return this.getDOM().getAttribute('value');
    },
    
    /**
     * 获取控件的DOM对象
     * @method getDOM
     * @return {HTMLElement}
     * @private
     */
    getDOM: function () {
        return baidu.g(this.getId());
    },
    
    /**
     * 渲染控件
     * @method render
     * @param {HTMLElement} main 控件挂载的DOM 其Tag必须是Input，且必须包含type属性，
     * 为了给该控件生成标签，该DOM必须设置title属性，会自动由该属性生成控件的标签;
     * 如果该控件未设置formName属性，这使用DOM元素的name属性来初始化formName
     */
    render: function (main) {
        var me = this,
            group = me.group,
            data = me.datasource,
            dataType = typeof data,
            label,
            value;
     
        // 执行未初始化时的初始化
        if (!me.isRender) {
            if (!main 
                ||main.tagName != me.wrapTag 
                || main.getAttribute('type') != me.wrapType
            ) {
                return;
            }
            
            if (!me.formName) {
                me.formName = main.getAttribute('name');
            }
        
            // 插入点击相关的label
            if (main.title) {
                label = document.createElement('label');
                // Modified by Wu Huiyao，加了编码: FIX BUG：推广管理关键词修改高短控制符可能导致行内修改的浮出层显示的关键词的转义的问题
                label.innerHTML = baidu.encodeHTML(main.title);
                label.className = me.getClass('label');
                baidu.setAttr(label, 'for', me.getId());
                baidu.dom.insertAfter(label, main);
				
				me.label = label;
            }
            
            ui.Base.render.call(me, main, true);
            main.disabled = !!me.disabled;
            
            main.onclick = me._getHandlerClick();
        }/*else{
			me.repaint();
			return ;
		}*///commented by chenjincai me.repaint is an empty function
        
        // 重绘部分，设置checked
        if (me.main) {
            value = me.getValue();
            
            if (dataType == 'string' || dataType == 'number') {
                me.setChecked(data == value);
            } else if (baidu.lang.isArray(data)) {
                var containValue;
                containValue = baidu.array.find(data,function(item,index){
                    return (item == value);
                });
                me.setChecked(containValue == value);
            }
            me.isRender = true;
        }
    },
	
	/**
     * 将控件渲染到指定的DOM元素里
     * @method appendTo
     * @param {HTMLElement} container 渲染的控件添加到的目标DOM元素
     */
	appendTo: function (container) {
        var main = document.createElement('div');
        container.appendChild(main);
        this.render(main);
    }, 
	
	repaint: function(){
		
	},
    
    /**
     * onclick事件
     */
    _getHandlerClick: function() {
        var me = this;
        return function(e){
			if (!me.getState('readonly')) {
				me.onclick();
			}
			//发送监控请求
			var dataLog = me.getUiLogParams();
			dataLog.checked = me.getChecked();
			dataLog.readonly = me.getState('readonly');
			NIRVANA_LOG.send(dataLog);
		};
    },

    
    /**
     * 释放控件实例
     * @method dispose
     */
    dispose: function () {
        if(this.main){
            this.main.onclick = null;
        }
        ui.Base.dispose.call(this);
    },
	
    /**
     * 隐藏控件
     * @method hide
     */
	hide : function() {
		var me = this;
		
		baidu.addClass(me.getDOM(), 'hide');
		baidu.addClass(me.label, 'hide');
	}
};
