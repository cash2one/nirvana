/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    keyword/addError.js
 * desc:    添加关键词错误处理
 * author:  wanghuijun
 * date:    $Date: 2011/01/17 $
 */

manage.keywordAddError = new er.Action({
	
	VIEW: 'keywordAddError',
	
	IGNORE_STATE : true,
	
	//UI参数设置
	UI_PROP_MAP : {
	},
	
	CONTEXT_INITER_MAP : {
	},
	
	onafterrender : function(){
		var me = this,
		    controlMap = me._controlMap,
			errorInfo = me.arg.errorInfo,
			key,
			html = [],
			errorWord = '',
			errerCode = '',
			errorMsg = '';
		
		//errorInfo = {'word' : errCode}	
		for (key in errorInfo) {
			errorWord = baidu.encodeHTML(key);
			errerCode = errorInfo[key].code;
			errorMsg = nirvana.config.ERROR.KEYWORD.ADD[errerCode] ?
			           nirvana.config.ERROR.KEYWORD.ADD[errerCode] : errorInfo[key].message;
					   // 如果没有配置errerCode对应的错误信息，则显示返回的msg
			
			html.push('<li><h4>关键词：' + errorWord + '</h4><p class="warn">' + errorMsg + '</p></li>');
			
		}
		
		if (baidu.g('KeywordErrorUL')) {
			baidu.g('KeywordErrorUL').innerHTML = html.join('');
		}
		
	},
	
	
	onentercomplete : function(){
		var me = this,
		    controlMap = me._controlMap,
			confirmType = me.arg.confirmType,
			planid = me.arg.planid,
			unitid = me.arg.unitid;
		
		// 确定
		controlMap.KeywordConfirm.onclick = function(){
			fbs.keyword.getList.clearCache();
			er.controller.fireMain('reload', {});
			me.onclose();
			
			var param = {
				planid : planid,
				unitid : unitid,
				changeable : false // 层级不可编辑
			};
			
			if (confirmType == 'openIdea') { // 新增创意
				nirvana.manage.createSubAction.idea(param);
			}
		};
	}
});