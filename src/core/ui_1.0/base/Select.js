/*
 * cb-web
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/Select.js
 * desc:    下拉框
 * author:  zhaolei,erik,linzhifeng
 * date:    $Date: 2010/12/14 10:00:00 $
 */


/**
 * 下拉框控件<br/>
 * 默认显示的下拉列表，最多显示10个，超过出现滚动条
 * 
 * @class Select
 * @extend ui.Base
 * @namespace ui
 * @constructor
 * @param {Object} options 参数
 * <pre>
 * 配置项定义如下：
 * {
 *     id:         [String],         [REQUIRED] 控件的id属性，值为字符串，此值并不对应DOM元素的ID
 *     titleTip:   [Boolean],        [OPTIONAL] 对于下拉列表每个选项，鼠标移上去 的时候是否显示提示文本信息，默认false
 *     emptyLang:  [String],         [OPTIONAL] 下拉框未选择任何选项时显示的文本信息，默认值为'请选择'
 *     align:      ['left'|'right'], [OPTIONAL] 当选项宽度超过选项控件宽度时候，弹出从选秀列表跟选项控件
 *                                              的对齐方式，默认左对齐
 *     datasource: [Array],          [OPTIONAL] 下拉框绑定的数据，默认为空,其格式为[{text:'test1', value:'testvalue1'},...],
 *                                              此外对于每个选项还有可选的icon,style属性，用于定制每个选项的样式，
 *                                              比如设置icon值为done，则其对应样式名为ui_select_icon_done；
 *                                              对于style，其值比如为customItem，其样式为ui_select_item_customItem，
 *                                              通过这两个值，可以对选项样式进行定制。
 *     width:      [Number],         [REQUIRED] 控件的宽度,单位px
 *     readOnly:   [Boolean],        [OPTIONAL] 控件是否只读，默认false
 *     value:      [String],         [OPTIONAL] 当前选择的项的值
 *     disabled:   [Boolean]         [OPTIONAL] 是否禁用控件，默认false
 * }
 * </pre>
 * <pre>
 * options = {
 *     datasource : [{text:'test1', value:'testvalue1'},...]
 * }
 * value ： -9999 onselect 后文字不变，title重置
 * value ： -99999 onselect 后文字 title都不变 // add by liuyutong
 * </pre>
 */
ui.Select = function(options) {
    // 初始化事件
    this.initOptions(options);
    this.type = 'select';
    this.form = 1;

    this.emptyLang = this.emptyLang || '请选择'; // 没有选择option时显示的话术
    this.emptyLabel = '<div class="' + this.getClass('cur_def') + '">' + this.emptyLang + '</div>';
    this.offsetSize = '-10000px';
    this.align = this.align || 'left';

    this.options = this.datasource || []; //这句太坑人了。。。如果想repaint控件，得设置options而不再是datasource
    this.index = -1;
    this.maxItem = 10;
    this.cbButton = false;
};

