/**
 * 下拉选择菜单
 * 配置项如下：
 * {
 *   width:         组件宽度, 默认是100px
 *   height:        浮层高度，一般只有选项很多的情况才会用到，千万不要自己在 css 里写
 *   text:          提示文本, 默认是“请选择”
 *   data:          下拉选项数据
 *   selectedValue: 默认选中项。如果未设置, 显示提示文本
 *   disable:       是否默认是置灰的
 *   isup:          是否向上展开, 默认是向下展开
 * }
 *
 * 其中，data 的格式如下：
 * [
 *   { text: 字面, value: 值 },
 *   ...
 * ]
 *
 * @class ComboBox
 * @extend Base
 * @author zhujialu
 * @update 2012/10/05
 */
fc.ui.ComboBox = function($) {

    var event = fc.event, tpl = fc.tpl,
        Popup = fc.ui.Popup,
        List = fc.ui.List;
    
    function ComboBox(node, config) {
        this._super(node, 'combobox', formatConfig(config));

        initUI.call(this);
        addEvents.call(this);
        this.reset();
    }

    ComboBox.prototype = {

        /**
         * 重置组件，即返回到初始化状态
         * @method reset
         * @param {Object} config
         */
        reset: function(config) {
            var cfg = this.config();
            if (config) {
                fc.extend(cfg, config);
            }
            cfg.data = (cfg.data && cfg.data.length > 0) ? cfg.data : this.list.data;

            this.close();
            this.text(cfg.text);
            if (cfg.data) this.options(cfg.data);
            if (cfg.selectedValue != null) this.value(cfg.selectedValue);
        },

        /**
         * 获取或设置选项
         * @method options
         * @param {Array|void} data 可选，不传表示getter，传值表示setter
         * @return {Array|void}
         */
        options: function(data) { 
            if (data == null) {
                return this.list.data;
            } else {
                createList.call(this, data);
            }
        },

        /**
         * 获取或设置选中项
         * @method value
         * @param {String|void} value 选中项的值
         * @return {String|void}
         */
        value: function(value) {
            if (value == null) {
                var selectedItem = this.list.selectedItem;
                return selectedItem ? selectedItem.value : '';
            } else {
                // button 皮肤不需要设置选中样式
                if (this.config().skin !== ComboBox.SKIN_BUTTON) {
                    var index = getIndexByValue(this.list.data, value);
                    if (this.list.selectItem(index)) {
                        this.text(this.list.selectedItem.text);
                    }
                }
                if (typeof this.onselect === 'function') {
                    this.onselect(value);
                }
            }
        },

        /**
         * 选中项发生变化时的处理函数
         * @event onselect
         * @param {String} value 选中的值
         * @param {Boolean} clickButton 如果是 button 皮肤，需要通过此参数判断是否是点击按钮触发的
         */
        onselect: null
    };

    ComboBox = fc.ui.extend(Popup, ComboBox);

    ComboBox.CSS_ICON = 'combobox-icon';

    // 皮肤
    ComboBox.SKIN_MENU = 'menu';
    ComboBox.SKIN_BUTTON = 'button';

    // ================================= 私有属性和方法 ========================================
    // 向上显示
    var CSS_UP = 'combobox-up';

    // 默认的提示文本
    var TEXT = '请选择';

    function formatConfig(config) {
        if (config.width == null) {
            config.width = 100;
        }
        config.text = typeof config.text === 'string' ? config.text : TEXT;
        config.buttonConfig = { text: config.text, icon: ComboBox.CSS_ICON, placement: 'left' };
        return config;
    }

    // 初始化的一些操作
    function initUI() {
        var config = this.config();
        this.width(config.width);
        if (config.disable) {
            this.disable(true);
        }
        if (config.isup) {
            fc.addClass(this._private.wrapper, CSS_UP);
        }
    }

    // 创建选项层列表
    function createList(data) {
        this.list.items(data);

        var list = $('.' + List.CSS_CONTENT, this.list.node)[0];
        if (!list) return;

        var wrapper = this._private.wrapper;

        // 先显示出来辅助算宽度
        fc.addClass(wrapper, Popup.CSS_OPENED);
        fc.css(list, 'max-height', this.config().height);

        var barWidth = list.offsetWidth - list.clientWidth,
            offsetLeft = fc.offset(list, this.list.node).left;

        var listWidth = list.scrollWidth + barWidth + 2 * offsetLeft;
        this.list.width(Math.max(listWidth, this.width()));
        // IE 可能 barWidth > 0，但其实最后是没有滚动条的
        // 这里处理滚动条的逻辑写的挺烂的，我没想到更好的方法
        // 暂且这样处理了，以后有更好的方法再重构一下，反正是私有方法，对外无影响
        if (barWidth > 0 && (list.offsetWidth - list.clientWidth === 0)) {
            listWidth = this.list.width() - barWidth;
            this.list.width(listWidth);
        }

        // 再次隐藏
        fc.removeClass(wrapper, Popup.CSS_OPENED);
    }

    function addEvents() {
        var AbstractButton = fc.ui.AbstractButton;
        if (this.config().skin !== ComboBox.SKIN_BUTTON) {
            event.on(this.button, AbstractButton.EVENT_CLICK, this.toggle, this);
        } else {
            event.on(this.button, AbstractButton.EVENT_CLICK_ICON, this.toggle, this);
            event.on(this.button, AbstractButton.EVENT_CLICK_TEXT, clickButton, this);
        }
        event.on(this, Popup.EVENT_CLICK_ITEM, selectItem, this);
    }

    function clickButton() {
        if (this.opened) this.close();
        if (typeof this.onselect === 'function') {
            this.onselect(this.value(), true);
        }
    }

    function selectItem(e) {
        this.value(e.value);
    }

    function getIndexByValue(data, value) {
        var index = -1;
        fc.each(data, function(item, i) {
            if (item.value == value) {
                index = i;
                return false;
            }
        });
        return index;
    }

    return ComboBox;

}($$);

