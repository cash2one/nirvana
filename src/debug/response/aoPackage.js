/** ********************* 老户优化相关接口 nikon ********************** */

/**
 * 获取概况页优化包状态
 */
Requester.debug.GET_nikon_packagestatus = function(a, b) {
	var rel = new Requester.debug.returnTpl();

    var viewInfoMap = debugUtil.viewAoPkgMap || {};
    function getViewBoxFlag(pkgId, flag) {
        flag = flag || 0;
        var num = viewInfoMap[pkgId] || 0;
        return num >= 2 ? 0 : flag;
    }

	var command = b.command;
	if (command == 'start') {
		kslfData1 = 0;
	}
	rel.data = {
		aostatus : kslfData1 < 2 ? 1 : 0,
		reqid : '1234',
		aoPackageItems : [{
					pkgid : 4,
					newoptnum : kslfData1 < 2 ? 1 : 2,
                    viewBoxFlag: getViewBoxFlag(4, 2), // 升级包//新增用来标识优化包的提醒框展示样式，0=正常包1=新包，2=更新包
                    data : {
						proctime : new Date().valueOf(),
						probwordnum : 134,
						globalId : '123',
                        noleftscreennum: Math.ceil(Math.random() * 50), // 不在左侧词个数
                        budgetnotenoughnum: Math.ceil(Math.random() * 50), // 预算不足个数
                        showqlownum: Math.ceil(Math.random() * 50), // 质量度过低
                        searchnoeffnum: Math.ceil(Math.random() * 50), // 搜索无效
                        searchlownum: Math.ceil(Math.random() * 50), // 搜索量过低
                        rankdownnum: Math.ceil(Math.random() * 50) // 下降个数
					}
				}, {
					pkgid : 2,
					newoptnum : 3,
					data : {
						totalclklost : '8000',
						globalId : '123'
					}
				}, {
					pkgid : 3,
					newoptnum : 3,
					data : {
						startype : '3',
						num : '72',
						totalnum : '258',
						globalId : '123'
					}
				}, {
					pkgid : 1,
					newoptnum : 12,
					data : {
						decrtype : 'shows',
						beginvalue : '258',
						endvalue : '186',
						datetype : 0,
						globalId : '123'
						// 0表示节假日，1表示工作日
					}
				}, {
					pkgid : 5,
					newoptnum : kslfData1 < 2 ? -1 : 2,
					data : {
						totalwordsnum : '300',
						globalId : '123'
					}
				}, {
					pkgid : 6,
					newoptnum : kslfData1 < 2 ? -1 : '3',
					data : {
						percent : "30",//parseInt(Ma//(parseInt(Math.random() * 10) % 2 + 1) + ""th.random() * 100) + "",
						tiptype : '2',//(parseInt(Math.random() * 10) % 2 + 1) + ""
						globalId : '123'
					}
				}, { // 突降急救包升级版
                    pkgid : 7,
                    newoptnum : kslfData1 < 2 ? -1 : '5',
                    data : {
                        beginvalue : '358',
                        endvalue : '196',
                        begindate: '' + ((new Date()).getTime() - 1000000000),
                        enddate: (new Date()).getTime(),
                        globalId : '123'
                    }
                }, { // 移动包
                    pkgid : 8,
                    viewBoxFlag: getViewBoxFlag(8, 1),
                    newoptnum : kslfData1 < 2 ? -1 : '5',
                    data : {
                        //没有
                    }
                }, {
                    pkgid: 9, // 旺季包
                    viewBoxFlag: getViewBoxFlag(9, 1),
                    newoptnum : kslfData1 < 2 ? -1 : '5',
                    data : {
                        beforepeaknum: '2',
                        inpeaknum: '1',
                        afterpeaknum: 1
                    }
                }]
	};

	kslfData1++;
//    rel.timeout = 5000;

	return rel;
};
/**
 * 获取包摘要的优化项信息接口
 */
