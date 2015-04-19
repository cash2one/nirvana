/**
 * 获取holmes状态
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.GET_ao_holmesstatus = function(level, param) {
	var rel = new Requester.debug.returnTpl();

	rel.data = { // 0 : 正常，4 : 未开通holmes，5 : 未设置转化路径，6 : 代码检查有误
		holmesstatus : 0, // +prompt('4为未开通，6为代码检查有误', 0), // 0/4/6
		transtarget : 5
		// 0/5
	};

	return rel;
};

/**
 * 获取推广阶段及各指标的权限
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.GET_ao_stagesandtargets = function(level, param) {
	var rel = new Requester.debug.returnTpl(), auth = 0; // +prompt('3为无权限',
	// 0);

	rel.data = { // 0 : 正常，3 : 无此权限
		stages : {
			shows : 0,
			clks : 0,
			pv : auth,
			trans : auth
		},
		targets : {
			'shows' : 0,
			'clks' : 0,
			'pv' : 0,
			'trans' : 0,
			'lastofftime' : 0,
			'effwordnum' : 0,
			'leftshowrate' : 0,
			'star3numrate' : 0,
			'conntime' : 0,
			'attraction' : 0
			// 其他值暂时不需要
		}
	};

	return rel;
};

/**
 * 获取全部优化建议的摘要
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.GET_ao_request = function(level, param) {
	var rel = new Requester.debug.returnTpl(), data = {
		signature : 'IU！%RUHA', // 签名，用于记录一组condition状态
		aostatus : 0
		// 请求状态，0-处理正常，1-请求格式错误，2-系统内部错误，3-任务队列已满，请重试，4-需要更详细的请求数据，不只是签名
	}, aoabsdata = [], opttype = param.opttype, // param.opttype
	status = 2, // (command == 'start') ? 0 : 2
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

	// Added by Wu Huiyao
	var absorder = [];// 新增参数，用于返回排序相关数据

	for (var i in opttype) {
		absorder.push({
					opttype : opttype[i],
					record : getRandomRank()
				});
	}

	absorder.sort(function(o1, o2) {
				if (o1.record > o2.record) {
					return -1;
				} else if (o1.record < o2.record) {
					return 1;
				} else {
					return 0;
				}
			});

	for (var i in opttype) {
		var tmp = baidu.object.clone(tmpItem);

		tmp.opttype = opttype[i]; // 标示子项id，与请求中的opttype不一样，仅取一个值
		tmp.rank = getRandomRank(); // 动态优先级等级
		tmp.score = getRandomScore(); // 动态优先级分数
		tmp.result = [];
		switch (opttype[i]) {
			// 账户预算不足
			case 1 :
//				tmp.result.push({
//							bgtstatus : 5, // 提示类型，0:不提示 1：预算合理 2：预算风险
//							// 3：需提供预算建议 4: 需提供周预算建议
//							suggest : 0,
//							lostclick : 109,
//                            retripercent: 23, // 可挽回点击数,为0时候不展现额外的话术,升级预算话术新增 2013.3.20 by Huiyao
//							maxbgt : 1000.00,
//							show_encourage : 1, // 是否提示同行激励
//							model_num : 100, // 同行标杆数
//							value : [11, 11]
//						});
                tmp.result.push({
                    bgtstatus : 3, // 提示类型，0:不提示 1：预算合理 2：预算风险
                    // 3：需提供预算建议 4: 需提供周预算建议
                    suggest : 0,
                    lostclick : 109,
                    retripercent: 30, // 可挽回点击数,为0时候不展现额外的话术,升级预算话术新增 2013.3.20 by Huiyao
                    maxbgt : 1000.00,
                    show_encourage : 1, // 是否提示同行激励
                    model_num : 100, // 同行标杆数
                    value : [11, 11]
                });
				break;
			// 计划预算不足
			case 2 :
				tmp.result.push({
							planid : 243,
							planname : '<button>a<button>',
							bgtstatus : 3,
							suggest : 0,
							lostclick : 109,
                            retripercent: 23, // 可挽回点击数,为0时候不展现额外的话术,升级预算话术新增 2013.3.20 by Huiyao
							maxbgt : 1000.00,
							show_encourage : 1,
							model_num : 99
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
							value : [11, 11]
						});
				tmp.result.push({
							planid : 245,
							planname : '这是个很长很长很长很长很长很长很长很长很长很长的计划名称',
							bgtstatus : 5,
							suggest : 0,
							lostclick : 109,
							maxbgt : 1000.00,
							value : [13, 12]
						});
				tmp.result.push({
							planid : 245,
							planname : '这是个很长很长很长很长很长很长很长很长很长很长的计划名称',
							bgtstatus : 5,
							suggest : 300,
							lostclick : 109,
							maxbgt : 1000.00,
							value : [14, 14]
						});
				break;
			// 质量度过低
			case 3 :
				tmp.result.push({
							value : [10, 0, 5]
						});
				break;
			// 左侧首屏出价
			case 4 :
				tmp.result.push({
							value : [88]
						});
				break;
			// 添加更多关键词
			case 5 :
				tmp.result.push({
							value : []
						});
				break;
//			// 搁置时段
//			case 7 :
//				tmp.result.push({
//							planid : 0,
//							planname : '计划XXX',
//							lostclick : 12
//						});
//				tmp.result.push({
//							planid : 1,
//							planname : '<button>计划22XXX',
//							lostclick : 88
//						});
//				// tmp.hasproblem = +prompt('是否有问题?1是有问题，0是没问题', 1);
//				break;
            // 升级版搁置时段优化项，由于替换掉上面7
            case 52 :
                var num = Math.ceil(Math.random() * 5);
                for (var i = num; i --;) {
                    tmp.result.push({
                        planid : 3443 + i,
                        planname : i + '新的时段升级计划时段23sdfsf',
                        sgtcyccnt : Math.ceil(Math.random() * 50), // 建议增加的时段数
                        potentialclk: Math.ceil(Math.random() * 100) // 潜在客户数
                    });
                }
                break;
			// 关键词待激活
			case 8 :
				tmp.result.push({
							value : [11]
						});
				break;
			// 关键词搜索无效
			case 9 :
				tmp.result.push({
							value : [12, 8]
						});
				break;
			// 关键词检索量过低
			case 10 :
				tmp.result.push({
							value : [14]
						});
				break;
			// 关键词不宜推广
			case 11 :
				tmp.result.push({
							value : [16, 10]
						});
				break;
			// 关键词暂停推广
			case 12 :
				tmp.result.push({
							value : [19, 2]
						});
				break;
			// 单元暂停推广
			case 13 :
				tmp.result.push({
							value : [100, 20]
						});
				break;
			// 计划暂停推广
			case 14 :
				tmp.result.push({
							value : [170, 30]
						});
				break;
			// 创意待激活
			case 15 :
				tmp.result.push({
							value : [105]
						});
				break;
			// 创意不宜推广
			case 16 :
				tmp.result.push({
							value : [125]
						});
				break;
			// 创意暂停推广
			case 17 :
				tmp.result.push({
							value : [3]
						});
				break;
			// 左侧首屏展现概率
			case 18 :
				tmp.result.push({
							value : [18]
						});
				break;
			// 左侧首位展现概率
			case 19 :
				tmp.result.push({
							value : [19]
						});
				break;
			// 不连通比例过高
			case 20 :
				tmp.result.push({
							value : [20202020]
						});
				break;
			// 连通速度较慢
			case 21 :
				tmp.result.push({
							value : [21212121]
						});
				break;
			// 跳出率较高
			case 22 :
				tmp.result.push({
							value : [1230, 230]
						});
				break;
			// 转化率
			case 24 :
				tmp.result.push({
							value : [242424]
						});
				break;
			// Holmes状态
			case 25 :
				tmp.result.push({
							value : []
						});
				break;

			// 效果突降新增建议
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
					suggest : 14,
					lostclick : 109,
					maxbgt : 1000.00,
					show_encourage : 1, // 是否提示同行激励
					model_num : 100, // 同行标杆数
					value : [23, 33]
						// 预算不足建议时，有两个值，分别是时和分，时取值0-23，分取值0-59
					});
				break;
			// 计划预算不足
			case 32 :
				tmp.result.push({
							planid : 243,
							planname : '<button>a<button>',
							bgtstatus : 5,
							suggest : 300,
							lostclick : 109,
							maxbgt : 1000.00,
							show_encourage : 1,
							model_num : 99,
							value : [23, 33]
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
							value : [23, 33]
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

	// 动态优先级三期：新增一个返回参数，Added by Wu Huiyao
	data.absorder = absorder;

	data.aoabsdata = aoabsdata;
	rel.data = data;
	return rel;
};

/**
 * 获取指标的总计或平均值
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.GET_ao_targetssum = function(level, param) {
	var rel = new Requester.debug.returnTpl();

	var targets = param.targets,
		len = targets.length,
		sumData = [],
		i;

	for (i = 0; i < len; i++) {
		sumData.push({
			target : targets[i],
			value : ['3000000', '-1', new Date().valueOf()][Math.ceil(Math.random() * 10) % 3],
			percentage : ['10%', '0%', '-1'][Math.ceil(Math.random() * 10) % 3]
		});
	}

	rel.data = { // 值不存在则为-1，第一项是当前值，第二项是对比值
		date : '2012-11-19',
		sumData : sumData
	};
	// 模拟数据请求延迟
	//rel.timeout = 1000;
	return rel;
};

/**
 * 获取高消费、高点击、高展现词
 * 
 * @param {Object}
 *            param
 */
