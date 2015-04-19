/**
 * 封装两个元素：<input type="text" /> 和 <textarea></textarea>
 *
 * 如果需要开启placeholder功能，只需在html里加上 _placeholder 属性即可
 * 
 * 2012/9/17 更新
 * 最新的Firefox，placeholder 表现行为和Chrome一致，但它没有提供 focus 时修改 placeholder 为透明色的
 * CSS 属性；再考虑到IE10 完全不支持修改颜色，所以这次去掉原生 placeholder 功能，所有浏览器都转用模
 * 拟实现。
 *
 * @class Input
 * @extend Base
 * @author zhujialu
 * @update 2012/9/17
 */
fc.ui.Input = function() {

    var event = fc.event;

    function Input(node, config) {
        var tag = node.tagName.toLowerCase();
        if ((tag !== 'input' && tag !== 'textarea') || (tag === 'input' && node.type !== 'text')) {
            p('[Input] 只支持<input type="text" /> 和 <textarea></textarea>');
            return;
        }
        this._super(node, 'input', config, true);

        fc.addClass(node, CSS_PLACEHOLDER);
        this.placeholder(this.placeholder());

        event.focus(node, focusHandler, this);
        event.blur(node, blurHandler, this);
        event.input(node, changeHandler, this);
    }

    Input.prototype = {

        /**
         * 获取或设置输入框的文本
         * @method value
         * @param {String} value 可选，设置此参数表示是 setter，不设置则是 getter
         * @return {String|void}
         */
        value: function(value) {
            var input = this.node;
            if (value == null) {
                return !fc.hasClass(input, CSS_PLACEHOLDER) ? input.value : '';
            } else {
                input.value = value;
                if (value) {
                    fc.removeClass(input, CSS_PLACEHOLDER);
                } else if (!this.isFocus()) {
                    blurHandler.call(this, true);
                }
            }
        },
        
        /**
         * 获取或设置 placeholder
         * @method placeholder
         * @param {String} value 可选，设置此参数表示是 setter，不设置则是 getter
         * @return {String|void}
         */
        placeholder: function(value) {
            var input = this.node;
            if (value == null) {
                return fc.attr(input, NAME);
            } else {
                fc.attr(input, NAME, value);
                if (value && fc.hasClass(input, CSS_PLACEHOLDER)) {
                    input.value = value;
                }
            }
        },
        
        /**
         * 获取或设置组件的 Range 对象
         * Range 对象结构如下：
         * {
         *   start: 选区开始位置
         *   end: 选区结束位置
         *   text: 选区内的文本
         * }
         * 如果是 setter，表示把 start 和 end 之间的文本改变为 text
         * @method range
         * @param {Object} range 可选。不传值表示 getter，传了表示setter
         * @return {Object|void}
         */
        range: function(range) {
            if (range == null) {
                return Range.create(this);    
            } else {
                range = new Range(range.start, range.end, range.text);
                range.replaceText(this, range.text);
            }
        },

        /**
         * 输入框失焦
         * @method focus
         */
        focus: function() {
            this.node.focus();
        },

        /**
         * 输入框聚焦
         * @method blur
         */
        blur: function() {
            this.node.blur();
        },

        /**
         * 输入框是否是聚焦状态
         * @method isFocus
         * @return {Boolean}
         */
        isFocus: function() {
            return this.node.ownerDocument.activeElement === this.node;
        },

        /**
         * focus 事件处理函数
         * @event onfocus
         */
        onfocus: null,

        /**
         * blur 事件处理函数
         * @event onblur
         */
        onblur: null,

        /**
         * 内容发生改变时的处理函数
         * @event onchange
         * @param {String} value 输入框最新的值
         */ 
        onchange: null
    };

    Input = fc.ui.extend(fc.ui.Base, Input);

    // ================================== 私有属性和方法 ============================================
    var CSS_PLACEHOLDER = 'input-placeholder',
        NAME = '_placeholder';

    function focusHandler() {
        var value = this.value();
        if (!value) this.value('');
        fc.removeClass(this.node, CSS_PLACEHOLDER);        
        if (typeof this.onfocus === 'function') {
            this.onfocus();
        }
    }

    // manual 表示是否是手动调用
    function blurHandler(manual) {
        if (manual !== true && typeof this.onblur === 'function') {
            this.onblur();
        }
        if (this.node.value === '') {
            this._afterBlur = true;
            fc.addClass(this.node, CSS_PLACEHOLDER);
            this.placeholder(this.placeholder());
        }
    }

    function changeHandler() {
        if (fc.hasClass(this.node, CSS_PLACEHOLDER) || this._afterBlur) {
            if (this._afterBlur) delete this._afterBlur;
            return;
        }
        if (typeof this.onchange === 'function') {
            this.onchange(this.value());
        }
    }


    function Range(start, end, text) {
        // 开始位置
        this.start = start;
        // 结束位置
        this.end = end;
        // 区间的文本
        this.text = text;
    }

    Range.prototype = {
        /**
         * 替换 Range 内的文本
         */
        replaceText: function(input, text) {
            var value = input.value();
            value = value.substring(0, this.start) + text + value.substr(this.end);
            input.value(value);
        },
        /**
         * 删除 Range 内的文本
         */
        deleteText: function(input) {
            this.replaceText(input, '');
        }
    };

    /**
     * 创建一个 Range 对象
     * @param {Input} input
     * @return {Range}
     */
    Range.create = function(input) {
        var elem = input.node, value = input.value(),
            start, end, text;
        if ('selectionStart' in elem) {
            start = elem.selectionStart;
            end = elem.selectionEnd;
        } else {

            // 当前选区
            var activeRange = document.selection.createRange(),
                len = activeRange.text.length,
                offset = 0,
                range;

            if (elem.tagName === 'INPUT') {
                range = elem.createTextRange();
                range.setEndPoint('StartToStart', activeRange);
                while (range.moveStart('character', -1) !== 0) {
                    offset++;
                }
            } else {
                range = document.body.createTextRange();
                range.moveToElementText(elem);
                while (range.compareEndPoints('StartToStart', activeRange) < 0 && activeRange.moveStart('character', -1) !== 0) {
                    offset++;
                }            
            }

            start = offset;
            end = start + len;
        }
        text = value.substring(start, end);
        return new Range(start, end, text);
    };

    return Input;

}();
