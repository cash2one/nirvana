/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/Accordion.js
 * desc:    手风琴控件
 * author:  chenjincai,linzhifeng
 * date:    $Date: 2010/12/14 $
 */
 
/**
 * 手风琴控件
 *  
 * @class Accordion
 * @namespace ui
 * @extends ui.Base
 * @constructor
 * @param {Object} options 控件初始化参数
 * <pre>
 * 配置项定义如下：
 * {
 *     id:         [String], [REQUIRED] Accordion控件的id属性
 *     accordions: [Array],  [REQUIRED] 控件的数据源配置，具体元素的数据结构定义如下
 * }
 * 
 * accordions的数据项的定义如下：
 * {
 *     id:   [String], [REQUIRED] 手风琴项的id
 *     name: [String], [REQUIRED] 手风琴项的标题，可以是HTML片段，默认值为'head'
 * }
 * </pre>
 */
ui.Accordion = function (options) {    
    //初始化参数
    this.initOptions(options);
    
    //类型声明，用于生成控件子dom的id和class
    this.type = 'accordion';
}

ui.Accordion.prototype = {
    
    accordionTpl : '<h3 id="{2}" class="{0}" >{5}</h3><div id="{3}" class="{1}" {4}></div>',
    /**
     * 将未渲染的Accordion控件渲染到指定的DOM元素里
     * @method appendTo
     * @param {HTMLElement} container 渲染的控件添加到的目标DOM元素
     */
	appendTo: function (container) {
        var main = document.createElement('div');
        container.appendChild(main);
        this.render(main);
    },
	
	/**
     * 渲染控件
     * 
     * @method render
     * @protected
     * @param {Object} main 控件挂载的DOM
     */
    render : function (main) {
        var me = this;
        if(!me.isRendered) {
            ui.Base.render.call(me, main);
            me.main.innerHTML = me.getMainHtml();
            me.isRendered = true;
            me.bindEvent();
        }
    },
    
    getMainHtml : function () {
        var me = this,
            accordions = me.accordions,
            len = accordions.length,
            i = 0,
            item = null,
            html = [],			
            headerClassName = me.getClass('header'),
			firstHeadClass = headerClassName + ' ' + me.getClass('selected'),
            contentClassName = me.getClass('content');

            for(; i < len; i++){
				item = accordions[i];
                if(i > 0){ 
					html.push(ui.format(me.accordionTpl,
	                    headerClassName,
	                    contentClassName,
	                    me.getId('header_' + item.id ),
	                    me.getId('content_' + item.id),
	                    'style="display:none;"',
						item.name || 'head'
	                ));
				}else{
					html.push(ui.format(me.accordionTpl,
	                    firstHeadClass,
	                    contentClassName,
	                    me.getId('header_' + item.id ),
	                    me.getId('content_' + item.id),
	                    '',
						item.name || 'head'
	                ));
				}
            }
            
            return html.join(''); 
    },

    
    /**
     * 点击手风琴项触发的事件
     * @event onclick
     * @param {String} id 手风琴项的ID
     * @param {Object} event 触发的事件对象
     * @param {HTMLElement} target 触发事件的模板元素
     */
    onclick : function () {},

    clickHandler : function (event, target) {
        var me = this,
            accordions = me.accordions,
            len = accordions.length,
            i = 0, item = null, idx = 0,
            selectedClassName = me.getClass('selected');
		/*
		if (baidu.dom.hasClass(target,me.getClass('selected'))){
			//已经打开，关闭自己打开下一个,遇到最后一个则打开第一个
			for(; i < len; i++){
	            item = accordions[i];
				if (me.getId('header_' + item.id ) == target.id){
					idx = i;
				}           
	            baidu.hide(me.getId('content_' + item.id));
	            baidu.removeClass(me.getId('header_' + item.id ), selectedClassName);            
	        } 
			if (idx == len-1){
				idx = 0;
			}else{
				idx++;
			}
			target = baidu.g(me.getId('header_' + accordions[idx].id));
			baidu.addClass(target, selectedClassName);        
	        baidu.show(target.id.replace('header_', 'content_'));
		}else{
		*/
			//关闭所有，打开自己
			for(; i < len; i++){
	            item = accordions[i];  
				if (me.getId('header_' + item.id ) == target.id){
					idx = item.id;
				}         
	            baidu.hide(me.getId('content_' + item.id));
	            baidu.removeClass(me.getId('header_' + item.id ), selectedClassName);            
	        }        
	        baidu.addClass(target, selectedClassName);        
	        baidu.show(target.id.replace('header_', 'content_'));
	        
	    idx = me.expandItem(target);
		/*	
		} 
		*/   
        me.onclick(idx,event,target);
    },
    
    expandItem : function (target) {
        var me = this,
            accordions = me.accordions,
            len = accordions.length,
            i = 0, item = null, idx = 0,
            selectedClassName = me.getClass('selected');
        for(; i < len; i++){
            item = accordions[i];  
            if (me.getId('header_' + item.id ) == target.id){
                idx = item.id;
            }         
            baidu.hide(me.getId('content_' + item.id));
            baidu.removeClass(me.getId('header_' + item.id ), selectedClassName);            
        }        
        baidu.addClass(target, selectedClassName);        
        baidu.show(target.id.replace('header_', 'content_'));
        return idx;
    },
    

    bindEvent : function () {
        var me = this;
        me.main.onclick = function(event){
            var event = window.event || event,
                target = event.srcElement || event.target; 
            
            while(target && target.id != me.main.id){
                if(target.tagName.toLowerCase() == 'h3' && baidu.dom.hasClass(target,me.getClass('header')) ){
                    
                    me.clickHandler(event, target);
                    
                    break;
                } else {
                    target = target.parentNode;
                }
            }
        };
    },
	/**
	 * 设置特定手风琴项的标题
	 * 
	 * @method setHeadText
	 * @param {String} text 要设置的标题，可以是HTML片段
	 * @param {Number} id 要设置的手风琴项的索引
	 */
	setHeadText : function(text,idx){
		var me = this,
		    accordions = me.accordions,
			target = baidu.g(me.getId('header_' + accordions[idx].id));
		if (target){
			target.innerHTML = text;
		}
	}
};

ui.Base.derive(ui.Accordion);
