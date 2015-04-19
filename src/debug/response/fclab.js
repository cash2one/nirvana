/**
 * @author zhouyu01
 */

/**
 * 添加反馈建议
 */
Requester.debug.lab_ADD_advice = function(level, param) {
//	var rel = new Requester.debug.returnTpl();
	var rel = {
		"status" : 400,

		"errorCode" : {
			"code" : 180000
		}
	}

	return rel;
};

/**
 * 获取abtest数据统计信息
 * @param {Object} level
 * @param {Object} param
 */
Requester.debug.lab_GET_abtest_total = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		sort: {
			"all": 120,//全部实验
			"new": 24,//未开始
			"doing": 34,//试验中
			"done": 22//已完成
		},	
		allcnt: {
			"testcnt": 23,//当前试验数量
			"alltestcnt": 24,//累计实验数量
			"mtlcnt": 213, // 当前实验对象数量
			"allmtlcnt": 2134 // 累计实验对象数量
		}
	}

	return rel;
};
/**
 * 获取abtest实验数据
 * @param {Object} level
 * @param {Object} param
 */
Requester.debug.lab_GET_abtest_list = function(level, param, len) {
	var rel = new Requester.debug.returnTpl();
//	rel.status = 400;
	var maxLen = len || Math.floor(Math.random()*100)%6;
	var data = []
	for (var i = 0; i < maxLen; i++) {
		data[data.length] = {
			labid: 124+i,				//实验id
			labstat: Math.floor(Math.random()*100)%3 + 1,	//试验状态1 / 2 / 3  ：未开始/进行中/已完成
			labname: "实验test"+i,		//实验名称
			mtlcnt: 232,			//关键词数量
			labtype: 1,					//实验类型（出价为1 or URL（暂不支持））
			//持续时长（单位为天，一定是7的整数倍,大于等于1周小于等于8周）
			duration: (Math.floor(Math.random()*100)%8 + 1) * 7,
			efftime: "2012-12-11",		//生效时间
			passday: 12,				//已实验天数
			ratio: 20,					//流量分布
			focus: 2,					//关注指标,0,2,4(点击，展现，转化)
			show: 1223,					//实验组展现
			click: 20,					//实验组点击
			trans: 3,					//实验组转化
			pay: 50,					//实验组消费（元）
			oshow: 122,					//对照组展现
			oclick: 10,					//对照组点击
			otrans: 1,					//对照组转化
			opay: 20					//对照组消费
		}
	}
	rel.data = data;
	return rel;
};

/**
 * 获取一个实验的数据信息
 * @param {Object} level
 * @param {Object} param
 */
Requester.debug.lab_GET_abtest_labinfo = function(level, param) {
	return Requester.debug.lab_GET_abtest_list(level, param, 1);
};



/**
 * 检测实验名称
 */
Requester.debug.lab_CHECK_labname = function(level, param) {
//	var rel = new Requester.debug.returnTpl()
	var rel = {
		"status" : 200,

		"errorCode" : {
			"code" : 180020
		}
	}
//	rel.status = (Math.floor((Math.random()*100))%2 + 1) * 200;
//	console.log(rel);
	return rel;
};

/**
 * 检查实验对象是否可用
 */
Requester.debug.lab_CHECK_labword = function(level, param){
	//	var rel = new Requester.debug.returnTpl()
	var list = param.winfoidlist;
	var len = list.length;
	var upper = Math.floor(len / 2);
	var detail = {};
	var code = [180010, 180011, 180012];
	for (var i = 0; i < upper; i++) {
		var index = Math.floor(Math.random() * 100) % 3;
		detail[list[i]] = {
			"code": code[index]
		}
	}
	var rel = {
		"status": 300,
		
		"errorCode": {
			"code": 180028
		},
		
		"wordErrorDetail": detail
	}
	
	return rel;
};
/**
 * 新增实验
 */
