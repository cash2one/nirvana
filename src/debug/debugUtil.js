/*
 * nirvana
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:    debug/debugUtil.js
 * desc:    用于调试用的工具方法
 * author:  wuhuiyao (wuhuiyao@baidu.com)  
 * date:    $Date: 2012/11/9 $
 */
nirvana.debug = {};
nirvana.debug.Util = {
	/**
	 *  用来模拟请求参数如果包含token，可以利用缓存，速度可以更快，通过timeout来模拟
	 *  @method getResponseTimeOut
	 *  @param {Object} 请求参数
	 *  @return {Number}
	 */
	getResponseTimeOut: function(param) {
		var token = param.condition.token;
		if (token) {
			return 20;
		} else {
			return 2000;
		}
	}
}

// shorthand of debug util
var debugUtil = nirvana.debug.Util;


/**
 * 获取动态加载的模板列表
 * @param {Object} moduleName
 * @author zhouyu
 */
nirvana.moduleResources.getTplList = function(moduleName){
	return nirvana.moduleResources[moduleName.toUpperCase() + "_TEMPLATE_LIST"];
}
/**
 * 获取动态加载的js文件列表
 * @param {Object} moduleName
 * @author zhouyu
 */
nirvana.moduleResources.getJsList = function(moduleName){
	return nirvana.loader("fclab");
}