/**
 * 获取阿凡达列表数据
 * @param {Object} level
 * @param {Object} param
 */
Requester.debug.GET_avatar_monifolders = function(level, param){
	var rel = new Requester.debug.returnTpl();
	//	rel.status = 500;
	var relList = [];
	var len = Math.round(Math.random() * 100) % 5;
	var len = 2;
	for (var j = 0; j < len; j++) {
		relList[j] = {
			'folderid': j + 100,
			'foldername' : '<button name="test">关键词</button><button>关键词</button><button>关键词</button><button>关键词</button>' + j,
			'fstat' : Math.round(Math.random() * 100) % 2,
			'moniwordcount' : 0,//为测试监控文件夹关键词为0而修改		by mayue@baidu.com
			'clks' : Math.round(Math.random() * 100),
			'shows' : Math.round(Math.random() * 100),
			'paysum' : Math.round(Math.random() * 100)
		};
	}
	rel.data.listData = relList;
	return rel;
};

/**
 * 获取监控文件夹中的关键词列表
 * @param {Object} level
 * @param {Object} param
 */
Requester.debug.GET_avatar_moniwords = function(level, param){
	var rel = new Requester.debug.returnTpl();
//	rel.status = 500;
	rel.data.listData = [];
	for (var j = 0; j < 102; j++) {
		rel.data.listData[j] = {};
		for (var i = 0, len = param.fields.length; i < len; i++) {
			rel.data.listData[j][param.fields[i]] = Requester.debug.data["wordinfo"][param.fields[i]](j);
		}
	}
	return rel;
};
	
/**
 * 删除监控文件夹
 */
Requester.debug.DEL_avatar_monifolders = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = {}
	return rel;
};
/**
 * 修改监控文件夹属性
 */
Requester.debug.MOD_avatar_modfolders = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = {}
	return rel;
};

/**
 * 获取监控文件夹数量
 */
Requester.debug.GET_avatar_monifoldercount = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		currentCount : 2,
		maxCount : 10
	};
	return rel;
};

/**
 * 检查监控文件夹中的关键词总数量是否已经超限
 */
Requester.debug.GET_avatar_moniwordcount = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		currentCount : 18,
		maxCount : 100
	};
	return rel;
};

/**
 * 删除监控关键词
 */
Requester.debug.DEL_avatar_moniwords = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = {};
	return rel;
};

/**
 * 新建监控文件夹
 */
Requester.debug.ADD_avatar_monifolder = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = {}
	return rel;
};

/**
 * 新增监控关键词
 */
Requester.debug.ADD_avatar_moniwords = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = {}
	return rel;
};

/**
 * 获得一批关键词所属的监控文件夹列表
 */
Requester.debug.GET_avatar_winfoid2folders = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		1 : [{
					folderid : 321,
					foldername : "监控文件夹"
				}, {
					folderid : 322,
					foldername : "监控文件夹关键词所属"
				}],
		2 : [{
					folderid : 323,
					foldername : "监控文件夹"
				}, {
					folderid : 324,
					foldername : "监控文件夹关键词所属"
				}],
		3 : [{folderid:325, foldername: "监控文件夹"},{folderid:326, foldername: "监控文件夹关键词所属"}],
		39 : [{folderid:321, foldername: "监控文件夹"},{folderid:322, foldername: "监控文件夹关键词所属"}],
        73 : [{folderid:323, foldername: "监控文件夹"},{folderid:324, foldername: "监控文件夹关键词所属"}],
        17 : [{folderid:325, foldername: "监控文件夹"},{folderid:326, foldername: "监控文件夹关键词所属"}]
        
	}
	return rel;
};

/**
 * 获取大筛子阀值
 * 
 * @author linzhifneg@baidu.com GET/avatar/wfthreshold
 */
Requester.debug.GET_avatar_wfthreshold = function(level, param) {
	var rel = new Requester.debug.returnTpl();

	rel.data = {
		listData : [{
					thdtype : 1,
					highthreshold : 250,
					lowthreshold : 250
				},// 展现
				{
					thdtype : 2,
					highthreshold : 120,
					lowthreshold : 120
				},// 点击
				{
					thdtype : 3,
					highthreshold : 30,
					lowthreshold : 30
				},// 消费
				{
					thdtype : 4,
					highthreshold : 320,
					lowthreshold : 320
				},// 平均点击价格
				{
					thdtype : 5,
					highthreshold : 0.99,
					lowthreshold : 0.01
				},// 点击率
				{
					thdtype : 6,
					highthreshold : 0.95,
					lowthreshold : 0.05
				},// 左侧展现概率
				{
					thdtype : 7,
					highthreshold : 10000,
					lowthreshold : 100
				} // 操作
		]
	}

	return rel;
};