Requester.debug.lab_ADD_abtest = function(level, param) {
//	var rel = new Requester.debug.returnTpl()
	var rel = {
		"data": null, //（返回值看前端需要什么data?)
		"status": 400, //200 ok  ,400 fail
		"errorCode": {
			"code": 180029
		},//,//存放跟实验有关参数错误
		"wordErrorDetail": //存放给加入实验词有关错误，前面是winfoid,新建实验时不用读取该值
		{
			12345: {
				"code": 180013,
				"message": null,
				"detail": null,
				"idx": 0
			},
			16345: {
				"code": 180011,
				"message": null,
				"detail": null,
				"idx": 0
			}
		
		}
	}
	return rel;
};

/**
 * 修改实验
 */
Requester.debug.lab_MOD_abtest = function(level, param) {
	return Requester.debug.lab_ADD_abtest(level, param);
};

/**
 * 获取实验信息
 */
Requester.debug.lab_GET_abtest_allinfo = function(level, param) {
	var rel = {
		"data": {
			"labid":123,
			"labname": "我的实验室",
			"duration": 5, //持续时间，默认3周，后台传的单位为天，换算成周以后才能传入该action
			"ratio": 70, //实验流量比例,20%的话，为20，默认50%
			"labtype": 1, //实验类型，1：出价，默认为出价
			"focus": 2, //关注指标,1,2,4(点击，展现，转化),位表示那些关注那些指标，默认为点击
			"labstat": 1, //实验状态,2(立即开始)，1(保存未开始)
			"abwordlist": []//实验对象
		},
		"status": 200, 
		"errorCode": null
	}
	return rel;
};


/**
 * 删除实验
 */
Requester.debug.lab_DEL_abtest = function(level, param) {
	var rel = {
		"data": null,
		"status": 200, 
		"errorCode": null
	}
	return rel;
};


/**
 * 获取实验中各种状态的关键词个数
 */
Requester.debug.lab_GET_abtest_mtlcnt = function(level, param) {
	var rel = {
		"data": [347, 12,23,34,344],//分别为 推荐实验组、推荐对照组、持续观察、 调整完成状态的物料个数
		"status": 200, 
		"errorCode": null
	}
	return rel;
};

/**
 * 获取各状态下的物料列表
 */
Requester.debug.lab_GET_abtest_labwordinfo = function(level, param) {
	var list = [];
	for (var i = 0; i < 5; i++) {
		list[i] = {
			labwinfoid: 1212 + i, // 唯一id
			labid: param.labid, // labid
			winfoid: 2121 + i, // 关键词id
			showword:"232关键词" + i,
			stat: param.stat, // 状态 // 1/2/3/4 - 推荐实验组/推荐对照组/继续观察/调整完成
			//只有stat为4时需要用到status字段，此时status字段值为4、5、6,7。status的1、2、3对应stat的1、2、3
			status: 7, //0 / 1 / 2 / 3 / 4 / 5 / 6/7, 实验中/新增保存/完成实验/停止实验/应用实验组/应用对照组/推广管理设置/关键词被删除
			degree: 99.70, // 置信度具体数值
			level: 1, // 置信度分档
			suggestion: "我是结论", // 结论分析
			bid: 21.2, // 出价
			obid: 21.2, // 参加实验室出价
			show: 32,
			oshow: 32,
			
			click: 1,
			oclick: 1,
			
			pay: 20,
			opay: 20,
			
			trans: 1,
			otrans: 1,
			
			avgprice: 121,
			oavgprice: 121,
			
			clickrate: "21%",
			oclickrate: "21%"
		};
	}
	var rel = {
		"data": list,
		"sum": {
			show: 1223,					//实验组展现
			click: 20,					//实验组点击
			trans: 3,					//实验组转化
			pay: 50,					//实验组消费（元）
			oshow: 122,					//对照组展现
			oclick: 10,					//对照组点击
			otrans: 1,					//对照组转化
			opay: 20					//对照组消费
		},
		"status": 200, 
		"errorCode": null
	}
	return rel;
};


/**
 * 应用实验组/对照组出价
 */
Requester.debug.lab_MOD_abtest_labwordinfo = function(level, param) {
	var rel = {
		"data": null,
		"status": 200, 
		"errorCode": null
	}
	return rel;
};

/**
 * cpa响应
 */
