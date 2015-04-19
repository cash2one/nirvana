/************************************ 效果突降相关接口************************************/
// aoDescrease数据请求模拟接口公共方法
Requester.debug.returnAoWord = function( param ) {
	return {
		status: 200,
		data: {
			signature : 'IU！%RUHA',
			aostatus : 0,
			totalnum : 120,
			returnnum :  param.endindex - param.startindex,
			timestamp : 127831067988222,
			listData : []	
		}
	}	
};
// aoDescrease数据请求模拟接口公共方法
Requester.debug.returnDecrWord = function( param ) {
	var rel = new Requester.debug.returnAoWord( param ),
		listData =[];
	for (var i = param.startindex; i <= param.endindex; i++) {
			listData.push({
				winfoid: i,
				showword: '测试啊啊啊啊啊v啊啊啊' + i,
				planid: i,
				planname: '单元暂停推广<button>这个长计划' + i + '啊啊啊啊啊啊啊啊啊',
				unitid: i,
				unitname: '单元暂停推广<button>这个长单元' + i + '啊啊啊啊啊啊啊啊啊',
				beginvalue:i*1000,
				endvalue:(i-1)*1000,
				decr:1000,
				bid : 1.1
			});
		};
	rel.data.listData = listData;
	return rel;
};
/**
 * 获取用户是否是突降账户
 */
Requester.debug.GET_aodecr_isdecruser = function(level, param) {
	var rel = new Requester.debug.returnTpl(), data = {
		isdecr : kslftestdata
		// 0表示不是突降账户，1表示是突降账户
	};

	rel.data = data;

	return rel;
};

/**
 * 启动bianque，计算摘要信息
 */
Requester.debug.GET_aodecr_hasadvice = function() {
	var rel = new Requester.debug.returnTpl(), data = {
		hasadvice : kslftestdata
		// 当command为“query”时，0代表没有优化建议，1代表有优化建议，2表示在计算中；当command为“start”时，该字段为0，没有意义
	};

	rel.data = data;

	return rel;
};

/**
 * 获取用户突降日期及类型
 */
Requester.debug.GET_aodecr_datemsg = function(level, param) {
	var rel = new Requester.debug.returnTpl(), time = new Date(), data = {
		begindate : baidu.date.format(new Date(time.valueOf() - 24 * 60 * 60
						* 1000), 'yyyy-MM-dd'),
		enddate : baidu.date.format(time, 'yyyy-MM-dd'),
		type : 1
		// 0表示节假日，1表示工作日
	};

	rel.data = data;

	return rel;
};

/**
 * 获取突降指标和突降阈值(未设置则默认为点击和20%)
 */
Requester.debug.GET_aodecr_decrcustom = function(level, param) {
	var rel = new Requester.debug.returnTpl(), data = {
		type : 'pv', // shows clks pv 分别代表展现、点击、浏览
		value : 20
		// 阈值。取值(0,100]，整数
	};

	rel.data = data;

	return rel;
};

/**
 * 修改突降指标和突降阈值 errorCode取值范围 6003或6004 6003：效果突降阈值参数错误 6004：效果突降类型参数错误
 */
Requester.debug.MOD_aodecr_decrcustom = function(level, param) {
	var rel = new Requester.debug.returnTpl();

	// 这里格式需要进一步确认
	// rel.errorCode = 6003;
	kslftestdata = kslftestdata == 0 ? 1 : 0;
	return rel;
};

/**
 * 获取效果突降折线图数据
 */
Requester.debug.GET_aodecr_decrdata = function(level, param) {
	var rel = new Requester.debug.returnTpl(), listData = [], starttime = baidu.date
			.parse(param.starttime);

	for (var i = 0; i < 9; i++) {
		listData.push({
					// time代表日期，value代表该日突降指标值
					time : baidu.date.format(starttime, 'yyyy-MM-dd'),
					value : 2000 * Math.random()
				});

		starttime.setDate(starttime.getDate() + 1);
	}

	rel.data.listData = listData;

	return rel;
};

