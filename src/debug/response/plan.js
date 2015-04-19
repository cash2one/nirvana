Requester.debug.ADD_plan = function() {
	var rel = new Requester.debug.returnTpl();

	rel.data = {
		planid : 12
	}
	return rel;
};
/**
 * 删除计划
 */
Requester.debug.DEL_plan = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	if (confirm("LONG_PROCESS_ERROR?")) {
		rel.status = 400;
		rel.errorCode = {
			code : 407
		}
	} else {
		rel.status = 200;
	}
	// 模拟数据请求延迟
	rel.timeout = 1000;
	return rel;
};
Requester.debug.MOD_plan = function(level, param) {
	var rel = new Requester.debug.returnTpl();

	/*
	 * if(param.alertLevel == 1){ rel.error = {}; rel.status = 300; } if
	 * (confirm("LONG_PROCESS_ERROR?")){ rel.status = 400; rel.errorCode = {
	 * code:407 } }else{
	 */
	rel.status = 200;
	rel.data = {};
	var pid;
	var pausestat = param.items.pausestat;
	var planstate = param.items.pausestat == 0 ? 0 : 2;
	for (var i = 0, l = param.planid.length; i < l; i++) {
		pid = param.planid[i];
		rel.data[pid] = {
			"planid" : pid,
			"pausestat" : pausestat,
			"planstat" : planstate
		}
	}
	// }
    // 模拟数据请求延迟
	rel.timeout = 1000;
	return rel;

};

/**
 * 批量修改计划预算的模拟接口
 * @author wuhuiyao@baidu.com
 * @date 2013-5-20
 */
Requester.debug.MOD_batchplans = function (level, param) {
    var rel = new Requester.debug.returnTpl();

    rel.status = 200;
    rel.data = {};

    // 模拟数据请求延迟
    rel.timeout = 1000;
    return rel;
};

/**
 * 计划预算分析
 */
Requester.debug.AO_plan_bdana = function() {
	var rel = new Requester.debug.returnTpl();

	rel.data = [
			2, // status
			150, // advice
			700, // lostclick
			["67.5|55.11", "66.5|55.11", "67|55.11", "72|58.32", "75.5|60.43",
					"97|70.97", "116|77.96", "116.8|78.15", "120.3|78.57",
					"173.1|78.57", "120.3|78.57"]];
	return rel;
};
/**
 * 计划层级预算详情
 */
Requester.debug.GET_ao_planbudgetdetail = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.errorCode = 0;
	rel.data = {
		totalnum : param.condition.planid.length,
		returnnum : 100,
		timestamp : '20110101010',
		listData : [{ // 用来存储账户层级预算数据信息
			bgttype : 1, // 预算类型
			daybgtdata : { // 存储日预算基础数据与分析数据
				daybgtvalue : 666.66, // 值
				dayanalyze : { // 日预算分析数据
					tip : 3,
					// 0 不提示 hasproblem = 0, priority = 0
					// 1 预算合理 hasproblem = 0, priority = 0
					// 2 日预算风险 hasproblem = 1, priority = 1
					// 3 需提供日预算建议 hasproblem = 1 , priority = 2
					// 4 需提供周预算建议 hasproblem = 1 , priority = 2
					suggestbudget : 1000,// 建议预算点
					lostclicks : 100,// 损失点击数
                    retripercent: 23, // 可挽回点击数,为0时候不展现额外的话术,升级预算话术新增 2013.3.19 by Huiyao
					startpoint : [0, 0], // 存放起点
					endpoint : [1000, 1000], // 存放终点
					budgetpoint : [50, 50], // 预算点
					keypoints : [ // 存放七个关键点
					[767.5, 55.11], [772, 58.32], [775.5, 60.43], [797, 70.97],
							[816, 77.96], [816, 77.96], [873.1, 78.57]],
					incitermsg : [ // 存放同行激励信息
					['02:05:00', 7500, '0'], // 起点
							['06:55:00', 24900, '240'], // 自身点
							['09:00:02', 42400, '360'], // 优质客户点
							['23:33:00', 107800, '0'] // 终点
					],
					show_encourage : 1, // 是否提示同行激励
					model_num : 5,
					words : '你好/你坏', // 核心关键词面值字面串，以/分隔
					wordids : [1, 2]
					// 核心关键词id值
				}
			},
			// weekbgtdata : { weekbgtvalue : 333.33 }
			weekbgtdata : null
		}]

	}

	// rel.data =
	// {"timestamp":1315982065000,"listData":[{"bgttype":0,"daybgtdata":null,"weekbgtdata":null}],"totalnum":0,"returnnum":0,"signature":"419136226857159471","aostatus":2}
	return rel;
};