// 获取计划列表
Requester.debug.lab_GET_cpa_planlist = function(level, param) {
	var rel = {
		data: {
			1: [],
			2: [],
			4: [],
			16: [],
			8: []
		},
		status: 200,
		errorCode: null
	};
	var tempIds  = [1, 2, 4, 8];
	for(var i = 0; i < 40; i ++) {
		var rand = Math.random() * 4 | 0;
		rel.data[tempIds[rand]].push({
		// rel.data[1].push({
			planid: i, // 计划id
			planname: '计划名称~%^&*()<><>....<span>', // 计划名称
			cpa: i * 2.43, // 建议cpa
			mincpa: i * 2.21 // 最低cpa
		});
	}
	// delete rel.data[16];
	return rel;
	// 返回为空的情况
	// return {
	// 	data: {},
	// 	status: 200,
	// 	errorCode: null
	// };
};

// 新建cpa的响应
Requester.debug.lab_ADD_cpa = function(level, param) {
	// console.log(param);
	// 此处的响应比较特殊
	return param.force == 0
		// 为0即为强制删除ab中的关键词
		? {
			status: 200,
			errorCode: null
		}
		// 为1提示用户是否删除
		: {
			status: 400,
			errorCode: {
				code: 181000,
				message: '21',
				detail: null
			}
		};
};

/**
 * 获取cpa计划列表
 */
Requester.debug.lab_GET_cpainfolist = function(level, param) {
	var rel = {
		data: {
			total: 43,
			cpalist: []
		},
		status: 200,
		errorCode: null
	};
	// 构造 data.cpalist，返回
	for(var i = 0, len = 10; i < len; i ++) {
		rel.data.cpalist.push({
			labid: i + 1,
			planname: '<span>09~!@#.,<>\';][[</spa,<>\';][[</s,<>\';][[</sn>[]',
			type: [1, 2, 4, 8, 16][(5 * Math.random() | 0)],
			cpa: [null, 21.23 * (i + 1) / 2][(2 * Math.random() | 0)],
			isab: (2 * Math.random() | 0),
			addtime: '2013-01-' + (i * 2) + ' 18:00',
			planstatus: (4 * Math.random() | 0),
			// cpastatus: (2 * Math.random() | 0),
			cpastatus: 1,
			// 最小cpa
			mincpa: 23.33,
			// 建议cpa
			suggestcpa: 12.12
		});
	}
	return rel;
};

/**
 * 修改cpa出价
 */
Requester.debug.lab_MOD_cpaprice = function(level, param) {
	var rel = {
		data: null,
		status: 200,
		errorCode: null
	};
	// 出错
	// rel.status = 400; // 或者300
	return rel;
};

/**
 * 修改小流量状态
 */
Requester.debug.lab_MOD_cpa_ab = function(level, param) {
	var rel = {
		data: null,
		status: 200,
		errorCode: null
	};
	return rel;
};

/**
 * 删除cpa计划
 */
Requester.debug.lab_DEL_cpa = function(level, param) {
	var rel = {
		data: null,
		status: 200,
		errorCode: null
	};
	return rel;
};

