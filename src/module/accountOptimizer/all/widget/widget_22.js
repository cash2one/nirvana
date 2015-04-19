/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: accountOptimizer/all/widget/widget_22.js 
 * desc: 跳出率
 * author: wangdalu@baidu.com
 * date: $Date: 2011/07/27 $
 */

ao.widget22 = new er.Action({
    /**
     * 视图模板名，或返回视图模板名的函数
     */
    VIEW: 'widgetDetail22',
	
    /**
     * 工具箱里的子action不能保持状态，不能设置保持项
     */
    STATE_MAP: {},
    
    UI_PROP_MAP: {
		
		/**
    	* 跳出率Tab属性
   	 	*/
		WidgetTab: {
			title: '*tabTitle',
			tab: '*tabIndex'
		},		
		
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
				pageNo = me.arg.pageNo || 1;
							
			me.setContext('opttype', 22);
			me.setContext('pageNo', pageNo);
			
			callback();
		},
		
		/**
    	* 跳出率Tab
    	*/
		bounceRateTab: function(callback){
			var me = this,
				itemId = me.arg.itemId,
				title = [],
				item,
				tabIndex,
				/**
	    		* 跳出率Tab标题
	    		*/
				tabTitle = {
					0 : '关键词',
					1 : '创意'
				};	
				
			for(item in tabTitle){
      	 		title.push(tabTitle[item]);
     		}	
			//不需要考虑0的情况，因为就2个tab			
			if ( me.arg.tabIndex ) {
				tabIndex = me.arg.tabIndex;
			} else {				
				tabIndex = 0;
			}
			
			switch(tabIndex){
				case 0: // 关键词
					me.setContext('pageSize', nirvana.config.AO.DETAIL_PAGESIZE);
					// bounceratetype，用于下载，跳出率状态，0代表创意，1代表关键词
					me.setContext('bounceratetype', 1);
					AoWidget_22.bounceratetype = 1;
					break;
				case 1: // 创意
					me.setContext('pageSize', 5);
					me.setContext('bounceratetype', 0);
					AoWidget_22.bounceratetype = 0;
			}
			me.setContext('tabTitle', title);
			me.setContext('tabIndex', tabIndex);

			callback();
		},
				
		// table渲染
		widgetTable : function(callback) {
			var me = this,
				allData = {
					idea : {
						content: me.colRender.idea,
						title: '创意',
						width: 450						
					},
					showword: {
						content: nirvana.aoWidgetRender.wordinfo(),
						title: '关键词',
						width: 300
					},
					planinfo: {
						content: nirvana.aoWidgetRender.planinfo(),
						title: '推广计划',
						width: 300
					},
					unitinfo: {
						content: nirvana.aoWidgetRender.unitinfo(),
						title: '推广单元',
						width: 300
					},
					bouncerate: {
						content: me.colRender.bouncerate,
						title: '跳出率',
						width: 100,
						align: 'right'
					}					
				},
				tabToFields = {
					0 : [
						'showword',
						'planinfo',
						'unitinfo',	
						'bouncerate'
					], 
					1 : [
						'idea',
						'planinfo',
						'unitinfo',
						'bouncerate'
					]
				},
				i,
				len,
				tableFields = [],
				tabIndex = me.getContext('tabIndex'),
				localList = tabToFields[tabIndex];
			
			//刚列好fields
			for (i = 0, len = localList.length; i < len; i++){
				tableFields.push(allData[localList[i]]);
			}
					
			me.setContext('widgetTableFields', tableFields);
			
			me.updateTableContent(tabIndex, callback);
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
			opttype = me.getContext('opttype'),
			controlMap = me._controlMap;
		
		// 绑定下载事件
		nirvana.aoWidgetRender.download(me);
		
		controlMap.WidgetPage.onselect = me.getPageHandler();
		
		//tab的选择操作
		controlMap.WidgetTab.onselect = me.getTabHandler();
		
		//表格行内事件处理
		controlMap.WidgetTable.main.onclick = me.getTableInlineHandler();
		
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
	* 层级TAB切换动作
	*/
	getTabHandler : function () {
	    var me = this;
		
	    return function (tabIndex) {
			me.setContext('tabIndex', tabIndex);		   		   
			me.setContext('pageNo', 1);
			
			me.logCenter('aowidget_tab', {
				new_value : tabIndex
			});
			
			me.refreshSelf(me.getStateMap());
	    };
	},

	/**
     * 表格行内操作事件代理器
     * 主要对某些操作按钮或者链接按钮执行响应函数的绑定
     */
    getTableInlineHandler: function() {
        var me = this;
			
        return function (e) {
            var event = e || window.event,
                target = event.target || event.srcElement,
				logParams = {},
				index = me.getLineData(target, true),
				item = me.getContext('widgetTableData')[index], 
				type,
				param = {};

            while(target  && target != ui.util.get('WidgetTable').main){               
				if(baidu.dom.hasClass(target, 'edit_btn')){
					type = target.getAttribute('edittype');
					switch(type){
						case 'ideaid':
							logParams.target = 'editInlineIdea_btn';
							param.ideaid = item.ideaid;
							param.type = 'edit';
							param.changeable = false;
							
							nirvana.aoWidgetAction.logCenter('aowidget_edit_idea', {
								opttype: me.getContext('opttype'),
								planid: item.planid,
								unitid: item.unitid,
								ideaid: item.ideaid
							});
							
							nirvana.aoWidgetAction.createSubActionForIdea(param, me);
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
	 * 根据编辑按钮对象获取当前行数据，原理是向上找到td元素，获取其row属性，然后去得到该行的值
	 * @param {Object} target
	 * @param {Boolean} getIndex 是否返回index 可选
	 */
	getLineData: function(target, getIndex){
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
			if('undefined' == typeof getIndex || !getIndex){
				return this.getContext('widgetTableData')[index];
			}
			else{
				return index;
			}
		}
		return false;
	},

	/**
	 * 根据点击的TAB进行表格的更新渲染，包括表格上方的tip
	 */
	updateTableContent : function(tabIndex, callback){
		var me = this,
			params = nirvana.aoControl.params,
			startindex = (me.getContext('pageNo') - 1) * me.getContext('pageSize'),
			endindex = startindex + me.getContext('pageSize')-1;	
					
		switch (tabIndex) {
			case 0:
				fbs.ao.getWordBounce( me.requestTpl(params, startindex, endindex, 0, callback) );
				break;
			case 1 :
				fbs.ao.getIdeaBounce( me.requestTpl(params, startindex, endindex, 1, callback) );				
				break;
			default :
				break;				
		}
	},

	/**
	 * 请求模板
	 * @param {Object} id
	 */
	requestTpl : function(params, startIndex, endIndex, tabIndex, callback){
		var me = this,
			tipMessage = '跳出率指只浏览了一个页面便离开了网站的访问次数占总的访问次数的百分比。跳出率较高说明较多访客在到达您的推广页面后，没有继续浏览其他网页就离开了您的网站，说明您的推广页面内容可能和创意不相符或者吸引力不足。您也可以进一步通过百度统计的<a href="http://tongji.baidu.com/hm-web/3/home/welcome" target="_blank">创意/关键词跳出率报告</a>查看创意和关键词的跳出率数据。';
		
		return {
			level : params.level,
			condition : params.condition,
			signature : '',
			startindex : startIndex,
			endindex : endIndex,
				
			onSuccess : function(response) {
				var data = response.data,
					aostatus = data.aostatus,
					listData = data.listData;
					
				if (aostatus != 0) {
					switch (aostatus) {
						case 4: // 需要更详细的请求数据，不只是签名
							// 重新请求表格数据
							me.updateTableContent(tabIndex, callback);
							break;
						default:
							ajaxFailDialog(); // 相当于status 500
							break;
						}
						return;
				}
				
				me.setContext('widget_tip', tipMessage);
				
				me.setContext('widget_no', data.totalnum);
					
				me.setContext('widgetTableData', listData);
					
				// 计算总页数
				var totalPage = Math.ceil(data.totalnum / me.getContext('pageSize'));
				// 保持原有逻辑，最大为100页
				totalPage = Math.min(totalPage, nirvana.config.AO.MAX_PAGE);
					
				me.setContext('totalPage', totalPage);
				me.setContext('pageNo', me.getContext('pageNo'));
				
				callback();			
			},
			onFail : function(response) {
				ajaxFailDialog();
				callback();
			}
		};
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
					type : 'number',
					bounceratetype : me.getContext('bounceratetype')
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
				tabIndex : me.getContext('tabIndex'),
				pageNo : me.getContext('pageNo') || 1
			};
		
		return stateMap;
	},
	
	/**
	 * 获取默认的全清刷新的stateMap
	 */
	getClearStateMap: function(){
		var me = this,
			stateMap = {
				pageNo : 1
			};
		
		return stateMap;
	},	
	
    /**
     * 子项独立的渲染函数集合
     */
	colRender : {
	    /**
	     * 创意列
	     * @param {Object} item
	     */
	    idea : function (item) {
					var tmp = [],
					className = 'idea noborder',
				   	html = [];
		                    
		            //创意内容
		            var ideaData = [item.title, item.desc1, item.desc2, item.showurl];
		            tmp = IDEA_RENDER.idea(ideaData, className);
		                    
		            var _bc = '';
					
		            if (item.shadow_title && item.shadow_title != '' && item.shadow_title != 'null') {
		            	_bc = 'style="background:#ffdfd5"';
		            }		                    
		                    
		            var href = item.url;
		                    
		            if (tmp.join('').indexOf('<u>') != -1) {
		            	tmp[0] = '<div class="' + className + '" ' + _bc + ' title="访问URL：&#13;&#10;' + escapeQuote(href) + '&#13;&#10; &#13;&#10;您的创意包含了通配符，创意在展现时，将以触发创意展现的关键词替代通配符。插入创意的关键词在推广页面中显示，将提高客户对创意的关注度和点击率。">';
		            } else {
		            	tmp[0] = '<div class="' + className + '" ' + _bc + ' title="访问URL：&#13;&#10;' + escapeQuote(href) + '&#13;&#10; &#13;&#10;建议您在创意中包含通配符，通配符可以帮助您在创意中插入关键词。插入创意的关键词在推广页面中显示，将提高客户对创意的关注度和点击率。">';
		            }		                    
		            for (key in item){
		            	item[key] = escapeHTML(unescapeHTML(item[key]));
		            }		                    	                    
		            if (item.shadow_title && item.shadow_title != '' && item.shadow_title != 'null') {
		            	// 有修改创意
		            	var modIdea = [],
		            		href = item.shadow_url,
		                    className = className + ' display_none';
		                var modifiedIdeaData = [item.shadow_title, item.shadow_desc1, item.shadow_desc2, item.shadow_showurl];    
						
						modIdea = IDEA_RENDER.idea(modifiedIdeaData, className);		                        		                
		                if (modIdea.join('').indexOf('<u>') != -1) {
		                	modIdea[0] = '<div class="' + className + '" title="访问URL：&#13;&#10;' + escapeQuote(href) + '&#13;&#10; &#13;&#10;您的创意包含了通配符，创意在展现时，将以触发创意展现的关键词替代通配符。插入创意的关键词在推广页面中显示，将提高客户对创意的关注度和点击率。">';
		                } else {
		                	modIdea[0] = '<div class="' + className + '" title="访问URL：&#13;&#10;' + escapeQuote(href) + '&#13;&#10; &#13;&#10;建议您在创意中包含通配符，通配符可以帮助您在创意中插入关键词。插入创意的关键词在推广页面中显示，将提高客户对创意的关注度和点击率。">';
		                }
		                tmp[tmp.length] = modIdea.join("");
		                tmp[tmp.length] = '<p style="text-align:right"><a href="javascript:void(0);" onclick="widget22viewIdeaSwap(this, ' + item.ideaid + ', ' + item.shadow_ideaid + ');return false">查看修改后创意及状态</a></p>';
					}
							
					html[html.length] = '<div class="edit_td">';
					html[html.length] = '<div class="idea_wrapper">' + tmp.join('') + '</div>';
					html[html.length] = '<a class="edit_btn" id="IdeaEdit_' + item.ideaid + '" edittype="ideaid" ideaid="' + item.ideaid + '"></a>';
                    html[html.length] = '</div>';
							
					return html.join('');
		},
		
	    /**
	     * 跳出率列
	     * @param {Object} item
	     */
	    bouncerate : function(item){
			var bouncerate = baidu.encodeHTML(item.bouncerate),
				html = [],
				limit = nirvana.config.AO.DETAIL_MAX_LENGTH;
		
			html.push('<span title="' + bouncerate + '">' + getCutString(bouncerate, limit, '..') + '</span>');
        
        	return html.join('');
		}
	},

	/**
	 * 日志中心
	 * @param {String} actionName	//操作类别
	 * @param {Array} param			//参数，非必须
	 * 
	 * 快捷方式
	 * logCenter('aowidget_tab');                //切换tab
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
widget22viewIdeaSwap = function(e, oid, nid){
	var il = baidu.dom.children(e.parentNode.parentNode);
	var oIdea = il[0];
	var nIdea = il[1];
						
	if (e.innerHTML == '查看修改后创意及状态') {
		e.innerHTML = '查看修改前创意及状态';
		baidu.addClass(oIdea, 'display_none');
		baidu.removeClass(nIdea, 'display_none');
//		baidu.hide('IdeaEdit_' + oid);
	} else {
		e.innerHTML = '查看修改后创意及状态';
		baidu.removeClass(oIdea, 'display_none');
		baidu.addClass(nIdea, 'display_none');
//		baidu.show('IdeaEdit_' + oid);
	}
};