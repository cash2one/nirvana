/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    Validator.js
 * desc:    验证器
 * author:  erik, tongyao
 * date:    $Date: 2010/12/22 $
 */

/**
 * 验证器
 */
var Validator = (function () {
    var errorClass  = 'validate-error',
        validClass  = 'validate',
        iconClass   = 'validate-icon',
        textClass   = 'validate-text',
        suffix      = 'validate',
        iconSuffix  = 'validateIcon',
        textSuffix  = 'validateText',
        /**
         * 验证规则集合
         * 
         * @private
         */
        errorMessageMap = {
           '1' : '出错啦~~' 
        },
        
        noticeMap = {
            //显示在控件右侧
            right : function (errorCode, input, control) {
        
            },
            //显示在控件下方
            bottom : function (errorCode, input, control) {
                showNoticeDom(input);
                
                var title = input.getAttribute('title') || "",
                    noticeText = this.noticeText,
                    errorText;
                
                if ('object' == typeof noticeText) {
                    noticeText = noticeText[errorCode];
                }
                errorText = control.errorMessage || title + noticeText;
                getTextEl(input).innerHTML = errorText;
         
            },
            //显示在form_key的位置
            top : function (errorCode, input, control) {
        
            } 
    
        },
        
        cancelNoticeMap = {
            right : function (errorCode, input, control) {
        
            },

            bottom : function (errorCode, input, control) {
        
            },

            top : function (errorCode, input, control) {
                
            }         
        };
    
    /**
     * 在父元素的末尾提示信息
     * 
     * @private
     * @param {number} errorCode 错误码
     * @param {HTMLElement} input 控件元素
     * @param {Object} control 触发提示的控件
     */
    function noticeInTail(errorCode, input, control) {
        showNoticeDom(input);
        
        var title = input.getAttribute('title') || "",
            noticeText = this.noticeText,
            errorText;
        
        if ('object' == typeof noticeText) {
            noticeText = noticeText[errorCode];
        }
        errorText = control.errorMessage || title + noticeText;
        getTextEl(input).innerHTML = errorText;
    }
    
    /**
     * 在父元素的末尾提示信息
     * 
     * @private
     * @param {number} errorCode 错误码
     * @param {HTMLElement} input 控件元素
     * @param {Object} control 触发提示的控件
     */
    function noticeInTailNoTitle(errorCode, input, control) {
        
        showNoticeDom(input);
        
        var noticeText = this.noticeText;
        if ('object' == typeof noticeText) {
            noticeText = noticeText[errorCode];
        }
        
        getTextEl(input).innerHTML = noticeText;
    }

    /**
     * 显示notice的dom元素
     * 
     * @private
     * @param {HTMLElement} input 对应的input元素
     */
    function showNoticeDom(input, notById) {
        var el = getEl(input, notById),
            father = input.parentNode;
           
        if (!el) {
            el = createNoticeElement(input);
            father.appendChild(el);
        }

        el.style.display = '';

        baidu.addClass(father, errorClass);
    }
    
    /**
     * 创建notice元素
     * 
     * @private
     * @param {HTMLElement} input 对应的input元素
     * @return {HTMLElement}
     */
    function createNoticeElement(input) {
        var inputId = input.id,
            el = getEl(input),
            icon, text;
            
        if (!el) {
            el = document.createElement('div');
            el.id = inputId + suffix;
            el.className = validClass;
            
            icon = document.createElement('div');
            icon.id = inputId + iconSuffix;
            icon.className = iconClass;
            el.appendChild(icon);
            
            text = document.createElement('div');
            text.id = inputId + textSuffix;
            text.className = textClass;
            el.appendChild(text);
        }
        
        return el;
    }
    
    /**
     * 在父元素的末尾取消提示信息
     * 
     * @private
     * @param {HTMLElement} input 控件元素
     */
    function cancelNoticeInTail(input) {
        var el = getEl(input),
            father = input.parentNode;
            
        if (el) {
            el.style.display = 'none';
        }
        baidu.removeClass(father, errorClass);
    }
    
    
    /**
     * 获取info区域的元素
     * 
     * @private
     * @param {HTMLElement} input 对应的input元素
     * @return {HTMLElement}
     */
    function getTextEl(input) {
        return baidu.g(input.id + textSuffix);
    }
    
    /**
     * 获取提示元素
     * 
     * @private
     * @param {HTMLElement} input 对应的input元素
     * @return {HTMLElement}
     */
    function getEl(input, notById) {
        return baidu.g(input.id + suffix);
    }
    
    /**
     * 验证器
     * 
     * @public
     * @param {Object} control 需要验证的控件
     * @param {string} ruleName 验证规则的名称
     */
    return function (control, ruleName) {
        // 判断控件是否具有获取value的方法
        if (!control.getValue) {
            return true;
        }

        var ruleSeg = ruleName.split(','),
            text = control.getValue(),
            rule = ruleMap[ruleSeg[0]], 
            segLen = ruleSeg.length, i,
            args = [text], ctrl,
            errorCode,
            noticeMap, cancelNoticeMap;
            
        if (control.type == 'checkbox') {
            text = control.getChecked();
            args = [text];
        }
        
        if (segLen > 0) {
            for (i = 1; i < segLen; i++) {
                if (ruleSeg[i] == 'this') {
                    //pass control to validate function
                    args.push(control);
                } else {
                    ctrl = ui.util.get(ruleSeg[i]);
                    if (ctrl && ctrl.getValue && !ctrl.getState('disabled')) {
                        if(ctrl.type == 'checkbox'){
                            args.push(ctrl.getChecked()); 
                        }else{
                            args.push(ctrl.getValue());
                        }
                    } else {
                        args.push(null);
                    }
                }
            }
        }    
        errorCode = control.errorCode;
        var notice = notice[control.errorPosition];
        // cancelNotice = cancelNotice
        if (errorCode === 0 || 'undefined' == typeof errorCode) {
            rule.cancelNotice(control.main, control);
        } else {
            rule.notice(errorCode, control.main, control);
            return false;
        }
        
        return true;
    };
})();   
