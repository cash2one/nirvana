/**
 * fbs.keyword
 * 关键词相关接口
 * @author zuming@baidu.com
 */

fbs = fbs || {};

fbs.keyword = {};

/**
 * 配置项，用于生成获取属性方法
 * @author zuming@baidu.com
 */
fbs.keyword.config = {
    level: "wordinfo",
    getAttributes: ['offlinereason', 'showword'],
    getFacade: {
        "nameList": ["winfoid", "showword"],
        'list': ["planid", "planname", "unitid", "unitname", "unitbid", "winfoid", "showword", "wordstat", "wmatch", "wurl", "shadow_wurl", "bid", "minbid", "showqstat", "clks", "shows", "paysum", 'trans', 'avgprice'],
		'abtest':["planname", "unitname", "unitbid", "winfoid", "showword", "wmatch", "bid", "showqstat", "clks", "shows", "paysum", 'trans', 'avgprice', 'clkrate'],
		'bids': ['showword', 'bid', 'unitbid', 'minbid'],
		'info' : [
					'planid',
					'planname',
					'unitid',
					'unitname',
					'winfoid',
					'showword'
				]
    }
};

// 创建获取属性方法
fbs.material.implementGetMethod(fbs.keyword);



/**
 * 添加关键词
 * @param {Object} param {
 * 		planid: 1
 * 		unitid : 1
 * 		keywords : [字面1，字面2]
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author tongyao@baidu.com
 */
fbs.keyword.add = fbs.interFace({
    path: fbs.config.path.ADD_KEYWORD_PATH,
    
    necessaryParam: {
        planid: '',
        unitid: '',
        keywords: ['字面1', '字面2']
    },
    
    validate: fbs.validate.addKeyword,
    
    parameterAdapter: function(param) {
        var obj = {};
        
        //构建<indexKey : keyword>的结构
        for (var i = 0, l = param.keywords.length; i < l; i++) {
            obj[i] = param.keywords[i];
        }
        
        param.keywords = obj;
        
        return param;
    }
});

/**
 * 添加关键词到不同单元
 * @author wanghuijun@baidu.com
 */
fbs.keyword.addMultiUnit = fbs.interFace({
	path: fbs.config.path.ADD_KEYWORD_MULTIUNIT,
	
	necessaryParam: {
		items : [{
			planid : '339241',
			unitid : '54211579',
			idx : 0,
			keyword : 'test',
			wmatch : 15
		}]
	}
});


/**
 * 修改关键词暂停/启用状态
 * @param {Object} param {
 * 		pausestat : 0 - 启用, 1 - 暂停
 * 		winfoid : [1,2]
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onFail的参数
 * }
 * @author tongyao@baidu.com
 */
