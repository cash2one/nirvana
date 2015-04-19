Requester.debug.GET_kr_seed = function(level, param) {
	// console.log('GET_kr_seed' + param);
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		word : {
			logid : 1234,
			values : // []
			["鲜花方案", "玫瑰", "鲜花方案", "鲜花方", "鲜花方方案案", "鲜花方案", "鲜花方案", "鲜花方案鲜花",
					"仙人掌", "防辐射", "Declan《Tell Me Why》", "Stupid",
					"到底是红玫瑰还是白玫瑰", "strange"]
		},
		url : {
			logid : 623217000,
			values : [{
						value : "www.baidu1.com",
						desc : ["DF", "dsfsdf", "DF", "dsfsdf", "DF", "dsfsdf"]
					}, {
						value : "www.baidu2.com",
						desc : ["DF", "dsfsdf"]
					}, {
						value : "www.baidu3longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglong.com",
						desc : ["DF", "dsfsdf"]
					}, {
						value : "www.baidu4.com",
						desc : ["DF", "dsfsdf"]
					}, {
						value : "www.baidu5longlonglonglong.com",
						desc : ["DF", "dsfsdf"]
					}, {
						value : "www.baidu6.com",
						desc : ["DF", "dsfsdf"]
					}, {
						value : "www.baidu7.com",
						desc : ["DF", "dsfsdf"]
					}, {
						value : "www.baidu8longlonglonglong.com",
						desc : ["DF", "dsfsdf"]
					}]
		}
	}
	return rel;
};
Requester.debug.GET_kr_trade = function(level, param) {
	// console.log('GET_kr_trade' + param);
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		logid : 1445237020,
		cate : {
			text : 32412341324,
			child :
			// [{"child":[{"text":"窗帘加盟"}],"text":"家居用品加盟"}]
			[{
						text : '电话',
						child : [{
									text : '电话本阿螺丝1',
									child : [{
												text : '疯狂的螺丝刀11'
											}]
								},
								// {text:'电话本阿螺丝2',child:[{text:'疯狂的螺丝刀21'}]},
								{
									text : '电话本阿螺丝3',
									child : [{
												text : '疯狂的螺丝刀31',
												child : [{
															text : '疯狂的螺丝刀311'
														}]
											}, {
												text : '疯狂的螺丝刀32'
											}]
								}
						// {text:'电话本阿螺丝4',child:[{text:'疯狂的螺丝刀41'}]}
						]
					},

					{
						text : '电话',
						child : [{
									text : '电话本阿螺丝刀房间拉萨的疯狂的了开发将阿里斯蒂芬'
								}]
					}, {
						text : '电话',
						child : [{
									text : '电话本阿螺丝刀房间拉萨的疯狂的了开发将阿里斯蒂芬'
								}]
					}, {
						text : '电话',
						child : [{
									text : '电话本阿螺丝刀房间拉萨的疯狂的了开发将阿里斯蒂芬'
								}]
					}, {
						text : '电话',
						child : [{
									text : '电话本阿螺丝刀房间拉萨的疯狂的了开发将阿里斯蒂芬'
								}]
					}, {
						text : '电话',
						child : [{
									text : '电话本阿螺丝刀房间拉萨的疯狂的了开发将阿里斯蒂芬'
								}]
					}, {
						text : '电话',
						child : [{
									text : '电话本阿螺丝刀房间拉萨的疯狂的了开发将阿里斯蒂芬'
								}]
					}, {
						text : '电话',
						child : [{
									text : '电话本阿螺丝刀房间拉萨的疯狂的了开发将阿里斯蒂芬'
								}]
					}, {
						text : '电话',
						child : [{
									text : '电话本阿螺丝刀房间拉萨的疯狂的了开发将阿里斯蒂芬'
								}]
					}, {
						text : 'lastlastlast',
						child : [{
									text : '电话本阿螺丝刀房间拉萨的疯狂的了开发将阿里斯蒂芬'
								}]
					}]
		}
	};
	if (prompt("行业树 y on n", 'y') == 'n') {
		rel.data.cate.child = [];
	}
	// 模拟数据请求延迟
	rel.timeout = 1000;
	// console.log(baidu.json.stringify(rel));
	return rel;
};
// 按关键词
// test:1,
Requester.debug.GET_kr_word = function(level, param) {
	// console.log('GET_kr_word' + param);
	// var max = Math.ceil(Requester.debug.test/3)*10;
	// Requester.debug.test++;

	var rel = new Requester.debug.returnTpl();
	
	// 模拟数据请求延迟
	rel.timeout = 1000;

	// 400 //1301\1302\1304\1305\1306\1307
	if (param.query.slice(0, 3) == "400" || param.query.slice(0, 3) == "200") {
		rel = {
			"data" : {
				group : []
			},
			"status" : param.query.slice(0, 3),
			"errorCode" : {
				"data" : {
					group : []
				},
				"message" : "",
				"code" : param.query.slice(3, param.query.length),
				"idx" : 0,
				"detail" : null
			}
		};
		return rel;
	}
	/*
	 * if(param.querytype == 4 ||param.querytype == 3){ rel = { "data":
	 * {group:[]}, "status": 200, "errorCode": { "data": {group:[]}, "message":
	 * "", "code": param.query.slice(3,param.query.length), "idx": 0, "detail":
	 * null } }; return rel; }
	 */
	rel.data = {
		logid : 623217000,
		attr : [
				{field:'展现理由',text:'黑马词',desc:'二级理由1:最新出现的网民搜索词',icon:'new'},
				{field:'展现理由',text:'百度相关搜索',desc:'二级理由2:助您快人一步，抢占商机',icon:''},
				{field:'展现理由',text:'潜在客户',desc:'二级理由2:助您快人一步，抢占商机',icon:''},
				{field:'展现理由',text:'同行动态',desc:'二级理由2:助您快人一步，抢占商机',icon:''},
				{field:'展现理由',text:'我的选择',desc:'二级理由2:助您快人一步，抢占商机',icon:''},
				{field:'展现理由',text:'搜索建议词',desc:'二级理由2:助您快人一步，抢占商机',icon:''},
				{field:'展现理由',text:'网页相关词',desc:'二级理由2:助您快人一步，抢占商机',icon:''},
				{field:'业务点',text:'哇哇哇aa啊啊啊啊啊啊啊',desc:'',icon:'',wordCount: 10, firstWordIndex: 2},
				{field:'业务点',text:'哈哈哈',desc:'',icon:'',wordCount: 10, firstWordIndex: 1},
				{field:'业务点',text:'啊啊啊',desc:'',icon:'',wordCount: 2, firstWordIndex: 3},
                {
					field : '包含',
					text : '分组1'
				}, {
					field : '包含',
					text : '分组2'
				}, {
					field : '包含',
					text : '分组3'
				}, {
					field : '包含',
					text : '其他'
				}, {
					field : '包含',
					text : '分组5'
				}, {
					field : '包含',
					text : '分组4'
				}, {
					field : '属性',
					text : '费用词'
				},// 11
				{
					field : '属性',
					text : '地域词'
				},// 12
				{
					field : '属性',
					text : '咨询词'
				},// 13
				{
					field : '属性',
					text : '周边词'
				},// 14
				{
					field : '属性',
					text : '其他'
				},// 15
				{
					field : '属性',
					text : '通用词'
				},// 16
				{
					field : '属性',
					text : '傻瓜词'
				}// 17
		],
		// rsn2text : ["二级理由1:最新出现的网民搜索词","二级理由2:助您快人一步，抢占商机"],
		group : [],
		// wtag : ["分组1","分组2","分组3","分组4","其他"],
		actualquerytype : param.querytype == 0 ? 2 : 1,
		recquerytype : param.querytype == 0 ? 1 : 1
	}
	var len1 = 3, // Math.round(Math.random()*100) % 5, //多少分组
	// len2, //每分组多少个
	headTitle = ["黑马(%d)",
			"<span class='help_needed' title='同行关注'>同行关注(%d)</span>",
			"百度相关搜索(%d)", "相关词(%d)", "(%d)"];
	// if(Math.round(Math.random()*2) % 2)
	for (var j = 0; j < len1; j++) {
		var result = []
		for (var i = 0, len2 = Math.round(Math.random() * 100) % 10 + 3; i < len2; i++) {
			result[i] = {
				"wordid" : '110' + j + '' + i,
				"word" : param.query + param.querytype + '_' + j + '_' + i,
				"total_weight": Math.random() * 10,
				"pv" : 99 * i % 1000, // 精确
				"kwc" : 40 * i % 100,
				"pv_trend_month" : i % 14,
				"index" : j * len2 + i,
				"attr_index":[9,i%9+2,i%7+11]
			}
		}
		rel.data.group[j] = {
			grouprsn : headTitle[j],
			resultitem : result
		};
	}
	return rel;
};