Requester.debug.GET_nikon_abstract = function(p1, params) {
	var rel = new Requester.debug.returnTpl();
	// 先以效果恢复包为例，进行数据返回，三次之后全部成功
	var opttypes = baidu.object.clone(params.absreqitems), opttime = (new Date())
			.valueOf();
	var result = [], reqid, itemdata, returns = [], defaultOkData = {
		status : 0, // 正常
		hasproblem : 1,//Math.ceil(Math.random()*10) % 2,
		optmd5 : kmd5,
		opttime : opttime,
		data : {
			isnew : 'true'
		},
		compData : []
	}, defaultRunningData = {
		status : 1, // 计算中
		hasproblem : 1,
		optmd5 : kmd5,
		opttime : opttime,
		data : {},
		compData : []
	};

	var maxtry = 1;//5;
	if (params.command == 'start') {
		kslfData = 0;
	}

	if (kslfData == 0) {
		reqid = Math.round(Math.random() * 10000);
	} else {
		reqid = params.reqid;
	}
	rel.data = {
		aostatus : 0,
		reqid : reqid,
		absresitems : []
	};

	// 效果回复 id 1：101, 102, 103, 104, 106, 107, 108, 109, 114, 115, 111, 112,
	// 113, 105, 110, 116
	// 扩大商机 id 2：201, 202, 204, 205, 203
	// 质量度 id 3：301, 302, 303
	// result = opttypes;

	//result = opttypes;
	result = [];
	if (kslfData >= maxtry) {
		result = opttypes;
	}
	else{
		result.push(opttypes[0]);
		result.push(opttypes[5]);
	}

	/*
	 * switch(kslfData){ case 0 : result = []; switch(params.pkgids[0]){ case
	 * '1': returns = [101, 102, 104, 106, 108]; break; case '2': returns =
	 * [202, 204]; break; case '3': returns = [303]; break; }
	 * 
	 * for(var n = 0; n < returns.length; n++){ for(var o in opttypes){
	 * if(opttypes[o].opttypeid == returns[n]){ result.push(opttypes[o]); break; } } }
	 * 
	 * break; case 1 : result = []; switch(params.pkgids[0]){ case '1': returns =
	 * [103, 105, 115, 113]; break; case '2': returns = [201]; break; case '3':
	 * returns = [302]; break; }
	 * 
	 * for(var n = 0; n < returns.length; n++){ for(var o in opttypes){
	 * if(opttypes[o].opttypeid == returns[n]){ result.push(opttypes[o]); break; } } }
	 * 
	 * break; case 2 : default : result = opttypes; break }
	 */
	for (var i = 0; i < opttypes.length; i++) {
		if (baidu.array.indexOf(result, opttypes[i]) > -1) {
			itemdata = baidu.object.clone(defaultOkData);
			itemdata.opttypeid = opttypes[i].opttypeid;
			itemdata.optmd5 = opttypes[i].opttypeid;
			switch (+opttypes[i].opttypeid) {
				case 101 :
					itemdata.data = {
						rank : 1,
						decrtype : 'clks',
						isnew : 'true'
					};
					break;
				case 102 : // 账户预算
					itemdata.data = {
						offtime : (new Date()).valueOf(),
						suggestbudget : 213.111,
						bgttype : 2,
						rank : 1,
						decrtype : 'clks',
						isnew : 'true',
						clklost : 0
					};
					break;
				case 103 : // 计划预算
					itemdata.data = {
						count : 5,
						rank : 1,
						isnew : 'true',
						decrtype : 'clks',
						clklost : 200
					};
					for (var m = 0; m < 4; m++) {
						itemdata.compData.push({
                                    isnew: 'true',
									planname : '这是一个很长的预算计划啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
									offtime : (new Date()).valueOf(),
									planid : 100 + m,
									suggestbudget : 100 + m, // 建议预算，元
									optmd5 : opttypes[i].opttypeid + '_' + m,
									bgttype : 1,
									clklost : 50
								});
					}
					break;
				case 104 : // 搁置时段
					itemdata.data = {
						count : 5,
						rank : 2,
						isnew : 'true',
						decrtype : 'clks'
					};
					for (var m = 0; m < 2 - kslfData; m++) {
						itemdata.compData.push({
									planname : '这是一个很长的测试计划啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
									offtime : (new Date()).valueOf(),
									isnew : m % 3 == 0 ? 'true' : 'false',
									planid : 100 + m,
									optmd5 : opttypes[i].opttypeid + '_' + m
								});
					}
					break;
				case 105 :
				case 106 :
				case 107 :
				case 108 :
				case 109 :
				case 110 :
				case 111 :
				case 112 :
				case 113 :
				case 114 :
				case 115 :
				case 116 :
					itemdata.data = {
						count : opttypes[i].opttypeid,
						totalrecmnum : 20,
						totalnum : 7,
						rank : 2,
						decrtype : 'clks'
					};
					if (opttypes[i].opttypeid == 111
							|| opttypes[i].opttypeid == 116) {
						itemdata.data.rank = 1;
					} else if (opttypes[i].opttypeid == 110) {
						itemdata.data.rank = 3;
					}

					break;
				case 201 :
					itemdata.data = {
						suggestbudget : 100.333, // 建议预算
						clklost : 18, // 损失点击数
						modelcount : 14, // 同行数量，有可能不存在该key
						isnew : 'true',
						bgttype : 1
						// 预算类型。0：未设置预算。1：设置日预算。2：设置周预算。
					};
					break;
				case 202 :
					itemdata.data = {
						count : 5,
						// clklost : 18,
						isnew : 'true'
					};
					for (var m = 0; m < 1; m++) {
						itemdata.compData.push({
							planid : 100 + m,
							planname : '<button>&lt;这是一个很长的预算计划啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊'
									+ m,
							offtime : (new Date()).valueOf(),
							suggestbudget : 100.444 + m, // 建议预算，元
							clklost : m,
							modelcount : 16,
							optmd5 : opttypes[i].opttypeid + '_' + m,
							bgttype : 1, // 预算类型。0：未设置预算。1：设置日预算
							isnew : 'true'
						});
					}
					break;
				case 203 :
				case 204 :
				case 205 :
					itemdata.data = {
						count : opttypes[i].opttypeid,
						totalrecmnum : 20,
						totalnum : 7,
						isnew : 'true'
					};
					break;
                case 206: // 开拓客源包新增的时段优化项
                    itemdata.data = {
                        count: 3,
                        lostclks: opttypes[i].opttypeid
                    };
                    var num = 3;
                    for (var m = 0; m < num; m++) {
                        itemdata.compData.push({
                            planid : 100 + m,
                            planname : '<button>&lt;这是一个很长的预算计划啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊'
                                + m,
                            cycnum : parseInt(Math.random() * 24 * 7),
                            extraclks: parseInt(Math.random() * 1000),
                            optmd5 : opttypes[i].opttypeid + '_' + m // 别忘了这个
                        });
                    }
                    break;
				case 301 :
					itemdata.data = {
						count : 20,
						totalrecmnum : 20,
						totalnum : 7,
						isnew : 'true'
					};
					break;
				case 302 :
					itemdata.data = {
						count : 10
					};
					break;
				case 303 :
					itemdata.compData = [{
								startype : 1,
								count : 2,
								word_cnt_11 : 11,
								word_cnt_12 : 12,
								word_cnt_13 : 13
							}, {
								startype : 2,
								count : 3,
								word_cnt_21 : 21,
								word_cnt_23 : 23
							}]
					break;
				case 501 :
					itemdata.data = {
                        isnew: 'true',
						count : 501,
						totalrecmnum : 20,
						totalnum : 7,
						previewwords : '钱塘江,中国结,教师,渐进增强'
					};
					break;
				case 502 :
                    itemdata.status = 2;
					itemdata.data = {
                        isnew: 'true',
						count : 502,
						totalrecmnum : 110,
						totalnum : 10,
						previewwords : '张家界,乐乐网'
					};
					break;
				case 503 :
					itemdata.data = {
                        isnew: 'true',
						count : 503,
						totalrecmnum : 20,
						totalnum : 7,
						previewwords : '钱塘江汉中二啊的,中国结呵罗丽是是,我们的欧式李的个,渐进增强就是额宿舍,我们的欧式猪额反反复复'
					};
					break;
				case 504 :
					itemdata.data = {
                        isnew: 'true',
						count : 504,
						totalrecmnum : 20,
						totalnum : 7,
						previewwords : '钱塘江汉中二啊的,中国结呵罗丽是是,我们的欧式李的个,渐进增强就是额宿舍,我们的欧式猪额反反复复'
					};
					break;
				/**********行业领先包的优化建议**************/
				case 601 : // 账户预算建议 
				    //itemdata.hasproblem = parseInt(Math.random() * 10) % 2;
					itemdata.data = {
				    	tiptype : (parseInt(Math.random() * 10) % 2 + 1) + '' ,
						percent : '88',
						clklost: '2323',
						bgttype : parseInt(Math.random()) + 1,
						suggestbudget: '235'
				    };
				    break;
				case 602 : // 行业领先包计划预算优化建议
				    //itemdata.hasproblem = parseInt(Math.random() * 10) % 2;
					itemdata.data = {
						count : 12,
						clklost: 238
					};
					var num = parseInt(Math.random() * 15) + 1;
					for (var m = 0; m < num; m++) {
						itemdata.compData.push({
							planid : 100 + m,
							planname : '<button>&lt;这是一个很长的预算计划啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊'
									+ m,
							optmd5 : opttypes[i].opttypeid + '_' + m, // 别忘了这个
							suggestbudget : 100.444 + m // 建议预算，元
						});
					}
					break;
				case 603 : // 推广时段
				    //itemdata.hasproblem = parseInt(Math.random() * 10) % 2;
					itemdata.data = {
						count : 5
					};
					var num = parseInt(Math.random() * 10) + 1;
					for (var m = 0; m < num; m++) {
						itemdata.compData.push({
							planid : 100 + m,
							planname : '<button>&lt;这是一个很长的预算计划啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊'
									+ m,
							cycnum : parseInt(Math.random() * 24 * 7),
							optmd5 : opttypes[i].opttypeid + '_' + m // 别忘了这个
						});
					}
					break;
				case 604 : // 行业优质词 
					//itemdata.hasproblem = parseInt(Math.random() * 10) % 2;
				    itemdata.data = {
				    	totalrecmnum : '50',
						totalnum : '12'
				    };
				    break;
				case 605 : // 搜索无效
					//itemdata.hasproblem = parseInt(Math.random() * 10) % 2;
					itemdata.data = {
						count : 13
					};
					break;
				case 606 : // 关键词匹配
					//itemdata.hasproblem = parseInt(Math.random() * 10) % 2;
					itemdata.data = {
						count : 15
					};
					break;
				case 607 : // 关键词出价
					//itemdata.hasproblem = parseInt(Math.random() * 10) % 2;
					itemdata.data = {
						count : 34
					};
					break;
				case 608 : // 质量度优化
					//itemdata.hasproblem = parseInt(Math.random() * 10) % 2;
					itemdata.data = {
					};
					break;
                /**********突降急救包升级版的优化建议**************/
                case 701: // 账户余额为零
                    itemdata.data = {};
                    break;
                case 702: // 账户预算下调
                case 703: // 账户预算不足
                    itemdata.data = {
                        enddate: (new Date()).getTime() + '',
                        offtime : (new Date()).getTime()/*,
                        suggestbudget : 213.111,
                        bgttype : 2*/
                    };
                    break;
                case 704: // 计划被删除
                case 705: // 计划被暂停
//                    itemdata.hasproblem = 1;
                    itemdata.data = {
                        totalrecmnum : '50',
                        count : Math.ceil(Math.random() * 100),
                        totalprocount: Math.ceil(Math.random() * 1000),
                        isnew: 'true'
                    };
                    break;
                case 706 : // 计划预算下调
                case 707: // 计划预算不足
                    var num = 1;
                    itemdata.data = {
                        enddate: (new Date()).getTime() + '',
                        count : num
                    };
                    for (var m = 0; m < num; m++) {
                        itemdata.compData.push({
                            planid : 100 + m,
                            isnew: 'true',
                            planname : '预算计划这是一个很长的预算计划啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊'
                                + m,
                            offtime : (new Date()).getTime(),
                            optmd5 : opttypes[i].opttypeid + '_' + m // 别忘了这个
                        });
                    }
                    break;
                case 708: // 时段设置不合理
                    var num = 1;
                    itemdata.data = {
                        count : num
                    };
                    for (var m = 0; m < num; m++) {
                        itemdata.compData.push({
                            planid : 100 + m,
                            planname : '这是一个很长的时段计划啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊'
                                + m,
                            optmd5 : opttypes[i].opttypeid + '_' + m // 别忘了这个
                        });
                    }
                    break;
                case 709: // 单元被删除
                case 710: // 单元被暂停
                    itemdata.data = {
                        totalrecmnum : '50',
                        count : Math.ceil(Math.random() * 100),
                        totalprocount: Math.ceil(Math.random() * 1000)
                    };
                    break;
                case 711: // 关键词被删除
                case 712: // 关键词被暂停
                case 713: // 关键词搜索无效
                case 714: // 关键词不宜推广
                case 715: // 关键词检索量过低
                case 716: // 关键词检索量下降
                case 717: // 关键词匹配模式缩小
                case 718: // 关键词左侧排名下降
                    itemdata.data = {
                        enddate: (new Date()).getTime() + '',
                        totalrecmnum : '50',
                        count: Math.ceil(Math.random() * 1000)
                    };
                    break;
                case 801 : // 推词
                    itemdata.data = {
                        isnew: 'true',
                        count : 801,
                        totalrecmnum : 20,
                        totalnum : 7
                    };
                    break;
                case 802 : // 提价，优化
                    itemdata.data = {
                        count : 802,
                        totalrecmnum : 20,
                        rank : 2
                    };
                    break;
                case 803 : // 搜索词无效
                    itemdata.data = {
                        count : 803,
                        totalnum : 11,
                        rank : 2
                    };
                    break;
                case 805 : // 搜索词无效
                    itemdata.data = {
                        count : 805,
                        totalnum : 11,
                        rank : 2
                    };
                    break;
                case 806 : // 搜索词无效
                    itemdata.data = {
                        count : 806,
                        totalnum : 11,
                        rank : 2
                    };
                    break;
                case 807 : // 搜索词无效
                    itemdata.data = {
                        count : 807,
                        totalnum : 11,
                        rank : 2
                    };
                    break;
                //////////////////行业旺季包优化项
                case 901: // 账户预算
                    itemdata.data = {
                        count: 1
                    };
                    break;
                case 902: // 计划预算
                    itemdata.data = {
                        count: parseInt(Math.random() * 100)
                    };
                    break;
                case 903: // 关键词出价
                    itemdata.data = {
                        count: parseInt(Math.random() * 100)
                    };
                    break;
                case 904: // 提词
                    itemdata.data = {
                        totalrecmnum: 80,
                        count: parseInt(Math.random() * 100)
                    };
                    break;
                case 906:
                    itemdata.data = {
                        count: parseInt(Math.random() * 100)
                    };
                    break;
			}
			itemdata.data.globalId = new Date().valueOf();
			rel.data.absresitems.push(itemdata);
		} else {
			itemdata = baidu.object.clone(defaultRunningData);
			itemdata.opttypeid = opttypes[i].opttypeid;
			itemdata.optmd5 = opttypes[i].opttypeid;
			itemdata.data = {
				globalId : (new Date()).valueOf()
			};
			rel.data.absresitems.push(itemdata);
		}
	}
	kslfData++;
	
//	rel.timeout = 5500;
	return rel;

};
/*********** 行业旺季包新增接口 *****************/
Requester.debug.GET_nikon_peaktradesinfo = function (p1, params) {
    var rel = new Requester.debug.returnTpl();
    rel.status = 200;
    rel.data = {
        aostatus: 0,
        desc: {
            beforepeaknum: 3,
            inpeaknum: 2,
            afterpeaknum: 1
        }
    };

    var tradeList = [
        '西藏旅游abctest旅游啦啦啦啦啦史蒂芬斯拉夫<input />test',
        '广西旅游',
        '非洲5国游',
        '尼泊尔旅游尼泊尔旅游尼泊尔旅游尼泊尔旅游尼泊尔旅游',
        '云南旅游'
    ];
    var listData = [];
    rel.data.listData = listData;
    for (var i = 0; i < 5; i ++) {
        listData[i] = {
            tradeid: i + 100,
            tradename: tradeList[i],
            tradetype: 1 + i % 3
        };
    }
    rel.timeout = 1000;
    return rel;
};

