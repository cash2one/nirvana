/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: module/accountScore/AccountScoreMonitor.js 
 * desc: 账户质量评分的用户行为监控
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/11/16 $
 */
/**
 * 用于发送账户质量评分使用情况的监控的静态类
 * 
 * @class AccountScoreMonitor
 * @namespace nirvana
 * @static
 */
nirvana.AccountScoreMonitor = function($) {
	/**
	 * 发送行为监控 
	 */
	function sendMonitor(actionName, params) {
		var args = {
			"target": "accountscore_" + actionName
		};
		
		baidu.extend(args, params || {});
		NIRVANA_LOG.send(args);
	}
	
	var AccountScoreMonitor = {
		/**
		 * 发送打开账户质量评分详情的行为监控 
		 * @method openDetails
		 */
		openDetails: function() {
			sendMonitor('open_details');
		},
		/**
		 * 发送用户切换评分Tab页的行为监控 
		 * @method switchScoreTab
		 * @param scoreType 标识四个评分Tab的类型ID，见AccountScore评分类型常量定义
		 */
		switchScoreTab: function(scoreType) {
			sendMonitor('click_tab', {'score_id': +scoreType});
		}
	};
	
	return AccountScoreMonitor;
}($$);