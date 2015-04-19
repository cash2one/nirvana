/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: quickSetup/action.js 
 * desc: 快速新建lib所在
 * author: wangkemiao@baidu.com
 * date: $Date: 2012/02/08 $
 */


nirvana.quicksetup = {
	params : {
		wregion : [],						//地域信息
		wregionDesc : null					//地域描述，对象，包括文字（缩写描述），以及全部地域文字。如： {word:'', title:''}
	}
};

/**
 * nirvana.quickSetupLib库中包括所有与数据交互、数据处理等相关的函数
 * 
 * 注：此库中的子库step1~step3不符合此原则，在子库中包含了处理、控制的全部函数
 */
nirvana.quicksetup.lib = {
	
	// 引导页标识，默认需要引导页，在退出引导页后，置为false
	needGuidePage : true,
	
	// 轮询标志
	interval : null,
	
	/**
	 * 大步骤的html待渲染到的目标dom容器
	 */
	targetId : 'QuickSetupMain',
	actionTitle : {
		'useracct' : '快速新建账户',
		'planinfo' : '快速新建计划'
	},
	typeName : {
		'useracct' : '账户',
		'planinfo' : '计划'
	},
	
	/**
	 * 缓存控制
	 * 
	 * 说明：
	 * 		缓存中，保存快速新建相关的信息
	 * 		第一步骤信息（stepInfo）不保存在缓存中，而是保存在内存中，因为第一步骤交互较多，而且从第一步退出之后，将重新开始
	 * 		第二步骤信息不设置缓存，将直接从后台获取
	 * 		第三步骤同样不设置缓存
	 * 
	 * 其他缓存信息（非步骤数据）：
	 * 		taskinited ： 标记是否已经发送了“推送当天注册的用户的url给后端”请求
	 * 
	 */
	cache : {
		_data : null,
		_savedNames : [
			'step1',
			'step2',
			'step3'
		],
		_isloaded : false,
		_stepData : [],
		
		/**
		 * 第一步骤相关设置
		 */
		setStepInfo : function(subStep, cacheData){
			var stepData;
			
			//只设置Step1信息
			this._stepData = this._stepData || [];
			stepData = this._stepData;
			
			//subStep数-1对应着stepsData数组下标
			//即第一子步骤对应下标0，第一个元素
			
			stepData[subStep - 1] = cacheData;
			
		},
		/**
		 * 第一步骤相关读取
		 */
		getStepInfo : function(subStep){
			var stepData = this._stepData || [];
			
			return stepData[subStep - 1];
		},
		/**
		 * 第一步骤相关清空
		 * 清空某一子步骤之后全部信息
		 */
		clearStepInfoSince : function(subStep){
			var stepData = this._stepData || [],
				len = stepData.length;
			if(len > subStep){
				stepData.splice(subStep, len - subStep);
			}
		},
		/**
		 * 第一步骤相关清空
		 */
		clearStepInfo : function(){
			this._stepData = [];
		},
		
		/**
		 * 设置特定名称缓存
		 */
		set : function(name, value){
			if(baidu.array.indexOf(this._savedNames, name) > -1){
				return false;
			}
			this._data[name] = value;
			this.saveToFlashStorage();
		},
		/**
		 * 获取特定名称缓存
		 */
		get : function(name){
			var data;
			if(this._data === null){
				this.readFromFlashStorage();
			}
			if('undefined' == typeof this._data){
				this._data = {};
			}
			data = this._data;
			return data[name];
		},
		/*
		 * 删除特定名称缓存
		 */
		remove : function(name){
			var data = this._data;
			if('undefined' != typeof data[name]){
				delete data[name];
				this.saveToFlashStorage();
			}
		},
		/**
		 * 清空缓存
		 */
		clear : function(){
			this._data = null;
			this.saveToFlashStorage();
		},
		
		saveToFlashStorage : function(){
			FlashStorager.set(nirvana.env.OPT_ID + '__QuickSetupData__' + '__cas__rn__', this._data);
		},
		readFromFlashStorage : function(){
			this._data = FlashStorager.get(nirvana.env.OPT_ID + '__QuickSetupData__' + '__cas__rn__');
		}
	},
	
	loadCache : function(action){
		var me = action,
			step = me.getContext('step'),
			subStep = me.getContext('subStep'),
			data;
		data = this.cache.getStepsInfo(me);
		
		if(!data){
			return;
		}
		
		switch(step){
			case 1:
				for(var o in data){
					me.setContext(o, data[o]);
					this.setParam(o, data[o]);
				}
				break;
			case 2:
				break;
			case 3:
				break;
		}
		
	},
	
	/**
	 * 获取当前执行到的步骤，主要使用在打开快速新建浮出层之前确定之前操作执行到的步骤
	 * 从后台读取数据
	 * 把taststatus作为参数传给callback并执行
	 * 
	 * 并根据taskstate的状态，如果是新增，则会去判断是否已经超过次数了，如果超过，则不显示！
	 */
	getTaskStatus : function(callback){
		var me = this,
			step;
		
		fbs.eos.taskstatus({
			onSuccess: function(response){
				var data = response.data,
					taskstate = data.taskstate,
					// 这是因为如果state=0的话，后端没有记忆状态
					// 只能靠入口来进行判断
					tasktype = (+taskstate == 0 
						? (nirvana.env.IS_NEW_USER ? 'useracct' : 'planinfo')
						: data.tasktype)
					// tasktype = data.tasktype || '';
				
				callback && callback(taskstate, tasktype);
			},
			onFail: function(data){
				ajaxFailDialog();
			}
		});
	},
	
	/**
	 * 重置全部的模块参数
	 */
	resetParams : function(){
		nirvana.quickSetupParams = {};
	},
	
	/**
	 * 根据type参数获取整个模块action的标题
	 */
	getActionTitle : function(){
		return this.actionTitle[this.getParam('type')] || '';
	},
	
	getTypeName : function(){
		return this.typeName[this.getParam('type')] || '';
	},
	
	/**
	 * 获取参数信息
	 */
	getParam : function(name){
		return nirvana.quickSetupParams[name];
	},
	
	/**
	 * 设置参数信息
	 */
	setParam : function(name, value){
		nirvana.quickSetupParams[name] = value;
	},
	
	refreshWregion : function(action){
		var me = action,
			target = baidu.g('QuickSetupRegionInfo'),
			wregion = nirvana.quickSetupLib.getParam('wregion') || me.getContext('wregion') || [],
			wregionDesc = nirvana.quickSetupLib.getParam('wregionDesc') || me.getContext('wregionDesc') || nirvana.manage.region.abbRegion(wregion, 'account');;
		
		nirvana.quickSetupLib.setParam('wregion', wregion);
		me.setContext('wregion', wregion);
		nirvana.quickSetupLib.setParam('wregionDesc', wregionDesc);
		me.setContext('wregionDesc', wregionDesc);
		
		//html修改
		if(target){
			target.innerHTML = wregionDesc.word;
			target.setAttribute('title', wregionDesc.title);
		}
	},
	refreshPlanSchedule : function(action){
		var me = action,
			target = baidu.g('QuickSetupCurrTimeScheme'),
			scheduleValue = nirvana.quickSetupLib.getParam('scheduleValue') || '',
			str = '全部时间';
		
		me.setContext('scheduleValue', scheduleValue);
		if(scheduleValue && scheduleValue.length > 0){
			str = '自定义';
		}
		//html修改
		if(target){
			target.innerHTML = str;
			target.setAttribute('title', str);
		}
	}
};

