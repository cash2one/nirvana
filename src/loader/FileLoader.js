/*
*JS、CSS文件动态加载工具
* 使用方法
* $Source.include(options, callback)
* 
* options:
* 	格式一：直接写字符串，每个文件名之间用逗号隔开，这种格式的JS文件之间不存在依赖性
* 					"a.css, b.js, c.js, d.css"
* 	格式二：对象，包含一个CSS文件和一个JS文件
* 					{cssFiles:"", jsFiles:""}
* 	格式三：对象，包含CSS和JS文件数组，数组元素为字符串，一个元素代表一个文件，JS文件之间不存在依赖性
* 					{cssFiles:[""], jsFiles:["a.js", "b.js"]}
* 	格式四：对象，同样有cssFiles和jsFiles属性，cssFiles格式见以上格式二和格式三
* 				 jsFiles为以数组为元素的数组,每个元素为以逗号隔开的js文件路径组成的字符串
* 				   以下jsFiles值表示c.js和d.js文件依赖于a.js和b.js
* 					{cssFiles:"", jsFiles:[["a.js,b.js"], ["c.js,d.js"]]}
* 					{cssFiles:[""], jsFiles:[["a.js,b.js"], ["c.js,d.js"]]}
* 
* callback: 
* 	所有文件加载完毕后的回调函数
* 
* 待升级点：
* 	有一个文件加载失败就会阻塞其他文件的加载（是否应该阻塞？？）
* 
* author：zhouyu01@baidu.com
* date：2012/12/18
*/
var $Source = (function(){
	//文件加载状态，与依赖无关
	var fileStat = {};
		fileStat.css = {};
		fileStat.js = {};
	//是否存在依赖	
	var dependent = false;	
	//按照依赖文件顺序记录文件加载状态
	var dependSequency = [];	
	//当前加载的无依赖JS集
	var currentJsSet = [];	
	/**
	 * 统一参数格式
	 * @param {Object} files
	 */
	function formatFiles(files){
		var cssFiles = [];
		var jsFiles = [];
		switch (typeof(files)) {
			case "string"://格式一
				var pattern = /[^\/]+\.(js|css)(?:\?\.*)?/g;
				for (var i = 0, len = files.length; i < len; i++) {
					if (pattern.test(files[i])) {
						switch (RegExp.$1) {
							case "css":
								cssFiles.push(files[i]);
								break;
							case "js":
								jsFiles.push(files[i]);
								break;
						}
					}
				}
				break;
			case "object":
				var css = files.cssFiles;
				var js = files.jsFiles;
				if (css) {
					cssFiles = typeof(css) == "string" ? [css] : css;
				}
				if (js) {
					jsFiles = typeof(js) == "string" ? [js] : js;
				}
				break;
			default:
				break;
		}
		return {
			cssFiles: cssFiles,
			jsFiles: jsFiles
		};
	}
	
	
	
	/**
	 * 初始化文件加载状态
	 * @param {Object} files 文件列表
	 */
	function initFileStat(files){
		var cssfiles = files.cssFiles;
		var jsfiles = files.jsFiles;
		
		//恢复默认值
		dependent = false;
		fileStat.css = {};
		fileStat.js = {};
		dependSequency = [];
		currentJsSet = [];
		
		for (var i = 0, len = cssfiles.length; i < len; i++) {
			fileStat.css[cssfiles[i]] = false;
		}
		
		for (var i = 0, len = jsfiles.length; i < len; i++) {
			var item = jsfiles[i];
			var dependSeqItem = {};
			if (Object.prototype.toString.call(item) === "[object Array]") {
				dependent = true;//存在依赖
				for (var j = 0, l = item.length; j < l; j++) {
					fileStat.js[item[j]] = false;
					dependSeqItem[item[j]] = false;
				}
			}
			else {
				fileStat.js[item] = false;
				dependSeqItem[item] = false;
			}
			//若dependent为false，此数组无用
			dependSequency.push(dependSeqItem);
		}
	}
	
		

	/**
	 * 加载CSS文件
	 * @param {Object} cssurls
	 * @param {Object} callback
	 */
	function loadCssFile(cssurls, callback){
		var len = cssurls.length;
		if (len == 0) {
			callback();
			return;
		}
        for (var i = 0; i < len; i++) {
			if (!containFile("link", cssurls[i])) {
				var cssElem = document.createElement("link");
				cssElem.setAttribute('type', 'text/css');
				cssElem.setAttribute('rel', 'stylesheet');
				cssElem.setAttribute('href', cssurls[i]);
				loadFile(cssElem, cssurls[i], 'css', callback, "head");
			}
			else {
				fileStat.css[cssurls[i]] = true;
			}
		}
	}
	

	/**
	 * 加载JS文件
	 * @param {Object} jsurls
	 * @param {Object} callback
	 */
	function loadJsFile(jsurls, callback){
		var len = jsurls.length;
		if (len == 0) {
			callback();
			return;
		}
		if (!dependent) {
			loadNoDependJs(jsurls, callback);
			return;
		}
		currentJsSet = dependSequency.shift();
		if (len == 1) {
			loadNoDependJs(jsurls[0], callback);
		}
		else {
			loadNoDependJs(jsurls.shift(), function(){
				loadJsFile(jsurls, callback);
			});
		}
	}
	
	/**
	 * 加载无依赖的JS文件
	 * @param {Object} jsurls
	 * @param {Object} callback
	 */
	function loadNoDependJs(jsurls, callback){
		var len = jsurls.length;
		for (var i = 0; i < len; i++) {
			if (!containFile("script", jsurls[i])) {
				var scriptElem = document.createElement("script");
				scriptElem.setAttribute('type', 'text/javascript');
				scriptElem.setAttribute('src', jsurls[i]);
				loadFile(scriptElem, jsurls[i], 'js', callback, "body");
			}
			else {
				fileStat.js[jsurls[i]] = true;
			}
		}
	}

	/**
	 * 是否已包含要加载的文件
	 * @param {Object} tag 文件类型
	 * @param {Object} url 文件路径
	 */
	function containFile(tag, url){
		var contains = false;
		var files = document.getElementsByTagName(tag);
		var type = tag == "script" ? "src" : "href";
		for (var i = 0, len = files.length; i < len; i++) {
			if (files[i].getAttribute(type) == url) {
				contains = true;
				break;
			}
		}
		return contains;
	}
	
	

	/**
	 * 加载文件，并执行回调
	 * @param {Object} element 	script/link对象
	 * @param {Object} url		js/css路径
	 * @param {Object} type		js/css
	 * @param {Object} callback	回调方法
	 * @param {Object} parent	script/link对象父节点
	 */
	function loadFile(element, url, type, callback, parent){
		var parentElem = document.getElementsByTagName(parent || "head")[0];
		parentElem && parentElem.appendChild(element);
		switch (type) {
			case "css":
				var regex = /^\w+\:\/\//;
				if (regex.test(url)) {
					// css加载完毕
					function cssLoaded(){
						fileStat.css[url] = true;
						doCallback("css", callback);
					}
					if (baidu.browser.safari || baidu.browser.maxthon) {
						cssLoaded();
					}
					else {
						if (element.attachEvent) {
							element.attachEvent("onload", cssLoaded);
						}
						else {
							element.addEventListener("load", cssLoaded, false);
						}
					}
				}
				else {
					cssIsLoaded(element, url, callback);
				}
				return;
			case "js":
				jsIsLoaded(element, url, callback);
				return ;			
		}
	}
	

	
	/**
	 * 判断css是否已加载成功
	 * @param {Object} element
	 * @param {Object} url
	 * @param {Object} callback
	 */
	function cssIsLoaded(element, url, callback){
		var cssLoaded = 0;
		try {
			if (element.sheet && element.sheet.cssRules.length > 0				//	IE9/chrome/FF/safari/opera
			 || element.styleSheet && element.styleSheet.cssText.length > 0		//	IE6/IE7/IE8
			 || element.innerHTML && element.innerHTML.length > 0) {
					cssLoaded = 1;
			}
		} catch (ex) {}
		
		if (cssLoaded) {
			fileStat.css[url] = true;
			doCallback("css", callback);
		}
		else {
			setTimeout(function(){
				cssIsLoaded(element, url, callback);
			}, 50);
		}
	}
	
	/**
	 * 判断js是否加载成功
	 * @param {Object} element
	 * @param {Object} url
	 * @param {Object} callback
	 */
    function jsIsLoaded(element, url, callback){
        if (callback) {
            var scriptLoaded = 0;
            element.onload = element.onreadystatechange = function(){
                if (scriptLoaded) {
                    return;
                }
                var readyState = element.readyState;
                if ('undefined' == typeof readyState 
							|| readyState == "loaded" 
							|| readyState == "complete"
				){
                    scriptLoaded = 1;
                    try {
						if (dependent && currentJsSet
								&& typeof(currentJsSet[url]) != "undefined") {
							currentJsSet[url] = true;
						}
						fileStat.js[url] = true;
						doCallback("js", callback);
					} 
					catch (e) {
						removeTag(element);
					}
                }
            };
        }
    }
	

	
	
	/**
	 * 若所有文件返回，执行callback
	 * @param {Object} type
	 * @param {Object} callback
	 */
    function doCallback(type, callback){
		var statConfig;
		if (dependent && type == "js") {
			statConfig = currentJsSet;
		}
		else {
			statConfig = fileStat[type];
		}
		for (var item in statConfig) {
			if (!statConfig[item]) {
				return;
			}
		}
        ('function' == typeof callback) && callback();
    }
	

	/**
	 * 删除节点
	 * @param {Object} element
	 */
	function removeTag(element){
		if (element && element.parentNode) {
			element.parentNode.removeChild(element);
		}
		element = null;
	}

    
    return {
        /**
         * 主函数，加载文件
         * @param {Object} files
         * @param {Object} callback
         */
        include: function(files, callback){
            //允许多种文件参数格式，首先统一格式
            var allFiles = formatFiles(files);
            
            //初始化文件加载状态	
            initFileStat(allFiles);
			
            //先加载css,再加载js
            loadCssFile(allFiles.cssFiles, function(){
                loadJsFile(allFiles.jsFiles, callback);
            });
        }
    };
})();