/**
 * fbs.interface
 * @author zuming@baidu.com
 */


fbs = fbs || {};

/**
 * fbs.interFace的封装，此外，也是为了解决把freeCache, noLoading的配置被剥离到config.js
 * 里的问题，导致一个service的配置变得比较分散，使得代码可读性降低。<br/>
 * NOTICE: 该方法默认是不使用缓存的，跟原来的逻辑不一样，原来是默认使用缓存;noloading跟原来
 * 一样还是默认会使用全局锁屏。
 * @param {Object} options 同原有的fbs.interFace方法
 * @param {boolean} options.nocache 是否不使用缓存，默认不使用
 * @param {boolean} options.noloading 是否请求时候不使用全局锁屏，默认使用
 * @return {Function}
 * @example
 *      fbs.myRequester = fbs.requester({
 *          path: 'GET/XXX',
 *          nocache: false,
 *          noloading: true
 *          ...
 *      });
 *      // 发送请求
 *      fbs.myRequester({
 *          onSuccess: function(){},
 *          ...
 *      });
 * @author Wu Huiyao (wuhuiyao@baidu.com)
 */
fbs.requester = function(options) {
    var defaultParam = {
        nocache: true,
        noloading: false
    };

    for (var k in defaultParam) {
        if (typeof options[k] !== 'undefined') {
            defaultParam[k] = options[k];
            delete options[k];
        }
    }

    var requestFunc = fbs.interFace(options);
    return function(param) {
        param = nirvana.util.extend(param, defaultParam);
        requestFunc(param);
    };
};

/**
 * 通用接口工厂
 * @author zuming@baidu.com
 */
fbs.interFace = function(param) {
	if (typeof param == 'undefined') {
		return "lack parameter";
	}
	if (fbs.interFace.validateConstructParam(param) != "parameter is valid") {
		return fbs.interFace.validateConstructParam(param);
	}
	fbs.interFace.omitParam(param);
	return fbs.interFace.factory(param);
};

/**
 * 创建接口方法的具体方法
 * @param {Object} facParam
 */
fbs.interFace.factory = function (facParam) {
	var rel = function(p) {
		var _me = arguments.callee;
		var _npErrorList = {};
		var _vaErrorList = {};
		
		// 判断参数是否完整
		if (fbs.interFace.validateNecessaryParam(p, _me.facParam) != "parameter is valid") {
			_npErrorList = fbs.interFace.validateNecessaryParam(p, _me.facParam);
		}
		if (!fbs.util.isEmptyObject(_npErrorList)) {
			fbs.interFace.errorHandle(p, facParam, _npErrorList);
			return;
		}
		
		// 判断参数是否符合业务规则
		if (typeof _me.facParam.validate != 'undefined') {
			_vaErrorList = _me.facParam.validate(p);
			for (key in _vaErrorList) {
				if (_vaErrorList[key] === true) {
					delete _vaErrorList[key];
				}
			}
		}
		if (!fbs.util.isEmptyObject(_vaErrorList)) {
			fbs.interFace.errorHandle(p, facParam, _vaErrorList);
			return;
		}
		
		// 做具体的事情
		if (typeof _me.facParam.fn != 'undefined') {
			p.path = _me.facParam.path;
			return _me.facParam.fn(p || null);
		} else {
			return fbs.interFace.doRequest(p || null, _me.facParam);
		}
	};
	
	rel.clearCache = fbs.interFace.addClearCacheMethod(facParam.path || 'default_path');
	rel.ModCache = fbs.interFace.addModCacheMethod(facParam.path || 'default_path');
	rel.facParam = facParam;
	return rel;
};
/**
 * 通用接口工厂，只执行验证部分
 * @author mayue
 */
fbs.valinterFace = function(param) {
    if (typeof param == 'undefined') {
        return "lack parameter";
    }
    if (fbs.interFace.validateConstructParam(param) != "parameter is valid") {
        return fbs.interFace.validateConstructParam(param);
    }
    fbs.interFace.omitParam(param);
    return fbs.valinterFace.factory(param);
};
/**
 * 创建接口方法的具体方法，只会执行验证部分
 * @param {Object} facParam 
 * @author mayue
 */
