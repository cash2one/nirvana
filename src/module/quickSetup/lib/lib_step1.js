/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: quickSetup/lib/lib_step1.js 
 * desc: 快速新建步骤一 业务选择
 * author: wanghuijun@baidu.com
 * date: $Date: 2012/06/11 $
 */

nirvana.quickSetupLib = nirvana.quickSetupLib || {};

nirvana.quickSetupLib.step1 = {
	
	stepTpl : 'newquickSetupStep1',
	
	/**
	 * 内容初始化，设置UI控件参数等
	 */
	contextInit : function(action) {
        action.setContext('step1TextVirtual', '可以填写多个关键词，让百度更懂你！关键词以"，"分割');
        action.setContext('budgetInfoData', [{
            text : '51-100元',
            value : 0
        }, {
            text : '101-200元',
            value : 1
        }, {
            text : '201-500元',
            value : 2
        }, {
            text : '501-1000元',
            value : 3
        }, {
            text : '1001-2000元',
            value : 4
        }, {
            text : '2001-4000元',
            value : 5
        }, {
            text : '4001-8000元',
            value : 6
        }, {
            text : '8000元以上',
            value : 7
        }]);
	},
	
	/**
	 * 渲染函数
	 * 尽量执行quickSetupControl的render函数而不是这个，因为这个可能对外部的某些函数没有执行
	 * 如果非要执行这个：
	 *     注意控制，需要重新将step1的模板HTML渲染一次来还原可能已经被污染了的HTML，这是因为这里有子步骤的存在
	 */
	render : function(action){
		var lib = this,
			me = action;  //这里理应就是1
		
		lib.bindHandlers(me);
		lib.resume(me);
        lib.initLandingPage();
	},
	
	/**
     * 从第二步返回时，恢复状态
     */
    resume : function(action) {
        var lib = this,
            me = action,
            controlMap = me._controlMap,
            stepLib = nirvana.quickSetupLib,
            step1Text = stepLib.getParam('step1Text') || '',
            section = stepLib.getParam('section');
        
        controlMap.QuickSetupStep1Text.setValue(step1Text);
        nirvana.quickSetupLib.refreshWregion(me);
        controlMap.QuickSetup1BudgetInfo.setValue(section);
    },

    /**
     * 初始化landingpage URL推词信息
     */
    initLandingPage: function() {
        var lib = this;
        var target = baidu.g('quicksetup-step1-landingwords');
        if(target) {
            fbs.eos.getLandingPageWords({
                onSuccess: function(response) {
                    var response = response || {};
                    var data = response.data || {};
                    var words = data.words || [];
                    var i = 0;
                    var l = (words.length > 5 ? 5 : words.length);
                    if(l > 0) {
                        var html = [];
                        for (; i < l; i++) {
                            html.push(''
                                + '<a href="#" action="searchword"'
                                + 'title="' + baidu.encodeHTML(words[i]) + '"'
                                + '>'
                                + getCutString(words[i], 23, '..')
                                + '</a>');
                        }
                        if(html.length > 0) {
                            target.innerHTML = '<span>示例：</span>' 
                                + html.join('');
                        }
                    }
                     /**
                     * 监控
                     */
                    nirvana.quickSetupLogger('quicksetup_get_landingpage', {
                        value: words,
                        type: 'success'
                    });
                },
                onFail: function(response) {
                    var response = response || {};
                     /**
                     * 监控
                     */
                    nirvana.quickSetupLogger('quicksetup_get_landingpage', {
                        value: response.status,
                        type: 'fail'
                    });
                    return;
                },
                timeout: 1000,
                onTimeout: function() {
                     /**
                     * 监控
                     */
                    nirvana.quickSetupLogger('quicksetup_get_landingpage', {
                        value : 1000,
                        type: 'timeout'
                    });
                    return;
                }
            });
        }
    },
	
	/**
	 * 绑定监听事件
	 */
	bindHandlers : function(action){
		var lib = this,
			me = action,
			controlMap = me._controlMap,
			dialog = ui.util.get('QuickSetup');
		
		// 关闭浮出层时二次确认
		dialog && (dialog.getClose().onclick = lib.confirmClose);
		
        // 范围监听
        baidu.g('QuickSetupStep1').onclick = lib.clickHandler(me);
		
		// 下一步，获取关键词
		controlMap.QuickSetupNext.onclick = lib.goNext(me);

		// 选择消费区间
		controlMap.QuickSetup1BudgetInfo.onselect = function(index, data){
			/**
			 * 监控，第一步选择消费区间
			 */
			nirvana.quickSetupLogger('quicksetup_modify_spentRegion', {
				value : data.value
			});
		}
	},
	
	/**
	 * 范围click事件
	 */
	clickHandler : function(action) {
		var lib = this;
		
		return function(e) {
			var e = e || window.event,
			    target = e.target || e.srcElement,
				tagName = target.tagName.toLowerCase(),
				id = target.id,
				index;
			
			switch (id) {
                case 'QuickSetup1RegionMod':
                    lib.region.show(action);
                    break;
			}
			
            var actionName = baidu.dom.getAttr(target, 'action');
            switch (actionName) {
                case 'searchword':
                    var data = baidu.dom.getAttr(target, 'title');
                    var input = ui.util.get('QuickSetupStep1Text');
                    var value = baidu.trim(input.getValue());
                    var virtualValue = input.virtualValue;
                    input.setValue(data + ((value != virtualValue) && (value != '') ? '，' + value : ''));
                    break;
            }
			
			if (tagName == 'a') {
				baidu.event.stop(e);
			}
		};
	},
	
	/**
	 * 确认关闭当前步骤
	 */
	confirmClose : function() {
		ui.Dialog.confirm({
			title: '离开' + nirvana.quickSetupLib.getActionTitle() + '流程',
			content: '如果离开，系统将不再保留你刚刚所填写的所有内容。是否仍然选择离开？',
			onok: function(){
				nirvana.quicksetup.hide();
			},
			oncancel: function(param){}
		});
	},
	/**
	 * 去下一步
	 */
	goNext: function(action){
		var lib = this,
		    me = action,
			controlMap = me._controlMap,
			vcode = null;
		
		return function(){
			var industry = [],
				section = controlMap.QuickSetup1BudgetInfo.getValue(),
				i,
				arr;
			
			//清除错误信息
			lib.clearWarn();
			
			var input = ui.util.get('QuickSetupStep1Text');
            var value = baidu.trim(input.getValue());
            var virtualValue = input.virtualValue;
			if ((value == virtualValue) || (value == '')) {
			    baidu.g('QuickSetupNextWarn').innerHTML = '请描述你从事的业务';
                return;
			}
			
			if (section === '') {
                baidu.g('QuickSetupNextWarn').innerHTML = '请选择推广费用范围';
                return;
			}
			
			//设置缓存
            nirvana.quickSetupLib.setParam('step1Text', controlMap.QuickSetupStep1Text.getValue());
            nirvana.quickSetupLib.setParam('section', section);
			//带入第二步
			me.setContext('step1Word', value);
			
			//直接转至第二步获取关键词页面
			nirvana.quickSetupControl.goStep(me, 2);
			
			//监控
            nirvana.quickSetupLogger('quicksetup_step1_submit', {
                text: value
            });
		};
				
	},
	
	/**
	 * 清除错误信息
	 */
	clearWarn : function() {
        baidu.g('QuickSetupNextWarn').innerHTML = '';
	}
};