/**
 * 获取快捷方式
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.GET_avatar_wfcondition = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		listData : Requester.debug.data.shortcut
	}

	return rel;
};

/**
 * 添加快捷方式
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.ADD_avatar_wfcondition = function(level, param) {
	var rel = new Requester.debug.returnTpl(), i, len = Requester.debug.data.shortcut.length;
	if (len > 5) {
		// 快捷筛选条件达到上限
		rel.status = '400';
		rel.errorCode = {};
		rel.errorCode.code = 2860;
		return rel;
	}

	for (i = 0; i < len; i++) {
		if (Requester.debug.data.shortcut[i].wfcondname == param.wfcondname) {
			// 快捷筛选条件重名
			rel.status = '400';
			rel.errorCode = {};
			rel.errorCode.code = 2861;
			return rel;
		}
	}
	param.wfcondid = Math.round(Math.random() * 1000)
	Requester.debug.data.shortcut.push(param);
	return rel;
};

/**
 * 添加快捷方式
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.DEL_avatar_wfcondition = function(level, param) {
	var rel = new Requester.debug.returnTpl(), i, len = Requester.debug.data.shortcut.length;
	for (i = 0; i < len; i++) {
		if (Requester.debug.data.shortcut[i].wfcondid == param.wfcondids[0]) {
			// 成功返回
			baidu.array.removeAt(Requester.debug.data.shortcut, i);
			return rel;
		}
	}
	// 不存在这个id
	rel.status = '400';
	// rel.errorCode = 2861;
	return rel;
};
/**
 * 匹配分析
 */
