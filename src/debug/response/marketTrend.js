
/**
 * 请求市场风向标首页数据
 */
Requester.debug.GET_markettrend_index = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		yAverageShare : 0.08,
		lAverageShare : 0.07,
		yLeftShare : 0.10,
		lLeftShare : 1.00
	}
	return rel;
};

Requester.debug.GET_markettrend_mytrade = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = [{
				name : "['行业1', '行业2', '行业3']",
				id : 0
			}, {
				name : "['行业1', '行业2', '行业3']",
				id : 1
			}, {
				name : "['行业1', '行业2', '行业3']",
				id : 2
			}, {
				name : "['行业1', '行业2', '行业3']",
				id : 3
			}, {
				name : "['行业1', '行业2', '行业3']",
				id : 4
			}]
	return rel;
};

Requester.debug.GET_markettrend_areadistribution = function() {
	var rel = new Requester.debug.returnTpl();

	rel.data = [{
				"id" : 1,
				"rank" : 1,
				"epvRate" : 0.9
			}, {
				"id" : 2,
				"rank" : 2,
				"epvRate" : 0.8
			}, {
				"id" : 33,
				"rank" : 3,
				"epvRate" : 0.1200
			}, {
				"id" : 3,
				"rank" : 4,
				"epvRate" : 0.1200
			}, {
				"id" : 27,
				"rank" : 5,
				"epvRate" : 0.1200
			}, {
				"id" : 26,
				"rank" : 6,
				"epvRate" : 0.1200
			}, {
				"id" : 34,
				"rank" : 7,
				"epvRate" : 0.1200
			}, {
				"id" : 9,
				"rank" : 8,
				"epvRate" : 0.1200
			}, {
				"id" : 14,
				"rank" : 9,
				"epvRate" : 0.1200
			}, {
				"id" : 4,
				"rank" : 10,
				"epvRate" : 0.12000
			}, {
				"id" : 5,
				"rank" : 11,
				"epvRate" : 0.5834
			}, {
				"id" : 8,
				"rank" : 12,
				"epvRate" : 0.0257
			}, {
				"id" : 10,
				"rank" : 13,
				"epvRate" : 0.6323
			}, {
				"id" : 11,
				"rank" : 14,
				"epvRate" : 0.7186
			}, {
				"id" : 12,
				"rank" : 15,
				"epvRate" : 0.9357
			}, {
				"id" : 13,
				"rank" : 16,
				"epvRate" : 0.9617
			}, {
				"id" : 15,
				"rank" : 17,
				"epvRate" : 0.4695
			}, {
				"id" : 16,
				"rank" : 18,
				"epvRate" : 0.9551
			}, {
				"id" : 17,
				"rank" : 19,
				"epvRate" : 0.0219
			}, {
				"id" : 18,
				"rank" : 20,
				"epvRate" : 0.9439
			}, {
				"id" : 19,
				"rank" : 21,
				"epvRate" : 0.0938
			}, {
				"id" : 20,
				"rank" : 22,
				"epvRate" : 0.6310
			}, {
				"id" : 21,
				"rank" : 23,
				"epvRate" : 0.0848
			}, {
				"id" : 22,
				"rank" : 24,
				"epvRate" : 0.7426
			}, {
				"id" : 23,
				"rank" : 25,
				"epvRate" : 0.4448
			}, {
				"id" : 24,
				"rank" : 26,
				"epvRate" : 0.9782
			}, {
				"id" : 25,
				"rank" : 27,
				"epvRate" : 0.2134
			}, {
				"id" : 28,
				"rank" : 28,
				"epvRate" : 0.8908
			}, {
				"id" : 29,
				"rank" : 29,
				"epvRate" : 0.4985
			}, {
				"id" : 30,
				"rank" : 30,
				"epvRate" : 0.1238
			}, {
				"id" : 31,
				"rank" : 31,
				"epvRate" : 0.7953
			}, {
				"id" : 32,
				"rank" : 32,
				"epvRate" : 0.7221
			}, {
				"id" : 35,
				"rank" : 33,
				"epvRate" : 0.6257
			}, {
				"id" : 36,
				"rank" : 34,
				"epvRate" : 0.6572
			}];

	return rel;
};

