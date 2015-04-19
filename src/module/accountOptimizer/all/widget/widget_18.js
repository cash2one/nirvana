/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: accountOptimizer/all/widget/widget_18.js 
 * desc: 账户优化子项详情，关键词因质量度过低无法获取稳定的左侧首屏或首位展现资格
 * author: LeoWang(wangkemiao@baidu.com)
 * date: $Date: 2011/08/02 $
 */


ao.widget18 = new er.Action({
	VIEW: 'widgetDetail18',
	
	ActionIds : [18, 19],  //对应着位置0 和 1
	ActionTitles : [
    	'左侧首屏展现概率提示',
    	'左侧第一位展现概率提示'
    ],
    ActionDescriptions : [
        '根据历史数据分析，以下关键词由于出价过低在左侧首屏展现的占比较小，为了改善您的推广效果，建议您修改出价！',
        '根据历史数据分析，以下关键词由于出价过低在左侧第一位展现的占比较小，为了改善您的推广效果，建议您修改出价！'
    ],
    FuncToCall : [
        fbs.ao.leftScreenDetail,
        fbs.ao.leftTopDetail
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
			me.setContext('pageSize', 10);
			
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
			me.setContext('WidgetDetailTip', me.ActionDescriptions[tabIndex]);
			
			callback();
		},
		
		WidgetTable : function(callback){
			var me = this,
				tableFields = [
		       		{
		    			field : 'showword',
		    			title : '关键词',
		    			width : 180,
						//breakLine: true,
		    			//align : "center",
		    			content : nirvana.aoWidgetRender.wordinfo()
		    		},
		    		{
		    			field : 'planname',
		    			title : '推广计划',
		    			width : 185,
						//breakLine: true,
		    			content : nirvana.aoWidgetRender.planinfo()
		    		},
		    		{
		    			field : 'unitname',
		    			title : '推广单元',
		    			width : 185,
						//breakLine: true,
		    			content : nirvana.aoWidgetRender.unitinfo()
		    		},
		    		{
		    			field : 'history',
		    			title : '历史展现概率',
		    			width : 100,
						//breakLine: true,
		    			content : me.tableColRender.history
		    		},
		    		{
		    			field : 'offer',
		    			title : '出价',
		    			width : 100,
		    			align : "right",
						//breakLine: true,
		    			content : me.tableColRender.offer
		    		}
		    	];
			if (!me.arg.refresh) { // 表头固定，只在第一次渲染时设置fields
				me.setContext("widgetTableFields", tableFields);
			}
			
			// 获取表格数据
			me.getTableData(callback);
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
			me.setContext('tabIndex', value);
			var stateMap = me.getClearStateMap();
			stateMap.tabIndex = me.getContext('tabIndex') || 0;

			AoWidget_18.itemId.push(me.ActionIds[stateMap.tabIndex]);
			//stateMap.itemId = me.ActionIds[me.getContext('tabIndex')];

			//设置一下 子Action的Title
			ui.util.get('Widget' + me.arg.itemId).setTitle(me.ActionTitles[stateMap.tabIndex]);
			me.refreshSelf(stateMap);
		};
		
		// 绑定下载事件
		nirvana.aoWidgetRender.download(me);
		
		//行内编辑
		controlMap.WidgetTable.main.onclick = me.getTableInlineHandler();
		
		ui.util.get('WidgetTable').onselect = function(index){
			me.setContext('rowSelectedIndex', index.length == 0 ? null : index);
			ui.util.get('WidgetDetailModify').disable(!me.getContext('rowSelectedIndex'));
		};
		
		controlMap.WidgetPage.onselect = me.getPageHandler();
		
		//附加绑定 查看历史之类的
		baidu.on('HistoryFlashClose', 'onclick', function(){
			baidu.dom.setStyle('HistoryFlash', 'display', 'none');
			baidu.g('HistoryFlashDetail').innerHTML = '';
		});
	},
	
	onentercomplete: function(){
		var me = this,
			table = ui.util.get('WidgetTable'),
			controlMap = me._controlMap,
			i;
		ui.util.get('AoDetailClose').onclick = function() {
			me.onclose();
		};
		
		ui.util.get('WidgetDetailModify').disable(!me.getContext('rowSelectedIndex'));
		ui.util.get('WidgetDetailModify').onclick = me.getWordPriceMultiModifyHandler();
		
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
			startindex = (me.getContext('pageNo') - 1) * me.getContext('pageSize'),
			endindex = startindex + me.getContext('pageSize') - 1,
			func = me.FuncToCall[me.getContext('tabIndex')],
			param = {
				level : params.level,
				condition : params.condition,
				signature : '',
				startindex : startindex,
				endindex : endindex,
				
				onSuccess : function(response) {
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
					
					me.setContext('widgetTableData', listData);
										
					// 计算总页数
					var totalPage = Math.ceil(data.totalnum / me.getContext('pageSize'));
					// 保持原有逻辑，最大为100页
					totalPage = Math.min(totalPage, nirvana.config.AO.MAX_PAGE);
					
					me.setContext('totalPage', totalPage);
					
					callback();
				},
				onFail : function(response) {
					ajaxFailDialog();
					callback();
				}
			};
		
		func(param);
	},
	
	getWordPriceMultiModifyHandler : function(){
		var me = this;
		
		return function(){
			var bid = me.getSelected('bid'),
				winfoid = me.getSelected('winfoid'),
				showword = me.getSelected('showword');
						
			nirvana.aoWidgetAction.modBidClickHandler(me, winfoid, bid, showword);			
		};
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
                if(baidu.dom.hasClass(target,"edit_btn")){
					var current = nirvana.inline.currentLayer,
						item = me.getLineData(target);
					
					if (current && current.parentNode) {
						current.parentNode.removeChild(current);
					}
					type = target.getAttribute("edittype");
					switch(type){
						case "bid":
							//me.inlineBid(target);
							nirvana.aoWidgetAction.inlineBid(me, target, item);
							break;
					}
					break;
				}
				
                if(baidu.dom.hasClass(target, 'action_btn')){
                	type = target.getAttribute('actiontype');
                	switch(type){
                		case "historyflash":
                			me.showHistoryFlash(target);
                			break;
                	}
                	break;
                }
                
				target = target.parentNode;
            }
        };
    },
    	

    /**
	 * 显示历史趋势flash
	 * @param {Object} target
	 */
	showHistoryFlash : function(target){
		var me = this,
			parent = target.parentNode, 
			winfoid = parent.getAttribute("winfoid"), 
			item = me.getLineData(target),
			div = baidu.g('HistoryFlash'),
			detail = baidu.g('HistoryFlashDetail'),
			title = baidu.g('HistoryFlashTitle'),
			pos = baidu.dom.getPosition(target),
			posC = baidu.g('ctrldialogWidget18') ? baidu.dom.getPosition('ctrldialogWidget18') : baidu.dom.getPosition('ctrldialogWidget19'),
			limit = nirvana.config.AO.DETAIL_MAX_LENGTH;
		
		var data = item.lefthistory,
		    str = [], tempitem, tdate, td, tv;
				
		str[str.length] = "<?xml version='1.0' encoding='utf-8'?>";				
		str[str.length] = "<data tag='" + getCutString(item.showword, limit, '..') + "的展现概率/'>";
		
		for(var i = 0; data && i < data.length; i++){
			tempitem = data[i];
			td = tempitem.date + ''; // 保证为字符串
			tv = tempitem.value;
			tdate = td.substring(0, 4) + '-' + td.substring(4, 6) + '-' + td.substring(6);
			str[str.length] = "<record xAxisTag='" + tdate;
			str[str.length] = "' data='" + tv + "%'/>";
		}	
		str[str.length] = "</data>";
		var flashopts = {
			id : 'ProHistoryFlash',
			url : 'asset/swf/probability_history.swf',
			width : 385,
			height : 130,
			//wmode : 'opaque',
		    wmode : "transparent",      
		    errorMessage:"载入FLASH出错",      
		    ver:"9.0.0",      
		    allowscriptaccess:"always" 
		};
		
		//baidu.swf.create(flashopts, "detail");
				
		
		title.innerHTML = (me.getContext('tabIndex') == 0 ? '左侧首屏' : '左侧首位') +"展现概率历史趋势";
		
		
		if(data == null){
			detail.innerHTML = '<div style="text-align:center; font-size:14px; font-weight:700; margin:30px 0 40px 0;">暂无数据！</div>';
		}
		else{
			detail.innerHTML = baidu.swf.createHTML(flashopts);
			me.invokeFlash('ProHistoryFlash', 'getData', [str.join('')]);
		}
		
		baidu.dom.setStyles(div, {
	        left : pos.left - posC.left - (parseFloat(baidu.dom.getStyle(div, 'width')) || 0) - (parseFloat(baidu.dom.getStyle(div, "margin-left")) || 0),
	        top : pos.top - posC.top - (parseFloat(baidu.dom.getStyle(div, "margin-top")) || 0),
			display : 'block'
	    });
		
		//监控
		me.logCenter('aowidget_view_flashhistory', {
			planid : item.planid,
			unitid : item.unitid,
			winfoid : item.winfoid
		});   
		//ended
	},
		
		

	/**
	 * 调用Flash方法
	 * @param {Object} flashId FlashID
	 * @param {Object} flashFun Flash方法
	 * @param {Object} funParam 方法所用参数数组，空参时传undefined，仅当callback为空时可为空
	 * @param {Object} callback 回调函数，可为空
	 * 为啥不用util.js下的invokeFlash？？克淼看看，如果可以下次删掉  by linzhifeng@baidu.com
	 */
	invokeFlash : function (flashId, flashFun, funParam, callback, pollingTime){
	    if (+UEManager.flashVersion <= 1){  //不支持flash
            if (typeof callback == 'function'){
                callback(false);            
            }
            return false;
        }
		var me = this,
			res,
		    fl = baidu.swf.getMovie(flashId);
			//fl = document[flashId] || window[flashId]
		if (typeof fl != 'undefined'){
			var func = baidu.swf.getMovie(flashId)[flashFun];
			if (typeof func == 'function'){
				if (typeof funParam == 'undefined'){
					funParam = [];
				}
				if (typeof callback == 'function'){
					res = func.apply(fl,funParam);
					callback(res);
					
				}else{
					res = func.apply(fl,funParam);
					
				}
				return res;			
			}
		}

		if (typeof pollingTime != 'undefined'){
			pollingTime += 1;
		}else{
			pollingTime = 1;
		}
		
		if (pollingTime < 30){
			setTimeout(function(){
				return function(){
					me.invokeFlash(flashId, flashFun, funParam, callback, pollingTime);
				};		
			}(flashId, flashFun, funParam, callback, pollingTime), 500);
			return 'polling';
		}else{
			if (typeof callback == 'function'){
				callback(false);			
			}	
			return false;
		}    
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
	 * 获取默认的全清刷新的stateMap
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
		 * 输出出价列的内容
		 * @param item 当前行内容Object
		 * @param row 行
		 * @param col 列
		 * @returns
		 */
		offer : function(item, row, col){
			var bid = item.bid,
				html = [];
			html[html.length] = '<div class="edit_td" winfoid=' + item.winfoid + '>';
			if (bid) {
				html[html.length] = '<span class="word_bid">' + baidu.number.fixed(bid) + '</span>';
			} else {
				html[html.length] = '<span title="使用单元出价">' + baidu.number.fixed(item.unitbid) + '</span>';
			}
			html[html.length] = '<a class="edit_btn edit_btn_left" edittype="bid"></a>';
			html[html.length] = '</div>';
			return html.join("");
		},
		/**
		 * 输出历史展现概率列的内容
		 * @param item 当前行内容Object
		 * @param row 行
		 * @param col 列
		 * @returns
		 */
		history : function(item, row, col){
			var history = item.lefthistory,
				data = item['leftscreen'] || item['lefttop'],
				html = [];
			
			html.push('<div  winfoid=' + item.winfoid + '>');
			html.push('    <span>' +nirvana.aoWidgetRender.probabilityFormat(data) + '</span>');
			html.push('    <a class="action_btn" actiontype="historyflash" href="javascript:void 0;">历史趋势</a>');
			html.push('</div>');
			return html.join('');
		}
	},
	
	/**
	 * 日志中心，for 特有的
	 * @param {String} actionName	//操作类别
	 * @param {Array} param			//参数，非必须
	 * 
	 * 快捷方式
	 * logCenter('aowidget_view_flashhistory');
	 */
	logCenter : function(actionName, param){
		var me = this,
			logParam = {
			target : actionName,
			opttype : me.getContext('opttype')
		};
		
		baidu.extend(logParam, param);
		
		nirvana.aoControl.sendLog(logParam, nirvana.aoControl.snapShot);
	}
	
});

