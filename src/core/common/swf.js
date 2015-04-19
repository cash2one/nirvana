/**
 * Flash代理控制器类
 * 
 * <pre>
 * 使用示例：
 * var a = new Swf({
 *     'id'       : xxxx,
 *     'width'    : xxx,
 *     'height'   : xxx,
 *     'objName'  : xxx,
 *     'vars'     : {},
 *     'params'   : {},
 *     'tip'      : xxx,
 *     'ver'      : xxx,
 *     'url'      : xxx,
 *     'align'    : xxx 
 * });
 * </pre>
 * objName、algin、tip、vars、params、ver为可选
 *
 * @public
 * @param {Object} args 实例化flash控制器类的参数集合
 */
function Swf(args) {
    if (!args) {
        return null;
    }		
    args.vars   = args.vars   || {}; 
    args.params = args.params || {};
    args.ver    = args.ver    || "6.0.0";	
    if (args.instanceName) {
        var uniqueName = 'FLASH_' + Math.round(Math.random() * 2147483647);
        window[uniqueName] = this;
        args.vars[args.instanceName] = uniqueName;
    }
	
    args.params["movie"] = args.url;	
    args.vars = Swf.serialize(args.vars); 
    this.args = args;
}

/**
 * 获取Flash的HTML片段
 * 
 * @static
 * @param {String} id   	页面中Flash元素名称
 * @param {String} url  	源路径
 * @param {String} width    宽度
 * @param {String} height   高度
 * @param {Object} params   参数对象
 * @param {Object} vars     变量对象
 * @param {String} align    对齐方式，缺省是 middle
 * @return {String} Html片段
 */
Swf.creatHTML = function (id, url, width, height, params, vars) {
    var str = [];
    var algin = arguments[6] ? 'align=' + arguments[6] : 'align="middle"';
    str.push('<object ',
             'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ',
             'codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0" ',
             'width="' + width + '" ',
             'height="' + height + '" ',
             'id="' + id + '" ',
	     algin + '>');
    for (var i in params) {
        str.push('<param name="' + i + '" value="' + params[i] + '" />');
    }
    str.push('<param name=\"flashvars\" value=\"' + vars + '\">');
    params["movie"] = null;
    var pstr = Swf.serialize(params).replace(/[&]/g, " ");
    str.push('<embed src="' + url + '" ',
             'flashvars="' + vars + '" ',
             'width="' + width + '" ',
             'height="' + height + '" ',
             'name="' + id + '" ',
             pstr + ' ',
             algin + ' ',
             'type="application/x-shockwave-flash" ',
             'pluginspage="http://www.macromedia.com/go/getflashplayer">',
             '</object>');    
    return str.join('');
};

/**
 * 序列化参数对象
 * 
 * @static
 * @param {Object} 参数对象
 * @return {String} 参数字符串
 */
Swf.serialize = function (obj) {
    if (!obj) {
        return '';
    }
    
    var s = [];
    for (var j in obj) {
        var item = obj[j];
        if (!item && item !== 0) {
            continue;
        }
        s.push(j + "=" + encodeURIComponent(item));
    }
    return s.join("&");
};

/**
 * 获得flash对象
 *
 * @public
 * @static
 * @param {String} movieName 文档中flash影片名称
 * @return {object} flash对象引用
 */
Swf.getMovieById = function (movieName) {
    return document[movieName] || window[movieName];
};

/**
 * 获得浏览器flash版本
 *
 * @public
 * @static
 * @return {String} 获得flash版本号
 */
Swf.getVersion = function () {
    var n = navigator;
    if (n.plugins && n.mimeTypes.length) {
        var a = n.plugins["Shockwave Flash"];
        if (a && a.description) {
            return a.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s)+r/, ".") + ".0";
        }
    } else if (window.ActiveXObject && !window.opera) {
        for (var i = 10; i >= 2; i--) {
            try {
                var c = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.' + i);
                if (c) {
                    return i + ".0.0";
                    break;
                }
            } catch(e) {}
        }
    }
};

/**
 * 比较flash版本号大小
 * 说明： 1时v1>v2，-1时v1<v2，0时v1==v2。
 *
 * @public
 * @static
 * @param {String} v1 flash版本号1
 * @param {String} v2 flash版本号2
 * @return {Number} 版本号比较结果
 */
Swf.compareVersions = function(v1, v2) {
	if (!v1) {
		return -1;		
	}
    v1 = v1.split(".");
    v2 = v2.split(".");
    for (var i = 0; i < 3; i++) {
        var val1 = parseInt(v1[i], 10);
        var val2 = parseInt(v2[i], 10);
        if (val1 > val2) {
            return 1;
        } else if (val1 < val2) {
            return -1;
        }
    }
    return 0;
};


Swf.prototype = {
    /**
     * 将Flash附加到页面容器
     * 
     * @public
     * @param {HTMLElement|String} el 页面容器元素
     */
    appendTo: function (el) {
        if (el.constructor == String) {
            el = document.getElementById(el);
        }
        if (!el) {
        	return;
        }
        var a = this.args;
        if (Swf.compareVersions(Swf.getVersion(), a.ver) >= 0) {
            el.innerHTML = Swf.creatHTML(a.id,
                                       a.url,
                                       a.width,
                                       a.height,
                                       a.params,
                                       a.vars,
									   a.align);
        } else if (a.tip) {
            el.innerHTML = a.tip;
        }
    },
    

    /**
     * Js调用AS函数
     *
     * @public
     * @param {String} argument 传递参数 第一个参数为调用的函数的函数对象
     */
    call: function () {
        try {
	    var o = this.args;
            var args = Array.prototype.slice.call(arguments);
            var func = args.shift();
            var fObj = Swf.getMovieById(o.id);
            fObj[func].apply(fObj, args);
        } catch (e) {
        }
    }
}; 