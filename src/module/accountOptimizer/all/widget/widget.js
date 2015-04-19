/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: accountOptimizer/all/widget/widget.js 
 * desc: 账户优化子项摘要
 * author: wanghuijun@baidu.com
 * date: $Date: 2011/06/17 $
 */

/**
 * 摘要一 预算不足
 */
var AoWidget_1 = new nirvana.aoWidget();

AoWidget_1.buildResult = function(json){
	/**
	 * 返回[planname1, status, planid, budget, maxbgt, suggest, lostclick]
	 * status=2代表有损失点击的风险，status=3代表需要显示预算分析详情，4是行业旺季，4目前已经不存在了
	 */
	var html = '',
		htmlTpl = json.html,
		itemId = json.itemId,
		data = json.data,
		htmlTip = er.template.get('widgetAbstract1v1'), //建议预算提示条件,对应 bgtstatus == 3
		htmlRisk = er.template.get('widgetAbstract1v2'), //损失访问风险条件,对应 bgtstatus == 2
		htmlWeektip = er.template.get('widgetAbstract1v3'), //周预算建议,对应 bgtstatus == 4
		htmlShortAccttip = er.template.get('widgetAbstract1v4'), //账户预算预算不足，提前撞线,对应 bgtstatus == 5
		htmlShortPlantip = er.template.get('widgetAbstract1v5'), //计划预算预算不足，提前撞线,对应 bgtstatus == 5
		planNameLength = 14, //计划名称长度上限
		status, // 用于监控
		value, plantitle, planname;
    var saveClksInfo = ''; // 存储损失点击话术升级新增的话术信息 by Huiyao 2013.3.20

	if (itemId == 1) { //帐户预算分析
		if (data[0].bgtstatus == 3) { //建议日预算提示
			if(data[0].show_encourage == 1 /*&& htmlTip.indexOf('个同行的投放效果优于您') == -1*/){// 预算话术升级对话术进行精简 by Huiyao 2013.3.21
				html = htmlTpl.replace(/%abstract/, htmlTip + '，落后于<span class="ao_em">' + data[0].model_num + '</span>个同行'/*'，<span class="ao_em">' + data[0].model_num + '</span>个同行的投放效果优于您'*/);
			}
			else{
				html = htmlTpl.replace(/%abstract/, htmlTip);
			}
			html = html.replace(/%n/, data[0].lostclick);

            // 有损失点击预算话术升级新增话术 add by Huiyao 2013.3.20
            if (+data[0].retripercent) {
                saveClksInfo = er.template.get('budgetSuggestSaveClks');
                saveClksInfo = saveClksInfo.replace(/%saveClks/, data[0].retripercent);
            }
			status = 1;
		} else if (data[0].bgtstatus == 2) { //损失访问风险
			html = htmlTpl.replace(/%abstract/, htmlRisk);
			html = html.replace(/%b/, data[0].maxbgt);
			status = 0;
		} else if(data[0].bgtstatus == 4) { //周预算建议
			if(data[0].show_encourage == 1 /*&& htmlWeektip.indexOf('个同行的投放效果优于您') == -1*/){// 预算话术升级对话术进行精简 by Huiyao 2013.3.21
				html = htmlTpl.replace(/%abstract/, htmlWeektip + '，落后于<span class="ao_em">' + data[0].model_num + '</span>个同行'/*'，<span class="ao_em">' + data[0].model_num + '</span>个同行的投放效果优于您'*/);
			}
			else{
				html = htmlTpl.replace(/%abstract/, htmlWeektip);
			}
			html = html.replace(/%n/, data[0].lostclick);
			html = html.replace(/建议每日预算/, '建议每周预算');
			status = 1;
		}
		else if(data[0].bgtstatus == 5){ // 预算不足 提前撞线
			value = data[0].value;
			//处理value，有需要则+0
			for(var o in value){
				if(value[o] < 10){
					value[o] = '0' + value[o];
				}
			}
			
			html = htmlTpl.replace(/%abstract/, htmlShortAccttip);
			if (value && value.length == 2) {
				html = html.replace(/%spectime/, value.join(':'));
			}
			html = html.replace(/%y/, data[0].suggest == 0 ? '不限定预算' : (data[0].suggest + '元'));
		}
		html = html.replace(/%a/, '账户');
		html = html.replace(/%y/, data[0].suggest == 0 ? '不限定预算' : (data[0].suggest + '元'));
        // 有损失点击预算话术升级新增话术 add by Huiyao 2013.3.20
        html = html.replace(/%saveClksInfo/, saveClksInfo);
	} else { //计划预算分析
		for (var i = 0, j = data.length; i < j; i++) {
            saveClksInfo = ''; // 重置
			if (data[i].bgtstatus == 3) { //建议预算提示
				if(data[i].show_encourage == 1 /*&& htmlTip.indexOf('个同行的投放效果优于您') == -1*/){// 预算话术升级对话术进行精简 by Huiyao 2013.3.21
					html += htmlTpl.replace(/%abstract/, htmlTip + '，落后于<span class="ao_em">' + data[i].model_num + '</span>个同行'/*'，<span class="ao_em">' + data[i].model_num + '</span>个同行的投放效果优于您'*/);
				}
				else{
					html += htmlTpl.replace(/%abstract/, htmlTip);
				}
				html = html.replace(/%n/, data[i].lostclick);

                // 有损失点击预算话术升级新增话术 add by Huiyao 2013.3.20
                if (+data[i].retripercent) {
                    saveClksInfo = er.template.get('budgetSuggestSaveClks');
                    saveClksInfo = saveClksInfo.replace(/%saveClks/, data[i].retripercent);
                }

				status = 1;
			} else if (data[i].bgtstatus == 2) { //损失访问风险
				html += htmlTpl.replace(/%abstract/, htmlRisk);
				html = html.replace(/%b/, data[i].maxbgt);
				status = 0;
			} else if(data[i].bgtstatus == 5) { // 预算不足提前撞线
				value = data[i].value;
				//处理value，有需要则+0
				for(var o in value){
					if(value[o] < 10){
						value[o] = '0' + value[o];
					}
				}
				html += htmlTpl.replace(/%abstract/, htmlShortPlantip);
				
				if (value && value.length == 2) {
					html = html.replace(/%spectime/, value.join(':'));
					plantitle = baidu.encodeHTML(data[i].planname);
					planname = getCutString(plantitle, 20, '..');
					html = html.replace(
							/%planname/, planname).replace(
							/%plantitle/, plantitle);
				}
				html = html.replace(/%y/, data[i].suggest == 0 ? '不限定预算' : (data[i].suggest + '元'));
			}
            
			html = html.replace(/%a/, '计划<span title="' + data[i].planname + '">' + getCutString(baidu.encodeHTML(data[i].planname), planNameLength, '..') + '</span>');
			html = html.replace(/%y/, data[i].suggest == 0 ? '不限定预算' : (data[i].suggest + '元'));
            // 有损失点击预算话术升级新增话术 add by Huiyao 2013.3.20
            html = html.replace(/%saveClksInfo/, saveClksInfo);
		}
	}
	
	
	return html;
};

