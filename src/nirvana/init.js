/**
 * 每次进入一个页面（主action和工具箱），初始化页面的基本参数
 * @author zhouyu01@baidu.com
 */
er.Action.onafterrender = function(){
	var me = this,
		baseParams = {
			userid: nirvana.env.USER_ID,
			optid: nirvana.env.OPT_ID,
			ulevelid: nirvana.env.ULEVELID,
			token : nirvana.env.TOKEN.substr(0,10),	//token唯一确定一个登录周期所有前端监控,token太长，时间+用户group后冲突概率极低，截断取前10即可
			exp:nirvana.env.EXP // 增加版本号监控
		};
	if (me.arg.domId) {
		if (me.arg.domId == 'Main') { //主Action
			baseParams.path = me.arg.path;
			NIRVANA_LOG.init(baseParams);
			NIRVANA_LOG.sendEnterLog();
		}
		else 
			if (me.arg.domId.indexOf('Tools_') > -1) { //工具箱
				baseParams.path = me.arg.domId.split("_", 2).join("_");
				NIRVANA_LOG.init(baseParams);
				NIRVANA_LOG.sendEnterLog();
			}
	}
	else {
		NIRVANA_LOG.init();
	}
}

er.Action.onbeforeinitcontext = function(){
	var me = this;
	
	if(me.arg.domId && me.arg.domId != 'Main'){ //如果是子action，直接return，这里没有用arg.type判断，是因为发现有子action已经复写了type属性
		return true;
	}
	var queryMap = me.arg.queryMap;
	for(var i in queryMap){
		queryMap[i] = nirvana.util.firefoxSpecialURLChars.decode(queryMap[i]);
	}
	// 强制隐藏Bubble
	ui.Bubble.hide();
};

er.Action.onentercomplete = function(){
	if (nirvana.env.REQUEST_COUNTER <= 0) {
		nirvana.util.loading.done();
	}
	//不属于主Action和工具Action的其他dialog子Action，没有用type判断因为type已经被污染了
	var me = this,
		otherParams = {};

	if(me.arg.domId){
		
		if (me.arg.domId != 'Main' && me.arg.domId.indexOf('Tools_') == -1) {
			var dialog = baidu.g(me.arg.domId);
			if (dialog) {
				dialog = ui.util.get(baidu.getAttr(dialog, 'control'));
				dialog && dialog.resizeHandler();
			}
		}
		else {	//每次refresh重新设置监控param 	by zhouyu01@baidu.com
			var queryMap = me.arg.queryMap;
			if (queryMap) {
				for (var item in queryMap) {
					if (item != "_r" && item != "ignoreState" && typeof(queryMap[item]) != "object" && queryMap[item] != "") {
						otherParams[item] = queryMap[item];
					}
				}
			}
			NIRVANA_LOG.setOtherParam(otherParams);
		}
	}
};

er.Action.onleave = function(){
	var me = this,
		path = '';
		
	if(me.arg.domId && me.arg.domId != 'Main'){ //如果是子action，直接return，这里没有用arg.type判断，是因为发现有子action已经复写了type属性
		if(me.arg.domId.indexOf('Tools_') > -1){	//工具箱，这个没有多大意义，离开工具箱需要离开推广管理页面才行，一般只是把工具箱最小化了   	by zhouyu01@baidu.com
			NIRVANA_LOG.sendUnloadLog();
		}
		return true;
	}
	NIRVANA_LOG.sendUnloadLog();  //主action离开页面发送监控	by zhouyu01@baidu.com
	//主Action leave时，清除其可能注册过的对工具的物料导入方法
	ToolsModule.clearImportDataMethod();
}