/**
 * 包优化项应用
 */
Requester.debug.MOD_nikon_applyall = function(p1, params) {
	var rel = new Requester.debug.returnTpl();
	rel.status = 200;
	rel.data = {
		aostatus : 0,
		applyToken : (new Date()).valueOf()
	};
	kslfData2 = params.applyreqitems;
	kslfData1 = 0;
	return rel;
};

Requester.debug.GET_nikon_applyresult = function(p1, param) {
	var rel = new Requester.debug.returnTpl();
	var i;
	rel.status = 200;
	rel.data = {
		aostatus : 0,
		applyToken : param.applyToken,
		applyresitems : kslfData2
	};
	switch (kslfData1) {
		case 0 :
			for (i = 0; i < kslfData2.length / 2; i++) {
				baidu.object.extend(rel.data.applyresitems[i], {
							state : 0
						});
			}
			for (i; i < kslfData2.length; i++) {
				baidu.object.extend(rel.data.applyresitems[i], {
							state : 1
						});
			}
			break;
		default :
			for (i = 0; i < kslfData2.length; i++) {
				baidu.object.extend(rel.data.applyresitems[i], {
							state : 0
						});
			}
	}
	kslfData1++;
	return rel;

};

/**
 * 获取优化包详情
 */
Requester.debug.GET_nikon_detail = function(level, param) {

	var rel = new Requester.debug.returnTpl(), data = {
		aostatus : 0, // 详情页不用关注，直接根据外层的status判断（200,500,600）
		optmd5 : 1234567,
		totalnum : 23,//92,
		detailresitems : [],
		commData : {
			begindate : '1336140186475',
			enddate : '1336640186475'
		},
        listData: []
	}, detailresitems = [],
        opttypeid = param.opttypeid,
        startindex = param.condition.startindex,
        endindex = param.condition.endindex,
        len = Math.min((startindex + (endindex - startindex + 1)), data.totalnum);

	// 根据opttypeid，配置详情具体返回数据
	switch (+opttypeid) {
		/** ******** 效果恢复包 ********* */
		case 104 : // 推广时段
        case 708: // 突降急救包升级版的时段设置优化项
			detailresitems.push({
						suggestcyc : "[[104,108],[109,111]]",
						plancyc : "[[101,102],[107,110],[114,118]]"
					});
			break;
		// 被删除
		case 107 :
		case 109 :
		case 115 :
			for (; startindex < len; startindex++) {
				detailresitems.push({
					showword : '<input>' + startindex
							+ ' 被删除_的超长关键词超长关键词超长关键词超长关键词超长关键词',
					winfoid : 20000 + startindex,
					unitname : '暂停推_广单元暂停推广单元暂停推广单元暂停推广单元暂停推广单元暂停推广单元暂停推广单元暂停推广单元',
					planname : '暂停推_广计划暂停推广计划暂停推广计划暂停推广计划暂停推广计划暂停推广计划暂停推广计划暂停推广计划',
					planid : 100 + startindex,
					unitid : 1000 + startindex,
					wordid : 10000 + startindex,
					beginvalue : '898989',
					endvalue : '456',
					decr : '66666',
					pause : 1,
					bid : 345 + startindex + '',
					recmbid : 100 + startindex + '',
					suggestion : '启用',
					origshowword : '原来的关键词原来的关键词原来的关键词原来的关键词',
					wmatch : ['15', '31', '63'][startindex % 3],
					recmunitname : startindex % 3 == 0 ? ('很长很长的很长很长的很长很长的很长很长的很长很长的单元300' + startindex) : ('推广单元' + startindex),
					recmplanname : startindex % 3 == 0 ? ('涅槃计划_' + startindex) : ('推广计划' + startindex),
					recmbid : 100 + +startindex + '',
					recmwmatch : ['15', '31', '63'][startindex % 3],
					showdownratio : '10' // 自然检索量下降百分比数值
				});
			}
			break;
		case 110 :
		case 112 :
		case 113 :
        case 714: // 突降急救包升级版，关键词不宜推广
        case 715: // 突降急救包升级版，关键词检索量过低
        case 716: // 突降急救包升级版，关键词检索量下降
			for (; startindex < endindex + 1; startindex++) {
				detailresitems.push({
					showword : '<input>' + startindex
							+ ' 被删除的超长关键词超长关键词超长关键词超长关键词超长关键词',
					winfoid : 20000 + startindex,
					dailypv : 100,
					kwc : 5,
					isfstscreen : (((startindex - 13) > 0) ? 0 : 1) + '',
					recmunitname : '暂停推广单元暂停推广单元暂停推广单元暂停推广单元暂停推广单元暂停推广单元暂停推广单元暂停推广单元',
					recmplanname : '暂停推广计划暂停推广计划暂停推广计划暂停推广计划暂停推广计划暂停推广计划暂停推广计划暂停推广计划',
					recmplanid : 100 + startindex,
					recmunitid : 1000 + startindex,
					wordid : 10000 + startindex,
					beginvalue : '898989',
					endvalue : '456',
					decr : '66666',
					pause : 1,
					bid : 345 + startindex + '',
					recmbid : 100 + startindex + '',
					suggestion : '启用',
					origshowword : '原来的关键词原来的关键词原来的关键词原来的关键词',
					recmwmatch : ['15', '31', '63'][startindex % 3],
					showdownratio : '10' // 自然检索量下降百分比数值
				});
			}
			break;
		// 被暂停
		case 105 :
		case 106 :
		case 108 :
		case 114 :
			// 修改出价
		case 111 :
		case 116 :
		case 605 : // 行业领先包，搜索无效
        case 705:  // 突降急救包升级版，计划被暂停优化项
        case 710:  // 突降急救包升级版，单元被暂停优化项
        case 717:  // 突降急救包升级版，匹配模式缩小优化项
        case 718:  // 突降急救包升级版，左侧展现概率下降、平均排名下降、展现机会突降
        case 712:  // 突降急救包升级版，关键词暂停推广
        case 713:  // 突降急救包升级版，关键词搜索无效
            var optItem;
			for (; startindex < len; startindex++) {
                optItem = {
                    winfoid : 20000 + startindex,
                    showword : '<input>' + startindex
                        + ' 被暂停的超长关键词超长关键词超长关键词超长关键词超长关键词',
                    unitname : '暂停推广单元暂停推广单元暂停推广单元暂停推广单元暂停推广单元暂停推广单元暂停推广单元暂停推广单元',
                    planname : '暂停推广计划暂停推广计划暂停推广计划暂停推广计划暂停推广计划暂停推广计划暂停推广计划暂停推广计划',
                    planid : 100 + startindex,
                    unitid : 1000 + startindex,
                    wordid : 10000 + startindex,
                    beginvalue : '898989',
                    endvalue : '456',
                    decr : '66666',
                    pause : 1,
                    bid : 345 + startindex + '',
                    recmbid : 100 + startindex + '',
                    suggestion : '启用',
                    origshowword : '原来的关键词',
                    wmatch : ['15', '31', '63'][startindex % 3],
                    recmwmatch : ['15', '31', '63'][(startindex + 1) % 3],
                    beginwmatch : ['15', '31', '63'][(startindex + 1) % 3],
                    endwmatch : ['15', '31', '63'][(startindex + 2) % 3],
                    showdownratio : '10', // 自然检索量下降百分比数值
                    reason : startindex % 3,
                    beginleftnum: 2323348,
                    endleftnum: 1233458
                };
                if (opttypeid == 718) { // 用于突降包升级版的推左次数变化
                    optItem.reason ++; // 突降包升级版，该值为1-3
                    switch (optItem.reason) {
                        case 1: // 左侧展现概率下降
                            optItem.begincount = 13;
                            optItem.endcount = 90;
                            break;
                        case 2: // 排名下降
                            optItem.begincount = 12;
                            optItem.endcount = 34;
                            break;
                    }
                }
				detailresitems.push(optItem);
			}
			break;
        case 802:  // 移动优化包，优化出价
            var optItem;
            for (; startindex < len; startindex++) {
                optItem = {
                    winfoid : 20000 + startindex,
                    showword : startindex + ((startindex%5) ? '出资加盟一家大型地商业电影院线要多少费用呢' : '吉川家康历史'),
                    unitname : '暂停推广单元暂停推广单元暂停推广单元暂停推广单元暂停推广单元暂停推广单元暂停推广单元暂停推广单元',
                    planname : '暂停推广计划暂停推广计划暂停推广计划暂停推广计划暂停推广计划暂停推广计划暂停推广计划暂停推广计划',
                    planid : 100 + startindex,
                    unitid : 1000 + startindex,
                    wordid : 10000 + startindex,
                    bid : 345 + startindex + '',
                    origshowword : '原来的关键词',
                    wmatch : ['15', '31', '63'][startindex % 3],
                    deviceprefer : (startindex%3) ? 0 : 2,
                    mobileshowrate : 23,
                    unitbid : 10 + +startindex + ''
                };
                detailresitems.push(optItem);
            }
            break;
        case 803:  // 移动优化包，搜索词无效
            var optItem;
            for (; startindex < len; startindex++) {
                optItem = {
                    winfoid : 20000 + startindex,
                    showword : startindex + ((startindex%5) ? '出资加盟一家大型地商业电影院线要多少费用呢' : '吉川家康历史'),
                    unitname : '暂停推广单元暂停推广单元暂停推广单元暂停推广单元暂停推广单元暂停推广单元暂停推广单元暂停推广单元',
                    planname : '暂停推广计划暂停推广计划暂停推广计划暂停推广计划暂停推广计划暂停推广计划暂停推广计划暂停推广计划',
                    planid : 100 + startindex,
                    unitid : 1000 + startindex,
                    wordid : 10000 + startindex,
                    bid : 345 + startindex + '',
                    origshowword : '原来的关键词',
                    wmatch : ['15', '31', '63'][startindex % 3],
                    minbid : 3.3,
                    deviceprefer : (startindex%3) ? 0 : 2,
                    unitbid : 10 + +startindex + ''
                };
                detailresitems.push(optItem);
            }
            break;
		/** ******** 扩大商机包 ********* */
		// 优化出价
		case 203 :
		// 行业领先包，关键词出价
		case 607 :
			for (; startindex < len; startindex++) {
				detailresitems.push({
							showword : '<input>' + startindex
									+ ' 超长关键词超长关键词超长关键词超长关键词超长关键词',
                            unitname : '推广单元超长超长超长超长超长超长推广单元推广单元推广单元推广单元推广单元推广单元推广单元',
                            planname : '推广计划超长超长超长超长超长超长推广计划推广计划推广计划推广计划推广计划推广计划推广计划',
							planid : '10' + startindex,
							unitid : '100' + startindex,
							winfoid : '1000' + startindex,
							bid : 0 + +startindex + '',
							wmatch : ['15', '31', '63'][startindex % 3],
							unitbid : 10 + +startindex + '',
							recmbid : 100 + +startindex + '',
							reason : startindex % 3
						});
			}
			break;
		// 优化匹配
		case 204 :
		case 606 : // 行业领先包，关键词匹配
        case 906: // 旺季包，匹配优化项
            var showwordArr;
            var showword;
            var wordInfo;
			for (; startindex < len; startindex++) {
                showwordArr = [
                    '<input>' + startindex
                        + ' 超长关键词超长关长关键词超长关键词超长关键词超长关键词超长关键词超长关键' +
                        '词超长关键词长关键词超长关键词超长关键词超长关键词超长关键词超长关键词超长关' +
                        '键词键词超长关键词超长关键词超长关键词',
                    'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz',
                    '推荐关键词推荐关键词推荐关键词推荐关键词推荐关键词推荐关键词',
                    '鲜花',
                    'word123中国'
                ];
                showword = showwordArr[startindex % 5];
                wordInfo = {
                    showword : showword,
                    unitname : '推广单元超长超长超长超长超长超长推广单元推广单元推广单元推广单元推广单元推广单元推广单元',
                    planname : '推广计划超长超长超长超长超长超长推广计划推广计划推广计划推广计划推广计划推广计划推广计划',
                    planid : '10' + startindex,
                    unitid : '100' + startindex,
                    winfoid : '1000' + startindex,
                    wmatch : ['15', '31', '63'][startindex % 3],
                    recmwmatch : ['15', '31', '63'][startindex % 3],
                    reason : (+opttypeid != 606) ? startindex % 3 : (parseInt(Math.random() * 3) + 10),
                    unitbid : 10 + +startindex + ''
                };
                if (startindex % 2) {
                    wordInfo.bid = startindex + '';
                }
				detailresitems.push(wordInfo);
			}
			break;
		// 新提词
		case 205 :
			for (; startindex < endindex + 1; startindex++) {
				detailresitems.push({
							showword : '<input>' + startindex
									+ ' 超长关键词超长关键词超长关键词超长关键词超长关键词',
							dailypv : 100,
							kwc : 5,
							isfstscreen : (((startindex - 6) > 0) ? 0 : 1) + '',
							recmunitname : '推广单元' + startindex,
							recmplanname : '推广计划' + startindex,
							recmbid : 100 + +startindex + '',
							recmwmatch : ['15', '31', '63'][startindex % 3]
						});
			}
			break;

		/** ******** 质量度优化包 ********* */
		case 301 :
			for (; startindex < endindex + 1; startindex++) {
				detailresitems.push({
							showword : '<input>' + startindex
									+ ' 超长关键词超长关键词超长关键词超长关键词超长关键词',
							dailypv : 100,
							kwc : 5,
							isfstscreen : (((startindex - 6) > 0) ? 0 : 1) + '',
							recmunitname : '推广单元' + startindex,
							recmplanname : '推广计划' + startindex,
							recmbid : 100 + +startindex + '',
							recmwmatch : ['15', '31', '63'][startindex % 3],
							origshowword : '高难度推左词'
						});
			}
			break;
		case 302 :
			for (; startindex < len; startindex++) {
				detailresitems.push({
                    unitname: '推广单元超长超长超长超长超长超长推广单元推广单元推广单元推广单元推广单元推广单元推广单元',
                    planname: '推广计划超长超长超长超长超长超长推广计划推广计划推广计划推广计划推广计划推广计划推广计划',
                    planid: '10' + startindex,
                    unitid: '100' + startindex,
                    ideaid: '1212,34,21'
						});
			}
			break;
		case 303 :
			var extra = param.condition.extra;
			extra = extra.substring(3);
            var attrArr = ['ideaid', 'shadow_ideaid', 'shadow_ideastat',
                'title', 'shadow_title', 'desc1',
                'shadow_desc1', 'desc2', 'shadow_desc2',
                'url', 'shadow_url', 'showurl',
                'shadow_showurl', 'unitid', 'planid',
                'pausestat', 'activestat', 'ideastat'];
			for (; startindex < len; startindex++) {
				var obj;
				if (extra == 'idea') {
                    obj = {
                        //						ideaid : 1,
                        //						title : '创意标题',
                        //						desc1 : '创意描述1',
                        //						desc2 : '创意描述2',
                        //						url : 'baidu.com',
                        //						showurl : '创意URL',
                        /*isopted: 1,*/
                        showword : '[231,1223,34324,32412]'
                    };
                    for (var j = attrArr.length; j --;) {
                        obj[attrArr[j]] = Requester.debug.data['ideainfo'][attrArr[j]](startindex);
                    }
				} else {
					obj = {
                        showword : '<input>' + startindex
                            + ' 超长关键词超长关键词超长关键词超长关键词超长关键词',
                        unitname : '推广单元超长超长超长超长超长超长推广单元推广单元推广单元推广单元推广单元推广单元推广单元',
                        planname : '推广计划超长超长超长超长超长超长推广计划推广计划推广计划推广计划推广计划推广计划推广计划',
						showqstat : '21',
						ideaid : 1,
						isdecr : startindex % 2,
						beginvalue : 1223,
						endvalue : 23213,
						decr : 213123,
						decrtype : 1,
						ideaquality: startindex % 3,
						pageexp: startindex % 6
					};
				}
				detailresitems.push(obj);
			}
			break;
		case 304 :
			for (; startindex < len; startindex++) {
				detailresitems.push({
                            showword : 'query<input>' + startindex
                                + ' 超长关键词超长关键词超长关键词超长关键词超长关键词',
                            unitname : 'query推广单元超长超长超长超长超长超长推广单元推广单元推广单元推广单元推广单元推广单元推广单元',
                            planname : 'query推广计划超长超长超长超长超长超长推广计划推广计划推广计划推广计划推广计划推广计划推广计划',
							showqstat : '21',
							ideaid : 1,
							isdecr : startindex % 2,
							beginvalue : 1223,
							endvalue : 23213,
							decr : 213123,
							decrtype : 1
						});
			}
			p('111')
			break;

		/** ******** 智能提词包 ********* */
		case 501 :
		case 502 :
		case 503 :
		case 504 :
		case 604 : // 行业领先包的行业优质词优化建议，复用智能提词包的
        case 704:  // 突降急救包升级版，计划被删除优化项
        case 709:  // 突降急救包升级版，单元被删除优化项
        case 711:  // 突降急救包升级版，关键词被删除
        case 904: // 行业旺季包提词建议
			var tnum = endindex;
            var showword;
            var showwordArr;
			for (; startindex <= tnum; startindex++) {
                showwordArr = [
                    '<input>' + startindex
                    + ' 超长关键词超长关长关键词超长关键词超长关键词超长关键词超长关键词超长关键' +
                    '词超长关键词长关键词超长关键词超长关键词超长关键词超长关键词超长关键词超长关' +
                    '键词键词超长关键词超长关键词超长关键词',
                    '鲜花',
                    '推荐关键词推荐关键词推荐关键词推荐关键词推荐关键词推荐关键词',
                    'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz',
                    'recmword'
                ];
                showword = showwordArr[startindex % 5];
                detailresitems.push({
                    wordid: startindex + 1,
                    showword: showword,
                    isnewword: startindex % 2,// 是否是今日新增建议关键词，1表示是，0表示否
                    dailypv: 100,
                    kwc: 5,
                    isfstscreen: (((startindex - 9) > 0) ? 0 : 1) + '',
                    recmunitname: startindex == 0 ? ('新单元') : ('很长很长的很长很长的很长很长的很长很长的很长很长的单元100' + startindex),
                    recmplanname: startindex == 0 ? ('新计划') : ('涅槃计划_' + startindex),
                    recmbid: 100 + +startindex + '',
                    recmwmatch: ['15', '31', '63'][startindex % 3],
                    origshowword: '高难度推左词对的对的',
                    recmplanid: startindex + '',
                    recmunitid: startindex == 0 ? '0' : (1000 + startindex + 5 + '')
                });
			}
			break;
		case 505 :
			for (; startindex < endindex + 1; startindex++) {
				detailresitems.push({
							showword : '<input>' + startindex
									+ ' 超长关键词超长关键词超长关键词超长关键词超长关键词',
							isnewword : startindex % 2,// 是否是今日新增建议关键词，1表示是，0表示否
							dailypv : 100,
							kwc : 5,
							isfstscreen : (((startindex - 20) > 0) ? 0 : 1)
									+ '',
							recmunitname : '推广单元' + startindex,
							recmplanname : '推广计划' + startindex,
							recmbid : 100 + +startindex + '',
							recmwmatch : ['15', '31', '63'][startindex % 3],
							origshowword : '高难度推左从噢噢从',
							recmplanid : startindex % 4,
							recmunitid : startindex % 4
						});
			}
			break;
		/************行业领先包*************/
		case 603:
        case 206: // 开拓客源包新增的时段优化项
		    var recmdSchedule = {
		    	suggestcyc : "[[204,208],[109,111],[308,318],[609,618],[715,720]]",
				plancyc : "[[101,102],[118,121],[114,118]]",
				potionalclk: [],//"[13, 34, 16, 88, 30, 90]",
				hotlevel: []//"[53, 34, 76, 18, 60, 20]"
		    };
		    for (var i = 0; i < 30; i ++) {
		    	recmdSchedule.potionalclk[i] = parseInt(Math.random() * 100);
		    	recmdSchedule.hotlevel[i] = parseInt(Math.random() * 100);
		    }
			recmdSchedule.potionalclk = '[' + recmdSchedule.potionalclk.toString() + ']';
			recmdSchedule.hotlevel = '[' + recmdSchedule.hotlevel.toString() + ']';
			detailresitems.push(recmdSchedule);
			break;
        /************突降急救包升级版*************/
        case 702: // 账户预算下调
            var bgtData = {
                bgttype : 1, // 预算类型。0：未设置预算。1：设置日预算。2：设置周预算。
                daybgtdata : { // 存储日预算数据
                    daybgtvalue : 200.0,// 当前日预算
                    dayanalyze : {
                        tip : 3,
                        suggestbudget : 500.0, // 建议日预算
                        lostclicks : null, // 损失点击数
                        show_encourage : 1, // 是否显示同行激励
                        model_num : 2, // 同行标杆数
                        words : '你好/你坏', // 核心关键词字面串。以“/”作为间隔
                        wordids : '1' // 核心关键词id值
                    }
                },
                weekbgtdata : { // 存储周预算基础数据与分析数据,此处结构和原涅槃周预算对应部分一致，未修改
                    weekbgtvalue : 2000.0, // 周预算值
                    weekanalyze : {
                        tip : 3,
                        suggestbudget : 5000.0,// 建议周预算
                        lostclicks : 20
                        // 损失点击数
                    },
                    istargetuser : 0
                    // 是否为目标用户，0不是目标用户，1是目标用户
                }
            };

            data.listData.push(bgtData);
            break;
        case 801:  // 移动优化包
            var tnum = endindex;
            for (; startindex <= tnum; startindex++) {
                detailresitems.push({
                            showword : startindex
                                    + ((startindex%5) ? '出资加盟一家大型地商业电影院线要多少费用呢' : '吉川家康历史'),
                            isnewword : startindex % 2,// 是否是今日新增建议关键词，1表示是，0表示否
                            dailypv : 100,
                            kwc : 5,
                            isfstscreen : (((startindex - 9) > 0) ? 0 : 1) + '',
                            recmunitname : startindex == 0 ? ('新单元') : ('单元100很长很长的很长很长的很长很长的很长很长的很长很长' + startindex),
                            recmplanname : startindex == 0 ? ('新计划') : ('涅槃计划_' + startindex),
                            recmbid : 100 + +startindex + '',
                            recmwmatch : ['15', '31', '63'][startindex % 3],
                            origshowword : '高难度推左词对的对的',
                            recmplanid : startindex + '',
                            recmunitid : startindex == 0 ? '0' : (1000 + startindex + 5 + ''),
                            recmideaid : 34 + startindex
                        });
            }
            break;
        case 807 :
        case 806 :
            for (; startindex < len; startindex++) {
                var obj;
                    obj = {
                        ideaid : startindex+1,
                        unitid : startindex+1,
                        unitname : '805805这是个测试哦',
                        planid : startindex+1,
                        planname : '805805这是个测试哦',
                        title : '王石颖',
                        desc1 : '创意描述1',
                        desc2 : '创意描述2',
                        url : 'baidu.com',
                        showurl : '创意URL',
                        mshowurl : 'baidu.com',
                        miurl : '创意URL',
                        isopted : startindex%2,
                        shadow_ideaid: startindex + 1000,
                        shadow_title : 'shadow王石颖',
                        shadow_desc1 : '创意描述1shadow',
                        shadow_desc2 : 'shadow创意描述2',
                        shadow_showurl : 'google.com',
                        shadow_url : 'shadow创意URL',
                        shadow_mshowurl : 'google.com',
                        shadow_miurl : 'shadow创意URL',
                        shadow_ideastat: startindex,
                        pausestat : startindex%2,
                        ideastat : [0, 1, 2, 4, 5,7][Math.round(Math.random() * 100) % 6],
                        reason : startindex%4+1,
                        deviceprefer : (startindex%3) ? 0 : 2
                    };
                detailresitems.push(obj);
            }
            break;
        case 805 :
            for (; startindex < len; startindex++) {
                var obj;
                    obj = {
                        winfoid:1,
                        showword : '805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦',
                        planid : startindex+1,
                        planname : '805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦',
                        unitid : startindex+1,
                        unitname : '805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦805805这是个测试哦',
                        wurl :  'baidu.com',
                        mwurl :  'baidu.com',
                        showqstat : '21',
                        shadow_wurl :  'google.com',
                        shadow_mwurl :  'google.com',
                        isopted :  startindex%2,
                        pausestat : startindex%2,
                        wordstat : [0, 1, 2, 4, 5,7,13,14][startindex % 8],
                        reason : startindex%4+1,
                        deviceprefer : (startindex%3) ? 0 : 2

                    };
                detailresitems.push(obj);
            }
            break;
        /*************行业旺季包***************/
        case 901: // 账户预算
            detailresitems.push({
                //weekbudget: 20.45, // 用户当前周预算
                //wbudget: 3.25, // 用户当前日预算
                bgttype: 1, // 预算类型。0：未设置预算。1：设置日预算。2：设置周预算。
                suggestbudget: 10.5,
                //peershowword: '', // 分隔的关键词字面,同行核心关键词字面，多个字面之间使用/分隔	可选
                clklost: 300, // 损失点击量
                modelcount: 233, // 同行个数
                saveclk: 23//, // 可挽回损失点击率
               // buyratio: 19 // 旺季包同行客服旺季预算提升率
            });
            break;
        case 902: // 计划预算
            for (; startindex < len; startindex++) {
                detailresitems.push({
                    planid: startindex + 100,
                    planname: '推广计划超长超长超长超长超长超长推广计划推广计划推广计划推广计划推广计划推广计划推广计划',
                    offtime: (new Date()).valueOf(),
                    wbudget: 65.8 + startindex, // 日预算
                    suggestbudget: 100.5 + startindex, //
                    bgttype: 1, // 预算类型。0：未设置预算。1：设置日预算。2：设置周预算。
                    clklost: 300 + startindex,  // 损失点击量
                    saveclk: 56
                });
            }
            break;
        case 903: // 关键词出价
            var wordLevelData = Requester.debug.data['wordinfo'];
            var showword;
            var showwordArr;
            var wordInfo;
            for (; startindex < len; startindex++) {
                showwordArr = [
                    '<input>' + startindex
                        + ' 超长关键词超长关长关键词超长关键词超长关键词超长关键词超长关键词超长关键' +
                        '词超长关键词长关键词超长关键词超长关键词超长关键词超长关键词超长关键词超长关' +
                        '键词键词超长关键词超长关键词超长关键词',
                    'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz',
                    '超长关键词超长关键词超长关键词超长关键词超长关键词超长关键词超长关键词超长关键词超长关键词超长关键词超长关键词超长关键词超长关键词超长关键词超长关键词',
                    '鲜花',
                    'word123中国'
                ];
                showword = showwordArr[startindex % 5];
                wordinfo = {
                    showword : showword,
                    unitname : '推广单元超长超长超长超长超长超长推广单元推广单元推广单元推广单元推广单元推广单元推广单元',
                    planname : '推广计划超长超长超长超长超长超长推广计划推广计划推广计划推广计划推广计划推广计划推广计划',
                    planid : '10' + startindex,
                    unitid : '100' + startindex,
                    winfoid : '1000' + startindex,
                    wmatch : ['15', '31', '63'][startindex % 3],
                    unitbid : 10 + +startindex + '',
                    recmbid : 100 + +startindex + '',
                    showqstat: wordLevelData['showqstat'](startindex),
                    reason: parseInt(Math.random() * 10) % 2 ? 13 : 14, // 13: 左侧首屏展现概率出价建议 14: 左侧展现概率出价建议
                    showratio: 35 + startindex, // 左侧（首屏）展现概率
                    targetshowratio: 56 + startindex // 目标左侧（首屏）展现概率
                };
                if (startindex % 2) {
                    wordinfo.bid = startindex + '';
                }
                detailresitems.push(wordinfo);
            }
            break;
	}

	baidu.each(detailresitems, function(item) {
				var temp = item;

				item = {
					data : temp
				};

				data.detailresitems.push(item);
			});

	if (startindex == 90) {
		// 永远不要翻到第九页
		data.detailresitems = [];
	}

//    if (opttypeid != 501) {
//        rel.status = 500;
//    }

//    if (opttypeid == 901) {
//        rel.status = 500;
//        return rel;
//    }
	rel.data = data;
	rel.timeout = 1000;

	return rel;
};

