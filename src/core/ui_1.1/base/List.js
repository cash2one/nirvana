/**
 * 列表
 * 配置项如下：
 * {
 *    data: [{ id: '1', text: '2' }],        数据
 *    itemTpl: '<li id="{id}">{text}</li>',  每一行的模版（占位符要与属性对应上）
 *    allowMultipleSelection: false,         是否可多选，默认单选,
 *    header: '',                            列表头部的HTML
 *    footer: ''                             列表尾部的HTML
 * }
 *
 * @class List
 * @extend Base
 * @author zhujialu
 * @update 2012/10/06
 */
fc.ui.List = function($) {

    var event = fc.event, tpl = fc.tpl;

    function List(node, config) {
        this._super(node, 'list', config);
        // 下面单行注释的部分全部会在 this.reset() 中定义
        // 这里列出来一是为了便于查找，二是为了生成文档

        /**
         * 列表的数据
         * @property {Array} data
         */
        // this.data = null;

        /**
         * 是否可以多选
         * @property {Boolean} allowMultipleSelection
         */
        this.allowMultipleSelection = !!config.allowMultipleSelection;
        
        /**
         * allowMultipleSelection 为 true 可用
         * 选定项的索引数组
         * @property {Array} selectedIndexs
         */
        // this.selectedIndexs = [];

        /**
         * allowMultipleSelection 为 true 可用
         * 选定项的数组
         * @property {Array} selectedItems
         */
        // this.selectedItems = [];

        /**
         * allowMultipleSelection 为 false 可用
         * 选定项的索引
         * @property {Number} selectedIndex
         */
        // this.selectedIndex = -1;

        /**
         * allowMultipleSelection 为 false 可用
         * 选定项
         * @property {Object} selectedItem
         */
        // this.selectedItem = null;
        
        this.reset();
        addEvents.call(this);
    }

    List.prototype = {

        /**
         * 覆盖父类方法
         * @method reset
         * @param {Object} config
         */
        reset: function(config) {
            if (this.allowMultipleSelection) {
                this.selectedIndexs = [];
                this.selectedItems = [];
            } else {
                this.selectedIndex = -1;
                this.selectedItem = null;
            }
            this.data = (config && config.data) || this.config().data || [];
            this._super(config);
        },

        /**
         * 获取或设置全部列表项
         * @method items
         * @param {Array|void} data
         * @return {Array|void}
         */
        items: function(data) {
            if (data == null) {
                return this.data;
            } else {
                this.reset({ data: data });
            }
        },

        /**
         * 选中某项。返回的 boolean 表示是否选择成功
         * @method selectItem
         * @param {Number} index 索引
         * @return {Boolean}
         */
        selectItem: function(index) {
            var target = getItemByIndex.call(this, index);
            if (!target) return false;

            fc.addClass(target.node, List.CSS_ITEM_SELECTED);
            if (!this.allowMultipleSelection) {
                if (this.selectedIndex >= 0) {
                    var item = getItemByIndex.call(this, this.selectedIndex);
                    fc.removeClass(item.node, List.CSS_ITEM_SELECTED);
                }
                this.selectedIndex = index;
                this.selectedItem = target.item;
            } else {
                this.selectedIndexs.push(index);
                this.selectedItems.push(target.item);
            }
            return true;
        },

        /**
         * 取消选择。返回的 boolean 表示是否取消成功
         * @method deselectItem
         * @param {Number} index 索引
         * @return {Boolean}
         */
        deselectItem: function(index) {
            index = index >= 0 ? index : this.selectedIndex;

            var target = getItemByIndex.call(this, index);
            if (!target) return false;

            fc.removeClass(target.node, List.CSS_ITEM_SELECTED);
            if (!this.allowMultipleSelection) {
                this.selectedIndex = -1;
                this.selectedItem = null;
            } else {
                index = fc.inArray(index, this.selectedIndexs);
                this.selectedIndexs.splice(index, 1);
                this.selectedItems.splice(index, 1);
            }
            return true;
        },

        getTpl: function() {
            var config = this.config(), itemTpl = config.itemTpl,
                header = config.header ? tpl.parse({ content: config.header }, TPL_HEADER) : '',
                footer = config.footer ? tpl.parse({ content: config.footer }, TPL_FOOTER) : '',
                content = '';

            if (this.data && this.data.length > 0) {
                fc.each(this.data, function(item) {
                    content += tpl.parse(item, itemTpl);
                });
                content = tpl.parse({ content: content }, TPL_CONTENT);
            }
            return header + content + footer;
        }
    };

    List = fc.ui.extend(fc.ui.Base, List);

    List.CSS_HEADER = 'list-header';
    List.CSS_CONTENT = 'list-content';
    List.CSS_FOOTER = 'list-footer';
    List.CSS_ITEM_SELECTED = 'list-item-selected';
    
    /**
     * 点击在整个列表上，不仅是列表项
     */
    List.EVENT_CLICK = 'list-click';
    List.EVENT_CLICK_ITEM = 'list-click-item';
    List.EVENT_ENTER_ITEM = 'list-enter-item';
    List.EVENT_LEAVE_ITEM = 'list-leave-item';

    // ================================================================

    var TPL_HEADER = '<div class="' + List.CSS_HEADER + '">{content}</div>',
        TPL_CONTENT = '<ul class="' + List.CSS_CONTENT + '">{content}</ul>',
        TPL_FOOTER = '<div class="'+ List.CSS_FOOTER +'">{content}</div>';

    function addEvents() {
        event.click(this.node, clickList, this);
        event.on(this.node, 'li', 'click', clickItem, this);
        event.on(this.node, 'li', 'mouseenter', enterItem, this);
        event.on(this.node, 'li', 'mouseleave', leaveItem, this);
    }

    function clickList(e) {
        event.fire(this, {
            type: List.EVENT_CLICK,
            target: e.target
        });
    }

    function clickItem(e) {
        event.fire(this, {
            type: List.EVENT_CLICK_ITEM,
            target: e.target
        });
    }

    function enterItem(e) {
        event.fire(this, {
            type: List.EVENT_ENTER_ITEM,
            target: e.target
        });
    }

    function leaveItem(e) {
        event.fire(this, {
            type: List.EVENT_LEAVE_ITEM,
            target: e.target
        });
    }

    // 返回 { node: li, item: {} } 结构的对象
    function getItemByIndex(index) {
        if (index >= 0 && index < this.data.length) {
            var nodes = $('li', this.node), item = this.data[index];
            return { node: nodes[index], item: item };
        } else {
            return null;
        }
    }

    return List;

}($$);