/**
 * 获取计划列表（有无对比）数据
 */
 Requester.debug.lab_GET_report_cpa = function(level, param) {
	var rel = {
		data: [],
		sum: {},
		status: 200,
		errorCode: null
	};
	// 生成data
	for(var i = 1, len = 126; i <= 126; i ++) {
		rel.data.push({
			planname: i + '!@#$%激活名何曾名称<span>' + i,
			type: [1, 2, 4, 16][(4 * Math.random() | 0)],
			time: [
				'2013-01-18 至 2013-01-28',
				'2013-01-19 至 2013-01-20',
				'2013-01-19 至 2013-01-19',
				'2013-02-18 至 2013-02-28',
				'2013-03-18 至 2013-03-28',
				'2013-04-18 至 2013-04-28',
				'2013-05-18 至 2013-05-28',
				'2013-06-18 至 2013-06-28',
				'2013-07-18 至 2013-07-28',
				'2013-08-18 至 2013-08-28'
			][(10 * Math.random() | 0)],
			trans: 7,
			pay: 712.21 + i,
			avgtrans: 4.11 + i,
			transrate: '4' + i + '.12%',
			// 对比时候才有的
			otrans : 19,
			opay : 1112.21 + i,
			oavgtrans : 4.11 + i,
			otransrate : '4' + i + '.12%',
			otime: [
				'2013-01-18 至 2013-01-28',
				'2013-01-19 至 2013-01-20',
				'2013-01-19 至 2013-01-19',
				'2013-02-18 至 2013-02-28',
				'2013-03-18 至 2013-03-28',
				'2013-04-18 至 2013-04-28',
				'2013-05-18 至 2013-05-28',
				'2013-06-18 至 2013-06-28',
				'2013-07-18 至 2013-07-28',
				'2013-08-18 至 2013-08-28'
			][(10 * Math.random() | 0)]
		});
	}
	// 为空
	// rel.data = [];
	// 生成sum
	// rel.sum[1] = {
	// 	trans: 130,
	// 	pay: 712.21,
	// 	avgtrans: 4.11,
	// 	transrate: '42.12%',
	// 	time: '2013-01-18 至 2013-01-28',
	// 	// 仅当对比报告报告时下列fields才有值
	// 	otrans: 130,
	// 	opay: 792.21,
	// 	oavgtrans: 4.11,
	// 	otransrate: '42.12%',
	// 	otime: '2013-01-18 至 2013-01-28'
	// };
	rel.sum[2] = {
		trans: 170,
		pay: 762.21,
		avgtrans: 4.11,
		transrate: '22.12%',
		time: '2013-01-18 至 2013-01-28',
		// 仅当对比报告报告时下列fields才有值
		otrans: 190,
		opay: 792.21,
		oavgtrans: 4.11,
		otransrate: '462.12%',
		otime: '2013-01-18 至 2013-01-28'
	};
	rel.sum[4] = {
		trans: 170,
		pay: 1172.21,
		avgtrans: 4.11,
		transrate: '12.12%',
		time: '2013-01-18 至 2013-01-28',
		// 仅当对比报告报告时下列fields才有值
		otrans: 190,
		opay: 712.21,
		oavgtrans: 4.11,
		otransrate: '42.12%',
		otime: '2013-01-18 至 2013-01-28'
	};
	rel.sum[16] = {
		trans: 31,
		pay: 712.21,
		avgtrans: 4.11,
		transrate: '32.12%',
		time: '2013-01-18 至 2013-01-28',
		// 仅当对比报告报告时下列fields才有值
		otrans: 53,
		opay: 912.21,
		oavgtrans: 4.11,
		otransrate: '62.12%',
		otime: '2013-01-18 至 2013-01-28'
	};
	return rel;
};

/**
 * 获取小流量列表
 */
Requester.debug.lab_GET_report_cpaab = function(level, param) {
	var rel = {
		data: [],
		sum: {
			abs: 12 // 小流量报告总数
		},
		status: 200,
		errorCode: null
	};
	// 生成data数据
	for(var i = 1; i <= 5; i ++) {
		rel.data.push({
			planname: (40 * Math.random() | 0) + '名字小流量-小流量<span>~@34&&%[' + i,
			type: [1, 2, 4, 16][(4 * Math.random() | 0)],
			time: '2013-01-18 至 2013-01-28',
			trans: 130,
			pay: 712.21,
			avgtrans: 4.11,
			transrate: '42.12%',

			otrans: 130,
			opay: 712.21,
			oavgtrans: 4.11,
			otransrate: '42.12%'
		});
	}
	// rel.data = [];
	return rel;
};

/**
 * 获取CPA历史删除记录
 */
Requester.debug.lab_GET_cpahistory = function(level, param) {
	var rel = {
		data: {},
		status: 200,
		errorCode: null
	};
	// 计划总数
	rel.data.total = 26;
	rel.data.cpalist = [];
	// 生成cpalist
	for(var i = 1; i <= 10; i ++) {
		rel.data.cpalist.push({
			planname: (0 | i * Math.random()) + '计划名称cpaname<span>!@#$%$^*(,./\'sa',
			addtime: '2013-01-18 18:00',
			deltime: '2013-01-18 18:00'
		});
	}
	//rel.data.cpalist = [];
	return rel;
};