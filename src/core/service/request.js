/**
 * fbs.request
 * 请求封装类
 * @author zuming@baidu.com
 */

fbs = fbs || {};

/**
 * 缓存池
 */
fbs.cachePool = {};


fbs.request = function (param) {
	if (typeof param.path == 'undefined') {
		return 'lack path';
	}
	var cache = fbs.material.getTopData.cache;
	var cachekey = [param.type, param.field, param.starttime, param.endtime].join("&");
	
	// 下面这一坨要抽象出来
	if (cache[cachekey] && cache[cachekey].status == fbs.request.STAT_SUCC) {
		fbs.request.response(param, cache[cachekey]);
	} else {
		var callbackParam = {};
		for (key in param) {
			if (key == 'callback' || key == 'onSuccess' || key == 'onFail') {
				callbackParam[key] = param[key];
			}
		}
		param.callback && (param.callback = function(data) {
			cache[cachekey] = data;
			callbackParam.callback(data);
		});
		param.onSuccess && (param.onSuccess = function(data) {
			cache[cachekey] = data;
			callbackParam.onSuccess(data);
		});
		fbs.request.send(param, param.type);
	}
}

/**
 * 一些配置项
 * @author zuming@baidu.com
 */
fbs.request.STAT_SUCC = 200;		// 请求成功
fbs.request.STAT_PART_SUCC = 300;
fbs.request.STAT_EXCEPTION = 500;
fbs.request.STAT_EXCEED = 800;   // 超过数量限制
fbs.request.STAT_TIMEOUT = 900;     //超时

/**
 * 设置具体的Request对象
 * @param {Object} fn
 * @author zuming@baidu.com
 */
fbs.request.setRequest = function(fn) {
	if (fbs.util.isFunction(fn)) {
		fbs.request._post = fn;
	}
}

/**
 * 向request实例发送请求
 * @param {Object} param
 * @param {Object} requestTag	用于向yaoyao的Request发一个tag，作为发送参数和返回数据的key
 * @param {object} nocache	用于单次请求数据，不从缓存读取 //add by liuyutong@baidu.com
 * @author zuming@baidu.com
 */
fbs.request.send = function(param) {
    // if(baidu.array.indexOf(fbs.config.noLoading, param.path) == -1) {
    //     console.log(param.path);
    // }
	var requestTag = param.requestTag || "fbs";
	delete param.requestTag;
	var callbackParam = {};
	for (key in param) {
		if (key == 'callback' || key == 'onSuccess' || key == 'onFail' || key == 'onTimeout') {
			callbackParam[key] = param[key];
			delete param[key];
		}
	}
	
	var path = null;
	if (typeof param.path != "undefined") {
		path = param.path;
		delete param.path;
	}
	
	if (typeof param.timeout == "undefined") {
        param.timeout = fbs.config.timeoutMap[path || fbs.config.path.ADV_PATH] || fbs.config.ajaxTimeout;
    }
    
	var postParam = {};
	postParam[requestTag] = param;
	
	//缓存控制
	var isCacheFree = false,
		cache_key_first = '',
		cache_key_second = '';
  if(path){
		cache_key_first = path;
		isCacheFree = baidu.array.indexOf(fbs.config.cacheFree, cache_key_first) > -1;
		if(path.indexOf('GET/') == -1 ){
			//非get接口没有cache
			isCacheFree = true;
		}
	} else { //没有path的是默认的物料接口，用level做为第一层key
		for(var key in postParam){
			
		};
		cache_key_first = key;
	}
    // add by Huiyao 2013-5-20: 只要存在nocache值就将其delete掉
    var noCache = param.nocache;
    if (typeof noCache != 'undefined') {
        delete param.nocache;
    }
	if(noCache){//add by liuyutong
//		delete param.nocache;
		isCacheFree = true;
	}	
	if (!isCacheFree) {
		var cache_key_second = baidu.json.stringify(postParam);
	}
    // 增加一个noloading参数 by huiyao 2013.1.23 记得要delete掉这个参数，不然会发给后端
    var isNoLoading = param.noloading;
    (typeof isNoLoading !== 'undefined') && (delete param.noloading);

	//ajax性能记录 by linzhifeng@baidu.com
	var ajaxRecordIdx = NIRVANA_LOG.ajaxMark(path);
	
	// 设置统一的callback处理函数
	var callback = (function(isCacheFree, cache_key_first, cache_key_second, param, requestTag, ajaxRecordIdx) {
		return function(data) {
			if(!isCacheFree && data[requestTag] && data[requestTag].status == fbs.request.STAT_SUCC){
				//如果请求成功才放入cache
				fbs.cachePool[cache_key_first] = fbs.cachePool[cache_key_first] || {};
				fbs.cachePool[cache_key_first][cache_key_second] = data;
			}
			data = data[requestTag];
			NIRVANA_LOG.ajaxLog(ajaxRecordIdx);
			fbs.request.response(param, data, cache_key_first, cache_key_second);
		}
	})(isCacheFree, cache_key_first, cache_key_second, callbackParam, requestTag, ajaxRecordIdx);
	
	//是否命中缓存
	if(!isCacheFree && fbs.cachePool[cache_key_first] && fbs.cachePool[cache_key_first][cache_key_second]){
		callback(fbs.cachePool[cache_key_first][cache_key_second]);
	} else {
        // 增加一个noloading参数 by huiyao
		fbs.request._post && fbs.request._post(postParam, callback, path, isNoLoading);
	}
};