er.Action.onenter = function(){
	var me = this;
	
	// nirvana.util.loading.init();
		
	if(me.arg.domId && me.arg.domId != 'Main'){ //如果是子action，直接return，这里没有用arg.type判断，是因为发现有子action已经复写了type属性
		return true;
	}
	
	ToolsModule.close();
	
	// 更新导航状态
	nirvana.navigation.setCurrent();
	
	var path = er.locator.getPath().substr(1).split('/'),
		module = path[0];
	
	
	if (module == 'manage') {
		baidu.removeClass('SideNav', 'hide');
		baidu.removeClass('Toolbar', 'hide');
		baidu.addClass('Wrapper', 'have_toolbar');
		
		
		if (!nirvana.env.IS_TOOLBAR_LOADED) { //只加载一次工具条
			ToolsModule.initiate();
			nirvana.env.IS_TOOLBAR_LOADED = true;
		}
	
        
		if (!nirvana.env.IS_SIDENAV_LOADED) { //只加载一次账户树
			var map = er.UIAdapter.init(baidu.g('SideNav'));
			map.SideNav.initAccountTree({
				onclick : function (data) {
					var level = data.value.substr(0, 1),
						id = data.value.substr(1),
						query = [],
						currentAction = nirvana.CURRENT_MANAGE_ACTION_NAME || '';
					
					if(level == 'p'){	//计划
						if(currentAction == 'plan' || currentAction.indexOf('monitor') > -1){	//如果还在计划层级，自动跳进单元
							query[query.length] = '/manage/unit';
						}
						query[query.length] = '~ignoreState=1&navLevel=plan&planid=' + id;
					} else if (level == 'u'){	//单元
						if(currentAction == 'plan' || currentAction == 'unit' || currentAction.indexOf('monitor') > -1){	//如果在计划或者单元层级，自动跳进关键词
							query[query.length] = '/manage/keyword';
						}
						query[query.length] = '~ignoreState=1&navLevel=unit&unitid=' + id;
					} else {
						//新建单元的还没做
					}
					
					er.locator.redirect(query.join(''));
					return true;
			    }
			});
			map.SideNav.initFolderTree({
				getItemHtml: function(data){
					var html = [];
					html[html.length] = '<span class="treeview_folder">&nbsp;</span>';
					if (data.count == 0) {
						html[html.length] = data.name + "<b class='mtl_empty_remind ui_title' rel='关键词为空'>0</b>";
					}
					else {
						html[html.length] = data.name;
					}
					return html.join("");
				},
				getItemId:function(data){
					return data.id;
				},
				getChildren: function(data){
					return data.children;
				},
				onclick: function(data){
					var id = data.value.substr(1);
					er.locator.redirect('/manage/monitorDetail~ignoreState=1&folderid=' + id);
				}
			});
			nirvana.env.IS_SIDENAV_LOADED = true;
		}
		ui.util.get('SideNav').show();
		
	} else {
        // 如果是非管理页，且为Main
        nirvana.aoPkgControl.popupCtrl.destroy();
		baidu.addClass('SideNav', 'hide');
		baidu.addClass('Toolbar', 'hide');
		baidu.removeClass('Wrapper', 'have_toolbar');
		
		var sidenav = ui.util.get('SideNav');
		if(sidenav){
			sidenav.hide();
		}
	}
};
/**
 * 模板加载成功后 Main内容渲染前所做的工作
 */
er.oninit = function(){
	//请求消息中心静态资源
	if (nirvana.env.MES_CENTER) {
		if (!LoginTime.isDuringLogin("messagenotify")) {
			var callback = function(response){
				if (response.status == 200) {
					$LAB.script(nirvana.loader('msgcenter')).wait(function(){
						msgcenter.init();
					});
				}
			}
			Requester.send("GET/nikon/messagenotify", "msgnotify", {}, callback);
		}
		else {
			$LAB.script(nirvana.loader('msgcenter')).wait(function(){
				msgcenter.init();
			});
		}
	}
}


//创建心跳请求，验证是否已经超时
/**
 * @param isInterval 如传递该参数，则不执行setTimeout语句，为了表单提交前调用该函数验证是否超时。
 **/
nirvana.heartBeat = function(isInterval){
	var callback = function(data){
		if(data.status === true){
			if (isInterval != null) {
				//为了推广实况和推广回放中表单提交前调用一次，不设置轮询
			}
			else {
				setTimeout(nirvana.heartBeat, 31 * 60 * 1000); //31分钟轮询一次
			}
		} else {//status为false或失败时就直接跳转页面
			location.reload();
		} 
	}
	Requester.send('zebra', 'zebra', {}, callback, callback);
};

/**
 * 检测浏览器是否安装Flash
 * @author Wu Huiyao (wuhuiyao@baidu.com)
 */
nirvana.checkFlashAvailable = function() {
    // 如果在低版本的IE浏览器，就不care是否安装Flash了，因为已经有低版本浏览器提示了
    if(baidu.ie && baidu.ie < 7){
        return;
    }
    
    var swf;
        
    if (baidu.ie) {
        swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
    } else if (navigator.plugins && navigator.plugins.length > 0) {
        swf = navigator.plugins["Shockwave Flash"];
    }
    
    if (swf){
        // 安装了Flash
        return;
    }
    
    // 未安装Flash，显示未安装Flash的提示信息
    var tipContainer = baidu.g('FlashTip'),
        setupFlashHref = 'http://get.adobe.com/cn/flashplayer/',
        tipContent = '请您安装flash插件以获得更好的推广体验。',
        setupTip = '立刻安装Flash',
        tipHTMLTpl = '<div class="tip_conent"><span>{tipContent}</span><a target="_blank" href={setupFlashHref}>{setupTip}</a></div>'
                         + '<a class="close_btn" href="#"></a>';
        
    tipContainer.innerHTML = lib.tpl.parseTpl({
        tipContent: tipContent,
        setupFlashHref: setupFlashHref,
        setupTip: setupTip
    }, tipHTMLTpl);
            
    if (baidu.dom.hasClass(tipContainer, "hide")) {
        baidu.removeClass(tipContainer, "hide");
    }  
    
    // 提示信息显示5秒
    setTimeout(function() {
        baidu.fx.collapse(tipContainer);
    }, 5000);
}

