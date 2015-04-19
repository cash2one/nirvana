/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: accountOptimizer/all/widget/widget8.js 
 * desc: 关键词优化
 * author: wangdalu@baidu.com
 * date: $Date: 2011/07/19 $
 */

ao.widget8 = new er.Action({
	
	VIEW: 'widgetDetail8',
	
	/**
    * 要保持的状态集合。“状态名/状态默认值”形式的map。
    */
    STATE_MAP: {
    },
	
	UI_PROP_MAP: {
		
		/**
    	 * 关键词优化Tab属性
   	 	 */
		WidgetTab: {
			title: '*tabTitle',
			tab: '*tabIndex',
			itemClassName: '*itemClass'
		},
		
		/**
    	 * 关键词无效控件属性
   	 	 */
		WidgetTable: {
			select : '*showCheckbox',
			fields : '*widgetTableFields',
			datasource : '*widgetTableData',
			orderBy : 'decr',
			noDataHtml : FILL_HTML.NO_DATA
    	},
	
		/**
   	 	 * 关键词无效分页控件
    	 */
		WidgetPage : {
			page : '*pageNo',
			total : '*totalPage',
			align : 'right'
		}
	},
	
	CONTEXT_INITER_MAP: {

		// 子action没有状态保持，所以这里初始化一些参数
		/**
		 * tabToFields为每个tab项对应的表格字段，其顺序与tabTitle的顺序一一对应
		 * idToTabIndex为传入的itemId对应于关键词优化部分tabindex的序号对照表
		 * tipMessages为每个tab项对应的不同tips信息
		 */		
		init : function(callback) {
			var me = this,
				pageNo = me.arg.pageNo || 1,
				tabToButtonAndTip = {
					0 : {
						button : [
							'modifyBid',
							'activeItem',
							'deleteItem'
						], 
						tip : '您的推广顾问为您提交了%n个关键词，在您激活后即可上线展现。点击操作列中的“激活”链接，可立即激活关键词。'
					},
					1 : {
						button : [
							'modifyBid',
							'deleteItem'
							],
						tip : '检索无效的关键词当前无法上线展现，建议您优化关键词质量度或者调整关键词出价，使关键词可以正常上线。'
					},
					2 : {
						button : [
							'modifyBid',
							'deleteItem'					
						],
						tip : '%n个关键词不符合推广标准，无法正常推广。请根据不宜推广的具体原因重新提交关键词或相关信息，系统将重新审核您的关键词。' 
					}, 
					3 : {
						button : [
							'modifyBid',
							'enableItem',
							'deleteItem'
						],
						tip : '%n个关键词暂停推广，您可以在操作栏中点击启用恢复。'
					}, 
					4 : {
						button : [
							'modifyBid',
							'deleteItem'							
						],
						tip : '%n个关键词因检索流量过低，系统已经暂停推广。一旦有更多用户开始搜索您的关键词，系统会自动恢复推广。您可以暂时保留这些关键词，以等待有更多的用户搜索。您也可以通过系统中的关键词工具，选择其它能为您带来丰富流量的关键词。' 
					}, 
					5 : { //关键词已删除
						button : [
						],
						tip : '展现量较大的关键词昨日被删除，建议您恢复优质关键词，提高展现。'
					}
				},
				allButtonIds = [
					'modifyBid',
					'activeItem',
					'deleteItem',
					'enableItem'					
				];			

			me.setContext('pageNo', pageNo);
			me.setContext('pageSize', nirvana.config.AO.DETAIL_PAGESIZE);
			me.setContext('tabToButtonAndTip', tabToButtonAndTip);
			me.setContext('allButtonIds', allButtonIds);
			
			callback();
		},		
		
		/**
    	* 关键词优化Tab
    	*/
		wordTab: function(callback){
			var me = this,
				itemId = me.arg.itemId,
				tabIndex,
				item,
				title = [],
				tabIndexToId = {
					0 : 8,
					1 : 9,
					4 : 10,
					2 : 11,
					3 : 12,
					5 : 44
				},
				idToTabIndex = {
					8 : 0,
					9 : 1,
					10 : 4,
					11 : 2,
					12 : 3,
					44 : 5
				},	
				/**
	    		* 关键词优化部分Tab标题
	    		*/
				tabTitle = {
					0 : '关键词待激活',
					1 : '关键词搜索无效',				
					2 : '关键词不宜推广',
					3 : '关键词暂停推广',
					4 : '关键词搜索量过低',
					5 : '关键词被删除'
				},
				itemClass = [];
			
			if (me.arg.tabIndex || me.arg.tabIndex ===0 ) {
				tabIndex = me.arg.tabIndex;
				me.setContext('opttype', tabIndexToId[tabIndex]);
				AoWidget_8.itemId.push(tabIndexToId[tabIndex]);				
			} else {				
				tabIndex = idToTabIndex[itemId];
				me.setContext('opttype', itemId);
				AoWidget_8.itemId.push(itemId);
			}
			
			for (item in tabTitle) {
				title.push(tabTitle[item]);
			}
			
			for (var i in idToTabIndex) {
				var data = nirvana.aoControl.cacheData[i],
					item = idToTabIndex[i],
					className = '';
				
				if ((!data || (data && (data.status == 4 || (data.status == 2 && data.hasProblem == 0)))) && tabIndex != item) { //对确定没问题，且当前没有被点的tab进行隐藏
					className = 'hide';
				}
				
				itemClass[item] = className;
			}
			
			me.setContext('tabTitle', title);
			me.setContext('tabIndex', tabIndex);
			me.setContext('itemClass', itemClass);
			me.setContext('tabIndexToId', tabIndexToId);

			callback();
		},
				
		/**
    	* 关键词优化表格表头初始化
    	*/
    	wordFields: function(callback){
            	var me = this,
					beginValueTitle = baidu.date.format(nirvana.decrControl.beginDate, 'MM-dd') + '日展现量',
    				allData= {
						showword : {
		       				content: function(item){
								var html = '',
									tabIndex = me.getContext('tabIndex'),
									func = nirvana.aoWidgetRender.wordinfo(22);
								
								//关键词搜索无效、关键词不宜推广、关键词暂停推广需要将最大长度缩短来放突降图标
								if((tabIndex == 1 || tabIndex == 2 || tabIndex == 3 ) && item.isdecr){	
									 item.decrLimit = true;
								}
								html += func(item)
								//不是计划暂停及单元暂停时
								if(item.isdecr){	
									html += nirvana.aoWidgetAction.makeBubble(me,'昨日突变为无效状态',item);
								}
								return html;
							},
						    title: '关键词'
						}, 
						planinfo : {
							content: nirvana.aoWidgetRender.planinfo(),
						    title: '推广计划'
						}, 
						unitinfo : {
						    content:nirvana.aoWidgetRender.unitinfo(),
						    title: '推广单元'
						},
						statusNormal : {
							content: nirvana.aoWidgetRender.statusNormal,
						    title: '状态',
							align: 'left'
						},
						statusBad : {
							content: nirvana.aoWidgetRender.statusBad,
						    title: '状态',
							align: 'left'
						},					 
						statusPause : {
							content: nirvana.aoWidgetRender.statusPause,
						    title: '状态',
							align: 'left'
						},
						clks : {
						    content: nirvana.aoWidgetRender.clks,
						    title: '点击',
							align: 'right'
						}, 
						paysum : {
						    content: nirvana.aoWidgetRender.paysum,
						    title: '消费',
							align: 'right'
						}, 
						bid : {
						    content: lib.field.getBidRenderer(),//nirvana.aoWidgetRender.bid,
						    title: '出价',
							align: 'right'
						}, 
						beginvalue : {
							content: nirvana.aoWidgetRender.beginvalue,
						    title: beginValueTitle,
							align: 'right',
							stable : true
						},
						endvalue : {
							content: nirvana.aoWidgetRender.endvalue,
						    title: '昨日展现量',
							align: 'right'
						},
						decr : {
							content: nirvana.aoWidgetRender.decr,
						    title: '展现量下降',
							align: 'right',
							field: 'decr'
						},
						optRestore : {
						    content: nirvana.aoWidgetRender.optRestore,
						    title: '操作'
						}
					},
					tabToFields = {
						0 : [
							{
								field : 'showword',
								width : 180
							},
							{
								field : 'planinfo',
								width : 180
							},
							{
								field : 'unitinfo',
								width : 180
							},	
							{
								field : 'statusNormal',
								width : 100
							},	
							{
								field : 'clks',
								width : 100
							},	
							{
								field : 'paysum',
								width : 100
							},
							{
								field : 'bid',
								width : 100
							}					
						], 
						1 : [
							{
								field : 'showword',
								width : 180
							},
							{
								field : 'planinfo',
								width : 180
							},
							{
								field : 'unitinfo',
								width : 180
							},	
							{
								field : 'clks',
								width : 100
							},	
							{
								field : 'paysum',
								width : 100
							},
							{
								field : 'bid',
								width : 100
							}						
						], 
						2 : [
							{
								field : 'showword',
								width : 180
							},
							{
								field : 'planinfo',
								width : 180
							},
							{
								field : 'unitinfo',
								width : 180
							},	

							{
								field : 'clks',
								width : 100
							},	
							{
								field : 'paysum',
								width : 100
							},
							{
								field : 'statusBad',
								width : 100
							},								
							{
								field : 'bid',
								width : 100
							}					
						], 
						3 : [
							{
								field : 'showword',
								width : 180
							},
							{
								field : 'planinfo',
								width : 180
							},
							{
								field : 'unitinfo',
								width : 180
							},	
							{
								field : 'statusPause',
								width : 95
							},	
							{
								field : 'clks',
								width : 100
							},	
							{
								field : 'paysum',
								width : 100
							},
							{
								field : 'bid',
								width : 100
							}												
						], 
						4 : [
							{
								field : 'showword',
								width : 300
							},
							{
								field : 'planinfo',
								width : 300
							},								
							{
								field : 'unitinfo',
								width : 300
							},	
							{
								field : 'bid',
								width : 100
							}						
						], 
						5 : [
							{
								field : 'showword',
								width : 150
							},
							{
								field : 'unitinfo',
								width : 140
							},
							{
								field : 'planinfo',
								width : 140
							},
							{
								field : 'beginvalue',
								width : 100
							},	
							{
								field : 'endvalue',
								width : 50
							},	
							{
								field : 'decr',
								width : 50
							},
							{
								field : 'optRestore',
								width : 50
							}
						]
					},
					tableFields = [],
					len,
					width,
					i,
					itemTmp,
					fieldItem,
					tabIndex = me.getContext('tabIndex'),
					localList = tabToFields[tabIndex];					
				
				for(i = 0, len = localList.length; i < len; i++){
					itemTmp = localList[i];
      	 			fieldItem = allData[itemTmp['field']];
					fieldItem['width'] = itemTmp['width'];
					tableFields.push(fieldItem);
     			}					

				me.setContext('widgetTableFields', tableFields);

				me.updateTableContent(tabIndex, callback);
    	}
	},
	
	onafterrender: function(){
		var me = this,
			tmp,
			controlMap = me._controlMap,
			//levelId,tabIndexToTarget,tabIndexToContent 为原来operationHandler函数的内部参数
			//tabToItem,funcList为原来doOperationHandler函数的内容参数
			//widget_8.js 拆成widget_13,widget_14后将上述两个函数放入lib_widget.js中并将参数上述的参数提出来
			levelId = {
				3 : 'winfoid'
			},
			tabIndexToTarget = {
				3 : 'aowidget_batch_resume_word'
			},
			tabIndexToContent = {
				3 : {
					title : '启用关键词',
					content : ['您确定启用所选的' , '个关键词吗？']
				}
			},
			tabToItem = {
				0 : 'word',
				1 : 'word',
				2 : 'word',
				3 : 'word',
				4 : 'word'
			},
			funcList = {
				'word' : fbs.keyword.modPausestat
			};
		
		nirvana.aoWidgetRender.download(me);
		//行内编辑
		controlMap.WidgetTable.main.onclick = nirvana.aoWidgetAction.getTableInlineHandler(me);
		
		//按钮的操作
		controlMap.modifyBid.disable(true);		
		controlMap.modifyBid.onclick = function(){
			nirvana.aoWidgetAction.operationHandler(me,levelId,tabIndexToTarget,tabIndexToContent,tabToItem,funcList,'modifyBid');
		};
		controlMap.deleteItem.disable(true);		
		controlMap.deleteItem.onclick = function(){
			nirvana.aoWidgetAction.operationHandler(me,levelId,tabIndexToTarget,tabIndexToContent,tabToItem,funcList,'deleteItem');
		}
		controlMap.activeItem.disable(true);
		controlMap.activeItem.onclick = function(){
			nirvana.aoWidgetAction.operationHandler(me,levelId,tabIndexToTarget,tabIndexToContent,tabToItem,funcList,'activeItem');
		};
		controlMap.enableItem.disable(true);		
		controlMap.enableItem.onclick = function(){
			nirvana.aoWidgetAction.operationHandler(me,levelId,tabIndexToTarget,tabIndexToContent,tabToItem,funcList,'enableItem');
		};
		
		//给表格选择注册事件(主要用于激活按钮状态)
		controlMap.WidgetTable.onselect = nirvana.aoWidgetAction.buttonEnableHandler(me);
		
		//tab的选择操作
		controlMap.WidgetTab.onselect = nirvana.aoWidgetAction.getTabHandler(me);
		
		//page的选择操作		
		controlMap.WidgetPage.onselect = nirvana.aoWidgetAction.getPageHandler(me);
		//me.refresh();

	},
		
	onafterrepaint: function(){
		
    },
	
	onreload : function(){ 

	},	
	
	onentercomplete: function(){
		var me = this,
			tabIndex,
			opttype = me.getContext('opttype'),
		    controlMap = me._controlMap;
		
		tabIndex = me.getContext('tabIndex');
		nirvana.aoWidgetAction.showButton(me,tabIndex);
		
		controlMap.AoDetailClose.onclick = function(){
			me.onclose();
		};
		
		// 表格重新计算，避免表头计算错误
		controlMap.WidgetTable.refreshView();
		
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},
		
	/**
	 * 根据点击的TAB进行表格的更新渲染，包括表格上方的tip
	 */
	updateTableContent : function(tabIndex, callback){
		var me = this,
			tip,
			params = nirvana.aoControl.params,
			startindex = (me.getContext('pageNo') - 1) * me.getContext('pageSize'),
			endindex = startindex + me.getContext('pageSize')-1;	
		
		me.setContext('showCheckbox', tabIndex == 5 ? 'none' : 'multi');
					
		switch (tabIndex) {
			case 0:
				fbs.ao.getWordActive( nirvana.aoWidgetAction.requestTpl(me,params, startindex, endindex, 0, callback) );
				break;
			case 1 :
				fbs.ao.getWordSearchInvalid( nirvana.aoWidgetAction.requestTpl(me,params, startindex, endindex, 1, callback) );				
				break;
			case 2 :
				fbs.ao.getWordBad( nirvana.aoWidgetAction.requestTpl(me,params, startindex, endindex, 2, callback) );				
				break;
			case 3:
				fbs.ao.getWordPause( nirvana.aoWidgetAction.requestTpl(me,params, startindex, endindex, 3, callback) );
				break;
			case 4:
				fbs.ao.getWordPvTooLow( nirvana.aoWidgetAction.requestTpl(me,params, startindex, endindex, 4, callback) );
				break;
			case 5:
				fbs.aodecr.getWordDeleteDetail( nirvana.aoWidgetAction.requestTpl(me,params, startindex, endindex, 5, callback) );
				break;
			default :
				break;				
		}
	},	
	
    /**
     * 激活所选的
     * @returns {Function} 激活所选函数
     */
    activeHandler: function() {
        var me = this;
		
        return function (dialog) {
            var dialog = dialog,
                func = fbs.keyword.active,//需要调用的接口函数
                winfoid = nirvana.aoWidgetAction.getSelected(me,'winfoid'),
                param = {
					winfoid: winfoid, 
	                activestat : '0',
	                onSuccess: function(response){
						if (response.status != 300) {
							var modifyData = response.data;
							fbs.avatar.getMoniWords.ModCache('winfoid', modifyData);
							fbs.material.ModCache('wordinfo', 'winfoid', modifyData);
							me.setContext('pageNo', 1);
							me.refreshSelf(me.getStateMap());
						}
					}, 
	                onFail: nirvana.aoWidgetAction.operationFailHandler()
				}; 
				//批量激活确定的监控（不考虑是否成功，点击就发）                         
				me.logCenter('aowidget_batch_active_word', {
					id : nirvana.aoWidgetAction.getSelected(me,'winfoid'),
					count : me.selectedList.length,
					type : 1
				});
                func(param);
         };
    },
	
    /**
     * 执行行内启用操作
     */
    doInlinePause : function (target) {
        var me = this,
            idArr, pauseSta,
			func,
			param,
			logCenterParam,	
			funcList = {
				3 : fbs.keyword.modPausestat
			},
			pauseItems = {
				3 : 'winfoid'
			},
			logParams = {
				target: 'inlineRunPause_btn'
			},			
			tabIndex = me.getContext('tabIndex'),
			idArr = nirvana.aoWidgetAction.getRowIdArr(me,target, pauseItems[tabIndex]),
			tabIndexToLogCenterParam = {
				3 :{
					target : 'aowidget_resume_word',
					param: {
						planid: nirvana.aoWidgetAction.getRowIdArr(me,target, 'planid')[0],
						unitid: nirvana.aoWidgetAction.getRowIdArr(me,target, 'unitid')[0],
						winfoid: idArr[0]
					}
				}
			};
		
		logCenterParam = tabIndexToLogCenterParam[tabIndex];
		func = funcList[tabIndex];		   
        var pauseStat = nirvana.manage.getPauseStat(target,[0,1]);
		logParams.pauseStat = pauseStat;
		NIRVANA_LOG.send(logParams);
        nirvana.manage.inserLoadingIcon(target);
		var paramsList = {
			3 : {
				winfoid: idArr,
				onSuccess: function(response){
					//将data改为了resposne
					if (response.status != 300) {
						var modifyData = response.data;
						fbs.avatar.getMoniWords.ModCache('winfoid', modifyData);
						fbs.material.ModCache('wordinfo', 'winfoid', modifyData);
						me.setContext('pageNo', 1);
						me.refreshSelf(me.getStateMap());
					}			
				}	
			}
		};
		
		//行内启用的监控（不管是否成功，都发）
		me.logCenter(logCenterParam['target'], logCenterParam['param']);		
		param = paramsList[tabIndex];
		param.pausestat = pauseStat;
		param.onFail = nirvana.aoWidgetAction.inlinePauseFailed;
        func(param);
    },
	
	
	/**
	* 需要状态保持的变量（点击page时）
	*/	
	getStateMap: function(){
		var me = this;
		var stateMap = {			
				tabIndex : me.getContext('tabIndex'),
				pageNo : me.getContext('pageNo') || 1
			};

		return stateMap;
	},

	/**
	 * 日志中心
	 * @param {String} actionName	//操作类别
	 * @param {Array} param			//参数，非必须
	 * 
	 * 快捷方式
	 * logCenter('aowidget_tab');                //切换tab
	 * logCenter('aowidget_batch_active_word');  //批量激活
	 * logCenter('aowidget_batch_resume_word');  //批量启用关键词
	 * logCenter('aowidget_resume_word');        //启用关键词
	 * logCenter('aowidget_batch_active_plan');  //批量启用计划
	 * logCenter('aowidget_active_plan');        //启用计划
	 * logCenter('aowidget_batch_active_unit');  //批量启用单元
	 * logCenter('aowidget_active_unit');        //启用单元
	 * logCenter('aowidget_del_word');           //删除关键词
	 * logCenter('aowidget_status_icon');
	 */
	logCenter : function(actionName, param){	
		var me = this,
			logParam = {
				target: actionName,
				opttype : me.getContext('opttype')
			};
		
		baidu.extend(logParam, param);
		
		nirvana.aoControl.sendLog(logParam, nirvana.aoControl.snapShot);
	}
});