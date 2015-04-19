/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    trans/transCheckSingle.js
 * desc:    转化跟踪-检查单个代码
 * author:  wanghuijun
 * date:    $Date: 2011/4/25 $
 */

ToolsModule.transCheckSingle = new ToolsModule.Action('transCheckSingle', {
	VIEW : 'transCheckSingle',
	
	STATE_MAP : {
		isStop : ''
	},

	UI_PROP_MAP : {
	},
	
	CONTEXT_INITER_MAP : {
	},
	
	//refresh后执行
	onafterrepaint : function(){
	},
	
	//第一次render后执行
	onafterrender : function(){
		var me = this;
		
		// 初始化页面状态
		me.initStat();
		
		// 绑定按钮处理事件
		me.bindButtonHandler();
	},
	
	//每次页面装载完成后执行
	onentercomplete : function(){
		var me = this;
		nirvana.trans.currentPath = 'transCheckSingle';
		
		if (me.arg.matchType == 0) { // 完全匹配，进行URL检查
			me.check();
		} else { // 部分匹配的目标URL不进行代码检查，直接显示“转化已添加成功”
			baidu.g('TransCheckTip').innerHTML = '部分匹配的目标URL无法进行页面代码安装检查，请保证您的目标页面代码安装正常。';
		}
	},
	
	/**
	 * 初始化页面状态
	 */
	initStat : function() {
		var me = this;
		
		if (me.arg.refer == 'newtrans') { // 来自于新增转化页面
			baidu.g('TransCheckTitle').innerHTML = '新增转化';
			// 隐藏取消按钮
			baidu.addClass(ui.util.get('TransCheckCancelBtn').main, 'hide');
			baidu.g('CodeStatus').innerHTML = '转化已添加成功！';
			baidu.g('CodeLoading').innerHTML = '正在帮您检查代码，请稍侯...... <a id="StopCheck" href="#">停止检查</a>';
		} else { // 来自于转化列表页面
			baidu.g('TransCheckTitle').innerHTML = '检查代码';
			baidu.g('CodeStatus').innerHTML = '';
			// 显示取消按钮
			baidu.removeClass(ui.util.get('TransCheckCancelBtn').main, 'hide');
			baidu.g('CodeLoading').innerHTML = '正在帮您检查代码，请稍侯......';
		}
	},
	
	/**
	 * 绑定按钮处理事件
	 */
	bindButtonHandler : function() {
		var me = this,
			redirctArg = {
				tabId : me.arg.tabId,
				level: me.arg.level,
				siteid: me.arg.siteid
			};
		
		// 点击完成按钮，跳到转化列表
		ui.util.get('TransEndBtn').onclick = function() {
			// 首先卸载
			ToolsModule.unloadTrans('translist');
			me.redirect('/tools/translist', redirctArg);
		};
		ui.util.get('TransCheckErrorEndBtn').onclick = function() {
			// 首先卸载
			ToolsModule.unloadTrans('translist');
			me.redirect('/tools/translist', redirctArg);
		};
		// 全面检查
		ui.util.get('TransCheckAllBtn').onclick = function() {
			// 首先卸载
			ToolsModule.unloadTrans('translist');
			ToolsModule.unloadTrans('transcheck');
			me.redirect('/tools/transcheck', redirctArg);			
		};
		// 取消按钮，跳到转化列表
		ui.util.get('TransCheckCancelBtn').onclick = function() {
			// 首先卸载
			ToolsModule.unloadTrans('translist');
			// 这里用redirect会报错，所以暂时直接打开工具
			ToolsModule.open('translist');
		};
		// 重复检查
		ui.util.get('TransCheckAgainBtn').onclick = function() {
			me.check();
		};
		
		if (baidu.g('StopCheck')) {
			// 停止检查
			baidu.g('StopCheck').onclick = me.stopCheck();
		}
	},
	
	/**
	 * 停止检查
	 */
	stopCheck : function() {
		var me = this;
		
		return function(e) {
			var e = e || window.event;
			me.setContext('isStop', 1);
			ui.util.get('TransEndBtn').disable(false);
			me.checkDone();
			baidu.event.stop(e);
		};
	},
	
	/**
	 * 检查代码loading
	 */
	checkLoading : function() {
		// 显示检查区域
		baidu.removeClass('NewTransStep2A', 'hide');
		// 隐藏错误区域
		baidu.addClass('NewTransStep2B', 'hide');
		
		baidu.removeClass('CodeLoading', 'hide');
		baidu.addClass('TransCheckTip', 'hide');
		baidu.addClass(ui.util.get('TransCheckAllBtn').main, 'hide');
		baidu.addClass('CheckAllTip', 'hide');
	},
	
	/**
	 * 检查代码done
	 */
	checkDone : function() {
		baidu.addClass('CodeLoading', 'hide');
		baidu.removeClass('TransCheckTip', 'hide');
		// 显示“全部检查”按钮，提示
		baidu.removeClass(ui.util.get('TransCheckAllBtn').main, 'hide');
		baidu.removeClass('CheckAllTip', 'hide');
		
		// 检查完以后，隐藏取消按钮
		baidu.addClass(ui.util.get('TransCheckCancelBtn').main, 'hide');
	},
	
	/**
	 * 检查代码
	 */
	check : function() {
		var me = this;
		
		me.checkLoading();
		ui.util.get('TransEndBtn').disable(true);
		
		fbs.trans.checkSingleUrl({
			siteid: me.arg.siteid,
			url: me.arg.url,
			onSuccess: function(response){
				if(me.getContext('isStop')) {
					return;
				}
				
				me.checkDone();
				
				if (response.data) {
					baidu.g('CodeStatus').innerHTML = '代码安装已成功！';
					// 清空提示文字
					baidu.g('TransCheckTip').innerHTML = '';
					
				}
			},
			onFail: function(response){
				if(me.getContext('isStop')) {
					return;
				}
				var url = me.arg.url,
					errorCode = response.errorCode;
				
				baidu.g('CheckReultTransTargetUrl').href = url;
				baidu.g('CheckReultTransTargetUrl').innerHTML = insertWbr(baidu.encodeHTML(url));
				if (errorCode && errorCode.message) {
					baidu.g('ResultInfo').innerHTML = errorCode.message;
				}
					
				// 隐藏检查区域
				baidu.addClass('NewTransStep2A', 'hide');
				// 显示错误信息区域
				baidu.removeClass('NewTransStep2B', 'hide');
				
				me.getCode();
			}
		});
		// 页面需要停止检查，所以这里不需要loading
	//	nirvana.util.loading.done();
	},
	
	/**
	 * 获取代码
	 */
	getCode : function() {
		var me = this,
			G = baidu.g;
		
		fbs.trans.jsCode({
			siteid : me.arg.siteid,
			onSuccess : function(response) {		
				var codeText = G('TransCodeTextarea'),
					codeTip = G('CopyEndTip');
				
				codeText.value = response.data;
				baidu.on(codeText, 'click', function() {
					codeText.select()
				});
				
				var clip = new Swf({
					"id": "NewTransClipBtn",
					"url": "./asset/swf/clipBtn.swf",
					"width": 152,
					"height": 27,
					"instanceName": "instanceName",
					"params": {
						wmode: "transparent"
					},
					"vars": {
						txt: "复制代码"
					}
				});
				clip.appendTo(G('TransCopyBtn'));
				
				clip.onsuccess = function() {
					codeTip.innerHTML = "复制成功！";
					setTimeout(function() {codeTip.innerHTML = "";}, 2000);
				};
				
				clip.onClip = function() {
					codeText.select();
					return codeText.value.replace(/\<br \/\>/g, ''); // 此处返回要被复制的值，注意需要过滤所有br
				};
				
				clip.onfail = function() {
					codeTip.innerHTML = "复制失败，请手动复制！"
				};	
			},
			onFail : function() {
				ajaxFailDialog();
			}
		});
	}
});