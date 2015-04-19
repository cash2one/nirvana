/**
 * 可重用的浮出层，提供的功能有：
 * 1. 底部有 确定 取消 按钮
 * 2. 右上角有 关闭按钮
 * 3. 内容区留给外部设置
 *
 * 配置项如下：
 * {
 *    width: 400,                      宽度(不需要带单位)，默认400，单位是px
 *
 *    title: ''                        标题
 *                                     如果设置为字符串（即使是''），会占据高度；
 *                                     如果不设置，则不会占据高度;
 *
 *    content: '',                     内容
 *
 *    // 下面这三个是留给继承使用的
 *    removeCloseBtn: true,            是否删除右上角的关闭按钮，默认是显示的
 *    removeFooter: true,              是否删除 footer，有些组件不需要确定、取消按钮
 *    hideByChild: true                是否在子类进行 hide 操作
 *                                     因为子类可能会复写 show/hide 方法，而且其中可能会用到一些尚未初始化的变量
 *                                     这时如果父类调用了子类的 show/hide 方法，会产生不可知的错误
 * }
 *
 * @class Layer
 * @author zhujialu
 * @update 2012/08/21
 */
fc.ui.Layer = function($) {

    var Button = fc.ui.Button,
        event = fc.event,
        tpl = fc.tpl;

    function Layer(node, config) {
        this._super(node, 'layer', config);

        if (!config.removeFooter) {
            /**
             * 确定按钮
             * @property {Button} submitBtn
             */
            this.submitBtn = new Button($('.' + CSS_SUBMIT_BTN, this.node)[0]);

            /**
             * 取消按钮
             * @property {Button} cancelBtn
             */
            this.cancelBtn = new Button($('.' + CSS_CANCEL_BTN, this.node)[0]);
        }

        // 设置宽度，默认400px ( 由 css 设置)
        if (config.width) this.width(config.width);
        if (!config.hideByChild) this.hide();

        addEvents.call(this);
    }

    Layer.prototype = {

        /**
         * 重写父类
         */
        show: function() {
            if (this.visible) return;

            // 防止点击某个按钮时执行 show()，这样会直接冒泡到 document，导致永远都打不开 layer
            var me = this;
            setTimeout(function() {
                event.click(document, blur, me);
            }, 50);
            this._super();
        },

        /**
         * 重写父类
         */
        hide: function() {
            if (!this.visible) return;
            event.un(document, 'click', blur);
            this._super();
        },

        /**
         * 显示/隐藏切换
         * @method toggle
         */
        toggle: function() {
            this.visible ? this.hide() : this.show();
        },

        /**
         * 点击“确定”按钮触发
         * @event onsubmit
         */
        onsubmit: null,

        /**
         * 点击“取消”按钮触发
         * @event oncancel
         */
        oncancel: null,

        /**
         * 点击右上角的“关闭”按钮触发
         * @event onclose
         */
        onclose: null,

        dispose: function() {
            removeEvents.call(this);
            this.submitBtn && this.submitBtn.dispose();
            this.cancelBtn && this.cancelBtn.dispose();
            this._super();
        },

        getTpl: function() {
            var config = this.config();
            return tpl.parse({
                header: config.title != null ? tpl.parse(config, TPL_HEADER) : '',
                content: config.content,
                footer: config.removeFooter ? '' : TPL_FOOTER,
                closebtn: config.removeCloseBtn ? '' : TPL_CLOSEBTN
            }, TPL_UI);
        }
    };

    Layer = fc.ui.extend(fc.ui.Base, Layer);

    Layer.CSS_HEADER = 'layer-header';
    Layer.CSS_CONTENT = 'layer-content';
    Layer.CSS_FOOTER = 'layer-footer';

    Layer.EVENT_SUBMIT = 'layer-submit';
    Layer.EVENT_CANCEL = 'layer-cancel';

    // ==========================================================================================================

    var CSS_CLOSE_BTN = 'layer-close-btn',
        CSS_SUBMIT_BTN = 'layer-submit-btn',
        CSS_CANCEL_BTN = 'layer-cancel-btn';

    var TPL_UI = '{header}' +
                 '<div class="' + Layer.CSS_CONTENT + '">{content}</div>' +
                 '{footer}{closebtn}',

        TPL_HEADER = '<div class="' + Layer.CSS_HEADER + '">{title}</div>',

        TPL_FOOTER = '<div class="' + Layer.CSS_FOOTER + '">' +
                        '<div class="' + CSS_SUBMIT_BTN + '">确定</div>' +
                        '<div class="' + CSS_CANCEL_BTN + '">取消</div>' +
                     '</div>',

        TPL_CLOSEBTN = '<button class="' + CSS_CLOSE_BTN + '"></button>';
    
    function addEvents() {
        var config = this.config();
        
        if (!config.removeCloseBtn) {
            var closeBtn = $('.' + CSS_CLOSE_BTN, this.node)[0];
            event.click(closeBtn, clickCloseBtn, this);
        }
        if (!config.removeFooter) {
            var me = this;
            this.submitBtn.onclick = function() {
                clickSubmitBtn.call(me);
            };
            this.cancelBtn.onclick = function() {
                clickCancelBtn.call(me);
            };
        }
    }

    function removeEvents() {
        if (this.config().removeCloseBtn) return;
        var closeBtn = $('.' + CSS_CLOSE_BTN, this.node)[0];
        event.un(closeBtn, 'click', clickCloseBtn);
    }

    function clickSubmitBtn() {
        // 子类可能还想做点事，但我们不能占用给外部使用的 onsubmit 接口
        event.fire(this, Layer.EVENT_SUBMIT);

        if (typeof this.onsubmit === 'function') {
            this.onsubmit();
        }
        this.hide();
    }

    function clickCancelBtn() {
        event.fire(this, Layer.EVENT_CANCEL);

        if (typeof this.oncancel === 'function') {
            this.oncancel();
        }
        this.hide();
    }

    function clickCloseBtn() {
        if (typeof this.onclose === 'function') {
            this.onclose();
        }
        this.hide();
    }

    function blur(e) {
        if (!fc.contains(this.node, e.target)) {
            this.hide();
        }
    }

    return Layer;

}($$);