/**
 * 获取效果突降建议的摘要
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.GET_aodecr_request = function(level, param) {
	var rel = new Requester.debug.returnTpl(), data = {
		signature : 'IU！%RUHA', // 签名，用于记录一组condition状态
		aostatus : 0
		// 请求状态，0-处理正常，1-请求格式错误，2-系统内部错误，3-任务队列已满，请重试，4-需要更详细的请求数据，不只是签名，100-无可分析的物料
	}, aoabsdata = [], opttype = param.opttype, // param.opttype
	status = 3, // (command == 'start') ? 0 : 2
				// 标示任务状态，可能取0、1、2、3、4，0表示启动任务成功，1表示计算中，2表示计算完成，3表示计算超时，4表示内部错误
	// hasproblem = +prompt('是否有问题?1是有问题，0是没问题', 1), // +prompt('是否有问题?', 1);
	// //标示任务是否有问题，可能取0、1，分别表示无问题和有问题
	hasproblem = 1, getRandomScore = function() { // 动态优先级用的随机数
		return Math.random() * 10;
	}, getRandomRank = function() {
		return [1, 2, 3][Math.round(Math.random() * 100) % 3];
	}, priority = 0, // 子项的显示优先级，显示大项的叹号，0、1、2分别表示低、中、高，目前涅槃里暂时无此逻辑
	tmpItem = {
		status : status,
		hasproblem : hasproblem,
		timestamp : 1312862498, // 时间戳，只有当任务完成且有问题(status=2 and
								// hasproblem=1)，任务超时且有问题(status=3 and
								// hasproblem=1)时才有值
		priority : priority
	};

	// opttype = [30, 48, 39, 41, 38, 43, 42, 35, 36, 40, 37, 44, 33, 34, 45,
	// 46, 47];
	// opttype = [42,46];
	for (var i in opttype) {
		var tmp = baidu.object.clone(tmpItem);

		tmp.opttype = opttype[i]; // 标识子项id，与请求中的opttype不一样，仅取一个值
		tmp.rank = getRandomRank(); // 动态优先级等级
		tmp.score = getRandomScore(); // 动态优先级分数
		tmp.result = [];

		switch (opttype[i]) {
			// 余额不足
			case 30 :
				tmp.result.push({
							value : []
						});
				break;
			// 账户预算不足
			case 31 :
				tmp.result.push({
					bgtstatus : 5, // 提示类型，0:不提示 1：预算合理 2：预算风险 3：需提供预算建议 4:
									// 需提供周预算建议 5:突降建议
					suggest : 0,
					lostclick : 109,
					maxbgt : 1000.00,
					show_encourage : 1, // 是否提示同行激励
					model_num : 100, // 同行标杆数
					value : [23, 0]
						// 预算不足建议时，有两个值，分别是时和分，时取值0-23，分取值0-59
					});
				break;
			// 计划预算不足
			case 32 :
				tmp.result.push({
							planid : 243,
							planname : '<button>a<button>',
							bgtstatus : 5,
							suggest : 0,
							lostclick : 109,
							maxbgt : 1000.00,
							show_encourage : 1,
							model_num : 99,
							value : [23, 9]
						});
				tmp.result.push({
							planid : 244,
							planname : '这是个很长很长很长很长很长很长很长很长很长很长的计划名称',
							bgtstatus : 5,
							suggest : 300,
							lostclick : 109,
							maxbgt : 1000.00,
							show_encourage : 1,
							model_num : 99,
							value : [23, 0]
						});
				tmp.result.push({
							planid : 245,
							planname : '这是个很长很长很长很长很长很长很长很长很长很长的计划名称',
							bgtstatus : 3,
							suggest : 300,
							lostclick : 109,
							maxbgt : 1000.00,
							value : [23, 33]
						});
				tmp.result.push({
							planid : 245,
							planname : '这是个很长很长很长很长很长很长很长很长很长很长的计划名称',
							bgtstatus : 2,
							suggest : 300,
							lostclick : 109,
							maxbgt : 1000.00,
							value : [23, 33]
						});
				break;
			// 匹配模式减小
			case 33 :
				tmp.result.push({
							value : [10]
						});
				// tmp.hasproblem = 0;
				break;
			// 自然检索量降低
			case 34 :
				tmp.result.push({
							value : [88]
						});
				break;
			// 关键词搜索无效
			case 35 :
				tmp.result.push({
							value : [23]
						});
				break;
			// 关键词不宜推广
			case 36 :
				tmp.result.push({
							value : [23]
						});
				break;
			// 关键词暂停推广
			case 37 :
				tmp.result.push({
							value : [11]
						});
				break;
			// 单元暂停推广
			case 38 :
				tmp.result.push({
							value : [12]
						});
				break;
			// 计划暂停推广
			case 39 :
				tmp.result.push({
							value : [14]
						});
				break;
			// 关键词检索量过低
			case 40 :
				tmp.result.push({
							value : [16]
						});
				break;
			// 计划被删除
			case 41 :
				tmp.result.push({
							value : [19]
						});
				break;
			// 单元无生效创意
			case 42 :
				tmp.result.push({
							value : [100]
						});
				break;
			// 单元被删除
			case 43 :
				tmp.result.push({
							value : [170]
						});
				break;
			// 关键词被删除
			case 44 :
				tmp.result.push({
							value : [105]
						});
				break;
			// 排名下降
			case 45 :
				tmp.result.push({
							value : [125]
						});
				break;
			// 质量度过低
			case 46 :
				tmp.result.push({
							value : [33]
						});
				// tmp.hasproblem = +prompt('是否有问题?1是有问题，0是没问题', 1)
				break;
			// 质量度下降
			case 47 :
				tmp.result.push({
							value : [18]
						});
				break;
			// 推广时段
			case 48 :
				tmp.result.push({
							planid : 321,
							planname : '计划XXX',
							lostclick : 12,
							value : [18]
						});
				tmp.result.push({
							planid : 1,
							planname : '<button>计划22XXX',
							lostclick : 88,
							value : [18]
						});
				break;
			// 页面不连通
			case 49 :
				tmp.result.push({
							value : [20202020]
						});
				break;
			// 连通速度较慢
			case 50 :
				tmp.result.push({
							value : [21212121]
						});
				break;
			default :
				break;
		}

		aoabsdata.push(tmp);
	}

	data.aoabsdata = aoabsdata;
	rel.data = data;
	// 模拟数据请求延迟
	rel.timeout = 1000;
	return rel;
};

/**
 * 效果突降 单元暂停推广
 */
