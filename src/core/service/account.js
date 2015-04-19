/**
 * fbs.account
 * 账户相关接口
 * @author zuming@baidu.com
 */

fbs = fbs || {};

fbs.account = {};

/**
 * 配置项，用于生成获取属性方法
 * @author zuming@baidu.com
 * 
 * 将daysconsumable预计可消费天数字段移动vega中，这里将下面配置的该字段删掉
 * change by yangji 2013.1.5
 */
fbs.account.config = {
    level: "useracct",
    getAttributes: ["wregion", "bgttype", "weekbudget", "wbudget", 
	                "userstat", "clks", "shows", "paysum", "showpay", 
					"trans", "clkrate", "avgprice", "balance", 
					"activetimeout", "offlinetime", 
					"reolinetime","ipblack","qrstat1","advancedipblack"],
    getFacade: {
        "consumptionStatus": ["userstat", "balance", "todaypaysum"],
		"info"	:	['wregion', 'bgttype', 'wbudget', 'weekbudget', 'userstat'],
		//"budgetInfo": ['wbudget', 'weekbudget', 'bgttype'],
        //"info"	:	['wregion', 'wbudget', 'userstat'],
		"budgetInfo": ['wbudget', 'weekbudget', 'bgttype'],
		'offline' : ['offlinestat'],
        'indexData': ['userstat', 'balance', 'todaypaysum', 'bgttype', 'wbudget', 'weekbudget', 'wregion']
    }
};

// 创建获取属性方法
fbs.material.implementGetMethod(fbs.account);

// 概况页图表数据缓存
fbs.account.overViewDataCache = {};

/**
 * 获取概况页图表数据
 * @param {Object} param {
 * 		starttime: YYYY-MM-DD 起始时间
 *		endtime: YYYY-MM-DD 结束时间
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author zuming@baidu.com
 */
fbs.account.getOverViewData = fbs.interFace({
	path: "GET/mars/flashdata",
	necessaryParam: {
		starttime: "YYYY-MM-DD",
		endtime: "YYYY-MM-DD"
	}/*,
	cache: fbs.account.overViewDataCache,
	cacheKey: function(p) {
		return p.starttime + '&' + p.endtime;
	}	*/
});

/**
 * 设置账户预算
 * @author zuming@baidu.com
 */
fbs.account.modBudget = fbs.interFace({
	path: "MOD/account",
	necessaryParam: {
		items : {}
	},
	validate: fbs.validate.budget
});

/**
 * 设置账户IP排除
 * @author zuming@baidu.com
 */
fbs.account.modIpExclusion = fbs.interFace({
	path: "MOD/account",
	necessaryParam: {
		ipblack: ["10.10.10.10"]
	},
	validate: fbs.validate.ipExclusion,
	parameterAdapter: function(param) {
		param.items = {
			ipblack: param.ipblack.join(",")
		}
		delete param.ipblack;
		return param;
	}
});


/**
 *高级ip排除 
 */
fbs.account.modAdvIpExclusion = fbs.interFace({
    path: "MOD/account",
    necessaryParam: {
        advancedipblack: ["10.10.10.10"]
    },
    parameterAdapter: function(param) {
        param.items = {
            advancedipblack: param.advancedipblack.join(",")
        }
        delete param.advancedipblack;
        return param;
    }
});
/**
 * 修改推广地域
 * @param {Object} param {
 * 		region: [1,2,3],全部地域传[]
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author tongyao@baidu.com
 */
fbs.account.modRegion = fbs.interFace({
	path: fbs.config.path.MOD_ACCOUNT_PATH,

	parameterAdapter: function(param) {
		param.items = {};
		if(param.wregion){
			param.items.wregion = param.wregion.join(',');
			delete param.wregion;
		}
		if(param.qrstat1){
			param.items.qrstat1 = param.qrstat1;
			delete param.qrstat1;
		}
		return param;
	}
});

/**
 * 修改激活时长
 * @param {Object} param {
 * 		activeTimeout : 0 | 24 | 72
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author tongyao@baidu.com
 */
fbs.account.modActiveTimeout = fbs.interFace({
	path: fbs.config.path.MOD_ACCOUNT_PATH,
	
	necessaryParam: {
		activetimeout: '0 | 24 | 72'
	},
	
	parameterAdapter: function(param) {
		param.items = {
			activetimeout: param.activetimeout
		}
		delete param.activetimeout;
		return param;
	}
});

/**
 * 获取预算分析
 * @author wanghuijun@baidu.com
 */
fbs.account.getBudgetAnalysis = fbs.interFace({
	path: fbs.config.path.GET_ACCOUNT_BUDGETANALYSIS
});

/**
 * 获取预算的详情信息
 * @author LeoWang(wangkemiao@baidu.com)
 */
fbs.account.getBudgetDetail = fbs.interFace({
	path : fbs.config.path.GET_AO_USERBUDGETDETAIL,
	necessaryParam : {
		level : 'useracct',
		startindex : 0,
		endindex : 9
	}
});

/**
 * 获取用户的精确匹配扩展开启状态
 * @author guanwei01@baidu.com
 * @date 2012/12/04
 */
fbs.account.getExactMatchExpStatus = fbs.interFace({
	path: 'GET/rngwext/status'
});

/**
 * 改变用户的精确匹配扩展开启状态
 * @author guanwei01@baidu.com
 * @date 2012/12/04
 */
fbs.account.setExactMatchExpStatus = fbs.interFace({
	path: 'MOD/account',
	necessaryParam : {
		items: {
			// 0:关闭；1:开启
			regionwext: 0
		}
	}
});


fbs.account.readAllDeviceFloat = fbs.interFace({
    path: 'MOD/AllDeviceFloat'
});