Requester.debug.GET_ao_topwords = function(param) {
	var rel = new Requester.debug.returnTpl(), len = 30;

	rel.data = {};
	rel.data.listData = [];
	for (var i = 0; i < len; i++) {
		rel.data.listData[i] = {
			planid : "102" + i,
			planname : "计划" + i,
			unitid : "201" + i,
			unitname : "单元" + i,
			winfoid : "456" + i,
			showword : "关键词" + i,
			value : 67 + i,
			rate : (0.1 + i / 100).toFixed(2) + "%"
		}
	}
	return rel;
};

/**
 * 获取高消费、高点击、高展现词阈值
 * 
 * @param {Object}
 *            param
 */
Requester.debug.GET_ao_custom = function(param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = 20;
	return rel;
};

/**
 * 获取主动提示区域的展开及永久收起状态
 * 
 * @param {Object}
 *            param
 */
Requester.debug.GET_ao_areahide = function(param) {
	var rel = new Requester.debug.returnTpl();
	// rel.data = kslfData++ == 0 ? 1 : 0;
	rel.data = 0;
	return rel;
};

/**
 * 修改高消费、高点击、高展现词阈值
 * 
 * @param {Object}
 *            param
 */
Requester.debug.MOD_ao_custom = function(param) {
	var rel = new Requester.debug.returnTpl();
	// rel.errorCode = 6000;
	return rel;
};

