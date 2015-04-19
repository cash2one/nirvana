/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/SelectedList.js
 * desc:    已经选择的对象列表
 * author:  chenjincai
 * date:    2010/12/14
 */
 /**
  * 选择的对象列表控件
  * @class SelectList
  * @extend ui.Base
  * @namespace ui
  * @constructor
  * @param {Object} options 配置参数
  * <pre>
  * 配置项定义如下：
  * {
  *     id:            [String],   [REQUIRED] SelectList的id属性
  *     autoState:     [Boolean],  [OPTIONAL] 是否在mouseover和mouseout时切换样式,默认值为false
  *     width:         [Number],   [OPTIONAL] 控件中列表项显示的内容的最大可视宽度，默认230，对于数据项为创意，
  *                                           该属性无效
  *     datasource:    [Array],    [REQUIRED] 数组元素的数据结构见line结构说明
  *     formName:      [String],   [OPTIONAL] 该控件所关联的表单名称，未设置，会在render的时候，
  *                                           将其初始化其挂载的DOM元素的name属性的值
  *     numberId:      [String],   [OPTIONAL] 默认值为'selectedObjNum'
  *     deleteHandler: [Function], [OPTIONAL] 删除列表项事件处理器
  * }
  * line结构：
  * {
  *     isIdea: [Boolean],       是否是创意
  *     id:     [String|Number], 数据记录ID
  *     name:   [String],        列表项显示的标签
  * }
  * </pre>
  * NOTICE: 显示的列表项数量有个上限，其值在nirvana/config.js#LIST_THRESHOLD定义
  */
ui.SelectList = function (options) {
    this.initOptions(options);
    
    this.type = 'selectedlist';
    this.form = 1;
    this.autoState = (typeof this.autoState == 'undefined') ? true : this.autoState;
	
	this.numberId = this.numberId || 'selectedObjNum';
    
	
	this.isAddLinkDisabled = false;
}

