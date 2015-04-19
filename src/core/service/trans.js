
/**
 * fbs.trans
 * 转化相关接口
 * @author wangzhishou@baidu.com wanghuijun@baidu.com
 */

fbs = fbs || {};

fbs.trans = {};

/**
 * 配置项，用于生成获取属性方法
 * @author wangzhishou@baidu.com
 */
fbs.trans.config = {
};

/**
 * 是否开通百度统计
 */
fbs.trans.isContractSigned = fbs.interFace({
	path: fbs.config.path.IS_CONTRACT_SIGNED,
	necessaryParam: {
	},
	parameterAdapter: function(param) {
		return param;
	}
});

/**
 * 开通百度统计
 */
fbs.trans.signContract = fbs.interFace({
	path: fbs.config.path.SIGN_TRANS_CONTRACT,
	necessaryParam: {
	},
	parameterAdapter: function(param) {
		return param;
	}
});

/**
 * 查询开放域名列表
 */
fbs.trans.getOpenDomain = fbs.interFace({
	path: fbs.config.path.GET_OPEN_DOMAIN,
	necessaryParam: {
	},
	parameterAdapter: function(param) {
		return param;
	}
});

/**
 * 添加转化（转化跟踪工具-->新增转化）
 */
fbs.trans.addTrans = fbs.interFace({
	path: fbs.config.path.ADD_TRANS,
	necessaryParam: {
	},
	//validate: fbs.validate.addTrans,
	// 暂时不在fbs里做验证
	parameterAdapter: function(param) {
		return param;
	}
});

/**
 * 检查单一url（转化跟踪工具-->全面检查-->转化跟踪URL）
 */
fbs.trans.checkSingleUrl = fbs.interFace({
	path: fbs.config.path.CHECK_SINGLE_URL,
	necessaryParam: {
	}
});

/**
 * 获取转化数据
 * @author wangzhishou@baidu.com
 */
fbs.trans.getTransData = fbs.interFace({
	path: fbs.config.path.GET_TRANS_DATA,
	necessaryParam: {
	},
	parameterAdapter: function(param) {
		return param;
	}
});

/**
 * 修改转化（转化跟踪工具-->转化列表-->修改）
 * @author wangzhishou@baidu.com
 */
fbs.trans.modTrans = fbs.interFace({
	path: fbs.config.path.MOD_TRANS,
	necessaryParam: {
	},
	parameterAdapter: function(param) {
		return param;
	}
});

/**
 * 删除指定网站（转化跟踪工具-->网站列表-->删除）
 * @author wangzhishou@baidu.com
 */
fbs.trans.delSite = fbs.interFace({
	path: fbs.config.path.DEL_SITE,
	necessaryParam: {
	},
	parameterAdapter: function(param) {
		return param;
	}
});

/**
 * 暂停-启用网站（转化跟踪工具-->网站列表-->启用/暂停）
 * @author wangzhishou@baidu.com
 */
fbs.trans.siteStatus = fbs.interFace({
	path: fbs.config.path.SET_SITE_STATUS,
	necessaryParam: {
	},
	parameterAdapter: function(param) {
		return param;
	}
});

/**
 * 获取代码（转化跟踪工具-->网站列表-->获取代码）
 * @author wangzhishou@baidu.com
 */
fbs.trans.jsCode = fbs.interFace({
	path: "GET/JsCode",
	necessaryParam: {
	},
	parameterAdapter: function(param) {
		return param;
	}
});

/**
 * 获取跟踪方式（转化跟踪工具-->跟踪方式设置链接）
 * @author wanghuijun@baidu.com
 */
fbs.trans.getTrackType = fbs.interFace({
	path: fbs.config.path.GET_TRACKTYPE,
	necessaryParam: {
	},
	parameterAdapter: function(param) {
		return param;
	}
});

/**
 * 跟踪方式设置（转化跟踪工具-->跟踪方式设置链接）
 * @author wangzhishou@baidu.com
 */
fbs.trans.setTrackType = fbs.interFace({
	path: fbs.config.path.SET_TRACKTYPE,
	necessaryParam: {
	},
	parameterAdapter: function(param) {
		return param;
	}
});

/**
 * 获取转化列表
 * @author wangzhishou@baidu.com
 */
fbs.trans.getTransList = fbs.interFace({
	path: fbs.config.path.GET_TRANS_LIST,
	necessaryParam: {
	},
	parameterAdapter: function(param) {
		return param;
	}
});

/**
 * 开启或者暂停转化路径
 * @author wangzhishou@baidu.com
 */
fbs.trans.setTransStaus = fbs.interFace({
	path: fbs.config.path.SET_TRANS_STATUS,
	necessaryParam: {
	},
	parameterAdapter: function(param) {
		return param;
	}
});

