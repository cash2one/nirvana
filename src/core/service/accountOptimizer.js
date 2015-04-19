/**
 * fbs.ao
 * 账户优化相关接口
 * @author wanghuijun@baidu.com
 */

fbs = fbs || {};

fbs.ao = {};

/**
 * 获取Holmes状态
 * @author wanghuijun@baidu.com
 */
fbs.ao.getHolmesStatus = fbs.interFace({
	path : fbs.config.path.GET_AO_HOLMES
});

/**
 * 获取推广阶段及各指标的权限
 * @author wanghuijun@baidu.com
 */
fbs.ao.getStagesAndTargets = fbs.interFace({
	path : fbs.config.path.GET_AO_STAGES
});

/**
 * 获取账户优化摘要信息
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
fbs.ao.getRequset = fbs.interFace({
	path : fbs.config.path.GET_AO_REQUEST,
    /**
     * 该方法只是当前用于修复后端返回计划预算合理数据导致前端展现
     * 问题的一个临时修复方案，等后端修复了，这段逻辑也就可以删掉了
     * @authro wuhuiyao (wuhuiyao@baidu.com)
     * @date 2013-02-25
     */
	aspect: function(requestParam, response) {
        var data = response.data.aoabsdata || [];
        var optItem;
        var subOptItems;
        var filter = function(arr) {
            for (var j = arr.length; j --;) {
                // 删除计划预算合理的优化项
                if (arr[j] && arr[j].bgtstatus == 1) {
                    arr.splice(j, 1);
                }
            }
        };

        for (var i = data.length; i --;) {
            optItem = data[i];
            // 过滤掉后端返回计划预算合理数据导致前端展现分页无法呈现问题
            if (optItem.opttype == 2 && optItem.hasproblem) {
                subOptItems = optItem.result;
                // 过滤掉计划预算预算合理的优化项
                filter(subOptItems);
                if (subOptItems.length === 0) {
                    // 如果优化项有问题数量为空，将Hasproblem重置为0
                    optItem.hasproblem = 0;
                }
            }
        }
    },
	necessaryParam : {
		level : 'useracct',
		signature : 'xxx',
		command : 'start',
		opttype : [1, 2]
	}
});

/**
 * 获取指标的总计或平均值
 * @param {Object} param {
 * 		level : 'useracct', // 层级
 * 		condition : {
 * 			planid : [planid1, planid2],       // 计划列表，没有则不传
 * 			unitid : [unitid1, unitid2],       // 单元列表，没有则不传
 * 			winfoid : [winfoid1, winfoid2],    // 关键词列表，没有则不传
 * 			ideaid : [ideaid1, ideaid2],       // 创意列表，没有则不传
 * 			folderid : [folderid1, folderid2]  // 关键词文件夹列表，没有则不传
 * 		}, // 层级
 * 		targets : ['paysum', 'shows'], //
 * 		starttime : 'YYYY-MM-DD', // 开始时间
 * 		endtime : 'YYYY-MM-DD', // 开始时间
 * 		compstarttime : 'YYYY-MM-DD', // 对比时间段的开始时间，没有则不填
 * 		compendtime : 'YYYY-MM-DD' // 对比时间段的结束时间，没有则不填
 * }
 * @author wanghuijun@baidu.com
 */
fbs.ao.getTargetsSum = fbs.interFace({
	path : fbs.config.path.GET_AO_TARGETSSUM,
	
	necessaryParam : {
		level     : 'useracct',
		condition : {},
		targets   : ['paysum', 'shows']
	}
});

/**
 * 获取高消费、高点击、高展现词
 * @param {Object} param {
 * 		level : 'useracct' // 层级
 * }
 * @author zhouyu01@baidu.com
 */
fbs.ao.getTopWords = fbs.interFace({
	path : fbs.config.path.GET_AO_TOPWORDS, 
	
	necessaryParam : {
		level : 'useracct'
	}
});

/**
 * 获取高消费、高点击、高展现词阈值
 * @param {Object} param {
 * 		level : 'useracct' // 层级
 * }
 * @author zhouyu01@baidu.com
 */
fbs.ao.getCustom = fbs.interFace({
	path : fbs.config.path.GET_AO_CUSTOM, 
	
	necessaryParam : {
		level : 'useracct'
	}
});


/**
 * 修改高消费、高点击、高展现词阈值
 * @param {Object} param {
 * 		level : 'useracct', // 层级
 * 		value : 50		//阈值
 * }
 * @author zhouyu01@baidu.com
 */