ui.SelectList.prototype = {
    initData: function(){
		var me = this;
		var data = me.datasource, i = 0, len = data.length, listDataHtml = [], item, itemHtml, itemTip = {
			content: '',
			tipClass: 'ui_list_del',
			isDel: true
		};
		
		var width = me.width || 230, 
			title = "",
			tpl = '<a href="" extraid="{0}" title="{2}" onclick="return false;">{1}</a>';
		
		for (; i < len; i++) {
			item = data[i];
			
			if (item.isIdea) { // 创意需要特殊处理
				itemHtml = ui.format(tpl, item.id, item.name);
			}
			else {
				switch (item.type) {//其实创意也可以放到这里面，去掉isIdea属性，但是用到isIdea的地方还挺多，希望以后有特殊处理的可以放到这里zhouyu01@baidu.com
					case "sublink": //蹊径子链有特殊样式问题
					case "app":
						var nameInfo = me.splitDelInfo(item.name),
						    name = nameInfo.content, 
						    delinfo = nameInfo.delinfo;
						
						title = item.name.replace(/\<.*?\>/ig, ' ');
						itemHtml = ui.format(tpl, item.id, name, title) + delinfo;
						break;
					default://若没有传入type，则默认处理
						itemHtml = ui.format(tpl, item.id, autoEllipseText(item.name, width));
						break;
				}
			}
			
			listDataHtml.push({
				classname: 'ui_list_icontxt',
				html: itemHtml,
				tip: itemTip,
				autoState: me.autoState
			});
		}
		me.content = listDataHtml;
		
	},
	
	/**
	 * 附加创意类型 有独立样式在前端控制，需要在前端加“已删除”标记，但是不能带入创意内容的样式，这里拆分内容和已删除标记
	 * @param {Object} str
	 */
	splitDelInfo: function(str){
		var delinfo = "<span info='isdel'>[已删除]</span>";
		if(str.indexOf(delinfo) > -1){
			return {
				content: str.replace(delinfo, ''),
				delinfo: delinfo
			}
		}else{
			return {
				content: str,
				delinfo: ''
			}
		}
	},
    
    tplMain : '<div id="{0}"></div><div class="{2}"><a id="{1}" href="javascript:void(0);">+添加对象</a></div>',
    /**
     * 渲染控件
     * @method render
     * @param {HTMLElement} main 控件挂载的DOM
     */
    render : function (main) {
        var me = this;
		if (me.exceed(me.datasource.length)) {
			me.initData();
			var selectedList = ui.util.create('List', {
				'id': 'selectedList',
				'skin': 'reminder',
				'content': me.content,
				'beforeDel': me.beforeDel,
				'ondelete': me.getDeleteHander()
			
			});
			
			this.controlMap = {
				selectedList: selectedList
			};
			
			ui.Base.render.call(me, main);
			if (!me.formName) {
				me.formName = main.getAttribute('name');
			}
			me.main.innerHTML = me.getMainHtml();
			me.renderList();
			
			if (baidu.g(me.numberId)) {
				baidu.g(me.numberId).innerHTML = me.datasource.length;
			}
			
			baidu.g(me.getId('addObj')).onclick = me.getAddObjHandler();
		}
    },
	// FIXME:名字起错了，应该是没有超过
	exceed: function(len){
		if(len > LIST_THRESHOLD){
			ui.Dialog.alert({
                    title: '物料过多',
					maskType:'white', 
                    content: '物料选择数量过多，请下次再操作其余物料！'
                });
			return false;
		}else{
			return true;
		}
	},
    
    /**
     * 获取控件的html
     * 
     * @private
     * @return {String}
     * @modify by zhouyu
     */
    getMainHtml: function () {
        var me = this;
        return ui.format(me.tplMain,
                            me.getId('selected'),
                            me.getId('addObj'),
                            me.getClass('addWrapper'));
    },
    
    getAddObjHandler : function () {
        var me = this;
        return function () {
            if (!me.isAddLinkDisabled) {
				me.onaddclick();
			}
        };
        
    },
    
    /**
     * 添加新的数据项事件处理
     * @event onaddclick
     */
    onaddclick: new Function(),
    
    renderList : function () {
        var me = this;
        me.controlMap["selectedList"].render(baidu.g(me.getId("selected")));
        
        
    },
    
    
    
    beforeDel : function () {
        return window.confirm('你确定要删除此条信息吗？');
    },
    
    getDeleteHander : function () {
        var me = this;
        return function (lineEl) {
            var link = lineEl.getElementsByTagName('a')[0],
                objId = link.getAttribute('extraid');
            var data = me.datasource, len = data.length, i = 0, item, deleteFlag;
            
            for(; i < len; i++){
                item = data[i];
                if(item.id == objId){
                    deleteFlag = i;
                }
            }
            
            if(typeof deleteFlag  != 'undefined'){
                data.splice(deleteFlag,1);
				if (baidu.g(me.numberId)) {
					baidu.g(me.numberId).innerHTML = data.length;
				}
				/**
				 * 删除列表项事件处理器
				 * @event deleteHandler
				 * @param {String} objId 要删除项所绑定的数据对象的id
				 */
                if(me.deleteHandler){
                    me.deleteHandler(objId);
                }
                
               
            }
            
        }
    },
    /**
     * 获取选择控件绑定的数据源
     * @method getValue
     * @return {Array} 选择列表控件绑定的数据，对于数组中每条记录不包括isIdea属性
     */
    getValue : function () {
        var me = this,
            data = baidu.object.clone(me.datasource);
        //删除isIdea标志位  
        for (var i = 0, len = data.length; i < len; i++) {
            var item = data[i];
            delete item.isIdea;
			delete item.type;
        }
        return data;
    },
    /**
     * 添加新的数据项，会重新渲染控件
     * @example 
     *      thisControl.addItem({id: 23, name: 'NewItem'});
     * @method addItem
     * @param {Object} 具体数据结构定义见该控件的配置选项信息
     */
    addItem : function (item) {
        var me = this,
            data  = me.datasource;
         
		if (me.exceed(data.length + 1)) {
		
			data = data.push(item);
			
			me.render(me.main);
		}
        
    },
    /**
     * 禁用添加链接
     * @method disableAddLink
     * @param {Boolean} disable 是否禁用添加链接
     */
    disableAddLink : function (disable) {
        var me = this;
		me.isAddLinkDisabled = disable;
        if(disable){
            baidu.g(me.getId('addObj')).style.color = '#999';
        }else{
            baidu.g(me.getId('addObj')).style.color = '';
        }
    }
    
};


ui.Base.derive(ui.SelectList);