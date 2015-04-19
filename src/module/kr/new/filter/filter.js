/**
 * 筛选器
 * 主要逻辑是传入数据进行刷新
 * 因为每次获得的推词结果不同，需要根据推词结果更新为相应的筛选器
 * 当没有数据时，置空容器元素
 * @author zhujialu
 * @update 2012/8/22
 */
nirvana.krModules.Filter = function($) {

    var event = fc.event, tpl = fc.tpl,
        util = nirvana.krUtil,
        FilterField = nirvana.krModules.FilterField,
        ValueEditor = fc.ui.ValueEditor;

    // 传入筛选器的最外层元素
    function Filter() {
        this.node = $('#krFilter')[0];
        // 筛选的选项数据
        this.data = null;
        // 这个元素用于动画，避免多次取元素
        this.main = null;
        // 选项部分
        this.options = null;
        // 选中值部分
        this.selected = null;
        // 展开/收起按钮
        this.collapseBtn = null;

        // 是否是收起状态
        this.isCollapsed = null;

        // 选中的筛选项
        this.selectedFilterItems = [];
        
        addEvents.call(this);
    }

    Filter.prototype = {
        // 渲染筛选器
        // 如果没有数据，显示空的 div
        render: function(data) {
            this.data = data = data || this.data;
            var node = this.node;

            if (fc.keys(data).length > 0) {
                node.innerHTML = tpl.parse({ content: createOptionItems(data) }, TPL_FILTER);

                this.main = $('#krFilterMain', node)[0];
                this.options = $('#krFilterOptions', node)[0];
                this.selected = $('#krFilterSelected', node)[0];
                this.collapseBtn = $('#krFilterCollapseBtn', node)[0];

                this.isCollapsed = true;
                this.toggle();
            } else {
                node.innerHTML = '';
            }
            this.selectedFilterItems = [];
            updateRecommandResult.call(this);
        },

        // 清掉所有筛选项，效果比 dispose 稍微好一点，至少事件还在
        clean: function() {
            this.node.innerHTML = '';
            updateRecommandResult.call(this);
        },

        update: function(items) {
            var node = this.node;
            fc.each(items, function(item) {
                updateItem(node, item);
            });
        },

        toggle: function() {
            if (this.isCollapsed) {
                fc.show(this.options);
                fc.hide(this.selected);
                this.collapseBtn.innerHTML = '[ - ] 折叠';
                this.options.innerHTML = createOptionItems(this.data);  
            } else {
                fc.show(this.selected);
                fc.hide(this.options);
                this.collapseBtn.innerHTML = '[ + ] 展开';
                this.selected.innerHTML = createSelectedItems(this.data);
            }
            this.isCollapsed = !this.isCollapsed;
        },
        dispose: function() {
            removeEvents.call(this);
            delete this.node;
            delete this.main;
            delete this.options;
            delete this.selected;
            delete this.collapseBtn;
        }
    };

    // 展开/收起 按钮
    var TPL_COLLAPSE = '<span id="krFilterCollapseBtn" class="background_color_ease"></span>',

        TPL_FILTER = TPL_COLLAPSE + 
                      '<div id="krFilterMain">' +
                        '<ul id="krFilterOptions">{content}</ul>' +
                        '<div id="krFilterSelected"></div>' +
                      '</div>';

    function createOptionItems(data) {
        // 包含和不包含是一行，所以要单独处理一下
        var ret = FilterField.getField(FilterField.CONTAIN, data[FilterField.CONTAIN].concat(data[FilterField.NOT_CONTAIN]));

        // 需要遍历的key
        for (var key in data) {
            if (key !== FilterField.CONTAIN 
                && key !== FilterField.NOT_CONTAIN 
                && data[key].length > 0) {
                ret += FilterField.getField(key, data[key]);
            }
        }
        return ret;
    }

    function createSelectedItems(data) {
         return FilterField.getSelectedItems(util.getSelectedFilterItems(data));
    }

    function addEvents() {
        var node = this.node;
        event.on(node, '#krFilterCollapseBtn', 'click', toggle, this);
        event.on(node, '.' + FilterField.CSS_ITEM, 'click', selectFilter, this);
        event.on(node, '.' + FilterField.CSS_CUSTOM, 'click', editFilter, this);
        event.on(node, '.' + FilterField.CSS_CANCEL, 'click', cancelFilter, this);
        
        event.on(window, 'resize', updateRecommandResult, this);
    }
    
    function removeEvents() {
        var node = this.node;
        event.un(node, 'click', toggle);
        event.un(node, 'click', selectFilter);
        event.un(node, 'click', cancelFilter);
    }

    // 展开/收起(这里打算用一个动画效果，所以不直接用this.toggle)
    function toggle() {
        if (fc.logo === 'IE7' || fc.logo === 'IE8') {
            this.toggle();
            updateRecommandResult.call(this);
            return;
        }

        var me = this;

        // 先隐藏，避免在动画中可点击
        baidu.fx.fadeOut(this.collapseBtn);
        baidu.fx.collapse(this.main, {
            // 因为表格要撑满剩下的高度，所以采用了绝对定位
            // 但是筛选器会改变高度，这里要更新表格的top值
            onafterupdate: update,
            onafterfinish: function() {
                me.toggle();

                baidu.fx.expand(me.main, {
                    onafterupdate: update,
                    onafterfinish: function() {
                        fc.show(me.collapseBtn);
                        baidu.fx.fadeIn(me.collapseBtn);
                    }
                });
            }
        });

        function update() {
            updateRecommandResult.call(me);
        }
    }

    function updateRecommandResult() {
        event.fire(this, nirvana.KR.EVENT_RESULT_HEIGHT_CHANGE);
    }
    
    function changeFilters(item) {
        this.selectedFilterItems = util.getSelectedFilterItems(this.data);
        event.fire(this, {
            type: nirvana.KR.EVENT_CHANGE_FILTER,
            item: item
        });
    }

    function selectFilter(e) {
        var target = getItemNode(e.target);
        if (fc.hasClass(target, FilterField.CSS_CUSTOM)
            || fc.hasClass(target, FilterField.CSS_DISABLED)
            || fc.hasClass(target, FilterField.CSS_SELECTED)) {
            return;    
        }
        var item = util.getFilterItem(this.data, fc.attr(target, '_index')),
            prev = fc.grep(this.data[item.field], function(item) { return item.selected })[0];

        swap(this.node, item, prev);
        changeFilters.call(this, item);
    }

    function editFilter(e) {
        // 每次都是重新创建 ValueEditor
        var me = this,
            target = getItemNode(e.target),
            item = util.getFilterItem(this.data, fc.attr(target, '_index')),
            editor = new ValueEditor({ target: target, value: item.text === '自定义' ? '' : item.text, parent: $('#kr')[0] });

        editor.onsubmit = function(value) {
            value = trim(value) || '自定义';
            var oldValue = item.text;
            item.text = value;

            var selected = value !== '自定义';
            if (selected) {
                var prev = fc.grep(me.data[item.field], function(item) { return item.selected })[0];
                swap(me.node, item, prev);
            } else {
                updateItem(me.node, item);
            }
            if (value !== oldValue) {
                changeFilters.call(me, item);
            }
        };
    }

    function cancelFilter(e) {
        var index = fc.attr(getItemNode(e.target), '_index'),
            item = util.getFilterItem(this.data, index);

        item.selected = false;
        if (item.type) {
            item.text = '自定义';
        }

        if (this.isCollapsed) {
            this.selected.innerHTML = createSelectedItems(this.data);
        } else {
            updateItem(this.node, item);
        }  
        changeFilters.call(this, item);
    }

    function swap(container, cur, prev) {
        cur.selected = true;
        updateItem(container, cur);

        if (prev) {
            prev.selected = false;
            updateItem(container, prev);
        }
    }

    function getItemNode(target) {
        var index = fc.attr(target, '_index');
        if (index) {
            return target;
        } else {
            return getItemNode(target.parentNode);
        }
    }

    // 动画类型
    var animateType = 'flipInX';

    // 选中或取消都需要更新节点
    // 这里需要传入一个容器元素，本来不传也可以
    // 那么sizzle就从document往下找，这样未免太麻烦了
    function updateItem(container, filter) {
        var oldNode = $('span[_index="' + filter.index + '"]', container)[0],
            newNode = fc.create(FilterField.getItem(filter));
        oldNode.parentNode.replaceChild(newNode, oldNode);
        // 应用动画
        fc.addClass(newNode, animateType);
        fc.addClass(oldNode, animateType);
    }
    
    return Filter;

}($$);