Requester.debug.GET_markettrend_wordstrend = function() {
	var rel = new Requester.debug.returnTpl();
    
	rel.data = {
		topWords : [{
					id : 1,
					word : '关键词1',
					value : 10009
				}, {
					id : 2,
					word : '关键词2',
					value : 2000
				}, {
					id : 3,
					word : '关键词3',
					value : 1000
				}, {
					id : 4,
					word : '关键词4',
					value : 10006
				}, {
					id : 5,
					word : '关键词5',
					value : 10005
				}, {
					id : 6,
					word : '关键词6',
					value : 2004
				}, {
					id : 7,
					word : '关键词7',
					value : 10003
				}, {
					id : 8,
					word : '关键词8',
					value : 6002
				}, {
					id : 9,
					word : '关键词9',
					value : 9001
				}, {
					id : 10,
					word : '关键词10',
					value : 10000
				}, {
					id : 11,
					word : '关键词6',
					value : 7004
				}, {
					id : 12,
					word : '关键词7',
					value : 10003
				}, {
					id : 13,
					word : '关键词8',
					value : 5002
				}, {
					id : 14,
					word : '关键词9',
					value : 4001
				}, {
					id : 15,
					word : '关键词10',
					value : 3000
				}],
		explosiveWords : [{
					id : 16,
					word : '我是关键词1111111111111111111',
					value : 10009,
					upRate : 0.9955
				}, {
					id : 17,
					word : '我是关键词1222222222222222222',
					value : 10008,
					upRate : 0.9955
				}, {
					id : 18,
					word : '关键词1',
					value : 10007,
					upRate : 0.9955
				}, {
					id : 19,
					word : '我是关键词14',
					value : 10006,
					upRate : 0.9955
				}, {
					id : 20,
					word : '我是关键词15',
					value : 10005,
					upRate : 0.9955
				}, {
					id : 21,
					word : '我是关键词16',
					value : 10004,
					upRate : 0.9955
				}, {
					id : 22,
					word : '我是关键词17',
					value : 10003,
					upRate : 0.9955
				}, {
					id : 23,
					word : '我是关键词18',
					value : 10002,
					upRate : 0.9955
				}, {
					id : 24,
					word : '我是关键词19',
					value : 10001,
					upRate : 0.9955
				}, {
					id : 25,
					word : '我是关键词20',
					value : 10,
					upRate : 0.9955
				}, {
					id : 26,
					word : '我是关键词19',
					value : 10001,
					upRate : 0.9955
				}, {
					id : 27,
					word : '我是关键词20',
					value : 10,
					upRate : 0.9955
				}]
	};

	return rel;
};
Requester.debug.GET_markettrend_epvwordstrend = function() {
	var rel = new Requester.debug.returnTpl();

	rel.data = {
		topWords : [{
					id : 1,
					word : '关键词1',
					value : 10009
				}, {
					id : 2,
					word : '关键词2',
					value : 10008
				}, {
					id : 3,
					word : '关键词3',
					value : 10007
				}, {
					id : 4,
					word : '关键词4',
					value : 10006
				}, {
					id : 5,
					word : '关键词5',
					value : 10005
				}, {
					id : 6,
					word : '关键词6',
					value : 10004
				}, {
					id : 7,
					word : '关键词7',
					value : 10003
				}, {
					id : 8,
					word : '关键词8',
					value : 10002
				}, {
					id : 9,
					word : '关键词9',
					value : 10001
				}, {
					id : 10,
					word : '关键词10',
					value : 10000
				}, {
					id : 11,
					word : '关键词6',
					value : 10004
				}, {
					id : 12,
					word : '关键词7',
					value : 10003
				}, {
					id : 13,
					word : '关键词8',
					value : 10002
				}],
		explosiveWords : [{
					id : 16,
					word : '我是关键词1111111111111111111',
					value : 10009,
					upRate : 0.9955
				}, {
					id : 17,
					word : '我是关键词1222222222222222222',
					value : 10008,
					upRate : 0.9955
				}, {
					id : 18,
					word : '关键词1',
					value : 10007,
					upRate : 0.9955
				}, {
					id : 19,
					word : '我是关键词14',
					value : 10006,
					upRate : 0.9955
				}, {
					id : 20,
					word : '我是关键词15',
					value : 10005,
					upRate : 0.9955
				}, {
					id : 21,
					word : '我是关键词16',
					value : 10004,
					upRate : 0.9955
				}, {
					id : 22,
					word : '我是关键词17',
					value : 10003,
					upRate : 0.9955
				}, {
					id : 23,
					word : '我是关键词18',
					value : 10002,
					upRate : 0.9955
				}, {
					id : 24,
					word : '我是关键词19',
					value : 10001,
					upRate : 0.9955
				}, {
					id : 25,
					word : '我是关键词20',
					value : 10,
					upRate : 0.9955
				}, {
					id : 27,
					word : '我是关键词20',
					value : 10,
					upRate : 0.9955
				}]
	};

	return rel;
};
Requester.debug.GET_markettrend_mytrend = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		leftShowTrend : [{
					date : (new Date()).getTime(),
					most : 0.4,
					avg : 0.3,
					mine : 0.2
				}, {
					date : (new Date()).getTime(),
					most : 0.4,
					avg : 0.3,
					mine : 0.2
				}, {
					date : (new Date()).getTime(),
					most : 0.4,
					avg : 0.3,
					mine : 0.2
				}, {
					date : (new Date()).getTime(),
					most : 0.4,
					avg : 0.3,
					mine : 0.2
				}, {
					date : (new Date()).getTime(),
					most : 0.4,
					avg : 0.3,
					mine : 0.2
				}, {
					date : (new Date()).getTime(),
					most : 0.4,
					avg : 0.3,
					mine : 0.2
				}, {
					date : (new Date()).getTime(),
					most : 0.4,
					avg : 0.3,
					mine : 0.2
				}, {
					date : (new Date()).getTime(),
					most : 0.4,
					avg : 0.3,
					mine : 0.2
				}, {
					date : (new Date()).getTime(),
					most : 0.4,
					avg : 0.3,
					mine : 0.2
				}, {
					date : (new Date()).getTime(),
					most : 0.4,
					avg : 0.3,
					mine : 0.2
				}, {
					date : (new Date()).getTime(),
					most : 0.4,
					avg : 0.3,
					mine : 0.2
				}, {
					date : (new Date()).getTime(),
					most : 0.4,
					avg : 0.3,
					mine : 0.2
				}, {
					date : (new Date()).getTime(),
					most : 0.4,
					avg : 0.3,
					mine : 0.2
				}, {
					date : (new Date()).getTime(),
					most : 0.4,
					avg : 0.3,
					mine : 0.2
				}, {
					date : (new Date()).getTime(),
					most : 0.4,
					avg : 0.3,
					mine : 0.2
				}, {
					date : (new Date()).getTime(),
					most : 0.4,
					avg : 0.3,
					mine : 0.2
				}, {
					date : (new Date()).getTime(),
					most : 0.4,
					avg : 0.3,
					mine : 0.2
				}, {
					date : (new Date()).getTime(),
					most : 0.4,
					avg : 0.3,
					mine : 0.2
				}, {
					date : (new Date()).getTime(),
					most : 0.4,
					avg : 0.3,
					mine : 0.2
				}

		],
		promotionShowTrend : [{
					date : (new Date()).getTime(),
					avg : 100000,
					mine : 9999999
				}, {
					date : (new Date()).getTime(),
					avg : 100000,
					mine : 5555555
				}, {
					date : (new Date()).getTime(),
					avg : 100000,
					mine : 9999999
				}, {
					date : (new Date()).getTime(),
					avg : 5555555,
					mine : 9999999
				}, {
					date : (new Date()).getTime(),
					avg : 100000,
					mine : 9999999
				}, {
					date : (new Date()).getTime(),
					avg : 100000,
					mine : 9999999
				}, {
					date : (new Date()).getTime(),
					avg : 100000,
					mine : 9999999
				}, {
					date : (new Date()).getTime(),
					avg : 100000,
					mine : 9999999
				}, {
					date : (new Date()).getTime(),
					avg : 100000,
					mine : 9999999
				}, {
					date : (new Date()).getTime(),
					avg : 100000,
					mine : 9999999
				}, {
					date : (new Date()).getTime(),
					avg : 100000,
					mine : 9999999
				}, {
					date : (new Date()).getTime(),
					avg : 100000,
					mine : 9999999
				}, {
					date : (new Date()).getTime(),
					avg : 100000,
					mine : 9999999
				}, {
					date : (new Date()).getTime(),
					avg : 100000,
					mine : 9999999
				}, {
					date : (new Date()).getTime(),
					avg : 100000,
					mine : 9999999
				}, {
					date : (new Date()).getTime(),
					avg : 100000,
					mine : 9999999
				}, {
					date : (new Date()).getTime(),
					avg : 100000,
					mine : 9999999
				}, {
					date : (new Date()).getTime(),
					avg : 100000,
					mine : 9999999
				}, {
					date : (new Date()).getTime(),
					avg : 100000,
					mine : 9999999
				}]
	};
	return rel;
};
Requester.debug.GET_markettrend_timedistribution = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = [{
				time : 0,
				rate : 0.4
			}, {
				time : 1,
				rate : 0.39
			}, {
				time : 2,
				rate : 0.38
			}, {
				time : 3,
				rate : 0.37
			}, {
				time : 5,
				rate : 0.36
			}, {
				time : 4,
				rate : 0.35
			}, {
				time : 6,
				rate : 0.34
			}, {
				time : 7,
				rate : 0.33
			}, {
				time : 8,
				rate : 0.32
			}, {
				time : 9,
				rate : 0.31
			}, {
				time : 10,
				rate : 0.30
			}, {
				time : 11,
				rate : 0.29
			}, {
				time : 12,
				rate : 0.28
			}, {
				time : 13,
				rate : 0.27
			}, {
				time : 14,
				rate : 0.26
			}, {
				time : 15,
				rate : 0.25
			}, {
				time : 16,
				rate : 0.24
			}, {
				time : 17,
				rate : 0.23
			}, {
				time : 18,
				rate : 0.22
			}, {
				time : 19,
				rate : 0.21
			}, {
				time : 20,
				rate : 0.20
			}, {
				time : 21,
				rate : 0.19
			}, {
				time : 22,
				rate : 0.18
			}, {
				time : 23,
				rate : 0.17
			}];
	return rel;
};

