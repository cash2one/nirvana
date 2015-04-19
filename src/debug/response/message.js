/**
 * 每条消息后台都会返回同样的结构，该方法用于返回消息列表数据
 * @param {Object} type	特定类型
 * @param {Object} cnt	消息数量
 * @author zhouyu
 */
Requester.debug.getMsgItem = function(type, cnt){
	var content = ["最新消息", "系统类消息", "消费类消息", "优化类消息", "最重要消息"];
	type = typeof(type) == "undefined" ? Math.floor(Math.random() * 100) % 5 : type;
	cnt = typeof(cnt) == "undefined" ? Math.floor(Math.random() * 100) % 5 : cnt;
	var time = ["2013-01-11 13:40:25","2013-01-10 13:40:25","2013-01-14 13:40:25","2013-01-09 13:40:25"];
	var msgcontent = [];
	for (var i = 0; i < cnt; i++) {
		msgcontent[i] = {
			msginfoid: 100 + i, //消息id
			status: Math.floor(Math.random() * 100) % 2, //0未读，1已读
			eventTime: time[Math.floor(Math.random() * 100)%4], //时间
			msgText: content[i] + i + "消息内容消息内容消息内容消息内容消息内容", //消息内容
			linkText: "clickhere" + i, //链接文字
			linkUrl: "http://www.baidu.com/?" + i, //如果没有链接的话，传""
			typeid: Math.floor(Math.random() * 100) //C2类型，用于前端判断链接文字打开浮层类型,值的范围待定
		}
	}
	return msgcontent;
};

/**
 * 获取重要消息概要中间层消息数据
 * @param {Object} level
 * @param {Object} param
 * @author zhouyu
 */
Requester.debug.GET_msg_msgsummary = function(level, param){
	var rel = new Requester.debug.returnTpl();
	//	rel.status = 500;
	rel.data = {
		allUnreadMsgCnt: 120, //所有未读消息条数
		btwnRequestUnreadMsgCnt: 23, //两次请求之间产生的非最高优先级消息数量
		lasttime: 21212, //本次请求的系统时间
		loginUnreadMsgCnt: Math.floor(Math.random() * 100), //新消息个数
		loginmsg: Requester.debug.getMsgItem(0),
		systemUnreadMsgCnt: 2, //系统类消息个数
		systemmsg: Requester.debug.getMsgItem(1),
		paysumUnreadMsgCnt: Math.floor(Math.random() * 100), //消费类消息个数
		paysummsg: Requester.debug.getMsgItem(2),
		optimizeUnreadMsgCnt: Math.floor(Math.random() * 100),//优化类消息个数
		optimizemsg: Requester.debug.getMsgItem(3)
	};
	
//	rel.data.loginUnreadMsgCnt = 0;
//	rel.data.systemUnreadMsgCnt = 0;
//	rel.data.paysumUnreadMsgCnt = 0;
//	rel.data.optimizeUnreadMsgCnt = 0;
	
	return rel;
};


/**
 * 获取最重要消息预览弹窗数据
 * @param {Object} level
 * @param {Object} param
 * @author zhouyu
 */
Requester.debug.GET_msg_miptlist = function(level, param){
	var rel = new Requester.debug.returnTpl();
	//	rel.status = 500;
	rel.data = {
		lasttime: 21212, //本次请求的系统时间
		msglist: Requester.debug.getMsgItem(4, 3)
	};
	return rel;
};


