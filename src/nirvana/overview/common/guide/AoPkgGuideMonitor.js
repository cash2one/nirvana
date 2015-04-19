/*
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: nirvana/overview/guide/AoPkgGuideMonitor.js
 * desc: 用于优化包引导页的监控
 * author: Wu Huiyao (wuhuiyao@baidu.com) 
 * date: $Date: 2012/10/12 $
 */
/**
 * 优化包引导页用户行为的监控类
 * 
 * @class AoPkgGuideMonitor
 * @namespace overview
 * @static 
 */
overview.AoPkgGuideMonitor = function($) {
	/**
	 * 发送行为监控 
	 */
	function sendMonitor(pkgId, step, actionName) {
		NIRVANA_LOG.send({
			    // 以后智能优化包的监控统一加上nikon前缀
			    "target": "nikon_aopkgGuide_" + actionName, // 标识一下优化包引导页动作
				"pkgid": pkgId,
				"step": step
			});
	}
	
	var AoPkgGuideMonitor = {
		/**
		 * 点击引导页左边的Logo直接打开相应的优化包行为监控
		 * @method openPkg
		 * @static
		 * @param {Number} pkgId 当前引导的优化包ID
		 * @param {Number} step 当前引导页所处的步数（当前处于引导页的第step页）
		 */
		openPkg: function(pkgId, step) {
			sendMonitor(pkgId, step, "clickPkgLogo");
		},
		/**
		 *  点击立即体验按钮行为监控
		 *  @method tryPkg
		 *  @static
		 *  @param {Number} pkgId 当前引导的优化包ID
		 * 	@param {Number} step 当前引导页所处的步数（当前处于引导页的第step页）
		 */
		tryPkg: function(pkgId, step) {
			sendMonitor(pkgId, step, "clickTry");
		},
		/**
		 * 关闭引导页行为的监控
		 * @method closeGuide 
		 * @static
		 * @param {Number} pkgId 当前引导的优化包ID
		 * @param {Number} step 当前引导页所处的步数（当前处于引导页的第step页）
		 */
		closeGuide: function(pkgId, step) {
			sendMonitor(pkgId, step, "clickClose");
		}
	};

	return AoPkgGuideMonitor;
}($$);