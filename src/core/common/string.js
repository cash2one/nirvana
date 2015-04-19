/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 *
 * path:    lib/number.js
 * desc:    字符串处理
 * author:  wanghuijun
 * date:    $Date: 2010/12/31 $
 */

/**
 * 获取某个子串在字符串中的位置
 * @param {Object} str
 * @param {Object} substr
 * @author zuming@baidu.com
 */
function getSubstrNumber(str, substr) {
	if (str === "" || substr === "") {
		return 0;
	}
	str = '' + str;
	var _tmp = str.split(substr);
	return _tmp.length - 1;
}


/**
 * 删除字符串中的首尾空白字符
 * @param {String} str 需要处理的字符串
 * @return {String} 处理过的字符串
 * @author dongrui@baidu.com
 */
function trim(str) {
	str = '' + str;
    return str.replace(/(^[\s\u3000\xa0]+|[\s\u3000\xa0]+$)/g, '');
};

/**
 * 编码字符串中的html敏感字符
 * @param {String} str 需要处理的字符串
 * @return {String} 处理过的字符串
 * @author zuming@baidu.com
 */
function escapeHTML(str) {
	str = '' + str;
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

/**
 * 反编码字符串中的html敏感字符
 * @param {String} str 需要处理的字符串
 * @return {String} 处理过的字符串
 * @author dongrui@baidu.com
 */
function unescapeHTML(str) {
	str = '' + str;
    return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
};

/**
 * URL Encode编码字符串
 * @param {String} str 需要处理的字符串
 * @return {String} 处理过的字符串
 * @author zuming@baidu.com
 */
function encode(str) {
	str = '' + str;
	return encodeURIComponent(str);
}

/**
 * URL Decode反编码字符串
 * @param {String} str 需要处理的字符串
 * @return {String} 处理过的字符串
 * @author zuming@baidu.com
 */
function decode(str) {
	return decodeURIComponent(str);
}

function escapeQuote(str){
	return str.replace(/'/g, "&#39;").replace(/"/g, '&quot;');
}

function addSlashes(str){
	return str.replace(/'/g,'\\\\\'').replace(/"/g,'\\\\\"');
}

/**
 * 字符串求长度(全角)
 * @param {String} str 需要求长的字符串
 * @return {Number} 长度
 * @author zuming@baidu.com
 */
function getLengthCase(str) {
	var len = str.length;
	str.replace(/[\u0080-\ufff0]/g, function (){len++;})
	return len;	
}

/**
 * 字符串截取部分(全角)
 * @param {String} str 字符串
 * @param {Number} len 截断保留长度
 * @return {String} 截断后的字符串
 * @author zuming@baidu.com
 */
function subStrCase(str, len) {
	while (getLengthCase(str) > len) {
		str = str.substr(0, str.length - 1);
	}
	return str;
}

/**
 * 插入软回车
 * @param {Object} s
 * @author zuming@baidu.com
 */
function insertWbr(s) {
	return String(s).replace(/(?:<[^>]+>)|(?:&[0-9a-z]{2,6};)|(.{1})/g, '$&<wbr>').replace(/><wbr>/g, '>');
}

/**
 * 截取字符串
 * @param {Object} str 字符串
 * @param {Object} len 长度
 * @param {Object} tailStr 尾部添加
 * @author zuming@baidu.com
 */
function getCutString(str, len, tailStr) {
	var tmp = unescapeHTML(str);
	if(typeof tailStr == 'undefined'){
		tailStr = '';
	}
	if (getLengthCase(tmp) > len) {
        tmp = escapeHTML(subStrCase(tmp,len)) + tailStr;
		return tmp;
	} else {
        return escapeHTML(tmp);
	}
}

/**
 * 每三位增加逗号
 * @param {Object} str
 */
function addCommas(str){
	str += '';
	var x = str.split('.');
	var x1 = x[0];
	var x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

/**
 * 获取文本实际显示宽度
 * @param {String} text 字符串
 * @return {Number} 显示长度
 * @author linzhifeng@baidu.com
 */
function getDisplayWidth(text){
    text = escapeHTML(text);
    var es= baidu.g("ellipsisSpan");
    if (!es) {
        var el = document.createElement("div");
        el.id = "autoEllipseWrapper";
        el.style.position = "absolute";
        el.style.left = "-10000px";
        el.style.top = "-10000px";
        document.body.appendChild(el);
        el.innerHTML = "<span id=\"ellipsisSpan\" style=\"white-space:nowrap;\"></span>";
        es= baidu.g("ellipsisSpan");
    }
    es.innerHTML = text;
    return es.offsetWidth
}
/**
 * 用尺子获取文本显示长度
 * @depend getDisplayWidth
 */
function getDisplayWidthFromRuler(text){
	text = escapeHTML(text);
	var cur,curWidth = 0;
	for (var i = 0,l = text.length; i < l; i++){
        cur = text.charAt(i) + '';
        if (cur.match(/[\u0080-\ufff0]/g)){
            curWidth += DISPLAY_RULER['圆'];
        }else if (DISPLAY_RULER[cur]){
            curWidth += DISPLAY_RULER[cur];
        }else {
            DISPLAY_RULER[cur] = getDisplayWidth(cur);
            curWidth += DISPLAY_RULER[cur];
        }
    }
    return curWidth;
}
/**
 * 显示宽度尺子，避免重复计算
 */
var DISPLAY_RULER = function(){
    var res = {},
        textRuler = "圆abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,<.>/?;:'\"[{]}\\|`~!@#$%^&*()";
    for (var i = 0, l = textRuler.length; i < l; i++){
        res[textRuler.charAt(i)] = getDisplayWidth(textRuler.charAt(i))
    }
    return res;
}()

/**
 * 截取符合一定显示宽度的文本，自动最加...
 * @param {String} text 字符串
 * @param {String} width 显示长度
 * @return {String} 截取到的文本
 * @depend getDisplayWidthFromRuler, getDisplayWidth, DISPLAY_RULER
 * @author linzhifeng@baidu.com
 */
function autoEllipseText(text, width) {
    text = escapeHTML(text);
    if (getDisplayWidthFromRuler(text) <= width){
        return text;
    }
    
    var curWidth = 0, cur;
    width -= 3*DISPLAY_RULER['.'];
    for (var i = 0,l = text.length; i < l; i++){
        cur = text.charAt(i) + '';
        if (cur.match(/[\u0080-\ufff0]/g)){
            curWidth += DISPLAY_RULER['圆'];
        }else if (DISPLAY_RULER[cur]){
            curWidth += DISPLAY_RULER[cur];
        }else {
            DISPLAY_RULER[cur] = getDisplayWidth(cur);
            curWidth += DISPLAY_RULER[cur];
        }
        if (curWidth >= width){
            return text.substr(0,i+1)+ '...';
        }
    }
    return text;   //impossible here  
}

/**
 * 按照值删除数组中某些元素
 * @param {Array} arr 需要做操作的数组
 * @param {Object} value 值，默认为空字符串
 * @return {Boolean} 删除是否成功
 * @author zuming@baidu.com
 */
function arrayRemoveBy(arr, value) {
    value = value || "";
    var tmp = [];
    for (var i = 0, len = arr.length; i < len; i++) {
        if (arr[i] != value) {
            tmp.push(arr[i]);
        }
    }
    return tmp;
}

/**
 * 获取关键词
 * @param {String} str
 * @param {Array} wordlist
 * @author zuming@baidu.com
 */
function getKeywordsFromText(str) {
    var tmp = str.replace(/\r/g, '').split("\n");
    for (var i = 0; i < tmp.length; i++) {
        tmp[i] = trim(tmp[i]);
    }
    tmp = baidu.array.unique(arrayRemoveBy(tmp));
    return tmp;
}

/**
 * 首字母大写
 * @param {String} str
 * @param {String} str
 * @author wanghuijun@baidu.com
 */
function initialString(str) {
	return str.slice(0,1).toUpperCase() + str.slice(1);
}