/**
 * 判断是否是效果检验状态
 */
Requester.debug.GET_nikon_bizeffcheck = function(p1, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		biztype : "1" // 1表示是效果检验状态，0表示正常状态
	};
	return rel;
},

/**
 * 获取预算建议详情
 */
Requester.debug.GET_nikon_detailbudget = function(level, param) {
	var rel = new Requester.debug.returnTpl(), data = {
		aostatus : 0, // 详情页不用关注，直接根据外层的status判断（200,500,600）
		commData : {
			begindate : (new Date()).getTime() // 期初日期
		},
		listData : []
	}, bgtData, opttypeid = param.opttypeid;

    var tip;
    switch (+opttypeid) {
        case 702:
        case 706:
            tip = 5;
            break;
//        case 901: // 账户预算在没有建议预算值是，不需要显示任何提示信息
//            tip = 0;
//            break;
        default:
            tip = 3;
    }

	bgtData = {
		bgttype : 1, // 预算类型。0：未设置预算。1：设置日预算。2：设置周预算。
		daybgtdata : { // 存储日预算数据
			daybgtvalue : 200.0,// 当前日预算
			dayanalyze : {
				tip : tip,
				suggestbudget : 500.0, // 建议日预算
				lostclicks : null, // 损失点击数
				show_encourage : 1, // 是否显示同行激励
				model_num : 2, // 同行标杆数
				words : '你好/你坏', // 核心关键词字面串。以“/”作为间隔
				wordids : '1' // 核心关键词id值
			}
		},
		weekbgtdata : { // 存储周预算基础数据与分析数据,此处结构和原涅槃周预算对应部分一致，未修改
			weekbgtvalue : 2000.0, // 周预算值
			weekanalyze : {
				tip: tip,
				suggestbudget : 5000.0,// 建议周预算
				lostclicks : 20
				// 损失点击数
			},
			istargetuser : 0
			// 是否为目标用户，0不是目标用户，1是目标用户
		}
	};

	data.listData.push(bgtData);

	rel.data = data;

	return rel;
};


