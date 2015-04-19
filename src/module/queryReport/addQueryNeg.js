/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    queryReport/addQuery.js
 * desc:    添加为否定关键词
 * author:  wanghuijun
 * date:    $Date: 2011/2/14 $
 */

ToolsModule.addQueryNeg = new er.Action({
	VIEW : 'addQueryNeg',
	
	STATE_MAP : {
	},

	UI_PROP_MAP : {
		// 计划下拉列表
		QueryLevelPlan : {
			emptyLang : '请选择推广计划',
			width : '200'
		},
		
		// 单元下拉列表
		QueryLevelUnit : {
			emptyLang : '请选择推广单元',
			width : '200'
		},
		
		// 匹配模式下拉列表
		QueryNegMatchType : {
			value : '1',
			datasource : '*matchData',
			width : '120'
		}
	},
	
	CONTEXT_INITER_MAP : {
		matchType :function(callback) {
			this.setContext('matchData', [{
				value : '1',
				text : '精确否定关键词'
			}, {
				value : '0',
				text : '否定关键词'
			}]);
			
			callback();
		}
	},
	
	//refresh后执行
	onafterrepaint : function(){
	},
	
	//第一次render后执行
	onafterrender : function(){
		var me = this,
		    controlMap = me._controlMap,
			datasource = me.arg.datasource;
		
		controlMap.QuerySelectRadioPlan.setChecked(true);
		me.setContext('addLevel', 'plan');
		me.toggleLevel();
		
		baidu.g('QuerySelectNeg').onclick = me.changeLevel();
		
		// 计算添加词的数量
		if (baidu.g('AddQueryNegNumber')) {
			baidu.g('AddQueryNegNumber').innerHTML = datasource.length;
		}
		// 填充搜索词列表
		me.fillList();
		
		// 获取计划列表
		nirvana.queryReport.getPlanList(me);
		
		// 确定添加
		controlMap.AddQuerySubmit.onclick = me.addQueryNeg();
		
		// 取消添加
		controlMap.AddQueryCancel.onclick = function() {
			me.onclose();
		}
		
	},
	
	//每次页面装载完成后执行
	onentercomplete : function(){
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},
	
	/**
	 * 改变添加层级
	 */
	changeLevel : function() {
		var me = this;
		
		return function(event){
			var event = event || window.event,
			    target = baidu.event.getTarget(event),
			    value = target.getAttribute('value'),
				dom = ui.util.get('QueryLevelUnit').main.parentNode;
			
			switch (value) {
				case 'plan':
					me.setContext('addLevel', 'plan');
					break;
				case 'unit':
					me.setContext('addLevel', 'unit');
					break;
			}
			nirvana.queryReport.checkBtn();
			me.toggleLevel();
		};
	},
	
	/**
	 * 展开收起层级
	 */
	toggleLevel : function() {
		var level = this.getContext('addLevel'),
		    dom = ui.util.get('QueryLevelUnit').main.parentNode;
		
		switch (level) {
			case 'plan' :
				baidu.hide(dom);
				baidu.g('QuerySelectNeg').appendChild(baidu.g('QuerySelectUnit'));
				break;
			case 'unit' :
				baidu.show(dom);
				baidu.dom.insertAfter(baidu.g('QuerySelectUnit'), baidu.g('QuerySelectPlan'));
				//强制选中，否则IE7下会不显示input选中状态
				ui.util.get('QuerySelectRadioUnit').setChecked(true);
				break;
		}
	},
	
	/**
	 * 添加为否定关键词
	 */
	addQueryNeg : function() {
		var me = this;
		
		return function() {
			var datasource = me.arg.datasource,
				level = me.getContext('addLevel'),
				controlMap = me._controlMap,
				QueryNegMatchType = controlMap.QueryNegMatchType,
				QueryLevelPlan = controlMap.QueryLevelPlan,
				QueryLevelUnit = controlMap.QueryLevelUnit,
				planid,
				unitid,
				query = datasource[0].query,
				planname,
				unitname;
			
			if (QueryLevelUnit.getValue() == -2) { // 添加到所属单元
				planid = datasource[0].planid;
				planname = datasource[0].planname;
				unitid = datasource[0].unitid;
				unitname = datasource[0].unitname;
			} else { // 添加到下拉框选择的层级
				planid = QueryLevelPlan.getValue();
				planname = baidu.decodeHTML(QueryLevelPlan.getText());
				unitid = QueryLevelUnit.getValue();
				unitname = baidu.decodeHTML(QueryLevelUnit.getText());
			}
			
			me.setContext('planid', [planid]);
			me.setContext('unitid', [unitid]);
			me.setContext('planname', planname);
			me.setContext('unitname', unitname);
			me.setContext('query', query);
			me.setContext('matchType', QueryNegMatchType.getValue());
			me.setContext('matchTypeText', QueryNegMatchType.getText());
			
			if (level == 'plan') {
				fbs.plan.getNegativeInfo({
					condition: {
						planid: [planid]
					},
					onSuccess: me.getNegInfoOk(),
					onFail: function(data){
					}
				});
			} else {
				fbs.unit.getNegativeInfo({
					condition: {
						unitid: [unitid]
					},
					onSuccess: me.getNegInfoOk(),
					onFail: function(data){
					}
				});
			}
		};
	},

	/**
	 * 获取否定关键词
	 */
	getNegInfoOk: function(){
		var me = this;
		
		return function(data){
			var dat = me.decodeNegWord(data.data.listData[0]),
			    neg = dat.negative,
				accNeg = dat.accuratenegative,
				level = me.getContext('addLevel'),
				matchType = me.getContext('matchType'),
				query = me.getContext('query'),
				planid = me.getContext('planid'), // []
				unitid = me.getContext('unitid'), // []
				func,
				param = {};
			
			if (level == 'plan') {
				if (matchType == 1) {// 精确否定关键词
					func = fbs.plan.modAccurateNegativeWord;
				} else {
					func = fbs.plan.modNegativeWord;
				}
				
				param.planid = planid;
			} else {
				if (matchType == 1) {// 精确否定关键词
					func = fbs.unit.modAccurateNegativeWord;
				} else {
					func = fbs.unit.modNegativeWord;
				}
				
				param.unitid = unitid;
			}
			
			if (matchType == 1) {// 精确否定关键词
				accNeg.push(query);
			} else {// 否定关键词
				neg.push(query);
			}
			
			for (var i = 0, j = accNeg.length; i < j; i++) {
				accNeg[i] = baidu.encodeHTML(accNeg[i]);
			}
			
			for (var i = 0, j = neg.length; i < j; i++) {
				neg[i] = baidu.encodeHTML(neg[i]);
			}
			
			param.negative = neg;
			param.accuratenegative = accNeg;
			
			param.callback = me.addQueryNegCallback();
			
			func(param);
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
	},
	
	/**
	 * 添加为否定关键词回调函数
	 */
	addQueryNegCallback : function() {
		var me = this;
		
		return function(response) {
			var status = response.status,
			    datasource = me.arg.datasource,
			    level = me.getContext('addLevel'),
			    planid = me.getContext('planid')[0],
			    planname = me.getContext('planname'),
			    unitid = me.getContext('unitid')[0],
				unitname = me.getContext('unitname'),
				query = me.getContext('query'),
				matchTypeText = me.getContext('matchTypeText'),
				dataSuccess = [],
				dataFail = [],
				errorcode,
				param = {};
			
			if (status == 200) {
				dataSuccess.push({
					planname: planname,
					unitname: unitname,
					word: query,
					matchtype: matchTypeText
				});
			} else {
				var error = fbs.util.fetchOneError(response);
				
				for (var item in error) {
					errorcode = error[item].code;
				}
				dataFail.push({
					planname: planname,
					unitname: unitname,
					word: query,
					error: errorcode
				});
			}
					
			if (level == 'plan') {
				fbs.plan.getNegativeInfo.clearCache();//清除cache
			} else {
				fbs.unit.getNegativeInfo.clearCache();//清除cache
			}
			
			param = {
				dataSuccess : dataSuccess,
				dataFail : dataFail,
				type : 'neg',
				level : level,
				upAction : me.arg.upAction
			};
			
			// 先关闭再打开另一个action
			me.onclose();
			
			nirvana.util.openSubActionDialog({
				id: 'AddNegCallbackDialog',
				title: me.arg.title,
				width: '470',
				actionPath: '/tools/queryReport/addQueryCallback',
				params: param,
				onclose: function(){
				}
			});
		};
	},
	
	/**
	 * 填充搜索词列表
	 */
	fillList : function() {
		var me = this,
		    datas = me.arg.datasource,
			len = datas.length,
			data,
			i,
			html = [];
		
		for (i = 0; i < len; i++) {
			data = datas[i];
			
			html.push('<li class="noborder">');
			html.push('<h4>' + baidu.encodeHTML(data.query) + '</h4>');
			html.push('<p><span>所属推广计划：</span>' + baidu.encodeHTML(data.planname) + '</p>');
			html.push('<p><span>所属推广单元：</span>' + baidu.encodeHTML(data.unitname) + '</p>');
			html.push('</li>');
		}
		
		baidu.g('AddQueryNegList').innerHTML = html.join('');
	}
});