/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 *
 * path:    trans/trans.js
 * desc:    转化跟踪-新增转化
 * author:  wangzhishou wanghuijun
 * date:    $Date: 2011/04/22 $
 */

ToolsModule.newtrans = new ToolsModule.Action('newtrans', {
	/**
	 * 视图模板名，或返回视图模板名的函数
	 */
	VIEW : 'newtrans',
	/**
	 * 要保持的状态集合。“状态名/状态默认值”形式的map。
	 */
	STATE_MAP : {
		/**
		 * 站点Select
		 */
		newTransSiteSelectOption : null,
		newTransSiteSelectOptionSelected : null
	},

	UI_PROP_MAP : {
		TransMatch : {
			datasource : '*transMatch',
			width : '150',
			value : '1'
		}
	},
	/**
	 * 初始化context的函数集合，name/value型Object。其value为Function的map，value
	 * Function被调用时this指针为Action本身。value
	 * Function的形参需要有一个callback参数，参数为Function类型，手工回调。
	 */
	CONTEXT_INITER_MAP : {
		getTransMatch : function(callback) {
			this.setContext('transMatch', [{
				text : '部分匹配',
				value : 1
			}, {
				text : '完全匹配',
				value : 0
			}]);
			callback();
		},
		
		/**
		 * 初始化站点列表
		 */
		getSiteListForSelect : function(callback) {
			var me = this;
			
			if (me.getContext('newTransSiteSelectOption') == null) {
				fbs.trans.getSiteListForSelect({
					onSuccess : function(response) {
						var data = response.data;
						var tmp = [];
						tmp.push({
							text : '选择已添加的网站',
							value : '-9999'
						});
						for ( var i = 0, n = data.length; i < n; i++) {
							tmp.push({
								text : baidu.encodeHTML(data[i]['site_url']),
								value : data[i]['site_id']
							});
						}
						me.setContext('newTransSiteSelectOption', tmp);
						me.setContext('newTransSiteSelectOptionSelected', tmp[0]['value']);
						callback();
					},
					onFail : function() {
						ajaxFailDialog();
					}
				});
			} else {
				callback();
			}
		}
	},

	/**
	 * 视图repaint的后会触发事件
	 */
	onafterrepaint : function() {
		nirvana.trans.currentPath = 'newtrans';
	},

	/**
	 * 第一次render后执行
	 */
	onafterrender : function() {
		var me = this;
		
		// 查询开放域名列表
		me.getOpenDomain();
		
		// 添加网站
		ui.util.get('NewTransSiteSelect').onselect = function(selected) {
			me.setContext('newTransSiteSelectOptionSelected',selected);
			baidu.g('TransDomain').value = baidu.decodeHTML(ui.util.get('NewTransSiteSelect').getText()); // 填充Select时encode，这里需要decode
			baidu.g('TransDomain').focus();
		};
		
		// 输入框失去焦点即时验证
		me.bindBlurHandler();
		
		//小问号
		ui.Bubble.init(baidu.dom.q("ui_bubble", "NewTransStep1", "span"));
		
		/**
		 * 点击下一步
		 */
		ui.util.get('TransNextBtn').onclick = function() {
			me.addTrans();
		};
		/**
		 * 取消，跳转到转化列表，定位到转化列表tab
		 */
		ui.util.get('TransCancelBtn').onclick = function() {
			me.redirect('/tools/translist', {
				tabId : me.arg.tabId,
				level: me.arg.level,
				siteid: me.arg.siteid
			});
		};
	},
	
	/**
	 * 完成视图更新后最后会触发事件
	 */
	onentercomplete: function(){
		var me = this;
		if (me.arg.siteUrl) {
			baidu.g('TransDomain').value = me.arg.siteUrl;
			baidu.g('TransDomain').focus();
		}
		else {
			if (me.arg.siteid) {
				ui.util.get("NewTransSiteSelect").setValue(me.arg.siteid);
				baidu.g('TransDomain').value = baidu.decodeHTML(ui.util.get('NewTransSiteSelect').getText()); // 填充Select时encode，这里需要decode
				baidu.g('TransDomain').focus();
			}
		}
	},
	
	/**
	 * 失去焦点事件处理
	 */
	bindBlurHandler : function() {
		var me = this;
		
		baidu.on('TransDomain', 'blur', function() {
			me.getRootDomain('TransDomain', 'TransDomainWarn');
		});
		
		baidu.on('TransName', 'blur', function() {
			me.getTransformName('TransName', 'TransNameWarn');
		});
		
		baidu.on('TransTargetUrl', 'blur', function() {
			me.getTargetSite('TransTargetUrl', 'TransTargetUrlWarn');
		});
	},
		
    /**
     * 查询开放域名列表
     */
	getOpenDomain: function(){
		var me = this;
		
		fbs.trans.getOpenDomain({
			onSuccess: function(response){
				var data = response.data;
				nirvana.trans.openDomain = data;
			//	me.setContext('openDomain', data);
			},
			onFail: function(){
				ajaxFailDialog();
			}
		});
	},
	
	/**
	 * 获取所属网站
	 * @param {String} inputId 输入框id
	 * @param {String} warnId 错误信息id
	 */
	getRootDomain: function(inputId, warnId){
		var me = this;
		
		me.setContext('rootDomain', '');
		
		if(nirvana.trans.checkRootDomain(inputId, warnId)){
			me.setContext('rootDomain', baidu.trim(baidu.g(inputId).value));
		}
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
		
		me.setContext('transformName', '');
		baidu.removeClass(warnId, 'hide');
		
		if (transformName == '') {
			G(warnId).innerHTML = nirvana.config.ERROR.TRANS.NAME_IS_NULL;
		} else if (getLengthCase(transformName) > 50) {
			G(warnId).innerHTML = nirvana.config.ERROR.TRANS.NAME_LENGTH_LONG;
		} else {
			me.setContext('transformName', transformName);
			G(warnId).innerHTML = '';
			baidu.addClass(warnId, 'hide');
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
		
		me.setContext('targetSite', '');
		baidu.removeClass(warnId, 'hide');
		
		if (targetSite == '') {
			G(warnId).innerHTML = nirvana.config.ERROR.TRANS.TARGET_IS_NULL;
		} else if (!fbs.validate.string.containHTTP(targetSite)) {
			G(warnId).innerHTML = nirvana.config.ERROR.TRANS.TARGET_NOT_HTTP;
		} else if (getLengthCase(targetSite) > 255) {
			G(warnId).innerHTML = nirvana.config.ERROR.TRANS.TARGET_IS_LONG;
		} else if (!fbs.validate.string.isDomain(targetSite)) {
			G(warnId).innerHTML = nirvana.config.ERROR.TRANS.TARGET_FORMAT_WRONG;
		} else {
			me.setContext('targetSite', baidu.trim(G(inputId).value));
			G(warnId).innerHTML = '';
			baidu.addClass(warnId, 'hide');
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
		me.setContext('matchType', matchType);
	},
	
	/**
	 * 取消添加转化, 重置输入框
	 */
	cancelAddTrans : function() {
		var G = baidu.G;
		G('TransDomain').value = '';
		G('TransName').value = '';
		G('TransTargetUrl').value = '';
		ui.util.get('TransMatch').setValue(1);
	},
	
	/**
	 * 添加转化（转化跟踪工具-->新增转化）
	 */
	addTrans : function() {
		var me = this,
			G = baidu.g,
			rootDomain,
			transformName,
			targetSite,
			matchType;
		
		me.clearError();
		
		me.getRootDomain('TransDomain', 'TransDomainWarn');
		me.getTransformName('TransName', 'TransNameWarn');
		me.getTargetSite('TransTargetUrl', 'TransTargetUrlWarn');
		me.getMatchType('TransMatch');
		
		rootDomain = me.getContext('rootDomain');
		transformName = me.getContext('transformName');
		targetSite = me.getContext('targetSite');
		matchType = me.getContext('matchType');
		
		if (rootDomain == '' || transformName == '' || targetSite == '') {
			return;
		}
		
		// 已配置不缓存
		fbs.trans.addTrans({
			siteUrl : rootDomain,
			transName : transformName,
			desPage : targetSite,
			matchType : matchType,
			onSuccess : function(response) {
				var siteid = response.data;
				ToolsModule.unloadTrans('transCheckSingle');
				me.redirect('/tools/transCheckSingle', {
					matchType: matchType,
					siteid: siteid,
					url: targetSite,
					refer: 'newtrans',
					tabId: me.arg.tabId,
					level: me.arg.level
				});
			},
			onFail : function(response) {
				var errorCode = response.errorCode;
				
				if(errorCode && errorCode.code) {
					G('NewTransWarn').innerHTML = nirvana.config.ERROR.TRANS[errorCode.code];
					baidu.removeClass('NewTransWarn', 'hide');
				} else {
					ajaxFailDialog();					
				}
			}
		});			
	},
	
	/**
	 * 清除错误信息
	 */
	clearError : function() {
		var errorArray = ['TransDomainWarn', 'TransNameWarn', 'TransTargetUrlWarn', 'NewTransWarn'],
			i;
		
		for (i in errorArray) {
			baidu.g(errorArray[i]).inndeHTML = '';
			baidu.addClass(errorArray[i], 'hide');
		}
	}
});