AoWidget_1.shortCut = function(json) {
	var itemId = json.itemId,
		data = json.data,
		aoControl = nirvana.aoControl,
		prefix = aoControl.widgetPrefix,
		item = aoControl.item,
		btns = baidu.q('ao_enable', prefix + itemId, 'a'),
		suggest,
		planid,
		bgtstatus;
	
	for (var i = 0, j = btns.length; i < j; i++) {
		suggest = data[i].suggest;
		planid = data[i].planid;
		bgtstatus = data[i].bgtstatus;
		
		btns[i].onclick = function(json) {
			return function(e) {
				var e = e || window.event,
					planid = json.planid || 0,
					suggest = json.suggest,
					logParam = {
						opttype : itemId,
						status : json.bgtstatus,
						suggest : suggest == 0 ? '' : suggest,
						planid : planid,
						bgttype : json.bgtstatus == 4 ? 2 : 1,
						type : -2 // -2 – 打开 -1 – 未进行二次确认（右上角X）0 – 二次取消 1 – 二次确认 2-出错信息后确认关闭浮出窗

					};
				
				// 记录 refresh id
				AoWidget_1.itemId = itemId;
				AoWidget_1.logParam = logParam;
				
				//add by LeoWang(wangkemiao@baidu.com)
				manage.budget.logParam = {
					'entrancetype' : 3
				};
				//add ended
				
				ui.Dialog.confirm({
					title: '启用预算',
					content: '是否更改' + (json.bgtstatus == 4 ? '周' : '日') + '预算为 ' + (suggest == 0 ? '不限定预算' : (suggest + '元')) + '？',
					onok: function(){ // 保存预算
						var budgetLogParam = {
							oldvalue : -1,
							newvalue : suggest == 0 ? '' : suggest
						};
						if (itemId == 1) { // 账户预算
							budgetLogParam.level = 'useracct';
							if(json.bgtstatus == 4){ // 周预算
								budgetLogParam.oldtype = 2;
								budgetLogParam.newtype = suggest == 0 ? 0 : 2;
								budgetLogParam.bgttype = 2;
								var theModParam = {
									items: {
										//weekbudget: suggest == 0 ? '' : suggest
									},
									alertLevel : 2,
									onSuccess: AoWidget_1.modBudget.success(),
									onFail: AoWidget_1.modBudget.fail()
								}
								if(suggest == 0){
									theModParam.items.wbudget = '';
								}
								else{
									theModParam.items.weekbudget = suggest;
								}
								fbs.account.modBudget(theModParam);
							}
							else{ //日预算 合理以及不提示 不去管了

								budgetLogParam.oldtype = 1;
								budgetLogParam.newtype = suggest == 0 ? 0 : 1;
								budgetLogParam.bgttype = 1;
								
								fbs.account.modBudget({
									items: {
										wbudget: suggest == 0 ? '' : suggest
									},
									onSuccess: AoWidget_1.modBudget.success(),
									onFail: AoWidget_1.modBudget.fail()
								});
							}
							/*
							fbs.account.modBudget({
								items: {
									wbudget: suggest
								},
								onSuccess: AoWidget_1.modBudget.success(),
								onFail: AoWidget_1.modBudget.fail()
							});
							*/
						} else { // 计划预算
							var modifyData = {};

							budgetLogParam.level = 'planinfo';
							budgetLogParam.oldtype = 1;
							budgetLogParam.newtype = suggest == 0 ? 0 : 1;
							budgetLogParam.planid = [planid];
							budgetLogParam.bgttype = 1;
							
							modifyData[planid] = {
								'wbudget': suggest
							};
							
							fbs.plan.modBudget({
								planid: [planid],
								items: {
									wbudget: suggest == 0 ? '' : suggest
								},
								onSuccess: AoWidget_1.modBudget.success(modifyData),
								onFail: AoWidget_1.modBudget.fail()
							});
						}
						
						logParam.type = 1;
						manage.budget.logCenter('budget_configuration_quicksave', budgetLogParam);
						nirvana.aoWidgetAction.logCenter('ao_quick_accept', logParam);
					},
					oncancel: function(param){
						logParam.type = 0;
						nirvana.aoWidgetAction.logCenter('ao_quick_accept', logParam);
					}
				});
				
				nirvana.aoControl.isViewDetail = true;
				
				nirvana.aoWidgetAction.logCenter('ao_quick_accept', logParam);
				
				baidu.event.stop(e);
			};
		}({
			planid : planid,
			suggest : suggest,
			bgtstatus : bgtstatus
		});
	}
};