/**
 * nirvana.quickSetupControl库中包含所有与页面渲染、控制相关的函数
 */
nirvana.quicksetup.control = {
	
	/**
	 * 去第几大步
	 */
	goStep : function(action, step){
		var me = action;
		if(step < 1){
			return;
		}
		
		me.setContext('step', step);
		//me.setContext('subStep', 1);
		//me.refreshSelf(me.getStateMap());
		this.render(action);
		
	},
	
	resetNavigation : function(action){
		var me = action,
			step = me.getContext('step'),
			stepLib = nirvana.quickSetupLib['step' + step],
			tid,
			nav = baidu.g('QuickSetupNavigation');

		//html渲染
		nav && (nav.innerHTML = er.template.get('quickSetupMainNavigation'));
		
		//只处理主导航
		for(var i = 1; i <= step; i++){
			tid = 'QuickSetupNaviStep' + i;
			
			// 区分已经完成的步骤和当前步骤
			if(i < step){
				baidu.addClass(tid, 'actived');
			} else {
                baidu.addClass(tid, 'active');
			}
		}
	},
	
	/**
	 * 进行页面的渲染
	 * 根据传入的action的信息：step以及subStep执行相应的操作
	 */
	render : function(action){
		var me = action,
			step = me.getContext('step') || 1,
			//subStep = me.getContext('subStep') || 1,
			html,
			target,
			uiList,
			stepLib = nirvana.quickSetupLib['step' + step];
		
		//执行大步的渲染
		html = er.template.get(stepLib.stepTpl);
		target = baidu.g(nirvana.quickSetupLib.targetId);
		target && (target.innerHTML = html);
		
		//初始化context
		stepLib.contextInit && stepLib.contextInit(action);
		//初始化ui控件
		nirvana.util.uiInit(target, me);
		
		//执行子render，期间执行事件绑定，并将ui控件执行初始化操作
		//返回false时说明子render的前置检查失败了，此时将关闭掉整个action，因此不进行其他处理了
		if(stepLib.render(me) !== false){
			//根据step进行最上面的导航的控制
			this.resetNavigation(me);
			//this.bindHandlers(me);
		}
		
		//初始化Bubble
		ui.Bubble.init();
		
		//二次定位，在子步骤中，如果有数据读取的显现，可能需要再次执行
		nirvana.quickSetupControl.rePosition();
		
	},
	
	/**
	 * 公用的事件绑定函数
	 */
	bindHandlers : function(action){
		var me = this;
	},
	
	/**
	 * 重新定位
	 */
	rePosition : function(){
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
		//render完成，尝试重新定位
		var dialog = ui.util.get('QuickSetup');
		dialog && dialog.resizeHandler();

		baidu.event.fire(window, 'resize');
	},
	
	/**
	 * 公共监控数据
	 * @param {Object} actionName
	 * @param {Object} param
	 * 
	 * 快捷方式
	 * logCenter('quicksetup_init');					// 进入时初始化的信息的log
	 * 
	 */
	logCenter : function(actionName, param) {
		var logParam = {
			target : actionName,
			eos_type : nirvana.quickSetupLib.getParam('type'),
			entrance : nirvana.quickSetupLib.getParam('entrance')
		};
		
		baidu.extend(logParam, param);
		
		NIRVANA_LOG.send(logParam);
	},

    /**
     * 离开创意撰写,需要弹窗确定
     */
    leaveEditIdea: function(callback) {
        ui.Dialog.confirm({
            title: '离开' + nirvana.quickSetupLib.getActionTitle() + '流程',
            content: "你的创意撰写工作尚未完成，无创意的单元无法正常进行推广，是否确认离开？",
            onok: function(){
                callback && callback();
            }
        });
    }
};

nirvana.quickSetupLib = nirvana.quicksetup.lib;
nirvana.quickSetupControl = nirvana.quicksetup.control;
nirvana.quickSetupParams = nirvana.quicksetup.params;
nirvana.quickSetupLogger = nirvana.quickSetupControl.logCenter;