Requester.debug.GET_markettrend_trenddistribution = function() {
	var rel = new Requester.debug.returnTpl(), table = [{
		"date" : "1345433137508",// 时间
		"value" : 0.90
			// 数值
		}, {
		"date" : "1345519553981",// 时间
		"value" : 0.30
			// 数值
		}, {
		"date" : "13456060233531",// 时间
		"value" : 0.60
			// 数值
		}, {
		"date" : "1345692440772",// 时间
		"value" : 0.40
			// 数值
		}, {
		"date" : "1345778872448",// 时间
		"value" : 0.30
			// 数值
		}, {
		"date" : "1345865290782",// 时间
		"value" : 0.10
			// 数值
		}, {
		"date" : "1345951712085",// 时间
		"value" : 0.30
			// 数值
		}];
	/*
	 * var date = new Date();
	 * 
	 * for(i=0;i<180;i++){ var day = date.getDate(); table[i] ={ date :
	 * date.setDate(day + 1), value:10 } }
	 */

	rel.data = [{
				trend : 0.89234,
				rate : 0.3000,
				table : table
			}, {
				trend : 111111111111,
				rate : 0.312300,
				table : table
			}, {
				trend : 111111111111,
				rate : -0.3000,
				table : table
			}]
	return rel;
};

/*****以下是2.0版本的接口*****/
/**
 * 请求市场风向标首页数据
 */
