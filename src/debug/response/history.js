
/**
 * 获取某一天的历史操作记录，用于首页Flash图表
 * @param {Object} level
 * @param {Object} param
 */
Requester.debug.GET_history_dailylog = function(level, param) {
	var rel = new Requester.debug.returnTpl(),
	    temp = 0;
	rel.data = {
		date: param.date
	}
	// 周预算设置情况，value为最后一 次设置的周预算额度，-1表示取消周预算设置
	switch(Math.ceil(Math.random(1)*10) % 3 + ''){
		case '0':
		    rel.data['weekBudgetStat'] = -1;
			rel.data['budgetStat'] = Math.ceil(Math.random(1)*10);
			rel.data['regionStat'] = Math.ceil(Math.random(1)*10);
			break;
		case '1':
		    rel.data['weekBudgetStat'] = Math.ceil(Math.random(1)*10);
			rel.data['regionStat'] = -1;
			break;
		case '2':
			rel.data['weekBudgetStat'] = Math.ceil(Math.random(1)*10)
			rel.data['budgetStat'] = -1;
			break;
	}
	temp = Math.ceil(Math.random(1)*10);
	if (temp > 4){
		rel.data['newPlanCnt'] = temp;
	}
	temp = Math.ceil(Math.random(1)*10);
	if (temp > 4){
		rel.data['delPlanCnt'] = temp;
	}
	temp = Math.ceil(Math.random(1)*10);
	if (temp > 4){
		rel.data['startPlanCnt'] = temp;
	}
	temp = Math.ceil(Math.random(1)*10);
	if (temp > 4){
		rel.data['stopPlanCnt'] = temp;
	}
	// 模拟数据请求延迟
	rel.timeout = 1000;
	return rel;
};
	
/**
 * 获取历史操作记录，用于工具历史操作记录
 */