Requester.debug.GET_msg_msgcustom = function() {
	// return {
	// 	"status":200,
	// 	"data": {
	// 		options: [
	// 			{"typeid":1,"value":"500","options":7},
	// 			{"typeid":2,"value":null,"options":7},
	// 			{"typeid":3,"value":"100","options":0},
	// 			{"typeid":4,"value":null,"options":5},
	// 			{"typeid":5,"value":"","options":0},
	// 			{"typeid":6,"value":null,"options":1},
	// 			{"typeid":7,"value":null,"options":0},
	// 			{"typeid":8,"value":null,"options":5}
	// 		],
	// 		sync: [
	// 			{
	// 				from: 0, // 0 - PC/1 - APP
	// 				to: 1, // 0 - PC/ 1 - APP
	// 				value: 1 // 0 - 不同步/1-同步
	// 			}
	// 		]
	// 	},
	// 	"errorCode":null
	// };
	


	var rel = new Requester.debug.returnTpl();

	var typeids = [1,2,3,4,5,6,7,8], len = typeids.length; 
	var data = [], di, i = 0;

	var getValue = function() {
		return Math.ceil((Math.random()*100));
	}
	var getOptions = function() {
		// return Math.floor((Math.random()*100) % 8)
		return 11;
	}
	while(len--) {
		di = data[i++] = {};
		di.typeid= typeids[len];
		di.value = getValue();
		di.options = getOptions();
	}
	// console.log(data)
	rel.data = {
		options: data,
		sync: [
			{
				from: 0, // 0 - PC/1 - APP
				to: 1, // 0 - PC/ 1 - APP
				value: 1 // 0 - 不同步/1-同步
			}
		]
	};
	return rel;
};


Requester.debug.GET_msg_contactlist = function() {
	var rel = new Requester.debug.returnTpl();

	rel.data = [{
		alias: '王二小',
		mail: 'wangerxiao@baidu.com',
		phone: '12345678910',
		contactid: null
	}];

	return rel;
};

Requester.debug.GET_msg_msglist = function(param) {
	var rel = new Requester.debug.returnTpl();
	var pstatus = param.status, pcategory = param.categoryid;

	rel.data = {
		allUnreadMsgCnt: 120, //所有未读消息条数
		paysumUnreadMsgCnt: 20, 
		systemUnreadMsgCnt: 80,
	 	optimizeUnreadMsgCnt: 20
	};

	var msgdata = rel.data.msgdata = [];
	var nowDate = (new Date()).getDate();

	var getTime = function() {
		var now = new Date(), nowDate = now.getDate();
		var distance = Math.ceil(Math.random()*20);
		var date = new Date(now.setDate(nowDate - distance));
		return date.getFullYear() + '-' + parseInt(date.getMonth() + 1) + '-' +　date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
	};
	var getTypeid = function() {
		return Math.ceil(Math.random()* 1000 % 24);
	};
	var getStatus = function() {
		return 0;
	};
	var getCategory = function() {
		return Math.floor(Math.random()*10 % 3);
	}

	//console.log(param);
	if (param.status == 0) {
		for (var i = 0; i < 999; i++) {
			var mi = msgdata[i] = {};
			
			mi.eventTime = getTime();
			mi.msginfoid = +new Date();
			mi.linkText = '查看消息';
			mi.linkUrl = 'http://www.baidu.com',
			mi.typeid = getTypeid();

			if (mi.typeid == 5) {
				mi.linkUrl = ''
			}
			mi.categoryid = mi.getCategory;
			mi.status = 0;
			mi.msgText = '这是一条测试的消息内容，id是' + mi.msginfoid + 'typeid是' + mi.typeid + 
			'status是' + mi.status;
			
		}
	} else {
		for (var i = 0; i < 999; i++) {
			var mi = msgdata[i] = {};
			
			mi.eventTime = getTime();
			mi.msginfoid = +new Date();
			mi.linkText = '查看消息';
			mi.linkUrl = 'http://www.baidu.com',
			mi.typeid = getTypeid();
			mi.status = getStatus();
			mi.categoryid = getCategory();
			mi.msgText = '这是一条测试的消息内容，id是' + mi.msginfoid + 'typeid是' + mi.typeid + 
			'status是' + mi.status + (getStatus() || '唧唧复唧唧，哈哈哈哈哈哈哈哈哈哈哈哈发货发生的发生的发生的啊的说法sdf');
			
		}
	}

	

	return rel;

}

Requester.debug.MOD_msg_status = function(param) {
	var rel = new Requester.debug.returnTpl();

	rel.status = 200;
	rel.data = 8881;
	return rel;
}

Requester.debug.MOD_msg_msgcustom = function(param) {
	var rel = new Requester.debug.returnTpl();
	rel.status = 200;
	return rel;	
};

Requester.debug.ADD_msg_contact = function(param) {
	var rel = new Requester.debug.returnTpl();
	rel.status = 200;
	return rel;	
};
Requester.debug.DEL_msg_contact = function(param) {
	var rel = new Requester.debug.returnTpl();
	rel.status = 200;
	return rel;	
};