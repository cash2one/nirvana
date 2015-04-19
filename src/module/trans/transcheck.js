/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    trans/transcheck.js
 * desc:    转化跟踪-检查全部
 * author:  wanghuijun wangzhishou
 * date:    $Date: 2011/4/26 $
 */

ToolsModule.transcheck = new ToolsModule.Action('transcheck', {
	/**
	 * 视图模板名，或返回视图模板名的函数
	 */
	VIEW : 'transcheck',
	/**
	 * 要保持的状态集合。“状态名/状态默认值”形式的map。
	 */
	STATE_MAP : {
		// 搜索推广URL轮询时间间隔
		fcInterval : 10000,
		
		// 转化跟踪URL轮询时间间隔
		transInterval : 10000,
		
		// 转化跟踪URL的查询Key
		transKey : '',
		
		// 转化跟踪URL轮询的Cache
		transCache : '',
		
		// 上次推广URL检查的时间
		lastTime : '',
		
		isFcLoading : '1',
		
		/**
		 * 检查范围类型 0 推广访问URL 1 转化跟踪URL
		 */
		checkTypeChecked : 0,
		/**
		 * 网站列表
		 */
		siteListInDataSelect : null,
		siteListInDataSelectSelected : null,
		/**
		 * 路径列表
		 */
		transformNameSelect : null,
		transformNameSelectSelected : null,
		/**
		 * 检测结果 
		 */
		promotionResult : '',
		transResult : ''
	},

	UI_PROP_MAP : {},
	/**
	 * 初始化context的函数集合，name/value型Object。其value为Function的map，value
	 * Function被调用时this指针为Action本身。value
	 * Function的形参需要有一个callback参数，参数为Function类型，手工回调。
	 */
	CONTEXT_INITER_MAP : {

		/**
		 * 获取站点列表
		 */
		loadTransSiteData : function(callback) {
			var me = this;
			if (this.getContext('siteListInDataSelect') == null) {
				fbs.trans.getSiteListForSelect({
					onSuccess : function(response) {
						var data = response.data;
						var tmp = [{
							text : '请选择',
							value : '0'
						}];
						for ( var i = 0, n = data.length; i < n; i++) {
							tmp.push({
								text : baidu.encodeHTML(data[i]['site_url']),
								value : data[i]['site_id']
							});
						}
						me.setContext('siteListInDataSelect', tmp);
						if (me.arg.siteid) { // 带入siteid
							me.setContext('siteListInDataSelectSelected', me.arg.siteid);
						} else {
							me.setContext('siteListInDataSelectSelected', tmp[0]['value']);
						}
						
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
	},

	/**
	 * 第一次render后执行
	 */
	onafterrender : function() {
		var me = this;
		nirvana.trans.currentPath = 'transcheck';
		
		me.initRadio();
		
		ui.util.get('PromotionURL').onclick = function() {
			me.setContext('checkTypeChecked', this.getGroup().getValue());
			me.switchCheckType();
		}
		ui.util.get('TransURL').onclick = function() {
			me.setContext('checkTypeChecked', this.getGroup().getValue());
			me.switchCheckType();
		}
		ui.util.get('PromotionURLBtn').onclick = function() {
			me.startCheck();
		};
		ui.util.get('TransURLBtn').onclick = function() {
			me.startCheck();
		};
		ui.util.get('CheckEndBtn').onclick = function() {
			me.setContext('isFcLoading', 0);
			nirvana.trans.currentPath = 'translist';
			me.redirect('/tools/translist',{
				tabId : me.arg.tabId,
				level: me.arg.level,
				siteid: me.arg.siteid
			});
		}

		ui.util.get('SiteListInDataSelect').onselect = function(selected) {
			var old = me.getContext('siteListInDataSelectSelected');
			if (old != selected) {
			//	me.refresh();
				me.setContext('siteListInDataSelectSelected', selected);
				ui.util.get("SiteListInDataSelect").setValue(selected);
				me.changeBtnStatus();
				return;
			}
		}

		ui.util.get('TransformNameSelect').onselect = function(selected) {
			me.setContext('transformNameSelectSelected', selected);
		}
		
		// 进入页面后查询搜索推广URL检查结果
		me.checkFcResult();
	},

	/**
	 * 第一次render后执行
	 */
	onentercomplete : function() {
		var me = this;
		
		me.changeBtnStatus();
	},

	/**
	 * 通过所属网站查找转化名称
	*/
	getTransListForSelect: function(){
		var me = this,
			transSelect = ui.util.get("TransformNameSelect");
		var tmp = [{
			text: '全部',
			value: '0'
		}];
		
		if (me.getContext('siteListInDataSelectSelected') == '0') {
			transSelect.options = tmp;
			transSelect.value = tmp[0]['value'];
			me.setContext("transformNameSelectSelected", tmp[0]['value']);
			transSelect.render();
		}
		else {
			fbs.trans.getTransListForCheckallSelect({
				siteid: me.getContext('siteListInDataSelectSelected'),
				onSuccess: function(response){
					var data = response.data;
					for (var i = 0, n = data.length; i < n; i++) {
						tmp.push({
							text: baidu.encodeHTML(data[i]['name']),
							value: data[i]['trans_id']
						});
					}
					transSelect.options = tmp;
					transSelect.value = tmp[0]['value'];
					me.setContext("transformNameSelectSelected", tmp[0]['value']);
					transSelect.render();
				},
				onFail: function(){
					ajaxFailDialog();
				}
			});
		}
	},
	
	/**
	 * 改变按钮状态
	 */
	changeBtnStatus: function(){
		var me = this;
		var btn = ui.util.get('TransURLBtn');
		
		if (me.getContext('siteListInDataSelectSelected') == '0') { // 没有选择网站范围
			btn.disable(true);
			baidu.removeClass('TransURLScopeWarn', 'hide');
		}
		else {
			btn.disable(false);
			baidu.addClass('TransURLScopeWarn', 'hide');
		}
		
		me.getTransListForSelect();
	},
	
	/**
     * 初始化单选框
     */
	initRadio : function() {
		var me = this,
			checkType = me.arg.checkType;
		
		ui.util.get('PromotionURL').getGroup().setValue(0);
		
		if (checkType && checkType == 1) {
			ui.util.get('PromotionURL').getGroup().setValue(checkType);
			me.setContext('checkTypeChecked', checkType);
		}
		
		me.switchCheckType();
	},

	/**
	 * 根据类型选择显示结果
	 */
	switchCheckType : function() {
		var me = this;
		var G = baidu.G;
		var checkType = me.getContext('checkTypeChecked');
		var promotionResult = me.getContext('promotionResult');
		var transResult = me.getContext('transResult');
		var selectBox = G('TransURLScope'),
			promotionBtn = ui.util.get('PromotionURLBtn').main,
			transBtn = ui.util.get('TransURLBtn').main;
		
		baidu.dom.hide('PromotionURLResult');
		baidu.dom.hide('TransURLResult');
		
		if (checkType == 0) {
			baidu.show(promotionBtn);
			baidu.hide(transBtn);
			
			selectBox.style.display = "none";
			if (promotionResult != null) {
				baidu.dom.show('PromotionURLResult');
			}
		} else {
			baidu.show(transBtn);
			baidu.hide(promotionBtn);
			
			selectBox.style.display = "block";
			if (transResult != null) {
				baidu.dom.show('TransURLResult');
			}
		}
	},

	/**
	 * 开始检查
	 */
	startCheck : function() {
		var me = this,
			checkType = me.getContext('checkTypeChecked');
		
		if (checkType == '0') { // 推广访问URL
			me.fcLoading();
			me.checkFcUrl();
		} else { // 转化跟踪URL
			me.transLoading();
			me.checkTransUrl();
		}
	},

	/**
	 * 查询搜索推广URL
	 */
	checkFcUrl : function() {
		var me = this;
		
		// 已配置不缓存
		fbs.trans.checkFcUrl({
			onSuccess : function(response) {
				var data = response.data;
				
				if (data) {
					me.checkFcProgress()();
				}
			},
			onFail : function() {
				ui.util.get('PromotionURLBtn').disable(false);
				ajaxFailDialog();
			}
		});
	},
	
	/**
     * 搜索推广URL进度查询
     */
    checkFcProgress : function() {
		var me = this;
		
		return function(){
			if (nirvana.trans.currentPath != 'transcheck') {
				return;
			}
			fbs.trans.getFcUrlProgress({
				onSuccess: function(response){
					var data = response.data; // processing：检查中，done：检查完成
					if (data == 'done') {
						me.checkFcResult();
						return;
					}
					if (data == 'processing') {
						setTimeout(me.checkFcProgress(), me.getContext('fcInterval')); //轮询
					}
				},
				onFail: function(){
					ui.util.get('PromotionURLBtn').disable(false);
					ajaxFailDialog();
				}
			});
	//		nirvana.util.loading.done();
		};
    },
    
	/**
     * 查询搜索推广URL检查结果
     */
    checkFcResult : function(){
		var me = this;
		
		if (nirvana.trans.currentPath != 'transcheck') {
			return;
		}
		fbs.trans.getFcUrlResult({
			onSuccess : function(response) {
				var data = response.data,
					progress = data.progress;
				
				if (progress == 'processing') {
					if (me.getContext('isFcLoading')) {
						me.fcLoading();
					}
					setTimeout(me.checkFcProgress(), me.getContext('fcInterval'));   //轮询
					return;
				}
				//已完成
				if (progress == 'done') {
					me.renderFcResult(data);
					me.setContext('isFcLoading', 0);
					ui.util.get('PromotionURLBtn').disable(false);
					return;
				}
			},
			onFail : function() {
				ui.util.get('PromotionURLBtn').disable(false);
				ajaxFailDialog();
			}
		});
	},

	/**
	 * 检查转化跟踪URL（转化跟踪工具-->全面检查-->转化跟踪URL）
	 */
	checkTransUrl : function() {
		var me = this,
			siteid = me.getContext('siteListInDataSelectSelected'),
			transid = me.getContext('transformNameSelectSelected');
		
		me.setContext('transCache', '');
			
		// 已配置不缓存
		fbs.trans.checkTransUrl({
			siteid : siteid,
			transid : transid,
			onSuccess : function(response) {
				//记录返回的查询key
				me.setContext('transKey', response.data);
				me.checkTransProgress();
			},
			onFail : function() {
				ui.util.get('SiteListInDataSelect').disable(false);
				ui.util.get('TransformNameSelect').disable(false);
				ajaxFailDialog();
			}
		});
	},
	
	/**
     * 转化跟踪URL检查结果
     */
    checkTransProgress : function(){
		var me = this;
		
		if (nirvana.trans.currentPath != 'transcheck') {
			return;
		}
		
		// 已配置不缓存
		fbs.trans.getTransUrlResult({
			key : me.getContext('transKey'),
			onSuccess : function(response) {
				var data = response.data,
					progress = data.progress;
				
				if(progress == 'processing'){
                    setTimeout(function() {
						me.checkTransProgress();
					}, me.getContext('transInterval'));   //轮询
                }
				
				if(progress == 'done') {
				 	me.hideTransLoading();
				 	ui.util.get('SiteListInDataSelect').disable(false);
					ui.util.get('TransformNameSelect').disable(false);
					if (data.listData.length == 0) {
						$$('#TransURLResult dl')[0].innerHTML = '<dt>您的页面代码安装正常。</dt>';
						baidu.removeClass('TransURLResult', 'hide');
						baidu.removeClass($$('#TransURLResult div')[0], 'hide');
						baidu.removeClass($$('#TransURLResult dl')[0], 'hide');
						return;
					}
                }
				if (me.getContext('transCache') != data) {  //当cache与返回值不同时，更新cache并执行一次渲染。
					me.setContext('transCache', data);
					ui.util.get('SiteListInDataSelect').disable(false);
					ui.util.get('TransformNameSelect').disable(false);
					me.renderTransResult(data);
				}
			},
			onFail : function() {
				ui.util.get('SiteListInDataSelect').disable(false);
				ui.util.get('TransformNameSelect').disable(false);
				ajaxFailDialog();
			}
		});
    },
	
    /**
     * 搜索推广URL检查结果渲染
     */
	renderFcResult: function(data) {
		var me = this,
			tmp,
			errorcode,
			errornum,
			urllist = [],
			html = [],
			lastTime = data.last_check_time,
			listData = data.listData,
			len = listData.length,
			tmpUrl;
		
		if (lastTime != '') {
			$$('#PromotionURLResult h4')[0].innerHTML = lastTime + ' 检查结果 <a class="downloadResult" href="trans/downloadcheckres.do?userid=' + nirvana.env.USER_ID + '" title="下载本次检查结果">下载本次检查结果</a>';
		}
		$$('#PromotionURLResult p')[0].innerHTML = '';
		
		baidu.addClass($$('#PromotionURLResult p')[0], 'hide');
		
		baidu.removeClass($$('#PromotionURLResult div')[0], 'hide');
		
		if (len == 0) {
			$$('#PromotionURLResult ul')[0].innerHTML = '<li><h5>您的页面代码安装正常。</h5></li>';
			return;
		}
		
		for (var i = 0; i < len; i++) {
			tmp = listData[i];
			errorcode = tmp.errorCode;
			errornum = tmp.errorNum;
			urllist = tmp.urlList;
			
			if (nirvana.config.ERROR.TRANS.CHECK_ALL[errorcode]) {
				if (i % 2 == 1) {
					html[html.length] = '<li class="even">'
				} else {
					html[html.length] = '<li>'
				}
				
				html[html.length] = '<h5><span>' + errornum + '</span>个' + nirvana.config.ERROR.TRANS.CHECK_ALL[errorcode].TITLE + '</h5>';
				html[html.length] = '<p>' + nirvana.config.ERROR.TRANS.CHECK_ALL[errorcode].DESC + '</p>';
				html[html.length] = '<ul>';
				for (var x = 0, y = urllist.length; x < y; x++) {
					tmpUrl = urllist[x];
					html[html.length] = '<li><a href="' + tmpUrl + '" target="_blank" title="' + tmpUrl + '">' + baidu.encodeHTML(tmpUrl) + '</a></li>';
				}
				html[html.length] = '</ul>';
				if (errornum > 10) {
					html[html.length] = '<h6><a href="trans/downloadcheckres.do?userid=' + nirvana.env.USER_ID + '" title="更多请下载">更多请下载</a></h6>';
				}
				html[html.length] = '</li>';
			}
		}
		$$('#PromotionURLResult ul')[0].innerHTML = html.join('');
	},
	
 	/**
	 * 转化跟踪URL检查结果渲染
	 */
 	renderTransResult : function(data) {
		var me = this,
			tmp,
			url,
			errorMsg,
			listData = data.listData,
			len = listData.length,
			html = [],
			dl = $$('#TransURLResult dl')[0];
		
		baidu.removeClass('TransURLResult', 'hide');
		baidu.removeClass($$('#TransURLResult div')[0], 'hide');
		
		if (len > 0) {
			for (var i = 0; i < len; i++) {
				tmp = listData[i];
				url = tmp.url;
				errorMsg = tmp.errorMsg;
				
				html[html.length] = '<dt><a href="' + url + '" target="_blank">' + baidu.encodeHTML(url) + '</a></dt>';
				html[html.length] = '<dd>' + errorMsg + '</dd>';
			}
			dl.innerHTML = html.join('');
			baidu.removeClass(dl, 'hide');
		} else {
			dl.innerHTML = '<dt>您的页面代码安装暂时没有发现问题。</dt>';
			baidu.removeClass(dl, 'hide');
		}
	},
	
    /**
     * 搜索推广URL检查结果读取中
     */
    fcLoading : function(){
		var me = this;
		
		me.setContext('isFcLoading', 1);
		
		ui.util.get('PromotionURLBtn').disable(true);
		
		baidu.g('PromotionURLLoading').innerHTML = nirvana.config.TRANS.ALL_LOADING;
		baidu.removeClass('PromotionURLLoading', 'hide');
		
		baidu.addClass($$('#PromotionURLResult div')[0], 'hide');
		$$('#PromotionURLResult h4')[0].innerHTML = '';
		$$('#PromotionURLResult ul')[0].innerHTML = '';
	},
	
    /**
     * 显示转化跟踪URL检查结果读取中
     */
    transLoading : function(){
		var	container = $$('#TransURLResult p')[0];
			
		container.innerHTML = nirvana.config.TRANS.TRANS_LOADING;
		baidu.removeClass(container, 'hide');
		baidu.addClass($$('#TransURLResult div')[0], 'hide');
		ui.util.get('SiteListInDataSelect').disable(true);
		ui.util.get('TransformNameSelect').disable(true);
	},
	
	/**
     * 隐藏转化跟踪URL检查结果读取中
     */
	hideTransLoading : function() {
		var	container = $$('#TransURLResult p')[0];
		
		container.innerHTML = '';
		baidu.addClass(container, 'hide');
		baidu.removeClass($$('#TransURLResult div')[0], 'hide');
	}
});


