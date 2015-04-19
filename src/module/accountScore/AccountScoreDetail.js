/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: nirvana/module/accountScore/AccountScoreDetail.js 
 * desc: 新的账户质量评分详情
 * author: Wu Huiyao (wuhuiyao@baidu.com) 
 * date: $Date: 2012/11/08 $
 */
/**
 * 账户质量评分详情
 * 
 */
nirvana.AccountScoreDetail = function($, AccountScore) {
	// 初始化用于行为监控的对象
	var monitor = nirvana.AccountScoreMonitor;
	// 缓存用于Flash图表区数据请求的token
	var flashToken = '';
	
 	/**
 	 * 账户质量评分详情构造函数定义
 	 * @param {nirvana.AccountScore} accountScore 账户质量评分实例
 	 * @constructor AccountScoreDetail
 	 */
 	function AccountScoreDetail(accountScore) {
 		this.accountScore = accountScore;
 	}
 	
 	/**
 	 * 根据给定的ScoreTab的类型的数据获取ScoreTab的模板 
 	 * @param {Number} scoreType 评分类型ID
 	 * @param {String} scoreTypeName 评分类型名称
 	 * @param {Object} data 特定的score类型的数据
 	 */
 	function getScoreTabTPL(scoreType, scoreTypeName, data) {
        var scoreValue = data.score,
            scoreState,
            scoreStateName,
            scoreChangeValue = data.change,
            scoreChangeState = "",
            scoreChangeInfo = "昨日相比",
            clazz_name = '';
            
        // 默认如果没有score，也就没有comment, 即这两个值要么都存在，要么都不存在
        if (data.score === null) {
        	scoreState = '';
        	scoreStateName = '-';
        	scoreValue = '?';
        } else if (AccountScore.COMMENT.GOOD === data.comment) {
        	scoreState = 'good';
        	scoreStateName = '良好';
        } else {
        	scoreState = 'bad';
        	scoreStateName = '较差';
        }
        
        // 如果是账户评分Tab添加特定的样式
        if (scoreType === AccountScore.ACCOUNT_SCORE) {
        	clazz_name = " main_tab";
        }
        
        if (scoreChangeValue === null) {
        	// 该值不存在
        	scoreChangeInfo = "";
        } else if (!scoreChangeValue) {
        	// 保持不变
        	scoreChangeInfo += "保持不变";
        } else if (scoreChangeValue > 0) {
        	// 得分上升
        	scoreChangeInfo += "升" + scoreChangeValue + "分";
        	scoreChangeState = "good";
        } else {
        	// 得分下降
        	scoreChangeInfo += "降" + Math.abs(scoreChangeValue) + "分";
        	scoreChangeState = "bad";
        }
        
 		var tplData = {
			"clazz_name" : clazz_name,
			"score_type_id" : scoreType,
			"score_type_name" : scoreTypeName,
			"score_value" : scoreValue,
			"score_state" : scoreState,
			"score_state_name" : scoreStateName,
			"score_change_state" : scoreChangeState,
			"score_change_info" : scoreChangeInfo
		};
 			 
 	    return lib.tpl.parseTpl(tplData, 'accountScoreTab', true);
 	}
 	
 	/**
 	 * 获取账户质量评分导航Tab的模板
 	 */
 	function getAccoutScoreNavTabsTPL(data) {
		var typeArr = [AccountScore.ACCOUNT_SCORE, AccountScore.PRESENT_SCORE,
				AccountScore.CLICK_SCORE, AccountScore.PV_CONVERSION_SCORE],
	        tpl = "",
	        typeName;
	        
	    for (var i = 0, len = typeArr.length; i < len; i ++) {
	    	typeName = AccountScore.NAME_MAP[typeArr[i]];
	    	tpl += getScoreTabTPL(typeArr[i], typeName, data[typeArr[i]]);
	    }
		
		return tpl;
 	}
 	
 	/**
 	 * 创建Flash图表数据区 
 	 */
 	function createScoreChangeFlashGraph(containerElem) {
 		var config = {
				id: "scoreChangeFlash",
				url: './asset/swf/account_score.swf',
				width: "960",//960, //
				height: "180",//180,// 
				scale : 'showall',
				wmode : 'opaque',
				allowscriptaccess : 'always' 
			};
 		
 		return new ui.Flash(fbs.accountscore.historyData, containerElem, config);
 	}
 	
 	AccountScoreDetail.prototype = {
 		/**
 		 * 当前选择的Tab，一开始默认为账户评分项Tab
 		 * @private
 		 */ 
 		selectedTab:  AccountScore.ACCOUNT_SCORE,
 		/**
 		 * 打开账户质量评分详情对话框 
 		 * @method open
 		 * @public
 		 */
 		open: function() {
 			// 发送监控
 			monitor.openDetails();
 			
 			var me = this,
 			    bindContext = nirvana.util.bind;
 			
			// 创建账户质量评分详情的对话框
	        me._dlg = ui.Dialog.factory.create({
	            id: 'AccountScoreDlg',
	            title: '账户质量评分&nbsp;&nbsp;-&nbsp;&nbsp;帮助您全面分析账户质量 提高行业竞争力',
	            content: '',
	            width: 986,
	            height: 610,
	            ok_button: false, // 不要确定按钮
	            cancel_button: false  // 不要取消按钮
	        });
	        
	        // 移除浏览器的滚动条，避免影响弹出的对话框的交互
	        // baidu.addClass(document.documentElement, 'no_scroll_body');
	        
	        // 初始化对话框内容
	        me.initDlgContent(me._dlg);
	        // 绑定对话框关闭事件处理器
	        me._dlg.onclose = bindContext(me.dispose, me);
	        
	        // 触发Tab的选择
	 	    me.switchScoreTab(me.selectedTab);
 		},
 		/**
 		 * 初始化对话框内容 
 		 * @private
 		 */
 		initDlgContent: function(dlg) {
 			var me = this;
 			// 重置对话框样式
	        var dlgBodyElem = $("#" + dlg.getId() + " .ui_dialog_body")[0];
	        baidu.dom.setStyles(dlgBodyElem, {margin: "15px 0 10px"});
	        
 	    	dlg.setContent(er.template.get('accountScoreDetails'));
 	    	
 	    	// 渲染评分项的Tab
 	    	me.renderNavTab();
 	    	
 	    	var flashContainer = $("#accountScoreTabContainer .score_change_graph")[0];
 	    	// 创建图表数据区
 	    	me.flash = createScoreChangeFlashGraph(flashContainer);
 	    	// 创建Tab下各个评分项的内容
 	    	me.scoreBar = new nirvana.AccountScoreBar();
 		},
 		/**
 		 * 渲染Tab
 		 * @private 
 		 */
 		renderNavTab: function() {
 			// 初始化ScoreTab
 			var data = this.accountScore.scoreAbstract;
 	    	var tpl = getAccoutScoreNavTabsTPL(data);
 	    	var tabHeadElem = $("#accountScoreTabHeaders")[0];
 	    	
 	    	if (tabHeadElem) {
 	    		tabHeadElem.innerHTML = tpl;
	 	    	// 添加事件处理器
	 	    	this.bindEventHandlers();
 	    	}
 		},
 		/**
 		 * 渲染Flash图表区
 		 * @private 
 		 */
 		renderFlash: function() {
 			var me = this;
 			
 			if (me.flashData) { // 该值已经存在，说明已经请求过数据
 				// 更新Flash数据
 				var currData = me.getFlashData();
				me.flash.update(currData);
				return;
 			} else if (me.isFlashLoading) {
 				// 已经在请求中，不再重复请求
 				return;
 			}
 			
 			// 还未初始化flashData，请求加载数据
 			var param = {
				condition : {
					'token' : flashToken
				},
				onSuccess : function(data) {
					var flashData = me.processFlashData(data.account_score_detail.account_score_detail_item);
					// 缓存请求返回的token
					flashToken = data.token;
				    // 显示flash图表区
					me.flash.show(flashData);
				}
			};
			// 标识flash正在请求数据
			me.isFlashLoading = true;
			// 请求账户质量评分图表区数据
			me.flash.loadData(param);
 		},
 		/**
 		 * 处理Flash图表区请求返回的数据 
 		 * @private
 		 * @return {Object} 当前要渲染的Flash 数据
 		 */
 		processFlashData: function(data) {
 			var flashData = {},
 			    historyData,
 			    scoreData,
 			    title,
 			    score,
 			    color ="#ff4433",
 			    itemData;
 			
 			for (var i = 0, len = data.length; i < len; i ++) {
 				historyData = data[i];
 				title = AccountScore.NAME_MAP[historyData.id] + "评分";
 				scoreData = historyData.score_history;
 				itemData = [];
 				
 				for (var j = 0, len2 = scoreData.length; j < len2; j ++) {
 					score = scoreData[j].score;
 					itemData[j] = {
 						'valueTitle': title,
 						'date': scoreData[j].date,
 						'value': nirvana.util.isEmptyValue(score) ? null : +score,
 						'color': color
 					};
 				}
 				
 				// 缓存每个Tab下的评分的历史数据
 				flashData[historyData.id] = itemData;
 			}
 			
 			this.flashData = flashData;
 			return this.getFlashData();
 		},
 		/**
 		 * 获取当前要被渲染的Flash数据
 		 * @private 
 		 */
 		getFlashData: function() {
 			return this.flashData[this.selectedTab];
 		},
 	    /**
 	     * 绑定事件处理器 
 	     */
 	    bindEventHandlers: function() {
 	    	var delegateElem = $("#accountScoreTabHeaders")[0];
 	    	if (delegateElem) {
 	    		delegateElem.onclick = nirvana.event.delegate(
                     delegateElem, this.clickScoreTabHandler, this);
//					.getEventHandler(this, this.clickScoreTabHandler, delegateElem);
 	    	}
 	    },
 	    /**
 	     * ScoreTab点击事件处理器 
 	     */
 	    clickScoreTabHandler: function(event, target) {
 	    	var toSelTabClass = null;
 	    	var scoreType = baidu.getAttr(target, 'scoreType');
 	    	
 	    	if (scoreType) {
 	    		// 发送用户切换Tab的行为监控,不管这个Tab是不是当前已经被选中，只要用户点击Tab就发送监控
 	    		monitor.switchScoreTab(scoreType);
 	    		this.switchScoreTab(+scoreType);
 	    		return true;
 	    	}
 	    },
 	    /**
 	     * 切换评分类型Tab 
 	     */
 	    switchScoreTab: function(scoreType) {
 	    	var toSelTab = $('#accountScoreTabHeaders LI[scoreType=' + scoreType + ']')[0];
 	    	
 	    	// 已经被选择过的不重复触发
 	    	if (baidu.dom.hasClass(toSelTab, "selected")) {
 	    		return;
 	    	}
 	    	
 	    	var oldSelectedTab = $('#accountScoreTabHeaders LI.selected');
 	    	// 移除当前选择的Tab
 	    	if (oldSelectedTab.length > 0) {
 	    		baidu.removeClass(oldSelectedTab[0], 'selected');
 	    	}
 	    	
 	    	// 添加被选中的Tab的样式
 	    	baidu.addClass(toSelTab, 'selected');
 	    	
 	    	// 更新当前选择的Tab
 	    	this.selectedTab = scoreType;
 	    	
 	    	// 更新评分详情内容
 	    	this.updateScoreDetails();
 	    },
 	    /**
 	     * 渲染各项指标具体信息 
 	     */
 	    renderScoreItemDetails: function() {
 	    	this.scoreBar.show(this.selectedTab);
 	    },
 	    /**
 	     * 更新评分详情的内容 
 	     */
 	    updateScoreDetails: function() {
 	    	// 渲染Flash图表区
	        this.renderFlash();
			// 重新渲染各个指标的详情信息
			this.renderScoreItemDetails();
 	    },
 	    /**
 		 * 销毁账户质量评分详情实例 
 		 */
 		dispose: function() {
 			// 销毁flash,对话框、bar组件实例
 			ui.util.disposeWidgets(this, ['flash', 'scoreBar']);
 			this.accountScore = null;
 			this.flashData = null;
            // ui.Dialog.factory.create的对话框的dispose比较特殊
            ui.util.disposeDlg(this._dlg);
            this._dlg = null;
 			// 恢复浏览器的滚动条
	        //baidu.removeClass(document.documentElement, 'no_scroll_body');
 		}
 	};
 	
 	return AccountScoreDetail;
}($$, nirvana.AccountScore);