/**
 * 修改主动提示区域的展开及永久收起状态
 * 
 * @param {Object}
 *            param
 */
Requester.debug.MOD_ao_areahide = function(param) {
	var rel = new Requester.debug.returnTpl();
	// rel.errorCode = 6000;
	return rel;
};

/**
 * 获取用户未保存的监控文件夹列表
 * 
 * @param {Object}
 *            param
 */
Requester.debug.GET_ao_unselectedfolders = function(param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = [1, 2, 3];
	return rel;
};

/**
 * 修改用户未保存的监控文件夹列表
 * 
 * @param {Object}
 *            param
 */
Requester.debug.MOD_ao_unselectedfolders = function(param) {
	var rel = new Requester.debug.returnTpl();
	// rel.errorCode = 6002;
	return rel;
};

/**
 * 不连通比例过高详情
 * 
 * @param {Object}
 *            param
 */
Requester.debug.GET_ao_disconnectratedetail = function(param) {
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
			planid : i,
			planname : '<button>这个长计划' + i + '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
			unitid : i,
			unitname : '<button>这个长单元' + i + '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
			disconnecturl : 'http://www.www.chingllaldfja.com.com.com/adfc/aljfa/actxdskfkdsflskjfldsfsf;lskf;sf'
					+ i
		});
	}

	data.listData = listData;

	rel.data = data;

	return rel;
};

/**
 * 连通速度较慢详情
 * 
 * @param {Object}
 *            param
 */
Requester.debug.GET_ao_loadtimedetail = function(level, param) {
	var rel = new Requester.debug.returnTpl(), data = {
		signature : 'IU！%RUHA', // 签名，用于记录一组condition状态
		aostatus : 0, // 请求状态，0-处理正常，1-请求格式错误，2-系统内部错误，3-任务队列已满，请重试，4-需要更详细的请求数据，不只是签名
		totalnum : 120, // 结果的总条数
		returnnum : 10, // 本次返回的条数
		timestamp : 127831067988222, // 任务完成的时间戳
		listData : []
	}, listData = [], i;

	for (i = param.startindex; i < param.endindex; i++) {
		listData.push({
			planid : i,
			planname : '<button>这个长计划' + i + '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
			unitid : i,
			unitname : '<button>这个长单元' + i + '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
			slowurl : 'http://www.www.chingllaldfja.com.com.com/adfc/aljfa/actxdskfkdsflskjfldsfsf;lskf;sf'
					+ i,
			loadtime : i,
			isdecr : i % 2,
			beginvalue : i * 1000,
			endvalue : (i - 1) * 1000,
			decr : 1000,
			valuetype : ['shows', 'clks', 'pv'][i % 3]
		});
	}

	data.listData = listData;

	rel.data = data;

	return rel;
};