fbs.valinterFace.factory = function (facParam) {
    var rel = function(p) {
        var _me = arguments.callee;
        var _npErrorList = {};
        var _vaErrorList = {};
        
        // 判断参数是否完整
        if (fbs.interFace.validateNecessaryParam(p, _me.facParam) != "parameter is valid") {
            _npErrorList = fbs.interFace.validateNecessaryParam(p, _me.facParam);
        }
        if (!fbs.util.isEmptyObject(_npErrorList)) {
            fbs.interFace.errorHandle(p, facParam, _npErrorList);
            return;
        }
        
        // 判断参数是否符合业务规则
        if (typeof _me.facParam.validate != 'undefined') {
            _vaErrorList = _me.facParam.validate(p);
            for (key in _vaErrorList) {
                if (_vaErrorList[key] === true) {
                    delete _vaErrorList[key];
                }
            }
        }
        if (!fbs.util.isEmptyObject(_vaErrorList)) {
            fbs.interFace.errorHandle(p, facParam, _vaErrorList);
            return;
        }
        
        p.onSuccess && p.onSuccess.call();
    };
    
    rel.clearCache = fbs.interFace.addClearCacheMethod(facParam.path || 'default_path');
    rel.ModCache = fbs.interFace.addModCacheMethod(facParam.path || 'default_path');
    rel.facParam = facParam;
    return rel;
};
/**
 * 错误处理
 */
fbs.interFace.errorHandle = function(p, facParam, errorList) {
	var path = facParam.path;
	//根据path类型决定错误处理函数类型（单一/批量）
	if (path.indexOf('MOD') != -1) {
		switch (path) {
			case fbs.config.path.MOD_KEYWORD_DIFFBID_PATH :
				// 太太太太太太恶心了。。。。
				fbs.interFace.modKeywordDiffBid(p, errorList);
				break;
			case fbs.config.path.MOD_REPORT_CYCLEINFO :
				// 修改循环报告参数，错误是前端处理的，直接用单个错误，后端错误只有status=500 add by wanghuijun
				fbs.interFace.singleErrorHandle(p, errorList);
				break;
			default :
				fbs.interFace.batchErrorHandle(p, errorList);
				break;
		}
	} else if (path == fbs.config.path.ADD_KEYWORD_PATH || path == fbs.config.path.ADD_NIKON_WORDS){
		fbs.interFace.addKeywordsErrorHandle(p, errorList);
	} else {
		fbs.interFace.singleErrorHandle(p, errorList);
	}
}

/**
 * 验证初始化接口时候的参数是否合法
 * @param {Object} param {
 * 		nameSpace {String}
 * 		interFaceName {String}
 * 		path {String}
 * 		aspect {Function}
 * 		cache {Object}
 * 		cacheKey {Function}
 * }
 * @author zuming@baidu.com
 */
fbs.interFace.validateConstructParam = function (param) {
	if (typeof param.path != "undefined" && typeof param.path != "string") {
		return "path is not string";
	}
	if (typeof param.aspect != 'undefined' && !fbs.util.isFunction(param.aspect)) {
		return "aspect is not Function";
	}
	if (typeof param.parameterAdapter != "undefined" && !fbs.util.isFunction(param.parameterAdapter)) {
		return "parameterAdapter is no Function";
	}
	if (typeof param.validate != "undefined" && !fbs.util.isFunction(param.validate)) {
		return "validate is no Function";
	}
	if (typeof param.cache != "undefined") {
		if (typeof param.cacheKey != "undefined" && !fbs.util.isFunction(param.cacheKey)) {
			return "cache's cacheKe is not function";
		}
	}
	return "parameter is valid";
};

/**
 * 删除一些不必要的参数
 * @param {Object} param
 */
fbs.interFace.omitParam = function(param) {
	if (typeof param.necessaryParam != 'undefined') {
		var hasAttribute = false;
		for (k in param.necessaryParam) {
			hasAttribute = true;
			break;
		}
		hasAttribute || delete param.necessaryParam
	}
	
	if (typeof param.optionalParam != 'undefined') {
		var hasAttribute = false;
		for (k in param.optionalParam) {
			hasAttribute = true;
			break;
		}
		hasAttribute || delete param.optionalParam
	}
};

