/**
 * 实时报告
 * 
 * @author tongyao@baidu.com
 */
Requester.debug.GET_mars_reportdata = function(level, param) {
	var rel = new Requester.debug.returnTpl();

	var sum = [{
				clks : 1e10,
				paysum : 1e10,
				shows : 1e10,
				clkrate : 0.11111111,
				trans : 0.0111111111,
				phonetrans : 10.111111,
				phonepay : 11.11111111111,
				avgprice : 1.511111111
			}, {
				clks : 20.0,
				paysum : 20.0,
				shows : 20,
				clkrate : 0.1,
				trans : 20.111,
				phonetrans : 10,
				phonepay : 11,
				avgprice : 1.5
			}, {
				clks : 20.0,
				paysum : 20.0,
				shows : 20,
				clkrate : 0.1,
				trans : 20.222,
				phonetrans : 10,
				phonepay : 11,
				avgprice : 1.5
			}];

	var data = [], reportParam = param.reportinfo, date, oneDay = 24 * 3600
			* 1000, oneWeek = 7 * oneDay,

	getMonday = function(date) {
		var weekday = date.getDay();
		if (weekday == 1) {
			return date;
		}

		if (weekday == 0) { // 将周日处理为7
			weekday = 7;
		}
		date.setDate(date.getDate() - (weekday - 1));
		return date;
	}, getSunday = function(date) {
		var weekday = date.getDay();
		if (weekday == 0) {
			return date;
		}
		date.setDate(date.getDate() + 7 - weekday);
		return date;
	}, firstDayToWeek = function(firstDate) {
		return baidu.date.format(new Date(firstDate), 'yyyy-MM-dd')
				+ '至'
				+ baidu.date.format(getSunday(new Date(firstDate)),
						'yyyy-MM-dd');
	},
	// 返回每月1号
	getFirstDayOfMonth = function(anyDate) {
		anyDate.setDate(1);
		return anyDate;
	},
	// 返回一个月中的最后一天
	getLastDayOfMonth = function(anyDate) {
		var tmpDate = new Date(anyDate);

		tmpDate.setMonth(anyDate.getMonth() + 1);
		tmpDate.setDate(0);

		return tmpDate;
	}, firstDayToMonth = function(firstDate) {
		return baidu.date.format(new Date(firstDate), 'yyyy-MM-dd')
				+ '至'
				+ baidu.date.format(getLastDayOfMonth(new Date(firstDate)),
						'yyyy-MM-dd');
	};

	if (typeof reportParam.starttime == 'undefined') {
		reportParam.starttime = baidu.date.format(
				new Date(nirvana.env.SERVER_TIME * 1000), 'yyyy-MM-dd');
	}

	var requestStartTimeStamp = baidu.date.parse(reportParam.starttime) - 0;

	var max = 5000;

	requestStartTimeStamp += oneDay * 2; // 从用户请求的两个单位（日，周，月）后开始返回，验证填补数据

	if (reportParam.timedim == 4) { // 分周
		requestStartTimeStamp = getMonday(baidu.date
				.parse(reportParam.starttime))
				- 0;
		requestStartTimeStamp += oneWeek * 2; // 从用户请求的两个单位（日，周，月）后开始返回，验证填补数据
	} else if (reportParam.timedim == 3) { // 分月
		requestStartTimeStamp = getFirstDayOfMonth(baidu.date
				.parse(reportParam.starttime));
		requestStartTimeStamp.setMonth(requestStartTimeStamp.getMonth() + 2);// 从用户请求的两个单位（日，周，月）后开始返回，验证填补数据
		requestStartTimeStamp = requestStartTimeStamp - 0;
	}

	reportParam.timedim = reportParam.timedim || 5;

	for (var i = 1; i < max; i = i + 2) { // 制造出中间一个空隙，验证flash数据的补全
		if (reportParam.timedim == 5) { // 分日
			date = baidu.date.format(new Date(requestStartTimeStamp + i
							* oneDay), 'yyyy-MM-dd')
		} else if (reportParam.timedim == 4) { // 分周
			date = firstDayToWeek(requestStartTimeStamp + i * oneWeek);
		} else if (reportParam.timedim == 3) { // 分月
			requestStartTimeStamp = new Date(requestStartTimeStamp);
			requestStartTimeStamp
					.setMonth(requestStartTimeStamp.getMonth() + 5);
			date = firstDayToMonth(requestStartTimeStamp - 0);
		} else if (reportParam.timedim == 8) { // 不分日
			date = reportParam.starttime + '至' + reportParam.endtime;
		}

		data[data.length] = {
			// date : '2011-01-01',
			// date : '2011-01-03至2011-01-09',
			// date : '2010-03-01至2010-03-31',
			date : date,
			useracct : {
				id : i,
				name : "涅槃账户_<button>\\'^\"%(*&" + i
			},
			planinfo : {
				id : 100 + i,
				// name : '已删除'
				name : "涅槃计划_<button>\\'^\"%(*&" + i
			},
			unitinfo : {
				id : 10 + i,
				name : "涅槃单元_<button>\\'^\"%(*&" + i
			},
			word: {
				id : 1000 + i,
				name:"关键词" + i
			},
			creativeinfo:[{
				name:"子链一",
				clks:0,
				paysum:0,
				shows:0,
				clkrate:0, 
				avgprice:0, 
				trans:0
			},{
				name:"子链二",
				clks:0,
				paysum:0,
				shows:0,
				clkrate:0, 
				avgprice:0, 
				trans:0
			}],
			majorinfo:{
				name:"",
				clks:0,
				paysum:0,
				shows:0,
				clkrate:0, 
				avgprice:0, 
				trans:0
			},
			prov : {
				id : 1,
				name : '北京'
			},
			phonetrans : i + 10,
			phonepay : i + 20

		}
	}

	var col = ['date', 'useracct', 'planinfo',
			'unitinfo','word',
			'creativeinfo',
			// 'word',
			// 'ideainfo',
			'clks', 'paysum', 'shows',
		//	'phonetrans', 'phonepay', 'prov',
		 	'clkrate', 'avgprice', 'trans'
			];
	// data = [];

	rel.data = {
		SUM : sum,
		DATA : data,
		COL : col,
		REPORTNAME : '2011-01-01至2011-02-02的报告名称'
	};

	// var code = prompt('errorCode', '0');

	rel.errorCode = {
	// code : code
	};

	return rel;
};