/**
 * 移动优化包制作时新增的提词优化项详情添词接口，主要增加了推荐创意参数和后台逻辑
 */
Requester.debug.ADD_nikon_material = function(level, param) {
    var rel = new Requester.debug.returnTpl();

    rel.timeout = 1500;
    return rel;
};

/**
 * 通过扩大商机包修改了预算之后的提示接口
 */
Requester.debug.MOD_nikon_userbudgetnotify = function(level, param) {
	var rel = new Requester.debug.returnTpl();

	return rel;
};

/**
 * 获取包的flash数据
 */
Requester.debug.GET_nikon_flashdata = function(p1, param) {
	var rel = new Requester.debug.returnTpl(), i;

	rel.data = {
		desc : {},
		listData : []
	};
    // rel.status = 400;
	switch (+param.pkgid) {
		case 1 :
			rel.data.desc = {
				decrtype : 'shows',
				begindate : '2012-05-14',
				enddate : '2012-05-17',
				decrwordnum : 1000,
				decrunitnum : 100,
				decrplannum : 10,
				beginvalue : 5000,
				endvalue : 4000,
				decr : 1000
			};
			for (i = 0; i < 7; i++) {
				rel.data.listData.push({
							date : '2012-05-1' + (i + 1),
							value : i == 6 ? '500' : (Math.round(Math.random()
									* 3000000)
									+ (i * 100) + '')
						});
			}
			break;
		case 2 :
			param.condition = param.condition || {
				biztype : 0
			};
			if (param.condition.biztype == 1) {
				rel.data.desc = {
					bizdate : baidu.date.format(new Date(), 'yyyy-MM-dd'),
					avgclksbefore : 123456,
					avgclksafter : 234567,
					day : 7
				};
				for (i = 0; i < 7; i++) {
					rel.data.listData.push({
								date : '2012-05-1' + i,
								clks : 3000000 + i * 30
							});
				}
			} else {
				rel.data.desc = {
					totalclklost : 100,
					totalclk : 5500,
					modelofftime : '24:00', // 同行的下线时间
					defaultdate : '2012-05-15'
				};
				for (i = 0; i < 7; i++) {
					var p = {
						date : '2012-05-1' + (i + 1),
						clklostday : i == 2 ? 100 : 0,
						// clksbyhour : '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0',
						// clksbyhour :
						clksbyhour : '45,34,11,22,11,22,45,88,51,77,45,55,15,100,55,77,15,55,60,70,100,100,100,10',
						offlinelist : '[[0, 4], [12, 14], [16,17], [19,24]]',
						// offlinelist: '[[0,8], [9,24]]',
						// offlinelist:'[[21, 24]]',
						offlinetime : (i + 18) + ':00' // 当日自己的下线时间
					};

					rel.data.listData.push(p);
				}
			}
			break;
		case 3 :
			rel.data.desc = {
				star1num : '-1000',
				star2num : '0',
				star3num : '3000'
			};
			for (i = 0; i < 7; i++) {
				rel.data.listData.push({
							date : '2012-05-1' + (i + 1),
							// star1num : i == 4 ? 0 :
							// (Math.round(Math.random()* 3000) + (i * 100) +
							// ''),
							// star2num : i == 4 ? 0 :
							// (Math.round(Math.random()* 3000) + (i * 200) +
							// ''),
							// star3num : i == 4 ? 0 :
							// (Math.round(Math.random()* 3000) + (i * 300) +
							// '')
							star1num : 50,
							star2num : 4648,
							star3num : 50
						});
			}
			break;
		case 5 :
			for (i = 0; i < 7; i++) {
				rel.data.listData.push({
							date : '2012-05-1' + (i + 1),
							value : 3000 * i
						});
			}
			break;
		case 6 : // 行业领先包
		    var lightOrder = Math.ceil(Math.random() * 10);
		    lightOrder = (0 == lightOrder) ? 1 : lightOrder;
		    
		    var random1 = (parseInt(Math.random() * 10) % 2 == 0);
		    var random2 = (parseInt(Math.random() * 10) % 2 == 0);
		    
		    var changeType = random1 ? -1 : 1;
		    var levelchange = (changeType * random2) + "";
		    
		    var rankchange = random2 ? "-1" : "1";
		    rankchange *= (Math.ceil(Math.random() * 100) + 1);
		    rankchange = "" + rankchange;
		    
			rel.data.desc = {
				datatime: '1352563200000',//"" + (new Date()).getTime() + "",
				tiptype: '0',//'0',//(parseInt(Math.random() * 10) % 2),
				levelchange: '-3',//levelchange,//'0',<0,>0
				rankchange: -3,//'1',//rankchange,
				percent: '51',//parseInt(Math.random() * 99),
				avgvalue: '48',//"140",
				goodvalue: "83",
				currvalue: "173",
				rankindex: '10'//"" + lightOrder
			};
            break;
        case 7: // 突降急救包升级
            rel.data.desc = {
                begindate : '2012-05-10',
                enddate : '2012-05-11',
                decrwordnum : 1000,
                decrunitnum : 100,
                decrplannum : 10,
                beginvalue : 5000,
                endvalue : 4000,
                // 突降急救包升级优化项分组标题描述信息数据
                rankdown: '1.5', //排名平均下降
                leftrankdown: '20', //推左次数平均下降
                invalidwinfo: '12', //关键词突变为不生效状态
                timeoff: '2' //在线时长下降，小时
            };
            for (i = 0; i < 13; i++) {
                rel.data.listData.push({
                    date : '2012-05-' + (i + 5),
                    value : i == 6 ? '500' : (Math.round(Math.random()
                        * 3000000)
                        + (i * 100) + '')
                });
            }
            break;
        case 9: // 行业旺季包
            rel.data.desc = {
                tradeid: param.condition.tradeid,
                tradename: '中国旅游',
                tradetype: 1,
                peakstart: '2013-05-01',
                peakend: '2014-05-01',
                tradepvratio: parseInt(Math.random() * 100), // 行业检索量上升比率
                show: -1* parseInt(Math.random() * 100), // 展现量增幅
                showratio: parseInt(Math.random() * 1000),
                clk: parseInt(Math.random() * 100), // 点击量增幅
                clkratio: parseInt(Math.random() * 10000), // 点击量增幅比率
                avgshow: parseInt(Math.random() * 100), // 日均展现量增幅
                avgclk: -1 * parseInt(Math.random() * 100) // 日均点击量增幅
            };

            var begin = baidu.date.parse(rel.data.desc.peakstart);
            begin.setMonth(begin.getMonth() - 1);
            var end = baidu.date.parse(rel.data.desc.peakend);
            end.setMonth(end.getMonth() + 1);
            var format = baidu.date.format;
            for (i = begin; i < end; ) {
                rel.data.listData.push({
                    date : format(i, 'yyyy-MM-dd'),
                    tradepv: parseInt(Math.random() * 100),
                    clk: parseInt(Math.random() * 100 + 100),
                    show: parseInt(Math.random() * 1000 + 1000)
                });
                i.setDate(i.getDate() + 1);
            }
//            rel.data.listData = [];
            break;
	}
	
//	rel.timeout = 5000;

	return rel;
};