fbs.ao.modCustom = fbs.interFace({
	path : fbs.config.path.MOD_AO_CUSTOM, 
	
	validate: fbs.validate.modCustom,
	
	necessaryParam : {
		level : 'useracct',
		value : 50
	}
});


/**
 * 获取主动提示区域的展开及永久收起状态
 * @author zhouyu01@baidu.com
 */
fbs.ao.getAreaHide = fbs.interFace({
	path : fbs.config.path.GET_AO_AREAHIDE 
});


/**
 * 修改主动提示区域的展开及永久收起状态
 * @param {Object} param {
 * 		value : 0 // 0表示展开，1表示永久收起
 * }
 * @author zhouyu01@baidu.com
 */
fbs.ao.modAreaHide = fbs.interFace({
	path : fbs.config.path.MOD_AO_AREAHIDE, 
	
	necessaryParam : {
		value : 0
	}
});

/**
 * 获取用户未保存的监控文件夹列表
 * @author zhouyu01@baidu.com
 */
fbs.ao.getUnselectedFolders = fbs.interFace({
	path : fbs.config.path.GET_AO_UNSELECTEDFOLDERS
});

/**
 * 修改用户未保存的监控文件夹列表
 * @param {Object} param {
 * 		folderid : [12,34,56] // 未保存的监控文件夹列表
 * }
 * @author zhouyu01@baidu.com
 */
fbs.ao.modUnselectedFolders = fbs.interFace({
	path : fbs.config.path.MOD_AO_UNSELECTEDFOLDERS,
	
	necessaryParam : {
		folderid : [12,34,56]
	}
});

/************************************* 以下是优化详情的接口 *****************************************/

/**
 * 不连通比例过高详情
 * @param {Object} param {
 * 		level : 'useracct', // 层级
 * 		condition : {
 * 			planid : [planid1, planid2],       // 计划列表，没有则不传
 * 			unitid : [unitid1, unitid2],       // 单元列表，没有则不传
 * 			winfoid : [winfoid1, winfoid2],    // 关键词列表，没有则不传
 * 			ideaid : [ideaid1, ideaid2],       // 创意列表，没有则不传
 * 			folderid : [folderid1, folderid2]  // 关键词文件夹列表，没有则不传
 * 		}, // 层级
 * 		startindex : 0, // 开始下标
 * 		endindex : 9 // 结束下标
 * }
 * @author wanghuijun@baidu.com
 */
fbs.ao.getDisconnectrate = fbs.interFace({
	path : fbs.config.path.GET_AO_DISCONNECTRATE,
	
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9
	}
});

/**
 * 连通速度较慢详情
 * @author wanghuijun@baidu.com
 */
fbs.ao.getLoadtime = fbs.interFace({
	path : fbs.config.path.GET_AO_LOADTIME,
	
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9
	}
});

/**
 * 待激活关键词ids
 */
fbs.ao.getWordDeactiveWinfoids = fbs.interFace({
	path : fbs.config.path.GET_AO_WORDDEACTIVEWINFOIDS,
	
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9
	}
});

/**
 * 暂停推广关键词ids
 */
fbs.ao.getWordPauseWinfoids = fbs.interFace({
	path : fbs.config.path.GET_AO_WORDPAUSEWINFOIDS,
	
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
fbs.ao.getUnitPauseUnitids = fbs.interFace({
	path : fbs.config.path.GET_AO_UNITPAUSEUNITIDS,
	
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
fbs.ao.getPlanPausePlanids = fbs.interFace({
	path : fbs.config.path.GET_AO_PLANPAUSEPLANIDS,
	
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9
	}
});

/**
 * 左侧首屏出价详情
 * @author wangdalu@baidu.com
 */
fbs.ao.getBidStim = fbs.interFace({
	path : fbs.config.path.GET_AO_BIDSTIM,
	
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9
	}
});

/**
 * 关键词待激活
 * @author wangdalu@baidu.com
 */
fbs.ao.getWordActive = fbs.interFace({
	path : fbs.config.path.GET_AO_WORDACTIVE,
	
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9
	}
});

/**
 * 关键词搜索无效
 * @author wangdalu@baidu.com
 */
fbs.ao.getWordSearchInvalid = fbs.interFace({
	path : fbs.config.path.GET_AO_WORDSEARCHINVALID,
	
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9
	}
});