/**
 * 具体验证接口参数的函数
 * @param {Object} errList 错误列表
 * @param {Object} recureParam 递归传递的参数
 * @param {Object} validateParam 被验证的参数
 * @param {Object} paramDef 定义接口时的参数
 * @param {Object} isNece 是否是必要参数
 * @author zuming@baidu.com
 */
fbs.interFace.validateParam = function(errList, recureParam, validateParam, paramDef, isNece) {
	for (key in paramDef) {
		if (typeof recureParam[key] == "undefined") {
			if (isNece) {
				errList[key] = "LACK";
			} 
		} else {
			if (paramDef[key].constructor == Object) {
				fbs.interFace.validateParam(errList, recureParam[key], validateParam, paramDef[key], isNece);
			} else {
//				if (fbs.util.isFunction(paramDef[key]) && paramDef[key](validateParam) !== true) {
//					errList[key] = paramDef[key](validateParam);
//				}
			}
		}
	}
};

/**
 * 验证下必要参数是否全部都存在，并且是否都合法
 * @param {Object} param
 * @author zuming@baidu.com
 */
fbs.interFace.validateNecessaryParam = function (param, facParam) {
	var errList = {};
	if (typeof facParam.necessaryParam != 'undefined') {
		if (typeof param == 'undefined') {
			return "lack parameters";
		}
		if (typeof param != "object") {
			return "parameters is not Object";
		}
		fbs.interFace.validateParam(errList, param, param, facParam.necessaryParam, true);
	}
	if (fbs.util.isEmptyObject(errList)) {
		return "parameter is valid";
	} else {
		return errList;
	}
};

/**
 * 验证传进来的非必要参数是否合法
 * @param {Object} param
 * @author zuming@baidu.com
 */
fbs.interFace.validateOptionalParam = function (param, facParam) {
	var errList = {};
	if (typeof facParam.optionalParam != 'undefined') {
		fbs.interFace.validateParam(errList, param, param, facParam.optionalParam, false);
	}
	if (fbs.util.isEmptyObject(errList)) {
		return "parameter is valid";
	} else {
		return errList;
	}
};

/**
 * 接口实现的默认方法
 * @param {Object} param
 */
fbs.interFace.doRequest = function(param, facParam) {
	if (typeof facParam.parameterAdapter != 'undefined') {
		param = facParam.parameterAdapter(param);
	}
	param.path = facParam.path;
	if (typeof facParam.aspect != 'undefined') {
		fbs.interFace.aspectHandle(param, facParam);
	}/* else if (typeof facParam.cache != 'undefined') {
		fbs.interFace.cacheHandle(param, facParam);
	}*/ else {
		fbs.request.send(param);
	}
};

/**
 * 切面处理
 * @param {Object} param
 * @param {Object} facParam
 */
fbs.interFace.aspectHandle = function(param, facParam) {
	var callbackParam = {};
	for (key in param) {
		if (key == 'callback' || key == 'onSuccess' || key == 'onFail') {
			callbackParam[key] = param[key];
		}
	}
	param.callback &&
	(param.callback = function(data) {
		facParam.aspect(param, data);
		callbackParam.callback(data);
	});
	param.onSuccess &&
	(param.onSuccess = function(data) {
		facParam.aspect(param, data);
		callbackParam.onSuccess(data);
	});
	fbs.request.send(param);
};

/**
 * 批量类型错误处理
 * @param {Object} param
 * @param {Object} errorList 错误
 * @author tongyao@baidu.com
 */
