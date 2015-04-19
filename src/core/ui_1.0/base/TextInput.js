/*
 * cb-web
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/TextInput.js
 * desc:    文本输入框控件
 * author:  zhaolei,erik
 * date:    2010/03/29
 */

/**
 * 文本输入框组件
 * 
 * @class TextInput
 * @extend ui.Base
 * @namespace ui
 * @constructor
 * @param {Object} options 控件初始化参数
 * <pre>
 * 配置项如下：
 * {
 *     id:           [String],                       [REQUIRED] TextInput的id属性 
 *     logSwitch:    [Boolean],                      [OPTIONAL] 监控日志的开关，默认值为true
 *     value:        [String|Number],                [OPTIONAL] TextInput的初始值，默认值为空串
 *     virtualValue: [String|Number],                [OPTIONAL] 值为空时，在输入框默认显示的输入提示信息
 *     readOnly:     [Boolean],                      [OPTIONAL] 是否只读，默认false
 *     width:        [Number|String],                [OPTIONAL] 文本输入框的宽度,单位px
 *     height:       [Number|String],                [OPTIONAL] 文本输入框的高度,单位px
 *     type:         ['textarea'|'text'|'password']  [OPTIONAL] 控件类型，通常不需要设置，除非你要通过
 *                                                              appendTo方法来渲染控件，则有必要设置一下
 * }
 * </pre> 
 */
ui.TextInput = function (options) {
	this.initOptions(options);
	this.form = 1;
    
    var value = this.value === 0 ? 0 : (this.value || '');
    this.value = baidu.decodeHTML(value);
	this.logSwitch = this.logSwitch || true;
	this.selectThread = null;
};

