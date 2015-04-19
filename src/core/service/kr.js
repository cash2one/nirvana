/**
 * fbs.kr
 * 相关接口
 * @author linzhifeng@baidu.com
 */
fbs = fbs || {};

fbs.kr = {};

/**
 * 获取KR种子词
 * @param {Object} param {
 * 		logid : -1,	//必选，查询id
 *		planid : 1,	//必选，计划
 *		unitid : 1,	//必选，单元
 *		rectype : 0|1|2, //必选，获取种子词类型，0-词和URL，1-词，2-URL
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author linzhifeng@baidu.com
 */
fbs.kr.getRecommSeed = fbs.interFace({
	path: "GET/kr/seed",
	
	necessaryParam: {
		logid : -1,
		planid : 1,
		unitid : 1,
		rectype : 0|1|2
	}
});

/**
 * 获取行业树
 * @param {Object} param {
 * 		logid : -1,	//必选，查询id
 *		planid : 1,	//必选，计划
 *		unitid : 1,	//必选，单元
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author linzhifeng@baidu.com
 */
fbs.kr.getTradeCate = fbs.interFace({
	path: "GET/kr/trade",
	
	necessaryParam: {
		logid : -1,
		planid : 1,
		unitid : 1
	}
});

/**
 * 获取推荐
 * @param {Object} param {
 * 		logid : -1,	//必选，查询id
 * 		query : '',	//必选，输入查询内容
 *		//变脸去掉mtype : 0|1|2, //必选，匹配模式，0-精确，1-短语，2-广泛
 *		regions : "", //必选，推广地域
 *		//变脸去掉 negwords : "", //必选，否定关键词
 *		rgfilter : 0|1, //必选，显示地域拓展词，0-显示，1-不显示
 *		//变脸去掉 pvmon : 1|0, //必选，显示搜索量最高月份，0-不显示，1-显示
 *		querytype : 0|1|2|3|4, //必选，关键词推荐类型，0-不指定，1-关键词推荐，2-url推荐，3-量身推荐，4-行业潜力词
 *		planid : 1,	//必选，计划
 *		unitid : 1,	//必选，单元
 *      callback: Function, // 可选，不论返回什么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author linzhifeng@baidu.com
 */
fbs.kr.getRecommWord = fbs.interFace({
	path: "GET/kr/word",
	
	necessaryParam: {
		logid : -1,
		query : '',
		regions : "",
		rgfilter : 0|1,
		querytype : 0|1|2|3|4,
		planid : 1,
		unitid : 1,
		device: 0
	}
});

/**
 * 将KR推荐结果放入回收站
 * @param {Object} param {
 * 		krlogid : -1, //必选，查询id
 * 		wrodid : '', //必选，被放入回收站的关键词id
 *		srchcnt : 10, //必选，日均搜索量
 *		cmprate : 20, //必选，竞争激烈程度
 *		planid : 1,	//必选，计划
 *		unitid : 1,	//必选，单元
 *      callback: Function, // 可选，不论返回什么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author linzhifeng@baidu.com
 */
fbs.kr.addRecycleWord = fbs.interFace({
	path: "ADD/kr/recycle",
	
	necessaryParam: {
		logid : -1,
		wordid : 1,
		srchcnt : 10,
		cmprate : 20,
		planid : 1,
		unitid : 1
	}
});

/**
 * 将回收站中的关键词进行还原
 * @param {Object} param {
 * 		krrid : '', //必选，回收站的关键词id
 *      callback: Function, // 可选，不论返回什么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author linzhifeng@baidu.com
 */
fbs.kr.delRecycleWord = fbs.interFace({
	path: "DEL/kr/recycle",
	
	necessaryParam: {
		krrid : -1
	}
});

/**
 * 获取KR关键词回收站数据
 * @author linzhifeng@baidu.com
 */
fbs.kr.getRecycleItems = fbs.interFace({
	path: "GET/kr/recycle/items"
});

/**
 * 获取KR关键词回收站数量
 * @author linzhifeng@baidu.com
 */
fbs.kr.getRecycleNum = fbs.interFace({
	path: "GET/kr/recycle/num"
});

/**
 * 获取KR suggestion信息
 * @author liuyutong@baidu.com
 */
fbs.kr.suggestion = fbs.interFace({
	path: "GET/kr/suggestion",
	necessaryParam: {
		entry : '',
		query : '' 
	}
});


/**
 * 获取自动分组信息
 * @author huangkai01@baidu.com
 */
fbs.kr.autounit = fbs.interFace({
	path: "GET/kr/autounit",
	necessaryParam: {
		logId : -1,
		words : [],
		krautoType : 0|1|2			//0：优先放入现有单元，放不进去时自动分组；1：全部放入现有单元；2：全部自动分组；
	}
});
/**
 * 提交保存自动分组
 * @author huangkai01@baidu.com
 */
fbs.kr.addAutoUnit= fbs.interFace({
	path: "ADD/kr/addAutoUnit",
	necessaryParam: {
		logId : -1,
		//krAutoUnitSessionId: -1,  非必须参数，单纯严正的时候不需要这个参数
		forceSave: 0|1|2,  // 0：有问题就返回，询问客户，1：强制保存,  2: 单纯验证
		groupList : [],
		matchType : 63|31|15			//63：精确匹配；31：短语匹配；15：广泛匹配；
	}
});

/**
 * 验证新分组
 * @author huangkai01@baidu.com
 */
fbs.kr.valNewPlanUnit = fbs.interFace({
	path: "GET/kr/valNewPlanUnit",
	necessaryParam: {
		logId : -1,
		planName : '',
		unitName : ''			
	}
});


/**
 * 根据业务点推荐
 * @author zhujialu@baidu.com
 */
fbs.kr.getBusinessPointWords = fbs.interFace({
    path: 'GET/kr/businessPointWords',
    necessaryParam: {
        logid: -1,
        query: '',
        unitid: 0,
        businessPoint: ''
    }
});