/**
 * 获得定制报告参数
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.GET_mars_reportinfo_detail = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = {};
	rel.data.reportinfo = {
		reportid : 0, // 报告id，在实时报告中都为0
		starttime : '', // yyyy-MM-dd 当有相对时间时也要填写（用于显示在结果部分的日历中）
		endtime : '', // yyyy-MM-dd 当有相对时间时也要填写（用于显示在结果部分的日历中）
		isrelativetime : 1, // 是否相对时间，默认相对时间(最近七天)
		relativetime : 15, // 默认最近七天

		mtldim : 2,

		idset : [], // 选定层级对应物料的id集合

		mtllevel : 2,

		reporttype : 10, // 一般来说根据mtllevel而定，仅在用户勾选“地域指标”时切换为3-分地域报告

		platform : 0,

		dataitem : 'shows, clks, paysum',

		reporttag : 0,

		reportcycle : 2,

		timedim : 5, // 除非用户在已经生成的报告中切换，否则均默认分日

		ismail : 0, // 是否发送邮件
		mailaddr : '', // 邮箱地址

		sortlist : 'time', // 初始排序字段

		reportname : '后台返回的报告名称', // 报告名称

		userid : nirvana.env.USER_ID,
		moduid : nirvana.env.OPT_ID,

		/**
		 * 报告层级
		 * 
		 * 用户级别 100 一线客服级别 200 客服管理员级别 300
		 */
		reportlevel : 100
	};

	rel.data.mtlinfos = [{
				id : 100,
				name : '物料'
			}, {
				id : 100,
				name : '物料'
			}];

	rel.errorCode = {};

	return rel;
};

