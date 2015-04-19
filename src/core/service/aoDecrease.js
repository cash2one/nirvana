/**
 * fbs.aoDecr
 * 效果突降相关接口
 * @author wanghuijun@baidu.com
 */

fbs.aodecr = {};

/**
 * 获取效果突降摘要信息
 * @param {Object} param {
 * 		level : 'useracct', // 层级
 * 		condition : {
 * 			planid : [planid1, planid2],       // 计划列表，没有则不传
 * 			unitid : [unitid1, unitid2],       // 单元列表，没有则不传
 * 			winfoid : [winfoid1, winfoid2],    // 关键词列表，没有则不传
 * 			ideaid : [ideaid1, ideaid2],       // 创意列表，没有则不传
 * 			folderid : [folderid1, folderid2]  // 关键词文件夹列表，没有则不传
 * 		}, // 层级
 * 		signature : 'xxx', // 优化项签名，没有传''
 * 		command : 'start', // start or query
 * 		opttype : [1, 2] // 优化子项id，不能为空
 * }
 * @author wanghuijun@baidu.com
 */
fbs.aodecr.getRequset = fbs.interFace({
	path : fbs.config.path.GET_AODECR_REQUEST,
	
	necessaryParam : {
		level : 'useracct',
		signature : 'xxx',
		command : 'start',
		opttype : [1, 2]
	}
});

/**
 * 获取用户是否是突降账户
 * @author wanghuijun@baidu.com
 */
fbs.aodecr.getUser = fbs.interFace({
	path : fbs.config.path.GET_AODECR_ISUSER
});

/**
 * 启动bianque，计算摘要信息
 * @author wanghuijun@baidu.com
 */
fbs.aodecr.getAdviceStat = fbs.interFace({
	path : fbs.config.path.GET_AODECR_HASADVICE,
	
	necessaryParam : {
		command : 'start/query' // 取值”start”或”query”，分别代表启动和查询
	}
});

/**
 * 获取期初期末日期以及日期类型
 * @author wanghuijun@baidu.com
 */
fbs.aodecr.getDate = fbs.interFace({
	path : fbs.config.path.GET_AODECR_DATE
});

/**
 * 获取突降指标和突降阈值(未设置则默认为点击和20%)
 * @author wanghuijun@baidu.com
 */
fbs.aodecr.getCustom = fbs.interFace({
	path : fbs.config.path.GET_AODECR_CUSTOM
});

/**
 * 修改突降指标和突降阈值
 * @author wanghuijun@baidu.com
 * @author LeoWang wangkemiao@baidu.com
 */
fbs.aodecr.modCustom = fbs.interFace({
	path : fbs.config.path.MOD_AODECR_FLASHDATA,
	
	necessaryParam : {
		type : 'shows/clks/pv',
		value : 20 // (0, 100] 整数
	},
	
	validate: fbs.validate.decrConfiguration
});

/**
 * 获取效果突降折线图数据
 * @author wanghuijun@baidu.com
 */
// del by Huiyao 2013.1.7 这个接口已经没用了
//fbs.aodecr.getFlashData = fbs.interFace({
//	path : fbs.config.path.GET_AODECR_FLASHDATA,
//
//	necessaryParam : {
//		starttime : '2011-11-02',
//		endtime : '2011-11-09',
//		type : 'shows/clks/pv'
//	}
//});

/**
 * 关键词搜索无效详情
 * @author zhaojinghua@baidu.com
 */
fbs.aodecr.getWordSearchInvalidDetail = fbs.interFace({
	path : fbs.config.path.GET_AODECR_WORDSEARCHINVALIDDETAIL
});

/**
 * 关键词不宜推广详情
 * @author zhaojinghua@baidu.com
 */
fbs.aodecr.getWordRejectedDetail = fbs.interFace({
	path : fbs.config.path.GET_AODECR_WORDREJECTEDDETAIL
});

/**
 * 关键词检索量过低详情
 * @author zhaojinghua@baidu.com
 */
fbs.aodecr.getWordPvTooLowDetail = fbs.interFace({
	path : fbs.config.path.GET_AODECR_WORDPVTOOLOWDETAIL
});

/**
 * 关键词暂停推广详情
 * @author zhaojinghua@baidu.com
 */
fbs.aodecr.getWordPauseDetail = fbs.interFace({
	path : fbs.config.path.GET_AODECR_WORDPAUSEDETAIL
});

/**
 * 关键词已删除详情
 * @author zhaojinghua@baidu.com
 */
fbs.aodecr.getWordDeleteDetail = fbs.interFace({
	path : fbs.config.path.GET_AODECR_WORDDELETEDETAIL
});

/**
 * 单元已删除详情
 * @author zhaojinghua@baidu.com
 */
fbs.aodecr.getUnitDeleteDetail = fbs.interFace({
	path : fbs.config.path.GET_AODECR_UNITDELETEDETAIL
});

/**
 * 单元暂停详情
 * @author zhaojinghua@baidu.com
 */
fbs.aodecr.getUnitPauseDetail = fbs.interFace({
	path : fbs.config.path.GET_AODECR_UNITPAUSEDETAIL
});

