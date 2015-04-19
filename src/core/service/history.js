/**
 * fbs.history
 * 历史操作记录查询
 */

fbs = fbs || {};
fbs.history = {};

/**
 * 获取某一天的历史操作记录概况
 * @param {Object} param {
 * 		"date": yyyy-mm-dd
 * 		"callback": Function
 * 		"onSuccess": Function
 * 		"onFail": Function
 * }
 * @return {Obejct} historyList {
 * 		"OpCode": OpNumber,
 * 		"OpCode": OpNumber
 * }
 * @author zuming@baidu.com
 */
fbs.history.getDailyOverView = function(param) {
	// 有空加点验证，日期是必需要的
	if (typeof param.date == 'undefined') {
		// 回头在interface那里搞个统一的参数抛异常
		return false
	}
	param.path = "GET/history/dailylog";
	fbs.request.send(param);
}


/**
 * 获取历史操作记录
 * @param {Object} param {
 * 		qtype: 查询时间类型，0 过去一周, 1 过去两周, 2 过去一个月, 3 过去三个月 ,4 自定义
 *		starttime: “YYYY-MM-DD”,
 *		endtime: “YYYY-MM-DD”,
 *		optContents: {
 * 		  useracct: [1, 2, 3]
 *		  planinfo: []
 *		  unitinfo: [1, 2]
 *		  wordinfo: []
 *		  ideainfo: []
 *		},
 *		optMaterials : []
 * }
 * @return {Obejct} historyList {
 * 		time: “YYYY-MM-DD hh:mm:ss”,
 * 		optname: “String”,
 * 		optcontentid: Int
 * 		opttypeid: Int
 * 		optlevel: “useracct” 见附录3
 * 		newvalue: “”,
 * 		oldvalue: “”,
 * 		optmaterial: “”,
 * 		planname: “”,
 * 		unitname: “”
 * }
 * @author linzhifneg@baidu.com
 */
fbs.history.getHistory = fbs.interFace({
	path: "GET/history",
	necessaryParam: {
		qtype: 0|1|2|3|4, 
		starttime: "YYYY-MM-DD",
		endtime: "YYYY-MM-DD",
		optContents: "23,32,32",
		optMaterials : {}
	}
});