Requester.debug.GET_kr_businessPointWords = function(level, param) {
        var rel = new Requester.debug.returnTpl();
        rel.data = {
			logid : 123,
			attr : []  , //保持一致性,不用处理
			query: '122',  //客户输入的词,帮助FE确认是哪个请求
			group : [
				{
                    grouprsn : '<span class="business_point"><label>“xxx”</label> 业务点下的其他关键词<span></span></span>',
					resultitem : [
					   {
						wordid : '123',              //wordid为关键词id，不用处理
						word : 'asdada',                  //word为关键词字面;
						pv : null, //保持一致性,不用处理；       
						kwc : null,        //保持一致性,不用处理度，
						pv_trend_month : null,//保持一致性,不用处理
						index : 0 ,                //顺序位置 
						attr_index : []      //保持一致性,不用处理    
					   },{
						wordid : '3434',               //wordid为关键词id，不用处理
						word : '122sasd',                  //word为关键词字面;
						pv : null, //保持一致性,不用处理；       
						kwc : null,        //保持一致性,不用处理度，
						pv_trend_month : null,//保持一致性,不用处理
						index : 1 ,                //顺序位置 
						attr_index : []      //保持一致性,不用处理    
					   },{
						wordid : '243243',               //wordid为关键词id，不用处理
						word : 'tyf',                  //word为关键词字面;
						pv : null, //保持一致性,不用处理；       
						kwc : null,        //保持一致性,不用处理度，
						pv_trend_month : null,//保持一致性,不用处理
						index : 2 ,                //顺序位置 
						attr_index : []      //保持一致性,不用处理    
					   }, {
						wordid : '1225465',               //wordid为关键词id，不用处理
						word : 'dgfd',                  //word为关键词字面;
						pv : null, //保持一致性,不用处理；          
						kwc : null,        //保持一致性,不用处理度，
						pv_trend_month : null,//保持一致性,不用处理
						index : 3 ,                //顺序位置 
						attr_index : []      //保持一致性,不用处理    
					   },{
						wordid : '65654',               //wordid为关键词id，不用处理
						word : 'fgfgh',                 //word为关键词字面;
						pv : null, //保持一致性,不用处理；      
						kwc : null,        //保持一致性,不用处理度，
						pv_trend_month : null,//保持一致性,不用处理
						index : 4 ,                //顺序位置 
						attr_index : []      //保持一致性,不用处理    
					   }
					]
				}
			],
		actualRecType : null,//保持一致性
		recquerytype : null    //保持一致性
        };
		return rel;
    };

