/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: accountOptimizer/all/widget/widget_4.js 
 * desc: 左侧首屏出价详情
 * author: wangdalu@baidu.com
 * date: $Date: 2011/07/24 $
 */

ao.widget4 = new er.Action({
    /**
     * 视图模板名，或返回视图模板名的函数
     */
    VIEW: 'widgetDetail4',
	
    /**
     * 工具箱里的子action不能保持状态，不能设置保持项
     */
    STATE_MAP: {},
    
    UI_PROP_MAP: {
		// 表格控件
		WidgetTable : {
			select : 'multi',
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
				pageNo = me.arg.pageNo || 1;
			
			me.setContext('opttype', 4);
			me.setContext('pageNo', pageNo);
			me.setContext('pageSize', nirvana.config.AO.DETAIL_PAGESIZE);
			
			callback();
		},
		
		// table渲染
		widgetTable : function(callback) {
			var me = this,
				tabFields = [{
		       		content: nirvana.aoWidgetRender.wordinfo(),
					title: '关键词',
					width: 250
				}, {
					content: nirvana.aoWidgetRender.planinfo(),
					title: '推广计划',
					breakLine: true,
					width: 250
				}, {
					content: nirvana.aoWidgetRender.unitinfo(),
					title: '推广单元',
					breakLine: true,
					width: 250
				},{
					content:  me.colRender.clks,
					title: '点击',
					width: 100,
					align: 'right'
				}, {
					content:  me.colRender.paysum,
					title: '消费',
					width: 100,
					align: 'right'
				}, {
					content: me.colRender.bid,
					title: '出价',
					width: 100,
					align: 'right'
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
			controlMap = me._controlMap,
			opttype = me.getContext('opttype');
		
		// 绑定下载事件
		nirvana.aoWidgetRender.download(me);
		
		//行内编辑
		controlMap.WidgetTable.main.onclick = me.getTableInlineHandler();
		
		//按钮的操作
		controlMap.modifyBid.disable(true);		
		controlMap.modifyBid.onclick = function(){
			return nirvana.aoWidgetAction.modBidClickHandler(me, me.getSelected('winfoid'), me.getSelected('bid'), me.getSelected('showword'));
		};
		//给表格选择注册事件(主要用于激活按钮状态)
		controlMap.WidgetTable.onselect = me.buttonEnableHandler();
		
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
			widgetTip = '以下关键词因出价过低而无法在左侧前三位展现。本次优化建议的完成时间为%n。系统会根据真实展现情况判断您的推广是否能稳定展现在左侧前三位，为了保证判断结果的准确性，下次分析需要约30分钟积累线上数据，请您稍后查看。',
			params = nirvana.aoControl.params,
			startindex = (me.getContext('pageNo') - 1) * me.getContext('pageSize'),
			endindex = startindex + me.getContext('pageSize') - 1;
		
		fbs.ao.getBidStim({
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
				
				widgetTip = widgetTip.replace(/%n/, baidu.date.format(new Date(data.timestamp), 'HH:mm'));
				
				me.setContext('widget_tip', widgetTip);
				
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
	 * 控制按钮的状态
	 */
	buttonEnableHandler : function () {
        var me = this,
            controlMap = me._controlMap; 
			
        return function (selected) {
            var enabled = selected.length > 0,
				modifyBid = controlMap.modifyBid;
			
			me.selectedList = selected;
			modifyBid.disable(!enabled);
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
				logParams = {}, type;

            while(target  && target != ui.util.get('WidgetTable').main){
				if(baidu.dom.hasClass(target,'edit_btn')){
					var current = nirvana.inline.currentLayer;
					
					if (current && current.parentNode) {
						current.parentNode.removeChild(current);
					}
					type = target.getAttribute('edittype');
					switch(type){
						case 'bid':
							nirvana.aoWidgetAction.inlineBid(me, target, me.getLineData(target));
							logParams.target = 'editInlineBid_btn';
							break;
					}
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
	 * 根据编辑按钮对象获取当前行数据(不知道这里面是否需要考虑页数)
	 * @param {Object} target
	 */
	getLineData: function(target){
		var isFind = false;
		
		while (target && target.tagName != 'TR') {
			if(target.tagName == 'TD'){
				isFind = true;
				break;
			}
			target = target.parentNode;
		}
		if(isFind){
			var index = target.getAttribute('row');
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
            selectedList = me.selectedList,
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
			if (id == 'bid') {
				for (i = 0, len = selectedList.length; i < len; i++) {
					if (data[selectedList[i]][id]) {
						ids.push(data[selectedList[i]][id]);
					}
					else {
						ids.push(data[selectedList[i]]['unitbid']);
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
				html = '<span title="' + url + '">' + urlShort + '</span>';
			
			return html;
		},
		
	    /**
	     * 点击
	     * @param {Object} item
	     */
	    clks : function(item){
			var data = item.clks;
			
			if (data == '' || data == '-') {
				return data;
			}
			return parseNumber(data);
		},
		
	    /**
	     * 出价
	     * @param {Object} item
	     */
	    bid :  function(item){
			var bid = item.bid,
				html = [];
								
			html[html.length] = '<div class="edit_td" winfoid=' + item.winfoid + ' unitid=' + item.unitid + ' planid=' + item.planid + '>';
			if (bid) {
				html[html.length] = '<span class="word_bid">' + baidu.number.fixed(bid) + '</span>';
			} else {
				html[html.length] = '<span title="使用单元出价">' + baidu.number.fixed(item.unitbid) + '</span>';
			}
			html[html.length] = '<a class="edit_btn edit_btn_left" edittype="bid"></a>';
			html[html.length] = '</div>';
			return html.join('');
		},
		
		/**
		 * 花费
		 * @param {Object} item
		 */
		paysum : function(item){
			var data = item.paysum;
			
			if (data == '' || data == '-') {
				return data;
			}
			return baidu.number.fixed(data);
		}	
	}
});