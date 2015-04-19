//心跳请求
Requester.debug.zebra = function(){
	return {
		status: true
	}
};
	
Requester.debug.scookie = function(level, param){
    return "{'scookie':'linfeng'}";
};
	
Requester.debug.GET_auth = function(level, param){
	var rel = new Requester.debug.returnTpl();
	rel = {
		username: '童遥',
		token	: 'lk',
		servertime : new Date().valueOf() / 1000,//(baidu.date.parse('2013-5-25').valueOf() - 1000) / 1000,
		//servertime : 1318204800,   ///1320969600000
		ulevelid : 10101,//10104,
		optulevelid : 20201,
		optid	:	10,
		optname	:	'操作人用户名',
		reportlevel: 201,
		spaceNewCount : 12,
		auth	:	{
			region	:	true,
			gaoduan	:	true,
			xijing  :   100,
			userRole : "word4admin"
		},
        wirelessRemoveDownFile:'www.baidu.com',//,'0'
       'mpricefactor-range': { 
           min :1,
           max :7.99
        },

  	    alldevicefloat:false,
		// userRoles:['mobile-intro','wireless-user-explicit','discount-info','advanced-ip-excluded','negative-word-more','wireless-user-mpricefactor','wireless-user-bridge'],'fcwise-mobile-user',
		userRoles:['aries-xll', 'lab','mobile-intro','discount-info','negative-word-more','mktinsight','wireless-user-explicit','new-alldevice-float'],//,'wireless-user-mpricefactor','fcwise-mobile-user''fcwise-alldevice-user',
		labtools:["abtest", "cpa"],
		exp: 7240,// 手动版时段升级 //7650, // 版本号，市场风向标三期
        aoexp: [/*'corewordexp'*//*'recmwordexp'*/'aopointactivity','aofuse1.0'],
        urlCutPrex:['siteapp.baidu.com/site/','page.baidu.com/'],
        // 权限控制中心，读写分离
        acc: {
        	optAuth: true,  // true代表有权限操作，false无权限，即受限用户
        	// optType: 'customService'
        	userExp: ['arrow']
        }
	}
//	console.log('call auth');
	return rel;
};
	
Requester.debug.GET_nikon_messagenotify = function(){
	return {
		status: 200
	}
};
	
	
/**
 * 获取账户概况数据用于Flash图表
 * @param {Object} level
 * @param {Object} param
 */
Requester.debug.GET_mars_flashdata = function(level, param) {
	function _dateToString(data, pattern){
	    function dl(data, format){
	        format = format.length;
	        data = data || 0;
	        var d = String(Math.pow(10, format) + data);
	        return format == 1 ? data : d.substr(d.length - format);
	    }
	    return pattern.replace(/([YMDhsmw])\1*/g, function(format){
	        switch (format.charAt()) {
	            case 'Y':
	                return dl(data.getFullYear(), format);
	            case 'M':
	                return dl(data.getMonth() + 1, format);
	            case 'D':
	                return dl(data.getDate(), format);
	            case 'w':
	                return data.getDay();
	            case 'h':
	                return dl(data.getHours(), format);
	            case 'm':
	                return dl(data.getMinutes(), format);
	            case 's':
	                return dl(data.getSeconds(), format);
	        }
	    });
	}
	
	var rel = new Requester.debug.returnTpl();
	var starttime = baidu.date.parse(typeof param.starttime != 'undefined' ? param.starttime : "2010-12-01");
	var endtime = baidu.date.parse(typeof param.endtime != 'undefined' ? param.endtime : "2010-12-25");
	var gap = (endtime - starttime) / 86400000;
	var relList = [];
	if (gap != 0) {
		// 分日
		for (var i = 0; i <= gap; i++) {
			if (true || Math.random()>0.7) {
				//模拟数据不完整
				relList.push({
					reporttime: _dateToString(starttime, "YYYY-MM-DD"),
					clks: Math.round(Math.random(1) * 1000),
					shows: Math.round(Math.random(1) * 100000),
					paysum: Math.round(Math.random(1) * 100),
					showpay: Math.round(Math.random(1) * 1000),
					trans: Math.round(Math.random(1) * 30),
					clkrate: 0.0022349872873582735,//Math.round(Math.random(1)),
					avgprice: Math.round(Math.random(1) * 400) / 100
				});
			}
			starttime.setDate(starttime.getDate() + 1);
		}
	} else {
		// 分时
		for (var i = 0; i < 24; i++) {
			if (Math.random()>0.7) {
				//模拟数据不完整
				relList.push({
					reporttime: i < 10 ? '0' + i : i + '',
					clks: Math.round(Math.random(1) * 1000),
					shows: Math.round(Math.random(1) * 100000),
					paysum: Math.round(Math.random(1) * 100),
					showpay: Math.round(Math.random(1) * 1000),
					trans: Math.round(Math.random(1) * 30),
					clkrate: Math.round(Math.random(1)),
					avgprice: Math.round(Math.random(1) * 400) / 100
				});
			}
		}
	}
	rel.data.listData = relList;
	// 模拟数据请求延迟
	rel.timeout = 1000;
	return rel;
};
	
/**
 * 修改账户
 */
Requester.debug.MOD_account = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.status = 200;
	rel.error = {
		'333333' : {
			weekbudget : {
				code : 319, // 316周预算过小，317周预算过大，318周预算低于上周消费，319周预算降低
				detail : null,
				idx : 0,
				message : "[0.0,7,142.86]"
			}
		}
	}
	if ('undefined' != typeof param.items.wbudget) {
		rel.status = 200;
	}
	if (param.alertLevel == 1) {
		rel.error = {};
		rel.status = 200;
	}

	rel.data = {}
	return rel;

};
/**
 * 账户预算分析
 */
