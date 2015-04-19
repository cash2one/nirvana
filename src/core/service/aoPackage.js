/**
 * fbs.nikon
 * 凤巢智能优化之老户优化相关接口
 * @author wanghuijun@baidu.com
 * date: $Date: 2012/04/20 $
 */

fbs = fbs || {};

fbs.nikon = {};

/**
 * 获取概况页优化包状态
 * @param {Object} param {
 * 		reqid : 'xx' // 请求id，用于标识同一批次的轮询请求，初始请求发''
 * }
 * @author wanghuijun@baidu.com
 */
fbs.nikon.getPackageStatus = fbs.interFace({
	path : fbs.config.path.GET_NIKON_PACKAGESTATUS,
	
	necessaryParam : {
        reqid : ''
    }
});

/**
 * 获取优化包的摘要信息
 * @author LeoWang(wangkemiao@baidu.com) 
 */
fbs.nikon.getPackageAbstract = fbs.interFace({
	path : fbs.config.path.GET_NIKON_ABSTRACT,
	necessaryParam : {
		//pkgids : [1, 2, 3],
		//opttypeids : [1, 2, 3]		//pkgids和opttypeids二者必须得有一个，opttypeids优先于pkgids
		command : 'start',   //start or query
		level : 'useracct'	//本次应该只有useracct这个层级
	}
});


/**
 * 优化包的摘要应用
 * @author LeoWang(wangkemiao@baidu.com) 
 */
fbs.nikon.applyAbsItem = fbs.interFace({
	path : fbs.config.path.MOD_NIKON_APPLYALL,
	necessaryParam : {
		applyreqitems : [1, 2, 3]
	}
});

/**
 * 优化包的摘要应用之后状态查询
 * @author LeoWang(wangkemiao@baidu.com) 
 */
fbs.nikon.getApplyResult = fbs.interFace({
	path : fbs.config.path.GET_NIKON_APPLYRESULT,
	necessaryParam : {
		applyToken : '',
		applyreqitems : []
	}
})



/**
 * 获取概况页优化包状态
 * @param {Object} param {
 *      level : 'useracct' // 层级
 *      opttypeid : 1 // 层级
 *      condition : {  // 查询条件，可选
 *          startindex : '0'
 *          endindex : '50'
 *      }
 * }
 * @author wanghuijun@baidu.com
 */
fbs.nikon.getDetail = fbs.interFace({
    path : fbs.config.path.GET_NIKON_DETAIL,
    necessaryParam : {
		level : 'useracct',
        opttypeid : 1
    }
});

/**
 * 获取预算建议详情
 * @param {Object} param {
 *      level : 'useracct' // 层级
 *      opttypeid : 1 // 层级
 *      condition : {  // 查询条件，可选
 *          planid : '111',
 *          decrtype : 'clks' // 效果恢复包必选
 *      }
 * }
 * @author wanghuijun@baidu.com
 */
fbs.nikon.getDetailBudget = fbs.interFace({
    path : fbs.config.path.GET_NIKON_DETAILBUDGET,
    necessaryParam : {
        level : 'useracct',
        opttypeid : 1
    }
});

/**
 * 优化包的摘要获取flash数据
 * @param {Object} param {
 *      pkgid : 1 // 包id
 *      condition : {  // 查询条件，可选
 *          biztype:”0”  // 扩大商机包，0表示正常状态 1表示效果检验状态；
 * 			client:”0” // 如果不填，默认为0
 *      }
 * }
 * 
 * @author LeoWang(wangkemiao@baidu.com) 
 */
fbs.nikon.getFlashData = fbs.interFace({
	path : fbs.config.path.GET_NIKON_FLASHDATA,
	necessaryParam : {
		pkgid : 1
	}
});

/**
 * 判断当前是否是效果检验状态
 * @param {Object} param {
 *      condition : {  // 查询条件，可选
 * 			client:”web” // 如果不填，默认为
 *      }
 * }
 */
fbs.nikon.bizEffcheck = fbs.interFace({
	path : fbs.config.path.GET_NIKON_BIZEFFCHECK
});


/**
 * 提词优化项详情中添词接口
 * @param {Object} param {
 *      items : [{
 *          idx:0 //添词序号
 *          planid:111  // 如果是尚不存在的计划，填0
 *          unitid:111  //如果是尚不存在的单元，填0
 *          planname:”xxx”  // 如果是尚不存的计划，需要填写
 *          unitname:”xxx”  // 如果是尚不存的单元，需要填写
 *          showword:”xxx”
 *          wordid:2324324
 *          bid:3.5
 *          wmatch:15
 *      }]
 * }
 * 
 * @author wanghuijun
 */
fbs.nikon.addWords = fbs.interFace({
    path : fbs.config.path.ADD_NIKON_WORDS,
    necessaryParam : {
        items : [],
        sourceType: 'NIKON_WEB_BASE',
        extra: {
            opttypeid: 1
        }
    },
    validate: fbs.validate.nikon.addWords
});
/**
 * 移动优化包制作时新增的提词优化项详情添词接口，主要增加了推荐创意参数和后台逻辑
 */