/**
 * 删除转化路径
 * @author wangzhishou@baidu.com
 */
fbs.trans.delTrans = fbs.interFace({
	path: fbs.config.path.DEL_TRANS,
	necessaryParam: {
	},
	parameterAdapter: function(param) {
		return param;
	}
});

/**
 * 请求网站列表（转化跟踪工具-->网站列表）
 * @author wangzhishou@baidu.com
 */
fbs.trans.getSiteList = fbs.interFace({
	path: fbs.config.path.GET_SITE_LIST,
	necessaryParam: {
	},
	parameterAdapter: function(param) {
		return param;
	}
});


/**
 * 根据所属网站查找转化名称
 * @author wangzhishou@baidu.com
 */
fbs.trans.getTransListForSelect = fbs.interFace({
	path: fbs.config.path.GET_TRANSLIST_FORSELECT,
	necessaryParam: {
	},
	parameterAdapter: function(param) {
		return param;
	}
});

/**
 * 获取发起查询网站列表（下拉框）请求
 */
fbs.trans.getSiteListForSelect = fbs.interFace({
	path: fbs.config.path.GET_SITELIST_FORSELECT,
	necessaryParam: {
	},
	parameterAdapter: function(param) {
		return param;
	}
});

/**
 * 通过所属网站查找转化名称，只取完全匹配模式的转化名称（转化跟踪工具-->全面检查）
 */
fbs.trans.getTransListForCheckallSelect = fbs.interFace({
	path: fbs.config.path.GET_TRANSLIST_FORCHECKALL,
	necessaryParam: {
	},
	parameterAdapter: function(param) {
		return param;
	}
});

/**
 * 检查推广访问url（转化跟踪工具-->全面检查-->推广访问URL）
 */
fbs.trans.checkFcUrl = fbs.interFace({
	path: fbs.config.path.CHECK_FC_URL,
	necessaryParam: {
	},
	parameterAdapter: function(param) {
		return param;
	}
});

/**
 * 搜索推广URL进度查询（转化跟踪工具-->全面检查-->推广访问URL）
 */
fbs.trans.getFcUrlProgress = fbs.interFace({
	path: fbs.config.path.GET_FCURL_PROGRESS,
	necessaryParam: {
	},
	parameterAdapter: function(param) {
		return param;
	}
});

/**
 * 查询搜索推广URL检查结果（转化跟踪工具-->全面检查-->推广访问URL）
 */
fbs.trans.getFcUrlResult = fbs.interFace({
	path: fbs.config.path.GET_FCURL_RESULT,
	necessaryParam: {
	},
	parameterAdapter: function(param) {
		return param;
	}
});

/**
 * 检查转化跟踪URL（转化跟踪工具-->全面检查-->转化跟踪URL）
 */
fbs.trans.checkTransUrl = fbs.interFace({
	path: fbs.config.path.CHECK_TRANS_URL,
	necessaryParam: {
	},
	parameterAdapter: function(param) {
		return param;
	}
});

/**
 * 检转化跟踪URL进度查询回调，获取检查结果（转化跟踪工具-->全面检查-->转化跟踪URL）
 */
fbs.trans.getTransUrlResult = fbs.interFace({
	path: fbs.config.path.GET_TRANSURL_RESULT,
	necessaryParam: {
	},
	parameterAdapter: function(param) {
		return param;
	}
});

/**
 * 获取账户状态
 */
fbs.trans.getLxbStatus = fbs.interFace({
	path: 'GET/LXB/status'
});


/**
 * 获取400电话及今日消费
 */
fbs.trans.getLxbBaseInfo = fbs.interFace({
	path: 'GET/LXB/basicInfo'
});


/**
 * 获取收费模式
 
fbs.trans.getChargeModel = fbs.interFace({
	path: 'GET/LXB/chargeModel'
});
*/

/**
 * 获取电话转化数据
 */
fbs.trans.getPhoneTransData = fbs.interFace({
	path: 'GET/LXB/phoneTransData'
});


/**
 * 新增网站
 */
fbs.trans.addSite = fbs.interFace({
	path: 'ADD/site'
});


/**
 * 启动暂停网站电话追踪
 */
fbs.trans.setPhoneTrackStatus = fbs.interFace({
	path: 'SET/LXB/trackStatus'
});

/**
 * 单元绑定分机号
 */
fbs.trans.lxbBindUnit = fbs.interFace({
	path: 'SET/LXB/bindUnit'
});

/**
 * 单元解绑分机号
 */
fbs.trans.lxbUnbindUnit = fbs.interFace({
	path: 'SET/LXB/unbindUnit'
});



