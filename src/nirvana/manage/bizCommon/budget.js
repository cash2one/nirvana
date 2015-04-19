/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    manage/budget.js
 * desc:    修改预算，包括账户预算和计划预算，可以用于账户优化
 * author:  wanghuijun
 * date:    $Date: 2011/1/14 $
 * param: {function(array)} arg.onMod(option) 修改预算时的回调，option为带入的参数，主要用于监控   mayue@baidu.com
 */

manage.budget = new er.Action({
	
	VIEW: 'budget',
	
	IGNORE_STATE: true,
	
	UI_PROP_MAP : {
	},
	
	CONTEXT_INITER_MAP: {
		init : function(callback){
			var me = this,
				type = me.arg.type,  //层级类型 useracct|planinfo
				planid = me.arg.planid,  //计划的id，为数组
				planname = me.arg.planname || null, //计划的名称
				bgttype = me.arg.bgttype, //预算类型：0为不限定，1为日，2为周
				//bgtstatus 新增变量 效果突降时此项有值且为5
				bgtstatus = me.arg.bgtstatus || 0,
				entrancetype = me.arg.entrancetype || '';
						
			//先确定预算类型，参数非法时置为不限定
			if('undefined' == typeof bgttype || null == bgttype || bgttype < 0 || bgttype > 2){
				bgttype = 0;
			}
			me.setContext('bgttype', bgttype);   //0 不限制预算 1日预算 2周预算
			me.setContext('bgtstatus', bgtstatus);
			
			//保存预算层级
			me.setContext('leveltype', type);
			
			//保存入口信息
			me.setContext('entrancetype', entrancetype);
						
			//多个计划 还是单个计划 ? planid.length为0实则是对应着账户级别 1单个计划 大于1为多个计划
			me.setContext('planid', planid);
			me.setContext('planname', 'string' == typeof planname ? [planname] : planname);
			
			/**
			 * 气泡：处理气泡信息
			 */
			ui.Bubble.source.budgetHelp = {
				type : 'tail',
				showByClickIcon: true,
				iconClass : 'ui_bubble_icon_blue',
				positionList : [1,8,4,5,2,3,6,7],
				needBlurTrigger : true,
				showByClick : true,
				showByOver : false,
				hideByOut : false,
				title : function(node){
					var ti = node.getAttribute('title') || node.getAttribute('bubbletitle') || node.parentNode.getAttribute('bubbletitle') || node.parentNode.getAttribute('title');
					if (ti) {
						if(ti == '您的账户平均访问量' || ti == '您的计划平均访问量' || ti == '同行账户平均访问量' || ti == '同行计划平均访问量'){
							return '平均访问量';
						}
						else if(ti == '您的账户平均下线时间' || ti == '您的计划平均下线时间' || ti == '同行账户平均下线时间' || ti == '同行计划平均下线时间'){
							return '平均下线时间';
						}
						else{
				            return(baidu.encodeHTML(baidu.decodeHTML(ti)));
						}
			        } else {
			            return(baidu.encodeHTML(baidu.decodeHTML(node.firstChild.nodeValue)));
			        }
				},
				content : function(node, fillHandle, timeStamp){
					/*
					cfg.getNoun(USER_ID, title, {
			            callback: this.fill
			        });
			        */
					//return 'loading...';
					var ti = node.getAttribute('title') || node.getAttribute('bubbletitle') || node.parentNode.getAttribute('bubbletitle') || node.parentNode.getAttribute('title'),
						content = "";
					fbs.noun.getNoun({
						word: baidu.encodeHTML(ti),
						onSuccess: function(res){
							content = baidu.decodeHTML(res.data);
							setTimeout(function(){
								//为了防止第二次缓存作用下比return还快
								fillHandle(content, timeStamp);
							},200);
						},
						onFail: function(res){
							content = "读取数据失败";
							setTimeout(function(){
								//为了防止第二次缓存作用下比return还快
								fillHandle(content, timeStamp);
							},200);
						}
					});
					return IMGSRC.LOADING_FOR_TEXT;
				}
			};
			/*
			ui.Bubble.source.budgetOnceTipInMOD = {
				type : 'tail',
				showByClickIcon: true,
				iconClass : 'ui_bubble_icon_none',
				positionList : [1,8,4,5,2,3,6,7],
				showTimeConfig : 'timeslot',		//显示控制
				needBlurTrigger : true,
				showByClick : false,
				showByOver : false,				//鼠标悬浮延时显示
				showByOverInterval : 3000,		//悬浮延时间隔
				hideByOut : true,				//鼠标离开延时关闭
				hideByOutInterval : 60*1000,		//离开延时间隔，显示持续时间
				autoShow : true,
				autoShowDelay : 10,
				title: '',
				content: '周预算全面升级，更合理，更省心！',
				onclose : function(){
					manage.budget.logCenter('budget_configuration_hasclosebubble', {});
				}
			};*/
			
			callback();
		},
		/**
		 * 初始化预算信息
		 */
		budget : function(callback){
			var me = this,
				bgttype = me.getContext('bgttype'),
				leveltype = me.getContext('leveltype'),
				planid = me.getContext('planid'),
				//bgtstatus 新增变量 效果突降时此项有值且为5
				bgtstatus = me.getContext('bgtstatus'),
				success = new Function(),
				exception = new Function();
			
			success = function(response){
				if(!response || !response.data || !response.data.listData){
					ajaxFailDialog();
					me.onclose();
					return;
				}
				
				var data = response.data.listData[0];  //获取返回数据
				
				// 从优化包打开预算
				if (me.getContext('entrancetype') == 'aopkg') {
					switch(+me.arg.opttypeid) {
                        // 效果恢复包
						case 102:
                        case 103:
						    //me.setContext('beginDate', baidu.date.parse(response.data.commData.begindate));
						    if(response.data.commData.begindate){
                                me.setContext('beginDate', new Date(+response.data.commData.begindate));
						    }
							break;
					}
				}

                // add by Huiyao 2013.1.8: 突降急救包升级版用到同老的突降包（见上面，后续老的下掉，上面代码可以删掉）
                if (me.arg.isEmergencyPkg && response.data.commData.begindate) {
                    me.setContext('beginDate', new Date(+response.data.commData.begindate));
                }
				
				// 设置预算值
				me.weekBgtInfo = data.weekbgtdata;
				me.dayBgtInfo = data.daybgtdata;
				me.bgttype = data.bgttype;
				if('undefined' == typeof me.bgttype){
					me.bgttype = 0;
				}
				me.setContext('bgttype', me.bgttype);
				
				//针对于返回的数据中 data.[daybgtdata|weekbgtdata].[dayanalyze|weekanalyze].tip的值
				//因为效果突降当前未引入周预算，故只考虑日预算
				//tip值为5时，为效果突降中判断条件1，单独处理
				//tip值为3时，处理方式与以前的处理完全一致
				
				//Log for init
				var logParam = {
					bgttype : me.bgttype,
					level : leveltype,
					planid : planid,
					hastip : 0,
					haswtip : 0,
					hasweektip : 0,
					lostclicks : 0,
					lostweekclicks : 0,
					incclicks : 0,
					suggestbudget : 0,
					suggestweekbudget : 0,
					hasencourage : 0,
					entrancetype : me.getContext('entrancetype')//Modified by Wu Huiyao(wuhuiyao@baidu.com)
					//manage.budget.logParam.entrancetype
				};
				if(me.bgttype == 2 && me.weekBgtInfo){
					
					me.bgtvalue = me.weekBgtInfo.weekbgtvalue;
					
					//if(me.weekBgtInfo.wbdvalue){
					//	logParam.hasweektip = +me.weekBgtInfo.wbdvalue.tiptype;
					//	logParam.incclicks = +me.weekBgtInfo.wbdvalue.incclicks;
					//}

					if(me.weekBgtInfo.weekanalyze){
						logParam.haswtip = +me.weekBgtInfo.weekanalyze.tip;
						logParam.lostweekclicks = +me.weekBgtInfo.weekanalyze.lostclicks;
						logParam.suggestweekbudget = +me.weekBgtInfo.weekanalyze.suggestbudget;
						logParam.hasencourage = +me.weekBgtInfo.weekanalyze.show_encourage;
                        // 突降包升级新增字段 by Huiyao 2013.1.15
                        me.setContext('suggestweekbudget', logParam.suggestweekbudget);
					}
				}
				else if(me.bgttype == 1 && me.dayBgtInfo){
					
					me.bgtvalue = me.dayBgtInfo.daybgtvalue;
					
					if(me.dayBgtInfo.dayanalyze){
						logParam.hastip = +me.dayBgtInfo.dayanalyze.tip;
						logParam.lostclicks = +me.dayBgtInfo.dayanalyze.lostclicks;
						logParam.suggestbudget = +me.dayBgtInfo.dayanalyze.suggestbudget;
						logParam.hasencourage = +me.dayBgtInfo.dayanalyze.show_encourage;
                        // 突降包升级新增字段 by Huiyao 2013.1.15
                        me.setContext('suggestbudget', logParam.suggestbudget);
					}
					//当前账户设置的是日预算，切换至周预算可能会提示损失风险以及点击增加
					if(leveltype == 'useracct' && me.weekBgtInfo){
						if(me.weekBgtInfo.wbdvalue){
							logParam.hasweektip = +me.weekBgtInfo.wbdvalue.tiptype; //1：提示点击增加,2：提示风险
							logParam.incclicks = +me.weekBgtInfo.wbdvalue.incclicks;
						}
						if(me.weekBgtInfo.weekanalyze){
							logParam.haswtip = +me.weekBgtInfo.weekanalyze.tip;
							logParam.lostweekclicks = +me.weekBgtInfo.weekanalyze.lostclicks;
							logParam.suggestweekbudget = +me.weekBgtInfo.weekanalyze.suggestbudget;
                            // 突降包升级新新增字段 by Huiyao 2013.1.15
                            me.setContext('suggestweekbudget', logParam.suggestweekbudget);
						}
					}
				}
				for(var o in logParam){
					if(typeof logParam[0] == 'number' && logParam[o] + '' == 'NaN'){
						logParam[o] = 0;
					}
				}
				
				manage.budget.logParam = logParam;
				
				// 判断是否有下线时间的权限
				if (me.arg.custom && me.arg.custom.noOffline) {
					callback();
					return;
				}
				
				// 获取预算下线时间
				if (leveltype == 'useracct') {
					fbs.account.getOffline({
						onSuccess: me.offlineCallback(callback),
						
						onFail: function(response){
							ajaxFailDialog();
						}
					});
				} else {
					if (planid.length == 1) {
						fbs.plan.getOffline({
							condition: {
								planid: planid
							},
							
							onSuccess: me.offlineCallback(callback),
							
							onFail: function(response){
								ajaxFailDialog();
							}
						});
					}
				}
			};
			
			exception = function(response){
				ajaxFailDialog();
				callback();
			};

			// 支持传入自定义数据……
			var custom = me.arg.custom || {};
			if(custom.isNoRequest) {
				success(me.arg.detailData);
				return;
			}

			if(leveltype == 'useracct'){ // 账户层级
				// 获取账户预算
				// 根据入口判断请求方法 modified by wanghuijun
				switch (me.getContext('entrancetype')) {
					case 'aopkg':
						fbs.nikon.getDetailBudget({
							level: leveltype,
                            opttypeid: me.arg.opttypeid,
                            optmd5: me.arg.optmd5,
							condition: {
								decrtype: me.arg.decrtype,
                                // 旺季包新增参数，只用于旺季包 by huiyao 2013-5-22
                                tradeid: me.arg.tradeId,
								pkgContext : nirvana.aoPkgControl.logCenter.pkgContext,
            					actionStep : nirvana.aoPkgControl.logCenter.actionStep
							},
							
							onSuccess: success,
							onFail: exception
						});
						
						break;
					default:
					    if (me.isInDecrease()) {
							fbs.aodecr.getUserBudgetDetail({
								level: leveltype,
								startindex: 0,
								endindex: 9,
								
								onSuccess: success,
								onFail: exception
							});
						} else {
							fbs.account.getBudgetDetail({
								level: leveltype,
								startindex: 0,
								endindex: 9,
								
								onSuccess: success,
								onFail: exception
							});
						}
						break;
				}
			}
			else{ //计划层级
				if(planid.length == 0){ //不应该出现这种情况
					exception();
					callback();
				}
				else {
					if(planid.length == 1){ //单计划
						switch (me.getContext('entrancetype')) {
							case 'aopkg':
							    fbs.nikon.getDetailBudget({
									level: leveltype,
									opttypeid: me.arg.opttypeid,
									optmd5: me.arg.optmd5,
									condition: {
										planid: planid[0], // 这里planid为字符串
										decrtype: me.arg.decrtype,
										optmd5: me.arg.suboptmd5,
										pkgContext : nirvana.aoPkgControl.logCenter.pkgContext,
            							actionStep : nirvana.aoPkgControl.logCenter.actionStep
									},
									
									onSuccess: success,
									onFail: exception
								});
							    break;
							default:
							    if (me.isInDecrease()) {
									fbs.aodecr.getPlanBudgetDetail({
										condition: {
											planid: planid
										},
										level: leveltype,
										startindex: 0,
										endindex: 9,
										onSuccess: success,
										onFail: exception
									});
								} else {
									fbs.plan.getBudgetDetail({
										condition: {
											planid: planid
										},
										level: 'planinfo',
										startindex: 0,
										endindex: 0,
										onSuccess: success,
										onFail: exception
									});
								}
								break;
						}
						
					}
					else{ //多计划
						me.setContext('bgttype', bgttype);
						me.bgttype = bgttype;
						var logParam = {
							bgttype : 1,
							level : leveltype,
							planid : planid,
							hastip : 0,
							haswtip : 0,
							hasweektip : 0,
							lostclicks : 0,
							lostweekclicks : 0,
							incclicks : 0,
							suggestbudget : 0,
							suggestweekbudget : 0,
							hasencourage : 0,
							entrancetype : me.getContext('entrancetype')//Modified by Wu Huiyao(wuhuiyao@baidu.com)
							// manage.budget.logParam.entrancetype
						};
						manage.budget.logParam = logParam;
						callback();
					}
				}					
			}			
		}
	},
	
	onafterrender : function(){
		var me = this,
			controlMap = me._controlMap;
		
		me.initBudgetInfo();
	},
	
	onentercomplete : function(){
		var me = this,
		    controlMap = me._controlMap,
		    bgttype = me.bgttype,
			leveltype = me.getContext('leveltype'),
			planid = me.getContext('planid'),
			obj,
			logParam;
		
		//确定选择的预算类型
		switch(bgttype){
			case 0:
				obj = 'BudgetNolimit';
				break;
			case 1:
				obj = 'BudgetDaily';
				break;
			case 2:
				obj = 'BudgetWeekly';
				break;
		}
		ui.util.get(obj).setChecked(true);
		
		//绑定切换预算类型触发事件
		controlMap.BudgetNolimit.onclick = function(){
			me.switchBudgetType(0);
		};
		controlMap.BudgetDaily.onclick = function(){
			me.switchBudgetType(1);
		};
		controlMap.BudgetWeekly.onclick = function(){
			me.switchBudgetType(2);
		};
		
		controlMap.BudgetSubmit.onclick = me.applyBudget();
		controlMap.BudgetCancel.onclick = function(){
			me.onclose();
		};
		
		
		//对输入文本框设置onchange监听函数，非ie使用了oninput，ie使用onchange
		//var comName = baidu.ie ? 'on' : 'oninput';
		baidu.on('CurBgtValue', 'onkeydown', function(e){
			baidu.removeClass('BudgetWarn', 'hide');
			baidu.g('BudgetWarn').innerHTML = '您已经进行了修改，点击确定后修改才能生效';
			baidu.addClass('BudgetExcept', 'hide');
		});
		//对输入文本框设置onfocus监听函数，用于去除set_unit_price_ini这个呈现灰色的class
		baidu.on('CurBgtValue', 'onfocus', function(e){
			if(baidu.dom.hasClass('CurBgtValue', 'set_unit_price_ini')){
				baidu.removeClass('CurBgtValue', 'set_unit_price_ini');
				baidu.g('CurBgtValue').value = '';
			}
		});
		
		baidu.on('CurBgtValue', 'onfocus', function(){
			this.select();
		});
		
		
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;

		var arr = [
		    baidu.g('BudgetHelpRadioDailyBudget'), 
		    baidu.g('BudgetHelpRadioWeeklyBudget'), 
		    baidu.g('BudgetHelpRadioNolimitBudget'), 
		    baidu.g('BudgetHelpRadioOfflineTime')
		];
		ui.Bubble.init(arr);
		//调整一下气泡位置
		//if(leveltype == 'useracct'){
		//	nirvana.subaction.bubbleReplaceTimer = setTimeout(function(){
		//		ui.Bubble.init('BubbleNewFuncShowOnce');
		//	}, 500);
		//}
	},
	
	/**
	 * 定制权限处理
	 */
	customHandler : function() {
		var me = this,
		    custom = me.arg.custom;
		
        // 隐藏单选框，计划预算本身没有就没有周预算，所以这里的判断不能在custom之后
        me.hideRadio();
		
		if (!custom) {
			return;
		}
		
		if (custom.noViewBtn && ui.util.get('ViewBudgetAnalysis')) {
			// 隐藏查看详细分析按钮
			ui.util.get('ViewBudgetAnalysis').hide(true);
		}
	},
	
	/**
	 * 隐藏单选框
	 */
	hideRadio :function() {
		var me = this,
		    // bgttype为预算打开时的bgttype，切换radio时不变
			// getContext('bgttype')为当前radio切换完以后对应的bgttype
			// 这里是在进入预算时判断的，隐藏以后不会再改变，所以取me.bgttype
		    bgttype = me.bgttype,
			arg = me.arg,
			hideradio = '',
			dom;
		
		if(me.getContext('leveltype') == 'planinfo'){
            hideradio = 'Weekly';
        }
		
		if (arg.custom && arg.custom.noRadio) {
			switch (bgttype) {
                case 1 :
                    hideradio = 'Weekly';
                    break;
                case 2 :
                    hideradio = 'Daily';
                    break;
			}
		}
		
		dom = baidu.g('Budget' + hideradio + 'BubbleContainer');
		
		if (dom) {
			baidu.hide(dom);
		}
	},
	
	/**
	 * 初始化budget信息
	 */
	initBudgetInfo : function(){
		var me = this,
			bgttype = me.bgttype,
			leveltype = me.getContext('leveltype'),
			planid = me.getContext('planid');
		
		//先切换bgttype
		me.switchBudgetType(bgttype, true);
		
	},
	
	/**
	 * 下线时间信息获取成功处理函数
	 */
	offlineCallback : function(callback){
		var me = this,
			bgttype = me.getContext('bgttype'),
			planid = me.getContext('planid');
			
		return function(response){
			var data = response.data.listData[0];
			
			me.setContext('offlineData', data);
			callback();
		};
	},
	
	/**
	 * 切换预算类型
	 * @param {Number} bgttype
	 * @param {Boolean} isInit 是否是初始信息时的切换行为
	 */
	switchBudgetType : function(bgttype, isInit){
		var me = this,
			html = '',
			planid = me.getContext('planid'),
			analysisDiv = baidu.g('BudgetAnalysisInfo'),
			diffDiv = baidu.g('BudgetDiffInfo'),
			offlineDiv = baidu.g('BudgetOffLine'),
			inputTxtBox = baidu.g('CurBgtValue'),
			currInfo,
			showPlusInfo = false;
		
		//先清除全部警告信息
		me.clearWarn();
		baidu.hide(analysisDiv);
		baidu.hide(diffDiv);
		baidu.hide(offlineDiv);
		inputTxtBox.disabled = false; //用以清除可能存在的设置的不可用状态，from 不限定预算

		//log
		var logParam = {
			newtype : bgttype,
			oldtype : me.getContext('bgttype')
		};
		if(!isInit && bgttype != me.getContext('bgttype')){
			manage.budget.logCenter('budget_configuration_switchtype', logParam);
		}

		switch(bgttype){
			case 0:
				baidu.g('CurBgtValueLabel').innerHTML = '';
				baidu.g("CurBgtPlusInfo").innerHTML = '';
				inputTxtBox.disabled = true;
				inputTxtBox.value = "不限定预算";
				break;
			case 1:
				if(planid.length > 1){//多计划区分显示
										
					baidu.g('CurBgtValueLabel').innerHTML = '';
					baidu.g("CurBgtPlusInfo").innerHTML = '元';
					baidu.addClass(inputTxtBox, 'set_unit_price_ini');
					inputTxtBox.value = '<各异>';
					showPlusInfo = false;
				}
				else{
					currInfo = me.dayBgtInfo;
										
					inputTxtBox.disabled = false;
					inputTxtBox.value = (me.bgttype == bgttype) ? currInfo.daybgtvalue : '';
					//inputTxtBox.value = (me.bgttype == bgttype) ? me.dayBgtValue : '';
					
					baidu.g('CurBgtValueLabel').innerHTML = '目前日预算';
					// 效果突降新增，推荐的可能有“不限定预算”类型，故此处进行修改
					// modified by LeoWang(wangkemiao@baidu.com)
					if( currInfo == null || !currInfo.dayanalyze || (currInfo.daybgtvalue >= currInfo.dayanalyze.suggestbudget && !me.isNolimitBudgetSuggested()) || currInfo.dayanalyze.tip == 0){ //不需要提示
						baidu.g('CurBgtPlusInfo').innerHTML = ' 元  ';
						//if(currInfo && currInfo.dayanalyze && currInfo.dayanalyze.tip > 0 && currInfo.daybgtvalue < currInfo.dayanalyze.suggestbudget){
						if(currInfo && currInfo.dayanalyze && currInfo.dayanalyze.tip > 0){
							showPlusInfo = true;
						}
					}
					// modify ended
					else{
						showPlusInfo = true;
						baidu.g('CurBgtPlusInfo').innerHTML = ' 元  推荐预算：' +
                            // modified by huiyao 2013.1.8: FIXBUG:点击不限定预算链接chrome下会出错，模拟个超链接没必要用mouseover/mouseout啊
                            '<span id="BudgetRecommandedValue" class="clickable budget_recommanded_value" title="点击设置此金额为预算" >'
                            // '<span id="BudgetRecommandedValue" class="budget_recommanded_value" title="点击设置此金额为预算" onmouseover="baidu.dom.setStyle(\'BudgetRecommandedValue\', \'text-decoration\', \'underline\')"  onmouseout="baidu.dom.setStyle(\'BudgetRecommandedValue\', \'text-decoration\', \'none\')">'
							
							// 效果突降新增，推荐的可能有“不限定预算”类型，故此处进行修改
							// modified by LeoWang(wangkemiao@baidu.com)
							 
															+ (me.isNolimitBudgetSuggested() ? '不限定预算</span>' : currInfo.dayanalyze.suggestbudget)
															+ '</span>' + (me.isNolimitBudgetSuggested() ? '' : '元');
							// modify ended
							
						//为推荐预算绑定点击事件
						if(baidu.g('BudgetRecommandedValue')){
							// 效果突降新增，推荐的可能有“不限定预算”类型，故此处进行修改
							// modified by LeoWang(wangkemiao@baidu.com)
							if(me.isNolimitBudgetSuggested()){
								baidu.on('BudgetRecommandedValue', 'onclick', function(){
									//log
									var logParam = {};
									manage.budget.logCenter('budget_configuration_editvalue', logParam);

									//先清除全部警告信息
									me.clearWarn();
									
									//选中不限定预算
									ui.util.get('BudgetNolimit').setChecked(true);
									me.switchBudgetType(0);
								});
							}
							else{
								baidu.on('BudgetRecommandedValue', 'onclick', function(){
									
									//log
									var logParam = {};
									manage.budget.logCenter('budget_configuration_editvalue', logParam);

									//先清除全部警告信息
									me.clearWarn();
									
									inputTxtBox.value = currInfo.dayanalyze.suggestbudget;
									baidu.removeClass('BudgetWarn', 'hide');
									baidu.g('BudgetWarn').innerHTML = '您已经进行了修改，点击确定后修改才能生效';
								});
							}
							// modify ended
						}
						
					}					
				}
				break;
			case 2:
				currInfo = me.weekBgtInfo;
				//if(currInfo && currInfo.weekanalyze && currInfo.weekanalyze.tip > 0 && currInfo.weekbgtvalue < currInfo.weekanalyze.suggestbudget){
				if(currInfo && currInfo.weekanalyze && currInfo.weekanalyze.tip > 0){
					showPlusInfo = true;
				}
				
				//显示基础信息
				baidu.g('CurBgtValueLabel').innerHTML = '目前周预算';
				
				// 效果突降新增，推荐的可能有“不限定预算”类型，故此处进行修改
				// modified by LeoWang(wangkemiao@baidu.com)
				if(currInfo == null ||  !currInfo.weekanalyze || (currInfo.weekbgtvalue >= currInfo.weekanalyze.suggestbudget && !me.isNolimitBudgetSuggested()) || currInfo.weekanalyze.tip == 0){ //不需要提示
					baidu.g('CurBgtPlusInfo').innerHTML = ' 元  ';
					baidu.hide(analysisDiv);
					inputTxtBox.value = (currInfo && currInfo.weekbgtvalue) ? currInfo.weekbgtvalue : '';
					break;
				}
				// modify ended
				else{
					baidu.g("CurBgtPlusInfo").innerHTML = ' 元  推荐预算：' +
                        // modified by huiyao 2013.1.8: FIXBUG:点击推荐预算值链接chrome下会出错，模拟个超链接没必要用mouseover/mouseout啊
                        '<span id="BudgetRecommandedValue" class="clickable budget_recommanded_value" title="点击设置此金额为预算" >'
                       // '<span id="BudgetRecommandedValue" class="budget_recommanded_value" title="点击设置此金额为预算" onmouseover="baidu.dom.setStyle(\'BudgetRecommandedValue\', \'text-decoration\', \'underline\')"  onmouseout="baidu.dom.setStyle(\'BudgetRecommandedValue\', \'text-decoration\', \'none\')">'
											+ currInfo.weekanalyze.suggestbudget 
											//+ me.weekBgtValue
											+ '</span>元/周（日均预算：<span id="BudgetRecommandedDailyValue">' 
											+ round(currInfo.weekanalyze.suggestbudget / 7) 
											//+ round(me.weekBgtValue / 7)
											+ '</span>元）';
					inputTxtBox.disabled = false;										
				}

				inputTxtBox.value = (me.bgttype == bgttype || me.bgttype == 1) ? currInfo.weekbgtvalue : '';
				//inputTxtBox.value = (me.bgttype == bgttype || me.bgttype == 1) ? me.weekBgtValue : '';
				
				//为推荐预算绑定点击事件
				if(baidu.g('BudgetRecommandedValue')){
					baidu.on('BudgetRecommandedValue', 'onclick', function(){
						//log
						var logParam = {
							bgttype : bgttype,
							level : me.getContext('leveltype'),
							planid : planid
						};
						manage.budget.logCenter('budget_configuration_editvalue', logParam);
						
						inputTxtBox.value = currInfo.weekanalyze.suggestbudget;
						//先清除全部警告信息
						me.clearWarn();
						
						baidu.removeClass('BudgetWarn', 'hide');
						baidu.g('BudgetWarn').innerHTML = '您已经进行了修改，点击确定后修改才能生效';
					});
				}
				
				//如果当前设定了日预算，切换至了周预算，且需要提示，1提示点击增加,2：提示风险
				if(me.bgttype == 1 && me.weekBgtInfo && me.weekBgtInfo.wbdvalue && me.weekBgtInfo.wbdvalue.tiptype){
					baidu.g('BudgetWeekWarn').innerHTML = currInfo.wbdvalue.tiptype == 1
														  ? '通过一周内预算动态调配，预计将使您增加<strong>' + currInfo.wbdvalue.incclicks + '</strong>个点击！'
														  : '采用此预算预计将使您增加<strong>' + currInfo.wbdvalue.incclicks + '</strong>个点击！（周预算请勿低于您的历史消费，否则将会错失商机。）';
					baidu.removeClass('BudgetWeekWarn', 'hide');
				}
				
				break;
		}
		
		//如果切换了不同的类型，则显示已经更改需要确认信息
		if(bgttype != me.bgttype){
			baidu.removeClass('BudgetWarn', 'hide');
			baidu.g('BudgetWarn').innerHTML = '您已经进行了修改，点击确定后修改才能生效';
		}
		
		if(showPlusInfo){//如果需要继续显示下面的扩展信息

			//是否显示建议信息？
			me.handleBudgetAnalysisInfo(bgttype);
		}
		
		me.setContext('bgttype', bgttype);
		
		
		//同行标杆信息或者7天分配信息
		if((bgttype == 1 && currInfo && currInfo.dayanalyze && currInfo.dayanalyze.show_encourage) || bgttype == 2){
			me.handleBudgetDiffInfo(bgttype);
		}
		
		//处理下线信息
		if(planid.length <= 1){
			me.switchBudgetOffLine(bgttype);
		}
        
        // 定制权限处理
        me.customHandler();
	},
	
	/**
	 * 处理预算分析数据的显示
	 */
	handleBudgetAnalysisInfo: function(bgttype){
		if(bgttype == 0){
			return;
		}
		var me = this,
			planid = me.getContext('planid'),
			planname = me.getContext('planname'),
			leveltype = me.getContext('leveltype'),
			analysisDiv = baidu.g('BudgetAnalysisInfo'),
			currInfo,
			html = '',
			multiPlanTip = er.template.get('budgetAnalysisInfomationv1'),
			budgetokTip = er.template.get('budgetAnalysisInfomationv2'),
			suggestbgtTip,
			budgetwarnTip = [
			    er.template.get('budgetAnalysisInfomationv4t1'),
			    er.template.get('budgetAnalysisInfomationv4t2'),
			    er.template.get('budgetAnalysisInfomationv4t3')
			],
			hasDetailBut = false,
			// 效果恢复的期初时间
			beginDate,
			tnum;
		
		switch(bgttype){
			case 1: //日预算
				currInfo = me.dayBgtInfo.dayanalyze;
				if(currInfo.tip == 5){
					suggestbgtTip = er.template.get('budgetAnalysisInfomationv3t3');
				}
				else{
					suggestbgtTip = er.template.get('budgetAnalysisInfomationv3t1');
				}
				break;
			case 2: //周预算
				currInfo = me.weekBgtInfo.weekanalyze;
				suggestbgtTip = er.template.get('budgetAnalysisInfomationv3t2');
				break;
		}
		
        if ('undefined' === typeof currInfo.lostclicks || parseInt(currInfo.lostclicks) == 0 || isNaN(parseInt(currInfo.lostclicks))) { // 没有损失点击，话术会修改
            budgetwarnTip[0] = er.template.get('budgetAnalysisInfomationv4t10');
        }
        else { // 损失点击，且只针对日预算，才有升级的预算话术
            // 升级的损失点击新增的预算话术 add by Huiyao 2013.3.20
            if (1 == bgttype && currInfo && +currInfo.retripercent) {
                var bugetSaveClkInfo = er.template.get('budgetAnalysisInfoSaveClks');
                bugetSaveClkInfo = bugetSaveClkInfo.replace(/%saveClks/, currInfo.retripercent);
                // 在原有建议预算话术新增：“挽回xx%的损失点击”话术
                suggestbgtTip = suggestbgtTip.replace(/<\/li>/, bugetSaveClkInfo + '</li>');
            }
        }
			
		if('undefined' == typeof currInfo || currInfo == null){
			return;
		}
		
		if(planid.length > 1){ //计划层级且多计划
			html = multiPlanTip;
		}
		else{
			switch(currInfo.tip){
				case 1: //预算合理
					html = budgetokTip;
					break;
				case 2: //预算风险
					html = suggestbgtTip;
					html += budgetwarnTip[2];
					hasDetailBut = true;
					break;
				case 3: //需提供日预算建议
				case 4: //需提供周预算建议
					html = suggestbgtTip;
					html += budgetwarnTip[0];
					hasDetailBut = true;
					if(bgttype == 1 && currInfo.show_encourage){
						html += budgetwarnTip[1];
					}
					break;
				case 5: //效果突降新增，需要还原期初值
					html = suggestbgtTip;
					beginDate = me.getContext('beginDate') || nirvana.decrControl.beginDate;
					html = html.replace(/%specdate/, baidu.date.format(beginDate, "MM月dd日"));
					break;
			}
		}

		/**
		 * 容错处理，可能没有查看详细分析按钮
		 * modified by LeoWang(wangkemiao@baidu.com)
		 */
		if(!currInfo.startpoint
			|| !currInfo.endpoint
			|| !currInfo.budgetpoint
			|| !currInfo.keypoints) {
			hasDetailBut = false;
		}
		
		/**
		 * 效果突降新增，推荐的可能有“不限定预算”类型，故此处进行修改
		 * modified by LeoWang(wangkemiao@baidu.com)
		 */
		if(currInfo.suggestbudget == 0){
			html = html.replace(/%v/, '不限定预算');
		}
		else{
			html = html.replace(/%v/, currInfo.suggestbudget + '元');
		}
		/**
		 * modify ended
		 */
		var namestr = planname != null ? planname[0] : ''; 
		html = html.replace(/%s/, bgttype == 2 ? '账户周预算' : (leveltype == 'useracct' ? '账户预算' : '计划<strong>' + baidu.encodeHTML(namestr) + '</strong>预算'));  //因为什么的限制
		html = html.replace(/%g/, leveltype == 'useracct' ? '同行' : '同类计划');
		html = html.replace(/%l/, bgttype == 2 ? '上周' : '近期');
		html = html.replace(/%n/, currInfo.lostclicks);
		html = html.replace(/%w/, currInfo.words);
		html = html.replace(/%m/, currInfo.model_num);
		html = html.replace(/%o/, currInfo.maxbudget);
		
		baidu.show(analysisDiv);
		baidu.g('budgetAnalysisDetailList').innerHTML = html;
		
		//如果有详情按钮

		if(hasDetailBut && baidu.g('ViewBudgetAnalysisButtonContainer')){
			var viewdetailbut = ui.util.create('Select', {
				'id' : 'ViewBudgetAnalysis',
				'width' : '110',
				'emptyLang' : '查看详细分析',
				'class' : 'select_menu'
			}, baidu.g('ViewBudgetAnalysisButtonContainer'));
			
			baidu.addClass(viewdetailbut.main, 'select_menu');
			viewdetailbut.onmainclick = function(){
				//log
				var logParam = {
					action : 1
				};
				manage.budget.logCenter('budget_configrutaion_analysis_detail', logParam);
				nirvana.aoPkgControl.logCenter.sendAs('nikon_budget_analysis_viewdetail');
				
				baidu.removeClass('MaskForBudgetAnalysis', 'hide');
				baidu.dom.setStyles('MaskForBudgetAnalysis', {
					width : baidu.page.getViewWidth() + 'px',
					height : baidu.page.getViewHeight() + 'px'
				});
				
				baidu.removeClass('BudgetAnalysisDetail', 'hide');
				baidu.g('BudgetAnalysisInfoContainer').innerHTML = '<div id="BudgetAnalysisFlashTitle" class="budget_flash_title"></div><div id="BudgetAnalysisFlashArea"></div><div id="BudgetAnalysisFlashIntro" class="budget_flash_intro"></div>';
				me.showAnalysisDetailFlash(currInfo, (bgttype == 1 ? me.dayBgtInfo.daybgtvalue : (bgttype == 2 ? me.weekBgtInfo.weekbgtvalue : 0)));
			};
			//为详情浮出层的关闭按钮添加响应
			baidu.on('BudgetAnalysisDetailClose', 'onclick', function(){
				//log
				var logParam = {
					action : 0
				};
				manage.budget.logCenter('budget_configrutaion_analysis_detail', logParam);
				nirvana.aoPkgControl.logCenter.sendAs('nikon_budget_analysis_closedetail');
				
				baidu.addClass('MaskForBudgetAnalysis', 'hide');
				baidu.addClass('BudgetAnalysisDetail', 'hide');
			});
			baidu.on('BudgetAnalysisDetailClose', 'onmouseover', function(){
				baidu.addClass('BudgetAnalysisDetailClose', 'ui_dialog_close_hover');
			});
			baidu.on('BudgetAnalysisDetailClose', 'onmouseout', function(){
				baidu.removeClass('BudgetAnalysisDetailClose', 'ui_dialog_close_hover');
			});
			
			if(baidu.g('MaskForBudgetAnalysis')){
				baidu.on('MaskForBudgetAnalysis', 'onclick', function(){//log
					var logParam = {
						bgttype : bgttype,
						level : leveltype,
						planid : planid,
						action : 0
					};
					manage.budget.logCenter('budget_configrutaion_analysis_detail', logParam);
					nirvana.aoPkgControl.logCenter.sendAs('nikon_budget_analysis_closedetail');
					
					baidu.addClass('MaskForBudgetAnalysis', 'hide');
					baidu.addClass('BudgetAnalysisDetail', 'hide');
				});
			}
			
			this._controlMap.ViewBudgetAnalysis = viewdetailbut;			
		}
	},
	
	showAnalysisDetailFlash : function(data, currBudget){
		var me = this;
		var diffword = me.getContext('bgttype') == 1 ? '日' : '周'; 
		
		baidu.g('BudgetAnalysisFlashTitle').innerHTML = diffword + '预算详情分析';
		
		// 创建flash
		baidu.g('BudgetAnalysisFlashArea').innerHTML = baidu.swf.createHTML({
			id: "BudgetAnalysisSwf",
			url: SWFSRC.BUDGET_CHART.replace('%s', Math.random()),
			width: 510,
			height: 180,
			wmode: 'Opaque'
		});
		
		baidu.g('BudgetAnalysisFlashIntro').innerHTML = me.getContext('bgttype') == 2 ? 
					'注：该分析仅代表上周的情况，实际效果请以线上表现为准。'
				:
					'注：该分析仅代表近期的情况，实际效果请以线上表现为准。';
		
		var nodes = data.keypoints,
		    xml = [],
			coord = [],
			currentBudgetX = currBudget || 0, // 不设置预算时，当前预算点为0
			firstNode = data.startpoint,
			lastNode = data.endpoint,
			budgetNode = data.budgetpoint,
			temp = [];
		
		for (var i = 0, l = nodes.length; i < l;) { //这里不++，因为会splice 后端保证数据升序
			coord = nodes[i];
			if (+coord[0] <= +firstNode[0]) {
				nodes.splice(i, 1); //比起点横坐标小的直接删除
				l--;
			}
			else {
				break; //第一次大于起点时break循环
			}
		}
		
		
		//整理为一个数组
		temp.push(firstNode);
		for(var i = 0; i < nodes.length; i++){
			temp.push(nodes[i]);
		}
		temp.push(lastNode);
		temp.push(budgetNode);
		
		xml[xml.length] = '<?xml version="1.0" encoding="utf-8"?>';
		xml[xml.length] = '<data><setting vLabel="' + (diffword == '日' ? '日均' : '每周') + '客户访问量次" hLabel="每' + diffword + '预算(元)" usePower="1"/>';
		
		for (var i = 0, l = temp.length; i < l; i++) {
			coord = temp[i];
			
			var x = +coord[0];
			var y = +coord[1];
			
			if (x <= currentBudgetX) { //当前点小于当前预算
				if (i + 1 < l) { //存在下一个点
					var next_coord = temp[i + 1];
					if (next_coord[0] >= currentBudgetX) {
						var k = (next_coord[1] - y) / (next_coord[0] - x); //直线斜率
						if (!isNaN(k) && isFinite(k) && k >= 0) {
							var currentBudgetY = ((currentBudgetX - x) * k + y);
							xml[xml.length] = '<item h="' + currentBudgetX + '" v="' + currentBudgetY + '" type="start" label="当前预算' + currentBudgetX + '元/' + diffword + '"/>';
						}
					}
				}
			}
			
			if (i == l - 1) { //建议预算
				xml[xml.length] = '<item h="' + coord[0] + '" v="' + coord[1] + '" type="end" label="推荐预算' + coord[0] + '元/' + diffword + '"/>';
			}
			else {
				xml[xml.length] = '<item h="' + coord[0] + '" v="' + coord[1] + '"/>';
			}
			
		}
		
		xml[xml.length] = '</data>';
		xml = xml.join('');
		
		invokeFlash('BudgetAnalysisSwf', 'setData', [xml]);		
	},
	
	/**
	 * 处理同行标杆信息及周预算分配预览图
	 */
	handleBudgetDiffInfo : function(bgttype){
		var me = this,
			currInfo,
			diffDiv = baidu.g('BudgetDiffInfo'),
			titleDiv = baidu.g('BudgetDiffTitle'),
			detailDiv = baidu.g('BudgetDiffDetail'),
			leveltype = me.getContext('leveltype'),
			html = '',
			diffInfoTitle = [
			    '',
			    '同行标杆信息：',
			    '本周预算分配预览图：'
			];
		
		// 首先判断显示权限
		if (me.arg.custom && me.arg.custom.noDiff) {
			return;
		}
		
		if(bgttype == 1){
			if(!me.dayBgtInfo){
				return;
			}
			currInfo = me.dayBgtInfo.dayanalyze;
		}
		else{
			if(!me.weekBgtInfo){
				return;
			}
			currInfo = me.weekBgtInfo.wbdvalue;
		}

		if(currInfo == null || typeof currInfo == 'undefined') {
			return;
		}
		
		//先判断
		if(bgttype == 0 
			|| (bgttype == 1 && (!currInfo.show_encourage || !currInfo.incitermsg || currInfo.incitermsg.length == 0))
			|| (bgttype == 2 && !currInfo.barlist)) {
			return;
		}
		

		baidu.show(diffDiv);
		//设置显示标题
		titleDiv.innerHTML = diffInfoTitle[bgttype];
		if(bgttype == 2){
			titleDiv.innerHTML += '<span id="WeekBubbleHelpInfo" class="ui_bubble" bubblesource="budgetHelp" bubbletitle="本周预算分配预览图">&nbsp;</span>';
		}
		ui.Bubble.init('WeekBubbleHelpInfo');
		switch(bgttype){
			case 1: //日预算
				//显示同行标杆信息
				var info = currInfo.incitermsg;
				
				var arr, item, result, startpoint, selfpoint, otherpoint, endpoint;
				
				startpoint = me.getHandledTimeStr(info[0][0]);
				endpoint = me.getHandledTimeStr(info[3][0]);
				
				var date = new Date();
//				var stime = me.getHandledTime(info[0][0], 1),
//					selftime = me.getHandledTime(info[1][0]),
//					othertime = me.getHandledTime(info[2][0]),
//					etime = me.getHandledTime(info[3][0], 1);
				var stime = info[0][1],
					selftime = info[1][1],
					othertime = info[2][1],
					etime = info[3][1];
				
//				var total = (etime.getTime() - stime.getTime()) / 1000; //取相差秒数
//				var ave = total / 360;  //每像素分配到的秒数，总长是380px
//				
//				var selfdis = round(selftime.getTime() - stime.getTime()) / 1000 / ave - 4;   //这里的-4是微调位置
//				var otherdis = round(othertime.getTime() - stime.getTime()) / 1000 / ave - 4;  //这里的-4是微调位置
				var total = etime - stime;
				var ave = total / 360;
				var selfdis = round(selftime - stime) / ave - 4;
				var otherdis = round(othertime - stime) / ave - 4;
				var distance = otherdis - selfdis;
				var needDiff = (distance < 180);
				var needDiff1 = (distance > 350);
				var isRev = (distance < 0); //是否其他的是在前面
				if(isRev){
					distance = -distance;
					needDiff = (distance < 180);
					needDiff1 = (distance > 330);					
				}
				var totledis = 163, //tip总宽度
					space = 12, //空间残余宽度，放于两个tip中间使得两个tip分别与两边平齐
					smalldis = 15, //tip箭头处于左下需位移宽度
					largedis = 158, //tip箭头处于右下需位移宽度
					microdis = 2; //微调
				var curValue;
				var titles = leveltype == 'useracct' ? 
						['您的位置', 
						 '同行标杆'] 
					: 
						['您的计划位置', 
						 '同行标杆计划'];
				
				var tstr = leveltype == 'useracct' ? '账户' : '计划';
				
				curValue = isRev ? otherdis : selfdis;
				var othValue = isRev ? selfdis : otherdis;
				var pos1, pos2;
				if(needDiff){ //相隔小于180 需要前面的tip箭头在下右
					pos1 = curValue - largedis + microdis;
					pos2 = space - (360 - othValue) + largedis + microdis;
				}
				else if(needDiff1){ //相隔大于350 后面的tip箭头在下右
					pos1 = curValue - smalldis + microdis;
					pos2 = space - (360 - othValue) + smalldis + microdis;
				}
				else{
					pos1 = curValue - smalldis + microdis;
					pos2 = space - (360 - othValue) + largedis + microdis;
				}
				
				html = '<table cellspacing="0" cellpadding="0" class="incite_table_container">';
				html += '<td></td>';
				html += '<td colspan="2" style="text-align:left;">';
				html += '<div class="budget_tip_main" style="left:' + pos1 + 'px;">';
				html += '<h2>' + (isRev ? titles[1] : titles[0] ) + '</h2>';
				// Deleted by wuhuiyao
				//html += '<div><ul><li>平均访问量：' + ( isRev ? info[2][2] : info[1][2] ) + '次/天 <span id="BubbleHelpYourAvePV" class="ui_bubble" bubblesource="budgetHelp" bubbletitle="您的' + tstr + '平均访问量">&nbsp;</span></li>';
				html += '<div><ul>';//Added by wuhuiyao
				html += '<li>平均下线时间：' + ( isRev ? info[2][0] : info[1][0] ) + ' <span id="BubbleHelpYourAveOffline" class="ui_bubble" bubblesource="budgetHelp" bubbletitle="您的' + tstr + '平均下线时间">&nbsp;</span></li></ul></div>';
				html += '<div class="budget_tip_sharp' + (needDiff ? '_bottomright' : '') + '"></div>';
				html += '</div>';

				curValue = isRev ? selfdis : otherdis;
				html += '<div class="budget_tip_main" style="left:' + pos2 + 'px;">';
				html += '<h2>' + (isRev ? titles[0] : titles[1] ) + '</h2>';
				// Deleted by wuhuiyao
				//html += '<div><ul><li>平均访问量：' + ( isRev ? info[1][2] : info[2][2] ) + '次/天 <span id="BubbleHelpOtherAvePV" class="ui_bubble" bubblesource="budgetHelp" bubbletitle="同行' + tstr + '平均访问量">&nbsp;</span></li>';
				html += '<div><ul>';//Added by wuhuiyao
				html += '<li>平均下线时间：' + ( isRev ? info[1][0] : info[2][0] ) + ' <span id="BubbleHelpOtherAveOffline" class="ui_bubble" bubblesource="budgetHelp" bubbletitle="同行' + tstr + '平均下线时间">&nbsp;</span></li></ul></div>';
				html += '<div class="budget_tip_sharp' + (needDiff1 ? '_bottomright' : '') + '"></div>';
				html += '</div>';
				
				html += '</td>';
				//html += '<td></td>';
				
				//显示标杆信息
				html += '<tr><td class="incite_timespan">' + startpoint + '</td>';
				html += '<td>';
				html += '<div id="EncourageDetailContainer" class="incite_timepoint_main">';
				html += '<div id="incite_timepoint1" class="incite_timepoint_blue" style="left: ' + selfdis + 'px;"></div>';
				html += '<div id="incite_timepoint2" class="incite_timepoint_red" style="left: ' + otherdis + 'px;"></div>';
				//<div id="incitetitle1" class="incitetitle2" style="left: -6.96889px;">您的计划位置</div>
				//<div id="incitetitle2" class="incitetitle2" style="left: 335.049px;">同行标杆计划</div>
				html += '</div>';
				html += '</td>';
				html += '<td class="incite_timespan">' + endpoint + '</td></tr>';
				html += '</table>';
				detailDiv.innerHTML = html;
				

				ui.Bubble.init('BubbleHelpYourAvePV');
				ui.Bubble.init('BubbleHelpYourAveOffline');	
				ui.Bubble.init('BubbleHelpOtherAvePV');
				ui.Bubble.init('BubbleHelpOtherAveOffline');	
				
				break;
			case 2: //周预算
				//显示7天分配信息
				var info = currInfo.barlist;
				if(!info || info.length < 7){
					return;
				}
				html += '<table cellspacing="0" cellpadding="0">';
				html += '<tr>';
				html += '<td width="90"></td>';
				html += '<td width="420">';
				html += '<div id="BudgetWeekHistogram">';
				html += '<h5><span class="tip_cons">消费</span><span class="tip_time">时间</span></h5>';
				html += '<ul class="histogram" id="Histogram">';
				html += me.buildHistogram(info);
				html += '</ul>';
				html += '</div>';
				html += '</td>';
				html += '<td style="vertical-align:top;">';
				html += '<ul>';
				html += '<li><span class="display_squart_gray">&nbsp;</span>已消费</li>';
				html += '<li><span class="display_squart_green">&nbsp;</span>预计当日预算</li>';
				html += '</ul>';
				html += '</td>';
				detailDiv.innerHTML = html;
				break;
		};
		
	},
	
	/**
	 * 创建周预算分配预期柱状图的函数
	 */
	buildHistogram : function(data) {
		var cont = [],
		    max = Math.max(data[0].data, data[1].data, data[2].data, data[3].data, data[4].data, data[5].data, data[6].data),
			tmp = [],
			heightValue = 0,
			week = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
			classStat = '',
			title,
			num = 0; // 坐标数值，消费为0时显示“无消费”
		
		for (var i = 0; i < 7; i++) {
			tmp = data[i];
			heightValue = max == 0 ? 0 : (tmp.data/max) * 100 + 'px';
			num = subStrCase(fixed(tmp.data), 6); //所有数字最长显示6位字符，多于6位的截掉小数点后的相应位数(如果小数点后两位全部截掉，则小数点也不显示)，少于6位的整数小数点后补零
			title = fixed(tmp.data);
			
			if (num.indexOf('.') == 5) {
				num = subStrCase(num, 5);
			}
			if (tmp.type == 2) { //消费
				classStat = 'class="budget_off"';
				if (num == 0) {
					num = '无消费';
					title = '无消费';
				}
			} else { //预算
				classStat = '';
			}
			cont[i] = '<li ' + classStat +  ' id="Week' + i + '" title="' + title + '"><span>' + num + '</span><span class="shape" style="height:' + heightValue +'"></span><em>' + week[i] + '</em></li>';
		}
		
		return cont.join('');
	},
	
	/**
	 * 获取时间的向下30min取整
	 */
	getHandledTimeStr : function(time){
		var item, arr, result;
		arr = time.split(':');
		if(arr[1] == '00'){
			if(arr[2] > '00'){
				arr[2] = '00';
				arr[1] = '30';
			}
		}
		else if(arr[1] < '30'){
			arr[2] = '00';
			arr[1] = '30';
		}
		else if(arr[1] == '30'){
			if(arr[2] > '00'){
				arr[2] = '00';
				arr[1] = '00';
				arr[0] = arr[0] - 0 + 1;
			}
		}
		else{
			arr[2] = '00';
			arr[1] = '00';
			arr[0] = arr[0] - 0 + 1;
		}
		result = arr.join(':');
		return result.substring(0, 5);
	},
	
	/**
	 * 将获得的时间转化为需要的时间，按需要向下30min取整
	 */
	getHandledTime : function(timestr, change){
		var arr,
			date = new Date(),
			h,m,s;
		arr = timestr.split(':');
		date.setHours(arr[0], arr[1], arr[2], 0);
		if(change){
			if(arr[1] == '00'){
				if(arr[2] > '00'){
					date.setHours(date.getHours(), 30, 0, 0);
				}
			}
			else if(arr[1] < '30'){
				date.setHours(date.getHours(), 30, 0, 0);
			}
			else if(arr[1] == '30'){
				if(arr[2] > '00'){
					date.setHours(date.getHours() + 1, 0, 0, 0);
				}
			}
			else{
				date.setHours(date.getHours() + 1, 0, 0, 0);
			}
		}
		return date;
	},
	

	//处理下线信息
	switchBudgetOffLine : function(bgttype){
		var me = this,
			planid = me.getContext('planid'),
			leveltype = me.getContext('leveltype'),
			data = me.getContext('offlineData');
		
		// data是前端设置的，所以不存在的情况则不显示就可以，不用提示错误
		if(!data){
			//ajaxFailDialog('下线时间数据获取异常！');
			baidu.hide('BudgetOffLine');
			return;
		}
		
		var offline = data.offlinestat,
			planname = data.planname;
				
		if (offline) {
			me.handleBudgetOffLineInfo(offline);
		} else { //没有下线时间
			if (planname) { // 计划预算
				baidu.g('BudgetOffLineDetail').innerHTML = '<p style="text-align:center; margin:30px 10px; color:#777;">最近30天内，您的推广计划 <strong>' + baidu.encodeHTML(planname) + '</strong> 没有因超出推广计划预算而下线</p>';
			} else { // 账户预算
				baidu.g('BudgetOffLineDetail').innerHTML = '<p style="text-align:center; margin:30px 10px; color:#777">最近30天内，您的账户没有因超出账户预算而下线</p>';
			}
		}
		
		if(planid.length > 1){ //多计划
			baidu.hide('BudgetOffLine');
		} else {
			baidu.show('BudgetOffLine');
		}
	},
	
	/**
	 * 处理下线时间信息
	 */
	
	handleBudgetOffLineInfo : function(data){
		var me = this,
			date,
			html = '';
		
		html += '<div class="budget_offline_leadcontainer">';
		html += '<span style="margin:0 15px;"><span class="display_squart_green">&nbsp;</span>投放时间段</span>';
		html += '<span style="margin:0 15px;"><span class="display_squart_lightgray">&nbsp;</span>下线时间段</span>';
		html += '</div>';
		for (key in data) {
			date = key;			
			html += me.buildOffLineSingleLineHTML(key, data[key]);			
		}
		baidu.g('BudgetOffLineDetail').innerHTML = html;
	},
	
	/**
	 * 生成下线时间的一天的显示HTML，即一行
	 */
	buildOffLineSingleLineHTML : function(date, time){
		var me = this,
			html = '',
			ison = true,
			timeline_class = [],
			timeline_content = [],
			i, j, k, l;
		
		for(i = 0; i < 24; i++){
			timeline_class[i] = 'budget_offline_houron';
			timeline_content[i] = '&nbsp;';
		}
		for(var k in time){
			for(j = time[k][0] - 0; j < (time[k][1] - 0); j++){
				timeline_class[j] = 'budget_offline_houroff';
				timeline_content[j] = (j < 10 ? ('0' + j) : j);
			}
		}
		
		html = '<div class="budget_offline_container">';
		html += '<dl class="budget_offline_singleline">';
		html += '<dt class="budget_offline_linehead">' + date + '</dt>';
		for(i = 0 ; i < 24; i++){
			html += '<dd class="budget_offline_hour ' 
				 + timeline_class[i]
				 + ((i % 6 == 0 && i != 0) ? ' budget_offline_hoursqurt' : '')
				 + '">'
				 + timeline_content[i]
				 + '</dd>';
		}
		html += '</dl>';
		html += '</div>';
		return html;
	},
	
	/**
     * 第一次保存此预算
     */
	applyBudget: function(){
		var me = this;
		
		return function(){
			var value, func, param = {},
				bgttype = me.getContext('bgttype'),
				leveltype = me.getContext('leveltype'),
				planid = me.getContext('planid');
			
			switch(leveltype){
				case 'useracct':
					func = fbs.account.modBudget;
					break;
				case 'planinfo':
					func = fbs.plan.modBudget;
					break;
			}
			
			param.items = {};
			
			switch(bgttype){
				case 0:
					param.items.wbudget = '';
					break;
				case 1:
					param.items.wbudget = (baidu.g('CurBgtValue').value == '' ? 0 : baidu.g('CurBgtValue').value);
					break;
				case 2:
					param.items.weekbudget = (baidu.g('CurBgtValue').value == '' ? 0 : baidu.g('CurBgtValue').value);
					break;
			}
			if(leveltype == 'planinfo'){
				param.planid = planid;
			}
			
			me.currbgtSaveWarntype = 0;//表示预算保存时的类型，0为第一次保存，1和2为2次提醒
			if(bgttype == 2){
				me.currWeekbgtSavetype = 1; //表示是第一次
				param.alertLevel = 2;
			}
			
			if(leveltype == 'planinfo'){
				var modifyData = {};
				for (var i = 0, l = planid.length; i < l; i++) {
					modifyData[planid[i]] = {
						"wbudget" : (bgttype == 0 ? '' : param.items.wbudget)
					};
				}
				param.onSuccess = me.modSuccess(modifyData);
			}
			else{
				param.onSuccess = me.modSuccess();
			}
			
			/*
			//log
			var logParam = {
				oldtype : me.bgttype,
				newtype : me.getContext('bgttype'),
				newvalue : baidu.g('CurBgtValue').value == '不限定预算' ? '' : baidu.g('CurBgtValue').value,
				oldvalue : me.bgtvalue,
				type : 0
			}
			manage.budget.logCenter('budget_configuration_save', logParam);
			*/
			
			param.onFail = me.exception();
			
			//暂时保存一下当前的参数，供第二次使用
			me.currParam = param;
			me.currFunc = func;
						
			func(param);
			
			if (me.arg.onMod) {
			    var newtype = me.getContext('bgttype'),
                newvalue = baidu.g('CurBgtValue').value == '不限定预算' ? '' : baidu.g('CurBgtValue').value,
                oldvalue = me.bgtvalue,
                logParam = {
                    oldtype : me.bgttype,
                    newtype : newtype,
                    newvalue : newvalue,
                    oldvalue : oldvalue,
                    type : me.currbgtSaveWarntype
                };
			    me.arg.onMod(logParam);
			}
		};
	},
	
	/**
	 * 保存预算
	 * @param {Object} me
	 */
	save : function(me) {
		var param = me.currParam,
			func = me.currFunc,
			bgttype = me.getContext('bgttype'),
			leveltype = me.getContext('leveltype');
		if(bgttype == 2){
			me.currWeekbgtSavetype = 2; //表示是第二次
			param.alertLevel = 1;
		}
		param.onSuccess = me.modSuccess();
		param.onFail = me.exception();
		func(param);
	},
	
		
	/**
	 * 预算修改成功
	 */
	modSuccess : function(modifyData) {
		var me = this,
			param = me.currParam,
			bgttype = me.getContext('bgttype');
		
		return function(response){
			var status = response.status;
			
			if (status == 300) { // 修改预算部分成功时，根据errorCode判断是否要进行二次确认
				fbs.material.clearCache(me.arg.type); // 处理部分成功时的未清理缓存问题  2012-12-07 by Leo Wang(wangkemiao@baidu.com)
				return false;
			}
			
			var newtype = me.getContext('bgttype'),
			    newvalue = baidu.g('CurBgtValue').value == '不限定预算' ? '' : baidu.g('CurBgtValue').value,
				oldvalue = me.bgtvalue,
				logParam = {
				    oldtype : me.bgttype,
				    newtype : newtype,
				    newvalue : newvalue,
				    oldvalue : oldvalue,
				    type : me.currbgtSaveWarntype
			    };
			manage.budget.logCenter('budget_configuration_save', logParam);
			
			if (me.getContext('entrancetype') == 'aopkg') {
			    var pkgLogParam = {
                    opttypeid : me.arg.opttypeid,
                    oldvalue : oldvalue,
                    newvalue : newvalue,
                    oldtype : me.bgttype,
                    newtype : newtype,
                    // 新增两个预算相关字段,突降包升级引入 by Huiyao 2013.1.15
                    suggestbudget: me.getContext('suggestbudget') || 0,
                    suggestweekbudget: me.getContext('suggestweekbudget') || 0
                };
                if(me.arg.type == 'planinfo'){
                    pkgLogParam.planid = me.arg.planid;
                }
			    nirvana.aoPkgControl.logCenter.extend(pkgLogParam).sendAs('nikon_modify_budget');
			}
			
			if (me.arg.type == "planinfo") {
				fbs.material.ModCache(me.arg.type, "planid", modifyData);
			}
			else {
				fbs.material.clearCache(me.arg.type);
			}
			if (typeof me.arg.onok === 'function'){
				// 如果打开action时传入onok，则执行onok
                me.arg.onok({
					bgttype : newtype,
					oldtype : me.bgttype,
					newvalue : newvalue,
					oldvalue : oldvalue,
					suggestbudget: me.getContext('suggestbudget')
				});
            }
            // FIX: 推广管理的工具栏的优化建议修改预算保存刷新问题，会把工具箱自动关闭
            // 对于工具箱修改不触发reload,add by Huiyao 2013.1.23
            else if (!me.arg.isTool) {
				er.controller.fireMain('reload', {});
			}
			
			me.onclose();
		};
	},
	
    /**
     * 预算异常处理
     * errorCode
     * 预算过小：50	307
     * 预算过大：999.99	308
     * 超过预算修改次数	306
     * 不是数字	350
     * 小数点后超过两位	351
     */
	exception : function() {
		var me =this;
		
		return function(response) {
			var status = response.status,
				errorObj = response.error,
				errorCode,
				planid = [],
				planname = [],
				key,
				tmp;
			
			me.clearWarn();
			
			// 批量修改计划预算时，错误返回都是统一的errorCode，所以只要有一个就可以退出
			for (key in errorObj) {
				if (errorCode) {
					break;
				}
				tmp = errorObj[key].wbudget;
				if('undefined' == typeof tmp ){
					tmp = errorObj[key].weekbudget;
				}
				
				if (tmp && tmp.code) {
					errorCode = tmp.code || '';
				}
			}
			
			switch (errorCode) {
				case 306:
					// 账户预算超过修改次数
					if (baidu.g('BudgetExcept')) {
						baidu.g('BudgetExcept').innerHTML = nirvana.config.ERROR.ACCOUNT.BUDGET[errorCode];
						baidu.removeClass('BudgetExcept', 'hide');
					}
					break;
					
				case 401:
					// 计划预算超过修改次数
					for (key in errorObj) {
						tmp = errorObj[key].wbudget;
						if('undefined' == typeof tmp ){
							tmp = errorObj[key].weekbudget;
						}
						if (tmp && tmp.code) {
							planid.push(key); // 获取出错planid
						}
					}
					
					// 获取planname
					fbs.plan.getPlanname({
						condition: {
							planid: planid
						},
						onSuccess: function(data){
							var data = data.data.listData;
							
							// 获取出错的计划名称
							for (var i = 0, j = data.length; i < j; i++) {
								planname.push(data[i].planname);
							}
							
							if (baidu.g('BudgetExcept')) {
								baidu.g('BudgetExcept').innerHTML = nirvana.config.ERROR.PLAN.BUDGET[errorCode].replace(/%s/, ' <strong>' + baidu.encodeHTML(planname.join('、')) + '</strong> ');
								baidu.removeClass('BudgetExcept', 'hide');
							}
						}
					});
					break;
				
				// 账户预算过小
				case 307:
				// 账户预算过大
				case 308:
				// 预算必须为数字
				case 350:
				// 只能保留两位小数
				case 351:
				//周预算过小
				case 316:
				//周预算过大
				case 317:
					if (baidu.g('BudgetExcept')) {
						baidu.g('BudgetExcept').innerHTML = nirvana.config.ERROR.ACCOUNT.BUDGET[errorCode];
						baidu.removeClass('BudgetExcept', 'hide');
					}
					break;
				
				// 计划预算过小
				case 402:
				// 计划预算过大
				case 403:
				// 计划预算大于账户预算
				case 404:
					if (baidu.g('BudgetExcept')) {
						baidu.g('BudgetExcept').innerHTML = nirvana.config.ERROR.PLAN.BUDGET[errorCode];
						baidu.removeClass('BudgetExcept', 'hide');
					}
					break;
				
				//add by LeoWang(wangkemiao@baidu.com)
				
				case 318:
					//浮出提醒框
					var msg = '每周预算低于您的上周实际消费，有损失点击的风险，建议您重新设置。是否仍然要设置此预算？';
					ui.Dialog.confirm({
						title: '每周预算提示',
						content: msg,
						defaultButton : 'cancel',
						onok: function(){
							/*
							var logParam = {
								newtype : me.getContext('bgttype'),
								oldtype : me.bgttype,
								newvalue : baidu.g('CurBgtValue').value,
								oldvalue : me.bgtvalue,
								type : 2
							}
							manage.budget.logCenter('budget_configuration_save', logParam);
							*/
							me.currbgtSaveWarntype = 2;//表示周预算保存时低于上周消费的警告
							
							me.save(me);
						},
						oncancel: function(){
							var logParam = {
								newtype : me.getContext('bgttype'),
								oldtype : me.bgttype,
								type : 2
							};
							manage.budget.logCenter('budget_configuration_cancel', logParam);
						}
					});
					break;
				case 319:
					var errormsg;
					for (key in errorObj) {
						tmp = errorObj[key].wbudget;
						if('undefined' == typeof tmp ){
							tmp = errorObj[key].weekbudget;
						}
						if (tmp && tmp.message) {
							errormsg = tmp.message || '';
						}
					}					
					errormsg = baidu.json.parse(errormsg);
					var msg = '本周从周一至今已消费' + errormsg[0] + '元，降低周预算将使本周剩余' + errormsg[1] + '天的平均预算降低至' + errormsg[2] + '，有损失点击的风险。是否仍然要修改此预算？';
					ui.Dialog.confirm({
						title: '每周预算提示',
						content: msg,
						defaultButton : 'cancel',
						onok: function(){
							/*
							var logParam = {
								newtype : me.getContext('bgttype'),
								oldtype : me.bgttype,
								newvalue : baidu.g('CurBgtValue').value,
								oldvalue : me.bgtvalue,
								type : 1
							}
							manage.budget.logCenter('budget_configuration_save', logParam);
							*/
							me.currbgtSaveWarntype = 1;//表示周预算保存时降低的警告
							me.save(me);
						},
						oncancel: function(){
							var logParam = {
									newtype : me.getContext('bgttype'),
									oldtype : me.bgttype,
									type : 1
							};
							manage.budget.logCenter('budget_configuration_cancel', logParam);
						}
					});
					break;
				//add ended
				
				default:
					// 其他情况，则默认为系统异常
					if (baidu.g('Budget')) {
						baidu.g('Budget').innerHTML = FILL_HTML.EXCEPTION;
					}
					break;
			}
		};
	},
	
	//预算类型：0：不限定预算；1：日预算；2:周预算，注意，计划层级是没有周预算的
	bgttype : -1,
	
	bgtvalue : '',
	
	//用户输入的预算值
	inputValue : '',
	
	//层级信息
	leveltype : '',
	
	//周预算信息
	weekBgtInfo : null,
	
	//日预算信息
	dayBgtInfo : null,
	
	/**
	 * 清除错误信息
	 */
	clearWarn : function() {
		if (baidu.g('BudgetWarn')) {
			baidu.addClass('BudgetWarn', 'hide');
		}
		if (baidu.g('BudgetExcept')) {
			baidu.addClass('BudgetExcept', 'hide');
		}
		if (baidu.g('BudgetWeekWarn')) {
			baidu.addClass('BudgetWeekWarn', 'hide');;
		}
	},
	
	/**
	 * 效果突降新增判断函数，是否是效果突降？
	 * add by LeoWang(wangkemiao@baidu.com)
	 */
	isInDecrease : function(){
		return (this.arg.isDecr);
	},
	
	/**
	 * 效果突降新增判断函数，是否是推荐了不限定预算？
	 */
	isNolimitBudgetSuggested : function(){
		var me = this,
			currInfo;
		switch(me.bgttype){
			case 1: //日预算
				currInfo = me.dayBgtInfo.dayanalyze;
				break;
			case 2: //周预算
				currInfo = me.weekBgtInfo.weekanalyze;
				break;
			default: //不限定
				return false;
		}
			
		if('undefined' == typeof currInfo || currInfo == null){
			return false;
		}
		
		if(currInfo.suggestbudget == 0){
			return true;
		}
		return false;
	}
	
	
});

