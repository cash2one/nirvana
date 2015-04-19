/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: accountOptimizer/all/widget/widget_15.js 
 * desc: 账户优化子项详情，关键词因质量度过低无法获取稳定的左侧首屏或首位展现资格
 * author: LeoWang(wangkemiao@baidu.com)
 * date: $Date: 2011/08/02 $
 */


ao.widget15 = new er.Action({
	VIEW: 'widgetDetail15',
	
	ActionIds : [15, 16, 17],  //对应着位置0 和 1
	ActionTitles : [
    	'创意待激活',
    	'创意不宜推广',
    	'创意暂停'
    ],
    ActionDescriptions : [
        '您的推广顾问为您撰写了{0}条创意。您可以在确认无误后，点击操作列中的“激活”链接，立即激活创意。',
        '{0}个创意不符合推广标准，无法正常推广。请根据审核拒绝的具体原因重新修改创意或相关信息，系统将重新审核您的创意。',
        '{0}个创意暂停推广，您可以在操作栏中点击启用恢复正常推广。'
    ],
    FuncToCall : [
        fbs.ao.ideaActiveDetail,
        fbs.ao.ideaRejectedDetail,
        fbs.ao.ideaPauseDetail
    ],
    
	
    /**
     * 工具箱里的子action不能保持状态，不能设置保持项
     */
    STATE_MAP: {},
	
	UI_PROP_MAP : {
		WidgetTab : {
			title : '*tabTitle',
			tab : '*tabIndex',
			itemClassName : '*itemClass'
		},
		WidgetTable : {
			fields : "*widgetTableFields",
			datasource : "*widgetTableData",
			noDataHtml : FILL_HTML.NO_DATA,
			select : "multi"
		},
		WidgetPage : { // 分页控件
			page : '*pageNo',
			total : '*totalPage'
		}
	},
	
	CONTEXT_INITER_MAP: {
		init : function(callback) {
			var me = this,
				pageNo = me.getContext('pageNo') || me.arg.pageNo || 1,
				tabIndex = me.getContext('tabIndex') || me.arg.tabIndex;
			
			me.setContext('pageNo', pageNo);
			me.setContext('pageSize', 5);
			
			if(tabIndex == null || 'undefined' == typeof tabIndex){ //这里用这个判断是因为tabIndex有可能是0 这样使用||就不行了
				tabIndex = baidu.array.indexOf(me.ActionIds, me.arg.itemId) || 0;
			}
			
			if(tabIndex < 0 || tabIndex >= me.ActionIds.length){
				tabIndex = 0;
			}
			me.setContext('tabIndex', tabIndex);

			me.setContext('opttype', me.ActionIds[tabIndex]);
			callback();
		},
		
		WidgetTable : function(callback){
			var me = this,
				tableFields = [
		       		{
		    			field : 'ideainfo',
		    			title : '创意',
		    			width : 310,
						//breakLine: true,
		    			//align : "center",
		    			content : me.tableColRender.ideainfo
		    		},
		    		{
		    			field : 'planname',
		    			title : '推广计划',
		    			width : 120,
						//breakLine: true,
		    			content : nirvana.aoWidgetRender.planinfo(14)
		    		},
		    		{
		    			field : 'unitname',
		    			title : '推广单元',
		    			width : 120,
						//breakLine: true,
		    			content : nirvana.aoWidgetRender.unitinfo(14)
		    		},
		    		{
		    			field : 'ideastatus',
		    			title : '状态',
		    			width : 100,
						//breakLine: true,
		    			content : me.getIdeaStatusHTML()
		    		},
		    		{
		    			field : 'clks',
		    			title : '点击',
		    			width : 50,
						//breakLine: true,
		    			align : 'right',
		    			content : function(item){
		    				return item.clks;
		    				var data = item.clks;
							if (data == '' || data == '-') {
								return data;
							}
							return parseNumber(data);
		    			}
		    		},
		    		{
		    			field : 'paysum',
		    			title : '消费',
		    			width : 50,
		    			align : 'right',
						//breakLine: true,
		    			content : function(item){
		    				var data = item.paysum;
							if (data == '' || data == '-') {
								return data;
							}
							return baidu.number.fixed(data);
		    			}
		    		}
		    	];
			if (!me.arg.refresh) { // 表头固定，只在第一次渲染时设置fields
				me.setContext("widgetTableFields", tableFields);
			}
			
			// 获取表格数据
			me.getTableData(callback);
		},
		
		WidgetTab : function(callback){
			var me = this,
				itemClass = [],
				tabIndex = +me.getContext('tabIndex');
			
			for (var i = 0, j = me.ActionIds.length; i < j; i++) {
				var item = me.ActionIds[i],
					data = nirvana.aoControl.cacheData[item],
					className = '';
				
				if ((!data || (data && (data.status == 4 || (data.status == 2 && data.hasProblem == 0)))) && tabIndex != i) { //对确定没问题，且当前没有被点的tab进行隐藏
					className = 'hide';
				}
				
				itemClass.push(className);
			}
			
			me.setContext('tabTitle', me.ActionTitles);
			me.setContext('itemClass', itemClass);
			
			callback();
		},
		
		// page渲染
		widgetPage : function(callback) {
			var me = this;			
			callback();
		}
	},
	
	onafterrender: function(){
		var me = this,
			controlMap = me._controlMap;

		//tab切换
		ui.util.get('WidgetTab').onselect = function(value){
			var old_value = me.getContext('tabIndex'),
				tabIndexToId = {
					0 : 15,
					1 : 16,
					2 : 17
				},
				logParam = {
					old_value : tabIndexToId[old_value],
					new_value : tabIndexToId[value]
				};
			
			me.logCenter('aowidget_tab', logParam);
			
			me.setContext('tabIndex', value);
			var stateMap = me.getClearStateMap();
			stateMap.tabIndex = me.getContext('tabIndex') || 0;
			//stateMap.itemId = me.ActionIds[me.getContext('tabIndex')];
			
			AoWidget_15.itemId.push(me.ActionIds[stateMap.tabIndex]);

			me.refreshSelf(stateMap);
		};
		
		// 绑定下载事件
		nirvana.aoWidgetRender.download(me);
		
		//Table内部操作绑定
		controlMap.WidgetTable.main.onclick = me.getTableInlineHandler();

		ui.util.get('WidgetTable').onselect = function(index){
			me.setContext('rowSelectedIndex', index.length == 0 ? null : index);
			ui.util.get('WidgetIdeaRun').disable(!me.getContext('rowSelectedIndex'));
			ui.util.get('WidgetIdeaActive').disable(!me.getContext('rowSelectedIndex'));
			ui.util.get('WidgetIdeaDelete').disable(!me.getContext('rowSelectedIndex'));
            

            // 读写分离，待升级之后不用这种方式了
            // by Leo Wang
            nirvana.acc.accService.processEntrances('ao/manual/' + me.VIEW);
		};
		
		controlMap.WidgetPage.onselect = me.getPageHandler();
		ui.util.get('WidgetIdeaActive').onclick = me.getMultiActiveHandler();
		ui.util.get('WidgetIdeaRun').onclick = me.getMultiRunHandler();
		ui.util.get('WidgetIdeaDelete').onclick = me.getMultiDeleteHandler();
	},
	
	onentercomplete: function(){
		var me = this,
			table = ui.util.get('WidgetTable'),
			controlMap = me._controlMap,
			i;
		ui.util.get('AoDetailClose').onclick = function() {
			me.onclose();
		};
		switch(me.getContext('tabIndex'))
		{
			case 0:
				baidu.hide(ui.util.get('WidgetIdeaRun').main);
				baidu.show(ui.util.get('WidgetIdeaActive').main);
				break;
			case 1:
				baidu.hide(ui.util.get('WidgetIdeaRun').main);
				baidu.hide(ui.util.get('WidgetIdeaActive').main);
				break;
			case 2:
				baidu.show(ui.util.get('WidgetIdeaRun').main);
				baidu.hide(ui.util.get('WidgetIdeaActive').main);
				break;
		}		
		ui.util.get('WidgetIdeaRun').disable(!me.getContext('rowSelectedIndex'));
		ui.util.get('WidgetIdeaActive').disable(!me.getContext('rowSelectedIndex'));
		ui.util.get('WidgetIdeaDelete').disable(!me.getContext('rowSelectedIndex'));
		
		// 表格重新计算，避免表头计算错误
		controlMap.WidgetTable.refreshView();
		
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},
	
	/**
	 * 获取表格数据
	 * @param {Object} callback
	 */
	getTableData : function(callback) {
		var me = this,
			params = nirvana.aoControl.params,
			tabIndex = +me.getContext('tabIndex'),
			startindex = (me.getContext('pageNo') - 1) * me.getContext('pageSize'),
			endindex = startindex + me.getContext('pageSize') - 1,
			func = me.FuncToCall[me.getContext('tabIndex')],
			param = {
				level: params.level,
				condition: params.condition,
				signature: '',
				startindex: startindex,
				endindex: endindex,
				
				onSuccess: function(response){
					var data = response.data,
						aostatus = data.aostatus,
						listData = data.listData;
					
					if (aostatus != 0) {
						switch (aostatus) {
							case 4: // 需要更详细的请求数据，不只是签名
								// 重新请求表格数据
								me.getTableData(callback);
								break;
							default:
								ajaxFailDialog(); // 相当于status 500
								break;
						}
						return;
					}
					
					me.setContext('widget_no', data.totalnum);
					me.setContext('WidgetDetailTip', ui.format(me.ActionDescriptions[tabIndex], me.getContext('widget_no')));
					
					me.setContext('widgetTableData', listData);
					
					// 计算总页数
					var totalPage = Math.ceil(data.totalnum / me.getContext('pageSize'));
					// 保持原有逻辑，最大为100页
					totalPage = Math.min(totalPage, nirvana.config.AO.MAX_PAGE);
					
					me.setContext('totalPage', totalPage);

					callback();
				},
				onFail: function(response){
					ajaxFailDialog();
					callback();
				}
			};
		
		func(param);
	},
	
	/**
     * 表格行内操作事件代理器
     */
    getTableInlineHandler: function() {
        var me = this;
        return function (e) {
            var event = e || window.event,
                target = event.target || event.srcElement,
				logParams = {},
				type;

            while(target  && target != ui.util.get("WidgetTable").main){
            	if(target.className && target.className == 'status_op_btn'){
                    var item = me.getLineData(target);
                    var actname = '启用',
                    	actionMode = 'start',
        				title = actname + '创意',
        				msg = '您确定要' + actname + '所选择的创意吗？';
                    item.actionMode = actionMode;
                    
                    me.logCenter('aowidget_resume_idea', {
            			planid : item.planid,
            			unitid : item.unitid,
            			ideaid : item.ideaid
            		});
                    
                    me.doInlineRunOrPause(item, target);
                    break;
                }
            	
            	if(baidu.dom.hasClass(target, 'edit_btn')){
                	type = target.getAttribute('edittype');
                	switch(type){
                		case 'ideaid':
                			me.getIdeaHandler('edit', target);
                			break;
                	}
                	break;
                }
            	
            	
                
				//小灯泡 by Tongyao
				if(baidu.dom.hasClass(target, 'status_icon')){
					logParams.target = "statusIcon_btn";
					manage.offlineReason.openSubAction({
						action : me,
						type : 'ideainfo',
						maskLevel : 2,
						params : target.getAttribute('data')
					});
					
					break;
				}
				
                target = target.parentNode;
            }
			if(logParams.target){
				NIRVANA_LOG.send(logParams);
			}
        };
    },
    
    /**
     * 执行行内启用或暂停创意操作 // 因为在本处没有暂停只有启用，所以做如下处理
	 * @param {Object} item 该行全部数据
	 * @param {Object} target 本函数的调用来源对象 批量的时候是没有这个参数的
     */
	doInlineRunOrPause : function(item, target) {
        var me = this,
            idArr, pauseStat,
            func = fbs.idea.modPausestat,
			logParams = {
				target: "inlineRunPause_btn"
			},
			type = 'single';
        
     // 因为在本处没有暂停只有启用，所以做如下处理
        pauseStat = (item.actionMode == 'start' ? 0 : 1);
        idArr = (item.ideaid instanceof Array ? item.ideaid : [item.ideaid]);
        if('undefined' != typeof target){
            //pauseStat = nirvana.manage.getPauseStat(target,[0,1]);
    		logParams.pauseStat = pauseStat;
    		NIRVANA_LOG.send(logParams);
            nirvana.manage.inserLoadingIcon(target);
        }
        else{
        	//pauseStat = item.pausestat;
        	type = 'multi';
        }
        func({
            ideaid: idArr,
            pausestat : pauseStat,
            onSuccess: me.operationSuccessHandler(type),
            onFail: me.operationFailHandler()
        });
    },
    
    /**
     * 执行多行元素的创意批量启用或暂停
	 * @param {Object} value 启用0 暂停1
	 * @param {Object} ids 要去操作的创意的id数组
     */
    doMultiRunOrPause : function(value, ids){
    	var me = this,
    		item = {};
    	item.ideaid = ids;
    	item.pausestat = (value == 'start' ? 0 : 1);
    	item.actionMode = value;
    	
    	//批量启用监控
		me.resumeLogParam.type = 1;
		me.logCenter('aowidget_batch_resume_idea', me.resumeLogParam);
    	
    	me.doInlineRunOrPause(item);
    },
    
    doMultiActiveIdea : function(ids){
    	var me = this;
    	
    	return function () {
            var func = fbs.idea.active,//需要调用的接口函数
                ideaid = ids,
                param = {
            		ideaid: ideaid, 
                    activestat : '0',
                    onSuccess: me.operationSuccessHandler('multi'), 
                    onFail: me.operationFailHandler()
                };
            
            func(param);
			
			me.activeLogParam.type = 1;
			me.logCenter('aowidget_batch_active_idea', me.activeLogParam);
        };
    },
    
    /**
     * 获取表格多个元素的批量创意激活处理函数
     * @returns {Function}
     */
    getMultiActiveHandler : function(){
    	var me = this;
    	
    	return function(){
    		var title = '激活创意',
				msg = '您确定要激活所选择的创意吗？',
				ids = me.getSelected('ideaid'),
    			i,
				logParam = {
					id : ids,
					count : ids.length,
					type : -2
				};
			
			me.logCenter('aowidget_batch_active_idea', logParam);
			me.activeLogParam = logParam;
			
			ui.Dialog.confirm({
				title: title,
				content: msg,
				onok: me.doMultiActiveIdea(ids),
				oncancel : function(){
					logParam.type = 0;
					me.logCenter('aowidget_batch_active_idea', logParam);
				}
			});
    	};
    },
    
    /**
     * 获取表格多个元素的批量创意启用处理函数
     * @returns {Function}
     */
    getMultiRunHandler : function(){
    	var me = this;
    	
    	return function(){
    		var title = '启用创意',
				msg = '您确定启用所选择的创意吗？',
				ids = me.getSelected('ideaid'),
				logParam = {
					id : ids,
					count : ids.length,
					type : -2
				};
			
			me.logCenter('aowidget_batch_resume_idea', logParam);
			me.resumeLogParam = logParam;
			
			ui.Dialog.confirm({
				title: title,
				content: msg,
				onok: function(){
					me.doMultiRunOrPause('start', ids);
				},
				oncancel : function(){
					logParam.type = 0;
					me.logCenter('aowidget_batch_resume_idea', logParam);
				}
			});
    	};
    },
    
    /**
     * 获取表格多个元素的批量删除处理函数
     * @returns {Function}
     */
    getMultiDeleteHandler : function(){
    	var me = this;
    	
    	return function(){
    		var title = '删除创意',
    			ids = me.getSelected('ideaid'),
    			msg = '您确定要删除所选择的' + ids.length + '个创意吗？删除操作不可恢复！',
				logParam = {
					id : ids,
					count : ids.length,
					type : -2
				};
			
			me.logCenter('aowidget_batch_del_idea', logParam);
			me.delLogParam = logParam;
			
    		ui.Dialog.confirm({
				title: title,
				content: msg,
				onok: function(){
					me.doMultiDelete(ids);
				},
				oncancel : function(){
					logParam.type = 0;
					me.logCenter('aowidget_batch_del_idea', logParam);
				}
			});
    	};
    },
    
    /**
     * 批量删除创意处理函数
     * @param ids
     */
    doMultiDelete : function(ids){
    	var me = this,
    		func = fbs.idea.del,
			param = {
				ideaid: ids, 
	            onSuccess: me.operationSuccessHandler('multi'),  // 删除创意必须清掉缓存，所以增加multi
	            onFail: me.operationFailHandler()
	        };
		
    	func(param);
		
		me.delLogParam.type = 1;
		me.logCenter('aowidget_batch_del_idea', me.delLogParam);
    },
    
    /**
	 * 
	 * 获取针对于创意的操作处理函数
	 * @param {String} type 操作类型, view, add, delete
	 * @param {Object} target 操作的来源目标，一般都在当前数据表格行内，这样getSubTableLineData才能找到
	 * @returns {Function}
	 */
	getIdeaHandler : function(type, target){
		var me = this,
			parent = target.parentNode,
			winfoid = parent.getAttribute("winfoid"), 
			item = me.getLineData(target), 
			param = {},
			table = ui.util.get('WidgetTable');
		
		switch(type){
			case 'edit':
				param.ideaid = item.ideaid;
				param.type = type;
				param.changeable = false;
				
				nirvana.aoWidgetAction.logCenter('aowidget_edit_idea', {
					opttype : me.getContext('opttype'),
					planid : item.planid,
					unitid : item.unitid,
					ideaid : item.ideaid
				});
				
				nirvana.aoWidgetAction.createSubActionForIdea(param, me);
				break;
			default:
				break;
		}
	},
	
	 /**
     * 默认创意成功回调 清创意的缓存并刷新子Action
     * @returns {Function}
     */
    operationSuccessHandler : function (type) {
        var me = this;
        return function (response) {
        	if('undefined' != typeof type && type == 'multi'){
        		//批量操作时直接清空idea的缓存
        		fbs.material.clearCache('ideainfo');
        	}
        	else{
    			var modifyData = response.data;
    			//单独操作时重新设置idea的缓存的某个元素
    			fbs.material.ModCache('ideainfo', "ideaid", modifyData);
        	}
			//刷新子Action
			var stateMap = me.getClearStateMap();
			me.refreshSelf(stateMap);
        };
    },
    /**
     * 默认失败回调 AJAX ALERT
     * @returns {Function}
     */
    operationFailHandler : function () {
        var me = this;
        return function (data) {
            ajaxFailDialog();            
        };
    },

	
	/**
	 * 根据编辑按钮对象获取当前行数据
	 * @param {Object} target
	 */
	getLineData: function(target){
		var isFind = false;
		while (target && target.tagName != "TR") {
			if(target.tagName == "TD"){
				isFind = true;
				break;
			}
			target = target.parentNode;
		}
		if(isFind){
			var index = target.getAttribute("row");
			return this.getContext('widgetTableData')[index];
		}
		return false;
	},
	
	/**
	 * 获取选中行的数据
	 * @param {Object} id planid等需要得到的数据
	 * @return {Array} ids [planid, planid……]
	 */
    getSelected : function (id) {
        var me = this,
            selectedList = me.getContext('rowSelectedIndex') || [],
            data = me.getContext('widgetTableData'),
            i, len, ids = [];
			
		if (baidu.lang.isArray(id)) {
			for (i = 0, len = selectedList.length; i < len; i++) {
				var dat = {};
				for (var j = 0, l = id.length; j < l; j++) {
					dat[id[j]] = data[selectedList[i]][id[j]];
				}
				ids.push(dat);
			}
		}
		else {
			if (id == "bid") {
				for (i = 0, len = selectedList.length; i < len; i++) {
					if (data[selectedList[i]][id]) {
						ids.push(data[selectedList[i]][id]);
					}
					else {
						ids.push(data[selectedList[i]]["unitbid"]);
					}
				}
			}
			else {
				for (i = 0, len = selectedList.length; i < len; i++) {
					ids.push(data[selectedList[i]][id]);
				}
			}
		}
        

        return ids;
    },
	
	/**
	 * 翻页
	 */
	getPageHandler : function() {
		var me = this;
		
		return function(value, prevOrNext) {
			var old_value = me.getContext('pageNo'),
				logParam = {
					opttype : me.getContext('opttype'),
					old_value : old_value,
					new_value : value,
					type : 'number'
				};
			
			if (prevOrNext) { // 上一页或下一页
				logParam.type = prevOrNext;
			}
			
			me.setContext('pageNo', value);
			me.setContext('rowSelectedIndex', []); //换页就清除之前的选择？
			
			//page页点击的监控
			nirvana.aoWidgetAction.logCenter('aowidget_page', logParam);
			
			me.refreshSelf(me.getStateMap());
            
            return false;
		};
	},
	
	/**
	 * 需要状态保持的变量
	 */
	getStateMap: function(){
		var me = this,
			stateMap = {
				tabIndex : me.getContext('tabIndex') || 0,
				pageNo : me.getContext('pageNo') || 1,
				rowSelectedIndex : me.getContext('rowSelectedIndex') || [],
				opttype : me.getContext('opttype') || me.ActionIds[tabIndex]
			};
		
		return stateMap;
	},
	
	/**
	 * 获取默认的全清刷新的stateMap，注意并没有清除掉tab的值
	 */
	getClearStateMap: function(){
		var me = this,
			stateMap = {
				tabIndex : me.getContext('tabIndex') || 0,
				pageNo : 1,
				rowSelectedIndex : [],
				opttype : me.getContext('opttype') || me.ActionIds[tabIndex]
			};
		
		return stateMap;
	},
	
	/**
	 * 表格最后的操作列 单元格的信息格式化函数
	 */
	tableColRender : {
		/**
		 * 创意显示
		 * @param item 当前行内容Object
		 * @param row 行
		 * @param col 列
		 * @returns
		 */
		ideainfo : function(item, row, col){
			var tmp = [],
	            className = 'idea noborder',
				html = [];
	        
	        //创意内容
	        var ideaData = [item.title, item.desc1, item.desc2, item.showurl];
	        tmp = IDEA_RENDER.idea(ideaData, className);
	        
	        var _bc = "";
	        if (item.shadow_title && item.shadow_title != "" && item.shadow_title != 'null') {
	            _bc = 'style="background:#ffdfd5"';
	        }
	        
	        
	        var href = item.url;
	        
	        if (tmp.join("").indexOf("<u>") != -1) {
	            tmp[0] = '<div class="' + className + '" ' + _bc + ' title="访问URL：&#13;&#10;' + escapeQuote(href) + '&#13;&#10; &#13;&#10;您的创意包含了通配符，创意在展现时，将以触发创意展现的关键词替代通配符。插入创意的关键词在推广页面中显示，将提高客户对创意的关注度和点击率。">';
	        } else {
	            tmp[0] = '<div class="' + className + '" ' + _bc + ' title="访问URL：&#13;&#10;' + escapeQuote(href) + '&#13;&#10; &#13;&#10;建议您在创意中包含通配符，通配符可以帮助您在创意中插入关键词。插入创意的关键词在推广页面中显示，将提高客户对创意的关注度和点击率。">';
	        }
	        
	        for (key in item){
	            item[key] = escapeHTML(unescapeHTML(item[key]));
	        }
	        
	        
	        if (item.shadow_title && item.shadow_title != "" && item.shadow_title != 'null') {
	            // 有修改创意
	            var modIdea = [],
	                href = item.shadow_url,
	                className = className + ' display_none';
	            var modifiedIdeaData = [item.shadow_title, item.shadow_desc1, item.shadow_desc2, item.shadow_showurl];    
	            modIdea = IDEA_RENDER.idea(modifiedIdeaData, className);
	            
	    
	            if (modIdea.join("").indexOf("<u>") != -1) {
	                modIdea[0] = '<div class="' + className + '" title="访问URL：&#13;&#10;' + escapeQuote(href) + '&#13;&#10; &#13;&#10;您的创意包含了通配符，创意在展现时，将以触发创意展现的关键词替代通配符。插入创意的关键词在推广页面中显示，将提高客户对创意的关注度和点击率。">';
	            } else {
	                modIdea[0] = '<div class="' + className + '" title="访问URL：&#13;&#10;' + escapeQuote(href) + '&#13;&#10; &#13;&#10;建议您在创意中包含通配符，通配符可以帮助您在创意中插入关键词。插入创意的关键词在推广页面中显示，将提高客户对创意的关注度和点击率。">';
	            }
	            tmp[tmp.length] = modIdea.join("");
	            tmp[tmp.length] = '<p style="text-align:right"><a href="javascript:void(0);" onclick="viewIdeaSwap(this, ' + item.ideaid + ', ' + item.shadow_ideaid + ');return false">查看修改后创意及状态</a></p>';
	    
	            
	        }
			
			html[html.length] = '<div class="edit_td">';
			html[html.length] = '<div class="idea_wrapper">' + tmp.join('') + '</div>';
			html[html.length] = '<a class="edit_btn" id="IdeaEdit_' + item.ideaid + '" edittype="ideaid" ideaid="' + item.ideaid + '"></a>';
	        html[html.length] = '</div>';
			
			return html.join('');
		}
	},
	
	/**
	 * 创意状态
	 * @param item 当前行内容Object
	 * @param row 行
	 * @param col 列
	 * @returns
	 */
	getIdeaStatusHTML : function(){
		var me = this;
		return function(item, row, col){
			var className, text, 
	            shadowClassName, 
	            shadowText, _bc = '', display="display:none;",
	            statusTextMap = {
	                '0' : '有效',
	                '1' : '暂停推广',
	                '2' : '不宜推广',
	                '4' : '待激活',
	                '5' : '审核中'  
	            }, html;
	        
			var currentType = me.getContext('tabIndex');
			
			
			switch(currentType){
				case 0: //待激活
					className = 'ideastatus_4';
					text = '待激活';
					break;
				case 1: //不宜推广
					className = 'ideastatus_2';
					text = '不宜推广';
					break;
				case 2: //暂停推广
					className = 'ideastatus_1 pausestat_1';
					text = '暂停推广';
					break;
					
			}
	        
	        if (item.shadow_title && item.shadow_title != "" && item.shadow_title != 'null') {
	            _bc = 'background-color:#ffdfd5';
	        
	            shadowClassName = 'ideastatus_' + item['shadow_ideastat'];
	            shadowText = statusTextMap[item['shadow_ideastat']];
	        }
	        
	        var tpl;
	        
	        if(currentType == 1){ //不宜推广时
	        	tpl = '<div id="StateCy_{2}" style="{3}" class="{0}"><span class="status_text" style="{4}"><span class="status_icon" data=\'{"ideaid":{2}}\'></span>{1} </span> <span class="status_op_btn"></span></div>';     
	        }
	        else{
	        	tpl = '<div id="StateCy_{2}" style="{3}" class="{0}"><span class="status_text" style="{4}">&nbsp;{1} </span> <span class="status_op_btn"></span></div>';
	        }
	        
	        	        
	        if (item.shadow_title && item.shadow_title != "" && item.shadow_title != 'null') {
	            html = ui.format(tpl, className, text, item.ideaid, '', _bc) + ui.format(tpl, shadowClassName, shadowText, item.shadow_ideaid, display, '');
	        }else{
	            html = ui.format(tpl, className, text, item.ideaid, '', _bc);
	        }
	        return html;
		};
	},
	/**
	 * 日志中心，for 特有的
	 * @param {String} actionName	//操作类别
	 * @param {Array} param			//参数，非必须
	 * 
	 * 快捷方式
	 * logCenter('aowidget_tab');                //切换tab
	 * logCenter('aowidget_batch_active_idea');  //批量激活
	 * logCenter('aowidget_batch_resume_idea');  //批量启用
	 * logCenter('aowidget_batch_del_idea');     //批量删除
	 * logCenter('aowidget_resume_idea');        //启用创意
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

