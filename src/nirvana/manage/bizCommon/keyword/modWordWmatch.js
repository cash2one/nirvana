/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    manage/modWordWmatch.js
 * desc:    修改关键词匹配方式
 * author: 	zhouyu
 * date:    $Date: 2011/1/26 $
 */

/**
 *  修改关键词匹配方式
 *  @param
 *  beforeSave {function} [OPTIONAL] 在将修改值发送给后端之前执行的函数 by mayue
 */
manage.modWordWmatch = new er.Action({
	
	VIEW: 'modWordWmatch',
	
	IGNORE_STATE : true,
	
	/**
	 * 填充ui
	 * @param {Object} callback
	 */
	CONTEXT_INITER_MAP : {
		init:function(callback){
			var me = this;
			callback();
		}
		
	},
	
	/**
	 * 事件绑定
	 */
	onafterrender : function(){
		var me = this,
			control = me._controlMap;
		control.modWordWmatchOk.onclick = me.modifyWordWmatchOk();
		control.modWordWmatchCancel.onclick = function(){
			me.onclose();
		};
		
	},

	/**
	 * 修改提交
	 */
	modifyWordWmatchOk: function(){
		var me = this,
		    action = me.arg.action;
		return function(){
			var winfoids = me.arg.winfoid,
				match = me._controlMap.wordBroad.getGroup().getValue();
			
			var callback = me.arg.beforeSave;
			if ( callback && callback.call(me, match) === false) {
				return;
			}
			
			fbs.keyword.modWmatch({
				winfoid : winfoids,
				wmatch: match,
				onSuccess:function(data){
					if (data.status != 300) {
						var modifyData = {};
						for (var i = 0, l = winfoids.length; i < l; i++) {
							modifyData[winfoids[i]] = {
								"wmatch": match
							};
						}
						fbs.avatar.getMoniWords.ModCache("winfoid", modifyData);
						fbs.material.ModCache('wordinfo', "winfoid", modifyData);

						if (me.arg.isDecr) {//从效果突降进来
							var action = me.arg.action;
							me.onclose();
							action.setContext('pageNo', 1);
							action.refreshSelf(action.getStateMap());
						}
						//如果是效果分析工具 add by yanlingling@baidu.com
						else if ('undefined' != typeof me.arg.fromProcedure && me.arg.fromProcedure == 'effectAnalyse') {
							var action = me.arg.action;
						//    console.log(action);
							var tableList = ui.util.get("analyseTableList"), 
							tableTool = nirvana.effectAnalyse.keywordList, 
							newValue=match;
							for (var i = 0; i < winfoids.length; i++) {
								tableTool.modifyTableData(tableList.datasource, winfoids[i], "wmatch", newValue); //修改表格当前的展现值
								tableTool.modifyTableData(action.getContext("allTableData"), winfoids[i], "wmatch", newValue);//修改表格数据缓存的当前展现值
								tableTool.modifyTableData(action.getContext("filteredAllTableData"), winfoids[i], "wmatch", newValue);//修改表格数据缓存的当前展现值
								
								action.getContext('listDataObj')[winfoids[i]]['wmatch'] = newValue; //修改所有查询数据的值
							}
							
                            
                            if (tableList.filterCol["wmatch"] == true) {
                                tableTool.filterChangeHandler(action)();
                            }
                            else {
                                tableList.render(tableList.main);
                                tableTool.showFolders(action);//添加监控文件夹
                            }
							var logparam = {};
					            logparam.batchOpType = 'match';
					            nirvana.effectAnalyse.lib.logCenter("", logparam);
						}
						else {
							er.controller.fireMain('reload', {});
						//	me.onclose();
						}
						me.onclose();
					}
				},
				onFail: me.saveFailHandler(winfoids, match)
			});
		}
	},
	
	/**
	 * 修改失败
	 */
	saveFailHandler: function(winfoids, match){
		var me = this,
		    action = me.arg.action;
		return function(data){
			if (data.status != 300) {
				ajaxFail(0);
			}
			else {
				var error = data.error,
					errorList = {},
					errorcode,
					errorWord = [],
					errorTip = [],
					errorArea = baidu.g("improveWordUrlErrorTip"),
					modifyData = {};
				for (var item in error) {
					errorList[item] = true;
					errorWord[errorWord.length] = error[item].wmatch.message;
				}
				errorcode = error[item].wmatch.code;
				if (errorcode == 644) {
					errorTip[errorTip.length] = nirvana.config.ERROR.KEYWORD.ADD[errorcode];
					errorTip[errorTip.length] = "<div id='wordBatchError' class='word_batch_error'>";
					
					for (var j = 0, l = errorWord.length; j < l; j++) {
						errorTip[errorTip.length] = "<div>" + errorWord[j] + "</div>";
					}
					
					errorTip[errorTip.length] = "</div>";
					errorArea.innerHTML = errorTip.join("");
					errorArea.style.height = (errorArea.offsetHeight < 155 ? errorArea.offsetHeight : 155) + "px";
					errorArea.style.display = "block";
				}
				for (var i = 0, l = winfoids.length; i < l; i++) {
					if (!errorList[winfoids[i]]) {//部分修改成功
						modifyData[winfoids[i]] = {
								"wmatch" : match
							};
							
						//如果是效果分析工具 add by yanlingling@baidu.com
				    var tableList = ui.util.get("analyseTableList"), 
						tableTool = nirvana.effectAnalyse.keywordList, 
						newValue=match;
						if ('undefined' != typeof me.arg.fromProcedure && me.arg.fromProcedure == 'effectAnalyse') {
							tableTool.modifyTableData(tableList.datasource, winfoids[i], "wmatch", newValue); //修改表格当前的展现值
							tableTool.modifyTableData(action.getContext("allTableData"), winfoids[i], "wmatch", newValue);//修改表格数据缓存的当前展现值
							tableTool.modifyTableData(action.getContext("filteredAllTableData"), winfoids[i], "wmatch", newValue);//修改表格数据缓存的当前展现值
							
							action.getContext('listDataObj')[winfoids[i]]['wmatch'] = newValue; //修改所有查询数据的值
							
						}
							
					}
				}
				fbs.avatar.getMoniWords.ModCache("winfoid", modifyData);
				fbs.material.ModCache('wordinfo',"winfoid", modifyData);
					}
				//如果是效果分析工具 add by yanlingling@baidu.com
                
                if ('undefined' != typeof me.arg.fromProcedure && me.arg.fromProcedure == 'effectAnalyse') {
                    //如果被筛选
                    console.log(tableList.filterCol["wmatch"]);
                    if (tableList.filterCol["wmatch"] == true) {
                        tableTool.filterChangeHandler(action)();
                    }
                    else {
                        tableList.render(tableList.main);
                        tableTool.showFolders(action);//添加监控文件夹
                    }
					
					 //监控
                    var logparam = {};
                    logparam.batchOpType = 'match';
                    nirvana.effectAnalyse.lib.logCenter("", logparam);
               //     console.log("match");
                }	
					else{	
					er.controller.fireMain('reload', {});
					}
			
				
			};
				
		}
	}
); 