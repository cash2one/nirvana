/**
 * 保存（关键词）按钮
 * 
 * 点击箭头展开选项，有三种保存方式：
 * 1. 保存为广泛匹配
 * 2. 保存为短语匹配
 * 3. 保存为精确匹配
 *
 * 对应的值为:
 * 直接点击按钮: -1
 *     广泛匹配: 0
 *     短语匹配: 1
 *     精确匹配: 2
 *
 * 配置项如下：
 * {
 *    width:        70,    按钮宽度，默认是70（不需要指定单位，统一是px）
 *    isup:         false  是否向上展开，默认向下展开
 * }
 *
 * kr, 远征, 自动分组均会用到此组件
 * 
 * @class SaveButton
 * @author zhujialu
 * @update 2012/9/21
 */
fc.ui.SaveButton = function($) {
    
    var ComboBox = fc.ui.ComboBox;

    function SaveButton(node, config) {
        this._super(node, formatConfig(config));
        // 默认启用
        this.disable(false);
        addEvents.call(this);
    }

    SaveButton.prototype = {
        
        /**
         * 重写父类的方法
         * @method disable
         * @param {Boolean} b
         */
        disable: function(b) {
            this.button.node.title = b ? '' : '可点击右边下拉箭头调整匹配方式';
            this._super(b);
        },

        /**
         * 点击按钮或选中某个值触发
         * @event onclick
         * @param {Number} value 选中的值
         */
        onclick: null
    };

    SaveButton = fc.ui.extend(ComboBox, SaveButton);

    // =================================================================================================
    var CSS_PATTERN = 'savebutton-pattern';

    function formatConfig(config) {
        return {
            width: config.width || 70,
            text: '保存',
            isup: typeof config.isup === 'boolean' ? config.isup : false,
            skin: ComboBox.SKIN_BUTTON,
            data: [
                { text: '保存为<em class="' + CSS_PATTERN + '">广泛</em>匹配', value: 0 },
                { text: '保存为<em class="' + CSS_PATTERN + '">短语</em>匹配', value: 1 },
                { text: '保存为<em class="' + CSS_PATTERN + '">精确</em>匹配', value: 2 }
            ]
        };
    }

    function addEvents() {
        var me = this;
        this.onselect = function(type, clickButton) {
            if (typeof me.onclick === 'function') {
                me.onclick(clickButton ? -1 : +type);
            }
        };
    }

    return SaveButton;

}($$);