fbs.keyword.modPausestat = fbs.interFace({
	path: fbs.config.path.MOD_KEYWORD_PATH,
	
	necessaryParam: {
		winfoid: [1, 2],
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
 * 激活关键词
 * @param {Object} param {
 *      winfoid : [1,2]
 *      activestat: 0 - 激活
 *      callback: Function, //可选, 不论返回什么status, 都把数据直接做为callback的参数
 *      onSuccess: Function, //可选, 返回status为成功或者部分成功时, 将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function, //可选, 返回status为失败或者部分成功时, 将返回数据线中的status和成功地数据error两个字段作为onFail的参数
 * }
 * @author chenjincai@baidu.com
 *
 */
fbs.keyword.active = fbs.interFace({
    path: fbs.config.path.MOD_KEYWORD_PATH,

    necessaryParam : {
        winfoid: [1,2],
        activestat : '0'
    },

    parameterAdapter : function(param) {
        param.items = {
            activestat: param.activestat
        };
        delete param.activestat;
        return param;
    }
});
/**
 * 删除关键词
 * @param {Object} param {
 * 		winfoid : [1,2,3]
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author tongyao@baidu.com
 */
fbs.keyword.del = fbs.interFace({
    path: fbs.config.path.DEL_KEYWORD_PATH,
    
    necessaryParam: {
        winfoid: [1, 2]
    }
});

/**
 * 转移关键词
 * @param {Object} param {
 * 		winfoid : [1,2,3]
 * 		isnew : true or false,
 *      needovewrite : 0 or 1 or 2,
 *      callback: Function, // 可选,不论返回什么status,都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author wanghuijun@baidu.com
 */
fbs.keyword.trans = fbs.interFace({
    path: fbs.config.path.TRANS_KEYWORD_PATH,
    
    necessaryParam: {
        planid: '',
        unitid: '',
        unitname: '',
        winfoid: [1, 2, 3],
        isnew: '',
        needovewrite: ''
    }
});


/**
 * 修改关键词出价
 * @param {Object} param {
 * 		winfoid : [1,2]
 * 		bid : '999.99' || [1,1,2]
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author zuming@baidu.com
 */
fbs.keyword.modBid = function(param) {
	if (fbs.util.isArray(param.bid)) {
		fbs.keyword.modDiffBid(param);
	} else {
		fbs.keyword.modSameBid(param);
	}
};

fbs.keyword.modSameBid = fbs.interFace({
	path: fbs.config.path.MOD_KEYWORD_PATH,
	
	necessaryParam: {
		winfoid: [1, 2],
		bid: '999.99'
	},
	
	validate: fbs.validate.modKeywordBid,
	
	parameterAdapter: function(param) {
		param.items = {
			bid: param.bid
		};
		delete param.bid;
		return param;
	}
});

fbs.keyword.modDiffBid = fbs.interFace({
	path: fbs.config.path.MOD_KEYWORD_DIFFBID_PATH,
	
	necessaryParam: {
		winfoid: [1, 2],
		bid: [1, 2]
	},
	
	validate: fbs.validate.modKeywordDiffBid,
	
	parameterAdapter: function(param) {
		param.winfoid2bid = {};
		for (var i = 0, len = param.winfoid.length; i < len; i++) {
			param.winfoid2bid[param.winfoid[i]] = param.bid[i];
		}
		delete param.winfoid;
		delete param.bid;
		return param;
	}
});

/**
 * 修改关键词匹配模式
 * @param {Object} param {
 * 		winfoid : [1,2]
 * 		wmatch : 63 // "精确","31" : "短语", "15" : "广泛"
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author zuming@baidu.com
 */
fbs.keyword.modWmatch = fbs.interFace({
	path: fbs.config.path.MOD_KEYWORD_PATH,
	
	necessaryParam: {
		winfoid: [1, 2],
		wmatch: 63
	},
	
	parameterAdapter: function(param) {
		param.items = {
			wmatch: param.wmatch
		};
		delete param.wmatch;
		return param;
	}
});

/**
 * 批量修改关键词匹配模式
 * @param {Object} param {
 *      winfoid : [1,2]
 *      wmatch : [63, 15] // "精确","31" : "短语", "15" : "广泛"
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author zuming@baidu.com
 */
fbs.keyword.modDiffWmatch = fbs.interFace({
    path: fbs.config.path.MOD_KEYWORD_DIFFWMATCH_PATH,
    
    necessaryParam: {
        winfoid: [1, 2],
        wmatch: [15, 31]
    },
    
    parameterAdapter: function(param) {
        param.winfoid2wmatch = {};
        for (var i = 0, len = param.winfoid.length; i < len; i++) {
            param.winfoid2wmatch[param.winfoid[i]] = param.wmatch[i];
        }
        delete param.winfoid;
        delete param.wmatch;
        return param;
    }
});
//只用于验证的添词接口 by mayue
fbs.keyword.valmodBid = function(param) {
    if (fbs.util.isArray(param.bid)) {
        fbs.keyword.valmodDiffBid(param);
    } else {
        fbs.keyword.valmodSameBid(param);
    }
};

fbs.keyword.valmodSameBid = fbs.valinterFace({
    path: fbs.config.path.MOD_KEYWORD_PATH,
    
    necessaryParam: {
        winfoid: [1, 2],
        bid: '999.99'
    },
    
    validate: fbs.validate.modKeywordBid,
    
    parameterAdapter: function(param) {
        param.items = {
            bid: param.bid
        };
        delete param.bid;
        return param;
    }
});

fbs.keyword.valmodDiffBid = fbs.valinterFace({
    path: fbs.config.path.MOD_KEYWORD_DIFFBID_PATH,
    
    necessaryParam: {
        winfoid: [1, 2],
        bid: [1, 2]
    },
    
    validate: fbs.validate.modKeywordDiffBid,
    
    parameterAdapter: function(param) {
        param.winfoid2bid = {};
        for (var i = 0, len = param.winfoid.length; i < len; i++) {
            param.winfoid2bid[param.winfoid[i]] = param.bid[i];
        }
        delete param.winfoid;
        delete param.bid;
        return param;
    }
});
/**
 * 修改关键词访问URL
 * @param {Object} param {
 * 		winfoid : [1,2]
 * 		wmatch : 1
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author zuming@baidu.com
 */
fbs.keyword.modWurl = fbs.interFace({
	path: fbs.config.path.MOD_KEYWORD_PATH,
	
	necessaryParam: {
		winfoid: [1, 2],
		wurl: 1
	},
	
	validate: fbs.validate.modKeywordUrl,
	
	parameterAdapter: function(param) {
		var url = fbs.util.removeUrlPrefix(param.wurl);
		if (url != "") {
			url = "http://" + url;
		}
		param.items = {
			wurl: url
		};
		delete param.wurl;
		return param;
	}
});

/**
 *修改移动访问url yanlingling 
 */
fbs.keyword.modMWurl = fbs.interFace({
    path: fbs.config.path.MOD_KEYWORD_PATH,
    
    necessaryParam: {
        winfoid: [1, 2],
        wurl: 1
    },
    
    validate: fbs.validate.modKeywordUrl,
    
    parameterAdapter: function(param) {
        var url = fbs.util.removeUrlPrefix(param.wurl);
        if (url != "") {
            url = "http://" + url;
        }
        param.items = {
            mwurl: url
        };
        delete param.wurl;
        return param;
    }
});
/**
 * 修改高短控制符
 * @param {Object} param {
 * 		winfoid : [1,2]
 * 		wctrl : 0,1 // 0 - 新高短， 1 - 原高短
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author zuming@baidu.com
 */
fbs.keyword.modWctrl = fbs.interFace({
	path: fbs.config.path.MOD_KEYWORD_PATH,
	
	necessaryParam: {
		winfoid: [1, 2],
		wctrl: 0
	},
	
	parameterAdapter: function(param) {
		param.items = {
			wctrl: param.wctrl
		};
		delete param.wctrl;
		return param;
	}
});