/**
 * 跑马灯
 *
 * 配置项如下：
 * {
 *   field: '',           调用 items() 传入的数组对象使用的字段名
 *                        比如 items([{ id: 0, name: '名称' }]) 是 name
 *                        注意：如果未设置此项，items() 的参数只能是 ['str1', 'str2', 'str3'] 的形式
 *
 *   labelText: '',       提示语，如“请选择关键词”
 *   labelTip: '',        提示语的tip ( 元素的title )
 *   pageSize: 10,        每页显示几项
 *   maxWidth: 100,       每项的最大宽度，单位统一是px，如果未设置则完整显示
 *   pageText: '',        翻页部分的说明文字
 *   autoPage: 1000,      如果需要自动翻页，通过此参数设置翻页间隔，单位毫秒
 *   
 *   // 下面这几个需求有点变态，就是翻到第一页或最后一页时，是否继续可翻页
 *   firstPageable: true, 翻到第一页是否可继续翻页
 *   lastPageable: true,  翻到最后一页是否可继续翻页
 *   firstTip: '',        在 firstPageable 为 true 时，前翻按钮的 tip （一般用来引导用户翻页）
 *   lastTip: ''          在 lastPageable 为 true 时，后翻按钮的 tip
 * }
 *
 * 如果需要给每个 item 的右侧加边框, 请参考下例：
 * .marquee-slider li {
 *    border-right: 1px solid red;
 * }
 *
 * @class Marquee
 * @extend Base
 * @author zhujialu
 * @update 2012/10/25
 */