Requester.debug.ADD_kr_recycle = function(level, param) {
	// console.log('ADD_kr_recycle' + param);
	var rel = new Requester.debug.returnTpl();
	rel.data = 1;
	return rel;
};

Requester.debug.DEL_kr_recycle = function(level, param) {
	// console.log('DEL_kr_recycle' + param);
	var rel = new Requester.debug.returnTpl();
	rel.data = 1;
	return rel;
};

Requester.debug.GET_kr_recycle_items = function(level, param) {
	// console.log('GET_kr_recycle_items' + param);
	var rel = new Requester.debug.returnTpl();
	var len = 251;
	var data = [];
	for (var i = 0; i < len; i++) {
		data[data.length] = {
			"status" : 0,
			"userid" : 800 + i,
			"addtime" : null,
			"unitid" : 100 + i,
			"planid" : 200 + i,
			"wordid" : 11000 + i,
			"modtime" : null,
			"krlogid" : 400 + i,
			"srchcnt" : 500 + i,
			"cmprate" : 600 + i,
			"word" : "很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长的音乐视频网站" + i,
			"krrid" : 700 + i
		}
	}
	rel.data = data;
	return rel;
};

Requester.debug.GET_kr_recycle_num = function(level, param) {
	// console.log('GET_kr_recycle_num' + param);
	var rel = new Requester.debug.returnTpl();
	rel.data = 299;
	return rel;
};

