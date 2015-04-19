/**
 * fbs.queryReport
 * 搜索词报告相关接口
 * @author wanghuijun@baidu.com
 */

fbs = fbs || {};

fbs.queryReport = {};


/**
 * 获取搜索词报告
 * @param {Object} param {
 * 		engineid: “-1”,
 *      provid: “0”,
 *      accountRange: 2,
 *      startDate: “yyyy-MM-dd”,
 *      endDate: “yyyy-MM-dd”,
 *      daySensitive: 1,
 *      accountid: 198329,
 *      mtldim: 2,
 *      idset: '1,2,3'
 * }
 * @author wanghuijun@baidu.com
 */
fbs.queryReport.getQueryReport = fbs.interFace({
	path : fbs.config.path.GET_QUERYREPORT_LIST,
	
	necessaryParam : {
		engineid: '-1',
		provid: '0',
		accountRange: 2,
		startDate: 'yyyy-MM-dd',
		endDate: 'yyyy-MM-dd',
		daySensitive: 1,
		accountid: 198329,
		mtldim: 2, //这里只用到3/7/11  2 推广账户 3 推广计划 5 推广单元 11 关键词 7 创意
		idset: '1,2,3'
	}
});

/**
 * 获取搜索词信息
 * @param {Object} param {
 * 		word : ['搜索词1', '搜索词2', '搜索词3']
 * }
 * @author wanghuijun@baidu.com
 */
fbs.queryReport.getQueryWordStat = fbs.interFace({
	path : fbs.config.path.GET_QUERYWORD_STAT,
	
	necessaryParam : {
		word : ['搜索词1', '搜索词2', '搜索词3']
	}
});


/**
 * 获取文件下载地址
 * @author zhouyu01@baidu.com
 */
fbs.queryReport.getDownloadPath = fbs.interFace({
	path: "GET/mars/queryreportfile",
	
	necessaryParam: {
		engineid: '-1',
		provid: '0',
		accountRange: 2,
		startDate: 'yyyy-MM-dd',
		endDate: 'yyyy-MM-dd',
		daySensitive: 1,
		accountid: 198329,
		mtldim: 2, //这里只用到3/7/11  2 推广账户 3 推广计划 5 推广单元 11 关键词 7 创意
		idset: '1,2,3',
		device: 0,
		
		fileType: 0
	},

	parameterAdapter: function(param) {
		if(param.userid){
			delete param.userid;
		}
		return param;
	}
});