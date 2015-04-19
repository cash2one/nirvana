/**
 * fbs.report
 * 数据分析相关接口
 * @author tongyao@baidu.com
 */

fbs = fbs || {};

fbs.report = {};

/**
 * 获取实时报告
 * @author tongyao@baidu.com
 */
/*fbs.report.getInstantReport = fbs.interFace({
	path: fbs.config.path.GET_INSTANT_REPORT,
	
	necessaryParam: {
		reportinfo: []
	},

	parameterAdapter: function(param) {
		var request = baidu.object.clone(param);
		
		request.reportinfo.idset = param.reportinfo.idset.join(',');
		request.reportinfo.dataitem = param.reportinfo.dataitem.join(',');
		request.maxRecordNum = 5000; //暂时都写5000
		return request;
	}
});*/
/**
 * 获取实时报告新path
 */
fbs.report.getMarsReport = fbs.requester({
	path: "GET/mars/reportdata",
	
	necessaryParam: {
		reportinfo: []
	},

	parameterAdapter: function(param) {
		var request = baidu.object.clone(param);
		
		request.reportinfo.idset = param.reportinfo.idset.join(',');
		request.reportinfo.dataitem = param.reportinfo.dataitem.join(',');
		request.maxRecordNum = 5000; //暂时都写5000
		return request;
	}
});
/**
 * 获取我的报告列表
 * @param {Object} param {}
 * @author wanghuijun@baidu.com
 */
fbs.report.getReportInfos = fbs.interFace({
	path : fbs.config.path.GET_REPORT_INFOS,
	
	necessaryParam : {}
});

/**
 * 修改报告名称
 * @param {Object} param {
 *     reportid: 12312, //报告ID
 *     reportname: '报告名称', //修改后报告名称
 * }
 * @author wanghuijun@baidu.com
 */
fbs.report.modName = fbs.interFace({
	path : fbs.config.path.MOD_REPORT_NAME,
	
	necessaryParam: {
		reportid: 12312, //报告ID
		reportname: '报告名称' //修改后报告名称
	},
	
	validate: fbs.validate.reportName
});

/**
 * 删除报告
 * @param {Object} param {
 *     reportid: 12312 //报告ID
 * }
 * @author wanghuijun@baidu.com
 */
fbs.report.delInfo = fbs.interFace({
	path : fbs.config.path.DEL_REPORT_INFO,
	
	necessaryParam: {
		reportid: 12312 //报告ID
	}

});

/**
 * 删除报告文件
 * @param {Object} param {
 *     fileid: 12312 //报告ID
 * }
 * @author wanghuijun@baidu.com
 */
fbs.report.delFile = fbs.interFace({
	path : fbs.config.path.DEL_REPORT_FILE,
	
	necessaryParam: {
		fileid: 12312 //报告文件ID
	}

});

/**
 * 获取定制报告参数
 * @author tongyao@baidu.com
 */
fbs.report.getMyReportParams = fbs.interFace({
	path: fbs.config.path.GET_MYREPORT_PARAMS,
	
	necessaryParam: {
		reportid: '123'
	}
});

/**
 * 获取定制报告总计
 * @author tongyao@baidu.com
 */
fbs.report.getMyReportSum = fbs.interFace({
	path: fbs.config.path.GET_MYREPORT_SUM,
	
	necessaryParam: {
		fileid: '123'
	}
});


/**
 * 获取定制报告图表数据
 * @author tongyao@baidu.com
 */
fbs.report.getMyReportFlashData = fbs.interFace({
	path: fbs.config.path.GET_MYREPORT_FLASHDATA,
	
	necessaryParam: {
		fileid: '123',
		dataitems : ['clks', 'clkrate', 'shows']
	}
});


/**
 * 分页获取定制报告数据
 * @author tongyao@baidu.com
 */
