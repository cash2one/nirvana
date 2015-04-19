/**
 * 按钮抽象类
 * 主要功能如下：
 * 1. 设置和获取 text
 * 2. text 的位置，即 left 或 right，默认是 right
 * 3. 是否disable
 * 4. 是否selected, 只有开启 toggleable 为 true 才会生效
 *    CheckBox 和 RadioButton 默认开启，Button 需要手动开启
 *
 * 配置项如下：
 * {
 *   placement: 'right',   text 的位置，默认在右侧，也可以设为'left'
 *   toggleable: true,     是否可以切换状态
 *   selected: true        如果 toggleable 为 true，则可以用 selected 设置默认是否已选中
 * }
 * 
 * 目前已实现的子类有：
 * Button CheckBox RadioButton
 *
 * 主要注意的是：
 * 组件模版（ 即子类实现的getTpl() ），唯一的硬性要求是
 *   如果有 text，对应的元素 class 必须包含 AbstractButton.CSS_TEXT
 *   如果有 icon，对应的元素 class 必须包含 AbstractButton.CSS_ICON
 *
 * @author zhujialu
 * @update 2012/10/3
 */
fc.ui.AbstractButton = function($) {

    var Base = fc.ui.Base,
        event = fc.event;

    function AbstractButton(node, name, config) {
        this._inline = true;
        this._super(node, name, config);
        
        config = this.config();
        /**
         * 是否可以切换状态
         * @property {Boolean} toggleable
         */
        this.toggleable = !!config.toggleable;

        /**
         * 是否是选中状态
         * 是否 toggleable 为 true 时启用此属性
         * @property {Boolean} selected
         */
        this.selected = false;
        this.select(config.selected);

        /**
         * 是否可用
         * @property {Boolean} enabled
         */
        this.enabled = true;

        var pvt = this._private;
        pvt.iconNode = $('.' + AbstractButton.CSS_ICON, this.node)[0];
        pvt.textNode = $('.' + AbstractButton.CSS_TEXT, this.node)[0];

        // 文本默认在右侧
        config.placement = config.placement || 'right';

        if (pvt.textNode) {
            var className = setPlacement(config.placement, pvt.textNode);
            pvt.iconNode && fc.addClass(pvt.wrapper, className);
        } else {
            fc.addClass(pvt.wrapper, AbstractButton.CSS_ICONONLY);
        }
        
        addEvents.call(this);
    }

    AbstractButton.prototype = {

        /**
         * 获取或设置按钮文本
         * @method text
         * @param {String} value
         * @return {String|void}
         */
        text: function(value) {
            var node = this._private.textNode;
            if (value != null) {
                node && (node.innerHTML = value);
            } else {
                return node ? node.innerHTML : '';
            }
        },
    
        /**
         * 是否置灰按钮。置灰操作将导致按钮不具交互性
         * @method disable
         * @param {Boolean} b 是否置灰
         */
        disable: function(b) {
            if (this.enabled = !!!b) {
                fc.removeClass(this.node, AbstractButton.CSS_DISABLED);
            } else {
                fc.addClass(this.node, AbstractButton.CSS_DISABLED);
            }
        },

        /**
         * 是否选中按钮，只有 toggleable 为 true 时此方法才可用
         * @method select
         * @param {Boolean} b 是否选中
         */
        select: function(b) {
            if (!this.toggleable || this.selected == b) return;

            var wrapper = this._private.wrapper;
            if (this.selected = !!b) {
                fc.addClass(wrapper, AbstractButton.CSS_SELECTED);
            } else {
                fc.removeClass(wrapper, AbstractButton.CSS_SELECTED);
            }
            event.fire(this, AbstractButton.EVENT_CHANGE);
        }
    };

    AbstractButton = fc.ui.extend(Base, AbstractButton);

    AbstractButton.CSS_ICON = 'button-icon';
    AbstractButton.CSS_TEXT = 'button-text';
    AbstractButton.CSS_DISABLED = 'button-disabled';
    AbstractButton.CSS_SELECTED = 'button-selected';
    AbstractButton.CSS_ICONONLY = 'button-icononly';
    AbstractButton.CSS_PRESS = 'button-press';

    // 按钮文本发生改变
    AbstractButton.EVENT_CHANGE = 'button-change';
    AbstractButton.EVENT_PRESS = 'button-press';
    AbstractButton.EVENT_CLICK = 'button-click';
    AbstractButton.EVENT_CLICK_ICON = 'button-click-icon';
    AbstractButton.EVENT_CLICK_TEXT = 'button-click-text';

    // ================================================================
    // 设置 文本 的位置
    function setPlacement(placement, textNode) {
        var parentNode = textNode.parentNode;
        parentNode.removeChild(textNode);
        if (placement === 'right') {
            parentNode.appendChild(textNode);
            return 'button-placement-right';
        } else {
            parentNode.insertBefore(textNode, parentNode.firstChild);
            return 'button-placement-left';
        }
    }

    function addEvents() {
        event.on(this.node, '.' + AbstractButton.CSS_ICON, 'click', clickIcon, this);
        event.on(this.node, '.' + AbstractButton.CSS_TEXT, 'click', clickText, this);
        event.mousedown(this.node, pressButton, this);
    }

    function clickIcon() {
        if (!this.enabled) return;
        event.fire(this, AbstractButton.EVENT_CLICK_ICON);
    }

    function clickText() {
        if (!this.enabled) return;
        event.fire(this, AbstractButton.EVENT_CLICK_TEXT);
    }

    function clickButton(e) {
        fc.removeClass(this._private.wrapper, AbstractButton.CSS_PRESS);
        event.un(document, 'mouseup', clickButton);
        if (fc.contains(this.node, e.target)) {
            event.fire(this, AbstractButton.EVENT_CLICK);
        }
    }
    
    function pressButton() {
        if (!this.enabled) return;
        fc.addClass(this._private.wrapper, AbstractButton.CSS_PRESS);
        event.mouseup(document, clickButton, this);
        event.fire(this, AbstractButton.EVENT_PRESS);
    }

    return AbstractButton;

}($$);