/**
 * 请求生成重点词优化包的重点词模拟接口
 * 
 * @author Wu Huiyao(wuhuiyao@baidu.com)
 */
/*Requester.debug.ADD_nikon_generatecoreword = function(p1, params) {
	var rel = new Requester.debug.returnTpl(), aostatusArr = [0, 1, 3, 100], idx = -1;

	// 随机产生一个aostatus
	while (idx > 3 || idx < 0) {
		idx = Math.ceil(Math.random() * 4) - 1;
	}

	// 状态，0: 正常，1: 处理中，3: 处理失败，100: 参数错误
	rel.data.aostatus = 0;// aostatusArr[idx];

    rel.timeout = 1000;
	return rel;
};*/
/**
 * 请求优化包的权限模拟接口
 * 
 * @author Wu Huiyao(wuhuiyao@baidu.com)
 */
Requester.debug.GET_nikon_pkgauth = function(p1, params) {
	var rel = new Requester.debug.returnTpl();

	// 状态，0: 正常，1: 处理中，3: 处理失败，100: 参数错误
	rel.data.aostatus = 0;

	// if (Math.ceil(Math.random() * 2) % 2) {
	rel.data.auth = '[1,2,3,4,5,6, 25]';
	// } else {
	// rel.data.auth = [1,2,3];
	// }

	return rel;
};
/**
 * 请求推荐重点词的模拟接口
 * @author Wu Huiyao(wuhuiyao@baidu.com)
 */
