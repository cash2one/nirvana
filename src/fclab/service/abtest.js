/**
 * fbs.abtest相关接口
 * @author zhouyu01@baidu.com
 */
fbs = fbs || {};

fbs.abtest = {};

/**
 * 获取ABTEST实验数据汇总
 */
fbs.abtest.getTotal = fbs.interFace({
	path: "lab/GET/abtest/total"
});

/**
 * 获取ABTEST实验列表
 */
fbs.abtest.getList =  fbs.interFace({
	path: "lab/GET/abtest/list",
	
	necessaryParam: {
		labstat: 0, // 全部/未开始/进行中/已完成( 0 / 1 / 2 / 3)
		pageno: 0 // 当前页（从0开始）
	},
	
	parameterAdapter: function(param) {
        param.limit = param.limit || 5;    // 分页每页最大数量，默认5个
        return param;
    }
});

/**
 * 获取一个实验的数据信息
 */
fbs.abtest.getLabInfo =  fbs.interFace({
	path: "lab/GET/abtest/labinfo",
	
	necessaryParam: {
		labid: 10  
	}
});

/**
 * 检查实验名称
 */
fbs.abtest.checkLabName = fbs.interFace({
	path: "lab/CHECK/labname",
	
	necessaryParam: {
		"labname":"test123"
	}
});

/**
 * 检查实验对象是否可用
 */
fbs.abtest.checkLabWords = fbs.interFace({
	path: "lab/CHECK/labword",
	
	necessaryParam: {
		"winfoidlist":[12345,67890]
	}
});

/**
 * 新建实验
 */
fbs.abtest.addAbtest= fbs.interFace({
	path: "lab/ADD/abtest",
	
	necessaryParam: {
		"labname": "",
		"duration": 3, //持续时间，默认3周，后台传的单位为天，换算成周以后才能传入该action
		"ratio": 50, //实验流量比例,20%的话，为20，默认50%
		"labtype": 1, //实验类型，1：出价，默认为出价
		"focus": 1, //关注指标,1,2,4(点击，展现，转化),位表示那些关注那些指标，默认为点击
		"labstat": 1, //实验状态,2(立即开始)，1(保存未开始)
		"abwordlist": [{"winfoid":123456,"bid":30.46}]//实验对象
	},
	parameterAdapter: function(param) {
		param.duration = param.duration * 7;
		return param;
	}
});

/**
 * 修改实验
 */
fbs.abtest.modAbtest= fbs.interFace({
	path: "lab/MOD/abtest",
	
	necessaryParam: {
		"labid":12,
		"items": {
			//"labname": "",
			//"duration": 3, //持续时间，默认3周，后台传的单位为天，换算成周以后才能传入该action
			//"ratio": 50, //实验流量比例,20%的话，为20，默认50%
			//"labtype": 1, //实验类型，1：出价，默认为出价
			//"focus": 1, //关注指标,1,2,4(点击，展现，转化),位表示那些关注那些指标，默认为点击
			//"labstat": 1, //实验状态,2(立即开始)，1(保存未开始)
			//"abwordlist": [{
			//	"winfoid": 123456,
			//	"bid": 30.46
			//}//实验对象
		}
	},
	parameterAdapter: function(param) {
		if(param.items.duration){
			param.items.duration = param.items.duration * 7;
		}
		
		return param;
	}
});

/**
 * 获取实验信息
 */
fbs.abtest.getTestInfo= fbs.interFace({
	path: "lab/GET/abtest/allinfo",
	
	necessaryParam: {
		"labid": 123
	},
	parameterAdapter: function(param) {
		param.labid = +param.labid;
		
		return param;
	}
});

/**
 * 删除实验
 */
fbs.abtest.delAbtest= fbs.interFace({
	path: "lab/DEL/abtest",
	
	necessaryParam: {
		"labid": [1,2,3]
	}
});
/**
 * 获取实验中各种状态的关键词个数
 */
fbs.abtest.getTestMtlCnt= fbs.interFace({
	path: "lab/GET/abtest/mtlcnt",
	
	necessaryParam: {
		"labid": 1
	}
});

/**
 * 获取各状态下的物料列表
 */
fbs.abtest.getTestMtlList= fbs.interFace({
	path: "lab/GET/abtest/labwordinfo",
	
	necessaryParam: {
		stat: 1,// 全部0/推荐实验组1/推荐对照组2/继续观察3/调整完成4
		labid: 1,// labid值
		pageno: 0 // 当前页（从0开始）
	},
	
	parameterAdapter: function(param) {
        param.limit = param.limit || 5;    // 分页每页最大数量，默认5个
        return param;
    }
});

/**
 * 应用实验组/对照组出价
 */
fbs.abtest.modTestMtlStat= fbs.interFace({
	path: "lab/MOD/abtest/labwordinfo",
	
	necessaryParam: {
		status: 4, //4 / 5 // 应用实验组/应用对照组
		labwinfoid:12,
		labid: 1 // labid值
	}
});
