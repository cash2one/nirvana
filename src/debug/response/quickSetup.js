/**
 * 下面开始是快速新建相关data
 */
/**
 * 获取任务进行状态 return data 0 新账户，1 老账户
 * 
 * @author wanghuijun@baidu.com
 */
Requester.debug.GET_eos_userregtype = function() {
	var rel = new Requester.debug.returnTpl();

	rel.data = 1;

	return rel;
};

/**
 * 获取任务进行状态
 * 
 * 0：没开始 1: 开始生成方案 2：成功 3：开始入库 4：成功 5：部分成功 6：推广方案生成失败 7：推广方案入库失败
 */
Requester.debug.GET_eos_taskstatus = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		taskstate : 0, // 取值0-7
		tasktype : kslfData % 2 == 0 ? "useracct" : 'planinfo' // 取值”useracct”或”planinfo”，分别代表快速新建账户和快速新建计划
	};
	return rel;
};

/**
 * 通知任务被取消（用户进行了“放弃方案”的描述） return data 0 新账户，1 老账户
 * 
 * @author wanghuijun@baidu.com
 */
Requester.debug.MOD_eos_schemecancelled = function() {
	var rel = new Requester.debug.returnTpl();
	kslfData = 0;

	return rel;
};

Requester.debug.GET_eos_landingpage = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		words: [
			'笨蛋超笨蛋<button>超笨</button>蛋超笨蛋超笨蛋超笨蛋超笨蛋1',
			'笨蛋超笨蛋超笨蛋超笨蛋超笨蛋超笨蛋超笨蛋2',
			'笨蛋超笨蛋超笨蛋超笨蛋超笨蛋超笨蛋超笨蛋3',
			'笨蛋超笨蛋超笨蛋超笨蛋超笨蛋超笨蛋超笨蛋4',
			'笨蛋超笨蛋超笨蛋超笨蛋超笨蛋超笨蛋超笨蛋5',
			'笨蛋超笨蛋超笨蛋超笨蛋超笨蛋超笨蛋超笨蛋6',
			'哇咔咔'
		]
	};
	// rel.timeout = 2000;
	return rel;
};

/**
 * 第一阶段第一步提交，用以获取用户的业务信息
 */
Requester.debug.GET_eos_industryinfo = function() {
	var rel = new Requester.debug.returnTpl(), listData = [];

	for (var i = 0; i < 2; i++) {
		listData.push({
			secondtrade : '二级行业' + i,
			firstbiz : [{
				firstbusiness : "一级业务点" + i + '_0',
				secbiz : [{
					secondbusiness : '很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长二级业务' + i
							+ '_0',
					wordproportion : 15,
					examplewords : '很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长一个，二个，三个关键词'
				}, {
					secondbusiness : '二级业务' + i + '_1',
					wordproportion : 15,
					examplewords : ''
				}]
			}, {
				firstbusiness : "一级业务点" + i + '_1',
				secbiz : [{
							secondbusiness : '二级业务' + i + '_2',
							wordproportion : 15,
							examplewords : '一个，二个，三个关键词'
						}, {
							secondbusiness : '二级业务' + i + '_3',
							wordproportion : 15,
							examplewords : '一个，二个，三个关键词'
						}]
			}]
		});
	}

	rel.data = {
		listData : listData
	};

	/*
	 * rel = { "status": 400,
	 * 
	 * "errorCode": { "message": "你妹啊 你妹！", "code": 6011, "detail": null } };
	 */

	return rel;
};

/**
 * 第一步进入第二步时，获取第二步关键词
 */
Requester.debug.GET_eos_initrecmword = function(level, param) {
	var rel = new Requester.debug.returnTpl(), data = {
		token : '12334234', // 请求序列值，用以唯一标识一个请求
		wcnt : 124, // 所有词的总量。不是话术上的那个值
		industrynames : '鲜花，冰箱，啤酒' // 以逗号分隔
	}, recmwords = [];

	for (var i = 0; i < 2; i++) {
		recmwords.push({
					wordid : 100 + i,
					showword : '很长很长很长很长很长很长很长很长很长很长很长很长的关键词' + i,
					pv : 100 + i, // 日均搜索量
					kwc : 200 + i // 竞争激烈程度
				});
	}

	data.recmwords = recmwords;
	rel.data = data;

	/**
	 * rel = { "status": 400,
	 * 
	 * "errorCode": { "message": "你妹啊 你妹！", "code": 6012, "detail": null } };
	 */
	return rel;
};

