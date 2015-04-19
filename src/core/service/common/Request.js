/**
 * 业务层请求器
 */
var Request = (function(){
	
	/*
	 *  请求状态记录 ,格式为：
	 * status_map_[random_key] = {
	 * 		counter : 该次请求包含的子请求数量
	 * 		data : {
	 * 				level1 : {..},
	 * 				level2 : {..}
	 * 			}
	 * }
	 */
	var status_map_ = {},
		parse_,	//解析请求的方法
		getHandleSuccess_, //处理底层一次成功返回的方法
		getHandleFail_, //处理底层一次失败返回的方法
		getHandleTimeout_;
	
	nirvana.env.REQUEST_COUNTER = 0;//全局活动请求计数器
	
	/**
	 * 处理Requester成功的返回
	 * @param {Object} requestKey 所属批量请求的随机key
	 * @param {Object} level	单次请求对应的物料层级
	 * @param {Object} callback 所属批量请求的回调函数
	 */
	getHandleSuccess_ = function(requestKey, level, needLoading, callback){
		return function(data){
			
			if (data && data.redirect == "true"){
				//302捕捉
				if (data.redirecturl){
					window.location.href = data.redirecturl;
				}else{
					location.reload();
				}
				return;
			}
			if(needLoading && --nirvana.env.REQUEST_COUNTER <= 0){		
				nirvana.util.loading.done();
			}
			var mapItem = status_map_[requestKey];
			if(!mapItem.data[level]){
				mapItem.data[level] = data;
				if(--mapItem.counter == 0){ //所有批量请求都已经处理完成
                    callback(mapItem.data);
                    /**
					try { //ActionInstance可能已经不在了，因此Try掉
						callback(mapItem.data);
					}catch(ex){
						if(typeof IS_DEBUG_MODE != 'undefined'){ //在本地情况下抛出异常
							throw ex;
						}
					}
                    */
				}
			}
		}
	};
	
	/**
	 * 处理Requester失败的返回
	 * @param {Object} requestKey 所属批量请求的随机key
	 * @param {Object} level	单次请求对应的物料层级
	 * @param {Object} callback 所属批量请求的回调函数
	 */
	getHandleFail_ = function(requestKey, level, needLoading, callback){
		return function(data){
			/*
			if (data && data.data == "UC_FAIL"){
				//302捕捉
				location.reload();
				return;
			}
			*/
			
			if(needLoading && --nirvana.env.REQUEST_COUNTER <= 0){
				nirvana.util.loading.done();
			}
			if(!status_map_[requestKey]){	//批量请求中失败只做一次处理
				return;
			}
			delete status_map_[requestKey];
			// bug fix by linzhifeng@baidu.com
			var rel = {};
			rel[level] = {
				status : 500 // 从600改为500 请求失败，很可能是BFE等服务挂了，依然认为是服务器端异常导致的失败 by Leo Wang
			}
			callback(rel);
		}
	};
	
	/**
     * 处理Requester失败的返回
     * @param {Object} requestKey 所属批量请求的随机key
     * @param {Object} level    单次请求对应的物料层级
     * @param {Object} callback 所属批量请求的回调函数
     * @author linzhifeng@baidu.com
     */
    getHandleTimeout_ = function(requestKey, level, needLoading, callback){
        return function(data){
            if(needLoading && --nirvana.env.REQUEST_COUNTER <= 0){
                nirvana.util.loading.done();
            }
            if(!status_map_[requestKey]){   //批量请求中失败只做一次处理
                return;
            }
            delete status_map_[requestKey];
            var rel = {};
            rel[level] = {
                status : 900
            }
            callback(rel);
            
		}
	};

    // 增加一个noloading参数 by huiyao
	parse_ = function(json, callback, path, noloading){
		path = path || fbs.config.path.ADV_PATH; //不写path时默认推广管理的上帝方法
		
		var requestKey = er.random(), //每次batch请求生成唯一key
			counter = 0,
			needLoading = baidu.array.indexOf(fbs.config.noLoading, path) == -1; // 不需要loading的path在fbs.config中配置

        // 如果没有设置noLoading，则采用默认的needLoading以兼容现有的配置 by Huiyao
        needLoading = noloading ? false : needLoading;

		//循环一次算length	
		for (var level in json) {
			counter++;
			/**
			 * nirvana.env.REQUEST_COUNTER记的是录需要loading的ajax请求！否则就noloading配置项纯粹摆设没起作用！后同
			 * bug fixed by linzhifeng@baidu.com
			 */ 
			needLoading && nirvana.env.REQUEST_COUNTER++;
		}
		
		
		if(counter == 0){ //如果请求的参数为空，构造一个假的
			counter = 1;
			needLoading && nirvana.env.REQUEST_COUNTER++;
			json = {_void:{}};
		}
			
		//在status_map_中注册该次批量请求
		status_map_[requestKey] = {
			counter : counter,
			data : {}
		}
		
		if (needLoading) {
			nirvana.util.loading.init();
		}
		
		//分拆各层级请求为多个请求
		if (nirvana.env.SCOOKIE){
			//多窗口多用户多类型支持
		    baidu.cookie.setRaw('SAMPLING_COOKIE', nirvana.env.SCOOKIE, {path: '/'});
		}
		//BFE小流量转发策略支持 by linzhifeng@baidu.com 2012-12-18
		baidu.cookie.setRaw('SAMPLING_USER_ID', nirvana.env.USER_ID, {path: '/'});
		
		for (var level in json){
			Requester.send(path, level, json[level], getHandleSuccess_(requestKey, level, needLoading, callback), getHandleFail_(requestKey, level, needLoading, callback), getHandleTimeout_(requestKey, level, needLoading, callback));
		}
		return true;
	}
	// modified by huiyao:直接将parse_返回，为啥还要在包装一下，没必要啊
	return parse_;/*function(json, callback, path){
		return parse_(json, callback, path);
	}*/
})();
