/*
 * cb-web
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/RadioBox.js
 * desc:    单选控件
 * author:  zhaolei,erik
 * date:    2010/03/23
 */

/**
 * 单选控件，该控件同时也派生于{{#crossLink "ui.Base"}}{{/crossLink}}
 *  
 * @class Radio
 * @extend ui.BaseBox
 * @namespace ui
 * @constructor
 * @param {Object} options 控件初始化参数
 * <pre>
 * 配置项如下：
 * {
 *     id: [String] [REQUIRED] Radio的id属性，值为字符串，此值并不对应DOM元素的ID
 * }
 * </pre>
 */
ui.Radio = function (options) {
    // 初始化参数
    this.initOptions(options);
    this.form = 1;
    this.boxType = 'RadioBox';
    
    this.type       = 'radiobox';
    this.wrapTag    = 'INPUT';
    this.wrapType   = 'radio';
};

/**
 * 继承自BaseBox
 * 
 */
ui.Radio.prototype = new ui.BaseBox();
ui.Base.derive(ui.Radio);