/**
 * 
 * 修改预算的子action，根据type判断类型
 * @param {Object} param{type,planid,planname,bgttype, custom}
 * 		type有两种状态，useracct/planinfo，分别表示账户预算和计划预算
 * 		planid,planname是计划预算时传入的计划信息
 *		bgttype是当前环境状态，有0、1、2等值，内部会据此初始化不同页面结构
 * 		custom: {Object} 自定义配置，其值包括：
 			{
				noOffline, // 隐藏下线时间
				noViewBtn, // 隐藏查看详细分析按钮
				noRadio, // 隐藏单选框
				noDiff, // 隐藏同行标杆信息及周预算分配预览图
 			}
 * @param {Object} dialogParams 直接传入subaction需要的参数
 */
manage.budget.openSubAction = function(param, dialogParams) {
	var type = param.type,
	    planid = param.planid,
		id = '',
		title = title || '',
		width = 655,
		topPX = 135,
		params;
	
	if (type == 'useracct') {
		// 修改账户预算
        id = 'AccountBudgetDialog';
        title = '账户预算';
	} else {
		// 修改计划预算
        if (planid.length > 1) { //批量修改
            id = 'PlanBatchBudgetDialog';
            width = 655;
            topPX = 200;
            title = '计划预算';
        }
        else {
            id = 'PlanBudgetDialog';
            title += ' 计划预算';
        }
	}
	
	params = {
        id: id,
        title: title,
        width: width,
        actionPath: 'manage/budget',
        params: param, // 通过this.arg.type判断账户预算或者计划预算
        onclose: function(param){
            var logParam = {};
            var target = 'undefined' == typeof param ? 'budget_configuration_close' : 'budget_configuration_close_x';
            manage.budget.logCenter(target, logParam);
            //清除掉公共log参数
            manage.budget.logParam = {};
            //强制隐藏那个一次性的新功能周预算气泡
            //ui.Bubble.hide('BubbleNewFuncShowOnce');
        }
	};
	
	if (typeof dialogParams != 'undefined') {
		baidu.extend(params, dialogParams);
	}
	
	nirvana.util.openSubActionDialog(params);
	clearTimeout(nirvana.subaction.resizeTimer);
	baidu.g('ctrldialog' + id).style.top = baidu.page.getScrollTop() + topPX +'px';
};


/**
 * 公共监控数据
 * @param {Object} actionName
 * @param {Object} param
 * 快捷方式
 * logCenter('budget_configuration_init');					// 进入时初始化的信息的log
 * logCenter('budget_configuration_close');					// 点击左下角取消按钮
 * logCenter('budget_configuration_close_x');				// 点击左上角X关闭
 * logCenter('budget_configuration_switchtype');			// 点击各个单选框切换预算类型
 * logCenter('budget_configrutaion_analysis_detail');		// 详情分析
 * 
 * logCenter('budget_configuration_editvalue');				// 点击推荐预算值
 * logCenter('budget_configuration_save');					// 点击保存按钮
 * logCenter('budget_configuration_cancel');				// 取消保存
 */
manage.budget.logCenter = function(actionName, param) {
	var logParam = {
		target : actionName
	};
	
	baidu.extend(logParam, manage.budget.logParam);
	baidu.extend(logParam, param);
	
	NIRVANA_LOG.send(logParam);
};
