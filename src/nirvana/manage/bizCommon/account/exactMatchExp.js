/*
 * nirvana
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:    manage/exactMatchExp.js
 * desc:    精确匹配扩展（地域词扩展）
 * author: 	guanwei01
 * date:    $Date: 2012/12/04 $
 */

manage.exactMatchExp = new er.Action({
	VIEW: 'exactMatchExp',
	IGNORE_STATE : true,

	/**
	 * 设置tab
	 * @param {Object} callback
	 */
	CONTEXT_INITER_MAP : {
		tabSet: function(callback){
			var me = this;
            var tabConfig = nirvana.env.ADVANCED_IP_EXCLUDED
                ? ['基本设置', 'IP排除', '高级IP排除', '精确匹配扩展']
                : ['基本设置', 'IP排除', '精确匹配扩展'];
            var tabValue  = nirvana.env.ADVANCED_IP_EXCLUDED
                ? 3 : 2;
			me.setContext("acctSetTab", tabConfig);
            me.setContext("tabValue", tabValue);
			callback();
		}
	},

	/**
	 * 
	 */
	onafterrender: function() {
		var me     = this,
			save   = me._controlMap.setExactMatOk,
			cancel = me._controlMap.setExactMatCancel;
		// 先把按钮disabled掉
		save.disable(1);
		// 检查缓存里面有没有status变量
		if(manage.exactMatchExp._cache.status != undefined)
			return me.initial(manage.exactMatchExp._cache.status);
		// 获取用户已有的状态
		fbs.account.getExactMatchExpStatus({
			onSuccess: function(data){
				me.initial(data.data);
				// 设置缓存变量
				manage.exactMatchExp._cache.status = data.data;
			},
			onFail: function(data){
				// 失败回调
				ajaxFailDialog();
			}
		});
	},

	/**
	 * 切换tab事件处理
	 */
	onentercomplete : function(){
		var me = this;
		me._controlMap.acctSetTab.onselect = function(tab){
			// 目标path和当前选中的tab索引
			var targetPath, inx;
			// 增加新Tab：精确匹配扩展（地域词扩展）
			if((inx = + tab) <= 3){
				//targetPath = inx == 0 ? 'manage/acctBaseSet' : inx == 1 ? 'manage/acctIpExclusion' : '';
                inx == 0 && (targetPath = 'manage/acctBaseSet');
                inx == 1 && (targetPath = 'manage/acctIpExclusion');
                inx == 2 && nirvana.env.ADVANCED_IP_EXCLUDED
                    && (targetPath = 'manage/acctIpAdvancedExclusion');
                inx == 2 && !nirvana.env.ADVANCED_IP_EXCLUDED
                    && (targetPath = 'manage/exactMatchExp');
                inx == 3 && (targetPath = 'manage/exactMatchExp');
				if(targetPath == '')
					return;
				nirvana.util.openSubActionDialog({
					id: 'accountsetDialog',
					title: '账户其他设置',
					width: 440,
					actionPath: targetPath,
					params: {},
					onclose: function(){
						fbs.material.clearCache("planinfo");
						er.controller.fireMain('reload', {});
					}
				});
				// Dialog二次定位标识
				nirvana.subaction.isDone = true;
				clearTimeout(nirvana.subaction.resizeTimer);
				baidu.g('ctrldialogaccountsetDialog').style.top = baidu.page.getScrollTop() + 200 + 'px';
			}
		}
	},

	/**
	 * 初始状态
	 */
	initial : function(status){
		var me     = this,
			save   = me._controlMap.setExactMatOk,
			cancel = me._controlMap.setExactMatCancel,
			checkbox = me._controlMap.OpenExactMat;
		// 如果用户没有开启
		if(status == 0){
			checkbox.setChecked(0);
		}
		// 为checkbox添加click事件
		checkbox.onclick = function(){
			var status   = checkbox.getChecked() == true ? 1 : 0;
			save.disable(
				status == manage.exactMatchExp._cache.status ? 1 : 0
			);
		};
		// 保存
		save.onclick = function(){
			// 能保存的情况肯定是和原来的缓存相反的状态
			me.save();
		};
		// 取消
		cancel.onclick = function(){
			me.onclose();
		};
	},

	/**
	 * 保存
	 */
	save : function(){
		var me     = this,
			save   = me._controlMap.setExactMatOk,
			status = !!manage.exactMatchExp._cache.status ? 0 : 1;
		// 请求
		fbs.account.setExactMatchExpStatus({
			// 参数
			items: {
				regionwext: status
			},
			onSuccess: function(data){
				// 置灰
				save.disable(1);
				// 更新缓存变量
				manage.exactMatchExp._cache.status = status;
				// 提示语
				baidu.dom.g('saveExactMatTip').style.display = 'inline-block';
			},
			onFail: function(data){
				// 失败回调
				ajaxFailDialog();
			}
		});
	}
});

// 缓存用户的状态
manage.exactMatchExp._cache = {};