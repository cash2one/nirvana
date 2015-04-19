/**
 * 以前叫做行内编辑
 * 我觉得叫做 值编辑 比较贴切
 * 就是点击某个值，显示一个浮层，浮层中的输入框正好定位在值的位置上
 * 点击确定后，更新值
 *
 * 配置项如下：
 * {
 *    触发元素，即点击的那个元素
 *    点击确定后，会直接 innerHTML 进行覆盖
 *    target: HTMLElement,
 *
 *    原值
 *    value: '',
 *
 *    输入框的宽度，类型为Number，单位是px，如果未设置，默认是110
 *    width: 110,
 *    
 *    有些需求中，确定按钮有可能叫做保存之类的，所以这里设计成可配置项
 *    如果未设置，默认是 确定
 *    submitText: '确定',
 *
 *    如果未设置，默认是 取消
 *    cancelText: '取消',
 *
 *    把这个组件 append 到哪，如果未设置，默认是 document.body
 *    但是如果存在滚动条，最好设置为滚动条所在的元素
 *    parent: HTMLElement
 * }
 *
 * @author zhujialu
 * @update 2012/8/24
 */
fc.ui.ValueEditor = function($) {

    var Layer = fc.ui.Layer,
        event = fc.event;

    function ValueEditor(config) {
        /**
         * 配置项
         * @property {Object} config
         */
        this.config = config || {};

        /**
         * 输入框
         * @property {HTMLElement} input
         */
        this.input = null;

        /**
         * Layer 组件
         * @property {Layer} layer
         */
        this.layer = null;

        // 初始化Layer
        initUI.call(this, fc.create(TPL_UI));
        addEvents.call(this);

        // 定位
        position.call(this);

        // 最后聚焦输入框，用户体验会好些
        this.input.focus();
        // 保持光标在最后
        this.input.value = this.config.value || '';

        if (editor) {
            editor.dispose();
        }
        editor = this;
    }

    ValueEditor.prototype = {
        /**
         * 点击确定按钮的事件处理函数
         * @method onsubmit
         */
        onsubmit: null,

        /**
         * 点击取消按钮的事件处理函数
         * @method oncancel
         */
        oncancel: null,

        /**
         * 点击关闭按钮或组件失焦后自动消失的事件处理函数
         * @method onclose
         */
        onclose: null,

        dispose: function() {
            // 销毁 layer 由 Layer 组件负责，这里不用管，管了会报错
            var node = this.layer.node;
            node.parentNode.removeChild(node);
            this.layer.dispose();
            delete this.config;
            editor = null;
        }
    };

    // 同一时刻只能存在一个editor
    // 如果要创建新的，就必须销毁旧的
    var editor;

    var TPL_UI = '<div class="nirvana-ui-valueeditor"></div>';

    function initUI(node) {
        var config = this.config;
        config.parent = config.parent || document.body,        
        config.parent.appendChild(node);

        var layer = new Layer(node, { content: '<input type="text" />', removeCloseBtn: true }),
            input = $('input[type="text"]', layer.node)[0];

        var width = config.width,
            submitText = config.submitText,
            cancelText = config.cancelText;

        if (width) {
            fc.width(input, width);
        }
        if (submitText) {
            layer.submitBtn.text(submitText);
        }
        if (cancelText) {
            layer.cancelBtn.text(cancelText);
        }

        layer.show();

        this.input = input;
        this.layer = layer;
    }

    function addEvents() {
        var me = this, layer = this.layer;
        layer.onsubmit = function() {
            layer.hide();
            if (typeof me.onsubmit === 'function') {
                me.onsubmit(me.input.value);
            }
        };
        layer.onclose = function() {
            me.dispose();
        };

        // 侦听回车
        event.keyup(this.input, pressEnter, this);
    }

    function position() {
        var node = this.layer.node,
            target = this.config.target,
            parent = this.config.parent;

        fc.center(node, target, parent);
        fc.css(node, 'left', fc.offset(target, parent).left - 5);
    }

    function pressEnter(e) {
        if (e.keyCode === 13) {
            this.layer.onsubmit();
        }
    }

    return ValueEditor;

}($$);