/*
 * 升级后的推词
 */
Requester.debug.GET_eos_recmword = function(level, param) {
	var rel = new Requester.debug.returnTpl(), recmwords = [];
	
    var charMap = ['孤然的环','独而当时','及','其','所所','所','所所所所','的部','是','保',
                    '罗','奥','斯','特','的改造仅','自','传东','作限于','品','作',
                    '体', '人', '在', '利', '用', '魔', '法', '般', '的', '科',
                    '技', '锁', '死', '了', '地', '球', '人', '的', '科', '学',
                    '之', '后', '庞', '的', '宇宙', '舰队杀', '气腾腾', '地直', '扑', '太阳系',
                    '意', '欲', '清', '除', '地', '球', '文', '明', '面', '对',
                    '前', '所未', '有', '的危局', '经', '历', '过', '无', '数',
                    '磨', '难', '的', '地', '球', '人', '组', '建', '起', '同',
                    '样', '庞', '大', '的', '太', '空', '舰', "队", '同', '时'];
	for (var i = 0; i < 90; i++) {
		recmwords.push({
			wordid : 100 + i,
			word : param.seeds[0] + charMap[i],
			pv : Math.round(10000*Math.random()) + 15000, // 日均搜索量
			kwc : Math.round(100*Math.random()) // 竞争激烈程度
		});
	}

	rel.data.words = recmwords;
	var ran = Math.random();
	rel.status = (ran< 0.3) ? 500 : 200;
	return rel;
};

/**
 * 第一阶段第二步提交，用以获取用户日消费设定的最低阈值
 */
Requester.debug.GET_eos_consumethreshold = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		threshold : 500
	};

	rel.status = 200;
	// 模拟数据请求延迟
	rel.timeout = 1000;
	return rel;
};

Requester.debug.ADD_eos_submittask = function(p1, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = null;
	rel.status = 200;
	//console.log(param)
	if (!param.industry) {
		kslfData = 1;
		return rel;
	}

	// kslfData = 1;
	/*
	 * rel = { "status": 400,
	 * 
	 * "errorCode": { "message": "你妹啊 你妹！", "code": 6014, "detail": null } };
	 */
	rel.data = {
		token : (new Date()).valueOf(),
		wcnt : 500,
		industrynames : '生命，陈超，小猪',
		recmwords : []
	};
	for (var i = 0; i < 2; i++) {
		rel.data.recmwords.push({
					wordid : 10000 + i,
					showword : '长关键词' + i + '极为恶疾哦方季惟额哦ijfiosjdoifjwkle',
					pv : 15000 + i,
					kwc : (10 + i) % 100
				});
	}
	return rel;
};

/**
 * 新户迭代一，更多关键词
 */
Requester.debug.GET_eos_morerecmword = function(p1, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		token : param.token,
		wcnt : 100,
		recmwords : []
	};
	for (var i = param.startindex, l = param.startindex + 100; i < l; i++) {
		rel.data.recmwords.push({
					wordid : 10000 + i,
					showword : '扩展关键词' + i + '极为恶疾哦方季惟额哦ijfiosjdoifjwkle',
					pv : 15000 + i,
					kwc : (10 + i) % 100
				});
	}
	rel.status = 300;

	return rel;
};
Requester.debug.MOD_eos_inittask = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = null;
	rel.status = 200;
	return rel;
};

Requester.debug.MOD_eos_taskfailed = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = null;
	rel.status = 200;
	if (kslfData == 6) {
		kslfData = 0;
	}
	if (kslfData == 7) {
		kslfData = 2;
	}
	return rel;
};

Requester.debug.GET_eos_taskinfo = function() {
	var rel = new Requester.debug.returnTpl(), list = [], pnum = 3, unum = 5
			* pnum, knum = 4 * unum, i, j, k;
	for (i = 0; i < pnum; i++) {
		list.push({
					recmplanid : i,
					recmplanname : '计划' + i,
					recmunitcount : 5,
					recmwordcount : 5 * 4,
					recmunitlist : []
				});
		for (j = 0; j < 5; j++) {
			list[i].recmunitlist.push({
						recmunitid : i + '-' + j,
						recmunitname : '单元' + i + '-' + j,
						recmwordcount : 4,
						recmunitbid : 13.00 + i + j
					});
		}
	}

	rel.data = {
		recmplancount : pnum,
		recmunitcount : unum,
		recmwordcount : knum,
		recmplanlist : list
	};

	rel.status = 200;
	/*
	 * rel.errorCode={ "message": "你妹啊 你妹！", "code": 6019, "detail": null }
	 */
	return rel;
};

