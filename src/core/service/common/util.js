/**
 * fbs.util
 * fbs使用到的通用函数
 */

fbs = fbs || {};

fbs.util = {};

/**
 * json 序列化，忘记哪里用了，先留着
 * @param {Object} data
 * @author tangram
 */
fbs.util.jsonparse = function(data) {
    if (!/^[\],:{}\s]*$/.test(data.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]")
        .replace(/(?:^|:|,)(?:\s*\[)+/g, "")) ) {
        return null;
    }
    return (new Function("return " + data))();
};

/**
 * 判断是否为函数
 * @param {Object} source
 * @author tangram
 */
fbs.util.isFunction = function (source) {
  // chrome下,'function' == typeof /a/ 为true.
    return '[object Function]' == Object.prototype.toString.call(source);
};

/**
 * 判断目标参数是否Array对象
 * @param {Any} source 目标参数
 * @return {boolean} 类型判断结果
 * @author tangram
 */
fbs.util.isArray = function(source) {
	return '[object Array]' == Object.prototype.toString.call(source);
}

/**
 * 判断一个对象是否为{}
 * @param {Object} obj
 */
fbs.util.isEmptyObject = function(obj) {
	for (key in obj) {
		return false;
	}
	return true;
}

/**
 * 删除字符串中的首尾空白字符
 * @param {String} str 需要处理的字符串
 * @return {String} 处理过的字符串
 * @author dongrui@baidu.com
 */
fbs.util.trim = function(str) {
	str = '' + str;
    return str.replace(/(^[\s\u3000\xa0]+|[\s\u3000\xa0]+$)/g, '');
};

/**
 * 字符串求长度(全角)
 * @param {String} str 需要求长的字符串
 * @return {Number} 长度
 * @author zuming@baidu.com
 */
fbs.util.getLengthCase = function(str) {
	var len = str.length;
	str.replace(/[\u0080-\ufff0]/g, function (){len++;})
	return len;	
}

/**
 * 按照值删除数组中某些元素
 * @param {Array} arr 需要做操作的数组
 * @param {Object} value 值，默认为空字符串
 * @return {Boolean} 删除是否成功
 * @author zuming@baidu.com
 */
fbs.util.arrayRemoveBy = function(arr, value) {
    var tmp = [];
    for (var i = 0, len = arr.length; i < len; i++) {
        if (arr[i] != value) {
            tmp.push(arr[i]);
        }
    }
    return tmp;
}

/**
 * 删除数组中重复的元素
 * @param {Array} arr 需要做操作的数组
 * @return {Array} 删除掉重复的数组
 * @author zuming@baidu.com
 */
fbs.util.arrayDistinct = function(arr) {
    var _tmp = [];
    if (arr.length != 0) {
		var hash = {};
        for (var i = 0, len = arr.length; i < len; i++) {
			hash[arr[i]] = i;
		}
		for (key in hash) {
			_tmp.push(hash[key]);
		}
    }
    return _tmp;
}

/**
 * 从包含多个层级id为key的错误对象中，随意取出一个
 * 适用于批量操作物料时，一错都错的情况调用
 * 注意：此方法只是随机返回一个，不保证为有序第一个
 * @param {Object} errorObj 后台返回的错误对象
 * @return {Object} 某一个层级id下的错误对象
 * @author tongyao@baidu.com
 */
fbs.util.fetchOneError = function(errorObj){
	var errorObj = errorObj.error;
	for(var key in errorObj){
		return errorObj[key];
	}
}

/**
 * URL去掉HTTP://头
 * @param {String} url
 * @return {String} url
 * @author zuming@baidu.com
 */
fbs.util.removeUrlPrefix = function (url){
    url = url.replace(/：/g, ':').replace(/．/g, '.').replace(/／/g, '/');
    while (fbs.util.trim(url).toLowerCase().indexOf('http://') == 0) {
        url = fbs.util.trim(url.replace(/http:\/\//i, ''));
    }
    return url;
};

/**
 * 去除关键字字面的匹配字符（短语，精确）
 * @param {Object} word
 * @author copy by zhujialu
 */
fbs.util.removeWmatchPattern = function(word){
    if (word.charAt(0) == '"' && word.charAt(word.length - 1) == '"') {
        if (word.charAt(1) == "[" && word.charAt(word.length - 2) == "]") { //原短语
            return word.substr(2,(word.length - 4));
        } else {
            return word.substr(1,(word.length - 2));
        }
    } else if (word.charAt(0) == '[' && word.charAt(word.length - 1) == ']'){
        return word.substr(1,(word.length - 2));
    } else {
        return word;
    }
};