fbs.interFace.batchErrorHandle = function(param, errorList) {
	var errorMsg = {
		status : 400,
		data : null,
		error : {}
	};
	
	//根据参数中是否有各层级id，构造错误返回结构。没有层级id时认为账户层级
	var level = param.planid || param.unitid || param.winfoid || param.ideainfoid || [nirvana.env.USER_ID];
	
	if(!baidu.lang.isArray(level)){
		level = [level];
	}
	
	for (var i = 0, l = level.length; i < l; i++){
		
		errorMsg.error[level[i]] = {};
		
		for (var key in errorList) {
			errorMsg.error[level[i]][key] = {
				code : errorList[key],
				detail : null,
				idx : 0,
				message : null
			};
		}
	}
	
	if (typeof param.onFail != "undefined") {
		param.onFail(errorMsg);
		return;
	} else if (typeof param.callback != "undefined"){
		param.callback(errorMsg);
		return;
	}
}


/**
 * 单一类型错误处理
 * @param {Object} param
 * @param {Object} errorList 错误
 * @author tongyao@baidu.com
 */
fbs.interFace.singleErrorHandle = function(param, errorList) {
	var errorMsg = {
		status: 400,
		errorCode: {}
	}
	for (var key in errorList) {
		errorMsg.errorCode[key] = errorList[key];
	}

	if (typeof param.onFail != "undefined") {
		param.onFail(errorMsg);
		return;
	} else if (typeof param.callback != "undefined"){
		param.callback(errorMsg);
		return;
	}
}

/**
 * 批量修改不同出价的错误信息处理
 * @param {Object} param
 * @param {Object} errorList
 */
fbs.interFace.modKeywordDiffBid = function(param, errorList) {
	var errorMsg = {
		status : 400,
		data : null,
		error : {}
	};
	errorMsg.error = errorList;
	if (typeof param.onFail != "undefined") {
		param.onFail(errorMsg);
		return;
	} else if (typeof param.callback != "undefined"){
		param.callback(errorMsg);
		return;
	}
}


/**
 * 添加关键词特殊的错误处理，这个太恶心了 回头让曾黎改..
 * @param {Object} param
 * @param {Object} errorList 错误
 * @author tongyao@baidu.com
 */
fbs.interFace.addKeywordsErrorHandle = function(param, errorList) {
	var errorMsg = {
		status : 400,
		data : null,
		error : {}
	};
	
	//根据参数中是否有各层级id，构造错误返回结构。没有层级id时认为账户层级
	/*
	var level = param.planid || param.unitid || param.winfoid || param.ideainfoid || [nirvana.env.USER_ID];
	
	if(!fbs.util.isArray(level)){
		level = [level];
	}
	
	for (var i = 0, l = level.length; i < l; i++){
		errorMsg.error[level[i]] = {};
		
		for (var key in errorList) {
			errorMsg.error[level[i]] = {
				code : errorList[key],
				detail : null,
				idx : 0,
				message : null
			};
		}
	}
	*/
	errorMsg.error = [];
	for (var key in errorList) {
		for (var i = 0, l = errorList[key].length; i < l; i++){
			errorMsg.error.push({
				code : errorList[key][i].code,
				detail : null,
				idx : errorList[key][i].idx,
				message : null
			});
		}
	}
	
	if (typeof param.onFail != "undefined") {
		param.onFail(errorMsg);
		return;
	} else if (typeof param.callback != "undefined"){
		param.callback(errorMsg);
		return;
	}
}

/**
 * 带缓存处理的接口实现处理方法
 * 注意注意！！！！！！
 * 		缓存只提供读操作时更新
 * 		建议就是简单的读取业务可以使用interFace的缓存功能
 * 		增、删、修改都请在各自aspect里做吧
 * @param {Object} param
 * @author zuming@baidu.com
 */
fbs.interFace.cacheHandle = function(param, facParam) {
	var cache = facParam.cache;
	var cacheKey = "data";
	if (typeof facParam.cacheKey != "undefined") {
		cacheKey = facParam.cacheKey(param);
	}
	if (typeof param.noCache == "undefined" && cache[cacheKey] && cache[cacheKey].status == fbs.request.STAT_SUCC) {
		fbs.request.response(param, cache[cacheKey]);
	} else {
		var callbackParam = {};
		for (key in param) {
			if (key == 'callback' || key == 'onSuccess' || key == 'onFail') {
				callbackParam[key] = param[key];
			}
		}
		param.callback &&
		(param.callback = function(data) {
			cache[cacheKey] = data;
			callbackParam.callback(data);
		});
		param.onSuccess &&
		(param.onSuccess = function(data) {
			cache[cacheKey] = data;
			callbackParam.onSuccess(data);
		});
		fbs.request.send(param);
	}
}

