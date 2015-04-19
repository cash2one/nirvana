/**--------------------------------------------------------------------------------------------------------------------------
 * 用户环境监控 User Environment Manager
 * @author linzhifen@baidu.com
 */
var UEManager = {
	/** 需求
		1.	浏览器分布
		2.	IE外壳安装比例
		3.	操作系统分布
		4.	平台
		5.	屏幕分辨率分布
		6.	用户可视范围
		7.	屏幕色深分布
		8.	Flash版本分布
		9.	JavaApplet支持比例
		10.	历史记录深度分布
		11.	Plug-in(非IE)分布
		12.	MimeType(非IE)分布
		13.	Cookie支持比例
		14.	系统语言分布
	*/
	browser : (function(){
		var version = navigator.userAgent.match(/(IE|Firefox|Opera|Chrome|Safari)[ \/](\d+(\.\d+)?)/i);
		if (version && version.length) {
			return(version[0]);
	    }else{
			return 'other';
		}
	}()),
	ieShell : (function(){
		var ua = navigator.userAgent;
		if (ua.indexOf('IE') != -1){
			var s = ua.slice(ua.lastIndexOf(';') + 2,ua.length -1);
			if (s.indexOf('.N') != -1){
				return 'IE';
			}else{
				return s;
			}
		}else{
			return 'null';
		}
	}()),
	system : (function(){
		var ua = navigator.userAgent,
		    result;
		if(result = ua.match(/(windows nt|macintosh|solaris|linux)/i)){
			return result.slice(1);
		}else{
			return "other";
		}
	}()),
	//flash版本
	flashVersion : (function() {
		var f = "ShockwaveFlash.ShockwaveFlash";
		if (navigator.plugins && navigator.mimeTypes.length) {
			var fla = navigator.plugins["Shockwave Flash"];	//VarFlash_是flash的对象
			if (fla && fla.description){
				//用正则去除所有的字母和空格
				return fla.description.replace(/[^\d\.]/g, "").split(".")[0];
			}				
		} else if (navigator.userAgent.toLowerCase().indexOf("ie")>=0) {
			var A = ActiveXObject;
			try {
				var fla = new A(f + ".7");
			} catch (e) {
				try {
					var fla = new A(f + ".6");
					fla.AllowScriptAccess = "always";
					return 6;
				} catch (e) {};
				try {
					fla = new A(f);
				} catch (e){};
			};
			if (fla != null) {
				try{
					return fla.GetVariable("$version").split(" ")[1].split(",")[0];
				}catch(e){};
			};
		};
		return 0;
	}()),
	//用户可视区域尺寸
	userScreen : (function(){
		var w, h;
		
		if (window.innerHeight) {
			w = window.innerWidth;
			h = window.innerHeight;
		} else if (document.documentElement && document.documentElement.clientHeight) {
			w = document.documentElement.clientWidth;
			h = document.documentElement.clientHeight;
		} else if (document.body) {
			w = document.body.clientWidth;
			h = document.body.clientHeight;
		};
		
		return '' + w + ',' + h;
	}()),
	
	getUe : function(){
		var logPara = {
		        'userid': nirvana.env.USER_ID,
                'optid': nirvana.env.OPT_ID,
				'target':'userEnvironment',
				'nav' : UEManager.browser,						//浏览器
				'ies' : UEManager.ieShell,						//IE壳，双核的各种不同不准确，如遨游3的IE核下跟原IE一个鬼样
				'sys' : UEManager.system,						//操作系统
				'plt' : navigator.platform,						//平台，win32、64、iphone、ipad等等
				'swh' : screen.width + "," + screen.height,		//屏幕分辨率
				'uwh' : UEManager.userScreen,					//用户可视范围
				'scd' : screen.colorDepth,						//色深
				'flv' : UEManager.flashVersion,					//flash版本
				// 'jae' : navigator.javaEnabled(),				//JavaApplet支持
				'hil' : history.length,							//历史记录深度
				'pil' : navigator.plugins.length,				//插件个数
				'mil' : navigator.mimeTypes.length,				//MimeType
				'coe' : navigator.cookieEnabled,				//Cookie支持
				'osl' : (navigator.systemLanguage||navigator.language)	//语言
			};	
		return logPara;
	}
};