/**
 * 启用预算建议回调函数
 */
AoWidget_1.modBudget = {
	success : function(modifyData) {
		return function(response){
			var itemId = AoWidget_1.itemId;
			
			if (itemId == 1) { // 帐户层级
				fbs.material.clearCache('useracct');
			} else {
				fbs.material.ModCache('planinfo', 'planid', modifyData);
			}
			
			nirvana.aoControl.refresh(AoWidget_1.itemId);
		};
	},
	
	fail : function() {
		return function(response){
			var status = response.status,
				errorObj = response.error,
				errorCode,
				planid = [],
				planname = [],
				key,
				tmp,
				msg;
			
			// 批量修改计划预算时，错误返回都是统一的errorCode，所以只要有一个就可以退出
			for (key in errorObj) {
				if (errorCode) {
					break;
				}
				tmp = errorObj[key].wbudget;
				
				if (tmp && tmp.code) {
					errorCode = tmp.code || '';
				}
			}
			
			switch (errorCode) {
				// 帐户预算超过修改次数
				case 306:
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
					msg = nirvana.config.ERROR.ACCOUNT.BUDGET[errorCode];
					break;
				
				case 401:
					// 计划预算超过修改次数
					msg = nirvana.config.ERROR.PLAN.BUDGET[errorCode].replace(/%s/, '');
					break;
				
				// 计划预算过小
				case 402:
				// 计划预算过大
				case 403:
				// 计划预算大于账户预算
				case 404:
					msg = nirvana.config.ERROR.PLAN.BUDGET[errorCode];
					break;
				
				default:
					// 其他情况，则默认为系统异常
					msg = '';
					break;
			}
			
			if (msg) {
				// 这里延迟一下，否则confirm关闭时会把背景mask关掉
				setTimeout(function(){
					ui.Dialog.alert({
						title: '预算建议',
						content: msg
					});
					
					AoWidget_1.logParam.type = 2;
					nirvana.aoWidgetAction.logCenter('ao_quick_accept', AoWidget_1.logParam);
				}, 100);
			} else {
				ajaxFailDialog();
			}
			
		};
	}
};

