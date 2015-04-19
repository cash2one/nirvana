/**
 * [TODO] 
 * 1. .table-td 设置padding时需要动态取值计算宽度
 * 2. 再次调用render()时，状态的重置，比如需要取消header的checkbox的选中状态
 *
 * 如果单元格不需要边框色，请设置
 * td {
 *     border-color: transparent;
 * }
 * 不要设置为 border: none; 否则会略微影响表格的对齐效果
 *
列配置项如下：
{
 // 第一列是否为 checkbox
 selectable: true,
 // 为复选框设置一个伙伴，表示第几列绑定到复选框，一般会设置成 1
 // selectable 为 true 时可用
 buddy: 1,

 // 数据为空时显示的提示语, 显示在表格主体，居中对齐
 emptyTip: '',

 // 是否记住每列生成的content，这样在排序等操作时，可以直接输出，默认为false
 // 如果表格的数据是不可变的，打开此功能性能比较好
 // 如果表格存在行内编辑的需求就可以无视了
 keepContent: true,

 // 配置分组
 group: {
    // 分组标题字段，默认是 title
    title: '', 
    // 分组数据字段，默认是 data
    data: '',

    // 是否可折叠, 只有为true，下面两个属性才有意义
    foldable: true,

    // 默认是否为折叠状态
    defaultFolded: true,

    // 如果 defaultFolded 为 true，则用这个属性设置首次折叠时显示多少条，
    // 之后的折叠统一是显示0条
    showSize: 5
 },

 columns: [
    {
        // 该列对应的数据的字段名
        field: '', 
        // 字段类型，可选三种：text number date, 默认是text
        type: 'date',
        // 如果 type 为 date，需配置 date 的格式
        pattern: 'yyyy-MM-dd',
        // 该列是否可拖拽改变列宽
        dragable: true, 
        // 表头的标题，可以是 string 或 function
        title: '', 
        // 内容，可以是 string 或 function
        content: function(dataItem) { return dataItem.a; },
        // 表格行的class，一般只需要第一列设置此接口即可
        rowClass: function(dataItem) { return 'class'; },
        // 该列是否可排序
        sortable: true, 
        // 表头是否需要气泡，需要的话填入 bubble 的 source 名称
        bubble: 'sourceName',
        // 配置样式，格式和 css 完全一致
        style: {
            width: 200
            'min-width': 100
        }
    },
    ...
 ]
}

 * @class Table
 * @author zhujialu
 * @update 2012/07/20
 */