Requester.debug.GET_aodecr_unitpausedetail = function(level, param) {
	var rel = new Requester.debug.returnAoWord(param), listData = [], i;

	for (i = param.startindex; i <= param.endindex; i++) {
		listData.push({
					planid : i,
					planname : '单元暂停推广<button>这个长计划' + i + '啊啊啊啊啊啊啊啊啊',
					unitid : i,
					unitname : '单元暂停推广<button>这个长单元' + i + '啊啊啊啊啊啊啊啊啊',
					beginvalue : i * 1000,
					endvalue : (i - 1) * 1000,
					decr : 1000
				});
	}

	rel.data.listData = listData;
	return rel;
};

/**
 * 效果突降 单元被删除
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.GET_aodecr_unitdeletedetail = function(level, param) {
	var rel = new Requester.debug.returnAoWord(param), listData = [], i;

	for (i = param.startindex; i <= param.endindex; i++) {
		listData.push({
					planid : i,
					planname : '单元暂停推广<button>这个长计划' + i + '啊啊啊啊啊啊啊啊啊',
					unitid : i,
					unitname : '单元暂停推广<button>这个长单元' + i + '啊啊啊啊啊啊啊啊啊',
					beginvalue : i * 1000,
					endvalue : (i - 1) * 1000,
					decr : 1000
				});
	}

	rel.data.listData = listData;

	return rel;
};

/**
 * 效果突降 计划暂停推广
 */
