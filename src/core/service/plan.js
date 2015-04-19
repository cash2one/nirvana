/**
 * fbs.account
 * 相关接口
 * @author zuming@baidu.com
 */
fbs = fbs || {};

fbs.plan = {};

/**
 * 配置项，用于生成获取属性方法
 * @author zuming@baidu.com
 */
fbs.plan.config = {
    level: "planinfo",
	primaryKey: "planid",
    getAttributes: ["planname", "planid", "wregion", "wbudget", "planstat", 
    				"pausestat", "plancyc", "showprob", 'negative', 'accuratenegative', 
    				'allnegativecnt', 'clks', 'shows', 'paysum', 'showpay', 'trans', 
    				'clkrate', 'avgprice',"ipblack", "allipblackcnt", "createtime", 
    				"qrstat1", "deviceprefer", 'unitcnt','mPriceFactor'],
    getFacade: {
    	'planAttrWithBridge':["planid", "planname","deviceprefer","phonenum","devicecfgstat",'bridgeStat'],
		'nameList': ["planid", "planname","deviceprefer","phonenum","devicecfgstat"],
		'info' : ['planid', 'planname', 'wregion', 'wbudget', 'planstat', 'plancyc', 'allnegativecnt',"devicecfgstat","deviceprefer",'mPriceFactor'],
        'list': ["planid", "planname", "planstat", "clks", "shows", "paysum", 'trans', 'avgprice'],
		'basicInfo': ['planid', 'planname','createtime', 'showprob'],
		'negativeInfo': ['planid', 'negative', 'accuratenegative'],
		'offline' : ['planid', 'planname', 'offlinestat'],
		'preferAndFactor' : ['planid', 'deviceprefer', 'mPriceFactor']
		/*'offlineReason' : ['planname', 'offlineReason']*/
    }
};

// 创建获取属性方法
fbs.material.implementGetMethod(fbs.plan);

//四个层级通用的获取离线理由的方法
fbs.material.getOfflinereason = fbs.interFace({
	path: fbs.config.path.GET_OFFLINEREASON,
	necessaryParam: {
		level: ["planinfo", "unitinfo", "wordinfo", "ideainfo",'appendIdeainfo']
	}
});

/**
 * 设置计划预算
 * @author zuming@baidu.com
 */
fbs.plan.modBudget = fbs.interFace({
	path: "MOD/plan",
	necessaryParam: {
		planid: [1, 2],
		items: {}
	},
	validate: fbs.validate.budget
});

/**
 * 批量修改计划预算
 * @author wuhuiyao@baidu.com
 * @date 2013-5-20
 */
fbs.plan.batchModBudget = fbs.requester({
    path: 'MOD/batchplans',
    nocache: false
});

/**
 * 设置否定关键词
 * @author zuming@baidu.com
 */
fbs.plan.modNegativeWord = fbs.interFace({
	path: "MOD/plan",
	necessaryParam: {
		planid: [1, 2],
		negative: [],
		accuratenegative: []
	},
	validate: fbs.validate.negativeWord,
	parameterAdapter: function(param) {
		for (var i = 0, len = param.negative.length; i < len; i++) {
			param.negative[i] = encodeURIComponent(param.negative[i]);
		}
		param.items = {
			negative: param.negative.join(",")
		};
		delete param.negative;
		delete param.accuratenegative;
		return param;
	}
});

/**
 * 设置精确否定关键词
 * @author zuming@baidu.com
 */
fbs.plan.modAccurateNegativeWord = fbs.interFace({
	path: "MOD/plan",
	necessaryParam: {
		planid: [1, 2],
		negative: [],
		accuratenegative: []
	},
	validate: fbs.validate.accurateNegativeWord,
	parameterAdapter: function(param) {
		for (var i = 0, len = param.accuratenegative.length; i < len; i++) {
			param.accuratenegative[i] = encodeURIComponent(param.accuratenegative[i]);
		}
		param.items = {
			accuratenegative: param.accuratenegative.join(",")
		};
		
		delete param.negative;
		delete param.accuratenegative;
		return param;
	}
});