/**
 * 摘要七 推广时段优化
 */
var AoWidget_7 = new nirvana.aoWidget();

AoWidget_7.buildResult = function(json){
	var html = json.html,
		data = json.data,
		htmlTpl = [],
		planname,
		num;
	
	for (var i = 0, len = data.length; i < len; i++) {
		plantitle = baidu.encodeHTML(data[i].planname);
		planname = getCutString(plantitle, 20, '..');
		num = data[i].lostclick;
		
		htmlTpl.push(html.replace(
					/%planname/, planname).replace(
					/%plantitle/, plantitle).replace(
					/%n/, num));
	}
	
	return htmlTpl.join('');
};

/**
 * 手动版升级的时段的摘要项 add by Huiyao 2013.1.21 等全流量后，上面的代码就可以删掉
 */
var AoWidget_52 = new nirvana.aoWidget();

AoWidget_52.buildResult = function(json){
    var html = json.html,
        data = baidu.object.clone(json.data),
        htmlTpl = [];

    for (var i = 0, len = data.length; i < len; i++) {
        data[i].planinfo = lib.field.strRenderer(data[i].planname, 20);
        // 时段升级，初始化模板，add by Huiyao 2013.1.21
        + data[i].potentialclk ? (data[i].className = '') : (data[i].className = 'hide');
        htmlTpl.push(lib.tpl.parseTpl(data[i], html));
    }

    return htmlTpl.join('');
};

/**
 * 摘要五 关键词推荐
 */
var AoWidget_5 = new nirvana.aoWidget();

/**
 * 摘要五 关键词无法展现
 */
var AoWidget_8 = new nirvana.aoWidget();

AoWidget_8.buildResult = function(json) {
	var html = json.html,
		itemId = json.itemId,
		value = json.data[0].value,
		limit = nirvana.config.AO.QUICK_ACCEPT_LIMIT,
		item = nirvana.aoControl.item;
	
	switch (itemId) {
		case item['word_deactive'] :
			if (value[0] <= limit) {
				html = html.replace(/%handle/, '<a class="ao_enable" href="#" id="Widget8_80">全部激活</a>');
			}
			break;
		case item['word_invalid'] :
			html = nirvana.aoWidgetAction.decrWord(html,value[1],'，其中<span class="ao_em">' + value[1] + '</span>个关键词昨日突变为搜索无效状态');
			break;
		case item['word_lowsearch'] :
			html = nirvana.aoWidgetAction.decrWord(html,value[1],'，其中<span class="ao_em">' + value[1] + '</span>个关键词昨日突变为搜索量过低状态');
			break;
		case item['word_bad'] :
			html = nirvana.aoWidgetAction.decrWord(html,value[1],'，其中<span class="ao_em">' + value[1] + '</span>个关键词昨日突变为不宜推广状态');
			break;
		case item['word_pause'] :
			if (value[0] <= limit){
				html = html.replace(/%handle/, '<a class="ao_enable" href="#" id="Widget8_110">全部启用</a>');
			};
			html = nirvana.aoWidgetAction.decrWord(html,value[1],'，其中<span class="ao_em">' + value[1] + '</span>个关键词昨日突变为暂停推广状态');
			break;
		case item['unit_pause'] :
			if (value[0] <= limit) {
				html = html.replace(/%handle/, '<a class="ao_enable" href="#" id="Widget8_120">全部启用</a>');
			}
			html = nirvana.aoWidgetAction.decrWord(html,value[1],'，其中<span class="ao_em">' + value[1] + '</span>个单元昨日突变为暂停推广状态');
			break;
		case item['plan_pause'] :
			if (value[0] <= limit) {
				html = html.replace(/%handle/, '<a class="ao_enable" href="#" id="Widget8_130">全部启用</a>');
			}
			html = nirvana.aoWidgetAction.decrWord(html,value[1],'，其中<span class="ao_em">' + value[1] + '</span>个计划昨日突变为暂停推广状态');
			break;
		default :
		    break;
	}
	
	html = html.replace(/%handle/, '');
	
	return html;
};

AoWidget_8.shortCut = function(json) {
	var itemId = json.itemId,
		data = json.data,
		aoControl = nirvana.aoControl,
		prefix = aoControl.widgetPrefix,
		item = aoControl.item,
		btns = baidu.q('ao_enable', prefix + itemId, 'a');
	
	for (var i = 0, j = btns.length; i < j; i++) {
		btns[i].onclick = function(e) {
			var e = e || window.event,
				startIndex = 0,
				endIndex = data[0].value[0] - 1,
				logParam = {
					opttype : itemId,
					type : -2,
					value : data[0].value[0]
				};
			
			AoWidget_8.operation.getIds(itemId, startIndex, endIndex);
			
			nirvana.aoControl.isViewDetail = true;
			
			//快捷操作点击的监控
			nirvana.aoWidgetAction.logCenter('ao_quick_accept', logParam);
			AoWidget_8.logParam = logParam;
			
			baidu.event.stop(e);
		};
	}
};