/**
 * 待激活关键词ids
 * 
 * @param {Object}
 *            param
 */
Requester.debug.GET_ao_wordactivedetailwinfoids = function(level, param) {
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
 * 暂停推广关键词ids
 * 
 * @param {Object}
 *            param
 */
Requester.debug.GET_ao_wordpausedetailwinfoids = function(level, param) {
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
Requester.debug.GET_ao_unitpausedetailunitids = function(level, param) {
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
Requester.debug.GET_ao_planpausedetailplanids = function(level, param) {
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
 * 左侧首屏出价详情
 * 
 * @param {Object}
 *            param
 */
Requester.debug.GET_ao_bidstimdetail = function(level, param) {
	var rel = new Requester.debug.returnAoWord(param), listData = [], i;

	for (i = param.startindex; i <= param.endindex; i++) {
		listData.push({
					planid : i,
					planname : '左侧首屏出价<button>这个长计划' + i + '啊啊啊啊啊啊啊啊啊',
					unitid : i,
					unitname : '左侧首屏出价<button>这个长单元' + i + '啊啊啊啊啊啊啊啊啊',
					winfoid : i,
					showword : '测试' + i,
					paysum : 145.33,
					clks : 34552,
					bid : (i % 2 === 1) ? null : 1.5,
					unitbid : 0.5
				});
	}

	rel.data.listData = listData;

	return rel;
};

/**
 * 关键词待激活
 * 
 * @param {Object}
 *            param
 */
Requester.debug.GET_ao_wordactivedetail = function(level, param) {
	var rel = new Requester.debug.returnAoWord(param), listData = [], i;

	for (i = param.startindex; i <= param.endindex; i++) {
		listData.push({
					planid : i,
					planname : '关键词待激活<button>这个长计划' + i + '啊啊啊啊啊啊啊啊啊',
					unitid : i,
					unitname : '关键词待激活<button>这个长单元' + i + '啊啊啊啊啊啊啊啊啊',
					winfoid : i,
					showword : '测试' + i,
					paysum : 145.33,
					clks : 34552,
					bid : (i % 2 === 1) ? null : 1.5,
					unitbid : 0.5
				});
	}

	rel.data.listData = listData;

	return rel;
};

/**
 * 关键词搜索无效
 * 
 * @param {Object}
 *            param
 */
Requester.debug.GET_ao_wordsearchinvaliddetail = function(level, param) {
	var rel = new Requester.debug.returnAoWord(param), listData = [], i;

	for (i = param.startindex; i <= param.endindex; i++) {
		listData.push({
					planid : i,
					planname : '关键词搜索无效<button>这个长计划' + i + '啊啊啊啊啊啊啊啊啊',
					unitid : i,
					unitname : '关键词搜索无效<button>这个长单元' + i + '啊啊啊啊啊啊啊啊啊',
					winfoid : i,
					showword : '测试啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊' + i,
					paysum : 145.33,
					clks : 34552,
					bid : (i % 2 === 1) ? null : 1.5,
					unitbid : 0.5,
					isdecr : i % 2,
					beginvalue : i * 1000,
					endvalue : (i - 1) * 1000,
					decr : 1000,
					valuetype : ['shows', 'clks', 'pv'][i % 3]
				});
	}

	rel.data.listData = listData;

	return rel;
};

/**
 * 关键词不宜推广
 * 
 * @param {Object}
 *            param
 */
Requester.debug.GET_ao_wordrejecteddetail = function(level, param) {
	var rel = new Requester.debug.returnAoWord(param), listData = [], i;

	for (i = param.startindex; i <= param.endindex; i++) {
		listData.push({
			planid : i,
			planname : '关键词不宜推广<button>这个长计划' + i + '啊啊啊啊啊啊啊啊啊',
			unitid : i,
			unitname : '关键词不宜推广<button>这个长单元' + i + '啊啊啊啊啊啊啊啊啊',
			winfoid : i,
			showword : '测试啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊' + i,
			wordsstat : i,
			shadow_url : 'http://www.www.chingllaldfja.com.com.com/adfc/aljfa/actxdskfkdsflskjfldsfsf;lskf;sf'
					+ i,
			paysum : 145.33,
			clks : 34552,
			bid : (i % 2 === 1) ? null : 1.5,
			unitbid : 0.5,
			wurl : '',
			isdecr : i % 2,
			beginvalue : i * 1000,
			endvalue : (i - 1) * 1000,
			decr : 1000,
			valuetype : ['shows', 'clks', 'pv'][i % 3]
		});
	}

	rel.data.listData = listData;

	return rel;
};

/**
 * 关键词暂停推广
 * 
 * @param {Object}
 *            param
 */
Requester.debug.GET_ao_wordpausedetail = function(level, param) {
	var rel = new Requester.debug.returnAoWord(param), listData = [], i;

	for (i = param.startindex; i <= param.endindex; i++) {
		listData.push({
					planid : i,
					planname : '关键暂停推广<button>这个长计划' + i + '啊啊啊啊啊啊啊啊啊',
					unitid : i,
					unitname : '关键暂停推广<button>这个长单元' + i + '啊啊啊啊啊啊啊啊啊',
					winfoid : i,
					showword : '测试啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊' + i,
					paysum : 145.33,
					clks : 34552,
					bid : (i % 2 === 1) ? null : 1.5,
					unitbid : 0.5,
					isdecr : i % 2,
					beginvalue : i * 1000,
					endvalue : (i - 1) * 1000,
					decr : 1000,
					valuetype : ['shows', 'clks', 'pv'][i % 3]
				});
	}

	rel.data.listData = listData;

	return rel;
};

/**
 * 单元暂停推广
 * 
 * @param {Object}
 *            param
 */
Requester.debug.GET_ao_unitpausedetail = function(level, param) {
	var rel = new Requester.debug.returnAoWord(param), listData = [], i;

	for (i = param.startindex; i <= param.endindex; i++) {
		listData.push({
					planid : i,
					planname : '单元暂停推广<button>这个长计划' + i + '啊啊啊啊啊啊啊啊啊',
					unitid : i,
					unitname : '单元暂停推广<button>这个长单元' + i + '啊啊啊啊啊啊啊啊啊',
					paysum : 145.33,
					clks : 34552,
					isdecr : i % 2,
					beginvalue : i * 1000,
					endvalue : (i - 1) * 1000,
					decr : 1000,
					valuetype : ['shows', 'clks', 'pv'][i % 3]
				});
	}

	rel.data.listData = listData;

	return rel;
};

/**
 * 计划暂停推广
 * 
 * @param {Object}
 *            param
 */
Requester.debug.GET_ao_planpausedetail = function(level, param) {
	var rel = new Requester.debug.returnAoWord(param), listData = [], i;

	for (i = param.startindex; i <= param.endindex; i++) {
		listData.push({
					planid : i,
					planname : '计划暂停推广<button>这个长计划' + i + '啊啊啊啊啊啊啊啊啊',
					paysum : 145.33,
					clks : 34552,
					isdecr : i % 2,
					beginvalue : i * 1000,
					endvalue : (i - 1) * 1000,
					decr : 1000
				});
	}
	listData = [{
				planid : i,
				planname : '计划暂停推广<button>这个长计划' + i + '啊啊啊啊啊啊啊啊啊',
				paysum : 145.33,
				clks : 34552,
				isdecr : i % 2,
				beginvalue : i * 1000,
				endvalue : (i - 1) * 1000,
				decr : 1000
			}];

	rel.data.listData = listData;

	return rel;
};

/**
 * 关键词检索量过低
 * 
 * @param {Object}
 *            param
 */
Requester.debug.GET_ao_wordpvtoolowdetail = function(level, param) {
	var rel = new Requester.debug.returnAoWord(param), listData = [], i;

	for (i = param.startindex; i <= param.endindex; i++) {
		listData.push({
					planid : i,
					planname : '关键词检索量过低<button>这个长计划' + i + '啊啊啊啊啊啊啊啊啊',
					unitid : i,
					unitname : '关键词检索量过低<button>这个长单元' + i + '啊啊啊啊啊啊啊啊啊',
					winfoid : i,
					showword : '测试啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊' + i,
					wordstat : i,
					paysum : 145.33,
					clks : 34552,
					bid : (i % 2 === 1) ? null : 1.5,
					unitbid : 0.5,
					isdecr : i % 2,
					beginvalue : i * 1000,
					endvalue : (i - 1) * 1000,
					decr : 1000,
					valuetype : ['shows', 'clks', 'pv'][i % 3]
				});
	}

	rel.data.listData = listData;

	return rel;
};

/**
 * 关键词跳出率较高详情
 * 
 * @param {Object}
 *            param
 */
Requester.debug.GET_ao_wordbouncedetail = function(level, param) {
	var rel = new Requester.debug.returnAoWord(param), listData = [], i;

	for (i = param.startindex; i <= param.endindex; i++) {
		listData.push({
					planid : i,
					planname : '关键词跳出率<button>这个长计划' + i + '啊啊啊啊啊啊啊啊啊',
					unitid : i,
					unitname : '关键词跳出率<button>这个长单元' + i + '啊啊啊啊啊啊啊啊啊',
					winfoid : i,
					showword : '测试' + i,
					bouncerate : '30%'
				});
	}

	rel.data.listData = listData;

	return rel;
};

/**
 * 创意跳出率较高详情
 * 
 * @param {Object}
 *            param
 */
Requester.debug.GET_ao_ideabouncedetail = function(level, param) {
	var rel = new Requester.debug.returnAoWord(param), listData = [], i;

	for (i = param.startindex; i <= param.endindex; i++) {
		listData.push({
					planid : i,
					planname : '创意跳出率<button>这个长计划' + i + '啊啊啊啊啊啊啊啊啊',
					unitid : i,
					unitname : '创意跳出率<button>这个长单元' + i + '啊啊啊啊啊啊啊啊啊',
					ideaid : i,
					idea : '创意跳出率<button>这个长创意' + i + '啊啊啊啊啊啊啊啊啊',
					title : '题目' + i,
					desc1 : '描述(1)' + i,
					desc2 : '描述(2)' + i,
					url : 'http://www.baidu.com/' + i,
					showurl : 'http://www.baidu.com/' + i,
					ideastat : i,
					shadow_ideaid : i,
					shadow_title : 'shadow题目' + i,
					shadow_desc1 : 'shadow描述(1)' + i,
					shadow_desc2 : 'shadow描述(2)' + i,
					shadow_url : 'http://www.baidu.com/' + i,
					shadow_showurl : 'http://www.baidu.com/' + i,
					shadow_ideastat : i,
					bouncerate : '30%'
				});
	}

	rel.data.listData = listData;

	return rel;
};

/**
 * 账户优化子项详情，关键词质量度过低无法获取稳定的左侧展现资格
 */
Requester.debug.GET_ao_showqdetail = function(level, param) {
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
			showqstat : 11,
			clks : 34550 + i,
			paysum : 145.33 + i,
			ideacount : i,
			isdecr : i % 2,
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
	// data.listData = null;

	rel.data = data;

	return rel;
};

/**
 * 左侧首屏展现概率详情
 */
Requester.debug.GET_ao_leftscreendetail = function(level, param) {
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
					planname : '左侧首屏计划' + (param.startindex + i + 100)
							+ '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
					unitid : param.startindex + i + 101,
					unitname : '左侧首屏长单元' + (param.startindex + i + 101)
							+ '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
					winfoid : param.startindex + i,
					showword : '左侧首屏关键字' + (param.startindex + i)
							+ '就看见了进我空间看我就快乐健康',
					showqstat : 11,
					clks : 34550 + i,
					paysum : 145.33 + i,
					ideacount : i,
					bid : (i % 2 === 1) ? null : 1.5,
					unitbid : 0.5,
					// 日期: 展现概率
					lefthistory : [{
								date : 20110530,
								value : 20
							}, {
								date : 20110630,
								value : 30
							}, {
								date : 20110730,
								value : 40
							}, {
								date : 20110830,
								value : 50
							}]
				});
	}

	data.listData = listData;

	rel.data = data;

	return rel;
};

/**
 * 左侧首位展现概率详情
 */
Requester.debug.GET_ao_lefttopdetail = function(level, param) {
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
					planname : '左侧首位计划' + (param.startindex + i + 100)
							+ '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
					unitid : param.startindex + i + 101,
					unitname : '左侧首位单元' + (param.startindex + i + 101)
							+ '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
					winfoid : param.startindex + i,
					showword : '左侧首位关键字' + (param.startindex + i)
							+ '就看见了进我空间看我就快乐健康',
					showqstat : 11,
					clks : 34550 + i,
					paysum : 145.33 + i,
					ideacount : i,
					bid : (i % 2 === 1) ? null : 1.5,
					unitbid : 0.5,
					lefttop : 31,
					leftscreen : null,
					lefthistory : [{
								date : 20110530,
								value : 20
							}, {
								date : 20110630,
								value : 30
							}, {
								date : 20110730,
								value : 40
							}, {
								date : 20110830,
								value : 50
							}]
				});
	}

	data.listData = listData;

	rel.data = data;

	return rel;
};

