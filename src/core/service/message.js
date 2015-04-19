/**
 * 消息中心接口
 * @author zhouyu01
 */
fbs = fbs || {};
fbs.message = {};

/**
 * 获取重要消息概要中间层消息数据
 */
fbs.message.getSummary = fbs.interFace({
	path: "GET/msg/msgsummary",
	necessaryParam: {
		logintime:"2013-01-18 23:55:55",
		lasttime:"2013-01-18 23:55:55"
	}
});

/**
 * 获取最重要消息预览弹窗数据
 */
fbs.message.getMIptList = fbs.interFace({
	path: "GET/msg/miptlist",
	necessaryParam: {
		logintime:"2013-01-18 23:55:55",
		lasttime:"2013-01-18 23:55:55"
	}
});



// 获取消息列表
fbs.message.getMsgList = fbs.interFace({
	path: 'GET/msg/msglist',
	necessaryParam: {
		categoryid: 0,
		status: 0
	}
});


// 修改消息状态
fbs.message.modMsgStatus = fbs.interFace({
	path: 'MOD/msg/status',
	necessaryParam: {
		msginfoid: [],
		read: 1
	}
});


// 获取消息提醒设置信息
fbs.message.getReminderSets = fbs.interFace({
	path: 'GET/msg/msgcustom',
	necessaryParam: {

	}
});

// 修改消息提醒设置
fbs.message.modReminderSets = fbs.interFace({
	path: 'MOD/msg/msgcustom',
	necessaryParam: {
		data: []
	}

})

// 获取联系人信息列表
fbs.message.getContactList = fbs.interFace({
	path: 'GET/msg/contactlist',
	necessaryParam: {

	}
});

// 添加联系人
fbs.message.addContact = fbs.interFace({
	path: 'ADD/msg/contact',
	necessaryParam: {
		alias: '',
		mail: '',
		phone: ''
	}
});

// 删除联系人
fbs.message.delContact = fbs.interFace({
	path: 'DEL/msg/contact',
	necessaryParam: {
	}
});
