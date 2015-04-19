/**
 * 封装textarea，带有行号
 * {
 *    wordWrap: 是否开启自动换行, 默认为 false
 * }
 *
 * @class TextLine
 * @author zhujialu
 * @update 2012/09/05
 */
fc.ui.TextLine = function($) {

    var Input = fc.ui.Input,
        event = fc.event,
        tpl = fc.tpl;

    /**
     * @param {HTMLElement} node 组件最外层元素
     * @param {Object} config 组件配置
     */
    function TextLine(node, config) {
        if (node.tagName !== 'TEXTAREA') {
            p('[TextLine]组件只支持 <textarea>');
            return;
        }
        this._super(node, 'textline', config);
        
        var pvt = this._private;
        pvt.lineNumber = $('.' + CSS_LINE_NUMBER, this.node)[0];
        pvt.textarea = new Input($('textarea', this.node)[0]);

        // 参考 http://www.w3help.org/zh-cn/causes/HF1014
        if (this._private.config.wordWrap) {
            fc.css(pvt.textarea.node, 'word-wrap', 'break-word');
        } else {
            pvt.textarea.node.wrap = 'off';
        }
        
        addEvents.call(this);
    }

    TextLine.prototype = {

        /**
         * 获取或设置 value
         * @method value
         * @param {String|void} value
         * @return {String|void}
         */
        value: function(value) {
            var ret = this._private.textarea.value(value);
            if (value != null) {
                updateView.call(this);
            }
            return ret;
        },

        /**
         * 获取或设置文本
         * @method text
         * @param {Array|String} text 可选。不传表示 getter，传值表示 setter
         * @return {Array|void}
         */
        text: function(text) {
            var pvt = this._private, textarea = pvt.textarea;
            if (text == null) {
                return textarea.value().split(CHAR_WRAP);
            } else {
                addText(textarea, text);
                updateView.call(this);
            }
        },

        /**
         * 在尾部追加文本
         * @method append
         * @param {Array|String} text
         */
        append: function(text) {
            addText(this._private.textarea, text, true);
            updateView.call(this);
        },

        onchange: null,
        
        dispose: function() {
            removeEvents.call(this);
            this._private.textarea.dispose();
            this._super();
        },

        /**
         * override
         */
        getTpl: function(origin) {
            return tpl.parse({ textarea: origin.outerHTML }, TPL_UI);
        }

    };
    
    TextLine = fc.ui.extend(fc.ui.Base, TextLine);

    // ========================================= 私有属性和方法 ===========================================
    var CSS_LINE_NUMBER = 'textline-line-number',
        CSS_TEXTAREA = 'textline-textarea';

    var TPL_UI = '<ul class="' + CSS_LINE_NUMBER + '"><li>1</li></ul>' +
                 '<div class="' + CSS_TEXTAREA + '">{textarea}</div>';

    // 换行符
    var CHAR_WRAP = '\n';
    
    function addEvents() {
        var me = this, pvt = this._private,
            lineNumber = pvt.lineNumber,
            textarea = pvt.textarea;

        event.scroll(textarea.node, onScroll, this);
        event.scroll(lineNumber, onScroll, this);
        event.keyup(textarea.node, updateView, this);
    }

    function removeEvents() {
        var pvt = this._private;
        event.un(pvt.lineNumber);
    }

    function addText(textarea, text, append) {
        if (!fc.isArray(text)) {
            text = [text];
        }
        var value = (append ? textarea.value() : '') + CHAR_WRAP + text.join(CHAR_WRAP);
        textarea.value(fc.trim(value));
    }

    function updateView() {
        var pvt = this._private, textarea = pvt.textarea, html = '';
        fc.each(textarea.value().split(CHAR_WRAP), function(text, index) {
            html += createLine(index, text, pvt.wordWrap && getTextHeight(pvt.wrapper, textarea.node, text));
        });
        
        pvt.lineNumber.innerHTML = html;

        if (typeof this.onchange === 'function') {
            this.onchange();
        }
    }

    // 计算 container 里面的 textarea 的 text 的高度
    function getTextHeight(container, textarea, text) {
        var p = fc.create('<p style="width:' + textarea.clientWidth + 'px;">' + text + '</p>');
        container.appendChild(p);
        var height = p.clientHeight;
        container.removeChild(p);
        return height;
    }

    function onScroll(e) {
        var pvt = this._private,
            lineNumber = pvt.lineNumber,
            textarea = pvt.textarea.node;
        if (e.target.tagName === 'TEXTAREA') {
            lineNumber.scrollTop = textarea.scrollTop;
        } else {
            textarea.scrollTop = lineNumber.scrollTop;
        }
    }

    function createLine(index, text, height) {
        var html = '<li';
        if (height) {
            html += ' style="height:' + height + 'px;"';
        }
        return html + '>' + (index + 1) + '</li>';
    }
    
    return TextLine;

}($$);
