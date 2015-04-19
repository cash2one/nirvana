/**
 * 蹊径链接的tab展现形式写的到处都是，这里都提出来
 * 报告中也有相应的链接
 * 本次升级后，在tab和报告中的外部链接有 蹊径 和 高级样式 两种，以后有升级都在这里改
 * @author zhouyu01
 */
var EXTERNAL_LINK = (function(){
	var tabTpl = '<div class="ui_tab extra_tab">' + 
			  '	<ul>' + 
			  '		<li>' + 
			  '			<a target="_blank" href="{0}">{1}</a><span class="extra_link_icon">&nbsp;</span>' + 
			  '		</li>' + 
			  '	</ul>' +
			  '</div>',
		reportTpl = '<a target="_blank" href="{0}">{1}</a><span class="extra_link_icon">&nbsp;</span>&nbsp;&nbsp;&nbsp;&nbsp;';

	var tabConfig = {
			"xijing": {
				"href": 'http://fengchao.baidu.com/xijing/index/u/' + nirvana.env.USER_ID,
				"txt": '蹊径'
			},
			"advstyle": {
				"href": 'http://chuangxin.baidu.com/portal?uid=' + nirvana.env.USER_ID,
				"txt": '高级样式'
			}
		},
		reportConfig = {
			"xijing": {
				"href": 'http://fengchao.baidu.com/xijing/report/u/' + nirvana.env.USER_ID,
				"txt": '查看蹊径报告'
			},
			"advstyle": {
				"href": 'http://chuangxin.baidu.com/minipage?uid=' + nirvana.env.USER_ID + '#/report',
				"txt": '查看高级样式数据报告'
			}
		};		
		
	var auth = [];
		
	  
	/**
	 * 控制需要展示的外部链接
	 */
	function authControl(){
		//蹊径
		if (nirvana.env.AUTH.xijing == 100) {
			auth[auth.length] = "xijing";
		}
		//高级样式
		if(nirvana.env.DESCOUNT_INFO){
			auth[auth.length] = "advstyle";
		}
	}
	
	/**
	 * tab右侧展示有权限的链接
	 * @param {Object} dom
	 */
	function tabInit(dom){
		var html = [], authItem;
		for (var i = 0, len = auth.length; i < len; i++) {
			authItem = tabConfig[auth[i]];
			if (authItem) {
				html[html.length] = ui.format(tabTpl, authItem.href, authItem.txt);
			}
		}
		baidu.g(dom).innerHTML = html.join("");
	}
	
	
	function reportInit(dom){
		var html = [], authItem;
		for (var i = 0, len = auth.length; i < len; i++) {
			authItem = reportConfig[auth[i]];
			if (authItem) {
				html[html.length] = ui.format(reportTpl, authItem.href, authItem.txt);
			}
		}
		baidu.g(dom).innerHTML = html.join("");
	}
	
	return {
		authControl: authControl,
		tabInit: tabInit,
		reportInit: reportInit
	}
})();