/**
 * 第一子步骤中需要用到的地域相关浮出层的东东
 */
nirvana.quickSetupLib.step1.region = {
	show : function(action){
		var me = action,
			param = {},
			options = {};
		options = {
			id : 'QuickSetupStepRegion',
			title : '请选择你要进行推广的地域',
			width : 440,
			actionPath : 'quicksetup/step1region',
			params : {
				type: 'account',
				step : 1,
				wregion: nirvana.quickSetupLib.getParam('wregion') || []
			},
			maskLevel: 2,
            unresize : true,
            top : (ui.util.get('QuickSetup').getDOM().style.top.replace('px', '') - 0 + 100),
			onclose : function(){
				nirvana.quickSetupLib.refreshWregion(me);
			}
		};
		
		//打开浮出框
		var dialog = nirvana.util.openSubActionDialog(options);

	}
};

nirvana.quickSetupLib.step1.region.action = new er.Action({
	/**
	 * 视图模板名，或返回视图模板名的函数
	 */
	VIEW : 'planRegion',
	
	IGNORE_STATE : true,
	
	STATE_MAP : {},
	
	UI_PROP_MAP: {},
	
	CONTEXT_INITER_MAP : {
		init : function(callback){
            var me = this,
                type = me.arg.type,
                wregion = me.arg.wregion || [];
            
            //如果无参传入，默认是全部地域
            me.setContext('wregion', wregion);          
            
            if(wregion.length == 0){
                me.setContext('checked', me.getAllRegion());
            } else {
                me.setContext('checked', wregion);
            }
            
            callback();
		}
	},
	
	onbeforeinitcontext: function(){},
	
	/**
	 * refresh后执行
	 */
	onafterrepaint : function() {},

	/**
	 * 第一次render后执行后最后会触发事件
	 */
	onafterrender : function() {
		var me = this,
			controlMap = me._controlMap;
		
		controlMap.allRegion.onclick = function(){
			me.checkAllRegion();
		};
		controlMap.partRegion.onclick = function(){
			me.checkPartRegion();
		};
		controlMap.regionOk.onclick = me.saveData();
		controlMap.regionCancel.onclick = function(){
			me.onclose();
		};
		
		// Dialog二次定位标识
		//nirvana.subaction.isDone = true;
	},
	
	/**
	 * 完成视图更新后最后会触发事件
	 */
	onentercomplete : function() {
		var me = this,
			controlMap = me._controlMap,
			iniRegion = me.getContext('checked');
		
		baidu.hide('planRegionSwitch');
		baidu.hide('acctRegionList');
		
		if(me.allChecked(iniRegion)){
			me.checkAllRegion();
		} else{
			me.checkPartRegion();
		}
	},
	
	/**
	 * 判断是否全部地域
	 * @param {Object} checkedList
	 */
	allChecked: function(checkedList){
		var chinaAll = nirvana.manage.region.ChinaAllSelectCheck(checkedList),
			abroadAll = nirvana.manage.region.AbroadAllSelectCheck(checkedList);
			
		if (chinaAll && abroadAll) {
			return true;
		}
	},
	
	/**
	 * 全部地域列表
	 */
	getAllRegion:function(){
		return [1,2,3,4,5,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37];
	},
	
	/**
	 * 选择全部地域
	 */
	checkAllRegion: function(){
		var me = this,
			controlMap = me._controlMap,
			list = controlMap.regionBody.main;;
		
		controlMap.allRegion.setChecked(true);
		baidu.hide(list);
	},
	
	/**
	 * 选择部分地域
	 */
	checkPartRegion: function(){
		var me = this,
			controlMap = me._controlMap,
			list = controlMap.regionBody.main;;
		
		controlMap.partRegion.setChecked(true);
		baidu.show(list);
	},
	
	/**
	 * 点击确定，保存数据
	 */
	saveData: function(){
		var me = this,
			controlMap = me._controlMap;
		
		return function(){
			var chosenRegion = [],
				abregion;
			
			if (controlMap.allRegion.getChecked()) {
				chosenRegion = [];
			} else {
				chosenRegion = controlMap.regionBody.getCheckedRegion();
				if(me.allChecked(chosenRegion)){
					chosenRegion = [];
				}
			}
			
			nirvana.quickSetupLib.setParam('wregion', chosenRegion);
			abregion = nirvana.manage.region.abbRegion(chosenRegion, 'account');
			nirvana.quickSetupLib.setParam('wregionDesc', abregion);
			/**
			 * 修改地域监控
			 */
			if(+me.arg.step == 1){
				nirvana.quickSetupLogger('quicksetup_modify_wregion', {
					oldvalue : me.getContext('wregion').join(),
					newvalue : chosenRegion.join()
				});
			}

			me.onclose();
		};
	}
	
});