fbs.nikon.addmaterial = fbs.interFace({
    path : 'ADD/nikon/material',
    necessaryParam : {
        items : []
    },
    validate: fbs.validate.nikon.addWords
});
/**
 * 通过扩大商机包修改了账户预算之后的提示接口
 * @param {Object} param {
 *      bgttype:1  // 1日预算 2周预算
 *      suggestbudget:200.00
 *      oldvalue:100.00
 *      newvalue:150.00
 * }
 * 
 * @author wanghuijun
 */
fbs.nikon.ModUserBudget = fbs.interFace({
    path : fbs.config.path.MOD_NIKON_USERBUDGET,
    necessaryParam: {
		bgttype: 1,
		suggestbudget: 200.00,
		oldvalue: 100.00,
		newvalue: 150.00
	}
});

/**
 * 获取重点词优化包的重点词优化详情的数据接口
 * @author Wu Huiyao(wuhuiyao@baidu.com) 
 */
fbs.nikon.getPackageCoreWordDetail = fbs.interFace({
    path : fbs.config.path.GET_NIKON_COREWORDDETAIL,
    necessaryParam : {
        wregion: -1 // 推广地域，-1表示使用默认地域
    }
});
///**
// * 获取优化包的权限的数据接口 暂时没用了，暂时去掉 by Huiyao 2013.4.9
// * @author Wu Huiyao(wuhuiyao@baidu.com)
// */
//fbs.nikon.getNikonPkgauth = fbs.interFace({
//    path: 'GET/nikon/pkgauth'
//});

fbs.nikon.getCoreWords = fbs.interFace({
	path : 'GET/nikon/coreword'
});
fbs.nikon.addCoreWords = fbs.interFace({
	path : 'ADD/nikon/coreword',
	necessaryParam : {
		winfoids : []
	}
});
fbs.nikon.delCoreWords = fbs.interFace({
	path : 'DEL/nikon/coreword',
	necessaryParam : {
		winfoids : []
	}
});
/**
 * 更新重点词优化包的重点词的接口
 * @author Wu Huiyao(wuhuiyao@baidu.com)
 */
fbs.nikon.updateCoreWords = fbs.interFace({
    path: 'MOD/nikon/updatecoreword'
});
/**
 * 生成重点词优化包的重点词的接口
 * @author Wu Huiyao(wuhuiyao@baidu.com) 
 */
/*fbs.nikon.generatePackageCoreWords = fbs.interFace({
    path : fbs.config.path.ADD_NIKON_GENERATECOREWORD,
    necessaryParam : {
    }
});*/
/**
 * 获取推荐重点词的接口
 * @author Wu Huiyao (wuhuiyao@baidu.com)
 */
fbs.nikon.getRecmdCorwords = fbs.interFace({
    path: 'GET/nikon/recmcoreword'
});

/**
 * 获取弹窗信息，轮询请求
 */
fbs.nikon.getPopupInfo = fbs.interFace({
	path : 'GET/nikon/popupinfo',
	necessaryParam : {
		pkgid : [],
		command : 'start/query' // 取值”start”或”query”，分别代表启动和查询
	}
});

/**
 * 获取账户同行指标信息
 * @author Wu Huiyao(wuhuiyao@baidu.com) 
 */
fbs.nikon.getPeerData = fbs.requester({
	path : 'GET/nikon/peerdata',
    noloading: true
});

/******************新版突降急救包*******************************/
/**
 * 修改突降急救包升级的点击量突降阈值
 * @author Wu Huiyao(wuhuiyao@baidu.com)
 */
fbs.nikon.setDecrThresholdValue = fbs.requester({
    path: 'MOD/nikon/decrcustom'
});
/**
 * 获取突降急救包升级的点击量突降阈值
 * @author Wu Huiyao(wuhuiyao@baidu.com)
 */
fbs.nikon.getDecrThresholdValue = fbs.requester({
    path: 'GET/nikon/decrcustom'
});
/**
 * 获取概况页要自动出的引导页信息
 * @author Wu Huiyao(wuhuiyao@baidu.com)
 */
fbs.nikon.getIntroduction = fbs.requester({
    path : 'GET/nikon/introduction',
    noloading: true
});
/**
 * 通知后端已经自动出过的引导页信息
 * @author Wu Huiyao(wuhuiyao@baidu.com)
 */
fbs.nikon.addIntroduction = fbs.requester({
    path : 'ADD/nikon/introduction',
    noloading: true
});
/*********** 行业旺季包新增接口 *****************/
fbs.nikon.getPeakTradeList = fbs.requester({
    path: 'GET/nikon/peaktradesinfo',
    noloading: true
});
/**
 * 通知后端用户打开过优化包请求接口，用于后端控制优化版提醒框是否需要再次出现
 */
fbs.nikon.addOpenAoPkgTimes = fbs.requester({
        path: 'ADD/nikon/viewBoxClickTimes',
        noloading: true
});