nirvana.checkBrowser = function(){
	if(baidu.ie && baidu.ie < 7){
		var html = [];
		html[html.length] = "您的浏览器版本过低，部分功能无法正常使用，建议";
		html[html.length] = "<a href='http://windows.microsoft.com/zh-CN/internet-explorer/downloads/ie-8' target='_blank' class='browser_ie browser_icon'>升级至IE7以上版本</a>";
		html[html.length] = "，或下载使用";
		html[html.length] = "<a href='http://firefox.com.cn/download/' target='_blank' class='browser_ff browser_icon'>火狐</a>、";
		html[html.length] = "<a href='http://www.google.com/chrome' target='_blank' class='browser_chrome browser_icon'>Chrome</a>";
		html[html.length] = "等其他浏览器，以保证系统功能的正常使用！";
		baidu.g("BrowserTip").innerHTML = html.join("");
		if(baidu.dom.hasClass(baidu.g("BrowserTip"), "hide")){
			baidu.removeClass(baidu.g("BrowserTip"), "hide");
		}
		var top = 0;
		function timeout(){
			if (30 + top > 0) {
				top = top - 1;
				baidu.g("BrowserTip").style.top = top + "px";
				setTimeout(timeout, 80);
			}
			else {
				clearTimeout(timeout);
			}
		};
			
		setTimeout(function(){
			setTimeout(timeout,80);
		},10000);
	}
};

/**
 * 小流量名单控制 
 * 把小流量名单在这里控制  
 * 不同的小流量加载不同的js action文件
 * 粒度更大一些  在代码里面写的if else能少一下 
 * 小转全的时候 直接把action改了就行了
 * author yanlingling

nirvana.smallFlowControl = function(){
	 if (nirvana.env.FCWISE_ALLDEVICE_USER) {//FCWISE_MOBILE_USER
 	    nirvana.manage.setPathConfig('manage/planAdvancedSet','manage.advancedSetAllDevice');//高级设置
        nirvana.manage.setPathConfig('manage/ideaEdit','manage.ideaEditAllDevice');//编辑创意
        nirvana.manage.setPathConfig('manage/createPlan','manage.createPlanAllDevice');//新建计划
    } 
} 
 */