AoWidget_8.operation = {
	/**
	 * 获取全部id
	 * @param {Object} itemId
	 * @param {Object} startIndex
	 * @param {Object} endIndex
	 */
	getIds : function(itemId, startIndex, endIndex) {
		var me = this,
			params = nirvana.aoControl.params;
		
		switch (itemId) {
			case 8:
				fbs.ao.getWordDeactiveWinfoids(AoWidget_8.operation.requestTpl(params, startIndex, endIndex, 8));
				break;
			case 12:
				fbs.ao.getWordPauseWinfoids(AoWidget_8.operation.requestTpl(params, startIndex, endIndex, 12));
				break;
			case 13:
				fbs.ao.getUnitPauseUnitids(AoWidget_8.operation.requestTpl(params, startIndex, endIndex, 13));
				break;
			case 14:
				fbs.ao.getPlanPausePlanids(AoWidget_8.operation.requestTpl(params, startIndex, endIndex, 14));
				break;
		}
	},
	
	/**
     * 激活所选的
     * @returns {Function} 激活所选函数
     */
    activeHandler: function(itemId) {
		
        return function (dialog) {
            var dialog = dialog,
                func = fbs.keyword.active,//需要调用的接口函数
                param = {
					winfoid: dialog.args.id, 
	                activestat : '0',
	                onSuccess: function(response){
						if (response.status != 300) {
							var modifyData = response.data;
							fbs.avatar.getMoniWords.ModCache('winfoid', modifyData);
							fbs.material.ModCache('wordinfo', 'winfoid', modifyData);
							
							nirvana.aoControl.refresh(itemId);
						}
					}, 
	                onFail: AoWidget_8.operation.operationFailHandler()
				};
                func(param);
				
				//快捷操作点击确定的监控
				AoWidget_8.logParam.type = 1;
 				nirvana.aoWidgetAction.logCenter('ao_quick_accept', AoWidget_8.logParam);
         };
    },

    operationFailHandler : function () {	
        return function () {
            ajaxFailDialog();            
        };
    },

	/**
	 * 启用、（暂停）、删除三个操作的具体执行
	 */
    doOperationHandler : function (itemId) {
        
		return function (dialog) {
            var dialog = dialog,
                func,//需要调用的接口函数
                pauseStat, //0启用,1暂停
				itemIdToType = {
					12 : 'word',
					13 : 'unit',
					14 : 'plan'
				},
				funcList = {
					'word' : fbs.keyword.modPausestat,
					'unit' : fbs.unit.modPausestat,
					'plan' : fbs.plan.modPausestat
				},
				paramList = {
					'word' : {
						winfoid : dialog.args.id, 
						onSuccess :  function(response){
							if (response.status != 300) {
								var modifyData = response.data;
								fbs.avatar.getMoniWords.ModCache('winfoid', modifyData);
								fbs.material.ModCache('wordinfo', 'winfoid', modifyData);
								nirvana.aoControl.refresh(itemId);
							}
						},	
                		onFail : AoWidget_8.operation.operationFailHandler()
					},
					'unit' : {
						unitid : dialog.args.id,
						onSuccess : function (response) {
							var modifyData = response.data;
										
							fbs.material.ModCache('unitinfo', 'unitid', modifyData);
							//是否会影响关键词的状态呢？？TODO
							fbs.material.clearCache('wordinfo');
							fbs.material.clearCache('ideainfo');
							//	fbs.unit.getInfo.clearCache();	
							nirvana.aoControl.refresh(itemId);													
						},
						onFail : AoWidget_8.operation.operationFailHandler()
					},
					'plan' : {
						planid : dialog.args.id,
						onSuccess :  function (response) {
							var modifyData = response.data;
							
							fbs.material.ModCache('planinfo', 'planid', modifyData);
							//计划的状态改变会影响单元状态改变
							fbs.material.clearCache('unitinfo');
							//是否会影响关键词的状态呢？？TODO
							fbs.material.clearCache('wordinfo');
							fbs.material.clearCache('ideainfo');
							//		fbs.plan.getInfo.clearCache();
							nirvana.aoControl.refresh(itemId);
						},
						onFail : AoWidget_8.operation.operationFailHandler()							
					}
				},
				type = itemIdToType[itemId],
				param = paramList[type]; 
                func = funcList[type];
                pauseStat = 0;			
                if (typeof pauseStat != 'undefined') {
                    param.pausestat = pauseStat;
                }
    
                func(param);
				
				//快捷操作点击确定的监控
				AoWidget_8.logParam.type = 1;
 				nirvana.aoWidgetAction.logCenter('ao_quick_accept', AoWidget_8.logParam);
        };
    },

	/**
	 * 请求模板
	 * @param {Object} id
	 */
	requestTpl : function(params, startIndex, endIndex, itemId){
		
		return {
			level : params.level,
			condition : params.condition,
			signature : '',
			startindex : startIndex,
			endindex : endIndex,
				
			onSuccess : function(response) {
				var data = response.data,
					aostatus = data.aostatus,
					dialogParam,
					itemIdToOperation = {
						8 : 'active',
						12 : 'enable',
						13 : 'enable',
						14 : 'enable'
					},
					itemIdToType = {
						8 : 'winfoid',
						12 : 'winfoid',
						13 : 'unitid',
						14 : 'planid'
					},
					type,
					itemIdToContent = {
						8 : {
							title : '激活关键词',
							content : '您确定激活全部关键词吗?'
						},
						12 : {
							title : '启用关键词',
							content : '您确定启用全部关键词吗？'
						},
						13 : {
							title : '启用推广单元',
							content : '您确定启用全部推广单元吗？'
						},
						14 : {
							title : '启用推广计划',
							content : '您确定启用全部推广计划吗？'
						}
					},
					operationToParam = {
						'active' : {
		                    title : itemIdToContent[itemId]['title'],
		                    content : itemIdToContent[itemId]['content'],
							onok : AoWidget_8.operation.activeHandler(itemId),
							oncancel: function(){
								//快捷操作点击取消的监控
								AoWidget_8.logParam.type = 0;
								nirvana.aoWidgetAction.logCenter('ao_quick_accept', AoWidget_8.logParam);
							}
						},
						'enable' : {
							title: itemIdToContent[itemId]['title'],
							content: itemIdToContent[itemId]['content'],
							optype: 'enableItem', 
							onok: AoWidget_8.operation.doOperationHandler(itemId),
							oncancel: function(){
								//快捷操作点击取消的监控
								AoWidget_8.logParam.type = 0;
								nirvana.aoWidgetAction.logCenter('ao_quick_accept', AoWidget_8.logParam);
							}
						}
					};
				
				if (aostatus != 0) {
					switch (aostatus) {
						case 4: // 需要更详细的请求数据，不只是签名
							// 重新请求数据
							AoWidget_8.operation.getIds(itemId, startIndex, endIndex);
							break;
						default:
							ajaxFailDialog(); // 相当于status 500
							break;
						}
						return;
				}
				
				type = itemIdToType[itemId];
				dialogParam = operationToParam[itemIdToOperation[itemId]];
				dialogParam.id = data[type];
				ui.Dialog.confirm(dialogParam);
			},
			onFail : function() {
				ajaxFailDialog();
			}
		};
	}		
};