ui.Select.prototype = {
    // 主体部分模板
    tplMain: '<div class="{3}">&nbsp;</div><div id="{0}" class="{1}" value="" style="width:{4}px"><nobr>{2}</nobr></div>',
    // Layer中每个选项的模板
    tplItem: '<div id="{0}" {9} class="{1}" index="{2}" value="{3}" dis="{4}" cmd="select" onmouseover="{6}" onmouseout="{7}" >{8}<nobr>{5}</nobr></div>', //style="width:{10}px"
    // Item中图标层的模板
    tplIcon: '<span class="{0}"></span>',
    /**
     * 选项选项触发的事件
     * @event onselect
     */
    onselect: new Function(),
    /**
     * 将Select控件渲染到指定的DOM元素里
     * @method appendTo
     * @param {HTMLElement} container 渲染的控件添加到的目标DOM元素
     */
    appendTo: function(container) {
        var main = document.createElement('div');
        container.appendChild(main);
        this.render(main);
    },

    /**
     * 绘制控件
     * @method render
     * @param {HTMLElement} main 控件挂载的DOM元素
     * 这里会使用DOM元素的name属性来初始化控件的formName属性
     */
    render: function(main) {
        var me = this;
        ui.Base.render.call(me, main, true);
        if (me.main) {
            me.formName = me.main.getAttribute('name');
            me.main.style.width = me.width + 'px';
            me.main.innerHTML = me.getMainHtml();
            //add by LeoWang(wangkemiao@baidu.com)
            //添加点击函数
            me.main.onclick = me._getMainClickHandler();
            //add ended

            if (baidu.dom.hasClass(me.main, 'select_button')) {
                me.selectButton = true;
            }
            if (baidu.dom.hasClass(me.main, 'select_menu')) {
                me.selectMenu = true;
            }
            me.renderLayer();
            me.setReadOnly( !! me.readOnly);
        }

        if (!(me.value === null || typeof me.value == 'undefined')) {
            me.setValue(me.value);
        }
        me.disable( !! me.disabled);
    },

    /**
     * 绘制下拉列表
     *
     */
    renderLayer: function() {
        var me = this,
            layerId = me.getId('layer'),
            layer,
            len = me.options.length,
            maxItem = me.maxItem,
            itemHeight,
            autoWidth,
            itemList;

        if (len == 0) { //此时还没有item，所以直接返回，以免出错
            return;
        }

        layer = baidu.g(layerId);

        if (!layer) {
            layer = document.createElement('div');
            layer.id = me.getId('layer');
            if (me.selectButton) {
                layer.className = me.getClass('layer') + ' select_button_layer';
            } else {
                layer.className = me.getClass('layer');
            }
            layer.style.top = me.offsetSize;
            layer.style.left = me.offsetSize;
            //layer.style.width = me.width + 'px';
            layer.setAttribute('control', me.id);
            document.body.appendChild(layer);

            // 挂载全局事件管理器
            me.layerController = me.getLayerController();
            me.onKeydown = me.onKeydown();

            baidu.on(document, 'click', me.layerController);
            baidu.on(document, 'keydown', me.onKeydown);
        } else {
            baidu.un(document, 'click', me.layerController);
            baidu.un(document, 'keydown', me.onKeydown);
            me.layerController = me.getLayerController();
            baidu.on(document, 'click', me.layerController);
            baidu.on(document, 'keydown', me.onKeydown);
        }

        layer.style.width = 'auto';
        layer.innerHTML = me.getLayerHtml();

        autoWidth = layer.offsetWidth;
        //修正宽度：IE6
        if (baidu.ie && baidu.ie < 7) { //自适应宽度：获取div宽度即可
            autoWidth = me.width;
        }
        itemList = baidu.dom.children(layer);
        itemHeight = itemList[itemList.length - 1].offsetHeight;
        if (me.options[0].value == -9999 || me.options[0].value == -99999) {
            len--;
        }
        if (len > maxItem) {
            layer.style.height = maxItem * itemHeight + 'px';

            autoWidth = (autoWidth > (me.width - 16) ? autoWidth + 16 : me.width); //自适应宽度：如果比指定短用指定宽度
        } else {
            layer.style.height = len * itemHeight + 'px';
            autoWidth = (autoWidth > me.width ? autoWidth : me.width); //自适应宽度：如果比指定短用指定宽度
        }
        if (me.selectButton || me.selectMenu) {
            autoWidth -= 2;
        }
        layer.style.width = autoWidth + 'px';
    },

    /**
     * 重绘控件
     * @method repaint
     */
    repaint: function() {
        var selected = this.options[this.index],
            // 修复鼠标移上去title显示bug by Huiyao 2013.2.25
            word = selected ? selected.text : this.emptyLang, //this.emptyLabel,
            el = this.getCur();

        // options可能是空的，直接退出，added by Huiyao 2013.2.25
        if (this.options.length === 0) {
            return;
        }

        if (this.options[0].value != -9999 && this.options[0].value != -99999) {
            el.title = word; //baidu.string.stripTags(word);
            el.innerHTML = '<nobr>' + word + '</nobr>';
            this.repaintLayer();
        } else if (this.options[0].value == -99999) {
            //el.title = this.options[0].text;//baidu.string.stripTags(word);
            el.innerHTML = '<nobr>' + this.options[0].text + '</nobr>';
        } else {
            el.title = this.options[0].text; //baidu.string.stripTags(word);
            el.innerHTML = '<nobr>' + this.options[0].text + '</nobr>';
        }
    },

    /**
     * 重绘选项列表层
     *
     */
    repaintLayer: function() {
        var me = this,
            index = me.index,
            first = me.getLayer().firstChild,
            selectedClass = me.getClass('item_selected');

        while (first) {
            if (first.getAttribute('index') == index) {
                baidu.addClass(first, selectedClass);
                //me.getCur().innerHTML = first.innerHTML;
            } else {
                baidu.removeClass(first, selectedClass);
            }
            first = first.nextSibling;
        }
    },

    /**
     * 获取主体部分HTML
     *
     * @return {string}
     */
    getMainHtml: function() {
        var me = this,
            ds = me.ds

        return ui.format(me.tplMain,
        me.getId('cur'),
        me.getClass('cur'),
        me.emptyLabel,
        me.getClass('btn'),
        me.width - 26);
    },

    /**
     * 获取下拉列表层的HTML
     *
     * @return {string}
     */
    getLayerHtml: function() {
        var me = this,
            options = me.options,
            i = 0,
            len = options.length,
            html = [],
            basicClass = me.getClass('item'),
            itemClass,
            dis,
            item,
            strRef = me.getStrRef(),
            iconClass,
            iconHtml,
            titleTip = "";

        for (; i < len; i++) {
            itemClass = basicClass;
            dis = 0;
            item = options[i];
            iconHtml = '';

            // 初始化icon的HTML			
            if (item.icon) {
                iconClass = me.getClass('icon_' + item.icon);
                iconHtml = ui.format(me.tplIcon, iconClass);
            }


            // 初始化基础样式			
            if (item.style) {
                itemClass += ' ' + basicClass + '_' + item.style;
            }


            // 初始化不可选中的项
            if (item.disabled) {
                dis = 1;
                itemClass += ' ' + basicClass + '_disabled';
            }

            // 初始化选中样式		
            if (item.value == me.value) {
                itemClass += ' ' + me.getClass('item_selected');
            }

            if (item.value == -9999 || item.value == -99999) {
                itemClass += ' hide';
            }

            if (me.titleTip) {
                titleTip = 'title="' + item.text + '"';
            }

            html.push(
            ui.format(me.tplItem,
            me.getId('item') + i,
            itemClass,
            i,
            item.value,
            dis,
            item.text,
            strRef + '.itemOverHandler(this)',
            strRef + '.itemOutHandler(this)',
            iconHtml,
            titleTip))
        }

        return html.join('');
    },

    /**
     * 捕获列表的事件
     *
     */
    getLayerController: function() {
        var me = this;

        return function(e) {
            if (me.getState('disabled')) {
                return;
            }

            e = e || window.event;
            var tar = e.target || e.srcElement,
                keynum = e.which ? e.which : e.keyCode,
                logParams = {};

            while (tar && tar.nodeType === 1) {
                var val = tar.getAttribute('control'),
                    index = tar.getAttribute('index'),
                    tarId = me.getId('item') + index;

                if (tar.getAttribute('cmd') == 'select' && tarId == tar.id) {
                    logParams.target = baidu.string.toCamelCase('item_' + me.id) + '_' + me.type + '_lbl';
                    logParams.itemValue = tar.getAttribute("value");
                    logParams.itemIndex = tar.getAttribute("index");
                    logParams.disable = tar.getAttribute("dis");
                    NIRVANA_LOG.send(logParams);
                    if (tar.getAttribute('dis') == 1) {
                        if (me.disabledItemTipId) {
                            baidu.show(me.disabledItemTipId);
                            window.setTimeout(function() {
                                baidu.hide(me.disabledItemTipId)
                            }, 3000);
                        }
                    } else {
                        me.hideLayer();
                        me.selectByIndex(parseInt(index, 10), true);
                        return false;
                    }
                    return;
                } else if (val == me.id) { //点击下拉图标		
                    //console.log(val)				
                    if (!me.readOnly && tar.id == me.getId()) {
                        //console.log(me)
                        me.toggleLayer();
                        logParams.target = baidu.string.toCamelCase('select_' + me.id + '_icon') + '_' + me.type + '_btn';
                        NIRVANA_LOG.send(logParams);
                        //console.log(tar);
                        return;
                    }
                } else if (me.getId('cur') == tar.id) { //点击文字
                    if (me.clickRightOnly) {
                        baidu.event.stop(e)
                        baidu.event.stopPropagation(e)
                        //me.selectByIndex(me.index, false);
                        me.hideLayer();
                        me.removeState('hover');
                        if (me.clickCurFunc) {
                            me.clickCurFunc();
                        }
                        logParams.target = baidu.string.toCamelCase('select_' + me.id + '_txt_dif') + '_' + me.type + '_btn';
                        NIRVANA_LOG.send(logParams);
                        return;
                    }
                    if (me.selectButton) {
                        me.selectByIndex(me.index, true);
                        me.hideLayer();
                        me.removeState('hover');
                        logParams.target = baidu.string.toCamelCase('select_' + me.id + '_txt') + '_' + me.type + '_btn';
                        NIRVANA_LOG.send(logParams);
                        return;
                    }
                }
                tar = tar.parentNode;
            }

            me.hideLayer();
        };
    },

    /**
     * 选项移上事件
     *
     * @param {HTMLElement} item 选项
     */
    itemOverHandler: function(item) {
        if (item.getAttribute('dis') == 1) {
            return;
        }

        var index = item.getAttribute('index');
        baidu.addClass(this.getId('item') + index, this.getClass('item') + '_hover');
    },

    /**
     * 选项移开事件
     *
     * @param {HTMLElement} item 选项
     */
    itemOutHandler: function(item) {
        var index = item.getAttribute('index');
        baidu.removeClass(this.getId('item') + index, this.getClass('item') + '_hover');
    },

    //add by LeoWang(wangkemiao@baidu.com)
    //添加点击函数
    /**
     * 获取主区域点击的事件handler
     *
     * @private
     * @return {Function}
     */
    _getMainClickHandler: function() {
        var me = this;
        return function(e) {
            e = e || window.event;
            var tar = e.srcElement || e.target;
            if (!me.readOnly && !me.getState('disabled')) {
                if (me.onmainclick() !== false) {
                    //do sth
                }
            }
        };
    },
    /**
     * 控件被点击触发的事件
     * @event onmainclick
     */
    onmainclick: new Function(),
    //add ended


    /**
     * 显示层，显示下拉列表
     * @method showLayer
     */
    showLayer: function() {
        var me = this,
            main = baidu.g(me.getId()), //me.main,
            mainPos = baidu.dom.getPosition(main),
            layer = me.getLayer(),
            pageVHeight = baidu.page.getViewHeight(),
            pageVWidth = baidu.page.getViewWidth(),
            layerVHeight = mainPos.top + main.offsetHeight + layer.offsetHeight - baidu.page.getScrollTop(),
            layerTop,
            layerLeft,
            layerWidth = parseInt(layer.style.width);

        //console.log(mainPos);
        if (pageVHeight > layerVHeight) {
            layerTop = mainPos.top + main.offsetHeight;
        } else {
            layerTop = mainPos.top - layer.offsetHeight;
        }

        if (me.align == 'left') {
            //默认左对齐
            if (layerWidth + mainPos.left + 20 > pageVWidth) {
                layerWidth = pageVWidth - 20 - mainPos.left;
            }
            layerLeft = mainPos.left;
        } else {
            //右对齐
            if (layerWidth + mainPos.left + main.offsetWidth + 20 > pageVWidth) {
                layerWidth = pageVWidth - 20 - mainPos.left - main.offsetWidth;
            }
            layerLeft = mainPos.left + main.offsetWidth - layerWidth - 2;
            layerLeft = layerLeft > 0 ? layerLeft : 0;
        }


        layer.style.top = layerTop + 'px';
        layer.style.left = layerLeft + 'px';
        layer.style.width = layerWidth + 'px';
        me.setState('active');
    },

    /**
     * 隐藏层，隐藏下拉列表
     * @method hideLayer
     */
    hideLayer: function() {
        var me = this,
            layer = me.getLayer();
        if (layer) {
            layer.style.left = me.offsetSize;
            layer.style.top = me.offsetSize;
            me.removeState('active');
        }
    },

    onKeydown: function() {
        var me = this;
        return function() {
            me.hideLayer();
        };
    },

    /**
     * 开|关 层的展示，显示或隐藏下拉列表
     * @method toggleLayer
     */
    toggleLayer: function() {
        var me = this;
        if (me.getLayer() && me.getLayer().style.left != me.offsetSize) {
            me.hideLayer();
        } else {
            me.showLayer();
        }
    },

    /**
     * 销毁控件
     * @method dispose
     */
    dispose: function() {
        var me = this;
        me.layerController && baidu.un(document, 'click', me.layerController) && baidu.un(document, 'keydown', me.onKeydown);
        if (me.getLayer()) { // 有可能没有建立下拉列表
            document.body.removeChild(me.getLayer());
        }
        ui.Base.dispose.call(me);
    },

    /**
     * 获取Select当前选项部分的DOM元素
     *
     * @return {HTMLElement}
     */
    getCur: function() {
        return baidu.G(this.getId('cur'));
    },

    /**
     * 获取list部分的DOM元素
     *
     * @return {HTMLElement}
     */
    getLayer: function() {
        return baidu.g(this.getId('layer'));
    },

    /**
     * 获取index指定的文本，如index为空则获取当前Select选中的文本
     * @method getText
     * @param {Number} index 位置索引
     * @return {String}
     */
    getText: function(index) {
        if (null == this.main) {
            return '';
        }
        if ('undefined' != typeof index) {
            return this.options[index].text || '';
        } else {
            return this.text || '';
        }
    },

    /**
     * 获取index指定的值，如index为空则获取当前Select选中的值
     * @method getValue
     * @param {Number} index 位置索引
     * @return {String}
     */
    getValue: function(index) {
        if (null == this.main) {
            return '';
        }
        if ('undefined' != typeof index && index < this.options.length) {
            if (this.options[index].value == 0) {
                return 0;
            } else {
                return this.options[index].value || '';
            }
        } else {
            if (this.value == 0) {
                return 0;
            } else {
                return this.value || '';
            }
        }
    },

    /**
     * 根据值选择选项
     * @method setValue
     * @param {String} value 值
     * @param {Boolean} isDispatch 是否分发事件
     */
    setValue: function(value, isDispatch) {
        var me = this,
            layer = me.getLayer(),
            // 容错处理 by Huiyao 2013.2.25
            items = layer ? layer.getElementsByTagName('div') : [],
            //  len = items.length, // del by Huiyao 没用到的两个变量 2013.2.25
            //  i = 0,
            item;

        for (var i = 0, len = items.length; i < len; i++) {
            item = items[i].getAttribute('value');
            if (item == value) {
                // peilonghui, 有时候需要在setValue的时候触发select
                me.selectByIndex(i, isDispatch);
                return;
            }
        }

        me.value = '';
        me.index = -1;
        me.selectByIndex(-1);
    },

    /**
     * 根据索引选择选项
     * @method selectByIndex
     * @param {Number} index 选项的索引序号
     * @param {Boolean} isDispatch 是否发送事件
     */
    selectByIndex: function(index, isDispatch) {
        var selected = this.options[index],
            value, text;

        if (!selected) {
            value = null;
            text = null;
        } else {
            value = selected.value;
            text = selected.text;
        }


        this.index = index;
        this.value = value;
        this.text = text;

        if (isDispatch === true && this.onselect(value, selected, this.id) === false) {
            return;
        }
        this.repaint();
    },

    /**
     * 获取数据源
     * @method getDataSource
     * @return {Array}
     */
    getDataSource: function() {
        return this.options || [];
    },

    /**
     * 设置数据来源，这个方法只是重新绑定控件的的数据源并不立即触发控件的更新
     * @method setDataSource
     * @param {Array} datasource 列表数据源
     */
    setDataSource: function(datasource) {
        this.options = datasource || this.options;
    },

    /**
     * 查找下拉框中是否含有某个值
     * @method findValue
     * @param {String} 需要定位的值
     * @return {Number} 如找到返回index，如没有返回-1
     */
    findValue: function(value) {
        var me = this,
            layer = me.getLayer(),
            items = layer.getElementsByTagName('div'),
            len = items.length,
            item;

        for (var i = 0, len = items.length; i < len; i++) {
            item = items[i].getAttribute('value');
            if (item == value) {
                return i;
            }
        }
        return -1;
    },

    /**
     * 查找下拉框中是否含有某个文本
     * @method findText
     * @param {String} 需要定位的文本
     * @return {Number} 如找到返回index，如没有返回-1
     */
    findText: function(text) {
        var me = this;

        for (var i = 0, len = me.options.length; i < len; i++) {
            if (text == me.options[i].text) {
                return me.findValue(me.options[i].value);
            }
        }

        return -1;
    },

    /**
     * 动态添加一项
     * @method add
     * @param {Object} optionData 插入内容
     * @param {Number} index 插入位置，不传默认为最后插入
     */
    add: function(optionData, index) {
        var me = this;
        if ('undefined' == typeof index) {
            me.options.push(optionData)
        } else {
            var i = 0,
                len, newoptions = [];
            for (i = 0, len = index; i < len; i++) {
                newoptions[i] = me.options[i];
            }
            newoptions[index] = optionData;
            for (i = index + 1, len = me.options.length; i < len; i++) {
                newoptions[i] = me.options[i];
            }
            me.options = newoptions;
        }
        me.renderLayer();
    },

    /**
     * 动态删除一项
     * @method del
     * @param {Number} index 删除内容索引，不传默认删除最后一项，如果删除项为当前选择项则定位到第一项
     */
    del: function(index) {
        var me = this;
        if ('undefined' == typeof index) {
            index = me.options.length - 1;
        }
        var i = 0,
            len, newoptions = [];
        for (i = 0, len = index - 1; i < len; i++) {
            newoptions[i] = me.options[i];
        }
        for (i = index, len = me.options.length; i < len; i++) {
            newoptions[i] = me.options[i];
        }
        me.options = newoptions;
        me.renderLayer();
        if (index == me.index) {
            me.selectByIndex(0);
        }
    },

    /**
     * 清楚所有数据
     * @method clear
     */
    clear: function() {
        var me = this;

        me.options = [];
        me.index = -1;
        me.value = '';
        me.text = '';

        me.repaint();
    },

    /**
     * 清空原有数据并重新填入所有数据，并重新渲染界面，并默认选择第一项
     * @method fill
     * @param {Array} datasource 控件绑定的数据源
     */
    fill: function(datasource) {
        var me = this;

        me.options = datasource || me.options;
        me.renderLayer();
        me.selectByIndex(0);
    },

    /**
     * 设置控件为readOnly
     * @method setReadOnly
     * @public
     * @param {Boolean} readOnly
     */
    setReadOnly: function(readOnly) {
        readOnly = !! readOnly;
        this.readOnly = readOnly;

        readOnly ? this.setState('readonly') : this.removeState('readonly');
    },

    /**
     * 禁用控件的使用
     * @method dsiable
     * @param {Boolean} disabled 是否禁用控件
     * @public
     */
    disable: function(disabled) {
        this.hideLayer();
        if (disabled) {
            this.setState('disabled');
        } else {
            this.removeState('disabled');
        }
    },
    /**
     * 根据value 值 disable 下拉列表中的特定条目
     * @method disableItemByValue
     * @param {String} value 要禁用的选项的值
     * @param {Boolean} disabled 是否禁用选项
     */
    disableItemByValue: function(value, disabled) {
        var me = this,
            layer = me.getLayer(),
            items = layer.getElementsByTagName('div'),
            len = items.length,
            item, targetItem,
            dis = typeof disabled !== 'undefined' ? !! disabled : true; //disabled默认为true

        for (var i = 0, len = items.length; i < len; i++) {
            item = items[i].getAttribute('value');
            if (item == value) {
                targetItem = items[i];
                break;
            }
        }
        if (dis) { //
            targetItem.setAttribute('dis', 1);
            baidu.addClass(targetItem, me.getClass('item_disabled'));
        } else {
            targetItem.setAttribute('dis', 0);
            baidu.removeClass(targetItem, me.getClass('item_disabled'));
        }
    },

    /**
     * 隐藏控件
     * @method hide
     * @param {Boolean} hided 是否隐藏控件
     * @public
     */
    hide: function(hided) {
        this.hideLayer();
        if (hided) {
            baidu.addClass(this.main, 'hide');
        } else {
            baidu.removeClass(this.main, 'hide');
        }
    }
};

ui.Base.derive(ui.Select);