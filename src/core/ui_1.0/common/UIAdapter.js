/*
 * er(ecom ria)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    er/UIAdapter.js
 * desc:    er框架用于控件操作的适配层
 * author:  erik
 */

er.UIAdapter = {
    /**
     * 初始化一个dom内部的所有控件
     * 
     * @param {HTMLElement} wrap
     * @param {Object} propMap
     * @param {string} privateContextId
     * @return {Object} 
     */
    init: function (wrap, propMap, privateContextId, opt_attrReplacer) {
        return ui.util.init(wrap, propMap, privateContextId, opt_attrReplacer);
    },
    
    /**
     * 释放控件
     *     
     * @param {Object} key
     */
    dispose: function (key) {
        ui.util.dispose(key);
    },
    
    /**
     * 验证控件
     * 
     * @param {Object} control
     * @return {boolean}
     */
    validate: function (control) {
        return control.validate();
    },
    
    /**
     * 验证控件并返回错误
     * 
     * @param {Object} formCtrl
     * @param {Object} errorMessage
     */
    validateError: function (formCtrl, errorCode) {
        formCtrl.errorCode = errorCode;
        ui.util.validate(formCtrl, 'backendError');
        formCtrl.errorCode = null;
    },
    
    /**
     * 是否表单控件
     * 
     * @param {Object} control
     * @return {boolean}
     */
    isForm: function (control) {
        return control && control.form;
    },
    
    /**
     * 控件是否disabled状态
     * 
     * @param {Object} control
     * @return {boolean}
     */
    isDisabled: function (control) {
        return control.getState('disabled');
    },
    
    /**
     * 控件是否只读
     * 
     * @param {Object} control
     * @return {boolean}
     */
    isReadOnly: function (control) {
        return control.getState('readonly');
    }, 
    
    /**
     * 获取表单控件的表单名
     * 
     * @param {Object} control
     */
    getFormName: function (control) {
        return control.formName;
    },
    
    /**
     * 重新注入控件所需数据，通常repaint前用
     * 
     * @param {Object} control
     * @param {string} privateContextId
     */
    injectData: function (control, privateContextId, data) {
        var main = control.main;
        if (!main) {
            // 有些控件没有main属性，例如FormTab
            // TODO 应该提供一个AbstractMain，通过调用
            // control.getMain()的方法来使用
            return ;
        }
		
        var refer = main.getAttribute('refer'),
            i,
            len,
            attrSeg,
            refers,
			noChange = true;
		
		
		if(data && Object.prototype.toString.call(data) == "[object Array]"){
			for (i = 0, len = data.length; i < len; i++) {
				attrSeg = data[i].split(':');
				control[attrSeg[0]] = er.context.get(attrSeg[1], privateContextId);
			}
			return ;
		}
            
        if (!refer) {
            return;
        }
            
        refers = refer.split(';');
        for (i = 0, len = refers.length; i < len; i++) {
            attrSeg = refers[i].split(':');
            control[attrSeg[0]] = er.context.get(attrSeg[1].substr(1), privateContextId);
        }
    },
    
    /**
     * 重绘控件
     * 
     * @param {Object} control
     */
    repaint: function (control) {
        control.render(control.main, false);
    },
    
    /**
     * 设置form控件的disable状态
     * 
     * @param {Object} control
     * @param {boolean} disabled
     */
    disable: function (control, disabled) {
        if (er.UIAdapter.isForm(control)) {
            control.disable(disabled);
        }
    }
};