/**
 * 设置账户IP排除
 * @author zuming@baidu.com
 */
fbs.plan.modIpExclusion = fbs.interFace({
	path: "MOD/plan",
	necessaryParam: {
		planid: [1, 2],
		ipblack: ["10.10.10.10"]
	},
	validate: fbs.validate.ipExclusion,
	parameterAdapter: function(param) {
		param.items = {
			ipblack: param.ipblack.join(",")
		};
		delete param.ipblack;
		return param;
	}
});



/**
 * 设置设备属性和推广电话
 * @author zhujialu
 */
fbs.plan.modDeviceAndPhoneNumber = fbs.interFace({
	path: "MOD/plan",
	necessaryParam: {
		planid: [1]
        // 下面这三个参数可以只传其中一个，如果三个都不传，没必要发请求
        // devicecfgstat: 1
        // deviceprefer: 0,
        // phonenum: '11111'
	},
	parameterAdapter: function(param) {
        var obj = {};
        if (typeof param.deviceprefer !== 'undefined') {
            obj.deviceprefer = param.deviceprefer;
            delete param.deviceprefer;
        }
        if (typeof param.phonenum !== 'undefined') {
            obj.phonenum = param.phonenum;
            delete param.phonenum;
        }
        if (typeof param.devicecfgstat !== 'undefined') {
            obj.devicecfgstat = param.devicecfgstat;
            delete param.devicecfgstat;
        }
        if (typeof param.mPriceFactor !== 'undefined') {
            obj.mPriceFactor = param.mPriceFactor;
            delete param.mPriceFactor;
        }
        if (typeof param.bridgeStat !== 'undefined') {
            obj.bridgeStat = param.bridgeStat;
            delete param.bridgeStat;
        }

		param.items = obj;
		return param;
	}
});


/**
 * 设置多设备推广管理
 * @zhouyu
 */
fbs.plan.setMulDevice = fbs.interFace({
	path: "MOD/plan",
	necessaryParam: {
		planid: [1]
	},
	parameterAdapter: function(param){
		param.items = {
			devicecfgstat: 1
		};
		return param;
	}
});


/**
 * 新建计划
 * @param {Object} param {
 * 		planname
 * 		showprob : 1 - 优选 2 - 轮替
 * 		region : 地域 [] - 使用账户地域 全部id序列 - 全部地域
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author tongyao@baidu.com
 */
fbs.plan.add = fbs.interFace({
	path: fbs.config.path.ADD_PLAN_PATH,
	
	necessaryParam: {
		planname : '',
		showprob : '1 | 2',
		wregion : [1,2,3]
	},
	
	validate: fbs.validate.addPlan,
	
	parameterAdapter: function(param) {
		param.wregion = param['wregion'].join(',');
		return param;
	}
});

/**
 * 修改计划基本设置
 * @param {Object} param {
 * 		planname
 * 		showprob : 1 - 优选 2 - 轮替
 * 		planid : [1,2]
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author tongyao@baidu.com
 */
fbs.plan.modPlan = fbs.interFace({
	path: fbs.config.path.MOD_PLAN_PATH,
	
	necessaryParam: {
		planid: [1, 2],
		planname: '计划名称',
		showprob : '1 | 2'
	},
	
	validate: fbs.validate.addPlan,
	
	parameterAdapter: function(param) {
		param.items = {
			planname: param.planname,
			showprob: param.showprob,
			cprostat: param.cprostat,
			cproprice: param.cproprice
		};
		delete param.planname;
		delete param.showprob;
		delete param.cprostat;
		delete param.cproprice;
		return param;
	}
});

/**
 * 修改计划名称
 * @param {Object} param {
 * 		planname
 * 		planid : [1,2]
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author tongyao@baidu.com
 */