Requester.debug.GET_history = function(level, param) {
	var rel = new Requester.debug.returnTpl(),
	/*
	contentId = [
					1,//每日预算
					2,//推广地域
					3,//IP排除
					5,//是否参加网盟推广
					6,//时段暂停推广
					8,//否定关键词
					10,//暂停/启用推广
					12,//出价
					13,//添加关键词
					16,//展现方式
					17,//激活关键词
					18,//删除关键词
					19,//删除推广单元
					20,//删除推广计划
					21,//推广单元名称
					22,//新建计划
					23,//新建单元
					24,//新建创意
					25,//关键词URL
					26,//编辑创意
					27,//关键词匹配方式
					28,//激活时长设置
					29,//删除创意
					30,//网盟推广出价
					32,//关键词转移
					34,//精确否定关键词
					41,//每日预算
					120,//修改关键词出价
					121,//修改推广单元出价
					170,//激活创意
				],
	opttypeid = [
					1,//设置
					2,//增加
					3,//删除
					4,//修改
					5,//暂停
					6,//启用
					7,//重命名
					8,//激活
					10,//系统激活
					11,//转移
				],
	optlevel = [
		3,//useracct
		2,//planinfo
		1,//unitinfo
		4,//wordinfo
		5,//ideainfo
	]
	*/
	data = [];

	var hc = tool.historyCtrl, index = 0;
	// console.log(param);
	for (var i in hc.optContent) {
		for (var j in hc.optContent[i].children) {
			if (j != '1,41,42,43,44') {
				data[index] = {
					opttime : "2011-01-" + index + " 00:00:00",
					optname : "user" + index,
					optcontentid : j,
					opttypeid : index % 6,
					optlevel : i,
					newvalue : index + 1 + '乐萨德飞',
					oldvalue : '',
					levelkey : '"不知"阿是是否<a href="#">啊不</a>斯&lt;知&gt;，快<button>圣诞</button>节<a>发撒</a>旦法，阿萨德飞了卡斯蒂芬，阿萨德飞拉撒旦法撒的发道"'
							+ index % 5,
					optname : "kener",
					planname : "某个计划",
					unitname : "某个单元"
				};
				index++;
			} else {
				// 周预算
				data[index] = {
					opttime : "2011-02-" + index + " 00:00:00",
					optname : "user" + index,
					optcontentid : 41,
					opttypeid : index % 6,
					optlevel : i,
					newvalue : index,
					oldvalue : '',
					levelkey : 'sdf' + index % 5,
					optname : "kener",
					planname : "某个计划",
					unitname : "某个单元"
				};
				index++;
				data[index] = {
					opttime : "2011-02-" + index + " 00:00:00",
					optname : "user" + index,
					optcontentid : 41,
					opttypeid : index % 6,
					optlevel : i,
					newvalue : '',
					oldvalue : index,
					levelkey : 'sdf' + index % 5,
					optname : "kener",
					planname : "某个计划",
					unitname : "某个单元"
				};
				index++;
				data[index] = {
					opttime : "2011-02-" + index + " 00:00:00",
					optname : "user" + index,
					optcontentid : 41,
					opttypeid : index % 6,
					optlevel : i,
					newvalue : index,
					oldvalue : index,
					levelkey : 'sdf' + index % 5,
					optname : "kener",
					planname : "某个计划",
					unitname : "某个单元"
				};
				index++;
				data[index] = {
					opttime : "2011-02-" + index + " 00:00:00",
					optname : "user" + index,
					optcontentid : 42,
					opttypeid : index % 6,
					optlevel : i,
					newvalue : index,
					oldvalue : '',
					levelkey : 'sdf' + index % 5,
					optname : "kener",
					planname : "某个计划",
					unitname : "某个单元"
				};
				index++;
				data[index] = {
					opttime : "2011-02-" + index + " 00:00:00",
					optname : "user" + index,
					optcontentid : 42,
					opttypeid : index % 6,
					optlevel : i,
					newvalue : '',
					oldvalue : index,
					levelkey : 'sdf' + index % 5,
					optname : "kener",
					planname : "某个计划",
					unitname : "某个单元"
				};
				index++;
				data[index] = {
					opttime : "2011-02-" + index + " 00:00:00",
					optname : "user" + index,
					optcontentid : 42,
					opttypeid : index % 6,
					optlevel : i,
					newvalue : index,
					oldvalue : index,
					levelkey : 'sdf' + index % 5,
					optname : "kener",
					planname : "某个计划",
					unitname : "某个单元"
				};
				index++;
				data[index] = {
					opttime : "2011-02-" + index + " 00:00:00",
					optname : "user" + index,
					optcontentid : 43,
					opttypeid : index % 6,
					optlevel : i,
					newvalue : index,
					oldvalue : '',
					levelkey : 'sdf' + index % 5,
					optname : "kener",
					planname : "某个计划",
					unitname : "某个单元"
				};
				index++;
				data[index] = {
					opttime : "2011-02-" + index + " 00:00:00",
					optname : "user" + index,
					optcontentid : 43,
					opttypeid : index % 6,
					optlevel : i,
					newvalue : '',
					oldvalue : index,
					levelkey : 'sdf' + index % 5,
					optname : "kener",
					planname : "某个计划",
					unitname : "某个单元"
				};
				index++;
				data[index] = {
					opttime : "2011-02-" + index + " 00:00:00",
					optname : "user" + index,
					optcontentid : 43,
					opttypeid : index % 6,
					optlevel : i,
					newvalue : index,
					oldvalue : index,
					levelkey : 'sdf' + index % 5,
					optname : "kener",
					planname : "某个计划",
					unitname : "某个单元"
				};
				index++;
				data[index] = {
					opttime : "2011-02-" + index + " 00:00:00",
					optname : "user" + index,
					optcontentid : 44,
					opttypeid : index % 6,
					optlevel : i,
					newvalue : index,
					oldvalue : '',
					levelkey : 'sdf' + index % 5,
					optname : "kener",
					planname : "某个计划",
					unitname : "某个单元"
				};
				index++;
				data[index] = {
					opttime : "2011-02-" + index + " 00:00:00",
					optname : "user" + index,
					optcontentid : 44,
					opttypeid : index % 6,
					optlevel : i,
					newvalue : '',
					oldvalue : index,
					levelkey : 'sdf' + index % 5,
					optname : "kener",
					planname : "某个计划",
					unitname : "某个单元"
				};
				index++;
				data[index] = {
					opttime : "2011-02-" + index + " 00:00:00",
					optname : "user" + index,
					optcontentid : 44,
					opttypeid : index % 6,
					optlevel : i,
					newvalue : index,
					oldvalue : index,
					levelkey : 'sdf' + index % 5,
					optname : "kener",
					planname : "某个计划",
					unitname : "某个单元"
				};
				index++;
			}

		}
	}

	rel.data.listData = data;
	return rel;
};