/**
 * 关键词不宜推广
 * @author wangdalu@baidu.com
 */
fbs.ao.getWordBad = fbs.interFace({
	path : fbs.config.path.GET_AO_WORDBAD,
	
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9
	}
});

/**
 * 关键词暂停推广
 * @author wangdalu@baidu.com
 */
fbs.ao.getWordPause = fbs.interFace({
	path : fbs.config.path.GET_AO_WORDPAUSE,
	
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9
	}
});

/**
 * 单元暂停推广
 * @author wangdalu@baidu.com
 */
fbs.ao.getUnitPause = fbs.interFace({
	path : fbs.config.path.GET_AO_UNITPAUSE,
	
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9
	}
});

/**
 * 计划暂停推广
 * @author wangdalu@baidu.com
 */
fbs.ao.getPlanPause = fbs.interFace({
	path : fbs.config.path.GET_AO_PLANPAUSE,
	
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9
	}
});

/**
 * 关键词检索量过低
 * @author wangdalu@baidu.com
 */
fbs.ao.getWordPvTooLow = fbs.interFace({
	path : fbs.config.path.GET_AO_WORDPVTOOLOW,
	
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9
	}
});


/**
 * 关键词跳出率较高详情
 * @author wangdalu@baidu.com
 */
fbs.ao.getWordBounce = fbs.interFace({
	path : fbs.config.path.GET_AO_WORDBOUNCE,
	
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9
	}
});

/**
 * 创意跳出率较高详情
 * @author wangdalu@baidu.com
 */
fbs.ao.getIdeaBounce = fbs.interFace({
	path : fbs.config.path.GET_AO_IDEABOUNCE,
	
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9
	}
});

/**
 * 账户优化子项详情，关键词质量度过低无法获取稳定的左侧展现资格
 * @param {Object} param {
 * 		level : 'useracct',  // 层级
 * 		condition : {
 * 			planid : [planid1, planid2],       // 计划列表，没有则不传
 * 			unitid : [unitid1, unitid2],       // 单元列表，没有则不传
 * 			winfoid : [winfoid1, winfoid2],    // 关键词列表，没有则不传
 * 			ideaid : [ideaid1, ideaid2],       // 创意列表，没有则不传
 * 			folderid : [folderid1, folderid2]  // 关键词文件夹列表，没有则不传
 * 		}, //层级
 * 		startindex : 0,
 * 		endindex : 49  //接口文档写的49
 * }
 * @author LeoWang(wangkemiao@baidu.com)
 */
fbs.ao.showQDetail = fbs.interFace({
	path : fbs.config.path.GET_AO_SHOWQDETAIL,
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9  
	}
});

/**
 * 账户优化子项详情，关键词由于出价过低在左侧首屏展现的占比较小
 * @param {Object} param {
 * 		level:”useracct”
 *   	condition: {
 * 			planid:[planid1,planid2], // 计划列表，没有则不传
 * 			unitid:[unitid1,unitid2], // 单元列表，没有则不传
 * 			winfoid:[winfoid1,winfoid2], // 关键词列表，没有则不传
 * 			ideaid:[ideaid1,ideaid2], // 创意列表，没有则不传
 * 			folderid:[folderid1,folderid2], // 关键词文件夹列表，没有则不传
 * 		},
 * 		startindex:0,
 * 		endindex:49
 * }
 * @author LeoWang(wangkemiao@baidu.com)
 */
fbs.ao.leftScreenDetail = fbs.interFace({
	path : fbs.config.path.GET_AO_LEFTSCREENDETAIL,
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9
	}
});

/**
 * 账户优化子项详情，关键词由于出价过低在左侧首位展现的占比较小
 * * @param {Object} param {
 * 		level:”useracct”
 *   	condition: {
 * 			planid:[planid1,planid2], // 计划列表，没有则不传
 * 			unitid:[unitid1,unitid2], // 单元列表，没有则不传
 * 			winfoid:[winfoid1,winfoid2], // 关键词列表，没有则不传
 * 			ideaid:[ideaid1,ideaid2], // 创意列表，没有则不传
 * 			folderid:[folderid1,folderid2], // 关键词文件夹列表，没有则不传
 * 		},
 * 		startindex:0,
 * 		endindex:49
 * }
 * @author LeoWang(wangkemiao@baidu.com)
 */
