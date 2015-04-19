/**
 * 获取搜索词报告
 */
Requester.debug.GET_mars_queryreportdata = function(level, param) {
	var rel = new Requester.debug.returnTpl();

	var sum = {
		clks : 20.0,
		shows : 20.0
	};

	var data = [], reportParam = param.daySensitive, date, oneDay = 24 * 3600
			* 1000, oneWeek = 7 * oneDay,

	firstDayToWeek = function(firstDate) {
		return baidu.date.format(new Date(firstDate), 'yyyy-MM-dd')
				+ '至'
				+ baidu.date.format(new Date(firstDate + oneWeek - oneDay),
						'yyyy-MM-dd');
	};

	var requestStartTimeStamp = baidu.date.parse(param.starttime) - 0;

	var increment = 1, // 分日时默认为1
	max = 100;

	requestStartTimeStamp += increment * oneDay * 2; // 从用户请求的两个单位（日，周，月）后开始返回，验证填补数据

	for (var i = 1; i < max; i++) { // increment * 2制造出中间一个空隙，验证flash数据的补全
		date = baidu.date.format(new Date(requestStartTimeStamp + i * oneDay),
				'yyyy-MM-dd')

		data[data.length] = {
			date : date + '至' + date,
			useracct:{"name":"searchlab","id":630152},
			plan : {
				id : 1000,
				name : (i % 3 == 1)
						? "涅槃计划_<Button>\\'^\"%(*&"
						: "涅槃计划_<button>\\'^\"%(*&"
			},
			unit : {
				id : 1000,
				name : (i % 3 == 1)
						? "涅槃单元_<Button>\\'^\"%(*&"
						: "涅槃单元_<button>\\'^\"%(*&"
			},
			word : {
				id : 20 + i,
				name : "关键词_<button>\\'^\"%(*&" + i
			},
			idea : {
				title : '创意<input>\\^\"%(*&' + i,
				desc1 : "描{述一}_<button>\\'^\"%(*&" + i,
				desc2 : "描:{述二:}_<button>\\'^\"%(*&" + i,
				url : 'http://www.baidu.com'
			},
			query : {
				id : 20 + i,
				name : (i % 3 == 1) ? '-' : "搜索词_<button>\\'^\"%(*&" + i
			},
			clks : 10.0 + i,
			shows : 100.0 + i,
			engineid : (i % 3 == 2) ? '搜索推广' : 'google.cn',
			// 增加rngwmatch字段，判断是否启用地域词扩展功能
			ebrr : Math.random() > 0.5 ? 1 : 0
		}
	}

	rel.data = {
		SUM : sum,
		DATA : data
	};

	rel.errorCode = {
		"message" : "",
		"code" : 1801,
		"detail" : null,
		"idx" : 0
	};

	if (param.mtldim == 7) {
		rel.status = 400;
	}

	return rel;
};


/**
 * 获取文件下载地址
 */
Requester.debug.GET_mars_queryreportfile = function(level, param) {
	var rel = new Requester.debug.returnTpl();

	rel.data = 'http://www.baidu.com/';

	return rel;
};



/**
 * 获取搜索词状态
 */
Requester.debug.GET_mars_querywordstat = function(level, param) {
	var rel = new Requester.debug.returnTpl(), queryNumber = param.word.length, data = [];

	for (var i = 0; i < queryNumber; i++) {
		switch (i % 4) {
			case 0 :
				data.push({
							'seq' : i,
							'add' : [{
										'planname' : '涅槃计划_<button>\\^\"%(*&1'
												+ i,
										'unitname' : '涅槃单元_<button>\\^\"%(*&1'
												+ i,
										'wmatch' : '匹配模式'
									}, {
										'planname' : '涅槃计划_<button>\\^\"%(*&1'
												+ i,
										'unitname' : '涅槃单元_<button>\\^\"%(*&1'
												+ i,
										'wmatch' : '匹配模式'
									}, {
										'planname' : '涅槃计划_<button>\\^\"%(*&1'
												+ i,
										'unitname' : '涅槃单元_<button>\\^\"%(*&1'
												+ i,
										'wmatch' : '匹配模式'
									}],
							'neg' : [{
										'planname' : '涅槃计划_<button>\\^\"%(*&1'
												+ i,
										'unitname' : '涅槃单元_<button>\\^\"%(*&1'
												+ i,
										'wmatch' : '匹配模式'
									}, {
										'planname' : '涅槃计划_<button>\\^\"%(*&1'
												+ i,
										'unitname' : '涅槃单元_<button>\\^\"%(*&1'
												+ i,
										'wmatch' : '匹配模式'
									}, {
										'planname' : '涅槃计划_<button>\\^\"%(*&1'
												+ i,
										'unitname' : '涅槃单元_<button>\\^\"%(*&1'
												+ i,
										'wmatch' : '匹配模式'
									}]
						});
				break;
			case 1 :
				data.push({
							'seq' : i,
							'add' : [],
							'neg' : [{
										'planname' : '涅槃计划_<button>\\^\"%(*&1'
												+ i,
										'unitname' : '涅槃单元_<button>\\^\"%(*&1'
												+ i,
										'wmatch' : '匹配模式'
									}, {
										'planname' : '涅槃计划_<button>\\^\"%(*&1'
												+ i,
										'unitname' : '涅槃单元_<button>\\^\"%(*&1'
												+ i,
										'wmatch' : '匹配模式'
									}, {
										'planname' : '涅槃计划_<button>\\^\"%(*&1'
												+ i,
										'unitname' : '涅槃单元_<button>\\^\"%(*&1'
												+ i,
										'wmatch' : '匹配模式'
									}]
						});
				break;
			case 2 :
				data.push({
							'seq' : i,
							'add' : [{
										'planname' : '涅槃计划_<button>\\^\"%(*&1'
												+ i,
										'unitname' : '涅槃单元_<button>\\^\"%(*&1'
												+ i,
										'wmatch' : '匹配模式'
									}, {
										'planname' : '涅槃计划_<button>\\^\"%(*&1'
												+ i,
										'unitname' : '涅槃单元_<button>\\^\"%(*&1'
												+ i,
										'wmatch' : '匹配模式'
									}, {
										'planname' : '涅槃计划_<button>\\^\"%(*&1'
												+ i,
										'unitname' : '涅槃单元_<button>\\^\"%(*&1'
												+ i,
										'wmatch' : '匹配模式'
									}],
							'neg' : []
						});
				break;
			case 3 :
				data.push({
							'seq' : i,
							'add' : [],
							'neg' : []
						});
				break;
		}

	}
	rel.data = data;

	rel.errorCode = {};

	return rel;
};