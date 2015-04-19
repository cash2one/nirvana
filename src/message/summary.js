/**
 * 概要中间层
 * @author zhouyu01
 */
msgcenter.summary = (function(){
	
	var isRender = false;	//是否第一次请求
	var shakeTask = null;	//模拟shake的任务
	var shakeline = 1;		//shake线路（向左（1）——>向右（2）——>向左回到原位（3））
	var shakewidth = 5;		//shake偏移大小
	var shakeInterval = 20;	//每次偏移1px，移动间隔时间（ms）
	
	var unreadcnt = 0;//记录未读消息条数，用于点击事件区分打开不同浮窗
	var summaryData = null;
	/**
	 * 获取概要中间层数据回调处理
	 * @param {Object} data
	 */
	function init(response){
		var data = response.data;
		//记录本次请求的系统时间
		msgcenter.lasttime.summary = data.lasttime;
		//记录返回的数据
		summaryData = data;
		if (!isRender) {
			baidu.g("NavSubMsg").innerHTML = er.template.get("msgSummary");
			renderNavMsg(data);
			//绑定各种事件
			bind();
			isRender = true;
		}
		else {
			renderNavMsg(data);
			//有最新消息,则提示用户
			if (data.btwnRequestUnreadMsgCnt > 0) {
				shakeTask = setInterval(newMsgHint, shakeInterval);
			}
		}
	}
	
	/**
	 * 填充子导航新消息模块
	 */
	function renderNavMsg(){
		var data = summaryData;
		//填充子导航新消息模块
		msgSummary.setMsgCnt(data.allUnreadMsgCnt);
		//填充中间层浮层内容
		renderSummaryLayer(data);
	}
	
	
	/**
	 * 渲染中间层浮层
	 * @param {Object} data	消息数据
	 */
	function renderSummaryLayer(data){
		var html = [];
		var msgItem = er.template.get("msgItem");
		var result = rebuildData(data);
		var total = 0;
		for (var j = 0, len = result.length; j < len; j++) {
			var item = result[j];
			var cnt = +item.cnt;
			if (cnt > 0) {
				total += cnt;
				var classname = (item.type == "1000") ? "hide" : "msg_check_all";
				var content = getItemList(item.content, item.itemize);
				html[html.length] = ui.format(msgItem, 
												item.title, 
												cnt, 
												content, 
												classname,
												item.type
											);
			}
		}
		if (total > 0) {
			baidu.g("MsgSummaryList").innerHTML = html.join("");
			baidu.removeClass("CheckAllMsg", "hide");
		}
		else {
			baidu.g("MsgSummaryList").innerHTML = er.template.get("noMsgHint");
			baidu.addClass("CheckAllMsg", "hide");
		}
	}
	
	/**
	 * 返回消息列表html
	 * @param {Object} content
	 * @param {Object} itemize
	 */
	function getItemList(content, itemize){
		var msgList = er.template.get("msgListForSummary");
		var html = [];
		for (var i = 0, len = content.length; i < len; i++) {
			var item = content[i];
			var time = msgcenter.util.timeFormat(item.eventTime);
			html[i] = ui.format(msgList, 
									time, 
									item.linkText || 'javascript:void(0)', 
									item.msgText, 
									item.msginfoid, 
									item.typeid,
									item.linkUrl,
									itemize
								);
		}
		
		return html.join("");
	}
	
	
	/**
	 * 重组数据结构,不用json结构，因为chrome下for in解析顺序会发生变化
	 * @param {Object} data	消息数据
	 */
	function rebuildData(data){
		return [{
				"type": 1000,
				"title": "最新消息",
				"cnt": data.loginUnreadMsgCnt,
				"content": data.loginmsg,
				"itemize":"login"
			},
			{
				"type": 2,
				"title": "消费消息",
				"cnt": data.paysumUnreadMsgCnt,
				"content": data.paysummsg,
				"itemize": "paysum"
			},
			{
				"type": 3,
				"title": "优化消息",
				"cnt": data.optimizeUnreadMsgCnt,
				"content": data.optimizemsg,
				"itemize": "optimize"
			},
			{
				"type": 1,
				"title": "系统消息",
				"cnt": data.systemUnreadMsgCnt,
				"content": data.systemmsg,
				"itemize":"system"
			}
		]
	}
	
	/**
	 * 获取DOM的left偏移值
	 */
	function getLeftValue(dom){
		var left = dom.style.left;
		var pattern = /^(-?\d+)px/g;
		if (pattern.test(left)) {
			return +RegExp.$1;
		}
		else {
			return 0;
		}
	}
	
	/**
	 * 新消息提示
	 */
	function newMsgHint(){
		var dom = baidu.g("NavMsgCnt");
		var left = getLeftValue(dom);
		switch (shakeline) {
			case 1:
				if (left > -1 * shakewidth) {
					dom.style.left = (left - 1) + "px";
				}
				else {
					shakeline = 2;
				}
				break;
			case 2:
				if (left < shakewidth) {
					dom.style.left = (left + 1) + "px";
				}
				else {
					shakeline = 3;
				}
				break;
			case 3:
				if (left > 0) {
					dom.style.left = (left - 1) + "px";
				}
				else {
					clearInterval(shakeTask);
					shakeline = 1;
				}
				break;
		}
	}
	
	/**
	 * 绑定各种事件
	 */
	function bind(){
		var navmsg = baidu.g("NavMsgUnread");
		var layer = baidu.g("NavMsgSummary");
		var eventUtil = msgcenter.eventUtil;
		//点击未读消息打开消息中心浮层
		navmsg.onclick = navmsgClickHandler;
		//鼠标移入则显示概要层
		navmsg.onmouseover = showLayer;
		//鼠标移出未读消息和概要层 则隐藏概要层
		baidu.g("NavSubMsg").onmouseout = hideLayer;
		//浮层点击事件
		layer.onclick = layerClickHandler;
		
	}
	
	/**
	 * 浮层点击事件
	 */
	function layerClickHandler(e){
		var event = e || window.event;
		var target = event.target || event.srcElement;
		if((target.tagName.toLowerCase() == 'a') 
				&& baidu.dom.hasClass(target, "nav_msg_text")
		){//查看具体消息
			var handler = msgcenter.util.messageClickHandler;
			handler.call(target, event, msgSummary.removeMsg, 2);
			return ;				
		}
		if (target.tagName.toLowerCase() == 'div' 
					&& baidu.dom.hasClass(target, "link")
		) {
			var params = {
				tab : "", 
				status : 0, 
				category : 0
			}
			//设置
			if (baidu.dom.hasClass(target, "msg_set")) {
				params.tab = "set";
			}
			//某类消息“查看全部”
			if (baidu.dom.hasClass(target, "msg_check_all")) {
				params.tab = "list";
				params.status = 0;
				params.category = +baidu.getAttr(target, "type");
			}
			//查看所有消息
			if (target.id == "CheckAllMsg") {
				params.tab = "list";
				params.status = 0;
				params.category = 0;
			}
			msgcenter.util.openMessageBox(params);
			
			//监控
			NIRVANA_LOG.send({
				target: "checkMessage",
				status: params.status,
				category: params.category
			});
		}
	}
	

	/**
	 * 点击打开消息中心浮层
	 */
	function navmsgClickHandler(){
		var unread = msgSummary.getUnRead();
		var status = unread > 0 ? 0 : 2;//0未读，2全部
		msgcenter.util.openMessageBox({
			tab: "list",
			status: status,
			category: 0
		});
		//监控
		NIRVANA_LOG.send({
			target: "newMessage"
		});
	}
	
	/**
	 * 显示概要层
	 */
	function showLayer(){
		baidu.removeClass("NavMsgSummary", "hide");
	}
	
	/**
	 * 隐藏概要层
	 */
	function hideLayer(e){
		var e = e || window.event;
		var relatedTarget = e.relatedTarget || e.toElement;
		var container = baidu.g("NavSubMsg");
		if (relatedTarget 
					&& !(baidu.dom.contains(container, relatedTarget) 
								|| relatedTarget.id == "NavSubMsg")) {
			baidu.addClass("NavMsgSummary", "hide");
		}
		baidu.event.preventDefault(e);	
	}
	
	
	return {
		init: init,
		
		/**
		 * 获取未读消息条数
		 */
		getUnRead: function(){
			return unreadcnt;
		},
		
		
		/**
		 * 设置未读消息条数
		 * @param {Object} msgcnt 未读消息条数
		 */
		setMsgCnt: function(msgcnt){
			var container = baidu.g("NavMsgCnt");
			if (+msgcnt > 0) {
				container.className = "hasmsg";
			}
			else {
				container.className = "nomsg";
			}
			container.innerHTML = msgcnt;
			
			unreadcnt = msgcnt;//记录全局变量
		},
		
		/**
		 * 删除一条消息
		 * @param {Object} msgid 消息id
		 */
		removeMsg: function(msgid){
			var type = baidu.g("NavMsg" + msgid).getAttribute("itemize");
			summaryData.allUnreadMsgCnt -= 1;
			summaryData[type + "UnreadMsgCnt"] -= 1;
			baidu.array.remove(summaryData[type + "msg"], function(item){
				return item.msginfoid == msgid;
			});
			renderNavMsg();
		}
	}
})();
var msgSummary = msgcenter.summary;