/**
 * 创意待激活
 * 
 * @param level
 * @param param
 */
Requester.debug.GET_ao_ideaactivedetail = function(level, param) {
	var rel = new Requester.debug.returnTpl(), data = {
		signature : 'IU！%RUHA', // 签名，用于记录一组condition状态
		aostatus : 0, // 请求状态，0-处理正常，1-请求格式错误，2-系统内部错误，3-任务队列已满，请重试，4-需要更详细的请求数据，不只是签名
		totalnum : 1400, // 结果的总条数
		returnnum : 5, // 本次返回的条数
		timestamp : 127831067988222, // 任务完成的时间戳
		listData : []
	}, listData = [], i;
	for (i = 0; i < data.returnnum; i++) {
		listData.push({
					planid : param.startindex + i + 100,
					planname : '创意待激活计划' + (param.startindex + i + 100)
							+ '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
					unitid : param.startindex + i + 101,
					unitname : '创意待激活单元' + (param.startindex + i + 101)
							+ '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
					ideaid : param.startindex + i + 100,
					idea : 'idea' + (param.startindex + i + 100),
					title : 'title' + (param.startindex + i + 100),
					desc1 : 'desc1' + (param.startindex + i + 100),
					desc2 : 'desc2' + (param.startindex + i + 100),
					url : 'url' + (param.startindex + i + 100),
					showurl : 'showurl' + (param.startindex + i + 100),
					ideastat : i % 5 == 3 ? 5 : i % 5,
					shadow_ideaid : param.startindex + i + 200,
					shadow_title : 'shadow_title'
							+ (param.startindex + i + 200),
					shadow_desc1 : 'shadow_desc1'
							+ (param.startindex + i + 200),
					shadow_desc2 : 'shadow_desc2'
							+ (param.startindex + i + 200),
					shadow_url : 'shadow_url' + (param.startindex + i + 200),
					shadow_showurl : 'shadow_showurl'
							+ (param.startindex + i + 200),
					shadow_ideastat : (i + 1) % 5 == 3 ? 5 : (i + 1) % 5,

					clks : 34550 + i,
					paysum : 145.33 + i
				});
	}

	data.listData = listData;

	rel.data = data;

	return rel;
};
/**
 * 创意不宜推广
 * 
 * @param level
 * @param param
 */
