/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    trans/transModify.js
 * desc:    修改转化
 * author:  wanghuijun
 * date:    $Date: 2011/04/28 $
 */

ToolsModule.transModify = new er.Action({
	
	VIEW: 'transModify',
	
	IGNORE_STATE: true,
	
	UI_PROP_MAP : {
		ModifyTransMatch : {
			datasource : '*transMatch',
			width : '150',
			value : '1'
		}
	},
	
	CONTEXT_INITER_MAP: {
		getTransMatch: function(callback){
			this.setContext('transMatch', [{
				text: '部分匹配',
				value: 1
			}, {
				text: '完全匹配',
				value: 0
			}]);
			callback();
		}
	},
	
	onafterrender : function(){
		var me = this,
			controlMap = me._controlMap;
		
		me.fillInit();
		
		// 保存
		controlMap.TransModifySave.onclick = me.modify();
		
		// 取消
		controlMap.TransModifyCancel.onclick = function() {
			me.onclose();
		};
	},
	
	onentercomplete : function(){
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},
	
	/**
	 * 填充初始信息
	 */
	fillInit: function(){
		var me = this,
			G = baidu.g,
			siteUrl = me.arg.siteUrl,
			name = me.arg.name,
			step_url = me.arg.step_url,
			step_type = me.arg.step_type,
			selector = G('ModifyTransMatchSelect');
		
		G('ModifyTransDomain').innerHTML = baidu.string.wbr(siteUrl);
		G('ModifyTransName').value = name;
		G('ModifyTransTargetUrl').value = step_url;
		
		ui.util.get('ModifyTransMatch').setValue(step_type);
	},
	
	/**
	 * 修改转化
	 */
	modify : function() {
		var me = this;
		
		return function(){
			var that = nirvana.trans,
				G = baidu.g,
				transformName,
				targetSite,
				matchType,
				action = me.arg.action,
				siteid = me.arg.siteid,
				transid = me.arg.transid;
			
			me.clearError();
			
			that.getTransformName('ModifyTransName', 'ModifyTransNameWarn');
			that.getTargetSite('ModifyTransTargetUrl', 'ModifyTransTargetUrlWarn');
			that.getMatchType('ModifyTransMatch');
			
			transformName = that.transformName;
			targetSite = that.targetSite;
			matchType = that.matchType;
			
			if (transformName == '' || targetSite == '') {
				return;
			}
			
			// 已配置不缓存
			fbs.trans.modTrans({
				siteid: siteid,
				transid: transid,
				transName: transformName,
				desPage: targetSite,
				matchType: matchType,
				onSuccess: function(response){
					me.onclose();
					action.getTransList();
				},
				onFail: function(){
					ajaxFailDialog();
				}
			});
		}
	},
	
	/**
	 * 清除错误信息
	 */
	clearError : function() {
		var errorArray = ['ModifyTransNameWarn', 'ModifyTransTargetUrl', 'TransModifySaveWarn'],
			i;
		
		for (i in errorArray) {
			baidu.g(errorArray[i]).inndeHTML = '';
		}
	}
});

/**
 * 转化跟踪公用函数
 */