/**
 * 摘要四 关键词出价优化
 */
var AoWidget_4 = new nirvana.aoWidget();

AoWidget_4.buildResult = function(json){
	var html = json.html,
		itemId = json.itemId;
	
	html = html.replace(/%tip/g, '该时间为最近一次分析完成的时间。系统会根据真实展现情况判断您的推广是否能稳定展现在左侧首屏，为了保证判断结果的准确性，下次分析需要约30分钟积累线上数据，请您稍后查看。');
	
	return html;
};

/**
 * 摘要18 关键词不在左侧首屏/第一位-展现概率
 */
var AoWidget_18 = new nirvana.aoWidget();

AoWidget_18.operation = {
	openOptionWindow : function() {
		var itemParam = {
			title: '选项设置（仅针对展现概率提示功能）',
			width: 500,
			params: {
				isTool: true
				//itemId: itemId
			},
			id: 'Widget18OptionWindow',
			actionPath: 'ao/option18',
			className : 'widget_detail',
			onclose: function(){
				nirvana.aoControl.refresh([18, 19]);
			}
		};
		nirvana.util.openSubActionDialog(itemParam);
		
		nirvana.aoWidgetAction.logCenter('ao_option_set', {
			opttype : 18
		});
	}
};

/**
 * 摘要3 关键词左侧展现资格优化
 */
var AoWidget_3 = new nirvana.aoWidget();

