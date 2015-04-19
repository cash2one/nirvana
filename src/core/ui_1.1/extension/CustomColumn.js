/**
 * 自定义列( 包括按钮 + 浮层 )
 * 配置如下： （此文件最后部分是一些已有配置，可供参考）
 * [
 *   { key: 'unitname', text: '推广单元', checked: '默认是否选中，默认false', readonly: '是否只读，默认false' },
 *   ...
 * ]
 *
 * 使用时主要就是用 onsubmit 接口
 * 
 * 如果用户没有修改列，点击确定会直接无视
 * 因此外部调用时可以避免判断是否修改
 *
 * @class CustomColumn
 * @extend Base
 * @author zhujialu
 * @update 2012/10/24
 */
fc.ui.CustomColumn = function($) {

    var Button = fc.ui.Button,
        Layer = fc.ui.Layer,
        event = fc.event,
        tpl = fc.tpl;

    function CustomColumn(node, config) {
        this._inline = true;
        this._super(node, 'customcolumn', { columns: config });

        // 自定义列 toggle 按钮
        var children = this._private.wrapper.children;
        this.button = new Button(children[0], { icon: 'fc_icon_arrow_down', placement: 'left' });
        this.layer = createLayer(children[1], this.config().columns);

        // 选中默认
        selectDefault.call(this);
        addEvents.call(this);
    }

    CustomColumn.prototype = {

        /**
         * 是否置灰按钮
         * @method disable
         * @param {Boolean} b 是否置灰
         */
        disable: function(b) {
            this.button.disable(b);         
        },

        /**
         * 点击确定按钮触发
         * @event onsubmit
         * @param {Array} selected 选中项的 key 数组
         */
        onsubmit: null,

        dispose: function() {
            removeEvents.call(this);
            this.button.dispose();
            this.layer.dispose();
        },

        getTpl: function() {
            return TPL_UI;
        }
    };

    CustomColumn = fc.ui.extend(fc.ui.Base, CustomColumn);

    // ===============================================================================

    var CSS_HEADER = 'customcolumn-header',
        CSS_SHORTCUT = 'customcolumn-shortcut',
        CSS_ACTIVE = 'customcolumn-active',
        CSS_OPTIONS = 'customcolumn-options',
        CSS_ITEM = 'customcolumn-item';

    // 这样叠加两个干净的div是为了避免id或class重名，反正也用不上id和class
    var TPL_UI = '<div>自定义列</div><div></div>',

        TPL_LAYER = '<div class="' + CSS_HEADER + '">' + 
                        '<label class="' + CSS_SHORTCUT + '" _shortcut="default">默认</label>' +
                        '<label class="' + CSS_SHORTCUT + '" _shortcut="all">全部</label>' + 
                        '<label class="' + CSS_SHORTCUT + '" _shortcut="custom">自定义</label>' +
                    '</div>' +
                    '<div class="' + CSS_OPTIONS + '"><table><tbody>{content}</tbody></table></div>',
        
        TPL_COLUMN = '<td class="field">' +
                        '<input type="checkbox" id="{id}" _column="{column}" class="key" {checked} {readonly}/>' +
                        '<label class="value" for="{id}">{text}</label>' +
                     '</td>';

    function addEvents() {
        var me = this, button = this.button, layer = this.layer,
            columns = this.config().columns;
        
        button.onclick = function() {
            layer[layer.visible ? 'hide' : 'show']();
        };

        layer.onsubmit = function() {
            // 判断一下是否修改过，如果没有修改就点了确定，当作什么都没发生
            if (fc.grep(columns, function(item) { return item.userChecked !== item.submit; }).length === 0) {
                return;
            }

            var selected = [];
            updateConfig(columns, null, function(item) {
                if (item.submit = item.userChecked) {
                    selected.push(item.key);
                }
            });

            if (typeof me.onsubmit === 'function') {
                me.onsubmit(selected);
            }
        };

        layer.onshow = function() {
            fc.removeClass(button._private.iconNode, 'fc_icon_arrow_down');
            fc.addClass(button._private.iconNode, 'fc_icon_arrow_up');
        };

        layer.onhide = function() {
            var changed = [];
            updateConfig(columns, null, function(item) {
                if (item.userChecked !== item.submit) {
                    changed.push(item);
                    item.userChecked = item.submit;
                }
            });
            if (changed.length > 0) {
                updateView(changed);
            }
            fc.removeClass(button._private.iconNode, 'fc_icon_arrow_up');
            fc.addClass(button._private.iconNode, 'fc_icon_arrow_down');
        };

        event.on(layer.node, '.' + CSS_SHORTCUT, 'click', clickShortcut, this);
        event.on(layer.node, 'input', 'click', clickCheckbox, this);
    }

    function removeEvents() {
        this.button.onclick = this.layer.onsubmit = this.layer.onshow = this.layer.onhide = null;
        var layer = this.layer.node;
        event.un(layer, 'click', clickShortcut);
        event.un(layer, 'click', clickCheckbox);
    }

    function clickShortcut(e) {
        var target = e.target;

        switch (fc.attr(target, '_shortcut')) {
            case 'default':
                selectDefault.call(this);
                break;
            case 'all':
                selectAll.call(this);
                break;
            case 'custom':
                selectCustom.call(this);
                break;
        }
    }

    function clickCheckbox(e) {
        var columns = this.config().columns, checkbox = e.target;
        updateConfig(columns, checkbox.id, { userChecked: checkbox.checked });

        if (isDefault(columns)) {
            selectDefault.call(this);
        } else if (isAll(columns)) {
            selectAll.call(this);
        } else {
            selectCustom.call(this);
        }
    }

    // 选中 默认 快捷方式
    function selectDefault() {
        toggleShortcut(this.layer.node, 'default');
        setCheckbox(this.config().columns, function(item) {
            return item.checked;
        });
    }

    // 选中 全部 快捷方式
    function selectAll() {
        toggleShortcut(this.layer.node, 'all');
        setCheckbox(this.config().columns, function(item) {
            return true;
        });
    }

    // 选中 自定义 快捷方式
    function selectCustom() {
        toggleShortcut(this.layer.node, 'custom');
        setCheckbox(this.config().columns, function(item) {
            return item.userChecked;
        });
    }

    // 用户点击checkbox后，是否产生了'默认'的选中结果
    function isDefault(config) {
        var ret = true;
        fc.each(config, function(item) {
            if (item.checked !== item.userChecked) {
                ret = false;
                return false;
            }
        });
        return ret;
    }

    // 用户点击checkbox后，是否产生了'全部'的选中结果
    function isAll(config) {
        var ret = true;
        fc.each(config, function(item) {
            if (!item.userChecked) {
                ret = false;
                return false;
            }
        });
        return ret;
    }

    // 粗体显示某一个
    function toggleShortcut(layerNode, name) {
        var elem = $('label[_shortcut="' + name + '"]', layerNode)[0];
        fc.toggleSingle(CSS_ACTIVE, elem, elem.parentNode.children);
    }

    // 批量设置checkbox
    function setCheckbox(config, fn) {
        fc.each(config, function(item) {
            var checkbox = $('#' + item.id)[0];
            item.userChecked = checkbox.checked = fn(item);
        });
    }

    // 更新配置项
    function updateConfig(config, id, obj) {
        fc.each(config, function(item) {
            if (!id || id === item.id) {
                if (typeof obj === 'function') {
                    obj(item);
                } else {
                    for (var key in obj) {
                        item[key] = obj[key];
                    }
                }
            }
        });
    }

    function updateView(config) {
        fc.each(config, function(item) {
            var checkbox = $('#' + item.id)[0];
            checkbox.checked = item.userChecked;
        });
    }

    function createLayer(node, config) {
        var html = '', isEven = true;
        for (var i = 0, len = config.length, item, id; i < len; i++) {
            html += '<tr class="' + (isEven ? 'even' : 'odd') + '">';
            
            item = config[i++];
            html += createColumn(item);
            
            if (item = config[i]) {
                html += createColumn(item);
            }

            html += '</tr>';
            isEven = !isEven;
        }
        return new Layer(node, { content: tpl.parse({ content: html }, TPL_LAYER), width: 300 });
    }

    // 创建 layer 的过程中会对配置进行一些扩展，便于实现后面的逻辑
    // 扩展了 3 个属性：id, userChecked( 用户是否勾选 ), submit( 是否确定过 )
    function createColumn(configItem) {
        var id = fc.random();
        configItem.id = id;

        var checked = !!configItem.checked;
        configItem.submit = configItem.userChecked = configItem.checked = checked;

        return tpl.parse({ id: id, 
                           column: configItem.key, 
                           text: configItem.text, 
                           readonly: configItem.readonly ? 'disabled' : '',
                           checked: checked ? 'checked' : '' }, TPL_COLUMN);
    }

    return CustomColumn;

}($$);


// 定义几个用到的配置
fc.ui.CustomColumn.KR = [
    { key: 'word', text: '关键词', checked: true, readonly: true },
    { key: 'total_weight', text: '展现理由', checked: true, readonly: true },
    { key: 'pv', text: '日均搜索量', checked: true, readonly: true },
    { key: 'kwc', text: '竞争激烈程度', checked: true, readonly: true },
    { key: 'pv_trend_month', text: '搜索量最高月份' }
];
