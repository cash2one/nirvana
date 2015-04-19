/**
 * Field 指的是筛选器的每一行，即每个筛选字段
 * 左侧显示key，右侧显示多个value
 *
 * 这个对象仅处理HTML，接口包括5个字段名和2个获取模版的方法
 * 
 * 因为一些字段的展现和行为有细微的区别，所以这里列出了目前用到的四种字段
 * @author zhujialu
 * @update 2012/8/23
 */
nirvana.krModules.FilterField = function() {

    var tpl = fc.tpl, Icon = fc.common.Icon;

    var CONTAIN = '包含',
        NOT_CONTAIN = '不包含',
        SHOW_REASON = fc.common.ShowReason.TEXT,
        BUSINESS_POINT = '业务点',
        SEARCH_AMOUNT = '搜索量';

    var CSS_ITEM = 'filter_item',
        CSS_DISABLED = 'filter_disabled',
        CSS_CUSTOM = 'filter_custom',
        CSS_SELECTED = 'filter_selected',
        CSS_CANCEL = 'fc_icon_cancel';

    var TPL_FIELD = '<li class="field">' +
                        '<label class="key type">{label}：</label>' +
                        '<div class="value">{content}</div>' +
                    '</li>',

        TPL_ITEM = '<span _index="{index}" class="animated ' + CSS_ITEM + ' {className}" title="{title}">{content}</span>',
        TPL_CANCEL = Icon.getIcon(Icon.CANCEL),

        TPL_SELECTED_ITEMS =  '<div class="field">' +
                                 '<label class="key type">已选条件：</label>' +
                                 '<div class="value">{content}</div>' +
                              '</div>';

    // 包含
    function contain(values) {
        var content = createItems(values.slice(0, -2));
        // 最后两个分别是 自定义 和 不包含
        content += createItems(values[values.length - 2]);
        content += '<label class="type">' + NOT_CONTAIN + '：</label>';
        content += createItems(values[values.length - 1]);

        return tpl.parse({ label: CONTAIN, content: content }, TPL_FIELD);
    };

    // 展现理由
    function showReason(values) {
        var content = createItems(values, showReasonTool);
        return tpl.parse({ label: SHOW_REASON, content: content }, TPL_FIELD);
    };

    // 业务点
    function businessPoint(values) {
        var content = createItems(values);
        return tpl.parse({ label: BUSINESS_POINT, content: content }, TPL_FIELD);
    };

    // 搜索量
    function searchAmount(values) {
        var content = createItems(values);
        return tpl.parse({ label: SEARCH_AMOUNT, content: content }, TPL_FIELD);
    };

    function showReasonTool(item) {
        var ret = fc.common.ShowReason.getIcon(item.text);
        return ret + item.text;
    }

    /**
     * 因为有图标+文本的field，或者未来有别的非纯文本形式
     * 所以这里的第二个参数可以自定义显示行为
     * 第三个参数是className，因为 自定义 的样式比较特殊
     */
    function createItems(values, fn, className) {
        if (!fc.isArray(values)) {
            values = [values];
        }
        var html = '';
        fc.each(values, function(item) {
            var content = typeof fn === 'function' ? fn(item) : item.text, className = '';

            if (item.selected) {
                className = CSS_SELECTED;
            } else if (item.disabled) {
                className = CSS_DISABLED;
            } else if (item.type) {
                className = CSS_CUSTOM;
            }

            html += tpl.parse({ index: item.index, className: className, title: item.desc || '', 
                                content: content + (item.selected ? TPL_CANCEL : '') }, TPL_ITEM);
        });
        return html;
    }

    return {
        // 外部统一用这里的常量
        CONTAIN: CONTAIN,
        NOT_CONTAIN: NOT_CONTAIN,
        SHOW_REASON: SHOW_REASON,
        BUSINESS_POINT: BUSINESS_POINT,
        SEARCH_AMOUNT: SEARCH_AMOUNT,

        // CSS className
        CSS_ITEM: CSS_ITEM,
        CSS_DISABLED: CSS_DISABLED,
        CSS_CUSTOM: CSS_CUSTOM,
        CSS_SELECTED: CSS_SELECTED,
        CSS_CANCEL: CSS_CANCEL,
        
        // 外部只需要html，所以这里只暴露这3个接口
        getField: function(key, values) {
            var ret = '';
            switch (key) {
                case CONTAIN:
                    ret = contain(values);
                    break;
                case SHOW_REASON:
                    ret = showReason(values);
                    break;
                case SEARCH_AMOUNT:
                    ret = searchAmount(values);
                    break;
                case BUSINESS_POINT:
                    ret = businessPoint(values);
            }
            return ret;
        },

        /**
         * 传入一个筛选项数据，结构如下：
         * {
         *   field: '包含',
         *   text: '值',
         *   desc: '描述'
         *   index: '索引',
         *   type: 一般都是0，1 用来标识自定义
         *   selected: 是否选中,
         *   disabled: 是否不可选
         * }
         */
        getItem: function(item) {
            var ret = '', fn = item.field === SHOW_REASON ? showReasonTool : null;
            return createItems(item, fn);
        },

        // 折叠时显示的模版
        getSelectedItems: function(items) {
            if (items.length > 0) {
                var me = this, ret = '';
                fc.each(items, function(item) {
                    ret += me.getItem(item);
                });
                return tpl.parse({ content: ret }, TPL_SELECTED_ITEMS);
            } else {
                return '还没筛选';
            }
        }
    };
}();