fc.ui.Table = function($) {

    var Base = fc.ui.Base,
        event = fc.event,
        tpl = fc.tpl;

    function Table(node, config) {
        this._super(node, 'table', config);

        /**
         * 表头元素
         * @property {HTMLElement} thead
         */
        this.thead = null;

        /**
         * 表格主体元素
         * @property {HTMLElement} tbody
         */
        this.tbody = null;

        /**
         * 渲染表格所用的数据
         * @property {Array} data 
         */
        this.data = null;

        // var pvt = this._private;
        //
        // 用户传入的最原始的配置
        // pvt.config = null;

        // 列配置，数组元素类型为Column
        // pvt.columns = [];

        // 分组配置
        // pvt.group = null;

        // 下面两个属性只能存在一个
        // 如果开启分组功能，使用groups; 反之你懂的
        // pvt.rows = [];
        // pvt.groups = [];

        // 拖动列宽时的那根黑线{HTMLElement}
        // pvt.colResizer = null;

        // 只要有一列可拖动，这个属性就是true
        // pvt.dragable = false;
        //
        this.reset();
        addEvents.call(this);        
    }

    Table.prototype = {

        /**
         * 重置整个表格，如果需要渲染tbody，需再调用 render()
         * 设计这个接口是为了自定义列考虑的
         * @method reset
         * @param {Object} config 最新的配置
         */
        reset: function(config) {
            var thead = this.thead, tbody = this.tbody;
            if (thead && tbody) {
                fc.ui.dispose(thead);
                fc.ui.dispose(tbody);
                thead.innerHTML = tbody.innerHTML = '';
            } else {
                thead =  $('.' + CSS_THEAD, this.node)[0];
                tbody = $('.' + CSS_TBODY, this.node)[0];
            }
            // 把 thead 和 tbody 拿出来，防止干掉外部绑定的事件
            var elem = thead.parentNode;
            elem.removeChild(thead);
            elem.removeChild(tbody);
            // 重置一下
            this._super(config);
            // 再把原来的 thead 和 tbody 放回去
            elem.innerHTML = '';
            this.thead = elem.appendChild(thead);
            this.tbody = elem.appendChild(tbody);

            initConfig.call(this);
            initUI.call(this);
        },

        /**
         * 渲染tbody
         * @method render
         * @param {Array} data 要渲染的数据
         */
        render: function(data) {
            if (this._renderTimer) {
                clearTimeout(this._renderTimer);
                delete this._renderTimer;
                if (typeof this.onafterrender === 'function') {
                    this.onafterrender(true);
                }
            }
            data = data || this.data || [];
            this.data = [];

            var pvt = this._private;
            if (!arguments[1]) {
                pvt[pvt.group ? 'groups' : 'rows'] = [];
                resetSortBtn(this.thead);
            }

            if (data.length > 0) {
                this.tbody.innerHTML = '';
                this[pvt.group ? 'appendGroups' : 'appendRows'](data, arguments[1]);
            } else {
                this.tbody.innerHTML = this.config().emptyTip || '';
                if (typeof this.onafterrender === 'function') {
                    this.onafterrender();
                }
            }
        },
        
        /**
         * 获得所有 Row 对象
         * @method getTotalRows
         * @return {Array}
         */
        getTotalRows: function() {
            var pvt = this._private;
            if (pvt.group) {
                var ret = [];
                fc.each(pvt.groups, function(group) {
                    fc.push(ret, group.items);
                });
                return ret;
            } else {
                return pvt.rows;
            }
        },

        /**
         * 获得选中的数据
         * @method getSelectedData
         * @return {Array}
         */
        getSelectedData: function() {
            var rows = this.getTotalRows(), 
                selectedRows = fc.grep(rows, function(row) { return row.selected; });
            return fc.map(selectedRows, function(row) { return row.data; });
        },

        /**
         * 因为 IE 不支持 tr.innerHTML = '' 方式覆盖
         * 因此设计一个接口，专门处理这类需求
         * @method setRowContent
         * @param {Number} index 行号
         * @param {String} text 内容
         * @return {HTMLElement}
         */
        setRowContent: function(index, text) {
            if (this._private.group) {
                p('[Table] 分组暂不支持 setRowContent');
                return;
            }

            var tr = this.getRow(index).node;
            for (var i = tr.children.length - 1; i > 0; i--) {
                tr.removeChild(tr.children[i]);
            }
            var td = tr.children[0];
            td.colSpan = this._private.columns.length;
            td.innerHTML = text;
            return tr;
        },

        /**
         * 在第 index 行插入行
         * @method insertRows
         * @param {Number} index 插入的位置
         * @param {Array} data 插入的数据
         */
        insertRows: function(index, data) {
            var target = this.getRow(index).node;
            if (!target) {
                return this.appendRows(data);
            }

            var rows = this._private.rows, columns = this._private.columns, size = data.length;
            fc.splice(this.data, index, 0, data);
            // 中间留出一段undefined
            fc.each(rows.splice(index), function(row) {
                row.index += size;
                rows[row.index] = row;
            });

            var tbody = this.tbody, table = fc.parent(target, 'table'), before = table;

            if (target.rowIndex !== 1) {
                // 把后面的截走
                before = createTable(columns)();
                for (var i = target.rowIndex, len = table.rows.length; i < len; i++) {
                    before.appendChild(table.rows[i]);
                }
                if (table.nextSibling) {
                    tbody.insertBefore(before, table.nextSibling);
                } else {
                    tbody.appendChild(before);
                }
            }

            index = 0;
            createByInterval(data, function(sliceData) {
                var table = createTable(columns).call(me, rows, index, sliceData);
                tbody.insertBefore(table, before);
                index += sliceData.length;
            }).call(this);
        },

        /**
         * 在第 index 组插入分组
         * @param {Number} index 插入的位置
         * @param {Array} data 插入的数据
         */
        insertGroups: function(index, data) {
            var target = this.getGroup(index).node,
                groups = this._private.groups, size = data.length;

            fc.splice(this.data, index, 0, data);
            if (target) {
                fc.each(groups.splice(index), function(group) {
                    group.index += size;
                    groups[group.index] = group;
                });
            }

            var me = this,
                tbody = this.tbody, 
                name = target ? 'insertBefore' : 'appendChild',
                config = this._private.group,
                titleField = config.title,
                dataField = config.data,
                showSize = config.showSize,
                i = 0;

            insertGroup(data[i]);

            function insertGroup(item) {
                if (!item) return true;

                var group = groups[index] || (groups[index] = new Group(index, item[titleField], config.defaultFolded));
                index++;

                var elem = group.createElement(config.foldable, item[dataField], me, function() {
                    return insertGroup(data[++i]);
                });

                tbody[name](elem, target);
            }
        },

        appendRows: function(data) {
            fc.push(this.data, data);

            var tbody = this.tbody, 
                columns = this._private.columns, 
                rows = this._private.rows, me = this;
            
            var index = 0;
            createByInterval(data, function(sliceData) {
                var table = createTable(columns).call(me, rows, index, sliceData);
                tbody.appendChild(table);
                index += sliceData.length;
            }).call(this);
        },

        appendGroups: function(data) {
            this.insertGroups(this.data.length, data);
        },

        /**
         * 获得 Row 对象
         * 返回对象结构为
         * {
         *   index: 索引
         *   node: HTMLElement,
         *   row: row 对象
         * }
         * @method getRow
         * @param {Number} index 可以是行索引(表格无分组)，也可以是表格行元素(表格有分组)
         * @return {Object}
         */
        getRow: function(index) {
            var ret;
            if (this._private.group && isNaN(+index)) {
                var group = this.getGroup(index).group;
                ret = group.getRow(index);
            } else {
                ret = getRow(this.tbody, index);
                if (ret.node) {
                    ret.row = this._private.rows[ret.index];
                }
            }
            return ret;
        },

        getGroup: function(index) {
            var isElement = isNaN(+index), target, group;
            if (isElement) {
                target = fc.parent(index, '.' + CSS_GROUP);
                index = Group.getIndex(this.tbody, target);
            } else if (group = this._private.groups[index]) {
                target = group.getElement(this.tbody);
            }
            var ret = {};
            if (target) {
                ret.index = index;
                ret.node = target;
                ret.group = this._private.groups[index];
            }
            return ret;
        },

        getCell: function(elem) {
            var td = fc.parent(elem, 'td');
            return {
                index: td.cellIndex,
                node: $('.' + CSS_TBODY_CELL, td)[0]
            };    
        },

        /**
         * 删除第 index 行
         * @method deleteRow
         * @param {Number} index 行号，从 0 开始计数
         */
        deleteRow: function(index) {
            if (this._private.group) {
                p('[Table] 分组暂不支持 deleteRow');
                return;
            }
            var tr = this.getRow(index).node, table = fc.parent(tr, 'table');
            table.deleteRow(fc.inArray(tr, table.rows));
            if (table.rows.length === 1) {
                table.parentNode.removeChild(table);
            }

            this.data.splice(index, 1);
            this._private.rows.splice(index, 1);
            fc.each(this._private.rows.slice(index), function(row) {
                row.index--;
            });

            this.onresize();
        },

        /**
         * 点击排序按钮的事件处理函数
         * @event onsort
         * @param {String} field 表示哪一列被排序
         * @param {String} type 排序类型，asc 或 desc
         */
        onsort: null,

        /**
         * 鼠标移进表格行的事件处理函数
         * @event onrowenter
         * @param {HTMLElement} tr 表格的 tr 元素
         */
        onrowenter: null,

        /**
         * 鼠标移出表格行的事件处理函数
         * @event onrowleave
         * @param {HTMLElement} tr 表格的 tr 元素
         */
        onrowleave: null,

        /**
         * 表格渲染完成的事件处理函数
         * @event onafterrender
         * @param {Boolean} interrupt 是否是中断。正在渲染表格的时候，用户再次触发了表格的渲染，
         * 就需要中断上次的渲染行为
         */
        onafterrender: null,
        
        onresize: function() {
            // 隐藏时，直接无视resize
            if (this.thead.offsetWidth === 0) return;

            var columns = this._private.columns,
                scrollBarWidth = this.tbody.offsetWidth - this.tbody.clientWidth,
                borderRight = scrollBarWidth > 0 ? scrollBarWidth : 0;

            // 减少表头最后一列的宽度, 经测试发现改变 width 无法实现需求
            // 于是改成增加最后一个 table-th 的 right 值
            var th = getHeadRows(this.thead)[0].cells[columns.length - 1];
            fc.css(th, 'border-right-width', borderRight);

            var me = this;
            fc.each(getSortColumns(columns), function(col, index) {
                col.updateWidth(me.thead, me.tbody);
            });
        },

        dispose: function() {
            fc.ui.dispose(this.thead);
            fc.ui.dispose(this.tbody);
            event.un(this.thead);
            event.un(this.tbody);
            this._super();
        },

        getTpl: function() {
            return TPL_THEAD + TPL_TBODY;
        }
    };

    Table = fc.ui.extend(Base, Table);

    // ============================ 私有属性和方法 ================================
    var UNIT_SIZE = 20;

    var CSS_THEAD = 'table-thead',
        CSS_TBODY = 'table-tbody',

        // ==========================  表头 =======================================
        // 表头单元格
        CSS_TH = 'table-th',
        CSS_THEAD_CELL = 'table-thead-cell',
        CSS_THEAD_TITLE = 'table-thead-title',
        // ========================= 表头的icons ==================================
        // 默认排序时
        CSS_SORT = 'table-icon-sort',
        // 升序时
        CSS_SORT_ASC = 'table-icon-sort-asc',
        // 降序时
        CSS_SORT_DESC = 'table-icon-sort-desc',
        // 筛选按钮
        CSS_FILTER = 'table-icon-filter',
        // 拖拽
        CSS_DRAG_LEFT = 'table-thead-drag-left',
        CSS_DRAG_RIGHT = 'table-thead-drag-right',
        
        // ================================ 表主体 ===============================
        //
        CSS_GROUP = 'table-group',
        CSS_GROUP_TITLE = 'table-group-title',
        CSS_GROUP_LIST = 'table-group-list',
        CSS_GROUP_FOLDED = 'table-group-folded',
        CSS_GROUP_FOLDABLE = 'table-group-foldable',
        CSS_UNIT = 'table-unit',

        CSS_ROW = 'table-row', 
        // 表主体单元格
        CSS_TD = 'table-td',
        CSS_TBODY_CELL = 'table-tbody-cell',
        // 第一行需要隐藏，因为tbody表格table-layout: fixed，单元格宽度取决于第一行的单元格宽度
        // 如果第一行出现分组的情况，即一行只有一个单元格，会导致宽度错乱，所以统一添加一个隐藏的空行
        CSS_HEADER_ROW = 'table-header-row',

        // 行被选中的样式
        CSS_ROW_SELECTED = 'table-row-selected',
        CSS_CHECKBOX = 'table-checkbox';


    // 组件模版
    var TPL_THEAD = '<div class="' + CSS_THEAD + '"></div>',
        TPL_TBODY = '<div class="' + CSS_TBODY + '"></div>',

        // IE7 不支持 border-spacing 属性，只支持HTML属性，为了兼容它，就这么写吧
        // 主要是 thead 需要使用 border-collapse: separate; 这样才能获的正确的border宽度
        // 如果用 border-collapse: collapse; 边框宽度需要减半，太不自然了
        TPL_THEAD_TABLE = '<table cellspacing="0">' +
                            '<thead>' +
                                '<tr>{content}</tr>' +
                            '</thead>' +
                         '</table>',
        
        TPL_CHECKBOX = '<input {id} class="' + CSS_CHECKBOX + '" type="checkbox" {checked}/>',
        //=============== 表头和表格单元格(样式写在div上，不要写在TH/TD上，不然很多麻烦) =====================
        TPL_THEAD_CELL =  '<th><div><div class="' + CSS_THEAD_CELL + '">{content}</div></div></th>',

        TPL_TITLE = '<span class="' + CSS_THEAD_TITLE + '">{title}</span>',
        // 如果可排序，则 title 在 sortBtn 里面，这样可以整体作为按钮进行点击，点击面扩大了
        TPL_TITLE_SORT = '<span class="' + CSS_THEAD_TITLE + ' ' + CSS_SORT + '">{title}</span>',
        TPL_BUBBLE = '<span _ui="type:Bubble;source:{source}"></span>',
        TPL_FILTER_BUTTON = '<button type="button" class="' + CSS_FILTER + '" title="点击筛选"></button>',

        // 控制列宽
        TPL_COL_RESIZE = '<div class="col-resize-marker"></div>',
        TPL_GROUP = '<div class="' + CSS_GROUP + '{groupClass}">' +
                        '{groupTitle}' +
                        '<div class="' + CSS_GROUP_LIST + '"></div>' + 
                    '</div>';

    // ======================================= 配置相关 ============================================
    function initConfig() {
        var config = this.config();
        if (config.selectable) {
            // 如果开启了勾选功能，在第一列塞入checkbox
            if (!config.columns[0].checkbox) {
                config.columns.unshift({
                    checkbox: true
                });
            }
        }
    }
    
    function initUI() {
        if (!this.config().columns) {
            p('[Table] 缺失列配置!');
            return;
        }

        // 读取配置，把外部传入的配置转成内部统一格式
        formatConfig.call(this);
        // 创建表头，主要是是否可排序，是否需要气泡提示，是否需要筛选
        createThead.call(this);

        var pvt = this._private;
        if (pvt.dragable) {
            pvt.colResizer = fc.create(TPL_COL_RESIZE);
            pvt.wrapper.appendChild(pvt.colResizer);
        }
    }
    
    /**
     * 格式化外部传入的配置
     * 转换为内部使用的格式
     */
    function formatConfig() {
        function onsort(isAsc) {
            var fn = sortBy(this.field, isAsc, this.type.value, this.type.dataFormat);
            if (pvt.rows) {
                pvt.rows.sort(fn);
            } else {
                fc.each(pvt.groups, function(group) {
                    group.items.sort(fn);
                });
            }
            me.render(null, true);
            if (typeof me.onsort === 'function') {
                me.onsort(this.field, isAsc ? 'asc' : 'desc');
            }
        }

        function onresize(width) {
            this.updateWidth(me.thead, me.tbody, width);
        };

        var me = this, pvt = this._private, config = pvt.config;
        // 根据传入的 columns 配置，创建内部的 Column 对象
        pvt.columns = createColumns(config.columns, onsort, onresize);
        // 分组配置
        var group = config.group;
        if (group) {
            group.title = group.title || 'title';
            group.data = group.data || 'data';
            pvt.group = group;
        }
        
        // 判断表格是否可拖动
        // 这关系到是否加入col-resize和是否添加mousedown事件
        fc.each(pvt.columns, function(col) {
            if (col.thead.classList.length > 0) {
                pvt.dragable = true;
                return false;
            }
        });
    }

    /**
     * 把调用者传入的列配置转换为内部使用的格式
     * @return {Array} 返回格式化后的列配置
     */
    function createColumns(columns, onsort, onresize) {
        var i = 0, len = columns.length,
            first = 0, last = len - 1,
            ret = [];

        // 如果第一列是checkbox，直接取单例对象
        if (columns[0].checkbox) {
            ret.push(Column.checkbox);
            i = 1;
        }

        for (; i < len; i++) {
            // dragable 需要参考左列和右列的情况才能确定当前列是否可拖动
            // 比如当前列设置为可拖动，但它左右都不可拖动，那它肯定是不可拖的
            var dragable = {};
            if (columns[i].dragable) {
                var leftColumn = i !== first ? columns[i - 1] : {},
                    rightColumn = i !== last ? columns[i + 1] : {};
                
                if (leftColumn.dragable) {
                    dragable.left = true;
                }
                if (rightColumn.dragable) {
                    dragable.right = true;
                }
            }
            var col = createColumn(i, columns[i], dragable);
            col.onsort = onsort;
            col.onresize = onresize;
            ret.push(col);
        }

        // 重点要处理一下宽度
        // 如果每一列都指定了宽度，那么删掉最后一列的宽度
        // 即必须确保至少有一列没有指定宽度
        // http://w3help.org/zh-cn/causes/RE8014
        var flag = true;
        fc.each(ret, function(col) {
            if (!col.style.width) { 
                flag = false;
                return false;
            }
        });
        if (flag) {
            delete ret[ret.length - 1].style.width;
        }
        return ret;
    }

    /**
     * 根据传入的列配置创建一个Column对象
     */
    function createColumn(colIndex, columnConfig, dragable) {
        var col = new Column(colIndex);
        col.field = columnConfig.field;
        col.content = columnConfig.content;
        col.rowClass = columnConfig.rowClass;
        col.style = columnConfig.style || {};
        
        col.thead.classList = createColumnDragableClass(dragable);
        col.thead.content = createColumnTheadContent(columnConfig);
        col.type = createColumnType(columnConfig);
        
        return col;
    }

    // 处理 title, sortable, bubble, filter 等配置项
    // 这几项都是表头部分的
    function createColumnTheadContent(columnConfig) {
        var title = columnConfig.title;
        title = typeof title === 'function' ? title() : title;

        if (columnConfig.checkbox) {
            // 如果是第一列的checkbox
            return title;
        }
        // 如果有排序，通过className控制
        var str = columnConfig.sortable ? TPL_TITLE_SORT : TPL_TITLE;
        title = tpl.parse({ title: title }, str);

        var bubble = columnConfig.bubble ? tpl.parse({ source: columnConfig.bubble }, TPL_BUBBLE) : '',
            filter = columnConfig.filter ?  TPL_FILTER_BUTTON : '';

        return title + bubble + filter;
    }

    // 处理 type, dataFormat 等配置项
    // 因为如果 type === 'date' 时，需要指定日期格式才好进行排序
    // 如 2012年12月1日，配置为 { type: 'date', dataFormat: 'YYYY年MM月d日'}
    function createColumnType(columnConfig) {
        var value = (columnConfig.type || 'text').toLowerCase();
        if (value === 'date') {
            var dataFormat = columnConfig.dataFormat || 'yyyy-MM-dd';
        }
        return { value: value, dataFormat: dataFormat };
    }

    function createColumnDragableClass(dragable) {
        var ret = [];
        if (dragable.left) {
            ret.push(CSS_DRAG_LEFT);
        }
        if (dragable.right) {
            ret.push(CSS_DRAG_RIGHT);
        }
        return ret;
    }

    // ==================================== 配置处理到此结束 =======================================

    /**
     * 创建表头
     *
     * 这个方法也许看起来有点疑惑，解释如下：
     * 改变列宽需要先知道该列的最小宽度（表头列内容撑开的实际宽度）
     * 要取得这个值：
     *   首先不要设置 CSS_THEAD, 这样 css 就不会起作用
     *   渲染完表头之后，进入此方法，通过fc.width()获得列的宽度，即最小宽度
     *   然后设置css，完成整个渲染过程
     */
    function createThead() {
        var thead = this.thead,
            columns = this._private.columns,
            html = '';

        fc.each(columns, function(col) {
            var content = col.thead.content;
            html += tpl.parse({ content: typeof content === 'function' ? content() : content }, TPL_THEAD_CELL);
        });
        thead.innerHTML = tpl.parse({ content: html }, TPL_THEAD_TABLE);

        // 初始化Bubble, 这样才可正确算出表头单元格的宽度
        Base.init($('span[_ui*="Bubble"]', thead));

        // 先去掉CSS_THEAD, 这样可获得最小宽度
        fc.removeClass(thead, CSS_THEAD);

        // 现在还没有设置 CSS_TH 这一层，这层是为了拖拽列宽设计的
        // 这时赶紧去获取最小宽度
        var cells = getHeadRows(thead)[0].cells;
        setColumnsMinWidth(columns, cells);
        
        fc.addClass(thead, CSS_THEAD);
        setTheadStyle(columns, cells, thead.offsetWidth);
    }

    function setColumnsMinWidth(columns, cells) {
        fc.each(columns, function(col, index) {
            var cell = cells[index];
            // 5px 是阈值，不然文本会出现折行的情况
            col.setMinWidth(col.checkbox ? col.style.width : fc.width(cell) + 5);
        });
    }

    function setTheadStyle(columns, cells, totalWidth) {
        fc.each(getSortColumns(columns), function(col) {
            var cell = cells[col.index], th = cell.children[0];
            fc.addClass(th, CSS_TH);
            
            var classList = col.thead.classList;
            if (classList.length > 0) {
                fc.addClass(th, classList.join(' '));
            }

            col.applyStyleToThead(cell, totalWidth);
        });
    }

    // 获得排序的列，这里所谓的排序是把指定了宽度的列排前面
    function getSortColumns(columns) {
        // 排序后的列，这里的排序指的是指定过width的排在前面，没有指定width的排在后面
        // 这样才能正确算出宽度
        var list = [], i = 0;

        // 排序
        fc.each(columns, function(col) {
            if (col.style.width) {
                list.splice(i++, 0, col);
            } else {
                list.push(col);
            }
        });
        return list;
    }

// ============================================================================================

    // 延时创建(分组的情况下，单个分组结束会调callback....明天来改，尼玛)
    function createByInterval(data, fn, callback) {
        return function(index) {
            
            if (data.length === 0) {
                
                var me = this;
                
                setTimeout(function() {
                    
                    if (typeof callback !== 'function' || callback()) {
                        me.onresize();
                        if (typeof me.onafterrender === 'function') {
                            me.onafterrender();
                        }
                    }
                
                }, 5);
                
                
                return;
            }
            
            index = index || 0;
            
            var start = index * UNIT_SIZE, 
                end = Math.min((index + 1) * UNIT_SIZE, data.length),
                sliceData = data.slice(start, end);

            if (sliceData.length === 0) {
                if (typeof callback !== 'function' || callback()) {
                    this.onresize();
                    if (typeof this.onafterrender === 'function') {
                        this.onafterrender();
                    }
                }
                return;
            }

            fn(sliceData);

            var callee = arguments.callee, me = this;
            this._renderTimer = setTimeout(function() {
                delete me._renderTimer;
                callee.call(me, index + 1);
            }, 10);
        };
    }

    function createTable(columns) {
        var table = fc.create('<table class="' + CSS_UNIT + '"></table>'), tr = table.insertRow(0);
        tr.className = CSS_HEADER_ROW;
        fc.each(columns, function(col, i) {
            var td = tr.insertCell(i);
            fc.width(td, col.width);
        });
        
        /**
         * @param {Array} rows row 对象的容器，一般是this._private.rows 或 group.items
         * @param {Number} index 插入 rows 的开始行
         * @param {Array} data 插入的数据
         * @return {HTMLElement}
         */
        return function(rows, index, data) {
            // 没有传参表示直接返回table
            if (arguments.length === 0) return table;
            var me = this, rowIndex = 0,
                keepContent = this.config().keepContent,
                buddy = this.config().buddy;
            fc.each(data, function(item) {
                var row = rows[index] || (rows[index] = new Row(index, item)),
                    tr = insertRow(table, rowIndex++, columns, row, keepContent, buddy);
                index++;
            });
            return table;
        };
    }

    function insertRow(table, index, columns, row, keepContent, buddy) {
        // 第一行是定宽列，所以不计入index
        var data = row.data, tr = table.insertRow(index + 1), 
            id = buddy && fc.random(), className = [CSS_ROW];
        fc.each(columns, function(col, i) {
            var td = tr.insertCell(i);
            td.className = CSS_TD;
            fc.css(td, col.style);
            
            var content;
            if (col.checkbox) {
                content = col.content(id, row.selected);
            } else {
                var name = '_col_' + col.field + '_content';
                if ((content = data[name]) == null) {
                     content = typeof col.content === 'function' ? col.content(data) : col.content;
                    if (keepContent) {
                        data[name] = content;
                    }
                }
            }
            if (i === buddy) {
                content = '<label for="' + id + '" class="' + CSS_TBODY_CELL + '">' + content + '</label>';
            } else {
                content = '<div class="' + CSS_TBODY_CELL + '">' + content + '</div>';
            }

            td.innerHTML = content;
            className.push(typeof col.rowClass === 'function' ? (col.rowClass(data) || '') : '');
        });
        if (row.selected) {
            className.push(CSS_ROW_SELECTED);
        }
        tr.className = className.join(' ');

        return tr;
    }
    // ====================================================================================================

    function addEvents() {
        var pvt = this._private, thead = this.thead;
        event.on(thead, '.' + CSS_SORT, 'click', clickSortBtn, this);

        if (pvt.dragable) {
            event.mousedown(thead, onDragerPress, this);
            delete pvt.dragable;
        }
    
        var tbody = this.tbody;
        event.on(tbody, 'tr', 'mouseenter', enterRow, this);
        event.on(tbody, 'tr', 'mouseleave', leaveRow, this);
        if (pvt.group && pvt.group.foldable) {
            event.on(tbody, '.' + CSS_GROUP_FOLDABLE, 'click', toggleGroup, this);
        }

        event.on(this.node, '.' + CSS_CHECKBOX, 'click', clickCheckbox, this);
    }

    function removeEvents() {
        event.un(this.thead, 'click', clickSortBtn);
        event.un(this.thead, 'mousedown', onDragerPress);

        event.un(this.tbody, 'mouseenter', enterRow);
        event.un(this.tbody, 'mouseleave', leaveRow);
        event.un(this.tbody, 'click', toggleGroup);

        event.un(this.node, 'click', clickCheckbox);
    }

    /**
     * 点击排序按钮
     */
    function clickSortBtn(e) {
        var index = fc.parent(e.target, 'th').cellIndex, 
            isAsc = toggleSort(e.target),
            column = this._private.columns[index];
        if (typeof column.onsort === 'function') {
            column.onsort(isAsc);
        }
    }

    // =================================== hover高亮 =======================================
    function enterRow(e) {
        if (typeof this.onrowenter === 'function') {
            this.onrowenter(e.currentTarget);
        }
    }

    function leaveRow(e) {
        if (typeof this.onrowleave === 'function') {
            this.onrowleave(e.currentTarget);
        }
    }

    // ===================================== 选择行 ==========================================
    function clickCheckbox(e) {
        var checkbox = e.target, tr = fc.parent(checkbox, 'tr'),
            // 是 勾选 还是 取消勾选
            selected = checkbox.checked,
            // 全选 还是 单选
            all = fc.hasClass(checkbox.parentNode, CSS_THEAD_CELL);

        toggleRow.call(this, all ? this.tbody : tr, selected, all);

        // 更新全选checkbox
        checkbox = all ? checkbox : getCheckbox(this.thead);
        checkbox.checked = this.getSelectedData().length === this.getTotalRows().length;
    }

    /**
     * 选中/取消选中 表格行
     * @param {HTMLElement} elem
     */
    function toggleRow(elem, selected, isAll) {
        if (isAll) {
            var me = this;
            fc.each($('.' + CSS_ROW, elem), function(tr) {
                toggleRow.call(me, tr, selected);
            });
        } else {
            selected ? selectRow.call(this, elem) : deselectRow.call(this, elem);
        }
    }

    function selectRow(tr) {
        var checkbox = getCheckbox(tr), row = this.getRow(tr).row;
        checkbox.checked = row.selected = true;
        fc.addClass(tr, CSS_ROW_SELECTED);
    }

    function deselectRow(tr) {
        var checkbox = getCheckbox(tr), row = this.getRow(tr).row;
        checkbox.checked = row.selected = false;
        fc.removeClass(tr, CSS_ROW_SELECTED);
    }

    // ====================================== 分组折叠 ======================================
    function toggleGroup(e) {
        var index = this.getGroup(e.target).index, group = this._private.groups[index];
        group.toggle(group.getElement(this.tbody));
        // 折叠会改变高度，所以调一下resize()
        this.onresize();
    }

    // ====================================== 改变列宽 =======================================

    // 同一时刻只有一个表格被拉动，所以一个变量可以胜任
    var resizer,
        startX,    // col-resize开始拖动时的坐标
        tableX,    // 表格的起始 x 坐标
        leftCol,
        rightCol,
        leftWidth,
        rightWidth;

    // 鼠标在可以拖动的位置按下鼠标
    function onDragerPress(e) {
        var target = e.target;

        if (fc.hasClass(target, CSS_TH)) {
            resizer = this._private.colResizer;
            startX = e.pageX;
            tableX = fc.position(this.node).left;

            setColResizer(e.pageX);

            var columns = this._private.columns,
                index = fc.parent(target, 'th').cellIndex;

            // e.offsetX <= 1 表示点击的是单元格的左侧
            leftCol = e.offsetX <= 1 ? columns[index - 1] : columns[index];
            rightCol = e.offsetX <= 1 ? columns[index] : columns[index + 1];

            leftWidth = leftCol.width;
            rightWidth = rightCol.width;
            
            startDrag();
        }
    }

    function startDrag() {
        event.mousemove(document, draging);
        event.mouseup(document, stopDrag);
        event.disableSelect();
    }

    function stopDrag() {
        event.un(document, 'mousemove', draging);
        event.un(document, 'mouseup', stopDrag);
        event.enableSelect();

        leftCol.setWidth(leftWidth);
        rightCol.setWidth(rightWidth);

        setColResizer(-9999);

        resizer = startX = tableX = leftCol =
        rightCol = leftWidth = rightWidth = null;
    }

    function draging(e) {
        // 计算偏移量，往右拖是正数，往左拖是负数
        var offset = e.pageX - startX,
            lwidth = leftCol.width + offset,
            rwidth = rightCol.width - offset;

        if ( leftCol.checkWidth(lwidth) && rightCol.checkWidth(rwidth) ) {
            leftWidth = lwidth;
            rightWidth = rwidth;
            setColResizer(e.pageX);
        }
    }

    // 设置那根黑线的位置
    function setColResizer(x) {
        x -= tableX;
        fc.css(resizer, 'left', x);
    }
    
    // ====================================== 拖动结束 ========================================
    
    /**
     * 返回 { index: , node: }, index 从0开始算, 表示总行数（不是以table为单位的）
     * @param {HTMLElement} elem 容器元素
     * @param {Numnber|HTMLElement} index 行号或行对应的DOM元素（或子元素）
     * @return {Object} 
     */
    function getRow(elem, index) {
        var isElement = isNaN(+index), target;
        if (isElement) {
            target = fc.parent(index, 'tr');
            index = 0;
        }

        var units = elem.children, sum = 0;
        fc.each(units, function(unit) {
            if (fc.hasClass(unit, CSS_UNIT)) {
                var rows = fc.slice(unit.rows, 1), len = rows.length;
                if (isElement) {
                    fc.each(rows, function(row, i) {
                        if (target === row) {
                            index = sum + i;
                            return false;
                        }
                    })
                } else {
                    if (index >= sum && index < sum + len) {
                        target = rows[index - sum];
                        return false;
                    }
                }
                sum += len;
            }
        });

        return { index: index, node: target };
    }

    function getHeadRows(elem) {
        var elems = $('.' + CSS_HEADER_ROW, elem);
        if (elems.length > 0) return elems;
        else return $('tr', elem);
    }
    
    function getCheckbox(elem) {
        return $('.' + CSS_CHECKBOX, elem)[0];
    }
    
    /**
     * 切换排序按钮的class
     * @return {Boolean} 是否是升序排列
     */
    function toggleSort(btn) {
        resetSortBtn(fc.parent(btn, 'tr'), btn);

        // 当前是否是升序
        var isAsc = fc.hasClass(btn, CSS_SORT_ASC),
            add = isAsc ? CSS_SORT_DESC : CSS_SORT_ASC,
            del = isAsc ? CSS_SORT_ASC : CSS_SORT_DESC;

        fc.removeClass(btn, del);
        fc.addClass(btn, add);

        return add === CSS_SORT_ASC;
    }

    // 重置排序按钮，唯独不要重置 target
    function resetSortBtn(elem, target) {
        fc.each($('.' + CSS_SORT, elem), function(btn) {
            if (btn !== target) {
                fc.removeClass(btn, CSS_SORT_ASC);
                fc.removeClass(btn, CSS_SORT_DESC);
            }
        });
    }

    // 把2012-12-01转成2012/12/01 这样可以兼容所有浏览器
    var dateExpr = /-/g;

    /**
     * 排序函数。大致就三种：数字，文本和时间
     * @param {String} name 排序的字段
     * @param {Boolean} isAsc 是否升序排列
     * @param {String} type 类型，可选值为 number, text, date，默认是文本
     * @param {String} pattern date格式，仅type为date时可用
     */
    function sortBy(name, isAsc, type, pattern) {
        // 数字和时间用减法
        // 文本则localeCompare
        function compare(value1, value2) {
            if (type === 'text') {
                return value1.localeCompare(value2);
            } else if (type === 'date') {
                value1 = Date.parse(value1.replace(dateExpr, '/'));
                value2 = Date.parse(value2.replace(dateExpr, '/'));
            }
            return value1 - value2;
        }
        
        return function(obj1, obj2) {
            var value1 = obj1.data[name], value2 = obj2.data[name],
                ret = compare(value1, value2);
            return isAsc ? ret : -1 * ret;
        };
    }

    // ======================================= 辅助类 ======================================
    /**
     * 表格的列
     * 外部传入的配置统一成如下内部使用的格式
     * 此外，Column对象还提供一些计算方法，有助于分离逻辑
     */
    function Column(index) {
        // 第几列
        this.index = index;
        // 对应data中的哪个属性
        this.field = null;
        // tbody 使用的单元格内容
        this.content = null;
        // type 格式: {value: '', dataFormat: ''}
        this.type = {};
        // 最终使用的样式，可以把这个属性看作 elem.style，作用都一样
        this.style = null;
        // 该列真实的宽度
        this.width = 0;
        // 表头使用的一些东西
        this.thead = {
            classList: null,
            content: null
        };
    }

    Column.prototype = {
        /**
         * 改变列宽的时候调用这个方法
         * @param {Number} width
         */
        setWidth: function(width) {
            this.style.width = this.width = Math.floor(width);
            if (typeof this.onresize === 'function') {
                this.onresize(this.width);
            }
        },

        // 拖动列宽时需要检测最小宽度
        setMinWidth: function(width) {
            var style = this.style;
            if (style['min-width'] != null) {
                width = Math.max(width, style['min-width']);
            }
            style['min-width'] = width;
        },

        /**
         * 检测宽度值是否合法
         */
        checkWidth: function(width) {
            return width >= this.style['min-width'];
        },

        /**
         * 表头的样式使用的是调用者传入的原始样式
         * 设置好表头后，就能获得每列真实的宽度
         * 然后用这个真实的宽度去设置tbody
         */
        applyStyleToThead: function(cell, totalWidth) {
            var style = this.style;
            for (var name in style) {
                fc.css(cell, name, style[name]);
            }
            this.width = style.width || fc.width(cell);
            // 计算比例，在 resize 时可以等比放大缩小
            this.style.percent = (this.width / totalWidth).toPrecision(3);
        },
        
        /**
         * 用于 表格创建完成后、拖动列宽、浏览器resize
         * @param {HTMLElement} thead 表格组件的thead
         * @param {HTMLElement} tbody 表格组件的tbody
         * @param {Number} width 可选，拖动列宽时会指定宽度
         */
        updateWidth: function(thead, tbody, width) {
            var totalWidth = thead.offsetWidth, index = this.index,
                cell = getHeadRows(thead)[0].cells[index];
            if (!width) { // resize 
                if (this.style.width) {
                    width = Math.ceil(this.style.percent * totalWidth - fc.css(cell, 'border-right-width'));
                    if (this.style['min-width']) {
                        width = Math.max(width, this.style['min-width']);
                    }
                    this.style.width = width;
                    fc.width(cell, width);
                } else {
                    width = fc.width(cell);
                }
            } else { // 拖动列宽
                fc.width(cell, width);
            }
            this.width = width;
            fc.each(getHeadRows(tbody), function(row) {
                var cell = row.cells[index];
                fc.width(cell, Column.thead2Tbody(width));
            });
        },

        // 排序
        onsort: null,
        // 调整宽度
        onresize: null
    };

    // padding-left + padding-right = 10
    Column.padding = 10;
    Column.border = 1;

    // thead的宽度转换为tbody的宽度
    Column.thead2Tbody = function(width) {
        return width;
    };
    
    // 单例
    Column.checkbox = function() {
        var col = new Column(0);
        col.style = {
            'text-align': 'center'
        };
        col.style.width = 25;
        col.checkbox = true;
        col.thead.classList = [];
        col.thead.content = col.content = function(id, checked) {
            id = id ? 'id="' + id + '"' : '';
            checked = checked ? 'checked="checked"' : '';
            return tpl.parse({ id: id, checked: checked }, TPL_CHECKBOX);
        };

        return col;
    }();

    /**
     * 表格行
     * 这个对象不包含DOM元素
     * 注意：不包含表头那行, 从 0 开始计
     */
    function Row(index, data) {
        this.index = index;
        // 该行使用的数据
        this.data = data;
        // 当表格开启勾选功能后，这个属性才会起作用
        this.selected = false;
    }

    /**
     * 分组
     */
    function Group(index, title, defaultFolded) {
        // 第几个分组
        this.index = index;
        // 分组标题
        this.title = fc.trim(title);
        // 分组项(类型是 Row 对象)
        this.items = [];
        // 判断默认是否折叠需要两个条件，第一个是是否有title，第二个是是否手动设置过（不在这判断）
        this.isfolded = title && defaultFolded;

        this.hiddenItems = [];
    }

    Group.prototype = {

        addRow: function(data) {
            this.items.push(new Row(this.items.length, data));
        },

        // 可以传入当前分组中第几行, 也可以传入行对应的DOM元素（或子元素）
        getRow: function(elem) {
            var ret = getRow(fc.parent(elem, '.' + CSS_GROUP_LIST), elem);
            ret.row = this.items[ret.index];
            return ret;
        },

        /**
         * 折叠，默认是展开的
         * 即第一次调用会折叠，第二次是展开
         * 折叠又可能需要显示某几行，比如一个组几十行，折叠的时候显示前5行
         * @param {HTMLElement} elem 分组对应的元素
         * @param {Number} showSize 折叠时显示多少条数据，默认是0
         */
        toggle: function(elem, showSize) {
            if (!this.title) return;
            this.isfolded ? this.open(elem) : this.close(elem, showSize);
        },

        /**
         * 展开
         * @param {HTMLElement} elem 分组对应的元素 
         */
        open: function(elem) {
            this.isfolded = false;
            fc.removeClass(elem, CSS_GROUP_FOLDED);
            fc.each(this.hiddenItems, function(item) {
                fc.show(item);
            });
            this.hiddenItems.length = 0;
        },

        // 收起，收起状态还可设置显示几个
        close: function(elem, showSize) {
            // 没有 title 就不让折叠( 折了连开关都没了。。。 )
            if (!this.title) return;
            showSize = showSize || 0;            
            
            this.isfolded = true;
            fc.addClass(elem, CSS_GROUP_FOLDED);

            var list = $('.' + CSS_GROUP_LIST, elem)[0], hiddenItems = this.hiddenItems;
            if (showSize === 0) {
                fc.hide(list);
                hiddenItems.push(list);
            } else {
                // 显示前面的，隐藏后面的
                var index = Math.floor(showSize / UNIT_SIZE), 
                    start = showSize % UNIT_SIZE + 1; // 第一行是header，所以要去掉

                list = fc.slice(list.children, index);
                if (start > 1) {
                    fc.each(fc.slice(list.shift().rows, start), function(row) {
                        fc.hide(row);
                        hiddenItems.push(row);
                    });
                }
                fc.each(list, function(table) {
                    fc.hide(table);
                    hiddenItems.push(table);
                });
            }
        },

        // 获得分组对应的DOM元素
        getElement: function(tbody) {
            var groups = tbody.children, index = this.index, sum = 0, ret;
            fc.each(groups, function(group) {
                if (fc.hasClass(group, CSS_GROUP)) {
                    if (index === sum) {
                        ret = group;
                        return false;
                    }
                    sum++;
                }
            });
            return ret;
        },

        // 创建分组的DOM元素
        // 这个方法有点恶心，对外依赖的参数比较多，但没办法，写到别的地方更难看
        createElement: function(foldable, data, context, callback) {
            var groupClass = this.isfolded ? ' ' + CSS_GROUP_FOLDED : '', groupTitle = '';
            if (this.title) {
                var titleClass = CSS_GROUP_TITLE + (foldable ? ' ' + CSS_GROUP_FOLDABLE : '');          
                groupTitle = '<div class="' + titleClass + '">' + this.title + '</div>';
            }
            var elem = fc.create(tpl.parse({ groupClass: groupClass, groupTitle: groupTitle }, TPL_GROUP));

            // 用定时器生成分组列表
            var group = this, list = $('.' + CSS_GROUP_LIST, elem)[0], index = 0,
                columns = context._private.columns, showSize = context._private.group.showSize || 0;

            createByInterval(data, function(sliceData) {
                var table = createTable(columns).call(context, group.items, index, sliceData);
                list.appendChild(table);
                index += sliceData.length;
            }, function() {
                if (group.isfolded) group.close(elem, showSize);
                return callback && callback();
            }).call(context);

            return elem;
        }
    };
    
    Group.getIndex = function(tbody, elem) {
        elem = fc.parent(elem, '.' + CSS_GROUP);

        var groups = tbody.children, sum = 0, ret;
        fc.each(groups, function(group) {
            if (fc.hasClass(group, CSS_GROUP)) {
                if (group === elem) {
                    ret = sum;
                    return false;
                }
                sum++;
            }
        });
        return ret;
    }

    // =============================== END ==================================
    return Table;
}($$);


