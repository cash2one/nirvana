/**
 * fbs.eos
 * 快速新建相关接口
 * @author wangkemiao@baidu.com
 */

fbs = fbs || {};

fbs.eos = {};

/**
 * 获取任务进行状态
 * return data 0 新账户，1 老账户
 * @author wanghuijun@baidu.com
 */
fbs.eos.getUserType = fbs.interFace({
    path : fbs.config.path.GET_EOS_USERTYPE
});

/**
 * 获取任务进行状态
 * 返回0-7状态码：
 *		0：没开始
 *		1: 开始生成方案
 *		2：成功
 *		3：开始入库
 *		4：成功
 *		5：部分成功
 *		6：推广方案生成失败
 *		7：推广方案入库失败
 *
 * @author wangkemiao@baidu.com
 */
fbs.eos.taskstatus = fbs.interFace({
	path : fbs.config.path.GET_EOS_TASKSTATUS
});

/**
 * 通知任务被取消（用户进行了“放弃方案”的描述）
 * @param {Object} param {
 *     type : 'useracct'/'planinfo'
 * }
 * @author wanghuijun@baidu.com
 */
fbs.eos.cancelScheme = fbs.interFace({
    path : fbs.config.path.MOD_EOS_CANCELSCHEME,
	
    necessaryParam : {
        type : 'useracct'
    }
});

/**
 * 获取用户的业务信息
 * @param {Object} param {
 *      vcode : '', //验证码
 *      words : '鲜花,冰箱' //行业关键词信息
 * }
 * @author wangkemiao@baidu.com wanghuijun
 */
fbs.eos.industryinfo = fbs.interFace({
    path : fbs.config.path.GET_EOS_INDUSTRYINFO,
    validate : fbs.validate.eos.inputWordCheck,
    necessaryParam : {
        vcode : '',
        words : '鲜花,冰箱'
    }
});

/**
 * 第一步进入第二步时，获取第二步关键词
 * @param {Object} param {
 *      vcode : '', //验证码
 *      industry : [] //已选择行业分类信息
 *      wreigon : '1, 2, 3' // 地域信息
 *      section : 0 // 选择的区间
 * }
 * @author wanghuijun@baidu.com
 */
fbs.eos.getInitRecmword = fbs.interFace({
    path : fbs.config.path.GET_EOS_INITRECMWORD,
    necessaryParam : {
        vcode : '',
        industry : [{
			secondtrade: '饮品',
			firstbusiness: '酒',
			secondbusiness: '水',
			wordproportion: 15
		}],
		wregion : '1, 2, 3',
		section : 0
    },
    parameterAdapter: function(param) {
        if(param.wregion){
            param.wregion = param.wregion.join(',');
        }
        return param;
    }
});

/**
 * 新的推词接口
 */
fbs.eos.getwords = fbs.interFace({
    path : 'GET/eos/recmword'
});
/**
 * 第一阶段第二步提交，用以用户日消费设定的最低阈值
 * @param {Object} param {
 * 		industry : [1,2,3] 调整过行业信息数据
 * }
 * @author wangkemiao@baidu.com
 */
fbs.eos.consumethreshold = fbs.interFace({
	path : fbs.config.path.GET_EOS_CONSUMETHRESHOLD,
	validate : fbs.validate.eos.consumethresholdCheck,
	necessaryParam : {
		industry : [1,2],
		wregion: '1,2,3'
	},
	parameterAdapter: function(param) {
		if(param.wregion){
			param.wregion = param.wregion.join(',');
		}
		return param;
	}
});

/**
 * 保存第一阶段的信息，即准备生成方案
 * @param {Object} param {
 * 		industry : [1,2,3] 调整过行业信息数据
 * 		wregion : '1,2,3',
 * 		section : 0  //从0-6分别代表对应的7个区间
 * }
 * @author wangkemiao@baidu.com
 */

fbs.eos.submittask = fbs.interFace({
	path : fbs.config.path.ADD_EOS_SUBMITTASK,
	//validate : fbs.validate.eos.submittask,
	necessaryParam : {
	    tasktype : ''
	},
	parameterAdapter: function(param) {
		if(param.wregion){
			param.wregion = param.wregion.join(',');
		}
		return param;
	}
});


///**
// * 推送当天注册的用户的url给后端
// * 尽量一次登录期间只发送一次，尽量少发
// * @author wangkemiao@baidu.com
// */
//
//fbs.eos.inittask = fbs.interFace({
//	path : fbs.config.path.MOD_EOS_INITTASK
//});

/**
 * 任务失败之后，用于重置任务状态
 * 调用该接口的情况有以下两种：
		1、	生成推广方案失败，重新开始第一步的时候，即状态从6置0
		2、	生成账户物料失败，重新开始第二步的时候，即状态从7置2
 *
 * @author wangkemiao@baidu.com
 */