Requester.debug.GET_aodecr_planpausedetail = function(level, param) {
	var rel = new Requester.debug.returnAoWord(param), listData = [], i;

	for (i = param.startindex; i <= param.endindex; i++) {
		listData.push({
					planid : i,
					planname : '单元暂停推广<button>这个长计划' + i + '啊啊啊啊啊啊啊啊啊',
					beginvalue : i * 1000,
					endvalue : (i - 1) * 1000,
					decr : 1000
				});
	}

	rel.data.listData = listData;

	return rel;
};

/**
 * 效果突降 计划被删除
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.GET_aodecr_plandeletedetail = function(level, param) {
	var rel = new Requester.debug.returnAoWord(param), listData = [], i;

	for (i = param.startindex; i <= param.endindex; i++) {
		listData.push({
					planid : i,
					planname : '单元暂停推广<button>这个长计划' + i + '啊啊啊啊啊啊啊啊啊',
					beginvalue : i * 1000,
					endvalue : (i - 1) * 1000,
					decr : 1000
				});
	}

	rel.data.listData = listData;

	return rel;
};

/**
 * 效果突降 获取账户层级预算详情
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.GET_aodecr_userbudgetdetail = function(level, param) {
	var rel = new Requester.debug.returnTpl();

	rel.data = {
		totalnum : 100,
		returnnum : 100,
		timestamp : '20110101010',
		listData : [{ // 用来存储账户层级预算数据信息
			bgttype : 1, // 预算类型
			daybgtdata : { // 存储日预算基础数据与分析数据
				daybgtvalue : 777.77, // 值
				dayanalyze : { // 日预算分析数据
					tip : 5,
					// 0 不提示 hasproblem = 0, priority = 0
					// 1 预算合理 hasproblem = 0, priority = 0
					// 2 日预算风险 hasproblem = 1, priority = 1
					// 3 需提供日预算建议 hasproblem = 1 , priority = 2
					// 4 需提供周预算建议 hasproblem = 1 , priority = 2
					// 5 需要恢复 某日的预算

					suggestbudget : 0,// 建议预算点
					maxbudget : 999,
					lostclicks : 100,// 损失点击数
					startpoint : [0, 0], // 存放起点
					endpoint : [1000, 1000], // 存放终点
					budgetpoint : [50, 50], // 预算点
					keypoints : [ // 存放七个关键点
					[767.5, 55.11], [772, 58.32], [775.5, 60.43], [797, 70.97],
							[816, 77.96], [816, 77.96], [873.1, 78.57]],
					incitermsg : [ // 存放同行激励信息
					['00:00:00', 0, '0'], // 起点
							['00:05:00', 10, '24000'], // 自身点
							['23:55:00', 351, '36000'], // 优质客户点
							['23:55:00', 360, '0'] // 终点
					],
					show_encourage : 1, // 是否提示同行激励
					model_num : 5,
					words : '你好/你坏', // 核心关键词面值字面串，以/分隔
					wordids : "1" // 核心关键词id值
				}
			},
			weekbgtdata : { // 存储周预算基础数据与分析数据
				weekbgtvalue : 8888.88, // 周预算值
				wbdvalue : { // 周预算分配数据
					tiptype : 0, // tipType取值范围{0：无提示,1：提示点击增加,2：提示风险}
					incclicks : 99,// 增加点击数
					barlist : [ // 存储分配柱状条数据信息，共7条bar信息
					{		// bar，用来存储柱状条数据信息
						type : 2, // Type标识柱状条数据类型取值{1：预算,2：消费}
						data : 0
							// 当天分配的预算
					}, {	// bar，用来存储柱状条数据信息
								type : 2, // Type标识柱状条数据类型取值{1：预算,2：消费}
								data : 66
								// 当天分配的预算
							}, { // bar，用来存储柱状条数据信息
								type : 2, // Type标识柱状条数据类型取值{1：预算,2：消费}
								data : 77
								// 当天分配的预算
							}, { // bar，用来存储柱状条数据信息
								type : 1, // Type标识柱状条数据类型取值{1：预算,2：消费}
								data : 88
								// 当天分配的预算
							}, { // bar，用来存储柱状条数据信息
								type : 1, // Type标识柱状条数据类型取值{1：预算,2：消费}
								data : 99
								// 当天分配的预算
							}, { // bar，用来存储柱状条数据信息
								type : 1, // Type标识柱状条数据类型取值{1：预算,2：消费}
								data : 99
								// 当天分配的预算
							}, { // bar，用来存储柱状条数据信息
								type : 1, // Type标识柱状条数据类型取值{1：预算,2：消费}
								data : 99
								// 当天分配的预算
							}]
				},
				weekanalyze : { // 周预算分析数据，格式与dayanalyze相同，只填写周预算分析的内容。此处略
					tip : 4,
					// 0 不提示 hasproblem = 0, priority = 0
					// 1 预算合理 hasproblem = 0, priority = 0
					// 2 日预算风险 hasproblem = 1, priority = 1
					// 3 需提供日预算建议 hasproblem = 1 , priority = 2
					// 4 需提供周预算建议 hasproblem = 1 , priority = 2
					suggestbudget : 10000,// 建议预算点
					lostclicks : 100,// 损失点击数
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
					]
				},
				istargetuser : 0
				// 是否为目标用户 0：不是目标用户，1：是目标用户
			}
		}]
	};
	return rel;
};

Requester.debug.GET_aodecr_material = function(level, param) {
	var rel = new Requester.debug.returnTpl(), start = 1000, data;
	switch (param.type) {
		case 'shows' :
			start = 1000;
			break;
		case 'clks' :
			start = 2000;
			break;
		case 'pv' :
			start = 3000;
			break;
	}
	if (param.level == 'useracct') {
		data = {
			listData : [{
						beginvalue : 12000,
						endvalue : kslftestdata == 1 ? 3333 : 11111,
						decr : 8667
					}]
		};
	} else {
		var listData = [];
		for (var i = 0; i < 20; i++) {
			listData.push({
						winfoid : start + i,
						showword : '啊a啊啊啊啊啊啊啊啊啊啊啊啊<button>关键字' + (start + i)
								+ '就看见了进我空间看我就快乐健康',
						unitid : start + i + 101,
						unitname : '<button>这个长单元' + (start + i + 101)
								+ '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
						planid : start + i + 100,
						planname : '<button>长计划' + (start + i + 100)
								+ '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
						beginvalue : 1000 * (i + 1),
						endvalue : 3000 * (i + 1),
						decr : 3000 * (i + 1) - 1000 * (i + 1)
					});
		}
		data = {
			listData : listData
		}
	}
	rel.data = data;
	return rel;
};

/**
 * 效果突降 获取单元无生效创意详情
 */
