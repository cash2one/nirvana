/**
 * @file   模块加载，模块资源包括tpl、css和js文件（按照tpl > css > js的顺序加载）
 * @param  {string} moduleConfig 模块资源，支持两种类型：
 * 			1、字符串类型，表示模块名称，通过名称+后缀（html、js、css）的方式去获取资源
 * 			2、对象类型，则格式为{tplList:[""], cssList:[""], jsList:[""]},
 * 					可以只请求一种类型的资源，每种类型可请求多个文件;
 * 					若某类资源只有一个，可以直接赋值为字符串
 * 					cssList和jsList参数更多支持类型请参考FileLoader.js
 * @param  {string} callback 回调方法
 *			一般来说找个合适的机会加载一次就行，回调方法固定。
 *			若某个模块的入口比较多，需要在多处都加载，加载器会记住资源已请求状态，已请求的不会多次请求。不同入口的回调允许不同
 * 
 * 	本方法初衷是把凤巢实验室部分独立出来，因为凤巢实验室为主导航，内容会越来越多，但并不是所有用户可用
 *  建议：
 *  	小功能的话动态加载js即可，css和tpl不用拆的太细
 * 
 * @author zhouyu01@baidu.com
 * @date   2012/12/19
 */

nirvana.moduleResources = (function(){
	var loadedMap = {};
	var pathParams = getPathParams();
	var timeStamp = pathParams.timeStamp;
	var expVersion = pathParams.expVersion;
	
	/**
	 * 获取静态资源时间戳
	 * 读取core.js文件中的时间戳,不用像其他静态资源一样依赖于jar包生成
	 */
	function getPathParams(){
		var scripts = document.getElementsByTagName("script");
		var pattern = /asset(-exp[\w]+)?\/js\/core([\w]*).js$/g;
		var source;
		for (var i = 0, len = scripts.length; i < len; i++) {
			source = baidu.getAttr(scripts[i],"src");
            if (source && pattern.test(source)) {
                return {
                    timeStamp: RegExp.$2 ? RegExp.$2 : "",
                    expVersion: RegExp.$1 ? RegExp.$1 : ""
                }
            }
		}
		return {
			timeStamp: "",
			expVersion: ""
		};
	}
	
	/**
	 * 给js和css文件名加上时间戳
	 * @param {Object} fileset
	 */
	function rename(fileset){
		var pattern = /([^\/]+)(\.(?:js|css|html))/g;
		if (typeof(fileset) == "string") {
			if(pattern.test(fileset)){
				return [fileset.replace(pattern, 
							RegExp.$1 + timeStamp + RegExp.$2)];
			}
		}
		if (fileset instanceof Array) {
			for (var i = 0, length = fileset.length; i < length; i++) {
				if (pattern.test(fileset[i])) {
					fileset[i] = fileset[i].replace(pattern, 
									RegExp.$1 + timeStamp + RegExp.$2);
				}
			}
		}
		return fileset;
	}
	
	/**
	 * 统一文件格式
	 * @param {Object} moduleConfig
	 */
	function formatParams(moduleConfig, clazz){
		//只有模块名
		if (typeof(moduleConfig) == "string") {
			var moduleName = moduleConfig + timeStamp;
			return {
				tplFiles: clazz.getTplList(moduleName),
				cssFiles: clazz.getCssList(moduleName),
				jsFiles: clazz.getJsList(moduleName)
			}
		}
		else {
			return {
				tplFiles: rename(moduleConfig.tplList),
				cssFiles: rename(moduleConfig.cssList),
				jsFiles: rename(moduleConfig.jsList)
			}
		}
	}
	

	/**
	 * 获取模块模板，数据还是要存放在er.template中
	 * @param {Object} files
	 * @param {Object} callback
	 */
	function getTemplate(files, callback){
		var list = files.tplFiles;
		var options = {
			cssFiles: files.cssFiles,
			jsFiles: files.jsFiles
		};
		var len = list.length;
		var i = 0;
		loadTemplate();
		//加载模板成功的回调函数
		function successCallback(xhr){
			loadedMap[list[i]] = true;
			er.template.parse(xhr.responseText);
			loadedCallback();
		}
		
		//每条模板加载完毕的处理函数
		function loadedCallback(){
			i++;
			
			if (i >= len) {
				$Source.include(options, callback);
			}
			else {
				loadTemplate();
			}
		}
		
		//加载模板
		function loadTemplate(){
			if (!loadedMap[list[i]]) {
				baidu.ajax.request(list[i], {
					'method': 'get',
					'onsuccess': successCallback,
					'onfailure': loadedCallback
				});
			}
		}
	}

	return {
		/**
		 * 加载模块资源,按照tpl > css > js的顺序加载
		 * @param {Object} moduleConfig 资源列表
		 * @param {Object} callback
		 */
		load: function(moduleConfig, callback){
			getTemplate(formatParams(moduleConfig, this), callback);
		},
		
		/**
		 * 构建tpl文件列表,开放接口，方便本地环境重写方法，用于本地测试
		 * @param {Object} moduleName
		 */
		getTplList: function(moduleName){
			return ['asset' + expVersion + '/tpl/' + moduleName + '.html'];
		},
		
			

		/**
		 * 构建css文件列表
		 * @param {Object} moduleName
		 */
	 	getCssList: function(moduleName){
			return ['asset' + expVersion + '/css/' + moduleName + '.css'];
		},
	
	
	
		
		/**
		 * 构建js文件列表,开放接口，方便本地环境重写方法，用于本地测试
		 * @param {Object} moduleName
		 */
		getJsList: function(moduleName){
			return ['asset' + expVersion + '/js/' + moduleName + '.js'];
		}
	}
})();
