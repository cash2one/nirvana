/**
 * fbs.unit
 * 单元相关接口
 * @author zuming@baidu.com
 */

fbs = fbs || {};

fbs.unit = {};

/**
 * 配置项，用于生成获取属性方法
 * @author zuming@baidu.com
 */
fbs.unit.config = {
    level: "unitinfo",
	primaryKey: "unitid",
    getAttributes: ['offlinereason', 'unitname', 'creativecnt','unitid'],
    getFacade: {
		"nameList": ["unitid", "unitname", "creativecnt"],
		'info' : [
			'planid',
			'planname',
			'unitid',
			'unitname',
			'unitstat',
			'unitbid',
			'allnegativecnt',
			'creativecnt',
			'deviceprefer',
            'devicecfgstat'
		],
		'list': [
			'planid',
			'planname',
			"unitid", 
			"unitname",
			"unitstat",
			"pausestat",
			"unitbid", 
			"clks", 
			"shows", 
			"paysum", 
			'trans', 
			'avgprice'
		],
		'negativeInfo': ['unitid', 'negative', 'accuratenegative'],
		'basicInfo':['unitid', 'unitname','createtime'],
		'creativeInfo':['creativecnt']
    }
};

// 创建获取属性方法
fbs.material.implementGetMethod(fbs.unit);


/**
 * 设置否定关键词
 * @author zuming@baidu.com
 */
fbs.unit.modNegativeWord = fbs.interFace({
	path: "MOD/unit",
	necessaryParam: {
		unitid: 1200 || [1, 2],
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
		}
		delete param.negative;
		delete param.accuratenegative;
		return param;
	}
});

/**
 * 设置精确否定关键词
 * @author zuming@baidu.com
 */
fbs.unit.modAccurateNegativeWord = fbs.interFace({
	path: "MOD/unit",
	necessaryParam: {
		unitid: 1200 || [1, 2],
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
		}
		
		delete param.negative;
		delete param.accuratenegative;
		return param;
	}
});


/**
 * 新建单元
 * @param {Object} param {
 * 		planid: 1
 * 		unitname
 * 		bid : 单元出价
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author tongyao@baidu.com
 */
fbs.unit.add = fbs.interFace({
	path: fbs.config.path.ADD_UNIT_PATH,
	
	necessaryParam: {
		planid : '1',
		unitname : '',
		unitbid : '99.99'
		//planid : ['仅一个planid']
	},
	/*
	parameterAdapter: function(param) {
		param.planid = param.planid[0];
		return param;
	},*/
	
	validate: fbs.validate.addUnit
});


/**
 * 修改单元名称
 * @param {Object} param {
 * 		unitname
 * 		unitid : [1,2]
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author tongyao@baidu.com
 */
fbs.unit.modUnitname = fbs.interFace({
	path: fbs.config.path.MOD_UNIT_PATH,
	
	necessaryParam: {
		unitid: [1, 2],
		unitname: '单元名称'
	},
	
	validate: fbs.validate.unitName,
	
	parameterAdapter: function(param) {
		param.items = {
			unitname: param.unitname
		}
		delete param.unitname;
		return param;
	}
});


/**
 * 修改单元出价
 * @param {Object} param {
 * 		unitid : [1,2]
 * 		unitbid : '999.99'
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author tongyao@baidu.com
 */
fbs.unit.modUnitbid = fbs.interFace({
	path: fbs.config.path.MOD_UNIT_PATH,
	
	necessaryParam: {
		unitid: [1, 2],
		unitbid: '999.99'
	},
	
	validate: fbs.validate.unitBid,
	
	parameterAdapter: function(param) {
		param.items = {
			unitbid: param.unitbid
		}
		delete param.unitbid;
		return param;
	}
});




/**
 * 修改单元暂停/启用状态
 * @param {Object} param {
 * 		pausestat : 0 - 启用, 1 - 暂停
 * 		unitid : [1,2]
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author tongyao@baidu.com
 */
fbs.unit.modPausestat = fbs.interFace({
	path: fbs.config.path.MOD_UNIT_PATH,
	
	necessaryParam: {
		unitid: [1, 2],
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
 * 删除推广单元
 * @param {Object} param {
 * 		unitid : [1,2]
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author tongyao@baidu.com
 */
fbs.unit.del = fbs.interFace({
	path: fbs.config.path.DEL_UNIT_PATH,
	
	necessaryParam: {
		unitid: [1, 2]
	}
});


/**
 * 批量添加创意时获取所有创意为0的单元的树形结构
 * @param {Object} param {
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author mayue@baidu.com
 */
fbs.unit.getListWithNoIdea = fbs.interFace({
	path: fbs.config.path.GET_EOS_EMPTYIDEAUNITS
});