Requester.debug.GET_aodecr_unitnotactivatedideadetail = function(level, param) {
	var rel = new Requester.debug.returnTpl(), data = {
		signature : 'IU！%RUHA', // 签名，用于记录一组condition状态
		aostatus : 0, // 请求状态，0-处理正常，1-请求格式错误，2-系统内部错误，3-任务队列已满，请重试，4-需要更详细的请求数据，不只是签名
		totalnum : 120, // 结果的总条数
		returnnum : 10, // 本次返回的条数
		timestamp : 127831067988222, // 任务完成的时间戳
		listData : []
	}, listData = [], i;
	for (i = 0; i < data.returnnum; i++) {
		listData.push({
			planid : param.startindex + i + 100,
			planname : '<button>长计划' + (param.startindex + i + 100)
					+ '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
			unitid : param.startindex + i + 101,
			unitname : '<button>这个长单元' + (param.startindex + i + 101)
					+ '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
			winfoid : param.startindex + i,
			showword : '啊a啊啊啊啊啊啊啊啊啊啊啊啊<button>关键字' + (param.startindex + i)
					+ '就看见了进我空间看我就快乐健康',
			// showqstat : 11,
			// clks : 34550 + i,
			// paysum : 145.33 + i,
			// ideacount : i,
			// isdecr: i%2,
			beginvalue : i * 1000000000,
			endvalue : (i - 1) * 1000,
			decr : 1000,
			valuetype : ['shows', 'clks', 'pv'][i % 3]
				// beginshowq:13,//期初质量度星级
				// endshowq:11//期末质量度星级
			});
	}

	data.listData = listData;

	rel.data = data;

	return rel;
};