Requester.debug.GET_nikon_recmcoreword = function(p1, params) {
    var rel = new Requester.debug.returnTpl();

    var data = rel.data;

    //0表示第一次需要浮层，1表示不是第一次可轮播
    data.type = Math.ceil(Math.random() * 10) % 2;
    data.corewordmaxsize = Math.ceil(Math.random() * 200 + 60);
    data.recmcorewords = [];
    var corwordArr = data.recmcorewords;
    // 推荐重点词数量
    var recmdNum = 10;//Math.ceil(Math.random() * 200 + 60);
    var corword;
    var level = 'wordinfo';
    var attrArr = ['winfoid', 'showword',
        'unitid', 'unitname', 'planid', 'planname'];

    var winfoidStartValue = 1;//debugUtil.focusCorewordNum ? debugUtil.focusCorewordNum : 0;

    for (var i = 0; i < recmdNum; i ++) {
        corword = {};
        for (var j = 0, len = attrArr.length; j < len; j ++) {
            corword[attrArr[j]] = Requester.debug.data[level][attrArr[j]](i);
        }

        corword['winfoid'] = winfoidStartValue ++;
        if (i == 0) {
            corword['planname'] = '推广计划很长很速度长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长创<b>';
        }
        corword['unitname'] = corword['unitname'] + '推广单元很速度长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长创<b>'
        corword.recmreason = Requester.debug.data.getCorewordRemcdReason(i);
        corwordArr[i] = corword;
    }

    rel.timeout = 2000;

    return rel;
};
/**
 * 获取重点词优化包重点词优化详情的数据模拟接口
 * 
 * @author Wu Huiyao(wuhuiyao@baidu.com)
 */
Requester.debug.GET_nikon_coreworddetail = function(p1, params) {
	var rel = new Requester.debug.returnTpl(), data = {
		aostatus : 0, // 计算优化详情状态，0: 正常，1: 处理中（不需要轮询，因此不会出现1状态），3: 处理失败，100:
		// 参数错误
		totalnum : 50,//Math.ceil(Math.random() * 260), // 返回的重点词数量
		commData : {
			nextproctime : (new Date()).getTime() + 100000000, // 重点词优化包出价建议下次计算的时间，时间戳
			wregionlist : "[1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37]",// [21,19,2,20,25,14,16,17,8,12,33,28,7],
            remaintime: '' + Math.ceil(Math.random() * 8), // 重点词下次诊断还剩的分钟数
			// //
			// 重点词推广地域列表
			currentwregion : params.wregion == "-1" ? "1" : params.wregion
			// 当前选择展示的地域
		}
	};

    data.commData.proctime = 1355412964529 + data.commData.currentwregion * 100000;
    //(new Date()).getTime(), // 重点词优化包出价建议本次计算的时间，时间戳

    var winfoids = params.condition && params.condition.winfoid;
    if (winfoids) {
        // 只请求特定的重点词的详情
        winfoids = winfoids.split(',');
        data.totalnum = winfoids.length;
    }

    var listData = [], maxNum = data.totalnum;
	var level = 'wordinfo';
	var attrArr = ['winfoid', 'wordid', 'unitid', 'unitname', 'planid',
			'planname', 'showqstat', 'bid', 'paysum', 'clks', 'pausestat', 'ideaquality', 'pageexp'];
	// , 'wordstat', 'activestat'];
	data.totalnum = data.totalnum < 0 ? 0 : data.totalnum;

    // 记录关注的重点词数量
    debugUtil.focusCorewordNum = maxNum;

	var detail;
    var temp;
	for (var j = 0; j < maxNum; j++) {
		listData[j] = {};
		detail = {};
		listData[j]['data'] = detail;
		for (var i = 0, len = attrArr.length; i < len; i++) {
			detail[attrArr[i]] = Requester.debug.data[level][attrArr[i]](j);
		}

        // 重置winfoid为请求的winfoid
        winfoids && (detail['winfoid'] = winfoids[j]);
        // 根据winfoid来初始化showword
        detail['showword'] = detail['winfoid'] + Requester.debug.data[level]['showword'](detail['winfoid']);

		detail['unitbid'] = "" + (j + 100); // 初始化单元出价

        temp = Requester.debug.data.getCorewordDetail(j);
        baidu.object.extend(detail, temp);

		// 随机产生优选创意id，0表示无创意
		(Math.ceil(Math.random() * 10) % 2) ? (detail['prefideaid'] = j + 1)
				+ "" : (detail['prefideaid'] = '0');

		// 随机模拟质量度是否下降
		detail['qdump'] = "" + (Math.ceil(Math.random() * 10)) % 2;

		// 用于测试长中文名
		(Math.ceil(Math.random() * 10) > 5)
				&& (detail['showword'] = detail['winfoid'] + "长很长很长很长很长很长很长很长很长很长很"
						+ detail['showword']);

		// 用于测试长计划名，由于默认返回的计划明比较短，所以这里重置了计划名
		detail['planname'] += '推广计划很长很速度长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长创<b>'
	}

	data.detailresitems = listData;

//    if (debugUtil.timer == 0 || debugUtil.timer == 4) {
//        data = { aostatus: 0, totalnum: 0, commData: null, detailresitems: null };
//        rel.status = 400;
//        debugUtil.timer ++;
//    } else {
        rel.status = 200;
        debugUtil.timer ++;
//    }

    rel.data = data;
    rel.timeout = 1000;
	return rel;
};