/**
 * 单元已删除详情
 * @author zhaojinghua@baidu.com
 */
fbs.aodecr.getPlanDeleteDetail = fbs.interFace({
	path : fbs.config.path.GET_AODECR_PLANDELETEDETAIL
});

/**
 * 单元暂停详情
 * @author zhaojinghua@baidu.com
 */
fbs.aodecr.getPlanPauseDetail = fbs.interFace({
	path : fbs.config.path.GET_AODECR_PLANPAUSEDETAIL
});

///**
// * 获取推广时段详情 // 这个接口暂时已经没用了 del by Huiyao 2013.4.15
// * @author yangji01@baidu.com
// */
//fbs.aodecr.getPlancycDetail = fbs.interFace({
//	path : fbs.config.path.GET_AODECR_PLANCYCDETAIL,
//	necessaryParam : {
//	}
//});

/**
 * 获取top100的关键词
 * @author yangji01@baidu.com
 */
fbs.aodecr.getDelTopWords = fbs.interFace({
	path : fbs.config.path.GET_AODECR_DELTOPWORDS,
	
	necessaryParam : {
		level : '',
		condition: {}
	}
});

/**
 * 获取账户预算不足详情
 * @author LeoWang wangkemiao@baidu.com
 */
fbs.aodecr.getUserBudgetDetail = fbs.interFace({
	path : fbs.config.path.GET_AODECR_USERBUDGETDETAIL,
	
	necessaryParam : {
		level : 'useracct'
	}
});

/**
 * 获取计划预算不足详情
 * @author LeoWang wangkemiao@baidu.com
 */
fbs.aodecr.getPlanBudgetDetail = fbs.interFace({
	path : fbs.config.path.GET_AODECR_PLANBUDGETDETAIL,
	
	necessaryParam : {
		level : 'planinfo'
	}
});

/**
 * 获取突降物料TAB页所需数据
 * @author LeoWang wangkemiao@baidu.com
 */
fbs.aodecr.getMeterial = fbs.interFace({
	path : fbs.config.path.GET_AODECR_MATERIAL,
	necessaryParam : {
		level : 'useracct'
	}
});

/**
 * 单元无生效创意详情
 * @author LeoWang wangkemiao@baidu.com
 */
fbs.aodecr.getUnitNoActivatedIdeaDetail = fbs.interFace({
	path : fbs.config.path.GET_AODECR_UNITNOACTIVATEDIDEADETAIL,
	
	necessaryParam : {
		level : 'useracct'
	}
	
});

/**
 * 匹配模式缩小
 * @author yangji01@baidu.com
 */
fbs.aodecr.getMatchPattern = fbs.interFace({
	path : fbs.config.path.GET_AODECR_MATCHPATTERNDETAIL,
	
	necessaryParam : {
		level : '',
		condition: {},
		startindex: '',
		endindex: ''
	}
});

/**
 * 自然检索量下降
 * @author yangji01@baidu.com
 */
fbs.aodecr.getRetrieval = fbs.interFace({
	path : fbs.config.path.GET_AODECR_RETRIEVALDETAIL,
	
	necessaryParam : {
		level : '',
		condition: {},
		startindex: '',
		endindex: ''
	}
});

/**
 * 推左次数或排名下降详情
 * @author yangji01@baidu.com
 */
fbs.aodecr.getRanking = fbs.interFace({
	path : fbs.config.path.GET_AODECR_RANKINGDETAIL,
	
	necessaryParam : {
		level : '',
		condition: {},
		startindex: '',
		endindex: ''
	}
});


/**
 * 获取质量度下降为1星的数据
 * @author LeoWang wangkemiao@baidu.com
 */
fbs.aodecr.showqdetail = fbs.interFace({
	path : fbs.config.path.GET_AODECR_SHOWQDETAIL,
	necessaryParam : {
		level : '',
		condition: {},
		startindex: '',
		endindex: ''
	}
});

/**
 * 获取质量度下降为2星的数据
 * @author LeoWang wangkemiao@baidu.com
 */
fbs.aodecr.showqlowdetail = fbs.interFace({
	path : fbs.config.path.GET_AODECR_SHOWQLOWDETAIL,
	necessaryParam : {
		level : '',
		condition: {},
		startindex: '',
		endindex: ''
	}
});

/**
 * 暂停推广关键词ids
 */
fbs.aodecr.getWordPauseWinfoids = fbs.interFace({
	path : fbs.config.path.GET_AODECR_WORDPAUSEWINFOIDS,
	
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9
	}
});

/**
 * 暂停推广单元ids
 */
fbs.aodecr.getUnitPauseUnitids = fbs.interFace({
	path : fbs.config.path.GET_AODECR_UNITPAUSEUNITIDS,
	
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9
	}
});

/**
 * 暂停推广计划ids
 */
fbs.aodecr.getPlanPausePlanids = fbs.interFace({
	path : fbs.config.path.GET_AODECR_PLANPAUSEPLANIDS,
	
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9
	}
});