baidu.on(window, 'load', function() {
    nirvana.checkBrowser();
	// 检测浏览器是否安装Flash added by Wu Huiyao
	nirvana.checkFlashAvailable();
	nirvana.getBrowser();
	fbs.request.setRequest(Request);
	nirvana.heartBeat();
	
	//修复
	setInterval(function(){
		var title = '百度推广';
		if (document.title != title) {
			document.title = title;
		}
	},500);
	
	nirvana.env.TOKEN = baidu.cookie.getRaw("__cas__st__3");
	function getAuthAndStart() {
    	Request({
    		account : {
    			items : ['username', 'token', 'servertime','ulevelid','optid','optname','optulevelid','spaceNewCount','hasAntiReport','hasMatchReport', 'exp','urlCutPrex'] // exp为新增的版本标识字段,urlCutPrex显示url自动填充时要cut的前缀
    		}
    	}, function(data) {
    		
    		if(data.account.status == 600 || data.account.status == fbs.request.STAT_TIMEOUT){
    			NIRVANA_LOG.send(UEManager.getUe());
    			ajaxFailDialog();
    			return false;
    		}
    		nirvana.env.URL_CUT_PREX = data.account.urlCutPrex;
    		nirvana.env.USER_NAME = data.account.username;
    		nirvana.env.OPT_ID	=	data.account.optid;
    		nirvana.env.SERVER_TIME = data.account.servertime;
    		nirvana.env.ULEVELID = data.account.ulevelid;
    		nirvana.env.OPT_ULEVELID = data.account.optulevelid;
    		nirvana.env.OPT_ID = data.account.optid;
    		nirvana.env.OPT_NAME = data.account.optname;
    		nirvana.env.REPORT_LEVEL = data.account.reportlevel;
    		nirvana.env.SPACE_NEWS_COUNT = data.account.spaceNewCount;
            nirvana.env.AUTH = data.account.auth;
            nirvana.env.EXP = data.account.exp; // 智能优化为7240，全流量为0
            nirvana.env.AOEXP = data.account.aoexp || []; // AO版本权限控制接口，以后会完全替代EXP，by LeoWang(wangkemiao@baidu.com) 2012-12-21 世界末日前夕
    		nirvana.env.userRole = nirvana.env.AUTH.userRole;
    		//是否可以下载搬家历史记录
    		nirvana.env.canDownLoadMoveHis = data.account.wirelessRemoveDownFile;
    		
    		nirvana.env.AUTH.gaoduan = !(nirvana.env.AUTH.gaoduan === false);
			//是否展示无线提醒浮层
			nirvana.env.readMobileNotice = data.account.alldevicefloat;
			
    		nirvana.env.AUTH.invalid = !(nirvana.env.AUTH.hasAntiReport === false);
    		nirvana.env.AUTH.match = !(nirvana.env.AUTH.hasMatchReport === false);
    		//无线出价比可调整的范围
            nirvana.env.MPRICEFACTOR_RANGE = data.account['mpricefactor-range'];

            // AO版本权限控制接口，以后会完全替代EXP，by LeoWang(wangkemiao@baidu.com) 2012-12-21 世界末日前夕
            // nirvana.util.aoAuth.init();
            nirvana.auth.init(nirvana.env.AOEXP);

    		//对后台的userRoles进行处理 
    		var temp = {},
    			userRoles = data.account.userRoles || [];
    		for(var i = 0;i < userRoles.length; i++){
    			temp[userRoles[i]] = true;
    			var reg=/-/g
    			var roleName = userRoles[i].toUpperCase().replace(reg,'_') ;//后端返回的名称小写变大写，中划线变下划线
    			nirvana.env[roleName] = true;//自动填充nirvana.env里面的权限值，如果没有权限的话就是undefined mod by yll
    		}


    		/*******begin 这几个是已有的小流量控制，为了避免现有程序出错，留着，以后的同学不要再往里面加了，在for循环里面写好了*****/
			nirvana.env.MOBILE_INTRO = temp['mobile-intro'] || false;//是否需要展示手机凤巢链接
			nirvana.env.DESCOUNT_INFO = temp['discount-info'] || false;//是否需要展示优惠页链接，为方便扩展，改名“高级样式”
            nirvana.env.ADVANCED_IP_EXCLUDED = temp['advanced-ip-excluded'] || false;//高级iP排除的权限
            nirvana.env.NEGATIVE_WORD_MORE = temp['negative-word-more'] || false;
           /******end不要再往里面加了，在for循环里面写好了*****/
            nirvana.env.MES_CENTER = temp['aries-xll'] || false;//智能消息中心小流量
			nirvana.env.FCLAB = temp['lab'] || false;//是否有创新实验室权限
			
			if(nirvana.env.FCLAB){
				nirvana.env.LABTOOLS = data.account.labtools;
			}


            /**
             * 权限控制中心，读写分离，信息获取
             * TODO: 能不能整体替代了上面的权限、小流量控制呢？
             */
            nirvana.env.ACC = data.account.acc;
            nirvana.acc.init();

			//初始化管理页的附加tab展示权限
			EXTERNAL_LINK.authControl();
    		// 导航初始化
    		nirvana.navigation.init();
    		
    		// 版权信息初始化
    		nirvana.copyright.init();
    		
    		//小流量action特殊处理 yanlingling
    		//nirvana.smallFlowControl ();
    		
        
    		/*er.Action.onenter = function(){
    			
    		};*/
    		NIRVANA_LOG.send(UEManager.getUe());
    		er.init();
    		
    		/***
    		 * 以下是页面加载完以后才做的事情
    		 */
    		
    		//联系百度 下的商桥，在不好的情况下加载js需要200ms+，故从navigation.js中提出，放到页面加载完毕以后再执行
    		if (baidu.g('BridgeService')) {
    			baidu.page.loadJsFile(BRIDGE_SERVICE_URL);
    		}
    		//调研反馈系统的请求
    		feedback.init();
    		
    	}, fbs.config.path.AUTH_PATH);
	}
	Requester.send('scookie', 'scookie', {}, function(data){
	    //木有联调，不知道泽泽传回来啥，这样保险点~
        data = (data && data.scookie) ? data : (new Function("return " + data))();
        if (data && data.scookie){
            nirvana.env.SCOOKIE = data.scookie;
        }
        getAuthAndStart();
    }, getAuthAndStart);
    
	//Timing中有onload时间，所以要跳出onload事件后再发Timing
	PR.tc3 = new Date();
	setTimeout(function(){
		NIRVANA_LOG.sendTimingLog();
	},1000);
});

baidu.on(document.body, 'mousedown', NIRVANA_LOG.sendDataLog());
baidu.on(document.body, 'keypress', NIRVANA_LOG.sendDataLog());
baidu.on(window, "unload", function(){
	NIRVANA_LOG.ajaxLog(0);
	NIRVANA_LOG.sendUnloadLog();
});