/**
 * 展开单元获得关键词列表等信息的借口
 */
Requester.debug.GET_eos_unitpreview = function(level, param) {
	var rel = new Requester.debug.returnTpl(), list = [], wordsum = 10, i;
	var j = '0';
	for (i = 0; i < wordsum; i++) {
		j = j + i;
		list.push({
					recmwinfoid : param.recmplanid + '-' + param.recmunitid
							+ '-' + i,
					recmshowword : '关键词' + param.recmplanid + '--'
							+ param.recmunitid + '--' + i,
					recmbid : j,
					recmwmatch : 31, // 匹配模式，15：广泛，31：短语，63：精确
					recmisdel : i % 2 // 0表示未被删除、1表示已删除
				});
	}

	rel.data = {
		recmwordcount : wordsum,
		recmwordlist : list
	};
	rel.status = 200;
	// 模拟数据请求延迟
	rel.timeout = 5000;
	return rel;
};
Requester.debug.MOD_eos_word = function() {
	var rel = new Requester.debug.returnTpl();
	rel.status = 200;
	/*
	 * rel.error={ '333333' : { 'wmatch' : { code : 5, detail : null, idx : 0,
	 * message : "" } } }
	 */

	return rel;
};

Requester.debug.DEL_eos_word = function() {
	var rel = new Requester.debug.returnTpl();
	rel.status = 200;
	/*
	 * rel.errorCode={ "message": "你妹啊 你妹！", "code": 6012, "detail": null }
	 */
	return rel;
};

Requester.debug.ADD_eos_retriveword = function() {
	var rel = new Requester.debug.returnTpl();
	rel.status = 200;
	/*
	 * rel.errorCode={ "message": "你妹啊 你妹！", "code": 6012, "detail": null }
	 */
	return rel;
};
/**
 * 第二阶段之后获取详情信息，包括预算、地域以及时段
 */
Requester.debug.GET_eos_schemadetail = function() {
	var rel = new Requester.debug.returnTpl();
	rel.status = 200;
	rel.data = {
		wregion : '',
		plancyc : '[]',
		bgttype : 1,
		budget : 100,
		tasktype : 1
	};
	var len = 4;
	for (var i = 1; i < len; i++) {
		if (i != 6) {
			rel.data.wregion += i + (i == len - 1 ? '' : ',');
		}
	}
	/*
	 * rel.errorCode={ "message": "你妹啊 你妹！", "code": 6012, "detail": null }
	 */
	return rel;
};
/**
 * 第二阶段提交
 */
Requester.debug.ADD_eos_adcreate = function() {
	var rel = new Requester.debug.returnTpl();
	rel.status = 200;
	rel.data = null;
	kslfData = 3;
	/*
	 * rel.errorCode={ "message": "你妹啊 你妹！", "code": 6012, "detail": null }
	 */
	return rel;
};
Requester.debug.MOD_eos_taskfinished = function() {
	var rel = new Requester.debug.returnTpl();
	rel.status = 200;
	rel.data = null;
	kslfData = 0;
	/*
	 * rel.errorCode={ "message": "你妹啊 你妹！", "code": 6012, "detail": null }
	 */
	return rel;
};
Requester.debug.GET_eos_needaddideas = function() {
	var rel = new Requester.debug.returnTpl();
	rel.status = 200;
	rel.data = {
		status : 1
		// 0表示不需要添加创意，1表示需要继续添加创意
	};
	kslfData = 0;
	/*
	 * rel.errorCode={ "message": "你妹啊 你妹！", "code": 6012, "detail": null }
	 */
	return rel;
};
Requester.debug.MOD_eos_plan = function(p1, params) {
	var rel = new Requester.debug.returnTpl();
	rel.status = 200;
	rel.data = {};
	return rel;
};
Requester.debug.MOD_eos_unit = function(p1, params) {
	var rel = new Requester.debug.returnTpl();
	rel.status = 200;
	rel.data = {};
	return rel;
};
Requester.debug.MOD_eos_schemadetail = function(p1, params) {
	var rel = new Requester.debug.returnTpl();
	rel.status = 200;
	rel.data = {};
	return rel;
};
