/*
 * er(ecom ria)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    er/extends/UIAction.js
 * desc:    action扩展，提供UI组件相关功能
 * author:  erik 
 */

er.Action.extend({
    /**
     * 绘制当前action的显示
     * 
     * @protected
     */
    render: function () {
        var me = this;
        er.Action.prototype.render.call(me);
        me._controlMap = er.UIAdapter.init(baidu.g(me.arg.domId), me.UI_PROP_MAP, me._contextId, me.addDataControl());
		me._changeControl = {};
    },
    
    /**
     * 重新绘制当前action的显示
     * 
     * @protected
     */
    repaint: function (controlMap) {
        var me = this,
			key, 
            control,
			changeData,
			changeControls = me._changeControl,
			controlMap = controlMap || me._controlMap,
            uiAdapter = er.UIAdapter;
       
        for (key in changeControls) {
            control = controlMap[key];
			changeData = changeControls[key];
            if (!control) {
                continue;
            }
            
			if(changeData && changeData.length > 0){
				uiAdapter.injectData(control, me._contextId, changeData); // 重新灌入数据
				uiAdapter.repaint(control); // 重绘控件
			}
        }
		me._changeControl = {};
    },
    
    repaintForm : function () {
        var controlList = this.getFormList(),
            len = controlList.length, i = 0, 
            control,
            uiAdapter = er.UIAdapter;
            
        for (; i < len; i++) {
            control = controlList[i];
            if (!control) {
                continue;
            }
            
            uiAdapter.injectData(control, this._contextId);  // 重新灌入数据
            uiAdapter.repaint(control);     // 重绘控件
        }
    },
    /**
     * 获取表单控件列表
     * 
     * @protected
     * @return {Array}
     */
    getFormList: function () {
        var controlMap = this._controlMap,
            formList = [],
            key, control;
            
        // 统计form控件列表
        for (key in controlMap) {
            control = controlMap[key];
            if (er.UIAdapter.isForm(control)) {
                formList.push(control);
            }
        }
        
        return formList;
    },
        
    /**
     * 获取表单的请求参数字符串
     * 用于参数自动拼接
     * 
     * @protected
     * @return {string}
     */
    getQueryByForm: function () {
        var queryMap = this.FORM_QUERY_MAP || {},
            formList = this.getFormList(),
            finished = {},
            i, len, 
            control, formName, 
            value, queryString,
            uiAdapter = er.UIAdapter,
            queryBuf = [];
        
        for (i = 0, len = formList.length; i < len; i++) {
            control = formList[i];
            formName = uiAdapter.getFormName(control);

            if (uiAdapter.isForm(control) && !uiAdapter.isDisabled(control)) {
                    
                if (formName) {
                    // 已拼接的参数不重复拼接
                    if (finished[formName]) {
                        continue;
                    }
                    
                    // 记录拼接状态
                    finished[formName] = 1;
                    
                    // 读取参数名映射
                    formName = queryMap[formName] || formName;
                    
                    // 获取form值
                    if (control.group) {
                        value = control.getGroup().getValue().join(',');
                    } else if ('function' == typeof control.getQueryValue) {
                        value = control.getQueryValue();
                    } else {
                        value = control.getValue();
                    }
                    
                    // 拼接参数
                    queryBuf.push(formName + '=' + encodeURIComponent(value));
                } else if ('function' == typeof control.getQueryString) {
                    // 拼接参数
                    queryString = control.getQueryString();
                    if ('string' == typeof queryString) {
                        queryBuf.push(queryString);
                    }
                }
            }
        }
        
        // 拼接action给与的额外参数
        if ('function' == typeof this.getExtraQueryByForm) {
            queryString = this.getExtraQueryByForm();
            if ('string' == typeof queryString) {
                queryBuf.push(queryString);
            }
        }
        
        return queryBuf.join('&');
    },
    /**
     * 获取表单的请求参数的对象
     * 用于参数自动提交
     * @
     * @protected
     * @return {string}
     */
    getObjectByForm : function () {
        var queryMap = this.FORM_QUERY_MAP || {},
            formList = this.getFormList(),
            finished = {},
            i, len, 
            control, formName, 
            value, queryObject = {},
            uiAdapter = er.UIAdapter,
            queryObjectSub,key;
        
        for (i = 0, len = formList.length; i < len; i++) {
            control = formList[i];
            formName = uiAdapter.getFormName(control);

            if (uiAdapter.isForm(control) && !uiAdapter.isDisabled(control)) {
                    
                if (formName) {
                    // 已拼接的参数不重复拼接
                    if (finished[formName]) {
                        continue;
                    }
                    
                    // 记录拼接状态
                    finished[formName] = 1;
                    
                    // 读取参数名映射
                    formName = queryMap[formName] || formName;
                    
                    // 获取form值
                    if (control.group) {
                        value = control.getGroup().getValue();
                    } else if ('function' == typeof control.getObjectValue) {
                        value = control.getObjectValue();
                    } else {
                        value = control.getValue();
                    }
                    
                    
                    // 拼接参数
                    queryObject[formName] = value;
                } else if ('function' == typeof control.getQueryObject) {
                    // 拼接参数
                    queryObjectSub = control.getQueryObject();
                    if ('object' == typeof queryObjectSub) {
                        for(key in queryObjectSub){
                            queryObject[key] = queryObjectSub[key]
                        }
                    }
                }
            }
        }
        
        // 拼接action给与的额外参数
        if ('function' == typeof this.getExtraQueryByForm) {
            queryObjectSub = this.getExtraQueryByForm();
            if ('object' == typeof queryString) {
                for(key in queryObjectSub){
                    queryObject[key] = queryObjectSub[key]
                }
            }
        }
        
        return queryObject;
        
    },
    
    /**
     * 验证表单控件的值是否合法
     * 
     * @protected
     * @return {boolean}
     */
    validateForm: function () {
        var isValid = true,
            formList = this.getFormList(),
            uiAdapter = er.UIAdapter,
            i, len, control;
               
        for (i = 0, len = formList.length; i < len; i++) {
            control = formList[i];
            if (uiAdapter.isDisabled(control) || uiAdapter.isReadOnly(control)) {
                continue;
            }
                
            if (!uiAdapter.validate(control)) {
                isValid = false;
            }
        }
        
        return isValid;
    },
    
    /**
     * 完成提交数据
     * 
     * @protected
     * return {Function}
     */
    getSubmitFinish: function (submitButton) {
        var me = this;
            
        return function (data) {
            var formList = me.getFormList(),
                len = formList.length,
                i = 0,
                errorMap,
                formCtrl,
                errorCode,
                fieldName;//验证显示区域名字,对应Error返回的Key
                
            // 当后端验证失败时
            // 处理后端验证结果
            
            if(data.status == '400') {
                
                /*
                errorMap = data.errorCode;
                
                for (; i < len; i++) {
                    formCtrl = formList[i];
                    fieldName = formCtrl.group || formCtrl.formName; 
                    errorCode = errorMap[formCtrl.formName];
                    if (errorCode) {
                        er.UIAdapter.validateError(formCtrl, errorCode);
                    }
                }
                */
                //临 时解决方案 added by chenjincai//FIX
                me.displayErrorMsg(data); 
                if(submitButton){
                    submitButton.disable(false);
                }
                return;
            }
            
            // onsubmitfinished事件触发
            if (!me.onsubmitfinished || me.onsubmitfinished(data) !== false) {
                if(submitButton){
                    submitButton.disable(false);
                }
                //me.back(); commented by chenjincai    提醒规则这里提交之后不需要回退
            }
        };
    },
    
    /**
     * 获取返回按钮的处理函数
     * 
     * @protected
     * return {Function}
     */
    getSubmitCancel: function () {
        var me = this;
        
        return function () {
            me.back();
        }
    },
    
    /**
     * 执行离开时的清理动作
     * 
     * @protected
     */
    dispose: function () {
        // 卸载现有组件
        var controlMap = this._controlMap;

        if (controlMap) {
            for (key in controlMap) {
                er.UIAdapter.dispose(key);
                delete controlMap[key];
            }
        }
        
        er.Action.prototype.dispose.call(this);
    }
});
