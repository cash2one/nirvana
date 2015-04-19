/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: accountOptimizer/all/widget/widget13.js 
 * desc: 单元优化
 * author: yangji01@baidu.com
 * date: $Date: 2011/11/25 $
 */

ao.widget13 = new er.Action({
	
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
							'enableItem'
						],
						tip : '%n个单元暂停推广，您可以在操作栏中点击启用恢复。'
					},
					1 : { //单元被删除
						button : [
						],
						tip : '以下单元昨日被删除，导致展现量突降，建议恢复已删除计划中优质的关键词，提升推广效果。'
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
					0 : 13,
					1 : 43
				},
				idToTabIndex = {
					13 : 0,
					43 : 1
				},	
				/**
	    		* 关键词优化部分Tab标题
	    		*/
				tabTitle = {
					0 : '单元暂停推广',
					1 : '单元被删除'
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
    				allData= {
						planinfo : {
							content:nirvana.aoWidgetRender.planinfo(),
						    title: '推广计划'
						}, 
						unitinfo : {
						    content: function(item){
								var func = nirvana.aoWidgetRender.unitinfo(),
									html = func(item),
									tabIndex = me.getContext('tabIndex');
									
								if(tabIndex == 0 && item.isdecr){
									html += nirvana.aoWidgetAction.makeBubble(me,'昨日突变为无效状态',item);
								}
								return html;
							},
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
						    title: baidu.date.format(nirvana.decrControl.beginDate, 'MM-dd')+'日展现量',
							align: 'right'
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
						optRestoreDeletedWords : {
							content: nirvana.aoWidgetRender.optRestore,
						    title: '操作'
						}
					},
					tabToFields = {
						0 : [
							{
								field : 'unitinfo',
								width : 300
							},						
							{
								field : 'planinfo',
								width : 300
							},
							{
								field : 'statusPause',
								width : 90
							},								
							{
								field : 'clks',
								width : 90
							},	
							{
								field : 'paysum',
								width : 90
							}					
						], 
						1 : [
							{
								field : 'unitinfo',
								width : 180
							},
							{
								field : 'planinfo',
								width : 180
							},
							{
								field : 'beginvalue',
								width : 100
							},	
							{
								field : 'endvalue',
								width : 100
							},	
							{
								field : 'decr',
								width : 100
							},
							{
								field : 'optRestoreDeletedWords',
								width : 100
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
			controlMap=me._controlMap,
			//levelId,tabIndexToTarget,tabIndexToContent 为原来operationHandler函数的内部参数
			//tabToItem,funcList 为原来doOperationHandler函数的内容参数
			//widget_8.js 拆成widget_13,widget_14后将上述两个函数放入lib_widget.js中并将参数上述的参数提出来
			levelId = {
				0 : 'unitid'
			}, // 监控用
			tabIndexToTarget = {
				0 : 'aowidget_batch_active_unit'
			},
			tabIndexToContent = {
				0 : {
					title : '启用推广单元',
					content : ['您确定启用所选的' , '个推广单元吗？']
				}
			},
			tabToItem = {
				0 : 'unit'
			},
			funcList = {
				'unit' : fbs.unit.modPausestat
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
			
			me.setContext('showCheckbox', tabIndex == 1 ? 'none' : 'multi');
			
			switch (tabIndex) {
			case 0:
				fbs.ao.getUnitPause( nirvana.aoWidgetAction.requestTpl(me,params, startindex, endindex, 0, callback) );
				break;
			case 1 :
				fbs.aodecr.getUnitDeleteDetail( nirvana.aoWidgetAction.requestTpl(me,params, startindex, endindex, 1, callback) );				
				break;
			default :
				break;				
		}			
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
				0 : fbs.unit.modPausestat
			},
			pauseItems = {
				0 : 'unitid'
			},
			logParams = {
				target: 'inlineRunPause_btn'
			},			
			tabIndex = me.getContext('tabIndex'),
			idArr = nirvana.aoWidgetAction.getRowIdArr(me,target, pauseItems[tabIndex]),
			tabIndexToLogCenterParam = {
				0 : {
					target : 'aowidget_active_unit',
					param: {
						planid: nirvana.aoWidgetAction.getRowIdArr(me,target, 'planid')[0],
						unitid: idArr[0]
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
			0 : {
				unitid: idArr,
            	onSuccess: function(response){
					var modifyData = response.data;
					fbs.material.ModCache('unitinfo', 'unitid', modifyData);
					//单元的状态改变会影响关键词、创意状态的改变
					fbs.material.clearCache('wordinfo');
					fbs.material.clearCache('ideainfo');
					//	fbs.unit.getInfo.clearCache();
//					er.controller.fireMain('reload', {});
					//ui.util.get('SideNav').refreshPlanList();
					ui.util.get('SideNav').refreshNodeInfo('unit',idArr);
					me.setContext('pageNo', 1);
					me.refreshSelf(me.getStateMap());					
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
	logCenter : function(me,actionName, param){
		var me = this,
			logParam = {
				target: actionName,
				opttype : me.getContext('opttype')
			};
		
		baidu.extend(logParam, param);
		
		nirvana.aoControl.sendLog(logParam, nirvana.aoControl.snapShot);
	}
});