fbs.report.getMyReportData = fbs.interFace({
	path: fbs.config.path.GET_MYREPORT_DATA,
	
	necessaryParam: {
		fileid: '123',
		curPage: 1, //当前页
 		pageSize:50 //每页大小
	}
});

/**
 * 获取最近的三份循环报告
 * @author wanghuijun@baidu.com
 */
fbs.report.getCycleFile = fbs.interFace({
	path: fbs.config.path.GET_REPORT_CYCLEFILE,
	
	necessaryParam: {
		reportid: '123'
	}
});

/**
 * 保存报告信息
 * @author wanghuijun@baidu.com
 */
fbs.report.addReportInfo = fbs.interFace({
	path: fbs.config.path.ADD_REPORT_INFO,
	
	necessaryParam: {
		reportinfo: []
	},

	parameterAdapter: function(param) {
		var request = baidu.object.clone(param);
		
		request.reportinfo.idset = param.reportinfo.idset.join(',');
		request.reportinfo.dataitem = param.reportinfo.dataitem.join(',');
		request.maxRecordNum = 5000; //暂时都写5000
		return request;
	},
	
	validate: fbs.validate.addReportInfo
});

/**
 * 修改循环报告参数
 * @author wanghuijun@baidu.com
 */
fbs.report.modCycleInfo = fbs.interFace({
	path: fbs.config.path.MOD_REPORT_CYCLEINFO,
	
	necessaryParam: {
		reportid: '123', //报告ID
		reportcycle: 1, //频率。1每天 2每周 3每月初
		reportlevel: 100 //查看权限。100客户 200推广顾问 300管理员
        /**
         * 这个不是必需参数，不发送时，不需要传
         * sendReportInfo: {
         * filetype: 0, //文件类型。 0-csv 1-txt
         * mailaddr: 'liuzeyin@baidu.com,zuming@baidu.com' //邮箱地址
         * }
         */
	},
	
	validate: fbs.validate.sendReport
});

/**
 * 发送报告
 * @author wanghuijun@baidu.com
 */
fbs.report.postMail = fbs.interFace({
	path: fbs.config.path.POST_REPORT_MAIL,
	
	necessaryParam: {
		fileid: '123',
		sendReportInfo: {
			filetype: 0, //文件类型。 0-csv 1-txt
			mailaddr: 'liuzeyin@baidu.com,zuming@baidu.com' //邮箱地址
		}
	},
	
	validate: fbs.validate.sendReport
});

/**
 * 获取报告文件下载地址
 * @author wanghuijun@baidu.com
 */
fbs.report.getDownloadPath = fbs.interFace({
	path: fbs.config.path.GET_REPORT_DOWNLOADPATH,
	
	necessaryParam: {
		fileid: '123',
		filetype: 0
	}
});
/**
 * 获取实时报告文件下载地址
 * @author zhouyu01@baidu.com
 */
fbs.report.downloadMarsData = fbs.requester({
	path: "GET/mars/reportfile",
	noloading: true,
	necessaryParam: {
		reportinfo: {},
		filetype: 0
	},
	
	parameterAdapter: function(param) {
		var request = baidu.object.clone(param);
		
		request.reportinfo.idset = param.reportinfo.idset.join(',');
		request.reportinfo.dataitem = param.reportinfo.dataitem.join(',');
		request.reportinfo.filetype = request.filetype;
		delete request.filetype;
		return request;
	}
});

/**
 * 是否显示提示信息
 * @author huanghainan@baidu.com
 */
fbs.report.isPrompt = fbs.interFace({
	path: fbs.config.path.IS_REPORT_PROMPT,
	
	necessaryParam: {
		//optid: 313 //操作人id
	}
});

/**
 * 设置不再提示
 * @author huanghainan@baidu.com
 */
fbs.report.setNoPrompt = fbs.interFace({
	path: fbs.config.path.SET_REPORT_NO_PROMPT,
	
	necessaryParam: {
	//	optid: 313 //操作人id
	}
});
