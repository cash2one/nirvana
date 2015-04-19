/*
 * cb-web
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/BoxGroup.js
 * desc:    选项组控件
 * author:  zhaolei,erik
 * date:    2010/03/23
 */

/**
 * 选项组控件<br/>
 * 该控件不往DOM上画东西，只做一些全选、反选、取值的事情
 * @description 该控件不往DOM上画东西，只做一些全选、反选、取值的事情
 * @class BoxGroup
 * @namespace ui
 * @constructor
 * @param {Object} options 参数
 * <pre>
 * 配置项如下：
 * {
 *     id: [String],               [REQUIRED] BoxGroup的id属性，对于CheckBox/Radio通过formName来
 *                                            引用group，其值为BoxGroup的id
 *     ui: ['CheckBox'|'RadioBox'] [REQUIRED] 该BoxGroup所包含的控件类型
 * }
 * </pre>
 */
ui.BoxGroup = function(options){
    //初始化参数
    ui.Base.initOptions.call(this, options);
    
    this.tag = 'INPUT';
    // 类型列表，控件对应的type
    this.typeMap = {
        CheckBox: 'checkbox',
        RadioBox: 'radio'
    }
}

ui.BoxGroup.prototype = {
    
    /**
     * 获取选项组选中的值，返回所有选中项的值
     * @method getValue
     * @return {Array}
     * @public
     */
    getValue: function() {
        var me      = this,
            els     = me.getDOMList(),
            len     = els.length,
            re      = [],
            i       = 0;
        
        for (; i < len; i++) {
            var el = els[i];
            if (!!el.checked) {
                if(el.type == 'checkbox'){
                    re.push(el.value);
                }else if(el.type == 'radio'){
                    re = el.value;
                }
                
            }
        }
        
        return re;
    },
	
    /**
     * 设置选中项（该方法主要用于单选按钮组）
     * @method setValue
     * @param {String} value 要选中的项的值
     * @public
     */
	setValue : function(value) {
        var me      = this,
            els     = me.getDOMList(),
            len     = els.length,
            i       = 0;
        
        for (; i < len; i++) {
            var el = els[i];
			
			if (el.type == 'checkbox') {
				// checkbox暂时无此需求
			} else if (el.type == 'radio') {
				if (el.value == value) {
					el.checked = 1;
				}
			}
        }
	},
    
    /**
     * 对选项组下所有选项进行全选（用于复选框组）
     * @method selectAll
     * @description 仅多选控件可用
     * @public
     */
    selectAll: function() {
        var me      = this,
            els     = me.getDOMList(),
            len     = els.length,
            i       = 0;
        
        if (me.ui != 'CheckBox') {
            return;
        }

        for (; i < len; i++) {
            els[i].checked = true;
        }
    },
    
    /**
     * 对选项组下所有选项进行反选（用于复选框组）
     * @method selectInverse
     * @description 仅多选控件可用
     * @public
     */
    selectInverse: function() {
        var me      = this,
            els     = me.getDOMList(),
            len     = els.length,
            i       = 0;
        
        if (me.ui != 'CheckBox') {
            return;
        }

        for (; i < len; i++) {
            var el = els[i];
            el.checked = !el.checked;
        }
    },
    
    /**
     * 获取选项组下的DOM元素列表
     * 
     * @return {Array}
     */
    getDOMList: function() {
        var me      = this,
            group   = me.id,
            uiType  = me.typeMap[me.ui],
            els     = document.getElementsByTagName(me.tag),
            len     = els.length,
            i       = 0,
            re      = [];
        
        for (; i < len; i++) {
            var el = els[i],
                controlId = el.getAttribute('control'),
                control;
                
            
            if (!controlId) {
                continue;
            }
            
            control = ui.util.get(controlId);
           
            if (control && el.type == uiType && control.formName == group) {
                re.push(el);
            }
        }
        
        return re;
    }
}