AoWidget_3.buildResult = function(json){
	var html = json.html,
		itemId = json.itemId,
		value = json.data[0].value;
		
	if(value[1]){
		html = html.replace(/%m/, '，其中<span class="ao_em">' + value[1] + '</span>个较易优化');
	}else{
		html = html.replace(/%m/, '');
	}
	html = nirvana.aoWidgetAction.decrWord(html,value[2],'，<span class="ao_em">' + value[2] + '</span>个关键词昨日突降为1星');
	return html;
};
/**
 * 摘要15 创意状态分析
 */
var AoWidget_15 = new nirvana.aoWidget();

AoWidget_15.buildResult = function(json){
	var html = json.html,
		itemId = json.itemId,
		value = json.data[0].value[0];
	
	switch (itemId) {
		case nirvana.aoControl.item['idea_active'] :
			html = html.replace(/%s/, '待激活');
			if (value > nirvana.config.AO.QUICK_ACCEPT_LIMIT) {
				html = html.replace(/%handle/, '');
			} else {
				html = html.replace(/%handle/, '<a class="ao_enable" href="#">全部激活</a>');
			}
			break;
		case nirvana.aoControl.item['idea_bad'] :
			html = html.replace(/%s/, '不宜推广');
		    html = html.replace(/%handle/, '');
			break;
		case nirvana.aoControl.item['idea_pause'] :
			html = html.replace(/%s/, '暂停推广');
			if (value > nirvana.config.AO.QUICK_ACCEPT_LIMIT) {
				html = html.replace(/%handle/, '');
			} else {
				html = html.replace(/%handle/, '<a class="ao_enable" href="#">全部启用</a>');
			}
			break;
		default :
		    break;
	}
	
	return html;
};

/*
AoWidget_15.init = function(itemId){
	return;
	var btn = getElementsByClassName('aoBtn', 'AoItem_' + itemId, 'a')[0],
	    btnAll = getElementsByClassName('aoEnable', 'AoItem_' + itemId, 'a')[0];
	
	addEvent(btn, 'click', AoWidget_15.optimize.init);
	
	if (btnAll) {
		addEvent(btnAll, 'click', function(e){
			AoWidget_15.confirm.init(itemId, e)
		});
	}
};
*/

AoWidget_15.shortCut = function(json) {
	var itemId = json.itemId,
		data = json.data,
		aoControl = nirvana.aoControl,
		prefix = aoControl.widgetPrefix,
		item = aoControl.item,
		startIndex = 0,
		endIndex = data[0].value[0] - 1,
		btns = baidu.q('ao_enable', prefix + itemId, 'a');

	for (var i = 0, j = btns.length; i < j; i++) {		
		btns[i].onclick = function(e) {
			var e = e || window.event,
				logParam = {
					opttype : itemId,
					type : -2,
					value : data[0].value[0]
				};
				
			AoWidget_15.itemId = itemId;
			
			AoWidget_15.operation.getIds(itemId, startIndex, endIndex);
			
			nirvana.aoControl.isViewDetail = true;
			
			//快捷操作点击的监控		
			nirvana.aoWidgetAction.logCenter('ao_quick_accept', logParam);
			AoWidget_15.logParam = logParam;
			
			baidu.event.stop(e);
		};
	}
};

