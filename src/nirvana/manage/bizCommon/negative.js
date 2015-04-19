/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    manage/negative.js
 * desc:    否定关键词设置
 * author: 	zhouyu
 * date:    $Date: 2011/1/13 $
 */

/**
 * 否定关键词设置
 */
manage.negative = new er.Action({
	
	VIEW: 'setNegative',
	
	IGNORE_STATE : true,
	
	//初始化tab
	CONTEXT_INITER_MAP : {
		init: function(callback){
			var me = this;
			me.setContext("acctSetTab",["否定关键词","精确否定关键词"]);
			callback();
		}
		
	},
	onbeforerender : function(){
		var me = this;
		var num = manage.account.otherSetting.getConfig('NEGAWORD_NUM_MAX');
		me.setContext('negCount',num);
	},
	/**
	 * 获取否定关键词并进行填充
	 */
	onafterrender : function(){
		var me = this,
			controlMap = me._controlMap,
			type = me.arg.type,
			func;
		if(type == "plan"){
			var planid = me.arg.planid;
			fbs.plan.getNegativeInfo({
				condition: {
					planid: planid
				},
				onSuccess: me.getNegInfoOk(),
				onFail: function(data){
				}
			});
		}else if(type == "unit"){
			var unitid = me.arg.unitid;
			fbs.unit.getNegativeInfo({
				condition: {
					unitid:unitid
				},
				onSuccess: me.getNegInfoOk(),
				onFail: function(data){
				}
			});
		}
		controlMap.setNegOk.onclick = me.setNagSubmit();
		controlMap.setNegCancel.onclick = function(){me.onclose();}
	},
	
	/**
	 * 切换tab
	 */
	onentercomplete : function(){
		var me = this;
		me._controlMap.negSetTab.onselect = function(tab){
			if(+tab == 1){
				var param = {};
				param.type = me.arg.type;
				if(param.type == "plan"){
					param.planid = me.arg.planid;
				}else if(param.type == "unit"){
					param.unitid = me.arg.unitid;
				}
				nirvana.util.openSubActionDialog({
					id: 'negatSetDialog',
					title: '否定关键词',
					width: 440,
					actionPath: 'manage/accurateNegative',
					params: param,
					onclose: function(){
					//	fbs.plan.getNegativeInfo.clearCache();//清除cache
						er.controller.fireMain('reload', {});
					}
				});
			}
		}
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},
	
	/**
	 * 提交
	 */
	setNagSubmit: function(){
		var me = this,
			controlMap = me._controlMap,
			type = me.arg.type,
			modifyData = {};
		return function(){
			var negWord = controlMap.negword.getArray(), 
				accNegWord = me.getContext("negativeInfo").accuratenegative,
				func,param = {},
				modifyData = {},
				ids = [];
				
			if (type == "plan") {
				func = fbs.plan.modNegativeWord;
				ids = me.arg.planid;
				param.planid = ids;
			}
			else 
				if (type == "unit") {
					func = fbs.unit.modNegativeWord;
					ids = me.arg.unitid;
					param.unitid = ids;
				}
			param.negative = negWord;
			param.accuratenegative = accNegWord;
			for (var i = 0, l = ids.length; i < l; i++) {
				modifyData[ids[i]] = {
					"negative": negWord,
					"allnegativecnt": negWord.length + accNegWord.length
				};
			}
			param.onSuccess = function(data){
				if (data.status == 300) {
					if (type == "plan") {
						fbs.material.clearCache('planinfo');
					}
					else 
						if (type == "unit") {
							fbs.material.clearCache('unitinfo');
						}
				}
				else {
					baidu.g("negWordTip").innerHTML = '保存成功';
					if (type == "plan") {
						fbs.material.ModCache("planinfo", "planid", modifyData);
					}
					else 
						if (type == "unit") {
							fbs.material.ModCache("unitinfo", "unitid", modifyData);
						}
				}
			};
			param.onFail = me.failHandler();
			func(param);
		}
	},
	
	/**
	 * 失败处理
	 */
	failHandler: function(){
		var me = this;
		return function(data){
			if (data.status != 500) {
				var error = fbs.util.fetchOneError(data), 
					negtip = baidu.g("negWordTip"),  
					errorcode;
				negtip.innerHTML = "";
				for (var item in error) {
					errorcode = error[item].code;
					switch (errorcode) {
						case 450:
						case 451:
						case 452:
						case 801:
						case 802:
						case 803:
						case 804:
						case 805:
						case 806:
							negtip.innerHTML = nirvana.config.ERROR.NEGATIVE[errorcode];
							break;
						case 644:
							negtip.innerHTML = nirvana.config.ERROR.KEYWORD.ADD[errorcode];
							break;
					}
				}
			}else{
				ajaxFail(0);
			}
			
		}
	},

	/**
	 * 将初始数据插入文本输入框中
	 */
	getNegInfoOk: function(){
		var me = this;
		return function(data){
			var dat = me.decodeNegWord(data.data.listData[0]);
			me.setContext("negativeInfo", dat);
			if (dat && dat.negative) {
				me._controlMap.negword.addText(dat.negative);
			}
		}
	},
	
	/**
	 * 将返回的否定关键词和精确否定关键词进行解码
	 * @param {Object} word
	 */
	decodeNegWord: function(word){
		var neg = word.negative,
			accNeg = word.accuratenegative;
		for (var i = 0, l = neg.length; i < l; i++) {
			neg[i] = decode(neg[i]);
		}
		for (var i = 0, l = accNeg.length; i < l; i++) {
			accNeg[i] = decode(accNeg[i]);
		}
		return word;
	}
}); 