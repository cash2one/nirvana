/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    keyword/keyword.js
 * desc:    推广管理
 * author:  wanghuijun
 * date:    $Date: 2011/01/17 $
 */

manage.keywordAdd = new er.Action({
	
	VIEW: 'keywordAdd',
	
	IGNORE_STATE : true,
	
	//UI参数设置
	UI_PROP_MAP : {
		// 计划下拉列表
		LevelPlan : {
			emptyLang : '请选择推广计划',
			width : '154'
		},
		
		// 单元下拉列表
		LevelUnit : {
			emptyLang : '请选择推广单元',
			width : '154'
		},
		
		// 关键词输入框
		KeywordBox : {
			height : '180',
			width : '300'
		}
	},
	
	CONTEXT_INITER_MAP : {
	},
	
	onafterrender : function(){
	},
	
	
	onentercomplete : function(){
		var me = this,
		    controlMap = me._controlMap,
		    LevelPlan = controlMap.LevelPlan,
		    LevelUnit = controlMap.LevelUnit,
			KeywordBox = controlMap.KeywordBox,
			planid = me.arg.planid,
			unitid = me.arg.unitid;
		
		// 添加关键词
		var addKeyword = function(confirmType) {
			var planid = LevelPlan.getValue(),
			    unitid = LevelUnit.getValue(),
				keywords = KeywordBox.getArray();
			
			if (typeof(confirmType) == 'undefined') {
				var confirmType = '';
			}
			
			if (!unitid || +unitid < 0) { //没有选择推广单元
				baidu.g('LevelError').innerHTML = '请选择要添加的层级';
				baidu.removeClass('LevelError', 'hide');
				return false;
			} else {
				baidu.addClass('LevelError', 'hide');
			}
			
			if (!keywords.length) { //没有输入关键词，对应错误638
				if (baidu.g('KeywordWarn')) {
					baidu.g('KeywordWarn').innerHTML = nirvana.config.ERROR.KEYWORD.ADD[638];
					baidu.removeClass('KeywordWarn', 'hide');
				}
				return false;
			} else if (keywords.length > nirvana.config.NUMBER.KEYWORD.MAX_INPUT) { //输入关键词超过限制，对应错误 exceed
				if (baidu.g('KeywordWarn')) {
					baidu.g('KeywordWarn').innerHTML = nirvana.config.ERROR.KEYWORD.ADD['exceed'];
					baidu.removeClass('KeywordWarn', 'hide');
				}
				return false;
			} else {
				baidu.addClass('KeywordWarn', 'hide');
			}

			fbs.keyword.add({
				planid : planid,
				unitid : unitid,
				keywords : keywords,
				
				onSuccess : function(response) {
					if (response.status == 300) { // 添加关键词部分成功，不需要处理成功逻辑，fbs会调用onFail
						return false;
					}
					me.onclose();
					
					var param = {
						planid : planid,
						unitid : unitid,
						changeable : false // 层级不可编辑
					};
					
					if (confirmType == 'openIdea') { //新增创意
						nirvana.manage.createSubAction.idea(param);
					}
				},
				onFail : function(response) {
					var errorObj = response.error,
					    errorWord,
						errorBody,
						errorInfo = {};  // {'错误关键词', '错误码'}
					
					for (var i in errorObj) {
						errorWord = keywords[errorObj[i].idx]; // idx对应关键词的index
						errorBody = errorObj[i];
						
						if (errorWord) { // 避免返回的idx没有对应的关键词
							errorInfo[errorWord] = errorBody;
						}
					}
					
					var param = {
						confirmType : confirmType,
						planid : planid,
						unitid : unitid,
						errorInfo : errorInfo
					};
					
					me.onclose();
					// 打开错误提示子action
					nirvana.manage.createSubAction.keywordAddError(param);
				}
			});
		};
		
		// 获取计划单元列表
		nirvana.manage.getPlanList(me);
		
		// 更新关键词数量
		baidu.on(controlMap.KeywordBox.areaObj, 'keyup', function() {
			var number = KeywordBox.getArray().length;
			
			baidu.g('KeywordNumber').innerHTML = number;
			
			baidu.addClass('KeywordWarn', 'hide');
			
			if (number > 100) {
				baidu.addClass('KeywordNumber', 'warn');
			} else {
				baidu.removeClass('KeywordNumber', 'warn');
			}
		});
		
		// 确定
		controlMap.KeywordSubmit.onclick = function() {
			addKeyword();
		};
		
		// 确定并新增创意
		controlMap.KeywordToIdea.onclick = function() {
			addKeyword('openIdea');
		};
		
		// 取消添加关键词
		controlMap.KeywordCancel.onclick = function(){
			ui.Dialog.confirm({
                title: '确认',
                content: "您确定不进行新建操作了吗？",
                onok: function(){
                    me.onclose()
                },
                oncancel: function(){
                }
            });
		};
	}
});
