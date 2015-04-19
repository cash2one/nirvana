/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    keyword/transfer.js
 * desc:    推广管理 关键词转移
 * author:  wanghuijun
 * date:    $Date: 2011/01/20 $
 */

manage.keywordTransfer = new er.Action({
	
	VIEW: 'keywordTransfer',
	
	IGNORE_STATE : true,
	
	//UI参数设置
	UI_PROP_MAP : {
		// 目标计划名select
		TargetPlan : {
			emptyLang : '请选择推广计划',
			width : '170'
		},
		
		// 单元下拉列表
		TargetUnit : {
			emptyLang : '请选择推广单元',
			width : '170'
		},
		
		// 新建单元输入框
		TargetUnitName : {
			type : 'TextInput',
			height : '20',
			width : '160'
		}
	},
	
	CONTEXT_INITER_MAP : {
	},
	
	onafterrender : function(){
		var me = this,
		    controlMap = me._controlMap,
			TargetPlan = controlMap.TargetPlan,
		    TargetUnit = controlMap.TargetUnit;
		
		// 获取计划列表
		me.getPlanList();
		// 切换计划时获取单元列表
		TargetPlan.onselect = me.getUnitList();
		// 切换单元时显示隐藏输入框
		TargetUnit.onselect = me.selectNewUnit();
	},
	
	
	onentercomplete : function(){
		var me = this,
		    controlMap = me._controlMap;
		
		// 确定转移关键词
		controlMap.ConfirmTransfer.onclick = me.submitReady();
		
		// 取消转移关键词
		controlMap.CancelTransfer.onclick = function() {
			me.onclose();
		};
		
		// 关闭按钮
		controlMap.Close.onclick = function(){
			//er.controller.fireMain('reload', {});//onclose的时候已经reload的了，modify by yll
			me.onclose();
		};
		
		// 全部转移
		controlMap.TransferAll.onclick = function(){
			// 设置请求参数
			me.setContext('needovewrite', 1);  // 0，第一次转移；1，全部转移，覆盖；2，只转移不重复关键词
			
			me.submit();
		};
		
		// 只转移不重复词
		controlMap.TransferOnly.onclick = function(){
			// 设置请求参数
			me.setContext('needovewrite', 2);  // 0，第一次转移；1，全部转移，覆盖；2，只转移不重复关键词
			
			me.submit();
		};
		
		// 全部取消
		controlMap.CancelAll.onclick = function(){
			me.onclose();
		};
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},
	
	/**
	 * 提交数据，第一次确认
	 */
	submitReady : function() {
		var me = this,
		    controlMap = me._controlMap,
			TargetPlan = controlMap.TargetPlan,
		    TargetUnit = controlMap.TargetUnit,
			TargetUnitName = controlMap.TargetUnitName;
		
		return function(){
			if (!me.validate()) { // 验证没有通过
				return false;
			}
			
			// 设置请求参数
			me.setContext('planid', TargetPlan.getValue());
			me.setContext('unitid', TargetUnit.getValue());
			me.setContext('unitname', TargetUnitName.getValue());
			me.setContext('winfoid', me.arg.winfoid);
			me.setContext('isnew', (TargetUnit.getValue() == -1)); // unitid为-1时，代表转移到新建单元
			me.setContext('needovewrite', 0);  // 0，第一次转移；1，全部转移，覆盖；2，只转移不重复关键词
			me.setContext('targetUnitName', TargetUnit.options[TargetUnit.index].text);
			
			me.submit();
		};
	},
	
	/**
	 * 提交数据
	 */
	submit : function() {
		var me = this;
		
		fbs.keyword.trans({
			planid : me.getContext('planid'), // 计划id string
			unitid : me.getContext('unitid'), // 单元id string 新建单元，后端不考虑从此参数，直接传-1（传任何值都可以）
			unitname : me.getContext('unitname'), // 单元名称 新建单元时关注，其余时候任意值，这里传''
			winfoid : me.getContext('winfoid'), // [winfoid, winfoid]
			isnew : me.getContext('isnew'), // true代表新建单元 boolean
			needovewrite : me.getContext('needovewrite'),
			
			//因为此处的逻辑比较复杂，没有明显的成功与失败，所以统一用callback处理
			callback: me.submitCallback()
		});
	},
	
	/**
	 * 提交数据回调函数
	 */
	submitCallback : function() {
		var me = this,
		    controlMap = me._controlMap,
			TargetPlan = controlMap.TargetPlan,
		    TargetUnit = controlMap.TargetUnit,
			TargetUnitName = controlMap.TargetUnitName;
		
		var targetUnitname = me.getContext('unitname') || me.getContext('targetUnitName');
				
		return function(response) {
			var status = response.status,
			    errorCode = response.errorCode.code,
				total = response.data.total, // 关键词数量
				failcount = response.data.failcount, // 转移失败关键词数量
				wordrepeat = eval(response.errorCode.detail.wordrepeat), // 重复的关键词数组  [{winfoid : '', showword : ''}]
				wordfail = eval(response.errorCode.detail.wordfail), //计划设备属性相同
				container = baidu.g('KeywordTransferInfoContent'), // 信息显示容器
				html = [],
				temp = [],
				str = ''
			if (status == 200) { // 全部转移成功
				if(me.getContext('unitid') == -1){
					me.setContext('unitid',response.data.unitid);
				}
				html.push('<p>已成功转移<span class="text_red bold">' + total + '</span>个关键词<span class="intro_unit_span">至推广单元：' +  targetUnitname + '</span></p>');
				me.setButton({
					id: 'Close'
				}); // 显示关闭按钮
				// 转移成功，则清除父action的cache
                fbs.material.clearCache('wordinfo');
				fbs.avatar.getMoniFolders.clearCache();
				fbs.avatar.getMoniWords.clearCache();
				
				// KR远征二期内容
				// add by LeoWang(wangkemiao@baidu.com)
				baidu.show('AddSuggestWordsWrap');
				baidu.show('SaveSuggestWordsContainer');
				baidu.show('SaveErrorExpe2');
				
				/**
				 * 根据指定单元的地域信息，planId不传为账户地域
				 * @param {Fuction} callback
				 * @param {Object} planId
				 */
				nirvana.manage.getRegionInfo(function(regions){
					me.setContext('regions', regions);
					var wordlist = [];
					if(!me.arg.queryMap){
						me.arg.queryMap = [];
					}
					
					for(var i = 0; i < me.arg.wordlist.length; i++){
						wordlist.push(baidu.string.encodeHTML(me.arg.wordlist[i]));
					}
					
					me.arg.queryMap.planid = me.getContext('planid');
					me.arg.queryMap.unitid = me.getContext('unitid');

					me.setContext('wordlist', wordlist);
					
					// KR远征二期
					// KWT 转移关键词工具
					var node = $$('.expedition', baidu.g('AddSuggestWordsWrap'))[0];
					me.embedExpe = new fc.module.EmbedExpedition(node, { 
						entry: 'KWT',
                        planid: me.getContext('planid'),
                        unitid: me.getContext('unitid'),
						onSuccess: function() {
							var upAction = me.arg.upAction;
							if (upAction && typeof upAction.queryStat === 'function') {
								upAction.queryStat();
							}
							me.onclose();
						}
					});
					// 保存按钮和显示错误的元素需要从远征中抽出来
					baidu.g('SaveSuggestWordsContainer').appendChild(me.embedExpe.saveBtn);
					baidu.g('SaveErrorExpe2').appendChild(me.embedExpe.errorNode);
					me.embedExpe.load(wordlist, regions);

					// add ended
				}, me.getContext('planid'));
				
				
				
			} else { // 部分失败或者全部失败，通过errorCode区别，不具体判断status

				baidu.hide('AddSuggestWordsWrap');
				baidu.hide('SaveSuggestWordsContainer');
				baidu.hide('SaveErrorExpe2');
				
				switch (errorCode) {
					// 全部转移失败，显示失败关键词，关闭子action时不刷新父action
					case 606:
						html.push('<p>已成功转移<span class="text_red bold">' + (total - failcount) + '</span>个关键词<span class="intro_unit_span">至推广单元：' +  targetUnitname + '</span></p>');
						if(wordfail.length>0){
						    html.push('<p>不成功的关键词有：');
						    for (var i = 0, j = wordfail.length; i < j; i++) {
							str = '<strong>' + baidu.encodeHTML(wordfail[i].showword) + '</strong>';
							temp.push(str);
						    }
						    html.push(temp.join('，'));
						    html.push('</p>');
					    }
					    html.push(me.handlerDeviceFail(response.errorCode));
                        
						me.setButton({
							id: 'Close'
						}); // 显示关闭按钮
						break;
						
					// 部分转移失败，显示失败关键词，关闭子action时刷新父action
					case 607:
						html.push('<p>已成功转移<span class="text_red bold">' + (total - failcount) + '</span>个关键词<span class="intro_unit_span">至推广单元：' +  targetUnitname + '</span></p>');
						if(wordfail.length>0){
						    
						    html.push('<p>不成功的关键词有：');
						
					       	for (var i = 0, j = wordfail.length; i < j; i++) {
							   str = '<strong>' + baidu.encodeHTML(wordfail[i].showword) + '</strong>';
							   temp.push(str);
						   }
						   html.push(temp.join('，'));
						   html.push('</p>');
						}
						
						html.push(me.handlerDeviceFail(response.errorCode));
						
						
						me.setButton({
							id: 'Close'
						}); // 显示关闭按钮
						fbs.material.clearCache('wordinfo');
						fbs.avatar.getMoniFolders.clearCache();
						fbs.avatar.getMoniWords.clearCache();
						break;
					
				
					
						
					// 新建单元失败，关键词全部转移失败，显示不成功的关键词
					case 503:
						html.push('<p>新建单元失败，关键词全部转移失败</p>');
						html.push('<p>不成功的关键词有：');
						
						for (var i = 0, j = wordfail.length; i < j; i++) {
							str = '<strong>' + baidu.encodeHTML(wordfail[i].showword) + '</strong>';
							temp.push(str);
						}
						html.push(temp.join('，'));
						html.push('</p>');
						me.setButton({
							id: 'Close'
						}); // 显示关闭按钮
						break;
						
					//关键词重复，显示重复关键词，按钮包括--全部转移  只转移不重复词  全部取消
					case 636:
						html.push('<p>' + wordrepeat.length + '个关键词与目标推广单元内已存在关键词重复，</p>');
						html.push('<p>重复关键词包括：');
						
						for (var i = 0, j = wordrepeat.length; i < j; i++) {
							str = '<strong>' + baidu.encodeHTML(wordrepeat[i].showword) + '</strong>';
							temp.push(str);
						}
						html.push(temp.join('，'));
						html.push('</p><p>点击“全部转移”将覆盖原有关键词。</p>');
						me.setButton({
							id : 'TransferAll',
							text : '全部转移'
						}, {
							id: 'TransferOnly',
							text : '只转移不重复词'
						}, {
							id: 'CancelAll'
						});
						break;
						
					//否定关键词冲突，显示不成功的关键词，按钮包括--只转移不重复词  全部取消
					case 635:
						html.push('<p>' + wordfail.length + '个关键词因计划和单元层级的否定关键词与短语匹配和广泛匹配的关键词冲突转移不成功</p>');
						html.push('<p>不成功的关键词有：');
						
						for (var i = 0, j = wordfail.length; i < j; i++) {
							str = '<strong>' + baidu.encodeHTML(wordfail[i].showword) + '</strong>';
							temp.push(str);
						}
						html.push(temp.join('，'));
						html.push('</p><p>您确认只转移不重复关键词吗？</p>');
						me.setButton({
							id : 'TransferAll',
							text : '只转移不重复词'
						}, {
							id: 'CancelAll'
						});
						break;
					
					//关键词已达上限，显示不成功的关键词，按钮包括--只转移不超限词  全部取消
					case 641:
						html.push('<p>' + wordfail.length + '个关键词因目标推广单元关键词数已达上限，转移不成功，</p>');
						html.push('<p>不成功的关键词有：');
						
						for (var i = 0, j = wordfail.length; i < j; i++) {
							str = '<strong>' + baidu.encodeHTML(wordfail[i].showword) + '</strong>';
							temp.push(str);
						}
						html.push(temp.join('，'));
						html.push('</p><p>您确认只转移不超过上限的关键词吗？</p>');
						container.innerHTML = html.join('');
						me.setButton({
							id : 'TransferAll',
							text : '只转移不超限词'
						}, {
							id: 'CancelAll'
						});
						
						break;
					
					// 其他情况，直接显示系统异常
					default:
						ajaxFailDialog();
						break;
				}
			}
			
			if (me.getContext('isnew')) { // 如果新建单元，则清除unitlist缓存
				fbs.unit.getNameList.clearCache();
			}
			
			container.innerHTML = html.join('');
			baidu.addClass('KeywordTransfer', 'hide'); // 隐藏计划单元选择层
			baidu.removeClass('KeywordTransferInfo', 'hide'); // 显示添加返回信息层
		};
	},
	
	/**
	 *处理因设备属性不同而无法转移 的错误 目前只有606和607的时候有
	 */
	handlerDeviceFail:function(errorCode){
             var temp = [];
             var html = [];
             if(errorCode.detail.devicefail && errorCode.detail.devicefail.length>0){//有因计划设备属性不同而失败的
                var wordfail = eval(errorCode.detail.devicefail); // 失败的关键词数组  [{winfoid : '', showword : ''}]，由于后端这里只能返回字符串，所以需要eval
                if(wordfail.length>0){
                     html.push('<p>共有' + wordfail.length + '个关键词因推广设备属性不同无法转移:');
                        
                    for (var i = 0, j = wordfail.length; i < j; i++) {
                             str = '<strong>' + baidu.encodeHTML(wordfail[i].showword) + '</strong>';
                             temp.push(str);
                         }
                    html.push(temp.join('，'));
                    html.push('</p>');  
                }
               
               
                }
             return html.join('');    
	},
    /**
     * 设置信息层的button，参数是数组 [{id : '控件id', value : '按钮名称'}]
     */
	setButton : function() {
		var btns = baidu.q('ui_button', 'KeywordTransferInfo'),
		    len = btns.length,
			arg = arguments,
			i = 0,
			btn,
			text;
		
		for (i = 0; i < len; i++) {
			baidu.addClass(btns[i], 'hide');
		}
		
		for (i = 0, len = arg.length; i < len; i++) {
			btn = ui.util.get(arg[i].id);
			text = arg[i].text;
			
			baidu.removeClass(btn.main, 'hide');
			if (text) { // 修改按钮文字
				btn.setLabel(text);
			}
		}
	},
	
	/**
	 * 获取计划列表
	 */
	getPlanList : function() {
		var me = this,
		    TargetPlan = me._controlMap.TargetPlan;
		
		fbs.plan.getNameList({
			onSuccess: function(response){
				var data = response.data.listData,
				    len = data.length,
					plandata = [nirvana.config.DEFAULT.SELECT_PLAN]; // 初始项“请选择推广计划”
				
				for (var i = 0; i < len; i++) {
					plandata.push({
						value: data[i].planid,
						text: baidu.encodeHTML(data[i].planname)
					});
				}
				
				TargetPlan.fill(plandata);
			},
			
			onFail: function(response){
				ajaxFailDialog();
			}
		});
	},
	
	/**
	 * 获取单元列表
	 */
	getUnitList : function() {
		var me = this,
		    controlMap = me._controlMap,
			TargetPlan = controlMap.TargetPlan,
		    TargetUnit = controlMap.TargetUnit,
			TargetUnitName = controlMap.TargetUnitName;
		
        return function() {
			var planid = TargetPlan.getValue();
			
			me.clearError();
			
            fbs.unit.getNameList({
				condition: {
					planid: [planid]
				},
				
				onSuccess: function(response) {
					var data = response.data.listData,
					    len = data.length,
						unitdata = [nirvana.config.DEFAULT.SELECT_UNIT]; // 初始项“请选择推广计划”
					
					for (var i = 0; i < len; i++) {
						unitdata.push({
							value: data[i].unitid,
							text: baidu.encodeHTML(data[i].unitname)
						});
					}
					
					if (+planid) { // planid不为0，选择了具体的推广计划
						unitdata.push({
							value: -1,
							text: '+ 新建单元 +'
						});
					}
					
					TargetUnit.fill(unitdata);
					
					if (+planid) { // planid不为0，选择了具体的推广计划
						TargetUnit.setValue(-1); // 选中新建单元
						TargetUnitName.setValue('');
						baidu.removeClass(TargetUnitName.main, 'hide');
					}
				},
				
				onFail: function(response){
					ajaxFailDialog();
				}
			});
        };
	},
	
	/**
	 * 选择新建单元
	 */
	selectNewUnit : function() {
		var me = this,
		    controlMap = me._controlMap,
		    TargetUnit = controlMap.TargetUnit,
		    TargetUnitName = controlMap.TargetUnitName,
			input = TargetUnitName.main;
		
		return function(selected) {
			if (selected == -1) { // 新建单元
				TargetUnitName.setValue('');
				baidu.removeClass(input, 'hide');
			} else { // 隐藏输入框，清空内容
				TargetUnitName.setValue('');
				baidu.addClass(input, 'hide');
			}
			me.clearError();
		};
	},
	
	/**
	 * 清除下拉框的错误提示
	 */
	clearError : function() {
		if (baidu.g('TargetPlanWarn')) {
			baidu.g('TargetPlanWarn').innerHTML = '';
			baidu.addClass('TargetPlanWarn', 'hide');
		}
		if (baidu.g('TargetUnitWarn')) {
			baidu.g('TargetUnitWarn').innerHTML = '';
			baidu.addClass('TargetUnitWarn', 'hide');
		}
	},
	
	/**
	 * 验证是否选中计划和单元
	 */
	validate : function() {
		var me = this,
		    controlMap = me._controlMap,
			TargetPlan = controlMap.TargetPlan,
		    TargetUnit = controlMap.TargetUnit,
			TargetUnitName = controlMap.TargetUnitName,
			unitname = TargetUnitName.getValue(),
			validator = true;
		
        if (!TargetPlan.getValue()) {
			baidu.g('TargetPlanWarn').innerHTML = '请选择计划';
			baidu.removeClass('TargetPlanWarn', 'hide');
            validator = validator && false;
        }
        if (!TargetUnit.getValue()) {
			baidu.g('TargetUnitWarn').innerHTML = '请选择单元';
			baidu.removeClass('TargetUnitWarn', 'hide');
            validator = validator && false;
        } else if (TargetUnit.getValue() == -1) { // 选择新建单元
			if (!unitname) {
                baidu.g('TargetUnitWarn').innerHTML = '请输入单元名';
				baidu.removeClass('TargetUnitWarn', 'hide');
                validator = validator && false;
            } else if(getLengthCase(unitname) > nirvana.config.NUMBER.UNIT.MAX_LENGTH){
                baidu.g('TargetUnitWarn').innerHTML = nirvana.config.ERROR.UNIT.NAME.TOO_LONG;
				baidu.removeClass('TargetUnitWarn', 'hide');
                validator = validator && false;
            }
        }
        return validator;
	},

	onleave: function() {
		this.embedExpe && this.embedExpe.dispose();
	}
});
