/**
 * nirvana
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file   模块加载器
 * @author 王辉军(wanghuijun@baidu.com)
 * @date   2012/11/30
 */

/**
 * @namespace
 */
var nirvana = nirvana || {};

/**
 * 模块加载器
 * 本来想命名为requiredJs，为了避免与模块加载器RequireJS混淆，取名为loader
 *
 * @param  {string} moduleName 模块名称
 * @return {string}  jsName      模块需要的js文件
 */
nirvana.loader = function(moduleName) {
	var jsName = '';
    // 版本号，build文件中替换
    var JS_VERSIOIN_ID = '';

    switch (moduleName) {
        // 手动版优化建议和效果突降
        case 'proposal' :
        case 'decrease' :
            jsName = 'asset/js/accountOptimizer';
            break;
		case 'msgcenter':
			jsName = 'asset/js/message';
            break;
    }

    return jsName + JS_VERSIOIN_ID + '.js';
};