Requester.debug.AO_account_bdana = function() {
	var rel = new Requester.debug.returnTpl();

	rel.data = [
			3, // status
			20, // advice
			700, // lostclick
			["67.5|55.11", "66.5|55.11", "67|55.11", "72|58.32", "75.5|60.43",
					"97|70.97", "116|77.96", "116.8|78.15", "120.3|78.57",
					"173.1|78.57", "120.3|78.57"]];
	return rel;
};
/**
 * 用户层级预算详情
 */
Requester.debug.GET_ao_userbudgetdetail = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	/*
	 * rel.data = { "timestamp":0, "listData":[ { "daybgtdata":null,
	 * "weekbgtdata":{ "weekbgtvalue":10000.0, "wbdvalue":{ "tiptype":null,
	 * "incclicks":null, "barlist":[ {"type":2,"data":60.0},
	 * {"type":2,"data":30.0}, {"type":2,"data":40.0}, {"type":1,"data":30.0},
	 * {"type":1,"data":30.0}, {"type":1,"data":30.0}, {"type":1,"data":30.0} ] },
	 * "weekanalyze":null, "istargetuser":0 }, "bgttype":2 } ] }
	 */
	rel.data = {
		totalnum : 100,
		returnnum : 100,
		timestamp : '20110101010',
		listData : [{ // 用来存储账户层级预算数据信息
			bgttype : 1, // 预算类型
			daybgtdata : { // 存储日预算基础数据与分析数据
				daybgtvalue : 777.77, // 值
				dayanalyze : { // 日预算分析数据
					tip : 4,
					// 0 不提示 hasproblem = 0, priority = 0
					// 1 预算合理 hasproblem = 0, priority = 0
					// 2 日预算风险 hasproblem = 1, priority = 1
					// 3 需提供日预算建议 hasproblem = 1 , priority = 2
					// 4 需提供周预算建议 hasproblem = 1 , priority = 2
					// 5 需要恢复 某日的预算

					suggestbudget : 1000,// 建议预算点
					maxbudget : 999,
					lostclicks : 100,// 损失点击数
                    retripercent: 23, // 可挽回点击数,为0时候不展现额外的话术,升级预算话术新增 2013.3.19 by Huiyao
					startpoint : [0, 0], // 存放起点
					endpoint : [1000, 1000], // 存放终点
					budgetpoint : [50, 50], // 预算点
					keypoints : [ // 存放七个关键点
						[767.5, 55.11], [772, 58.32], [775.5, 60.43], [797, 70.97],
						[816, 77.96], [816, 77.96], [873.1, 78.57]
					],
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

	// rel.data =
	// {"timestamp":1315929158000,"listData":[{"daybgtdata":null,"weekbgtdata":{"weekbgtvalue":700000.0,"wbdvalue":{"tiptype":2,"incclicks":0,"barlist":[{"type":1,"data":25000.0},{"type":1,"data":112500.0},{"type":1,"data":112500.0},{"type":1,"data":112500.0},{"type":1,"data":112500.0},{"type":1,"data":112500.0},{"type":1,"data":112500.0}]},"weekanalyze":{"endpoint":[2.58,1.25],"words":null,"tip":4,"show_encourage":null,"model_num":null,"maxbudget":null,"suggestbudget":1222.0,"lostclicks":12,"startpoint":[1.0,0.75],"budgetpoint":[1.79,1.25],"keypoints":[[1.57,1.18],[1.61,1.2],[1.64,1.22],[1.64,1.22],[1.72,1.24],[1.72,1.24],[1.79,1.25]],"wordids":null,"incitermsg":null},"istargetuser":0},"bgttype":2}],"totalnum":0,"returnnum":0,"signature":"902720026650075993","aostatus":2}
	// rel.data =
	// {"timestamp":0,"listData":[{"daybgtdata":{"daybgtvalue":1111.0,"dayanalyze":null},"weekbgtdata":{"weekbgtvalue":400.0,"wbdvalue":{"tiptype":0,"incclicks":0,"barlist":[{"type":2,"data":30.0},{"type":2,"data":30.0},{"type":2,"data":40.0},{"type":1,"data":30.0},{"type":1,"data":30.0},{"type":1,"data":30.0},{"type":1,"data":30.0}]},"weekanalyze":null,"istargetuser":0},"bgttype":1}],"totalnum":0,"returnnum":0,"signature":null,"aostatus":2};
	/*
	 * rel.data = { "timestamp":1317031557000, "listData":[{ "daybgtdata":null,
	 * "weekbgtdata":{ weekbgtvalue : 8888.88, //周预算值 wbdvalue : null,
	 * weekanalyze : { //周预算分析数据，格式与dayanalyze相同，只填写周预算分析的内容。此处略 tip : null, //0
	 * 不提示 hasproblem = 0, priority = 0 //1 预算合理 hasproblem = 0, priority = 0
	 * //2 日预算风险 hasproblem = 1, priority = 1 //3 需提供日预算建议 hasproblem = 1 ,
	 * priority = 2 //4 需提供周预算建议 hasproblem = 1 , priority = 2 suggestbudget :
	 * null,//建议预算点 lostclicks : null,//损失点击数 startpoint : null, //存放起点 endpoint :
	 * null, //存放终点 budgetpoint : null, //预算点 keypoints : null, incitermsg :
	 * null } }, "bgttype":2 }], "totalnum":0, "returnnum":55,
	 * "signature":"7776630977594186406", "aostatus":0 };
	 */

	return rel;
};

// 精确匹配扩展（地域词扩展）数据
Requester.debug.GET_rngwext_status = function(level, param) {
	// 获取状态
	var rel = new Requester.debug.returnTpl();

	// data为1表示开启，0表示未开启
	rel.data = 1;

	return rel;
};