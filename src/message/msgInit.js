/**
 * 消息中心总控室
 * @author zhouyu01
 */
var msgcenter = {
	logintime: "",//进入页面时间（包括登录和刷新）
	
	lasttime:{		//上次请求时间
		"summary": "",
		"iptlist": ""
	},
	intervalForSummary: 900000,//两次请求间隔时间，15分钟
	intervalForMIptList: 900000,//两次请求间隔时间，15分钟
	
	firstPopTime: 15000,//第一次弹出弹窗在页面加载完15s后
	
	taskForSummary: null,//定时任务，请求概要中间层数据
	
	taskForMIptList: null,//定时任务，请求最重要消息弹窗数据
	

	/**
	 * 消息初始化
	 */
	init: function(){
		//初始状态lasttime和logintime相同
		var logintime = baidu.date.format(
						new Date(nirvana.env.SERVER_TIME * 1000), 
						"yyyy-MM-dd HH:mm:ss"
						);
		this.logintime = logintime;
		this.lasttime.summary = logintime;
		this.lasttime.iptlist = logintime;
		//显示页头DOM元素
		baidu.removeClass("NavSubMsg", "hide");
		this.getInstantData(true);
	},
	

	/**
	 * 获取中间层和弹窗数据
	 * @param {Object} stat	是否第一次请求
	 */
	getInstantData: function(stat){
		var me = this;
		//请求概要中间层数据
		me.getSummary();
		//每隔一段时间，重新请求概要中间层数据
		me.startForSummary();
		if (stat) {//如果是第一次，则隔段时间再请求
			setTimeout(function(){
				//请求最重要消息弹窗数据
				me.getMostIptList();
				//每隔一段时间，重新请求最重要消息弹窗数据
				me.startForMIptList();
			}, me.firstPopTime);
		}
		else {
			//请求最重要消息弹窗数据
			me.getMostIptList();
			//每隔一段时间，重新请求最重要消息弹窗数据
			me.startForMIptList();
		}
	},

	
	/**
	 * 请求概要中间层数据
	 * 若失败，则不做任何处理
	 */
	getSummary: function(){
		fbs.message.getSummary({
			logintime:msgcenter.logintime,
			lasttime:msgcenter.lasttime.summary,
			onSuccess: msgcenter.summary.init
		});
	},
	
	/**
	 * 请求最重要消息弹窗数据
	 * 若失败，则不做任何处理
	 */
	getMostIptList: function(){
		fbs.message.getMIptList({
			logintime:msgcenter.logintime,
			lasttime:msgcenter.lasttime.iptlist,
			onSuccess: msgcenter.miptlist.init
		});
	},

	/**
	 * 每隔一段时间，重新请求概要中间层数据
	 */
	startForSummary: function(){
		var me = msgcenter;
		if (!me.taskForSummary) {
			me.taskForSummary = setInterval(me.getSummary, 
												me.intervalForSummary);
		}
	},
	
	/**
	 * 取消轮训概要中间层数据
	 */
	endForSummary: function(){
		clearInterval(msgcenter.taskForSummary);
		msgcenter.taskForSummary = null;
	},

	/**
	 * 每隔一段时间，重新请求最重要消息弹窗数据
	 */
	startForMIptList: function(){
		var me = msgcenter;
		if (!me.taskForMIptList) {
			me.taskForMIptList = setInterval(me.getMostIptList, 
												me.intervalForMIptList);
		}
	},
	
	/**
	 * 取消轮训最重要消息弹窗数据
	 */
	endForMIptList: function(){
		clearInterval(msgcenter.taskForMIptList);
		msgcenter.taskForMIptList = null;
	}
}