Requester.debug.GET_kr_expeStatus = function(level, param) {
	var rel = new Requester.debug.returnTpl();

	if (typeof Requester.debug.data.expeStatus[param.entry] == 'undefined') {
		Requester.debug.data.expeStatus[param.entry] = 1;
	}
	rel.data = Requester.debug.data.expeStatus[param.entry];
	return rel;
};
Requester.debug.GET_kr_suggestion = function() {
	var rel = new Requester.debug.returnTpl();

	rel.data = {
		logid : 123,
		attr : [], // 保持一致性,不用处理
		query : '122', // 客户输入的词,帮助FE确认是哪个请求
		group : [{
					groupRsn : null,// 保持一致性,不用处理
					resultitem : [{
						wordid : '123', // wordid为关键词id，不用处理
						word : 'asdada', // word为关键词字面;
						pv_zone : null, // 保持一致性,不用处理；
						pv_prospect : null,// 保持一致性,不用处理
						pv_prospect_phrase : null,// 保持一致性,不用处理
						kwc : null, // 保持一致性,不用处理度，
						pv_trend_month : null,// 保持一致性,不用处理
						index : 0, // 顺序位置
						attr_index : []
							// 保持一致性,不用处理
						}, {
						wordid : '3434', // wordid为关键词id，不用处理
						word : '122sasd', // word为关键词字面;
						pv_zone : null, // 保持一致性,不用处理；
						pv_prospect : null,// 保持一致性,不用处理
						pv_prospect_phrase : null,// 保持一致性,不用处理
						kwc : null, // 保持一致性,不用处理度，
						pv_trend_month : null,// 保持一致性,不用处理
						index : 1, // 顺序位置
						attr_index : []
							// 保持一致性,不用处理
						}, {
						wordid : '243243', // wordid为关键词id，不用处理
						word : 'tyf', // word为关键词字面;
						pv_zone : null, // 保持一致性,不用处理；
						pv_prospect : null,// 保持一致性,不用处理
						pv_prospect_phrase : null,// 保持一致性,不用处理
						kwc : null, // 保持一致性,不用处理度，
						pv_trend_month : null,// 保持一致性,不用处理
						index : 2, // 顺序位置
						attr_index : []
							// 保持一致性,不用处理
						}, {
						wordid : '1225465', // wordid为关键词id，不用处理
						word : 'dgfd', // word为关键词字面;
						pv_zone : null, // 保持一致性,不用处理；
						pv_prospect : null,// 保持一致性,不用处理
						pv_prospect_phrase : null,// 保持一致性,不用处理
						kwc : null, // 保持一致性,不用处理度，
						pv_trend_month : null,// 保持一致性,不用处理
						index : 3, // 顺序位置
						attr_index : []
							// 保持一致性,不用处理
						}, {
						wordid : '65654', // wordid为关键词id，不用处理
						word : 'fgfgh', // word为关键词字面;
						pv_zone : null, // 保持一致性,不用处理；
						pv_prospect : null,// 保持一致性,不用处理
						pv_prospect_phrase : null,// 保持一致性,不用处理
						kwc : null, // 保持一致性,不用处理度，
						pv_trend_month : null,// 保持一致性,不用处理
						index : 4, // 顺序位置
						attr_index : []
							// 保持一致性,不用处理
						}]
				}],
		actualRecType : null,// 保持一致性
		recquerytype : null
		// 保持一致性
	}
	return rel;
};

Requester.debug.GET_kr_noremind = function() {
        var rel = new Requester.debug.returnTpl();
        rel.data = 0;
        return rel;
};