Requester.debug.GET_ao_idearejecteddetail = function(level, param) {
	var rel = new Requester.debug.returnTpl(), data = {
		signature : 'IU！%RUHA', // 签名，用于记录一组condition状态
		aostatus : 0, // 请求状态，0-处理正常，1-请求格式错误，2-系统内部错误，3-任务队列已满，请重试，4-需要更详细的请求数据，不只是签名
		totalnum : 130, // 结果的总条数
		returnnum : 5, // 本次返回的条数
		timestamp : 127831067988222, // 任务完成的时间戳
		listData : []
	}, listData = [], i;
	for (i = 0; i < data.returnnum; i++) {
		listData.push({
					planid : param.startindex + i + 100,
					planname : '创意不宜推广计划' + (param.startindex + i + 100)
							+ '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
					unitid : param.startindex + i + 101,
					unitname : '创意不宜推广单元' + (param.startindex + i + 101)
							+ '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
					ideaid : param.startindex + i + 100,
					idea : 'idea' + (param.startindex + i + 100),
					title : 'title' + (param.startindex + i + 100),
					desc1 : 'desc1' + (param.startindex + i + 100),
					desc2 : 'desc2' + (param.startindex + i + 100),
					url : 'url' + (param.startindex + i + 100),
					showurl : 'showurl' + (param.startindex + i + 100),
					ideastat : i % 5 == 3 ? 5 : i % 5,
					shadow_ideaid : param.startindex + i + 200,
					shadow_title : 'shadow_title'
							+ (param.startindex + i + 200),
					shadow_desc1 : 'shadow_desc1'
							+ (param.startindex + i + 200),
					shadow_desc2 : 'shadow_desc2'
							+ (param.startindex + i + 200),
					shadow_url : 'shadow_url' + (param.startindex + i + 200),
					shadow_showurl : 'shadow_showurl'
							+ (param.startindex + i + 200),
					shadow_ideastat : (i + 1) % 5 == 3 ? 5 : (i + 1) % 5,

					clks : 34550 + i,
					paysum : 145.33 + i
				});
	}

	data.listData = listData;

	rel.data = data;

	return rel;
};
/**
 * 创意暂停推广
 * 
 * @param level
 * @param param
 */