/**
 * 定制报告总计
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.GET_mars_reportfile_abstract = function(level, param) {
	var rel = new Requester.debug.returnTpl(), reportParam = {
		reportinfo : {

		}
	};

	// 使用实时报告的接口生成
	var data = this.GET_mars_reportdata(level, reportParam);

	// 将所有的clkrate加上百分号
	for (var i = 0, l = data.data['SUM'].length; i < l; i++) {
		data.data['SUM'][i]['clkrate'] = data.data['SUM'][i]['clkrate'] * 100
				+ '%';
	}

	rel.data = {
		sum : data.data['SUM'],
		cols : data.data['COL'],
		rownum : 100
	}
	rel.errorCode = {};

	return rel;
};

/**
 * 定制报告图表
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.GET_mars_reportfile_flashdata = function(level, param) {
	var rel = new Requester.debug.returnTpl(), param = {
		reportinfo : {
			dataitem : param.dataitemIdx
		}
	};

	// 使用实时报告的接口生成
	var data = this.GET_mars_reportdata(level, param);
	rel.data = data.data['DATA'];

	rel.errorCode = {};

	return rel;
};

/**
 * 定制报告数据
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.GET_mars_reportfile_data = function(level, param) {
	var rel = new Requester.debug.returnTpl(), reportParam = {
		reportinfo : {

		}
	};

	// 使用实时报告的接口生成
	var data = this.GET_mars_reportdata(level, reportParam);
	rel.data = data.data['DATA'];
	// 取翻页

	var offset = (param.curPage - 1) * param.pageSize;
	rel.data = rel.data.slice(offset, offset + param.pageSize);

	// 将所有的clkrate加上百分号
	for (var i = 0, l = rel.data.length; i < l; i++) {
		rel.data[i]['clkrate'] = rel.data[i]['clkrate'] * 100 + '%';
	}

	rel.errorCode = {};

	return rel;
};

/**
 * 获取最新三个循环报告
 */
Requester.debug.GET_mars_reportfile_cycle = function(level, param) {
	var rel = new Requester.debug.returnTpl(), data = [];

	for (var i = 0; i < 3; i++) {
		data.push({
					fileid : '1239' + i,
					filename : '2010-09-01至2010-09-30 关报告名称<button>&@^%#$_' + i,
					isdel : (i % 2 == 1) ? 0 : 1
				});
	}

	rel.data = data;
	rel.errorCode = {};

	return rel;
};
/**
 * 获取我的报告列表
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.GET_mars_reportinfos = function(level, param) {
	var rel = new Requester.debug.returnTpl(), i, max = 20, data = [];

	for (i = 0; i < max; i++) {
		data.push({
					reportid : i,
					fileid : 1,
					reportname : '报告名称<button>&@^%#$_' + i,
					reporttag : (i % 2 + 1), // 0 即时待发送 1 循环报告 2 预约报告
					reportstatus : i % 6, // 0 未生成 1 生成中 2 已生成 3 生成异常
					/**
					 * 如果是绝对时间：yyyy-MM-dd 至 yyyy-MM-dd 如果是相对时间：每周/每天/每月初
					 */
					timerange : (i % 2 == 1) ? '每天' : 'yyyy-MM-dd至yyyy-MM-dd',
					reportlevel : (i % 3 + 1) * 100, // 查看权限 100 用户报告 200
					// 推广顾问报告 300 管理员报告
					createtime : 'yyyy-MM-dd HH:mm:ss'
				});
	}

	rel.data = data;
	rel.errorCode = {};

	return rel;
};

/**
 * 修改报告名称
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.MOD_mars_reportinfo_name = function(level, param) {
	var rel = new Requester.debug.returnTpl(), data = false;

	if (Math.random() > 0.5) {
		data = true;
	}

	rel.data = data;
	rel.errorCode = {};

	return rel;
};

/**
 * 删除报告
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.DEL_mars_reportinfo = function(level, param) {
	var rel = new Requester.debug.returnTpl(), data = false;

	if (Math.random() > 0.5) {
		data = true;
	}

	rel.data = data;
	rel.errorCode = {};

	return rel;
};

/**
 * 删除报告文件
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.DEL_mars_reportfile = function(level, param) {
	return this.DEL_mars_reportinfo(level, param);
};

/**
 * 修改循环报告参数
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.MOD_mars_reportinfo_cycle = function(level, param) {
	var rel = new Requester.debug.returnTpl();

	rel.data = '6354';
	rel.errorCode = {};

	return rel;
};

/**
 * 修改循环报告参数
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.POST_mars_sendmail = function(level, param) {
	return this.DEL_mars_reportinfo(level, param);
};

/**
 * 保存报告参数
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.ADD_mars_reportinfo = function(level, param) {
	return this.DEL_mars_reportinfo(level, param);
},

/**
 * 获取报告文件下载地址
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.GET_mars_downloadpath = function(level, param) {
	var rel = new Requester.debug.returnTpl();

	rel.data = 'http://www.baidu.com/';

	return rel;
};
/**
 * 获取实时报告下载地址
 * @param {Object} level
 * @param {Object} param
 */
Requester.debug.GET_mars_reportfile = function(level, param) {
	return Requester.debug.GET_report_downloadpath(level, param);
};