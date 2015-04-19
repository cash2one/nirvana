/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: accountOptimizer/all/widget/widget_20.js 
 * desc: 账户优化子项详情，页面无法连通
 * author: wanghuijun@baidu.com
 * date: $Date: 2011/07/20 $
 */

ao.widget20 = new er.Action({
    /**
     * 视图模板名，或返回视图模板名的函数
     */
    VIEW: 'widgetDetail20',
	
    /**
     * 工具箱里的子action不能保持状态，不能设置保持项
     */
    STATE_MAP: {},
    
    UI_PROP_MAP: {
		// 表格控件
		WidgetTable : {
			fields : '*widgetTableFields',
			datasource : '*widgetTableData',
			noDataHtml : FILL_HTML.NO_DATA
		},
		
		// 分页控件
		WidgetPage : {
			page : '*pageNo',
			total : '*totalPage'
		}
	},
	
    /**
     * 初始化context的函数集合，name/value型Object。其value为Function的map，value
     * Function被调用时this指针为Action本身。value
     * Function的形参需要有一个callback参数，参数为Function类型，手工回调。
     */
    CONTEXT_INITER_MAP: {
		// 子action没有状态保持，所以这里初始化一些参数
		init : function(callback) {
			var me = this,
				pageNo = me.getContext('pageNo') || me.arg.pageNo || 1;
			
			me.setContext('opttype', 20);
			me.setContext('pageNo', pageNo);
			me.setContext('pageSize', nirvana.config.AO.DETAIL_PAGESIZE);
			
			callback();
		},
		
		// table渲染
		widgetTable : function(callback) {
			var me = this,
				tabFields = [{
					content: nirvana.aoWidgetRender.planinfo(),
					title: '推广计划',
					breakLine: true,
					width: 250
				}, {
					content: nirvana.aoWidgetRender.unitinfo(),
					title: '推广单元',
					breakLine: true,
					width: 250
				}, {
					content: me.colRender.url,
					title: '以下推广页面无法连通',
					breakLine: true,
					width: 400
				}];
			
			me.setContext('widgetTableFields', tabFields);
			
			// 获取表格数据
			me.getTableData(callback);
		}
	},
    
    /**
     * 视图repaint的后会触发事件
     */
    onafterrepaint: function(){},
    
    /**
     * 第一次render后执行
     */
    onafterrender: function(){
		var me = this,
			controlMap = me._controlMap;
		
		// 绑定下载事件
		nirvana.aoWidgetRender.download(me);
		
		controlMap.WidgetPage.onselect = me.getPageHandler();
		
		controlMap.AoDetailClose.onclick = function(){
			me.onclose();
		};
    },
    
    /**
     * render和repaint都会执行
     */
    onentercomplete: function(){
		var me = this,
			controlMap = me._controlMap;
		
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
			endindex = startindex + me.getContext('pageSize') - 1;
		
		fbs.ao.getDisconnectrate({
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
		});
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
				pageNo : me.getContext('pageNo') || 1
			};
		
		return stateMap;
	},
	
    /**
     * 子项独立的渲染函数集合
     */
	colRender : {
        /**
         * 输出无法连通的url
         * @param {Object} item
         */
		url : function(item){
			var url = item.disconnecturl,
				urlLength = 55,
				urlShort = getCutString(baidu.encodeHTML(url), urlLength, '..'),
				html = '<a href="' + url + '" target="_blank" title="' + url + '">' + urlShort + '</a>';
			
			return html;
		}
	}
});