Requester.debug.GET_ao_ideapausedetail = function(level, param) {
	var rel = new Requester.debug.returnTpl(), data = {
		signature : 'IU！%RUHA', // 签名，用于记录一组condition状态
		aostatus : 0, // 请求状态，0-处理正常，1-请求格式错误，2-系统内部错误，3-任务队列已满，请重试，4-需要更详细的请求数据，不只是签名
		totalnum : 120, // 结果的总条数
		returnnum : 5, // 本次返回的条数
		timestamp : 127831067988222, // 任务完成的时间戳
		listData : []
	}, listData = [], i;
	for (i = 0; i < data.returnnum; i++) {
		listData.push({
					planid : param.startindex + i + 100,
					planname : '创意暂停计划' + (param.startindex + i + 100)
							+ '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
					unitid : param.startindex + i + 101,
					unitname : '创意暂停单元' + (param.startindex + i + 101)
							+ '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
					ideaid : param.startindex + i + 100,
					idea : 'idea' + (param.startindex + i + 100),
					title : 'title' + (param.startindex + i + 100),
					desc1 : 'desc1' + (param.startindex + i + 100),
					desc2 : 'desc2' + (param.startindex + i + 100),
					url : 'url' + (param.startindex + i + 100),
					showurl : 'showurl' + (param.startindex + i + 100),
					ideastat : i % 5 == 3 ? 5 : i % 5,
					pausestat : i % 2,
					shadow_ideaid : param.startindex + i + 200,
					shadow_title : 'shadow_title'
							+ (param.startindex + i + 200),
					shadow_desc1 : 'shadow_desc1'
							+ (param.startindex + i + 200),
					shadow_desc2 : 'shadow_desc2'
							+ (param.startindex + i + 200),
					shadow_url : 'shadow_url' + (param.startindex + i + 200),
					shadow_showurl : 'shadow_showurl'
							+ (param.startindex + i + 200),
					shadow_ideastat : (i + 1) % 5 == 3 ? 5 : (i + 1) % 5,

					clks : 34550 + i,
					paysum : 145.33 + i
				});
	}

	data.listData = listData;

	rel.data = data;

	return rel;
};

