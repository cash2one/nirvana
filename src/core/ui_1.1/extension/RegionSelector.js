/**
 * 地域选择器
 *
 * 显示结构如下：
 * '提示文本': '选中地域' 按钮
 * 
 * 配置项如下：
 * {
 *    regions: [],           初始化时的地域，这个需要请求后端数据
 *    labelText: '',         提示文本，如“查询地域”。默认是“推广地域”
 *    linkText: '修改'       如果没有设置此项，会使用 icon 为【向下箭头】的 Button，并且弹出的是 Layer
 * }
 *
 * @author zhujialu
 * @update 2012/10/24
 */
fc.ui.RegionSelector = function($) {
    
    var event = fc.event, tpl = fc.tpl,
        Region = fc.common.Region,
        AbstractButton = fc.ui.AbstractButton,
        Button = fc.ui.Button,
        RegionLayer = fc.ui.RegionLayer;

    function RegionSelector(node, config) {
        this._inline = true;
        this._super(node, 'regionselector', config);

        initUI.call(this);
        addEvents.call(this);
    }

    RegionSelector.prototype = {
        
        /**
         * 设置选中地域的文本
         * @method setText
         * @param {Array} selected 地域 id 数组
         */
        setText: function(selected) {
            var elem = $('.' + RegionSelector.CSS_VALUE, this.node)[0],
                text = Region.getText(selected, 'account');
            elem.innerHTML = text.word;
            elem.title = text.title;
        },

        /**
         * 选中的地域变化时触发
         * @event onchange
         * @param {Array} regions 地域 id 数组
         */
        onchange: null,

        dispose: function() {
            this.button && this.button.dispose();
            this.layer && this.layer.dispose();
            this._super();
        },

        getTpl: function() {
            var labelText = this.config.labelText || '推广地域';
            return tpl.parse({ text: labelText }, TPL);
        }
    };

    RegionSelector = fc.ui.extend(fc.ui.Base, RegionSelector);

    RegionSelector.CSS_TEXT = 'regionselector-text';
    RegionSelector.CSS_VALUE = 'regionselector-value';
    RegionSelector.CSS_BUTTON = 'regionselector-button';

    // ===========================================================================
    var TPL = '<label class="' + RegionSelector.CSS_TEXT + '">{text}</label>：' +
              '<span class="' + RegionSelector.CSS_VALUE + '"></span>' +
              '<span class="' + RegionSelector.CSS_BUTTON + '"></span>';

    // 需要根据设置判断是 link 还是 button
    function initUI() {
        var elem = $('.' + RegionSelector.CSS_BUTTON, this.node)[0],
            regions = this.config().regions;

        if (this.config().linkText) {
            elem.innerHTML = this.config().linkText;
        } else {
            // 创建 Button
            this.button = new Button(elem, { icon: 'fc_icon_arrow_down', iconOnly: true });
            this.layer = new RegionLayer(this._private.wrapper.appendChild(fc.create('div')));
            this.layer.setRegions(regions);
        }

        this.setText(regions);
    }

    function addEvents() {
        var me = this;
        if (this.button && this.layer) {
            var button = this.button, layer = this.layer;
            this.button.onclick = function() {
                layer.visible ? layer.hide() : layer.show();
            };
            this.layer.onsubmit = function() {
                var regions = this.getRegions();
                me.setText(regions);
                if (typeof me.onchange === 'function') {
                    me.onchange(regions);
                }
            };
            this.layer.onshow = function() {
                var pvt = button._private;
                fc.addClass(pvt.wrapper, AbstractButton.CSS_PRESS);
                fc.removeClass(pvt.iconNode, 'fc_icon_arrow_down');
                fc.addClass(pvt.iconNode, 'fc_icon_arrow_up');
            };
            this.layer.onhide = function() {
                var pvt = button._private;
                fc.removeClass(pvt.wrapper, AbstractButton.CSS_PRESS);
                fc.removeClass(pvt.iconNode, 'fc_icon_arrow_up');
                fc.addClass(pvt.iconNode, 'fc_icon_arrow_down');
            };
        }
    }

    return RegionSelector;

}($$);
