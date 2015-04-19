/**
 * 弹出式组件
 * 这是一个抽象类，用于继承
 *
 * 配置项如下：
 * {
 *   buttonConfig: { },   按钮的配置
 *   listConfig: { }      列表的配置，禁止配置 itemTpl
 * }
 *
 * @class Popup
 * @author zhujialu
 * @update 2012/10/31
 */
fc.ui.Popup = function($) {

    var event = fc.event,
        Button = fc.ui.Button,
        List = fc.ui.List;

    function Popup(node, name, config) {
        this._inline = true;
        this._super(node, name, config);

        var children = this._private.wrapper.children;
        this.button = new Button(children[0], config.buttonConfig);

        // 模版必须是这个，不然内部拿不到 value
        var listConfig = config.listConfig || {};
        listConfig.itemTpl = '<li data-value="{value}">{text}</li>';
        this.list = new List(children[1], listConfig);
        
        /**
         * 弹出层是否打开
         * @property {Boolean} opened
         */
        this.opened = false;

        addEvents.call(this);
    }

    Popup.prototype = {
        
        /**
         * 获取或设置文本
         * @method text
         * @param {String} value 可选，不传表示getter，传值表示setter
         * @return {String|void}
         */
        text: function(value) {
            return this.button.text(value);
        },

        /**
         * 是否置灰组件
         * @method disable
         * @param {Boolean} b 是否置灰
         */
        disable: function(b) {
            this.button.disable(b);
        },

        /**
         * 重写 width
         * @method width
         */
        width: function(value) {
            return this.button.width(value);
        },

        /**
         * 如果显示就隐藏，如果隐藏就显示
         * @method toggle
         */
        toggle: function() {
            this.opened ? this.close() : this.open();
        },

        /**
         * 打开选项层
         * @method open
         */
        open: function() {
            fc.addClass(this._private.wrapper, Popup.CSS_OPENED);
            this.opened = true; 

            // 防止冒泡产生的即刻触发
            var me = this;
            setTimeout(function() {
                event.click(document, blur, me);
            }, 50);
        },

        /**
         * 关闭选项层
         * @method close
         */
        close: function() {
            fc.removeClass(this._private.wrapper, Popup.CSS_OPENED);
            this.opened = false; 

            event.un(document, 'click', blur);
        },

        dispose: function() {
            this.button.dispose();
            this.list.dispose();
        },

        getTpl: function() {
            return '<div></div><div></div>';
        }
    };

    Popup = fc.ui.extend(fc.ui.Base, Popup);
    Popup.CSS_OPENED = 'popup-opened';

    Popup.EVENT_CLICK_ITEM = 'popup-click-item';

    // =====================================================

    function addEvents() {
        event.on(this.list, List.EVENT_CLICK_ITEM, clickItem, this);
    }

    function clickItem(e) {
        var target = fc.parent(e.target, 'li');
        if (target) {
            this.close();
            event.fire(this, {
                type: Popup.EVENT_CLICK_ITEM,
                value: fc.attr(target, 'data-value')
            });
        }
    }

    function blur(e) {
        if (!fc.contains(this.list.node, e.target)) {
            this.close();
        }
    }

    return Popup;

}($$);