Requester.debug.GET_avatar_ideainfos = function() {
	var rel = {
		status : 200,
		errorCode : null,
		data : {
			sum : null,
			listData : [{
						activestat : 0,
						clkrate : "0",
						clks : "0",
						desc1 : "sadadsdasdasads",
						desc2 : "dsadsadsadsa",
						ideaid : 1,
						ideastat : 2,
						pausestat : 0,
						paysum : "0",
						planid : 4525623,
						shows : "0",
						showurl : "www.sdsdf.com",
						title : "assddsadas",
						trans : "0",
						unitid : 55624561,
						url : "http://www.sdsdf.com",
						shadow_ideaid : 1221,
						shadow_title : 'shadow棰樼洰' + 2,
						shadow_desc1 : 'shadow鎻忚堪(1)',
						shadow_desc2 : 'shadow鎻忚堪(2)' + 1,
						shadow_url : 'http://www.baidu.com/' + 11,
						shadow_showurl : 'http://www.baidu.com/' + 2,
						shadow_ideastat : 1
					}, {
						activestat : 0,
						clkrate : "0",
						clks : "0",
						desc1 : "sadadsdasdasads2",
						desc2 : "dsadsadsadsa",
						ideaid : 2,
						ideastat : 2,
						pausestat : 0,
						paysum : "0",
						planid : 4525623,
						shows : "0",
						showurl : "www.sdsdf.com",
						title : "assddsadas",
						trans : "0",
						unitid : 55624561,
						url : "http://www.sdsdf.com",
						shadow_ideaid : 1123,
						shadow_title : 'shadow棰樼洰' + 2,
						shadow_desc1 : 'shadow鎻忚堪(1)',
						shadow_desc2 : 'shadow鎻忚堪(2)',
						shadow_url : 'http://www.baidu.com/',
						shadow_showurl : 'http://www.baidu.com/',
						shadow_ideastat : 1
					}, {
						activestat : 0,
						clkrate : "0",
						clks : "0",
						desc1 : "sadadsdasdasads3",
						desc2 : "dsadsadsadsa",
						ideaid : 3,
						ideastat : 2,
						pausestat : 0,
						paysum : "0",
						planid : 4525623,
						shows : "0",
						showurl : "www.sdsdf.com",
						title : "assddsadas",
						trans : "0",
						unitid : 55624561,
						url : "http://www.sdsdf.com"
					}, {
						activestat : 0,
						clkrate : "0",
						clks : "0",
						desc1 : "sadadsdasdasads",
						desc2 : "dsadsadsadsa",
						ideaid : 4,
						ideastat : 2,
						pausestat : 0,
						paysum : "0",
						planid : 4525623,
						shows : "0",
						showurl : "www.sdsdf.com",
						title : "assddsadas4",
						trans : "0",
						unitid : 55624561,
						url : "http://www.sdsdf.com"
					}, {
						activestat : 0,
						clkrate : "0",
						clks : "0",
						desc1 : "sadadsdasdasads",
						desc2 : "dsadsadsadsa",
						ideaid : 5,
						ideastat : 2,
						pausestat : 0,
						paysum : "0",
						planid : 4525623,
						shows : "0",
						showurl : "www.sdsdf.com",
						title : "assddsadas4",
						trans : "0",
						unitid : 55624561,
						url : "http://www.sdsdf.com"

					}/*
						 * ,{ activestat : 0, clkrate : "0", clks : "0", desc1 :
						 * "sadadsdasdasads", desc2 : "dsadsadsadsa", ideaid :
						 * 6, ideastat : 2, pausestat : 0, paysum : "0", planid :
						 * 4525623, shows : "0", showurl : "www.sdsdf.com",
						 * title : "assddsadas5", trans : "0", unitid :
						 * 55624561, url : "http://www.sdsdf.com",
						 * shadow_ideaid: 122, shadow_title: 'shadow棰樼洰' + 2,
						 * shadow_desc1: 'shadow鎻忚堪(1)' + 111, shadow_desc2:
						 * 'shadow鎻忚堪(2)' + 111, shadow_url:
						 * 'http://www.baidu.com/' + 11, shadow_showurl:
						 * 'http://www.baidu.com/' + 2, shadow_ideastat: 1 },{
						 * activestat : 0, clkrate : "0", clks : "0", desc1 :
						 * "sadadsdasdasads", desc2 : "dsadsadsadsa", ideaid :
						 * 7, ideastat : 2, pausestat : 0, paysum : "0", planid :
						 * 4525623, shows : "0", showurl : "www.sdsdf.com",
						 * title : "assddsadas6", trans : "0", unitid :
						 * 55624561, url : "http://www.sdsdf.com",
						 * shadow_ideaid: 111, shadow_title: 'shadow棰樼洰' + 2,
						 * shadow_desc1: 'shadow鎻忚堪(1)' + 111, shadow_desc2:
						 * 'shadow鎻忚堪(2)' + 111, shadow_url:
						 * 'http://www.baidu.com/' + 11, shadow_showurl:
						 * 'http://www.baidu.com/' + 2, shadow_ideastat: 1 },{
						 * activestat : 0, clkrate : "0", clks : "0", desc1 :
						 * "sadadsdasdasads", desc2 : "dsadsadsadsa", ideaid :
						 * 8, ideastat : 2, pausestat : 0, paysum : "0", planid :
						 * 4525623, shows : "0", showurl : "www.sdsdf.com",
						 * title : "assddsadas7", trans : "0", unitid :
						 * 55624561, url : "http://www.sdsdf.com",
						 * shadow_ideaid: 10, shadow_title: 'shadow棰樼洰' + 2,
						 * shadow_desc1: 'shadow鎻忚堪(1)' + 111, shadow_desc2:
						 * 'shadow鎻忚堪(2)' + 111, shadow_url:
						 * 'http://www.baidu.com/' + 11, shadow_showurl:
						 * 'http://www.baidu.com/' + 2, shadow_ideastat: 1 },{
						 * activestat : 0, clkrate : "0", clks : "0", desc1 :
						 * "sadadsdasdasads", desc2 : "dsadsadsadsa", ideaid :
						 * 9, ideastat : 2, pausestat : 0, paysum : "0", planid :
						 * 4525623, shows : "0", showurl : "www.sdsdf.com",
						 * title : "assddsadas8", trans : "0", unitid :
						 * 55624561, url : "http://www.sdsdf.com",
						 * shadow_ideaid: 11, shadow_title: 'shadow棰樼洰' + 2,
						 * shadow_desc1: 'shadow鎻忚堪(1)' + 111, shadow_desc2:
						 * 'shadow鎻忚堪(2)' + 111, shadow_url:
						 * 'http://www.baidu.com/' + 11, shadow_showurl:
						 * 'http://www.baidu.com/' + 2, shadow_ideastat: 1 },{
						 * activestat : 0, clkrate : "0", clks : "0", desc1 :
						 * "sadadsdasdasads", desc2 : "dsadsadsadsa", ideaid :
						 * 10, ideastat : 2, pausestat : 0, paysum : "0", planid :
						 * 4525623, shows : "0", showurl : "www.sdsdf.com",
						 * title : "assddsadas9", trans : "0", unitid :
						 * 55624561, url : "http://www.sdsdf.com",
						 * shadow_ideaid: 12, shadow_title: 'shadow棰樼洰' + 2,
						 * shadow_desc1: 'shadow鎻忚堪(1)' + 111, shadow_desc2:
						 * 'shadow鎻忚堪(2)' + 111, shadow_url:
						 * 'http://www.baidu.com/' + 11, shadow_showurl:
						 * 'http://www.baidu.com/' + 2, shadow_ideastat: 1 }
						 */
			]
		}
	}
	// console.log(rel);
	return rel;
};

/**
 * 查询关键词
 */
Requester.debug.QUERY_avatar_wordinfos = function() {
	var listData = [];
	for (var i = 0; i < 15; i++)
		listData.push({
					showword : 'a',
					winfoid : i,

					planid : i + 100,
					planname : 'aa',

					unitid : i + 1000,
					unitname : 'aaa'
				})
	return {
		status : 200,
		data : {
			listData : listData,
			notFound : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
					'11', '12']
		}
	}
};

/**
 * 转移关键词
 */
Requester.debug.TRANS_avatar_moniwords = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = {}
	return rel;
};