/**
 * 效果突降 获取计划层级预算详情
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.GET_aodecr_planbudgetdetail = function(level, param) {
	var rel = new Requester.debug.returnTpl();

	rel.data = {
		totalnum : 100,
		returnnum : 100,
		timestamp : '20110101010',
		listData : [{ // 用来存储计划层级预算数据信息
			bgttype : 1, // 预算类型
			daybgtdata : { // 存储日预算基础数据与分析数据
				daybgtvalue : 777.77, // 值
				dayanalyze : { // 日预算分析数据
					tip : 5,
					// 0 不提示 hasproblem = 0, priority = 0
					// 1 预算合理 hasproblem = 0, priority = 0
					// 2 日预算风险 hasproblem = 1, priority = 1
					// 3 需提供日预算建议 hasproblem = 1 , priority = 2
					// 4 需提供周预算建议 hasproblem = 1 , priority = 2
					// 5 需要恢复 某日的预算

					suggestbudget : 0,// 建议预算点
					maxbudget : 999,
					lostclicks : 100,// 损失点击数
					startpoint : [0, 0], // 存放起点
					endpoint : [1000, 1000], // 存放终点
					budgetpoint : [50, 50], // 预算点
					keypoints : [ // 存放七个关键点
					[767.5, 55.11], [772, 58.32], [775.5, 60.43], [797, 70.97],
							[816, 77.96], [816, 77.96], [873.1, 78.57]],
					incitermsg : [ // 存放同行激励信息
					['00:00:00', 0, '0'], // 起点
							['00:05:00', 10, '24000'], // 自身点
							['23:55:00', 351, '36000'], // 优质客户点
							['23:55:00', 360, '0'] // 终点
					],
					show_encourage : 1, // 是否提示同行激励
					model_num : 5,
					words : '你好/你坏', // 核心关键词面值字面串，以/分隔
					wordids : "1" // 核心关键词id值
				}
			},
			weekbgtdata : null
		}]
	};
	return rel;
};

/**
 * 效果突降 关键词部分
 */
Requester.debug.GET_aodecr_wordsearchinvaliddetail = function(level, param) {
	return new Requester.debug.returnDecrWord(param);
};
Requester.debug.GET_aodecr_wordrejecteddetail = function(level, param) {
	return new Requester.debug.returnDecrWord(param);
};
Requester.debug.GET_aodecr_wordpvtoolowdetail = function(level, param) {
	return new Requester.debug.returnDecrWord(param);
};
Requester.debug.GET_aodecr_wordpausedetail = function(level, param) {
	return new Requester.debug.returnDecrWord(param);
};
Requester.debug.GET_aodecr_worddeletedetail = function(level, param) {
	return new Requester.debug.returnDecrWord(param);
};

/**
 * 匹配模式缩小
 */
Requester.debug.GET_aodecr_matchpatterndetail = function(level, param) {
	var rel = new Requester.debug.returnAoWord(param), listData = [];
	for (var i = param.startindex; i <= param.endindex; i++) {
		listData.push({
					winfoid : i,
					showword : '测试啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊' + i,
					planid : i,
					planname : '单元暂停推广<button>这个长计划' + i + '啊啊啊啊啊啊啊啊啊',
					unitid : i,
					unitname : '单元暂停推广<button>这个长单元' + i + '啊啊啊啊啊啊啊啊啊',
					beginvalue : i * 1000,
					endvalue : (i - 1) * 1000,
					decr : 1000,
					beginwmatch : [15, 31, 63][Math.round(Math.random() * 100)
							% 3],
					endwmatch : [15, 31, 63][Math.round(Math.random() * 100)
							% 3],
					wmatch : [15, 31, 63][Math.round(Math.random() * 100) % 3]
				});
	};
	rel.data.listData = listData;

	return rel;
};

/**
 * 自然检索量下降
 */