Requester.debug.GET_mktinsight_index = function() {
	var rel = new Requester.debug.returnTpl();
	var now = new Date();
	rel.data = {
	    id: 15,
		hotBegin: now.getTime() + 5*24*3600*1000,
		hotEnd: now.getTime() + 43*24*3600*1000,
		name: '旅游及票务>旅游>云南西双版纳旅游哈哈',
		ratio: 0.1701,
		myShow: 0.0012,
		myShowLastWeek: 0.0021,
		averageShow: 0.0032,
		averageShowLastWeek: 0.0038
	}
	return rel;
};
Requester.debug.GET_mktinsight_industrys = function(){
	var rel = new Requester.debug.returnTpl();
	var now = new Date();
	rel.data = [
	    {
            id: 25,
            name: '教育与培训>教育>教学设备',
            percent: 0.0911,
            isDefault: false,
            show: 121210,
            showRate: -4.2221,
            click: 10240,
            clickRate: -0.2222,
            //hotBegin: now.getTime() - 51*24*3600*1000,
            //hotEnd: now.getTime() - 35*24*3600*1000,
            hotIncrease: 0.0121//旺季检索量提升百分比
        },
		{
			id: 23,
			name: '旅游及票务>旅游>云南西双版纳旅游',
			percent: 0.1700,//占比
			show: 3343340,
			showRate: 0.0121,//百分比的整数部分
			click: 33440,
			clickRate: -1.2,//百分比的整数部分，负数表示下降
			hotBegin: now.getTime() + 5*24*3600*1000,
			hotEnd: now.getTime() + 11*24*3600*1000,
			hotIncrease: 0.0121//旺季检索量提升百分比
		},
		{
			id: 21,
			name: '旅游及票务>旅游>自由行',
			percent: 0.2601,
			show: 210,
			showRate: 0.02001,
			click: 4090000000,
			//clickRate: -0.2000,
			hotBegin: now.getTime() + 8*24*3600*1000,
			hotEnd: now.getTime() + 19*24*3600*1000,
			hotIncrease: 0.0121//旺季检索量提升百分比
		},
		{
			id: 20,
			name: '互联网与软件>互联网>域名空间',
			percent: 0.3100,
			isDefault: false,
			show: 0,
			showRate: null,
			//click: 11240,
			clickRate: -0.2322,
			hotBegin: now.getTime() + 22*24*3600*1000,
			hotEnd: now.getTime() + 34*24*3600*1000,
			hotIncrease: 0.0121//旺季检索量提升百分比
		},
		{
			id: 29,
			name: '服务>办公服务>办证刻章',
			percent: 0.0511,
			isDefault: false,
			show: 227210,
			showRate: 0.0000,
			click: 7240,
			clickRate: 0.0000,
			hotBegin: now.getTime() - 2*24*3600*1000,
			hotEnd: now.getTime() + 71*24*3600*1000,
			hotIncrease: 0.0121//旺季检索量提升百分比
		}
	];
	
	return rel;
};
Requester.debug.GET_mktinsight_peerbusiness = function(){
    var rel = new Requester.debug.returnTpl();
    var now = new Date();
    rel.data = [
        {
            id: 23,
            name: '音像出版>音像>电影',
            percent: 0.1700,//投放该行业的同行占比
            hotBegin: now.getTime() + 5*24*3600*1000,
            hotEnd: now.getTime() + 11*24*3600*1000
        },
        {
            id: 23,
            name: '物流>快递>国际快递',
            percent: 0.1206,//投放该行业的同行占比
            hotBegin: now.getTime() - 51*24*3600*1000,
            hotEnd: now.getTime() - 35*24*3600*1000
        },
        {
            id: 20,
            name: '广播电视>广播>校园广播网',
            percent: 0.3130,
            hotBegin: now.getTime() - 2*24*3600*1000,
            hotEnd: now.getTime() + 71*24*3600*1000
        }
    ];
    
    return rel;
};
Requester.debug.GET_mktinsight_peerbusiwords = function() {
    var rel = new Requester.debug.returnTpl();
    rel.data = [{
                    id : 1,
                    word : 'dj舞曲',
                    value : 20009
                }, {
                    id : 2,
                    word : 'mp4电影下载',
                    value : 30008
                }, {
                    id : 3,
                    word : '麻辣女兵电视',
                    value : 50007
                }, {
                    id : 4,
                    word : '吸血鬼日记',
                    value : 90006
                }, {
                    id : 5,
                    word : '周杰伦十二新作',
                    value : 40005
                }];
    return rel;
};
Requester.debug.GET_mktinsight_trend = function(){
	var rel = new Requester.debug.returnTpl();
	var now = new Date();
	rel.data = {
	    mainData: {
	    	oldPV: [],
	    	newPV: [],
	    	myShow: [],
	    	otherShow: []
	    },
	    hotData: []
	};
	//设置数据
	var historyBeginDate = new Date();
	historyBeginDate.setFullYear((historyBeginDate.getMonth() <= 5) ? (historyBeginDate.getFullYear() - 2) 
	    : (historyBeginDate.getFullYear() - 1));
	historyBeginDate.setMonth(5);
	historyBeginDate.setDate(30);
	
	var newBeginDate = new Date();
	if (newBeginDate.getMonth() <= 5) {
		newBeginDate.setFullYear(newBeginDate.getFullYear() - 1);
	}
	newBeginDate.setMonth(5);
	newBeginDate.setDate(30);
	
	var tempHotArray = [];
	for (var i = 0; i < 365; i ++) {
		historyBeginDate.setDate(historyBeginDate.getDate() + 1);
		rel.data.mainData.oldPV.push({
		    date: historyBeginDate.getTime(),
		    value: Math.floor(Math.random()*1000)
		});
		if (Math.random() < 0.03) {
			tempHotArray.push(historyBeginDate.getTime());
		}
		
		newBeginDate.setDate(newBeginDate.getDate() + 1);
		if (newBeginDate.getTime() <= now.getTime()) {
			rel.data.mainData.newPV.push({
			    date: newBeginDate.getTime(),
			    value: Math.floor(Math.random()*1000)
			});
			rel.data.mainData.myShow.push({
			    date: newBeginDate.getTime(),
			    value: Math.floor(Math.random()*100)
			});
			rel.data.mainData.otherShow.push({
			    date: newBeginDate.getTime(),
			    value: Math.floor(Math.random()*100)
			});
		}
	}
	
	var hotArrayLen = tempHotArray.length;
	if (hotArrayLen%2) {
		tempHotArray.pop();
	}
	for (var j = 0; j < hotArrayLen - 1; (j = j + 2)) {
		rel.data.hotData.push({
			begin: tempHotArray[j],
			end: tempHotArray[j + 1]
		});
	}
	
	return rel;
};
Requester.debug.GET_mktinsight_trendRatio = function(){
    var rel = new Requester.debug.returnTpl();
    rel.data={
        myRatio: [
            10.11,
            100*Math.random()
        ],
        otherRatio: null,
        industryRatio: [
            0 - Math.random(),
            null,
            0 - Math.random()
        ]
    };
    
    return rel;
};
Requester.debug.GET_mktinsight_trendreading = function() {
    var rel = new Requester.debug.returnTpl();
    rel.data = {
        averageWord: 3499,//同行平均购词量
        myWord: 5000,//我的购词量
        comparedWord: Math.random(),//高于同行的百分比
        averageShow: Math.random(),
        myShow: Math.random(),
        comparedShow: Math.random()
    };
    
    return rel;
};
Requester.debug.GET_mktinsight_hotreading = function() {
    var rel = new Requester.debug.returnTpl();
    rel.data = {
        budgetPercent: Math.random(),//提价同行百分比
        budgetRaised: Math.random(),//同行提价额
        pricedPercent: Math.random(),//价格升高关键词百分比
        increasedPercent: Math.random()//增加购词量的同行百分比
    };
    
    return rel;
};
Requester.debug.GET_mktinsight_hotwords = function() {
    var rel = new Requester.debug.returnTpl();
    rel.status = 500;
    rel.errorCode = {
        code: 10002
    };
    rel.data = [{
                    id : 1,
                    word : '关键词1单独的得到',
                    value : 20009,
                    upRate : 0.9955
                }, {
                    id : 2,
                    word : '关键哦哦鹅鹅鹅词2',
                    value : 30008,
                    upRate : 0.9955
                }, {
                    id : 3,
                    word : '关键ds都神神叨叨词3',
                    value : 50007,
                    upRate : -0.2155
                }, {
                    id : 4,
                    word : '关键词4',
                    value : 90006,
                    upRate : -0.1955
                }, {
                    id : 5,
                    word : '关键词5',
                    value : 10005,
                    upRate : 0.2955
                },{
                    id : 6,
                    word : '关键词的得到',
                    value : 20009,
                    upRate : 0.9955
                }, {
                    id : 7,
                    word : '关键哦鹅鹅词2',
                    value : 30008,
                    upRate : 0.9955
                }, {
                    id : 11,
                    word : '关键ds都神神叨叨词3',
                    value : 50007,
                    upRate : -0.2155
                }, {
                    id : 23,
                    word : '关键4',
                    value : 90006,
                    upRate : -0.1955
                }, {
                    id : 10,
                    word : '关键10',
                    value : 10005,
                    upRate : 0.2955
                }, {
                    id : 33,
                    word : '关键41',
                    value : 90006,
                    upRate : -0.1955
                }, {
                    id : 40,
                    word : '关键120',
                    value : 10005,
                    upRate : 0.2955
                }];
    return rel;
};
Requester.debug.GET_mktinsight_raisedwords = function() {
    var rel = new Requester.debug.returnTpl();
    rel.status = 500;
    rel.errorCode = {
        code: 10002
    };
    rel.data = [{
                    id : 1,
                    word : '关键词1',
                    value : 20009,
                    upRate : 0//注意，这个upRate取值为0/1分别表示“已购买”和“建议购买”
                }, {
                    id : 2,
                    word : '关键词了谁离了谁了劳斯莱斯',
                    value : 30008,
                    upRate : 1
                }, {
                    id : 3,
                    word : '关键词33卡后婚都结了',
                    value : 50007,
                    upRate : 0
                }, {
                    id : 4,
                    word : '关键',
                    value : 90006,
                    upRate : 0
                }, {
                    id : 5,
                    word : '关键词5嗯嗯我去嗯嗯',
                    value : 50005,
                    upRate : 1
                }];
    return rel;
};
Requester.debug.GET_mktinsight_boughtwords = function() {
    var rel = new Requester.debug.returnTpl();
    rel.data = [{
                    id : 1,
                    word : '关键词1',
                    value : 20009
                }, {
                    id : 2,
                    word : '关键词多多少少是2',
                    value : 30008
                }, {
                    id : 3,
                    word : '关键词32233顶多算是',
                    value : 50007
                }, {
                    id : 4,
                    word : '关键词ss',
                    value : 90006
                }, {
                    id : 5,
                    word : '关键词5',
                    value : 40005
                }];
    return rel;
};
Requester.debug.GET_mktinsight_hour = function() {
    var rel = new Requester.debug.returnTpl();
    rel.data = {
        weekPV: [],
        weekShow: [],
        workPV: [],//工作日流量
        workCPTPeer: [],//工作日竞争
        workCPTPeerMin: [],//工作日同行业竞争，前三个就是检索量大同行竞争小的三个时段
        workMyHour: [],
        weekendPV: [],
        weekendCPTPeer: [],
        weekendCPTPeerMin: [],
        weekendMyHour: []
    };
    for (var i = 0; i < 24; i ++) {
        rel.data.workPV.push({
           time: i,
           rate: Math.random()
        });
        rel.data.workCPTPeerMin.push({
           time: i,
           rate: Math.random()
        });
        rel.data.workCPTPeer.push({
           time: i,
           rate: Math.random()
        });
        rel.data.workMyHour.push({
           time: i,
           rate: (Math.random() > 0.4) ? 1 : 0
        });
        rel.data.weekendPV.push({
           time: i,
           rate: Math.random()
        });
        rel.data.weekendCPTPeerMin.push({
           time: i,
           rate: Math.random()
        });
        rel.data.weekendCPTPeer.push({
           time: i,
           rate: Math.random()
        });
        rel.data.weekendMyHour.push({
           time: i,
           rate: (Math.random() > 0.4) ? 1 : 0
        });
    }
    var beginDate = new Date();
    var tempDate = beginDate.getDate();
    for(var j = 0; j < 7; j ++) {
        beginDate.setDate(tempDate - (7 - j));
        if (Math.random() < 0.8){
            rel.data.weekPV.push({
               date: beginDate.getTime(),
               value: Math.round(1000*Math.random())
            });
        }
        if (Math.random() < 0.8){
            rel.data.weekShow.push({
               date: beginDate.getTime(),
               value: Math.round(1000*Math.random())
            });
        }
    }
    return rel;
};
Requester.debug.GET_mktinsight_weekendwords = function() {
    var rel = new Requester.debug.returnTpl();
    rel.data = [{
                    id : 1,
                    word : '关键词1',
                    value : 20009,
                    upRate: 29
                }, {
                    id : 2,
                    word : '关键词多多少少是2',
                    value : 30008,
                    upRate: 21
                }, {
                    id : 3,
                    word : '关键词32233顶多算是',
                    value : 50007,
                    upRate: 20
                }, {
                    id : 4,
                    word : '关键词ss',
                    value : 90006,
                    upRate: 22
                }, {
                    id : 5,
                    word : '关键词5',
                    value : 40005,
                    upRate: 11
                }];
    return rel;
};
Requester.debug.GET_mktinsight_region = function() {
    var rel = new Requester.debug.returnTpl();

    rel.data = [];
    for (var i = 0; i < 37; i ++) {
        var temp = Math.random();
        if (temp < 0.2) {
            rel.data.push({
                id: i,
                acp: Math.round(10000*Math.random())/10000//平均ACP与北京的比较值
            });
        }
        else if (temp > 0.8){
            rel.data.push({
                id: i,
                epvRate: Math.round(10000*Math.random())/10000//行业流量占比
            });
        } else {
            rel.data.push({
                id: i,
                epvRate: Math.round(10000*Math.random())/10000,//行业流量占比
                acp: Math.round(10000*Math.random())/10000//平均ACP与北京的比较值
            });
        }
    }

    return rel;
};

Requester.debug.GET_mktinsight_regionpeerbuy = function() {
    var rel = new Requester.debug.returnTpl();
    
    rel.data = [];
    for (var i = 1; i < 15; i ++) {
        rel.data.push({
            id: i,
            //投此地域的同行百分比
            value: Math.round(10000*Math.random())/10000
        });
    }

    return rel;
};

/*****关键词排行部分复用了风向标1.0的接口GET_markettrend_epvwordstrend*****/