Requester.debug.GET_ao_ideaactivedetailideaids = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	var data = {
		signature : 'IU！%RUHA', // 签名，用于记录一组condition状态
		aostatus : +prompt('4-需要更详细的请求数据', 0), // 请求状态，0-处理正常，1-请求格式错误，2-系统内部错误，3-任务队列已满，请重试，4-需要更详细的请求数据，不只是签名
		ideaid : [1, 2, 3, 4, 5]
	};

	rel.data = data;
	return rel;
};

Requester.debug.GET_ao_ideapausedetailideaids = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	var data = {
		signature : 'IU！%RUHA', // 签名，用于记录一组condition状态
		aostatus : 0, // 请求状态，0-处理正常，1-请求格式错误，2-系统内部错误，3-任务队列已满，请重试，4-需要更详细的请求数据，不只是签名
		ideaid : [1, 2, 3, 4, 5]
	};

	rel.data = data;
	return rel;
};
/**
 * 获取左侧首屏/首位展现概率阈值
 */
Requester.debug.GET_ao_thresholdvalue = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = [40, 60];
	return rel;
};
/**
 * 修改左侧首屏/首位展现概率阈值
 */
Requester.debug.MOD_ao_thresholdvalue = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	var data = {};
	rel.data = data;
	return rel;
};
/**
 * 单元暂停推广
 *
 * @param {Object}
 *            param
 */
Requester.debug.GET_ao_sgtcycdetail = function(level, param) {
    var rel = new Requester.debug.returnAoWord(param);
//    rel.data.aostatus = 4;

    var recmdSchedule = {
        suggestcyccnt: 3,
        suggestcyc : '[[201,204]]',//"[[204,208],[109,111],[308,318],[609,618],[715,720]]",
        plancyc : "[[101,102],[118,121],[114,118]]",
        potionalclk: [],//"[13, 34, 16, 88, 30, 90]",
        hotlevel: []//"[53, 34, 76, 18, 60, 20]"
    };

    for (var i = recmdSchedule.suggestcyccnt; i --;) {
        recmdSchedule.potionalclk[i] = parseInt(Math.random() * 100);
        recmdSchedule.hotlevel[i] = parseInt(Math.random() * 100);
    }

    recmdSchedule.potionalclk = '[' + recmdSchedule.potionalclk.toString() + ']';
    recmdSchedule.hotlevel = '[' + recmdSchedule.hotlevel.toString() + ']';

    rel.data.listData = [recmdSchedule];

    rel.timeout = 1500;
//    rel.status = 400;
    return rel;
};