Requester.debug.GET_aodecr_retrievaldetail = function(level, param) {
	var rel = new Requester.debug.returnAoWord(param), listData = [];
	for (var i = param.startindex; i <= param.endindex; i++) {
		listData.push({
					winfoid : i,
					showword : '测试啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊' + i,
					planid : i,
					planname : '单元暂停推广<button>这个长计划' + i + '啊啊啊啊啊啊啊啊啊',
					unitid : i,
					unitname : '单元暂停推广<button>这个长单元' + i + '啊啊啊啊啊啊啊啊啊',
					beginvalue : i * 1000,
					endvalue : (i - 1) * 1000,
					decr : 1000,
					querydecrrate : Math.round(Math.random() * 100)
				});
	};
	rel.data.listData = listData;

	return rel;
};

/**
 * 推左次数或排名下降详情
 */
Requester.debug.GET_aodecr_rankingdetail = function(level, param) {
	var rel = new Requester.debug.returnAoWord(param), listData = [];
	for (var i = param.startindex; i <= param.endindex; i++) {
		listData.push({
					winfoid : i,
					showword : '测试啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊' + i,
					planid : i,
					planname : '单元暂停推广<button>这个长计划' + i + '啊啊啊啊啊啊啊啊啊',
					unitid : i,
					unitname : '单元暂停推广<button>这个长单元' + i + '啊啊啊啊啊啊啊啊啊',
					rankingdecr : Math.round(Math.random() * 10) + '.'
							+ Math.round(Math.random() * 10),
					beginvalue : i * 1000,
					endvalue : (i - 1) * 1000,
					decr : 1000,
					showqstat : [21, 20, 30][Math.round(Math.random() * 100)
							% 3],
					beginshowrate : Math.round(Math.random() * 100),
					endshowrate : Math.round(Math.random() * 100),
					bid : i + 1
				});
	};
	rel.data.listData = listData;

	return rel;
};

///**
// * 推广时段详情
// */
//Requester.debug.GET_aodecr_plancycdetail = function() {
//	return {
//		status : 200,
//		data : {
//			signature : 'a',
//			aostatus : 0, // 请求状态，0-处理正常，1-请求格式错误，2-系统内部错误，3-任务队列已满，请重试，4-需要更详细的请求数据，不只是签名，100-无可分析的物料
//			totalnum : 100, // 结果的总条数
//			returnnum : 100, // 本次返回的条数
//			timestamp : 'b', // 任务完成的时间戳
//			listData : [{
//				plancyc : [['101', '124'], ['206', '209'], ['306', '309'],
//						['315', '319']],
//				suggestcyc : [['211', '219'], ['510', '520'], ['620', '624']]
//			}]
//		},
//		errorCode : {}
//
//	}
//};
/**
 * 获取top100的关键词
 */
Requester.debug.GET_aodecr_deltopwords = function() {
	return {
		status : 200,
		data : {
			listData : ['一', '二', 'sdfdsf', '<a>sdfsdfsdf</a>']
		},
		errorCode : {}

	}
};

/**
 * 暂停推广关键词ids
 * 
 * @param {Object}
 *            param
 */
Requester.debug.GET_aodecr_wordpausedetailwinfoids = function(level, param) {
	var rel = new Requester.debug.returnTpl(), data = {
		signature : 'IU！%RUHA', // 签名，用于记录一组condition状态
		aostatus : 0
		// 请求状态，0-处理正常，1-请求格式错误，2-系统内部错误，3-任务队列已满，请重试，4-需要更详细的请求数据，不只是签名
	}, winfoid = [], i;

	for (i = param.startindex; i <= param.endindex; i++) {
		winfoid.push(i);
	}

	data.winfoid = winfoid;
	rel.data = data;

	return rel;
};

/**
 * 暂停推广单元ids
 * 
 * @param {Object}
 *            param
 */