Requester.debug.ADD_kr_addAutoUnit = function() {
	// return
	// {"data":{"groupList":[{"seqId":1,"planName":"yc_test","planId":21603722,"wordList":[{"selected":false,"wordCode":636,"wordStr":"真丝手绢"}],"unitId":95644402,"groupCode":-1,"unitName":"yc1"},{"seqId":2,"planName":"yc_test","planId":21603722,"wordList":[{"selected":false,"wordCode":636,"wordStr":"鲜花售卖2"}],"unitId":93951030,"groupCode":-1,"unitName":"yc2"},{"seqId":0,"planName":"新建计划","planId":21607655,"wordList":[{"selected":false,"wordCode":636,"wordStr":"苹果手机"},{"selected":false,"wordCode":636,"wordStr":"android手机"},{"selected":false,"wordCode":636,"wordStr":"迷你手机"}],"unitId":95647204,"groupCode":-1,"unitName":"新建单元1"},{"seqId":3,"planName":"新建计划","planId":-1,"wordList":[{"selected":false,"wordCode":-1,"wordStr":"速递1"},{"selected":false,"wordCode":-1,"wordStr":"速递3"},{"selected":false,"wordCode":-1,"wordStr":"速递4"},{"selected":false,"wordCode":-1,"wordStr":"速递2"}],"unitId":95647405,"groupCode":-1,"unitName":"新建单元5"},{"seqId":4,"planName":"新建计划","planId":-1,"wordList":[{"selected":false,"wordCode":-1,"wordStr":"啤酒"},{"selected":false,"wordCode":-1,"wordStr":"高档钢笔"},{"selected":false,"wordCode":-1,"wordStr":"花儿售卖"}],"unitId":-1,"groupCode":500,"unitName":"新建单元5"},{"seqId":5,"planName":"","planId":-1,"wordList":[],"unitId":-1,"groupCode":-1,"unitName":""},{"seqId":6,"planName":"","planId":-1,"wordList":[],"unitId":-1,"groupCode":-1,"unitName":""},{"seqId":7,"planName":"","planId":-1,"wordList":[],"unitId":-1,"groupCode":-1,"unitName":""}]},"status":300,"errorCode":null};

	var rel = new Requester.debug.returnTpl();
	rel.status = 300;

	var groupListTmp = [];

	for (var i = 0; i < 8; i++) {
		var wordListTmp = [];

		for (var j = 0; j < 7; j++) {
			wordListTmp[j] = {
				selected : false,
				wordStr : '院线加盟' + (3 * i + j), // 关键词字面
				wordCode : (j % 2 == 0) ? 634 : 635
			};
		}

		var group = {
			seqId : i, // 顺序标识，从0-7
			planId : i <= 3 ? 100 + (i + 1) : null, // 计划ID
			planName : '娱乐休闲', // 计划名
			unitId : 102, // 单元ID
			unitName : '数字影院', // 单元名
			groupCode : (i % 2 == 0) ? 405 : 502,
			wordList : wordListTmp
		};

		groupListTmp.push(group);
	}

	rel.data = {
		logid : 123, // 日志标识

		groupList : groupListTmp

	};

	rel.errorCode = {
		code : 2011
	};
    // 模拟数据请求延迟
	rel.timeout = 1000;
	return rel;

};

Requester.debug.GET_kr_valNewPlanUnit = function() {
	var rel = new Requester.debug.returnTpl();
	rel.status = 200;
	rel.errorCode = 502;
	rel.data = {
		logid : 123, // 日志标识
		data : {}
	};

	return rel;

};

Requester.debug.GET_kr_autounit = function() {

	// return
	// {"data":{"errorList":[{"wordCode":637,"wordStr":"fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"}]},"status":600,"errorCode":{"message":"kr
	// autounit word is null","code":2003,"idx":0,"detail":null}};

	var rel = new Requester.debug.returnTpl();
	rel.status = 200;

	var groupListTmp = [];

	for (var i = 0; i < 8; i++) {
		var wordListTmp = [];

		if (i <= 5) {
		    var random = Math.floor(Math.random()*20);
			for (var j = 0; j < random; j++) {
				wordListTmp[j] = {
					wordStr : (20 * i + j)
							+ ((j%5) ? '院线加盟' : '出资加盟一家大型滴商业电影院线要花费多少银子呢'), // 关键词字面
					wordCode : ''// 关键词状态码：636,642
				};
			}
		}

		var group = {
			seqId : i, // 顺序标识，从0-7
			planId : i <= 3 ? 100 + (i + 1) : null, // 计划ID
			planName : '娱乐休闲', // 计划名
			unitId : 102, // 单元ID
			unitName : '数字影院', // 单元名
			groupCode : -1,// (i%2==0 )?636:641,
			wordList : wordListTmp
		}

		groupListTmp[i] = group;
	}
	var newDate = new Date();

	rel.data = {
		logid : 123, // 日志标识
		krAutoUnitSessionId : newDate.getMilliseconds(),
		errorList : [{
					wordStr : '好长超长超。。。。。。。。',
					wordCode : 637
				}],
		groupList : groupListTmp,
		unitNameList : ["新建单元1", "新建单元2", "新建单元3", "新建单元4", "新建单元5", "新建单元6",
				"新建单元7", "新建单元8"]
	}
    // 模拟数据请求延迟
	rel.timeout = 1000;
	return rel;
};
Requester.debug.MOD_kr_expeStatus = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	Requester.debug.data.expeStatus[param.entry] = param.value;
	return rel;
};
