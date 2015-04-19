/*
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: asset/tpl/nirvana_tpl.js 
 * desc: 本地调试时候的一些配置定义
 */
 
var IS_DEBUG_MODE = true;
var kslftestdata = 1;
var kslfData = 0;
var kslfData1 = 0;
var kslfData2 = 0;
var kmd5 = (new Date()).valueOf();
NIRVANA_LOG.path = 'http://ut.baidu.com/etech/product/er_package.jpg';

//baidu.cookie.set('__cas__rn__', (Math.random()).toString());
baidu.cookie.set('__cas__rn__', "0.105549454654564849");
baidu.cookie.set('__cas__st__3', (Math.random()).toString());
//baidu.cookie.set('__cas__st__3', "0.74897494541212445");

/* 调试用户行为监控数据 
 * @author linzhifeng@baidu.com
 */
LOG_DEBUG = false;
if (LOG_DEBUG){
	NIRVANA_LOG.request = function(path,params){
		var result = [];
		for (var item in params) {
			result.push(item + ' = ' + encodeURIComponent(params[item]));
		}
		console.log('***' + params.target + '-----' + result.join('|'))
	}
}
/*
 * 诊断IE本地调试特殊配置
 */
if (baidu.ie) {
    // 移除import的css替换成下面压缩过的css add by Huiyao 2013.1.22
    baidu.object.each(
        $$('link[rel="stylesheet"]'),
        function(item) {
            baidu.dom.remove(item);
        }
    );
	// tpl也增加了版本号，所以这里需要替换
	er.config.TEMPLATE_LIST = ['./output/debug/nirvana_tpl_source.html'];
	//IE css引用数量限制  by linzhifeng@baidu.com modified by Huiyao 解决IE css文件大小限制问题 2013.1.11
	document.getElementsByTagName('head')[0].appendChild(baidu.dom.create('link',{rel:'stylesheet',href:'output/debug/dev4ie_core.css'}))
    document.getElementsByTagName('head')[0].appendChild(baidu.dom.create('link',{rel:'stylesheet',href:'output/debug/dev4ie_nirvana.css'}))
}