/**
 * @file    迭代器控件
 * @path:    ui/Iterator.js
 * @desc:    迭代器
 * @author:  yangji01@baidu.com
 */
/**
 * 迭代器
 * 
 * @class Iterator
 * @extends ui.Base
 * @namespace ui
 * @constructor
 * @param {Object} options 控件初始化参数
 * <pre>
 * 配置项如下：
 * {
 *     id:         [String],  [REQUIRED] id属性，值为字符串，此值并不对应DOM元素的ID
 *     logSwitch:  [Boolean], [OPTIONAL] 监控日志的开关，默认值为true
 *     atom:       [number], [OPTIONAL] 增加或减少的粒度,默认是0.01
 *     max:        [number], [OPTIONAL] 最大值，默认是9.99
 *     min:        [number], [OPTIONAL] 最小值，默认是0.01
 *     decimal:    [number], [OPTIONAL] 精确到小数点的位数，默认是2
 *     width:      [number], [OPTIONAL] 控件的宽度，默认是62
 *     value:      [number], [OPTIONAL] 初始值，默认是1,
 *     validate:   [boolean], [OPTIONAL] 是否进行验证，默认为0，这个时候不会对输入进行验证，屏蔽掉非法字符
 * }
 * </pre>
 */
ui.Iterator = function(options){
    var defaultOptions = {
        atom : 0.01,
        max : 9.99,
        min : 0.01,
        decimal : 2,
        width : 62,
        value : 1,
        validate : 0
    };
    this.initOptions(options, defaultOptions);
    
    this.type = 'iterator';
    this.logSwitch = this.logSwitch || true;
};

