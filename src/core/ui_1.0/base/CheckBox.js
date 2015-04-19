/*
 * cb-web
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/CheckBox.js
 * desc:    多选控件
 * author:  zhaolei,erik
 * date:    $Date: 2010/05/12 03:13:58 $
 */

/**
 * 多选控件，该控件同时也派生于{{#crossLink "ui.Base"}}{{/crossLink}}
 *  
 * @class CheckBox
 * @extend ui.BaseBox
 * @namespace ui
 * @constructor
 * @param {Object} options 控件初始化参数
 * <pre>
 * 配置项如下：
 * {
 *     id:           [String], [REQUIRED] CheckBox的id属性，值为字符串，此值并不对应DOM元素的ID
 *     defaultValue: [Any],    [OPTIONAL] 存储的参数值，未设置该值，其值默认为0
 * }
 * </pre>
 */
ui.CheckBox = function (options) {
    // 初始化参数
    this.initOptions(options);
    this.form = 1;
    this.boxType = 'CheckBox';
    
    this.type       = 'checkbox';
    this.wrapTag    = 'INPUT';
    this.wrapType   = 'checkbox';
    
    this.defaultValue = this.defaultValue || 0;
};

/**
 * 继承自BaseBox
 */
ui.CheckBox.prototype = new ui.BaseBox();

/**
 * 获取参数值，控件选择返回1，未选中，返回defaultValue
 * @method getParamValue
 * @public
 * @return {String}
 */
ui.CheckBox.prototype.getParamValue = function () {
    if (this.getChecked()) {
        return this.getChecked() - 0;
    }
    
    return this.defaultValue;
};


ui.Base.derive(ui.CheckBox);
