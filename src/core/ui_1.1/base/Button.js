/**
 * 配置项如下：
 * {
 *   icon: '',           按钮左侧图标, 如果按钮没有文字，将只显示该图标
 *   text: '',           按钮文字，如果没设置，直接取源元素的innerHTML
 *   iconOnly: true,     是否只有图标，而没有文字，默认为false
 *   height: 22,         按钮高度，默认是 22px；如果 iconOnly 为true，实际高度由图标决定
 *   disable: true,      是否置灰
 *   placement: 'right'  文字的位置，如果按钮有图标才会用到这项配置
 * }
 * 
 * @class Button
 * @extend AbstractButton
 * @author zhujialu
 * @update 2012/10/05
 */
fc.ui.Button = function($) {

    var AbstractButton = fc.ui.AbstractButton,
        event = fc.event, tpl = fc.tpl;

    function Button(node, config) {
        this._super(node, 'button', config);

        config = this.config();
        if (config.text) this.text(config.text);
        if (config.disable) this.disable(true);

        // 默认高度为 22px
        // 因为要保证[css 兼容]和[外部调用]，所以统一用 js 做
        if (!config.iconOnly) {
            config.height = config.height || 22;
            this.height(config.height);
        }
        addEvents.call(this);
    }

    Button.prototype = {

        /**
         * 覆盖父类的方法，宽度只调整 text 部分
         * 当 iconOnly 为 true 时，此方法的 setter 无效
         * @method width
         * @param {Number|void} value
         * @return {Number|void}
         */
        width: function(value) {
            if (value == null) return this._super();
            else {
                var pvt = this._private;
                if (pvt.config.iconOnly) return;
                value = parseInt(value);

                var textNode = pvt.textNode, iconNode = pvt.iconNode;
                value -= 2 * fc.offset(textNode, pvt.wrapper).left;
                value -= fc.css(textNode, 'padding-left') + fc.css(textNode, 'padding-right');
                if (iconNode) {
                    value -= iconNode.offsetWidth - fc.css(iconNode, 'margin-right');
                }
                value -= fc.css(textNode, 'margin-right');
                fc.width(textNode, value);
            }
        },

        /**
         * 覆盖父类的方法，高度需要特殊处理一下
         * 当 iconOnly 为 true 时，此方法的 setter 无效
         * @method height
         * @param {Number|void} value
         * @return {Number|void}
         */
        height: function(value) {
            if (value == null) return this._super();
            else {
                var pvt = this._private;
                if (pvt.config.iconOnly) return;
                value = parseInt(value);

                var textNode = pvt.textNode, iconNode = pvt.iconNode;
                value -= 2 * fc.offset(textNode, pvt.wrapper).top;

                fc.height(textNode.parentNode, value);
                fc.css(textNode, 'top', (value - textNode.offsetHeight) / 2);
                iconNode && fc.css(iconNode, 'top', (value - iconNode.offsetHeight) / 2);
            }
        },

        /**
         * 点击按钮的事件处理函数
         * @event onclick
         */
        onclick: null,

        getTpl: function(origin) {
            var config = this.config(),
                icon = config.icon ? tpl.parse({ icon: ' ' + config.icon }, TPL_ICON) : '',
                text = config.text || fc.trim(origin.innerHTML);

            text = !config.iconOnly ? tpl.parse({ text: text }, TPL_TEXT) : '';

            return tpl.parse({ icon: icon, text: text }, TPL_UI);
        }
    };
    
    Button = fc.ui.extend(AbstractButton, Button);

    // ========================================= 私有属性和方法 ===========================================

    // 组件模版
    var TPL_UI = '<div>{icon}{text}</div>',
        TPL_ICON = '<span class="' + AbstractButton.CSS_ICON + '{icon}"></span>',
        TPL_TEXT = '<span class="' + AbstractButton.CSS_TEXT + '">{text}</span>';

    function addEvents() {
        event.on(this, AbstractButton.EVENT_CLICK, clickButton, this);
    }

    function clickButton() {
        if (typeof this.onclick === 'function') {
            this.onclick();
        }
    }

    return Button;

}($$);