ui.TextInput.prototype = {
	/**
	 * 获取文本输入框的值
	 * @method getValue
	 * @public
	 * @return {String}
	 */
	getValue: function () {
		return this.main.value;
	},
	
    /**
     * 设置文本输入框的值
     * @method setValue
     * @public
     * @param {String} value 要设置的值
     */
	setValue: function (value) {
        this.main.value = baidu.decodeHTML(value);
        if (value) {
            this.getFocusHandler()();
        } else {
            this.getBlurHandler()();
        }
    },
    
    /**
     * 设置输入控件的title提示
     * @method setTitle
     * @public
     * @param {String} title 提示的文本信息
     */
    setTitle: function (title) {
        this.main.setAttribute('title', title);
    },
    
    /**
     * 将文本框设置为是否不可用
     * @method disable
     * @param {Boolean} disabled 是否禁用当前控件
     * @public
     */
    disable: function (disabled) {
        this.setReadOnly(disabled);
        if (disabled) {
            this.setState('disabled');
        } else {
            this.removeState('disabled');
        }
    },
    
    /**
     * 设置控件是否为只读
     * @method setReadOnly
     * @param {Boolean} readOnly 是否只读
     * @public
     * @param {Object} readOnly
     */
    setReadOnly: function (readOnly) {
        readOnly = !!readOnly;
        this.main.readOnly = readOnly;
        /*this.main.setAttribute('readOnly', readOnly);*/
        this.readOnly = readOnly;
        readOnly?this.setState('readonly'):this.removeState('readonly');
    },
    /**
     * 将TextInput控件渲染到指定的DOM元素里
     * @method appendTo
     * @param {HTMLElement} container 渲染的控件添加到的目标DOM元素
     */
	appendTo: function (container) {
		if (this.type == 'textarea'){
			var main = baidu.dom.create('textarea',{type:'textarea',value:this.value||''});
		}else {
			var main = baidu.dom.create('input',{type:this.type||'text',value:this.value||''});
		}
        container.appendChild(main);
        this.render(main);
    }, 
	
    /**
     * 渲染控件
     * @method render
     * @protected
     * @param {HTMLElement} main 控件挂载的DOM，其Tag可以是Input，但其type属性必须是text或者password；
     * Tag也可以是textarea;该元素的name属性用于初始化控件的formName属性
     */
    render: function (main) {
        var me = this;
        if (main) {
			var tagName = main.tagName, inputType = main.getAttribute('type');
                
            // 判断是否input或textarea输入框
			if ((tagName == 'INPUT' && (inputType == 'text' || inputType == 'password')) ||
			tagName == 'TEXTAREA') {
                me.type = tagName == 'INPUT' ? 'text' : 'textarea'; // 初始化type用于样式
                // 设置formName
                me.formName = main.getAttribute('name');
                
                // 绘制控件行为
                ui.Base.render.call(me, main, true);
                
                
                // 绑定事件
                main.onkeypress = me.getPressHandler();
                var changeHandler = me.getChangeHandler();
                if (baidu.ie) {
                    main.onpropertychange = changeHandler;
                    main.onkeyup = changeHandler;
				}
				else {
                    baidu.on(main, 'input', changeHandler);
                }
                me.changeHandler = changeHandler;
                // 设置readonly状态
                me.setReadOnly(!!me.readOnly);
                
                main.onfocus = me.getFocusHandler();
                main.onblur = me.getBlurHandler();
            }
        }
        
        if (me.main) {
            if (!me.value && me.virtualValue) {
                me.main.value = me.virtualValue;
                baidu.addClass(me.main, me.getClass('virtual'));
			}
			else {
                me.main.value = me.value;
            }
			
			// 绘制宽度和高度
			if (me.width) {
				me.main.style.width = me.width + 'px';
			}
			if (me.height) {
				me.main.style.height = me.height + 'px';
			}
        }
    },
    
    /**
     * 获取获焦事件处理函数
     * 
     * @private
     * @return {Function}
     */
    getFocusHandler: function () {
        var me = this;
            
        return function () {
            var main = me.main,
                virtualValue = me.virtualValue;
            
            baidu.removeClass(main, me.getClass('virtual'));
			
			//select();
			
			// 直接选中文本，很不稳定，可能与er有关系，找不出具体原因，暂时延迟处理
            // wanghuijun
			me.selectThread = setTimeout(function(){
				select();
			}, 50);
			
			function select(){
				if ((virtualValue && me.getValue() == virtualValue) || me.autoSelect) {
					main.select();
				}
			}

            me.onfocus();
        };
    },
    /**
     * 获取在输入框默认显示的输入提示文本信息
     * @method getVirtualValue
     * @return {String} 输入提示内容 
     */
    getVirtualValue: function() {
        return this.virtualValue;
    },
    /**
     * 设置输入框默认显示的输入提示文本信息
     * @method setVirtualValue
     * @param {String|Number} value 要设置显示的输入提示值
     */
    setVirtualValue: function(value) {
        var virtualValue = this.virtualValue,
            inputValue = this.getValue();
        // 未输入状态需要重置默认提示文本
        if ((virtualValue == null && inputValue === '') 
            || (virtualValue === inputValue)) {
            this.main.value = value;
            baidu.addClass(this.main, this.getClass('virtual'));
        }
        this.virtualValue = value;
    },
    /**
     * 获取失焦事件处理函数
     * 
     * @private
     * @return {Function}
     */
    getBlurHandler: function () {
        var me = this;
            
        return function () {
            var main = me.main,
                virtualValue = me.virtualValue,
                value = me.getValue();
            
            if (virtualValue
                && (value == '' || value == virtualValue)
            ) {
                main.value = virtualValue;
                baidu.addClass(main, me.getClass('virtual'));
				clearTimeout(me.selectThread);
            }

            me.onblur();
        };
    },
    
    /**
     * 获取键盘敲击的事件handler
     * 
     * @private
     * @return {Function}
     */
    getPressHandler: function () {
        var me = this;
        return function (e) {
            e = e || window.event;
            var keyCode = e.keyCode || e.which;
            if (keyCode == 13) {
                return me.onenter();
            }
        };
    },
    /**
     * 文本输入框按回车触发的事件
     * @event onenter
     */
    onenter: new Function(),

    onfocus: function(){},

    onblur: function(){},
    getChangeHandler: function() {
        var me = this;
        return function (e) {
            if(baidu.ie) {
                var evt = window.event;
                if(evt.propertyName == 'value'){
                    me.onchange();
                }
            } else {       
                me.onchange();
            } 
        }
    },
    /**
     * 文本输入框输入内容发生变化触发的事件
     * @event onchange
     */
    onchange: new Function(),
    /** 
     * 获焦并选中文本
     * @method focusAndSelect
     * @public
     */
    focusAndSelect: function () {
        this.main.select();
    },
    
    /**
     * 释放控件
     * @method dispose
     * @public
     */
    dispose: function () {
        // 卸载main的事件
        var main = this.main;
		if (main) {
			main.onkeypress = null;
			main.onchange = null;
			main.onpropertychange = null;
			main.onfocus = null;
			main.onblur = null;
			baidu.un(main, 'input', this.changeHandler);
		}
        this.changeHandler = null;
        ui.Base.dispose.call(this);
    }
};
ui.Base.derive(ui.TextInput);