Requester.debug.GET_aodecr_unitpausedetailunitids = function(level, param) {
	var rel = new Requester.debug.returnTpl(), data = {
		signature : 'IU！%RUHA', // 签名，用于记录一组condition状态
		aostatus : 0
		// 请求状态，0-处理正常，1-请求格式错误，2-系统内部错误，3-任务队列已满，请重试，4-需要更详细的请求数据，不只是签名
	}, unitid = [], i;

	for (i = param.startindex; i <= param.endindex; i++) {
		unitid.push(i);
	}

	data.unitid = unitid;
	rel.data = data;

	return rel;
};

/**
 * 暂停推广计划ids
 * 
 * @param {Object}
 *            param
 */
Requester.debug.GET_aodecr_planpausedetailplanids = function(level, param) {
	var rel = new Requester.debug.returnTpl(), data = {
		signature : 'IU！%RUHA', // 签名，用于记录一组condition状态
		aostatus : 0
		// 请求状态，0-处理正常，1-请求格式错误，2-系统内部错误，3-任务队列已满，请重试，4-需要更详细的请求数据，不只是签名
	}, planid = [], i;

	for (i = param.startindex; i <= param.endindex; i++) {
		planid.push(i);
	}

	data.planid = planid;
	rel.data = data;

	return rel;
};
/**
 * 获取质量度降为1星的数据
 */
Requester.debug.GET_aodecr_showqdetail = function(level, param) {
	var rel = new Requester.debug.returnTpl(), data = {
		signature : 'IU！%RUHA', // 签名，用于记录一组condition状态
		aostatus : 0, // 请求状态，0-处理正常，1-请求格式错误，2-系统内部错误，3-任务队列已满，请重试，4-需要更详细的请求数据，不只是签名
		totalnum : 120, // 结果的总条数
		returnnum : 10, // 本次返回的条数
		timestamp : 127831067988222, // 任务完成的时间戳
		listData : []
	}, listData = [], i;
	for (i = 0; i < data.returnnum; i++) {
		listData.push({
			winfoid : param.startindex + i,
			showword : '1星<button>关键字' + (param.startindex + i)
					+ '就看见了进我空间看我就快乐健康',
			unitid : param.startindex + i + 101,
			unitname : '<button>单元1星' + (param.startindex + i + 101)
					+ '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
			showqstat : 11,
			planid : param.startindex + i + 100,
			planname : '<button>计划1星' + (param.startindex + i + 100)
					+ '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
			beginvalue : i * 1000000000,
			endvalue : (i - 1) * 1000,
			decr : 1000,
			valuetype : ['shows', 'clks', 'pv'][i % 3],
			beginshowq : 13,// 期初质量度星级
			endshowq : 11
				// 期末质量度星级
			});
	}

	data.listData = listData;

	rel.data = data;

	return rel;
};

/**
 * 获取质量度降为2星的数据
 */
Requester.debug.GET_aodecr_showqlowdetail = function(level, param) {
	var rel = new Requester.debug.returnTpl(), data = {
		signature : 'IU！%RUHA', // 签名，用于记录一组condition状态
		aostatus : 0, // 请求状态，0-处理正常，1-请求格式错误，2-系统内部错误，3-任务队列已满，请重试，4-需要更详细的请求数据，不只是签名
		totalnum : 120, // 结果的总条数
		returnnum : 10, // 本次返回的条数
		timestamp : 127831067988222, // 任务完成的时间戳
		listData : []
	}, listData = [], i;
	for (i = 0; i < data.returnnum; i++) {
		listData.push({
			winfoid : param.startindex + i,
			showword : '2星<button>关键字' + (param.startindex + i)
					+ '就看见了进我空间看我就快乐健康',
			unitid : param.startindex + i + 101,
			unitname : '<button>单元2星' + (param.startindex + i + 101)
					+ '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
			showqstat : 11,
			planid : param.startindex + i + 100,
			planname : '<button>计划2星' + (param.startindex + i + 100)
					+ '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
			beginvalue : i * 1000000000,
			endvalue : (i - 1) * 1000,
			decr : 1000,
			valuetype : ['shows', 'clks', 'pv'][i % 3],
			beginshowq : 13,// 期初质量度星级
			endshowq : 12
				// 期末质量度星级
			});
	}

	data.listData = listData;

	rel.data = data;

	return rel;
};
