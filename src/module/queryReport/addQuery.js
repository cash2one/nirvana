/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    queryReport/addQuery.js
 * desc:    添加为关键词
 * author:  wanghuijun
 * date:    $Date: 2011/2/14 $
 * param: {function(array)} arg.onAdd(datasource) 添加时的回调，datasource是添加的词组成的数组，主要用于监控   mayue@baidu.com
 * param: {function(array)} arg.onAddSuccess(datasource) 添加成功时的回调，datasource是添加成功的词组成的数组
 */

ToolsModule.addQuery = new er.Action({
	VIEW : 'addQueryWord',
	
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
		QueryMatchType : {
			value : '15',
			datasource : '*matchData',
			width : '80'
		}
	},
	
	CONTEXT_INITER_MAP : {
		matchType : function(callback) {
			this.setContext('matchData', [{
				value : '15',
				text : '广泛'
			}, {
				value : '63',
				text : '精确'
			}, {
				value : '31',
				text : '短语'
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
		
		if (me.arg.repeat) {
			baidu.g('AddQueryTip').innerHTML = '您已选择的词存在部分重复，已进行去重处理。';
			baidu.removeClass('AddQueryTip', 'hide');
		} else {
			baidu.addClass('AddQueryTip', 'hide');
		}
		
		// 填充搜索词列表
		me.fillList();
		baidu.g('AddQueryList').onclick = me.listClickHandler();
		
		// 获取计划列表
		nirvana.queryReport.getPlanList(me);
		
		// 确定添加
		controlMap.AddQuerySubmit.onclick = me.addQuery();
		
		// 取消添加
		controlMap.AddQueryCancel.onclick = function() {
			me.onclose();
		};
		
	},
	
	//每次页面装载完成后执行
	onentercomplete : function(){
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},
	
	/**
	 * 添加为关键词
	 */
	addQuery : function() {
		var me = this;
		
		return function() {
			var datasource = me.arg.datasource,
				data,
				len = datasource.length,
				controlMap = me._controlMap,
				QueryMatchType = controlMap.QueryMatchType,
				QueryLevelPlan = controlMap.QueryLevelPlan,
				QueryLevelUnit = controlMap.QueryLevelUnit,
				i,
				items = [];
			
			if (QueryLevelUnit.getValue() == -2) { // 添加到所属单元
				for (i = 0; i < len; i++) {
					data = datasource[i];
					
					items.push({
						planid: data.planid,
						unitid: data.unitid,
						idx: i,
						keyword: data.query,
						wmatch: QueryMatchType.getValue()
					});
				}
			} else { // 添加到下拉框选择的层级
				for (i = 0; i < len; i++) {
					data = datasource[i];
					
					items.push({
						planid: QueryLevelPlan.getValue(),
						unitid: QueryLevelUnit.getValue(),
						idx: i,
						keyword: data.query,
						wmatch: QueryMatchType.getValue()
					});
				}
			}
			
			// 保存匹配模式
			me.setContext('matchType' , QueryMatchType.getText());
			// 保存层级
			me.setContext('unitLevel' , QueryLevelUnit.getValue());
			me.setContext('planid' , QueryLevelPlan.getValue());
			me.setContext('planname' , baidu.decodeHTML(QueryLevelPlan.getText()));
			me.setContext('unitid' , QueryLevelUnit.getValue());
			me.setContext('unitname' , baidu.decodeHTML(QueryLevelUnit.getText()));
			
			if (me.arg.onAdd) {
			    me.arg.onAdd(items);
			}
			
			fbs.keyword.addMultiUnit({
				items : items,
				
				callback : me.addQueryCallback()
			});
		};
	},
	
	/**
	 * 添加为关键词回调函数
	 */
	addQueryCallback : function() {
		var me = this;
		
		return function(response) {
			var matchType = me.getContext('matchType'),
			    unitLevel = me.getContext('unitLevel'),
				dataList = response.data,
				errorList = response.error,
				datasource = me.arg.datasource,
				dataSuccess = [],
				dataFail = [],
				param = {},
				index,
				data,
				oridata,
				word;
			
			if (unitLevel == -2) { // 添加到所属单元，用datasource的计划单元名称
				for (var i = 0, j = dataList.length; i < j; i++) {
					data = dataList[i];
					index = data.index;
					word = data.showword;
					
					oridata = datasource[index];
					
					dataSuccess.push({
						planid : oridata.planid,
						planname : oridata.planname,
						unitid : oridata.unitid,
						unitname : oridata.unitname,
						word : word,
						matchtype : matchType
					});
				}
				
				for (var i = 0, j = errorList.length; i < j; i++) {
					data = errorList[i];
					index = data.idx;
					
					oridata = datasource[index];
					
					dataFail.push({
						planname : oridata.planname,
						unitname : oridata.unitname,
						word : oridata.query,
						error : data.code,
						message : data.message
					});
				}
			} else { // 添加到相同单元，用Select的计划单元名称
				var planid = me.getContext('planid'),
				    planname = me.getContext('planname'),
					unitid = me.getContext('unitid'),
					unitname = me.getContext('unitname');
				
				for (var i = 0, j = dataList.length; i < j; i++) {
					data = dataList[i];
					index = data.index;
					word = data.showword;
					
					dataSuccess.push({
						planid : planid,
						planname : planname,
						unitid : unitid,
						unitname : unitname,
						word : word,
						matchtype : matchType
					});
				}
				
				for (var i = 0, j = errorList.length; i < j; i++) {
					data = errorList[i];
					index = data.idx;
					
					oridata = datasource[index];
					
					dataFail.push({
						planname : planname,
						unitname : unitname,
						word : oridata.query,
						error : data.code,
						message : data.message
					});
				}
			}
			
			if (response.status == 200) { // 添加全部成功，后端会返回error字段，所以手动置空
				dataFail = [];
			}
			
			param = {
				dataSuccess : dataSuccess,
				dataFail : dataFail,
				type : 'pos',
				upAction : me.arg.upAction
			};
			
			if (me.arg.onAddSuccess) {
                me.arg.onAddSuccess(dataSuccess);
            }
			
			// 先关闭再打开另一个action
			me.onclose();
			
			nirvana.util.openSubActionDialog({
				id: 'AddCallbackDialog',
				title: me.arg.title,
				width: '470',
				actionPath: '/tools/queryReport/addQueryCallback',
				params: param,
				onclose: function(){
				}
			});
			
		};
	},
	
	listClickHandler : function() {
		var me = this;
		
		return function(event) {
			var event = event || window.event,
			    target = baidu.event.getTarget(event);
			
			if (baidu.dom.hasClass(target, 'cancel')) {
				var index = +target.getAttribute('index');
				
				me.removeQuery(index);
			};
			
			baidu.event.stop(event);
		};
	},
	
	/**
	 * 删除某个搜索词
	 */
	removeQuery : function(index) {
		var me = this;
		
		// 删除数据项
		baidu.array.removeAt(me.arg.datasource, index);
		me.fillList();
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
			
			if (i == 0) {
				html.push('<li class="noborder">');
			} else {
				html.push('<li>');
			}
			html.push('<h4>' + baidu.encodeHTML(data.query) + '</h4>');
            if (data.planname) {
                html.push('<p><span>所属推广计划：</span>' + baidu.encodeHTML(data.planname) + '</p>');
            }
            if (data.unitname) {
			    html.push('<p><span>所属推广单元：</span>' + baidu.encodeHTML(data.unitname) + '</p>');
            }
			if (len > 1) {
				html.push('<a class="cancel" href="#" index="' + i + '">取消</a>');
			}
			html.push('</li>');
		}
		
		baidu.g('AddQueryNumber').innerHTML = len;
		baidu.g('AddQueryList').innerHTML = html.join('');
	}
});