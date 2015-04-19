/*
 * cb-web
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/Button.js
 * desc:    按钮控件
 * author:  zhaolei,erik
 * date:    $Date: 2010/05/25 17:54:38 $
 */

/**
 * 按钮控件
 * 
 * 支持Themes：不同样式、尺寸的按钮
 * 按钮状态：normal, over, down, active, disable
 *  
 * @class Button
 * @extend ui.Base
 * @namespace ui
 * @constructor
 * @param {Object} options 控件初始化参数
 * <pre>
 * 配置项如下：
 * {
 *     id:        [String],  [REQUIRED] Button的id属性，值为字符串，此值并不对应DOM元素的ID
 *     logSwitch: [Boolean], [OPTIONAL] 监控日志的开关，默认值为true
 *     content:   [String],  [OPTIONAL] Button显示的label信息，可以是HTML片段
 * }
 * </pre>
 */
ui.Button = function (options) {
    // 初始化参数
    this.initOptions(options);
    
    // 类型声明，用于生成控件子dom的id和class
    this.type = 'button';
	this.logSwitch = this.logSwitch || true;
};

ui.Button.prototype = {
    
    tplButton: '<a href="javascript:void(0)" id="{2}" class="{1}">{0}</a>',
    
    /**
     * 默认的onclick事件执行函数
     * 不做任何事，容错
     * @event onclick  
     */
    onclick: new Function(),
    
    getMainHtml: function() {
        var me = this;
        
        return ui.format(
            me.tplButton,
            me.content || '&nbsp;',
            me.getClass('label'),
            me.getId('label')
        );
    },
    /**
     * 是否禁用中
     * @method isDisable
     * @return {Boolean} button控件是否被禁用
     */
    isDisable: function() {
        return !!this.getState('disabled');         
    },
    /**
     * 设置是否不可用
     * @method disable
     * @protected
     * @param {boolean} stat 状态
     */
    disable: function (stat) {
        var state = 'disabled';

        if (stat) {
            this.setState(state);
        } else {
            this.removeState(state);
        }
    },

    /**
     * 设置是否为Active状态
     * 
     * @protected
     * @param {boolean} stat 状态
     */
    active: function (stat) {
        var state = 'active';

        if (stat) {
            this.setState(state);
        } else {
            this.removeState(state);
        }
    },
    
    /**
     * 渲染控件
     * @method render
     * @param {HTMLElement} main 控件挂载的DOM元素，必须是DIV元素
     * <p>
     * <b>NOTICE:</b>如果main元素第一个子元素节点存在且不是DIV元素，则该控件的content属性重置为<code>main.innerHTML</code>
     * </p>
     */
    render: function(main){
		var me = this;
		
		if (me.main || !main || main.tagName != 'DIV') {
			return;
		}
		
		if (!me.isRender) {
			var innerDiv = main.firstChild;
			if (innerDiv && innerDiv.tagName != 'DIV') {
				me.content = main.innerHTML;
			}
			
			ui.Base.render.call(me, main, true);
			main.innerHTML = me.getMainHtml();
			
			
			// 初始化状态事件
			main.onclick = me._getHandlerClick();
			me.isRender = true;
		}
		else {
			me.repaint();
		}
	},
	
	repaint: function(){
		
	},
    /**
     * 将未渲染的Button控件渲染到指定的DOM元素里
     * @method appendTo
     * @param {HTMLElement} wrap 渲染的控件添加到的目标DOM元素
     */
    appendTo: function (wrap) {
        if (this.main) {
            return;
        }
        var main = document.createElement('div');
        wrap.appendChild(main);
        this.render(main);
    },
    /**
     * 将未渲染的Button控件渲染到指定的DOM元素里，作为其第一个子节点出现
     * @method insertFirst
     * @param {HTMLElement} wrap 渲染的控件添加到的目标DOM元素
     */
    insertFirst: function(wrap){
        if(this.main){
            return;
        }

        var main = document.createElement('div');
        wrap.insertBefore(main, wrap.firstChild);
        this.render(main);
    },
    
    _getHandlerClick: function() {
        var me = this;
        return function (e) {
        	var e = e || window.event;
            if (!me.state['disabled']) {
                me.onclick(e);
            }
            baidu.g(me.getId('label')) && baidu.g(me.getId('label')).blur();
        }
    },
    /**
     * 设置Button显示label
     * @method setLabel
     * @param {String} label 控件label，可以是HTML片段
     */
    setLabel: function (label) {
        baidu.G(this.getId('label')).innerHTML = label;
    },
    /**
     * 释放Button控件实例
     * @method dispose
     */
    dispose: function () {
        this.main.onclick = null;
        this.onclick = null;
        ui.Base.dispose.call(this);
    },
    /**
     * 使Button聚焦
     * @method setFocus
     */
    setFocus : function(){
    	baidu.G(this.getId('label')).focus();
    },
    /**
     * 使Button失去焦点
     * @method setBlur
     */
    setBlur : function(){
    	baidu.G(this.getId('label')).blur();
    }
};

ui.Base.derive(ui.Button);