AoWidget_15.operation = {
	/**
	 * 获取全部id
	 * @param {Object} itemId
	 * @param {Object} startIndex
	 * @param {Object} endIndex
	 */
	getIds : function(itemId, startIndex, endIndex) {
		var me = this,
			params = nirvana.aoControl.params;
		
		switch (itemId) {
			case 15:
				fbs.ao.ideaActiveDetailIdeaIds(AoWidget_15.operation.requestTpl(params, startIndex, endIndex, 15));
				break;
			case 17:
				fbs.ao.ideaPauseDetailIdeaIds(AoWidget_15.operation.requestTpl(params, startIndex, endIndex, 17));
				break;
		}
	},
	
	/**
	 * 激活
	 * @returns {Function} 激活
	 */
	activeHandler: function(ids) {
	
	    return function (dialog) {
	        var dialog = dialog,
	        	func = fbs.idea.active,//需要调用的接口函数
	            param = {
					ideaid: dialog.args.id, 
	                activestat : '0',
	                onSuccess: function(response){
						if (response.status != 300) {
							fbs.material.clearCache('ideainfo');
							nirvana.aoControl.refresh(AoWidget_15.itemId);
						}
					}, 
	                onFail: AoWidget_15.operation.operationFailHandler()
				};            
	            func(param);
				
				// 监控
				AoWidget_15.logParam.type = 1;
				nirvana.aoWidgetAction.logCenter('ao_quick_accept', AoWidget_15.logParam);
	     };
	},
	/**
	 * 启用
	 * @returns {Function} 启用
	 */
	enableHandler: function(ids) {
	
	    return function (dialog) {
	        var dialog = dialog,
	            func = fbs.idea.modPausestat,//需要调用的接口函数
	            param = {
					ideaid: dialog.args.id, 
					pausestat : '0',
	                onSuccess: function(response){
						if (response.status != 300) {
							fbs.material.clearCache('ideainfo');
							nirvana.aoControl.refresh(AoWidget_15.itemId);
						}
					}, 
	                onFail: AoWidget_15.operation.operationFailHandler()
				};
	            func(param);
				
				// 监控
				AoWidget_15.logParam.type = 1;
				nirvana.aoWidgetAction.logCenter('ao_quick_accept', AoWidget_15.logParam);
	     };
	},
	
	operationFailHandler : function () {	
	    return function () {
	        ajaxFailDialog();            
	    };
	},
	
	
	/**
	 * 请求模板
	 * @param {Object} id
	 */
	requestTpl : function(params, startIndex, endIndex, itemId){
		
		return {
			level : params.level,
			condition : params.condition,
			signature : '',
			startindex : startIndex,
			endindex : endIndex,
				
			onSuccess : function(response) {
				var data = response.data,
					aostatus = data.aostatus,
					dialogParam,
					itemIdToOperation = {
						15 : 'active',
						17 : 'enable'
					},
					itemIdToType = {
						15 : 'ideaid',
						17 : 'ideaid'
					},
					type,
					itemIdToContent = {
						15 : {
							title : '激活创意',
							content : '您确定激活全部创意吗?'
						},
						17 : {
							title : '启用创意',
							content : '您确定启用全部创意吗？'
						}
					},
					operationToParam = {
						'active' : {
		                    title : itemIdToContent[itemId]['title'],
		                    content : itemIdToContent[itemId]['content'],
							onok : AoWidget_15.operation.activeHandler(itemId),
							oncancel: function(){
								// 监控
								AoWidget_15.logParam.type = 0;
								nirvana.aoWidgetAction.logCenter('ao_quick_accept', AoWidget_15.logParam);
							}
						},
						'enable' : {
							title: itemIdToContent[itemId]['title'],
							content: itemIdToContent[itemId]['content'],
							optype: 'enableItem', 
							onok: AoWidget_15.operation.enableHandler(itemId),
							oncancel: function(){
								// 监控
								AoWidget_15.logParam.type = 0;
								nirvana.aoWidgetAction.logCenter('ao_quick_accept', AoWidget_15.logParam);
							}
						}
					};
				
				if (aostatus != 0) {
					switch (aostatus) {
						case 4: // 需要更详细的请求数据，不只是签名
							// 重新请求数据
							AoWidget_15.operation.getIds(itemId, startIndex, endIndex);
							break;
						default:
							ajaxFailDialog(); // 相当于status 500
							break;
						}
						return;
				}
				
				type = itemIdToType[itemId];
				dialogParam = operationToParam[itemIdToOperation[itemId]];
				dialogParam.id = data[type];
				
				ui.Dialog.confirm(dialogParam);
			},
			onFail : function() {
				ajaxFailDialog();
			}
		};
	}		
};


















/**
 * 摘要20 不连通比例过高
 */
var AoWidget_20 = new nirvana.aoWidget();

/**
 * 摘要21 连通速度较慢
 */
var AoWidget_21 = new nirvana.aoWidget();

/**
 * 摘要22 跳出率较高
 */
var AoWidget_22 = new nirvana.aoWidget();

AoWidget_22.buildResult = function(json){
	var html = json.html,
		itemId = json.itemId,
		content = '',
		value = json.data[0].value;
	
	if (value[0] > 0) {
		content += '<span class="ao_em">' + value[0] + '</span>条创意';
		
		if (value[1] > 0) {
			 content += '，';
		}
	}
    if(value[1] > 0) {
        content += '<span class="ao_em">' + value[1] + '</span>个关键词';
    }
	
	html = html.replace(/%content/, content.replace(/,$/, '')); // 这里不知道后端会返回什么，先保留
	
	return html;
};

/**
 * 摘要24 转化率
 */
var AoWidget_24 = new nirvana.aoWidget();

AoWidget_24.init = function() {
	// 这里直接覆盖掉init，让按钮直接跳转
	return;
};

// wanghuijun 2012.12.03
// 效果突降彻底下线，删去效果突降新增的优化建议