fbs.plan.modPlanname = fbs.interFace({
	path: fbs.config.path.MOD_PLAN_PATH,
	
	necessaryParam: {
		planid: [1, 2],
		planname: '计划名称'
	},
	
	validate: fbs.validate.planName,
	
	parameterAdapter: function(param) {
		param.items = {
			planname: param.planname
		};
		delete param.planname;
		return param;
	}
});


/**
 * 修改计划创意展现方式
 * @param {Object} param {
 * 		planid : [1,2]
 * 		showprob : 1 - 优选 2 - 轮替
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author tongyao@baidu.com
 */
fbs.plan.modShowprob = fbs.interFace({
	path: fbs.config.path.MOD_PLAN_PATH,
	
	necessaryParam: {
		planid: [1, 2],
		showprob: '1 | 2'
	},
	
	parameterAdapter: function(param) {
		param.items = {
			showprob: param.showprob
		};
		delete param.showprob;
		return param;
	}
});


/**
 * 修改计划推广时段
 * @param {Object} param {
 * 		planid : [1,2]
 * 		plancyc: [[100,106],[701,702]], 暂停推广时间数组，每个数组第一项表示开始，第二项表示结束。三位数第一位表示星期，后两位表示24小时制小时
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author tongyao@baidu.com
 */
fbs.plan.modPlancyc = fbs.interFace({
	path: fbs.config.path.MOD_PLAN_PATH,
	
	necessaryParam: {
		planid: [1, 2],
		plancyc: [[100,106],[701,702]]
	},
	
	parameterAdapter: function(param) {
		param.items = {
            plancyc: param.plancyc ? baidu.json.stringify(param.plancyc) : ''
		};
		delete param.plancyc;
		return param;
	}
});

/**
 * 修改计划推广地域
 * @param {Object} param {
 * 		region: [1,2,3],全部地域传id全集，使用账户地域传[]
 * 		planid : [1,2]
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author tongyao@baidu.com
 */
fbs.plan.modRegion = fbs.interFace({
	path: fbs.config.path.MOD_PLAN_PATH,
	
	parameterAdapter: function(param) {
		param.items = {};
		if(typeof(param.wregion) != "undefined"){
			param.items.wregion = param.wregion.join(',');
			delete param.wregion;
		}
		if(typeof(param.qrstat1) != "undefined"){
			param.items.qrstat1 = param.qrstat1;
			delete param.qrstat1;
		}
		return param;
	}
});



/**
 * 修改计划暂停/启用状态
 * @param {Object} param {
 * 		pausestat : 0 - 启用, 1 - 暂停
 * 		planid : [1,2]
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author tongyao@baidu.com
 */
fbs.plan.modPausestat = fbs.interFace({
	path: fbs.config.path.MOD_PLAN_PATH,
	
	necessaryParam: {
		planid: [1, 2],
		pausestat : '0 | 1'
	},
	
	parameterAdapter: function(param) {
		param.items = {
			pausestat: param.pausestat
		};
		delete param.pausestat;
		return param;
	}
});


/**
 * 删除推广计划
 * @param {Object} param {
 * 		planid : [1,2]
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author tongyao@baidu.com
 */
fbs.plan.del = fbs.interFace({
	path: fbs.config.path.DEL_PLAN_PATH,
	
	necessaryParam: {
		planid: [1, 2]
	}
});

/**
 * 获取预算分析
 * @param {Object} param {
 * 		planid : 1
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author wanghuijun@baidu.com
 */
fbs.plan.getBudgetAnalysis = fbs.interFace({
	path: fbs.config.path.GET_PLAN_BUDGETANALYSIS,
	
	necessaryParam: {
		planid: 1
	}
});

/**
 * 获取预算的详情信息
 * @author LeoWang(wangkemiao@baidu.com)
 */
fbs.plan.getBudgetDetail = fbs.interFace({
	path : fbs.config.path.GET_AO_PLANBUDGETDETAIL,
	necessaryParam: {
		condition : {
			planid: []
		},
		level : 'useracct',
		startindex : 0,
		endindex : 9
	}
})