ui.Iterator.prototype = {
    
    /**
     * iterator使用的html片段
     * 
     * @const
     * @type {string} 
     */
    iteratorTpl : ''
        +   '<input type="text" id="{0}" class="ui-iterator-input" data-log={"target":"{3}_iterator_input"} />'
        +   '<div class="ui-iterator-right">'
        +       '<span class="ui-iterator-up" id="{1}" data-log={"target":"{3}_iterator_up"}>'
        +           '<span class="ui-iterator-up-icon"></span>'
        +       '</span>'
        +       '<span class="ui-iterator-down" id="{2}" data-log={"target":"{3}_iterator_down"}>'
        +           '<span class="ui-iterator-down-icon"></span>'
        +       '</span>'
        +   '</div>',
    
    /**
     * 生成并返回iterator的html片段
     * 
     * @return {string} iterator的html片段
     */
    getHtml : function(){
        var me = this;
        
        return ui.format(
            me.iteratorTpl,
            me.getId('input'),
            me.getId('up'),
            me.getId('down'),
            me.id
        );
    },
    
    /**
     * 渲染控件
     * 
     * @method render
     * @param {HTMLElement} main 控件挂载的DOM元素，必须是DIV元素
     */
    render : function(main){
        var me = this;
        
        if (me.main || !main || main.tagName != 'DIV') {
            return;
        }
        
        if (!me.isRender) {
            ui.Base.render.call(me, main, true);
            main.innerHTML = me.getHtml();
            
            // 初始化状态事件
            me._set();
            me._bindEvent(main);
            me._setWidth();
            
            me.setValue(parseFloat(me.value));
            
            me.isRender = true;
        }
        else {
            me.repaint();
        }
    },
    
    /**
     * 重绘
     */
    repaint : function() {
        
    },
    
    /**
     * 设置使用 属性
     * 
     * @private
     */
    _set : function(){
        var me = this;
        var inputId = me.getId('input');
        var upId = me.getId('up');
        var downId = me.getId('down');
        
        /**
         * 输入框
         *
         * @type {HTMLElement}
         */
        me.input = baidu.g(inputId);
        
        /**
         * 增加按钮
         * 
         * @type {HTMLElement} 
         */
        me.up = baidu.g(upId);
        
        /**
         * 减少按钮
         * 
         * @type {HTMLElement} 
         */
        me.down = baidu.g(downId);
        
        /**
         * input改变的处理方法
         * 
         * @type  {Function}
         * @private
         */
        me._changeHandler = me._getChangeHandler();
    },
    
    /**
     * 事件绑定
     * 
     * @param {HTMLElement} main 控件挂载的DOM元素，必须是DIV元素
     * @private
     */
    _bindEvent : function(main) {
        var me = this;
        
        main.onclick = me._clickHandler();
        me.up.onmouseover = me._mouseoverHandler(me.up);
        me.down.onmouseover = me._mouseoverHandler(me.down);
        me.up.onmouseout = me._mouseoutHandler(me.up);
        me.down.onmouseout = me._mouseoutHandler(me.down);
        
        me.input.onmouseover = me._mouseoverInputHandler()
        me.input.onmouseout = me._mouseoutInputHandler();
        
        me.input.onfocus = function() {
            me.onfocus();
        }
        me.input.onblur = function() {
            me.onblur();
        }
        
        if (baidu.ie) {
            me.input.onpropertychange = me._changeHandler;
        }
        else {
            baidu.on(me.input, 'input', me._changeHandler);
        }
        
        if ( me.validate ) {
            me.input.onkeypress = me._validate();
            me.input.onpaste = me._paste();
            
            // 一下浏览器不支持 ime-model
            if ( 
                baidu.browser.chrome
                || baidu.browser.safari
                || baidu.browser.opera
            ) {
                me.input.onkeydown = me._keydownHandler4chrome();
                me.input.onkeyup = me._keyupHandler4chrome();
            }
        }
        
    },
    
    /**
     * 设置控件宽度
     * 
     * @private 
     */
    _setWidth : function() {
        var me = this;
        
        //baidu.setStyle(me.main, 'width', parseFloat(me.width) + 'px');
        // input的宽度是总宽度 - 右侧宽度 - 左border
        baidu.setStyle(me.input, 'width', parseFloat(me.width) - 22 - 1 + 'px');
    },
    
    /**
     * 点击事件处理方法 
     * 
     * @private
     */
    _clickHandler : function() {
        var me = this;
        
        /**
         * 点击事件触发
         * 
         * @event
         * @param {Object} e 事件
         */
        return function(e) {
            var e = e || window.event;
            var target = e.target || e.srcElement;
            
            if (baidu.dom.hasClass(target.parentNode, 'ui-iterator-btn-disabled')
                || baidu.dom.hasClass(target, 'ui-iterator-btn-disabled')
            ) {
                return;
            }
            
            if (
                baidu.dom.hasClass(target, 'ui-iterator-up')
                || baidu.dom.hasClass(target, 'ui-iterator-up-icon')
            ) {
                //点击增加
                me.setValue(parseFloat(me.getValue()) + me.atom);
            }
            else if (
                baidu.dom.hasClass(target, 'ui-iterator-down')
                || baidu.dom.hasClass(target, 'ui-iterator-down-icon')
            ) {
                //点击减少
                me.setValue(parseFloat(me.getValue()) - me.atom);
            }
        }
    },
    
    /**
     * 鼠标hover处理方法
     * 
     * @param {HTMLElement} tar 需要设置的html元素
     * @private 
     */
    _mouseoverHandler : function(tar) {
        
        /**
         * 鼠标hover时触发
         * 
         * @event
         */
        return function() {
            baidu.dom.hasClass(tar, 'ui-iterator-btn-disabled') 
            || baidu.addClass(tar,'ui-iterator-btn-hover');
        }
    },
    
    /**
     * 鼠标离开处理方法
     * 
     * @param {HTMLElement} tar 需要设置方法的html元素
     * @private 
     */
    _mouseoutHandler : function(tar) {
        
        /**
         * mouseout时触发
         * 
         * @event 
         */
        return function() {
            baidu.removeClass(tar,'ui-iterator-btn-hover');
        }
    },
    
    /**
     * input的mouseover事件处理方法 
     * 
     * @private
     */
    _mouseoverInputHandler : function() {
        var me = this;
        
        /**
         * 输入框mouseover时触发
         * 
         * @event 
         */
        return function() {
            baidu.addClass(me.input, 'ui-iterator-input-hover');
        }
    },
    
    /**
     * input的mouseout事件处理方法 
     * 
     * @private
     */
    _mouseoutInputHandler : function() {
        var me = this;
        
        /**
         * 输入框mouseout时触发
         * 
         * @event 
         */
        return function() {
            baidu.removeClass(me.input, 'ui-iterator-input-hover');
        }
    },
    
    /**
     * chrome下keydown处理方法 
     * 
     * @private
     */
    _keydownHandler4chrome : function() {
        var me = this;
        
        /**
         * chrome下keydown触发
         * 
         * @event 
         */
        return function(e) {
            if ( e.keyCode >= 8 && e.keyCode <= 190) {
                return true;
            }
            
            me._selection4chrome = me._getInputSelection();
            
            me.input.disabled = 'disabled'; 
        }
    },
    
    /**
     * 下面这一坨是未了解决chrome不能屏蔽输入法写的
     * 
     * @private 
     */
    _keyupHandler4chrome : function() {
        var me = this;
        
        /**
         * 在chrome下keyup触发
         * 
         * @event 
         */
        return function(e) {
            var k = e.keyCode; 
            // keydown的时候没有触发非法操作
            if ( !me._selection4chrome ) {
                return ;
            }
            var range = me._selection4chrome;
            me.input.disabled = '';
            var newValue = me._newValue(me._char(k), range);
            
            // 不是合法字符或者结果不合法，还原选中区域
            if (!me._char(k) || !newValue) {
                me.input.selectionStart = range.start;
                me.input.selectionEnd = range.end;
            }
            // 合法输入  光标从开始处向右移一位
            else if ( newValue ) {
                me.input.value = newValue;
                me.input.selectionEnd = range.start + 1;
                me.input.selectionStart = range.start + 1;
            }
            
            me._selection4chrome = '';
        }
    },
    
    /**
     * 粘贴处理方法
     * 
     * @private 
     */
    _paste : function() {
        var me = this;
        
        /**
         * 输入框粘贴是触发
         * 
         * @event 
         */
        return function(e) {
            return false;
        }
    },
    
    /**
     * 获取keycode对应的字符
     * 
     * @param {number} keycode
     * @return {Object} false表示输入不合法，否则是keycode对应的字符
     * @private  
     */
    _char : function(k) {
        if ( k == 45 || k == 189) {
                return '-';
        }
        else if ( k == 46 || k == 190) {
            return '.';
        } 
        else if ( k >= 48 && k <= 57 ) {
            return k - 48;
        }
        else {
            // 如果不是数字 不是小数点 不是-号  屏蔽掉
            return false
        }
    },
    
    /**
     * 根据输入获取新的值
     * 
     * @param {string}  键盘输入的字符 
     * @param {Object}  鼠标选中区域
     * @return {Object} false时未输入不合法，否则是一个新生成的字符串
     * @private 
     */
    _newValue : function(c, range) {
        var me = this;
        var value = me.input.value;
        var str = [];
        var newValue;
        
        // 将input的原来的value按选中字段切成3段
        str[0] = value.substring(0, range.start);
        str[1] = value.substring(range.start, range.end);
        str[2] = value.substring(range.end);
        
        newValue = str[0] + c + str[2];
        var arr = newValue.toString().split('.');
        
        if ( 
            parseNumber(newValue) >= me.min 
            && parseNumber(newValue) <= me.max
            && !(arr[1] && arr[1].length > me.decimal)
        ) {
            return newValue;
        }
        return false;
    },
    
    /**
     * input输入合法性验证 不合法时屏蔽
     * 
     * @private 
     */
    _validate : function() {
        var me = this;
        
        return function(e) {
            var e = e || window.event;
            var k = e.keyCode || e.which;
            var range;
            var c;
            
            // ff下能够捕捉退格  如果是backspace 和 delete 允许
            // 方向键等不输入的键
            if (
                ( baidu.browser.firefox && k == 8 )
                || ( baidu.browser.firefox && e.keyCode == 46 )
                || ( k >= 35 && k <= 40 )
            ) {
                return true;
            }
            
            c = me._char(k);
            
            if ( !c) {
                return false;
            };
            
            range = me._getInputSelection();
            
            if ( me._newValue(c, range)) {
                return true;
            }
            
            return false;
        }
    },
    
    /**
     * 获取光标的位置
     * 
     * @private
     * @return {Object}    光标的启示位置和结束位置
     */
    _getInputSelection : function() {  
        var me = this;
        var start = 0;
        var end = 0;
        
        if (
            typeof me.input.selectionStart == "number" 
            && typeof me.input.selectionEnd == "number"
        ) {  
            start = me.input.selectionStart;  
            end = me.input.selectionEnd;  
        }
        else {
            var range = document.selection.createRange();
            var selected ; 
            
            range.setEndPoint('StartToStart',me.input.createTextRange());  
            end = range.text.length;
            
            // 这一块用来获取选中的文字
            if (window.getSelection) {
                selected = window.getSelection().toString();     
            }
            else if (document.getSelection) {
                selected = document.getSelection();
            }     
            else if (document.selection) {
                selected =  document.selection.createRange().text;
            }
            
            start = end - selected.length;
        }
        
        return {
            start : start,
            end : end
        }
    },

    /**
     * 设置控制的value
     * 
     * @param {number} v 设置的值 
     */
    setValue : function(v) {
        var me = this;
        
        me.input.value = v.toFixed(me.decimal);
        me._checkValue(v);
        me.onchange();
    },
    
    /**
     * 检查value是否到达边界值
     * 
     * @param {number} v 检查的数值
     * @
     */
    _checkValue : function(v) {
        var me = this;
        
        v == me.max 
            ? me._disabledBtn(me.up, true)
            : me._disabledBtn(me.up, false);
        v == me.min
            ? me._disabledBtn(me.down, true)
            : me._disabledBtn(me.down, false);
    },
    
    /**
     * 获取控件的value
     * 
     * @return {number} 控件的值 
     */
    getValue : function() {
        var me = this;
        
        return me.input.value;
    },
    
    /**
     * change事件处理方法
     * 
     * @private 
     */
    _getChangeHandler: function() {
        var me = this;
        
        /**
         * input的value发生改变时触发
         * 
         * @event
         * @param {Object} e 事件 
         */
        return function (e) {
            me._checkValue(parseFloat(me.input.value));
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
     * 
     * @event onchange
     */
    onchange: new Function(),
    
    /**
     * 禁用iterator
     * 
     * @param {boolean} disable true表示禁用，false表示开启
     */
    disabled : function(disable) {
        var me = this;
        
        me._disabledBtn(me.up, disable);
        me._disabledBtn(me.down, disable);
        
        if ( disable ) {
            baidu.setAttr(me.input, 'disabled', 'disabled');
            baidu.addClass(me.main, 'ui-iterator-disabled');
        }
        else {
            me.input.removeAttribute('disabled');
            baidu.removeClass(me.main, 'ui-iterator-disabled');
        }
    },
    
    /**
     * 禁用增加 减少按钮
     * 
     * @param {HTMLElement} el   需要禁用的html元素
     * @param {boolean} disable  true表示禁用，fasle为启用
     */
    _disabledBtn : function(el, disable) {
        var me = this;
        
        if ( disable ) {
            baidu.addClass(el, 'ui-iterator-btn-disabled');
        }
        else {
            baidu.removeClass(el, 'ui-iterator-btn-disabled');
        }
    },
    
    onfocus : new Function(),
    onblur : new Function(),
    
    /**
     * 控件销毁 
     */
    dispose : function() {
        var me = this;
        
        me.main.onclick = null;
        me.up.onmouseover = null;
        me.down.onmouseover = null;
        me.up.onmouseout = null;
        me.down.onmouseout = null;
        me.input.onmouseover = null;
        me.input.onmouseout = null;
        me.input.onfocus = null;
        me.input.onblur = null;
        if (baidu.ie) {
            me.input.onpropertychange = null;
        }
        else {
            baidu.un(me.input, 'input', me._changeHandler);
        }
        
        ui.Base.dispose.call(this);
    }
}

ui.Base.derive(ui.Iterator);
 