/**
 * 清楚缓存方法，给每个方法比如 fbs.Class.method增加一个fbs.class.method.clearCache()的方法，清楚缓存
 * @param {Object} facParam
 * @author zuming@baidu.com
 */
fbs.interFace.addClearCacheMethod = function(cache_key_first) {
	return function() {
		fbs.cachePool[cache_key_first] = {};
	}
}

/**
 * 修改缓存方法，给每个方法比如 fbs.Class.method增加一个fbs.class.method.ModCache()的方法，适用于返回数据为response.data.listData的get方法
 * @param {Object} facParam
 * @author zhouyu01@baidu.com
 */
fbs.interFace.addModCacheMethod = function(cache_key_first) {
	return function(key, modValue, type) {
		var cache_value_first = fbs.cachePool[cache_key_first],
			type = type || "mod";
	/*	if(cache_value_first){
			for(var item in cache_value_first){
				console.log(item);
			}
		}*/
		switch(type){
			case "mod":
				fbs.interFace.editCacheItemsMethod(cache_value_first, key, modValue);
				break;
			case "delete":
				fbs.interFace.deleteCacheItemsMethod(cache_value_first, key, modValue);
				break;
		}
	}
}

/**
 * 修改缓存项的值
 * @param {Object} cache_value_first
 * @param {Object} key	用于标识每条数据的字段，不一定唯一
 * @param {Object} modValue	{key对应的值：该条数据中需要修改的字段（名值对）;}
 */
fbs.interFace.editCacheItemsMethod = function(cache_value_first, key, modValue){
        baidu.object.each(cache_value_first,function(cache_value_second,item){
            baidu.object.each(cache_value_second,function(cache_value_third){
               var cacheData = cache_value_third.data ? (cache_value_third.data.listData?cache_value_third.data.listData:cache_value_third.data) : [];//本地创意的列表时返回的数据没有Listdata yanlingling
                if (!cacheData || cacheData.length <= 0 || typeof(cacheData[0][key]) == "undefined") {
                    return;
                }
                var len = cacheData.length, alterData = {};
                for (var item in modValue) { //需要修改的数据其唯一标识字段的值构成数组alterData
                    alterData[item] = true;
                } 
               for (var i = 0; i < len; i++) {
                    if (alterData[+cacheData[i][key]] || alterData[cacheData[i][key] + ""]) { //如果是需要修改的数据
                        var dat = modValue[cacheData[i][key]];
                        for (var item in dat) { //遍历需要修改的字段
                        //  if (typeof(cacheData[i][item]) != "undefined") {    //2011/3/31 modify: 如果存在修改的字段则修改，否则增加字段
                                cacheData[i][item] = dat[item]; 
                        //  }
                        }
                    }
                }
            })
        });
}

/**
 * 删除缓存数据中若干项，只使用于在删除某层物料时调用该方法删除其下层物料缓存数据
 * @param {Object} cache_value_first
 * @param {Object} key	用于标识每条数据的字段，不一定唯一
 * @param {Object} modValue	需要删除的数据其key字段的值，数组
 */
fbs.interFace.deleteCacheItemsMethod = function(cache_value_first, key, modValue){
		baidu.object.each(cache_value_first,function(cache_value_second){
			baidu.object.each(cache_value_second,function(cache_value_third){
				var cacheData = cache_value_third.data ? cache_value_third.data.listData : [];
				if (!cacheData || cacheData.length <= 0 || typeof(cacheData[0][key]) == "undefined") {
					return;
				}
				var len = modValue.length, alterData = {};
				for (var i = 0; i < len; i++) {
					alterData[modValue[i]] = true;
				}
				baidu.array.remove(cacheData, function(item){
					if (alterData[item[key]]) {
						return true;
					}
				});
			})
		});
}
