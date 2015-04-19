
/**
 * 本地调试用的数据生成器
 * 重写线上真正使用的Requester
 * @author tongyao@baidu.com
 */
Requester = {};
Requester.send = function(path, level, param, successCallback, failureCallback){
	// 将请求的path的slash替换为下划线
	path = path.replace(/\//g, '_');
 
	// 如果打开调试输出log，对于非IE浏览器会输出请求的path和param信息
	if(Requester.debug.log && ! ('ie' in baidu.browser)){
		console.log({
			'path_POST' : path,
			'param' : param
		})
	}
	
	if (Requester.debug[path]){
		// 存在数据请求模拟接口定义，执行
		var json = Requester.debug[path](level, param);
		
		if (json.timeout) {
			// 模拟数据请求延时 
			setTimeout( function(){
		            successCallback && successCallback(json);
		        }, +json.timeout);
		} else {
			successCallback && successCallback(json);
		}
	} else {
		// 未定义数据请求的模拟接口，直接调用成功的回调函数，响应一个空的数据对象
		successCallback && successCallback({});
	}	
};

