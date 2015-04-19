/*
 * esui (ECOM Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/Base.js
 * desc:    ui控件的基础功能
 * author:  zhaolei,erik
 * date:    2010/03/16
 */

/**
 * ui控件的基础功能<br/>
 * 使用方式：
 * <code>ui.Base.derive(ui.MyControl);</code>
 * <pre>
 * 配置项如下：
 * {
 *     id:        [String],  [REQUIRED] UI的id属性，值为字符串，此值并不对应DOM元素的ID
 *     logSwitch: [Boolean], [OPTIONAL] 监控日志的开关  
 *     skin:      [String]   [OPTIONAL] 为UI定制的样式名，注意传递的样式名如果为a，则应用该样式后，会变成skin_a，
 *                                      因此在CSS定义上应为.skin_a {...}
 * }
 * </pre>
 * @class Base
 * @namespace ui
 */
ui.Base = {
    /**
     * 通过派生实现通用控件的功能
     * @method derive
     * @param {Function} clazz 控件类
     */
    derive: function (clazz) {
        var methods = [
                'getClass', 
                'getId', 
                'initOptions',
                'dispose',
                'render',
				'getUiLogParams',
                'initStateChanger',
                'getMainOverHandler',
                'getMainOutHandler',
                'getMainDownHandler',
                'getMainUpHandler',
                'getState',
                'setState',
                'removeState',
                'getStrRef',
                'getStrCall',
                'validate'],
            len = methods.length,
            proto = clazz.prototype,
            i = 0,
            method;
            
        for (; i < len; i++) {
            method = methods[i];
            if (!proto[method]) {
                proto[method] = ui.Base[method];
            }
        }
    },
    
    /**
     * 初始化参数
     * @method initOptions
     * @protected
     * @param {Object} options 选项配置
	 * @param {Object} defaultSetting 默认的选项配置
     */
    initOptions: function (options, defaultSetting) {
    	options = nirvana.util.extend(options, defaultSetting);
        for (var k in options) {
            this[k] = options[k];
        }
    },
    
    /**
     * 获取dom子部件的css class
     * @method getClass
     * @protected 
     * @param {String} key 基于key生成class名
     * @return {string}
     */
    getClass: function (key) {
        var me = this,
            type = me.type.toLowerCase(),
            className = 'ui_' + type,
            skinName = 'skin_' + me.skin;
        
        if (key) {
            className += '_' + key;
            skinName += '_' + key;
        }    
        
        if (me.skin) {
            className += ' ' + skinName;
        }
        
        return className;
    },
    
    /**
     * 获取dom子部件的id
     * @method getId
     * @param {String} key 基于key生成Id，如果未传递该值，返回控件对应的挂载的DOM元素的ID
     * @return {String}
     */
    getId: function (key) {
        var idPrefix = 'ctrl' + this.type + this.id;
        if (key) {
            return idPrefix + key;
        }
        return idPrefix;
    },
    
    /**
     * 渲染控件
     * @method render
     * @protected
     * @param {HTMLElement} main 控件挂载的DOM
     * @param {boolean} autoState 是否挂载自动状态转换的处理
     */
    render: function (main, autoState) {
        var me = this;
        if (!me.main) {
            me.main = main;
            main.id = me.getId();
            main.setAttribute('control', me.id);
			//zhouyu01@baidu.com 设置监控用参数
			if (me.type) {
				me.logParams = me.logParams || {target: me.id + '_' + me.type};
				main.setAttribute('data-log', baidu.json.stringify(me.logParams));
			}
			main.setAttribute('logSwitch', me.logSwitch || false);
			
            baidu.addClass(main, me.getClass());
            
            if (autoState) {
                me.initStateChanger();
            }
        }    
    },
	
	/**
	 * 获取组件基本监控字段
	 * @method getUiLogParams
	 * @return {Object}
	 */
	getUiLogParams: function(){
		return this.logParams || {};
	},
    
    /**
     * 获取控件对象的全局引用字符串
     * @method getStrRef
     * @protected
     * @return {String}
     */
    getStrRef: function () {
        return "ui.util.get('" + this.id + "')";
    },
    
    /**
     * 获取控件对象方法的全局引用字符串
     * @method getStrCall
     * @protected
     * @param {String} fn 调用的方法名
     * @param {Any...} anonymous 调用的参数
     * @return {String}
     */
    getStrCall: function (fn) {
        var argLen = arguments.length,
            params = [],
            i, arg;
        if (argLen > 1) {
            for (i = 1; i < argLen; i++) {
                arg = arguments[i];
                if (typeof arg == 'string') {
                    arg = "'" + arg +"'";
                }
                params.push(arg);
            }
        }
        
        return this.getStrRef()
                + '.' + fn + '('
                + params.join(',') 
                + ');'; 
    },
    
    /**
     * 释放控件
     * @method dispose
     * @protected
     */
    dispose: function () {
        var controlMap = this.controlMap,
            main = this.main;
        
        // dispose子控件
        if (controlMap) {
            for (var k in controlMap) {
                controlMap[k].dispose();
                delete controlMap[k];
            }
        }
        this.controlMap = null;
        
        // 释放控件主区域的事件以及引用
        if (main) {
            main.onmouseover = null;
            main.onmouseout = null;
            main.onmousedown = null;
            main.onmouseup = null;
        }
        this.main = null;
    },
    
    /**
     * 初始化状态事件
     * 
     * @protected
     * @desc
     *      默认为控件的主dom元素挂载4个mouse事件
     *      实现hover/press状态切换的样式设置
     */
    initStateChanger: function () {
        var me = this,
            main = me.main;
        
        me.state = {};   
        if (main) {
            main.onmouseover = me.getMainOverHandler();
            main.onmouseout = me.getMainOutHandler();
            main.onmousedown = me.getMainDownHandler();
            main.onmouseup = me.getMainUpHandler();
        }
    },
    
    /**
     * 获取主元素over的鼠标事件handler
     * 
     * @private
     * @return {Function}
     */
    getMainOverHandler: function () {
        var me = this;
        return function () {
            if (!me.state['disabled'] && !me.state['readonly']) {
                me.setState('hover');
            }
        };
    },
    
    /**
     * 获取主元素out的鼠标事件handler
     * 
     * @private
     * @return {Function}
     */
    getMainOutHandler: function () {
        var me = this;
        return function () {
            if (!me.state['disabled'] &&  !me.state['readonly']) {
                me.removeState('hover');
                me.removeState('press');
            }
        };
    },
    
    /**
     * 获取主元素down的鼠标事件handler
     * 
     * @private
     * @return {Function}
     */
    getMainDownHandler: function () {
        var me = this;
        return function (e) {
            if (!me.state['disabled']) {
                me.setState('press');
            }
            e = e || window.event;
            //e.returnValue = false;
        };
    },
    
    /**
     * 获取主元素up的鼠标事件handler
     * 
     * @private
     * @return {Function}
     */
    getMainUpHandler: function () {
        var me = this;
        return function () {
            if (!me.state['disabled']) {
                me.removeState('press');
            }
        };
    },
    
    /**
     * 设置控件的当前状态
     * 
     * @protected
     * @param {string} state 要设置的状态
     */
    setState: function (state) {
        if (!this.state) {
            this.state = {};
        }
        
        this.state[state] = 1;
        baidu.addClass(this.main, this.getClass(state));
    },
    
    /**
     * 移除控件的当前状态
     * 
     * @protected
     * @param {string} state 要移除的状态
     */
    removeState: function (state) {
        if (!this.state) {
            this.state = {};
        }
        
        this.state[state] = null;
		if(this.main){
			baidu.removeClass(this.main, this.getClass(state));
		}
    },
    
    /**
     * 获取控件状态
     * 
     * @protected
     * @param {string} state 要获取的状态
     * @return {boolean|Null}
     */
    getState: function (state) {
        if (!this.state) {
            this.state = {};
        }
        
        return !!this.state[state];
    },
    
    /**
     * 预置状态表
     * 
     * @protected
     */
    states: ['hover', 'press', 'active', 'disabled', 'readonly'],
    
    /**
     * 验证控件的值
     */
    validate: function () {
        if (!this.rule) {
            return true;
        }
        
        return ui.util.validate(this, this.rule);
    }
};  
