Requester.debug.GET_profile_hideopen = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		61 : -1,
		62 : 0,
		63 : 1
	};
	return rel;
};
Requester.debug.MOD_profile_hideopen = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		61 : 1
	};
	return rel;
};
Requester.debug.GET_profile_vstat = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		vstat : "nov",
		msgs : [{
			"location" : "1",
			"link" : "http://db-testing-ecom160.db01.baidu.com:8080/vchk/vlice/?userid=32",
			"title" : "真实性验证",
			"msg" : "(未验证)1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111"
		}, {
			"location" : "2",
			"link" : "http://db-testing-ecom160.db01.baidu.com:8080/vchk/bind/?userid=32",
			"title" : "关联",
			"msg" : "暂无消息"
		}],
		links : [{
			"location" : "3",
			"link" : "http://db-testing-ecom160.db01.baidu.com:8080/vchk/support/help",
			"title" : "客户真实性验证和关联介绍"
		}]
	};
	rel.status = 200;
	return rel;
};
Requester.debug.GET_profile_coupon = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		activity : [{
					href : 'http://www.baidu.com',
					desc : '111'
				}, {
					href : 'http://www.baidu.com',
					desc : '222'
				}],
		coupon : [{
					href : 'http://www.baidu.com',
					desc : '111'
				}, {
					href : 'http://www.baidu.com',
					desc : '222'
				}]
	};
	return rel;
};
/**
 * 请求账户质量评分各项指标的摘要数据接口模拟：点击、展现、浏览与转化和账户质量
 * @author Wu Huiyao 
 */
Requester.debug.GET_accountscore_abs = function(p1, params) {
	var rel = new Requester.debug.returnTpl();
	
	rel.data = {
		result_type : 4, //账户评分摘要
		account_score_abs:{
			res_num: 4, //返回的结果数
			account_score_abs_item:[],
			account_score_detail:{}  //摘要结果里面这个字段不用
		},
		token: 'asdasdsads12'
	};

	var abstractItems = rel.data.account_score_abs.account_score_abs_item;
	var score, change;
	for (var i = 0; i < 4; i ++) {
		score = Math.ceil(Math.random() * 100);
		change = 23;
		if (0 == i) {
			change = -1;
		} else if (1 == i) {
			change = 0;
		}
		//	score = null;
		 //	change = null;
		//}
		
		abstractItems[i] = {
			id: i, // 0x00 账户质量评分,0x01 展现环节,0x02 点击环节,0x03 浏览和转化环节
			account_score_abs_history:[{ // 当前只返回一天，所以数组元素就一个
				date: '2012-11-09',
				score:  score, // 得分 分数[0-100] 、null(若当天没有评分)
				desc_type: Math.ceil(Math.random() * 100) % 2, //得分评价 0 较差 1 良好
				score_change: change //得分浮动 正数表示增加 负数表示减少 0表示无变化 ,null 表示评分缺失 无法计算
			}]
		};
	}
	
	rel.timeout = debugUtil.getResponseTimeOut(params);
	
	return rel;
};
/**
 * 请求账户质量评分各项指标的历史数据接口模拟，用于账户质量评分的Flash图表
 * @author Wu Huiyao 
 */
Requester.debug.GET_accountscore_history = function(p1, params) {
    var rel = new Requester.debug.returnTpl();
    rel.status = 200;
    rel.data = {
		result_type : 4, //账户评分摘要
		account_score_abs:{}, //flash图的结果这个字段没用
		account_score_detail:{
			res_num: 14,
			account_score_detail_item:[]
		},
		token: 'asdasdsads12'
	};

	var details = rel.data.account_score_detail.account_score_detail_item,
	    history,
	    date = new Date();
	for (var i = 0; i < 4; i ++) {
		details[i] = {
	        id: i,  // 0x00 账户质量评分,0x01 展现环节,0x02 点击环节,0x03 浏览和转化环节
			score_history:[]
		};
		
		history = details[i].score_history;
		for (var j = 0; j < 14; j ++) {
			date.setDate(date.getDate() - 1);
			history[j] = {
				date: baidu.date.format(date, 'yyyy-MM-dd'),
				score: '' + Math.ceil(Math.random() * 100) //得分 分数[0-100] 、null(若当天没有评分)
			};
			if (j == 3) {
				history[j].score = null;
			}
		}
	}

    rel.timeout = debugUtil.getResponseTimeOut(params);
    
    return rel;
};
/**
 * 请求账户质量评分同行数据的接口模拟
 * @author Wu Huiyao 
 */
Requester.debug.GET_accountscore_peerdata = function(p1, params) {
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
			min_value: '100',
			max_value: '900',
			avg_value: '500',
			good_value: '700',
			curr_value: '100',
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
			data_type: '4', // 重点词平均排名
			min_value: '0',
			max_value: '90',
			avg_value: '50',
			good_value: '81',
			curr_value: '76',
			top_percentage: Math.ceil(Math.random() * 100) + ''
		},
		{
			data_type: '5', // 生效三星词比例
			min_value: '13',
			max_value: '84',
			avg_value: '61',
			good_value: '70',
			//curr_value: '60',
			top_percentage: Math.ceil(Math.random() * 100) + ''
		},
		{
			data_type: '6', //网站打开速度
			min_value: '0',
			max_value: '12',
			avg_value: '5',
			good_value: '10',
			curr_value: 1,//'-1',
			top_percentage: Math.ceil(Math.random() * 100) + ''
		},
		{
			data_type: '7', // 网站吸引力
			min_value: '13',
			max_value: '84',
			avg_value: '61',
			good_value: '70',
			curr_value: -1,
			top_percentage: Math.ceil(Math.random() * 100) + ''
		},
		{
			data_type: '8', // others no use
			min_value: '0',
			max_value: '94',
			avg_value: '77',
			good_value: '83',
			curr_value: '59',
			top_percentage: Math.ceil(Math.random() * 100) + ''
		}
	];
	// value = [];
	rel.data.peer_data = {};
	rel.data.peer_data.value = value;
	rel.data.token = 'adwew323';
	
	rel.timeout = debugUtil.getResponseTimeOut(params);
    return rel;
};