fc.ui.Marquee = function($) {

    var event = fc.event,
        tpl = fc.tpl,
        Pageable = fc.ui.Pageable;

    function Marquee(node, config) {
        this._super(node, 'marquee', formatConfig(config));

        var pvt = this._private;
        pvt.prevBtn = $('.' + Marquee.CSS_BUTTON_PREV, this.node)[0];
        pvt.nextBtn = $('.' + Marquee.CSS_BUTTON_NEXT, this.node)[0];

        // 翻页组件
        pvt.page = new Pageable(0, config.pageSize, 0);

        /**
         * 跑马灯的数据
         * @property {Array} data
         */
        this.data = null;

        /**
         * 当前页的数据
         * @property {Array} pageData
         */
        this.pageData = null;

        /**
         * 当前选中的数据
         * @property {Object} selectedData
         */
        this.selectedData = null;

        /**
         * 是否正在自动播放（自动翻页）
         * @property {Boolean} playing
         */
        this.playing = false;

        /**
         * 是否可以翻页，即总页数是否大于 1
         * @property {Boolean} pageable
         */
        this.pageable = false;
        
        addEvents.call(this);
    }

    Marquee.prototype = {

        /**
         * 获取或设置滚动项
         * @method items
         * @param {Array|void} data 可选。不传表示 getter，传值表示 setter
         * @return {Array|void}
         */
        items: function(data) {
            if (data == null) {
                return this.data;
            } else {
                this.data = data;

                // 重置翻页组件
                this._private.page.setTotalSize(data.length);

                this.pageable = this._private.page.pages > 1;
                this.page(0);
                
                if (this.config().autoPage) {
                    this.play();
                }
            }
        },

        /**
         * 开启自动播放
         * @method play
         */
        play: function() {
            var autoPage = this.config().autoPage;
            if (this.pageable || autoPage > 0) {
                this.stop();
                this.playing = true;

                var me = this, pvt = this._private;
                pvt.task = setTimeout(function() {
                    if (pvt.task) delete pvt.task;
                    me.nextPage();
                }, autoPage);
            }
        },

        /**
         * 停止自动播放
         * @method stop
         */
        stop: function() {
            this.playing = false;
            var pvt = this._private;
            if (pvt.task) {
                clearTimeout(pvt.task);
                delete pvt.task;
            }
        },

        /**
         * 是否是最后一页
         * @method isLastPage
         * @return {Boolean}
         */
        isLastPage: function() {
            var page = this._private.page;
            return page.index === page.pages - 1;
        },

        /**
         * 翻到第 index 页，或者获取当前是第几页
         * 如果 index 小于第一页，重置为第一页
         * 如果 index 大于最后一页, 重置为最后一页
         * @method page
         * @param {Number|void} index 第几页, 从 0 开始计数
         * @return {Number|void}
         */
        page: function(index) {
            var page = this._private.page;
            if (typeof index === 'number') {
                if (index < 0) index = 0;
                else if (index >= page.pages) index = page.pages - 1;

                page.index = index;
                this.selectedData = null;

                updateView.call(this);

                if (typeof this.onpage === 'function') {
                    this.onpage(index);
                }
            } else {
                return page.index;
            }
        },

        /**
         * 翻到上一页。翻到第 0 页时，上一页操作会转到最后一页
         * @method prevPage
         */
        prevPage: function() {
            var index = this.page() - 1;
            if (index < 0) {
                index = this._private.page.pages - 1;
            }
            this.page(index);
        },

        /**
         * 翻到下一页。翻到最后一页时，下一页操作会转到第 0 页
         * @method prevPage
         */
        nextPage: function() {
            var index = this.page() + 1;
            if (index >= this._private.page.pages) {
                index = 0;
            }
            this.page(index);
            // 因为用的是 setTimeout，所以这里要再调一次
            if (this.playing) {
                this.play();
            }
        },

        /**
         * 翻页事件发生时的事件处理函数
         * @method onpage
         * @param {Number} page 表示当前翻到第几页，索引从0开始
         */
        onpage: null,

        /**
         * 点击某一项时触发
         * @event onclick
         * @param {Object|String} data 选中的数据
         * @param {HTMLElement} target 点击的元素
         */
        onclick: null,

        dispose: function() {
            // 父类会解除事件绑定
            this.stop();
            this._super();
        },

        getTpl: function() {
            var config = this.config();
            return tpl.parse({
                labelText: config.labelText,
                labelTip: config.labelTip,
                pageText: config.pageText ? tpl.parse({ pageText: config.pageText }, TPL_PAGE_TEXT) : ''
            }, TPL_UI);
        }
    };

    Marquee = fc.ui.extend(fc.ui.Base, Marquee);


    Marquee.CSS_ITEM = 'marquee-item';
    Marquee.CSS_ITEM_SELECTED = 'marquee-item-selected';
    Marquee.CSS_BUTTON_PREV = 'marquee-btn-prev';
    Marquee.CSS_BUTTON_NEXT = 'marquee-btn-next';
    Marquee.CSS_BUTTON_PREV_DISABLE = 'marquee-btn-prev-disable';
    Marquee.CSS_BUTTON_NEXT_DISABLE = 'marquee-btn-next-disable';


    // 翻到第一页或最后一页仍然需要继续翻。。。
    Marquee.EVENT_PAGE_FIRST = 'marquee-page-first';
    Marquee.EVENT_PAGE_LAST = 'marquee-page-last';

    // =========================================== 私有属性和方法 ===================================================
    var CSS_LABEL = 'marquee-label',
        CSS_SLIDER = 'marquee-slider',
        CSS_ITEM_LAST = 'marquee-item-last',
        CSS_PAGE = 'marquee-page',
        CSS_PAGE_TEXT = 'marquee-page-text',
        // 下面这两个是变态需求
        CSS_BUTTON_FIRST_ENABLE = 'marquee-btn-first-enable',
        CSS_BUTTON_LAST_ENABLE = 'marquee-btn-last-enable';

    var TPL_UI = '<div class="' + CSS_PAGE + '">{pageText}' +
                    '<span class="' + Marquee.CSS_BUTTON_PREV + '"></span>' +
                    '<span class="' + Marquee.CSS_BUTTON_NEXT + '"></span>' +
                 '</div>' +
                 '<label class="' + CSS_LABEL + '" title="{labelTip}">{labelText}</label>' +
                 '<div class="' + CSS_SLIDER + '">' +
                    '<ul></ul>' +
                 '</div>',

        TPL_ITEM = '<li><span class="' + Marquee.CSS_ITEM + '" {maxWidth} title="{text}">{text}</span></li>',
        TPL_PAGE_TEXT = '<label class="' + CSS_PAGE_TEXT + '">{pageText}</label>';

    // 格式化配置，比如检测 maxWidth 是否带了单位
    function formatConfig(config) {
        var maxWidth = config.maxWidth;
        if (maxWidth) {
            config.maxWidth = parseFloat(maxWidth);
        }
        return config;
    }

    function addEvents() {
        event.on(this.node, '.' + Marquee.CSS_ITEM, 'click', selectItem, this);
        event.on(this.node, '.' + Marquee.CSS_BUTTON_PREV, 'click', this.prevPage, this);
        event.on(this.node, '.' + Marquee.CSS_BUTTON_NEXT, 'click', this.nextPage, this);
        
        var config = this.config();
        if (config.firstPageable) {
            event.on(this.node, '.' + CSS_BUTTON_FIRST_ENABLE, 'click', pageFirst, this);
        }
        if (config.lastPageable) {
            event.on(this.node, '.' + CSS_BUTTON_LAST_ENABLE, 'click', pageLast, this);
        }
    }

    function selectItem(e) {
        var item = fc.parent(e.target, '.' + Marquee.CSS_ITEM),
            li = item.parentNode, ul = li.parentNode,
            index = fc.inArray(li, ul.children);

        if (this.selectedData) {
            var selectedItem = $('.' + Marquee.CSS_ITEM_SELECTED, this.node)[0];
            fc.removeClass(selectedItem, Marquee.CSS_ITEM_SELECTED);
        }
        
        this.selectedData = this.pageData[index];
        fc.addClass(item, Marquee.CSS_ITEM_SELECTED);

        if (typeof this.onclick === 'function') {
            this.onclick(this.selectedData, item);
        }
    }

    function pageFirst() {
        event.fire(this, Marquee.EVENT_PAGE_FIRST);
    }

    function pageLast() {
        event.fire(this, Marquee.EVENT_PAGE_LAST);
    }

    function updateView() {
        updateSlider.call(this);
        updatePageButton.call(this);
    }

    function updateSlider() {
        var range = this._private.page.getDataRange();
        this.pageData = this.data.slice(range.start, range.end);

        var config = this.config(),
            field = config.field,
            obj = { maxWidth: config.maxWidth ? 'style="max-width:' + config.maxWidth + 'px;"' : '' };

        var elem = $('.' + CSS_SLIDER + ' > ul', this.node)[0], html = '';
        fc.each(this.pageData, function(item) {
            obj.text = fc.text(field ? item[field] : item);
            html += tpl.parse(obj, TPL_ITEM);
        });
        elem.innerHTML = html;
        
        // 给最后一个 li 添加class，用于标识最后一个 li
        // 这样方便外部设置样式（IE 这个拖后腿的）
        fc.addClass(elem.children[this.pageData.length - 1], CSS_ITEM_LAST);
    }

    function updatePageButton() {
        var prevBtn = this._private.prevBtn,
            nextBtn = this._private.nextBtn;

        prevBtn.className = Marquee.CSS_BUTTON_PREV;
        nextBtn.className = Marquee.CSS_BUTTON_NEXT;
        // 赋值为 null 在 IE 下会提示 null，巨雷无比
        prevBtn.title = nextBtn.title = '';
        
        var config = this.config();
        if (this.page() === 0) {
            prevBtn.className = config.firstPageable ? CSS_BUTTON_FIRST_ENABLE : Marquee.CSS_BUTTON_PREV_DISABLE;
            if (config.firstTip) prevBtn.title = config.firstTip;
        }
        if (this.isLastPage()) {
            nextBtn.className = config.lastPageable ? CSS_BUTTON_LAST_ENABLE : Marquee.CSS_BUTTON_NEXT_DISABLE;
            if (config.lastTip) nextBtn.title = config.lastTip;
        }
    }

    return Marquee;

}($$);