ao.option18 = new er.Action({
	VIEW: 'widgetOption18',
	/**
     * 工具箱里的子action不能保持状态，不能设置保持项
     */
    
	uiValues : [0, 20, 40, 60, 80],
	
	STATE_MAP: {},
	
	UI_PROP_MAP : {
	},
	
	CONTEXT_INITER_MAP: {
		init : function(callback){
			var me = this,
				func = fbs.ao.getThresholdValue;
			func({
				onSuccess : function(res){
					var data = res.data,
						screen = data[0],
						top = data[1],
						screenPos = baidu.array.indexOf(me.uiValues, screen) || 1,
						topPos = baidu.array.indexOf(me.uiValues, top) || 1;
					
					me.setContext('screenPos', screenPos);
					me.setContext('topPos', topPos);
					

					var tip = '您可以对不同展现区域设定展现概率提示的阈值，即只有当关键词在该区域低于这个阈值的时候系统才提示您，当您设定后<strong>全账户的关键词</strong>都将受到阈值的影响。';
					me.setContext('WidgetDetailTip', tip);
					
					callback();
					
				},
				onFail : function(res){
					ajaxFailDialog();
					me.onclose();
				}
			});
			
		}
	},
	
	onafterrender: function(){
		var me = this,
			screenPos = me.getContext('screenPos'),
			topPos = me.getContext('topPos');
		
		ui.util.get('screen' + screenPos).setChecked(true);
		ui.util.get('top' + topPos).setChecked(true);
		
		ui.util.get('AoDetailSave').onclick = function(){
			var screenValue = ui.util.get('screen1').getGroup().getValue(), 
				topValue = ui.util.get('top1').getGroup().getValue(),
				param = {
					leftscreen : screenValue,
					lefttop : topValue,
					onSuccess : function(res){
						if(res.status == 200){
							ui.Dialog.alert({
								title: '通知',
								content: '保存成功！'
							});
						}
						else{
							ajaxFailDialog();
						}
						me.onclose();
					},
					onFail : function(res){
						ajaxFailDialog();
						me.onclose();
					}
				};
			var func = fbs.ao.modThresholdValue;
			func(param);
		};
		
		ui.util.get('AoDetailClose').onclick = function(){
			me.onclose();
		};
		
	},
	
	onentercomplete : function(){
		var me = this;
	}
});