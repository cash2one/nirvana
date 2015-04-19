/*
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/Page.js
 * desc:    分页控件
 * author:  wanghuijun
 * date:    $Date: 2010/12/09 14:21:00 $
 */

/**
 * 分页组件
 * 
 * @class Page
 * @extend ui.Base
 * @namespace ui
 * @constructor
 * @param {Object} options 控件初始化参数
 * <pre>
 * 配置项定义如下：
 * {
 *     id:        [String], [REQUIRED] 控件ID
 *     prevWord:  [String], [OPTIONAL] 跳转到上一页按钮显示的文本信息，默认为'上一页'
 *     nextWord:  [String], [OPTIONAL] 跳转到下一页按钮显示的文本信息，默认为'下一页'
 *     omitWord:  [String], [OPTIONAL] 省略掉的分页的页码显示的替代文本信息，默认为'...'
 *     showCount: [Number], [OPTIONAL] 显示的分页的页码的数量，超过用omitWord填充，默认5
 *     total:     [Number], [OPTIONAL] 总的分页数，默认为0，如果页码不大于1，则不显示分页，并且隐藏控件
 *     page:      [Number], [OPTIONAL] 当前显示的分页，默认是1
 * }
 * </pre>
 */
ui.Page = function (options) {
    this.initOptions(options);
    this.type = "page";    
	this.prevWord = this.prevWord || '上一页';
	this.nextWord = this.nextWord || '下一页';
	this.omitWord = this.omitWord || '...';
	this.showCount = parseInt(this.showCount, 10) || 5;
};

ui.Page.prototype = {
	/**
	 * 获取当前页码
	 * 
	 * @method getPage
	 * @public
	 * @return {Number}
	 */
	getPage: function () {
		return this.page + 1;//恶心
	},
	
    /**
     * 渲染控件
     * @method render
     * @protected
     * @param {HTMLElement} main 控件挂载的DOM
     */
    render: function (main) {
        var me = this;
        ui.Base.render.call(me, main, false);
        
        me.total = parseInt(me.total, 10) || 0;
    
        // 恶心的系统要求我们，page是从1开始的，在这里修改成本最小了
        me.page = parseInt(me.page, 10) || 1;

        // 绘制内容部分
        this.renderPages();
    },
    
    tplMain: '<ul>{0}</ul>',
    tplItem: '<li class="{1}" onclick="{2}" onmouseover="{3}" onmouseout="{4}">{0}</li>',
    tplInfo: '<li class="{1}">{0}</li>',
    
    /**
     * 绘制页码区
     * 
     * @private
     */
    renderPages: function () {
        var me        = this,
            html      = [],
            total     = me.total,
            last      = total - 1,
            page      = me.page - 1,// 恶心
            itemClass = '',
            disClass  = ' ' + me.getClass('disabled'),
            omitWord  = ui.format(me.tplInfo,
                                  me.omitWord,
								  'omit'),
            i, begin;
        
        if (total <= 1) { // 如果页码不大于1，则不显示分页，并且隐藏控件
            me.main.innerHTML = '';
			baidu.addClass(me.main, 'hide');
            return;
        }
		
		baidu.removeClass(me.main, 'hide');
        
        // 计算起始页
        if (page < me.showCount - 1) {
            begin = 0;
        } else if (page > total - me.showCount) {
            begin = total - me.showCount;
        } else {
            begin = page - Math.floor(me.showCount / 2);
        }
        if (begin < 0) {
            begin = 0
        }
        
        // 绘制前一页的link
        if (page > 0) {
            html.push(me.getItemHtml(me.prevWord,
                                     me.getClass('prev'),
									 me.getStrCall('select', page - 1, "prev")));
        }
		/**
		 * 当没有上一页时，不出现此节点
		 * else {
            html.push(ui.format(me.tplInfo,
                                me.prevWord,
                                me.getClass('prev') + disClass));
        }
		 */
        
        // 绘制前缀
        if (begin > 0) {
            html.push(me.getItemHtml(1,
                                     itemClass,
                                     this.getStrCall('select', 0)));
			if (begin > 1) {
				html.push(omitWord);
			}
        }

        // 绘制中间的序号
        for (i = 0; i < me.showCount && begin + i < total; i++) {
            if (begin + i != page) {
				html.push(me.getItemHtml(1 + begin + i,
                                         itemClass,
                                         me.getStrCall('select', begin + i))
                         );
            } else {
                html.push(ui.format(me.tplInfo,
                                    1 + begin + i,
                                    me.getClass('active'))
                         );
            }
        }
        
        // 绘制后缀
        if (begin < total - me.showCount) {
			if (begin < total - me.showCount - 1) {
				html.push(omitWord);
			}
            html.push(me.getItemHtml(total,
                                     itemClass,
                                     me.getStrCall('select', last))
                      );
        }
        
        
        // 绘制后一页的link
        if (page < last) {
            html.push(me.getItemHtml(me.nextWord,
                                     me.getClass('next'),
                                     me.getStrCall('select', page + 1, "next")));
        }
		/**
		 * 当没有下一页时，不出现此节点
		 *  else {
            html.push(ui.format(me.tplInfo,
                                me.nextWord,
                                disClass));
        }
		 */
        
        this.main.innerHTML = ui.format(me.tplMain,
                                        html.join(''));
    },
    
    getItemHtml: function(sText, sClass, sClick) {
		var me          = this,
            strRef      = me.getStrRef(),
			itemOver    = strRef + '.itemOverHandler(this)',
			itemOut     = strRef + '.itemOutHandler(this)';
			if(me.isMatchStyle){
				baidu.addClass(me.main, 'ui_page_match');
			}
			return ui.format(me.tplItem,
                             sText,
                             sClass,
                             sClick,
                             itemOver,
                             itemOut);
    },
    /**
     * 选择分页触发的事件，通过上一页、下一页按钮、选择特定的分页以及通过调用select方法触发
     * @event onselect
     * @param {Number} page 选中页数
     * @param {String} prevOrNext 有效值为'prev' 或 'next' 
     * @return {Boolean} 如果返回false, 选择分页失败
     */
    onselect: new Function(),
    
    /**
     * 选择页码
     * 
     * @method select
     * @public
     * @param {Number} page 选中页数
     * @param {String} prevOrNext 有效值为'prev' 或 'next'，该参数只有在通过上一页、下一页按钮触发分页选择的时候才传递
     *                            该参数主要用于发送监控日志使用
     */
    select: function (page, prevOrNext) {
		var logParams = {};
        page++;// 恶心
        if(prevOrNext){
			logParams.target = baidu.string.toCamelCase(this.id + "_" +prevOrNext) + "_" + this.type + "_lbl";
		}else{
			logParams.target = this.id + "Page" + page + "_" + this.type + "_lbl";
		}
		NIRVANA_LOG.send(logParams);
        if (this.onselect(page, prevOrNext) !== false) {
            this.page = page;
            this.renderPages();
        }
    },
    
    itemOverHandler: function(item) {
        baidu.addClass(item, this.getClass('hover'));
    },

    itemOutHandler: function(item) {
        baidu.removeClass(item, this.getClass('hover'));
    },
	/**
     * 将分页控件渲染到指定的DOM元素里
     * @method appendTo
     * @param {HTMLElement} container 渲染的控件添加到的目标DOM元素
     */
	appendTo: function (container) {
        var div = document.createElement('div');
        container.appendChild(div);
        this.render(div);
    }
};

ui.Base.derive(ui.Page);
