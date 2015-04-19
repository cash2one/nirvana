/**
 * 底层请求器
 */
var Requester = (function(){
	var post_, //请求参数
		getSuccessCallback_, //生成成功回调的处理函数
		loadScript_,
		post_,
		parse;
	
	getSuccessCallback_ = function(successCallback){
		return function(xhr){
			try {
			//	var data = baidu.json.parse(xhr.responseText);
			//baidu.json.parse中test一步偶尔会出错，导致无法parse，这里直接执行parse
				var data = xhr.responseText;
					data = window.JSON && window.JSON.parse ?
        						window.JSON.parse( data ) :
        						(new Function("return " + data))();
			} catch(ex){
				//TODO
			}
			
			//按规范data此时必须是一个object
			//校验逻辑稍后做
			successCallback && successCallback(data);
		}
	};
	
	/**
	 * 动态加载Script
	 * @param {Object} url
	 * @author tangram tongyao@baidu.com
	 */
	loadScript_ = function(url, callback){
		var scr = document.createElement("SCRIPT"),
	        scriptLoaded = 0;
	    
	    // IE和opera支持onreadystatechange
	    // safari、chrome、opera支持onload
	    scr.onload = scr.onreadystatechange = function () {
	        // 避免opera下的多次调用
	        if (scriptLoaded) {
	            return;
	        }
	        
	        var readyState = scr.readyState;
	        if ('undefined' == typeof readyState
	            || readyState == "loaded"
	            || readyState == "complete") {
	            scriptLoaded = 1;
	            try {
	                ('function' == typeof callback) && callback();
	            } finally {
	                if(scr && scr.parentNode){
	                    scr.parentNode.removeChild(scr);
	                }
	                scr.onload = scr.onreadystatechange = null;
	                scr = null;
	            }
	        }
	    };
	    
	    scr.setAttribute('type', 'text/javascript');
	    scr.setAttribute('src', url);
	    document.getElementsByTagName("head")[0].appendChild(scr);
	};
	
	
	post_ = function(path, level, params, successCallback, failureCallback, timeoutCallback){		
		//在URL中拼接userid，token，path
		var postParam = {
			path 		:	path,
			userid		:	nirvana.env.USER_ID,
			token		:	nirvana.env.TOKEN,
			params		:	params
		};
		
        //scookie代表全小流量，zebra代表心跳请求
        if (path != 'zebra' && path != 'scookie'){
            path = nirvana.config.REQUEST_URL_BASE + '?path=' + path;
        }
        //path = path == 'zebra' ? 'zebra' : nirvana.config.REQUEST_URL_BASE;
        //path = nirvana.config.REQUEST_URL_BASE;
 		
		/**
 		//对condition预先处理
 		params.condition = baidu.url.jsonToQuery(params.condition);
		
 		//将params的对象转为字符串
		var postParam = baidu.url.jsonToQuery(params);
		**/
		var timeout = params.timeout || 0;
		delete postParam.params.timeout;
		
		postParam.params = baidu.json.stringify(postParam.params);
		
		baidu.ajax.request(path, {
	        'method'    : 'post',
	        'data'      : baidu.url.jsonToQuery(postParam),
	        'onsuccess' : getSuccessCallback_(successCallback),
	        'onfailure' : failureCallback,
	        'timeout'   : timeout,
	        'ontimeout' : timeoutCallback || (function() { ajaxFailDialog('请求超时，请刷新后重试！') })
        });
		
		return true;
		//需要上层处理批量处理的逻辑（包括失败时）
	};
	
	parse = function(path, level, params, successCallback, failureCallback, timeoutCallback){
		//包含http和https头的，使用loadScript
		if(path.indexOf('http://') != -1 || path.indexOf('https://') != -1){
			nirvana.env.REQUEST_COUNTER--;
			var params = baidu.url.jsonToQuery(params),
				quesMarkPos = path.indexOf('?');
			
			if(quesMarkPos == -1){ //如果地址中没有携带参数，则直接拼接
				path = path + '?' + params;
			} else {
				if(quesMarkPos != path.length - 1){	//如果问号后还有其他参数
					path += '&';
				}
				path += params;
			}
			//这里的successCallback主要作用是通知Request
			loadScript_.call(this, path, successCallback);
		} else {
			post_.apply(this, arguments);
		}
	};
	
	return {
		send : parse
	}
})();