fbs.eos.taskfailed = fbs.interFace({
	path: fbs.config.path.MOD_EOS_TASKFAILED,
	necessaryParam : {
		step : 1, //1或者2 第几步失败的
		type : 'useracct' //当前类型是快速新建账户还是计划
	}
});

/**
 * 获取第二阶段（查看账户方案）的物料信息
 *
 * @author wangkemiao@baidu.com
 */
fbs.eos.getTaskInfo = fbs.interFace({
	path: fbs.config.path.GET_EOS_TASKINFO
});


fbs.eos.getMoreRecmword = fbs.interFace({
    path : fbs.config.path.GET_EOS_MORERECMWORD,
    neccessaryParam : {
        startindex : 0,
        limit : 0,
        token : ''
    }
});

/**
 * 获取第二阶段展开Unit单元时需要的关键词等信息
 */
fbs.eos.getWordlistByUnit = fbs.interFace({
	path : fbs.config.path.GET_EOS_GETWORDLISTBYUNIT,
	neccessaryParam : {
		recmplanid : 1,
		recmunitid : 2
	}
});

/**
 * 第二阶段修改关键词出价
 */
fbs.eos.modBid = fbs.interFace({
	path : fbs.config.path.MOD_EOS_BID,
	validate: fbs.validate.eos.modKeywordBid,
	neccessaryParam : {
		recmwinfoid : [1, 2, 3],
		recmitems : {
			bid : 100
		} 
	}
});

/**
 * 第二阶段修改关键词匹配模式
 */
fbs.eos.modWmatch = fbs.interFace({
	path : fbs.config.path.MOD_EOS_WMATCH,
	neccessaryParam : {
		recmwinfoid : [1, 2, 3],
		recmitems : {
			wmatch : 15
		} 
	}
});


/**
 * 第二阶段删除关键词
 */
fbs.eos.delKeyword = fbs.interFace({
	path : fbs.config.path.DEL_EOS_WORD,
	neccessaryParam : {
		recmwinfoid : [1, 2, 3]
	}
});

/**
 * 第二阶段撤销删除关键词
 */
fbs.eos.retriveKeyword = fbs.interFace({
	path : fbs.config.path.ADD_EOS_RETRIVEWORD,
	neccessaryParam : {
		recmwinfoid : [1, 2, 3]
	}
});

/**
 * 第二阶段之后获取推广地域信息
 */
fbs.eos.getSchemeDetail = fbs.interFace({
	path : fbs.config.path.GET_EOS_SCHEMEDETAIL
});

/**
 * 第二阶段提交
 */
fbs.eos.adcreate = fbs.interFace({
	path : fbs.config.path.ADD_EOS_ADCREATE
});

/**
 * 第三阶段通知后台任务完成，状态置0
 */
fbs.eos.finishTask = fbs.interFace({
	path : fbs.config.path.MOD_EOS_TASKFINISHED,
	neccessaryParam : {
		type : 'useracct'
	}
});

/**
 * 是否需要继续添加创意（是否有待添加创意的单元）
 */
fbs.eos.needToAddIdeas = fbs.interFace({
	path : fbs.config.path.GET_EOS_NEEDADDIDEAS
});

/**
 * 修改计划名称
 */
fbs.eos.modPlan = fbs.interFace({
	path : fbs.config.path.MOD_EOS_PLAN,
	validate: fbs.validate.planName,
	neccessaryParam : {
		recmplanid : [0],
		planname : 'sd'
	},
	parameterAdapter: function(param) {
		param.recmitems = {
			planname: param.planname
		};
		delete param.planname;
		return param;
	}
});

/**
 * 修改单元名称
 */
fbs.eos.modUnit = fbs.interFace({
	path : fbs.config.path.MOD_EOS_UNIT,
	validate: fbs.validate.unitName,
	neccessaryParam : {
		recmunitid : [0],
		unitname : 'sd'
	},
	parameterAdapter: function(param) {
		param.recmitems = {
			unitname: param.unitname
		};
		delete param.unitname;
		return param;
	}
});

/**
 * 修改方案详情，包括预算、推广地域、时段
 */
fbs.eos.modSchemeDetail = fbs.interFace({
 	path : fbs.config.path.MOD_EOS_SCHEMEDETAIL,
	validate: fbs.validate.eos.schemedetail,
 	neccessaryParam : {
 		bgttype : 0,
 		wregion : "1,2",
 		plancyc : []
 	}
 });

/**
 * 获取landingpage URL推词，第一步中使用
 */
fbs.eos.getLandingPageWords = fbs.interFace({
    path: fbs.config.path.GET_EOS_LANDINGPAGE
});

/**
 * 创意写回
 */
fbs.eos.recmIdeasWirteBack = fbs.interFace({
    path: 'ADD/eos/recmideaswriteback'
});