nirvana.trans = {
	
	transformName : '',
	
	targetSite : '',
	
	matchType : '',
	/**
     * 是否开通百度统计，第一次登录默认未开通，请求后保存结果
     */
    isInstall: false,
	
	/**
	 * 当前路径，判断是否放弃请求
	 */
	currentPath : '',
	
	openDomain:[],
	
	/**
	 * 检查网址的正确性和合法性
	 * @param {String} inputId 输入框id
	 * @param {String} warnId 错误信息id
	 */
	checkRootDomain : function(inputId, warnId) {
		var rootDomain = baidu.trim(baidu.g(inputId).value).toLowerCase(),
			regex = /^(\w+:\/\/)?([^\/:\?]+).*/, //判断根域
			domainList = nirvana.config.TRANS.DOMAIN_LIST,
			tempDomain,
			openDomain = this.openDomain,
			G = baidu.g,
			match;
		baidu.removeClass(warnId, 'hide');
		
		if (rootDomain == '' || rootDomain == nirvana.config.TRANS.DOMAIN_DEFAULT_VALUE) {
			G(warnId).innerHTML = nirvana.config.ERROR.TRANS.DOMAIN_IS_NULL;
			return false;
		}
		if (getLengthCase(rootDomain) > 200) {
			G(warnId).innerHTML = nirvana.config.ERROR.TRANS.DOMAIN_IS_LONG;
			return false;
		}
		if (!fbs.validate.string.isDomain(rootDomain)) {
			G(warnId).innerHTML = nirvana.config.ERROR.TRANS.DOMAIN_FORMAT_WRONG;
			return false;
		}
		
		tempDomain = rootDomain;
		match = tempDomain.match(regex)[2]; //获取根域
		match = match.split('.');
		tempDomain = match[match.length - 2] + '.' + match[match.length - 1];

		for (var i = 0, j = domainList[0].length; i < j; i++) {
			if (match[match.length - 2] == domainList[1][i]) {
				tempDomain = match[match.length - 3] + '.' + tempDomain;
				break;
			}
			if (tempDomain == domainList[0][i]) {
				tempDomain = match[match.length - 3] + '.' + tempDomain;
				break;
			}
		}
		for (var x = 0, y = openDomain.length; x < y; x++) {
			if (tempDomain == openDomain[x]) { //用户输入属于开放域名
				G(warnId).innerHTML = '';
				baidu.addClass(warnId, 'hide');
				return true;
			}
		}
		G(warnId).innerHTML = nirvana.config.ERROR.TRANS.DOMAIN_NOT_FIT;
		return false;
	},
	
	/**
	 * 获取转化名称
	 * @param {String} inputId 输入框id
	 * @param {String} warnId 错误信息id
	 */
	getTransformName : function(inputId, warnId) {
		var me = this,
			transformName = baidu.trim(baidu.g(inputId).value),
			G = baidu.g;
		
		me.transformName = '';
		
		if (transformName == '') {
			G(warnId).innerHTML = nirvana.config.ERROR.TRANS.NAME_IS_NULL;
		} else if (getLengthCase(transformName) > 50) {
			G(warnId).innerHTML = nirvana.config.ERROR.TRANS.NAME_LENGTH_LONG;
		} else {
			me.transformName = transformName;
			G(warnId).innerHTML = '';
		}
	},
	
	/**
	 * 获取目标网址
	 * @param {String} inputId 输入框id
	 * @param {String} warnId 错误信息id
	 */
	getTargetSite : function(inputId, warnId) {
		var me = this,
			G = baidu.g,
			targetSite = baidu.trim(G(inputId).value).toLowerCase();
		
		me.targetSite = '';
		
		if (targetSite == '') {
			G(warnId).innerHTML = nirvana.config.ERROR.TRANS.TARGET_IS_NULL;
		} else if (!fbs.validate.string.containHTTP(targetSite)) {
			G(warnId).innerHTML = nirvana.config.ERROR.TRANS.TARGET_NOT_HTTP;
		} else if (getLengthCase(targetSite) > 255) {
			G(warnId).innerHTML = nirvana.config.ERROR.TRANS.TARGET_IS_LONG;
		} else if (!fbs.validate.string.isDomain(targetSite)) {
			G(warnId).innerHTML = nirvana.config.ERROR.TRANS.TARGET_FORMAT_WRONG;
		} else {
			me.targetSite = baidu.trim(G(inputId).value);
			G(warnId).innerHTML = '';
		}
	},
	
	/**
	 * 获取匹配模式
	 * @param {String} inputId 输入框id
	 */
	getMatchType : function(inputId) {
		var me = this,
			matchType = ui.util.get(inputId).getValue();
		
		// 匹配模式，1为部分匹配，0为完全匹配
		me.matchType = matchType;
	},
	
	/**
	 * 打开转化跟踪工具箱
	 */
	openTool: function(){
		// 判断是否已经开通转化
		if (nirvana.trans.isInstall) { // 已经开通转化，直接进入转化列表
			ToolsModule.open('translist');
		}
		else {
			fbs.trans.isContractSigned({
				onSuccess: function(response){
					if (response.data) { // 已经开通转化，直接进入转化列表
						nirvana.trans.isInstall = true;
						ToolsModule.open('translist');
					}
					else { // 未开通百度统计，进入合同页面
						ToolsModule.open('trans');
					}
				},
				onFail: function(){
					ajaxFailDialog();
				}
			});
		}
	},
	
	
	resetTool: function(toolname){
		var transActions = ["trans", "newtrans", "translist", "transModify", "getCode", "transCheckSingle", "transcheck"],
			toolname = toolname.substr(6);//去掉Tools_
		if(baidu.array.indexOf(transActions, toolname) != -1){
			this.openTool();
		}
	}
};