debugUtil.timer = 0;

Requester.debug.GET_nikon_coreword = function(p1, params) {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		aostatus: 0,
		corewords: [],
        corewordmaxsize: 50//Math.ceil(Math.random() * 200 + 60)
	};

    var existedNum = 48;//Math.ceil(Math.random() * 260);
	for (var i = 0; i < existedNum; i++) {
		rel.data.corewords.push({
					winfoid : i,
					showword : i + '很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长的重点词',
					unitid : 1000 + i,
					unitname : (1000 + i)
							+ '很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长的单元',
					planid : 10000 + i,
					planname : (10000 + i)
							+ '很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长的计划'
				});
	}

	return rel;
};
Requester.debug.ADD_nikon_coreword = function(p1, params) {
	var rel = new Requester.debug.returnTpl();
//	var words = params.winfoids;
	rel.status = 200;
	rel.data = {
		aostatus : 0,
		errorcodes : 0,
		errorcorewords : [/*{
					errorcode : 1,
					winfoid : words[0]
				}*/]
	};

//    if (debugUtil.timer > 6) {
//        rel.status = 400;
//    }
    rel.timeout = 1000;
	return rel;

};
Requester.debug.DEL_nikon_coreword = function(p1, params) {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		aostatus : 0,
		errorcodes : 0,
		errorcorewords : []
	};
    rel.status = 200;
    rel.timeout = 1000;
	return rel;
};
/**
 * 模拟更新重点词的接口
 * @author wuhuiyao
 */
Requester.debug.MOD_nikon_updatecoreword = function(p1, params) {
    var rel = new Requester.debug.returnTpl();
    rel.data = {
        aostatus: 0,
        errorcodes : 0,
        errorcorewords : []
    };
//    var addWords = params.addwinfoids;
//    var delWords = params.delwinfoids;
////    rel.data.errorcorewords = [
////        {
////            errorcoe: 2, // 1表示该重点词已被删除,2表示该词已经是重点词,
////            winfoid: addWords[0]
////        },
////        {
////            errorcoe: 1,
////            winfoid: delWords[0]
////        }
////    ];
    rel.status = 200;
    rel.timeout = 1000;
    return rel;
};

Requester.debug.GET_nikon_popupinfo = function(p1, param) {
	var rel = new Requester.debug.returnTpl(), reqid = param.reqid, pkgids = param.pkgid;

	if (param.command == 'start') {
		reqid = (new Date()).valueOf();
		kslfData1 = 0;
	}
	rel.data = {
		aostatus : (kslfData1 < 1 ? 1 : 0),
		reqid : reqid,
		result : [
//            {
//                pkgid: 1,
//                data: {
//                    decrtype: 'shows',
//                    beginvalue: '3000',
//                    endvalue: '2000',
//                    datetype: '0' // 0节假日，1工作日
//                }
//            },
            {
                pkgid: 7,
                data: {
                    beginvalue: '3000',
                    endvalue: '2000',
                    begindate: '' + ((new Date()).getTime() - 1000000000),
                    enddate: (new Date()).getTime()
                }
            },
            {
                pkgid: 4,
                data: {
                    proctime: (new Date()).valueOf(),
                    probwordnum: Math.ceil(Math.random() * 50),
                    nolefttopnum: '33',
                    noleftscreennum: Math.ceil(Math.random() * 50), // 不在左侧词个数
                    budgetnotenoughnum: Math.ceil(Math.random() * 50), // 预算不足个数
                    showqlownum: Math.ceil(Math.random() * 50), // 质量度过低
                    searchnoeffnum: Math.ceil(Math.random() * 50), // 搜索无效
                    searchlownum: Math.ceil(Math.random() * 50), // 搜索量过低
                    qdumpnum: '0',
                    noeffnum: '44' // 0表示节假日，1表示工作日
                }
            }
        ]
	};
	if (pkgids && pkgids.length == 1) {
		rel.data.result.splice(1, 1);
	}
	kslfData1++;
	return rel;
};
/**
 * 模拟响应请求同行指标数据
 *
 */
Requester.debug.GET_nikon_peerdata = function(p1, param) {
	var rel = new Requester.debug.returnTpl();
	rel.status = 200;
	
	// data_type: 1.下线时间, 2.展现次数, 
    // 3.左侧展现概率, 5.生效三星词比例
	var value = [
		{
			data_type: '1', // 下线时间
			min_value: '7800',
			max_value: '73000',
			avg_value: '12800',
			good_value: '36000',
			curr_value: '42000',
			top_percentage: Math.ceil(Math.random() * 100) + ''
		},
		{
			data_type: '2', // 展现次数
			min_value: 10,//'100',
			max_value: 40,//'900',
			avg_value: 30,//'500',
			good_value: 40,//'700',
			curr_value:10,//'100',
			top_percentage: Math.ceil(Math.random() * 100) + ''
		},
		{
			data_type: '3', // 左侧展现概率
			min_value: '3',
			max_value: '95',
			avg_value: '74',
			good_value: '81',
			curr_value: '95',
			top_percentage: Math.ceil(Math.random() * 100) + ''
		},
		{
			data_type: '5', // 生效三星词比例
			min_value: '13',
			max_value: '84',
			avg_value: '61',
			good_value: '70',
			curr_value: '60',
			top_percentage: Math.ceil(Math.random() * 100) + ''
		},
        {
            data_type: '6', //网站打开速度，没用到的指标
            min_value: '0',
            max_value: '12',
            avg_value: '5',
            good_value: '10',
            curr_value: '-1',
            top_percentage: Math.ceil(Math.random() * 100) + ''
        }
	];
	
	rel.data.peer_data = {};
	rel.data.peer_data.value = value;
	rel.data.token = 'adwew323';
	
	rel.timeout = 1000;
	return rel;
	
};

/******************新版突降急救包*******************************/

/**
 * 模拟突降急救包升级版获取突降阈值的数据接口
 * @author wuhuiyao (wuhuiyao@baidu.com)
 */
Requester.debug.GET_nikon_decrcustom = function(level, param) {
    var rel = new Requester.debug.returnTpl(), data = {
        type: 'clks',
        value : Math.ceil(Math.random() * 99 + 1)// 阈值。取值(0,100]，整数
    };

    rel.data = data;

    rel.timeout = 1500;
    return rel;
};

/**
 * 模拟突降急救包升级版修改突降阈值的数据接口
 * @author wuhuiyao (wuhuiyao@baidu.com)
 */
Requester.debug.MOD_nikon_decrcustom = function(level, param) {
    var rel = new Requester.debug.returnTpl();

    kslftestdata = kslftestdata == 0 ? 1 : 0;

    //    rel.status = 400;
    rel.timeout = 1500;
    return rel;
};
/**
 * 模拟获取概况页引导页信息的数据接口
 * @author wuhuiyao (wuhuiyao@baidu.com)
 */
Requester.debug.GET_nikon_introduction = function(level, param) {
    var rel = new Requester.debug.returnTpl();

    rel.data = {
        // 是否有引导页需要展现
        isshow: '1',
        // 要展现的引导页信息项
        introresitems: Requester.debug.data.intro
    };

//        rel.status = 400;
//    rel.timeout = 500;
    return rel;
};
/**
 * 模拟通知后端已经展现过的引导页信息
 * @author wuhuiyao (wuhuiyao@baidu.com)
 */
Requester.debug.ADD_nikon_introduction = function(level, param) {
    var rel = new Requester.debug.returnTpl();
    var id = param.id;

    var introArr = Requester.debug.data.intro;
    var introItem;
    for (var i = introArr.length; i --;) {
        introItem = introArr[i];
        if (introItem.id == id) {
            introArr.splice(i, 1);
            break;
        }
    }
    //    rel.status = 400;
    //    rel.timeout = 1500;
    return rel;
};
/**
 * 通知后端用户打开后优化包请求模拟
 */
Requester.debug.ADD_nikon_viewBoxClickTimes = function (level, param) {
    var rel = new Requester.debug.returnTpl();
    var pkgIds = param.pkgids;

    var viewAoPkgMap = debugUtil.viewAoPkgMap;
    if (!viewAoPkgMap) {
        viewAoPkgMap = {};
        debugUtil.viewAoPkgMap = viewAoPkgMap;
    }

    var viewPkgNum;
    for (var i = 0, len = pkgIds.length; i < len; i ++) {
        viewPkgNum = viewAoPkgMap[pkgIds[i]];
        if (typeof viewPkgNum === 'undefined') {
            viewPkgNum = 0;
        }
        viewPkgNum += 1;
        viewAoPkgMap[pkgIds[i]] = viewPkgNum;
    }

    return rel;
} ;