/**
 * 向请求返回数据，调用回调函数
 * @param {Object} param
 * @param {Object} data
 * @author zuming@baidu.com
 */
fbs.request.response = function(param, data, path, baseParam) {
    setTimeout(function() {
        if(data.status == fbs.request.STAT_TIMEOUT){
            //超时优先判断，不被callback接管  by linzhifeng@baidu.com
            if (typeof param.onTimeout != 'undefined'){
                param.onTimeout(data)
            }else{
                //默认timeout处理函数
                fbs.request.timeoutHandler(path, baseParam);
            }
            fbs.request.failLog(data, path, baseParam,'timeout');
            return;
        }
        
        if(typeof param.callback != 'undefined'){
            param.callback(data);
            if(data.status != fbs.request.STAT_SUCC && data.status != fbs.request.STAT_EXCEED){
                fbs.request.failLog(data, path, baseParam);
            }
        }

        if ( (typeof param.onSuccess != 'undefined' && (data.status == fbs.request.STAT_SUCC || data.status == fbs.request.STAT_PART_SUCC || data.status == fbs.request.STAT_EXCEED)) ) {
            param.onSuccess(data);
        }
        if (typeof param.onFail != 'undefined' && data.status != fbs.request.STAT_SUCC && data.status != fbs.request.STAT_EXCEED) {
            param.onFail(data); 
            fbs.request.failLog(data, path, baseParam);
        }
        
        //如果没有指定错误处理函数
        if(typeof param.onFail == 'undefined' && typeof param.callback == 'undefined' && (data.status == fbs.request.STAT_EXCEPTION || data.status == fbs.request.STAT_PART_SUCC)){
            ajaxFailDialog();
            fbs.request.failLog(data, path, baseParam);
        } 
    }, 10);
}

/**
 * 请求失败发送监控
 * @param {Object} data		返回数据
 * @param {Object} path		请求地址
 * @param {Object} baseParam	参数
 * @param {Object} action    失败类型，默认failResponse，其他目前仅有timeout，再有就写配置项吧~
 * @author zhouyu01@baidu.com
 */
fbs.request.failLog = function(data, path, baseParam, action){
	var logParams = {
		action: action || "failResponse",
		path: decodeURIComponent(path),
		param: decodeURIComponent(baseParam),
		response: decodeURIComponent(baidu.json.stringify(data))
	};
	NIRVANA_LOG.send(logParams);
	
}


/**
 * 请求超时默认处理函数 
 * @param {Object} data
 * @param {Object} path
 * @param {Object} baseParam
 * @author linzhifeng@baidu.com
 */
fbs.request.timeoutHandler = function(path, baseParam){
    //监控已经在上面那个发了，目前啥都不干，留着用吧    
    //console.log('Timeout---------',path,baseParam);
}
// update:
//
// 2012-6-19 by zhujialu
//    fbs.request.response  模拟异步机制
//                          当本地开发时，因为使用本地数据，所以没有异步的过程，致使代码执行流程是同
//                          步的，即发完请求会直接走进onSuccess或onFail，然后再执行后面的代码，但是
//                          线上情况是，发完请求会产生异步的回调，这样代码的执行流程在本地和线上就不
//                          同了；
//                          而且，在线上如果接口有缓存，第一次请求是异步，第二次却成了同步，这样会产
//                          生很多问题，导致很多业务写了setTimeout去模拟异步，为了避免今后再写这种难
//                          看的代码，统一放在底层模拟
//   
//  2012-8-15 by zhujialu
//    fbs.request.response  上次模拟异步没彻底修好，漏掉了回调函数是 callback 的情况
//                          这次把整个 response 函数都放进 setTimeout 中了