fbs.ao.leftTopDetail = fbs.interFace({
	path : fbs.config.path.GET_AO_LEFTTOPDETAIL,
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9
	}
});

/**
 * 账户优化子项详情，创意待激活详情
 * * @param {Object} param {
 * 		level:”useracct”
 *   	condition: {
 * 			planid:[planid1,planid2], // 计划列表，没有则不传
 * 			unitid:[unitid1,unitid2], // 单元列表，没有则不传
 * 			winfoid:[winfoid1,winfoid2], // 关键词列表，没有则不传
 * 			ideaid:[ideaid1,ideaid2], // 创意列表，没有则不传
 * 			folderid:[folderid1,folderid2], // 关键词文件夹列表，没有则不传
 * 		},
 * 		startindex:0,
 * 		endindex:49
 * }
 * @author LeoWang(wangkemiao@baidu.com)
 */
fbs.ao.ideaActiveDetail = fbs.interFace({
	path : fbs.config.path.GET_AO_IDEAACTIVEDETAIL,
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9
	}
});

/**
 * 账户优化子项详情，创意不宜推广详情
 * * @param {Object} param {
 * 		level:”useracct”
 *   	condition: {
 * 			planid:[planid1,planid2], // 计划列表，没有则不传
 * 			unitid:[unitid1,unitid2], // 单元列表，没有则不传
 * 			winfoid:[winfoid1,winfoid2], // 关键词列表，没有则不传
 * 			ideaid:[ideaid1,ideaid2], // 创意列表，没有则不传
 * 			folderid:[folderid1,folderid2], // 关键词文件夹列表，没有则不传
 * 		},
 * 		startindex:0,
 * 		endindex:49
 * }
 * @author LeoWang(wangkemiao@baidu.com)
 */
fbs.ao.ideaRejectedDetail = fbs.interFace({
	path : fbs.config.path.GET_AO_IDEAREJECTEDDETAIL,
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9
	}
});

/**
 * 账户优化子项详情，创意暂停推广详情
 * * @param {Object} param {
 * 		level:”useracct”
 *   	condition: {
 * 			planid:[planid1,planid2], // 计划列表，没有则不传
 * 			unitid:[unitid1,unitid2], // 单元列表，没有则不传
 * 			winfoid:[winfoid1,winfoid2], // 关键词列表，没有则不传
 * 			ideaid:[ideaid1,ideaid2], // 创意列表，没有则不传
 * 			folderid:[folderid1,folderid2], // 关键词文件夹列表，没有则不传
 * 		},
 * 		startindex:0,
 * 		endindex:49
 * }
 * @author LeoWang(wangkemiao@baidu.com)
 */
fbs.ao.ideaPauseDetail = fbs.interFace({
	path : fbs.config.path.GET_AO_IDEAPAUSEDETAIL,
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9
	}
});

/**
 * 待激活创意ids
 * @author LeoWang(wangkemiao@baidu.com)
 */
fbs.ao.ideaActiveDetailIdeaIds = fbs.interFace({
	path : fbs.config.path.GET_AO_IDEAACTIVEDETAILIDEAIDS,
	
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9
	}
});
/**
 * 暂停创意ids
 * @author LeoWang(wangkemiao@baidu.com)
 */
fbs.ao.ideaPauseDetailIdeaIds = fbs.interFace({
	path : fbs.config.path.GET_AO_IDEAPAUSEDETAILIDEAIDS,
	
	necessaryParam : {
		level : 'useracct',
		condition : {},
		startindex : 0,
		endindex : 9
	}
});

/**
 * 获取左侧首屏/首位展现概率阈值
 * @author LeoWang(wangkemiao@baidu.com)
 */
fbs.ao.getThresholdValue = fbs.interFace({
	path : fbs.config.path.GET_AO_GETTHRESHOLDVALUE,
	necessaryParam : {}
});

/**
 * 修改左侧首屏/首位展现概率阈值
 * @author LeoWang(wangkemiao@baidu.com)
 */
fbs.ao.modThresholdValue = fbs.interFace({
	path : fbs.config.path.MOD_AO_MODTHRESHOLDVALUE,
	necessaryParam : {
		leftscreen : 60,
		lefttop : 80
	}
});
/**
 * 获取手动版时段详情接口
 * @author Wu Huiyao (wuhuiyao@baidu.com)
 */
fbs.ao.getRecmScheduleDetail = fbs.requester({
    path: 'GET/ao/sgtcycdetail'
});